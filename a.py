import pandas as pd
import numpy as np
import os
import difflib
import warnings
import kagglehub
import json
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from joblib import dump, load
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings('ignore')

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to store model and data
global_model = None
global_vectorizer = None
global_all_symptoms = []

# Download dataset from Kaggle
def download_dataset():
    """
    Download dataset from Kaggle
    """
    try:
        path = kagglehub.dataset_download("itachi9604/disease-symptom-description-dataset")
        print(f"Data successfully downloaded to: {path}")
        return path
    except Exception as e:
        print(f"Error occurred while downloading data: {e}")
        return None

# Load appropriate data from the dataset
def load_kaggle_data(dataset_path):
    """
    Load and prepare data from Kaggle dataset
    """
    try:
        # Check for expected files
        dataset_files = os.listdir(dataset_path)
        print(f"Available files in the dataset: {dataset_files}")

        # Search for symptom and disease data file
        symptom_data_file = None
        for file in dataset_files:
            if "symptom" in file.lower() and "disease" in file.lower() and file.endswith('.csv'):
                symptom_data_file = os.path.join(dataset_path, file)
                break

        if not symptom_data_file:
            symptom_data_file = os.path.join(dataset_path, "dataset.csv")
            if not os.path.exists(symptom_data_file):
                symptom_data_file = os.path.join(dataset_path, "Symptom2Disease.csv")
                if not os.path.exists(symptom_data_file):
                    # Search for any CSV file
                    for file in dataset_files:
                        if file.endswith('.csv'):
                            symptom_data_file = os.path.join(dataset_path, file)
                            break

        if not symptom_data_file or not os.path.exists(symptom_data_file):
            print("No suitable data file found.")
            return None

        print(f"Loading data from: {symptom_data_file}")
        df = pd.read_csv(symptom_data_file)

        # Check data structure and adapt if necessary
        print(f"Data columns: {df.columns.tolist()}")

        # Check if data is in expected format
        if 'Disease' not in df.columns:
            # Search for disease column
            disease_cols = [col for col in df.columns if 'disease' in col.lower()]
            if disease_cols:
                df.rename(columns={disease_cols[0]: 'Disease'}, inplace=True)
            else:
                print("Warning: Disease column not found!")

        # Check for symptom columns in expected format (Symptom_1, Symptom_2, ...)
        symptom_cols = [col for col in df.columns if 'symptom' in col.lower()]

        # If data is in a different format, convert it
        if not any(col.startswith('Symptom_') for col in df.columns):
            print("Converting data format to required format...")

            # Depending on the actual data structure, we may need to convert it
            # This is an example of conversion, may require adjustment based on actual structure
            if len(symptom_cols) > 0:
                # If symptoms are in different columns but with different names
                new_df = pd.DataFrame()
                new_df['Disease'] = df['Disease'] if 'Disease' in df.columns else df[disease_cols[0]]

                for i, col in enumerate(symptom_cols):
                    new_df[f'Symptom_{i+1}'] = df[col]

                df = new_df
            else:
                # If data is in another format, such as symptoms in a single column
                print("Unknown data structure. You may need to adapt the code.")

        return df

    except Exception as e:
        print(f"Error loading data: {e}")
        traceback.print_exc()
        return None

# Load data
def load_data(file_path):
    """
    Load disease and symptom data from CSV file
    """
    try:
        df = pd.read_csv(file_path)
        print(f"Data loaded successfully: {df.shape[0]} records")
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

# Process data
def preprocess_data(df):
    """
    Clean and standardize symptom and disease names
    """
    # Convert column names to standardized format
    df.columns = [col.strip() for col in df.columns]

    # Handle missing values
    for i in range(1, 18):
        col = f'Symptom_{i}'
        if col in df.columns:
            df[col] = df[col].fillna('').apply(lambda x: str(x).strip() if pd.notna(x) else '')

    # Standardize disease names
    df['Disease'] = df['Disease'].apply(lambda x: str(x).strip().lower())

    # Standardize symptom names
    for i in range(1, 18):
        col = f'Symptom_{i}'
        if col in df.columns:
            df[col] = df[col].apply(lambda x: str(x).strip().lower() if pd.notna(x) and x != '' else '')

    return df

# Collect all unique symptoms from the data
def collect_all_symptoms(df):
    """
    Collect all unique symptoms from the dataset
    """
    all_symptoms = set()
    for i in range(1, 18):
        col = f'Symptom_{i}'
        if col in df.columns:
            symptoms = df[col].dropna().unique()
            all_symptoms.update([str(s).strip().lower() for s in symptoms if s and s != ''])

    return sorted(list(all_symptoms))

# Prepare data for training using TF-IDF
def prepare_data_tfidf(df):
    """
    Prepare data using TF-IDF for symptoms
    """
    texts = []
    y = []

    for _, row in df.iterrows():
        symptoms = []
        for i in range(1, 18):
            col = f'Symptom_{i}'
            if col in row and pd.notna(row[col]) and row[col] != '':
                symptoms.append(str(row[col]).strip().lower())

        if symptoms:
            texts.append(' '.join(symptoms))
            y.append(row['Disease'])

    # Use TF-IDF
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(texts)

    return X, y, vectorizer

# Find closest symptom
def find_closest_symptom(input_symptom, all_symptoms, threshold=0.6):
    """
    Find the closest symptom in the database
    """
    matches = difflib.get_close_matches(input_symptom.lower(), all_symptoms, n=1, cutoff=threshold)
    if matches:
        return matches[0]
    return None

# Process user symptoms
def process_user_symptoms(user_input, all_symptoms):
    """
    Process user symptoms and match them with known symptoms
    """
    user_symptoms = [s.strip().lower() for s in user_input.split(',')]
    processed_symptoms = []
    suggestions = {}

    for symptom in user_symptoms:
        if symptom in all_symptoms:
            processed_symptoms.append(symptom)
        else:
            closest = find_closest_symptom(symptom, all_symptoms)
            if closest:
                suggestions[symptom] = closest

    return processed_symptoms, suggestions

# Train Random Forest model with parameter tuning
def train_random_forest(X, y, param_grid=None, cv=5):
    """
    Train Random Forest model with optional parameter tuning
    """
    model = RandomForestClassifier(random_state=42)

    # If parameter grid is provided, perform tuning
    if param_grid:
        print("Starting Random Forest parameter tuning...")
        grid_search = GridSearchCV(model, param_grid, cv=cv, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X, y)
        model = grid_search.best_estimator_
        print(f"Best parameters for Random Forest: {grid_search.best_params_}")
        print(f"Best accuracy: {grid_search.best_score_:.4f}")
    else:
        print("Training Random Forest with default parameters...")
        model.fit(X, y)

    return model

# Evaluate model
def evaluate_model(model, X, y, cv=5):
    """
    Evaluate model performance using cross-validation
    """
    # Calculate cross-validation accuracy
    cv_scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
    print(f"Cross-validation results: {cv_scores}")
    print(f"Average model accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Split data for additional evaluation
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy on test data: {accuracy:.4f}")

    # Display classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    return accuracy

# Diagnosis with confidence levels
def diagnose_with_confidence(symptoms_list, model, vectorizer, confidence_threshold=0.1):
    """
    Diagnose symptoms with confidence levels
    """
    # Convert symptoms to text
    symptoms_text = ' '.join(symptoms_list)
    # Convert text to TF-IDF vector
    symptoms_vector = vectorizer.transform([symptoms_text])

    # Predict probabilities
    probabilities = model.predict_proba(symptoms_vector)[0]

    # Filter results by confidence level
    valid_predictions = []
    for i, prob in enumerate(probabilities):
        if prob >= confidence_threshold:
            valid_predictions.append((model.classes_[i], prob))

    # Sort results in descending order by probability
    valid_predictions.sort(key=lambda x: x[1], reverse=True)

    if not valid_predictions:
        return "Cannot diagnose with sufficient confidence", []

    return valid_predictions[0][0], valid_predictions

# Save model
def save_model(model, vectorizer, path="./model"):
    """
    Save model and processing components
    """
    if not os.path.exists(path):
        os.makedirs(path)

    dump(model, f"{path}/model.joblib")
    print(f"Model saved to {path}/model.joblib")

    if vectorizer:
        dump(vectorizer, f"{path}/vectorizer.joblib")
        print(f"TfidfVectorizer saved to {path}/vectorizer.joblib")

# Load model
def load_model(path="./model"):
    """
    Load model and processing components
    """
    model = load(f"{path}/model.joblib")
    print(f"Model loaded from {path}/model.joblib")

    vectorizer = None
    if os.path.exists(f"{path}/vectorizer.joblib"):
        vectorizer = load(f"{path}/vectorizer.joblib")
        print(f"TfidfVectorizer loaded from {path}/vectorizer.joblib")

    return model, vectorizer

# Enhanced interactive diagnosis system
def interactive_diagnosis_system(model, all_symptoms, vectorizer):
    """
    Enhanced interactive diagnosis system
    """
    print("\n===== Enhanced Disease Diagnosis System =====")
    print("Enter 'list' to view available symptoms")
    print("Enter 'search' + word to search for specific symptoms")
    print("Enter 'exit' to exit the system")

    while True:
        user_input = input("\nEnter symptoms (separated by commas): ")

        if user_input.lower() in ['exit']:
            print("Thank you for using the diagnosis system!")
            break

        elif user_input.lower() in ['list', 'show']:
            print("\nAvailable symptoms:")
            for i, symptom in enumerate(sorted(all_symptoms)):
                print(f"{i+1}. {symptom}")
            continue

        elif user_input.lower().startswith('search '):
            search_term = user_input.split(' ', 1)[1].lower()
            search_results = [s for s in all_symptoms if search_term in s]

            if search_results:
                print(f"\nSearch results for '{search_term}':")
                for i, symptom in enumerate(search_results):
                    print(f"{i+1}. {symptom}")
            else:
                print(f"No results found matching '{search_term}'")
            continue

        # Process entered symptoms and match them
        processed_symptoms, suggestions = process_user_symptoms(user_input, all_symptoms)

        # Display suggestions if found
        if suggestions:
            print("\nDid you mean:")
            for original, suggestion in suggestions.items():
                print(f"- '{original}' -> '{suggestion}'")

            use_suggestions = input("Do you want to use the suggested symptoms? (yes/no): ").lower()
            if use_suggestions in ['yes', 'y']:
                processed_symptoms.extend(suggestions.values())

        if not processed_symptoms:
            print("No valid symptoms found. Try again or type 'list' to see available symptoms.")
            continue

        # Display accepted symptoms
        print(f"\nDiagnosing symptoms: {', '.join(processed_symptoms)}")

        # Diagnosis with confidence levels
        disease, predictions = diagnose_with_confidence(
            processed_symptoms, model, vectorizer, confidence_threshold=0.05
        )

        if not predictions:
            print("\nCannot diagnose with sufficient confidence. Please provide more symptoms or consult a doctor.")
            continue

        print(f"\nMost likely diagnosis: {disease}")
        print("\nDiagnosis probabilities:")

        # Display diagnosis probabilities
        for d, prob in predictions[:5]:  # Show top 5 probabilities
            confidence_str = "high" if prob > 0.7 else "medium" if prob > 0.4 else "low"
            print(f" - {d}: {prob:.2%} ({confidence_str} confidence)")

        # Important notice
        print("\nImportant note: This system is for assistance only and not a substitute for professional medical consultation.")


# Initialize the model
def initialize_model():
    global global_model, global_vectorizer, global_all_symptoms
    
    # Try to load saved model
    if os.path.exists("./model/model.joblib"):
        try:
            print("Loading saved model...")
            global_model, global_vectorizer = load_model()
            
            # Get dataset for symptoms
            dataset_path = download_dataset()
            if dataset_path:
                df = load_kaggle_data(dataset_path)
                if df is not None:
                    global_all_symptoms = collect_all_symptoms(df)
                    print(f"Loaded {len(global_all_symptoms)} symptoms")
                    return True
            return False
        except Exception as e:
            print(f"Error loading model: {e}")
            traceback.print_exc()
            return False
    else:
        # Train new model
        try:
            print("Training new model...")
            # Download data
            dataset_path = download_dataset()
            if not dataset_path:
                print("Failed to download data.")
                return False
                
            # Load data from downloaded dataset
            df = load_kaggle_data(dataset_path)
            if df is None:
                print("Failed to load data.")
                return False
                
            # Process data
            df = preprocess_data(df)
            global_all_symptoms = collect_all_symptoms(df)
            print(f"Found {len(global_all_symptoms)} unique symptoms.")
            
            # Prepare data
            X, y, vectorizer = prepare_data_tfidf(df)
            global_vectorizer = vectorizer
            
            # Train model
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            global_model = train_random_forest(X, y, param_grid)
            
            # Save model
            save_model(global_model, global_vectorizer)
            
            return True
        except Exception as e:
            print(f"Error training model: {e}")
            traceback.print_exc()
            return False


# Flask routes
@app.route('/')
def home():
    return jsonify({
        "status": "success",
        "message": "Disease Diagnosis API is running",
        "model_loaded": global_model is not None,
        "symptoms_count": len(global_all_symptoms) if global_all_symptoms else 0
    })

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    if not global_all_symptoms:
        return jsonify({
            "status": "error",
            "message": "Symptoms not loaded"
        }), 500
        
    return jsonify({
        "status": "success",
        "symptoms": global_all_symptoms
    })

@app.route('/api/search_symptoms', methods=['GET'])
def search_symptoms():
    if not global_all_symptoms:
        return jsonify({
            "status": "error",
            "message": "Symptoms not loaded"
        }), 500
        
    search_term = request.args.get('term', '').lower()
    if not search_term:
        return jsonify({
            "status": "error",
            "message": "Search term is required"
        }), 400
        
    matching_symptoms = [s for s in global_all_symptoms if search_term in s]
    
    return jsonify({
        "status": "success",
        "results": matching_symptoms
    })

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    if not global_model or not global_vectorizer or not global_all_symptoms:
        return jsonify({
            "status": "error",
            "message": "Model or required components not loaded"
        }), 500
        
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({
            "status": "error",
            "message": "Symptoms are required"
        }), 400
        
    symptoms_input = data['symptoms']
    
    # If input is a string, process it
    if isinstance(symptoms_input, str):
        processed_symptoms, suggestions = process_user_symptoms(symptoms_input, global_all_symptoms)
    # If input is a list, validate each symptom
    elif isinstance(symptoms_input, list):
        processed_symptoms = []
        suggestions = {}
        for symptom in symptoms_input:
            symptom = symptom.strip().lower()
            if symptom in global_all_symptoms:
                processed_symptoms.append(symptom)
            else:
                closest = find_closest_symptom(symptom, global_all_symptoms)
                if closest:
                    suggestions[symptom] = closest
    else:
        return jsonify({
            "status": "error",
            "message": "Invalid symptoms format"
        }), 400
    
    # If suggestions should be automatically used
    auto_use_suggestions = data.get('auto_use_suggestions', False)
    if auto_use_suggestions and suggestions:
        processed_symptoms.extend(suggestions.values())
    
    if not processed_symptoms:
        return jsonify({
            "status": "error",
            "message": "No valid symptoms found",
            "suggestions": suggestions
        }), 400
        
    # Perform diagnosis
    disease, predictions = diagnose_with_confidence(
        processed_symptoms, global_model, global_vectorizer, confidence_threshold=0.05
    )
    
    if not predictions:
        return jsonify({
            "status": "error",
            "message": "Cannot diagnose with sufficient confidence",
            "processed_symptoms": processed_symptoms
        }), 400
    
    # Format results
    results = []
    for d, prob in predictions:
        confidence_level = "high" if prob > 0.7 else "medium" if prob > 0.4 else "low"
        results.append({
            "disease": d,
            "confidence": float(prob),
            "confidence_level": confidence_level
        })
    
    return jsonify({
        "status": "success",
        "processed_symptoms": processed_symptoms,
        "suggestions": suggestions,
        "results": results
    })

# Main program
def main():
    try:
        print("=== Medical Diagnosis System using Random Forest and TF-IDF ===")

        # Download data from Kaggle
        print("Downloading data from Kaggle...")
        dataset_path = download_dataset()

        if not dataset_path:
            print("Failed to download data from Kaggle.")
            file_path = input("Enter data file path manually: ")
            df = load_data(file_path)
        else:
            # Load data from downloaded dataset
            df = load_kaggle_data(dataset_path)

        if df is None:
            print("Failed to load data. Please check the path.")
            return

        # Check for saved model
        if os.path.exists("./model/model.joblib"):
            load_model_input = input("Found saved model. Do you want to load it? (yes/no): ").lower()
            if load_model_input in ['yes', 'y']:
                model, vectorizer = load_model()
                all_symptoms = collect_all_symptoms(df)

                # Run interactive system
                interactive_diagnosis_system(model, all_symptoms, vectorizer)
                return

        print("Processing data...")
        df = preprocess_data(df)
        all_symptoms = collect_all_symptoms(df)
        print(f"Found {len(all_symptoms)} unique symptoms.")

        # Prepare data using TF-IDF
        print("Preparing data using TF-IDF...")
        X, y, vectorizer = prepare_data_tfidf(df)

        # Model parameter tuning - default set to yes without asking
        use_grid_search = True
        print("Model parameter tuning enabled by default")

        if use_grid_search:
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20, 30],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            model = train_random_forest(X, y, param_grid)
        else:
            model = train_random_forest(X, y)

        print("\nEvaluating model...")
        evaluate_model(model, X, y)

        # Save model - default set to no without asking
        save_model_input = 'no'
        print("Model saving disabled by default")

        # Run interactive system
        interactive_diagnosis_system(model, all_symptoms, vectorizer)

    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    # Choose between running Flask or CLI
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "cli":
        # Run CLI version
        main()
    else:
        # Initialize model before starting Flask
        print("Initializing model for Flask API...")
        initialize_model()
        
        # Run Flask app
        print("Starting Flask API server...")
        app.run(host='0.0.0.0', port=5021, debug=False)
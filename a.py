import pandas as pd, numpy as np, os, difflib, warnings, kagglehub, json, traceback, sys
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, accuracy_score
from joblib import dump, load
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings('ignore')
app = Flask(__name__)
CORS(app)
global_model, global_vectorizer, global_all_symptoms = None, None, []

def get_data():
    try:
        path = kagglehub.dataset_download("itachi9604/disease-symptom-description-dataset")
        print(f"Data downloaded to: {path}")
        for file in os.listdir(path):
            if file.endswith('.csv'):
                df = pd.read_csv(os.path.join(path, file))
                if 'Disease' not in df.columns:
                    disease_cols = [col for col in df.columns if 'disease' in col.lower()]
                    if disease_cols: df.rename(columns={disease_cols[0]: 'Disease'}, inplace=True)
                df.columns = [col.strip() for col in df.columns]
                df['Disease'] = df['Disease'].apply(lambda x: str(x).strip().lower())
                for i in range(1, 18):
                    col = f'Symptom_{i}'
                    if col in df.columns:
                        df[col] = df[col].fillna('').apply(lambda x: str(x).strip().lower() if pd.notna(x) else '')
                return df
        print("No suitable CSV file found")
        return None
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def collect_symptoms(df):
    all_symptoms = set()
    for i in range(1, 18):
        col = f'Symptom_{i}'
        if col in df.columns:
            all_symptoms.update([s for s in df[col].dropna().unique() if s and s != ''])
    return sorted(list(all_symptoms))

def process_symptoms(user_input, all_symptoms, threshold=0.6):
    user_symptoms = [s.strip().lower() for s in user_input.split(',')] if isinstance(user_input, str) else [s.strip().lower() for s in user_input]
    processed, suggestions = [], {}
    for symptom in user_symptoms:
        if symptom in all_symptoms:
            processed.append(symptom)
        else:
            matches = difflib.get_close_matches(symptom.lower(), all_symptoms, n=1, cutoff=threshold)
            if matches: suggestions[symptom] = matches[0]
    return processed, suggestions

def prepare_data_tfidf(df):
    texts, y = [], []
    for _, row in df.iterrows():
        symptoms = [row[f'Symptom_{i}'] for i in range(1, 18) if f'Symptom_{i}' in row and row[f'Symptom_{i}']]
        if symptoms:
            texts.append(' '.join(symptoms))
            y.append(row['Disease'])
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(texts)
    return X, y, vectorizer

def train_model(X, y, tune_params=True):
    model = RandomForestClassifier(random_state=42)
    if tune_params:
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [None, 10, 20, 30],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        grid_search = GridSearchCV(model, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X, y)
        model = grid_search.best_estimator_
        print(f"Best parameters: {grid_search.best_params_}, Accuracy: {grid_search.best_score_:.4f}")
    else:
        model.fit(X, y)
    return model

def diagnose(symptoms_list, model, vectorizer, threshold=0.05):
    symptoms_vector = vectorizer.transform([' '.join(symptoms_list)])
    probabilities = model.predict_proba(symptoms_vector)[0]
    predictions = [(model.classes_[i], prob) for i, prob in enumerate(probabilities) if prob >= threshold]
    predictions.sort(key=lambda x: x[1], reverse=True)
    return (predictions[0][0], predictions) if predictions else ("Cannot diagnose with sufficient confidence", [])

def save_model(model, vectorizer, path="./model"):
    if not os.path.exists(path): os.makedirs(path)
    dump(model, f"{path}/model.joblib")
    dump(vectorizer, f"{path}/vectorizer.joblib")

def load_model(path="./model"):
    return load(f"{path}/model.joblib"), load(f"{path}/vectorizer.joblib")

def initialize_model():
    global global_model, global_vectorizer, global_all_symptoms
    try:
        if os.path.exists("./model/model.joblib"):
            global_model, global_vectorizer = load_model()
            df = get_data()
            if df is not None:
                global_all_symptoms = collect_symptoms(df)
                return True
        else:
            df = get_data()
            if df is None: return False
            global_all_symptoms = collect_symptoms(df)
            X, y, vectorizer = prepare_data_tfidf(df)
            global_model = train_model(X, y)
            global_vectorizer = vectorizer
            save_model(global_model, global_vectorizer)
            return True
    except Exception as e:
        print(f"Error initializing model: {e}")
        return False

@app.route('/')
def home():
    return jsonify({"status": "success", "message": "Disease Diagnosis API is running", 
                   "model_loaded": global_model is not None, 
                   "symptoms_count": len(global_all_symptoms) if global_all_symptoms else 0})

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms_api():
    if not global_all_symptoms:
        return jsonify({"status": "error", "message": "Symptoms not loaded"}), 500
    return jsonify({"status": "success", "symptoms": global_all_symptoms})

@app.route('/api/search_symptoms', methods=['GET'])
def search_symptoms_api():
    if not global_all_symptoms:
        return jsonify({"status": "error", "message": "Symptoms not loaded"}), 500
    search_term = request.args.get('term', '').lower()
    if not search_term:
        return jsonify({"status": "error", "message": "Search term required"}), 400
    matching_symptoms = [s for s in global_all_symptoms if search_term in s]
    return jsonify({"status": "success", "results": matching_symptoms})

@app.route('/api/diagnose', methods=['POST'])
def diagnose_api():
    if not global_model or not global_vectorizer or not global_all_symptoms:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({"status": "error", "message": "Symptoms required"}), 400
    processed, suggestions = process_symptoms(data['symptoms'], global_all_symptoms)
    if data.get('auto_use_suggestions', False) and suggestions:
        processed.extend(suggestions.values())
    if not processed:
        return jsonify({"status": "error", "message": "No valid symptoms found", 
                       "suggestions": suggestions}), 400
    disease, predictions = diagnose(processed, global_model, global_vectorizer)
    if not predictions:
        return jsonify({"status": "error", "message": "Cannot diagnose with confidence", 
                       "processed_symptoms": processed}), 400
    results = [{"disease": d, "confidence": float(prob), 
               "confidence_level": "high" if prob > 0.7 else "medium" if prob > 0.4 else "low"} 
              for d, prob in predictions]
    return jsonify({"status": "success", "processed_symptoms": processed, 
                   "suggestions": suggestions, "results": results})

def interactive_cli(model, all_symptoms, vectorizer):
    print("\n===== Disease Diagnosis System =====")
    while True:
        user_input = input("\nEnter symptoms (separated by commas), 'list', 'search [term]', or 'exit': ")
        if user_input.lower() == 'exit': break
        if user_input.lower() == 'list':
            for i, symptom in enumerate(sorted(all_symptoms)[:30]):
                print(f"{i+1}. {symptom}")
            print("... and more. Use 'search' to find specific symptoms.")
            continue
        if user_input.lower().startswith('search '):
            term = user_input.split(' ', 1)[1].lower()
            results = [s for s in all_symptoms if term in s]
            if results:
                for i, s in enumerate(results[:20]):
                    print(f"{i+1}. {s}")
            else: print(f"No results for '{term}'")
            continue
        processed, suggestions = process_symptoms(user_input, all_symptoms)
        if suggestions:
            print("\nDid you mean:")
            for orig, sugg in suggestions.items():
                print(f"- '{orig}' -> '{sugg}'")
            if input("Use suggestions? (y/n): ").lower() in ['y', 'yes']:
                processed.extend(suggestions.values())
        if not processed:
            print("No valid symptoms found. Try again or type 'list'.")
            continue
        print(f"\nDiagnosing: {', '.join(processed)}")
        disease, predictions = diagnose(processed, model, vectorizer)
        if not predictions:
            print("\nCannot diagnose with confidence. Please provide more symptoms.")
            continue
        print(f"\nMost likely diagnosis: {disease}")
        print("\nProbabilities:")
        for d, prob in predictions[:5]:
            conf = "high" if prob > 0.7 else "medium" if prob > 0.4 else "low"
            print(f" - {d}: {prob:.2%} ({conf} confidence)")
        print("\nNote: This is not a substitute for professional medical advice.")

def main():
    try:
        print("=== Medical Diagnosis System using Random Forest and TF-IDF ===")
        df = get_data()
        if df is None:
            print("Failed to load data.")
            return
        if os.path.exists("./model/model.joblib") and input("Load saved model? (y/n): ").lower() in ['y', 'yes']:
            model, vectorizer = load_model()
            all_symptoms = collect_symptoms(df)
            interactive_cli(model, all_symptoms, vectorizer)
            return
        df = get_data()
        all_symptoms = collect_symptoms(df)
        print(f"Found {len(all_symptoms)} unique symptoms.")
        X, y, vectorizer = prepare_data_tfidf(df)
        model = train_model(X, y)
        interactive_cli(model, all_symptoms, vectorizer)
    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "cli":
        main()
    else:
        initialize_model()
        app.run(host='0.0.0.0', port=5021, debug=False)
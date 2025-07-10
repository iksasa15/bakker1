// src/app/dashboard/ai-analysis/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase/config";

// قائمة شاملة بالأعراض المستخرجة من البيانات
const allSymptoms = [
  "itching", "skin_rash", "nodal_skin_eruptions", "dischromic _patches", 
  "continuous_sneezing", "shivering", "chills", "watering_from_eyes",
  "stomach_pain", "acidity", "ulcers_on_tongue", "vomiting", "cough", 
  "chest_pain", "yellowish_skin", "nausea", "loss_of_appetite", 
  "abdominal_pain", "yellowing_of_eyes", "burning_micturition", 
  "spotting_ urination", "fatigue", "weight_loss", "restlessness", 
  "lethargy", "irregular_sugar_level", "blurred_and_distorted_vision", 
  "obesity", "excessive_hunger", "increased_appetite", "polyuria",
  "muscle_wasting", "patches_in_throat", "high_fever", "extra_marital_contacts",
  "joint_pain", "back_pain", "constipation", "pain_during_bowel_movements", 
  "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", 
  "dizziness", "cramps", "bruising", "obesity", "swollen_legs", 
  "swollen_blood_vessels", "puffy_face_and_eyes", "enlarged_thyroid", 
  "brittle_nails", "swollen_extremeties", "excessive_hunger", 
  "drying_and_tingling_lips", "slurred_speech", "knee_pain", "hip_joint_pain", 
  "muscle_weakness", "stiff_neck", "swelling_joints", "movement_stiffness", 
  "spinning_movements", "loss_of_balance", "unsteadiness", "weakness_of_one_body_side", 
  "loss_of_smell", "bladder_discomfort", "foul_smell_of urine", 
  "continuous_feel_of_urine", "passage_of_gases", "internal_itching", 
  "toxic_look_(typhos)", "depression", "irritability", "muscle_pain", 
  "altered_sensorium", "red_spots_over_body", "belly_pain", "abnormal_menstruation", 
  "dischromic _patches", "watering_from_eyes", "increased_appetite", "polyuria", 
  "family_history", "mucoid_sputum", "rusty_sputum", "lack_of_concentration", 
  "visual_disturbances", "receiving_blood_transfusion", "receiving_unsterile_injections", 
  "coma", "stomach_bleeding", "distention_of_abdomen", "history_of_alcohol_consumption", 
  "fluid_overload", "blood_in_sputum", "prominent_veins_on_calf", "palpitations", 
  "painful_walking", "pus_filled_pimples", "blackheads", "scurring", "skin_peeling", 
  "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails", "blister", 
  "red_sore_around_nose", "yellow_crust_ooze", "breathlessness", "sweating",
  "dehydration", "mild_fever", "sunken_eyes", "headache", "dark_urine", 
  "yellow_urine", "cold_hands_and_feets", "mood_swings", "weight_gain", "anxiety", 
  "indigestion", "malaise", "phlegm", "throat_irritation", "redness_of_eyes", 
  "sinus_pressure", "runny_nose", "congestion", "stiff_neck", "fast_heart_rate", 
  "pain_behind_the_eyes", "diarrhoea", "acute_liver_failure", "swelling_of_stomach"
];

// ترتيب الأعراض أبجديًا لسهولة الاستخدام
const sortedSymptoms = [...new Set(allSymptoms)].sort();

interface DiagnosisResult {
  disease: string;
  confidence: number;
  confidenceLevel: string;
}

export default function AIAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // تعديل المنفذ الافتراضي ليطابق خادم Flask
  const [serverIP, setServerIP] = useState("192.168.1.39:5021"); // تحديث العنوان الافتراضي
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // المستخدم مسجل دخول
        setUserId(user.uid);
      } else if (!auth.currentUser && !authChecked) {
        // المستخدم غير مسجل دخول وهذه أول مرة نتحقق فيها
        router.push("/login");
      }
      
      // تم التحقق من حالة المستخدم
      setAuthChecked(true);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [router, authChecked]);
  
  // تبديل اختيار الأعراض
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };
  
  // إجراء التشخيص مع تحسين التعامل مع الأخطاء
  const performDiagnosis = async () => {
    if (selectedSymptoms.length === 0) {
      setErrorMessage("الرجاء اختيار الأعراض أولاً");
      return;
    }
    
    setDiagnosing(true);
    setErrorMessage(null);
    
    try {
      // بناء عنوان الـ API مع استخدام IP المدخل
      const apiUrl = `http://${serverIP}/api/diagnose`;
      console.log(`محاولة الاتصال بـ: ${apiUrl}`);
      
      // تحويل الأعراض المختارة إلى نص مفصول بفواصل
      const symptomsText = selectedSymptoms.join(", ");
      
      // طباعة البيانات المرسلة للتصحيح
      const requestData = { 
        symptoms: symptomsText,
        auto_use_suggestions: true 
      };
      console.log("البيانات المرسلة:", requestData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*', // إضافة هذا للمساعدة في حل مشاكل CORS
        },
        mode: 'cors', // تحديد وضع الطلب
        body: JSON.stringify(requestData),
      });
      
      // طباعة حالة الاستجابة للتصحيح
      console.log(`حالة الاستجابة: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // محاولة قراءة النص قبل محاولة تحليل JSON
        const textResponse = await response.text();
        console.log("استجابة النص:", textResponse);
        
        let errorData;
        try {
          errorData = JSON.parse(textResponse);
        } catch {
          // إذا فشل تحليل JSON، استخدم النص كما هو
          throw new Error(textResponse || `خطأ: ${response.status}`);
        }
        
        throw new Error(errorData.message || 'حدث خطأ في التشخيص');
      }
      
      const textResponse = await response.text();
      console.log("استجابة النص الخام:", textResponse);
      
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch {
        throw new Error("فشل في تحليل استجابة JSON");
      }
      
      console.log("البيانات المستلمة:", data);
      
      // تنسيق النتائج للعرض
      interface RawDiagnosisResult {
        disease: string;
        confidence: number;
        confidence_level: string;
      }
      const formattedResults = (data.results as RawDiagnosisResult[]).map((result) => ({
        disease: result.disease,
        confidence: result.confidence,
        confidenceLevel: result.confidence_level
      }));
      
      setDiagnosisResults(formattedResults);
      
      // حفظ نتائج التشخيص في Firestore
      if (userId && formattedResults.length > 0) {
        await addDoc(collection(db, "exams"), {
          userId,
          date: serverTimestamp(),
          symptoms: selectedSymptoms,
          results: formattedResults,
          // يمكن إضافة حقول أخرى هنا إذا لزم الأمر
        });
        console.log("تم حفظ نتائج التشخيص بنجاح");
      }
      
    } catch (error: unknown) {
      console.error("خطأ في التشخيص:", error);
      
      // تحسين التعامل مع أخطاء الاتصال
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrorMessage(`خطأ في الاتصال بالخادم. تأكد من أن الخادم يعمل على العنوان: ${serverIP}`);
      } else {
        let message = 'خطأ غير معروف';
        if (
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof (error as { message?: unknown }).message === 'string'
        ) {
          message = (error as { message: string }).message;
        }
        setErrorMessage(`حدث خطأ أثناء التشخيص: ${message}`);
      }
    } finally {
      setDiagnosing(false);
    }
  };
  
  // الرجوع للصفحة السابقة
  const goBack = () => {
    router.push("/dashboard");
  };
  
  // الانتقال لصفحة الفحوصات السابقة
  const goToPreviousExams = () => {
    router.push("/dashboard/previous-exams");
  };
  
  // اختبار الاتصال بالخادم
  const testConnection = async () => {
    try {
      const response = await fetch(`http://${serverIP}/`);
      if (response.ok) {
        setErrorMessage(`تم الاتصال بالخادم بنجاح! الاستجابة: ${response.status}`);
      } else {
        setErrorMessage(`فشل الاتصال بالخادم. الاستجابة: ${response.status}`);
      }
    } catch (error) {
      console.error("خطأ اختبار الاتصال:", error);
      setErrorMessage(`فشل في اختبار الاتصال: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };
  
  // تصفية الأعراض بناءً على مصطلح البحث
  const filteredSymptoms = sortedSymptoms.filter(symptom => 
    symptom.replace(/_/g, ' ').includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900 opacity-25"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-green-500 border-b-transparent border-l-transparent animate-spin animation-delay-2000"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* العناصر الزخرفية */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-200 dark:bg-green-900/30 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float animation-delay-2000"></div>
      
      <div className="relative z-1">
        <div className="flex items-center mb-8">
          <button 
            onClick={goBack} 
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ml-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
            التحليل بالذكاء الاصطناعي
          </h1>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            أدخل الأعراض التي تعاني منها للحصول على تحليل طبي مبدئي
          </p>
          <button
            onClick={goToPreviousExams}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          >
            عرض الفحوصات السابقة
          </button>
        </div>
        
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-8 border border-blue-50 dark:border-blue-900">
          <div className="max-w-4xl mx-auto">
            {/* حقل إدخال عنوان IP للخادم */}
            <div className="mb-6">
              <label htmlFor="server-ip" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان خادم التحليل
              </label>
              <input
                id="server-ip"
                type="text"
                placeholder="مثال: localhost:5021 أو 192.168.1.5:5021"
                value={serverIP}
                onChange={(e) => setServerIP(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="mt-2 flex space-x-2 space-x-reverse">
                <button 
                  onClick={testConnection}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                >
                  اختبار الاتصال
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  أدخل عنوان IP أو اسم المضيف مع المنفذ لخادم Flask
                </p>
              </div>
            </div>
            
            {/* قسم اختيار الأعراض */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                اختر الأعراض التي تعاني منها
              </label>
              
              {/* حقل البحث عن الأعراض */}
              <input
                type="text"
                placeholder="ابحث عن أعراض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-4"
              />
              
              {/* عرض الأعراض المختارة */}
              {selectedSymptoms.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الأعراض المختارة ({selectedSymptoms.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map(symptom => (
                      <span 
                        key={symptom} 
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {symptom.replace(/_/g, ' ')}
                        <button 
                          onClick={() => toggleSymptom(symptom)}
                          className="mr-1 ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* قائمة مربعات الاختيار للأعراض */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                {filteredSymptoms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredSymptoms.map(symptom => (
                      <div key={symptom} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`symptom-${symptom}`}
                          checked={selectedSymptoms.includes(symptom)}
                          onChange={() => toggleSymptom(symptom)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <label 
                          htmlFor={`symptom-${symptom}`}
                          className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          {symptom.replace(/_/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    لا توجد نتائج للبحث
                  </p>
                )}
              </div>
              
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                اختر الأعراض التي تعاني منها. يمكنك البحث واختيار أكثر من عرض.
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={performDiagnosis}
                disabled={diagnosing || selectedSymptoms.length === 0 || !serverIP.trim()}
                className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg 
                  hover:from-blue-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center`}
              >
                {diagnosing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التحليل...
                  </>
                ) : (
                  'تحليل الأعراض'
                )}
              </button>
            </div>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                {errorMessage}
              </div>
            )}
            
            {diagnosisResults.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg">
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2">
                  نتيجة التحليل
                </h3>
                
                {/* عرض النتيجة الأكثر احتمالا */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {diagnosisResults[0].disease}
                  </p>
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 ${
                        diagnosisResults[0].confidenceLevel === 'high' ? 'bg-green-500' : 
                        diagnosisResults[0].confidenceLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {(diagnosisResults[0].confidence * 100).toFixed(1)}% احتمالية
                    </span>
                  </div>
                </div>
                
                {/* عرض نتائج أخرى محتملة */}
                {diagnosisResults.length > 1 && (
                  <div className="border-t border-blue-100 dark:border-blue-800 pt-3 mt-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نتائج أخرى محتملة:
                    </h4>
                    <ul className="space-y-1">
                      {diagnosisResults.slice(1, 4).map((result, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">{result.disease}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                  هذا التحليل هو مجرد تقدير أولي ولا يعتبر تشخيصًا طبيًا.
                  يرجى استشارة الطبيب المختص للحصول على تقييم دقيق.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
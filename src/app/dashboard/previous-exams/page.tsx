// src/app/dashboard/previous-exams/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase/config";

interface DiagnosisResult {
  disease: string;
  confidence: number;
  confidenceLevel: string;
}

interface ExamRecord {
  id: string;
  userId: string;
  date: Date;
  symptoms: string[];
  results: DiagnosisResult[];
  notes?: string;
}

export default function PreviousExamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
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
  
  // جلب سجلات الفحوصات السابقة
  useEffect(() => {
    if (!userId) return;
    
    const fetchExams = async () => {
      setLoadingExams(true);
      setErrorMessage(null);
      
      try {
        // إنشاء استعلام للحصول على الفحوصات الخاصة بالمستخدم الحالي
        // بدون orderBy لتجنب الأخطاء المحتملة
        const examsQuery = query(
          collection(db, "exams"),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(examsQuery);
        const fetchedExams: ExamRecord[] = [];
        
        querySnapshot.forEach((docSnapshot) => {
          try {
            const data = docSnapshot.data();
            
            // تحقق من وجود حقل التاريخ وصحة تنسيقه
            let examDate: Date;
            if (data.date) {
              if (data.date instanceof Timestamp) {
                examDate = data.date.toDate();
              } else if (data.date.seconds && data.date.nanoseconds) {
                // إذا كان التاريخ تم تخزينه كمستند فيه حقول seconds و nanoseconds
                examDate = new Timestamp(data.date.seconds, data.date.nanoseconds).toDate();
              } else {
                // استخدام التاريخ الحالي كحل بديل إذا كان التنسيق غير معروف
                console.warn("تنسيق تاريخ غير معروف لـ ID:", docSnapshot.id);
                examDate = new Date();
              }
            } else {
              // استخدام التاريخ الحالي إذا لم يتم تخزين تاريخ
              console.warn("لا يوجد تاريخ للفحص ID:", docSnapshot.id);
              examDate = new Date();
            }
            
            // تحقق من وجود الأعراض
            const symptoms = Array.isArray(data.symptoms) ? data.symptoms : [];
            
            // تحقق من وجود النتائج وصحة تنسيقها
            const results = Array.isArray(data.results) ? data.results.map(result => ({
              disease: result.disease || "غير معروف",
              confidence: typeof result.confidence === 'number' ? result.confidence : 0,
              confidenceLevel: result.confidenceLevel || "low"
            })) : [];
            
            fetchedExams.push({
              id: docSnapshot.id,
              userId: data.userId,
              date: examDate,
              symptoms: symptoms,
              results: results,
              notes: data.notes
            });
          } catch (docError) {
            console.error("خطأ في معالجة وثيقة:", docError, "ID:", docSnapshot.id);
          }
        });
        
        // ترتيب الفحوصات يدويًا حسب التاريخ تنازليًا
        fetchedExams.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setExams(fetchedExams);
      } catch (error) {
        console.error("خطأ في جلب الفحوصات:", error);
        // عرض رسالة خطأ أكثر تفصيلاً
        let errorMsg = "حدث خطأ أثناء جلب سجلات الفحوصات";
        if (error instanceof Error) {
          errorMsg += `: ${error.message}`;
        }
        setErrorMessage(errorMsg);
      } finally {
        setLoadingExams(false);
      }
    };
    
    fetchExams();
  }, [userId]);
  
  // حذف سجل فحص
  const deleteExam = async (examId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا السجل؟")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "exams", examId));
      setExams(exams.filter(exam => exam.id !== examId));
    } catch (error) {
      console.error("خطأ في حذف الفحص:", error);
      let errorMsg = "حدث خطأ أثناء حذف السجل";
      if (error instanceof Error) {
        errorMsg += `: ${error.message}`;
      }
      setErrorMessage(errorMsg);
    }
  };
  
  // توسيع/طي تفاصيل سجل الفحص
  const toggleExamDetails = (examId: string) => {
    if (expandedExam === examId) {
      setExpandedExam(null);
    } else {
      setExpandedExam(examId);
    }
  };
  
  // الرجوع للصفحة السابقة
  const goBack = () => {
    router.push("/dashboard");
  };
  
  // الانتقال لصفحة التحليل الجديد
  const goToNewAnalysis = () => {
    router.push("/dashboard/ai-analysis");
  };
  
  // تنسيق التاريخ للعرض
  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("خطأ في تنسيق التاريخ:", error, date);
      return "تاريخ غير صالح";
    }
  };
  
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
            سجلات الفحوصات السابقة
          </h1>
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-300">
            عرض جميع الفحوصات السابقة ونتائجها
          </p>
          <button
            onClick={goToNewAnalysis}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg hover:from-blue-700 hover:to-green-600"
          >
            فحص جديد
          </button>
        </div>
        
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <div className="mt-2 text-sm">
              <p>تعليمات للمساعدة:</p>
              <ul className="list-disc list-inside mt-1">
                <li>تأكد من اتصالك بالإنترنت</li>
                <li>تحقق من أنك سجلت دخولك بشكل صحيح</li>
                <li>حاول تحديث الصفحة</li>
                <li>إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني</li>
              </ul>
            </div>
          </div>
        )}
        
        {loadingExams ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-blue-50 dark:border-blue-900 flex justify-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-blue-400 animate-pulse animation-delay-150"></div>
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse animation-delay-300"></div>
              <span className="text-gray-700 dark:text-gray-300">جاري تحميل السجلات...</span>
            </div>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-blue-50 dark:border-blue-900 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">لا توجد فحوصات سابقة</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              لم تقم بإجراء أي فحوصات باستخدام التحليل الذكي بعد.
            </p>
            <button
              onClick={goToNewAnalysis}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg hover:from-blue-700 hover:to-green-600"
            >
              إجراء فحص جديد
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div 
                key={exam.id} 
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-blue-50 dark:border-blue-900 overflow-hidden"
              >
                {/* رأس البطاقة مع معلومات أساسية */}
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExamDetails(exam.id)}
                >
                  <div>
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {exam.results && exam.results.length > 0 ? exam.results[0].disease : "نتيجة غير معروفة"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(exam.date)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {exam.results && exam.results.length > 0 && (
                      <div className="flex items-center ml-4">
                        <div 
                          className={`w-3 h-3 rounded-full mr-2 ${
                            exam.results[0].confidenceLevel === 'high' ? 'bg-green-500' : 
                            exam.results[0].confidenceLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(exam.results[0].confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-gray-500 transition-transform ${expandedExam === exam.id ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* تفاصيل إضافية تظهر عند النقر */}
                {expandedExam === exam.id && (
                  <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                    {/* قسم الأعراض */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        الأعراض:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exam.symptoms.length > 0 ? (
                          exam.symptoms.map((symptom, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full px-3 py-1 text-xs"
                            >
                              {symptom.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">لا توجد أعراض مسجلة</span>
                        )}
                      </div>
                    </div>
                    
                    {/* قسم النتائج */}
                    {exam.results && exam.results.length > 0 ? (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          نتائج التشخيص:
                        </h4>
                        <ul className="space-y-1">
                          {exam.results.map((result, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">{result.disease}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-500">
                                {(result.confidence * 100).toFixed(1)}%
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          نتائج التشخيص:
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد نتائج مسجلة</p>
                      </div>
                    )}
                    
                    {/* ملاحظات إضافية إذا وجدت */}
                    {exam.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ملاحظات:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {exam.notes}
                        </p>
                      </div>
                    )}
                    
                    {/* زر حذف السجل */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExam(exam.id);
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف السجل
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
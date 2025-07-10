// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import Patient from "../../models/Patient";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");
  const router = useRouter();

  // التحقق من حالة تسجيل الدخول والحصول على بيانات المريض
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // استرجاع بيانات المريض من Firestore
          const patientDoc = await getDoc(doc(db, "patients", user.uid));
          
          if (patientDoc.exists()) {
            // استخراج اسم المريض من البيانات
            setPatientName(patientDoc.data().patientName || "");
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // المستخدم غير مسجل دخوله، توجيهه لصفحة تسجيل الدخول
        router.push("/login");
      }
    });

    // إلغاء الاشتراك عند تفكيك المكون
    return () => unsubscribe();
  }, [router]);

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      await Patient.logout();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // الانتقال إلى صفحة التاريخ المرضي
  const handleMedicalHistoryClick = () => {
    router.push("/dashboard/medical-history");
  };

  // الانتقال إلى صفحة تحليل الأعراض
  const handleAIAnalysisClick = () => {
    router.push("/dashboard/ai-analysis");
  };

  // الانتقال إلى صفحة الكشوف السابقة
  const handlePreviousExamsClick = () => {
    router.push("/dashboard/previous-exams");
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900 opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-green-500 border-b-transparent border-l-transparent animate-spin animation-delay-2000"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* العناصر الزخرفية */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-200 dark:bg-green-900/30 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float animation-delay-2000"></div>
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-blue-300 dark:bg-blue-800/30 rounded-full mix-blend-multiply opacity-40 dark:opacity-20 animate-float animation-delay-4000"></div>

      <div className="flex flex-col items-center justify-center relative z-1">
        {/* Card الرئيسية */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 w-full max-w-3xl text-center transition-all duration-500 border border-blue-50 dark:border-blue-900">
          {/* الشعار المصغر */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto mb-6 shadow-lg animate-pulse-slow">
            <span className="text-2xl font-bold">بكّر</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
            مرحباً، {patientName}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            أهلاً بك في لوحة تحكم المريض. ماذا تريد أن تفعل اليوم؟
          </p>
          
          {/* الأزرار الثلاثة بتصميم محسن */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <button
              onClick={handleMedicalHistoryClick}
              className="group p-6 bg-white/80 dark:bg-gray-700/80 rounded-xl shadow-lg hover:shadow-xl border-t-4 border-blue-600 transition-all duration-300 transform hover:-translate-y-1 text-right"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">التاريخ المرضي</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">عرض وتحديث سجلك الطبي</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleAIAnalysisClick}
              className="group p-6 bg-white/80 dark:bg-gray-700/80 rounded-xl shadow-lg hover:shadow-xl border-t-4 border-green-500 transition-all duration-300 transform hover:-translate-y-1 text-right"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">تحليل الأعراض</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">تحليل ذكي للأعراض التي تعاني منها</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={handlePreviousExamsClick}
              className="group p-6 bg-white/80 dark:bg-gray-700/80 rounded-xl shadow-lg hover:shadow-xl border-t-4 border-yellow-600 transition-all duration-300 transform hover:-translate-y-1 text-right"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 flex items-center justify-center text-yellow-600 dark:text-yellow-300 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">الكشوف السابقة</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">مراجعة الفحوصات والنتائج السابقة</p>
                </div>
              </div>
            </button>
          </div>
          
          {/* زر تسجيل الخروج */}
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-lg text-lg font-medium hover:bg-red-50 transition-all duration-300 dark:bg-gray-800 dark:text-red-400 dark:border-red-500 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
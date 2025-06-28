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

  // الانتقال إلى صفحة الكشف المبكر
  const handleEarlyDetectionClick = () => {
    router.push("/dashboard/early-detection");
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6">مرحباً، {patientName}</h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            أهلاً بك في لوحة تحكم المريض
          </p>
          
          {/* الأزرار الأربعة الجديدة */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleMedicalHistoryClick}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              التاريخ المرضي
            </button>
            <button
              onClick={handleAIAnalysisClick}
              className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              تحليل الأعراض بالذكاء الاصطناعي
            </button>
            <button
              onClick={handleEarlyDetectionClick}
              className="px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              اكشف مبكر
            </button>
            <button
              onClick={handlePreviousExamsClick}
              className="px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              الكشوف السابقة
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
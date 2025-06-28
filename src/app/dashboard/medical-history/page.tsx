// src/app/dashboard/medical-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase/config";

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  
  // بيانات النماذج
  const [disease, setDisease] = useState({ name: "", diagnosisDate: "", notes: "" });
  const [allergy, setAllergy] = useState({ allergen: "", severity: "متوسطة", reactions: "" });
  const [travel, setTravel] = useState({ destination: "", startDate: "", endDate: "", notes: "" });
  const [surgery, setSurgery] = useState({ name: "", date: "", hospital: "", notes: "" });
  
  // رسائل التأكيد والأخطاء
  const [message, setMessage] = useState({ type: "", text: "" });

  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // إضافة مرض جديد
  const handleAddDisease = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setMessage({ type: "", text: "" });
      if (!disease.name || !disease.diagnosisDate) {
        setMessage({ type: "error", text: "يرجى إدخال اسم المرض وتاريخ التشخيص" });
        return;
      }
      
      // إنشاء وثيقة جديدة في مجموعة diseases الفرعية
      const patientRef = doc(db, "patients", userId);
      const diseasesCollectionRef = collection(patientRef, "diseases");
      
      await addDoc(diseasesCollectionRef, {
        ...disease,
        createdAt: serverTimestamp()
      });
      
      setDisease({ name: "", diagnosisDate: "", notes: "" });
      setMessage({ type: "success", text: "تمت إضافة المرض بنجاح" });
    } catch (error) {
      console.error("Error adding disease:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء إضافة المرض" });
    }
  };

  // إضافة حساسية جديدة
  const handleAddAllergy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setMessage({ type: "", text: "" });
      if (!allergy.allergen) {
        setMessage({ type: "error", text: "يرجى إدخال مسبب الحساسية" });
        return;
      }
      
      // إنشاء وثيقة جديدة في مجموعة allergies الفرعية
      const patientRef = doc(db, "patients", userId);
      const allergiesCollectionRef = collection(patientRef, "allergies");
      
      await addDoc(allergiesCollectionRef, {
        ...allergy,
        createdAt: serverTimestamp()
      });
      
      setAllergy({ allergen: "", severity: "متوسطة", reactions: "" });
      setMessage({ type: "success", text: "تمت إضافة الحساسية بنجاح" });
    } catch (error) {
      console.error("Error adding allergy:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء إضافة الحساسية" });
    }
  };

  // إضافة سفر جديد
  const handleAddTravel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setMessage({ type: "", text: "" });
      if (!travel.destination || !travel.startDate) {
        setMessage({ type: "error", text: "يرجى إدخال وجهة السفر وتاريخ البداية" });
        return;
      }
      
      // إنشاء وثيقة جديدة في مجموعة travelHistory الفرعية
      const patientRef = doc(db, "patients", userId);
      const travelCollectionRef = collection(patientRef, "travelHistory");
      
      await addDoc(travelCollectionRef, {
        ...travel,
        createdAt: serverTimestamp()
      });
      
      setTravel({ destination: "", startDate: "", endDate: "", notes: "" });
      setMessage({ type: "success", text: "تمت إضافة تاريخ السفر بنجاح" });
    } catch (error) {
      console.error("Error adding travel history:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء إضافة تاريخ السفر" });
    }
  };

  // إضافة عملية جديدة
  const handleAddSurgery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setMessage({ type: "", text: "" });
      if (!surgery.name || !surgery.date) {
        setMessage({ type: "error", text: "يرجى إدخال اسم العملية والتاريخ" });
        return;
      }
      
      // إنشاء وثيقة جديدة في مجموعة surgeries الفرعية
      const patientRef = doc(db, "patients", userId);
      const surgeriesCollectionRef = collection(patientRef, "surgeries");
      
      await addDoc(surgeriesCollectionRef, {
        ...surgery,
        createdAt: serverTimestamp()
      });
      
      setSurgery({ name: "", date: "", hospital: "", notes: "" });
      setMessage({ type: "success", text: "تمت إضافة العملية بنجاح" });
    } catch (error) {
      console.error("Error adding surgery:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء إضافة العملية" });
    }
  };

  // العودة إلى لوحة التحكم
  const handleBack = () => {
    router.push("/dashboard");
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">التاريخ المرضي</h1>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              العودة للوحة التحكم
            </button>
          </div>

          {message.text && (
            <div 
              className={`p-4 mb-6 rounded-md ${
                message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* نموذج إضافة مرض */}
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">إضافة أمراض</h2>
            <form onSubmit={handleAddDisease}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم المرض</label>
                  <input
                    type="text"
                    value={disease.name}
                    onChange={(e) => setDisease({ ...disease, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أدخل اسم المرض"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ التشخيص</label>
                  <input
                    type="date"
                    value={disease.diagnosisDate}
                    onChange={(e) => setDisease({ ...disease, diagnosisDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">ملاحظات</label>
                <textarea
                  value={disease.notes}
                  onChange={(e) => setDisease({ ...disease, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="أدخل أي ملاحظات إضافية"
                  rows={3}
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                إضافة مرض
              </button>
            </form>
          </div>

          {/* نموذج إضافة حساسية */}
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">إضافة مسببات حساسية</h2>
            <form onSubmit={handleAddAllergy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">مسبب الحساسية</label>
                  <input
                    type="text"
                    value={allergy.allergen}
                    onChange={(e) => setAllergy({ ...allergy, allergen: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أدخل مسبب الحساسية"
                  />
                </div>
                <div>
                  <label htmlFor="allergy-severity" className="block text-sm font-medium mb-1">شدة الحساسية</label>
                  <select
                    id="allergy-severity"
                    value={allergy.severity}
                    onChange={(e) => setAllergy({ ...allergy, severity: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="خفيفة">خفيفة</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="شديدة">شديدة</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">أعراض وردود الفعل</label>
                <textarea
                  value={allergy.reactions}
                  onChange={(e) => setAllergy({ ...allergy, reactions: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="صف أعراض الحساسية وردود الفعل"
                  rows={3}
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                إضافة حساسية
              </button>
            </form>
          </div>

          {/* نموذج إضافة سفر */}
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">إضافة تاريخ السفر</h2>
            <form onSubmit={handleAddTravel}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">الوجهة</label>
                  <input
                    type="text"
                    value={travel.destination}
                    onChange={(e) => setTravel({ ...travel, destination: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أدخل وجهة السفر"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={travel.startDate}
                    onChange={(e) => setTravel({ ...travel, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={travel.endDate}
                    onChange={(e) => setTravel({ ...travel, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أدخل تاريخ النهاية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ملاحظات</label>
                  <input
                    type="text"
                    value={travel.notes}
                    onChange={(e) => setTravel({ ...travel, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أي ملاحظات إضافية عن السفر"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                إضافة سفر
              </button>
            </form>
          </div>

          {/* نموذج إضافة عملية */}
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">إضافة عمليات سابقة</h2>
            <form onSubmit={handleAddSurgery}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم العملية</label>
                  <input
                    type="text"
                    value={surgery.name}
                    onChange={(e) => setSurgery({ ...surgery, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أدخل اسم العملية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ العملية</label>
                  <input
                    type="date"
                    value={surgery.date}
                    onChange={(e) => setSurgery({ ...surgery, date: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أدخل تاريخ العملية"
                    title="أدخل تاريخ العملية"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">المستشفى</label>
                  <input
                    type="text"
                    value={surgery.hospital}
                    onChange={(e) => setSurgery({ ...surgery, hospital: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أدخل اسم المستشفى"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ملاحظات</label>
                  <input
                    type="text"
                    value={surgery.notes}
                    onChange={(e) => setSurgery({ ...surgery, notes: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="أي ملاحظات إضافية عن العملية"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                إضافة عملية
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
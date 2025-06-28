"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Patient from "../../models/Patient";

export default function RegisterPage() {
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setLoading(false);
      return;
    }

    try {
      await Patient.register(
        patientName,
        email,
        password,
        phoneNumber,
        dateOfBirth,
        gender
      );
      router.push("/dashboard"); // توجيه المستخدم للوحة التحكم بعد التسجيل
    } catch (err: unknown) {
      // معالجة الأخطاء المختلفة
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code?: string }).code === "string"
      ) {
        const code = (err as { code: string }).code;
        if (code === "auth/email-already-in-use") {
          setError("البريد الإلكتروني مستخدم بالفعل");
        } else if (code === "auth/weak-password") {
          setError("كلمة المرور ضعيفة جداً");
        } else if (code === "auth/invalid-email") {
          setError("البريد الإلكتروني غير صالح");
        } else {
          setError((err as { message?: string }).message || "حدث خطأ أثناء إنشاء الحساب");
        }
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">إنشاء حساب جديد</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="patientName" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              الاسم الكامل
            </label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="example@example.com"
              required
              dir="ltr"
            />
          </div>
          
          <div>
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              رقم الهاتف
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              dir="ltr"
              required
            />
          </div>
          
          <div>
            <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              تاريخ الميلاد
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              required
              dir="ltr"
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              الجنس
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              required
            >
              <option value="" disabled>اختر الجنس</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              required
              dir="ltr"
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              required
              dir="ltr"
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Patient from "../../models/Patient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await Patient.login(email, password);
      router.push("/dashboard"); // توجيه المستخدم للوحة التحكم بعد تسجيل الدخول
    } catch (err: unknown) {
      // معالجة الأخطاء المختلفة
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code?: string }).code === "string"
      ) {
        const code = (err as { code: string }).code;
        if (code === "auth/user-not-found" || code === "auth/wrong-password") {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else if (code === "auth/too-many-requests") {
          setError("تم تقييد الحساب مؤقتاً بسبب محاولات تسجيل دخول متكررة");
        } else {
          setError(
            (err as { message?: string }).message || "حدث خطأ أثناء تسجيل الدخول"
          );
        }
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">تسجيل الدخول</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}
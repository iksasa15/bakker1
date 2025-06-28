// src/app/layout.tsx
import Link from 'next/link'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen flex-col">
        <header className="bg-white shadow-md dark:bg-gray-800">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xl text-blue-600 dark:text-blue-400">
                <Link href="/">نظام إدارة المرضى</Link>
              </div>
              <div className="flex space-x-4 space-x-reverse">
                <Link href="/" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  الرئيسية
                </Link>
                <Link href="/login" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  إنشاء حساب
                </Link>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-gray-100 dark:bg-gray-800 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} نظام إدارة المرضى - جميع الحقوق محفوظة
              </p>
              <div className="mt-4 flex justify-center space-x-4 space-x-reverse">
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  سياسة الخصوصية
                </Link>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  شروط الاستخدام
                </Link>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  اتصل بنا
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
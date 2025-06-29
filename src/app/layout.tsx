// src/app/layout.tsx
import Link from 'next/link'
import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'منصة بكّر - التشخيص المبكر بالذكاء الاصطناعي',
  description: 'منصة ذكية للتشخيص المبكر للحالات المرضية باستخدام تقنيات الذكاء الاصطناعي',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen flex-col bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Abstract medical background pattern */}
        <div className="fixed inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30,10 L70,10 L70,50 L30,50 Z' fill='none' stroke='%23BFDBFE' stroke-width='2' /%3E%3Ccircle cx='50' cy='30' r='10' fill='none' stroke='%23BBF7D0' stroke-width='2' /%3E%3Cpath d='M10,30 L20,30 M15,25 L15,35' stroke='%23BFDBFE' stroke-width='2' /%3E%3Cpath d='M80,30 L90,30 M85,25 L85,35' stroke='%23BBF7D0' stroke-width='2' /%3E%3Cpath d='M50,70 L50,90' stroke='%23BFDBFE' stroke-width='2' /%3E%3Ccircle cx='50' cy='80' r='5' fill='none' stroke='%23BBF7D0' stroke-width='1' /%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }}></div>
        </div>

        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-md dark:bg-gray-800/90 transition-all duration-300">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xl">
                <Link href="/" className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-400 flex items-center justify-center text-white">
                    <span className="text-sm font-bold">بكّر</span>
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">منصة بكّر</span>
                </Link>
              </div>
              <div className="flex space-x-4 space-x-reverse">
                <Link href="/" className="px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  الرئيسية
                </Link>
                <Link href="/about" className="px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  عن المنصة
                </Link>
                <Link href="/symptom-checker" className="px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  فحص الأعراض
                </Link>
                <Link href="/login" className="px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/register" 
                  className="px-3 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  إنشاء حساب
                </Link>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8 relative z-1">
          {children}
        </main>
        
        <footer className="bg-white/80 backdrop-blur-sm shadow-inner dark:bg-gray-800/80 py-8 relative z-1">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">منصة بكّر</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  منصة ذكية للتشخيص المبكر للحالات المرضية باستخدام تقنيات الذكاء الاصطناعي المتطورة
                </p>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    تعمل منصة بكّر على مساعدة المستخدمين في اتخاذ القرارات الصحية المناسبة من خلال تحليل الأعراض وتقديم توصيات طبية أولية موثوقة
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">روابط سريعة</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/symptom-checker" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      فحص الأعراض
                    </Link>
                  </li>
                  <li>
                    <Link href="/medical-record" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      السجل الطبي
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      اتصل بنا
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">تواصل معنا</h3>
                <div className="flex space-x-4 space-x-reverse mb-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                  </a>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">معلومات الاتصال</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 flex items-center">
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@bakker-ai.com
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +966 12 345 6789
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                منصة بكّر - جميع الحقوق محفوظة {new Date().getFullYear()} &copy;
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
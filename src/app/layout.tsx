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
    <html lang="ar" dir="rtl" className="numbers-en">
      <body className="flex min-h-screen flex-col bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Abstract medical background pattern */}
        <div className="fixed inset-0 z-0 opacity-3 dark:opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30,10 L70,10 L70,50 L30,50 Z' fill='none' stroke='%23BFDBFE' stroke-width='2' /%3E%3Ccircle cx='50' cy='30' r='10' fill='none' stroke='%23BBF7D0' stroke-width='2' /%3E%3Cpath d='M10,30 L20,30 M15,25 L15,35' stroke='%23BFDBFE' stroke-width='2' /%3E%3Cpath d='M80,30 L90,30 M85,25 L85,35' stroke='%23BBF7D0' stroke-width='2' /%3E%3Cpath d='M50,70 L50,90' stroke='%23BFDBFE' stroke-width='2' /%3E%3Ccircle cx='50' cy='80' r='5' fill='none' stroke='%23BBF7D0' stroke-width='1' /%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }}></div>
          
          {/* إضافة رموز تعبيرية طبية خفيفة */}
          <div className="absolute opacity-3">
            <span style={{position: 'absolute', top: '15%', left: '10%', fontSize: '40px'}}>💉</span>
            <span style={{position: 'absolute', top: '35%', right: '15%', fontSize: '36px'}}>💊</span>
            <span style={{position: 'absolute', top: '65%', left: '20%', fontSize: '42px'}}>🧬</span>
            <span style={{position: 'absolute', top: '80%', right: '25%', fontSize: '38px'}}>🩺</span>
            <span style={{position: 'absolute', top: '25%', left: '75%', fontSize: '34px'}}>🧪</span>
            <span style={{position: 'absolute', top: '55%', right: '5%', fontSize: '40px'}}>💗</span>
          </div>
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
                <ul className="space-y-2">
                  <li>

                  </li>
                  <li>

                  </li>
                  <li>

                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">معلومات الاتصال</h3>
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex items-center">
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    bakker.0220@gmail.com
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0543655847
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
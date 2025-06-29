"use client"

// src/app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      {/* Hero Section */}
      <div className="mb-16 relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply opacity-50 dark:opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply opacity-50 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply opacity-50 dark:opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">منصة بكّر</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-200">التشخيص المبكر بتقنية الذكاء الاصطناعي</h2>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
            منصة ذكية تساعدك على التشخيص المبكر للحالات المرضية بناءً على الأعراض التي تُدخلها وتقديم النصائح الطبية الأولية
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link 
              href="/register" 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              تسجيل حساب جديد
            </Link>
            
            <Link 
              href="/login" 
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-medium hover:bg-blue-50 transition-all duration-300 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-12 text-gray-800 dark:text-gray-200">كيف تساعدك منصة بكّر؟</h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-6">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 dark:bg-gray-800/90 border-t-4 border-blue-600">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">تشخيص مبكر</h3>
            <p className="text-gray-600 dark:text-gray-300">
              أدخل الأعراض التي تعاني منها واحصل على تشخيص مبدئي من خلال نظام الذكاء الاصطناعي المتطور
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 dark:bg-gray-800/90 border-t-4 border-green-500">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">متابعة مستمرة</h3>
            <p className="text-gray-600 dark:text-gray-300">
              تتبع حالتك الصحية وراجع التشخيصات السابقة بسهولة وحافظ على سجل طبي متكامل
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 dark:bg-gray-800/90 border-t-4 border-blue-600">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">خصوصية تامة</h3>
            <p className="text-gray-600 dark:text-gray-300">
              نضمن لك أعلى درجات الخصوصية والأمان لبياناتك الشخصية والطبية وفق معايير عالمية
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-12 text-gray-800 dark:text-gray-200">كيف تعمل منصة بكّر؟</h2>
        
        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-400 transform -translate-y-1/2 z-0"></div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg relative z-1 dark:bg-gray-800/90">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto -mt-10 mb-4 shadow-lg border-4 border-white dark:border-gray-800">1</div>
            <h3 className="text-lg font-semibold mb-2 text-center">إدخال الأعراض</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              أدخل الأعراض التي تشعر بها وأي معلومات صحية ذات صلة
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg relative z-1 dark:bg-gray-800/90">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto -mt-10 mb-4 shadow-lg border-4 border-white dark:border-gray-800">2</div>
            <h3 className="text-lg font-semibold mb-2 text-center">تحليل البيانات</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              يقوم نظام الذكاء الاصطناعي بتحليل البيانات المدخلة
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg relative z-1 dark:bg-gray-800/90">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto -mt-10 mb-4 shadow-lg border-4 border-white dark:border-gray-800">3</div>
            <h3 className="text-lg font-semibold mb-2 text-center">النتائج والتوصيات</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              الحصول على تشخيص مبدئي ونصائح طبية أولية
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg relative z-1 dark:bg-gray-800/90">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto -mt-10 mb-4 shadow-lg border-4 border-white dark:border-gray-800">4</div>
            <h3 className="text-lg font-semibold mb-2 text-center">المتابعة الطبية</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              التواصل مع الطبيب المختص عند الحاجة لمتابعة الحالة
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-500/20 rounded-3xl transform -skew-y-1 dark:from-blue-900/30 dark:to-green-800/30"></div>
        <div className="relative bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-xl max-w-4xl mx-auto dark:bg-gray-800/90 border border-blue-100 dark:border-blue-900">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">ابدأ رحلتك الصحية الآن</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            انضم إلى الآلاف من المستخدمين الذين يستفيدون من خدمات بكّر للحفاظ على صحتهم واتخاذ القرارات الطبية المناسبة
          </p>
          <Link 
            href="/symptom-checker" 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg text-lg font-medium hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            ابدأ التشخيص الآن
          </Link>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-12 text-gray-800 dark:text-gray-200">ماذا يقول المستخدمون؟</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg dark:bg-gray-800/90 border-r-4 border-blue-500">
            <div className="flex justify-end mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              منصة بكّر ساعدتني كثيراً في فهم الأعراض التي كنت أعاني منها، وقدمت لي نصائح مهمة قبل زيارة الطبيب.
            </p>
            <div className="text-end">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">أحمد س.</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">الرياض</p>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg dark:bg-gray-800/90 border-r-4 border-green-500">
            <div className="flex justify-end mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              سهولة الاستخدام ودقة المعلومات جعلتني أعتمد على منصة بكّر بشكل دائم لمتابعة صحتي وصحة عائلتي.
            </p>
            <div className="text-end">
              <h4 className="font-semibold text-green-600 dark:text-green-400">سارة م.</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">جدة</p>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg dark:bg-gray-800/90 border-r-4 border-blue-500">
            <div className="flex justify-end mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              كطبيب، أرى أن منصة بكّر تساهم في رفع الوعي الصحي وتساعد المرضى على اتخاذ قرارات أفضل.
            </p>
            <div className="text-end">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">د. محمد ع.</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">أخصائي طب أسرة</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className="mt-16">
        <div className="flex flex-wrap justify-center gap-8 items-center text-gray-500 dark:text-gray-400">
          <div className="text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            خصوصية البيانات ١٠٠٪
          </div>
          <div className="text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            دقة تشخيص عالية
          </div>
          <div className="text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            استجابة سريعة
          </div>
        </div>
      </div>
    </div>
  )
}
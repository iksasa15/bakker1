"use client"

// src/app/page.tsx
import Link from 'next/link'
import { useEffect } from 'react'

export default function HomePage() {
  // إضافة تأثير حركي بسيط عند تحميل الصفحة
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in-section');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        if (isVisible) {
          el.classList.add('opacity-100');
          el.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // تشغيل عند التحميل
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      {/* Hero Section */}
      <div className="mb-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float"></div>
        <div className="absolute -bottom-20 -left-32 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float animation-delay-4000"></div>
        
        <div className="relative py-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white shadow-lg animate-pulse-slow">
              <span className="text-2xl font-bold">بكّر</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">منصة بكّر</h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-gray-800 dark:text-gray-200">التشخيص المبكر بتقنية الذكاء الاصطناعي</h2>
          
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
            منصة ذكية تساعدك على التشخيص المبكر للحالات المرضية بناءً على الأعراض
            <br className="hidden md:block" />
            وتقديم النصائح الطبية الأولية بدقة عالية
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl text-xl font-medium hover:from-blue-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              تسجيل حساب جديد
            </Link>
            
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl text-xl font-medium hover:bg-blue-50 transition-all duration-300 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              تسجيل الدخول
            </Link>
          </div>
          
          {/* Scrolling indicator */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center mt-16 animate-bounce">
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400">اكتشف المزيد</span>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mb-32 fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-800 dark:text-gray-200">كيف تساعدك منصة بكّر؟</h2>
        
        <div className="grid md:grid-cols-3 gap-10 mt-6">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl transition-all duration-500 card-hover dark:bg-gray-800/90 border-t-4 border-blue-600">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">تشخيص مبكر</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              أدخل الأعراض التي تعاني منها واحصل على تشخيص مبدئي من خلال نظام الذكاء الاصطناعي المتطور
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl transition-all duration-500 card-hover dark:bg-gray-800/90 border-t-4 border-green-500">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">متابعة مستمرة</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              تتبع حالتك الصحية وراجع التشخيصات السابقة بسهولة وحافظ على سجل طبي متكامل
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl transition-all duration-500 card-hover dark:bg-gray-800/90 border-t-4 border-blue-600">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">خصوصية تامة</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              نضمن لك أعلى درجات الخصوصية والأمان لبياناتك الشخصية والطبية وفق معايير عالمية
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="mb-32 fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-800 dark:text-gray-200">كيف تعمل منصة بكّر؟</h2>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-400 transform -translate-y-1/2 z-0 rounded-full"></div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl relative z-1 dark:bg-gray-800/90 transition-all duration-500 card-hover">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto -mt-12 mb-6 shadow-lg border-4 border-white dark:border-gray-800 text-2xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-4 text-center">إدخال الأعراض</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
              أدخل الأعراض التي تشعر بها وأي معلومات صحية ذات صلة
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl relative z-1 dark:bg-gray-800/90 transition-all duration-500 card-hover">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto -mt-12 mb-6 shadow-lg border-4 border-white dark:border-gray-800 text-2xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-4 text-center">تحليل البيانات</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
              يقوم نظام الذكاء الاصطناعي بتحليل البيانات المدخلة
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl relative z-1 dark:bg-gray-800/90 transition-all duration-500 card-hover">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center text-white mx-auto -mt-12 mb-6 shadow-lg border-4 border-white dark:border-gray-800 text-2xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-4 text-center">النتائج والتوصيات</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
              الحصول على تشخيص مبدئي ونصائح طبية أولية
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="relative mb-32 fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-500/20 rounded-3xl transform -skew-y-2 dark:from-blue-900/30 dark:to-green-800/30"></div>
        <div className="relative bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-2xl max-w-5xl mx-auto dark:bg-gray-800/90 border border-blue-100 dark:border-blue-900">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">ابدأ رحلتك الصحية الآن</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto text-xl">
            انضم إلى الآلاف من المستخدمين الذين يستفيدون من خدمات بكّر للحفاظ على صحتهم واتخاذ القرارات الطبية المناسبة
          </p>
          <Link 
            href="/login" 
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl text-xl font-medium hover:from-blue-700 hover:to-green-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
          >
            ابدأ التشخيص الآن
          </Link>
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className="mt-16 fade-in-section opacity-0 translate-y-10 transition-all duration-1000">
        <div className="flex flex-wrap justify-center gap-10 items-center text-gray-500 dark:text-gray-400">
          <div className="text-lg flex items-center bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">خصوصية البيانات 100%</span>
          </div>
          <div className="text-lg flex items-center bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="font-medium">دقة تشخيص عالية</span>
          </div>
          <div className="text-lg flex items-center bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">استجابة سريعة</span>
          </div>
        </div>
      </div>
    </div>
  )

}

// src/app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">مرحباً بك في نظام إدارة المرضى</h1>
      
      <p className="text-xl mb-8 max-w-2xl mx-auto">
        منصة متكاملة لإدارة الرعاية الصحية وتسهيل التواصل بين المرضى والأطباء
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Link 
          href="../app/screens/auth/register/page.tsx" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          تسجيل حساب جديد
        </Link>
        
        <Link 
          href="/login" 
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          تسجيل الدخول
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">تشخيص سريع</h2>
          <p className="text-gray-600 dark:text-gray-300">
            أدخل الأعراض التي تعاني منها واحصل على تشخيص مبدئي من خلال نظام الذكاء الاصطناعي
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">متابعة الحالة الصحية</h2>
          <p className="text-gray-600 dark:text-gray-300">
            تتبع حالتك الصحية وراجع التشخيصات السابقة بسهولة من خلال ملفك الشخصي
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">خصوصية عالية</h2>
          <p className="text-gray-600 dark:text-gray-300">
            نضمن لك أعلى درجات الخصوصية والأمان لبياناتك الشخصية والطبية
          </p>
        </div>
      </div>
    </div>
  )
}
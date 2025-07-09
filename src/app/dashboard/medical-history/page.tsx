// src/app/dashboard/medical-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/config";
import MedicalHistory from "../../../models/MedicalHistory";
import Disease from "../../../models/Disease";
import { Timestamp } from "firebase/firestore";

// واجهات البيانات للنماذج
interface DiseaseFormData {
  diseaseName: string;
  diagnosisDate: string;
  status: 'active' | 'cured' | 'chronic' | 'in_treatment';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string;
  treatments: string;
}

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  
  // بيانات التاريخ المرضي
  const [diseases, setDiseases] = useState<Disease[]>([]);
  
  // حالة النماذج
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // بيانات النماذج
  const [diseaseForm, setDiseaseForm] = useState<DiseaseFormData>({
    diseaseName: '',
    diagnosisDate: '',
    status: 'active',
    severity: 'moderate',
    symptoms: '',
    treatments: ''
  });
  
  // التحقق من حالة تسجيل الدخول والحصول على البيانات
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setPatientId(user.uid);
        await fetchMedicalHistory(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  // جلب التاريخ المرضي
  const fetchMedicalHistory = async (patientId: string) => {
    try {
      const medicalHistory = new MedicalHistory(patientId);
      const history = await medicalHistory.getFullMedicalHistory();
      
      setDiseases(history.diseases);
    } catch (error) {
      console.error("خطأ في جلب التاريخ المرضي:", error);
    }
  };
  
  // تنسيق التاريخ لعرضه
  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return "غير محدد";
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate();
      
    return date.toLocaleDateString('ar-SA');
  };
  
  // تحويل النص إلى مصفوفة
  const splitTextToArray = (text: string): string[] => {
    return text.split(',').map(item => item.trim()).filter(item => item !== '');
  };
  
  // إضافة أو تحديث مرض
  const handleSaveDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) return;
    
    try {
      const diseaseData = {
        patientId,
        diseaseName: diseaseForm.diseaseName,
        diagnosisDate: new Date(diseaseForm.diagnosisDate),
        status: diseaseForm.status,
        severity: diseaseForm.severity,
        symptoms: splitTextToArray(diseaseForm.symptoms),
        treatments: splitTextToArray(diseaseForm.treatments)
      };
      
      let disease: Disease;
      
      if (editingId) {
        // تحديث مرض موجود
        const existingDisease = await Disease.getById(editingId);
        if (!existingDisease) throw new Error("المرض غير موجود");
        
        disease = new Disease({
          ...diseaseData,
          id: editingId
        });
      } else {
        // إضافة مرض جديد
        disease = new Disease(diseaseData);
      }
      
      await disease.save();
      await fetchMedicalHistory(patientId);
      resetForms();
      setIsFormVisible(false);
      setEditingId(null);
    } catch (error) {
      console.error("خطأ في حفظ المرض:", error);
    }
  };
  
  // حذف عنصر
  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    
    try {
      const disease = await Disease.getById(id);
      if (disease) await disease.delete();
      
      if (patientId) await fetchMedicalHistory(patientId);
    } catch (error) {
      console.error("خطأ في حذف العنصر:", error);
    }
  };
  
  // تحرير عنصر
  const handleEdit = async (id: string) => {
    setEditingId(id);
    
    try {
      const disease = await Disease.getById(id);
      if (disease) {
        setDiseaseForm({
          diseaseName: disease.diseaseName,
          diagnosisDate: disease.diagnosisDate instanceof Date 
            ? disease.diagnosisDate.toISOString().split('T')[0]
            : disease.diagnosisDate.toDate().toISOString().split('T')[0],
          status: disease.status,
          severity: disease.severity,
          symptoms: disease.symptoms.join(', '),
          treatments: disease.treatments?.join(', ') || ''
        });
      }
      
      setIsFormVisible(true);
    } catch (error) {
      console.error("خطأ في تحرير العنصر:", error);
    }
  };
  
  // إعادة تعيين النماذج
  const resetForms = () => {
    setDiseaseForm({
      diseaseName: '',
      diagnosisDate: '',
      status: 'active',
      severity: 'moderate',
      symptoms: '',
      treatments: ''
    });
  };
  
  // رسم العنصر المناسب حسب الحالة
  const renderForm = () => {
    if (!isFormVisible) return null;
    
    return (
      <form onSubmit={handleSaveDisease} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-50 dark:border-blue-900">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
          {editingId ? 'تحرير المرض' : 'إضافة مرض جديد'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">اسم المرض</label>
            <input 
              type="text" 
              value={diseaseForm.diseaseName} 
              onChange={(e) => setDiseaseForm({...diseaseForm, diseaseName: e.target.value})}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">تاريخ التشخيص</label>
            <input 
              type="date" 
              value={diseaseForm.diagnosisDate} 
              onChange={(e) => setDiseaseForm({...diseaseForm, diagnosisDate: e.target.value})}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
            <select 
              value={diseaseForm.status} 
              onChange={(e) => setDiseaseForm({...diseaseForm, status: e.target.value as DiseaseFormData["status"]})}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="active">نشط</option>
              <option value="cured">تم الشفاء</option>
              <option value="chronic">مزمن</option>
              <option value="in_treatment">تحت العلاج</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">الشدة</label>
            <select 
              value={diseaseForm.severity} 
              onChange={(e) => setDiseaseForm({...diseaseForm, severity: e.target.value as DiseaseFormData["severity"]})}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="mild">خفيف</option>
              <option value="moderate">متوسط</option>
              <option value="severe">شديد</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 dark:text-gray-300 mb-1">الأعراض (مفصولة بفواصل)</label>
            <textarea 
              value={diseaseForm.symptoms} 
              onChange={(e) => setDiseaseForm({...diseaseForm, symptoms: e.target.value})}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={2}
              required
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 dark:text-gray-300 mb-1">العلاجات (مفصولة بفواصل)</label>
            <textarea 
              value={diseaseForm.treatments} 
              onChange={(e) => setDiseaseForm({...diseaseForm, treatments: e.target.value})}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={2}
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            onClick={() => {
              setIsFormVisible(false);
              setEditingId(null);
              resetForms();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            إلغاء
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg hover:from-blue-700 hover:to-green-600"
          >
            {editingId ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </form>
    );
  };
  
  // عرض بيانات التاب النشط
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-60">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900 opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-green-500 border-b-transparent border-l-transparent animate-spin animation-delay-2000"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        {diseases.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>لا توجد أمراض مسجلة. أضف مرضاً جديداً للبدء.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {diseases.map((disease) => (
              <div 
                key={disease.id} 
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-blue-50 dark:border-blue-900 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">{disease.diseaseName}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      تاريخ التشخيص: {formatDate(disease.diagnosisDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleEdit(disease.id!)} 
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-800/70"
                      title="تحرير"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(disease.id!)} 
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/70"
                      title="حذف"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">الحالة</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {disease.status === 'active' && 'نشط'}
                      {disease.status === 'cured' && 'تم الشفاء'}
                      {disease.status === 'chronic' && 'مزمن'}
                      {disease.status === 'in_treatment' && 'تحت العلاج'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">الشدة</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {disease.severity === 'mild' && 'خفيف'}
                      {disease.severity === 'moderate' && 'متوسط'}
                      {disease.severity === 'severe' && 'شديد'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">الأعراض</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {disease.symptoms.join('، ')}
                    </p>
                  </div>
                  
                  {disease.treatments && disease.treatments.length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">العلاجات</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {disease.treatments.join('، ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // الرجوع للصفحة السابقة
  const goBack = () => {
    router.push("/dashboard");
  };
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* العناصر الزخرفية */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-200 dark:bg-green-900/30 rounded-full mix-blend-multiply opacity-60 dark:opacity-20 animate-float animation-delay-2000"></div>
      
      <div className="relative z-1">
        <div className="flex items-center mb-8">
          <button 
            onClick={goBack} 
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ml-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
            التاريخ المرضي
          </h1>
        </div>
        
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-8 border border-blue-50 dark:border-blue-900">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-6">
            <div className="flex overflow-x-auto space-x-2 space-x-reverse mb-4 md:mb-0 pb-2">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
                الأمراض
              </h2>
            </div>
            
            {!isFormVisible && (
              <button 
                onClick={() => {
                  resetForms();
                  setIsFormVisible(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg hover:from-blue-700 hover:to-green-600"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  إضافة مرض
                </div>
              </button>
            )}
          </div>
          
          {isFormVisible && renderForm()}
          
          <div className={`mt-8 ${isFormVisible ? 'opacity-50 pointer-events-none' : ''}`}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
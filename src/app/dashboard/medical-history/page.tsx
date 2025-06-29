// src/app/dashboard/medical-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/config";
import MedicalHistory from "../../../models/MedicalHistory";
import Disease from "../../../models/Disease";
import TravelHistory from "../../../models/TravelHistory";
import Allergy from "../../../models/Allergy";
import Medication from "../../../models/Medication";
import { Timestamp } from "firebase/firestore";

// واجهات البيانات للنماذج
interface DiseaseFormData {
  diseaseName: string;
  diagnosisDate: string;
  status: 'active' | 'cured' | 'chronic' | 'in_treatment';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string;
  notes: string;
  treatments: string;
  doctorName: string;
  hospitalName: string;
}

interface TravelFormData {
  destination: string;
  departureDate: string;
  returnDate: string;
  purpose: 'tourism' | 'business' | 'medical' | 'education' | 'other';
  healthIssues: string;
  vaccinations: string;
  countriesVisited: string;
  notes: string;
}

interface AllergyFormData {
  allergyName: string;
  allergyType: 'food' | 'medication' | 'environmental' | 'insect' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  symptoms: string;
  diagnosisDate: string;
  treatment: string;
  notes: string;
}

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  prescribedBy: string;
  reasonForTaking: string;
  sideEffects: string;
  notes: string;
}

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  
  // بيانات التاريخ المرضي
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [travelHistory, setTravelHistory] = useState<TravelHistory[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  
  // حالة النماذج
  const [activeTab, setActiveTab] = useState<'diseases' | 'travel' | 'allergies' | 'medications'>('diseases');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // بيانات النماذج
  const [diseaseForm, setDiseaseForm] = useState<DiseaseFormData>({
    diseaseName: '',
    diagnosisDate: '',
    status: 'active',
    severity: 'moderate',
    symptoms: '',
    notes: '',
    treatments: '',
    doctorName: '',
    hospitalName: ''
  });
  
  const [travelForm, setTravelForm] = useState<TravelFormData>({
    destination: '',
    departureDate: '',
    returnDate: '',
    purpose: 'tourism',
    healthIssues: '',
    vaccinations: '',
    countriesVisited: '',
    notes: ''
  });
  
  const [allergyForm, setAllergyForm] = useState<AllergyFormData>({
    allergyName: '',
    allergyType: 'food',
    severity: 'moderate',
    symptoms: '',
    diagnosisDate: '',
    treatment: '',
    notes: ''
  });
  
  const [medicationForm, setMedicationForm] = useState<MedicationFormData>({
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    isActive: true,
    prescribedBy: '',
    reasonForTaking: '',
    sideEffects: '',
    notes: ''
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
      setTravelHistory(history.travelHistory);
      setAllergies(history.allergies);
      setMedications(history.medications);
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
        notes: diseaseForm.notes,
        treatments: splitTextToArray(diseaseForm.treatments),
        doctorName: diseaseForm.doctorName,
        hospitalName: diseaseForm.hospitalName
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
  
  // إضافة أو تحديث تاريخ سفر
  const handleSaveTravel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) return;
    
    try {
      const travelData = {
        patientId,
        destination: travelForm.destination,
        departureDate: new Date(travelForm.departureDate),
        returnDate: new Date(travelForm.returnDate),
        purpose: travelForm.purpose,
        healthIssuesDuringTravel: splitTextToArray(travelForm.healthIssues),
        vaccinationsTaken: splitTextToArray(travelForm.vaccinations),
        countriesVisited: splitTextToArray(travelForm.countriesVisited),
        notes: travelForm.notes
      };
      
      let travel: TravelHistory;
      
      if (editingId) {
        // تحديث تاريخ سفر موجود
        const existingTravel = await TravelHistory.getById(editingId);
        if (!existingTravel) throw new Error("تاريخ السفر غير موجود");
        
        travel = new TravelHistory({
          ...travelData,
          id: editingId
        });
      } else {
        // إضافة تاريخ سفر جديد
        travel = new TravelHistory(travelData);
      }
      
      await travel.save();
      await fetchMedicalHistory(patientId);
      resetForms();
      setIsFormVisible(false);
      setEditingId(null);
    } catch (error) {
      console.error("خطأ في حفظ تاريخ السفر:", error);
    }
  };
  
  // إضافة أو تحديث حساسية
  const handleSaveAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) return;
    
    try {
      const allergyData = {
        patientId,
        allergyName: allergyForm.allergyName,
        allergyType: allergyForm.allergyType,
        severity: allergyForm.severity,
        symptoms: splitTextToArray(allergyForm.symptoms),
        diagnosisDate: allergyForm.diagnosisDate ? new Date(allergyForm.diagnosisDate) : undefined,
        treatment: allergyForm.treatment,
        notes: allergyForm.notes
      };
      
      let allergy: Allergy;
      
      if (editingId) {
        // تحديث حساسية موجودة
        const existingAllergy = await Allergy.getById(editingId);
        if (!existingAllergy) throw new Error("الحساسية غير موجودة");
        
        allergy = new Allergy({
          ...allergyData,
          id: editingId
        });
      } else {
        // إضافة حساسية جديدة
        allergy = new Allergy(allergyData);
      }
      
      await allergy.save();
      await fetchMedicalHistory(patientId);
      resetForms();
      setIsFormVisible(false);
      setEditingId(null);
    } catch (error) {
      console.error("خطأ في حفظ الحساسية:", error);
    }
  };
  
  // إضافة أو تحديث دواء
  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) return;
    
    try {
      const medicationData = {
        patientId,
        medicationName: medicationForm.medicationName,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        startDate: new Date(medicationForm.startDate),
        endDate: medicationForm.endDate ? new Date(medicationForm.endDate) : undefined,
        isActive: medicationForm.isActive,
        prescribedBy: medicationForm.prescribedBy,
        reasonForTaking: medicationForm.reasonForTaking,
        sideEffects: splitTextToArray(medicationForm.sideEffects),
        notes: medicationForm.notes
      };
      
      let medication: Medication;
      
      if (editingId) {
        // تحديث دواء موجود
        const existingMedication = await Medication.getById(editingId);
        if (!existingMedication) throw new Error("الدواء غير موجود");
        
        medication = new Medication({
          ...medicationData,
          id: editingId
        });
      } else {
        // إضافة دواء جديد
        medication = new Medication(medicationData);
      }
      
      await medication.save();
      await fetchMedicalHistory(patientId);
      resetForms();
      setIsFormVisible(false);
      setEditingId(null);
    } catch (error) {
      console.error("خطأ في حفظ الدواء:", error);
    }
  };
  
  // حذف عنصر
  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    
    try {
      switch (activeTab) {
        case 'diseases':
          const disease = await Disease.getById(id);
          if (disease) await disease.delete();
          break;
        case 'travel':
          const travel = await TravelHistory.getById(id);
          if (travel) await travel.delete();
          break;
        case 'allergies':
          const allergy = await Allergy.getById(id);
          if (allergy) await allergy.delete();
          break;
        case 'medications':
          const medication = await Medication.getById(id);
          if (medication) await medication.delete();
          break;
      }
      
      if (patientId) await fetchMedicalHistory(patientId);
    } catch (error) {
      console.error("خطأ في حذف العنصر:", error);
    }
  };
  
  // تحرير عنصر
  const handleEdit = async (id: string) => {
    setEditingId(id);
    
    try {
      switch (activeTab) {
        case 'diseases':
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
              notes: disease.notes || '',
              treatments: disease.treatments?.join(', ') || '',
              doctorName: disease.doctorName || '',
              hospitalName: disease.hospitalName || ''
            });
          }
          break;
        case 'travel':
          const travel = await TravelHistory.getById(id);
          if (travel) {
            setTravelForm({
              destination: travel.destination,
              departureDate: travel.departureDate instanceof Date 
                ? travel.departureDate.toISOString().split('T')[0]
                : travel.departureDate.toDate().toISOString().split('T')[0],
              returnDate: travel.returnDate instanceof Date 
                ? travel.returnDate.toISOString().split('T')[0]
                : travel.returnDate.toDate().toISOString().split('T')[0],
              purpose: travel.purpose,
              healthIssues: travel.healthIssuesDuringTravel?.join(', ') || '',
              vaccinations: travel.vaccinationsTaken?.join(', ') || '',
              countriesVisited: travel.countriesVisited?.join(', ') || '',
              notes: travel.notes || ''
            });
          }
          break;
        case 'allergies':
          const allergy = await Allergy.getById(id);
          if (allergy) {
            setAllergyForm({
              allergyName: allergy.allergyName,
              allergyType: allergy.allergyType,
              severity: allergy.severity,
              symptoms: allergy.symptoms.join(', '),
              diagnosisDate: allergy.diagnosisDate instanceof Date 
                ? allergy.diagnosisDate.toISOString().split('T')[0]
                : allergy.diagnosisDate 
                  ? allergy.diagnosisDate.toDate().toISOString().split('T')[0]
                  : '',
              treatment: allergy.treatment || '',
              notes: allergy.notes || ''
            });
          }
          break;
        case 'medications':
          const medication = await Medication.getById(id);
          if (medication) {
            setMedicationForm({
              medicationName: medication.medicationName,
              dosage: medication.dosage,
              frequency: medication.frequency,
              startDate: medication.startDate instanceof Date 
                ? medication.startDate.toISOString().split('T')[0]
                : medication.startDate.toDate().toISOString().split('T')[0],
              endDate: medication.endDate instanceof Date 
                ? medication.endDate.toISOString().split('T')[0]
                : medication.endDate 
                  ? medication.endDate.toDate().toISOString().split('T')[0]
                  : '',
              isActive: medication.isActive,
              prescribedBy: medication.prescribedBy || '',
              reasonForTaking: medication.reasonForTaking,
              sideEffects: medication.sideEffects?.join(', ') || '',
              notes: medication.notes || ''
            });
          }
          break;
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
      notes: '',
      treatments: '',
      doctorName: '',
      hospitalName: ''
    });
    
    setTravelForm({
      destination: '',
      departureDate: '',
      returnDate: '',
      purpose: 'tourism',
      healthIssues: '',
      vaccinations: '',
      countriesVisited: '',
      notes: ''
    });
    
    setAllergyForm({
      allergyName: '',
      allergyType: 'food',
      severity: 'moderate',
      symptoms: '',
      diagnosisDate: '',
      treatment: '',
      notes: ''
    });
    
    setMedicationForm({
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      isActive: true,
      prescribedBy: '',
      reasonForTaking: '',
      sideEffects: '',
      notes: ''
    });
  };
  
  // رسم العنصر المناسب حسب الحالة
  const renderForm = () => {
    if (!isFormVisible) return null;
    
    switch (activeTab) {
      case 'diseases':
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
                  onChange={(e) => setDiseaseForm({...diseaseForm, status: e.target.value as any})}
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
                  onChange={(e) => setDiseaseForm({...diseaseForm, severity: e.target.value as any})}
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
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">اسم الطبيب</label>
                <input 
                  type="text" 
                  value={diseaseForm.doctorName} 
                  onChange={(e) => setDiseaseForm({...diseaseForm, doctorName: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">اسم المستشفى</label>
                <input 
                  type="text" 
                  value={diseaseForm.hospitalName} 
                  onChange={(e) => setDiseaseForm({...diseaseForm, hospitalName: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">ملاحظات إضافية</label>
                <textarea 
                  value={diseaseForm.notes} 
                  onChange={(e) => setDiseaseForm({...diseaseForm, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
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
        
      case 'travel':
        return (
          <form onSubmit={handleSaveTravel} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-50 dark:border-blue-900">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
              {editingId ? 'تحرير تاريخ السفر' : 'إضافة سفر جديد'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">الوجهة</label>
                <input 
                  type="text" 
                  value={travelForm.destination} 
                  onChange={(e) => setTravelForm({...travelForm, destination: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">الغرض من السفر</label>
                <select 
                  value={travelForm.purpose} 
                  onChange={(e) => setTravelForm({...travelForm, purpose: e.target.value as any})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="tourism">سياحة</option>
                  <option value="business">عمل</option>
                  <option value="medical">علاج طبي</option>
                  <option value="education">تعليم</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">تاريخ المغادرة</label>
                <input 
                  type="date" 
                  value={travelForm.departureDate} 
                  onChange={(e) => setTravelForm({...travelForm, departureDate: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">تاريخ العودة</label>
                <input 
                  type="date" 
                  value={travelForm.returnDate} 
                  onChange={(e) => setTravelForm({...travelForm, returnDate: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">الدول التي تمت زيارتها (مفصولة بفواصل)</label>
                <input 
                  type="text" 
                  value={travelForm.countriesVisited} 
                  onChange={(e) => setTravelForm({...travelForm, countriesVisited: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">المشاكل الصحية خلال السفر (مفصولة بفواصل)</label>
                <textarea 
                  value={travelForm.healthIssues} 
                  onChange={(e) => setTravelForm({...travelForm, healthIssues: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">التطعيمات التي تم أخذها قبل السفر (مفصولة بفواصل)</label>
                <textarea 
                  value={travelForm.vaccinations} 
                  onChange={(e) => setTravelForm({...travelForm, vaccinations: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">ملاحظات إضافية</label>
                <textarea 
                  value={travelForm.notes} 
                  onChange={(e) => setTravelForm({...travelForm, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
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
        
      case 'allergies':
        return (
          <form onSubmit={handleSaveAllergy} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-50 dark:border-blue-900">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
              {editingId ? 'تحرير الحساسية' : 'إضافة حساسية جديدة'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">اسم الحساسية</label>
                <input 
                  type="text" 
                  value={allergyForm.allergyName} 
                  onChange={(e) => setAllergyForm({...allergyForm, allergyName: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">نوع الحساسية</label>
                <select 
                  value={allergyForm.allergyType} 
                  onChange={(e) => setAllergyForm({...allergyForm, allergyType: e.target.value as any})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="food">طعام</option>
                  <option value="medication">دواء</option>
                  <option value="environmental">بيئية</option>
                  <option value="insect">حشرات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">شدة الحساسية</label>
                <select 
                  value={allergyForm.severity} 
                  onChange={(e) => setAllergyForm({...allergyForm, severity: e.target.value as any})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="mild">خفيفة</option>
                  <option value="moderate">متوسطة</option>
                  <option value="severe">شديدة</option>
                  <option value="life_threatening">مهددة للحياة</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">تاريخ التشخيص</label>
                <input 
                  type="date" 
                  value={allergyForm.diagnosisDate} 
                  onChange={(e) => setAllergyForm({...allergyForm, diagnosisDate: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">الأعراض (مفصولة بفواصل)</label>
                <textarea 
                  value={allergyForm.symptoms} 
                  onChange={(e) => setAllergyForm({...allergyForm, symptoms: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                  required
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">العلاج</label>
                <textarea 
                  value={allergyForm.treatment} 
                  onChange={(e) => setAllergyForm({...allergyForm, treatment: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">ملاحظات إضافية</label>
                <textarea 
                  value={allergyForm.notes} 
                  onChange={(e) => setAllergyForm({...allergyForm, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
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
        
      case 'medications':
        return (
          <form onSubmit={handleSaveMedication} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-50 dark:border-blue-900">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-green-300">
              {editingId ? 'تحرير الدواء' : 'إضافة دواء جديد'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">اسم الدواء</label>
                <input 
                  type="text" 
                  value={medicationForm.medicationName} 
                  onChange={(e) => setMedicationForm({...medicationForm, medicationName: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">الجرعة</label>
                <input 
                  type="text" 
                  value={medicationForm.dosage} 
                  onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                  placeholder="مثال: 500 ملغ"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">التكرار</label>
                <input 
                  type="text" 
                  value={medicationForm.frequency} 
                  onChange={(e) => setMedicationForm({...medicationForm, frequency: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                  placeholder="مثال: مرتين يومياً"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">وصف بواسطة</label>
                <input 
                  type="text" 
                  value={medicationForm.prescribedBy} 
                  onChange={(e) => setMedicationForm({...medicationForm, prescribedBy: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="اسم الطبيب"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">تاريخ البدء</label>
                <input 
                  type="date" 
                  value={medicationForm.startDate} 
                  onChange={(e) => setMedicationForm({...medicationForm, startDate: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">تاريخ الانتهاء</label>
                <input 
                  type="date" 
                  value={medicationForm.endDate} 
                  onChange={(e) => setMedicationForm({...medicationForm, endDate: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">سبب تناول الدواء</label>
                <input 
                  type="text" 
                  value={medicationForm.reasonForTaking} 
                  onChange={(e) => setMedicationForm({...medicationForm, reasonForTaking: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">الآثار الجانبية (مفصولة بفواصل)</label>
                <textarea 
                  value={medicationForm.sideEffects} 
                  onChange={(e) => setMedicationForm({...medicationForm, sideEffects: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 mb-1">ملاحظات إضافية</label>
                <textarea 
                  value={medicationForm.notes} 
                  onChange={(e) => setMedicationForm({...medicationForm, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input 
                    type="checkbox" 
                    checked={medicationForm.isActive} 
                    onChange={(e) => setMedicationForm({...medicationForm, isActive: e.target.checked})}
                    className="ml-2"
                  />
                  نشط (هل تتناول هذا الدواء حالياً؟)
                </label>
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
        
      default:
        return null;
    }
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
    
    switch (activeTab) {
      case 'diseases':
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
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(disease.id!)} 
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/70"
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
                      
                      {disease.doctorName && (
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">الطبيب المعالج</h4>
                          <p className="text-gray-600 dark:text-gray-400">{disease.doctorName}</p>
                        </div>
                      )}
                      
                      {disease.hospitalName && (
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">المستشفى</h4>
                          <p className="text-gray-600 dark:text-gray-400">{disease.hospitalName}</p>
                        </div>
                      )}
                      
                      {disease.notes && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">ملاحظات</h4>
                          <p className="text-gray-600 dark:text-gray-400">{disease.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'travel':
        return (
          <div>
            {travelHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>لا يوجد تاريخ سفر مسجل. أضف سفراً جديداً للبدء.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {travelHistory.map((travel) => (
                  <div 
                    key={travel.id} 
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-blue-50 dark:border-blue-900 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400">{travel.destination}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(travel.departureDate)} - {formatDate(travel.returnDate)}
                        </p>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <button 
                          onClick={() => handleEdit(travel.id!)} 
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-800/70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(travel.id!)} 
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">الغرض من السفر</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {travel.purpose === 'tourism' && 'سياحة'}
                          {travel.purpose === 'business' && 'عمل'}
                          {travel.purpose === 'medical' && 'علاج طبي'}
                          {travel.purpose === 'education' && 'تعليم'}
                          {travel.purpose === 'other' && 'أخرى'}
                        </p>
                      </div>
                      
                      {travel.countriesVisited && travel.countriesVisited.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">الدول التي تمت زيارتها</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {travel.countriesVisited.join('، ')}
                          </p>
                        </div>
                      )}
                      
                      {travel.healthIssuesDuringTravel && travel.healthIssuesDuringTravel.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">المشاكل الصحية خلال السفر</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {travel.healthIssuesDuringTravel.join('، ')}
                          </p>
                        </div>
                      )}
                      
                      {travel.vaccinationsTaken && travel.vaccinationsTaken.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">التطعيمات التي تم أخذها</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {travel.vaccinationsTaken.join('، ')}
                          </p>
                        </div>
                      )}
                      
                      {travel.notes && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">ملاحظات</h4>
                          <p className="text-gray-600 dark:text-gray-400">{travel.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'allergies':
        return (
          <div>
            {allergies.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>لا توجد حساسيات مسجلة. أضف حساسية جديدة للبدء.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allergies.map((allergy) => (
                  <div 
                    key={allergy.id} 
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-blue-50 dark:border-blue-900 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-red-700 dark:text-red-400">{allergy.allergyName}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          نوع الحساسية: 
                          {allergy.allergyType === 'food' && ' طعام'}
                          {allergy.allergyType === 'medication' && ' دواء'}
                          {allergy.allergyType === 'environmental' && ' بيئية'}
                          {allergy.allergyType === 'insect' && ' حشرات'}
                          {allergy.allergyType === 'other' && ' أخرى'}
                        </p>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <button 
                          onClick={() => handleEdit(allergy.id!)} 
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-800/70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(allergy.id!)} 
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">شدة الحساسية</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {allergy.severity === 'mild' && 'خفيفة'}
                          {allergy.severity === 'moderate' && 'متوسطة'}
                          {allergy.severity === 'severe' && 'شديدة'}
                          {allergy.severity === 'life_threatening' && 'مهددة للحياة'}
                        </p>
                      </div>
                      
                      {allergy.diagnosisDate && (
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">تاريخ التشخيص</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {formatDate(allergy.diagnosisDate)}
                          </p>
                        </div>
                      )}
                      
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">الأعراض</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {allergy.symptoms.join('، ')}
                        </p>
                      </div>
                      
                      {allergy.treatment && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">العلاج</h4>
                          <p className="text-gray-600 dark:text-gray-400">{allergy.treatment}</p>
                        </div>
                      )}
                      
                      {allergy.notes && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">ملاحظات</h4>
                          <p className="text-gray-600 dark:text-gray-400">{allergy.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'medications':
        return (
          <div>
            {medications.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>لا توجد أدوية مسجلة. أضف دواءً جديداً للبدء.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div 
                    key={medication.id} 
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-blue-50 dark:border-blue-900 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">{medication.medicationName}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {medication.dosage} - {medication.frequency}
                        </p>
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <button 
                          onClick={() => handleEdit(medication.id!)} 
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-800/70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(medication.id!)} 
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/70"
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
                        <p className={`${medication.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {medication.isActive ? 'نشط' : 'متوقف'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">تاريخ البدء</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {formatDate(medication.startDate)}
                        </p>
                      </div>
                      
                      {medication.endDate && (
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">تاريخ الانتهاء</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {formatDate(medication.endDate)}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">سبب الاستخدام</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {medication.reasonForTaking}
                        </p>
                      </div>
                      
                      {medication.prescribedBy && (
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">وصف بواسطة</h4>
                          <p className="text-gray-600 dark:text-gray-400">{medication.prescribedBy}</p>
                        </div>
                      )}
                      
                      {medication.sideEffects && medication.sideEffects.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">الآثار الجانبية</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {medication.sideEffects.join('، ')}
                          </p>
                        </div>
                      )}
                      
                      {medication.notes && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300">ملاحظات</h4>
                          <p className="text-gray-600 dark:text-gray-400">{medication.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
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
              <button 
                onClick={() => setActiveTab('diseases')} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'diseases' 
                    ? 'bg-blue-600 text-white dark:bg-blue-700' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                الأمراض
              </button>
              <button 
                onClick={() => setActiveTab('allergies')} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'allergies' 
                    ? 'bg-blue-600 text-white dark:bg-blue-700' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                الحساسية
              </button>
              <button 
                onClick={() => setActiveTab('medications')} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'medications' 
                    ? 'bg-blue-600 text-white dark:bg-blue-700' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                الأدوية
              </button>
              <button 
                onClick={() => setActiveTab('travel')} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'travel' 
                    ? 'bg-blue-600 text-white dark:bg-blue-700' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                تاريخ السفر
              </button>
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
                  {activeTab === 'diseases' && 'إضافة مرض'}
                  {activeTab === 'travel' && 'إضافة سفر'}
                  {activeTab === 'allergies' && 'إضافة حساسية'}
                  {activeTab === 'medications' && 'إضافة دواء'}
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
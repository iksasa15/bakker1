// src/models/Patient.js

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { auth, db } from "../firebase/config"; // مسار محدث للاستيراد

class Patient {
  constructor(patientId = null, patientName = "", email = "", phoneNumber = "", 
              dateOfBirth = null, gender = "") {
    this.patientId = patientId;
    this.patientName = patientName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.dateOfBirth = dateOfBirth;
    this.gender = gender;
  }

  // إنشاء حساب جديد للمريض
  static async register(patientName, email, password, phoneNumber, dateOfBirth, gender) {
    try {
      // إنشاء حساب المستخدم في Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // تحديث الملف الشخصي مع اسم المريض
      await updateProfile(user, {
        displayName: patientName
      });
      
      // إنشاء وثيقة المريض في Firestore
      const patientData = {
        patientId: user.uid,
        patientName: patientName,
        email: email,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        gender: gender,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, "patients", user.uid), patientData);
      
      return new Patient(
        user.uid,
        patientName,
        email,
        phoneNumber,
        dateOfBirth,
        gender
      );
    } catch (error) {
      console.error("Error registering patient:", error);
      throw error;
    }
  }

  // تسجيل الدخول للمريض
  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // استرجاع بيانات المريض من Firestore
      const patientDoc = await getDoc(doc(db, "patients", user.uid));
      
      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        return new Patient(
          patientData.patientId,
          patientData.patientName,
          patientData.email,
          patientData.phoneNumber,
          patientData.dateOfBirth,
          patientData.gender
        );
      } else {
        throw new Error("بيانات المريض غير موجودة");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  // تسجيل الخروج
  static async logout() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }

  // باقي الكود كما هو...
  // إنشاء أعراض جديدة
  async createSymptom(symName) {
    try {
      const symptomData = {
        patientId: this.patientId,
        name: symName,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, "symptoms"), symptomData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating symptom:", error);
      throw error;
    }
  }

  // تعديل الأعراض
  async modifySymptom(symId, newData) {
    try {
      const symptomRef = doc(db, "symptoms", symId);
      
      // التحقق من أن العرض ينتمي للمريض
      const symptomDoc = await getDoc(symptomRef);
      if (!symptomDoc.exists() || symptomDoc.data().patientId !== this.patientId) {
        throw new Error("لا يمكن تعديل هذا العرض");
      }
      
      await updateDoc(symptomRef, {
        name: newData,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error("Error modifying symptom:", error);
      throw error;
    }
  }

  // حذف الأعراض
  async deleteSymptom(symId) {
    try {
      const symptomRef = doc(db, "symptoms", symId);
      
      // التحقق من أن العرض ينتمي للمريض
      const symptomDoc = await getDoc(symptomRef);
      if (!symptomDoc.exists() || symptomDoc.data().patientId !== this.patientId) {
        throw new Error("لا يمكن حذف هذا العرض");
      }
      
      await deleteDoc(symptomRef);
      return true;
    } catch (error) {
      console.error("Error deleting symptom:", error);
      throw error;
    }
  }

  // عرض التشخيص
  async viewDiagnosis() {
    try {
      const diagnosisQuery = query(
        collection(db, "diagnoses"),
        where("patientId", "==", this.patientId)
      );
      
      const querySnapshot = await getDocs(diagnosisQuery);
      const diagnoses = [];
      
      querySnapshot.forEach((doc) => {
        diagnoses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return diagnoses;
    } catch (error) {
      console.error("Error viewing diagnoses:", error);
      throw error;
    }
  }

  // إنشاء تقييم
  async createFeedback(content) {
    try {
      const feedbackData = {
        patientId: this.patientId,
        patientName: this.patientName,
        content: content,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, "feedback"), feedbackData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  }
}

export default Patient;
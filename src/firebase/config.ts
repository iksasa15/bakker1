// src/firebase/config.ts (تغيير الامتداد من .js إلى .ts)

// استيراد الوظائف الأساسية من Firebase مع أنواع البيانات
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

// تكوين تطبيق Firebase الخاص بك
const firebaseConfig = {
  
  authDomain: "bac،ttt،c-8نننed51.firebaseapp.com",
  projectId: "bacc-8ed51",
  storageBucket: "bacuyuc-8ed51.firebasestorage.app",
  messagingSenderId: "570715122823",
  appId: "1k:570715122823:web:918705150bbb685c0c9c22",
  measurementId: "G-JRP54Z9B3X"
};

// تعريف المتغيرات مع أنواع البيانات
let firebaseApp: FirebaseApp;
let analytics: Analytics | null = null;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (typeof window !== 'undefined' && !getApps().length) {
  // تهيئة Firebase
  firebaseApp = initializeApp(firebaseConfig);
  
  // تهيئة Analytics (فقط في المتصفح)
  analytics = getAnalytics(firebaseApp);
  
  // تهيئة خدمات Firebase الأخرى
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
  storage = getStorage(firebaseApp);
} else {
  // في حالة SSR، نتجنب تهيئة analytics
  firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
  auth = getAuth(firebaseApp);
  storage = getStorage(firebaseApp);
}

// تصدير الكائنات التي سيتم استخدامها في باقي التطبيق
export { firebaseApp, analytics, db, auth, storage };
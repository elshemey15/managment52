"use client";
import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    // بيحولك للـ Dashboard أوتوماتيك ويخلصنا من التهنيج
    window.location.href = "/dashboard";
  }, []);

  return <div>جاري التحويل للـ Dashboard...</div>;
}

/* 
  --- الكود القديم (سيبتهولك هنا لو احتجته بعدين) ---
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  ... (باقي كود اللوجن القديم بتاعك)
*/
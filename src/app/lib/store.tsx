"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoabEOr-ZOkQ6NLcbpNPjsNHMVzcJuhuA",
  authDomain: "managment52.firebaseapp.com",
  projectId: "managment52",
  storageBucket: "managment52.appspot.com",
  messagingSenderId: "444816435749",
  appId: "1:444816435749:web:d5a4a29d952a76a6d1edcc",
  measurementId: "G-PRW67PJSX1"
};

// تهيئة فايربيس بطريقة آمنة
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

const WarehouseContext = createContext<any>(null);

export const WarehouseProvider = ({ children }: any) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // الاتصال بقاعدة البيانات وسحب البيانات لحظياً
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addItem = async (item: any) => {
    try {
      await addDoc(collection(db, "items"), item);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <WarehouseContext.Provider value={{ data, addItem }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => useContext(WarehouseContext);
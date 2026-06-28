"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBoabEOr-ZOkQ6NLcbpNPjsNHMVzcJuhuA",
  authDomain: "managment52.firebaseapp.com",
  projectId: "managment52",
  storageBucket: "managment52.appspot.com",
  messagingSenderId: "444816435749",
  appId: "1:444816435749:web:d5a4a29d952a76a6d1edcc",
  measurementId: "G-PRW67PJSX1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const WarehouseContext = createContext<any>(null);

export const WarehouseProvider = ({ children }: any) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // بيسحب الداتا من قاعدة البيانات أول ما الصفحة تفتح
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addItem = async (item: any) => {
    // بيحفظ الداتا في قاعدة البيانات
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
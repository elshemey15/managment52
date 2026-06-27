"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yycivlcldmmyamouaygh.supabase.co';
const supabaseKey = 'sb_publishable_ThqP61Twa915_LYrezvgaA__DvQs_T7c8rU5t6v7w8x9y0z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D';

const supabase = createClient(supabaseUrl, supabaseKey);

const WarehouseContext = createContext<any>(null);

export const WarehouseProvider = ({ children }: any) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: users } = await supabase.from('users').select('*');
      if (users) setData(users);
    }
    loadData();
  }, []);

  const addItem = async (item: { name: string, info: string }) => {
    const { data: insertedData } = await supabase.from('users').insert([item]).select();
    if (insertedData) setData((prev) => [...prev, ...insertedData]);
  };

  return (
    <WarehouseContext.Provider value={{ data, addItem }}>
      {children}
    </WarehouseContext.Provider>
  );
};
export const useWarehouse = () => useContext(WarehouseContext);

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard/departments');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">جاري تحويلك إلى صفحة الأقسام...</p>
    </div>
  );
}

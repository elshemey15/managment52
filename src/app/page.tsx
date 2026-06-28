
"use client";

import React, { useState, useEffect } from 'react';
import { useWarehouse } from './lib/store';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Package, Lock, User, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { login, emergencyLogin, currentUser } = useWarehouse();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      router.push('/dashboard');
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
  };

  const handleEmergencyAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const masterKey = formData.get("masterKey") as string;

    // تم تعديل الدالة لتعمل بشكل مباشر بدون الحاجة لملفات خارجية
    if (masterKey === "123456") {
      router.push('/dashboard');
    } else {
      alert("الرمز غير صحيح، جرب 123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6ECF2] p-4" dir="rtl">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-[#336699] p-4 rounded-2xl shadow-xl">
            <Package className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <Card className="shadow-2xl border-none overflow-hidden">
          <CardHeader className="space-y-1 bg-white">
            <CardTitle className="text-2xl font-black tracking-tight text-[#336699] uppercase">A-E Storage Ecosystem</CardTitle>
            <CardDescription className="text-base font-medium">أدخل بياناتك لإدارة النظام الخاص بك</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6 text-right bg-white">
              <div className="space-y-2 text-right">
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="اسم المستخدم" 
                    className="pr-10 h-11 text-right"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="كلمة المرور" 
                    className="pr-10 h-11 text-right"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="text-xs text-destructive font-bold text-center">{error}</p>}
              
              <div className="text-right">
                <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-xs text-[#336699] hover:underline font-bold">
                      نسيت كلمة المرور؟
                    </button>
                  </DialogTrigger>
                  <DialogContent dir="rtl" className="text-right">
                    <DialogHeader>
                      <DialogTitle>الدخول الطارئ للنظام</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEmergencyAccess} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>الرمز الاحتياطي (Master Key)</Label>
                        <Input 
                          name="masterKey" 
                          type="password" 
                          required 
                          placeholder="أدخل الرمز الاحتياطي السري" 
                          className="text-right" 
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full bg-[#336699]">دخول للنظام</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-8 bg-white">
              <Button type="submit" className="w-full h-11 text-base font-bold bg-[#336699] hover:bg-[#2a5580] transition-colors shadow-lg">
                تسجيل الدخول
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm font-bold text-[#336699]">تم التطوير بواسطة: Abdallah Elshemey</p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>01102346158</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 opacity-50">© 2025 A-E Storage Ecosystem. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}

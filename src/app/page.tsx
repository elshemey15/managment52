
"use client";

import React, { useState, useEffect } from 'react';
import { useWarehouse } from './lib/store';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { login, currentUser } = useWarehouse();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username)) {
      router.push('/dashboard');
    } else {
      setError('Invalid username. Try "admin", "editor", or "logger".');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6ECF2] p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <div className="bg-[#336699] p-4 rounded-2xl shadow-xl">
            <Package className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <Card className="shadow-2xl border-none">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-[#336699]">تدفق المستودع</CardTitle>
            <CardDescription className="text-base">Enter your credentials to manage your inventory</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Username" 
                    className="pl-10 h-11"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="pl-10 h-11"
                    defaultValue="••••••••"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-destructive font-medium text-center">{error}</p>}
            </CardContent>
            <CardFooter className="pt-2 pb-8">
              <Button type="submit" className="w-full h-11 text-base font-semibold bg-[#336699] hover:bg-[#2a5580] transition-colors">
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Warehouse Flow System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

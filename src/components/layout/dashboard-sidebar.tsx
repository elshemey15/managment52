
"use client";

import React from 'react';
import { useWarehouse } from '@/app/lib/store';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Wallet,
  Layers,
  Scale,
  ShoppingCart,
  History
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
  const { currentUser, logout, isAdmin } = useWarehouse();
  const pathname = usePathname();

  const navItems = [
    { name: 'لوحة التحكم', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'الأقسام', icon: Layers, href: '/dashboard/departments' },
    { name: 'وحدات القياس', icon: Scale, href: '/dashboard/units' },
    { name: 'المستودع (المخزن)', icon: Package, href: '/dashboard/inventory' },
    { name: 'المشتريات (فواتير)', icon: ShoppingCart, href: '/dashboard/purchases' },
    { name: 'سجل الحركات', icon: History, href: '/dashboard/movements' },
    { name: 'الموردين والديون', icon: Users, href: '/dashboard/accounts' },
    { name: 'المصاريف العامة', icon: Wallet, href: '/dashboard/expenses' },
  ];

  if (isAdmin()) {
    navItems.push({ name: 'التقارير المالية', icon: BarChart3, href: '/dashboard/reports' });
    navItems.push({ name: 'إعدادات المستخدمين', icon: Settings, href: '/dashboard/settings' });
  }

  return (
    <Sidebar className="border-l" side="right">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Package className="h-5 w-5 text-accent-foreground" />
          </div>
          <h1 className="text-lg font-black tracking-tighter text-sidebar-foreground uppercase">A-E Storage</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-4 mb-2 text-right">النظام المحاسبي</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="w-full">
                    <Link href={item.href} className="flex items-center gap-3 py-2 px-4 rounded-md">
                      <item.icon className="h-5 w-5" />
                      <span className="font-bold">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="mb-4 px-2 text-right">
          <p className="text-[10px] text-sidebar-foreground/60">المستخدم: {currentUser?.username}</p>
          <span className="text-[10px] bg-sidebar-accent px-2 py-0.5 rounded-full mt-1">{currentUser?.role}</span>
        </div>
        <SidebarMenuButton onClick={logout} className="w-full flex items-center gap-3 py-2 px-4 rounded-md text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive">
          <LogOut className="h-5 w-5" />
          <span className="font-bold">تسجيل الخروج</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

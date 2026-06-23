
"use client";

import React from 'react';
import { useWarehouse } from '@/app/lib/store';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Users, 
  ReceiptArabic, 
  BarChart3, 
  Settings, 
  LogOut,
  Wallet,
  Tags
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
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Inventory', icon: Package, href: '/dashboard/inventory' },
    { name: 'Categories', icon: Tags, href: '/dashboard/categories' },
    { name: 'Movements', icon: ArrowLeftRight, href: '/dashboard/movements' },
    { name: 'Accounts & Debts', icon: Users, href: '/dashboard/accounts' },
    { name: 'Expenses', icon: Wallet, href: '/dashboard/expenses' },
  ];

  if (isAdmin()) {
    navItems.push({ name: 'Financial Reports', icon: BarChart3, href: '/dashboard/reports' });
    navItems.push({ name: 'User Settings', icon: Settings, href: '/dashboard/settings' });
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Package className="h-5 w-5 text-accent-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">تدفق المستودع</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-4 mb-2">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className="w-full transition-all duration-200"
                  >
                    <Link href={item.href} className="flex items-center gap-3 py-2 px-4 rounded-md">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="mb-4 px-2">
          <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
          <p className="font-semibold text-sm truncate">{currentUser?.username} ({currentUser?.role})</p>
        </div>
        <SidebarMenuButton 
          onClick={logout}
          className="w-full flex items-center gap-3 py-2 px-4 rounded-md text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

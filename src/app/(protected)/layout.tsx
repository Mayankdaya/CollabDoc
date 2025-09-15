
'use client';

import Link from 'next/link';
import {
  File,
  Settings,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { CollabDocLogo } from '@/components/collab-doc-logo';
import { UserMenu } from '@/components/user-menu';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Documents',
    icon: File,
  },
  {
    href: '/dashboard/online',
    label: 'Online',
    icon: Users,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
      <div className="flex min-h-screen w-full">
         <Sidebar>
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <CollabDocLogo className="h-7 w-7" />
                    <span className="text-xl font-bold font-headline">CollabDoc</span>
                </Link>
            </SidebarHeader>
            <SidebarContent className="overflow-auto">
                <SidebarMenu>
                    {menuItems.map(item => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton 
                                asChild
                                isActive={pathname === item.href}
                                tooltip={item.label}
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <UserMenu />
            </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
  );
}

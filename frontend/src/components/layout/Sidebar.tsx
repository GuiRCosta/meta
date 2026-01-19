'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard,
  Megaphone,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Rocket,
  Book,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Campanhas', href: '/campaigns', icon: Megaphone },
  { name: 'Agente IA', href: '/agent', icon: Bot },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Alertas', href: '/alerts', icon: Bell },
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Documentação', href: '/docs', icon: Book },
];

interface SidebarProps {
  budgetSpent?: number;
  budgetLimit?: number;
}

export function Sidebar({ budgetSpent = 2350, budgetLimit = 5000 }: SidebarProps) {
  const pathname = usePathname();
  const budgetPercentage = Math.min((budgetSpent / budgetLimit) * 100, 100);
  
  const getBudgetColor = (percentage: number) => {
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 80) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">
            Meta Campaigns
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Budget Widget */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-sidebar-foreground/70">
                💰 Orçamento Mensal
              </span>
              <span className={cn('text-xs font-bold', getBudgetColor(budgetPercentage))}>
                {budgetPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="mb-2">
              <span className="text-lg font-bold text-sidebar-foreground">
                R$ {budgetSpent.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm text-sidebar-foreground/50">
                {' '}/ R$ {budgetLimit.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-sidebar-border">
              <div
                className={cn('h-full transition-all', getProgressColor(budgetPercentage))}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* User / Logout */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

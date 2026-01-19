'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Plus, RefreshCw, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  const handleSync = async () => {
    setIsSyncing(true);
    // TODO: Implement sync with Meta API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left side - Title */}
      <div>
        {title && (
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Sync Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>

        {/* New Campaign Button */}
        <Button size="sm" className="gap-2" asChild>
          <a href="/campaigns/create">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </a>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {notifications}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

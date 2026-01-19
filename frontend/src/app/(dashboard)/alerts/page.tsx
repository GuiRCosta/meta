'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  RefreshCw,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  campaignId?: string;
  campaignName?: string;
  read: boolean;
  sentViaWhatsApp: boolean;
  createdAt: string;
}

const typeIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const typeColors = {
  error: 'text-destructive bg-destructive/10 border-destructive/30',
  warning: 'text-warning bg-warning/10 border-warning/30',
  info: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  success: 'text-success bg-success/10 border-success/30',
};

const priorityLabels = {
  high: { label: 'Alta', color: 'bg-destructive/20 text-destructive' },
  medium: { label: 'Média', color: 'bg-warning/20 text-warning' },
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
};

function AlertCard({ alert, onMarkRead }: { alert: Alert; onMarkRead: (id: string) => void }) {
  const Icon = typeIcons[alert.type];
  const colorClasses = typeColors[alert.type];
  const priority = priorityLabels[alert.priority];

  return (
    <Card className={`border-l-4 ${colorClasses} ${!alert.read ? 'bg-muted/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`rounded-full p-2 ${typeColors[alert.type]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${!alert.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                {alert.title}
              </h3>
              {!alert.read && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="outline" className={priority.color}>
                {priority.label}
              </Badge>
              {alert.campaignName && (
                <Link
                  href={`/campaigns/${alert.campaignId}`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {alert.campaignName}
                </Link>
              )}
              {alert.sentViaWhatsApp && (
                <span className="flex items-center gap-1">
                  📱 Enviado via WhatsApp
                </span>
              )}
              <span>{new Date(alert.createdAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>
          {!alert.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(alert.id)}
              className="shrink-0"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.set('unread', 'true');
      
      const response = await fetch(`/api/alerts?${params}`);
      const data = await response.json();
      
      if (data.alerts) {
        setAlerts(data.alerts);
        setUnreadCount(data.pagination?.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds: [alertId] }),
      });

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success('Alerta marcado como lido');
      }
    } catch (error) {
      toast.error('Erro ao marcar alerta');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (response.ok) {
        setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
        setUnreadCount(0);
        toast.success('Todos os alertas marcados como lidos');
      }
    } catch (error) {
      toast.error('Erro ao marcar alertas');
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    return true;
  });

  const groupedAlerts = {
    today: filteredAlerts.filter((a) => {
      const date = new Date(a.createdAt);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }),
    yesterday: filteredAlerts.filter((a) => {
      const date = new Date(a.createdAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return date.toDateString() === yesterday.toDateString();
    }),
    older: filteredAlerts.filter((a) => {
      const date = new Date(a.createdAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return date < new Date(yesterday.toDateString());
    }),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Alertas e Notificações
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} alerta(s) não lido(s)`
              : 'Todos os alertas foram lidos'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAlerts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todos como lidos
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              Não lidos
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="error">🔴 Erros</SelectItem>
            <SelectItem value="warning">🟡 Avisos</SelectItem>
            <SelectItem value="info">🔵 Informações</SelectItem>
            <SelectItem value="success">🟢 Sucessos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              Nenhum alerta encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'unread'
                ? 'Você não tem alertas não lidos.'
                : 'Você ainda não recebeu nenhum alerta.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {groupedAlerts.today.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Hoje</h2>
              {groupedAlerts.today.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}

          {/* Yesterday */}
          {groupedAlerts.yesterday.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Ontem</h2>
              {groupedAlerts.yesterday.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}

          {/* Older */}
          {groupedAlerts.older.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Anteriores</h2>
              {groupedAlerts.older.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

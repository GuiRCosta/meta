'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Play,
  Pause,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data for the dashboard
const stats = {
  totalCampaigns: 7,
  activeCampaigns: 5,
  pausedCampaigns: 2,
  todaySpend: 250.0,
  monthSpend: 2350.0,
  monthLimit: 5000.0,
  projectedSpend: 4850.0,
  impressions: 45000,
  clicks: 1200,
  ctr: 2.67,
  roas: 3.8,
};

const spendingData = [
  { day: 'Seg', spend: 180 },
  { day: 'Ter', spend: 220 },
  { day: 'Qua', spend: 195 },
  { day: 'Qui', spend: 280 },
  { day: 'Sex', spend: 250 },
  { day: 'Sáb', spend: 150 },
  { day: 'Dom', spend: 120 },
];

const topCampaigns = [
  { id: '1', name: 'E-commerce Premium', metric: 'CTR', value: '3.5%', trend: 'up' as const },
  { id: '2', name: 'Tráfego Site', metric: 'CPC', value: 'R$ 0,85', trend: 'down' as const },
  { id: '3', name: 'Conversões Q1', metric: 'ROAS', value: '4.2x', trend: 'up' as const },
];

const alerts = [
  {
    id: '1',
    type: 'error' as const,
    title: 'Campanha "Teste B" com CTR baixo',
    message: 'CTR atual: 1.2% (mínimo: 1.5%)',
  },
  {
    id: '2',
    type: 'warning' as const,
    title: '80% do orçamento mensal utilizado',
    message: 'R$ 4.000 de R$ 5.000',
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'Tendência negativa em "Promo Verão"',
    message: 'Conversões -15% vs. semana anterior',
  },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  suffix?: string;
  className?: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  suffix,
  className,
}: MetricCardProps) {
  return (
    <Card className={`bg-card border-border/50 ${className || ''}`}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-success' : 'text-destructive'
                }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-foreground">
            {value}
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetCard({ className }: { className?: string }) {
  const percentage = (stats.monthSpend / stats.monthLimit) * 100;
  const projectionSafe = stats.projectedSpend <= stats.monthLimit;

  return (
    <Card className={`bg-card border-border/50 flex flex-col justify-between ${className || ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            💰 Orçamento Mensal
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Janeiro
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              R$ {stats.monthSpend.toLocaleString('pt-BR')}
            </span>
            <span className="text-muted-foreground">
              / R$ {stats.monthLimit.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span
              className={`font-medium ${percentage >= 80
                ? 'text-destructive'
                : percentage >= 50
                  ? 'text-warning'
                  : 'text-success'
                }`}
            >
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${percentage >= 80
                ? 'bg-destructive'
                : percentage >= 50
                  ? 'bg-warning'
                  : 'bg-success'
                }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          {projectionSafe ? (
            <>
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm">
                <span className="font-medium">Projeção:</span> R${' '}
                {stats.projectedSpend.toLocaleString('pt-BR')}{' '}
                <Badge variant="outline" className="ml-1 text-success border-success/30">
                  ✓ Dentro do limite
                </Badge>
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm">
                <span className="font-medium">Projeção:</span> R${' '}
                {stats.projectedSpend.toLocaleString('pt-BR')}{' '}
                <Badge variant="outline" className="ml-1 text-destructive border-destructive/30">
                  ⚠ Acima do limite
                </Badge>
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


function SpendingChart() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          📈 Gastos (Últimos 7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Gasto']}
              />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TopCampaignsCard() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            🏆 Top Campanhas
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary" asChild>
            <a href="/campaigns">
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCampaigns.map((campaign, index) => (
          <div
            key={campaign.id}
            className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-foreground">{campaign.name}</p>
                <p className="text-xs text-muted-foreground">{campaign.metric}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{campaign.value}</span>
              {campaign.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AlertsCard({ compact = false }: { compact?: boolean }) {
  const getAlertStyles = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return 'border-destructive bg-destructive/10 hover:bg-destructive/15';
      case 'warning':
        return 'border-warning bg-warning/10 hover:bg-warning/15';
      case 'info':
        return 'border-primary bg-primary/10 hover:bg-primary/15';
    }
  };

  const getAlertIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'info':
        return <TrendingDown className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityBadge = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">Urgente</Badge>;
      case 'warning':
        return <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">Atenção</Badge>;
      case 'info':
        return <Badge variant="outline" className="text-xs">Info</Badge>;
    }
  };

  // Ordenar alertas por prioridade (error > warning > info)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { error: 0, warning: 1, info: 2 };
    return priority[a.type] - priority[b.type];
  });

  if (compact) {
    return (
      <Card className="bg-card border-border/50 border-l-4 border-l-destructive">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{alerts.length} alertas ativos</p>
                <p className="text-sm text-muted-foreground">
                  {alerts.filter(a => a.type === 'error').length} urgentes
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
              Ver todos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50 border-2 border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-lg font-semibold">
              Alertas Ativos
            </CardTitle>
            <Badge className="bg-destructive text-destructive-foreground">{alerts.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Marcar como lidos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-4 transition-colors cursor-pointer ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">{alert.title}</p>
                  {getPriorityBadge(alert.type)}
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0">
                Resolver
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const hasUrgentAlerts = alerts.some(a => a.type === 'error');

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas campanhas Meta
        </p>
      </div>

      {/* 🚨 ALERTAS - PRIORIDADE MÁXIMA (Primeiro elemento visível) */}
      {hasUrgentAlerts && <AlertsCard />}

      {/* Orçamento + Métricas Principais */}
      {/* Orçamento + Métricas Principais */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {/* Orçamento Mensal - 2 colunas */}
        <div className="lg:col-span-2 h-full">
          <BudgetCard className="h-full" />
        </div>

        {/* Gasto Hoje + ROAS - 1 coluna com Flex para ocupar altura total */}
        <div className="flex flex-col gap-6 h-full">
          <MetricCard
            title="Gasto Hoje"
            value={`R$ ${stats.todaySpend.toFixed(0)}`}
            icon={DollarSign}
            trend="up"
            trendValue="+12%"
            className="flex-1"
          />
          <MetricCard
            title="ROAS Médio"
            value={stats.roas}
            suffix="x"
            icon={TrendingUp}
            trend="up"
            trendValue="+22%"
            className="flex-1"
          />
        </div>
      </div>

      {/* Campanhas Status + KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Campanhas Ativas"
          value={stats.activeCampaigns}
          icon={Play}
        />
        <MetricCard
          title="Impressões Hoje"
          value={`${(stats.impressions / 1000).toFixed(1)}k`}
          icon={Eye}
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title="Cliques Hoje"
          value={`${(stats.clicks / 1000).toFixed(1)}k`}
          icon={MousePointerClick}
          trend="up"
          trendValue="+15%"
        />
        <MetricCard
          title="CTR Médio"
          value={`${stats.ctr}%`}
          icon={Target}
          trend="down"
          trendValue="-2%"
        />
      </div>

      {/* Gráfico de Gastos + Top Campanhas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart />
        <TopCampaignsCard />
      </div>

      {/* Alertas (se não houver urgentes, mostra todos aqui) */}
      {!hasUrgentAlerts && <AlertsCard />}
    </div>
  );
}

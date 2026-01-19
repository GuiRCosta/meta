'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data
const overviewStats = {
  spend: { value: 1750, change: 12 },
  impressions: { value: 125000, change: 8 },
  clicks: { value: 3800, change: 15 },
  conversions: { value: 320, change: 22 },
};

const chartData = [
  { day: 'Seg', spend: 220, impressions: 18000, clicks: 540, conversions: 45 },
  { day: 'Ter', spend: 280, impressions: 22000, clicks: 660, conversions: 58 },
  { day: 'Qua', spend: 250, impressions: 19500, clicks: 585, conversions: 48 },
  { day: 'Qui', spend: 310, impressions: 24000, clicks: 720, conversions: 62 },
  { day: 'Sex', spend: 290, impressions: 21500, clicks: 645, conversions: 52 },
  { day: 'Sáb', spend: 200, impressions: 12000, clicks: 360, conversions: 30 },
  { day: 'Dom', spend: 200, impressions: 8000, clicks: 290, conversions: 25 },
];

const campaignBreakdown = [
  { name: 'E-commerce', percentage: 42, spend: 735 },
  { name: 'Conversões', percentage: 30, spend: 525 },
  { name: 'Tráfego', percentage: 18, spend: 315 },
  { name: 'Outros', percentage: 10, spend: 175 },
];

const projections = {
  spendMonth: 4850,
  conversions: 520,
  roas: 3.8,
  trend: 12,
};

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percent';
}) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `R$ ${value.toLocaleString('pt-BR')}`;
      case 'percent':
        return `${value}%`;
      default:
        return value >= 1000
          ? `${(value / 1000).toFixed(1)}k`
          : value.toLocaleString('pt-BR');
    }
  };

  const isPositive = change > 0;

  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">{formatValue()}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{title}</span>
            <Badge
              variant="outline"
              className={
                isPositive
                  ? 'text-success border-success/30'
                  : 'text-destructive border-destructive/30'
              }
            >
              {isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {isPositive ? '+' : ''}
              {change}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');
  const [metric, setMetric] = useState('spend');

  const getChartData = () => {
    return chartData.map((item) => ({
      day: item.day,
      value: item[metric as keyof typeof item],
    }));
  };

  const getMetricLabel = () => {
    const labels: Record<string, string> = {
      spend: 'Gasto (R$)',
      impressions: 'Impressões',
      clicks: 'Cliques',
      conversions: 'Conversões',
    };
    return labels[metric];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Análise detalhada de performance das campanhas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="14d">Últimos 14 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gasto"
          value={overviewStats.spend.value}
          change={overviewStats.spend.change}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Impressões"
          value={overviewStats.impressions.value}
          change={overviewStats.impressions.change}
          icon={Eye}
        />
        <MetricCard
          title="Cliques"
          value={overviewStats.clicks.value}
          change={overviewStats.clicks.change}
          icon={MousePointerClick}
        />
        <MetricCard
          title="Conversões"
          value={overviewStats.conversions.value}
          change={overviewStats.conversions.change}
          icon={Target}
        />
      </div>

      {/* Main Chart */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-medium">
              📈 Evolução de Métricas
            </CardTitle>
            <Tabs value={metric} onValueChange={setMetric}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="spend">Gasto</TabsTrigger>
                <TabsTrigger value="impressions">Impressões</TabsTrigger>
                <TabsTrigger value="clicks">Cliques</TabsTrigger>
                <TabsTrigger value="conversions">Conversões</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) =>
                    metric === 'spend'
                      ? `R$${value}`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(0)}k`
                      : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [
                    metric === 'spend'
                      ? `R$ ${value.toFixed(2)}`
                      : value.toLocaleString('pt-BR'),
                    getMetricLabel(),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
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

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campaign Breakdown */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              🎯 Distribuição por Campanha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignBreakdown.map((campaign) => (
              <div key={campaign.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {campaign.name}
                  </span>
                  <span className="text-muted-foreground">
                    {campaign.percentage}% • R$ {campaign.spend}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${campaign.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projections */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              📊 Projeções do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Gasto Estimado</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {projections.spendMonth.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Conversões</p>
                <p className="text-2xl font-bold text-foreground">
                  ~{projections.conversions}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">ROAS Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  {projections.roas}x
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Tendência</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <p className="text-2xl font-bold text-success">
                    +{projections.trend}%
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <p className="text-sm text-success">
                ✅ Você está no caminho certo para atingir suas metas mensais!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

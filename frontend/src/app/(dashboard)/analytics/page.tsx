'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  RefreshCw,
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
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState({
    spend: { value: 0, change: 0 },
    impressions: { value: 0, change: 0 },
    clicks: { value: 0, change: 0 },
    conversions: { value: 0, change: 0 },
  });
  const [chartData, setChartData] = useState<Array<{ day: string; spend: number; impressions: number; clicks: number; conversions: number }>>([]);
  const [campaignBreakdown, setCampaignBreakdown] = useState<Array<{ name: string; percentage: number; spend: number }>>([]);
  const [projections, setProjections] = useState({
    spendMonth: 0,
    conversions: 0,
    roas: 0,
    trend: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de analytics');
      }

      const data = await response.json();
      
      setOverviewStats(data.overview);
      setChartData(data.chartData || []);
      setCampaignBreakdown(data.campaignBreakdown || []);
      setProjections(data.projections || { spendMonth: 0, conversions: 0, roas: 0, trend: 0 });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

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
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Select value={period} onValueChange={(value) => {
            setPeriod(value);
          }}>
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
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
      )}

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
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
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
          )}
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
            {loading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : campaignBreakdown.length > 0 ? (
              campaignBreakdown.map((campaign) => (
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma campanha com dados no período
              </p>
            )}
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
            {loading ? (
              <div className="grid gap-4 grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <>
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
                      {projections.roas.toFixed(1)}x
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Tendência</p>
                    <div className="flex items-center gap-2">
                      {projections.trend >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                      <p className={`text-2xl font-bold ${projections.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {projections.trend >= 0 ? '+' : ''}{projections.trend.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg border p-4 ${
                  projections.trend >= 0 
                    ? 'border-success/30 bg-success/5' 
                    : 'border-warning/30 bg-warning/5'
                }`}>
                  <p className={`text-sm ${projections.trend >= 0 ? 'text-success' : 'text-warning'}`}>
                    {projections.trend >= 0 
                      ? '✅ Você está no caminho certo para atingir suas metas mensais!'
                      : '⚠️ Atenção: Tendência negativa detectada. Considere revisar suas campanhas.'
                    }
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

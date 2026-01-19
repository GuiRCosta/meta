'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Users,
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
  AreaChart,
  Area,
} from 'recharts';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  metaId: string;
  name: string;
  objective: string;
  status: string;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  createdAt: string;
  updatedAt: string;
  adSets: Array<{
    id: string;
    name: string;
    status: string;
    dailyBudget: number | null;
    targeting: Record<string, unknown> | null;
    ads: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  }>;
  metrics: Array<{
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number | null;
    cpc: number | null;
  }>;
  totalMetrics?: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
  };
}

const objectiveLabels: Record<string, string> = {
  OUTCOME_SALES: 'Vendas',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_TRAFFIC: 'Tráfego',
  OUTCOME_ENGAGEMENT: 'Engajamento',
  OUTCOME_AWARENESS: 'Reconhecimento',
};

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm ${
                trend === 'up' ? 'text-success' : 'text-destructive'
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
      </CardContent>
    </Card>
  );
}

export default function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch campaign data
  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      const data = await response.json();
      
      if (data.campaign) {
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Erro ao carregar campanha');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(newStatus === 'ACTIVE' ? 'Campanha ativada!' : 'Campanha pausada!');
        fetchCampaign();
      } else {
        toast.error(data.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      toast.error('Erro ao atualizar campanha');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Campanha arquivada!');
        router.push('/campaigns');
      } else {
        toast.error(data.error || 'Erro ao arquivar campanha');
      }
    } catch (error) {
      toast.error('Erro ao arquivar campanha');
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success" />
            Ativa
          </Badge>
        );
      case 'PAUSED':
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-warning" />
            Pausada
          </Badge>
        );
      case 'ARCHIVED':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            Arquivada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Prepare chart data
  const chartData = campaign?.metrics?.map((m) => ({
    date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    spend: m.spend,
    clicks: m.clicks,
    conversions: m.conversions,
    impressions: m.impressions / 1000,
  })) || [];

  const metrics = campaign?.totalMetrics || {
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{campaign?.name}</h1>
                {campaign && getStatusBadge(campaign.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {objectiveLabels[campaign?.objective || ''] || campaign?.objective}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Criada em: {campaign && new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchCampaign}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {campaign?.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleStatusChange('PAUSED')}
              disabled={actionLoading}
            >
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
          ) : campaign?.status === 'PAUSED' ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleStatusChange('ACTIVE')}
              disabled={actionLoading}
            >
              <Play className="h-4 w-4" />
              Ativar
            </Button>
          ) : null}
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/campaigns/${id}/edit`}>
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={actionLoading}
          >
            <Trash2 className="h-4 w-4" />
            Arquivar
          </Button>
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gasto Total"
          value={`R$ ${metrics.spend.toFixed(2)}`}
          icon={DollarSign}
          loading={loading}
        />
        <MetricCard
          title="Impressões"
          value={metrics.impressions >= 1000 ? `${(metrics.impressions / 1000).toFixed(1)}k` : metrics.impressions}
          icon={Eye}
          loading={loading}
        />
        <MetricCard
          title="Cliques"
          value={metrics.clicks.toLocaleString('pt-BR')}
          icon={MousePointerClick}
          loading={loading}
        />
        <MetricCard
          title="CTR"
          value={`${metrics.ctr.toFixed(2)}%`}
          icon={BarChart3}
          loading={loading}
        />
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="CPC Médio"
          value={`R$ ${metrics.cpc.toFixed(2)}`}
          icon={DollarSign}
          loading={loading}
        />
        <MetricCard
          title="CPM"
          value={`R$ ${metrics.cpm.toFixed(2)}`}
          icon={DollarSign}
          loading={loading}
        />
        <MetricCard
          title="Conversões"
          value={metrics.conversions}
          icon={Target}
          loading={loading}
        />
        <MetricCard
          title="Ad Sets"
          value={campaign?.adSets?.length || 0}
          icon={Users}
          loading={loading}
        />
      </div>

      {/* Chart */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Performance (Últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : chartData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    name="Gasto (R$)"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#colorSpend)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="Cliques"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#colorClicks)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <p>Sem dados de métricas disponíveis</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ad Sets */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Conjuntos de Anúncios ({campaign?.adSets?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : campaign?.adSets && campaign.adSets.length > 0 ? (
              campaign.adSets.map((adSet) => (
                <div
                  key={adSet.id}
                  className="rounded-lg bg-muted/30 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{adSet.name}</p>
                    {getStatusBadge(adSet.status)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                    {adSet.dailyBudget && (
                      <span>R$ {adSet.dailyBudget.toFixed(2)}/dia</span>
                    )}
                    <span>•</span>
                    <span>{adSet.ads?.length || 0} anúncio(s)</span>
                    {adSet.targeting && (
                      <>
                        <span>•</span>
                        <span>
                          {(adSet.targeting as { ageMin?: number; ageMax?: number }).ageMin}-
                          {(adSet.targeting as { ageMin?: number; ageMax?: number }).ageMax} anos
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum conjunto de anúncios</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              ⚡ Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href={`/campaigns/${id}/edit`}>
                <Edit className="h-4 w-4" />
                Editar Campanha
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/analytics">
                <BarChart3 className="h-4 w-4" />
                Ver Analytics Detalhado
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/agent">
                <Target className="h-4 w-4" />
                Pedir Sugestões ao Agente IA
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                navigator.clipboard.writeText(campaign?.metaId || '');
                toast.success('Meta ID copiado!');
              }}
              disabled={!campaign?.metaId}
            >
              <DollarSign className="h-4 w-4" />
              Copiar Meta ID
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar Campanha</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja arquivar a campanha &quot;{campaign?.name}&quot;?
              Esta ação pode ser revertida posteriormente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'Arquivando...' : 'Arquivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

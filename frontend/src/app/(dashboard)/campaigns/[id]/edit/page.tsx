'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  metaId: string;
  name: string;
  objective: string;
  status: string;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
}

const objectives = [
  { value: 'OUTCOME_SALES', label: 'Vendas' },
  { value: 'OUTCOME_LEADS', label: 'Leads' },
  { value: 'OUTCOME_TRAFFIC', label: 'Tráfego' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engajamento' },
  { value: 'OUTCOME_AWARENESS', label: 'Reconhecimento' },
];

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [status, setStatus] = useState('PAUSED');
  const [dailyBudget, setDailyBudget] = useState('');
  const [isActive, setIsActive] = useState(false);

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
        const c = data.campaign;
        setCampaign(c);
        setName(c.name);
        setStatus(c.status);
        setDailyBudget(c.dailyBudget?.toString() || '');
        setIsActive(c.status === 'ACTIVE');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Erro ao carregar campanha');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          status: isActive ? 'ACTIVE' : 'PAUSED',
          dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Campanha atualizada com sucesso!');
        router.push(`/campaigns/${id}`);
      } else {
        toast.error(data.error || 'Erro ao atualizar campanha');
      }
    } catch (error) {
      toast.error('Erro ao atualizar campanha');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Campanha não encontrada
        </h2>
        <p className="text-muted-foreground mb-4">
          A campanha que você está tentando editar não existe.
        </p>
        <Button asChild>
          <Link href="/campaigns">Voltar para Campanhas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/campaigns/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Campanha</h1>
          <p className="text-sm text-muted-foreground">
            Meta ID: {campaign.metaId}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Campanha</CardTitle>
            <CardDescription>
              Atualize os dados da sua campanha. Algumas alterações podem levar alguns minutos para refletir no Meta Ads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Campanha</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Vendas_Produto_Janeiro2026"
                required
              />
            </div>

            {/* Objective (readonly) */}
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Select value={campaign.objective} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {objectives.map((obj) => (
                    <SelectItem key={obj.value} value={obj.value}>
                      {obj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                O objetivo não pode ser alterado após a criação da campanha.
              </p>
            </div>

            {/* Daily Budget */}
            <div className="space-y-2">
              <Label htmlFor="dailyBudget">Orçamento Diário (R$)</Label>
              <Input
                id="dailyBudget"
                type="number"
                step="0.01"
                min="1"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                placeholder="Ex: 50.00"
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para manter o orçamento atual.
              </p>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="active">Campanha Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar ou pausar a veiculação da campanha
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Warning */}
            {campaign.status !== (isActive ? 'ACTIVE' : 'PAUSED') && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <p className="text-sm text-warning">
                  ⚠️ Você está alterando o status da campanha de{' '}
                  <strong>{campaign.status === 'ACTIVE' ? 'Ativa' : 'Pausada'}</strong> para{' '}
                  <strong>{isActive ? 'Ativa' : 'Pausada'}</strong>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href={`/campaigns/${id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

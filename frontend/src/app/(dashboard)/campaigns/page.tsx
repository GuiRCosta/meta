'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Filter,
  Copy,
  CheckSquare,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';

// Tipo para campanha
interface Campaign {
  id: string;
  metaId?: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'PREPAUSED';
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  roas?: number | null;
}

const getStatusBadge = (status: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'PREPAUSED' | 'ARCHIVED') => {
  if (status === 'ACTIVE') {
    return (
      <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success" />
        Ativa
      </Badge>
    );
  }
  if (status === 'DRAFT') {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
        Rascunho
      </Badge>
    );
  }
  if (status === 'PREPAUSED') {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
        Pré-pausada
      </Badge>
    );
  }
  if (status === 'ARCHIVED') {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-gray-500" />
        Arquivada
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground">
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Pausada
    </Badge>
  );
};

const getObjectiveLabel = (objective: string) => {
  const labels: Record<string, string> = {
    CONVERSIONS: 'Conversões',
    TRAFFIC: 'Tráfego',
    REACH: 'Alcance',
    AWARENESS: 'Reconhecimento',
    ENGAGEMENT: 'Engajamento',
    LEADS: 'Leads',
    SALES: 'Vendas',
  };
  return labels[objective] || objective;
};

const getCtrColor = (ctr: number) => {
  if (ctr >= 3) return 'text-success';
  if (ctr >= 2) return 'text-foreground';
  if (ctr >= 1.5) return 'text-warning';
  return 'text-destructive';
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Buscar campanhas ao carregar e quando filtros mudarem
  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, limit]);

  // Buscar quando pesquisa mudar (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // Construir URL com parâmetros
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('limit', limit.toString());
      params.append('offset', '0');
      
      const response = await fetch(`/api/campaigns?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.details || 'Erro ao buscar campanhas';
        console.error('Error fetching campaigns:', errorMsg);
        toast.error(errorMsg);
        // Manter campanhas existentes mesmo se houver erro
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API returned error:', data.error);
        toast.error(data.error);
        // Manter campanhas existentes mesmo se houver erro
        return;
      }
      
      if (data.campaigns) {
        // Atualizar informações de paginação
        if (data.pagination) {
          setTotal(data.pagination.total || 0);
          setHasMore(data.pagination.hasMore || false);
        }
        
        // Converter dados da API para o formato esperado
        const formattedCampaigns: Campaign[] = data.campaigns.map((camp: any) => ({
          id: camp.id,
          metaId: camp.metaId,
          name: camp.name,
          status: camp.status as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'PREPAUSED',
          objective: camp.objective || 'UNKNOWN',
          spend: camp.spend || 0,
          impressions: camp.impressions || 0,
          clicks: camp.clicks || 0,
          ctr: camp.ctr || 0,
          roas: camp.roas || null,
        }));
        setCampaigns(formattedCampaigns);
      } else {
        // Se não há campanhas, definir como array vazio
        setCampaigns([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao carregar campanhas';
      toast.error(errorMsg);
      // Manter campanhas existentes mesmo se houver erro
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Sincronizando campanhas do Meta...');
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Tratar rate limiting especificamente
        if (response.status === 429 || (data.error && (data.error.includes('requisições') || data.error.includes('rate limit')))) {
          toast.error(
            data.error || 'Muitas requisições à Meta API. Aguarde alguns minutos antes de tentar novamente.',
            {
              id: toastId,
              duration: 5000,
            }
          );
        } else {
          const errorMsg = data.error || 'Erro ao sincronizar campanhas';
          const details = data.details ? `: ${data.details}` : '';
          toast.error(errorMsg + details, {
            id: toastId,
          });
        }
        return;
      }

      toast.success(data.message || 'Campanhas sincronizadas com sucesso!', {
        id: toastId,
      });
      // Recarregar campanhas após sincronização
      await fetchCampaigns();
    } catch (error) {
      console.error('Error syncing:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro ao sincronizar campanhas. Verifique se o backend está rodando.';
      toast.error(errorMsg, {
        id: toastId,
        duration: 5000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStatusChange = async (campaignId: string, metaId: string | undefined, newStatus: 'ACTIVE' | 'PAUSED') => {
    if (!metaId) {
      toast.error('Esta campanha não tem ID do Meta. Sincronize primeiro.');
      return;
    }

    try {
      const toastId = toast.loading(`${newStatus === 'ACTIVE' ? 'Ativando' : 'Pausando'} campanha...`);
      
      // Atualizar via API local (que deve chamar Meta API)
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Campanha ${newStatus === 'ACTIVE' ? 'ativada' : 'pausada'}!`, { id: toastId });
        await fetchCampaigns(); // Recarregar lista
      } else {
        toast.error(data.error || 'Erro ao atualizar campanha', { id: toastId });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status da campanha');
    }
  };


  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [duplicateCount, setDuplicateCount] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, useCampaignToDelete] = useState<string | null>(null);

  // Estado para seleção múltipla
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'ACTIVE' | 'PAUSED' | 'ARCHIVED' | null>(null);

  const handleDuplicateClick = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setDuplicateCount(1);
    setDuplicateDialogOpen(true);
  };

  const handleDeleteClick = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setDeleteDialogOpen(true);
  };

  // Funções de seleção múltipla
  const toggleSelectAll = () => {
    if (selectedCampaigns.size === filteredCampaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const toggleCampaign = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    setSelectedCampaigns(newSelected);
  };

  const isCampaignSelected = (campaignId: string) => selectedCampaigns.has(campaignId);

  // Ações em lote
  const openBulkActionDialog = (actionType: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => {
    setBulkActionType(actionType);
    setBulkActionDialogOpen(true);
  };

  const handleBulkAction = async () => {
    if (!bulkActionType || selectedCampaigns.size === 0) return;

    const campaignIds = Array.from(selectedCampaigns);
    const actionLabel = bulkActionType === 'ACTIVE' ? 'ativar' : bulkActionType === 'PAUSED' ? 'pausar' : 'arquivar';
    const toastId = toast.loading(`${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} ${selectedCampaigns.size} campanha(s)...`);

    try {
      const response = await fetch('/api/campaigns/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignIds,
          action: bulkActionType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || `${selectedCampaigns.size} campanha(s) ${actionLabel}da(s) com sucesso!`, { id: toastId });
        setSelectedCampaigns(new Set());
        await fetchCampaigns();
      } else {
        toast.error(data.error || `Erro ao ${actionLabel} campanhas`, { id: toastId });
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error(`Erro ao ${actionLabel} campanhas`, { id: toastId });
    } finally {
      setBulkActionDialogOpen(false);
      setBulkActionType(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;

    const toastId = toast.loading('Arquivando campanha...');

    try {
      const response = await fetch(`/api/campaigns/${campaignToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Campanha arquivada com sucesso!', { id: toastId });
        await fetchCampaigns();
      } else {
        toast.error(data.error || 'Erro ao arquivar campanha', { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erro ao arquivar campanha', { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!selectedCampaignId) return;

    // Feedback visual inicial
    const toastId = toast.loading('Duplicando campanha...');

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaignId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: duplicateCount }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, {
          id: toastId,
          description: 'As campanhas aparecerão na lista em instantes.'
        });
        
        // Recarregar campanhas
        await fetchCampaigns();
      } else {
        toast.error(data.error || 'Erro ao duplicar campanha', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Erro ao duplicar campanha', {
        id: toastId,
      });
    } finally {
      setDuplicateDialogOpen(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // Filtrar por status
    let matchesStatus = false;
    if (statusFilter === 'all') {
      // Quando 'all', excluir campanhas arquivadas
      matchesStatus = campaign.status !== 'ARCHIVED';
    } else {
      matchesStatus = campaign.status.toLowerCase() === statusFilter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas campanhas do Meta
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/campaigns/create">
              <Plus className="h-4 w-4" />
              Nova Campanha
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedCampaigns.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedCampaigns.size} campanha(s) selecionada(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCampaigns(new Set())}
                  className="text-muted-foreground"
                >
                  Limpar seleção
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('ACTIVE')}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Ativar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('PAUSED')}
                  className="gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pausar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBulkActionDialog('ARCHIVED')}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Arquivar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              {loading ? 'Carregando...' : `${filteredCampaigns.length} de ${total} campanha${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="limit" className="text-sm text-muted-foreground">
                Mostrar:
              </Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger id="limit" className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Carregando campanhas...
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma campanha encontrada. Clique em "Sincronizar" para buscar campanhas do Meta.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={toggleSelectAll}
                        className="h-5 w-5 rounded border-2 border-muted-foreground/30 hover:border-primary transition-colors flex items-center justify-center"
                      >
                        {selectedCampaigns.size > 0 && selectedCampaigns.size === filteredCampaigns.length && (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        )}
                        {selectedCampaigns.size > 0 && selectedCampaigns.size < filteredCampaigns.length && (
                          <Layers className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    </div>
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead className="text-right">Gasto</TableHead>
                  <TableHead className="text-right">Impressões</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  className={`cursor-pointer hover:bg-muted/30 ${isCampaignSelected(campaign.id) ? 'bg-primary/5' : ''}`}
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCampaign(campaign.id);
                        }}
                        className={`h-5 w-5 rounded border-2 transition-colors flex items-center justify-center ${
                          isCampaignSelected(campaign.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 hover:border-primary'
                        }`}
                      >
                        {isCampaignSelected(campaign.id) && (
                          <CheckSquare className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {campaign.name}
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {getObjectiveLabel(campaign.objective)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    R$ {campaign.spend.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {campaign.impressions.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {campaign.clicks.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${getCtrColor(campaign.ctr)}`}
                  >
                    {campaign.ctr}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {campaign.roas ? `${campaign.roas}x` : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/campaigns/${campaign.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/campaigns/${campaign.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateClick(campaign.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        {campaign.status === 'ACTIVE' ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, campaign.metaId, 'PAUSED')}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        ) : campaign.status === 'PAUSED' ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, campaign.metaId, 'ACTIVE')}>
                            <Play className="mr-2 h-4 w-4" />
                            Ativar
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(campaign.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>


      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Campanha</DialogTitle>
            <DialogDescription>
              Quantas cópias desta campanha você deseja criar?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="copies" className="text-right">
                Cópias
              </Label>
              <Input
                id="copies"
                type="number"
                min={1}
                max={200}
                value={duplicateCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val)) return; // Allow empty briefly or handle differently? Actually just ignore invalid
                  setDuplicateCount(Math.min(200, Math.max(1, val)));
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmDuplicate}>
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar Campanha</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja arquivar esta campanha?
              Esta ação pode ser revertida posteriormente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Arquivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionType === 'ACTIVE' ? 'Ativar Campanhas' : bulkActionType === 'PAUSED' ? 'Pausar Campanhas' : 'Arquivar Campanhas'}
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja {bulkActionType === 'ACTIVE' ? 'ativar' : bulkActionType === 'PAUSED' ? 'pausar' : 'arquivar'} {selectedCampaigns.size} campanha(s)?
              {bulkActionType === 'ARCHIVED' && '\n\nEsta ação pode ser revertida posteriormente.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={bulkActionType === 'ARCHIVED' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
            >
              {bulkActionType === 'ACTIVE' ? 'Ativar' : bulkActionType === 'PAUSED' ? 'Pausar' : 'Arquivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const campaigns = [
  {
    id: '1',
    name: 'E-commerce Premium',
    status: 'ACTIVE' as const,
    objective: 'CONVERSIONS',
    spend: 850,
    impressions: 25500,
    clicks: 890,
    ctr: 3.5,
    roas: 4.2,
  },
  {
    id: '2',
    name: 'Tráfego Site Principal',
    status: 'ACTIVE' as const,
    objective: 'TRAFFIC',
    spend: 320,
    impressions: 15000,
    clicks: 420,
    ctr: 2.8,
    roas: null,
  },
  {
    id: '3',
    name: 'Conversões Q1 2024',
    status: 'ACTIVE' as const,
    objective: 'CONVERSIONS',
    spend: 580,
    impressions: 18500,
    clicks: 390,
    ctr: 2.1,
    roas: 3.8,
  },
  {
    id: '4',
    name: 'Teste A - Público Jovem',
    status: 'ACTIVE' as const,
    objective: 'REACH',
    spend: 200,
    impressions: 45000,
    clicks: 675,
    ctr: 1.5,
    roas: null,
  },
  {
    id: '5',
    name: 'Teste B - Remarketing',
    status: 'ACTIVE' as const,
    objective: 'TRAFFIC',
    spend: 150,
    impressions: 12500,
    clicks: 150,
    ctr: 1.2,
    roas: 1.5,
  },
  {
    id: '6',
    name: 'Promo Verão 2024',
    status: 'PAUSED' as const,
    objective: 'CONVERSIONS',
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0.8,
    roas: 2.1,
  },
  {
    id: '7',
    name: 'Black Friday 2023',
    status: 'PAUSED' as const,
    objective: 'CONVERSIONS',
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 4.2,
    roas: 5.8,
  },
];

const getStatusBadge = (status: 'ACTIVE' | 'PAUSED') => {
  if (status === 'ACTIVE') {
    return (
      <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-success" />
        Ativa
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      campaign.status.toLowerCase() === statusFilter.toLowerCase();
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

      {/* Campaigns Table */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-medium">
            {filteredCampaigns.length} campanha
            {filteredCampaigns.length !== 1 ? 's' : ''} encontrada
            {filteredCampaigns.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
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
                  className="cursor-pointer hover:bg-muted/30"
                >
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {campaign.status === 'ACTIVE' ? (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pausar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Ativar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
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
        </CardContent>
      </Card>
    </div>
  );
}

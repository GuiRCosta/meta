'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Loader2,
  Send,
  Check,
  Settings,
  DollarSign,
  Bell,
  Key,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Budget settings
  const [monthlyLimit, setMonthlyLimit] = useState('5000');
  const [alertAt50, setAlertAt50] = useState(true);
  const [alertAt80, setAlertAt80] = useState(true);
  const [alertAt100, setAlertAt100] = useState(true);
  const [alertProjection, setAlertProjection] = useState(true);
  const [conversionGoal, setConversionGoal] = useState('300');
  const [roasGoal, setRoasGoal] = useState('3.0');

  // Notification settings
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('+55 11 99999-9999');
  const [dailyReportTime, setDailyReportTime] = useState('18:00');
  const [sendDailyReports, setSendDailyReports] = useState(true);
  const [sendAlerts, setSendAlerts] = useState(true);
  const [sendSuggestions, setSendSuggestions] = useState(true);
  const [sendStatusChanges, setSendStatusChanges] = useState(true);

  // Alert limits
  const [cpcMax, setCpcMax] = useState('2.00');
  const [ctrMin, setCtrMin] = useState('1.5');
  const [roasMin, setRoasMin] = useState('2.0');

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast.success('Configurações salvas com sucesso!');
  };

  const handleTestMessage = async () => {
    setIsTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTesting(false);
    toast.success('Mensagem de teste enviada!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="budget" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="budget" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Orçamento
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Settings className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            Meta API
          </TabsTrigger>
        </TabsList>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>💰 Orçamento e Metas</CardTitle>
              <CardDescription>
                Configure limites de gastos e metas mensais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Monthly Limit */}
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">Limite de Gastos Mensal (R$)</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Valor máximo a ser investido por mês
                </p>
              </div>

              {/* Budget Alerts */}
              <div className="space-y-4">
                <Label>Alertas de Orçamento</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Alertar em 50%</p>
                      <p className="text-sm text-muted-foreground">
                        Quando atingir metade do limite
                      </p>
                    </div>
                    <Switch checked={alertAt50} onCheckedChange={setAlertAt50} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Alertar em 80%</p>
                      <p className="text-sm text-muted-foreground">
                        Alerta crítico de orçamento
                      </p>
                    </div>
                    <Switch checked={alertAt80} onCheckedChange={setAlertAt80} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Alertar em 100%</p>
                      <p className="text-sm text-muted-foreground">
                        Quando limite for atingido
                      </p>
                    </div>
                    <Switch
                      checked={alertAt100}
                      onCheckedChange={setAlertAt100}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Projeção de Estouro</p>
                      <p className="text-sm text-muted-foreground">
                        Se projeção ultrapassar limite
                      </p>
                    </div>
                    <Switch
                      checked={alertProjection}
                      onCheckedChange={setAlertProjection}
                    />
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="conversionGoal">Meta de Conversões</Label>
                  <Input
                    id="conversionGoal"
                    type="number"
                    value={conversionGoal}
                    onChange={(e) => setConversionGoal(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Número de conversões mensais desejadas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roasGoal">Meta de ROAS</Label>
                  <div className="relative">
                    <Input
                      id="roasGoal"
                      type="number"
                      step="0.1"
                      value={roasGoal}
                      onChange={(e) => setRoasGoal(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      x
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Retorno mínimo esperado sobre investimento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </CardTitle>
              <CardDescription>
                Configure notificações via WhatsApp (Evolution API)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Notificações WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas e relatórios via WhatsApp
                  </p>
                </div>
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>

              {whatsappEnabled && (
                <>
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
                    <Input
                      id="whatsappNumber"
                      placeholder="+55 11 99999-9999"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>

                  {/* Daily Report Time */}
                  <div className="space-y-2">
                    <Label>Horário do Relatório Diário</Label>
                    <Select
                      value={dailyReportTime}
                      onValueChange={setDailyReportTime}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          '08:00',
                          '09:00',
                          '10:00',
                          '12:00',
                          '14:00',
                          '16:00',
                          '18:00',
                          '20:00',
                        ].map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notification Types */}
                  <div className="space-y-4">
                    <Label>Tipos de Notificação</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">Relatórios Diários</p>
                          <p className="text-sm text-muted-foreground">
                            Resumo diário das campanhas
                          </p>
                        </div>
                        <Switch
                          checked={sendDailyReports}
                          onCheckedChange={setSendDailyReports}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">Alertas Imediatos</p>
                          <p className="text-sm text-muted-foreground">
                            Problemas e limites atingidos
                          </p>
                        </div>
                        <Switch
                          checked={sendAlerts}
                          onCheckedChange={setSendAlerts}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">Sugestões</p>
                          <p className="text-sm text-muted-foreground">
                            Oportunidades de otimização
                          </p>
                        </div>
                        <Switch
                          checked={sendSuggestions}
                          onCheckedChange={setSendSuggestions}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">Status de Campanhas</p>
                          <p className="text-sm text-muted-foreground">
                            Criação, pausa, ativação
                          </p>
                        </div>
                        <Switch
                          checked={sendStatusChanges}
                          onCheckedChange={setSendStatusChanges}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Button */}
                  <Button
                    variant="outline"
                    onClick={handleTestMessage}
                    disabled={isTesting}
                    className="gap-2"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Testar Envio
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>⚠️ Limites de Alerta</CardTitle>
              <CardDescription>
                Configure quando você deve ser alertado sobre métricas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cpcMax">CPC Máximo (R$)</Label>
                  <Input
                    id="cpcMax"
                    type="number"
                    step="0.10"
                    value={cpcMax}
                    onChange={(e) => setCpcMax(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alertar se CPC ultrapassar este valor
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctrMin">CTR Mínimo (%)</Label>
                  <Input
                    id="ctrMin"
                    type="number"
                    step="0.1"
                    value={ctrMin}
                    onChange={(e) => setCtrMin(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alertar se CTR ficar abaixo deste valor
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roasMin">ROAS Mínimo</Label>
                  <div className="relative">
                    <Input
                      id="roasMin"
                      type="number"
                      step="0.1"
                      value={roasMin}
                      onChange={(e) => setRoasMin(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      x
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alertar se ROAS ficar abaixo deste valor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle>🔑 Meta API</CardTitle>
              <CardDescription>
                Configure suas credenciais do Meta Marketing API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">Conectado</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sua conta Meta está conectada e funcionando
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">App ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      •••••••••1234
                    </p>
                  </div>
                  <Badge variant="outline">Configurado</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Ad Account ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      act_•••••••5678
                    </p>
                  </div>
                  <Badge variant="outline">Configurado</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Access Token</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      EAA•••••••••
                    </p>
                  </div>
                  <Badge variant="outline" className="text-success border-success/30">
                    Válido
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                As credenciais são configuradas via variáveis de ambiente. Para
                atualizar, modifique o arquivo{' '}
                <code className="rounded bg-muted px-1 py-0.5">.env.local</code>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

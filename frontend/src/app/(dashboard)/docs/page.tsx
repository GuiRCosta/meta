'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Book,
  Zap,
  MessageSquare,
  Database,
  ExternalLink,
  Copy,
  Check,
  Server,
  Shield,
  HelpCircle,
  Rocket,
  Bot,
  BarChart3,
  Bell,
  Workflow,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Book className="h-6 w-6" />
          Documentação
        </h1>
        <p className="text-muted-foreground">
          Guia de referência das APIs e integrações do sistema
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="about" className="gap-1 text-xs">
            <Rocket className="h-3 w-3" />
            Sobre
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-1 text-xs">
            <Bot className="h-3 w-3" />
            Agentes
          </TabsTrigger>
          <TabsTrigger value="meta" className="gap-1 text-xs">
            <Zap className="h-3 w-3" />
            Meta API
          </TabsTrigger>
          <TabsTrigger value="evolution" className="gap-1 text-xs">
            <MessageSquare className="h-3 w-3" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-1 text-xs">
            <Database className="h-3 w-3" />
            Banco
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-1 text-xs">
            <Shield className="h-3 w-3" />
            Auth
          </TabsTrigger>
        </TabsList>

        {/* AGENTES IA */}
        <TabsContent value="agents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-cyan-500" />
                Agentes de IA (Agno Framework)
              </CardTitle>
              <CardDescription>
                Time de agentes especializados em Meta Ads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Arquitetura */}
              <div>
                <h4 className="font-medium mb-3">Arquitetura Multi-Agente</h4>
                <div className="bg-muted/30 p-4 rounded-lg text-center font-mono text-sm">
                  <div className="border border-primary rounded-lg p-2 mb-2">
                    🎯 COORDENADOR
                  </div>
                  <div className="text-muted-foreground mb-2">↓ delega tarefas ↓</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="border border-green-500/50 rounded p-2 text-xs">
                      🚀 Criador
                    </div>
                    <div className="border border-blue-500/50 rounded p-2 text-xs">
                      📊 Analisador
                    </div>
                    <div className="border border-yellow-500/50 rounded p-2 text-xs">
                      🔧 Otimizador
                    </div>
                    <div className="border border-purple-500/50 rounded p-2 text-xs">
                      📱 Notificador
                    </div>
                  </div>
                </div>
              </div>

              {/* Agentes */}
              <div className="space-y-4">
                {/* Coordenador */}
                <AgentCard
                  name="Coordenador"
                  emoji="🎯"
                  role="Orquestrador principal"
                  color="text-primary"
                  description="Entende a intenção do usuário e delega para os agentes especialistas. Consolida respostas e mantém contexto da conversa."
                  capabilities={[
                    'Identifica intenção do usuário',
                    'Delega para agente correto',
                    'Consolida respostas de múltiplos agentes',
                    'Mantém contexto da conversa',
                  ]}
                  example="Usuário: 'Quero criar uma campanha de vendas e ver como estão as atuais' → Delega para Criador + Analisador"
                />

                {/* Criador */}
                <AgentCard
                  name="Criador"
                  emoji="🚀"
                  role="Especialista em criação"
                  color="text-green-500"
                  description="Cria campanhas, ad sets e anúncios com configurações otimizadas. Sugere públicos, orçamentos e criativos."
                  capabilities={[
                    'Cria campanhas com todos os objetivos',
                    'Configura públicos e segmentação',
                    'Sugere orçamentos por objetivo',
                    'Recomenda formatos de anúncio',
                  ]}
                  example="'Criar campanha de vendas para e-commerce' → Sugere objetivo CONVERSÕES, orçamento R$ 100/dia, público baseado em compradores"
                />

                {/* Analisador */}
                <AgentCard
                  name="Analisador"
                  emoji="📊"
                  role="Especialista em métricas"
                  color="text-blue-500"
                  description="Analisa performance, identifica tendências e anomalias. Compara períodos e faz projeções."
                  capabilities={[
                    'Interpreta CTR, CPC, ROAS, CPA',
                    'Detecta anomalias e tendências',
                    'Compara com benchmarks do mercado',
                    'Projeta resultados futuros',
                  ]}
                  example="'Como está minha campanha?' → 'CTR 0.8% 🔴 abaixo do benchmark (1.5%). Sugestão: testar novos criativos'"
                />

                {/* Otimizador */}
                <AgentCard
                  name="Otimizador"
                  emoji="🔧"
                  role="Especialista em ROI"
                  color="text-yellow-500"
                  description="Otimiza orçamentos, ajusta lances, identifica desperdício. Sugere ações para melhorar resultados."
                  capabilities={[
                    'Realoca orçamento entre campanhas',
                    'Escala vencedores, pausa perdedores',
                    'Sugere testes A/B',
                    'Estima impacto de otimizações',
                  ]}
                  example="'Otimizar campanhas' → 'Pausar Campanha A (ROAS 0.5x), Escalar Campanha B +30% (ROAS 4.2x). Economia: R$ 500/mês'"
                />

                {/* Notificador */}
                <AgentCard
                  name="Notificador"
                  emoji="📱"
                  role="Especialista em comunicação"
                  color="text-purple-500"
                  description="Envia relatórios e alertas via WhatsApp. Formata mensagens claras e acionáveis."
                  capabilities={[
                    'Relatório diário às 18:00',
                    'Alertas de orçamento (50%, 80%, 100%)',
                    'Alertas de performance (CTR, ROAS)',
                    'Sugestões de otimização',
                  ]}
                  example="🚨 ALERTA: Campanha 'Black Friday' com CTR 0.4% (mínimo 1.0%). Responda 'pausar' para pausar agora."
                />
              </div>

              {/* Fluxo de Decisão */}
              <div>
                <h4 className="font-medium mb-3">Quando Cada Agente é Acionado</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { trigger: 'criar, nova campanha, lançar', agent: 'Criador', color: 'text-green-500' },
                    { trigger: 'analisar, como está, performance, métricas', agent: 'Analisador', color: 'text-blue-500' },
                    { trigger: 'otimizar, melhorar, ajustar, escalar', agent: 'Otimizador', color: 'text-yellow-500' },
                    { trigger: 'enviar, notificar, relatório, whatsapp', agent: 'Notificador', color: 'text-purple-500' },
                  ].map((item) => (
                    <div key={item.agent} className="flex items-center gap-3 bg-muted/30 p-2 rounded">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                        "{item.trigger}"
                      </code>
                      <span className="text-muted-foreground">→</span>
                      <span className={`font-medium ${item.color}`}>{item.agent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOBRE A APLICAÇÃO */}
        <TabsContent value="about" className="space-y-4 mt-4">
          {/* Como Funciona */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Como Funciona
              </CardTitle>
              <CardDescription>
                Visão geral do funcionamento da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fluxo Principal */}
              <div>
                <h4 className="font-medium mb-3">Fluxo Principal</h4>
                <div className="space-y-3">
                  {[
                    {
                      step: '1',
                      title: 'Conectar Meta Ads',
                      desc: 'Configure suas credenciais da Meta (App ID, Token) em Configurações',
                      icon: Zap,
                      color: 'text-blue-500',
                    },
                    {
                      step: '2',
                      title: 'Sincronizar Campanhas',
                      desc: 'Clique em "Sincronizar" para importar suas campanhas existentes',
                      icon: BarChart3,
                      color: 'text-green-500',
                    },
                    {
                      step: '3',
                      title: 'Monitorar Performance',
                      desc: 'Acompanhe métricas em tempo real no Dashboard e Analytics',
                      icon: BarChart3,
                      color: 'text-purple-500',
                    },
                    {
                      step: '4',
                      title: 'Receber Alertas',
                      desc: 'Seja notificado sobre problemas, orçamento e otimizações',
                      icon: Bell,
                      color: 'text-orange-500',
                    },
                    {
                      step: '5',
                      title: 'Usar o Agente IA',
                      desc: 'Crie e otimize campanhas conversando com a inteligência artificial',
                      icon: Bot,
                      color: 'text-cyan-500',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conectar Meta Ads - Guia Detalhado */}
              <div className="border-t border-border pt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Guia: Conectar Meta Ads
                </h4>
                
                {/* Passo 1 - Criar App */}
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="font-medium text-blue-400 mb-2">Passo 1: Criar App no Meta for Developers</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Acesse <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com</a></li>
                      <li>Clique em <strong>"Meus Apps"</strong> → <strong>"Criar App"</strong></li>
                      <li>Selecione <strong>"Empresa"</strong> como tipo de app</li>
                      <li>Preencha nome do app (ex: "Meta Campaign Manager")</li>
                      <li>Selecione o Business Manager associado</li>
                      <li>Após criar, vá em <strong>"Configurações"</strong> → <strong>"Básico"</strong></li>
                      <li>Copie o <strong>App ID</strong> e <strong>App Secret</strong></li>
                    </ol>
                  </div>

                  {/* Passo 2 - Access Token */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="font-medium text-green-400 mb-2">Passo 2: Gerar Access Token</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>No app, vá em <strong>"Ferramentas"</strong> → <strong>"Graph API Explorer"</strong></li>
                      <li>Ou acesse <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Graph API Explorer</a></li>
                      <li>Selecione seu App no dropdown</li>
                      <li>Clique em <strong>"Gerar Token de Acesso"</strong></li>
                      <li>Selecione as permissões necessárias (veja abaixo)</li>
                      <li>Copie o token gerado</li>
                    </ol>
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <p className="font-medium text-foreground mb-1">⚠️ Token de Curta Duração vs Longa Duração:</p>
                      <p className="text-muted-foreground">O token do Explorer expira em ~1h. Para produção, use o <strong>System User Token</strong> que não expira.</p>
                    </div>
                  </div>

                  {/* Passo 3 - Permissões */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <p className="font-medium text-purple-400 mb-2">Passo 3: Permissões Necessárias</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { perm: 'ads_management', desc: 'Gerenciar campanhas' },
                        { perm: 'ads_read', desc: 'Ler campanhas e métricas' },
                        { perm: 'business_management', desc: 'Acessar Business Manager' },
                        { perm: 'pages_read_engagement', desc: 'Ler dados de páginas' },
                        { perm: 'pages_show_list', desc: 'Listar páginas' },
                        { perm: 'leads_retrieval', desc: 'Acessar leads (opcional)' },
                      ].map((item) => (
                        <div key={item.perm} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                          <code className="text-purple-400">{item.perm}</code>
                          <span className="text-muted-foreground">- {item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Passo 4 - Ad Account ID */}
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <p className="font-medium text-orange-400 mb-2">Passo 4: Encontrar Ad Account ID</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Acesse <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Business Manager</a></li>
                      <li>Vá em <strong>"Configurações do negócio"</strong></li>
                      <li>Clique em <strong>"Contas"</strong> → <strong>"Contas de anúncios"</strong></li>
                      <li>Selecione a conta desejada</li>
                      <li>O ID aparece no formato <code className="bg-muted px-1 rounded">act_123456789</code></li>
                    </ol>
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <p className="text-muted-foreground">
                        💡 <strong>Dica:</strong> O prefixo <code>act_</code> é obrigatório na API. Se seu ID é <code>123456789</code>, use <code>act_123456789</code>.
                      </p>
                    </div>
                  </div>

                  {/* Passo 5 - Configurar na App */}
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                    <p className="font-medium text-cyan-400 mb-2">Passo 5: Configurar na Aplicação</p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Acesse <strong>Configurações</strong> → aba <strong>"Integrações"</strong> (em breve)</li>
                      <li>Cole o <strong>Access Token</strong></li>
                      <li>Cole o <strong>Ad Account ID</strong> (com act_)</li>
                      <li>Clique em <strong>"Testar Conexão"</strong></li>
                      <li>Se sucesso, clique em <strong>"Salvar"</strong></li>
                    </ol>
                    <div className="mt-3 p-2 bg-muted rounded text-xs font-mono">
                      <p className="text-muted-foreground mb-1"># Variáveis de ambiente (.env.local)</p>
                      <p>META_ACCESS_TOKEN=EAAxxxxx...</p>
                      <p>META_AD_ACCOUNT_ID=act_123456789</p>
                      <p>META_APP_ID=123456789</p>
                      <p>META_APP_SECRET=abcdef123...</p>
                    </div>
                  </div>

                  {/* Requisitos Extras */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <p className="font-medium text-foreground mb-2">📋 Requisitos Adicionais (Produção)</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span>✅</span>
                        <div>
                          <strong>Pixel do Facebook:</strong> Necessário para campanhas de conversão. 
                          Configure em <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Events Manager</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>✅</span>
                        <div>
                          <strong>Verificação de Domínio:</strong> Obrigatório para anúncios.
                          Configure em Business Manager → Brand Safety → Domínios
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>✅</span>
                        <div>
                          <strong>Página do Facebook:</strong> Necessário para criar anúncios.
                          A página deve estar conectada ao Business Manager
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>⚠️</span>
                        <div>
                          <strong>App Review (opcional):</strong> Para apps públicos, submeta para revisão.
                          Para uso próprio/interno, não é necessário
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Páginas */}
              <div>
                <h4 className="font-medium mb-3">Páginas da Aplicação</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Dashboard', desc: 'Visão geral, alertas, orçamento', href: '/' },
                    { name: 'Campanhas', desc: 'Lista e gerenciamento de campanhas', href: '/campaigns' },
                    { name: 'Criar Campanha', desc: 'Wizard para nova campanha', href: '/campaigns/create' },
                    { name: 'Agente IA', desc: 'Chat com assistente inteligente', href: '/agent' },
                    { name: 'Analytics', desc: 'Gráficos e métricas detalhadas', href: '/analytics' },
                    { name: 'Configurações', desc: 'Orçamento, notificações, API', href: '/settings' },
                  ].map((page) => (
                    <div
                      key={page.name}
                      className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <p className="font-medium text-sm">{page.name}</p>
                      <p className="text-xs text-muted-foreground">{page.desc}</p>
                      <code className="text-xs text-primary mt-1 block">{page.href}</code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-yellow-500" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>
                Dúvidas comuns sobre a aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  id: 'faq1',
                  q: 'Como conecto minha conta do Meta Ads?',
                  a: 'Vá em Configurações > Integrações e adicione seu App ID, App Secret e Access Token. Você pode criar um App em developers.facebook.com.',
                },
                {
                  id: 'faq2',
                  q: 'O orçamento mostrado é da BM ou da Conta de Anúncios?',
                  a: 'O orçamento é configurado por você em Configurações > Orçamento. É um limite pessoal que você define para controlar seus gastos. O sistema alerta quando você atinge 50%, 80% e 100% desse limite.',
                },
                {
                  id: 'faq3',
                  q: 'Como funcionam as notificações por WhatsApp?',
                  a: 'Configure a Evolution API em Configurações > Notificações. Você receberá relatórios diários às 18h, alertas de problemas em tempo real e sugestões de otimização.',
                },
                {
                  id: 'faq4',
                  q: 'O Agente IA pode criar campanhas sozinho?',
                  a: 'Sim! Converse com o Agente em linguagem natural. Ele pode criar campanhas, sugerir públicos, analisar performance e recomendar otimizações baseado nos seus objetivos.',
                },
                {
                  id: 'faq5',
                  q: 'Os dados são sincronizados automaticamente?',
                  a: 'As métricas são atualizadas periodicamente. Você também pode clicar em "Sincronizar" no header para forçar uma atualização manual.',
                },
                {
                  id: 'faq6',
                  q: 'Posso usar com múltiplas contas de anúncios?',
                  a: 'Atualmente o sistema suporta uma conta por usuário. Para múltiplas contas, você pode criar usuários diferentes ou aguardar futuras atualizações.',
                },
                {
                  id: 'faq7',
                  q: 'Como faço upload de imagens/vídeos?',
                  a: 'Na criação de campanha (passo 3), você pode arrastar ou clicar para fazer upload. Aceitamos JPG, PNG (até 30MB) e MP4, MOV (até 4GB).',
                },
                {
                  id: 'faq8',
                  q: 'O que são os alertas no Dashboard?',
                  a: 'Alertas são notificações sobre: CTR baixo, orçamento próximo do limite, tendências negativas de performance, e sugestões de otimização identificadas pelo sistema.',
                },
              ].map((faq) => (
                <div
                  key={faq.id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm">{faq.q}</span>
                    {openFaq === faq.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tecnologias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-500" />
                Stack Tecnológico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Next.js 16', desc: 'Framework React', color: 'bg-black' },
                  { name: 'TypeScript', desc: 'Tipagem estática', color: 'bg-blue-600' },
                  { name: 'Tailwind CSS', desc: 'Estilização', color: 'bg-cyan-500' },
                  { name: 'shadcn/ui', desc: 'Componentes', color: 'bg-zinc-700' },
                  { name: 'Supabase', desc: 'Banco + Storage', color: 'bg-emerald-600' },
                  { name: 'NextAuth.js', desc: 'Autenticação', color: 'bg-purple-600' },
                  { name: 'Prisma', desc: 'ORM', color: 'bg-indigo-600' },
                  { name: 'Agno', desc: 'Agentes IA', color: 'bg-orange-500' },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <div className={`h-3 w-3 rounded-full ${tech.color}`} />
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* META API */}
        <TabsContent value="meta" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Meta Marketing API
              </CardTitle>
              <CardDescription>
                API para gerenciamento de campanhas no Facebook e Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base URL */}
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <code className="bg-muted px-3 py-2 rounded block">
                  https://graph.facebook.com/v21.0
                </code>
              </div>

              {/* Autenticação */}
              <div>
                <h4 className="font-medium mb-2">Autenticação</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Todas as requisições precisam do Access Token:
                </p>
                <code className="bg-muted px-3 py-2 rounded block text-sm">
                  Authorization: Bearer {'{ACCESS_TOKEN}'}
                </code>
              </div>

              {/* Endpoints */}
              <div>
                <h4 className="font-medium mb-3">Endpoints Utilizados</h4>
                <div className="space-y-3">
                  {/* Campaigns */}
                  <EndpointCard
                    method="GET"
                    endpoint="/act_{AD_ACCOUNT_ID}/campaigns"
                    description="Listar todas as campanhas"
                    params={['fields=name,status,objective,daily_budget', 'limit=100']}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />
                  
                  <EndpointCard
                    method="POST"
                    endpoint="/act_{AD_ACCOUNT_ID}/campaigns"
                    description="Criar nova campanha"
                    body={{
                      name: 'Campanha Teste',
                      objective: 'OUTCOME_SALES',
                      status: 'PAUSED',
                      special_ad_categories: '[]',
                    }}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />

                  <EndpointCard
                    method="POST"
                    endpoint="/{CAMPAIGN_ID}/adsets"
                    description="Criar conjunto de anúncios"
                    body={{
                      name: 'AdSet Principal',
                      campaign_id: '{CAMPAIGN_ID}',
                      daily_budget: 10000,
                      billing_event: 'IMPRESSIONS',
                      optimization_goal: 'REACH',
                      targeting: { geo_locations: { countries: ['BR'] } },
                    }}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />

                  <EndpointCard
                    method="POST"
                    endpoint="/act_{AD_ACCOUNT_ID}/adimages"
                    description="Upload de imagem"
                    params={['multipart/form-data com arquivo']}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />

                  <EndpointCard
                    method="GET"
                    endpoint="/{CAMPAIGN_ID}/insights"
                    description="Métricas da campanha"
                    params={[
                      'fields=impressions,clicks,spend,cpc,ctr,conversions',
                      'date_preset=last_7d',
                    ]}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://developers.facebook.com/docs/marketing-apis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Documentação Oficial
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://developers.facebook.com/tools/explorer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Graph API Explorer
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EVOLUTION API */}
        <TabsContent value="evolution" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Evolution API (WhatsApp)
              </CardTitle>
              <CardDescription>
                API para envio de notificações via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base URL */}
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <code className="bg-muted px-3 py-2 rounded block">
                  {'{EVOLUTION_API_URL}'}/message
                </code>
              </div>

              {/* Autenticação */}
              <div>
                <h4 className="font-medium mb-2">Autenticação</h4>
                <code className="bg-muted px-3 py-2 rounded block text-sm">
                  apikey: {'{EVOLUTION_API_KEY}'}
                </code>
              </div>

              {/* Endpoints */}
              <div>
                <h4 className="font-medium mb-3">Endpoints Utilizados</h4>
                <div className="space-y-3">
                  <EndpointCard
                    method="POST"
                    endpoint="/sendText/{INSTANCE}"
                    description="Enviar mensagem de texto"
                    body={{
                      number: '5511999999999',
                      text: 'Relatório diário: Gasto R$ 250, CTR 2.5%',
                    }}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />

                  <EndpointCard
                    method="POST"
                    endpoint="/sendMedia/{INSTANCE}"
                    description="Enviar mídia (imagem/vídeo)"
                    body={{
                      number: '5511999999999',
                      mediatype: 'image',
                      media: 'https://url-da-imagem.jpg',
                      caption: 'Gráfico de performance',
                    }}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />

                  <EndpointCard
                    method="POST"
                    endpoint="/sendList/{INSTANCE}"
                    description="Enviar lista interativa"
                    body={{
                      number: '5511999999999',
                      title: 'Alertas do Dia',
                      description: 'Escolha uma opção',
                      buttonText: 'Ver Alertas',
                      sections: [{ title: 'Campanhas', rows: [] }],
                    }}
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />

                  <EndpointCard
                    method="GET"
                    endpoint="/instance/connectionState/{INSTANCE}"
                    description="Verificar status da conexão"
                    copyToClipboard={copyToClipboard}
                    copiedCode={copiedCode}
                  />
                </div>
              </div>

              {/* Tipos de Notificação */}
              <div>
                <h4 className="font-medium mb-3">Tipos de Notificação</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm">📊 Relatório Diário</p>
                    <p className="text-xs text-muted-foreground">18:00 - Resumo do dia</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm">🚨 Alerta Urgente</p>
                    <p className="text-xs text-muted-foreground">Imediato - Problemas críticos</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm">💡 Sugestão</p>
                    <p className="text-xs text-muted-foreground">Otimizações detectadas</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium text-sm">💰 Orçamento</p>
                    <p className="text-xs text-muted-foreground">50%, 80%, 100% do limite</p>
                  </div>
                </div>
              </div>

              {/* Links */}
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://doc.evolution-api.com/v2/pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Documentação Evolution API
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATABASE */}
        <TabsContent value="database" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-500" />
                Supabase (PostgreSQL)
              </CardTitle>
              <CardDescription>
                Banco de dados e storage para a aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tabelas */}
              <div>
                <h4 className="font-medium mb-3">Tabelas Principais</h4>
                <div className="space-y-2">
                  {[
                    { name: 'users', desc: 'Usuários e autenticação', count: '1 admin' },
                    { name: 'settings', desc: 'Configurações por usuário', count: 'Orçamento, WhatsApp' },
                    { name: 'campaigns', desc: 'Campanhas do Meta', count: 'Sincronizadas' },
                    { name: 'ad_sets', desc: 'Conjuntos de anúncios', count: 'Por campanha' },
                    { name: 'ads', desc: 'Anúncios individuais', count: 'Criativos' },
                    { name: 'campaign_metrics', desc: 'Métricas diárias', count: 'Histórico' },
                    { name: 'alerts', desc: 'Alertas e notificações', count: 'Lidas/não lidas' },
                    { name: 'agent_sessions', desc: 'Conversas com IA', count: 'Histórico' },
                  ].map((table) => (
                    <div
                      key={table.name}
                      className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded"
                    >
                      <div>
                        <code className="text-sm font-medium">{table.name}</code>
                        <p className="text-xs text-muted-foreground">{table.desc}</p>
                      </div>
                      <Badge variant="secondary">{table.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div>
                <h4 className="font-medium mb-2">Storage (Mídias)</h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium text-sm">📁 campaign-media</p>
                  <p className="text-xs text-muted-foreground">
                    Bucket público para imagens e vídeos dos anúncios
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estrutura: <code>/{'{userId}'}/{'{images|videos}'}/{'{arquivo}'}</code>
                  </p>
                </div>
              </div>

              {/* Links */}
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://supabase.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Documentação Supabase
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUTH */}
        <TabsContent value="auth" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Autenticação
              </CardTitle>
              <CardDescription>
                Sistema de login e proteção de rotas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* NextAuth */}
              <div>
                <h4 className="font-medium mb-2">NextAuth.js v5</h4>
                <p className="text-sm text-muted-foreground">
                  Autenticação com credenciais (email/senha) usando JWT.
                </p>
              </div>

              {/* Credenciais Padrão */}
              <div>
                <h4 className="font-medium mb-2">Credenciais de Teste</h4>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Email:</span>
                    <code className="text-sm">admin@metacampaigns.com</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Senha:</span>
                    <code className="text-sm">admin123</code>
                  </div>
                </div>
              </div>

              {/* Rotas Protegidas */}
              <div>
                <h4 className="font-medium mb-2">Rotas Protegidas</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-16">GET</Badge>
                    <code>/</code>
                    <span className="text-muted-foreground">- Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-16">GET</Badge>
                    <code>/campaigns/*</code>
                    <span className="text-muted-foreground">- Campanhas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-16">GET</Badge>
                    <code>/agent</code>
                    <span className="text-muted-foreground">- Agente IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-16">GET</Badge>
                    <code>/analytics</code>
                    <span className="text-muted-foreground">- Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-16">GET</Badge>
                    <code>/settings</code>
                    <span className="text-muted-foreground">- Configurações</span>
                  </div>
                </div>
              </div>

              {/* Variáveis */}
              <div>
                <h4 className="font-medium mb-2">Variáveis de Ambiente</h4>
                <div className="space-y-1 text-sm font-mono">
                  <div className="bg-muted px-2 py-1 rounded">
                    NEXTAUTH_SECRET=<span className="text-muted-foreground">openssl rand -base64 32</span>
                  </div>
                  <div className="bg-muted px-2 py-1 rounded">
                    NEXTAUTH_URL=<span className="text-muted-foreground">http://localhost:3000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            Referência Rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Meta API</p>
              <code className="text-xs">graph.facebook.com/v21.0</code>
            </div>
            <div>
              <p className="text-muted-foreground">Evolution API</p>
              <code className="text-xs">{'{URL}'}/message/*</code>
            </div>
            <div>
              <p className="text-muted-foreground">Supabase</p>
              <code className="text-xs">{'{PROJECT}'}.supabase.co</code>
            </div>
            <div>
              <p className="text-muted-foreground">Agno (IA)</p>
              <code className="text-xs">localhost:8000</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para cada endpoint
function EndpointCard({
  method,
  endpoint,
  description,
  params,
  body,
  copyToClipboard,
  copiedCode,
}: {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  description: string;
  params?: string[];
  body?: Record<string, unknown>;
  copyToClipboard: (code: string, id: string) => void;
  copiedCode: string | null;
}) {
  const methodColors = {
    GET: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    POST: 'bg-green-500/10 text-green-500 border-green-500/20',
    PATCH: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    DELETE: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const id = `${method}-${endpoint}`;
  const codeString = body ? JSON.stringify(body, null, 2) : endpoint;

  return (
    <div className="border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={methodColors[method]} variant="outline">
            {method}
          </Badge>
          <code className="text-sm">{endpoint}</code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => copyToClipboard(codeString, id)}
        >
          {copiedCode === id ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {params && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Params:</span>{' '}
          {params.map((p, i) => (
            <code key={i} className="bg-muted px-1 rounded mr-1">
              {p}
            </code>
          ))}
        </div>
      )}
      {body && (
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
          {JSON.stringify(body, null, 2)}
        </pre>
      )}
    </div>
  );
}

// Componente para cada agente
function AgentCard({
  name,
  emoji,
  role,
  color,
  description,
  capabilities,
  example,
}: {
  name: string;
  emoji: string;
  role: string;
  color: string;
  description: string;
  capabilities: string[];
  example: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <span className={`font-medium ${color}`}>{name}</span>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">{description}</p>
          
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Capacidades:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {capabilities.map((cap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs font-medium text-foreground mb-1">Exemplo:</p>
            <p className="text-xs text-muted-foreground italic">{example}</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  User,
  Send,
  Loader2,
  Check,
  X,
  Edit,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Action[];
}

interface Action {
  type: 'confirm' | 'cancel' | 'edit' | 'view';
  label: string;
  href?: string;
}

// Mock messages for demo
const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: `Olá! 👋 Sou o assistente de campanhas Meta.

Posso ajudar você a:
• **Criar campanhas** - Descreva o que você precisa
• **Analisar performance** - Peça relatórios e insights
• **Sugerir otimizações** - Encontrar oportunidades de melhoria
• **Verificar orçamento** - Ver projeções e limites

Como posso ajudar hoje?`,
    timestamp: new Date(),
  },
];

const suggestions = [
  'Criar campanha de conversões',
  'Analisar performance',
  'Ver projeções do mês',
  'Verificar orçamento',
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Chamar API real do agente
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response.content,
          timestamp: new Date(data.response.timestamp || new Date()),
          actions: data.response.actions || (currentInput.toLowerCase().includes('criar')
            ? [
                { type: 'confirm' as const, label: 'Confirmar' },
                { type: 'cancel' as const, label: 'Cancelar' },
                { type: 'edit' as const, label: 'Editar' },
              ]
            : undefined),
        };

        setMessages((prev) => [...prev, aiResponse]);
      } else {
        throw new Error(data.error || 'Erro ao processar mensagem');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Erro ao processar sua mensagem. Verifique se o backend está rodando.\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleAction = async (action: Action) => {
    if (action.type === 'confirm') {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ **Campanha criada com sucesso!**

**ID:** 123456789
**Nome:** E-commerce Conversões
**Status:** PAUSADA

A campanha foi criada pausada para você revisar antes de ativar.`,
        timestamp: new Date(),
        actions: [{ type: 'view', label: 'Ver Campanha', href: '/campaigns/1' }],
      };

      setMessages((prev) => [...prev, confirmMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agente IA</h1>
            <p className="text-muted-foreground">
              Converse com o assistente para gerenciar suas campanhas
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="mr-1 h-3 w-3" />
            Powered by GPT-4
          </Badge>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 bg-card border-border/50 overflow-hidden">
        <CardContent className="flex h-full flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] space-y-3 ${
                      message.role === 'user' ? 'order-first' : ''
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br />'),
                        }}
                      />
                    </div>

                    {message.actions && (
                      <div className="flex flex-wrap gap-2">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={
                              action.type === 'confirm'
                                ? 'default'
                                : action.type === 'cancel'
                                ? 'destructive'
                                : 'outline'
                            }
                            onClick={() => handleAction(action)}
                            asChild={action.href ? true : false}
                            className="gap-1"
                          >
                            {action.href ? (
                              <a href={action.href}>
                                {action.type === 'view' && (
                                  <ExternalLink className="h-3 w-3" />
                                )}
                                {action.label}
                              </a>
                            ) : (
                              <>
                                {action.type === 'confirm' && (
                                  <Check className="h-3 w-3" />
                                )}
                                {action.type === 'cancel' && (
                                  <X className="h-3 w-3" />
                                )}
                                {action.type === 'edit' && (
                                  <Edit className="h-3 w-3" />
                                )}
                                {action.label}
                              </>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggestions */}
          <div className="border-t border-border p-3">
            <div className="mb-2 text-xs text-muted-foreground">
              💡 Sugestões:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestion(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <Input
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

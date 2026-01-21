---
name: creative-manager
description: Gerenciamento de criativos publicitários (textos, imagens, vídeos). Use quando o agente precisar: (1) Criar textos de anúncios otimizados, (2) Gerar variações de copy, (3) Especificar requisitos de imagem/vídeo, (4) Validar criativos contra políticas, (5) Organizar biblioteca de assets, (6) Criar testes A/B de criativos.
---

# Creative Manager

Skill para criação e gestão de criativos publicitários.

## Componentes de um Criativo

### Elementos de Texto
- **Headline/Título** - Captura atenção, contém proposta de valor
- **Primary Text/Body** - Desenvolve mensagem, benefícios, prova social
- **Description** - Complemento, detalhes adicionais
- **CTA (Call-to-Action)** - Ação desejada clara

### Elementos Visuais
- **Imagem estática** - Fotos, ilustrações, gráficos
- **Vídeo** - Curto (15s), médio (30s), longo (60s+)
- **Carrossel** - Múltiplas imagens/vídeos em sequência
- **Stories/Reels** - Formato vertical 9:16

## Especificações por Plataforma

### Google Ads - RSA (Responsive Search Ads)
| Elemento | Limite | Quantidade |
|----------|--------|------------|
| Headline | 30 chars | 3-15 |
| Description | 90 chars | 2-4 |
| Path | 15 chars | 2 |
| Final URL | - | 1 |

### Meta Ads
| Formato | Tamanho Imagem | Texto |
|---------|----------------|-------|
| Feed | 1080x1080 ou 1200x628 | 125 chars primário |
| Stories | 1080x1920 | 125 chars |
| Reels | 1080x1920 | 72 chars |
| Carrossel | 1080x1080 | 125 chars |

### LinkedIn Ads
| Formato | Tamanho | Texto |
|---------|---------|-------|
| Single Image | 1200x627 | 600 chars intro |
| Carousel | 1080x1080 | 255 chars por card |
| Video | 16:9 ou 1:1 | 600 chars |

### TikTok Ads
| Formato | Tamanho | Duração |
|---------|---------|---------|
| In-Feed | 9:16, 1:1, 16:9 | 5-60s |
| TopView | 9:16 | 5-60s |
| Spark Ads | - | - |

## Framework de Copywriting

### Estrutura AIDA
```
Attention (Título): Capturar atenção imediata
Interest (Abertura): Despertar interesse com benefício
Desire (Corpo): Criar desejo com prova/urgência
Action (CTA): Direcionrar para ação clara
```

### Estrutura PAS
```
Problem: Identificar dor/problema do público
Agitate: Amplificar consequências do problema
Solution: Apresentar produto como solução
```

### Elementos de Alta Conversão
- ✅ Números específicos ("Aumente 47% suas vendas")
- ✅ Urgência ("Últimas vagas", "Só hoje")
- ✅ Prova social ("10.000 clientes satisfeitos")
- ✅ Garantia ("30 dias ou seu dinheiro de volta")
- ✅ Benefício claro (não features)
- ✅ Personalização ("Para [segmento]")

## Templates de Copy

### Google Ads - Headlines
```
Categoria: Benefício Direto
- [Benefício Principal] em [Tempo]
- [Resultado] Garantido
- [X]% de [Métrica Positiva]

Categoria: Urgência
- Oferta Por Tempo Limitado
- Últimas [X] Unidades
- Só Até [Data]

Categoria: Prova Social
- [X]+ Clientes Satisfeitos
- Avaliado com [X] Estrelas
- Líder em [Categoria]

Categoria: CTA
- Comece Grátis Agora
- Solicite Seu Orçamento
- Fale com Especialista
```

### Meta Ads - Primary Text
```
Template 1 (Problema-Solução):
"Cansado de [problema]?
[Produto/Serviço] ajuda você a [benefício principal].
✅ [Benefício 1]
✅ [Benefício 2]
✅ [Benefício 3]
[CTA] 👇"

Template 2 (Prova Social):
"[X] pessoas já [resultado alcançado].
[Nome] conseguiu [resultado específico] em apenas [tempo].
Você também pode. [CTA]"

Template 3 (Oferta):
"🔥 [Oferta] por tempo limitado!
De R$[preço original] por apenas R$[preço promocional].
[Benefício principal incluso].
Válido até [data]. [CTA]"
```

## Validação de Criativos

### Checklist Pré-Publicação
- [ ] Texto dentro dos limites de caracteres
- [ ] Imagem no tamanho correto
- [ ] Sem texto excessivo na imagem (<20%)
- [ ] URL de destino funcional
- [ ] Sem palavras proibidas
- [ ] Claim verificável (se aplicável)
- [ ] Identidade visual consistente
- [ ] Mobile-first design

### Palavras de Atenção (Policies)
| Categoria | Exemplos | Risco |
|-----------|----------|-------|
| Saúde | "cura", "milagre", "100% eficaz" | Alto |
| Financeiro | "garantido", "sem risco", "lucro certo" | Alto |
| Clickbait | "você não vai acreditar", "chocante" | Médio |
| Comparativo | "melhor que [concorrente]" | Médio |
| Urgência falsa | "última chance" (se não for) | Baixo |

## Testes A/B de Criativos

### O que Testar
1. **Headlines** - Benefício vs Urgência vs Prova Social
2. **Imagens** - Produto vs Lifestyle vs Pessoa
3. **CTA** - Direto vs Soft vs Pergunta
4. **Formato** - Imagem vs Vídeo vs Carrossel
5. **Comprimento** - Copy curto vs longo

### Estrutura de Teste
```json
{
  "test_name": "Headline Benefício vs Urgência",
  "hypothesis": "Headlines focadas em benefício terão CTR maior",
  "metric": "CTR",
  "variants": [
    {"name": "Control", "headline": "Aumente Suas Vendas em 30%"},
    {"name": "Urgência", "headline": "Últimas Vagas - Inscreva-se Já"}
  ],
  "traffic_split": 50,
  "min_sample": 1000,
  "duration_days": 7
}
```

## Scripts Disponíveis

- `scripts/validate_creative.py` - Valida especificações e políticas
- `scripts/generate_variations.py` - Gera variações de copy
- `scripts/resize_image.py` - Redimensiona para múltiplos formatos
- `scripts/text_overlay_check.py` - Verifica % de texto em imagem

## Referências

- `references/ad-policies.md` - Políticas de anúncio por plataforma
- `references/copy-templates.md` - Biblioteca de templates de copy
- `references/image-specs.md` - Especificações detalhadas de imagem

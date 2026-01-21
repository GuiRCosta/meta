---
name: campaign-creator
description: Criação de campanhas publicitárias em múltiplas plataformas (Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads). Use quando o agente precisar: (1) Criar novas campanhas do zero, (2) Configurar estrutura de campanha/grupo de anúncios/anúncios, (3) Definir objetivos e configurações iniciais, (4) Gerar estruturas de campanha baseadas em briefings. Suporta campanhas de Search, Display, Shopping, Video, App e Performance Max.
---

# Campaign Creator

Skill para criação estruturada de campanhas publicitárias em plataformas de ads.

## Workflow de Criação

1. **Validar briefing** → Verificar informações essenciais
2. **Definir estrutura** → Mapear hierarquia campanha/grupos/anúncios
3. **Configurar targeting** → Usar skill `audience-manager` se necessário
4. **Gerar criativos** → Usar skill `creative-manager` se necessário
5. **Definir orçamento** → Usar skill `budget-optimizer` para recomendações
6. **Validar configuração** → Executar `scripts/validate_campaign.py`
7. **Gerar payload** → Executar `scripts/generate_payload.py`

## Informações Essenciais do Briefing

Antes de criar, verificar se o briefing contém:

- **Objetivo**: awareness, consideration, conversion, leads, traffic, app_installs
- **Plataforma(s)**: google_ads, meta_ads, linkedin_ads, tiktok_ads
- **Orçamento**: valor diário ou total + período
- **Público-alvo**: características demográficas/comportamentais mínimas
- **Oferta/Produto**: o que está sendo anunciado
- **Destino**: URL de destino ou app

Se faltar informação, solicitar ao usuário antes de prosseguir.

## Estrutura de Campanha por Plataforma

### Google Ads
```
Campaign
├── Settings (objetivo, tipo, orçamento, geo, idioma)
├── Ad Groups
│   ├── Keywords/Audiences
│   ├── Ads (RSA, Display, Video)
│   └── Extensions
└── Conversions
```

### Meta Ads
```
Campaign
├── Objective (awareness, traffic, engagement, leads, sales)
└── Ad Sets
    ├── Audience (custom, lookalike, detailed)
    ├── Placements (auto/manual)
    ├── Budget & Schedule
    └── Optimization
└── Ads (creative + copy)
```

### LinkedIn Ads
```
Campaign Group
└── Campaign
    ├── Objective
    ├── Audience (job titles, companies, skills)
    ├── Budget & Schedule
    └── Bid Strategy
└── Ads (single image, carousel, video, message)
```

## Convenções de Nomenclatura

Usar formato padronizado para facilitar análise:
```
[PLATAFORMA]_[OBJETIVO]_[PRODUTO]_[AUDIENCIA]_[DATA]

Exemplos:
META_CONV_CURSO-PYTHON_REMARKETING_2024Q1
GADS_SEARCH_CONSULTORIA_PROSPECCAO_JAN24
```

## Scripts Disponíveis

- `scripts/validate_campaign.py` - Valida estrutura antes de envio
- `scripts/generate_payload.py` - Gera JSON/payload para APIs
- `scripts/estimate_reach.py` - Estima alcance baseado em configurações

## Templates

Ver `assets/templates/` para estruturas JSON pré-configuradas por plataforma.

## Referências

- `references/platform-specs.md` - Especificações e limites por plataforma
- `references/objectives-mapping.md` - Mapeamento de objetivos entre plataformas
- `references/best-practices.md` - Melhores práticas por tipo de campanha

---
name: audience-manager
description: Gerenciamento de audiências e segmentação para campanhas publicitárias. Use quando o agente precisar: (1) Criar públicos customizados ou lookalike, (2) Definir segmentação demográfica/comportamental, (3) Configurar remarketing e retargeting, (4) Importar/exportar listas de clientes, (5) Analisar sobreposição de audiências, (6) Otimizar targeting existente.
---

# Audience Manager

Skill para criação e gestão de audiências em plataformas de ads.

## Tipos de Audiência por Plataforma

### Google Ads
- **Customer Match** - Listas de e-mail/telefone/endereço
- **Website Visitors** - Remarketing via tag
- **App Users** - Usuários do app
- **YouTube Users** - Interações no YouTube
- **Similar Audiences** - Expansão automática (descontinuado)
- **In-Market** - Intenção de compra
- **Affinity** - Interesses de longo prazo
- **Custom Segments** - Combinação personalizada

### Meta Ads
- **Custom Audiences**
  - Website (Pixel)
  - Customer List (CRM)
  - App Activity
  - Offline Activity
  - Video Engagement
  - Lead Form
  - Instagram/Facebook Engagement
- **Lookalike Audiences** - 1% a 10% de similaridade
- **Saved Audiences** - Combinações demográficas/interesses
- **Special Ad Audiences** - Para categorias especiais

### LinkedIn Ads
- **Matched Audiences**
  - Website Retargeting
  - Contact Targeting (e-mail)
  - Company Targeting (lista de empresas)
  - Lookalike
- **LinkedIn Audiences** - Job title, company, skills, etc.

### TikTok Ads
- **Custom Audiences** - Website, app, engagement
- **Lookalike Audiences**
- **Interest & Behavior** - Categorias do TikTok

## Workflow de Criação de Audiência

```
1. Definir objetivo → Prospecção vs Remarketing
2. Identificar fonte → CRM, Pixel, Engagement, etc.
3. Configurar regras → Inclusões e exclusões
4. Estimar tamanho → Verificar viabilidade
5. Validar compliance → LGPD/GDPR
6. Criar audiência → Via API ou interface
7. Aguardar processamento → 24-48h para listas
```

## Estruturas de Audiência

### Custom Audience (Website - Meta)
```json
{
  "name": "Visitantes 30 dias - Não converteram",
  "type": "WEBSITE",
  "rule": {
    "inclusions": {
      "operator": "or",
      "rules": [
        {
          "event_sources": [{"type": "pixel", "id": "PIXEL_ID"}],
          "retention_seconds": 2592000,
          "filter": {
            "operator": "and",
            "filters": [
              {"field": "url", "operator": "contains", "value": "/produto"}
            ]
          }
        }
      ]
    },
    "exclusions": {
      "operator": "or",
      "rules": [
        {
          "event_sources": [{"type": "pixel", "id": "PIXEL_ID"}],
          "retention_seconds": 2592000,
          "filter": {
            "operator": "and",
            "filters": [
              {"field": "event", "operator": "eq", "value": "Purchase"}
            ]
          }
        }
      ]
    }
  }
}
```

### Lookalike Audience
```json
{
  "name": "LAL 1% - Compradores",
  "type": "LOOKALIKE",
  "source_audience_id": "SOURCE_ID",
  "country": "BR",
  "ratio": 0.01,
  "starting_ratio": 0.00
}
```

### Customer Match (Google)
```json
{
  "name": "Lista CRM - Clientes Ativos",
  "type": "CUSTOMER_MATCH",
  "membership_life_span": 540,
  "upload_key_type": "CONTACT_INFO",
  "members": [
    {"hashed_email": "SHA256_HASH"},
    {"hashed_phone": "SHA256_HASH"}
  ]
}
```

## Segmentação Demográfica

### Opções Disponíveis
| Critério | Google | Meta | LinkedIn | TikTok |
|----------|--------|------|----------|--------|
| Idade | ✅ | ✅ | ✅ | ✅ |
| Gênero | ✅ | ✅ | ✅ | ✅ |
| Localização | ✅ | ✅ | ✅ | ✅ |
| Idioma | ✅ | ✅ | ✅ | ✅ |
| Renda | ✅ (EUA) | ✅ | ❌ | ❌ |
| Estado civil | ❌ | ✅ | ✅ | ❌ |
| Escolaridade | ❌ | ✅ | ✅ | ❌ |
| Cargo/Função | ❌ | ✅ | ✅ | ❌ |
| Empresa | ❌ | ✅ | ✅ | ❌ |
| Setor | ❌ | ✅ | ✅ | ❌ |

## Estratégias de Remarketing

### Funil de Remarketing
```
Topo (Awareness)
├── Visitou site (180 dias)
├── Viu vídeo 25%+
└── Engajou redes sociais

Meio (Consideração)
├── Visitou páginas de produto (90 dias)
├── Viu vídeo 50%+
├── Adicionou ao carrinho (30 dias)
└── Iniciou checkout (14 dias)

Fundo (Conversão)
├── Abandonou carrinho (7 dias)
├── Visitou checkout (3 dias)
└── Quase converteu (1 dia)

Pós-Venda
├── Compradores (30 dias) → Cross-sell
├── Compradores (90 dias) → Recompra
└── Inativos (180 dias) → Reativação
```

## Compliance e Privacidade

### Requisitos LGPD/GDPR
- ✅ Consentimento para coleta de dados
- ✅ Hash de dados pessoais (SHA256)
- ✅ Opção de opt-out
- ✅ Retenção máxima definida
- ✅ Documentação de base legal

### Boas Práticas
1. Nunca enviar dados em texto claro
2. Manter listas atualizadas (remover opt-outs)
3. Segmentar por fonte de consentimento
4. Definir TTL apropriado para cada audiência

## Scripts Disponíveis

- `scripts/hash_customer_data.py` - Hash SHA256 de dados CRM
- `scripts/estimate_audience_size.py` - Estima tamanho de audiência
- `scripts/analyze_overlap.py` - Analisa sobreposição entre públicos
- `scripts/sync_audiences.py` - Sincroniza listas entre plataformas

## Referências

- `references/interest-categories.md` - Categorias de interesse por plataforma
- `references/audience-rules.md` - Sintaxe de regras de audiência

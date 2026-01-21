---
name: campaign-editor
description: Edição e modificação de campanhas publicitárias existentes em múltiplas plataformas. Use quando o agente precisar: (1) Modificar configurações de campanhas ativas, (2) Atualizar textos, criativos ou targeting, (3) Ajustar orçamentos e lances, (4) Pausar/ativar campanhas ou elementos, (5) Duplicar campanhas com modificações, (6) Aplicar mudanças em lote.
---

# Campaign Editor

Skill para edição segura e estruturada de campanhas existentes.

## Princípios de Edição

1. **Sempre preservar histórico** - Não deletar, preferir pausar
2. **Validar antes de aplicar** - Usar `scripts/validate_changes.py`
3. **Mudanças incrementais** - Evitar alterações massivas simultâneas
4. **Documentar alterações** - Registrar motivo das mudanças

## Workflow de Edição

```
1. Identificar campanha → Obter ID e plataforma
2. Carregar estado atual → Usar API ou export
3. Definir alterações → Mapear campos a modificar
4. Validar mudanças → Executar validação
5. Gerar diff → Mostrar antes/depois
6. Aplicar (com confirmação) → Executar via API
7. Verificar resultado → Confirmar aplicação
```

## Tipos de Edição

### Edição Simples (campos individuais)
```json
{
  "action": "UPDATE",
  "entity": "campaign",
  "id": "123456789",
  "changes": {
    "name": "Novo Nome",
    "status": "PAUSED"
  }
}
```

### Edição em Lote (múltiplos elementos)
```json
{
  "action": "BATCH_UPDATE",
  "entity": "ad",
  "filter": {
    "campaign_id": "123456789",
    "status": "ACTIVE"
  },
  "changes": {
    "status": "PAUSED"
  }
}
```

### Duplicação com Modificações
```json
{
  "action": "DUPLICATE",
  "entity": "campaign",
  "source_id": "123456789",
  "modifications": {
    "name": "Campanha Duplicada",
    "budget.daily": 100.00,
    "targeting.geo_locations.cities": ["São Paulo"]
  }
}
```

## Campos Editáveis por Entidade

### Campanha
| Campo | Editável em Execução | Impacto |
|-------|---------------------|---------|
| name | ✅ | Baixo |
| status | ✅ | Alto |
| budget | ✅ | Alto |
| bid_strategy | ⚠️ Reinicia aprendizado | Alto |
| end_date | ✅ | Médio |
| geo_targeting | ⚠️ Pode afetar entrega | Alto |

### Grupo de Anúncios / Ad Set
| Campo | Editável em Execução | Impacto |
|-------|---------------------|---------|
| name | ✅ | Baixo |
| status | ✅ | Alto |
| targeting | ⚠️ Reinicia aprendizado | Alto |
| bid_amount | ✅ | Alto |
| schedule | ✅ | Médio |

### Anúncio
| Campo | Editável em Execução | Impacto |
|-------|---------------------|---------|
| name | ✅ | Baixo |
| status | ✅ | Alto |
| creative (Meta) | ❌ Criar novo | - |
| headlines (Google) | ✅ | Médio |
| descriptions (Google) | ✅ | Médio |
| final_url | ⚠️ Revisão necessária | Alto |

## Operações de Alto Risco

⚠️ **Requerem confirmação explícita:**

1. **Deletar elementos** - Perda permanente de dados
2. **Mudar estratégia de lance** - Reinicia fase de aprendizado
3. **Alterar público significativamente** - Pode zerar entrega
4. **Aumentar orçamento >50%** - Pode gastar rápido demais
5. **Mudar URL de destino** - Requer nova revisão

## Scripts Disponíveis

- `scripts/validate_changes.py` - Valida alterações antes de aplicar
- `scripts/generate_diff.py` - Gera comparativo antes/depois
- `scripts/batch_editor.py` - Aplica mudanças em lote
- `scripts/rollback.py` - Reverte para estado anterior

## Boas Práticas

1. **Testar em elemento único** antes de aplicar em lote
2. **Horários de baixo tráfego** para mudanças estruturais
3. **Backup do estado atual** antes de edições massivas
4. **Aguardar 24-48h** após mudanças para avaliar impacto
5. **Não editar durante fase de aprendizado** (primeiros 7 dias)

## Referências

- `references/field-mappings.md` - Mapeamento de campos por plataforma
- `references/api-endpoints.md` - Endpoints de atualização

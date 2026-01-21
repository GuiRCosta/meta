/**
 * Validation Schemas com Zod
 * Centraliza todas as validações de input para APIs
 */

import { z } from 'zod';

// ============================================
// CAMPAIGN SCHEMAS
// ============================================

/**
 * Validação para criação de campanha
 * POST /api/campaigns
 */
export const createCampaignSchema = z.object({
  campaign: z.object({
    name: z.string()
      .min(1, 'Nome da campanha é obrigatório')
      .max(255, 'Nome da campanha muito longo (máximo 255 caracteres)'),
    objective: z.enum([
      'OUTCOME_TRAFFIC',
      'OUTCOME_LEADS',
      'OUTCOME_SALES',
      'OUTCOME_ENGAGEMENT',
      'OUTCOME_APP_PROMOTION',
      'OUTCOME_AWARENESS',
    ], {
      errorMap: () => ({ message: 'Objetivo inválido' })
    }),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED'])
      .optional()
      .default('PAUSED'),
    dailyBudget: z.number()
      .positive('Orçamento diário deve ser positivo')
      .optional(),
    lifetimeBudget: z.number()
      .positive('Orçamento total deve ser positivo')
      .optional(),
  }).refine(
    (data) => data.dailyBudget || data.lifetimeBudget,
    { message: 'Orçamento diário ou total é obrigatório' }
  ),
  adSet: z.object({
    name: z.string()
      .min(1, 'Nome do conjunto é obrigatório')
      .max(255, 'Nome do conjunto muito longo'),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED'])
      .optional()
      .default('PAUSED'),
    dailyBudget: z.number()
      .positive('Orçamento diário do conjunto deve ser positivo'),
    targeting: z.record(z.unknown()).optional(),
  }),
  ad: z.object({
    name: z.string().max(255).optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
    creative: z.record(z.unknown()).optional(),
    mediaUrl: z.string().url('URL da mídia inválida').optional(),
    mediaType: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL']).optional(),
  }).optional(),
});

/**
 * Validação para atualização de campanha
 * PATCH /api/campaigns/[id]
 */
export const updateCampaignSchema = z.object({
  name: z.string()
    .min(1, 'Nome da campanha é obrigatório')
    .max(255, 'Nome da campanha muito longo')
    .optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED'], {
    errorMap: () => ({ message: 'Status inválido' })
  }).optional(),
  dailyBudget: z.number()
    .positive('Orçamento diário deve ser positivo')
    .optional(),
  lifetimeBudget: z.number()
    .positive('Orçamento total deve ser positivo')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Pelo menos um campo deve ser fornecido para atualização' }
);

/**
 * Validação para duplicação de campanha
 * POST /api/campaigns/[id]/duplicate
 */
export const duplicateCampaignSchema = z.object({
  count: z.number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade mínima é 1')
    .max(10, 'Quantidade máxima é 10 cópias por vez')
    .optional()
    .default(1),
});

/**
 * Validação para ações em lote
 * POST /api/campaigns/bulk
 */
export const bulkActionSchema = z.object({
  campaignIds: z.array(z.string().uuid('ID de campanha inválido'))
    .min(1, 'Selecione pelo menos uma campanha')
    .max(50, 'Máximo de 50 campanhas por vez'),
  action: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED'], {
    errorMap: () => ({ message: 'Ação inválida. Use: ACTIVE, PAUSED ou ARCHIVED' })
  }),
});

/**
 * Validação para parâmetros de query (GET /api/campaigns)
 */
export const getCampaignsQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED', 'all'])
    .optional()
    .default('all'),
  search: z.string().max(255).optional(),
  limit: z.coerce.number()
    .int('Limite deve ser um número inteiro')
    .min(1, 'Limite mínimo é 1')
    .max(100, 'Limite máximo é 100')
    .optional()
    .default(50),
  offset: z.coerce.number()
    .int('Offset deve ser um número inteiro')
    .min(0, 'Offset mínimo é 0')
    .optional()
    .default(0),
});

// ============================================
// SETTINGS SCHEMAS
// ============================================

/**
 * Validação para atualização de configurações
 * PATCH /api/settings
 */
export const updateSettingsSchema = z.object({
  // Budget & Alerts
  monthlyBudgetLimit: z.number()
    .positive('Orçamento mensal deve ser positivo')
    .optional(),
  alertAt50Percent: z.boolean().optional(),
  alertAt80Percent: z.boolean().optional(),
  alertAt100Percent: z.boolean().optional(),
  alertOnProjectedOverrun: z.boolean().optional(),

  // Goals & Limits
  conversionGoal: z.number()
    .int('Meta de conversões deve ser um número inteiro')
    .positive('Meta de conversões deve ser positiva')
    .optional(),
  roasGoal: z.number()
    .positive('Meta de ROAS deve ser positiva')
    .optional(),
  cpcMaxLimit: z.number()
    .positive('Limite máximo de CPC deve ser positivo')
    .optional(),
  ctrMinLimit: z.number()
    .min(0, 'CTR mínimo não pode ser negativo')
    .max(100, 'CTR mínimo não pode ser maior que 100%')
    .optional(),

  // WhatsApp
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de WhatsApp inválido (formato: +5511999999999)')
    .optional()
    .nullable(),

  // Notifications
  dailyReportTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido (formato: HH:MM)')
    .optional(),
  sendDailyReports: z.boolean().optional(),
  sendImmediateAlerts: z.boolean().optional(),
  sendSuggestions: z.boolean().optional(),
  sendStatusChanges: z.boolean().optional(),

  // Meta API (Sensitive - apenas para admins)
  metaAccessToken: z.string()
    .min(50, 'Token Meta inválido (muito curto)')
    .optional(),
  metaAdAccountId: z.string()
    .regex(/^act_\d+$/, 'ID da conta de anúncios inválido (formato: act_123456789)')
    .optional(),
  metaPageId: z.string()
    .regex(/^\d+$/, 'ID da página inválido')
    .optional(),
}).refine(
  (data) => {
    // Se whatsappEnabled = true, whatsappNumber é obrigatório
    if (data.whatsappEnabled && !data.whatsappNumber) {
      return false;
    }
    return true;
  },
  {
    message: 'Número do WhatsApp é obrigatório quando WhatsApp está habilitado',
    path: ['whatsappNumber'],
  }
);

// ============================================
// HELPER: Validation Error Formatter
// ============================================

/**
 * Formata erros do Zod para resposta JSON amigável
 */
export function formatZodError(error: z.ZodError) {
  // Garantir que error e error.errors existem
  if (!error || !error.errors || !Array.isArray(error.errors)) {
    console.error('[formatZodError] Erro inválido recebido:', error);
    return {
      error: 'Erro de validação',
      details: {},
      message: 'Dados inválidos',
    };
  }

  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return {
    error: 'Erro de validação',
    details: errors,
    message: error.errors[0]?.message || 'Dados inválidos',
  };
}

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type DuplicateCampaignInput = z.infer<typeof duplicateCampaignSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
export type GetCampaignsQuery = z.infer<typeof getCampaignsQuerySchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

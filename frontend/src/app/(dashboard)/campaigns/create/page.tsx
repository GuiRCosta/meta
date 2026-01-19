'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaUpload } from '@/components/campaigns/MediaUpload';
import { AdPreview } from '@/components/campaigns/AdPreview';
import { ArrowLeft, ArrowRight, Check, Bot, Loader2, Image, Video, LayoutGrid, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4;
type CreativeFormat = 'image' | 'video' | 'carousel';

const objectives = [
  { value: 'OUTCOME_SALES', label: 'Vendas', description: 'Impulsionar vendas online ou na loja', icon: '🛒' },
  { value: 'OUTCOME_LEADS', label: 'Leads', description: 'Coletar informações de contato', icon: '📋' },
  { value: 'OUTCOME_TRAFFIC', label: 'Tráfego', description: 'Direcionar pessoas ao seu site', icon: '🔗' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engajamento', description: 'Aumentar interações', icon: '💬' },
  { value: 'OUTCOME_AWARENESS', label: 'Reconhecimento', description: 'Alcançar mais pessoas', icon: '👁️' },
];

const countries = [
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'MX', label: '🇲🇽 México' },
];

const callToActions = [
  { value: 'SHOP_NOW', label: 'Comprar Agora' },
  { value: 'LEARN_MORE', label: 'Saiba Mais' },
  { value: 'SIGN_UP', label: 'Cadastre-se' },
  { value: 'CONTACT_US', label: 'Fale Conosco' },
  { value: 'DOWNLOAD', label: 'Baixar' },
  { value: 'GET_OFFER', label: 'Obter Oferta' },
  { value: 'BOOK_NOW', label: 'Reservar Agora' },
  { value: 'WATCH_MORE', label: 'Assistir Mais' },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1 - Campaign
    name: '',
    objective: '',
    status: 'PAUSED',
    // Step 2 - Ad Set
    adSetName: '',
    dailyBudget: '',
    ageMin: '18',
    ageMax: '65',
    country: 'BR',
    gender: 'all',
    // Step 3 - Creative
    creativeFormat: 'image' as CreativeFormat,
    adName: '',
    primaryText: '',
    headline: '',
    description: '',
    callToAction: 'LEARN_MORE',
    linkUrl: '',
    // Media
    media: null as {
      file?: File;
      preview?: string;
      type?: 'image' | 'video';
    } | null,
  });

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.objective;
      case 2:
        return formData.adSetName && formData.dailyBudget;
      case 3:
        return formData.adName && formData.primaryText && formData.headline && formData.linkUrl;
      case 4:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleMediaUpload = (file: File, preview: string, type: 'image' | 'video') => {
    updateFormData('media', { file, preview, type });
    updateFormData('creativeFormat', type);
  };

  const handleMediaRemove = () => {
    updateFormData('media', null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // TODO: Integrate with Meta API via backend
      const campaignData = {
        campaign: {
          name: formData.name,
          objective: formData.objective,
          status: formData.status,
        },
        adSet: {
          name: formData.adSetName,
          dailyBudget: parseFloat(formData.dailyBudget) * 100, // Meta uses cents
          targeting: {
            age_min: parseInt(formData.ageMin),
            age_max: parseInt(formData.ageMax),
            geo_locations: { countries: [formData.country] },
            genders: formData.gender === 'all' ? [1, 2] : [parseInt(formData.gender)],
          },
        },
        ad: {
          name: formData.adName,
          creative: {
            primaryText: formData.primaryText,
            headline: formData.headline,
            description: formData.description,
            callToAction: formData.callToAction,
            linkUrl: formData.linkUrl,
          },
        },
      };

      console.log('Campaign data to submit:', campaignData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Campanha criada com sucesso!', {
        description: `"${formData.name}" foi criada e está ${formData.status === 'ACTIVE' ? 'ativa' : 'pausada'}.`,
      });

      router.push('/campaigns');
    } catch (error) {
      toast.error('Erro ao criar campanha', {
        description: 'Tente novamente ou entre em contato com o suporte.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Campanha', description: 'Nome e objetivo' },
    { number: 2, title: 'Público', description: 'Segmentação' },
    { number: 3, title: 'Anúncio', description: 'Criativo e textos' },
    { number: 4, title: 'Revisar', description: 'Confirmar dados' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Campanha</h1>
          <p className="text-muted-foreground">
            Crie uma nova campanha no Meta Ads
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors ${
                  currentStep === step.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep > step.number
                    ? 'border-success bg-success text-success-foreground'
                    : 'border-muted bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.number
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 w-12 md:w-20 lg:w-28 ${
                  currentStep > step.number ? 'bg-success' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${currentStep === 3 && showPreview ? 'lg:grid-cols-2' : ''}`}>
        {/* Form */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            {/* Step 1: Campaign */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Campanha *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Campanha E-commerce Janeiro"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use um nome descritivo para facilitar a identificação
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Objetivo da Campanha *</Label>
                  <div className="grid gap-3">
                    {objectives.map((obj) => (
                      <div
                        key={obj.value}
                        onClick={() => updateFormData('objective', obj.value)}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          formData.objective === obj.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{obj.icon}</span>
                            <div>
                              <p className="font-medium text-foreground">
                                {obj.label}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {obj.description}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`h-5 w-5 rounded-full border-2 transition-colors ${
                              formData.objective === obj.value
                                ? 'border-primary bg-primary'
                                : 'border-muted'
                            }`}
                          >
                            {formData.objective === obj.value && (
                              <Check className="h-full w-full p-0.5 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status Inicial</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="ACTIVE"
                        checked={formData.status === 'ACTIVE'}
                        onChange={(e) => updateFormData('status', e.target.value)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span>Ativa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="PAUSED"
                        checked={formData.status === 'PAUSED'}
                        onChange={(e) => updateFormData('status', e.target.value)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span>Pausada</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Dica: Crie pausada para revisar antes de ativar
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Ad Set / Targeting */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="adSetName">Nome do Conjunto de Anúncios *</Label>
                  <Input
                    id="adSetName"
                    name="adSetName"
                    placeholder="Ex: Público 25-45 anos Brasil"
                    value={formData.adSetName}
                    onChange={(e) => updateFormData('adSetName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyBudget">Orçamento Diário (R$) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="dailyBudget"
                      name="dailyBudget"
                      type="number"
                      placeholder="100"
                      className="pl-10"
                      value={formData.dailyBudget}
                      onChange={(e) => updateFormData('dailyBudget', e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mínimo recomendado: R$ 20/dia
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Faixa Etária</Label>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Idade Mínima</p>
                      <Select
                        value={formData.ageMin}
                        onValueChange={(v) => updateFormData('ageMin', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[18, 21, 25, 30, 35, 40, 45, 50, 55, 60].map((age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age} anos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Idade Máxima</p>
                      <Select
                        value={formData.ageMax}
                        onValueChange={(v) => updateFormData('ageMax', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[25, 30, 35, 40, 45, 50, 55, 60, 65].map((age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age}+ anos
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) => updateFormData('gender', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="1">Masculino</SelectItem>
                      <SelectItem value="2">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>País</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(v) => updateFormData('country', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Creative / Ad */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Creative Format */}
                <div className="space-y-2">
                  <Label>Formato do Criativo</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'image', label: 'Imagem', icon: Image },
                      { value: 'video', label: 'Vídeo', icon: Video },
                      { value: 'carousel', label: 'Carrossel', icon: LayoutGrid, disabled: true },
                    ].map((format) => (
                      <button
                        key={format.value}
                        type="button"
                        onClick={() => !format.disabled && updateFormData('creativeFormat', format.value)}
                        disabled={format.disabled}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                          formData.creativeFormat === format.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        } ${format.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <format.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{format.label}</span>
                        {format.disabled && (
                          <span className="text-[10px] text-muted-foreground">Em breve</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mídia {formData.creativeFormat !== 'carousel' && '*'}</Label>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                      <Sparkles className="h-3 w-3" />
                      Gerar com IA
                    </Button>
                  </div>
                  <MediaUpload
                    onUpload={handleMediaUpload}
                    onRemove={handleMediaRemove}
                    value={formData.media || undefined}
                  />
                </div>

                {/* Ad Name */}
                <div className="space-y-2">
                  <Label htmlFor="adName">Nome do Anúncio *</Label>
                  <Input
                    id="adName"
                    name="adName"
                    placeholder="Ex: Anúncio Principal V1"
                    value={formData.adName}
                    onChange={(e) => updateFormData('adName', e.target.value)}
                  />
                </div>

                {/* Primary Text */}
                <div className="space-y-2">
                  <Label htmlFor="primaryText">Texto Principal *</Label>
                  <Textarea
                    id="primaryText"
                    name="primaryText"
                    placeholder="O texto que aparece acima da imagem/vídeo. Seja criativo e direto!"
                    value={formData.primaryText}
                    onChange={(e) => updateFormData('primaryText', e.target.value)}
                    maxLength={125}
                    rows={3}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Recomendado: até 125 caracteres</span>
                    <span>{formData.primaryText.length}/125</span>
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-2">
                  <Label htmlFor="headline">Título *</Label>
                  <Input
                    id="headline"
                    name="headline"
                    placeholder="Ex: Oferta Imperdível! Só Hoje"
                    value={formData.headline}
                    onChange={(e) => updateFormData('headline', e.target.value)}
                    maxLength={40}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Aparece abaixo da mídia</span>
                    <span>{formData.headline.length}/40</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Ex: Aproveite descontos de até 50%"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    maxLength={30}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Opcional - texto adicional</span>
                    <span>{formData.description.length}/30</span>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="space-y-2">
                  <Label>Botão de Ação</Label>
                  <Select
                    value={formData.callToAction}
                    onValueChange={(v) => updateFormData('callToAction', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {callToActions.map((cta) => (
                        <SelectItem key={cta.value} value={cta.value}>
                          {cta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Link URL */}
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">URL de Destino *</Label>
                  <Input
                    id="linkUrl"
                    name="linkUrl"
                    type="url"
                    placeholder="https://seusite.com/pagina-de-destino"
                    value={formData.linkUrl}
                    onChange={(e) => updateFormData('linkUrl', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Para onde as pessoas serão direcionadas ao clicar
                  </p>
                </div>

                {/* Toggle Preview (Mobile) */}
                <div className="lg:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg bg-muted/30 p-4 space-y-4">
                  {/* Campaign */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">1</span>
                      Campanha
                    </h3>
                    <div className="mt-2 ml-8 space-y-1">
                      <p className="text-lg font-semibold text-foreground">
                        {formData.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Objetivo: {objectives.find((o) => o.value === formData.objective)?.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {formData.status === 'ACTIVE' ? '🟢 Ativa' : '⏸️ Pausada'}
                      </p>
                    </div>
                  </div>

                  {/* Ad Set */}
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">2</span>
                      Conjunto de Anúncios
                    </h3>
                    <div className="mt-2 ml-8 space-y-1">
                      <p className="text-lg font-semibold text-foreground">
                        {formData.adSetName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        💰 Orçamento: R$ {formData.dailyBudget}/dia
                      </p>
                      <p className="text-sm text-muted-foreground">
                        👥 Público: {formData.ageMin}-{formData.ageMax} anos • {formData.gender === 'all' ? 'Todos' : formData.gender === '1' ? 'Masculino' : 'Feminino'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📍 {countries.find((c) => c.value === formData.country)?.label}
                      </p>
                    </div>
                  </div>

                  {/* Ad */}
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">3</span>
                      Anúncio
                    </h3>
                    <div className="mt-2 ml-8 space-y-1">
                      <p className="text-lg font-semibold text-foreground">
                        {formData.adName}
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📝 "{formData.primaryText}"</p>
                        <p>🏷️ Título: {formData.headline}</p>
                        {formData.description && <p>📄 Descrição: {formData.description}</p>}
                        <p>🔗 {formData.linkUrl}</p>
                        <p>🖱️ Botão: {callToActions.find((c) => c.value === formData.callToAction)?.label}</p>
                        {formData.media && (
                          <p>🖼️ Mídia: {formData.media.type === 'video' ? 'Vídeo' : 'Imagem'} anexado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview in Review Step */}
                {formData.media?.preview && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Preview do Anúncio</h3>
                    <AdPreview
                      pageName="Sua Página"
                      primaryText={formData.primaryText}
                      headline={formData.headline}
                      description={formData.description}
                      callToAction={formData.callToAction}
                      mediaUrl={formData.media.preview}
                      mediaType={formData.media.type}
                      linkUrl={formData.linkUrl}
                    />
                  </div>
                )}

                {/* Warnings */}
                <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
                  <p className="text-sm font-medium text-warning">⚠️ Atenção</p>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• A campanha será criada na sua conta Meta conectada</li>
                    <li>• O orçamento começará a ser cobrado quando ativada</li>
                    <li>• Você poderá editar as configurações após a criação</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Criar Campanha
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel (Step 3) */}
        {currentStep === 3 && showPreview && (
          <div className="space-y-4">
            <Card className="bg-card border-border/50 sticky top-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Preview do Anúncio</CardTitle>
              </CardHeader>
              <CardContent>
                <AdPreview
                  pageName="Sua Página"
                  primaryText={formData.primaryText || 'Seu texto principal aparecerá aqui...'}
                  headline={formData.headline || 'Título do anúncio'}
                  description={formData.description || 'Descrição'}
                  callToAction={formData.callToAction}
                  mediaUrl={formData.media?.preview}
                  mediaType={formData.media?.type}
                  linkUrl={formData.linkUrl}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* AI Suggestion */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              Prefere usar Inteligência Artificial?
            </p>
            <p className="text-sm text-muted-foreground">
              Deixe o Agente IA criar a campanha para você com base nos seus objetivos
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/agent">Falar com Agente</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

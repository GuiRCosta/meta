'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Image as ImageIcon,
  Play,
} from 'lucide-react';

interface AdPreviewProps {
  pageName?: string;
  primaryText?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  linkUrl?: string;
}

const callToActionLabels: Record<string, string> = {
  SHOP_NOW: 'Comprar',
  LEARN_MORE: 'Saiba Mais',
  SIGN_UP: 'Cadastre-se',
  CONTACT_US: 'Fale Conosco',
  DOWNLOAD: 'Baixar',
  GET_OFFER: 'Obter Oferta',
  BOOK_NOW: 'Reservar',
  WATCH_MORE: 'Assistir',
};

export function AdPreview({
  pageName = 'Sua Página',
  primaryText = 'Seu texto principal aparecerá aqui...',
  headline = 'Título do anúncio',
  description = 'Descrição do anúncio',
  callToAction = 'LEARN_MORE',
  mediaUrl,
  mediaType = 'image',
  linkUrl = 'seusite.com',
}: AdPreviewProps) {
  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url || 'seusite.com';
    }
  };

  return (
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="feed">📱 Feed</TabsTrigger>
        <TabsTrigger value="stories">📖 Stories</TabsTrigger>
      </TabsList>

      {/* Feed Preview */}
      <TabsContent value="feed">
        <Card className="max-w-[320px] mx-auto bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {pageName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {pageName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Patrocinado</span>
                    <span>·</span>
                    <Globe className="h-3 w-3" />
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Primary Text */}
            <div className="px-3 pb-3">
              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                {primaryText}
              </p>
            </div>

            {/* Media */}
            <div className="relative aspect-square bg-muted flex items-center justify-center">
              {mediaUrl ? (
                mediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-4">
                        <Play className="h-8 w-8 text-white" fill="white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-16 w-16" />
                  <span className="text-sm">Sua imagem aqui</span>
                </div>
              )}
            </div>

            {/* Link Info */}
            <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase">
                  {extractDomain(linkUrl)}
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {headline}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {description}
                </p>
              </div>
              <Button size="sm" className="ml-2 shrink-0">
                {callToActionLabels[callToAction] || 'Saiba Mais'}
              </Button>
            </div>

            {/* Engagement */}
            <div className="border-t border-border p-2">
              <div className="flex justify-around">
                <Button variant="ghost" size="sm" className="flex-1 gap-1 text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-xs">Curtir</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 gap-1 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">Comentar</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 gap-1 text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs">Compartilhar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Stories Preview */}
      <TabsContent value="stories">
        <div className="max-w-[200px] mx-auto">
          <Card className="overflow-hidden bg-gradient-to-b from-background to-muted aspect-[9/16] relative">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Stories Header */}
              <div className="p-3 flex items-center gap-2 z-10">
                <Avatar className="h-8 w-8 ring-2 ring-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {pageName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    {pageName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Patrocinado
                  </p>
                </div>
              </div>

              {/* Media */}
              <div className="flex-1 flex items-center justify-center bg-muted/50">
                {mediaUrl ? (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              {/* CTA */}
              <div className="p-3 space-y-2">
                <p className="text-xs text-foreground text-center line-clamp-2">
                  {primaryText}
                </p>
                <Button size="sm" className="w-full text-xs">
                  {callToActionLabels[callToAction] || 'Saiba Mais'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface MediaUploadProps {
  onUpload: (file: File, preview: string, type: 'image' | 'video') => void;
  onRemove: () => void;
  value?: {
    file?: File;
    preview?: string;
    type?: 'image' | 'video';
  };
  disabled?: boolean;
}

export function MediaUpload({
  onUpload,
  onRemove,
  value,
  disabled = false,
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Formato não suportado. Use imagem (JPG, PNG) ou vídeo (MP4, MOV).');
      return false;
    }

    // Check file size
    const maxImageSize = 30 * 1024 * 1024; // 30MB
    const maxVideoSize = 4 * 1024 * 1024 * 1024; // 4GB

    if (isImage && file.size > maxImageSize) {
      setError('Imagem muito grande. Máximo: 30MB.');
      return false;
    }

    if (isVideo && file.size > maxVideoSize) {
      setError('Vídeo muito grande. Máximo: 4GB.');
      return false;
    }

    return true;
  };

  const processFile = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      setIsUploading(true);

      try {
        // Create preview URL
        const preview = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';

        // Simulate upload delay (will be replaced with real API call)
        await new Promise((resolve) => setTimeout(resolve, 500));

        onUpload(file, preview, type);
      } catch {
        setError('Erro ao processar arquivo. Tente novamente.');
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Show preview if file is uploaded
  if (value?.preview) {
    return (
      <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
        {/* Preview */}
        <div className="aspect-video relative">
          {value.type === 'video' ? (
            <video
              src={value.preview}
              className="w-full h-full object-contain bg-black"
              controls
            />
          ) : (
            <img
              src={value.preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          )}

          {/* Remove button */}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={onRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* File info */}
        <div className="p-3 border-t border-border flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {value.type === 'video' ? (
              <Video className="h-5 w-5 text-primary" />
            ) : (
              <ImageIcon className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {value.file?.name || 'Arquivo'}
            </p>
            <p className="text-xs text-muted-foreground">
              {value.file ? formatFileSize(value.file.size) : ''} • {value.type === 'video' ? 'Vídeo' : 'Imagem'}
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-success shrink-0" />
        </div>
      </div>
    );
  }

  // Upload dropzone
  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 pointer-events-none',
          error && 'border-destructive'
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-sm font-medium text-foreground">
                Processando arquivo...
              </p>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Video className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                Arraste ou clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG até 30MB ou MP4, MOV até 4GB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Format hints */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <ImageIcon className="h-3 w-3" />
          <span>Recomendado: 1080x1080px</span>
        </div>
        <div className="flex items-center gap-1">
          <Video className="h-3 w-3" />
          <span>Recomendado: 15-60 segundos</span>
        </div>
      </div>
    </div>
  );
}

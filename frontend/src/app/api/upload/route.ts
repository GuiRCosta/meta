import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/upload - Upload de mídia para Supabase Storage
 * 
 * Faz upload do arquivo para o bucket 'campaign-media' do Supabase.
 * Retorna a URL pública do arquivo.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Formato não suportado. Use imagem (JPG, PNG, GIF, WebP) ou vídeo (MP4, MOV, WebM).' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit from bucket config)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 50MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4');
    const fileName = `${session.user.id}/${timestamp}_${randomId}.${extension}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('campaign-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: `Erro no upload: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('campaign-media')
      .getPublicUrl(data.path);

    const publicUrl = urlData.publicUrl;

    // Return response based on file type
    if (isImage) {
      return NextResponse.json({
        success: true,
        type: 'image',
        url: publicUrl,
        path: data.path,
        fileName: file.name,
        size: file.size,
        message: 'Imagem enviada com sucesso!',
      });
    } else {
      return NextResponse.json({
        success: true,
        type: 'video',
        url: publicUrl,
        path: data.path,
        fileName: file.name,
        size: file.size,
        message: 'Vídeo enviado com sucesso!',
      });
    }
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload - Remove arquivo do Supabase Storage
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Path do arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Verify user owns the file (path starts with their user id)
    if (!path.startsWith(session.user.id)) {
      return NextResponse.json(
        { error: 'Não autorizado a deletar este arquivo' },
        { status: 403 }
      );
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('campaign-media')
      .remove([path]);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: `Erro ao deletar: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar arquivo' },
      { status: 500 }
    );
  }
}

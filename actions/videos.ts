'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { slugify } from '@/lib/utils';

const videoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  access_type: z.enum(['PUBLIC', 'AUTHENTICATED', 'PRIVATE', 'ROLE_BASED']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export async function createVideo(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const raw = Object.fromEntries(formData);
  const parsed = videoSchema.safeParse(raw);
  if (!parsed.success) return { error: 'Données invalides' };

  const slug = `${slugify(parsed.data.title)}-${Date.now()}`;
  const { error } = await supabase.from('videos').insert({
    ...parsed.data,
    slug,
    author_id: user.id,
    published_at: parsed.data.status === 'PUBLISHED' ? new Date().toISOString() : null,
  });

  if (error) return { error: error.message };
  revalidatePath('/admin/videos');
  revalidatePath('/videos');
  return { success: 'Vidéo créée.' };
}

export async function updateVideo(id: string, formData: FormData) {
  const supabase = createClient();
  const raw = Object.fromEntries(formData);
  const parsed = videoSchema.partial().safeParse(raw);
  if (!parsed.success) return { error: 'Données invalides' };

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === 'PUBLISHED') {
    update.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from('videos').update(update).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/videos');
  revalidatePath('/videos');
  return { success: 'Vidéo mise à jour.' };
}

export async function deleteVideo(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/videos');
  revalidatePath('/videos');
  return { success: 'Vidéo supprimée.' };
}

export async function toggleFavorite(videoId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
  } else {
    await supabase.from('favorites').insert({ user_id: user.id, video_id: videoId });
  }

  revalidatePath('/favorites');
  revalidatePath('/videos');
  return { success: true };
}

export async function updateWatchHistory(videoId: string, progress: number, duration: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const completed = progress >= duration * 0.9;
  await supabase.from('watch_history').upsert({
    user_id: user.id,
    video_id: videoId,
    progress,
    duration,
    completed,
  }, { onConflict: 'user_id,video_id' });
}

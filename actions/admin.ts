'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const userUpdateSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']).optional(),
  full_name: z.string().min(2).optional(),
});

export async function updateUser(userId: string, formData: FormData) {
  const supabase = createServiceClient();
  const raw = Object.fromEntries(formData);
  const parsed = userUpdateSchema.safeParse(raw);
  if (!parsed.success) return { error: 'Données invalides' };

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: 'Utilisateur mis à jour.' };
}

export async function deleteUser(userId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: 'Utilisateur supprimé.' };
}

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export async function createCategory(formData: FormData) {
  const supabase = createServiceClient();
  const raw = Object.fromEntries(formData);
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { error: 'Données invalides' };

  const slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const { error } = await supabase.from('categories').insert({ ...parsed.data, slug });
  if (error) return { error: error.message };
  revalidatePath('/admin/categories');
  return { success: 'Catégorie créée.' };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createServiceClient();
  const raw = Object.fromEntries(formData);
  const parsed = categorySchema.partial().safeParse(raw);
  if (!parsed.success) return { error: 'Données invalides' };

  const { error } = await supabase.from('categories').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/categories');
  return { success: 'Catégorie mise à jour.' };
}

export async function deleteCategory(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/categories');
  return { success: 'Catégorie supprimée.' };
}

const liveSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  hls_url: z.string().url(),
  stream_key: z.string().min(1),
  category_id: z.string().uuid().optional(),
  access_type: z.enum(['PUBLIC', 'AUTHENTICATED', 'PRIVATE', 'ROLE_BASED']),
});

export async function createLive(formData: FormData) {
  const supabase = createServiceClient();
  const raw = Object.fromEntries(formData);
  const parsed = liveSchema.safeParse(raw);
  if (!parsed.success) return { error: 'Données invalides' };

  const { error } = await supabase.from('live_streams').insert(parsed.data);
  if (error) return { error: error.message };
  revalidatePath('/admin/live');
  revalidatePath('/live');
  return { success: 'Live créé.' };
}

export async function updateLiveStatus(id: string, status: 'OFFLINE' | 'LIVE' | 'ENDED') {
  const supabase = createServiceClient();
  const update: Record<string, unknown> = { status };
  if (status === 'LIVE') update.started_at = new Date().toISOString();
  if (status === 'ENDED') update.ended_at = new Date().toISOString();

  const { error } = await supabase.from('live_streams').update(update).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/live');
  revalidatePath('/live');
  return { success: 'Statut mis à jour.' };
}

export async function deleteLive(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('live_streams').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/live');
  return { success: 'Live supprimé.' };
}

const settingsSchema = z.object({
  site_name: z.string().min(1),
  site_description: z.string().optional(),
  primary_color: z.string().optional(),
  player_autoplay: z.string().optional(),
  live_enabled: z.string().optional(),
  registration_enabled: z.string().optional(),
});

export async function updateSettings(formData: FormData) {
  const supabase = createServiceClient();
  const raw = Object.fromEntries(formData);
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { error: 'Données invalides' };

  const update = {
    ...parsed.data,
    player_autoplay: parsed.data.player_autoplay === 'on',
    live_enabled: parsed.data.live_enabled === 'on',
    registration_enabled: parsed.data.registration_enabled === 'on',
  };

  const { error } = await supabase
    .from('settings')
    .update(update)
    .eq('id', '00000000-0000-0000-0000-000000000001');

  if (error) return { error: error.message };
  revalidatePath('/admin/settings');
  return { success: 'Paramètres mis à jour.' };
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
  full_name: z.string().min(2, 'Nom trop court'),
});

export async function login(_prevState: unknown, formData: FormData) {
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData);
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.errors.map(e => e.message).join(', ') };
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { error: error.message };
    }

    if (!authData.user) {
      return { error: 'Connexion impossible' };
    }

    // Vérifier le statut du profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('user_id', authData.user.id)
      .single();

    if (profile?.status === 'SUSPENDED') {
      await supabase.auth.signOut();
      return { error: 'Votre compte est suspendu.' };
    }

    revalidatePath('/', 'layout');
    return { success: true, redirectTo: '/dashboard' };
  } catch (err: any) {
    console.error('Login error:', err);
    return { error: err?.message || 'Une erreur est survenue. Vérifiez votre configuration Supabase.' };
  }
}

export async function register(_prevState: unknown, formData: FormData) {
  try {
    const supabase = createClient();
    const data = Object.fromEntries(formData);
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.errors.map(e => e.message).join(', ') };
    }

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.full_name },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.' };
  } catch (err: any) {
    console.error('Register error:', err);
    return { error: err?.message || 'Une erreur est survenue.' };
  }
}

export async function logout() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    return { redirectTo: '/login' };
  } catch (err: any) {
    console.error('Logout error:', err);
    return { error: err?.message || 'Erreur lors de la déconnexion.' };
  }
}

export async function resetPassword(_prevState: unknown, formData: FormData) {
  try {
    const supabase = createClient();
    const email = z.string().email('Email invalide').parse(formData.get('email'));
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) return { error: error.message };
    return { success: 'Email de réinitialisation envoyé.' };
  } catch (err: any) {
    console.error('Reset password error:', err);
    return { error: err?.message || 'Une erreur est survenue.' };
  }
}

export async function updatePassword(_prevState: unknown, formData: FormData) {
  try {
    const supabase = createClient();
    const password = z.string().min(8, '8 caractères minimum').parse(formData.get('password'));
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { success: 'Mot de passe mis à jour.', redirectTo: '/dashboard' };
  } catch (err: any) {
    console.error('Update password error:', err);
    return { error: err?.message || 'Une erreur est survenue.' };
  }
}

export async function updateProfile(_prevState: unknown, formData: FormData) {
  try {
    const supabase = createClient();
    const full_name = z.string().min(2, 'Nom trop court').parse(formData.get('full_name'));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Non authentifié' };

    const { error } = await supabase
      .from('profiles')
      .update({ full_name })
      .eq('user_id', user.id);

    if (error) return { error: error.message };
    revalidatePath('/profile');
    return { success: 'Profil mis à jour.' };
  } catch (err: any) {
    console.error('Update profile error:', err);
    return { error: err?.message || 'Une erreur est survenue.' };
  }
}

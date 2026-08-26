'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { resetPassword } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" variant="bk" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Envoi...' : 'Envoyer le lien'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(resetPassword, null);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-white/5 bg-bk-dark-card p-6 shadow-xl">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="vous@exemple.com" required autoComplete="email" />
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg bg-bk-success/10 border border-bk-success/20 px-3 py-2 text-sm text-bk-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.success}
        </div>
      )}

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-bk-red hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}

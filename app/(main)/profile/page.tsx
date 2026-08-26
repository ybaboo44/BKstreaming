import { createClient } from '@/lib/supabase/server';
import { updateProfile, logout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Vous devez être connecté pour accéder à votre profil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  async function handleUpdateProfile(formData: FormData): Promise<void> {
    await updateProfile(null, formData);
  }

  async function handleLogout(): Promise<void> {
    await logout();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        Mon profil
      </h1>

      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={profile?.avatar_url || undefined}
              alt={profile?.full_name || 'Avatar'}
            />

            <AvatarFallback className="text-lg">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-lg font-semibold">
              {profile?.full_name || user.email}
            </p>

            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>

            {profile?.role && (
              <Badge
                variant="secondary"
                className="mt-1"
              >
                {profile.role}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form
            action={handleUpdateProfile}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Nom complet
              </Label>

              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name || ''}
                required
              />
            </div>

            <Button
              type="submit"
              variant="bk"
            >
              Mettre à jour
            </Button>
          </form>
        </CardContent>
      </Card>

      <form
        action={handleLogout}
        className="mt-6"
      >
        <Button
          type="submit"
          variant="destructive"
          className="w-full"
        >
          Se déconnecter
        </Button>
      </form>
    </div>
  );
}
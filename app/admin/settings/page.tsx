import { createClient } from '@/lib/supabase/server';
import { updateUser } from '@/actions/admin';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, UserCog } from 'lucide-react';

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Users className="h-7 w-7" />
          Utilisateurs
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Gérez les utilisateurs et leurs rôles sur BK Streaming.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total utilisateurs
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {users?.length || 0}
                </p>
              </div>

              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Administrateurs
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {users?.filter(
                    (u) =>
                      u.role === 'ADMIN' ||
                      u.role === 'SUPER_ADMIN'
                  ).length || 0}
                </p>
              </div>

              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Éditeurs
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {users?.filter((u) => u.role === 'EDITOR').length ||
                    0}
                </p>
              </div>

              <UserCog className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Utilisateurs
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {users?.filter((u) => u.role === 'USER').length || 0}
                </p>
              </div>

              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des utilisateurs</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nom
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Rôle
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>

                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users?.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    {/* Nom */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-semibold">
                          {u.full_name
                            ? u.full_name.charAt(0).toUpperCase()
                            : 'U'}
                        </div>

                        <div>
                          <p className="font-medium">
                            {u.full_name || 'Utilisateur'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.email || '—'}
                    </td>

                    {/* Rôle */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          u.role === 'SUPER_ADMIN'
                            ? 'destructive'
                            : u.role === 'ADMIN'
                              ? 'default'
                              : u.role === 'EDITOR'
                                ? 'secondary'
                                : 'outline'
                        }
                      >
                        {u.role || 'USER'}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.created_at
                        ? new Date(
                            u.created_at
                          ).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <form
                        action={async (formData) => {
                          'use server';

                          await updateUser(
                            u.user_id,
                            formData
                          );
                        }}
                        className="inline-flex items-center gap-2"
                      >
                        <select
                          name="role"
                          defaultValue={u.role || 'USER'}
                          className="h-8 rounded border border-white/10 bg-background px-2 text-xs"
                        >
                          <option value="USER">USER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">
                            SUPER_ADMIN
                          </option>
                        </select>

                        <Button
                          type="submit"
                          size="sm"
                          variant="bk"
                        >
                          Enregistrer
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Aucun utilisateur */}
          {(!users || users.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              Aucun utilisateur trouvé.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
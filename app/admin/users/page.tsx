import { createClient } from '@/lib/supabase/server';
import { updateUser } from '@/actions/admin';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default async function AdminUsersPage() {
  const supabase = createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Users className="h-6 w-6" />
          Utilisateurs
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nom
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Rôle
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Statut
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Dernière connexion
                  </th>

                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users?.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    {/* Nom */}
                    <td className="px-4 py-3">
                      {u.full_name || '—'}
                    </td>

                    {/* Rôle */}
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {u.role || 'USER'}
                      </Badge>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          u.status === 'ACTIVE'
                            ? 'success'
                            : u.status === 'SUSPENDED'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {u.status || 'PENDING'}
                      </Badge>
                    </td>

                    {/* Dernière connexion */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.last_login_at
                        ? new Date(
                            u.last_login_at
                          ).toLocaleDateString('fr-FR')
                        : 'Jamais'}
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
                        {/* Rôle */}
                        <select
                          name="role"
                          defaultValue={u.role || 'USER'}
                          className="h-8 rounded border border-white/10 bg-transparent px-2 text-xs"
                        >
                          <option value="USER">USER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">
                            SUPER_ADMIN
                          </option>
                        </select>

                        {/* Statut */}
                        <select
                          name="status"
                          defaultValue={u.status || 'PENDING'}
                          className="h-8 rounded border border-white/10 bg-transparent px-2 text-xs"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PENDING">PENDING</option>
                          <option value="SUSPENDED">
                            SUSPENDED
                          </option>
                        </select>

                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          ✓
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
            <div className="py-10 text-center text-muted-foreground">
              Aucun utilisateur trouvé.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
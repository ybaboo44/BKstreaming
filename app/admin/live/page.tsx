import { createClient } from '@/lib/supabase/server';
import { createLive, updateLiveStatus, deleteLive } from '@/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Radio, Play, Square, Trash2 } from 'lucide-react';

export default async function AdminLivePage() {
  const supabase = createClient();

  const { data: streams } = await supabase
    .from('live_streams')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-3 text-3xl font-bold">
        <Radio className="h-6 w-6" />
        Gestion du Live
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau live</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            action={async (formData) => {
              await createLive(formData);
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input name="title" required />
            </div>

            <div className="space-y-2">
              <Label>Stream Key</Label>
              <Input name="stream_key" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea name="description" rows={2} />
            </div>

            <div className="space-y-2">
              <Label>URL HLS</Label>
              <Input
                name="hls_url"
                placeholder="https://stream.../index.m3u8"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>

              <select
                name="category_id"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="">—</option>

                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Accès</Label>

              <select
                name="access_type"
                defaultValue="AUTHENTICATED"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="PUBLIC">Public</option>
                <option value="AUTHENTICATED">Authentifié</option>
                <option value="PRIVATE">Privé</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" variant="bk">
                Créer le live
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Titre
                </th>

                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Statut
                </th>

                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  URL HLS
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {streams?.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-medium">
                    {s.title}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        s.status === 'LIVE'
                          ? 'live'
                          : s.status === 'ENDED'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {s.status}
                    </Badge>
                  </td>

                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {s.hls_url}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {s.status !== 'LIVE' && (
                        <form
                          action={async () => {
                            await updateLiveStatus(s.id, 'LIVE');
                          }}
                        >
                          <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-bk-success"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </form>
                      )}

                      {s.status === 'LIVE' && (
                        <form
                          action={async () => {
                            await updateLiveStatus(s.id, 'ENDED');
                          }}
                        >
                          <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </form>
                      )}

                      <form
                        action={async () => {
                          await deleteLive(s.id);
                        }}
                      >
                        <Button
                          type="submit"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
import { createClient } from '@/lib/supabase/server';
import { deleteVideo } from '@/actions/videos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Video, Plus, Pencil, Trash2 } from 'lucide-react';

export default async function AdminVideosPage() {
  const supabase = createClient();
  const { data: videos } = await supabase.from('videos').select('*, category:categories(*)').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Video className="h-6 w-6" /> Vidéos
        </h1>
        <Link href="/admin/videos/new">
          <Button variant="bk" className="gap-2"><Plus className="h-4 w-4" /> Nouvelle vidéo</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Titre</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Catégorie</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Accès</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vues</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos?.map((v) => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium">{v.title}</td>
                    <td className="px-4 py-3">{v.category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={v.status === 'PUBLISHED' ? 'success' : v.status === 'DRAFT' ? 'warning' : 'secondary'}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{v.access_type}</Badge></td>
                    <td className="px-4 py-3">{v.views}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link href={`/videos/${v.slug}`} target="_blank">
                          <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                        </Link>
                        <form action={deleteVideo.bind(null, v.id)}>
                          <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

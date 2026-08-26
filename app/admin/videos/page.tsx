import { createClient } from '@/lib/supabase/server';
import { deleteVideo } from '@/actions/videos';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Video, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminVideosPage() {
  const supabase = createClient();

  const { data: videos } = await supabase
    .from('videos')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  async function handleDeleteVideo(id: string): Promise<void> {
    'use server';

    const result = await deleteVideo(id);

    // Si ton ancienne action retourne une erreur,
    // on la transforme en vraie erreur serveur.
    if (
      result &&
      typeof result === 'object' &&
      'error' in result &&
      result.error
    ) {
      throw new Error(result.error);
    }

    revalidatePath('/admin/videos');
    revalidatePath('/videos');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Video className="h-6 w-6" />
          Vidéos
        </h1>

        <Link href="/admin/videos/new">
          <Button variant="bk" className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle vidéo
          </Button>
        </Link>
      </div>

      {/* Videos table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Titre
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Catégorie
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Statut
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Accès
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Vues
                  </th>

                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {videos?.map((video) => (
                  <tr
                    key={video.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    {/* Titre */}
                    <td className="px-4 py-3 font-medium">
                      {video.title}
                    </td>

                    {/* Catégorie */}
                    <td className="px-4 py-3">
                      {video.category?.name || '—'}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          video.status === 'PUBLISHED'
                            ? 'success'
                            : video.status === 'DRAFT'
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {video.status}
                      </Badge>
                    </td>

                    {/* Accès */}
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {video.access_type}
                      </Badge>
                    </td>

                    {/* Vues */}
                    <td className="px-4 py-3">
                      {video.views ?? 0}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {/* Voir */}
                        <Link
                          href={`/videos/${video.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Voir la vidéo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>

                        {/* Supprimer */}
                        <form action={handleDeleteVideo.bind(null, video.id)}>
                          <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Aucun résultat */}
                {(!videos || videos.length === 0) && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      Aucune vidéo trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
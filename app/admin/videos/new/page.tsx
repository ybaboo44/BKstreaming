import { createVideo } from '@/actions/videos';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewVideoPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/videos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>
      <h1 className="text-3xl font-bold">Nouvelle vidéo</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <form action={createVideo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url">URL vidéo / HLS</Label>
              <Input id="video_url" name="video_url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">URL miniature</Label>
              <Input id="thumbnail_url" name="thumbnail_url" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Catégorie</Label>
                <select id="category_id" name="category_id" className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
                  <option value="">—</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_type">Accès</Label>
                <select id="access_type" name="access_type" defaultValue="AUTHENTICATED" className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
                  <option value="PUBLIC">Public</option>
                  <option value="AUTHENTICATED">Authentifié</option>
                  <option value="PRIVATE">Privé</option>
                  <option value="ROLE_BASED">Par rôle</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select id="status" name="status" defaultValue="DRAFT" className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
            <Button type="submit" variant="bk" className="w-full">Créer la vidéo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

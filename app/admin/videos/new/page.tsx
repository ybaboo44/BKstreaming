import { createVideo } from '@/actions/videos';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewVideoPage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="max-w-2xl space-y-6">
      {/* Retour */}
      <Link
        href="/admin/videos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      {/* Titre */}
      <h1 className="text-3xl font-bold">
        Nouvelle vidéo
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>
            Ajouter une vidéo
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            action={async (formData) => {
              'use server';

              await createVideo(formData);
            }}
            className="space-y-4"
          >
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre
              </Label>

              <Input
                id="title"
                name="title"
                placeholder="Titre de la vidéo"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>

              <Textarea
                id="description"
                name="description"
                placeholder="Description de la vidéo..."
                rows={4}
              />
            </div>

            {/* URL vidéo */}
            <div className="space-y-2">
              <Label htmlFor="video_url">
                URL vidéo / HLS
              </Label>

              <Input
                id="video_url"
                name="video_url"
                type="url"
                placeholder="https://..."
              />
            </div>

            {/* URL miniature */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">
                URL miniature
              </Label>

              <Input
                id="thumbnail_url"
                name="thumbnail_url"
                type="url"
                placeholder="https://..."
              />
            </div>

            {/* Catégorie + accès */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Catégorie */}
              <div className="space-y-2">
                <Label htmlFor="category_id">
                  Catégorie
                </Label>

                <select
                  id="category_id"
                  name="category_id"
                  defaultValue=""
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">
                    —
                  </option>

                  {categories?.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Accès */}
              <div className="space-y-2">
                <Label htmlFor="access_type">
                  Accès
                </Label>

                <select
                  id="access_type"
                  name="access_type"
                  defaultValue="AUTHENTICATED"
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="PUBLIC">
                    Public
                  </option>

                  <option value="AUTHENTICATED">
                    Authentifié
                  </option>

                  <option value="PRIVATE">
                    Privé
                  </option>

                  <option value="ROLE_BASED">
                    Par rôle
                  </option>
                </select>
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Statut
              </Label>

              <select
                id="status"
                name="status"
                defaultValue="DRAFT"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="DRAFT">
                  Brouillon
                </option>

                <option value="PUBLISHED">
                  Publié
                </option>

                <option value="ARCHIVED">
                  Archivé
                </option>
              </select>
            </div>

            {/* Bouton */}
            <Button
              type="submit"
              variant="bk"
              className="w-full"
            >
              Créer la vidéo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
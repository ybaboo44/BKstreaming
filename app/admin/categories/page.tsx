import { createClient } from '@/lib/supabase/server';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/actions/admin';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, Trash2 } from 'lucide-react';

export default async function AdminCategoriesPage() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-3 text-3xl font-bold">
        <FolderOpen className="h-6 w-6" />
        Catégories
      </h1>

      {/* Nouvelle catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle catégorie</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            action={async (formData: FormData) => {
              await createCategory(formData);
            }}
            className="flex items-end gap-4"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>

            <Button type="submit" variant="bk">
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Catégories existantes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardContent className="space-y-4 pt-6">
              {/* Modification */}
              <form
                action={async (formData: FormData) => {
                  await updateCategory(category.id, formData);
                }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Label htmlFor={`name-${category.id}`}>
                    Nom
                  </Label>

                  <Input
                    id={`name-${category.id}`}
                    name="name"
                    defaultValue={category.name}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${category.id}`}>
                    Description
                  </Label>

                  <Input
                    id={`description-${category.id}`}
                    name="description"
                    defaultValue={category.description || ''}
                  />
                </div>

                <Button
                  type="submit"
                  variant="bk"
                  size="sm"
                  className="w-full"
                >
                  Mettre à jour
                </Button>
              </form>

              {/* Suppression */}
              <form
                action={async () => {
                  await deleteCategory(category.id);
                }}
              >
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
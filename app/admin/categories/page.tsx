import { createClient } from '@/lib/supabase/server';
import { createCategory, updateCategory, deleteCategory } from '@/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FolderOpen, Trash2 } from 'lucide-react';

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3"><FolderOpen className="h-6 w-6" /> Catégories</h1>

      <Card>
        <CardHeader><CardTitle>Nouvelle catégorie</CardTitle></CardHeader>
        <CardContent>
          <form action={createCategory} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2"><Label>Nom</Label><Input name="name" required /></div>
            <div className="flex-1 space-y-2"><Label>Description</Label><Input name="description" /></div>
            <Button type="submit" variant="bk">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-6 space-y-3">
              <form action={updateCategory.bind(null, c.id)} className="space-y-3">
                <div className="space-y-2"><Label>Nom</Label><Input name="name" defaultValue={c.name} required /></div>
                <div className="space-y-2"><Label>Description</Label><Input name="description" defaultValue={c.description || ''} /></div>
                <div className="flex gap-2">
                  <Button type="submit" variant="bk" size="sm" className="flex-1">Mettre à jour</Button>
                  <form action={deleteCategory.bind(null, c.id)}>
                    <Button type="submit" variant="destructive" size="icon" className="h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                  </form>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

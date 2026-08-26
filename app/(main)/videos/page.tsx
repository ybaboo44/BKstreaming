import { createClient } from '@/lib/supabase/server';
import { VideoGrid } from '@/components/video/video-grid';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function VideosPage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient();
  const category = searchParams.category;

  let query = supabase
    .from('videos')
    .select('*, category:categories(*)')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category_id', category);

  const { data: videos } = await query;
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vidéos</h1>

      <Tabs defaultValue={category || 'all'} className="mb-8">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="all" asChild>
            <a href="/videos">Tout</a>
          </TabsTrigger>
          {categories?.map((c) => (
            <TabsTrigger key={c.id} value={c.id} asChild>
              <a href={`/videos?category=${c.id}`}>{c.name}</a>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <VideoGrid videos={videos || []} emptyMessage="Aucune vidéo dans cette catégorie." />
    </div>
  );
}

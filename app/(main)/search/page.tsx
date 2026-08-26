import { createClient } from '@/lib/supabase/server';
import { VideoGrid } from '@/components/video/video-grid';
import { Search } from 'lucide-react';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient();
  const query = searchParams.q || '';

  const { data: videos } = await supabase
    .from('videos')
    .select('*, category:categories(*)')
    .eq('status', 'PUBLISHED')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Search className="h-6 w-6 text-bk-neutral" />
        <h1 className="text-3xl font-bold">Résultats pour "{query}"</h1>
      </div>
      <VideoGrid videos={videos || []} emptyMessage={`Aucun résultat pour "${query}".`} />
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { VideoGrid } from '@/components/video/video-grid';
import { Heart } from 'lucide-react';

export default async function FavoritesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, video:videos(*, category:categories(*))')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const videos = favorites?.map((f) => f.video).filter(Boolean) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="h-6 w-6 text-bk-red" />
        <h1 className="text-3xl font-bold">Mes favoris</h1>
      </div>
      <VideoGrid videos={videos as any} emptyMessage="Vous n'avez pas encore de favoris." />
    </div>
  );
}

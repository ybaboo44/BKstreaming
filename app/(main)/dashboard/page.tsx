import { createClient } from '@/lib/supabase/server';
import { VideoGrid } from '@/components/video/video-grid';
import { VideoCard } from '@/components/video/video-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Radio, Clock, Heart, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: recent } = await supabase
    .from('videos')
    .select('*, category:categories(*)')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(4);

  const { data: continueWatching } = await supabase
    .from('watch_history')
    .select('*, video:videos(*, category:categories(*))')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(4);

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, video:videos(*, category:categories(*))')
    .eq('user_id', user!.id)
    .limit(4);

  const { data: live } = await supabase
    .from('live_streams')
    .select('*, category:categories(*)')
    .eq('status', 'LIVE')
    .limit(1)
    .single();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold">Bienvenue sur BK Streaming</h1>
        <p className="text-muted-foreground mt-1">Votre univers vidéo privé</p>
      </div>

      {live && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Radio className="h-5 w-5 text-bk-red" />
            <h2 className="text-xl font-bold">Direct en cours</h2>
            <Badge variant="live">LIVE</Badge>
          </div>
          <Link href="/live" className="block overflow-hidden rounded-xl bg-bk-dark-card border border-white/5 hover:border-bk-red/30 transition">
            <div className="p-6">
              <h3 className="text-lg font-semibold">{live.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{live.description}</p>
            </div>
          </Link>
        </section>
      )}

      {continueWatching && continueWatching.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-bk-neutral" />
            <h2 className="text-xl font-bold">Continuer à regarder</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {continueWatching.map((h) => h.video && (
              <VideoCard key={h.id} video={h.video as any} progress={(h.progress / (h.duration || 1)) * 100} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-bk-neutral" />
            <h2 className="text-xl font-bold">Vidéos récentes</h2>
          </div>
          <Link href="/videos"><Button variant="ghost" size="sm">Voir tout</Button></Link>
        </div>
        <VideoGrid videos={recent || []} />
      </section>

      {favorites && favorites.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-bk-red" />
            <h2 className="text-xl font-bold">Vos favoris</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.map((f) => f.video && (
              <VideoCard key={f.id} video={f.video as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

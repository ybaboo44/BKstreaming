import { createClient } from '@/lib/supabase/server';
import { VideoPlayer } from '@/components/video/video-player';
import { Badge } from '@/components/ui/badge';
import { Radio, Users } from 'lucide-react';

export default async function LivePage() {
  const supabase = createClient();
  const { data: live } = await supabase
    .from('live_streams')
    .select('*, category:categories(*)')
    .eq('status', 'LIVE')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!live) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Radio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Le direct est actuellement hors ligne.</h1>
        <p className="text-muted-foreground mt-2">Revenez plus tard ou consultez nos vidéos à la demande.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        <Badge variant="live" className="gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          LIVE
        </Badge>
        {live.viewers_count > 0 && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {live.viewers_count} spectateurs
          </span>
        )}
      </div>

      <VideoPlayer src={live.hls_url} poster={live.thumbnail_url || undefined} title={live.title} autoPlay />

      <div className="mt-6">
        <h1 className="text-2xl font-bold">{live.title}</h1>
        <p className="mt-2 text-muted-foreground">{live.description}</p>
        {live.category && <Badge variant="secondary" className="mt-3">{live.category.name}</Badge>}
      </div>
    </div>
  );
}

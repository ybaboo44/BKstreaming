import { createClient } from '@/lib/supabase/server';
import { VideoPlayer } from '@/components/video/video-player';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toggleFavorite } from '@/actions/videos';
import Link from 'next/link';
import { Heart, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { formatViews } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function VideoPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: video } = await supabase
    .from('videos')
    .select('*, category:categories(*), author:profiles(full_name)')
    .eq('slug', params.slug)
    .single();

  if (!video) notFound();

  const { data: related } = await supabase
    .from('videos')
    .select('*, category:categories(*)')
    .eq('status', 'PUBLISHED')
    .eq('category_id', video.category_id)
    .neq('id', video.id)
    .limit(4);

  const { data: { user } } = await supabase.auth.getUser();
  let isFav = false;

  if (user) {
    const { data: fav } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('video_id', video.id).single();
    isFav = !!fav;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/videos" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Retour aux vidéos
      </Link>

      <VideoPlayer 
        src={video.video_url || ''} 
        poster={video.thumbnail_url || undefined}
        title={video.title}
        autoPlay={false}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{video.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {video.category && <Badge variant="secondary">{video.category.name}</Badge>}
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatViews(video.views)} vues</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(video.published_at || video.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            {user && (
              <form action={toggleFavorite.bind(null, video.id)}>
                <Button type="submit" variant="ghost" size="icon" className={isFav ? 'text-bk-red' : ''}>
                  <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                </Button>
              </form>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed">{video.description}</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Vidéos similaires</h3>
          {related?.map((v) => (
            <Link key={v.id} href={`/videos/${v.slug}`} className="flex gap-3 group">
              <div className="aspect-video w-32 shrink-0 rounded-lg bg-bk-dark-light overflow-hidden">
                {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-bk-red transition">{v.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{v.category?.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

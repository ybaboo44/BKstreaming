import { VideoCard } from './video-card';
import type { Video } from '@/types';

interface VideoGridProps {
  videos: Video[];
  emptyMessage?: string;
}

export function VideoGrid({ videos, emptyMessage = 'Aucune vidéo disponible.' }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

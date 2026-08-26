'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration, formatViews } from '@/lib/utils';
import type { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  progress?: number;
}

export function VideoCard({ video, progress }: VideoCardProps) {
  return (
    <Link href={`/videos/${video.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-bk-dark-light">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-bk-dark-light">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium">
          {video.duration ? formatDuration(video.duration) : 'LIVE'}
        </div>
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-bk-red" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bk-red/90 text-white shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-bk-red transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {video.category && <span>{video.category.name}</span>}
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(video.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}

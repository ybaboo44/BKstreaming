import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Eye, Clock } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const supabase = createClient();

  const { data: viewsByDay } = await supabase
    .from('analytics_events')
    .select('created_at')
    .eq('event_type', 'video_view')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
    .order('created_at', { ascending: true });

  const { data: topVideos } = await supabase
    .from('videos')
    .select('title, views')
    .order('views', { ascending: false })
    .limit(10);

  const totalViews = topVideos?.reduce((a, v) => a + (v.views || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3"><BarChart3 className="h-6 w-6" /> Analytics</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Vues totales</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{totalViews.toLocaleString()}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Événements (7j)</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{viewsByDay?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Vidéos</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{topVideos?.length || 0}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top vidéos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topVideos?.map((v, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-6 text-center text-muted-foreground font-mono">{i + 1}</span>
                <div className="flex-1"><p className="text-sm font-medium">{v.title}</p></div>
                <div className="w-32 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-bk-red h-full rounded-full" style={{ width: `${Math.min((v.views / (topVideos[0].views || 1)) * 100, 100)}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-16 text-right">{v.views}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

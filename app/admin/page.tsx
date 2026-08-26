import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Video, Radio, Eye } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: videosCount } = await supabase.from('videos').select('*', { count: 'exact', head: true });
  const { count: liveCount } = await supabase.from('live_streams').select('*', { count: 'exact', head: true });
  const { data: topVideos } = await supabase.from('videos').select('title, views').order('views', { ascending: false }).limit(5);

  const stats = [
    { label: 'Utilisateurs', value: usersCount || 0, icon: Users },
    { label: 'Vidéos', value: videosCount || 0, icon: Video },
    { label: 'Lives', value: liveCount || 0, icon: Radio },
    { label: 'Vues totales', value: topVideos?.reduce((a, v) => a + (v.views || 0), 0) || 0, icon: Eye },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vidéos les plus vues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topVideos?.map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm font-medium">{v.title}</span>
                <span className="text-sm text-muted-foreground">{v.views} vues</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

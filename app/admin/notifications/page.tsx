import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export default async function AdminNotificationsPage() {
  const supabase = createClient();
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, user:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3"><Bell className="h-6 w-6" /> Notifications</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Titre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Message</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lu</th>
              </tr></thead>
              <tbody>
                {notifications?.map((n) => (
                  <tr key={n.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-muted-foreground">{new Date(n.created_at).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{n.type}</Badge></td>
                    <td className="px-4 py-3 font-medium">{n.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{n.message}</td>
                    <td className="px-4 py-3">{n.read ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

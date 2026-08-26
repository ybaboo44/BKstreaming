import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default async function AdminAuditLogsPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, user:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3"><ShieldAlert className="h-6 w-6" /> Audit Logs</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilisateur</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entité</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
              </tr></thead>
              <tbody>
                {logs?.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3">{(l.user as any)?.full_name || 'Système'}</td>
                    <td className="px-4 py-3 font-medium">{l.action}</td>
                    <td className="px-4 py-3">{l.entity_type} {l.entity_id ? `(${l.entity_id.slice(0, 8)}...)` : ''}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.ip_address || '—'}</td>
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

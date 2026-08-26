import { createClient } from '@/lib/supabase/server';
import { updateSettings } from '@/actions/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  const supabase = createClient();

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="flex items-center gap-3 text-3xl font-bold">
        <Settings className="h-6 w-6" />
        Paramètres
      </h1>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <form
            action={async (formData) => {
              await updateSettings(formData);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Nom du site</Label>
              <Input
                name="site_name"
                defaultValue={settings?.site_name || 'BK Streaming'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="site_description"
                defaultValue={settings?.site_description || ''}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Couleur principale</Label>
              <Input
                name="primary_color"
                defaultValue={settings?.primary_color || '#E50914'}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="player_autoplay"
                  defaultChecked={settings?.player_autoplay}
                  className="rounded"
                />
                Autoplay
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="live_enabled"
                  defaultChecked={settings?.live_enabled !== false}
                  className="rounded"
                />
                Live activé
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="registration_enabled"
                  defaultChecked={settings?.registration_enabled !== false}
                  className="rounded"
                />
                Inscriptions
              </label>
            </div>

            <Button
              type="submit"
              variant="bk"
              className="w-full"
            >
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
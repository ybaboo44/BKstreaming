import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { VideoGrid } from '@/components/video/video-grid';
import { createClient } from '@/lib/supabase/server';
import { Play, Shield, Zap, Users, Radio } from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();
  const { data: videos } = await supabase
    .from('videos')
    .select('*, category:categories(*)')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: live } = await supabase
    .from('live_streams')
    .select('*, category:categories(*)')
    .eq('status', 'LIVE')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bk-red/20 via-bk-dark to-bk-dark" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-bk-red/30 bg-bk-red/10 px-4 py-1.5 text-sm text-bk-red">
            <Zap className="h-4 w-4" />
            Plateforme de streaming privée
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Regardez.<br />
            Profitez.<br />
            <span className="text-bk-red">Vivez l'instant.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            BK Streaming est votre plateforme privée de contenus vidéo en direct et à la demande.
            Sécurisée. Moderne. Pensée pour vous.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" variant="bk" className="gap-2 px-8">
                <Play className="h-4 w-4 fill-current" />
                Se connecter
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-8">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live */}
      {live && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-center gap-3">
            <Radio className="h-5 w-5 text-bk-red" />
            <h2 className="text-2xl font-bold">En direct</h2>
            <span className="rounded-full bg-bk-red px-2 py-0.5 text-xs font-bold text-white animate-pulse-live">
              LIVE
            </span>
          </div>
          <Link href="/live" className="group relative block overflow-hidden rounded-2xl">
            <div className="aspect-video bg-bk-dark-light">
              {live.thumbnail_url ? (
                <Image src={live.thumbnail_url} alt={live.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white sm:text-2xl">{live.title}</h3>
              {live.description && <p className="mt-2 max-w-xl text-sm text-white/70">{live.description}</p>}
            </div>
          </Link>
        </section>
      )}

      {/* Vidéos récentes */}
      {videos && videos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dernières vidéos</h2>
            <Link href="/videos" className="text-sm text-bk-red hover:underline">
              Voir tout
            </Link>
          </div>
          <VideoGrid videos={videos} />
        </section>
      )}

      {/* Fonctionnement */}
      <section className="border-t border-white/5 bg-bk-dark-card">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold">Comment ça marche</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, title: 'Créer un compte', desc: 'Inscrivez-vous en quelques secondes.' },
              { icon: Shield, title: 'Obtenir l'accès', desc: 'Votre compte est validé par un administrateur.' },
              { icon: Play, title: 'Se connecter', desc: 'Accédez à votre espace personnel.' },
              { icon: Zap, title: 'Regarder', desc: 'Profitez des contenus en direct et à la demande.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bk-red/10 text-bk-red">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

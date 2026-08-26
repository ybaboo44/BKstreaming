# BK Streaming

Plateforme privée de diffusion vidéo en direct et à la demande.

## Stack Technique

- **Next.js 14** — App Router, React Server Components, Server Actions
- **TypeScript** — Typage strict
- **Tailwind CSS** — Styling utilitaire
- **shadcn/ui** — Composants UI accessibles
- **Supabase** — Auth, PostgreSQL, Storage, Realtime
- **HLS.js** — Lecteur streaming HLS
- **Vercel** — Déploiement

## Architecture

```
OBS Studio → RTMP Server → HLS → BK Streaming (Next.js + Supabase)
```

Vercel ne sert **pas** de serveur RTMP. Un serveur externe (MediaMTX, Nginx RTMP, ou cloud) est requis.

## Installation

```bash
npm install
cp .env.example .env.local
# Remplissez vos variables d'environnement
npm run dev
```

## Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez le schéma SQL dans `supabase/migrations/000_initial_schema.sql`
3. Activez l'authentification par email dans Auth > Providers
4. Créez les buckets Storage : `videos`, `thumbnails`, `avatars`

## Rôles Utilisateurs

| Rôle | Permissions |
|------|------------|
| SUPER_ADMIN | Accès complet |
| ADMIN | Gestion utilisateurs, vidéos, live |
| EDITOR | Gestion des vidéos |
| USER | Lecture contenus autorisés |

## Streaming avec OBS

1. Installez [OBS Studio](https://obsproject.com)
2. Configurez un serveur RTMP (ex: MediaMTX)
3. Dans OBS : Paramètres → Stream → Custom
   - URL : `rtmp://votreserveur.com/live`
   - Stream Key : la clé définie dans `/admin/live`
4. Démarrez le streaming
5. Le serveur RTMP génère un flux HLS accessible via l'URL configurée

## Déploiement Vercel

```bash
vercel --prod
```

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables sensibles
- Validation Zod sur toutes les entrées
- Middleware Next.js pour la protection des routes
- Service Role Key jamais exposée côté client
- Audit logs sur toutes les actions administratives

## Structure du projet

```
app/
  (auth)/          — Pages d'authentification
  (main)/          — Pages utilisateur
  admin/           — Pages d'administration
  api/             — Route handlers API
components/
  ui/              — Composants shadcn/ui
  video/           — Lecteur, cartes vidéo
  layout/          — Navbar, Sidebar, Footer
  auth/            — Composants d'authentification
lib/
  supabase/        — Clients Supabase (server, client, middleware)
actions/           — Server Actions
hooks/             — Custom React hooks
types/             — Types TypeScript
supabase/
  migrations/      — Schéma PostgreSQL
```

## Licence

Propriétaire — BK Streaming

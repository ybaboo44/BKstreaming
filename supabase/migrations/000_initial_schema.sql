-- ============================================================
-- BK STREAMING — Schéma initial Supabase PostgreSQL
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('SUPER_ADMIN','ADMIN','EDITOR','USER')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('ACTIVE','PENDING','SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: users read own" ON profiles
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')
  ));

CREATE POLICY "Profiles: users update own" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Profiles: admin full access" ON profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')
  ));

-- Trigger: créer profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN NEW.email LIKE '%@admin.bk%' THEN 'ADMIN' ELSE 'USER' END,
    'PENDING'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories: public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories: admin write" ON categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN','EDITOR')
  ));

-- ============================================================
-- 3. VIDEOS
-- ============================================================
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  storage_path TEXT,
  duration INTEGER,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'AUTHENTICATED' CHECK (access_type IN ('PUBLIC','AUTHENTICATED','PRIVATE','ROLE_BASED')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_videos_slug ON videos(slug);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_category ON videos(category_id);
CREATE INDEX idx_videos_access ON videos(access_type);
CREATE INDEX idx_videos_published ON videos(published_at);

CREATE TRIGGER videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos: public read public" ON videos
  FOR SELECT USING (access_type = 'PUBLIC' AND status = 'PUBLISHED');

CREATE POLICY "Videos: auth read authenticated" ON videos
  FOR SELECT USING (
    access_type = 'AUTHENTICATED' AND status = 'PUBLISHED' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Videos: owner read" ON videos
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Videos: admin full" ON videos
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN','EDITOR')
  ));

-- ============================================================
-- 4. VIDEO_ACCESS (autorisations individuelles)
-- ============================================================
CREATE TABLE video_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

CREATE INDEX idx_video_access_video ON video_access(video_id);
CREATE INDEX idx_video_access_user ON video_access(user_id);

ALTER TABLE video_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "VideoAccess: owner read" ON video_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "VideoAccess: admin full" ON video_access
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')
  ));

-- ============================================================
-- 5. LIVE_STREAMS
-- ============================================================
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT NOT NULL UNIQUE,
  hls_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('OFFLINE','LIVE','ENDED')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  access_type TEXT NOT NULL DEFAULT 'AUTHENTICATED' CHECK (access_type IN ('PUBLIC','AUTHENTICATED','PRIVATE','ROLE_BASED')),
  viewers_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_live_status ON live_streams(status);

CREATE TRIGGER live_streams_updated_at BEFORE UPDATE ON live_streams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live: public read public" ON live_streams
  FOR SELECT USING (access_type = 'PUBLIC');

CREATE POLICY "Live: auth read authenticated" ON live_streams
  FOR SELECT USING (access_type = 'AUTHENTICATED' AND auth.uid() IS NOT NULL);

CREATE POLICY "Live: admin full" ON live_streams
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')
  ));

-- ============================================================
-- 6. WATCH_HISTORY
-- ============================================================
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_video ON watch_history(video_id);

CREATE TRIGGER watch_history_updated_at BEFORE UPDATE ON watch_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "WatchHistory: own" ON watch_history
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 7. FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favorites: own" ON favorites
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('NEW_VIDEO','NEW_LIVE','ACCOUNT_ACTIVATED','ANNOUNCEMENT','SYSTEM')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications: own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 9. ANALYTICS_EVENTS
-- ============================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  live_id UUID REFERENCES live_streams(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_video ON analytics_events(video_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics: admin read" ON analytics_events
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')
  ));

-- ============================================================
-- 10. AUDIT_LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AuditLogs: admin read" ON audit_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')
  ));

-- ============================================================
-- 11. SETTINGS
-- ============================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'BK Streaming',
  site_description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#E50914',
  player_autoplay BOOLEAN DEFAULT FALSE,
  player_default_quality TEXT DEFAULT 'auto',
  live_enabled BOOLEAN DEFAULT TRUE,
  registration_enabled BOOLEAN DEFAULT TRUE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings: public read" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings: admin write" ON settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')
  ));

-- Insert default settings
INSERT INTO settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. FONCTIONS UTILITAIRES
-- ============================================================

-- Vérifier si un utilisateur peut voir une vidéo
CREATE OR REPLACE FUNCTION can_access_video(video_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_access_type TEXT;
  v_status TEXT;
  v_author UUID;
  user_role TEXT;
BEGIN
  SELECT access_type, status, author_id INTO v_access_type, v_status, v_author
  FROM videos WHERE id = video_uuid;

  IF v_status != 'PUBLISHED' AND v_author != user_uuid THEN
    SELECT role INTO user_role FROM profiles WHERE user_id = user_uuid;
    IF user_role NOT IN ('ADMIN','SUPER_ADMIN','EDITOR') THEN
      RETURN FALSE;
    END IF;
  END IF;

  IF v_access_type = 'PUBLIC' THEN RETURN TRUE; END IF;
  IF user_uuid IS NULL THEN RETURN FALSE; END IF;
  IF v_access_type = 'AUTHENTICATED' THEN RETURN TRUE; END IF;
  IF v_author = user_uuid THEN RETURN TRUE; END IF;

  SELECT role INTO user_role FROM profiles WHERE user_id = user_uuid;
  IF user_role IN ('ADMIN','SUPER_ADMIN') THEN RETURN TRUE; END IF;
  IF v_access_type = 'ROLE_BASED' AND user_role IN ('EDITOR','ADMIN','SUPER_ADMIN') THEN RETURN TRUE; END IF;

  IF EXISTS (SELECT 1 FROM video_access WHERE video_id = video_uuid AND user_id = user_uuid) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrémenter les vues
CREATE OR REPLACE FUNCTION increment_video_views(video_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos SET views = views + 1 WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

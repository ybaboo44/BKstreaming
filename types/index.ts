export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
export type VideoStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type VideoAccessType = 'PUBLIC' | 'AUTHENTICATED' | 'PRIVATE' | 'ROLE_BASED';
export type LiveStatus = 'OFFLINE' | 'LIVE' | 'ENDED';
export type NotificationType = 'NEW_VIDEO' | 'NEW_LIVE' | 'ACCOUNT_ACTIVATED' | 'ANNOUNCEMENT' | 'SYSTEM';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  storage_path: string | null;
  duration: number | null;
  category_id: string | null;
  author_id: string;
  access_type: VideoAccessType;
  status: VideoStatus;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: Profile;
}

export interface VideoAccess {
  id: string;
  video_id: string;
  user_id: string;
  created_at: string;
}

export interface LiveStream {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  stream_key: string;
  hls_url: string;
  status: LiveStatus;
  category_id: string | null;
  access_type: VideoAccessType;
  viewers_count: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  video_id: string;
  progress: number;
  duration: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  video?: Video;
}

export interface Favorite {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
  video?: Video;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  video_id: string | null;
  live_id: string | null;
  session_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AppSettings {
  id: string;
  site_name: string;
  site_description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  player_autoplay: boolean;
  player_default_quality: string;
  live_enabled: boolean;
  registration_enabled: boolean;
  maintenance_mode: boolean;
  updated_at: string;
}

export type UserRole = 'owner' | 'visitor';

export type WorkVisibility = 'private' | 'visitors' | 'featured';

export type MediaType = 'image' | 'video' | 'document';

export type VisitSource = 'web' | 'ios' | 'android';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string | null;
  visit_count: number;
}

export interface OwnerProfile {
  id: string;
  display_name: string;
  photo_url: string | null;
  bio: string;
  email: string;
  whatsapp: string;
  social_links: {
    instagram?: string;
    linkedin?: string;
    behance?: string;
    dribbble?: string;
    youtube?: string;
    website?: string;
  };
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  visible_to_visitors: boolean;
}

export interface Work {
  id: string;
  title: string;
  description: string;
  category_id: string;
  visibility: WorkVisibility;
  featured_order: number | null;
  media_type: MediaType;
  storage_path: string;
  thumb_path: string | null;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  visitor_id: string;
  visited_at: string;
  source: VisitSource;
}

export interface VisitWithProfile extends Visit {
  profile?: Profile;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface CreateWorkInput {
  title: string;
  description: string;
  category_id: string;
  visibility: WorkVisibility;
  featured_order?: number | null;
  media_type: MediaType;
  uri: string;
  mime_type: string;
  size_bytes: number;
  file_name: string;
}

export interface UpdateWorkInput {
  title?: string;
  description?: string;
  category_id?: string;
  visibility?: WorkVisibility;
  featured_order?: number | null;
}

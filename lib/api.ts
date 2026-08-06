import { getSupabase, isSupabaseConfigured } from './supabase';
import { demoApi, DEMO_OWNER_EMAIL } from './demo-store';
import { getStarterWorks, ownerPhotoUri } from './media-assets';
import type {
  Category,
  CreateWorkInput,
  OwnerProfile,
  Profile,
  UpdateWorkInput,
  Work,
} from './types';
import { getVisitSource, uid } from './platform';

async function uploadFile(
  fileUri: string,
  path: string,
  mimeType: string
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return fileUri;

  const response = await fetch(fileUri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from('works').upload(path, blob, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('works').getPublicUrl(path);
  return data.publicUrl;
}

export const api = {
  isDemoMode: !isSupabaseConfigured,

  async getSession() {
    if (!isSupabaseConfigured) return demoApi.getSession();
    const supabase = getSupabase()!;
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return { user: null, profile: null };
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
    return {
      user: { id: data.session.user.id, email: data.session.user.email! },
      profile: profile as Profile | null,
    };
  },

  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) return demoApi.signUp(email, password, fullName);
    const supabase = getSupabase()!;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up failed');
    await this.recordVisit(data.user.id);
    return this.getSession();
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) return demoApi.signIn(email, password);
    const supabase = getSupabase()!;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if ((profile as Profile)?.role === 'visitor') {
      await this.recordVisit(data.user.id);
    }
    return {
      user: { id: data.user.id, email: data.user.email! },
      profile: profile as Profile,
    };
  },

  async signInWithGoogle() {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Google sign-in needs Google enabled in Supabase Auth → Providers. Use email/password if Google is not configured yet.'
      );
    }
    const supabase = getSupabase()!;
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : 'pratibhagraphics://login';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured) return demoApi.signOut();
    const { error } = await getSupabase()!.auth.signOut();
    if (error) throw error;
  },

  async recordVisit(visitorId: string) {
    if (!isSupabaseConfigured) return demoApi.recordVisit(visitorId);
    const supabase = getSupabase()!;
    const { data, error } = await supabase.rpc('record_visit', {
      p_visitor_id: visitorId,
      p_source: getVisitSource(),
    });
    if (error) throw error;
    if (data && typeof data === 'object' && 'visitor_email' in (data as object)) {
      try {
        await supabase.functions.invoke('notify-visit', { body: data });
      } catch {
        // Email notify is best-effort; visit is already stored.
      }
    }
  },

  async getOwnerProfile(): Promise<OwnerProfile> {
    if (!isSupabaseConfigured) return demoApi.getOwnerProfile();
    const { data, error } = await getSupabase()!.from('owner_profile').select('*').limit(1).single();
    if (error) throw error;
    return data as OwnerProfile;
  },

  async updateOwnerProfile(patch: Partial<OwnerProfile>): Promise<OwnerProfile> {
    if (!isSupabaseConfigured) return demoApi.updateOwnerProfile(patch);
    const current = await this.getOwnerProfile();
    const { data, error } = await getSupabase()!
      .from('owner_profile')
      .update({
        ...patch,
        social_links: { ...current.social_links, ...(patch.social_links ?? {}) },
        updated_at: new Date().toISOString(),
      })
      .eq('id', current.id)
      .select()
      .single();
    if (error) throw error;
    return data as OwnerProfile;
  },

  async getCategories(isOwner: boolean): Promise<Category[]> {
    if (!isSupabaseConfigured) return demoApi.getCategories(isOwner);
    let query = getSupabase()!.from('categories').select('*').order('sort_order');
    if (!isOwner) query = query.eq('visible_to_visitors', true);
    const { data, error } = await query;
    if (error) throw error;
    return data as Category[];
  },

  async updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
    if (!isSupabaseConfigured) return demoApi.updateCategory(id, patch);
    const { data, error } = await getSupabase()!
      .from('categories')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async getWorks(isOwner: boolean): Promise<Work[]> {
    if (!isSupabaseConfigured) return demoApi.getWorks(isOwner);
    const supabase = getSupabase()!;
    let query = supabase
      .from('works')
      .select('*')
      .order('created_at', { ascending: false });
    if (!isOwner) {
      query = query.in('visibility', ['visitors', 'featured']);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as Work[]) ?? [];
  },

  async getFeaturedWorks(): Promise<Work[]> {
    if (!isSupabaseConfigured) return demoApi.getFeaturedWorks();
    const { data, error } = await getSupabase()!
      .from('works')
      .select('*')
      .eq('visibility', 'featured')
      .eq('media_type', 'image')
      .order('featured_order', { ascending: true });
    if (error) throw error;
    return (data as Work[]) ?? [];
  },

  async getWork(id: string, isOwner: boolean): Promise<Work | null> {
    if (!isSupabaseConfigured) return demoApi.getWork(id, isOwner);
    const works = await this.getWorks(isOwner);
    return works.find((w) => w.id === id) ?? null;
  },

  async createWork(input: CreateWorkInput): Promise<Work> {
    if (!isSupabaseConfigured) return demoApi.createWork(input);
    const path = `${uid('file')}_${input.file_name}`;
    const url = await uploadFile(input.uri, path, input.mime_type);
    const { data, error } = await getSupabase()!
      .from('works')
      .insert({
        title: input.title,
        description: input.description,
        category_id: input.category_id,
        visibility: input.visibility,
        featured_order: input.visibility === 'featured' ? (input.featured_order ?? 1) : null,
        media_type: input.media_type,
        storage_path: url,
        thumb_path: input.media_type === 'image' ? url : null,
        mime_type: input.mime_type,
        size_bytes: input.size_bytes,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Work;
  },

  async updateWork(id: string, patch: UpdateWorkInput): Promise<Work> {
    if (!isSupabaseConfigured) return demoApi.updateWork(id, patch);
    const { data, error } = await getSupabase()!
      .from('works')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Work;
  },

  async deleteWork(id: string): Promise<void> {
    if (!isSupabaseConfigured) return demoApi.deleteWork(id);
    const { error } = await getSupabase()!.from('works').delete().eq('id', id);
    if (error) throw error;
  },

  async getVisitors(): Promise<Profile[]> {
    if (!isSupabaseConfigured) return demoApi.getVisitors();
    const { data, error } = await getSupabase()!
      .from('profiles')
      .select('*')
      .eq('role', 'visitor')
      .order('last_seen_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },

  async getVisits() {
    if (!isSupabaseConfigured) return demoApi.getVisits();
    const { data, error } = await getSupabase()!
      .from('visits')
      .select('*, profile:profiles(*)')
      .order('visited_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      visitor_id: row.visitor_id as string,
      visited_at: row.visited_at as string,
      source: row.source as 'web' | 'ios' | 'android',
      profile: row.profile as Profile | undefined,
    }));
  },

  async getPendingEmails() {
    if (!isSupabaseConfigured) return demoApi.getPendingEmails();
    return [];
  },

  async ensureOwnerProfileDefaults() {
    if (!isSupabaseConfigured) return demoApi.getOwnerProfile();
    const current = await this.getOwnerProfile();
    return this.updateOwnerProfile({
      display_name: 'Pratibha Agrawal',
      email: 'educationg26@gmail.com',
      bio: 'Founder of Pratibha Graphics Studio. Logos, YouTube thumbnails, social posts, wedding invites, and client brand work.',
      photo_url: current.photo_url || ownerPhotoUri(),
      social_links: {
        instagram: current.social_links?.instagram || 'https://instagram.com',
        youtube: current.social_links?.youtube || 'https://youtube.com',
        linkedin: current.social_links?.linkedin || 'https://linkedin.com',
      },
      whatsapp: current.whatsapp === '+91 00000 00000' ? '' : current.whatsapp,
    });
  },

  /** Upload bundled starter library into Supabase (owner only). */
  async importStarterLibrary(force = false): Promise<{ imported: number; skipped: boolean }> {
    if (!isSupabaseConfigured) {
      return { imported: 0, skipped: true };
    }
    const existing = await this.getWorks(true);
    if (existing.length > 0 && !force) {
      return { imported: 0, skipped: true };
    }

    const cats = await this.getCategories(true);
    const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
    const starters = getStarterWorks();
    let imported = 0;

    // Upload studio logo for profile photo first
    const logo = starters.find((s) => s.key === 'studio_logo');
    let photoUrl = ownerPhotoUri();
    if (logo) {
      photoUrl = await uploadFile(logo.uri, `starter/${logo.file_name}`, logo.mime_type);
    }

    await this.updateOwnerProfile({
      display_name: 'Pratibha Agrawal',
      email: 'educationg26@gmail.com',
      bio: 'Founder of Pratibha Graphics Studio. Logos, YouTube thumbnails, social posts, wedding invites, and client brand work.',
      photo_url: photoUrl,
      whatsapp: '',
      social_links: {
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        linkedin: 'https://linkedin.com',
      },
    });

    for (const item of starters) {
      const categoryId = bySlug[item.category_slug];
      if (!categoryId) continue;
      const already = existing.some((w) => w.title === item.title);
      if (already && !force) continue;

      const path = `starter/${item.file_name}`;
      const url = await uploadFile(item.uri, path, item.mime_type);
      await getSupabase()!
        .from('works')
        .insert({
          title: item.title,
          description: item.description,
          category_id: categoryId,
          visibility: item.visibility,
          featured_order: item.featured_order,
          media_type: item.media_type,
          storage_path: url,
          thumb_path: item.media_type === 'image' ? url : photoUrl,
          mime_type: item.mime_type,
          size_bytes: item.size_bytes,
        });
      imported += 1;
    }

    return { imported, skipped: false };
  },

  demoOwnerHint() {
    return { email: DEMO_OWNER_EMAIL, password: 'owner123' };
  },
};

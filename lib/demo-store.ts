import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Category,
  CreateWorkInput,
  OwnerProfile,
  Profile,
  UpdateWorkInput,
  Visit,
  Work,
  WorkVisibility,
} from './types';
import { getVisitSource, uid } from './platform';
import { buildLibraryWorks, ownerPhotoUri } from './media-assets';

const KEY = 'studiovault_demo_v7';

export const DEMO_OWNER_EMAIL = 'educationg26@gmail.com';
export const DEMO_OWNER_PASSWORD = 'owner123';

interface DemoUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'owner' | 'visitor';
}

interface DemoState {
  users: DemoUser[];
  sessionUserId: string | null;
  profiles: Profile[];
  ownerProfile: OwnerProfile;
  categories: Category[];
  works: Work[];
  visits: Visit[];
  pendingEmails: Array<{
    to: string;
    subject: string;
    body: string;
    at: string;
  }>;
}

const defaultCategories: Category[] = [
  { id: 'cat_logos', slug: 'logos', name: 'Logos', sort_order: 1, visible_to_visitors: true },
  {
    id: 'cat_yt',
    slug: 'youtube-thumbnails',
    name: 'YouTube Thumbnails',
    sort_order: 2,
    visible_to_visitors: true,
  },
  {
    id: 'cat_ig',
    slug: 'instagram',
    name: 'Instagram Posts',
    sort_order: 3,
    visible_to_visitors: true,
  },
  {
    id: 'cat_fb',
    slug: 'facebook',
    name: 'Facebook Posts',
    sort_order: 4,
    visible_to_visitors: true,
  },
  {
    id: 'cat_li',
    slug: 'linkedin',
    name: 'LinkedIn Posts',
    sort_order: 5,
    visible_to_visitors: true,
  },
  {
    id: 'cat_social',
    slug: 'social-other',
    name: 'Other Social',
    sort_order: 6,
    visible_to_visitors: true,
  },
  { id: 'cat_videos', slug: 'videos', name: 'Videos', sort_order: 7, visible_to_visitors: true },
];

function seedState(): DemoState {
  const ownerId = 'user_owner';
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: ownerId,
        email: DEMO_OWNER_EMAIL,
        password: DEMO_OWNER_PASSWORD,
        full_name: 'Pratibha Agrawal',
        role: 'owner',
      },
    ],
    sessionUserId: null,
    profiles: [
      {
        id: ownerId,
        email: DEMO_OWNER_EMAIL,
        full_name: 'Pratibha Agrawal',
        role: 'owner',
        avatar_url: null,
        created_at: now,
        last_seen_at: null,
        visit_count: 0,
      },
    ],
    ownerProfile: {
      id: 'owner_profile_1',
      display_name: 'Pratibha Agrawal',
      photo_url: ownerPhotoUri(),
      bio: 'Founder of Pratibha Graphics Studio. Logos, YouTube thumbnails, social posts, wedding invites, and client brand work.',
      email: 'educationg26@gmail.com',
      whatsapp: '',
      social_links: {
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
        linkedin: 'https://linkedin.com',
      },
      updated_at: now,
    },
    categories: defaultCategories,
    works: buildLibraryWorks(now),
    visits: [],
    pendingEmails: [],
  };
}

async function load(): Promise<DemoState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    const seeded = seedState();
    await AsyncStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw) as DemoState;
}

async function save(state: DemoState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export const demoApi = {
  async getSession(): Promise<{ user: { id: string; email: string } | null; profile: Profile | null }> {
    const state = await load();
    if (!state.sessionUserId) return { user: null, profile: null };
    const user = state.users.find((u) => u.id === state.sessionUserId);
    const profile = state.profiles.find((p) => p.id === state.sessionUserId) ?? null;
    if (!user) return { user: null, profile: null };
    return { user: { id: user.id, email: user.email }, profile };
  },

  async signUp(email: string, password: string, fullName: string) {
    const state = await load();
    if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const id = uid('user');
    const now = new Date().toISOString();
    const user: DemoUser = {
      id,
      email: email.trim().toLowerCase(),
      password,
      full_name: fullName.trim() || email.split('@')[0],
      role: 'visitor',
    };
    const profile: Profile = {
      id,
      email: user.email,
      full_name: user.full_name,
      role: 'visitor',
      avatar_url: null,
      created_at: now,
      last_seen_at: null,
      visit_count: 0,
    };
    state.users.push(user);
    state.profiles.push(profile);
    state.sessionUserId = id;
    await save(state);
    await this.recordVisit(id);
    return { user: { id, email: user.email }, profile };
  },

  async signIn(email: string, password: string) {
    const state = await load();
    const user = state.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid email or password.');
    state.sessionUserId = user.id;
    await save(state);
    const profile = state.profiles.find((p) => p.id === user.id)!;
    if (profile.role === 'visitor') {
      await this.recordVisit(user.id);
    }
    return { user: { id: user.id, email: user.email }, profile };
  },

  async signOut() {
    const state = await load();
    state.sessionUserId = null;
    await save(state);
  },

  async recordVisit(visitorId: string) {
    const state = await load();
    const profile = state.profiles.find((p) => p.id === visitorId);
    if (!profile || profile.role === 'owner') return;

    const now = new Date().toISOString();
    profile.visit_count += 1;
    profile.last_seen_at = now;
    state.visits.unshift({
      id: uid('visit'),
      visitor_id: visitorId,
      visited_at: now,
      source: getVisitSource(),
    });

    const owner = state.profiles.find((p) => p.role === 'owner');
    state.pendingEmails.unshift({
      to: owner?.email ?? DEMO_OWNER_EMAIL,
      subject: `Pratibha Graphics Studio visit: ${profile.full_name}`,
      body: `${profile.full_name} (${profile.email}) visited your profile.\nTotal visits: ${profile.visit_count}\nTime: ${now}`,
      at: now,
    });
    await save(state);
  },

  async getOwnerProfile(): Promise<OwnerProfile> {
    return (await load()).ownerProfile;
  },

  async updateOwnerProfile(patch: Partial<OwnerProfile>): Promise<OwnerProfile> {
    const state = await load();
    state.ownerProfile = {
      ...state.ownerProfile,
      ...patch,
      social_links: { ...state.ownerProfile.social_links, ...(patch.social_links ?? {}) },
      updated_at: new Date().toISOString(),
    };
    await save(state);
    return state.ownerProfile;
  },

  async getCategories(isOwner: boolean): Promise<Category[]> {
    const cats = (await load()).categories.sort((a, b) => a.sort_order - b.sort_order);
    return isOwner ? cats : cats.filter((c) => c.visible_to_visitors);
  },

  async updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
    const state = await load();
    const idx = state.categories.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Category not found');
    state.categories[idx] = { ...state.categories[idx], ...patch };
    await save(state);
    return state.categories[idx];
  },

  async getWorks(isOwner: boolean): Promise<Work[]> {
    const state = await load();
    const visibleCats = new Set(
      state.categories.filter((c) => isOwner || c.visible_to_visitors).map((c) => c.id)
    );
    return state.works
      .filter((w) => {
        if (!visibleCats.has(w.category_id)) return false;
        if (isOwner) return true;
        return w.visibility === 'visitors' || w.visibility === 'featured';
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getFeaturedWorks(): Promise<Work[]> {
    const state = await load();
    const visibleCats = new Set(
      state.categories.filter((c) => c.visible_to_visitors).map((c) => c.id)
    );
    return state.works
      .filter(
        (w) =>
          w.visibility === 'featured' &&
          visibleCats.has(w.category_id) &&
          w.media_type === 'image'
      )
      .sort((a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999));
  },

  async getWork(id: string, isOwner: boolean): Promise<Work | null> {
    const works = await this.getWorks(isOwner);
    return works.find((w) => w.id === id) ?? null;
  },

  async createWork(input: CreateWorkInput): Promise<Work> {
    const state = await load();
    const now = new Date().toISOString();
    const work: Work = {
      id: uid('work'),
      title: input.title,
      description: input.description,
      category_id: input.category_id,
      visibility: input.visibility,
      featured_order:
        input.visibility === 'featured' ? (input.featured_order ?? state.works.length + 1) : null,
      media_type: input.media_type,
      storage_path: input.uri,
      thumb_path: input.media_type === 'image' ? input.uri : null,
      mime_type: input.mime_type,
      size_bytes: input.size_bytes,
      created_at: now,
      updated_at: now,
    };
    state.works.unshift(work);
    await save(state);
    return work;
  },

  async updateWork(id: string, patch: UpdateWorkInput): Promise<Work> {
    const state = await load();
    const idx = state.works.findIndex((w) => w.id === id);
    if (idx < 0) throw new Error('Work not found');
    const nextVisibility = (patch.visibility ?? state.works[idx].visibility) as WorkVisibility;
    state.works[idx] = {
      ...state.works[idx],
      ...patch,
      featured_order:
        nextVisibility === 'featured'
          ? (patch.featured_order ?? state.works[idx].featured_order ?? 1)
          : null,
      updated_at: new Date().toISOString(),
    };
    await save(state);
    return state.works[idx];
  },

  async deleteWork(id: string): Promise<void> {
    const state = await load();
    state.works = state.works.filter((w) => w.id !== id);
    await save(state);
  },

  async getVisitors(): Promise<Profile[]> {
    const state = await load();
    return state.profiles
      .filter((p) => p.role === 'visitor')
      .sort((a, b) => (b.last_seen_at ?? '').localeCompare(a.last_seen_at ?? ''));
  },

  async getVisits(): Promise<Array<Visit & { profile?: Profile }>> {
    const state = await load();
    return state.visits.map((v) => ({
      ...v,
      profile: state.profiles.find((p) => p.id === v.visitor_id),
    }));
  },

  async getPendingEmails() {
    return (await load()).pendingEmails;
  },

  async reset() {
    await AsyncStorage.setItem(KEY, JSON.stringify(seedState()));
  },
};

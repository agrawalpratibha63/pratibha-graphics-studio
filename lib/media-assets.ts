import { Image, Platform } from 'react-native';
import type { MediaType, WorkVisibility } from './types';

type AssetModule = number | string | { uri?: string; default?: string };

function uri(mod: AssetModule): string {
  if (typeof mod === 'string') return mod;
  if (mod && typeof mod === 'object') {
    if (typeof mod.uri === 'string') return mod.uri;
    if (typeof mod.default === 'string') return mod.default;
  }
  if (Platform.OS !== 'web' && typeof Image.resolveAssetSource === 'function') {
    const resolved = Image.resolveAssetSource(mod as number);
    if (resolved?.uri) return resolved.uri;
  }
  return String(mod ?? '');
}

const studioLogo = require('../assets/works/pratibha-graphics-logo.png') as AssetModule;
const clientLogo = require('../assets/works/damini-arts-logo.png') as AssetModule;
const clientBanner = require('../assets/works/damini-arts-banner.png') as AssetModule;
const ladduGopal = require('../assets/works/laddu-gopal-eye-makeup.png') as AssetModule;
const mothersDay1 = require('../assets/works/mothers-day-tshirt-1.png') as AssetModule;
const tissueFlower = require('../assets/works/tissue-paper-flower.png') as AssetModule;
const mothersDayMaa = require('../assets/works/mothers-day-maa-tshirt.png') as AssetModule;
const wedding = require('../assets/works/wedding-invite-shekhar-kajal.png') as AssetModule;
const reel = require('../assets/works/damini-reel.mp4') as AssetModule;

export type StarterWork = {
  key: string;
  title: string;
  description: string;
  category_slug: string;
  visibility: WorkVisibility;
  featured_order: number | null;
  media_type: MediaType;
  uri: string;
  mime_type: string;
  file_name: string;
  size_bytes: number;
};

export function getStarterWorks(): StarterWork[] {
  return [
    {
      key: 'studio_logo',
      title: 'Pratibha Graphics Studio — Logo',
      description: 'Studio identity mark for Pratibha Agrawal.',
      category_slug: 'logos',
      visibility: 'featured',
      featured_order: 1,
      media_type: 'image',
      uri: uri(studioLogo),
      mime_type: 'image/png',
      file_name: 'pratibha-graphics-logo.png',
      size_bytes: 983126,
    },
    {
      key: 'client_logo',
      title: "Client — Damini Art's Logo",
      description: "Client branding work for Damini Art's.",
      category_slug: 'logos',
      visibility: 'featured',
      featured_order: 2,
      media_type: 'image',
      uri: uri(clientLogo),
      mime_type: 'image/png',
      file_name: 'damini-arts-logo.png',
      size_bytes: 246631,
    },
    {
      key: 'client_banner',
      title: "Client — Damini Art's Brand Banner",
      description: "Client header banner for Damini Art's.",
      category_slug: 'logos',
      visibility: 'visitors',
      featured_order: null,
      media_type: 'image',
      uri: uri(clientBanner),
      mime_type: 'image/png',
      file_name: 'damini-arts-banner.png',
      size_bytes: 110156,
    },
    {
      key: 'yt_laddu',
      title: 'Client YT — Laddu Gopal Eye Makeup',
      description: "YouTube thumbnail for Damini Art's — DIY tutorial.",
      category_slug: 'youtube-thumbnails',
      visibility: 'featured',
      featured_order: 3,
      media_type: 'image',
      uri: uri(ladduGopal),
      mime_type: 'image/png',
      file_name: 'laddu-gopal-eye-makeup.png',
      size_bytes: 185401,
    },
    {
      key: 'yt_mothers_1',
      title: "Client YT — Mother's Day Hand-Painted T-Shirt",
      description: "YouTube thumbnail for Damini Art's — DIY tutorial.",
      category_slug: 'youtube-thumbnails',
      visibility: 'featured',
      featured_order: 4,
      media_type: 'image',
      uri: uri(mothersDay1),
      mime_type: 'image/png',
      file_name: 'mothers-day-tshirt-1.png',
      size_bytes: 178434,
    },
    {
      key: 'yt_tissue',
      title: 'Client YT — Tissue Paper Flower Making',
      description: "YouTube thumbnail for Damini Art's — DIY craft tutorial.",
      category_slug: 'youtube-thumbnails',
      visibility: 'featured',
      featured_order: 5,
      media_type: 'image',
      uri: uri(tissueFlower),
      mime_type: 'image/png',
      file_name: 'tissue-paper-flower.png',
      size_bytes: 122623,
    },
    {
      key: 'yt_maa',
      title: "Client YT — Mother's Day माँ Tee",
      description: "YouTube thumbnail for Damini Art's — hand-painted apparel.",
      category_slug: 'youtube-thumbnails',
      visibility: 'visitors',
      featured_order: null,
      media_type: 'image',
      uri: uri(mothersDayMaa),
      mime_type: 'image/png',
      file_name: 'mothers-day-maa-tshirt.png',
      size_bytes: 153390,
    },
    {
      key: 'invite',
      title: 'Wedding Invitation — Shekhar & Kajal',
      description: 'Traditional maroon & gold wedding invite design.',
      category_slug: 'social-other',
      visibility: 'visitors',
      featured_order: null,
      media_type: 'image',
      uri: uri(wedding),
      mime_type: 'image/png',
      file_name: 'wedding-invite-shekhar-kajal.png',
      size_bytes: 147965,
    },
    {
      key: 'reel',
      title: "Client Reel — Damini Art's Studio",
      description: "Process / showcase video created for Damini Art's.",
      category_slug: 'videos',
      visibility: 'visitors',
      featured_order: null,
      media_type: 'video',
      uri: uri(reel),
      mime_type: 'video/mp4',
      file_name: 'damini-reel.mp4',
      size_bytes: 10888905,
    },
  ];
}

export function ownerPhotoUri(): string {
  return uri(studioLogo);
}

/** @deprecated use getStarterWorks — kept for demo-store */
export function buildLibraryWorks(now: string) {
  return getStarterWorks().map((item, index) => ({
    id: `work_${item.key}`,
    title: item.title,
    description: item.description,
    category_id:
      item.category_slug === 'logos'
        ? 'cat_logos'
        : item.category_slug === 'youtube-thumbnails'
          ? 'cat_yt'
          : item.category_slug === 'social-other'
            ? 'cat_social'
            : item.category_slug === 'videos'
              ? 'cat_videos'
              : 'cat_logos',
    visibility: item.visibility,
    featured_order: item.featured_order,
    media_type: item.media_type,
    storage_path: item.uri,
    thumb_path: item.media_type === 'image' ? item.uri : uri(studioLogo),
    mime_type: item.mime_type,
    size_bytes: item.size_bytes,
    created_at: now,
    updated_at: now,
  }));
}

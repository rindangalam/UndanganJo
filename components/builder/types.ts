export type InvitationStatus = "draft" | "menunggu_bayar" | "published";

export interface Invitation {
  id: string;
  customer_id: string | null;
  package_id: string | null;
  theme_id: string | null;
  slug: string;
  status: InvitationStatus;
  groom_name: string | null;
  bride_name: string | null;
  akad_date: string | null;
  akad_time: string | null;
  akad_location: string | null;
  akad_maps_url: string | null;
  reception_date: string | null;
  reception_time: string | null;
  reception_location: string | null;
  reception_maps_url: string | null;
  story: string | null;
  gift_name: string | null;
  gift_account: string | null;
  gift_info: string | null;
  music_url: string | null;
  gallery_photos: string[] | null;
  livestream_url: string | null;
  video_url: string | null;
  theme_key?: string | null;
  created_by_admin: boolean | null;
  customer_name: string | null;
  customer_phone: string | null;
  updated_at: string | null;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string | null;
  max_photos: number;
  has_music: boolean;
  has_video: boolean;
  premium_themes: boolean;
}

export interface Theme {
  id: string;
  name: string;
  key: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
}

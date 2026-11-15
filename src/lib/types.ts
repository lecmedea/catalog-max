export type Role = "user" | "admin";
export type AccountType = "owner" | "advertiser";
export type ChannelStatus = "pending" | "approved" | "rejected";
export type PricingType = "free" | "freemium" | "paid";

export type Profile = {
  id: string;
  email: string | null;
  role: Role;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  max_contact: string | null;
  company_or_agency: string | null;
  bio: string | null;
  account_type: AccountType | null;
  show_contacts_publicly: boolean;
  is_banned: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

export type Channel = {
  id: string;
  owner_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  max_link: string;
  description: string | null;
  avatar_url: string | null;
  subscribers_count: number;
  avg_post_reach: number;
  err_percent: number | null;
  ad_price: number | null;
  status: ChannelStatus;
  is_verified: boolean;
  rejection_reason: string | null;
  manager_contact: string | null;
  gallery: string[];
  created_at: string;
  updated_at: string;
  categories: Category | null;
};

export type ChannelStat = {
  id: string;
  channel_id: string;
  stat_date: string;
  subscribers_count: number;
  reach_count: number;
};

export type Platform = {
  id: string;
  title: string;
  slug: string;
  description: string;
  url: string;
  logo_url: string | null;
  tool_category: string;
  pricing_type: PricingType;
  is_featured: boolean;
  created_at: string;
};

export type OwnerContact = {
  full_name: string | null;
  username: string | null;
  max_contact: string | null;
  company_or_agency: string | null;
  avatar_url: string | null;
};

export type FormState = { error: string | null; ok: string | null };
export const emptyForm: FormState = { error: null, ok: null };

export const CHANNEL_COLUMNS =
  "id, owner_id, category_id, title, slug, max_link, description, avatar_url, subscribers_count, avg_post_reach, err_percent, ad_price, status, is_verified, rejection_reason, manager_contact, gallery, created_at, updated_at, categories(id, name, slug, icon)";

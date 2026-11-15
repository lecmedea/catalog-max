import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import { searchTerm } from "@/lib/validators";
import { CHANNEL_COLUMNS, type Category, type Channel, type ChannelStat, type OwnerContact, type Platform } from "@/lib/types";

export type CatalogFilters = {
  q?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: string;
};

const PAGE_SIZE = 12;

function asChannel(row: Channel & { categories: Category | Category[] | null }): Channel {
  const categories = Array.isArray(row.categories) ? row.categories[0] ?? null : row.categories;
  return { ...row, categories };
}

export async function catalogPage(filters: CatalogFilters) {
  if (!supabaseEnv()) return { channels: [] as Channel[], count: 0, categories: [] as Category[], page: 1, pages: 1, unconfigured: true };
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const term = searchTerm(filters.q);
  let query = supabase.from("channels").select(CHANNEL_COLUMNS, { count: "exact" }).eq("status", "approved");
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  if (filters.category && /^[0-9a-f-]{36}$/i.test(filters.category)) query = query.eq("category_id", filters.category);
  if (filters.priceMin && /^\d+(\.\d{1,2})?$/.test(filters.priceMin)) query = query.gte("ad_price", Number(filters.priceMin));
  if (filters.priceMax && /^\d+(\.\d{1,2})?$/.test(filters.priceMax)) query = query.lte("ad_price", Number(filters.priceMax));
  if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  const sort = filters.sort ?? "new";
  if (sort === "subscribers") query = query.order("subscribers_count", { ascending: false });
  else if (sort === "reach") query = query.order("avg_post_reach", { ascending: false });
  else if (sort === "err") query = query.order("err_percent", { ascending: false, nullsFirst: false });
  else if (sort === "price") query = query.order("ad_price", { ascending: true, nullsFirst: false });
  else query = query.order("created_at", { ascending: false });
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
  const { data: categories } = await supabase.from("categories").select("id, name, slug, icon").order("name");
  const total = count ?? 0;
  return {
    channels: ((data ?? []) as unknown as Array<Channel & { categories: Category | Category[] | null }>).map(asChannel),
    count: total,
    categories: (categories ?? []) as Category[],
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    unconfigured: false,
  };
}

export async function freshChannels() {
  if (!supabaseEnv()) return [] as Channel[];
  const supabase = await createClient();
  const { data } = await supabase.from("channels").select(CHANNEL_COLUMNS).eq("status", "approved").order("created_at", { ascending: false }).limit(6);
  return ((data ?? []) as unknown as Array<Channel & { categories: Category | Category[] | null }>).map(asChannel);
}

export async function rankedChannels() {
  if (!supabaseEnv()) return { channels: [] as Channel[], unconfigured: true };
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select(CHANNEL_COLUMNS)
    .eq("status", "approved")
    .order("subscribers_count", { ascending: false })
    .order("title", { ascending: true })
    .limit(100);
  return {
    channels: ((data ?? []) as unknown as Array<Channel & { categories: Category | Category[] | null }>).map(asChannel),
    unconfigured: false,
  };
}

export async function categoryCounts() {
  if (!supabaseEnv()) return [] as Array<Category & { channel_count: number }>;
  const supabase = await createClient();
  const { data } = await supabase.rpc("category_counts");
  return (data ?? []) as Array<Category & { channel_count: number }>;
}

export async function channelBySlug(id: string) {
  if (!supabaseEnv()) return null;
  const supabase = await createClient();
  const column = /^[0-9a-f-]{36}$/i.test(id) ? "id" : "slug";
  const { data } = await supabase.from("channels").select(CHANNEL_COLUMNS).eq(column, id).maybeSingle();
  if (!data) return null;
  return asChannel(data as unknown as Channel & { categories: Category | Category[] | null });
}

export async function channelStats(channelId: string) {
  if (!supabaseEnv()) return [] as ChannelStat[];
  const supabase = await createClient();
  const { data } = await supabase.from("channel_stats").select("id, channel_id, stat_date, subscribers_count, reach_count").eq("channel_id", channelId).order("stat_date", { ascending: true }).limit(60);
  return (data ?? []) as ChannelStat[];
}

export async function ownerContact(channelId: string) {
  if (!supabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("channel_owner_contact", { target: channelId });
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as OwnerContact | null;
}

export async function platforms(filters: { q?: string; tool?: string; pricing?: string }) {
  if (!supabaseEnv()) return { rows: [] as Platform[], unconfigured: true };
  const supabase = await createClient();
  const term = searchTerm(filters.q);
  let query = supabase.from("platforms").select("*").order("is_featured", { ascending: false }).order("title");
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  if (filters.tool) query = query.eq("tool_category", filters.tool.slice(0, 40));
  if (filters.pricing === "free" || filters.pricing === "freemium" || filters.pricing === "paid") query = query.eq("pricing_type", filters.pricing);
  const { data } = await query;
  return { rows: (data ?? []) as Platform[], unconfigured: false };
}

export async function isFavorite(userId: string, channelId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("favorites").select("channel_id").eq("user_id", userId).eq("channel_id", channelId).maybeSingle();
  return Boolean(data);
}

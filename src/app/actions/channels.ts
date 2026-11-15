"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { storeImage } from "@/lib/uploads";
import { emptyForm, type FormState } from "@/lib/types";
import { maxLinkOk, moneyOk, publicError, slugify } from "@/lib/validators";

async function uniqueSlug(base: string, ignoreId?: string) {
  const { supabase } = await requireUser();
  const root = slugify(base);
  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? root : `${root.slice(0, 54)}-${index + 1}`;
    let query = supabase.from("channels").select("id").eq("slug", candidate);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
  }
  return `${root.slice(0, 48)}-${crypto.randomUUID().slice(0, 8)}`;
}

function text(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

function normalizeMaxLink(value: string) {
  if (!maxLinkOk(value)) return value;
  const url = new URL(value);
  return `https://${url.hostname.toLowerCase()}${url.pathname}${url.search}`;
}

export async function saveChannel(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  try {
    const { supabase, userId } = await requireUser();
    const id = text(formData, "id", 40);
    const title = text(formData, "title", 120);
    const maxLink = normalizeMaxLink(text(formData, "max_link", 300));
    const description = text(formData, "description", 4000);
    const categoryId = text(formData, "category_id", 40);
    const manager = text(formData, "manager_contact", 160);
    const priceRaw = text(formData, "ad_price", 16);
    if (!title) return { error: "Укажите название канала", ok: null };
    if (!maxLinkOk(maxLink)) return { error: "Ссылка должна вести на https://max.ru/…", ok: null };
    if (!moneyOk(priceRaw)) return { error: "Цена рекламы — число в рублях", ok: null };
    const slug = await uniqueSlug(text(formData, "slug", 80) || title, id || undefined);
    const avatar = await storeImage(supabase, "channel-media", userId, formData.get("avatar"));
    const kept = formData.getAll("keep").map(String).filter((url) => url.startsWith("https://")).slice(0, 6);
    const gallery = [...kept];
    for (const file of formData.getAll("gallery")) {
      if (gallery.length >= 6) break;
      const url = await storeImage(supabase, "channel-media", userId, file);
      if (url) gallery.push(url);
    }
    const row = {
      title,
      slug,
      max_link: maxLink,
      description,
      category_id: categoryId || null,
      manager_contact: manager || null,
      ad_price: priceRaw ? Number(priceRaw) : null,
      gallery,
      ...(avatar ? { avatar_url: avatar } : {}),
    };
    if (id) {
      const { error } = await supabase.from("channels").update(row).eq("id", id);
      if (error) return { error: publicError(error.message), ok: null };
      redirect(`/dashboard/channels/${id}`);
    }
    const { data, error } = await supabase.from("channels").insert({ ...row, owner_id: userId }).select("id").single();
    if (error) return { error: publicError(error.message), ok: null };
    redirect(`/dashboard/channels/${data.id}`);
  } catch (error) {
    unstable_rethrow(error);
    return { error: error instanceof Error ? publicError(error.message) : "Не удалось сохранить канал", ok: null };
  }
}

export async function deleteChannel(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  await supabase.from("channels").delete().eq("id", id);
  redirect("/dashboard/channels");
}

export async function toggleFavorite(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const channelId = String(formData.get("channel_id") ?? "");
  const back = String(formData.get("back") ?? "/catalog");
  const { data } = await supabase.from("favorites").select("channel_id").eq("user_id", userId).eq("channel_id", channelId).maybeSingle();
  if (data) await supabase.from("favorites").delete().eq("user_id", userId).eq("channel_id", channelId);
  else await supabase.from("favorites").insert({ user_id: userId, channel_id: channelId });
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/catalog");
}

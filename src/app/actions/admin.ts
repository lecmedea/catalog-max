"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { storeImage } from "@/lib/uploads";
import { emptyForm, type FormState } from "@/lib/types";
import { httpsUrlOk, publicError, slugify } from "@/lib/validators";

export async function moderateChannel(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("rejection_reason") ?? "").trim().slice(0, 500);
  if (status !== "pending" && status !== "approved" && status !== "rejected") return { error: "Неизвестный статус", ok: null };
  if (status === "rejected" && !reason) return { error: "Укажите причину отклонения", ok: null };
  const subscribers = Number(formData.get("subscribers_count") ?? 0);
  const reach = Number(formData.get("avg_post_reach") ?? 0);
  const err = String(formData.get("err_percent") ?? "").trim();
  if (!Number.isInteger(subscribers) || subscribers < 0 || !Number.isInteger(reach) || reach < 0) return { error: "Метрики — целые числа от нуля", ok: null };
  const { error } = await supabase.from("channels").update({
    status,
    rejection_reason: status === "rejected" ? reason : null,
    is_verified: formData.get("is_verified") === "on",
    subscribers_count: subscribers,
    avg_post_reach: reach,
    err_percent: err ? Number(err) : null,
  }).eq("id", id);
  if (error) return { error: publicError(error.message), ok: null };
  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { error: null, ok: "Канал обновлён" };
}

export async function addStat(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const channelId = String(formData.get("channel_id") ?? "");
  const statDate = String(formData.get("stat_date") ?? "");
  const subscribers = Number(formData.get("subscribers_count") ?? 0);
  const reach = Number(formData.get("reach_count") ?? 0);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(statDate)) return { error: "Укажите дату", ok: null };
  const { error } = await supabase.from("channel_stats").upsert({
    channel_id: channelId,
    stat_date: statDate,
    subscribers_count: subscribers,
    reach_count: reach,
  }, { onConflict: "channel_id,stat_date" });
  if (error) return { error: publicError(error.message), ok: null };
  revalidatePath(`/catalog/${channelId}`);
  return { error: null, ok: "Точка графика сохранена" };
}

export async function saveUser(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const { supabase, userId } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const banned = formData.get("is_banned") === "on";
  if (role !== "user" && role !== "admin") return { error: "Неизвестная роль", ok: null };
  if (id === userId && (role !== "admin" || banned)) return { error: "Нельзя снять с себя права администратора", ok: null };
  const { error } = await supabase.from("profiles").update({ role, is_banned: banned }).eq("id", id);
  if (error) return { error: publicError(error.message), ok: null };
  return { error: null, ok: "Пользователь обновлён" };
}

export async function saveCategory(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const icon = String(formData.get("icon") ?? "").trim().slice(0, 40);
  if (!name) return { error: "Укажите название категории", ok: null };
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const row = { name, slug, icon: icon || null };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error) return { error: publicError(error.message), ok: null };
  revalidatePath("/catalog");
  return { error: null, ok: "Категория сохранена" };
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", String(formData.get("id") ?? ""));
  redirect("/admin/categories");
}

export async function savePlatform(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim().slice(0, 120);
    const description = String(formData.get("description") ?? "").trim().slice(0, 500);
    const url = String(formData.get("url") ?? "").trim();
    const tool = String(formData.get("tool_category") ?? "").trim().slice(0, 40);
    const pricing = String(formData.get("pricing_type") ?? "");
    if (!title || !description || !tool) return { error: "Заполните название, описание и тип", ok: null };
    if (!httpsUrlOk(url)) return { error: "Нужен публичный адрес https://", ok: null };
    if (pricing !== "free" && pricing !== "freemium" && pricing !== "paid") return { error: "Выберите модель оплаты", ok: null };
    const logo = await storeImage(supabase, "platform-logos", userId, formData.get("logo"));
    const row = {
      title,
      slug: slugify(String(formData.get("slug") ?? "") || title),
      description,
      url,
      tool_category: tool,
      pricing_type: pricing,
      is_featured: formData.get("is_featured") === "on",
      ...(logo ? { logo_url: logo } : {}),
    };
    const { error } = id
      ? await supabase.from("platforms").update(row).eq("id", id)
      : await supabase.from("platforms").insert(row);
    if (error) return { error: publicError(error.message), ok: null };
    revalidatePath("/platforms");
    redirect("/admin/platforms");
  } catch (error) {
    unstable_rethrow(error);
    return { error: error instanceof Error ? publicError(error.message) : "Не удалось сохранить инструмент", ok: null };
  }
}

export async function deletePlatform(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("platforms").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/platforms");
  redirect("/admin/platforms");
}

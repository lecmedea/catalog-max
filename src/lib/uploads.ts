import type { SupabaseClient } from "@supabase/supabase-js";

const TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function storeImage(supabase: SupabaseClient, bucket: string, userId: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = TYPES.get(file.type);
  if (!ext) throw new Error("Нужен файл JPEG, PNG или WebP");
  if (file.size > 2_097_152) throw new Error("Файл больше 2 МБ");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Не удалось загрузить файл");
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

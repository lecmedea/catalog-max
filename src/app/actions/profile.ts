"use server";

import { requireUser } from "@/lib/auth";
import { storeImage } from "@/lib/uploads";
import { emptyForm, type FormState } from "@/lib/types";
import { publicError, usernameOk } from "@/lib/validators";

export async function saveProfile(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  try {
    const { supabase, userId, profile } = await requireUser();
    const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 80);
    const username = String(formData.get("username") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim().slice(0, 300);
    const maxContact = String(formData.get("max_contact") ?? "").trim().slice(0, 160);
    const company = String(formData.get("company_or_agency") ?? "").trim().slice(0, 120);
    const accountType = String(formData.get("account_type") ?? "");
    if (!usernameOk(username)) return { error: "Никнейм: 3–24 символа, латиница, цифры и _", ok: null };
    if (bio.length > 300) return { error: "О себе — не длиннее 300 символов", ok: null };
    if (accountType !== "owner" && accountType !== "advertiser") return { error: "Выберите тип аккаунта", ok: null };
    if (username.toLowerCase() !== (profile.username ?? "").toLowerCase()) {
      const { data: free, error } = await supabase.rpc("username_available", { candidate: username });
      if (error) return { error: publicError(error.message), ok: null };
      if (!free) return { error: "Этот никнейм уже занят", ok: null };
    }
    const avatar = await storeImage(supabase, "avatars", userId, formData.get("avatar"));
    const { error } = await supabase.from("profiles").update({
      full_name: fullName || null,
      username,
      bio: bio || null,
      max_contact: maxContact || null,
      company_or_agency: company || null,
      account_type: accountType,
      show_contacts_publicly: formData.get("show_contacts_publicly") === "on",
      ...(avatar ? { avatar_url: avatar } : {}),
    }).eq("id", userId);
    if (error) return { error: publicError(error.message), ok: null };
    return { error: null, ok: "Анкета сохранена" };
  } catch (error) {
    return { error: error instanceof Error ? publicError(error.message) : "Не удалось сохранить анкету", ok: null };
  }
}

"use server";

import { redirect } from "next/navigation";
import { siteOrigin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import { emptyForm, type FormState } from "@/lib/types";
import { passwordOk, publicError, safeNext, usernameOk } from "@/lib/validators";

function ready(): FormState | null {
  if (!supabaseEnv()) return { error: "Сначала укажите ключи Supabase в .env.local", ok: null };
  return null;
}

export async function register(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const blocked = ready();
  if (blocked) return blocked;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!email.includes("@")) return { error: "Укажите email", ok: null };
  if (!passwordOk(password)) return { error: "Пароль: от 8 до 72 символов", ok: null };
  if (!usernameOk(username)) return { error: "Никнейм: 3–24 символа, латиница, цифры и _", ok: null };
  if (fullName.length > 80) return { error: "Имя длиннее 80 символов", ok: null };
  const supabase = await createClient();
  const { data: free, error: freeError } = await supabase.rpc("username_available", { candidate: username });
  if (freeError) return { error: publicError(freeError.message), ok: null };
  if (!free) return { error: "Этот никнейм уже занят", ok: null };
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: { username, full_name: fullName },
    },
  });
  if (error) return { error: publicError(error.message), ok: null };
  if (data.session) redirect("/dashboard");
  return { error: null, ok: "Письмо с подтверждением отправлено. Откройте ссылку из почты." };
}

export async function login(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const blocked = ready();
  if (blocked) return blocked;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: publicError(error.message), ok: null };
  redirect(next);
}

export async function requestReset(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const blocked = ready();
  if (blocked) return blocked;
  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Укажите email", ok: null };
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (error) return { error: publicError(error.message), ok: null };
  return { error: null, ok: "Если такой адрес есть, письмо со ссылкой уже отправлено." };
}

export async function updatePassword(_prev: FormState = emptyForm, formData: FormData): Promise<FormState> {
  const blocked = ready();
  if (blocked) return blocked;
  const password = String(formData.get("password") ?? "");
  const current = String(formData.get("current_password") ?? "");
  if (!passwordOk(password)) return { error: "Новый пароль: от 8 до 72 символов", ok: null };
  const supabase = await createClient();
  const payload: { password: string; current_password?: string } = { password };
  if (current) payload.current_password = current;
  const { error } = await supabase.auth.updateUser(payload);
  if (error) return { error: publicError(error.message), ok: null };
  return { error: null, ok: "Пароль обновлён" };
}

export async function logout() {
  if (!supabaseEnv()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

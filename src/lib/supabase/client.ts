import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

export function createClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase не настроен");
  return createBrowserClient(env.url, env.key);
}

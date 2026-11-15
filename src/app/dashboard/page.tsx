import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { statusLabel } from "@/lib/format";

export default async function DashboardPage() {
  const { supabase, userId, profile } = await requireUser();
  const [{ count: channels }, { count: favorites }, { data: latest }] = await Promise.all([
    supabase.from("channels").select("id", { count: "exact", head: true }).eq("owner_id", userId),
    supabase.from("favorites").select("channel_id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("channels").select("id, title, status, rejection_reason").eq("owner_id", userId).order("created_at", { ascending: false }).limit(5),
  ]);
  return (
    <section className="stack">
      <h1>Кабинет</h1>
      <p>{profile.full_name || profile.username}, здесь ваши каналы и закладки.</p>
      <div className="stats">
        <div className="stat"><b>{channels ?? 0}</b><span>каналов</span></div>
        <div className="stat"><b>{favorites ?? 0}</b><span>в избранном</span></div>
        <div className="stat"><b>{profile.account_type === "advertiser" ? "Агентство" : "Владелец"}</b><span>тип анкеты</span></div>
      </div>
      <h2>Последние заявки</h2>
      <ul>
        {(latest ?? []).map((item) => (
          <li key={item.id}>
            <Link href={`/dashboard/channels/${item.id}`}>{item.title}</Link> — {statusLabel(item.status)}
            {item.status === "rejected" && item.rejection_reason ? `. Причина: ${item.rejection_reason}` : ""}
          </li>
        ))}
      </ul>
      <Link className="btn btn-primary" href="/dashboard/channels/new">Добавить канал</Link>
    </section>
  );
}

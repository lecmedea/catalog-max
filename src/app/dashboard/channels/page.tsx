import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { statusLabel } from "@/lib/format";
import { CHANNEL_COLUMNS, type Channel } from "@/lib/types";

export default async function MyChannelsPage() {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("channels").select(CHANNEL_COLUMNS).eq("owner_id", userId).order("created_at", { ascending: false });
  const channels = (data ?? []) as unknown as Channel[];
  return (
    <section className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Мои каналы</h1>
        <Link className="btn btn-primary" href="/dashboard/channels/new">Добавить</Link>
      </div>
      {channels.map((channel) => (
        <article className="panel" key={channel.id}>
          <h2><Link href={`/dashboard/channels/${channel.id}`}>{channel.title}</Link></h2>
          <p>{statusLabel(channel.status)}{channel.is_verified ? " · проверен" : ""}</p>
          {channel.status === "rejected" && channel.rejection_reason ? <p className="error">Причина: {channel.rejection_reason}</p> : null}
        </article>
      ))}
      {channels.length === 0 ? <p className="muted">Вы ещё не отправляли каналы.</p> : null}
    </section>
  );
}

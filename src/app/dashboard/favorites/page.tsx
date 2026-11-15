import { ChannelCard } from "@/components/channel-card";
import { requireUser } from "@/lib/auth";
import { CHANNEL_COLUMNS, type Channel } from "@/lib/types";

export default async function FavoritesPage() {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.from("favorites").select(`channel_id, channels(${CHANNEL_COLUMNS})`).eq("user_id", userId).order("created_at", { ascending: false });
  const channels = (data ?? []).flatMap((row) => {
    const value = row.channels as unknown;
    if (!value) return [];
    return [value as Channel];
  });
  return (
    <section className="stack">
      <h1>Избранное</h1>
      <div className="grid">
        {channels.map((channel) => <ChannelCard key={channel.id} channel={channel} />)}
      </div>
      {channels.length === 0 ? <p className="muted">Закладок пока нет. Откройте карточку канала и нажмите «В избранное».</p> : null}
    </section>
  );
}

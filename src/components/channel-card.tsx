import Link from "next/link";
import { formatMoney, formatNumber } from "@/lib/format";
import type { Channel } from "@/lib/types";

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <article className="card">
      {channel.avatar_url ? <img className="thumb" src={channel.avatar_url} alt="" /> : <div className="ph" aria-hidden="true" />}
      <div className="row">
        <h3><Link href={`/catalog/${channel.slug}`}>{channel.title}</Link></h3>
        {channel.is_verified ? <span className="badge blue" title="Канал проверен">✓</span> : null}
      </div>
      <p className="muted">{channel.categories?.name ?? "Без категории"}</p>
      <p>{channel.description?.slice(0, 140) || "Описание появится после модерации."}</p>
      <div className="meta">
        <span>{formatNumber(channel.subscribers_count)} подп.</span>
        <span>{formatMoney(channel.ad_price)}</span>
      </div>
    </article>
  );
}

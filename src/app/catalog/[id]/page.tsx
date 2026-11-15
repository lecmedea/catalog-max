import { notFound } from "next/navigation";
import { toggleFavorite } from "@/app/actions/channels";
import { ReachChart } from "@/components/reach-chart";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { currentSession } from "@/lib/auth";
import { channelBySlug, channelStats, isFavorite, ownerContact } from "@/lib/queries";

export default async function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channel = await channelBySlug(id);
  if (!channel || channel.status !== "approved") notFound();
  const [stats, contact, session] = await Promise.all([
    channelStats(channel.id),
    ownerContact(channel.id),
    currentSession(),
  ]);
  const saved = session ? await isFavorite(session.userId, channel.id) : false;
  return (
    <article className="detail">
      <div className="stack">
        <p className="eyebrow">{channel.categories?.name ?? "Каталог"}</p>
        <div className="row">
          <h1>{channel.title}</h1>
          {channel.is_verified ? <span className="badge blue">Проверен</span> : null}
        </div>
        {channel.avatar_url ? <img className="thumb" src={channel.avatar_url} alt="" /> : <div className="ph" />}
        <p>{channel.description || "Владелец пока не добавил описание."}</p>
        <div className="gallery">
          {channel.gallery.map((url) => <img key={url} src={url} alt="" />)}
        </div>
        <ReachChart rows={stats} />
      </div>
      <aside className="panel stack">
        <div className="stats">
          <div className="stat"><b>{formatNumber(channel.subscribers_count)}</b><span>подписчики</span></div>
          <div className="stat"><b>{formatNumber(channel.avg_post_reach)}</b><span>средний охват</span></div>
          <div className="stat"><b>{channel.err_percent ?? "—"}</b><span>ERR, %</span></div>
        </div>
        <p>Реклама: {formatMoney(channel.ad_price)}</p>
        <p className="muted">В каталоге с {formatDate(channel.created_at)}</p>
        <a className="btn btn-primary" href={channel.max_link}>Открыть в MAX</a>
        {session ? (
          <form action={toggleFavorite}>
            <input type="hidden" name="channel_id" value={channel.id} />
            <input type="hidden" name="back" value={`/catalog/${channel.slug}`} />
            <button className="btn" type="submit">{saved ? "Убрать из избранного" : "В избранное"}</button>
          </form>
        ) : <a className="btn" href="/auth/login">Войдите, чтобы сохранить</a>}
        <h2>Контакты</h2>
        {channel.manager_contact ? <p>Менеджер: {channel.manager_contact}</p> : null}
        {contact ? (
          <p>{contact.full_name || contact.username}{contact.company_or_agency ? ` · ${contact.company_or_agency}` : ""}{contact.max_contact ? ` · ${contact.max_contact}` : ""}</p>
        ) : <p className="muted">Владелец скрыл контакт в анкете.</p>}
      </aside>
    </article>
  );
}

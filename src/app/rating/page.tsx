import type { Metadata } from "next";
import Link from "next/link";
import { SetupNote } from "@/components/setup-note";
import { formatNumber } from "@/lib/format";
import { rankedChannels } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Рейтинг каналов — Каталог каналов MAX",
  description: "Одобренные каналы MAX по числу участников. Позже порядок будет учитывать приток подписчиков.",
};

export default async function RatingPage() {
  const { channels, unconfigured } = await rankedChannels();
  return (
    <>
      <p className="eyebrow">Catalog MAX</p>
      <h1>Рейтинг каналов</h1>
      <p className="lede">Сейчас место в списке зависит от числа участников: выше канал, у которого их больше. Позже чекер будет следить за притоком в топовых каналах и поднимать тех, кто растёт быстрее остальных.</p>
      {unconfigured ? <SetupNote /> : null}
      {!unconfigured && channels.length === 0 ? <p className="muted">Одобренных каналов в рейтинге пока нет.</p> : null}
      <ol className="rating">
        {channels.map((channel, index) => (
          <li className="panel rating-row" key={channel.id}>
            <b>{index + 1}</b>
            <div>
              <Link href={`/catalog/${channel.slug}`}><strong>{channel.title}</strong></Link>
              {channel.categories?.name ? <p className="muted">{channel.categories.name}</p> : null}
            </div>
            <span>{formatNumber(channel.subscribers_count)} участников</span>
          </li>
        ))}
      </ol>
    </>
  );
}

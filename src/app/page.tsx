import Link from "next/link";
import { ChannelCard } from "@/components/channel-card";
import { SetupNote } from "@/components/setup-note";
import { categoryCounts, freshChannels } from "@/lib/queries";
import { supabaseEnv } from "@/lib/supabase/env";

export default async function HomePage() {
  const configured = Boolean(supabaseEnv());
  const [categories, fresh] = configured ? await Promise.all([categoryCounts(), freshChannels()]) : [[], []];
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Catalog MAX</p>
          <h1>Каталог каналов MAX</h1>
          <p className="lede">Библиотека каналов мессенджера MAX. Владелец добавляет свой канал, администратор проверяет карточку, и после одобрения она появляется в каталоге: описание, категория, цена рекламы и число участников.</p>
          <p>Гость ищет каналы, смотрит рейтинг и список инструментов. Рейтинг пока строится по числу участников. Позже чекер будет следить за притоком и поднимать каналы, которые растут быстрее остальных. Как подключить базу, написано в инструкциях.</p>
          <form className="row" action="/catalog" method="get">
            <label style={{ flex: 1 }}>Поиск по каталогу<input name="q" placeholder="Название или тема" /></label>
            <button className="btn btn-primary" type="submit">Найти</button>
          </form>
        </div>
        <aside className="panel">
          <h2>Популярные категории</h2>
          <div className="chips">
            {categories.map((category) => (
              <Link className="chip" key={category.id} href={`/catalog?category=${category.id}`}>{category.name} · {category.channel_count}</Link>
            ))}
          </div>
          {categories.length === 0 ? <p className="muted">Категории появятся после подключения базы.</p> : null}
        </aside>
      </section>
      {configured ? null : <SetupNote />}
      <section>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2>Свежие объявления</h2>
          <Link className="nav-link" href="/catalog">Весь каталог</Link>
        </div>
        <div className="grid">
          {fresh.map((channel) => <ChannelCard key={channel.id} channel={channel} />)}
        </div>
        {fresh.length === 0 ? <p className="muted">Одобренных каналов пока нет.</p> : null}
      </section>
    </>
  );
}

import Link from "next/link";
import { ChannelCard } from "@/components/channel-card";
import { SetupNote } from "@/components/setup-note";
import { catalogPage } from "@/lib/queries";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const result = await catalogPage(params);
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value && key !== "page") query.set(key, value);
  return (
    <>
      <p className="eyebrow">Catalog MAX</p>
      <h1>Каталог</h1>
      {result.unconfigured ? <SetupNote /> : null}
      <form className="panel filters" action="/catalog" method="get">
        <h2>Фильтры</h2>
        <label>Поиск<input name="q" defaultValue={params.q ?? ""} /></label>
        <label>Категория
          <select name="category" defaultValue={params.category ?? ""}>
            <option value="">Все</option>
            {result.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>Цена от, ₽<input name="priceMin" defaultValue={params.priceMin ?? ""} inputMode="decimal" /></label>
        <label>Цена до, ₽<input name="priceMax" defaultValue={params.priceMax ?? ""} inputMode="decimal" /></label>
        <label>Дата с<input name="from" type="date" defaultValue={params.from ?? ""} /></label>
        <label>Дата по<input name="to" type="date" defaultValue={params.to ?? ""} /></label>
        <label>Сортировка
          <select name="sort" defaultValue={params.sort ?? "new"}>
            <option value="new">Сначала новые</option>
            <option value="subscribers">По подписчикам</option>
            <option value="reach">По охвату</option>
            <option value="err">По ERR</option>
            <option value="price">По цене рекламы</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit">Показать</button>
      </form>
      <div className="stack" style={{ marginTop: 18 }}>
        <p className="muted">Найдено: {result.count}</p>
        <div className="grid">
          {result.channels.map((channel) => <ChannelCard key={channel.id} channel={channel} />)}
        </div>
        {result.channels.length === 0 ? <p>По этим условиям карточек нет.</p> : null}
        <div className="pager">
          {Array.from({ length: result.pages }, (_, index) => {
            const page = index + 1;
            const next = new URLSearchParams(query);
            next.set("page", String(page));
            return <Link className={page === result.page ? "chip active" : "chip"} key={page} href={`/catalog?${next}`}>{page}</Link>;
          })}
        </div>
      </div>
    </>
  );
}

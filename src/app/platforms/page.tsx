import Link from "next/link";
import { SetupNote } from "@/components/setup-note";
import { pricingLabel } from "@/lib/format";
import { currentSession } from "@/lib/auth";
import { platforms } from "@/lib/queries";

const TOOLS = ["Боты", "Аналитика", "Автопостинг", "Реклама"];

export default async function PlatformsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [{ rows, unconfigured }, session] = await Promise.all([platforms(params), currentSession()]);
  const admin = session?.profile.role === "admin";
  return (
    <>
      <p className="eyebrow">Catalog MAX</p>
      <h1>Инструменты для MAX</h1>
      <p className="lede">Сервисы, боты и софт для работы в MAX. Раздел наполняет администратор.</p>
      {unconfigured ? <SetupNote /> : null}
      <form className="row" action="/platforms" method="get">
        <label style={{ flex: 1 }}>Поиск<input name="q" defaultValue={params.q ?? ""} /></label>
        <label>Тип
          <select name="tool" defaultValue={params.tool ?? ""}>
            <option value="">Все</option>
            {TOOLS.map((tool) => <option key={tool}>{tool}</option>)}
          </select>
        </label>
        <label>Оплата
          <select name="pricing" defaultValue={params.pricing ?? ""}>
            <option value="">Все</option>
            <option value="free">Бесплатно</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Платно</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit">Фильтр</button>
        {admin ? <Link className="btn" href="/admin/platforms">Редактировать</Link> : null}
      </form>
      <div className="grid" style={{ marginTop: 18 }}>
        {rows.map((item) => (
          <article className="card" key={item.id}>
            {item.logo_url ? <img className="thumb" src={item.logo_url} alt="" /> : <div className="ph" />}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="row">
              <span className="badge">{item.tool_category}</span>
              <span className="badge">{pricingLabel(item.pricing_type)}</span>
              {item.is_featured ? <span className="badge blue">Избранное редакции</span> : null}
            </div>
            <a className="btn" href={item.url}>Перейти</a>
          </article>
        ))}
      </div>
      {rows.length === 0 ? <p className="muted">Инструментов по этому фильтру нет.</p> : null}
    </>
  );
}

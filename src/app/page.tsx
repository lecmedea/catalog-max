import Link from "next/link";
import data from "../../public/data/channels.json";

export default function HomePage() {
  const described = data.channels.filter(channel => channel.description).length;
  return <>
    <section className="hero"><div><h1>Каталог каналов MAX</h1><p className="lede">{data.channels.length} каналов и ботов в одной таблице: ссылки, названия, описания и число участников.</p><form className="row" action="/catalog" method="get"><label style={{flex:1}}>Поиск по каталогу<input name="q" type="search" placeholder="Название, тема или ссылка" /></label><button className="btn btn-primary" type="submit">Найти</button></form></div><aside className="panel"><h2>Найдите свой канал</h2><p>Отбирайте по числу участников, наличию описания и аватарки. Сортируйте и сохраняйте свою выборку.</p><Link className="btn btn-primary" href="/catalog">Открыть таблицу</Link></aside></section>
    <section className="panel"><h2>Каталог пополняется</h2><p>У {described} записей есть полученное описание. Если название или описание ещё недоступны, мы показываем это прямо в таблице.</p><p>Записи пока добавляет редакция. Вход для просмотра и поиска не нужен.</p><Link className="btn" href="/catalog?description=yes">Каналы с описанием</Link></section>
  </>;
}

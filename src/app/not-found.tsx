import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel">
      <h1>Такой страницы нет</h1>
      <Link className="btn" href="/catalog">Вернуться в каталог</Link>
    </section>
  );
}

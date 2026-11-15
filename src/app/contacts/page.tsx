import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты — Каталог каналов MAX",
  description: "Страница контактов каталога каналов MAX. Контакты будут добавлены позже.",
};

export default function ContactsPage() {
  return (
    <>
      <p className="eyebrow">Catalog MAX</p>
      <h1>Контакты</h1>
      <section className="panel">
        <p className="lede">Контакты появятся здесь позже. Пока на этой странице ничего не указано.</p>
      </section>
    </>
  );
}

import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <section className="panel">
      <h1>Ссылка не сработала</h1>
      <p>Запросите письмо ещё раз. Ссылка одноразовая и действует ограниченное время.</p>
      <Link className="btn" href="/auth/reset-password">Запросить снова</Link>
    </section>
  );
}

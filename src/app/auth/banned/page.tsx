import { logout } from "@/app/actions/auth";

export default function BannedPage() {
  return (
    <section className="panel stack" style={{ maxWidth: 520 }}>
      <h1>Аккаунт закрыт</h1>
      <p>Администратор ограничил этот профиль. Каталог по-прежнему можно смотреть без входа.</p>
      <form action={logout}><button className="btn" type="submit">Выйти</button></form>
    </section>
  );
}

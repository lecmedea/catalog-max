import Link from "next/link";

export function SetupNote() {
  return (
    <section className="note panel">
      <h2>База ещё не подключена</h2>
      <p>Каталог заработает после регистрации в Supabase и двух вставок: ключей в файл на компьютере и готового SQL в базу. Пошагово это расписано на странице инструкций.</p>
      <Link className="btn btn-primary" href="/instructions">Открыть инструкции</Link>
    </section>
  );
}

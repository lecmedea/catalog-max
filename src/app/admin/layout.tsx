import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="dash">
      <aside className="panel side">
        <p className="eyebrow">Администратор</p>
        <Link href="/admin">Модерация</Link>
        <Link href="/admin/users">Пользователи</Link>
        <Link href="/admin/platforms">Инструменты</Link>
        <Link href="/admin/categories">Категории</Link>
        <Link href="/dashboard">Кабинет</Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}

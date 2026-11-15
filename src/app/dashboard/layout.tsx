import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  return (
    <div className="dash">
      <aside className="panel side">
        <p className="eyebrow">{profile.username}</p>
        <Link href="/dashboard">Обзор</Link>
        <Link href="/dashboard/channels">Каналы</Link>
        <Link href="/dashboard/favorites">Избранное</Link>
        <Link href="/dashboard/profile">Анкета</Link>
        <form action={logout}><button className="btn" type="submit">Выйти</button></form>
      </aside>
      <div>{children}</div>
    </div>
  );
}

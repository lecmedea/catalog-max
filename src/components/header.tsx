import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Profile } from "@/lib/types";

export function Header({ profile }: { profile: Pick<Profile, "username" | "full_name" | "role"> | null }) {
  return (
    <header className="shell top">
      <Link className="brand" href="/">
        <Logo />
        <span>
          <strong>Каталог каналов MAX</strong>
          <small>Catalog MAX</small>
        </span>
      </Link>
      <nav>
        <Link className="nav-link" href="/">Главная</Link>
        <Link className="nav-link" href="/catalog">Каталог</Link>
        <Link className="nav-link" href="/sale">Продажа каналов и ботов</Link>
        <Link className="nav-link" href="/rating">Рейтинг каналов</Link>
        <Link className="nav-link" href="/platforms">Инструменты</Link>
        <Link className="btn" href="/instructions">Инструкции</Link>
        <Link className="nav-link" href="/contacts">Контакты</Link>
        {profile?.role === "admin" ? <Link className="nav-link" href="/admin">Админка</Link> : null}
        {profile ? <Link className="nav-link" href="/dashboard">{profile.full_name || profile.username || "Кабинет"}</Link> : null}
      </nav>
    </header>
  );
}

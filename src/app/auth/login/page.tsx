import Link from "next/link";
import { login } from "@/app/actions/auth";
import { SketchForm } from "@/components/sketch-form";
import { safeNext } from "@/lib/validators";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  return (
    <section className="panel stack" style={{ maxWidth: 460 }}>
      <p className="eyebrow">Catalog MAX</p>
      <h1>Вход</h1>
      <SketchForm action={login} submitLabel="Войти">
        <input type="hidden" name="next" value={next} />
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Пароль<input name="password" type="password" required autoComplete="current-password" /></label>
      </SketchForm>
      <p><Link href="/auth/reset-password">Забыли пароль</Link></p>
      <p>Нет аккаунта? <Link href="/auth/register">Регистрация</Link></p>
    </section>
  );
}

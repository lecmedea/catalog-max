import Link from "next/link";
import { register } from "@/app/actions/auth";
import { SketchForm } from "@/components/sketch-form";

export default function RegisterPage() {
  return (
    <section className="panel stack" style={{ maxWidth: 520 }}>
      <p className="eyebrow">Catalog MAX</p>
      <h1>Регистрация</h1>
      <p>Email, пароль от 8 символов и уникальный никнейм. Роль администратора из формы не назначается.</p>
      <SketchForm action={register} submitLabel="Создать аккаунт">
        <label>Имя или псевдоним<input name="full_name" maxLength={80} /></label>
        <label>Никнейм<input name="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Пароль<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" /></label>
      </SketchForm>
      <p>Уже есть аккаунт? <Link href="/auth/login">Войти</Link></p>
    </section>
  );
}

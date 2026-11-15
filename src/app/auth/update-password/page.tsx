import { updatePassword } from "@/app/actions/auth";
import { SketchForm } from "@/components/sketch-form";
import { requireUser } from "@/lib/auth";

export default async function UpdatePasswordPage() {
  await requireUser();
  return (
    <section className="panel stack" style={{ maxWidth: 460 }}>
      <h1>Новый пароль</h1>
      <SketchForm action={updatePassword} submitLabel="Сохранить пароль">
        <label>Новый пароль<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" /></label>
      </SketchForm>
    </section>
  );
}

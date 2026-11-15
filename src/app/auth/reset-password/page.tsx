import { requestReset } from "@/app/actions/auth";
import { SketchForm } from "@/components/sketch-form";

export default function ResetPage() {
  return (
    <section className="panel stack" style={{ maxWidth: 460 }}>
      <h1>Восстановление пароля</h1>
      <p>Ссылка придёт на почту, если такой аккаунт есть.</p>
      <SketchForm action={requestReset} submitLabel="Отправить ссылку">
        <label>Email<input name="email" type="email" required /></label>
      </SketchForm>
    </section>
  );
}

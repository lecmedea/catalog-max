import { updatePassword } from "@/app/actions/auth";
import { saveProfile } from "@/app/actions/profile";
import { SketchForm } from "@/components/sketch-form";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const { profile } = await requireUser();
  return (
    <section className="stack">
      <h1>Анкета</h1>
      <SketchForm action={saveProfile} submitLabel="Сохранить анкету">
        <label>Имя или псевдоним<input name="full_name" maxLength={80} defaultValue={profile.full_name ?? ""} /></label>
        <label>Никнейм<input name="username" required defaultValue={profile.username ?? ""} /></label>
        <label>Фото<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></label>
        <label>Контакт в MAX<input name="max_contact" defaultValue={profile.max_contact ?? ""} placeholder="@ник или ссылка" /></label>
        <label>Агентство или студия<input name="company_or_agency" defaultValue={profile.company_or_agency ?? ""} /></label>
        <label>О себе, до 300 знаков<textarea name="bio" maxLength={300} defaultValue={profile.bio ?? ""} /></label>
        <label>Тип аккаунта
          <select name="account_type" defaultValue={profile.account_type ?? "owner"}>
            <option value="owner">Владелец каналов</option>
            <option value="advertiser">Рекламодатель / Агентство</option>
          </select>
        </label>
        <label className="check"><input name="show_contacts_publicly" type="checkbox" defaultChecked={profile.show_contacts_publicly} /> Показывать контакт MAX на страницах моих каналов</label>
      </SketchForm>
      <div className="panel">
        <h2>Смена пароля</h2>
        <SketchForm action={updatePassword} submitLabel="Обновить пароль">
          <label>Текущий пароль<input name="current_password" type="password" autoComplete="current-password" /></label>
          <label>Новый пароль<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" /></label>
        </SketchForm>
      </div>
    </section>
  );
}

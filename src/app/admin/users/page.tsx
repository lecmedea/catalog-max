import { saveUser } from "@/app/actions/admin";
import { SketchForm } from "@/components/sketch-form";
import { requireAdmin } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export default async function UsersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("id, email, username, full_name, role, is_banned, created_at").order("created_at", { ascending: false });
  const users = (data ?? []) as Profile[];
  return (
    <section className="stack">
      <h1>Пользователи</h1>
      {users.map((user) => (
        <article className="panel" key={user.id}>
          <h2>{user.full_name || user.username}</h2>
          <p className="muted">{user.email} · {user.username}</p>
          <SketchForm action={saveUser} submitLabel="Обновить доступ">
            <input type="hidden" name="id" value={user.id} />
            <label>Роль
              <select name="role" defaultValue={user.role}>
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
            </label>
            <label className="check"><input name="is_banned" type="checkbox" defaultChecked={user.is_banned} /> Закрыть аккаунт</label>
          </SketchForm>
        </article>
      ))}
    </section>
  );
}

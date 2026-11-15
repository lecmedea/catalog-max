import { deleteCategory, saveCategory } from "@/app/actions/admin";
import { SketchForm } from "@/components/sketch-form";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("id, name, slug, icon").order("name");
  const categories = (data ?? []) as Category[];
  return (
    <section className="stack">
      <h1>Категории</h1>
      <div className="panel">
        <SketchForm action={saveCategory} submitLabel="Добавить категорию">
          <label>Название<input name="name" required /></label>
          <label>Адрес<input name="slug" placeholder="Из названия" /></label>
          <label>Короткая пометка<input name="icon" /></label>
        </SketchForm>
      </div>
      {categories.map((category) => (
        <article className="panel stack" key={category.id}>
          <SketchForm action={saveCategory} submitLabel="Сохранить">
            <input type="hidden" name="id" value={category.id} />
            <label>Название<input name="name" defaultValue={category.name} /></label>
            <label>Адрес<input name="slug" defaultValue={category.slug} /></label>
            <label>Пометка<input name="icon" defaultValue={category.icon ?? ""} /></label>
          </SketchForm>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <button className="btn" type="submit">Удалить</button>
          </form>
        </article>
      ))}
    </section>
  );
}

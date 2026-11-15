import { deletePlatform, savePlatform } from "@/app/actions/admin";
import { SketchForm } from "@/components/sketch-form";
import { requireAdmin } from "@/lib/auth";
import { pricingLabel } from "@/lib/format";
import type { Platform } from "@/lib/types";

export default async function AdminPlatformsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("platforms").select("*").order("title");
  const rows = (data ?? []) as Platform[];
  return (
    <section className="stack">
      <h1>Инструменты</h1>
      <div className="panel">
        <h2>Новая карточка</h2>
        <SketchForm action={savePlatform} submitLabel="Опубликовать">
          <label>Название<input name="title" required /></label>
          <label>Адрес<input name="slug" placeholder="Из названия" /></label>
          <label>Описание<textarea name="description" required maxLength={500} /></label>
          <label>Сайт или бот<input name="url" type="url" required placeholder="https://" /></label>
          <label>Тип<input name="tool_category" required placeholder="Боты, Аналитика, Автопостинг, Реклама" /></label>
          <label>Оплата
            <select name="pricing_type" defaultValue="free">
              <option value="free">Бесплатно</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Платно</option>
            </select>
          </label>
          <label className="check"><input name="is_featured" type="checkbox" /> Показать выше остальных</label>
          <label>Логотип<input name="logo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
        </SketchForm>
      </div>
      {rows.map((item) => (
        <article className="panel stack" key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.tool_category} · {pricingLabel(item.pricing_type)}</p>
          <SketchForm action={savePlatform} submitLabel="Сохранить">
            <input type="hidden" name="id" value={item.id} />
            <label>Название<input name="title" defaultValue={item.title} /></label>
            <label>Адрес<input name="slug" defaultValue={item.slug} /></label>
            <label>Описание<textarea name="description" defaultValue={item.description} /></label>
            <label>Ссылка<input name="url" defaultValue={item.url} /></label>
            <label>Тип<input name="tool_category" defaultValue={item.tool_category} /></label>
            <label>Оплата
              <select name="pricing_type" defaultValue={item.pricing_type}>
                <option value="free">Бесплатно</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Платно</option>
              </select>
            </label>
            <label className="check"><input name="is_featured" type="checkbox" defaultChecked={item.is_featured} /> Выше остальных</label>
            <label>Новый логотип<input name="logo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          </SketchForm>
          <form action={deletePlatform}>
            <input type="hidden" name="id" value={item.id} />
            <button className="btn" type="submit">Удалить</button>
          </form>
        </article>
      ))}
    </section>
  );
}

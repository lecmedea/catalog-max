import type { Category, Channel } from "@/lib/types";

export function ChannelFields({ channel, categories }: { channel?: Channel; categories: Category[] }) {
  return (
    <>
      {channel ? <input type="hidden" name="id" value={channel.id} /> : null}
      <label>Название<input name="title" required maxLength={120} defaultValue={channel?.title ?? ""} /></label>
      <label>Адрес в MAX<input name="max_link" required placeholder="https://max.ru/…" defaultValue={channel?.max_link ?? ""} /></label>
      <label>Короткий адрес карточки<input name="slug" placeholder="Заполнится из названия" defaultValue={channel?.slug ?? ""} /></label>
      <label>Категория
        <select name="category_id" defaultValue={channel?.category_id ?? ""}>
          <option value="">Без категории</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label>Описание<textarea name="description" maxLength={4000} defaultValue={channel?.description ?? ""} /></label>
      <label>Цена рекламы, ₽<input name="ad_price" inputMode="decimal" defaultValue={channel?.ad_price ?? ""} /></label>
      <label>Контакт менеджера<input name="manager_contact" maxLength={160} defaultValue={channel?.manager_contact ?? ""} /></label>
      <label>Обложка<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></label>
      <label>Галерея, до 6 фото<input name="gallery" type="file" accept="image/jpeg,image/png,image/webp" multiple /></label>
      {channel?.gallery.map((url) => <input key={url} type="hidden" name="keep" value={url} />)}
    </>
  );
}

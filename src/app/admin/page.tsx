import { addStat, moderateChannel } from "@/app/actions/admin";
import { SketchForm } from "@/components/sketch-form";
import { requireAdmin } from "@/lib/auth";
import { statusLabel } from "@/lib/format";
import { CHANNEL_COLUMNS, type Channel } from "@/lib/types";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("channels").select(`${CHANNEL_COLUMNS}, channel_verifications(code)`).order("created_at", { ascending: false }).limit(50);
  const channels = (data ?? []) as unknown as Array<Channel & { channel_verifications: { code: string } | { code: string }[] | null }>;
  return (
    <section className="stack">
      <h1>Модерация каналов</h1>
      {channels.map((channel) => {
        const code = Array.isArray(channel.channel_verifications) ? channel.channel_verifications[0]?.code : channel.channel_verifications?.code;
        return (
          <article className="panel stack" key={channel.id}>
            <h2>{channel.title}</h2>
            <p>{statusLabel(channel.status)} · <a href={channel.max_link}>{channel.max_link}</a></p>
            <p>Код владения: <strong>{code ?? "нет"}</strong></p>
            {channel.description ? <p>{channel.description}</p> : null}
            <SketchForm action={moderateChannel} submitLabel="Сохранить решение">
              <input type="hidden" name="id" value={channel.id} />
              <label>Статус
                <select name="status" defaultValue={channel.status}>
                  <option value="pending">На модерации</option>
                  <option value="approved">Одобрить</option>
                  <option value="rejected">Отклонить</option>
                </select>
              </label>
              <label>Причина отклонения<textarea name="rejection_reason" defaultValue={channel.rejection_reason ?? ""} /></label>
              <label className="check"><input name="is_verified" type="checkbox" defaultChecked={channel.is_verified} /> Синяя галочка</label>
              <label>Подписчики<input name="subscribers_count" type="number" min={0} defaultValue={channel.subscribers_count} /></label>
              <label>Средний охват<input name="avg_post_reach" type="number" min={0} defaultValue={channel.avg_post_reach} /></label>
              <label>ERR, %<input name="err_percent" inputMode="decimal" defaultValue={channel.err_percent ?? ""} /></label>
            </SketchForm>
            <SketchForm action={addStat} submitLabel="Добавить точку графика">
              <input type="hidden" name="channel_id" value={channel.id} />
              <label>Дата<input name="stat_date" type="date" required /></label>
              <label>Подписчики<input name="subscribers_count" type="number" min={0} required /></label>
              <label>Охват<input name="reach_count" type="number" min={0} required /></label>
            </SketchForm>
          </article>
        );
      })}
      {channels.length === 0 ? <p className="muted">Заявок нет.</p> : null}
    </section>
  );
}

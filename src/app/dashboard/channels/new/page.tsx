import { saveChannel } from "@/app/actions/channels";
import { ChannelFields } from "@/components/channel-fields";
import { SketchForm } from "@/components/sketch-form";
import { requireUser } from "@/lib/auth";
import type { Category } from "@/lib/types";

export default async function NewChannelPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("categories").select("id, name, slug, icon").order("name");
  return (
    <section className="stack">
      <h1>Новый канал</h1>
      <p>Заявка уходит на модерацию. Метрики и галочку ставит администратор.</p>
      <SketchForm action={saveChannel} submitLabel="Отправить на модерацию">
        <ChannelFields categories={(data ?? []) as Category[]} />
      </SketchForm>
    </section>
  );
}

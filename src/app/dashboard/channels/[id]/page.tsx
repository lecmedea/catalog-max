import { notFound } from "next/navigation";
import { deleteChannel, saveChannel } from "@/app/actions/channels";
import { ChannelFields } from "@/components/channel-fields";
import { SketchForm } from "@/components/sketch-form";
import { requireUser } from "@/lib/auth";
import { statusLabel } from "@/lib/format";
import { CHANNEL_COLUMNS, type Category, type Channel } from "@/lib/types";

export default async function EditChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const [{ data: channel }, { data: categories }, { data: verification }] = await Promise.all([
    supabase.from("channels").select(CHANNEL_COLUMNS).eq("id", id).eq("owner_id", userId).maybeSingle(),
    supabase.from("categories").select("id, name, slug, icon").order("name"),
    supabase.from("channel_verifications").select("code").eq("channel_id", id).maybeSingle(),
  ]);
  if (!channel) notFound();
  const row = channel as unknown as Channel;
  return (
    <section className="stack">
      <h1>{row.title}</h1>
      <p>{statusLabel(row.status)}{row.is_verified ? " · галочка выдана" : ""}</p>
      {row.status === "rejected" && row.rejection_reason ? <p className="error">Причина отклонения: {row.rejection_reason}</p> : null}
      {verification?.code ? (
        <div className="panel">
          <h2>Код владения</h2>
          <p>Временно вставьте в описание канала в MAX: <strong>{verification.code}</strong></p>
          <p className="muted">Администратор сверит код при модерации и поймёт, что канал ваш.</p>
        </div>
      ) : null}
      <SketchForm action={saveChannel} submitLabel="Сохранить правки">
        <ChannelFields channel={row} categories={(categories ?? []) as Category[]} />
      </SketchForm>
      <form action={deleteChannel}>
        <input type="hidden" name="id" value={row.id} />
        <button className="btn" type="submit">Удалить канал</button>
      </form>
    </section>
  );
}

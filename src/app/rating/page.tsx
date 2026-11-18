import { PublicCatalog } from "@/components/public-catalog";
import data from "../../../public/data/channels.json";
export default function RatingPage() {
  return <><h1 className="catalog-heading">Рейтинг каналов MAX</h1><p className="catalog-intro">Каналы по числу участников. Данные проверены 15 ноября 2026 года; счётчики могут меняться.</p><PublicCatalog channels={data.channels} /></>;
}

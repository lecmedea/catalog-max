import { PublicCatalog } from "@/components/public-catalog";
import data from "../../../public/data/channels.json";

export default function CatalogPage() {
  return <>
    <h1 className="catalog-heading">Каталог каналов MAX</h1>
    <p className="catalog-intro">Каналы и боты в одной таблице. Найдите нужную тему, сравните число участников и перейдите в MAX.</p>
    <p className="catalog-editorial">Каталог пополняет редакция. Данные проверены 15 ноября 2026 года; счётчики могут меняться. Если сведения недоступны, это отмечено в таблице.</p>
    <PublicCatalog channels={data.channels} />
  </>;
}

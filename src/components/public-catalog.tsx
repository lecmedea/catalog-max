"use client";

import { useEffect, useRef } from "react";
import { mountCatalog, type PublicChannel } from "../../public/catalog-widget.mjs";

export function PublicCatalog({ channels }: { channels: PublicChannel[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return mountCatalog(root.current, channels);
  }, [channels]);
  return <div ref={root} data-public-catalog><p>Загружаем таблицу каналов…</p><noscript>Для поиска и фильтров включите JavaScript.</noscript></div>;
}

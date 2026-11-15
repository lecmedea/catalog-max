"use client";

import { usePathname } from "next/navigation";
import { ChickStage } from "@/components/chick-stage";

const FLOCKS: Array<{ test: (path: string) => boolean; ids: string[] }> = [
  { test: (path) => path === "/", ids: ["01", "08"] },
  { test: (path) => path.startsWith("/instructions"), ids: ["04", "05"] },
  { test: (path) => path.startsWith("/platforms"), ids: ["03", "06"] },
  { test: (path) => path.startsWith("/rating"), ids: ["02", "11"] },
  { test: (path) => path.startsWith("/contacts"), ids: ["07", "12"] },
  { test: (path) => path === "/login" || path.startsWith("/auth/login"), ids: ["09", "13"] },
  { test: (path) => path === "/register" || path.startsWith("/auth/register"), ids: ["10"] },
  { test: (path) => path.startsWith("/auth/reset-password"), ids: ["14"] },
  { test: (path) => path.startsWith("/dashboard"), ids: ["10", "05"] },
  { test: (path) => path.startsWith("/admin"), ids: ["09", "06"] },
  { test: (path) => path.startsWith("/auth/update-password"), ids: ["14", "04"] },
];

function flockFor(path: string) {
  if (path === "/catalog" || path.startsWith("/catalog/")) return [];
  return FLOCKS.find((flock) => flock.test(path))?.ids ?? ["01", "11"];
}

export function Chicks() {
  const path = usePathname() || "/";
  const ids = flockFor(path);
  if (ids.length === 0) return null;
  return <ChickStage key={ids.join("-")} ids={ids} />;
}

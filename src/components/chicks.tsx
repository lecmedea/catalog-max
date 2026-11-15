"use client";

import { usePathname } from "next/navigation";

const WALK = new Set(["01", "02", "03", "08", "09", "10"]);
const DRIFT = new Set(["07", "14"]);

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
  const ids = flockFor(usePathname() || "/");
  if (ids.length === 0) return null;
  return (
    <div className="chicks" aria-hidden="true">
      {ids.map((id, index) => {
        const walker = WALK.has(id);
        const motion = walker ? "walk" : DRIFT.has(id) ? "drift" : "hang";
        return (
          <img
            key={id}
            className={`chick ${motion}`}
            src={`/chicks/chick-${id}.png`}
            alt=""
            style={walker ? {
              animationDelay: `-${Number(id) * 1.7}s`,
              animationDuration: `${16 + (Number(id) % 5)}s`,
            } : {
              left: `${10 + index * 34}%`,
              bottom: `${8 + (index % 2) * 18}px`,
              animationDelay: `${index * 0.45}s`,
            }}
          />
        );
      })}
    </div>
  );
}

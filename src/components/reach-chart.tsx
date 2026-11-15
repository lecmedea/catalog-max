import type { ChannelStat } from "@/lib/types";

export function ReachChart({ rows }: { rows: ChannelStat[] }) {
  if (rows.length < 2) return <p className="muted">Для графика нужны хотя бы две даты статистики.</p>;
  const width = 640;
  const height = 180;
  const max = Math.max(...rows.map((row) => row.reach_count), 1);
  const step = (width - 24) / (rows.length - 1);
  const points = rows.map((row, index) => `${12 + index * step},${height - 16 - (row.reach_count / max) * (height - 36)}`).join(" ");
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Охват по датам">
      <path d="M8 16 H632 M8 88 H632 M8 160 H632" stroke="#1b1714" strokeDasharray="3 6" />
      <polyline points={points} fill="none" stroke="#2c6bed" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

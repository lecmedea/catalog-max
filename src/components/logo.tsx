import { useId } from "react";

export function Logo({ size = 83 }: { size?: number }) {
  const gradientId = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 86 86" aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="38%" stopColor="#d9fff4" />
          <stop offset="68%" stopColor="#f6c2ff" />
          <stop offset="100%" stopColor="#8ecbff" />
        </radialGradient>
      </defs>
      <path d="M43 7c14 1 29 10 32 26 3 18-6 34-22 41-16 7-34-2-38-20C11 34 24 8 43 7z" fill="#fff8e4" stroke="#1b1714" strokeWidth="2.4" />
      <path d="M43 16c11 0 22 8 24 20 2 14-6 27-19 32-13 5-27-2-30-16C15 38 28 16 43 16z" fill={`url(#${gradientId})`} stroke="#1b1714" strokeWidth="1.4" />
      <path d="M34 28l14 8-6 18-16-6z" fill="#ffd36a" opacity="0.8" />
      <path d="M48 30l12 4-2 16-12-2z" fill="#7ee0ff" opacity="0.75" />
      <path d="M36 44l10-2 6 14-14 4z" fill="#ff9ad5" opacity="0.7" />
      <path d="M31 50 V39 L35.6 45 L40.2 39 V50 M43 50 L46.2 39 L49.4 50 M44.1 45.6 H48.2 M51.2 39 L57 50 M57 39 L51.2 50" fill="none" stroke="#1b1714" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 22c8-4 18-3 22 2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

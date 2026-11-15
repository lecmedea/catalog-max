"use client";

import { useEffect, useRef } from "react";

type Rest = "arc" | "dot" | "wide";
type Role = "pecker" | "sleepy" | "hat" | "hatch" | "curious" | "panic" | "cup" | "cheep" | "flop" | "giggle" | "shy" | "lid" | "flip" | "shard";

type Face = {
  eyes: Array<[number, number]>;
  beak: [number, number];
  rest: Rest;
  legs: boolean;
  shell: boolean;
  peek: boolean;
};

const CAST: Record<string, { role: Role; face: Face }> = {
  "01": { role: "pecker", face: { eyes: [[0.336, 0.369], [0.634, 0.375]], beak: [0.488, 0.398], rest: "arc", legs: true, shell: false, peek: false } },
  "02": { role: "sleepy", face: { eyes: [[0.335, 0.404], [0.641, 0.358]], beak: [0.495, 0.412], rest: "arc", legs: true, shell: true, peek: false } },
  "03": { role: "hat", face: { eyes: [[0.37, 0.266], [0.664, 0.35]], beak: [0.49, 0.325], rest: "arc", legs: true, shell: true, peek: false } },
  "04": { role: "hatch", face: { eyes: [[0.313, 0.318], [0.652, 0.325]], beak: [0.489, 0.34], rest: "arc", legs: true, shell: true, peek: false } },
  "05": { role: "curious", face: { eyes: [[0.33, 0.319], [0.649, 0.321]], beak: [0.488, 0.341], rest: "dot", legs: true, shell: true, peek: false } },
  "06": { role: "panic", face: { eyes: [[0.327, 0.223], [0.682, 0.228]], beak: [0.503, 0.277], rest: "wide", legs: false, shell: true, peek: false } },
  "07": { role: "cup", face: { eyes: [[0.42, 0.22], [0.58, 0.22]], beak: [0.5, 0.3], rest: "dot", legs: false, shell: true, peek: true } },
  "08": { role: "cheep", face: { eyes: [[0.337, 0.38], [0.643, 0.38]], beak: [0.498, 0.403], rest: "dot", legs: true, shell: false, peek: false } },
  "09": { role: "flop", face: { eyes: [[0.352, 0.402], [0.66, 0.369]], beak: [0.488, 0.43], rest: "arc", legs: true, shell: true, peek: false } },
  "10": { role: "giggle", face: { eyes: [[0.375, 0.383], [0.677, 0.393]], beak: [0.505, 0.422], rest: "arc", legs: true, shell: false, peek: false } },
  "11": { role: "shy", face: { eyes: [[0.42, 0.3], [0.58, 0.3]], beak: [0.5, 0.38], rest: "dot", legs: false, shell: true, peek: true } },
  "12": { role: "lid", face: { eyes: [[0.42, 0.42], [0.58, 0.42]], beak: [0.5, 0.5], rest: "arc", legs: false, shell: true, peek: true } },
  "13": { role: "flip", face: { eyes: [[0.4, 0.55], [0.6, 0.55]], beak: [0.5, 0.64], rest: "wide", legs: false, shell: true, peek: true } },
  "14": { role: "shard", face: { eyes: [[0.38, 0.42], [0.56, 0.42]], beak: [0.47, 0.52], rest: "wide", legs: false, shell: true, peek: true } },
};

const SCRIPTS: Record<Role, string[]> = {
  pecker: ["breathe", "walk", "breathe", "peck", "peck"],
  sleepy: ["breathe", "yawn", "sink", "breathe"],
  hat: ["walk", "breathe", "tip", "hop"],
  hatch: ["closed", "open", "look", "close"],
  curious: ["breathe", "lookleft", "lookright", "gasp", "hop"],
  panic: ["lookleft", "lookright", "lookleft", "crouch", "dash", "skid", "scratch", "breathe"],
  cup: ["rock", "rise", "look", "duck"],
  cheep: ["cheep", "walk", "bow", "cheep"],
  flop: ["stretch", "proud", "flop", "breathe"],
  giggle: ["laugh", "hop", "peck", "laugh"],
  shy: ["closed", "rise", "look", "duck"],
  lid: ["rock", "rise", "wave", "slam"],
  flip: ["tap", "wait", "flip", "peek"],
  shard: ["skitter", "peek", "hide", "skitter"],
};

const DUR: Record<string, number> = {
  breathe: 0.9,
  walk: 1.7,
  peck: 0.62,
  yawn: 1.15,
  sink: 1.3,
  tip: 0.9,
  hop: 0.55,
  closed: 0.7,
  open: 1.15,
  look: 0.95,
  close: 1.05,
  lookleft: 0.42,
  lookright: 0.42,
  gasp: 0.55,
  crouch: 0.22,
  dash: 0.5,
  skid: 0.38,
  scratch: 0.95,
  rock: 0.8,
  rise: 0.9,
  duck: 0.85,
  cheep: 0.85,
  bow: 0.7,
  stretch: 0.7,
  proud: 0.8,
  flop: 1.1,
  laugh: 0.85,
  wave: 0.7,
  slam: 0.45,
  tap: 0.6,
  wait: 0.45,
  flip: 0.85,
  peek: 0.8,
  hide: 0.55,
  skitter: 0.7,
};

type Actor = {
  id: string;
  role: Role;
  face: Face;
  img: HTMLImageElement;
  box: [number, number, number, number];
  cheek: string;
  x: number;
  x0: number;
  facing: number;
  phase: number;
  name: string;
  age: number;
  blinkAt: number;
  blinkT: number;
  step: number;
  hatch: number;
  clock: number;
  placed: boolean;
};

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function easeOut(u: number) {
  return 1 - (1 - u) ** 3;
}
function easeInOut(u: number) {
  return u < 0.5 ? 2 * u * u : 1 - ((-2 * u + 2) ** 2) / 2;
}
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

// На 20% крупнее актуальной локальной версии Grok (0.15 × 1.2).
const CHICK_SCALE = 0.18;

function opaqueBox(img: HTMLImageElement): [number, number, number, number] {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return [0, 0, img.width, img.height];
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, c.width, c.height).data;
  let minx = c.width;
  let miny = c.height;
  let maxx = 0;
  let maxy = 0;
  for (let y = 0; y < c.height; y += 1) {
    for (let x = 0; x < c.width; x += 1) {
      if (data[(y * c.width + x) * 4 + 3] < 40) continue;
      if (x < minx) minx = x;
      if (y < miny) miny = y;
      if (x > maxx) maxx = x;
      if (y > maxy) maxy = y;
    }
  }
  return [minx, miny, Math.max(1, maxx - minx + 1), Math.max(1, maxy - miny + 1)];
}

function sampleCheek(img: HTMLImageElement, box: [number, number, number, number], face: Face) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return "#ffe14a";
  g.drawImage(img, 0, 0);
  const [bx, by, bw, bh] = box;
  const x = Math.round(bx + face.beak[0] * bw);
  const y = Math.round(by + Math.min(0.92, face.beak[1] + 0.08) * bh);
  const p = g.getImageData(clamp(x, 0, c.width - 1), clamp(y, 0, c.height - 1), 1, 1).data;
  if (p[3] < 30) return face.shell && !face.legs ? "#fff6dc" : "#ffe14a";
  return `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

type Pose = {
  rot: number;
  sx: number;
  sy: number;
  lift: number;
  beak: number;
  look: number;
  eyes: Rest;
  hatch: number;
  scratch: number;
  blush: number;
  sweat: number;
  step: number;
  cap: number;
};

function poseAt(actor: Actor, name: string, u: number, reduce: boolean): Pose {
  const pose: Pose = {
    rot: 0, sx: 1, sy: 1, lift: 0, beak: 0, look: 0, eyes: actor.face.rest,
    hatch: actor.hatch, scratch: 0, blush: 0, sweat: 0, step: actor.step, cap: 0,
  };
  if (reduce) {
    pose.sy = 1 + Math.sin(actor.clock * 1.4) * 0.012;
    return pose;
  }
  const breathe = Math.sin(actor.clock * 2.2);
  pose.sy = 1 + breathe * 0.018;
  pose.sx = 1 - breathe * 0.012;
  if (name === "breathe") pose.rot = Math.sin(actor.clock * 1.3) * 0.03;
  if (name === "walk") {
    const steps = 4;
    const p = u * steps;
    const f = p - Math.floor(p);
    const swing = Math.sin(f * Math.PI);
    pose.step = f;
    pose.sy = 1 + swing * 0.07;
    pose.sx = 1 - swing * 0.04;
    pose.rot = swing * 0.07 * actor.facing;
    pose.lift = swing * 3;
  }
  if (name === "peck") {
    const wind = u < 0.28 ? easeInOut(u / 0.28) : u < 0.46 ? 1 : 1 - easeOut((u - 0.46) / 0.54);
    const strike = u < 0.28 ? 0 : u < 0.46 ? easeOut((u - 0.28) / 0.18) : 1 - easeOut((u - 0.46) / 0.54);
    pose.rot = -0.22 * wind + 0.72 * strike;
    pose.sy = 1 + 0.06 * wind - 0.12 * strike;
    pose.sx = 1 - 0.04 * wind + 0.06 * strike;
    pose.beak = strike;
    pose.eyes = strike > 0.4 ? "dot" : actor.face.rest;
  }
  if (name === "yawn") {
    const o = Math.sin(Math.min(1, u) * Math.PI);
    pose.beak = o;
    pose.sy = 1 + o * 0.05;
    pose.rot = -0.06 * o;
    pose.eyes = "arc";
  }
  if (name === "sink" || name === "flop") {
    const d = easeInOut(u < 0.55 ? u / 0.55 : 1 - (u - 0.55) / 0.45);
    pose.hatch = 1 - d * 0.55;
    pose.lift = -d * 10;
    pose.sy = 1 - d * 0.08;
    pose.rot = name === "flop" ? d * 0.2 : 0;
  }
  if (name === "stretch" || name === "proud") {
    const o = easeOut(Math.min(1, u * 1.2));
    pose.sx = 1 + o * 0.08;
    pose.sy = 1 + (name === "stretch" ? o * 0.06 : 0);
    pose.rot = name === "proud" ? -0.08 : 0;
    pose.beak = name === "proud" ? 0.3 : 0;
  }
  if (name === "tip" || name === "scratch") {
    const o = Math.sin(u * Math.PI);
    pose.scratch = o;
    pose.rot = -0.12 * o;
    pose.look = name === "scratch" ? Math.sin(u * Math.PI * 2) * 0.8 : 0.4;
    pose.eyes = "dot";
  }
  if (name === "hop") {
    const a = Math.sin(Math.min(1, u) * Math.PI);
    pose.lift = a * 22;
    pose.sy = 1 - (u < 0.18 ? u / 0.18 : 0) * 0.1 + a * 0.06;
    pose.sx = 1 + (u < 0.18 ? u / 0.18 : 0) * 0.08;
  }
  if (name === "closed") pose.hatch = 0.08;
  if (name === "open" || name === "rise") pose.hatch = easeOut(u);
  if (name === "close" || name === "duck" || name === "slam" || name === "hide") pose.hatch = 1 - easeInOut(u);
  if (name === "look" || name === "lookleft" || name === "lookright") {
    pose.look = name === "lookright" ? 1 : name === "lookleft" ? -1 : Math.sin(u * Math.PI * 2);
    pose.eyes = actor.face.rest === "arc" ? "dot" : actor.face.rest;
    pose.rot = pose.look * 0.08;
    pose.hatch = Math.max(actor.hatch, 0.85);
  }
  if (name === "gasp") {
    pose.eyes = "wide";
    pose.beak = easeOut(Math.min(1, u * 2)) * (u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3);
    pose.sy = 1 + 0.04;
  }
  if (name === "crouch") {
    pose.sy = 1 - easeOut(u) * 0.16;
    pose.sx = 1 + easeOut(u) * 0.1;
    pose.eyes = "wide";
    pose.sweat = 1;
  }
  if (name === "dash") {
    pose.sy = 0.86;
    pose.sx = 1.12;
    pose.rot = -0.08 * actor.facing;
    pose.eyes = "wide";
    pose.look = -actor.facing;
    pose.sweat = 1;
  }
  if (name === "skid") {
    const o = 1 - easeOut(u);
    pose.rot = 0.28 * actor.facing * o;
    pose.sy = 0.9;
    pose.sx = 1.08;
    pose.eyes = "wide";
    pose.sweat = o;
  }
  if (name === "rock" || name === "tap") pose.rot = Math.sin(u * Math.PI * (name === "tap" ? 6 : 2)) * (name === "tap" ? 0.08 : 0.1);
  if (name === "cheep") {
    pose.beak = Math.abs(Math.sin(u * Math.PI * 4));
    pose.rot = Math.sin(u * Math.PI * 4) * 0.05;
    pose.eyes = "dot";
  }
  if (name === "bow") {
    const o = Math.sin(u * Math.PI);
    pose.rot = 0.35 * o;
    pose.beak = o * 0.4;
  }
  if (name === "laugh") {
    pose.rot = Math.sin(u * Math.PI * 8) * 0.08;
    pose.beak = 0.75 + Math.sin(u * Math.PI * 8) * 0.2;
    pose.blush = 1;
    pose.sy = 1 + Math.abs(Math.sin(u * Math.PI * 8)) * 0.03;
  }
  if (name === "wave") pose.scratch = Math.sin(u * Math.PI * 3);
  if (name === "flip") pose.cap = easeInOut(u) * Math.PI * 0.92;
  if (name === "peek") {
    pose.hatch = easeOut(Math.min(1, u * 1.3));
    pose.eyes = "wide";
    pose.look = Math.sin(u * Math.PI * 2) * 0.7;
  }
  if (name === "skitter") {
    pose.rot = Math.sin(u * Math.PI * 10) * 0.12;
    pose.eyes = "wide";
    pose.sweat = 0.6;
  }
  if (name === "wait") pose.eyes = "wide";
  return pose;
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, rest: Rest, blink: number, look: number, cheek: string) {
  ctx.save();
  ctx.fillStyle = cheek;
  ctx.beginPath();
  ctx.ellipse(x, y, rest === "wide" ? 12 : 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1714";
  ctx.lineWidth = 2.3;
  ctx.lineCap = "round";
  const shut = blink > 0.72;
  if (shut || (rest === "arc" && blink < 0.2)) {
    ctx.beginPath();
    ctx.arc(x, y + 1, 5.2, 0.18 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
  } else {
    const r = rest === "wide" ? 4.8 : 3.1;
    const h = r * (1 - blink * 0.92);
    ctx.beginPath();
    ctx.ellipse(x, y, r, Math.max(0.7, h), 0, 0, Math.PI * 2);
    ctx.stroke();
    if (h > 1.4) {
      ctx.fillStyle = "#1b1714";
      ctx.beginPath();
      ctx.arc(x + look * 1.8, y, rest === "wide" ? 1.7 : 1.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBeak(ctx: CanvasRenderingContext2D, x: number, y: number, open: number, cheek: string) {
  ctx.save();
  ctx.fillStyle = cheek;
  ctx.beginPath();
  ctx.ellipse(x, y, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2b000";
  ctx.strokeStyle = "#1b1714";
  ctx.lineWidth = 2;
  const gape = open * 6;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - gape * 0.2);
  ctx.quadraticCurveTo(x + 1, y - 6 - gape, x + 8, y - 1);
  ctx.quadraticCurveTo(x + 1, y + 5 + gape, x - 6, y - gape * 0.2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawActor(ctx: CanvasRenderingContext2D, actor: Actor, pose: Pose, ground: number, height: number) {
  const [bx, by, bw, bh] = actor.box;
  const dh = clamp(height * 0.72, 108, 168);
  const dw = dh * (bw / bh);
  const blink = actor.blinkT >= 0 && actor.blinkT < 0.26
    ? (actor.blinkT < 0.08 ? actor.blinkT / 0.08 : actor.blinkT < 0.14 ? 1 : actor.blinkT < 0.26 ? 1 - (actor.blinkT - 0.14) / 0.12 : 0)
    : 0;
  ctx.save();
  ctx.translate(actor.x, ground);
  ctx.scale(CHICK_SCALE, CHICK_SCALE);
  ctx.translate(0, -pose.lift);
  const shadow = clamp(1 - pose.lift / 40, 0.25, 1);
  ctx.fillStyle = `rgba(27,23,20,${0.16 * shadow})`;
  ctx.beginPath();
  ctx.ellipse(0, 4, dw * 0.28 * pose.sx, 5 * shadow, 0, 0, Math.PI * 2);
  ctx.fill();
  if (actor.face.legs) {
    ctx.strokeStyle = "#1b1714";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    const swing = Math.sin(pose.step * Math.PI) * 11;
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-8 + swing, 2);
    ctx.moveTo(8, -8);
    ctx.lineTo(8 - swing, 2);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, -16);
  ctx.rotate(pose.rot + pose.cap);
  ctx.scale(actor.facing * pose.sx, pose.sy);
  ctx.translate(0, 16);
  if (actor.face.legs) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-dw, -dh - 8, dw * 2, dh * 0.9);
    ctx.clip();
  }
  const sink = (1 - clamp(pose.hatch, 0, 1)) * dh * 0.22;
  ctx.drawImage(actor.img, bx, by, bw, bh, -dw / 2, -dh + sink, dw, dh);
  const locals = (pt: [number, number]) => [ (pt[0] - 0.5) * dw, -dh + pt[1] * dh + sink ] as const;
  for (const eye of actor.face.eyes) {
    const [x, y] = locals(eye);
    if (!actor.face.peek || pose.hatch > 0.35) drawEye(ctx, x, y, pose.eyes, blink, pose.look, actor.cheek);
  }
  if (!actor.face.peek || pose.hatch > 0.42) {
    const [x, y] = locals(actor.face.beak);
    drawBeak(ctx, x, y, pose.beak, actor.cheek);
  }
  if (pose.blush > 0) {
    ctx.fillStyle = "rgba(255,122,166,0.55)";
    for (const eye of actor.face.eyes) {
      const [x, y] = locals(eye);
      ctx.beginPath();
      ctx.ellipse(x, y + 10, 6, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (pose.scratch > 0.05) {
    const [x, y] = locals(actor.face.eyes[1] ?? actor.face.eyes[0]);
    ctx.strokeStyle = "#1b1714";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 20);
    ctx.quadraticCurveTo(x + 24, y - 8 * pose.scratch, x + 4, y - 12 * pose.scratch);
    ctx.stroke();
  }
  if (actor.face.shell && pose.hatch < 0.96) {
    const cover = 1 - clamp(pose.hatch, 0, 1);
    ctx.save();
    ctx.translate(0, -dh * 0.58 + cover * dh * 0.16 + sink);
    ctx.rotate(-cover * 0.35);
    ctx.fillStyle = "#fff6e4";
    ctx.strokeStyle = "#1b1714";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, dw * 0.34, dh * 0.2, 0, Math.PI, 0, true);
    ctx.lineTo(dw * 0.16, dh * 0.04);
    ctx.lineTo(-dw * 0.16, dh * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-dw * 0.28, 0);
    for (let i = 0; i < 6; i += 1) {
      const x = -dw * 0.28 + (i + 1) * (dw * 0.56 / 6);
      ctx.lineTo(x, i % 2 === 0 ? 7 : -2);
    }
    ctx.stroke();
    ctx.restore();
  }
  if (actor.face.legs) ctx.restore();
  ctx.restore();
  if (pose.sweat > 0.2) {
    ctx.strokeStyle = "#1b1714";
    ctx.fillStyle = "#d7f4ff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(dw * 0.28, -dh * 0.72, 4, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function ChickStage({ ids }: { ids: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let alive = true;
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const actors: Actor[] = [];
    const boot = Promise.all(ids.map(async (id, index) => {
      try {
        const spec = CAST[id] ?? CAST["01"];
        const img = await loadImage(`/chicks/chick-${id}.png`);
        const box = opaqueBox(img);
        const rand = mulberry(Number(id) * 97 + 13);
        const actor: Actor = {
          id,
          role: spec.role,
          face: spec.face,
          img,
          box,
          cheek: sampleCheek(img, box, spec.face),
          x: 0,
          x0: 0,
          facing: index % 2 === 0 ? 1 : -1,
          phase: 0,
          name: SCRIPTS[spec.role][0],
          age: -index * 0.45,
          blinkAt: 0.4 + rand() * 1.6,
          blinkT: -1,
          step: 0,
          hatch: spec.role === "hatch" || spec.role === "shy" || spec.face.peek ? 0.05 : 1,
          clock: index * 0.8,
          placed: false,
        };
        actors[index] = actor;
      } catch {
        return undefined;
      }
    }));
    let last = performance.now();
    const frame = (now: number) => {
      if (!alive) return;
      if (document.hidden) {
        raf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const ground = height - 10;
      actors.forEach((actor, index) => {
        if (!actor || !actor.img) return;
        if (!actor.placed && width > 0) {
          actor.x = width * (ids.length === 1 ? 0.34 : 0.22 + index * 0.46);
          actor.x0 = actor.x;
          actor.placed = true;
        }
        actor.clock += dt;
        actor.age += dt;
        if (actor.clock > actor.blinkAt) {
          actor.blinkT = 0;
          actor.blinkAt = actor.clock + 2.1 + (Number(actor.id) % 5) * 0.35;
        }
        if (actor.blinkT >= 0) actor.blinkT += dt;
        const script = SCRIPTS[actor.role];
        const dur = DUR[actor.name] ?? 0.8;
        if (actor.age > dur) {
          actor.phase = (actor.phase + 1) % script.length;
          actor.name = script[actor.phase];
          actor.age = 0;
          actor.x0 = actor.x;
          if (actor.x < 70) actor.facing = 1;
          else if (actor.x > width - 70) actor.facing = -1;
        }
        const u = clamp(actor.age / (DUR[actor.name] ?? 0.8), 0, 1);
        const pose = poseAt(actor, reduce ? "breathe" : actor.name, u, reduce);
        if (!reduce && actor.name === "walk") {
          const steps = 4;
          const dist = Math.min(150, width * 0.22);
          const p = u * steps;
          const i = Math.floor(p);
          const f = p - i;
          actor.x = actor.x0 + actor.facing * (i + easeInOut(f)) * (dist / steps);
        } else if (!reduce && actor.name === "dash") {
          actor.x = actor.x0 + actor.facing * easeOut(u) * Math.min(220, width * 0.28);
        } else if (!reduce && actor.name === "skitter") {
          actor.x = actor.x0 + actor.facing * easeInOut(u) * 70;
        }
        actor.hatch = pose.hatch;
        actor.step = pose.step;
        drawActor(ctx, actor, pose, ground, height);
        if (!reduce && actor.name === "dash") {
          ctx.save();
          ctx.translate(actor.x, ground);
          ctx.scale(CHICK_SCALE, CHICK_SCALE);
          ctx.translate(-actor.facing * 36, -70);
          ctx.strokeStyle = "rgba(27,23,20,0.4)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i += 1) {
            ctx.beginPath();
            ctx.moveTo(-actor.facing * i * 10, i * 8);
            ctx.lineTo(-actor.facing * (16 + i * 10), i * 8);
            ctx.stroke();
          }
          ctx.restore();
        }
      });
      raf = requestAnimationFrame(frame);
    };
    const onVis = () => {
      if (!alive || document.hidden || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    boot.then(() => {
      if (alive && !document.hidden) raf = requestAnimationFrame(frame);
    });
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf);
    };
  }, [ids]);
  return <canvas ref={ref} className="chick-stage" aria-hidden="true" />;
}

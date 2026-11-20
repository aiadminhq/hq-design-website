// 退租復原工程 anatomy 動畫：辦公室樓層建築模型，三階段（裝修現況 → 拆除中 → 還原完成）。
// 執行：node build.mjs   （需要本機 anatomy skill 的 kit）
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const KIT = join(homedir(), ".claude/skills/anatomy");
const k = await import(join(KIT, "kit/iso-kit.mjs"));
const { kitScript } = await import(join(KIT, "scripts/inline-kit.mjs"));
const HERE = dirname(fileURLToPath(import.meta.url));
const EN = process.argv.includes("--en");
const T = EN ? {
  names: { carpet: "Carpet", cabinet: "Cabinets", rack: "Network rack", partition: "Drywall partition", glass: "Glass partition", meeting: "Meeting table", desks: "Desks", chairs: "Office chairs", reception: "Reception desk", logo: "Logo wall", plants: "Plants", trunking: "Floor trunking" },
  label: "An architectural model of an office floor. Starting from the fitted-out state, furniture, equipment, partitions and carpet are removed in order and hauled away by cart, leaving bare screed, columns and the window wall. The ceiling, lights and air-conditioning marked in orange belong to the landlord and stay untouched throughout.",
  check: ["Furniture and equipment cleared", "Partitions removed", "Floor stripped to screed", "Debris legally disposed", "Landlord fixtures intact"],
  phases: ["Fitted out", "Removing", "Reinstated"],
  read: (ph, gone, n, trips) => ph + " · " + gone + "/" + n + " removed · " + trips + " loads · 0 landlord damage",
  title: "Reinstatement: fit-out to handover", hint: "Use the buttons below",
  keys: ["Landlord property: ceiling, lights, A/C — never touched", "Tenant fit-out: furniture, equipment, partitions, carpet — removed in order"],
  caption: "An office floor as an architectural model. Furniture goes first, then equipment and partitions, and the floor last; each full cart is a legal disposal run. At handover only screed, columns and the window wall remain, and none of the orange landlord fixtures has moved.",
  group: "Switch stage", checkLabel: "Handover checklist", section: "Office reinstatement animation", page: "Office reinstatement: fit-out to handover",
  file: "reinstatement-anatomy-en.html", lang: "en",
} : {
  names: { carpet: "地毯", cabinet: "櫃體", rack: "弱電機櫃", partition: "輕隔間牆", glass: "玻璃隔間", meeting: "會議桌椅", desks: "辦公桌", chairs: "辦公椅", reception: "接待櫃台", logo: "Logo 牆", plants: "植栽", trunking: "地板線槽" },
  label: "辦公室樓層的建築模型。從裝修完成的狀態開始，家具、設備、隔間與地毯依序拆除並由推車清運，最後只剩水泥地坪、柱與窗牆；橘色標示的天花板、燈具與空調屬於房東，全程保留不動。",
  check: ["家具與設備清空", "隔間拆除", "地坪清除見底", "廢料合法清運", "房東設備完好"],
  phases: ["裝修現況", "拆除中", "還原完成"],
  read: (ph, gone, n, trips) => ph + " · 已拆 " + gone + "/" + n + " · 清運 " + trips + " 車 · 房東設備 0 損",
  title: "退租復原：從裝修到還原", hint: "按下方按鈕切換階段",
  keys: ["房東財產：天花板、燈具、空調，全程保留不動", "租客裝修：家具、設備、隔間、地毯，依序拆除清運"],
  caption: "一層辦公室的建築模型。拆除順序是家具、設備、隔間，最後才是地坪；推車每裝滿就合法清運一趟。還原完成時只剩水泥地坪、柱與窗牆，橘色的房東設備一件都沒動。",
  group: "切換階段", checkLabel: "點交檢查", section: "退租復原過程動畫", page: "退租復原工程：從裝修到還原",
  file: "reinstatement-anatomy.html", lang: "zh-Hant-TW",
};

const W = 680, H = 470;
// ── 世界尺寸（1 單位 ≈ 5 cm）────────────────────────────
const FLOOR = { x: -150, y: -105, w: 300, d: 210, r: 2 };
const PLINTH = k.insetPlan(FLOOR, -10);
const WALL_H = 64;          // 樓板到天花
const CEIL_Z = WALL_H - 6;  // 天花板底
const CEIL = { x: -146, y: -101, w: 296, d: 52, r: 0 }; // 沿後牆的天花帶（房東）
const COLS = [[-46, 12], [70, 12]];

const P = k.fitProjection(
  [...k.boxCorners(PLINTH, -16, 0), [FLOOR.x, FLOOR.y, WALL_H + 4], [FLOOR.x + FLOOR.w, FLOOR.y, WALL_H + 4], [FLOOR.x, FLOOR.y + FLOOR.d, WALL_H + 4]],
  W, H, { pad: 26, azimuth: 40 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const box = (x, y, w, d, z, h, style = {}, steps = 2, bevel = 0) => S(k.slabOf({ x, y, w, d, r: Math.min(1, w / 4, d / 4) }, z, h, P, steps, bevel), style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);

// ── 模型底座（展示台）──────────────────────────────────
function plinth() {
  const o = [`<path class="iso-halo" d="${k.haloOf(PLINTH, -16, 16, P)}"/>`];
  for (const [x, y] of k.corners(PLINTH, 14).sort((a, b) => depth(...a) - depth(...b))) {
    o.push(S(k.cylinder(x, y, 6, -16, 3, P, 24), { tone: "lo" }));
  }
  o.push(S(k.slabOf(PLINTH, -13, 7, P, 6, 1.2), { tone: "mid" }));
  o.push(S(k.slabOf(k.insetPlan(PLINTH, 3), -6, 6, P, 6, 0.6), { tone: "mid" }));
  const sc = k.corners(PLINTH, 6);
  o.push(L(sc.map(([x, y]) => k.ring(x, y, 1.8, 0, P, 14)).join(""), { tone: "lo" }));
  o.push(D(sc.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // 前緣尺規
  const strip = { x: FLOOR.x + 20, y: PLINTH.y + PLINTH.d - 8, w: 200, d: 5, r: 0.8 };
  o.push(S(k.slabOf(strip, 0, 0.6, P, 2), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 5, 5, strip.y + 0.6, 0.6, [1.6, 3], P);
  o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // 名牌
  const plate = { x: FLOOR.x + FLOOR.w - 64, y: PLINTH.y + PLINTH.d - 9, w: 52, d: 7, r: 0.8 };
  o.push(S(k.slabOf(plate, 0, 0.8, P, 2), { tone: "mid", crease: "none" }));
  o.push(k.faceTextSvg(k.topMatrix([plate.x + 3, plate.y + 4.6], 0.8, P, "x"), "7F · 1:100", { size: 2.6, tone: "lo" }));
  return o.join("");
}

// ── 建築本體（不會被拆）：樓板、窗牆、後牆、柱 ─────────────────
function slab() {
  const o = [S(k.slabOf(FLOOR, -6, 6, P, 2, 0.6), { tone: "mid" })];
  // 水泥粉光地坪＋舊地磚痕（還原後看得到）
  const g = [];
  for (let x = FLOOR.x + 30; x < FLOOR.x + FLOOR.w; x += 30) g.push(k.lineOnTop([x, FLOOR.y + 6], [x, FLOOR.y + FLOOR.d], 0, P));
  for (let y = FLOOR.y + 36; y < FLOOR.y + FLOOR.d; y += 30) g.push(k.lineOnTop([FLOOR.x + 6, y], [FLOOR.x + FLOOR.w, y], 0, P));
  o.push(L(g.join(""), { tone: "faint" }));
  // 地面出線盒（還原後封板）
  o.push(L([[-80, 40], [10, 40], [100, -10], [10, -50]].map(([x, y]) => k.planOutline({ x, y, w: 6, d: 6, r: 0.5 }, 0, P, 2)).join(""), { tone: "lo" }));
  return o.join("");
}
function windowWall() {
  const x = FLOOR.x, y0 = FLOOR.y, y1 = FLOOR.y + FLOOR.d;
  const o = [box(x, y0, 4, FLOOR.d, 0, 10, { tone: "mid" }), box(x, y0, 4, FLOOR.d, WALL_H - 8, 8, { tone: "mid" })];
  const mull = [];
  for (let y = y0 + 4; y <= y1 - 4; y += 26) mull.push(y);
  for (const y of mull) o.push(box(x, y - 1.2, 4, 2.4, 10, WALL_H - 18, { tone: "mid", crease: "none" }));
  // 玻璃上的橫料
  o.push(L(k.segment([x + 4, y0 + 4, 34], [x + 4, y1, 34], P), { tone: "faint" }));
  o.push(L(mull.slice(0, -1).map((y) => k.segment([x + 2, y + 6, 12], [x + 2, y + 20, 30], P)).join(""), { tone: "faint", free: true }));
  o.push(D(mull.map((y) => at([x + 4, y, 10])), { size: 0.45, tone: "lo" }));
  o.push(L(k.lineOnTop([x + 4, y0 + 4], [x + 4, y1], 10, P), { tone: "lo" }));
  return o.join("");
}
function backWall() {
  const o = [box(FLOOR.x + 4, FLOOR.y, FLOOR.w - 4, 4, 0, WALL_H, { tone: "mid" }, 2, 0.4)];
  // 補土痕（還原後才看得到）放在牆面上的踢腳線
  o.push(L(k.segment([FLOOR.x + 4, FLOOR.y + 4, 3], [FLOOR.x + FLOOR.w, FLOOR.y + 4, 3], P), { tone: "faint" }));
  // 消防箱、緊急照明
  o.push(box(90, FLOOR.y + 4, 14, 2, 20, 18, { tone: "hi" }));
  o.push(D([at([97, FLOOR.y + 6, 29])], { size: 0.8, tone: "lo" }));
  for (const x of [-120, -70, 20, 60]) o.push(box(x, FLOOR.y + 4, 4, 0.6, 8, 3, { tone: "hi", crease: "none" }));
  o.push(D([-118, -68, 22, 62].map((x) => at([x, FLOOR.y + 4.6, 9.5])), { size: 0.35, tone: "lo" }));
  o.push(box(-30, FLOOR.y + 4, 12, 1, 46, 5, { tone: "hi" }));
  o.push(L(k.segment([-28, FLOOR.y + 5, 48.5], [-20, FLOOR.y + 5, 48.5], P), { tone: "lit", free: true }));
  // 補土痕：拆隔間後留下的方塊
  o.push(L([[-110, 20], [-50, 30], [10, 18], [-80, 36]].map(([x, z]) => k.segment([x, FLOOR.y + 4.1, z], [x + 14, FLOOR.y + 4.1, z], P) + k.segment([x + 14, FLOOR.y + 4.1, z], [x + 14, FLOOR.y + 4.1, z + 9], P) + k.segment([x + 14, FLOOR.y + 4.1, z + 9], [x, FLOOR.y + 4.1, z + 9], P) + k.segment([x, FLOOR.y + 4.1, z + 9], [x, FLOOR.y + 4.1, z], P)).join(""), { tone: "faint" }));
  return o.join("");
}
function column([cx, cy]) {
  return box(cx - 6, cy - 6, 12, 12, 0, WALL_H, { tone: "mid" }, 2, 0.5) + L(k.sideSeam({ x: cx - 6, y: cy - 6, w: 12, d: 12, r: 0 }, 4, P, 2), { tone: "faint" }) + box(cx + 6, cy - 2, 0.6, 4, 10, 3, { tone: "hi", crease: "none" }) + S(k.cylinder(cx + 10, cy + 3, 1.8, 0, 9, P, 14), { tone: "hi" }) + D([at([cx + 10, cy + 3, 9])], { size: 0.5, tone: "lit" });
}

// ── 天花帶（房東財產，全程保留，lit 標色）─────────────────────
function ceiling() {
  const o = [];
  o.push(S(k.slabOf(CEIL, CEIL_Z, 3, P, 2, 0.4), { tone: "hi", lit: true }));
  // T-bar 格柵（俯視可見的吊筋與主龍骨）
  const g = [];
  for (let x = CEIL.x + 20; x < CEIL.x + CEIL.w; x += 20) g.push(k.lineOnTop([x, CEIL.y + 1], [x, CEIL.y + CEIL.d], CEIL_Z + 3, P));
  g.push(k.lineOnTop([CEIL.x, CEIL.y + 26], [CEIL.x + CEIL.w, CEIL.y + 26], CEIL_Z + 3, P));
  o.push(L(g.join(""), { tone: "lit" }));
  // 燈具外殼
  for (const x of [-120, -60, 0, 60, 120]) {
    o.push(box(x - 7, CEIL.y + 6, 14, 14, CEIL_Z + 3, 3, { tone: "hi", lit: true }));
    o.push(L(k.planOutline({ x: x - 5, y: CEIL.y + 8, w: 10, d: 10, r: 0.5 }, CEIL_Z + 6, P, 2), { tone: "lit" }));
  }
  // 空調出風口與風管
  for (const x of [-90, 30]) {
    o.push(box(x - 8, CEIL.y + 32, 16, 12, CEIL_Z + 3, 4, { tone: "hi", lit: true }));
    o.push(L(k.planOutline({ x: x - 5, y: CEIL.y + 34, w: 10, d: 8, r: 0.5 }, CEIL_Z + 7, P, 2), { tone: "lit" }));
  }
  o.push(box(-100, CEIL.y + 36, 140, 4, CEIL_Z + 7, 3, { tone: "hi", lit: true }));
  o.push(D([-130, -100, -70, -40, -10, 20, 50, 80, 110, 140].map((x) => at([x, CEIL.y + 46, CEIL_Z + 3])), { size: 0.6, tone: "lit" }));
  o.push(L([-30, 90].map((x) => k.ring(x, CEIL.y + 14, 2.4, CEIL_Z + 3, P, 14)).join(""), { tone: "lit" }));
  o.push(L(k.lineOnTop([-100, CEIL.y + 38], [-100, CEIL.y + 1], CEIL_Z + 10, P), { tone: "lit" }));
  // 吊筋
  const hang = [];
  for (const x of [-130, -40, 50, 130]) hang.push(k.rise([x, CEIL.y + 26], CEIL_Z + 3, WALL_H, P));
  o.push(L(hang.join(""), { tone: "lit" }));
  return o.join("");
}

// ── 裝修項目（會被拆）──────────────────────────────────
// 每項：id、名稱、中心（排序用）、繪製
const chair = (x, y) => box(x - 3, y - 3, 6, 6, 0, 1, { tone: "lo" }) + S(k.cylinder(x, y, 0.8, 1, 6, P, 10), { tone: "mid", crease: "none" }) + box(x - 3.5, y - 3.5, 7, 7, 7, 2, { tone: "hi" }) + box(x - 3.5, y - 3.5, 7, 1.4, 9, 7, { tone: "hi" });
const ITEMS = [
  {
    id: "carpet", name: "地毯", cx: 0, cy: 0, z: 0, under: true,
    draw: () => S(k.slabOf(k.insetPlan(FLOOR, 4), 0, 1, P, 2), { tone: "lo", crease: "none" }) +
      L(Array.from({ length: 9 }, (_, i) => k.lineOnTop([FLOOR.x + 4 + 32 * (i + 1), FLOOR.y + 4], [FLOOR.x + 4 + 32 * (i + 1), FLOOR.y + FLOOR.d - 4], 1, P)).join(""), { tone: "faint" }),
  },
  {
    id: "cabinet", name: "櫃體", cx: 40, cy: -90,
    draw: () => [0, 1, 2, 3].map((i) => box(-20 + i * 22, FLOOR.y + 4, 21, 12, 0, 30, { tone: "hi" }, 2, 0.3) + L(k.segment([-9.5 + i * 22, FLOOR.y + 16, 4], [-9.5 + i * 22, FLOOR.y + 16, 28], P), { tone: "faint" }) + L(k.segment([-14 + i * 22, FLOOR.y + 16, 14], [-14 + i * 22, FLOOR.y + 16, 18], P) + k.segment([-5 + i * 22, FLOOR.y + 16, 14], [-5 + i * 22, FLOOR.y + 16, 18], P), { tone: "mid" })).join(""),
  },
  {
    id: "rack", name: "弱電機櫃", cx: 130, cy: -88,
    draw: () => box(120, FLOOR.y + 5, 18, 16, 0, 40, { tone: "mid" }, 2, 0.4) + L([8, 14, 20, 26, 32].map((z) => k.segment([138, FLOOR.y + 8, z], [138, FLOOR.y + 19, z], P)).join(""), { tone: "lo" }) + D([10, 16, 22].map((z) => at([138, FLOOR.y + 17, z])), { size: 0.6, tone: "lit" }),
  },
  {
    id: "partition", name: "輕隔間牆", cx: 30, cy: -20, tall: true,
    draw: () => box(-6, -24, 92, 6, 0, 52, { tone: "hi" }, 2, 0.4) + L(k.segment([20, -18, 2], [20, -18, 44], P) + k.segment([34, -18, 2], [34, -18, 44], P) + k.segment([20, -18, 44], [34, -18, 44], P), { tone: "lo" }) + D([at([31, -18, 22])], { size: 0.6 }),
  },
  {
    id: "glass", name: "玻璃隔間", cx: -96, cy: 50, tall: true, glass: true,
    draw: () => {
      const o = [];
      const posts = [[-140, 10], [-60, 10], [-60, 92]];
      o.push(`<g class="rs-glass">${S(k.slabOf({ x: -140, y: 9, w: 80, d: 2, r: 0 }, 0, 52, P, 2), { tone: "lo", crease: "none" })}${S(k.slabOf({ x: -61, y: 10, w: 2, d: 82, r: 0 }, 0, 52, P, 2), { tone: "lo", crease: "none" })}</g>`);
      for (const [x, y] of posts) o.push(box(x - 1.2, y - 1.2, 2.4, 2.4, 0, 52, { tone: "hi", crease: "none" }));
      o.push(L(k.segment([-140, 11, 52], [-60, 11, 52], P) + k.segment([-59, 10, 52], [-59, 92, 52], P), { tone: "hi" }));
      o.push(box(-90, 10, 1, 2, 22, 8, { tone: "hi", crease: "none" }));
      o.push(L(k.segment([-100, 11, 0], [-100, 11, 52], P), { tone: "hi" }));
      o.push(L(k.segment([-140, 11, 22], [-60, 11, 22], P) + k.segment([-59, 10, 22], [-59, 92, 22], P), { tone: "lo" }));
      return o.join("");
    },
  },
  {
    id: "meeting", name: "會議桌椅", cx: -100, cy: 52,
    draw: () => {
      const o = [];
      const seats = [[-126, 34], [-110, 34], [-94, 34], [-78, 34]];
      for (const [x, y] of seats) o.push(chair(x, y));
      o.push(box(-130, 40, 58, 22, 13, 2, { tone: "hi" }, 2, 0.4), box(-128, 42, 3, 18, 0, 13, { tone: "mid" }), box(-75, 42, 3, 18, 0, 13, { tone: "mid" }));
      for (const [x, y] of seats) o.push(chair(x, y + 34));
      o.push(box(-142, 30, 2, 40, 22, 22, { tone: "lo" }));
      return o.join("");
    },
  },
  {
    id: "desks", name: "辦公桌", cx: 40, cy: 50,
    draw: () => {
      const o = [];
      for (const [x, y] of [[0, 30], [44, 30], [0, 64], [44, 64]]) {
        o.push(box(x, y, 40, 18, 0, 13, { tone: "mid" }), box(x - 1, y - 1, 42, 20, 13, 1.6, { tone: "hi" }, 2, 0.3));
        o.push(box(x + 14, y + 2, 12, 1.4, 14.6, 9, { tone: "lo" }));
        o.push(box(x + 15, y + 6, 10, 3, 14.6, 0.5, { tone: "mid", crease: "none" }));
        o.push(box(x + 33, y + 3, 4, 8, 0, 9, { tone: "mid" }));
        o.push(D([at([x + 37, y + 7, 7])], { size: 0.4, tone: "lit" }));
      }
      o.push(box(-1, 48, 86, 2, 14.6, 6, { tone: "lo" }));
      return o.join("");
    },
  },
  {
    id: "chairs", name: "辦公椅", cx: 40, cy: 95,
    draw: () => [[10, 24], [54, 24], [10, 92], [54, 92], [30, 92], [74, 92]].map(([x, y]) => chair(x, y)).join(""),
  },
  {
    id: "reception", name: "接待櫃台", cx: 110, cy: 70,
    draw: () => box(96, 52, 14, 44, 0, 16, { tone: "hi" }, 3, 0.4) + box(96, 52, 40, 12, 0, 16, { tone: "hi" }, 3, 0.4) + box(95, 51, 42, 14, 16, 2, { tone: "mid" }, 2, 0.3) + L(k.lineOnTop([97, 57], [135, 57], 18, P), { tone: "faint" }) + box(118, 56, 8, 5, 18, 5, { tone: "lo" }),
  },
  {
    id: "logo", name: "Logo 牆", cx: 118, cy: 30, tall: true,
    draw: () => box(96, 24, 50, 4, 0, 48, { tone: "mid" }, 2, 0.4) + box(110, 28, 22, 1, 26, 10, { tone: "hi", lit: false }) + L(k.segment([112, 29, 31], [130, 29, 31], P), { tone: "lo", free: true }),
  },
  {
    id: "plants", name: "植栽", cx: 140, cy: 96,
    draw: () => [[140, 96], [-80, 96]].map(([x, y]) => S(k.cylinder(x, y, 4, 0, 8, P, 18), { tone: "mid" }) + S(k.cylinder(x, y, 5, 8, 7, P, 18), { tone: "hi" }) + D([[-2, -1], [2, 1], [0, 3], [-3, 2], [3, -2]].map(([a, b]) => at([x + a, y + b, 15])), { size: 0.7, tone: "mid" })).join(""),
  },
  {
    id: "trunking", name: "地板線槽", cx: -20, cy: 20,
    draw: () => box(-40, 18, 130, 4, 1, 1.2, { tone: "mid", crease: "none" }),
  },
];
const N = ITEMS.length;
const TAG_H = { carpet: 2, cabinet: 32, rack: 42, partition: 54, glass: 54, meeting: 18, desks: 24, chairs: 18, reception: 22, logo: 50, plants: 17, trunking: 4 };
// 拆除順序：家具 → 設備 → 隔間 → 地坪
const ORDER = ["plants", "chairs", "meeting", "desks", "cabinet", "rack", "reception", "logo", "glass", "partition", "trunking", "carpet"];

// ── 清運推車 ───────────────────────────────────────────
const CART = [-36, 114];
function cart() {
  const [x, y] = [0, 0];
  const o = [`<path class="iso-halo" d="${k.haloOf({ x: x - 12, y: y - 8, w: 24, d: 16, r: 2 }, 0, 0.1, P)}" style="filter:blur(3px)"/>`];
  for (const [wx, wy] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) o.push(S(k.cylinder(wx, wy, 2, 0, 3, P, 14), { tone: "lo" }));
  o.push(box(-12, -8, 24, 16, 3, 2, { tone: "mid" }));
  o.push(box(-11, -7, 22, 14, 5, 12, { tone: "hi" }, 2, 0.4));
  o.push(`<g data-part="load">${box(-9, -5, 18, 10, 9, 8, { tone: "lo" })}</g>`);
  o.push(box(11, -1.5, 6, 3, 14, 1.2, { tone: "mid" }));
  return o.join("");
}

// ── 組裝（畫家演算法：後 → 前）───────────────────────────
const itemSvg = (it) => `<g data-item="${it.id}" class="rs-item${it.under ? " rs-carpet" : ""}">${it.draw()}</g>`;
const byDepth = (list) => [...list].sort((a, b) => depth(a.cx, a.cy) - depth(b.cx, b.cy));
const underCeil = byDepth(ITEMS.filter((i) => i.cy < CEIL.y + CEIL.d && !i.under));
const front = byDepth(ITEMS.filter((i) => i.cy >= CEIL.y + CEIL.d && !i.under));
const carpet = ITEMS.find((i) => i.under);
const frontParts = [...front.map((it) => ({ key: depth(it.cx, it.cy), svg: itemSvg(it) })), ...COLS.map((c) => ({ key: depth(c[0], c[1]), svg: column(c) }))].sort((a, b) => a.key - b.key);

const svg = k.figureSvg({
  width: W, height: H,
  label: T.label,
  body: [
    plinth(), slab(), windowWall(), backWall(),
    itemSvg(carpet),
    ...underCeil.map(itemSvg),
    `<g data-part="ceiling">${ceiling()}</g>`,
    ...frontParts.map((p) => p.svg),
    `<g data-part="tags" class="rs-tags">${ORDER.map((id, i) => { const it = ITEMS.find((x) => x.id === id); const [x, y] = at([it.cx, it.cy, TAG_H[id]]); return `<g data-tag="${id}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.2"/><text x="${x.toFixed(1)}" y="${(y + 2.3).toFixed(1)}">${i + 1}</text></g>`; }).join("")}</g>`,
    `<g data-part="cart" transform="${k.translateAlong(P, [CART[0], CART[1] - 26, 0])}">${cart()}</g>`,
  ],
});

const CHECK = T.check;
const live = `
const P = ${JSON.stringify(P)};
const ORDER = ${JSON.stringify(ORDER)};
const PH = ${JSON.stringify(T.phases)};
const READ = ${T.read.toString()};
const N = ORDER.length, PER_TRIP = 3, CART = ${JSON.stringify(CART)};
const root = document.querySelector(".rs-anatomy");
const svg = root.querySelector("svg");
const items = Object.fromEntries(ORDER.map((id) => [id, svg.querySelector('[data-item="' + id + '"]')]));
const cart = svg.querySelector('[data-part="cart"]');
const load = svg.querySelector('[data-part="load"]');
const readout = root.querySelector("[data-readout]");
const buttons = [...root.querySelectorAll("[data-phase]")];
const checks = [...root.querySelectorAll("[data-check]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
const EMBED = new URLSearchParams(location.search).has("embed");
const read2 = root.querySelector("[data-readout2]");
const tags = Object.fromEntries(ORDER.map((id) => [id, svg.querySelector('[data-tag="' + id + '"]')]));
if (EMBED) document.documentElement.classList.add("rs-embed");
const ease = (t) => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
// u：0 = 裝修現況，1 = 拆除完成。每項在 [s, s+w] 內抬起淡出。
const SLOT = 0.86 / N, WIN = 0.14;
let u = 0, target = 0, frame = 0, last = 0, visible = false, touring = !still.matches, clock = 0, idle = 0;
function draw() {
  let gone = 0;
  ORDER.forEach((id, i) => {
    const p = ease((u - i * SLOT) / WIN);
    if (p >= 1) gone++;
    const el = items[id];
    el.style.opacity = String(1 - p);
    el.setAttribute("transform", translateAlong(P, [0, 0, 14 * p]));
    el.style.visibility = p >= 1 ? "hidden" : "visible";
  });
  const trips = Math.floor(gone / PER_TRIP);
  // 推車：每 3 項滿載出發一次（往畫面右前方離開再回來）
  const phase = (gone % PER_TRIP) / PER_TRIP;
  const cyc = ease(((u * N) % PER_TRIP) / PER_TRIP);
  const away = u > 0 && u < 1 && gone % PER_TRIP === 0 && gone > 0 ? Math.sin(Math.min(1, ((u - (gone - 1) * SLOT - WIN) / SLOT)) * Math.PI) : 0;
  cart.setAttribute("transform", translateAlong(P, [CART[0] + 60 * Math.max(0, away), CART[1] - 26, 0]));
  cart.style.opacity = String(gone >= N ? 0 : 1);
  load.style.opacity = String(gone >= N ? 0 : Math.min(1, phase + (gone > 0 && gone % PER_TRIP === 0 ? 0 : 0.34)));
  const done = [u > 9 * SLOT, u > 10 * SLOT + WIN * 0.5, gone >= N, gone >= N, gone >= N];
  checks.forEach((c, i) => c.toggleAttribute("data-on", done[i]));
  const finished = gone >= N;
  const label = finished ? PH[2] : u <= 0 ? PH[0] : PH[1];
  const text = READ(label, gone, N, finished ? Math.ceil(N / PER_TRIP) : trips);
  if (readout.textContent !== text) readout.textContent = text;
  if (read2.textContent !== text) read2.textContent = text;
  ORDER.forEach((id, i) => { tags[id].style.opacity = String(1 - ease((u - i * SLOT) / WIN)); });
  buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.phase === (gone >= N ? "2" : u <= 0 ? "0" : "1"))));
}
const TOUR = [[0, 2.4], [1, 7.5], [1, 3.2], [0, 1.4]];
function tourTarget(t) {
  const total = TOUR.reduce((s, x) => s + x[1], 0);
  let r = t % total;
  if (r < 2.4) return 0;
  r -= 2.4; if (r < 7.5) return r / 7.5;
  r -= 7.5; if (r < 3.2) return 1;
  return -1; // 淡回裝修現況
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now;
  if (touring) {
    clock += dt; const t = tourTarget(clock);
    if (t < 0) { u = Math.max(0, u - dt / 1.2); } else { u = t; }
    target = u;
  } else {
    const speed = target < u ? 1 / 1.5 : 1 / 6;
    u = still.matches ? target : u + Math.sign(target - u) * Math.min(Math.abs(target - u), speed * dt);
  }
  draw();
  frame = visible && (touring || u !== target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
function go(phase) {
  touring = false; clearTimeout(idle);
  if (phase === 0) { u = still.matches ? 0 : u; target = 0; if (!still.matches) u = 0; }
  if (phase === 1) { if (u >= 1 || u <= 0) u = 0; target = 1; if (still.matches) u = 0.5, target = 0.5; }
  if (phase === 2) { target = 1; if (still.matches) u = 1; }
  idle = setTimeout(() => { if (!still.matches) { touring = true; clock = 0; run(); } }, 9000);
  draw(); run();
}
buttons.forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.phase))));
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(root);
if (still.matches) { touring = false; u = target = 1; }
let step = 0;
function setStep(n) {
  n = Math.max(1, Math.min(5, n | 0));
  if (n === step) return;
  const from = step; step = n; touring = false; clearTimeout(idle);
  root.classList.toggle("rs-ceil-off", n === 1);
  root.classList.toggle("rs-show-tags", n === 3 || n === 4);
  if (n <= 3) target = 0;
  if (n === 4) { if (from && from < 4) u = 0; target = from === 5 ? 0.6 : 1; }
  if (n === 5) target = 1;
  if (still.matches || !visible) u = target;
  if (n <= 3 && !still.matches && u > 0) u = Math.max(0, u); // 往回時以動畫退回
  draw(); run();
}
if (EMBED) {
  touring = false; u = target = 0; setStep(1);
  addEventListener("message", (e) => { if (e.origin !== location.origin) return; const d = e.data; if (d && d.type === "rs-anatomy-step") setStep(d.step); });
  if (window.parent !== window) window.parent.postMessage({ type: "rs-anatomy-ready" }, location.origin);
}
draw();
`;

const css = `
.rs-anatomy{--anatomy-lit:#FF4E2A;--anatomy-lit-top:#FFF3EF;--anatomy-lit-shade:#F4CEC5;--anatomy-hi:#101924;--anatomy-faint:#E8E8E8;font-family:'Satoshi','Noto Sans TC',system-ui,sans-serif;color:#101924}
.rs-anatomy .rs-glass .iso-top,.rs-anatomy .rs-glass .iso-shade,.rs-anatomy .rs-glass .iso-fill{fill-opacity:.18}
.rs-anatomy .rs-carpet .iso-top{fill:#cfcac2}.rs-anatomy .rs-carpet .iso-shade{fill:#b9b3aa}
.rs-anatomy .rs-item{transition:none;will-change:opacity,transform}
.rs-phases{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 4px}
.rs-phases button{font:500 14px/1 inherit;font-family:inherit;padding:10px 14px;border-radius:999px;border:1px solid #E8E8E8;background:#F5F5F5;color:#101924;cursor:pointer;min-height:40px}
.rs-phases button[aria-pressed="true"]{background:#FF4E2A;border-color:#FF4E2A;color:#101924}
.rs-phases button:focus-visible{outline:2px solid #1F3148;outline-offset:2px}
.rs-anatomy .iso-plate-corner{font-size:11px}
.rs-anatomy [data-readout]{white-space:normal;text-align:right;max-width:70%}
@media (max-width:560px){.rs-anatomy [data-corner="hint"]{display:none}.rs-anatomy [data-readout]{left:0;max-width:none;text-align:left}}
.rs-tags{opacity:0;transition:opacity .5s}
.rs-tags circle{fill:#fff;stroke:#1F3148;stroke-width:.8;stroke-dasharray:2 1.4}
.rs-tags text{font:600 7px 'Satoshi',system-ui,sans-serif;fill:#1F3148;text-anchor:middle}
.rs-show-tags .rs-tags{opacity:1}
[data-part="ceiling"] path{transition:fill .6s,stroke .6s}
.rs-ceil-off [data-part="ceiling"]{--anatomy-lit:#9a9da3;--anatomy-lit-top:#ffffff;--anatomy-lit-shade:#ececec}
.rs-embed-read{display:none}
html.rs-embed,html.rs-embed body{background:transparent!important;color-scheme:normal;margin:0;padding:0!important}
html.rs-embed .iso-page{padding:0;max-width:none;margin:0;width:100%}
html.rs-embed .iso-figure{margin:0;flex:1 1 0;min-height:0;display:flex;flex-direction:column}
html.rs-embed .iso-plate{background:transparent;box-shadow:none;padding:0;--anatomy-paper:#ffffff}
html.rs-embed .iso-plate-corners,html.rs-embed .iso-legend,html.rs-embed .iso-caption,html.rs-embed .rs-phases,html.rs-embed .rs-check{display:none}
html.rs-embed,html.rs-embed body{height:100%;overflow:hidden}
html.rs-embed .iso-page,html.rs-embed .rs-anatomy{height:100%;display:flex;flex-direction:column}
html.rs-embed .iso-plate{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
html.rs-embed .iso-stage{flex:1 1 0;min-height:0;display:flex;position:relative}
html.rs-embed .iso-stage svg{position:absolute;inset:0;width:100%;height:100%}
html.rs-embed .rs-embed-read{flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:clamp(9px,2.2vw,13px)!important;display:block;margin:2px 0 0;text-align:center;font:500 13px/1.4 'Satoshi','Noto Sans TC',system-ui,sans-serif;color:#4D4F53;font-variant-numeric:tabular-nums}
.rs-check{list-style:none;padding:0;margin:10px 0 0;display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;color:#4D4F53}
.rs-check li::before{content:"○";margin-right:6px;color:#b8b8b8}
.rs-check li[data-on]{color:#101924}
.rs-check li[data-on]::before{content:"✓";color:#CC3E22}
`;

const plate = k.plateHtml({
  fig: "Fig 1",
  title: T.title,
  hint: T.hint,
  readout: T.read(T.phases[0], 0, 12, 0),
  keys: [
    { mark: "lit", label: T.keys[0] },
    { mark: "raised", label: T.keys[1] },
  ],
  caption: T.caption,
  body: `<div class="iso-stage">${svg}</div>`,
});
const controls = `<div class="rs-phases" role="group" aria-label="${T.group}">
  <button type="button" data-phase="0" aria-pressed="true">1 ${T.phases[0]}</button>
  <button type="button" data-phase="1" aria-pressed="false">2 ${T.phases[1]}</button>
  <button type="button" data-phase="2" aria-pressed="false">3 ${T.phases[2]}</button>
</div>
<ul class="rs-check" aria-label="${T.checkLabel}">${CHECK.map((c) => `<li data-check>${c}</li>`).join("")}</ul>`;
// readout 在 plate 內；按鈕與清單放在 plate 後，整組用 .rs-anatomy 包起來
const body = `<section class="rs-anatomy" aria-label="${T.section}"><style>${css}</style>${plate}<p class="rs-embed-read" data-readout2 aria-live="polite"></p>${controls}</section>`;

writeFileSync(join(HERE, T.file), k.pageHtml({ title: T.page, theme: "light", body, script: kitScript() + live, width: 720 }));
const outFile = join(HERE, T.file);
const { readFileSync } = await import("node:fs");
writeFileSync(outFile, readFileSync(outFile, "utf8").replace(/<html lang="[^"]*"/, `<html lang="${T.lang}"`));
console.log("wrote", T.file);

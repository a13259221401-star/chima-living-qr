import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { CloudMoon, Info, Moon, Share, Sun, Sunrise, Volume2, VolumeX, X } from "lucide-react";
import "./styles.css";

const MODES = ["Dawn", "Day", "Night"];
const MODE_LABELS = { Dawn: "晨光", Day: "日光", Night: "夜色" };
const PALETTES = ["#ee90ad", "#9566cc", "#e45743", "#e6aa12", "#5cb9a6", "#5b9cc8"];
const PALETTE_NAMES = ["樱粉", "鸢紫", "锦橙", "日金", "荷青", "湖蓝"];
const ECOLOGY_PRESETS = [
  { name: "樱粉", waterShift: -8, koiShift: -12, lotusShift: -5 },
  { name: "鸢紫", waterShift: 22, koiShift: 235, lotusShift: 225 },
  { name: "锦橙", waterShift: 0, koiShift: 0, lotusShift: -8 },
  { name: "日金", waterShift: -15, koiShift: 42, lotusShift: 34 },
  { name: "荷青", waterShift: 6, koiShift: 145, lotusShift: 125 },
  { name: "湖蓝", waterShift: 35, koiShift: 205, lotusShift: 185 },
];
const DEFAULT_URL = "https://icqr.com/living-koi-pond";

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seedRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function mixColor(color, target, amount) {
  const from = hexToRgb(color);
  const to = hexToRgb(target);
  return rgbToHex({
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount,
  });
}

function luminance(color) {
  const rgb = Object.values(hexToRgb(color)).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrastRatio(a, b) {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

function ensureQrContrast(color, background, minimum = 4.5) {
  let safe = color;
  for (let step = 0; step < 8 && contrastRatio(safe, background) < minimum; step += 1) {
    safe = mixColor(safe, "#171717", 0.16);
  }
  return safe;
}

function derivePondTheme(text, mode, paletteIndex) {
  const preset = ECOLOGY_PRESETS[paletteIndex];
  const urlJitter = (hashString(text) % 17) - 8;
  const modeTone = {
    Dawn: { brightness: 1, saturation: 0.98, qrMix: 0 },
    Day: { brightness: 1.07, saturation: 1.06, qrMix: 0.04 },
    Night: { brightness: 0.73, saturation: 0.82, qrMix: 0.12 },
  }[mode];
  const background = "#f7f2e8";
  const selectedColor = PALETTES[paletteIndex];
  const accent = ensureQrContrast(mixColor(selectedColor, "#171717", modeTone.qrMix), background, 3.2);
  const modeEcology = {
    Dawn: {
      water: mixColor(accent, "#8f7a33", 0.28),
      koi: accent,
      lotus: mixColor(accent, "#a94762", 0.22),
      reeds: mixColor(accent, "#66753c", 0.36),
    },
    Day: {
      water: mixColor(accent, "#246e71", 0.3),
      koi: accent,
      lotus: mixColor(accent, "#9e476c", 0.24),
      reeds: mixColor(accent, "#4f713f", 0.38),
    },
    Night: {
      water: mixColor(accent, "#2d445d", 0.34),
      koi: accent,
      lotus: mixColor(accent, "#5e486e", 0.3),
      reeds: mixColor(accent, "#655d36", 0.42),
    },
  }[mode];
  const ecology = Object.fromEntries(Object.entries(modeEcology).map(([key, color]) => [key, ensureQrContrast(color, background, 3.2)]));

  return {
    name: preset.name,
    background,
    primary: accent,
    finder: ecology.reeds,
    selectedColor,
    ecology,
    finderColors: [ecology.koi, ecology.water, ecology.reeds],
    waterShift: preset.waterShift + urlJitter * 0.45,
    koiShift: preset.koiShift + urlJitter * 0.7,
    lotusShift: preset.lotusShift + urlJitter * 0.5,
    brightness: modeTone.brightness,
    baseBrightness: mode === "Night" ? 0.98 : modeTone.brightness,
    saturation: modeTone.saturation,
    reedSaturation: mode === "Night" ? 0.82 : 1 + paletteIndex * 0.015,
  };
}

function ecologyModuleColor(theme, life, text, row, col, size, inFinder) {
  const x = col / Math.max(1, size - 1);
  const y = row / Math.max(1, size - 1);
  const noise = (hashString(`${text}|${row}|${col}`) % 1000) / 1000;
  if (inFinder) return theme.finderColors[Math.min(theme.finderColors.length - 1, Math.floor(noise * theme.finderColors.length))];

  const nearestFish = life.fish.reduce((closest, fish) => Math.min(closest, (x - fish.x / 100) ** 2 + (y - fish.y / 100) ** 2), Infinity);
  const nearestLotus = life.lotus.reduce((closest, lotus) => Math.min(closest, (x - lotus.x / 100) ** 2 + (y - lotus.y / 100) ** 2), Infinity);
  if (nearestLotus < (0.055 + noise * 0.02) ** 2) return theme.ecology.lotus;
  if (nearestFish < (0.06 + noise * 0.018) ** 2) return theme.ecology.koi;
  if ((x < 0.14 || x > 0.86 || y < 0.13 || y > 0.87) && noise > 0.28) return theme.ecology.reeds;
  if (noise < 0.48) return theme.ecology.koi;
  if (noise < 0.68) return theme.ecology.water;
  if (noise < 0.84) return theme.ecology.lotus;
  return theme.ecology.reeds;
}

function normalizeUrl(value) {
  const text = value.trim();
  if (!text) return DEFAULT_URL;
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function encodeState(mode, palette, url) {
  const raw = `${MODES.indexOf(mode)}${palette}${url}`;
  return btoa(unescape(encodeURIComponent(raw))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function readState() {
  try {
    const query = new URLSearchParams(window.location.search).get("q");
    if (!query) return { mode: "Dawn", palette: 2, url: DEFAULT_URL };
    const padded = query.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((query.length + 3) % 4);
    const raw = decodeURIComponent(escape(atob(padded)));
    const modeIndex = Number(raw[0]);
    const palette = Number(raw[1]);
    return {
      mode: MODES[modeIndex] || "Dawn",
      palette: Number.isInteger(palette) && palette >= 0 && palette < PALETTES.length ? palette : 2,
      url: normalizeUrl(raw.slice(2)),
    };
  } catch {
    return { mode: "Dawn", palette: 2, url: DEFAULT_URL };
  }
}

function drawQr(canvas, text, theme) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  const symbol = QRCode.create(text, { errorCorrectionLevel: "H" });
  const modules = symbol.modules;
  const life = buildLife(text);
  const maxQr = Math.min(rect.width * 0.68, rect.height * 0.58, 420);
  const cell = Math.max(4, Math.floor(maxQr / (modules.size + 8)));
  const qrSize = (modules.size + 8) * cell;
  const x = Math.round((rect.width - qrSize) / 2);
  const y = Math.round(Math.max(72, (rect.height - qrSize) / 2 - 58));
  ctx.fillStyle = theme.background;
  ctx.fillRect(x, y, qrSize, qrSize);
  for (let row = 0; row < modules.size; row += 1) {
    for (let col = 0; col < modules.size; col += 1) {
      if (!modules.get(row, col)) continue;
      const inFinder = (row < 8 && col < 8) || (row < 8 && col >= modules.size - 8) || (row >= modules.size - 8 && col < 8);
      ctx.fillStyle = ecologyModuleColor(theme, life, text, row, col, modules.size, inFinder);
      ctx.fillRect(x + (col + 4) * cell, y + (row + 4) * cell, cell, cell);
    }
  }
}

function drawFormation(canvas, text, theme, progress) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  const symbol = QRCode.create(text, { errorCorrectionLevel: "H" });
  const modules = symbol.modules;
  const life = buildLife(text);
  const cellX = Math.min(rect.width / (modules.size * 2.05), rect.height / modules.size);
  const cellY = cellX * 0.48;
  const topY = Math.max(4, (rect.height - modules.size * cellY * 2) / 2);
  const centerX = rect.width / 2;
  const rng = seedRandom(hashString(`${text}-formation`));
  const particles = [];
  for (let row = 0; row < modules.size; row += 1) {
    for (let col = 0; col < modules.size; col += 1) {
      if (!modules.get(row, col)) continue;
      particles.push({ row, col, sx: rng() * rect.width, sy: rng() * rect.height, order: rng() });
    }
  }
  particles.sort((a, b) => a.order - b.order);
  particles.forEach((particle, index) => {
    const threshold = (index / particles.length) * 0.72;
    const local = Math.max(0, Math.min(1, (progress - threshold) / 0.24));
    if (local <= 0) return;
    const eased = 1 - (1 - local) ** 3;
    const tx = centerX + (particle.col - particle.row) * cellX;
    const ty = topY + (particle.col + particle.row) * cellY;
    const x = particle.sx + (tx - particle.sx) * eased;
    const y = particle.sy + (ty - particle.sy) * eased;
    const inFinder = (particle.row < 8 && particle.col < 8) || (particle.row < 8 && particle.col >= modules.size - 8) || (particle.row >= modules.size - 8 && particle.col < 8);
    ctx.globalAlpha = 0.25 + eased * 0.72;
    ctx.fillStyle = ecologyModuleColor(theme, life, text, particle.row, particle.col, modules.size, inFinder);
    ctx.beginPath();
    ctx.moveTo(x, y - cellY * eased);
    ctx.lineTo(x + cellX * eased, y);
    ctx.lineTo(x, y + cellY * eased);
    ctx.lineTo(x - cellX * eased, y);
    ctx.closePath();
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function buildLife(url) {
  const rng = seedRandom(hashString(url));
  const lengthFactor = Math.min(1, url.length / 64);
  const fishCount = 5 + Math.floor(lengthFactor * 3) + Math.floor(rng() * 2);
  const lotusCount = 4 + Math.floor(lengthFactor * 4);
  const fish = Array.from({ length: fishCount }, (_, index) => ({
    id: `${hashString(url)}-${index}`,
    x: 17 + rng() * 57,
    y: 28 + rng() * 37,
    width: 10 + rng() * 5,
    duration: 13 + rng() * 10,
    delay: -rng() * 16,
    path: index % 3,
    flip: rng() > 0.5,
    hue: (rng() - 0.5) * 55,
  }));
  const lotusAnchors = [[18, 47], [80, 48], [33, 25], [67, 25], [34, 69], [65, 69], [22, 61], [77, 61]];
  const lotus = Array.from({ length: lotusCount }, (_, index) => {
    const anchor = lotusAnchors[index % lotusAnchors.length];
    return {
      id: `lotus-${index}`,
      x: anchor[0] + (rng() - 0.5) * 7,
      y: anchor[1] + (rng() - 0.5) * 7,
      size: 9 + rng() * 8,
      delay: -rng() * 5,
      rotate: (rng() - 0.5) * 22,
    };
  });
  return { fish, lotus, vitality: 0.8 + lengthFactor * 0.24 };
}

function modeIcon(mode) {
  if (mode === "Dawn") return <Sunrise aria-hidden="true" />;
  if (mode === "Day") return <Sun aria-hidden="true" />;
  return <Moon aria-hidden="true" />;
}

export function App() {
  const initial = useMemo(readState, []);
  const [mode, setMode] = useState(initial.mode);
  const [palette, setPalette] = useState(initial.palette);
  const [url, setUrl] = useState(initial.url);
  const [draftUrl, setDraftUrl] = useState(initial.url);
  const [showQr, setShowQr] = useState(false);
  const [transitionState, setTransitionState] = useState("pond");
  const [isEditing, setIsEditing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [credits, setCredits] = useState(false);
  const [notice, setNotice] = useState("");
  const qrRef = useRef(null);
  const formationRef = useRef(null);
  const rippleRef = useRef(null);
  const pondRef = useRef(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false, pulse: 0 });
  const transitionTimersRef = useRef([]);
  const life = useMemo(() => buildLife(draftUrl), [draftUrl]);
  const theme = useMemo(() => derivePondTheme(draftUrl, mode, palette), [draftUrl, mode, palette]);

  const persist = useCallback((nextMode, nextPalette, nextUrl) => {
    window.history.replaceState(null, "", `?q=${encodeState(nextMode, nextPalette, nextUrl)}`);
  }, []);

  useEffect(() => {
    if (!showQr || !qrRef.current) return undefined;
    const render = () => drawQr(qrRef.current, url, theme);
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [showQr, url, theme]);

  useEffect(() => {
    const canvas = formationRef.current;
    if (!canvas || !["forming", "dissolving"].includes(transitionState)) return undefined;
    let frame = 0;
    const startedAt = performance.now();
    const render = (time) => {
      const elapsed = Math.min(1, (time - startedAt) / 980);
      const progress = transitionState === "forming" ? elapsed : 1 - elapsed;
      drawFormation(canvas, url, theme, progress);
      if (elapsed < 1) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [transitionState, url, theme]);

  useEffect(() => () => transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer)), []);

  useEffect(() => {
    const canvas = rippleRef.current;
    if (!canvas) return undefined;
    let frame = 0;
    const render = (time) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const pointer = pointerRef.current;
      const cx = pointer.x * rect.width;
      const cy = pointer.y * rect.height;
      const pulse = (time * 0.045 + pointer.pulse) % 90;
      ctx.strokeStyle = mode === "Night" ? "rgba(235, 220, 152, .24)" : "rgba(255, 255, 238, .36)";
      ctx.lineWidth = 1.2;
      for (let ring = 0; ring < 3; ring += 1) {
        const radius = (pulse + ring * 28) % 90;
        ctx.globalAlpha = Math.max(0, 1 - radius / 90) * (pointer.active ? 1 : 0.42);
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * 1.45, radius * 0.52, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  useEffect(() => {
    if (!isEditing) return undefined;
    const timer = window.setTimeout(() => {
      const next = normalizeUrl(draftUrl);
      setUrl(next);
      persist(mode, palette, next);
    }, 380);
    return () => window.clearTimeout(timer);
  }, [draftUrl, isEditing, mode, palette, persist]);

  const commitUrl = () => {
    const next = normalizeUrl(draftUrl);
    setDraftUrl(next);
    setUrl(next);
    persist(mode, palette, next);
  };

  const chooseMode = (nextMode) => {
    setMode(nextMode);
    persist(nextMode, palette, url);
  };

  const choosePalette = (index) => {
    setPalette(index);
    persist(mode, index, url);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "池码｜会生长的生态二维码", url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
      setNotice("分享链接已准备好");
    } catch (error) {
      if (error?.name !== "AbortError") setNotice("请复制浏览器地址栏中的链接");
    }
    window.setTimeout(() => setNotice(""), 1800);
  };

  const movePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointerRef.current = { x, y, active: true, pulse: pointerRef.current.pulse };
    if (pondRef.current) pondRef.current.style.transform = `translate3d(${(x - 0.5) * 9}px, ${(y - 0.5) * 5}px, 0)`;
  };

  const clearTransitionTimers = () => {
    transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimersRef.current = [];
  };

  const revealQr = () => {
    if (transitionState !== "pond") return;
    clearTransitionTimers();
    setTransitionState("forming");
    pointerRef.current.pulse += 32;
    transitionTimersRef.current.push(window.setTimeout(() => setShowQr(true), 760));
    transitionTimersRef.current.push(window.setTimeout(() => setTransitionState("qr"), 1320));
  };

  const returnToPond = () => {
    if (transitionState === "forming" || transitionState === "dissolving") return;
    clearTransitionTimers();
    setTransitionState("dissolving");
    setShowQr(false);
    transitionTimersRef.current.push(window.setTimeout(() => setTransitionState("pond"), 1040));
  };

  const resetToPond = () => {
    clearTransitionTimers();
    setShowQr(false);
    setTransitionState("pond");
  };

  return (
    <main className={`koi-app mode-${mode.toLowerCase()}`}>
      <header className="brand-block"><span className="brand-name">池码</span><small>万物成码</small></header>
      <div className="hero-copy"><h1>把网址养成一方池塘</h1><p>锦鲤、荷花与水色，都会生长进你的二维码</p></div>
      <button className="info-button" type="button" aria-label="查看设计说明" onClick={() => setCredits((value) => !value)}><Info /></button>
      {credits && <aside className="credits-card"><button type="button" aria-label="关闭设计说明" onClick={() => setCredits(false)}><X /></button><strong>会生长的池码</strong><p>网址决定鱼塘的生命分布。水面、锦鲤、荷花与芦苇，会以四种关联色进入二维码。</p></aside>}

      <section className="scene" aria-label={`${MODE_LABELS[mode]}生态鱼塘`}>
        <div className={`pond-world ${showQr ? "is-hidden" : "is-visible"} state-${transitionState}`} onClick={revealQr} onPointerMove={movePointer} onPointerLeave={() => { pointerRef.current.active = false; if (pondRef.current) pondRef.current.style.transform = "translate3d(0,0,0)"; }} role="button" tabIndex={showQr ? -1 : 0} aria-label="生态鱼塘，点击生成二维码" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") revealQr(); }}>
          <div className={`pond-stage state-${transitionState}`} ref={pondRef} style={{ "--accent": PALETTES[palette], "--vitality": life.vitality, "--water-shift": `${theme.waterShift}deg`, "--pond-brightness": theme.brightness, "--pond-base-brightness": theme.baseBrightness, "--pond-saturation": theme.saturation, "--koi-theme-shift": `${theme.koiShift}deg`, "--lotus-theme-shift": `${theme.lotusShift}deg`, "--reed-saturation": theme.reedSaturation }}>
            <img className="pond-base" src="/assets/koi-pond/pond-base.png" alt="" />
            <div className="water-life">
              {life.fish.map((fish) => <img key={fish.id} className={`koi-fish path-${fish.path}`} src="/assets/koi-pond/koi-red-white.png" alt="" style={{ left: `${fish.x}%`, top: `${fish.y}%`, width: `${fish.width}%`, "--duration": `${fish.duration}s`, "--delay": `${fish.delay}s`, "--flip": fish.flip ? -1 : 1, "--hue": `${fish.hue}deg`, "--scatter-x": `${(fish.x - 50) * 5}px`, "--scatter-y": `${(fish.y - 50) * 3}px` }} />)}
              {life.lotus.map((lotus) => <img key={lotus.id} className="lotus" src="/assets/koi-pond/lotus-cluster.png" alt="" style={{ left: `${lotus.x}%`, top: `${lotus.y}%`, width: `${lotus.size}%`, "--delay": `${lotus.delay}s`, "--rotate": `${lotus.rotate}deg` }} />)}
              <canvas className="ripple-canvas" ref={rippleRef} aria-hidden="true" />
              <canvas className="formation-canvas" ref={formationRef} aria-hidden="true" />
            </div>
            <img className="reeds reeds-a" src="/assets/koi-pond/reeds.png" alt="" />
            <img className="reeds reeds-b" src="/assets/koi-pond/reeds.png" alt="" />
            <img className="reeds reeds-c" src="/assets/koi-pond/reeds.png" alt="" />
          </div>
        </div>
        <div className={`qr-ecology-key ${showQr ? "is-visible" : "is-hidden"}`} aria-label="二维码生态颜色说明"><span><i style={{ "--key-color": theme.ecology.water }} />水面</span><span><i style={{ "--key-color": theme.ecology.koi }} />锦鲤</span><span><i style={{ "--key-color": theme.ecology.lotus }} />荷花</span><span><i style={{ "--key-color": theme.ecology.reeds }} />芦苇</span></div>
        <div className={`qr-ornaments ${showQr ? "is-visible" : "is-hidden"}`} style={{ "--lotus-theme-shift": `${theme.lotusShift}deg` }} aria-hidden="true"><img src="/assets/koi-pond/lotus-cluster.png" alt="" /><img src="/assets/koi-pond/lotus-cluster.png" alt="" /></div>
        <canvas ref={qrRef} className={`qr-canvas ${showQr ? "is-visible" : "is-hidden"}`} onClick={returnToPond} role="img" aria-label={`${url} 的生态像素二维码`} />
      </section>

      <section className="control-stack" aria-label="池码生成控制">
        <button className="scene-toggle" type="button" disabled={["forming", "dissolving"].includes(transitionState)} onClick={showQr ? returnToPond : revealQr}>{transitionState === "forming" ? "鱼塘正在排列生态像素…" : transitionState === "dissolving" ? "生态正在回到鱼塘…" : showQr ? "点击返回鱼塘" : "点击鱼塘生成二维码"}</button>
        <div className="url-row"><div className={`input-shell ${isEditing ? "is-live" : ""}`}><input type="url" aria-label="输入需要生成二维码的网址" value={draftUrl} placeholder="输入一个网址，让鱼塘开始生长" onFocus={() => { setIsEditing(true); resetToPond(); }} onChange={(event) => { setDraftUrl(event.target.value); resetToPond(); }} onBlur={() => { setIsEditing(false); commitUrl(); }} onKeyDown={(event) => { if (event.key === "Enter") { commitUrl(); event.currentTarget.blur(); } }} /><span className="live-indicator" aria-hidden="true"><CloudMoon />实时生长</span></div><button className="share-button" type="button" aria-label="分享池码" onClick={share}><Share /></button></div>
        <div className="mode-row" role="radiogroup" aria-label="光线环境">{MODES.map((name) => <button key={name} type="button" role="radio" aria-checked={mode === name} className={mode === name ? "selected" : ""} onClick={() => chooseMode(name)}>{modeIcon(name)}<span>{MODE_LABELS[name]}</span></button>)}<button className="audio-button" type="button" aria-label={muted ? "开启环境音" : "关闭环境音"} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX /> : <Volume2 />}</button></div>
        <div className="palette-block"><span className="palette-caption">生态主色 · {PALETTE_NAMES[palette]}</span><div className="palette-row" aria-label="选择生态主色">{PALETTES.map((color, index) => <button key={color} type="button" aria-label={`${PALETTE_NAMES[index]}生态主色`} title={PALETTE_NAMES[index]} aria-pressed={palette === index} className={palette === index ? "selected" : ""} style={{ "--swatch": color }} onClick={() => choosePalette(index)} />)}</div></div>
      </section>
      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}

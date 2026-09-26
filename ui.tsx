import { useEffect, useRef, type ReactNode } from "react";
import { drawRunner } from "../game/sprites";
import type { CharacterDef } from "../game/types";
import { audio } from "../game/audio";

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-b from-orange-400 to-rose-600 border-rose-900/70 text-white shadow-[0_6px_0_0_rgba(80,7,36,0.75)]",
    gold: "bg-gradient-to-b from-amber-300 to-amber-500 border-amber-800/70 text-amber-950 shadow-[0_6px_0_0_rgba(120,53,15,0.7)]",
    secondary:
      "bg-gradient-to-b from-sky-400 to-indigo-600 border-indigo-900/70 text-white shadow-[0_6px_0_0_rgba(30,27,75,0.75)]",
    danger:
      "bg-gradient-to-b from-rose-400 to-rose-700 border-rose-950/70 text-white shadow-[0_6px_0_0_rgba(69,10,10,0.75)]",
    ghost:
      "bg-white/10 border-white/25 text-white shadow-[0_5px_0_0_rgba(0,0,0,0.45)] backdrop-blur",
  };
  const sizes = {
    sm: "px-3 py-2 text-sm rounded-2xl",
    md: "px-5 py-3 text-base rounded-2xl",
    lg: "px-7 py-4 text-2xl rounded-3xl",
  };
  return (
    <button
      onClick={() => {
        if (disabled) return;
        audio.unlock();
        audio.click();
        onClick?.();
      }}
      disabled={disabled}
      className={`btn-press font-extrabold border-4 tracking-wide transition select-none ${
        variants[variant]
      } ${sizes[size]} ${disabled ? "opacity-45 saturate-50" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className = "",
  tight,
}: {
  children: ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border-4 border-amber-100/15 bg-[#0d1226]/92 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-md ${
        tight ? "p-3" : "p-5"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Hearts({ lives, max }: { lives: number; max: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.max(max, lives) }).map((_, i) => (
        <span
          key={i}
          className={`text-lg leading-none drop-shadow ${
            i < lives ? "anim-pulse-soft" : "opacity-25 grayscale"
          }`}
          style={{ animationDelay: `${i * 0.12}s` }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

export function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-b from-amber-200 to-amber-500 font-black text-amber-900 shadow-inner"
      style={{ width: size, height: size, fontSize: size * 0.62, lineHeight: 1 }}
    >
      ج
    </span>
  );
}

/** Live-animated canvas preview of a character (used in the shop) */
export function CharPreview({
  char,
  size = 104,
  locked,
}: {
  char: CharacterDef;
  size?: number;
  locked?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      // ground shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(size / 2, size * 0.86, size * 0.26, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(size / 2, size * 0.86);
      ctx.translate(0, -Math.abs(Math.sin(t * 11)) * 2);
      drawRunner(ctx, char, { t, state: "run" }, size * 0.68);
      ctx.restore();
      if (locked) {
        ctx.fillStyle = "rgba(6,10,24,0.45)";
        ctx.fillRect(0, 0, size, size);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [char, size, locked]);
  return <canvas ref={ref} style={{ width: size, height: size }} />;
}

export function StatChip({
  label,
  value,
  icon,
  tone = "sky",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "sky" | "amber" | "rose" | "emerald";
}) {
  const tones: Record<string, string> = {
    sky: "from-sky-500/25 to-sky-900/25 border-sky-300/30",
    amber: "from-amber-400/25 to-amber-900/25 border-amber-300/30",
    rose: "from-rose-500/25 to-rose-900/25 border-rose-300/30",
    emerald: "from-emerald-500/25 to-emerald-900/25 border-emerald-300/30",
  };
  return (
    <div
      className={`flex flex-1 flex-col items-center rounded-2xl border-2 bg-gradient-to-b px-2 py-2 ${tones[tone]}`}
    >
      <span className="text-[11px] font-bold text-white/70">{label}</span>
      <span className="flex items-center gap-1 text-lg font-black text-white tabnum">
        {icon}
        {value}
      </span>
    </div>
  );
}

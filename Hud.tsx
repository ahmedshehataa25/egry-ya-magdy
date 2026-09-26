import type { HudState } from "../game/types";
import { CoinIcon, Hearts } from "./ui";

export function Hud({
  hud,
  paused,
  onPause,
  muted,
  onToggleSound,
}: {
  hud: HudState;
  paused: boolean;
  onPause: () => void;
  muted: boolean;
  onToggleSound: () => void;
}) {
  const inRun = hud.status === "playing" || hud.status === "countdown" || hud.status === "dying";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 select-none p-2.5">
      <div className="flex items-start justify-between gap-2">
        {/* النقاط والمسافة */}
        <div className={`flex flex-col gap-1 ${hud.status === "menu" ? "invisible" : ""}`}>
          <div className="rounded-2xl border-2 border-white/20 bg-[#0b1020]/80 px-3 py-1 shadow-lg backdrop-blur">
            <div className="text-[10px] font-bold tracking-wide text-amber-200/85">النقاط</div>
            <div className="tabnum -mt-1 text-[26px] font-black leading-7 text-white drop-shadow">
              {hud.score}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="self-start rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-amber-100/90">
              الأفضل: <span className="tabnum">{Math.max(hud.best, hud.score)}</span>
            </div>
            {inRun && (
              <div className="rounded-full bg-sky-950/70 border border-sky-400/30 px-2 py-0.5 text-[10.5px] font-bold text-sky-200">
                🏃 {hud.distance} م
              </div>
            )}
          </div>
        </div>

        {/* القلب / العملات / الأزرار */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {inRun && (
              <div className="flex items-center gap-1 rounded-2xl border-2 border-amber-300/30 bg-gradient-to-b from-amber-400/25 to-amber-900/30 px-2.5 py-1 backdrop-blur shadow">
                <CoinIcon size={18} />
                <span className="tabnum text-lg font-black text-amber-100">{hud.coins}</span>
              </div>
            )}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onToggleSound}
              className="pointer-events-auto btn-press flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white/25 bg-[#0b1020]/75 text-lg backdrop-blur"
              aria-label="الصوت"
            >
              {muted ? "🔇" : "🔊"}
            </button>
            {inRun && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onPause}
                className="pointer-events-auto btn-press flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white/25 bg-[#0b1020]/75 text-lg backdrop-blur"
                aria-label="توقّف"
              >
                {paused ? "▶" : "❚❚"}
              </button>
            )}
          </div>

          {inRun && (
            <div className="flex items-center gap-1.5">
              {hud.nearMissCount > 0 && (
                <span className="rounded-full bg-sky-500/80 px-2 py-0.5 text-[10px] font-black text-white shadow">
                  ⚡ {hud.nearMissCount} مراوغة
                </span>
              )}
              <div className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5">
                <Hearts lives={hud.lives} max={hud.maxLives} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* شريط المرحلة والمنطقة الحالية */}
      {inRun && (
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-rose-600/90 border border-rose-300/40 px-2.5 py-0.5 text-[11px] font-black text-white shadow">
            📍 {hud.stageName}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full border border-white/15 bg-black/50">
            <div
              className="h-full rounded-full bg-gradient-to-l from-amber-300 via-orange-500 to-rose-600 transition-[width] duration-200"
              style={{ width: `${8 + hud.speedPct * 92}%` }}
            />
          </div>
          {hud.shield > 0 && (
            <span className="rounded-full bg-sky-500/90 border border-sky-200/50 px-2 py-0.5 text-[11px] font-black text-white shadow anim-pulse-soft">
              🎩 {hud.shield.toFixed(1)}ث
            </span>
          )}
        </div>
      )}

      {/* بانر المرحلة / التحدي */}
      {hud.banner && (
        <div
          key={hud.banner.key}
          className="anim-banner mx-auto mt-14 max-w-[85%] rounded-2xl border-2 border-amber-300/50 bg-[#090d1c]/85 px-4 py-2 text-center backdrop-blur shadow-2xl"
        >
          <div className="font-display text-2xl sm:text-3xl text-amber-300 drop-shadow">
            {hud.banner.text}
          </div>
          <div className="text-[12px] font-bold text-white/90">{hud.banner.sub}</div>
        </div>
      )}
    </div>
  );
}

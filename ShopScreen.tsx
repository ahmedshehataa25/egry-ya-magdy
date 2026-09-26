import { useState } from "react";
import { CHARACTERS } from "../game/characters";
import { UPGRADE_PRICES } from "../game/storage";
import type { Profile } from "../game/types";
import { Btn, CharPreview, CoinIcon, Panel } from "./ui";

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-14 text-[10px] font-bold text-white/60">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(100, value * 100)}%` }}
        />
      </div>
    </div>
  );
}

function LevelPips({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-4 rounded-md border border-white/20 transition-all ${
            i < current
              ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

export function ShopScreen({
  profile,
  onBuyChar,
  onSelectChar,
  onBuyUpgrade,
  onBack,
}: {
  profile: Profile;
  onBuyChar: (id: string) => void;
  onSelectChar: (id: string) => void;
  onBuyUpgrade: (
    type: "magnet" | "shield" | "hearts" | "multiplier" | "headstart",
    cost: number
  ) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"characters" | "upgrades">("characters");

  const upg = profile.upgrades;

  const magnetCost =
    upg.magnetLevel < 5 ? UPGRADE_PRICES.magnet[upg.magnetLevel] : null;
  const shieldCost =
    upg.shieldDurationLevel < 5
      ? UPGRADE_PRICES.shield[upg.shieldDurationLevel]
      : null;
  const heartsCost =
    upg.extraHeartsLevel < 3
      ? UPGRADE_PRICES.hearts[upg.extraHeartsLevel]
      : null;
  const multCost =
    upg.coinMultiplierLevel < 5
      ? UPGRADE_PRICES.multiplier[upg.coinMultiplierLevel]
      : null;
  const headstartCost = UPGRADE_PRICES.headstart;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gradient-to-b from-[#0b1020]/95 via-[#0e1529]/96 to-[#080c18]/98 p-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="font-display text-3xl leading-6 text-amber-200">
            سوق الشارع 🛍️
          </h2>
          <p className="text-[10.5px] font-bold text-white/60">
            أبطال جدد وترقيات خارقة تساعدك تجري أبعد
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl border-2 border-amber-300/30 bg-amber-400/20 px-3 py-1.5 shadow">
          <CoinIcon size={20} />
          <span className="tabnum text-lg font-black text-amber-100">
            {profile.bank}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="my-2 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
        <button
          onClick={() => setTab("characters")}
          className={`btn-press rounded-xl py-2 text-xs font-black transition ${
            tab === "characters"
              ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow"
              : "text-white/60 hover:text-white"
          }`}
        >
          🏃‍♂️ الشخصيات والملابس
        </button>
        <button
          onClick={() => setTab("upgrades")}
          className={`btn-press rounded-xl py-2 text-xs font-black transition ${
            tab === "upgrades"
              ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow"
              : "text-white/60 hover:text-white"
          }`}
        >
          ⚡ الترقيات والمساعدات
        </button>
      </div>

      {/* Content */}
      <div className="scroll-thin flex-1 space-y-2.5 overflow-y-auto pb-2 pl-1">
        {tab === "characters" ? (
          <>
            {CHARACTERS.map((c) => {
              const owned = profile.owned.includes(c.id);
              const selected = profile.character === c.id;
              const canAfford = profile.bank >= c.cost;
              return (
                <Panel
                  key={c.id}
                  tight
                  className={`flex items-center gap-3 transition-all ${
                    selected
                      ? "border-emerald-400/70 bg-emerald-950/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                      : "hover:border-white/20"
                  }`}
                >
                  <div className="relative shrink-0 rounded-2xl border-2 border-white/10 bg-gradient-to-b from-sky-500/15 to-transparent p-1">
                    <CharPreview char={c} size={82} locked={!owned} />
                    {!owned && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 text-2xl">
                        🔒
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-black text-white">
                        {c.name}
                      </h3>
                      <span className="truncate rounded-full bg-amber-400/20 px-2 py-0.5 text-[9.5px] font-black text-amber-200">
                        {c.perk}
                      </span>
                    </div>
                    <p className="mb-1 text-[10px] leading-3.5 text-white/60">
                      {c.blurb}
                    </p>
                    <div className="space-y-1">
                      <Bar
                        label="عملات"
                        value={c.stats.coinMult / 1.7}
                        tone="bg-amber-400"
                      />
                      <Bar
                        label="قفزة"
                        value={c.stats.jumpMult / 1.25}
                        tone="bg-sky-400"
                      />
                      <Bar
                        label="مغناطيس"
                        value={c.stats.magnet / 80 + c.stats.extraLife * 0.4}
                        tone="bg-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-1">
                    {selected ? (
                      <span className="rounded-2xl bg-emerald-500/90 px-3 py-2 text-center text-xs font-black text-white shadow">
                        مُختار ✔
                      </span>
                    ) : owned ? (
                      <Btn
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectChar(c.id)}
                      >
                        اختيار
                      </Btn>
                    ) : (
                      <Btn
                        variant="gold"
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => onBuyChar(c.id)}
                        className="whitespace-nowrap"
                      >
                        {c.cost} <CoinIcon size={13} />
                      </Btn>
                    )}
                    {!owned && !canAfford && (
                      <span className="text-center text-[9.5px] font-bold text-rose-300">
                        محتاج {c.cost - profile.bank} عملة
                      </span>
                    )}
                  </div>
                </Panel>
              );
            })}
          </>
        ) : (
          /* Upgrades Tab */
          <div className="space-y-2.5">
            {/* Magnet Upgrade */}
            <Panel tight className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl">
                  🧲
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    مغناطيس العملات
                  </h4>
                  <p className="text-[10px] text-white/60">
                    يجذب العملات من مسافة أبعد تلقائياً
                  </p>
                  <div className="mt-1">
                    <LevelPips current={upg.magnetLevel} max={5} />
                  </div>
                </div>
              </div>
              <div>
                {magnetCost === null ? (
                  <span className="rounded-xl bg-emerald-500/25 px-2.5 py-1 text-xs font-black text-emerald-300">
                    أقصى مستوى ⭐
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-0.5">
                    <Btn
                      variant="gold"
                      size="sm"
                      disabled={profile.bank < magnetCost}
                      onClick={() => onBuyUpgrade("magnet", magnetCost)}
                    >
                      {magnetCost} <CoinIcon size={12} />
                    </Btn>
                    {profile.bank < magnetCost && (
                      <span className="text-[9px] font-bold text-rose-300">
                        محتاج {magnetCost - profile.bank} عملة
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* Shield Duration */}
            <Panel tight className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-2xl">
                  🎩
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    طاقية الإخفاء الممتدة
                  </h4>
                  <p className="text-[10px] text-white/60">
                    تمديد مدة درع الحماية عند التقاطه
                  </p>
                  <div className="mt-1">
                    <LevelPips current={upg.shieldDurationLevel} max={5} />
                  </div>
                </div>
              </div>
              <div>
                {shieldCost === null ? (
                  <span className="rounded-xl bg-emerald-500/25 px-2.5 py-1 text-xs font-black text-emerald-300">
                    أقصى مستوى ⭐
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-0.5">
                    <Btn
                      variant="gold"
                      size="sm"
                      disabled={profile.bank < shieldCost}
                      onClick={() => onBuyUpgrade("shield", shieldCost)}
                    >
                      {shieldCost} <CoinIcon size={12} />
                    </Btn>
                    {profile.bank < shieldCost && (
                      <span className="text-[9px] font-bold text-rose-300">
                        محتاج {shieldCost - profile.bank} عملة
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* Extra Starting Hearts */}
            <Panel tight className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600/20 text-2xl">
                  ❤️
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    قلوب إضافية في البداية
                  </h4>
                  <p className="text-[10px] text-white/60">
                    تبدأ كل جولة بفرص إضافية للنجاة
                  </p>
                  <div className="mt-1">
                    <LevelPips current={upg.extraHeartsLevel} max={3} />
                  </div>
                </div>
              </div>
              <div>
                {heartsCost === null ? (
                  <span className="rounded-xl bg-emerald-500/25 px-2.5 py-1 text-xs font-black text-emerald-300">
                    أقصى مستوى ⭐
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-0.5">
                    <Btn
                      variant="gold"
                      size="sm"
                      disabled={profile.bank < heartsCost}
                      onClick={() => onBuyUpgrade("hearts", heartsCost)}
                    >
                      {heartsCost} <CoinIcon size={12} />
                    </Btn>
                    {profile.bank < heartsCost && (
                      <span className="text-[9px] font-bold text-rose-300">
                        محتاج {heartsCost - profile.bank} عملة
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* Coin Value Multiplier */}
            <Panel tight className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl">
                  💰
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    مضاعف الرزق الدائم
                  </h4>
                  <p className="text-[10px] text-white/60">
                    زيادة قيمة كل عملة تجمعها في الشارع
                  </p>
                  <div className="mt-1">
                    <LevelPips current={upg.coinMultiplierLevel} max={5} />
                  </div>
                </div>
              </div>
              <div>
                {multCost === null ? (
                  <span className="rounded-xl bg-emerald-500/25 px-2.5 py-1 text-xs font-black text-emerald-300">
                    أقصى مستوى ⭐
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-0.5">
                    <Btn
                      variant="gold"
                      size="sm"
                      disabled={profile.bank < multCost}
                      onClick={() => onBuyUpgrade("multiplier", multCost)}
                    >
                      {multCost} <CoinIcon size={12} />
                    </Btn>
                    {profile.bank < multCost && (
                      <span className="text-[9px] font-bold text-rose-300">
                        محتاج {multCost - profile.bank} عملة
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* Headstart Rocket */}
            <Panel tight className="flex items-center justify-between gap-3 border-sky-400/30 bg-sky-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/25 text-2xl">
                  🚀
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">
                      بداية صاروخية (500م)
                    </h4>
                    <span className="rounded-full bg-sky-400/30 px-2 py-0.5 text-[9.5px] font-bold text-sky-200">
                      معك: {upg.headstartsCount}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/60">
                    انطلاق فوري بسرعة فائقة ودرع ناري في أول الجولة
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <Btn
                  variant="gold"
                  size="sm"
                  disabled={profile.bank < headstartCost}
                  onClick={() => onBuyUpgrade("headstart", headstartCost)}
                >
                  {headstartCost} <CoinIcon size={12} />
                </Btn>
                {profile.bank < headstartCost && (
                  <span className="text-[9px] font-bold text-rose-300">
                    محتاج {headstartCost - profile.bank} عملة
                  </span>
                )}
              </div>
            </Panel>
          </div>
        )}
      </div>

      <Btn size="lg" className="w-full" onClick={onBack}>
        رجوع للشارع 🏃‍♂️
      </Btn>
    </div>
  );
}

import type { ReactNode } from "react";
import { getStage, STAGES } from "../game/stages";
import { checkDailyRewardStatus, dateLabel, DAILY_REWARDS_TABLE } from "../game/storage";
import type { Profile, RunResult, ScoreEntry } from "../game/types";
import { Btn, CoinIcon, Panel, StatChip } from "./ui";

/* ----------------------------- Main Menu ----------------------------- */
export function StartScreen({
  profile,
  onPlay,
  onOpenShop,
  onOpenStages,
  onOpenMissions,
  onOpenDailyReward,
  onOpenAchievements,
  onOpenScores,
  onOpenTutorial,
  onOpenAndroidHub,
  muted,
  onToggleSound,
}: {
  profile: Profile;
  onPlay: (useHeadstart?: boolean) => void;
  onOpenShop: () => void;
  onOpenStages: () => void;
  onOpenMissions: () => void;
  onOpenDailyReward: () => void;
  onOpenAchievements: () => void;
  onOpenScores: () => void;
  onOpenTutorial: () => void;
  onOpenAndroidHub: () => void;
  muted: boolean;
  onToggleSound: () => void;
}) {
  const currentStage = getStage(profile.selectedStage || 1);
  const rewardStatus = checkDailyRewardStatus(profile);
  const claimableMissionsCount = profile.dailyMissions.filter(
    (m) => m.current >= m.target && !m.claimed
  ).length;
  const claimableAchsCount = profile.achievements.filter(
    (a) => a.current >= a.target && !a.claimed
  ).length;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between bg-gradient-to-b from-[#0b1020]/75 via-transparent to-[#0b1020]/80 p-3 pt-3">
      {/* Top Banner / Title */}
      <div className="text-center">
        <div className="anim-wiggle mx-auto w-fit rounded-[24px] border-4 border-amber-300/60 bg-gradient-to-b from-rose-600/90 to-[#0b1020]/90 px-5 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
          <h1 className="font-display text-[42px] sm:text-[48px] leading-[1.05] text-amber-200 drop-shadow-[0_3px_0_rgba(0,0,0,0.7)]">
            اجري يا مجدي! 🏃‍♂️
          </h1>
        </div>
        <p className="mx-auto mt-2 max-w-[92%] rounded-2xl bg-black/55 px-3 py-1 text-[12px] font-bold text-amber-50/95 shadow backdrop-blur">
          أسرع رانر مصري أصيل! اقفز فوق التاكسيات والميكروباصات والمطبات 🚕
        </p>
      </div>

      {/* Floating Badges */}
      <div className="flex items-center justify-between px-1">
        {/* Active Stage Badge */}
        <button
          onClick={onOpenStages}
          className="btn-press flex items-center gap-1.5 rounded-2xl border-2 border-sky-300/40 bg-[#0c142c]/80 px-3 py-1.5 backdrop-blur shadow"
        >
          <span className="text-xl">{currentStage.icon}</span>
          <div className="text-right leading-3.5">
            <div className="text-[9.5px] font-bold text-sky-200/80">المرحلة الحالية</div>
            <div className="text-xs font-black text-white">{currentStage.name}</div>
          </div>
          <span className="mr-1 text-[11px] text-sky-300">🗺️</span>
        </button>

        {/* Tutorial Button */}
        <button
          onClick={onOpenTutorial}
          className="btn-press flex items-center gap-1 rounded-2xl border-2 border-amber-300/40 bg-amber-400/20 px-3 py-1.5 text-xs font-black text-amber-200 backdrop-blur shadow"
        >
          <span>❓ كيف تلعب؟</span>
        </button>
      </div>

      {/* Bottom Hub Panel */}
      <div className="space-y-2 pb-1">
        <Panel tight className="w-full">
          {/* Wallet and Highscore Header */}
          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-300/30 bg-amber-400/20 px-3 py-1 shadow-inner">
              <CoinIcon size={20} />
              <div className="leading-4">
                <div className="text-[9.5px] font-bold text-amber-200/80">رصيد العملات</div>
                <div className="tabnum text-lg font-black text-amber-100">{profile.bank}</div>
              </div>
            </div>
            <div className="text-left leading-4">
              <div className="text-[10px] font-bold text-white/60">أفضل رقم قياسي</div>
              <div className="tabnum text-xl font-black text-white">{profile.best}</div>
            </div>
          </div>

          {/* Main Play Button */}
          <Btn size="lg" className="w-full text-2xl" onClick={() => onPlay(false)}>
            العب دلوقتي 🏃‍♂️
          </Btn>

          {/* Headstart Quick Option if owned */}
          {profile.upgrades.headstartsCount > 0 && (
            <button
              onClick={() => onPlay(true)}
              className="btn-press mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-sky-400/50 bg-gradient-to-r from-sky-500/30 to-indigo-900/40 py-2 text-xs font-black text-sky-200 shadow"
            >
              <span>🚀 انطلاق صاروخي (500م)</span>
              <span className="rounded-full bg-sky-400/30 px-2 py-0.5 text-[10px]">
                متبقي: {profile.upgrades.headstartsCount}
              </span>
            </button>
          )}

          {/* Grid Hub Buttons */}
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {/* Shop */}
            <Btn variant="gold" size="sm" onClick={onOpenShop} className="px-1 text-center">
              🛍️ المتجر
            </Btn>

            {/* Daily Reward */}
            <button
              onClick={onOpenDailyReward}
              className={`btn-press relative flex flex-col items-center justify-center rounded-2xl border-2 py-1.5 text-center text-xs font-black ${
                rewardStatus.canClaim
                  ? "border-emerald-300/80 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-[0_4px_0_0_rgba(6,78,59,0.8)]"
                  : "border-white/20 bg-white/10 text-white/80"
              }`}
            >
              <span>🎁 مكافأة</span>
              {rewardStatus.canClaim && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                  !
                </span>
              )}
            </button>

            {/* Missions */}
            <button
              onClick={onOpenMissions}
              className={`btn-press relative flex flex-col items-center justify-center rounded-2xl border-2 py-1.5 text-center text-xs font-black ${
                claimableMissionsCount > 0
                  ? "border-amber-300/80 bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-[0_4px_0_0_rgba(180,83,9,0.8)]"
                  : "border-white/20 bg-white/10 text-white/80"
              }`}
            >
              <span>📋 مهمات</span>
              {claimableMissionsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                  {claimableMissionsCount}
                </span>
              )}
            </button>

            {/* Achievements */}
            <button
              onClick={onOpenAchievements}
              className={`btn-press relative flex flex-col items-center justify-center rounded-2xl border-2 py-1.5 text-center text-xs font-black ${
                claimableAchsCount > 0
                  ? "border-amber-300/80 bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-[0_4px_0_0_rgba(180,83,9,0.8)]"
                  : "border-white/20 bg-white/10 text-white/80"
              }`}
            >
              <span>🏅 إنجازات</span>
              {claimableAchsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                  {claimableAchsCount}
                </span>
              )}
            </button>
          </div>

          {/* Secondary Row: Leaderboard + Sound */}
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <Btn variant="secondary" size="sm" onClick={onOpenScores}>
              🏆 صدارة الشارع
            </Btn>
            <Btn variant="ghost" size="sm" onClick={onToggleSound}>
              {muted ? "🔇 الصوت مقفول" : "🔊 الصوت شغّال"}
            </Btn>
          </div>

          {/* Android Release & Publish Hub */}
          <button
            onClick={onOpenAndroidHub}
            className="btn-press mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 via-teal-800/30 to-emerald-500/20 py-1.5 text-[11px] font-black text-emerald-300 shadow"
          >
            <span>🤖 مركز نشر وبناء أندرويد (APK / AAB)</span>
          </button>
        </Panel>

        <div className="text-center text-[10px] font-bold tracking-wide text-amber-200/60">
          🚕 تاكسي · 🚐 ميكروباص · 🏍️ موتوسيكل · 🐈 قطة · 🥙 عربية فول
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Pause Screen ------------------------------- */
export function PauseScreen({
  hud,
  activeMission,
  onResume,
  onRestart,
  onMenu,
  muted,
  onToggleSound,
}: {
  hud: { score: number; coinCount: number; level: number; distance: number; stageName: string };
  activeMission?: import("../game/types").DailyMission;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  muted: boolean;
  onToggleSound: () => void;
}) {
  return (
    <Backdrop>
      <Panel className="anim-pop w-full max-w-[400px]">
        <h2 className="font-display text-center text-4xl text-amber-200">استراحة شاي ☕</h2>
        <p className="mt-1 text-center text-xs font-bold text-white/70">
          رايق يا مجدي، خد نفسك… بس الشارع مستنيك.
        </p>

        <div className="my-3 grid grid-cols-2 gap-2">
          <StatChip label="النقاط" value={hud.score} tone="amber" />
          <StatChip label="العملات" value={hud.coinCount} tone="sky" icon={<CoinIcon size={14} />} />
          <StatChip label="المسافة" value={`${hud.distance} م`} tone="emerald" />
          <StatChip label="المنطقة" value={hud.stageName} tone="rose" />
        </div>

        {activeMission && (
          <div className="mb-3 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-2.5 text-right">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-200">
              <span>
                {activeMission.icon} مهمة حالية: {activeMission.title}
              </span>
              <span className="flex items-center gap-1 text-[10.5px] text-amber-300">
                +{activeMission.reward} <CoinIcon size={11} />
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-amber-300 to-amber-500"
                  style={{
                    width: `${Math.min(100, (activeMission.current / activeMission.target) * 100)}%`,
                  }}
                />
              </div>
              <span className="tabnum text-[9.5px] font-bold text-white/70">
                {activeMission.current} / {activeMission.target}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Btn size="lg" className="w-full text-xl" onClick={onResume}>
            كمّل الجري ▶
          </Btn>
          <div className="grid grid-cols-3 gap-2">
            <Btn variant="secondary" size="sm" onClick={onRestart}>
              من الأول 🔁
            </Btn>
            <Btn variant="ghost" size="sm" onClick={onToggleSound}>
              {muted ? "🔇 صوت" : "🔊 صوت"}
            </Btn>
            <Btn variant="danger" size="sm" onClick={onMenu}>
              القائمة 🏠
            </Btn>
          </div>
        </div>
      </Panel>
    </Backdrop>
  );
}

/* ------------------------------ Game Over Screen ---------------------------- */
export function GameOverScreen({
  result,
  profile,
  adUsed,
  onRestart,
  onWatchAdLife,
  onWatchAdDoubleCoins,
  onShop,
  onScores,
  onMenu,
}: {
  result: RunResult;
  profile: Profile;
  adUsed: boolean;
  onRestart: () => void;
  onWatchAdLife: () => void;
  onWatchAdDoubleCoins: () => void;
  onShop: () => void;
  onScores: () => void;
  onMenu: () => void;
}) {
  const isBest = result.score >= profile.best;

  const funny =
    result.score < 500
      ? "أول مرة في الشارع؟ معلش الجايات أكتر! 😅"
      : result.score < 2000
        ? "عاش يا مجدي! بس التاكسي كان مستعجل 🚕"
        : result.score < 4500
          ? "مراوغ حريف! الشارع بدأ يحترمك 🔥"
          : "ده إعصار مصري حقيقي! رقم للتاريخ! 🌪️👑";

  return (
    <Backdrop>
      <div className="anim-pop w-full max-w-[420px] space-y-2.5">
        <Panel tight className="text-center">
          <h2 className="font-display text-[38px] leading-9 text-rose-300">
            عربية جت عليك! 💥
          </h2>
          <p className="mt-1 text-[11.5px] font-bold text-white/75">
            {result.reason} {funny}
          </p>

          {/* Main Score Display */}
          <div className="my-2.5 rounded-3xl border-2 border-amber-300/30 bg-gradient-to-b from-amber-400/20 to-transparent py-2.5 shadow-inner">
            <div className="text-[10px] font-bold text-amber-200/80">نتيجتك في الجولة</div>
            <div className="tabnum font-display text-5xl leading-[1.05] text-amber-200">
              {result.score}
            </div>
            {isBest && (
              <div className="mx-auto mt-1 w-fit rounded-full bg-emerald-500/90 px-3 py-0.5 text-[11px] font-black text-white shadow">
                ⭐ رقم قياسي جديد!
              </div>
            )}
            <div className="mt-1 text-[11px] font-bold text-white/70">
              أفضل رقم لديك: <span className="tabnum text-amber-200">{profile.best}</span>
            </div>
          </div>

          {/* Run Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            <StatChip
              label="العملات المكتسبة"
              value={`+${result.reward}`}
              tone="amber"
              icon={<CoinIcon size={13} />}
            />
            <StatChip label="المسافة" value={`${result.distance}م`} tone="sky" />
            <StatChip label="مراوغة شعرة" value={result.nearMisses} tone="emerald" />
          </div>
        </Panel>

        {/* Action Panel */}
        <Panel tight className="space-y-2">
          {/* Quick Restart */}
          <Btn size="lg" className="w-full text-xl" onClick={onRestart}>
            من تاني بسرعة 🔁
          </Btn>

          {/* Voluntary Rewarded Ad: Extra Life (Second Chance) */}
          <Btn
            variant="gold"
            className="w-full text-sm"
            disabled={adUsed}
            onClick={onWatchAdLife}
          >
            {adUsed ? "استعملت فرصة الإعلان في الجولة ✔" : "شاهد إعلان ← فرصة ثانية وحياة إضافية ❤️‍🔥"}
          </Btn>

          {/* Voluntary Rewarded Ad: Double Coins */}
          {result.reward > 0 && (
            <button
              onClick={onWatchAdDoubleCoins}
              className="btn-press flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-500/30 to-emerald-800/40 py-2 text-xs font-black text-emerald-200 shadow"
            >
              <span>🎬 شاهد إعلان لمضاعفة العملات</span>
              <span className="rounded-full bg-emerald-400/30 px-2 py-0.5 text-amber-300">
                +{result.reward} <CoinIcon size={11} />
              </span>
            </button>
          )}

          {/* Nav buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Btn variant="secondary" size="sm" onClick={onShop}>
              🛍️ المتجر
            </Btn>
            <Btn variant="ghost" size="sm" onClick={onScores}>
              🏆 الصدارة
            </Btn>
            <Btn variant="danger" size="sm" onClick={onMenu}>
              القائمة 🏠
            </Btn>
          </div>
        </Panel>
      </div>
    </Backdrop>
  );
}

/* ------------------------------- Stage Selector ------------------------------- */
export function StageSelectModal({
  profile,
  onSelectStage,
  onBack,
}: {
  profile: Profile;
  onSelectStage: (id: number) => void;
  onBack: () => void;
}) {
  return (
    <Backdrop>
      <Panel className="anim-pop flex max-h-[85vh] w-full max-w-[420px] flex-col p-3">
        <div className="text-center pb-2">
          <h2 className="font-display text-3xl text-amber-200">مناطق ومراحل مصر 🗺️</h2>
          <p className="text-[11px] font-bold text-white/60">
            تجاوز المسافات في الشارع لفتح مناطق جديدة
          </p>
        </div>

        <div className="scroll-thin flex-1 space-y-2 overflow-y-auto pl-1">
          {STAGES.map((s) => {
            const unlocked = profile.unlockedStages.includes(s.id);
            const isSelected = profile.selectedStage === s.id;
            const stars = profile.stageStars[s.id] || 0;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border-2 p-3 transition ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(52,211,153,0.25)]"
                    : unlocked
                      ? "border-white/15 bg-white/5 hover:border-white/30"
                      : "border-white/5 bg-black/40 opacity-55"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{s.name}</h3>
                        {unlocked && (
                          <div className="flex text-xs text-amber-300">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <span key={i}>{i < stars ? "⭐" : "☆"}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-white/65">{s.subtitle}</p>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="rounded-xl bg-emerald-500/90 px-3 py-1 text-xs font-black text-white shadow">
                        النشطة ✔
                      </span>
                    ) : unlocked ? (
                      <Btn variant="secondary" size="sm" onClick={() => onSelectStage(s.id)}>
                        بدء هنا
                      </Btn>
                    ) : (
                      <span className="rounded-xl bg-black/50 px-2 py-1 text-[10px] font-bold text-white/60">
                        🔒 هدف: {s.targetScore} نقطة
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-[9.5px] text-white/50 border-t border-white/10 pt-1.5 flex items-center justify-between">
                  <span>🚗 حركة المرور: {s.trafficFocus}</span>
                  <span>المسافة: {s.targetDistance}م</span>
                </div>
              </div>
            );
          })}
        </div>

        <Btn className="mt-3 w-full" onClick={onBack}>
          تم 🔙
        </Btn>
      </Panel>
    </Backdrop>
  );
}

/* ------------------------------- Daily Rewards Modal ------------------------------- */
export function DailyRewardModal({
  profile,
  onClaim,
  onBack,
}: {
  profile: Profile;
  onClaim: () => void;
  onBack: () => void;
}) {
  const status = checkDailyRewardStatus(profile);

  return (
    <Backdrop>
      <Panel className="anim-pop w-full max-w-[420px] text-center p-3">
        <h2 className="font-display text-3xl text-amber-200">مكافأة 7 أيام اليومية 🎁</h2>
        <p className="text-[11px] font-bold text-white/65 mb-3">
          ادخل كل يوم واستلم رزقك من العملات والمساعدات
        </p>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {DAILY_REWARDS_TABLE.map((row) => {
            const isToday = status.streakDay === row.day;
            const isPast = profile.dailyReward.streak > row.day && !status.canClaim;
            const isDay7 = row.day === 7;

            return (
              <div
                key={row.day}
                className={`rounded-2xl border-2 p-2 text-center transition ${
                  isDay7 ? "col-span-2" : ""
                } ${
                  isToday
                    ? "border-amber-400 bg-amber-400/25 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105"
                    : isPast
                      ? "border-emerald-400/40 bg-emerald-950/20 opacity-60"
                      : "border-white/10 bg-white/5"
                }`}
              >
                <div className="text-[9.5px] font-bold text-white/60">يوم {row.day}</div>
                <div className="my-1 text-2xl">{row.icon}</div>
                <div className="flex items-center justify-center gap-1 font-black text-amber-200 text-xs">
                  <span>{row.coins}</span>
                  <CoinIcon size={11} />
                </div>
                {isPast && <span className="text-[9px] text-emerald-300 font-bold">تم ✔</span>}
                {isToday && status.canClaim && (
                  <span className="text-[9px] text-amber-300 font-bold anim-pulse-soft">
                    متاح الآن!
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {status.canClaim ? (
          <Btn variant="gold" size="lg" className="w-full text-lg mb-2" onClick={onClaim}>
            استلم مكافأة اليوم ({status.rewardCoins} <CoinIcon size={15} />) 🎁
          </Btn>
        ) : (
          <div className="rounded-2xl bg-white/10 p-2.5 text-xs font-bold text-white/70 mb-2">
            استلمت مكافأة اليوم بالفعل! عد غداً للمكافأة القادمة ⏳
          </div>
        )}

        <Btn variant="ghost" size="sm" className="w-full" onClick={onBack}>
          إغلاق 🔙
        </Btn>
      </Panel>
    </Backdrop>
  );
}

/* ------------------------------- Daily Missions Modal ------------------------------- */
export function DailyMissionsModal({
  profile,
  onClaim,
  onBack,
}: {
  profile: Profile;
  onClaim: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <Backdrop>
      <Panel className="anim-pop flex max-h-[85vh] w-full max-w-[420px] flex-col p-3">
        <div className="text-center pb-2">
          <h2 className="font-display text-3xl text-amber-200">المهمات اليومية 📋</h2>
          <p className="text-[11px] font-bold text-white/60">
            تتجدد كل يوم — نفذ المهمات واكسب عملات إضافية
          </p>
        </div>

        <div className="scroll-thin flex-1 space-y-2.5 overflow-y-auto pl-1">
          {profile.dailyMissions.map((m) => {
            const isReady = m.current >= m.target && !m.claimed;
            const pct = Math.min(100, (m.current / m.target) * 100);

            return (
              <div
                key={m.id}
                className={`rounded-2xl border-2 p-3 ${
                  isReady
                    ? "border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                    : m.claimed
                      ? "border-white/10 bg-white/5 opacity-55"
                      : "border-white/15 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <h4 className="text-sm font-black text-white">{m.title}</h4>
                      <p className="text-[10px] text-white/65">{m.desc}</p>
                    </div>
                  </div>

                  <div>
                    {m.claimed ? (
                      <span className="rounded-xl bg-emerald-500/25 px-2.5 py-1 text-xs font-black text-emerald-300">
                        مستلم ✔
                      </span>
                    ) : isReady ? (
                      <Btn variant="gold" size="sm" onClick={() => onClaim(m.id)}>
                        استلم ({m.reward} <CoinIcon size={11} />)
                      </Btn>
                    ) : (
                      <div className="flex items-center gap-1 rounded-xl bg-black/40 px-2 py-1 text-xs font-black text-amber-200">
                        <span>{m.reward}</span>
                        <CoinIcon size={12} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-amber-300 to-amber-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="tabnum text-[10px] font-bold text-white/60">
                    {m.current} / {m.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Btn className="mt-3 w-full" onClick={onBack}>
          رجوع 🔙
        </Btn>
      </Panel>
    </Backdrop>
  );
}

/* ------------------------------- Achievements Modal ------------------------------- */
export function AchievementsModal({
  profile,
  onClaim,
  onBack,
}: {
  profile: Profile;
  onClaim: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <Backdrop>
      <Panel className="anim-pop flex max-h-[85vh] w-full max-w-[420px] flex-col p-3">
        <div className="text-center pb-2">
          <h2 className="font-display text-3xl text-amber-200">إنجازات الشارع 🏅</h2>
          <p className="text-[11px] font-bold text-white/60">
            حقق الأرقام القياسية واكسب مكافآت دائمة
          </p>
        </div>

        <div className="scroll-thin flex-1 space-y-2 overflow-y-auto pl-1">
          {profile.achievements.map((a) => {
            const isReady = a.current >= a.target && !a.claimed;
            const pct = Math.min(100, (a.current / a.target) * 100);

            return (
              <div
                key={a.id}
                className={`rounded-2xl border-2 p-2.5 ${
                  isReady
                    ? "border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                    : a.claimed
                      ? "border-white/10 bg-white/5 opacity-55"
                      : "border-white/15 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <h4 className="text-sm font-black text-white">{a.title}</h4>
                      <p className="text-[10px] text-white/65">{a.desc}</p>
                    </div>
                  </div>

                  <div>
                    {a.claimed ? (
                      <span className="rounded-xl bg-emerald-500/25 px-2.5 py-1 text-xs font-black text-emerald-300">
                        مكتمل ✔
                      </span>
                    ) : isReady ? (
                      <Btn variant="gold" size="sm" onClick={() => onClaim(a.id)}>
                        استلم ({a.reward} <CoinIcon size={11} />)
                      </Btn>
                    ) : (
                      <div className="flex items-center gap-1 rounded-xl bg-black/40 px-2 py-1 text-xs font-black text-amber-200">
                        <span>{a.reward}</span>
                        <CoinIcon size={12} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-emerald-300 to-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="tabnum text-[9.5px] font-bold text-white/60">
                    {a.current} / {a.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Btn className="mt-3 w-full" onClick={onBack}>
          رجوع 🔙
        </Btn>
      </Panel>
    </Backdrop>
  );
}

/* ------------------------------- How to Play / Tutorial Modal ------------------------------- */
export function TutorialModal({ onBack }: { onBack: () => void }) {
  return (
    <Backdrop>
      <Panel className="anim-pop flex max-h-[85vh] w-full max-w-[420px] flex-col p-3">
        <div className="text-center pb-2">
          <h2 className="font-display text-3xl text-amber-200">كيف تلعب؟ 🎮</h2>
          <p className="text-[11px] font-bold text-white/60">
            أسرار الجري والنجاة في شوارع المحروسة
          </p>
        </div>

        <div className="space-y-2.5 overflow-y-auto text-right text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-start gap-3">
            <span className="text-2xl">👆</span>
            <div>
              <h4 className="font-black text-amber-200 text-sm">القفز البسيط</h4>
              <p className="text-white/75 mt-0.5">
                اضغط على الشاشة (أو زر المسافة / السهم لأعلى) لقفزة سريعة فوق المطبات والقطط.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-start gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <h4 className="font-black text-amber-200 text-sm">القفزة العالية (مطولة)</h4>
              <p className="text-white/75 mt-0.5">
                استمر بالضغط على الشاشة لقفزة عالية جداً تمكّنك من العبور فوق الميكروباص والأتوبيس
                الكبير!
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="font-black text-amber-200 text-sm">مراوغة "على شعرة!" (Near Miss)</h4>
              <p className="text-white/75 mt-0.5">
                القفز في اللحظة الأخيرة بالقرب من السيارات يمنحك +50 نقطة إضافية وصوت تشجيعي خاص!
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-start gap-3">
            <span className="text-2xl">🎩</span>
            <div>
              <h4 className="font-black text-amber-200 text-sm">طاقية الإخفاء والعملات</h4>
              <p className="text-white/75 mt-0.5">
                التقط طاقية الإخفاء لدرع يحميك من أي اصطدام قادم، واجمع العملات لفتح شخصيات وترقيات.
              </p>
            </div>
          </div>
        </div>

        <Btn variant="gold" size="lg" className="mt-3 w-full" onClick={onBack}>
          فهمت يا مجدي، يلا نجري! 🏃‍♂️
        </Btn>
      </Panel>
    </Backdrop>
  );
}

/* ------------------------------- Leaderboard Screen ------------------------------ */
export function ScoresScreen({
  profile,
  onBack,
}: {
  profile: Profile;
  onBack: () => void;
}) {
  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
  const rows: ScoreEntry[] = profile.scores.length
    ? profile.scores
    : [{ score: 0, coins: 0, level: 1, stageName: "ميدان رمسيس", date: Date.now() }];

  return (
    <Backdrop>
      <Panel className="anim-pop flex max-h-[85vh] w-full max-w-[420px] flex-col p-3">
        <h2 className="font-display text-center text-4xl text-amber-200">أبطال الشارع 🏆</h2>
        <p className="mb-2 text-center text-[11px] font-bold text-white/60">
          أفضل النتائج المسجلة محلياً على جهازك
        </p>

        {/* Lifetime Stats Summary */}
        <div className="mb-2.5 grid grid-cols-3 gap-1.5">
          <StatChip label="إجمالي الجولات" value={profile.runs} tone="sky" />
          <StatChip label="المسافة الإجمالية" value={`${profile.totalDistance}م`} tone="amber" />
          <StatChip label="المراوغات" value={profile.totalDodges} tone="emerald" />
        </div>

        {/* Scores List */}
        <div className="scroll-thin flex-1 space-y-2 overflow-y-auto pl-1">
          {rows.map((s, i) => (
            <div
              key={`${s.date}-${i}`}
              className={`flex items-center justify-between rounded-2xl border-2 px-3 py-2 ${
                i === 0
                  ? "border-amber-300/60 bg-gradient-to-l from-amber-400/25 to-transparent shadow"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{medals[i] ?? "🎯"}</span>
                <div className="leading-4">
                  <div className="tabnum text-lg font-black text-white">{s.score} نقطة</div>
                  <div className="text-[10px] font-bold text-white/55">
                    {s.stageName || "الشارع المصري"} · {dateLabel(s.date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-200">
                <CoinIcon size={15} />
                <span className="tabnum font-black">{s.coins}</span>
              </div>
            </div>
          ))}
        </div>

        <Btn className="mt-3 w-full" onClick={onBack}>
          رجوع 🔙
        </Btn>
      </Panel>
    </Backdrop>
  );
}

/* ---------------------------- Rewarded Ad Overlay ---------------------------- */
export function AdOverlay({
  left,
  total,
  rewardType = "extra_life",
}: {
  left: number;
  total: number;
  rewardType?: "extra_life" | "double_coins";
}) {
  const pct = ((total - left) / total) * 100;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <Panel className="anim-pop w-full max-w-[390px] text-center p-4">
        <div className="rounded-2xl border-2 border-dashed border-sky-400/40 bg-gradient-to-b from-sky-500/20 to-indigo-950/60 px-4 py-5">
          <div className="text-5xl anim-wiggle">🎬</div>
          <div className="font-display mt-2 text-2xl text-sky-200">
            {rewardType === "extra_life" ? "إعلان مكافأة: حياة إضافية" : "إعلان مكافأة: مضاعفة العملات"}
          </div>
          <p className="mt-1 text-[11px] leading-4 text-white/80">
            بيئة العرض التجريبية (AdMob Sandbox). عند تجميع حزمة الأندرويد، يتم تفعيل مزود AdMob
            المدمج في الكود تلقائياً.
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/20 bg-black/50">
          <div
            className="h-full rounded-full bg-gradient-to-l from-emerald-300 to-emerald-600 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="tabnum mt-2 text-sm font-black text-amber-200">
          باقي {left} ثانية… استلم المكافأة فوراً!
        </div>
      </Panel>
    </div>
  );
}

function Backdrop({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#080c1a]/85 to-[#080c1a]/95 p-3 backdrop-blur-sm">
      {children}
    </div>
  );
}

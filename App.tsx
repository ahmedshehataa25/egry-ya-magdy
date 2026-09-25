import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "./game/engine";
import { audio } from "./game/audio";
import { getCharacter } from "./game/characters";
import {
  claimAchievement,
  claimDailyReward,
  claimMissionReward,
  loadProfile,
  saveProfile,
  submitScore,
  updateAchievements,
  updateMissionProgress,
} from "./game/storage";
import { AdManager } from "./game/ads";
import type { HudState, Profile, RunResult } from "./game/types";
import { Hud } from "./components/Hud";
import {
  AchievementsModal,
  AdOverlay,
  DailyMissionsModal,
  DailyRewardModal,
  GameOverScreen,
  PauseScreen,
  ScoresScreen,
  StageSelectModal,
  StartScreen,
  TutorialModal,
} from "./components/screens";
import { ShopScreen } from "./components/ShopScreen";
import { AndroidPublishModal } from "./components/AndroidPublishModal";

type Screen =
  | "menu"
  | "game"
  | "pause"
  | "gameover"
  | "shop"
  | "stages"
  | "missions"
  | "daily_reward"
  | "achievements"
  | "scores"
  | "tutorial"
  | "android_hub";

const INITIAL_HUD: HudState = {
  status: "menu",
  score: 0,
  best: 0,
  coins: 0,
  lives: 3,
  maxLives: 3,
  level: 1,
  stageId: 1,
  stageName: "ميدان رمسيس",
  distance: 0,
  speedPct: 0,
  shield: 0,
  banner: null,
  adUsed: false,
  characterId: "magdy",
  nearMissCount: 0,
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const profileRef = useRef(profile);
  const [screen, setScreen] = useState<Screen>("menu");
  const [scoresBack, setScoresBack] = useState<Screen>("menu");
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [last, setLast] = useState<RunResult | null>(null);
  const [ad, setAd] = useState<{
    open: boolean;
    left: number;
    total: number;
    type: "extra_life" | "double_coins";
  }>({
    open: false,
    left: 5,
    total: 5,
    type: "extra_life",
  });

  useEffect(() => {
    profileRef.current = profile;
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    audio.setMuted(profile.muted);
  }, [profile.muted]);

  /* ------------- engine lifecycle ------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(canvas, {
      onHud: setHud,
      onStatus: (s) => {
        if (s === "paused") setScreen((prev) => (prev === "game" ? "pause" : prev));
        else if (s === "playing" || s === "countdown") setScreen("game");
        else if (s === "menu") setScreen("menu");
        else if (s === "gameover") setScreen("gameover");
      },
      onGameOver: (r) => {
        const curProfile = profileRef.current;
        const res = submitScore(
          curProfile,
          {
            score: r.score,
            coins: r.reward,
            level: r.level,
            stageName: r.stageName,
          },
          {
            distance: r.distance,
            dodges: r.dodged,
            nearMisses: r.nearMisses,
          }
        );

        // Update daily missions
        const withMissions = updateMissionProgress(res.profile, {
          distance: r.distance,
          coins: r.coins,
          dodges: r.nearMisses,
          runFinished: true,
        }).profile;

        // Update achievements
        const withAchs = updateAchievements(withMissions).profile;

        profileRef.current = withAchs;
        setProfile(withAchs);
        setLast({ ...r, isNewBest: res.isBest });
        engineRef.current?.setBest(withAchs.best);
      },
      onNearMiss: () => {
        // dynamically progress near-miss missions
        const updated = updateMissionProgress(profileRef.current, { dodges: 1 }).profile;
        profileRef.current = updated;
        setProfile(updated);
      },
      onStageUnlocked: (stageId) => {
        const cur = profileRef.current;
        if (!cur.unlockedStages.includes(stageId)) {
          const np = { ...cur, unlockedStages: [...cur.unlockedStages, stageId] };
          profileRef.current = np;
          setProfile(np);
        }
      },
    });

    engineRef.current = engine;
    engine.setBest(profileRef.current.best);
    engine.setCharacter(profileRef.current.character);
    engine.setUpgrades(profileRef.current.upgrades);
    engine.setStage(profileRef.current.selectedStage || 1);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  /* ------------- actions ------------- */
  const play = useCallback(
    (useHeadstart = false) => {
      audio.unlock();
      audio.startMusic();

      if (useHeadstart && profileRef.current.upgrades.headstartsCount > 0) {
        setProfile((p) => ({
          ...p,
          upgrades: { ...p.upgrades, headstartsCount: Math.max(0, p.upgrades.headstartsCount - 1) },
        }));
      }

      engineRef.current?.startRun(useHeadstart);
    },
    []
  );

  const resume = useCallback(() => engineRef.current?.resume(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const toMenu = useCallback(() => {
    engineRef.current?.toMenu();
    setScreen("menu");
  }, []);

  const toggleSound = useCallback(() => {
    setProfile((p) => {
      const muted = !p.muted;
      audio.unlock();
      audio.setMuted(muted);
      if (!muted) audio.startMusic();
      return { ...p, muted };
    });
  }, []);

  // Character purchase & equip
  const buyChar = useCallback((id: string) => {
    const ch = getCharacter(id);
    setProfile((p) => {
      if (p.owned.includes(id) || p.bank < ch.cost) return p;
      audio.unlockItem();
      const np: Profile = {
        ...p,
        bank: p.bank - ch.cost,
        owned: [...p.owned, id],
        character: id,
      };
      engineRef.current?.setCharacter(id);
      return updateAchievements(np).profile;
    });
  }, []);

  const selectChar = useCallback((id: string) => {
    audio.click();
    setProfile((p) => ({ ...p, character: id }));
    engineRef.current?.setCharacter(id);
  }, []);

  // Upgrades purchase
  const buyUpgrade = useCallback(
    (type: "magnet" | "shield" | "hearts" | "multiplier" | "headstart", cost: number) => {
      setProfile((p) => {
        if (p.bank < cost) return p;
        audio.unlockItem();
        const upg = { ...p.upgrades };
        if (type === "magnet" && upg.magnetLevel < 5) upg.magnetLevel++;
        else if (type === "shield" && upg.shieldDurationLevel < 5) upg.shieldDurationLevel++;
        else if (type === "hearts" && upg.extraHeartsLevel < 3) upg.extraHeartsLevel++;
        else if (type === "multiplier" && upg.coinMultiplierLevel < 5) upg.coinMultiplierLevel++;
        else if (type === "headstart") upg.headstartsCount++;

        const np = { ...p, bank: p.bank - cost, upgrades: upg };
        engineRef.current?.setUpgrades(upg);
        return updateAchievements(np).profile;
      });
    },
    []
  );

  // Stages selection
  const selectStage = useCallback((id: number) => {
    audio.click();
    setProfile((p) => ({ ...p, selectedStage: id }));
    engineRef.current?.setStage(id);
    setScreen("menu");
  }, []);

  // Daily Rewards
  const claimDaily = useCallback(() => {
    audio.claimDaily();
    const res = claimDailyReward(profileRef.current);
    profileRef.current = res.profile;
    setProfile(res.profile);
  }, []);

  // Daily Missions
  const claimMission = useCallback((id: string) => {
    audio.missionComplete();
    const np = claimMissionReward(profileRef.current, id);
    profileRef.current = np;
    setProfile(np);
  }, []);

  // Achievements
  const claimAch = useCallback((id: string) => {
    audio.missionComplete();
    const np = claimAchievement(profileRef.current, id);
    profileRef.current = np;
    setProfile(np);
  }, []);

  // Rewarded Ads
  const watchAdLife = useCallback(async () => {
    audio.unlock();
    audio.click();
    setAd({ open: true, left: 5, total: 5, type: "extra_life" });
    const res = await AdManager.showRewardedAd("extra_life", (left, total) =>
      setAd({ open: true, left, total, type: "extra_life" })
    );
    setAd((a) => ({ ...a, open: false }));
    if (res.rewarded) {
      engineRef.current?.setAdUsed(true);
      engineRef.current?.revive();
      setScreen("game");
    }
  }, []);

  const watchAdDoubleCoins = useCallback(async () => {
    if (!last || last.reward <= 0) return;
    audio.unlock();
    audio.click();
    setAd({ open: true, left: 5, total: 5, type: "double_coins" });
    const res = await AdManager.showRewardedAd("double_coins", (left, total) =>
      setAd({ open: true, left, total, type: "double_coins" })
    );
    setAd((a) => ({ ...a, open: false }));
    if (res.rewarded) {
      audio.unlockItem();
      const bonus = last.reward;
      setProfile((p) => ({ ...p, bank: p.bank + bonus }));
      setLast((l) => (l ? { ...l, reward: l.reward * 2 } : null));
    }
  }, [last]);

  /* ------------- keyboard shortcuts ------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screen === "gameover" && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        play();
      } else if (screen === "menu" && e.code === "Enter") {
        play();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, play]);

  const char = getCharacter(profile.character);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* ambient desktop glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
      </div>

      <div
        className="relative overflow-hidden border border-white/10 bg-[#0b1020] shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:rounded-[30px]"
        style={{
          width: "min(100vw, calc(100svh * 9 / 16))",
          height: "min(calc(100vw * 16 / 9), 100svh)",
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <Hud
          hud={hud}
          paused={screen === "pause"}
          onPause={pause}
          muted={profile.muted}
          onToggleSound={toggleSound}
        />

        {screen === "menu" && (
          <StartScreen
            profile={profile}
            onPlay={play}
            onOpenShop={() => setScreen("shop")}
            onOpenStages={() => setScreen("stages")}
            onOpenMissions={() => setScreen("missions")}
            onOpenDailyReward={() => setScreen("daily_reward")}
            onOpenAchievements={() => setScreen("achievements")}
            onOpenScores={() => {
              setScoresBack("menu");
              setScreen("scores");
            }}
            onOpenTutorial={() => setScreen("tutorial")}
            onOpenAndroidHub={() => setScreen("android_hub")}
            muted={profile.muted}
            onToggleSound={toggleSound}
          />
        )}

        {screen === "android_hub" && (
          <AndroidPublishModal onBack={() => setScreen("menu")} />
        )}

        {screen === "pause" && (
          <PauseScreen
            hud={{
              score: hud.score,
              coinCount: hud.coins,
              level: hud.level,
              distance: hud.distance,
              stageName: hud.stageName,
            }}
            activeMission={profile.dailyMissions.find((m) => !m.claimed)}
            onResume={resume}
            onRestart={() => play(false)}
            onMenu={toMenu}
            muted={profile.muted}
            onToggleSound={toggleSound}
          />
        )}

        {screen === "gameover" && last && (
          <GameOverScreen
            result={last}
            profile={profile}
            adUsed={hud.adUsed}
            onRestart={() => play(false)}
            onWatchAdLife={watchAdLife}
            onWatchAdDoubleCoins={watchAdDoubleCoins}
            onShop={() => setScreen("shop")}
            onScores={() => {
              setScoresBack("gameover");
              setScreen("scores");
            }}
            onMenu={toMenu}
          />
        )}

        {screen === "stages" && (
          <StageSelectModal
            profile={profile}
            onSelectStage={selectStage}
            onBack={() => setScreen("menu")}
          />
        )}

        {screen === "daily_reward" && (
          <DailyRewardModal
            profile={profile}
            onClaim={claimDaily}
            onBack={() => setScreen("menu")}
          />
        )}

        {screen === "missions" && (
          <DailyMissionsModal
            profile={profile}
            onClaim={claimMission}
            onBack={() => setScreen("menu")}
          />
        )}

        {screen === "achievements" && (
          <AchievementsModal
            profile={profile}
            onClaim={claimAch}
            onBack={() => setScreen("menu")}
          />
        )}

        {screen === "scores" && (
          <ScoresScreen profile={profile} onBack={() => setScreen(scoresBack)} />
        )}

        {screen === "shop" && (
          <ShopScreen
            profile={profile}
            onBuyChar={buyChar}
            onSelectChar={selectChar}
            onBuyUpgrade={buyUpgrade}
            onBack={() => setScreen("menu")}
          />
        )}

        {screen === "tutorial" && <TutorialModal onBack={() => setScreen("menu")} />}

        {ad.open && <AdOverlay left={ad.left} total={ad.total} rewardType={ad.type} />}

        {screen === "game" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center">
            <span className="rounded-full bg-black/55 px-3 py-1 text-[10.5px] font-bold text-white/75 backdrop-blur shadow">
              {char.name} — {char.perk}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

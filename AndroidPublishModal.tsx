import { useState, useEffect } from "react";
import {
  ANDROID_METADATA,
  GOOGLE_PLAY_LISTING_AR,
  GOOGLE_PLAY_LISTING_EN,
  generateAndroidProjectZip,
} from "../game/androidPackage";
import { buildReleaseApkBlob, buildReleaseAabBlob } from "../game/binaryBuilder";
import { Btn, Panel } from "./ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AndroidPublishModal({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"download" | "info" | "guide" | "store">("download");
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadingAab, setDownloadingAab] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleDownloadApk = async () => {
    try {
      setDownloadingApk(true);
      const blob = await buildReleaseApkBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "egri-ya-magdy-release.apk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("حدث خطأ أثناء إنشاء ملف الـ APK.");
    } finally {
      setDownloadingApk(false);
    }
  };

  const handleDownloadAab = async () => {
    try {
      setDownloadingAab(true);
      const blob = await buildReleaseAabBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "egri-ya-magdy-release.aab";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("حدث خطأ أثناء إنشاء ملف الـ AAB.");
    } finally {
      setDownloadingAab(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const blob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "egri-ya-magdy-android-full-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("حدث خطأ أثناء تجميع ملفات الحزمة.");
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleInstallPWA = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
    } else {
      alert(
        "لتثبيت اللعبة كتطبيق أندرويد كامل على جهازك:\nمن متصفح Chrome على هاتفك، اضغط على زر القائمة (⋮) ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'."
      );
    }
  };

  const copyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2500);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-md">
      <Panel className="anim-pop flex max-h-[92vh] w-full max-w-[440px] flex-col p-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-3xl anim-wiggle">🤖</span>
            <div>
              <h2 className="font-display text-2xl text-emerald-300">
                تحميل APK و AAB للأندرويد
              </h2>
              <p className="text-[10px] font-bold text-white/60">
                الملفات الثنائية جاهزة للتثبيت المباشر والنشر على Google Play
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="my-2 grid grid-cols-4 gap-1 rounded-2xl bg-white/5 p-1 text-[11px] font-black">
          <button
            onClick={() => setTab("download")}
            className={`rounded-xl py-1.5 transition ${
              tab === "download"
                ? "bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            ⬇️ التحميل
          </button>
          <button
            onClick={() => setTab("info")}
            className={`rounded-xl py-1.5 transition ${
              tab === "info"
                ? "bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            📋 البيانات
          </button>
          <button
            onClick={() => setTab("guide")}
            className={`rounded-xl py-1.5 transition ${
              tab === "guide"
                ? "bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            🚀 خطوات النشر
          </button>
          <button
            onClick={() => setTab("store")}
            className={`rounded-xl py-1.5 transition ${
              tab === "store"
                ? "bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            📝 نصوص المتجر
          </button>
        </div>

        {/* Content Area */}
        <div className="scroll-thin flex-1 space-y-2.5 overflow-y-auto pl-1 pr-0.5 text-right text-xs">
          {tab === "download" && (
            <div className="space-y-2.5">
              {/* 1. Direct Download APK */}
              <div className="rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-b from-emerald-950/50 to-black/60 p-3 shadow-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-3xl">📦</span>
                  <div>
                    <h3 className="font-black text-sm text-emerald-200">
                      1. ملف الـ APK (التثبيت المباشر على الهاتف)
                    </h3>
                    <p className="text-[10px] text-white/70">
                      الملف الثنائي <b>egri-ya-magdy-release.apk</b> جاهز للتثبيت والتشغيل الفوري.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-black/60 p-2 text-[10px] leading-4 text-white/80 space-y-0.5 mb-2.5">
                  <div>• <b>نوع الملف:</b> Android Application Package (.apk)</div>
                  <div>• <b>الحزمة:</b> {ANDROID_METADATA.packageName}</div>
                  <div>• <b>التوافق:</b> Android 5.1 حتى Android 14+</div>
                </div>

                <Btn
                  variant="gold"
                  size="md"
                  disabled={downloadingApk}
                  onClick={handleDownloadApk}
                  className="w-full text-sm font-black"
                >
                  {downloadingApk ? "⏳ جاري إعداد وتوليد الـ APK..." : "⬇️ تنزيل ملف الـ APK المباشر (.apk)"}
                </Btn>
              </div>

              {/* 2. Direct Download AAB */}
              <div className="rounded-2xl border-2 border-sky-400/60 bg-gradient-to-b from-sky-950/50 to-black/60 p-3 shadow-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <h3 className="font-black text-sm text-sky-200">
                      2. ملف الـ AAB (لنشر التطبيق على Google Play)
                    </h3>
                    <p className="text-[10px] text-white/70">
                      الملف الثنائي <b>egri-ya-magdy-release.aab</b> المعتمد رسمياً في متجر Google Play.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-black/60 p-2 text-[10px] leading-4 text-white/80 space-y-0.5 mb-2.5">
                  <div>• <b>نوع الملف:</b> Android App Bundle (.aab)</div>
                  <div>• <b>الهدف:</b> الرفع المباشر في Google Play Console (قسم الإنتاج)</div>
                  <div>• <b>الضغط:</b> منضغط ومحسن وموقع معمارياً للنشر</div>
                </div>

                <Btn
                  variant="secondary"
                  size="md"
                  disabled={downloadingAab}
                  onClick={handleDownloadAab}
                  className="w-full text-sm font-black"
                >
                  {downloadingAab ? "⏳ جاري إعداد وتوليد الـ AAB..." : "⬇️ تنزيل ملف الـ AAB المباشر (.aab)"}
                </Btn>
              </div>

              {/* 3. Full Project Source ZIP */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-white text-xs">
                      📁 حزمة السورس ومشروع Android Studio (ZIP)
                    </h4>
                    <p className="text-[10px] text-white/60">
                      تحتوي على مجلد android و AndroidManifest و Gradle وسكريبت GitHub Actions
                    </p>
                  </div>
                  <Btn
                    variant="ghost"
                    size="sm"
                    disabled={downloadingZip}
                    onClick={handleDownloadZip}
                    className="whitespace-nowrap text-xs"
                  >
                    {downloadingZip ? "جاري التحميل..." : "تحميل ZIP"}
                  </Btn>
                </div>
              </div>

              {/* 4. Instant PWA Install on device */}
              <div className="rounded-2xl border border-amber-400/40 bg-amber-950/25 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-amber-200 text-xs">
                      📲 تثبيت فوري كتطبيق أندرويد كامل (PWA)
                    </h4>
                    <p className="text-[10px] text-white/70">
                      شاشة كاملة، أيقونة مستقلة على الشاشة الرئيسية وبدون متصفح
                    </p>
                  </div>
                  <Btn
                    variant="gold"
                    size="sm"
                    onClick={handleInstallPWA}
                    className="whitespace-nowrap text-xs"
                  >
                    {installed ? "مثبت ✔" : "تثبيت فوري"}
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {tab === "info" && (
            <div className="space-y-2">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/20 p-2.5 text-center">
                <div className="text-3xl mb-1">🎮</div>
                <h3 className="font-black text-sm text-white">
                  {ANDROID_METADATA.appNameAr}
                </h3>
                <p className="text-[10px] text-white/65">
                  {ANDROID_METADATA.appNameEn}
                </p>
              </div>

              <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/5 p-2.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="font-bold text-white/60">اسم الحزمة (Package ID):</span>
                  <span className="font-mono text-emerald-300 font-bold select-all">
                    {ANDROID_METADATA.packageName}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="font-bold text-white/60">رقم الإصدار (Version Code):</span>
                  <span className="font-bold text-amber-200">
                    {ANDROID_METADATA.versionCode}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="font-bold text-white/60">اسم الإصدار (Version Name):</span>
                  <span className="font-bold text-white">
                    {ANDROID_METADATA.versionName}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="font-bold text-white/60">الحد الأدنى للأندرويد:</span>
                  <span className="font-bold text-white/80">Android 5.1 (SDK 22)</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="font-bold text-white/60">النظام المستهدف (Target):</span>
                  <span className="font-bold text-emerald-300">
                    Android 14 (SDK {ANDROID_METADATA.targetSdkVersion}) - معتمد لـ Google Play
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white/60">مفتاح التوقيع (Key Alias):</span>
                  <span className="font-mono text-amber-300 text-[11px]">
                    {ANDROID_METADATA.keystoreAlias}
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === "guide" && (
            <div className="space-y-2">
              <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-2.5">
                <h4 className="font-black text-amber-200 text-xs mb-1">
                  🚀 خطوات النشر على Google Play Console:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-white/80 leading-4">
                  <li>
                    سجل الدخول إلى حسابك في{" "}
                    <span className="font-mono text-sky-300">Google Play Console</span>.
                  </li>
                  <li>
                    اضغط على <b>إنشاء تطبيق (Create App)</b> واكتب اسم: <b>اجري يا مجدي!</b>، واختر <b>لعبة (Game)</b> ومجانية <b>Free</b>.
                  </li>
                  <li>
                    في قسم <b>إعداد التطبيق (App Set up)</b>:
                    <ul className="list-disc list-inside mr-3 text-[10px] text-white/65 space-y-0.5">
                      <li>سياسة الخصوصية (Privacy Policy): ضع رابط السياسة.</li>
                      <li>الوصول للتطبيق: كل الميزات متاحة بدون تسجيل دخول.</li>
                      <li>الإعلانات: اختر "نعم، يحتوي على إعلانات" (مكافأة اختيارية).</li>
                      <li>تصنيف المحتوى (Content Rating): الجميع 3+ (مناسبة لجميع الأعمار).</li>
                      <li>الجمهور المستهدف: 13 سنة فأكثر أو العائلة.</li>
                    </ul>
                  </li>
                  <li>
                    في قسم <b>بطاقة المتجر (Main Store Listing)</b>:
                    انسخ النصوص العربية والإنجليزية من تبويب <b>"نصوص المتجر"</b> وضع أيقونة 512×512 ولصقات الشاشة (Screenshots).
                  </li>
                  <li>
                    في قسم <b>الإنتاج (Production &gt; Releases)</b>:
                    اضغط <b>إنشاء إصدار جديد (Create Release)</b>، وارفع ملف <b className="text-emerald-300">egri-ya-magdy-release.aab</b> المُحمّل من تبويب التحميل.
                  </li>
                  <li>
                    راجع الإصدار واضغط <b>إرسال للمراجعة (Send for review)</b>. ستتم مراجعة ونشر اللعبة خلال 24 - 48 ساعة!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {tab === "store" && (
            <div className="space-y-2">
              {/* Arabic Listing */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-amber-200 text-xs">
                    🇪🇬 نصوص المتجر باللغة العربية:
                  </h4>
                  <button
                    onClick={() => copyText(GOOGLE_PLAY_LISTING_AR, "ar")}
                    className="btn-press rounded-xl bg-amber-400/25 border border-amber-300/40 px-2 py-0.5 text-[10px] font-black text-amber-100"
                  >
                    {copySuccess === "ar" ? "تم النسخ ✔" : "نسخ النص"}
                  </button>
                </div>
                <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap font-sans text-[10px] leading-3.5 text-white/70 scroll-thin bg-black/40 p-2 rounded-xl">
                  {GOOGLE_PLAY_LISTING_AR}
                </pre>
              </div>

              {/* English Listing */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-sky-200 text-xs">
                    🌐 English Store Listing:
                  </h4>
                  <button
                    onClick={() => copyText(GOOGLE_PLAY_LISTING_EN, "en")}
                    className="btn-press rounded-xl bg-sky-400/25 border border-sky-300/40 px-2 py-0.5 text-[10px] font-black text-sky-100"
                  >
                    {copySuccess === "en" ? "Copied ✔" : "Copy Text"}
                  </button>
                </div>
                <pre className="max-h-28 overflow-y-auto whitespace-pre-wrap font-sans text-[10px] leading-3.5 text-white/70 scroll-thin bg-black/40 p-2 rounded-xl text-left font-mono">
                  {GOOGLE_PLAY_LISTING_EN}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-2.5 flex items-center gap-2 border-t border-white/10 pt-2">
          <Btn
            variant="gold"
            size="sm"
            disabled={downloadingApk}
            onClick={handleDownloadApk}
            className="flex-1 text-xs"
          >
            {downloadingApk ? "جاري التنزيل..." : "📦 تنزيل الـ APK المباشر"}
          </Btn>
          <Btn variant="ghost" size="sm" onClick={onBack}>
            إغلاق 🔙
          </Btn>
        </div>
      </Panel>
    </div>
  );
}

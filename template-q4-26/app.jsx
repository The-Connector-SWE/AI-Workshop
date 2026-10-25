// app.jsx — Template Q4-26: The Director's Game, futuristic redesign.
// Content comes from window.GAME (game-data.jsx) and window.WORKSHOP.PLATFORMS (data.jsx);
// visual examples come from window.TQ (visuals.js). Routing is hash-based.

const { useState, useEffect, useRef } = React;
const { LEVELS, RANKS } = window.GAME;
const { PLATFORMS } = window.WORKSHOP;
const TQ = window.TQ;
const STORE_KEY = "tq426_directors_game";

/* ---------------- state ---------------- */

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
}
function useStore() {
  const [s, setS] = useState(() => ({ done: {}, cleared: {}, pos: {}, days: [], labs: {}, apply: {}, stepDone: {}, missionDone: {}, review: {}, lang: "en", ...loadStore() }));
  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }, [s]);
  return [s, setS];
}

function useRoute() {
  const parse = () => (location.hash.replace(/^#\/?/, "") || "map").split("/");
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => { setR(parse()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return r;
}
const go = (path) => { location.hash = "#/" + path; };

/* ---------------- helpers ---------------- */

const pad = (n) => String(n).padStart(2, "0");
const sectionsOf = (lv) => {
  const k = Object.keys(lv).find((key) => lv[key] && Array.isArray(lv[key].sections));
  return k ? lv[k] : { title: lv.name, sections: [] };
};
const missionOf = (lv) => (window.TQ_MISSIONS || {})[lv.id] || null;
const missionDone = (lv, s) => !!(s.missionDone || {})[lv.id];
const levelIndex = (id) => LEVELS.findIndex((l) => String(l.id) === String(id));

function levelProgress(lv, s) {
  const secs = sectionsOf(lv).sections.length;
  const ms = missionOf(lv) ? 1 : 0;
  const total = secs + ms || 1;
  const d = (s.done[lv.id] || []).length + (ms && missionDone(lv, s) ? 1 : 0);
  return s.cleared[lv.id] ? 100 : Math.round((d / total) * 100);
}
function xpOf(s) {
  const sections = Object.values(s.done).reduce((n, a) => n + a.length, 0);
  const missions = Object.values(s.missionDone || {}).filter(Boolean).length;
  const steps = Object.values(s.stepDone || {}).filter(Boolean).length;
  return Object.keys(s.cleared).length * 500 + sections * 25 + missions * 300 + steps * 40 + Object.values(s.labs || {}).filter(Boolean).length * 50;
}
const clearedCount = (s) => LEVELS.filter((l) => s.cleared[l.id]).length;
// Instructor mode opens every level; otherwise a level opens when the one before it is cleared.
const isLocked = (i, s) => !s.instructor && i > 0 && !s.cleared[LEVELS[i - 1].id];

// Rough time estimates: reading at ~160 wpm plus time for interaction and hands-on work.
const wordsIn = (o) => typeof o === "string" ? o.split(/\s+/).length
  : Array.isArray(o) ? o.reduce((n, x) => n + wordsIn(x), 0)
  : o && typeof o === "object" ? Object.values(o).reduce((n, x) => n + wordsIn(x), 0) : 0;
const sectionMinutes = (sec) => Math.max(2, Math.round(wordsIn(sec) / 160) + (["cameraTable", "scriptSteps", "checklist", "frameChain"].includes(sec.type) ? 2 : 1));
const missionMinutes = (lv) => (missionOf(lv) ? missionOf(lv).steps.length * 15 + 5 : 0);
const levelMinutes = (lv) => sectionsOf(lv).sections.reduce((n, x) => n + sectionMinutes(x), 0) + missionMinutes(lv);
const fmtMin = (m) => (m < 60 ? `~${m} min` : `~${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ""}`.trim());

// Daily streak from the list of days the learner opened the course.
const today = () => new Date().toISOString().slice(0, 10);
function streakOf(days) {
  const set = new Set(days || []);
  let n = 0;
  for (let d = new Date(); set.has(d.toISOString().slice(0, 10)); d.setDate(d.getDate() - 1)) n++;
  return n;
}

/* ---------------- language ---------------- */

let LANG = "en";
const t = (k) => (LANG === "ar" && window.TQ_AR && window.TQ_AR[k] !== undefined ? window.TQ_AR[k] : k);
const T_ = (k) => t(k).toUpperCase();

/* ---------------- learner media (IndexedDB, this browser only) ---------------- */

const MediaDB = (() => {
  let dbp;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open("tq426_media", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("media", { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const run = (mode, fn) => open().then((db) => new Promise((res, rej) => {
    const tx = db.transaction("media", mode);
    const req = fn(tx.objectStore("media"));
    tx.oncomplete = () => { res(req ? req.result : undefined); window.dispatchEvent(new Event("tq-media")); };
    tx.onerror = () => rej(tx.error);
  }));
  return {
    put: (rec) => run("readwrite", (st) => st.put(rec)),
    del: (id) => run("readwrite", (st) => st.delete(id)),
    all: () => run("readonly", (st) => st.getAll()),
    clear: () => run("readwrite", (st) => st.clear()),
  };
})();

// Images are downscaled to 1280px JPEG; clips, audio and PDFs are stored as-is (up to 60 MB).
function readMedia(file) {
  const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : file.type === "application/pdf" ? "file" : null;
  if (kind) return Promise.resolve(file.size <= 60e6 ? { kind, data: file } : null);
  if (!file.type.startsWith("image/")) return Promise.resolve(null);
  return new Promise((res) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res({ kind: "image", data: c.toDataURL("image/jpeg", 0.86) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(null); };
    img.src = url;
  });
}

function useMedia() {
  const [list, setList] = useState([]);
  useEffect(() => {
    let alive = true;
    const load = () => MediaDB.all().then((l) => alive && setList(l.sort((a, b) => a.at - b.at))).catch(() => {});
    load();
    window.addEventListener("tq-media", load);
    return () => { alive = false; window.removeEventListener("tq-media", load); };
  }, []);
  return list;
}

function MediaThumb({ m, size = 96, onRemove }) {
  const [url, setUrl] = useState(m.kind === "image" ? m.data : null);
  useEffect(() => {
    if (m.kind === "image") return;
    const u = URL.createObjectURL(m.data); setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [m.id]);
  return (
    <div style={{ position: "relative", width: size, flex: "0 0 auto" }}>
      {m.kind === "video"
        ? <video src={url || undefined} muted playsInline controls style={{ width: size, height: size * 1.4, objectFit: "cover", borderRadius: 8, background: "#000", border: "1px solid var(--border-hairline)" }} />
        : m.kind === "image"
        ? <img src={url} alt={m.name || ""} style={{ width: size, height: size * 1.4, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-hairline)", display: "block" }} />
        : (
          <div className="stack" style={{ width: size, height: size * 1.4, borderRadius: 8, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", alignItems: "center", justifyContent: "center", gap: 8, padding: 8, boxSizing: "border-box" }}>
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pm-red-300)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              {m.kind === "audio" ? <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></> : <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>}
            </svg>
            <span className="mono" style={{ fontSize: 10, textAlign: "center", wordBreak: "break-all", lineHeight: 1.3 }}>{(m.name || "").slice(0, 28)}</span>
            {m.kind === "audio" && url ? <audio src={url} controls style={{ width: size - 12, height: 28 }} /> : null}
          </div>
        )}
      {onRemove ? (
        <button type="button" onClick={onRemove} aria-label={`${t("Remove")} ${m.name || ""}`}
          style={{ position: "absolute", top: 4, right: 4, width: 28, height: 28, borderRadius: "50%", border: 0, background: "rgba(10,10,10,.85)", color: "#fff", cursor: "pointer", fontSize: 16, lineHeight: "28px", padding: 0 }}>×</button>
      ) : null}
    </div>
  );
}

function AttachMedia({ refKey, level, item, media, accept = "image/*,video/*" }) {
  const mine = media.filter((m) => m.key === refKey && m.item === item);
  const inputId = `att-${refKey}-${item}`;
  const onFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    for (const f of files) {
      const r = await readMedia(f);
      if (r) await MediaDB.put({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, key: refKey, level, item, name: f.name, at: Date.now(), ...r });
    }
  };
  return (
    <div className="stack" style={{ gap: 10 }}>
      {mine.length ? (
        <div className="row" style={{ gap: 8 }}>
          {mine.map((m) => <MediaThumb key={m.id} m={m} size={80} onRemove={() => MediaDB.del(m.id)} />)}
        </div>
      ) : null}
      <label htmlFor={inputId} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", cursor: "pointer" }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
        {t("Attach image or clip")}
      </label>
      <input id={inputId} type="file" accept={accept} multiple onChange={onFiles} className="sr-only" />
    </div>
  );
}

/* ---------------- read aloud (browser speech, no service needed) ---------------- */

function textOf(o) {
  if (typeof o === "string") return o;
  if (Array.isArray(o)) return o.map(textOf).join(". ");
  if (o && typeof o === "object") return Object.entries(o).filter(([k]) => !["type", "n", "src", "pdf", "hot"].includes(k)).map(([, v]) => textOf(v)).join(". ");
  return "";
}
function ListenButton({ text }) {
  const ok = typeof window !== "undefined" && "speechSynthesis" in window;
  const [on, setOn] = useState(false);
  useEffect(() => () => { if (ok) window.speechSynthesis.cancel(); }, [text]);
  if (!ok) return null;
  const toggle = () => {
    const ss = window.speechSynthesis;
    if (on) { ss.cancel(); setOn(false); return; }
    ss.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\s+/g, " ").slice(0, 4000));
    u.lang = "en-US"; u.rate = 1;
    u.onend = u.onerror = () => setOn(false);
    ss.speak(u); setOn(true);
  };
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={toggle} aria-pressed={on}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {on ? <rect x="6" y="6" width="12" height="12" rx="1" /> : <><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></>}
      </svg>
      {on ? t("Stop") : t("Listen")}
    </button>
  );
}

/* ---------------- workshop links (from the live site) ---------------- */

const UPLOAD_URL = "https://drive.google.com/drive/folders/1NSncYZx2HtVDjw2xNnHkZHg8f8-Suqf8?usp=sharing";
// Certificate claim page for the current cohort (same roster link as the live site — update per cohort).
const CERT_URL = "../claim.html?d=eyJuYW1lcyI6WyJKYW5hIEVsYmFtYnkiLCJLYXJtYSBFbCBhcmVmIiwiU2FiYSBOYXNzYXIiLCJBaG1hZCBBbW1hciIsIkRhbmlhaCBPbWVyIiwiRHIuIEhlYmEgU2FkZWsiLCJIYWJpYmEgRWxzaGFmaWUiLCJZb3Vzc2VmIEJlaGVyeSIsIllvdXN0aW5hIEFtaXIiLCJBbGlhIEhhaXRoYW0iLCJIYWJpYmEgRWxzaGFmaWUiLCJKb3VyeSBTaGFyYWYiXSwiZGF0ZSI6IkF1Z3VzdCAyOSAmIDMwLCAyMDI2In0=";
const HUB_TABS = [
  { id: "instructors", label: "Instructors", src: "../instructors.html" },
  { id: "aifun", label: "AI Fun", src: "../real-or-ai.html" },
  { id: "agenda", label: "Agenda", src: "../agenda-aast.html" },
  { id: "accounts", label: "Accounts", src: "../accounts.html" },
  { id: "feedback", label: "Feedback", src: "../feedback.html" },
  { id: "upload", label: "Upload", external: UPLOAD_URL },
  { id: "certificates", label: "Certificates" },
  { id: "settings", label: "Settings" },
];

function Glyph({ id, size = 40 }) {
  const P = window.PlatformLogo;
  return (
    <span className="glyph" style={{ width: size, height: size }} aria-hidden="true">
      {P ? <P id={id} size={Math.round(size * 0.58)} /> : null}
    </span>
  );
}
const Arrow = () => (
  <svg className="arrow-flip" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);
const Back = () => (
  <svg className="arrow-flip" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
);
const Check = ({ size = 18 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17 19 7" /></svg>
);
const Lock = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);

function KickerTitle({ kicker, children, size = "h-title", as = "h1", id }) {
  const T = as;
  return (
    <T className={`kicker-title ${size}`} id={id}>
      <span className="kicker">{kicker}</span>
      <span>{children}</span>
    </T>
  );
}

function CopyBox({ title, text, negative }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="inset" style={{ overflow: "hidden" }}>
      <div className="prompt-head">
        <span className="mono">{(title || "Prompt").toUpperCase()}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{copied ? t("Copied") : t("Copy prompt")}</button>
      </div>
      <p className="prompt">{text}</p>
      {negative ? (
        <p className="prompt" style={{ borderTop: "1px solid var(--border-hairline)", color: "var(--text-muted)" }}>
          <span className="sublabel" style={{ display: "block", marginBottom: 6 }}>Negative prompt</span>{negative}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------- 3D ---------------- */

const has3D = () => !!(window.World3D && window.World3D.supported);
const SKINS = ["#f1c7a5", "#d9a27c", "#a86f4b", "#6b4430"];
const JACKETS = ["#ec1c24", "#f2f2f2", "#2e7fc2", "#1f9e5c", "#1e1e1e"];
const avatarOf = (s) => ({ skin: SKINS[1], jacket: JACKETS[0], body: "male", name: "", ...(s.avatar || {}) });
const AvatarCtx = React.createContext({ skin: SKINS[1], jacket: JACKETS[0], body: "male", name: "" });
const directorName = (s) => (avatarOf(s).name || "Director").trim();

function useNarrow(px = 700) {
  const q = `(max-width: ${px}px)`;
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q), on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

function MapWorld({ statuses, sel, onSelect, avatar, vertical }) {
  const el = useRef(), w = useRef(), cb = useRef(onSelect);
  cb.current = onSelect;
  useEffect(() => {
    if (!has3D()) return;
    w.current = window.World3D.createMap(el.current, {
      levels: LEVELS.map((l, i) => ({ code: l.code.toUpperCase(), name: l.name, status: statuses[i] })),
      selected: sel, avatar, vertical, onSelect: (i) => cb.current(i),
    });
    return () => w.current && w.current.dispose();
  }, []);
  useEffect(() => { w.current && w.current.select(sel); }, [sel]);
  useEffect(() => { w.current && w.current.setStatuses(statuses); }, [statuses.join()]);
  useEffect(() => { w.current && w.current.setAvatar(avatar); }, [avatar.skin, avatar.jacket, avatar.body, avatar.name]);
  return <div ref={el} style={{ position: "absolute", inset: 0 }} aria-hidden="true" />;
}

function SoloDirector({ avatar, celebrate, wave, turntable, distance, reaction, height = 300 }) {
  const el = useRef(), w = useRef();
  useEffect(() => {
    if (!has3D()) return;
    w.current = window.World3D.createSolo(el.current, { avatar, celebrate, wave, turntable, distance });
    return () => w.current && w.current.dispose();
  }, []);
  useEffect(() => { if (w.current && reaction) w.current.react(reaction.kind); }, [reaction && reaction.n]);
  useEffect(() => { w.current && w.current.setAvatar(avatar); }, [avatar.skin, avatar.jacket, avatar.body]);
  if (!has3D()) return null;
  return <div ref={el} style={{ width: "100%", height }} role="img" aria-label="Your director character" />;
}

function CameraSet3D({ move, run }) {
  const el = useRef(), w = useRef();
  const avatar = React.useContext(AvatarCtx);
  useEffect(() => {
    w.current = window.World3D.createCameraSet(el.current, { avatar, move });
    return () => w.current && w.current.dispose();
  }, [avatar.body, avatar.skin, avatar.jacket]);
  useEffect(() => { w.current && w.current.play(move); }, [move, run]);
  return <div ref={el} style={{ position: "absolute", inset: 0 }} role="img" aria-label={`${move} performed on a 3D film set`} />;
}

function Swatches({ label, list, value, onPick }) {
  return (
    <div className="stack" style={{ gap: 10 }}>
      <span className="label">{label}</span>
      <div className="row" role="group" aria-label={label} style={{ gap: 8 }}>
        {list.map((c, i) => (
          <button key={c} type="button" onClick={() => onPick(c)} aria-label={`${label} ${i + 1}`} aria-pressed={value === c}
            style={{ width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer", padding: 0, border: value === c ? "2px solid #fff" : "1px solid rgba(255,255,255,.25)", boxShadow: value === c ? "var(--glow-red)" : "none" }} />
        ))}
      </div>
    </div>
  );
}

function CharacterCreator({ initial, onSave, onClose, first }) {
  const [a, setA] = useState(initial);
  const input = useRef();
  useEffect(() => { input.current && input.current.focus(); }, []);
  const ok = a.name.trim().length > 0;
  const save = (e) => { e.preventDefault(); if (ok) onSave({ ...a, name: a.name.trim() }); };
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="cc-title" style={{ alignItems: "flex-start", overflowY: "auto" }}>
      <form onSubmit={save} className="card card-xl row" style={{ width: "min(100%, 980px)", gap: 32, alignItems: "stretch", margin: "auto" }}>
        <div style={{ flex: "1 1 320px", minHeight: 380, borderRadius: "var(--r-lg)", overflow: "hidden", background: "radial-gradient(ellipse at 50% 40%, #1a1112 0%, #0a0a0a 75%)", position: "relative" }}>
          <SoloDirector avatar={a} turntable wave distance={5.2} height={420} />
          <span className="mono" style={{ position: "absolute", left: 16, bottom: 14 }}>{T_("Drag to turn")}</span>
        </div>
        <div className="stack" style={{ flex: "1 1 340px", gap: 22 }}>
          <span className="mono">{first ? "STEP 00 / CASTING" : "EDIT YOUR DIRECTOR"}</span>
          <h2 id="cc-title" className="kicker-title h-title" style={{ margin: 0 }}><span className="kicker">{t("Create your")}</span><span>{t("Director")}</span></h2>
          <div className="stack" style={{ gap: 8 }}>
            <label htmlFor="cc-name" className="label">{t("Director name")}</label>
            <input id="cc-name" ref={input} className="field" type="text" maxLength={20} placeholder="e.g. Sara" value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} />
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <span className="label">{t("Character")}</span>
            <div className="row" role="group" aria-label="Character" style={{ gap: 8 }}>
              {[["male", t("Male")], ["female", t("Female")]].map(([v, l]) => (
                <button key={v} type="button" className="pill" aria-pressed={a.body === v} onClick={() => setA({ ...a, body: v })} style={{ minWidth: 110, justifyContent: "center" }}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <Swatches label={t("Skin tone")} list={SKINS} value={a.skin} onPick={(c) => setA({ ...a, skin: c })} />
          <Swatches label={t("Jacket")} list={JACKETS} value={a.jacket} onPick={(c) => setA({ ...a, jacket: c })} />
          <div className="row" style={{ gap: 12, paddingTop: 8, marginTop: "auto" }}>
            <button type="submit" className="btn btn-primary" disabled={!ok}>{first ? t("Start directing") : t("Save director")} <Arrow /></button>
            {!first ? <button type="button" className="btn btn-ghost" onClick={onClose}>{t("Cancel")}</button> : null}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------------- shell ---------------- */

function TopBar({ s, setS, route }) {
  const at = route[0];
  const streak = streakOf(s.days);
  const link = (href, label, on) => <a href={href} aria-current={on ? "page" : undefined}>{T_(label)}</a>;
  return (
    <header className="topbar">
      <div className="wrap">
        <a href="#/map" className="brand">
          <span className="ringmark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-text">THE DIRECTOR'S GAME</span>
        </a>
        <nav className="nav" aria-label="Course">
          {link("#/map", "Mission map", ["map", "level", "rankup"].includes(at))}
          {link("#/toolkit", "Toolkit", at === "toolkit")}
          {link("#/labs", "Final project", at === "labs")}
          {link("#/reel", "My reel", at === "reel")}
          {link("#/workshop", "Workshop", at === "workshop")}
        </nav>
        {avatarOf(s).name ? (
          <span className="chip-xp chip-name" title={t("Your director")}>
            <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: "50%", background: avatarOf(s).jacket, border: `3px solid ${avatarOf(s).skin}` }} />
            {directorName(s)} · {RANKS[clearedCount(s)]}
          </span>
        ) : null}
        {streak > 1 ? <span className="chip-xp chip-streak" title={t("day streak")}><span className="ring-dot" style={{ color: "var(--pm-red)" }} aria-hidden="true" />{streak} {t("day streak")}</span> : null}
        <span className="chip-xp"><span className="dot" aria-hidden="true" />{xpOf(s).toLocaleString("en-US")} XP</span>
        <button type="button" className="chip-xp" style={{ cursor: "pointer", background: "transparent" }} onClick={() => setS({ ...s, lang: s.lang === "ar" ? "en" : "ar" })}
          aria-label={s.lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}>{s.lang === "ar" ? "EN" : "ع"}</button>
      </div>
    </header>
  );
}

function HowToPlay({ onClose }) {
  const steps = [
    ["Pick a mission on the map. Your director walks to it.", "M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3z"],
    ["Read each lesson, try the interactive examples, and mark it done.", "M4 5h11a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3z"],
    ["Complete the challenges — attach the images and clips you make.", "M4 16l4-4 4 4 4-6 4 6M4 20h16"],
    ["Clear every level to earn your ranks and claim your certificate.", "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-3 0-1 6 4-2 4 2-1-6"],
  ];
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="htp-title">
      <div className="card card-xl stack reveal" style={{ width: "min(100%, 760px)", gap: 24 }}>
        <h2 id="htp-title" className="h-sub" style={{ fontSize: 40 }}>{t("How to play")}</h2>
        <ol className="grid-auto" style={{ "--min": "300px", "--gap": "14px", listStyle: "none", margin: 0, padding: 0 }}>
          {steps.map(([txt, d], i) => (
            <li key={i} className="row" style={{ gap: 14, flexWrap: "nowrap", alignItems: "flex-start", padding: 16, borderRadius: 12, background: "var(--surface-card)", border: "1px solid var(--border-hairline)" }}>
              <span className="icon-tile"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg></span>
              <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.5 }}><span className="mono" style={{ display: "block", color: "var(--pm-red-300)" }}>{pad(i + 1)}</span>{t(txt)}</span>
            </li>
          ))}
        </ol>
        <button type="button" className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={onClose} autoFocus>{t("Got it")} <Arrow /></button>
      </div>
    </div>
  );
}

/* ---------------- 01 · Mission Control ---------------- */

function ProgressRing({ pct, size = 80 }) {
  const r = size / 2 - 6, C = 2 * Math.PI * r;
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "0 0 auto" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a2a" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ec1c24" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * C} ${C}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray 700ms var(--ease-out)" }} />
      <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="15" fontFamily="ui-monospace, Menlo, monospace">{pct}%</text>
    </svg>
  );
}

function MapScreen({ s, setS }) {
  const cleared = clearedCount(s);
  const avatar = avatarOf(s);
  const statuses = LEVELS.map((l, i) => (s.cleared[l.id] ? "cleared" : isLocked(i, s) ? "locked" : "open"));
  const current = Math.min(LEVELS.findIndex((l) => !s.cleared[l.id]) === -1 ? LEVELS.length - 1 : LEVELS.findIndex((l) => !s.cleared[l.id]), LEVELS.length - 1);
  const [sel, setSel] = useState(current);
  const [editing, setEditing] = useState(!avatar.name);
  const [intro, setIntro] = useState(false);
  const narrow = useNarrow();
  const lv = LEVELS[sel];
  const locked = isLocked(sel, s);
  const mission = missionOf(lv);

  return (
    <div className="page">
      <span className="ring" style={{ top: -260, right: -220, width: 760, height: 760 }} />
      <span className="ring" style={{ top: -140, right: -100, width: 520, height: 520 }} />
      <span className="ring" style={{ top: -20, right: 20, width: 280, height: 280, borderColor: "rgba(236,28,36,.28)" }} />

      <main className="wrap stack" style={{ position: "relative", gap: 72, padding: "72px 32px 96px" }}>
        {editing ? (
          <CharacterCreator first={!avatar.name} initial={avatar} onClose={() => setEditing(false)}
            onSave={(a) => { const first = !s.seenIntro; setS({ ...s, avatar: a, seenIntro: true }); setEditing(false); if (first) setIntro(true); }} />
        ) : null}
        {intro ? <HowToPlay onClose={() => setIntro(false)} /> : null}
        <section className="grid-auto" style={{ "--min": "320px", "--gap": "32px", alignItems: "end" }}>
          <div className="stack reveal" style={{ gap: 24 }}>
            <span className="mono row" style={{ gap: 12, letterSpacing: ".06em" }}>
              <span className="ring-dot" style={{ color: "var(--pm-red)" }} aria-hidden="true" />SYS / MISSION CONTROL / {avatar.name ? `DIRECTOR ${avatar.name.toUpperCase()}` : "AI FILMMAKING TRACK"}
            </span>
            <KickerTitle kicker={avatar.name ? `${t("Welcome back,")} ${avatar.name}` : t("The")} size="h-display">{t("Director's Game")}</KickerTitle>
            <p className="lead" style={{ maxWidth: 560 }}>
              {LEVELS.length} {t("missions take you from a blank brief to a finished cinematic cut. Clear each one to earn your next rank.")}
            </p>
            <div className="row" style={{ gap: 12 }}>
              <a className="btn btn-primary" href={`#/level/${LEVELS[current].id}`}>{cleared ? t("Resume mission") : t("Start mission")} <Arrow /></a>
              <button type="button" className="btn btn-ghost" onClick={() => setIntro(true)}>{t("How to play")}</button>
            </div>
          </div>

          {has3D() ? (
            <div className="stack" style={{ alignItems: "center", gap: 8 }}>
              <SoloDirector key={avatar.name} avatar={avatar} wave height={360} distance={5} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>{t("Edit director")}</button>
            </div>
          ) : null}

          <div className="card stack" style={{ gap: 20 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
              <span className="label">{t("Rank track")}</span>
              <span className="sublabel">{cleared} / {LEVELS.length} {t("cleared")}</span>
            </div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {RANKS.map((name, i) => {
                const reached = i <= cleared, cur = i === cleared, last = i === RANKS.length - 1;
                return (
                  <li key={name} style={{ display: "flex", gap: 16 }}>
                    <div className="stack" style={{ alignItems: "center", width: 20 }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", flex: "0 0 auto", border: `2px solid ${reached ? "#ec1c24" : "#2a2a2a"}`, background: cur ? "#ec1c24" : "transparent", boxShadow: cur ? "var(--glow-red)" : "none" }} />
                      <span style={{ width: 1, flex: "1 1 auto", minHeight: 14, background: last ? "transparent" : i < cleared ? "#ec1c24" : "#2a2a2a" }} />
                    </div>
                    <div className="stack" style={{ paddingBottom: 12, gap: 0 }}>
                      <span style={{ fontSize: 15, color: reached ? "#fff" : "var(--text-muted)", lineHeight: 1.3 }}>{name}</span>
                      <span style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--text-muted)" }}>
                        {cur ? T_("Current rank") : reached ? T_("Earned") : `${T_("Unlocks at level")} ${pad(i)}`}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section aria-labelledby="map-h" className="stack" style={{ gap: 28 }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "end", gap: 12 }}>
            <KickerTitle kicker={LANG === "ar" ? "" : "Your"} size="h-title" as="h2" id="map-h">{LANG === "ar" ? t("Mission map") : "Mission Map"}</KickerTitle>
            <span className="mono">{has3D() ? t("Click an island — your director walks there") : t("Select a level to inspect it")}</span>
          </div>

          {has3D() ? (
            <div className="reveal" style={{ position: "relative", height: narrow ? 720 : "clamp(380px, 46vw, 560px)", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--border-hairline)", background: "radial-gradient(ellipse at 50% 35%, #1a1112 0%, #0a0a0a 70%)" }}>
              <MapWorld key={narrow ? "v" : "h"} statuses={statuses} sel={sel} onSelect={setSel} avatar={avatar} vertical={narrow} />
              <div className="map-bar" style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16, background: "rgba(20,20,20,.82)", backdropFilter: "var(--blur-glass)", WebkitBackdropFilter: "var(--blur-glass)", border: "1px solid rgba(255,255,255,.08)" }}>
                <span className="row" style={{ gap: 12 }}>
                  <span className="mono map-bar-name" style={{ color: "#fff" }}>{directorName(s).toUpperCase()} · {RANKS[cleared].toUpperCase()}</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>{t("Edit director")}</button>
                </span>
                <a className="btn btn-primary btn-sm" href={`#/level/${lv.id}`}>{locked ? t("Preview") : t("Enter")} {lv.code} <Arrow /></a>
              </div>
            </div>
          ) : null}

          <div className="grid-auto" style={{ "--min": "300px", "--gap": "20px" }}>
            {LEVELS.map((l, i) => {
              const isCleared = !!s.cleared[l.id];
              const locked_ = isLocked(i, s);
              const pct = levelProgress(l, s);
              const status = isCleared ? t("Cleared") : locked_ ? t("Locked") : t("In progress");
              const color = isCleared ? "var(--status-success)" : locked_ ? "var(--text-muted)" : "var(--pm-red-300)";
              return (
                <button key={l.id} type="button" className={`tile ${i === sel ? "on" : ""} ${locked_ ? "locked" : ""}`} aria-pressed={i === sel} onClick={() => setSel(i)} style={{ padding: 28, gap: 20 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "nowrap", gap: 16 }}>
                    <div className="stack" style={{ gap: 6 }}>
                      <span className="mono">{l.code.toUpperCase()}</span>
                      <span className="h-sub">{l.name}</span>
                      <span className="sublabel">{l.tag}</span>
                    </div>
                    <ProgressRing pct={pct} />
                  </div>
                  <hr className="hr" />
                  <div className="row" style={{ gap: 6 }}>
                    {l.tools.map((t) => (
                      <span key={t} className="tool-chip"><Glyph id={t} size={22} />{PLATFORMS[t] ? PLATFORMS[t].name : t}</span>
                    ))}
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                    <span className="label row" style={{ gap: 8, color }}><span className="ring-dot" aria-hidden="true" />{status}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{l.rank}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="card card-xl grid-auto" style={{ "--min": "380px", "--gap": "40px" }}>
            <div className="stack" style={{ gap: 16 }}>
              <span className="mono">BRIEFING / {lv.code.toUpperCase()}</span>
              <h3 className="h-sub" style={{ fontSize: 40 }}>{lv.name}</h3>
              <p style={{ margin: 0 }}>{lv.mission}</p>
              <div className="row" style={{ gap: 28, paddingTop: 8 }}>
                {[[sectionsOf(lv).sections.length, "Lessons"], [mission ? mission.steps.length : 0, "Mission steps"], [fmtMin(levelMinutes(lv)), "Time"]].map(([v, k]) => (
                  <div key={k} className="stack">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 30, color: "#fff", lineHeight: 1.2 }}>{v}</span>
                    <span style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--text-muted)", textTransform: "uppercase" }}>{t(k)}</span>
                  </div>
                ))}
              </div>
              {locked ? (
                <span className="row" style={{ gap: 10, color: "var(--text-muted)", fontSize: 15 }}><Lock /> {t("Clear")} {LEVELS[sel - 1].code} {t("to earn this rank — you can still preview it.")}</span>
              ) : null}
              <div style={{ paddingTop: 8 }}>
                <a className="btn btn-primary" href={`#/level/${lv.id}`}>{locked ? t("Preview") : t("Enter")} {lv.code} <Arrow /></a>
              </div>
            </div>
            <div className="stack" style={{ gap: 12 }}>
              <span className="label">{t("Apply it")}</span>
              {mission ? (
                <>
                  <a href={`#/level/${lv.id}/apply`} className="tile" style={{ padding: "18px 20px", gap: 6, background: "var(--surface-card)", textDecoration: "none" }}>
                    <span className="sublabel">{missionDone(lv, s) ? t("Mission complete") : t("Your mission")}</span>
                    <span style={{ color: "#fff", fontSize: 20, lineHeight: 1.25 }}>{mission.title}</span>
                    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{mission.deliverable}</span>
                  </a>
                  <ol className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 8 }}>
                    {mission.steps.map((st, j) => {
                      const ok = !!(s.stepDone || {})[`${lv.id}.${st.id}`];
                      return (
                        <li key={st.id}>
                          <a href={`#/level/${lv.id}/apply/${j}`} className="row" style={{ gap: 12, flexWrap: "nowrap", textDecoration: "none", color: "#fff", fontSize: 15 }}>
                            <span className="icon-tile" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, ...(ok ? { background: "var(--status-success-solid)" } : { background: "var(--surface-raised)", border: "1px solid var(--border-hairline)" }) }}>{ok ? <Check size={14} /> : pad(j + 1)}</span>
                            {st.title}
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <p style={{ margin: 0, color: "var(--text-muted)" }}>{t("This mission is cleared by completing its lessons.")}</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------------- section renderers ---------------- */

function UnitExplorer() {
  const [u, setU] = useState(0);
  const unit = TQ.UNITS[u];
  const w = Math.round((unit.h * 9) / 16);
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row" role="group" aria-label="Film units" style={{ gap: 8 }}>
        {TQ.UNITS.map((x, i) => (
          <button key={x.label} type="button" className="pill" aria-pressed={i === u} onClick={() => setU(i)} style={{ minWidth: 44 + i * 10, height: 44 + i * 10, justifyContent: "center" }}>{x.label.toUpperCase()}</button>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="scroll-x" style={{ padding: 20, background: "#000", borderBottom: "1px solid var(--border-hairline)" }}>
          <div className="strip">
            {unit.frames.map((n) => (
              <div key={n} style={{ position: "relative" }}>
                <img src={TQ.F(n)} alt={`Storyboard frame ${n}`} style={{ display: "block", width: w, height: unit.h, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border-hairline)" }} />
                <span className="badge">{pad(n)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="stack" style={{ gap: 8, padding: "24px 28px" }}>
          <span className="sublabel">{unit.kicker}</span>
          <span className="h-sub">{unit.title}</span>
          <p style={{ margin: 0 }}>{unit.desc}</p>
        </div>
      </div>
    </div>
  );
}

function ShotGallery() {
  return (
    <div className="grid-auto" style={{ "--min": "125px", "--gap": "12px" }}>
      {TQ.SHOTS.map((x) => (
        <figure key={x.shot} className="photo">
          <img src={x.img} alt={`${x.shot} example`} style={{ aspectRatio: "9 / 14", objectPosition: x.pos }} />
          <figcaption><span style={{ color: "#fff", fontSize: 15 }}>{x.shot}</span><span className="sublabel" style={{ color: "var(--pm-red-200)" }}>{x.purpose}</span></figcaption>
        </figure>
      ))}
    </div>
  );
}

function CameraSimulator({ rows }) {
  const moves = rows.filter((r) => TQ.MOVES[r.move]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState("end");
  const [run, setRun] = useState(0);
  const t = useRef();
  const play = (k) => {
    clearTimeout(t.current);
    setI(k); setPhase("start"); setRun((n) => n + 1);
    t.current = setTimeout(() => setPhase("end"), 60);
  };
  useEffect(() => { play(0); return () => clearTimeout(t.current); }, []);
  const r = moves[i], m = TQ.MOVES[r.move];
  const [mode, setMode] = useState(has3D() ? "set" : "frame");
  return (
    <div className="card card-xl row" style={{ gap: 28, alignItems: "flex-start", padding: 24 }}>
      <div className="stack" style={{ flex: mode === "set" ? "1 1 420px" : "0 1 300px", gap: 12, margin: "0 auto" }}>
        {has3D() ? (
          <div className="row" role="group" aria-label="View" style={{ gap: 6 }}>
            <button type="button" className="pill" aria-pressed={mode === "set"} onClick={() => { setMode("set"); setRun((n) => n + 1); }}>3D SET</button>
            <button type="button" className="pill" aria-pressed={mode === "frame"} onClick={() => { setMode("frame"); play(i); }}>REAL FRAME</button>
          </div>
        ) : null}
        {mode === "set" ? (
          <div className="viewfinder" style={{ maxWidth: "none", aspectRatio: "16 / 10" }}>
            <CameraSet3D move={r.move} run={run} />
            <span className="corners white" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="rec"><span className="dot" aria-hidden="true" />{r.move.toUpperCase()} · 3D SET</span>
          </div>
        ) : (
        <div className="viewfinder">
          <img key={run} src={TQ.F(m.img)} alt={`${r.move} demonstrated on storyboard frame ${m.img}`} className={m.shake && phase === "end" ? "shake" : ""}
            style={{ transformOrigin: m.origin, transform: phase === "start" ? m.from : m.to, transition: phase === "start" ? "none" : "transform 2600ms var(--ease-in-out)" }} />
          <span className="corners white" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="rec"><span className="dot" aria-hidden="true" />{r.move.toUpperCase()} · 00:0{phase === "end" ? 3 : 0}</span>
        </div>
        )}
        <button type="button" className="btn btn-primary" onClick={() => play(i)}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z" /></svg> Play move
        </button>
      </div>
      <div className="stack" style={{ flex: "1 1 320px", minWidth: 0, gap: 16 }}>
        <div className="row" role="group" aria-label="Camera moves" style={{ gap: 8 }}>
          {moves.map((x, k) => (
            <button key={x.move} type="button" className="pill" aria-pressed={k === i} onClick={() => play(k)}>{x.move.toUpperCase()}</button>
          ))}
        </div>
        <div className="card stack" style={{ gap: 8, background: "var(--surface-card)" }}>
          <span className="sublabel">{r.use}</span>
          <span className="h-sub">{r.move}</span>
          <p style={{ margin: 0 }}>{r.desc}.</p>
        </div>
        <div className="inset stack" style={{ padding: 20, gap: 8 }}>
          <span className="mono">IN YOUR VIDEO PROMPT</span>
          <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.7, color: "#fff" }}>{m.prompt}</p>
        </div>
      </div>
    </div>
  );
}

function ScriptSteps({ s }) {
  const [k, setK] = useState(0);
  const st = s.steps[k];
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row" role="tablist" aria-label="Questions" style={{ gap: 8 }}>
        {s.steps.map((x, i) => (
          <button key={x.key} type="button" role="tab" aria-selected={i === k} className="pill" aria-pressed={i === k} onClick={() => setK(i)}>
            <span style={{ fontFamily: "var(--font-mono)", marginRight: 8, opacity: .7 }}>{pad(i + 1)}</span>{x.key.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="card stack" style={{ gap: 12 }}>
        <span className="sublabel">{st.key}</span>
        <span className="h-sub" style={{ fontSize: 40 }}>{st.q}</span>
        <p style={{ margin: 0 }}>{st.d}</p>
        {st.ex ? (
          <div className="inset stack" style={{ padding: 20, gap: 6, marginTop: 8 }}>
            <span className="mono">EXAMPLE / {(s.example || "").toUpperCase()}</span>
            <span style={{ color: "#fff" }}>{st.ex}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Checklist({ headline, checks }) {
  const [on, setOn] = useState({});
  const n = Object.values(on).filter(Boolean).length;
  return (
    <div className="stack" style={{ gap: 14 }}>
      {headline ? <p className="lead" style={{ color: "#fff" }}>{headline}</p> : null}
      <div className="row" style={{ gap: 12 }}>
        <div className="progress" style={{ maxWidth: 320 }}><i style={{ width: `${(n / checks.length) * 100}%` }} /></div>
        <span className="mono">{n}/{checks.length}</span>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {checks.map((c, i) => (
          <label key={i} className="check">
            <input type="checkbox" checked={!!on[i]} onChange={(e) => setOn({ ...on, [i]: e.target.checked })} />
            <span>{c}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Gallery({ s }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="grid-auto" style={{ "--min": "120px", "--gap": "10px" }}>
        {s.images.map((im, i) => (
          <button key={im.src} type="button" onClick={() => setOpen(i)} style={{ all: "unset", cursor: "pointer", position: "relative" }} aria-label={`Open ${im.label}`}>
            <img className="frame-img" src={"../" + im.src} alt="" />
            <span className="badge">{pad(i + 1)}</span>
          </button>
        ))}
      </div>
      {s.pdf ? <a className="btn btn-ghost" style={{ alignSelf: "flex-start" }} href={"../" + s.pdf} target="_blank" rel="noopener">Open reference PDF</a> : null}
      {open !== null ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={s.images[open].label} onClick={() => setOpen(null)}>
          <img src={"../" + s.images[open].src} alt={s.images[open].label} />
        </div>
      ) : null}
    </div>
  );
}

function SectionBody({ s }) {
  switch (s.type) {
    case "scriptSteps":
      return <ScriptSteps s={s} />;
    case "points":
      return (
        <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 12 }}>
          {s.points.map((p, i) => <li key={i} className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start", gap: 14, color: "#fff" }}><span className="bullet" aria-hidden="true" />{p}</li>)}
        </ul>
      );
    case "pipeline":
      return (
        <div className="stack" style={{ gap: 20 }}>
          <div className="grid-auto" style={{ "--min": "180px", "--gap": "12px" }}>
            {s.steps.map((x) => (
              <div key={x.n} className="card stack" style={{ gap: 10, padding: 22 }}>
                <span className="mono" style={{ color: "var(--pm-red-300)" }}>STEP {x.n}</span>
                <span className="label">{x.title}</span>
                {x.desc ? <span style={{ fontSize: 15, lineHeight: 1.5 }}>{x.desc}</span> : null}
              </div>
            ))}
          </div>
          {s.exampleText ? <CopyBox title={s.exampleTitle} text={s.exampleText} /> : null}
        </div>
      );
    case "styleGuide": {
      const isUnits = (s.components || []).some((c) => c.n === "Frame");
      return (
        <div className="stack" style={{ gap: 20 }}>
          {isUnits ? <UnitExplorer /> : null}
          <div className="grid-auto" style={{ "--min": "240px", "--gap": "12px" }}>
            {(s.components || []).map((c) => (
              <div key={c.n + c.title} className="card stack" style={{ gap: 8, padding: 22 }}>
                <span className="sublabel">{c.n}</span>
                <span className="label">{c.title}</span>
                <span style={{ fontSize: 15, lineHeight: 1.55 }}>{c.desc}</span>
              </div>
            ))}
          </div>
          {s.example ? <div className="inset prompt" style={{ color: "#fff" }}>{s.example}</div> : null}
        </div>
      );
    }
    case "cameraTable": {
      const sim = s.rows.filter((r) => TQ.MOVES[r.move]).length >= 4;
      const axes = s.rows.some((r) => /shot size/i.test(r.move));
      return (
        <div className="stack" style={{ gap: 24 }}>
          {sim ? <CameraSimulator rows={s.rows} /> : null}
          {axes ? <ShotGallery /> : null}
          {!sim ? (
            <div className="table-box">
              <table className="table">
                <tbody>
                  {s.rows.map((r) => (
                    <tr key={r.move}><td>{r.move}</td><td>{r.use}</td><td style={{ color: "var(--text-muted)" }}>{r.desc}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      );
    }
    case "promptFormula":
      return (
        <div className="stack" style={{ gap: 20 }}>
          <div className="row" style={{ gap: 8 }}>
            {s.formula.map((f, i) => (
              <span key={f} className="row" style={{ gap: 8 }}>
                <span className="pill" style={{ cursor: "default", background: "var(--surface-card)" }}>{f.toUpperCase()}</span>
                {i < s.formula.length - 1 ? <span aria-hidden="true" style={{ color: "var(--pm-red)" }}>+</span> : null}
              </span>
            ))}
          </div>
          {s.exampleText ? <CopyBox title={s.exampleTitle} text={s.exampleText} negative={s.negative} /> : null}
        </div>
      );
    case "checklist":
      return <Checklist headline={s.headline} checks={s.checks} />;
    case "frameChain":
      return (
        <div className="stack" style={{ gap: 16 }}>
          {s.rows.map((r, i) => (
            <div key={i} className="stack" style={{ gap: 10 }}>
              <div className="row" style={{ gap: 10 }}>
                <span className="mono" style={{ width: 72 }}>{r.label.toUpperCase()}</span>
                {r.cells.map((c, j) => (
                  <span key={j} className="pill" style={{ cursor: "default", flex: "1 1 120px", justifyContent: "center", background: c.hot ? "var(--pm-red)" : "var(--surface-card)", borderColor: c.hot ? "var(--pm-red)" : "var(--border-hairline)", boxShadow: c.hot ? "var(--glow-red)" : "none" }}>{c.text.toUpperCase()}</span>
                ))}
              </div>
              {r.handoffAfter ? <span className="mono" style={{ paddingLeft: 82, color: "var(--pm-red-300)" }}>↓ HANDOFF · {r.handoffAfter.toUpperCase()}</span> : null}
            </div>
          ))}
          {(s.lines || []).map((l) => <p key={l} className="lead" style={{ color: "#fff" }}>{l}</p>)}
        </div>
      );
    case "repairLadder":
      return (
        <div className="stack" style={{ gap: 16 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="sublabel" style={{ color: "var(--status-success)" }}>{s.leftLabel}</span>
            <span className="sublabel">{s.rightLabel}</span>
          </div>
          <div className="grid-auto" style={{ "--min": "150px", "--gap": "10px" }}>
            {s.steps.map((x, i) => (
              <div key={x.n} className="card stack" style={{ gap: 8, padding: 20, borderColor: `rgba(236,28,36,${0.12 + i * 0.12})` }}>
                <span className="mono" style={{ color: "var(--pm-red-300)" }}>{x.n}</span>
                <span className="label">{x.title}</span>
                <span style={{ fontSize: 15, lineHeight: 1.5 }}>{x.desc}</span>
              </div>
            ))}
          </div>
          {s.exampleText ? <p className="lead" style={{ color: "#fff" }}>{s.exampleText}</p> : null}
        </div>
      );
    case "methods":
      return (
        <div className="stack" style={{ gap: 20 }}>
          <div className="grid-auto" style={{ "--min": "220px", "--gap": "12px" }}>
            {s.rows.map((r) => (
              <div key={r.method} className="card stack" style={{ gap: 10, padding: 22 }}>
                <span className="h-sub" style={{ fontSize: 26 }}>{r.method}</span>
                <span className="sublabel">Starts from · {r.start}</span>
                <span style={{ color: "#fff", fontSize: 15 }}>{r.strength}</span>
                <span style={{ fontSize: 15, color: "var(--text-muted)" }}>{r.use}</span>
              </div>
            ))}
          </div>
          {(s.keyframes || []).map((k) => (
            <div key={k.label} className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start", gap: 14 }}>
              <span className="bullet" aria-hidden="true" />
              <span><span style={{ color: "#fff" }}>{k.label}</span> <span style={{ color: "var(--text-muted)" }}>{k.use}</span></span>
            </div>
          ))}
        </div>
      );
    case "gallery":
      return <Gallery s={s} />;
    default:
      return null;
  }
}

/* ---------------- 02 · Lesson ---------------- */

function LessonScreen({ lv, s, setS }) {
  const block = sectionsOf(lv);
  const secs = block.sections;
  const [at, setAtRaw] = useState(() => Math.min((s.pos || {})[lv.id] || 0, Math.max(0, secs.length - 1)));
  const setAt = (i) => { setAtRaw(i); setS((p) => ({ ...p, pos: { ...(p.pos || {}), [lv.id]: i } })); };
  const done = s.done[lv.id] || [];
  const sec = secs[at];
  const idx = levelIndex(lv.id);
  const last = at === secs.length - 1;
  const mission = missionOf(lv);

  const avatar = avatarOf(s);
  const [reaction, setReaction] = useState(null);
  const markDone = () => {
    setReaction({ kind: "cheer", n: Date.now() });
    const nd = done.includes(at) ? done : [...done, at];
    const next = { ...s, done: { ...s.done, [lv.id]: nd } };
    if (!mission && nd.length === secs.length) {
      next.cleared = { ...s.cleared, [lv.id]: true };
      setS(next);
      go(`rankup/${lv.id}`);
      return;
    }
    if (last) { setS(next); if (mission) go(`level/${lv.id}/apply`); }
    else { setS({ ...next, pos: { ...(s.pos || {}), [lv.id]: at + 1 } }); setAtRaw(at + 1); window.scrollTo(0, 0); }
  };

  return (
    <div className="page">
      <div className="wrap row" style={{ gap: "12px 24px", paddingTop: 20 }}>
        <a className="btn btn-ghost btn-sm" href="#/map"><Back /> {t("Mission map")}</a>
        <div className="stack" style={{ flex: "1 1 240px" }}>
          <span className="mono">{lv.code.toUpperCase()} / LESSON · {fmtMin(levelMinutes(lv)).toUpperCase()}</span>
          <span style={{ color: "#fff" }}>{lv.name}</span>
        </div>
        <div className="row" style={{ flex: "1 1 260px", gap: 12 }}>
          <div className="progress" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={secs.length} aria-valuenow={done.length}>
            <i style={{ width: `${(done.length / (secs.length || 1)) * 100}%` }} />
          </div>
          <span className="mono" style={{ color: "#fff" }}>{done.length}/{secs.length}</span>
        </div>
      </div>

      <main className="wrap split" style={{ padding: "40px 32px 96px" }}>
        <nav className="side stack" aria-label="Lesson sections" style={{ gap: 8 }}>
          {has3D() ? (
            <div className="card row" style={{ padding: 0, overflow: "hidden", flexWrap: "nowrap", alignItems: "stretch", marginBottom: 8, background: "radial-gradient(ellipse at 30% 40%, #1a1112 0%, #161616 75%)" }}>
              <div style={{ width: 120, flex: "0 0 auto" }}><SoloDirector avatar={avatar} reaction={reaction} wave height={170} distance={4.6} /></div>
              <div className="stack" style={{ gap: 4, padding: "16px 16px 16px 0", justifyContent: "center" }}>
                <span className="sublabel">{t("Your guide")}</span>
                <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.35 }}>{done.length === secs.length ? `All done, ${directorName(s)}.` : done.length ? `${done.length} down, ${secs.length - done.length} to go.` : `Let's go, ${directorName(s)}.`}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("Mark each section done to earn XP.")}</span>
              </div>
            </div>
          ) : null}
          <span className="sublabel" style={{ color: "var(--text-muted)", padding: "0 4px 8px" }}>{t("Sections")}</span>
          {secs.map((x, i) => {
            const isDone = done.includes(i);
            return (
              <button key={i} type="button" className={`tile ${i === at ? "on" : ""}`} aria-current={i === at ? "step" : undefined} onClick={() => setAt(i)}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, minHeight: 64, padding: "12px 16px", borderRadius: 12, background: i === at ? "var(--surface-card)" : "transparent" }}>
                <span className={`icon-tile ${isDone || i === at ? "" : "muted"}`} style={isDone ? { background: "var(--status-success-solid)" } : null}>
                  {isDone ? <Check /> : x.n || pad(i + 1)}
                </span>
                <span className="stack" style={{ gap: 2, lineHeight: 1.35 }}>
                  <span style={{ fontSize: 15, color: "#fff" }}>{x.title}</span>
                  {x.summary ? <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{x.summary.length > 60 ? x.summary.slice(0, 58) + "…" : x.summary}</span> : null}
                </span>
              </button>
            );
          })}

          {mission ? (
            <a href={`#/level/${lv.id}/apply`} className="tile" style={{ gap: 8, padding: 16, marginTop: 12, textDecoration: "none" }}>
              <span className="sublabel">{t("Apply it")}</span>
              <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.35 }}>{mission.title}</span>
              <span className="row" style={{ gap: 10 }}>
                <span className="progress"><i style={{ width: `${(mission.steps.filter((st) => (s.stepDone || {})[`${lv.id}.${st.id}`]).length / mission.steps.length) * 100}%` }} /></span>
                <span className="mono" style={{ color: "#fff" }}>{mission.steps.filter((st) => (s.stepDone || {})[`${lv.id}.${st.id}`]).length}/{mission.steps.length}</span>
              </span>
            </a>
          ) : null}


          <div className="card stack" style={{ gap: 10, padding: 16, marginTop: 4 }}>
            <span className="sublabel" style={{ color: "var(--text-muted)" }}>{t("Tools for this level")}</span>
            {lv.tools.map((t) => PLATFORMS[t] ? (
              <a key={t} href={`#/toolkit/${t}`} className="row" style={{ gap: 12, color: "#fff", textDecoration: "none", flexWrap: "nowrap" }}>
                <Glyph id={t} size={36} />
                <span className="stack" style={{ lineHeight: 1.3 }}><span style={{ fontSize: 15 }}>{PLATFORMS[t].name}</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{PLATFORMS[t].tagline}</span></span>
              </a>
            ) : null)}
          </div>
        </nav>

        <article className="content stack" style={{ gap: 32 }} dir="auto">
          {sec ? (
            <React.Fragment key={`${lv.id}-${at}`}>
              <div className="stack reveal" style={{ gap: 8 }}>
                <span className="mono">SECTION {pad(at + 1)} OF {pad(secs.length)} · {fmtMin(sectionMinutes(sec))} READ</span>
                <h1 className="h-sub" style={{ fontSize: "clamp(36px, 4.4vw, 56px)" }}>{sec.title}</h1>
                {sec.summary ? <p className="lead">{sec.summary}</p> : null}
                <div><ListenButton text={`${sec.title}. ${sec.summary || ""}. ${textOf(sec)}`} /></div>
              </div>
              <div className="reveal" style={{ animationDelay: "120ms" }}><SectionBody s={sec} /></div>
            </React.Fragment>
          ) : (
            <p className="lead">{lv.mission}</p>
          )}
          <div className="row" style={{ justifyContent: "space-between", gap: 12, paddingTop: 24, borderTop: "1px solid var(--border-hairline)" }}>
            <button type="button" className="btn btn-ghost" disabled={at === 0} onClick={() => setAt(Math.max(0, at - 1))}>{t("Previous")}</button>
            {secs.length ? (
              <button type="button" className="btn btn-primary" onClick={markDone}>
                {last ? (mission ? t("Complete lesson · apply it") : t("Complete & clear level")) : t("Mark done & continue")} <Arrow />
              </button>
            ) : null}
          </div>
          {isLocked(idx, s) ? (
            <span className="mono">PREVIEW MODE — clear {LEVELS[idx - 1].code} to earn this rank.</span>
          ) : null}
        </article>
      </main>
    </div>
  );
}

/* ---------------- 03 · Apply the level (mission) ---------------- */

// Reads a learner's mission outputs. Paths look like "1.project.brand" or "2.board".
function missionCtx(apply) {
  const A = apply || {};
  const raw = (path) => {
    const [l, step, key] = path.split(".");
    const v = (A[l] || {})[step];
    return key ? (v || {})[key] : v;
  };
  return {
    get: (path) => {
      const v = raw(path);
      return Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v);
    },
    rows: (path) => {
      const v = raw(path);
      return Array.isArray(v) ? v.filter((r) => r && Object.values(r).some((x) => String(x || "").trim())) : [];
    },
  };
}
const filledStr = (v) => (Array.isArray(v) ? v.length > 0 : String(v || "").trim().length > 0);
const isEmptyVal = (v) => v == null ? true
  : Array.isArray(v) ? !v.some((r) => r && Object.values(r).some(filledStr))
  : typeof v === "object" ? !Object.values(v).some(filledStr) : !filledStr(v);
const LONG_COL = /visual|description|direction|line|action|motion/i;

// Rows a table step starts from: saved rows, else the seed (pulled from earlier work), else blanks.
function tableRows(step, value, ctx) {
  if (Array.isArray(value) && value.length) return value;
  const seeded = step.output.seed ? step.output.seed(ctx) : [];
  if (seeded.length) return seeded;
  return Array.from({ length: step.output.rows || 3 }, () => Object.fromEntries(step.output.columns.map((c) => [c, ""])));
}

function stepComplete(lvId, step, value, ctx, media) {
  const o = step.output;
  const files = (item) => media.filter((m) => m.key === `apply-${lvId}-${step.id}` && (item === undefined || m.item === item));
  switch (o.type) {
    case "fields": {
      const all = o.fields.every((f) => filledStr((value || {})[f.key]));
      if (o.requireAttach) return all && files().length > 0;
      return all || (o.attach && o.fields.length === 1 && files().length > 0);
    }
    case "table": {
      const rows = tableRows(step, value, ctx);
      return rows.length > 0 && rows.every((r) => o.columns.every((c) => filledStr(r[c])));
    }
    case "frames": {
      const base = ctx.rows(o.from);
      if (!base.length) return false;
      return base.every((_, i) => o.noAttach ? (o.columns || []).every((c) => filledStr(((value || [])[i] || {})[c])) : files(i).length > 0);
    }
    case "media":
      return files().length >= (o.min || 1);
    case "checks":
      return o.items.every((_, i) => (value || {})[i]);
    default:
      return false;
  }
}

function Chips({ options, value, multi, onChange, label }) {
  const on = (o) => (multi ? (value || []).includes(o) : value === o);
  const pick = (o) => onChange(multi ? (on(o) ? (value || []).filter((x) => x !== o) : [...(value || []), o]) : o);
  return (
    <div className="row" role="group" aria-label={label} style={{ gap: 6 }}>
      {options.map((o) => <button key={o} type="button" className="pill" aria-pressed={on(o)} onClick={() => pick(o)}>{o}</button>)}
    </div>
  );
}

function FieldsOut({ step, value, set }) {
  const v = value || {};
  return (
    <div className="grid-auto" style={{ "--min": "260px", "--gap": "16px" }}>
      {step.output.fields.map((f) => {
        const id = `mf-${step.id}-${f.key}`;
        return (
          <div key={f.key} className="stack" style={{ gap: 8, gridColumn: f.long || f.chips ? "1 / -1" : undefined }}>
            <label htmlFor={f.chips ? undefined : id} className="label">{f.label}</label>
            {f.chips
              ? <Chips label={f.label} options={f.chips} multi={f.multi} value={v[f.key]} onChange={(x) => set({ ...v, [f.key]: x })} />
              : f.long
              ? <textarea id={id} className="field" rows={3} placeholder={f.hint} value={v[f.key] || ""} onChange={(e) => set({ ...v, [f.key]: e.target.value })} />
              : <input id={id} className="field" type="text" placeholder={f.hint} value={v[f.key] || ""} onChange={(e) => set({ ...v, [f.key]: e.target.value })} />}
          </div>
        );
      })}
    </div>
  );
}

function RowEditor({ idx, cols, chips, row, onChange, onRemove, children, title }) {
  return (
    <div className="card stack" style={{ gap: 14, padding: 20, background: "var(--surface-card)" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
        <span className="label">{title || `Frame ${pad(idx + 1)}`}</span>
        {onRemove ? <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove} aria-label={`${t("Remove")} ${title || `frame ${idx + 1}`}`}>{t("Remove")}</button> : null}
      </div>
      <div className="grid-auto" style={{ "--min": "180px", "--gap": "12px" }}>
        {cols.map((c) => {
          const id = `mr-${idx}-${c}`.replace(/\W+/g, "-");
          const long = LONG_COL.test(c);
          return (
            <div key={c} className="stack" style={{ gap: 6, gridColumn: long ? "1 / -1" : undefined }}>
              <label htmlFor={id} className="mono">{c.toUpperCase()}</label>
              {chips && chips[c]
                ? (
                  <select id={id} className="field" value={row[c] || ""} onChange={(e) => onChange({ ...row, [c]: e.target.value })}>
                    <option value="">—</option>
                    {chips[c].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )
                : long
                ? <textarea id={id} className="field" rows={2} value={row[c] || ""} onChange={(e) => onChange({ ...row, [c]: e.target.value })} />
                : <input id={id} className="field" type="text" value={row[c] || ""} onChange={(e) => onChange({ ...row, [c]: e.target.value })} />}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}

function TableOut({ step, value, set, ctx }) {
  const o = step.output;
  const rows = tableRows(step, value, ctx);
  const put = (i, r) => set(rows.map((x, k) => (k === i ? r : x)));
  return (
    <div className="stack" style={{ gap: 12 }}>
      {rows.map((r, i) => (
        <RowEditor key={i} idx={i} cols={o.columns} chips={o.chips} row={r} onChange={(nr) => put(i, nr)}
          title={o.columns[0] === "Line" ? `Line ${pad(i + 1)}` : undefined}
          onRemove={rows.length > 1 ? () => set(rows.filter((_, k) => k !== i)) : null} />
      ))}
      <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => set([...rows, Object.fromEntries(o.columns.map((c) => [c, ""]))])}>+ {t("Add row")}</button>
    </div>
  );
}

function FramesOut({ lv, step, value, set, ctx, mission, media }) {
  const o = step.output;
  const base = ctx.rows(o.from);
  const extra = Array.isArray(value) ? value : [];
  const promptStep = o.promptFrom ? mission.steps.find((x) => x.id === o.promptFrom) : step;
  const promptExtra = o.promptFrom ? ((ctx.raw && ctx.raw(`${lv.id}.${o.promptFrom}`)) || []) : extra;
  return (
    <div className="stack" style={{ gap: 12 }}>
      {base.map((r, i) => {
        const row = { ...r, ...(promptExtra[i] || {}) };
        const prompt = promptStep && promptStep.output.prompt ? promptStep.output.prompt(ctx, row, i) : null;
        return (
          <RowEditor key={i} idx={i} cols={o.columns || []} row={extra[i] || {}} onChange={(nr) => { const next = base.map((_, k) => extra[k] || {}); next[i] = nr; set(next); }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>{r["Visual Description"] || ""}{r["Shot Type"] ? ` · ${r["Shot Type"]}` : ""}{r["Camera Movement"] ? ` · ${r["Camera Movement"]}` : ""}</p>
            {prompt ? <CopyBox title={`${t("Prompt")} · Frame ${pad(i + 1)}`} text={prompt} /> : null}
            {!o.noAttach ? <AttachMedia refKey={`apply-${lv.id}-${step.id}`} level={lv.id} item={i} media={media} accept={o.accept || "image/*"} /> : null}
          </RowEditor>
        );
      })}
    </div>
  );
}

function ChecksOut({ step, value, set }) {
  const v = value || {};
  return (
    <div className="stack" style={{ gap: 8 }}>
      {step.output.items.map((x, i) => (
        <label key={i} className="check">
          <input type="checkbox" checked={!!v[i]} onChange={(e) => set({ ...v, [i]: e.target.checked })} />
          <span>{x}</span>
        </label>
      ))}
    </div>
  );
}

function CarryPanel({ ctx, path, cols, onExample }) {
  const [l] = path.split(".");
  const rows = ctx.rows(path);
  if (!rows.length) {
    return (
      <div className="inset row" style={{ padding: 16, gap: 12, justifyContent: "space-between" }}>
        <span style={{ fontSize: 15 }}>{t("This step builds on your Level")} {pad(l)} {t("work, which is still empty.")}</span>
        <span className="row" style={{ gap: 8 }}>
          <a className="btn btn-ghost btn-sm" href={`#/level/${l}/apply`}>{t("Go to Level")} {pad(l)}</a>
          <button type="button" className="btn btn-primary btn-sm" onClick={onExample}>{t("Use the MAZAJ example")}</button>
        </span>
      </div>
    );
  }
  return (
    <details className="inset" style={{ padding: "12px 16px" }}>
      <summary className="mono" style={{ cursor: "pointer", color: "#fff" }}>{t("Your Level")} {pad(l)} {t("work")} · {rows.length}</summary>
      <div className="table-box" style={{ marginTop: 12 }}>
        <table className="table" style={{ fontSize: 14 }}>
          <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{cols.map((c) => <td key={c}>{r[c] || "—"}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </details>
  );
}

function MissionScreen({ lv, stepIdx, s, setS }) {
  const mission = missionOf(lv);
  const media = useMedia();
  const A = s.apply || {};
  const ctx = missionCtx(A);
  ctx.raw = (path) => { const [l, step] = path.split("."); return (A[l] || {})[step]; };
  const steps = mission.steps;
  const reviewIdx = steps.length;
  const [at, setAtRaw] = useState(() => Math.min(stepIdx != null && !isNaN(stepIdx) ? stepIdx : (s.pos || {})[`apply-${lv.id}`] || 0, reviewIdx));
  const setAt = (i) => { setAtRaw(i); window.scrollTo(0, 0); setS((p) => ({ ...p, pos: { ...(p.pos || {}), [`apply-${lv.id}`]: i } })); };
  const [reaction, setReaction] = useState(null);

  const complete = steps.map((st) => stepComplete(lv.id, st, (A[lv.id] || {})[st.id], ctx, media));
  const doneCount = complete.filter(Boolean).length;
  const review = (s.review || {})[lv.id] || {};
  const reviewOk = mission.review.every((_, i) => review[i]);
  const ready = doneCount === steps.length && reviewOk;

  // record completed steps (XP) and cheer when a step turns complete
  const prev = useRef(doneCount);
  useEffect(() => {
    const sd = { ...(s.stepDone || {}) };
    let changed = false;
    steps.forEach((st, i) => { const k = `${lv.id}.${st.id}`; if (!!sd[k] !== complete[i]) { sd[k] = complete[i]; changed = true; } });
    if (changed) setS((p) => ({ ...p, stepDone: sd }));
    if (doneCount > prev.current) setReaction({ kind: doneCount === steps.length ? "celebrate" : "cheer", n: Date.now() });
    prev.current = doneCount;
  }, [complete.join()]);

  const setStep = (id, v) => setS((p) => ({ ...p, apply: { ...(p.apply || {}), [lv.id]: { ...((p.apply || {})[lv.id] || {}), [id]: v } } }));
  const useExample = () => {
    const EX = window.TQ_EXAMPLE;
    setS((p) => ({ ...p, apply: { ...(p.apply || {}), 1: { ...((p.apply || {})[1] || {}), project: EX.project, platform: EX.platform, script: EX.script } } }));
  };
  const wrap = () => {
    setS({ ...s, missionDone: { ...(s.missionDone || {}), [lv.id]: true }, cleared: { ...s.cleared, [lv.id]: true } });
    go(`rankup/${lv.id}`);
  };
  const project = ctx.get("1.project.brand");
  const st = steps[at];

  return (
    <div className="page">
      <div className="wrap row" style={{ gap: "12px 24px", paddingTop: 20 }}>
        <a className="btn btn-ghost btn-sm" href={`#/level/${lv.id}`}><Back /> {t("Lesson")}</a>
        <div className="stack" style={{ flex: "1 1 260px" }}>
          <span className="mono">{lv.code.toUpperCase()} / {T_("Apply the level")}{project ? ` · ${project.toUpperCase()}` : ""}</span>
          <span style={{ color: "#fff" }}>{mission.title}</span>
        </div>
        <div className="row" style={{ flex: "0 1 260px", gap: 12 }}>
          <div className="progress" role="progressbar" aria-label={t("Mission progress")} aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount}><i style={{ width: `${(doneCount / steps.length) * 100}%` }} /></div>
          <span className="mono" style={{ color: "#fff" }}>{doneCount}/{steps.length}</span>
        </div>
        <button type="button" className="btn btn-primary btn-sm" disabled={!ready} onClick={wrap}>{t("Wrap mission")}</button>
      </div>

      <main className="wrap split" style={{ padding: "36px 32px 96px" }}>
        <nav className="side stack" aria-label={t("Mission steps")} style={{ gap: 8 }}>
          {has3D() ? (
            <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 8, background: "radial-gradient(ellipse at 50% 40%, #1a1112 0%, #161616 75%)" }}>
              <SoloDirector avatar={avatarOf(s)} reaction={reaction} height={190} distance={5} />
            </div>
          ) : null}
          <div className="card stack" style={{ gap: 6, padding: 16, marginBottom: 8 }}>
            <span className="sublabel">{t("Deliverable")}</span>
            <span style={{ fontSize: 15, color: "#fff", lineHeight: 1.45 }}>{mission.deliverable}</span>
          </div>
          {[...steps, { id: "review", title: t("Review your work") }].map((x, i) => {
            const ok = i < reviewIdx ? complete[i] : reviewOk;
            return (
              <button key={x.id} type="button" className={`tile ${i === at ? "on" : ""}`} aria-current={i === at ? "step" : undefined} onClick={() => setAt(i)}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, minHeight: 60, padding: "10px 14px", borderRadius: 12, background: i === at ? "var(--surface-card)" : "transparent" }}>
                <span className={`icon-tile ${ok || i === at ? "" : "muted"}`} style={ok ? { background: "var(--status-success-solid)" } : null}>{ok ? <Check /> : i < reviewIdx ? pad(i + 1) : "✓"}</span>
                <span style={{ fontSize: 15, color: "#fff", lineHeight: 1.35 }}>{x.title}</span>
              </button>
            );
          })}
        </nav>

        <article className="content stack" style={{ gap: 24 }} dir="auto">
          {st ? (
            <React.Fragment key={st.id}>
              <div className="stack reveal" style={{ gap: 10 }}>
                <span className="mono">{T_("Step")} {pad(at + 1)} / {pad(steps.length)}{complete[at] ? ` · ${T_("Done")}` : ""}</span>
                <h1 className="h-sub" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>{st.title}</h1>
                <div className="card stack" style={{ gap: 6, padding: 20 }}>
                  <span className="sublabel">{t("Do this")}</span>
                  <p style={{ margin: 0, color: "#fff" }}>{st.do}</p>
                </div>
              </div>

              {st.tools ? (
                <div className="row" style={{ gap: 8 }}>
                  {st.tools.filter((id) => PLATFORMS[id]).map((id) => (
                    PLATFORMS[id].url
                      ? <a key={id} className="tool-chip" href={PLATFORMS[id].url} target="_blank" rel="noopener" style={{ textDecoration: "none", padding: "6px 12px 6px 6px", fontSize: 14 }}><Glyph id={id} size={26} />{t("Open")} {PLATFORMS[id].name} ↗</a>
                      : <a key={id} className="tool-chip" href={`#/toolkit/${id}`} style={{ textDecoration: "none", padding: "6px 12px 6px 6px", fontSize: 14 }}><Glyph id={id} size={26} />{PLATFORMS[id].name}</a>
                  ))}
                </div>
              ) : null}

              {st.carry ? <CarryPanel ctx={ctx} path={st.carry} cols={st.carry === "1.script" ? ["Duration", "VO / Text", "Visual Description", "Camera", "Mood"] : []} onExample={useExample} /> : null}
              {st.output.type === "frames" && !ctx.rows(st.output.from).length ? <CarryPanel ctx={ctx} path={st.output.from} cols={[]} onExample={useExample} /> : null}

              {st.prompt ? <CopyBox title={t("Prompt — filled with your work")} text={st.prompt(ctx)} /> : null}

              {st.example && isEmptyVal((A[lv.id] || {})[st.id]) ? (
                <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={useExample}>{t("Use the MAZAJ example")}</button>
              ) : null}

              <section aria-label={t("Your output")} className="stack" style={{ gap: 14 }}>
                <span className="label">{t("Your output")}</span>
                {st.output.type === "fields" ? <FieldsOut step={st} value={(A[lv.id] || {})[st.id]} set={(v) => setStep(st.id, v)} /> : null}
                {st.output.type === "table" ? <TableOut step={st} value={(A[lv.id] || {})[st.id]} set={(v) => setStep(st.id, v)} ctx={ctx} /> : null}
                {st.output.type === "frames" ? <FramesOut lv={lv} step={st} value={(A[lv.id] || {})[st.id]} set={(v) => setStep(st.id, v)} ctx={ctx} mission={mission} media={media} /> : null}
                {st.output.type === "checks" ? <ChecksOut step={st} value={(A[lv.id] || {})[st.id]} set={(v) => setStep(st.id, v)} /> : null}
                {st.output.type === "media" || st.output.attach ? <AttachMedia refKey={`apply-${lv.id}-${st.id}`} level={lv.id} item={0} media={media} accept={st.output.accept || "image/*,video/*"} /> : null}
              </section>

              {st.rules ? (
                <div className="inset stack" style={{ padding: 20, gap: 10 }}>
                  <span className="mono">{T_("From the lesson")}</span>
                  {st.rules.map((r) => <span key={r} className="row" style={{ gap: 12, flexWrap: "nowrap", alignItems: "flex-start", color: "#fff", fontSize: 15 }}><span className="bullet" aria-hidden="true" />{r}</span>)}
                </div>
              ) : null}
            </React.Fragment>
          ) : (
            <div className="stack reveal" style={{ gap: 20 }}>
              <span className="mono">{T_("Review your work")}</span>
              <h1 className="h-sub" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>{t("Would a director sign this off?")}</h1>
              <div className="stack" style={{ gap: 8 }}>
                {steps.map((x, i) => (
                  <button key={x.id} type="button" className="row" onClick={() => setAt(i)} style={{ all: "unset", cursor: "pointer", display: "flex", gap: 12, alignItems: "center", color: complete[i] ? "#fff" : "var(--pm-red-300)", fontSize: 15 }}>
                    <span className="ring-dot" style={{ color: complete[i] ? "var(--status-success)" : "var(--pm-red)" }} aria-hidden="true" />
                    {x.title} — {complete[i] ? t("done") : t("still to do")}
                  </button>
                ))}
              </div>
              <span className="label">{t("Check your work against the level")}</span>
              <div className="stack" style={{ gap: 8 }}>
                {mission.review.map((r, i) => (
                  <label key={i} className="check">
                    <input type="checkbox" checked={!!review[i]} onChange={(e) => setS({ ...s, review: { ...(s.review || {}), [lv.id]: { ...review, [i]: e.target.checked } } })} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
              <div className="row" style={{ gap: 12 }}>
                <button type="button" className="btn btn-primary" disabled={!ready} onClick={wrap}>{t("Wrap mission")} <Arrow /></button>
                <a className="btn btn-ghost" href={UPLOAD_URL} target="_blank" rel="noopener">{t("Upload to the class folder")}</a>
              </div>
            </div>
          )}

          <div className="row" style={{ justifyContent: "space-between", gap: 12, paddingTop: 24, borderTop: "1px solid var(--border-hairline)" }}>
            <button type="button" className="btn btn-ghost" disabled={at === 0} onClick={() => setAt(Math.max(0, at - 1))}>{t("Previous")}</button>
            {at < reviewIdx ? <button type="button" className="btn btn-primary" onClick={() => setAt(at + 1)}>{at === reviewIdx - 1 ? t("Review your work") : t("Next step")} <Arrow /></button> : null}
          </div>
        </article>
      </main>
    </div>
  );
}

/* ---------------- 05 · Rank up ---------------- */

function RankUpScreen({ lv, s }) {
  const idx = levelIndex(lv.id);
  const next = LEVELS[idx + 1];
  const [shared, setShared] = useState(false);
  const share = () => {
    const text = `${directorName(s)} just earned the ${lv.rank} rank in The Director's Game.`;
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setShared(true);
  };
  return (
    <div className="page">
      <span className="ring" style={{ left: "50%", top: 120, width: 1100, height: 1100, marginLeft: -550 }} />
      <span className="ring" style={{ left: "50%", top: 260, width: 820, height: 820, marginLeft: -410 }} />
      <main className="wrap stack" style={{ position: "relative", maxWidth: 960, alignItems: "center", textAlign: "center", gap: 48, padding: "96px 32px" }}>
        <div className="stack reveal" style={{ alignItems: "center", gap: 28 }}>
          <span className="mono" style={{ color: "var(--pm-red-300)", letterSpacing: ".06em" }}>{lv.code.toUpperCase()} CLEARED / {lv.name.toUpperCase()}</span>
          {has3D() ? (
            <div style={{ width: "min(100%, 420px)" }}><SoloDirector avatar={avatarOf(s)} celebrate height={340} /></div>
          ) : (
          <div role="img" aria-label={`${lv.rank} rank badge`} style={{ position: "relative", width: 220, height: 220, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--glow-red-strong)" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "16px solid #ec1c24" }} />
            <span style={{ position: "absolute", inset: 38, borderRadius: "50%", border: "12px solid #ec1c24" }} />
            <span style={{ position: "absolute", inset: 72, borderRadius: "50%", background: "#ec1c24" }} />
            <span style={{ position: "relative", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 22 }}>{pad(idx + 1)}</span>
          </div>
          )}
          <KickerTitle kicker={`${directorName(s)}, ${t("you are now a")}`} size="h-display">{lv.rank}</KickerTitle>
        </div>
        <div className="grid-auto reveal" style={{ "--min": "200px", "--gap": "16px", width: "100%", animationDelay: "200ms" }}>
          {[["+500", "XP earned"], [`${clearedCount(s)}/${LEVELS.length}`, "Levels cleared"], [xpOf(s).toLocaleString("en-US"), "Total XP"]].map(([v, k]) => (
            <div key={k} className="card stack" style={{ gap: 4, padding: 24 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 40, color: "#fff", lineHeight: 1.2 }}>{v}</span>
              <span style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--text-muted)", textTransform: "uppercase" }}>{t(k)}</span>
            </div>
          ))}
        </div>
        {lv.id === 3 || /visual crafting/i.test(lv.name) ? (
          <div className="scroll-x reveal" style={{ width: "100%", animationDelay: "300ms" }}>
            <div className="strip" style={{ margin: "0 auto" }}>
              {Array.from({ length: 15 }, (_, i) => <img key={i} src={TQ.F(i + 1)} alt="" style={{ width: 68, height: 120, objectFit: "cover", borderRadius: 6 }} />)}
            </div>
          </div>
        ) : null}
        <div className="card card-xl row reveal" style={{ width: "100%", gap: 24, textAlign: "left", animationDelay: "400ms" }}>
          {next ? (
            <>
              <span className="icon-tile" style={{ width: 56, height: 56 }}>{pad(idx + 2)}</span>
              <div className="stack" style={{ flex: "1 1 320px", gap: 4 }}>
                <span className="sublabel">Unlocked</span>
                <span className="h-sub">{next.code} — {next.name}</span>
                <span style={{ fontSize: 15 }}>{next.tools.map((t) => (PLATFORMS[t] ? PLATFORMS[t].name : t)).join(" · ")}</span>
              </div>
            </>
          ) : (
            <div className="stack" style={{ flex: "1 1 320px", gap: 4 }}>
              <span className="sublabel">{t("Track complete")}</span>
              <span className="h-sub">{t("Every mission cleared")}</span>
            </div>
          )}
          <div className="row" style={{ gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={share}>{shared ? t("Copied to clipboard") : t("Share badge")}</button>
            <a className="btn btn-primary" href={next ? `#/level/${next.id}` : "#/workshop/certificates"}>{next ? `${t("Start")} ${next.code}` : t("Claim your certificate")} <Arrow /></a>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- 06 · Toolkit ---------------- */

function ScreenshotSlot({ id, name, host }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className="inset" style={{ overflow: "hidden" }}>
      <div className="row" style={{ gap: 12, flexWrap: "nowrap", padding: "12px 16px", background: "#111", borderBottom: "1px solid var(--border-hairline)" }}>
        <span className="row" aria-hidden="true" style={{ gap: 6, flexWrap: "nowrap" }}>
          {[0, 1, 2].map((k) => <span key={k} style={{ width: 10, height: 10, borderRadius: "50%", background: "#2a2a2a" }} />)}
        </span>
        <span className="mono" style={{ flex: "1 1 auto", padding: "6px 12px", borderRadius: 999, background: "var(--surface-card)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{host}</span>
      </div>
      {!missing ? (
        <img src={`../assets/screenshots/${id}.png`} alt={`${name} screenshot`} onError={() => setMissing(true)} style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
      ) : (
        <div className="stack" style={{ aspectRatio: "16 / 9", alignItems: "center", justifyContent: "center", gap: 10, padding: 24, textAlign: "center", outline: "1px dashed var(--border-hairline)", outlineOffset: -16 }}>
          <svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></svg>
          <span className="label">[Screenshot — {name}]</span>
          <span className="mono">Add assets/screenshots/{id}.png</span>
        </div>
      )}
    </div>
  );
}

function ToolOutput({ id }) {
  const o = TQ.TOOL_OUTPUT[id];
  if (!o) return null;
  return (
    <div className="stack" style={{ gap: 12 }}>
      <span className="label">What it makes in this course</span>
      {o.kind === "text" ? (
        <div className="table-box" style={{ background: "#000" }}>
          <table className="table" style={{ minWidth: 520, fontFamily: "var(--font-mono)", fontSize: 14 }}>
            <thead><tr><th>Frame</th><th>Duration</th><th>VO / Text</th><th>Visual</th></tr></thead>
            <tbody>
              <tr><td>01</td><td>3s</td><td>Another Monday…</td><td>Jamila in bed, half asleep</td></tr>
              <tr><td>02</td><td>3s</td><td>—</td><td>Hand opens the fridge</td></tr>
              <tr><td>03</td><td>2s</td><td>Psst.</td><td>MAZAJ can cracks open</td></tr>
            </tbody>
          </table>
        </div>
      ) : o.kind === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
          {o.frames.map(([n, label]) => <img key={n} className="frame-img" src={TQ.F(n)} alt={label || `Frame ${pad(n)}`} style={{ borderRadius: 12 }} />)}
        </div>
      ) : (
        <div className="row" style={{ gap: 12, alignItems: "stretch" }}>
          {o.frames.map(([n, label]) => (
            <div key={n} className="photo" style={{ flex: "1 1 160px", maxWidth: 220, borderRadius: 12, border: "1px solid var(--border-hairline)" }}>
              <img src={TQ.F(n)} alt={label} style={{ aspectRatio: "9 / 16" }} />
              <span aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", width: 56, height: 56, margin: "-28px 0 0 -28px", borderRadius: "50%", background: "rgba(20,20,20,.82)", border: "1px solid rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="cap mono" style={{ color: "#fff", fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      )}
      <span className="mono">{o.note}</span>
    </div>
  );
}

const TOOL_PROP = {
  gemini: 0, chatgpt: 0,
  firefly: 2, "nano-banana": 2, "gpt-image": 2,
  kling: 3, veo: 3, seedance: 3, "seedance-2.5": 3, "gemini-omni": 3, "firefly-video": 3,
  elevenlabs: 4, "firefly-audio": 4, artlist: 4,
  canva: 5, "firefly-timeline": 5, capcut: 5, premiere: 5, magnifica: 2, arcana: 2,
};
function PropTurntable({ index }) {
  const el = useRef(), w = useRef();
  useEffect(() => {
    if (!has3D()) return;
    w.current = window.World3D.createProp(el.current, { prop: index });
    return () => w.current && w.current.dispose();
  }, []);
  useEffect(() => { w.current && w.current.setProp(index); }, [index]);
  if (!has3D()) return null;
  return <div ref={el} style={{ width: "100%", height: 220 }} aria-hidden="true" />;
}

function ToolkitScreen({ initial }) {
  const ids = [...new Set(LEVELS.flatMap((l) => l.tools))].filter((t) => PLATFORMS[t]);
  const levelsOf = (t) => LEVELS.filter((l) => l.tools.includes(t)).map((l) => l.id);
  const [level, setLevel] = useState(0);
  const [tool, setTool] = useState(initial && PLATFORMS[initial] ? initial : ids[0]);
  const visible = ids.filter((t) => level === 0 || levelsOf(t).includes(level));
  const p = PLATFORMS[tool];
  const host = p.url ? p.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : p.name;
  return (
    <div className="page">
      <span className="ring" style={{ top: -200, right: -160, width: 560, height: 560 }} />
      <main className="wrap stack" style={{ position: "relative", gap: 36, padding: "56px 32px 96px" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "end", gap: 16 }}>
          <KickerTitle kicker="Your">Director's Toolkit</KickerTitle>
          <div className="row" role="group" aria-label="Filter by level" style={{ gap: 4 }}>
            {[0, ...LEVELS.map((l) => l.id)].map((id) => (
              <button key={id} type="button" className="pill" aria-pressed={id === level}
                onClick={() => { setLevel(id); if (id && !levelsOf(tool).includes(id)) { const f = ids.find((t) => levelsOf(t).includes(id)); if (f) setTool(f); } }}>
                {id ? `L${pad(id)}` : "ALL"}
              </button>
            ))}
          </div>
        </div>

        <div role="tablist" aria-label="Tools" className="grid-auto" style={{ "--min": "160px", "--gap": "12px" }}>
          {visible.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={t === tool} className={`tile ${t === tool ? "on" : ""}`} onClick={() => setTool(t)} style={{ padding: 18, gap: 14 }}>
              <Glyph id={t} size={48} />
              <span className="stack" style={{ lineHeight: 1.3 }}>
                <span style={{ fontSize: 17, color: "#fff" }}>{PLATFORMS[t].name}</span>
                <span style={{ fontSize: 11, letterSpacing: ".16em", color: t === tool ? "var(--pm-red-300)" : "var(--text-muted)" }}>{levelsOf(t).map((id) => `L${pad(id)}`).join(" · ")}</span>
              </span>
            </button>
          ))}
        </div>

        <section aria-label={p.name} className="card card-xl row" style={{ gap: 32, alignItems: "flex-start" }}>
          <div className="stack" style={{ flex: "999 1 520px", minWidth: 0, gap: 20 }}>
            <ScreenshotSlot key={tool} id={tool} name={p.name} host={host} />
            <ToolOutput id={tool} />
          </div>
          <div className="stack" style={{ flex: "1 1 320px", gap: 18 }}>
            {has3D() ? (
              <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", background: "radial-gradient(ellipse at 50% 45%, #1a1112 0%, #111 75%)", border: "1px solid var(--border-hairline)" }}>
                <PropTurntable index={TOOL_PROP[tool] ?? 3} />
              </div>
            ) : null}
            <div className="row" style={{ gap: 16, flexWrap: "nowrap" }}>
              <Glyph id={tool} size={72} />
              <div className="stack" style={{ gap: 2 }}>
                <h2 className="h-sub" style={{ fontSize: 40 }}>{p.name}</h2>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{p.vendor}</span>
              </div>
            </div>
            <span className="sublabel" style={{ alignSelf: "flex-start", padding: "6px 12px", borderRadius: 6, background: "rgba(236,28,36,.14)", color: "var(--pm-red-200)" }}>{p.tagline}</span>
            <p style={{ margin: 0 }}>{p.about}</p>
            <div className="stack" style={{ gap: 10 }}>
              <span className="label">How you use it</span>
              <ol className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 8 }}>
                {(p.usage || []).map((u, j) => (
                  <li key={u} className="row" style={{ gap: 12, flexWrap: "nowrap", padding: "12px 14px", borderRadius: 12, background: "var(--surface-card)", border: "1px solid var(--border-hairline)", fontSize: 15, color: "#fff" }}>
                    <span className="mono" style={{ color: "var(--pm-red-300)" }}>{pad(j + 1)}</span>{u}
                  </li>
                ))}
              </ol>
            </div>
            {p.url ? <a className="btn btn-primary" style={{ alignSelf: "flex-start" }} href={p.url} target="_blank" rel="noopener">Open {p.name} <Arrow /></a> : null}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------------- My reel ---------------- */

function ReelScreen() {
  const media = useMedia();
  const [open, setOpen] = useState(null);
  const byLevel = LEVELS.map((l) => ({ l, items: media.filter((m) => String(m.level) === String(l.id)) })).filter((g) => g.items.length);
  const extra = media.filter((m) => !LEVELS.some((l) => String(l.id) === String(m.level)));
  if (extra.length) byLevel.push({ l: { id: "lab", code: "Final project", name: "" }, items: extra });
  const fileName = (m) => m.kind === "image" ? (m.name || `director-${m.id}`).replace(/\.[^.]+$/, "") + ".jpg" : (m.name || `director-${m.id}`);
  const download = (m) => {
    const a = document.createElement("a");
    const url = m.kind === "image" ? m.data : URL.createObjectURL(m.data);
    a.href = url; a.download = fileName(m); a.click();
    if (m.kind !== "image") setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  return (
    <div className="page">
      <span className="ring" style={{ top: -200, right: -160, width: 560, height: 560 }} />
      <main className="wrap stack" style={{ position: "relative", gap: 32, padding: "56px 32px 96px" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "end", gap: 16 }}>
          <div className="stack" style={{ gap: 8 }}>
            <h1 className="h-sub" style={{ fontSize: "clamp(36px, 4.4vw, 56px)" }}>{t("My reel")}</h1>
            <p className="lead">{t("Your work, saved in this browser.")}</p>
          </div>
          <a className="btn btn-primary" href={UPLOAD_URL} target="_blank" rel="noopener">{t("Upload to the class folder")} <Arrow /></a>
        </div>
        {!byLevel.length ? (
          <div className="card stack" style={{ alignItems: "center", textAlign: "center", gap: 12, padding: 48 }}>
            <span className="icon-tile" style={{ width: 56, height: 56 }}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.75"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></svg></span>
            <p style={{ margin: 0, color: "#fff" }}>{t("Nothing here yet — attach images and clips in any challenge.")}</p>
          </div>
        ) : byLevel.map(({ l, items }) => (
          <section key={l.id} className="stack" style={{ gap: 14 }}>
            <span className="mono">{String(l.code).toUpperCase()}{l.name ? ` / ${l.name.toUpperCase()}` : ""} · {items.length}</span>
            <div className="scroll-x"><div className="strip">
              {items.map((m) => (
                <div key={m.id} className="stack" style={{ gap: 6 }}>
                  <button type="button" onClick={() => setOpen(m)} style={{ all: "unset", cursor: "pointer" }} aria-label={m.name || "Open"}><MediaThumb m={m} size={150} /></button>
                  <button type="button" className="mono" onClick={() => download(m)} style={{ all: "unset", cursor: "pointer", color: "var(--pm-red-300)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{T_("Download")}</button>
                </div>
              ))}
            </div></div>
          </section>
        ))}
        {open ? (
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.name || ""} onClick={() => setOpen(null)}>
            {open.kind === "image" ? <img src={open.data} alt={open.name || ""} /> : <MediaThumb m={open} size={360} />}
          </div>
        ) : null}
      </main>
    </div>
  );
}

/* ---------------- Final project (labs) ---------------- */

function LabsScreen({ s, setS }) {
  const labs = window.LABS || [];
  const ideas = window.SPRINT_IDEAS || [];
  const media = useMedia();
  const setDone = (k, v) => setS({ ...s, labs: { ...(s.labs || {}), [k]: v } });
  return (
    <div className="page">
      <span className="ring" style={{ top: -220, left: -200, width: 620, height: 620 }} />
      <main className="wrap stack" style={{ position: "relative", gap: 40, padding: "56px 32px 96px" }}>
        {labs.map((lab) => {
          const done = lab.steps.filter((_, i) => s.labs && s.labs[`${lab.id}-${i}`]).length;
          return (
            <section key={lab.id} className="stack" style={{ gap: 24 }}>
              <div className="split" style={{ gap: 28 }}>
                <div className="content stack" style={{ gap: 12 }}>
                  <span className="mono">{lab.tag.toUpperCase()} · {lab.duration.toUpperCase()}</span>
                  <h1 className="h-sub" style={{ fontSize: "clamp(36px, 4.4vw, 56px)" }}>{lab.title}</h1>
                  <p className="lead">{lab.subtitle}</p>
                  <div className="inset" style={{ padding: 20 }}><span className="sublabel">Goal</span><p style={{ margin: "6px 0 0", color: "#fff" }}>{lab.goal}</p></div>
                </div>
                {has3D() ? (
                  <div className="card side" style={{ flex: "0 1 260px", padding: 0, overflow: "hidden", background: "radial-gradient(ellipse at 50% 40%, #1a1112 0%, #161616 75%)" }}>
                    <SoloDirector avatar={avatarOf(s)} reaction={done === lab.steps.length ? { kind: "celebrate", n: done } : done ? { kind: "cheer", n: done } : null} height={260} distance={5} />
                    <div className="row" style={{ gap: 10, padding: "0 16px 16px" }}>
                      <div className="progress"><i style={{ width: `${(done / lab.steps.length) * 100}%` }} /></div>
                      <span className="mono" style={{ color: "#fff" }}>{done}/{lab.steps.length}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {ideas.length ? (
                <div className="stack" style={{ gap: 12 }}>
                  <span className="label">{t("Pick your format")}</span>
                  <div className="grid-auto" style={{ "--min": "220px", "--gap": "12px" }}>
                    {ideas.map((x) => (
                      <button key={x.k} type="button" className={`tile ${s.labs && s.labs.format === x.k ? "on" : ""}`} aria-pressed={!!(s.labs && s.labs.format === x.k)} onClick={() => setS({ ...s, labs: { ...(s.labs || {}), format: x.k } })} style={{ padding: 20, gap: 8 }}>
                        <span className="label">{x.k}</span>
                        <span style={{ fontSize: 15 }}>{x.d}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <ol className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 12 }}>
                {lab.steps.map((st, i) => {
                  const k = `${lab.id}-${i}`, on = !!(s.labs && s.labs[k]);
                  return (
                    <li key={k} className="card stack" style={{ gap: 12, padding: 22, borderColor: on ? "rgba(52,199,123,.4)" : undefined }}>
                      <label className="row" style={{ gap: 14, flexWrap: "nowrap", alignItems: "flex-start", cursor: "pointer" }}>
                        <input type="checkbox" className="sr-only" checked={on} onChange={(e) => setDone(k, e.target.checked)} />
                        <span className="icon-tile" style={on ? { background: "var(--status-success-solid)" } : null}>{on ? <Check /> : pad(i + 1)}</span>
                        <span className="stack" style={{ gap: 4 }}><span className="label">{st.t}</span><span style={{ fontSize: 15 }}>{st.d}</span></span>
                      </label>
                      <AttachMedia refKey={`lab-${lab.id}`} level="lab" item={i} media={media} />
                    </li>
                  );
                })}
              </ol>
              {lab.footer ? <p className="mono">{lab.footer.label} <a href="#/toolkit">{lab.footer.linkText}</a></p> : null}
            </section>
          );
        })}
      </main>
    </div>
  );
}

/* ---------------- Workshop hub ---------------- */

function Toggle({ label, hint, on, onChange }) {
  return (
    <div className="card row" style={{ justifyContent: "space-between", gap: 16, padding: 20 }}>
      <span className="stack" style={{ gap: 2, flex: "1 1 240px" }}><span className="label">{label}</span><span style={{ fontSize: 14, color: "var(--text-muted)" }}>{hint}</span></span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="pill" style={{ minWidth: 88, justifyContent: "center", ...(on ? { background: "var(--pm-red)", borderColor: "var(--pm-red)" } : {}) }}>{on ? T_("On") : T_("Off")}</button>
    </div>
  );
}

function WorkshopScreen({ tab, s, setS }) {
  const cur = HUB_TABS.find((x) => x.id === tab) || HUB_TABS[0];
  const allCleared = clearedCount(s) === LEVELS.length;
  const certOpen = allCleared || s.instructor;
  const reset = () => {
    if (!window.confirm(t("Are you sure? This cannot be undone."))) return;
    MediaDB.clear().catch(() => {});
    setS({ done: {}, cleared: {}, pos: {}, days: [today()], labs: {}, apply: {}, stepDone: {}, missionDone: {}, review: {}, lang: s.lang });
    go("map");
  };
  return (
    <div className="page">
      <main className="wrap stack" style={{ gap: 24, padding: "40px 32px 96px" }}>
        <div className="row" role="tablist" aria-label={t("Workshop")} style={{ gap: 6 }}>
          {HUB_TABS.map((x) => (
            <a key={x.id} role="tab" aria-selected={x.id === cur.id} className="pill" href={`#/workshop/${x.id}`} style={{ textDecoration: "none", ...(x.id === cur.id ? { background: "var(--pm-red)", borderColor: "var(--pm-red)", boxShadow: "var(--glow-red)" } : {}) }}>{T_(x.label)}</a>
          ))}
        </div>

        {cur.src ? (
          <div className="stack" style={{ gap: 10 }}>
            <iframe key={cur.id} src={cur.src} title={t(cur.label)} style={{ width: "100%", height: "calc(100vh - 220px)", minHeight: 560, border: "1px solid var(--border-hairline)", borderRadius: "var(--r-lg)", background: "#0a0a0a" }} />
            <a className="mono" href={cur.src} target="_blank" rel="noopener">{t("Open in a new tab")} ↗</a>
          </div>
        ) : cur.id === "upload" ? (
          <div className="card card-xl stack" style={{ gap: 16, alignItems: "flex-start" }}>
            <h1 className="h-sub" style={{ fontSize: 40 }}>{t("Upload")}</h1>
            <p style={{ margin: 0 }}>{t("Upload to the class folder")} — Google Drive.</p>
            <div className="row" style={{ gap: 12 }}>
              <a className="btn btn-primary" href={UPLOAD_URL} target="_blank" rel="noopener">{t("Upload to the class folder")} <Arrow /></a>
              <a className="btn btn-ghost" href="#/reel">{t("My reel")}</a>
            </div>
          </div>
        ) : cur.id === "certificates" ? (
          <div className="card card-xl row" style={{ gap: 32, alignItems: "center" }}>
            {has3D() ? <div style={{ flex: "0 1 280px", margin: "0 auto" }}><SoloDirector avatar={avatarOf(s)} celebrate={certOpen} height={300} /></div> : null}
            <div className="stack" style={{ flex: "1 1 360px", gap: 16 }}>
              <span className="mono">{clearedCount(s)} / {LEVELS.length} {t("Levels cleared").toUpperCase()}</span>
              <h1 className="h-sub" style={{ fontSize: 48 }}>{t("Claim your certificate")}</h1>
              {certOpen ? (
                <a className="btn btn-primary" style={{ alignSelf: "flex-start" }} href={CERT_URL} target="_blank" rel="noopener">{t("Claim your certificate")} <Arrow /></a>
              ) : (
                <>
                  <p style={{ margin: 0 }}>{t("Clear all six levels to unlock your certificate.")}</p>
                  <div className="progress" style={{ maxWidth: 360 }}><i style={{ width: `${(clearedCount(s) / LEVELS.length) * 100}%` }} /></div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="stack" style={{ gap: 12, maxWidth: 760 }}>
            <h1 className="h-sub" style={{ fontSize: 40 }}>{t("Settings")}</h1>
            <div className="card row" style={{ justifyContent: "space-between", gap: 16, padding: 20 }}>
              <span className="label">{t("Language")}</span>
              <span className="row" role="group" aria-label={t("Language")} style={{ gap: 6 }}>
                <button type="button" className="pill" aria-pressed={s.lang !== "ar"} onClick={() => setS({ ...s, lang: "en" })}>ENGLISH</button>
                <button type="button" className="pill" aria-pressed={s.lang === "ar"} onClick={() => setS({ ...s, lang: "ar" })}>العربية</button>
              </span>
            </div>
            <Toggle label={t("Instructor mode")} hint={t("Opens every level for demos and live sessions.")} on={!!s.instructor} onChange={(v) => setS({ ...s, instructor: v })} />
            <Toggle label={t("Presenter mode")} hint={t("Larger type for projecting in the room.")} on={!!s.presenter} onChange={(v) => setS({ ...s, presenter: v })} />
            <div className="card row" style={{ justifyContent: "space-between", gap: 16, padding: 20 }}>
              <span className="stack" style={{ gap: 2, flex: "1 1 240px" }}><span className="label">{t("Reset progress")}</span><span style={{ fontSize: 14, color: "var(--text-muted)" }}>{t("Clears XP, answers and your director on this device.")}</span></span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>{t("Reset progress")}</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- app ---------------- */

function App() {
  const [s, setS] = useStore();
  const route = useRoute();
  LANG = s.lang === "ar" ? "ar" : "en";
  useEffect(() => {
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  }, [LANG]);
  useEffect(() => { document.body.classList.toggle("presenter", !!s.presenter); }, [s.presenter]);
  useEffect(() => {
    const d = today();
    if (!(s.days || []).includes(d)) setS((p) => ({ ...p, days: [...(p.days || []), d].slice(-120) }));
  }, []);
  const [view, a, b, c] = route;
  let screen;
  const lv = a !== undefined ? LEVELS[levelIndex(a)] : null;
  if (view === "level" && lv && (b === "apply" || b === "challenge") && missionOf(lv)) screen = <MissionScreen key={`${a}-${c || ""}`} lv={lv} stepIdx={b === "apply" && c !== undefined ? +c : undefined} s={s} setS={setS} />;
  else if (view === "level" && lv) screen = <LessonScreen key={a} lv={lv} s={s} setS={setS} />;
  else if (view === "rankup" && lv) screen = <RankUpScreen lv={lv} s={s} />;
  else if (view === "toolkit") screen = <ToolkitScreen key={a || "all"} initial={a} />;
  else if (view === "reel") screen = <ReelScreen />;
  else if (view === "labs") screen = <LabsScreen s={s} setS={setS} />;
  else if (view === "workshop") screen = <WorkshopScreen tab={a} s={s} setS={setS} />;
  else screen = <MapScreen s={s} setS={setS} />;
  return (
    <AvatarCtx.Provider value={avatarOf(s)}>
      <a href="#main" className="sr-only">{t("Skip to content")}</a>
      <TopBar s={s} setS={setS} route={route} />
      <div id="main">{screen}</div>
    </AvatarCtx.Provider>
  );
}

document.addEventListener("click", (e) => {
  if (e.target.closest("button, a") && window.SFX) window.SFX.click();
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

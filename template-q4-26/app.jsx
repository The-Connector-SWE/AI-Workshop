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
  const [s, setS] = useState(() => ({ done: {}, answers: {}, chDone: {}, cleared: {}, quizBest: 0, ...loadStore() }));
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
const challengesOf = (lv) => lv.challenges || [];
const levelIndex = (id) => LEVELS.findIndex((l) => String(l.id) === String(id));

function levelProgress(lv, s) {
  const secs = sectionsOf(lv).sections.length;
  const chs = challengesOf(lv).length;
  const total = secs + chs || 1;
  const d = (s.done[lv.id] || []).length + challengesOf(lv).filter((_, i) => s.chDone[`${lv.id}-${i}`]).length;
  return s.cleared[lv.id] ? 100 : Math.round((d / total) * 100);
}
function xpOf(s) {
  const sections = Object.values(s.done).reduce((n, a) => n + a.length, 0);
  const chs = Object.keys(s.chDone).length;
  return Object.keys(s.cleared).length * 500 + sections * 25 + chs * 100 + (s.quizBest || 0) * 10;
}
const clearedCount = (s) => LEVELS.filter((l) => s.cleared[l.id]).length;

function Glyph({ id, size = 40 }) {
  const P = window.PlatformLogo;
  return (
    <span className="glyph" style={{ width: size, height: size }} aria-hidden="true">
      {P ? <P id={id} size={Math.round(size * 0.58)} /> : null}
    </span>
  );
}
const Arrow = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);
const Back = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
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
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{copied ? "Copied" : "Copy prompt"}</button>
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
const avatarOf = (s) => ({ skin: SKINS[1], jacket: JACKETS[0], ...(s.avatar || {}) });

function MapWorld({ statuses, sel, onSelect, avatar }) {
  const el = useRef(), w = useRef(), cb = useRef(onSelect);
  cb.current = onSelect;
  useEffect(() => {
    if (!has3D()) return;
    w.current = window.World3D.createMap(el.current, {
      levels: LEVELS.map((l, i) => ({ code: l.code.toUpperCase(), name: l.name, status: statuses[i] })),
      selected: sel, avatar, onSelect: (i) => cb.current(i),
    });
    return () => w.current && w.current.dispose();
  }, []);
  useEffect(() => { w.current && w.current.select(sel); }, [sel]);
  useEffect(() => { w.current && w.current.setStatuses(statuses); }, [statuses.join()]);
  useEffect(() => { w.current && w.current.setAvatar(avatar); }, [avatar.skin, avatar.jacket]);
  return <div ref={el} style={{ position: "absolute", inset: 0 }} aria-hidden="true" />;
}

function SoloDirector({ avatar, celebrate, reaction, height = 300 }) {
  const el = useRef(), w = useRef();
  useEffect(() => {
    if (!has3D()) return;
    w.current = window.World3D.createSolo(el.current, { avatar, celebrate });
    return () => w.current && w.current.dispose();
  }, []);
  useEffect(() => { if (w.current && reaction) w.current.react(reaction.kind); }, [reaction && reaction.n]);
  if (!has3D()) return null;
  return <div ref={el} style={{ width: "100%", height }} role="img" aria-label="Your director character" />;
}

function AvatarPicker({ avatar, onChange }) {
  const Sw = ({ c, on, onClick, label }) => (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={on}
      style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: on ? "2px solid #fff" : "1px solid rgba(255,255,255,.25)", boxShadow: on ? "var(--glow-red)" : "none", padding: 0 }} />
  );
  return (
    <div className="row" style={{ gap: "10px 18px" }}>
      <span className="mono" style={{ color: "#fff" }}>YOUR DIRECTOR</span>
      <span className="row" role="group" aria-label="Skin tone" style={{ gap: 6 }}>
        {SKINS.map((c, i) => <Sw key={c} c={c} on={avatar.skin === c} label={`Skin tone ${i + 1}`} onClick={() => onChange({ ...avatar, skin: c })} />)}
      </span>
      <span className="row" role="group" aria-label="Jacket colour" style={{ gap: 6 }}>
        {JACKETS.map((c, i) => <Sw key={c} c={c} on={avatar.jacket === c} label={`Jacket colour ${i + 1}`} onClick={() => onChange({ ...avatar, jacket: c })} />)}
      </span>
    </div>
  );
}

/* ---------------- shell ---------------- */

function TopBar({ s, route }) {
  const at = route[0];
  return (
    <header className="topbar">
      <div className="wrap">
        <a href="#/map" className="brand">
          <span className="ringmark" aria-hidden="true"><i /><i /><i /></span>
          <span>THE DIRECTOR'S GAME</span>
        </a>
        <nav className="nav" aria-label="Course">
          <a href="#/map" aria-current={at === "map" || at === "level" || at === "rankup" ? "page" : undefined}>MISSION MAP</a>
          <a href="#/toolkit" aria-current={at === "toolkit" ? "page" : undefined}>TOOLKIT</a>
          <a href="#/quiz" aria-current={at === "quiz" ? "page" : undefined}>SHOT MATCH</a>
        </nav>
        <span className="chip-xp"><span className="dot" aria-hidden="true" />{xpOf(s).toLocaleString("en-US")} XP</span>
      </div>
    </header>
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
  const statuses = LEVELS.map((l, i) => (s.cleared[l.id] ? "cleared" : i > 0 && !s.cleared[LEVELS[i - 1].id] ? "locked" : "open"));
  const current = Math.min(LEVELS.findIndex((l) => !s.cleared[l.id]) === -1 ? LEVELS.length - 1 : LEVELS.findIndex((l) => !s.cleared[l.id]), LEVELS.length - 1);
  const [sel, setSel] = useState(current);
  const lv = LEVELS[sel];
  const locked = sel > 0 && !s.cleared[LEVELS[sel - 1].id];
  const items = challengesOf(lv).reduce((n, c) => n + (c.items ? c.items.length : 0), 0);

  return (
    <div className="page">
      <span className="ring" style={{ top: -260, right: -220, width: 760, height: 760 }} />
      <span className="ring" style={{ top: -140, right: -100, width: 520, height: 520 }} />
      <span className="ring" style={{ top: -20, right: 20, width: 280, height: 280, borderColor: "rgba(236,28,36,.28)" }} />

      <main className="wrap stack" style={{ position: "relative", gap: 72, padding: "72px 32px 96px" }}>
        <section className="grid-auto" style={{ "--min": "420px", "--gap": "40px", alignItems: "end" }}>
          <div className="stack reveal" style={{ gap: 24 }}>
            <span className="mono row" style={{ gap: 12, letterSpacing: ".06em" }}>
              <span className="ring-dot" style={{ color: "var(--pm-red)" }} aria-hidden="true" />SYS / MISSION CONTROL / AI FILMMAKING TRACK
            </span>
            <KickerTitle kicker="The" size="h-display">Director's Game</KickerTitle>
            <p className="lead" style={{ maxWidth: 560 }}>
              {LEVELS.length} missions take you from a blank brief to a finished cinematic cut. Clear each one to earn your next rank.
            </p>
            <div className="row" style={{ gap: 12 }}>
              <a className="btn btn-primary" href={`#/level/${LEVELS[current].id}`}>{cleared ? "Resume mission" : "Start mission"} <Arrow /></a>
              <a className="btn btn-ghost" href="#/quiz">Quick challenge</a>
            </div>
          </div>

          <div className="card stack" style={{ gap: 20 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
              <span className="label">Rank track</span>
              <span className="sublabel">{cleared} / {LEVELS.length} cleared</span>
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
                        {cur ? "CURRENT RANK" : reached ? "EARNED" : `UNLOCKS AT LEVEL ${pad(i)}`}
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
            <KickerTitle kicker="Your" size="h-title" as="h2" id="map-h">Mission Map</KickerTitle>
            <span className="mono">{has3D() ? "Click an island — your director walks there" : "Select a level to inspect it"}</span>
          </div>

          {has3D() ? (
            <div className="reveal" style={{ position: "relative", height: "clamp(380px, 46vw, 560px)", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--border-hairline)", background: "radial-gradient(ellipse at 50% 35%, #1a1112 0%, #0a0a0a 70%)" }}>
              <MapWorld statuses={statuses} sel={sel} onSelect={setSel} avatar={avatar} />
              <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16, background: "rgba(20,20,20,.82)", backdropFilter: "var(--blur-glass)", WebkitBackdropFilter: "var(--blur-glass)", border: "1px solid rgba(255,255,255,.08)" }}>
                <AvatarPicker avatar={avatar} onChange={(a) => setS({ ...s, avatar: a })} />
                <a className="btn btn-primary btn-sm" href={`#/level/${lv.id}`}>{locked ? "Preview" : "Enter"} {lv.code} <Arrow /></a>
              </div>
            </div>
          ) : null}

          <div className="grid-auto" style={{ "--min": "300px", "--gap": "20px" }}>
            {LEVELS.map((l, i) => {
              const isCleared = !!s.cleared[l.id];
              const isLocked = i > 0 && !s.cleared[LEVELS[i - 1].id];
              const pct = levelProgress(l, s);
              const status = isCleared ? "Cleared" : isLocked ? "Locked" : "In progress";
              const color = isCleared ? "var(--status-success)" : isLocked ? "var(--text-muted)" : "var(--pm-red-300)";
              return (
                <button key={l.id} type="button" className={`tile ${i === sel ? "on" : ""} ${isLocked ? "locked" : ""}`} aria-pressed={i === sel} onClick={() => setSel(i)} style={{ padding: 28, gap: 20 }}>
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
                {[[sectionsOf(lv).sections.length, "Lessons"], [challengesOf(lv).length, "Challenges"], [items, "Deliverables"], ["+500", "XP on clear"]].map(([v, k]) => (
                  <div key={k} className="stack">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 30, color: "#fff", lineHeight: 1.2 }}>{v}</span>
                    <span style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--text-muted)", textTransform: "uppercase" }}>{k}</span>
                  </div>
                ))}
              </div>
              {locked ? (
                <span className="row" style={{ gap: 10, color: "var(--text-muted)", fontSize: 15 }}><Lock /> Clear {LEVELS[sel - 1].code} to earn this rank — you can still preview it.</span>
              ) : null}
              <div style={{ paddingTop: 8 }}>
                <a className="btn btn-primary" href={`#/level/${lv.id}`}>{locked ? "Preview" : "Enter"} {lv.code} <Arrow /></a>
              </div>
            </div>
            <div className="stack" style={{ gap: 12 }}>
              <span className="label">Mission challenges</span>
              {challengesOf(lv).length ? (
                <ol className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 10 }}>
                  {challengesOf(lv).map((c, j) => (
                    <li key={j}>
                      <a href={`#/level/${lv.id}/challenge/${j}`} className="tile" style={{ flexDirection: "row", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 12, background: "var(--surface-card)" }}>
                        <span className={`icon-tile ${s.chDone[`${lv.id}-${j}`] ? "" : ""}`} style={s.chDone[`${lv.id}-${j}`] ? { background: "var(--status-success-solid)" } : null}>
                          {s.chDone[`${lv.id}-${j}`] ? <Check /> : pad(j + 1)}
                        </span>
                        <span style={{ flex: "1 1 auto", color: "#fff" }}>{c.title}</span>
                        <span className="mono">{(c.items || []).length} tasks</span>
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p style={{ margin: 0, color: "var(--text-muted)" }}>This mission is cleared by completing its lessons.</p>
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
  return (
    <div className="card card-xl row" style={{ gap: 28, alignItems: "flex-start", padding: 24 }}>
      <div className="stack" style={{ flex: "0 1 300px", gap: 12, margin: "0 auto" }}>
        <div className="viewfinder">
          <img key={run} src={TQ.F(m.img)} alt={`${r.move} demonstrated on storyboard frame ${m.img}`} className={m.shake && phase === "end" ? "shake" : ""}
            style={{ transformOrigin: m.origin, transform: phase === "start" ? m.from : m.to, transition: phase === "start" ? "none" : "transform 2600ms var(--ease-in-out)" }} />
          <span className="corners white" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="rec"><span className="dot" aria-hidden="true" />{r.move.toUpperCase()} · 00:0{phase === "end" ? 3 : 0}</span>
        </div>
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
  const [at, setAt] = useState(0);
  const done = s.done[lv.id] || [];
  const sec = secs[at];
  const idx = levelIndex(lv.id);
  const last = at === secs.length - 1;
  const chs = challengesOf(lv);

  const markDone = () => {
    const nd = done.includes(at) ? done : [...done, at];
    const next = { ...s, done: { ...s.done, [lv.id]: nd } };
    if (!chs.length && nd.length === secs.length) {
      next.cleared = { ...s.cleared, [lv.id]: true };
      setS(next);
      go(`rankup/${lv.id}`);
      return;
    }
    setS(next);
    if (last) { if (chs.length) go(`level/${lv.id}/challenge/0`); }
    else { setAt(at + 1); window.scrollTo(0, 0); }
  };

  return (
    <div className="page">
      <div className="wrap row" style={{ gap: "12px 24px", paddingTop: 20 }}>
        <a className="btn btn-ghost btn-sm" href="#/map"><Back /> Mission map</a>
        <div className="stack" style={{ flex: "1 1 240px" }}>
          <span className="mono">{lv.code.toUpperCase()} / LESSON</span>
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
          <span className="sublabel" style={{ color: "var(--text-muted)", padding: "0 4px 8px" }}>Sections</span>
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

          {chs.length ? (
            <div className="card stack" style={{ gap: 10, padding: 16, marginTop: 12 }}>
              <span className="sublabel" style={{ color: "var(--text-muted)" }}>Challenges</span>
              {chs.map((c, j) => (
                <a key={j} href={`#/level/${lv.id}/challenge/${j}`} className="row" style={{ gap: 10, color: "#fff", textDecoration: "none", fontSize: 15, flexWrap: "nowrap" }}>
                  <span className="icon-tile" style={{ width: 28, height: 28, borderRadius: 8, fontSize: 12, ...(s.chDone[`${lv.id}-${j}`] ? { background: "var(--status-success-solid)" } : {}) }}>{s.chDone[`${lv.id}-${j}`] ? <Check size={14} /> : j + 1}</span>
                  {c.title}
                </a>
              ))}
            </div>
          ) : null}

          <a href="#/quiz" className="tile" style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, borderStyle: "dashed", textDecoration: "none", color: "#fff", marginTop: 4 }}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec1c24" strokeWidth="1.75"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>
            <span className="stack"><span className="label">Knowledge check</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>Shot Match — 6 rounds</span></span>
          </a>

          <div className="card stack" style={{ gap: 10, padding: 16, marginTop: 4 }}>
            <span className="sublabel" style={{ color: "var(--text-muted)" }}>Tools for this level</span>
            {lv.tools.map((t) => PLATFORMS[t] ? (
              <a key={t} href={`#/toolkit/${t}`} className="row" style={{ gap: 12, color: "#fff", textDecoration: "none", flexWrap: "nowrap" }}>
                <Glyph id={t} size={36} />
                <span className="stack" style={{ lineHeight: 1.3 }}><span style={{ fontSize: 15 }}>{PLATFORMS[t].name}</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{PLATFORMS[t].tagline}</span></span>
              </a>
            ) : null)}
          </div>
        </nav>

        <article className="content stack" style={{ gap: 32 }}>
          {sec ? (
            <React.Fragment key={`${lv.id}-${at}`}>
              <div className="stack reveal" style={{ gap: 8 }}>
                <span className="mono">SECTION {pad(at + 1)} OF {pad(secs.length)}</span>
                <h1 className="h-sub" style={{ fontSize: "clamp(36px, 4.4vw, 56px)" }}>{sec.title}</h1>
                {sec.summary ? <p className="lead">{sec.summary}</p> : null}
              </div>
              <div className="reveal" style={{ animationDelay: "120ms" }}><SectionBody s={sec} /></div>
            </React.Fragment>
          ) : (
            <p className="lead">{lv.mission}</p>
          )}
          <div className="row" style={{ justifyContent: "space-between", gap: 12, paddingTop: 24, borderTop: "1px solid var(--border-hairline)" }}>
            <button type="button" className="btn btn-ghost" disabled={at === 0} onClick={() => setAt(Math.max(0, at - 1))}>Previous</button>
            {secs.length ? (
              <button type="button" className="btn btn-primary" onClick={markDone}>
                {last ? (chs.length ? "Complete lesson · start challenges" : "Complete & clear level") : "Mark done & continue"} <Arrow />
              </button>
            ) : null}
          </div>
          {idx > 0 && !s.cleared[LEVELS[idx - 1].id] ? (
            <span className="mono">PREVIEW MODE — clear {LEVELS[idx - 1].code} to earn this rank.</span>
          ) : null}
        </article>
      </main>
    </div>
  );
}

/* ---------------- 03 · Challenge workspace ---------------- */

function ChallengeScreen({ lv, chIdx, s, setS }) {
  const chs = challengesOf(lv);
  const ch = chs[chIdx];
  const key = `${lv.id}-${chIdx}`;
  const ans = s.answers[key] || {};
  const cols = ch.columns && ch.columns.length ? ch.columns : null;
  const items = ch.items || [];
  const [at, setAt] = useState(0);

  const val = (i, c) => ans[`${i}|${c}`] || "";
  const setVal = (i, c, v) => setS((p) => ({ ...p, answers: { ...p.answers, [key]: { ...(p.answers[key] || {}), [`${i}|${c}`]: v } } }));
  const filled = (i) => cols ? cols.filter((c) => val(i, c).trim()).length : (val(i, "text").trim() ? 1 : 0);
  const full = (i) => filled(i) === (cols ? cols.length : 1);
  const complete = items.filter((_, i) => full(i)).length;
  const allDone = items.length > 0 && complete === items.length;

  const submit = () => {
    const chDone = { ...s.chDone, [key]: true };
    const all = chs.every((_, j) => chDone[`${lv.id}-${j}`]);
    setS({ ...s, chDone, cleared: all ? { ...s.cleared, [lv.id]: true } : s.cleared });
    go(all ? `rankup/${lv.id}` : chIdx + 1 < chs.length ? `level/${lv.id}/challenge/${chIdx + 1}` : `level/${lv.id}`);
  };

  return (
    <div className="page">
      <div className="wrap row" style={{ gap: "12px 24px", paddingTop: 20 }}>
        <a className="btn btn-ghost btn-sm" href={`#/level/${lv.id}`}><Back /> Lesson</a>
        <div className="stack" style={{ flex: "1 1 240px" }}>
          <span className="mono">{lv.code.toUpperCase()} / CHALLENGE {pad(chIdx + 1)} OF {pad(chs.length)}</span>
          <span style={{ color: "#fff" }}>{ch.title}</span>
        </div>
        <span className="mono" style={{ color: "#fff" }}>{complete}/{items.length} LOCKED</span>
        <button type="button" className="btn btn-primary btn-sm" disabled={!allDone} onClick={submit}>Submit challenge</button>
      </div>

      <main className="wrap stack" style={{ gap: 28, padding: "36px 32px 96px" }}>
        <div className="split" style={{ gap: 28 }}>
          <div className="content stack" style={{ gap: 16 }}>
            <h1 className="h-sub" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>{ch.title}</h1>
            {ch.intro ? <p className="lead">{ch.intro}</p> : null}
            {ch.brief ? <div className="card stack" style={{ gap: 8 }}><span className="sublabel">The brief</span><span style={{ color: "#fff" }}>{ch.brief}</span></div> : null}
            {ch.goal ? <span className="mono">GOAL / {ch.goal}</span> : null}
          </div>
          {ch.prompt ? <div className="side" style={{ flex: "1 1 360px" }}><CopyBox title="Prompt assist" text={ch.prompt} /></div> : null}
        </div>

        {cols ? (
          <>
            <div role="tablist" aria-label="Items" className="grid-auto" style={{ "--min": "150px", "--gap": "10px" }}>
              {items.map((it, i) => (
                <button key={i} type="button" role="tab" aria-selected={i === at} className={`tile ${i === at ? "on" : ""}`} onClick={() => setAt(i)} style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ position: "relative", aspectRatio: "16 / 10", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border-hairline)" }}>
                    <span aria-hidden="true" style={{ position: "absolute", inset: 12, border: "1px dashed var(--border-hairline)", borderRadius: 6 }} />
                    <span className="mono" style={{ position: "relative", color: full(i) ? "#fff" : "var(--text-faint)", padding: "0 12px", textAlign: "center" }}>{(val(i, cols[0]) || "EMPTY").toString().slice(0, 28).toUpperCase()}</span>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between", padding: "10px 14px", gap: 8 }}>
                    <span className="label">{it.label}</span>
                    <span style={{ fontSize: 11, letterSpacing: ".16em", color: full(i) ? "var(--status-success)" : filled(i) ? "var(--status-warning)" : "var(--text-muted)" }}>
                      {full(i) ? "LOCKED" : filled(i) ? "DRAFT" : "TO DO"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <section aria-label={`${items[at].label} editor`} className="card card-xl stack" style={{ gap: 20 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                <h2 className="h-sub" style={{ fontSize: 40 }}>{items[at].label}</h2>
                <span className="mono">{filled(at)}/{cols.length} FIELDS</span>
              </div>
              <div className="grid-auto" style={{ "--min": "260px", "--gap": "16px" }}>
                {cols.map((c) => {
                  const id = `f-${chIdx}-${at}-${c}`.replace(/\W+/g, "-");
                  const long = /visual|prompt|description/i.test(c);
                  return (
                    <div key={c} className="stack" style={{ gap: 8, gridColumn: long ? "1 / -1" : undefined }}>
                      <label htmlFor={id} className="label">{c}</label>
                      {long
                        ? <textarea id={id} className="field" rows={3} value={val(at, c)} onChange={(e) => setVal(at, c, e.target.value)} />
                        : <input id={id} className="field" type="text" value={val(at, c)} onChange={(e) => setVal(at, c, e.target.value)} />}
                    </div>
                  );
                })}
              </div>
              <div className="row" style={{ justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid var(--border-hairline)" }}>
                <button type="button" className="btn btn-primary" onClick={() => setAt((at + 1) % items.length)}>Next <Arrow /></button>
              </div>
            </section>
          </>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            {items.map((it, i) => {
              const id = `t-${chIdx}-${i}`;
              return (
                <div key={i} className={`card stack ${full(i) ? "" : ""}`} style={{ gap: 10, padding: 22, borderColor: full(i) ? "rgba(52,199,123,.4)" : undefined }}>
                  <label htmlFor={id} className="row" style={{ gap: 12, flexWrap: "nowrap" }}>
                    <span className="icon-tile" style={full(i) ? { background: "var(--status-success-solid)" } : null}>{full(i) ? <Check /> : pad(i + 1)}</span>
                    <span style={{ color: "#fff" }}>{it.label}</span>
                  </label>
                  <textarea id={id} className="field" rows={2} placeholder="Paste your output, prompt or a link to your result" value={val(i, "text")} onChange={(e) => setVal(i, "text", e.target.value)} />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- 04 · Shot Match ---------------- */

function QuizScreen({ s, setS }) {
  const Q = TQ.QUIZ;
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const q = Q[round];
  const score = results.filter(Boolean).length;
  let streak = 0;
  for (let i = results.length - 1; i >= 0 && results[i]; i--) streak++;
  const answered = picked !== null;
  const correct = answered && q.opts[picked] === q.answer;
  const lastRound = round === Q.length - 1;

  const [reaction, setReaction] = useState(null);
  const pick = (i) => {
    if (answered) return;
    const ok = q.opts[i] === q.answer;
    setPicked(i); setResults([...results, ok]);
    setReaction({ kind: ok ? "cheer" : "no", n: Date.now() });
  };
  const next = () => {
    if (lastRound) {
      setFinished(true);
      if (score > (s.quizBest || 0)) setS({ ...s, quizBest: score });
    } else { setRound(round + 1); setPicked(null); }
  };
  const restart = () => { setRound(0); setPicked(null); setResults([]); setFinished(false); };

  return (
    <div className="page">
      <div className="wrap row" style={{ position: "relative", gap: "12px 24px", paddingTop: 20 }}>
        <div className="stack" style={{ flex: "1 1 200px" }}>
          <span className="mono">KNOWLEDGE CHECK</span>
          <span style={{ color: "#fff" }}>Shot Match</span>
        </div>
        <span className="chip-xp">ROUND {Math.min(round + 1, Q.length)}/{Q.length}</span>
        <span className="chip-xp">STREAK x{streak}</span>
        <span className="chip-xp" style={{ background: "var(--pm-red)", borderColor: "var(--pm-red)" }}>+{score * 10} XP</span>
      </div>
      <div className="wrap row" aria-hidden="true" style={{ position: "relative", gap: 4, flexWrap: "nowrap", paddingTop: 14 }}>
        {Q.map((_, i) => (
          <span key={i} style={{ flex: "1 1 0", height: 4, borderRadius: 999, background: i < results.length ? (results[i] ? "#ec1c24" : "#6b6b6b") : i === round && !finished ? "#f98f93" : "#2a2a2a" }} />
        ))}
      </div>

      <main className="wrap stack" style={{ position: "relative", maxWidth: 1000, gap: 32, padding: "48px 32px 96px" }}>
        {!finished ? (
          <>
            <div className="row" style={{ gap: 24, alignItems: "stretch" }}>
              <div className="photo" style={{ flex: "0 1 240px", margin: "0 auto", borderRadius: "var(--r-xl)", border: "1px solid var(--border-hairline)" }}>
                <img key={round} src={TQ.F(q.img)} alt={`Storyboard frame ${q.img}: ${q.scene}`} style={{ height: "100%", minHeight: 360, objectPosition: q.pos }} />
                <span className="cap mono" style={{ color: "#fff", fontSize: 11 }}>REFERENCE / FRAME {pad(q.img)}</span>
              </div>
              <div className="card card-xl stack reveal" key={`q${round}`} style={{ position: "relative", flex: "999 1 420px", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16, padding: "56px 40px" }}>
                <span className="corners" aria-hidden="true"><i /><i /><i /><i /></span>
                <span className="mono row" style={{ gap: 8, color: "var(--pm-red-300)" }}><span className="dot" aria-hidden="true" />REC / THE DIRECTOR NEEDS TO</span>
                <h1 className="kicker-title" style={{ fontSize: "clamp(40px, 5vw, 64px)", alignItems: "center" }}>{q.purpose}</h1>
                <p style={{ margin: 0, maxWidth: 520 }}>{q.scene}</p>
              </div>
            </div>

            <div className="row" style={{ gap: 16, alignItems: "stretch" }}>
              {has3D() ? (
                <div className="card" style={{ flex: "0 1 200px", margin: "0 auto", padding: 0, overflow: "hidden", background: "radial-gradient(ellipse at 50% 40%, #1a1112 0%, #111 75%)" }}>
                  <SoloDirector avatar={avatarOf(s)} reaction={reaction} height={190} />
                </div>
              ) : null}
            <div role="group" aria-label="Choose the shot" className="grid-auto" style={{ "--min": "300px", "--gap": "14px", flex: "999 1 480px" }}>
              {q.opts.map((o, i) => {
                const isAns = o === q.answer, isPick = i === picked;
                const st = !answered ? {} : isAns
                  ? { background: "var(--status-success-tint)", borderColor: "var(--status-success)" }
                  : isPick ? { background: "var(--status-error-tint)", borderColor: "var(--pm-red-300)" } : { opacity: .4 };
                return (
                  <button key={o} type="button" className="tile" disabled={answered} onClick={() => pick(i)} style={{ flexDirection: "row", alignItems: "center", gap: 16, minHeight: 76, padding: "16px 20px", ...st }}>
                    <span className="icon-tile muted" style={answered && isAns ? { background: "var(--status-success-solid)", borderColor: "transparent" } : answered && isPick ? { background: "var(--pm-red)", borderColor: "transparent" } : null}>{"ABCD"[i]}</span>
                    <span style={{ flex: "1 1 auto", fontSize: 22, color: "#fff" }}>{o}</span>
                    {answered && (isAns || isPick) ? <span className="sublabel" style={{ color: isAns ? "var(--status-success)" : "var(--pm-red-300)" }}>{isAns ? "Correct" : "Your pick"}</span> : null}
                  </button>
                );
              })}
            </div>
            </div>

            {answered ? (
              <div className="card row reveal" style={{ justifyContent: "space-between", gap: 20, background: correct ? "var(--status-success-tint)" : "var(--status-error-tint)", borderColor: correct ? "rgba(52,199,123,.4)" : "rgba(236,28,36,.4)" }}>
                <div className="stack" style={{ gap: 4, flex: "1 1 360px" }}>
                  <span className="label" style={{ color: correct ? "var(--status-success)" : "var(--pm-red-300)" }}>{correct ? "On target" : `Not quite — it's ${q.answer}`}</span>
                  <span style={{ color: "#fff" }}>{q.why}</span>
                </div>
                <button type="button" className="btn btn-primary" onClick={next}>{lastRound ? "See results" : "Next round"} <Arrow /></button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="card card-xl stack reveal" style={{ alignItems: "center", textAlign: "center", gap: 24, padding: "64px 40px" }}>
            <span className="mono">ROUND COMPLETE</span>
            <KickerTitle kicker="Your score" size="h-display">{score} / {Q.length}</KickerTitle>
            <p className="lead" style={{ maxWidth: 520 }}>{score >= 5 ? "You pick shots like a director. Your storyboard is ready for you." : "Review the shot types in Pre-Visualization, then try again."}</p>
            <div className="row" style={{ gap: 12, justifyContent: "center" }}>
              <button type="button" className="btn btn-ghost" onClick={restart}>Play again</button>
              <a className="btn btn-primary" href="#/map">Back to mission map</a>
            </div>
          </div>
        )}
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
    const text = `I just earned the ${lv.rank} rank in The Director's Game.`;
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
          <KickerTitle kicker="You are now a" size="h-display">{lv.rank}</KickerTitle>
        </div>
        <div className="grid-auto reveal" style={{ "--min": "200px", "--gap": "16px", width: "100%", animationDelay: "200ms" }}>
          {[["+500", "XP earned"], [`${clearedCount(s)}/${LEVELS.length}`, "Levels cleared"], [xpOf(s).toLocaleString("en-US"), "Total XP"]].map(([v, k]) => (
            <div key={k} className="card stack" style={{ gap: 4, padding: 24 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 40, color: "#fff", lineHeight: 1.2 }}>{v}</span>
              <span style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--text-muted)", textTransform: "uppercase" }}>{k}</span>
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
              <span className="sublabel">Track complete</span>
              <span className="h-sub">Every mission cleared</span>
            </div>
          )}
          <div className="row" style={{ gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={share}>{shared ? "Copied to clipboard" : "Share badge"}</button>
            <a className="btn btn-primary" href={next ? `#/level/${next.id}` : "#/map"}>{next ? `Start ${next.code}` : "Mission map"} <Arrow /></a>
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

/* ---------------- app ---------------- */

function App() {
  const [s, setS] = useStore();
  const route = useRoute();
  const [view, a, b, c] = route;
  let screen;
  const lv = a !== undefined ? LEVELS[levelIndex(a)] : null;
  if (view === "level" && lv && b === "challenge" && challengesOf(lv)[+c]) screen = <ChallengeScreen key={`${a}-${c}`} lv={lv} chIdx={+c} s={s} setS={setS} />;
  else if (view === "level" && lv) screen = <LessonScreen key={a} lv={lv} s={s} setS={setS} />;
  else if (view === "rankup" && lv) screen = <RankUpScreen lv={lv} s={s} />;
  else if (view === "quiz") screen = <QuizScreen s={s} setS={setS} />;
  else if (view === "toolkit") screen = <ToolkitScreen key={a || "all"} initial={a} />;
  else screen = <MapScreen s={s} setS={setS} />;
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <TopBar s={s} route={route} />
      <div id="main">{screen}</div>
    </>
  );
}

document.addEventListener("click", (e) => {
  if (e.target.closest("button, a") && window.SFX) window.SFX.click();
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

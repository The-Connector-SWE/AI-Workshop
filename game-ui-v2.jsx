// game-ui-v2.jsx — AAA-menu views: BootScreen, HUDBar, frame corners, DebriefView.
// Map/Level/Lab views are reused from game-ui.jsx (restyled via game-v2.css).
// Exports to window with V2 suffixes.

const HexIcon = ({ size = 36 }) => (
  <svg className="hex" viewBox="0 0 36 36" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M18 2.5 L31.5 10 L31.5 26 L18 33.5 L4.5 26 L4.5 10 Z" />
  </svg>
);

function FrameCorners() {
  return (
    <>
      <span className="frame-corner fc-tl"><i></i></span>
      <span className="frame-corner fc-tr"><i></i></span>
      <span className="frame-corner fc-bl"><i></i></span>
      <span className="frame-corner fc-br"><i></i></span>
    </>
  );
}

/* ---------------- Boot / title screen ---------------- */
function BootScreen({ onStart }) {
  const { useState, useEffect } = React;
  const [out, setOut] = useState(false);

  function start() {
    if (out) return;
    setOut(true);
    if (window.SFX) { window.SFX.unlock(); window.SFX.start(); }
    setTimeout(onStart, 620);
  }
  useEffect(() => {
    const onKey = () => start();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={"boot" + (out ? " out" : "")} onClick={start} role="button" aria-label="Press start">
      <span className="boot-presents">pod ai studio presents</span>
      <h1 className="boot-title">The Director's<span className="row2 iri">Game</span></h1>
      <div className="boot-rule"></div>
      <div className="press-start">Press Start</div>
      <div className="boot-meta">
        <span>v2.0 · console build</span>
        <span>5 missions · 2 side ops</span>
        <span>any key / tap</span>
      </div>
    </div>
  );
}

/* ---------------- HUD ---------------- */
function HUDBar({ levels, cleared, currentId, xp, xpMax, rank, onHome, muted, onToggleMute }) {
  return (
    <header className="hud">
      <button className="hud-brand" onClick={onHome}>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"13px", fontWeight:700, color:"#fff", letterSpacing:".01em", whiteSpace:"nowrap" }}>pod <span style={{ color:"#e30016" }}>ai</span> studio</span>
      </button>
      <div className="hud-right">
        <div className="hud-missions" aria-label="Mission progress">
          {levels.map((lv) => (
            <span key={lv.id}
              className={"hud-node" + (cleared.includes(lv.id) ? " done" : "") + (currentId === lv.id ? " cur" : "")}
              title={lv.code + " — " + lv.name}></span>
          ))}
        </div>
        <div className="hud-xp">
          <div className="hud-xp-row"><span>XP</span><b>{xp} / {xpMax}</b></div>
          <div className="hud-xp-track"><i style={{ width: (xp / xpMax) * 100 + "%" }}></i></div>
        </div>
        <div className="hud-rank">
          <span className="hud-insignia"><HexIcon /><b>{cleared.length}</b></span>
          <span className="hud-rank-id"><b>{rank}</b><span>Rank</span></span>
        </div>
        <button className="hud-mute" onClick={onToggleMute} title={muted ? "Unmute sounds" : "Mute sounds"}>
          {muted ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" /><path d="m16 9 5 5M21 9l-5 5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

/* ---------------- Debrief (result) ---------------- */
function DebriefView({ level, result, rankedUp, hasNext, onReplay, onMap, onNext }) {
  const { useEffect } = React;
  const { score, total } = result;
  const pct = score / total;
  const st = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
  const good = pct >= 0.6;

  useEffect(() => {
    if (window.SFX) {
      window.SFX.cleared();
      if (rankedUp) setTimeout(() => window.SFX.rankup(), 600);
    }
  }, []);

  return (
    <main className="screen" key={"res" + level.id}>
      <div className="result-card anim a2">
        <span className="quiz-kicker">{level.code} · Debrief</span>
        <div className="res-stars" style={{ marginTop: 18 }}>
          {[1, 2, 3].map((n) => <GameStarIcon key={n} size={36} className={n <= st ? "on" : ""} />)}
        </div>
        <div className={"clear-stamp " + (good ? "good" : "retry")}>
          {good ? "Level Cleared" : "Retry Advised"}
        </div>
        <div className="debrief-rows">
          <div className="dr"><span>Mission</span><b>{level.name}</b></div>
          <div className="dr"><span>Accuracy</span><b>{score}/{total} · {Math.round(pct * 100)}%</b></div>
          <div className="dr"><span>XP earned</span><b className="gold">+{score * 10}</b></div>
        </div>
        {rankedUp && (
          <div className="achv">
            <span className="achv-ico"><HexIcon size={42} /></span>
            <span className="achv-body">
              <span>Achievement unlocked · Rank up</span>
              <b>{level.rank}</b>
            </span>
          </div>
        )}
        <div className="res-actions">
          <button className="btn-ghost" onClick={onReplay}>Replay</button>
          {hasNext
            ? <button className="btn-primary" onClick={onNext}>Next mission <i>→</i></button>
            : <button className="btn-primary" onClick={onMap}>Mission select <i>→</i></button>}
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { BootScreen, HUDBar, FrameCorners, DebriefView, HexIcon });

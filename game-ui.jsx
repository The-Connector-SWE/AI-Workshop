// game-ui.jsx — The Director's Game views: GameTopBar, MapView, LevelView, ResultView.
// Exports to window. Challenge engines live in game-challenges.jsx.

const StarIcon = ({ size = 18, className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7z" />
  </svg>
);
const LockIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2.2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
  </svg>
);

function starsFor(best) {
  if (!best) return 0;
  const pct = best.score / best.total;
  return pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
}

/* ---------------- Top bar ---------------- */
function GameTopBar({ levels, cleared, xp, xpMax, rank, onHome }) {
  return (
    <header className="site-nav">
      <button className="brand" onClick={onHome}>
        <span className="brand-mark">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M16 3 C16 10 22 16 29 16 C22 16 16 22 16 29 C16 22 10 16 3 16 C10 16 16 10 16 3 Z" />
          </svg>
        </span>
        <span className="brand-name">Director's Game</span>
      </button>
      <nav className="nav-links">
        <button className="nav-link active" onClick={onHome}>Levels</button>
        <a className="nav-link" href="instructors.html">Instructors</a>
        <a className="nav-link" href="real-or-ai.html">Real or AI</a>
      </nav>
      <div className="gbar-right">
        <div className="gbar-prog">
          <div className="gbar-track"><i style={{ width: (cleared.length / levels.length) * 100 + "%" }}></i></div>
          <span>{cleared.length}/{levels.length}</span>
        </div>
        <div className="gbar-xp"><StarIcon size={15} />{xp}<small>/{xpMax} XP</small></div>
        <div className="gbar-rank"><b>{rank}</b><span>Current rank</span></div>
      </div>
    </header>
  );
}

/* ---------------- Level map ---------------- */
function MapView({ levels, platforms, labs, labChecks, best, rank, onEnter, onEnterLab, onReset }) {
  const clearedCount = levels.filter((l) => best[l.id]).length;
  const allDone = clearedCount === levels.length;
  const labAfter = {};
  const labDone = (lab) => {
    const c = labChecks[lab.id] || [];
    return lab.steps.length > 0 && lab.steps.every((_, i) => c[i]);
  };
  const labProgress = (lab) => (labChecks[lab.id] || []).filter(Boolean).length;
  return (
    <main className="screen" key="map">
      <section className="map-hero">
        <div className="pill anim a1"><span className="dot"></span> 5 levels · learn · tools · challenge</div>
        <h1 className="anim a2">The Director's<br /><span className="iri">Game</span></h1>
        <p className="map-sub anim a3">
          Climb from production assistant to director. Each level teaches one stage of the
          AI video pipeline, hands you its tools, then tests you with a challenge.
        </p>
        <div className="rank-chip anim a4">
          <span className="rc-star"><StarIcon size={16} /></span>
          <span className="rc-label">Rank</span>
          <span className="rc-name">{rank}</span>
        </div>
      </section>

      {allDone && (
        <div className="final-banner anim a4">
          <strong>That's a wrap, Director.</strong> All five levels cleared. Replay any challenge to chase three stars.
        </div>
      )}

      <section className="lpath">
        {levels.map((lv, i) => {
          const b = best[lv.id];
          const unlocked = true;
          const isNext = unlocked && !b;
          const st = starsFor(b);
          const lab = labAfter[lv.id];
          return (
            <React.Fragment key={lv.id}>
              {i > 0 && <div className={"lconn" + (best[levels[i - 1].id] ? " done" : "")}></div>}
              <button
                className={"lcard anim" + (b ? " cleared" : "") + (isNext ? " next" : "") + (!unlocked ? " locked" : "")}
                style={{ animationDelay: 0.15 + i * 0.08 + "s" }}
                onClick={() => unlocked && onEnter(lv.id)}
                disabled={!unlocked}
                data-screen-label={lv.code}>
                <span className="lnum">{!unlocked ? <LockIcon /> : String(lv.id).padStart(2, "0")}</span>
                <span className="lbody">
                  <span className="lmeta">
                    <span className="lcode">{lv.code}</span>
                    <span className="ltag">{lv.tag}</span>
                    {b && <span className="lbadge done">✓ {b.score}/{b.total}</span>}
                    {isNext && <span className="lbadge go">Up next</span>}
                    {!unlocked && <span className="lbadge">Locked</span>}
                  </span>
                  <span className="lname">{lv.name}</span>
                  <span className="lmission">{lv.mission}</span>
                  <span className="lfoot">
                    <span className="llogos">
                      {lv.tools.map((pid) => (
                        <span className="mini-logo" key={pid} style={{ color: platforms[pid].hue }}>
                          <PlatformLogo id={pid} size={17} />
                        </span>
                      ))}
                    </span>
                    {b ? (
                      <span className="lstars">
                        {[1, 2, 3].map((n) => <StarIcon key={n} size={17} className={n <= st ? "on" : ""} />)}
                      </span>
                    ) : (
                      unlocked && <span className="lgo">Enter level <i>→</i></span>
                    )}
                  </span>
                </span>
              </button>
              {lab && (
                <React.Fragment>
                  <div className={"lconn" + (b ? " done" : "")}></div>
                  <button
                    className={"lcard lab anim" + (labDone(lab) ? " cleared" : "")}
                    style={{ animationDelay: 0.19 + i * 0.08 + "s" }}
                    onClick={() => onEnterLab(lab.id)}
                    disabled={false}
                    data-screen-label={lab.title}>
                    <span className="lnum lab">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3h6" /><path d="M10 3v5.5L4.8 17.6A2.4 2.4 0 0 0 7 21h10a2.4 2.4 0 0 0 2.2-3.4L14 8.5V3" /><path d="M7.5 14.5h9" />
                      </svg>
                    </span>
                    <span className="lbody">
                      <span className="lmeta">
                        <span className="lcode lab">Hands-on · {lab.tag}</span>
                        {labDone(lab) && <span className="lbadge done">✓ Complete</span>}
                        {!labDone(lab) && b && labProgress(lab) > 0 && (
                          <span className="lbadge">{labProgress(lab)}/{lab.steps.length} steps</span>
                        )}
                      </span>
                      <span className="lname">{lab.title}</span>
                      <span className="lmission">{lab.subtitle}</span>
                      <span className="lfoot">
                        <span className="ltag">{lab.duration} · {lab.steps.length} steps</span>
                        <span className="lgo">{labDone(lab) ? "Review" : "Open playbook"} <i>→</i></span>
                      </span>
                    </span>
                  </button>
                </React.Fragment>
              )}
            </React.Fragment>
          );
        })}
      </section>

      <button className="reset" onClick={onReset}>Reset progress</button>
    </main>
  );
}

/* ---------------- Level 1: script-intelligence framework ---------------- */
function ScriptFramework({ data }) {
  const { useState } = React;
  const [active, setActive] = useState(0);
  const step = data.steps[active];
  return (
    <section className="l1-section anim a4">
      <div className="l1-sec-head">
        <span className="l1-sec-kicker">The method</span>
        <h3>{data.title}</h3>
        <p>{data.intro}</p>
      </div>
      <div className="fw-rail">
        {data.steps.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="fw-arrow">→</span>}
            <button className={"fw-node" + (active === i ? " active" : "")} onClick={() => setActive(i)}>
              <span className="fw-n">{i + 1}</span>
              <b>{s.key}</b>
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="fw-detail" key={active}>
        <div className="fw-detail-main">
          <span className="fw-q">{step.q}</span>
          <h4>{step.key}</h4>
          <p>{step.d}</p>
        </div>
        <div className="fw-example">
          <span className="fw-ex-label">Worked example · {data.example}</span>
          <p>{step.ex}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Level 1: six ways to find an idea ---------------- */
function IdeaMethods({ data }) {
  return (
    <section className="l1-section anim a4">
      <div className="l1-sec-head">
        <span className="l1-sec-kicker">Ideation</span>
        <h3>{data.title}</h3>
        <p>{data.intro}</p>
      </div>
      <div className="im-grid">
        {data.items.map((m, i) => (
          <article className="im-card" key={i}>
            <div className="im-top"><span className="im-n">{m.n}</span><h4>{m.name}</h4></div>
            <span className="im-ask">{m.ask}</span>
            <div className="im-rows">
              <div className="im-row"><span>Idea</span><p>{m.idea}</p></div>
              <div className="im-row"><span>Concept</span><p>{m.concept}</p></div>
              <div className="im-row hook"><span>Hook</span><p>{m.hook}</p></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Level view: learning → tools → challenge ---------------- */
function LevelView({ level, platforms, best, onFinish, onBack }) {
  const { useState } = React;
  const [stage, setStage] = useState("learn"); // learn | tools | challenge
  const [running, setRunning] = useState(false);
  const hasChallenges = !!(level.challenges || level.challenge);
  const challenges = hasChallenges ? (level.challenges || [level.challenge]) : [];
  const totalItems = challenges.reduce((n, c) => n + (c.items ? c.items.length : 0), 0);
  const multi = challenges.length > 1;

  const stages = [
    { id: "learn", n: 1, label: "Learning" },
    { id: "tools", n: 2, label: "Tools" },
    ...(hasChallenges ? [{ id: "challenge", n: 3, label: "Challenge" }] : []),
  ];

  return (
    <main className="screen" key={"lv" + level.id} data-screen-label={level.code}>
      <button className="back-link anim a1" onClick={onBack}><i>←</i> Level map</button>
      <header className="lv-head anim a2">
        <span className="lv-kicker">{level.code} · {level.tag}</span>
        <h2 className="lv-title">{level.name}</h2>
        <p className="lv-mission">{level.mission}</p>
      </header>

      <div className="stage-tabs anim a3">
        {stages.map((s) => (
          <button key={s.id}
            className={"stab" + (stage === s.id ? " active" : "") + (s.id !== "challenge" && best ? " done" : "")}
            onClick={() => { setStage(s.id); setRunning(false); }}>
            <span className="sn">{s.n}</span>{s.label}
          </button>
        ))}
      </div>

      {stage === "learn" && (
        <div className="anim a4" key="learn">
          <div className="learn-grid">
            {level.learning.map((l, i) => (
              <article className="learn-card" key={i}>
                <span className="learn-n">{i + 1}</span>
                <h3>{l.t}</h3>
                <p>{l.d}</p>
              </article>
            ))}
          </div>
          {level.scriptIntelligence && <VisualCraftingSection data={level.scriptIntelligence} />}
          {level.strategicViz && <VisualCraftingSection data={level.strategicViz} />}
          {level.visualCrafting && <VisualCraftingSection data={level.visualCrafting} />}
          {level.motionOrchestration && <VisualCraftingSection data={level.motionOrchestration} />}
          {level.launchControl && <VisualCraftingSection data={level.launchControl} />}
          <div className="stage-next">
            <button className="btn-primary" onClick={() => setStage("tools")}>Meet the tools <i>→</i></button>
          </div>
        </div>
      )}

      {stage === "tools" && (
        <div className="anim a4" key="tools">
          <div className="pgrid">
            {level.tools.map((pid, i) => (
              <PlatformCard key={pid} p={platforms[pid]} index={i} />
            ))}
          </div>
          {hasChallenges && (
            <div className="stage-next">
              <button className="btn-primary" onClick={() => setStage("challenge")}>Take the challenge <i>→</i></button>
            </div>
          )}
        </div>
      )}

      {hasChallenges && stage === "challenge" && !running && (
        <div className="ch-intro anim a4" key="chi">
          <span className="quiz-kicker">{level.code} · Challenge</span>
          <h2>{multi ? "Two-stage challenge" : challenges[0].title}</h2>
          <p>{multi
            ? "Two open tasks — apply the script-intelligence method, then write a full script from a live brief."
            : challenges[0].intro}</p>
          {multi && (
            <div className="ch-stage-list">
              {challenges.map((c, i) => (
                <div className="csl-row" key={i}>
                  <span className="csl-n">{i + 1}</span>
                  <span className="csl-body"><b>{c.title}</b><span>{c.intro}</span></span>
                  <span className="csl-meta">{c.items.length} {c.kind === "pitch" ? "decisions" : c.kind === "open" ? "fields" : "rounds"}</span>
                </div>
              ))}
            </div>
          )}
          <div className="ch-meta">
            <div><b>{totalItems}</b><span>{multi ? "Tasks" : (challenges[0].kind === "order" ? "Steps" : challenges[0].kind === "open" ? "Tasks" : "Rounds")}</span></div>
            <div><b>{totalItems * 10}</b><span>Max XP</span></div>
            {best && <div><b>{best.score}/{best.total}</b><span>Your best</span></div>}
          </div>
          <button className="btn-primary" onClick={() => setRunning(true)}>
            {best ? "Replay challenge" : "Start challenge"} <i>→</i>
          </button>
        </div>
      )}

      {hasChallenges && stage === "challenge" && running && (
        <div className="anim a2" key="chr">
          <ChallengeRunner challenges={challenges} platforms={platforms} onDone={onFinish} />
        </div>
      )}
    </main>
  );
}

/* ---------------- Lab view: hands-on checklist ---------------- */
function LabView({ lab, checks, onToggle, onBack }) {
  const doneCount = checks.filter(Boolean).length;
  const total = lab.steps.length;
  const allDone = doneCount === total;
  return (
    <main className="screen" key={"lab" + lab.id} data-screen-label={lab.title}>
      <button className="back-link anim a1" onClick={onBack}><i>←</i> Level map</button>
      <header className="lv-head anim a2">
        <span className="lv-kicker lab">Hands-on · {lab.tag} · {lab.duration}</span>
        <h2 className="lv-title">{lab.title}</h2>
        <p className="lv-mission">{lab.subtitle}</p>
      </header>

      <div className="lab-goal glass anim a3">
        <strong>Mission goal</strong>
        <p>{lab.goal}</p>
        <div className="lab-prog">
          <div className="gbar-track"><i style={{ width: (doneCount / total) * 100 + "%" }}></i></div>
          <span>{doneCount}/{total}</span>
        </div>
      </div>

      <div className="lab-steps anim a4">
        {lab.steps.map((s, i) => (
          <button key={i} className={"lstep" + (checks[i] ? " done" : "")} onClick={() => onToggle(i)}>
            <span className="lstep-check">{checks[i] ? "✓" : i + 1}</span>
            <span className="oc-body">
              <span className="oc-t">{s.t}</span>
              <span className="oc-d">{s.d}</span>
            </span>
          </button>
        ))}
      </div>

      {allDone && (
        <div className="final-banner anim a2" style={{ marginTop: 30 }}>
          <strong>Lab complete.</strong> Nice work — head back to the map to keep climbing.
        </div>
      )}

      <div className="stage-next">
        <button className="btn-primary" onClick={onBack}>Back to the map <i>→</i></button>
      </div>
    </main>
  );
}

/* ---------------- Result ---------------- */
function ResultView({ level, result, rankedUp, hasNext, onReplay, onMap, onNext }) {
  const { score, total } = result;
  const st = starsFor(result);
  const pct = score / total;
  const headline = pct >= 0.9 ? "Flawless take." : pct >= 0.6 ? "That's a print." : "Worth another take.";
  return (
    <main className="screen" key={"res" + level.id}>
      <div className="result-card anim a2">
        <div className="res-stars">
          {[1, 2, 3].map((n) => <StarIcon key={n} size={38} className={n <= st ? "on" : ""} />)}
        </div>
        <h2>{headline}</h2>
        <p className="res-score">
          {level.code} · {level.name} — <b>{score}/{total}</b> correct · <b>+{score * 10} XP</b>
        </p>
        {rankedUp && (
          <div className="rankup">
            <span>Rank up</span>
            <b>{level.rank}</b>
          </div>
        )}
        <div className="res-actions">
          <button className="btn-ghost" onClick={onReplay}>Replay challenge</button>
          {hasNext
            ? <button className="btn-primary" onClick={onNext}>Next level <i>→</i></button>
            : <button className="btn-primary" onClick={onMap}>Level map <i>→</i></button>}
        </div>
      </div>
    </main>
  );
}

/* -------- Level 3: Visual Crafting panel content -------- */
function VcPanelContent({ sec }) {
  if (sec.type === "points") {
    return (
      <ul className="vc-points">
        {sec.points.map((pt, i) => <li key={i}>{pt}</li>)}
      </ul>
    );
  }
  if (sec.type === "styleGuide") {
    return (
      <>
        <div className="vc-sg-grid">
          {sec.components.map((c) => (
            <div className="vc-sg-card" key={c.n}>
              <div className="vc-sg-n">{c.n}</div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="vc-example">
          <span className="vc-example-label">Prompt Example</span>
          <p>{sec.example}</p>
        </div>
      </>
    );
  }
  if (sec.type === "promptFormula") {
    return (
      <>
        <div className="vc-formula">
          {sec.formula.map((f, i) => (
            <React.Fragment key={i}>
              <span className="vc-chip">{f}</span>
              {i < sec.formula.length - 1 && <span className="vc-formula-plus">+</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="vc-example">
          <span className="vc-example-label">{sec.exampleTitle}</span>
          <p>{sec.exampleText}</p>
          {sec.negative && <p className="vc-negative"><strong>Negative prompt:</strong> {sec.negative}</p>}
        </div>
        {sec.exampleScript && (
          <>
            <p className="vc-sub-head">{sec.exampleScript.title}</p>
            <div className="vc-script-table">
              <div className="vc-script-head">
                <span>Frame</span><span>Duration</span><span>VO / Text</span><span>Visual Description</span><span>Camera</span><span>Mood</span>
              </div>
              {sec.exampleScript.rows.map((r, i) => (
                <div className="vc-script-row" key={i}>
                  <span data-label="Frame"><b>{r.frame}</b></span>
                  <span data-label="Duration">{r.duration}</span>
                  <span data-label="VO / Text">{r.vo}</span>
                  <span data-label="Visual Description">{r.visual}</span>
                  <span data-label="Camera">{r.camera}</span>
                  <span data-label="Mood">{r.mood}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    );
  }
  if (sec.type === "character") {
    return (
      <div className="vc-char-steps">
        {sec.steps.map((st) => (
          <div className="vc-char-step" key={st.n}>
            <div className="vc-char-step-head">
              <span className="vc-char-step-n">{st.n}</span>
              <h4>{st.title}</h4>
            </div>
            {st.fields && (
              <div className="vc-char-fields">
                {st.fields.map((f) => (
                  <div className="vc-char-field" key={f.k}>
                    <span>{f.k}</span><p>{f.v}</p>
                  </div>
                ))}
              </div>
            )}
            {st.good && (
              <div className="vc-good-bad">
                <div className="vc-good">
                  <span className="vc-good-label">Good</span>
                  <p>{st.good}</p>
                </div>
                <div className="vc-bad">
                  <span className="vc-good-label">Bad</span>
                  <p>{st.bad}</p>
                </div>
              </div>
            )}
            {st.includes && (
              <ul className="vc-list">
                {st.includes.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            )}
            {st.example && (
              <div className="vc-example">
                <span className="vc-example-label">Reference Sheet Prompt</span>
                <p>{st.example}</p>
              </div>
            )}
            {st.categories && (
              <div className="vc-char-categories">
                {st.categories.map((cat, i) => (
                  <div className={"vc-char-cat" + (cat.label === "Do Not Change" ? " danger" : "")} key={i}>
                    <h5>{cat.label}</h5>
                    <ul>{cat.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="vc-char-step">
          <div className="vc-char-step-head">
            <span className="vc-char-step-n">✓</span>
            <h4>Consistency Checklist</h4>
          </div>
          <ul className="vc-checks">
            {sec.checklist.map((c, i) => (
              <li key={i}><span className="vc-check-box"></span>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  if (sec.type === "keyframes") {
    return (
      <>
        <div className="vc-frames">
          {sec.frames.map((f, i) => (
            <div className="vc-frame" key={i}>
              <div className="vc-frame-n">Frame {i + 1}</div>
              <h4>{f.label}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
        <ul className="vc-points vc-points-mt">
          {sec.rules.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </>
    );
  }
  if (sec.type === "checklist") {
    return (
      <>
        <p className="vc-headline">{sec.headline}</p>
        <ul className="vc-checks">
          {sec.checks.map((c, i) => (
            <li key={i}><span className="vc-check-box"></span>{c}</li>
          ))}
        </ul>
      </>
    );
  }
  if (sec.type === "pipeline") {
    return (
      <div className="vc-sg-grid">
        {sec.steps.map((s) => (
          <div className="vc-pipe-step" key={s.n}>
            <div className="vc-sg-n">{s.n}</div>
            <h4>{s.title}</h4>
            {s.desc && <p className="vc-pipe-desc">{s.desc}</p>}
          </div>
        ))}
      </div>
    );
  }
  if (sec.type === "scriptSteps") {
    return (
      <>
        <div className="vc-script-steps">
          {sec.steps.map((s, i) => (
            <div className="vc-script-step" key={i}>
              <div className="vc-sg-n">{i + 1}</div>
              <h4>{s.key}</h4>
              <p className="vc-script-step-q">{s.q}</p>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
        <div className="vc-example" style={{ marginTop: 20 }}>
          <span className="vc-example-label">Worked example · {sec.example}</span>
          <div className="vc-step-ex-grid">
            {sec.steps.map((s, i) => (
              <div className="vc-step-ex" key={i}>
                <b>{s.key}</b>
                <p>{s.ex}</p>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
  if (sec.type === "ideaGrid") {
    return (
      <div className="im-grid">
        {sec.items.map((m, i) => (
          <article className="im-card" key={i}>
            <div className="im-top"><span className="im-n">{m.n}</span><h4>{m.name}</h4></div>
            <span className="im-ask">{m.ask}</span>
            <div className="im-rows">
              <div className="im-row"><span>Idea</span><p>{m.idea}</p></div>
              <div className="im-row"><span>Concept</span><p>{m.concept}</p></div>
              <div className="im-row hook"><span>Hook</span><p>{m.hook}</p></div>
            </div>
          </article>
        ))}
      </div>
    );
  }
  if (sec.type === "shotGuide") {
    return (
      <div className="vc-shot-guide">
        <div className="vc-shot-col">
          <div className="vc-shot-head">Shot Types</div>
          {sec.shotTypes.map((r, i) => (
            <div className="vc-shot-row" key={i}>
              <span className="vc-cam-use">{r.purpose}</span>
              <span className="vc-cam-move">{r.shot}</span>
            </div>
          ))}
        </div>
        <div className="vc-shot-col">
          <div className="vc-shot-head">Camera Movement</div>
          {sec.cameraMovements.map((r, i) => (
            <div className="vc-shot-row" key={i}>
              <span className="vc-cam-use">{r.goal}</span>
              <span className="vc-cam-move">{r.move}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (sec.type === "methods") {
    return (
      <>
        <div className="vc-methods-table">
          <div className="vc-method-head">
            <span>Method</span><span>Starting Point</span><span>Primary Strength</span><span>Use Case</span>
          </div>
          {sec.rows.map((r, i) => (
            <div className="vc-method-row" key={i}>
              <span><b>{r.method}</b></span>
              <span>{r.start}</span>
              <span>{r.strength}</span>
              <span>{r.use}</span>
            </div>
          ))}
        </div>
        <p className="vc-sub-head">When to use camera references or keyframes</p>
        <div className="vc-kf-list">
          {sec.keyframes.map((kf, i) => (
            <div className="vc-kf-row" key={i}>
              <b>{kf.label}</b>
              <span>{kf.use}</span>
            </div>
          ))}
        </div>
      </>
    );
  }
  if (sec.type === "videoTemplate") {
    return (
      <>
        <div className="vc-example">
          <span className="vc-example-label">Template</span>
          <p>{sec.template}</p>
        </div>
        <p className="vc-sub-head">Inputs to give the AI</p>
        <div className="vc-sg-grid">
          {sec.inputs.map((inp) => (
            <div className="vc-sg-card" key={inp.n}>
              <div className="vc-sg-n">{inp.n}</div>
              <h4>{inp.label}</h4>
              <p>{inp.desc}</p>
            </div>
          ))}
        </div>
      </>
    );
  }
  if (sec.type === "cameraTable") {
    return (
      <div className="vc-cam-table">
        {sec.rows.map((r, i) => (
          <div className="vc-cam-row" key={i}>
            <span className="vc-cam-move">{r.move}</span>
            <span className="vc-cam-use">{r.use}</span>
            <span className="vc-cam-desc">{r.desc}</span>
          </div>
        ))}
      </div>
    );
  }
  if (sec.type === "gallery") {
    return (
      <>
        {sec.pdf && (
          <a className="btn-ghost vc-gallery-dl" href={sec.pdf} download>
            Download reference PDF <i>↓</i>
          </a>
        )}
        <div className="vc-gallery">
          {sec.images.map((img, i) => (
            <figure className="vc-gallery-item" key={i}>
              <img src={img.src} alt={img.label} loading="lazy" />
              <figcaption>{img.label}</figcaption>
            </figure>
          ))}
        </div>
      </>
    );
  }
  return null;
}

/* -------- Level 3: Visual Crafting six-box section -------- */
function VisualCraftingSection({ data }) {
  const { useState } = React;
  const [active, setActive] = useState(null);

  function toggle(n) { setActive(active === n ? null : n); }

  const activeSec = active !== null ? data.sections.find((s) => s.n === active) : null;

  return (
    <section className="l1-section anim a4">
      <div className="vc-grid">
        {data.sections.map((sec) => (
          <button
            key={sec.n}
            className={"vc-box" + (active === sec.n ? " active" : "")}
            onClick={() => toggle(sec.n)}
          >
            <div className="vc-box-n">{sec.n}</div>
            <div className="vc-box-title">{sec.title}</div>
            <span className="vc-box-sum">{sec.summary}</span>
            <span className="vc-box-arrow">{active === sec.n ? "▲" : "▼"}</span>
          </button>
        ))}
      </div>
      {activeSec && (
        <div className="vc-panel" key={active}>
          <div className="vc-panel-head">
            <span className="vc-panel-n">{activeSec.n}</span>
            <h3>{activeSec.title}</h3>
            <p>{activeSec.summary}</p>
          </div>
          <VcPanelContent sec={activeSec} />
        </div>
      )}
    </section>
  );
}

Object.assign(window, { GameTopBar, MapView, LevelView, LabView, ResultView, ScriptFramework, IdeaMethods, VisualCraftingSection, GameStarIcon: StarIcon });

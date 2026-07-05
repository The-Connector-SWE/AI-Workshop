// game-challenges.jsx — challenge engines: QuizChallenge, MatchChallenge, OrderChallenge.
// Each calls onDone(score, total) when the run finishes. No result screens here —
// the level view owns the result. Exports to window.

function shuffleArr(arr) {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/* ---------------- Copy to clipboard (shared) ---------------- */
function CopyButton({ text }) {
  const { useState } = React;
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <button className={"copy-btn" + (copied ? " copied" : "")} onClick={copy} type="button">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

/* ---------------- Progress dots (shared) ---------------- */
function ChDots({ count, idx }) {
  return (
    <div className="quiz-top">
      <div className="quiz-dots">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className={"qdot" + (i < idx ? " past" : "") + (i === idx ? " cur" : "")}></span>
        ))}
      </div>
      <span className="quiz-count">{Math.min(idx + 1, count)} / {count}</span>
    </div>
  );
}

/* ---------------- Quiz: classic multiple choice ---------------- */
function QuizChallenge({ challenge, onDone }) {
  const { useState } = React;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const q = challenge.items[idx];
  const total = challenge.items.length;

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) { setScore((s) => s + 1); window.SFX && window.SFX.correct(); }
    else { window.SFX && window.SFX.wrong(); }
  }
  function next() {
    if (idx + 1 < total) { setIdx(idx + 1); setPicked(null); }
    else onDone(score, total);
  }

  return (
    <div className="ch-wrap">
      <ChDots count={total} idx={idx} />
      <div className="quiz-card anim a1" key={idx}>
        <span className="quiz-kicker">{challenge.title}</span>
        <h2 className="quiz-q">{q.q}</h2>
        <div className="quiz-opts">
          {q.options.map((opt, i) => {
            let cls = "qopt";
            if (picked !== null) {
              if (i === q.answer) cls += " correct";
              else if (i === picked) cls += " wrong";
              else cls += " dim";
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)} disabled={picked !== null}>
                <span className="qk">{String.fromCharCode(65 + i)}</span>
                <span className="qopt-text">{opt}</span>
                {picked !== null && i === q.answer && <span className="qmark ok">✓</span>}
                {picked !== null && i === picked && i !== q.answer && <span className="qmark no">✕</span>}
              </button>
            );
          })}
        </div>
        <div className={"quiz-why" + (picked !== null ? " show" : "")}>
          {picked !== null && (
            <>
              <strong className={picked === q.answer ? "good" : "bad"}>
                {picked === q.answer ? "Correct" : "Not quite"}
              </strong>
              <span>{q.why}</span>
            </>
          )}
        </div>
        <div className="quiz-foot">
          <button className={"btn-primary" + (picked === null ? " disabled" : "")}
            onClick={next} disabled={picked === null}>
            {idx + 1 < total ? "Next" : "See results"} <i>→</i>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Match: brief → platform chip ---------------- */
function MatchChallenge({ challenge, platforms, onDone }) {
  const { useState } = React;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const it = challenge.items[idx];
  const total = challenge.items.length;

  function pick(pid) {
    if (picked !== null) return;
    setPicked(pid);
    if (pid === it.answer) { setScore((s) => s + 1); window.SFX && window.SFX.correct(); }
    else { window.SFX && window.SFX.wrong(); }
  }
  function next() {
    if (idx + 1 < total) { setIdx(idx + 1); setPicked(null); }
    else onDone(score, total);
  }

  return (
    <div className="ch-wrap">
      <ChDots count={total} idx={idx} />
      <div className="quiz-card anim a1" key={idx}>
        <span className="quiz-kicker">{challenge.title}</span>
        <h2 className="quiz-q">{it.brief}</h2>
        <div className="mc-opts">
          {challenge.options.map((pid) => {
            const p = platforms[pid];
            let cls = "mc-chip";
            if (picked !== null) {
              if (pid === it.answer) cls += " correct";
              else if (pid === picked) cls += " wrong";
              else cls += " dim";
            }
            return (
              <button key={pid} className={cls} onClick={() => pick(pid)} disabled={picked !== null}>
                <span className="plogo sm" style={{ color: p.hue }}><PlatformLogo id={pid} size={20} /></span>
                <span className="mc-name">{p.name}</span>
              </button>
            );
          })}
        </div>
        <div className={"quiz-why" + (picked !== null ? " show" : "")}>
          {picked !== null && (
            <>
              <strong className={picked === it.answer ? "good" : "bad"}>
                {picked === it.answer ? "Cast." : "Wrong call."}
              </strong>
              <span>{it.why}</span>
            </>
          )}
        </div>
        <div className="quiz-foot">
          <button className={"btn-primary" + (picked === null ? " disabled" : "")}
            onClick={next} disabled={picked === null}>
            {idx + 1 < total ? "Next brief" : "See results"} <i>→</i>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Order: tap shuffled cards into sequence ---------------- */
function OrderChallenge({ challenge, onDone }) {
  const { useState } = React;
  const items = challenge.items;
  const total = items.length;

  function freshPool() {
    let order = shuffleArr(items.map((_, i) => i));
    if (order.every((v, i) => v === i)) order = [...order.slice(1), order[0]];
    return order;
  }

  const [pool, setPool] = useState(freshPool);
  const [slots, setSlots] = useState(Array(total).fill(null));
  const [checked, setChecked] = useState(null);

  function place(k) {
    if (checked) return;
    const e = slots.indexOf(null);
    if (e === -1) return;
    const next = [...slots]; next[e] = k;
    setSlots(next);
    setPool(pool.filter((p) => p !== k));
    window.SFX && window.SFX.place();
  }
  function unplace(i) {
    if (checked || slots[i] === null) return;
    setPool([...pool, slots[i]]);
    const next = [...slots]; next[i] = null;
    setSlots(next);
  }
  function check() {
    const res = slots.map((k, i) => k === i);
    setChecked(res);
    if (window.SFX) { res.every(Boolean) ? window.SFX.correct() : window.SFX.wrong(); }
  }
  function retry() {
    setPool(freshPool());
    setSlots(Array(total).fill(null));
    setChecked(null);
  }
  const score = checked ? checked.filter(Boolean).length : 0;
  const allPlaced = pool.length === 0;

  return (
    <div className="ch-wrap">
      <div className="quiz-card oc-wrap anim a1">
        <span className="quiz-kicker">{challenge.title}</span>
        <h2 className="quiz-q">{challenge.intro}</h2>

        <div className="oc-slots">
          {slots.map((k, i) => {
            if (k === null) {
              return <div key={"e" + i} className="oc-slot"><span className="oc-n">{i + 1}</span>Empty — tap a shot below to place it</div>;
            }
            const cls = "oc-slot filled" + (checked ? (checked[i] ? " correct" : " wrong") : "");
            return (
              <button key={"s" + i} className={cls} onClick={() => unplace(i)} title={checked ? "" : "Tap to remove"}>
                <span className="oc-n">{i + 1}</span>
                <span className="oc-body">
                  <span className="oc-t">{items[k].t}</span>
                  <span className="oc-d">{items[k].d}</span>
                </span>
                {checked && <span className={"qmark " + (checked[i] ? "ok" : "no")}>{checked[i] ? "✓" : "✕"}</span>}
              </button>
            );
          })}
        </div>

        {pool.length > 0 && (
          <div className="oc-pool">
            <div className="oc-pool-label">Shuffled shots — tap to place</div>
            {pool.map((k) => (
              <button key={k} className="oc-card" onClick={() => place(k)}>
                <span className="oc-body">
                  <span className="oc-t">{items[k].t}</span>
                  <span className="oc-d">{items[k].d}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="quiz-foot oc-foot">
          {!checked && (
            <button className={"btn-primary" + (allPlaced ? "" : " disabled")} onClick={check} disabled={!allPlaced}>
              Check sequence <i>→</i>
            </button>
          )}
          {checked && (
            <>
              <span className="oc-score">{score}/{total} in the right slot</span>
              <button className="btn-ghost" onClick={retry}>Try again</button>
              <button className="btn-primary" onClick={() => onDone(score, total)}>
                Finish <i>→</i>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Pitch: build an agency pitch, one decision at a time ---------------- */
function PitchChallenge({ challenge, onDone }) {
  const { useState } = React;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState([]); // [{label, board, correct}]
  const it = challenge.items[idx];
  const total = challenge.items.length;
  const b = challenge.brief;

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === it.answer;
    if (correct) { setScore((s) => s + 1); window.SFX && window.SFX.correct(); }
    else { window.SFX && window.SFX.wrong(); }
    setBoard((bd) => [...bd, { label: it.label, board: it.board, correct }]);
  }
  function next() {
    if (idx + 1 < total) { setIdx(idx + 1); setPicked(null); }
    else onDone(score, total);
  }

  return (
    <div className="ch-wrap">
      <ChDots count={total} idx={idx} />

      <div className="pitch-brief">
        <span className="pb-title">The client brief</span>
        <div className="pb-row"><span>Client</span><b>{b.client}</b></div>
        <div className="pb-row"><span>Goal</span><b>{b.goal}</b></div>
        <div className="pb-row"><span>Audience</span><b>{b.audience}</b></div>
        <div className="pb-row"><span>Budget</span><b>{b.budget}</b></div>
      </div>

      <div className="quiz-card anim a1" key={idx}>
        <span className="pitch-step-label">
          <span className="psl-badge">{it.label}</span>
          <span className="quiz-kicker">Decision {idx + 1} of {total}</span>
        </span>
        <h2 className="quiz-q">{it.q}</h2>
        <div className="quiz-opts">
          {it.options.map((opt, i) => {
            let cls = "qopt";
            if (picked !== null) {
              if (i === it.answer) cls += " correct";
              else if (i === picked) cls += " wrong";
              else cls += " dim";
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)} disabled={picked !== null}>
                <span className="qk">{String.fromCharCode(65 + i)}</span>
                <span className="qopt-text">{opt}</span>
                {picked !== null && i === it.answer && <span className="qmark ok">✓</span>}
                {picked !== null && i === picked && i !== it.answer && <span className="qmark no">✕</span>}
              </button>
            );
          })}
        </div>
        <div className={"quiz-why" + (picked !== null ? " show" : "")}>
          {picked !== null && (
            <>
              <strong className={picked === it.answer ? "good" : "bad"}>
                {picked === it.answer ? "Strong call." : "Weak call."}
              </strong>
              <span>{it.why}</span>
            </>
          )}
        </div>
        <div className="quiz-foot">
          <button className={"btn-primary" + (picked === null ? " disabled" : "")}
            onClick={next} disabled={picked === null}>
            {idx + 1 < total ? "Next decision" : "See results"} <i>→</i>
          </button>
        </div>
      </div>

      <div className="pitch-board">
        <div className="pitch-board-h">Your pitch</div>
        {challenge.items.map((step, i) => {
          const filled = board[i];
          return (
            <div className="pbd-row" key={i}>
              <span className="pbd-label">{step.label}</span>
              <span className={"pbd-text" + (filled ? "" : " empty")}>
                {filled ? step.board : "—"}
              </span>
              {filled
                ? <span className={"qmark " + (filled.correct ? "ok" : "no")}>{filled.correct ? "✓" : "✕"}</span>
                : <span></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Open: self-directed task, no scoring ---------------- */
function OpenChallenge({ challenge, onDone }) {
  const b = challenge.brief;
  const hasTable = !!challenge.columns;

  return (
    <div className="ch-wrap">
      <div className="quiz-card anim a1">
        <span className="quiz-kicker">{challenge.title}</span>
        <p className="open-intro">{challenge.intro}</p>

        {challenge.prompt && (
          <blockquote className="open-prompt">
            {challenge.prompt}
            <CopyButton text={challenge.prompt} />
          </blockquote>
        )}

        {b && typeof b === "string" && (
          <blockquote className="open-prompt">
            {b}
            <CopyButton text={b} />
          </blockquote>
        )}

        {b && typeof b === "object" && (
          <div className="pitch-brief">
            <span className="pb-title">The brief</span>
            {b.client      && <div className="pb-row"><span>Client</span><b>{b.client}</b></div>}
            {b.audience    && <div className="pb-row"><span>Audience</span><b>{b.audience}</b></div>}
            {b.platform    && <div className="pb-row"><span>Platform</span><b>{b.platform}</b></div>}
            {b.goal        && <div className="pb-row"><span>Goal</span><b>{b.goal}</b></div>}
            {b.deliverable && <div className="pb-row"><span>Deliverable</span><b>{b.deliverable}</b></div>}
          </div>
        )}

        {challenge.goal && (
          <p className="open-task"><b>Goal:</b> {challenge.goal}</p>
        )}

        {challenge.wordSets && (
          <div className="open-wordsets">
            {challenge.wordSets.map((ws, i) => (
              <span key={i} className="open-wordset">{i + 1} — {ws}</span>
            ))}
          </div>
        )}

        {challenge.task && (
          <p className="open-task"><b>Task:</b> {challenge.task}</p>
        )}

        {hasTable ? (
          <div className="open-table-wrap">
            <table className="open-table">
              <thead>
                <tr>
                  <th>Frame</th>
                  {challenge.columns.map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {challenge.items.map((it, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    {challenge.columns.map((c) => <td key={c}>—</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="open-fields">
            {challenge.items.map((it, i) => (
              <div className="open-field" key={i}>
                <span className="open-field-label">{it.label}</span>
                <div className="open-field-line"></div>
              </div>
            ))}
          </div>
        )}

        <div className="quiz-foot">
          <button className="btn-primary" onClick={() => onDone(challenge.items.length, challenge.items.length)}>
            Done <i>→</i>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Runner: plays a level's challenges in sequence ---------------- */
function ChallengeRunner({ challenges, platforms, onDone }) {
  const { useState } = React;
  const [idx, setIdx] = useState(0);
  const [acc, setAcc] = useState({ score: 0, total: 0 });
  const [inter, setInter] = useState(null);
  const ch = challenges[idx];
  const multi = challenges.length > 1;
  const last = idx === challenges.length - 1;

  function handleDone(score, total) {
    const nextAcc = { score: acc.score + score, total: acc.total + total };
    if (last) { onDone(nextAcc.score, nextAcc.total); }
    else { setAcc(nextAcc); setInter({ score, total }); }
  }
  function cont() { setInter(null); setIdx(idx + 1); }

  if (inter) {
    const nextCh = challenges[idx + 1];
    return (
      <div className="ch-wrap">
        <div className="quiz-card stage-clear anim a1">
          <span className="quiz-kicker">Stage {idx + 1} of {challenges.length} cleared</span>
          <h2 className="quiz-q">{inter.score}/{inter.total} in {ch.title}</h2>
          <p className="sc-next">Up next · <b>{nextCh.title}</b></p>
          <p className="sc-intro">{nextCh.intro}</p>
          <div className="quiz-foot">
            <button className="btn-primary" onClick={cont}>Start {nextCh.title} <i>→</i></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {multi && (
        <div className="ch-stages">
          {challenges.map((c, i) => (
            <span key={i} className={"ch-stage" + (i < idx ? " past" : "") + (i === idx ? " cur" : "")}>
              <b>{i + 1}</b>{c.title}
            </span>
          ))}
        </div>
      )}
      {ch.kind === "quiz" && <QuizChallenge challenge={ch} onDone={handleDone} />}
      {ch.kind === "match" && <MatchChallenge challenge={ch} platforms={platforms} onDone={handleDone} />}
      {ch.kind === "order" && <OrderChallenge challenge={ch} onDone={handleDone} />}
      {ch.kind === "pitch" && <PitchChallenge challenge={ch} onDone={handleDone} />}
      {ch.kind === "open" && <OpenChallenge challenge={ch} onDone={handleDone} />}
    </>
  );
}

Object.assign(window, { QuizChallenge, MatchChallenge, OrderChallenge, PitchChallenge, OpenChallenge, ChallengeRunner, ChDots });

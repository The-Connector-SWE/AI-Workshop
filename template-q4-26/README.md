# The Director's Game — Template Q4-26

A futuristic, interactive redesign of the Director's Game for the online course, styled with the PodMedia Network design system (night canvas, brand red, ring motif).

Open `template-q4-26/index.html` (served from the repo root, e.g. `python3 -m http.server`, then `/template-q4-26/`).

## What's inside

| Screen | Route |
| --- | --- |
| Mission Control — rank track, level map, briefing | `#/map` |
| Lesson module — every section of a level | `#/level/<id>` |
| Challenge workspace — fill and lock each deliverable | `#/level/<id>/challenge/<n>` |
| Shot Match — 6-round knowledge check | `#/quiz` |
| Rank up — level cleared | `#/rankup/<id>` |
| Toolkit — every tool, screenshot slot, example output | `#/toolkit` or `#/toolkit/<tool-id>` |

## 3D world

`world3d.js` (Three.js r149) draws the Mission Map as six floating film-set islands with a director character the learner can customise (skin tone, jacket). The same character reacts in Shot Match and celebrates on the rank-up screen. Browsers without WebGL fall back to the flat layout.

## Where the content lives

- Lessons, challenges, ranks: `../game-data.jsx` (shared with the main game — edit there).
- Tools: `../data.jsx` (`PLATFORMS`) and `../logos.jsx` (glyphs).
- Visual examples (frame strips, shot gallery, camera simulator, quiz, tool outputs): `visuals.js`, using `../assets/frames/`.
- Progress is saved in the browser under `localStorage["tq426_directors_game"]`.

## Assets to add

- **Tool screenshots:** drop `assets/screenshots/<tool-id>.png` (e.g. `gemini.png`, `kling.png`). Until then the Toolkit shows a labelled placeholder.
- **Brand fonts:** if licensed for web use, add `assets/fonts/Codec-Pro-Variable.ttf` and `assets/fonts/Callheart.ttf`. Without them the page falls back to Outfit and Caveat from Google Fonts. The font files are not committed because this repository is public.

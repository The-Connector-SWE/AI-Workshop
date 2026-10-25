# The Director's Game — Template Q4-26

A futuristic, interactive redesign of the Director's Game for the online course, styled with the PodMedia Network design system (night canvas, brand red, ring motif), with a 3D world and a learner-made director character.

On Vercel the site root redirects here (`/vercel.json`). Locally, serve the repo root (`python3 -m http.server`) and open `/template-q4-26/`.

## Screens

| Screen | Route |
| --- | --- |
| Mission Control — character creator, rank track, 3D level map, briefing | `#/map` |
| Lesson — every section of a level, with a guide, read-aloud and visual examples | `#/level/<id>` |
| Challenge — fill each deliverable, attach images and clips | `#/level/<id>/challenge/<n>` |
| Rank up — level cleared; after the last level, the certificate | `#/rankup/<id>` |
| Toolkit — every tool, screenshot slot, example output, 3D set piece | `#/toolkit` or `#/toolkit/<tool-id>` |
| Final project — the Final Project Sprint lab with format picker and step tracking | `#/labs` |
| My reel — everything the learner attached, with download and the class upload folder | `#/reel` |
| Workshop — Instructors, AI Fun, Agenda, Accounts, Feedback, Upload, Certificates, Settings | `#/workshop/<tab>` |

## Settings (Workshop → Settings)

- **Language** — English or Arabic (right-to-left). The Arabic covers the interface; lesson content stays in the language of `game-data.jsx` until a reviewed translation is added there.
- **Instructor mode** — opens every level and the certificate, for demos and live sessions.
- **Presenter mode** — larger type for projecting in the room.
- **Reset progress** — clears XP, answers, attachments and the director on that device.

## Editing

- **Content** (lessons, challenges, ranks, tools, labs) lives in `../game-data.jsx`, `../data.jsx` and `../labs-data.js`. These are plain JavaScript; edit and deploy — no build needed.
- **App code** lives in `app.jsx`, `world3d.js`, `visuals.js`, `i18n.js` (and `../logos.jsx`). After editing, rebuild the bundle that `index.html` loads:

  ```sh
  cd template-q4-26
  npm install      # once
  npm run build    # writes dist/app.min.js
  ```

  `index.dev.html` loads the same sources uncompiled (slower, no build) for quick checks while editing.
- **Interface strings in Arabic** are in `i18n.js`, keyed by the English text.
- **Certificate link** is `CERT_URL` in `app.jsx` — the cohort roster link used by `claim.html`. Update it for each cohort.

## Where learner data lives

Everything is stored in the learner's own browser: progress, answers and the director in `localStorage["tq426_directors_game"]`, attached images and clips in IndexedDB (`tq426_media`). Nothing is sent to a server. Learners hand in work through the class Drive folder (Upload tab, or the button in My reel).

## 3D world

`world3d.js` (Three.js r149) adds a 3D layer across the app. Browsers without WebGL fall back to the flat layout, and motion calms down under reduced-motion settings. On phones the level map switches to a vertical trail.

## Assets to add

- **Tool screenshots:** `assets/screenshots/<tool-id>.png` (e.g. `gemini.png`). Until then the Toolkit shows a labelled placeholder.
- **Brand fonts:** if licensed for web use, `assets/fonts/Codec-Pro-Variable.ttf` and `assets/fonts/Callheart.ttf`. Without them the page uses Outfit and Caveat. They are not committed because this repository is public.
- **Analytics:** enable Web Analytics in the Vercel project to count visits; the script is already on the page.

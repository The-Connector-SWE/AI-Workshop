// missions.js — "Apply the level": one hands-on production mission per level.
// The learner carries ONE project of their own through all six levels:
// brief -> script -> storyboard -> frames -> clips -> voice -> final cut.
//
// Step output types:
//   fields  — labelled inputs (optionally chips)          value: { key: text }
//   table   — editable rows with fixed columns            value: [ { col: text } ]
//   frames  — one row per storyboard frame: prompt + file  value: [ { col: text } ] + attachments per row
//   media   — attach images / clips / audio               attachments only
//   checks  — production steps the learner has done       value: { i: true }
// Prompts are functions of ctx: ctx.get("1.platform.audience"), ctx.rows("2.board"), ctx.project.
// Exports window.TQ_MISSIONS (keyed by level id) and window.TQ_EXAMPLE (the MAZAJ sample project).

(function () {
  const rowsText = (rows, cols) => rows.map((r, i) => `Frame ${i + 1} | ` + cols.map((c) => `${c}: ${r[c] || "—"}`).join(" | ")).join("\n");

  const EXAMPLE = {
    project: { brand: "MAZAJ Iced Coffee", product: "Iced coffee in a can", platform: "TikTok / Instagram Reels", duration: "30 sec" },
    platform: {
      problem: "Iced coffee sales dip mid-morning — we need a reason to reach for it before the desk slump.",
      audience: "A university student who skipped breakfast and is dragging by 10am.",
      insight: "The morning doesn't start when you wake up — it starts when your mood shows up.",
      proposition: "One sip changes the whole mood.",
      rtb: "Strong caffeine, cold and ready in the fridge, priced for students.",
      tone: "Playful, cinematic, Gen Z street style",
    },
    script: [
      { Duration: "0:00–0:03", "VO / Text": "Another Monday…", "Visual Description": "Jamila on her bed, morning light, half asleep.", Camera: "Static wide", Mood: "Sleepy" },
      { Duration: "0:03–0:06", "VO / Text": "—", "Visual Description": "She pulls the fridge door open; cool light on her face.", Camera: "Handheld medium", Mood: "Curious" },
      { Duration: "0:06–0:09", "VO / Text": "Psst.", "Visual Description": "Her hand cracks the MAZAJ can open.", Camera: "Push-in close-up", Mood: "Anticipation" },
      { Duration: "0:09–0:14", "VO / Text": "One sip…", "Visual Description": "First sip; her eyes open, colour floods the room.", Camera: "Slow motion close-up", Mood: "Transformation" },
      { Duration: "0:14–0:24", "VO / Text": "…changes the whole mood.", "Visual Description": "She walks out to the street café, can in hand, headphones on.", Camera: "Tracking", Mood: "Confident" },
      { Duration: "0:24–0:30", "VO / Text": "MAZAJ. Until your mood finds you.", "Visual Description": "Hero can on the café table, tagline appears.", Camera: "Orbit", Mood: "Premium" },
    ],
  };

  const SCRIPT_COLS = ["Duration", "VO / Text", "Visual Description", "Camera", "Mood"];
  const BOARD_COLS = ["Time", "VO", "Visual Description", "Shot Type", "Camera Movement", "Mood"];
  const SHOTS = ["Wide", "Medium", "Close-up", "Macro", "Over-the-shoulder"];
  const MOVES = ["Static", "Push-in", "Pull-out", "Pan", "Tilt", "Orbit", "Tracking", "Handheld"];
  const MOVE_TEXT = {
    Static: "The camera stays locked off", "Push-in": "The camera slowly pushes in", "Pull-out": "The camera slowly pulls out",
    Pan: "The camera pans slowly", Tilt: "The camera tilts slowly", Orbit: "The camera slowly orbits the subject",
    Tracking: "The camera tracks alongside the subject", Handheld: "A slightly handheld camera follows the subject",
  };
  // VO lines: the directed table if saved, otherwise straight from the script
  const voLines = (c) => {
    const saved = c.rows("5.lines");
    if (saved.length) return saved;
    return c.rows("1.script").filter((r) => (r["VO / Text"] || "").trim() && r["VO / Text"].trim() !== "—").map((r) => ({ Line: r["VO / Text"], Approach: "", Direction: "" }));
  };

  const M = {};

  /* ---------- Level 1 · Brief & Strategy ---------- */
  M[1] = {
    title: "Write the brief your film will be built on",
    deliverable: "A one-page creative platform and a script table for your own project.",
    steps: [
      {
        id: "project", title: "Choose your project",
        do: "Pick a real brand, product or story you care about — or start from the MAZAJ sample. Decide the platform and the duration now: duration writes the shot count.",
        output: { type: "fields", fields: [
          { key: "brand", label: "Brand or story", hint: "e.g. MAZAJ Iced Coffee" },
          { key: "product", label: "Product or subject", hint: "What the film is about" },
          { key: "platform", label: "Platform", chips: ["TikTok / Instagram Reels", "YouTube", "TV / cinema", "Feed post"] },
          { key: "duration", label: "Duration", chips: ["6 sec", "15 sec", "30 sec", "60 sec"] },
        ] },
        rules: ["A 6-second idea is one idea and two shots.", "A 30-second idea is a story with a turn."],
        example: true,
      },
      {
        id: "platform", title: "Answer the five questions",
        do: "Fill the one-page creative platform in this order. Each answer is one or two sentences — if you can't say it simply, you don't know it yet.",
        tools: ["gemini", "chatgpt"],
        prompt: (c) => `I'm writing a creative brief for ${c.get("1.project.brand") || "[brand]"} (${c.get("1.project.product") || "[product]"}), a ${c.get("1.project.duration") || "[duration]"} film for ${c.get("1.project.platform") || "[platform]"}. Interview me one question at a time, in this order: business problem, the one real person we're talking to, the consumer insight (a human truth, not a product feature), the proposition in one sentence, and the reason to believe. Push back if an answer is vague.`,
        output: { type: "fields", fields: [
          { key: "problem", label: "Business problem", hint: "Why does this film exist at all?" },
          { key: "audience", label: "Audience", hint: "One real person — not “young people”" },
          { key: "insight", label: "Consumer insight", hint: "The human truth you're building on", long: true },
          { key: "proposition", label: "Proposition", hint: "One sentence, not two" },
          { key: "rtb", label: "Reason to believe", hint: "Why should they believe it?" },
          { key: "tone", label: "Tone & mandatories", hint: "Tone of voice, logo, tagline, legal" },
        ] },
        rules: ["Prompting is briefing: everything that ruins a brief ruins a prompt.", "Set tone, mandatories, duration and platform only after the five questions."],
        example: true,
      },
      {
        id: "gem", title: "Build your executive-producer Gem",
        do: "In Gemini, create a new Gem and paste these instructions. This Gem becomes your producer for the rest of the course. Paste its link (or a screenshot) below.",
        tools: ["gemini"],
        prompt: () => "You are my executive producer for short-form AI films. When I give you a brief: 1) write a demo storyboard with one short description per scene; 2) write the script and the voice-over line for each scene; 3) write one production-ready image prompt per scene, keeping character, product and visual style consistent. Ask me clarifying questions about brand, audience, platform and tone before producing anything. Output everything as clearly labelled sections and tables.",
        output: { type: "fields", fields: [{ key: "link", label: "Gem link or name", hint: "https://gemini.google.com/gem/…" }], attach: true },
      },
      {
        id: "script", title: "Turn the brief into a script table",
        do: "Send your platform to the Gem with this prompt, then copy its script table into the rows below — one row per frame. Edit until it has a beginning, a middle and a turn.",
        tools: ["gemini", "chatgpt"],
        prompt: (c) => `Act as a senior creative director, copywriter and film director. Write a professional ${c.get("1.project.duration") || "30-second"} ${c.get("1.project.platform") || "TikTok / Instagram Reels"} script for ${c.get("1.project.brand") || "[brand]"}.\nBusiness problem: ${c.get("1.platform.problem")}\nAudience: ${c.get("1.platform.audience")}\nInsight: ${c.get("1.platform.insight")}\nProposition: ${c.get("1.platform.proposition")}\nReason to believe: ${c.get("1.platform.rtb")}\nTone & mandatories: ${c.get("1.platform.tone")}\nOutput a table: Frame | Duration | VO / Text | Visual Description | Camera | Mood.`,
        output: { type: "table", columns: SCRIPT_COLS, rows: 5 },
        rules: ["The idea is describable in one sentence, with no tool name inside it."],
        example: true,
      },
    ],
    review: [
      "My insight is a human truth, not a product feature.",
      "My proposition is one sentence.",
      "My shot count fits the duration I chose.",
      "My script has a beginning, a middle and a turn.",
    ],
  };

  /* ---------- Level 2 · Pre-Visualization ---------- */
  M[2] = {
    title: "Storyboard your script",
    deliverable: "A shot-by-shot storyboard with a visual decision for every frame.",
    steps: [
      {
        id: "board", title: "Make a visual decision for every frame",
        do: "Your script rows are pulled in. For each frame choose the shot size and ONE camera movement, and say what the frame means. Rule of thumb: one shot, one movement.",
        carry: "1.script",
        output: { type: "table", columns: BOARD_COLS, chips: { "Shot Type": SHOTS, "Camera Movement": MOVES },
          seed: (c) => c.rows("1.script").map((r) => ({ Time: r.Duration || "", VO: r["VO / Text"] || "", "Visual Description": r["Visual Description"] || "", "Shot Type": "", "Camera Movement": "", Mood: r.Mood || "" })) },
        rules: ["Shot size, angle, movement, lens and time are five independent decisions.", "Open wide to set the location; go close for emotion and product."],
      },
      {
        id: "visual", title: "Generate the visual storyboard",
        do: "Paste this prompt into your Gem. It converts your table into a cinematic visual storyboard without changing the voice-over. Attach the storyboard it produces.",
        tools: ["gemini", "chatgpt"],
        prompt: (c) => `Act as a professional film director, art director and AI visual storyboard creator. Convert this storyboard table into a clear, detailed, cinematic visual storyboard. Do not rewrite the script or change the voice-over meaning — upgrade the visual direction professionally.\n\n${rowsText(c.rows("2.board"), BOARD_COLS)}`,
        output: { type: "media", accept: "image/*,application/pdf", min: 1 },
      },
    ],
    review: [
      "Every frame has a shot size and exactly one camera movement.",
      "An early wide shot tells us where we are.",
      "Each frame joins clearly to the one before and after it.",
    ],
  };

  /* ---------- Level 3 · Visual Crafting ---------- */
  M[3] = {
    title: "Generate consistent keyframes",
    deliverable: "Three bibles, a locked prompt DNA, a character sheet and one keyframe per storyboard frame.",
    steps: [
      {
        id: "bibles", title: "Write your three bibles",
        do: "List what must never change. These lists are pasted into every prompt from now on.",
        output: { type: "fields", fields: [
          { key: "character", label: "Character bible", hint: "Age, face, hair, skin, body, wardrobe, expression range", long: true },
          { key: "product", label: "Product bible", hint: "Silhouette, logo lockup, colours (HEX), finish, hero angle", long: true },
          { key: "location", label: "Location bible", hint: "Layout, light direction, time of day, palette", long: true },
        ] },
        rules: ["The character is the most-broken asset in AI advertising.", "In commercial work the product is the protagonist — it needs its own bible."],
      },
      {
        id: "dna", title: "Lock your prompt DNA",
        do: "Write the block that never changes across the project, and your control layer.",
        output: { type: "fields", fields: [
          { key: "locked", label: "Locked block", hint: "Style + palette + lighting + lens + ratio + render quality", long: true },
          { key: "control", label: "Control block", hint: "References, seed, negative prompt", long: true },
        ] },
        rules: ["Locked block never changes. Variable block changes every frame. Control block enforces it."],
      },
      {
        id: "sheet", title: "Generate the character reference sheet",
        do: "Generate the sheet in Nano Banana (or Firefly / GPT Image). Use it as the reference for every frame.",
        tools: ["nano-banana", "firefly", "gpt-image"],
        prompt: (c) => `Character reference sheet: ${c.get("3.bibles.character") || "[character bible]"}. Front view, side view, back view, face close-up and an expression sheet (neutral, tired, curious, happy, confident). Plain neutral background, even studio light, same outfit in every view. ${c.get("3.dna.locked") || ""}`,
        output: { type: "media", accept: "image/*", min: 1 },
      },
      {
        id: "frames", title: "Generate every keyframe",
        do: "One frame at a time — never the whole board in one go. Each prompt is your locked DNA plus that frame's variable block. Attach the frame you approve.",
        tools: ["nano-banana", "firefly", "gpt-image"],
        output: { type: "frames", from: "2.board",
          prompt: (c, r, i) => `Frame ${i + 1}. ${r["Visual Description"] || ""} ${r["Shot Type"] ? r["Shot Type"] + " shot." : ""} Mood: ${r.Mood || ""}.\nCharacter: ${c.get("3.bibles.character") || "[character bible]"}\nProduct: ${c.get("3.bibles.product") || "[product bible]"}\nLocation: ${c.get("3.bibles.location") || "[location bible]"}\n${c.get("3.dna.locked") || "[locked block]"}\nUse the attached character sheet as reference. ${c.get("3.dna.control") || ""}` },
        rules: ["Keep faces, product and text inside the central 1:1 zone so one frame serves every ratio.", "Repair before you regenerate: upscale, inpaint, outpaint, new reference — regenerate last."],
      },
    ],
    review: [
      "Every frame matches its storyboard row.",
      "The character looks like the same person in every frame.",
      "The product and location are consistent.",
      "Each frame is suitable for animation and connects to the next.",
    ],
  };

  /* ---------- Level 4 · Motion Orchestration ---------- */
  M[4] = {
    title: "Bring your frames to life",
    deliverable: "One short clip per approved frame, and one broken shot diagnosed and fixed.",
    steps: [
      {
        id: "motion", title: "Write one video prompt per frame",
        do: "Image-to-video: your approved frame is the first frame. Describe what the subject does and what moves in the world — the camera movement comes from your storyboard.",
        output: { type: "frames", from: "2.board", noAttach: true, columns: ["Subject action", "Environment motion"],
          prompt: (c, r, i) => `${r["Subject action"] || "[subject action]"}. ${MOVE_TEXT[r["Camera Movement"]] || MOVE_TEXT.Static}. ${r["Environment motion"] || "[environment motion]"}. Keep the character, outfit, product and lighting exactly as in the first frame. Frame ${i + 1}, ${r.Time || "5 sec"}.` },
        rules: ["One motion per shot — a pan and a push-in in the same five seconds gives you neither.", "Motion needs a reason; slower reads as premium.", "Never animate the logo frame."],
      },
      {
        id: "clips", title: "Generate short clips",
        do: "Upload each approved frame as the first frame in Kling, Veo or Seedance, paste its prompt, and generate 5-second clips — not long videos. Attach the clip you keep.",
        tools: ["kling", "veo", "seedance"],
        output: { type: "frames", from: "2.board", accept: "video/*", promptFrom: "motion" },
      },
      {
        id: "triage", title: "Diagnose one broken shot",
        do: "Pick a clip that didn't work. Name the symptom and its likely cause, apply the smallest fix, and re-shoot against the approved frame.",
        output: { type: "fields", fields: [
          { key: "symptom", label: "Symptom", chips: ["Face changes", "Hands deform", "Product changes", "Wrong camera move", "Shot feels dead"] },
          { key: "cause", label: "Likely cause", hint: "e.g. too much motion in 5 seconds" },
          { key: "fix", label: "Fix applied", hint: "The smallest change that fixed it", long: true },
        ], attach: true, accept: "video/*,image/*" },
      },
    ],
    review: [
      "Every clip starts from its approved frame.",
      "Each clip has one camera movement, with a reason.",
      "Faces, hands and the product hold up for the whole clip.",
    ],
  };

  /* ---------- Level 5 · Voice Direction ---------- */
  M[5] = {
    title: "Give your film a voice",
    deliverable: "A directed read for every VO line, as audio files.",
    steps: [
      {
        id: "lines", title: "Direct every line",
        do: "Your VO lines are pulled from the script. For each, choose how you'll get the voice and write the direction: pace, emotion, emphasis.",
        carry: "1.script",
        output: { type: "table", columns: ["Line", "Approach", "Direction"], chips: { Approach: ["Generate", "Design a voice", "Clone (with consent)", "Stock library"] }, seed: voLines },
        rules: ["Clone a voice only with the owner's consent and rights.", "Keep one voice for the whole film unless the story needs two."],
      },
      {
        id: "audio", title: "Produce the voice-over",
        do: "Generate the lines in ElevenLabs (or Firefly audio). Check each read against the shot duration, then attach the audio.",
        tools: ["elevenlabs", "firefly-audio"],
        prompt: (c) => `Voice direction for ${c.get("1.project.brand") || "my film"}:\n` + voLines(c).map((r, i) => `${i + 1}. "${r.Line}" — ${r.Direction || "natural, warm"}`).join("\n"),
        output: { type: "media", accept: "audio/*,video/*", min: 1 },
      },
    ],
    review: [
      "Every line fits the duration of its shot.",
      "The voice matches the tone in my brief.",
      "I have the rights to every voice I used.",
    ],
  };

  /* ---------- Level 6 · Full-Stack Production ---------- */
  M[6] = {
    title: "Cut the finished film",
    deliverable: "Your finished film, exported for every platform you need.",
    steps: [
      {
        id: "assembly", title: "Assemble and finish",
        do: "Work through the assembly in your editor of choice. Tick each stage when it's really done.",
        tools: ["canva", "capcut", "premiere", "firefly-timeline"],
        output: { type: "checks", items: [
          "Every clip and VO line is on one timeline, in order",
          "Cut for rhythm and pace — trims and transitions tightened",
          "Colour and look match across every shot",
          "VO, music and SFX mixed into one final mix",
        ] },
      },
      {
        id: "export", title: "Export for delivery",
        do: "Export the formats your platforms need, then attach the final cut.",
        output: { type: "fields", fields: [{ key: "formats", label: "Formats exported", chips: ["9:16", "4:5", "1:1", "16:9"], multi: true }], attach: true, accept: "video/*" },
        rules: ["9:16 → Reels · TikTok · Stories, 4:5 → Feed, 1:1 → Grid, 16:9 → YouTube · TV."],
      },
    ],
    review: [
      "The film keeps the promise in my one-page platform.",
      "The logo frame is still and clean.",
      "I watched the final export start to finish, with sound.",
    ],
  };

  window.TQ_MISSIONS = M;
  window.TQ_EXAMPLE = EXAMPLE;
})();

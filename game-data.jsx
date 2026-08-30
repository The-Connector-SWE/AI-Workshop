// game-data.jsx — The Director's Game: 6 levels, each with learning, tools, challenge.
// V3: Levels 1-4 upgraded from the AAST "AI Production Workflow" course deck.
// Exports to window.GAME = { LEVELS, RANKS }.

const RANKS = [
  "Production Assistant", // 0 levels cleared
  "Strategist",           // 1
  "Storyboard Artist",    // 2
  "Art Director",         // 3
  "Motion Director",      // 4
  "Voice Director",       // 5
  "Director",             // 6
];

const LEVELS = [
  {
    id: 1,
    code: "Level 01",
    name: "Brief & Strategy",
    tag: "Foundations",
    rank: "Strategist",
    mission:
      "Where the idea comes from — before a single prompt is written. Prompting is briefing: everything that ruins a brief ruins a prompt the same way.",
    tools: ["gemini", "chatgpt"],
    learning: [],
    briefStrategy: {
      title: "Brief & Strategy",
      intro: "Five questions, asked in this order. Answer them and the film writes itself.",
      sections: [
        {
          n: "01",
          title: "The One-Page Creative Platform",
          summary: "Five questions, asked in this order. Answer them and the film writes itself.",
          type: "scriptSteps",
          example: "MAZAJ Iced Coffee",
          steps: [
            { key: "Business Problem", q: "Why does this film exist at all?", d: "Name the business problem behind the film.", ex: "Iced coffee sales dip mid-morning — we need a reason to reach for it before the desk slump." },
            { key: "Audience", q: "Who exactly are we talking to?", d: "Not \"young people\". One real person.", ex: "A university student who skipped breakfast and is dragging by 10am." },
            { key: "Consumer Insight", q: "What human truth are we building on?", d: "Something true and unspoken the audience lives — not a product feature.", ex: "Mood decides whether the morning works, and nobody admits that." },
            { key: "Proposition", q: "What is the one thing they must remember?", d: "One sentence. Not two — two means you haven't decided yet.", ex: "One sip changes the whole mood." },
            { key: "Reason to Believe", q: "And why should they believe us?", d: "Proof, demonstration, ingredient, price, heritage.", ex: "Real caffeine strength, visible in how fast her expression changes." },
          ],
        },
        {
          n: "02",
          title: "Duration Decides Everything",
          summary: "Only after the five questions: tone, mandatories, duration, platform.",
          type: "points",
          points: [
            "A 6-second idea is one idea and two shots.",
            "A 30-second idea is a story with a turn.",
            "Never treat duration as a detail you decide at the end — it writes the shot count, the pacing, and the budget.",
            "Then, and only then, set: tone of voice, mandatories (logo, tagline, legal), duration, platform.",
          ],
        },
        {
          n: "03",
          title: "Prompting Is Briefing",
          summary: "Insight → Idea → Story → Script → Storyboard.",
          type: "pipeline",
          steps: [
            { n: "01", title: "Insight", desc: "The human truth you're building on." },
            { n: "02", title: "Idea", desc: "Describable in one sentence, with no tool name inside it." },
            { n: "03", title: "Story", desc: "The idea given a beginning, middle, and turn." },
            { n: "04", title: "Script", desc: "The story written as dialogue, VO, and directions." },
            { n: "05", title: "Storyboard", desc: "The script turned into a shot-by-shot visual plan." },
          ],
          exampleTitle: "Rule",
          exampleText: "A prompt is a brief written for a machine. Everything that ruins a brief — vagueness, contradiction, missing mandatories, no tone of voice — ruins a prompt in exactly the same way. If your idea needs the tool to be explained, it is not an idea — it is an effect.",
        },
      ],
    },
    challenges: [
      {
        kind: "open",
        title: "How to Create a Gem",
        intro: "Build a custom Gem that works as your AI executive producer, then put it to work producing a demo package.",
        prompt: "Your job is to guide a creator from a raw idea to a fully produced short-form video package. When given a brief, you must: 1) Create a demo storyboard, writing a short description for every scene. 2) Generate the script and voice-over (VO) line for each scene. 3) Generate a production-ready AI image prompt for each frame, written for Nano Banana 2 & GPT Image 2. Keep character, product, and visual style consistent across every scene. Ask clarifying questions about brand, audience, platform, and tone before producing the final package. Output the storyboard, script/VO, and image prompts as clearly labeled sections. We need the system instructions to create this custom Gem — write them as a complete, ready-to-paste system instructions block for the Gem's configuration.",
        items: [
          { label: "Write instructions for a custom Gem that works as executive producer" },
          { label: "Create a demo storyboard with a description per scene" },
          { label: "Generate the script and VO per scene" },
          { label: "Generate the prompt that creates each image for Nano Banana 2 & GPT Image 2" },
        ],
      },
      {
        kind: "open",
        title: "Build the One-Page Creative Platform",
        intro: "Answer the five questions, in order, for your own brief.",
        prompt: "Answer these five questions in order for your brief: the business problem, the one real person you're talking to, the human truth you're building on, the proposition (one sentence), and the reason to believe. Only after all five, set tone of voice, mandatories, duration, and platform.",
        items: [
          { label: "Business problem — why does this film exist?" },
          { label: "Audience — one real person, not \"young people\"" },
          { label: "Consumer insight — the human truth" },
          { label: "Proposition — one sentence, not two" },
          { label: "Reason to believe" },
          { label: "Then set: tone, mandatories, duration, platform" },
        ],
      },
      {
        kind: "open",
        title: "Idea to Script",
        intro: "Turn this brief into a professional 30-second script table.",
        prompt: "Create a professional 30-second TikTok / Instagram Reels script from this brief. Write the table script using this format: Frame | Duration | VO / Text | Visual Description | Camera | Mood. Style camera movement requirements: Cinematic, colorful, playful street style, Gen Z-focused, not generic, built around the transformation: \"One sip changes the whole mood.\" Use natural mixed English. Brief: Jamila wakes up tired before work. She opens the fridge and finds MAZAJ Iced Coffee. After one sip, her mood changes. She gets ready, opens her laptop, and start working feeling confident. The product appears with the tagline: MAZAJ Iced Coffee — Until your mood finds you. Brand: Mazaj Product: Ice Coffee Audience: Gen Z, university students, young creatives Goal: Launch new iced coffee CTA: Until your mood finds you Benefit: Strong caffeine, affordable Packaging: Can Location: Street café / urban street Platform: TikTok / Instagram Reels Duration: 30 sec. Output: Script Table",
        columns: ["Duration", "VO / Text", "Visual Description", "Camera", "Mood"],
        items: [
          { label: "Frame 1" },
          { label: "Frame 2" },
          { label: "Frame 3" },
          { label: "Frame 4" },
          { label: "Frame 5" },
        ],
      },
    ],
  },

  {
    id: 2,
    code: "Level 02",
    name: "Pre-Visualization",
    tag: "Storyboard",
    rank: "Storyboard Artist",
    mission:
      "Turning a script into a plan a machine can execute. Formerly \"Strategic Visualization\".",
    tools: ["gemini", "chatgpt"],
    learning: [],
    preVisualization: {
      title: "Pre-Visualization",
      intro: "Frame · Shot · Scene — hierarchy is read bottom-up. Production is planned top-down.",
      sections: [
        {
          n: "01",
          title: "Frame · Shot · Scene",
          summary: "Hierarchy is read bottom-up. Production is planned top-down: Script › Scenes › Shot list › Frames.",
          type: "styleGuide",
          components: [
            { n: "Frame", title: "The Smallest Unit", desc: "A single still image. At 24 fps you see 24 of them every second. This is what you design." },
            { n: "Shot", title: "Continuous Recording", desc: "One continuous recording, from \"Action\" to \"Cut\". No cuts inside it. This is what a model generates." },
            { n: "Scene", title: "The Story Unit", desc: "A dramatic event in one place, continuous in time. Usually built from several shots. This is what the audience remembers." },
          ],
          example: "FRAME → SHOT → SCENE → SEQUENCE → FILM",
        },
        {
          n: "02",
          title: "The Five Axes of a Shot",
          summary: "Five independent axes. Rule of thumb: one shot = one camera movement.",
          type: "cameraTable",
          rows: [
            { move: "Shot size", use: "ECU · CU · MCU · MS · MLS · WS · EWS", desc: "How much we see" },
            { move: "Camera angle", use: "Eye · High · Low · Overhead · Dutch", desc: "How we feel about the subject" },
            { move: "Camera movement", use: "Static · Push-in · Pull-out · Pan · Tilt · Track · Orbit · Handheld", desc: "How the frame changes" },
            { move: "Lens", use: "24mm wide · 35mm natural · 50mm neutral · 85mm portrait", desc: "Depth and distortion" },
            { move: "Time", use: "Real-time · Slow motion · Time-lapse", desc: "Internal rhythm" },
          ],
        },
        {
          n: "03",
          title: "The Storyboard Sheet",
          summary: "Every column answers one of four questions. If it doesn't, it doesn't belong on the sheet.",
          type: "styleGuide",
          components: [
            { n: "01", title: "Address", desc: "Frame # · Scene · Duration (sec) · Aspect · Asset ID — where the shot sits, how long it runs, what the file is called." },
            { n: "02", title: "Visual Decision", desc: "Shot size · Camera angle · Camera movement · Lens — the four deliberate choices that build the frame." },
            { n: "03", title: "Meaning", desc: "Visual description · VO / on-screen text · SFX & music · Mood — what the shot says in picture, words, and sound." },
            { n: "04", title: "Connection", desc: "Transition · Continuity note — how this shot joins the one before it and the one after it." },
          ],
          example: "If a column doesn't answer one of these four questions, it doesn't belong on the sheet.",
        },
        {
          n: "04",
          title: "Convert Script to Storyboard",
          summary: "Prompt example.",
          type: "promptFormula",
          formula: ["Frame No.", "Time", "VO", "Visual Description", "Shot Type", "Mood", "Camera Movement"],
          exampleTitle: "Prompt Example",
          exampleText: "Convert the script that contains a storyboard table with the following columns: Frame No. | Time | VO | Visual Description | Shot Type | Mood | Camera Movement. Your task is to convert this script into a clear, detailed, cinematic visual storyboard. Do not rewrite the script or change the voice-over meaning. Use the existing script as the foundation, then upgrade the visual direction professionally.",
          negative: "",
        },
      ],
    },
    challenges: [
      {
        kind: "open",
        title: "Create Visual Story Board",
        intro: "Convert the script into a clear, detailed, cinematic visual storyboard.",
        prompt: "Convert the script that contains a storyboard table with the following columns: Frame No. | Time | VO | Visual Description | Shot Type | Mood | Camera Movement. Your task is to convert this script into a clear, detailed, cinematic visual storyboard. Do not rewrite the script or change the voice-over meaning. Use the existing script as the foundation, then upgrade the visual direction professionally.",
        columns: ["Time", "VO", "Visual Description", "Shot Type", "Mood", "Camera Movement"],
        items: [
          { label: "Frame 1" },
          { label: "Frame 2" },
          { label: "Frame 3" },
          { label: "Frame 4" },
          { label: "Frame 5" },
        ],
      },
    ],
  },

  {
    id: 3,
    code: "Level 03",
    name: "Visual Crafting",
    tag: "Visual Creation",
    rank: "Art Director",
    mission:
      "Building the frames — and making them stay the same across sixty of them.",
    tools: ["firefly", "nano-banana", "gpt-image"],
    learning: [],
    challenges: [
      {
        kind: "open",
        title: "Build the Character Reference Sheet",
        intro: "Use the locked character prompt below to generate Jamila's reference sheet — front, side, back, face close-up, and all 5 expressions.",
        prompt: "Character reference sheet of Jamila, a 21 year old, with dark brown wavy shoulder length hair, warm brown eyes, olive tan skin, soft round face, average slim body, wearing cozy light blue long pajama pants and a matching button up pajama shirt, barefoot, slightly messy morning hair, natural sleepy face. Show front view, side view, back view, face close-up, and 5 expressions: very tired, sleepy, surprised, refreshed, focused and happy. Clean white background, cozy realistic character design, consistent proportions, clear outfit details, soft morning lifestyle mood, cinematic mood.",
        items: [
          { label: "Front view" },
          { label: "Side view" },
          { label: "Back view" },
          { label: "Face close-up" },
          { label: "5 expressions" },
        ],
      },
      {
        kind: "open",
        title: "Prompt Every Frame",
        intro: "create prompt for each frame in the storyboard",
        columns: ["AI Image Prompt"],
        items: [
          { label: "Frame 1" },
          { label: "Frame 2" },
          { label: "Frame 3" },
          { label: "Frame 4" },
          { label: "Frame 5" },
          { label: "Frame 6" },
          { label: "Frame 7" },
          { label: "Frame 8" },
          { label: "Frame 9" },
        ],
      },
    ],
    visualCrafting: {
      title: "Visual Crafting",
      intro: "The three bibles, prompt DNA, and the consistency ladder — everything that keeps sixty frames looking like one film.",
      sections: [
        {
          n: "01",
          title: "The Three Bibles",
          summary: "Character, product, location — never change what's locked.",
          type: "styleGuide",
          components: [
            { n: "01", title: "Character", desc: "Identity, wardrobe, expression range — the hero, and the most-broken asset in AI advertising. Never change: age · hair · skin · outfit · build." },
            { n: "02", title: "Product", desc: "Silhouette · logo lockup · HEX · label type · finish · hero angle. In commercial work the product is the protagonist — it needs its own bible." },
            { n: "03", title: "Location", desc: "Space, light, and palette across every shot. Never change: layout · light direction · time of day · palette." },
          ],
          example: "The workshop gave the character a bible. In commercial work the product is the protagonist — it needs one more.",
        },
        {
          n: "02",
          title: "Prompt DNA",
          summary: "Locked, variable, and control blocks — the anatomy of every image prompt.",
          type: "styleGuide",
          components: [
            { n: "Locked", title: "Locked Block", desc: "Style + palette + lighting + lens + ratio + render quality. Never changes — one project = one locked block." },
            { n: "Variable", title: "Variable Block", desc: "Character state + action + location + emotion + shot + angle. Changes every single frame." },
            { n: "Control", title: "Control Block", desc: "References + seed + negative prompt (where supported). The layer that actually enforces consistency." },
          ],
          example: "If the locked block changes mid-project, every frame before it is now wrong.",
        },
        {
          n: "03",
          title: "The Consistency Ladder",
          summary: "Text describes. References enforce.",
          type: "cameraTable",
          rows: [
            { move: "1. Text description only", use: "Weak", desc: "Early exploration" },
            { move: "2. Fixed prompt block", use: "Medium", desc: "Non-sequential frames" },
            { move: "3. Seed lock + fixed block", use: "Medium+", desc: "Variations of one frame" },
            { move: "4. Image reference / character lock", use: "Strong", desc: "The default for commercial work" },
            { move: "5. Multi-reference: character + product + location", use: "Very strong", desc: "A full film" },
            { move: "6. Trained character model", use: "Highest", desc: "Long campaign or recurring IP" },
          ],
        },
        {
          n: "04",
          title: "One Generation, Four Deliveries",
          summary: "Generate at 9:16 and protect the central crop zone — every other format comes out of it, with no re-generation.",
          type: "points",
          points: [
            "9:16 → Reels · TikTok · Stories",
            "4:5 → Feed",
            "1:1 → Grid · Display",
            "16:9 → YouTube · TV",
            "Safe-area thinking: keep faces, product and text inside the central 1:1 zone. Let only atmosphere live in the edges you're willing to lose.",
          ],
        },
        {
          n: "05",
          title: "Master Visual Direction",
          summary: "Use the same structural formula for every scene prompt — never skip an element.",
          type: "promptFormula",
          formula: ["Frame no.", "Frame description", "Composition", "Mood", "Camera angle", "Lighting", "Technical format", "Negative prompt"],
          exampleTitle: "Scene Example",
          exampleText: "Jamila, a 21 year old Egyptian woman with dark brown wavy shoulder-length hair, warm brown eyes, olive tan skin, soft round face, average slim body, wearing cozy light blue long pajama pants and a matching button-up pajama shirt, barefoot, slightly messy morning hair, natural sleepy face, sits tired on the edge of her bed in a small modern student bedroom. Books and a laptop are on the desk, soft morning light enters through the window, her expression is sleepy and unfocused, cinematic realistic Gen Z lifestyle commercial. Wide shot, shallow depth of field, warm beige and soft brown color palette, 9:16 vertical format.",
          negative: "blurry, distorted face, extra fingers, unrealistic anatomy, different outfit, different character, bad hands, text, watermark, low quality",
        },
        {
          n: "06",
          title: "Frame Chaining",
          summary: "Design the handoff, not just the shot. This is the difference between a film and a pile of clips.",
          type: "frameChain",
          rows: [
            {
              label: "Shot 01",
              cells: [
                { text: "Opening" },
                { text: "Action" },
                { text: "End Frame", hot: true },
              ],
              handoffAfter: "same composition",
            },
            {
              label: "Shot 02",
              cells: [
                { text: "Open Frame", hot: true },
                { text: "Action" },
                { text: "End" },
              ],
            },
          ],
          lines: [
            "Design the handoff, not just the shot.",
            "This is the difference between a film and a pile of clips.",
          ],
        },
        {
          n: "07",
          title: "The Repair Ladder",
          summary: "Use the smallest tool that fixes the problem. Only move right if you have to.",
          type: "repairLadder",
          leftLabel: "Cheap · Fast",
          rightLabel: "Slow · Expensive",
          steps: [
            { n: "01", title: "Upscale", desc: "It looks right, it is just soft." },
            { n: "02", title: "Inpaint", desc: "One small detail is broken." },
            { n: "03", title: "Outpaint", desc: "The frame is too tight." },
            { n: "04", title: "New Reference", desc: "The face or the product changed." },
            { n: "05", title: "Regenerate", desc: "Nothing about it works." },
          ],
          exampleText: "Step 05 is where most students start. It is the one that costs the most.",
        },
        {
          n: "08",
          title: "Asset Discipline",
          summary: "The prompt log is your negative. Lose it and you cannot reproduce your own work.",
          type: "styleGuide",
          components: [
            { n: "01", title: "File Naming", desc: "PROJ_SC01_SH03_KF-A_v02.png — Project · Scene · Shot · Keyframe (A/B/C) · Version." },
            { n: "02", title: "Folder Structure", desc: "/01_brief /02_board /03_refs /04_keyframes /05_clips /06_audio /07_edit /08_masters" },
            { n: "03", title: "Prompt Log", desc: "For every accepted image, record: prompt · seed · model + version · references used · date." },
          ],
          example: "The prompt log is your negative. Lose it and you cannot reproduce your own work — or hand it to a client.",
        },
        {
          n: "09",
          title: "Images Consistency Checklist",
          summary: "A beautiful image means nothing if it doesn't serve the story.",
          type: "checklist",
          headline: "Do not accept beautiful images if they do not serve the story.",
          checks: [
            "Does it match the storyboard?",
            "Is the character consistent?",
            "Is the location consistent?",
            "Is the mood correct?",
            "Is the camera angle correct?",
            "Is it suitable for video animation?",
            "Does it visually connect to the previous and next scenes?",
          ],
        },
        {
          n: "10",
          title: "Reference Output: Final Frame Gallery",
          summary: "The complete 15-frame set generated end-to-end with a locked character and style.",
          type: "gallery",
          pdf: "assets/frames/video-frames-reference.pdf",
          images: [
            { src: "assets/frames/frame-01.jpg", label: "Frame 1" },
            { src: "assets/frames/frame-02.jpg", label: "Frame 2" },
            { src: "assets/frames/frame-03.jpg", label: "Frame 3" },
            { src: "assets/frames/frame-04.jpg", label: "Frame 4" },
            { src: "assets/frames/frame-05.jpg", label: "Frame 5" },
            { src: "assets/frames/frame-06.jpg", label: "Frame 6" },
            { src: "assets/frames/frame-07.jpg", label: "Frame 7" },
            { src: "assets/frames/frame-08.jpg", label: "Frame 8" },
            { src: "assets/frames/frame-09.jpg", label: "Frame 9" },
            { src: "assets/frames/frame-10.jpg", label: "Frame 10" },
            { src: "assets/frames/frame-11.jpg", label: "Frame 11" },
            { src: "assets/frames/frame-12.jpg", label: "Frame 12" },
            { src: "assets/frames/frame-13.jpg", label: "Frame 13" },
            { src: "assets/frames/frame-14.jpg", label: "Frame 14" },
            { src: "assets/frames/frame-15.jpg", label: "Frame 15" },
          ],
        },
      ],
    },
  },

  {
    id: 4,
    code: "Level 04",
    name: "Motion Orchestration",
    tag: "Image to Video",
    rank: "Motion Director",
    mission:
      "Turning still frames into shots — with intent, not with luck.",
    tools: ["kling", "veo", "seedance", "seedance-2.5", "gemini-omni", "firefly"],
    learning: [],
    motionOrchestration: {
      title: "Motion Orchestration",
      intro: "Three ways in, the control ladder, and the arithmetic of a 30-second film.",
      sections: [
        {
          n: "01",
          title: "Three Ways In",
          summary: "Commercial work is image-to-video. You already approved the frame — don't let the model re-invent it.",
          type: "methods",
          rows: [
            { method: "Text-to-Video", start: "A prompt", strength: "Concept generation", use: "The Creator — exploration and mood-finding" },
            { method: "Image-to-Video", start: "A still frame", strength: "Visual consistency", use: "The Director — commercial work, once the board is locked" },
            { method: "Video-to-Video", start: "An existing clip", strength: "Style transformation", use: "The Editor — restyling or repairing footage you already have" },
          ],
          keyframes: [
            { label: "Commercial work is image-to-video.", use: "You already approved the frame — don't let the model re-invent it." },
            { label: "Text-to-video belongs in exploration.", use: "It does not belong after the board is locked." },
          ],
        },
        {
          n: "02",
          title: "The Control Ladder",
          summary: "First + last frame is the single most under-used control in student work.",
          type: "cameraTable",
          rows: [
            { move: "Text only", use: "Weak", desc: "You are still exploring" },
            { move: "First frame", use: "Medium", desc: "Simple movement out of one image" },
            { move: "First + last frame", use: "Strong", desc: "The shot must end on a specific composition" },
            { move: "Motion reference video", use: "Very strong", desc: "You need a real camera move copied" },
            { move: "Video-to-video", use: "Transformative", desc: "Restyling or repairing footage you already have" },
          ],
        },
        {
          n: "03",
          title: "Core Camera Movements",
          summary: "Eight movements — when to use each and what it does to the frame.",
          type: "cameraTable",
          rows: [
            { move: "Push-in", use: "Emotional beats, product detail", desc: "Moves toward the subject" },
            { move: "Pull-out", use: "Context, reveal", desc: "Moves away from the subject" },
            { move: "Pan", use: "Follow movement, scan a space", desc: "Pivots horizontally from a fixed position" },
            { move: "Tilt", use: "Reveal scale or importance", desc: "Pivots vertically from a fixed position" },
            { move: "Orbit", use: "Product depth, premium feel", desc: "Circles around the subject" },
            { move: "Tracking", use: "Following a walking character", desc: "Moves parallel with a moving subject" },
            { move: "Handheld", use: "Lifestyle, realism, social", desc: "Slight natural shake" },
            { move: "Static", use: "Calm, clean, premium", desc: "No movement at all" },
          ],
        },
        {
          n: "04",
          title: "Motion Design Rules",
          summary: "Movement carries meaning. It is not decoration, and stillness is a choice.",
          type: "points",
          points: [
            "One motion per shot — a pan and a push-in in the same five seconds gives you neither.",
            "Motion needs a reason — movement carries meaning, it's not decoration, and stillness is a choice.",
            "Slower reads as premium — fast motion is also where faces and hands break.",
            "Never animate the logo frame — keep it still, or move it in the edit. Generated logos deform.",
          ],
        },
        {
          n: "05",
          title: "Video Prompt Structure",
          summary: "Subject Action + Camera Movement + Environment Motion + Consistency Lock.",
          type: "promptFormula",
          formula: ["Subject Action", "Camera Movement", "Environment Motion", "Consistency Lock"],
          exampleTitle: "Prompt Example",
          exampleText: "Jamila takes her first sip of Iced Coffee while her expression shifts from tired to refreshed. The camera slowly pushes in. Morning light moves softly through the curtains of the cozy kitchen in the background. Motion is slow and cinematic. Keep the same identity, face, outfit, product, composition, lighting, background, and visual style from the input image.",
          negative: "",
        },
        {
          n: "06",
          title: "The Arithmetic of a 30-Second Film",
          summary: "Set an iteration budget per shot — before you start.",
          type: "styleGuide",
          components: [
            { n: "12", title: "Shots", desc: "30s ÷ 2.5s average" },
            { n: "~36", title: "Keyframes", desc: "3 per shot" },
            { n: "~120", title: "Image Gens", desc: "≈4 attempts each" },
            { n: "~60", title: "Video Gens", desc: "4–6 attempts per shot" },
          ],
          example: "Roughly one generation in four to six is usable. That's normal — it's not a sign you're doing it wrong. When you hit your budget on a shot, stop generating and go back to the keyframe. The problem is almost always upstream.",
        },
        {
          n: "07",
          title: "Failure Triage",
          summary: "Almost every video failure is an image failure that wasn't caught in Visual Crafting.",
          type: "cameraTable",
          rows: [
            { move: "The face changes mid-shot", use: "Face is too small in frame", desc: "Tighten the shot or reduce the motion" },
            { move: "Hands deform", use: "Fast or complex action", desc: "Simplify the action, slow the move" },
            { move: "The product changes", use: "No product reference", desc: "Lock with a reference image, not words" },
            { move: "Camera moves the wrong way", use: "Contradictory phrasing", desc: "One motion, one action, one sentence" },
            { move: "The shot feels dead", use: "No environment motion", desc: "Add micro-motion: steam, curtain, light" },
          ],
        },
      ],
    },
    challenges: [
      {
        kind: "open",
        title: "Prompt Your Frames for Animation",
        intro: "Ask your executive partner (Gemini or ChatGPT) to turn each locked frame into an image-to-video prompt for your chosen model.",
        prompt: "I will upload one storyboard frame/image. Analyze the image carefully and write the best image-to-video prompt for [TOOL NAME: Kling / Veo / Seedance / Adobe Firefly]. Goal of the shot: [Write the purpose of the shot or paste the VO/script line] Video duration: [5 seconds / 10 seconds] Aspect ratio: [1:1 / 16:9 / 9:16] Visual style: [Cinematic / realistic / luxury commercial / documentary / Gen Z lifestyle / premium product ad]. Your task: Identify the main subject. Suggest subject motion. Suggest camera movement. Add subtle environment motion. Keep the prompt short, clear, and cinematic. Do not rewrite the whole image description. Focus mainly on object, motion and environment. Add a consistency lock: keep the same identity, face, outfit, product, composition, lighting, background, and visual style. Output format: Image-to-video prompt: / Negative / avoid:",
        columns: ["Image-to-Video Prompt"],
        items: [
          { label: "Frame 1" },
          { label: "Frame 2" },
          { label: "Frame 3" },
          { label: "Frame 4" },
          { label: "Frame 5" },
          { label: "Frame 6" },
          { label: "Frame 7" },
          { label: "Frame 8" },
          { label: "Frame 9" },
        ],
      },
      {
        kind: "open",
        title: "Diagnose a Broken Shot",
        intro: "Pick one clip that didn't work and run it through the failure triage.",
        prompt: "Identify the symptom (face change, hand deform, product drift, wrong camera move, or a dead shot), name the likely cause, and apply the smallest fix from the triage table before regenerating anything.",
        items: [
          { label: "Symptom identified" },
          { label: "Likely cause named" },
          { label: "Fix applied (not a full regenerate, unless nothing else works)" },
          { label: "Re-shot and compared against the original approved frame" },
        ],
      },
    ],
  },

  {
    id: 5,
    code: "Level 05",
    name: "Voice Direction",
    tag: "Quick-Learning Module",
    rank: "Voice Director",
    mission:
      "Directing the sound of a project the way you'd direct its picture — generate a performance, shape it, clone it, or pull it from stock, then know when to use each.",
    tools: ["elevenlabs", "firefly-audio"],
    learning: [],
    voiceDirection: {
      title: "Voice Direction",
      intro: "Four ways to get a voice — know when to reach for each.",
      sections: [
        {
          n: "01",
          title: "Ways to Get a Voice",
          summary: "Four approaches — know when to reach for each.",
          type: "points",
          points: [
            "Voice-over generation — turning a script into a performed read",
            "Voice design — shaping tone, pace, and character for a voice that doesn't exist yet",
            "Voice cloning — recreating a specific voice (with consent/rights) for consistent narration",
            "Stock voice libraries — when to license a ready-made voice instead of generating one",
          ],
        },
      ],
    },
    challenges: [
      {
        kind: "open",
        title: "Script to Sound",
        intro: "Using the script table you built on day one, give it a voice.",
        prompt: "For the script table I'm about to give you, recommend a delivery approach per line — generate, design, clone (only with rights), or pull from a stock library — and explain why. Then write direction notes (emotion, pace, emphasis) for each line so the read matches the story.",
        items: [
          { label: "Pull up your script table — every scene/line you scripted in Brief & Strategy" },
          { label: "For each VO line, pick a delivery approach: generate a fresh AI voice, design a custom voice persona, clone a reference voice (only with rights to do so), or pull one from a stock voice library" },
          { label: "Generate the VO pass in ElevenLabs (or Adobe Firefly's audio tools) for at least two lines using two different approaches, so you can compare results" },
          { label: "Sync-check: read the timing of your generated VO against the beats in your script table — trim or re-pace where the read runs long or short" },
          { label: "Deliverable: an exported VO track, line-matched to your script table, ready to hand off into Full-Stack Production" },
        ],
      },
    ],
  },

  {
    id: 6,
    code: "Level 06",
    name: "Full-Stack Production",
    tag: "End-to-End Delivery",
    rank: "Director",
    mission:
      "Bring it all together — visuals, motion, and voice-over into one finished cinematic cut.",
    tools: ["canva", "firefly-timeline", "capcut", "premiere"],
    learning: [],
    fullStackProduction: {
      title: "Full-Stack Production",
      intro: "Six steps from raw footage to a finished, delivery-ready cut.",
      sections: [
        {
          n: "01",
          title: "Full-Stack Assembly",
          summary: "Six steps from raw footage to a finished, delivery-ready cut.",
          type: "pipeline",
          steps: [
            { n: "01", title: "Assemble the Timeline", desc: "Lay every visual, motion clip, and VO line onto a single timeline, in order." },
            { n: "02", title: "Edit for Rhythm & Pace", desc: "Cut for pacing — trim beats, tighten transitions, find the rhythm of the finished piece." },
            { n: "03", title: "Lock Color & Look Consistency", desc: "Carry the Visual Crafting pillar through every shot so the grade reads as one film." },
            { n: "04", title: "Mix the Sound", desc: "Layer VO, music, and SFX into one final mix." },
            { n: "05", title: "Export for Delivery", desc: "Export across the formats and aspect ratios your platforms need." },
            { n: "06", title: "Final QA Pass", desc: "Check the cut against the workshop's promise: a blank prompt to a finished cinematic cut." },
          ],
        },
        {
          n: "02",
          title: "The Assembly Toolkit",
          summary: "Four tools, four jobs — pick the one that matches your pace and finish.",
          type: "styleGuide",
          components: [
            { n: "01", title: "Canva", desc: "Fast timeline assembly and templated exports when you need a finished cut without a full NLE." },
            { n: "02", title: "Firefly Timeline", desc: "Adobe Firefly's own timeline tools for rough assembly before a full edit." },
            { n: "03", title: "CapCut", desc: "Fast, mobile-friendly cutting and captions for a social-first pace." },
            { n: "04", title: "Premiere Pro", desc: "The professional NLE for the final grade, mix, and delivery-ready export." },
          ],
          example: "Timeline assembly (Canva / Firefly Timeline) → pacing & color pass → sound mix → export (CapCut for speed, Premiere Pro for the full finish).",
        },
        {
          n: "03",
          title: "What You're Learning",
          summary: "The full list — from timeline to final QA.",
          type: "checklist",
          headline: "Everything you've built comes together here.",
          checks: [
            "Assembling visuals, motion, and voice-over onto a single timeline",
            "Editing rhythm and pacing for a finished cut",
            "Color/look consistency across shots (carrying through the Visual Crafting pillar)",
            "Layering sound: VO + music + SFX into a final mix",
            "Exporting for delivery across formats/aspect ratios",
            "Final QA pass against the workshop's promise: a blank prompt to a finished cinematic cut",
          ],
        },
      ],
    },
  },
];

function levelItemCount(lv) {
  const chs = lv.challenges || (lv.challenge ? [lv.challenge] : []);
  return chs.reduce((n, c) => n + (c.items ? c.items.length : 0), 0);
}

window.GAME = { LEVELS, RANKS, levelItemCount };

// game-data.jsx — The Director's Game: 5 levels, each with learning, tools, challenge.
// Exports to window.GAME = { LEVELS, RANKS }.

const RANKS = [
  "Production Assistant", // 0 levels cleared
  "Storyboard Artist",    // 1
  "Art Director",         // 2
  "Motion Director",      // 3
  "The Director",         // 4
];

const LEVELS = [
  {
    id: 1,
    code: "Level 01",
    name: "Strategic Visualization",
    tag: "Storyboard",
    rank: "Storyboard Artist",
    mission:
      "Convert your script into a storyboard — highlight the moments, build one visual box per script line, and choose your shot type before anything is rendered.",
    tools: ["gemini", "gpt-image"],
    learning: [],
    strategicViz: {
      title: "Strategic Visualization",
      sections: [
        {
          n: "01",
          title: "Script to Storyboard",
          summary: "Three steps: highlight the script, build your frames, choose your shots.",
          type: "pipeline",
          steps: [
            { n: "01", title: "Highlight the Script", desc: "Read through and mark every key moment — the beats the camera must capture." },
            { n: "02", title: "Turn Moments to Frames", desc: "Convert each highlighted moment into a visual instruction — what the camera actually shows." },
            { n: "03", title: "Choose the Camera Shot", desc: "Assign a shot type and camera movement to each frame before rendering anything." },
          ],
        },
        {
          n: "02",
          title: "Frames, Shots & Scenes",
          summary: "Frame → Shot → Scene → Sequence → Film.",
          type: "styleGuide",
          components: [
            { n: "Frames", title: "The Smallest Unit", desc: "A single still image. At 24 fps you're seeing 24 individual frames every second — this is frame design." },
            { n: "Shots", title: "Continuous Camera Recording", desc: "The continuous recording between 'Action' and 'Cut.' No cuts inside — that entire piece is ONE SHOT." },
            { n: "Scenes", title: "The Story Unit", desc: "A dramatic event in the same place, continuous — usually built from multiple shots. The whole interaction is ONE SCENE." },
          ],
          example: "Think of it like this: FRAME — SHOT — SCENE — SEQUENCE — FILM",
        },
        {
          n: "03",
          title: "Shot Guide",
          summary: "Shot types and camera movements — which to use and when.",
          type: "shotGuide",
          shotTypes: [
            { purpose: "Show location", shot: "Wide shot" },
            { purpose: "Character emotion", shot: "Close-up" },
            { purpose: "Show action", shot: "Medium shot" },
            { purpose: "Product beauty", shot: "Macro / close-up" },
            { purpose: "Transformation", shot: "Slow motion" },
            { purpose: "Show lifestyle", shot: "Tracking shot" },
          ],
          cameraMovements: [
            { goal: "To create focus or emotion", move: "Push-in" },
            { goal: "To reveal the full scene", move: "Pull-out" },
            { goal: "To follow movement", move: "Tracking shot" },
            { goal: "To make product feel premium", move: "Orbit" },
            { goal: "To feel natural and lifestyle", move: "Handheld" },
            { goal: "To feel calm, clean, premium", move: "Static shot" },
          ],
        },
        {
          n: "04",
          title: "Convert Script to Storyboard",
          summary: "The AI prompt that upgrades your script into a cinematic visual storyboard.",
          type: "promptFormula",
          formula: ["Frame No.", "Time", "VO", "Visual Description", "Shot Type", "Mood", "Camera Movement"],
          exampleTitle: "The AI Prompt",
          exampleText: "Act as a professional film director, art director, and AI visual storyboard creator. I will upload a PDF script with a storyboard table: Frame No. | Time | VO | Visual Description | Shot Type | Mood | Camera Movement. Convert this script into a clear, detailed, cinematic visual storyboard. Do not rewrite the script or change the voice-over meaning. Use the existing script as the foundation, then upgrade the visual direction professionally.",
          negative: "",
        },
      ],
    },
    challenge: {
      kind: "open",
      title: "Frame by Frame",
      intro: "In 5 minutes, convert this script into 5 storyboard frames.",
      prompt: "Jamila wakes up tired before work. She opens the fridge and finds MAZAJ Iced Coffee. After one sip, her mood changes. She gets ready, opens her laptop, and starts working feeling confident. The product appears with the tagline: MAZAJ Iced Coffee — Until your mood finds you.",
      columns: ["Duration", "VO / Text", "Shot Type", "Camera / Motion", "Description"],
      items: [
        { label: "Frame 1" },
        { label: "Frame 2" },
        { label: "Frame 3" },
        { label: "Frame 4" },
        { label: "Frame 5" },
      ],
    },
  },

  {
    id: 2,
    code: "Level 02",
    name: "Visual Crafting",
    tag: "Visual Creation",
    rank: "Art Director",
    mission:
      "Six steps to bring your storyboard to life — from locking the visual style to reviewing every frame for story fit.",
    tools: ["firefly", "nano-banana", "gpt-image"],
    learning: [],
    challenges: [
      {
        kind: "open",
        title: "The Same Brief, 4 Visuals",
        intro: "Coffee brand targeting Gen Z in Saudi. Same idea — four different visual directions. Write an image prompt for each style and explain in one sentence why it works.",
        brief: {
          client: "Coffee Brand",
          audience: "Gen Z in Saudi",
          goal: "Same idea, different visual directions",
          deliverable: "4 image prompts + short reason why each style works",
        },
        items: [
          { label: "Cinematic lifestyle — prompt + reason" },
          { label: "Luxury editorial — prompt + reason" },
          { label: "Documentary realistic — prompt + reason" },
          { label: "Futuristic AI style — prompt + reason" },
        ],
      },
      {
        kind: "open",
        title: "Bad Prompt vs Pro Prompt",
        intro: "Take this weak brief and rewrite it as a professional AI image prompt. Fill in all eight elements.",
        prompt: "Create a girl drinking coffee in Saudi, cool style",
        items: [
          { label: "Subject" },
          { label: "Environment" },
          { label: "Mood" },
          { label: "Camera angle" },
          { label: "Lighting" },
          { label: "Style" },
          { label: "Details" },
          { label: "Ratio" },
        ],
      },
      {
        kind: "open",
        title: "The 3-Word Prompt Challenge",
        intro: "Choose one set of three words from the list below. Use them to create a full image prompt and a one-line visual concept.",
        wordSets: [
          "Coffee + Chaos + Morning",
          "Luxury + Silence + Espresso",
          "Saudi + Study + Night",
          "Gen Z + Overthinking + Cold Brew",
          "Desert + Fashion + Coffee",
          "Rain + Car + Coffee",
        ],
        items: [
          { label: "Your 3 words" },
          { label: "Image prompt" },
          { label: "Visual concept" },
        ],
      },
    ],
    visualCrafting: {
      title: "Visual Crafting",
      intro: "Six steps to bring your storyboard to life — from locking the visual style to reviewing every frame for story fit.",
      sections: [
        {
          n: "01",
          title: "Lock the Storyboard First",
          summary: "Finalise every shot decision before rendering a single frame.",
          type: "points",
          points: [
            "Storyboard decisions are cheap — rendering is not. Change your mind here, not after spending credits.",
            "Lock every shot: subject, setting, mood, and camera angle.",
            "Get a second pair of eyes on the board before you commit to render.",
            "In the workshop, that's your facilitator — pitch it, adjust, then commit.",
          ],
        },
        {
          n: "02",
          title: "Maintain Character Consistency",
          summary: "Build and lock your character guide before the first render — then never deviate.",
          type: "character",
          steps: [
            {
              n: 1,
              title: "Start with the Character Concept",
              fields: [
                { k: "Name", v: "Jamila" },
                { k: "Age", v: "21" },
                { k: "Personality", v: "Tired at first, curious, energetic, confident" },
                { k: "Role", v: "Main character — university student" },
                { k: "Main goal", v: "Start her workday, but she wakes up tired and low-energy" },
                { k: "World/genre", v: "Cozy realistic home lifestyle, morning routine, soft cinematic storyboard" },
              ],
            },
            {
              n: 2,
              title: "Create a Fixed Visual Description",
              good: "Jamila, a 21-year-old, with dark brown wavy shoulder-length hair, warm brown eyes, olive tan skin, soft round face, average slim body, wearing cozy light blue long pajama pants and a matching button-up pajama shirt, barefoot, slightly messy morning hair, natural sleepy face.",
              bad: "A woman with brown hair and pyjamas.",
            },
            {
              n: 3,
              title: "Make a Character Reference Sheet",
              includes: ["Front view", "Side view", "Back view", "Face close-up", "Expression sheet", "Important accessories", "Color palette"],
            },
            {
              n: 4,
              title: "Build a Mini Character Guide",
              categories: [
                { label: "Body", items: ["21 years old", "Young adult", "Average slim body"] },
                { label: "Hair", items: ["Dark brown hair", "Wavy texture", "Shoulder-length", "Slightly messy in the morning"] },
                { label: "Face", items: ["Soft round face", "Warm brown eyes", "Olive tan skin", "Natural sleepy morning look"] },
                { label: "Clothes", items: ["Cozy long pajama pants", "Matching pajama shirt", "Light-blue color", "Barefoot"] },
                { label: "Main Object", items: ["Iced coffee"] },
                { label: "Do Not Change", items: ["Her age", "Her Egyptian identity", "Her dark brown wavy hair", "Her warm brown eyes", "Her olive tan skin", "Her slim body shape", "Her light-blue pajama pants and shirt", "The iced coffee as the mood-changing object", "The cozy morning home atmosphere"] },
              ],
            },
          ],
          checklist: [
            "Does the face look like the same person?",
            "Is the hair the same shape and color?",
            "Are the clothes correct?",
            "Are the accessories still there?",
            "Is the body size/age consistent?",
            "Is the art style the same?",
            "Does the emotion match the story?",
            "Is the camera angle clear?",
          ],
        },
        {
          n: "03",
          title: "Create a Visual Style Guide",
          summary: "One style, locked — art, lighting, palette, ratio, character design, and lens feel.",
          type: "styleGuide",
          components: [
            { n: "01", title: "Art Style", desc: "3D photorealistic, cinematic animation, documentary, anime, minimalist, etc." },
            { n: "02", title: "Color Palette", desc: "Warm, cold, muted, high contrast, pastel, monochrome" },
            { n: "03", title: "Lighting", desc: "Natural daylight, soft studio lighting, dramatic shadows, neon lighting, golden hour" },
            { n: "04", title: "Aspect Ratio", desc: "Video 16:9 · TikTok/Reels 9:16 · Feed posts 4:5 · Grid 1:1 · Ultrawide 21:9" },
            { n: "05", title: "Character Design", desc: "Same clothes, age, face, hair, body type, expression style across all frames" },
            { n: "06", title: "Lens / Camera Feel", desc: "Cinematic 35mm, documentary lens, shallow depth of field, etc." },
          ],
          example: "Cinematic realistic Gen Z lifestyle commercial, 9:16 vertical format, soft natural morning light, warm beige and creamy brown color palette, fresh iced coffee tones, shallow depth of field, realistic textures, premium but youthful mood, smooth camera movement, clean modern university lifestyle atmosphere.",
        },
        {
          n: "04",
          title: "Master Visual Direction",
          summary: "Use the same structural formula for every scene prompt — never skip an element.",
          type: "promptFormula",
          formula: ["Scene number", "Scene description", "Camera angle", "Composition", "Lighting", "Mood", "Technical format", "Negative prompt"],
          exampleTitle: "Scene 01",
          exampleText: "Jamila, a 21 year old Egyptian woman with dark brown wavy shoulder-length hair, warm brown eyes, olive tan skin, soft round face, average slim body, wearing cozy light blue long pajama pants and a matching button-up pajama shirt, barefoot, slightly messy morning hair, natural sleepy face, sits tired on the edge of her bed in a small modern student bedroom. Books and a laptop are on the desk, soft morning light enters through the window, her expression is sleepy and unfocused. Wide shot, cinematic realistic Gen Z lifestyle commercial, warm beige and soft brown color palette, shallow depth of field, 9:16 vertical format.",
          negative: "blurry, distorted face, extra fingers, unrealistic anatomy, different outfit, different character, bad hands, text, watermark, low quality",
        },
        {
          n: "05",
          title: "Generate Keyframes for Scenes",
          summary: "Start with the most important visual moments — not every second.",
          type: "keyframes",
          frames: [
            { label: "Opening Frame", desc: "How the scene begins — Jamila holds the coffee can close to her face, still looking tired" },
            { label: "Main Action Frame", desc: "The most important moment — Jamila takes the first sip, eyes softly closing" },
            { label: "Ending Frame", desc: "The scene transitions out — refreshing feeling begins, she becomes more confident, mood is brighter" },
          ],
          rules: [
            "For simple scenes, one image may be enough.",
            "For complex scenes, generate 2-3 keyframes.",
            "A keyframe is the most important visual moment in a scene — not every second needs a frame.",
          ],
        },
        {
          n: "06",
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
      ],
    },
  },

  {
    id: 3,
    code: "Level 03",
    name: "Motion Orchestration",
    tag: "Image to Video",
    rank: "Motion Director",
    mission:
      "Frames become film. Follow the six-step production pipeline — from locking motion for each frame to merging clips into a finished video.",
    tools: ["marey", "kling", "veo", "seedance", "firefly-video"],
    learning: [],
    motionOrchestration: {
      title: "Motion Orchestration",
      intro: "The six-step production pipeline — from locking your frames to delivering a finished video.",
      sections: [
        {
          n: "01",
          title: "Production Pipeline",
          summary: "Six steps from locked frame to finished video — in order, every time.",
          type: "pipeline",
          steps: [
            { n: "01", title: "Prepare Your Frames Before Animation" },
            { n: "02", title: "Decide the Motion for Each Frame" },
            { n: "03", title: "Upload the Image as the First Frame" },
            { n: "04", title: "Write the Prompt Correctly" },
            { n: "05", title: "Generate Short Clips, Not Long Videos" },
            { n: "06", title: "Merge All Clips to Create Full Video" },
          ],
        },
        {
          n: "02",
          title: "Three Methods for Generated Video",
          summary: "Text prompt for ideas, still image for consistency, video clip for restyling.",
          type: "methods",
          rows: [
            { method: "Text-to-Video", start: "Text Prompt", strength: "Concept generation", use: "Ideation, new content creation — the Creator Start" },
            { method: "Image-to-Video", start: "Still Image", strength: "Visual consistency", use: "Cinematic shots, product ads — the Director Start" },
            { method: "Video-to-Video", start: "Video Clip", strength: "Style transformation", use: "Restyling, fixing/enhancing footage — the Editor Start" },
          ],
          keyframes: [
            { label: "First frame only", use: "When you want a simple movement from one image" },
            { label: "First + last frame", use: "When you want the shot to end in a specific pose or composition" },
            { label: "Motion reference video", use: "When you want the generated video to copy a real camera move" },
          ],
        },
        {
          n: "03",
          title: "Video Prompt Structure",
          summary: "Subject Action + Camera Movement + Environment Motion + Consistency Lock.",
          type: "promptFormula",
          formula: ["Subject Action", "Camera Movement", "Environment Motion", "Consistency Lock"],
          exampleTitle: "Prompt Example",
          exampleText: "Jamila takes her first sip of Iced Coffee while her expression shifts from tired to refreshed. The camera slowly pushes in. Morning light moves softly through the curtains of the cozy kitchen in the background. Motion is slow and cinematic. Keep the same identity, face, outfit, product, composition, lighting, background, and visual style from the input image.",
          negative: "",
        },
        {
          n: "04",
          title: "Image-to-Video Prompt Template",
          summary: "The AI prompt that generates the best image-to-video prompt for your tool.",
          type: "promptFormula",
          formula: ["Image / Frame", "Script or VO", "Shot Duration", "Platform / Tool", "Ratio", "Motion Style", "Consistency Lock"],
          exampleTitle: "The AI Prompt",
          exampleText: "Act as a professional film director, AI video prompt engineer, and motion designer. I will upload one storyboard frame/image. Analyze the image carefully and write the best image-to-video prompt for [TOOL NAME: Kling / Runway / Firefly / Seedance]. Goal of the shot: [Write the purpose of the shot or paste the VO/script line] Video duration: [5 seconds / 10 seconds] Aspect ratio: [1:1 / 16:9 / 9:16] Visual style: [Cinematic / realistic / luxury commercial / documentary / Gen Z lifestyle / premium product ad]. Your task: Identify the main subject. Suggest subject motion. Suggest camera movement. Add subtle environment motion. Keep the prompt short, clear, and cinematic. Do not rewrite the whole image description. Focus mainly on object, motion and environment. Add a consistency lock: keep the same identity, face, outfit, product, composition, lighting, background, and visual style. Output format: Image-to-video prompt: / Negative / avoid:",
          negative: "",
        },
        {
          n: "05",
          title: "Core Camera Movements",
          summary: "Seven movements — when to use each and what it does to the frame.",
          type: "cameraTable",
          rows: [
            { move: "Push In (Dolly In)", use: "For emotional moments or emphasizing a product detail", desc: "Moves toward the subject" },
            { move: "Pull Out (Dolly Out)", use: "For context or revelation, showing the subject within their environment", desc: "Moves away from the subject" },
            { move: "Pan", use: "To follow a subject's movement or to scan a wide scene", desc: "Stays in one location but pivots horizontally" },
            { move: "Tilt", use: "To reveal size or importance — e.g. tilting up a tall building or a character's outfit", desc: "Stays in one location but pivots vertically" },
            { move: "Orbit", use: "A dynamic 3D feeling, excellent for showing depth and high-end product features", desc: "Moves in a circle around the subject" },
            { move: "Tracking", use: "Follows a character as they move — parallel to the subject", desc: "Moves parallel to the subject" },
            { move: "Handheld", use: "For lifestyle, social media content, or realistic in-the-moment footage", desc: "Mimics the slight natural shake of a person holding the camera" },
          ],
        },
      ],
    },
    challenges: [
      {
        kind: "open",
        title: "Image into a cinematic shot",
        intro: "Use this brief to write a motion prompt that turns a still image into a cinematic video shot.",
        brief: "A hero shot of an iced coffee can on a clean cafe table, covered with cold condensation. Soft morning side light, warm blurred beige background, subtle reflections, fresh premium lifestyle feel.",
        goal: "Learn subtle motion, premium pacing, and cinematic realism.",
        items: [
          { label: "Motion model" },
          { label: "Your motion prompt" },
          { label: "Why this motion fits the brief" },
        ],
      },
      {
        kind: "open",
        title: "The 3-Second Transformation",
        intro: "Pick two images and write a prompt that creates a smooth, controlled transformation between them.",
        brief: "Animate a still image with a simple transformation. Use two images and create a short transformation effect.",
        goal: "Practice controlled transformation without chaotic results.",
        items: [
          { label: "Image 1 — describe your starting frame" },
          { label: "Image 2 — describe your ending frame" },
          { label: "Transformation prompt" },
          { label: "Model used" },
        ],
      },
    ],
  },

  {
    id: 4,
    code: "Level 04",
    name: "Launch Control",
    tag: "Platform Walkthrough",
    rank: "The Director",
    mission:
      "Three platforms that transform raw AI output into polished, delivered productions — master the all-in-one video suite, the enterprise design canvas, and the king of voice synthesis.",
    tools: ["artlist", "magnifica", "elevenlabs"],
    learning: [],
    launchControl: {
      title: "Launch Control",
      sections: [
        {
          n: "01",
          title: "Artlist — The AI Video Platform",
          summary: "Multi-model video suite with 30,000+ music tracks, 8K stock, and production plugins",
          type: "points",
          points: [
            "Artlist Studio — cast consistent AI characters, lock locations, and layer video projects across scenes",
            "Multi-model aggregation — runs Google Veo, OpenAI Sora, and Kling so you choose the best generator per shot",
            "Stock library — 30,000+ music tracks, 70,000+ SFX, 8K footage, and custom LUTs",
            "Native plugins — integrates directly into Premiere Pro, Final Cut, and DaVinci Resolve",
            "Artboards — AI pulls matching clips, music, and SFX into a unified mood board for ads and short films",
            "Character consistency — generate a character once and reuse them across multiple AI-generated scenes",
          ],
        },
        {
          n: "02",
          title: "Magnific — Pocket AI Design Studio",
          summary: "Multi-model image and video generation, AI editing, and a 250M+ licensed asset library",
          type: "points",
          points: [
            "Image engines — Flux, Ideogram, GPT Image, Nano Banana, Imagen, Mystic, and Seedream in one workspace",
            "Video engines — Seedance, Veo, Kling, Runway Gen, MiniMax Hailuo, and PixVerse for text-to-video and photo-to-video",
            "Camera integration — snap a photo on your phone and instantly feed it as a style, structure, or pose reference",
            "AI photo editor — modify image details with text commands, composition-aware resizing, and background removal",
            "AI upscaler — transform compressed or low-res assets into campaign-ready, high-fidelity files",
            "250M+ licensed assets — photos, vectors, icons, videos, templates, and PSD files connected natively to the workspace",
          ],
        },
        {
          n: "03",
          title: "ElevenLabs — Voice & Audio Synthesis",
          summary: "Emotional voiceovers, 30-language dubbing, music stems, and lip-sync",
          type: "points",
          points: [
            "v3 Alpha speech — hyper-realistic, emotionally aware voiceovers that grasp context, pacing, and subtext",
            "AI Dubbing — translates video into 30+ languages while preserving the speaker's voice and emotional inflection",
            "Eleven Music & SFX — generates full tracks with customizable stems and sound effects from text prompts",
            "Advanced lip-sync — dedicated model integrations match generated audio to existing talking-head videos",
            "Voice Design — engineer custom accents, ages, and tones for characters or narration without hiring voice actors",
            "Go global — export any English video or podcast in Spanish, Japanese, German, and more in your exact voice",
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

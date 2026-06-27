// data.jsx — workshop content: modules, platforms, quizzes.
// Grounded in the workshop workflow. Exported to window.WORKSHOP.

const PLATFORMS = {
  gemini: {
    id: "gemini", name: "Gemini", vendor: "Google", hue: "#9b8cff", url: "https://gemini.google.com",
    tagline: "Your executive producer",
    about: "Build a custom Gem that runs pre-production. It develops the storyboard, writes the script and voiceover, and generates the precise per-scene image prompts that the rest of your pipeline is built from.",
    usage: [
      "Build a Gem to act as your executive producer",
      "Create a demo storyboard with a description per scene",
      "Generate the script and VO when needed",
      "Generate the prompt that creates each image",
    ],
  },
  elevenlabs: {
    id: "elevenlabs", name: "ElevenLabs", vendor: "Voice AI", hue: "#9affe8", url: "https://elevenlabs.io",
    tagline: "Studio-grade voiceover",
    about: "Turn your script into a finished voiceover. Lifelike text-to-speech with controllable pacing, emotion and emphasis — plus voice cloning and dubbing when the project calls for it.",
    usage: [
      "Generate the VO from your Gem's script",
      "Pick a voice that matches the film's tone",
      "Tune pacing and emphasis line by line",
      "Export clean audio ready for the edit",
    ],
  },
  firefly: {
    id: "firefly", name: "Adobe Firefly", vendor: "Adobe · Image 5", hue: "#ff6f91",
    tagline: "Commercial-safe photorealism",
    about: "Photorealistic image generation with strong commercial safety. Excels at natural skin tones, cinematic lighting and material textures, with workspace-integrated editing through Generative Fill and Firefly Boards.",
    usage: [
      "Create a new board",
      "Upload the generated storyboard",
      "Generate 2K images from the Gem's prompts",
      "Refine with Generative Fill inside Photoshop",
    ],
  },
  "nano-banana": {
    id: "nano-banana", name: "Nano Banana 2", vendor: "Google", hue: "#ffd36e",
    tagline: "Extreme character consistency",
    about: "Built to keep the same character across many shots, with outstanding high-fidelity, multilingual text rendering and advanced sequential photo edits like merging and consistent selfies.",
    usage: [
      "Lock a character's look across scenes",
      "Render accurate text overlays in multiple languages",
      "Sequential edits + photo merging",
      "Access via Gemini app, AI Studio, or Firefly",
    ],
  },
  "gpt-image": {
    id: "gpt-image", name: "GPT Image 2", vendor: "OpenAI", hue: "#5ad7ff",
    tagline: "99% text-rendering accuracy",
    about: "The layout and communication specialist — best for structured panels, exact object placement and complex prompt logic. Conversational, chat-based iteration makes UI-like compositions effortless.",
    usage: [
      "Structured panels & exact object placement",
      "Diagrams + sequential comic formatting",
      "Chat-based edits (\u201cmake the book red\u201d)",
      "Access via ChatGPT, the API, or Firefly",
    ],
  },
  marey: {
    id: "marey", name: "Marey", vendor: "Runway Gen-3", hue: "#ff8de0",
    tagline: "Creative fidelity & precision control",
    about: "Best for fine art, stylized cinematic shorts and complex spatial consistency. Advanced Motion Brush and Camera Controls plus granular prompt interpretation give you highly specific output.",
    usage: [
      "When you want to draw camera / object movement yourself",
      "When you require legal safety",
      "Stylized, art-directed shorts",
      "Motion Brush + Camera Controls",
    ],
  },
  kling: {
    id: "kling", name: "Kling 3.0", vendor: "Kuaishou", hue: "#7c8cff",
    tagline: "Temporal consistency & logic",
    about: "Best for photorealistic storytelling and extended sequences, maintaining character and object consistency over longer durations with an internal physics engine for real-world motion.",
    usage: [
      "Building an AI movie trailer with dialogue",
      "Character continuity across shots",
      "Longer, coherent narrative sequences",
      "High text fidelity",
    ],
  },
  veo: {
    id: "veo", name: "Veo 3.1", vendor: "Google", hue: "#4fe0c0",
    tagline: "Physics, texture & perfect loops",
    about: "Reach for Veo when your video relies heavily on beautiful physics, complex textures and perfect, seamless loops.",
    usage: [
      "Beautiful real-world physics",
      "Complex material textures",
      "Perfect seamless loops",
    ],
  },
  seedance: {
    id: "seedance", name: "Seedance 2.0", vendor: "ByteDance", hue: "#5aa0ff",
    tagline: "Speed & rapid iteration",
    about: "Optimised for rendering speed without catastrophic quality loss — agile prototyping, social content and high-volume turnarounds, with strict visual consistency across multiple clips.",
    usage: [
      "Agile prototyping & social content",
      "Advanced creative control",
      "Strict consistency across clips",
      "High-volume, quick turnarounds",
    ],
  },
  "firefly-video": {
    id: "firefly-video", name: "Firefly Video", vendor: "Adobe", hue: "#ff7a9c",
    tagline: "Fix & extend real footage",
    about: "Choose Firefly Video when you are already editing in Premiere Pro and need to fix or extend a real-life video clip inside your existing timeline.",
    usage: [
      "When you're already editing in Premiere Pro",
      "Fix a real-life video clip",
      "Extend existing footage",
    ],
  },
  artlist: {
    id: "artlist", name: "Artlist", vendor: "Toolkit & Studio", hue: "#7affb0", url: "https://artlist.io",
    tagline: "Licensed assets + creative toolkit",
    about: "Royalty-free music, SFX and footage alongside Artlist's creative Toolkit & Studio — the audio and asset layer that finishes your production and ties the cut together.",
    usage: [
      "Source licensed music & SFX",
      "Stock footage to fill the gaps",
      "Toolkit & Studio creative tools",
      "Understand AI credits & pricing",
    ],
  },
  magnifica: {
    id: "magnifica", name: "Magnifica", vendor: "Enhancement", hue: "#6ec8ff", url: "https://magnifica.ai",
    tagline: "Upscale & enhance",
    about: "Brings generated frames up to delivery resolution — upscaling and detail enhancement so your AI footage and stills hold up on the big screen.",
    usage: [
      "Upscale stills & frames",
      "Enhance fine detail and clarity",
      "Prep assets for final delivery",
    ],
  },
  arcana: {
    id: "arcana", name: "Arcana", vendor: "Finishing", hue: "#b07cff",
    tagline: "Creative finishing in the stack",
    about: "A specialist tool in the Day 2 stack. We open it live and walk through exactly when it earns a place in your pipeline alongside Artlist and Magnifica — and how its credits compare.",
    usage: [
      "Walk through the live demo",
      "Learn when to use which tool",
      "Compare AI credits & pricing",
    ],
  },
};

const MODULES = [
  {
    id: 1, kicker: "Module 01", title: "Strategic Pre-Visualisation",
    summary: "AI storyboarding in practice and character-locking to keep your subject consistent across every scene. You are the director — the Gem is your producer.",
    platforms: ["gemini"],
    quiz: [
      {
        q: "What role does the custom \u201cGem\u201d play in the workflow?",
        options: [
          "It renders the final video",
          "It acts as executive producer \u2014 storyboard, script & prompts",
          "It upscales finished stills",
          "It edits audio and music",
        ], answer: 1,
        why: "The Gem runs pre-production: storyboard, script/VO, and the image prompts that feed everything downstream.",
      },
      {
        q: "Why use \u201cCharacter Locking\u201d techniques?",
        options: [
          "To speed up rendering",
          "To lower the price per generation",
          "To keep the subject consistent across scenes",
          "To add background music",
        ], answer: 2,
        why: "Character Locking ensures subject consistency from shot to shot across the whole film.",
      },
      {
        q: "What does the Gem generate to drive the image models?",
        options: [
          "A finished edit",
          "A precise prompt for each image",
          "A licensing agreement",
          "A color-grade LUT",
        ], answer: 1,
        why: "The Gem outputs a tailored prompt per scene that the image models then render.",
      },
    ],
  },
  {
    id: 2, kicker: "Module 02", title: "Advanced Video Orchestration",
    summary: "Image-to-video multimodal prompting. Meet the image models that build your frames and the video models that bring them to life \u2014 and learn when to use which.",
    platforms: ["firefly", "nano-banana", "gpt-image", "marey", "kling", "veo", "seedance", "firefly-video"],
    quiz: [
      {
        q: "Which image model is best for 99% text-rendering accuracy and structured layouts?",
        options: ["Adobe Firefly", "Nano Banana 2", "GPT Image 2", "Seedance 2.0"],
        answer: 2,
        why: "GPT Image 2 is the layout & communication specialist \u2014 excellent for structural text and exact placement.",
      },
      {
        q: "You need the same character to stay consistent across dozens of shots. Which image model?",
        options: ["Nano Banana 2", "GPT Image 2", "Adobe Firefly", "Veo 3.1"],
        answer: 0,
        why: "Nano Banana 2 maintains extreme character consistency with high-fidelity multilingual text.",
      },
      {
        q: "Your video relies on beautiful physics, complex textures and perfect loops. Pick the model.",
        options: ["Seedance 2.0", "Marey", "Veo 3.1", "Firefly Video"],
        answer: 2,
        why: "Veo 3.1 is the choice when physics, textures and seamless loops matter most.",
      },
      {
        q: "Building an AI movie trailer with dialogue and character continuity \u2014 which video model?",
        options: ["Kling 3.0", "Seedance 2.0", "Marey", "Magnifica"],
        answer: 0,
        why: "Kling 3.0 excels at temporal consistency, dialogue and character continuity over longer durations.",
      },
      {
        q: "You want to draw the camera/object movement yourself and require legal safety.",
        options: ["Veo 3.1", "Marey", "Seedance 2.0", "Nano Banana 2"],
        answer: 1,
        why: "Marey gives you Motion Brush + Camera Controls and legal safety for art-directed shots.",
      },
      {
        q: "You're editing in Premiere Pro and need to fix or extend a real-life clip.",
        options: ["Kling 3.0", "Firefly Video", "Seedance 2.0", "GPT Image 2"],
        answer: 1,
        why: "Firefly Video lives in your Premiere workflow to fix and extend real footage.",
      },
    ],
  },
  {
    id: 3, kicker: "Module 03", title: "The Finishing Stack",
    summary: "Walkthrough of Artlist, Magnifica and Arcana \u2014 when to use which tool. The audio, upscaling and finishing layer that takes a project to delivery.",
    platforms: ["artlist", "magnifica", "arcana"],
    quiz: [
      {
        q: "Which tool is your source for licensed music, SFX and footage?",
        options: ["Magnifica", "Arcana", "Artlist", "Marey"],
        answer: 2,
        why: "Artlist (Toolkit & Studio) is the licensed audio and asset layer of the stack.",
      },
      {
        q: "You need to bring a generated frame up to delivery resolution. Which tool?",
        options: ["Magnifica", "Artlist", "Gemini", "Kling 3.0"],
        answer: 0,
        why: "Magnifica handles upscaling and detail enhancement so footage holds up on the big screen.",
      },
      {
        q: "What's the main goal of the Day 2 walkthrough across these three tools?",
        options: [
          "To pick a single tool and ignore the rest",
          "To learn when to use which tool and how credits compare",
          "To re-shoot everything from scratch",
          "To replace the Gem",
        ], answer: 1,
        why: "The walkthrough is about knowing when each tool earns its place \u2014 and how AI credits & pricing compare.",
      },
    ],
  },
];

window.WORKSHOP = { PLATFORMS, MODULES };

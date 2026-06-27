// game-data.jsx — The Director's Game: 5 levels, each with learning, tools, challenge.
// Exports to window.GAME = { LEVELS, RANKS }.

const RANKS = [
  "Production Assistant", // 0 levels cleared
  "Screenwriter",         // 1
  "Storyboard Artist",    // 2
  "Art Director",         // 3
  "Motion Director",      // 4
  "The Director",         // 5
];

const LEVELS = [
  {
    id: 1,
    code: "Level 01",
    name: "Intelligent Script",
    tag: "Script + VO",
    rank: "Screenwriter",
    mission:
      "Every film begins as language. Build your executive-producer Gem, break the story into scenes, and write a script and voiceover the rest of the pipeline can build on.",
    tools: ["gemini", "elevenlabs"],
    learning: [],
    framework: {
      title: "From problem to script, in five moves",
      intro: "Every good script is built the same way. AI can write the words — but each move is a decision only the creative director can make. Tap a step to see it on a real brief.",
      example: "Waste Management Authority",
      steps: [
        {
          key: "Problem",
          q: "What challenge are we solving?",
          d: "The reason the video exists. No problem, no need for a script — so name it in one plain sentence.",
          ex: "People throw their waste in the wrong bins.",
        },
        {
          key: "Insight",
          q: "Why is this happening?",
          d: "A human truth — the behaviour underneath the problem. It explains why people act the way they do.",
          ex: "People choose the easiest option; they simply don't know which bin to use.",
        },
        {
          key: "Idea",
          q: "What's the creative angle?",
          d: "How you turn the insight into something memorable. This is the leap AI can't make for you.",
          ex: "What if every plastic bottle could tell its own story?",
        },
        {
          key: "Story",
          q: "How will the idea unfold?",
          d: "Structure for the idea — a beginning, a middle and an end the audience can follow.",
          ex: "A bottle is thrown away → travels through landfills and oceans → reaches the right recycling bin.",
        },
        {
          key: "Script",
          q: "What exactly do we see and hear?",
          d: "The final execution — visual description and voiceover, locked scene by scene with timing.",
          ex: "Scene 01 · 0:01–0:04 — VO: “But my journey lasts for hundreds of years.”",
        },
      ],
    },
    ideaMethods: {
      title: "Six ways to find the idea",
      intro: "The problem never changes. What changes is how you think about it — six angles for cracking the same brief.",
      items: [
        {
          n: "01",
          name: "Pain-Point Hunting",
          ask: "What's annoying people? What mistake do they keep making?",
          idea: "People are confused by bins.",
          concept: "A person faces a wall of bins and every piece of waste shouts different instructions.",
          hook: "“Ever stood in front of a bin with no idea where to throw something?”",
        },
        {
          n: "02",
          name: "The “What If” Method",
          ask: "Ask “What if…?” and follow it somewhere strange.",
          idea: "What if bottles could talk?",
          concept: "A plastic bottle narrates its own journey after being thrown in the wrong bin.",
          hook: "“Please… not that bin again.”",
        },
        {
          n: "03",
          name: "Opposite Thinking",
          ask: "Take the obvious — then flip it.",
          idea: "What if the bins rejected the waste?",
          concept: "Smart bins refuse anything thrown in incorrectly.",
          hook: "“Access denied.”",
        },
        {
          n: "04",
          name: "Character First",
          ask: "Create a character, then build the story around them.",
          idea: "Follow one lazy person.",
          concept: "Their single discarded bottle keeps causing problems everywhere they go.",
          hook: "“It was only one bottle…”",
        },
        {
          n: "05",
          name: "Trend Mining",
          ask: "Trend + brand message = idea. Mine Reels, Shorts and TikTok.",
          idea: "POV: you're a plastic bottle.",
          concept: "A first-person view shot entirely from the bottle's perspective.",
          hook: "“POV: you just got thrown into the wrong bin.”",
        },
        {
          n: "06",
          name: "Emotion First",
          ask: "What should the audience feel? Curiosity, pride, guilt, humour?",
          idea: "Make them feel proud — or a little guilty.",
          concept: "A child carefully recycles while the adults around them ignore the bins.",
          hook: "“If a child can do it… why can't we?”",
        },
      ],
    },
    challenges: [
      {
        kind: "open",
        title: "Script Thinking",
        intro: "Use these 5 moves to develop a script concept for this brief.",
        prompt: "A coffee brand wants to launch a new iced coffee for university students and young creatives.",
        items: [
          { label: "Problem" },
          { label: "Insight" },
          { label: "Idea" },
          { label: "Hook" },
          { label: "Script Concept" },
        ],
      },
      {
        kind: "open",
        title: "Write the Script",
        intro: "Write a 30-second TikTok / Instagram Reels script from this brief.",
        brief: {
          client: "Mazaj — Iced Coffee",
          audience: "Gen Z, university students, young creatives",
          platform: "TikTok / Instagram Reels",
          goal: "Launch new iced coffee · CTA: Until your mood finds you",
          deliverable: "30 sec · Can packaging · Street café / urban street",
        },
        task: "Jamila wakes up tired before work. She opens the fridge and finds MAZAJ Iced Coffee. After one sip, her mood changes. She gets ready, opens her laptop, and starts working feeling confident. The product appears with the tagline: MAZAJ Iced Coffee — Until your mood finds you.",
        columns: ["Duration", "VO / Text", "Visual Description", "Camera", "Mood"],
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
          { label: "Frame 10" },
        ],
      },
    ],
  },

  {
    id: 2,
    code: "Level 02",
    name: "Strategic Visualization",
    tag: "Storyboard",
    rank: "Storyboard Artist",
    mission:
      "Convert your script into a storyboard — highlight the moments, build one visual box per script line, and choose your shot type before anything is rendered.",
    tools: ["gemini", "gpt-image"],
    learning: [
      {
        t: "Three steps: script to storyboard",
        d: "Step 1 — highlight the script into key moments. Step 2 — turn each moment into a frame description (what we see). Step 3 — choose the camera shot for each frame. Every decision on paper before you render.",
      },
      {
        t: "Frame → Shot → Scene → Sequence → Film",
        d: "A frame is one still image (24 per second at 24fps). A shot is the continuous recording between 'Action' and 'Cut'. A scene is a dramatic event in the same place, built from multiple shots.",
      },
      {
        t: "Shot types and camera movement",
        d: "Wide shot: show location. Close-up: character emotion. Medium shot: show action. Macro: product beauty. Slow motion: transformation. Tracking shot: show lifestyle. For movement — push-in for focus, pull-out to reveal, orbit for premium feel, static for calm and clean.",
      },
      {
        t: "One script line = one visual box",
        d: "Each storyboard box needs only four things: what is the feeling (mood), what do we see (visual action), how do we see it (camera shot), and what do we hear (VO or text). Nothing more.",
      },
    ],
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
    id: 3,
    code: "Level 03",
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
          example: "Cinematic photorealistic style, 16:9 aspect ratio, soft natural lighting, realistic textures, shallow depth of field, muted blue and grey color palette, emotional documentary tone, consistent character appearance across all scenes.",
        },
        {
          n: "03",
          title: "Image Prompt Per Scene",
          summary: "Use the same structural formula for every scene prompt — never skip an element.",
          type: "promptFormula",
          formula: ["Scene number", "Scene description", "Camera angle", "Composition", "Lighting", "Mood", "Style", "Technical format", "Negative prompt"],
          exampleTitle: "Scene 01",
          exampleText: "A young student enters an abandoned classroom, standing near the doorway and looking inside with hesitation. The classroom is dusty, with old wooden desks, broken sunlight entering through tall windows, and papers scattered on the floor. Wide establishing shot, cinematic composition, soft natural lighting, muted blue and grey color palette, emotional and lonely mood, photorealistic cinematic style, 16:9 aspect ratio, shallow depth of field.",
          negative: "cartoon, unrealistic anatomy, blurry, extra limbs, distorted face, low quality, inconsistent lighting, text, watermark.",
        },
        {
          n: "04",
          title: "Maintain Character Consistency",
          summary: "Build and lock your character guide before the first render — then never deviate.",
          type: "character",
          steps: [
            {
              n: 1,
              title: "Start with the Character Concept",
              fields: [
                { k: "Name", v: "Abdullah" },
                { k: "Country", v: "Saudi Arabia" },
                { k: "Age", v: "25" },
                { k: "Personality", v: "passionate, excited, proud, emotional" },
                { k: "Role", v: "main character / football fan" },
                { k: "Main goal", v: "to cheer for the Saudi Arabia national team in the World Cup" },
                { k: "World/genre", v: "sports, emotional, cinematic football story" },
              ],
            },
            {
              n: 2,
              title: "Create a Fixed Visual Description",
              good: "Abdullah, a 25-year-old Saudi man with short black hair, warm brown eyes, tan skin, average athletic body, wearing the Saudi Arabia 2026 football jersey, dark pants, white sneakers, and a green-and-white Saudi scarf around his neck.",
              bad: "A man with black hair and sports clothes.",
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
                { label: "Body", items: ["25 years old", "Average athletic body", "Young adult"] },
                { label: "Hair", items: ["Short black hair", "Neat style"] },
                { label: "Face", items: ["Tan skin", "Warm brown eyes", "Friendly expressive face"] },
                { label: "Clothes", items: ["Saudi Arabia 2026 football jersey", "Dark pants", "White sneakers"] },
                { label: "Accessories", items: ["Green-and-white Saudi scarf"] },
                { label: "Do Not Change", items: ["Saudi jersey", "Green-and-white scarf", "Short black hair", "Age/body shape", "Face identity", "Saudi football fan feeling"] },
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
          n: "05",
          title: "Generate Keyframes for Scenes",
          summary: "Start with the most important visual moments — not every second.",
          type: "keyframes",
          frames: [
            { label: "Opening Frame", desc: "How the scene begins" },
            { label: "Main Action Frame", desc: "The most important moment" },
            { label: "Ending Frame", desc: "The scene transitions out" },
          ],
          rules: [
            "For simple scenes, one image may be enough.",
            "For complex scenes, generate 2–3 keyframes.",
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
    id: 4,
    code: "Level 04",
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
          exampleText: "The subject raises both arms in celebration while the scarf moves naturally in the wind. The camera performs a slow cinematic push-in. Stadium lights flicker softly in the background.",
          negative: "",
        },
        {
          n: "04",
          title: "Image-to-Video Prompt Template",
          summary: "The fill-in-the-blanks format to use inside Kling, Runway, or Firefly for every shot.",
          type: "videoTemplate",
          template: "[Subject] [main action] while the camera [camera movement]. [Environment detail] moves subtly in the background. Motion is [slow / smooth / realistic / cinematic / energetic]. Keep the same identity, face, outfit, product, composition, lighting, background, and visual style from the input image.",
          inputs: [
            { n: "01", label: "Image / Frame", desc: "Your storyboard keyframe for this shot" },
            { n: "02", label: "Script or VO", desc: "The purpose or script line for this shot" },
            { n: "03", label: "Shot Duration", desc: "5 seconds or 10 seconds" },
            { n: "04", label: "Platform / Tool", desc: "Kling / Runway / Firefly / Seedance" },
            { n: "05", label: "Ratio", desc: "1:1 · 16:9 · 9:16" },
            { n: "06", label: "Motion Style", desc: "Cinematic / realistic / luxury commercial / documentary / Gen Z lifestyle" },
            { n: "07", label: "Consistency Lock", desc: "Keep the same identity, face, outfit, product, composition, lighting, background, and visual style" },
          ],
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
    id: 5,
    code: "Level 05",
    name: "Launch Control",
    tag: "Finishing & Delivery",
    rank: "The Director",
    mission:
      "The last 10% is the difference between a render and a release. Assemble, score, upscale — and ship.",
    tools: ["artlist", "magnifica", "arcana"],
    learning: [
      {
        t: "Picture lock first",
        d: "Assemble every rendered clip in story order, trim, and repair weak shots with Firefly Video inside the edit. Then lock the picture — nothing moves after lock.",
      },
      {
        t: "Sound sells the cut",
        d: "Score the locked picture with licensed music and SFX from Artlist. Audio against a moving cut is wasted work — that's why lock comes first.",
      },
      {
        t: "Deliver at full resolution",
        d: "Run frames and stills through Magnifica for upscaling and detail enhancement, so AI footage holds up on the big screen.",
      },
      {
        t: "Know your credits",
        d: "Arcana, Artlist and Magnifica each bill differently. Knowing when each tool earns its place — and what it costs — is a director's job too.",
      },
    ],
    challenge: {
      kind: "order",
      title: "Launch Sequence",
      intro: "Six finishing steps, shuffled. Tap them into launch order.",
      items: [
        { t: "Assemble the cut", d: "Drop every rendered clip on the timeline in story order and trim." },
        { t: "Fix the weak shots", d: "Repair or extend broken takes with Firefly Video — inside the edit." },
        { t: "Lock the picture", d: "Freeze the cut. Nothing moves after lock." },
        { t: "Score it", d: "License music and SFX from Artlist against the locked picture." },
        { t: "Upscale to delivery", d: "Run frames and stills through Magnifica to final resolution." },
        { t: "Final review & ship", d: "Watch it top to tail, export, deliver." },
      ],
    },
  },
];

function levelItemCount(lv) {
  const chs = lv.challenges || (lv.challenge ? [lv.challenge] : []);
  return chs.reduce((n, c) => n + (c.items ? c.items.length : 0), 0);
}

window.GAME = { LEVELS, RANKS, levelItemCount };

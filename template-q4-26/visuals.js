// visuals.js — visual examples layered on top of window.GAME content.
// Uses the MAZAJ / Jamila reference frames in assets/frames. Exports window.TQ.

(function () {
  const F = (n) => `../assets/frames/frame-${String(n).padStart(2, "0")}.jpg`;

  // Frame -> shot -> scene -> sequence -> film, each shown as a strip of real frames.
  const UNITS = [
    { label: "Frame", frames: [6], h: 300, kicker: "The smallest unit", title: "A single still image", desc: "At 24 fps you see 24 frames every second. Each one is just one photograph — this is what you design." },
    { label: "Shot", frames: [2, 3], h: 280, kicker: "Continuous recording", title: "From Action to Cut", desc: "Jamila walks through her room for 4 seconds. No cuts inside it. This is what a video model generates." },
    { label: "Scene", frames: [4, 5, 6, 7], h: 260, kicker: "The story unit", title: "One place, one continuous event", desc: "She opens the fridge, finds the can, cracks it open and sips. One kitchen moment, built from several shots." },
    { label: "Sequence", frames: [1, 2, 3, 4, 5, 6, 7, 8], h: 200, kicker: "Scenes in a row", title: "A run of connected scenes", desc: "Several scenes joined by one purpose — the whole morning, from waking up tired to the first sip." },
    { label: "Film", frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], h: 160, kicker: "The finished piece", title: "Every sequence, cut together", desc: "The 30-second reel you deliver: the complete story, from the first frame to the tagline." },
  ];

  // Shot sizes with a real example frame each.
  const SHOTS = [
    { purpose: "Show location", shot: "Wide shot", img: F(1), pos: "center" },
    { purpose: "Character emotion", shot: "Close-up", img: F(7), pos: "center 30%" },
    { purpose: "Show action", shot: "Medium shot", img: F(4), pos: "center" },
    { purpose: "Product beauty", shot: "Macro / close-up", img: F(13), pos: "center 70%" },
    { purpose: "Transformation", shot: "Slow motion", img: F(11), pos: "center" },
    { purpose: "Show lifestyle", shot: "Tracking shot", img: F(14), pos: "center" },
  ];

  // Camera moves, simulated on a still frame: from/to transforms for the viewfinder.
  const MOVES = {
    "Push-in": { img: 11, origin: "50% 35%", from: "scale(1)", to: "scale(1.5)", prompt: "The camera slowly pushes in on Jamila as she takes the first sip." },
    "Pull-out": { img: 12, origin: "50% 45%", from: "scale(1.6)", to: "scale(1)", prompt: "Start close on the can, then slowly pull out to reveal Jamila working at the café table." },
    "Pan": { img: 12, origin: "50% 50%", from: "scale(1.45) translateX(14%)", to: "scale(1.45) translateX(-14%)", prompt: "A slow pan from the street café to Jamila at her laptop." },
    "Tilt": { img: 14, origin: "50% 50%", from: "scale(1.5) translateY(-15%)", to: "scale(1.5) translateY(15%)", prompt: "Tilt up from Jamila's sneakers to her face as she walks into the sun." },
    "Orbit": { img: 13, origin: "50% 60%", from: "scale(1.3) rotateY(-16deg)", to: "scale(1.3) rotateY(16deg)", prompt: "A slow 180° orbit around the MAZAJ can on the café table, condensation catching the light." },
    "Tracking": { img: 14, origin: "50% 50%", from: "scale(1.35) translateX(-10%)", to: "scale(1.35) translateX(10%)", prompt: "Tracking shot alongside Jamila as she walks down the sunny street, can in hand." },
    "Handheld": { img: 10, origin: "50% 50%", from: "scale(1.18)", to: "scale(1.18)", shake: true, prompt: "Handheld, slightly shaky camera follows Jamila out of the door, natural and spontaneous." },
    "Static": { img: 15, origin: "50% 50%", from: "scale(1)", to: "scale(1)", prompt: "Static locked-off shot: Jamila sets the can down at the café table." },
  };

  // Shot Match knowledge check.
  const QUIZ = [
    { purpose: "Show the location", scene: "Open on Jamila's bedroom at dawn — we need to know where we are.", answer: "Wide shot", opts: ["Close-up", "Wide shot", "Macro / close-up", "Slow motion"], why: "A wide shot establishes the space before we move closer.", img: 1, pos: "center" },
    { purpose: "Show her emotion", scene: "Jamila is at the fridge and we need to feel how tired she is.", answer: "Close-up", opts: ["Tracking shot", "Wide shot", "Close-up", "Medium shot"], why: "A close-up puts the face — and the feeling — in the centre of the frame.", img: 7, pos: "center 25%" },
    { purpose: "Show the action", scene: "Her hand reaches out and opens the fridge door.", answer: "Medium shot", opts: ["Medium shot", "Macro / close-up", "Wide shot", "Close-up"], why: "A medium shot keeps the hand and the fridge readable in one frame.", img: 4, pos: "center" },
    { purpose: "Make the product beautiful", scene: "Condensation runs down the MAZAJ can on the café table.", answer: "Macro / close-up", opts: ["Tracking shot", "Macro / close-up", "Medium shot", "Wide shot"], why: "Macro detail turns texture and light into product beauty.", img: 13, pos: "center 70%" },
    { purpose: "Show the transformation", scene: "The first sip — her mood shifts from tired to fresh.", answer: "Slow motion", opts: ["Wide shot", "Medium shot", "Slow motion", "Static shot"], why: "Slowing time gives the change of mood room to land.", img: 11, pos: "center" },
    { purpose: "Show the lifestyle", scene: "Jamila walks out to the street café, can in hand.", answer: "Tracking shot", opts: ["Close-up", "Macro / close-up", "Static shot", "Tracking shot"], why: "A tracking shot moves with her, so the viewer joins the lifestyle.", img: 14, pos: "center" },
  ];

  // What each tool makes in this course, shown on the Toolkit screen.
  const TOOL_OUTPUT = {
    gemini: { kind: "text", note: "Output: the script table that feeds your storyboard." },
    chatgpt: { kind: "text", note: "Output: script and storyboard tables, iterated in chat." },
    "nano-banana": { kind: "grid", frames: [[2, "Bedroom"], [7, "Kitchen"], [11, "First sip"], [14, "Street"]], note: "Output: the same Jamila — face, hair, outfit — across four scenes." },
    "gpt-image": { kind: "grid", frames: [[6, "Split panel"], [9, "Three-panel"], [8, "Graphic overlay"], [13, "Tagline frame"]], note: "Output: multi-panel and text-heavy frames." },
    firefly: { kind: "grid", frames: [[1], [4], [8], [12]], note: "Output: storyboard frames from the reference set." },
    kling: { kind: "video", frames: [[11, "Push-in · 5s"], [14, "Tracking · 5s"]], note: "Output: a short clip from one storyboard frame." },
    veo: { kind: "video", frames: [[13, "Orbit · condensation"], [10, "Handheld · door"]], note: "Output: a texture-heavy product shot." },
    seedance: { kind: "video", frames: [[12, "Variation A"], [15, "Variation B"]], note: "Output: quick clip variations to compare." },
    "seedance-2.5": { kind: "video", frames: [[14, "Variation A"], [12, "Variation B"]], note: "Output: quick clip variations to compare." },
    "gemini-omni": { kind: "video", frames: [[11, "First sip"]], note: "Output: a clip from one storyboard frame." },
  };

  window.TQ = { F, UNITS, SHOTS, MOVES, QUIZ, TOOL_OUTPUT };
})();

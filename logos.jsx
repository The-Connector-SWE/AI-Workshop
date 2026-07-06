// logos.jsx — stylized placeholder logo glyphs for each platform.
// Each is a 32x32 SVG that inherits the platform accent via `color`.
// Exported to window.PlatformLogo({id, size}).

function PlatformLogo({ id, size = 32 }) {
  const S = { width: size, height: size, viewBox: "0 0 32 32", fill: "none",
    stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const glyphs = {
    // Gemini — faceted four-point spark
    gemini: (
      <svg {...S}>
        <path d="M16 3 C16 10 22 16 29 16 C22 16 16 22 16 29 C16 22 10 16 3 16 C10 16 16 10 16 3 Z" />
      </svg>
    ),
    // ElevenLabs — speech waveform bars in a rounded frame
    elevenlabs: (
      <svg {...S}>
        <path d="M12 6 L12 26" />
        <path d="M20 6 L20 26" />
      </svg>
    ),
    // Vusion.art — aperture/lens rings
    vusion: (
      <svg {...S}>
        <circle cx="16" cy="16" r="10" />
        <circle cx="16" cy="16" r="4.5" />
        <path d="M16 6 L16 11.5" /><path d="M26 16 L20.5 16" />
        <path d="M16 26 L16 20.5" /><path d="M6 16 L11.5 16" />
      </svg>
    ),
    // Nano Banana 2 — crescent
    "nano-banana": (
      <svg {...S}>
        <path d="M7 6 C12 9 20 13 26 11 C24 20 16 27 8 24 C13 22 17 17 16 12 C15.4 9.5 12 7.5 7 6 Z" />
      </svg>
    ),
    // GPT Image 2 — orbital rings
    "gpt-image": (
      <svg {...S}>
        <circle cx="16" cy="16" r="4" />
        <ellipse cx="16" cy="16" rx="12.5" ry="5.5" transform="rotate(28 16 16)" />
        <ellipse cx="16" cy="16" rx="12.5" ry="5.5" transform="rotate(-28 16 16)" />
      </svg>
    ),
    // Marey — chronophotography motion bars
    marey: (
      <svg {...S}>
        <path d="M6 22 L6 16" /><path d="M11 22 L11 13" /><path d="M16 22 L16 9" />
        <path d="M21 22 L21 13" /><path d="M26 22 L26 16" />
        <path d="M4 26 L28 26" strokeWidth="1.3" opacity="0.6" />
      </svg>
    ),
    // Kling — overlapping continuity frames
    kling: (
      <svg {...S}>
        <rect x="5" y="9" width="13" height="13" rx="2.5" opacity="0.45" />
        <rect x="10" y="7" width="13" height="13" rx="2.5" opacity="0.7" />
        <rect x="14" y="11" width="13" height="13" rx="2.5" />
      </svg>
    ),
    // Veo — physics wave ribbon
    veo: (
      <svg {...S}>
        <path d="M4 16 C7 8 11 8 14 16 C17 24 21 24 24 16 C26 11 28 11 28 13" />
        <circle cx="28" cy="13" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
    // Seedance — fast-forward + seed
    seedance: (
      <svg {...S}>
        <path d="M6 9 L15 16 L6 23 Z" />
        <path d="M16 9 L25 16 L16 23 Z" />
      </svg>
    ),
    // Firefly Video — flame with play
    "firefly-video": (
      <svg {...S}>
        <path d="M16 3 C19 8 23 10 23 16 C23 21 20 26 16 26 C12 26 9 21 9 16 C9 12.5 11 11 12.5 13 C12.5 9 14 6 16 3 Z" />
        <path d="M14 14 L20 18 L14 22 Z" fill="currentColor" stroke="none" />
      </svg>
    ),
    // Artlist — audio waveform
    artlist: (
      <svg {...S}>
        <path d="M5 16 L5 16.1" /><path d="M9 12 L9 20" /><path d="M13 7 L13 25" />
        <path d="M17 11 L17 21" /><path d="M21 9 L21 23" /><path d="M25 13 L25 19" /><path d="M28.5 15 L28.5 17" />
      </svg>
    ),
    // Magnifica — magnifier + plus
    magnifica: (
      <svg {...S}>
        <circle cx="14" cy="14" r="9" />
        <path d="M20.5 20.5 L27 27" />
        <path d="M14 10.5 L14 17.5" /><path d="M10.5 14 L17.5 14" />
      </svg>
    ),
    // Arcana — arcane hexagram
    arcana: (
      <svg {...S}>
        <path d="M16 4 L26 10 L26 22 L16 28 L6 22 L6 10 Z" />
        <path d="M16 9 L21.5 18.5 L10.5 18.5 Z" opacity="0.85" />
      </svg>
    ),
  };
  return glyphs[id] || glyphs.gemini;
}

window.PlatformLogo = PlatformLogo;

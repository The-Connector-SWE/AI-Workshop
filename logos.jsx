// logos.jsx — stylized placeholder logo glyphs for each platform.
// Each is a 32x32 SVG that inherits the platform accent via `color`.
// Exported to window.PlatformLogo({id, size}).

function PlatformLogo({ id, size = 32 }) {
  const S = { width: size, height: size, viewBox: "0 0 32 32", fill: "none",
    stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const glyphs = {
    // Gemini — real four-point sparkle, official gradient
    gemini: (
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lg-gemini" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F94046" />
            <stop offset="30%" stopColor="#FF7A3D" />
            <stop offset="55%" stopColor="#F6C945" />
            <stop offset="72%" stopColor="#3EC373" />
            <stop offset="100%" stopColor="#4285F4" />
          </linearGradient>
        </defs>
        <path fill="url(#lg-gemini)" d="M12 2c0 5.523 4.477 10 10 10c-5.523 0-10 4.477-10 10c0-5.523-4.477-10-10-10c5.523 0 10-4.477 10-10Z" />
      </svg>
    ),
    // ChatGPT / OpenAI — real brand mark
    chatgpt: (
      <svg width={size} height={size} viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M239.184 106.203a64.72 64.72 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.72 64.72 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.67 64.67 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.77 64.77 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483m-97.56 136.338a48.4 48.4 0 0 1-31.105-11.255l1.535-.87l51.67-29.825a8.6 8.6 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601M37.158 197.93a48.35 48.35 0 0 1-5.781-32.589l1.534.921l51.722 29.826a8.34 8.34 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803M23.549 85.38a48.5 48.5 0 0 1 25.58-21.333v61.39a8.29 8.29 0 0 0 4.195 7.316l62.874 36.272l-21.845 12.636a.82.82 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405zm179.466 41.695l-63.08-36.63L161.73 77.86a.82.82 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.54 8.54 0 0 0-4.4-7.213m21.742-32.69l-1.535-.922l-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.72.72 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391zM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87l-51.67 29.825a8.6 8.6 0 0 0-4.246 7.367zm11.868-25.58L128.067 97.3l28.188 16.218v32.434l-28.086 16.218l-28.188-16.218z" />
      </svg>
    ),
    // ElevenLabs — real brand mark (two bars)
    elevenlabs: (
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M4.6035 0v24h4.9317V0zm9.8613 0v24h4.9317V0z" />
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
    // Seedance 2.5 — same fast-forward mark, third chevron for the version bump
    "seedance-2.5": (
      <svg {...S}>
        <path d="M3 9 L11 16 L3 23 Z" />
        <path d="M12 9 L20 16 L12 23 Z" />
        <path d="M21 9 L29 16 L21 23 Z" opacity="0.55" />
      </svg>
    ),
    // Gemini Omni — sparkle with an orbit ring for "omni" multimodal reach
    "gemini-omni": (
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lg-gemini-omni" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F94046" />
            <stop offset="30%" stopColor="#FF7A3D" />
            <stop offset="55%" stopColor="#F6C945" />
            <stop offset="72%" stopColor="#3EC373" />
            <stop offset="100%" stopColor="#4285F4" />
          </linearGradient>
        </defs>
        <ellipse cx="12" cy="12" rx="10.5" ry="5.5" fill="none" stroke="url(#lg-gemini-omni)" strokeWidth="1.3" opacity="0.6" />
        <path fill="url(#lg-gemini-omni)" d="M12 4c0 4.418 3.582 8 8 8c-4.418 0-8 3.582-8 8c0-4.418-3.582-8-8-8c4.418 0 8-3.582 8-8Z" />
      </svg>
    ),
    // Adobe Firefly — flame
    firefly: (
      <svg {...S}>
        <path d="M16 3 C19 8 23 10 23 16 C23 21 20 26 16 26 C12 26 9 21 9 16 C9 12.5 11 11 12.5 13 C12.5 9 14 6 16 3 Z" />
      </svg>
    ),
    // Adobe Firefly (audio) — flame with sound waves
    "firefly-audio": (
      <svg {...S}>
        <path d="M13 4 C15.5 8 18 9.5 18 14 C18 17.5 15.7 21 13 21 C10.3 21 8 17.5 8 14 C8 11.3 9.3 10.3 10.4 11.8 C10.4 9 11.5 6.5 13 4 Z" />
        <path d="M21 12 C22 13.3 22 15.7 21 17" /><path d="M24 10 C25.8 12.5 25.8 16.5 24 19" />
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
    // Canva — real brand mark (gradient disc + cursive "C")
    canva: (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lg-canva" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#00C4CC" />
            <stop offset="50%" stopColor="#3B7DEE" />
            <stop offset="100%" stopColor="#7D2AE8" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#lg-canva)" />
        <path fill="none" stroke="#fff" strokeWidth="3.1" strokeLinecap="round"
          d="M21.3 12.1c-1.5-1.9-3.7-2.7-6-2.1c-3.1.8-5 4-4.2 7.1c.8 3.1 4 5 7.1 4.2c1.7-.4 3-1.5 3.8-2.9" />
      </svg>
    ),
    // Firefly Timeline — real Adobe app-family mark (product-specific Firefly
    // icon isn't available in any open logo set reachable from this session)
    "firefly-timeline": (
      <svg width={size} height={size} viewBox="0 0 256 227" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fa0f00" d="m128.024 83.527l60.288 143.042h-39.513l-18.038-45.554H86.642zM256 0v226.54L161.353 0zM94.684 0L0 226.54V0z" />
      </svg>
    ),
    // CapCut — real brand mark (white squircle + black bowtie cut)
    capcut: (
      <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="30" height="30" rx="9" fill="#fff" />
        <path fill="#000"
          d="M9 12q0-1 1-1h10.5q1 0 1 1v2.1L16 17l5.5 2.9V22q0 1-1 1H10q-1 0-1-1v-2.1L14.5 17L8 13.9V13q0-1 1-1Z" />
        <path fill="#000" d="M21.5 12.3L26 10v4.6l-4.5 2.6z" />
      </svg>
    ),
    // Premiere Pro — real brand mark
    premiere: (
      <svg width={size} height={size} viewBox="0 0 256 250" xmlns="http://www.w3.org/2000/svg">
        <path fill="#00005b" d="M45.333 0h165.334C235.733 0 256 20.267 256 45.333v158.934c0 25.066-20.267 45.333-45.333 45.333H45.333C20.267 249.6 0 229.333 0 204.267V45.333C0 20.267 20.267 0 45.333 0" />
        <path fill="#99f" d="M60.8 175.04V65.28c0-.747.32-1.173 1.067-1.173l1.548-.003l1.198-.01l.845-.016l.9-.023l.967-.034l.515-.021c.96-.04 1.935-.065 2.93-.086l3.055-.064q.521-.012 1.051-.028l1.07-.035q1.44-.052 2.952-.08l3.093-.055l2.141-.047l1.095-.032c2.204-.07 4.361-.094 6.502-.102l3.204-.004c8.747 0 16 1.066 21.974 3.306A38.1 38.1 0 0 1 131.2 75.52a34 34 0 0 1 7.787 12.16c1.6 4.48 2.453 9.067 2.453 13.867q0 13.76-6.4 22.72c-4.267 5.973-10.24 10.453-17.173 13.013c-7.012 2.578-14.721 3.56-23.128 3.623H91.69l-1.187-.012l-.761-.018l-.448-.019l-.402-.024l-.359-.03a16 16 0 0 0-.692-.052l-.52-.023l-.57-.015l-.951-.013l-1.853-.004v34.24c.106.747-.427 1.387-1.174 1.494H62.08c-.853 0-1.28-.427-1.28-1.387m23.253-90.347v35.84l1.254.09a43 43 0 0 0 2.906.124h5.654c4.16 0 8.32-.64 12.266-1.92c3.414-.96 6.4-2.987 8.747-5.654c2.24-2.666 3.307-6.293 3.307-10.986a17.56 17.56 0 0 0-2.454-9.494c-1.737-2.657-4.161-4.727-7.082-5.928l-.384-.152c-3.947-1.6-8.214-2.24-12.587-2.133l-2.466.003l-1.159.007l-1.107.015l-1.051.024q-.769.02-1.47.058a37 37 0 0 0-.688-.028l-.639-.014l-.3-.002l-.566.003l-.514.014l-.238.01l-.437.025l-.384.03l-.173.016l-.303.035zm72.32 6.187h18.667c1.007 0 1.825.666 2.182 1.549l.058.158c.32.853.533 1.706.64 2.666c.213 1.067.427 2.24.533 3.307l.09 1.032c.07.881.124 1.818.124 2.808a39.7 39.7 0 0 1 10.82-8.849l.593-.324c4.907-2.774 10.56-4.16 16.213-4.16c.747-.107 1.387.426 1.494 1.173v21.227c0 .853-.534 1.173-1.707 1.173c-3.584-.1-7.26.173-10.77.903l-.75.164q-4.64.96-8.96 2.88c-2.027.96-3.947 2.24-5.44 3.946v54.4c0 1.067-.427 1.494-1.387 1.494H157.76c-.853.106-1.6-.427-1.707-1.28v-59.52c0-2.56 0-5.227-.106-8l-.064-2.08l-.086-4.16q-.024-1.04-.064-2.08c0-2.454-.213-4.8-.426-7.254c-.107-.533.213-1.066.746-1.173c0-.091.157-.104.269-.04z" />
      </svg>
    ),
  };
  return glyphs[id] || glyphs.gemini;
}

window.PlatformLogo = PlatformLogo;

// site.js — injects the v2 console HUD + aurora background into static pages.
// Set <body data-page="agenda|instructors|realorai|resources"> to mark the active link.
// Reads the Director's Game save to show XP and rank.
(function () {
  if (window !== window.top) return; // skip HUD injection when embedded in an iframe
  var PAGE = document.body.dataset.page || "";
  var TOTAL_XP = 290; // 29 challenge items across the 5 missions × 10 XP
  var RANKS = ["Production Assistant", "Screenwriter", "Storyboard Artist", "Art Director", "Motion Director", "The Director"];

  var LINKS = [
    { id: "agenda", label: "Agenda", href: "agenda.html" },
    { id: "instructors", label: "Instructors", href: "instructors.html" },
    { id: "realorai", label: "AI Fun", href: "real-or-ai.html" },
    { id: "levels", label: "Missions", href: "index.html" },
  ];

  function save() {
    try { return JSON.parse(localStorage.getItem("aivid_directors_game_v1")) || {}; } catch (e) { return {}; }
  }
  var best = save().best || {};
  var clearedCount = Object.keys(best).length;
  var xp = Object.keys(best).reduce(function (n, k) { return n + (best[k].score || 0) * 10; }, 0);
  var rank = RANKS[Math.min(clearedCount, RANKS.length - 1)];

  // load the v2 stylesheet + flag the body so the console treatment applies
  var link = document.createElement("link");
  link.rel = "stylesheet"; link.href = "game-v2.css";
  document.head.appendChild(link);
  document.body.classList.add("v2");

  var aurora =
    '<div class="aurora" aria-hidden="true">' +
    '<span class="blob b1"></span><span class="blob b2"></span>' +
    '<span class="blob b3"></span><span class="blob b4"></span>' +
    '<div class="grain"></div></div>';

  var spark =
    '<svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">' +
    '<path d="M16 3 C16 10 22 16 29 16 C22 16 16 22 16 29 C16 22 10 16 3 16 C10 16 16 10 16 3 Z"/></svg>';

  var hex =
    '<svg class="hex" viewBox="0 0 36 36" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.6">' +
    '<path d="M18 2.5 L31.5 10 L31.5 26 L18 33.5 L4.5 26 L4.5 10 Z"/></svg>';

  var linksHtml = LINKS.map(function (l) {
    var active = l.id === PAGE ? " active" : "";
    return '<a class="hud-link' + active + '" href="' + l.href + '">' + l.label + "</a>";
  }).join("");

  var corners =
    '<span class="frame-corner fc-tl"><i></i></span><span class="frame-corner fc-tr"><i></i></span>' +
    '<span class="frame-corner fc-bl"><i></i></span><span class="frame-corner fc-br"><i></i></span>';

  var nav =
    '<header class="hud">' +
    '<a class="hud-brand" href="index.html">' +
    '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;font-weight:700;color:#fff;letter-spacing:.01em;white-space:nowrap">pod <span style="color:#e30016">ai</span> studio</span></a>' +
    '<nav class="hud-links">' + linksHtml + "</nav>" +
    '<div class="hud-right">' +
    '<div class="hud-xp"><div class="hud-xp-row"><span>XP</span><b>' + xp + " / " + TOTAL_XP + "</b></div>" +
    '<div class="hud-xp-track"><i style="width:' + Math.round((xp / TOTAL_XP) * 100) + '%"></i></div></div>' +
    '<div class="hud-rank"><span class="hud-insignia">' + hex + "<b>" + clearedCount + "</b></span>" +
    '<span class="hud-rank-id"><b>' + rank + '</b><span>Rank</span></span></div>' +
    "</div></header>";

  document.body.insertAdjacentHTML("afterbegin", aurora + corners + nav);
  setTimeout(function () { document.body.classList.add("anim-fallback"); }, 1600);
})();

// Home.jsx

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Home.css";
import { recordVisit } from "../services/api";

/* =========================================================================
   PINNACLE — "Journey to the Summit"
   Left side = funnel journey of cards. Right side = the FINAL mountain image
   (public/mountain.png) — used directly, not recreated. An animated dotted
   travel route leaves Flights & Hotels and flows into the trail already drawn
   inside the image, with glowing particles climbing to the summit graduate.
   Highlighting is PATH-BASED (per card). All classes prefixed `jny-`.
   ========================================================================= */

const VB = { w: 1536, h: 1024 };

/* the final mountain image rectangle, in the 1536x1024 stage coordinate space.
   Everything (cards, paths, image) lives in this space and scales together, so
   the travel path always lines up with the image trail at any viewport size.
   IMPORTANT: w/h match the source image aspect (1160x1355 → 0.856) EXACTLY, so
   `object-fit: contain` produces NO letterbox and image-% maps linearly to box-%. */
const MTN = { x: 910, y: 110, w: 700, h: 818 };

/* ---- THE WHITE TRAIL inside mountain.png, sampled as %-of-image points -----
   (bottom entry → summit). Measured from the actual artwork; expressed as
   percentages so the overlay stays pinned to the image at any size. */
const TRAIL_PCT = [
  [50.5, 93.0], // entry (travel line joins here)
  [42.0, 85.0],
  [40.3, 78.8],
  [44.5, 71.0],
  [45.5, 65.0],
  [50.5, 58.5],
  [50.5, 54.0],
  [46.5, 47.5],
  [48.5, 44.0],
  [52.5, 38.5],
  [53.2, 34.0],
  [54.0, 27.0],
  [52.0, 20.0],
  [50.4, 16.0], // summit (graduate's feet)
];

/* Catmull-Rom → cubic-Bézier: smooth curve through points (no straight lines). */
function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0]},${p2[1]}`;
  }
  return d;
}
/* trail path in the overlay's 0..100 percentage space */
const TRAIL_OVERLAY_D = smoothPath(TRAIL_PCT);
/* the same entry point, in STAGE coordinates, so the travel route can land on it */
const ENTRY_STAGE = {
  x: MTN.x + (TRAIL_PCT[0][0] / 100) * MTN.w,
  y: MTN.y + (TRAIL_PCT[0][1] / 100) * MTN.h,
};

/* card centres (px in the 1536x1024 canvas) — smaller cards, more spacing */
const POS = {
  act:         { x: 110, y: 130 },
  sat:         { x: 290, y: 130 },
  gre:         { x: 470, y: 130 },
  gmat:        { x: 650, y: 130 },
  ielts:       { x: 200, y: 420 },
  toefl:       { x: 380, y: 420 },
  pte:         { x: 560, y: 420 },
  counsel:     { x: 270, y: 660 },
  application: { x: 510, y: 660 },
  visa:        { x: 390, y: 878 },
  flights:     { x: 700, y: 886 },
};

/* journey nodes (cards). `reveal` = build phase, `path` = route to navigate. */
const NODES = [
  { key: "act",  reveal: 1, delay: 200, icon: "cap",   label: "ACT",
    desc: "Personalized ACT mentorship and mock tests.", w: 148, pos: POS.act, path: "/act" },
  { key: "sat",  reveal: 1, delay: 300, icon: "cap",   label: "SAT",
    desc: "Proven strategies for top SAT scores.", w: 148, pos: POS.sat, path: "/sat" },
  { key: "gre",  reveal: 1, delay: 400, icon: "chart", label: "GRE",
    desc: "Advanced GRE coaching for global universities.", w: 148, pos: POS.gre, path: "/gre" },
  { key: "gmat", reveal: 1, delay: 500, icon: "brief", label: "GMAT",
    desc: "Targeted GMAT prep with strategic problem-solving.", w: 148, pos: POS.gmat, path: "/gmat" },

  { key: "ielts", reveal: 2, delay: 220, icon: "head",  label: "IELTS",
    desc: "Structured preparation for IELTS success.", w: 146, pos: POS.ielts, path: "/ielts" },
  { key: "toefl", reveal: 2, delay: 330, icon: "globe", label: "TOEFL",
    desc: "Structured preparation for TOEFL success.", w: 146, pos: POS.toefl, path: "/toefl" },
  { key: "pte",   reveal: 2, delay: 440, icon: "speak", label: "PTE",
    desc: "Focused PTE Academic preparation programs.", w: 146, pos: POS.pte, path: "/pte" },

  { key: "counsel", reveal: 3, delay: 200, milestone: true, icon: "people", label: "Counselling",
    desc: "Profile building, college selection & SOP guidance.", w: 188, pos: POS.counsel, path: "/college" },
  { key: "application", reveal: 3, delay: 320, milestone: true, icon: "doc", label: "Application",
    desc: "SOP, university selection, profile evaluation & submission.", w: 188, pos: POS.application, path: "/college" },

  { key: "visa", reveal: 4, delay: 200, icon: "passport", label: "Visa Services",
    desc: "End-to-end visa guidance and documentation support.", w: 176, pos: POS.visa, path: "/visa" },

  { key: "flights", reveal: 5, delay: 200, icon: ["plane", "hotel"], label: "Flights & Hotels",
    desc: "Best fares and comfortable stays for your departure.", w: 224, pos: POS.flights, path: "/flights-hotels" },
];

/* downstream graph (incl. pseudo merge nodes) → drives path-based highlight */
const DOWN = {
  act: ["mergeE"], sat: ["mergeE"], gre: ["mergeE"], gmat: ["mergeE"],
  mergeE: ["ielts", "toefl", "pte"],
  ielts: ["mergeC"], toefl: ["mergeC"], pte: ["mergeC"],
  mergeC: ["counsel", "application"],
  counsel: ["visa"], application: ["visa"],
  visa: ["flights"],
  flights: ["summit"],
  summit: [],
};
function illumSet(hovered) {
  const s = new Set();
  if (!hovered) return s;
  s.add(hovered);
  const stack = [hovered];
  while (stack.length) {
    const n = stack.pop();
    (DOWN[n] || []).forEach((m) => { if (!s.has(m)) { s.add(m); stack.push(m); } });
  }
  return s;
}

const MSTEPS = [
  { icon: "cap",   label: "ACT / SAT / GRE / GMAT", desc: "Choose your entrance exam — expert coaching for every test.", path: "/standardized-tests" },
  { icon: "head",  label: "IELTS / TOEFL / PTE", desc: "Prove your English proficiency with structured preparation.", path: "/english-tests" },
  { icon: "people",label: "Counselling",    desc: "Profile building, college selection & SOP guidance.", big: true, path: "/college" },
  { icon: "doc",   label: "Application",     desc: "SOP, university selection, profile evaluation & submission.", big: true, path: "/college" },
  { icon: "passport", label: "Visa Services", desc: "End-to-end visa guidance and documentation support.", path: "/visa" },
  { icon: "plane", label: "Flights & Hotels", desc: "Best fares and comfortable stays for your departure.", path: "/flights-hotels" },
  { summit: true, big: true },
];

/* ---- icon set ---------------------------------------------------------- */
function Icon({ name }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const P = {
    cap:   <g {...s}><path d="M12 4 2 9l10 5 10-5z"/><path d="M5 11v5c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-5"/><path d="M22 9v5"/></g>,
    brief: <g {...s}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></g>,
    chart: <g {...s}><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16l3.5-4 3 2.5L20 8"/></g>,
    head:  <g {...s}><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="7" rx="1.6"/><rect x="17" y="13" width="4" height="7" rx="1.6"/></g>,
    globe: <g {...s}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z"/></g>,
    speak: <g {...s}><path d="M4 5h13a3 3 0 0 1 0 6H8l-3 3v-3H4z"/><path d="M8 8h6"/></g>,
    people:<g {...s}><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3 2.9-4.6 5.5-4.6S13.9 16 14.5 19"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.4c2.2 0 3.9 1.5 4.5 4.1"/></g>,
    doc:   <g {...s}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></g>,
    passport:<g {...s}><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 17h6"/></g>,
    plane: <g {...s}><path d="M21 13.5 13 12l-1-7-1.6.3.4 6.4-4.3-.8-1-2.2-1.3.3.9 3.4-.9 3.4 1.3.3 1-2.2 4.3-.8-.4 6.4 1.6.3 1-7z"/></g>,
    hotel: <g {...s}><path d="M3 20V6M3 11h13a4 4 0 0 1 4 4v5M3 20h18M7 8h3"/></g>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{P[name] || null}</svg>;
}

/* ---- connectors: each has from/to keys (for path highlight) + draw phase - */
const CONNECTORS = [
  // L1 -> mergeE (phase 2)
  { from: "act",  to: "mergeE", at: 2, flow: true, d: "M110,186 C110,250 380,250 380,300" },
  { from: "sat",  to: "mergeE", at: 2, flow: true, d: "M290,186 C290,250 380,255 380,300" },
  { from: "gre",  to: "mergeE", at: 2, flow: true, d: "M470,186 C470,250 380,255 380,300" },
  { from: "gmat", to: "mergeE", at: 2, flow: true, d: "M650,186 C650,250 380,250 380,300" },
  // mergeE -> L2 (phase 2)
  { from: "mergeE", to: "ielts", at: 2, flow: true, d: "M380,300 C380,345 200,318 200,360" },
  { from: "mergeE", to: "toefl", at: 2, flow: true, d: "M380,300 C380,335 380,335 380,360" },
  { from: "mergeE", to: "pte",   at: 2, flow: true, d: "M380,300 C380,345 560,318 560,360" },
  // L2 -> mergeC (phase 3)
  { from: "ielts", to: "mergeC", at: 3, flow: true, d: "M200,480 C200,535 390,525 390,568" },
  { from: "toefl", to: "mergeC", at: 3, flow: true, d: "M380,480 C380,530 390,525 390,568" },
  { from: "pte",   to: "mergeC", at: 3, flow: true, d: "M560,480 C560,535 390,525 390,568" },
  // mergeC -> L3 (phase 3)
  { from: "mergeC", to: "counsel",     at: 3, d: "M390,568 C390,592 270,578 270,602" },
  { from: "mergeC", to: "application", at: 3, d: "M390,568 C390,592 510,578 510,602" },
  // L3 -> visa (phase 4)
  { from: "counsel",     to: "visa", at: 4, d: "M270,718 C270,782 390,768 390,822" },
  { from: "application", to: "visa", at: 4, d: "M510,718 C510,782 390,768 390,822" },
];

/* dashed travel routes (STAGE space):
   visa -> flights, then flights -> the trail ENTRY point inside the image.
   The in-image trail itself is drawn as a %-overlay (TRAIL_OVERLAY_D) so it
   sits exactly on the artwork's white path. */
const VISA_FLIGHTS_D = "M480,880 C520,880 552,888 588,888";
/* leaves the Flights & Hotels card from BELOW, dips down, sweeps right, then
   rises UP into the trail entry from below the image — a continuous travel arc.
   The final control point sits ~105px below the entry so the "from below" join
   is long; endpoint = ENTRY_STAGE (exact trail start), so it meets cleanly. */
const TRAVEL_D = `M700,944 C786,1024 980,1034 1108,1014 C1168,1003 ${ENTRY_STAGE.x.toFixed(1)},${(ENTRY_STAGE.y + 140).toFixed(1)} ${ENTRY_STAGE.x.toFixed(1)},${ENTRY_STAGE.y.toFixed(1)}`;

function Connectors({ phase, illum, lit }) {
  const has = (k) => illum.has(k);
  return (
    <svg className="jny-layer" viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" style={{ zIndex: 2 }}>
      <defs>
        <linearGradient id="connG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A78BFA"/><stop offset="1" stopColor="#7A5AF8"/></linearGradient>
        <linearGradient id="travelG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7A5AF8"/><stop offset="1" stopColor="#4B1D95"/></linearGradient>
        <filter id="glowPath" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="dotG"><stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#A78BFA"/></radialGradient>
      </defs>

      {/* faint base rails */}
      {CONNECTORS.map((c, i) => <path key={"b" + i} d={c.d} stroke="rgba(123,90,248,0.12)" strokeWidth="4" fill="none" strokeLinecap="round"/>)}
      <path d={VISA_FLIGHTS_D} stroke="rgba(123,90,248,0.12)" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d={TRAVEL_D} stroke="rgba(123,90,248,0.12)" strokeWidth="4" fill="none" strokeLinecap="round"/>

      {/* drawn connectors — active only when this segment is on the hovered path */}
      {CONNECTORS.map((c, i) => {
        const on = has(c.from);
        return (
          <path key={"c" + i} d={c.d} pathLength="1"
            className={"jny-conn jny-draw " + (phase >= c.at ? "jny-on " : "") + (on ? "jny-active" : "")}
            style={{ "--len": 1 }} stroke="url(#connG)" strokeWidth={on ? 3.4 : 2.3} fill="none" strokeLinecap="round"/>
        );
      })}

      {/* flow particles toward the summit, along the funnel */}
      {phase >= 3 && CONNECTORS.filter(c => c.flow).map((c, i) => (
        <circle key={"fp" + i} r="3" fill="url(#dotG)" opacity={has(c.from) ? 0.95 : 0.5}>
          <animateMotion dur="2.6s" begin={`${(i % 4) * 0.6}s`} repeatCount="indefinite" path={c.d}/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="2.6s" begin={`${(i % 4) * 0.6}s`} repeatCount="indefinite"/>
        </circle>
      ))}

      {/* dashed visa -> flights */}
      <path d={VISA_FLIGHTS_D} pathLength="1"
        className={"jny-travel-dash " + (has("visa") ? "jny-active" : "")}
        style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity .7s ease" }}
        stroke="url(#travelG)" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeDasharray="0.02 0.05"/>
      {/* dashed flights -> into the mountain image trail */}
      <path d={TRAVEL_D} pathLength="1"
        className={"jny-travel-dash " + (has("flights") ? "jny-active" : "")}
        style={{ opacity: phase >= 6 ? 1 : 0, transition: "opacity .7s ease" }}
        stroke="url(#travelG)" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeDasharray="0.04 0.12"/>

      {phase >= 5 && [0, 1].map(k => (
        <circle key={"vp" + k} r="3.4" fill="url(#dotG)" opacity="0.95">
          <animateMotion dur="2.2s" begin={`${k}s`} repeatCount="indefinite" path={VISA_FLIGHTS_D}/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur="2.2s" begin={`${k}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {/* glowing dots flowing flights -> trail entry */}
      {phase >= 6 && [0, 1, 2].map(k => (
        <circle key={"tv" + k} r="3.6" fill="url(#dotG)" opacity={has("flights") ? 1 : 0.7}>
          <animateMotion dur="3s" begin={`${k}s`} repeatCount="indefinite" path={TRAVEL_D}/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur="3s" begin={`${k}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

/* ============ TRAIL OVERLAY — pinned to the image's own % coordinate space ===
   Lives INSIDE the image box (.jny-mtn), viewBox 0..100, preserveAspectRatio
   "none". Because the box matches the image aspect exactly, (x,y) in 0..100 =
   (x%,y%) of the artwork → the stroke sits right on the painted white trail.
   Performance: pure SVG/SMIL + CSS; no JS animation loop, no re-renders. */
function TrailOverlay({ show, lit }) {
  return (
    <svg className="jny-trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="trailGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="trailDot"><stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#c9b8ff"/></radialGradient>
      </defs>

      {/* glowing trace that draws itself bottom→summit, brighter when a path is lit */}
      <path d={TRAIL_OVERLAY_D} fill="none" stroke="#ffffff" strokeWidth={lit ? 1.5 : 1.05}
        strokeLinecap="round" vectorEffect="non-scaling-stroke" filter="url(#trailGlow)"
        className={"jny-trail-line " + (show ? "jny-draw-go " : "") + (lit ? "jny-lit" : "")}
        pathLength="1" />

      {/* particles continuously climbing toward the summit */}
      {show && [0, 1, 2].map((k) => (
        <circle key={k} r={lit ? 1.5 : 1.1} fill="url(#trailDot)">
          <animateMotion dur="4.6s" begin={`${k * 1.5}s`} repeatCount="indefinite"
            keyPoints="0;1" keyTimes="0;1" calcMode="linear" path={TRAIL_OVERLAY_D}/>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1"
            dur="4.6s" begin={`${k * 1.5}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

/* ===================== FINAL MOUNTAIN IMAGE (used directly) ============== */
function MountainImage({ phase, lit }) {
  const revealed = phase >= 6;
  return (
    <div className="jny-mtn"
      style={{
        left: MTN.x + "px", top: MTN.y + "px", width: MTN.w + "px", height: MTN.h + "px",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "none" : "translateY(40px) scale(0.96)",
        transition: "opacity 1.1s ease, transform 1.2s cubic-bezier(.2,.8,.2,1)",
      }}>
      <div className={"jny-mtn-glow " + (lit ? "jny-on" : "")} />
      <img src="/mountain.png" alt="The Pinnacle summit — the destination of the journey"
        className="jny-mtn-img" style={{ filter: lit ? "brightness(1.05) saturate(1.06)" : "none" }} />
      <TrailOverlay show={revealed} lit={lit} />
    </div>
  );
}

/* ---- viewport hooks ---------------------------------------------------- */
function useInView(opts) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  const frac = (opts && opts.threshold) || 0.12;
  useEffect(() => {
    let raf = 0, done = false;
    const check = () => {
      raf = 0;
      const el = ref.current; if (!el || done) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const need = Math.min(r.height * frac, vh * 0.3);
      if (visible >= need && r.bottom > 0 && r.top < vh) { done = true; setSeen(true); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    check();
    const t = setTimeout(check, 200);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); clearTimeout(t); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return [ref, seen];
}

function useViewport() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    let t;
    const on = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 120); };
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

/* ---- reference-style card (icon badge, centered) — path-based highlight - */
function StageCard({ node, phase, hovered, illum, onEnter, onLeave, onNavigate }) {
  const show = phase >= node.reveal;
  let cls = "jny-node";
  if (node.milestone) cls += " jny-milestone";
  if (show) cls += " jny-show";
  if (hovered) {
    if (node.key === hovered) cls += " jny-origin";
    else if (illum.has(node.key)) cls += " jny-lit";
    else cls += " jny-dim";
  }
  const style = {
    left: node.pos.x + "px",
    top: node.pos.y + "px",
    width: node.w || 200,
    transitionDelay: show ? (node.delay || 0) + "ms" : "0ms",
  };
  const icons = Array.isArray(node.icon) ? node.icon : [node.icon];
  return (
    <div className={cls} style={style}
      onMouseEnter={() => onEnter(node.key)} onMouseLeave={onLeave}
      onClick={() => node.path && onNavigate(node.path)}>
      <div className="jny-card">
        <div className="jny-badges">
          {icons.map((ic, i) => <span className="jny-ic-badge" key={i}><Icon name={ic} /></span>)}
        </div>
        <span className="jny-lbl">{node.label}</span>
        <span className="jny-desc">{node.desc}</span>
        <span className="jny-explore">Explore <span className="jny-arw">→</span></span>
      </div>
    </div>
  );
}

/* ---- mobile vertical timeline ----------------------------------------- */
function MobileTimeline({ steps, onNavigate }) {
  const [ref, seen] = useInView({ threshold: 0.08 });
  return (
    <div className={"jny-mtl " + (seen ? "jny-go" : "")} ref={ref}>
      <div className="jny-mtl-line"></div>
      {steps.map((s, i) => (
        <div key={i} className={"jny-mtl-step " + (s.big ? "jny-big " : "") + (seen ? "jny-show" : "")}
          style={{ transitionDelay: (i * 120) + "ms" }}>
          {s.summit ? (
            <>
              <span className="jny-mtl-dot jny-star">★</span>
              <div className="jny-mtl-summit">
                <img src="/mountain.png" alt="The Pinnacle summit" className="jny-mtl-mtn" />
                <div className="jny-cap">You reach the summit
                  <span>Degree in hand — admission success.</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="jny-mtl-dot"><Icon name={Array.isArray(s.icon) ? s.icon[0] : s.icon} /></span>
              <div className="jny-mtl-card" onClick={() => s.path && onNavigate(s.path)}>
                <div className="jny-mtl-lbl">{s.label}</div>
                {s.desc && <div className="jny-mtl-sub">{s.desc}</div>}
                <span className="jny-mtl-exp">Explore →</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---- scaled stage ---- */
function StageScene({ phase, hovered, setHovered, onNavigate }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const measure = () => {
      const w = wrapRef.current ? wrapRef.current.clientWidth : 1536;
      setScale(w / 1536);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const illum = illumSet(hovered);
  const lit = hovered !== null;
  return (
    <div className="jny-stage-wrap" ref={wrapRef} style={{ height: 1024 * scale }}>
      <div className="jny-stage" style={{ transform: `scale(${scale})` }}>
        <MountainImage phase={phase} lit={lit} />
        <Connectors phase={phase} illum={illum} lit={lit} />
        {NODES.map(n => (
          <StageCard key={n.key} node={n} phase={phase} hovered={hovered} illum={illum}
            onEnter={(k) => setHovered(k)} onLeave={() => setHovered(null)} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

/* ---- the journey hero section ---- */
function JourneyHero({ visitors }) {
  const navigate = useNavigate();
  const w = useViewport();
  const isMobile = w < 900;

  const [stageRef, seen] = useInView({ threshold: 0.1 });
  const [phase, setPhase] = useState(0);
  const [hovered, setHovered] = useState(null);
  const timer = useRef(null);

  const run = () => {
    setPhase(0);
    clearInterval(timer.current);
    let p = 1;
    setTimeout(() => setPhase(1), 120);
    timer.current = setInterval(() => {
      p += 1;
      setPhase(p);
      if (p >= 7) clearInterval(timer.current);
    }, 760);
  };
  useEffect(() => { if (seen && phase === 0) run(); /* eslint-disable-next-line */ }, [seen]);
  useEffect(() => () => clearInterval(timer.current), []);

  return (
    <section className="jny-section">
      {/* ambient floating background particles */}
      <div className="jny-bg-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <span className="jny-bgp" key={i} />)}
      </div>

      <div className="jny-head">
        <div className="jny-head-left">
          <span className="jny-kicker"><span className="jny-dot"></span>From Preparation to Admission</span>
          <h1 className="jny-title">Your Journey to the <span className="jny-grad">Summit</span></h1>
          <p className="jny-sub">Choose your exam, prove your English, get counselled, secure your visa, book your travel — every step leads to the top of the Pinnacle.</p>
        </div>
      </div>

      {isMobile ? (
        <MobileTimeline steps={MSTEPS} onNavigate={navigate} />
      ) : (
        <>
          <div ref={stageRef}>
            <StageScene phase={phase} hovered={hovered} setHovered={setHovered} onNavigate={navigate} />
          </div>
          <div className="jny-visitors">
            <div className="jny-visitor-card">
              <span className="jny-visitor-num">{visitors.toLocaleString()}+</span>
              <span className="jny-visitor-label">Visitors Worldwide</span>
            </div>
            <button className="jny-replay" onClick={run}>↻ Replay journey</button>
          </div>
        </>
      )}
    </section>
  );
}

export default function Home() {

  const navigate = useNavigate();
  const [visitors, setVisitors] = useState(0);

  // ================= STATS REF =================

  const statsRef = useRef(null);

  // ================= FINAL STATS =================

  const finalStats = [
    {
      value: 1550,
      suffix: "+",
      label: "Average SAT Score",
    },
    {
      value: 5,
      suffix: "/5",
      label: "AP Scores",
    },
    {
      value: 8.5,
      suffix: "+",
      label: "IELTS Band",
    },
    {
      value: 100,
      suffix: "+",
      label: "Students Placed",
    },
  ];

  // ================= INITIAL VALUES =================

  const [stats, setStats] = useState([
    "0",
    "0",
    "0",
    "0",
  ]);

  // ================= VISITOR COUNTER (MongoDB-backed) =================
  // Increments on every page visit/refresh; value persists in MongoDB.
  useEffect(() => {
    recordVisit()
      .then((data) => {
        if (typeof data?.count === "number") setVisitors(data.count);
      })
      .catch((err) => {
        // Do not fail silently — surface the reason in the console.
        console.error("[VISITORS] could not update visitor count:", err?.message || err);
      });
  }, []);


  useEffect(() => {

    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting && !started) {

          started = true;

          const interval = setInterval(() => {

            setStats([
              Math.floor(Math.random() * 1600),
              (Math.random() * 5).toFixed(1),
              (Math.random() * 9).toFixed(1),
              Math.floor(Math.random() * 150),
            ]);

          }, 80);

          setTimeout(() => {

            clearInterval(interval);

            setStats([
              finalStats[0].value,
              finalStats[1].value,
              finalStats[2].value,
              finalStats[3].value,
            ]);

          }, 1800);
        }
      },
      {
        threshold: 0.4,
      }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();

  }, []);

  return (
    <>

      {/* ================= JOURNEY HERO (Claude Design import) ================= */}

      <JourneyHero visitors={visitors} />

      {/* ================= RESULTS SECTION ================= */}

      <section
        className="results-section"
        ref={statsRef}
      >

        <div className="container">

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Our Results Speak for Themselves
          </motion.h2>

          <div className="results-grid">

            {finalStats.map((item, index) => (

              <motion.div
                className="result-card"
                key={index}
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                }}
                viewport={{ once: true }}
              >

                <h3>
                  {stats[index]}
                  {item.suffix}
                </h3>

                <p>{item.label}</p>

              </motion.div>

            ))}

          </div>

          <div className="results-btn">

            <button
              className="primary-btn"
              onClick={() => navigate("/results")}
            >
              View Full Results
            </button>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

<footer className="footer">

  <div className="container footer-content">

    {/* LEFT */}

    <div className="footer-left">

      <h3>Pinnacle Incorporated</h3>

      <p>
        Helping students achieve global academic
        success through expert mentorship,
        strategic guidance, and personalized
        international admissions support.
      </p>

    </div>

    {/* QUICK LINKS */}

    <div className="footer-links">

      <h4>Quick Links</h4>

      <a href="/">Home</a>
      <a href="/results">Results</a>
      <a href="/contact">Contact</a>
      <a href="/services">Services</a>

    </div>

    {/* FOUNDERS */}

    <div className="footer-contact">

      <h4>Founders</h4>

      <p>
        <strong>Purusharth Agarwal</strong><br />
        Academic & Executive Founder
      </p>

      <p>
        ✉ purusharth@pinnacleinc.co
      </p>

      <br />

      <p>
        <strong>Chethan M</strong><br />
        Business & Strategic Founder
      </p>

      <p>
        ✉ chethan@pinnacleinc.co
      </p>

      <br />

      <p>
        📞 +91 9731490933
      </p>

    </div>

  </div>

  {/* BOTTOM */}

  <div className="footer-bottom">

    <p>
      © 2026 Pinnacle Incorporated.
      All rights reserved.
    </p>

  </div>

</footer>

    </>
  );
}

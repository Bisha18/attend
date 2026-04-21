"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Animated Counter Hook ───────────────────────────────── */
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── Student SVG (2D geometric neobrutalist) ─────────────── */
function StudentSVG({ walkProgress = 0 }) {
  // walkProgress: 0 = standing, 1 = mid-stride left, 2 = mid-stride right (loops 0-2)
  const cycle = walkProgress % 2;
  const legLAngle = cycle < 1 ? gsap.utils.interpolate(-25, 25, cycle) : gsap.utils.interpolate(25, -25, cycle - 1);
  const legRAngle = -legLAngle;
  const armLAngle = legRAngle * 0.6;
  const armRAngle = legLAngle * 0.6;
  const bodyBob = Math.abs(Math.sin(walkProgress * Math.PI)) * -3;

  return (
    <svg width="110" height="180" viewBox="0 0 110 180" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(4px 4px 0px #000)", transform: `translateY(${bodyBob}px)` }}>
      {/* Backpack */}
      <rect x="52" y="60" width="26" height="36" rx="3" fill="#FFEA00" stroke="#000" strokeWidth="3" />
      <rect x="56" y="66" width="5" height="24" rx="2" fill="#000" opacity="0.18" />
      {/* Body */}
      <rect x="28" y="58" width="50" height="52" rx="4" fill="#6D28D9" stroke="#000" strokeWidth="3" />
      {/* Collar stripe */}
      <rect x="49" y="58" width="10" height="14" rx="2" fill="#38BDF8" stroke="#000" strokeWidth="2" />
      {/* Head */}
      <circle cx="53" cy="38" r="22" fill="#FDE68A" stroke="#000" strokeWidth="3" />
      {/* Hair */}
      <rect x="31" y="20" width="44" height="14" rx="7" fill="#1E1B4B" stroke="#000" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="44" cy="38" r="4" fill="#1E1B4B" />
      <circle cx="62" cy="38" r="4" fill="#1E1B4B" />
      <circle cx="46" cy="36" r="1.5" fill="#fff" />
      <circle cx="64" cy="36" r="1.5" fill="#fff" />
      {/* Smile */}
      <path d="M44 46 Q53 54 62 46" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Left Arm */}
      <g transform={`rotate(${armLAngle}, 28, 68)`}>
        <rect x="10" y="63" width="20" height="10" rx="5" fill="#6D28D9" stroke="#000" strokeWidth="2.5" transform={`rotate(${armLAngle}, 28, 68)`} />
      </g>
      {/* Right Arm */}
      <g transform={`rotate(${armRAngle}, 78, 68)`}>
        <rect x="76" y="63" width="20" height="10" rx="5" fill="#6D28D9" stroke="#000" strokeWidth="2.5" transform={`rotate(${armRAngle}, 78, 68)`} />
      </g>
      {/* Left Leg */}
      <g transform={`rotate(${legLAngle}, 40, 110)`}>
        <rect x="30" y="108" width="18" height="42" rx="6" fill="#1E1B4B" stroke="#000" strokeWidth="2.5" />
        <rect x="28" y="144" width="22" height="14" rx="5" fill="#38BDF8" stroke="#000" strokeWidth="2.5" />
      </g>
      {/* Right Leg */}
      <g transform={`rotate(${legRAngle}, 66, 110)`}>
        <rect x="58" y="108" width="18" height="42" rx="6" fill="#1E1B4B" stroke="#000" strokeWidth="2.5" />
        <rect x="56" y="144" width="22" height="14" rx="5" fill="#38BDF8" stroke="#000" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

/* ─── School Building SVG ─────────────────────────────────── */
function SchoolSVG() {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(6px 6px 0px #6D28D9)" }}>
      {/* Body */}
      <rect x="10" y="70" width="200" height="130" fill="#6D28D9" stroke="#000" strokeWidth="3" />
      {/* Roof */}
      <polygon points="0,70 110,10 220,70" fill="#1E1B4B" stroke="#000" strokeWidth="3" />
      {/* Flag */}
      <line x1="110" y1="10" x2="110" y2="-10" stroke="#000" strokeWidth="3" />
      <rect x="110" y="-10" width="28" height="16" fill="#FFEA00" stroke="#000" strokeWidth="2" />
      {/* Windows */}
      {[30, 90, 150].map(x => (
        <rect key={x} x={x} y="95" width="36" height="30" rx="2" fill="#38BDF8" stroke="#000" strokeWidth="2.5" />
      ))}
      {/* Door */}
      <rect x="82" y="140" width="56" height="60" rx="4" fill="#FFEA00" stroke="#000" strokeWidth="3" />
      <circle cx="128" cy="172" r="4" fill="#000" />
      {/* Sign */}
      <rect x="50" y="78" width="120" height="18" rx="3" fill="#FFEA00" stroke="#000" strokeWidth="2" />
      <text x="110" y="92" textAnchor="middle" fontSize="10" fontWeight="900" fill="#000" fontFamily="sans-serif">SCHOOL</text>
    </svg>
  );
}

/* ─── House SVG ────────────────────────────────────────────── */
function HouseSVG() {
  return (
    <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(4px 4px 0px #000)" }}>
      <rect x="10" y="70" width="120" height="80" fill="#FDE68A" stroke="#000" strokeWidth="3" />
      <polygon points="0,70 70,10 140,70" fill="#6D28D9" stroke="#000" strokeWidth="3" />
      <rect x="50" y="100" width="40" height="50" rx="2" fill="#38BDF8" stroke="#000" strokeWidth="2.5" />
      <circle cx="85" cy="125" r="4" fill="#000" />
      <rect x="20" y="88" width="28" height="24" rx="2" fill="#38BDF8" stroke="#000" strokeWidth="2" />
      <rect x="92" y="88" width="28" height="24" rx="2" fill="#38BDF8" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

/* ─── Bus Stop SVG ─────────────────────────────────────────── */
function BusStopSVG() {
  return (
    <svg width="80" height="140" viewBox="0 0 80 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="0" width="40" height="60" rx="4" fill="#38BDF8" stroke="#000" strokeWidth="3" />
      <text x="40" y="38" textAnchor="middle" fontSize="10" fontWeight="900" fill="#000" fontFamily="sans-serif">BUS</text>
      <rect x="38" y="60" width="4" height="80" fill="#000" />
      <rect x="10" y="135" width="60" height="5" rx="2" fill="#000" />
    </svg>
  );
}

/* ─── Cloud SVG ────────────────────────────────────────────── */
function CloudSVG({ size = 1 }) {
  return (
    <svg width={120 * size} height={60 * size} viewBox="0 0 120 60" fill="none">
      <ellipse cx="60" cy="45" rx="55" ry="20" fill="white" stroke="#000" strokeWidth="2.5" />
      <ellipse cx="40" cy="35" rx="30" ry="22" fill="white" stroke="#000" strokeWidth="2.5" />
      <ellipse cx="75" cy="32" rx="26" ry="20" fill="white" stroke="#000" strokeWidth="2.5" />
      <ellipse cx="60" cy="45" rx="55" ry="20" fill="white" />
    </svg>
  );
}

/* ─── RFID Card SVG ────────────────────────────────────────── */
function RFIDCardSVG() {
  return (
    <svg width="140" height="90" viewBox="0 0 140 90" fill="none">
      <rect x="2" y="2" width="136" height="86" rx="10" fill="#6D28D9" stroke="#000" strokeWidth="3" />
      <rect x="14" y="18" width="32" height="24" rx="3" fill="#FFEA00" stroke="#000" strokeWidth="2" />
      <rect x="14" y="18" width="8" height="24" fill="#FFD600" stroke="#000" strokeWidth="1.5" />
      <circle cx="100" cy="35" r="18" fill="none" stroke="#38BDF8" strokeWidth="2.5" opacity="0.6" />
      <circle cx="100" cy="35" r="11" fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.6" />
      <circle cx="100" cy="35" r="4" fill="#38BDF8" />
      <rect x="14" y="58" width="60" height="6" rx="3" fill="#fff" opacity="0.4" />
      <rect x="14" y="70" width="40" height="5" rx="2" fill="#fff" opacity="0.25" />
    </svg>
  );
}

/* ─── RFID Reader SVG ──────────────────────────────────────── */
function RFIDReaderSVG() {
  return (
    <svg width="90" height="140" viewBox="0 0 90 140" fill="none">
      <rect x="5" y="5" width="80" height="130" rx="8" fill="#1E1B4B" stroke="#000" strokeWidth="3" />
      <rect x="15" y="15" width="60" height="70" rx="4" fill="#38BDF8" stroke="#000" strokeWidth="2.5" />
      <circle cx="45" cy="50" r="20" fill="#6D28D9" stroke="#000" strokeWidth="2" />
      <circle cx="45" cy="50" r="12" fill="none" stroke="#FFEA00" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="45" cy="50" r="5" fill="#FFEA00" />
      <rect x="20" y="100" width="50" height="10" rx="4" fill="#FFEA00" stroke="#000" strokeWidth="2" />
      <circle cx="45" cy="122" r="8" fill="#38BDF8" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [loggedOut, setLoggedOut] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [walkProgress, setWalkProgress] = useState(0);

  /* ── Stats counters ──────────────────────────────────────── */
  const c1 = useCounter(998, 2000, statsVisible);
  const c2 = useCounter(2, 1000, statsVisible);
  const c3 = useCounter(9999, 2200, statsVisible);

  /* ── Refs ────────────────────────────────────────────────── */
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const journeyRef = useRef(null);
  const journeyPinRef = useRef(null);
  const studentRef = useRef(null);
  const roadLineRef = useRef(null);
  const houseRef = useRef(null);
  const busStopRef = useRef(null);
  const schoolRef = useRef(null);
  const cloud1Ref = useRef(null);
  const cloud2Ref = useRef(null);
  const rfidRef = useRef(null);
  const benefitsRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("loggedOut")) {
      setLoggedOut(true);
      setTimeout(() => setLoggedOut(false), 5000);
    }
    return () => clearTimeout(t);
  }, []);

  /* ── GSAP All Animations ─────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── 1. NAV drop in ────────────────────────────────────── */
      gsap.from(navRef.current, {
        yPercent: -100,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.4)",
      });

      /* ── 2. Hero stagger ───────────────────────────────────── */
      gsap.from(".hero-anim", {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.4,
      });

      /* ── 3. Stats section reveal ────────────────────────────── */
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: "top 80%",
        onEnter: () => setStatsVisible(true),
      });

      gsap.from(".stat-card", {
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
      });

      /* ── 4. MARQUEE speed boost on scroll ───────────────────── */
      // handled by CSS

      /* ── 5. JOURNEY SECTION — Pinned ScrollTrigger ─────────── */
      const journeyTl = gsap.timeline({
        scrollTrigger: {
          trigger: journeyRef.current,
          start: "top top",
          end: "+=280%",
          pin: journeyPinRef.current,
          scrub: 1.2,
          anticipatePin: 1,
          onUpdate: (self) => {
            // drive walk progress (0 → 8 cycles)
            setWalkProgress(self.progress * 10);
          },
        },
      });

      // Student walks left to right
      journeyTl.fromTo(
        studentRef.current,
        { x: -160 },
        { x: "calc(100vw - 180px)", duration: 1, ease: "none" }
      );

      // House slides out to the left
      journeyTl.fromTo(
        houseRef.current,
        { x: 0, opacity: 1 },
        { x: -280, opacity: 0, duration: 0.3, ease: "power2.in" },
        0
      );

      // Bus stop parallax mid
      journeyTl.fromTo(
        busStopRef.current,
        { x: "35vw", opacity: 0 },
        { x: "-10vw", opacity: 1, duration: 0.5, ease: "none" },
        0.15
      );
      journeyTl.to(busStopRef.current, { x: "-50vw", opacity: 0, duration: 0.25, ease: "power2.in" }, 0.5);

      // Clouds parallax (slower)
      journeyTl.fromTo(
        cloud1Ref.current,
        { x: "10vw" },
        { x: "-80vw", duration: 1, ease: "none" },
        0
      );
      journeyTl.fromTo(
        cloud2Ref.current,
        { x: "70vw" },
        { x: "-60vw", duration: 1, ease: "none" },
        0
      );

      // School building slides in from right
      journeyTl.fromTo(
        schoolRef.current,
        { x: "120vw", opacity: 0 },
        { x: "calc(100vw - 320px)", opacity: 1, duration: 0.4, ease: "power3.out" },
        0.55
      );

      // Road dashes scroll
      journeyTl.fromTo(
        roadLineRef.current,
        { backgroundPositionX: "0px" },
        { backgroundPositionX: "-400px", duration: 1, ease: "none" },
        0
      );

      /* ── 6. RFID Section ────────────────────────────────────── */
      gsap.from(".rfid-heading", {
        scrollTrigger: { trigger: rfidRef.current, start: "top 75%" },
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".rfid-card-anim", {
        scrollTrigger: { trigger: rfidRef.current, start: "top 75%" },
        rotationY: 90,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "back.out(1.4)",
        transformOrigin: "center center",
      });

      gsap.from(".flow-step", {
        scrollTrigger: { trigger: ".flow-steps", start: "top 80%" },
        x: -40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.6,
        ease: "power3.out",
      });

      /* ── 7. Benefits Section ────────────────────────────────── */
      gsap.from(".benefit-card", {
        scrollTrigger: { trigger: benefitsRef.current, start: "top 75%" },
        y: 70,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "back.out(1.3)",
      });

      gsap.from(".benefits-heading", {
        scrollTrigger: { trigger: benefitsRef.current, start: "top 80%" },
        scale: 0.7,
        opacity: 0,
        duration: 0.7,
        ease: "back.out(2)",
      });

      /* ── 8. CTA Section ─────────────────────────────────────── */
      gsap.from(".cta-box", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 75%" },
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.6)",
      });

      gsap.from(".cta-btn", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 70%" },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.3,
      });

      /* ── 9. Floating background blobs parallax ──────────────── */
      gsap.to(".bg-blob-a", {
        scrollTrigger: { scrub: 2, trigger: mainRef.current, start: "top top", end: "bottom bottom" },
        y: -120,
        x: 40,
        ease: "none",
      });
      gsap.to(".bg-blob-b", {
        scrollTrigger: { scrub: 2.5, trigger: mainRef.current, start: "top top", end: "bottom bottom" },
        y: 100,
        x: -30,
        ease: "none",
      });

    }, mainRef);

    return () => ctx.revert();
  }, []);

  /* ── CSS keyframes ───────────────────────────────────────── */
  const keyframes = `
    @keyframes locus-bob {
      0%,100% { transform: translateY(0px) rotate(-4deg); }
      50%      { transform: translateY(-16px) rotate(4deg); }
    }
    @keyframes locus-ring {
      0%   { transform: scale(0.4); opacity: 0.9; }
      100% { transform: scale(3); opacity: 0; }
    }
    @keyframes orbit-dot {
      0%   { transform: rotate(0deg) translateX(72px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(72px) rotate(-360deg); }
    }
    @keyframes orbit-dot2 {
      0%   { transform: rotate(180deg) translateX(54px) rotate(-180deg); }
      100% { transform: rotate(540deg) translateX(54px) rotate(-540deg); }
    }
    @keyframes orbit-dot3 {
      0%   { transform: rotate(90deg) translateX(90px) rotate(-90deg); }
      100% { transform: rotate(450deg) translateX(90px) rotate(-450deg); }
    }
    @keyframes shadow-pulse {
      0%,100% { transform: translateX(-50%) scaleX(1); opacity: 0.25; }
      50%      { transform: translateX(-50%) scaleX(0.55); opacity: 0.1; }
    }
    @keyframes marquee {
      0%   { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    @keyframes logo-shake {
      0%,100% { transform: rotate(3deg); }
      25%      { transform: rotate(-5deg) scale(1.05); }
      75%      { transform: rotate(6deg) scale(0.96); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes badge-bounce {
      0%,100% { transform: translateY(0); }
      40%      { transform: translateY(-6px); }
      60%      { transform: translateY(-3px); }
    }
    @keyframes cta-pulse {
      0%,100% { box-shadow: 5px 5px 0px #38BDF8; }
      50%      { box-shadow: 10px 10px 0px #38BDF8, 0 0 30px #38BDF850; }
    }
    @keyframes float-a {
      0%,100% { transform: translateY(0) rotate(12deg); }
      50%      { transform: translateY(-24px) rotate(20deg); }
    }
    @keyframes float-b {
      0%,100% { transform: translateY(0) rotate(-8deg); }
      50%      { transform: translateY(-18px) rotate(-16deg); }
    }
    @keyframes rfid-ping {
      0%   { transform: scale(0.7); opacity: 0.9; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes grass-wave {
      0%,100% { transform: scaleY(1) skewX(0deg); }
      50%      { transform: scaleY(1.08) skewX(2deg); }
    }
    @keyframes sun-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes road-scroll {
      from { background-position-x: 0px; }
      to   { background-position-x: -200px; }
    }
    @keyframes scan-line {
      0%   { top: 15%; opacity: 1; }
      50%  { top: 85%; opacity: 0.6; }
      100% { top: 15%; opacity: 1; }
    }
    @keyframes glow-pulse {
      0%,100% { box-shadow: 0 0 0 0 #6D28D940; }
      50%      { box-shadow: 0 0 0 16px #6D28D900; }
    }
  `;

  return (
    <div ref={mainRef} className="bg-background text-on-surface relative overflow-x-hidden flex flex-col" style={{ minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      {/* ── Background Blobs ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="bg-blob-a" style={{ position:"absolute", top:"5%", right:"-5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, #6D28D912 0%, transparent 70%)" }} />
        <div className="bg-blob-b" style={{ position:"absolute", bottom:"0%", left:"-8%", width:450, height:450, borderRadius:"50%", background:"radial-gradient(circle, #38BDF810 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", top:"40%", left:"45%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, #FFEA0008 0%, transparent 70%)" }} />
        {/* Floating geo shapes */}
        <div style={{ position:"absolute", top:"12%", left:"3%", width:70, height:70, background:"#6D28D918", border:"3px solid #6D28D928", animation:"float-a 7s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:"25%", right:"5%", width:50, height:50, background:"#38BDF818", border:"3px solid #38BDF828", borderRadius:"50%", animation:"float-b 5.5s ease-in-out infinite", animationDelay:"1s" }} />
        <div style={{ position:"absolute", bottom:"25%", left:"6%", width:36, height:36, background:"#FFEA0028", border:"3px solid #FFEA0050", animation:"float-a 6s ease-in-out infinite", animationDelay:"2s" }} />
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* NAV */}
      {/* ══════════════════════════════════════════════════════ */}
      <nav ref={navRef} className="w-full flex justify-between items-center px-4 sm:px-8 lg:px-12 py-4 border-b-[3px] border-primary bg-white/90 backdrop-blur-sm sticky top-0 z-50" style={{ boxShadow:"0 3px 0 #38BDF8" }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary flex items-center justify-center neo-shadow-sm cursor-pointer" style={{ border:"3px solid #000", animation:"logo-shake 3s ease-in-out infinite" }}>
            <span className="material-symbols-outlined text-white text-xl sm:text-2xl" style={{ fontVariationSettings:"'FILL' 1" }}>location_on</span>
          </div>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter" style={{ textShadow:"2px 2px 0px #6D28D9, 4px 4px 0px #38BDF8" }}>Attendsure</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <a href="#features" className="hidden sm:block text-primary font-bold uppercase text-sm hover:underline">Features</a>
          <a href="#benefits" className="hidden sm:block text-primary font-bold uppercase text-sm hover:underline">Benefits</a>
          <Link href="/login" className="hidden sm:block text-primary font-bold uppercase text-sm hover:underline">Sign In</Link>
          <Link href="/login" className="neo-btn bg-tertiary text-on-surface text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5" style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #6D28D9", animation:"badge-bounce 3s ease-in-out infinite" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Logged Out Toast */}
      {loggedOut && (
        <div className="fixed top-20 right-4 z-50 bg-secondary-container p-3 max-w-[260px]" style={{ border:"3px solid #000", boxShadow:"4px 4px 0 #38BDF8" }}>
          <p className="font-black uppercase text-sm flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-lg text-primary">exit_to_app</span>
            Logged out successfully
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-14 text-center relative z-10 overflow-hidden">

        {/* ─ Locus Animation ─ */}
        <div className="hero-anim relative flex items-center justify-center mb-6 sm:mb-8" style={{ width:200, height:200 }}>
          {[
            { color:"#6D28D9", delay:"0s" },
            { color:"#38BDF8", delay:"0.5s" },
            { color:"#FFEA00", delay:"1s" },
            { color:"#6D28D9", delay:"1.5s" },
          ].map((r, i) => (
            <div key={i} style={{ position:"absolute", width:90, height:90, borderRadius:"50%", border:`3px solid ${r.color}`, animation:`locus-ring 2s ease-out infinite`, animationDelay:r.delay, pointerEvents:"none" }} />
          ))}
          <div style={{ position:"absolute", width:12, height:12, borderRadius:"50%", background:"#6D28D9", border:"2px solid #000", animation:"orbit-dot 3s linear infinite" }} />
          <div style={{ position:"absolute", width:9, height:9, borderRadius:"50%", background:"#38BDF8", border:"2px solid #000", animation:"orbit-dot2 4.5s linear infinite" }} />
          <div style={{ position:"absolute", width:7, height:7, borderRadius:"50%", background:"#FFEA00", border:"2px solid #000", animation:"orbit-dot3 6s linear infinite" }} />
          <div style={{ position:"absolute", bottom:16, left:"50%", width:60, height:10, borderRadius:"50%", background:"#6D28D9", animation:"shadow-pulse 1.6s ease-in-out infinite", filter:"blur(5px)" }} />
          <div style={{
            animation:"locus-bob 1.6s ease-in-out infinite",
            position:"relative", zIndex:10,
            width:90, height:90,
            background:"#6D28D9",
            border:"4px solid #000",
            boxShadow:"6px 6px 0px #38BDF8",
            display:"flex", alignItems:"center", justifyContent:"center",
            borderRadius:"50% 50% 50% 0",
            transform:"rotate(-45deg)",
          }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize:40, transform:"rotate(45deg)", fontVariationSettings:"'FILL' 1", display:"block" }}>location_on</span>
          </div>
        </div>

        {/* Badges */}
        <div className="hero-anim flex flex-wrap justify-center gap-2 mb-5">
          <div className="flex items-center gap-2 bg-secondary-container px-3 py-1.5" style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #6D28D9" }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">GPS Engine // Online</span>
          </div>
          <div className="flex items-center gap-2 bg-tertiary px-3 py-1.5" style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #38BDF8" }}>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">✦ RFID Powered</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="hero-anim text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-[0.85] mb-6 sm:mb-8">
          <span className="bg-primary text-white px-2 sm:px-3 inline-block -rotate-1" style={{ border:"3px solid #000", boxShadow:"5px 5px 0 #38BDF8" }}>Track</span>
          <br />
          <span className="text-on-surface inline-block">Every.</span>
          <br />
          <span className="bg-tertiary text-on-surface px-2 sm:px-3 inline-block rotate-1" style={{ border:"3px solid #000", boxShadow:"5px 5px 0 #6D28D9" }}>Student.</span>
        </h1>

        {/* Subtext */}
        <p className="hero-anim text-base sm:text-xl md:text-2xl font-bold max-w-2xl mx-auto mb-8 sm:mb-10 bg-white text-left sm:text-center p-4 sm:p-6" style={{ border:"3px solid #000", boxShadow:"6px 6px 0px #6D28D9" }}>
          Zero spoofing. Zero excuses. Real-time GPS + RFID attendance verification for modern institutions.
        </p>

        {/* CTA Buttons */}
        <div className="hero-anim flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-2 sm:px-0">
          <Link href="/login" className="neo-btn bg-primary text-white text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 w-full sm:w-auto justify-center group" style={{ border:"3px solid #000", animation:"cta-pulse 2.5s ease-in-out infinite" }}>
            Start Now
            <span className="material-symbols-outlined ml-2 group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </Link>
          <a href="#journey" className="neo-btn bg-white text-primary text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 w-full sm:w-auto justify-center" style={{ border:"3px solid #6D28D9", boxShadow:"4px 4px 0px #38BDF8" }}>
            See How It Works ↓
          </a>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="flex flex-col sm:flex-row mt-12 sm:mt-16 w-full max-w-2xl mx-auto divide-y-[3px] sm:divide-y-0 sm:divide-x-[3px] divide-primary bg-white" style={{ border:"3px solid #000", boxShadow:"6px 6px 0 #38BDF8" }}>
          {[
            { val: `${c1 / 10 < 100 ? c1 / 10 : 99.8}%`, label:"Accuracy" },
            { val: `<${c2}m`, label:"GPS Precision" },
            { val: c3 >= 9999 ? "∞" : c3.toLocaleString(), label:"Students Enrolled" },
          ].map((s) => (
            <div key={s.label} className="stat-card flex-1 px-6 py-5 text-center group hover:bg-primary-container transition-colors cursor-default">
              <p className="text-3xl sm:text-4xl font-black text-primary group-hover:-translate-y-1 transition-transform">{s.val}</p>
              <p className="text-xs font-black uppercase tracking-widest text-on-surface/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─ Marquee Ribbon ─ */}
      <div className="border-y-[3px] border-primary bg-tertiary py-2.5 overflow-hidden whitespace-nowrap relative z-20">
        <p className="text-sm sm:text-lg font-black uppercase inline-block tracking-widest text-on-surface" style={{ animation:"marquee 22s linear infinite" }}>
          &nbsp;&nbsp;&nbsp;/// GPS VERIFIED /// RFID INTEGRATED /// ZERO SPOOFING /// LIVE TRACKING /// ENTERPRISE GRADE /// ATTENDSURE /// ANTI-PROXY /// REAL-TIME ANALYTICS /// GPS VERIFIED /// RFID INTEGRATED /// ZERO SPOOFING /// LIVE TRACKING ///
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* JOURNEY SECTION — GSAP Pinned Scroll                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="journey" ref={journeyRef} className="relative" style={{ height:"380vh" }}>
        <div ref={journeyPinRef} className="w-full overflow-hidden relative flex flex-col" style={{ height:"100vh", background:"linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 60%, #7DD3FC 100%)" }}>

          {/* Sun */}
          <div className="absolute" style={{ top:24, right:80, width:60, height:60, background:"#FFEA00", borderRadius:"50%", border:"3px solid #000", boxShadow:"4px 4px 0 #000", animation:"sun-spin 20s linear infinite" }}>
            {[0,45,90,135,180,225,270,315].map(a => (
              <div key={a} style={{ position:"absolute", top:"50%", left:"50%", width:8, height:22, background:"#FFEA00", border:"2px solid #000", borderRadius:3, transformOrigin:"4px 0px", transform:`rotate(${a}deg) translateY(-42px)` }} />
            ))}
          </div>

          {/* Section Label */}
          <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-2 z-10 pointer-events-none">
            <div className="bg-white px-5 py-2" style={{ border:"3px solid #000", boxShadow:"4px 4px 0 #6D28D9" }}>
              <p className="font-black uppercase text-sm tracking-widest text-primary">📍 The Student Journey</p>
            </div>
            <p className="text-xs font-black uppercase text-on-surface/50 tracking-widest">Scroll to walk →</p>
          </div>

          {/* Clouds */}
          <div ref={cloud1Ref} className="absolute" style={{ top: 50, pointerEvents:"none" }}>
            <CloudSVG size={1.2} />
          </div>
          <div ref={cloud2Ref} className="absolute" style={{ top: 30, pointerEvents:"none" }}>
            <CloudSVG size={0.85} />
          </div>

          {/* Ground / Grass */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height:110, background:"#4ADE80", borderTop:"4px solid #000", animation:"grass-wave 3s ease-in-out infinite" }} />

          {/* Road */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height:64, background:"#374151", borderTop:"4px solid #000" }} />
          {/* Road dashes */}
          <div ref={roadLineRef} className="absolute bottom-[28px] left-0 right-0" style={{
            height:8, backgroundImage:"repeating-linear-gradient(90deg, #FFEA00 0px, #FFEA00 60px, transparent 60px, transparent 100px)",
            backgroundRepeat:"repeat-x",
          }} />

          {/* Pavement stripe */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height:8, background:"#FFEA00", borderTop:"3px solid #000" }} />

          {/* House (start) */}
          <div ref={houseRef} className="absolute bottom-[72px]" style={{ left:40 }}>
            <HouseSVG />
          </div>

          {/* Bus Stop (mid) */}
          <div ref={busStopRef} className="absolute bottom-[72px]" style={{ left:0, opacity:0 }}>
            <BusStopSVG />
          </div>

          {/* School (end) */}
          <div ref={schoolRef} className="absolute bottom-[72px]" style={{ right:-300, opacity:0 }}>
            <SchoolSVG />
          </div>

          {/* Label at School: "Attendance Verified" */}
          <div className="absolute bottom-[280px]" style={{ right:-240, opacity:0 }} id="school-badge">
            {/* triggered by schoolRef appearing */}
          </div>

          {/* Student Character */}
          <div ref={studentRef} className="absolute bottom-[64px]" style={{ left:-160, zIndex:20 }}>
            <StudentSVG walkProgress={walkProgress} />
          </div>

          {/* Progress text */}
          <div className="absolute bottom-20 left-1/2" style={{ transform:"translateX(-50%)", zIndex:30, pointerEvents:"none" }}>
            <p className="text-xs font-black uppercase tracking-widest text-white/60">🏫 Walk to school</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* FEATURES / SYSTEM SPECS                               */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="features" className="w-full bg-primary text-white border-y-[3px] border-primary py-16 sm:py-24 px-4 sm:px-8 lg:px-16 z-10 relative" style={{ boxShadow:"inset 0 4px 0 #38BDF8" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-tertiary flex-shrink-0" style={{ border:"3px solid #000", animation:"spin-slow 8s linear infinite" }} />
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter">
              System <span className="text-secondary">Specs.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon:"gps_fixed", title:"Geofenced Zones", desc:"Define campus boundaries. Students outside cannot mark attendance — ever.", bg:"bg-white text-on-surface", shadow:"4px 4px 0px #38BDF8", delay:"0s" },
              { icon:"verified_user", title:"Anti-Spoof Engine", desc:"Cross-referenced GPS & device metadata eliminates every fake location attempt instantly.", bg:"bg-secondary-container text-on-surface", shadow:"4px 4px 0px #FFEA00", delay:"0.12s" },
              { icon:"bar_chart", title:"Live Analytics", desc:"Real-time dashboards. Who's present, where they are, when it happened.", bg:"bg-tertiary text-on-surface", shadow:"4px 4px 0px #6D28D9", delay:"0.24s" },
              { icon:"contactless", title:"RFID Integration", desc:"Dual-factor: RFID tap → GPS verify. No card without location confirmation.", bg:"bg-white text-on-surface", shadow:"4px 4px 0px #38BDF8", delay:"0.36s" },
              { icon:"schedule", title:"Auto Reports", desc:"PDF attendance reports generated daily, weekly, monthly — automatically.", bg:"bg-secondary-container text-on-surface", shadow:"4px 4px 0px #FFEA00", delay:"0.48s" },
              { icon:"people", title:"Parent Alerts", desc:"Instant SMS/push notifications to parents when a student is absent or arrives late.", bg:"bg-tertiary text-on-surface", shadow:"4px 4px 0px #6D28D9", delay:"0.6s" },
            ].map((f) => (
              <div key={f.title} className={`${f.bg} p-6 sm:p-8 hover:-translate-y-2 hover:scale-[1.02] transition-all cursor-default`} style={{ border:"3px solid #000", boxShadow:f.shadow }}>
                <span className="material-symbols-outlined text-5xl sm:text-6xl mb-4 block text-primary" style={{ fontVariationSettings:"'FILL' 1" }}>{f.icon}</span>
                <h3 className="text-xl sm:text-2xl font-black uppercase mb-3">{f.title}</h3>
                <p className="font-bold opacity-70 text-sm sm:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee #2 ──────────────────────────────────────── */}
      <div className="border-y-[3px] border-primary bg-primary py-2.5 overflow-hidden whitespace-nowrap relative z-20">
        <p className="text-sm sm:text-lg font-black uppercase inline-block tracking-widest text-white" style={{ animation:"marquee 18s linear infinite reverse" }}>
          &nbsp;&nbsp;&nbsp;/// RFID SCANNING /// GPS GEOFENCE /// ANTI-PROXY /// REAL-TIME /// ENTERPRISE READY /// RFID SCANNING /// GPS GEOFENCE /// ANTI-PROXY /// REAL-TIME /// ENTERPRISE READY ///
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* RFID + ATTENDANCE FLOW                                */}
      {/* ══════════════════════════════════════════════════════ */}
      <section ref={rfidRef} id="rfid" className="w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 bg-white z-10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="rfid-heading flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary flex-shrink-0" style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #38BDF8" }} />
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-on-surface">
              RFID <span className="bg-primary text-white px-2" style={{ border:"3px solid #000" }}>Module.</span>
            </h2>
          </div>
          <p className="font-bold text-on-surface/60 text-base sm:text-lg mb-12 max-w-2xl">
            Our dual-factor system combines physical RFID cards with real-time GPS location verification — making attendance fraud impossible.
          </p>

          {/* Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[
              { icon:"contactless", title:"RFID Card Tap", desc:"Each student carries a unique RFID card. They tap it at the scanner at the school gate.", color:"#6D28D9" },
              { icon:"gps_fixed", title:"GPS Cross-Check", desc:"The system simultaneously verifies the device's GPS coordinates are within the campus geofence.", color:"#38BDF8" },
              { icon:"verified", title:"Dual Confirmed", desc:"Only when BOTH factors match does the system register attendance. Fraud is mathematically impossible.", color:"#FFEA00", textDark:true },
            ].map((c) => (
              <div key={c.title} className="rfid-card-anim p-6 sm:p-8 relative overflow-hidden group hover:-translate-y-2 transition-all" style={{ background:c.color, border:"3px solid #000", boxShadow:"5px 5px 0 #000" }}>
                <span className="material-symbols-outlined text-6xl mb-4 block" style={{ fontVariationSettings:"'FILL' 1", color: c.textDark ? "#000" : "#fff" }}>{c.icon}</span>
                <h3 className="text-xl font-black uppercase mb-3" style={{ color: c.textDark ? "#000" : "#fff" }}>{c.title}</h3>
                <p className="font-bold text-sm" style={{ color: c.textDark ? "#000000aa" : "#ffffff99" }}>{c.desc}</p>
                {/* Background ping rings */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background:"#fff", animation:"rfid-ping 2s ease-out infinite" }} />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background:"#fff", animation:"rfid-ping 2s ease-out infinite", animationDelay:"0.7s" }} />
              </div>
            ))}
          </div>

          {/* Visual: Reader + Card + Scan beam */}
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16 mb-16 justify-center">
            <div className="relative flex-shrink-0">
              <RFIDReaderSVG />
              {/* Scan beam animation */}
              <div style={{ position:"absolute", left:15, right:15, height:3, background:"#38BDF8", boxShadow:"0 0 12px #38BDF8", animation:"scan-line 1.8s ease-in-out infinite", top:"50%", borderRadius:2 }} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div style={{ width:60, height:4, background:"#6D28D9", borderRadius:2, animation:"float-b 1s ease-in-out infinite" }} />
              <svg width="50" height="24" viewBox="0 0 50 24" fill="none">
                <path d="M5 12 L45 12 M35 4 L45 12 L35 20" stroke="#6D28D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="font-black uppercase text-xs text-primary tracking-widest">Signal</p>
            </div>
            <div className="rfid-card-anim flex-shrink-0" style={{ transform:"rotate(-8deg)" }}>
              <RFIDCardSVG />
            </div>
          </div>

          {/* Flow steps */}
          <div className="flow-steps">
            <h3 className="text-2xl sm:text-3xl font-black uppercase mb-6 text-on-surface">Complete Attendance Flow</h3>
            <div className="flex flex-col gap-0 max-w-3xl">
              {[
                { n:"01", icon:"directions_walk", title:"Student Arrives at Gate", detail:"Student approaches campus entrance with RFID student card.", color:"#6D28D9", textColor:"#fff" },
                { n:"02", icon:"contactless", title:"RFID Card Tap", detail:"Student taps their unique card on the RFID reader at the gate.", color:"#38BDF8", textColor:"#fff" },
                { n:"03", icon:"gps_fixed", title:"GPS Location Verified", detail:"System checks if the student's device is within the campus geofence (±2m precision).", color:"#1E1B4B", textColor:"#fff" },
                { n:"04", icon:"security", title:"Anti-Spoof Check", detail:"Device metadata, IP, and timing patterns analyzed to reject any VPN or mock location.", color:"#FFEA00", textColor:"#000" },
                { n:"05", icon:"verified", title:"Attendance Logged", detail:"Attendance is recorded in real-time to the database with timestamp, location, and device info.", color:"#4ADE80", textColor:"#000" },
                { n:"06", icon:"notifications", title:"Instant Notifications", detail:"Teacher dashboard updates live. Parents notified instantly. Reports auto-generated.", color:"#6D28D9", textColor:"#fff" },
              ].map((step, i) => (
                <div key={step.n} className="flow-step flex items-stretch group">
                  <div className="flex flex-col items-center mr-4 flex-shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center font-black text-sm" style={{ background:step.color, color:step.textColor, border:"3px solid #000", boxShadow:"3px 3px 0 #000", flexShrink:0 }}>
                      {step.n}
                    </div>
                    {i < 5 && <div style={{ width:3, flex:1, minHeight:24, background:"#000", marginTop:2, marginBottom:2 }} />}
                  </div>
                  <div className="pb-6 pt-1 flex-1 group-hover:translate-x-2 transition-transform">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-xl" style={{ color:step.color === "#FFEA00" ? "#6D28D9" : step.color, fontVariationSettings:"'FILL' 1" }}>{step.icon}</span>
                      <h4 className="font-black uppercase text-base text-on-surface">{step.title}</h4>
                    </div>
                    <p className="text-sm font-bold text-on-surface/60 pl-7">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* BENEFITS SECTION                                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section ref={benefitsRef} id="benefits" className="w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 relative z-10 overflow-hidden" style={{ background:"linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #1E1B4B 100%)" }}>
        {/* Decorative shapes */}
        <div style={{ position:"absolute", top:"-5%", right:"-3%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, #38BDF820 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-5%", left:"-5%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle, #FFEA0015 0%, transparent 70%)", pointerEvents:"none" }} />

        <div className="max-w-6xl mx-auto">
          <div className="benefits-heading flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-tertiary flex-shrink-0" style={{ border:"3px solid #fff", boxShadow:"3px 3px 0 #38BDF8" }} />
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
              Why <span className="bg-tertiary text-on-surface px-2" style={{ border:"3px solid #fff" }}>Attendsure?</span>
            </h2>
          </div>
          <p className="font-bold text-white/50 text-base sm:text-lg mb-12 max-w-2xl">
            Built for institutions that demand accountability, accuracy, and zero exceptions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12">
            {[
              { icon:"block", stat:"100%", label:"Proxy Eliminated", desc:"No more friends marking attendance for absentees. RFID + GPS makes this physically impossible.", color:"#FFEA00", textDark:true },
              { icon:"insights", stat:"10x", label:"Faster Reports", desc:"Automated PDF attendance sheets instead of manual registers. Save hours every week.", color:"#38BDF8", textDark:false },
              { icon:"family_restroom", stat:"Live", label:"Parent Visibility", desc:"Real-time notifications when students arrive or are absent. Full transparency.", color:"#6D28D9", textDark:false },
              { icon:"cloud_done", stat:"99.9%", label:"Uptime SLA", desc:"Cloud-hosted, encrypted, resilient infrastructure. Attendance data is always available.", color:"#4ADE80", textDark:true },
              { icon:"mobile_friendly", stat:"Any", label:"Device Support", desc:"Works on Android, iOS, and any browser. No proprietary hardware required for GPS-only mode.", color:"#6D28D9", textDark:false },
              { icon:"lock", stat:"E2E", label:"Encrypted Data", desc:"All attendance data is encrypted in transit and at rest. GDPR and FERPA compliant.", color:"#38BDF8", textDark:false },
              { icon:"query_stats", stat:"AI", label:"Pattern Analysis", desc:"Machine learning detects unusual attendance patterns and flags them for review automatically.", color:"#FFEA00", textDark:true },
              { icon:"support_agent", stat:"24/7", label:"Support", desc:"Dedicated support for institutions. Onboarding, training, and live chat included.", color:"#4ADE80", textDark:true },
            ].map((b) => (
              <div key={b.label} className="benefit-card group p-5 sm:p-6 hover:-translate-y-2 hover:scale-[1.03] transition-all cursor-default relative overflow-hidden" style={{ background:b.color, border:"3px solid #fff", boxShadow:"5px 5px 0 rgba(255,255,255,0.3)" }}>
                <span className="material-symbols-outlined text-4xl mb-3 block" style={{ fontVariationSettings:"'FILL' 1", color: b.textDark ? "#000" : "#fff" }}>{b.icon}</span>
                <p className="text-3xl font-black mb-1" style={{ color: b.textDark ? "#000" : "#fff" }}>{b.stat}</p>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: b.textDark ? "#00000099" : "#ffffff99" }}>{b.label}</p>
                <p className="text-xs font-bold" style={{ color: b.textDark ? "#00000088" : "#ffffff88" }}>{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonial / quote */}
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            {[
              { quote: `"Attendsure reduced our manual attendance work by 90%. The RFID + GPS combo is bulletproof."`, name:"Dr. Priya Menon", role:"Principal, IIT Prep Academy", color:"#38BDF8" },
              { quote: `"Parents love the real-time alerts. We've had zero proxy attendance incidents since deployment."`, name:"Mr. Ahmed Siddiqui", role:"HOD, National Polytechnic", color:"#FFEA00" },
            ].map((t) => (
              <div key={t.name} className="flex-1 p-6 sm:p-8 relative" style={{ background:"rgba(255,255,255,0.07)", border:`3px solid ${t.color}`, boxShadow:`5px 5px 0 ${t.color}60` }}>
                <p className="text-4xl font-black text-white/20 mb-2">"</p>
                <p className="text-base sm:text-lg font-bold text-white mb-4">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center font-black text-sm" style={{ background:t.color, border:"3px solid #fff", color:"#000" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">{t.name}</p>
                    <p className="font-bold text-white/40 text-xs uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* FINAL CTA SECTION                                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 bg-white z-10 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background:"linear-gradient(90deg, #6D28D9, #38BDF8, #FFEA00, #6D28D9)", backgroundSize:"200% 100%", animation:"marquee 4s linear infinite" }} />

        <div className="cta-box max-w-3xl mx-auto p-8 sm:p-14 relative" style={{ background:"#6D28D9", border:"4px solid #000", boxShadow:"10px 10px 0 #38BDF8" }}>
          {/* Spinning deco */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-tertiary" style={{ border:"3px solid #000", animation:"spin-slow 5s linear infinite" }} />
          <div className="absolute -bottom-5 -left-5 w-9 h-9 bg-primary rounded-full" style={{ border:"3px solid #000", animation:"spin-slow 7s linear infinite reverse" }} />

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <p className="text-xs font-black uppercase tracking-widest text-white/60">System Ready</p>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4 leading-tight">
            Ready to Eliminate
            <br />
            <span className="bg-tertiary text-on-surface px-2" style={{ border:"3px solid #fff" }}>Fake Attendance?</span>
          </h2>
          <p className="text-white/70 font-bold text-base sm:text-lg mb-8">
            Join hundreds of institutions using Attendsure. Set up in under 10 minutes. No hardware vendor lock-in.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="cta-btn neo-btn bg-tertiary text-on-surface text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 justify-center group" style={{ border:"3px solid #000", boxShadow:"5px 5px 0 #000" }}>
              Start Free
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </Link>
            <a href="mailto:support@attendsure.io" className="cta-btn neo-btn bg-transparent text-white text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 justify-center" style={{ border:"3px solid #fff", boxShadow:"5px 5px 0 rgba(255,255,255,0.3)" }}>
              Talk to Sales
            </a>
          </div>
        </div>

        {/* Mini feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["✓ No credit card required", "✓ RFID hardware optional", "✓ GPS works on any device", "✓ 99.9% Uptime SLA", "✓ GDPR Compliant"].map(f => (
            <span key={f} className="text-xs font-black uppercase px-3 py-1.5" style={{ border:"2px solid #6D28D9", color:"#6D28D9", background:"#fff" }}>{f}</span>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* FOOTER                                                */}
      {/* ══════════════════════════════════════════════════════ */}
      <footer className="w-full bg-white border-t-[4px] border-primary pt-12 sm:pt-16 pb-8 px-4 sm:px-8 lg:px-12 relative overflow-hidden z-20" style={{ boxShadow:"inset 0 4px 0 #38BDF8" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary flex items-center justify-center" style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #38BDF8", animation:"logo-shake 4s ease-in-out infinite" }}>
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings:"'FILL' 1" }}>location_on</span>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-on-surface">Attendsure</span>
            </div>
            <p className="text-sm font-bold text-on-surface border-l-[3px] border-primary pl-3">
              No fake locations. No proxy roll calls. Just real-time GPS + RFID precision attendance.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-tertiary px-2 py-1 w-max" style={{ border:"2px solid #000", boxShadow:"2px 2px 0 #000" }}>Navigation</h3>
            {[{ label:"Portal Home", href:"/" }, { label:"Login", href:"/login" }, { label:"Features", href:"#features" }, { label:"Benefits", href:"#benefits" }].map(l => (
              <Link key={l.label} href={l.href} className="text-sm font-bold text-on-surface hover:translate-x-2 hover:text-primary transition-all uppercase">{l.label}</Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-secondary px-2 py-1 w-max" style={{ border:"2px solid #000", boxShadow:"2px 2px 0 #000" }}>Compliance</h3>
            {["Privacy Policy", "Terms of Use", "System Status", "GDPR"].map(l => (
              <a key={l} href="#" className="text-sm font-bold text-on-surface hover:translate-x-2 hover:text-primary transition-all uppercase">{l}</a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-primary text-white px-2 py-1 w-max" style={{ border:"2px solid #000", boxShadow:"2px 2px 0 #000" }}>Support</h3>
            <div className="flex items-center gap-3 bg-surface-container p-3 group hover:scale-[1.03] hover:-translate-y-0.5 transition-all cursor-pointer" style={{ border:"2px solid #000", boxShadow:"3px 3px 0 #38BDF8" }}>
              <span className="material-symbols-outlined text-2xl text-primary group-hover:animate-bounce flex-shrink-0">mail</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-on-surface/50">HQ Contact</p>
                <p className="text-xs font-bold text-on-surface">support@attendsure.io</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-[3px] border-primary pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-bold text-on-surface/60 text-xs uppercase text-center sm:text-left">
            © {new Date().getFullYear()} Attendsure Systems. All Rights Reserved.
          </p>
          <div className="flex gap-3">
            {[{ bg:"bg-primary", text:"text-white", label:"X" }, { bg:"bg-secondary", text:"text-on-surface", label:"IN" }].map(s => (
              <div key={s.label} className={`w-9 h-9 ${s.bg} flex items-center justify-center cursor-pointer hover:-translate-y-1 hover:scale-110 transition-all`} style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}>
                <span className={`font-black ${s.text} text-xs`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </footer>
    </div>
  );
}

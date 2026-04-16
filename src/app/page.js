"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* ── Animated Counter Hook ───────────────────────────────── */
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

/* ── Intersection Observer Hook ──────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function LandingPage() {
  const [loggedOut, setLoggedOut] = useState(false);
  const [statsRef, statsInView] = useInView(0.3);
  const [featRef, featInView] = useInView(0.1);
  const [heroVisible, setHeroVisible] = useState(false);

  const c1 = useCounter(998, 2000, statsInView);
  const c2 = useCounter(2, 1000, statsInView);
  const c3 = useCounter(9999, 2200, statsInView);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("loggedOut")) {
      setLoggedOut(true);
      setTimeout(() => setLoggedOut(false), 5000);
    }
    return () => clearTimeout(t);
  }, []);

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
    @keyframes float-a {
      0%,100% { transform: translateY(0) rotate(12deg); }
      50%      { transform: translateY(-24px) rotate(20deg); }
    }
    @keyframes float-b {
      0%,100% { transform: translateY(0) rotate(-8deg); }
      50%      { transform: translateY(-18px) rotate(-16deg); }
    }
    @keyframes float-c {
      0%,100% { transform: translateY(0) rotate(45deg); }
      50%      { transform: translateY(-30px) rotate(55deg); }
    }
    @keyframes float-d {
      0%,100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-12px) scale(1.08); }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-left {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes word-pop {
      0%   { opacity: 0; transform: scale(0.7) rotate(-6deg); }
      60%  { transform: scale(1.08) rotate(2deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @keyframes badge-bounce {
      0%,100% { transform: translateY(0); }
      40%      { transform: translateY(-6px); }
      60%      { transform: translateY(-3px); }
    }
    @keyframes card-in {
      from { opacity: 0; transform: translateY(50px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
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
    @keyframes bg-drift-a {
      0%,100% { transform: translate(0,0) rotate(0deg); }
      50%      { transform: translate(30px,-40px) rotate(180deg); }
    }
    @keyframes bg-drift-b {
      0%,100% { transform: translate(0,0) rotate(0deg); }
      50%      { transform: translate(-25px, 35px) rotate(-120deg); }
    }
    @keyframes cta-pulse {
      0%,100% { box-shadow: 5px 5px 0px #38BDF8; }
      50%      { box-shadow: 8px 8px 0px #38BDF8, 0 0 20px #38BDF840; }
    }
  `;

  return (
    <div className="min-h-screen bg-background text-on-surface relative overflow-x-hidden flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      {/* ── Background floating shapes ──────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div style={{ position:"absolute", top:"8%", left:"4%", width:90, height:90, background:"#6D28D920", border:"3px solid #6D28D930", animation:"float-a 7s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:"20%", right:"6%", width:60, height:60, background:"#38BDF820", border:"3px solid #38BDF830", borderRadius:"50%", animation:"float-b 5s ease-in-out infinite", animationDelay:"1s" }} />
        <div style={{ position:"absolute", bottom:"30%", left:"8%", width:44, height:44, background:"#FFEA0030", border:"3px solid #FFEA0060", animation:"float-c 6s ease-in-out infinite", animationDelay:"2s" }} />
        <div style={{ position:"absolute", top:"55%", right:"3%", width:70, height:70, background:"#6D28D915", border:"3px solid #6D28D925", borderRadius:"50%", animation:"float-d 8s ease-in-out infinite", animationDelay:"0.5s" }} />
        <div style={{ position:"absolute", bottom:"15%", right:"12%", width:36, height:36, background:"#38BDF825", border:"3px solid #38BDF840", animation:"float-b 4.5s ease-in-out infinite", animationDelay:"3s" }} />
        <div style={{ position:"absolute", top:"70%", left:"20%", width:28, height:28, background:"#FFEA0040", border:"3px solid #FFEA0060", animation:"float-a 5.5s ease-in-out infinite", animationDelay:"1.5s" }} />
        {/* BG large blobs */}
        <div style={{ position:"absolute", top:"-10%", right:"-8%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, #6D28D910 0%, transparent 70%)", animation:"bg-drift-a 20s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-5%", left:"-5%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, #38BDF810 0%, transparent 70%)", animation:"bg-drift-b 18s ease-in-out infinite" }} />
      </div>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="w-full flex justify-between items-center px-4 sm:px-8 lg:px-12 py-4 border-b-[3px] border-primary bg-white/90 backdrop-blur-sm sticky top-0 z-50" style={{ boxShadow: "0 3px 0 #38BDF8" }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-9 h-9 sm:w-11 sm:h-11 bg-primary flex items-center justify-center neo-shadow-sm cursor-pointer"
            style={{ animation: "logo-shake 3s ease-in-out infinite" }}
          >
            <span className="material-symbols-outlined text-white text-xl sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          </div>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter" style={{ textShadow: "2px 2px 0px #6D28D9, 4px 4px 0px #38BDF8" }}>
            Attendsure
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="hidden sm:block text-primary font-bold uppercase text-sm hover:underline">Sign In</Link>
          <Link href="/login" className="neo-btn bg-tertiary text-on-surface text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5" style={{ animation: "badge-bounce 3s ease-in-out infinite" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Logged Out Toast */}
      {loggedOut && (
        <div className="fixed top-20 right-4 z-50 bg-secondary-container neo-border p-3 max-w-[260px] neo-shadow" style={{ animation: "slide-left 0.4s ease" }}>
          <p className="font-black uppercase text-sm flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-lg text-primary">exit_to_app</span>
            Logged out successfully
          </p>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-14 text-center relative z-10">

        {/* ── LOCUS ANIMATION ─────────────────────────────────── */}
        <div className="relative flex items-center justify-center mb-6 sm:mb-8" style={{ width: 200, height: 200 }}>
          {/* Radar rings — 4 layers */}
          {[
            { color: "#6D28D9", delay: "0s" },
            { color: "#38BDF8", delay: "0.5s" },
            { color: "#FFEA00", delay: "1s" },
            { color: "#6D28D9", delay: "1.5s" },
          ].map((r, i) => (
            <div key={i} style={{ position:"absolute", width:90, height:90, borderRadius:"50%", border:`3px solid ${r.color}`, animation:`locus-ring 2s ease-out infinite`, animationDelay: r.delay, pointerEvents:"none" }} />
          ))}

          {/* Orbit dots */}
          <div style={{ position:"absolute", width:12, height:12, borderRadius:"50%", background:"#6D28D9", border:"2px solid #000", animation:"orbit-dot 3s linear infinite" }} />
          <div style={{ position:"absolute", width:9, height:9, borderRadius:"50%", background:"#38BDF8", border:"2px solid #000", animation:"orbit-dot2 4.5s linear infinite" }} />
          <div style={{ position:"absolute", width:7, height:7, borderRadius:"50%", background:"#FFEA00", border:"2px solid #000", animation:"orbit-dot3 6s linear infinite" }} />

          {/* Small trailing sparks around the pin */}
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <div key={i} style={{
              position:"absolute", width:5, height:5, borderRadius:"50%",
              background: i % 2 === 0 ? "#6D28D9" : "#38BDF8",
              opacity: 0.5,
              transform: `rotate(${deg}deg) translateX(42px)`,
              animation: `spin-slow ${8 + i}s linear infinite`,
            }} />
          ))}

          {/* Ground shadow */}
          <div style={{ position:"absolute", bottom:16, left:"50%", width:60, height:10, borderRadius:"50%", background:"#6D28D9", animation:"shadow-pulse 1.6s ease-in-out infinite", filter:"blur(5px)" }} />

          {/* Main GPS pin */}
          <div style={{
            animation: "locus-bob 1.6s ease-in-out infinite",
            position: "relative", zIndex: 10,
            width: 90, height: 90,
            background: "#6D28D9",
            border: "4px solid #000",
            boxShadow: "6px 6px 0px #38BDF8",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
          }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 40, transform: "rotate(45deg)", fontVariationSettings: "'FILL' 1", display: "block" }}>
              location_on
            </span>
          </div>
        </div>

        {/* Online badge — bouncing */}
        <div className="flex items-center gap-2 bg-secondary-container neo-border neo-shadow-sm px-3 py-1.5 mb-5 w-max mx-auto" style={{ animation: heroVisible ? "slide-up 0.5s ease both" : "none" }}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block"></span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-on-surface">GPS Engine // Online</span>
        </div>

        {/* Hero headline — staggered word pop */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-[0.85] mb-6 sm:mb-8">
          <span className="bg-primary text-white px-2 sm:px-3 inline-block -rotate-1 neo-border neo-shadow"
            style={{ animation: heroVisible ? "word-pop 0.6s cubic-bezier(.34,1.56,.64,1) 0.1s both" : "none" }}>Track</span>
          <br />
          <span className="text-on-surface inline-block"
            style={{ animation: heroVisible ? "word-pop 0.6s cubic-bezier(.34,1.56,.64,1) 0.3s both" : "none" }}>Every.</span>
          <br />
          <span className="bg-tertiary text-on-surface px-2 sm:px-3 inline-block rotate-1 neo-border"
            style={{ boxShadow: "5px 5px 0px #6D28D9", animation: heroVisible ? "word-pop 0.6s cubic-bezier(.34,1.56,.64,1) 0.5s both" : "none" }}>Student.</span>
        </h1>

        {/* Sub-text */}
        <p className="text-base sm:text-xl md:text-2xl font-bold max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 bg-white neo-border p-4 sm:p-6 text-left sm:text-center"
          style={{ boxShadow: "6px 6px 0px #6D28D9", animation: heroVisible ? "slide-up 0.6s ease 0.6s both" : "none" }}>
          Zero spoofing. Zero excuses. Real-time GPS attendance verification for modern institutions.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-2 sm:px-0"
          style={{ animation: heroVisible ? "slide-up 0.6s ease 0.8s both" : "none" }}>
          <Link href="/login"
            className="neo-btn bg-primary text-white text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 w-full sm:w-auto justify-center group"
            style={{ animation: "cta-pulse 2.5s ease-in-out infinite" }}>
            Start Now
            <span className="material-symbols-outlined ml-2 group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </Link>
          <a href="#features"
            className="neo-btn bg-white text-primary text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 w-full sm:w-auto justify-center"
            style={{ border: "3px solid #6D28D9", boxShadow: "4px 4px 0px #38BDF8" }}>
            Learn More
          </a>
        </div>

        {/* ── Stats row — counting animation ───────────────── */}
        <div ref={statsRef} className="flex flex-col sm:flex-row mt-12 sm:mt-16 w-full max-w-2xl mx-auto divide-y-[3px] sm:divide-y-0 sm:divide-x-[3px] divide-primary neo-border neo-shadow-lg bg-white"
          style={{ animation: statsInView ? "slide-up 0.7s ease both" : "none" }}>
          {[
            { val: `${c1 / 10 < 100 ? c1 / 10 : 99.8}%`, label: "Accuracy", note: statsInView && c1 < 998 ? "counting..." : "" },
            { val: `<${c2}m`, label: "GPS Precision" },
            { val: c3 >= 9999 ? "∞" : c3.toLocaleString(), label: "Students" },
          ].map((s) => (
            <div key={s.label} className="flex-1 px-6 py-5 text-center group hover:bg-primary-container transition-colors">
              <p className="text-3xl sm:text-4xl font-black text-primary group-hover:-translate-y-1 transition-transform">{s.val}</p>
              <p className="text-xs font-black uppercase tracking-widest text-on-surface/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE RIBBON ───────────────────────────────────── */}
      <div className="border-y-[3px] border-primary bg-tertiary py-2.5 overflow-hidden whitespace-nowrap relative z-20">
        <p className="text-sm sm:text-lg font-black uppercase inline-block tracking-widest text-on-surface" style={{ animation: "marquee 25s linear infinite" }}>
          &nbsp;&nbsp;&nbsp;/// GPS VERIFIED /// ZERO SPOOFING /// LIVE TRACKING /// ENTERPRISE GRADE /// ATTENDSURE /// REAL-TIME ANALYTICS /// GPS VERIFIED /// ZERO SPOOFING /// LIVE TRACKING /// ENTERPRISE GRADE ///
        </p>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="w-full bg-primary text-white border-y-[3px] border-primary py-14 sm:py-20 px-4 sm:px-8 lg:px-16 z-10 relative" style={{ boxShadow: "inset 0 4px 0 #38BDF8" }}>
        <div className="max-w-6xl mx-auto">
          <div ref={featRef} className="flex items-center gap-3 mb-10 sm:mb-14" style={{ animation: featInView ? "slide-up 0.5s ease both" : "none" }}>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tertiary neo-border flex-shrink-0" style={{ animation: "spin-slow 8s linear infinite" }}></div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter">
              System <span className="text-secondary">Specs.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: "gps_fixed", title: "Geofenced Zones", desc: "Define a campus boundary. Students outside cannot mark attendance — ever.", bg: "bg-white text-on-surface", shadow: "4px 4px 0px #38BDF8", delay: "0s" },
              { icon: "verified_user", title: "Anti-Spoof Engine", desc: "Cross-referenced GPS & device metadata eliminates every fake location attempt instantly.", bg: "bg-secondary-container text-on-surface", shadow: "4px 4px 0px #6D28D9", delay: "0.15s" },
              { icon: "bar_chart", title: "Live Analytics", desc: "Real-time dashboards. Who's present, where they are, when it happened.", bg: "bg-tertiary text-on-surface", shadow: "4px 4px 0px #38BDF8", delay: "0.3s" },
            ].map((f) => (
              <div
                key={f.title}
                className={`${f.bg} neo-border p-6 sm:p-8 hover:-translate-y-2 hover:scale-[1.02] transition-all cursor-default`}
                style={{ boxShadow: f.shadow, animation: featInView ? `card-in 0.6s cubic-bezier(.34,1.56,.64,1) ${f.delay} both` : "none" }}
              >
                <span className="material-symbols-outlined text-5xl sm:text-6xl mb-4 block text-primary" style={{ fontVariationSettings: "'FILL' 1", animation: featInView ? `badge-bounce 2.5s ease-in-out ${f.delay} infinite` : "none" }}>{f.icon}</span>
                <h3 className="text-xl sm:text-2xl font-black uppercase mb-3">{f.title}</h3>
                <p className="font-bold opacity-70 text-sm sm:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="w-full bg-white border-t-[3px] border-primary pt-12 sm:pt-16 pb-8 px-4 sm:px-8 lg:px-12 relative overflow-hidden z-20" style={{ boxShadow: "inset 0 3px 0 #38BDF8" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary flex items-center justify-center neo-border neo-shadow-sm" style={{ animation: "logo-shake 4s ease-in-out infinite" }}>
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-on-surface">Attendsure</span>
            </div>
            <p className="text-sm font-bold text-on-surface border-l-[3px] border-primary pl-3">
              No fake locations. No proxy roll calls. Just real-time GPS precision.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-tertiary neo-border px-2 py-1 w-max neo-shadow-sm">Navigation</h3>
            {["Portal Home", "Login", "Register"].map(l => (
              <Link key={l} href={l === "Portal Home" ? "/" : "/login"} className="text-sm font-bold text-on-surface hover:translate-x-2 hover:text-primary transition-all uppercase">{l}</Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-secondary neo-border px-2 py-1 w-max neo-shadow-sm">Compliance</h3>
            {["Privacy Policy", "Terms of Use", "System Status"].map(l => (
              <a key={l} href="#" className="text-sm font-bold text-on-surface hover:translate-x-2 hover:text-primary transition-all uppercase">{l}</a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-primary text-white neo-border px-2 py-1 w-max neo-shadow-sm">Support</h3>
            <div className="flex items-center gap-3 bg-surface-container neo-border p-3 neo-shadow group hover:scale-[1.03] hover:-translate-y-0.5 transition-all cursor-pointer">
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
            &copy; {new Date().getFullYear()} Attendsure Systems. All Rights Reserved.
          </p>
          <div className="flex gap-3">
            {[{ bg: "bg-primary", text: "text-white", label: "X" }, { bg: "bg-secondary", text: "text-on-surface", label: "IN" }].map(s => (
              <div key={s.label} className={`w-9 h-9 ${s.bg} neo-border neo-shadow-sm flex items-center justify-center cursor-pointer hover:-translate-y-1 hover:scale-110 transition-all`}>
                <span className={`font-black ${s.text} text-xs`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      </footer>
    </div>
  );
}

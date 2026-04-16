"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("loggedOut")) {
      setLoggedOut(true);
      setTimeout(() => setLoggedOut(false), 5000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-black relative overflow-x-hidden flex flex-col">

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav className="w-full flex justify-between items-center px-4 sm:px-8 lg:px-12 py-4 border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary border-4 border-black flex items-center justify-center rotate-3 hover:-rotate-3 transition-transform shadow-[3px_3px_0px_#000]">
            <span className="material-symbols-outlined text-white text-xl sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              location_on
            </span>
          </div>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter" style={{ textShadow: "2px 2px 0px #000, 3px 3px 0px #38BDF8" }}>
            Attendsure
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="hidden sm:block text-black font-bold uppercase text-sm hover:underline">
            Sign In
          </Link>
          <Link href="/login" className="neo-btn bg-tertiary text-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Logged Out Toast */}
      {loggedOut && (
        <div className="fixed top-20 right-4 z-50 bg-secondary border-4 border-black shadow-[4px_4px_0px_#000] p-3 max-w-[260px]">
          <p className="font-black uppercase text-sm flex items-center gap-2 text-black">
            <span className="material-symbols-outlined text-lg">exit_to_app</span>
            Logged out successfully
          </p>
        </div>
      )}

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-16 sm:py-20 text-center relative z-10">
        {/* Floating badge */}
        <div className="flex items-center gap-2 bg-secondary border-4 border-black shadow-[3px_3px_0px_#000] px-3 py-1.5 mb-6 sm:mb-8 w-max mx-auto">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block"></span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">GPS Engine // Online</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-[0.85] mb-6 sm:mb-8">
          <span className="bg-primary text-white px-2 sm:px-3 inline-block -rotate-1 border-4 border-black shadow-[5px_5px_0px_#000]">Track</span>
          <br />
          <span>Every.</span>
          <br />
          <span className="bg-tertiary text-black px-2 sm:px-3 inline-block rotate-1 border-4 border-black shadow-[5px_5px_0px_#000]">Student.</span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl font-bold max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 bg-white border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0px_#6D28D9] text-left sm:text-center">
          Zero spoofing. Zero excuses. Real-time GPS attendance verification for modern institutions.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-2 sm:px-0">
          <Link href="/login" className="neo-btn bg-black text-white text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 w-full sm:w-auto justify-center group">
            Start Now
            <span className="material-symbols-outlined ml-2 group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </Link>
          <a href="#features" className="neo-btn bg-white text-black text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 w-full sm:w-auto justify-center">
            Learn More
          </a>
        </div>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 mt-12 sm:mt-16 w-full max-w-2xl mx-auto divide-y-4 sm:divide-y-0 sm:divide-x-4 divide-black border-4 border-black shadow-[6px_6px_0px_#000] bg-white">
          {[
            { val: "99.8%", label: "Accuracy" },
            { val: "<2m", label: "GPS Precision" },
            { val: "∞", label: "Students" },
          ].map((s) => (
            <div key={s.label} className="flex-1 px-6 py-4 text-center">
              <p className="text-3xl sm:text-4xl font-black text-primary">{s.val}</p>
              <p className="text-xs font-black uppercase tracking-widest text-black/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE RIBBON ─────────────────────────────────────── */}
      <div className="border-y-4 border-black bg-tertiary py-2.5 overflow-hidden whitespace-nowrap relative z-20">
        <p
          className="text-sm sm:text-lg font-black uppercase inline-block tracking-widest"
          style={{ animation: "marquee 25s linear infinite" }}
        >
          &nbsp;&nbsp;&nbsp;/// GPS VERIFIED /// ZERO SPOOFING /// LIVE TRACKING /// ENTERPRISE GRADE /// NEOBRUTALISM UI /// REAL-TIME ANALYTICS /// GPS VERIFIED /// ZERO SPOOFING /// LIVE TRACKING /// ENTERPRISE GRADE ///
        </p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes marquee { 0%{transform:translateX(0%)} 100%{transform:translateX(-50%)} }` }} />
      </div>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="w-full bg-black text-white border-y-8 border-black py-14 sm:py-20 px-4 sm:px-8 lg:px-16 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-10 sm:mb-14">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary border-2 border-white flex-shrink-0"></div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter">
              System <span className="text-tertiary">Specs.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {[
              { icon: "gps_fixed", title: "Geofenced Zones", desc: "Define a campus boundary. Students outside the perimeter simply cannot mark attendance — ever.", bg: "bg-secondary text-black", hover: "hover:bg-primary hover:text-white" },
              { icon: "verified_user", title: "Anti-Spoof Engine", desc: "Cross-referenced GPS with device metadata eliminates every fake location attempt in real-time.", bg: "bg-primary text-white", hover: "hover:bg-secondary hover:text-black" },
              { icon: "bar_chart", title: "Live Analytics", desc: "Real-time dashboards. Know who's present, where they are, and when — the moment it happens.", bg: "bg-tertiary text-black", hover: "hover:bg-white hover:text-black" },
            ].map((f, i) => (
              <div
                key={f.title}
                className={`${f.bg} ${f.hover} border-4 border-white p-6 sm:p-8 transition-colors cursor-default ${i > 0 ? "border-t-0 sm:border-t-4 sm:border-l-0 lg:border-t-4 lg:border-l-0" : ""}`}
              >
                <span className="material-symbols-outlined text-5xl sm:text-6xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                <h3 className="text-xl sm:text-2xl font-black uppercase mb-3">{f.title}</h3>
                <p className="font-bold opacity-80 text-sm sm:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="w-full bg-white border-t-8 border-black pt-12 sm:pt-16 pb-8 px-4 sm:px-8 lg:px-12 relative overflow-hidden z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14">

          {/* Brand */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-black flex items-center justify-center border-2 border-black -rotate-6">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-black">Attendsure</span>
            </div>
            <p className="text-sm font-bold text-black border-l-4 border-primary pl-3">
              The brute-force attendance system. No fake locations. No proxy roll calls.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-tertiary border-2 border-black px-2 py-1 w-max">Navigation</h3>
            <Link href="/" className="text-sm font-bold text-black hover:translate-x-1 hover:text-primary transition-all uppercase">Portal Home</Link>
            <Link href="/login" className="text-sm font-bold text-black hover:translate-x-1 hover:text-primary transition-all uppercase">Login</Link>
            <Link href="/login" className="text-sm font-bold text-black hover:translate-x-1 hover:text-primary transition-all uppercase">Register</Link>
          </div>

          {/* Compliance */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-secondary border-2 border-black px-2 py-1 w-max">Compliance</h3>
            <a href="#" className="text-sm font-bold text-black hover:translate-x-1 hover:text-primary transition-all uppercase">Privacy Policy</a>
            <a href="#" className="text-sm font-bold text-black hover:translate-x-1 hover:text-primary transition-all uppercase">Terms of Use</a>
            <a href="#" className="text-sm font-bold text-black hover:translate-x-1 hover:text-primary transition-all uppercase">System Status</a>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase bg-black text-white border-2 border-black px-2 py-1 w-max">Support</h3>
            <div className="flex items-center gap-3 bg-background border-4 border-black p-3 shadow-[3px_3px_0px_#000] group hover:scale-[1.02] transition-transform cursor-pointer">
              <span className="material-symbols-outlined text-2xl group-hover:animate-bounce flex-shrink-0">mail</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/50">HQ Contact</p>
                <p className="text-xs font-bold text-black">support@attendsure.io</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-bold text-black text-xs uppercase text-center sm:text-left">
            &copy; {new Date().getFullYear()} Attendsure Systems. All Rights Reserved.
          </p>
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-primary border-2 border-black flex items-center justify-center hover:shadow-[2px_2px_0px_#000] transition-all cursor-pointer">
              <span className="font-black text-white text-xs">X</span>
            </div>
            <div className="w-9 h-9 bg-secondary border-2 border-black flex items-center justify-center hover:shadow-[2px_2px_0px_#000] transition-all cursor-pointer">
              <span className="font-black text-black text-xs">IN</span>
            </div>
          </div>
        </div>

        {/* BG glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
      </footer>
    </div>
  );
}

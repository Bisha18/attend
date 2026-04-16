"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LandingPage() {
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    // Basic check for logged out state from url params or we can just rely on the fact they are here.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("loggedOut")) {
      setLoggedOut(true);
      setTimeout(() => setLoggedOut(false), 5000); // hide after 5s
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface relative overflow-x-hidden flex flex-col">
      {/* Navigation */}
      <nav className="w-full flex justify-between items-center p-6 lg:px-12 border-b-4 border-black bg-white z-50">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-primary neo-border neo-shadow-sm flex items-center justify-center rotate-3 hover:-rotate-3 transition-transform">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              location_on
            </span>
          </div>
          <span className="text-3xl font-black uppercase tracking-tighter" style={{textShadow: "2px 2px 0px #000, 4px 4px 0px #00E6FF"}}>Attendsure</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="hidden sm:block text-black font-bold uppercase hover:underline mr-4">
            Operative Access
          </Link>
          <Link href="/login" className="neo-btn bg-tertiary text-black text-sm px-6 py-2">
            LOGIN ITERATION
          </Link>
        </div>
      </nav>

      {/* Logged Out Toast */}
      {loggedOut && (
        <div className="fixed top-24 right-6 z-50 bg-secondary neo-border neo-shadow p-4 animate-bounce">
           <p className="font-black uppercase flex items-center gap-2">
             <span className="material-symbols-outlined">exit_to_app</span>
             Successfully Logged Out
           </p>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-center z-10 relative">
        <div className="max-w-4xl w-full relative">
          {/* Floating Element */}
           <div className="absolute -top-16 -left-12 w-24 h-24 bg-tertiary neo-border rounded-full flex items-center justify-center animate-[bounce_4s_ease-in-out_infinite] hidden md:flex">
             <span className="material-symbols-outlined text-4xl">radar</span>
           </div>

          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] mb-8 relative z-10" style={{textShadow: "4px 4px 0px #000, 8px 8px 0px #FFEA00"}}>
            <span className="bg-primary text-white px-2 inline-block -rotate-2 neo-border-2">GPS</span> <br />
            Attendance<br/>
            Machine.
          </h1>
          
          <p className="text-xl md:text-3xl font-bold max-w-3xl mx-auto mb-12 bg-white neo-border p-6 shadow-[8px_8px_0px_#FF2E93] rotate-1 relative z-20">
            Enterprise intelligence for tracking students and personnel with pinpoint precision. Absolute certainty, zero excuses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <Link href="/login" className="w-full sm:w-auto text-xl neo-btn bg-black text-white px-10 py-5 hover:bg-zinc-800 group">
               INITIALIZE LOGIN <span className="material-symbols-outlined ml-2 group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </Link>
            <a href="#features" className="w-full sm:w-auto text-xl neo-btn bg-white text-black px-10 py-5">
               SYSTEM SPECS
            </a>
          </div>
        </div>
      </main>

      {/* Marquee or Footer Ribbon */}
      <div className="border-y-4 border-black bg-tertiary py-3 overflow-hidden whitespace-nowrap hidden sm:block relative z-20">
        <p className="text-2xl font-black uppercase animate-[spin_100ms_linear_infinite] inline-block tracking-widest" style={{animation: "marquee 20s linear infinite"}}>
           /// STRICT VALIDATION /// ZERO SPOOFING /// REAL-TIME ANALYTICS /// GEOFENCE ENFORCEMENT /// ABSOLUTE PRECISION /// STRICT VALIDATION /// ZERO SPOOFING /// REAL-TIME ANALYTICS ///
        </p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}} />
      </div>

      {/* Features Section - fills blank space */}
      <section id="features" className="w-full bg-black text-white border-y-8 border-black py-20 px-6 lg:px-16 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-8 bg-primary neo-border"></div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">System <span className="text-tertiary">Specs.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="border-4 border-white p-8 bg-secondary text-black group hover:bg-tertiary transition-colors cursor-default">
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>gps_fixed</span>
              <h3 className="text-2xl font-black uppercase mb-3">Geofenced Zones</h3>
              <p className="font-bold text-black/80">Define a campus perimeter. Students outside the boundary cannot mark attendance — ever.</p>
            </div>
            <div className="border-4 border-l-0 border-white p-8 bg-primary text-white group hover:bg-black transition-colors cursor-default">
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <h3 className="text-2xl font-black uppercase mb-3">Anti-Spoof Engine</h3>
              <p className="font-bold text-white/80">Cross-referenced GPS coordinates with device metadata to eliminate fake location attempts.</p>
            </div>
            <div className="border-4 border-l-0 border-white p-8 bg-tertiary text-black group hover:bg-secondary transition-colors cursor-default">
              <span className="material-symbols-outlined text-6xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
              <h3 className="text-2xl font-black uppercase mb-3">Live Analytics</h3>
              <p className="font-bold text-black/80">Real-time dashboards. Know who's present, where they are, and when — the moment it happens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Background Shapes */}
      <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] min-w-[300px] border-[24px] border-black rounded-full mix-blend-overlay opacity-10 -z-10 pointer-events-none"></div>
      <div className="absolute top-[20%] left-[5%] w-[6vw] h-[6vw] bg-primary border-[6px] border-black -z-10 pointer-events-none rotate-45 animate-pulse"></div>

      {/* Bottom Component (Footer) */}
      <footer className="w-full bg-white border-t-8 border-black pt-16 pb-8 px-6 lg:px-12 relative overflow-hidden z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4 relative z-10">
             <div className="flex items-center gap-2 mb-4">
               <div className="w-10 h-10 bg-black flex items-center justify-center -rotate-6">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
              </div>
              <span className="text-3xl font-black uppercase tracking-tighter text-black">Attendsure</span>
             </div>
             <p className="text-lg font-bold text-black border-l-4 border-primary pl-4">The ultimate brute-force attendance system. No fake locations. No proxy roll calls.</p>
          </div>
          <div className="flex flex-col gap-4 relative z-10 lg:pl-12">
            <h3 className="text-xl font-black uppercase text-black bg-tertiary px-2 py-1 w-max border-2 border-black">Navigation</h3>
            <Link href="/" className="text-black font-bold hover:translate-x-2 hover:text-primary transition-all uppercase">Portal Home</Link>
            <Link href="/login" className="text-black font-bold hover:translate-x-2 hover:text-primary transition-all uppercase">Operative Login</Link>
            <Link href="/login" className="text-black font-bold hover:translate-x-2 hover:text-primary transition-all uppercase">Registration</Link>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <h3 className="text-xl font-black uppercase text-black bg-secondary px-2 py-1 w-max border-2 border-black">Compliance</h3>
            <a href="#" className="text-black font-bold hover:translate-x-2 hover:text-primary transition-all uppercase">Privacy Directive</a>
            <a href="#" className="text-black font-bold hover:translate-x-2 hover:text-primary transition-all uppercase">Terms of Service</a>
            <a href="#" className="text-black font-bold hover:translate-x-2 hover:text-primary transition-all uppercase">System Status</a>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <h3 className="text-xl font-black uppercase text-white bg-black px-2 py-1 w-max border-2 border-black">Support Vector</h3>
            <div className="flex items-center gap-3 bg-background border-4 border-black p-4 neo-shadow-sm group hover:scale-[1.02] transition-transform cursor-pointer">
               <span className="material-symbols-outlined text-3xl group-hover:animate-bounce">mail</span>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-black/60">Contact HQ</p>
                  <p className="text-sm font-bold text-black">support@attendsure.io</p>
               </div>
            </div>
          </div>
        </div>
        <div className="border-t-4 border-black pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
           <p className="font-bold text-black text-sm uppercase">&copy; {new Date().getFullYear()} Attendsure Systems. All Rights Reserved.</p>
           <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"><span className="font-black">X</span></div>
              <div className="w-10 h-10 bg-secondary border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"><span className="font-black">IN</span></div>
           </div>
        </div>
        {/* Footer wild background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-tertiary rounded-full mix-blend-multiply opacity-50 blur-3xl -z-0 translate-x-1/2 translate-y-1/4"></div>
      </footer>
    </div>
  );
}

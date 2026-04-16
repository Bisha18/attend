"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState({ name: "Student", role: "STUDENT" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "STUDENT") {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/?loggedOut=true");
  };

  const navLinks = [
    { name: "Dashboard", href: "/student/dashboard", icon: "dashboard" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 bg-secondary border-r-4 border-black h-screen overflow-hidden">

        {/* Brand Header */}
        <div className="flex-shrink-0 px-6 py-6 border-b-4 border-black bg-black">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary border-2 border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Attendsure</h1>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Student OS // v1.0</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-shrink-0 px-4 pt-6 pb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-3 px-2">Navigation</p>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 mb-2 border-2 border-black transition-all ${
                  isActive
                    ? "bg-tertiary text-black shadow-[3px_3px_0px_#000] font-black -translate-x-[2px] -translate-y-[2px]"
                    : "bg-white/60 text-black hover:bg-white hover:shadow-[3px_3px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] font-bold"
                }`}
              >
                <span className="material-symbols-outlined text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
                <span className="text-sm uppercase tracking-wide">{link.name}</span>
                {isActive && <span className="ml-auto w-2 h-2 bg-black rounded-full"></span>}
              </Link>
            );
          })}
        </div>

        {/* ── FILLER: expands to push bottom content down ──────── */}
        <div className="flex-1 flex flex-col justify-between px-4 py-4 min-h-0">

          {/* GPS Telemetry Block */}
          <div className="bg-black border-2 border-black p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 0)", backgroundSize: "8px 8px" }}></div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-3 relative z-10">// Live GPS Telemetry</p>
            <div className="space-y-2 relative z-10">
              {[
                { label: "Signal Lock", val: "98%", w: "w-[98%]", color: "bg-primary" },
                { label: "Accuracy", val: "±2m", w: "w-[78%]", color: "bg-secondary" },
                { label: "Satellites", val: "12", w: "w-[60%]", color: "bg-tertiary" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-bold text-white/60 uppercase">{row.label}</span>
                    <span className="text-[9px] font-black text-white">{row.val}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 border border-white/20 w-full">
                    <div className={`h-full ${row.color} animate-pulse`} style={{ width: row.w.replace("w-[","").replace("]","") }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 relative z-10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block"></span>
              <span className="text-[9px] font-bold text-green-400 uppercase">All relays nominal</span>
            </div>
          </div>

          {/* Decorative Neo Block */}
          <div className="mt-4 border-4 border-dashed border-black/40 p-3 bg-white/30 relative overflow-hidden">
            <span className="material-symbols-outlined text-[64px] absolute -right-3 -bottom-3 text-black/10" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
            <p className="text-[9px] font-black uppercase text-black/40 tracking-widest">Session Active</p>
            <p className="text-xs font-black text-black mt-1">Student clearance<br/>level operative.</p>
          </div>

        </div>

        {/* ── PINNED BOTTOM: Status + Logout ───────────────────── */}
        <div className="flex-shrink-0 border-t-4 border-black">
          <div className="bg-primary/20 border-b-2 border-black px-4 py-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <p className="text-[10px] font-black uppercase text-black tracking-wider">System Status: Online</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 bg-black text-white hover:bg-primary hover:text-white transition-colors group"
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">logout</span>
            <span className="font-black text-sm uppercase tracking-widest">Logout</span>
            <span className="ml-auto material-symbols-outlined text-sm opacity-50">arrow_forward</span>
          </button>
        </div>

      </aside>

      {/* ─── MAIN CONTENT (scrollable) ────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Sticky Top Header */}
        <header className="flex-shrink-0 sticky top-0 z-40 bg-tertiary border-b-4 border-black flex justify-between items-center px-6 h-20">
          <div className="flex items-center gap-4 lg:hidden">
            <span className="material-symbols-outlined text-black cursor-pointer">menu</span>
            <span className="text-xl font-black tracking-tight text-black uppercase">Attendsure</span>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-black text-white px-3 py-1.5 font-bold text-sm uppercase flex items-center gap-2 border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="material-symbols-outlined text-[14px] text-green-400">sensors</span>
              GPS Active
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-black uppercase leading-tight">{user.name}</p>
              <p className="text-[9px] font-bold text-black/70 uppercase tracking-widest">Student</p>
            </div>
            <div className="w-12 h-12 bg-primary border-4 border-black flex items-center justify-center text-white font-black shadow-[3px_3px_0px_#000]">
              S
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          {children}
        </div>

      </main>

      {/* Mobile Bottom NavBar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white flex justify-around items-center h-20 px-6 border-t-4 border-black z-50">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center gap-1 p-2 border-2 border-transparent transition-colors ${
                isActive ? "text-primary border-black bg-secondary font-black shadow-[2px_2px_0px_#000]" : "text-black"
              }`}
            >
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
              <span className="text-[10px] font-black uppercase">{link.name}</span>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-black">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[10px] font-black uppercase">Exit</span>
        </button>
      </nav>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeacherLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState({ name: "Professor", role: "TEACHER" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "TEACHER") router.push("/");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/?loggedOut=true");
  };

  const navLinks = [
    { name: "Live Map", href: "/teacher/start", icon: "map" },
    { name: "Live Attendance", href: "/teacher/live", icon: "group" },
    { name: "Attendance Log", href: "/teacher/history", icon: "assignment_turned_in" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">

      {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r-[3px] border-primary h-screen overflow-hidden" style={{ boxShadow: "3px 0 0 #38BDF8" }}>

        {/* Brand */}
        <div className="flex-shrink-0 px-6 py-5 border-b-[3px] border-primary bg-primary" style={{ boxShadow: "0 3px 0 #38BDF8" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center neo-border-2 neo-shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none">Attendsure</h1>
              <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Instructor Terminal</span>
            </div>
          </div>
        </div>

        {/* Nav Label */}
        <div className="flex-shrink-0 px-5 pt-5 pb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/50 mb-3 px-1">Control Panel</p>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 mb-2 neo-border transition-all ${
                  isActive
                    ? "bg-primary text-white font-black"
                    : "bg-surface-container text-on-surface hover:bg-primary-container font-bold"
                }`}
                style={isActive ? { boxShadow: "3px 3px 0px #38BDF8" } : { boxShadow: "2px 2px 0px #6D28D9" }}
              >
                <span className="material-symbols-outlined text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
                <span className="text-sm uppercase tracking-wide">{link.name}</span>
                {isActive && <span className="ml-auto w-2 h-2 rounded-full bg-secondary"></span>}
              </Link>
            );
          })}
        </div>

        {/* Filler */}
        <div className="flex-1 flex flex-col justify-between px-4 py-4 min-h-0">
          {/* Session Monitor */}
          <div className="neo-border bg-primary/5 p-4 relative overflow-hidden" style={{ boxShadow: "4px 4px 0px #38BDF8" }}>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-3">// Session Monitor</p>
            <div className="space-y-2.5">
              {[
                { label: "Active Students", val: "--", w: "80%", color: "bg-tertiary" },
                { label: "Uptime", val: "100%", w: "100%", color: "bg-secondary" },
                { label: "Clearance", val: "Lvl 5", w: "100%", color: "bg-primary" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-bold text-on-surface/50 uppercase">{row.label}</span>
                    <span className="text-[9px] font-black text-primary">{row.val}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container border border-primary/30 w-full">
                    <div className={`h-full ${row.color} animate-pulse`} style={{ width: row.w }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block"></span>
              <span className="text-[9px] font-bold text-green-600 uppercase">Session Secured</span>
            </div>
          </div>

          {/* Decorative card */}
          <div className="mt-4 border-[3px] border-dashed border-primary/30 p-3 bg-secondary-container/30 relative overflow-hidden">
            <span className="material-symbols-outlined text-[56px] absolute -right-2 -bottom-2 text-primary/10" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest">Admin Mode</p>
            <p className="text-xs font-black text-on-surface mt-1">Instructor access<br />fully authorized.</p>
          </div>
        </div>

        {/* Pinned Bottom */}
        <div className="flex-shrink-0 border-t-[3px] border-primary">
          <div className="bg-secondary-container px-4 py-2.5 flex items-center gap-2 border-b-[2px] border-primary/30">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <p className="text-[10px] font-black uppercase text-primary tracking-wider">Admin Clearance: Active</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 bg-surface text-on-surface hover:bg-primary hover:text-white transition-all group border-none"
          >
            <span className="material-symbols-outlined text-primary group-hover:text-white group-hover:rotate-12 transition-all">logout</span>
            <span className="font-black text-sm uppercase tracking-widest group-hover:text-white">Logout</span>
            <span className="ml-auto material-symbols-outlined text-sm text-primary/40 group-hover:text-white/60">arrow_forward</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="flex-shrink-0 sticky top-0 z-40 bg-white border-b-[3px] border-primary flex justify-between items-center px-4 sm:px-6 h-16 sm:h-20" style={{ boxShadow: "0 3px 0 #38BDF8" }}>
          <div className="flex items-center gap-3 lg:hidden">
            <span className="material-symbols-outlined text-primary cursor-pointer">menu</span>
            <span className="text-lg font-black tracking-tight text-primary uppercase">Attendsure</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <div className="bg-primary/10 text-primary px-3 py-1.5 font-bold text-xs uppercase flex items-center gap-2 neo-border neo-shadow-sm">
              <span className="material-symbols-outlined text-[14px] text-green-600">admin_panel_settings</span>
              Admin Level
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-on-surface uppercase leading-tight">{user.name}</p>
              <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Instructor</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary neo-border neo-shadow-sm flex items-center justify-center text-white font-black text-lg">
              T
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white flex justify-around items-center h-16 px-4 border-t-[3px] border-primary z-50" style={{ boxShadow: "0 -3px 0 #38BDF8" }}>
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.name} href={link.href} className={`flex flex-col items-center gap-1 p-2 neo-border transition-all ${isActive ? "bg-primary text-white neo-shadow-sm" : "text-on-surface bg-transparent border-transparent"}`}>
              <span className="material-symbols-outlined text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
              <span className="text-[9px] font-black uppercase">{link.name}</span>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-on-surface">
          <span className="material-symbols-outlined text-xl text-primary">logout</span>
          <span className="text-[9px] font-black uppercase">Exit</span>
        </button>
      </nav>
    </div>
  );
}

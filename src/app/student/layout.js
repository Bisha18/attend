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
    router.push("/");
  };

  const navLinks = [
    { name: "Dashboard", href: "/student/dashboard", icon: "dashboard" },
  ];

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      {/* SideNavBar */}
      <aside className="hidden lg:flex flex-col w-72 py-8 gap-2 bg-slate-50 rounded-r-[3rem] h-screen sticky left-0 top-0 border-r border-slate-200">
        <div className="px-8 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white">school</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-indigo-700 leading-tight">Attendance Pro</h1>
            <p className="text-xs font-medium text-slate-500 tracking-wider">GPS Verified</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`mx-2 px-4 py-3 flex items-center gap-4 rounded-full transition-colors ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm font-bold"
                    : "text-slate-500 hover:bg-slate-200/50 font-medium text-sm"
                }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className={isActive ? "font-bold text-sm" : "font-medium text-sm"}>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t-0 pt-4 px-2 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full text-left text-slate-500 px-4 py-3 mx-2 flex items-center gap-4 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-surface min-h-screen">
        <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 w-full">
          <div className="flex items-center gap-4 lg:hidden">
            <span className="material-symbols-outlined text-indigo-700">menu</span>
            <span className="text-xl font-bold tracking-tight text-indigo-700">FluidPrecision</span>
          </div>
          <div className="hidden lg:block">
            <span className="text-xl font-bold tracking-tight text-indigo-700">FluidPrecision</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface">{user.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Student</p>
              </div>
               <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shadow-sm">
                S
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Bottom NavBar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl flex justify-around items-center h-20 px-6 border-t border-slate-100 z-50">
         {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? "text-indigo-700" : "text-slate-400"
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{link.icon}</span>
                <span className="text-[10px] font-bold uppercase">{link.name}</span>
              </Link>
            );
          })}
           <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-[10px] font-bold uppercase">Exit</span>
          </button>
      </nav>
    </div>
  );
}

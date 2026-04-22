"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function LoginRegister() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STUDENT", subject: "", semester: "", uid: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const { data } = await axios.post(endpoint, formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      if (data.role === "TEACHER") router.push("/teacher/start");
      else router.push("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative gap-6 sm:gap-8 z-10 overflow-hidden bg-background">

      {/* Back button */}
      <Link href="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 neo-btn bg-tertiary text-on-surface text-xs sm:text-sm gap-2 z-20 py-2 px-3 sm:px-4">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        <span className="hidden sm:inline">Back</span>
      </Link>

      {/* Brand */}
      <div className="flex flex-col items-center gap-3 text-center z-10 max-w-md w-full mt-10 sm:mt-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary neo-border neo-shadow flex items-center justify-center mb-1">
          <span className="material-symbols-outlined text-white text-4xl sm:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-on-surface uppercase tracking-tighter leading-none"
          style={{ textShadow: "3px 3px 0px #6D28D9, 6px 6px 0px #38BDF8" }}>
          Attend<br />sure
        </h1>
        <div className="bg-primary text-white px-4 py-1.5 font-black tracking-widest text-xs sm:text-sm neo-shadow-sm uppercase">
          {isLogin ? "System Access" : "Registration"}
        </div>
      </div>

      {/* Auth Card */}
      <section className="w-full max-w-md bg-white neo-border neo-shadow-lg p-5 sm:p-8 relative z-10 mb-4 h-full max-h-[85vh] overflow-y-auto">
        
        <header className="mb-6 pb-4 border-b-[3px] border-primary">
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface uppercase tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="font-bold mt-2 bg-secondary-container neo-border-2 px-3 py-1 text-xs sm:text-sm inline-block text-on-surface">
            {isLogin ? "Authenticate to proceed." : "Register operative."}
          </p>
        </header>

        {error && (
          <div className="mb-5 p-3 sm:p-4 bg-error-container neo-border font-bold text-sm flex items-start gap-2" style={{ boxShadow: "3px 3px 0px #DC2626" }}>
            <span className="material-symbols-outlined text-error text-lg flex-shrink-0">error</span>
            <span className="text-on-surface">{error}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>

          {!isLogin && (
            <div className="space-y-1.5 pt-4 border-t-[3px] border-dashed border-primary/40">
              <label className="block text-xs font-black uppercase tracking-wider text-white bg-primary neo-border-2 neo-shadow-sm px-2 py-0.5 w-max" htmlFor="role">
                Role
              </label>
              <select className="neo-input cursor-pointer" id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-on-surface bg-tertiary neo-border-2 neo-shadow-sm px-2 py-0.5 w-max" htmlFor="name">
                Full Name
              </label>
              <input className="neo-input" id="name" name="name" placeholder="John Doe" type="text" value={formData.name} onChange={handleChange} required={!isLogin} />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-on-surface bg-secondary neo-border-2 neo-shadow-sm px-2 py-0.5 w-max" htmlFor="email">
              Email
            </label>
            <input className="neo-input" id="email" name="email" placeholder="name@company.com" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-on-surface bg-gray-200 neo-border-2 neo-shadow-sm px-2 py-0.5 w-max" htmlFor="subject">
                Subject
              </label>
              <input className="neo-input" id="subject" name="subject" placeholder="E.g. Computer Networks" type="text" value={formData.subject} onChange={handleChange} required={!isLogin} />
            </div>
          )}
          
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-on-surface bg-gray-200 neo-border-2 neo-shadow-sm px-2 py-0.5 w-max" htmlFor="semester">
                Semester
              </label>
              <input className="neo-input" id="semester" name="semester" placeholder="E.g. 6th" type="text" value={formData.semester} onChange={handleChange} required={!isLogin} />
            </div>
          )}
          
          {!isLogin && formData.role === 'STUDENT' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-white bg-blue-500 neo-border-2 neo-shadow-sm px-2 py-0.5 w-max" htmlFor="uid">
                RFID UID <span className="text-white/60">(Optional)</span>
              </label>
              <input className="neo-input" id="uid" name="uid" placeholder="E.g. E37587FA (leave blank if none)" type="text" value={formData.uid} onChange={handleChange} />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-black uppercase tracking-wider text-white bg-primary neo-border-2 neo-shadow-sm px-2 py-0.5 w-max" htmlFor="password">
                Password
              </label>
              {isLogin && (
                <a className="text-xs font-bold text-primary hover:underline uppercase" href="#">Reset?</a>
              )}
            </div>
            <input className="neo-input" id="password" name="password" placeholder="••••••••" type="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button
            className="w-full h-14 sm:h-16 font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-between px-5 sm:px-6 group transition-all disabled:opacity-60"
            style={{ background: "#6D28D9", color: "#fff", border: "3px solid #6D28D9", boxShadow: "5px 5px 0px #38BDF8" }}
            type="submit"
            disabled={loading}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "7px 7px 0px #38BDF8"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "5px 5px 0px #38BDF8"}
          >
            <span>{loading ? "Processing..." : isLogin ? "Login" : "Create Account"}</span>
            {!loading && <span className="material-symbols-outlined text-3xl group-hover:translate-x-2 transition-transform">arrow_forward</span>}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t-[3px] border-primary/20">
          <button
            className="w-full py-3 font-black uppercase text-xs sm:text-sm tracking-wide text-primary bg-primary-container neo-border neo-shadow-sm hover:neo-shadow transition-all"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? "→ Create a new account" : "→ Already have an account? Login"}
          </button>
        </div>
      </section>

      {/* Decorative Shapes */}
      <div className="absolute top-[15%] right-[8%] w-20 h-20 sm:w-28 sm:h-28 bg-secondary neo-border hidden md:block -z-10 rotate-12 neo-shadow"></div>
      <div className="absolute bottom-[15%] left-[8%] w-24 h-24 sm:w-36 sm:h-36 bg-primary-container neo-border hidden md:block -z-10 -rotate-6 rounded-full neo-shadow"></div>
      <div className="absolute top-[55%] right-[4%] w-10 h-10 sm:w-14 sm:h-14 bg-tertiary neo-border hidden md:block -z-10 rotate-45 neo-shadow-sm"></div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function LoginRegister() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
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
      
      if (data.role === "TEACHER") {
        router.push("/teacher/start");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative gap-6 sm:gap-8 z-10 overflow-hidden">
      {/* Go Home Button */}
      <Link href="/" className="absolute top-6 left-6 neo-btn bg-tertiary text-black flex gap-2 z-20">
        <span className="material-symbols-outlined">arrow_back</span>
        BACK
      </Link>

      <div className="flex flex-col items-center gap-4 text-center z-10 max-w-md w-full mt-16 md:mt-0">
        {/* Logo Block */}
        <div className="w-20 h-20 bg-tertiary neo-border neo-shadow-sm flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-black text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            location_on
          </span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-black uppercase tracking-tighter leading-none" style={{textShadow: "4px 4px 0px #6D28D9"}}>
          Attend<br/>sure
        </h1>
        <div className="bg-black text-white px-4 py-1.5 font-bold tracking-widest text-sm neo-shadow-sm mt-2 uppercase">
          Auth Portal
        </div>
      </div>

      {/* Auth Card */}
      <section className="w-full max-w-md bg-white neo-border neo-shadow-lg p-6 md:p-8 relative z-10 mb-8">
        <header className="mb-8 border-b-4 border-black pb-4">
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">
            {isLogin ? "System Access" : "Initialization"}
          </h2>
          <p className="text-black font-bold mt-3 bg-secondary inline-block px-3 py-1 border-2 border-black text-sm">
            {isLogin ? "Authenticate to proceed." : "Register operative."}
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-primary text-white border-4 border-black font-bold uppercase transition-all shadow-[4px_4px_0px_#000]">
            <span className="material-symbols-outlined align-middle mr-2">error</span>
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-wider text-black bg-tertiary border-2 border-black px-2 py-1 w-max mb-1" htmlFor="name">
                Designation (Name)
              </label>
              <input
                className="neo-input"
                id="name"
                name="name"
                placeholder="JOHN DOE"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-black uppercase tracking-wider text-black bg-secondary border-2 border-black px-2 py-1 w-max mb-1" htmlFor="email">
              Credentials (Email)
            </label>
            <input
              className="neo-input"
              id="email"
              name="email"
              placeholder="NAME@COMPANY.COM"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center bg-black text-white px-3 py-1.5 mb-1 border-2 border-black">
              <label className="text-sm font-black uppercase tracking-wider block" htmlFor="password">
                Passkey
              </label>
              {isLogin && (
                <a className="text-xs font-bold text-tertiary hover:underline uppercase" href="#">
                  Reset?
                </a>
              )}
            </div>
            <input
              className="neo-input"
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="space-y-2 mt-6 pt-6 border-t-4 border-dashed border-black">
               <label className="block text-sm font-black uppercase tracking-wider text-white bg-primary inline-block px-3 py-1.5 border-2 border-black mb-2" htmlFor="role">
                Operative Class
              </label>
              <select
                className="neo-input cursor-pointer bg-surface font-bold text-black"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="STUDENT">Student (Standard)</option>
                <option value="TEACHER">Teacher (Admin)</option>
              </select>
            </div>
          )}

          <button
            className="w-full h-16 neo-btn bg-black text-white text-xl flex items-center justify-between group disabled:opacity-50 mt-8 hover:bg-zinc-800"
            type="submit"
            disabled={loading}
          >
             <span className="group-hover:translate-x-2 transition-transform">{loading ? "PROCESSING..." : (isLogin ? "INITIATE LOGIN" : "ESTABLISH ACCT.")}</span>
            {!loading && <span className="material-symbols-outlined text-4xl">arrow_forward</span>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-4 border-black">
          <button
            className="neo-btn bg-background text-black w-full text-sm"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? "SWITCH TO REGISTRATION" : "SWITCH TO LOGIN"}
          </button>
        </div>
      </section>
      
      {/* Decorative Blocks */}
      <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-secondary neo-border hidden lg:block -z-10 rotate-12"></div>
      <div className="absolute bottom-[20%] left-[10%] w-40 h-40 bg-primary neo-border hidden lg:block -z-10 -rotate-6 rounded-full"></div>
      <div className="absolute top-[60%] right-[5%] w-16 h-16 bg-tertiary neo-border hidden lg:block -z-10 rotate-45"></div>
      
    </main>
  );
}

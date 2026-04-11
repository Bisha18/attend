"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

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
    <main className="w-full max-w-[480px] flex flex-col gap-8 mx-auto mt-16 z-10 relative">
      {/* Logo Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            location_on
          </span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">FluidPrecision GPS</h1>
        <p className="text-on-surface-variant font-medium">Enterprise Attendance Intelligence</p>
      </div>

      {/* Login Card */}
      <section className="bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-[0_20px_40px_rgba(25,28,30,0.06)] relative overflow-hidden">
        {/* Decorative Aura */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <header className="mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-on-surface-variant text-sm">
            {isLogin ? "Please enter your credentials to access your dashboard." : "Set up your credentials to join us."}
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="name">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <input
                  className="w-full bg-surface-container-high border-none h-14 pl-12 pr-4 rounded-lg text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all placeholder:text-outline/60"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="email">
              Work Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <input
                className="w-full bg-surface-container-high border-none h-14 pl-12 pr-4 rounded-lg text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all placeholder:text-outline/60"
                id="email"
                name="email"
                placeholder="name@company.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="password">
                Password
              </label>
              {isLogin && (
                <a className="text-xs font-semibold text-primary hover:text-primary-container transition-colors" href="#">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>
              <input
                className="w-full bg-surface-container-high border-none h-14 pl-12 pr-4 rounded-lg text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all placeholder:text-outline/60"
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Role Selection (Register Only) */}
          {!isLogin && (
            <div className="space-y-2">
               <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label" htmlFor="role">
                I am a
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">badge</span>
                </div>
                <select
                  className="w-full bg-surface-container-high border-none h-14 pl-12 pr-4 rounded-lg text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
            </div>
          )}

          {/* Login CTA */}
          <button
            className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Processing..." : (isLogin ? "Login to Dashboard" : "Create Account")}</span>
            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-outline-variant/15 flex flex-col gap-4">
          <p className="text-center text-sm text-on-surface-variant">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}
            <button
              className="text-primary font-bold hover:underline ml-1"
              onClick={() => setIsLogin(!isLogin)}
              type="button"
            >
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </section>

      {/* Footer Visual Hint */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-label">AES-256 Encrypted</span>
        </div>
        <div className="flex gap-4">
          <a className="text-[10px] font-bold uppercase tracking-widest font-label text-on-surface-variant hover:text-primary" href="#">System Status</a>
          <a className="text-[10px] font-bold uppercase tracking-widest font-label text-on-surface-variant hover:text-primary" href="#">Support</a>
        </div>
      </div>
      
      {/* Visual Background Element */}
      <div className="fixed bottom-0 right-0 -z-10 p-12 opacity-5 hidden lg:block">
        <div className="w-[600px] h-[600px] rounded-full border-[60px] border-primary"></div>
      </div>
    </main>
  );
}

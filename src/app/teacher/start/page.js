"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function TeacherStart() {
  const [formData, setFormData] = useState({ latitude: "", longitude: "", radius: 50 });
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    const checkActive = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/session/active", { headers: { Authorization: `Bearer ${token}` } });
        setSessionInfo(data);
      } catch { setSessionInfo(null); }
    };
    checkActive();
  }, []);

  const handleGetCurrentLocation = () => {
    setLoadingLoc(true); setError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setLoadingLoc(false); },
        (err) => { setError(err.message || "Failed to get location"); setLoadingLoc(false); }
      );
    } else { setError("Geolocation not supported."); setLoadingLoc(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoadingSubmit(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("/api/session/start", formData, { headers: { Authorization: `Bearer ${token}` } });
      setSessionInfo(data);
      alert("Session Started Successfully!");
    } catch (err) { setError(err.response?.data?.message || "Server Error"); }
    finally { setLoadingSubmit(false); }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6">

      {/* Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-8 bg-primary"></div>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">Session Control</h2>
          </div>
          <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">Define geofence parameters to initiate class verification</p>
        </div>
        <div className={`flex items-center gap-2 neo-border px-3 py-2 text-xs font-black uppercase tracking-widest w-max ${sessionInfo ? "bg-green-50 text-green-700" : "bg-surface-container text-on-surface/50"}`}
          style={{ boxShadow: sessionInfo ? "2px 2px 0px #6D28D9" : "2px 2px 0px #38BDF8" }}>
          <span className={`w-2 h-2 rounded-full ${sessionInfo ? "bg-green-500 animate-pulse" : "bg-on-surface/20"}`}></span>
          {sessionInfo ? "Session Active" : "Session Inactive"}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container neo-border text-sm font-bold flex items-center gap-2" style={{ boxShadow: "3px 3px 0px #DC2626" }}>
          <span className="material-symbols-outlined text-error text-lg">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Form */}
        <div className="xl:col-span-5">
          <div className="bg-white neo-border p-6 sm:p-8" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary neo-border neo-shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Location Config</h3>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Latitude", key: "latitude", placeholder: "e.g. 40.7128" },
                  { label: "Longitude", key: "longitude", placeholder: "e.g. -74.0060" },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary block">{f.label}</label>
                    <input
                      className="neo-input"
                      placeholder={f.placeholder}
                      type="number" step="any" required
                      value={formData[f.key]}
                      onChange={(e) => setFormData({ ...formData, [f.key]: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary block">Radius (meters)</label>
                <input
                  className="neo-input"
                  placeholder="50"
                  type="number" required min="10"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
                />
                <p className="text-[9px] text-on-surface/40 font-bold uppercase tracking-widest">Students must be within this distance</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button" onClick={handleGetCurrentLocation} disabled={loadingLoc}
                  className="flex items-center justify-center gap-2 w-full py-3 font-black text-sm uppercase tracking-widest text-primary neo-border bg-primary-container hover:bg-primary hover:text-white transition-all neo-shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">my_location</span>
                  {loadingLoc ? "Locating..." : "Use Current Location"}
                </button>
                <button
                  type="submit" disabled={loadingSubmit}
                  className="flex items-center justify-center gap-2 w-full py-4 font-black text-sm uppercase tracking-widest text-white neo-border transition-all disabled:opacity-50 hover:-translate-y-0.5"
                  style={{ background: "#6D28D9", boxShadow: "5px 5px 0px #38BDF8" }}
                >
                  <span className="material-symbols-outlined text-xl">rocket_launch</span>
                  {loadingSubmit ? "Starting..." : "Start Attendance Session"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* GPS Preview */}
        <div className="xl:col-span-7">
          <div className="bg-white neo-border h-full min-h-[400px] flex items-center justify-center relative overflow-hidden" style={{ boxShadow: "6px 6px 0px #6D28D9" }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#6D28D9 1px, transparent 0)", backgroundSize: "20px 20px" }}></div>
            {formData.latitude && formData.longitude ? (
              <div className="text-center p-8 relative z-10">
                <div className="w-20 h-20 bg-primary/10 neo-border neo-shadow mx-auto flex items-center justify-center animate-pulse mb-6">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
                </div>
                <div className="neo-border bg-secondary-container px-4 py-2 mb-3 neo-shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Location Locked</p>
                  <p className="font-mono text-sm font-black text-on-surface">{Number(formData.latitude).toFixed(6)}°, {Number(formData.longitude).toFixed(6)}°</p>
                </div>
                <div className="neo-border bg-primary text-white px-4 py-2 font-black text-xs uppercase tracking-widest neo-shadow-sm">
                  Radius Area: ~{Math.round(Math.PI * Math.pow(formData.radius, 2))} m²
                </div>
              </div>
            ) : (
              <div className="text-center p-8 relative z-10">
                <span className="material-symbols-outlined text-7xl text-primary/20 mb-4 block">satellite_alt</span>
                <p className="font-black text-base uppercase tracking-wide text-on-surface/40">Awaiting Coordinates</p>
                <p className="text-xs font-bold text-on-surface/30 mt-1 uppercase tracking-widest">Allow geolocation or enter manually</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

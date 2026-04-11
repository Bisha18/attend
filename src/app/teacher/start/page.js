"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TeacherStart() {
  const [formData, setFormData] = useState({ latitude: "", longitude: "", radius: 50 });
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    // Check if session active
    const checkActive = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/session/active", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessionInfo(data);
      } catch (err) {
        // No active session
        setSessionInfo(null);
      }
    };
    checkActive();
  }, []);

  const handleGetCurrentLocation = () => {
    setLoadingLoc(true);
    setError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoadingLoc(false);
        },
        (err) => {
          setError(err.message || "Failed to get location");
          setLoadingLoc(false);
        }
      );
    } else {
      setError("Geolocation not supported by this browser.");
      setLoadingLoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("/api/session/start", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionInfo(data);
      alert("Session Started Successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Server Error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-[3.5rem] font-bold text-on-surface tracking-tight leading-[1.1] mb-2 font-headline">Session Control</h2>
          <p className="text-on-surface-variant text-lg">Define geofence parameters to initiate class verification.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest rounded-full w-fit shadow-sm">
          <span className={`w-3 h-3 rounded-full ${sessionInfo ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
            {sessionInfo ? 'Status: Active' : 'Status: Inactive'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 flex flex-col gap-8">
          <div className="bg-surface-container-lowest rounded-xl p-8 transition-all hover:shadow-xl hover:shadow-indigo-500/5 shadow-md">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <h3 className="text-2xl font-bold font-headline">Location Config</h3>
            </div>
            
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block ml-1">Latitude</label>
                  <input
                    className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg p-4 font-body transition-all"
                    placeholder="e.g. 40.7128"
                    type="number" step="any" required
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block ml-1">Longitude</label>
                  <input
                    className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg p-4 font-body transition-all"
                    placeholder="e.g. -74.0060"
                    type="number" step="any" required
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block ml-1">Radius (Meters)</label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg p-4 pr-16 font-body transition-all"
                    placeholder="50"
                    type="number" required min="10"
                    value={formData.radius}
                    onChange={(e) => setFormData({...formData, radius: Number(e.target.value)})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">min</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 px-1 italic">Students must be within this distance.</p>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={loadingLoc}
                  className="group flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all border border-primary/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">my_location</span>
                  {loadingLoc ? "Locating..." : "Use Current Location"}
                </button>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="flex items-center justify-center gap-3 w-full py-5 rounded-xl font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  {loadingSubmit ? "Starting..." : "Start Attendance Session"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-7">
          <div className="relative h-full min-h-[500px] bg-indigo-50 rounded-xl overflow-hidden shadow-2xl shadow-indigo-900/5 group flex items-center justify-center border-4 border-white">
            {formData.latitude && formData.longitude ? (
               <div className="text-center p-8">
                 <div className="w-24 h-24 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center animate-pulse mb-6">
                    <span className="material-symbols-outlined text-4xl">radar</span>
                 </div>
                 <h4 className="text-2xl font-bold text-indigo-900 mb-2">Location Locked</h4>
                 <p className="font-mono text-sm font-semibold text-slate-600 mb-4">{Number(formData.latitude).toFixed(6)}°, {Number(formData.longitude).toFixed(6)}°</p>
                 <div className="inline-block bg-white text-primary px-4 py-2 rounded-full font-bold shadow-sm">
                   Radius Area: ~{Math.round(Math.PI * Math.pow(formData.radius, 2))} m²
                 </div>
               </div>
            ) : (
               <div className="text-center p-8 text-slate-400">
                  <span className="material-symbols-outlined text-6xl mb-4 opacity-50">satellite_alt</span>
                  <p className="font-bold text-lg">Awaiting Coordinates</p>
                  <p className="text-sm">Please allow geolocation or enter manually.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

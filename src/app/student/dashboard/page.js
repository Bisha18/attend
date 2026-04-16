"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function StudentDashboard() {
  const [data, setData] = useState({ attendances: [], stats: { total: 0, present: 0, absent: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [markMsg, setMarkMsg] = useState({ text: "", type: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/attendance/me", { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleMarkAttendance = () => {
    setMarking(true);
    setMarkMsg({ text: "Acquiring GPS lock...", type: "info" });
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const token = localStorage.getItem("token");
            await axios.post("/api/attendance/mark",
              { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setMarkMsg({ text: "Attendance marked successfully!", type: "success" });
            fetchData();
          } catch (err) {
            setMarkMsg({ text: err.response?.data?.message || "Location validation failed", type: "error" });
          } finally { setMarking(false); }
        },
        (err) => { setMarkMsg({ text: err.message || "GPS unavailable", type: "error" }); setMarking(false); }
      );
    } else {
      setMarkMsg({ text: "Geolocation not supported.", type: "error" });
      setMarking(false);
    }
  };

  const pieData = [{ name: "Present", value: data.stats.present }, { name: "Absent", value: data.stats.absent }];
  const COLORS = ["#6D28D9", "#38BDF8"];

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6">

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 bg-primary"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">My Attendance</h2>
        </div>
        <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">Verify your presence using GPS location</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Col */}
        <div className="xl:col-span-1 flex flex-col gap-6">

          {/* Mark Attendance */}
          <div className="bg-white neo-border flex flex-col items-center text-center p-6 sm:p-8" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>
            <div className="w-14 h-14 bg-primary neo-border neo-shadow-sm flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-1">Check In</h3>
            <p className="text-xs font-bold text-on-surface/50 uppercase tracking-widest mb-5">Must be within classroom proximity</p>

            {markMsg.text && (
              <div className={`mb-4 p-3 neo-border w-full text-sm font-bold flex items-center gap-2 ${
                markMsg.type === "error" ? "bg-error-container text-on-surface" :
                markMsg.type === "success" ? "bg-green-50 text-green-800" : "bg-secondary-container text-on-surface"
              }`} style={{ boxShadow: markMsg.type === "error" ? "2px 2px 0px #DC2626" : "2px 2px 0px #6D28D9" }}>
                <span className="material-symbols-outlined text-base flex-shrink-0">
                  {markMsg.type === "error" ? "error" : markMsg.type === "success" ? "check_circle" : "info"}
                </span>
                {markMsg.text}
              </div>
            )}

            <button
              onClick={handleMarkAttendance}
              disabled={marking}
              className="w-full py-4 font-black text-sm uppercase tracking-widest text-white flex justify-center items-center gap-2 neo-border transition-all disabled:opacity-50 hover:-translate-y-0.5"
              style={{ background: "#6D28D9", boxShadow: "4px 4px 0px #38BDF8" }}
            >
              <span className="material-symbols-outlined text-xl">{marking ? "sync" : "my_location"}</span>
              {marking ? "Processing..." : "Mark Attendance"}
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white neo-border p-6 sm:p-8" style={{ boxShadow: "6px 6px 0px #6D28D9" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-secondary"></div>
              <h3 className="font-black text-base uppercase tracking-wide">Attendance Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Total", val: data.stats.total, bg: "bg-surface-container", color: "text-primary" },
                { label: "Present", val: data.stats.present, bg: "bg-green-50", color: "text-green-700" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} neo-border p-4 text-center neo-shadow-sm`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface/50 mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 neo-border bg-primary/5 px-4 py-2 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/50">Score</span>
              <span className="text-xl font-black text-primary">{data.stats.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="xl:col-span-2">
          <div className="bg-white neo-border p-6 sm:p-8 h-full" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-primary"></div>
              <h3 className="font-black text-base uppercase tracking-wide">Recent History</h3>
            </div>
            {loading ? (
              <div className="text-center py-12 font-black text-on-surface/40 uppercase tracking-widest text-sm animate-pulse">Loading records...</div>
            ) : data.attendances.length === 0 ? (
              <div className="text-center py-16 neo-border bg-surface-container">
                <span className="material-symbols-outlined text-5xl text-primary/30 mb-3 block">event_busy</span>
                <p className="font-black text-base uppercase tracking-wide text-on-surface">No Records Yet</p>
                <p className="text-xs font-bold text-on-surface/40 mt-1 uppercase">You haven&apos;t marked attendance yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.attendances.map((att) => (
                  <div key={att._id} className="flex items-center justify-between p-4 neo-border bg-surface-container hover:bg-primary-container transition-colors" style={{ boxShadow: "2px 2px 0px #6D28D9" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 neo-border-2 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-green-700 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <div>
                        <p className="font-black text-sm text-on-surface">{att.date}</p>
                        <p className="text-[10px] font-mono font-bold text-on-surface/40">{new Date(att.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-black text-[9px] uppercase tracking-widest neo-border-2">
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

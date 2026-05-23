"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/attendance/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
    } catch (err) {
      console.error("Error fetching student stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6 relative z-0">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 bg-tertiary border-[2px] border-primary"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">Student Stats</h2>
        </div>
        <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">Monthly and All-Time Attendance Reports</p>
      </div>

      {/* Table */}
      <div className="bg-white neo-border" style={{ boxShadow: "6px 6px 0px #6D28D9" }}>
        {loading ? (
          <div className="text-center py-16 font-black text-on-surface/30 uppercase tracking-widest text-sm animate-pulse">Fetching records...</div>
        ) : stats.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-primary/20 mb-3 block">bar_chart</span>
            <p className="font-black text-base uppercase tracking-wide text-on-surface/40">No Records Found</p>
            <p className="text-xs font-bold text-on-surface/30 mt-1 uppercase tracking-widest">No student attendance stats available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-[3px] border-primary bg-primary/5">
                  <th className="py-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-primary">Student Details</th>
                  <th className="py-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-primary">Academic Info</th>
                  <th className="py-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-primary text-center">All-Time Presence</th>
                  <th className="py-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-primary text-center">Last 30 Days</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row, i) => (
                  <tr key={row.student._id} className={`border-b-[2px] border-primary/10 hover:bg-primary-container transition-colors ${i % 2 === 0 ? "" : "bg-surface-container/40"}`}>
                    <td className="py-4 px-4">
                      <div className="font-black text-sm text-on-surface mb-0.5">{row.student.name}</div>
                      <div className="text-[10px] font-bold text-on-surface/40 mt-1">{row.student.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      {row.student.branch ? (
                        <div className="text-xs font-black uppercase tracking-wide text-on-surface/70 mb-0.5">{row.student.branch}</div>
                      ) : (
                        <div className="text-xs font-bold text-on-surface/30 uppercase">Unregistered</div>
                      )}
                      {row.student.semester && (
                        <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface/40">Sem {row.student.semester}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-green-700">{row.stats.present}</span>
                          <span className="text-xs font-black text-primary/40">/ {row.stats.totalSessions}</span>
                        </div>
                        <div className="mt-1 w-16 h-1.5 neo-border-2 bg-surface-container overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${row.stats.percentage}%` }}></div>
                        </div>
                        <span className="text-[8px] font-black uppercase text-on-surface/50 mt-1">{row.stats.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-blue-700">{row.monthStats.present}</span>
                          <span className="text-xs font-black text-primary/40">/ {row.monthStats.total}</span>
                        </div>
                        <div className="mt-1 w-16 h-1.5 neo-border-2 bg-surface-container overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${row.monthStats.percentage}%` }}></div>
                        </div>
                        <span className="text-[8px] font-black uppercase text-on-surface/50 mt-1">{row.monthStats.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

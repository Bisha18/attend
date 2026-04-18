"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ClassAttendance() {
  const [attendances, setAttendances] = useState([]);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchHistory(); }, [dateStr]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`/api/attendance/class?date=${dateStr}`, { headers: { Authorization: `Bearer ${token}` } });
      setAttendances(data);
    } catch { console.error("error fetching class attendance"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6">

      {/* Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 bg-tertiary border-[2px] border-primary"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">Class Attendance</h2>
        </div>
        <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">RFID Physical Check-ins Only</p>
      </div>

      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary flex-shrink-0">Filter by Date:</label>
        <div className="relative">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="neo-input py-2 px-3 w-auto text-sm"
            style={{ minWidth: "180px" }}
          />
        </div>
        {!loading && (
          <div className="neo-border bg-primary/10 px-3 py-2 neo-shadow-sm flex gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
              {attendances.length} Record{attendances.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white neo-border" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>
        {loading ? (
          <div className="text-center py-16 font-black text-on-surface/30 uppercase tracking-widest text-sm animate-pulse">Fetching records...</div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-primary/20 mb-3 block">contactless</span>
            <p className="font-black text-base uppercase tracking-wide text-on-surface/40">No Records Found</p>
            <p className="text-xs font-bold text-on-surface/30 mt-1 uppercase tracking-widest">No RFID scans mapped for {dateStr}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-[3px] border-primary bg-primary/5">
                  {["Scan Timestamp", "Student Details", "Academic Info", "Entry Status"].map(h => (
                    <th key={h} className="py-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendances.map((att, i) => (
                  <tr key={att._id} className={`border-b-[2px] border-primary/10 hover:bg-primary-container transition-colors ${i % 2 === 0 ? "" : "bg-surface-container/40"}`}>
                    <td className="py-4 px-4 font-mono text-xs font-black text-on-surface/80">{att.date} <br/> <span className="text-primary">{att.time}</span></td>
                    <td className="py-4 px-4">
                      <div className="font-black text-sm text-on-surface mb-0.5">
                        {att.studentId ? att.studentId.name : att.rawName}
                      </div>
                      <div className="font-mono text-[9px] font-bold text-on-surface/50 tracking-widest break-all">UID: {att.rawUid}</div>
                      {att.studentId && <div className="text-[10px] font-bold text-on-surface/40 mt-1">{att.studentId.email}</div>}
                    </td>
                    <td className="py-4 px-4">
                      {att.studentId?.subject ? (
                         <div className="text-xs font-black uppercase tracking-wide text-on-surface/70 mb-0.5">{att.studentId.subject}</div>
                      ) : <div className="text-xs font-bold text-on-surface/30 uppercase">Unregistered</div>}
                      {att.studentId?.semester && (
                         <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface/40">Sem {att.studentId.semester}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 neo-border-2 text-blue-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{att.status || 'Physical Entry'}</span>
                      </span>
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

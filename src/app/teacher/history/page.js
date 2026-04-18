"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function TeacherHistory() {
  const [attendances, setAttendances] = useState([]);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [selectedSelfie, setSelectedSelfie] = useState(null); // URL for modal

  useEffect(() => { fetchHistory(); }, [dateStr]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`/api/attendance?date=${dateStr}`, { headers: { Authorization: `Bearer ${token}` } });
      setAttendances(data);
    } catch (err) { console.error("error fetching history"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6 relative z-0">
      
      {/* Selfie Modal */}
      {selectedSelfie && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSelfie(null)}>
          <div className="bg-white p-2 neo-border max-w-lg w-full relative" onClick={e => e.stopPropagation()} style={{ boxShadow: "8px 8px 0px #38BDF8" }}>
            <button className="absolute -top-4 -right-4 w-10 h-10 bg-error text-white neo-border-2 flex justify-center items-center font-black" onClick={() => setSelectedSelfie(null)}>X</button>
            <div className="bg-tertiary px-3 py-2 text-on-surface font-black uppercase tracking-widest text-sm border-b-[3px] border-primary mb-2">Selfie Verification</div>
            <img src={selectedSelfie} alt="Enlarged Selfie" className="w-full h-auto max-h-[70vh] object-contain bg-surface-container" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 bg-tertiary border-[2px] border-primary"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">Attendance Log</h2>
        </div>
        <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">Detailed record of verified student presences</p>
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
          <div className="neo-border bg-primary/10 px-3 py-2 neo-shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
              {attendances.length} Record{attendances.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white neo-border" style={{ boxShadow: "6px 6px 0px #6D28D9" }}>
        {loading ? (
          <div className="text-center py-16 font-black text-on-surface/30 uppercase tracking-widest text-sm animate-pulse">Fetching records...</div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-primary/20 mb-3 block">history</span>
            <p className="font-black text-base uppercase tracking-wide text-on-surface/40">No Records Found</p>
            <p className="text-xs font-bold text-on-surface/30 mt-1 uppercase tracking-widest">No attendance records for {dateStr}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-[3px] border-primary bg-primary/5">
                  {["Student Name", "Time", "Map Verification", "RFID Scanned", "Selfie Proof", "Final Status"].map(h => (
                    <th key={h} className="py-3 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-primary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendances.map((att, i) => (
                  <tr key={att._id} className={`border-b-[2px] border-primary/10 hover:bg-primary-container transition-colors ${i % 2 === 0 ? "" : "bg-surface-container/40"}`}>
                    <td className="py-4 px-4 font-black text-sm text-on-surface">
                      {att.studentId?.name || "Unknown"}
                      <div className="text-[10px] font-bold text-on-surface/50 mt-0.5">{att.studentId?.email}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-on-surface/60">{new Date(att.timestamp).toLocaleTimeString()}</td>
                    <td className="py-4 px-4">
                      {att.mapStatus === 'Verified' ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 neo-border-2 text-green-700">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                           <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 neo-border-2 text-red-700">
                           <span className="text-[9px] font-black uppercase tracking-widest">Not Verified</span>
                         </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {att.rfidStatus === 'Scanned' ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 neo-border-2 text-blue-700">
                           <span className="text-[9px] font-black uppercase tracking-widest">Scanned</span>
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 neo-border-2 text-gray-500">
                           <span className="text-[9px] font-black uppercase tracking-widest">Not Scanned</span>
                         </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {att.selfieUrl ? (
                         <button onClick={() => setSelectedSelfie(att.selfieUrl)} className="w-12 h-12 bg-surface-container neo-border p-1 group cursor-pointer hover:bg-primary transition-colors overflow-hidden">
                           {!att.selfieUrl.startsWith('data:') ? (
                             <img src={att.selfieUrl} alt="selfie" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                           ) : (
                             <img src={att.selfieUrl} alt="selfie base64" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                           )}
                         </button>
                      ) : (
                         <div className="w-12 h-12 bg-gray-100 flex items-center justify-center neo-border text-gray-400">
                           <span className="material-symbols-outlined text-xl">no_photography</span>
                         </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {att.finalStatus === 'Present' && (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 neo-border-2 text-green-800">
                           <span className="text-[10px] font-black uppercase tracking-widest">Present</span>
                         </span>
                      )}
                      {att.finalStatus === 'Absent' && (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 neo-border-2 text-red-800">
                           <span className="text-[10px] font-black uppercase tracking-widest">Absent</span>
                         </span>
                      )}
                      {att.finalStatus === 'Invalid' && (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 neo-border-2 text-yellow-800">
                           <span className="text-[10px] font-black uppercase tracking-widest">Invalid</span>
                         </span>
                      )}
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

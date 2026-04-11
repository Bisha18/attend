"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function TeacherLive() {
  const [attendances, setAttendances] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data: session } = await axios.get("/api/session/active", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessionInfo(session);

        const date = new Date().toISOString().split("T")[0];
        const { data: att } = await axios.get(`/api/attendance?date=${date}&sessionId=${session._id}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        setAttendances(att);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLive();
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-[3.5rem] font-bold text-on-surface tracking-tight leading-[1.1] mb-2 font-headline">Live Attendance</h2>
          <p className="text-on-surface-variant text-lg">Monitor real-time check-ins for the active session.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest rounded-full w-fit shadow-sm">
          <span className={`w-3 h-3 rounded-full ${sessionInfo ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
            {sessionInfo ? 'Status: Active' : 'Status: Inactive'}
          </span>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        {loading ? (
             <div className="text-center py-12 text-slate-500 font-bold">Loading records...</div>
        ) : attendances.length === 0 ? (
             <div className="text-center py-16 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-4 opacity-50">group_off</span>
                <p className="font-bold text-lg text-slate-600">No Check-ins Yet</p>
                <p className="text-sm text-slate-500 mt-2">Students will appear here once they mark attendance.</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">
                     <th className="py-4 px-4">Student Name</th>
                     <th className="py-4 px-4">Email</th>
                     <th className="py-4 px-4">Time</th>
                     <th className="py-4 px-4">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {attendances.map((att) => (
                     <tr key={att._id} className="border-b border-outline-variant/15 hover:bg-surface-container-low/50 transition-colors">
                       <td className="py-4 px-4 font-bold text-on-surface">{att.studentId?.name || 'Unknown'}</td>
                       <td className="py-4 px-4 text-sm text-on-surface-variant">{att.studentId?.email}</td>
                       <td className="py-4 px-4 text-sm text-on-surface-variant">{new Date(att.timestamp).toLocaleTimeString()}</td>
                       <td className="py-4 px-4">
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-bold text-slate-700">Verified</span>
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

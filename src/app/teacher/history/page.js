"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function TeacherHistory() {
  const [attendances, setAttendances] = useState([]);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [dateStr]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`/api/attendance?date=${dateStr}`, {
           headers: { Authorization: `Bearer ${token}` }
      });
      setAttendances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-[3.5rem] font-bold text-on-surface tracking-tight leading-[1.1] mb-2 font-headline">Attendance Log</h2>
          <p className="text-on-surface-variant text-lg">Detailed record of verified student presences.</p>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row items-center gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest font-label hidden md:block">Select Date</label>
        <div className="relative w-full md:w-auto">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full md:w-auto bg-surface-container-low border-none h-12 px-4 rounded-lg text-on-surface focus:ring-0 focus:border-b-2 focus:border-primary transition-all font-body font-bold"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        {loading ? (
             <div className="text-center py-12 text-slate-500 font-bold">Fetching records...</div>
        ) : attendances.length === 0 ? (
             <div className="text-center py-16 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-4 opacity-50">history</span>
                <p className="font-bold text-lg text-slate-600">No Records Found</p>
                <p className="text-sm text-slate-500 mt-2">There are no attendance records for {dateStr}.</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label">
                     <th className="py-4 px-4">Student Name</th>
                     <th className="py-4 px-4">Email</th>
                     <th className="py-4 px-4">Time Recorded</th>
                     <th className="py-4 px-4">Verification</th>
                   </tr>
                 </thead>
                 <tbody>
                   {attendances.map((att) => (
                     <tr key={att._id} className="border-b border-outline-variant/15 hover:bg-surface-container-low/50 transition-colors">
                       <td className="py-4 px-4 font-bold text-on-surface">{att.studentId?.name || 'Unknown'}</td>
                       <td className="py-4 px-4 text-sm text-on-surface-variant">{att.studentId?.email}</td>
                       <td className="py-4 px-4 font-mono text-sm text-on-surface-variant">{new Date(att.timestamp).toLocaleTimeString()}</td>
                       <td className="py-4 px-4">
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-bold text-slate-700">Present</span>
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

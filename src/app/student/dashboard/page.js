"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function StudentDashboard() {
  const [data, setData] = useState({ attendances: [], stats: { total: 0, present: 0, absent: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [markMsg, setMarkMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/attendance/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = () => {
    setMarking(true);
    setMarkMsg({ text: "Locating...", type: "info" });
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const token = localStorage.getItem("token");
            await axios.post("/api/attendance/mark", {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setMarkMsg({ text: "Attendance marked successfully!", type: "success" });
            fetchData(); // refresh stats
          } catch (err) {
            setMarkMsg({ text: err.response?.data?.message || "Error validating location", type: "error" });
          } finally {
            setMarking(false);
          }
        },
        (err) => {
          setMarkMsg({ text: err.message || "Failed to get GPS location automatically", type: "error" });
          setMarking(false);
        }
      );
    } else {
      setMarkMsg({ text: "Geolocation not supported by this browser.", type: "error" });
      setMarking(false);
    }
  };

  const pieData = [
    { name: "Present", value: data.stats.present },
    { name: "Absent", value: data.stats.absent }
  ];
  const COLORS = ["#10b981", "#f43f5e"]; // emerald and rose

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-[3.5rem] font-bold text-on-surface tracking-tight leading-[1.1] mb-2 font-headline">My Attendance</h2>
          <p className="text-on-surface-variant text-lg">Verify your presence using GPS location.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Col: Actions and Stats */}
        <div className="xl:col-span-1 flex flex-col gap-8">
          
          {/* Mark Attendance Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
               <span className="material-symbols-outlined text-3xl">fingerprint</span>
            </div>
            <h3 className="text-xl font-bold font-headline mb-2">Check In</h3>
            <p className="text-sm text-on-surface-variant mb-6">Make sure you are within the classroom proximity.</p>
            
            {markMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-bold w-full ${markMsg.type === 'error' ? 'bg-error-container text-on-error-container' : markMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {markMsg.text}
              </div>
            )}

            <button
              onClick={handleMarkAttendance}
              disabled={marking}
              className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined">{marking ? "sync" : "my_location"}</span>
              {marking ? "Processing..." : "Mark Attendance"}
            </button>
          </div>

          {/* Stats Analytics */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
             <h3 className="font-headline font-bold text-lg mb-6">Attendance Overview</h3>
             <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-surface-container-low p-4 rounded-xl text-center">
                 <p className="text-sm font-bold text-slate-500 uppercase">Total</p>
                 <p className="text-2xl font-black text-indigo-900">{data.stats.total}</p>
               </div>
               <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
                 <p className="text-sm font-bold text-green-700 uppercase">Present</p>
                 <p className="text-2xl font-black text-green-700">{data.stats.present}</p>
               </div>
             </div>

             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend verticalAlign="bottom" height={36}/>
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <p className="text-center font-bold text-lg text-slate-700 mt-4">
                Score: {data.stats.percentage}%
             </p>
          </div>

        </div>

        {/* Right Col: History */}
        <div className="xl:col-span-2">
           <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm h-full max-h-[800px] overflow-y-auto">
             <h3 className="font-headline font-bold text-xl mb-6">Recent History</h3>
             {loading ? (
                 <div className="text-center py-12 text-slate-500 font-bold">Loading records...</div>
             ) : data.attendances.length === 0 ? (
                 <div className="text-center py-16 bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-4 opacity-50">event_busy</span>
                    <p className="font-bold text-lg text-slate-600">No Records Found</p>
                    <p className="text-sm text-slate-500 mt-2">You haven't marked attendance yet.</p>
                 </div>
             ) : (
                <div className="space-y-4">
                   {data.attendances.map((att) => (
                     <div key={att._id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-white/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">check_circle</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{att.date}</p>
                            <p className="text-xs text-on-surface-variant font-mono">{new Date(att.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-50 text-green-700 font-bold text-xs uppercase tracking-widest rounded-full border border-green-200">
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

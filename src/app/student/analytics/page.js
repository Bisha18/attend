"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StudentAnalytics() {
  const [data, setData] = useState({ attendances: [], stats: { total: 0, present: 0, absent: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);

  // Processed data states
  const [trendData, setTrendData] = useState([]);
  const [dayOfWeekData, setDayOfWeekData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/attendance/me", { headers: { Authorization: `Bearer ${token}` } });
      const attendanceRecords = res.data.attendances || [];
      setData(res.data);
      processChartData(attendanceRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (records) => {
    // 1. Process Trend Data & Heatmap Data (Group by Date)
    const dateMap = {};
    records.forEach((record) => {
      const dateStr = record.date; // Usually format like "YYYY-MM-DD"
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, present: 0, absent: 0, total: 0 };
      }
      dateMap[dateStr].total += 1;
      if (record.status === "PRESENT") {
        dateMap[dateStr].present += 1;
      } else {
        dateMap[dateStr].absent += 1;
      }
    });

    const sortedTrends = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    setTrendData(sortedTrends.slice(-14)); // Last 14 days for line chart

    // Generate Heatmap data (last 16 weeks ~ 112 days)
    const today = new Date();
    const heatmapGrid = [];
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split("T")[0];
      const rec = dateMap[isoDate];
      
      let level = 0; // 0 = none, 1 = low, 2 = medium, 3 = high, 4 = very high
      if (rec) {
        if (rec.present === 0 && rec.absent > 0) level = -1; // absent
        else if (rec.present === 1) level = 1;
        else if (rec.present === 2) level = 2;
        else if (rec.present === 3) level = 3;
        else if (rec.present >= 4) level = 4;
      }
      
      heatmapGrid.push({
        date: isoDate,
        level,
        present: rec ? rec.present : 0,
        absent: rec ? rec.absent : 0,
      });
    }
    setHeatmapData(heatmapGrid);

    // 2. Process Day of the Week Data
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayMap = {
      Monday: { day: "Mon", present: 0, absent: 0 },
      Tuesday: { day: "Tue", present: 0, absent: 0 },
      Wednesday: { day: "Wed", present: 0, absent: 0 },
      Thursday: { day: "Thu", present: 0, absent: 0 },
      Friday: { day: "Fri", present: 0, absent: 0 },
      Saturday: { day: "Sat", present: 0, absent: 0 },
      Sunday: { day: "Sun", present: 0, absent: 0 },
    };

    records.forEach((record) => {
      if (!record.timestamp) return;
      const d = new Date(record.timestamp);
      const dayName = days[d.getDay()];
      if (dayMap[dayName]) {
        if (record.status === "PRESENT") {
          dayMap[dayName].present += 1;
        } else {
          dayMap[dayName].absent += 1;
        }
      }
    });

    setDayOfWeekData([
      dayMap.Monday,
      dayMap.Tuesday,
      dayMap.Wednesday,
      dayMap.Thursday,
      dayMap.Friday,
      dayMap.Saturday,
      dayMap.Sunday,
    ]);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white neo-border p-3" style={{ boxShadow: "3px 3px 0px #000" }}>
          <p className="font-black text-xs uppercase mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getHeatmapColor = (level) => {
    if (level === -1) return "bg-red-500 border-red-700";
    if (level === 0) return "bg-gray-100 border-gray-300";
    if (level === 1) return "bg-green-300 border-green-500";
    if (level === 2) return "bg-green-400 border-green-600";
    if (level === 3) return "bg-green-500 border-green-700";
    if (level >= 4) return "bg-green-700 border-green-900";
    return "bg-gray-100 border-gray-300";
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 bg-tertiary"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">Attendance Analytics</h2>
        </div>
        <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">
          Deep dive into your presence insights
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 font-black text-on-surface/40 uppercase tracking-widest text-sm animate-pulse">
          Loading Analytics...
        </div>
      ) : data.attendances.length === 0 ? (
        <div className="text-center py-16 neo-border bg-surface-container">
          <span className="material-symbols-outlined text-5xl text-primary/30 mb-3 block">monitoring</span>
          <p className="font-black text-base uppercase tracking-wide text-on-surface">No Data Available</p>
          <p className="text-xs font-bold text-on-surface/40 mt-1 uppercase">Attend classes to unlock analytics.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-green-50 neo-border p-5 neo-shadow-sm border-2 border-green-300">
              <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-1">Overall Present</p>
              <div className="text-4xl font-black text-green-800">{data.stats.present}</div>
            </div>
            <div className="bg-red-50 neo-border p-5 neo-shadow-sm border-2 border-red-300">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">Overall Absent</p>
              <div className="text-4xl font-black text-red-800">{data.stats.absent}</div>
            </div>
            <div className="bg-primary/10 neo-border p-5 neo-shadow-sm border-2 border-primary">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Attendance Rate</p>
              <div className="text-4xl font-black text-primary">{data.stats.percentage}%</div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-white neo-border p-6 sm:p-8 w-full overflow-x-auto" style={{ boxShadow: "6px 6px 0px #10B981" }}>
            <div className="flex items-center justify-between gap-2 mb-6 min-w-[500px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-green-500"></div>
                <h3 className="font-black text-base uppercase tracking-wide">Activity Heatmap (Last 16 Weeks)</h3>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                <span>Less</span>
                <div className="w-3 h-3 bg-gray-100 border border-gray-300"></div>
                <div className="w-3 h-3 bg-green-300 border border-green-500"></div>
                <div className="w-3 h-3 bg-green-400 border border-green-600"></div>
                <div className="w-3 h-3 bg-green-500 border border-green-700"></div>
                <div className="w-3 h-3 bg-green-700 border border-green-900"></div>
                <span>More</span>
              </div>
            </div>
            <div className="flex flex-col flex-wrap gap-1 h-32 min-w-[500px]">
              {heatmapData.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date} | Present: ${day.present} | Absent: ${day.absent}`}
                  className={`w-3.5 h-3.5 border transition-all hover:scale-125 hover:z-10 cursor-pointer ${getHeatmapColor(day.level)}`}
                ></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart: Daily Trends */}
            <div className="bg-white neo-border p-6 sm:p-8 w-full" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 bg-secondary"></div>
                <h3 className="font-black text-base uppercase tracking-wide">Daily Trend (14 Days)</h3>
              </div>
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                      axisLine={{ stroke: '#000', strokeWidth: 2 }}
                      tickFormatter={(val) => val.slice(5)} // Show MM-DD
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                      axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    <Line type="monotone" dataKey="present" name="Present" stroke="#16A34A" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="absent" name="Absent" stroke="#DC2626" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Day of Week Analysis */}
            <div className="bg-white neo-border p-6 sm:p-8 w-full" style={{ boxShadow: "6px 6px 0px #6D28D9" }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 bg-tertiary"></div>
                <h3 className="font-black text-base uppercase tracking-wide">Consistency By Day</h3>
              </div>
              <div className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 'bold' }} 
                      axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 'bold' }} 
                      axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    <Bar dataKey="present" name="Present" fill="#38BDF8" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="absent" name="Absent" fill="#F87171" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

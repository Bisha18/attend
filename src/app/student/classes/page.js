"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function StudentClassesDashboard() {
  const [data, setData] = useState({ subjectStats: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/attendance/me", { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white neo-border p-3" style={{ boxShadow: "3px 3px 0px #000" }}>
          <p className="font-black text-xs uppercase mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getPercentageColor = (pct) => {
    if (pct >= 75) return "text-green-700 bg-green-50";
    if (pct >= 50) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  };

  const getBarColor = (pct) => {
    if (pct >= 75) return "#10B981"; // Green
    if (pct >= 50) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 bg-purple-600"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">Class Stats</h2>
        </div>
        <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">
          Track your attendance across all subjects
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 font-black text-on-surface/40 uppercase tracking-widest text-sm animate-pulse">
          Loading Class Data...
        </div>
      ) : !data.subjectStats || data.subjectStats.length === 0 ? (
        <div className="text-center py-16 neo-border bg-surface-container">
          <span className="material-symbols-outlined text-5xl text-primary/30 mb-3 block">category</span>
          <p className="font-black text-base uppercase tracking-wide text-on-surface">No Class Data Found</p>
          <p className="text-xs font-bold text-on-surface/40 mt-1 uppercase">Attend classes to populate this dashboard.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Comparative Bar Chart */}
          <div className="bg-white neo-border p-6 sm:p-8 w-full" style={{ boxShadow: "6px 6px 0px #6D28D9" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-tertiary"></div>
              <h3 className="font-black text-base uppercase tracking-wide">Performance Comparison</h3>
            </div>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.subjectStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="percentage" name="Attendance Rate" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.subjectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4 justify-center text-[9px] font-black uppercase tracking-widest text-on-surface/50">
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 block border border-black"></span> &ge; 75% Good</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 block border border-black"></span> &ge; 50% Warning</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 block border border-black"></span> &lt; 50% Danger</div>
            </div>
          </div>

          {/* Grid of Subject Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.subjectStats.map((subject) => {
              const pctColor = getPercentageColor(subject.percentage);
              return (
                <div key={subject.subject} className="bg-white neo-border p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-default" style={{ boxShadow: "4px 4px 0px #38BDF8" }}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-black text-lg uppercase tracking-tight text-on-surface leading-tight pr-2 line-clamp-2">
                        {subject.subject}
                      </h3>
                      <span className={`px-2.5 py-1 neo-border-2 font-black text-sm uppercase tracking-widest ${pctColor}`}>
                        {subject.percentage}%
                      </span>
                    </div>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-on-surface/60 mb-5">
                      <span>Total: {subject.total}</span>
                      <span className="text-green-600">P: {subject.present}</span>
                      <span className="text-red-600">A: {subject.absent}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-3 neo-border-2 bg-surface-container overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        subject.percentage >= 75 ? "bg-green-500" : subject.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`} 
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function StudentDashboard() {
  const [data, setData] = useState({ attendances: [], stats: { total: 0, present: 0, absent: 0, percentage: 0 }, subjectStats: [] });
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [markMsg, setMarkMsg] = useState({ text: "", type: "" });
  const [subjectTab, setSubjectTab] = useState("all");

  // Steps: idle | locating | camera | preview
  const [step, setStep] = useState("idle");
  const [photoPayload, setPhotoPayload] = useState(null);
  const [coords, setCoords] = useState(null);

  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Callback ref — fires the moment the <video> DOM node is inserted
  const videoRef = useCallback((node) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => { /* Autoplay interrupted — benign race condition */ });
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Cleanup: stop camera when component unmounts
    return () => stopStream();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/attendance/me", { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleValidateLocation = () => {
    setStep("locating");
    setMarkMsg({ text: "Acquiring GPS lock...", type: "info" });

    if (!("geolocation" in navigator)) {
      setMarkMsg({ text: "Geolocation not supported by this browser.", type: "error" });
      setStep("idle");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const token = localStorage.getItem("token");
          const { data: session } = await axios.get("/api/session/active", {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Haversine distance
          const R = 6371e3;
          const lat1 = pos.coords.latitude * Math.PI / 180;
          const lat2 = session.latitude * Math.PI / 180;
          const dLat = (session.latitude - pos.coords.latitude) * Math.PI / 180;
          const dLon = (session.longitude - pos.coords.longitude) * Math.PI / 180;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
          const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          if (distance > session.radius) {
            setMarkMsg({ text: `You are ${Math.round(distance)}m away. Must be within ${session.radius}m of classroom.`, type: "error" });
            setStep("idle");
            return;
          }

          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setMarkMsg({ text: "Location verified! Opening camera...", type: "success" });

          // Small delay so user sees the success message
          setTimeout(() => openCamera(), 500);

        } catch (err) {
          const msg = err.response?.data?.message || "Could not verify active session. Is the teacher's session active?";
          setMarkMsg({ text: msg, type: "error" });
          setStep("idle");
        }
      },
      (err) => {
        setMarkMsg({ text: "GPS Error: " + err.message, type: "error" });
        setStep("idle");
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMarkMsg({ text: "Camera not available. Please use https:// or localhost.", type: "error" });
      setStep("idle");
      return;
    }

    try {
      stopStream(); // Stop any previous stream
      let stream;
      try {
        // Try with explicit constraints first (works on mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch {
        // Fallback for desktop/laptop — no facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setStep("camera"); // This triggers the video element to mount, and the callback ref attaches the stream

    } catch (err) {
      console.error("Camera Error:", err.name, err.message);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMarkMsg({ text: "Camera permission denied. Click the camera icon in the URL bar to allow access.", type: "error" });
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setMarkMsg({ text: "No camera/webcam found on this device.", type: "error" });
      } else {
        setMarkMsg({ text: "Camera error: " + err.message, type: "error" });
      }
      setStep("idle");
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    // Get the active video element via the stream
    const videoEl = document.getElementById("selfie-video");

    if (!videoEl || !canvas) {
      setMarkMsg({ text: "Camera not ready. Please wait and try again.", type: "error" });
      return;
    }

    if (videoEl.videoWidth === 0 || videoEl.readyState < 2) {
      setMarkMsg({ text: "Camera is still loading. Wait a second then capture.", type: "error" });
      return;
    }

    // Scale down to max 640px wide to keep payload small
    const maxW = 640;
    const scale = Math.min(1, maxW / videoEl.videoWidth);
    canvas.width = Math.floor(videoEl.videoWidth * scale);
    canvas.height = Math.floor(videoEl.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    setPhotoPayload(dataUrl);
    stopStream();
    setStep("preview");
  };

  const retakePhoto = async () => {
    setPhotoPayload(null);
    setMarkMsg({ text: "", type: "" });
    await openCamera();
  };

  const cancelCamera = () => {
    stopStream();
    setStep("idle");
    setMarkMsg({ text: "", type: "" });
  };

  const submitAttendance = async () => {
    if (!coords || !photoPayload) {
      setMarkMsg({ text: "Missing location or photo. Start over.", type: "error" });
      setStep("idle");
      return;
    }

    setMarking(true);
    setMarkMsg({ text: "Submitting attendance...", type: "info" });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/attendance/mark",
        { latitude: coords.lat, longitude: coords.lng, selfieBase64: photoPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMarkMsg({ text: "✓ Attendance recorded successfully!", type: "success" });
      setStep("idle");
      setPhotoPayload(null);
      setCoords(null);
      fetchData();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 413) {
        setMarkMsg({ text: "Photo too large. Please retake.", type: "error" });
        setStep("idle");
      } else {
        setMarkMsg({ text: msg || "Submission failed.", type: "error" });
        setStep("idle");
      }
    } finally {
      setMarking(false);
    }
  };

  const pieData = [
    { name: "Present", value: data.stats.present },
    { name: "Absent", value: data.stats.absent },
  ];
  const COLORS = ["#6D28D9", "#38BDF8"];

  return (
    <div className="max-w-7xl mx-auto w-full pb-24 lg:pb-6">

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b-[3px] border-primary">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-8 bg-primary"></div>
          <h2 className="text-3xl sm:text-4xl font-black text-on-surface uppercase tracking-tighter">My Attendance</h2>
        </div>
        <p className="text-sm font-bold text-on-surface/50 uppercase tracking-widest ml-6">Verify your presence using GPS &amp; Biometrics</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Col */}
        <div className="xl:col-span-1 flex flex-col gap-6">

          {/* Mark Attendance Card */}
          <div className="bg-white neo-border flex flex-col items-center text-center p-6 sm:p-8" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>

            <div className="w-14 h-14 bg-primary neo-border neo-shadow-sm flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {step === "camera" || step === "preview" ? "photo_camera" : "fingerprint"}
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-1">Check In</h3>
            <p className="text-xs font-bold text-on-surface/50 uppercase tracking-widest mb-5">GPS + Selfie required</p>

            {/* Status Message */}
            {markMsg.text && (
              <div className={`mb-4 p-3 neo-border w-full text-sm font-bold flex items-start text-left gap-2 ${
                markMsg.type === "error" ? "bg-red-50 text-red-800 border-red-300" :
                markMsg.type === "success" ? "bg-green-50 text-green-800 border-green-300" :
                "bg-blue-50 text-blue-800 border-blue-300"
              }`}>
                <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">
                  {markMsg.type === "error" ? "error" : markMsg.type === "success" ? "check_circle" : "info"}
                </span>
                <span>{markMsg.text}</span>
              </div>
            )}

            {/* STEP 1: Validate GPS */}
            {(step === "idle" || step === "locating") && (
              <button
                onClick={handleValidateLocation}
                disabled={step === "locating"}
                id="validate-location-btn"
                className="w-full py-4 font-black text-sm uppercase tracking-widest text-white flex justify-center items-center gap-2 neo-border transition-all disabled:opacity-60"
                style={{ background: "#6D28D9", boxShadow: "4px 4px 0px #38BDF8" }}
              >
                <span className="material-symbols-outlined text-xl">
                  {step === "locating" ? "sync" : "my_location"}
                </span>
                {step === "locating" ? "Checking Location..." : "Validate Location"}
              </button>
            )}

            {/* STEP 2: Live Camera */}
            {step === "camera" && (
              <div className="w-full flex flex-col gap-3">
                <video
                  id="selfie-video"
                  ref={videoRef}
                  className="w-full neo-border bg-black"
                  style={{ aspectRatio: "4/3", objectFit: "cover" }}
                  muted
                  playsInline
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                <button
                  id="capture-btn"
                  onClick={capturePhoto}
                  className="py-3 font-black text-sm uppercase tracking-widest text-white flex justify-center items-center gap-2 neo-border bg-blue-600 hover:-translate-y-0.5 transition-all"
                >
                  <span className="material-symbols-outlined">photo_camera</span>
                  Capture Selfie
                </button>
                <button
                  onClick={cancelCamera}
                  className="py-2 text-xs font-bold text-red-600 uppercase neo-border bg-red-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* STEP 3: Preview & Submit */}
            {step === "preview" && photoPayload && (
              <div className="w-full flex flex-col gap-3">
                <div className="relative">
                  <img
                    src={photoPayload}
                    alt="selfie proof"
                    className="w-full neo-border"
                    style={{ aspectRatio: "4/3", objectFit: "cover" }}
                  />
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
                    ✓ Captured
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={retakePhoto}
                  disabled={marking}
                  className="py-2 text-xs font-bold text-primary uppercase bg-surface-container neo-border border-2"
                >
                  Retake Photo
                </button>
                <button
                  id="submit-attendance-btn"
                  onClick={submitAttendance}
                  disabled={marking}
                  className="py-3 font-black text-sm uppercase tracking-widest text-white flex justify-center items-center gap-2 neo-border bg-green-600 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">{marking ? "sync" : "check_circle"}</span>
                  {marking ? "Submitting..." : "Submit Attendance"}
                </button>
              </div>
            )}
          </div>

          {/* Stats Card */}
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
            <div className="h-52 w-full min-w-0">
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

          {/* Subject-wise Breakdown Card */}
          {data.subjectStats && data.subjectStats.length > 0 && (
            <div className="bg-white neo-border p-6 sm:p-8" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 bg-tertiary border-[2px] border-primary"></div>
                <h3 className="font-black text-base uppercase tracking-wide">Subject-wise Stats</h3>
              </div>
              <div className="space-y-3">
                {data.subjectStats.map((ss) => {
                  const pctColor = ss.percentage >= 75 ? "text-green-700 bg-green-50" : ss.percentage >= 50 ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50";
                  return (
                    <div key={ss.subject} className="neo-border p-4 bg-surface-container hover:bg-primary-container transition-colors" style={{ boxShadow: "2px 2px 0px #6D28D9" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-sm uppercase tracking-tight text-on-surface">{ss.subject}</span>
                        <span className={`px-2 py-0.5 neo-border-2 font-black text-xs uppercase tracking-widest ${pctColor}`}>{ss.percentage}%</span>
                      </div>
                      <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-on-surface/50">
                        <span>Total: {ss.total}</span>
                        <span className="text-green-600">Present: {ss.present}</span>
                        <span className="text-red-600">Absent: {ss.absent}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-2 neo-border-2 bg-surface-container overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${ss.percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: History */}
        <div className="xl:col-span-2">
          <div className="bg-white neo-border p-6 sm:p-8 h-full" style={{ boxShadow: "6px 6px 0px #38BDF8" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-6 bg-primary"></div>
              <h3 className="font-black text-base uppercase tracking-wide">Recent History</h3>
            </div>

            {/* Subject Filter Tabs */}
            {data.subjectStats && data.subjectStats.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                <button
                  onClick={() => setSubjectTab("all")}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest neo-border-2 transition-colors ${
                    subjectTab === "all" ? "bg-primary text-white" : "bg-surface-container text-on-surface/60 hover:bg-primary-container"
                  }`}
                >
                  All
                </button>
                {data.subjectStats.map(ss => (
                  <button
                    key={ss.subject}
                    onClick={() => setSubjectTab(ss.subject)}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest neo-border-2 transition-colors ${
                      subjectTab === ss.subject ? "bg-primary text-white" : "bg-surface-container text-on-surface/60 hover:bg-primary-container"
                    }`}
                  >
                    {ss.subject}
                  </button>
                ))}
              </div>
            )}

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
                {data.attendances
                  .filter(att => {
                    if (subjectTab === "all") return true;
                    const attSubject = att.subject || att.sessionId?.subject || '';
                    return attSubject === subjectTab;
                  })
                  .map((att) => {
                    const attSubject = att.subject || att.sessionId?.subject || '';
                    return (
                      <div key={att._id} className="flex items-center justify-between p-4 neo-border bg-surface-container hover:bg-primary-container transition-colors" style={{ boxShadow: "2px 2px 0px #6D28D9" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-100 neo-border-2 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-green-700 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                          <div>
                            <p className="font-black text-sm text-on-surface">{att.date}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] font-mono font-bold text-on-surface/40">{new Date(att.timestamp).toLocaleTimeString()}</p>
                              {attSubject && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 font-black text-[8px] uppercase tracking-widest neo-border-2">{attSubject}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 font-black text-[9px] uppercase tracking-widest neo-border-2">
                          {att.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

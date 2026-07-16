"use client";

import { useState } from "react";
import { Compass, Sparkles, ShieldAlert, Award, ArrowRight, Eye, EyeOff } from "lucide-react";

interface OnboardingProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Onboarding({ onLoginSuccess }: OnboardingProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("alex@voyana.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("TRAVELER");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const slides = [
    { title: "Travel Freely. Explore Confidently.", desc: "Voyana accompanies you before, during, and after your trip. Organize itineraries, record journal memories, and access safety features.", icon: Compass, color: "text-sky-500" },
    { title: "Empower Local Tour Guides", desc: "Connect directly with certified guides and rental vendors. Support local economies in Kashmir, Gulmarg, and Pahalgam.", icon: Award, color: "text-emerald-500" },
    { title: "Offline-First & Security SOS", desc: "No signal? No problem. Itinerary checklists, emergency hospital lists, and SOS tracking work entirely offline.", icon: ShieldAlert, color: "text-rose-500" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = authMode === "login" ? { email, password } : { name, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMsg(data.error || "Authentication failed. Please check credentials.");
      }
    } catch (err) {
      console.error("Auth error", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setTestUser = (testEmail: string, testRole: string) => {
    setEmail(testEmail);
    setPassword("password123");
    setRole(testRole);
    setAuthMode("login");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-slate-50">
      {/* LEFT PANEL: Sliding Presentation Info */}
      <div className="lg:col-span-5 bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="flex items-center gap-2 z-10">
          <span className="text-2xl">🧭</span>
          <h1 className="text-xl font-bold tracking-wider">VOYANA</h1>
        </div>

        {/* Slides Content */}
        <div className="space-y-6 my-12 z-10">
          <div className="flex gap-4 items-center">
            {(() => {
              const Icon = slides[activeSlide].icon;
              return (
                <div className={`p-3 bg-white/5 border border-white/10 rounded-2xl ${slides[activeSlide].color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              );
            })()}
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded">
              Feature {activeSlide + 1} of 3
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-white">
            {slides[activeSlide].title}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-[420px]">
            {slides[activeSlide].desc}
          </p>

          <div className="flex gap-1.5 pt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-8 h-1 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? "bg-sky-500 w-12" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 z-10 flex justify-between items-center border-t border-white/5 pt-6">
          <span>© 2026 Voyana Travel Companion.</span>
          <span className="text-sky-400 font-semibold flex items-center gap-1">
            Explore Confidently
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Card Form */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-md w-full bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {authMode === "login"
                ? "Enter credentials or select a test role below to view different user dashboards instantly."
                : "Register a profile to start tracking trips, scheduling guides, or driving."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-slate-50/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-500 mb-1">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@voyana.com"
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-slate-50/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-semibold">Define Dashboard Role</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["TRAVELER", "GUIDE", "VENDOR", "DRIVER"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 text-[10px] font-bold border rounded-lg transition-colors cursor-pointer ${
                        role === r
                          ? "bg-slate-900 border-slate-950 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Authenticating..." : authMode === "login" ? "Enter Dashboard" : "Register Profile"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center text-xs">
            <span className="text-slate-400 font-medium">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              className="text-sky-600 font-bold hover:underline"
            >
              {authMode === "login" ? "Create Account" : "Log In"}
            </button>
          </div>

          {/* Dev Test Switchers Quick Selectors */}
          <div className="border-t border-slate-100 pt-5 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center">
              ⚡ Development Evaluator Sandbox
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                onClick={() => setTestUser("alex@voyana.com", "TRAVELER")}
                className="px-2 py-1 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-500 border border-slate-200 rounded text-[9px] font-bold"
              >
                Traveler Profile
              </button>
              <button
                onClick={() => setTestUser("zahoor@voyana.com", "GUIDE")}
                className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 border border-slate-200 rounded text-[9px] font-bold"
              >
                Guide Profile
              </button>
              <button
                onClick={() => setTestUser("bhat@voyana.com", "VENDOR")}
                className="px-2 py-1 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-500 border border-slate-200 rounded text-[9px] font-bold"
              >
                Vendor Profile
              </button>
              <button
                onClick={() => setTestUser("manzoor@voyana.com", "DRIVER")}
                className="px-2 py-1 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-500 border border-slate-200 rounded text-[9px] font-bold"
              >
                Driver Profile
              </button>
              <button
                onClick={() => setTestUser("admin@voyana.com", "ADMIN")}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-500 border border-slate-200 rounded text-[9px] font-bold"
              >
                Admin Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

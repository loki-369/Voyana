"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Compass, Award, ShieldAlert } from "lucide-react";

interface OnboardingProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Onboarding({ onLoginSuccess }: OnboardingProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("traveler@voyana.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("TRAVELER");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const slides = [
    { 
      title: "Travel Freely. Explore Confidently.", 
      desc: "Voyana accompanies you before, during, and after your trip. Organize itineraries, record journal memories, and access safety features in the breathtaking J&K region.", 
      icon: Compass 
    },
    { 
      title: "Direct Local Marketplaces", 
      desc: "Connect directly with certified local guides and premium rental vendors. Empower communities in Srinagar, Gulmarg, and Pahalgam.", 
      icon: Award 
    },
    { 
      title: "Offline-First & Safety SOS", 
      desc: "No signal in the valleys? No problem. Itinerary checklists, emergency medical logs, and instant SOS alerts operate entirely offline.", 
      icon: ShieldAlert 
    },
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
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-[#faf9f6] text-[#171717] font-sans antialiased">
      {/* LEFT COLUMN: Editorial Presentation */}
      <div className="lg:col-span-5 bg-[#171717] text-[#eaeaea] p-10 md:p-14 flex flex-col justify-between border-r border-neutral-800 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-950/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-amber-950/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold tracking-[0.3em] text-white">VOYANA</span>
          </div>
        </div>

        {/* Dynamic Presentation */}
        <div className="my-16 space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = slides[activeSlide].icon;
              return (
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
              );
            })()}
            <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400">
              Feature 0{activeSlide + 1}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white leading-tight">
            {slides[activeSlide].title}
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm font-light">
            {slides[activeSlide].desc}
          </p>

          <div className="flex gap-2 pt-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-[1px] transition-all cursor-pointer ${
                  activeSlide === idx ? "bg-white w-10" : "bg-neutral-700 w-4"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-neutral-500 flex justify-between items-center border-t border-neutral-800 pt-6">
          <span className="font-light">© 2026 Voyana Companion.</span>
          <span className="text-white font-medium flex items-center gap-1">
            Explore Confidently
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimal Form */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-16">
        <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 border border-neutral-200/50 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.02)]">
          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-neutral-900">
              {authMode === "login" ? "Sign In" : "Create Profile"}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              {authMode === "login"
                ? "Enter your credentials or choose a pre-configured sandbox tester role below."
                : "Create an account as a traveler, guide, vendor, or taxi driver."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-lg">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === "register" && (
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-450">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full text-xs p-3 border border-neutral-200 focus:border-neutral-900 outline-none rounded-lg bg-[#fafafa]/50 focus:bg-white transition-all font-light"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-450">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@voyana.com"
                className="w-full text-xs p-3 border border-neutral-200 focus:border-neutral-900 outline-none rounded-lg bg-[#fafafa]/50 focus:bg-white transition-all font-light"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-450">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs p-3 border border-neutral-200 focus:border-neutral-900 outline-none rounded-lg bg-[#fafafa]/50 focus:bg-white transition-all pr-10 font-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === "register" && (
              <div className="space-y-2">
                <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-450">Platform Role</label>
                <div className="grid grid-cols-4 gap-2">
                  {["TRAVELER", "GUIDE", "VENDOR", "DRIVER"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 text-[9px] font-semibold border rounded-lg transition-all cursor-pointer ${
                        role === r
                          ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                          : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      }`}
                    >
                      {r === "TRAVELER" ? "Traveler" : r === "GUIDE" ? "Guide" : r === "VENDOR" ? "Vendor" : "Driver"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#171717] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? "Authenticating..." : authMode === "login" ? "Sign In" : "Register"}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center text-xs pt-1">
            <span className="text-neutral-400 font-light">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              className="text-[#171717] font-semibold hover:underline cursor-pointer"
            >
              {authMode === "login" ? "Create Account" : "Log In"}
            </button>
          </div>

          {/* Dev Test Switchers Quick Selectors */}
          <div className="border-t border-neutral-100 pt-6 space-y-3">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-[0.2em] block text-center">
              Evaluator Quick Access Sandbox
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setTestUser("traveler@voyana.com", "TRAVELER")}
                className="px-3 py-1.5 bg-[#faf9f6] hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 rounded-lg text-[9px] font-semibold transition-all cursor-pointer"
              >
                Traveler
              </button>
              <button
                onClick={() => setTestUser("zahoor@voyana.com", "GUIDE")}
                className="px-3 py-1.5 bg-[#faf9f6] hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 rounded-lg text-[9px] font-semibold transition-all cursor-pointer"
              >
                Tour Guide
              </button>
              <button
                onClick={() => setTestUser("bhat@voyana.com", "VENDOR")}
                className="px-3 py-1.5 bg-[#faf9f6] hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 rounded-lg text-[9px] font-semibold transition-all cursor-pointer"
              >
                Rental Vendor
              </button>
              <button
                onClick={() => setTestUser("manzoor@voyana.com", "DRIVER")}
                className="px-3 py-1.5 bg-[#faf9f6] hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 rounded-lg text-[9px] font-semibold transition-all cursor-pointer"
              >
                Taxi Driver
              </button>
              <button
                onClick={() => setTestUser("admin@voyana.com", "ADMIN")}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[9px] font-semibold transition-all cursor-pointer"
              >
                Administrator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

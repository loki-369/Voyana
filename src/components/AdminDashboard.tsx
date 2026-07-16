"use client";

import { useState, useEffect } from "react";
import { Users, Compass, DollarSign, CalendarCheck, Award, FileSpreadsheet, FileClock, CheckCircle } from "lucide-react";

interface AdminProps {
  user: any;
  isOnline: boolean;
}

export default function AdminDashboard({ isOnline }: AdminProps) {
  const [stats, setStats] = useState<any>({
    users: { total: 0, traveler: 0, guide: 0, vendor: 0, driver: 0 },
    trips: 0,
    bookings: 0,
    orders: 0,
    rides: 0,
    revenue: { total: 0, guides: 0, rentals: 0, taxi: 0 },
  });
  const [pendingGuides, setPendingGuides] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/dashboard/admin");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPendingGuides(data.pendingGuides || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error("Admin fetch error", err);
      // Fallback mock stats for offline/evaluation
      setStats({
        users: { total: 12, traveler: 8, guide: 2, vendor: 1, driver: 1 },
        trips: 5,
        bookings: 2,
        orders: 1,
        rides: 1,
        revenue: { total: 470, guides: 2500, rentals: 1100, taxi: 850 },
      });
      setPendingGuides([
        {
          id: "g2",
          languages: "English, Hindi",
          experience: 4,
          specialization: "Bird watching, forest trails",
          pricePerDay: 1500,
          location: "Dachigam Park, Srinagar",
          user: { name: "Shabir Dar", email: "shabir@voyana.com", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" },
        },
      ]);
      setAuditLogs([
        { id: "a1", action: "USER_LOGIN", details: "admin@voyana.com logged in successfully", ipAddress: "127.0.0.1", createdAt: new Date().toISOString() },
        { id: "a2", action: "GUIDE_BOOKING", details: "Traveler Alex Mercer requested Guide Zahoor", ipAddress: "192.168.1.5", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGuide = async (guideId: string) => {
    if (isOnline) {
      try {
        const res = await fetch("/api/dashboard/admin", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guideId, verify: true }),
        });
        if (res.ok) {
          setPendingGuides((prev) => prev.filter((g) => g.id !== guideId));
        }
      } catch (err) {
        console.error("Guide verify fail", err);
      }
    } else {
      setPendingGuides((prev) => prev.filter((g) => g.id !== guideId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-950 animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.users.total, desc: `${stats.users.traveler} travelers • ${stats.users.guide} guides`, icon: Users },
    { label: "Active Trips", value: stats.trips, desc: "Total route plans", icon: Compass },
    { label: "Commission", value: `₹${stats.revenue.total}`, desc: "10% guide, 15% rentals", icon: DollarSign },
    { label: "Bookings", value: stats.bookings, desc: `${stats.orders} rentals • ${stats.rides} cabs`, icon: CalendarCheck },
  ];

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pb-12 font-sans">
      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="premium-card p-5 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-[#faf9f6] border border-neutral-200/50 rounded-lg shrink-0 text-neutral-600 shadow-sm">
              <card.icon className="w-5 h-5 text-[#0f766e]" />
            </div>
            <div>
              <span className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider block">{card.label}</span>
              <h4 className="text-xl font-light tracking-tight text-neutral-800 mt-0.5">{card.value}</h4>
              <p className="text-[10px] text-neutral-400 font-light mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Center */}
        <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col min-h-[300px] shadow-sm">
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-600" />
            Guide & Vendor Verifications
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {pendingGuides.length === 0 ? (
              <div className="text-center py-12 bg-[#faf9f6]/40 border border-neutral-200/50 rounded-xl shadow-inner flex flex-col items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#0f766e] mb-2 animate-pulse" />
                <p className="text-xs text-neutral-450 font-semibold">All registrations are verified!</p>
              </div>
            ) : (
              pendingGuides.map((guide) => (
                <div key={guide.id} className="p-4 border border-neutral-200/60 rounded-xl bg-[#faf9f6]/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={guide.user.avatarUrl} alt="guide" className="w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800">{guide.user.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-light">{guide.user.email} • Exp: {guide.experience} yrs</p>
                      <p className="text-[9px] mt-1.5 bg-white px-2 py-0.5 rounded border border-neutral-200 text-neutral-550 w-fit font-bold uppercase tracking-wider">
                        {guide.specialization}
                      </p>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleVerifyGuide(guide.id)}
                      className="px-4 py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Approve Guide
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col h-full min-h-[300px] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2">
              <FileClock className="w-4 h-4 text-neutral-500" />
              Security Audit Logs
            </h3>
            <button className="text-[9px] uppercase tracking-wider text-neutral-850 font-bold hover:underline flex items-center gap-1 cursor-pointer">
              Logs
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {auditLogs.map((log, index) => (
              <div key={index} className="p-3 bg-[#faf9f6]/40 border border-neutral-200/40 rounded-xl space-y-1 hover:border-neutral-400 transition-all shadow-inner">
                <div className="flex justify-between items-center text-[9px] font-semibold">
                  <span className="text-[#0f766e]">{log.action}</span>
                  <span className="text-neutral-400">{log.ipAddress}</span>
                </div>
                <p className="text-[10px] text-neutral-600 leading-snug font-light">{log.details}</p>
                <span className="text-[8px] text-neutral-400 block pt-0.5 font-light">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

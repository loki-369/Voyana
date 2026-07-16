"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  ShoppingBag,
  Bot,
  BookOpen,
  ShieldAlert,
  Settings,
  Bell,
  Wifi,
  WifiOff,
  CheckCircle2,
  ListTodo,
  LogOut,
} from "lucide-react";

// Sub Components
import Onboarding from "@/components/Onboarding";
import TravelerDashboard from "@/components/TravelerDashboard";
import TimelineMap from "@/components/TimelineMap";
import Marketplace from "@/components/Marketplace";
import AIAssistant from "@/components/AIAssistant";
import Journal from "@/components/Journal";
import Emergency from "@/components/Emergency";
import AdminDashboard from "@/components/AdminDashboard";
import { GuideDashboard, VendorDashboard, DriverDashboard } from "@/components/RoleDashboards";

// Offline sync helper
import { getOnlineStatus, processSyncQueue, getLocalData, saveLocalData } from "@/lib/offlineDb";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Connectivity
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState("");

  // Data states
  const [trip, setTrip] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Monitor connectivity state
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(getOnlineStatus());

    const handleOnline = async () => {
      setIsOnline(true);
      if (token) {
        setSyncing(true);
        setSyncToast("Network restored. Syncing offline changes...");
        const result = await processSyncQueue(token);
        setSyncing(false);
        if (result.syncedCount > 0) {
          setSyncToast(`Successfully synced ${result.syncedCount} changes to database!`);
          fetchData(); // Reload fresh database copy
        } else {
          setSyncToast("");
        }
        setTimeout(() => setSyncToast(""), 4000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncToast("Offline mode activated. Changes will be saved locally.");
      setTimeout(() => setSyncToast(""), 4000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token]);

  // Load session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token || "mock-token");
      }
    } catch (err) {
      console.warn("Session check failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch traveler dashboard details
  useEffect(() => {
    if (user && user.role === "TRAVELER") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!isOnline) {
      // Load offline backup
      setTrip(getLocalData("trip"));
      setExpenses(getLocalData("expenses", []));
      setChecklists(getLocalData("checklists", []));
      setJournalEntries(getLocalData("journal", []));
      setNotifications(getLocalData("notifications", []));
      return;
    }

    try {
      // 1. Fetch current trip
      const tripRes = await fetch("/api/trips");
      if (tripRes.ok) {
        const tripData = await tripRes.json();
        if (tripData.trips && tripData.trips.length > 0) {
          const activeTrip = tripData.trips[0];
          setTrip(activeTrip);
          saveLocalData("trip", activeTrip);

          // 2. Fetch checklists for active trip
          const checklistRes = await fetch(`/api/trips/${activeTrip.id}/checklist`);
          if (checklistRes.ok) {
            const checklistData = await checklistRes.json();
            setChecklists(checklistData.checklist);
            saveLocalData("checklists", checklistData.checklist);
          }

          // 3. Fetch expenses
          const expenseRes = await fetch(`/api/expenses?tripId=${activeTrip.id}`);
          if (expenseRes.ok) {
            const expenseData = await expenseRes.json();
            setExpenses(expenseData.expenses);
            saveLocalData("expenses", expenseData.expenses);
          }
        }
      }

      // 4. Fetch journal logs
      const journalRes = await fetch("/api/journal");
      if (journalRes.ok) {
        const journalData = await journalRes.json();
        setJournalEntries(journalData.entries);
        saveLocalData("journal", journalData.entries);
      }

      // 5. Fetch notifications
      const notifyRes = await fetch("/api/notifications");
      if (notifyRes.ok) {
        const notifyData = await notifyRes.json();
        setNotifications(notifyData.notifications || []);
        saveLocalData("notifications", notifyData.notifications || []);
      }
    } catch (err) {
      console.error("Data fetching error:", err);
    }
  };

  const handleLoginSuccess = (authenticatedUser: any, sessionToken: string) => {
    setUser(authenticatedUser);
    setToken(sessionToken);
    setActiveTab(
      authenticatedUser.role === "TRAVELER"
        ? "Dashboard"
        : authenticatedUser.role === "GUIDE"
        ? "Guide Panel"
        : authenticatedUser.role === "VENDOR"
        ? "Vendor Panel"
        : authenticatedUser.role === "DRIVER"
        ? "Driver Panel"
        : "Admin Panel"
    );
  };

  const handleLogout = async () => {
    setUser(null);
    setToken("");
    try {
      await fetch("/api/auth/me", { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Checklist items
  const handleToggleChecklist = async (itemId: string, completed: boolean) => {
    if (!trip) return;

    if (isOnline) {
      try {
        const res = await fetch(`/api/trips/${trip.id}/checklist`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, completed }),
        });
        if (res.ok) {
          setChecklists((prev) => prev.map((item) => (item.id === itemId ? { ...item, completed } : item)));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Offline edit
      const updatedChecklists = checklists.map((item) => (item.id === itemId ? { ...item, completed } : item));
      setChecklists(updatedChecklists);
      saveLocalData("checklists", updatedChecklists);

      // Queue action
      const syncQueue = localStorage.getItem("voyana_sync_queue");
      const queue = syncQueue ? JSON.parse(syncQueue) : [];
      queue.push({
        id: Math.random().toString(),
        url: `/api/trips/${trip.id}/checklist`,
        method: "PUT",
        body: { itemId, completed },
        timestamp: Date.now(),
      });
      localStorage.setItem("voyana_sync_queue", JSON.stringify(queue));
    }
  };

  // Switch role inside developer sandbox helper
  const handleDevRoleSwitch = async (newRole: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveTab(
          newRole === "TRAVELER"
            ? "Dashboard"
            : newRole === "GUIDE"
            ? "Guide Panel"
            : newRole === "VENDOR"
            ? "Vendor Panel"
            : newRole === "DRIVER"
            ? "Driver Panel"
            : "Admin Panel"
        );
      }
    } catch (err) {
      console.error("Role switch failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-slate-50 min-h-screen">
        <Compass className="w-10 h-10 text-sky-500 animate-spin mb-3" />
        <p className="text-slate-400 text-xs font-semibold">Initiating Voyana Ecosystem...</p>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onLoginSuccess={handleLoginSuccess} />;
  }

  // Traveler Navigation Items
  const navTabs = [
    { name: "Dashboard", icon: Compass },
    { name: "Route & Map", icon: MapPin },
    { name: "Marketplaces", icon: ShoppingBag },
    { name: "AI Assistant", icon: Bot },
    { name: "Travel Journal", icon: BookOpen },
    { name: "Emergency SOS", icon: ShieldAlert },
  ];

  if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
    navTabs.push({ name: "Admin Panel", icon: Settings });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      {/* Dynamic Toast / Sync alert banner */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl border border-white/10 text-xs font-semibold shadow-lg z-[999] flex items-center gap-2">
          {syncing ? <Wifi className="w-4 h-4 text-sky-400 animate-pulse" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {syncToast}
        </div>
      )}

      {/* Floating Dev Switcher (grants instant toggle between dashboards) */}
      <div className="fixed bottom-4 left-4 z-50 bg-white/95 border border-slate-200 p-2.5 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-semibold">
        <span className="text-slate-400">Eval Role:</span>
        <select
          value={user.role}
          onChange={(e) => handleDevRoleSwitch(e.target.value)}
          className="bg-slate-50 border border-slate-250 p-1 rounded font-bold outline-none cursor-pointer"
        >
          <option value="TRAVELER">Traveler</option>
          <option value="GUIDE">Tour Guide</option>
          <option value="VENDOR">Rental Vendor</option>
          <option value="DRIVER">Taxi Driver</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      {/* SIDEBAR FOR TRAVELER / ADMIN */}
      {user.role === "TRAVELER" || user.role === "ADMIN" || user.role === "SUPERADMIN" ? (
        <aside className="md:w-64 bg-slate-900 text-slate-400 flex flex-col justify-between border-r border-slate-850 p-5 shrink-0 z-20">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧭</span>
                <span className="font-extrabold text-white text-sm tracking-widest">VOYANA</span>
              </div>

              {/* Online/Offline status */}
              <div className="flex items-center">
                {isOnline ? (
                  <span title="Online"><Wifi className="w-4 h-4 text-emerald-500" /></span>
                ) : (
                  <span title="Offline mode active"><WifiOff className="w-4 h-4 text-rose-500 animate-pulse" /></span>
                )}
              </div>
            </div>

            {/* Nav List */}
            <nav className="space-y-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile metadata */}
          <div className="border-t border-white/5 pt-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user.name}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">{user.role}</span>
              </div>
            </div>
          </div>
        </aside>
      ) : null}

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 py-3.5 px-6 flex justify-between items-center z-10 shrink-0">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {activeTab}
          </h2>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800">Notifications Inbox</h4>
                    <button
                      onClick={async () => {
                        try {
                          await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
                          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="text-[9px] text-sky-600 font-bold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-2.5 rounded-lg border text-[10px] ${n.read ? "bg-slate-50 border-slate-100" : "bg-sky-50/50 border-sky-100"}`}>
                          <span className="font-bold text-slate-800 block">{n.title}</span>
                          <span className="text-slate-500 leading-snug block mt-0.5">{n.body}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Offline Indicators for roles without Sidebars */}
            {(user.role === "GUIDE" || user.role === "VENDOR" || user.role === "DRIVER") && (
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg text-slate-600">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Offline Mode
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Body content renderer */}
        <div className="flex-1 p-6 overflow-hidden">
          {user.role === "TRAVELER" && (
            <>
              {activeTab === "Dashboard" && (
                <TravelerDashboard
                  user={user}
                  trip={trip}
                  expenses={expenses}
                  checklists={checklists}
                  journalEntries={journalEntries}
                  isOnline={isOnline}
                  onSelectTab={setActiveTab}
                  onToggleChecklist={handleToggleChecklist}
                  onLogout={handleLogout}
                />
              )}
              {activeTab === "Route & Map" && (
                <TimelineMap trip={trip} onUpdateTrip={setTrip} isOnline={isOnline} />
              )}
              {activeTab === "Marketplaces" && (
                <Marketplace
                  user={user}
                  isOnline={isOnline}
                  onAddExpense={(newExp) => setExpenses((prev) => [newExp, ...prev])}
                  onAddNotification={(newNotify) => setNotifications((prev) => [newNotify, ...prev])}
                />
              )}
              {activeTab === "AI Assistant" && (
                <AIAssistant trip={trip} />
              )}
              {activeTab === "Travel Journal" && (
                <Journal
                  entries={journalEntries}
                  onAddEntry={(entry) => setJournalEntries((prev) => [entry, ...prev])}
                  isOnline={isOnline}
                />
              )}
              {activeTab === "Emergency SOS" && (
                <Emergency user={user} isOnline={isOnline} />
              )}
              {activeTab === "Admin Panel" && (
                <AdminDashboard user={user} isOnline={isOnline} />
              )}
            </>
          )}

          {user.role === "GUIDE" && (
            <GuideDashboard user={user} isOnline={isOnline} onLogout={handleLogout} />
          )}

          {user.role === "VENDOR" && (
            <VendorDashboard user={user} isOnline={isOnline} onLogout={handleLogout} />
          )}

          {user.role === "DRIVER" && (
            <DriverDashboard user={user} isOnline={isOnline} onLogout={handleLogout} />
          )}

          {(user.role === "ADMIN" || user.role === "SUPERADMIN") && activeTab === "Admin Panel" && (
            <AdminDashboard user={user} isOnline={isOnline} />
          )}
        </div>
      </main>
    </div>
  );
}

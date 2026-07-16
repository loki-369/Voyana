"use client";

import { useState } from "react";
import {
  CloudSun, ArrowRight, BadgeCent, CheckSquare, RefreshCw, LogOut,
  Map, Shirt, Car, ShieldAlert, Plus, X, Loader2, CalendarDays, Wallet
} from "lucide-react";

interface TravelerProps {
  user: any;
  trip: any;
  expenses: any[];
  checklists: any[];
  journalEntries: any[];
  isOnline: boolean;
  onSelectTab: (tab: string) => void;
  onToggleChecklist: (itemId: string, completed: boolean) => void;
  onLogout: () => void;
  onCreateTrip?: (trip: any) => void;
  onAddExpense?: (expense: any) => void;
}

export default function TravelerDashboard({
  user,
  trip,
  expenses,
  checklists,
  onSelectTab,
  onToggleChecklist,
  onLogout,
  onCreateTrip,
  onAddExpense,
}: TravelerProps) {
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState({ temp: 22, desc: "Pleasant, Sunset" });

  // Trip creation state
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [tripForm, setTripForm] = useState({
    destination: "Srinagar, Kashmir",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    budget: "30000",
    companions: "Solo",
    transportation: "Flight & Taxi",
    accommodation: "Hotel",
    notes: "",
  });

  // Add expense state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "Food",
    description: "",
  });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const activeDestinations = trip?.destinations || [];
  const currentStop = activeDestinations.find((d: any) => d.status === "CURRENT") || activeDestinations[0];
  const nextStop = activeDestinations.find((d: any) => d.status === "UPCOMING");

  const refreshWeather = () => {
    setWeatherLoading(true);
    setTimeout(() => {
      setWeatherLoading(false);
      const temps = [19, 21, 23, 22];
      const desc = ["Sunny, Gentle Wind", "Pleasant, Clear Sky", "Passing Clouds", "Calm and Breezy"];
      const randIdx = Math.floor(Math.random() * temps.length);
      setWeatherCondition({ temp: temps[randIdx], desc: desc[randIdx] });
    }, 1000);
  };

  const handleCreateTrip = async () => {
    if (!tripForm.destination || !tripForm.startDate || !tripForm.endDate) return;
    setCreatingTrip(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripForm),
      });
      if (res.ok) {
        const data = await res.json();
        onCreateTrip?.(data.trip);
        setShowCreateTrip(false);
      }
    } catch (err) {
      console.error("Create trip failed", err);
    } finally {
      setCreatingTrip(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.amount || !expenseForm.category) return;
    setAddingExpense(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(expenseForm.amount),
          category: expenseForm.category,
          description: expenseForm.description,
          tripId: trip?.id || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onAddExpense?.(data.expense);
        setExpenseForm({ amount: "", category: "Food", description: "" });
        setShowAddExpense(false);
      }
    } catch (err) {
      console.error("Add expense failed", err);
    } finally {
      setAddingExpense(false);
    }
  };

  const actionCards = [
    { title: "Book Local Guide", tab: "Marketplaces", desc: "Find certified cultural & hike guides", icon: Map },
    { title: "Rent Extreme Gear", tab: "Marketplaces", desc: "Winter coats, boots, GoPro cameras", icon: Shirt },
    { title: "Match Cab/Taxi", tab: "Marketplaces", desc: "Call reliable airport & snow drivers", icon: Car },
    { title: "Emergency SOS Center", tab: "Emergency SOS", desc: "One-tap alerts & offline medical list", icon: ShieldAlert },
  ];

  const categories = ["Hotel", "Food", "Taxi", "Guide", "Rental", "Shopping"];
  const getCategorySpent = (cat: string) => {
    return expenses.filter((e) => e.category?.toLowerCase() === cat.toLowerCase()).reduce((s, e) => s + e.amount, 0);
  };

  return (
    <>
      {/* ── CREATE TRIP MODAL ─────────────────────────────── */}
      {showCreateTrip && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 border border-neutral-200/60">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Plan Your J&K Trip</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Fill in the details to create your itinerary</p>
              </div>
              <button onClick={() => setShowCreateTrip(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Destination</label>
                <input
                  type="text"
                  value={tripForm.destination}
                  onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                  placeholder="e.g. Srinagar, Kashmir"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tripForm.startDate}
                    onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={tripForm.endDate}
                    onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={tripForm.budget}
                    onChange={(e) => setTripForm({ ...tripForm, budget: e.target.value })}
                    placeholder="30000"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Companions</label>
                  <select
                    value={tripForm.companions}
                    onChange={(e) => setTripForm({ ...tripForm, companions: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all bg-white"
                  >
                    <option>Solo</option>
                    <option>Couple</option>
                    <option>Family</option>
                    <option>Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Transport</label>
                  <select
                    value={tripForm.transportation}
                    onChange={(e) => setTripForm({ ...tripForm, transportation: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all bg-white"
                  >
                    <option>Flight & Taxi</option>
                    <option>Train & Bus</option>
                    <option>Self Drive</option>
                    <option>Bike</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Stay</label>
                  <select
                    value={tripForm.accommodation}
                    onChange={(e) => setTripForm({ ...tripForm, accommodation: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all bg-white"
                  >
                    <option>Hotel</option>
                    <option>Houseboat</option>
                    <option>Hostel</option>
                    <option>Home Stay</option>
                    <option>Camping</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Notes (optional)</label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Special requirements, interests..."
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowCreateTrip(false)}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-600 font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={creatingTrip}
                className="flex-1 py-2.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {creatingTrip ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                {creatingTrip ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD EXPENSE MODAL ─────────────────────────────── */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-neutral-200/60">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Log Expense</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Track your trip spending</p>
              </div>
              <button onClick={() => setShowAddExpense(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]/20 transition-all font-semibold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Category</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["Food", "Hotel", "Taxi", "Guide", "Rental", "Shopping"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setExpenseForm({ ...expenseForm, category: cat })}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        expenseForm.category === cat
                          ? "bg-neutral-950 text-white border-neutral-950"
                          : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="What did you spend on?"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#0f766e] transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-600 font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={addingExpense || !expenseForm.amount}
                className="flex-1 py-2.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {addingExpense ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {addingExpense ? "Saving..." : "Log Expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] overflow-y-auto pb-24 md:pb-12 font-sans">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card & Weather */}
          <div className="premium-card p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-light tracking-tight text-neutral-800">
                Welcome back, <span className="font-semibold text-neutral-900">{user.name.split(" ")[0]}</span>
              </h2>
              <p className="text-xs text-neutral-450 font-light">
                {trip ? `Your itinerary for ${trip.destination} is active.` : "You have no active trip — create one to get started."}
              </p>
            </div>

            {/* Weather Component */}
            <div className="flex items-center gap-4 bg-[#faf9f6] border border-neutral-200/50 px-4 py-2.5 rounded-xl min-w-[210px] justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <CloudSun className="w-5 h-5 text-[#0f766e] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-neutral-855">{weatherCondition.temp}°C</span>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{weatherCondition.desc}</p>
                </div>
              </div>
              <button
                onClick={refreshWeather}
                disabled={weatherLoading}
                className={`p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer ${weatherLoading ? "animate-spin text-neutral-950" : ""}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* NO TRIP: Call-to-action to create first trip */}
          {!trip && (
            <div className="bg-neutral-950 text-white p-8 border border-neutral-900 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg min-h-[180px]">
              <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-amber-500/10 blur-[50px] pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-teal-500/10 blur-[50px] pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <CalendarDays className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-lg font-light tracking-tight">Plan Your Kashmir Journey</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed font-light">
                  Create your first trip to unlock the map, checklist, budget tracker, and AI itinerary assistant.
                </p>
                <button
                  onClick={() => setShowCreateTrip(true)}
                  className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl transition-all flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create My Trip
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE TRIP: Timeline Banner */}
          {trip && currentStop && (
            <div className="bg-neutral-950 text-white p-6 border border-neutral-900 rounded-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden shadow-lg">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-amber-500/10 blur-[50px] pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[8px] uppercase tracking-[0.2em] text-amber-500 font-bold block">Current Location</span>
                <h3 className="text-xl font-light tracking-tight mt-1 text-white">{currentStop.name}</h3>
                {currentStop.notes && <p className="text-xs text-neutral-400 mt-2 max-w-lg leading-relaxed font-light">{currentStop.notes}</p>}
              </div>
              <div className="flex items-center justify-between mt-6 border-t border-neutral-900 pt-4 text-xs relative z-10">
                <div className="text-neutral-400 font-medium">
                  Next: <span className="text-white font-bold">{nextStop ? nextStop.name : "Return Home"}</span>
                </div>
                <button
                  onClick={() => onSelectTab("Route & Map")}
                  className="text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Open Map <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                </button>
              </div>
            </div>
          )}

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionCards.map((card) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={card.title}
                  onClick={() => onSelectTab(card.tab)}
                  className="premium-card p-5 rounded-xl hover:border-neutral-800 transition-all flex gap-4 cursor-pointer group"
                >
                  <div className="shrink-0 p-3 bg-[#faf9f6] border border-neutral-200/50 rounded-lg group-hover:bg-neutral-950 group-hover:text-white transition-all flex items-center justify-center w-11 h-11 shadow-sm">
                    <CardIcon className="w-5 h-5 text-[#0f766e] group-hover:text-emerald-400 transition-all" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-neutral-800 group-hover:text-neutral-950 transition-colors">{card.title}</h4>
                    <p className="text-[10px] text-neutral-450 font-light leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Ledger & Checklist */}
        <div className="lg:col-span-1 space-y-6">
          {/* Expenses Ledger */}
          <div className="premium-card p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-2">
                <BadgeCent className="w-4 h-4 text-neutral-500" />
                Expenses Ledger
              </h3>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-[#0f766e] hover:text-neutral-900 transition-colors cursor-pointer border border-[#0f766e]/30 hover:border-neutral-400 px-2 py-1 rounded-lg"
              >
                <Plus className="w-2.5 h-2.5" /> Add
              </button>
            </div>

            {trip ? (
              <>
                <div className="flex justify-between text-xs font-bold text-neutral-700">
                  <span>₹{totalSpent.toLocaleString()} spent</span>
                  <span className="text-neutral-450 font-medium">Budget: ₹{trip.budget.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-[#faf9f6] rounded-full overflow-hidden border border-neutral-200/50">
                  <div
                    className="h-full rounded-full bg-amber-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalSpent / trip.budget) * 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-100 text-[10px]">
                  {categories.map((cat) => {
                    const spent = getCategorySpent(cat);
                    return (
                      <div key={cat} className="flex justify-between items-center p-2.5 bg-[#faf9f6] border border-neutral-200/30 rounded-lg hover:border-neutral-300 transition-all">
                        <span className="font-semibold text-neutral-400">{cat}</span>
                        <span className="font-bold text-neutral-750">₹{spent.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <Wallet className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
                <p className="text-[10px] text-neutral-400">Create a trip to track expenses</p>
                <button
                  onClick={() => setShowCreateTrip(true)}
                  className="mt-2 text-[9px] uppercase tracking-wider font-bold text-[#0f766e] hover:underline cursor-pointer"
                >
                  + Create Trip
                </button>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="premium-card p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-neutral-500" />
                Active Checklist
              </h3>
              <button
                onClick={() => onSelectTab("Route & Map")}
                className="text-[9px] uppercase tracking-wider text-neutral-900 font-bold hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {checklists.length === 0 ? (
                <p className="text-[10px] text-neutral-450 text-center py-4">
                  {trip ? "Checklist is empty." : "Create a trip to see your packing checklist."}
                </p>
              ) : (
                checklists.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleChecklist(item.id, !item.completed)}
                    className="flex items-center gap-2.5 cursor-pointer text-xs p-2.5 bg-[#faf9f6] hover:bg-white rounded-lg border border-neutral-200/50 hover:border-neutral-300 transition-all shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 border-neutral-300 text-neutral-900 focus:ring-neutral-700 rounded cursor-pointer accent-[#0f766e]"
                    />
                    <span className={`text-[11px] truncate font-medium ${item.completed ? "line-through text-neutral-450" : "text-neutral-750"}`}>
                      {item.task}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full py-3 bg-[#faf9f6] hover:bg-red-50 hover:text-red-700 text-neutral-500 hover:border-red-200 border border-neutral-200/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Log Out Session
          </button>
        </div>
      </div>
    </>
  );
}

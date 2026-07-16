"use client";

import { useState } from "react";
import { CloudSun, ArrowRight, BadgeCent, CheckSquare, RefreshCw, LogOut, Map, Shirt, Car, ShieldAlert } from "lucide-react";

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
}

export default function TravelerDashboard({
  user,
  trip,
  expenses,
  checklists,
  onSelectTab,
  onToggleChecklist,
  onLogout,
}: TravelerProps) {
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState({ temp: 22, desc: "Pleasant, Sunset" });

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] overflow-y-auto pb-12 font-sans">
      {/* LEFT COLUMN: Travel Progress & Shortcuts */}
      <div className="lg:col-span-2 space-y-6">
        {/* Profile Card & Weather */}
        <div className="premium-card p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-light tracking-tight text-neutral-800">Welcome back, <span className="font-semibold text-neutral-900">{user.name.split(" ")[0]}</span></h2>
            <p className="text-xs text-neutral-450 font-light">
              {trip ? `Your itinerary for ${trip.destination} is active.` : "Start mapping your J&K journey."}
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

        {/* Active Timeline Banner */}
        {trip && currentStop && (
          <div className="bg-neutral-950 text-white p-6 border border-neutral-900 rounded-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden shadow-lg">
            {/* Ambient Background Light Accent */}
            <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-amber-500/10 blur-[50px] pointer-events-none" />
            
            <div className="relative z-10">
              <span className="text-[8px] uppercase tracking-[0.2em] text-amber-500 font-bold block">Current Location</span>
              <h3 className="text-xl font-light tracking-tight mt-1 text-white">{currentStop.name}</h3>
              {currentStop.notes && <p className="text-xs text-neutral-400 mt-2 max-w-lg leading-relaxed font-light">{currentStop.notes}</p>}
            </div>

            <div className="flex items-center justify-between mt-6 border-t border-neutral-900 pt-4 text-xs relative z-10">
              <div className="text-neutral-400 font-medium">
                Next Destination: <span className="text-white font-bold">{nextStop ? nextStop.name : "Return Home"}</span>
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
                  <h4 className="text-xs font-bold text-neutral-800 group-hover:text-neutral-950 transition-colors">
                    {card.title}
                  </h4>
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
        {trip && (
          <div className="premium-card p-6 rounded-xl space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-2">
              <BadgeCent className="w-4 h-4 text-neutral-500" />
              Expenses Ledger
            </h3>

            <div className="flex justify-between text-xs font-bold text-neutral-700">
              <span>₹{totalSpent.toLocaleString()} spent</span>
              <span className="text-neutral-450 font-medium">Budget: ₹{trip.budget.toLocaleString()}</span>
            </div>

            {/* Premium Gold/Amber spent progress bar */}
            <div className="w-full h-1.5 bg-[#faf9f6] rounded-full overflow-hidden border border-neutral-200/50">
              <div
                className="h-full rounded-full bg-amber-600 transition-all duration-500"
                style={{ width: `${Math.min(100, (totalSpent / trip.budget) * 100)}%` }}
              ></div>
            </div>

            {/* Categories breakdown list */}
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
          </div>
        )}

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
              <p className="text-[10px] text-neutral-450 text-center py-4">Checklist is empty.</p>
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
  );
}

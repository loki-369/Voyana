"use client";

import { useState } from "react";
import { CloudSun, ArrowRight, Compass, ShieldAlert, BadgeCent, Heart, CheckSquare, Plus, RefreshCw, LogOut } from "lucide-react";

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
  journalEntries,
  isOnline,
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
      // Random mock variations
      const temps = [19, 21, 23, 22];
      const desc = ["Sunny, Gentle Wind", "Pleasant, Clear Sky", "Passing Clouds", "Calm and Breezy"];
      const randIdx = Math.floor(Math.random() * temps.length);
      setWeatherCondition({ temp: temps[randIdx], desc: desc[randIdx] });
    }, 1000);
  };

  const actionCards = [
    { title: "Book Local Guide", tab: "Marketplaces", desc: "Find certified cultural & hike guides", icon: "🗺️", color: "from-sky-500 to-blue-600" },
    { title: "Rent Extreme Gear", tab: "Marketplaces", desc: "Winter coats, boots, GoPro cameras", icon: "🧥", color: "from-emerald-500 to-teal-600" },
    { title: "Match Cab/Taxi", tab: "Marketplaces", desc: "Call reliable airport & snow drivers", icon: "🚕", color: "from-amber-400 to-orange-500" },
    { title: "Emergency SOS Center", tab: "Emergency SOS", desc: "One-tap alerts & offline medical list", icon: "🚨", color: "from-rose-500 to-red-600" },
  ];

  // Group expenses by category for budget chart representation
  const categories = ["Hotel", "Food", "Taxi", "Guide", "Rental", "Shopping"];
  const getCategorySpent = (cat: string) => {
    return expenses.filter((e) => e.category?.toLowerCase() === cat.toLowerCase()).reduce((s, e) => s + e.amount, 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] overflow-y-auto pb-8">
      {/* LEFT COLUMN: Greetings, Weather, Timeline Progress, Quick Actions */}
      <div className="lg:col-span-2 space-y-6">
        {/* Greetings & Weather */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hello, {user.name.split(" ")[0]}!</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {trip ? `Ready for your ${trip.destination} adventure?` : "Start planning your travel confidently."}
            </p>
          </div>

          {/* Weather Widget */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-3 rounded-xl min-w-[210px] justify-between">
            <div className="flex items-center gap-2">
              <CloudSun className="w-8 h-8 text-sky-500 shrink-0" />
              <div>
                <span className="text-sm font-bold text-slate-700">{weatherCondition.temp}°C</span>
                <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[100px]">{weatherCondition.desc}</p>
              </div>
            </div>
            <button
              onClick={refreshWeather}
              disabled={weatherLoading}
              className={`p-1 text-slate-400 hover:text-sky-600 transition-colors ${weatherLoading ? "animate-spin text-sky-600" : ""}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Continue Current Trip Timeline Banner */}
        {trip && currentStop && (
          <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[140px]">
            <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider block">Continue current trip</span>
                <h3 className="text-base font-bold mt-1 text-white">{currentStop.name}</h3>
                {currentStop.notes && <p className="text-[11px] text-slate-400 mt-1 max-w-[450px] leading-relaxed">{currentStop.notes}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                Next Stop: <span className="text-white font-bold">{nextStop ? nextStop.name : "Return Home"}</span>
              </div>
              <button
                onClick={() => onSelectTab("Route & Map")}
                className="text-sky-300 hover:text-sky-200 font-bold flex items-center gap-0.5"
              >
                Track Map <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actionCards.map((card) => (
            <div
              key={card.title}
              onClick={() => onSelectTab(card.tab)}
              className="bg-white p-4 border border-slate-100 rounded-2xl hover:shadow-xs hover:border-slate-200 transition-all flex gap-3.5 cursor-pointer group"
            >
              <div className="text-2xl shrink-0 p-2 bg-slate-50 border border-slate-100 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center w-12 h-12">
                {card.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1 group-hover:text-sky-600 transition-colors">
                  {card.title}
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Budget Tracking, Checklist, memories summary */}
      <div className="lg:col-span-1 space-y-6">
        {/* Expenses & Budget Box */}
        {trip && (
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <BadgeCent className="w-4.5 h-4.5 text-sky-500" />
              Trip Budget Spent
            </h3>

            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>₹{totalSpent.toLocaleString()} spent</span>
              <span>₹{trip.budget.toLocaleString()} budget</span>
            </div>

            {/* Spent progress bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalSpent / trip.budget > 0.9 ? "bg-red-500" : totalSpent / trip.budget > 0.7 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, (totalSpent / trip.budget) * 100)}%` }}
              ></div>
            </div>

            {/* Category analysis summary */}
            <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-[10px]">
              {categories.map((cat) => {
                const spent = getCategorySpent(cat);
                return (
                  <div key={cat} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="font-semibold text-slate-500">{cat}</span>
                    <span className="font-bold text-slate-700">₹{spent.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Packing Checklist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-4.5 h-4.5 text-sky-500" />
              Packing Checklist
            </h3>
            <button
              onClick={() => onSelectTab("Timeline & Checklist")}
              className="text-[10px] text-sky-600 font-bold hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {checklists.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-4">Checklist is empty.</p>
            ) : (
              checklists.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklist(item.id, !item.completed)}
                  className="flex items-center gap-2.5 cursor-pointer text-xs p-2 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 border-slate-300 text-sky-600 focus:ring-sky-500 rounded cursor-pointer"
                  />
                  <span className={`text-[11px] truncate font-medium ${item.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {item.task}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Floating Logout utility in Dev */}
        <button
          onClick={onLogout}
          className="w-full py-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-150 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log Out Session
        </button>
      </div>
    </div>
  );
}

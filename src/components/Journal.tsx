"use client";

import { useState } from "react";
import { BookOpen, Calendar, MapPin, Cloud, Smile, Mic, Square, Trash2, Camera, Play, Volume2 } from "lucide-react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  location?: string;
  weather?: string;
  date: string;
  photos?: string;
  voiceNoteUrl?: string;
}

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (newEntry: any) => void;
  isOnline: boolean;
}

export default function Journal({ entries, onAddEntry, isOnline }: JournalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("Happy");
  const [location, setLocation] = useState("Srinagar, Dal Lake");
  const [weather, setWeather] = useState("Clear, 16°C");
  const [photoUrl, setPhotoUrl] = useState("");

  // Voice note recorder state
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState("");
  const [recordingIntervalId, setRecordingIntervalId] = useState<any>(null);

  const moods = [
    { label: "Happy", icon: "😊", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { label: "Excited", icon: "🤩", color: "bg-sky-50 text-sky-700 border-sky-100" },
    { label: "Tired", icon: "😴", color: "bg-slate-100 text-slate-700 border-slate-200" },
    { label: "Adventurous", icon: "🧗", color: "bg-amber-50 text-amber-700 border-amber-100" },
    { label: "Neutral", icon: "😐", color: "bg-slate-50 text-slate-600 border-slate-150" },
  ];

  const photoPresets = [
    "https://images.unsplash.com/photo-1566837430227-430aa6b2b7b2?auto=format&fit=crop&w=600&q=80", // Dal Lake
    "https://images.unsplash.com/photo-1589136777351-fdc9c9400c7e?auto=format&fit=crop&w=600&q=80", // Gulmarg Snow
    "https://images.unsplash.com/photo-1622616238793-a4e9b986b62d?auto=format&fit=crop&w=600&q=80", // Pahalgam river
  ];

  const handleStartRecording = () => {
    setRecording(true);
    setRecordTime(0);
    setRecordedVoiceUrl("");

    const interval = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);
    setRecordingIntervalId(interval);
  };

  const handleStopRecording = () => {
    if (recordingIntervalId) {
      clearInterval(recordingIntervalId);
    }
    setRecording(false);
    setRecordedVoiceUrl("simulated-audio-file.mp3");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title,
      content,
      mood,
      location,
      weather,
      photos: photoUrl || photoPresets[Math.floor(Math.random() * photoPresets.length)],
      voiceNoteUrl: recordedVoiceUrl || null,
      date: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          onAddEntry(data.entry);
        }
      } catch (err) {
        console.error("Failed to add entry online", err);
      }
    } else {
      // Offline fallback: save locally and add to sync queue
      const mockId = Math.random().toString(36).substring(7);
      const offlineEntry = { ...payload, id: mockId };
      
      onAddEntry(offlineEntry);

      const syncQueue = localStorage.getItem("voyana_sync_queue");
      const queue = syncQueue ? JSON.parse(syncQueue) : [];
      queue.push({
        id: Math.random().toString(),
        url: "/api/journal",
        method: "POST",
        body: payload,
        timestamp: Date.now(),
      });
      localStorage.setItem("voyana_sync_queue", JSON.stringify(queue));
    }

    // Reset Form
    setTitle("");
    setContent("");
    setMood("Happy");
    setPhotoUrl("");
    setRecordedVoiceUrl("");
    setRecordTime(0);
    setShowAddForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] overflow-hidden">
      {/* Journal list */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-500" />
            Travel Memories Journal
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {showAddForm ? "Cancel" : "+ New Entry"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-3xl">📓</span>
              <p className="text-slate-400 text-sm mt-2">Write down your first travel memory!</p>
            </div>
          ) : (
            entries.map((entry) => {
              const activeMood = moods.find((m) => m.label === entry.mood) || moods[4];

              return (
                <div key={entry.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-xs transition-all flex flex-col md:flex-row gap-4 bg-slate-50/50">
                  {/* Photo if present */}
                  {entry.photos && (
                    <div className="md:w-32 md:h-32 w-full h-40 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={entry.photos} alt={entry.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-800">{entry.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeMood.color}`}>
                            {activeMood.icon} {entry.mood}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed whitespace-pre-line">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/50">
                      <div className="flex gap-3 text-[10px] text-slate-400">
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-400" />
                            {entry.location}
                          </span>
                        )}
                        {entry.weather && (
                          <span className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 text-sky-400" />
                            {entry.weather}
                          </span>
                        )}
                      </div>

                      {entry.voiceNoteUrl && (
                        <div className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2 py-1 rounded border border-sky-100 text-[10px] font-semibold cursor-pointer hover:bg-sky-100 transition-colors">
                          <Play className="w-3 h-3 fill-sky-700" />
                          <span>Voice Note Attached</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Write Memory Form */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between overflow-y-auto space-y-4 pr-1">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Smile className="w-4 h-4 text-sky-500" />
                Capture Daily Memory
              </h3>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Entry Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Skiing down phase 2 in Gulmarg"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none focus:border-sky-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">What happened today?</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your feelings, food, sights..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none focus:border-sky-500 bg-slate-50/50 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Mood Today</label>
                <div className="flex flex-wrap gap-1.5">
                  {moods.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(m.label)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        mood === m.label
                          ? "bg-sky-600 border-sky-700 text-white font-semibold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Srinagar"
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Weather</label>
                  <input
                    type="text"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    placeholder="Snowy, -3°C"
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-sky-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Voice Memo Mock Recorder */}
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/70">
                <label className="block text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-sky-500" />
                  Attach Voice Note
                </label>

                {!recording && !recordedVoiceUrl ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="w-full py-2 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-sky-100/70 transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-sky-600 animate-pulse" />
                    Record Voice Memo
                  </button>
                ) : recording ? (
                  <div className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 items-center">
                        <span className="w-1.5 h-3.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-1.5 h-5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-1.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                      <span className="text-[10px] font-bold text-red-700 animate-pulse">RECORDING...</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-800">
                      0:{recordTime < 10 ? `0${recordTime}` : recordTime}
                    </span>
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-semibold">
                      <Volume2 className="w-3.5 h-3.5" />
                      Voice Memo Saved (0:0{recordTime})
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecordedVoiceUrl("")}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Save Memory
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full py-10">
            <BookOpen className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-800">Daily Journaling</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mt-1 mb-6">
              Track your memories, moods, pictures, and voice notes. Safe offline logs are auto-synced.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-sky-50 text-sky-600 font-semibold rounded-lg border border-sky-100 hover:bg-sky-100 transition-all text-xs"
            >
              + Create Today's Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

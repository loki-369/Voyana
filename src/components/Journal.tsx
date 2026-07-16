"use client";

import { useState } from "react";
import { BookOpen, Calendar, MapPin, Cloud, Smile, Mic, Square, Trash2, Play, Volume2, Flame, Moon, Compass, Meh } from "lucide-react";

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
    { label: "Happy", icon: Smile },
    { label: "Excited", icon: Flame },
    { label: "Tired", icon: Moon },
    { label: "Adventurous", icon: Compass },
    { label: "Neutral", icon: Meh },
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
        if (res.ok) {
          const data = await res.json();
          onAddEntry(data.entry);
        }
      } catch (err) {
        console.error("Failed to add entry online", err);
      }
    } else {
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

    setTitle("");
    setContent("");
    setMood("Happy");
    setPhotoUrl("");
    setRecordedVoiceUrl("");
    setRecordTime(0);
    setShowAddForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] overflow-hidden font-sans pb-6">
      {/* Journal list */}
      <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0f766e]" />
            Travel Memories Journal
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-bold bg-neutral-950 hover:bg-neutral-850 text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            {showAddForm ? "View Entries" : "New Entry"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-20 bg-[#faf9f6]/40 border border-neutral-200/60 rounded-xl shadow-inner">
              <span className="text-xl">📓</span>
              <p className="text-neutral-450 text-xs mt-2 font-light">No journal entries logged yet.</p>
            </div>
          ) : (
            entries.map((entry) => {
              const activeMood = moods.find((m) => m.label === entry.mood) || moods[4];
              const ActiveMoodIcon = activeMood.icon;

              return (
                <div key={entry.id} className="premium-card p-4 rounded-xl flex flex-col md:flex-row gap-4">
                  {entry.photos && (
                    <div className="md:w-32 md:h-32 w-full h-40 shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
                      <img src={entry.photos} alt={entry.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-neutral-800">{entry.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] tracking-wide font-bold px-2 py-0.5 rounded-full border border-neutral-200 bg-white text-neutral-600 flex items-center gap-1.5">
                            <ActiveMoodIcon className="w-3.5 h-3.5 text-[#0f766e]" /> {entry.mood}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#0f766e]" />
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed font-light whitespace-pre-line">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t border-neutral-100">
                      <div className="flex gap-3 text-[9px] text-neutral-400 font-medium">
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#0f766e]" />
                            {entry.location}
                          </span>
                        )}
                        {entry.weather && (
                          <span className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 text-amber-600" />
                            {entry.weather}
                          </span>
                        )}
                      </div>

                      {entry.voiceNoteUrl && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-white border border-neutral-200 text-neutral-700 rounded-full text-[8px] font-bold tracking-wider uppercase shadow-sm">
                          <Play className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Voice Attachment</span>
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
      <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
        {showAddForm ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between overflow-y-auto space-y-4 pr-1">
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#0f766e]" />
                Capture Memory
              </h3>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Entry Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Skiing phase 2 in Gulmarg"
                  className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none focus:border-neutral-900 bg-[#faf9f6]/30 font-light"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">What happened today?</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your feelings, sights, food..."
                  className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none focus:border-neutral-900 bg-[#faf9f6]/30 font-light resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Mood Today</label>
                <div className="flex flex-wrap gap-1.5">
                  {moods.map((m) => {
                    const MoodIcon = m.icon;
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setMood(m.label)}
                        className={`text-[9px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                          mood === m.label
                            ? "bg-neutral-950 border-neutral-950 text-white font-bold"
                            : "bg-[#faf9f6] border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                        }`}
                      >
                        <MoodIcon className="w-3.5 h-3.5" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Srinagar"
                    className="w-full text-xs p-2 border border-neutral-250 rounded-lg outline-none focus:border-neutral-900 bg-[#faf9f6]/30 font-light"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Weather</label>
                  <input
                    type="text"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    placeholder="Snowy, -3°C"
                    className="w-full text-xs p-2 border border-neutral-250 rounded-lg outline-none focus:border-neutral-900 bg-[#faf9f6]/30 font-light"
                  />
                </div>
              </div>

              {/* Voice Memo Recorder */}
              <div className="border border-neutral-200 bg-[#faf9f6] rounded-xl p-3 shadow-inner">
                <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[#0f766e]" />
                  Voice Note Memo
                </label>

                {!recording && !recordedVoiceUrl ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="w-full py-2 bg-white border border-neutral-200 hover:border-neutral-800 text-neutral-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Record Voice Note
                  </button>
                ) : recording ? (
                  <div className="flex items-center justify-between p-2 bg-white border border-neutral-200 rounded-lg shadow-sm">
                    <span className="text-[9px] font-bold text-red-650 animate-pulse">RECORDING...</span>
                    <span className="text-xs font-mono font-bold text-neutral-700">
                      0:{recordTime < 10 ? `0${recordTime}` : recordTime}
                    </span>
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="p-1 bg-neutral-950 hover:bg-neutral-850 text-white rounded cursor-pointer"
                    >
                      <Square className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-white border border-neutral-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-1.5 text-neutral-800 text-[10px] font-semibold">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      Saved Memo (0:0{recordTime})
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecordedVoiceUrl("")}
                      className="text-neutral-400 hover:text-red-650 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
            >
              Save Memory
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full py-12">
            <BookOpen className="w-8 h-8 text-neutral-350 mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-450">Memories Ledger</h3>
            <p className="text-[10px] text-neutral-400 leading-relaxed max-w-[200px] mt-2 mb-6 font-light">
              Track your travel memories, emotional state, and voice notes.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
            >
              Create Today's Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

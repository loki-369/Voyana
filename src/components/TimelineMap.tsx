"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Compass, Navigation, Cloud, ArrowRight, CheckCircle2, Trash2 } from "lucide-react";

// Dynamically import map component with no SSR to bypass window reference errors
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200 min-h-[400px]">
      <Compass className="w-10 h-10 text-neutral-400 animate-spin mb-4" />
      <p className="text-neutral-500 text-xs font-semibold">Loading Interactive Maps...</p>
    </div>
  ),
});

interface DestinationNode {
  id: string;
  name: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  gpsCoordinates?: string; // "lat,lng"
  weather?: string;
  distanceTraveled?: number;
  notes?: string;
  visitedDate?: string;
}

interface TimelineMapProps {
  trip: any;
  onUpdateTrip: (updatedTrip: any) => void;
  isOnline: boolean;
}

export default function TimelineMap({ trip, onUpdateTrip, isOnline }: TimelineMapProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newCoords, setNewCoords] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newWeather, setNewWeather] = useState("Clear, 22°C");
  const [newDistance, setNewDistance] = useState("0");

  // Map Filter Options
  const [showHospitals, setShowHospitals] = useState(false);
  const [showPolice, setShowPolice] = useState(false);
  const [showHotels, setShowHotels] = useState(false);
  const [showTaxis, setShowTaxis] = useState(false);

  const destinations: DestinationNode[] = trip?.destinations || [];

  const parseCoordinates = (coordStr?: string): [number, number] => {
    if (!coordStr) return [34.0837, 74.7973]; // Srinagar center default
    const parts = coordStr.split(",");
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    return isNaN(lat) || isNaN(lng) ? [34.0837, 74.7973] : [lat, lng];
  };

  const getMapPins = () => {
    const pins: any[] = [];

    // 1. Destination timeline pins
    destinations.forEach((node) => {
      if (!node.gpsCoordinates) return;
      const [lat, lng] = parseCoordinates(node.gpsCoordinates);
      pins.push({
        id: node.id,
        name: node.name,
        lat,
        lng,
        status: node.status,
        category: "Destination",
      });
    });

    if (showHospitals) {
      pins.push(
        { id: "hosp1", name: "SMHS General Hospital", lat: 34.0925, lng: 74.8012, category: "Hospital" },
        { id: "hosp2", name: "Kashmir Medical Center", lat: 34.0805, lng: 74.8145, category: "Hospital" },
        { id: "hosp3", name: "Gulmarg Emergency Hospital", lat: 34.0494, lng: 74.3855, category: "Hospital" }
      );
    }

    if (showPolice) {
      pins.push(
        { id: "pol1", name: "Srinagar Police HQ", lat: 34.0725, lng: 74.7932, category: "Police" },
        { id: "pol2", name: "Gulmarg Tourist Police Post", lat: 34.0512, lng: 74.3792, category: "Police" }
      );
    }

    if (showHotels) {
      pins.push(
        { id: "hotel1", name: "Golden Crest Houseboat", lat: 34.0855, lng: 74.8212, category: "Hotel" },
        { id: "hotel2", name: "The Khyber Resort & Spa", lat: 34.0465, lng: 74.3912, category: "Hotel" },
        { id: "hotel3", name: "Pahalgam Pine Retreat", lat: 34.0155, lng: 75.3112, category: "Hotel" }
      );
    }

    if (showTaxis) {
      pins.push(
        { id: "taxi1", name: "Cab Innova (Manzoor Dar)", lat: 34.0812, lng: 74.8099, category: "Taxi" },
        { id: "taxi2", name: "Taxi Hatchback (Fayaz)", lat: 34.0755, lng: 74.8152, category: "Taxi" },
        { id: "taxi3", name: "Snow Jeep 4x4 (Bilal)", lat: 34.0445, lng: 74.3832, category: "Taxi" }
      );
    }

    return pins;
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const coords = newCoords.trim() || `34.${Math.floor(Math.random() * 9000 + 1000)},74.${Math.floor(Math.random() * 9000 + 1000)}`;

    const payload = {
      name: newNodeName,
      status: "UPCOMING",
      gpsCoordinates: coords,
      notes: newNotes,
      weather: newWeather,
      distanceTraveled: parseFloat(newDistance) || 0,
    };

    if (isOnline) {
      try {
        const res = await fetch(`/api/trips/${trip.id}/destination`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          onUpdateTrip({
            ...trip,
            destinations: [...destinations, data.destination],
          });
        }
      } catch (err) {
        console.error("Error creating destination online:", err);
      }
    } else {
      const mockId = Math.random().toString(36).substring(7);
      const newOfflineNode = { ...payload, id: mockId, tripId: trip.id };
      
      onUpdateTrip({
        ...trip,
        destinations: [...destinations, newOfflineNode],
      });

      const syncQueue = localStorage.getItem("voyana_sync_queue");
      const queue = syncQueue ? JSON.parse(syncQueue) : [];
      queue.push({
        id: Math.random().toString(),
        url: `/api/trips/${trip.id}/destination`,
        method: "POST",
        body: payload,
        timestamp: Date.now(),
      });
      localStorage.setItem("voyana_sync_queue", JSON.stringify(queue));
    }

    setNewNodeName("");
    setNewCoords("");
    setNewNotes("");
    setNewDistance("0");
    setShowAddForm(false);
  };

  const handleToggleStatus = async (nodeId: string, currentStatus: string) => {
    let nextStatus: "COMPLETED" | "CURRENT" | "UPCOMING" = "UPCOMING";
    if (currentStatus === "UPCOMING") nextStatus = "CURRENT";
    else if (currentStatus === "CURRENT") nextStatus = "COMPLETED";

    const payload = {
      destinationId: nodeId,
      status: nextStatus,
      visitedDate: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
    };

    if (isOnline) {
      try {
        const res = await fetch(`/api/trips/${trip.id}/destination`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          onUpdateTrip({
            ...trip,
            destinations: destinations.map((d) => (d.id === nodeId ? data.destination : d)),
          });
        }
      } catch (err) {
        console.error("Error toggling destination status:", err);
      }
    } else {
      const updatedDestinations = destinations.map((d) => {
        if (d.id === nodeId) {
          return {
            ...d,
            status: nextStatus,
            visitedDate: nextStatus === "COMPLETED" ? new Date().toISOString() : undefined,
          };
        }
        return d;
      });

      onUpdateTrip({
        ...trip,
        destinations: updatedDestinations,
      });

      const syncQueue = localStorage.getItem("voyana_sync_queue");
      const queue = syncQueue ? JSON.parse(syncQueue) : [];
      queue.push({
        id: Math.random().toString(),
        url: `/api/trips/${trip.id}/destination`,
        method: "PUT",
        body: payload,
        timestamp: Date.now(),
      });
      localStorage.setItem("voyana_sync_queue", JSON.stringify(queue));
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (isOnline) {
      try {
        const res = await fetch(`/api/trips/${trip.id}/destination`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationId: nodeId }),
        });
        if (res.ok) {
          onUpdateTrip({
            ...trip,
            destinations: destinations.filter((d) => d.id !== nodeId),
          });
        }
      } catch (err) {
        console.error("Error deleting destination:", err);
      }
    } else {
      onUpdateTrip({
        ...trip,
        destinations: destinations.filter((d) => d.id !== nodeId),
      });

      const syncQueue = localStorage.getItem("voyana_sync_queue");
      const queue = syncQueue ? JSON.parse(syncQueue) : [];
      queue.push({
        id: Math.random().toString(),
        url: `/api/trips/${trip.id}/destination`,
        method: "DELETE",
        body: { destinationId: nodeId },
        timestamp: Date.now(),
      });
      localStorage.setItem("voyana_sync_queue", JSON.stringify(queue));
    }
  };

  const mapCenter = destinations.length > 0 && destinations[0].gpsCoordinates
    ? parseCoordinates(destinations[0].gpsCoordinates)
    : ([34.0837, 74.7973] as [number, number]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] font-sans pb-6">
      {/* Route Timeline list */}
      <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
            Route Timeline
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1 border border-neutral-200 hover:border-neutral-800 rounded-lg text-[10px] font-bold transition-all cursor-pointer bg-white shadow-sm"
          >
            {showAddForm ? "Cancel" : "Add Stop"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddNode} className="mb-4 p-4 border border-neutral-200/80 bg-[#faf9f6] rounded-xl space-y-3 shadow-inner">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">New Timeline Stop</h3>
            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Stop Name</label>
              <input
                required
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="e.g. Sonmarg Glacier"
                className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white outline-none focus:border-neutral-900 transition-all font-light"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">GPS (Lat,Lng)</label>
                <input
                  type="text"
                  value={newCoords}
                  onChange={(e) => setNewCoords(e.target.value)}
                  placeholder="34.0837,74.7973"
                  className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white outline-none focus:border-neutral-900 transition-all font-light"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Distance (km)</label>
                <input
                  type="number"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  placeholder="80"
                  className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white outline-none focus:border-neutral-900 transition-all font-light"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Weather</label>
                <input
                  type="text"
                  value={newWeather}
                  onChange={(e) => setNewWeather(e.target.value)}
                  placeholder="Sunny, 18°C"
                  className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white outline-none focus:border-neutral-900 transition-all font-light"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full text-xs py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Create Stop
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 relative timeline-line">
          {destinations.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-10 h-10 text-neutral-350 mx-auto mb-2" />
              <p className="text-neutral-400 text-xs">No stops created yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-xs font-semibold text-neutral-900 hover:underline"
              >
                + Add itinerary stop
              </button>
            </div>
          ) : (
            destinations.map((node, index) => {
              const isCompleted = node.status === "COMPLETED";
              const isCurrent = node.status === "CURRENT";

              return (
                <div key={node.id} className="relative pl-8 flex items-start gap-3 group">
                  {/* Timeline point indicator */}
                  <div
                    onClick={() => handleToggleStatus(node.id, node.status)}
                    className={`absolute left-0 top-1 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-all z-10 ${
                      isCompleted
                        ? "bg-neutral-100 border-neutral-300 text-neutral-500 hover:bg-neutral-200"
                        : isCurrent
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                        : "bg-white border-neutral-300 text-neutral-500 hover:border-neutral-900"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                    ) : (
                      <span className="text-[9px] font-bold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 bg-[#faf9f6]/40 hover:bg-[#faf9f6]/80 p-3.5 rounded-lg transition-all border border-neutral-200/50 hover:border-neutral-300">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className={`text-xs font-bold truncate ${isCompleted ? "line-through text-neutral-400" : "text-neutral-800"}`}>
                        {node.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteNode(node.id)}
                        className="text-neutral-350 hover:text-red-650 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {node.weather && (
                        <span className="text-[8px] bg-white border border-neutral-200 text-neutral-550 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Cloud className="w-2.5 h-2.5 text-[#0f766e]" /> {node.weather}
                        </span>
                      )}
                      {node.distanceTraveled !== undefined && node.distanceTraveled > 0 && (
                        <span className="text-[8px] bg-white border border-neutral-200 text-neutral-550 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ArrowRight className="w-2.5 h-2.5 text-amber-650" /> {node.distanceTraveled} km
                        </span>
                      )}
                      <span
                        className={`text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? "bg-neutral-100 border-neutral-200 text-neutral-500"
                            : isCurrent
                            ? "bg-amber-100 border-amber-200 text-amber-800"
                            : "bg-white border-neutral-200 text-neutral-600"
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    {node.notes && (
                      <p className="text-[10px] text-neutral-500 mt-2 bg-white/70 p-2 rounded-lg border border-neutral-200/30 leading-relaxed font-light">
                        {node.notes}
                      </p>
                    )}
                    {node.visitedDate && (
                      <span className="text-[8px] text-neutral-400 block mt-1.5 font-light">
                        Completed: {new Date(node.visitedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map Column */}
      <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
        {/* Map Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4 bg-[#faf9f6] p-2.5 rounded-xl border border-neutral-200/50 shadow-inner">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 flex items-center gap-1.5 mr-2 pl-1">
            Filter View:
          </span>
          <button
            onClick={() => setShowTaxis(!showTaxis)}
            className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
              showTaxis
                ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                : "bg-white border-neutral-200 text-neutral-500 hover:bg-white/80"
            }`}
          >
            Nearby Taxis
          </button>
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
              showHospitals
                ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                : "bg-white border-neutral-200 text-neutral-500 hover:bg-white/80"
            }`}
          >
            Hospitals
          </button>
          <button
            onClick={() => setShowPolice(!showPolice)}
            className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
              showPolice
                ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                : "bg-white border-neutral-200 text-neutral-500 hover:bg-white/80"
            }`}
          >
            Police Posts
          </button>
          <button
            onClick={() => setShowHotels(!showHotels)}
            className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-lg border transition-all cursor-pointer ${
              showHotels
                ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                : "bg-white border-neutral-200 text-neutral-500 hover:bg-white/80"
            }`}
          >
            Hotels
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full rounded-xl border border-neutral-200/80 overflow-hidden relative min-h-[400px]">
          <MapComponent pins={getMapPins()} center={mapCenter} zoom={11} />
        </div>
      </div>
    </div>
  );
}

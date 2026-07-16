"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Plus, Compass, Navigation, Shield, Cloud, ArrowRight, CheckCircle2, Trash2 } from "lucide-react";

// Dynamically import map component with no SSR to bypass window reference errors
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
      <Compass className="w-12 h-12 text-sky-500 animate-spin mb-4" />
      <p className="text-slate-500 text-sm">Loading Interactive Map...</p>
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

  // Parse GPS coordinates helper
  const parseCoordinates = (coordStr?: string): [number, number] => {
    if (!coordStr) return [34.0837, 74.7973]; // Srinagar center default
    const parts = coordStr.split(",");
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    return isNaN(lat) || isNaN(lng) ? [34.0837, 74.7973] : [lat, lng];
  };

  // Compile pins for Map rendering
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

    // 2. Overlay Hospital pins (simulated around Srinagar/Gulmarg)
    if (showHospitals) {
      pins.push(
        { id: "hosp1", name: "SMHS General Hospital", lat: 34.0925, lng: 74.8012, category: "Hospital" },
        { id: "hosp2", name: "Kashmir Medical Center", lat: 34.0805, lng: 74.8145, category: "Hospital" },
        { id: "hosp3", name: "Gulmarg Emergency Hospital", lat: 34.0494, lng: 74.3855, category: "Hospital" }
      );
    }

    // 3. Overlay Police pins
    if (showPolice) {
      pins.push(
        { id: "pol1", name: "Srinagar Police HQ", lat: 34.0725, lng: 74.7932, category: "Police" },
        { id: "pol2", name: "Gulmarg Tourist Police Post", lat: 34.0512, lng: 74.3792, category: "Police" }
      );
    }

    // 4. Overlay Hotels
    if (showHotels) {
      pins.push(
        { id: "hotel1", name: "Golden Crest Houseboat", lat: 34.0855, lng: 74.8212, category: "Hotel" },
        { id: "hotel2", name: "The Khyber Resort & Spa", lat: 34.0465, lng: 74.3912, category: "Hotel" },
        { id: "hotel3", name: "Pahalgam Pine Retreat", lat: 34.0155, lng: 75.3112, category: "Hotel" }
      );
    }

    // 5. Overlay Driver taxis
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

    // Default coordinates in J&K if empty
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
        const data = await res.json();
        if (res.ok) {
          onUpdateTrip({
            ...trip,
            destinations: [...destinations, data.destination],
          });
        }
      } catch (err) {
        console.error("Error creating destination online:", err);
      }
    } else {
      // Offline fallback: save locally and add to sync queue
      const mockId = Math.random().toString(36).substring(7);
      const newOfflineNode = { ...payload, id: mockId, tripId: trip.id };
      
      // Save local memory
      onUpdateTrip({
        ...trip,
        destinations: [...destinations, newOfflineNode],
      });

      // Queue action
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

    // Reset forms
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
        const data = await res.json();
        if (res.ok) {
          onUpdateTrip({
            ...trip,
            destinations: destinations.map((d) => (d.id === nodeId ? data.destination : d)),
          });
        }
      } catch (err) {
        console.error("Error toggling destination status:", err);
      }
    } else {
      // Offline edit
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh]">
      {/* Route Timeline list */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-sky-500" />
            Route Timeline
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddNode} className="mb-4 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Timeline Node</h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                required
                type="text"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="e.g. Sonmarg Glacier"
                className="w-full text-sm p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">GPS (Lat,Lng)</label>
                <input
                  type="text"
                  value={newCoords}
                  onChange={(e) => setNewCoords(e.target.value)}
                  placeholder="34.0837,74.7973"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Dist (km)</label>
                <input
                  type="number"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  placeholder="80"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Weather</label>
                <input
                  type="text"
                  value={newWeather}
                  onChange={(e) => setNewWeather(e.target.value)}
                  placeholder="Sunny, 18°C"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full text-xs py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Add Node
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 relative timeline-line">
          {destinations.length === 0 ? (
            <div className="text-center py-10">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-2 animate-pulse" />
              <p className="text-slate-400 text-sm">No routes created yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
              >
                + Add entry point
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
                    className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all z-10 ${
                      isCompleted
                        ? "bg-slate-100 border-slate-400 text-slate-500"
                        : isCurrent
                        ? "bg-sky-500 border-sky-600 text-white animate-pulse"
                        : "bg-white border-sky-400 text-sky-500 hover:bg-sky-50"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 bg-slate-50 group-hover:bg-slate-100/70 p-3 rounded-xl transition-all border border-slate-100">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className={`text-sm font-semibold truncate ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {node.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteNode(node.id)}
                        className="text-slate-300 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {node.weather && (
                        <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <Cloud className="w-2.5 h-2.5" /> {node.weather}
                        </span>
                      )}
                      {node.distanceTraveled !== undefined && node.distanceTraveled > 0 && (
                        <span className="text-[10px] bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <ArrowRight className="w-2.5 h-2.5" /> {node.distanceTraveled} km
                        </span>
                      )}
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider ${
                          isCompleted
                            ? "bg-slate-200 text-slate-500"
                            : isCurrent
                            ? "bg-sky-500 text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>

                    {node.notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-white/70 p-1.5 rounded border border-slate-100/50 leading-relaxed">
                        {node.notes}
                      </p>
                    )}
                    {node.visitedDate && (
                      <span className="text-[9px] text-slate-400 block mt-1.5">
                        Visited: {new Date(node.visitedDate).toLocaleDateString()}
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
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
        {/* Map Filters */}
        <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-2">
            <Compass className="w-4 h-4 text-sky-500" />
            Explore Nearby:
          </span>
          <button
            onClick={() => setShowTaxis(!showTaxis)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              showTaxis
                ? "bg-emerald-500 border-emerald-600 text-white font-semibold shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            🚕 Nearby Taxis
          </button>
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              showHospitals
                ? "bg-red-500 border-red-600 text-white font-semibold shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            🏥 Hospitals
          </button>
          <button
            onClick={() => setShowPolice(!showPolice)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              showPolice
                ? "bg-slate-800 border-slate-900 text-white font-semibold shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            👮 Police Stations
          </button>
          <button
            onClick={() => setShowHotels(!showHotels)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              showHotels
                ? "bg-amber-500 border-amber-600 text-white font-semibold shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            🏨 Hotels
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full rounded-xl border border-slate-200 overflow-hidden relative min-h-[400px]">
          <MapComponent pins={getMapPins()} center={mapCenter} zoom={11} />
        </div>
      </div>
    </div>
  );
}

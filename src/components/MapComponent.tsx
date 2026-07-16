"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status?: string; // COMPLETED, CURRENT, UPCOMING
  category?: string; // Destination, Hospital, Police, Hotel, Taxi
}

interface MapComponentProps {
  pins: MapPin[];
  center: [number, number];
  zoom?: number;
}

export default function MapComponent({ pins, center, zoom = 10 }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView(center, zoom);
    }

    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Set custom icon templates
    const getIcon = (category?: string, status?: string) => {
      let color = "#3b82f6"; // Blue (default)
      if (category === "Hospital") color = "#ef4444"; // Red
      else if (category === "Police") color = "#1e293b"; // Dark Slate
      else if (category === "Hotel") color = "#eab308"; // Yellow
      else if (category === "Taxi") color = "#10b981"; // Green
      else if (status === "COMPLETED") color = "#94a3b8"; // Slate Gray
      else if (status === "CURRENT") color = "#0284c7"; // Sky Blue

      return L.divIcon({
        className: "custom-marker-icon",
        html: `
          <div style="
            width: 28px; 
            height: 28px; 
            background: ${color}; 
            border: 2px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          ">
            <span style="color: white; font-size: 11px; font-weight: bold;">
              ${category === "Hospital" ? "🏥" : category === "Police" ? "👮" : category === "Hotel" ? "🏨" : category === "Taxi" ? "🚕" : "📍"}
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // Add markers
    const coords: [number, number][] = [];
    pins.forEach((pin) => {
      if (isNaN(pin.lat) || isNaN(pin.lng)) return;

      const marker = L.marker([pin.lat, pin.lng], {
        icon: getIcon(pin.category, pin.status),
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 2px;">
            <strong style="font-size: 14px;">${pin.name}</strong>
            ${pin.category ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px;">${pin.category}</div>` : ""}
            ${pin.status ? `<div style="font-size: 11px; margin-top: 4px; font-weight: bold; color: ${pin.status === "CURRENT" ? "#0284c7" : pin.status === "COMPLETED" ? "#64748b" : "#10b981"}">${pin.status}</div>` : ""}
          </div>
        `);

      markersRef.current.push(marker);

      // Only draw route line between destination/timeline markers
      if (!pin.category || pin.category === "Destination") {
        coords.push([pin.lat, pin.lng]);
      }
    });

    // Draw route lines connecting destinations
    if (coords.length > 1) {
      const polyline = L.polyline(coords, {
        color: "#0284c7",
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.8,
      }).addTo(map);
      polylineRef.current = polyline;

      // Fit map to bounds of path
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      // Cleanup effect
    };
  }, [pins, center, zoom]);

  return <div ref={mapContainerRef} className="w-full h-full relative" style={{ minHeight: "400px" }} />;
}

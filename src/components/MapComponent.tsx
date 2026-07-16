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
      let color = "#0f766e"; // Kashmiri Pine Emerald (default)
      if (category === "Hospital") color = "#e11d48"; // Rose Red
      else if (category === "Police") color = "#1e293b"; // Dark Slate
      else if (category === "Hotel") color = "#b45309"; // Gold/Amber
      else if (category === "Taxi") color = "#10b981"; // Emerald Green
      else if (status === "COMPLETED") color = "#78716c"; // Muted Stone
      else if (status === "CURRENT") color = "#b45309"; // Saffron Gold for active stop

      let svgIcon = "";
      if (category === "Hospital") {
        svgIcon = `<svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;
      } else if (category === "Police") {
        svgIcon = `<svg style="width: 13px; height: 13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      } else if (category === "Hotel") {
        svgIcon = `<svg style="width: 13px; height: 13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12M3 11h18M11 15h2"/></svg>`;
      } else if (category === "Taxi") {
        svgIcon = `<svg style="width: 13px; height: 13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="15" cy="17" r="2"/></svg>`;
      } else {
        svgIcon = `<svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>`;
      }

      return L.divIcon({
        className: "custom-marker-icon",
        html: `
          <div style="
            width: 26px; 
            height: 26px; 
            background: ${color}; 
            border: 2px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            color: white;
          ">
            ${svgIcon}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
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

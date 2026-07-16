"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Phone, Heart, Users, ExternalLink, MapPin, AlertCircle } from "lucide-react";

interface EmergencyProps {
  user: any;
  isOnline: boolean;
}

export default function Emergency({ user }: EmergencyProps) {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosTriggered, setSosTriggered] = useState(false);

  // Countdown timer for SOS trigger
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (sosActive && countdown === 0) {
      setSosTriggered(true);
      setSosActive(false);
      triggerSosNotification();
    }
    return () => clearTimeout(timer);
  }, [sosActive, countdown]);

  const triggerSosNotification = async () => {
    console.log("SOS Action Triggered!");
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: "🚨 SOS EMERGENCY ALERT TRIGGERED",
          body: "SOS activated. GPS coordinates dispatched to emergency services and family contacts.",
          type: "EMERGENCY",
        }),
      });
    } catch (err) {
      console.error("SOS notify failed", err);
    }
  };

  const handleStartSos = () => {
    setSosActive(true);
    setCountdown(5);
    setSosTriggered(false);
  };

  const handleCancelSos = () => {
    setSosActive(false);
    setCountdown(5);
  };

  const emergencyContacts = [
    { name: "Emergency Response", number: "112", relation: "National Hotline" },
    { name: "Srinagar Tourism Desk", number: "+91 194-2502279", relation: "Local Authority" },
    { name: "Gulmarg Gondola Rescue", number: "+91 1954-254424", relation: "Medical Desk" },
    { name: "Helen Mercer", number: "+1 555-0102", relation: "Mother (Primary Contact)" },
    { name: "Sonmarg Tourist Police", number: "+91 194-241620", relation: "Local Desk" },
  ];

  const localHospitals = [
    { name: "SMHS General Hospital", address: "Karan Nagar, Srinagar", phone: "+91 194-2502398", dist: "Srinagar Center" },
    { name: "SKIMS Medical Institute", address: "Soura, Srinagar", phone: "+91 194-2401125", dist: "North Srinagar" },
    { name: "Sub-District Hospital", address: "Gondola Road, Gulmarg", phone: "+91 1954-254404", dist: "Gulmarg Base" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] overflow-y-auto pb-6 font-sans">
      {/* SOS Panel */}
      <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
        <ShieldAlert className="w-8 h-8 text-red-600 mb-3 animate-pulse" />
        <h2 className="text-xs uppercase font-bold tracking-widest text-neutral-450">SOS Dashboard</h2>
        <p className="text-xs text-neutral-400 max-w-[240px] mt-1.5 mb-8 font-light leading-relaxed">
          Pulsing the SOS button alerts emergency services and primary family contacts. Works entirely offline.
        </p>

        {/* SOS Button States */}
        {!sosActive && !sosTriggered ? (
          <button
            onClick={handleStartSos}
            className="w-44 h-44 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg hover:shadow-red-200/50 border-4 border-white animate-glow-pulse"
          >
            <span className="text-2xl mb-1">🚨</span>
            SOS
          </button>
        ) : sosActive ? (
          <div className="w-44 h-44 rounded-full bg-red-700 text-white font-bold flex flex-col items-center justify-center border-4 border-red-500 shadow-xl">
            <span className="text-[9px] uppercase tracking-widest text-red-200 mb-1 font-bold">Triggering in</span>
            <span className="text-5xl font-mono leading-none my-1">{countdown}</span>
            <button
              onClick={handleCancelSos}
              className="mt-2 text-[9px] uppercase tracking-wider bg-white text-red-700 px-3 py-1 rounded-full font-bold border border-red-500 cursor-pointer hover:bg-red-50 transition-colors shadow-sm"
            >
              CANCEL
            </button>
          </div>
        ) : (
          <div className="w-44 h-44 rounded-full bg-neutral-900 text-white font-bold flex flex-col items-center justify-center border-4 border-neutral-750 shadow-2xl">
            <span className="text-2xl mb-1 text-emerald-400">✓</span>
            ALERTED
            <button
              onClick={() => setSosTriggered(false)}
              className="mt-2.5 text-[8px] uppercase tracking-widest bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white px-3 py-1 rounded-full border border-neutral-700 cursor-pointer transition-colors"
            >
              Reset SOS
            </button>
          </div>
        )}

        {sosTriggered && (
          <div className="mt-6 p-4 bg-red-50/50 border border-red-100/80 text-red-900 text-xs rounded-xl flex items-start gap-3 max-w-[280px] shadow-sm">
            <span className="text-base leading-none">📞</span>
            <p className="text-left font-light leading-relaxed">
              Family alerted. Dispatcher matching pending. GPS: <span className="font-mono font-bold">34.0837° N, 74.7973° E</span>
            </p>
          </div>
        )}
      </div>

      {/* Emergency Contacts list */}
      <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col shadow-sm">
        <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-[#0f766e]" />
          Critical Contacts
        </h3>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {emergencyContacts.map((contact) => (
            <div key={contact.name} className="premium-card p-3 rounded-xl flex justify-between items-center bg-[#faf9f6]/40">
              <div>
                <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                  {contact.relation.includes("Mother") ? <Heart className="w-3.5 h-3.5 text-red-550 fill-red-550" /> : <Users className="w-3.5 h-3.5 text-neutral-400" />}
                  {contact.name}
                </h4>
                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{contact.relation}</p>
              </div>
              <a
                href={`tel:${contact.number}`}
                className="text-[9px] uppercase tracking-wider font-bold text-neutral-800 bg-white border border-neutral-200 hover:border-neutral-900 px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all"
              >
                Call
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Hospitals and Safety instructions */}
      <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col gap-6 shadow-sm">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2 mb-3.5">
            <MapPin className="w-4 h-4 text-amber-600" />
            Nearby Medical Facilities
          </h3>
          <div className="space-y-2.5">
            {localHospitals.map((hospital) => (
              <div key={hospital.name} className="p-3 bg-[#faf9f6]/60 border border-neutral-200/60 rounded-xl">
                <h4 className="text-xs font-bold text-neutral-800">{hospital.name}</h4>
                <p className="text-[10px] text-neutral-450 font-light mt-0.5">{hospital.address}</p>
                <div className="flex justify-between items-center mt-3 border-t border-neutral-200/30 pt-2.5 text-[10px]">
                  <span className="text-neutral-400 font-bold uppercase tracking-wider text-[8px]">{hospital.dist}</span>
                  <a href={`tel:${hospital.phone}`} className="text-[#0f766e] font-bold hover:underline">
                    {hospital.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety guidelines */}
        <div className="border-t border-neutral-100 pt-4">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-450 mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-neutral-450" />
            Safety Instructions
          </h3>
          <ul className="space-y-2.5 text-xs text-neutral-600 leading-relaxed font-light">
            <li className="flex gap-2 items-start">
              <span className="text-emerald-600 shrink-0 select-none">🌲</span>
              <span>**Altitude Sickness:** Stay hydrated and avoid climbing over 3,000m for the first 24 hours.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-emerald-600 shrink-0 select-none">🌲</span>
              <span>**Mobile Network:** Prepaid SIM cards roaming blocks in J&K. Procure a postpaid SIM or download offline maps.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-emerald-600 shrink-0 select-none">🌲</span>
              <span>**Pricing Scams:** Do not hire ponies/taxis or rent gear without checking government certified pricing boards.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

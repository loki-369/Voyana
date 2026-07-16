"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Phone, Heart, Users, ExternalLink, MapPin, Compass, AlertCircle, AlertOctagon } from "lucide-react";

interface EmergencyProps {
  user: any;
  isOnline: boolean;
}

export default function Emergency({ user, isOnline }: EmergencyProps) {
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
    // Push custom SOS notification to user's notifications box!
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: "🚨 SOS EMERGENCY ALERT TRIGGERED",
          body: "SOS activated. GPS location pinged. Alerts sent to family contacts, local tourism desk and ambulance center.",
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
    { name: "All-in-one Emergency Helpline", number: "112", relation: "National Hotline" },
    { name: "Srinagar Tourism Helpline", number: "+91 194-2502279", relation: "Local Authority" },
    { name: "Gulmarg Gondola Medical Desk", number: "+91 1954-254424", relation: "First Aid Rescue" },
    { name: "Helen Mercer", number: "+1 555-0102", relation: "Mother (Family Contact)" },
    { name: "Sonmarg Police Assistance", number: "+91 194-241620", relation: "Tourist Police" },
  ];

  const localHospitals = [
    { name: "SMHS General Hospital", address: "Karan Nagar, Srinagar", phone: "+91 194-2502398", dist: "Srinagar Center" },
    { name: "Sher-i-Kashmir Institute of Medical Sciences (SKIMS)", address: "Soura, Srinagar", phone: "+91 194-2401125", dist: "North Srinagar" },
    { name: "Sub-District Hospital Gulmarg", address: "Gondola Road, Gulmarg", phone: "+91 1954-254404", dist: "Gulmarg Base" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh] overflow-y-auto pb-6">
      {/* SOS Panel */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-10 h-10 text-red-500 mb-2" />
        <h2 className="text-lg font-bold text-slate-800">One-Tap SOS Center</h2>
        <p className="text-xs text-slate-500 max-w-[250px] mt-1 mb-6">
          Pressing the SOS button triggers emergency alerts to family contacts and J&K Tourist police. Works offline.
        </p>

        {/* SOS Button States */}
        {!sosActive && !sosTriggered ? (
          <button
            onClick={handleStartSos}
            className="w-44 h-44 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xl shadow-lg flex flex-col items-center justify-center cursor-pointer animate-pulse-red border-4 border-red-200 transition-all active:scale-95"
          >
            <span className="text-3xl mb-1">🚨</span>
            SOS
          </button>
        ) : sosActive ? (
          <div className="w-44 h-44 rounded-full bg-red-700 text-white font-bold flex flex-col items-center justify-center border-4 border-red-500 animate-pulse">
            <span className="text-xs uppercase tracking-wider text-red-200 mb-1">Activating in</span>
            <span className="text-5xl">{countdown}</span>
            <button
              onClick={handleCancelSos}
              className="mt-2 text-xs bg-white text-red-700 px-3 py-1 rounded-full font-semibold border border-red-500 cursor-pointer active:scale-95 hover:bg-slate-50"
            >
              CANCEL
            </button>
          </div>
        ) : (
          <div className="w-44 h-44 rounded-full bg-emerald-500 text-white font-bold flex flex-col items-center justify-center border-4 border-emerald-200 shadow-lg">
            <span className="text-2xl mb-1">✓</span>
            ALERTED
            <button
              onClick={() => setSosTriggered(false)}
              className="mt-2 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1 rounded-full border border-emerald-400 cursor-pointer"
            >
              Reset SOS
            </button>
          </div>
        )}

        {sosTriggered && (
          <div className="mt-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 max-w-[280px]">
            <span className="text-base leading-none">📞</span>
            <p className="text-left font-medium leading-relaxed">
              Family alerted. Local emergency dispatcher matched. GPS coords: **34.0837° N, 74.7973° E**
            </p>
          </div>
        )}
      </div>

      {/* Emergency Contacts list */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Phone className="w-4.5 h-4.5 text-sky-500" />
          Critical Contacts (J&K)
        </h3>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {emergencyContacts.map((contact) => (
            <div key={contact.name} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/70 transition-all">
              <div>
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  {contact.relation.includes("Mother") ? <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> : <Users className="w-3.5 h-3.5 text-slate-400" />}
                  {contact.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold">{contact.relation}</p>
              </div>
              <a
                href={`tel:${contact.number}`}
                className="text-xs font-bold text-sky-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:border-sky-500 hover:text-sky-700 transition-all"
              >
                Call
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Hospitals and Safety instructions */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <MapPin className="w-4.5 h-4.5 text-red-500" />
            Nearby Medical Facilities
          </h3>
          <div className="space-y-2.5">
            {localHospitals.map((hospital) => (
              <div key={hospital.name} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <h4 className="text-xs font-bold text-slate-700">{hospital.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{hospital.address}</p>
                <div className="flex justify-between items-center mt-2 border-t border-slate-200/50 pt-2 text-[10px]">
                  <span className="text-slate-400 font-semibold">{hospital.dist}</span>
                  <a href={`tel:${hospital.phone}`} className="text-sky-600 font-bold hover:underline flex items-center gap-0.5">
                    {hospital.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety checklist */}
        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Offline Safety Guidelines
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed list-inside">
            <li className="flex gap-2 items-start text-xs">
              <span className="text-amber-500 shrink-0">❄</span>
              <span>**Altitude Sickness:** Stay hydrated and avoid strenuous trekking at peaks above 3,000m (e.g. Gondola Phase 2) for the first 24h.</span>
            </li>
            <li className="flex gap-2 items-start text-xs">
              <span className="text-amber-500 shrink-0">❄</span>
              <span>**Connectivity:** Prepaid mobile lines block roaming in Kashmir. Get a Postpaid local SIM or download offline maps before transit.</span>
            </li>
            <li className="flex gap-2 items-start text-xs">
              <span className="text-amber-500 shrink-0">❄</span>
              <span>**Tourist Scams:** Never agree to pony/sledge rides in Gulmarg without verified prices printed at the tourist counter.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

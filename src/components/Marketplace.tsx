"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShoppingCart, CheckCircle2, PhoneCall, Info, Car } from "lucide-react";

interface MarketplaceProps {
  user: any;
  isOnline: boolean;
  onAddExpense?: (newExpense: any) => void;
  onAddNotification?: (newNotify: any) => void;
}

export default function Marketplace({ isOnline, onAddExpense, onAddNotification }: MarketplaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<"guides" | "rentals" | "taxi">("guides");

  // 1. Guides State
  const [guides, setGuides] = useState<any[]>([]);
  const [bookingGuideId, setBookingGuideId] = useState<string | null>(null);
  const [guideStartDate, setGuideStartDate] = useState("");
  const [guideEndDate, setGuideEndDate] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // 2. Rentals State
  const [rentalItems, setRentalItems] = useState<any[]>([]);
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [rentStartDate, setRentStartDate] = useState("");
  const [rentEndDate, setRentEndDate] = useState("");
  const [rentalSuccess, setRentalSuccess] = useState(false);

  // 3. Taxi State
  const [pickup, setPickup] = useState("Golden Crest Houseboat, Dal Lake");
  const [drop, setDrop] = useState("Gulmarg Gondola Base");
  const [vehicle, setVehicle] = useState("SUV");
  const [taxiBooking, setTaxiBooking] = useState<any>(null);
  const [taxiMatching, setTaxiMatching] = useState(false);
  const [taxiOtpInput, setTaxiOtpInput] = useState("");
  const [taxiError, setTaxiError] = useState("");

  // Load Marketplace content on mounts
  useEffect(() => {
    fetchGuides();
    fetchRentals();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await fetch("/api/marketplace/guides");
      if (res.ok) {
        const data = await res.json();
        setGuides(data.guides);
      }
    } catch (err) {
      setGuides([
        {
          id: "g1",
          user: { name: "Zahoor Ahmed", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", phone: "+91 9876543210" },
          languages: "English, Hindi, Kashmiri",
          experience: 8,
          specialization: "High-altitude trekking, cultural tours",
          pricePerDay: 2500,
          ratings: 4.9,
          verifiedBadge: true,
          location: "Srinagar, J&K",
          bio: "Local guide in Srinagar and surrounding valleys.",
        },
      ]);
    }
  };

  const fetchRentals = async () => {
    try {
      const res = await fetch("/api/marketplace/rentals");
      if (res.ok) {
        const data = await res.json();
        setRentalItems(data.items);
      }
    } catch (err) {
      setRentalItems([
        { id: "i1", name: "Heavy Insulated Winter Parka", category: "Winter Clothes", pricePerDay: 300, description: "Protects against -15°C cold in Gulmarg Gondola peaks.", imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=150&h=150&q=80", availableCount: 10, vendorId: "v1" },
        { id: "i2", name: "Pro Snow Grip Boots", category: "Snow Gear", pricePerDay: 200, description: "Anti-slip waterproof soles.", imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=150&h=150&q=80", availableCount: 15, vendorId: "v1" },
        { id: "i3", name: "GoPro Hero 11 Action Cam", category: "GoPro", pricePerDay: 600, description: "Capture skiing/snowboarding in 5.3K.", imageUrl: "https://images.unsplash.com/photo-1565849906661-ca9d689f7966?auto=format&fit=crop&w=150&h=150&q=80", availableCount: 5, vendorId: "v1" },
      ]);
    }
  };

  const handleBookGuide = async (guideId: string) => {
    if (!guideStartDate || !guideEndDate) return;
    if (isOnline) {
      try {
        const res = await fetch("/api/marketplace/guides/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guideId, startDate: guideStartDate, endDate: guideEndDate }),
        });
        if (res.ok) {
          setBookingSuccess(true);
          setTimeout(() => {
            setBookingSuccess(false);
            setBookingGuideId(null);
          }, 3000);
        }
      } catch (err) {
        console.error("Booking error", err);
      }
    } else {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingGuideId(null);
      }, 3000);
    }
  };

  const updateCart = (itemId: string, qty: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (qty <= 0) delete updated[itemId];
      else updated[itemId] = qty;
      return updated;
    });
  };

  const handleCheckoutRentals = async () => {
    if (!rentStartDate || !rentEndDate || Object.keys(cart).length === 0) return;
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => ({ itemId, quantity }));

    if (isOnline) {
      try {
        const res = await fetch("/api/marketplace/rentals/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId: rentalItems[0]?.vendorId || "v1",
            startDate: rentStartDate,
            endDate: rentEndDate,
            items: orderItems,
          }),
        });
        if (res.ok) {
          setRentalSuccess(true);
          setCart({});
          setTimeout(() => {
            setRentalSuccess(false);
            setShowCart(false);
          }, 3000);
        }
      } catch (err) {
        console.error("Rent order checkout error", err);
      }
    } else {
      setRentalSuccess(true);
      setCart({});
      setTimeout(() => {
        setRentalSuccess(false);
        setShowCart(false);
      }, 3000);
    }
  };

  const handleRequestTaxi = () => {
    setTaxiMatching(true);
    setTaxiError("");
    setTaxiBooking(null);

    setTimeout(() => {
      setTaxiMatching(false);
      const mockTaxi = {
        id: "tax_b_" + Math.random().toString(36).substring(7),
        pickupLocation: pickup,
        dropLocation: drop,
        vehicleType: vehicle,
        estimatedFare: vehicle === "SUV" ? 1200 : vehicle === "Bike" ? 450 : 850,
        otp: "3679",
        status: "ACCEPTED",
        driver: {
          user: { name: "Manzoor Dar", phone: "+91 9419123456", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" },
          vehicleModel: "Toyota Innova Crysta (4x4)",
          vehicleNumber: "JK-01-A-7788",
        },
      };
      setTaxiBooking(mockTaxi);
    }, 3000);
  };

  const handleVerifyOtpAndStart = () => {
    if (taxiOtpInput !== taxiBooking.otp) {
      setTaxiError("Invalid OTP. Try again.");
      return;
    }
    setTaxiBooking((prev: any) => ({ ...prev, status: "STARTED" }));
    setTaxiError("");
  };

  const handleEndTaxiTrip = async () => {
    setTaxiBooking((prev: any) => ({ ...prev, status: "COMPLETED" }));
    const fare = taxiBooking.estimatedFare;
    
    if (onAddExpense) {
      onAddExpense({
        id: Math.random().toString(),
        amount: fare,
        category: "Taxi",
        description: `Ride: ${pickup} to ${drop}`,
        date: new Date().toISOString(),
      });
    }

    if (onAddNotification) {
      onAddNotification({
        id: Math.random().toString(),
        title: "Ride Completed",
        body: `Taxi trip with Manzoor ended. ₹${fare} logged under expenses.`,
        type: "TAXI_UPDATE",
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] font-sans pb-12">
      {/* Sub Tabs bar */}
      <div className="flex gap-1 bg-[#eae9e6] p-1.5 rounded-full w-fit self-center mb-6 border border-neutral-250/20 shadow-sm">
        <button
          onClick={() => setActiveSubTab("guides")}
          className={`px-6 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeSubTab === "guides" ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-850"
          }`}
        >
          Guides
        </button>
        <button
          onClick={() => setActiveSubTab("rentals")}
          className={`px-6 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeSubTab === "rentals" ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-850"
          }`}
        >
          Gear Rental
        </button>
        <button
          onClick={() => setActiveSubTab("taxi")}
          className={`px-6 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            activeSubTab === "taxi" ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-850"
          }`}
        >
          Book Cab
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* GUIDES MARKETPLACE */}
        {activeSubTab === "guides" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div key={guide.id} className="premium-card rounded-xl p-5 flex flex-col justify-between hover:border-neutral-800 transition-all">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img src={guide.user.avatarUrl} alt={guide.user.name} className="w-10 h-10 rounded-full object-cover border border-amber-500/20 shadow-sm" />
                      <div>
                        <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                          {guide.user.name}
                          {guide.verifiedBadge && <ShieldCheck className="w-4 h-4 text-amber-600 fill-amber-50" />}
                        </h4>
                        <p className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider">{guide.location}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold border border-neutral-200/50 text-[#0f766e] bg-emerald-50/40 px-2.5 py-0.5 rounded-full">
                      ₹{guide.pricePerDay}/day
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed mb-4 font-light">{guide.bio}</p>

                  <div className="space-y-1.5 border-t border-neutral-100 pt-3.5 text-[10px] text-neutral-600 font-light">
                    <div>💬 <strong className="font-bold text-neutral-750">Languages:</strong> {guide.languages}</div>
                    <div>⭐ <strong className="font-bold text-neutral-750">Experience:</strong> {guide.experience} Years</div>
                    <div>🏆 <strong className="font-bold text-neutral-750">Specialty:</strong> {guide.specialization}</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-150/50 flex gap-2">
                  <a href={`tel:${guide.user.phone}`} className="flex-1 py-2 border border-neutral-200 hover:border-neutral-900 rounded-lg text-[10px] font-bold text-neutral-600 hover:text-neutral-900 transition-all flex items-center justify-center gap-1 cursor-pointer bg-white shadow-sm">
                    <PhoneCall className="w-3 h-3 text-[#0f766e]" /> Call Guide
                  </a>
                  <button
                    onClick={() => setBookingGuideId(guide.id)}
                    className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Book Guide
                  </button>
                </div>

                {bookingGuideId === guide.id && (
                  <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[99] animate-fade-in">
                    <div className="bg-white p-6 rounded-xl border border-neutral-200 max-w-sm w-full space-y-4 shadow-2xl">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs uppercase font-bold tracking-widest text-neutral-400">Select Dates</h4>
                        <button onClick={() => setBookingGuideId(null)} className="text-xs text-neutral-400 hover:text-neutral-800 font-bold cursor-pointer">Close</button>
                      </div>

                      {bookingSuccess ? (
                        <div className="text-center py-6 space-y-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                          <h5 className="text-xs font-bold text-neutral-800">Booking Requested!</h5>
                          <p className="text-[10px] text-neutral-450">Notification sent to {guide.user.name}.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Start Date</label>
                            <input
                              required
                              type="date"
                              value={guideStartDate}
                              onChange={(e) => setGuideStartDate(e.target.value)}
                              className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none focus:border-neutral-950"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">End Date</label>
                            <input
                              required
                              type="date"
                              value={guideEndDate}
                              onChange={(e) => setGuideEndDate(e.target.value)}
                              className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none focus:border-neutral-950"
                            />
                          </div>
                          <button
                            onClick={() => handleBookGuide(guide.id)}
                            className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white text-xs font-bold rounded-lg transition-all"
                          >
                            Send Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* GEAR RENTALS */}
        {activeSubTab === "rentals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#faf9f6] border border-neutral-200/60 p-4 rounded-xl shadow-inner">
              <span className="text-[11px] text-neutral-500 font-light flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0f766e] shrink-0" />
                Select dates for catalog logistics. Local doorstep returns included.
              </span>
              <button
                onClick={() => setShowCart(true)}
                className="px-5 py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 relative cursor-pointer shadow-sm ml-auto sm:ml-0"
              >
                <ShoppingCart className="w-3.5 h-3.5 animate-bounce" />
                View Cart ({Object.values(cart).reduce((s, c) => s + c, 0)})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentalItems.map((item) => {
                const qtyInCart = cart[item.id] || 0;
                return (
                  <div key={item.id} className="premium-card rounded-xl overflow-hidden flex flex-col justify-between hover:border-neutral-800 transition-all">
                    <div className="w-full h-44 bg-neutral-100 relative">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border border-white/5">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-neutral-800 leading-tight">{item.name}</h4>
                          <span className="text-xs font-bold text-neutral-800">₹{item.pricePerDay}/d</span>
                        </div>
                        <p className="text-[10px] text-neutral-450 mt-1 leading-relaxed font-light">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                        <span className="text-[9px] text-neutral-400">Stock: {item.availableCount}</span>

                        {qtyInCart === 0 ? (
                          <button
                            onClick={() => updateCart(item.id, 1)}
                            className="px-3.5 py-1.5 bg-[#faf9f6] border border-neutral-250/60 hover:border-neutral-850 hover:bg-white text-neutral-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-sm"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCart(item.id, qtyInCart - 1)}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-600 font-semibold transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-neutral-750">{qtyInCart}</span>
                            <button
                              onClick={() => updateCart(item.id, qtyInCart + 1)}
                              className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-600 font-semibold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CART MODAL */}
            {showCart && (
              <div className="fixed inset-0 bg-neutral-950/45 backdrop-blur-sm flex items-center justify-center p-4 z-[99]">
                <div className="bg-white p-6 rounded-xl border border-neutral-200 max-w-sm w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase font-bold tracking-widest text-neutral-450 flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-[#0f766e]" />
                      Rentals Cart
                    </h4>
                    <button onClick={() => setShowCart(false)} className="text-xs text-neutral-400 hover:text-neutral-850 font-bold cursor-pointer">Close</button>
                  </div>

                  {rentalSuccess ? (
                    <div className="text-center py-6 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                      <h5 className="text-xs font-bold text-neutral-800">Order Placed!</h5>
                      <p className="text-[10px] text-neutral-400">Vendor is preparing delivery.</p>
                    </div>
                  ) : Object.keys(cart).length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400 font-light">Cart is empty.</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {Object.entries(cart).map(([itemId, qty]) => {
                          const item = rentalItems.find((i) => i.id === itemId);
                          if (!item) return null;
                          return (
                            <div key={itemId} className="flex justify-between items-center text-xs p-2.5 bg-[#faf9f6] border border-neutral-200/50 rounded-lg shadow-sm">
                              <div>
                                <span className="font-bold text-neutral-800">{item.name}</span>
                                <div className="text-[9px] text-neutral-400">Qty: {qty}</div>
                              </div>
                              <span className="font-bold text-neutral-800">₹{item.pricePerDay * qty}/day</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Start Date</label>
                          <input
                            required
                            type="date"
                            value={rentStartDate}
                            onChange={(e) => setRentStartDate(e.target.value)}
                            className="w-full text-xs p-2 border border-neutral-250 rounded-lg outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">End Date</label>
                          <input
                            required
                            type="date"
                            value={rentEndDate}
                            onChange={(e) => setRentEndDate(e.target.value)}
                            className="w-full text-xs p-2 border border-neutral-250 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCheckoutRentals}
                        className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
                      >
                        Place Rental Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAXI BOOKINGS */}
        {activeSubTab === "taxi" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Call Form */}
            <div className="lg:col-span-1 bg-white p-5 border border-neutral-200/50 rounded-xl flex flex-col justify-between h-full space-y-4 shadow-sm">
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-1.5 mb-2">
                  <Car className="w-4 h-4 text-[#0f766e]" />
                  Order Local Cab
                </h3>
                <p className="text-[10px] text-neutral-450 leading-relaxed mb-4 font-light">
                  Direct match with certified local drivers in Srinagar, Gulmarg, or Sonmarg. Fares are calculated on region standards.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Pickup Location</label>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none bg-[#faf9f6]/50 focus:bg-white transition-all font-light"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Dropoff Location</label>
                    <input
                      type="text"
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none bg-[#faf9f6]/50 focus:bg-white transition-all font-light"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Vehicle Type</label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none bg-[#faf9f6]/50 focus:bg-white transition-all cursor-pointer font-light"
                    >
                      <option value="Sedan">Sedan Class (4 Pax)</option>
                      <option value="SUV">SUV 4x4 Innova (6 Pax)</option>
                      <option value="Bike">Royal Enfield Bike (1 Pax)</option>
                      <option value="Tempo">Traveler Tempo (12 Pax)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRequestTaxi}
                disabled={taxiMatching}
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                {taxiMatching ? "Searching Drivers..." : "Request Ride Match"}
              </button>
            </div>

            {/* Ride Tracker View */}
            <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col items-center justify-center min-h-[300px] shadow-sm">
              {taxiMatching ? (
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin mx-auto"></div>
                  <h4 className="text-xs font-bold text-neutral-700 animate-pulse">Contacting Nearby Cabs...</h4>
                  <p className="text-[9px] text-neutral-400 font-light">Scanning active driver coordinates in area...</p>
                </div>
              ) : !taxiBooking ? (
                <div className="text-center text-xs text-neutral-400 space-y-2 font-light">
                  <Car className="w-10 h-10 text-neutral-200 mx-auto" />
                  <p>No active rides. Request a ride match on the left.</p>
                </div>
              ) : (
                <div className="w-full space-y-5">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <h4 className="text-xs font-bold text-neutral-800">Ride Status Tracking</h4>
                    <span className={`text-[8px] tracking-wider px-2.5 py-0.5 rounded-full font-bold border uppercase ${
                      taxiBooking.status === "COMPLETED"
                        ? "bg-neutral-100 border-neutral-200 text-neutral-400"
                        : taxiBooking.status === "STARTED"
                        ? "bg-neutral-950 text-white border-neutral-950"
                        : "bg-amber-100 border-amber-200 text-amber-800"
                    }`}>
                      {taxiBooking.status}
                    </span>
                  </div>

                  {/* Driver Card */}
                  <div className="flex items-center gap-4 bg-[#faf9f6] p-4 border border-neutral-200/60 rounded-xl shadow-inner">
                    <img src={taxiBooking.driver.user.avatarUrl} alt="Driver" className="w-10 h-10 rounded-full object-cover border border-amber-500/20 shadow-sm" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-805">{taxiBooking.driver.user.name}</h4>
                      <p className="text-[10px] text-neutral-450 font-light">{taxiBooking.driver.vehicleModel} • {taxiBooking.driver.vehicleNumber}</p>
                      <div className="text-[9px] text-amber-600 font-bold mt-1">★ 4.9 Driver Rating</div>
                    </div>
                  </div>

                  {/* Route details */}
                  <div className="text-xs space-y-2 text-neutral-600 bg-[#faf9f6] p-4 rounded-xl border border-neutral-200/50 shadow-inner font-light">
                    <div>📍 <strong className="font-bold text-neutral-750">Pickup:</strong> {taxiBooking.pickupLocation}</div>
                    <div>🏁 <strong className="font-bold text-neutral-750">Dropoff:</strong> {taxiBooking.dropLocation}</div>
                    <div className="text-neutral-800 font-bold pt-2 border-t border-neutral-200/60">💰 **Estimated Fare:** ₹{taxiBooking.estimatedFare}</div>
                  </div>

                  {/* Status workflow triggers */}
                  {taxiBooking.status === "ACCEPTED" && (
                    <div className="p-4 border border-neutral-200/80 bg-[#faf9f6] rounded-xl text-center space-y-3">
                      <p className="text-[10px] text-neutral-500 font-light">
                        Driver has arrived! Verify the trip by inputting the passenger OTP:
                      </p>
                      <div className="text-xl font-bold tracking-widest text-neutral-800 bg-white border border-neutral-200 py-1.5 px-6 rounded-lg w-fit mx-auto shadow-sm">
                        {taxiBooking.otp}
                      </div>

                      <div className="flex items-center gap-2 max-w-xs mx-auto mt-2">
                        <input
                          type="text"
                          value={taxiOtpInput}
                          onChange={(e) => setTaxiOtpInput(e.target.value)}
                          placeholder="Enter OTP (3679)"
                          className="text-xs p-2 border border-neutral-200 rounded-lg outline-none bg-white w-full text-center"
                        />
                        <button
                          onClick={handleVerifyOtpAndStart}
                          className="px-4 py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Verify
                        </button>
                      </div>
                      {taxiError && <p className="text-[10px] font-bold text-red-500">{taxiError}</p>}
                    </div>
                  )}

                  {taxiBooking.status === "STARTED" && (
                    <div className="p-4 border border-neutral-200 bg-[#faf9f6] rounded-xl text-center space-y-2">
                      <p className="text-[11px] text-neutral-800 font-bold animate-pulse">
                        Ride is in progress. Driving to drop destination...
                      </p>
                      <button
                        onClick={handleEndTaxiTrip}
                        className="mt-3 px-6 py-2 bg-red-650 hover:bg-red-750 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Complete Ride
                      </button>
                    </div>
                  )}

                  {taxiBooking.status === "COMPLETED" && (
                    <div className="p-4 border border-neutral-200 bg-[#faf9f6] rounded-xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#0f766e] mx-auto animate-bounce" />
                      <p className="text-xs font-semibold text-neutral-800">
                        Ride completed successfully. Fare has been recorded in expenses.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

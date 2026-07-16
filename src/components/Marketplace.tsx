"use client";

import { useState, useEffect } from "react";
import { UserCheck, ShieldCheck, ShoppingCart, Truck, Navigation2, CheckCircle2, Star, Calendar, MessageSquare, Compass, PhoneCall, Info, Car } from "lucide-react";

interface MarketplaceProps {
  user: any;
  isOnline: boolean;
  onAddExpense?: (newExpense: any) => void;
  onAddNotification?: (newNotify: any) => void;
}

export default function Marketplace({ user, isOnline, onAddExpense, onAddNotification }: MarketplaceProps) {
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
      const data = await res.json();
      if (res.ok) setGuides(data.guides);
    } catch (err) {
      // Offline mock guides list
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
      const data = await res.json();
      if (res.ok) setRentalItems(data.items);
    } catch (err) {
      setRentalItems([
        { id: "i1", name: "Heavy Insulated Winter Parka", category: "Winter Clothes", pricePerDay: 300, description: "Protects against -15°C cold in Gulmarg Gondola peaks.", imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=150&h=150&q=80", availableCount: 10, vendorId: "v1" },
        { id: "i2", name: "Pro Snow Grip Boots", category: "Snow Gear", pricePerDay: 200, description: "Anti-slip waterproof soles.", imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=150&h=150&q=80", availableCount: 15, vendorId: "v1" },
        { id: "i3", name: "GoPro Hero 11 Action Cam", category: "GoPro", pricePerDay: 600, description: "Capture skiing/snowboarding in 5.3K.", imageUrl: "https://images.unsplash.com/photo-1565849906661-ca9d689f7966?auto=format&fit=crop&w=150&h=150&q=80", availableCount: 5, vendorId: "v1" },
      ]);
    }
  };

  // Guide Booking
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
      // Offline booking
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingGuideId(null);
      }, 3000);
    }
  };

  // Rental Cart Helpers
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
        console.error("Rent order checkouts error", err);
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

  // Taxi Ride Mock Matcher
  const handleRequestTaxi = () => {
    setTaxiMatching(true);
    setTaxiError("");
    setTaxiBooking(null);

    // Simulate search matching animation
    setTimeout(() => {
      setTaxiMatching(false);
      // Mock matched taxi object
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

    // Sync expense locally / triggers callback
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
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Sub Tabs bar */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit self-center mb-6">
        <button
          onClick={() => setActiveSubTab("guides")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "guides" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🗺️ Local Guides
        </button>
        <button
          onClick={() => setActiveSubTab("rentals")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "rentals" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🧥 Rent Gear
        </button>
        <button
          onClick={() => setActiveSubTab("taxi")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "taxi" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          🚕 Call Taxi
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* GUIDES MARKETPLACE */}
        {activeSubTab === "guides" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div key={guide.id} className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col justify-between hover:shadow-sm transition-all">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img src={guide.user.avatarUrl} alt={guide.user.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          {guide.user.name}
                          {guide.verifiedBadge && <ShieldCheck className="w-4 h-4 text-sky-500" />}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{guide.location}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg">
                      ₹{guide.pricePerDay}/day
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{guide.bio}</p>

                  <div className="space-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
                    <div>💬 **Languages:** {guide.languages}</div>
                    <div>⭐ **Experience:** {guide.experience} Years</div>
                    <div>🏆 **Spec:** {guide.specialization}</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  <a href={`tel:${guide.user.phone}`} className="flex-1 py-2 border border-slate-200 hover:border-sky-500 rounded-lg text-xs font-semibold text-slate-600 hover:text-sky-600 transition-all flex items-center justify-center gap-1 cursor-pointer">
                    <PhoneCall className="w-3.5 h-3.5" /> Call Guide
                  </a>
                  <button
                    onClick={() => setBookingGuideId(guide.id)}
                    className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Book Guide
                  </button>
                </div>

                {bookingGuideId === guide.id && (
                  <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-[99]">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 max-w-sm w-full space-y-4 shadow-xl">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-800">Choose Booking Dates</h4>
                        <button onClick={() => setBookingGuideId(null)} className="text-xs text-slate-400 hover:underline">Close</button>
                      </div>

                      {bookingSuccess ? (
                        <div className="text-center py-4 space-y-2">
                          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                          <h5 className="text-xs font-bold text-slate-800">Booking Requested!</h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed">Notifications dispatched to {guide.user.name}.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Start Date</label>
                            <input
                              required
                              type="date"
                              value={guideStartDate}
                              onChange={(e) => setGuideStartDate(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">End Date</label>
                            <input
                              required
                              type="date"
                              value={guideEndDate}
                              onChange={(e) => setGuideEndDate(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none"
                            />
                          </div>
                          <button
                            onClick={() => handleBookGuide(guide.id)}
                            className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg"
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
            <div className="flex justify-between items-center bg-sky-50 border border-sky-100 p-4 rounded-xl">
              <span className="text-xs text-sky-800 font-semibold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-500" />
                Select dates to see accurate stock availability. Delivery to hotel included.
              </span>
              <button
                onClick={() => setShowCart(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm relative cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                View Cart ({Object.values(cart).reduce((s, c) => s + c, 0)})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentalItems.map((item) => {
                const qtyInCart = cart[item.id] || 0;
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between hover:shadow-xs transition-all">
                    <div className="w-full h-44 bg-slate-100 relative">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-slate-900/75 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">{item.name}</h4>
                          <span className="text-xs font-bold text-sky-600">₹{item.pricePerDay}/day</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-[10px] text-slate-400 font-semibold">Available: {item.availableCount}</span>

                        {qtyInCart === 0 ? (
                          <button
                            onClick={() => updateCart(item.id, 1)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold border border-slate-200 hover:border-sky-300 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => updateCart(item.id, qtyInCart - 1)}
                              className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-semibold"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-700">{qtyInCart}</span>
                            <button
                              onClick={() => updateCart(item.id, qtyInCart + 1)}
                              className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-semibold"
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
              <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-[99]">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 max-w-sm w-full space-y-4 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-sky-500" />
                      Rentals Cart
                    </h4>
                    <button onClick={() => setShowCart(false)} className="text-xs text-slate-400 hover:underline">Close</button>
                  </div>

                  {rentalSuccess ? (
                    <div className="text-center py-6 space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                      <h5 className="text-xs font-bold text-slate-800">Order Placed Successfully!</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Gear will be delivered to your accommodation on start date.</p>
                    </div>
                  ) : Object.keys(cart).length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">Cart is empty. Add winter gears.</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {Object.entries(cart).map(([itemId, qty]) => {
                          const item = rentalItems.find((i) => i.id === itemId);
                          if (!item) return null;
                          return (
                            <div key={itemId} className="flex justify-between items-center text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg">
                              <div>
                                <span className="font-semibold text-slate-700">{item.name}</span>
                                <div className="text-[10px] text-slate-400">Qty: {qty}</div>
                              </div>
                              <span className="font-bold text-slate-700">₹{item.pricePerDay * qty}/day</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Start Date</label>
                          <input
                            required
                            type="date"
                            value={rentStartDate}
                            onChange={(e) => setRentStartDate(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">End Date</label>
                          <input
                            required
                            type="date"
                            value={rentEndDate}
                            onChange={(e) => setRentEndDate(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCheckoutRentals}
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs"
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
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between h-full space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Car className="w-4 h-4 text-sky-500" />
                  Order Local Cab
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  Match with local taxi drivers in Srinagar, Gulmarg, or Sonmarg. Fares are calculated dynamically.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Pickup Address</label>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Drop Location</label>
                    <input
                      type="text"
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Vehicle Class</label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50/50"
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
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {taxiMatching ? "Searching Drivers..." : "Request Ride Match"}
              </button>
            </div>

            {/* Ride Tracker View */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
              {taxiMatching ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin mx-auto"></div>
                  <h4 className="text-xs font-bold text-slate-700 animate-pulse">Contacting Nearby Cabs...</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">Scanning driver coordinates in Srinagar...</p>
                </div>
              ) : !taxiBooking ? (
                <div className="text-center text-xs text-slate-400 space-y-2">
                  <Car className="w-12 h-12 text-slate-200 mx-auto" />
                  <p>No active rides. Request a ride matching on the left.</p>
                </div>
              ) : (
                <div className="w-full space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-bold text-slate-800">Ride Status Tracking</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      taxiBooking.status === "COMPLETED"
                        ? "bg-slate-100 text-slate-500"
                        : taxiBooking.status === "STARTED"
                        ? "bg-sky-500 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {taxiBooking.status}
                    </span>
                  </div>

                  {/* Driver Card */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <img src={taxiBooking.driver.user.avatarUrl} alt="Driver" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{taxiBooking.driver.user.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{taxiBooking.driver.vehicleModel} • {taxiBooking.driver.vehicleNumber}</p>
                      <div className="text-[9px] text-amber-500 font-bold mt-1">★ 4.9 Driver Rating</div>
                    </div>
                  </div>

                  {/* Route details */}
                  <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div>📍 **Pickup:** {taxiBooking.pickupLocation}</div>
                    <div>🏁 **Dropoff:** {taxiBooking.dropLocation}</div>
                    <div className="text-slate-800 font-semibold">💰 **Est Fare:** ₹{taxiBooking.estimatedFare} (Cash/UPI)</div>
                  </div>

                  {/* Status workflow triggers */}
                  {taxiBooking.status === "ACCEPTED" && (
                    <div className="p-4 border border-amber-100 bg-amber-50/50 rounded-xl text-center space-y-3">
                      <p className="text-[11px] text-slate-600">
                        Driver has arrived! Provide this 4-digit OTP to verify and start trip:
                      </p>
                      <div className="text-xl font-bold tracking-widest text-slate-800 bg-white border border-slate-200 py-1.5 px-6 rounded-lg w-fit mx-auto">
                        {taxiBooking.otp}
                      </div>

                      <div className="flex items-center gap-2 max-w-xs mx-auto mt-2">
                        <input
                          type="text"
                          value={taxiOtpInput}
                          onChange={(e) => setTaxiOtpInput(e.target.value)}
                          placeholder="Enter OTP (3679)"
                          className="text-xs p-2 border border-slate-200 rounded-lg outline-none bg-white w-full text-center"
                        />
                        <button
                          onClick={handleVerifyOtpAndStart}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Verify
                        </button>
                      </div>
                      {taxiError && <p className="text-[10px] font-bold text-red-500">{taxiError}</p>}
                    </div>
                  )}

                  {taxiBooking.status === "STARTED" && (
                    <div className="p-4 border border-sky-100 bg-sky-50/50 rounded-xl text-center space-y-2">
                      <p className="text-[11px] text-sky-800 font-semibold animate-pulse flex items-center justify-center gap-1.5">
                        <Navigation2 className="w-4.5 h-4.5 text-sky-600 animate-bounce" />
                        Ride is in progress. En route to {drop}...
                      </p>
                      <button
                        onClick={handleEndTaxiTrip}
                        className="mt-3 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Complete Ride
                      </button>
                    </div>
                  )}

                  {taxiBooking.status === "COMPLETED" && (
                    <div className="p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="text-xs font-semibold text-emerald-800">
                        Ride completed! Fares of ₹{taxiBooking.estimatedFare} have been logged in your expense manager.
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

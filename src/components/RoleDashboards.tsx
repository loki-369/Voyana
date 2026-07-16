"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Award, ClipboardList, ShoppingBag, Plus, X, Check } from "lucide-react";

interface RoleDashboardsProps {
  user: any;
  isOnline: boolean;
  onLogout: () => void;
}

// ----------------------------------------------------
// 1. TOUR GUIDE PROFILE DASHBOARD
// ----------------------------------------------------
export function GuideDashboard({ user, onLogout }: RoleDashboardsProps) {
  const [online, setOnline] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuideBookings();
  }, []);

  const fetchGuideBookings = async () => {
    try {
      const res = await fetch("/api/marketplace/guides/book");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      setBookings([
        {
          id: "gb1",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          totalPrice: 5000,
          status: "PENDING",
          traveler: { name: "Alex Mercer", email: "alex@voyana.com", phone: "+1 555-0102" },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, accept: boolean) => {
    const nextStatus = accept ? "CONFIRMED" : "CANCELLED";
    try {
      await fetch("/api/marketplace/guides/book", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: nextStatus }),
      });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b)));
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b)));
    }
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pb-12 font-sans">
      {/* Overview & Availability */}
      <div className="premium-card p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-base font-bold text-neutral-800 flex items-center justify-center md:justify-start gap-2">
            <span>Guide Panel:</span> {user.name}
            {user.verified && <ShieldCheck className="w-4 h-4 text-[#0f766e]" />}
          </h2>
          <p className="text-xs text-neutral-400 font-light">Manage tour itineraries and requests from travelers.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnline(!online)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer shadow-sm ${
              online
                ? "bg-neutral-950 border-neutral-950 text-white"
                : "bg-white border-neutral-200 text-neutral-500 hover:bg-[#fafafa]"
            }`}
          >
            {online ? "Availability: Online" : "Availability: Offline"}
          </button>
          <button onClick={onLogout} className="px-4 py-2 border border-neutral-200 hover:border-red-200 hover:text-red-700 text-neutral-600 rounded-lg text-xs font-semibold cursor-pointer transition-all bg-white shadow-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Bookings & Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Manager */}
        <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col min-h-[300px] shadow-sm">
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-[#0f766e]" />
            Tour Bookings
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-10 text-xs text-neutral-400 font-light">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-xs text-neutral-400 font-light">No active bookings yet.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-neutral-200/60 bg-[#faf9f6]/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-800">{booking.traveler.name}</h4>
                    <p className="text-[10px] text-neutral-400 font-light">{booking.traveler.phone} • {booking.traveler.email}</p>
                    <p className="text-[10px] text-neutral-500 pt-1 font-bold">
                      📅 Range: {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#0f766e]">₹{booking.totalPrice}</span>
                    {booking.status === "PENDING" ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleBookingAction(booking.id, false)}
                          className="p-1.5 border border-neutral-200 text-neutral-500 hover:text-red-650 hover:bg-neutral-50 rounded-lg cursor-pointer bg-white shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, true)}
                          className="p-1.5 bg-neutral-950 text-white hover:bg-neutral-850 rounded-lg cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[8px] tracking-wider font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                        booking.status === "CONFIRMED" ? "bg-emerald-55/20 border-emerald-100 text-emerald-800" : "bg-neutral-50 border-neutral-200 text-neutral-400"
                      }`}>
                        {booking.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col gap-4 shadow-sm">
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Certifications
          </h3>

          <div className="space-y-2.5">
            <div className="p-3.5 border border-neutral-200 bg-[#faf9f6]/40 rounded-xl shadow-inner">
              <h4 className="text-xs font-bold text-neutral-800">J&K Tourism Registry</h4>
              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed font-light">Certified guide license #JK-99212A. Approved by J&K Tourism Board.</p>
            </div>
            <div className="p-3.5 border border-neutral-200 bg-[#faf9f6]/40 rounded-xl shadow-inner">
              <h4 className="text-xs font-bold text-neutral-800">WFR First Responder</h4>
              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed font-light">Wilderness First Responder certification by NIM Uttarkashi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. RENTAL VENDOR PROFILE DASHBOARD
// ----------------------------------------------------
export function VendorDashboard({ user, onLogout }: RoleDashboardsProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Winter Clothes");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => {
    fetchVendorOrders();
    fetchVendorItems();
  }, []);

  const fetchVendorOrders = async () => {
    try {
      const res = await fetch("/api/marketplace/rentals/order");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      setOrders([
        {
          id: "ro1",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          totalPrice: 1100,
          status: "PENDING",
          traveler: { name: "Alex Mercer", phone: "+1 555-0102" },
          items: [{ item: { name: "Heavy Insulated Winter Parka" }, quantity: 1 }],
        },
      ]);
    }
  };

  const fetchVendorItems = async () => {
    try {
      const res = await fetch(`/api/marketplace/rentals?vendorId=${user.vendorProfile?.id || ""}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      setItems([
        { id: "vi1", name: "Heavy Insulated Winter Parka", category: "Winter Clothes", pricePerDay: 300, availableCount: 10 },
      ]);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      await fetch("/api/marketplace/rentals/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
      fetchVendorOrders();
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    try {
      const res = await fetch("/api/marketplace/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName, category: newItemCategory, pricePerDay: parseInt(newItemPrice), availableCount: 5 }),
      });
      if (res.ok) {
        setNewItemName("");
        setNewItemPrice("");
        setShowAddForm(false);
        fetchVendorItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pb-12 font-sans">
      {/* Overview Header */}
      <div className="premium-card p-6 rounded-xl flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-neutral-805">Vendor Profile: {user.name}</h2>
          <p className="text-xs text-neutral-450 font-light">Manage rental catalogs and fulfill winter/mountaineering orders.</p>
        </div>
        <button onClick={onLogout} className="px-4 py-2 border border-neutral-200 hover:border-red-200 hover:text-red-700 text-neutral-600 rounded-lg text-xs font-semibold cursor-pointer bg-white shadow-sm transition-all">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active rental orders */}
        <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col min-h-[300px] shadow-sm">
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-[#0f766e]" />
            Rental Equipment Orders
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-xs text-neutral-400 font-light">No active rental orders.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-4 border border-neutral-200/60 bg-[#faf9f6]/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-800">For: {order.traveler.name}</h4>
                    <p className="text-[10px] text-neutral-450 font-semibold">
                      📦 {order.items.map((i: any) => `${i.item.name} (x${i.quantity})`).join(", ")}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-light pt-1">
                      📅 Range: {new Date(order.startDate).toLocaleDateString()} to {new Date(order.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#0f766e]">₹{order.totalPrice}</span>
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "SHIPPED")}
                        className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-sm"
                      >
                        Ship Order
                      </button>
                    )}
                    {order.status === "SHIPPED" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "DELIVERED")}
                        className="px-3.5 py-2 bg-[#0f766e] hover:bg-[#115e59] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-sm"
                      >
                        Delivered
                      </button>
                    )}
                    {order.status !== "PENDING" && order.status !== "SHIPPED" && (
                      <span className="text-[8px] tracking-wider font-bold border border-neutral-200 text-neutral-400 bg-neutral-50 px-2.5 py-0.5 rounded-full uppercase">
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inventory manager */}
        <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              Catalog Items
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 border border-neutral-250 hover:border-neutral-850 bg-white rounded-lg cursor-pointer transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-700" />
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddItem} className="p-4 border border-neutral-200/80 bg-[#faf9f6]/40 rounded-xl space-y-3 text-xs shadow-inner">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Item Name</label>
                <input
                  required
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Snow Gloves"
                  className="w-full p-2.5 border border-neutral-200 rounded-lg bg-white text-xs outline-none focus:border-neutral-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Price/Day</label>
                  <input
                    required
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="100"
                    className="w-full p-2.5 border border-neutral-200 rounded-lg bg-white text-xs outline-none focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full p-2.5 border border-neutral-200 rounded-lg bg-white text-xs cursor-pointer outline-none focus:border-neutral-900"
                  >
                    <option value="Winter Clothes">Winter Clothes</option>
                    <option value="Snow Gear">Snow Gear</option>
                    <option value="Cameras">Cameras</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all">
                Add Listing
              </button>
            </form>
          )}

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="p-3 border border-neutral-200 bg-[#faf9f6]/40 rounded-xl flex justify-between items-center text-xs shadow-sm">
                <div>
                  <span className="font-bold text-neutral-805">{item.name}</span>
                  <div className="text-[9px] text-neutral-400 font-light mt-0.5">{item.category}</div>
                </div>
                <span className="font-bold text-[#0f766e]">₹{item.pricePerDay}/day</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. TAXI DRIVER PROFILE DASHBOARD
// ----------------------------------------------------
export function DriverDashboard({ user, onLogout }: RoleDashboardsProps) {
  const [online, setOnline] = useState(true);
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    fetchDriverRides();
  }, []);

  const fetchDriverRides = async () => {
    try {
      const res = await fetch("/api/taxi/bookings");
      if (res.ok) {
        const data = await res.json();
        setRides(data.bookings || []);
      }
    } catch (err) {
      setRides([
        {
          id: "tb1",
          pickupLocation: "Golden Crest Houseboat, Dal Lake",
          dropLocation: "Gulmarg Gondola Base",
          estimatedFare: 1200,
          status: "ACCEPTED",
          traveler: { name: "Alex Mercer", phone: "+1 555-0102" },
        },
      ]);
    }
  };

  const handleUpdateRideStatus = async (rideId: string, nextStatus: string) => {
    try {
      await fetch(`/api/taxi/bookings/${rideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchDriverRides();
    } catch (err) {
      setRides((prev) => prev.map((r) => (r.id === rideId ? { ...r, status: nextStatus } : r)));
    }
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pb-12 font-sans">
      <div className="premium-card p-6 rounded-xl flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-neutral-805">Driver Profile: {user.name}</h2>
          <p className="text-xs text-neutral-450 font-light">Accept tourist bookings and verify secure passenger OTP keys.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOnline(!online)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer shadow-sm ${
              online ? "bg-neutral-950 border-neutral-950 text-white" : "bg-white border-neutral-200 text-neutral-500 hover:bg-[#fafafa]"
            }`}
          >
            {online ? "Driver: Online" : "Driver: Offline"}
          </button>
          <button onClick={onLogout} className="px-4 py-2 border border-neutral-200 hover:border-red-200 hover:text-red-700 text-neutral-600 rounded-lg text-xs font-semibold cursor-pointer bg-white shadow-sm transition-all">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col min-h-[300px] shadow-sm">
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-[#0f766e]" />
            Active Assignments
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {rides.length === 0 ? (
              <div className="text-center py-10 text-xs text-neutral-400 font-light">No rides assigned currently.</div>
            ) : (
              rides.map((ride) => (
                <div key={ride.id} className="p-4 border border-neutral-200/60 bg-[#faf9f6]/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-sm">
                  <div className="space-y-1 leading-relaxed">
                    <h4 className="font-bold text-neutral-805">Passenger: {ride.traveler.name}</h4>
                    <p className="text-[10px] text-neutral-450 font-light">Contact: {ride.traveler.phone}</p>
                    <p className="text-[10px] text-neutral-500 pt-1">📍 <strong className="font-bold text-neutral-750">Pickup:</strong> {ride.pickupLocation}</p>
                    <p className="text-[10px] text-neutral-500">🏁 <strong className="font-bold text-neutral-750">Dropoff:</strong> {ride.dropLocation}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0f766e]">₹{ride.estimatedFare}</span>
                    {ride.status === "ACCEPTED" && (
                      <span className="text-[8px] uppercase tracking-wider font-bold border border-neutral-200 bg-white text-amber-700 px-3 py-1.5 rounded-lg shadow-sm animate-pulse">
                        Awaiting OTP
                      </span>
                    )}
                    {ride.status === "STARTED" && (
                      <button
                        onClick={() => handleUpdateRideStatus(ride.id, "COMPLETED")}
                        className="px-4 py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer shadow-sm"
                      >
                        Complete Ride
                      </button>
                    )}
                    {ride.status === "COMPLETED" && (
                      <span className="text-[8px] tracking-wider font-bold border border-neutral-200 text-neutral-450 bg-neutral-50 px-2.5 py-0.5 rounded-full uppercase">
                        COMPLETED
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vehicle description */}
        <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col gap-4 shadow-sm">
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Vehicle Details
          </h3>
          <div className="p-4 border border-neutral-200 bg-[#faf9f6]/40 rounded-xl space-y-2.5 text-xs text-neutral-700 shadow-inner font-light">
            <div>🚙 <strong className="font-bold text-neutral-750">Model:</strong> Toyota Innova Crysta</div>
            <div>🔢 <strong className="font-bold text-neutral-750">Plate:</strong> JK-01-A-7788</div>
            <div>👮 <strong className="font-bold text-neutral-750">Permit:</strong> Commercial Cab License</div>
            <div className="text-[#0f766e] font-bold pt-1.5 border-t border-neutral-200/40 flex items-center gap-1">
              <span>✓</span> Verification Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

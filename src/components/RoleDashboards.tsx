"use client";

import { useState, useEffect } from "react";
import { UserCheck, ShieldCheck, ShoppingCart, Star, Calendar, MessageSquare, Compass, ShieldAlert, Award, FileSpreadsheet, Play, CheckCircle2, Circle, Eye, Plus, ShoppingBag, ClipboardList, ToggleLeft, ToggleRight, Check, X } from "lucide-react";

interface RoleDashboardsProps {
  user: any;
  isOnline: boolean;
  onLogout: () => void;
}

// ----------------------------------------------------
// 1. TOUR GUIDE PROFILE DASHBOARD
// ----------------------------------------------------
export function GuideDashboard({ user, isOnline, onLogout }: RoleDashboardsProps) {
  const [online, setOnline] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuideBookings();
  }, []);

  const fetchGuideBookings = async () => {
    try {
      const res = await fetch("/api/marketplace/guides/book");
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (err) {
      // Offline fallback bookings
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
      const res = await fetch("/api/marketplace/guides/book", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: nextStatus }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b)));
      }
    } catch (err) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b)));
    }
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pb-6">
      {/* Overview & Status Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Guide Panel:</span> {user.name}
            {user.verified && <ShieldCheck className="w-4.5 h-4.5 text-sky-500 fill-sky-50" />}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage your touring availability and confirm bookings.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnline(!online)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              online
                ? "bg-emerald-500 border-emerald-600 text-white"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
          >
            {online ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {online ? "Online & Matching" : "Offline"}
          </button>
          <button onClick={onLogout} className="px-3.5 py-2 border border-slate-250 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-bold">
            Logout
          </button>
        </div>
      </div>

      {/* Guide Bookings and Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Manager */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <ClipboardList className="w-4.5 h-4.5 text-sky-500" />
            Active Tour Bookings
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {bookings.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No tour bookings received yet.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">{booking.traveler.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{booking.traveler.phone} • {booking.traveler.email}</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">
                      📅 {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">₹{booking.totalPrice}</span>
                    {booking.status === "PENDING" ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleBookingAction(booking.id, false)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, true)}
                          className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
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

        {/* Credentials and Certifications */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-sky-500" />
            Certifications & Badges
          </h3>

          <div className="space-y-3">
            <div className="p-3 border border-sky-100 bg-sky-50/50 rounded-xl">
              <h4 className="text-xs font-bold text-sky-900">J&K Tourism Board Badge</h4>
              <p className="text-[10px] text-sky-700 mt-0.5 leading-relaxed">Verified tour guide registry license #JK-99212A. Granted June 2024.</p>
            </div>
            <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl">
              <h4 className="text-xs font-bold text-slate-700">WFR First Aid Certification</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Wilderness First Responder trained by NIM Uttarkashi.</p>
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
export function VendorDashboard({ user, isOnline, onLogout }: RoleDashboardsProps) {
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
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
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
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
    } catch (err) {
      setItems([
        { id: "vi1", name: "Heavy Insulated Winter Parka", category: "Winter Clothes", pricePerDay: 300, availableCount: 10 },
      ]);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/marketplace/rentals/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
        fetchVendorOrders();
      }
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
        body: JSON.stringify({ name: newItemName, category: newItemCategory, pricePerDay: newItemPrice, availableCount: 5 }),
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
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pb-6">
      {/* Overview Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Vendor Panel: {user.name}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage rental listings and fulfill winter & trekking orders.</p>
        </div>
        <button onClick={onLogout} className="px-3.5 py-2 border border-slate-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-bold">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active rental orders */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <ClipboardList className="w-4.5 h-4.5 text-sky-500" />
            Equipment Rental Orders
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No rental orders placed yet.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Fulfill for {order.traveler.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      📦 {order.items.map((i: any) => `${i.item.name} (x${i.quantity})`).join(", ")}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">
                      📅 Range: {new Date(order.startDate).toLocaleDateString()} to {new Date(order.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">₹{order.totalPrice}</span>
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "SHIPPED")}
                        className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Ship Order
                      </button>
                    )}
                    {order.status === "SHIPPED" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, "DELIVERED")}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {order.status !== "PENDING" && order.status !== "SHIPPED" && (
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase">
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
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShoppingBag className="w-4.5 h-4.5 text-sky-500" />
              My Inventory
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 bg-sky-50 text-sky-600 rounded cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddItem} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Item Name</label>
                <input
                  required
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Snow Gloves"
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Price/Day</label>
                  <input
                    required
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="100"
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Winter Clothes">Winter Clothes</option>
                    <option value="Snow Gear">Snow Gear</option>
                    <option value="Cameras">Cameras</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-sky-600 text-white font-bold rounded-lg text-[10px]">
                Add Listing
              </button>
            </form>
          )}

          <div className="space-y-2 flex-1 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <div className="text-[9px] text-slate-400">{item.category}</div>
                </div>
                <span className="font-bold text-sky-600">₹{item.pricePerDay}/d</span>
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
export function DriverDashboard({ user, isOnline, onLogout }: RoleDashboardsProps) {
  const [online, setOnline] = useState(true);
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    fetchDriverRides();
  }, []);

  const fetchDriverRides = async () => {
    try {
      const res = await fetch("/api/taxi/bookings");
      const data = await res.json();
      if (res.ok) setRides(data.bookings || []);
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
      const res = await fetch(`/api/taxi/bookings/${rideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchDriverRides();
      }
    } catch (err) {
      setRides((prev) => prev.map((r) => (r.id === rideId ? { ...r, status: nextStatus } : r)));
    }
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Driver Panel: {user.name}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage ride requests and complete taxi assignments.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOnline(!online)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              online ? "bg-emerald-500 border-emerald-600 text-white" : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
          >
            {online ? "Online & Matching" : "Offline"}
          </button>
          <button onClick={onLogout} className="px-3.5 py-2 border border-slate-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-bold">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <ClipboardList className="w-4.5 h-4.5 text-sky-500" />
            Assigned Rides
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {rides.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No rides scheduled or matched.</div>
            ) : (
              rides.map((ride) => (
                <div key={ride.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-700">Passenger: {ride.traveler.name}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Contact: {ride.traveler.phone}</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">📍 From: {ride.pickupLocation}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">🏁 To: {ride.dropLocation}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">₹{ride.estimatedFare}</span>
                    {ride.status === "ACCEPTED" && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        Awaiting Passenger OTP
                      </span>
                    )}
                    {ride.status === "STARTED" && (
                      <button
                        onClick={() => handleUpdateRideStatus(ride.id, "COMPLETED")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                      >
                        Complete Ride
                      </button>
                    )}
                    {ride.status === "COMPLETED" && (
                      <span className="text-[9px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase">
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
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-sky-500" />
            Driver Vehicle Profile
          </h3>
          <div className="p-4 border border-slate-150 rounded-xl space-y-2 bg-slate-50 text-xs">
            <div>🚗 **Model:** Toyota Innova Crysta</div>
            <div>🔢 **Plate:** JK-01-A-7788</div>
            <div>👮 **License:** Valid J&K Commercial Taxi Permit</div>
            <div className="text-emerald-700 font-bold">✓ Background Checked</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "./prisma";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function seedDatabase() {
  // Check if seeding is already done (by checking if we have any users)
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("Database already has data. Skipping seed.");
    return { success: true, message: "Database already seeded." };
  }

  console.log("Seeding database...");

  // 1. Create Users
  const passwordHash = hashPassword("password123");

  const traveler = await prisma.user.create({
    data: {
      email: "traveler@voyana.com",
      password: passwordHash,
      name: "Alex Mercer",
      role: "TRAVELER",
      phone: "+1 555-0199",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
      verified: true,
    },
  });

  const guideUser = await prisma.user.create({
    data: {
      email: "zahoor@voyana.com",
      password: passwordHash,
      name: "Zahoor Ahmed",
      role: "GUIDE",
      phone: "+91 9876543210",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      verified: true,
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      email: "bhat@voyana.com",
      password: passwordHash,
      name: "Gulmarg Rentals",
      role: "VENDOR",
      phone: "+91 9988776655",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      verified: true,
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      email: "manzoor@voyana.com",
      password: passwordHash,
      name: "Manzoor Dar",
      role: "DRIVER",
      phone: "+91 9419123456",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      verified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@voyana.com",
      password: passwordHash,
      name: "Sarah Jenkins",
      role: "ADMIN",
      phone: "+1 555-0100",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      verified: true,
    },
  });

  // 2. Create Guide Profile
  const guideProfile = await prisma.guideProfile.create({
    data: {
      userId: guideUser.id,
      languages: "English, Hindi, Kashmiri, Urdu",
      experience: 8,
      specialization: "High-altitude trekking, cultural tours, snow adventure",
      pricePerDay: 2500,
      availability: "AVAILABLE",
      ratings: 4.9,
      verifiedBadge: true,
      location: "Srinagar, Jammu & Kashmir",
      bio: "Local certified guide with 8+ years of guiding in the Himalayas. Passionate about showing the authentic culture, hidden trails, and snow adventures of Kashmir.",
      certificates: "Himalayan Mountaineering Institute Certificate, First Aid Certified",
    },
  });

  // 3. Create Vendor Profile & Rental Items
  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      storeName: "Peak Adventure Rentals",
      location: "Gulmarg Gondola Base, J&K",
      rating: 4.8,
    },
  });

  const item1 = await prisma.rentalItem.create({
    data: {
      vendorId: vendorProfile.id,
      name: "Extreme Cold Winter Jacket",
      category: "Winter Clothes",
      pricePerDay: 300,
      description: "Windproof and waterproof heavy insulated parka suitable for Gulmarg winter temperatures down to -15°C.",
      imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=300&h=300&q=80",
      availableCount: 15,
    },
  });

  const item2 = await prisma.rentalItem.create({
    data: {
      vendorId: vendorProfile.id,
      name: "Pro Snow Boots",
      category: "Snow Gear",
      pricePerDay: 200,
      description: "High traction snow boots with inner fleece lining. Keeps feet warm and dry on deep snow.",
      imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=300&h=300&q=80",
      availableCount: 20,
    },
  });

  const item3 = await prisma.rentalItem.create({
    data: {
      vendorId: vendorProfile.id,
      name: "GoPro Hero 11 Black",
      category: "GoPro",
      pricePerDay: 600,
      description: "Capture your ski run or snowboarding tricks in 5.3K. Includes helmet mount and 3 batteries.",
      imageUrl: "https://images.unsplash.com/photo-1565849906661-ca9d689f7966?auto=format&fit=crop&w=300&h=300&q=80",
      availableCount: 5,
    },
  });

  const item4 = await prisma.rentalItem.create({
    data: {
      vendorId: vendorProfile.id,
      name: "Trekking Pole & Crampons Combo",
      category: "Trekking Gear",
      pricePerDay: 150,
      description: "Essential for walking on frozen streams, glaciers, or snow slopes around Sonmarg.",
      imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdcd1d?auto=format&fit=crop&w=300&h=300&q=80",
      availableCount: 25,
    },
  });

  // 4. Create Driver Profile
  const driverProfile = await prisma.driverProfile.create({
    data: {
      userId: driverUser.id,
      vehicleType: "SUV",
      vehicleNumber: "JK-01-A-7788",
      vehicleModel: "Toyota Innova Crysta (4x4)",
      rating: 4.9,
      status: "AVAILABLE",
      latitude: 34.0837,
      longitude: 74.7973, // Srinagar coordinates
    },
  });

  // 5. Create Trip for Traveler
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2); // starts in 2 days
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 9); // 7 day trip

  const trip = await prisma.trip.create({
    data: {
      userId: traveler.id,
      destination: "Kashmir Valley",
      startDate: startDate,
      endDate: endDate,
      budget: 50000,
      companions: "Solo",
      transportation: "Flight & Taxi",
      accommodation: "Houseboat & Hotels",
      notes: "Adventure trip to explore Srinagar, Gulmarg, Sonmarg, and Pahalgam. Focus on landscape photography, local food, and snow trekking.",
    },
  });

  // 6. Create Destination Links (Timeline)
  const d1 = await prisma.destinationLink.create({
    data: {
      tripId: trip.id,
      name: "Delhi Airport (DEL)",
      visitedDate: new Date(),
      status: "COMPLETED",
      weather: "Sunny, 34°C",
      distanceTraveled: 0,
      gpsCoordinates: "28.5562,77.1000",
      notes: "Transit flight to Srinagar. Check-in went smoothly.",
    },
  });

  const d2 = await prisma.destinationLink.create({
    data: {
      tripId: trip.id,
      name: "Srinagar (Dal Lake)",
      visitedDate: new Date(),
      status: "CURRENT",
      weather: "Pleasant, 22°C",
      distanceTraveled: 800,
      gpsCoordinates: "34.0837,74.7973",
      notes: "Checked into the Golden Crest Houseboat. Beautiful sunset over Dal Lake. Met the local guide Zahoor.",
    },
  });

  const d3 = await prisma.destinationLink.create({
    data: {
      tripId: trip.id,
      name: "Gulmarg (Ski Resort)",
      status: "UPCOMING",
      weather: "Snowy, -2°C",
      distanceTraveled: 50,
      gpsCoordinates: "34.0484,74.3805",
      notes: "Planning to rent snow gears at Base Gondola and take the Gondola phase 2 ride.",
    },
  });

  const d4 = await prisma.destinationLink.create({
    data: {
      tripId: trip.id,
      name: "Sonmarg (Thajiwas Glacier)",
      status: "UPCOMING",
      weather: "Chilly, 8°C",
      distanceTraveled: 120,
      gpsCoordinates: "34.3015,75.2979",
      notes: "Sledging and walking up to the Thajiwas Glacier. Need trekking poles.",
    },
  });

  const d5 = await prisma.destinationLink.create({
    data: {
      tripId: trip.id,
      name: "Pahalgam (Betaab Valley)",
      status: "UPCOMING",
      weather: "Cloudy, 14°C",
      distanceTraveled: 90,
      gpsCoordinates: "34.0161,75.3150",
      notes: "Pony ride to Baisaran Meadow (Mini Switzerland) and river rafting.",
    },
  });

  // 7. Create Day-wise Itinerary
  await prisma.itineraryDay.createMany({
    data: [
      {
        tripId: trip.id,
        dayNumber: 1,
        activities: "Arrival in Srinagar, Shikara ride on Dal Lake at sunset, check-in to Houseboat, meeting guide Zahoor.",
        expenses: 1200,
      },
      {
        tripId: trip.id,
        dayNumber: 2,
        activities: "Srinagar sightseeing: Shalimar Bagh, Nishat Bagh, Hazratbal Shrine, and tasting local Wazwan dinner.",
        expenses: 2500,
      },
      {
        tripId: trip.id,
        dayNumber: 3,
        activities: "Drive to Gulmarg, check-in at resort, rent skiing clothes and winter boots, walk around the golf course.",
        expenses: 3000,
      },
      {
        tripId: trip.id,
        dayNumber: 4,
        activities: "Gulmarg Gondola Ride (Phase 1 & 2), snow trekking on Apharwat peak, photography session.",
        expenses: 4500,
      },
      {
        tripId: trip.id,
        dayNumber: 5,
        activities: "Drive to Sonmarg, walk/pony ride up to Thajiwas Glacier, drinking local Kahwa on the river banks.",
        expenses: 2200,
      },
      {
        tripId: trip.id,
        dayNumber: 6,
        activities: "Travel to Pahalgam, check-in, visit Betaab Valley and Aru Valley, campfire at hotel.",
        expenses: 3500,
      },
      {
        tripId: trip.id,
        dayNumber: 7,
        activities: "Local shopping in Srinagar (saffron, dry fruits, pashmina shawls) and flight back home.",
        expenses: 8000,
      },
    ],
  });

  // 8. Create Checklist Items
  await prisma.checklistItem.createMany({
    data: [
      { tripId: trip.id, task: "Print Flight Ticket & Hotel Bookings", completed: true },
      { tripId: trip.id, task: "Carry Postpaid SIM (Prepaid doesn't work in J&K)", completed: true },
      { tripId: trip.id, task: "Pack thermal innerwear & heavy gloves", completed: true },
      { tripId: trip.id, task: "First-aid kit & altitude sickness medicine", completed: false },
      { tripId: trip.id, task: "Charge camera batteries and power banks", completed: false },
      { tripId: trip.id, task: "Cash (limited ATM connectivity in remote areas)", completed: false },
    ],
  });

  // 9. Create Expenses
  await prisma.expense.createMany({
    data: [
      { tripId: trip.id, userId: traveler.id, amount: 4500, category: "Hotel", description: "Srinagar Houseboat Deposit", date: new Date() },
      { tripId: trip.id, userId: traveler.id, amount: 800, category: "Food", description: "Lunch at Mughal Darbar", date: new Date() },
      { tripId: trip.id, userId: traveler.id, amount: 1500, category: "Taxi", description: "Airport pickup transfer", date: new Date() },
      { tripId: trip.id, userId: traveler.id, amount: 2500, category: "Guide", description: "Guide Zahoor advanced payment", date: new Date() },
    ],
  });

  // 10. Create Journal Entry
  await prisma.journalEntry.create({
    data: {
      userId: traveler.id,
      title: "First Night on a Houseboat",
      content: "Sleeping on Dal Lake is a surreal experience. The wood carvings on the ceiling of the houseboat are exquisite. As night fell, the lake became incredibly silent, reflecting the lights from the surrounding Shankaracharya hill. Zahoor (the guide) brought some hot Kashmiri Kahwa. Looking forward to Gulmarg!",
      mood: "Excited",
      location: "Dal Lake, Srinagar",
      weather: "Clear, 16°C",
      photos: "https://images.unsplash.com/photo-1566837430227-430aa6b2b7b2?auto=format&fit=crop&w=600&q=80",
    },
  });

  // 11. Create Emergency Contacts
  await prisma.emergencyContact.createMany({
    data: [
      { userId: traveler.id, name: "Helen Mercer (Mother)", relationship: "Mother", phone: "+1 555-0102" },
      { userId: traveler.id, name: "Srinagar Tourism Helpline", relationship: "Local Authority", phone: "+91 194-2502279" },
      { userId: traveler.id, name: "Gulmarg Police Station", relationship: "Local Authority", phone: "+91 1954-254424" },
    ],
  });

  // 12. Create Saved Places
  await prisma.savedPlace.createMany({
    data: [
      { userId: traveler.id, name: "Ahdoos Restaurant", address: "Residency Road, Srinagar", latitude: 34.0725, longitude: 74.8112, category: "Restaurant" },
      { userId: traveler.id, name: "Shankaracharya Temple", address: "Srinagar Hill", latitude: 34.0701, longitude: 74.8455, category: "Attraction" },
    ],
  });

  // 13. Create Notifications
  await prisma.notification.createMany({
    data: [
      { userId: traveler.id, title: "Weather Alert: Gulmarg Snowfall", body: "Heavy snow forecast in Gulmarg starting tomorrow. Temperature will drop to -5°C. Ensure you pack thermal layers and snow gear.", type: "WEATHER_ALERT" },
      { userId: traveler.id, title: "Booking Confirmed", body: "Your guide booking with Zahoor Ahmed has been confirmed for July 18th.", type: "TRIP_ALERT" },
    ],
  });

  // 14. Create Reviews
  await prisma.review.create({
    data: {
      reviewerId: traveler.id,
      guideId: guideProfile.id,
      rating: 5,
      comment: "Zahoor was amazing! He knows Srinagar inside out and helped me find the best photo locations at Dal Lake. Highly recommend him!",
    },
  });

  await prisma.review.create({
    data: {
      reviewerId: traveler.id,
      rentalItemId: item1.id,
      rating: 5,
      comment: "Jacket was in perfect condition and extremely warm. Kept me cozy during sub-zero temperatures in Gulmarg.",
    },
  });

  console.log("Database seeded successfully!");
  return { success: true, message: "Database seeded successfully!" };
}

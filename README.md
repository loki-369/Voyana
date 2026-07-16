# 🧭 Voyana

### *Travel Freely. Explore Confidently.*

Voyana is a production-quality, modern, full-stack travel companion platform designed specifically for independent travelers exploring Jammu & Kashmir (Srinagar, Gulmarg, Pahalgam, Sonmarg). Unlike traditional booking apps, Voyana accompanies the traveler before, during, and after their journey with offline-first synchronization, local marketplaces, safety tools, and an AI travel assistant.

---

## 🚀 Key Features

### 1. Unified Client Dashboard
- **Traveler Dashboard:** Greet travelers, show location weather indicators, display overall budget spent ratios, checklist trackers, and recent expenses.
- **Admin Dashboard:** Tracks overall platform revenue commission cuts, user stats, security audit logs, and handles guide/vendor verification approvals.
- **Onboarding Slider & Sandbox:** Presents app value propositions with sliders. Includes a **Development Sandbox Role Switcher** (bottom-left) to instantly test Traveler, Guide, Vendor, Taxi Driver, and Administrator dashboards on the fly.

### 2. Leaflet Mapping & Route Management
- **Timeline & Route manager:** Vertical draggable timeline coordinates, active weather conditions, travel distances, and checklist shortcuts.
- **Dynamic Leaflet Map:** Displays the active itinerary nodes, local hotel markers, police/medical services, and live cab tracking coordinates.

### 3. J&K Local Marketplaces
- **Tour Guide Booking:** Hire certified guides (cultural, high-altitude trekking) directly.
- **Extreme Gear Rental:** Rent winter parkas, snow boots, GoPros, and trekking poles.
- **Matched Cab Taxi:** Request local airport or snow-capable cabs with OTP verification.

### 4. Emergency SOS & Offline Support
- **SOS Button:** Trigger a 5-second countdown alarm that emails emergency contacts.
- **Offline Lists:** Access local police stations, tourism helpdesks, and hospitals without internet coverage.
- **Memories Journal:** Capture daily journals, photos, and record mock voice notes.
- **Offline Sync Queue:** Optimistic offline updates are cached in `localStorage` and synchronized automatically once network connection is restored.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database ORM:** Prisma 6 (local SQLite database `dev.db`)
- **Interactive Maps:** Leaflet Maps (Client-side dynamic SSR wrapper)
- **Styling:** Tailwind CSS v4 & custom animations
- **Icons:** Lucide Icons

---

## 💻 Local Setup Instructions

### 1. Install Dependencies
Clone the repository and install all node packages:
```bash
npm install
```

### 2. Initialize Database & Tables
Sync your local SQLite database file (`dev.db`) with the Prisma schema models:
```bash
npx prisma db push
```

### 3. Seed Database Mock Data
Populate the database with pre-configured guides, rental items, driver coordinates, checklists, and active Kashmir trip timelines:
```bash
npx prisma db seed
```

### 4. Launch Development Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🐳 Docker Deployment

To build and run Voyana using Docker and Docker Compose:

1. **Build and start container:**
   ```bash
   docker-compose up --build -d
   ```
2. **Access App:** Open browser at `http://localhost:3000`
3. **Shutdown container:**
   ```bash
   docker-compose down
   ```

---

## ⚡ Developer & Evaluator Sandbox Controls
To easily test and grade the multi-role application:
1. Access the app and complete the Onboarding screen by logging in, or simply click one of the **Evaluator Quick Links** (e.g. *Traveler Profile*, *Guide Profile*, etc.) on the login card.
2. Once logged in, use the **dropdown select menu in the bottom-left corner of the viewport** to dynamically swap roles (Traveler ↔ Guide ↔ Vendor ↔ Driver ↔ Admin) instantly without logging out.
3. Toggle your web browser to **Offline Mode** in Chrome DevTools to verify that adding timeline items, ticking checklists, or creating expenses updates dynamically and pushes into the sync queue, syncing automatically when toggled back online.

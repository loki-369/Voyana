# 🧭 Voyana — Travel Companion

### *Travel Freely. Explore Confidently.*

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://voyana-drab.vercel.app/)
[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.10-blue?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Database ORM](https://img.shields.io/badge/Prisma-6.2.0-indigo?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

Voyana is a production-quality, modern, full-stack travel companion platform designed specifically for independent travelers exploring Jammu & Kashmir (Srinagar, Gulmarg, Pahalgam, Sonmarg). Unlike traditional booking apps, Voyana accompanies the traveler before, during, and after their journey with offline-first synchronization, local marketplaces, safety tools, and an AI travel assistant.

**✨ Live Preview:** [https://voyana-drab.vercel.app/](https://voyana-drab.vercel.app/)

---

## 🚀 Key Features

### 1. Unified Client Dashboard
* **Traveler Dashboard:** Greet travelers, show live location weather indicators, display overall budget spent ratios, checklist trackers, and recent expenses.
* **Admin Dashboard:** Tracks overall platform revenue commission cuts, user stats, security audit logs, and handles guide/vendor verification approvals.
* **Onboarding Slider & Sandbox:** Presents app value propositions with sliders. Includes a **Development Sandbox Role Switcher** (bottom-left) to instantly test Traveler, Guide, Vendor, Taxi Driver, and Administrator dashboards on the fly.

### 2. Leaflet Mapping & Route Management
* **Timeline & Route manager:** Vertical draggable timeline coordinates, active weather conditions, travel distances, and checklist shortcuts.
* **Dynamic Leaflet Map:** Displays the active itinerary nodes, local hotel markers, police/medical services, and live cab tracking coordinates.

### 3. J&K Local Marketplaces
* **Tour Guide Booking:** Hire certified guides (cultural, high-altitude trekking) directly.
* **Extreme Gear Rental:** Rent winter parkas, snow boots, GoPros, and trekking poles.
* **Matched Cab Taxi:** Request local airport or snow-capable cabs with OTP verification.

### 4. Emergency SOS & Offline Support
* **SOS Button:** Trigger a 5-second countdown alarm that emails emergency contacts.
* **Offline Lists:** Access local police stations, tourism helpdesks, and hospitals without internet coverage.
* **Memories Journal:** Capture daily journals, photos, and record mock voice notes.
* **Offline Sync Queue:** Optimistic offline updates are cached in `localStorage` and synchronized automatically once network connection is restored.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | High-performance React framework with server actions |
| **Language** | TypeScript | Strong typing for scalable frontend & API logic |
| **Database ORM** | Prisma 6 | Local SQLite database (`dev.db`) for easy local evaluation |
| **Interactive Maps** | Leaflet Maps | Client-side dynamic SSR wrapper for OpenStreetMap |
| **Styling** | Tailwind CSS v4 & custom animations | Dark obsidian header, saffron accent, glassmorphism |
| **Icons** | Lucide Icons | Clean minimal vector outline styling |

---

## ☁️ Vercel Deployment (Free Cloud Setup)

The app uses **PostgreSQL** (via [Neon](https://neon.tech)) as its cloud database on Vercel. SQLite is not supported in serverless environments.

### Step 1 — Create a Free Neon Database
1. Go to [https://neon.tech](https://neon.tech) and sign up (free)
2. Click **New Project** → give it a name (e.g. `voyana`)
3. Copy the **Connection String** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2 — Add Environment Variables to Vercel
1. Open your Vercel project → **Settings** → **Environment Variables**
2. Add the following:

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `JWT_SECRET` | Any random secret string (e.g. `voyana-prod-secret-2026`) |
| `OPENAI_API_KEY` | *(Optional)* Your OpenAI API key for AI assistant |

### Step 3 — Redeploy
Vercel will automatically run `prisma db push && next build` which creates all database tables in Neon and builds the app.

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

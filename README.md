# 🏡 RentNest — Modern Rental Housing Marketplace

RentNest is a production-grade, full-stack rental housing marketplace web application built with **Next.js 16 (App Router)**, **TypeScript**, and **TailwindCSS v4**, paired with a **Node.js / Express / Prisma / PostgreSQL (NeonDB)** backend and **Stripe** payment processing.

---

## 📋 Assignment Rubric Mapping & Verification

| # | Rubric Category | Weight | Implementation Details |
| :-: | :--- | :-: | :--- |
| **1** | **UI/UX Design & Responsiveness** | **20%** | Modern TailwindCSS v4 design, responsive mobile/desktop layouts, loading skeletons, Sonner toasts, and **Dark/Light Mode** theme toggle. |
| **2** | **State Management & Data Fetching** | **20%** | App Router Server Components with streaming `<Suspense>` on homepage, interactive Client Components, and JWT cookie session management via `js-cookie`. |
| **3** | **Commit History** | **10%** | 20+ atomic, meaningful Git commits following conventional commit standards (`feat:`, `refactor:`, `docs:`). |
| **4** | **Error Handling & Validation** | **10%** | Custom App Router Error Boundary (`app/error.tsx`), custom 404 page (`app/not-found.tsx`), route transition loading (`app/loading.tsx`), and API error handling. |
| **5** | **Core Functionality** | **20%** | JWT authentication, role guards via Next.js 16 `proxy.ts`, dynamic details with user reviews, and **Full CRUD** (Create, Read, Update, Delete) in Landlord portal. |
| **6** | **Payment Integration** | **10%** | Stripe PaymentIntent processing (`POST /api/payment/pay`), UI status updates to `PAID`, and printable official rental payment receipt modal. |

---

## 🔑 Demo & Examiner Credentials

Use the following test credentials to evaluate all role-based dashboards and permissions:

| User Role | Email | Password | Assigned Dashboard |
| :--- | :--- | :--- | :--- |
| 🛡️ **Super Admin** | `admin@rentnest.com` | `admin123` | `/dashboard/admin` |
| 👤 **Verified Tenant** | `jane@example.com` | `Password123!` | `/dashboard/tenant` |
| 🏠 **Landlord** | *Register at `/auth/register` with role `LANDLORD`* | *Custom* | `/dashboard/landlord` |

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Authentication & Route Guarding
- **Next.js 16 Proxy Convention (`proxy.ts`)**: Migrated to the modern Next.js 16 network proxy convention. Automatically intercepts requests to `/dashboard/*` to verify authentication and enforce strict role boundaries (`ADMIN`, `LANDLORD`, `TENANT`).
- **Dynamic Header ([`Navbar.tsx`](components/shared/Navbar.tsx))**: Automatically adapts navigation links, shows active user's name linking to `/dashboard/profile`, displays role badge, and provides logout.

### 2. 🔍 Advanced Property Catalog ([`/properties`](app/properties/page.tsx))
- **Real-Time Text Search**: Searches across property title, area, and city.
- **Dynamic Category Filter**: Fetches active categories from the database.
- **Bedroom Filter**: Filter listings by `1+ Bed`, `2+ Beds`, `3+ Beds`, `4+ Beds`.
- **Max Budget Filter**: Exclude properties exceeding a maximum price threshold.
- **Sorting**: Toggle between `Price: Low to High` and `Price: High to Low`.
- **One-Click Reset**: Resets all filters back to default.

### 3. 🏠 Dynamic Property Details & Reviews ([`/properties/[id]`](app/properties/[id]/page.tsx))
- High-res photo gallery with studio/apartment fallback architecture.
- Landlord contact card with email and phone details.
- Tenant rental booking form with move-in date picker and notes.
- **Interactive Ratings & Reviews**: 1–5 clickable star ratings, submission form, and reverse-chronological feedback feed.

### 4. 🏢 Full CRUD Landlord Portal ([`/dashboard/landlord`](app/dashboard/landlord/page.tsx))
- **Create**: Publish new listings with images, amenities, pricing, and category.
- **Read**: Browse all active listings under management.
- **Update**: Interactive **Edit Property Modal** (`PUT /api/properties/:id`) to update pricing, specifications, location, or description.
- **Delete**: Remove properties with confirmation dialog.
- **Rental Request Moderation**: Approve or Reject incoming tenant applications in real-time.

### 5. 💳 Tenant Portal & Stripe Payments ([`/dashboard/tenant`](app/dashboard/tenant/page.tsx))
- Overview of all rental requests with live status badges (`PENDING`, `APPROVED`, `REJECTED`).
- One-click rent payment processing powered by the backend Stripe API.
- **Official Rental Receipt Modal**: View and print verified payment receipts with Stripe Transaction IDs, lease duration, and move-in terms.

### 6. 🌓 Theme Customization (Dark / Light Mode)
- Built with `next-themes` and Tailwind CSS v4 variables.
- Toggle between dark and light themes with persistent `localStorage` synchronization.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.4 (Turbopack, App Router, `proxy.ts` convention)
- **Library**: React 19, TypeScript
- **Styling**: TailwindCSS v4, Lucide Icons, Shadcn UI / `@base-ui/react`
- **Notifications**: Sonner Toasts
- **Theme**: `next-themes`
- **Backend API**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL on NeonDB Serverless
- **Payment Gateway**: Stripe API

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL connection string (configured in backend `.env`)

### 2. Frontend Setup
```bash
cd rentnest-frontend

# Install dependencies
npm install

# Create environment file (.env.local)
# NEXT_PUBLIC_API_URL="http://localhost:5000/api"

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Backend Setup
```bash
cd rentnest_backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed initial admin user
npm run seed

# Run backend development server
npm run dev
```
Backend will be listening on [http://localhost:5000](http://localhost:5000).

---

## 📂 Project Structure

```
rentnest-frontend/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── dashboard/
│   │   ├── admin/page.tsx        # Admin control center
│   │   ├── landlord/page.tsx     # Landlord portal (Full CRUD)
│   │   ├── tenant/page.tsx       # Tenant portal & Stripe receipts
│   │   └── profile/page.tsx      # User profile settings
│   ├── properties/
│   │   ├── page.tsx              # Property catalog & filters
│   │   └── [id]/page.tsx         # Property details & reviews
│   ├── error.tsx                 # App Router Error Boundary
│   ├── not-found.tsx             # Custom 404 page
│   ├── loading.tsx               # Route transition loading state
│   ├── layout.tsx                # Theme provider & root layout
│   └── page.tsx                  # Homepage with streaming Suspense
├── components/
│   ├── shared/
│   │   ├── Navbar.tsx            # Dynamic role-aware navigation
│   │   └── ThemeToggle.tsx       # Dark/Light mode toggle button
│   ├── ui/                       # Reusable UI component primitives
│   └── theme-provider.tsx        # Next-themes wrapper
├── proxy.ts                      # Next.js 16 edge route guard
└── package.json
```

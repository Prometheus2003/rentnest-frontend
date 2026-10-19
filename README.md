# 🏡 RentNest — Modern Rental Housing Marketplace

RentNest is a full-stack rental marketplace built with **Next.js 16 (App Router)**, **TypeScript**, and **TailwindCSS v4**, paired with a **Node.js / Express / Prisma / PostgreSQL (NeonDB)** backend and **Stripe** payment processing.

---

## 🌟 Key Features

### 👤 Role-Based Portals & Route Protection
- **Tenant Portal**: Submit rental requests, monitor status (`PENDING`, `APPROVED`, `REJECTED`), process payments via Stripe, and review rented properties.
- **Landlord Portal**: Publish new listings, manage properties, review tenant applications with single-click Approve / Reject actions.
- **Admin Control Center**: Monitor platform KPIs, manage user accounts (Activate / Ban / Role changes), and supervise listings.
- **Next.js 16 Proxy (`proxy.ts`)**: Route-level middleware interceptor protecting `/dashboard/*` and redirecting authenticated users away from `/auth/*`.

### 🔍 Interactive Property Catalog
- **Live Search**: Instant text search by title, city, or area.
- **Dynamic Category Filtering**: Categories loaded directly from the database.
- **Bedroom & Budget Filters**: Filter listings by minimum bedrooms (`1+`, `2+`, `3+`, `4+`) and maximum monthly budget.
- **Sorting**: Price sorting (`Low to High` and `High to Low`).
- **Resilience**: Animated loading skeletons, empty state fallback, and instant filter reset.

### 🏠 Property Details & Reviews
- High-res image display, property specifications (bedrooms, bathrooms, amenities).
- Landlord contact card.
- Tenant rental booking form with move-in date and personalized notes.
- **Interactive Ratings & Reviews**: 1–5 clickable star rating system, user feedback submission, and reverse-chronological review feed.

### 🛡️ Error & Loading Boundaries
- Custom **404 Not Found** page (`app/not-found.tsx`).
- React client-side **Error Boundary** with retry mechanism (`app/error.tsx`).
- Route transition loading states (`app/loading.tsx`).
- Streaming partial prerendering with `<Suspense>` boundaries (`app/page.tsx`).

---

## 🔑 Demo & Grading Credentials

Use the following credentials to test role-based access:

| Role | Email | Password | Dashboard Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@rentnest.com` | `admin123` | `/dashboard/admin` |
| **Tenant** | `jane@example.com` | `Password123!` | `/dashboard/tenant` |
| **Landlord** | *Register at `/auth/register` with role `LANDLORD`* | *Custom* | `/dashboard/landlord` |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.4 (Turbopack, App Router, `proxy.ts` convention), React 19, TypeScript
- **Styling & UI**: TailwindCSS v4, Lucide Icons, Shadcn UI / `@base-ui/react`, Sonner Toasts
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL (NeonDB Serverless)
- **Authentication**: JWT with secure HTTP cookies via `js-cookie`
- **Payments**: Stripe API

---

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env.local` file in `rentnest-frontend`:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"

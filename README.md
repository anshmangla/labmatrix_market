# 🔬 LabMatrix Surplus Marketplace

> **The Premier B2B Marketplace for Refurbished & Pre-Owned Analytical Instruments, Laboratory Equipment & Spare Parts**  
> Operated by **Labmatrix Instrument India Pvt. Ltd.** • [https://surplus.labmatrixindia.com](https://surplus.labmatrixindia.com)

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.10-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169e1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Resend](https://img.shields.io/badge/Email-Resend-black?style=flat-square)](https://resend.com/)
[![PageSpeed](https://img.shields.io/badge/PageSpeed-100%2F100_Desktop_%7C_99%2F100_Mobile-brightgreen?style=flat-square&logo=google)](https://pagespeed.web.dev/)

---

## 📌 Overview

**LabMatrix Surplus Marketplace** is a high-performance B2B equipment liquidity platform designed specifically for the Indian scientific, pharmaceutical, biotechnology, and analytical research sectors. 

It allows verified labs, universities, testing centers, and manufacturers to:
* **Buy & Sell Pre-Owned Analytical Machinery:** ICP-OES, ICP-MS, Atomic Absorption Spectrometers (AAS), UV-Visible Spectrophotometers, Gas Chromatography (GC), High-Performance Liquid Chromatography (HPLC), and general laboratory instruments.
* **Source Spare Parts & Consumables:** Filter and procure components with exact part numbers, model numbers, and instrument compatibility tags.
* **Browse New Instruments:** Dedicated showcase for newly available scientific instruments and turnkey laboratory setups.
* **Post Sourcing / Procurement Requests (RFQs):** Post specific equipment requirements so verified sellers and the LabMatrix operations team can match supply with demand.

---

## ✨ Key Features

### 🛒 1. Catalog & Discovery
* **Three Dedicated Catalogs:**
  * **Available Equipment:** Pre-owned and refurbished analytical machinery.
  * **Spare Parts & Consumables:** Components tagged with part numbers and compatibility.
  * **New Instruments:** Brand new laboratory instruments and systems.
* **Duplicate Listing Workflow:** Pre-fill existing listing specifications to post similar items in seconds.
* **Quantity & Condition Selectors:** Built-in quantity management and condition grading (*New*, *Like New*, *Used - Good*, *Used - Fair*).
* **Clickable Unified Cards:** Fully accessible card navigation across both equipment and spare part listings.
* **Advanced Multi-Dimensional Filtering:** Search by query, category, price range, condition, and availability.

### 🛡️ 2. Admin Moderation & Quality Control (`/admin`)
* **Strict Admin Approval Flow:** Every listing and buyer requirement is initialized with `isApproved: false` to ensure counterfeit and spam items never enter the marketplace.
* **Automated Admin Review Alerts:** Immediate email dispatched to `sales@labmatrixindia.com` with complete specifications and submitter contact info upon item creation.
* **User Approval Notification:** An automated branded email is sent to the user **only after** an admin verifies and approves the listing, containing direct links to the live item.
* **Platform Management:** Admin dashboard with real-time analytics, user role promotions, inquiry management, and one-click item moderation.

### ⚡ 3. Performance & Web Vitals
* **Top-Tier Lighthouse Scores:** **100 / 100 Desktop** and **99 / 100 Mobile** on Google PageSpeed Insights.
* **Cloudinary Auto-Compression:** Automatic next-gen format conversion (`f_auto,q_auto`) and responsive thumbnail resizing reducing payload sizes by ~90%.
* **Edge CDN Caching:** Global Edge caching headers (`s-maxage=60, stale-while-revalidate=300`) for instantaneous catalog navigation.
* **Server-Side Hydration:** Zero-skeleton initial server rendering with React Server Components.
* **Database Connection Pooling:** Neon Serverless PostgreSQL with `@prisma/adapter-pg` driver pooling and React `cache()` deduplication.

### 🔒 4. Authentication & Security
* **NextAuth v5 (Auth.js):** Session-based authentication with bcrypt password encryption.
* **OTP Email Verification:** 6-digit OTP delivery via Resend for registration and secure password resets.
* **Account Privacy & Deletion:** Self-service account deactivation with automated archival and confirmation receipts.
* **Rate-Limiting:** Built-in sliding window rate limiters guarding listing creation and authentication endpoints.

### 🔍 5. Search Engine Optimization (SEO)
* **Automated Dynamic Sitemap:** Dynamic [`/sitemap.xml`](https://surplus.labmatrixindia.com/sitemap.xml) updating in real-time as new listings and requests are approved.
* **Configured Robots Directives:** Complete [`/robots.txt`](https://surplus.labmatrixindia.com/robots.txt) allowing search engines to index catalog pages while shielding admin and auth portals.
* **Rich Metadata & OpenGraph:** OpenGraph and Twitter card previews for social sharing.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) |
| **Database** | [PostgreSQL (Neon Serverless)](https://neon.tech/) |
| **ORM** | [Prisma ORM 7.10](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Authentication** | [NextAuth.js v5 (Beta 32)](https://authjs.dev/) |
| **Email Service** | [Resend](https://resend.com/) (Domain: `surplus.labmatrixindia.com`) |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) (WebP/AVIF auto-formatting) |
| **Hosting** | [Vercel](https://vercel.com/) Edge Network |

---

## 📁 Project Structure

```text
labmatrix_market/
├── prisma/
│   └── schema.prisma               # Database models (User, Listing, Requirement, Notification, etc.)
├── public/                         # Static assets (favicons, logos, icons)
├── src/
│   ├── app/
│   │   ├── admin/                  # Admin portal dashboard
│   │   ├── api/                    # RESTful Next.js Route Handlers
│   │   │   ├── admin/              # Admin CRUD and approval APIs
│   │   │   ├── auth/               # Sign-in, OTP, and password reset endpoints
│   │   │   ├── listings/           # Catalog retrieval and creation endpoints
│   │   │   └── requirements/       # Sourcing request endpoints
│   │   ├── auth/                   # Client authentication pages (signin, signup, forgot-password)
│   │   ├── dashboard/              # User dashboard (manage listings & requests)
│   │   ├── listings/               # Available equipments catalog & details
│   │   ├── new-instruments/        # New scientific instruments showcase
│   │   ├── requests/               # Buyer sourcing requirements
│   │   ├── spare-parts/            # Spare parts & consumables catalog
│   │   ├── layout.tsx              # Root HTML layout with preconnections & navbar
│   │   ├── page.tsx                # Homepage featuring hero, categories, and recent arrivals
│   │   ├── robots.ts               # Dynamic robots.txt generation
│   │   └── sitemap.ts              # Dynamic sitemap.xml generation
│   ├── components/                 # Reusable UI components
│   │   ├── layout/                 # Navbar, Footer, NotificationBell
│   │   ├── listings/               # ListingsClient, SparePartsClient, PhotoGallery, DuplicateButton
│   │   └── ui/                     # Generic modals, inputs, and buttons
│   ├── lib/
│   │   ├── images.ts               # Cloudinary responsive image optimizer
│   │   ├── prisma.ts               # Singleton Prisma client with serverless driver adapter
│   │   ├── rate-limit.ts           # In-memory API rate limiter
│   │   └── resend.ts               # Email dispatchers & branded HTML templates
│   └── types/                      # TypeScript declarations
├── next.config.ts                  # Next.js build configuration & asset caching headers
└── package.json                    # Project dependencies and run scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v20.x or higher
* **npm**: v10.x or higher
* **PostgreSQL**: Neon, Supabase, or a local PostgreSQL instance

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/anshmangla/labmatrix_market.git
cd labmatrix_market
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your configuration details:
```env
# Neon PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"

# NextAuth Configuration
AUTH_SECRET="your-secure-random-secret-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Optional Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Platform Administrator Email (Auto-elevates account to ADMIN role)
ADMIN_EMAIL="admin@labmatrixindia.com"

# Resend Email Configuration (Verified Domain: surplus.labmatrixindia.com)
RESEND_API_KEY="re_123456789"
RESEND_FROM_EMAIL="LabMatrix Marketplace <notifications@surplus.labmatrixindia.com>"
CONTACT_TO_EMAIL="sales@labmatrixindia.com"
ADMIN_NOTIF_EMAIL="sales@labmatrixindia.com"
```

### 4. Database Setup
Generate Prisma client artifacts and synchronize schema with your database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build and Production Deployment

To create an optimized production build:
```bash
npm run build
npm start
```

### Deploying to Vercel
This repository is configured for zero-configuration continuous deployment on Vercel:
1. Import repository into your [Vercel Dashboard](https://vercel.com/).
2. Add your production environment variables (from `.env`).
3. Deploy! Vercel automatically runs `postinstall: prisma generate` and `next build`.

---

## 📞 Support & Contacts

* **Website:** [https://surplus.labmatrixindia.com](https://surplus.labmatrixindia.com)
* **Parent Company:** Labmatrix Instrument India Pvt. Ltd.
* **Corporate Office:** 514/5, Mehrauli, New Delhi – 110030, India
* **Sales & Inquiries Desk:** [sales@labmatrixindia.com](mailto:sales@labmatrixindia.com)

---

&copy; 2026 **Labmatrix Instrument India Pvt. Ltd.** All rights reserved.

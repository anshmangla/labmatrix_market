# LabMatrix Platform — Comprehensive Security Audit & Vulnerability Assessment Report

**Audit Target:** LabMatrix B2B Equipment Marketplace (`labmatrix_market`)  
**Date of Assessment:** October 14, 2026  
**Assessment Type:** Full Source Code Static Security Audit, Logic Flow Analysis & Dependency Assessment  
**Audit Scope:** Next.js 16 (App Router), Auth.js (NextAuth v5 beta), Prisma ORM 7, PostgreSQL (Neon), Cloudinary Integration, and all REST API Route Handlers.

---

## Executive Summary

A comprehensive, defense-in-depth security audit was conducted on the entire source codebase of the LabMatrix platform. The assessment evaluated access control models (IDOR), authentication/session flows, denial of service (DoS/DDoS) attack surfaces, input validation, injection resistance, server configuration, dependency CVEs, and code hygiene.

### Severity Summary Table

| Severity Level | Count | Primary Impact Areas |
| :--- | :---: | :--- |
| **Critical** | **1** | Client-controlled JWT role modification leading to privilege escalation |
| **High** | **2** | Pre-account takeover via unverified email OAuth linking; Unbounded file upload memory exhaustion (DoS) |
| **Medium** | **4** | Unbounded database queries (missing pagination); Absence of rate limiting; Schema & numeric boundary validation flaws; Missing HTTP security headers |
| **Low / Info** | **4** | First-user admin promotion race condition; Raw error message disclosures; Dev-dependency CVE advisories; Database pool connection management |

Overall, the application incorporates positive privacy design principles (e.g., strictly omitting buyer/seller contact details in public Prisma query selects and scoping user notification mutations to `session.user.id`). However, several critical authorization, input validation, and resource management vulnerabilities require remediation before production deployment.

---

## Detailed Vulnerability & Risk Analysis

---

### Section 1: Authentication, Session Handling & Privilege Escalation

#### 1.1 [CRITICAL] Client-Controlled JWT Role Elevation Leading to Privilege Escalation
* **Affected File:** `src/auth.ts` (Lines 66–68)
* **Vulnerability Type:** CWE-269: Improper Privilege Management / Insecure Session State Update
* **Mechanics:**
  In Auth.js / NextAuth v5, the `jwt` callback handles session updates triggered from the client via `useSession().update(...)` or `POST /api/auth/session`:
  ```typescript
  // src/auth.ts (Lines 66-68)
  if (trigger === "update" && session?.user) {
    token.role = session.user.role ?? token.role;
  }
  ```
  The callback blindly accepts and copies `session.user.role` from the client-supplied payload directly into `token.role`. 
  Because downstream resource endpoints (such as `PATCH /api/listings/[id]` and `PATCH /api/requirements/[id]`) determine administrative authority using `(session.user as any)?.role === "ADMIN"`, any regular authenticated user can issue a client-side update with `{ user: { role: "ADMIN" } }` to stamp their own JWT token with `ADMIN` privileges.
* **Impact:** 
  A standard user can unilaterally elevate themselves to Administrator privileges in token-checked endpoints, granting them the ability to approve their own or any listings/requirements and access private previews.
* **Remediation Recommendation:**
  Never trust client-supplied role parameters in the JWT `update` trigger. Role changes must be fetched exclusively from the database:
  ```typescript
  if (trigger === "update") {
    const freshUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { role: true },
    });
    if (freshUser) {
      token.role = freshUser.role;
    }
  }
  ```

---

#### 1.2 [HIGH] Pre-Account Takeover via Unverified Email and `allowDangerousEmailAccountLinking`
* **Affected Files:** `src/auth.ts` (Line 21) & `src/app/api/auth/register/route.ts`
* **Vulnerability Type:** CWE-287: Improper Authentication / Account Takeover
* **Mechanics:**
  1. The Google OAuth provider in `src/auth.ts` has `allowDangerousEmailAccountLinking: true`.
  2. The registration route (`POST /api/auth/register`) allows arbitrary email registration with password and does **not** enforce email verification.
  3. An attacker can register an account using a target's corporate email (e.g. `victim@pharma.com`) with a password known to the attacker.
  4. When the legitimate owner logs in using "Sign in with Google" with `victim@pharma.com`, NextAuth automatically links the Google identity to the existing credentials user.
* **Impact:**
  The attacker retains credentials-based password access to the victim's account, enabling unauthorized access to private notifications, listings, procurement inquiries, and contact numbers.
* **Remediation Recommendation:**
  - Disable `allowDangerousEmailAccountLinking` unless explicit email verification (via OTP or magic link) has occurred prior to account linking.
  - Implement email verification tokens upon registration before allowing password-based login.

---

#### 1.3 [LOW] Unrestricted First-User Admin Bootstrap Race Condition
* **Affected File:** `src/app/api/admin/promote/route.ts` (Lines 12–44)
* **Vulnerability Type:** CWE-284: Improper Access Control
* **Mechanics:**
  The promotion logic allows self-promotion if `adminCount === 0`:
  ```typescript
  if (adminCount === 0 || isOwnerEmail) {
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { role: "ADMIN" },
    });
  ```
  On a fresh database or if existing admins are deleted/demoted, the first user to invoke `POST /api/admin/promote` claims the Master Administrator role regardless of identity.
* **Remediation Recommendation:**
  Restrict admin bootstrapping strictly to environment configuration (e.g., `ADMIN_EMAILS`) or via a secure CLI command (`npm run create-admin`), removing the `adminCount === 0` open registration bypass.

---

### Section 2: Broken Access Control & IDOR (Insecure Direct Object References)

#### 2.1 [HIGH] Discrepant Authorization Checks in Resource Mutation Endpoints
* **Affected Files:** 
  - `src/app/api/listings/[id]/route.ts` (Line 92)
  - `src/app/api/requirements/[id]/route.ts` (Line 86)
* **Vulnerability Type:** CWE-285: Improper Authorization
* **Mechanics:**
  Notice the architectural discrepancy between DELETE and PATCH in `src/app/api/listings/[id]/route.ts`:
  - **DELETE** verifies admin status directly against the database:
    ```typescript
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (user?.role !== "ADMIN") return 403;
    ```
  - **PATCH** verifies admin status using the client's cached JWT token claim:
    ```typescript
    const isAdmin = (session.user as any)?.role === "ADMIN";
    ```
  If an administrator is revoked in the database via `PATCH /api/admin/users`, their active JWT session continues to pass `isAdmin = true` on resource PATCH routes until session expiry. Combined with Vulnerability 1.1, this allows unapproved status modifications.
* **Remediation Recommendation:**
  Standardize role verification across all mutation endpoints by checking the database record, or by using a centralized authorization helper function (`requireAdmin(session.user.id)`).

---

#### 2.2 [MEDIUM] Orphaned & Unvalidated Inquiry Submission
* **Affected File:** `src/app/api/inquiries/route.ts` (Lines 15–41)
* **Vulnerability Type:** CWE-20: Improper Input Validation / Business Logic Flaw
* **Mechanics:**
  `POST /api/inquiries` accepts `listingId` and `requirementId` optionally:
  ```typescript
  const inquiry = await prisma.inquiry.create({
    data: {
      inquirerId: session.user.id,
      listingId: listingId || null,
      requirementId: requirementId || null,
      message: message.trim(),
      status: "NEW",
    },
  });
  ```
  1. An inquiry can be submitted with **both** `listingId` and `requirementId` set to `null`, creating an orphaned inquiry record that cannot be associated with any equipment or deal.
  2. The endpoint does not check if the referenced `listingId` or `requirementId` actually exists, is approved (`isApproved === true`), or is currently available. Inquiries can be submitted against non-existent or deleted IDs.
* **Remediation Recommendation:**
  Validate that exactly one target exists and is approved before inserting the inquiry:
  ```typescript
  if (!listingId && !requirementId) {
    return NextResponse.json({ error: "Inquiry must target a listing or requirement" }, { status: 400 });
  }
  if (listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId, isApproved: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found or unavailable" }, { status: 404 });
  }
  ```

---

#### 2.3 [POSITIVE AUDIT FINDING] Effective IDOR Isolation in Notification & Item Routes
* **Audited Endpoints:** 
  - `PATCH /api/notifications` (`where: { id, userId: session.user.id }`)
  - `GET /api/user/my-items` (`where: { sellerId: session.user.id }`, `where: { buyerId: session.user.id }`)
  - `GET /api/user/profile` (`where: { id: session.user.id }`)
* **Finding:** 
  These endpoints correctly enforce ownership by querying exclusively against `session.user.id`. A user cannot view or modify another user's notifications or dashboard items by manipulating URL query parameters.

---

### Section 3: Denial of Service (DDoS) & Resource Exhaustion Vectors

#### 3.1 [HIGH] Unbounded Memory Buffer in File Upload Endpoint (Server OOM Crash)
* **Affected File:** `src/app/api/upload/route.ts` (Lines 15–32)
* **Vulnerability Type:** CWE-400: Uncontrolled Resource Consumption (Memory Exhaustion DoS)
* **Mechanics:**
  The endpoint reads the uploaded file entirely into a Node.js `ArrayBuffer` and `Buffer` in server RAM without checking file length:
  ```typescript
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  ```
  If an attacker sends multi-hundred-megabyte payloads or runs concurrent large file uploads, the Node.js runtime process will exceed its heap allocation and crash with an Out-Of-Memory (`FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`) error.
* **Remediation Recommendation:**
  1. Enforce a maximum file size check before buffering (e.g., maximum 5MB for images):
     ```typescript
     const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
     if (file.size > MAX_SIZE) {
       return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
     }
     ```
  2. In production, utilize Cloudinary direct signed client uploads or direct S3 uploads to offload file streaming away from the application server.

---

#### 3.2 [MEDIUM-HIGH] Missing Pagination on Catalog and Admin Retrieval Endpoints
* **Affected Files:**
  - `GET /api/listings` (`src/app/api/listings/route.ts`)
  - `GET /api/requirements` (`src/app/api/requirements/route.ts`)
  - `GET /api/admin/users` (`src/app/api/admin/users/route.ts`)
  - `GET /api/admin/inquiries` (`src/app/api/admin/inquiries/route.ts`)
* **Vulnerability Type:** CWE-770: Allocation of Resources Without Limits or Throttling
* **Mechanics:**
  All four endpoints execute `prisma.<model>.findMany({ where })` without `take` or `skip` limits. 
  `GET /api/admin/inquiries` includes deep relation joins (`inquirer`, `listing`, `seller`, `requirement`, `buyer`). As the catalog and user base grow, an automated scraper or crawler sending requests to `/api/listings` will force full table scans and multi-megabyte JSON serialization, causing database connection exhaustion and server latency spikes.
* **Remediation Recommendation:**
  Implement mandatory pagination defaults:
  ```typescript
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const [items, totalCount] = await Promise.all([
    prisma.listing.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.listing.count({ where }),
  ]);
  ```

---

#### 3.3 [MEDIUM] Lack of Rate Limiting on Compute-Heavy and Communication Endpoints
* **Affected Endpoints:**
  - `POST /api/auth/register` (Bcrypt hashing CPU exhaustion)
  - NextAuth Credentials Authorize callback (`POST /api/auth/callback/credentials`)
  - `POST /api/inquiries` (Spam & inbox flooding)
  - `POST /api/upload` (Storage & bandwidth exhaustion)
* **Vulnerability Type:** CWE-307: Improper Restriction of Excessive Authentication / API Attempts
* **Mechanics:**
  Bcrypt with a salt cost of 10 requires ~80-100ms of CPU compute time per hash. An attacker sending 50 concurrent requests per second to `/api/auth/register` will peg server CPU usage at 100%, causing denial of service to all legitimate traffic. Furthermore, absence of rate limiting on `/api/inquiries` allows scripted spamming of the admin desk.
* **Remediation Recommendation:**
  Implement IP and user-based rate limiting using an in-memory or Redis-backed token bucket (e.g., `@upstash/ratelimit` or Next.js Edge Middleware rate limiter):
  - Registration / Login: 5 attempts per IP per minute.
  - Inquiries: 10 inquiries per authenticated user per hour.
  - Uploads: 10 uploads per user per hour.

---

### Section 4: Input Validation, Type Safety & Injection Vectors

#### 4.1 [MEDIUM] Numerical Boundary and Logic Failures (`minPrice` / `maxPrice`)
* **Affected File:** `src/app/api/listings/route.ts` (Lines 103–155)
* **Vulnerability Type:** CWE-20: Improper Input Validation
* **Mechanics:**
  `minPrice` and `maxPrice` are parsed via `parseFloat(minPrice)`.
  1. Negative prices are not rejected (`minPrice = -50000`).
  2. Inverted ranges are allowed (`minPrice = 500000`, `maxPrice = 10000`).
  3. Non-numeric values (e.g. `parseFloat("abc")`) produce `NaN`, which causes Prisma runtime validation exceptions resulting in 500 server errors.
* **Remediation Recommendation:**
  Enforce explicit numerical boundary constraints:
  ```typescript
  const parsedMin = Number(minPrice);
  const parsedMax = Number(maxPrice);
  if (isNaN(parsedMin) || isNaN(parsedMax) || parsedMin < 0 || parsedMax < parsedMin) {
    return NextResponse.json({ error: "Invalid price range" }, { status: 400 });
  }
  ```

---

#### 4.2 [MEDIUM] File MIME Spoofing & SVG Stored XSS Exposure
* **Affected File:** `src/app/api/upload/route.ts` (Line 23)
* **Vulnerability Type:** CWE-434: Unrestricted Upload of File with Dangerous Type
* **Mechanics:**
  The check `if (!file.type.startsWith("image/"))` verifies only the client-sent `Content-Type` header.
  - `image/svg+xml` satisfies `startsWith("image/")`. SVG files are XML documents that can contain executable JavaScript (`<script>` or `onload` attributes). If an SVG file is rendered inline by a browser or stored as a data URL fallback (`data:image/svg+xml;base64,...`), it can execute arbitrary JavaScript in the user's browser context (Stored XSS).
* **Remediation Recommendation:**
  1. Restrict allowed image types strictly to raster formats: `["image/jpeg", "image/png", "image/webp"]`. Explicitly forbid `image/svg+xml`.
  2. Validate the file's binary magic bytes using a package like `file-type` rather than trusting the client header.

---

#### 4.3 [LOW] Information Disclosure in Error Responses
* **Affected Files:** Various route handlers (e.g. `src/app/api/upload/route.ts:68`, `src/app/api/requirements/route.ts:151`)
* **Vulnerability Type:** CWE-209: Generation of Error Message Containing Sensitive Information
* **Mechanics:**
  `return NextResponse.json({ error: error.message || ... }, { status: 500 });` returns raw exception messages directly to the client. This can disclose database column names, Prisma query structures, Cloudinary configuration issues, or connection strings in production.
* **Remediation Recommendation:**
  Log the full error server-side and return sanitized, generic error descriptions to the client.

---

### Section 5: Third-Party Dependencies & CVE Analysis

Running `npm audit` on the project repository identified **9 high-severity vulnerabilities** in the transitive dependency tree:

| Package | Severity | Advisory / CVE | Introduced Via | Production Runtime Impact |
| :--- | :---: | :--- | :--- | :--- |
| `braces` | **High** | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | `eslint-config-next` &rarr; `micromatch` | **Low** (Build/linting toolchain only; not bundled into Next.js client runtime) |
| `deepmerge-ts` | **High** | [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) | `prisma` CLI &rarr; `@prisma/config` | **Low** (CLI build-time dependency; not executed on web requests) |
| `mysql2` | **High** | [GHSA-3f6p-5ww8-9rcr](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr), [GHSA-rgwj-5xj2-c3m3](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3) | `prisma` CLI &rarr; `mysql2` | **None** (Project uses PostgreSQL/Neon via `@prisma/adapter-pg`; MySQL driver is unused) |

#### Version Stability Notes
1. **NextAuth v5 (`next-auth@5.0.0-beta.32`)**: The project uses an experimental beta release of Auth.js. Beta releases undergo breaking changes and security patches. Pinning and regularly updating to the latest beta or stable release is advised.
2. **Next.js & React Canary (`next@16.4.0`, `react@19.3.0`)**: Ensure continuous dependency tracking as React 19 and Next.js 16 evolve.

---

### Section 6: Code Hygiene, Security Headers & Hardening

#### 6.1 Missing HTTP Security Headers
* **Affected File:** `next.config.ts`
* **Finding:** The application configuration does not set standard defensive HTTP response headers.
* **Remediation Recommendation:**
  Add a `headers` configuration in `next.config.ts`:
  ```typescript
  // next.config.ts
  const nextConfig: NextConfig = {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          ],
        },
      ];
    },
  };
  ```

#### 6.2 Database Connection Pool Sizing for Serverless Postgres
* **Affected File:** `src/lib/prisma.ts` (Line 9)
* **Finding:** `new Pool({ connectionString })` does not specify connection pool limits (`max`, `idleTimeoutMillis`). Under serverless function scaling (e.g. Vercel / serverless deployments), unconstrained pool allocation can exhaust the connection limit on the Neon PostgreSQL pooler.
* **Remediation Recommendation:**
  Configure pool constraints: `new Pool({ connectionString, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 })`.

---

## Prioritized Remediation Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRIORITIZED ACTION PLAN                         │
├────────────┬───────────────────────────────────────────────────────────┤
│ IMMEDIATE  │ 1. Fix JWT role elevation in src/auth.ts                  │
│ (24-48h)   │ 2. Add file size & MIME type limits in /api/upload        │
│            │ 3. Disable allowDangerousEmailAccountLinking in Google    │
├────────────┼───────────────────────────────────────────────────────────┤
│ SHORT TERM │ 4. Add pagination (skip/take) to /api/listings & admin    │
│ (1 Week)   │ 5. Validate price boundaries (minPrice < maxPrice, > 0)   │
│            │ 6. Enforce listing/requirement checks in /api/inquiries   │
│            │ 7. Configure HTTP Security Headers in next.config.ts      │
├────────────┼───────────────────────────────────────────────────────────┤
│ MEDIUM     │ 8. Integrate Zod schema validation across all API bodies  │
│ (2-3 Weeks)│ 9. Implement rate limiting on Auth, Inquiries & Uploads   │
│            │ 10. Add email verification before credentials activation  │
└────────────┴───────────────────────────────────────────────────────────┘
```

---

## Suggested Small API Improvements

1. **Adopt Zod Schema Validation (`zod`)**:
   Instead of manual string checks (`if (!title || !description)`), create reusable Zod schemas for `ListingInput`, `RequirementInput`, and `InquiryInput`. This guarantees safe data types, string length bounds, and uniform validation errors.
2. **Standardize API Response Envelope**:
   Adopt a consistent JSON structure across all API endpoints:
   - Success: `{ success: true, data: { ... } }`
   - Error: `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`
3. **Database-Driven Inquiry Notification**:
   When a user submits an inquiry on a listing or requirement, generate an in-app notification for the listing owner (seller/buyer) letting them know an inquiry was received.
4. **Idempotency on Status Toggles**:
   Add guard conditions so updating a listing from `AVAILABLE` to `AVAILABLE` returns early without performing unnecessary database write transactions.
5. **Sanitize Search Queries**:
   In `GET /api/listings`, sanitize the `query` search parameter by trimming and escaping SQL wildcards to maintain optimal index scanning.

---
*Report generated on behalf of LabMatrix Security & Engineering.*

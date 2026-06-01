# PINNACLE — Project Living Memory

## Project Overview

### Tech Stack
- **Frontend:** React 18 + Vite
- **Routing:** React Router DOM v6
- **Animation:** Framer Motion ^12.38.0 (active in StandardizedTests); CSS keyframe animations elsewhere
- **Icons:** React Icons (FA family — used in StandardizedTests)
- **CSS:** Component-scoped CSS files (not CSS Modules; each page imports its own `.css`)
- **Fonts:** Inter (body) + Poppins (headings) declared in `index.css`; `App.css` globally overrides with Georgia via `* {}` selector

### Folder Structure
```
D:\PINNACLE\
├── src/
│   ├── App.jsx              # Root component — all routes defined here
│   ├── App.css              # Global: navbar, results page, shared animations
│   ├── index.css            # Global reset, font-family declarations
│   ├── pages/               # One JSX + optional CSS per page
│   │   ├── Services.jsx + Services.css      # Additional Services hub
│   │   ├── EnglishProficiency.jsx + .css    # Design reference page
│   │   ├── StandardizedTests.jsx + .css     # Framer Motion interactive tree
│   │   ├── Home.jsx + Home.css
│   │   ├── Results.jsx
│   │   ├── About.jsx + About.css
│   │   ├── Contact.jsx + Contact.css
│   │   ├── Admin.jsx + Admin.css
│   │   ├── Login.jsx
│   │   ├── Counselling.jsx
│   │   ├── Visa.jsx / FlightsHotels.jsx / Insurance.jsx  (inline styles only)
│   │   ├── Ielts.jsx / Toefl.jsx / Pte.jsx
│   │   └── Sat.jsx / Act.jsx / Gre.jsx / Gmat.jsx
│   └── components/
│       └── Navbar.jsx       # Fixed navbar, auto-hide on scroll
├── server/
│   ├── server.js
│   └── createMeeting.js
├── public/
└── CLAUDE.md                # This file
```

### Routing Structure
| Path | Component | Notes |
|------|-----------|-------|
| `/` | Home | Landing page |
| `/results` | Results | Stats + testimonials |
| `/standardized-tests` | StandardizedTests | Framer Motion tree nav |
| `/services` | Services | Additional Services hub |
| `/english-tests` | EnglishProficiency | Design reference |
| `/ielts` | Ielts | — |
| `/toefl` | Toefl | — |
| `/pte` | Pte | — |
| `/visa` | Visa | Inline styles only |
| `/flights-hotels` | FlightsHotels | Inline styles only |
| `/insurance` | Insurance | Inline styles only |
| `/sat` | Sat | — |
| `/act` | Act | — |
| `/gre` | Gre | — |
| `/gmat` | Gmat | — |
| `/about` | About | — |
| `/contact` | Contact | — |
| `/login` | Login | — |
| `/college` | Counselling | — |
| `/admin` | Admin | — |

---

## Design System

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| Purple primary | `#6a0dad` | Titles, card text, hover bg, accents |
| Purple secondary | `#7c3aed` | Gradients, glow |
| Purple deep | `#2d1457` | Section headings |

### Secondary Colors
| Token | Value | Usage |
|-------|-------|-------|
| White | `#ffffff` | Page backgrounds, hover text |
| Off-white | `#f9fafb` | Subtle card backgrounds (older pattern) |
| Text muted | `#555`, `#444` | Descriptions, body text |
| Border subtle | `rgba(106, 13, 173, 0.1)` | Card borders |

### Typography
- **Body text:** Inter (sans-serif) — declared in `index.css`; Georgia as App.css fallback
- **Headings (h1–h3):** Poppins (sans-serif) — declared in `index.css`
- **Page titles:** `3rem` desktop → `2.2rem` tablet → `1.8rem` 425px → `1.4rem` 320px
- **Card h2:** `1.6rem` → `1.4rem` on ≤425px
- **Card description:** `~0.95–1rem`, color `#6a0dad` at `opacity: 0.8`

### Card Styles (Design Reference: EnglishProficiency)
```
background:      rgba(255, 255, 255, 0.75)
backdrop-filter: blur(12px)
border:          1px solid rgba(106, 13, 173, 0.1)
border-radius:   18px
padding:         35px
cursor:          pointer
transform-style: preserve-3d
```
**Hover state:**
```
background:  #6a0dad  (solid purple fill)
text:        #ffffff
box-shadow:  0 15px 40px rgba(106, 13, 173, 0.25)
::after:     shine overlay (linear-gradient, opacity 0 → 1)
```
**IMPORTANT:** Do NOT add `transform` to hover CSS — it conflicts with JS 3D tilt.

### Button Styles
- **Login button:** white bg, `#6a0dad` text, `border-radius: 18px`, `padding: 8px 16px`, `font-weight: 700`
- **Nav links:** white text, underline via `::after` (width 0 → 100% on hover)

### Animation Styles
| Effect | Implementation | Timing |
|--------|---------------|--------|
| Page title entrance | `svc-fadeUp` / CSS opacity+translateY | 0.7s ease-out, 0.1s delay |
| Card entrance | `svc-cardIn` staggered | 0.7s ease-out, 0.3s / 0.45s / 0.6s |
| Particles floating | `svc-floatUp` / `ep-floatUp` keyframe | 12–22s linear infinite |
| Mouse glow | JS `style.left/top` on mousemove | Instant follow |
| 3D card tilt | JS `rotateX/Y scale(1.03)` | Inline transform |
| Hover color switch | CSS transition | 0.3s ease |
| Hover shine | CSS `::after` opacity | 0.4s ease |

### Spacing Conventions
- Container `max-width`: `1100px` (card grid), `1000px` (titles)
- Page `padding`: `80px 40px` desktop → `60px 20px` tablet → `40px 16px` mobile
- Card grid `gap`: `35px`
- Title `margin-bottom`: `60px` → `40px` on ≤425px
- Section `margin-bottom`: `60–90px`

---

## Pages

### Home (`/`)
- **Purpose:** Landing page with hero section, service overview
- **CSS:** Home.css

### Results (`/results`)
- **Purpose:** Student results, stats (4-col grid), testimonials (3-col grid)
- **CSS:** App.css (results page styles embedded)

### StandardizedTests (`/standardized-tests`)
- **Purpose:** Interactive tree UI — select Undergrad or Grad, then navigate to test page
- **CSS:** StandardizedTests.css
- **Special:** Uses `framer-motion` `AnimatePresence`, spring animations, SVG path connectors

### Services (`/services`) — Additional Services Hub
- **Purpose:** Hub page linking to Visa, Flights & Hotels, Travel Insurance
- **CSS:** Services.css
- **Design:** Matches EnglishProficiency exactly (glass cards, purple hover, particle system, mouse glow, 3D tilt)
- **Animation:** `pinnacle-fadeUp` title (0.7s, 0.1s delay), `pinnacle-cardIn` staggered cards (0.3/0.45/0.6s), `pinnacle-floatUp` particles — all from shared `src/styles/animations.css`

### EnglishProficiency (`/english-tests`)
- **Purpose:** Hub for IELTS, TOEFL, PTE
- **CSS:** EnglishProficiency.css
- **Class prefix:** `ep-` (scoped to avoid global conflicts)
- **Animation:** Same system as Services — `pinnacle-fadeUp` title, `pinnacle-cardIn` staggered cards (0.3/0.45/0.6s), `pinnacle-floatUp` particles
- **Responsiveness:** Full breakpoints 900px / 768px / 425px / 375px / 320px (added 2026-06-01)
- **Scroll reveal:** IntersectionObserver wired up for any future `.scroll-reveal` elements

### Visa (`/visa`)
- **Purpose:** Visa assistance services overview
- **CSS:** Inline styles only — needs styled CSS file (pending)

### FlightsHotels (`/flights-hotels`)
- **Purpose:** Flight + hotel booking services overview
- **CSS:** Inline styles only — needs styled CSS file (pending)

### Insurance (`/insurance`)
- **Purpose:** Travel insurance coverage overview
- **CSS:** Inline styles only — needs styled CSS file (pending)

### About (`/about`)
- **CSS:** About.css

### Contact (`/contact`)
- **CSS:** Contact.css

### Login (`/login`)
- **CSS:** Inline/none

### Admin (`/admin`)
- **CSS:** Admin.css

### Counselling (`/college`)
- **CSS:** None/inline

---

## Completed Tasks

### 2026-06-01 — EnglishProficiency Animation Polish + Shared Animation System

**Files Created:**
- `src/styles/animations.css` — shared keyframes and scroll-reveal utility for all pages

**Files Modified:**
- `src/App.jsx` — imports `src/styles/animations.css` globally
- `src/pages/EnglishProficiency.css` — entrance animations added; responsive breakpoints expanded; `ep-floatUp` removed (now uses `pinnacle-floatUp`)
- `src/pages/EnglishProficiency.jsx` — stagger delays on cards, IntersectionObserver for scroll-reveal, mouse glow offset corrected to 140px
- `src/pages/Services.css` — `svc-*` keyframes removed; now references `pinnacle-*` from shared file

**Animations added to EnglishProficiency:**
- Title (`ep-title`): `pinnacle-fadeUp` 0.7s ease-out, 0.1s delay (was: no animation)
- Cards (`ep-card`): `pinnacle-cardIn` 0.7s ease-out, staggered 0.3 / 0.45 / 0.6s (was: no animation)
- Particles: renamed to use `pinnacle-floatUp` (same behavior, now shared)

**Shared animation utilities (`src/styles/animations.css`):**
- `pinnacle-fadeUp` — fade + 28px lift, used for page titles
- `pinnacle-cardIn` — fade + 30px lift, used for hub page cards
- `pinnacle-floatUp` — particle ambient float (12–22s loop)
- `.scroll-reveal` + `.is-visible` — viewport-triggered transition utility
- `.reveal-delay-[1–5]` — transition-delay stagger helpers

**Responsive improvements (EnglishProficiency.css):**
- Added 768px, 425px, 375px, 320px breakpoints (previously only had 900px)
- Mirrors Services.css breakpoint structure exactly

---

### 2026-06-01 — Initial Setup + Design Consistency + Animations + Responsiveness

**Files Created:**
- `CLAUDE.md` — project living memory (this file)

**Files Modified:**
- `src/pages/Services.css` — complete rewrite matching EnglishProficiency design
- `src/pages/Services.jsx` — particle count 30→20, title simplified, tilt scale matched, card animation delays updated

**Design Changes (Services.css):**
- Removed global `*` reset selector (redundant — App.css handles it)
- Removed `font-family: Georgia` override (handled globally in App.css)
- Container layout changed to `flex-start` with `padding: 80px 40px` (matches EP)
- Added `::before` + `::after` background glow pseudo-elements (matches EP)
- Cards: glass effect `rgba(255,255,255,0.75)` + `backdrop-filter: blur(12px)` (was solid `#f9fafb`)
- Cards: border changed to `1px solid rgba(106,13,173,0.1)` (matches EP)
- Card hover: removed CSS `transform: translateY(-8px) scale(1.04)` — conflicts with JS 3D tilt
- Card hover: replaced glow-border `::before` with shine `::after` overlay (matches EP)
- Mouse glow: sized to 280px + `blur(70px)` (was 300px + `border-radius: 50%`)
- Particles: individual `nth-child` positions and durations (was grouped nth-child buckets)

**Animation Changes (Services.css):**
- Title: `svc-fadeUp` (opacity 0→1, translateY 28px→0, 0.7s ease-out, 0.1s delay)
- Cards: `svc-cardIn` (opacity 0→1, translateY 30px→0, 0.7s ease-out, staggered 0.3/0.45/0.6s)
- Particles: `svc-floatUp` (scoped name, matches EP's `ep-floatUp` behavior)
- Removed `textReveal` clip animation on title spans

**Responsive Improvements (Services.css):**
- `≤900px`: single-column card grid, title 2.2rem
- `≤768px`: container padding 60px 20px
- `≤425px`: padding 40px 16px, title 1.8rem, cards 25px 20px padding
- `≤375px`: title 1.6rem
- `≤320px`: title 1.4rem, card h2 1.2rem

**Services.jsx Changes:**
- Particle count: 30 → 20 (matches EP exactly)
- Title `<h1>` simplified — removed `<span>` wrappers (animated via CSS on `h1` itself)
- Card tilt scale: `1.05` → `1.03` (matches EP)
- Card animation delays: `index * 0.2s` → `0.3 + index * 0.15s` (starts after title, better stagger)

---

---

### 2026-06-01 — Full-Stack Feature Set: Auth, Homework, Blog, Admin Panel

#### Authentication Architecture
- **Student auth:** JWT (7d expiry), stored in `localStorage.studentToken`. Role `"student"` embedded in payload.
- **Admin auth:** JWT (1d expiry), stored in `localStorage.token`. Role `"admin"` embedded in payload.
- **Invite flow:** Admin → POST `/api/invite` → cryptographically random token → SHA-256 hash stored in DB → raw token emailed to student → student visits `/accept-invite/:token` → sets password → account created, invited marked `isUsed`.
- **Forgot password:** POST `/api/auth/student/forgot-password` → SHA-256 hashed token stored in User model → link emailed → POST `/api/auth/student/reset-password` → token verified, password re-hashed.
- **Context:** `AuthContext.jsx` wraps the app; `ProtectedRoute.jsx` guards `/student-dashboard`.

#### Security Measures Applied
| Layer | Implementation |
|-------|---------------|
| Security headers | `helmet` middleware on all responses |
| CORS | Restricted to `FRONTEND_URL` + localhost only |
| Rate limiting | Login (10/15 min), Reset (5/hr), Invites (30/hr), API global (300/15 min) |
| Password hashing | `bcrypt` rounds=12 on all user passwords |
| Token security | Raw token never stored; only SHA-256 hash in DB; invite TTL 24h |
| Timing attack | `timingSafeEqual` on admin credential compare |
| File upload | MIME + extension validation; 50 blocked extensions; 50MB limit |
| Path traversal | `fileName` validated before any `fs` access |
| Input validation | Inline checks on all routes; no raw user data used in queries |
| Admin credentials | Moved from hardcoded code to `server/.env` |
| JWT secret | Moved to `server/.env` |
| Contact routes | Now require `verifyToken + isAdmin` middleware |

#### Database Schema (new collections)
- **User** — `email, passwordHash, name, role, isActive, emailVerified, resetToken, resetTokenExpiry`
- **Invite** — `email, token (hash), expiresAt, isUsed, usedAt, createdBy`; TTL index auto-deletes 7d after expiry
- **Homework** — `title, description, category, files[], isPublished, createdBy`
- **Blog** — `title, slug, content, featuredImage, category, author, seoDescription, isPublished, publishedAt, createdBy`

#### New Backend Routes
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/student/login` | — | Student login |
| POST | `/api/auth/student/forgot-password` | — | Request reset email |
| POST | `/api/auth/student/reset-password` | — | Apply new password |
| POST | `/api/invite` | admin | Send invite to email |
| GET | `/api/invite/verify/:token` | — | Check invite validity |
| POST | `/api/invite/accept` | — | Set password + create account |
| GET | `/api/invite/list` | admin | List all invites |
| GET | `/api/admin/stats` | admin | Dashboard stats |
| GET | `/api/admin/students` | admin | List students |
| PATCH | `/api/admin/students/:id/toggle` | admin | Activate/deactivate |
| DELETE | `/api/admin/students/:id` | admin | Remove student |
| GET | `/api/homework` | student/admin | List homework |
| POST | `/api/homework` | admin | Create + upload files |
| PUT | `/api/homework/:id` | admin | Update + add files |
| DELETE | `/api/homework/:id` | admin | Delete (removes files) |
| DELETE | `/api/homework/:id/file/:name` | admin | Remove single file |
| GET | `/api/homework/download/:name` | student/admin | Authenticated download |
| GET | `/api/blog` | public | List published posts |
| GET | `/api/blog/:slug` | public | Single post |
| POST | `/api/blog` | admin | Create post |
| PUT | `/api/blog/:id` | admin | Update post |
| DELETE | `/api/blog/:id` | admin | Delete post |

#### New Frontend Routes
| Path | Component | Auth |
|------|-----------|------|
| `/login` | Login.jsx | — |
| `/forgot-password` | ForgotPassword | — |
| `/reset-password/:token` | ResetPassword | — |
| `/accept-invite/:token` | AcceptInvite | — |
| `/student-dashboard` | StudentDashboard | student |

#### New Files Created
**Backend:**
- `server/models/User.js`, `Invite.js`, `Homework.js`, `Blog.js`
- `server/middleware/authMiddleware.js`, `upload.js`
- `server/utils/email.js`
- `server/routes/studentAuth.js`, `invite.js`, `homework.js`, `blog.js`, `adminManage.js`
- `server/uploads/homework/`, `server/uploads/blog/` (file storage directories)

**Frontend:**
- `src/context/AuthContext.jsx`
- `src/services/api.js`
- `src/components/ProtectedRoute.jsx`
- `src/pages/Login.jsx` + `Login.css`
- `src/pages/AcceptInvite.jsx`
- `src/pages/ForgotPassword.jsx`
- `src/pages/StudentDashboard.jsx` + `StudentDashboard.css`

#### Files Modified
- `server/config.js` — now reads from `.env` via dotenv; no secrets in code
- `server/server.js` — added helmet, restrictive CORS, rate limiting, all new routes, multer error handler
- `server/routes/adminAuth.js` — fixed JWT_SECRET bug; added rate limit; role in payload; timingSafeEqual
- `server/.env` — all secrets now here; added EMAIL_USER, EMAIL_PASS, FRONTEND_URL, ADMIN credentials
- `src/App.jsx` — wrapped with AuthProvider; added all new routes
- `src/pages/Admin.jsx` — rewritten with 5-tab panel (Contacts, Students, Homework, Blog, Invites)
- `src/pages/Admin.css` — added tab styles, status badges, form styles, homework/blog list styles

---

## Pending Tasks

- [ ] **Configure email:** Set `EMAIL_USER` + `EMAIL_PASS` (Gmail App Password) in `server/.env`
- [ ] **Set `FRONTEND_URL`** in `server/.env` to production domain for invite/reset links
- [ ] **File storage:** `server/uploads/` is NOT persistent on Render — migrate to AWS S3 or Cloudinary before production
- [ ] Style Visa.jsx, FlightsHotels.jsx, Insurance.jsx with dedicated CSS
- [ ] Add mobile hamburger menu to Navbar
- [ ] Scroll-triggered animations on Home page sections
- [ ] Unify Counselling, About, Contact page styles
- [ ] SAT, ACT, GRE, GMAT detail pages need content + styling
- [ ] Add rich-text editor (e.g. react-quill) for Blog content
- [ ] Improve Student Dashboard: add profile, progress tracking sections
- [ ] Add admin password hashing (currently plain-text in .env; improve by storing bcrypt hashes)

---

## Notes

### Critical: 3D Tilt + CSS Hover Transform Conflict
If a CSS rule applies `transform` on `:hover`, it overwrites the JS inline `card.style.transform` from the tilt handler — the card snaps to the CSS value and tilt stops working. **Fix:** Only use `background`, `box-shadow`, and `opacity` in hover CSS. Let JS own all `transform` values. EnglishProficiency implements this correctly and is the reference.

### Shared Animation System
All keyframe animations use `pinnacle-` prefix in `src/styles/animations.css` (imported globally via App.jsx). Services.css and EnglishProficiency.css both reference `pinnacle-fadeUp`, `pinnacle-cardIn`, `pinnacle-floatUp`. Admin.css has its own `fadeIn`/`fadeUp`/`pop` keyframes (admin panel only, no conflict).

### Glass Card Browser Support
`backdrop-filter: blur(12px)` requires Chrome 76+, Firefox 103+, Safari 9+. Not supported in older Edge (pre-Chromium). Acceptable progressive enhancement — degrades to white background with opacity.

### Mouse Glow Is Page-Wide
Mouse glow uses `position: fixed; z-index: 999` — it follows the cursor across the entire viewport. z-index 999 keeps it below the navbar (z-index 1000). This is intentional behavior copied from EnglishProficiency.

### Font Reality
`index.css` declares Inter + Poppins but `App.css` has `* { font-family: Georgia, serif }` which overrides everything. Pages visually render in Georgia unless the Inter/Poppins fonts are loaded and specificity is managed. This is a known inconsistency.

### Framer Motion
Installed (`^12.38.0`) but only used in StandardizedTests.jsx. Other pages use CSS animations + JS event handlers for performance and consistency with EP's implementation approach.

---

### 2026-06-01 — Admin CSS Isolation, Email Fix, Security Audit

#### CSS Root Causes Fixed
| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| `.card` collision | `Admin.css` and `StandardizedTests.css` both defined `.card`; all component CSS is global in Vite | Renamed to `.admin-stat-card` |
| `table/th/td/tr` leak | Bare element selectors in `Admin.css` styled ALL tables site-wide | Scoped to `.admin-page table` etc. |
| `tr:hover { transform: scale(1.01) }` | Transformed EVERY table row across the whole site | Fixed; now only `background` change under `.admin-page tr:hover` |
| Font override failure | `App.css * { font-family: Georgia }` applied directly to every element, beating inherited Inter from `.admin-page` | Added `.admin-page, .admin-page * { font-family: "Inter" }` — class+universal > universal |
| `.tabs`, `.fade-in`, `.delay-1`, `.primary-btn` etc. | Generic class names with no page scope | All renamed to `admin-filter-tabs`, `admin-fade-in`, `admin-delay-1`, `admin-primary-btn`, etc. |

All Admin.css class names now use the `admin-` prefix. Only element selectors (`table`, `th`, `td`, `tr`) remain unaffixed but are scoped under `.admin-page`.

#### Email Root Causes Found
1. **`.env` encoding** — File was saved as UTF-16 LE (with BOM), causing dotenv to read `M O N G O _ U R I` instead of `MONGO_URI`. Zero variables loaded. Fixed by rewriting as UTF-8 with BOM using `[System.IO.File]::WriteAllText(..., Encoding::UTF8)`.
2. **Gmail App Password not set** — `EMAIL_PASS=PinnacleInc!@#$4321` is a regular password, not a Gmail App Password. Gmail App Passwords are 16 alphanumeric lowercase characters (e.g. `abcdwxyzefghijkl`). Regular passwords are rejected by Gmail SMTP even with 2FA enabled.
3. **Stale admin JWT token** — Tokens issued before the `role: "admin"` claim was added to the JWT payload fail the `isAdmin` middleware with 403. Admin must log out and log back in after any server update that changes the token structure.

**Action required:** To fix emails, follow these exact steps:
1. Ensure Gmail 2FA is enabled on `pinnacle.inc.work@gmail.com`
2. Go to https://myaccount.google.com/apppasswords
3. Create an App Password → select "Mail" + "Other (custom)" → name it "Pinnacle"
4. Copy the 16-character code (no spaces)
5. Paste it as `EMAIL_PASS` in `server/.env` (and in Render environment variables)
6. Also set `FRONTEND_URL` to the actual production domain in Render

---

## Security Audit Report (2026-06-01)

### CRITICAL

**C1 — Admin passwords stored as plain text in .env**
- **File:** `server/.env`, `server/config.js`
- **Risk:** If `.env` is ever exposed (git leak, server breach), admin accounts are immediately compromised.
- **Fix:** Hash passwords with bcrypt. Store the 60-char hash in `.env`. Update `adminAuth.js` to use `bcrypt.compare(inputPassword, storedHash)` instead of `timingSafeEqual`. Pre-generate hashes with `node -e "require('bcryptjs').hash('PASS',12).then(console.log)"`.

**C2 — JWT secret is weak / default**
- **File:** `server/.env` (`JWT_SECRET=pinnacle_jwt_secret_replace_with_32+_random_chars_in_prod`)
- **Risk:** Predictable secret allows forging valid JWT tokens for any user/admin.
- **Fix:** Generate a strong secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Update in `.env` AND in Render dashboard.

### HIGH

**H1 — Homework files served publicly via static path**
- **File:** `server/server.js`
- **Risk:** `/uploads/homework/filename` was accessible without auth. Anyone guessing a filename could download student files.
- **Status: FIXED** — Homework static path now returns 403; only `/api/homework/download/:name` (requires JWT) works.

**H2 — File MIME type trusts client Content-Type header**
- **File:** `server/middleware/upload.js`
- **Risk:** Attacker can send `.php` renamed as `.pdf` with `Content-Type: application/pdf`. The file is stored with `.pdf` extension but contains malicious code. (Not directly executable on a Node.js server, but a risk if file serving ever moves to PHP/Apache.)
- **Fix (recommended):** Add `file-type` npm package to check actual magic bytes: `const fileType = await FileType.fromFile(req.file.path); if (!allowed.has(fileType?.mime)) { fs.unlinkSync(req.file.path); return 400; }`.

**H3 — Blog content stored raw (Stored XSS potential)**
- **File:** `server/models/Blog.js`, frontend blog pages
- **Risk:** Admin can store `<script>` tags in blog content. If any future frontend renders content as `dangerouslySetInnerHTML`, XSS executes in every visitor's browser.
- **Fix:** Sanitize blog content server-side with `sanitize-html` before storing. Or use a safe renderer (markdown parser, not raw HTML).

**H4 — Rate limiting uses in-memory store**
- **File:** All route files
- **Risk:** On Render with multiple instances or after restarts, rate limit counters reset. Brute-force protection is bypassed by triggering a server restart.
- **Fix:** Use `rate-limit-redis` with Upstash Redis (free tier) for persistent counters.

### MEDIUM

**M1 — No Content Security Policy headers**
- **File:** `server/server.js` (helmet config)
- **Risk:** XSS attacks can execute arbitrary scripts on the frontend served by Vite.
- **Fix:** Add `helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], ... } } })`.

**M2 — CORS allows localhost origins in production**
- **File:** `server/server.js`
- **Risk:** `localhost:5173` and `localhost:5174` are in the allowed origins list. A developer's local machine running anything on that port can make credentialed requests.
- **Fix:** Read allowed origins from env var: `ALLOWED_ORIGINS=https://production.com` and only include localhost in development mode (`process.env.NODE_ENV === "development"`).

**M3 — Public contact endpoints lack rate limiting**
- **File:** `server/server.js` (`/api/contact`, `/api/schedule-meeting`, `/api/parent-enquiry`)
- **Risk:** Contact form can be spammed without limit.
- **Fix:** Add a shared `contactLimiter` (e.g. 10 requests/15 min per IP) to these three routes.

**M4 — No maximum size limit on blog content field**
- **File:** `server/models/Blog.js`, `server/routes/blog.js`
- **Risk:** Admin could accidentally store extremely large content, bloating the database.
- **Fix:** Add Mongoose validator: `content: { type: String, maxlength: 200000 }`.

**M5 — qs package has moderate DoS vulnerability**
- **Dependency:** `qs` (transitive, via express)
- **Risk:** Triggers `TypeError` crash on comma-format arrays with `encodeValuesOnly`. Unlikely to be triggered by Pinnacle's API.
- **Fix:** `npm update qs` in server/. Run `npm audit fix`.

### LOW

**L1 — Invite link FRONTEND_URL is placeholder**
- **File:** `server/.env` (`FRONTEND_URL=https://your-frontend-domain.com`)
- **Risk:** Invite and reset emails send links to the wrong domain. Students cannot activate accounts.
- **Fix:** Update `FRONTEND_URL` in Render dashboard to the actual production domain immediately.

**L2 — Download filename sent as Content-Disposition header uses original name**
- **File:** `server/routes/homework.js` (`res.download(filePath, fileName)`)
- **Risk:** The stored disk filename (random hash) is sent as the download name, not the original filename.
- **Fix:** Look up the original name from DB and pass it: `res.download(filePath, file.originalName)`.

**L3 — No logging of failed student login attempts**
- **File:** `server/routes/studentAuth.js`
- **Risk:** Brute-force attempts are rate-limited but not logged for security monitoring.
- **Fix:** Add `console.warn(\`[SECURITY] Failed login attempt: ${email}\`)` on auth failure.

**L4 — Token JWT `expiresIn` for students is 7 days**
- **File:** `server/routes/studentAuth.js`, `server/routes/invite.js`
- **Risk:** If a student account is deactivated (isActive=false), the JWT remains valid for up to 7 days unless the server checks `isActive` on every request.
- **Note:** Current implementation does NOT check `isActive` on every authenticated request — only at login. A deactivated student can still access resources until their token expires.
- **Fix:** Add `isActive` check to student-authenticated middleware, or reduce token expiry to 24h.

### ITEMS WITHOUT CURRENT RISK

- **No SQL injection** — Mongoose uses parameterized queries. No raw SQL.
- **No CSRF** — JWT in localStorage (not cookies) means CSRF is not applicable to authenticated routes.
- **Password hashing** — bcrypt rounds=12 is appropriate.
- **Invite token security** — Raw token never stored; SHA-256 hash only. One-time use enforced.
- **Path traversal** — `fileName` validated with `safeFileName()` before any `fs` access.
- **No secrets in frontend** — `src/services/api.js` only contains public API URL and reads tokens from localStorage.

### Remaining Risks Before Production (Priority Order)
1. Generate a strong JWT secret (C2) — **do this now**
2. Update FRONTEND_URL in Render (L1) — **do this before launch**
3. Get proper Gmail App Password (email fix) — **do this before launch**
4. Hash admin passwords (C1)
5. Add `file-type` magic bytes validation (H2)
6. Sanitize blog HTML with `sanitize-html` (H3)
7. Check `isActive` on every student request (L4)
8. Remove localhost from CORS in production (M2)
9. Rate-limit contact endpoints (M3)
10. Switch rate-limiter to Redis (H4)

# Vaddadi Pickles

A full-stack storefront for a small-batch Andhra pickle brand — product showcase with
weight-wise pricing (**250 g / 500 g / 1 kg**), a cart, a customer dashboard with multiple
saved addresses backed by the **Indian postal PIN code API**, and an admin dashboard.

```
client/   React 19 + Vite + React Router  (UI, port 5173)
server/   Express + JWT + bcrypt          (REST API, port 4000)
```

## Quick start

```bash
npm run install:all   # installs client + server deps
npm run dev           # runs API on :4000 and the site on :5173
```

Then open http://localhost:5173. The Vite dev server proxies `/api/*` to the Express API, so
the browser only ever talks to one origin.

### Demo accounts

| Role     | Email                          | Password      |
| -------- | ------------------------------ | ------------- |
| Admin    | `admin@vaddadipickles.in`      | `admin123`    |
| Customer | `customer@vaddadipickles.in`   | `customer123` |

Customer sign-up is open — the "Create account" tab registers a new customer.
Admin sign-in lives at `/login?role=admin` and rejects non-admin accounts.

## Features

**Storefront**
- Hero, story and process sections; 8 seeded pickles with generated product photography
- Shop page with category filter (Veg / Non-Veg), search and four sort orders
- Product detail page with jar-size selector, per-weight stock, quantity stepper and buy-now

**Weight & cart**
- Every product carries three variants — 250 g, 500 g, 1 kg — each with its **own price, MRP and stock**
- Selecting a weight on the card or PDP updates the price and the add-to-cart action instantly
- Slide-out cart drawer persisted to `localStorage`, quantity edits, free-shipping progress
- Server-side re-pricing at checkout (`POST /api/cart/quote`) so client prices can't be tampered with
- Coupons: `VADDADI10` (10% off ₹500+) and `FREESHIP` (free shipping over ₹799); flat ₹60 shipping, free above ₹999

**Customer dashboard** (`/account`)
- Overview stats, full order history, order tracking timeline, cancel and one-tap reorder
- **Multiple addresses** — add / edit / delete, labels (Home, Work, Parents, Other), set default
- Address switching at checkout

**Indian PIN code lookup**
- `GET /api/pincode/:pin` proxies **https://api.postalpincode.in/pincode/{PIN}** (India Post)
- Typing 6 digits auto-fills district and state and lists the post offices for that PIN as the
  city/locality dropdown; results are cached in memory
- If the host has no outbound internet, a bundled offline table (`server/data/seed.js`)
  answers common PINs and the UI marks the result as cached, so the flow never dead-ends

**Admin dashboard** (`/admin`)
- KPIs: revenue, orders, average order value, customers, product count, low-stock variants
- Revenue sparkline (last 14 days), jars-sold-by-weight breakdown, top products by revenue
- Order table with search (order no. / customer / PIN) and status filter; status transitions
  Placed → Packed → Shipped → Delivered → Cancelled (cancelling restocks inventory)
- Product CRUD with a per-weight price and stock editor
- Customer list with saved addresses, order counts and lifetime value

## API reference

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | Create customer account |
| POST | `/api/auth/login` | – | Sign in (`role: "admin"` enforces admin) |
| GET | `/api/auth/me` | user | Current session |
| GET | `/api/products` | – | Catalogue (`?q=`, `?category=`) |
| GET | `/api/products/:idOrSlug` | – | Single product |
| POST/PUT/DELETE | `/api/products/:id` | admin | Product CRUD |
| GET/POST | `/api/addresses` | user | List / add address |
| PUT/DELETE | `/api/addresses/:id` | user | Edit / remove address |
| PATCH | `/api/addresses/:id/default` | user | Set default address |
| GET | `/api/pincode/:pin` | – | India Post PIN lookup |
| POST | `/api/cart/quote` | – | Server-side cart pricing |
| POST/GET | `/api/orders` | user | Place / list orders |
| PATCH | `/api/orders/:id/status` | admin | Change order status |
| POST | `/api/orders/:id/cancel` | user | Cancel and restock |
| GET | `/api/admin/stats` | admin | Dashboard metrics |
| GET | `/api/admin/customers` | admin | Customer list |

## Data

State lives in `server/data/db.json`, seeded from `server/data/seed.js` on first boot
(git-ignored — delete it to reset, or `POST /api/admin/reset` as an admin). Swap `server/db.js`
for a real database when you go to production, and set `JWT_SECRET` in the environment.

## Production build

```bash
npm run build       # emits client/dist
npm start           # serves the API; host client/dist behind any static server/CDN
```

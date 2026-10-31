# SHOP.CO — Full-stack (React + Express + MongoDB)

The original React storefront, now with a real backend. The look and behaviour of the
site are unchanged — what changed is **where the data lives**:

| | Before | Now |
|---|---|---|
| Accounts & passwords | `localStorage` (plain-text passwords!) | MongoDB, passwords hashed with bcrypt, login via JWT |
| Cart & wishlist | `localStorage` (same for every user on a browser) | MongoDB, **per user**, available on any device |
| Products | hard-coded in `products.js` | MongoDB (seeded automatically from `server/data/products.json`) |
| Checkout | just cleared the cart | creates an **order**; totals/discount/shipping calculated on the server |
| Newsletter | did nothing | saved in MongoDB |

```
shop-co-fullstack/
├── client/                 React + Vite frontend (your original project)
│   ├── src/api/http.js         ← NEW  one fetch() wrapper used for every API call
│   ├── src/context/            AuthContext, CartContext (now call the API), ProductsContext (NEW)
│   ├── src/pages, components   same UI as before (small edits where data is loaded/saved)
│   ├── vite.config.js          dev proxy:  /api  →  http://localhost:5000
│   ├── vercel.json, public/_redirects   make page refresh work on Vercel / Netlify
│   └── .env.example            VITE_API_URL (only needed in production)
├── server/                 NEW  Node.js + Express + MongoDB (Mongoose) API
│   ├── src/index.js            starts the server, connects to MongoDB, seeds products
│   ├── src/app.js              middleware (CORS, helmet, rate-limit) + route mounting
│   ├── src/models/             User, Product, Cart, Order, Subscriber
│   ├── src/routes/             auth, products, cart, wishlist, orders, newsletter
│   ├── src/middleware/         requireAuth (JWT), error handling
│   ├── src/validation/         zod schemas for every request body
│   ├── data/products.json      the 14 products (seed data)
│   ├── scripts/smoke.js        tests every endpoint (works on a deployed API too)
│   └── .env.example            copy to .env
└── package.json            helper scripts (npm run dev starts both apps)
```

---

## 1. Run it locally

**You need:** [Node.js](https://nodejs.org) 18.17 or newer, and a MongoDB database (pick one):

* **MongoDB Atlas (recommended, free, no install)** — see [step A below](#a-create-the-database-mongodb-atlas). Use the same database you will use online.
* **Local MongoDB** — install [MongoDB Community](https://www.mongodb.com/try/download/community) and use `mongodb://127.0.0.1:27017/shopco`.

### Steps

```bash
# 1. Backend settings
cd server
cp .env.example .env          # Windows (cmd):  copy .env.example .env
```

Open `server/.env` and set:

* `MONGODB_URI` — your Atlas string (or leave the local one if MongoDB is installed on your PC)
* `JWT_SECRET` — any long random text. Generate one with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

```bash
# 2. Install everything (from the project root)
cd ..
npm install                   # installs the tiny helper that runs both apps together
npm run install:all           # installs server + client dependencies

# 3. Start backend + frontend together
npm run dev
```

You should see `connected to MongoDB`, `loaded 14 products` and `listening on port 5000`
from the API, and Vite's `Local: http://localhost:5173/`.

Open **http://localhost:5173**, click *Sign Up*, create an account, log in and shop.

*(Prefer two terminals? `cd server && npm run dev` and `cd client && npm run dev`.)*

**Check the backend on its own:** with the server running, `npm run smoke` (from the root or `server/`)
runs ~40 automated checks against every endpoint.

---

## 2. How the frontend is connected to the backend

Nothing mysterious — the React app calls the API with `fetch`. These are the pieces:

**① One API helper — `client/src/api/http.js`.**
Every request goes through `api('/path', { method, body })`. It
prepends the API address, sends JSON, attaches the login token
(`Authorization: Bearer <token>`), and turns server errors into readable messages.
The token is kept in `localStorage` under `shopco:token`.

**② The API address.**
* *Development:* the code calls `/api/...` and `client/vite.config.js` has a **proxy**
  that forwards `/api` to `http://localhost:5000`. The browser thinks everything is one site → no CORS trouble.
* *Production:* set `VITE_API_URL=https://your-api.onrender.com` when building the frontend. `http.js` reads it.

**③ Contexts talk to the API instead of `localStorage`:**

| File | What it does now |
|---|---|
| `context/AuthContext.jsx` | `signup` → `POST /auth/signup`; `login` → `POST /auth/login` (saves the token); on page load `GET /auth/me` restores the session; `updateProfile` → `PATCH /auth/me` |
| `context/CartContext.jsx` | loads `GET /cart` + `GET /wishlist` after login; add/remove/qty → `/cart/items…`; heart → `PUT/DELETE /wishlist/:id`; `checkout()` → `POST /orders`. Updates appear instantly on screen, then sync in order |
| `context/ProductsContext.jsx` *(new)* | `GET /products`. The bundled list is used for the first paint so pages never flash empty, then the database copy replaces it |
| `components/Newsletter.jsx` | `POST /newsletter` |

**④ Small page edits:** `Auth.jsx`, `Profile.jsx` and `Cart.jsx` now `await` the server (and show server error
messages such as “Invalid email or password.”); `Shop.jsx`, `Home.jsx`, `ProductDetail.jsx` read products from
`useProducts()`; `App.jsx` waits for the session check before redirecting to the login page.

> Accounts created with the old localStorage version are not migrated — sign up again.

---

## 3. Deploy it online (all free tiers)

You will deploy **three things**: the database (MongoDB Atlas), the backend (Render), the frontend (Vercel).
Do them in this order.

### A. Create the database (MongoDB Atlas)

1. Sign up at <https://www.mongodb.com/cloud/atlas/register> → **Create** a free **M0** cluster (any region).
2. **Database Access** → *Add New Database User* → choose a username + password (avoid `@ : / ?` in the password, or URL-encode it). Role: *Read and write to any database*.
3. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`). (Render's free plan has no fixed IP.)
4. **Database → Connect → Drivers** → copy the connection string and:
   * replace `<password>` with your password,
   * add the database name after `.mongodb.net/`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/shopco?retryWrites=true&w=majority`

   Keep this string — it is your `MONGODB_URI`.

### B. Put the code on GitHub

```bash
git init
git add .
git commit -m "SHOP.CO full-stack"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/shop-co.git
git branch -M main
git push -u origin main
```
(`.env` files are git-ignored, so your secrets are not uploaded.)

### C. Deploy the backend (Render)

1. <https://render.com> → sign in with GitHub → **New + → Web Service** → pick your repo.
2. Settings:
   * **Root Directory:** `server`
   * **Runtime:** Node
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance type:** Free
3. **Environment Variables:**

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas string from step A |
   | `JWT_SECRET` | a long random string (≥ 32 chars) |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | `http://localhost:5173` for now — you'll change it in step E |

4. **Create Web Service.** When it's live you get a URL like `https://shop-co-api.onrender.com`.
5. Open `https://shop-co-api.onrender.com/api/health` → you should see `{"status":"ok",…}`, and
   `/api/products` should list the 14 products (the server fills an empty database by itself on first start).

> Free Render services go to sleep after ~15 minutes without traffic; the next request takes
> 30–60 s to wake it. That is normal on the free plan.

### D. Deploy the frontend (Vercel)

1. <https://vercel.com> → **Add New → Project** → import the same GitHub repo.
2. **Root Directory:** `client`. Framework preset: **Vite** (auto-detected; build `npm run build`, output `dist`).
3. **Environment Variables:** `VITE_API_URL` = your Render URL, **no trailing slash**
   (e.g. `https://shop-co-api.onrender.com`).
4. **Deploy.** You get a URL like `https://shop-co.vercel.app`.

*(Netlify works too: Base directory `client`, build command `npm run build`, publish directory `client/dist`, same env variable. `public/_redirects` is already included.)*

### E. Tell the backend which website may call it (CORS)

Back in Render → your service → **Environment** → set
`CLIENT_URL` = `https://shop-co.vercel.app` (exact URL, `https`, no trailing slash;
several allowed sites can be comma-separated). Save — Render redeploys automatically.

### F. Test the live site

Open your Vercel URL → sign up → log in → add to cart → checkout. You can also check the live API:

```bash
API_URL=https://shop-co-api.onrender.com npm run smoke --prefix server
```

> `VITE_*` variables are baked in at **build time**. If you change `VITE_API_URL`, redeploy the frontend.

---

## 4. API reference

Base path `/api`. 🔒 = needs header `Authorization: Bearer <token>`.

| Method & path | Purpose |
|---|---|
| `GET /health` | server alive check |
| `POST /auth/signup` | `{name, email, phone?, password}` → creates account |
| `POST /auth/login` | `{email, password}` → `{token, user}` |
| 🔒 `GET /auth/me` | current user |
| 🔒 `PATCH /auth/me` | `{name, email, phone}` update profile |
| `GET /products` | filters: `style, gender, tag, search, sale, minPrice, maxPrice, sort` |
| `GET /products/:id` | one product |
| 🔒 `GET /cart` | cart lines |
| 🔒 `POST /cart/items` | `{productId, size?, color?, qty?}` (price comes from the DB) |
| 🔒 `PATCH /cart/items/:lineId` | `{qty}` (0 removes) |
| 🔒 `DELETE /cart/items/:lineId` | remove a line |
| 🔒 `DELETE /cart` | empty the cart |
| 🔒 `GET /wishlist` · `PUT /wishlist/:productId` · `DELETE /wishlist/:productId` | wishlist |
| 🔒 `POST /orders` | `{promoCode?}` checkout: totals computed server-side, cart emptied |
| 🔒 `GET /orders` · `GET /orders/:id` | order history |
| `POST /newsletter` | `{email}` subscribe |

Promo code `SHOPCO10` = 10 % off; shipping is a flat $15 (both in `server/src/config/pricing.js`).

To change the catalogue, edit `server/data/products.json` and run `npm run seed` (it resets the products collection).

---

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| Server exits: *Missing required environment variable* | You didn't create `server/.env` (copy `.env.example`). |
| Server: *Could not connect to any servers* / `ECONNREFUSED` | Local: MongoDB isn't running. Atlas: Network Access must allow `0.0.0.0/0`; check username/password in the URI. |
| Browser console: *blocked by CORS policy* / 403 *Origin … not allowed* | `CLIENT_URL` on the backend must exactly match the site's URL (https, no trailing slash). |
| Site says *Cannot reach the server* | `VITE_API_URL` missing/wrong on the frontend host (then redeploy), or the free Render service is waking up — wait a minute. |
| Login page appears on every refresh after a long time | The token expired (7 days by default) — log in again. |
| Refreshing `/shop` gives 404 on the hosted site | The SPA rewrite is missing: `client/vercel.json` / `public/_redirects` must be deployed (they are included). |
| Port 5000 already in use | Change `PORT` in `server/.env` **and** the `target` in `client/vite.config.js`. |

---

## 6. Security notes (good to know for a real shop)

* Passwords are hashed with bcrypt; the API never returns them. Login/signup are rate-limited; inputs are validated with zod; prices and totals are never trusted from the browser.
* The login token is stored in `localStorage` (simple, works across Vercel ↔ Render domains). For higher security use an httpOnly cookie instead.
* Checkout creates an order but takes **no real payment** — add Stripe/PayPal if you need that.
* There is no email verification or password reset yet.

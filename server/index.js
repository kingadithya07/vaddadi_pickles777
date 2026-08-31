import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, save, resetDb, uid } from './db.js';
import { PINCODES, OFFICE_INDEX } from './data/pincodes.js';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'vaddadi-pickles-dev-secret';
const SHIPPING_FLAT = 60;
const FREE_SHIPPING_ABOVE = 999;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

/* ------------------------------------------------------------------ helpers */
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  addresses: u.addresses || [],
  createdAt: u.createdAt,
});

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, JWT_SECRET, { expiresIn: '7d' });

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = get().users.find((u) => u.id === payload.id);
      if (!user) return res.status(401).json({ error: 'Session expired, please sign in again' });
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access only' });

/* --------------------------------------------------------------------- auth */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  if (String(password).length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const db = get();
  const exists = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) return res.status(409).json({ error: 'An account with this email already exists' });

  const user = {
    id: uid('u'),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone || '',
    passwordHash: bcrypt.hashSync(String(password), 8),
    role: 'customer',
    addresses: [],
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save();
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body || {};
  const db = get();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash))
    return res.status(401).json({ error: 'Incorrect email or password' });
  if (role === 'admin' && user.role !== 'admin')
    return res.status(403).json({ error: 'This account does not have admin privileges' });
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get('/api/auth/me', auth(), (req, res) => res.json({ user: publicUser(req.user) }));

/* ----------------------------------------------------------------- products */
app.get('/api/products', (req, res) => {
  const { q, category } = req.query;
  let list = get().products;
  if (category && category !== 'All') list = list.filter((p) => p.category === category);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle)
    );
  }
  res.json({ products: list });
});

app.get('/api/products/:id', (req, res) => {
  const p = get().products.find((x) => x.id === req.params.id || x.slug === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: p });
});

app.post('/api/products', auth(), adminOnly, (req, res) => {
  const db = get();
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: 'Product name is required' });
  const product = {
    id: uid('p'),
    name: body.name,
    slug: String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    category: body.category || 'Veg',
    tagline: body.tagline || '',
    description: body.description || '',
    spice: body.spice || 'Medium',
    shelfLife: body.shelfLife || '12 months',
    ingredients: body.ingredients || '',
    image: body.image || '/products/avakaya.jpg',
    bestseller: !!body.bestseller,
    rating: 4.5,
    reviews: 0,
    variants: (body.variants || []).map((v) => ({
      weight: Number(v.weight),
      label: v.weight === 1000 ? '1 kg' : `${v.weight} g`,
      price: Number(v.price),
      mrp: Math.round(Number(v.price) * 1.25),
      stock: Number(v.stock ?? 25),
    })),
  };
  db.products.push(product);
  save();
  res.status(201).json({ product });
});

app.put('/api/products/:id', auth(), adminOnly, (req, res) => {
  const db = get();
  const p = db.products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  const body = req.body || {};
  Object.assign(p, {
    name: body.name ?? p.name,
    category: body.category ?? p.category,
    tagline: body.tagline ?? p.tagline,
    description: body.description ?? p.description,
    spice: body.spice ?? p.spice,
    shelfLife: body.shelfLife ?? p.shelfLife,
    ingredients: body.ingredients ?? p.ingredients,
    image: body.image ?? p.image,
    bestseller: body.bestseller ?? p.bestseller,
  });
  if (Array.isArray(body.variants)) {
    p.variants = body.variants.map((v) => ({
      weight: Number(v.weight),
      label: Number(v.weight) === 1000 ? '1 kg' : `${v.weight} g`,
      price: Number(v.price),
      mrp: Math.round(Number(v.price) * 1.25),
      stock: Number(v.stock ?? 0),
    }));
  }
  save();
  res.json({ product: p });
});

app.delete('/api/products/:id', auth(), adminOnly, (req, res) => {
  const db = get();
  const i = db.products.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Product not found' });
  const [removed] = db.products.splice(i, 1);
  save();
  res.json({ removed: removed.id });
});

/* ---------------------------------------------------------------- addresses */
function normaliseAddress(body) {
  // `locality` is the India Post post-office name chosen for the PIN; `city` mirrors
  // it so every existing view (orders, admin, invoices) keeps working unchanged.
  const locality = body.locality || body.city || '';
  return {
    label: body.label || 'Home',
    name: body.name || '',
    phone: body.phone || '',
    line1: body.line1 || '',
    line2: body.line2 || '',
    landmark: body.landmark || '',
    pincode: String(body.pincode || ''),
    locality,
    city: locality,
    district: body.district || '',
    state: body.state || '',
  };
}

app.get('/api/addresses', auth(), (req, res) => res.json({ addresses: req.user.addresses || [] }));

app.post('/api/addresses', auth(), (req, res) => {
  const body = { ...(req.body || {}) };
  // accept either `locality` (India Post post-office name) or the legacy `city`
  body.city = body.city || body.locality;
  const missing = ['name', 'phone', 'line1', 'pincode', 'city', 'state'].filter((f) => !body[f]);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });
  if (!/^\d{6}$/.test(String(body.pincode)))
    return res.status(400).json({ error: 'PIN code must be exactly 6 digits' });

  req.user.addresses = req.user.addresses || [];
  const address = { id: uid('a'), ...normaliseAddress(body), isDefault: !!body.isDefault };
  if (address.isDefault || req.user.addresses.length === 0) {
    req.user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
  }
  req.user.addresses.push(address);
  save();
  res.status(201).json({ address, addresses: req.user.addresses });
});

app.put('/api/addresses/:id', auth(), (req, res) => {
  const a = (req.user.addresses || []).find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Address not found' });
  Object.assign(a, normaliseAddress({ ...a, ...req.body }));
  if (req.body?.isDefault) {
    req.user.addresses.forEach((x) => (x.isDefault = x.id === a.id));
  }
  save();
  res.json({ address: a, addresses: req.user.addresses });
});

app.patch('/api/addresses/:id/default', auth(), (req, res) => {
  const list = req.user.addresses || [];
  if (!list.some((a) => a.id === req.params.id))
    return res.status(404).json({ error: 'Address not found' });
  list.forEach((a) => (a.isDefault = a.id === req.params.id));
  save();
  res.json({ addresses: list });
});

app.delete('/api/addresses/:id', auth(), (req, res) => {
  const list = req.user.addresses || [];
  const i = list.findIndex((a) => a.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Address not found' });
  const [removed] = list.splice(i, 1);
  if (removed.isDefault && list.length) list[0].isDefault = true;
  save();
  res.json({ addresses: list });
});

/* ------------------------------------------------------- Indian PIN code API */
// Data source: https://api.postalpincode.in (the JSON API behind postalpincode.in),
// which serves official India Post records. A PIN usually covers SEVERAL post
// offices / localities — we return all of them so the customer can pick their exact
// area from a dropdown instead of typing it.
//
// Resolution order: in-memory cache -> live India Post API -> bundled offline snapshot.

const pinCache = new Map();
const PIN_TTL = 1000 * 60 * 60 * 24; // 24h

const cacheGet = (key) => {
  const hit = pinCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > PIN_TTL) {
    pinCache.delete(key);
    return null;
  }
  return hit.value;
};
const cacheSet = (key, value) => pinCache.set(key, { at: Date.now(), value });

// India Post returns names with stray whitespace and "NA" placeholders.
const clean = (v) => {
  const s = String(v ?? '').trim();
  return !s || s.toUpperCase() === 'NA' ? '' : s;
};

const isDelivery = (o) => /^delivery$/i.test(clean(o.delivery || o.DeliveryStatus));

// Shape one post office record into our own flat, UI-friendly form.
const shapeOffice = (o, pincode) => ({
  name: clean(o.Name ?? o.name),
  branchType: clean(o.BranchType ?? o.branchType),
  delivery: clean(o.DeliveryStatus ?? o.delivery),
  district: clean(o.District ?? o.district),
  division: clean(o.Division ?? o.division),
  block: clean(o.Block ?? o.block),
  state: clean(o.State ?? o.state),
  circle: clean(o.Circle ?? o.circle),
  pincode: clean(o.Pincode ?? o.pincode ?? pincode),
});

// Build the response payload the frontend consumes.
function buildPayload(pin, rawOffices, source) {
  const offices = rawOffices
    .map((o) => shapeOffice(o, pin))
    .filter((o) => o.name)
    // delivery post offices first, then alphabetically — the head/delivery office
    // is the most likely "city" for the address.
    .sort((a, b) => {
      const d = Number(isDelivery(b)) - Number(isDelivery(a));
      if (d) return d;
      const h = Number(/head/i.test(b.branchType)) - Number(/head/i.test(a.branchType));
      if (h) return h;
      return a.name.localeCompare(b.name);
    });

  if (!offices.length) return null;

  const primary = offices[0];
  return {
    pincode: pin,
    // "city" is the town/block the PIN belongs to; district/state come from India Post.
    city: primary.block || primary.district,
    district: primary.district,
    state: primary.state,
    division: primary.division,
    circle: primary.circle,
    // every locality sharing this PIN — this is what fills the City/Locality dropdown
    offices,
    localities: offices.map((o) => o.name),
    deliverable: offices.some(isDelivery),
    count: offices.length,
    source,
  };
}

async function fetchFromIndiaPost(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'vaddadi-pickles/1.0' },
    });
    if (!r.ok) return null;
    const json = await r.json();
    const entry = Array.isArray(json) ? json[0] : null;
    if (entry?.Status === 'Success' && Array.isArray(entry.PostOffice) && entry.PostOffice.length) {
      return entry.PostOffice;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// GET /api/pincode/:pin -> every locality served by that PIN code
app.get('/api/pincode/:pin', async (req, res) => {
  const pin = String(req.params.pin || '').trim();
  if (!/^\d{6}$/.test(pin))
    return res.status(400).json({ error: 'PIN code must be exactly 6 digits' });

  const cached = cacheGet(`pin:${pin}`);
  if (cached) return res.json({ ...cached, cached: true });

  const live = await fetchFromIndiaPost(`https://api.postalpincode.in/pincode/${pin}`);
  if (live) {
    const payload = buildPayload(pin, live, 'api.postalpincode.in');
    if (payload) {
      cacheSet(`pin:${pin}`, payload);
      return res.json(payload);
    }
  }

  const offline = PINCODES[pin];
  if (offline) {
    const payload = buildPayload(pin, offline, 'offline-snapshot');
    cacheSet(`pin:${pin}`, payload);
    return res.json(payload);
  }

  return res.status(404).json({
    error: `No India Post records found for PIN ${pin}. Please check the code or type your area manually.`,
  });
});

// GET /api/postoffice/:name -> reverse lookup, find the PIN from a locality name.
// Lets a customer type "Danavaipeta" and get PIN 533103 filled in for them.
app.get('/api/postoffice/:name', async (req, res) => {
  const name = String(req.params.name || '').trim();
  if (name.length < 3)
    return res.status(400).json({ error: 'Enter at least 3 characters of the area name' });

  const key = `po:${name.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ ...cached, cached: true });

  const live = await fetchFromIndiaPost(
    `https://api.postalpincode.in/postoffice/${encodeURIComponent(name)}`
  );

  let matches;
  if (live) {
    matches = live.map((o) => shapeOffice(o)).filter((o) => o.name && o.pincode);
  } else {
    const needle = name.toLowerCase();
    matches = OFFICE_INDEX.filter((o) => o.name.toLowerCase().includes(needle)).map((o) =>
      shapeOffice(o, o.pincode)
    );
  }

  if (!matches.length)
    return res.status(404).json({ error: `No post office matched "${name}"` });

  const payload = {
    query: name,
    count: matches.length,
    results: matches.slice(0, 25),
    source: live ? 'api.postalpincode.in' : 'offline-snapshot',
  };
  cacheSet(key, payload);
  res.json(payload);
});

/* ------------------------------------------------------------------- orders */
function priceCart(items, couponCode) {
  const db = get();
  const lines = [];
  for (const item of items || []) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} is no longer available`);
    const variant = product.variants.find((v) => Number(v.weight) === Number(item.weight));
    if (!variant) throw new Error(`${product.name} is not available in ${item.weight}g`);
    const qty = Math.max(1, Number(item.qty || 1));
    if (variant.stock < qty)
      throw new Error(`Only ${variant.stock} jars of ${product.name} (${variant.label}) left`);
    lines.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      weight: variant.weight,
      weightLabel: variant.label,
      unitPrice: variant.price,
      qty,
      total: variant.price * qty,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  let discount = 0;
  let shipping = subtotal >= FREE_SHIPPING_ABOVE || subtotal === 0 ? 0 : SHIPPING_FLAT;
  let coupon = null;

  if (couponCode) {
    const c = db.coupons.find(
      (x) => x.code.toLowerCase() === String(couponCode).toLowerCase() && x.active
    );
    if (c && subtotal >= c.minOrder) {
      coupon = c.code;
      if (c.type === 'percent') discount = Math.round((subtotal * c.value) / 100);
      if (c.type === 'shipping') shipping = 0;
    }
  }
  const total = Math.max(0, subtotal - discount + shipping);
  return { lines, subtotal, discount, shipping, total, coupon };
}

app.post('/api/cart/quote', (req, res) => {
  try {
    res.json(priceCart(req.body?.items, req.body?.coupon));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/orders', auth(), (req, res) => {
  const db = get();
  const { items, addressId, coupon, paymentMethod } = req.body || {};
  if (!items?.length) return res.status(400).json({ error: 'Your cart is empty' });
  const address = (req.user.addresses || []).find((a) => a.id === addressId);
  if (!address) return res.status(400).json({ error: 'Please select a delivery address' });

  let quote;
  try {
    quote = priceCart(items, coupon);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  // decrement stock
  for (const line of quote.lines) {
    const p = db.products.find((x) => x.id === line.productId);
    const v = p.variants.find((x) => Number(x.weight) === Number(line.weight));
    v.stock -= line.qty;
  }

  const order = {
    id: uid('ord'),
    orderNo: `VP${Date.now().toString().slice(-8)}`,
    userId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: quote.lines,
    address,
    subtotal: quote.subtotal,
    discount: quote.discount,
    shipping: quote.shipping,
    total: quote.total,
    coupon: quote.coupon,
    paymentMethod: paymentMethod || 'COD',
    status: 'Placed',
    createdAt: new Date().toISOString(),
    timeline: [{ status: 'Placed', at: new Date().toISOString() }],
  };
  db.orders.unshift(order);
  save();
  res.status(201).json({ order });
});

app.get('/api/orders', auth(), (req, res) => {
  const db = get();
  const list =
    req.user.role === 'admin' ? db.orders : db.orders.filter((o) => o.userId === req.user.id);
  res.json({ orders: list });
});

app.get('/api/orders/:id', auth(), (req, res) => {
  const o = get().orders.find((x) => x.id === req.params.id || x.orderNo === req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (req.user.role !== 'admin' && o.userId !== req.user.id)
    return res.status(403).json({ error: 'Not your order' });
  res.json({ order: o });
});

const STATUSES = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

app.patch('/api/orders/:id/status', auth(), adminOnly, (req, res) => {
  const db = get();
  const o = db.orders.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Unknown status' });
  o.status = status;
  o.timeline.push({ status, at: new Date().toISOString() });
  save();
  res.json({ order: o });
});

app.post('/api/orders/:id/cancel', auth(), (req, res) => {
  const db = get();
  const o = db.orders.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (req.user.role !== 'admin' && o.userId !== req.user.id)
    return res.status(403).json({ error: 'Not your order' });
  if (['Shipped', 'Delivered', 'Cancelled'].includes(o.status))
    return res.status(400).json({ error: `Order already ${o.status.toLowerCase()}` });
  o.status = 'Cancelled';
  o.timeline.push({ status: 'Cancelled', at: new Date().toISOString() });
  for (const line of o.items) {
    const p = db.products.find((x) => x.id === line.productId);
    const v = p?.variants.find((x) => Number(x.weight) === Number(line.weight));
    if (v) v.stock += line.qty;
  }
  save();
  res.json({ order: o });
});

/* -------------------------------------------------------------------- admin */
app.get('/api/admin/stats', auth(), adminOnly, (req, res) => {
  const db = get();
  const paid = db.orders.filter((o) => o.status !== 'Cancelled');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const unitsByProduct = {};
  const revenueByProduct = {};
  const unitsByWeight = { 250: 0, 500: 0, 1000: 0 };

  for (const o of paid) {
    for (const l of o.items) {
      unitsByProduct[l.name] = (unitsByProduct[l.name] || 0) + l.qty;
      revenueByProduct[l.name] = (revenueByProduct[l.name] || 0) + l.total;
      unitsByWeight[l.weight] = (unitsByWeight[l.weight] || 0) + l.qty;
    }
  }

  const byDay = {};
  for (const o of paid) {
    const d = o.createdAt.slice(0, 10);
    byDay[d] = (byDay[d] || 0) + o.total;
  }

  res.json({
    revenue,
    orders: db.orders.length,
    cancelled: db.orders.filter((o) => o.status === 'Cancelled').length,
    pending: db.orders.filter((o) => ['Placed', 'Packed'].includes(o.status)).length,
    customers: db.users.filter((u) => u.role === 'customer').length,
    products: db.products.length,
    avgOrderValue: paid.length ? Math.round(revenue / paid.length) : 0,
    lowStock: db.products
      .flatMap((p) => p.variants.map((v) => ({ name: p.name, label: v.label, stock: v.stock })))
      .filter((v) => v.stock <= 10)
      .sort((a, b) => a.stock - b.stock),
    topProducts: Object.entries(revenueByProduct)
      .map(([name, value]) => ({ name, value, units: unitsByProduct[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    unitsByWeight,
    revenueByDay: Object.entries(byDay)
      .sort()
      .slice(-14)
      .map(([date, value]) => ({ date, value })),
  });
});

app.get('/api/admin/customers', auth(), adminOnly, (req, res) => {
  const db = get();
  const list = db.users
    .filter((u) => u.role === 'customer')
    .map((u) => {
      const orders = db.orders.filter((o) => o.userId === u.id && o.status !== 'Cancelled');
      return {
        ...publicUser(u),
        orderCount: orders.length,
        spend: orders.reduce((s, o) => s + o.total, 0),
      };
    })
    .sort((a, b) => b.spend - a.spend);
  res.json({ customers: list });
});

app.post('/api/admin/reset', auth(), adminOnly, (req, res) => {
  resetDb();
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'vaddadi-pickles-api' }));

app.listen(PORT, '0.0.0.0', () => console.log(`Vaddadi Pickles API listening on :${PORT}`));

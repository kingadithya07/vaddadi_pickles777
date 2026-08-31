// All calls go to same-origin /api and are proxied by Vite to the Express API,
// so this works behind the sandbox preview host too.
const TOKEN_KEY = 'vp_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

/* ---------------------------------------------------------------------------
 * India Post lookups.
 *
 * Primary path: our own /api proxy (keeps one origin, caches, and works even if
 * the browser is offline-restricted). If the server itself has no outbound
 * internet — e.g. a locked-down container — we retry straight from the browser
 * against api.postalpincode.in, which does send permissive CORS headers.
 * ------------------------------------------------------------------------- */
const POSTAL_API = 'https://api.postalpincode.in';

const cleanValue = (v) => {
  const s = String(v ?? '').trim();
  return !s || s.toUpperCase() === 'NA' ? '' : s;
};

const shapeOffice = (o, pincode) => ({
  name: cleanValue(o.Name),
  branchType: cleanValue(o.BranchType),
  delivery: cleanValue(o.DeliveryStatus),
  district: cleanValue(o.District),
  division: cleanValue(o.Division),
  block: cleanValue(o.Block),
  state: cleanValue(o.State),
  circle: cleanValue(o.Circle),
  pincode: cleanValue(o.Pincode) || pincode,
});

const isDelivery = (o) => /^delivery$/i.test(o.delivery);

async function postalFetch(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`India Post responded ${res.status}`);
  const json = await res.json();
  const entry = Array.isArray(json) ? json[0] : null;
  if (entry?.Status !== 'Success' || !entry.PostOffice?.length) return null;
  return entry.PostOffice;
}

async function directPincode(pin) {
  const raw = await postalFetch(`${POSTAL_API}/pincode/${pin}`);
  if (!raw) throw new Error(`No India Post records found for PIN ${pin}.`);

  const offices = raw
    .map((o) => shapeOffice(o, pin))
    .filter((o) => o.name)
    .sort((a, b) => {
      const d = Number(isDelivery(b)) - Number(isDelivery(a));
      if (d) return d;
      // "Head Post Office" only — not "Branch Office directly a/w Head Office",
      // which can sit in a different district (e.g. Elephanta Caves under 400001).
      const isHead = (o) => /^head post office$/i.test(o.branchType);
      const h = Number(isHead(b)) - Number(isHead(a));
      if (h) return h;
      return a.name.localeCompare(b.name);
    });

  const primary = offices[0];
  return {
    pincode: pin,
    city: primary.block || primary.district,
    district: primary.district,
    state: primary.state,
    division: primary.division,
    circle: primary.circle,
    offices,
    localities: offices.map((o) => o.name),
    deliverable: offices.some(isDelivery),
    count: offices.length,
    source: 'api.postalpincode.in',
  };
}

async function directPostOffice(name) {
  const raw = await postalFetch(`${POSTAL_API}/postoffice/${encodeURIComponent(name)}`);
  if (!raw) throw new Error(`No post office matched "${name}"`);
  const results = raw.map((o) => shapeOffice(o)).filter((o) => o.name && o.pincode);
  return { query: name, count: results.length, results: results.slice(0, 25), source: 'api.postalpincode.in' };
}

// Try our proxy first; on network/5xx/404-style failure, ask India Post directly.
async function withDirectFallback(viaProxy, direct) {
  try {
    return await viaProxy();
  } catch (proxyError) {
    try {
      return await direct();
    } catch {
      throw proxyError;
    }
  }
}

export const api = {
  // auth
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  // catalogue
  products: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },
  product: (id) => request(`/products/${id}`, { auth: false }),
  createProduct: (body) => request('/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // addresses
  addresses: () => request('/addresses'),
  addAddress: (body) => request('/addresses', { method: 'POST', body }),
  updateAddress: (id, body) => request(`/addresses/${id}`, { method: 'PUT', body }),
  makeDefaultAddress: (id) => request(`/addresses/${id}/default`, { method: 'PATCH' }),
  deleteAddress: (id) => request(`/addresses/${id}`, { method: 'DELETE' }),

  // India Post lookups — the server proxies api.postalpincode.in (postalpincode.in)
  // and returns every post office / locality sharing the PIN.
  pincode: (pin) => withDirectFallback(() => request(`/pincode/${pin}`, { auth: false }), () => directPincode(pin)),
  // Reverse lookup: area / post office name -> matching PIN codes
  postOffice: (name) =>
    withDirectFallback(
      () => request(`/postoffice/${encodeURIComponent(name)}`, { auth: false }),
      () => directPostOffice(name)
    ),

  // cart + orders
  quote: (items, coupon) => request('/cart/quote', { method: 'POST', body: { items, coupon }, auth: false }),
  placeOrder: (body) => request('/orders', { method: 'POST', body }),
  orders: () => request('/orders'),
  order: (id) => request(`/orders/${id}`),
  setOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),

  // admin
  stats: () => request('/admin/stats'),
  customers: () => request('/admin/customers'),
};

export const inr = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const weightLabel = (w) => (Number(w) === 1000 ? '1 kg' : `${w} g`);

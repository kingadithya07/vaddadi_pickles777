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

  // India Post PIN lookup (server proxies api.postalpincode.in)
  pincode: (pin) => request(`/pincode/${pin}`, { auth: false }),

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

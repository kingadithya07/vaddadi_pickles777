// Optional: populates the running API with a handful of demo customers and
// orders so the admin dashboard has real numbers to show.
//   node scripts/seed-demo.js [http://localhost:4000]
const BASE = (process.argv[2] || 'http://localhost:4000').replace(/\/$/, '');

const post = async (path, body, token) => {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${path}: ${d.error || r.status}`);
  return d;
};
const patch = async (path, body, token) => {
  const r = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
};

const PEOPLE = [
  { name: 'Lakshmi Prasanna', email: 'lakshmi@example.in', phone: '9848012345',
    addr: { label: 'Home', line1: '8-3-214, Yousufguda', pincode: '500001', city: 'Hyderabad G.P.O.', district: 'Hyderabad', state: 'Telangana' },
    items: [['p-avakaya', 1000, 1], ['p-gongura', 500, 2]], status: 'Delivered' },
  { name: 'Ravi Teja Varma', email: 'ravi@example.in', phone: '9000045612',
    addr: { label: 'Work', line1: 'Plot 42, Whitefield', pincode: '560001', city: 'Bangalore G.P.O.', district: 'Bengaluru', state: 'Karnataka' },
    items: [['p-chicken', 500, 1], ['p-lemon', 250, 2]], status: 'Shipped' },
  { name: 'Anjali Nair', email: 'anjali@example.in', phone: '9895011223',
    addr: { label: 'Home', line1: 'Kadavanthra Road', pincode: '682001', city: 'Ernakulam H.O', district: 'Ernakulam', state: 'Kerala' },
    items: [['p-prawn', 250, 2], ['p-tomato', 500, 1]], status: 'Packed' },
  { name: 'Suresh Babu', email: 'suresh@example.in', phone: '9440033445',
    addr: { label: 'Parents', line1: '12-4-19, Danavaipeta', pincode: '533101', city: 'Rajahmundry H.O', district: 'East Godavari', state: 'Andhra Pradesh' },
    items: [['p-garlic', 1000, 1], ['p-amla', 250, 1]], status: 'Placed' },
  { name: 'Meera Deshpande', email: 'meera@example.in', phone: '9822011990',
    addr: { label: 'Home', line1: 'Lane 5, Koregaon Park', pincode: '411001', city: 'Pune H.O', district: 'Pune', state: 'Maharashtra' },
    items: [['p-avakaya', 500, 3]], status: 'Delivered' },
];

const run = async () => {
  const { token: adminToken } = await post('/api/auth/login', {
    email: 'admin@vaddadipickles.in', password: 'admin123', role: 'admin',
  });

  for (const p of PEOPLE) {
    let token;
    try {
      ({ token } = await post('/api/auth/register', {
        name: p.name, email: p.email, phone: p.phone, password: 'demo1234',
      }));
    } catch {
      ({ token } = await post('/api/auth/login', { email: p.email, password: 'demo1234' }));
    }

    const { address } = await post('/api/addresses', { ...p.addr, name: p.name, phone: p.phone, isDefault: true }, token);
    const { order } = await post('/api/orders', {
      items: p.items.map(([productId, weight, qty]) => ({ productId, weight, qty })),
      addressId: address.id,
      coupon: 'VADDADI10',
      paymentMethod: ['COD', 'UPI', 'Card'][Math.floor(Math.random() * 3)],
    }, token);

    const flow = ['Packed', 'Shipped', 'Delivered'];
    for (const s of flow.slice(0, flow.indexOf(p.status) + 1)) {
      await patch(`/api/orders/${order.id}/status`, { status: s }, adminToken);
    }
    console.log(`✓ ${p.name} → ${order.orderNo} (${p.status})`);
  }
  console.log('\nDemo data ready. Sign in as admin@vaddadipickles.in / admin123');
};

run().catch((e) => { console.error('✗', e.message); process.exit(1); });

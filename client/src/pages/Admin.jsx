import { useEffect, useMemo, useState } from 'react';
import { api, inr } from '../lib/api';
import { useApp } from '../store/AppContext';
import { Icon } from '../components/Icons';

const TABS = [
  ['overview', 'Overview', Icon.Chart],
  ['orders', 'Orders', Icon.Box],
  ['products', 'Products', Icon.Leaf],
  ['customers', 'Customers', Icon.Users],
];
const STATUSES = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
const WEIGHTS = [250, 500, 1000];

const emptyProduct = {
  name: '',
  category: 'Veg',
  tagline: '',
  description: '',
  spice: 'Medium',
  shelfLife: '12 months',
  ingredients: '',
  image: '/products/avakaya.jpg',
  bestseller: false,
  variants: WEIGHTS.map((w) => ({ weight: w, price: '', stock: 25 })),
};

function ProductModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          variants: WEIGHTS.map((w) => {
            const v = initial.variants.find((x) => Number(x.weight) === w);
            return { weight: w, price: v?.price ?? '', stock: v?.stock ?? 0 };
          }),
        }
      : emptyProduct
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const setVar = (w, key, value) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) => (Number(v.weight) === w ? { ...v, [key]: value } : v)),
    }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) return setErr('Product name is required');
    if (form.variants.some((v) => !Number(v.price))) return setErr('Set a price for all three weights');
    setBusy(true);
    try {
      const payload = {
        ...form,
        variants: form.variants.map((v) => ({
          weight: Number(v.weight),
          price: Number(v.price),
          stock: Number(v.stock || 0),
        })),
      };
      if (initial?.id) await api.updateProduct(initial.id, payload);
      else await api.createProduct(payload);
      onSaved();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-wrap">
      <div className="overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal-head">
          <h3 style={{ fontSize: 18 }}>{initial ? 'Edit product' : 'New product'}</h3>
          <div className="spacer" />
          <button className="icon-btn" onClick={onClose}><Icon.Close /></button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          {err && <div className="alert alert-err">{err}</div>}
          <div className="grid-2">
            <div className="field"><label>Name *</label><input className="input" value={form.name} onChange={set('name')} /></div>
            <div className="field">
              <label>Category</label>
              <select className="select" value={form.category} onChange={set('category')}>
                <option>Veg</option><option>Non-Veg</option>
              </select>
            </div>
          </div>
          <div className="field"><label>Tagline</label><input className="input" value={form.tagline} onChange={set('tagline')} /></div>
          <div className="field"><label>Description</label><textarea className="textarea" value={form.description} onChange={set('description')} /></div>
          <div className="grid-3">
            <div className="field">
              <label>Spice level</label>
              <select className="select" value={form.spice} onChange={set('spice')}>
                <option>Mild</option><option>Medium</option><option>Hot</option><option>Extra Hot</option>
              </select>
            </div>
            <div className="field"><label>Shelf life</label><input className="input" value={form.shelfLife} onChange={set('shelfLife')} /></div>
            <div className="field"><label>Image path</label><input className="input" value={form.image} onChange={set('image')} /></div>
          </div>
          <div className="field"><label>Ingredients</label><input className="input" value={form.ingredients} onChange={set('ingredients')} /></div>

          <div className="card card-pad stack gap-12" style={{ background: 'var(--cream)' }}>
            <strong className="small">Weight-wise pricing & stock</strong>
            {form.variants.map((v) => (
              <div className="grid-3" key={v.weight} style={{ alignItems: 'end' }}>
                <div className="field">
                  <label>Weight</label>
                  <input className="input" value={Number(v.weight) === 1000 ? '1 kg' : `${v.weight} g`} readOnly />
                </div>
                <div className="field">
                  <label>Price (₹)</label>
                  <input className="input" type="number" min="1" value={v.price} onChange={(e) => setVar(Number(v.weight), 'price', e.target.value)} />
                </div>
                <div className="field">
                  <label>Stock (jars)</label>
                  <input className="input" type="number" min="0" value={v.stock} onChange={(e) => setVar(Number(v.weight), 'stock', e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <label className="row gap-8 small" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.bestseller} onChange={set('bestseller')} /> Mark as bestseller
          </label>

          <div className="row gap-8">
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const { toast, user } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(null); // 'new' | product
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const load = () => {
    api.stats().then(setStats).catch(() => {});
    api.orders().then((d) => setOrders(d.orders));
    api.products().then((d) => setProducts(d.products));
    api.customers().then((d) => setCustomers(d.customers)).catch(() => {});
  };
  useEffect(load, []);

  const setStatus = async (id, status) => {
    try {
      await api.setOrderStatus(id, status);
      load();
      toast(`Order marked ${status}`, 'ok');
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  const removeProduct = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await api.deleteProduct(p.id);
    load();
    toast('Product deleted');
  };

  const shownOrders = useMemo(() => {
    let l = orders;
    if (filter !== 'All') l = l.filter((o) => o.status === filter);
    if (search.trim()) {
      const n = search.toLowerCase();
      l = l.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(n) ||
          o.customerName.toLowerCase().includes(n) ||
          o.address.pincode.includes(n)
      );
    }
    return l;
  }, [orders, filter, search]);

  const maxDay = Math.max(1, ...(stats?.revenueByDay || []).map((d) => d.value));
  const maxTop = Math.max(1, ...(stats?.topProducts || []).map((p) => p.value));
  const weightTotal = stats ? Object.values(stats.unitsByWeight).reduce((a, b) => a + b, 0) || 1 : 1;

  return (
    <div className="page">
      <div className="container">
        <div className="page-head row gap-12" style={{ flexWrap: 'wrap' }}>
          <div>
            <span className="badge badge-gold">Admin console</span>
            <h1 style={{ marginTop: 10 }}>Vaddadi Pickles control room</h1>
            <p>Signed in as {user?.email}</p>
          </div>
          <div className="spacer" />
          <button className="btn btn-primary" onClick={() => setModal('new')}>
            <Icon.Plus width={16} height={16} /> Add product
          </button>
        </div>

        <div className="dash">
          <nav className="card side">
            {TABS.map(([id, label, I]) => (
              <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
                <I width={16} height={16} /> {label}
              </button>
            ))}
          </nav>

          <div className="stack gap-20">
            {tab === 'overview' && stats && (
              <>
                <div className="stat-grid">
                  <div className="stat"><div className="k">Revenue</div><div className="v">{inr(stats.revenue)}</div><div className="s">excluding cancellations</div></div>
                  <div className="stat"><div className="k">Orders</div><div className="v">{stats.orders}</div><div className="s">{stats.pending} awaiting dispatch</div></div>
                  <div className="stat"><div className="k">Avg order value</div><div className="v">{inr(stats.avgOrderValue)}</div><div className="s">per placed order</div></div>
                  <div className="stat"><div className="k">Customers</div><div className="v">{stats.customers}</div><div className="s">registered accounts</div></div>
                  <div className="stat"><div className="k">Products</div><div className="v">{stats.products}</div><div className="s">× 3 weight variants</div></div>
                  <div className="stat"><div className="k">Low stock</div><div className="v">{stats.lowStock.length}</div><div className="s">variants ≤ 10 jars</div></div>
                </div>

                <div className="grid-2" style={{ alignItems: 'start' }}>
                  <section className="card card-pad stack gap-14">
                    <h3 style={{ fontSize: 17 }}>Revenue, last 14 days</h3>
                    {stats.revenueByDay.length === 0 ? (
                      <p className="small muted">No sales recorded yet.</p>
                    ) : (
                      <>
                        <div className="spark">
                          {stats.revenueByDay.map((d) => (
                            <i key={d.date} style={{ height: `${(d.value / maxDay) * 100}%` }} title={`${d.date}: ${inr(d.value)}`} />
                          ))}
                        </div>
                        <div className="row tiny muted">
                          <span>{stats.revenueByDay[0].date}</span><div className="spacer" />
                          <span>{stats.revenueByDay.at(-1).date}</span>
                        </div>
                      </>
                    )}
                  </section>

                  <section className="card card-pad stack gap-14">
                    <h3 style={{ fontSize: 17 }}>Jars sold by weight</h3>
                    {[250, 500, 1000].map((w) => (
                      <div className="bar-row" key={w}>
                        <span>{w === 1000 ? '1 kg' : `${w} g`}</span>
                        <div className="bar"><i style={{ width: `${(stats.unitsByWeight[w] / weightTotal) * 100}%` }} /></div>
                        <span className="small" style={{ textAlign: 'right' }}>{stats.unitsByWeight[w]} jars</span>
                      </div>
                    ))}
                    <p className="tiny muted">Helps you decide which jar size to pack more of next batch.</p>
                  </section>
                </div>

                <div className="grid-2" style={{ alignItems: 'start' }}>
                  <section className="card card-pad stack gap-14">
                    <h3 style={{ fontSize: 17 }}>Top products by revenue</h3>
                    {stats.topProducts.length === 0 ? <p className="small muted">No sales yet.</p> :
                      stats.topProducts.map((p) => (
                        <div className="bar-row" key={p.name}>
                          <span className="small">{p.name}</span>
                          <div className="bar"><i style={{ width: `${(p.value / maxTop) * 100}%` }} /></div>
                          <span className="small" style={{ textAlign: 'right' }}>{inr(p.value)}</span>
                        </div>
                      ))}
                  </section>

                  <section className="card card-pad stack gap-10">
                    <h3 style={{ fontSize: 17 }}>Low stock alerts</h3>
                    {stats.lowStock.length === 0 ? (
                      <p className="small muted">All variants are well stocked.</p>
                    ) : (
                      stats.lowStock.slice(0, 8).map((v, i) => (
                        <div className="row gap-8 small" key={i}>
                          <span>{v.name}</span>
                          <span className="badge badge-ghost">{v.label}</span>
                          <div className="spacer" />
                          <span className={`badge ${v.stock === 0 ? 'badge-nonveg' : 'badge-hot'}`}>
                            {v.stock === 0 ? 'Out of stock' : `${v.stock} left`}
                          </span>
                        </div>
                      ))
                    )}
                  </section>
                </div>
              </>
            )}

            {tab === 'orders' && (
              <section className="card card-pad stack gap-14">
                <div className="row gap-10" style={{ flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 18 }}>Orders ({shownOrders.length})</h3>
                  <div className="spacer" />
                  <input className="input" style={{ maxWidth: 240 }} placeholder="Search order / customer / PIN" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <select className="select" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option>All</option>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {shownOrders.length === 0 ? (
                  <div className="empty"><h3>No orders here</h3><p className="small">Orders placed by customers appear instantly.</p></div>
                ) : (
                  <div className="table-wrap">
                    <table className="tbl">
                      <thead>
                        <tr><th>Order</th><th>Customer</th><th>Items</th><th>Deliver to</th><th>Total</th><th>Status</th><th>Update</th></tr>
                      </thead>
                      <tbody>
                        {shownOrders.map((o) => (
                          <tr key={o.id}>
                            <td><b>{o.orderNo}</b><br /><span className="tiny muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span></td>
                            <td className="small">{o.customerName}<br /><span className="tiny muted">{o.customerEmail}</span></td>
                            <td className="small" style={{ maxWidth: 250 }}>
                              {o.items.map((i) => (
                                <div key={`${i.productId}-${i.weight}`} className="tiny">
                                  {i.name} <b>{i.weightLabel}</b> × {i.qty}
                                </div>
                              ))}
                            </td>
                            <td className="tiny">
                              {o.address.city}, {o.address.state}<br />
                              {o.address.division ? <>Div: {o.address.division}<br /></> : null}
                              <b>{o.address.pincode}</b>
                            </td>
                            <td><b>{inr(o.total)}</b><br /><span className="tiny muted">{o.paymentMethod}</span></td>
                            <td><span className={`status ${o.status}`}>{o.status}</span></td>
                            <td>
                              <select className="select" style={{ minWidth: 128 }} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                                {STATUSES.map((s) => <option key={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {tab === 'products' && (
              <section className="card card-pad stack gap-14">
                <div className="row">
                  <h3 style={{ fontSize: 18 }}>Catalogue ({products.length})</h3>
                  <div className="spacer" />
                  <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>
                    <Icon.Plus width={15} height={15} /> Add product
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="tbl">
                    <thead>
                      <tr><th>Product</th><th>Category</th><th>250 g</th><th>500 g</th><th>1 kg</th><th>Stock</th><th></th></tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const v = (w) => p.variants.find((x) => Number(x.weight) === w);
                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="row gap-10">
                                <img src={p.image} alt="" style={{ width: 42, height: 42, borderRadius: 9, objectFit: 'cover' }} />
                                <div className="stack">
                                  <b className="small">{p.name}</b>
                                  <span className="tiny muted">{p.spice} · {p.shelfLife}</span>
                                </div>
                              </div>
                            </td>
                            <td><span className={`badge ${p.category === 'Veg' ? 'badge-veg' : 'badge-nonveg'}`}>{p.category}</span></td>
                            <td>{v(250) ? inr(v(250).price) : '—'}</td>
                            <td>{v(500) ? inr(v(500).price) : '—'}</td>
                            <td>{v(1000) ? inr(v(1000).price) : '—'}</td>
                            <td className="tiny">
                              {p.variants.map((x) => (
                                <div key={x.weight}>{x.label}: <b>{x.stock}</b></div>
                              ))}
                            </td>
                            <td>
                              <div className="row gap-6">
                                <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}><Icon.Edit width={14} height={14} /></button>
                                <button className="btn btn-danger btn-sm" onClick={() => removeProduct(p)}><Icon.Trash width={14} height={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === 'customers' && (
              <section className="card card-pad stack gap-14">
                <h3 style={{ fontSize: 18 }}>Customers ({customers.length})</h3>
                <div className="table-wrap">
                  <table className="tbl">
                    <thead><tr><th>Name</th><th>Contact</th><th>Addresses</th><th>Orders</th><th>Lifetime value</th></tr></thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id}>
                          <td><b className="small">{c.name}</b><br /><span className="tiny muted">Joined {new Date(c.createdAt).toLocaleDateString('en-IN')}</span></td>
                          <td className="small">{c.email}<br /><span className="tiny muted">{c.phone || '—'}</span></td>
                          <td className="tiny">
                            {c.addresses.length === 0 ? '—' : c.addresses.map((a) => (
                              <div key={a.id}>
                                {a.label}: {a.city} — {a.pincode}
                                {a.division ? <span className="muted"> ({a.division})</span> : null}
                              </div>
                            ))}
                          </td>
                          <td>{c.orderCount}</td>
                          <td><b>{inr(c.spend)}</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <ProductModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); toast('Catalogue updated', 'ok'); }}
        />
      )}
    </div>
  );
}

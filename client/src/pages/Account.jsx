import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, inr } from '../lib/api';
import { useApp } from '../store/AppContext';
import AddressForm from '../components/AddressForm';
import { Icon } from '../components/Icons';

const TABS = [
  ['overview', 'Overview', Icon.Home],
  ['orders', 'My orders', Icon.Box],
  ['addresses', 'Addresses', Icon.Pin],
  ['profile', 'Profile', Icon.User],
];

function AddressCard({ a, onEdit, onDelete, onDefault }) {
  return (
    <div className={`addr ${a.isDefault ? 'def' : ''}`}>
      <div className="row gap-8">
        <span className="badge badge-gold">{a.label}</span>
        {a.isDefault && <span className="badge badge-ghost">Default</span>}
      </div>
      <strong className="small">{a.name}</strong>
      <span className="small muted" style={{ lineHeight: 1.6 }}>
        {a.line1}{a.line2 ? `, ${a.line2}` : ''}
        {a.landmark ? <><br />Landmark: {a.landmark}</> : null}
        <br />{a.city}{a.district ? `, ${a.district}` : ''}
        {a.division ? <><br /><span className="tiny">Sub division: {a.division}</span></> : null}
        <br />{a.state} — <b>{a.pincode}</b>
        <br />📞 {a.phone}
      </span>
      <div className="row gap-6" style={{ marginTop: 4, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(a)}><Icon.Edit width={14} height={14} /> Edit</button>
        {!a.isDefault && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onDefault(a.id)}>Set default</button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(a.id)}><Icon.Trash width={14} height={14} /></button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Account() {
  const { user, refreshUser, toast, addToCart } = useApp();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null); // address object or 'new'
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);

  const loadAll = () => {
    api.orders().then((d) => setOrders(d.orders));
    api.addresses().then((d) => setAddresses(d.addresses));
  };

  useEffect(() => {
    loadAll();
    api.products().then((d) => setProducts(d.products));
  }, []);

  const save = async (form) => {
    setSaving(true);
    try {
      const d = editing?.id ? await api.updateAddress(editing.id, form) : await api.addAddress(form);
      setAddresses(d.addresses);
      setEditing(null);
      await refreshUser();
      toast(editing?.id ? 'Address updated' : 'Address added', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const d = await api.deleteAddress(id);
    setAddresses(d.addresses);
    await refreshUser();
    toast('Address removed');
  };

  const makeDefault = async (id) => {
    const d = await api.makeDefaultAddress(id);
    setAddresses(d.addresses);
    await refreshUser();
    toast('Default address updated', 'ok');
  };

  const cancel = async (id) => {
    try {
      await api.cancelOrder(id);
      loadAll();
      toast('Order cancelled');
    } catch (e) {
      toast(e.message, 'err');
    }
  };

  const reorder = (order) => {
    let n = 0;
    for (const line of order.items) {
      const p = products.find((x) => x.id === line.productId);
      if (p) { addToCart(p, line.weight, line.qty); n++; }
    }
    if (!n) toast('Those pickles are no longer available', 'err');
  };

  const active = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));
  const spend = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <h1>Namaste, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Your orders, saved addresses and profile — all in one place.</p>
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
            {tab === 'overview' && (
              <>
                <div className="stat-grid">
                  <div className="stat"><div className="k">Total orders</div><div className="v">{orders.length}</div><div className="s">lifetime</div></div>
                  <div className="stat"><div className="k">In progress</div><div className="v">{active.length}</div><div className="s">being packed or shipped</div></div>
                  <div className="stat"><div className="k">Total spent</div><div className="v">{inr(spend)}</div><div className="s">excluding cancellations</div></div>
                  <div className="stat"><div className="k">Saved addresses</div><div className="v">{addresses.length}</div><div className="s">PIN verified</div></div>
                </div>

                <section className="card card-pad stack gap-14">
                  <div className="row"><h3 style={{ fontSize: 18 }}>Recent orders</h3><div className="spacer" />
                    <button className="btn btn-quiet btn-sm" onClick={() => setTab('orders')}>View all →</button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="empty">
                      <h3>No orders yet</h3>
                      <p className="small">Your first jar is waiting.</p>
                      <Link className="btn btn-primary" to="/shop" style={{ marginTop: 16 }}>Shop pickles</Link>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="tbl">
                        <thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id}>
                              <td><b>{o.orderNo}</b><br /><span className="tiny muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span></td>
                              <td className="small">{o.items.map((i) => `${i.name} (${i.weightLabel})×${i.qty}`).join(', ')}</td>
                              <td><b>{inr(o.total)}</b></td>
                              <td><span className={`status ${o.status}`}>{o.status}</span></td>
                              <td><Link className="btn btn-ghost btn-sm" to={`/order/${o.id}`}>Track</Link></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="card card-pad stack gap-12">
                  <h3 style={{ fontSize: 18 }}>Default delivery address</h3>
                  {addresses.find((a) => a.isDefault) ? (
                    <div className="addr-grid">
                      <AddressCard a={addresses.find((a) => a.isDefault)} onEdit={setEditing} onDelete={remove} onDefault={makeDefault} />
                    </div>
                  ) : (
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => { setTab('addresses'); setEditing('new'); }}>
                      <Icon.Plus width={15} height={15} /> Add your first address
                    </button>
                  )}
                </section>
              </>
            )}

            {tab === 'orders' && (
              <section className="card card-pad stack gap-14">
                <h3 style={{ fontSize: 18 }}>All orders</h3>
                {orders.length === 0 ? (
                  <div className="empty"><h3>No orders yet</h3><Link className="btn btn-primary" to="/shop" style={{ marginTop: 14 }}>Shop pickles</Link></div>
                ) : (
                  orders.map((o) => (
                    <div className="card card-pad stack gap-12" key={o.id} style={{ background: 'var(--cream)' }}>
                      <div className="row gap-12" style={{ flexWrap: 'wrap' }}>
                        <div className="stack gap-4">
                          <b>{o.orderNo}</b>
                          <span className="tiny muted">
                            Placed {new Date(o.createdAt).toLocaleString('en-IN')} · {o.paymentMethod}
                          </span>
                        </div>
                        <div className="spacer" />
                        <span className={`status ${o.status}`}>{o.status}</span>
                        <b>{inr(o.total)}</b>
                      </div>

                      <div className="stack gap-8">
                        {o.items.map((i) => (
                          <div className="row gap-10" key={`${i.productId}-${i.weight}`}>
                            <img src={i.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                            <span className="small">{i.name}</span>
                            <span className="badge badge-ghost">{i.weightLabel}</span>
                            <span className="tiny muted">× {i.qty}</span>
                            <div className="spacer" />
                            <span className="small">{inr(i.total)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
                        <span className="tiny muted">
                          Ship to: {o.address.line1}, {o.address.city}, {o.address.state} — {o.address.pincode}
                        </span>
                        <div className="spacer" />
                        <Link className="btn btn-ghost btn-sm" to={`/order/${o.id}`}>Track order</Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => reorder(o)}>Reorder</button>
                        {!['Shipped', 'Delivered', 'Cancelled'].includes(o.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancel(o.id)}>Cancel</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}

            {tab === 'addresses' && (
              <section className="card card-pad stack gap-16">
                <div className="row">
                  <h3 style={{ fontSize: 18 }}>Saved addresses ({addresses.length})</h3>
                  <div className="spacer" />
                  {!editing && (
                    <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
                      <Icon.Plus width={15} height={15} /> Add address
                    </button>
                  )}
                </div>

                <div className="alert alert-info small row gap-8">
                  <Icon.Pin width={15} height={15} />
                  Enter a 6-digit PIN code and we auto-fill district, state and post office from India Post records.
                </div>

                {editing ? (
                  <AddressForm
                    initial={editing === 'new' ? null : editing}
                    saving={saving}
                    onSave={save}
                    onCancel={() => setEditing(null)}
                  />
                ) : addresses.length === 0 ? (
                  <div className="empty"><h3>No addresses saved</h3><p className="small">Add home, work or your parents' place — switch between them at checkout.</p></div>
                ) : (
                  <div className="addr-grid">
                    {addresses.map((a) => (
                      <AddressCard key={a.id} a={a} onEdit={setEditing} onDelete={remove} onDefault={makeDefault} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === 'profile' && (
              <section className="card card-pad stack gap-14">
                <h3 style={{ fontSize: 18 }}>Profile</h3>
                <div className="grid-2">
                  <div className="field"><label>Name</label><input className="input" value={user?.name || ''} readOnly /></div>
                  <div className="field"><label>Email</label><input className="input" value={user?.email || ''} readOnly /></div>
                  <div className="field"><label>Mobile</label><input className="input" value={user?.phone || '—'} readOnly /></div>
                  <div className="field"><label>Member since</label><input className="input" value={new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN')} readOnly /></div>
                </div>
                <div className="alert alert-info small">
                  Account type: <b>Customer</b> · {addresses.length} saved address(es) · {orders.length} order(s)
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

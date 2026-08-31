import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, inr } from '../lib/api';
import { useApp } from '../store/AppContext';
import AddressForm from '../components/AddressForm';
import { Icon } from '../components/Icons';

export default function Checkout() {
  const { cart, cartSubtotal, clearCart, user, refreshUser, toast } = useApp();
  const nav = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');
  const [quote, setQuote] = useState(null);
  const [payment, setPayment] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.addresses().then((d) => {
      setAddresses(d.addresses);
      const def = d.addresses.find((a) => a.isDefault) || d.addresses[0];
      setSelected(def?.id || null);
      if (!d.addresses.length) setAdding(true);
    });
  }, []);

  useEffect(() => {
    if (!cart.length) return setQuote(null);
    api
      .quote(cart.map((l) => ({ productId: l.productId, weight: l.weight, qty: l.qty })), applied)
      .then(setQuote)
      .catch((e) => setErr(e.message));
  }, [cart, applied]);

  const saveAddress = async (form) => {
    setSaving(true);
    setErr('');
    try {
      const d = await api.addAddress(form);
      setAddresses(d.addresses);
      setSelected(d.address.id);
      setAdding(false);
      await refreshUser();
      toast('Address saved', 'ok');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const placeOrder = async () => {
    setErr('');
    if (!selected) return setErr('Please select a delivery address');
    setPlacing(true);
    try {
      const d = await api.placeOrder({
        items: cart.map((l) => ({ productId: l.productId, weight: l.weight, qty: l.qty })),
        addressId: selected,
        coupon: applied,
        paymentMethod: payment,
      });
      clearCart();
      toast('Order placed successfully!', 'ok');
      nav(`/order/${d.order.id}`, { replace: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="page container">
        <div className="empty card card-pad">
          <h3>Nothing to check out</h3>
          <p className="small">Your basket is empty.</p>
          <Link className="btn btn-primary" to="/shop" style={{ marginTop: 18 }}>Browse pickles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <h1>Checkout</h1>
          <p>Signed in as {user?.email}</p>
        </div>

        <div className="steps">
          <span className="step on"><b>1</b> Basket</span>
          <span className="step on"><b>2</b> Address & PIN</span>
          <span className="step on"><b>3</b> Payment</span>
        </div>

        {err && <div className="alert alert-err" style={{ marginBottom: 16 }}>{err}</div>}

        <div className="checkout">
          <div className="stack gap-20">
            <section className="card card-pad stack gap-16">
              <div className="row gap-8">
                <Icon.Pin />
                <h3 style={{ fontSize: 19 }}>Delivery address</h3>
                <div className="spacer" />
                {!adding && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
                    <Icon.Plus width={15} height={15} /> Add new
                  </button>
                )}
              </div>

              {adding ? (
                <AddressForm
                  saving={saving}
                  onSave={saveAddress}
                  onCancel={addresses.length ? () => setAdding(false) : undefined}
                />
              ) : (
                <div className="addr-grid">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className={`addr pick ${selected === a.id ? 'sel' : ''}`}
                      onClick={() => setSelected(a.id)}
                    >
                      <div className="row gap-8">
                        <span className="badge badge-gold">{a.label}</span>
                        {a.isDefault && <span className="badge badge-ghost">Default</span>}
                        <div className="spacer" />
                        {selected === a.id && (
                          <span style={{ color: 'var(--maroon)' }}><Icon.Check width={17} height={17} /></span>
                        )}
                      </div>
                      <strong className="small">{a.name} · {a.phone}</strong>
                      <span className="small muted" style={{ lineHeight: 1.55 }}>
                        {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                        {a.city}, {a.district}<br />
                        {a.division ? <>Sub division: {a.division}<br /></> : null}
                        {a.state} — <b>{a.pincode}</b>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card card-pad stack gap-14">
              <h3 style={{ fontSize: 19 }}>Payment method</h3>
              {[
                ['COD', 'Cash on delivery', 'Pay the courier when the jars arrive.'],
                ['UPI', 'UPI / GPay / PhonePe', 'Demo mode — no money is actually charged.'],
                ['Card', 'Credit or debit card', 'Demo mode — no money is actually charged.'],
              ].map(([v, t, s]) => (
                <label
                  key={v}
                  className={`addr pick ${payment === v ? 'sel' : ''}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  <input type="radio" name="pay" checked={payment === v} onChange={() => setPayment(v)} />
                  <span className="stack gap-4">
                    <strong className="small">{t}</strong>
                    <span className="tiny muted">{s}</span>
                  </span>
                </label>
              ))}
            </section>
          </div>

          <aside className="card card-pad stack gap-14" style={{ position: 'sticky', top: 86 }}>
            <h3 style={{ fontSize: 19 }}>Order summary</h3>

            <div className="stack gap-10">
              {cart.map((l) => (
                <div className="row gap-10" key={`${l.productId}-${l.weight}`}>
                  <img src={l.image} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                  <div className="stack" style={{ flex: 1 }}>
                    <span className="small"><b>{l.name}</b></span>
                    <span className="tiny muted">{l.weightLabel} × {l.qty}</span>
                  </div>
                  <b className="small">{inr(l.price * l.qty)}</b>
                </div>
              ))}
            </div>

            <div className="row gap-8">
              <input
                className="input"
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              />
              <button className="btn btn-ghost btn-sm" onClick={() => setApplied(coupon)}>Apply</button>
            </div>
            {applied && quote && (
              quote.coupon ? (
                <div className="alert alert-ok tiny">Coupon {quote.coupon} applied.</div>
              ) : (
                <div className="alert alert-err tiny">Coupon not valid for this basket.</div>
              )
            )}

            <div className="stack gap-8" style={{ marginTop: 4 }}>
              <div className="sum-row"><span className="muted">Subtotal</span><b>{inr(quote?.subtotal ?? cartSubtotal)}</b></div>
              {quote?.discount > 0 && (
                <div className="sum-row"><span className="muted">Discount</span><b style={{ color: 'var(--green)' }}>− {inr(quote.discount)}</b></div>
              )}
              <div className="sum-row">
                <span className="muted">Shipping</span>
                <b>{quote?.shipping === 0 ? 'FREE' : inr(quote?.shipping ?? 60)}</b>
              </div>
              <div className="sum-row total"><span>Total</span><span>{inr(quote?.total ?? cartSubtotal)}</span></div>
            </div>

            <button className="btn btn-primary btn-block" disabled={placing || !selected} onClick={placeOrder}>
              {placing ? 'Placing order…' : `Place order · ${inr(quote?.total ?? cartSubtotal)}`}
            </button>
            <span className="tiny muted center">
              By placing this order you agree to our replacement policy for damaged jars.
            </span>
          </aside>
        </div>
      </div>
    </div>
  );
}

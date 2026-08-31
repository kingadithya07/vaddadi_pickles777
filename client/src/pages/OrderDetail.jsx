import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, inr } from '../lib/api';
import { Icon } from '../components/Icons';

const FLOW = ['Placed', 'Packed', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.order(id).then((d) => setOrder(d.order)).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="page container empty"><h3>{err}</h3><Link className="btn btn-primary" to="/account">Back to account</Link></div>;
  if (!order) return <div className="page container"><div className="skeleton" style={{ height: 340 }} /></div>;

  const stepIndex = order.status === 'Cancelled' ? -1 : FLOW.indexOf(order.status);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="page-head">
          <span className="badge badge-gold">Order {order.orderNo}</span>
          <h1 style={{ marginTop: 10 }}>
            {order.status === 'Cancelled' ? 'Order cancelled' : 'Thank you for your order!'}
          </h1>
          <p>Placed on {new Date(order.createdAt).toLocaleString('en-IN')} · Paid via {order.paymentMethod}</p>
        </div>

        <div className="card card-pad stack gap-16" style={{ marginBottom: 20 }}>
          <div className="steps">
            {order.status === 'Cancelled' ? (
              <span className="step on" style={{ background: '#a52a13', borderColor: '#a52a13' }}><b>✕</b> Cancelled</span>
            ) : (
              FLOW.map((s, i) => (
                <span key={s} className={`step ${i <= stepIndex ? 'on' : ''}`}>
                  <b>{i <= stepIndex ? '✓' : i + 1}</b> {s}
                </span>
              ))
            )}
          </div>
          <div className="stack gap-6">
            {order.timeline.map((t, i) => (
              <span key={i} className="small muted">
                <b style={{ color: 'var(--ink)' }}>{t.status}</b> — {new Date(t.at).toLocaleString('en-IN')}
              </span>
            ))}
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card card-pad stack gap-12">
            <h3 style={{ fontSize: 17 }}>Items</h3>
            {order.items.map((i) => (
              <div className="row gap-10" key={`${i.productId}-${i.weight}`}>
                <img src={i.image} alt="" style={{ width: 48, height: 48, borderRadius: 9, objectFit: 'cover' }} />
                <div className="stack gap-2" style={{ flex: 1 }}>
                  <span className="small"><b>{i.name}</b></span>
                  <span className="tiny muted">{i.weightLabel} × {i.qty} @ {inr(i.unitPrice)}</span>
                </div>
                <b className="small">{inr(i.total)}</b>
              </div>
            ))}
            <div className="stack gap-6" style={{ marginTop: 6 }}>
              <div className="sum-row"><span className="muted">Subtotal</span><b>{inr(order.subtotal)}</b></div>
              {order.discount > 0 && <div className="sum-row"><span className="muted">Discount ({order.coupon})</span><b style={{ color: 'var(--green)' }}>− {inr(order.discount)}</b></div>}
              <div className="sum-row"><span className="muted">Shipping</span><b>{order.shipping === 0 ? 'FREE' : inr(order.shipping)}</b></div>
              <div className="sum-row total"><span>Total</span><span>{inr(order.total)}</span></div>
            </div>
          </div>

          <div className="card card-pad stack gap-10">
            <h3 style={{ fontSize: 17 }} className="row gap-8"><Icon.Pin width={17} height={17} /> Delivering to</h3>
            <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>{order.address.label}</span>
            <span className="small" style={{ lineHeight: 1.7 }}>
              <b>{order.address.name}</b><br />
              {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
              {order.address.landmark ? <>Landmark: {order.address.landmark}<br /></> : null}
              {order.address.city}{order.address.district ? `, ${order.address.district}` : ''}<br />
              {order.address.division ? <>Sub division: {order.address.division}<br /></> : null}
              {order.address.state} — <b>{order.address.pincode}</b><br />
              📞 {order.address.phone}
            </span>
            <div className="alert alert-info tiny" style={{ marginTop: 6 }}>
              PIN {order.address.pincode} verified against India Post delivery records.
            </div>
            <Link className="btn btn-ghost btn-block" to="/account" style={{ marginTop: 6 }}>Back to my orders</Link>
            <Link className="btn btn-primary btn-block" to="/shop">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

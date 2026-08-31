import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { inr } from '../lib/api';
import { Icon } from './Icons';

const FREE_ABOVE = 999;

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, cartSubtotal, user } = useApp();
  const nav = useNavigate();
  if (!cartOpen) return null;

  const shipping = cartSubtotal === 0 || cartSubtotal >= FREE_ABOVE ? 0 : 60;
  const go = (path) => {
    setCartOpen(false);
    nav(path);
  };

  return (
    <>
      <div className="overlay" onClick={() => setCartOpen(false)} />
      <aside className="drawer">
        <div className="drawer-head">
          <Icon.Cart />
          <h3 style={{ fontSize: 18 }}>Your basket</h3>
          <span className="badge badge-ghost">{cart.length} item{cart.length === 1 ? '' : 's'}</span>
          <div className="spacer" />
          <button className="icon-btn" onClick={() => setCartOpen(false)}><Icon.Close /></button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty">
              <h3>Your basket is empty</h3>
              <p className="small">Pick a jar — 250 g, 500 g or 1 kg.</p>
              <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => go('/shop')}>
                Browse pickles
              </button>
            </div>
          ) : (
            cart.map((l) => (
              <div className="cart-line" key={`${l.productId}-${l.weight}`}>
                <img src={l.image} alt={l.name} />
                <div className="stack gap-6">
                  <strong style={{ fontSize: 14 }}>{l.name}</strong>
                  <span className="badge badge-ghost" style={{ alignSelf: 'flex-start' }}>
                    {l.weightLabel} · {inr(l.price)}
                  </span>
                  <div className="qty">
                    <button onClick={() => setQty(l.productId, l.weight, l.qty - 1)}>−</button>
                    <span>{l.qty}</span>
                    <button
                      onClick={() => setQty(l.productId, l.weight, l.qty + 1)}
                      disabled={l.qty >= (l.stock ?? 99)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="stack gap-8" style={{ alignItems: 'flex-end' }}>
                  <strong>{inr(l.price * l.qty)}</strong>
                  <button
                    className="icon-btn"
                    title="Remove"
                    onClick={() => removeFromCart(l.productId, l.weight)}
                  >
                    <Icon.Trash width={16} height={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="sum-row"><span className="muted">Subtotal</span><b>{inr(cartSubtotal)}</b></div>
            <div className="sum-row">
              <span className="muted">Shipping</span>
              <b>{shipping === 0 ? 'FREE' : inr(shipping)}</b>
            </div>
            {shipping > 0 && (
              <div className="alert alert-info tiny">
                Add {inr(FREE_ABOVE - cartSubtotal)} more for free delivery across India.
              </div>
            )}
            <div className="sum-row total"><span>Total</span><span>{inr(cartSubtotal + shipping)}</span></div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => go(user ? '/checkout' : '/login?next=/checkout')}
            >
              {user ? 'Proceed to checkout' : 'Sign in to checkout'}
            </button>
            <button className="btn btn-quiet btn-block" onClick={() => setCartOpen(false)}>
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

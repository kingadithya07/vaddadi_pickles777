import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Icon } from './Icons';

function Navbar() {
  const { user, logout, cartCount, setCartOpen } = useApp();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <img src="/logo.svg" alt="" />
          <span>
            Vaddadi Pickles
            <small>Since 1978 · Rajahmundry</small>
          </span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end className="nav-link" onClick={close}>Home</NavLink>
          <NavLink to="/shop" className="nav-link" onClick={close}>Shop</NavLink>
          <NavLink to="/about" className="nav-link" onClick={close}>Our Story</NavLink>
          {user?.role === 'customer' && (
            <NavLink to="/account" className="nav-link" onClick={close}>My Account</NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link" onClick={close}>Admin</NavLink>
          )}
        </nav>

        <div className="spacer" />

        <div className="row gap-8">
          <button className="btn btn-ghost btn-sm cart-btn" onClick={() => setCartOpen(true)}>
            <Icon.Cart width={17} height={17} />
            <span className="hide-sm">Cart</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>

          {user ? (
            <div className="row gap-6">
              <Link
                to={user.role === 'admin' ? '/admin' : '/account'}
                className="btn btn-primary btn-sm"
              >
                <Icon.User width={16} height={16} />
                {user.name.split(' ')[0]}
              </Link>
              <button
                className="icon-btn"
                title="Sign out"
                onClick={() => {
                  logout();
                  nav('/');
                }}
              >
                <Icon.Logout width={17} height={17} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <Icon.User width={16} height={16} /> Sign in
            </Link>
          )}

          <button className="icon-btn nav-toggle" onClick={() => setOpen((o) => !o)}>
            <Icon.Menu />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>Vaddadi Pickles</h4>
            <p className="small" style={{ lineHeight: 1.75 }}>
              Three generations of Godavari pickling. Sun-cured, stone-ground and hand-packed in
              small batches — never a preservative, never a shortcut.
            </p>
            <div className="row gap-8" style={{ marginTop: 14 }}>
              <span className="badge badge-gold">FSSAI 10020043001234</span>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <div className="stack gap-8 small">
              <Link to="/shop">All pickles</Link>
              <Link to="/shop?category=Veg">Veg pickles</Link>
              <Link to="/shop?category=Non-Veg">Non-veg pickles</Link>
              <Link to="/shop">Bestsellers</Link>
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <div className="stack gap-8 small">
              <Link to="/about">Our story</Link>
              <Link to="/account">Track order</Link>
              <Link to="/login">Customer login</Link>
              <Link to="/login?role=admin">Admin login</Link>
            </div>
          </div>
          <div>
            <h4>Reach us</h4>
            <div className="stack gap-8 small">
              <span>12-4-19, Danavaipeta, Rajahmundry</span>
              <span>Andhra Pradesh 533101</span>
              <span>+91 90000 12345</span>
              <span>hello@vaddadipickles.in</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Vaddadi Pickles. All rights reserved.</span>
          <span>Delivery PIN codes verified via India Post (api.postalpincode.in)</span>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const { toasts } = useApp();
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>{t.message}</div>
        ))}
      </div>
    </>
  );
}

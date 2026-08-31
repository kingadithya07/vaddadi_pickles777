import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, inr } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { Icon } from './../components/Icons';

const promises = [
  { icon: Icon.Leaf, title: 'No preservatives', text: 'Only salt, oil and sun — the way ammamma made it.' },
  { icon: Icon.Box, title: '250 g · 500 g · 1 kg', text: 'Every pickle in three jar sizes, priced per weight.' },
  { icon: Icon.Truck, title: 'All-India delivery', text: 'PIN codes verified live against India Post records.' },
  { icon: Icon.Shield, title: 'FSSAI certified', text: 'Batch-coded, lab-tested and leak-proof packed.' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .products()
      .then((d) => setProducts(d.products))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.bestseller).slice(0, 4);
  const cheapest = products.length
    ? Math.min(...products.flatMap((p) => p.variants.map((v) => v.price)))
    : 0;

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">◆ Godavari kitchens since 1978</span>
            <h1>
              Pickles that taste like <em>your grandmother's</em> jaadi.
            </h1>
            <p className="lede">
              Small-batch Andhra pickles cured in cold-pressed sesame oil and stone-ground Guntur
              chilli. Choose your jar — 250 g, 500 g or a full kilo — and we ship it anywhere in
              India, fresh from Rajahmundry.
            </p>
            <div className="row gap-12" style={{ marginTop: 30, flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-accent">Shop all pickles</Link>
              <Link to="/about" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>
                Our story
              </Link>
            </div>
            <div className="hero-stats">
              <div><b>3</b><span>generations of pickling</span></div>
              <div><b>{products.length || 8}</b><span>signature varieties</span></div>
              <div><b>{cheapest ? inr(cheapest) : '₹159'}</b><span>starting price, 250 g</span></div>
              <div><b>4.8★</b><span>from 2,100+ jars sold</span></div>
            </div>
          </div>
          <div className="hero-art">
            <img src="/products/avakaya.jpg" alt="Avakaya mango pickle in a glass jar" />
            <div className="hero-chip a"><b>21 days</b>sun-cured in ceramic jaadi</div>
            <div className="hero-chip b"><b>Free shipping</b>on orders above ₹999</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            {promises.map((p) => (
              <div className="card card-pad stack gap-8" key={p.title}>
                <span style={{ color: 'var(--maroon)' }}><p.icon width={24} height={24} /></span>
                <strong>{p.title}</strong>
                <span className="small muted">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Bestselling jars</h2>
              <p>
                Pick a weight on the card — the price updates instantly and goes straight to your
                basket at that size.
              </p>
            </div>
            <Link to="/shop" className="btn btn-ghost">View all {products.length} pickles →</Link>
          </div>

          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 470 }} />
                ))
              : featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--cream-2)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2>How a Vaddadi jar is made</h2>
              <p>Four steps, no machines, no shortcuts.</p>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            {[
              ['01', 'Sourced at dawn', 'Raw mangoes from Nuzvid, gongura from Rayalaseema and prawns from the Godavari delta reach the kitchen the same morning.'],
              ['02', 'Stone-ground masala', 'Guntur chillies, mustard and fenugreek are dry-roasted and ground on stone so the oils stay in the spice, not on the machine.'],
              ['03', 'Cured, not cooked', 'Cut fruit rests in rock salt and turmeric under the sun, then sits in cold-pressed sesame oil for up to 21 days.'],
              ['04', 'Hand-packed to weight', 'Each jar is filled and weighed by hand into 250 g, 500 g and 1 kg sizes, batch-coded and sealed the same day.'],
            ].map(([n, t, d]) => (
              <div className="card card-pad row gap-16" key={n} style={{ alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 800, color: 'var(--turmeric)' }}>{n}</span>
                <div className="stack gap-6">
                  <strong style={{ fontSize: 16 }}>{t}</strong>
                  <span className="small muted" style={{ lineHeight: 1.65 }}>{d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            className="card card-pad"
            style={{
              background: 'linear-gradient(120deg, #7a1f12, #a5301a)',
              color: '#fff',
              padding: '44px',
              textAlign: 'center',
              border: 0,
            }}
          >
            <h2 style={{ fontSize: 32 }}>Use code VADDADI10</h2>
            <p style={{ marginTop: 10, color: '#f3ddd0' }}>
              10% off orders above ₹500. Free shipping on every order above ₹999.
            </p>
            <Link to="/shop" className="btn btn-accent" style={{ marginTop: 22 }}>Start your basket</Link>
          </div>
        </div>
      </section>
    </>
  );
}

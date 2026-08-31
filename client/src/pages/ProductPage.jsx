import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, inr } from '../lib/api';
import { useApp } from '../store/AppContext';
import { Icon } from '../components/Icons';
import ProductCard from '../components/ProductCard';

export default function ProductPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { addToCart, setCartOpen } = useApp();
  const [product, setProduct] = useState(null);
  const [others, setOthers] = useState([]);
  const [weight, setWeight] = useState(250);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState('');

  useEffect(() => {
    setErr('');
    api
      .product(slug)
      .then((d) => {
        setProduct(d.product);
        const firstAvailable = d.product.variants.find((v) => v.stock > 0) || d.product.variants[0];
        setWeight(firstAvailable.weight);
        setQty(1);
      })
      .catch((e) => setErr(e.message));
    api.products().then((d) => setOthers(d.products));
  }, [slug]);

  if (err) return <div className="page container empty"><h3>{err}</h3><Link className="btn btn-primary" to="/shop">Back to shop</Link></div>;
  if (!product) return <div className="page container"><div className="skeleton" style={{ height: 460 }} /></div>;

  const variant = product.variants.find((v) => Number(v.weight) === Number(weight));
  const related = others.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div className="page">
      <div className="container">
        <p className="small muted" style={{ marginBottom: 20 }}>
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
        </p>

        <div className="pdp">
          <div className="pdp-img">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="stack gap-16">
            <div className="row gap-8">
              <span className={`badge ${product.category === 'Veg' ? 'badge-veg' : 'badge-nonveg'}`}>{product.category}</span>
              <span className="badge badge-ghost">{product.spice}</span>
              {product.bestseller && <span className="badge badge-hot">Bestseller</span>}
            </div>

            <div>
              <h1 style={{ fontSize: 38, fontWeight: 800 }}>{product.name}</h1>
              <p className="muted" style={{ marginTop: 8, fontSize: 16 }}>{product.tagline}</p>
            </div>

            <div className="row gap-8 small">
              <Icon.Star width={15} height={15} style={{ color: '#f0a621' }} />
              <b>{product.rating}</b>
              <span className="muted">· {product.reviews} verified reviews</span>
            </div>

            <p style={{ lineHeight: 1.72, color: 'var(--ink-soft)' }}>{product.description}</p>

            <div className="card card-pad stack gap-14">
              <span className="tiny" style={{ fontWeight: 800, letterSpacing: '.06em', color: 'var(--ink-soft)' }}>
                CHOOSE YOUR JAR SIZE
              </span>
              <div className="weights">
                {product.variants.map((v) => (
                  <button
                    key={v.weight}
                    className={`weight-opt lg ${Number(weight) === Number(v.weight) ? 'active' : ''} ${v.stock === 0 ? 'out' : ''}`}
                    disabled={v.stock === 0}
                    onClick={() => { setWeight(v.weight); setQty(1); }}
                  >
                    <span className="w">{v.label}</span>
                    <span className="p">{inr(v.price)}</span>
                    <span className="w" style={{ fontWeight: 500, marginTop: 3 }}>
                      {v.stock === 0 ? 'Out of stock' : `${v.stock} in stock`}
                    </span>
                  </button>
                ))}
              </div>

              <div className="row gap-12" style={{ flexWrap: 'wrap' }}>
                <div className="price-row">
                  <span className="price price-lg">{inr(variant.price * qty)}</span>
                  <span className="strike">{inr(variant.mrp * qty)}</span>
                  <span className="save">{Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% off</span>
                </div>
                <div className="spacer" />
                <div className="qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(variant.stock || 99, q + 1))}>+</button>
                </div>
              </div>

              <div className="row gap-10" style={{ gap: 10, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: 190 }}
                  disabled={variant.stock === 0}
                  onClick={() => addToCart(product, weight, qty)}
                >
                  <Icon.Cart width={16} height={16} /> Add {variant.label} to basket
                </button>
                <button
                  className="btn btn-accent"
                  style={{ flex: 1, minWidth: 150 }}
                  disabled={variant.stock === 0}
                  onClick={() => { addToCart(product, weight, qty); setCartOpen(false); nav('/checkout'); }}
                >
                  Buy now
                </button>
              </div>

              <span className="tiny muted row gap-6">
                <Icon.Truck width={14} height={14} /> Free delivery above ₹999 · dispatched in 24 hrs
              </span>
            </div>

            <dl className="spec card card-pad">
              <dt>Ingredients</dt><dd>{product.ingredients}</dd>
              <dt>Spice level</dt><dd>{product.spice}</dd>
              <dt>Shelf life</dt><dd>{product.shelfLife} from packing</dd>
              <dt>Available in</dt><dd>{product.variants.map((v) => `${v.label} (${inr(v.price)})`).join(' · ')}</dd>
              <dt>Storage</dt><dd>Use a dry spoon. Keep oil above the pickle. No refrigeration needed.</dd>
            </dl>
          </div>
        </div>

        {related.length > 0 && (
          <section className="section" style={{ paddingBottom: 0 }}>
            <div className="section-head"><div><h2>Goes well with</h2></div></div>
            <div className="product-grid">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

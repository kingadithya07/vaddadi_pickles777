import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { inr } from '../lib/api';
import { Icon } from './Icons';

export default function ProductCard({ product }) {
  const { addToCart } = useApp();
  const first = product.variants.find((v) => v.stock > 0) || product.variants[0];
  const [weight, setWeight] = useState(first?.weight ?? 250);
  const variant = product.variants.find((v) => Number(v.weight) === Number(weight)) || first;
  const save = variant ? variant.mrp - variant.price : 0;

  return (
    <article className="pcard">
      <Link to={`/product/${product.slug}`} className="pcard-img">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="pcard-flags">
          {product.bestseller && <span className="badge badge-hot">Bestseller</span>}
          <span className={`badge ${product.category === 'Veg' ? 'badge-veg' : 'badge-nonveg'}`}>
            {product.category}
          </span>
        </div>
      </Link>

      <div className="pcard-body">
        <div className="row gap-8">
          <span className="badge badge-ghost">{product.spice}</span>
          <div className="spacer" />
          <span className="row gap-4 tiny muted">
            <Icon.Star width={13} height={13} style={{ color: '#f0a621' }} />
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div>
          <h3><Link to={`/product/${product.slug}`}>{product.name}</Link></h3>
          <p className="tagline" style={{ marginTop: 5 }}>{product.tagline}</p>
        </div>

        <div className="stack gap-8">
          <span className="tiny muted" style={{ fontWeight: 700, letterSpacing: '.05em' }}>
            SELECT WEIGHT
          </span>
          <div className="weights">
            {product.variants.map((v) => (
              <button
                key={v.weight}
                type="button"
                disabled={v.stock === 0}
                className={`weight-opt ${Number(weight) === Number(v.weight) ? 'active' : ''} ${v.stock === 0 ? 'out' : ''}`}
                onClick={() => setWeight(v.weight)}
              >
                <span className="w">{v.label}</span>
                <span className="p">{inr(v.price)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="spacer" />

        <div className="row gap-8">
          <div className="stack">
            <div className="price-row">
              <span className="price">{inr(variant?.price)}</span>
              <span className="strike small">{inr(variant?.mrp)}</span>
            </div>
            {save > 0 && <span className="save">Save {inr(save)} on {variant.label}</span>}
          </div>
          <div className="spacer" />
        </div>

        <button
          className="btn btn-primary btn-block"
          disabled={!variant || variant.stock === 0}
          onClick={() => addToCart(product, weight)}
        >
          <Icon.Cart width={16} height={16} />
          {variant?.stock === 0 ? 'Out of stock' : `Add ${variant.label} · ${inr(variant.price)}`}
        </button>
      </div>
    </article>
  );
}

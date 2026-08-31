import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { Icon } from '../components/Icons';

const CATEGORIES = ['All', 'Veg', 'Non-Veg'];
const SORTS = [
  ['popular', 'Most popular'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['name', 'Name A–Z'],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') || '');
  const [sort, setSort] = useState('popular');
  const category = params.get('category') || 'All';

  useEffect(() => {
    setLoading(true);
    api
      .products()
      .then((d) => setProducts(d.products))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    let list = products;
    if (category !== 'All') list = list.filter((p) => p.category === category);
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(n) || p.description.toLowerCase().includes(n)
      );
    }
    const price = (p) => Math.min(...p.variants.map((v) => v.price));
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => price(a) - price(b));
    if (sort === 'price-desc') sorted.sort((a, b) => price(b) - price(a));
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'popular') sorted.sort((a, b) => b.reviews - a.reviews);
    return sorted;
  }, [products, category, q, sort]);

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === 'All') next.delete('category');
    else next.set('category', c);
    setParams(next, { replace: true });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <h1>The pickle shelf</h1>
          <p>
            Every jar comes in three weights — 250 g, 500 g and 1 kg — each with its own price. Pick
            the size on the card before adding to your basket.
          </p>
        </div>

        <div className="filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'All' ? 'All pickles' : `${c} pickles`}
            </button>
          ))}
          <div className="spacer" />
          <div className="row gap-8" style={{ position: 'relative' }}>
            <Icon.Search width={16} height={16} style={{ position: 'absolute', left: 12, color: 'var(--ink-soft)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36, minWidth: 230 }}
              placeholder="Search avakaya, gongura…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select className="select" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 470 }} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="empty card card-pad">
            <h3>No pickles matched that</h3>
            <p className="small">Try “mango”, “gongura” or clear the search.</p>
          </div>
        ) : (
          <>
            <p className="small muted" style={{ marginBottom: 16 }}>
              Showing {shown.length} of {products.length} pickles
            </p>
            <div className="product-grid">
              {shown.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

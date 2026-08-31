import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 880 }}>
        <div className="page-head">
          <span className="eyebrow" style={{ color: 'var(--maroon)' }}>◆ Our story</span>
          <h1 style={{ marginTop: 10 }}>Three generations, one ceramic jaadi.</h1>
        </div>

        <img
          src="/products/gongura.jpg"
          alt="Gongura pickle"
          style={{ width: '100%', borderRadius: 20, aspectRatio: '16/8', objectFit: 'cover', marginBottom: 26 }}
        />

        <div className="stack gap-16" style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink-soft)' }}>
          <p>
            In 1978, Vaddadi Satyavathi began selling avakaya out of her kitchen on Danavaipeta
            street in Rajahmundry. She had two rules: only mangoes cut the same morning, and never
            a spoonful of preservative. Nearly fifty years later those are still the only two rules
            we have.
          </p>
          <p>
            Today her grandchildren run the same kitchen. The chillies still come from Guntur, the
            gongura from Rayalaseema farms, the prawns from the Godavari delta. Masalas are still
            ground on stone because a mixer heats the spice and steals its oil. Every jar is filled
            by hand, weighed on the same scale, and batch-coded so we can trace it back to the day
            it was made.
          </p>
          <p>
            We pack in three sizes — 250 g for the curious, 500 g for the household, and a full
            kilo for families who know exactly how fast a good avakaya disappears.
          </p>
        </div>

        <div className="grid-3" style={{ marginTop: 34 }}>
          {[
            ['1978', 'The first jaadi', 'Satyavathi garu sells her first 40 jars of avakaya.'],
            ['2004', 'FSSAI certified', 'The kitchen moves to a licensed facility, still hand-run.'],
            ['2024', 'All-India shipping', 'PIN-verified delivery to every serviceable pincode.'],
          ].map(([y, t, d]) => (
            <div className="card card-pad stack gap-6" key={y}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 800, color: 'var(--turmeric)' }}>{y}</span>
              <strong>{t}</strong>
              <span className="small muted">{d}</span>
            </div>
          ))}
        </div>

        <div className="center" style={{ marginTop: 40 }}>
          <Link to="/shop" className="btn btn-primary">Taste the difference →</Link>
        </div>
      </div>
    </div>
  );
}

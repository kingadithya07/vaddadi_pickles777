import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { Icon } from './Icons';

const blank = {
  label: 'Home',
  name: '',
  phone: '',
  line1: '',
  line2: '',
  landmark: '',
  pincode: '',
  city: '',
  locality: '',
  district: '',
  division: '',
  circle: '',
  state: '',
  isDefault: false,
};

/**
 * Address editor wired to India Post data (api.postalpincode.in, the API behind
 * postalpincode.in).
 *
 * Typing a 6-digit PIN fetches EVERY post office / locality that shares that PIN and
 * offers them as a dropdown, so the customer picks their exact area instead of typing
 * it — district and state are filled automatically and locked to the official record.
 *
 * There is also a reverse lookup: type an area name (e.g. "Danavaipeta") and we find
 * the matching PIN codes for them.
 */
export default function AddressForm({ initial, onSave, onCancel, saving }) {
  // Older saved addresses only carry `city`; treat it as the locality when editing.
  const [form, setForm] = useState(() => {
    const base = { ...blank, ...(initial || {}) };
    if (!base.locality) base.locality = base.city || '';
    return base;
  });
  const [pin, setPin] = useState({ status: 'idle', message: '', data: null });
  const [error, setError] = useState('');

  // reverse (area name -> pincode) lookup
  const [areaQuery, setAreaQuery] = useState('');
  const [areaState, setAreaState] = useState({ status: 'idle', results: [] });
  const [showAreaSearch, setShowAreaSearch] = useState(false);

  const pinReq = useRef(0);
  const areaReq = useRef(0);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
  };

  const pincode = form.pincode;

  /* ------------------------------- PIN -> localities ------------------------------ */
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) {
      setPin({
        status: pincode.length ? 'typing' : 'idle',
        message: pincode.length ? `${6 - pincode.length} more digit(s)` : '',
        data: null,
      });
      return;
    }

    const id = ++pinReq.current;
    setPin({ status: 'loading', message: 'Looking up India Post records…', data: null });

    const t = setTimeout(() => {
      api
        .pincode(pincode)
        .then((d) => {
          if (id !== pinReq.current) return;
          setPin({ status: 'ok', message: '', data: d });
          setForm((f) => {
            // keep the locality if it still belongs to this PIN, else default to the
            // delivery/head post office (first in the sorted list).
            const stillValid = d.localities.includes(f.locality);
            const locality = stillValid ? f.locality : d.localities[0] || '';
            // District and sub division are per post office, so read them off the
            // selected locality rather than the PIN's primary office.
            const office = d.offices.find((o) => o.name === locality);
            return {
              ...f,
              locality,
              city: d.city || f.city,
              district: office?.district || d.district || f.district,
              division: office?.division || d.division || '',
              circle: office?.circle || d.circle || '',
              state: office?.state || d.state || f.state,
            };
          });
        })
        .catch((e) => {
          if (id !== pinReq.current) return;
          setPin({ status: 'err', message: e.message, data: null });
        });
    }, 350);

    return () => clearTimeout(t);
  }, [pincode]);

  /* ------------------------------ area name -> PIN ------------------------------- */
  useEffect(() => {
    if (areaQuery.trim().length < 3) {
      setAreaState({ status: 'idle', results: [] });
      return;
    }
    const id = ++areaReq.current;
    setAreaState({ status: 'loading', results: [] });
    const t = setTimeout(() => {
      api
        .postOffice(areaQuery.trim())
        .then((d) => {
          if (id !== areaReq.current) return;
          setAreaState({ status: 'ok', results: d.results });
        })
        .catch((e) => {
          if (id !== areaReq.current) return;
          setAreaState({ status: 'err', results: [], message: e.message });
        });
    }, 400);
    return () => clearTimeout(t);
  }, [areaQuery]);

  // Selecting a locality re-syncs district / sub division / state, since offices
  // under one PIN can sit in different divisions (and occasionally districts).
  const selectLocality = (name) => {
    setForm((f) => {
      const office = pin.data?.offices.find((o) => o.name === name);
      if (!office) return { ...f, locality: name };
      return {
        ...f,
        locality: name,
        district: office.district || f.district,
        division: office.division || f.division,
        circle: office.circle || f.circle,
        state: office.state || f.state,
      };
    });
  };

  const pickArea = (o) => {
    setForm((f) => ({
      ...f,
      pincode: o.pincode,
      locality: o.name,
      district: o.district,
      division: o.division,
      circle: o.circle,
      state: o.state,
      city: o.block || o.district,
    }));
    setShowAreaSearch(false);
    setAreaQuery('');
    setAreaState({ status: 'idle', results: [] });
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const required = ['name', 'phone', 'line1', 'pincode', 'locality', 'state'];
    const missing = required.filter((f) => !String(form[f] || '').trim());
    if (missing.length) return setError(`Please fill: ${missing.join(', ')}`);
    if (!/^\d{6}$/.test(form.pincode)) return setError('PIN code must be exactly 6 digits');
    if (!/^\d{10}$/.test(String(form.phone).replace(/\D/g, '').slice(-10)))
      return setError('Enter a valid 10-digit mobile number');
    // `city` is what the rest of the app displays — keep it in sync with the locality.
    onSave({ ...form, city: form.locality || form.city });
  };

  const data = pin.data;

  return (
    <form className="stack gap-14" onSubmit={submit}>
      {error && <div className="alert alert-err">{error}</div>}

      <div className="grid-2">
        <div className="field">
          <label>Address label</label>
          <select className="select" value={form.label} onChange={set('label')}>
            <option>Home</option><option>Work</option><option>Parents</option><option>Other</option>
          </select>
        </div>
        <div className="field">
          <label>Full name *</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Sita Rama Raju" />
        </div>
      </div>

      <div className="field">
        <label>Mobile number *</label>
        <input
          className="input"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
          placeholder="9000012345"
          inputMode="numeric"
        />
      </div>

      <div className="field">
        <label>Flat / House no., Building, Street *</label>
        <input className="input" value={form.line1} onChange={set('line1')} placeholder="12-4-19, Danavaipeta" />
      </div>

      <div className="field">
        <label>Area, Colony (optional)</label>
        <input className="input" value={form.line2} onChange={set('line2')} placeholder="Near Gowtami Ghat" />
      </div>

      {/* ------------------------------ PIN + locality ------------------------------ */}
      <div className="pin-block">
        <div className="row gap-8" style={{ marginBottom: 10 }}>
          <Icon.Pin width={15} height={15} style={{ color: 'var(--maroon)' }} />
          <strong className="small">Delivery location</strong>
          <span className="badge badge-ghost">India Post verified</span>
          <div className="spacer" />
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => setShowAreaSearch((s) => !s)}
          >
            {showAreaSearch ? 'Close' : "Don't know your PIN?"}
          </button>
        </div>

        {showAreaSearch && (
          <div className="area-search">
            <div className="field">
              <label>Search your area / post office</label>
              <input
                className="input"
                value={areaQuery}
                onChange={(e) => setAreaQuery(e.target.value)}
                placeholder="e.g. Danavaipeta, Gachibowli, Sowcarpet"
                autoFocus
              />
            </div>
            {areaState.status === 'loading' && <p className="pin-hint load">Searching India Post…</p>}
            {areaState.status === 'err' && <p className="pin-hint err">{areaState.message}</p>}
            {areaState.status === 'ok' && (
              <div className="area-results">
                {areaState.results.map((o, i) => (
                  <button type="button" key={`${o.pincode}-${o.name}-${i}`} className="area-hit" onClick={() => pickArea(o)}>
                    <span className="stack gap-2" style={{ alignItems: 'flex-start' }}>
                      <b className="small">{o.name}</b>
                      <span className="tiny muted">{o.district}, {o.state}</span>
                    </span>
                    <span className="badge badge-gold">{o.pincode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid-2">
          <div className="field">
            <label>PIN code *</label>
            <input
              className="input"
              value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              placeholder="533101"
              inputMode="numeric"
            />
            {pin.status === 'loading' && <span className="pin-hint load">Looking up India Post records…</span>}
            {pin.status === 'typing' && <span className="pin-hint load">{pin.message}</span>}
            {pin.status === 'err' && <span className="pin-hint err">{pin.message}</span>}
            {pin.status === 'ok' && data && (
              <span className="pin-hint ok">
                <Icon.Check width={13} height={13} />
                {data.count} {data.count === 1 ? 'area' : 'areas'} found
                {data.source === 'offline-snapshot' ? ' (offline copy)' : ''}
              </span>
            )}
          </div>

          <div className="field">
            <label>City / Locality *</label>
            {data?.offices?.length ? (
              <select
                className="select"
                value={form.locality}
                onChange={(e) => selectLocality(e.target.value)}
              >
                {data.offices.map((o) => (
                  <option key={o.name} value={o.name}>
                    {o.name}
                    {/^delivery$/i.test(o.delivery) ? ' ✓ delivery' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                value={form.locality}
                onChange={set('locality')}
                placeholder="Enter a PIN code first"
              />
            )}
            {data?.offices?.length > 1 && (
              <span className="tiny muted">{data.count} localities share PIN {data.pincode} — pick yours.</span>
            )}
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="field">
            <label>District {data && <span className="tiny muted">(auto)</span>}</label>
            <input className="input" value={form.district} onChange={set('district')} placeholder="East Godavari" readOnly={!!data} />
          </div>
          <div className="field">
            <label>Sub postal division {data && <span className="tiny muted">(auto)</span>}</label>
            <input className="input" value={form.division} onChange={set('division')} placeholder="Rajahmundry" readOnly={!!data} />
          </div>
          <div className="field">
            <label>State * {data && <span className="tiny muted">(auto)</span>}</label>
            <input className="input" value={form.state} onChange={set('state')} placeholder="Andhra Pradesh" readOnly={!!data} />
          </div>
        </div>

        {data && !data.deliverable && (
          <div className="alert alert-err tiny" style={{ marginTop: 12 }}>
            India Post lists no delivery office for this PIN — please double-check it.
          </div>
        )}
        {form.circle && (
          <p className="tiny muted" style={{ marginTop: 10 }}>
            Postal circle: {form.circle}
          </p>
        )}
      </div>

      <div className="field">
        <label>Landmark (optional)</label>
        <input className="input" value={form.landmark} onChange={set('landmark')} placeholder="Opposite ISKCON temple" />
      </div>

      <label className="row gap-8 small" style={{ cursor: 'pointer' }}>
        <input type="checkbox" checked={!!form.isDefault} onChange={set('isDefault')} />
        Make this my default delivery address
      </label>

      <div className="row gap-8">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : initial?.id ? 'Update address' : 'Save address'}
        </button>
        {onCancel && (
          <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}

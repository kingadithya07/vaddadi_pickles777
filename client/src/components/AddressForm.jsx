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
  district: '',
  state: '',
  isDefault: false,
};

/**
 * Address editor with live Indian PIN code lookup.
 * As soon as 6 digits are typed we hit /api/pincode/:pin which proxies
 * India Post's api.postalpincode.in and auto-fills district/state and
 * offers the list of post offices as the "city / locality" choice.
 */
export default function AddressForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...blank, ...(initial || {}) });
  const [pinState, setPinState] = useState({ status: 'idle', message: '', offices: [], source: '' });
  const [error, setError] = useState('');
  const reqId = useRef(0);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
  };

  const pin = form.pincode;

  useEffect(() => {
    if (!/^\d{6}$/.test(pin)) {
      setPinState({
        status: pin.length ? 'typing' : 'idle',
        message: pin.length ? `${6 - pin.length} more digit(s)` : '',
        offices: [],
        source: '',
      });
      return;
    }
    const id = ++reqId.current;
    setPinState({ status: 'loading', message: 'Checking with India Post…', offices: [], source: '' });
    const t = setTimeout(() => {
      api
        .pincode(pin)
        .then((d) => {
          if (id !== reqId.current) return;
          setPinState({
            status: 'ok',
            message: `${d.district}, ${d.state}`,
            offices: d.offices || [],
            source: d.source,
          });
          setForm((f) => ({
            ...f,
            district: d.district || f.district,
            state: d.state || f.state,
            city: f.city || d.offices?.[0]?.name || d.city || '',
          }));
        })
        .catch((e) => {
          if (id !== reqId.current) return;
          setPinState({ status: 'err', message: e.message, offices: [], source: '' });
        });
    }, 350);
    return () => clearTimeout(t);
  }, [pin]);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const missing = ['name', 'phone', 'line1', 'pincode', 'city', 'state'].filter((f) => !form[f]);
    if (missing.length) return setError(`Please fill: ${missing.join(', ')}`);
    if (!/^\d{6}$/.test(form.pincode)) return setError('PIN code must be exactly 6 digits');
    if (!/^\d{10}$/.test(String(form.phone).replace(/\D/g, '').slice(-10)))
      return setError('Enter a valid 10-digit mobile number');
    onSave(form);
  };

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
        <input className="input" value={form.phone} onChange={set('phone')} placeholder="9000012345" inputMode="numeric" maxLength={10} />
      </div>

      <div className="field">
        <label>Flat / House no., Building, Street *</label>
        <input className="input" value={form.line1} onChange={set('line1')} placeholder="12-4-19, Danavaipeta" />
      </div>

      <div className="field">
        <label>Area, Colony (optional)</label>
        <input className="input" value={form.line2} onChange={set('line2')} placeholder="Near Gowtami Ghat" />
      </div>

      <div className="grid-2">
        <div className="field">
          <label>PIN code * <span className="muted tiny">(India Post verified)</span></label>
          <input
            className="input"
            value={form.pincode}
            onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
            placeholder="533101"
            inputMode="numeric"
            maxLength={6}
          />
          {pinState.status === 'loading' && <span className="pin-hint load">Checking with India Post…</span>}
          {pinState.status === 'typing' && <span className="pin-hint load">{pinState.message}</span>}
          {pinState.status === 'ok' && (
            <span className="pin-hint ok">
              <Icon.Check width={13} height={13} /> {pinState.message}
              {pinState.source === 'offline-fallback' ? ' (cached)' : ''}
            </span>
          )}
          {pinState.status === 'err' && <span className="pin-hint err">{pinState.message}</span>}
        </div>

        <div className="field">
          <label>City / Locality *</label>
          {pinState.offices.length > 0 ? (
            <select className="select" value={form.city} onChange={set('city')}>
              <option value="">Select post office…</option>
              {pinState.offices.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name} {o.branchType ? `· ${o.branchType}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <input className="input" value={form.city} onChange={set('city')} placeholder="Rajahmundry" />
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>District</label>
          <input className="input" value={form.district} onChange={set('district')} placeholder="East Godavari" />
        </div>
        <div className="field">
          <label>State *</label>
          <input className="input" value={form.state} onChange={set('state')} placeholder="Andhra Pradesh" />
        </div>
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

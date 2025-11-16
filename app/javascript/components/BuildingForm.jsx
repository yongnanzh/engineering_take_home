import React, { useState, useEffect, useRef } from 'react';

export default function BuildingForm({ clientOptions = [], initial = null, onCancel, onSaved }) {
  const [form, setForm] = useState(() => ({
    client_id: initial ? initial.client_id : '',
    name: initial ? initial.name : '',
    address: initial ? initial.address : '',
    city: initial ? initial.city : '',
    state: initial ? initial.state : '',
    postal_code: initial ? initial.postal_code : '',
    year_built: initial ? initial.year_built : '',
    floors: initial ? initial.floors : '',
    custom_field_values: initial ? (initial.custom_field_values || {}) : {}
  }));
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const hideTimerRef = useRef(null);
  const savedTimerRef = useRef(null);

  useEffect(() => {
    if (initial) setForm(prev => ({ ...prev, ...initial }));
  }, [initial]);

  // cleanup timers when unmounting
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  // when client selection changes, ensure custom_field_values has keys for that client's custom fields
  useEffect(() => {
    const client = clientOptions.find(c => String(c.id) === String(form.client_id));
    if (client && Array.isArray(client.custom_fields)) {
      setForm(f => {
        const allowedKeys = client.custom_fields.map(cf => cf.key);
        const existing = { ...(f.custom_field_values || {}) };
        // keep only allowed keys and initialize missing ones
        const values = allowedKeys.reduce((acc, k) => {
          acc[k] = existing.hasOwnProperty(k) ? existing[k] : '';
          return acc;
        }, {});
        return { ...f, custom_field_values: values };
      });
    } else if (!client) {
      // no client selected: keep as-is
    }
  }, [form.client_id, clientOptions]);

  function updateField(path, value) {
    if (path.startsWith('custom.')) {
      const key = path.slice(7);
      setForm(f => ({ ...f, custom_field_values: { ...(f.custom_field_values || {}), [key]: value } }));
    } else {
      setForm(f => ({ ...f, [path]: value }));
    }
  }

  async function submit(e) {
    e.preventDefault();
    // client-side validation
    const localErrors = [];

    // Required fields check (prevent submitting empty required fields on create/update)
    const requiredFields = ['name', 'address', 'city', 'state', 'postal_code', 'year_built', 'floors'];
    requiredFields.forEach(f => {
      const v = form[f];
      if (v === null || v === undefined || String(v).trim() === '') {
        localErrors.push(`${f} is required`);
      }
    });
    if (form.year_built !== '' && form.year_built !== null && form.year_built !== undefined) {
      const y = Number(form.year_built);
      if (!Number.isInteger(y)) localErrors.push('year_built must be an integer');
    }
    if (form.floors !== '' && form.floors !== null && form.floors !== undefined) {
      const f = Number(form.floors);
      if (!Number.isInteger(f)) localErrors.push('floors must be an integer');
    }

    // postal_code validation: accept 5-digit or 5+4 (e.g. 12345 or 12345-6789)
    if (form.postal_code && String(form.postal_code).trim() !== '') {
      const pc = String(form.postal_code).trim();
      const postalRegex = /^\d{5}(-\d{4})?$/;
      if (!postalRegex.test(pc)) {
        localErrors.push('postal_code must be 5 digits or 5+4 format (e.g. 12345 or 12345-6789)');
      }
    }

    // city/state string checks: letters, spaces, periods, hyphens, apostrophes allowed
    const nameRegex = /^[A-Za-z .'-]+$/;
    if (form.city && String(form.city).trim() !== '') {
      const c = String(form.city).trim();
      if (!nameRegex.test(c)) localErrors.push('city must contain only letters, spaces, . - or \'' );
    }

    if (form.state && String(form.state).trim() !== '') {
      const s = String(form.state).trim();
      if (!nameRegex.test(s)) localErrors.push('state must contain only letters, spaces, . - or \'');
    }

    if (localErrors.length > 0) {
      setErrors(localErrors);
      return;
    }

    // clear previous errors
    setErrors([]);

    const payload = { building: form };
    try {
      const method = initial ? 'PATCH' : 'POST';
      const url = initial ? `/api/v1/buildings/${initial.id}` : '/api/v1/buildings';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        const msg = json.message || (initial ? 'Building updated' : 'Building created');
        setSuccessMessage(msg);
        // clear success message after a short delay
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setSuccessMessage(null), 3000);

        // if this was a create (no initial), reset the form and notify parent immediately
        if (!initial) {
          setForm({ client_id: '', name: '', address: '', city: '', state: '', postal_code: '', year_built: '', floors: '', custom_field_values: {} });
          onSaved && onSaved(json);
        } else {
          // For updates, delay notifying parent briefly so the success message is visible
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => { onSaved && onSaved(json); }, 800);
        }
      } else {
        alert('Error: ' + (json.errors || JSON.stringify(json)));
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  }

  return (
    <form onSubmit={submit} style={{ border: '1px solid #eee', padding: 20, marginBottom: 16, borderRadius: 8, background: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Client</label>
          <select style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} value={form.client_id} onChange={e => updateField('client_id', e.target.value)}>
            <option value="">Select client</option>
            {clientOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Name</label>
          <input style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} placeholder="Name" value={form.name} onChange={e => updateField('name', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Address</label>
          <input style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} placeholder="Address" value={form.address} onChange={e => updateField('address', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>City</label>
            <input style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} placeholder="City" value={form.city} onChange={e => updateField('city', e.target.value)} />
          </div>
          <div style={{ width: 120 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>State</label>
            <input style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} placeholder="State" value={form.state} onChange={e => updateField('state', e.target.value)} />
          </div>
          <div style={{ width: 140 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Postal Code</label>
            <input style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} placeholder="Postal Code" value={form.postal_code} onChange={e => updateField('postal_code', e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Year Built</label>
          <input type="number" style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} placeholder="Year Built" value={form.year_built} onChange={e => updateField('year_built', e.target.value)} />
        </div>
        <div style={{ width: 160 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Floors</label>
          <input type="number" style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 4 }} placeholder="Floors" value={form.floors} onChange={e => updateField('floors', e.target.value)} />
        </div>
      </div>

      {/* Custom fields rendered from selected client's metadata */}
      <div style={{ marginBottom: 8 }}>
        {errors.length > 0 && (
          <div style={{ color: 'red', marginBottom: 8 }}>
            {errors.map((err, i) => <div key={i}>{err}</div>)}
          </div>
        )}
        {successMessage && (
          <div style={{ color: 'green', marginBottom: 8 }}>
            {successMessage}
          </div>
        )}
        <strong>Custom Fields</strong>
        <div style={{ marginTop: 6 }}>
          {(() => {
            const client = clientOptions.find(c => String(c.id) === String(form.client_id));
            if (!client || !Array.isArray(client.custom_fields) || client.custom_fields.length === 0) {
              // fallback: show any existing keys
              return Object.entries(form.custom_field_values || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input value={k} readOnly style={{ width: 160 }} />
                  <input value={v} onChange={e => updateField('custom.' + k, e.target.value)} />
                </div>
              ));
            }

            return client.custom_fields.map(cf => {
              const val = (form.custom_field_values || {})[cf.key] ?? '';
              const label = cf.label || cf.key;

              if (cf.type === 'number') {
                return (
                  <div key={cf.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: '#333' }}>{label}</div>
                    <input type="number" value={val} onChange={e => updateField('custom.' + cf.key, e.target.value)} />
                  </div>
                );
              }

              if (cf.type === 'boolean') {
                return (
                  <div key={cf.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: '#333' }}>{label}</div>
                    <input type="checkbox" checked={!!val} onChange={e => updateField('custom.' + cf.key, e.target.checked)} />
                  </div>
                );
              }

              if (cf.type === 'enum' && Array.isArray(cf.options)) {
                return (
                  <div key={cf.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: '#333' }}>{label}</div>
                    <select value={val} onChange={e => updateField('custom.' + cf.key, e.target.value)}>
                      <option value="">Select...</option>
                      {cf.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                );
              }

              // default to text input
              return (
                <div key={cf.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: '#333' }}>{label}</div>
                  <input value={val} onChange={e => updateField('custom.' + cf.key, e.target.value)} />
                </div>
              );
            });
          })()}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">{initial ? 'Update' : 'Create'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

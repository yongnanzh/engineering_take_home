import React from 'react';

export default function BuildingCard({ building, onEdit }) {
  return (
    <div style={{ border: '1px solid #e6e6e6', padding: 16, marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{building.client_name}</div>
        <button onClick={() => onEdit(building)} style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 4 }}>Edit</button>
      </div>
      <div style={{ marginTop: 4 }}>
        <div style={{ marginBottom: 8 }}><strong>Address:</strong> <span style={{ marginLeft: 6 }}>{building.address}</span></div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
          {Object.keys(building).filter(k => !['id','client_name','address'].includes(k)).map((k) => (
            <div key={k} style={{ padding: 6, borderRadius: 4, background: '#fafafa' }}><strong style={{ textTransform: 'capitalize' }}>{k}:</strong> <span style={{ marginLeft: 6 }}>{building[k] || ''}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

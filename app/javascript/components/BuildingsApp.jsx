import React, { useEffect, useState } from 'react';
import BuildingCard from './BuildingCard';
import BuildingForm from './BuildingForm';

export default function BuildingsApp() {
  const [buildings, setBuildings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState(null);

  async function fetchBuildings(pageArg = 1, limitArg = 5) {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/buildings?page=${pageArg}&limit=${limitArg}`);
      const json = await res.json();
      if (res.ok) {
        setBuildings(json.buildings || []);
        if (json.meta) {
          setTotalPages(json.meta.total_pages || 1);
          setPage(json.meta.page || pageArg);
          setLimit(json.meta.limit || limitArg);
        }
      } else {
        alert('Error fetching buildings');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch('/api/v1/clients')
      const json = await res.json()
      if (res.ok) {
        setClients(json.clients || [])
      }
    } catch (e) {
      // ignore — client dropdown will be empty
    }
  }

  useEffect(() => { fetchBuildings(page, limit); fetchClients(); }, []);

  function handleEdit(building) {
    // fetch full building details (including nested custom_field_values and client_id)
    (async () => {
      try {
        const res = await fetch(`/api/v1/buildings/${building.id}`);
        const json = await res.json();
        if (res.ok && json.building) {
          setEditing(json.building);
        } else {
          alert('Error fetching building details');
        }
      } catch (err) {
        alert('Network error: ' + err.message);
      }
    })();
  }

  function handlePrev() {
    if (page > 1) fetchBuildings(page - 1, limit);
  }

  function handleNext() {
    if (page < totalPages) fetchBuildings(page + 1, limit);
  }

  function handleSaved() {
    setEditing(null);
    fetchBuildings();
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 12 }}>
      <h2>Buildings</h2>
      <div style={{ marginBottom: 12 }}>
        <BuildingForm clientOptions={clients} initial={null} onSaved={handleSaved} onCancel={() => {}} />
      </div>

      {editing && (
        <div style={{ marginBottom: 12 }}>
          <h3>Editing</h3>
          <BuildingForm clientOptions={clients} initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>Page {page} / {totalPages}</div>
            <div>
              <button onClick={handlePrev} disabled={page <= 1}>Prev</button>
              <button onClick={handleNext} disabled={page >= totalPages} style={{ marginLeft: 8 }}>Next</button>
            </div>
          </div>

          {buildings.map(b => (
            <BuildingCard key={b.id} building={b} onEdit={handleEdit} />
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div>Page {page} / {totalPages}</div>
            <div>
              <button onClick={handlePrev} disabled={page <= 1}>Prev</button>
              <button onClick={handleNext} disabled={page >= totalPages} style={{ marginLeft: 8 }}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

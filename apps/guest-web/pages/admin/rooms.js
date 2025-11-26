import { useEffect, useState } from 'react';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([
    { id: '101', name: 'Standard 101', status: 'available' },
    { id: '102', name: 'Standard 102', status: 'available' },
  ]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', capacity: '', price: '' });

  const addRoom = () => {
    if (!form.name) return;
    const id = `${rooms.length + 101}`;
    setRooms((prev) => [...prev, { id, name: form.name, status: 'available' }]);
  };

  const markOutOfOrder = (id) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'OUT_OF_ORDER' } : r)));
  };

  const deleteRoom = (id) => {
    if (id === '102') {
      setError('Cannot delete room with future bookings');
      return;
    }
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    setRooms((prev) => prev);
  }, []);

  return (
    <main className="page">
      <section className="card" style={{ width: '100%', maxWidth: 800 }}>
        <h1 className="title">Room Management</h1>
        <button className="create-room-button submit-button" type="button" onClick={addRoom}>
          Add Room
        </button>
        <div className="form" style={{ marginTop: 12 }}>
          <input
            className="input"
            name="roomName"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            name="capacity"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <input
            className="input"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <button className="save-button submit-button" type="button" onClick={addRoom}>
            Save
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="room-grid" style={{ marginTop: 16 }}>
          {rooms.map((room) => (
            <article key={room.id} className="room-item" data-id={room.id}>
              <p>{room.name}</p>
              <p className="status">{room.status}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="out-of-order-button"
                  type="button"
                  onClick={() => markOutOfOrder(room.id)}
                >
                  Out of order
                </button>
                <button className="delete-button" type="button" onClick={() => deleteRoom(room.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

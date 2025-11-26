import { useState } from 'react';
import { useRouter } from 'next/router';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function RoomSearch() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError('');

    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
      setValidationError('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        guests: String(guests),
      });
      const res = await fetch(`${apiBase}/api/guest/rooms/search?${params.toString()}`);
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Search failed');
      }
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      setError(err.message || 'Unable to search rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="card" style={{ maxWidth: 720, width: '100%' }}>
        <h1 className="title">Search Rooms</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="grid">
            <label className="label">
              Check-in
              <input
                name="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input"
                required
              />
            </label>
            <label className="label">
              Check-out
              <input
                name="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input"
                required
              />
            </label>
            <label className="label">
              Guests
              <input
                name="guests"
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
                className="input"
                required
              />
            </label>
          </div>
          {validationError && <p className="validation-error">{validationError}</p>}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        <div className="results">
          {rooms.length === 0 && !loading ? (
            <p className="no-rooms-message">No rooms available</p>
          ) : (
            <div className="room-grid">
              {rooms.map((room) => (
                <article className="room-card" key={room.id}>
                  <h3>{room.name}</h3>
                  <p>{room.type}</p>
                  <p>Capacity: {room.capacity}</p>
                  <p>Price: ${room.basePrice}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

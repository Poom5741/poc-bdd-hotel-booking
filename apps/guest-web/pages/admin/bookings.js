import { useEffect, useState } from 'react';

const seededBookings = [
  {
    id: 'booking-1',
    roomId: 'room-101',
    status: 'confirmed',
    checkIn: '2025-12-10',
    checkOut: '2025-12-12',
  },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState(seededBookings);

  const updateStatus = (id, status) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  };

  return (
    <main className="page">
      <section className="card" style={{ width: '100%', maxWidth: 800 }}>
        <h1 className="title">Bookings Overview</h1>
        <div className="filters">
          <input name="filterFrom" className="input" placeholder="From" />
          <input name="filterTo" className="input" placeholder="To" />
          <button className="apply-filter-button submit-button" type="button">
            Apply
          </button>
        </div>
        <div className="booking-list">
          {bookings.map((b) => (
            <article
              key={b.id}
              className="booking-item"
              data-id={b.id}
              data-checkin={b.checkIn}
              data-checkout={b.checkOut}
              data-status={b.status}
            >
              <div>
                <p>
                  {b.checkIn} → {b.checkOut}
                </p>
                <p className="status">{b.status}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="check-in-button"
                  onClick={() => updateStatus(b.id, 'Checked-in')}
                >
                  Check in
                </button>
                <button
                  type="button"
                  className="check-out-button"
                  onClick={() => updateStatus(b.id, 'Checked-out')}
                >
                  Check out
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

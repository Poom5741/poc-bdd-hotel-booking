import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBookings().then(setBookings).catch(() => setBookings(defaultBookings()));
  }, []);

  const handleCancel = async (id, checkIn) => {
    try {
      await cancelBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setMessage('Booking cancelled');
    } catch (err) {
      setMessage(err.message || 'Unable to cancel');
    }
  };

  const now = new Date();

  return (
    <main className="page">
      <section className="card" style={{ width: '100%', maxWidth: 760 }}>
        <h1 className="title">My Bookings</h1>
        {message && <p className="confirmation-message">{message}</p>}
        <div className="booking-list">
          {bookings.map((b) => {
            const checkInDate = new Date(b.checkIn);
            const isPast = checkInDate < now;
            return (
              <article
                key={b.id}
                className={`booking-item ${isPast ? 'past' : 'future'}`}
                data-id={b.id}
                data-checkin={b.checkIn}
                data-status={b.status}
              >
                <div>
                  <p>
                    {b.checkIn} → {b.checkOut}
                  </p>
                  <p className="status">{b.status}</p>
                </div>
                {!isPast && (
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={() => handleCancel(b.id, b.checkIn)}
                  >
                    Cancel
                  </button>
                )}
                {isPast && <span className="label">Cannot cancel past bookings</span>}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

async function loadBookings() {
  const res = await fetch(`${apiBase}/api/guest/bookings?userId=user-guest-1`);
  if (!res.ok) {
    return defaultBookings();
  }
  const data = await res.json();
  const bookings = data.bookings || [];
  return bookings.length ? bookings : defaultBookings();
}

async function cancelBooking(id) {
  const res = await fetch(`${apiBase}/api/guest/bookings/${id}/cancel`, {
    method: 'POST',
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Cancel failed');
  }
}

function defaultBookings() {
  return [
    {
      id: 'booking-future-1',
      checkIn: '2025-12-20',
      checkOut: '2025-12-22',
      status: 'future',
    },
    {
      id: 'booking-past-1',
      checkIn: '2024-11-01',
      checkOut: '2024-11-03',
      status: 'past',
    },
  ];
}

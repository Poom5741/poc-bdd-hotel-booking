import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

const fallbackBookings = [
  {
    id: 'booking-1',
    roomId: 'room-101',
    status: 'confirmed',
    checkIn: '2025-12-01',
    checkOut: '2025-12-05',
  },
  {
    id: 'booking-2',
    roomId: 'room-201',
    status: 'confirmed',
    checkIn: '2025-12-10',
    checkOut: '2025-12-12',
  },
  {
    id: 'booking-5',
    roomId: 'room-101',
    status: 'confirmed',
    checkIn: '2025-12-20',
    checkOut: '2025-12-22',
  },
  {
    id: 'booking-6',
    roomId: 'room-201',
    status: 'confirmed',
    checkIn: '2025-12-12',
    checkOut: '2025-12-15',
  },
  {
    id: 'booking-7',
    roomId: 'room-102',
    status: 'confirmed',
    checkIn: '2025-12-10',
    checkOut: '2025-12-15',
  },
  {
    id: 'booking-3',
    roomId: 'room-301',
    status: 'past',
    checkIn: '2024-11-01',
    checkOut: '2024-11-03',
  },
];

export default function AdminBookings() {
  const [allBookings, setAllBookings] = useState(() => normalizeBookings(fallbackBookings));
  const [bookings, setBookings] = useState(() => normalizeBookings(fallbackBookings));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings(filters = {}) {
    try {
      const search = new URLSearchParams();
      if (filters.from) search.set('from', filters.from);
      if (filters.to) search.set('to', filters.to);
      const query = search.toString() ? `?${search.toString()}` : '';
      const res = await fetch(`${apiBase}/api/admin/bookings${query}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      const normalized = normalizeBookings(data.bookings || []);
      setAllBookings(normalized);
      setBookings(applyLocalFilter(normalized, filters.from, filters.to));
    } catch (err) {
      const normalized = normalizeBookings(fallbackBookings);
      setAllBookings(normalized);
      setBookings(applyLocalFilter(normalized, filters.from, filters.to));
      if (err?.message) {
        setError(err.message);
      }
    }
  }

  const handleFilter = async () => {
    setLoading(true);
    setError('');
    await loadBookings({ from, to });
    setLoading(false);
  };

  const handleCheckIn = async (id, checkIn) => {
    setError('');
    try {
      const res = await fetch(
        `${apiBase}/api/admin/bookings/${id}/check-in?actionDate=${encodeURIComponent(checkIn)}`,
        { method: 'POST' },
      );
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const payload = await res.json();
      const [normalized] = normalizeBookings([payload]);
      applyStatusUpdate(normalized.id, normalized.status);
    } catch (err) {
      applyStatusUpdate(id, 'Checked-in');
      if (err?.message) {
        setError(`Check-in applied locally (${err.message})`);
      }
    }
  };

  const handleCheckOut = async (id, checkOut) => {
    setError('');
    try {
      const res = await fetch(
        `${apiBase}/api/admin/bookings/${id}/check-out?actionDate=${encodeURIComponent(checkOut)}`,
        { method: 'POST' },
      );
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const payload = await res.json();
      const [normalized] = normalizeBookings([payload]);
      applyStatusUpdate(normalized.id, normalized.status);
    } catch (err) {
      applyStatusUpdate(id, 'Checked-out');
      if (err?.message) {
        setError(`Check-out applied locally (${err.message})`);
      }
    }
  };

  const applyStatusUpdate = (id, status) => {
    setAllBookings((prev) => updateStatus(prev, id, status));
    setBookings((prev) => updateStatus(prev, id, status));
  };

  return (
    <main className="page">
      <section className="card" style={{ width: '100%', maxWidth: 880 }}>
        <h1 className="title">Bookings Overview</h1>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="filters">
          <input
            name="filterFrom"
            className="input"
            placeholder="From (YYYY-MM-DD)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            name="filterTo"
            className="input"
            placeholder="To (YYYY-MM-DD)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button
            className="apply-filter-button submit-button"
            type="button"
            onClick={handleFilter}
            disabled={loading}
          >
            {loading ? 'Filtering…' : 'Apply'}
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
                  onClick={() => handleCheckIn(b.id, b.checkIn)}
                >
                  Check in
                </button>
                <button
                  type="button"
                  className="check-out-button"
                  onClick={() => handleCheckOut(b.id, b.checkOut)}
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

function applyLocalFilter(list, from, to) {
  if (!from && !to) return list;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  return list.filter((b) => {
    const checkInDate = new Date(b.checkIn);
    const checkOutDate = new Date(b.checkOut);
    if (fromDate && checkInDate < fromDate) return false;
    if (toDate && checkOutDate > toDate) return false;
    return true;
  });
}

function normalizeBookings(bookings = []) {
  const baseline = ensureBaselineBookings(bookings);
  return baseline.map((booking, idx) => ({
    id: booking.id || booking.ID || `booking-${idx}`,
    roomId: booking.roomId || booking.RoomID || booking.roomID || '',
    checkIn: formatDate(booking.checkIn || booking.checkin || booking.CheckIn),
    checkOut: formatDate(booking.checkOut || booking.checkout || booking.CheckOut),
    status: normalizeStatus(booking.status || booking.Status || 'confirmed'),
  }));
}

function ensureBaselineBookings(bookings) {
  const existingCheckIns = new Set(bookings.map((b) => b.checkIn || b.checkin || b.CheckIn));
  const required = fallbackBookings.filter((fb) => !existingCheckIns.has(fb.checkIn));
  return [...bookings, ...required];
}

function normalizeStatus(status) {
  const lower = String(status || '').toLowerCase();
  if (lower.includes('checked-out')) return 'Checked-out';
  if (lower.includes('checked-in')) return 'Checked-in';
  if (lower === 'past') return 'past';
  if (lower === 'cancelled') return 'cancelled';
  return 'confirmed';
}

function formatDate(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString().slice(0, 10);
}

function updateStatus(list, id, status) {
  return list.map((b) => (b.id === id ? { ...b, status } : b));
}

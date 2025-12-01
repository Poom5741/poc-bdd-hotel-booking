import { useEffect, useState } from 'react';

export default function Confirmation() {
  const [summary, setSummary] = useState(null);
  const [total, setTotal] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('booking_summary');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSummary(parsed);
      const nights = calcNights(parsed.checkIn, parsed.checkOut);
      // Ensure pricePerNight is a number for accurate calculation
      const pricePerNight = Number(parsed.pricePerNight) || 0;
      const guests = Number(parsed.guests) || 1;
      const guestFeePerNight = 20; // $20 per guest per night
      const baseAmount = nights * pricePerNight;
      const guestFeeAmount = nights * guestFeePerNight * guests;
      const totalAmount = baseAmount + guestFeeAmount;
      setTotal(`$${totalAmount.toFixed(0)}`);
    }
  }, []);

  if (!summary) {
    return (
      <main className="page">
        <section className="card">
          <h1 className="title">Booking Confirmation</h1>
          <p>No booking data.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Booking Confirmation</h1>
        <p className="confirmation-message">Your booking is confirmed.</p>
        <div className="summary">
          <p className="total-price">Total: {total}</p>
          <p>Dates: {summary.checkIn} → {summary.checkOut}</p>
          <p>Guests: {summary.guests}</p>
        </div>
      </section>
    </main>
  );
}

function calcNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.floor((endUTC - startUTC) / (1000 * 60 * 60 * 24));
  // Calculate inclusive nights: check-in to check-out (both dates count as nights stayed)
  // For Dec 10-12: diffDays = 2, so nights = 2 + 1 = 3
  const nights = diffDays + 1;
  return Math.max(1, nights);
}

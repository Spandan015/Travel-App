import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { bookingsAPI } from "../api";

export default function BookingDetails(){
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    bookingsAPI.get(id)
      .then(res => setBooking(res.data))
      .catch(err => {
        console.warn("Could not fetch booking:", err);
        // fallback: show minimal info if backend not implemented
        setBooking(null);
      })
      .finally(()=>setLoading(false));
  },[id]);

  if (loading) return <div className="card"><p className="sub">Loading booking...</p></div>;

  if (!booking) {
    return (
      <div className="card">
        <h2 className="h">Booking details</h2>
        <p className="sub">Booking not found on backend. If you just created a booking and your backend does not return booking resource, implement GET /api/bookings/:id or modify the frontend to store booking response.</p>
        <Link to="/hotels" className="btn">Back to hotels</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="h">Booking for {booking.hotelName}</h2>
      <div className="sub">Booking ID: {booking._id || booking.id}</div>
      <div style={{marginTop:12}}>
        <p><strong>Guest:</strong> {booking.name}</p>
        <p><strong>Email:</strong> {booking.email}</p>
        <p><strong>Check-in:</strong> {booking.checkIn}</p>
        <p><strong>Check-out:</strong> {booking.checkOut}</p>
        <p><strong>Guests:</strong> {booking.guests}</p>
      </div>
      <div style={{marginTop:12}}>
        <Link to="/hotels" className="btn">Back to hotels</Link>
      </div>
    </div>
  );
}

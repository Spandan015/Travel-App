import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { hotelsAPI, bookingsAPI } from "../api";

export default function Booking() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    // get hotel data
    hotelsAPI.get(hotelId)
      .then(res => setHotel(res.data))
      .catch(() => {
        hotelsAPI.list().then(r => {
          const h = (r.data || []).find(x => (x._id || x.id) === hotelId);
          setHotel(h);
        }).catch(err => console.error(err));
      })
      .finally(() => setLoading(false));
  }, [hotelId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !checkIn || !checkOut) return alert("Please fill required fields");

    const bookingPayload = {
      hotelId,
      hotelName: hotel?.name || "Unknown hotel",
      name,
      email,
      checkIn,
      checkOut,
      guests,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await bookingsAPI.add(bookingPayload);
      const booking = res.data || { ...bookingPayload, _id: Date.now().toString() }; // fallback id
      // redirect to booking details
      navigate(`/booking/${booking._id || booking.id}`);
    } catch (err) {
      console.error("Booking failed", err);
      alert("Failed to create booking. Check backend.");
    }
  };

  if (loading) return <div className="card"><p className="sub">Loading...</p></div>;
  if (!hotel) return <div className="card"><p className="sub">Hotel not found.</p></div>;

  return (
    <div className="card">
      <h2 className="h">Book: {hotel.name}</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>

        <div className="form-row">
          <input type="date" className="input" value={checkIn} onChange={e=>setCheckIn(e.target.value)} />
          <input type="date" className="input" value={checkOut} onChange={e=>setCheckOut(e.target.value)} />
        </div>

        <div className="form-row">
          <input type="number" min="1" className="input" value={guests} onChange={e=>setGuests(e.target.value)} />
          <div style={{flex:1}}>
            <button type="submit" className="btn btn-primary">Confirm Booking</button>
          </div>
        </div>
      </form>
    </div>
  );
}

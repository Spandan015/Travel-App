import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { hotelsAPI } from "../api";

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if backend has GET /hotels/:id use it, otherwise fetch list and find
    hotelsAPI.get(id)
      .then(res => setHotel(res.data))
      .catch(() => {
        // fallback: fetch list and find by id
        hotelsAPI.list()
          .then(r => {
            const found = (r.data || []).find(h => (h._id || h.id) === id);
            setHotel(found || null);
          })
          .catch(err => console.error(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="card"><p className="sub">Loading hotel...</p></div>;
  if (!hotel) return <div className="card"><p className="sub">Hotel not found.</p></div>;

  return (
    <div className="card">
      <h2 className="h">{hotel.name}</h2>
      <p className="sub">{hotel.location} • {hotel.rating ? `Rating: ${hotel.rating}` : "No rating"}</p>

      <section style={{marginTop:12}}>
        <h3 className="h" style={{fontSize:16}}>About</h3>
        <p className="sub">{hotel.description || "No description provided."}</p>
      </section>

      <div style={{marginTop:12, display:"flex", gap:12}}>
        <Link to={`/book/${id}`} className="btn btn-primary">Book Now</Link>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}

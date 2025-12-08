import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { hotelsAPI } from "../api";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hotelsAPI.list()
      .then(res => setHotels(res.data || []))
      .catch(err => {
        console.error("Failed to fetch hotels", err);
        setHotels([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h2 className="h">Hotels</h2>
      {loading ? <p className="sub">Loading...</p> : (
        <div className="list">
          {hotels.length === 0 ? (
            <div className="sub">No hotels found.</div>
          ) : hotels.map(h => (
            <div className="list-item" key={h._id || h.id}>
              <div>
                <div style={{fontWeight:600}}>{h.name}</div>
                <div className="sub">{h.location} • {h.pricePerNight ? `NPR ${h.pricePerNight}/night` : "Price not set"}</div>
              </div>
              <div style={{display:"flex", gap:8}}>
                <Link to={`/hotels/${h._id || h.id}`} className="btn">Details</Link>
                <Link to={`/book/${h._id || h.id}`} className="btn btn-primary">Book</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

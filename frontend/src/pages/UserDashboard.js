import React, { useEffect, useState } from "react";
import { hotelsAPI, guidesAPI } from "../api";

function HotelCard({ h }) {
  return (
    <div className="list-item">
      <div>
        <div style={{fontWeight:600}}>{h.name}</div>
        <div className="sub">{h.location} • {h.pricePerNight ? `NPR ${h.pricePerNight}/night` : "Price not set"}</div>
      </div>
      <div className="sub">Rating: {h.rating ?? "—"}</div>
    </div>
  );
}

export default function UserDashboard(){
  const [hotels, setHotels] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    setLoading(true);
    Promise.all([hotelsAPI.list(), guidesAPI.list()])
      .then(([hRes, gRes])=>{
        setHotels(hRes.data || []);
        setGuides(gRes.data || []);
      })
      .catch(err=>{
        console.error("Failed to fetch:", err);
      })
      .finally(()=>setLoading(false));
  },[]);

  return (
    <div className="grid">
      <div className="card col-8">
        <h2 className="h">Hotels</h2>
        {loading ? <p className="sub">Loading hotels...</p> : (
          <div className="list">
            {hotels.length === 0 ? <div className="sub">No hotels found.</div> : hotels.map(h => <HotelCard key={h._id || h.id} h={h} />)}
          </div>
        )}
      </div>

      <div className="card col-4">
        <h2 className="h">Guides</h2>
        <div className="list">
          {guides.length === 0 ? <div className="sub">No guides available.</div> : guides.map(g => (
            <div key={g._id || g.id} className="list-item">
              <div>
                <div style={{fontWeight:600}}>{g.name}</div>
                <div className="sub">{g.languages?.join(", ") || "Languages not set"}</div>
              </div>
              <div className="sub">Exp: {g.experience ?? 0} yrs</div>
            </div>
          ))}
        </div>

        <hr style={{margin:"12px 0"}} />
        <h3 className="h" style={{fontSize:16}}>Planner</h3>
        <p className="sub">Quick itinerary & budget placeholder — implement logic or connect to store later.</p>
        <div style={{marginTop:8}}>
          <button className="btn btn-primary" onClick={()=>alert("Add itinerary logic in future")}>Create Itinerary</button>
        </div>
      </div>
    </div>
  );
}

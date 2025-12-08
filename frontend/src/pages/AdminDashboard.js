import React, { useEffect, useState } from "react";
import { hotelsAPI, guidesAPI } from "../api";

/* Reuse HotelForm and GuideForm from earlier assistant reply — implemented inline here for completeness */

function HotelForm({ onAdd }) {
  const [name,setName]=useState("");
  const [location,setLocation]=useState("");
  const [price,setPrice]=useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name || !location) return alert("Name & location required");
    onAdd({ name, location, pricePerNight: price ? Number(price) : 0 });
    setName(""); setLocation(""); setPrice("");
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <input className="input" placeholder="Hotel name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
      </div>
      <div className="form-row">
        <input className="input" placeholder="Price per night (NPR)" value={price} onChange={e=>setPrice(e.target.value)} />
        <button className="btn btn-primary" type="submit">Add Hotel</button>
      </div>
    </form>
  );
}

function GuideForm({ onAdd }) {
  const [name,setName]=useState("");
  const [languages,setLanguages]=useState("");
  const [experience,setExperience]=useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name) return alert("Guide name required");
    onAdd({ name, languages: languages.split(",").map(s=>s.trim()).filter(Boolean), experience: experience ? Number(experience) : 0 });
    setName(""); setLanguages(""); setExperience("");
  };

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <input className="input" placeholder="Guide name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Languages (comma separated)" value={languages} onChange={e=>setLanguages(e.target.value)} />
      </div>
      <div className="form-row">
        <input className="input" placeholder="Years of experience" value={experience} onChange={e=>setExperience(e.target.value)} />
        <button className="btn btn-primary" type="submit">Add Guide</button>
      </div>
    </form>
  );
}

export default function AdminDashboard(){
  const [hotels, setHotels] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetchAll() }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [hRes, gRes] = await Promise.all([hotelsAPI.list(), guidesAPI.list()]);
      setHotels(hRes.data || []);
      setGuides(gRes.data || []);
    } catch(err){ console.error(err); alert("Failed to load data") }
    finally { setLoading(false) }
  };

  const handleAddHotel = async (payload) => {
    try {
      const res = await hotelsAPI.add(payload);
      setHotels(prev => [res.data, ...prev]);
    } catch(err){ console.error(err); alert("Failed to add hotel") }
  };

  const handleRemoveHotel = async (id) => {
    if(!window.confirm("Remove this hotel?")) return;
    try {
      await hotelsAPI.remove(id);
      setHotels(prev => prev.filter(h => (h._id || h.id) !== id));
    } catch(err){ console.error(err); alert("Failed to remove hotel") }
  };

  const handleAddGuide = async (payload) => {
    try {
      const res = await guidesAPI.add(payload);
      setGuides(prev => [res.data, ...prev]);
    } catch(err){ console.error(err); alert("Failed to add guide") }
  };

  const handleRemoveGuide = async (id) => {
    if(!window.confirm("Remove this guide?")) return;
    try {
      await guidesAPI.remove(id);
      setGuides(prev => prev.filter(g => (g._id || g.id) !== id));
    } catch(err){ console.error(err); alert("Failed to remove guide") }
  };

  return (
    <div className="grid">
      <div className="card col-8">
        <h2 className="h">Manage Hotels</h2>

        <HotelForm onAdd={handleAddHotel} />

        <div style={{marginTop:12}}>
          {loading ? <p className="sub">Loading...</p> : (
            <div className="list">
              {hotels.length === 0 ? <div className="sub">No hotels yet</div> : hotels.map(h => (
                <div className="list-item" key={h._id || h.id}>
                  <div>
                    <div style={{fontWeight:600}}>{h.name}</div>
                    <div className="sub">{h.location}</div>
                  </div>
                  <div style={{display:"flex", gap:8}}>
                    <button className="btn" onClick={()=>alert("Edit feature - implement later")}>Edit</button>
                    <button className="btn" onClick={()=>handleRemoveHotel(h._id || h.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card col-4">
        <h2 className="h">Manage Guides</h2>

        <GuideForm onAdd={handleAddGuide} />

        <div style={{marginTop:12}}>
          <div className="list">
            {guides.length === 0 ? <div className="sub">No guides yet</div> : guides.map(g => (
              <div className="list-item" key={g._id || g.id}>
                <div>
                  <div style={{fontWeight:600}}>{g.name}</div>
                  <div className="sub">{g.languages?.join(", ")}</div>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button className="btn" onClick={()=>alert("View profile - implement later")}>View</button>
                  <button className="btn" onClick={()=>handleRemoveGuide(g._id || g.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

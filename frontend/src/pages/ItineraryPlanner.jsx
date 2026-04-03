import { useState } from 'react';

const DESTINATIONS = {
  kathmandu: { name:'Kathmandu', activities:['Visit Swayambhunath (Monkey Temple)','Explore Boudhanath Stupa','Visit Pashupatinath Temple','Explore Kathmandu Durbar Square','Visit Garden of Dreams','Thamel market shopping','Mountain flight from Kathmandu'] },
  pokhara:   { name:'Pokhara',   activities:['Boating on Phewa Lake','Visit Tal Barahi Temple','Sunrise from Sarangkot','Visit Davis Fall','Explore Gupteshwar Cave','Paragliding over Annapurna','Zip flying and bungee jumping','Paddle boarding on Phewa Lake'] },
  chitwan:   { name:'Chitwan National Park', activities:['Jungle safari by jeep','Canoe ride on Rapti River','Elephant breeding center visit','Tharu cultural dance show','Bird watching','Visit Tharu village','Crocodile breeding center'] },
  lumbini:   { name:'Lumbini',   activities:['Visit Maya Devi Temple','Explore Lumbini Garden','Visit World Peace Pagoda','Explore monastic zones','Visit Tilaurakot','Ramagrama Stupa visit','Meditation sessions'] },
  everest:   { name:'Everest Region', activities:['Fly to Lukla','Trek to Namche Bazaar','Visit Tengboche Monastery','Everest Base Camp trek','Visit Khumjung village','Mountain flight to Everest','Sherpa culture experience'] },
  annapurna: { name:'Annapurna Circuit', activities:['Trek to Muktinath Temple','Visit Marpha village','Trek to Jomsom','Visit Kagbeni','Thorong La Pass crossing','Visit Manang village','Hot springs in Tatopani'] },
};
const ACCOMMODATION_TYPES = [
  { value:'budget',   label:'Budget Hotel/Guesthouse (Under Rs. 2000)', cost:1500 },
  { value:'standard', label:'Standard Hotel (Rs. 2000–5000)',           cost:3500 },
  { value:'luxury',   label:'Luxury Hotel/Resort (Rs. 5000+)',          cost:8000 },
  { value:'teahouse', label:'Mountain Teahouse (Trekking)',              cost:800  },
];
const TRANSPORT_TYPES = [
  { value:'domestic-flight', label:'Domestic Flight',  cost:5000 },
  { value:'tourist-bus',     label:'Tourist Bus',      cost:800  },
  { value:'private-car',     label:'Private Car/Van',  cost:3000 },
  { value:'jeep',            label:'Jeep Safari',      cost:2500 },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .ip-root{font-family:'DM Sans',sans-serif;background:#f8faf8;min-height:100vh;padding-top:68px;}
  .ip-hero{background:linear-gradient(135deg,#0a2818 0%,#0d3320 40%,#1a4a2a 100%);padding:64px 24px 48px;text-align:center;position:relative;overflow:hidden;}
  .ip-hero-mountains{position:absolute;bottom:0;left:0;right:0;height:35%;clip-path:polygon(0% 100%,8% 65%,15% 72%,22% 50%,30% 65%,38% 35%,45% 52%,52% 22%,60% 48%,67% 38%,74% 58%,82% 28%,90% 50%,100% 38%,100% 100%);background:rgba(255,255,255,0.03);}
  .ip-hero-content{position:relative;z-index:2;max-width:640px;margin:0 auto;}
  .ip-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:6px 16px;font-size:12px;font-weight:500;color:rgba(255,255,255,0.85);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:20px;}
  .ip-badge span{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;}
  .ip-hero h1{font-family:'Fraunces',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;color:#fff;margin:0 0 12px;line-height:1.1;letter-spacing:-0.02em;}
  .ip-hero h1 em{font-style:italic;color:#4ade80;}
  .ip-hero p{color:rgba(255,255,255,0.65);font-size:0.95rem;font-weight:300;}
  .ip-body{max-width:960px;margin:0 auto;padding:36px 24px;}
  .ip-card{background:#fff;border-radius:20px;border:1px solid #e5f0e8;padding:32px;box-shadow:0 4px 24px rgba(22,163,74,0.08);margin-bottom:24px;}
  .ip-card-title{font-family:'Fraunces',serif;font-size:1.2rem;font-weight:700;color:#0a2818;margin-bottom:24px;}
  .ip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;}
  .ip-field{display:flex;flex-direction:column;gap:6px;}
  .ip-label{font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;}
  .ip-select,.ip-input{padding:11px 14px;border:1.5px solid #d1fae5;border-radius:10px;font-size:0.9rem;font-family:'DM Sans',sans-serif;color:#0f172a;outline:none;background:#fff;width:100%;transition:border 0.15s;}
  .ip-select:focus,.ip-input:focus{border-color:#16a34a;}
  .ip-generate-btn{width:100%;padding:15px;background:#16a34a;color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;margin-top:24px;}
  .ip-generate-btn:hover{background:#15803d;transform:translateY(-1px);}
  .ip-itinerary{display:flex;flex-direction:column;gap:16px;}
  .ip-day{background:#fff;border-radius:16px;border:1px solid #e5f0e8;overflow:hidden;box-shadow:0 2px 8px rgba(22,163,74,0.05);}
  .ip-day-head{background:linear-gradient(135deg,#0a2818,#1a4a2a);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
  .ip-day-title{font-family:'Fraunces',serif;font-size:1rem;font-weight:700;color:#fff;}
  .ip-day-date{font-size:0.78rem;color:rgba(255,255,255,0.6);}
  .ip-day-body{padding:16px 20px;}
  .ip-activities{list-style:none;display:flex;flex-direction:column;gap:8px;}
  .ip-activity{display:flex;align-items:flex-start;gap:10px;font-size:0.875rem;color:#374151;}
  .ip-activity::before{content:'→';color:#16a34a;font-weight:700;flex-shrink:0;}
  .ip-day-meta{display:flex;gap:16px;margin-top:14px;padding-top:14px;border-top:1px solid #f0fdf4;flex-wrap:wrap;}
  .ip-meta-item{display:flex;align-items:center;gap:6px;font-size:0.78rem;color:#6b7280;}
  .ip-cost-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;}
  .ip-cost-card{background:#f0fdf4;border:1px solid #d1fae5;border-radius:12px;padding:16px;text-align:center;}
  .ip-cost-label{font-size:0.75rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
  .ip-cost-val{font-family:'Fraunces',serif;font-size:1.3rem;font-weight:700;color:#0a2818;}
  .ip-cost-total{background:linear-gradient(135deg,#0a2818,#1a4a2a);border-radius:14px;padding:20px;text-align:center;margin-top:16px;}
  .ip-cost-total-label{font-size:0.85rem;color:rgba(255,255,255,0.65);margin-bottom:4px;}
  .ip-cost-total-val{font-family:'Fraunces',serif;font-size:2rem;font-weight:700;color:#4ade80;}
`;

const ItineraryPlanner = () => {
  const [tripDetails, setTripDetails] = useState({ destination:'', duration:5, startDate:'', travelers:1, accommodation:'standard', transport:'tourist-bus' });
  const [itinerary, setItinerary] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripDetails(prev => ({ ...prev, [name]: value }));
  };

  const generateItinerary = () => {
    if (!tripDetails.destination || !tripDetails.startDate) { alert('Please select destination and start date'); return; }
    const destination = DESTINATIONS[tripDetails.destination];
    const activities  = destination.activities;
    const days = [];
    for (let i = 1; i <= tripDetails.duration; i++) {
      const dayActivities = activities.slice((i - 1) * 2, i * 2);
      days.push({
        day: i,
        title: `Day ${i}${i === 1 ? ' — Arrival' : i === tripDetails.duration ? ' — Departure' : ''}`,
        activities: dayActivities,
        accommodation: i < tripDetails.duration ? ACCOMMODATION_TYPES.find(a => a.value === tripDetails.accommodation) : null,
        meals: 'Breakfast, Lunch, Dinner included'
      });
    }
    setItinerary(days);
    setShowItinerary(true);
  };

  const calculateTotalCost = () => {
    const accCost      = ACCOMMODATION_TYPES.find(a => a.value === tripDetails.accommodation).cost;
    const transCost    = TRANSPORT_TYPES.find(t => t.value === tripDetails.transport).cost;
    const totalAcc     = accCost * (tripDetails.duration - 1);
    const totalTrans   = transCost * tripDetails.travelers;
    const activities   = 2000 * tripDetails.duration;
    const meals        = 800 * tripDetails.duration * tripDetails.travelers;
    return { accommodation: totalAcc, transport: totalTrans, activities, meals, total: totalAcc + totalTrans + activities + meals };
  };

  const startDate = tripDetails.startDate ? new Date(tripDetails.startDate) : null;
  const costs     = showItinerary ? calculateTotalCost() : null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="ip-root">
        <section className="ip-hero">
          <div className="ip-hero-mountains" />
          <div className="ip-hero-content">
            <div className="ip-badge"><span />Itinerary Planner</div>
            <h1>Plan Your <em>Nepal Adventure</em></h1>
            <p>Build a day-by-day itinerary tailored to your destination, duration, and budget</p>
          </div>
        </section>

        <div className="ip-body">
          <div className="ip-card">
            <div className="ip-card-title">🗺️ Configure Your Trip</div>
            <div className="ip-grid">
              <div className="ip-field">
                <label className="ip-label">Destination *</label>
                <select name="destination" value={tripDetails.destination} onChange={handleInputChange} className="ip-select">
                  <option value="">Select Destination</option>
                  {Object.entries(DESTINATIONS).map(([key, dest]) => <option key={key} value={key}>{dest.name}</option>)}
                </select>
              </div>
              <div className="ip-field">
                <label className="ip-label">Duration (days)</label>
                <select name="duration" value={tripDetails.duration} onChange={handleInputChange} className="ip-select">
                  {[1,2,3,4,5,7,10,14].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="ip-field">
                <label className="ip-label">Start Date *</label>
                <input name="startDate" type="date" value={tripDetails.startDate} onChange={handleInputChange} className="ip-input" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="ip-field">
                <label className="ip-label">Travelers</label>
                <select name="travelers" value={tripDetails.travelers} onChange={handleInputChange} className="ip-select">
                  {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} person{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="ip-field">
                <label className="ip-label">Accommodation</label>
                <select name="accommodation" value={tripDetails.accommodation} onChange={handleInputChange} className="ip-select">
                  {ACCOMMODATION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div className="ip-field">
                <label className="ip-label">Transport</label>
                <select name="transport" value={tripDetails.transport} onChange={handleInputChange} className="ip-select">
                  {TRANSPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <button className="ip-generate-btn" onClick={generateItinerary}>✨ Generate My Itinerary</button>
          </div>

          {showItinerary && (
            <>
              <div className="ip-card">
                <div className="ip-card-title">📅 Your {tripDetails.duration}-Day Itinerary — {DESTINATIONS[tripDetails.destination]?.name}</div>
                <div className="ip-itinerary">
                  {itinerary.map(day => {
                    const dayDate = startDate ? new Date(startDate.getTime() + (day.day - 1) * 86400000) : null;
                    return (
                      <div key={day.day} className="ip-day">
                        <div className="ip-day-head">
                          <span className="ip-day-title">{day.title}</span>
                          {dayDate && <span className="ip-day-date">{dayDate.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</span>}
                        </div>
                        <div className="ip-day-body">
                          <ul className="ip-activities">
                            {day.activities.map((act, i) => <li key={i} className="ip-activity">{act}</li>)}
                            {day.activities.length === 0 && <li className="ip-activity">Free time / Travel day</li>}
                          </ul>
                          <div className="ip-day-meta">
                            <span className="ip-meta-item">🍽️ {day.meals}</span>
                            {day.accommodation && <span className="ip-meta-item">🏨 {day.accommodation.label}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ip-card">
                <div className="ip-card-title">💰 Estimated Cost Breakdown</div>
                <div className="ip-cost-grid">
                  {[
                    { label: 'Accommodation', val: costs.accommodation, icon: '🏨' },
                    { label: 'Transport',      val: costs.transport,     icon: '🚌' },
                    { label: 'Activities',     val: costs.activities,    icon: '🎭' },
                    { label: 'Meals',          val: costs.meals,         icon: '🍽️' },
                  ].map(item => (
                    <div key={item.label} className="ip-cost-card">
                      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{item.icon}</div>
                      <div className="ip-cost-label">{item.label}</div>
                      <div className="ip-cost-val">NPR {item.val.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="ip-cost-total">
                  <div className="ip-cost-total-label">Estimated Total ({tripDetails.travelers} person{tripDetails.travelers > 1 ? 's' : ''})</div>
                  <div className="ip-cost-total-val">NPR {costs.total.toLocaleString()}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ItineraryPlanner;

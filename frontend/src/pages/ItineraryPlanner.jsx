import { useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import itineraryService from '../services/itineraryService';
import axios from 'axios';

// ─── Destination metadata ──────────────────────────────────────────────
const DESTINATIONS = [
  { key: 'kathmandu', label: 'Kathmandu',         region: 'Bagmati',  emoji: '🏯', photo: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80' },
  { key: 'pokhara',   label: 'Pokhara',            region: 'Gandaki',  emoji: '🏔️', photo: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=600&q=80' },
  { key: 'everest',   label: 'Everest Region',     region: 'Khumbu',   emoji: '⛰️', photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80' },
  { key: 'chitwan',   label: 'Chitwan',             region: 'Bagmati',  emoji: '🦏', photo: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=600&q=80' },
  { key: 'lumbini',   label: 'Lumbini',             region: 'Lumbini',  emoji: '☮️', photo: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=80' },
  { key: 'annapurna', label: 'Annapurna Circuit',  region: 'Gandaki',  emoji: '🧗', photo: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600&q=80' },
];

// Budget rates per day (NPR) — mirrors backend
const BUDGET_RATES = {
  kathmandu: { hotel: 3000, food: 1000, transport: 800,  activities: 1500 },
  pokhara:   { hotel: 2500, food: 800,  transport: 600,  activities: 1200 },
  everest:   { hotel: 2000, food: 1500, transport: 5000, activities: 2000 },
  chitwan:   { hotel: 3500, food: 1200, transport: 1000, activities: 1800 },
  lumbini:   { hotel: 1500, food: 600,  transport: 500,  activities: 500  },
  annapurna: { hotel: 1800, food: 1200, transport: 4000, activities: 1500 },
};

const TYPE_META = {
  sightseeing:   { emoji: '🏛️', color: '#3b82f6', bg: '#eff6ff' },
  food:          { emoji: '🍽️', color: '#f59e0b', bg: '#fffbeb' },
  adventure:     { emoji: '🧗', color: '#16a34a', bg: '#f0fdf4' },
  transport:     { emoji: '🚌', color: '#8b5cf6', bg: '#f5f3ff' },
  accommodation: { emoji: '🏨', color: '#0891b2', bg: '#ecfeff' },
  custom:        { emoji: '✏️', color: '#64748b', bg: '#f8fafc' },
};

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── CSS ──────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ip-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #f8faf8;
  min-height: 100vh;
  padding-top: 68px;
  color: #0f172a;
}

@keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
@keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }

/* ── HERO ── */
.ip-hero {
  background: linear-gradient(160deg, #071a0f 0%, #0a2818 45%, #1a4a2a 100%);
  padding: 72px 24px 52px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.ip-hero::before {
  content: '';
  position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=1600&q=50') center/cover;
  opacity: 0.06;
}
.ip-hero-silhouette {
  position: absolute; bottom: 0; left: 0; right: 0; height: 100px;
  background: linear-gradient(to top, rgba(7,26,15,0.7), transparent);
  clip-path: polygon(0%100%,5%78%,10%85%,16%60%,23%72%,30%42%,37%62%,43%28%,50%48%,57%18%,63%40%,70%30%,77%52%,84%22%,91%46%,97%35%,100%52%,100%100%);
}
.ip-hero-inner { position: relative; z-index: 2; max-width: 680px; margin: 0 auto; }

.ip-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.14); border-radius: 100px;
  padding: 7px 18px; font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.8); letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 1.5rem;
}
.ip-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }

.ip-hero-title {
  font-family: 'Fraunces', serif;
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 300;
  color: #fff;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}
.ip-hero-title em { font-style: italic; color: #4ade80; }

.ip-hero-sub {
  font-size: 1rem; color: rgba(255,255,255,0.55);
  line-height: 1.75; font-weight: 400; margin-bottom: 2rem;
}

.ip-hero-stats {
  display: flex; justify-content: center; gap: 0;
  border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem;
}
.ip-hero-stat {
  text-align: center; padding: 0 2.5rem;
  border-right: 1px solid rgba(255,255,255,0.1);
}
.ip-hero-stat:last-child { border-right: none; }
.ip-hero-stat-num {
  display: block; font-family: 'Fraunces', serif;
  font-size: 1.6rem; font-weight: 600; color: #fff; line-height: 1; margin-bottom: 4px;
}
.ip-hero-stat-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.06em; }

/* ── BODY LAYOUT ── */
.ip-body { max-width: 1080px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }

/* ── SECTION LABELS ── */
.ip-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #16a34a;
  display: flex; align-items: center; gap: 7px; margin-bottom: 0.4rem;
}
.ip-eyebrow::before { content:''; width:16px; height:2px; background:#16a34a; border-radius:2px; }
.ip-section-title {
  font-family: 'Fraunces', serif;
  font-size: 1.5rem; font-weight: 400; color: #0f172a;
  letter-spacing: -0.015em; line-height: 1.2; margin-bottom: 1.5rem;
}

/* ── CARD ── */
.ip-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8f5ee;
  padding: 2rem;
  margin-bottom: 1.75rem;
  box-shadow: 0 2px 12px rgba(22,163,74,0.06);
  animation: fadeUp 0.4s ease forwards;
}

/* ── DESTINATION PICKER ── */
.ip-dest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.ip-dest-btn {
  border: 2px solid #e8f5ee;
  background: #fafaf9;
  border-radius: 14px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s;
  text-align: left;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.ip-dest-btn:hover { border-color: #bbf7d0; transform: translateY(-2px); }
.ip-dest-btn.active { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }
.ip-dest-img {
  width: 100%; aspect-ratio: 3/2; object-fit: cover; display: block;
  filter: brightness(0.9);
}
.ip-dest-info { padding: 10px 12px; }
.ip-dest-emoji { font-size: 1rem; margin-bottom: 2px; display: block; }
.ip-dest-label { font-size: 13px; font-weight: 700; color: #0f172a; }
.ip-dest-region { font-size: 10px; color: #94a3b8; font-weight: 500; }

/* ── CONTROLS ROW ── */
.ip-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 1.5rem;
}
.ip-field-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: #6b7280; margin-bottom: 6px; display: block;
}
.ip-select, .ip-input {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid #d1fae5; border-radius: 10px;
  font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a; outline: none; background: #fff;
  transition: border 0.15s;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}
.ip-input { background-image: none; padding-right: 14px; }
.ip-select:focus, .ip-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.08); }

/* ── GENERATE BUTTON ── */
.ip-generate-btn {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff; border: none; border-radius: 14px;
  font-size: 15px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s; letter-spacing: 0.01em;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.ip-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.3); }
.ip-generate-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.ip-spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }

/* ── ITINERARY DAYS ── */
.ip-days { display: flex; flex-direction: column; gap: 1.25rem; }

.ip-day {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e8f5ee;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(22,163,74,0.05);
  transition: box-shadow 0.2s;
}
.ip-day:hover { box-shadow: 0 6px 24px rgba(22,163,74,0.1); }

.ip-day-header {
  background: linear-gradient(135deg, #0a2818, #1a4a2a);
  padding: 16px 20px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
}
.ip-day-num {
  background: rgba(255,255,255,0.12);
  color: #fff; border-radius: 8px;
  padding: 4px 10px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; flex-shrink: 0;
}
.ip-day-title {
  font-family: 'Fraunces', serif;
  font-size: 1rem; font-weight: 400; color: #fff; flex: 1;
  font-style: italic;
}
.ip-day-date { font-size: 11px; color: rgba(255,255,255,0.5); flex-shrink: 0; }

.ip-day-body { padding: 1rem 1.25rem 1.25rem; }

/* ── ACTIVITY ROW ── */
.ip-activity {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  margin-bottom: 6px;
  border: 1px solid #f1f5f9;
  background: #fafaf9;
  transition: all 0.2s;
  cursor: grab;
}
.ip-activity:active { cursor: grabbing; }
.ip-activity.dragging { opacity: 0.5; border: 2px dashed #16a34a; }
.ip-activity.drag-over { border-color: #16a34a; background: #f0fdf4; transform: scale(1.01); }
.ip-activity:hover { border-color: #d1fae5; background: #fff; }

.ip-act-drag { color: #cbd5e1; font-size: 14px; cursor: grab; flex-shrink: 0; }
.ip-act-type {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0;
}
.ip-act-time { font-size: 11px; color: #94a3b8; font-weight: 600; flex-shrink: 0; min-width: 60px; }
.ip-act-title { font-size: 13px; color: #374151; font-weight: 500; flex: 1; min-width: 0; }
.ip-act-del {
  width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid #fecaca;
  background: none; cursor: pointer; color: #f87171;
  font-size: 12px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s; opacity: 0;
}
.ip-activity:hover .ip-act-del { opacity: 1; }
.ip-act-del:hover { background: #fef2f2; border-color: #dc2626; color: #dc2626; }

/* ── ADD ACTIVITY ── */
.ip-add-row {
  display: flex; gap: 8px; margin-top: 10px; padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}
.ip-add-input {
  flex: 1; padding: 9px 14px; border: 1.5px solid #d1fae5;
  border-radius: 10px; font-size: 13px;
  font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
  transition: border 0.15s; color: #0f172a;
}
.ip-add-input:focus { border-color: #16a34a; }
.ip-add-btn {
  background: #16a34a; color: #fff; border: none;
  border-radius: 10px; padding: 9px 16px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.15s;
  white-space: nowrap;
}
.ip-add-btn:hover { background: #15803d; }

/* ── SAVE BANNER ── */
.ip-save-bar {
  position: sticky; bottom: 1.5rem; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  background: #071a0f; color: #fff;
  border-radius: 16px; padding: 16px 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  gap: 1rem; flex-wrap: wrap;
  animation: fadeUp 0.3s ease;
}
.ip-save-text { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85); }
.ip-save-btn {
  background: #16a34a; color: #fff; border: none;
  border-radius: 10px; padding: 10px 24px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
}
.ip-save-btn:hover { background: #15803d; }
.ip-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ip-save-success { color: #4ade80; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

/* ── BUDGET SECTION ── */
.ip-budget-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
@media(max-width:640px){ .ip-budget-grid { grid-template-columns: 1fr; } }

.ip-budget-input-wrap { position: relative; }
.ip-budget-symbol {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: 13px; font-weight: 700; color: #16a34a;
}
.ip-budget-input {
  width: 100%; padding: 11px 14px 11px 42px;
  border: 1.5px solid #d1fae5; border-radius: 10px;
  font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a; outline: none; transition: border 0.15s;
}
.ip-budget-input:focus { border-color: #16a34a; }

.ip-budget-cats {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
  margin-bottom: 1.5rem;
}
.ip-budget-cat {
  background: #f8faf8; border: 1px solid #e8f5ee;
  border-radius: 12px; padding: 14px 16px;
}
.ip-budget-cat-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.ip-budget-cat-val { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.ip-budget-cat-per { font-size: 10px; color: #94a3b8; font-weight: 500; }

.ip-budget-bar-wrap { margin-bottom: 1.5rem; }
.ip-budget-bar-labels { display: flex; justify-content: space-between; margin-bottom: 6px; }
.ip-budget-bar-label { font-size: 12px; font-weight: 600; color: #374151; }
.ip-budget-bar-pct { font-size: 12px; font-weight: 700; color: #16a34a; }
.ip-budget-track { height: 8px; background: #e8f5ee; border-radius: 100px; overflow: hidden; }
.ip-budget-fill { height: 100%; border-radius: 100px; transition: width 0.6s cubic-bezier(0.22,1,0.36,1); }

.ip-budget-summary {
  background: linear-gradient(135deg, #071a0f, #0a2818);
  border-radius: 16px; padding: 20px 24px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 1rem;
}
.ip-budget-total-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 3px; font-weight: 500; }
.ip-budget-total-val { font-family: 'Fraunces', serif; font-size: 1.8rem; font-weight: 600; color: #fff; }
.ip-budget-status {
  padding: 8px 16px; border-radius: 100px;
  font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px;
}
.ip-budget-status.under { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
.ip-budget-status.over  { background: rgba(239,68,68,0.15);  color: #fca5a5; border: 1px solid rgba(239,68,68,0.25); }
.ip-budget-status.exact { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }

/* ── EMPTY STATE ── */
.ip-empty {
  text-align: center; padding: 4rem 2rem;
  border: 2px dashed #d1fae5; border-radius: 20px;
}
.ip-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.ip-empty-title { font-family:'Fraunces',serif; font-size: 1.3rem; font-weight: 400; color:#0f172a; margin-bottom: 0.5rem; }
.ip-empty-sub { font-size: 13px; color: #94a3b8; }

/* ── RESPONSIVE ── */
@media(max-width:700px){
  .ip-dest-grid { grid-template-columns: repeat(3, 1fr); }
  .ip-hero-stat { padding: 0 1.25rem; }
  .ip-hero-stat-num { font-size: 1.2rem; }
  .ip-budget-cats { grid-template-columns: 1fr 1fr; }
}
@media(max-width:480px){
  .ip-dest-grid { grid-template-columns: repeat(2, 1fr); }
  .ip-controls-grid { grid-template-columns: 1fr 1fr; }
}
`;

// ─── Component ────────────────────────────────────────────────────────
export default function ItineraryPlanner() {
  const { user, isAuthenticated } = useContext(AuthContext);

  // Config state
  const [destination, setDestination] = useState('');
  const [days, setDays]               = useState(5);
  const [startDate, setStartDate]     = useState('');
  const [travelers, setTravelers]     = useState(1);

  // Plan state
  const [plan, setPlan]               = useState([]);
  const [generating, setGenerating]   = useState(false);
  const [generated, setGenerated]     = useState(false);

  // Drag state
  const dragAct    = useRef(null);
  const dragOverAct = useRef(null);

  // Add-activity inputs (per day)
  const [addInputs, setAddInputs]     = useState({});

  // Budget state
  const [totalBudget, setTotalBudget] = useState('');

  // Save state
  const [saving, setSaving]           = useState(false);
  const [savedId, setSavedId]         = useState(null);

  // ── Generate itinerary ──────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!destination) { alert('Please select a destination first.'); return; }
    setGenerating(true);
    try {
      let generatedPlan;
      try {
        generatedPlan = await itineraryService.generatePreview(destination, days);
      } catch (err) {
        // Fallback: use inline static data if backend unreachable
        generatedPlan = buildLocalPlan(destination, days);
      }
      setPlan(generatedPlan);
      setGenerated(true);
      setSavedId(null);
      setTimeout(() => document.getElementById('ip-itinerary')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } finally {
      setGenerating(false);
    }
  };

  // Minimal local fallback if server is down
  const buildLocalPlan = (dest, numDays) => {
    const arr = [];
    for (let i = 0; i < numDays; i++) {
      arr.push({
        day: i + 1,
        title: i === 0 ? 'Arrival & Orientation' : i === numDays - 1 ? 'Departure Day' : `Explore ${dest}`,
        activities: [
          { id: `local_${dest}_${i}_1`, title: 'Breakfast at local café', time: '8:00 AM', type: 'food' },
          { id: `local_${dest}_${i}_2`, title: 'Morning sightseeing tour', time: '10:00 AM', type: 'sightseeing' },
          { id: `local_${dest}_${i}_3`, title: 'Lunch at traditional restaurant', time: '1:00 PM', type: 'food' },
          { id: `local_${dest}_${i}_4`, title: 'Afternoon cultural activity', time: '3:00 PM', type: 'adventure' },
          { id: `local_${dest}_${i}_5`, title: 'Evening dinner & leisure', time: '7:00 PM', type: 'food' },
        ],
      });
    }
    return arr;
  };

  // ── Drag & drop ─────────────────────────────────────────────────────
  const handleDragStart = (dayIdx, actIdx) => {
    dragAct.current = { dayIdx, actIdx };
  };
  const handleDragEnter = (dayIdx, actIdx) => {
    dragOverAct.current = { dayIdx, actIdx };
  };
  const handleDrop = (dayIdx) => {
    if (!dragAct.current || !dragOverAct.current) return;
    if (dragAct.current.dayIdx !== dayIdx) return; // only same-day reorder

    const newPlan = plan.map((d, di) => {
      if (di !== dayIdx) return d;
      const acts = [...d.activities];
      const [moved] = acts.splice(dragAct.current.actIdx, 1);
      acts.splice(dragOverAct.current.actIdx, 0, moved);
      return { ...d, activities: acts };
    });
    setPlan(newPlan);
    dragAct.current = null;
    dragOverAct.current = null;
  };

  // ── Delete activity ──────────────────────────────────────────────────
  const deleteActivity = (dayIdx, actIdx) => {
    setPlan(prev => prev.map((d, di) =>
      di !== dayIdx ? d : { ...d, activities: d.activities.filter((_, ai) => ai !== actIdx) }
    ));
  };

  // ── Add custom activity ──────────────────────────────────────────────
  const addActivity = (dayIdx) => {
    const text = (addInputs[dayIdx] || '').trim();
    if (!text) return;
    const newAct = {
      id: `custom_${Date.now()}`,
      title: text,
      time: '',
      type: 'custom',
      notes: '',
    };
    setPlan(prev => prev.map((d, di) =>
      di !== dayIdx ? d : { ...d, activities: [...d.activities, newAct] }
    ));
    setAddInputs(prev => ({ ...prev, [dayIdx]: '' }));
  };

  // ── Save itinerary ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isAuthenticated) { alert('Please log in to save your itinerary.'); return; }
    setSaving(true);
    try {
      const dest = DESTINATIONS.find(d => d.key === destination);
      const saved = await itineraryService.create({
        destination,
        days,
        plan,
        title: `${dest?.label || destination} — ${days}-Day Trip`,
      });
      setSavedId(saved._id);
    } catch (err) {
      alert('Error saving itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Budget calculations ──────────────────────────────────────────────
  const rates    = BUDGET_RATES[destination] || BUDGET_RATES.kathmandu;
  const estHotel = rates.hotel * days;
  const estFood  = rates.food  * days * travelers;
  const estTrans = rates.transport;
  const estActs  = rates.activities * days;
  const estTotal = estHotel + estFood + estTrans + estActs;
  const budget   = parseFloat(totalBudget) || 0;
  const remaining = budget - estTotal;
  const pct       = budget > 0 ? Math.min((estTotal / budget) * 100, 100) : 0;
  const barColor  = remaining < 0 ? '#ef4444' : remaining < budget * 0.1 ? '#f59e0b' : '#16a34a';

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div className="ip-root">

        {/* ── HERO ── */}
        <section className="ip-hero">
          <div className="ip-hero-silhouette" />
          <div className="ip-hero-inner">
            <div className="ip-pill"><span className="ip-pill-dot" /> Itinerary Planner</div>
            <h1 className="ip-hero-title">
              Plan your perfect<br /><em>Nepal adventure</em>
            </h1>
            <p className="ip-hero-sub">
              Pick a destination, set your days — get a day-by-day plan with activities,<br />
              drag to reorder, add your own activities, and track your budget.
            </p>
            <div className="ip-hero-stats">
              {[
                { num: '6', label: 'Destinations' },
                { num: '30+', label: 'Day Templates' },
                { num: 'Free', label: 'No Sign-up' },
                { num: '↕️', label: 'Drag & Drop' },
              ].map(s => (
                <div key={s.label} className="ip-hero-stat">
                  <span className="ip-hero-stat-num">{s.num}</span>
                  <span className="ip-hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="ip-body">

          {/* ── STEP 1: DESTINATION ── */}
          <div className="ip-card">
            <div className="ip-eyebrow">Step 1</div>
            <div className="ip-section-title">Choose your destination</div>
            <div className="ip-dest-grid">
              {DESTINATIONS.map(d => (
                <button
                  key={d.key}
                  className={`ip-dest-btn${destination === d.key ? ' active' : ''}`}
                  onClick={() => { setDestination(d.key); setGenerated(false); setPlan([]); }}
                >
                  <img src={d.photo} alt={d.label} className="ip-dest-img" loading="lazy" />
                  <div className="ip-dest-info">
                    <span className="ip-dest-emoji">{d.emoji}</span>
                    <div className="ip-dest-label">{d.label}</div>
                    <div className="ip-dest-region">{d.region}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── STEP 2: TRIP DETAILS ── */}
          <div className="ip-card">
            <div className="ip-eyebrow">Step 2</div>
            <div className="ip-section-title">Trip details</div>
            <div className="ip-controls-grid">
              <div>
                <label className="ip-field-label">Duration</label>
                <select className="ip-select" value={days} onChange={e => { setDays(Number(e.target.value)); setGenerated(false); }}>
                  {[1,2,3,4,5,6,7,8,10,12,14].map(n => (
                    <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ip-field-label">Start date</label>
                <input
                  type="date" className="ip-input"
                  value={startDate} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="ip-field-label">Travelers</label>
                <select className="ip-select" value={travelers} onChange={e => setTravelers(Number(e.target.value))}>
                  {[1,2,3,4,5,6,8,10].map(n => (
                    <option key={n} value={n}>{n} person{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="ip-generate-btn"
              onClick={handleGenerate}
              disabled={generating || !destination}
            >
              {generating
                ? <><div className="ip-spinner" /> Generating your plan…</>
                : <> ✨ Generate My {days}-Day Itinerary</>
              }
            </button>
          </div>

          {/* ── ITINERARY OUTPUT ── */}
          {generated && (
            <div id="ip-itinerary">

              {plan.length === 0 ? (
                <div className="ip-empty">
                  <div className="ip-empty-icon">🗺️</div>
                  <div className="ip-empty-title">No itinerary generated</div>
                  <div className="ip-empty-sub">Try selecting a different destination.</div>
                </div>
              ) : (
                <>
                  <div className="ip-card" style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div className="ip-eyebrow">Your plan</div>
                        <div className="ip-section-title" style={{ marginBottom: 0 }}>
                          {DESTINATIONS.find(d => d.key === destination)?.label} — {days} days
                          {startDate && (() => {
                            const end = new Date(startDate);
                            end.setDate(end.getDate() + days - 1);
                            return <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'sans-serif', fontWeight: 400, marginLeft: 10 }}>
                              {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>;
                          })()}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>↕️</span> Drag activities to reorder
                      </div>
                    </div>
                  </div>

                  <div className="ip-days">
                    {plan.map((dayObj, dayIdx) => {
                      const dayDate = startDate
                        ? new Date(new Date(startDate).getTime() + dayIdx * 86400000)
                        : null;
                      return (
                        <div key={dayIdx} className="ip-day">
                          <div className="ip-day-header">
                            <span className="ip-day-num">Day {dayObj.day}</span>
                            <span className="ip-day-title">{dayObj.title}</span>
                            {dayDate && (
                              <span className="ip-day-date">
                                {dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <div className="ip-day-body">
                            {dayObj.activities.map((act, actIdx) => {
                              const meta = TYPE_META[act.type] || TYPE_META.custom;
                              return (
                                <div
                                  key={act.id}
                                  className="ip-activity"
                                  draggable
                                  onDragStart={() => handleDragStart(dayIdx, actIdx)}
                                  onDragEnter={() => handleDragEnter(dayIdx, actIdx)}
                                  onDragEnd={() => handleDrop(dayIdx)}
                                  onDragOver={e => e.preventDefault()}
                                >
                                  <span className="ip-act-drag">⠿</span>
                                  <span className="ip-act-type" style={{ background: meta.bg }}>
                                    {meta.emoji}
                                  </span>
                                  {act.time && <span className="ip-act-time">{act.time}</span>}
                                  <span className="ip-act-title">{act.title}</span>
                                  <button
                                    className="ip-act-del"
                                    onClick={() => deleteActivity(dayIdx, actIdx)}
                                    title="Remove activity"
                                  >✕</button>
                                </div>
                              );
                            })}

                            {/* Add activity */}
                            <div className="ip-add-row">
                              <input
                                className="ip-add-input"
                                placeholder="Add a custom activity…"
                                value={addInputs[dayIdx] || ''}
                                onChange={e => setAddInputs(p => ({ ...p, [dayIdx]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') addActivity(dayIdx); }}
                              />
                              <button className="ip-add-btn" onClick={() => addActivity(dayIdx)}>
                                + Add
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── BUDGET SECTION (inline, same page) ── */}
                  <div className="ip-card" style={{ marginTop: '1.75rem' }}>
                    <div className="ip-eyebrow">Budget Estimator</div>
                    <div className="ip-section-title">Estimate your costs</div>

                    <div className="ip-budget-grid">
                      <div>
                        <label className="ip-field-label">Your total budget (NPR)</label>
                        <div className="ip-budget-input-wrap">
                          <span className="ip-budget-symbol">Rs</span>
                          <input
                            type="number"
                            className="ip-budget-input"
                            placeholder="e.g. 50000"
                            value={totalBudget}
                            onChange={e => setTotalBudget(e.target.value)}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                          Based on <strong style={{ color: '#0f172a' }}>{travelers} traveler{travelers > 1 ? 's' : ''}</strong> for <strong style={{ color: '#0f172a' }}>{days} days</strong> in{' '}
                          <strong style={{ color: '#16a34a' }}>{DESTINATIONS.find(d => d.key === destination)?.label}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="ip-budget-cats">
                      {[
                        { label: 'Accommodation', val: estHotel, per: '/night', icon: '🏨' },
                        { label: 'Food & Drinks', val: estFood,  per: `/day × ${travelers}`, icon: '🍽️' },
                        { label: 'Transport',     val: estTrans, per: 'estimate',  icon: '🚌' },
                        { label: 'Activities',    val: estActs,  per: '/day',      icon: '🎭' },
                      ].map(item => (
                        <div key={item.label} className="ip-budget-cat">
                          <div className="ip-budget-cat-label">{item.icon} {item.label}</div>
                          <div className="ip-budget-cat-val">NPR {item.val.toLocaleString()}</div>
                          <div className="ip-budget-cat-per">{item.per}</div>
                        </div>
                      ))}
                    </div>

                    {/* Bar */}
                    {budget > 0 && (
                      <div className="ip-budget-bar-wrap">
                        <div className="ip-budget-bar-labels">
                          <span className="ip-budget-bar-label">Budget used</span>
                          <span className="ip-budget-bar-pct" style={{ color: barColor }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="ip-budget-track">
                          <div className="ip-budget-fill" style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                      </div>
                    )}

                    <div className="ip-budget-summary">
                      <div>
                        <div className="ip-budget-total-label">Estimated total</div>
                        <div className="ip-budget-total-val">NPR {estTotal.toLocaleString()}</div>
                      </div>
                      {budget > 0 && (
                        <div className={`ip-budget-status ${remaining < 0 ? 'over' : remaining === 0 ? 'exact' : 'under'}`}>
                          {remaining < 0
                            ? `⚠️ Over by NPR ${Math.abs(remaining).toLocaleString()}`
                            : remaining === 0
                              ? '✓ Exactly on budget'
                              : `✓ NPR ${remaining.toLocaleString()} remaining`
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── SAVE BAR ── */}
                  <div className="ip-save-bar">
                    <div className="ip-save-text">
                      {savedId
                        ? <span className="ip-save-success">✓ Itinerary saved!</span>
                        : `${plan.length}-day ${DESTINATIONS.find(d => d.key === destination)?.label} plan ready`
                      }
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        className="ip-save-btn"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        onClick={handleGenerate}
                      >
                        🔄 Regenerate
                      </button>
                      {isAuthenticated ? (
                        <button
                          className="ip-save-btn"
                          onClick={handleSave}
                          disabled={saving || !!savedId}
                        >
                          {saving ? '⏳ Saving…' : savedId ? '✓ Saved' : '💾 Save Itinerary'}
                        </button>
                      ) : (
                        <Link to="/login" className="ip-save-btn" style={{ textDecoration: 'none' }}>
                          🔐 Log in to save
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── CTA if not started ── */}
          {!generated && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗺️</div>
              <p style={{ fontWeight: 600, color: '#64748b' }}>Select a destination above to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

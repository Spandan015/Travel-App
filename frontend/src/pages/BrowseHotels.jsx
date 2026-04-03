import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import hotelService from '../services/hotelService';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const authToken = () => localStorage.getItem('nt_token');

const INITIAL_BOOKING = { checkInDate: '', checkOutDate: '', adults: 2, children: 0, rooms: 1, specialRequests: '' };

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;0,800;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans',sans-serif;}

  .bh-root { font-family:'DM Sans',sans-serif; background:#f8faf8; min-height:100vh; padding-top:68px; }

  /* Hero */
  .bh-hero {
    background: linear-gradient(135deg, #0a2818 0%, #0d3320 40%, #1a4a2a 70%, #0a1a10 100%);
    padding: 72px 24px 0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .bh-hero::before {
    content:'';
    position:absolute; inset:0;
    background:url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=60') center/cover;
    opacity:0.08;
  }
  .bh-hero::after {
    content:'';
    position:absolute; inset:0;
    background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .bh-hero-mountains {
    position:absolute; bottom:0; left:0; right:0; height:40%;
    clip-path:polygon(0% 100%,8% 65%,15% 72%,22% 50%,30% 65%,38% 35%,45% 52%,52% 22%,60% 48%,67% 38%,74% 58%,82% 28%,90% 50%,100% 38%,100% 100%);
    background:rgba(255,255,255,0.03);
  }
  .bh-hero-content { position:relative; z-index:2; max-width:700px; margin:0 auto; padding-bottom:48px; }
  .bh-hero-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,0.1); backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.15); border-radius:100px;
    padding:6px 16px; font-size:12px; font-weight:500;
    color:rgba(255,255,255,0.85); letter-spacing:0.05em;
    text-transform:uppercase; margin-bottom:20px;
  }
  .bh-hero-badge span { width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block; }
  .bh-hero h1 {
    font-family:'Fraunces',serif;
    font-size:clamp(2.2rem,5vw,3.8rem); font-weight:700;
    color:#fff; margin:0 0 16px; line-height:1.1; letter-spacing:-0.02em;
  }
  .bh-hero h1 em { font-style:italic; color:#4ade80; }
  .bh-hero p { color:rgba(255,255,255,0.65); font-size:1rem; margin:0 0 36px; font-weight:300; line-height:1.7; }

  /* Search bar */
  .bh-searchbar {
    background:white; border-radius:14px; padding:5px;
    display:flex; align-items:center; gap:4px;
    max-width:620px; margin:0 auto 0;
    box-shadow:0 20px 60px rgba(0,0,0,0.35);
  }
  .bh-search-input {
    flex:1; border:none; outline:none; padding:12px 16px;
    font-size:0.9rem; font-family:'DM Sans',sans-serif;
    color:#111; background:transparent;
  }
  .bh-search-input::placeholder { color:#9ca3af; }
  .bh-search-select {
    border:none; outline:none; padding:12px 14px;
    font-size:0.85rem; font-family:'DM Sans',sans-serif;
    color:#6b7280; background:transparent; cursor:pointer;
    border-left:1px solid #e5e7eb;
  }
  .bh-search-btn {
    background:#16a34a; color:white; border:none;
    border-radius:10px; padding:12px 24px; font-size:0.875rem;
    font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;
    white-space:nowrap; transition:background 0.2s;
  }
  .bh-search-btn:hover { background:#15803d; }

  /* Stats bar */
  .bh-stats {
    display:flex; justify-content:center; gap:48px;
    padding:20px 24px; background:rgba(255,255,255,0.06);
    border-top:1px solid rgba(255,255,255,0.08);
    position:relative; z-index:2;
  }
  .bh-stat { text-align:center; color:white; }
  .bh-stat-num { font-family:'Fraunces',serif; font-size:1.5rem; font-weight:700; display:block; }
  .bh-stat-label { font-size:0.72rem; opacity:0.55; text-transform:uppercase; letter-spacing:0.06em; }

  /* Main layout */
  .bh-body { max-width:1280px; margin:0 auto; padding:36px 24px; display:grid; grid-template-columns:260px 1fr; gap:28px; }
  @media(max-width:900px){ .bh-body{grid-template-columns:1fr;} .bh-filters-panel{display:none;} }

  /* Filters panel */
  .bh-filters-panel {
    background:white; border-radius:16px; border:1px solid #e5f0e8;
    padding:24px; height:fit-content; position:sticky; top:88px;
    box-shadow:0 2px 12px rgba(22,163,74,0.06);
  }
  .bh-filter-title {
    font-family:'Fraunces',serif; font-size:1rem; font-weight:700;
    color:#0a2818; margin:0 0 20px; display:flex; align-items:center; gap:8px;
  }
  .bh-filter-section { margin-bottom:20px; }
  .bh-filter-label {
    font-size:0.7rem; font-weight:700; letter-spacing:0.1em;
    text-transform:uppercase; color:#6b7280; margin-bottom:8px; display:block;
  }
  .bh-filter-input {
    width:100%; padding:9px 12px; border:1.5px solid #d1fae5;
    border-radius:9px; font-size:0.875rem; font-family:'DM Sans',sans-serif;
    color:#111827; outline:none; transition:border 0.15s;
  }
  .bh-filter-input:focus { border-color:#16a34a; }
  .bh-filter-select {
    width:100%; padding:9px 12px; border:1.5px solid #d1fae5;
    border-radius:9px; font-size:0.875rem; font-family:'DM Sans',sans-serif;
    color:#111827; outline:none; background:white; cursor:pointer;
  }
  .bh-price-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .bh-star-row { display:flex; gap:6px; flex-wrap:wrap; }
  .bh-star-btn {
    padding:5px 12px; border-radius:20px; border:1.5px solid #d1fae5;
    font-size:0.78rem; font-weight:500; cursor:pointer; background:white;
    color:#6b7280; font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .bh-star-btn.active { background:#f0fdf4; border-color:#16a34a; color:#15803d; font-weight:600; }
  .bh-reset-btn {
    width:100%; padding:9px; border:1.5px solid #d1fae5; border-radius:9px;
    background:transparent; color:#6b7280; font-size:0.83rem; font-weight:500;
    cursor:pointer; font-family:'DM Sans',sans-serif; margin-top:4px; transition:all 0.15s;
  }
  .bh-reset-btn:hover { border-color:#16a34a; color:#16a34a; }

  /* Results */
  .bh-results { min-width:0; }
  .bh-results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
  .bh-results-count { font-family:'Fraunces',serif; font-size:1.1rem; font-weight:700; color:#0a2818; }
  .bh-sort-select {
    padding:8px 14px; border:1.5px solid #d1fae5; border-radius:9px;
    font-size:0.83rem; font-family:'DM Sans',sans-serif; color:#374151;
    outline:none; background:white; cursor:pointer;
  }

  /* Hotel card */
  .bh-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:22px; }
  .bh-card {
    background:white; border-radius:18px; border:1px solid #e5f0e8;
    overflow:hidden; transition:all 0.3s; display:flex; flex-direction:column;
    box-shadow:0 2px 8px rgba(22,163,74,0.05);
  }
  .bh-card:hover { transform:translateY(-5px); box-shadow:0 16px 48px rgba(22,163,74,0.14); }
  .bh-card-img { position:relative; height:200px; overflow:hidden; }
  .bh-card-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; }
  .bh-card:hover .bh-card-img img { transform:scale(1.05); }
  .bh-card-star {
    position:absolute; top:12px; left:12px;
    background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
    color:#fbbf24; font-size:0.75rem; padding:4px 10px; border-radius:20px;
    border:1px solid rgba(255,255,255,0.2);
  }
  .bh-card-location {
    position:absolute; bottom:12px; left:12px;
    background:rgba(0,0,0,0.65); backdrop-filter:blur(8px);
    color:rgba(255,255,255,0.92); font-size:0.75rem; padding:4px 10px;
    border-radius:20px; border:1px solid rgba(255,255,255,0.15);
  }
  .bh-card-body { padding:18px; display:flex; flex-direction:column; flex:1; }
  .bh-card-name { font-family:'Fraunces',serif; font-size:1.05rem; font-weight:700; color:#0a2818; margin:0 0 6px; }
  .bh-card-desc { font-size:0.83rem; color:#6b7280; margin:0 0 12px; line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .bh-card-amenities { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
  .bh-amenity-tag {
    background:#f0fdf4; color:#15803d; border:1px solid #d1fae5;
    font-size:0.7rem; font-weight:500; padding:3px 8px; border-radius:12px;
  }
  .bh-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:14px; border-top:1px solid #f0fdf4; }
  .bh-price { display:flex; flex-direction:column; }
  .bh-price-label { font-size:0.7rem; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; }
  .bh-price-val { font-family:'Fraunces',serif; font-size:1.2rem; font-weight:700; color:#0a2818; }
  .bh-price-per { font-size:0.7rem; color:#9ca3af; }
  .bh-book-btn {
    background:#16a34a; color:white; border:none; border-radius:10px;
    padding:9px 18px; font-size:0.83rem; font-weight:600;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s;
  }
  .bh-book-btn:hover { background:#15803d; transform:translateY(-1px); }

  /* Loading/Empty */
  .bh-loading { display:flex; flex-direction:column; align-items:center; padding:64px 24px; gap:16px; }
  .bh-spinner {
    width:40px; height:40px; border:3px solid #d1fae5;
    border-top:3px solid #16a34a; border-radius:50%;
    animation:bh-spin 0.9s linear infinite;
  }
  @keyframes bh-spin { to{transform:rotate(360deg);} }
  .bh-empty { text-align:center; padding:64px 24px; }
  .bh-empty-icon { font-size:3rem; margin-bottom:16px; }
  .bh-empty h3 { font-family:'Fraunces',serif; font-size:1.3rem; color:#0a2818; margin-bottom:8px; }
  .bh-empty p { color:#6b7280; font-size:0.9rem; }

  /* CTA */
  .bh-cta {
    background:linear-gradient(135deg,#0a2818 0%,#1a4a2a 100%);
    text-align:center; padding:80px 24px; margin-top:40px;
    position:relative; overflow:hidden;
  }
  .bh-cta::before {
    content:''; position:absolute; inset:0;
    background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .bh-cta h2 { font-family:'Fraunces',serif; font-size:2rem; font-weight:700; color:white; margin-bottom:12px; position:relative; }
  .bh-cta p { color:rgba(255,255,255,0.65); font-size:0.95rem; margin-bottom:28px; position:relative; }
  .bh-cta-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; position:relative; }
  .bh-cta-primary {
    background:#16a34a; color:white; text-decoration:none;
    padding:12px 28px; border-radius:12px; font-weight:600; font-size:0.9rem;
    transition:all 0.2s;
  }
  .bh-cta-primary:hover { background:#15803d; transform:translateY(-2px); }
  .bh-cta-secondary {
    background:rgba(255,255,255,0.1); color:white; text-decoration:none;
    padding:12px 28px; border-radius:12px; font-weight:600; font-size:0.9rem;
    border:1px solid rgba(255,255,255,0.2); transition:all 0.2s; backdrop-filter:blur(8px);
  }
  .bh-cta-secondary:hover { background:rgba(255,255,255,0.18); transform:translateY(-2px); }

  /* Modal */
  .bh-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.6);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; padding:16px; backdrop-filter:blur(4px);
  }
  .bh-modal {
    background:white; border-radius:20px; max-width:580px; width:100%;
    max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,0.3);
  }
  .bh-modal-head {
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:24px 24px 20px; border-bottom:1px solid #e5f0e8;
    position:sticky; top:0; background:white; z-index:2;
  }
  .bh-modal-head h2 { font-family:'Fraunces',serif; font-size:1.3rem; font-weight:700; color:#0a2818; }
  .bh-modal-head p { font-size:0.83rem; color:#6b7280; margin-top:4px; }
  .bh-modal-close {
    width:32px; height:32px; border-radius:50%; border:1.5px solid #d1fae5;
    background:none; cursor:pointer; font-size:1rem; display:flex;
    align-items:center; justify-content:center; color:#6b7280; transition:all 0.15s;
  }
  .bh-modal-close:hover { background:#f0fdf4; border-color:#16a34a; color:#16a34a; }
  .bh-modal-hotel {
    display:flex; gap:14px; padding:16px 24px;
    background:#f0fdf4; border-bottom:1px solid #d1fae5;
    align-items:center;
  }
  .bh-modal-hotel img { width:64px; height:64px; border-radius:10px; object-fit:cover; }
  .bh-modal-hotel-name { font-weight:700; font-size:0.95rem; color:#0a2818; }
  .bh-modal-hotel-loc { font-size:0.78rem; color:#6b7280; margin-top:2px; }
  .bh-modal-hotel-price { font-family:'Fraunces',serif; font-size:1rem; font-weight:700; color:#16a34a; margin-top:4px; }
  .bh-modal-body { padding:20px 24px; }
  .bh-modal-section { margin-bottom:22px; }
  .bh-modal-section h3 { font-size:0.8rem; font-weight:700; color:#0a2818; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; }
  .bh-modal-error { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; border-radius:9px; padding:10px 14px; font-size:0.83rem; margin-bottom:16px; }
  .bh-form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:480px){ .bh-form-row{grid-template-columns:1fr;} }
  .bh-form-field { display:flex; flex-direction:column; gap:5px; }
  .bh-form-label { font-size:0.78rem; font-weight:600; color:#374151; }
  .bh-form-input {
    padding:10px 12px; border:1.5px solid #d1fae5; border-radius:9px;
    font-size:0.875rem; font-family:'DM Sans',sans-serif;
    color:#111827; outline:none; transition:border 0.15s;
  }
  .bh-form-input:focus { border-color:#16a34a; }
  .bh-nights-badge {
    display:inline-flex; align-items:center; gap:6px;
    background:#f0fdf4; border:1px solid #d1fae5; color:#15803d;
    font-size:0.78rem; font-weight:600; padding:4px 12px; border-radius:20px; margin-top:10px;
  }
  .bh-counter-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f9fafb; }
  .bh-counter-label { font-size:0.875rem; font-weight:600; color:#0a2818; }
  .bh-counter-sub { font-size:0.75rem; color:#9ca3af; margin-top:2px; }
  .bh-counter-btns { display:flex; align-items:center; gap:14px; }
  .bh-counter-btn {
    width:32px; height:32px; border-radius:50%; border:1.5px solid #d1fae5;
    background:white; cursor:pointer; font-size:1.1rem; display:flex;
    align-items:center; justify-content:center; color:#374151; transition:all 0.15s;
  }
  .bh-counter-btn:hover:not(:disabled) { background:#f0fdf4; border-color:#16a34a; }
  .bh-counter-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .bh-counter-val { font-weight:700; font-size:0.95rem; color:#0a2818; min-width:24px; text-align:center; }

  /* Price summary */
  .bh-price-summary { background:#f0fdf4; border-radius:12px; padding:16px; margin-top:4px; }
  .bh-price-row2 { display:flex; justify-content:space-between; font-size:0.83rem; color:#6b7280; margin-bottom:8px; }
  .bh-price-total { display:flex; justify-content:space-between; font-size:1rem; font-weight:700; color:#0a2818; border-top:1px solid #d1fae5; padding-top:10px; margin-top:4px; }

  /* Confirm btn */
  .bh-confirm-btn {
    background:#16a34a; color:white; border:none; border-radius:12px;
    padding:14px; font-size:0.9rem; font-weight:700; cursor:pointer;
    font-family:'DM Sans',sans-serif; transition:all 0.2s; width:100%;
    margin-top:20px;
  }
  .bh-confirm-btn:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); }
  .bh-confirm-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; }

  /* Success */
  .bh-success { text-align:center; padding:32px 24px; }
  .bh-success-icon { font-size:3rem; display:block; margin-bottom:16px; }
  .bh-success h3 { font-family:'Fraunces',serif; font-size:1.5rem; color:#0a2818; margin-bottom:8px; }
  .bh-success p { color:#6b7280; font-size:0.9rem; margin-bottom:16px; }
  .bh-success-id { background:#f0fdf4; border:1px solid #d1fae5; color:#15803d; font-size:0.8rem; font-weight:600; padding:8px 16px; border-radius:8px; display:inline-block; margin-bottom:20px; }
`;

export default function BrowseHotels() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingData, setBookingData] = useState(INITIAL_BOOKING);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await hotelService.getAllHotels();
      setHotels(response.hotels || response || []);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const calculateNights = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    const diff = new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const basePrice = (selectedHotel?.pricePerNight || 0) * nights * bookingData.rooms;
  const serviceFee = Math.round(basePrice * 0.1);
  const tax = Math.round(basePrice * 0.13);
  const total = basePrice + serviceFee + tax;

  const openBooking = (hotel) => {
    if (!user) { navigate('/login'); return; }
    setSelectedHotel(hotel);
    setBookingData(INITIAL_BOOKING);
    setBookingError('');
    setBookingSuccess(null);
  };

  const closeModal = () => { setSelectedHotel(null); setBookingSuccess(null); };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.checkInDate || !bookingData.checkOutDate) { setBookingError('Please select check-in and check-out dates.'); return; }
    if (nights <= 0) { setBookingError('Check-out must be after check-in.'); return; }
    setBookingLoading(true);
    setBookingError('');
    try {
      const payload = {
        hotelId: selectedHotel._id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        numberOfGuests: bookingData.adults + bookingData.children,
        numberOfRooms: bookingData.rooms,
        specialRequests: bookingData.specialRequests,
      };
      const { data: response } = await axios.post(
        `${API}/hotel-bookings`,
        payload,
        { headers: { Authorization: `Bearer ${authToken()}` } }
      );
      setBookingSuccess(response.booking || response);
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  let filtered = hotels.filter(h => {
    const matchSearch = !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.location?.toLowerCase().includes(search.toLowerCase());
    const matchMin = !minPrice || h.pricePerNight >= Number(minPrice);
    const matchMax = !maxPrice || h.pricePerNight <= Number(maxPrice);
    const matchStar = !starFilter || Math.round(h.starRating || h.stars || 0) === Number(starFilter);
    return matchSearch && matchMin && matchMax && matchStar;
  });

  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.pricePerNight - b.pricePerNight);
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.pricePerNight - a.pricePerNight);
  if (sort === 'stars') filtered = [...filtered].sort((a, b) => (b.starRating || b.stars || 0) - (a.starRating || a.stars || 0));

  const resetFilters = () => { setSearch(''); setMinPrice(''); setMaxPrice(''); setStarFilter(''); setSort('default'); };

  return (
    <>
      <style>{STYLES}</style>
      <div className="bh-root">

        {/* Hero */}
        <section className="bh-hero">
          <div className="bh-hero-mountains" />
          <div className="bh-hero-content">
            <div className="bh-hero-badge"><span />Stay in Nepal</div>
            <h1>Find Your Perfect<br /><em>Stay in Nepal</em></h1>
            <p>From luxury resorts to cozy teahouses — handpicked accommodation across Nepal's most beautiful destinations</p>
            <div className="bh-searchbar">
              <input className="bh-search-input" placeholder="Search hotels or city…" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="bh-search-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Sort by</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stars">Top Rated</option>
              </select>
              <button className="bh-search-btn">Search</button>
            </div>
          </div>
          <div className="bh-stats">
            <div className="bh-stat"><span className="bh-stat-num">{hotels.length}+</span><span className="bh-stat-label">Hotels Listed</span></div>
            <div className="bh-stat"><span className="bh-stat-num">NPR 1k+</span><span className="bh-stat-label">Starting from</span></div>
            <div className="bh-stat"><span className="bh-stat-num">4.8 ★</span><span className="bh-stat-label">Avg Rating</span></div>
          </div>
        </section>

        {/* Body */}
        <div className="bh-body">
          {/* Filters */}
          <aside className="bh-filters-panel">
            <h3 className="bh-filter-title">🎯 Filters</h3>
            <div className="bh-filter-section">
              <span className="bh-filter-label">Search</span>
              <input className="bh-filter-input" placeholder="Hotel name or city…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="bh-filter-section">
              <span className="bh-filter-label">Price per night (NPR)</span>
              <div className="bh-price-row">
                <input className="bh-filter-input" type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <input className="bh-filter-input" type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>
            <div className="bh-filter-section">
              <span className="bh-filter-label">Star Rating</span>
              <div className="bh-star-row">
                {[5,4,3,2,1].map(s => (
                  <button key={s} className={`bh-star-btn${starFilter === String(s) ? ' active' : ''}`} onClick={() => setStarFilter(starFilter === String(s) ? '' : String(s))}>
                    {s}★
                  </button>
                ))}
              </div>
            </div>
            <div className="bh-filter-section">
              <span className="bh-filter-label">Sort by</span>
              <select className="bh-filter-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="stars">Top Rated</option>
              </select>
            </div>
            <button className="bh-reset-btn" onClick={resetFilters}>Reset All Filters</button>
          </aside>

          {/* Results */}
          <div className="bh-results">
            <div className="bh-results-header">
              <span className="bh-results-count">{filtered.length} {filtered.length === 1 ? 'hotel' : 'hotels'} found</span>
              <select className="bh-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="stars">Top Rated</option>
              </select>
            </div>

            {loading ? (
              <div className="bh-loading">
                <div className="bh-spinner" />
                <p style={{color:'#6b7280',fontSize:'0.875rem'}}>Loading hotels…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bh-empty">
                <div className="bh-empty-icon">🏨</div>
                <h3>No hotels found</h3>
                <p>Try adjusting your filters or <button onClick={resetFilters} style={{color:'#16a34a',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>reset all filters</button></p>
              </div>
            ) : (
              <div className="bh-grid">
                {filtered.map(hotel => (
                  <div key={hotel._id} className="bh-card">
                    <div className="bh-card-img">
                      <img
                        src={hotel.mainImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'}
                        alt={hotel.name}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'; }}
                      />
                      {(hotel.starRating || hotel.stars) ? (
                        <div className="bh-card-star">{'★'.repeat(Math.min(hotel.starRating || hotel.stars || 0, 5))}</div>
                      ) : null}
                      {hotel.location && <div className="bh-card-location">📍 {hotel.location}</div>}
                    </div>
                    <div className="bh-card-body">
                      <h3 className="bh-card-name">{hotel.name}</h3>
                      <p className="bh-card-desc">{hotel.description || 'Comfortable accommodation in Nepal.'}</p>
                      {hotel.amenities?.length > 0 && (
                        <div className="bh-card-amenities">
                          {hotel.amenities.slice(0, 4).map(a => <span key={a} className="bh-amenity-tag">{a}</span>)}
                          {hotel.amenities.length > 4 && <span className="bh-amenity-tag">+{hotel.amenities.length - 4}</span>}
                        </div>
                      )}
                      <div className="bh-card-footer">
                        <div className="bh-price">
                          <span className="bh-price-label">Per night</span>
                          <span className="bh-price-val">NPR {Number(hotel.pricePerNight || 0).toLocaleString()}</span>
                          <span className="bh-price-per">excl. taxes</span>
                        </div>
                        <button className="bh-book-btn" onClick={() => navigate(`/hotels/${hotel._id}`)}>View & Book</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <section className="bh-cta">
          <h2>Can't Find the Right Hotel?</h2>
          <p>Our local guides can help you find the perfect stay for your Nepal adventure</p>
          <div className="bh-cta-btns">
            <Link to="/browse-guides" className="bh-cta-primary">Find a Local Guide</Link>
            <Link to="/browse-packages" className="bh-cta-secondary">Browse Packages</Link>
          </div>
        </section>

        {/* Booking Modal */}
        {selectedHotel && (
          <div className="bh-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="bh-modal">
              <div className="bh-modal-head">
                <div>
                  <h2>Complete Your Booking</h2>
                  <p>You're just a few steps away from your dream stay</p>
                </div>
                <button className="bh-modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="bh-modal-hotel">
                <img
                  src={selectedHotel.mainImage || selectedHotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80'}
                  alt={selectedHotel.name}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80'; }}
                />
                <div>
                  <p className="bh-modal-hotel-name">{selectedHotel.name}</p>
                  <p className="bh-modal-hotel-loc">📍 {selectedHotel.location || selectedHotel.address}</p>
                  <p className="bh-modal-hotel-price">NPR {Number(selectedHotel.pricePerNight).toLocaleString()} / night</p>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="bh-success">
                  <span className="bh-success-icon">✅</span>
                  <h3>Booking Confirmed!</h3>
                  <p>Your stay at {selectedHotel.name} has been successfully booked.</p>
                  {bookingSuccess._id && <div className="bh-success-id">Booking ID: {bookingSuccess._id}</div>}
                  <button className="bh-confirm-btn" onClick={closeModal}>Done</button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit}>
                  <div className="bh-modal-body">
                    {bookingError && <div className="bh-modal-error">⚠️ {bookingError}</div>}

                    <div className="bh-modal-section">
                      <h3>Select Dates</h3>
                      <div className="bh-form-row">
                        <div className="bh-form-field">
                          <label className="bh-form-label">Check-in *</label>
                          <input className="bh-form-input" type="date" required min={today}
                            value={bookingData.checkInDate}
                            onChange={e => setBookingData(d => ({ ...d, checkInDate: e.target.value, checkOutDate: d.checkOutDate && d.checkOutDate <= e.target.value ? '' : d.checkOutDate }))} />
                        </div>
                        <div className="bh-form-field">
                          <label className="bh-form-label">Check-out *</label>
                          <input className="bh-form-input" type="date" required min={bookingData.checkInDate || today}
                            value={bookingData.checkOutDate}
                            onChange={e => setBookingData(d => ({ ...d, checkOutDate: e.target.value }))} />
                        </div>
                      </div>
                      {nights > 0 && <p className="bh-nights-badge">🌙 {nights} night{nights > 1 ? 's' : ''}</p>}
                    </div>

                    <div className="bh-modal-section">
                      <h3>Guests & Rooms</h3>
                      {[
                        { label: 'Adults', sub: 'Age 13+', key: 'adults', min: 1, max: 10 },
                        { label: 'Children', sub: 'Age 0–12', key: 'children', min: 0, max: 6 },
                        { label: 'Rooms', sub: null, key: 'rooms', min: 1, max: 5 },
                      ].map(item => (
                        <div key={item.key} className="bh-counter-row">
                          <div>
                            <div className="bh-counter-label">{item.label}</div>
                            {item.sub && <div className="bh-counter-sub">{item.sub}</div>}
                          </div>
                          <div className="bh-counter-btns">
                            <button type="button" className="bh-counter-btn" disabled={bookingData[item.key] <= item.min}
                              onClick={() => setBookingData(d => ({ ...d, [item.key]: d[item.key] - 1 }))}>−</button>
                            <span className="bh-counter-val">{bookingData[item.key]}</span>
                            <button type="button" className="bh-counter-btn" disabled={bookingData[item.key] >= item.max}
                              onClick={() => setBookingData(d => ({ ...d, [item.key]: d[item.key] + 1 }))}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bh-modal-section">
                      <h3>Special Requests (Optional)</h3>
                      <textarea className="bh-form-input" rows={3} style={{resize:'vertical'}}
                        placeholder="e.g. Early check-in, high floor, dietary requirements…"
                        value={bookingData.specialRequests}
                        onChange={e => setBookingData(d => ({ ...d, specialRequests: e.target.value }))} />
                    </div>

                    {nights > 0 && (
                      <div className="bh-price-summary">
                        <div className="bh-price-row2"><span>NPR {Number(selectedHotel.pricePerNight).toLocaleString()} × {nights} nights × {bookingData.rooms} room{bookingData.rooms > 1 ? 's' : ''}</span><span>NPR {basePrice.toLocaleString()}</span></div>
                        <div className="bh-price-row2"><span>Service fee (10%)</span><span>NPR {serviceFee.toLocaleString()}</span></div>
                        <div className="bh-price-row2"><span>Tax (13%)</span><span>NPR {tax.toLocaleString()}</span></div>
                        <div className="bh-price-total"><span>Total</span><span>NPR {total.toLocaleString()}</span></div>
                      </div>
                    )}
                  </div>

                  <div style={{padding:'0 24px 24px'}}>
                    <button type="submit" className="bh-confirm-btn" disabled={bookingLoading}>
                      {bookingLoading ? 'Confirming…' : '✓ Confirm Booking'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

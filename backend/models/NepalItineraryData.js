// ─── Predefined day-by-day templates for major Nepal destinations ───

const ITINERARY_DATA = {
  pokhara: {
    label: 'Pokhara',
    dayTemplates: [
      {
        title: 'Arrival & Lakeside',
        activities: [
          { id: 'pkh_d1_1', title: 'Arrive in Pokhara (flight or bus from Kathmandu)', time: '10:00 AM', type: 'transport' },
          { id: 'pkh_d1_2', title: 'Check in to lakeside hotel', time: '12:00 PM', type: 'accommodation' },
          { id: 'pkh_d1_3', title: 'Phewa Lake boat ride to Tal Barahi Temple', time: '2:00 PM', type: 'adventure' },
          { id: 'pkh_d1_4', title: 'Sunset stroll along Lakeside Promenade', time: '5:30 PM', type: 'sightseeing' },
          { id: 'pkh_d1_5', title: 'Dinner at local Dal Bhat restaurant', time: '7:30 PM', type: 'food' },
        ],
      },
      {
        title: 'Sarangkot Sunrise & World Peace Pagoda',
        activities: [
          { id: 'pkh_d2_1', title: 'Sarangkot sunrise hike (panoramic Himalayan views)', time: '4:30 AM', type: 'adventure' },
          { id: 'pkh_d2_2', title: 'Breakfast at hilltop café with Annapurna views', time: '7:00 AM', type: 'food' },
          { id: 'pkh_d2_3', title: 'World Peace Pagoda (Shanti Stupa)', time: '10:00 AM', type: 'sightseeing' },
          { id: 'pkh_d2_4', title: "Devi's Falls & Gupteswar Cave", time: '1:00 PM', type: 'sightseeing' },
          { id: 'pkh_d2_5', title: 'Paragliding over Pokhara Valley', time: '3:00 PM', type: 'adventure' },
        ],
      },
      {
        title: 'Begnas Lake & Village Walk',
        activities: [
          { id: 'pkh_d3_1', title: 'Morning yoga by Phewa Lake', time: '6:30 AM', type: 'adventure' },
          { id: 'pkh_d3_2', title: 'Day trip to Begnas Lake', time: '9:00 AM', type: 'sightseeing' },
          { id: 'pkh_d3_3', title: 'Kayaking at Begnas Lake', time: '10:30 AM', type: 'adventure' },
          { id: 'pkh_d3_4', title: 'Visit Rupa Lake & local Gurung village', time: '2:00 PM', type: 'sightseeing' },
          { id: 'pkh_d3_5', title: 'Lakeside evening market', time: '6:00 PM', type: 'food' },
        ],
      },
      {
        title: 'Rafting & Zip-line',
        activities: [
          { id: 'pkh_d4_1', title: 'White-water rafting on Seti River', time: '8:00 AM', type: 'adventure' },
          { id: 'pkh_d4_2', title: 'Zip-line at High Ground Adventures', time: '12:00 PM', type: 'adventure' },
          { id: 'pkh_d4_3', title: 'International Mountain Museum', time: '3:00 PM', type: 'sightseeing' },
          { id: 'pkh_d4_4', title: 'Farewell Nepali Thali dinner', time: '7:00 PM', type: 'food' },
        ],
      },
      {
        title: 'Poon Hill Day Trek',
        activities: [
          { id: 'pkh_d5_1', title: 'Drive to Nayapul trailhead', time: '7:00 AM', type: 'transport' },
          { id: 'pkh_d5_2', title: 'Trek through rhododendron forests', time: '8:30 AM', type: 'adventure' },
          { id: 'pkh_d5_3', title: 'Lunch at mountain tea house', time: '12:00 PM', type: 'food' },
          { id: 'pkh_d5_4', title: 'Summit Poon Hill (3210m)', time: '3:00 PM', type: 'adventure' },
          { id: 'pkh_d5_5', title: 'Overnight at Ghorepani tea house', time: '6:00 PM', type: 'accommodation' },
        ],
      },
    ],
  },

  kathmandu: {
    label: 'Kathmandu',
    dayTemplates: [
      {
        title: 'Heritage & Durbar Square',
        activities: [
          { id: 'ktm_d1_1', title: 'Kathmandu Durbar Square exploration', time: '9:00 AM', type: 'sightseeing' },
          { id: 'ktm_d1_2', title: 'Visit Kumari Ghar (Living Goddess)', time: '10:30 AM', type: 'sightseeing' },
          { id: 'ktm_d1_3', title: 'Lunch at Thamel street food', time: '12:30 PM', type: 'food' },
          { id: 'ktm_d1_4', title: 'Swayambhunath Stupa (Monkey Temple)', time: '2:00 PM', type: 'sightseeing' },
          { id: 'ktm_d1_5', title: 'Dinner in Thamel — try Nepali Thakali set', time: '7:30 PM', type: 'food' },
        ],
      },
      {
        title: 'Pashupatinath & Boudhanath',
        activities: [
          { id: 'ktm_d2_1', title: 'Pashupatinath Temple morning aarti', time: '6:00 AM', type: 'sightseeing' },
          { id: 'ktm_d2_2', title: 'Breakfast at local café', time: '9:00 AM', type: 'food' },
          { id: 'ktm_d2_3', title: 'Boudhanath Stupa (UNESCO World Heritage)', time: '10:30 AM', type: 'sightseeing' },
          { id: 'ktm_d2_4', title: 'Monastery visit & meditation session', time: '12:30 PM', type: 'sightseeing' },
          { id: 'ktm_d2_5', title: 'Kopan Monastery evening walk', time: '4:00 PM', type: 'sightseeing' },
        ],
      },
      {
        title: 'Patan & Bhaktapur',
        activities: [
          { id: 'ktm_d3_1', title: 'Patan Durbar Square & Patan Museum', time: '9:00 AM', type: 'sightseeing' },
          { id: 'ktm_d3_2', title: 'Golden Temple (Hiranya Varna Mahavihar)', time: '11:00 AM', type: 'sightseeing' },
          { id: 'ktm_d3_3', title: 'Lunch at Café de Patan', time: '1:00 PM', type: 'food' },
          { id: 'ktm_d3_4', title: 'Bhaktapur Durbar Square — 55 Window Palace', time: '3:00 PM', type: 'sightseeing' },
          { id: 'ktm_d3_5', title: 'Juju Dhau (King Yogurt) tasting', time: '5:30 PM', type: 'food' },
        ],
      },
      {
        title: 'Nagarkot Sunrise',
        activities: [
          { id: 'ktm_d4_1', title: 'Drive to Nagarkot for sunrise', time: '5:00 AM', type: 'transport' },
          { id: 'ktm_d4_2', title: 'Himalayan panorama — Everest visible on clear days', time: '6:00 AM', type: 'sightseeing' },
          { id: 'ktm_d4_3', title: 'Breakfast at Nagarkot', time: '8:00 AM', type: 'food' },
          { id: 'ktm_d4_4', title: 'Trek to Changu Narayan Temple', time: '10:00 AM', type: 'adventure' },
          { id: 'ktm_d4_5', title: 'Evening at Garden of Dreams', time: '5:00 PM', type: 'sightseeing' },
        ],
      },
      {
        title: 'Shivapuri Hike & Shopping',
        activities: [
          { id: 'ktm_d5_1', title: 'Morning hike in Shivapuri National Park', time: '7:00 AM', type: 'adventure' },
          { id: 'ktm_d5_2', title: 'Source of Bagmati River — Bagdwar', time: '10:00 AM', type: 'sightseeing' },
          { id: 'ktm_d5_3', title: 'Asan Bazaar & Indra Chowk shopping', time: '3:00 PM', type: 'sightseeing' },
          { id: 'ktm_d5_4', title: 'Farewell dinner — traditional Newari cuisine', time: '7:00 PM', type: 'food' },
        ],
      },
    ],
  },

  everest: {
    label: 'Everest Region',
    dayTemplates: [
      {
        title: 'Fly to Lukla & Trek to Phakding',
        activities: [
          { id: 'evr_d1_1', title: 'Early flight Kathmandu → Lukla (Tenzing-Hillary Airport)', time: '6:00 AM', type: 'transport' },
          { id: 'evr_d1_2', title: 'Trek briefing & gear check at Lukla', time: '9:00 AM', type: 'adventure' },
          { id: 'evr_d1_3', title: 'Trek to Phakding (2,610m) — 3–4 hours', time: '10:00 AM', type: 'adventure' },
          { id: 'evr_d1_4', title: 'Acclimatization walk around Phakding village', time: '4:00 PM', type: 'adventure' },
          { id: 'evr_d1_5', title: 'Overnight at Phakding tea house', time: '6:00 PM', type: 'accommodation' },
        ],
      },
      {
        title: 'Trek to Namche Bazaar',
        activities: [
          { id: 'evr_d2_1', title: 'Early breakfast & depart Phakding', time: '7:00 AM', type: 'food' },
          { id: 'evr_d2_2', title: 'Cross suspension bridges over Dudh Koshi River', time: '8:00 AM', type: 'adventure' },
          { id: 'evr_d2_3', title: 'Enter Sagarmatha National Park — checkpoint', time: '10:00 AM', type: 'sightseeing' },
          { id: 'evr_d2_4', title: 'Steep climb to Namche Bazaar (3,440m)', time: '11:00 AM', type: 'adventure' },
          { id: 'evr_d2_5', title: 'Explore Namche market & famous German bakeries', time: '5:00 PM', type: 'food' },
        ],
      },
      {
        title: 'Acclimatization Day — Namche',
        activities: [
          { id: 'evr_d3_1', title: 'Hike to Everest View Hotel (3,880m)', time: '8:00 AM', type: 'adventure' },
          { id: 'evr_d3_2', title: 'First views of Mt. Everest, Lhotse & Ama Dablam', time: '10:00 AM', type: 'sightseeing' },
          { id: 'evr_d3_3', title: 'Visit Sherpa Culture Museum', time: '12:00 PM', type: 'sightseeing' },
          { id: 'evr_d3_4', title: 'Namche Monastery exploration', time: '3:30 PM', type: 'sightseeing' },
          { id: 'evr_d3_5', title: 'Rest & hydration — critical acclimatization', time: '6:00 PM', type: 'accommodation' },
        ],
      },
      {
        title: 'Trek to Tengboche',
        activities: [
          { id: 'evr_d4_1', title: 'Depart Namche toward Tengboche', time: '7:30 AM', type: 'adventure' },
          { id: 'evr_d4_2', title: 'Trek via Kyangjuma with Everest views', time: '9:00 AM', type: 'adventure' },
          { id: 'evr_d4_3', title: 'Climb to Tengboche (3,870m)', time: '1:00 PM', type: 'adventure' },
          { id: 'evr_d4_4', title: 'Tengboche Monastery visit (largest in Khumbu)', time: '2:30 PM', type: 'sightseeing' },
          { id: 'evr_d4_5', title: 'Sunset panorama of Everest & Lhotse', time: '5:00 PM', type: 'sightseeing' },
        ],
      },
      {
        title: 'Trek to Dingboche',
        activities: [
          { id: 'evr_d5_1', title: 'Morning prayer flags ceremony at monastery', time: '6:00 AM', type: 'sightseeing' },
          { id: 'evr_d5_2', title: 'Trek via Pangboche to Dingboche (4,410m)', time: '8:00 AM', type: 'adventure' },
          { id: 'evr_d5_3', title: 'Visit oldest monastery in Khumbu — Pangboche', time: '10:30 AM', type: 'sightseeing' },
          { id: 'evr_d5_4', title: 'Arrive Dingboche — rest & altitude adjustment', time: '3:30 PM', type: 'accommodation' },
          { id: 'evr_d5_5', title: 'Evening tea & yak herder stories at lodge', time: '6:00 PM', type: 'food' },
        ],
      },
    ],
  },

  chitwan: {
    label: 'Chitwan',
    dayTemplates: [
      {
        title: 'Arrival & Elephant Bathing',
        activities: [
          { id: 'cht_d1_1', title: 'Arrive Bharatpur / Chitwan', time: '10:00 AM', type: 'transport' },
          { id: 'cht_d1_2', title: 'Check in to jungle resort', time: '12:00 PM', type: 'accommodation' },
          { id: 'cht_d1_3', title: 'Elephant bathing experience', time: '2:00 PM', type: 'adventure' },
          { id: 'cht_d1_4', title: 'Tharu cultural dance performance', time: '7:00 PM', type: 'sightseeing' },
          { id: 'cht_d1_5', title: 'Campfire dinner by the river', time: '8:00 PM', type: 'food' },
        ],
      },
      {
        title: 'Jungle Safari & Canoe Ride',
        activities: [
          { id: 'cht_d2_1', title: 'Early morning bird watching walk', time: '6:00 AM', type: 'adventure' },
          { id: 'cht_d2_2', title: 'Jeep safari in Chitwan National Park', time: '10:00 AM', type: 'adventure' },
          { id: 'cht_d2_3', title: 'Spot rhinos, deer & exotic birds', time: '11:00 AM', type: 'sightseeing' },
          { id: 'cht_d2_4', title: 'Canoe ride on Rapti River', time: '3:00 PM', type: 'adventure' },
          { id: 'cht_d2_5', title: 'Crocodile spotting from canoe', time: '4:30 PM', type: 'sightseeing' },
        ],
      },
      {
        title: 'Tiger Trail & Elephant Safari',
        activities: [
          { id: 'cht_d3_1', title: 'Early jungle walk — tiger tracking with naturalist', time: '5:30 AM', type: 'adventure' },
          { id: 'cht_d3_2', title: 'Elephant safari into deep jungle', time: '11:00 AM', type: 'adventure' },
          { id: 'cht_d3_3', title: 'Visit Elephant Breeding Centre', time: '2:30 PM', type: 'sightseeing' },
          { id: 'cht_d3_4', title: 'Sunset at Rapti riverbank', time: '5:00 PM', type: 'sightseeing' },
          { id: 'cht_d3_5', title: 'Farewell bonfire dinner', time: '7:30 PM', type: 'food' },
        ],
      },
    ],
  },

  lumbini: {
    label: 'Lumbini',
    dayTemplates: [
      {
        title: 'Sacred Garden & Maya Devi Temple',
        activities: [
          { id: 'lmb_d1_1', title: 'Arrive Lumbini', time: '9:00 AM', type: 'transport' },
          { id: 'lmb_d1_2', title: 'Maya Devi Temple — birthplace of Lord Buddha', time: '10:00 AM', type: 'sightseeing' },
          { id: 'lmb_d1_3', title: 'Sacred Pond (Puskarini) where Buddha was bathed', time: '11:30 AM', type: 'sightseeing' },
          { id: 'lmb_d1_4', title: 'Ashoka Pillar (250 BC)', time: '12:30 PM', type: 'sightseeing' },
          { id: 'lmb_d1_5', title: 'Evening meditation by the sacred pond', time: '5:00 PM', type: 'adventure' },
        ],
      },
      {
        title: 'International Monasteries Tour',
        activities: [
          { id: 'lmb_d2_1', title: 'Chinese Buddhist Monastery', time: '8:00 AM', type: 'sightseeing' },
          { id: 'lmb_d2_2', title: 'Japanese Peace Pagoda', time: '9:30 AM', type: 'sightseeing' },
          { id: 'lmb_d2_3', title: 'Korean & Vietnamese Temples', time: '11:00 AM', type: 'sightseeing' },
          { id: 'lmb_d2_4', title: 'Myanmar Golden Temple', time: '2:30 PM', type: 'sightseeing' },
          { id: 'lmb_d2_5', title: 'Sunset candle ceremony at the sacred garden', time: '6:00 PM', type: 'adventure' },
        ],
      },
    ],
  },

  annapurna: {
    label: 'Annapurna Circuit',
    dayTemplates: [
      {
        title: 'Arrive Besisahar & Trek to Bhulbhule',
        activities: [
          { id: 'ann_d1_1', title: 'Drive from Kathmandu to Besisahar', time: '7:00 AM', type: 'transport' },
          { id: 'ann_d1_2', title: 'Trek start — Besisahar to Bhulbhule (840m)', time: '1:00 PM', type: 'adventure' },
          { id: 'ann_d1_3', title: 'Evening at Bhulbhule tea house', time: '5:00 PM', type: 'accommodation' },
        ],
      },
      {
        title: 'Trek to Jagat via Ngadi',
        activities: [
          { id: 'ann_d2_1', title: 'Trek Bhulbhule to Ngadi', time: '7:30 AM', type: 'adventure' },
          { id: 'ann_d2_2', title: 'Cross steel bridges over Marsyangdi River', time: '10:00 AM', type: 'adventure' },
          { id: 'ann_d2_3', title: 'Arrive Jagat — lunch & rest', time: '1:00 PM', type: 'food' },
          { id: 'ann_d2_4', title: 'Evening river views from Jagat', time: '5:00 PM', type: 'sightseeing' },
        ],
      },
      {
        title: 'Trek to Chame',
        activities: [
          { id: 'ann_d3_1', title: 'Trek through deep gorge to Dharapani', time: '7:30 AM', type: 'adventure' },
          { id: 'ann_d3_2', title: 'Continue to Chame (2,670m)', time: '12:00 PM', type: 'adventure' },
          { id: 'ann_d3_3', title: 'First views of Annapurna II', time: '3:00 PM', type: 'sightseeing' },
          { id: 'ann_d3_4', title: 'Hot spring bath at Chame', time: '5:00 PM', type: 'adventure' },
        ],
      },
      {
        title: 'Trek to Pisang via Upper Pisang',
        activities: [
          { id: 'ann_d4_1', title: 'Trek past spectacular curved rock wall', time: '7:30 AM', type: 'adventure' },
          { id: 'ann_d4_2', title: 'Upper Pisang hike for acclimatization', time: '11:00 AM', type: 'adventure' },
          { id: 'ann_d4_3', title: 'Pisang Monastery with Annapurna IV views', time: '2:00 PM', type: 'sightseeing' },
          { id: 'ann_d4_4', title: 'Overnight Lower Pisang (3,200m)', time: '5:00 PM', type: 'accommodation' },
        ],
      },
      {
        title: 'Trek to Manang',
        activities: [
          { id: 'ann_d5_1', title: 'Trek to Manang (3,500m) via Humde', time: '8:00 AM', type: 'adventure' },
          { id: 'ann_d5_2', title: 'Visit Gangapurna Lake', time: '2:00 PM', type: 'sightseeing' },
          { id: 'ann_d5_3', title: 'Altitude Medicine Talk at Himalayan Rescue', time: '4:00 PM', type: 'sightseeing' },
          { id: 'ann_d5_4', title: 'Acclimatization rest — Manang village walk', time: '6:00 PM', type: 'adventure' },
        ],
      },
    ],
  },
};

// ─── Budget estimates per day in NPR by destination ───
const BUDGET_RATES = {
  pokhara:   { hotel: 2500,  food: 800,  transport: 600,  activities: 1200 },
  kathmandu: { hotel: 3000,  food: 1000, transport: 800,  activities: 1500 },
  everest:   { hotel: 2000,  food: 1500, transport: 5000, activities: 2000 },
  chitwan:   { hotel: 3500,  food: 1200, transport: 1000, activities: 1800 },
  lumbini:   { hotel: 1500,  food: 600,  transport: 500,  activities: 500  },
  annapurna: { hotel: 1800,  food: 1200, transport: 4000, activities: 1500 },
};

/**
 * Generate a day-by-day plan for a given destination and number of days.
 * Cycles through templates if days > available templates.
 */
const generatePlan = (destination, days) => {
  const key  = (destination || '').toLowerCase().replace(/\s+/g, '');
  const data = ITINERARY_DATA[key] || ITINERARY_DATA.kathmandu;
  const templates = data.dayTemplates;
  const plan = [];
  for (let i = 0; i < days; i++) {
    const tpl = templates[i % templates.length];
    plan.push({
      day: i + 1,
      title: tpl.title,
      activities: tpl.activities.map(act => ({
        ...act,
        id: `${act.id}_day${i + 1}_${Date.now()}`,
      })),
    });
  }
  return plan;
};

/**
 * Return estimated budget breakdown for a destination + days combo.
 */
const estimateBudget = (destination, days) => {
  const key   = (destination || '').toLowerCase().replace(/\s+/g, '');
  const rates = BUDGET_RATES[key] || BUDGET_RATES.kathmandu;
  return {
    hotel:      rates.hotel * days,
    food:       rates.food * days,
    transport:  rates.transport,
    activities: rates.activities * days,
    total:      rates.hotel * days + rates.food * days + rates.transport + rates.activities * days,
  };
};

module.exports = { ITINERARY_DATA, BUDGET_RATES, generatePlan, estimateBudget };
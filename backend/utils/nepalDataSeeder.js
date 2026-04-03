const mongoose = require('mongoose');
const Destination = require('../models/destination');
const TravelPackage = require('../models/TravelPackage');
const Hotel = require('../models/Hotel');

const nepalDestinations = [
  {
    name: 'Everest Base Camp',
    location: 'Solukhumbu District',
    district: 'Solukhumbu',
    province: 'Province 1',
    description: 'The ultimate trekking destination in Nepal, offering breathtaking views of the world\'s highest mountain. A challenging trek through Sherpa villages, ancient monasteries, and stunning Himalayan landscapes.',
    shortDescription: 'Trek to the base of Mount Everest through stunning Himalayan landscapes',
    altitude: 5364,
    bestTimeToVisit: 'March-May, September-November',
    population: 5000,
    area: 1350,
    category: 'Mountain',
    subcategories: ['Trekking', 'Mountain Climbing', 'Cultural Tours'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/everest-base-camp-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/everest-base-camp-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/everest-base-camp-main.jpg',
    travelTime: {
      byRoad: '8 hours drive from Kathmandu',
      byAir: '35 minutes flight to Lukla'
    },
    entryFee: 0,
    attractions: [
      {
        name: 'Everest Base Camp',
        description: 'The base camp of Mount Everest at 5,364m',
        type: 'Viewpoint',
        entryFee: 0
      },
      {
        name: 'Kala Patthar',
        description: 'Best viewpoint for Everest sunrise at 5,643m',
        type: 'Viewpoint',
        entryFee: 0
      },
      {
        name: 'Tengboche Monastery',
        description: 'Ancient Buddhist monastery with mountain views',
        type: 'Temple',
        entryFee: 0
      }
    ],
    activities: [
      {
        name: 'Everest Base Camp Trek',
        description: '14-day trek to Everest Base Camp',
        duration: '14 days',
        difficulty: 'Challenging',
        bestSeason: 'March-May, September-November',
        price: 1800
      },
      {
        name: 'Everest View Helicopter Tour',
        description: 'Aerial views of Everest and surrounding peaks',
        duration: '4 hours',
        difficulty: 'Easy',
        bestSeason: 'Year-round',
        price: 650
      }
    ],
    accommodation: {
      budget: true,
      midRange: true,
      luxury: false
    },
    transport: {
      bus: false,
      flight: true,
      jeep: false,
      trekking: true
    },
    coordinates: {
      latitude: 28.0050,
      longitude: 86.8526
    },
    isActive: true,
    isPopular: true,
    featured: true,
    seoTitle: 'Everest Base Camp Trek - Nepal | Ultimate Himalayan Adventure',
    seoDescription: 'Experience the world\'s highest trek to Everest Base Camp. 14-day adventure through Sherpa villages, monasteries, and breathtaking mountain views.',
    keywords: ['Everest Base Camp', 'Nepal Trekking', 'Mount Everest', 'Himalayan Trek', 'Sherpa Culture']
  },
  {
    name: 'Pokhara',
    location: 'Pokhara Valley',
    district: 'Kaski',
    province: 'Gandaki',
    description: 'Often called the "City of Lakes," Pokhara is a paradise for nature lovers, adventure seekers, and those seeking peace. Surrounded by mountains, lakes, and lush greenery, it offers boating, paragliding, trekking, and mountain flight experiences.',
    shortDescription: 'Gateway to the Annapurna region with lakes, mountains, and adventure activities',
    altitude: 822,
    bestTimeToVisit: 'October-December, March-May',
    population: 350000,
    area: 464,
    category: 'City',
    subcategories: ['Adventure Sports', 'Lake Tours', 'Mountain Views', 'Cultural Sites'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/pokhara-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/pokhara-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/pokhara-main.jpg',
    travelTime: {
      byRoad: '7 hours from Kathmandu',
      byAir: '25 minutes flight'
    },
    entryFee: 0,
    attractions: [
      {
        name: 'Phewa Lake',
        description: 'Largest lake in Pokhara with Tal Barahi Temple',
        type: 'Lake',
        entryFee: 0
      },
      {
        name: 'Sarangkot',
        description: 'Sunrise viewpoint over Annapurna range',
        type: 'Viewpoint',
        entryFee: 0
      },
      {
        name: 'Davis Fall',
        description: 'Beautiful waterfall and underground cave system',
        type: 'Waterfall',
        entryFee: 500
      }
    ],
    activities: [
      {
        name: 'Paragliding',
        description: 'Tandem paragliding with mountain views',
        duration: '30 minutes',
        difficulty: 'Easy',
        bestSeason: 'October-May',
        price: 85
      },
      {
        name: 'Mountain Flight',
        description: 'Scenic flight over Everest and other peaks',
        duration: '1 hour',
        difficulty: 'Easy',
        bestSeason: 'Year-round',
        price: 175
      },
      {
        name: 'Pokhara Valley Trek',
        description: 'Easy trek around Pokhara with cultural insights',
        duration: '3-5 days',
        difficulty: 'Easy',
        bestSeason: 'October-April',
        price: 350
      }
    ],
    accommodation: {
      budget: true,
      midRange: true,
      luxury: true
    },
    transport: {
      bus: true,
      flight: true,
      jeep: true,
      trekking: true
    },
    coordinates: {
      latitude: 28.2096,
      longitude: 83.9856
    },
    isActive: true,
    isPopular: true,
    featured: true,
    seoTitle: 'Pokhara Nepal - Lakes, Mountains & Adventure | Travel Guide',
    seoDescription: 'Discover Pokhara, Nepal\'s adventure capital. Paragliding, boating, trekking, and stunning views of the Annapurna mountains.',
    keywords: ['Pokhara', 'Nepal Lakes', 'Annapurna', 'Paragliding', 'Mountain Flight']
  },
  {
    name: 'Kathmandu',
    location: 'Kathmandu Valley',
    district: 'Kathmandu',
    province: 'Bagmati',
    description: 'The vibrant capital city of Nepal, Kathmandu is a fascinating blend of ancient traditions and modern life. Home to UNESCO World Heritage sites, bustling markets, and rich cultural heritage.',
    shortDescription: 'Ancient capital city with UNESCO heritage sites, temples, and vibrant culture',
    altitude: 1400,
    bestTimeToVisit: 'October-December, March-May',
    population: 1000000,
    area: 395,
    category: 'City',
    subcategories: ['Cultural Tours', 'Temple Visits', 'City Exploration', 'Shopping'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/kathmandu-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/kathmandu-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/kathmandu-main.jpg',
    travelTime: {
      byRoad: 'N/A',
      byAir: 'N/A (Starting point)'
    },
    entryFee: 0,
    attractions: [
      {
        name: 'Swayambhunath (Monkey Temple)',
        description: 'Ancient Buddhist stupa with panoramic city views',
        type: 'Temple',
        entryFee: 200
      },
      {
        name: 'Pashupatinath Temple',
        description: 'Hindu temple complex and cremation site',
        type: 'Temple',
        entryFee: 1000
      },
      {
        name: 'Bhaktapur Durbar Square',
        description: 'Medieval palace square with intricate architecture',
        type: 'Cultural Site',
        entryFee: 1500
      }
    ],
    activities: [
      {
        name: 'Kathmandu Heritage Walk',
        description: 'Guided walking tour of historic sites',
        duration: '4 hours',
        difficulty: 'Easy',
        bestSeason: 'Year-round',
        price: 25
      },
      {
        name: 'Bhaktapur Cultural Tour',
        description: 'Explore medieval city and local culture',
        duration: '6 hours',
        difficulty: 'Easy',
        bestSeason: 'Year-round',
        price: 45
      }
    ],
    accommodation: {
      budget: true,
      midRange: true,
      luxury: true
    },
    transport: {
      bus: true,
      flight: true,
      jeep: true,
      trekking: false
    },
    coordinates: {
      latitude: 27.7172,
      longitude: 85.3240
    },
    isActive: true,
    isPopular: true,
    featured: true,
    seoTitle: 'Kathmandu Nepal - Ancient Capital & Cultural Heritage | Travel Guide',
    seoDescription: 'Explore Kathmandu, Nepal\'s ancient capital. UNESCO heritage sites, temples, palaces, and vibrant culture await you.',
    keywords: ['Kathmandu', 'Nepal Capital', 'UNESCO Heritage', 'Temples', 'Culture']
  },
  {
    name: 'Chitwan National Park',
    location: 'Chitwan District',
    district: 'Chitwan',
    province: 'Bagmati',
    description: 'Nepal\'s first national park offers incredible wildlife experiences. Home to Bengal tigers, one-horned rhinoceros, elephants, and diverse bird species. A perfect blend of jungle safari and cultural immersion.',
    shortDescription: 'Wildlife sanctuary with tigers, rhinos, elephants, and jungle safaris',
    altitude: 150,
    bestTimeToVisit: 'October-April',
    population: 50000,
    area: 952,
    category: 'National Park',
    subcategories: ['Wildlife Safari', 'Jungle Walks', 'Elephant Riding', 'Bird Watching'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/chitwan-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/chitwan-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/chitwan-main.jpg',
    travelTime: {
      byRoad: '6 hours from Kathmandu',
      byAir: '20 minutes flight'
    },
    entryFee: 1500,
    attractions: [
      {
        name: 'Elephant Breeding Centre',
        description: 'Home to over 100 elephants and breeding program',
        type: 'Wildlife Centre',
        entryFee: 200
      },
      {
        name: 'Rapti River',
        description: 'River safari and crocodile viewing',
        type: 'River',
        entryFee: 500
      },
      {
        name: 'Tharu Cultural Village',
        description: 'Traditional Tharu village and cultural performances',
        type: 'Cultural Site',
        entryFee: 300
      }
    ],
    activities: [
      {
        name: 'Jungle Safari',
        description: 'Jeep safari to spot tigers and rhinos',
        duration: '4 hours',
        difficulty: 'Easy',
        bestSeason: 'October-April',
        price: 85
      },
      {
        name: 'Elephant Back Safari',
        description: 'Traditional elephant riding through the jungle',
        duration: '1 hour',
        difficulty: 'Easy',
        bestSeason: 'October-April',
        price: 35
      },
      {
        name: 'Canoe Trip',
        description: 'Boat ride on Rapti River',
        duration: '1 hour',
        difficulty: 'Easy',
        bestSeason: 'October-April',
        price: 20
      }
    ],
    accommodation: {
      budget: true,
      midRange: true,
      luxury: true
    },
    transport: {
      bus: true,
      flight: true,
      jeep: true,
      trekking: false
    },
    coordinates: {
      latitude: 27.5330,
      longitude: 84.4500
    },
    isActive: true,
    isPopular: true,
    featured: true,
    seoTitle: 'Chitwan National Park Nepal - Wildlife Safari & Jungle Adventure',
    seoDescription: 'Experience Nepal\'s premier wildlife destination. Spot tigers, rhinos, elephants, and enjoy jungle safaris in Chitwan National Park.',
    keywords: ['Chitwan National Park', 'Nepal Wildlife', 'Jungle Safari', 'Tiger', 'Rhino']
  },
  {
    name: 'Annapurna Base Camp',
    location: 'Annapurna Conservation Area',
    district: 'Kaski',
    province: 'Gandaki',
    description: 'A moderate trekking route offering stunning views of the Annapurna mountain range. Perfect for trekkers seeking spectacular scenery without extreme altitude challenges.',
    shortDescription: 'Popular moderate trek with breathtaking Annapurna mountain views',
    altitude: 4130,
    bestTimeToVisit: 'March-May, September-November',
    population: 2000,
    area: 7629,
    category: 'Mountain',
    subcategories: ['Trekking', 'Mountain Views', 'Cultural Tours', 'Photography'],
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/annapurna-base-camp-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/annapurna-base-camp-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/destinations/annapurna-base-camp-main.jpg',
    travelTime: {
      byRoad: '7 hours from Pokhara',
      byAir: '25 minutes flight to Pokhara'
    },
    entryFee: 0,
    attractions: [
      {
        name: 'Annapurna Base Camp',
        description: 'Base camp viewpoint at 4,130m',
        type: 'Viewpoint',
        entryFee: 0
      },
      {
        name: 'Machhapuchhre Base Camp',
        description: 'Views of the sacred "Fish Tail" mountain',
        type: 'Viewpoint',
        entryFee: 0
      },
      {
        name: 'Ghandruk Village',
        description: 'Traditional Gurung village with culture',
        type: 'Village',
        entryFee: 0
      }
    ],
    activities: [
      {
        name: 'Annapurna Base Camp Trek',
        description: '7-10 day trek through Annapurna region',
        duration: '7-10 days',
        difficulty: 'Moderate',
        bestSeason: 'March-May, September-November',
        price: 850
      },
      {
        name: 'Poon Hill Sunrise Trek',
        description: 'Popular day trek to panoramic viewpoints',
        duration: '1-2 days',
        difficulty: 'Moderate',
        bestSeason: 'Year-round',
        price: 150
      }
    ],
    accommodation: {
      budget: true,
      midRange: true,
      luxury: false
    },
    transport: {
      bus: true,
      flight: true,
      jeep: true,
      trekking: true
    },
    coordinates: {
      latitude: 28.5167,
      longitude: 83.8833
    },
    isActive: true,
    isPopular: true,
    featured: true,
    seoTitle: 'Annapurna Base Camp Trek Nepal - Mountain Views & Adventure',
    seoDescription: 'Trek to Annapurna Base Camp for breathtaking mountain views. Moderate trek through diverse landscapes and Gurung villages.',
    keywords: ['Annapurna Base Camp', 'Nepal Trekking', 'Mountain Views', 'Gurung Culture']
  }
];

const nepalHotels = [
  {
    name: 'Temple Tree Resort & Spa',
    location: 'Pokhara',
    address: 'Lake Side, Pokhara, Nepal',
    description: 'Luxury resort nestled on the shores of Phewa Lake with stunning mountain views. Traditional Nepali architecture blended with modern comfort.',
    pricePerNight: 180,
    starRating: 4,
    amenities: ['Free WiFi', 'Restaurant', 'Spa', 'Fitness Center', 'Swimming Pool', 'Lake View', 'Room Service', '24/7 Reception', 'Traditional Nepali Architecture', 'Garden'],
    roomTypes: [
      { type: 'Deluxe Lake View', capacity: 2, price: 220 },
      { type: 'Suite with Mountain View', capacity: 4, price: 350 },
      { type: 'Garden Villa', capacity: 6, price: 500 }
    ],
    contact: {
      phone: '+977-61-465555',
      email: 'reservations@templetree.com.np'
    },
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/temple-tree-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/temple-tree-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/temple-tree-main.jpg',
    isActive: true,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    policies: {
      cancellation: 'Free cancellation up to 48 hours before check-in',
      pets: false,
      smoking: false
    },
    destination: null, // Will be set after destinations are created
    rating: 4.5,
    totalReviews: 1250
  },
  {
    name: 'Kathmandu Marriott Hotel',
    location: 'Kathmandu',
    address: 'Taragaon, Boudha, Kathmandu',
    description: 'Modern luxury hotel in the heart of Kathmandu with contemporary design and exceptional service. Walking distance to Boudhanath Stupa.',
    pricePerNight: 220,
    starRating: 5,
    amenities: ['Free WiFi', 'Restaurant', 'Spa', 'Fitness Center', 'Swimming Pool', 'Room Service', '24/7 Reception', 'Business Center', 'Airport Shuttle', 'Laundry Service'],
    roomTypes: [
      { type: 'Deluxe Room', capacity: 2, price: 250 },
      { type: 'Executive Suite', capacity: 2, price: 400 },
      { type: 'Presidential Suite', capacity: 4, price: 800 }
    ],
    contact: {
      phone: '+977-1-4160060',
      email: 'reservations@kathmandumarriott.com'
    },
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/kathmandu-marriott-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/kathmandu-marriott-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/kathmandu-marriott-main.jpg',
    isActive: true,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    policies: {
      cancellation: 'Free cancellation up to 24 hours before check-in',
      pets: true,
      smoking: false
    },
    destination: null,
    rating: 4.7,
    totalReviews: 2100
  },
  {
    name: 'Everest View Hotel',
    location: 'Solukhumbu',
    address: 'Namche Bazaar, Solukhumbu',
    description: 'Cozy hotel in Namche Bazaar offering stunning Everest views. Perfect base for Everest trekkers with warm hospitality and mountain ambiance.',
    pricePerNight: 85,
    starRating: 3,
    amenities: ['Free WiFi', 'Restaurant', 'Hot Water', '24/7 Reception', 'Mountain View', 'Trekking Support', 'Laundry Service', 'Generator Backup'],
    roomTypes: [
      { type: 'Standard Room', capacity: 2, price: 85 },
      { type: 'Deluxe with View', capacity: 2, price: 120 },
      { type: 'Family Room', capacity: 4, price: 180 }
    ],
    contact: {
      phone: '+977-38-540001',
      email: 'info@everestviewhotel.com'
    },
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/everest-view-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/everest-view-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/everest-view-main.jpg',
    isActive: true,
    checkInTime: '13:00',
    checkOutTime: '11:00',
    policies: {
      cancellation: 'Free cancellation up to 72 hours before check-in',
      pets: false,
      smoking: false
    },
    destination: null,
    rating: 4.2,
    totalReviews: 450
  },
  {
    name: 'Chitwan Jungle Lodge',
    location: 'Chitwan',
    address: 'Sauraha, Chitwan National Park',
    description: 'Eco-friendly lodge in Chitwan offering authentic jungle experience. Traditional Tharu architecture with modern comforts and wildlife viewing.',
    pricePerNight: 120,
    starRating: 4,
    amenities: ['Free WiFi', 'Restaurant', 'Swimming Pool', 'Wildlife Viewing', 'Cultural Programs', '24/7 Reception', 'Laundry Service', 'Garden', 'Traditional Architecture'],
    roomTypes: [
      { type: 'Standard Jungle View', capacity: 2, price: 120 },
      { type: 'Deluxe with Balcony', capacity: 2, price: 160 },
      { type: 'Family Suite', capacity: 6, price: 280 }
    ],
    contact: {
      phone: '+977-56-580001',
      email: 'reservations@chitwanjunglelodge.com'
    },
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/chitwan-lodge-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/chitwan-lodge-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/hotels/chitwan-lodge-main.jpg',
    isActive: true,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    policies: {
      cancellation: 'Free cancellation up to 48 hours before check-in',
      pets: false,
      smoking: false
    },
    destination: null,
    rating: 4.4,
    totalReviews: 890
  }
];

const nepalPackages = [
  {
    name: 'Everest Base Camp Adventure',
    description: 'Experience the ultimate Himalayan trek to Everest Base Camp. Journey through Sherpa villages, ancient monasteries, and breathtaking mountain landscapes over 14 unforgettable days.',
    duration: 14,
    price: 2200,
    destinations: [], // Will be populated with destination IDs
    includes: {
      accommodation: true,
      meals: 'Breakfast, Lunch, Dinner',
      transport: true,
      guide: true,
      activities: ['Mountain Trekking', 'Cultural Tours', 'Temple Visits', 'Mountain Climbing']
    },
    maxGroupSize: 12,
    difficulty: 'Challenging',
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/everest-bec-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/everest-bec-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/everest-bec-main.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Kathmandu',
        description: 'Welcome to Nepal! Transfer to hotel, rest and acclimatization. Evening cultural show.',
        activities: ['Airport pickup', 'Hotel check-in', 'Cultural dinner']
      },
      {
        day: 2,
        title: 'Kathmandu Sightseeing',
        description: 'Explore UNESCO World Heritage sites including Swayambhunath, Pashupatinath, and Boudhanath.',
        activities: ['Temple visits', 'Cultural exploration', 'Mountain views']
      },
      {
        day: 3,
        title: 'Fly to Lukla, Trek to Phakding',
        description: 'Early morning flight to Lukla (2,800m), start trekking to Phakding (2,610m).',
        activities: ['Mountain flight', 'Trek briefing', 'Acclimatization walk']
      },
      {
        day: 4,
        title: 'Trek to Namche Bazaar',
        description: 'Continue trek to Namche Bazaar (3,440m), the gateway to Everest region.',
        activities: ['Mountain views', 'Sherpa culture', 'Market exploration']
      },
      {
        day: 5,
        title: 'Acclimatization Day in Namche',
        description: 'Rest day for acclimatization. Visit local monasteries and enjoy views.',
        activities: ['Monastery visits', 'Photography', 'Local culture']
      },
      {
        day: 6,
        title: 'Trek to Tengboche',
        description: 'Trek to Tengboche Monastery (3,867m) with stunning Everest views.',
        activities: ['Monastery visit', 'Mountain panorama', 'Prayer ceremonies']
      },
      {
        day: 7,
        title: 'Trek to Dingboche',
        description: 'Continue to Dingboche (4,360m) with views of Ama Dablam and Island Peak.',
        activities: ['High altitude trek', 'Peak identification', 'Yak herding culture']
      },
      {
        day: 8,
        title: 'Acclimatization in Dingboche',
        description: 'Rest and acclimatize. Short hike to Nagarjuna Hill for better views.',
        activities: ['Acclimatization hike', 'Peak photography', 'Rest and recovery']
      },
      {
        day: 9,
        title: 'Trek to Lobuche',
        description: 'Challenging trek to Lobuche (4,910m) through Khumbu Glacier.',
        activities: ['Glacier crossing', 'Memorial stones', 'High altitude experience']
      },
      {
        day: 10,
        title: 'Trek to Gorakshep, Everest Base Camp',
        description: 'Final push to Gorakshep (5,164m) then Everest Base Camp (5,364m).',
        activities: ['Everest Base Camp', 'Khumbu Icefall views', 'Summit celebration']
      },
      {
        day: 11,
        title: 'Kala Patthar Sunrise, Trek to Pheriche',
        description: 'Early morning hike to Kala Patthar (5,643m) for sunrise over Everest, then descend to Pheriche.',
        activities: ['Sunrise over Everest', '360° mountain panorama', 'Descent trek']
      },
      {
        day: 12,
        title: 'Trek to Namche Bazaar',
        description: 'Long descent day back to Namche Bazaar.',
        activities: ['Forest trails', 'Sherpa villages', 'Cultural interaction']
      },
      {
        day: 13,
        title: 'Trek to Lukla',
        description: 'Final trek day back to Lukla airport.',
        activities: ['Final mountain views', 'Trek completion', 'Celebration dinner']
      },
      {
        day: 14,
        title: 'Fly to Kathmandu, Departure',
        description: 'Morning flight back to Kathmandu. Free time for shopping or rest before departure.',
        activities: ['Mountain flight', 'Shopping', 'Airport transfer']
      }
    ],
    hotel: null, // Will be set to a hotel ID
    rating: 4.8,
    totalReviews: 234,
    isActive: true,
    availableFrom: new Date('2025-03-01'),
    availableTo: new Date('2025-05-31'),
    addedBy: null // Will be set to admin user ID
  },
  {
    name: 'Pokhara Adventure Package',
    description: 'Experience Pokhara\'s natural beauty and adventure activities. Paragliding, boating, mountain flights, and cultural exploration in Nepal\'s adventure capital.',
    duration: 5,
    price: 650,
    destinations: [], // Will be populated
    includes: {
      accommodation: true,
      meals: 'Breakfast, Dinner',
      transport: true,
      guide: true,
      activities: ['Paragliding', 'Mountain Biking', 'Lake Tours', 'Mountain Flight', 'Cultural Tours']
    },
    maxGroupSize: 8,
    difficulty: 'Easy',
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/pokhara-adventure-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/pokhara-adventure-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/pokhara-adventure-main.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Pokhara',
        description: 'Welcome to Pokhara! Transfer to lakeside resort with stunning mountain views.',
        activities: ['Airport pickup', 'Lake view accommodation', 'Welcome dinner']
      },
      {
        day: 2,
        title: 'Pokhara Sightseeing & Boating',
        description: 'Explore Phewa Lake, visit Tal Barahi Temple, and enjoy lake boating. Visit Davis Fall and Seti Gorge.',
        activities: ['Lake boating', 'Temple visits', 'Waterfall exploration', 'Cultural insights']
      },
      {
        day: 3,
        title: 'Paragliding & Mountain Views',
        description: 'Morning paragliding experience with panoramic mountain views. Afternoon visit to Sarangkot for sunset.',
        activities: ['Paragliding', 'Mountain views', 'Photography', 'Adrenaline rush']
      },
      {
        day: 4,
        title: 'Mountain Flight & Adventure',
        description: 'Early morning mountain flight over Everest and Annapurna. Afternoon mountain biking or optional rafting.',
        activities: ['Mountain flight', 'Peak identification', 'Adventure sports', 'Nature exploration']
      },
      {
        day: 5,
        title: 'Cultural Experience & Departure',
        description: 'Visit traditional Gurung villages, experience local culture. Transfer to airport for departure.',
        activities: ['Cultural immersion', 'Village visit', 'Traditional dance', 'Airport transfer']
      }
    ],
    hotel: null,
    rating: 4.6,
    totalReviews: 189,
    isActive: true,
    availableFrom: new Date('2025-01-01'),
    availableTo: new Date('2025-12-31'),
    addedBy: null
  },
  {
    name: 'Kathmandu Cultural Heritage Tour',
    description: 'Immerse yourself in Nepal\'s rich cultural heritage. Explore ancient temples, palaces, and UNESCO World Heritage sites in the Kathmandu Valley.',
    duration: 4,
    price: 450,
    destinations: [], // Will be populated
    includes: {
      accommodation: true,
      meals: 'Breakfast, Dinner',
      transport: true,
      guide: true,
      activities: ['Cultural Tours', 'Temple Visits', 'Palace Exploration', 'Museum Visits', 'Cooking Classes']
    },
    maxGroupSize: 15,
    difficulty: 'Easy',
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/kathmandu-cultural-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/kathmandu-cultural-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/kathmandu-cultural-main.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Kathmandu Introduction',
        description: 'Welcome to Nepal! Airport pickup and transfer to hotel. Evening walk around Thamel.',
        activities: ['Airport welcome', 'City orientation', 'Cultural dinner']
      },
      {
        day: 2,
        title: 'Kathmandu Heritage Sites',
        description: 'Explore Swayambhunath (Monkey Temple), Boudhanath Stupa, and Kopan Monastery.',
        activities: ['UNESCO sites', 'Buddhist monasteries', 'Mountain views', 'Cultural insights']
      },
      {
        day: 3,
        title: 'Bhaktapur & Patan Exploration',
        description: 'Day trip to Bhaktapur Durbar Square and Patan city. Experience medieval Nepali architecture.',
        activities: ['Durbar squares', 'Traditional architecture', 'Local markets', 'Art galleries']
      },
      {
        day: 4,
        title: 'Pashupatinath & Departure',
        description: 'Visit Pashupatinath Temple and Swayambhunath. Free time for shopping before departure.',
        activities: ['Hindu temple visit', 'Cultural ceremonies', 'Shopping', 'Airport transfer']
      }
    ],
    hotel: null,
    rating: 4.4,
    totalReviews: 156,
    isActive: true,
    availableFrom: new Date('2025-01-01'),
    availableTo: new Date('2025-12-31'),
    addedBy: null
  },
  {
    name: 'Chitwan Wildlife Safari',
    description: 'Experience Nepal\'s premier wildlife destination. Spot tigers, rhinos, elephants, and diverse bird species in Chitwan National Park.',
    duration: 3,
    price: 550,
    destinations: [], // Will be populated
    includes: {
      accommodation: true,
      meals: 'All meals',
      transport: true,
      guide: true,
      activities: ['Jungle Safari', 'Elephant Riding', 'Canoe Trip', 'Wildlife Safari', 'Cultural Programs']
    },
    maxGroupSize: 10,
    difficulty: 'Easy',
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/chitwan-wildlife-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/chitwan-wildlife-2.jpg'
    ],
    mainImage: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nepal-travel/packages/chitwan-wildlife-main.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Chitwan',
        description: 'Welcome to Chitwan! Transfer from Kathmandu to jungle lodge. Afternoon Tharu cultural program.',
        activities: ['Jungle transfer', 'Cultural welcome', 'Tharu dance performance']
      },
      {
        day: 2,
        title: 'Wildlife Exploration',
        description: 'Full day of jungle activities: elephant safari, jeep safari, and canoe ride on Rapti River.',
        activities: ['Elephant back safari', 'Jeep safari', 'Canoe trip', 'Wildlife spotting']
      },
      {
        day: 3,
        title: 'Bird Watching & Departure',
        description: 'Morning bird watching tour. Visit elephant breeding center before departure to Kathmandu.',
        activities: ['Bird watching', 'Elephant center', 'Cultural insights', 'Departure transfer']
      }
    ],
    hotel: null,
    rating: 4.7,
    totalReviews: 203,
    isActive: true,
    availableFrom: new Date('2025-10-01'),
    availableTo: new Date('2026-04-30'),
    addedBy: null
  }
];

async function seedNepalData() {
  try {
    console.log('🌱 Starting Nepal data seeding...');

    // Clear existing data
    await Destination.deleteMany({});
    await Hotel.deleteMany({});
    await TravelPackage.deleteMany({});

    // Seed destinations
    console.log('🏔️ Seeding destinations...');
    const createdDestinations = await Destination.insertMany(nepalDestinations);
    console.log(`✅ Created ${createdDestinations.length} destinations`);

    // Create destination ID map for packages
    const destinationMap = {};
    createdDestinations.forEach(dest => {
      destinationMap[dest.name] = dest._id;
    });

    // Seed hotels with destination references
    console.log('🏨 Seeding hotels...');
    const hotelsWithDestinations = nepalHotels.map(hotel => ({
      ...hotel,
      destination: destinationMap[hotel.location] || null
    }));
    const createdHotels = await Hotel.insertMany(hotelsWithDestinations);
    console.log(`✅ Created ${createdHotels.length} hotels`);

    // Create hotel ID map for packages
    const hotelMap = {};
    createdHotels.forEach(hotel => {
      hotelMap[hotel.name] = hotel._id;
    });

    // Seed packages with destination and hotel references
    console.log('🎒 Seeding travel packages...');
    const packagesWithReferences = nepalPackages.map(pkg => ({
      ...pkg,
      destinations: pkg.destinations.map(destName => destinationMap[destName]).filter(id => id),
      hotel: pkg.hotel ? hotelMap[pkg.hotel] : null
    }));
    const createdPackages = await TravelPackage.insertMany(packagesWithReferences);
    console.log(`✅ Created ${createdPackages.length} travel packages`);

    console.log('🎉 Nepal data seeding completed successfully!');
    console.log(`
📊 Summary:
🏔️ ${createdDestinations.length} destinations
🏨 ${createdHotels.length} hotels
🎒 ${createdPackages.length} travel packages

🌟 Featured content ready for your Nepal Travel platform!
    `);

  } catch (error) {
    console.error('❌ Error seeding Nepal data:', error);
    throw error;
  }
}

module.exports = { seedNepalData };











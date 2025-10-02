// server/populate-heritage-sites.js
// Run this script to populate heritage sites data in MongoDB
// Usage: node populate-heritage-sites.js

const mongoose = require('mongoose');
const HeritageSite = require('./models/HeritageSite');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/geoswipedb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// Sample heritage sites data
const heritageSitesData = [
  {
    name: "Ajanta Caves",
    category: "UNESCO World Heritage",
    year: "2nd century BCE - 480 CE",
    location: {
      coordinates: [75.7033, 20.5522], // [longitude, latitude]
      city: "Ajanta",
      state: "Maharashtra",
      country: "India"
    },
    info: {
      summary: "Ancient Buddhist cave monuments famous for their paintings and sculptures.",
      full: "The Ajanta Caves are approximately 30 rock-cut Buddhist cave monuments dating from the 2nd century BCE to about 480 CE. The caves include paintings and rock-cut sculptures described as among the finest surviving examples of ancient Indian art, particularly expressive painting that present emotion through gesture, pose and form.",
      history: "The caves were built in two phases: the first group was created around the 2nd century BCE during the Satavahana period, while the second group was built during the Vakataka period in the 5th century CE. After the 7th century, the caves were abandoned and forgotten until their rediscovery by British officer John Smith in 1819.",
      architecture: "The caves showcase the evolution of Buddhist architecture and art over several centuries. They feature elaborate facades, intricate sculptures, and world-renowned frescoes that depict various Buddha legends and divinities.",
      significance: "Ajanta Caves represent the golden age of Buddhist art in India and are considered masterpieces of religious art that influenced Buddhist art throughout Asia.",
      visitingTips: [
        "Visit during winter months (October to March) for pleasant weather",
        "Carry a flashlight to better view the cave paintings", 
        "Hire a local guide for detailed historical information",
        "Photography inside caves requires special permission"
      ]
    },
    howToReach: {
      summary: "Located 107 km from Aurangabad, accessible by road via regular bus services and taxis.",
      full: "Ajanta Caves are located in Aurangabad district of Maharashtra. The nearest major city is Aurangabad, which is well connected by air, rail, and road to major Indian cities.",
      byAir: {
        nearestAirport: "Aurangabad Airport (Chikkalthana Airport)",
        distance: "99 km",
        description: "Regular flights from Mumbai, Delhi, and other major cities. From airport, take taxi or bus to Ajanta."
      },
      byRail: {
        nearestStation: "Aurangabad Railway Station",
        distance: "107 km",
        description: "Well connected to Mumbai, Delhi, Hyderabad. From station, take MSRTC bus or taxi to Ajanta."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Mumbai",
            distance: "350 km",
            route: "Mumbai - Nashik - Aurangabad - Ajanta",
            duration: "6-7 hours"
          },
          {
            city: "Pune", 
            distance: "240 km",
            route: "Pune - Ahmednagar - Aurangabad - Ajanta",
            duration: "4-5 hours"
          }
        ],
        localTransport: "Regular MSRTC bus services from Aurangabad bus station. Private taxis and auto-rickshaws also available."
      }
    },
    view360: {
      summary: '360° Street View available.',
      iframeUrl: '', // Will be generated dynamically
      full: 'Experience a 360° Street View of Ajanta Caves.',
      heading: 157.14547735902838,
      pitch: 0
    },
    model3d: {
      summary: '3D model available.',
      url: '/3dmodels/ajanta',
      full: 'Explore the 3D model of Ajanta Caves.',
      sketchfabId: 'd916f1bc949c4284ab3fe56ddbfe660d'
    },    
    media: {
      panorama_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop"
    },
    visitor_info: {
      timings: "9:00 AM to 5:30 PM (Closed on Mondays)",
      entryFee: "₹40 for Indians, ₹600 for foreigners",
      bestTimeToVisit: "October to March",
      duration: "4-5 hours"
    }
  },
  {
    name: "Ellora Caves",
    category: "UNESCO World Heritage", 
    year: "600-1000 CE",
    location: {
      coordinates: [75.1772, 20.0258],
      city: "Ellora",
      state: "Maharashtra",
      country: "India"
    },
    info: {
      summary: "Rock-cut caves representing Buddhist, Hindu and Jain monuments.",
      full: "Ellora is a UNESCO World Heritage Site located in the Aurangabad district of Maharashtra, India. It is one of the largest rock-cut monastery-temple cave complexes in the world, featuring Buddhist, Hindu and Jain monuments and artwork, dating from the 600–1000 CE period.",
      history: "The caves were excavated from basaltic cliffs in the Charanandri hills by Buddhist, Hindu and Jain monks between the 6th and 10th centuries. The site represents the religious harmony that existed in ancient India.",
      architecture: "The complex consists of 34 caves carved out of the vertical face of the Charanandri hills. The most famous is Cave 16, known as Kailash temple, which is considered one of the most remarkable cave temples in India.",
      significance: "Ellora represents the epitome of Indian rock-cut architecture and demonstrates the religious tolerance and artistic achievement of ancient India.",
      visitingTips: [
        "Start early to avoid crowds and heat",
        "Focus on Cave 16 (Kailash Temple) as the highlight",
        "Wear comfortable walking shoes",
        "Carry water and snacks"
      ]
    },
    howToReach: {
      summary: "Located 30 km from Aurangabad, easily accessible by road.",
      full: "Ellora Caves are conveniently located just 30 km from Aurangabad city, making them easily accessible for day trips.",
      byAir: {
        nearestAirport: "Aurangabad Airport",
        distance: "40 km", 
        description: "From airport, take taxi or pre-paid taxi directly to Ellora. Journey takes about 1 hour."
      },
      byRail: {
        nearestStation: "Aurangabad Railway Station",
        distance: "30 km",
        description: "Regular trains from Mumbai, Delhi, Hyderabad. From station, buses and taxis available to Ellora."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Aurangabad",
            distance: "30 km",
            route: "Aurangabad - Ellora Road (NH-211)",
            duration: "45 minutes"
          },
          {
            city: "Mumbai",
            distance: "340 km",
            route: "Mumbai - Nashik - Aurangabad - Ellora", 
            duration: "6 hours"
          }
        ],
        localTransport: "Regular MSRTC buses every 30 minutes from Aurangabad Central Bus Station. Shared jeeps and private taxis also available."
      }
    },
    view360: {
      summary: '360° Street View available.',
      iframeUrl: '',
      full: 'Experience a 360° Street View of Ellora Caves.',
      heading: 150.123456789, // Example heading, adjust as needed
      pitch: 0
    },
    model3d: {
      summary: '3D model available.',
      url: '/3dmodels/ellora',
      full: 'Explore the 3D model of Ellora Caves.',
      sketchfabId: 'a1b2c3d4e5f67890123456789abcdef0' // Example, replace with real ID
    },    
    media: {
      panorama_url: "https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop"
    },
    visitor_info: {
      timings: "6:00 AM to 6:00 PM (Daily)",
      entryFee: "₹40 for Indians, ₹600 for foreigners",
      bestTimeToVisit: "October to March",
      duration: "Full day (6-8 hours)"
    }
  },
  {
    name: "Gateway of India",
    category: "Monument",
    year: "1924",
    location: {
      coordinates: [72.8347, 18.9217],
      city: "Mumbai",
      state: "Maharashtra", 
      country: "India"
    },
    info: {
      summary: "Iconic archway monument built to commemorate the visit of King George V and Queen Mary.",
      full: "The Gateway of India is an arch-monument built in the early 20th century in Mumbai. It was erected to commemorate the landing in December 1911 of King George V and Queen Mary at Apollo Bunder on their visit to India. Built in the Indo-Saracenic architectural style, the monument is 26 metres (85 ft) high.",
      history: "The foundation stone was laid on 31 March 1913 by the Governor of Bombay and the monument was completed in 1924. It served as a ceremonial entrance to British India for important visitors. Ironically, it was also the exit point for the last British troops leaving India in 1948.",
      architecture: "Built in Indo-Saracenic style with influences of Muslim and Gujarati architectural elements. The central dome is 48 feet in diameter and the monument features intricate lattice work.",
      significance: "Symbol of Mumbai and British colonial heritage in India. It's one of the most visited tourist attractions in Mumbai.",
      visitingTips: [
        "Best visited during sunset for photography",
        "Combine with boat ride to Elephanta Caves",
        "Be cautious of pickpockets in crowded areas", 
        "Try local street food from nearby vendors"
      ]
    },
    howToReach: {
      summary: "Located in Colaba, South Mumbai, easily accessible by local trains, buses, and taxis.",
      full: "Gateway of India is situated at Apollo Bunder waterfront in the Colaba district of South Mumbai, making it easily accessible by all modes of transport.",
      byAir: {
        nearestAirport: "Chhatrapati Shivaji Maharaj International Airport",
        distance: "30 km",
        description: "From airport, take taxi, bus, or train. Airport express train connects to Andheri, then local train to Churchgate/CST."
      },
      byRail: {
        nearestStation: "Churchgate Station (Western Line) or CST Station (Central Line)",
        distance: "3 km from both stations",
        description: "Both stations are well connected. From stations, take taxi, bus, or walk to Gateway."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Pune",
            distance: "150 km", 
            route: "Pune - Mumbai Expressway - Eastern Express Highway - Colaba",
            duration: "3 hours"
          },
          {
            city: "Nashik",
            distance: "180 km",
            route: "Nashik - Mumbai Highway - Colaba",
            duration: "4 hours"
          }
        ],
        localTransport: "Local trains to Churchgate/CST, then bus/taxi/walk. BEST buses, Mumbai taxis, and auto-rickshaws available."
      }
    },
    view360: {
      summary: '360° Street View available.',
      iframeUrl: '',
      full: 'Experience a 360° Street View of Gateway of India.',
      heading: 180.987654321, // Example heading, adjust as needed
      pitch: 0
    },
    model3d: {
      summary: '3D model available.',
      url: '/3dmodels/gateway-of-india',
      full: 'Explore the 3D model of Gateway of India.',
      sketchfabId: '1234567890abcdef1234567890abcdef' // Example, replace with real ID
    },    
    media: {
      panorama_url: "https://images.unsplash.com/photo-1595402513890-acbc47954481?w=1200&h=600&fit=crop"
    },
    visitor_info: {
      timings: "24 hours (Open area)",
      entryFee: "Free",
      bestTimeToVisit: "October to March, sunset hours",
      duration: "1-2 hours"
    }
  },

   // Historic Forts
   {
    name: 'Shaniwar Wada',
    category: 'Historic Fort',
    year: '1732',
    location: { 
      coordinates: [73.8553, 18.5196], 
      country: 'India',
      city: 'Pune',
      state: 'Maharashtra'
    },
    info: { 
      summary: 'Historic fort palace of the Peshwas', 
      full: 'Shaniwar Wada is a historic fortification in the city of Pune, India. Built in 1732, it was the seat of the Peshwa rulers of the Maratha Empire until 1818. The fort was the center of Indian politics in the 18th century.',
      history: 'The fort was commissioned by Peshwa Bajirao I and completed in 1732. It served as the political capital of the Maratha Empire and witnessed many important historical events, including the assassination of Narayanrao Peshwa in 1773.',
      architecture: 'The fort features traditional Maratha architecture with massive walls, bastions, and gates. The main structure was built using teak wood and stone, with intricate carvings and traditional Maratha design elements.',
      significance: 'Shaniwar Wada is significant as the center of Maratha power and represents the architectural and cultural heritage of the Maratha Empire. It played a crucial role in Indian history during the 18th century.',
      visitingTips: [
        'Visit during early morning or late afternoon for better lighting',
        'Wear comfortable walking shoes as the fort requires extensive walking',
        'Hire a guide to understand the historical significance',
        'Carry water and sun protection during summer months'
      ]
    },
    howToReach: { 
      summary: 'Easily accessible by road from Pune city center', 
      full: 'Shaniwar Wada is located in the heart of Pune city and is easily accessible by various modes of transportation.',
      byAir: {
        nearestAirport: 'Pune Airport (PNQ)',
        distance: '12 km from the fort',
        description: 'Take a taxi or cab from Pune Airport to Shaniwar Wada. The journey takes about 30-45 minutes depending on traffic.'
      },
      byRail: {
        nearestStation: 'Pune Railway Station',
        distance: '3 km from the fort',
        description: 'From Pune Railway Station, you can take a local bus, auto-rickshaw, or taxi to reach Shaniwar Wada in 15-20 minutes.'
      },
      byRoad: {
        fromMajorCities: [
          {
            city: 'Mumbai',
            distance: '150 km',
            duration: '3-4 hours',
            route: 'Take NH48 via Lonavala and Khandala'
          },
          {
            city: 'Nashik',
            distance: '210 km',
            duration: '4-5 hours',
            route: 'Take NH160 via Ahmednagar'
          }
        ],
        localTransport: 'Auto-rickshaws, buses, and taxis are readily available from anywhere in Pune city to reach Shaniwar Wada.'
      }
    },
    visitor_info: {
      timings: '9:00 AM - 5:30 PM (Closed on Mondays)',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March (winter months)',
      duration: '2-3 hours'
    },
    media: { panorama_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop' }
  },
  {
    name: 'Raigad Fort',
    category: 'Historic Fort',
    year: '1656',
    location: { coordinates: [73.4462, 18.2343], country: 'India' },
    info: { summary: 'Raigad Fort summary', full: 'Raigad Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=1200&h=600&fit=crop' }
  },
  {
    name: 'Janjira Fort',
    category: 'Historic Fort',
    year: '15th century',
    location: { coordinates: [72.9613, 18.3006], country: 'India' },
    info: { summary: 'Janjira Fort summary', full: 'Janjira Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=600&fit=crop' }
  },
  {
    name: 'Sinhagad Fort',
    category: 'Historic Fort',
    year: '2nd century',
    location: { coordinates: [73.7553, 18.3669], country: 'India' },
    info: { summary: 'Sinhagad Fort summary', full: 'Sinhagad Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Pratapgad Fort',
    category: 'Historic Fort',
    year: '1656',
    location: { coordinates: [73.5522, 17.9414], country: 'India' },
    info: { summary: 'Pratapgad Fort summary', full: 'Pratapgad Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Daulatabad Fort',
    category: 'Historic Fort',
    year: '12th century',
    location: { coordinates: [75.2347, 19.9372], country: 'India' },
    info: { summary: 'Daulatabad Fort summary', full: 'Daulatabad Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Torna Fort',
    category: 'Historic Fort',
    year: '13th century',
    location: { coordinates: [73.6028, 18.2144], country: 'India' },
    info: { summary: 'Torna Fort summary', full: 'Torna Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Rajgad Fort',
    category: 'Historic Fort',
    year: '15th century',
    location: { coordinates: [73.6719, 18.2403], country: 'India' },
    info: { summary: 'Rajgad Fort summary', full: 'Rajgad Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Lohagad Fort',
    category: 'Historic Fort',
    year: '18th century',
    location: { coordinates: [73.4850, 18.7108], country: 'India' },
    info: { summary: 'Lohagad Fort summary', full: 'Lohagad Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Vishalgad Fort',
    category: 'Historic Fort',
    year: '12th century',
    location: { coordinates: [74.0231, 16.7719], country: 'India' },
    info: { summary: 'Vishalgad Fort summary', full: 'Vishalgad Fort full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },

 // Monuments
  {
    name: 'Bibi Ka Maqbara',
    category: 'Monument',
    year: '1660',
    location: { coordinates: [75.3204, 19.8974], country: 'India' },
    info: { summary: 'Bibi Ka Maqbara summary', full: 'Bibi Ka Maqbara full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop' }
  },

   // Rock-cut Caves
   {
    name: 'Karla Caves',
    category: 'Rock-cut Cave',
    year: '160 BCE',
    location: { coordinates: [73.4844, 18.7458], country: 'India' },
    info: { summary: 'Karla Caves summary', full: 'Karla Caves full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Bhaja Caves',
    category: 'Rock-cut Cave',
    year: '2nd century BCE',
    location: { coordinates: [73.4850, 18.7317], country: 'India' },
    info: { summary: 'Bhaja Caves summary', full: 'Bhaja Caves full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Bedse Caves',
    category: 'Rock-cut Cave',
    year: '1st century BCE',
    location: { coordinates: [73.5033, 18.7481], country: 'India' },
    info: { summary: 'Bedse Caves summary', full: 'Bedse Caves full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Kanheri Caves',
    category: 'Rock-cut Cave',
    year: '1st century BCE - 10th century CE',
    location: { coordinates: [72.9056, 19.2078], country: 'India' },
    info: { summary: 'Kanheri Caves summary', full: 'Kanheri Caves full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Aurangabad Caves',
    category: 'Rock-cut Cave',
    year: '6th-7th century',
    location: { coordinates: [75.3433, 19.8878], country: 'India' },
    info: { summary: 'Aurangabad Caves summary', full: 'Aurangabad Caves full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Lenyadri Caves',
    category: 'Rock-cut Cave',
    year: '1st-3rd century',
    location: { coordinates: [73.6928, 19.1850], country: 'India' },
    info: { summary: 'Lenyadri Caves summary', full: 'Lenyadri Caves full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },

  // Temples
  {
    name: 'Trimbakeshwar Temple',
    category: 'Temple',
    year: '1755',
    location: { coordinates: [73.5311, 19.9317], country: 'India' },
    info: { summary: 'Trimbakeshwar Temple summary', full: 'Trimbakeshwar Temple full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Shirdi Sai Baba Temple',
    category: 'Temple',
    year: '20th century',
    location: { coordinates: [74.4769, 19.7669], country: 'India' },
    info: { summary: 'Shirdi Sai Baba Temple summary', full: 'Shirdi Sai Baba Temple full description' },
    howToReach: { summary: 'By road or train', full: 'Detailed directions' }
  },
  {
    name: 'Tuljapur Bhavani Temple',
    category: 'Temple',
    year: '12th century',
    location: { coordinates: [76.0683, 18.0089], country: 'India' },
    info: { summary: 'Tuljapur Bhavani Temple summary', full: 'Tuljapur Bhavani Temple full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Mahalakshmi Temple, Kolhapur',
    category: 'Temple',
    year: '7th century',
    location: { coordinates: [74.2264, 16.7050], country: 'India' },
    info: { summary: 'Mahalakshmi Temple summary', full: 'Mahalakshmi Temple full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Aundha Nagnath Temple',
    category: 'Temple',
    year: '12th century',
    location: { coordinates: [77.0508, 19.5403], country: 'India' },
    info: { summary: 'Aundha Nagnath Temple summary', full: 'Aundha Nagnath Temple full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Grishneshwar Temple',
    category: 'Temple',
    year: '18th century',
    location: { coordinates: [75.1856, 20.0247], country: 'India' },
    info: { summary: 'Grishneshwar Temple summary', full: 'Grishneshwar Temple full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },

  // Palaces & Museums
  {
    name: 'Aga Khan Palace',
    category: 'Palace',
    year: '1892',
    location: { coordinates: [73.9078, 18.5372], country: 'India' },
    info: { summary: 'Aga Khan Palace summary', full: 'Aga Khan Palace full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Raja Dinkar Kelkar Museum',
    category: 'Museum',
    year: '1962',
    location: { coordinates: [73.8550, 18.5092], country: 'India' },
    info: { summary: 'Raja Dinkar Kelkar Museum summary', full: 'Raja Dinkar Kelkar Museum full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Prince of Wales Museum',
    category: 'Museum',
    year: '1922',
    location: { coordinates: [72.8328, 18.9267], country: 'India' },
    info: { summary: 'Prince of Wales Museum summary', full: 'Prince of Wales Museum full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },

  // Historic Buildings
  {
    name: 'Crawford Market',
    category: 'Historic Building',
    year: '1869',
    location: { coordinates: [72.8364, 18.9472], country: 'India' },
    info: { summary: 'Crawford Market summary', full: 'Crawford Market full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'Rajabai Clock Tower',
    category: 'Historic Building',
    year: '1878',
    location: { coordinates: [72.8281, 18.9289], country: 'India' },
    info: { summary: 'Rajabai Clock Tower summary', full: 'Rajabai Clock Tower full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  },
  {
    name: 'High Court Bombay',
    category: 'Historic Building',
    year: '1878',
    location: { coordinates: [72.8322, 18.9300], country: 'India' },
    info: { summary: 'High Court Bombay summary', full: 'High Court Bombay full description' },
    howToReach: { summary: 'By road', full: 'Detailed directions' }
  }
];

// Function to populate the database
async function populateHeritageSites() {
  try {
    // Clear existing data
    await HeritageSite.deleteMany({});
    console.log('🗑️ Cleared existing heritage sites data');
    
    // Insert new data
    const result = await HeritageSite.insertMany(heritageSitesData);
    console.log(`✅ Successfully inserted ${result.length} heritage sites`);
    
    // List inserted sites
    result.forEach(site => {
      console.log(`   - ${site.name} (${site.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error populating heritage sites:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the population script
populateHeritageSites();

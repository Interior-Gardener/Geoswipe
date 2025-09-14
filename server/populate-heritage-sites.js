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
    media: {
      panorama_url: "https://images.unsplash.com/photo-1595402513890-acbc47954481?w=1200&h=600&fit=crop"
    },
    visitor_info: {
      timings: "24 hours (Open area)",
      entryFee: "Free",
      bestTimeToVisit: "October to March, sunset hours",
      duration: "1-2 hours"
    }
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

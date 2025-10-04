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

// Comprehensive heritage sites data covering all major Indian heritage locations
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
      sketchfabId: '38a652e9f3bf49039026ef65ef61ac92' // Example, replace with real ID
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
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Historic palace fort of the Peshwa rulers, seat of Maratha Empire power.',
      full: 'Shaniwar Wada was a palace fort in Pune built by Bajirao I in 1732. It served as the seat of the Peshwas of the Maratha Empire until 1818. The fort was the center of Indian politics for nearly a century. Most of the palace was destroyed in a fire in 1827, but the impressive fortification walls and gates remain. The fort is famous for its architectural grandeur and historical significance in Maratha history.',
      history: 'Built by Peshwa Bajirao I in 1732 as the residence of the Peshwas. It was expanded over time by subsequent Peshwa rulers. The fort witnessed significant political events and was destroyed by a mysterious fire in 1827.',
      architecture: 'Built using teak wood and stone, featuring impressive fortification walls, ornate gates with spikes to prevent elephant attacks, and beautiful gardens. The original palace had multiple stories with intricate wooden carvings.',
      significance: 'Symbol of Maratha power and architectural heritage. Important site in Indian history where many crucial political decisions were made during the Maratha period.',
      visitingTips: [
        'Best visited in evening for sound and light show',
        'Explore all five gates of the fort',
        'Photography allowed in most areas',
        'Combine with other Pune heritage sites'
      ]
    },
    howToReach: { 
      summary: 'Located in old Pune city, easily accessible by public transport and private vehicles.',
      full: 'Shaniwar Wada is located in the heart of Pune city and is easily accessible by bus, auto-rickshaw, or taxi from any part of Pune. The nearest railway station is Pune Junction, about 3 km away.'
    },
    media: { panorama_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM - 6:00 PM (Daily)',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Raigad Fort',
    category: 'Historic Fort',
    year: '1656',
    location: { 
      coordinates: [73.4462, 18.2343], 
      city: 'Raigad',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Capital fort of Chhatrapati Shivaji Maharaj and coronation site of the Maratha Empire.',
      full: 'Raigad Fort was the capital of Chhatrapati Shivaji Maharaj and served as the seat of his government. Built in 1656, this hill fort is located at an altitude of 2,851 feet above sea level. It was here that Shivaji was crowned as the Chhatrapati (Emperor) of the Maratha Empire in 1674. The fort contains the ruins of the royal palace, audience halls, and various other structures that speak of the grandeur of the Maratha Empire.',
      history: 'Originally called Rairi, it was captured and fortified by Shivaji in 1656. The coronation of Shivaji took place here in 1674. It remained the Maratha capital until 1689 when it was captured by the Mughals.',
      architecture: 'Built on a hilltop with massive stone fortifications. Contains ruins of the Raj Bhavan (royal residence), audience halls, granaries, and water cisterns. The fortification includes multiple gates and bastions.',
      significance: 'Birthplace of the Maratha Empire and site of Shivaji\'s coronation. Symbol of Maratha sovereignty and Hindu Swarajya.',
      visitingTips: [
        'Take ropeway to avoid steep climb',
        'Visit Shivaji\'s tomb and palace ruins',
        'Carry water and food as facilities are limited',
        'Wear comfortable trekking shoes'
      ]
    },
    howToReach: { 
      summary: 'Located in Raigad district, accessible by road and ropeway from Mahad.',
      full: 'Raigad Fort is about 170 km from Mumbai and 120 km from Pune. The nearest town is Mahad, from where you can take a ropeway to the fort or trek for about 2 hours. Regular buses and taxis are available from Mumbai and Pune to Mahad.'
    },
    media: { panorama_url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM - 6:00 PM (Daily)',
      entryFee: '₥30 for Indians, ₹200 for foreigners. Ropeway charges extra.',
      bestTimeToVisit: 'October to March',
      duration: '4-5 hours'
    }
  },
  {
    name: 'Janjira Fort',
    category: 'Historic Fort',
    year: '15th century',
    location: { 
      coordinates: [72.9613, 18.3006], 
      city: 'Murud',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Unconquerable island fort in the Arabian Sea, built by Siddi rulers.',
      full: 'Janjira Fort is a 15th-century fort built on an island in the Arabian Sea, just off the coastal town of Murud. It was built by the Siddi rulers and is famous for being one of the few forts that was never conquered by land or sea. The fort is surrounded by water on all sides and is accessible only by boat. It contains palaces, mosques, and various other structures within its walls.',
      history: 'Built in the 15th century by the local fishermen, later expanded by the Siddi dynasty. Despite numerous attempts by Marathas, Portuguese, and British, the fort was never conquered.',
      architecture: 'Built with massive walls rising directly from the sea. Contains 19 bastions, palaces, mosques, freshwater ponds, and administrative buildings. The main gate faces the Murud shore.',
      significance: 'Known as the "Gibraltar of the East" for its impregnable nature. Represents maritime fortification techniques and Siddi maritime power.',
      visitingTips: [
        'Take boat from Murud jetty (only way to reach)',
        'Visit during high tide for easier boat journey',
        'Explore the palace ruins and ancient cannons',
        'Combine with Murud beach visit'
      ]
    },
    howToReach: { 
      summary: 'Accessible only by boat from Murud village, 165 km from Mumbai.',
      full: 'Janjira Fort is accessible only by boat from Murud village. Murud is about 165 km from Mumbai via road. Regular buses and private vehicles connect Mumbai to Murud. From Murud jetty, boats are available to the fort (15-20 minutes journey).'
    },
    media: { panorama_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM - 5:00 PM (Daily, weather permitting)',
      entryFee: '₹25 for Indians, ₹200 for foreigners. Boat charges extra (₹50-100 per person).',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Sinhagad Fort',
    category: 'Historic Fort',
    year: '2nd century',
    location: { 
      coordinates: [73.7553, 18.3669], 
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Ancient hill fort famous for the Battle of Sinhagad and Tanaji Malusare\'s bravery.',
      full: 'Sinhagad Fort, originally known as Kondana, is an ancient hill fort located southwest of Pune. The fort is famous for the Battle of Sinhagad (1670) where Maratha general Tanaji Malusare recaptured it from the Mughals but lost his life in the process. The fort offers spectacular views of the Sahyadri mountains and Pune city. It contains various structures including temples, water tanks, and military installations.',
      history: 'Originally built in the 2nd century, later fortified by various dynasties. Captured by Shivaji in 1647, lost to Mughals in 1665, and recaptured by Tanaji Malusare in 1670 in a famous night attack.',
      architecture: 'Built on a hill with steep approaches. Contains gates, bastions, temples dedicated to Goddess Kali, granaries, and water tanks. The Kalyan Darwaza (main gate) is particularly impressive.',
      significance: 'Symbol of Maratha valor and sacrifice. The famous saying "Gad ala pan sinha gela" (The fort is won but the lion is gone) refers to Tanaji\'s sacrifice here.',
      visitingTips: [
        'Start early morning to avoid crowds',
        'Try local specialties like zunka bhakar',
        'Visit Tanaji memorial and Kali temple',
        'Carry water during summer months'
      ]
    },
    howToReach: { 
      summary: 'Located 35 km from Pune, accessible by road and a short trek.',
      full: 'Sinhagad Fort is about 35 km southwest of Pune city. Regular buses and private vehicles connect Pune to the base of the fort. From the parking area, it\'s a 20-30 minute easy trek to the top. The route is well-marked and suitable for all age groups.'
    },
    visitor_info: {
      timings: '6:00 AM - 6:00 PM (Daily)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March, monsoon season for greenery',
      duration: '3-4 hours'
    }
  },
  {
    name: 'Pratapgad Fort',
    category: 'Historic Fort',
    year: '1656',
    location: { 
      coordinates: [73.5522, 17.9414], 
      city: 'Mahabaleshwar',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Historic fort where Shivaji killed Afzal Khan, marking a crucial victory for the Maratha Empire.',
      full: 'Pratapgad Fort was built by Chhatrapati Shivaji Maharaj in 1656. It is famous for the encounter between Shivaji and Afzal Khan, the Adil Shahi general, in 1659. This fort holds immense historical significance as it marked a turning point in Maratha history. The fort contains the tomb of Afzal Khan, various temples, and offers panoramic views of the surrounding valleys.',
      history: 'Built by Shivaji in 1656 as a strategic fort. Scene of the famous encounter between Shivaji and Afzal Khan in 1659, which established Maratha dominance in the region.',
      architecture: 'Built on a hilltop with strong fortifications. Contains the Bhavani temple, Afzal Khan\'s tomb, residential quarters, and water reservoirs. The architecture combines military and religious elements.',
      significance: 'Site of Shivaji\'s strategic victory over Afzal Khan. Represents the rise of Maratha power and Shivaji\'s military genius.',
      visitingTips: [
        'Visit Bhavani temple and Afzal Khan\'s tomb',
        'Enjoy panoramic views from the fort',
        'Combine with Mahabaleshwar tour',
        'Wear comfortable shoes for climbing'
      ]
    },
    howToReach: { 
      summary: 'Located near Mahabaleshwar, 24 km from Mahabaleshwar town.',
      full: 'Pratapgad Fort is located about 24 km from Mahabaleshwar and 180 km from Mumbai. The fort is accessible by road, and regular buses and taxis are available from Mahabaleshwar and nearby towns. The final approach involves a moderate trek of about 500 steps.'
    },
    visitor_info: {
      timings: '6:00 AM - 6:00 PM (Daily)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to May',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Daulatabad Fort',
    category: 'Historic Fort',
    year: '12th century',
    location: { 
      coordinates: [75.2347, 19.9372], 
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Medieval fort with ingenious defense systems, former capital of Delhi Sultanate.',
      full: 'Daulatabad Fort, originally known as Devagiri, is a 12th-century fort built by the Yadavas. It was later conquered by Alauddin Khilji and became the capital when Muhammad bin Tughluq shifted his capital from Delhi to Daulatabad. The fort is famous for its ingenious defense mechanisms including a maze-like entrance, water moats, and cannon placements. It offers spectacular views and contains various palaces, mosques, and administrative buildings.',
      history: 'Built by Bhillama V of the Yadava dynasty in the 12th century. Conquered by Delhi Sultanate in 1308. Muhammad bin Tughluq made it his capital in 1327, forcing the entire population of Delhi to migrate here.',
      architecture: 'Built on a conical hill with concentric fortification walls. Features include the Chand Minar, Bharatiya Kacheri, Chini Mahal, and complex defense systems with hidden passages and traps.',
      significance: 'One of the most formidable forts in India. Represents medieval military architecture and the ambitious but failed capital shift by Muhammad bin Tughluq.',
      visitingTips: [
        'Hire a guide to understand the complex layout',
        'Visit Chand Minar and Elephant Tank',
        'Wear comfortable shoes for climbing',
        'Carry torch for dark passages'
      ]
    },
    howToReach: { 
      summary: 'Located 16 km from Aurangabad city, easily accessible by road.',
      full: 'Daulatabad Fort is about 16 km from Aurangabad city center. Regular buses, auto-rickshaws, and taxis connect the fort to Aurangabad. It can be combined with visits to Ajanta and Ellora caves as they are in the same region.'
    },
    visitor_info: {
      timings: '9:00 AM - 5:30 PM (Daily)',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Torna Fort',
    category: 'Historic Fort',
    year: '13th century',
    location: { 
      coordinates: [73.6028, 18.2144], 
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'First fort captured by Shivaji at age 16, marking the beginning of his military career.',
      full: 'Torna Fort, also known as Prachandagad, holds the distinction of being the first fort captured by Chhatrapati Shivaji Maharaj in 1646 at the young age of 16. This victory marked the beginning of his illustrious military career and the foundation of the Maratha Empire. The fort is situated at an altitude of 4,603 feet, making it one of the highest forts in the district.',
      history: 'Built in the 13th century, captured by 16-year-old Shivaji in 1646 from the Adil Shahi Sultanate. This was Shivaji\'s first independent military achievement that launched his career.',
      architecture: 'Built on a high plateau with strong natural defenses. Contains ruins of palaces, temples, water tanks, and fortification walls. The Menghai Goddess temple is a notable structure.',
      significance: 'Birthplace of the Maratha Empire and Shivaji\'s first conquest. Symbol of youthful ambition and strategic thinking.',
      visitingTips: [
        'Challenging trek - suitable for experienced trekkers',
        'Start very early morning due to difficult terrain',
        'Carry sufficient water and food',
        'Best views of Sahyadri mountains from the top'
      ]
    },
    howToReach: { 
      summary: 'Located 50 km from Pune, requires a challenging trek of 3-4 hours.',
      full: 'Torna Fort is about 50 km from Pune. The base village Velhe is accessible by road. From Velhe, it\'s a challenging trek of 3-4 hours through steep terrain. The trek requires good physical fitness and is recommended only for experienced trekkers.'
    },
    visitor_info: {
      timings: 'Best attempted in daylight hours (6:00 AM - 6:00 PM)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to February (avoid monsoons and summer)',
      duration: '6-8 hours (including trek)'
    }
  },
  {
    name: 'Rajgad Fort',
    category: 'Historic Fort',
    year: '15th century',
    location: { 
      coordinates: [73.6719, 18.2403], 
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Shivaji\'s favorite fort and residence for 26 years, known as the "King of Forts".',
      full: 'Rajgad Fort, meaning "King of Forts," was the favorite residence of Chhatrapati Shivaji Maharaj for over 26 years. Built in the 15th century and later fortified by Shivaji, it served as the capital of the Maratha Empire before Raigad. The fort is known for its strategic location, strong fortifications, and the tomb of Shivaji\'s queen Saibai. It offers stunning views of the surrounding mountains and valleys.',
      history: 'Originally built in the 15th century, captured and extensively fortified by Shivaji. Served as his residence and Maratha capital for 26 years until he shifted to Raigad in 1674.',
      architecture: 'Built on a mountain ridge with three main peaks - Suvela Machi, Sanjeevani Machi, and Padmavati Machi. Contains palaces, temples, water tanks, and the tomb of Queen Saibai.',
      significance: 'Shivaji\'s longest residence and administrative center. Site where many important decisions of the Maratha Empire were made.',
      visitingTips: [
        'Visit all three machis (plateaus)',
        'See Queen Saibai\'s tomb on Padmavati Machi',
        'Trek is moderate and suitable for most fitness levels',
        'Carry water and snacks'
      ]
    },
    howToReach: { 
      summary: 'Located 60 km from Pune, accessible via moderate trek from Gunjavane village.',
      full: 'Rajgad Fort is about 60 km from Pune. The base village Gunjavane is accessible by road. From Gunjavane, it\'s a moderate trek of 2-3 hours to reach the fort. The trail is well-marked and suitable for beginners to moderate trekkers.'
    },
    visitor_info: {
      timings: '6:00 AM - 6:00 PM (recommended daylight hours)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March',
      duration: '5-6 hours (including trek)'
    }
  },
  {
    name: 'Lohagad Fort',
    category: 'Historic Fort',
    year: '18th century',
    location: { 
      coordinates: [73.4850, 18.7108], 
      city: 'Lonavala',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Historic fort near Lonavala with the famous Visapur Fort nearby, connected by a narrow ridge.',
      full: 'Lohagad Fort, meaning "Iron Fort," is a hill fort located near Lonavala. The fort is connected to the nearby Visapur Fort by a small range. It was used by Chhatrapati Shivaji Maharaj and later by the Peshwas. The fort is famous for its impressive gate and the long tail-like formation called "Vinchukata" (Scorpion\'s tail). It offers beautiful views of the surrounding valleys and is a popular trekking destination.',
      history: 'Built in the 18th century, used by Shivaji and later extensively used by the Peshwas as a treasury. The fort witnessed several battles during the Maratha period.',
      architecture: 'Built with black stone (loh = iron) giving it the name. Features strong gates, bastions, and the distinctive Vinchukata formation. Contains water tanks and residential quarters.',
      significance: 'Important treasury fort of the Peshwas. Popular trekking destination showcasing Maratha military architecture.',
      visitingTips: [
        'Easy trek suitable for beginners',
        'Spectacular views during monsoon',
        'Visit Vinchukata for panoramic views',
        'Can be combined with Visapur Fort'
      ]
    },
    howToReach: { 
      summary: 'Located near Lonavala, easily accessible by road and easy trek.',
      full: 'Lohagad Fort is about 10 km from Lonavala town. Regular buses and taxis are available from Mumbai and Pune to Lonavala. From Lonavala, local transport is available to the base of the fort, from where it\'s an easy 1-hour trek to the top.'
    },
    visitor_info: {
      timings: '6:00 AM - 6:00 PM (Daily)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March, monsoon for lush greenery',
      duration: '3-4 hours'
    }
  },
  {
    name: 'Vishalgad Fort',
    category: 'Historic Fort',
    year: '12th century',
    location: { 
      coordinates: [74.0231, 16.7719], 
      city: 'Kolhapur',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Ancient fort where Baji Prabhu Deshpande made his heroic last stand to help Shivaji escape.',
      full: 'Vishalgad Fort is an ancient hill fort located in the Sahyadri mountains near Kolhapur. The fort is famous for the heroic last stand made by Baji Prabhu Deshpande and his 300 Maratha soldiers at the Ghod Khind (later renamed Paavan Khind) pass to help Chhatrapati Shivaji escape from the siege of Panhala Fort in 1660. This act of sacrifice is considered one of the greatest examples of loyalty and bravery in Maratha history.',
      history: 'Built in the 12th century by the Shilaharas, later used by various dynasties. Famous for the Battle of Paavan Khind in 1660 where Baji Prabhu Deshpande sacrificed his life.',
      architecture: 'Built on a hilltop with natural rock formations providing defense. Contains gates, bastions, water tanks, and temples. The Khind (mountain pass) is the most strategic feature.',
      significance: 'Site of one of the greatest acts of sacrifice in Maratha history. Symbol of loyalty, bravery, and friendship.',
      visitingTips: [
        'Visit Baji Prabhu Deshpande memorial',
        'Trek through the historic Paavan Khind',
        'Combine with Panhala Fort visit',
        'Moderate trekking difficulty'
      ]
    },
    howToReach: { 
      summary: 'Located 76 km from Kolhapur, accessible by road and moderate trek.',
      full: 'Vishalgad Fort is about 76 km from Kolhapur city. The base village is accessible by road from Kolhapur. From the base, it\'s a moderate trek of 2-3 hours to reach the fort. Local transport is available from Kolhapur to the base village.'
    },
    visitor_info: {
      timings: '6:00 AM - 6:00 PM (recommended)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March',
      duration: '4-5 hours (including trek)'
    }
  },

 // Monuments
  {
    name: 'Bibi Ka Maqbara',
    category: 'Monument',
    year: '1660',
    location: { 
      coordinates: [75.3204, 19.8974], 
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Mughal mausoleum known as the "Taj of the Deccan", built by Aurangzeb for his wife.',
      full: 'Bibi Ka Maqbara is a mausoleum built by Mughal Emperor Aurangzeb in memory of his first wife, Dilras Banu Begum, in 1660. Often called the "Taj of the Deccan" or "Poor Man\'s Taj," it bears a striking resemblance to the famous Taj Mahal. The monument showcases the decline of Mughal architecture with its use of plaster instead of pure marble, but still retains the essential elements of Mughal design including the central dome, four minarets, and charbagh garden layout.',
      history: 'Built between 1651-1660 by Prince Azam Shah (son of Aurangzeb) in memory of his mother Dilras Banu Begum. Designed by Ata-ullah, a student of Ustad Ahmad Lahauri who designed the Taj Mahal.',
      architecture: 'Mughal architecture with Indo-Islamic influences. Central white marble dome, four corner minarets, main tomb chamber, mosque, and charbagh garden. Built primarily with basalt stone and plaster, with marble used sparingly.',
      significance: 'Last major Mughal architectural monument. Represents the economic constraints and changing artistic preferences of the late Mughal period.',
      visitingTips: [
        'Best photographed during golden hour',
        'Compare architectural elements with Taj Mahal',
        'Explore the surrounding gardens',
        'Visit early morning to avoid crowds'
      ]
    },
    howToReach: { 
      summary: 'Located 5 km from Aurangabad city center, easily accessible by road.',
      full: 'Bibi Ka Maqbara is located about 5 km from Aurangabad city center. Regular buses, auto-rickshaws, and taxis connect the monument to the city. It can be easily combined with visits to other Aurangabad attractions like Ajanta and Ellora caves.'
    },
    media: { panorama_url: 'https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM - 5:30 PM (Daily)',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },

   // Rock-cut Caves
   {
    name: 'Karla Caves',
    category: 'Rock-cut Cave',
    year: '160 BCE',
    location: { 
      coordinates: [73.4844, 18.7458], 
      city: 'Lonavala',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Ancient Buddhist rock-cut caves with the largest chaitya hall in India.',
      full: 'Karla Caves are a complex of ancient Buddhist rock-cut caves dating from 160 BCE to 100 CE. The main attraction is Cave 8, which houses the largest chaitya hall (prayer hall) in India. The caves were carved during the Hinayana period of Buddhism and showcase excellent craftsmanship with intricate sculptures, pillars, and stupas. The grand chaitya hall is 45 meters long and 14 meters high, supported by 37 pillars.',
      history: 'Carved between 160 BCE and 100 CE during the Satavahana period. Built by Buddhist monks as monasteries and prayer halls. The caves flourished as centers of Buddhist learning.',
      architecture: 'Hinayana Buddhist rock-cut architecture featuring chaitya halls, viharas (monasteries), and stupas. The main chaitya hall has wooden ribs on the ceiling and elaborate facade carvings.',
      significance: 'Contains the largest and most well-preserved chaitya hall in India. Important example of early Buddhist rock-cut architecture.',
      visitingTips: [
        'Visit the grand chaitya hall (Cave 8)',
        'Observe intricate pillar carvings',
        'Combine with Bhaja Caves (nearby)',
        'Early morning visits recommended'
      ]
    },
    howToReach: { 
      summary: 'Located near Lonavala, 11 km from Lonavala railway station.',
      full: 'Karla Caves are about 11 km from Lonavala and 60 km from Pune. Regular buses and taxis are available from Lonavala and Mumbai-Pune highway. From the parking area, it\'s a short 10-minute walk uphill to the caves.'
    },
    visitor_info: {
      timings: '9:00 AM - 5:30 PM (Daily)',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Bhaja Caves',
    category: 'Rock-cut Cave',
    year: '2nd century BCE',
    location: { 
      coordinates: [73.4850, 18.7317], 
      city: 'Lonavala',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Ancient Buddhist caves with unique stupas and the oldest rock-cut architecture in Maharashtra.',
      full: 'Bhaja Caves are a group of 22 rock-cut caves dating from the 2nd century BCE to the 2nd century CE. These caves represent some of the earliest examples of rock-cut architecture in Maharashtra. The caves include chaitya halls, viharas, and unique features like the group of 14 stupas and ancient Sanskrit inscriptions. Cave 12 is particularly notable for its horseshoe-shaped chaitya hall.',
      history: 'Carved between 2nd century BCE and 2nd century CE during the Satavahana period. Used by Buddhist monks as monasteries and places of worship.',
      architecture: 'Early Hinayana Buddhist architecture with simple design. Features chaitya halls, viharas, stupas, and some of the oldest rock-cut structures in the region.',
      significance: 'Among the earliest examples of Buddhist rock-cut caves in India. Contains unique group of stupas and ancient inscriptions.',
      visitingTips: [
        'See the unique group of 14 stupas',
        'Visit Cave 12 with horseshoe arch',
        'Read ancient Brahmi inscriptions',
        'Can be combined with Karla Caves'
      ]
    },
    howToReach: { 
      summary: 'Located 12 km from Lonavala, accessible by road and short trek.',
      full: 'Bhaja Caves are about 12 km from Lonavala town. Accessible by local buses or taxis from Lonavala. From the base, there\'s a moderate 20-minute climb to reach the caves. The location offers beautiful views of the surrounding valleys.'
    },
    visitor_info: {
      timings: '9:00 AM - 5:30 PM (Daily)',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Bedse Caves',
    category: 'Rock-cut Cave',
    year: '1st century BCE',
    location: { 
      coordinates: [73.5033, 18.7481], 
      city: 'Lonavala',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Lesser-known Buddhist caves offering tranquil environment and excellent valley views.',
      full: 'Bedse Caves are Buddhist rock-cut caves dating from the 1st century BCE. Less crowded than Karla and Bhaja caves, they offer a more tranquil experience. The caves consist of one chaitya hall and several viharas carved into the hillside. The location provides excellent panoramic views of the Pawna dam and surrounding valleys, making it popular among trekkers and photography enthusiasts.',
      history: 'Carved in the 1st century BCE during the Satavahana period. Used by Buddhist monks for meditation and religious activities.',
      architecture: 'Simple Hinayana Buddhist architecture with one main chaitya hall and several viharas. Features basic sculptures and stupas.',
      significance: 'Less commercialized example of Buddhist rock-cut architecture. Offers peaceful environment for meditation and reflection.',
      visitingTips: [
        'Best for peaceful meditation',
        'Excellent photography opportunities',
        'Great views of Pawna dam',
        'Less crowded than other caves'
      ]
    },
    howToReach: { 
      summary: 'Located near Bhaja Caves, requires moderate trekking to reach.',
      full: 'Bedse Caves are located near Bhaja Caves, about 15 km from Lonavala. Accessible by local transport to Bedse village, followed by a moderate 30-45 minute trek uphill. The trek offers scenic views of the region.'
    },
    visitor_info: {
      timings: 'Daylight hours (6:00 AM - 6:00 PM)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March, monsoon for greenery',
      duration: '2-3 hours (including trek)'
    }
  },
  {
    name: 'Kanheri Caves',
    category: 'Rock-cut Cave',
    year: '1st century BCE - 10th century CE',
    location: { 
      coordinates: [72.9056, 19.2078], 
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Extensive Buddhist cave complex within Sanjay Gandhi National Park, Mumbai.',
      full: 'Kanheri Caves are a group of caves and rock-cut monuments carved from a massive basaltic rock outcropping in the forests of Sanjay Gandhi National Park. The caves number over 100 and were chiseled out of a rocky cliff in the period between 1st century BCE and 10th century CE. The word Kanheri comes from the Sanskrit "Krishnagiri," meaning black mountain. These caves served as a university center of learning.',
      history: 'Carved over a period of 1000 years (1st century BCE to 10th century CE). Served as a major Buddhist learning center with monks from various countries studying here.',
      architecture: 'Various periods of Buddhist architecture from Hinayana to Mahayana. Features chaitya halls, viharas, stupas, and elaborate sculptures including Buddha statues.',
      significance: 'One of the largest cave complexes in India. Important center of Buddhist learning with international connections.',
      visitingTips: [
        'Visit Cave 3 (Great Chaitya Hall)',
        'See the Buddha statue in Cave 90',
        'Explore within Sanjay Gandhi National Park',
        'Carry water and wear comfortable shoes'
      ]
    },
    howToReach: { 
      summary: 'Located within Sanjay Gandhi National Park, Borivali, accessible by local trains.',
      full: 'Kanheri Caves are located within Sanjay Gandhi National Park in Borivali, Mumbai. Take local train to Borivali station, then bus or auto-rickshaw to the national park entrance. From the entrance, it\'s about a 30-minute walk or you can take park transport to the caves.'
    },
    visitor_info: {
      timings: '7:30 AM - 5:00 PM (Daily except Mondays)',
      entryFee: 'National park entry + ₹35 for Indians, ₹485 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '3-4 hours'
    }
  },
  {
    name: 'Aurangabad Caves',
    category: 'Rock-cut Cave',
    year: '6th-7th century',
    location: { 
      coordinates: [75.3433, 19.8878], 
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Buddhist and Hindu rock-cut caves showcasing transition in Indian religious architecture.',
      full: 'Aurangabad Caves are 12 artificial Buddhist shrines located on a hill running roughly east to west, close to the city of Aurangabad. The caves were excavated between the 6th and 7th century CE and are divided into three groups: Western Group, Eastern Group, and Northern Group. These caves represent the later period of rock-cut architecture and show influences of both Buddhist and Hindu traditions.',
      history: 'Carved in the 6th-7th centuries CE during the Chalukya period. Represents the later phase of Buddhist cave architecture with some Hindu influences.',
      architecture: 'Later Buddhist architecture with elaborate sculptures, including some of the finest examples of Buddhist art in Maharashtra. Cave 7 has particularly beautiful sculptures.',
      significance: 'Shows the transition from Buddhist to Hindu architecture. Contains some of the most beautiful sculptural work in Maharashtra caves.',
      visitingTips: [
        'Focus on Cave 7 for best sculptures',
        'Visit both Eastern and Western groups',
        'Less crowded than Ajanta-Ellora',
        'Good for photography'
      ]
    },
    howToReach: { 
      summary: 'Located 9 km from Aurangabad city, easily accessible by road.',
      full: 'Aurangabad Caves are about 9 km north of Aurangabad city center. Regular buses, auto-rickshaws, and taxis are available from the city. The caves can be combined with visits to other Aurangabad attractions.'
    },
    visitor_info: {
      timings: '9:00 AM - 5:30 PM (Daily)',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Lenyadri Caves',
    category: 'Rock-cut Cave',
    year: '1st-3rd century',
    location: { 
      coordinates: [73.6928, 19.1850], 
      city: 'Junnar',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Ashtavinayak pilgrimage site with Buddhist caves converted to Ganesha temple.',
      full: 'Lenyadri Caves, also known as Ganesa Lena, are a series of about 30 rock-cut Buddhist caves located near Junnar. Dating from the 1st to 3rd centuries CE, these caves are unique because Cave 7 has been converted into a temple dedicated to Ganesha and is one of the eight revered temples in the Ashtavinayak pilgrimage of Maharashtra. The caves showcase the evolution from Buddhist to Hindu religious practices.',
      history: 'Originally carved as Buddhist caves in 1st-3rd centuries CE. Later, Cave 7 was converted into a Ganesha temple, becoming part of the Ashtavinayak pilgrimage circuit.',
      architecture: 'Early Buddhist rock-cut architecture with simple viharas and chaitya halls. Cave 7 has been modified with Hindu religious elements.',
      significance: 'Unique example of religious conversion from Buddhism to Hinduism. One of the eight sacred Ashtavinayak temples.',
      visitingTips: [
        'Visit Cave 7 Ganesha temple for darshan',
        'Explore other Buddhist caves',
        'Part of Ashtavinayak pilgrimage circuit',
        'Climb 283 steps to reach the temple'
      ]
    },
    howToReach: { 
      summary: 'Located near Junnar, 94 km from Pune, accessible by road and climb.',
      full: 'Lenyadri Caves are located about 5 km from Junnar and 94 km from Pune. Regular buses connect Pune to Junnar. From Junnar, local transport is available to the base of the hill. From the base, climb 283 steps to reach the main temple.'
    },
    visitor_info: {
      timings: '6:00 AM - 10:00 PM (Daily)',
      entryFee: 'Free entry (donations welcome)',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },

  // Temples
  {
    name: 'Trimbakeshwar Temple',
    category: 'Temple',
    year: '1755',
    location: { 
      coordinates: [73.5311, 19.9317], 
      city: 'Trimbak',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'One of the twelve Jyotirlinga shrines of Lord Shiva, source of river Godavari.',
      full: 'Trimbakeshwar Temple is one of the twelve Jyotirlinga shrines of Lord Shiva and is located in Trimbak, near Nashik. The temple is situated at the source of the river Godavari, making it a significant pilgrimage site. The temple was built by Peshwa Balaji Baji Rao in 1755 and is known for its unique feature where the Jyotirlinga has three faces representing Brahma, Vishnu, and Shiva, hence the name "Trimbakeshwar" (three-faced lord).',
      history: 'Built by Peshwa Balaji Baji Rao (Nana Saheb) in 1755. The site has been sacred since ancient times as mentioned in various Puranas. The temple was reconstructed several times due to natural calamities.',
      architecture: 'Built in Hemadri style with black stone. The temple has a unique three-faced lingam and features intricate carvings. The shikhara is one of the tallest among Jyotirlinga temples.',
      significance: 'One of the twelve Jyotirlingas. Source of river Godavari. Important site for performing last rites and Narayan Nagbali ritual.',
      visitingTips: [
        'Visit during Shravan month for special celebrations',
        'Take holy dip in Kushavarta Kund',
        'Photography not allowed inside sanctum',
        'Dress modestly and follow temple customs'
      ]
    },
    howToReach: { 
      summary: 'Located 28 km from Nashik, well connected by road.',
      full: 'Trimbakeshwar is about 28 km from Nashik city. Regular buses and taxis are available from Nashik. The nearest railway station is Nashik, which is well connected to major cities. From Nashik, regular bus services and taxis are available to Trimbakeshwar.'
    },
    visitor_info: {
      timings: '5:30 AM - 9:00 PM (Daily)',
      entryFee: 'Free entry (special darshan tickets available)',
      bestTimeToVisit: 'October to March, Shravan month for festivities',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Shirdi Sai Baba Temple',
    category: 'Temple',
    year: '20th century',
    location: { 
      coordinates: [74.4769, 19.7669], 
      city: 'Shirdi',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Sacred shrine dedicated to Sai Baba, one of India\'s most visited pilgrimage sites.',
      full: 'Shirdi Sai Baba Temple is dedicated to Sai Baba of Shirdi, a spiritual master who lived in Shirdi from 1858 to 1918. The temple complex houses Sai Baba\'s samadhi (final resting place) and attracts millions of devotees from around the world. Sai Baba preached religious tolerance and is revered by people of all faiths. The temple complex includes the main samadhi mandir, Dwarkamai mosque where Sai Baba lived, and various other significant locations.',
      history: 'Built after Sai Baba\'s samadhi in 1918. The current temple structure was developed over decades with contributions from devotees worldwide. Sai Baba lived in Shirdi for about 60 years.',
      architecture: 'Modern temple architecture with marble work. The samadhi mandir houses Sai Baba\'s tomb with a beautiful marble statue. The complex includes various halls and facilities for pilgrims.',
      significance: 'One of the most visited pilgrimage sites in India. Symbol of religious harmony and universal brotherhood.',
      visitingTips: [
        'Book accommodation in advance during festivals',
        'Visit Dwarkamai and Chavadi',
        'Participate in daily aarti ceremonies',
        'Free meals (prasadam) available for all'
      ]
    },
    howToReach: { 
      summary: 'Well connected by road, rail, and air with regular services from major cities.',
      full: 'Shirdi is well connected by road to Mumbai (285 km), Pune (185 km), and other major cities. Shirdi Airport has regular flights from major cities. Sainagar Shirdi railway station is connected to various cities with special trains for pilgrims.'
    },
    visitor_info: {
      timings: '4:00 AM - 11:15 PM (Daily with break timings)',
      entryFee: 'Free entry (special darshan tickets available)',
      bestTimeToVisit: 'October to March, Vijayadashami and Ram Navami for festivals',
      duration: '1-2 days'
    }
  },
  {
    name: 'Tuljapur Bhavani Temple',
    category: 'Temple',
    year: '12th century',
    location: { 
      coordinates: [76.0683, 18.0089], 
      city: 'Tuljapur',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'One of the 51 Shakti Peethas, family deity of Chhatrapati Shivaji Maharaj.',
      full: 'Tuljapur Bhavani Temple is dedicated to Goddess Tulja Bhavani, considered one of the 51 Shakti Peethas in Hindu tradition. The temple was the family deity (Kuldevata) of Chhatrapati Shivaji Maharaj and the Maratha royal family. The goddess is depicted with eight arms, holding various weapons, and is considered the destroyer of evil. The temple has great historical significance as Shivaji regularly visited here for blessings before his military campaigns.',
      history: 'The original temple dates back to the 12th century. It was renovated and expanded during the Maratha period. Shivaji Maharaj was a regular devotee and received the sword from the goddess according to legend.',
      architecture: 'Built in Hemadri architectural style with a conical shikhara. The temple has intricate stone carvings and a beautiful sanctum housing the goddess statue.',
      significance: 'One of the 51 Shakti Peethas. Family deity of Shivaji Maharaj. Important center of Shakti worship in Maharashtra.',
      visitingTips: [
        'Visit during Navratri for grand celebrations',
        'Offer traditional red saree to the goddess',
        'Explore the nearby fort and historical sites',
        'Follow temple dress code strictly'
      ]
    },
    howToReach: { 
      summary: 'Located in Osmanabad district, 45 km from Osmanabad city.',
      full: 'Tuljapur is about 45 km from Osmanabad city and 250 km from Pune. Regular buses connect Tuljapur to Pune, Solapur, and other major cities. The nearest railway station is Osmanabad, from where buses and taxis are available.'
    },
    visitor_info: {
      timings: '5:00 AM - 10:00 PM (Daily)',
      entryFee: 'Free entry (special darshan tickets available)',
      bestTimeToVisit: 'October to March, Navratri period',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Mahalakshmi Temple, Kolhapur',
    category: 'Temple',
    year: '7th century',
    location: { 
      coordinates: [74.2264, 16.7050], 
      city: 'Kolhapur',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Ancient Shakti Peetha dedicated to Goddess Mahalakshmi, one of Maharashtra\'s most important temples.',
      full: 'Mahalakshmi Temple in Kolhapur is one of the most revered temples in Maharashtra, dedicated to Goddess Mahalakshmi. Built in the 7th century, it is considered one of the 51 Shakti Peethas. The temple is famous for its unique feature where the image of the goddess is carved from a single black stone and adorned with precious ornaments. The temple complex includes various smaller shrines and is known for its architectural beauty and spiritual significance.',
      history: 'Built in the 7th century during the Chalukya period. The temple has been renovated several times, with significant additions during the Maratha period under the patronage of Chhatrapati Shahu Maharaj.',
      architecture: 'Hemadri style architecture with beautiful stone carvings. The main sanctum houses a black stone image of the goddess. The temple has a unique feature where sunlight directly falls on the goddess\'s face twice a year.',
      significance: 'One of the 51 Shakti Peethas. Major pilgrimage center in Maharashtra. Symbol of divine feminine power and prosperity.',
      visitingTips: [
        'Witness the sunlight phenomenon on specific days',
        'Visit during Navaratri for grand celebrations',
        'Explore the temple museum',
        'Try the famous Kolhapur prasad'
      ]
    },
    howToReach: { 
      summary: 'Located in Kolhapur city center, well connected by road and rail.',
      full: 'Mahalakshmi Temple is located in the heart of Kolhapur city. Kolhapur is well connected by road and rail to Mumbai, Pune, and other major cities. The temple is easily accessible by local transport from any part of the city.'
    },
    visitor_info: {
      timings: '5:00 AM - 10:00 PM (Daily)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March, Navaratri period',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Aundha Nagnath Temple',
    category: 'Temple',
    year: '12th century',
    location: { 
      coordinates: [77.0508, 19.5403], 
      city: 'Aundha Nagnath',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'One of the twelve Jyotirlinga shrines, ancient temple with unique architectural features.',
      full: 'Aundha Nagnath Temple is one of the twelve Jyotirlinga shrines of Lord Shiva, located in Hingoli district of Maharashtra. The temple is believed to have been built in the 12th century and is known for its unique architectural style. According to legend, this is where Lord Shiva appeared as Nagnath (lord of serpents). The temple complex includes various smaller shrines and is surrounded by ancient fortification walls.',
      history: 'Built in the 12th century during the Yadava period. The temple has been mentioned in various ancient texts and has been a significant pilgrimage site for centuries.',
      architecture: 'Hemadri architectural style with intricate stone carvings. The temple has a unique circular sanctum and beautiful sculptures depicting various Hindu deities.',
      significance: 'One of the twelve Jyotirlingas. Ancient center of Shaivism. Important pilgrimage destination in Maharashtra.',
      visitingTips: [
        'Visit during Maha Shivratri for special celebrations',
        'Explore the ancient fortification walls',
        'Photography allowed in outer areas',
        'Local guides available for historical information'
      ]
    },
    howToReach: { 
      summary: 'Located in Hingoli district, accessible by road from Nanded and Aurangabad.',
      full: 'Aundha Nagnath is about 30 km from Hingoli and 150 km from Nanded. Regular buses connect the temple to Hingoli, Nanded, and other nearby cities. The nearest major railway station is Nanded, from where buses and taxis are available.'
    },
    visitor_info: {
      timings: '5:00 AM - 10:00 PM (Daily)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March, Maha Shivratri',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Grishneshwar Temple',
    category: 'Temple',
    year: '18th century',
    location: { 
      coordinates: [75.1856, 20.0247], 
      city: 'Verul',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Last and twelfth Jyotirlinga shrine, located near Ellora Caves.',
      full: 'Grishneshwar Temple is the smallest among the twelve Jyotirlinga shrines and is located near the famous Ellora Caves. Also known as Ghrneshwar, the temple was built in the 18th century by Ahilyabai Holkar. The temple is unique for its location near the UNESCO World Heritage site of Ellora and its beautiful red stone architecture. According to the Shiva Purana, this is the last or twelfth Jyotirlinga that appeared on earth.',
      history: 'The original temple is ancient, but the current structure was built by Ahilyabai Holkar in the 18th century. The temple has been mentioned in various Puranas and ancient texts.',
      architecture: 'Built with red stone in traditional South Indian architectural style. The temple has beautiful carvings and a unique five-story structure with intricate sculptures.',
      significance: 'The twelfth and last Jyotirlinga. Located near UNESCO World Heritage site. Symbol of devotion and architectural beauty.',
      visitingTips: [
        'Combine visit with Ellora Caves (2 km away)',
        'Visit during early morning for peaceful darshan',
        'Photography allowed in outer areas',
        'Can be covered in Aurangabad sightseeing tour'
      ]
    },
    howToReach: { 
      summary: 'Located 11 km from Aurangabad, very close to Ellora Caves.',
      full: 'Grishneshwar Temple is located about 11 km from Aurangabad city and just 2 km from Ellora Caves. Regular buses and taxis are available from Aurangabad. Most visitors combine this with Ellora Caves visit as they are very close to each other.'
    },
    visitor_info: {
      timings: '5:30 AM - 9:30 PM (Daily)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March',
      duration: '1 hour'
    }
  },

  // Palaces & Museums
  {
    name: 'Aga Khan Palace',
    category: 'Palace',
    year: '1892',
    location: { 
      coordinates: [73.9078, 18.5372], 
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Historic palace and memorial, significant site in India\'s freedom struggle.',
      full: 'Aga Khan Palace, built in 1892 by Sultan Muhammed Shah Aga Khan III, is one of the most significant landmarks in Pune. The palace served as a prison for Mahatma Gandhi, his wife Kasturba Gandhi, and Sarojini Naidu during the Quit India Movement in 1942. Today, it functions as a memorial to Gandhi and houses a museum with artifacts related to his life and the freedom struggle. The palace is known for its Italian arches, spacious lawns, and beautiful architecture.',
      history: 'Built by Aga Khan III in 1892. Served as prison for Gandhi and other freedom fighters during 1942-1944. Converted into a national memorial after independence.',
      architecture: 'Indo-Islamic architecture with Italian arches and spacious halls. Beautiful gardens and lawns surrounding the palace. The architecture reflects the grandeur of the Aga Khan dynasty.',
      significance: 'National memorial to Mahatma Gandhi. Site of historic significance in India\'s freedom struggle. Houses Gandhi\'s ashes.',
      visitingTips: [
        'Visit the Gandhi memorial and museum',
        'Explore the beautiful gardens',
        'Sound and light show in the evenings',
        'Photography allowed in most areas'
      ]
    },
    howToReach: { 
      summary: 'Located in Kalyani Nagar area of Pune, easily accessible by road.',
      full: 'Aga Khan Palace is located in Kalyani Nagar, about 8 km from Pune railway station. It is well connected by city buses, auto-rickshaws, and taxis. The palace is easily accessible from all parts of Pune city.'
    },
    visitor_info: {
      timings: '9:00 AM - 5:30 PM (Closed on Mondays)',
      entryFee: 'Indians: ₹5, Foreigners: ₹100',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Raja Dinkar Kelkar Museum',
    category: 'Museum',
    year: '1962',
    location: { 
      coordinates: [73.8550, 18.5092], 
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Unique museum showcasing Indian arts, crafts, and cultural artifacts.',
      full: 'Raja Dinkar Kelkar Museum is one of India\'s most remarkable private museums, showcasing the extensive collection of Dr. Dinkar G. Kelkar. Established in 1962, the museum houses over 20,000 artifacts representing Indian culture and heritage. The collection includes musical instruments, war weapons, decorative arts, textiles, paintings, and everyday objects that provide insights into Indian life across different periods. The museum is famous for its diverse collection ranging from ancient sculptures to mastani mahal artifacts.',
      history: 'Established in 1962 by Dr. Dinkar G. Kelkar as a tribute to his son Raja who died at a young age. The collection was gathered over several decades from all over India.',
      architecture: 'Traditional Maharashtrian architecture with beautiful courtyards and galleries. The building itself reflects the cultural heritage that the museum represents.',
      significance: 'One of India\'s finest private museums. Preserves diverse aspects of Indian cultural heritage. Important educational resource.',
      visitingTips: [
        'Allow 2-3 hours to explore the entire collection',
        'Don\'t miss the musical instruments gallery',
        'Photography restrictions in some sections',
        'Guided tours available for groups'
      ]
    },
    howToReach: { 
      summary: 'Located in Shukrawar Peth, central Pune, near Shaniwar Wada.',
      full: 'The museum is located in Shukrawar Peth area of Pune, very close to Shaniwar Wada. It is easily accessible by city buses, auto-rickshaws, and taxis from all parts of Pune. The nearest landmark is Shaniwar Wada.'
    },
    visitor_info: {
      timings: '9:30 AM - 5:30 PM (Closed on Wednesdays)',
      entryFee: 'Indians: ₹10, Foreigners: ₹50',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Prince of Wales Museum',
    category: 'Museum',
    year: '1922',
    location: { 
      coordinates: [72.8328, 18.9267], 
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Premier museum showcasing Indian art, natural history, and cultural heritage.',
      full: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya, formerly known as Prince of Wales Museum, is Mumbai\'s premier museum housing an extensive collection of Indian art, natural history, and cultural artifacts. Built in 1922, the museum building itself is an architectural marvel combining Indo-Saracenic style. The museum has three main sections: Art, Natural History, and Archaeology, featuring sculptures, paintings, decorative arts, and artifacts from various periods of Indian history.',
      history: 'Built in 1922 during British colonial period as Prince of Wales Museum. Renamed after Chhatrapati Shivaji Maharaj. Founded to commemorate the visit of Prince of Wales to India.',
      architecture: 'Indo-Saracenic architecture designed by George Wittet. Features beautiful dome, towers, and courtyards. The building itself is a heritage structure.',
      significance: 'Premier cultural institution in Mumbai. Houses priceless artifacts of Indian heritage. Important center for art and culture education.',
      visitingTips: [
        'Allow at least 2-3 hours for complete visit',
        'Don\'t miss the miniature paintings collection',
        'Visit the natural history section',
        'Audio guides available for detailed information'
      ]
    },
    howToReach: { 
      summary: 'Located near Gateway of India in South Mumbai, well connected by all transport modes.',
      full: 'The museum is located in Fort area of South Mumbai, very close to Gateway of India. It is easily accessible by Mumbai local trains (CST/Churchgate stations), buses, taxis, and the metro. The nearest bus stops are Regal Cinema and Colaba.'
    },
    visitor_info: {
      timings: '10:15 AM - 6:00 PM (Closed on Mondays)',
      entryFee: 'Indians: ₹70, Foreigners: ₹500, Students: ₹20',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },

  // Historic Buildings
  {
    name: 'Crawford Market',
    category: 'Historic Building',
    year: '1869',
    location: { 
      coordinates: [72.8364, 18.9472], 
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Historic wholesale market building, architectural landmark of Victorian Mumbai.',
      full: 'Crawford Market, officially known as Mahatma Jyotiba Phule Mandai, is one of South Mumbai\'s most famous markets and a heritage building. Built in 1869, it was designed by Lockwood Kipling (father of Rudyard Kipling) and is an excellent example of Victorian Gothic architecture. The market was named after Arthur Crawford, the first Municipal Commissioner of Mumbai. The building features beautiful stone carvings, a clock tower, and stained glass windows depicting rural Indian scenes.',
      history: 'Built in 1869 during British colonial period. Named after Arthur Crawford, Mumbai\'s first Municipal Commissioner. Renamed as Mahatma Jyotiba Phule Mandai after independence.',
      architecture: 'Victorian Gothic Revival architecture with Norman and Flemish influences. Features beautiful stone carvings by Lockwood Kipling, ornate clock tower, and decorative elements.',
      significance: 'One of Mumbai\'s oldest markets. Important example of Victorian architecture in India. Historic commercial and cultural landmark.',
      visitingTips: [
        'Visit early morning for fresh produce',
        'Explore the architecture and stone carvings',
        'Try local fruits and spices',
        'Photography allowed in most areas'
      ]
    },
    howToReach: { 
      summary: 'Located in South Mumbai, near CST station, easily accessible by local trains and buses.',
      full: 'Crawford Market is located near Chhatrapati Shivaji Terminus (CST) in South Mumbai. It is easily accessible by Mumbai local trains, buses, and taxis. The nearest railway stations are CST and Masjid Bunder.'
    },
    visitor_info: {
      timings: '11:00 AM - 8:00 PM (Closed on Sundays)',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March, early mornings for best experience',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Rajabai Clock Tower',
    category: 'Historic Building',
    year: '1878',
    location: { 
      coordinates: [72.8281, 18.9289], 
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Iconic Victorian Gothic clock tower, landmark of Mumbai University campus.',
      full: 'Rajabai Clock Tower is a clock tower in South Mumbai built in the Victorian Gothic Revival architectural style. It stands at a height of 85 meters (280 ft) and was completed in 1878. The tower was designed by Sir George Gilbert Scott and financed by Premchand Roychand, a Parsi businessman, who named it after his mother Rajabai. The tower features beautiful stone carvings and originally played 16 different tunes. It is part of the University of Mumbai campus and a UNESCO World Heritage Site.',
      history: 'Built between 1869-1878, designed by Sir George Gilbert Scott. Financed by Premchand Roychand and named after his mother. Part of the University of Mumbai complex.',
      architecture: 'Victorian Gothic Revival style inspired by Giotto\'s Campanile in Florence. Features intricate stone carvings, clock mechanism, and originally had a carillon of 16 bells.',
      significance: 'UNESCO World Heritage Site as part of Victorian Gothic and Art Deco Ensembles of Mumbai. Iconic landmark of Mumbai skyline.',
      visitingTips: [
        'Best viewed from outside as entry is restricted',
        'Great for photography, especially at sunset',
        'Combine with University of Mumbai campus visit',
        'Visit nearby Oval Maidan for better views'
      ]
    },
    howToReach: { 
      summary: 'Located in Fort area, Mumbai University campus, accessible by local trains and buses.',
      full: 'The tower is located within the University of Mumbai campus in Fort area of South Mumbai. It is easily accessible by Mumbai local trains from Churchgate or CST stations, buses, and taxis.'
    },
    visitor_info: {
      timings: 'External viewing only (Entry restricted)',
      entryFee: 'Free (external viewing)',
      bestTimeToVisit: 'October to March, sunset for photography',
      duration: '30 minutes'
    }
  },
  {
    name: 'High Court Bombay',
    category: 'Historic Building',
    year: '1878',
    location: { 
      coordinates: [72.8322, 18.9300], 
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India' 
    },
    info: { 
      summary: 'Historic courthouse and architectural marvel, seat of judiciary for Maharashtra and Goa.',
      full: 'The Bombay High Court is the high court of the Indian states of Maharashtra and Goa, with official seats in Mumbai and Panaji. The current building was completed in 1878 and is one of the oldest High Courts in India. Built in Early English Gothic Revival architecture, it features beautiful stone work, stained glass windows, and an impressive facade. The building houses a law library, multiple courtrooms, and administrative offices.',
      history: 'Established in 1862, current building completed in 1878. One of the three High Courts established during British rule. Designed by Colonel James Augustus Fuller.',
      architecture: 'Early English Gothic Revival style with beautiful stone facade, pointed arches, and ornate details. Features a 180-foot tall central tower and beautiful stained glass windows.',
      significance: 'One of India\'s oldest High Courts. Important judicial institution. Fine example of Gothic Revival architecture in Mumbai.',
      visitingTips: [
        'Entry restricted to legal professionals and litigants',
        'Admire the architecture from outside',
        'Photography restrictions apply',
        'Guided tours occasionally available'
      ]
    },
    howToReach: { 
      summary: 'Located in Fort area of South Mumbai, near Churchgate station.',
      full: 'The High Court is located in Fort area of South Mumbai, very close to Churchgate railway station. It is easily accessible by Mumbai local trains, buses, and taxis. The nearest landmarks are Churchgate station and Oval Maidan.'
    },
    visitor_info: {
      timings: '10:30 AM - 4:45 PM (Court working days, external viewing)',
      entryFee: 'Entry restricted (external viewing free)',
      bestTimeToVisit: 'October to March',
      duration: '30 minutes (external viewing)'
    }
  },
  {
    name: 'Jaisalmer Fort',
    category: 'Historic Fort',
    year: '1156',
    location: { 
      coordinates: [70.9083, 26.9157],
      city: 'Jaisalmer',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Living fort with one-quarter population still residing inside, part of Hill Forts of Rajasthan.',
      full: 'Jaisalmer Fort is one of the very few living forts in the world, with about one quarter of the old city\'s population still residing within the fort. It is situated in Jaisalmer city in Rajasthan. Built in 1156 AD by the Rajput ruler Rawal Jaisal, from where it derives its name.',
      history: 'Built in 1156 by Rawal Jaisal. Has been the scene of many battles between Bhattis, Mughals and Rathores.',
      architecture: 'Yellow sandstone construction, called "Sonar Quila" (Golden Fort). Features 99 bastions, 92 of which were built between 1633-1647.',
      significance: 'Part of UNESCO Hill Forts of Rajasthan. One of the few living forts in the world.',
      visitingTips: ['Explore havelis inside fort', 'Visit at sunset for golden glow', 'Stay overnight in heritage hotels', 'Shop for traditional handicrafts']
    },
    howToReach: { summary: 'Jaisalmer city center', full: 'Jaisalmer connected by rail and road. Fort in city center, walkable from main bazaar' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '24 hours (residential fort)',
      entryFee: '₹50 for Indians, ₹250 for foreigners (palace museum)',
      bestTimeToVisit: 'November to February',
      duration: 'Half day to full day'
    }
  },
  {
    name: 'Mehrangarh Fort',
    category: 'Historic Fort',
    year: '1459',
    location: { 
      coordinates: [73.0189, 26.2978],
      city: 'Jodhpur',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'One of the largest forts in India, situated on a hill 410 feet above Jodhpur.',
      full: 'Mehrangarh Fort is a historic fort located in Jodhpur. Built around 1459 by Rao Jodha, the fort is situated 410 feet above the city and is enclosed by imposing thick walls. Inside its boundaries there are several palaces known for their intricate carvings and expansive courtyards.',
      history: 'Founded by Rao Jodha in 1459. Various additions made by successive rulers over centuries.',
      architecture: 'Red sandstone structure with seven gates. Features elaborate palaces with carved panels, latticed windows and museum.',
      significance: 'One of the largest and most well-preserved forts in India. Houses an excellent museum.',
      visitingTips: ['Take audio guide for detailed history', 'Visit palace museum', 'Enjoy panoramic city views', 'Zip-lining activity available']
    },
    howToReach: { summary: 'Jodhpur city, 5 km from railway station', full: 'Well connected by auto and taxi. Visible from most parts of Jodhpur' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 5:00 PM daily',
      entryFee: '₹100 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '3-4 hours'
    }
  },
  {
    name: 'City Palace, Udaipur',
    category: 'Palace',
    year: '1559',
    location: { 
      coordinates: [73.6833, 24.5761],
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Palace complex on the banks of Lake Pichola, blend of Rajasthani and Mughal architecture.',
      full: 'The City Palace, Udaipur is a palace complex situated in the city of Udaipur in Rajasthan. It was built over a period of nearly 400 years, with contributions from several rulers of the Mewar dynasty. Its construction began in 1559 by Maharana Udai Singh II.',
      history: 'Construction started in 1559 by Maharana Udai Singh II. Subsequent additions made by his successors.',
      architecture: 'Blend of Rajasthani, Mughal, Medieval, European and Chinese architecture. Built with granite and marble.',
      significance: 'Largest palace complex in Rajasthan. Still home to the royal family.',
      visitingTips: ['Visit palace museum', 'Take boat ride on Lake Pichola', 'See crystal gallery', 'Best views at sunset']
    },
    howToReach: { summary: 'On Lake Pichola banks, central Udaipur', full: 'Udaipur well connected by air, rail and road. Palace in city center' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:30 AM to 5:30 PM daily',
      entryFee: '₹300 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'India Gate',
    category: 'Monument',
    year: '1931',
    location: { 
      coordinates: [77.2295, 28.6129],
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    },
    info: { 
      summary: 'War memorial arch dedicated to Indian soldiers who died in World War I.',
      full: 'The India Gate is a war memorial located astride the Rajpath, on the eastern edge of the "ceremonial axis" of New Delhi. It stands as a memorial to 84,000 soldiers of the British Indian Army who died between 1914-1921 in the First World War. Designed by Sir Edwin Lutyens, it was inaugurated in 1931.',
      history: 'Foundation stone laid in 1921, completed in 1931. Originally called All India War Memorial.',
      architecture: 'Inspired by the Arc de Triomphe in Paris. 42 meters tall arch made of red and pale sandstone and granite.',
      significance: 'National monument and popular gathering spot. Site of Republic Day parade.',
      visitingTips: ['Visit in evening when illuminated', 'Boat rides available at nearby India Gate Canal', 'Popular picnic spot', 'Be cautious of vendors']
    },
    howToReach: { summary: 'Central Delhi on Rajpath', full: 'Well connected by Delhi Metro (Central Secretariat station). Buses and taxis available' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '24 hours (Open area)',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March, evening hours',
      duration: '1 hour'
    }
  },
  {
    name: 'Lotus Temple',
    category: 'Temple',
    year: '1986',
    location: { 
      coordinates: [77.2588, 28.5535],
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    },
    info: { 
      summary: 'Bahá\'í House of Worship shaped like a lotus flower.',
      full: 'The Lotus Temple is a Bahá\'í House of Worship in Delhi, notable for its flowerlike shape. Completed in 1986, it serves as the Mother Temple of the Indian subcontinent and has become a prominent attraction in the city. It is open to people of all religions and backgrounds.',
      history: 'Designed by Iranian architect Fariborz Sahba. Completed in 1986 and dedicated on December 24, 1986.',
      architecture: 'Composed of 27 free-standing marble-clad "petals" arranged in clusters to form a lotus. Modern architectural marvel.',
      significance: 'Won numerous architectural awards. One of the most visited buildings in the world with over 100 million visitors.',
      visitingTips: ['Maintain silence inside', 'No photography inside temple', 'Remove shoes before entering', 'Visit during weekdays to avoid crowds']
    },
    howToReach: { summary: 'South Delhi, near Kalkaji', full: 'Nearest metro station is Kalkaji Mandir. Well connected by buses and taxis' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 5:30 PM (Closed Mondays)',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      duration: '1 hour'
    }
  },
  {
    name: 'Charminar',
    category: 'Monument',
    year: '1591',
    location: { 
      coordinates: [78.4747, 17.3616],
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India'
    },
    info: { 
      summary: 'Monument and mosque with four grand arches, symbol of Hyderabad.',
      full: 'The Charminar is a monument and mosque located in Hyderabad. The landmark was built in 1591 by Muhammad Quli Qutb Shah, the fifth sultan of the Qutb Shahi dynasty. It is listed among the most recognized structures of India.',
      history: 'Built in 1591 by Muhammad Quli Qutb Shah to commemorate the end of a deadly plague.',
      architecture: 'Indo-Islamic architecture with four grand arches facing the cardinal directions. Four minarets rise to 48.7 meters.',
      significance: 'Symbol of Hyderabad and icon of Indian heritage. Center of Old City.',
      visitingTips: ['Visit Laad Bazaar nearby for bangles', 'Try Hyderabadi biryani at nearby restaurants', 'Climb minarets for city view', 'Evening visit recommended when lit up']
    },
    howToReach: { summary: 'Old City, Hyderabad', full: 'Well connected by metro, buses and autos. Charminar metro station nearby' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:30 AM to 5:30 PM daily',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to February',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Golconda Fort',
    category: 'Historic Fort',
    year: '13th century',
    location: { 
      coordinates: [78.4011, 17.3833],
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India'
    },
    info: { 
      summary: 'Historic fort known for its acoustic system and diamond trading center.',
      full: 'Golconda Fort is a fortified citadel built by the Kakatiyas and later the capital of the Qutb Shahi dynasty in 16th-17th century. The fort is famous for its acoustic architecture, palaces, and ingenious water supply system. It was once renowned for diamond trade.',
      history: 'Originally built by Kakatiya dynasty in 13th century. Fortified and expanded by Qutb Shahi dynasty in 16th century.',
      architecture: 'Fortification with eight gates, four drawbridges, acoustic system, and grand palaces.',
      significance: 'Famous for its acoustic system and diamond trade. Koh-i-Noor diamond was found at the mines near Golconda.',
      visitingTips: ['Attend sound and light show', 'Visit in evening for cooler weather', 'Climb to top for panoramic views', 'Wear comfortable shoes']
    },
    howToReach: { summary: '11 km from Hyderabad', full: 'Well connected by local buses and taxis from Hyderabad city' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 5:30 PM daily',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Basilica of Bom Jesus',
    category: 'UNESCO World Heritage',
    year: '1605',
    location: { 
      coordinates: [73.9115, 15.5008],
      city: 'Old Goa',
      state: 'Goa',
      country: 'India'
    },
    info: { 
      summary: 'Baroque church holding the mortal remains of St. Francis Xavier.',
      full: 'The Basilica of Bom Jesus is located in Goa and is a UNESCO World Heritage Site. The basilica holds the mortal remains of St. Francis Xavier, a close friend of St. Ignatius Loyola who founded the Society of Jesus (Jesuits). It is one of the oldest churches in India.',
      history: 'Completed in 1605. Houses the body of St. Francis Xavier since 1624.',
      architecture: 'Baroque architecture with Corinthian, Doric, Ionic and Composite styles. Notable for mosaic floor and gilded altars.',
      significance: 'Part of UNESCO Churches and Convents of Goa. Major pilgrimage site.',
      visitingTips: ['Dress modestly', 'Photography not allowed inside', 'Visit Se Cathedral nearby', 'Attend morning mass']
    },
    howToReach: { summary: '10 km from Panaji', full: 'Part of Old Goa church complex. Buses and taxis from Panaji' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1590164082906-367c37d5ba50?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 6:30 PM (Daily)',
      entryFee: 'Free',
      bestTimeToVisit: 'November to February',
      duration: '1 hour'
    }
  },
  {
    name: 'Brihadeeswarar Temple',
    category: 'UNESCO World Heritage',
    year: '1010',
    location: { 
      coordinates: [79.1312, 10.7825],
      city: 'Thanjavur',
      state: 'Tamil Nadu',
      country: 'India'
    },
    info: { 
      summary: 'One of the largest South Indian temples, part of Great Living Chola Temples.',
      full: 'The Brihadeeswarar Temple is a Hindu temple dedicated to Shiva located in Thanjavur. It is one of the largest South Indian temples and an exemplar of Tamil architecture during the Chola period. The temple is part of the UNESCO World Heritage Site "Great Living Chola Temples".',
      history: 'Built by Raja Raja Chola I between 1003 and 1010 CE. Celebrated its 1000th anniversary in 2010.',
      architecture: 'Dravidian architecture with 66-meter tall vimana (tower). Features massive Nandi bull statue and elaborate sculptures.',
      significance: 'UNESCO World Heritage Site. Architectural marvel built entirely with granite without binding material.',
      visitingTips: ['Visit early morning for special puja', 'Observe shadow of vimana never falls on ground at noon', 'Photography allowed outside', 'Dress modestly']
    },
    howToReach: { summary: 'Central Thanjavur', full: 'Thanjavur well connected by rail and road. Temple 3 km from railway station' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 8:30 PM daily',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      duration: '2 hours'
    }
  },
  {
    name: 'Ranthambore Fort',
    category: 'Historic Fort',
    year: '944 CE',
    location: { 
      coordinates: [76.4597, 26.0173],
      city: 'Sawai Madhopur',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Historic fort within Ranthambore National Park, part of Hill Forts of Rajasthan.',
      full: 'Ranthambore Fort lies within the Ranthambore National Park, near Sawai Madhopur. The fort was the scene of many wars between the rulers of Jaipur and other invading forces. It is part of the UNESCO World Heritage Site "Hill Forts of Rajasthan".',
      history: 'Built by Chauhan rulers in 944 CE. Witnessed many battles including Alauddin Khilji\'s siege.',
      architecture: 'Massive fortification with temples, palaces, pavilions and huge reservoirs spread over 7 km.',
      significance: 'Part of UNESCO Hill Forts of Rajasthan. Strategically located fort with rich history.',
      visitingTips: ['Combine with tiger safari in Ranthambore', 'Trek to fort early morning', 'Visit Ganesh temple inside', 'Carry water and wear trekking shoes']
    },
    howToReach: { summary: 'Within Ranthambore National Park', full: 'Sawai Madhopur railway station 11 km away. Accessible during park visits' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 6:00 PM (Park timings)',
      entryFee: 'Park entry + ₹40/₹600',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Kumbhalgarh Fort',
    category: 'Historic Fort',
    year: '15th century',
    location: { 
      coordinates: [73.5853, 25.1523],
      city: 'Kumbhalgarh',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Fort with the second longest continuous wall in the world after the Great Wall of China.',
      full: 'Kumbhalgarh Fort is a Mewar fortress on the westerly range of Aravalli Hills in Rajsamand district. Built during the 15th century by Rana Kumbha, the fort has perimeter walls that extend 36 km, making it the second longest continuous wall in the world after the Great Wall of China.',
      history: 'Built by Rana Kumbha in 15th century. Birthplace of Maharana Pratap.',
      architecture: '36 km long wall (second longest in world), 360 temples, palaces, and seven fortified gateways.',
      significance: 'Part of UNESCO Hill Forts of Rajasthan. Never conquered in battle.',
      visitingTips: ['Attend light and sound show', 'Trek the fort walls', 'Visit Badal Mahal for views', 'Stay overnight at nearby resorts']
    },
    howToReach: { summary: '64 km from Udaipur', full: 'Well connected by road from Udaipur. Taxis and buses available' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 6:00 PM daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '3-4 hours'
    }
  },
  {
    name: 'Chittor Fort',
    category: 'Historic Fort',
    year: '7th century',
    location: { 
      coordinates: [74.6295, 24.8879],
      city: 'Chittorgarh',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Largest fort in India and Asia, part of Hill Forts of Rajasthan.',
      full: 'Chittor Fort is one of the largest forts in India and Asia. It is a UNESCO World Heritage Site located in Chittorgarh. The fort covers an area of 280 hectares and is a massive structure with 7 gates. The fort has witnessed three major sieges, most famously associated with Rani Padmini.',
      history: 'Built in 7th century by Mauryans. Capital of Mewar for 800 years until 1568.',
      architecture: 'Spread over 280 hectares with palaces, temples, towers including Vijay Stambh and Kirti Stambh.',
      significance: 'Largest fort in India. Part of UNESCO Hill Forts of Rajasthan. Symbol of Rajput valor.',
      visitingTips: ['Visit Vijay Stambh (Tower of Victory)', 'See Rani Padmini Palace and Gaumukh Reservoir', 'Hire a guide or take audio tour', 'Need full day to explore']
    },
    howToReach: { summary: 'Chittorgarh city', full: 'Chittorgarh well connected by rail and road. Fort 5 km from city center' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:45 AM to 5:30 PM daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: 'Full day'
    }
  },
  {
    name: 'Nalanda University Ruins',
    category: 'UNESCO World Heritage',
    year: '5th century CE',
    location: { 
      coordinates: [85.4477, 25.1358],
      city: 'Nalanda',
      state: 'Bihar',
      country: 'India'
    },
    info: { 
      summary: 'Ancient university and Buddhist monastery, one of the first residential universities in the world.',
      full: 'Nalanda was an ancient Mahavihara, a large Buddhist monastery in the ancient kingdom of Magadha. The site is located about 95 kilometres southeast of Patna and is a UNESCO World Heritage Site. It was one of the most renowned centers of learning in ancient India.',
      history: 'Founded in 5th century CE, flourished under Gupta and Pala empires. Destroyed in 12th century by invaders.',
      architecture: 'Remains of stupas, monasteries, temples and university buildings spread over 14 hectares.',
      significance: 'UNESCO World Heritage Site since 2016. Ancient seat of learning that attracted students from across Asia.',
      visitingTips: ['Visit archaeological museum', 'Hire guide for historical context', 'Visit new Nalanda University nearby', 'Photography allowed']
    },
    howToReach: { summary: '90 km from Patna', full: 'Rajgir is nearest town (12 km). Buses and taxis from Patna and Bodh Gaya' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset daily',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Rani ki Vav (The Queen\'s Stepwell)',
    category: 'UNESCO World Heritage',
    year: '11th century',
    location: { 
      coordinates: [72.0989, 23.8589],
      city: 'Patan',
      state: 'Gujarat',
      country: 'India'
    },
    info: { 
      summary: 'Intricately constructed stepwell on the banks of Saraswati River.',
      full: 'Rani ki Vav is a stepwell situated in Patan, Gujarat. It was built in 1063 by Udayamati of Chaulukya Dynasty as a memorial to her husband King Bhima I. It is one of the largest and finest stepwells in India and is considered a masterpiece of architectural and technological achievement.',
      history: 'Built in 11th century, rediscovered in 1940s after being buried under silt.',
      architecture: '64 meters long, 20 meters wide, 27 meters deep with seven levels of stairs. Over 500 sculptures.',
      significance: 'UNESCO World Heritage Site since 2014. Finest example of stepwell architecture.',
      visitingTips: ['Visit in morning for best light', 'Descend all levels', 'Study intricate sculptures', 'Combine with Patan Patola heritage']
    },
    howToReach: { summary: 'Patan city, 125 km from Ahmedabad', full: 'Well connected by road. Regular buses from Ahmedabad' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM to 6:00 PM daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Dilwara Temples',
    category: 'Temple',
    year: '11th-13th century',
    location: { 
      coordinates: [72.7125, 24.6027],
      city: 'Mount Abu',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Group of Jain temples famous for extraordinary marble carvings.',
      full: 'The Dilwara Temples are a group of five Jain temples located at Dilwara near Mount Abu in Rajasthan. These temples were built between the 11th and 13th centuries and are famous for their use of marble and intricate carvings. They are considered to be one of the most beautiful Jain pilgrimage sites.',
      history: 'Built between 11th-13th centuries by Chalukya rulers. Vimal Vasahi temple is the oldest (1031).',
      architecture: 'White marble construction with extraordinarily intricate carvings on ceilings, pillars and doorways.',
      significance: 'Outstanding examples of temple architecture and marble artistry.',
      visitingTips: ['Remove leather items before entry', 'Photography strictly prohibited', 'Visit during noon to afternoon', 'Dress modestly']
    },
    howToReach: { summary: '2.5 km from Mount Abu', full: 'Mount Abu well connected by road. Temples accessible by taxi or auto' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '12:00 PM to 6:00 PM daily',
      entryFee: 'Free (No photography)',
      bestTimeToVisit: 'October to March',
      duration: '2 hours'
    }
  },
  {
    name: 'Tirupati Balaji Temple',
    category: 'Temple',
    year: '300 CE (current structure 9th century)',
    location: { 
      coordinates: [79.3473, 13.6833],
      city: 'Tirumala',
      state: 'Andhra Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'One of the richest and most visited Hindu temples in the world.',
      full: 'Sri Venkateswara Swamy Temple is a Hindu temple situated in the hill town of Tirumala at Tirupati in Chittoor district of Andhra Pradesh. The Temple is dedicated to Lord Venkateswara, an incarnation of Vishnu, who is believed to have appeared here to save mankind from trials and troubles of Kali Yuga.',
      history: 'Original temple believed to be built in 300 CE. Current structure dates to 9th century with additions over time.',
      architecture: 'Dravidian architecture with gold-plated copper dome (Ananda Nilayam) and elaborate gopuram.',
      significance: 'Most visited place of worship in the world with 50,000-100,000 pilgrims daily. Richest temple in India.',
      visitingTips: [
        'Book darshan online in advance',
        'Expect long queues during festivals',
        'Donate hair as offering (optional)',
        'Carry valid ID for verification'
      ]
    },
    howToReach: {
      summary: 'Located in Tirumala hills, 22 km from Tirupati, accessible by road and special buses.',
      full: 'The temple is situated on Tirumala hills and can be reached from Tirupati town via road or special temple buses.',
      byAir: {
        nearestAirport: 'Tirupati Airport',
        distance: '35 km',
        description: 'Regular flights from major cities. Buses and taxis available to Tirumala.'
      },
      byRail: {
        nearestStation: 'Tirupati Railway Station', 
        distance: '22 km',
        description: 'Well connected to major cities. Special buses available to Tirumala hills.'
      },
      byRoad: {
        fromMajorCities: [
          {
            city: 'Chennai',
            distance: '150 km',
            route: 'Chennai - Kanchipuram - Tirupati',
            duration: '3 hours'
          },
          {
            city: 'Bengaluru',
            distance: '250 km', 
            route: 'Bengaluru - Chittoor - Tirupati',
            duration: '4-5 hours'
          }
        ],
        localTransport: 'Special temple buses from Tirupati, private vehicles allowed with prior booking.'
      }
    },
    view360: {
      summary: '360° Street View available.',
      iframeUrl: '',
      full: 'Experience a 360° Street View of Tirupati Temple.',
      heading: 180,
      pitch: 0
    },
    model3d: {
      summary: '3D model available.',
      url: '/3dmodels/tirupati-temple',
      full: 'Explore the 3D model of Tirupati Temple.',
      sketchfabId: 'tirupati3dmodelid'
    },
    media: {
      panorama_url: 'https://images.unsplash.com/photo-1580500550469-4e3b05b1aaa4?w=1200&h=600&fit=crop'
    },
    visitor_info: {
      timings: '24 hours (Different darshan timings)',
      entryFee: 'Free (Special darshan tickets available)', 
      bestTimeToVisit: 'September to March',
      duration: '4-8 hours (including waiting time)'
    }
  },

  // UNESCO World Heritage Sites - Rest of India
  {
    name: 'Taj Mahal',
    category: 'UNESCO World Heritage',
    year: '1653',
    location: { 
      coordinates: [78.0421, 27.1751],
      city: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Iconic white marble mausoleum built by Mughal Emperor Shah Jahan.',
      full: 'The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in Agra. It was commissioned in 1631 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal. The tomb is the centrepiece of a 17-hectare complex, which includes a mosque and a guest house, and is set in formal gardens bounded on three sides by a crenellated wall.',
      history: 'Construction began around 1632 and was completed in 1653. More than 20,000 artisans were employed from across the empire and Central Asia.',
      architecture: 'Indo-Islamic architecture combining elements from Persian, Ottoman Turkish and Indian architectural styles.',
      significance: 'Designated as a UNESCO World Heritage Site in 1983. Considered the jewel of Muslim art in India and one of the universally admired masterpieces of the world\'s heritage.',
      visitingTips: ['Visit during sunrise or sunset for best views', 'Book tickets online to avoid queues', 'Friday is closed for prayers', 'No food or photography inside the main mausoleum']
    },
    howToReach: { summary: 'By road, rail, or air to Agra', full: 'Agra is well connected by road, rail and air to major Indian cities' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset (Closed on Fridays)',
      entryFee: '₹50 for Indians, ₹1100 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Qutub Minar',
    category: 'UNESCO World Heritage',
    year: '1193',
    location: { 
      coordinates: [77.1855, 28.5244],
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    },
    info: { 
      summary: 'Tallest brick minaret in the world, 73 meters high.',
      full: 'The Qutub Minar is a minaret and "victory tower" that forms part of the Qutb complex. It is a UNESCO World Heritage Site in the Mehrauli area of New Delhi. The height of Qutub Minar is 72.5 meters, making it the tallest minaret in the world built of bricks.',
      history: 'Construction was started in 1192 by Qutb ud-Din Aibak and completed by Iltutmish. The tower has five distinct storeys, each marked by a projecting balcony.',
      architecture: 'Built with red sandstone and marble. The architectural style is influenced by Afghan and Indian traditions.',
      significance: 'UNESCO World Heritage Site since 1993. Represents the beginning of Muslim rule in India.',
      visitingTips: ['Best time is early morning or late afternoon', 'Combine visit with nearby Iron Pillar', 'Photography allowed', 'Wear comfortable shoes for walking']
    },
    howToReach: { summary: 'By Delhi Metro or road', full: 'Located in South Delhi, accessible via Qutub Minar metro station' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset daily',
      entryFee: '₹35 for Indians, ₹550 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Red Fort',
    category: 'UNESCO World Heritage',
    year: '1648',
    location: { 
      coordinates: [77.2410, 28.6562],
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    },
    info: { 
      summary: 'Historic fortified palace and main residence of Mughal emperors.',
      full: 'The Red Fort is a historic fort in Old Delhi that served as the main residence of the Mughal Emperors. Every year on India\'s Independence Day, the Prime Minister hoists the Indian flag at the main gate and delivers a nationally broadcast speech from its ramparts.',
      history: 'Built by Emperor Shah Jahan in 1648 when he shifted his capital from Agra to Delhi. It remained the Mughal capital until 1857.',
      architecture: 'Built with red sandstone, the fort is octagonal in shape with walls extending 2.5 km. It combines Mughal, Persian, Timurid and Hindu architectural traditions.',
      significance: 'UNESCO World Heritage Site since 2007. Symbol of India and its independence.',
      visitingTips: ['Attend the evening light and sound show', 'Hire a guide for detailed history', 'Visit Diwan-i-Aam and Diwan-i-Khas', 'Closed on Mondays']
    },
    howToReach: { summary: 'By Delhi Metro or road', full: 'Accessible via Lal Qila metro station on Violet Line' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1597059171940-2d19c1bc0b0e?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:30 AM to 4:30 PM (Closed Mondays)',
      entryFee: '₹35 for Indians, ₹550 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Humayun\'s Tomb',
    category: 'UNESCO World Heritage',
    year: '1570',
    location: { 
      coordinates: [77.2508, 28.5933],
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    },
    info: { 
      summary: 'Magnificent Mughal tomb, precursor to the Taj Mahal.',
      full: 'Humayun\'s Tomb is the tomb of the Mughal Emperor Humayun in Delhi. The tomb was commissioned by Humayun\'s first wife and chief consort, Empress Bega Begum, in 1565-72, 14 years after his death. It was the first garden-tomb on the Indian subcontinent and inspired several major architectural innovations, culminating in the construction of the Taj Mahal.',
      history: 'Designed by Persian architect Mirak Mirza Ghiyas and completed in 1572. It set a precedent for subsequent Mughal architecture.',
      architecture: 'First example of Mughal architecture in India with Persian influence. Features the char bagh (four-part garden) layout.',
      significance: 'UNESCO World Heritage Site since 1993. First example of this monumental scale of tomb construction in India.',
      visitingTips: ['Visit during golden hour for photography', 'Explore the surrounding char bagh gardens', 'Combine with nearby Isa Khan tomb', 'Well maintained pathways for wheelchairs']
    },
    howToReach: { summary: 'By Delhi Metro or road', full: 'Near JLN Stadium metro station, easily accessible by auto or taxi' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset daily',
      entryFee: '₹35 for Indians, ₹550 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Khajuraho Group of Monuments',
    category: 'UNESCO World Heritage',
    year: '950-1050 CE',
    location: { 
      coordinates: [79.9199, 24.8318],
      city: 'Khajuraho',
      state: 'Madhya Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Group of Hindu and Jain temples famous for their nagara-style architecture and erotic sculptures.',
      full: 'The Khajuraho Group of Monuments is a group of Hindu and Jain temples in Chhatarpur district of Madhya Pradesh. About 600 meters away, Jain temples are located southeast to the Hindu temples. They are one of the most popular tourist destinations in India. The temples are famous for their nagara-style architectural symbolism and their erotic sculptures.',
      history: 'Built by Chandela dynasty between 950 and 1050 CE. Originally there were 85 temples, of which only 25 survive today.',
      architecture: 'Finest examples of Hindu temple architecture with intricate carvings depicting various aspects of life including erotic art.',
      significance: 'UNESCO World Heritage Site since 1986. Masterpiece of Indian art and a unique artistic creation.',
      visitingTips: ['Visit Western Group first (main temples)', 'Attend light and sound show in evening', 'Hire a guide to understand symbolism', 'Best visited October to February']
    },
    howToReach: { summary: 'By air, rail or road', full: 'Khajuraho has airport with daily flights from major cities' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to February',
      duration: 'Full day'
    }
  },
  {
    name: 'Konark Sun Temple',
    category: 'UNESCO World Heritage',
    year: '1250',
    location: { 
      coordinates: [86.0949, 19.8876],
      city: 'Konark',
      state: 'Odisha',
      country: 'India'
    },
    info: { 
      summary: '13th-century Sun Temple designed as a gigantic chariot with elaborately carved stone wheels and horses.',
      full: 'The Konark Sun Temple is a 13th-century CE Sun Temple at Konark about 35 kilometres northeast of Puri on the coastline of Odisha. The temple is attributed to king Narasimhadeva I of the Eastern Ganga Dynasty about 1250 CE. The temple was designed to look like the chariot of Surya (the Sun God), with 24 wheels and pulled by 7 horses.',
      history: 'Built around 1250 CE by King Narasimhadeva I. The temple was known to European sailors as the Black Pagoda.',
      architecture: 'Kalinga architecture with intricate stone carvings depicting the entire range of human life and activities.',
      significance: 'UNESCO World Heritage Site since 1984. Masterpiece of Odisha\'s medieval architecture.',
      visitingTips: ['Visit early morning for best light', 'Attend Konark Dance Festival (December)', 'Photography allowed', 'Combine with Puri beach visit']
    },
    howToReach: { summary: 'By road from Puri or Bhubaneswar', full: '35 km from Puri, 65 km from Bhubaneswar. Well connected by buses' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to February',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Hampi',
    category: 'UNESCO World Heritage',
    year: '14th-16th century',
    location: { 
      coordinates: [76.4729, 15.3350],
      city: 'Hampi',
      state: 'Karnataka',
      country: 'India'
    },
    info: { 
      summary: 'Ruins of the Vijayanagara Empire, one of the greatest Hindu kingdoms.',
      full: 'Hampi is a UNESCO World Heritage Site located in east-central Karnataka. It was the capital of the Vijayanagara Empire in the 14th century. The site comprises more than 1,600 surviving remains of the last great Hindu kingdom in South India that include forts, riverside features, royal and sacred complexes, temples, shrines, pillared halls, mandapas, memorial structures, water structures and others.',
      history: 'Hampi was the capital of Vijayanagara Empire from 1336 to 1565. At its peak, it was one of the richest cities in the world.',
      architecture: 'Dravidian style temples with elaborate gopurams, intricate carvings and magnificent structures scattered over 4,100 hectares.',
      significance: 'UNESCO World Heritage Site since 1986. Outstanding example of a cultural landscape.',
      visitingTips: ['Rent bicycle or scooter to explore', 'Visit Virupaksha Temple at sunrise', 'Climb Matanga Hill for panoramic views', 'Stay 2-3 days to explore fully']
    },
    howToReach: { summary: 'By train to Hospet, then bus or taxi', full: 'Nearest railway station is Hospet (13 km). Buses available from Bangalore and Goa' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Site open 24 hours, temples 6 AM to 6 PM',
      entryFee: 'Most sites free, some temples ₹40/₹600',
      bestTimeToVisit: 'October to February',
      duration: '2-3 days'
    }
  },
  {
    name: 'Mahabodhi Temple',
    category: 'UNESCO World Heritage',
    year: '5th-6th century',
    location: { 
      coordinates: [84.9914, 24.6961],
      city: 'Bodh Gaya',
      state: 'Bihar',
      country: 'India'
    },
    info: { 
      summary: 'Sacred Buddhist site where Gautama Buddha attained enlightenment.',
      full: 'The Mahabodhi Temple is a UNESCO World Heritage Site located in Bodh Gaya. It marks the location where the Buddha is said to have attained enlightenment. The temple is 50 m (160 ft) tall and was built by Emperor Asoka in the 3rd century BCE, and the present temple dates from the 5th–6th centuries.',
      history: 'Built originally by Emperor Asoka around 260 BCE. The current temple structure dates to the late Gupta period (5th-6th century CE).',
      architecture: 'One of the earliest Buddhist temples built entirely in brick, still standing in India from the late Gupta period.',
      significance: 'UNESCO World Heritage Site since 2002. Most important Buddhist pilgrimage site in the world.',
      visitingTips: ['Visit Bodhi Tree where Buddha attained enlightenment', 'Attend morning prayers', 'Explore meditation park', 'Dress modestly']
    },
    howToReach: { summary: 'By train to Gaya, then taxi', full: 'Gaya airport and railway station are 13 km away. Well connected to major cities' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '5:00 AM to 9:00 PM daily',
      entryFee: 'Free entry',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Agra Fort',
    category: 'UNESCO World Heritage',
    year: '1565-1573',
    location: { 
      coordinates: [78.0211, 27.1795],
      city: 'Agra',
      state: 'Uttar Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Historic Mughal fort and UNESCO World Heritage Site near Taj Mahal.',
      full: 'Agra Fort is a historical fort in the city of Agra. It was the main residence of the emperors of the Mughal Dynasty until 1638, when the capital was shifted from Agra to Delhi. The fort is a UNESCO World Heritage site located about 2.5 kilometres northwest of the Taj Mahal.',
      history: 'Built by Mughal Emperor Akbar in 1565-1573. Later additions were made by Shah Jahan.',
      architecture: 'Red sandstone construction with blend of Hindu and Islamic architectural styles.',
      significance: 'UNESCO World Heritage Site since 1983. Important example of Mughal military architecture.',
      visitingTips: ['Visit before or after Taj Mahal', 'See Musamman Burj where Shah Jahan was imprisoned', 'Photography allowed', 'Hire guide for historical details']
    },
    howToReach: { summary: 'Short distance from Taj Mahal', full: '2.5 km from Taj Mahal, easily accessible by auto or taxi' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset (Closed Fridays)',
      entryFee: '₹50 for Indians, ₹650 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Fatehpur Sikri',
    category: 'UNESCO World Heritage',
    year: '1571-1585',
    location: { 
      coordinates: [77.6611, 27.0945],
      city: 'Fatehpur Sikri',
      state: 'Uttar Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Historic fortified city built by Mughal Emperor Akbar.',
      full: 'Fatehpur Sikri is a town in the Agra District of Uttar Pradesh. The historical city was constructed by Mughal Emperor Akbar beginning in 1571 and served as the empire\'s capital from 1571 to 1585, when it was abandoned due to water shortage.',
      history: 'Built by Akbar in 1571 to honor Sufi saint Salim Chishti. Abandoned after just 14 years due to water scarcity.',
      architecture: 'Blend of Hindu and Islamic architecture with red sandstone buildings including Buland Darwaza, the highest gateway in the world.',
      significance: 'UNESCO World Heritage Site since 1986. Exceptional testimony to Mughal civilization.',
      visitingTips: ['Visit Buland Darwaza, the 54-meter high victory gate', 'See Jama Masjid and tomb of Salim Chishti', 'Go early to avoid crowds', 'Wear comfortable shoes']
    },
    howToReach: { summary: '40 km from Agra', full: 'Well connected by road from Agra. Buses and taxis available' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset daily',
      entryFee: '₹50 for Indians, ₅50 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '3-4 hours'
    }
  },
  {
    name: 'Sanchi Stupa',
    category: 'UNESCO World Heritage',
    year: '3rd century BCE',
    location: { 
      coordinates: [77.7395, 23.4793],
      city: 'Sanchi',
      state: 'Madhya Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Ancient Buddhist complex with stupas, monasteries and temples.',
      full: 'Sanchi Stupa is a Buddhist complex located at Sanchi Town in Raisen District of Madhya Pradesh. The Great Stupa at Sanchi is one of the oldest stone structures in India and was originally commissioned by Emperor Ashoka in the 3rd century BCE.',
      history: 'Commissioned by Emperor Ashoka in the 3rd century BCE. Expanded and embellished over subsequent centuries.',
      architecture: 'Hemispherical dome with four ornately carved gateways (toranas) depicting scenes from Buddha\'s life.',
      significance: 'UNESCO World Heritage Site since 1989. Most complete ancient Buddhist monument surviving in India.',
      visitingTips: ['Start with Great Stupa (Stupa 1)', 'Study the carved gateways carefully', 'Visit museum nearby', 'Best in morning or evening light']
    },
    howToReach: { summary: '46 km from Bhopal', full: 'Nearest airport and railway station is Bhopal. Regular buses and taxis available' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Kaziranga National Park',
    category: 'UNESCO World Heritage',
    year: '1905',
    location: { 
      coordinates: [93.3713, 26.5775],
      city: 'Kaziranga',
      state: 'Assam',
      country: 'India'
    },
    info: { 
      summary: 'Wildlife sanctuary famous for the great one-horned rhinoceros.',
      full: 'Kaziranga National Park is a national park in the Golaghat and Nagaon districts of Assam. The park hosts two-thirds of the world\'s great one-horned rhinoceroses and is a World Heritage Site.',
      history: 'Declared a reserve forest in 1908, became a wildlife sanctuary in 1950, and a national park in 1974.',
      architecture: 'N/A - Natural landscape',
      significance: 'UNESCO World Heritage Site since 1985. Highest density of tigers among protected areas in the world.',
      visitingTips: ['Book jeep or elephant safari in advance', 'Visit November to April when park is open', 'Stay at Kohora for park access', 'Carry binoculars for bird watching']
    },
    howToReach: { summary: 'By road from Guwahati', full: '200 km from Guwahati. Nearest airport is Jorhat (97 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'November to April (Park closed during monsoons)',
      entryFee: 'Safari: ₹1250-2500 depending on zone',
      bestTimeToVisit: 'November to April',
      duration: 'Half day to full day'
    }
  },
  {
    name: 'Churches and Convents of Goa',
    category: 'UNESCO World Heritage',
    year: '16th-17th century',
    location: { 
      coordinates: [73.9115, 15.5007],
      city: 'Old Goa',
      state: 'Goa',
      country: 'India'
    },
    info: { 
      summary: 'Collection of churches and convents representing Portuguese colonial architecture.',
      full: 'The Churches and Convents of Goa are a collection of seven religious buildings located in Old Goa. They represent the evangelization of Asia by Portuguese missionaries and the introduction of Renaissance and Baroque architecture in India.',
      history: 'Built between 16th and 18th centuries during Portuguese colonial rule. Old Goa was the capital of Portuguese India.',
      architecture: 'Portuguese Renaissance and Baroque architecture including Basilica of Bom Jesus and Se Cathedral.',
      significance: 'UNESCO World Heritage Site since 1986. Finest example of Portuguese colonial churches in Asia.',
      visitingTips: ['Visit Basilica of Bom Jesus (St. Francis Xavier\'s tomb)', 'See Se Cathedral, largest church in Asia', 'Dress modestly', 'Combine with Old Goa museum']
    },
    howToReach: { summary: '10 km from Panaji', full: 'Well connected by bus and taxi from Panaji and other parts of Goa' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1590164082906-367c37d5ba50?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 6:30 PM daily',
      entryFee: 'Free entry (donations welcome)',
      bestTimeToVisit: 'November to February',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Group of Monuments at Pattadakal',
    category: 'UNESCO World Heritage',
    year: '7th-8th century',
    location: { 
      coordinates: [75.8180, 15.9453],
      city: 'Pattadakal',
      state: 'Karnataka',
      country: 'India'
    },
    info: { 
      summary: 'Complex of 7th and 8th century Hindu and Jain temples.',
      full: 'Pattadakal is a UNESCO World Heritage Site located in Karnataka. The site has nine Hindu temples and a Jain sanctuary, dated from the 7th to the 9th century. It represents a fusion of architectural forms from northern and southern India.',
      history: 'Built during the Chalukya dynasty in 7th-8th centuries. It was the coronation city of the Chalukyan kings.',
      architecture: 'Blend of Dravidian (South Indian) and Nagara (North Indian) temple architecture styles.',
      significance: 'UNESCO World Heritage Site since 1987. Harmonious blend of architectural forms from northern and southern India.',
      visitingTips: ['Visit Virupaksha Temple, the main attraction', 'Go early morning to avoid heat', 'Combine with nearby Aihole and Badami', 'Photography allowed']
    },
    howToReach: { summary: '22 km from Badami', full: 'Nearest town is Badami. Well connected by road from Hubli (110 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 6:00 PM daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Elephanta Caves',
    category: 'UNESCO World Heritage',
    year: '5th-8th century',
    location: { 
      coordinates: [72.9315, 18.9633],
      city: 'Elephanta Island',
      state: 'Maharashtra',
      country: 'India'
    },
    info: { 
      summary: 'Rock-cut cave temples dedicated to Lord Shiva on Elephanta Island.',
      full: 'The Elephanta Caves are a UNESCO World Heritage Site and a collection of cave temples predominantly dedicated to the Hindu god Shiva. They are located on Elephanta Island, in Mumbai Harbour, 10 kilometres east of Mumbai. The rock-cut sculptures and reliefs depicting Hindu mythology are exceptional examples of medieval Indian art.',
      history: 'Created between 5th to 8th centuries, probably during the reign of the Kalachuri or Konkan Mauryas.',
      architecture: 'Rock-cut architecture with elaborate sculptures. The main cave features the famous Trimurti (three-faced Shiva) sculpture.',
      significance: 'UNESCO World Heritage Site since 1987. Masterpiece of rock-cut architecture and sculpture.',
      visitingTips: ['Take ferry from Gateway of India', 'Climb 120 steps to reach caves', 'Visit Tuesday to Sunday (closed Monday)', 'Carry water and wear comfortable shoes']
    },
    howToReach: { summary: 'Ferry from Gateway of India', full: 'Regular ferry service from Gateway of India in Mumbai. Journey takes about 1 hour' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1595655509796-62913ee2e5fc?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 5:30 PM (Closed Mondays)',
      entryFee: '₹40 for Indians, ₹600 for foreigners (plus ferry charges)',
      bestTimeToVisit: 'October to March',
      duration: '3-4 hours including ferry'
    }
  },
  {
    name: 'Champaner-Pavagadh Archaeological Park',
    category: 'UNESCO World Heritage',
    year: '8th-14th century',
    location: { 
      coordinates: [73.5364, 22.4839],
      city: 'Champaner',
      state: 'Gujarat',
      country: 'India'
    },
    info: { 
      summary: 'Concentration of largely unexcavated archaeological, historic and living cultural heritage.',
      full: 'The Champaner-Pavagadh Archaeological Park is a UNESCO World Heritage Site located in Panchmahal district in Gujarat. The site contains remains of 11 different types of buildings including mosques, temples, granaries, tombs, wells, walls and terraces from the 8th to 14th centuries.',
      history: 'Capital of Gujarat Sultanate from 1484 to 1535. The city was later abandoned.',
      architecture: 'Blend of Hindu and Islamic architectural styles. Features pre-Mughal Islamic city architecture.',
      significance: 'UNESCO World Heritage Site since 2004. Unique example of pre-Mughal Islamic and Hindu architecture.',
      visitingTips: ['Take cable car to Pavagadh hill temple', 'Visit Jami Masjid, the main mosque', 'Wear comfortable shoes for exploring', 'Carry water and snacks']
    },
    howToReach: { summary: '47 km from Vadodara', full: 'Nearest city is Vadodara. Well connected by road and rail' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM to 6:00 PM daily',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: 'Full day'
    }
  },
  {
    name: 'Chhatrapati Shivaji Terminus',
    category: 'UNESCO World Heritage',
    year: '1887',
    location: { 
      coordinates: [72.8347, 18.9398],
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    info: { 
      summary: 'Historic railway station, an outstanding example of Victorian Gothic Revival architecture.',
      full: 'Chhatrapati Shivaji Terminus (formerly Victoria Terminus) is a UNESCO World Heritage Site and historic railway station in Mumbai. It serves as the headquarters of the Central Railways. Designed by Frederick William Stevens, it is an outstanding example of Victorian Gothic Revival architecture in India.',
      history: 'Built in 1887 to commemorate Queen Victoria\'s Golden Jubilee. Took 10 years to complete.',
      architecture: 'Victorian Gothic Revival with traditional Indian palace architecture. Features dome, turrets, pointed arches and eccentric ground plan.',
      significance: 'UNESCO World Heritage Site since 2004. Symbol of Bombay as the Gothic city and major mercantile port.',
      visitingTips: ['View from outside as it\'s a working station', 'Best photographed in evening with lighting', 'Explore nearby Fort area', 'Be cautious in crowded areas']
    },
    howToReach: { summary: 'Central Mumbai, well connected by local trains', full: 'CST is a major railway station. All local trains and many long-distance trains stop here' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1595401020176-6f207b4150be?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '24 hours (working railway station)',
      entryFee: 'Free (exterior viewing)',
      bestTimeToVisit: 'October to March',
      duration: '30 minutes to 1 hour'
    }
  },
  {
    name: 'Jantar Mantar, Jaipur',
    category: 'UNESCO World Heritage',
    year: '1734',
    location: { 
      coordinates: [75.8247, 26.9247],
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Collection of nineteen architectural astronomical instruments.',
      full: 'The Jantar Mantar in Jaipur is a collection of nineteen architectural astronomical instruments built by Maharaja Sawai Jai Singh II. It features the world\'s largest stone sundial and is a UNESCO World Heritage Site.',
      history: 'Built between 1727 and 1734 by Maharaja Sawai Jai Singh II, a Rajput king and astronomer.',
      architecture: 'Massive masonry instruments combining astronomy, astrology and architecture.',
      significance: 'UNESCO World Heritage Site since 2010. Expression of astronomical skills and cosmological concepts of ancient India.',
      visitingTips: ['Hire a guide to understand instruments', 'Visit in morning for better understanding', 'See the world\'s largest stone sundial', 'Photography allowed']
    },
    howToReach: { summary: 'Central Jaipur, near City Palace', full: 'Well connected by local transport. Near City Palace and Hawa Mahal' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 4:30 PM daily',
      entryFee: '₹50 for Indians, ₹200 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Hill Forts of Rajasthan',
    category: 'UNESCO World Heritage',
    year: '8th-18th century',
    location: { 
      coordinates: [73.9855, 26.9833],
      city: 'Various locations',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Series of six forts: Chittorgarh, Kumbhalgarh, Ranthambore, Gagron, Amber, Jaisalmer.',
      full: 'The Hill Forts of Rajasthan is a serial UNESCO World Heritage Site comprising six majestic forts in the north-western state of Rajasthan: Chittor Fort, Kumbhalgarh, Ranthambore Fort, Gagron Fort, Amber Fort and Jaisalmer Fort. Built by various Rajput rulers, these forts represent the elaborate fortification systems of Rajput military hill architecture.',
      history: 'Built between 8th and 18th centuries by various Rajput rulers to protect their kingdoms.',
      architecture: 'Hill fort architecture with massive walls, gates, temples, palaces and water reservoirs.',
      significance: 'UNESCO World Heritage Site since 2013. Represents Rajput military hill architecture and state power.',
      visitingTips: ['Each fort requires separate visit', 'Amber Fort is most accessible', 'Kumbhalgarh has longest wall after Great Wall', 'Plan multiple days for all forts']
    },
    howToReach: { summary: 'Spread across Rajasthan', full: 'Each fort in different city. Well connected by road and rail' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Varies by fort (usually 9 AM to 5 PM)',
      entryFee: '₹25-100 for Indians, ₹200-550 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: 'Half day per fort'
    }
  },
  {
    name: 'Rani ki Vav',
    category: 'UNESCO World Heritage',
    year: '1063',
    location: { 
      coordinates: [72.0989, 23.8589],
      city: 'Patan',
      state: 'Gujarat',
      country: 'India'
    },
    info: { 
      summary: 'Intricately constructed stepwell on the banks of Saraswati River.',
      full: 'Rani ki Vav (Queen\'s Stepwell) is a stepwell situated in Patan. It was built in 1063 by Udayamati of Chaulukya Dynasty as a memorial to her husband King Bhima I. It is one of the finest and largest examples of stepwell architecture in Gujarat.',
      history: 'Built in 1063 AD and rediscovered in 1940s after being buried under silt for centuries.',
      architecture: 'Seven levels of stairs with sculptured panels of over 500 principal sculptures and over 1000 minor ones.',
      significance: 'UNESCO World Heritage Site since 2014. Finest example of stepwell architecture demonstrating ancient water management.',
      visitingTips: ['Best visited in morning light', 'Descend all seven levels', 'Observe intricate sculptures', 'Photography allowed']
    },
    howToReach: { summary: '125 km from Ahmedabad', full: 'Well connected by road from Ahmedabad. Nearest railway station is Patan' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM to 6:00 PM daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Great Living Chola Temples',
    category: 'UNESCO World Heritage',
    year: '11th-12th century',
    location: { 
      coordinates: [79.1325, 10.7825],
      city: 'Thanjavur, Gangaikonda Cholapuram, Darasuram',
      state: 'Tamil Nadu',
      country: 'India'
    },
    info: { 
      summary: 'Three great Chola temples: Brihadisvara Temple at Thanjavur, Gangaikonda Cholapuram and Airavatesvara Temple at Darasuram.',
      full: 'The Great Living Chola Temples is a UNESCO World Heritage Site comprising three great 11th and 12th century Chola temples: the Brihadisvara Temple at Thanjavur, the Temple of Gangaikonda Cholapuram and the Airavatesvara Temple at Darasuram.',
      history: 'Built during the Chola Empire (11th-12th centuries), representing the zenith of Chola architecture.',
      architecture: 'Dravidian temple architecture with soaring vimanas (towers), intricate sculptures and bronze works.',
      significance: 'UNESCO World Heritage Site since 1987 (expanded 2004). Masterpieces of Dravidian architecture.',
      visitingTips: ['Start with Thanjavur (Brihadisvara)', 'Visit all three for complete experience', 'Hire guide for historical context', 'Dress modestly']
    },
    howToReach: { summary: 'Thanjavur well connected by rail and road', full: 'Thanjavur is main hub. Other two temples within 70 km' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 8:30 PM daily',
      entryFee: 'Free (donations welcome)',
      bestTimeToVisit: 'October to March',
      duration: 'Half day per temple'
    }
  },
  {
    name: 'Rock Shelters of Bhimbetka',
    category: 'UNESCO World Heritage',
    year: 'Paleolithic period',
    location: { 
      coordinates: [77.6167, 22.9333],
      city: 'Bhimbetka',
      state: 'Madhya Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Archaeological site with Stone Age rock paintings and shelters.',
      full: 'The Bhimbetka rock shelters are an archaeological site in Raisen District. They exhibit the earliest traces of human life in India and evidence of Stone Age starting at the site in Acheulian times. It is a UNESCO World Heritage Site that consists of seven hills and over 750 rock shelters.',
      history: 'Some paintings date back to 30,000 years, spanning from Paleolithic to Medieval period.',
      architecture: 'Natural rock shelters with prehistoric cave paintings depicting daily life, animals and hunting scenes.',
      significance: 'UNESCO World Heritage Site since 2003. Oldest known rock art in Indian subcontinent.',
      visitingTips: ['Hire a guide to find painted shelters', 'Wear comfortable trekking shoes', 'Carry water and snacks', 'Photography allowed']
    },
    howToReach: { summary: '46 km from Bhopal', full: 'Accessible by road from Bhopal. Regular buses and taxis available' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '7:00 AM to 5:30 PM daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Sundarbans National Park',
    category: 'UNESCO World Heritage',
    year: '1984',
    location: { 
      coordinates: [88.8597, 21.9497],
      city: 'Sundarbans',
      state: 'West Bengal',
      country: 'India'
    },
    info: { 
      summary: 'Largest mangrove forest in the world, home to Bengal tigers.',
      full: 'The Sundarbans is a UNESCO World Heritage Site in the delta region formed by the confluence of the Ganges, Brahmaputra and Meghna Rivers in the Bay of Bengal. It is the largest mangrove forest in the world and home to the Bengal tiger.',
      history: 'Designated as a wildlife sanctuary in 1977, became a National Park in 1984.',
      architecture: 'N/A - Natural landscape',
      significance: 'UNESCO World Heritage Site since 1987. Largest tidal halophytic mangrove forest in the world.',
      visitingTips: ['Book boat safari in advance', 'Best time is winter months', 'Stay overnight at forest lodges', 'Carry binoculars and camera with zoom']
    },
    howToReach: { summary: 'By road from Kolkata', full: '110 km from Kolkata. Take boat from Godkhali or Sonakhali' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'September to March (Park closed during monsoons)',
      entryFee: '₹100 for Indians, ₹1000 for foreigners (plus boat charges)',
      bestTimeToVisit: 'November to February',
      duration: '2-3 days'
    }
  },
  {
    name: 'Nanda Devi and Valley of Flowers National Parks',
    category: 'UNESCO World Heritage',
    year: '1982',
    location: { 
      coordinates: [79.6667, 30.5000],
      city: 'Chamoli',
      state: 'Uttarakhand',
      country: 'India'
    },
    info: { 
      summary: 'High altitude Himalayan biodiversity hotspot with endemic alpine flowers.',
      full: 'Nanda Devi and Valley of Flowers National Parks is a UNESCO World Heritage Site in Uttarakhand. The Valley of Flowers National Park is renowned for its meadows of endemic alpine flowers and outstanding natural beauty. Nanda Devi National Park has one of the most spectacular mountain wilderness.',
      history: 'Valley of Flowers discovered in 1931 by British mountaineers. Nanda Devi became national park in 1982.',
      architecture: 'N/A - Natural landscape',
      significance: 'UNESCO World Heritage Site since 1988 (Nanda Devi) and 2005 (Valley of Flowers combined). Outstanding biodiversity with many endemic species.',
      visitingTips: ['Trek to Valley of Flowers July-August', 'Nanda Devi core zone closed to visitors', 'Moderate to difficult trek', 'Carry warm clothing']
    },
    howToReach: { summary: 'Trek from Govindghat', full: 'Fly to Dehradun, drive to Govindghat (275 km), then 10 km trek' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'June to October only',
      entryFee: '₹150 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'July to September',
      duration: '3-4 days trek'
    }
  },
  {
    name: 'Mountain Railways of India',
    category: 'UNESCO World Heritage',
    year: '1881-1908',
    location: { 
      coordinates: [88.2650, 27.0410],
      city: 'Darjeeling, Ooty, Shimla',
      state: 'West Bengal, Tamil Nadu, Himachal Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Three mountain railways: Darjeeling Himalayan Railway, Nilgiri Mountain Railway, Kalka-Shimla Railway.',
      full: 'The Mountain Railways of India is a UNESCO World Heritage Site comprising three railways: the Darjeeling Himalayan Railway (1881), the Nilgiri Mountain Railway (1908), and the Kalka-Shimla Railway (1903). They are outstanding examples of innovative transportation solutions in mountainous terrain.',
      history: 'Built during British colonial rule to access hill stations. Still operational today.',
      architecture: 'Engineering marvels with loops, spirals and zigzag reverses to climb steep gradients.',
      significance: 'UNESCO World Heritage Site since 1999 (Darjeeling), extended 2005 (Nilgiri) and 2008 (Kalka-Shimla). Bold and ingenious engineering solutions.',
      visitingTips: ['Book toy train rides in advance', 'Darjeeling route most scenic', 'Ride in observation car', 'Best during clear weather']
    },
    howToReach: { summary: 'Each railway in different state', full: 'Darjeeling (West Bengal), Ooty (Tamil Nadu), Shimla (Himachal Pradesh)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Varies by railway',
      entryFee: '₹800-1200 for full journey',
      bestTimeToVisit: 'March to June, September to November',
      duration: '2-7 hours depending on route'
    }
  },

  // More Iconic Monuments and Sites
  {
    name: 'Hawa Mahal',
    category: 'Monument',
    year: '1799',
    location: { 
      coordinates: [75.8267, 26.9239],
      city: 'Jaipur',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Palace of Winds, iconic five-story palace with 953 small windows.',
      full: 'Hawa Mahal (Palace of Winds) is a palace in Jaipur. Built from red and pink sandstone, the palace is designed in such a way that during summers, a cool breeze blows through all the windows, giving the palace its name.',
      history: 'Built in 1799 by Maharaja Sawai Pratap Singh. Designed by architect Lal Chand Ustad.',
      architecture: 'Unique five-story exterior resembling honeycomb with 953 small windows (jharokhas) decorated with intricate latticework.',
      significance: 'Icon of Jaipur. Built to allow royal women to observe street festivals without being seen.',
      visitingTips: ['Best viewed from outside in morning light', 'Visit City Palace museum inside', 'Early morning less crowded', 'Photography allowed']
    },
    howToReach: { summary: 'Central Jaipur, near Johari Bazaar', full: 'Well connected by auto, taxi and local buses' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 5:00 PM daily',
      entryFee: '₹50 for Indians, ₹200 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '1 hour'
    }
  },
  {
    name: 'Mysore Palace',
    category: 'Palace',
    year: '1912',
    location: { 
      coordinates: [76.6552, 12.3051],
      city: 'Mysore',
      state: 'Karnataka',
      country: 'India'
    },
    info: { 
      summary: 'Official residence of the Wadiyar dynasty, one of India\'s most visited monuments.',
      full: 'Mysore Palace, also known as Amba Vilas Palace, is a historical palace and a royal residence. It is the official residence of the Wadiyar dynasty and the seat of the Kingdom of Mysore. The palace is one of the most visited monuments in India after the Taj Mahal.',
      history: 'Current structure built between 1897-1912 after the old palace was destroyed by fire in 1897.',
      architecture: 'Indo-Saracenic style blending Hindu, Muslim, Rajput and Gothic elements.',
      significance: 'One of the most visited monuments in India. Architectural marvel and symbol of Mysore.',
      visitingTips: ['Visit on Sunday evening when palace is illuminated', 'Photography not allowed inside', 'Audio guides available', 'Visit during Dasara festival for grand celebrations']
    },
    howToReach: { summary: 'Central Mysore, well connected', full: 'Mysore well connected by rail and road from Bangalore (150 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '10:00 AM to 5:30 PM daily',
      entryFee: '₹70 for Indians, ₹200 for foreigners',
      bestTimeToVisit: 'October (Dasara), October to February',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Victoria Memorial',
    category: 'Monument',
    year: '1921',
    location: { 
      coordinates: [88.3426, 22.5448],
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India'
    },
    info: { 
      summary: 'Large marble building dedicated to Queen Victoria, now a museum.',
      full: 'The Victoria Memorial is a large marble building dedicated to Queen Victoria, located in Kolkata. It was built between 1906 and 1921 and is one of the most popular tourist destinations in Kolkata. It now serves as a museum and tourist destination.',
      history: 'Built to commemorate Queen Victoria\'s 25-year reign in India. Inaugurated by the Prince of Wales in 1921.',
      architecture: 'Indo-Saracenic revivalist style blending British and Mughal elements with Venetian, Egyptian, Deccani and Islamic features.',
      significance: 'Landmark monument in Kolkata. Symbol of British colonial legacy.',
      visitingTips: ['Visit gardens in evening', 'Explore museum galleries inside', 'Sound and light show available', 'Best photographed during golden hour']
    },
    howToReach: { summary: 'Central Kolkata, near Maidan', full: 'Well connected by metro, buses and taxis' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1569976710208-b52636b52c09?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '10:00 AM to 5:00 PM (Closed Mondays)',
      entryFee: '₹30 for Indians, ₹500 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Meenakshi Temple',
    category: 'Temple',
    year: '6th century (rebuilt 17th century)',
    location: { 
      coordinates: [78.1197, 9.9195],
      city: 'Madurai',
      state: 'Tamil Nadu',
      country: 'India'
    },
    info: { 
      summary: 'Historic Hindu temple dedicated to Meenakshi, with stunning gopurams.',
      full: 'Meenakshi Amman Temple is a historic Hindu temple located on the southern bank of the Vaigai River in Madurai. It is dedicated to Meenakshi, a form of Parvati, and her consort, Sundareshwar (Shiva). The temple complex covers 14 acres and has 14 gateway towers (gopurams), the tallest being 51.9 meters high.',
      history: 'Original temple dates to 6th century. Most of current structure rebuilt between 1623-1655.',
      architecture: 'Dravidian architecture with elaborate gopurams featuring thousands of colorful sculptures.',
      significance: 'One of the most important Shiva temples and pilgrimage site. Candidate for UNESCO World Heritage Site.',
      visitingTips: ['Dress modestly (traditional attire preferred)', 'Remove shoes before entering', 'Visit during aarti times', 'Cameras not allowed inside']
    },
    howToReach: { summary: 'Central Madurai, well connected', full: 'Madurai has airport and railway station. Temple in city center' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '5:00 AM to 12:30 PM, 4:00 PM to 9:30 PM',
      entryFee: 'Free (special darshan ₹50)',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Amber Fort',
    category: 'Historic Fort',
    year: '1592',
    location: { 
      coordinates: [75.8513, 26.9855],
      city: 'Amer',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Majestic fort overlooking Maota Lake, part of Hill Forts of Rajasthan.',
      full: 'Amber Fort or Amer Fort is a fort located in Amer, 11 kilometres from Jaipur. The fort is known for its artistic Hindu style elements, with large ramparts, series of gates and cobbled paths overlooking Maota Lake.',
      history: 'Built in 1592 by Raja Man Singh I. Amber was the capital of the Kachwaha Rajputs for centuries.',
      architecture: 'Blend of Hindu and Mughal architecture with red sandstone and marble. Features Sheesh Mahal (Mirror Palace).',
      significance: 'Part of UNESCO Hill Forts of Rajasthan. Most visited fort in Jaipur.',
      visitingTips: ['Take elephant or jeep ride up the hill', 'Visit Sheesh Mahal (Mirror Palace)', 'Sound and light show in evening', 'Go early to avoid crowds']
    },
    howToReach: { summary: '11 km from Jaipur', full: 'Regular buses, taxis and autos from Jaipur. Can combine with Jaigarh Fort visit' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM to 5:30 PM daily',
      entryFee: '₹100 for Indians, ₹500 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Jama Masjid, Delhi',
    category: 'Monument',
    year: '1656',
    location: { 
      coordinates: [77.2330, 28.6507],
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    },
    info: { 
      summary: 'One of the largest mosques in India, built by Mughal Emperor Shah Jahan.',
      full: 'Jama Masjid is one of the largest mosques in India, located in Old Delhi. Built by Mughal Emperor Shah Jahan, it can accommodate 25,000 worshippers at once.',
      history: 'Construction began in 1650 and was completed in 1656. Built by Shah Jahan with 5,000 workers.',
      architecture: 'Red sandstone and white marble structure with three great gates, four towers and two minarets standing 40m high.',
      significance: 'One of India\'s largest mosques and a major tourist attraction in Delhi.',
      visitingTips: ['Dress modestly', 'Remove shoes before entering', 'Climb the minaret for panoramic views', 'Visit during non-prayer times']
    },
    howToReach: { summary: 'In Old Delhi near Red Fort', full: 'Metro to Jama Masjid station (Violet Line). Auto-rickshaws and taxis available from all parts of Delhi' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '7:00 AM to 12:00 PM, 1:30 PM to 6:30 PM',
      entryFee: 'Free entry, ₹300 for camera, ₹200 for minaret climb',
      bestTimeToVisit: 'May to June, September to October',
      duration: '1-2 days (including trek)'
    }
  },
  {
    name: 'Gangotri Temple',
    category: 'Temple',
    year: '18th century',
    location: { 
      coordinates: [78.9392, 30.9993],
      city: 'Gangotri',
      state: 'Uttarakhand',
      country: 'India'
    },
    info: { 
      summary: 'One of Char Dham sites, source of River Ganga.',
      full: 'Gangotri Temple is dedicated to Goddess Ganga and marks the origin of the holy River Ganges. It is one of the four sites in the Char Dham pilgrimage.',
      history: 'Built in 18th century by Gorkha General Amar Singh Thapa. Reconstructed multiple times.',
      architecture: 'White granite structure with 20 feet high structure. Traditional Garhwali temple architecture.',
      significance: 'One of Char Dham pilgrimage sites. Source of holy River Ganga.',
      visitingTips: ['Temple open only 6 months (May-Nov)', 'Trek to Gaumukh glacier (source of Ganga)', 'Carry warm clothes', 'Acclimatize due to altitude', 'Visit nearby Pandava Gufa']
    },
    howToReach: { summary: '100 km from Uttarkashi', full: 'Nearest airport Jolly Grant, Dehradun (250 km). Nearest railway Rishikesh (250 km). Regular buses and taxis from Rishikesh and Uttarkashi' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:15 AM to 2:00 PM, 3:00 PM to 9:00 PM',
      entryFee: 'Free',
      bestTimeToVisit: 'May to June, September to October',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Yamunotri Temple',
    category: 'Temple',
    year: '19th century',
    location: { 
      coordinates: [78.4500, 31.0167],
      city: 'Yamunotri',
      state: 'Uttarakhand',
      country: 'India'
    },
    info: { 
      summary: 'One of Char Dham sites, source of River Yamuna.',
      full: 'Yamunotri Temple is dedicated to Goddess Yamuna and is the source of the Yamuna River. It is the westernmost shrine in the Char Dham pilgrimage.',
      history: 'Present temple built by Maharani Gularia of Jaipur in 19th century. Destroyed by earthquake and rebuilt.',
      architecture: 'Simple temple structure in traditional Garhwali style. Black marble deity.',
      significance: 'One of Char Dham pilgrimage sites. Source of River Yamuna.',
      visitingTips: ['Temple open only 6 months (May-Nov)', 'Trek 6 km from Janki Chatti', 'Take holy dip in Surya Kund hot spring', 'Cook rice in hot spring as offering', 'Carry warm clothes']
    },
    howToReach: { summary: '6 km trek from Janki Chatti', full: 'Nearest airport Jolly Grant, Dehradun (210 km). Nearest railway Rishikesh (210 km). Drive to Janki Chatti, then trek to temple' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 8:00 PM',
      entryFee: 'Free',
      bestTimeToVisit: 'May to June, September to October',
      duration: '1-2 days (including trek)'
    }
  },
  {
    name: 'Bodh Gaya',
    category: 'Temple',
    year: '3rd century BCE onwards',
    location: { 
      coordinates: [84.9914, 24.6958],
      city: 'Bodh Gaya',
      state: 'Bihar',
      country: 'India'
    },
    info: { 
      summary: 'UNESCO site where Buddha attained enlightenment under Bodhi Tree.',
      full: 'Bodh Gaya is the most sacred place in Buddhism, where Gautama Buddha attained enlightenment under the Bodhi Tree. The Mahabodhi Temple complex marks this spot.',
      history: 'Buddha attained enlightenment here around 500 BCE. Original temple built by Emperor Ashoka in 3rd century BCE. Present structure dates to 5-6th century CE.',
      architecture: 'Pyramidal temple 55m high built in brick. Classic example of Indian brick architecture.',
      significance: 'UNESCO World Heritage Site. Most important Buddhist pilgrimage site globally.',
      visitingTips: ['Meditate under Bodhi Tree', 'Visit various international Buddhist temples', 'Attend evening prayer ceremony', 'Photography allowed with ticket']
    },
    howToReach: { summary: '110 km from Patna, 17 km from Gaya', full: 'Nearest airport Gaya (17 km) and Patna (110 km). Gaya Junction railway station 17 km. Regular buses and taxis from Gaya and Patna' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '5:00 AM to 9:00 PM',
      entryFee: 'Free (₹100 for camera)',
      bestTimeToVisit: 'October to March',
      duration: '1 full day'
    }
  },
  {
    name: 'Sarnath',
    category: 'Monument',
    year: '3rd century BCE',
    location: { 
      coordinates: [83.0226, 25.3813],
      city: 'Sarnath',
      state: 'Uttar Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Where Buddha gave his first sermon after enlightenment.',
      full: 'Sarnath is one of four sacred Buddhist sites, where Buddha gave his first sermon to his five disciples after attaining enlightenment. Contains Dhamek Stupa and archaeological museum.',
      history: 'Buddha gave first sermon here in 528 BCE. Flourished under Emperor Ashoka in 3rd century BCE. Destroyed in 12th century, rediscovered in 1800s.',
      architecture: 'Dhamek Stupa - massive 34m high cylindrical structure. Ashoka Pillar with Lion Capital (now national emblem).',
      significance: 'One of four holiest Buddhist sites. UNESCO World Heritage Site.',
      visitingTips: ['Visit Archaeological Museum for Lion Capital', 'See Dhamek Stupa and Ashoka Pillar remains', 'Visit modern temples of various countries', 'Combine with Varanasi visit']
    },
    howToReach: { summary: '10 km from Varanasi', full: 'Nearest airport and railway station Varanasi. Auto-rickshaws, taxis and buses available from Varanasi city' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 5:00 PM',
      entryFee: '₹15 for Indians, ₹200 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Haridwar',
    category: 'Monument',
    year: 'Ancient',
    location: { 
      coordinates: [78.1642, 29.9457],
      city: 'Haridwar',
      state: 'Uttarakhand',
      country: 'India'
    },
    info: { 
      summary: 'Holy city where Ganga enters the plains, famous for Ganga Aarti.',
      full: 'Haridwar is one of the seven holiest places in Hinduism. The city is where the Ganges River emerges from the Himalayas and enters the Indo-Gangetic plains.',
      history: 'One of oldest living cities. Mentioned in ancient texts. Hosts Kumbh Mela every 12 years.',
      architecture: 'Har Ki Pauri ghat is the main religious site. Numerous temples and ashrams.',
      significance: 'One of seven holiest Hindu cities. Gateway to Char Dham pilgrimage. Kumbh Mela host city.',
      visitingTips: ['Attend evening Ganga Aarti at Har Ki Pauri', 'Take holy dip in Ganga', 'Visit Mansa Devi and Chandi Devi temples', 'Try local street food']
    },
    howToReach: { summary: 'Well connected by rail and road', full: 'Haridwar Junction railway station. Nearest airport Jolly Grant, Dehradun (35 km). Regular buses from Delhi and other cities' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'N/A (city destination)',
      entryFee: 'No entry fee',
      bestTimeToVisit: 'October to February',
      duration: '1-2 days'
    }
  },
  {
    name: 'Rishikesh',
    category: 'Monument',
    year: 'Ancient',
    location: { 
      coordinates: [78.2676, 30.0869],
      city: 'Rishikesh',
      state: 'Uttarakhand',
      country: 'India'
    },
    info: { 
      summary: 'Yoga capital of the world, gateway to Himalayas and Char Dham.',
      full: 'Rishikesh is a holy city for Hindus and a renowned center for studying yoga and meditation. Located in the Himalayan foothills beside the Ganges River.',
      history: 'Ancient pilgrimage town mentioned in Hindu scriptures. Gained international fame after Beatles visit in 1968.',
      architecture: 'Famous for suspension bridges - Ram Jhula and Laxman Jhula. Numerous ashrams and temples.',
      significance: 'Yoga capital of the world. Gateway to Char Dham pilgrimage. Adventure sports hub.',
      visitingTips: ['Attend evening Ganga Aarti', 'Try river rafting and bungee jumping', 'Visit Beatles Ashram', 'Take yoga classes', 'Walk across Laxman Jhula']
    },
    howToReach: { summary: 'Well connected by rail and road', full: 'Rishikesh railway station. Nearest airport Jolly Grant, Dehradun (20 km). Regular buses from Delhi and other cities' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'N/A (city destination)',
      entryFee: 'No entry fee',
      bestTimeToVisit: 'September to November, March to May',
      duration: '2-3 days'
    }
  },
  {
    name: 'Varanasi Ghats',
    category: 'Monument',
    year: 'Ancient',
    location: { 
      coordinates: [83.0085, 25.3176],
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Series of ancient riverfront steps along Ganges, spiritual heart of Hinduism.',
      full: 'The ghats of Varanasi are embankments made in steps leading to the banks of the Ganges river. The city has 84 ghats, most for bathing and puja ceremonies, some for cremation.',
      history: 'One of oldest continuously inhabited cities (3000+ years). Ghats developed over millennia.',
      architecture: 'Stone steps leading to river. Dashashwamedh Ghat and Manikarnika Ghat most famous.',
      significance: 'Holiest city in Hinduism. Dying here believed to provide moksha (liberation).',
      visitingTips: ['Take boat ride at sunrise', 'Witness Ganga Aarti at Dashashwamedh Ghat', 'Walk along ghats', 'Visit Kashi Vishwanath Temple', 'Respect cremation ceremonies']
    },
    howToReach: { summary: 'In Varanasi city', full: 'Varanasi airport and railway station. Auto-rickshaws and cycle-rickshaws to ghats. Walking distance from old city' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Open 24 hours',
      entryFee: 'Free (boat rides extra)',
      bestTimeToVisit: 'October to March',
      duration: '1-2 days'
    }
  },
  {
    name: 'Kashi Vishwanath Temple',
    category: 'Temple',
    year: '1780 (current structure)',
    location: { 
      coordinates: [83.0096, 25.3109],
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'One of 12 Jyotirlingas, most sacred Shiva temple.',
      full: 'Kashi Vishwanath Temple is one of the most famous Hindu temples dedicated to Lord Shiva. It is one of the twelve Jyotirlingas and located in Varanasi.',
      history: 'Ancient temple destroyed and rebuilt multiple times. Present structure built in 1780 by Maratha ruler Ahilya Bai Holkar.',
      architecture: 'Gold-plated spire donated by Maharaja Ranjit Singh. White marble temple with gold overlay.',
      significance: 'One of 12 Jyotirlingas. Most sacred Shiva temple. Visiting here grants moksha.',
      visitingTips: ['Non-Hindus not allowed inside', 'No cameras or phones allowed', 'Visit newly opened Kashi Vishwanath Corridor', 'Dress modestly', 'Expect crowds']
    },
    howToReach: { summary: 'In Varanasi old city near ghats', full: 'Walking distance from Dashashwamedh Ghat. Auto-rickshaws and cycle-rickshaws available. Nearest railway station Varanasi Cantt' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '3:00 AM to 11:00 PM (with breaks)',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Pushkar Lake',
    category: 'Monument',
    year: 'Ancient',
    location: { 
      coordinates: [74.5534, 26.4899],
      city: 'Pushkar',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Sacred lake surrounded by 52 ghats, one of most sacred lakes for Hindus.',
      full: 'Pushkar Lake is a sacred lake surrounded by 52 bathing ghats and over 500 temples. It is considered one of the five sacred pilgrimage places for Hindus.',
      history: 'According to legend, created when Lord Brahma dropped a lotus. Mentioned in ancient Hindu scriptures.',
      architecture: '52 ghats with marble steps. Surrounded by temples including famous Brahma Temple.',
      significance: 'One of five sacred pilgrimage sites (Panch-Sarovar). Only place with Brahma Temple.',
      visitingTips: ['Take holy dip in lake', 'Visit Brahma Temple', 'Attend Pushkar Camel Fair (November)', 'Walk around entire lake', 'Visit at sunrise/sunset']
    },
    howToReach: { summary: '15 km from Ajmer', full: 'Nearest railway station Ajmer (15 km). Regular buses and taxis from Ajmer and Jaipur. Nearest airport Jaipur (145 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Open 24 hours',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March, special during Pushkar Fair',
      duration: '1-2 days'
    }
  },
  {
    name: 'Puri Jagannath Temple',
    category: 'Temple',
    year: '12th century',
    location: { 
      coordinates: [85.8178, 19.8135],
      city: 'Puri',
      state: 'Odisha',
      country: 'India'
    },
    info: { 
      summary: 'One of Char Dham sites, famous for Rath Yatra festival.',
      full: 'Jagannath Temple is dedicated to Lord Jagannath (form of Vishnu) and is one of the four sacred Char Dham pilgrimage sites. Famous for its annual Rath Yatra (chariot festival).',
      history: 'Present temple built by King Anantavarman Chodaganga Deva in 12th century CE.',
      architecture: 'Kalinga style architecture. Temple complex spread over 400,000 sq ft with 65m high main tower.',
      significance: 'One of Char Dham pilgrimage sites. Home to famous Rath Yatra festival.',
      visitingTips: ['Non-Hindus not allowed inside', 'Attend Rath Yatra in June-July', 'Visit Gundicha Temple', 'Try mahaprasad', 'View temple from rooftop restaurants']
    },
    howToReach: { summary: 'In Puri city', full: 'Puri railway station 2 km from temple. Nearest airport Bhubaneswar (60 km). Regular buses from Bhubaneswar and Cuttack' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '5:00 AM to 12:00 AM (varies by ritual)',
      entryFee: 'Free',
      bestTimeToVisit: 'October to February, special during Rath Yatra',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Gomateshwara Statue',
    category: 'Monument',
    year: '981 CE',
    location: { 
      coordinates: [76.4861, 12.8571],
      city: 'Shravanabelagola',
      state: 'Karnataka',
      country: 'India'
    },
    info: { 
      summary: 'Tallest monolithic statue in the world, important Jain pilgrimage site.',
      full: 'The Gomateshwara statue, also called Bahubali statue, is a 57-foot tall monolithic statue of Bahubali (Gomateshwara). It is one of the most important Jain pilgrimage destinations.',
      history: 'Carved in 981 CE by Chavundaraya, a minister of the Ganga dynasty. One of the oldest such structures.',
      architecture: 'Carved from single block of granite. Stands 57 feet tall on Vindyagiri Hill.',
      significance: 'Important Jain pilgrimage site. Mahamastakabhisheka ceremony every 12 years.',
      visitingTips: ['Climb 620 steps barefoot to reach statue', 'Visit during Mahamastakabhisheka festival', 'Go early morning to avoid heat', 'Visit nearby Chandragiri Hill']
    },
    howToReach: { summary: '85 km from Bangalore, 51 km from Hassan', full: 'Nearest railway station Hassan (51 km). Regular buses from Bangalore, Hassan, and Mysore. Nearest airport Bangalore (140 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 6:00 PM',
      entryFee: 'Free',
      bestTimeToVisit: 'October to February',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Belur and Halebidu Temples',
    category: 'Monument',
    year: '12th-13th century',
    location: { 
      coordinates: [75.9649, 13.1656],
      city: 'Belur-Halebidu',
      state: 'Karnataka',
      country: 'India'
    },
    info: { 
      summary: 'Masterpieces of Hoysala architecture with intricate stone carvings.',
      full: 'Belur and Halebidu temples are finest examples of Hoysala architecture, known for their detailed stone carvings, sculptures, and friezes. Chennakesava Temple in Belur and Hoysaleswara Temple in Halebidu are the main attractions.',
      history: 'Built in 12th-13th century CE by Hoysala Empire. Took 103 years to complete Chennakesava Temple.',
      architecture: 'Star-shaped platforms, intricate sculptures depicting epics, dancing figures, and detailed friezes. Soapstone construction.',
      significance: 'UNESCO World Heritage Site (tentative list). Peak of Hoysala architectural achievement.',
      visitingTips: ['Hire guide for detailed explanations', 'Visit both Belur and Halebidu (16 km apart)', 'Photography allowed', 'Spend time observing intricate carvings']
    },
    howToReach: { summary: '220 km from Bangalore, 31 km from Hassan', full: 'Nearest railway station Hassan (31 km). Regular buses from Bangalore, Hassan, Mysore. Nearest airport Bangalore (220 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '7:30 AM to 7:30 PM',
      entryFee: '₹25 for Indians, ₹300 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: 'Full day for both sites'
    }
  },
  {
    name: 'Gwalior Fort',
    category: 'Historic Fort',
    year: '8th century onwards',
    location: { 
      coordinates: [78.1690, 26.2295],
      city: 'Gwalior',
      state: 'Madhya Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'Massive hilltop fort complex, described as the pearl amongst fortresses in India.',
      full: 'Gwalior Fort is a hilltop fort in central India. Emperor Babur called it "the pearl amongst fortresses in India". The fort has been controlled by several dynasties.',
      history: 'Established in 8th century. Expanded by various rulers including Tomars, Mughals, Marathas, and Scindias.',
      architecture: 'Sandstone fort with two main palaces - Man Mandir and Gujari Mahal. Features beautiful blue tile work.',
      significance: 'One of India\'s most impregnable forts. Important in Indian history and wars.',
      visitingTips: ['Visit Man Mandir Palace and Gujari Mahal Museum', 'See sound and light show', 'Visit Sasbahu Temples and Teli ka Mandir', 'Wear comfortable shoes']
    },
    howToReach: { summary: 'In Gwalior city', full: 'Gwalior Junction railway station 4 km away. Nearest airport in Gwalior. Auto-rickshaws and taxis available from city' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM to 6:00 PM',
      entryFee: '₹75 for Indians, ₹250 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '3-4 hours'
    }
  },
  {
    name: 'Udaipur City Palace',
    category: 'Monument',
    year: '1559',
    location: { 
      coordinates: [73.6833, 24.5759],
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Majestic palace complex on banks of Lake Pichola, largest palace in Rajasthan.',
      full: 'Udaipur City Palace is a palace complex situated on the eastern banks of Lake Pichola. It is the largest palace complex in Rajasthan and was built by Maharana Udai Singh.',
      history: 'Construction started in 1559 by Maharana Udai Singh II. Additions made by successive rulers over 400 years.',
      architecture: 'Blend of Rajasthani, Mughal, Medieval, European and Chinese architecture. Built with granite and marble.',
      significance: 'Largest palace complex in Rajasthan. Part of royal heritage of Mewar dynasty.',
      visitingTips: ['Visit Palace Museum', 'Take boat ride on Lake Pichola', 'View from Ambrai Ghat', 'See crystal gallery', 'Visit in evening for lights']
    },
    howToReach: { summary: 'In Udaipur city center', full: 'Udaipur railway station 3 km away. Nearest airport Maharana Pratap Airport (22 km). Auto-rickshaws and taxis from city' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:30 AM to 5:30 PM',
      entryFee: '₹300 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'September to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Jallianwala Bagh',
    category: 'Monument',
    year: '1919 (incident), 1951 (memorial)',
    location: { 
      coordinates: [74.8797, 31.6205],
      city: 'Amritsar',
      state: 'Punjab',
      country: 'India'
    },
    info: { 
      summary: 'Memorial of tragic 1919 massacre, important site in India\'s freedom struggle.',
      full: 'Jallianwala Bagh is a public garden housing a memorial of national importance. It commemorates the massacre of peaceful civilians by British forces on April 13, 1919.',
      history: 'On April 13, 1919, British troops under General Dyer opened fire on unarmed civilians, killing hundreds. Memorial established in 1951.',
      architecture: 'Garden with preserved bullet marks on walls. Martyrs\' Gallery and memorial flame.',
      significance: 'Symbol of India\'s freedom struggle. Turning point in independence movement.',
      visitingTips: ['Visit memorial gallery', 'See preserved bullet marks and well', 'Combine with Golden Temple visit', 'Sound and light show in evening', 'Photography allowed']
    },
    howToReach: { summary: 'Walking distance from Golden Temple', full: 'In Amritsar city center, 500m from Golden Temple. Auto-rickshaws and taxis from railway station (2 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1605649487212-47e9c5c88fd9?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 7:30 PM',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      duration: '1 hour'
    }
  },
  {
    name: 'Wagah Border',
    category: 'Monument',
    year: '1959 (ceremony started)',
    location: { 
      coordinates: [74.5727, 31.6045],
      city: 'Wagah',
      state: 'Punjab',
      country: 'India'
    },
    info: { 
      summary: 'India-Pakistan border famous for daily flag lowering ceremony.',
      full: 'Wagah Border is the only road border crossing between India and Pakistan. Famous for its Beating Retreat ceremony conducted daily by border security forces of both countries.',
      history: 'Border established in 1947 during partition. Ceremonial flag lowering ritual started in 1959.',
      architecture: 'Border gates with amphitheater-style seating for spectators on both sides.',
      significance: 'Symbol of India-Pakistan relations. Major tourist attraction known for patriotic ceremonies.',
      visitingTips: [
        'Arrive 2-3 hours before ceremony for good seats',
        'Carry valid ID for security check',
        'Avoid bringing prohibited items',
        'Expect crowds during weekends and holidays'
      ]
    },
    howToReach: {
      summary: 'Located 32 km from Amritsar, accessible by road and taxi.',
      full: 'Wagah Border is located on the Grand Trunk Road connecting Amritsar to Lahore.',
      byAir: {
        nearestAirport: 'Sri Guru Ram Dass Jee International Airport, Amritsar',
        distance: '32 km',
        description: 'Taxis and buses available from airport to Wagah Border.'
      },
      byRail: {
        nearestStation: 'Amritsar Railway Station',
        distance: '32 km',
        description: 'Taxis and buses available from railway station.'
      },
      byRoad: {
        fromMajorCities: [
          {
            city: 'Amritsar',
            distance: '32 km',
            route: 'Amritsar - GT Road - Wagah',
            duration: '45 minutes'
          }
        ],
        localTransport: 'Regular buses and taxis from Amritsar to Wagah Border.'
      }
    },
    view360: {
      summary: '360° Street View available.',
      iframeUrl: '',
      full: 'Experience a 360° Street View of Wagah Border.',
      heading: 270,
      pitch: 0
    },
    model3d: {
      summary: '3D model available.',
      url: '/3dmodels/wagah-border',
      full: 'Explore the 3D model of Wagah Border.',
      sketchfabId: 'wagahborder3dmodelid'
    },
    media: {
      panorama_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=600&fit=crop'
    },
    visitor_info: {
      timings: 'Ceremony: 4:15 PM (Winter), 5:15 PM (Summer)',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Konark Temple',
    category: 'Temple',
    year: '1250',
    location: { 
      coordinates: [86.0945, 19.8876],
      city: 'Konark',
      state: 'Odisha',
      country: 'India'
    },
    info: { 
      summary: 'UNESCO World Heritage Site designed as a colossal chariot of Sun God.',
      full: 'Konark Sun Temple is a 13th-century CE sun temple shaped like a gigantic chariot with elaborately carved stone wheels, pillars and walls.',
      history: 'Built by King Narasimhadeva I of Eastern Ganga Dynasty around 1250 CE.',
      architecture: 'Shaped as a massive chariot with 24 wheels pulled by 7 horses. Made of Khondalite rocks.',
      significance: 'UNESCO World Heritage Site. Masterpiece of Kalinga architecture.',
      visitingTips: ['Visit during sunrise for best photography', 'Hire a guide to understand intricate carvings', 'Attend the Konark Dance Festival in December', 'Combine with nearby Chandrabhaga beach']
    },
    howToReach: { summary: '65 km from Puri, 35 km from Bhubaneswar', full: 'Regular buses from Puri and Bhubaneswar. Taxis and private vehicles available. Nearest airport is Bhubaneswar' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 8:00 PM daily',
      entryFee: '₹40 for Indians, ₹600 for foreigners',
      bestTimeToVisit: 'September to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Golden Temple',
    category: 'Monument',
    year: '1604',
    location: { 
      coordinates: [74.8765, 31.6200],
      city: 'Amritsar',
      state: 'Punjab',
      country: 'India'
    },
    info: { 
      summary: 'Holiest Gurdwara of Sikhism, known for its stunning golden architecture.',
      full: 'Sri Harmandir Sahib, also known as Golden Temple, is the holiest Gurdwara and the most important pilgrimage site of Sikhism. The upper floors are covered with gold leaf.',
      history: 'Foundation laid by Guru Ramdas in 1577. Temple completed in 1604 by Guru Arjan. Gold plating added in early 19th century by Maharaja Ranjit Singh.',
      architecture: 'Built in Indo-Islamic architectural style with gold-covered dome. Surrounded by a sacred pool (Amrit Sarovar).',
      significance: 'Central religious place of Sikhism. Serves free meals (langar) to 100,000+ people daily.',
      visitingTips: ['Cover your head', 'Wash feet before entering', 'Experience the langar (free community kitchen)', 'Visit during early morning or evening for peaceful atmosphere']
    },
    howToReach: { summary: 'In Amritsar city center', full: 'Auto-rickshaws and taxis from railway station (2 km) and airport (11 km). Walking distance from city center' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1588421149462-5578445cf52b?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Open 24 hours',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March, avoid peak summer',
      duration: '2-4 hours'
    }
  },
  {
    name: 'Cellular Jail',
    category: 'Monument',
    year: '1906',
    location: { 
      coordinates: [92.7265, 11.6734],
      city: 'Port Blair',
      state: 'Andaman and Nicobar Islands',
      country: 'India'
    },
    info: { 
      summary: 'Colonial prison used by British to exile political prisoners, now a national memorial.',
      full: 'Cellular Jail, also known as Kālā Pānī, was a colonial prison in Port Blair used by the British to exile political prisoners to the remote Andaman Islands.',
      history: 'Completed in 1906. Housed many notable Indian independence activists. Declared a national memorial in 1979.',
      architecture: 'Originally had seven wings radiating from a central tower. Only three wings remain today.',
      significance: 'Symbol of India\'s freedom struggle. National Memorial Monument.',
      visitingTips: ['Attend the light and sound show in evening', 'Visit the museum inside', 'Allow time to read prisoner stories', 'Photography allowed']
    },
    howToReach: { summary: 'In Port Blair city', full: 'Auto-rickshaws and taxis available from Port Blair city center (2 km). Walking distance from Aberdeen Bazaar' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1605649487212-47e9c5c88fd9?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '9:00 AM to 12:30 PM, 1:30 PM to 4:45 PM. Closed on Mondays',
      entryFee: '₹30 for Indians, ₹100 for foreigners',
      bestTimeToVisit: 'October to May',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Havelock Island',
    category: 'Monument',
    year: 'N/A',
    location: { 
      coordinates: [93.0074, 12.0064],
      city: 'Swaraj Dweep',
      state: 'Andaman and Nicobar Islands',
      country: 'India'
    },
    info: { 
      summary: 'Pristine island known for Radhanagar Beach, rated as Asia\'s best beach.',
      full: 'Havelock Island (officially renamed Swaraj Dweep) is one of the largest islands in Andaman, famous for its pristine beaches, crystal clear waters, and rich coral reefs.',
      history: 'Named after British General Henry Havelock. Renamed to Swaraj Dweep in 2018.',
      architecture: 'Natural heritage site with minimal development to preserve ecosystem.',
      significance: 'Home to Radhanagar Beach, ranked among best beaches in Asia. Major eco-tourism destination.',
      visitingTips: ['Visit Radhanagar Beach for sunset', 'Try scuba diving and snorkeling', 'Book accommodations in advance', 'Carry cash as ATMs are limited']
    },
    howToReach: { summary: '70 km from Port Blair', full: 'Government ferries and private catamarans from Port Blair (2-2.5 hours). Helicopter service also available' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'N/A (island destination)',
      entryFee: 'No entry fee for island',
      bestTimeToVisit: 'October to May',
      duration: '2-3 days recommended'
    }
  },
  {
    name: 'Amer Palace',
    category: 'Monument',
    year: '1592',
    location: { 
      coordinates: [75.8513, 26.9855],
      city: 'Amer',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Part of Amber Fort complex, stunning palace with mirror work and frescoes.',
      full: 'The palace complex within Amber Fort features exquisite mirror work, frescoes, and intricate marble carvings representing the finest Rajput architecture.',
      history: 'Built in 1592 by Raja Man Singh I as the main palace of Kachwaha rulers.',
      architecture: 'Four-level palace built with red sandstone and marble. Famous Sheesh Mahal with mirror inlay work.',
      significance: 'Part of UNESCO Hill Forts of Rajasthan. Showcases peak of Rajput architectural excellence.',
      visitingTips: ['Visit Sheesh Mahal with flashlight', 'Explore Diwan-i-Aam and Diwan-i-Khas', 'Photography allowed with ticket', 'Wear comfortable shoes for walking']
    },
    howToReach: { summary: '11 km from Jaipur', full: 'Regular buses, taxis, and autos from Jaipur. Can be combined with Jaigarh Fort visit' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1632734939633-c4146616faef?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM to 5:30 PM daily',
      entryFee: '₹100 for Indians, ₹500 for foreigners',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Khajuraho Temples',
    category: 'Monument',
    year: '950-1050',
    location: { 
      coordinates: [79.9199, 24.8318],
      city: 'Khajuraho',
      state: 'Madhya Pradesh',
      country: 'India'
    },
    info: { 
      summary: 'UNESCO World Heritage Site famous for erotic sculptures and Nagara-style architecture.',
      full: 'The Khajuraho Group of Monuments comprises Hindu and Jain temples famous for their Nagara-style architectural symbolism and erotic sculptures.',
      history: 'Built by Chandela dynasty rulers between 950-1050 CE. Originally 85 temples, only 25 survive today.',
      architecture: 'Sandstone temples with intricate carvings depicting various aspects of life including spiritual, secular and erotic themes.',
      significance: 'UNESCO World Heritage Site. Represents pinnacle of medieval temple architecture in India.',
      visitingTips: ['Attend sound and light show', 'Hire a guide for detailed explanations', 'Visit Western Group first', 'Photography allowed']
    },
    howToReach: { summary: 'Well connected by air, rail and road', full: 'Daily flights from Delhi, Varanasi, Mumbai. Railway station 5 km from temples. Regular buses from major MP cities' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1586873215059-8f5a2c2c1cf4?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Sunrise to sunset',
      entryFee: '₹40 for Indians, ₹600 for foreigners (Western Group)',
      bestTimeToVisit: 'October to February',
      duration: '1 full day'
    }
  },
  {
    name: 'Ajmer Sharif Dargah',
    category: 'Monument',
    year: '1236',
    location: { 
      coordinates: [74.6189, 26.4564],
      city: 'Ajmer',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Shrine of Sufi saint Moinuddin Chishti, one of the holiest places in India.',
      full: 'Ajmer Sharif Dargah is a Sufi shrine of the revered saint, Moinuddin Chishti, visited by millions of pilgrims annually regardless of faith.',
      history: 'Built over the tomb of Sufi Saint Khwaja Moinuddin Chishti who came to Ajmer from Persia in 1192. Shrine constructed by Mughal Emperor Humayun.',
      architecture: 'White marble domed structure with intricate marble lattice work. Three gates with silver doors.',
      significance: 'One of most visited religious sites in India. Symbol of communal harmony.',
      visitingTips: ['Cover your head', 'Remove shoes before entering', 'Visit during Urs festival for special experience', 'Respect religious customs']
    },
    howToReach: { summary: 'In Ajmer city center', full: 'Ajmer Junction railway station 2 km away. Auto-rickshaws and taxis available. Regular buses from Jaipur (135 km)' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '4:00 AM to 10:00 PM (varies by season)',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March, special during Urs festival',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Somnath Temple',
    category: 'Temple',
    year: '1951 (current structure)',
    location: { 
      coordinates: [70.4013, 20.8880],
      city: 'Somnath',
      state: 'Gujarat',
      country: 'India'
    },
    info: { 
      summary: 'First among twelve Jyotirlinga shrines of Shiva, rebuilt multiple times.',
      full: 'Somnath Temple is considered the first among the twelve Jyotirlinga shrines of Shiva. Located on the shore of the Arabian Sea, it has been destroyed and rebuilt several times.',
      history: 'Ancient temple mentioned in Rig Veda. Destroyed multiple times by invaders. Current structure rebuilt in 1951 after independence.',
      architecture: 'Built in Chalukya style of architecture with intricate carvings. Made of stone with no steel or iron used.',
      significance: 'First of 12 Jyotirlingas. Symbol of resilience and faith.',
      visitingTips: ['Attend evening aarti', 'Watch sound and light show', 'Visit nearby Triveni Sangam', 'Photography restricted inside']
    },
    howToReach: { summary: 'Near Veraval, Gujarat', full: 'Nearest airport Diu (63 km) and Rajkot (160 km). Veraval railway station 5 km away. Regular buses from Ahmedabad and Junagadh' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 9:00 PM',
      entryFee: 'Free',
      bestTimeToVisit: 'November to February',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Dwarkadhish Temple',
    category: 'Temple',
    year: '2500 years old (current 15-16th century)',
    location: { 
      coordinates: [68.9685, 22.2442],
      city: 'Dwarka',
      state: 'Gujarat',
      country: 'India'
    },
    info: { 
      summary: 'One of Char Dham pilgrimage sites, dedicated to Lord Krishna.',
      full: 'Dwarkadhish Temple, also known as Jagat Mandir, is dedicated to Lord Krishna. It is one of the four sacred Hindu pilgrimage sites (Char Dham).',
      history: 'Believed to be originally built by Krishna\'s grandson Vajranabha over 2500 years ago. Current structure dates to 15-16th century.',
      architecture: '5-storied structure supported by 72 pillars (Khambas). Built of sandstone with intricate carvings.',
      significance: 'One of Char Dham pilgrimage sites. One of 7 Mukti-Sthal (places of salvation).',
      visitingTips: ['Non-Hindus not allowed inside main shrine', 'Visit nearby Bet Dwarka by ferry', 'Attend evening aarti', 'Camera and phones not allowed inside']
    },
    howToReach: { summary: 'In Dwarka city', full: 'Nearest airport Jamnagar (137 km). Dwarka railway station connected to major cities. Regular buses from Ahmedabad and Rajkot' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1605649487212-47e9c5c88fd9?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '6:00 AM to 12:30 PM, 5:00 PM to 9:30 PM',
      entryFee: 'Free',
      bestTimeToVisit: 'October to March',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Ranakpur Jain Temple',
    category: 'Monument',
    year: '1439',
    location: { 
      coordinates: [73.4719, 25.1146],
      city: 'Ranakpur',
      state: 'Rajasthan',
      country: 'India'
    },
    info: { 
      summary: 'Stunning marble temple complex with 1444 uniquely carved pillars.',
      full: 'Ranakpur Jain Temple is one of the five major pilgrimage sites of Jainism. The main temple is dedicated to Tirthankara Adinatha and is famous for its intricate architecture.',
      history: 'Built in 1439 CE under the patronage of Rana Kumbha. Designed by architect Deepaka.',
      architecture: 'Built in white marble with 1444 marble pillars, each uniquely carved. No two pillars are alike.',
      significance: 'One of five major Jain pilgrimage sites. Masterpiece of Indian temple architecture.',
      visitingTips: ['Remove leather items before entering', 'Visit during afternoon for best lighting', 'No photography inside', 'Dress modestly']
    },
    howToReach: { summary: '95 km from Udaipur', full: 'No direct public transport. Taxis and private vehicles from Udaipur. Can be combined with Kumbhalgarh Fort visit' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '12:00 PM to 5:00 PM',
      entryFee: 'Free (₹50 for camera)',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Vivekananda Rock Memorial',
    category: 'Monument',
    year: '1970',
    location: { 
      coordinates: [77.5516, 8.0782],
      city: 'Kanyakumari',
      state: 'Tamil Nadu',
      country: 'India'
    },
    info: { 
      summary: 'Memorial built on rock island where Swami Vivekananda meditated in 1892.',
      full: 'Vivekananda Rock Memorial is a monument built in honor of Swami Vivekananda, located on a small island off Kanyakumari. It is said that Vivekananda attained enlightenment here.',
      history: 'Built in 1970 to commemorate the spot where Swami Vivekananda meditated in 1892 before attending the Parliament of Religions in Chicago.',
      architecture: 'Blend of various Indian architectural styles. Two main structures: Vivekananda Mandapam and Shripada Mandapam.',
      significance: 'Important spiritual destination. Symbol of India\'s spiritual heritage.',
      visitingTips: ['Take ferry from mainland', 'Visit early morning for sunrise', 'Combine with Thiruvalluvar Statue nearby', 'Ferry timings depend on weather']
    },
    howToReach: { summary: 'Ferry from Kanyakumari mainland', full: 'Regular ferries from Kanyakumari ferry point (every 30 mins). Kanyakumari railway station 2 km from ferry point' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '8:00 AM to 4:00 PM',
      entryFee: '₹20 + ferry charges ₹50',
      bestTimeToVisit: 'October to March',
      duration: '1-2 hours'
    }
  },
  {
    name: 'Vaishno Devi Temple',
    category: 'Temple',
    year: 'Ancient (current shrine modern)',
    location: { 
      coordinates: [74.9494, 33.0311],
      city: 'Katra',
      state: 'Jammu and Kashmir',
      country: 'India'
    },
    info: { 
      summary: 'One of the holiest Hindu temples, dedicated to Goddess Vaishno Devi.',
      full: 'Vaishno Devi Temple is one of the most visited Hindu temples in India, located in the Trikuta Mountains. The shrine is in a cave with natural rock formations.',
      history: 'Ancient pilgrimage site mentioned in various Hindu texts. Modern infrastructure developed in recent decades.',
      architecture: 'Natural cave shrine with three rock formations (Pindis) representing three goddesses.',
      significance: 'One of 108 Shakti Peethas. Receives over 8 million pilgrims annually.',
      visitingTips: ['Register online for smoother darshan', 'Trek 13 km from Katra or take helicopter/pony', 'Carry warm clothes', 'Wear comfortable shoes', 'Free accommodation available']
    },
    howToReach: { summary: 'Base camp at Katra', full: 'Nearest airport Jammu (50 km). Katra railway station well connected. Regular buses from Jammu. 13 km trek from Katra to temple' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1605649487212-47e9c5c88fd9?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: 'Open 24 hours (Aarti timings vary)',
      entryFee: 'Free (helicopter/pony charges extra)',
      bestTimeToVisit: 'March to October',
      duration: '1-2 days (including trek)'
    }
  },
  {
    name: 'Rameswaram Temple',
    category: 'Temple',
    year: '12th century',
    location: { 
      coordinates: [79.3129, 9.2876],
      city: 'Rameswaram',
      state: 'Tamil Nadu',
      country: 'India'
    },
    info: { 
      summary: 'One of Char Dham pilgrimage sites, famous for longest temple corridor in India.',
      full: 'Ramanathaswamy Temple is dedicated to Lord Shiva and is one of the twelve Jyotirlinga temples. It is famous for its magnificent corridors and sacred water tanks.',
      history: 'Built in 12th century. Associated with Ramayana - where Lord Rama worshipped Shiva before going to Lanka.',
      architecture: 'Dravidian architecture with longest temple corridor in world (1220m). 22 sacred water tanks (theerthams).',
      significance: 'One of Char Dham pilgrimage sites. One of 12 Jyotirlingas. Important in Ramayana.',
      visitingTips: ['Take sacred bath in 22 wells', 'Visit early morning to avoid crowds', 'Photography not allowed inside', 'Visit Pamban Bridge and Dhanushkodi']
    },
    howToReach: { summary: 'Island town connected by Pamban Bridge', full: 'Nearest airport Madurai (170 km). Rameswaram railway station well connected. Regular buses from Madurai and Chennai' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '5:00 AM to 1:00 PM, 3:00 PM to 9:00 PM',
      entryFee: 'Free (special darshan tickets available)',
      bestTimeToVisit: 'October to April',
      duration: '2-3 hours'
    }
  },
  {
    name: 'Badrinath Temple',
    category: 'Temple',
    year: '8th century',
    location: { 
      coordinates: [79.4903, 30.7433],
      city: 'Badrinath',
      state: 'Uttarakhand',
      country: 'India'
    },
    info: { 
      summary: 'One of Char Dham pilgrimage sites, dedicated to Lord Vishnu.',
      full: 'Badrinath Temple is one of the most sacred pilgrimage sites for Hindus, dedicated to Lord Vishnu. Located in the Garhwal Himalayas along the banks of Alaknanda River.',
      history: 'Established by Adi Shankaracharya in 8th century CE. One of 108 Divya Desams.',
      architecture: 'Buddhist architectural influence with bright colors. Conical shaped gold gilt roof.',
      significance: 'One of Char Dham pilgrimage sites. One of 108 Divya Desams dedicated to Vishnu.',
      visitingTips: ['Temple open only 6 months (May-Nov)', 'Register for darshan in advance', 'Carry warm clothes', 'Acclimatize properly due to high altitude', 'Visit nearby Mana village']
    },
    howToReach: { summary: '301 km from Rishikesh', full: 'Nearest airport Jolly Grant, Dehradun (317 km). Nearest railway Rishikesh (297 km). Regular buses and taxis from Rishikesh and Haridwar' },
    media: { panorama_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=600&fit=crop' },
    visitor_info: {
      timings: '4:30 AM to 9:00 PM (varies by season)',
      entryFee: 'Free',
      bestTimeToVisit: 'May to June, September to October',
      duration: '2-3 hours'
    }
  },
  {
    name: "Akshardham Temple Delhi",
    category: "Temple",
    year: "2005",
    location: {
      coordinates: [77.2773, 28.6127],
      city: "New Delhi",
      state: "Delhi",
      country: "India"
    },
    info: {
      summary: "A magnificent Hindu temple complex showcasing traditional Indian architecture and spirituality.",
      full: "Akshardham Temple in Delhi is a stunning spiritual-cultural campus built by the BAPS Swaminarayan Sanstha. The complex features intricately carved stone structures, exhibitions on Indian culture, a boat ride through 10,000 years of Indian history, and beautiful gardens. The main monument stands 141 feet high, 316 feet wide, and 370 feet long, entirely hand-carved from pink sandstone and marble.",
      history: "Construction began in 2000 and the temple was inaugurated on November 6, 2005. It was built following ancient Vedic texts and without using steel or concrete in the main structure. Over 7,000 artisans and 3,000 volunteers contributed to its creation.",
      architecture: "Built in traditional Vedic architectural style with 234 intricately carved pillars, 9 ornate domes, 20 quadrangle shikhars, and over 20,000 sculptures of Hindu deities, saints, and mythological figures. The complex includes the Yagnapurush Kund, the largest stepwell in the world.",
      significance: "Represents the pinnacle of Indian craftsmanship and spirituality. Listed in the Guinness World Records as the world's largest comprehensive Hindu temple.",
      visitingTips: [
        "Photography is not allowed inside the complex",
        "No electronic devices permitted - lockers available",
        "Closed on Mondays",
        "Evening water show is a must-see attraction",
        "Dress modestly - no shorts or sleeveless tops"
      ]
    },
    howToReach: {
      summary: "Located in East Delhi, easily accessible via metro, bus, and taxi services.",
      full: "Akshardham is well-connected through Delhi Metro's Blue Line. The nearest metro station is Akshardham Metro Station, just 500 meters from the temple. Multiple bus routes and auto-rickshaws also serve the area. Ample parking is available for private vehicles.",
      byAir: {
        nearestAirport: "Indira Gandhi International Airport",
        distance: "25 km",
        description: "Airport is well-connected via metro and taxi services. Journey takes 45-60 minutes by road."
      },
      byRail: {
        nearestStation: "New Delhi Railway Station",
        distance: "10 km",
        description: "Take metro from New Delhi Metro Station on Blue Line to Akshardham station."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Agra",
            distance: "230 km",
            route: "Via Yamuna Expressway and NH19",
            duration: "3-4 hours"
          },
          {
            city: "Jaipur",
            distance: "280 km",
            route: "Via NH48",
            duration: "5-6 hours"
          }
        ],
        localTransport: "Metro (Akshardham Station - Blue Line), buses, auto-rickshaws, and taxis readily available."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Virtual tour of ancient cave paintings and rock-cut architecture",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D models of cave interiors and Kailasa temple",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "Ajanta: 9:00 AM - 5:30 PM (Closed Monday). Ellora: 6:00 AM - 6:00 PM (Closed Tuesday)",
      entryFee: "Ajanta: INR 40 (Indians), INR 600 (Foreigners). Ellora: INR 40 (Indians), INR 600 (Foreigners)",
      bestTimeToVisit: "October to March. Monsoon season (July-September) brings lush greenery but some caves may be slippery.",
      duration: "Full day for each site. 2 days recommended for comprehensive visit."
    }
  },
  {
    name: "Konark Sun Temple",
    category: "UNESCO World Heritage",
    year: "1250",
    location: {
      coordinates: [86.0945, 19.8876],
      city: "Konark",
      state: "Odisha",
      country: "India"
    },
    info: {
      summary: "Magnificent 13th-century sun temple designed as a colossal chariot with exquisite stone carvings.",
      full: "The Konark Sun Temple is a 13th-century CE Hindu sun temple dedicated to Surya located at Konark in Odisha. Shaped like a gigantic chariot with elaborately carved stone wheels, pillars and walls, the temple is a classic illustration of Kalinga architecture. The temple is one of the Seven Wonders of India and a UNESCO World Heritage Site.",
      history: "Built around 1250 CE by King Narasimhadeva I of the Eastern Ganga Dynasty. The temple took 12 years to complete with 1,200 artisans working on it. Originally built at the mouth of the Chandrabhaga River (now dried up), it served as a navigational landmark for sailors who called it the 'Black Pagoda'.",
      architecture: "Designed as a colossal chariot with 24 elaborately carved stone wheels (each 12 feet in diameter), pulled by seven horses. The temple showcases Kalinga architecture with three main structures: the sanctum (destroyed), the audience hall (Jagamohana, still standing), and the dancing hall (Nata Mandir, partially standing). Features intricate erotic sculptures, floral motifs, and depictions of daily life.",
      significance: "UNESCO World Heritage Site since 1984. Considered the pinnacle of Kalinga temple architecture. The temple's orientation and design demonstrate advanced astronomical knowledge - the wheels function as sundials. Seven horses represent days of the week, 24 wheels represent hours.",
      visitingTips: [
        "Visit at sunrise or sunset for best lighting and photography",
        "Attend the Konark Dance Festival (December) for classical performances",
        "Audio guides available in multiple languages",
        "Explore the Archaeological Museum nearby",
        "Combine with Chandrabhaga Beach visit (3 km away)",
        "Wear comfortable shoes for walking around the complex"
      ]
    },
    howToReach: {
      summary: "Located 65 km from Puri and 35 km from Bhubaneswar, accessible by road via well-connected highways.",
      full: "Konark is well connected by road from Bhubaneswar and Puri. Regular bus services and taxis available. The temple is located in Konark town, easily accessible from the main road.",
      byAir: {
        nearestAirport: "Biju Patnaik International Airport, Bhubaneswar",
        distance: "65 km",
        description: "Connected to major Indian cities. Taxis and buses available to Konark. Journey takes 1.5-2 hours."
      },
      byRail: {
        nearestStation: "Puri Railway Station",
        distance: "35 km",
        description: "Major station with good connectivity. Buses and taxis available to Konark. Alternatively, Bhubaneswar station (65 km) has better connectivity."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Bhubaneswar",
            distance: "65 km",
            route: "Via NH316 and Marine Drive",
            duration: "1.5-2 hours"
          },
          {
            city: "Puri",
            distance: "35 km",
            route: "Via Marine Drive",
            duration: "1 hour"
          },
          {
            city: "Cuttack",
            distance: "95 km",
            route: "Via NH16 and NH316",
            duration: "2-2.5 hours"
          }
        ],
        localTransport: "Local buses from Puri and Bhubaneswar. Taxis and auto-rickshaws available. Organized tours from both cities."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "360-degree view of the chariot structure and intricate wheel carvings",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "Detailed 3D model showing the chariot design and architectural elements",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "6:00 AM - 8:00 PM (Daily)",
      entryFee: "INR 40 for Indians, INR 600 for foreigners",
      bestTimeToVisit: "October to February. Konark Dance Festival in December. Sunrise and sunset visits highly recommended.",
      duration: "2-3 hours"
    }
  },
  {
    name: "Victoria Memorial",
    category: "Historic Building",
    year: "1921",
    location: {
      coordinates: [88.3426, 22.5448],
      city: "Kolkata",
      state: "West Bengal",
      country: "India"
    },
    info: {
      summary: "Iconic white marble monument and museum dedicated to Queen Victoria, showcasing Indo-Saracenic architecture.",
      full: "The Victoria Memorial is a large marble building in Kolkata, dedicated to the memory of Queen Victoria. Built between 1906-1921, it now serves as a museum and tourist destination. The memorial sits in 64 acres of gardens and houses a museum with a large collection of memorabilia, paintings, and artifacts from the British colonial period in India.",
      history: "Conceived by Lord Curzon after Queen Victoria's death in 1901. Construction began in 1906 and was completed in 1921. Designed by British architect William Emerson who blended Mughal and British architectural styles. Funded through voluntary contributions from British India and Indian princes. Converted into a museum in 1921.",
      architecture: "Built in Indo-Saracenic Revival architecture combining British, Mughal, and Venetian Gothic elements. Made of white Makrana marble with a 184-foot high central dome topped by a 16-foot bronze Angel of Victory statue that rotates with wind. Features four subsidiary octagonal domed chattris, a Mughal-style terrace, and elaborate gardens with water bodies.",
      significance: "Symbol of Kolkata and the British Raj era. Houses one of the largest collections of British colonial memorabilia in India. The museum contains rare portraits, manuscripts, and historical artifacts. The building is an architectural masterpiece blending Eastern and Western styles.",
      visitingTips: [
        "Visit during early morning for fewer crowds and better lighting",
        "Sound and light show in evenings (seasonal)",
        "Photography allowed in gardens but not inside museum",
        "Combine with nearby attractions like Birla Planetarium",
        "Best photographed during blue hour or sunset",
        "Gardens are perfect for leisurely walks"
      ]
    },
    howToReach: {
      summary: "Located in the heart of Kolkata near Maidan area, easily accessible via metro, buses, and taxis.",
      full: "Victoria Memorial is centrally located in Kolkata's Maidan area. Well connected by Kolkata Metro (Park Street or Rabindra Sadan stations), buses, taxis, and app-based cabs. Walking distance from several heritage areas.",
      byAir: {
        nearestAirport: "Netaji Subhas Chandra Bose International Airport",
        distance: "20 km",
        description: "Connected to all major domestic and international destinations. Metro, taxis, and app-based cabs available. Journey takes 45-60 minutes depending on traffic."
      },
      byRail: {
        nearestStation: "Howrah Junction or Sealdah Railway Station",
        distance: "5-7 km",
        description: "Major railway junctions connected to all Indian cities. Metro, buses, and taxis readily available."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Darjeeling",
            distance: "640 km",
            route: "Via NH12 and NH512",
            duration: "12-13 hours"
          },
          {
            city: "Bhubaneswar",
            distance: "445 km",
            route: "Via NH16",
            duration: "8-9 hours"
          },
          {
            city: "Patna",
            distance: "585 km",
            route: "Via NH19",
            duration: "11-12 hours"
          }
        ],
        localTransport: "Metro (Park Street/Rabindra Sadan stations), buses, trams, taxis, and auto-rickshaws. Walking from nearby areas recommended."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Virtual tour of the memorial's exterior, gardens, and surrounding area",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D architectural model showcasing Indo-Saracenic design elements",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "10:00 AM - 5:00 PM (Closed Mondays and national holidays)",
      entryFee: "INR 30 for Indians, INR 500 for foreigners. Gardens: INR 20",
      bestTimeToVisit: "October to March. Evenings for sound and light show (when available). Avoid monsoons for outdoor activities.",
      duration: "2-3 hours"
    }
  },
  {
    name: "Mahabalipuram Monuments",
    category: "UNESCO World Heritage",
    year: "7th-8th Century",
    location: {
      coordinates: [80.1932, 12.6176],
      city: "Mahabalipuram",
      state: "Tamil Nadu",
      country: "India"
    },
    info: {
      summary: "Group of 7th-8th century rock-cut monuments and temples on the Coromandel Coast.",
      full: "The Group of Monuments at Mahabalipuram (also known as Mamallapuram) is a UNESCO World Heritage Site featuring rock-cut caves, monolithic temples (rathas), bas-relief sculptures, and the iconic Shore Temple. Built primarily by Pallava kings in 7th-8th centuries, these monuments showcase Dravidian architecture and are among India's most photographed sites.",
      history: "Built during the Pallava dynasty (7th-9th centuries), particularly under Narasimhavarman I and Narasimhavarman II. The site was a flourishing seaport and served as a second capital. The monuments were carved from granite boulders and cliff faces. Rediscovered and restored by British archaeologists in the 19th century.",
      architecture: "Features Dravidian rock-cut architecture including: Shore Temple (structural temple by the sea), Five Rathas (monolithic chariot-shaped temples), Arjuna's Penance (massive bas-relief carving), Cave Temples with intricate pillars, and Krishna's Butterball (natural balancing rock). Showcases evolution from rock-cut to structural temple architecture.",
      significance: "UNESCO World Heritage Site since 1984. Represents the transition from rock-cut to free-standing structural temples in South Indian architecture. Arjuna's Penance is one of the world's largest bas-reliefs. Shore Temple is among the oldest structural temples in South India.",
      visitingTips: [
        "Start early morning to avoid heat and crowds",
        "Wear comfortable shoes for walking on rocky terrain",
        "Visit at sunrise or sunset for best photography",
        "Combine with beach visit at Mahabalipuram Beach",
        "Allow full day to explore all monument groups",
        "Hire local guide for detailed historical context",
        "Try local seafood at beachside restaurants"
      ]
    },
    howToReach: {
      summary: "Located on the East Coast Road, 55 km south of Chennai, easily accessible by road.",
      full: "Mahabalipuram is well connected by road from Chennai via the scenic East Coast Road (ECR). Regular bus services and taxis available. The monuments are spread across the town and can be explored on foot or by hiring local transport.",
      byAir: {
        nearestAirport: "Chennai International Airport",
        distance: "60 km",
        description: "Well connected to domestic and international destinations. Taxis and buses available via ECR. Journey takes 1.5-2 hours."
      },
      byRail: {
        nearestStation: "Chengalpattu Railway Station",
        distance: "30 km",
        description: "Connected to Chennai and other Tamil Nadu cities. Taxis and buses available to Mahabalipuram. Chennai railway stations (60 km) have better connectivity."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Chennai",
            distance: "55 km",
            route: "Via East Coast Road (ECR)",
            duration: "1.5-2 hours"
          },
          {
            city: "Puducherry",
            distance: "95 km",
            route: "Via ECR",
            duration: "2-2.5 hours"
          },
          {
            city: "Kanchipuram",
            distance: "65 km",
            route: "Via NH48",
            duration: "1.5 hours"
          }
        ],
        localTransport: "Local buses from Chennai. Auto-rickshaws and bicycle rentals in town. Walking between monument groups recommended."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "360-degree views of Shore Temple, Five Rathas, and Arjuna's Penance",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D models of rock-cut architecture and monolithic temples",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "6:00 AM - 6:00 PM (Daily)",
      entryFee: "INR 40 for Indians, INR 600 for foreigners (covers major monument groups)",
      bestTimeToVisit: "November to February. Mahabalipuram Dance Festival in December-January. Early mornings and evenings preferred for photography.",
      duration: "Full day (6-8 hours) to explore all monuments comprehensively"
    }
  },
  {
    name: "Sunderbans Mangrove Forest",
    category: "UNESCO World Heritage",
    year: "Natural Heritage",
    location: {
      coordinates: [89.1833, 21.9497],
      city: "Gosaba",
      state: "West Bengal",
      country: "India"
    },
    info: {
      summary: "World's largest mangrove forest and tiger reserve, home to the Royal Bengal Tiger.",
      full: "The Sundarbans is a vast forest in the coastal region of the Bay of Bengal, shared between Bangladesh and India (West Bengal). It is the world's largest mangrove forest and home to the Royal Bengal Tiger. The Indian Sundarbans covers about 4,264 sq km and is a UNESCO World Heritage Site, recognized for its unique biodiversity and ecological significance.",
      history: "The name 'Sundarbans' may derive from 'Sundari' trees or from 'Samudraban' (forest by the sea). Historically a delta region formed by confluence of Ganges, Brahmaputra, and Meghna rivers. Declared a wildlife sanctuary in 1977 and National Park in 1984. Became UNESCO World Heritage Site in 1987.",
      architecture: "Natural heritage site featuring complex network of tidal waterways, mudflats, and small islands covered with mangrove forests. The landscape is characterized by intricate river channels, creeks, and estuaries. Village settlements exist on the periphery with unique stilt houses adapted to tidal flooding.",
      significance: "UNESCO World Heritage Site and Biosphere Reserve. Largest habitat of Royal Bengal Tigers with unique swimming tigers. Critical ecosystem providing natural protection against cyclones and tsunamis. Home to diverse wildlife including saltwater crocodiles, spotted deer, and over 260 bird species. Important for carbon sequestration and climate regulation.",
      visitingTips: [
        "Visit between November to February for best weather",
        "Book authorized boat tours from Sundarbans Tiger Reserve",
        "Stay in eco-cottages at Gosaba or Sajnekhali",
        "Carry binoculars for wildlife spotting",
        "Wear protective clothing - mosquito repellent essential",
        "Tiger sightings are rare - manage expectations",
        "Respect forest regulations and maintain silence during safaris",
        "Photography requires special permission in core areas"
      ]
    },
    howToReach: {
      summary: "Accessible from Kolkata by road to Godkhali/Sonakhali jetty, then by boat to various islands.",
      full: "To visit Sundarbans, travel from Kolkata to Godkhali (110 km) or Sonakhali (75 km) by road, then take boat to forest areas. Alternatively, reach Canning by train and then by road to jetties. Only authorized boats allowed in tiger reserve areas. Most visitors take 2-3 day package tours from Kolkata.",
      byAir: {
        nearestAirport: "Netaji Subhas Chandra Bose International Airport, Kolkata",
        distance: "110 km to entry points",
        description: "Well connected internationally and domestically. Hire taxi to Godkhali or Sonakhali jetty. Journey takes 3-4 hours."
      },
      byRail: {
        nearestStation: "Canning Railway Station",
        distance: "48 km from Godkhali",
        description: "Connected to Kolkata Sealdah station. Local buses and shared taxis to jetty points. Journey takes 1-1.5 hours from station to jetty."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Kolkata to Godkhali",
            distance: "110 km",
            route: "Via NH12 and local roads",
            duration: "3-4 hours"
          },
          {
            city: "Kolkata to Sonakhali",
            distance: "75 km",
            route: "Via Basanti Highway",
            duration: "2.5-3 hours"
          }
        ],
        localTransport: "Private cars/taxis to jetty points. Authorized boats only for forest entry. Package tours include all transport."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "360-degree views of mangrove waterways and forest landscape",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D terrain model showing the delta and waterway network",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "Dawn to dusk boat safaris. Entry timings vary by season (typically 7 AM - 4 PM)",
      entryFee: "INR 100-300 per person plus boat charges (varies by package). Camera fees additional.",
      bestTimeToVisit: "November to February (winter). Avoid monsoons (June-September). Wildlife more visible in winter months.",
      duration: "2-3 days recommended for comprehensive experience with boat safaris and island visits"
    }
  },
  {
    name: "Kanchipuram Temples",
    category: "Temple",
    year: "7th-8th Century",
    location: {
      coordinates: [79.7006, 12.8342],
      city: "Kanchipuram",
      state: "Tamil Nadu",
      country: "India"
    },
    info: {
      summary: "Ancient temple city known as the 'City of Thousand Temples', one of the seven sacred cities of Hinduism.",
      full: "Kanchipuram, one of the seven Sapta Puri (sacred cities) in Hinduism, is renowned for its ancient temples built by the Pallava and Chola dynasties. The city houses numerous temples dedicated to Shiva and Vishnu, showcasing brilliant Dravidian architecture. Major temples include Kailasanathar Temple, Ekambareswarar Temple, Kamakshi Amman Temple, Varadharaja Perumal Temple, and Vaikunta Perumal Temple.",
      history: "Served as capital of the Pallava dynasty (4th-9th centuries) and later under Chola rule. The city was a major center of learning, religion, and art. Most temples were built between 7th-9th centuries during Pallava rule, with additions and renovations by later dynasties. Kanchipuram was also an important Buddhist center in ancient times.",
      architecture: "Exemplifies Dravidian temple architecture with massive gopurams (gateway towers), pillared halls (mandapams), and intricate stone carvings. Kailasanathar Temple is the oldest, built with sandstone featuring exquisite sculptures. Ekambareswarar Temple has a 59-meter tall gopuram and a massive courtyard. Each temple showcases unique architectural elements from different dynasties.",
      significance: "One of the seven Mokshapuris (cities of salvation). Major pilgrimage destination for both Shaivites and Vaishnavites. Considered one of India's seven sacred cities where moksha (liberation) can be attained. Also famous for silk weaving - Kanchipuram silk sarees are world-renowned.",
      visitingTips: [
        "Plan at least 2 days to visit major temples",
        "Dress conservatively - traditional attire preferred",
        "Remove footwear before entering temples",
        "Photography restrictions vary by temple - ask permission",
        "Visit Ekambareswarar Temple early morning for serene atmosphere",
        "Shop for authentic Kanchipuram silk sarees",
        "Combine with Mahabalipuram visit (70 km away)"
      ]
    },
    howToReach: {
      summary: "Located 75 km southwest of Chennai, well connected by road and rail.",
      full: "Kanchipuram is easily accessible from Chennai by train, bus, or taxi. The city is compact and temples can be explored by hiring auto-rickshaws or cycle-rickshaws. Many visitors do day trips from Chennai, but staying overnight allows for a more relaxed exploration.",
      byAir: {
        nearestAirport: "Chennai International Airport",
        distance: "75 km",
        description: "Well connected domestically and internationally. Taxis and buses available to Kanchipuram. Journey takes 2-2.5 hours."
      },
      byRail: {
        nearestStation: "Kanchipuram Railway Station",
        distance: "1 km from city center",
        description: "Connected to Chennai, Bangalore, and other Tamil Nadu cities. Auto-rickshaws and cycle-rickshaws available to temples."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Chennai",
            distance: "75 km",
            route: "Via NH48",
            duration: "2-2.5 hours"
          },
          {
            city: "Bangalore",
            distance: "330 km",
            route: "Via NH44 and NH48",
            duration: "6-7 hours"
          },
          {
            city: "Mahabalipuram",
            distance: "70 km",
            route: "Via local roads and NH48",
            duration: "1.5-2 hours"
          }
        ],
        localTransport: "City buses, auto-rickshaws, cycle-rickshaws. Bicycle rentals available. Walking between nearby temples recommended."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Virtual tours of temple complexes and architectural details",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D models of temple gopurams and architectural structures",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "Varies by temple, generally 6:00 AM - 12:00 PM and 4:00 PM - 8:00 PM",
      entryFee: "Most temples free entry. Some charge nominal fees or camera charges.",
      bestTimeToVisit: "October to March. Temple festivals throughout the year - check calendar. Avoid peak summer (April-June).",
      duration: "2 days recommended to cover major temples. Single day possible for quick visit of 3-4 main temples."
    }
  },
  {
    name: "Badami Cave Temples",
    category: "Rock-cut Cave",
    year: "6th Century",
    location: {
      coordinates: [75.6792, 15.9150],
      city: "Badami",
      state: "Karnataka",
      country: "India"
    },
    info: {
      summary: "Ancient rock-cut cave temples showcasing early Chalukyan architecture with Hindu and Jain monuments.",
      full: "The Badami Cave Temples are a complex of four Hindu, Jain and possibly Buddhist cave temples located in Badami, Karnataka. Carved out of soft Badami sandstone on a hill cliff in the late 6th century, they are considered an example of Indian rock-cut architecture, especially Badami Chalukya architecture. The caves overlook the Agastya Lake and are surrounded by fortifications and ancient structures.",
      history: "Built during the reign of Chalukya dynasty, primarily under Mangalesha (578-610 CE). Cave 3, the largest, is dated to 578 CE based on inscriptions. Badami served as the capital of the Early Chalukyas who ruled much of Karnataka and Andhra Pradesh between 543-757 CE. The caves were carved when Badami was at its zenith as a royal capital.",
      architecture: "Four main caves numbered 1-4: Cave 1 (Shiva temple), Cave 2 (Vishnu temple), Cave 3 (largest, Vishnu temple with exquisite carvings), and Cave 4 (Jain temple). Features include intricately carved pillars, bracket figures, and panels depicting various Hindu deities. Cave 3 contains an 18-armed Nataraja dancing pose and Vishnu as Trivikrama. The caves showcase the evolution of early Chalukyan rock-cut architecture.",
      significance: "Represents the cradle of Indian temple architecture. The architectural style developed here influenced later temple construction across South India. Important example of religious harmony with Hindu and Jain caves coexisting. The sculptures and carvings are considered masterpieces of 6th-century Indian art.",
      visitingTips: [
        "Visit early morning to avoid heat and crowds",
        "Climb can be steep - wear comfortable shoes",
        "Best photography during morning golden hour",
        "Combine with Aihole and Pattadakal (nearby heritage sites)",
        "Explore Badami Fort and Agastya Lake",
        "Stay in Badami for full day exploration",
        "Carry water - limited facilities on the hill"
      ]
    },
    howToReach: {
      summary: "Located in Bagalkot district, accessible by road and rail from Hubli, Belgaum, and Bangalore.",
      full: "Badami is well connected by rail and road. The nearest major city is Hubli (110 km). The cave temples are located at the edge of Badami town, requiring a 10-15 minute climb from the base. Local transport includes auto-rickshaws and taxis.",
      byAir: {
        nearestAirport: "Hubli Airport (Belgaum Airport alternative)",
        distance: "110 km (Hubli), 190 km (Belgaum)",
        description: "Hubli Airport has limited connectivity. Taxis available to Badami taking 2.5-3 hours. Belgaum Airport is better connected."
      },
      byRail: {
        nearestStation: "Badami Railway Station",
        distance: "5 km from cave temples",
        description: "Connected to Hubli, Gadag, and Solapur. Auto-rickshaws and taxis available to reach the caves."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Bangalore",
            distance: "500 km",
            route: "Via NH48 and SH14",
            duration: "9-10 hours"
          },
          {
            city: "Hubli",
            distance: "110 km",
            route: "Via NH67",
            duration: "2.5-3 hours"
          },
          {
            city: "Hampi",
            distance: "140 km",
            route: "Via local roads",
            duration: "3-4 hours"
          }
        ],
        localTransport: "Auto-rickshaws and cycle-rickshaws in town. Walking required to climb to caves."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "360-degree views of cave interiors and sculptures overlooking Agastya Lake",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D models of cave architecture and sculptural panels",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "9:00 AM - 5:30 PM (Daily)",
      entryFee: "INR 25 for Indians, INR 300 for foreigners",
      bestTimeToVisit: "October to March. Avoid summer heat (April-June). Monsoons make climbing slippery.",
      duration: "2-3 hours for cave exploration. Full day including Badami Fort and lake."
    }
  },
  {
    name: "Aihole Temple Complex",
    category: "Historic Building",
    year: "5th-8th Century",
    location: {
      coordinates: [75.8046, 15.9547],
      city: "Aihole",
      state: "Karnataka",
      country: "India"
    },
    info: {
      summary: "Cradle of Indian temple architecture with over 125 temples showcasing experimental architectural styles.",
      full: "Aihole is a historic site featuring over 125 temples dating from the 5th to 8th centuries. Known as the 'Cradle of Indian Architecture', it was the first capital of the Early Chalukyas. The temples here represent experimental phases of temple architecture, bridging the gap between earlier rock-cut caves and later free-standing structural temples. Major temples include Durga Temple, Lad Khan Temple, Ravanaphadi Cave Temple, and Meguti Jain Temple.",
      history: "Served as the capital of Early Chalukyas before Badami. The temples were built between 450-750 CE during the Chalukya period. Aihole was a major center of art, culture, and religion. The site showcases the evolution of temple architecture from rock-cut to structural form. Inscriptions mention it as 'Ayyavole' and 'Aryapura'.",
      architecture: "Features diverse architectural styles including nagara (North Indian), dravida (South Indian), and vesara (hybrid). Durga Temple has an apsidal plan with a circumambulatory path and elevated platform. Lad Khan Temple shows early structural temple design with flat roof and pillared hall. Ravanaphadi Cave displays rock-cut tradition. The temples showcase various roof styles, pillar designs, and decorative elements representing architectural experimentation.",
      significance: "Called the 'Laboratory of Indian Temple Architecture' due to diverse experimental styles. Represents the birthplace of structural temple building in India. The site influenced temple architecture across Karnataka and beyond. Important for understanding the evolution of Indian religious architecture.",
      visitingTips: [
        "Plan full day to explore all major temples",
        "Hire local guide for architectural insights",
        "Visit Durga Temple and Lad Khan Temple first",
        "Combine with Badami (45 km) and Pattadakal (12 km) circuit",
        "Wear comfortable walking shoes - temples spread across area",
        "Carry water and snacks - limited facilities",
        "Best photographed in morning and late afternoon light"
      ]
    },
    howToReach: {
      summary: "Located near Badami in Bagalkot district, accessible by road. No railway station in Aihole.",
      full: "Aihole is best accessed by road from Badami (45 km) or Pattadakal (12 km). The temples are spread across the village and surrounding areas. Local transport includes auto-rickshaws and bicycles for hire. Most visitors do the Badami-Aihole-Pattadakal circuit.",
      byAir: {
        nearestAirport: "Hubli Airport",
        distance: "135 km",
        description: "Limited connectivity. Hire taxi to Aihole via Badami. Journey takes 3-4 hours."
      },
      byRail: {
        nearestStation: "Badami Railway Station",
        distance: "45 km",
        description: "Connected to major Karnataka cities. Taxis and buses available to Aihole. Journey takes 1-1.5 hours."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Badami",
            distance: "45 km",
            route: "Via SH14",
            duration: "1-1.5 hours"
          },
          {
            city: "Pattadakal",
            distance: "12 km",
            route: "Via local roads",
            duration: "20-30 minutes"
          },
          {
            city: "Hubli",
            distance: "135 km",
            route: "Via NH67 and SH14",
            duration: "3-3.5 hours"
          }
        ],
        localTransport: "Auto-rickshaws for inter-temple transport. Bicycle rentals available. Walking between nearby temples possible."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Virtual tour of Durga Temple complex and experimental architectural styles",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D architectural models showing diverse temple styles and evolution",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "Sunrise to sunset (no specific timings, open-air temples)",
      entryFee: "Free entry to most temples. Some may have nominal charges.",
      bestTimeToVisit: "October to March. UNESCO Heritage site visits combine well with Badami and Pattadakal.",
      duration: "4-5 hours for major temples. Full day for comprehensive exploration."
    }
  },
  {
    name: "Rani Padmini Palace",
    category: "Palace",
    year: "13th-14th Century",
    location: {
      coordinates: [74.6476, 24.8887],
      city: "Chittorgarh",
      state: "Rajasthan",
      country: "India"
    },
    info: {
      summary: "Historic palace within Chittorgarh Fort, associated with the legendary beauty Queen Padmini.",
      full: "Rani Padmini's Palace is a significant monument within Chittorgarh Fort, associated with the legendary Rajput queen Padmini (also known as Padmavati). According to legend, Alauddin Khilji was so captivated by her beauty that he attacked Chittorgarh to possess her. The palace is built beside a lotus pool, and it is said that Khilji was only allowed to see her reflection in the water through mirrors. The palace exemplifies Rajput architecture with pavilions, corridors, and water bodies.",
      history: "Built during the 13th-14th century, though exact dates are uncertain. The palace is associated with the story of Rani Padmini and the 1303 CE siege of Chittorgarh by Alauddin Khilji. After the fall of the fort, Padmini and other royal women committed Jauhar (self-immolation) to avoid capture. While historical accuracy of the Padmini legend is debated, the palace remains an important cultural monument.",
      architecture: "Built in traditional Rajput architectural style with white marble and sandstone. Features include a three-story structure overlooking a lotus pool, zenana (women's quarters), pavilions with jharokhas (overhanging enclosed balconies), and ornate galleries. The palace has a central courtyard and rooms arranged around it. The water pavilion (Jal Mahal) in the pool offers scenic views.",
      significance: "Symbol of Rajput valor, honor, and sacrifice. The palace represents the practice of Jauhar in Rajput history. Important cultural landmark associated with legendary tales of beauty and bravery. Part of Chittorgarh Fort, one of the largest forts in India.",
      visitingTips: [
        "Visit as part of Chittorgarh Fort tour",
        "Best photographed during morning or evening light",
        "Combine with other fort monuments like Vijay Stambh and Kirti Stambh",
        "Hire guide for historical context and legends",
        "Sound and light show at fort narrates history",
        "Wear comfortable shoes - extensive walking required",
        "Carry water - fort exploration takes several hours"
      ]
    },
    howToReach: {
      summary: "Located within Chittorgarh Fort, accessible from Chittorgarh city center 5 km away.",
      full: "Rani Padmini Palace is inside Chittorgarh Fort, approximately 5 km from Chittorgarh city. The fort can be reached by auto-rickshaws, taxis, or private vehicles. Once inside the fort, the palace is accessible by local transport or walking.",
      byAir: {
        nearestAirport: "Maharana Pratap Airport, Udaipur",
        distance: "120 km",
        description: "Well connected to major cities. Taxis available to Chittorgarh. Journey takes 2.5-3 hours."
      },
      byRail: {
        nearestStation: "Chittorgarh Railway Station",
        distance: "6 km from fort entrance",
        description: "Major junction connected to Delhi, Mumbai, Jaipur, and Udaipur. Auto-rickshaws and taxis to fort."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Udaipur",
            distance: "120 km",
            route: "Via NH27",
            duration: "2.5-3 hours"
          },
          {
            city: "Jaipur",
            distance: "320 km",
            route: "Via NH48",
            duration: "6-7 hours"
          },
          {
            city: "Ajmer",
            distance: "200 km",
            route: "Via NH58",
            duration: "4-4.5 hours"
          }
        ],
        localTransport: "Auto-rickshaws and taxis to fort entrance. Electric vehicles and local taxis within fort premises."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Virtual view of the palace and lotus pool",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D model of palace structure and water pavilion",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "9:45 AM - 5:45 PM (Daily, part of Chittorgarh Fort)",
      entryFee: "INR 40 for Indians, INR 600 for foreigners (Chittorgarh Fort entry)",
      bestTimeToVisit: "October to March. Avoid summer heat. Monsoons bring greenery but may be slippery.",
      duration: "1 hour for palace. 4-5 hours for entire Chittorgarh Fort."
    }
  },
  {
    name: "Hemis Monastery",
    category: "Temple",
    year: "1630",
    location: {
      coordinates: [77.6662, 34.0086],
      city: "Leh",
      state: "Ladakh",
      country: "India"
    },
    info: {
      summary: "Largest and wealthiest Buddhist monastery in Ladakh, famous for annual Hemis Festival.",
      full: "Hemis Monastery is a Himalayan Buddhist monastery of the Drukpa Lineage, located in Hemis, Ladakh. Founded in 1630, it is the largest and wealthiest monastery in Ladakh. The monastery houses a rich collection of ancient relics, including gold statues, stupas, thangkas (Buddhist paintings), and a two-story high statue of Buddha. The monastery is most famous for the annual Hemis Festival celebrating Guru Padmasambhava's birth anniversary.",
      history: "Founded in 1630 during the reign of King Sengge Namgyal by Stagsang Raspa Nawang Gyatso under the patronage of the king. The monastery was built on the site of an earlier monastery. Re-established in 1672 by Gyalsras Rinpoche. The monastery belongs to the Drukpa order and has significant religious and cultural influence in the region.",
      architecture: "Traditional Tibetan Buddhist monastery architecture with multi-story structure built around a central courtyard. Features white-washed walls with red and ochre decorative bands. The assembly hall (Dukhang) contains a massive gilt statue of Buddha. Walls are adorned with elaborate murals depicting Buddhist deities and mandalas. The monastery complex includes chapels, residential quarters for monks, and a museum.",
      significance: "Largest monastery in Ladakh and richest in terms of cultural artifacts. Houses rare thangkas, some over 500 years old. The Hemis Festival is one of the biggest religious festivals in Ladakh, featuring masked dances (Cham) and cultural performances. Repository of Buddhist manuscripts and texts. Believed to have a sacred thangka of Lord Padmasambhava displayed once every 12 years.",
      visitingTips: [
        "Visit during Hemis Festival (June-July) for vibrant cultural experience",
        "Dress in layers - weather can change quickly",
        "Respect monastery customs - remove shoes before entering temples",
        "Photography may be restricted in certain areas",
        "Acclimatize to high altitude before visiting (3,600 m elevation)",
        "Visit early morning for prayers and chanting",
        "Combine with Thiksey and Shey monasteries on Leh-Manali route"
      ]
    },
    howToReach: {
      summary: "Located 45 km southeast of Leh, accessible by road through scenic mountain routes.",
      full: "Hemis Monastery is about 45 km from Leh via a well-maintained road. Visitors can hire taxis, take local buses, or join organized tours from Leh. The journey offers spectacular views of the Indus Valley and surrounding mountains.",
      byAir: {
        nearestAirport: "Kushok Bakula Rimpochee Airport, Leh",
        distance: "45 km",
        description: "Connected to Delhi, Srinagar, and other cities (seasonal). Taxis and rental vehicles to Hemis. Journey takes 1-1.5 hours. Important to acclimatize in Leh for 1-2 days before travel."
      },
      byRail: {
        nearestStation: "Jammu Tawi Railway Station",
        distance: "700 km",
        description: "Nearest railhead. From Jammu, travel to Leh by road (2 days) or fly. Rail connectivity to Ladakh not available."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Leh",
            distance: "45 km",
            route: "Via Leh-Manali Highway",
            duration: "1-1.5 hours"
          },
          {
            city: "Manali to Leh",
            distance: "475 km",
            route: "Via Leh-Manali Highway (seasonal, June-September)",
            duration: "2 days with overnight stop"
          },
          {
            city: "Srinagar to Leh",
            distance: "420 km",
            route: "Via NH1 (Srinagar-Leh Highway)",
            duration: "2 days with overnight stop"
          }
        ],
        localTransport: "Taxis and shared taxis from Leh. Local buses available but infrequent. Motorcycle rentals popular among adventure tourists."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "360-degree views of monastery courtyard and surrounding Himalayan landscape",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D model of monastery architecture and layout",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "8:00 AM - 1:00 PM, 2:00 PM - 6:00 PM (Daily)",
      entryFee: "INR 50 for Indians, INR 100 for foreigners. Camera charges additional.",
      bestTimeToVisit: "June to September (summer months when roads are accessible). Hemis Festival in June-July. Winter visits possible but extremely cold.",
      duration: "2-3 hours for monastery exploration. Full day if attending Hemis Festival."
    }
  },
  {
    name: "Mattancherry Palace (Dutch Palace)",
    category: "Palace",
    year: "1555",
    location: {
      coordinates: [76.2598, 9.9578],
      city: "Kochi",
      state: "Kerala",
      country: "India"
    },
    info: {
      summary: "Portuguese-built palace with Dutch renovations featuring stunning Kerala murals depicting Hindu epics.",
      full: "Mattancherry Palace, also known as the Dutch Palace, is a Portuguese palace located in Mattancherry, Kochi. Built by the Portuguese in 1555 and presented to the Raja of Kochi, it was later renovated by the Dutch in 1663. The palace is renowned for its exquisite murals depicting scenes from the Ramayana, Mahabharata, and Puranic legends in the traditional Kerala style. Despite its name, the architectural style is predominantly traditional Kerala nalukettu (quadrangular) with some colonial influences.",
      history: "Built by Portuguese colonizers in 1555 as a gift to King Veera Kerala Varma of Kochi to secure trading rights. The Dutch East India Company later renovated and improved the palace in 1663, giving it the nickname 'Dutch Palace.' The palace served as the residence of the Kochi royal family. It was taken over by the Archaeological Survey of India and converted into a museum in 1951.",
      architecture: "Traditional Kerala architecture in nalukettu style with a central courtyard. Features sloping tile roofs, wooden ceilings, and spacious halls. The palace has two floors with rooms surrounding the central courtyard. Most notable are the stunning murals covering the walls - painted using natural vegetable colors and paints in the traditional Kerala mural style. The coronation hall and royal bedchambers contain the most elaborate artwork.",
      significance: "Houses some of the finest examples of Kerala mural art in India. The murals are executed in vibrant colors depicting Hindu mythology with exceptional detail. Important example of Kerala-European architectural fusion. Contains portraits of Kochi Rajas, royal palanquins, ceremonial dresses, and other artifacts. The murals in the coronation hall and bedroom are considered masterpieces.",
      visitingTips: [
        "Photography strictly prohibited inside the palace",
        "Visit during morning hours for better light and fewer crowds",
        "Combine with Jewish Synagogue and Jew Town (walking distance)",
        "Allow 1-2 hours for detailed observation of murals",
        "Wear modest clothing - it's a cultural site",
        "Audio guides available for detailed information",
        "Best combined with Fort Kochi heritage walk"
      ]
    },
    howToReach: {
      summary: "Located in Mattancherry area of Kochi, easily accessible by road, ferry, and metro.",
      full: "Mattancherry Palace is in the heart of old Kochi. Accessible via Kochi Metro (Maharaja's College Station, then auto-rickshaw), ferries from Ernakulam to Mattancherry Jetty, or direct road transport. The palace is walking distance from the Jewish Synagogue and spice markets.",
      byAir: {
        nearestAirport: "Cochin International Airport",
        distance: "40 km",
        description: "India's first fully solar-powered airport. Taxis, app-cabs, and airport buses to Kochi city. Journey takes 1-1.5 hours."
      },
      byRail: {
        nearestStation: "Ernakulam Junction Railway Station",
        distance: "10 km",
        description: "Major railway junction in Kerala. Metro, buses, auto-rickshaws, and ferries available to Mattancherry."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Thiruvananthapuram",
            distance: "220 km",
            route: "Via NH66",
            duration: "4-5 hours"
          },
          {
            city: "Kozhikode",
            distance: "195 km",
            route: "Via NH66",
            duration: "4-4.5 hours"
          },
          {
            city: "Munnar",
            distance: "130 km",
            route: "Via SH17",
            duration: "4-5 hours (mountain roads)"
          }
        ],
        localTransport: "Kochi Metro to Maharaja's College station + auto. Ferry from Ernakulam to Mattancherry Jetty. Auto-rickshaws, taxis, and app-cabs widely available."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "External 360-degree views of palace architecture and courtyard",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D model of nalukettu architecture and palace layout",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "10:00 AM - 5:00 PM (Closed on Fridays and national holidays)",
      entryFee: "INR 5 for Indians, INR 100 for foreigners",
      bestTimeToVisit: "October to March (pleasant weather). Avoid monsoons for better accessibility. Weekday mornings less crowded.",
      duration: "1.5-2 hours"
    }
  },
  {
    name: "Chand Baori Stepwell",
    category: "Historic Building",
    year: "9th Century",
    location: {
      coordinates: [76.6061, 27.0073],
      city: "Abhaneri",
      state: "Rajasthan",
      country: "India"
    },
    info: {
      summary: "One of the deepest and largest stepwells in India with 3,500 perfectly symmetrical steps.",
      full: "Chand Baori is one of the oldest and deepest stepwells in India, located in Abhaneri village near Jaipur. Built in the 9th century by King Chanda of the Nikumbha Dynasty, it has 3,500 narrow steps arranged in perfect symmetry extending 13 stories deep (approximately 100 feet). The stepwell was built to provide water storage and a cool respite from intense Rajasthan heat. Its geometric precision and architectural beauty have made it one of India's most photographed stepwells.",
      history: "Constructed around 800-900 CE during the reign of King Chanda (hence the name Chand Baori). The stepwell served as a water storage system and community gathering place during the harsh summer months. Adjacent to the stepwell is the Harshat Mata Temple, built around the same period. The village Abhaneri was originally called 'Abha Nagri' (City of Brightness). The stepwell fell into disrepair but has been partially restored.",
      architecture: "Square-shaped structure with 3,500 steps in 13 stories descending 100 feet. Features perfect geometric symmetry with steps on three sides and a pavilion with carved pillars on the fourth. The steps create a mesmerizing visual pattern forming a maze-like appearance. At the bottom is a rectangular water reservoir. The pavilion at the top contains intricate carvings of gods, goddesses, and animals. The architecture demonstrates advanced engineering for water management and temperature control.",
      significance: "One of India's deepest and largest stepwells. Architectural marvel demonstrating ancient Indian hydraulic engineering. The symmetrical step pattern is considered geometrically perfect and has been featured in films and photography worldwide. Represents the ingenious water conservation methods developed in arid Rajasthan.",
      visitingTips: [
        "Visit early morning for best photography with dramatic shadows",
        "Wear comfortable shoes - stairs can be steep and uneven",
        "Combine with Harshat Mata Temple visit (adjacent)",
        "No barriers at edges - exercise caution, especially with children",
        "Best photographed from top corners for full geometric pattern",
        "Avoid midday summer heat - no shade at the stepwell",
        "Can be combined with day trip from Jaipur"
      ]
    },
    howToReach: {
      summary: "Located in Abhaneri village, 95 km from Jaipur on the Jaipur-Agra highway.",
      full: "Chand Baori is located in Abhaneri village, easily accessible from Jaipur via NH21 (Jaipur-Agra highway). The site is well-signposted from the main highway. Most visitors take a day trip from Jaipur, often combining it with visits to other sites in the region.",
      byAir: {
        nearestAirport: "Jaipur International Airport",
        distance: "95 km",
        description: "Well connected to major Indian cities. Hire taxi to Abhaneri. Journey takes 2-2.5 hours."
      },
      byRail: {
        nearestStation: "Bandikui Junction Railway Station",
        distance: "35 km",
        description: "On Jaipur-Agra rail route. Taxis available to Abhaneri. Alternatively, Jaipur railway station (95 km) has better connectivity."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Jaipur",
            distance: "95 km",
            route: "Via NH21 (Jaipur-Agra Highway)",
            duration: "2-2.5 hours"
          },
          {
            city: "Agra",
            distance: "145 km",
            route: "Via NH21",
            duration: "3-3.5 hours"
          },
          {
            city: "Delhi",
            distance: "280 km",
            route: "Via NH48 and NH21",
            duration: "5-6 hours"
          }
        ],
        localTransport: "Hire taxi or car from Jaipur for day trip. Local buses available but infrequent. Village is small - stepwell walkable from parking area."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "360-degree views showcasing the geometric symmetry and depth of the stepwell",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D model showing the multi-story structure and step patterns",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "8:00 AM - 6:00 PM (Daily)",
      entryFee: "INR 25 for Indians, INR 200 for foreigners (may vary)",
      bestTimeToVisit: "October to March",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Explore the magnificent architecture and gardens in 360-degree view",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D model showcasing the intricate carvings and temple structure",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "9:30 AM - 6:30 PM (Closed Mondays)",
      entryFee: "Free entry. Exhibition tickets: INR 170 (Adults), INR 100 (Children)",
      bestTimeToVisit: "October to March. Visit during weekdays to avoid crowds.",
      duration: "3-4 hours"
    }
  },
  {
    name: "Char Minar Hyderabad",
    category: "Monument",
    year: "1591",
    location: {
      coordinates: [78.4747, 17.3616],
      city: "Hyderabad",
      state: "Telangana",
      country: "India"
    },
    info: {
      summary: "Iconic monument and mosque with four grand arches, symbol of Hyderabad city.",
      full: "Charminar is a monument and mosque located in Hyderabad. The landmark has become known globally as a symbol of Hyderabad and is listed among the most recognized structures in India. Built by Muhammad Quli Qutb Shah in 1591, it features four grand arches facing four different directions. The structure is 56 meters high and 30 meters wide.",
      history: "Built in 1591 by Sultan Muhammad Quli Qutb Shah to commemorate the end of a deadly plague epidemic in the city. The name 'Charminar' translates to 'Four Towers' in Urdu. It was also built to mark the beginning of Hyderabad city.",
      architecture: "Indo-Islamic architecture with four grand arches facing north, south, east, and west. Each minaret stands 48.7 meters tall with a double balcony. The structure has 149 winding steps to reach the upper floor. A mosque is located on the top floor.",
      significance: "Symbol of Hyderabad and its rich cultural heritage. The surrounding area is famous for its bazaars, especially Laad Bazaar known for bangles and pearls.",
      visitingTips: [
        "Visit early morning or late evening to avoid heat",
        "Explore the surrounding Laad Bazaar for traditional shopping",
        "Try famous Hyderabadi biryani at nearby restaurants",
        "Sound and light show available in evenings",
        "Climb to the top for panoramic city views"
      ]
    },
    howToReach: {
      summary: "Located in the heart of Old City, accessible via metro, buses, and auto-rickshaws.",
      full: "Charminar is centrally located in the old city area. The nearest metro station is Charminar Metro Station on Blue Line. Numerous city buses and auto-rickshaws connect to this landmark from all parts of Hyderabad.",
      byAir: {
        nearestAirport: "Rajiv Gandhi International Airport",
        distance: "22 km",
        description: "Airport is connected via buses, metro, and taxis. Journey takes 45-60 minutes."
      },
      byRail: {
        nearestStation: "Hyderabad Deccan (Nampally) Railway Station",
        distance: "5 km",
        description: "Well connected by local buses, auto-rickshaws, and metro. 15-20 minutes journey."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Bangalore",
            distance: "570 km",
            route: "Via NH44",
            duration: "8-9 hours"
          },
          {
            city: "Mumbai",
            distance: "710 km",
            route: "Via NH65",
            duration: "12-13 hours"
          }
        ],
        localTransport: "Metro (Charminar Station), city buses, auto-rickshaws, and app-based cabs available."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "360-degree view of the monument and surrounding bustling markets",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D architectural model showcasing the four minarets and arches",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "9:30 AM - 5:30 PM (Daily)",
      entryFee: "INR 25 for Indians, INR 300 for foreigners",
      bestTimeToVisit: "October to February. Evening visits offer beautiful illumination.",
      duration: "1-2 hours"
    }
  },
  {
    name: "Thanjavur Periya Kovil",
    category: "UNESCO World Heritage",
    year: "1010",
    location: {
      coordinates: [79.1313, 10.7829],
      city: "Thanjavur",
      state: "Tamil Nadu",
      country: "India"
    },
    info: {
      summary: "Also known as Brihadeeswarar Temple, a magnificent example of Chola architecture and UNESCO World Heritage Site.",
      full: "The Brihadisvara Temple, also called Rajarajesvaram or Periya Kovil, is a Hindu temple dedicated to Shiva located in Thanjavur. It is one of the largest South Indian temples and an exemplary example of fully realized Dravidian architecture. Built by Raja Raja Chola I between 1003-1010 AD, the temple celebrated its 1000th year in 2010.",
      history: "Commissioned by Raja Raja Chola I in 1003 AD and completed in 1010 AD. The temple was built as a royal temple to display the emperor's vision of architecture, sculptural beauty, and patronage of arts. It became a UNESCO World Heritage Site in 1987.",
      architecture: "Dravidian architecture at its finest. The vimana (temple tower) is 216 feet tall, making it one of the tallest in the world. The temple has a massive single block of granite weighing 80 tons as its apex. The sanctum has one of the largest Shiva lingams in India. Famous for its frescoes and inscriptions.",
      significance: "UNESCO World Heritage Site. Represents the zenith of Chola architecture and art. The temple's construction demonstrates advanced engineering and architectural knowledge of the ancient period.",
      visitingTips: [
        "Visit during sunrise for best photography",
        "Dress conservatively - traditional attire preferred",
        "Audio guides available in multiple languages",
        "Attend evening aarti for spiritual experience",
        "Explore the museum inside temple complex"
      ]
    },
    howToReach: {
      summary: "Located in Thanjavur city center, easily accessible by road and rail from major South Indian cities.",
      full: "Thanjavur is well connected by rail and road. The temple is located in the heart of the city, easily accessible by local transport. Regular bus services connect Thanjavur to Chennai, Trichy, Madurai, and other Tamil Nadu cities.",
      byAir: {
        nearestAirport: "Tiruchirappalli International Airport",
        distance: "60 km",
        description: "Nearest major airport. Taxis and buses available for the 1.5-hour journey to Thanjavur."
      },
      byRail: {
        nearestStation: "Thanjavur Junction Railway Station",
        distance: "2 km",
        description: "Well connected to Chennai, Bangalore, and other major cities. Auto-rickshaws and taxis available to temple."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Chennai",
            distance: "340 km",
            route: "Via NH45 and NH83",
            duration: "6-7 hours"
          },
          {
            city: "Madurai",
            distance: "190 km",
            route: "Via NH38",
            duration: "4-5 hours"
          },
          {
            city: "Trichy",
            distance: "55 km",
            route: "Via NH83",
            duration: "1.5 hours"
          }
        ],
        localTransport: "City buses, auto-rickshaws, and cycle rickshaws available throughout the city."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Virtual tour of the grand temple architecture and intricate sculptures",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "Detailed 3D model of the temple showcasing Chola architectural brilliance",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM (Daily)",
      entryFee: "Free entry",
      bestTimeToVisit: "October to March. Special celebrations during Maha Shivaratri.",
      duration: "2-3 hours"
    }
  },
  {
    name: "Jaisalmer Fort",
    category: "UNESCO World Heritage",
    year: "1156",
    location: {
      coordinates: [70.9118, 26.9124],
      city: "Jaisalmer",
      state: "Rajasthan",
      country: "India"
    },
    info: {
      summary: "Living fort in the Thar Desert, one of the largest fully preserved fortified cities in the world.",
      full: "Jaisalmer Fort is one of the very few 'living forts' in the world, with about 4000 people residing within its walls. Built in 1156 AD by Rawal Jaisal, it stands on Trikuta Hill amidst the Thar Desert. The fort's massive yellow sandstone walls turn golden in sunlight, giving it the name 'Sonar Quila' or Golden Fort. It's part of the Hill Forts of Rajasthan UNESCO World Heritage Site.",
      history: "Founded in 1156 AD by the Bhati Rajput ruler Rawal Jaisal. The fort has witnessed numerous battles and sieges. It served as a major trading center on the Silk Route linking India with Central Asia, Egypt, Arabia, Persia, Africa, and the West.",
      architecture: "Built with yellow sandstone, the fort is 250 feet tall and protected by a 30-foot-tall wall. Features 99 bastions, 92 of which were built between 1633-1647. Contains Raj Mahal (Royal Palace), Jain temples with intricate carvings, Laxminath Temple, and numerous havelis. The architecture showcases exquisite stonework and filigree.",
      significance: "UNESCO World Heritage Site (as part of Hill Forts of Rajasthan). One of the few living forts where people still reside and conduct businesses. Represents the golden era of Rajputana architecture.",
      visitingTips: [
        "Explore the fort during golden hour for photography",
        "Stay in heritage hotels inside the fort for unique experience",
        "Visit Patwon Ki Haveli and other havelis nearby",
        "Take camel safari in Thar Desert",
        "Shop for local handicrafts and embroidered items",
        "Watch cultural performances in the evenings"
      ]
    },
    howToReach: {
      summary: "Located in western Rajasthan, accessible by air, rail, and road from major cities.",
      full: "Jaisalmer is connected by air, rail, and road. The fort is located in the city center and easily accessible by local transport. The nearest airport has limited connectivity, so most visitors prefer train or bus journeys.",
      byAir: {
        nearestAirport: "Jaisalmer Airport",
        distance: "5 km",
        description: "Limited flights from Delhi and Jaipur. Jodhpur Airport (285 km) is better connected alternative."
      },
      byRail: {
        nearestStation: "Jaisalmer Railway Station",
        distance: "2 km",
        description: "Connected to Delhi, Jaipur, and Jodhpur. Auto-rickshaws and taxis available to fort."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Jaipur",
            distance: "560 km",
            route: "Via NH62 and NH11",
            duration: "10-11 hours"
          },
          {
            city: "Jodhpur",
            distance: "285 km",
            route: "Via NH125",
            duration: "5-6 hours"
          },
          {
            city: "Delhi",
            distance: "800 km",
            route: "Via NH11",
            duration: "14-15 hours"
          }
        ],
        localTransport: "Auto-rickshaws, cycle-rickshaws, and taxis. Walking within fort premises recommended."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Panoramic views of the golden sandstone fort and desert landscape",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D model of the fort complex showing bastions, palaces, and temples",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "8:00 AM - 6:00 PM (Daily for tourists)",
      entryFee: "INR 50 for Indians, INR 250 for foreigners. Additional fees for palace and museums.",
      bestTimeToVisit: "October to March. Desert Festival in February is special attraction.",
      duration: "3-4 hours for fort exploration"
    }
  },
  {
    name: "Tirupati Venkateswara Temple",
    category: "Temple",
    year: "300 AD",
    location: {
      coordinates: [79.3477, 13.6833],
      city: "Tirupati",
      state: "Andhra Pradesh",
      country: "India"
    },
    info: {
      summary: "One of the richest and most visited pilgrimage centers in the world, dedicated to Lord Venkateswara.",
      full: "Sri Venkateswara Swami Temple is a Hindu temple situated in the hill town of Tirumala at Tirupati. The temple is dedicated to Lord Venkateswara, a form of Vishnu. It is one of the richest temples in the world in terms of donations received and wealth. The temple receives approximately 50,000-100,000 pilgrims daily, with the number rising to 500,000 on special occasions.",
      history: "The temple has ancient origins with references dating back to Tamil literature of the 1st-3rd centuries AD. Major construction occurred during the Pallava and Chola dynasties (9th-13th centuries). The temple gained prominence during the Vijayanagara Empire and continues to be maintained by Tirumala Tirupati Devasthanams.",
      architecture: "Built in Dravidian architectural style with three entrance towers (gopurams). The main temple has a golden vimana (cupola). The sanctum sanctorum houses the deity of Lord Venkateswara with a diamond crown. The temple complex includes multiple mandapams, smaller shrines, and administrative buildings.",
      significance: "Considered one of the most sacred Vaishnavite temples. The temple receives the highest number of pilgrims among all religious sites in the world. Famous for its 'Laddu prasadam' which has geographical indication status.",
      visitingTips: [
        "Book darshan tickets online in advance to avoid long queues",
        "Special entry darshan (Rs. 300) saves significant waiting time",
        "Accommodation booking required well in advance",
        "Head tonsuring is common ritual - facilities available",
        "Dress code: traditional attire, no shorts or sleeveless",
        "Avoid peak pilgrimage seasons if you have time constraints"
      ]
    },
    howToReach: {
      summary: "Located on Tirumala Hills, 22 km from Tirupati city. Accessible by road with regular bus services and private vehicles.",
      full: "The temple is located on Tirumala Hills. Pilgrims can reach via road (ghat road or modern highway) from Tirupati. APSRTC operates frequent bus services. Free bus services available from Tirupati to Tirumala for pedestrian pilgrims. Alipiri footpath allows walking ascent (approximately 3,500 steps).",
      byAir: {
        nearestAirport: "Tirupati International Airport",
        distance: "35 km from Tirumala",
        description: "Connected to major Indian cities. Taxis and buses available to Tirumala. Journey takes 1-1.5 hours."
      },
      byRail: {
        nearestStation: "Tirupati Railway Station",
        distance: "25 km from Tirumala",
        description: "Major railway junction connected to all major cities. Free and paid bus services to Tirumala available. Journey takes 45-60 minutes."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Chennai",
            distance: "140 km",
            route: "Via NH716",
            duration: "3-4 hours"
          },
          {
            city: "Bangalore",
            distance: "250 km",
            route: "Via NH44",
            duration: "5-6 hours"
          },
          {
            city: "Hyderabad",
            distance: "620 km",
            route: "Via NH44",
            duration: "10-11 hours"
          }
        ],
        localTransport: "Frequent APSRTC buses from Tirupati. Taxis available. Walking via Alipiri steps (3-4 hours)."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "Virtual view of the temple complex and surrounding hills",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "3D model of temple architecture and layout",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "Open 24 hours with different darshan timings throughout the day",
      entryFee: "Free general darshan (long queue). Special darshan: INR 300. Seeghra Darshan: INR 500+",
      bestTimeToVisit: "September to February. Avoid festival times for shorter queues. Brahmotsavam in September attracts huge crowds.",
      duration: "1 day minimum (including travel and darshan). 2-3 days recommended for comfortable visit."
    }
  },
  {
    name: "Shri Jagannath Temple Puri",
    category: "Temple",
    year: "12th Century",
    location: {
      coordinates: [85.8186, 19.8048],
      city: "Puri",
      state: "Odisha",
      country: "India"
    },
    info: {
      summary: "One of the four sacred Char Dham pilgrimage sites, famous for the annual Rath Yatra festival.",
      full: "The Jagannath Temple in Puri is an important Hindu temple dedicated to Lord Jagannath, a form of Vishnu. It is one of the Char Dham pilgrimage sites and is famous for its annual Rath Yatra (chariot festival) where three giant chariots carry the deities through the streets. The temple's kitchen is considered the world's largest kitchen, feeding thousands daily.",
      history: "Built by King Anantavarman Chodaganga Deva in the 12th century. The temple has been renovated and rebuilt several times. The current structure dates from the original 12th-century temple. The temple has survived invasions and continues to be an important center of Vaishnavism in Odisha.",
      architecture: "Built in Kalinga architectural style. The temple complex spans 400,000 square feet and is surrounded by a wall 20 feet high. The main temple tower (Bada Deula) is 214 feet tall and topped with the Sudarshana Chakra made of eight metals. The temple has four gates in four cardinal directions.",
      significance: "One of the Char Dham pilgrimage sites. Famous for the Rath Yatra festival attracting millions. The Mahaprasad (sacred food) is considered highly auspicious. The temple flag changes direction with the wind, considered miraculous by devotees.",
      visitingTips: [
        "Non-Hindus are not allowed inside the temple",
        "Dress modestly and traditionally",
        "Visit during Rath Yatra (June-July) for the festival experience",
        "Book accommodation well in advance during festivals",
        "Try the famous Mahaprasad at the temple",
        "Combine with beach visit at Puri Beach"
      ]
    },
    howToReach: {
      summary: "Located in Puri town, well connected by rail and road from major cities in Odisha and neighboring states.",
      full: "Puri is well connected by rail and road. The temple is located in the heart of Puri town, walkable from most hotels and the railway station. Regular bus services connect Puri to Bhubaneswar and other Odisha cities.",
      byAir: {
        nearestAirport: "Biju Patnaik International Airport, Bhubaneswar",
        distance: "60 km",
        description: "Well connected to major Indian cities. Taxis and buses available to Puri. Journey takes 1.5-2 hours."
      },
      byRail: {
        nearestStation: "Puri Railway Station",
        distance: "1.5 km",
        description: "Major railway junction with trains from Delhi, Kolkata, Mumbai, Chennai, and other cities. Auto-rickshaws and cycle-rickshaws to temple."
      },
      byRoad: {
        fromMajorCities: [
          {
            city: "Bhubaneswar",
            distance: "60 km",
            route: "Via NH316",
            duration: "1.5-2 hours"
          },
          {
            city: "Kolkata",
            distance: "500 km",
            route: "Via NH16",
            duration: "9-10 hours"
          },
          {
            city: "Cuttack",
            distance: "90 km",
            route: "Via NH16",
            duration: "2-3 hours"
          }
        ],
        localTransport: "Auto-rickshaws, cycle-rickshaws, and local buses. Walking distance from most areas in Puri."
      }
    },
    media: {
      panorama_url: "",
      images: [],
      video_url: ""
    },
    view360: {
      summary: "External view of the temple complex and surrounding area",
      iframeUrl: "",
      full: "",
      heading: 0,
      pitch: 0
    },
    model3d: {
      summary: "Architectural model of the temple showing Kalinga style construction",
      url: "",
      full: "",
      sketchfabId: ""
    },
    visitor_info: {
      timings: "5:00 AM - 11:00 PM (with break timings for rituals)",
      entryFee: "Free entry (only for Hindus)",
      bestTimeToVisit: "October to March. Rath Yatra (June-July) for festival experience. Monsoon season has fewer crowds.",
      duration: "2-3 hours for darshan and temple complex exploration"
    }
  }
]

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

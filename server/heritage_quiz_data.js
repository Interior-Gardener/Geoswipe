// Heritage Sites Quiz Questions.
//
// This file is BOTH a data module and a standalone seed script:
//   - `require('./heritage_quiz_data')` exports { quizQuestions } only.
//   - `node heritage_quiz_data.js` inserts them into MongoDB.
//
// It previously ran insertQuizData() at import time against a hardcoded
// mongodb://localhost:27017, so it could not be imported by the server and it
// wrote to the wrong database. The connection now comes from MONGODB_URI.

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geoswipedb';
const DATABASE_NAME = process.env.MONGODB_DB || 'geoswipedb';
const COLLECTION_NAME = 'quiz_questions';

// Quiz Questions Data
const quizQuestions = [

  // ============================================================
  // TAJ MAHAL - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Taj Mahal",
    question: "In which city is the Taj Mahal located?",
    options: ["Agra", "Delhi", "Jaipur", "Lucknow"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Taj Mahal",
    question: "Who built the Taj Mahal?",
    options: ["Shah Jahan", "Akbar", "Aurangzeb", "Jahangir"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "The Taj Mahal was built in memory of which queen?",
    options: ["Mumtaz Mahal", "Nur Jahan", "Jodha Bai", "Anarkali"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What is the primary building material of the Taj Mahal?",
    options: ["White marble", "Red sandstone", "Granite", "Limestone"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "On which river bank is the Taj Mahal situated?",
    options: ["Yamuna", "Ganga", "Brahmaputra", "Narmada"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Taj Mahal",
    question: "The Taj Mahal is considered one of the Seven Wonders of which list?",
    options: ["Modern World", "Ancient World", "Medieval World", "Natural World"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Taj Mahal",
    question: "In which century was the Taj Mahal built?",
    options: ["17th century", "16th century", "18th century", "15th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What type of monument is the Taj Mahal?",
    options: ["Mausoleum", "Palace", "Fort", "Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "How many minarets does the Taj Mahal have?",
    options: ["4", "2", "6", "8"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "The Taj Mahal is a UNESCO World Heritage Site since which year?",
    options: ["1983", "1975", "1990", "2000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Taj Mahal",
    question: "What is the main dome shape of the Taj Mahal called?",
    options: ["Onion dome", "Saucer dome", "Umbrella dome", "Beehive dome"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "What color does the Taj Mahal appear at sunrise?",
    options: ["Pinkish", "Golden", "Blue", "Green"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Features"
  },
  {
    site: "Taj Mahal",
    question: "The gardens of the Taj Mahal represent what concept?",
    options: ["Paradise", "Earth", "Heaven", "Eternity"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Symbolism"
  },
  {
    site: "Taj Mahal",
    question: "What architectural style is the Taj Mahal primarily?",
    options: ["Mughal", "Gothic", "Byzantine", "Baroque"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "Approximately how many years did it take to build the Taj Mahal?",
    options: ["22 years", "10 years", "30 years", "15 years"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What is featured prominently on the main gateway of the Taj Mahal?",
    options: ["Calligraphy", "Paintings", "Sculptures", "Mosaics"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "The Taj Mahal complex includes which water feature?",
    options: ["Reflecting pool", "Fountain", "Waterfall", "Canal only"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "What precious and semi-precious stones were used for decoration?",
    options: ["All of these", "Jade", "Lapis lazuli", "Turquoise"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "The Taj Mahal is an example of what kind of symmetry?",
    options: ["Bilateral", "Radial", "Asymmetrical", "Spiral"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "What is the Taj Mahal often called?",
    options: ["Monument of Love", "Palace of Dreams", "Crown of India", "Jewel of Agra"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },

  // MEDIUM (21-40)
  {
    site: "Taj Mahal",
    question: "Who was the chief architect of the Taj Mahal?",
    options: ["Ustad Ahmad Lahauri", "Mir Abdul Karim", "Ismail Khan", "Qazim Khan"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What is the height of the main dome of the Taj Mahal?",
    options: ["73 meters", "60 meters", "85 meters", "50 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "What decorative technique involves inlaying precious stones into marble?",
    options: ["Pietra dura", "Fresco", "Mosaic", "Intarsia"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "In what year was the construction of the Taj Mahal completed?",
    options: ["1653", "1648", "1658", "1643"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "From where was the white marble for the Taj Mahal sourced?",
    options: ["Makrana, Rajasthan", "Jaipur", "Delhi", "Agra"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Construction"
  },
  {
    site: "Taj Mahal",
    question: "How many workers were approximately employed to build the Taj Mahal?",
    options: ["20,000", "10,000", "50,000", "5,000"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What is the total area of the Taj Mahal complex?",
    options: ["42 acres", "30 acres", "50 acres", "60 acres"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "The calligraphy on the Taj Mahal is primarily from which religious text?",
    options: ["Quran", "Hadith", "Vedas", "Bible"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "What architectural element makes the minarets tilt slightly outward?",
    options: ["Anti-seismic design", "Aesthetic choice", "Construction error", "Wind resistance"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "The garden layout of the Taj Mahal is based on which concept?",
    options: ["Charbagh (four gardens)", "Zen garden", "Persian garden", "English garden"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "When did Mumtaz Mahal die?",
    options: ["1631", "1628", "1635", "1640"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What is the main entrance gate to the Taj Mahal complex called?",
    options: ["Darwaza-i-Rauza", "Buland Darwaza", "India Gate", "Lal Darwaza"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "Which chamber in the Taj Mahal contains the actual tombs?",
    options: ["Lower chamber (basement)", "Main chamber", "Upper chamber", "Side chamber"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "How many types of precious and semi-precious stones were used in the Taj Mahal?",
    options: ["28", "20", "35", "15"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "What is the octagonal marble screen around the cenotaphs called?",
    options: ["Jali", "Pardah", "Jarokha", "Chhatri"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "Who was Mumtaz Mahal's full name?",
    options: ["Arjumand Banu Begum", "Mehr-un-Nissa", "Ladli Begum", "Roshanara Begum"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What happens to the Taj Mahal's color during different times of the day?",
    options: ["Changes from pink to white to golden", "Remains white", "Turns blue at night", "Becomes yellow"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Features"
  },
  {
    site: "Taj Mahal",
    question: "Which structure flanks the Taj Mahal on the west side?",
    options: ["Mosque", "Guest house", "Museum", "Palace"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "What material was used for the foundation of the Taj Mahal?",
    options: ["Timber and stone", "Concrete", "Steel", "Clay"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Construction"
  },
  {
    site: "Taj Mahal",
    question: "The Taj Mahal complex includes how many main structures?",
    options: ["5", "3", "7", "4"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },

  // HARD (41-60)
  {
    site: "Taj Mahal",
    question: "What was the estimated cost of building the Taj Mahal in that era?",
    options: ["32 million rupees", "20 million rupees", "50 million rupees", "15 million rupees"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "Which calligrapher inscribed the verses on the Taj Mahal?",
    options: ["Amanat Khan", "Ustad Ahmad", "Mir Abdul", "Ismail Effendi"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "What optical illusion technique was used in the Taj Mahal's calligraphy?",
    options: ["Letters increase in size as they ascend", "Letters decrease in size", "All letters same size", "Letters curve with dome"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "How was the marble transported to the construction site?",
    options: ["Using a fleet of 1,000 elephants", "By river boats", "Camel caravans", "Human labor only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Construction"
  },
  {
    site: "Taj Mahal",
    question: "What is unique about the tomb placement in the Taj Mahal?",
    options: ["Off-center, closer to the river", "Perfectly centered", "At the entrance", "In the garden"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "Which European traveler first brought detailed accounts of the Taj Mahal to the West?",
    options: ["Jean-Baptiste Tavernier", "Marco Polo", "Vasco da Gama", "Christopher Columbus"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What engineering technique was used to create the illusion of perfect symmetry?",
    options: ["Forced perspective geometry", "Mirror construction", "Equal proportions", "Mathematical ratios"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "According to legend, what did Shah Jahan plan to build across the river?",
    options: ["Black Taj Mahal", "Palace", "Fort", "Garden"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Legend"
  },
  {
    site: "Taj Mahal",
    question: "What is the scientific principle behind the Taj Mahal's acoustics in the main chamber?",
    options: ["Echo with 28-second delay", "No echo", "Multiple echoes", "Sound absorption"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "From how many different regions were craftsmen brought to build the Taj Mahal?",
    options: ["From across Asia and Europe", "Only from India", "Only from Persia", "From Middle East only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What was the original name proposed for the Taj Mahal?",
    options: ["Rauza-i-Munavvara (The Illumined Tomb)", "Taj Mahal", "Mumtaz Mahal", "Crown Palace"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "Which British Viceroy ordered the first major restoration of the Taj Mahal?",
    options: ["Lord Curzon", "Lord Mountbatten", "Lord Dalhousie", "Lord Wellesley"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What mathematical proportion governs the Taj Mahal's design?",
    options: ["Golden ratio and geometric progressions", "Fibonacci sequence", "Pythagorean theorem", "Perfect squares"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "During which war was the Taj Mahal covered with scaffolding to mislead bombers?",
    options: ["World War II", "World War I", "Indo-Pak War 1965", "Indo-Pak War 1971"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What causes the yellowing of the Taj Mahal's marble?",
    options: ["Air pollution and sulfur dioxide", "Age", "Rain", "Sunlight"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Taj Mahal",
    question: "How is the interior of the main dome decorated?",
    options: ["Sun motif with radiating patterns", "Floral patterns", "Geometric shapes", "Calligraphy"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Taj Mahal",
    question: "What special treatment is used to clean the Taj Mahal's marble?",
    options: ["Fuller's earth (multani mitti)", "Acid wash", "Water pressure", "Chemical cleaners"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Taj Mahal",
    question: "Which Mughal architectural tradition does the Taj Mahal perfect?",
    options: ["Tomb in a garden setting", "Fort architecture", "Palace design", "Mosque construction"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Taj Mahal",
    question: "What was Shah Jahan's condition when he died viewing the Taj Mahal?",
    options: ["Imprisoned by his son Aurangzeb", "Ruling emperor", "In exile", "On pilgrimage"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Taj Mahal",
    question: "What recent technology has been used to monitor the Taj Mahal's structural integrity?",
    options: ["Laser scanning and 3D modeling", "X-ray imaging", "Ultrasound", "Thermal imaging"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },

  // ============================================================
  // RED FORT - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Red Fort",
    question: "In which city is the Red Fort located?",
    options: ["Delhi", "Agra", "Jaipur", "Lahore"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Red Fort",
    question: "What is the Red Fort called in Hindi?",
    options: ["Lal Qila", "Lal Mahal", "Lal Durg", "Lal Garh"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Language"
  },
  {
    site: "Red Fort",
    question: "Which Mughal emperor built the Red Fort?",
    options: ["Shah Jahan", "Akbar", "Aurangzeb", "Humayun"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What is the main building material giving the fort its name?",
    options: ["Red sandstone", "Red granite", "Red marble", "Red brick"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Where is the Indian flag hoisted on Independence Day?",
    options: ["Red Fort", "India Gate", "Parliament House", "Rashtrapati Bhavan"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },
  {
    site: "Red Fort",
    question: "The Red Fort became a UNESCO World Heritage Site in which year?",
    options: ["2007", "2000", "1995", "2010"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Red Fort",
    question: "What was the Red Fort's primary purpose?",
    options: ["Royal residence", "Military fort", "Temple", "Market"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What famous hall is known for its 'Hall of Public Audience'?",
    options: ["Diwan-i-Aam", "Diwan-i-Khas", "Rang Mahal", "Mumtaz Mahal"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which famous diamond was once part of the Peacock Throne in the Red Fort?",
    options: ["Koh-i-Noor", "Hope Diamond", "Cullinan", "Blue Moon"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "In which century was the Red Fort built?",
    options: ["17th century", "16th century", "18th century", "15th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What shape are the walls of the Red Fort?",
    options: ["Octagonal", "Circular", "Square", "Rectangular"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which gate is the main entrance to the Red Fort?",
    options: ["Lahori Gate", "Delhi Gate", "Kashmir Gate", "Ajmeri Gate"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "What does the inscription on the Diwan-i-Khas say about the hall?",
    options: ["If there is paradise on earth, it is this", "The greatest hall ever built", "A gift from heaven", "The jewel of India"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "The Red Fort is adjacent to which famous market?",
    options: ["Chandni Chowk", "Sarojini Nagar", "Connaught Place", "Karol Bagh"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Red Fort",
    question: "What event occurs every evening at the Red Fort?",
    options: ["Light and Sound Show", "Dance performance", "Flag ceremony", "Musical concert"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },
  {
    site: "Red Fort",
    question: "How many gates does the Red Fort have?",
    options: ["2", "4", "6", "8"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "What architectural style is the Red Fort?",
    options: ["Mughal", "Rajput", "Gothic", "Persian"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which Prime Minister first hoisted the flag at Red Fort on Independence Day?",
    options: ["Jawaharlal Nehru", "Indira Gandhi", "Rajendra Prasad", "Sardar Patel"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What was the palace complex originally called?",
    options: ["Qila-e-Mubarak", "Lal Qila", "Shah Qila", "Delhi Qila"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What is the Diwan-i-Khas?",
    options: ["Hall of Private Audience", "Hall of Public Audience", "Royal bedroom", "Treasury"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },

  // MEDIUM (21-40)
  {
    site: "Red Fort",
    question: "When was the construction of the Red Fort completed?",
    options: ["1648", "1650", "1645", "1655"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "Who was the architect of the Red Fort?",
    options: ["Ustad Ahmad Lahauri", "Ustad Isa", "Mir Abdul Karim", "Shah Alam"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What is the total perimeter of the Red Fort walls?",
    options: ["2.41 kilometers", "3 kilometers", "1.5 kilometers", "4 kilometers"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which hall in the Red Fort was used for private audiences with the emperor?",
    options: ["Diwan-i-Khas", "Diwan-i-Aam", "Rang Mahal", "Khas Mahal"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What was housed in the Rang Mahal?",
    options: ["Royal ladies' quarters", "Treasury", "Army barracks", "Kitchen"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What canal once ran through the Red Fort complex?",
    options: ["Nahr-i-Bihisht (Stream of Paradise)", "Yamuna Canal", "Shah Canal", "Mughal Canal"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which British event took place at the Red Fort in 1857?",
    options: ["Trial of Last Mughal Emperor", "First Parliament", "Victory celebration", "Treaty signing"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What is the Moti Masjid in the Red Fort?",
    options: ["Pearl Mosque", "Golden Mosque", "Royal Mosque", "Great Mosque"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "How high are the walls of the Red Fort?",
    options: ["18-33 meters", "10-20 meters", "40-50 meters", "5-15 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which building housed the Peacock Throne?",
    options: ["Diwan-i-Khas", "Diwan-i-Aam", "Rang Mahal", "Khas Mahal"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "When did Shah Jahan shift his capital from Agra to Delhi?",
    options: ["1648", "1645", "1650", "1640"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What material adorned the ceilings of Diwan-i-Khas?",
    options: ["Silver and gold", "Marble", "Wood", "Copper"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which museum is housed within the Red Fort complex?",
    options: ["Archaeological Museum", "National Museum", "War Museum", "Art Museum"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Red Fort",
    question: "What was the original color of the fort before red sandstone?",
    options: ["It was always red sandstone", "White marble", "Yellow stone", "Grey granite"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "The Hayat Bakhsh Bagh in the Red Fort means what?",
    options: ["Life-Bestowing Garden", "Royal Garden", "Paradise Garden", "Emperor's Garden"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which invader looted the Peacock Throne from the Red Fort?",
    options: ["Nadir Shah", "Ahmad Shah Abdali", "Mahmud of Ghazni", "Timur"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What architectural feature connects the Red Fort to other Mughal monuments?",
    options: ["Char bagh layout", "Dome design", "Minaret style", "Gateway arch"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "When was the Red Fort captured by the British?",
    options: ["1857", "1858", "1850", "1860"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What does the Chhatta Chowk in Red Fort house today?",
    options: ["Shops and bazaar", "Museum", "Office", "Temple"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Red Fort",
    question: "Which emperor added the Moti Masjid to the Red Fort?",
    options: ["Aurangzeb", "Shah Jahan", "Jahangir", "Akbar"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },

  // HARD (41-60)
  {
    site: "Red Fort",
    question: "What was the estimated cost of building the Red Fort?",
    options: ["10 million rupees", "5 million rupees", "20 million rupees", "1 million rupees"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "The Red Fort's design was influenced by which earlier fort?",
    options: ["Agra Fort", "Lahore Fort", "Fatehpur Sikri", "Amber Fort"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "What percentage of the original Red Fort complex survives today?",
    options: ["About 20%", "About 50%", "About 80%", "About 90%"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Red Fort",
    question: "Which was the last Mughal emperor to inhabit the Red Fort?",
    options: ["Bahadur Shah Zafar", "Aurangzeb", "Muhammad Shah", "Shah Alam II"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What military purpose did the British use the Red Fort for?",
    options: ["Army barracks", "Armory", "Prison", "Hospital"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "When did the Indian Army hand over the Red Fort to the Archaeological Survey?",
    options: ["2003", "1995", "2000", "2010"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What unique water feature existed in the Rang Mahal?",
    options: ["Channel with lotus-shaped fountain", "Waterfall", "Swimming pool", "Fish pond"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which famous poet was associated with the court of Red Fort?",
    options: ["Mirza Ghalib", "Kabir", "Tulsidas", "Amir Khusro"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Red Fort",
    question: "What restoration work was undertaken in 2000s?",
    options: ["Cleaning and structural repairs", "Complete rebuild", "Color restoration", "Garden redesign"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Red Fort",
    question: "The Delhi Gate of Red Fort faces which direction?",
    options: ["South", "North", "East", "West"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "What was the significance of the Shah Burj in the Red Fort?",
    options: ["Emperor's private tower", "Watch tower", "Prayer tower", "Treasury tower"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "Which trial took place at the Red Fort in 1945-46?",
    options: ["INA trials", "Quit India Movement trials", "Revolutionary trials", "Freedom fighter trials"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What astronomical instrument was reportedly installed in the Red Fort?",
    options: ["Astrolabe", "Telescope", "Sundial", "Compass"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Science"
  },
  {
    site: "Red Fort",
    question: "The pietra dura work in the Red Fort was done by craftsmen from where?",
    options: ["Italy and Central Asia", "Persia", "China", "Turkey"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Red Fort",
    question: "What innovation in urban planning did Shah Jahan implement with Shahjahanabad?",
    options: ["Geometric street layout with fort as center", "Circular design", "Grid pattern", "Radial design"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Urban Planning"
  },
  {
    site: "Red Fort",
    question: "Which British structure was controversially built within the Red Fort?",
    options: ["Barracks", "Church", "Governor's residence", "Military hospital"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Red Fort",
    question: "What was the original water source for the Red Fort's canals?",
    options: ["Yamuna River", "Well system", "Rainwater harvesting", "Aqueduct"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Red Fort",
    question: "The Hammam (royal bath) in Red Fort had how many apartments?",
    options: ["3", "2", "5", "7"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Red Fort",
    question: "What adoption program was initiated for Red Fort's maintenance?",
    options: ["Adopt a Heritage scheme by Dalmia Bharat Group", "Government maintenance", "UNESCO funding", "Public donation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Red Fort",
    question: "What symbolic change occurred at Red Fort on August 15, 1947?",
    options: ["Union Jack lowered, Indian flag hoisted", "Fort renamed", "Gates opened to public", "Emperor's throne removed"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },

  // ============================================================
  // QUTUB MINAR - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Qutub Minar",
    question: "In which city is Qutub Minar located?",
    options: ["Delhi", "Agra", "Jaipur", "Lucknow"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Qutub Minar",
    question: "What type of structure is Qutub Minar?",
    options: ["Minaret", "Palace", "Fort", "Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "How many storeys does Qutub Minar have?",
    options: ["5", "3", "7", "10"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "Who started the construction of Qutub Minar?",
    options: ["Qutb-ud-din Aibak", "Iltutmish", "Alauddin Khilji", "Akbar"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What is the primary building material of Qutub Minar?",
    options: ["Red sandstone and marble", "White marble", "Granite", "Limestone"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "Qutub Minar is a UNESCO World Heritage Site since which year?",
    options: ["1993", "1985", "2000", "1975"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Qutub Minar",
    question: "What is the approximate height of Qutub Minar?",
    options: ["72.5 meters", "60 meters", "80 meters", "50 meters"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What is inscribed on the walls of Qutub Minar?",
    options: ["Verses from the Quran", "Hindu scriptures", "Historical accounts", "Poetry"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Qutub Minar",
    question: "What famous pillar stands in the Qutub complex?",
    options: ["Iron Pillar", "Ashoka Pillar", "Victory Pillar", "Stone Pillar"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Monuments"
  },
  {
    site: "Qutub Minar",
    question: "In which century was Qutub Minar built?",
    options: ["12th-13th century", "10th century", "15th century", "16th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What is the shape of Qutub Minar?",
    options: ["Tapering tower", "Cylindrical", "Square", "Pyramidal"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What is the Quwwat-ul-Islam Mosque?",
    options: ["Mosque at the base of Qutub Minar", "Tomb near Qutub", "Palace near Qutub", "Fort wall"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "Is Qutub Minar open for tourists to climb?",
    options: ["No, closed since 1981", "Yes", "Only partially", "Only with permission"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Qutub Minar",
    question: "What architectural style does Qutub Minar represent?",
    options: ["Indo-Islamic", "Mughal", "Rajput", "Gothic"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "Who completed the construction of Qutub Minar?",
    options: ["Iltutmish", "Qutb-ud-din Aibak", "Firoz Shah Tughlaq", "Alauddin Khilji"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What decorates the surface of Qutub Minar?",
    options: ["Intricate carvings and calligraphy", "Paintings", "Mosaics", "Sculptures"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Qutub Minar",
    question: "The Iron Pillar is famous for what quality?",
    options: ["Rust-resistant", "Magnetic", "Hollow", "Rotating"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Science"
  },
  {
    site: "Qutub Minar",
    question: "What does 'Qutub' mean?",
    options: ["Axis or Pole", "Victory", "Tower", "King"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Language"
  },
  {
    site: "Qutub Minar",
    question: "How many balconies does Qutub Minar have?",
    options: ["3", "5", "2", "4"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "The Qutub complex contains ruins of which ancient structure?",
    options: ["Hindu and Jain temples", "Buddhist monastery", "Ancient fort", "Palace"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },

  // MEDIUM (21-40)
  {
    site: "Qutub Minar",
    question: "When was the construction of Qutub Minar started?",
    options: ["1192 CE", "1200 CE", "1185 CE", "1210 CE"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What was the purpose of building Qutub Minar?",
    options: ["Victory tower and call to prayer", "Watch tower", "Astronomical observatory", "Monument to a saint"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What is the diameter of Qutub Minar at the base?",
    options: ["14.3 meters", "10 meters", "20 meters", "8 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What is the diameter at the top of Qutub Minar?",
    options: ["2.7 meters", "5 meters", "3.5 meters", "1.5 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "How many steps are there inside Qutub Minar?",
    options: ["379", "300", "450", "250"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "Who repaired Qutub Minar after it was damaged by lightning?",
    options: ["Firoz Shah Tughlaq", "Alauddin Khilji", "Sikandar Lodi", "Humayun"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What was added to Qutub Minar by Firoz Shah Tughlaq?",
    options: ["Two upper storeys", "Balconies", "Dome", "Gateway"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "The Iron Pillar dates back to which period?",
    options: ["Gupta period (4th century)", "Mauryan period", "Medieval period", "Mughal period"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What inscription is on the Iron Pillar?",
    options: ["Sanskrit inscription about Chandragupta II", "Persian inscription", "Arabic inscription", "Hindi inscription"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What is Alai Minar?",
    options: ["Unfinished tower near Qutub Minar", "Gateway", "Mosque", "Tomb"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "Who started building Alai Minar?",
    options: ["Alauddin Khilji", "Iltutmish", "Firoz Shah", "Qutb-ud-din"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What was the intended height of Alai Minar?",
    options: ["Twice the height of Qutub Minar", "Same as Qutub Minar", "Half of Qutub Minar", "100 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What major accident occurred at Qutub Minar in 1981?",
    options: ["Stampede killing 45 people", "Fire", "Collapse of a section", "Lightning strike"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What is the Alai Darwaza?",
    options: ["Gateway built by Alauddin Khilji", "Tomb", "Palace gate", "Mosque entrance"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "When was the Alai Darwaza built?",
    options: ["1311 CE", "1300 CE", "1320 CE", "1290 CE"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What architectural innovation is seen in Alai Darwaza?",
    options: ["First building in India with true arches", "First dome structure", "First minaret", "First use of marble"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What is Iltutmish's tomb known for?",
    options: ["Intricate marble screening", "Height", "Paintings", "Gold decorations"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What natural disaster damaged Qutub Minar in 1803?",
    options: ["Earthquake", "Flood", "Lightning", "Tornado"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "Who added a pillared cupola to Qutub Minar that was later removed?",
    options: ["Major Robert Smith", "Lord Curzon", "British Engineer", "Indian architect"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "Where is the Smith's Folly (cupola) now kept?",
    options: ["In the gardens of Qutub complex", "British Museum", "National Museum Delhi", "Destroyed"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },

  // HARD (41-60)
  {
    site: "Qutub Minar",
    question: "What percentage of pure iron is in the Iron Pillar?",
    options: ["98%", "85%", "95%", "90%"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Science"
  },
  {
    site: "Qutub Minar",
    question: "What scientific explanation is given for the Iron Pillar's rust resistance?",
    options: ["Passive protective film of crystalline iron oxide", "Special coating", "Climate conditions", "Regular maintenance"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Science"
  },
  {
    site: "Qutub Minar",
    question: "Qutub Minar is named after whom?",
    options: ["Qutb-ud-din Aibak or Sufi saint Qutbuddin Bakhtiar Kaki", "Only Qutb-ud-din Aibak", "Only the Sufi saint", "A Persian king"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What was the original material used in the upper storeys before Firoz Shah's repairs?",
    options: ["Red sandstone", "White marble", "Granite", "Yellow sandstone"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What material did Firoz Shah use to repair the upper storeys?",
    options: ["White marble and red sandstone", "Only marble", "Only sandstone", "Granite"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What earlier structure's materials were used to build Quwwat-ul-Islam Mosque?",
    options: ["27 Hindu and Jain temples", "20 temples", "10 temples", "50 temples"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What is unique about the calligraphy on Qutub Minar?",
    options: ["It increases in size proportionally upward", "All same size", "Decreases upward", "Only at base"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Qutub Minar",
    question: "What weight can the Iron Pillar support?",
    options: ["Over 6 tons", "3 tons", "10 tons", "1 ton"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Qutub Minar",
    question: "When was public access to climb Qutub Minar permanently stopped?",
    options: ["December 4, 1981", "1980", "1985", "1990"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What architectural elements show the transition in the Qutub complex?",
    options: ["Hindu architectural elements in Islamic structure", "Pure Islamic style", "Pure Hindu style", "European influence"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What was the significance of Alai Darwaza in Indian architecture?",
    options: ["First structure to use colored marble decoration", "First dome", "Tallest gateway", "First minaret"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What technique was used for the inscriptions on Qutub Minar?",
    options: ["Naksh (inscribing) in Tughra style", "Painting", "Inlay work", "Mosaic"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Qutub Minar",
    question: "How many separate construction phases did Qutub Minar undergo?",
    options: ["3-4 major phases", "2 phases", "5 phases", "1 continuous phase"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What is the current height of Alai Minar?",
    options: ["24.5 meters", "30 meters", "15 meters", "40 meters"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What conservation challenge does Qutub Minar face?",
    options: ["Tilting and weathering of sandstone", "Vandalism", "Flooding", "Fire hazard"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Qutub Minar",
    question: "What is the tilt angle of Qutub Minar?",
    options: ["25 inches from vertical", "No tilt", "10 inches", "40 inches"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "Which Delhi Sultanate dynasty began with Qutb-ud-din Aibak?",
    options: ["Slave Dynasty (Mamluk)", "Tughlaq", "Khilji", "Lodi"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Qutub Minar",
    question: "What modern technology has been used to monitor Qutub Minar?",
    options: ["Laser scanning and structural monitoring", "Drones only", "Satellites", "X-rays"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Qutub Minar",
    question: "What is the architectural significance of the corbelled brackets in Quwwat-ul-Islam Mosque?",
    options: ["Show transition from trabeate to arcuate style", "Purely decorative", "Structural support", "Religious symbolism"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Qutub Minar",
    question: "What inscription controversy exists regarding the Quwwat-ul-Islam Mosque?",
    options: ["Inscription mentions destruction of temples", "No controversy", "Dating uncertainty", "Author dispute"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },

  // ============================================================
  // GOLDEN TEMPLE - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Golden Temple",
    question: "In which city is the Golden Temple located?",
    options: ["Amritsar", "Delhi", "Chandigarh", "Ludhiana"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Golden Temple",
    question: "What is the Golden Temple also known as?",
    options: ["Harmandir Sahib", "Gurudwara Sahib", "Akal Takht", "Darbar Sahib only"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Name"
  },
  {
    site: "Golden Temple",
    question: "The Golden Temple is the holiest shrine of which religion?",
    options: ["Sikhism", "Hinduism", "Buddhism", "Jainism"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Golden Temple",
    question: "What material covers the upper floors of the Golden Temple?",
    options: ["Gold", "Copper", "Silver", "Bronze"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "The Golden Temple is surrounded by what?",
    options: ["Sarovar (holy water tank)", "Gardens", "Walls", "Mountains"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "Who founded the Golden Temple?",
    options: ["Guru Arjan Dev", "Guru Nanak Dev", "Guru Gobind Singh", "Guru Ram Das"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "How many doors does the Golden Temple have?",
    options: ["4", "1", "2", "6"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "What does the four-door design symbolize?",
    options: ["Openness to all people", "Four directions", "Four seasons", "Four elements"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Symbolism"
  },
  {
    site: "Golden Temple",
    question: "What is served free to all visitors at the Golden Temple?",
    options: ["Langar (community meal)", "Tea only", "Prasad only", "Nothing"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },
  {
    site: "Golden Temple",
    question: "The causeway leading to the Golden Temple is called what?",
    options: ["Darshani Deori", "Akal Takht", "Harmandir Path", "Guru Path"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "In which state is the Golden Temple located?",
    options: ["Punjab", "Haryana", "Himachal Pradesh", "Rajasthan"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Golden Temple",
    question: "What scripture is kept inside the Golden Temple?",
    options: ["Guru Granth Sahib", "Vedas", "Quran", "Bible"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Golden Temple",
    question: "Is entry to the Golden Temple free for everyone?",
    options: ["Yes", "No", "Only for Sikhs", "Requires fee"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Golden Temple",
    question: "What must visitors do before entering the Golden Temple?",
    options: ["Cover head and remove shoes", "Only remove shoes", "Only cover head", "Wear white clothes"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },
  {
    site: "Golden Temple",
    question: "The Golden Temple is built at a level that is what?",
    options: ["Lower than the surrounding area", "Higher than surrounding area", "At same level", "On a hill"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "What does the lower level symbolize?",
    options: ["Humility", "Strength", "Wealth", "Power"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Symbolism"
  },
  {
    site: "Golden Temple",
    question: "Approximately how many people visit the Golden Temple daily?",
    options: ["100,000", "50,000", "200,000", "10,000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Golden Temple",
    question: "What is Akal Takht?",
    options: ["Seat of Sikh authority near Golden Temple", "Another name for Golden Temple", "A festival", "A prayer"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Golden Temple",
    question: "The Golden Temple complex includes accommodation for what?",
    options: ["Pilgrims (free lodging)", "Monks only", "No accommodation", "Paid hotels"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },
  {
    site: "Golden Temple",
    question: "The Golden Temple is open to visitors when?",
    options: ["24 hours a day", "Only during day", "Only morning", "Only evening"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },

  // MEDIUM (21-40)
  {
    site: "Golden Temple",
    question: "When was the Golden Temple's foundation stone laid?",
    options: ["1581", "1600", "1550", "1620"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "Who laid the foundation stone of the Golden Temple?",
    options: ["Hazrat Mian Mir (Sufi saint)", "Guru Arjan Dev", "Guru Ram Das", "Guru Nanak Dev"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "When was the construction of the Golden Temple completed?",
    options: ["1604", "1610", "1595", "1620"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "Who donated the gold for covering the temple?",
    options: ["Maharaja Ranjit Singh", "British government", "Guru Arjan Dev", "Community donations"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "In which year was the gold plating done?",
    options: ["Early 19th century", "16th century", "20th century", "18th century"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "How much gold was used approximately?",
    options: ["400 kg", "200 kg", "600 kg", "100 kg"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "What is the name of the holy water tank?",
    options: ["Amrit Sarovar", "Holy Sarovar", "Guru Sarovar", "Sikh Sarovar"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "What does 'Amritsar' mean?",
    options: ["Pool of Nectar", "Golden City", "Holy Place", "City of Gold"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Language"
  },
  {
    site: "Golden Temple",
    question: "What architectural styles influenced the Golden Temple?",
    options: ["Hindu and Islamic", "Only Hindu", "Only Islamic", "European"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "How many people can the langar feed daily?",
    options: ["100,000+", "50,000", "200,000", "25,000"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Golden Temple",
    question: "What tragic event occurred at the Golden Temple in 1984?",
    options: ["Operation Blue Star", "Earthquake", "Fire", "Flood"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "The Guru Granth Sahib is ceremonially brought to the temple when?",
    options: ["Every morning and taken back at night", "Kept permanently", "Only on festivals", "Weekly"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Golden Temple",
    question: "Where is the Guru Granth Sahib kept at night?",
    options: ["Akal Takht", "Inside main shrine", "Museum", "Special room"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Golden Temple",
    question: "What is unique about the dome of the Golden Temple?",
    options: ["Inverted lotus design", "Square shape", "Multiple domes", "No dome"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "The marble walkway around the Sarovar is called what?",
    options: ["Parikarma", "Parikrama", "Pradakshina", "Pathway"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "Who initiated the city of Amritsar?",
    options: ["Guru Ram Das", "Guru Arjan Dev", "Guru Nanak Dev", "Guru Gobind Singh"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "What is the Central Sikh Museum in the complex?",
    options: ["Museum of Sikh history and martyrs", "Art gallery", "Library only", "Archive"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Golden Temple",
    question: "How is the Sarovar water maintained?",
    options: ["Continuous filtration system", "Replaced weekly", "Natural springs", "Rainwater only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Engineering"
  },
  {
    site: "Golden Temple",
    question: "What happens during Vaisakhi at the Golden Temple?",
    options: ["Major Sikh festival celebration", "Renovation work", "Closed to public", "Special langar only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Golden Temple",
    question: "The causeway to the temple is approximately how long?",
    options: ["60 feet", "100 feet", "30 feet", "150 feet"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },

  // HARD (41-60)
  {
    site: "Golden Temple",
    question: "What was the original name of the tank before becoming Amrit Sarovar?",
    options: ["Santokhsar", "Ramsar", "Bibeksar", "No previous name"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "Who compiled the Adi Granth first installed in the Golden Temple?",
    options: ["Guru Arjan Dev", "Guru Nanak Dev", "Guru Ram Das", "Guru Gobind Singh"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "In which year was the Adi Granth first installed?",
    options: ["1604", "1600", "1610", "1595"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "Who was the first Granthi (reader) of the Golden Temple?",
    options: ["Baba Buddha Ji", "Guru Arjan Dev", "Bhai Gurdas", "Bhai Mani Singh"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "How many times has the Golden Temple been destroyed and rebuilt?",
    options: ["Several times during 18th century", "Once", "Never", "Twice"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "Who carried out major reconstruction in 18th century?",
    options: ["Sikh Misls (confederacies)", "Mughals", "British", "Maharaja Ranjit Singh alone"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "What is the architectural dimension of the temple's sanctum?",
    options: ["40.5 feet square", "50 feet square", "30 feet square", "60 feet square"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "What is the significance of the bridge name 'Guru's Bridge'?",
    options: ["Only path to meet the Guru (Granth Sahib)", "Built by a Guru", "Guru crossed it", "Guru designed it"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Symbolism"
  },
  {
    site: "Golden Temple",
    question: "What type of marble is used in the temple?",
    options: ["White marble and inlay work", "Black marble", "Pink marble", "Green marble"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "The gold gilding technique used is called what?",
    options: ["Gild copper sheets over structure", "Pure gold plating", "Gold paint", "Gold leaf"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Golden Temple",
    question: "What was Ahmad Shah Abdali's attack on the Golden Temple?",
    options: ["Desecrated in 1757 and 1762", "Never attacked it", "Only once in 1761", "Attacked in 1800s"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "What is the Darshani Deori?",
    options: ["Arched entrance to the causeway", "Main gate", "Side entrance", "Back entrance"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "How deep is the Amrit Sarovar?",
    options: ["5.1 meters", "3 meters", "10 meters", "7 meters"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Golden Temple",
    question: "What is the area of the Sarovar?",
    options: ["5.1 acres", "3 acres", "7 acres", "10 acres"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Golden Temple",
    question: "The Akal Takht was built by which Guru?",
    options: ["Guru Hargobind", "Guru Arjan Dev", "Guru Nanak Dev", "Guru Gobind Singh"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Golden Temple",
    question: "What does the Akal Takht represent?",
    options: ["Temporal authority in Sikhism", "Spiritual authority only", "Educational institution", "Museum"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Religion"
  },
  {
    site: "Golden Temple",
    question: "How many volunteers typically work in the langar?",
    options: ["Thousands of volunteers daily", "Paid staff only", "100 volunteers", "50 volunteers"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Golden Temple",
    question: "What is the 'Ramgarhia Bunga'?",
    options: ["Defensive fortress tower in complex", "Guest house", "Museum", "Library"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Golden Temple",
    question: "When was the golden plating last renovated?",
    options: ["2000s", "1990s", "1980s", "Never renovated"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Golden Temple",
    question: "What conservation challenge does the Golden Temple face?",
    options: ["Air pollution affecting gold", "Structural damage", "Water shortage", "Overcrowding only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },

  // ============================================================
  // AJANTA CAVES - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Ajanta Caves",
    question: "In which state are the Ajanta Caves located?",
    options: ["Maharashtra", "Madhya Pradesh", "Gujarat", "Karnataka"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Ajanta Caves",
    question: "Ajanta Caves are primarily associated with which religion?",
    options: ["Buddhism", "Hinduism", "Jainism", "Sikhism"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Ajanta Caves",
    question: "What are the Ajanta Caves famous for?",
    options: ["Ancient rock-cut cave paintings", "Gold treasures", "Waterfalls", "Modern sculptures"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Features"
  },
  {
    site: "Ajanta Caves",
    question: "How many caves are there at Ajanta?",
    options: ["30", "20", "40", "50"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "When did Ajanta Caves become a UNESCO World Heritage Site?",
    options: ["1983", "1990", "1975", "2000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Ajanta Caves",
    question: "The paintings at Ajanta primarily depict what?",
    options: ["Life of Buddha and Jataka tales", "Hindu gods", "War scenes", "Royal courts"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "In which century were the Ajanta Caves rediscovered?",
    options: ["19th century", "20th century", "18th century", "17th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "Who rediscovered the Ajanta Caves?",
    options: ["John Smith (British officer)", "Alexander Cunningham", "James Fergusson", "William Jones"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "The Ajanta Caves are carved into which geological formation?",
    options: ["Basalt rock cliff", "Limestone", "Sandstone", "Granite"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geology"
  },
  {
    site: "Ajanta Caves",
    question: "What are the two main types of caves at Ajanta?",
    options: ["Chaityas (halls) and Viharas (monasteries)", "Temples and palaces", "Homes and shops", "Storage and worship"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "The Ajanta Caves date back to approximately which period?",
    options: ["2nd century BCE to 6th century CE", "10th century CE", "1st millennium BCE", "Medieval period"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "What makes Ajanta paintings unique?",
    options: ["Ancient Indian art techniques", "European influence", "Modern materials", "Oil paintings"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "The Ajanta Caves overlook which river?",
    options: ["Waghora River", "Godavari River", "Krishna River", "Narmada River"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Ajanta Caves",
    question: "What is a Chaitya?",
    options: ["Prayer hall with stupa", "Monk's cell", "Dining hall", "Library"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "What is a Vihara?",
    options: ["Monastery with cells for monks", "Prayer hall", "King's chamber", "Storage room"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "The nearest city to Ajanta Caves is?",
    options: ["Aurangabad", "Mumbai", "Pune", "Nashik"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Ajanta Caves",
    question: "What was the primary purpose of these caves?",
    options: ["Buddhist monastery and worship", "Royal residence", "Military fort", "Trade center"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "The paintings use which technique?",
    options: ["Fresco", "Oil painting", "Watercolor", "Acrylic"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "Are all 30 caves complete?",
    options: ["No, some are unfinished", "Yes, all complete", "Only 10 complete", "Only 20 complete"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "What is depicted most commonly in Ajanta paintings?",
    options: ["Buddha's life and previous births", "Wars", "Royal ceremonies", "Daily life only"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },

  // MEDIUM (21-40)
  {
    site: "Ajanta Caves",
    question: "In which year were the Ajanta Caves accidentally rediscovered?",
    options: ["1819", "1825", "1810", "1830"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "What was John Smith doing when he discovered the caves?",
    options: ["Tiger hunting", "Archaeological survey", "Military patrol", "Trading expedition"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "Which cave is considered the finest at Ajanta?",
    options: ["Cave 1", "Cave 10", "Cave 26", "Cave 2"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "Cave 1 features which famous painting?",
    options: ["Padmapani and Vajrapani Bodhisattvas", "Buddha's birth", "Mahaparinirvana", "First sermon"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "Which dynasty patronized the first phase of Ajanta?",
    options: ["Satavahana Dynasty", "Gupta Dynasty", "Mauryan Dynasty", "Mughal Dynasty"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "Which dynasty patronized the second phase?",
    options: ["Vakataka Dynasty", "Satavahana", "Gupta", "Chalukya"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "What is the oldest cave at Ajanta?",
    options: ["Cave 10", "Cave 1", "Cave 26", "Cave 16"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "Cave 10 is what type of cave?",
    options: ["Chaitya (prayer hall)", "Vihara (monastery)", "Storage", "Residential"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "What is the approximate length of Cave 26?",
    options: ["26 meters", "20 meters", "30 meters", "15 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "Cave 26 features which famous sculpture?",
    options: ["Reclining Buddha (Mahaparinirvana)", "Standing Buddha", "Seated Buddha", "Walking Buddha"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "What natural pigments were used in the paintings?",
    options: ["Minerals and plants", "Synthetic colors", "Oil-based paints", "Chemical dyes"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "How were the caves illuminated for painting?",
    options: ["Reflected sunlight using metal mirrors", "Torches", "Oil lamps", "Natural light only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Technology"
  },
  {
    site: "Ajanta Caves",
    question: "What is the subject of Cave 17's paintings?",
    options: ["Jataka tales and Buddha's life", "Hindu epics", "Royal portraits", "War scenes"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "Which cave has the most elaborate facade?",
    options: ["Cave 19", "Cave 1", "Cave 10", "Cave 26"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "What architectural feature is prominent in Cave 19?",
    options: ["Ornate horseshoe-shaped entrance", "Square entrance", "Triangular entrance", "Circular entrance"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "Why were the caves abandoned?",
    options: ["Decline of Buddhism in the region", "Natural disaster", "War", "Lack of funding"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "For how long were the caves forgotten?",
    options: ["About 1,300 years", "500 years", "2,000 years", "100 years"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "What protected the paintings for centuries?",
    options: ["Isolation and jungle growth", "Protective coating", "Regular maintenance", "Dry climate"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },
  {
    site: "Ajanta Caves",
    question: "Which school of Buddhism is represented at Ajanta?",
    options: ["Mahayana", "Theravada", "Vajrayana", "Zen"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Ajanta Caves",
    question: "What is unique about the horseshoe-shaped windows?",
    options: ["Allow light to fall on stupa", "Decoration only", "Ventilation", "Sound amplification"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },

  // HARD (41-60)
  {
    site: "Ajanta Caves",
    question: "What is the fresco-secco technique used at Ajanta?",
    options: ["Painting on dried plaster", "Painting on wet plaster", "Oil on canvas", "Watercolor on paper"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "How many layers were applied before painting?",
    options: ["Two layers of plaster", "One layer", "Three layers", "No plaster"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Ajanta Caves",
    question: "What was the first layer made of?",
    options: ["Mud mixed with rock grit and plant fiber", "Pure mud", "Sand", "Lime"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Ajanta Caves",
    question: "What was the final layer made of?",
    options: ["Fine lime plaster", "Mud", "Gypsum", "Clay"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Ajanta Caves",
    question: "What binding agent was possibly used in the paints?",
    options: ["Animal glue or plant gum", "Oil", "Wax", "Egg yolk"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "Which mineral provided the blue color?",
    options: ["Lapis lazuli", "Azurite", "Cobalt", "Indigo"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "Which mineral provided the red color?",
    options: ["Red ochre (iron oxide)", "Vermillion", "Lead oxide", "Copper oxide"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "What major conservation challenge do the paintings face?",
    options: ["Humidity and tourist breath causing deterioration", "Sunlight damage", "Vandalism", "Earthquakes"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Ajanta Caves",
    question: "When did UNESCO-ASI conservation project begin?",
    options: ["1999", "1990", "2005", "1983"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Ajanta Caves",
    question: "What technology is used to monitor cave conditions?",
    options: ["Humidity and temperature sensors", "Cameras only", "Manual inspection", "Drones"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Ajanta Caves",
    question: "Which Japanese team studied Ajanta extensively?",
    options: ["Tokyo National Research Institute", "Kyoto University", "Tokyo University", "Osaka Institute"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Research"
  },
  {
    site: "Ajanta Caves",
    question: "What is the Naga king panel in Cave 19?",
    options: ["Carving of serpent deity protecting Buddha", "Painting of king", "Inscription", "Stupa"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "Which Jataka tale is most commonly depicted?",
    options: ["Saddanta Jataka (six-tusked elephant)", "Vessantara Jataka", "Shyama Jataka", "Sibi Jataka"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ajanta Caves",
    question: "What evidence suggests the time period of construction?",
    options: ["Inscriptions and stylistic analysis", "Carbon dating only", "Historical records only", "Coins found"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Archaeology"
  },
  {
    site: "Ajanta Caves",
    question: "Who was Harisena in relation to Ajanta?",
    options: ["Vakataka emperor who patronized Ajanta", "Chief architect", "Head monk", "Painter"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Ajanta Caves",
    question: "What is the significance of Cave 1's pillars?",
    options: ["Ornately carved with various motifs", "Plain design", "Gold plated", "Imported marble"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Ajanta Caves",
    question: "How was the rock excavated?",
    options: ["Hammer and chisel from top-down", "Explosives", "Drilling machines", "Natural erosion"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Ajanta Caves",
    question: "What is the estimated volume of rock removed?",
    options: ["Thousands of cubic meters", "Hundreds of cubic meters", "Millions of cubic meters", "Unknown"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Ajanta Caves",
    question: "Which European artist was inspired by Ajanta?",
    options: ["Many artists including copies by Lady Herringham", "Picasso", "Van Gogh", "Monet"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural Impact"
  },
  {
    site: "Ajanta Caves",
    question: "What modern restriction helps preserve the caves?",
    options: ["Limited daily visitors and photography restrictions", "Complete closure", "No restrictions", "Entry fee only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },

  // ============================================================
  // ELLORA CAVES - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Ellora Caves",
    question: "In which state are the Ellora Caves located?",
    options: ["Maharashtra", "Madhya Pradesh", "Karnataka", "Gujarat"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Ellora Caves",
    question: "How many caves are there at Ellora?",
    options: ["34", "30", "40", "25"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "Ellora Caves represent which three religions?",
    options: ["Buddhism, Hinduism, and Jainism", "Buddhism and Hinduism only", "Hinduism and Jainism only", "Buddhism, Hinduism, and Sikhism"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "Which is the most famous cave at Ellora?",
    options: ["Kailasa Temple (Cave 16)", "Cave 1", "Cave 34", "Cave 10"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "When did Ellora become a UNESCO World Heritage Site?",
    options: ["1983", "1990", "1975", "2000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Ellora Caves",
    question: "The Kailasa Temple is dedicated to which deity?",
    options: ["Lord Shiva", "Lord Vishnu", "Lord Buddha", "Lord Brahma"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "What is unique about the Kailasa Temple?",
    options: ["Carved from a single rock", "Tallest temple", "Oldest temple", "Painted temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "Caves 1-12 at Ellora belong to which religion?",
    options: ["Buddhism", "Hinduism", "Jainism", "Mixed"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "Caves 13-29 belong to which religion?",
    options: ["Hinduism", "Buddhism", "Jainism", "Mixed"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "Caves 30-34 belong to which religion?",
    options: ["Jainism", "Buddhism", "Hinduism", "Mixed"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "The Ellora Caves were built during which period?",
    options: ["6th to 10th century CE", "2nd to 6th century CE", "10th to 15th century CE", "Ancient period"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "The nearest city to Ellora Caves is?",
    options: ["Aurangabad", "Mumbai", "Pune", "Nashik"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Ellora Caves",
    question: "What material are the caves carved from?",
    options: ["Basalt rock", "Sandstone", "Marble", "Granite"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geology"
  },
  {
    site: "Ellora Caves",
    question: "The Kailasa Temple represents which mountain?",
    options: ["Mount Kailash", "Mount Meru", "Himalayas", "Vindhyas"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Symbolism"
  },
  {
    site: "Ellora Caves",
    question: "Are the Ellora Caves older or younger than Ajanta?",
    options: ["Younger", "Older", "Same age", "Partially older, partially younger"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "What is Cave 10 at Ellora known as?",
    options: ["Vishvakarma Cave (Carpenter's Cave)", "Kailasa Temple", "Indra Sabha", "Rameshvara"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What feature is prominent in Cave 10?",
    options: ["Chaitya hall with stupa", "Shiva linga", "Jain Tirthankaras", "Royal palace"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What is Indra Sabha?",
    options: ["Jain cave temple", "Hindu cave", "Buddhist cave", "Palace"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "The Ellora Caves showcase which type of architecture?",
    options: ["Rock-cut architecture", "Free-standing structures", "Wooden architecture", "Metal work"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What makes Ellora unique compared to Ajanta?",
    options: ["Multi-religious complex", "Only paintings", "Only Buddhist", "Modern construction"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Features"
  },

  // MEDIUM (21-40)
  {
    site: "Ellora Caves",
    question: "Which dynasty built the Kailasa Temple?",
    options: ["Rashtrakuta Dynasty", "Chalukya Dynasty", "Pallava Dynasty", "Gupta Dynasty"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "Which king commissioned the Kailasa Temple?",
    options: ["Krishna I", "Dantidurga", "Govinda III", "Amoghavarsha"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "How much rock was excavated to create Kailasa Temple?",
    options: ["200,000 tons", "100,000 tons", "300,000 tons", "50,000 tons"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Engineering"
  },
  {
    site: "Ellora Caves",
    question: "What is the estimated time to build Kailasa Temple?",
    options: ["100-150 years", "50 years", "200 years", "20 years"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "What is the height of the Kailasa Temple?",
    options: ["33 meters", "20 meters", "50 meters", "15 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What stands at the entrance of Kailasa Temple?",
    options: ["Elephants", "Lions", "Bulls", "Horses"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What epic scene is carved on Kailasa Temple?",
    options: ["Ravana shaking Mount Kailash", "Ramayana battle", "Krishna's dance", "Shiva's marriage"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ellora Caves",
    question: "What is the courtyard area of Kailasa Temple?",
    options: ["Twice the size of Parthenon", "Same as Taj Mahal", "Smaller than most temples", "Unknown"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "Which Buddhist cave is largest at Ellora?",
    options: ["Cave 5", "Cave 1", "Cave 10", "Cave 12"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What is Cave 5 used for?",
    options: ["Dining hall for monks", "Prayer hall", "Living quarters", "Storage"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "What is Cave 12 known as?",
    options: ["Teen Thal (Three Stories)", "Do Thal", "Ek Thal", "Char Thal"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "How many floors does Cave 12 have?",
    options: ["3", "2", "4", "5"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What technique was used to carve Ellora?",
    options: ["Top-down vertical excavation", "Bottom-up", "Horizontal", "Random"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Engineering"
  },
  {
    site: "Ellora Caves",
    question: "Which cave has the most elaborate Jain carvings?",
    options: ["Indra Sabha (Cave 32)", "Cave 30", "Cave 34", "Cave 31"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ellora Caves",
    question: "What is depicted in the Jain caves?",
    options: ["Tirthankaras and Jain cosmology", "Hindu gods", "Buddha's life", "Royal scenes"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "Cave 29 is dedicated to which god?",
    options: ["Lord Shiva", "Lord Vishnu", "Lord Brahma", "Lord Indra"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "What is Cave 29 known as?",
    options: ["Dhumar Lena", "Rameshvara", "Dashavatara", "Kailasa"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "Cave 15 is known as?",
    options: ["Dashavatara Cave (Ten Avatars)", "Kailasa Cave", "Vishnu Cave", "Shiva Cave"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Ellora Caves",
    question: "What was found in 2015 near Ellora?",
    options: ["Hidden caves", "Ancient coins", "Inscriptions", "Fossils"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Discovery"
  },
  {
    site: "Ellora Caves",
    question: "Why are there no paintings at Ellora like at Ajanta?",
    options: ["Focus on sculpture", "Lost over time", "Never had paintings", "Destroyed"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },

  // HARD (41-60)
  {
    site: "Ellora Caves",
    question: "What architectural principle was used for load distribution in Kailasa?",
    options: ["Monolithic structure with internal pillars", "External supports", "Steel framework", "Wooden beams"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Ellora Caves",
    question: "What is the floor area of Kailasa Temple?",
    options: ["276,000 square feet", "100,000 square feet", "500,000 square feet", "50,000 square feet"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What legend is associated with Kailasa's construction?",
    options: ["Built in one night by divine intervention", "Built in one year", "Built by one person", "Never completed"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Legend"
  },
  {
    site: "Ellora Caves",
    question: "How many pillars support the Kailasa mandapa?",
    options: ["16", "10", "20", "25"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "What is the nrityamandapa in Kailasa?",
    options: ["Dance hall", "Prayer hall", "Dining area", "Storage"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "Who attempted to destroy Kailasa Temple?",
    options: ["Aurangzeb", "Mahmud of Ghazni", "Timur", "Nadir Shah"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "How long did Aurangzeb's workers work to destroy it?",
    options: ["3 years with minimal damage", "1 year completely destroyed", "Never attempted", "6 months"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "What inscription mentions Kailasa construction?",
    options: ["No contemporary inscription exists", "Kadamba inscription", "Rashtrakuta inscription", "Chalukya inscription"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Ellora Caves",
    question: "What engineering marvel is the bridge in Cave 32?",
    options: ["Single stone slab", "Multiple stones", "Wooden bridge", "Metal bridge"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Ellora Caves",
    question: "What is unique about the Indra Sabha's pillars?",
    options: ["Lotus motif capitals", "Plain design", "Animal carvings", "Geometric patterns"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ellora Caves",
    question: "What conservation technique is used at Ellora?",
    options: ["Chemical treatment for rock stability", "Painting over carvings", "Complete reconstruction", "No conservation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Ellora Caves",
    question: "What causes the main weathering at Ellora?",
    options: ["Water seepage and bio-deterioration", "Tourism only", "Vandalism", "Natural aging"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Ellora Caves",
    question: "Which international team studied Ellora?",
    options: ["ASI with UNESCO", "British Museum", "Japanese team", "American archaeologists"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Research"
  },
  {
    site: "Ellora Caves",
    question: "What tool technology was used for carving?",
    options: ["Iron chisels and hammers", "Bronze tools", "Stone tools", "Modern equipment"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Ellora Caves",
    question: "What is the ratio of Kailasa temple's proportions?",
    options: ["Based on Vastu Shastra principles", "Random design", "Greek golden ratio", "Fibonacci sequence"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "How many human figures are estimated in Kailasa?",
    options: ["Thousands", "Hundreds", "Dozens", "Unknown"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Ellora Caves",
    question: "What drainage system exists in Kailasa?",
    options: ["Elaborate channels for rainwater", "No drainage", "Simple gutters", "Modern drainage"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Ellora Caves",
    question: "What is the significance of the five rathas in Kailasa?",
    options: ["Subsidiary shrines around main temple", "Storage areas", "Monk cells", "Decoration"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Ellora Caves",
    question: "When was the last active worship at Ellora?",
    options: ["Still active at some temples", "Stopped centuries ago", "Never used for worship", "Stopped in 1900s"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Religion"
  },
  {
    site: "Ellora Caves",
    question: "What 3D technology has been used to document Ellora?",
    options: ["Laser scanning and photogrammetry", "Only photography", "Only drawings", "No modern documentation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },

  // ============================================================
  // HAMPI - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Hampi",
    question: "In which state is Hampi located?",
    options: ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Maharashtra"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Hampi",
    question: "Hampi was the capital of which empire?",
    options: ["Vijayanagara Empire", "Mughal Empire", "Maratha Empire", "Chalukya Empire"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Hampi",
    question: "When did Hampi become a UNESCO World Heritage Site?",
    options: ["1986", "1990", "1980", "2000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Hampi",
    question: "Hampi is famous for its what?",
    options: ["Ruined temples and monuments", "Beaches", "Mountains", "Waterfalls"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Features"
  },
  {
    site: "Hampi",
    question: "Which river flows through Hampi?",
    options: ["Tungabhadra", "Krishna", "Godavari", "Kaveri"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Hampi",
    question: "What is the most iconic structure at Hampi?",
    options: ["Vijaya Vittala Temple", "Lotus Mahal", "Elephant Stables", "Hampi Bazaar"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "The Stone Chariot is located in which temple?",
    options: ["Vittala Temple", "Virupaksha Temple", "Hazara Rama Temple", "Krishna Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "When was Hampi destroyed?",
    options: ["1565", "1600", "1550", "1580"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Hampi",
    question: "Who destroyed Hampi?",
    options: ["Deccan Sultanates", "Mughals", "British", "Portuguese"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What type of landscape is Hampi famous for?",
    options: ["Boulder-strewn landscape", "Desert", "Forests", "Plains"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Hampi",
    question: "Which temple is still active for worship at Hampi?",
    options: ["Virupaksha Temple", "Vittala Temple", "Krishna Temple", "All temples"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Hampi",
    question: "Virupaksha Temple is dedicated to which god?",
    options: ["Lord Shiva", "Lord Vishnu", "Lord Brahma", "Lord Krishna"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Hampi",
    question: "What is unique about the musical pillars at Vittala Temple?",
    options: ["They produce musical notes when struck", "They are painted", "They are made of gold", "They rotate"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Features"
  },
  {
    site: "Hampi",
    question: "What is the Lotus Mahal?",
    options: ["Palace in the Zenana Enclosure", "Temple", "Bazaar", "Fort"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "The Elephant Stables housed how many elephants?",
    options: ["11", "5", "20", "15"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "In which century did Vijayanagara Empire flourish?",
    options: ["14th-16th century", "10th-12th century", "16th-18th century", "12th-14th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What is the Queen's Bath?",
    options: ["Royal bathing complex", "Temple tank", "Reservoir", "Swimming pool"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "Approximately how many monuments are at Hampi?",
    options: ["500+", "100", "1000+", "50"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "What is Hampi Bazaar?",
    options: ["Ancient market street", "Modern market", "Temple", "Palace"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Hampi",
    question: "The Stone Chariot is actually what?",
    options: ["Shrine shaped like a chariot", "Real chariot", "Sculpture only", "Fountain"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },

  // MEDIUM (21-40)
  {
    site: "Hampi",
    question: "Who founded the Vijayanagara Empire?",
    options: ["Harihara I and Bukka Raya I", "Krishnadevaraya", "Achyutadevaraya", "Rama Raya"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "Which ruler is considered the greatest of Vijayanagara?",
    options: ["Krishnadevaraya", "Harihara I", "Bukka Raya I", "Achyutadevaraya"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "During which battle was Hampi destroyed?",
    options: ["Battle of Talikota", "Battle of Panipat", "Battle of Plassey", "Battle of Haldighati"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "In which year was the Battle of Talikota fought?",
    options: ["1565", "1556", "1575", "1585"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What is the total area of Hampi ruins?",
    options: ["26 square kilometers", "10 square kilometers", "50 square kilometers", "5 square kilometers"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Geography"
  },
  {
    site: "Hampi",
    question: "Who was the court poet who described Hampi's glory?",
    options: ["Allasani Peddana", "Kalidasa", "Tulsidas", "Kabir"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What architectural style is Hampi?",
    options: ["Dravidian and Indo-Islamic fusion", "Only Dravidian", "Only Islamic", "Mughal"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "How many pillars are in the Vittala Temple's main hall?",
    options: ["56", "100", "30", "75"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "What is Matanga Hill famous for?",
    options: ["Sunrise viewpoint", "Temples only", "Fort", "Palace"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Geography"
  },
  {
    site: "Hampi",
    question: "What is Hemakuta Hill known for?",
    options: ["Sunset viewpoint and Jain temples", "Sunrise point", "Palace", "Bazaar"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Geography"
  },
  {
    site: "Hampi",
    question: "The Hazara Rama Temple was used for what?",
    options: ["Royal family's private temple", "Public worship", "Coronations only", "Storage"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What epic is depicted on Hazara Rama Temple walls?",
    options: ["Ramayana", "Mahabharata", "Bhagavata Purana", "Puranas"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Hampi",
    question: "What is the Mahanavami Dibba?",
    options: ["Royal platform for ceremonies", "Temple", "Palace", "Fort"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "How high is the Mahanavami Dibba?",
    options: ["12 meters", "5 meters", "20 meters", "8 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "What is the Pushkarni?",
    options: ["Stepped water tank", "Temple", "Palace", "Market"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "Which Portuguese traveler visited Hampi?",
    options: ["Domingo Paes", "Vasco da Gama", "Marco Polo", "Ibn Battuta"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "How did Paes describe Hampi?",
    options: ["As large as Rome", "As small village", "As fortress city", "As holy town"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What was the estimated population of Vijayanagara at its peak?",
    options: ["500,000", "100,000", "1 million", "50,000"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What irrigation system did Hampi have?",
    options: ["Elaborate canal and tank system", "Wells only", "River water only", "No irrigation"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Engineering"
  },
  {
    site: "Hampi",
    question: "The Krishna Temple was built by which king?",
    options: ["Krishnadevaraya", "Harihara I", "Bukka I", "Achyutadevaraya"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },

  // HARD (41-60)
  {
    site: "Hampi",
    question: "What is the significance of Hampi's location?",
    options: ["Mythological site of Kishkinda", "Random location", "Strategic military position only", "Trade route only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Mythology"
  },
  {
    site: "Hampi",
    question: "Which epic mentions the Kishkinda region?",
    options: ["Ramayana", "Mahabharata", "Puranas", "Vedas"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Mythology"
  },
  {
    site: "Hampi",
    question: "Who were the Sangama brothers who founded Vijayanagara?",
    options: ["Harihara and Bukka", "Krishna and Achyuta", "Rama and Lakshmana", "None of above"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What was Hampi's role in trade?",
    options: ["Major center for cotton, spices, and gems", "Minor trade post", "No trade activity", "Only local trade"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Hampi",
    question: "Which international traders came to Hampi?",
    options: ["Persians, Portuguese, Arabs, and Chinese", "Only Portuguese", "Only Arabs", "Only Indians"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What engineering marvel is the aqueduct system at Hampi?",
    options: ["Gravity-fed water channels across hills", "Pump system", "Simple pipes", "Manual water carrying"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Hampi",
    question: "How were the boulder landscapes formed?",
    options: ["Volcanic activity and erosion", "Carved by humans", "Earthquake", "Glacier"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Geology"
  },
  {
    site: "Hampi",
    question: "What metallurgical advancement did Vijayanagara have?",
    options: ["Advanced iron and bronze working", "No metallurgy", "Basic iron only", "Gold working only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Hampi",
    question: "What is the Tungabhadra Dam's impact on Hampi?",
    options: ["Submerged some areas", "No impact", "Enhanced water supply", "Destroyed monuments"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Hampi",
    question: "What modern threat does Hampi face?",
    options: ["Encroachment and illegal mining", "Flooding", "Earthquakes", "Tourism only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Hampi",
    question: "What is the ASI's role at Hampi?",
    options: ["Conservation and excavation", "Only tourism management", "No role", "Construction work"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Hampi",
    question: "Which university conducted major excavations at Hampi?",
    options: ["Karnataka University and ASI", "Oxford", "Cambridge", "Harvard"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Research"
  },
  {
    site: "Hampi",
    question: "What was the royal mint at Hampi?",
    options: ["Facility for coining money", "Temple", "Palace", "Market"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What was the administrative structure of Vijayanagara?",
    options: ["Nayaka system of provincial governors", "Centralized monarchy", "Democratic", "Feudal"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What diplomatic relations did Vijayanagara maintain?",
    options: ["With Portugal, Persia, and Southeast Asia", "Isolated kingdom", "Only local relations", "Only with North India"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Hampi",
    question: "What was the cultural contribution of Vijayanagara?",
    options: ["Patronage of Carnatic music and literature", "No cultural contribution", "Only military achievements", "Only architecture"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Hampi",
    question: "What is the Underground Shiva Temple unique feature?",
    options: ["Always filled with water from natural spring", "Completely dry", "Modern construction", "No Shiva linga"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Features"
  },
  {
    site: "Hampi",
    question: "What restoration techniques are used at Hampi?",
    options: ["Anastylosis (reassembly of ruins)", "Complete rebuilding", "No restoration", "Modern materials"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Hampi",
    question: "What was the Appaji Math?",
    options: ["Monastery complex", "Palace", "Market", "Fort"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Hampi",
    question: "What 21st-century UNESCO concern affected Hampi?",
    options: ["Endangered status due to illegal activities", "Removal from list", "Celebration", "Expansion of site"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },

  // ============================================================
  // KHAJURAHO TEMPLES - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Khajuraho Temples",
    question: "In which state are the Khajuraho Temples located?",
    options: ["Madhya Pradesh", "Uttar Pradesh", "Rajasthan", "Gujarat"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Khajuraho Temples",
    question: "Khajuraho temples are famous for what?",
    options: ["Erotic sculptures", "Gold decorations", "Height", "Age"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Features"
  },
  {
    site: "Khajuraho Temples",
    question: "Who built the Khajuraho temples?",
    options: ["Chandela Dynasty", "Mughal Empire", "Mauryan Empire", "Gupta Dynasty"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "When did Khajuraho become a UNESCO World Heritage Site?",
    options: ["1986", "1990", "1980", "2000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Khajuraho Temples",
    question: "Approximately how many temples originally existed at Khajuraho?",
    options: ["85", "50", "100", "25"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "How many temples survive today?",
    options: ["25", "50", "10", "85"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "In which period were Khajuraho temples built?",
    options: ["950-1050 CE", "500-600 CE", "1200-1300 CE", "1500-1600 CE"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "Which is the largest temple at Khajuraho?",
    options: ["Kandariya Mahadeva Temple", "Lakshmana Temple", "Vishvanatha Temple", "Parsvanatha Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "Kandariya Mahadeva Temple is dedicated to whom?",
    options: ["Lord Shiva", "Lord Vishnu", "Lord Brahma", "Sun God"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Khajuraho Temples",
    question: "The temples at Khajuraho are divided into how many groups?",
    options: ["3 (Western, Eastern, Southern)", "2 groups", "4 groups", "5 groups"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "Which group has the most temples?",
    options: ["Western Group", "Eastern Group", "Southern Group", "All equal"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "The temples represent which three religions?",
    options: ["Hinduism, Jainism, and local traditions", "Only Hinduism", "Hinduism and Buddhism", "Hinduism and Islam"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Khajuraho Temples",
    question: "What percentage of sculptures are erotic?",
    options: ["About 10%", "50%", "75%", "5%"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Khajuraho Temples",
    question: "What material are the temples built from?",
    options: ["Sandstone", "Marble", "Granite", "Limestone"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "Who rediscovered Khajuraho for the modern world?",
    options: ["British engineer T.S. Burt", "Alexander Cunningham", "James Fergusson", "Lord Curzon"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "In which year was Khajuraho rediscovered?",
    options: ["1838", "1850", "1900", "1800"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "Why were the temples preserved?",
    options: ["Remote location and jungle cover", "Constant maintenance", "Protected by kings", "Stone quality"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "What architectural style is Khajuraho?",
    options: ["Nagara style", "Dravida style", "Vesara style", "Islamic style"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "The temples have how many shikhars (spires)?",
    options: ["Multiple shikhars", "Single shikhar", "No shikhar", "Dome instead"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What is depicted on the temple exteriors?",
    options: ["Gods, goddesses, humans, animals", "Only gods", "Only geometric patterns", "Nothing"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },

  // MEDIUM (21-40)
  {
    site: "Khajuraho Temples",
    question: "Who was the most famous Chandela ruler?",
    options: ["Yashovarman", "Dhanga", "Vidyadhara", "Paramardi"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the height of Kandariya Mahadeva Temple?",
    options: ["31 meters", "20 meters", "40 meters", "25 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "How many sculptures are on Kandariya Mahadeva?",
    options: ["Over 800", "500", "1000", "200"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the Lakshmana Temple dedicated to?",
    options: ["Lord Vishnu", "Lord Shiva", "Lord Brahma", "Goddess Lakshmi"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Khajuraho Temples",
    question: "The Lakshmana Temple was built by whom?",
    options: ["Yashovarman", "Dhanga", "Vidyadhara", "Paramardi"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "What is unique about the Chitragupta Temple?",
    options: ["Only temple dedicated to Surya (Sun God)", "Tallest temple", "Oldest temple", "No sculptures"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Khajuraho Temples",
    question: "Which is the only temple with living worship?",
    options: ["Matangeshvara Temple", "Kandariya Mahadeva", "Lakshmana", "Vishvanatha"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Religion"
  },
  {
    site: "Khajuraho Temples",
    question: "What material is the Matangeshvara Shiva linga made of?",
    options: ["Granite", "Marble", "Sandstone", "Bronze"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "Which Jain temple is largest at Khajuraho?",
    options: ["Parsvanatha Temple", "Adinatha Temple", "Ghantai Temple", "Shantinatha Temple"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What technique was used for construction?",
    options: ["Interlocking stones without mortar", "Mortar binding", "Steel framework", "Wooden beams"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Engineering"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the platform on which temples stand called?",
    options: ["Jagati", "Vimana", "Mandapa", "Garbhagriha"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What does the temple architecture symbolize?",
    options: ["Mount Meru (cosmic mountain)", "Palace", "Forest", "Ocean"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Symbolism"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the sanctum sanctorum called?",
    options: ["Garbhagriha", "Mandapa", "Ardhamandapa", "Antarala"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the entrance porch called?",
    options: ["Ardhamandapa", "Garbhagriha", "Mandapa", "Shikhara"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What celestial beings are depicted on temples?",
    options: ["Apsaras and Sura-Sundaris", "Only gods", "Only humans", "Only animals"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Khajuraho Temples",
    question: "What is depicted in the lower bands?",
    options: ["Daily life and animals", "Only gods", "Only erotic scenes", "Geometric patterns"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Khajuraho Temples",
    question: "What festival is celebrated at Khajuraho?",
    options: ["Khajuraho Dance Festival", "Holi", "Diwali", "None"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Khajuraho Temples",
    question: "When is the dance festival held?",
    options: ["February-March", "November-December", "June-July", "April-May"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Khajuraho Temples",
    question: "What causes weathering of the temples?",
    options: ["Soft sandstone and pollution", "Hard stone", "No weathering", "Only natural aging"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },
  {
    site: "Khajuraho Temples",
    question: "Which organization maintains Khajuraho?",
    options: ["ASI (Archaeological Survey of India)", "State government", "Private trust", "UNESCO directly"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },

  // HARD (41-60)
  {
    site: "Khajuraho Temples",
    question: "What theory explains the erotic sculptures?",
    options: ["Tantric traditions and celebration of life", "Entertainment only", "Random decoration", "Western influence"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Philosophy"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the chandrasalas architectural feature?",
    options: ["Horseshoe-shaped recesses", "Circular windows", "Square pillars", "Triangular roofs"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the urushringa?",
    options: ["Secondary spires flanking main spire", "Main spire", "Base platform", "Entrance door"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "How many bands of sculptures are typically on temples?",
    options: ["3-4 horizontal bands", "2 bands", "5 bands", "No specific pattern"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the maithuna representation?",
    options: ["Amorous couples symbolizing union", "War scenes", "Religious rituals", "Daily activities"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Khajuraho Temples",
    question: "What mathematical precision is seen in temple proportions?",
    options: ["Golden ratio and geometric progressions", "Random proportions", "Simple ratios", "Modern measurements"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the concept of rasa in sculptures?",
    options: ["Aesthetic emotional essence", "Color scheme", "Size proportion", "Material quality"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Philosophy"
  },
  {
    site: "Khajuraho Temples",
    question: "Which Chandela ruler defeated Mahmud of Ghazni?",
    options: ["Vidyadhara", "Yashovarman", "Dhanga", "Paramardi"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "Why did Khajuraho escape Islamic destruction?",
    options: ["Remote jungle location", "Strong defense", "Treaty protection", "Divine intervention"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the origin legend of Chandela dynasty?",
    options: ["Moon god and Hemavati", "Sun god lineage", "Sage's blessing", "Foreign origin"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Mythology"
  },
  {
    site: "Khajuraho Temples",
    question: "What stone carving technique was used?",
    options: ["Subtractive method from solid blocks", "Additive method", "Casting", "Assembly"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Khajuraho Temples",
    question: "How were the stones joined?",
    options: ["Mortise and tenon joints", "Mortar", "Metal clamps", "Adhesive"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the scholarly interpretation of erotic art?",
    options: ["Kama as part of Purusharthas (life goals)", "Mere decoration", "Imported tradition", "Modern addition"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Philosophy"
  },
  {
    site: "Khajuraho Temples",
    question: "What conservation technique is used?",
    options: ["Chemical consolidation and cleaning", "Recarving", "Painting over", "No conservation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Khajuraho Temples",
    question: "What documentation project was undertaken?",
    options: ["Digital 3D scanning of all temples", "Photography only", "Sketches only", "No documentation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Khajuraho Temples",
    question: "What is the panchayatana style?",
    options: ["Main shrine with four subsidiary shrines", "Single shrine", "Three shrines", "Seven shrines"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Khajuraho Temples",
    question: "What literary work describes Khajuraho?",
    options: ["Khajuraho Mahatmya", "Arthashastra", "Kamasutra", "Puranas"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Literature"
  },
  {
    site: "Khajuraho Temples",
    question: "What astronomical alignment exists in temples?",
    options: ["East-west solar alignment", "North-south", "Random", "No alignment"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Science"
  },
  {
    site: "Khajuraho Temples",
    question: "What was the original temple complex size?",
    options: ["Spread over 20 square kilometers", "1 square kilometer", "50 square kilometers", "100 square meters"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Khajuraho Temples",
    question: "What modern challenge do the temples face?",
    options: ["Air pollution and acid rain damage", "Earthquakes", "Floods", "Wars"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },

  // ============================================================
  // KONARK SUN TEMPLE - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Konark Sun Temple",
    question: "In which state is the Konark Sun Temple located?",
    options: ["Odisha", "West Bengal", "Andhra Pradesh", "Tamil Nadu"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Konark Sun Temple",
    question: "The Konark Temple is dedicated to which deity?",
    options: ["Surya (Sun God)", "Lord Shiva", "Lord Vishnu", "Lord Brahma"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Religion"
  },
  {
    site: "Konark Sun Temple",
    question: "When did Konark become a UNESCO World Heritage Site?",
    options: ["1984", "1990", "1975", "2000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Konark Sun Temple",
    question: "The temple is designed as what?",
    options: ["Chariot with 24 wheels", "Palace", "Fort", "Regular temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "How many horses pull the chariot?",
    options: ["7", "4", "12", "10"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "In which century was the temple built?",
    options: ["13th century", "10th century", "15th century", "8th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "Who built the Konark Temple?",
    options: ["King Narasimhadeva I", "Ashoka", "Akbar", "Krishnadevaraya"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "The temple is located near which body of water?",
    options: ["Bay of Bengal", "Arabian Sea", "Indian Ocean", "Lake"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Konark Sun Temple",
    question: "What is Konark also known as?",
    options: ["Black Pagoda", "White Pagoda", "Golden Temple", "Stone Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Name"
  },
  {
    site: "Konark Sun Temple",
    question: "Why was it called Black Pagoda?",
    options: ["Dark color and navigation landmark", "Built by black stone", "Painted black", "Shadow appearance"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "What material is the temple built from?",
    options: ["Khondalite and chlorite", "Marble", "Granite", "Sandstone"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "The temple is famous for its what?",
    options: ["Erotic sculptures", "Height", "Gold plating", "Paintings"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Features"
  },
  {
    site: "Konark Sun Temple",
    question: "Is the main tower (vimana) still standing?",
    options: ["No, it collapsed", "Yes, fully intact", "Partially standing", "Never built"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "How many wheels are carved on the temple?",
    options: ["24", "12", "36", "48"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "What do the wheels represent?",
    options: ["Hours of the day and passage of time", "Cart wheels", "Decoration only", "Seasons"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Symbolism"
  },
  {
    site: "Konark Sun Temple",
    question: "Each wheel has how many spokes?",
    options: ["8", "12", "16", "4"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "What architectural style is the temple?",
    options: ["Kalinga architecture", "Dravidian", "Nagara", "Vesara"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "The temple faces which direction?",
    options: ["East (towards sunrise)", "West", "North", "South"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "What creatures are depicted on the temple?",
    options: ["Elephants, lions, horses, humans", "Only gods", "Only geometric patterns", "Only flowers"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the Nata Mandir?",
    options: ["Dance hall", "Prayer hall", "King's chamber", "Storage"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },

  // MEDIUM (21-40)
  {
    site: "Konark Sun Temple",
    question: "In which year was the temple built?",
    options: ["1250 CE", "1200 CE", "1300 CE", "1150 CE"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "Why did King Narasimhadeva build the temple?",
    options: ["Commemorate military victory", "Religious devotion only", "As palace", "As fort"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "Which dynasty did Narasimhadeva belong to?",
    options: ["Eastern Ganga Dynasty", "Chola Dynasty", "Pallava Dynasty", "Chalukya Dynasty"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "What was the original height of the main tower?",
    options: ["60-70 meters", "40 meters", "100 meters", "30 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "When did the main tower collapse?",
    options: ["19th century", "16th century", "20th century", "Never stood"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the Jagamohana?",
    options: ["Audience hall (surviving structure)", "Main tower", "Dance hall", "King's chamber"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the height of the surviving Jagamohana?",
    options: ["38 meters", "20 meters", "50 meters", "30 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "Legend says how many workers built the temple?",
    options: ["1,200 artisans over 12 years", "500 workers", "10,000 workers", "100 workers"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Legend"
  },
  {
    site: "Konark Sun Temple",
    question: "Who was the chief architect according to legend?",
    options: ["Bisu Maharana", "Ustad Ahmad", "Vishvakarma", "Unknown"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Legend"
  },
  {
    site: "Konark Sun Temple",
    question: "What tragic legend is associated with the architect's son?",
    options: ["Dharmapada's sacrifice", "Killed in battle", "Exiled", "No such legend"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Legend"
  },
  {
    site: "Konark Sun Temple",
    question: "What is depicted on the three sides of the platform?",
    options: ["Elephants, warriors, and musicians", "Only elephants", "Only warriors", "Only gods"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Konark Sun Temple",
    question: "How many elephants are carved at the base?",
    options: ["Hundreds", "Dozens", "Thousands", "None"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Konark Sun Temple",
    question: "What astronomical purpose did the temple serve?",
    options: ["Solar calendar and time-keeping", "No astronomical purpose", "Lunar calendar", "Star mapping"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Science"
  },
  {
    site: "Konark Sun Temple",
    question: "The wheels can be used as what?",
    options: ["Sundials", "Decoration only", "Cart wheels", "Compass"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Science"
  },
  {
    site: "Konark Sun Temple",
    question: "What European traveler described Konark?",
    options: ["Abul Fazl", "Marco Polo", "Ibn Battuta", "Fa Hien"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "When was the temple rediscovered?",
    options: ["19th century by British", "Never lost", "20th century", "18th century"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "What conservation work was done in 1900s?",
    options: ["Filled with sand to prevent collapse", "Complete reconstruction", "Nothing", "Only cleaning"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },
  {
    site: "Konark Sun Temple",
    question: "Who ordered the conservation work?",
    options: ["British India government", "ASI independently", "UNESCO", "Private trust"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the Mayadevi Temple?",
    options: ["Smaller shrine in complex", "Main temple", "Dance hall", "No such temple"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "What annual festival is celebrated at Konark?",
    options: ["Konark Dance Festival", "Rath Yatra", "Dussehra", "Holi"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },

  // HARD (41-60)
  {
    site: "Konark Sun Temple",
    question: "What was the magnetic levitation legend?",
    options: ["Central magnet suspending idol (disproved)", "Scientifically proven", "Still functioning", "Never existed"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Legend"
  },
  {
    site: "Konark Sun Temple",
    question: "Why was the magnetic theory disproved?",
    options: ["No evidence of such mechanism found", "Magnet still present", "Technology confirmed", "Partially true"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Science"
  },
  {
    site: "Konark Sun Temple",
    question: "What construction technique was used?",
    options: ["Iron dowels and interlocking stones", "Mortar only", "No binding", "Modern cement"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Konark Sun Temple",
    question: "What caused the main tower's collapse?",
    options: ["Weight, weathering, and incomplete construction", "Earthquake", "War", "Lightning"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the chlorite stone used for?",
    options: ["Intricate detailed carvings", "Base only", "Not used", "Entire structure"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Konark Sun Temple",
    question: "What is khondalite rock?",
    options: ["Metamorphic rock for main structure", "Sedimentary rock", "Igneous rock", "Marble"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Geology"
  },
  {
    site: "Konark Sun Temple",
    question: "From where were the stones transported?",
    options: ["Quarried locally and along Mahanadi", "Imported from far", "Rajasthan", "South India"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Konark Sun Temple",
    question: "What innovative transport method was used?",
    options: ["River transport on rafts", "Elephants only", "Carts only", "Manual carrying"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Konark Sun Temple",
    question: "What weathering challenge does Konark face?",
    options: ["Salt-laden coastal air corrosion", "Pollution only", "No weathering", "Snow damage"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Konark Sun Temple",
    question: "What conservation technique is used today?",
    options: ["Chemical consolidation and bio-growth removal", "Recarving", "Painting over", "No conservation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the iconographic program of sculptures?",
    options: ["Tantra, Vedic, and Puranic themes", "Only Vedic", "Only Puranic", "Random"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Konark Sun Temple",
    question: "What mathematical precision is evident?",
    options: ["Geometric ratios and astronomical alignments", "Random design", "Basic measurements", "Modern precision"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Science"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the scholarly interpretation of erotic art?",
    options: ["Tantric philosophy and life celebration", "Mere decoration", "Western influence", "Modern addition"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Philosophy"
  },
  {
    site: "Konark Sun Temple",
    question: "When was UNESCO status granted?",
    options: ["1984", "1990", "1975", "2000"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Recognition"
  },
  {
    site: "Konark Sun Temple",
    question: "What archaeological excavations revealed?",
    options: ["Collapsed portions and foundation details", "Nothing new", "Treasure", "Ancient city"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Research"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the navagraha placement?",
    options: ["Nine planets in specific positions", "Random placement", "Not present", "Only sun depicted"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Astronomy"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the relationship to Puri Jagannath Temple?",
    options: ["Part of pilgrimage circuit", "No relationship", "Same complex", "Rival temples"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Religion"
  },
  {
    site: "Konark Sun Temple",
    question: "What documentation project was undertaken?",
    options: ["3D laser scanning and photogrammetry", "Photos only", "Drawings only", "No documentation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Konark Sun Temple",
    question: "What modern threat affects the temple?",
    options: ["Rising water table and humidity", "War", "Vandalism", "Fire"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Konark Sun Temple",
    question: "What is the current status of worship?",
    options: ["No active worship", "Daily worship", "Occasional worship", "Recently resumed"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Religion"
  },

  // ============================================================
  // AGRA FORT - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Agra Fort",
    question: "In which city is Agra Fort located?",
    options: ["Agra", "Delhi", "Jaipur", "Lucknow"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Agra Fort",
    question: "Agra Fort is located near which famous monument?",
    options: ["Taj Mahal", "Qutub Minar", "Red Fort", "India Gate"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Agra Fort",
    question: "Who built Agra Fort?",
    options: ["Akbar", "Shah Jahan", "Jahangir", "Humayun"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "When did Agra Fort become a UNESCO World Heritage Site?",
    options: ["1983", "1990", "1975", "2000"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Agra Fort",
    question: "What is the main building material of Agra Fort?",
    options: ["Red sandstone", "White marble", "Granite", "Limestone"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "In which century was the fort built?",
    options: ["16th century", "15th century", "17th century", "14th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What is the Agra Fort primarily?",
    options: ["Fort-palace complex", "Only a fort", "Only a palace", "Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "Which river flows near Agra Fort?",
    options: ["Yamuna", "Ganga", "Brahmaputra", "Narmada"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Agra Fort",
    question: "The fort has how many gates?",
    options: ["2 main gates", "4 gates", "1 gate", "6 gates"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What is the main entrance gate called?",
    options: ["Amar Singh Gate", "Delhi Gate", "Lahori Gate", "Elephant Gate"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "Who was imprisoned in Agra Fort?",
    options: ["Shah Jahan", "Akbar", "Aurangzeb", "Jahangir"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "From where could Shah Jahan see the Taj Mahal?",
    options: ["Musamman Burj", "Jahangir Palace", "Khas Mahal", "Diwan-i-Khas"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What is the Jahangir Palace?",
    options: ["Palace within the fort", "Separate palace", "Temple", "Market"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "The Khas Mahal was used for what?",
    options: ["Private residence", "Public audience", "Storage", "Army barracks"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What is Diwan-i-Am?",
    options: ["Hall of Public Audience", "Hall of Private Audience", "Palace", "Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What is Diwan-i-Khas?",
    options: ["Hall of Private Audience", "Hall of Public Audience", "Market", "Temple"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What architectural style is the fort?",
    options: ["Mughal", "Rajput", "Gothic", "Persian"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "Which ruler added marble structures?",
    options: ["Shah Jahan", "Akbar", "Jahangir", "Aurangzeb"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What is the Moti Masjid?",
    options: ["Pearl Mosque", "Golden Mosque", "Red Mosque", "White Mosque"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "The fort served as what for Mughal emperors?",
    options: ["Main residence", "Military base only", "Temple only", "Market only"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },

  // MEDIUM (21-40)
  {
    site: "Agra Fort",
    question: "When was the construction of Agra Fort completed?",
    options: ["1573", "1600", "1550", "1580"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "How long did it take to build the fort?",
    options: ["8 years", "5 years", "15 years", "20 years"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What is the total area of Agra Fort?",
    options: ["94 acres", "50 acres", "150 acres", "25 acres"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "How long are the fort walls?",
    options: ["2.5 km", "1 km", "5 km", "10 km"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What is the height of the fort walls?",
    options: ["20 meters", "10 meters", "30 meters", "15 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "Who imprisoned Shah Jahan?",
    options: ["His son Aurangzeb", "His brother", "Rebels", "British"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "How long was Shah Jahan imprisoned?",
    options: ["8 years", "5 years", "10 years", "3 years"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "Where did Shah Jahan die?",
    options: ["Musamman Burj in Agra Fort", "Taj Mahal", "Delhi", "Lahore"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What earlier structure existed on the site?",
    options: ["Badalgarh fort", "Ancient temple", "Nothing", "Palace"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "Who controlled the fort after Mughals?",
    options: ["Marathas, then British", "Only British", "Only Marathas", "Rajputs"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What is the Sheesh Mahal?",
    options: ["Mirror Palace", "Golden Palace", "Stone Palace", "Pearl Palace"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What was the Sheesh Mahal used for?",
    options: ["Bathing and dressing room", "Throne room", "Prayer room", "Storage"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What is the Anguri Bagh?",
    options: ["Grape garden", "Rose garden", "Lotus garden", "Mango garden"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What architectural blend is seen in Jahangir Palace?",
    options: ["Hindu and Islamic", "Only Islamic", "Only Hindu", "European"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What is unique about the Bengal roof structure?",
    options: ["Curved roof inspired by Bengali huts", "Flat roof", "Dome roof", "No roof"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "Who built the Moti Masjid?",
    options: ["Shah Jahan", "Akbar", "Aurangzeb", "Jahangir"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What is the Nagina Masjid?",
    options: ["Private mosque for ladies", "Public mosque", "No such mosque", "Army mosque"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What happened during the 1857 revolt?",
    options: ["Fort was battle site", "Nothing", "Fort destroyed", "Fort abandoned"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "Which portion is still used by military?",
    options: ["Part of the fort", "Entire fort", "No military use", "Only the gates"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Current Status"
  },
  {
    site: "Agra Fort",
    question: "What was the Delhi Gate used for?",
    options: ["Emperor's ceremonial entrance", "Army entrance", "Public entrance", "Not a real gate"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },

  // HARD (41-60)
  {
    site: "Agra Fort",
    question: "How many buildings were originally in the complex?",
    options: ["About 500", "100", "1000", "50"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "How many survive today?",
    options: ["About 30", "100", "200", "10"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What was the estimated cost of construction?",
    options: ["35 lakhs rupees (16th century)", "10 lakhs", "100 lakhs", "5 lakhs"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "Who was the chief architect?",
    options: ["Qasim Khan", "Ustad Ahmad", "No records", "Shah Jahan himself"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "From where was red sandstone sourced?",
    options: ["Rajasthan (Dholpur and Fatehpur Sikri)", "Local quarries", "Gujarat", "Delhi"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Agra Fort",
    question: "What defensive feature exists in the walls?",
    options: ["Double ramparts with moat", "Single wall", "Triple walls", "No defense"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What was the significance of the Jahangiri Mahal name?",
    options: ["Built by Akbar for Jahangir", "Built by Jahangir", "Named later", "Unknown"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What architectural innovation is the Diwan-i-Khas?",
    options: ["Intricate pietra dura inlay work", "Pure red sandstone", "No decoration", "Gold plating"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Agra Fort",
    question: "What was housed in the throne room?",
    options: ["Peacock Throne (later moved to Delhi)", "No throne", "Simple throne", "Stayed in Delhi always"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What is the Macchi Bhawan?",
    options: ["Fish enclosure (water palace)", "Fish market", "No such structure", "Guard house"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What water engineering existed?",
    options: ["Yamuna water raised by Persian wheels", "Wells only", "Rain water only", "No water system"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Agra Fort",
    question: "What happened to the Koh-i-Noor diamond here?",
    options: ["Part of Mughal treasury in fort", "Never at Agra", "Lost here", "Created here"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What conservation challenge exists?",
    options: ["Air pollution yellowing marble", "Structural collapse", "Flooding", "No challenges"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Agra Fort",
    question: "What ASI work has been done?",
    options: ["Structural stabilization and cleaning", "Complete reconstruction", "Nothing", "Only tourism management"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Agra Fort",
    question: "What military significance did fort have?",
    options: ["Strategic location controlling North India", "No military use", "Only symbolic", "Minor outpost"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What was the Akbari Mahal?",
    options: ["Akbar's private palace (mostly destroyed)", "Still intact", "Never existed", "Public building"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What underground structures exist?",
    options: ["Baoli (step-well) and passages", "No underground structures", "Modern additions", "Natural caves"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Agra Fort",
    question: "What was the relationship with Fatehpur Sikri?",
    options: ["Agra Fort used after Fatehpur abandoned", "No relationship", "Used simultaneously", "Fatehpur replaced Agra"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Agra Fort",
    question: "What modern access restriction exists?",
    options: ["Military area closed to public", "Fully open", "Completely closed", "Only weekends open"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Tourism"
  },
  {
    site: "Agra Fort",
    question: "What documentation project was completed?",
    options: ["Digital archiving and 3D mapping", "Only photography", "No documentation", "Only drawings"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },

  // ============================================================
  // HUMAYUN'S TOMB - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Humayun's Tomb",
    question: "In which city is Humayun's Tomb located?",
    options: ["Delhi", "Agra", "Jaipur", "Lucknow"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Humayun's Tomb",
    question: "Who is buried in Humayun's Tomb?",
    options: ["Emperor Humayun", "Akbar", "Shah Jahan", "Jahangir"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "Who commissioned the construction of Humayun's Tomb?",
    options: ["Hamida Banu Begum (his wife)", "Akbar", "Humayun himself", "Shah Jahan"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "When did Humayun's Tomb become a UNESCO World Heritage Site?",
    options: ["1993", "1983", "2000", "1975"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Recognition"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the main building material?",
    options: ["Red sandstone and white marble", "Only marble", "Only sandstone", "Granite"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "In which century was the tomb built?",
    options: ["16th century", "15th century", "17th century", "14th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "The tomb is considered a precursor to which monument?",
    options: ["Taj Mahal", "Red Fort", "Qutub Minar", "Gateway of India"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What architectural feature is prominent?",
    options: ["Double dome", "Single dome", "No dome", "Multiple small domes"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "The tomb is set in what type of garden?",
    options: ["Charbagh (four-part garden)", "English garden", "Zen garden", "Random garden"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What does Charbagh represent?",
    options: ["Islamic paradise garden", "Royal garden", "Vegetable garden", "Flower garden"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Symbolism"
  },
  {
    site: "Humayun's Tomb",
    question: "Who was the architect?",
    options: ["Mirak Mirza Ghiyas", "Ustad Ahmad Lahauri", "Unknown", "Humayun himself"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "Where was the architect from?",
    options: ["Persia", "India", "Arabia", "Turkey"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "The tomb complex includes how many graves?",
    options: ["Over 100", "Only 1", "10", "50"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What other tombs are in the complex?",
    options: ["Isa Khan's tomb", "No other tombs", "Akbar's tomb", "Shah Jahan's tomb"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "The tomb stands on what?",
    options: ["High platform", "Ground level", "Underground", "Water"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What are the decorative elements?",
    options: ["Geometric and floral patterns", "Human figures", "Animal sculptures", "Paintings"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Humayun's Tomb",
    question: "What technique is used for decoration?",
    options: ["Inlay work and carvings", "Painting", "Mosaic only", "Gold plating"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Art"
  },
  {
    site: "Humayun's Tomb",
    question: "The tomb faces which direction?",
    options: ["North-South axis", "East-West", "Random", "Diagonal"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "Who else is buried here?",
    options: ["Other Mughal family members", "Only Humayun", "Only queens", "No one else"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "What is unique about its location?",
    options: ["First garden-tomb in India", "On a hill", "In a forest", "Near a river"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },

  // MEDIUM (21-40)
  {
    site: "Humayun's Tomb",
    question: "When was the tomb completed?",
    options: ["1572", "1560", "1580", "1550"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "How long did construction take?",
    options: ["8 years", "5 years", "15 years", "20 years"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the height of the tomb?",
    options: ["42.5 meters", "30 meters", "60 meters", "25 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the Barber's Tomb?",
    options: ["Nai-ka-Gumbad in the complex", "Main tomb", "No such tomb", "Modern addition"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "Who was Isa Khan?",
    options: ["Afghan noble with earlier tomb in complex", "Mughal emperor", "Architect", "Guard"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the Bu Halima Garden?",
    options: ["Part of the tomb complex", "Separate garden", "No such garden", "Modern park"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What architectural style influenced the tomb?",
    options: ["Persian and Timurid", "Only Indian", "European", "Chinese"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What is unique about the double dome?",
    options: ["Outer decorative, inner structural", "Both same", "Both decorative", "Both structural"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Engineering"
  },
  {
    site: "Humayun's Tomb",
    question: "How many arches are in each facade?",
    options: ["Multiple arched alcoves", "Single arch", "No arches", "Three arches"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What water features existed?",
    options: ["Channels and pools", "No water", "Fountains only", "River"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "When was major restoration done?",
    options: ["1990s-2000s", "1950s", "Never", "2020s"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },
  {
    site: "Humayun's Tomb",
    question: "Who funded the restoration?",
    options: ["Aga Khan Trust for Culture", "Government only", "UNESCO", "Private donors"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },
  {
    site: "Humayun's Tomb",
    question: "What was restored in the gardens?",
    options: ["Water channels and planting", "Nothing", "Buildings only", "Walls only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },
  {
    site: "Humayun's Tomb",
    question: "Which last Mughal emperor took refuge here?",
    options: ["Bahadur Shah Zafar", "Aurangzeb", "Shah Alam", "Akbar II"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "When did Bahadur Shah Zafar take refuge here?",
    options: ["1857 Revolt", "1800", "1900", "Never"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the Arab Serai?",
    options: ["Accommodation for tomb workers", "Palace", "Market", "Temple"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "How many chambers are in the tomb?",
    options: ["Multiple chambers", "Single chamber", "Two chambers", "No chambers"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "Where is the actual grave?",
    options: ["In the lower chamber", "In the upper chamber", "Outside", "No grave"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the cenotaph chamber?",
    options: ["Upper chamber with false tomb", "Real burial chamber", "Prayer room", "Storage"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What modern use does the complex have?",
    options: ["Heritage site and park", "Active burial ground", "Palace", "Government office"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Current Status"
  },

  // HARD (41-60)
  {
    site: "Humayun's Tomb",
    question: "What was the estimated cost of construction?",
    options: ["1.5 million rupees (16th century)", "1 million", "5 million", "500,000"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Humayun's Tomb",
    question: "What architectural innovation did it introduce to India?",
    options: ["Persian-style garden tomb", "Dome design", "Arch design", "Minaret design"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "How did it influence the Taj Mahal?",
    options: ["Template for garden tomb design", "No influence", "Only materials", "Only dome"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the significance of the platform height?",
    options: ["7 meters high for prominence", "Ground level", "3 meters", "10 meters"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the octagonal plan significance?",
    options: ["Islamic architectural symbolism", "Random design", "Hindu influence", "No significance"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Symbolism"
  },
  {
    site: "Humayun's Tomb",
    question: "How many smaller domed kiosks (chhatris) are there?",
    options: ["Several on corners and roof", "None", "One", "Two"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What marble work technique was used?",
    options: ["Inlay with black and white marble", "Solid marble", "Painted marble", "No marble"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Art"
  },
  {
    site: "Humayun's Tomb",
    question: "What water engineering was implemented?",
    options: ["Complex qanat (underground channel) system", "Simple pipes", "Wells only", "No system"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Humayun's Tomb",
    question: "What trees were planted in restoration?",
    options: ["Period-appropriate species like neem", "Modern species", "No trees", "Random trees"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Humayun's Tomb",
    question: "What was the Aga Khan's restoration cost?",
    options: ["$27.5 million", "$10 million", "$50 million", "$5 million"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Humayun's Tomb",
    question: "What archaeological discoveries were made?",
    options: ["Original water channels and garden layout", "Treasure", "Ancient city", "Nothing"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Research"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the char bagh quadrant system?",
    options: ["Four gardens divided by water channels", "Three gardens", "Single garden", "No system"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "How many subsidiary tombs are in the complex?",
    options: ["Over 100 graves", "50", "10", "Only Humayun"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the significance of red and white color scheme?",
    options: ["Mughal imperial colors", "Random choice", "Persian tradition only", "Hindu influence"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Symbolism"
  },
  {
    site: "Humayun's Tomb",
    question: "What UNESCO award did the restoration win?",
    options: ["Award of Excellence", "No award", "Heritage Award", "Conservation Award"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Recognition"
  },
  {
    site: "Humayun's Tomb",
    question: "What modern conservation technique was used?",
    options: ["Lime-based mortars matching original", "Cement", "Modern chemicals", "No conservation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Humayun's Tomb",
    question: "What was discovered about the original appearance?",
    options: ["Brighter colors and white plaster finish", "Always dull", "Painted", "Gold covered"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Research"
  },
  {
    site: "Humayun's Tomb",
    question: "What is the relationship with Nizamuddin Dargah?",
    options: ["Part of same cultural complex", "No relationship", "Same building", "Rival sites"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Geography"
  },
  {
    site: "Humayun's Tomb",
    question: "What urban context issue exists?",
    options: ["Encroachment and pollution", "No issues", "Flooding", "Earthquakes"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Humayun's Tomb",
    question: "What future conservation plan exists?",
    options: ["Nizamuddin urban renewal project", "No plans", "Demolition", "Commercial development"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },

  // ============================================================
  // MYSORE PALACE - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Mysore Palace",
    question: "In which state is Mysore Palace located?",
    options: ["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Mysore Palace",
    question: "In which city is the Mysore Palace located?",
    options: ["Mysore", "Bangalore", "Mangalore", "Hubli"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Mysore Palace",
    question: "Which royal family resided in Mysore Palace?",
    options: ["Wodeyar Dynasty", "Chola Dynasty", "Pallava Dynasty", "Vijayanagara Dynasty"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "In which century was the current palace built?",
    options: ["20th century", "19th century", "18th century", "17th century"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "The palace is famous for what event?",
    options: ["Dussehra celebrations", "Holi", "Diwali", "Pongal"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },
  {
    site: "Mysore Palace",
    question: "What happens to the palace during Dussehra?",
    options: ["Illuminated with 100,000 lights", "Closed", "Renovated", "Nothing special"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Cultural"
  },
  {
    site: "Mysore Palace",
    question: "What architectural style is the palace?",
    options: ["Indo-Saracenic", "Gothic", "Mughal", "Dravidian"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "Who was the British architect?",
    options: ["Henry Irwin", "Edwin Lutyens", "Herbert Baker", "Robert Chisholm"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "How many entrances does the palace have?",
    options: ["7", "3", "5", "10"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What is the Mysore Palace also called?",
    options: ["Amba Vilas Palace", "Golden Palace", "Maharaja Palace", "Royal Palace"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Name"
  },
  {
    site: "Mysore Palace",
    question: "What material are the palace domes made of?",
    options: ["Gold-plated", "Silver", "Copper", "Brass"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What is the Durbar Hall?",
    options: ["Royal audience hall", "Bedroom", "Kitchen", "Storage"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What is displayed in the palace museum?",
    options: ["Royal artifacts and paintings", "Modern art", "No museum", "Only weapons"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Museum"
  },
  {
    site: "Mysore Palace",
    question: "The palace is one of India's most visited what?",
    options: ["Tourist attractions", "Forts", "Temples", "Markets"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Mysore Palace",
    question: "What is unique about Sunday evenings?",
    options: ["Palace is illuminated", "Closed", "Free entry", "Special shows"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Mysore Palace",
    question: "What destroyed the old wooden palace?",
    options: ["Fire", "Earthquake", "Flood", "War"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "In which year did the fire occur?",
    options: ["1897", "1900", "1850", "1920"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What is the Golden Throne (Simhasana)?",
    options: ["Ceremonial throne", "Storage chest", "Sculpture", "Door"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Artifacts"
  },
  {
    site: "Mysore Palace",
    question: "How many floors does the palace have?",
    options: ["3", "2", "5", "7"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What gardens surround the palace?",
    options: ["Well-manicured gardens", "No gardens", "Wild forest", "Desert"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },

  // MEDIUM (21-40)
  {
    site: "Mysore Palace",
    question: "When was the current palace completed?",
    options: ["1912", "1900", "1920", "1897"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "Who commissioned the current palace?",
    options: ["Maharaja Krishnaraja Wadiyar IV", "British government", "Tipu Sultan", "Hyder Ali"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What was the estimated cost of construction?",
    options: ["41.47 lakh rupees", "10 lakh", "100 lakh", "5 lakh"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What material is predominantly used?",
    options: ["Granite and marble", "Wood only", "Steel", "Brick"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What stained glass work is featured?",
    options: ["Scottish stained glass", "No stained glass", "Indian glass work", "Modern glass"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Mysore Palace",
    question: "What is the Kalyana Mantapa?",
    options: ["Marriage pavilion", "Prayer hall", "Dining hall", "Storage"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "How many paintings are in the Durbar Hall?",
    options: ["26 oil paintings", "10 paintings", "50 paintings", "No paintings"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Mysore Palace",
    question: "What do the paintings depict?",
    options: ["Dussehra processions", "Wars", "Gods only", "Nature"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Mysore Palace",
    question: "What is the height of the main tower?",
    options: ["44 meters (145 feet)", "30 meters", "60 meters", "20 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What is unique about the palace gates?",
    options: ["Massive intricately carved wooden doors", "Plain gates", "Metal gates", "Stone gates"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What metal work is prominent?",
    options: ["Silver doors and furniture", "Gold only", "Bronze only", "Iron only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Art"
  },
  {
    site: "Mysore Palace",
    question: "When is the Golden Throne displayed?",
    options: ["Only during Dussehra", "Always", "Never", "Weekly"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Mysore Palace",
    question: "What is the origin of the Golden Throne?",
    options: ["From Vijayanagara Empire", "Wodeyar creation", "British gift", "Modern replica"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "Who brought the throne to Mysore?",
    options: ["Raja Wodeyar I", "Tipu Sultan", "British", "Marathas"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What is the Private Durbar Hall called?",
    options: ["Diwan-e-Khas", "Diwan-e-Aam", "Rang Mahal", "Sheesh Mahal"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "What flooring material is used in Durbar Hall?",
    options: ["Mosaic tiles", "Marble", "Wood", "Carpet"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "How many light bulbs illuminate the palace?",
    options: ["Nearly 100,000", "50,000", "200,000", "10,000"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Features"
  },
  {
    site: "Mysore Palace",
    question: "What is the Residential Museum?",
    options: ["Royal family's living quarters converted to museum", "Separate building", "No museum", "Art gallery"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Museum"
  },
  {
    site: "Mysore Palace",
    question: "Who maintains the palace today?",
    options: ["Mysore Royal Family and Government", "Only government", "Only family", "Private trust"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Current Status"
  },
  {
    site: "Mysore Palace",
    question: "What is the average daily visitor count?",
    options: ["6,000 on weekdays, more on weekends", "1,000", "20,000", "500"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Tourism"
  },

  // HARD (41-60)
  {
    site: "Mysore Palace",
    question: "What architectural styles are blended?",
    options: ["Hindu, Muslim, Rajput, and Gothic", "Only Hindu", "Only British", "Only Islamic"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Mysore Palace",
    question: "Who was the consulting engineer?",
    options: ["E.W. Fritchley", "Henry Irwin alone", "Indian architects only", "Unknown"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What historical events did the palace witness?",
    options: ["Transfer of power to democracy", "Only royal ceremonies", "Wars only", "Nothing significant"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "When did the Wodeyars lose political power?",
    options: ["1950 (merger with India)", "1947", "1900", "Still ruling"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What was Tipu Sultan's relationship with the palace?",
    options: ["Ruled Mysore, imprisoned Wodeyars", "Built the palace", "Never involved", "Allied with Wodeyars"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What happened after Tipu's defeat?",
    options: ["British restored Wodeyars to throne", "British ruled directly", "Marathas took over", "Palace abandoned"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Mysore Palace",
    question: "What is the significance of peacock motif?",
    options: ["Royal symbol of Wodeyars", "Random decoration", "British influence", "Religious symbol"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Symbolism"
  },
  {
    site: "Mysore Palace",
    question: "What technological innovation was included?",
    options: ["First palace in India with electric lighting", "Steam heating", "Elevators", "Air conditioning"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Mysore Palace",
    question: "When was electricity first installed?",
    options: ["1910s", "1950s", "1900s", "1930s"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Technology"
  },
  {
    site: "Mysore Palace",
    question: "What conservation challenges exist?",
    options: ["Humidity and visitor pressure", "Earthquakes", "Flooding", "No challenges"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Mysore Palace",
    question: "What is the Palace Board?",
    options: ["Administrative body managing the palace", "Tourist group", "No such entity", "Museum committee"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Administration"
  },
  {
    site: "Mysore Palace",
    question: "What revenue does the palace generate?",
    options: ["Significant tourism revenue for state", "None", "Minimal", "Negative (only expense)"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Economics"
  },
  {
    site: "Mysore Palace",
    question: "What is the throne's material composition?",
    options: ["Figwood covered with gold and silver", "Pure gold", "Wood only", "Stone"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Artifacts"
  },
  {
    site: "Mysore Palace",
    question: "How heavy is the Golden Throne?",
    options: ["280 kg", "100 kg", "500 kg", "50 kg"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Artifacts"
  },
  {
    site: "Mysore Palace",
    question: "What precious stones adorn the throne?",
    options: ["Diamonds, emeralds, rubies, pearls", "Only diamonds", "No stones", "Only gold"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Artifacts"
  },
  {
    site: "Mysore Palace",
    question: "What is the Dussehra procession route?",
    options: ["Through Mysore city streets", "Inside palace only", "No procession", "To nearby temple"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Mysore Palace",
    question: "What elephants participate in Dussehra?",
    options: ["Royal elephants including Arjuna", "No elephants", "Hired elephants", "Elephant sculptures"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Mysore Palace",
    question: "What modern conservation technique is used?",
    options: ["Climate control and regular maintenance", "No conservation", "Complete reconstruction", "Painting over"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Mysore Palace",
    question: "What cultural significance does the palace have?",
    options: ["Symbol of Karnataka's royal heritage", "Only tourist site", "No significance", "Religious shrine"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Mysore Palace",
    question: "What future plans exist for the palace?",
    options: ["Enhanced conservation and visitor facilities", "Demolition", "Conversion to hotel", "No plans"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Future"
  },

  // ============================================================
  // GATEWAY OF INDIA - 60 Questions (20 Easy, 20 Medium, 20 Hard)
  // ============================================================
  
  // EASY (1-20)
  {
    site: "Gateway of India",
    question: "In which city is the Gateway of India located?",
    options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Location"
  },
  {
    site: "Gateway of India",
    question: "The Gateway of India faces which body of water?",
    options: ["Arabian Sea", "Bay of Bengal", "Indian Ocean", "Lakshadweep Sea"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Gateway of India",
    question: "In which year was the Gateway of India built?",
    options: ["1924", "1911", "1947", "1935"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "Who designed the Gateway of India?",
    options: ["George Wittet", "Edwin Lutyens", "Herbert Baker", "Henry Irwin"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "Why was the Gateway of India built?",
    options: ["Commemorate King George V's visit", "War memorial", "Independence celebration", "Trade gateway"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What architectural style is it?",
    options: ["Indo-Saracenic", "Gothic", "Baroque", "Art Deco"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What is the main building material?",
    options: ["Yellow basalt and concrete", "Marble", "Granite", "Sandstone"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What historical event occurred here in 1948?",
    options: ["Last British troops left India", "Independence declared", "First President sworn in", "Partition announced"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What is the height of the monument?",
    options: ["26 meters (85 feet)", "50 meters", "15 meters", "100 meters"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "The monument consists of how many turrets?",
    options: ["4", "2", "6", "8"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What is located directly behind the Gateway?",
    options: ["Taj Mahal Palace Hotel", "Victoria Terminus", "Marine Drive", "Elephanta Caves"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Geography"
  },
  {
    site: "Gateway of India",
    question: "What can visitors do from the Gateway?",
    options: ["Take boats to Elephanta Caves", "Climb to the top", "Shop inside", "Stay overnight"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Gateway of India",
    question: "What is the central dome inspired by?",
    options: ["Gujarati architecture", "Mughal domes", "European domes", "South Indian temples"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What shape is the archway?",
    options: ["Triple-arched gateway", "Single arch", "Double arch", "Square opening"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "The Gateway is a popular spot for what?",
    options: ["Photography and gathering", "Swimming", "Shopping", "Worship"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Gateway of India",
    question: "What tragic event happened nearby in 2008?",
    options: ["Mumbai terror attacks", "Earthquake", "Cyclone", "Fire"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What is the plaza area used for?",
    options: ["Public gatherings and events", "Market", "Parking only", "Restricted area"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Current Use"
  },
  {
    site: "Gateway of India",
    question: "Is entry to the Gateway free?",
    options: ["Yes", "No, requires ticket", "Only for Indians", "Only for foreigners"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Gateway of India",
    question: "What time of day is the Gateway most crowded?",
    options: ["Evenings and weekends", "Early morning", "Late night", "Never crowded"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Tourism"
  },
  {
    site: "Gateway of India",
    question: "What is the Gateway's status today?",
    options: ["Iconic Mumbai landmark", "Abandoned", "Under renovation", "Government office"],
    correctAnswer: 0,
    difficulty: "easy",
    category: "Current Status"
  },

  // MEDIUM (21-40)
  {
    site: "Gateway of India",
    question: "When did King George V visit India?",
    options: ["1911", "1924", "1905", "1920"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "When was the foundation stone laid?",
    options: ["1911", "1915", "1920", "1924"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "How long did construction take?",
    options: ["13 years", "5 years", "20 years", "10 years"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What was the estimated cost of construction?",
    options: ["21 lakh rupees", "10 lakh", "50 lakh", "5 lakh"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "Why was there a delay in construction?",
    options: ["World War I", "Lack of funds", "Design changes", "Labor shortage"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What was initially at this location?",
    options: ["Temporary structure for royal visit", "Nothing", "Fort", "Market"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What architectural elements blend here?",
    options: ["Hindu and Muslim styles", "Only British", "Only Indian", "Art Deco only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What is the width of the archway?",
    options: ["26 meters", "15 meters", "40 meters", "10 meters"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What is the jali work?",
    options: ["Lattice screens on sides", "Painted decoration", "Mosaic work", "Sculpture"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What was the significance of British troops leaving?",
    options: ["Symbolic end of British rule", "Beginning of rule", "Military exercise", "Tourism event"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "Which regiment left last?",
    options: ["Somerset Light Infantry", "Royal Guards", "Bengal Regiment", "Madras Regiment"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What public events are held here?",
    options: ["Protests, celebrations, gatherings", "None", "Only official ceremonies", "Only tourist events"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Gateway of India",
    question: "What security measures exist today?",
    options: ["Police presence and CCTV", "No security", "Military guard", "Private security"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Current Status"
  },
  {
    site: "Gateway of India",
    question: "What nearby attractions complement a visit?",
    options: ["Taj Hotel, Colaba Causeway, Marine Drive", "Only hotels", "No other attractions", "Only beaches"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Tourism"
  },
  {
    site: "Gateway of India",
    question: "What boat services operate from here?",
    options: ["Ferries to Elephanta and Alibaug", "No boats", "International ferries", "Cruise ships only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Tourism"
  },
  {
    site: "Gateway of India",
    question: "What is the water feature in front?",
    options: ["Arabian Sea waterfront", "Fountain", "Lake", "River"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Geography"
  },
  {
    site: "Gateway of India",
    question: "What conservation work has been done?",
    options: ["Periodic cleaning and restoration", "None", "Complete rebuild", "Daily maintenance only"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Conservation"
  },
  {
    site: "Gateway of India",
    question: "What cultural significance does it have?",
    options: ["Symbol of Mumbai and Indian independence", "Only tourist spot", "No significance", "Religious shrine"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Gateway of India",
    question: "What happens on Republic Day and Independence Day?",
    options: ["Special celebrations and flag hoisting", "Closed", "Nothing special", "Light show"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Cultural"
  },
  {
    site: "Gateway of India",
    question: "What is the annual visitor count?",
    options: ["Millions of visitors", "Thousands", "Hundreds", "Closed to public"],
    correctAnswer: 0,
    difficulty: "medium",
    category: "Tourism"
  },

  // HARD (41-60)
  {
    site: "Gateway of India",
    question: "What was George Wittet's other major Mumbai work?",
    options: ["Prince of Wales Museum", "Victoria Terminus", "Taj Hotel", "Crawford Market"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What specific Gujarati elements are incorporated?",
    options: ["16th-century Gujarati architectural motifs", "Modern Gujarati art", "No Gujarati elements", "Only domes"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "What was the original color of the basalt?",
    options: ["Yellow-gray", "Pure white", "Red", "Black"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Architecture"
  },
  {
    site: "Gateway of India",
    question: "How has pollution affected the monument?",
    options: ["Darkening and weathering of stone", "No effect", "Structural damage", "Complete deterioration"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Gateway of India",
    question: "What engineering challenge was faced?",
    options: ["Building on reclaimed land", "No challenges", "Height restrictions", "Material shortage"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Engineering"
  },
  {
    site: "Gateway of India",
    question: "What was the significance of its waterfront location?",
    options: ["First view for ships arriving at Bombay port", "Random location", "Military strategy", "Trade route"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What colonial symbolism did it represent?",
    options: ["Gateway to India for British Raj", "Exit from India", "No symbolism", "Trade gateway"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Symbolism"
  },
  {
    site: "Gateway of India",
    question: "How did independence change its meaning?",
    options: ["From entry gateway to exit point", "No change", "Demolished and rebuilt", "Renamed"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What role did it play in 2008 attacks?",
    options: ["Near Taj Hotel attack site", "Not involved", "Main target", "Safe zone"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "History"
  },
  {
    site: "Gateway of India",
    question: "What security enhancements were made post-2008?",
    options: ["Increased surveillance and barriers", "No changes", "Closed to public", "Military deployment"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Security"
  },
  {
    site: "Gateway of India",
    question: "What urban development surrounds it?",
    options: ["Colaba heritage precinct", "Modern skyscrapers", "Slums", "Industrial area"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Urban Planning"
  },
  {
    site: "Gateway of India",
    question: "What conservation philosophy is applied?",
    options: ["Minimal intervention and preservation", "Complete restoration", "Modern makeover", "No conservation"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Gateway of India",
    question: "What pollution sources affect it?",
    options: ["Sea salt, vehicle emissions, crowds", "Only sea water", "No pollution", "Industrial only"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Conservation"
  },
  {
    site: "Gateway of India",
    question: "What is its role in Mumbai's identity?",
    options: ["Iconic symbol of the city", "Minor monument", "No significance", "Tourist trap"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Gateway of India",
    question: "What commercial activity occurs around it?",
    options: ["Street vendors, photographers, boats", "None allowed", "Only official shops", "Banned area"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Economics"
  },
  {
    site: "Gateway of India",
    question: "What controversy exists about street vendors?",
    options: ["Balancing heritage preservation with livelihoods", "No vendors", "No controversy", "All banned"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Social"
  },
  {
    site: "Gateway of India",
    question: "What lighting scheme was implemented?",
    options: ["Night illumination system", "No lighting", "Natural light only", "Flashlights"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Modern Features"
  },
  {
    site: "Gateway of India",
    question: "What future conservation plans exist?",
    options: ["Periodic maintenance and restoration", "Demolition", "Major reconstruction", "No plans"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Future"
  },
  {
    site: "Gateway of India",
    question: "What role does it play in popular culture?",
    options: ["Featured in films and literature", "No cultural role", "Banned from media", "Unknown"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Cultural"
  },
  {
    site: "Gateway of India",
    question: "What makes it different from other gates/arches?",
    options: ["Waterfront location and colonial-independence duality", "Nothing special", "Tallest gate", "Oldest gate"],
    correctAnswer: 0,
    difficulty: "hard",
    category: "Unique Features"
  },

];

// MongoDB Connection and Insert Function
async function insertQuizData() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Create indexes
    await collection.createIndex({ site: 1, difficulty: 1 });
    await collection.createIndex({ category: 1 });
    
    console.log(`Inserting ${quizQuestions.length} questions...`);
    const result = await collection.insertMany(quizQuestions);
    
    console.log(`Successfully inserted ${result.insertedCount} questions`);
    
    // Print summary
    const siteCounts = {};
    quizQuestions.forEach(q => {
      siteCounts[q.site] = (siteCounts[q.site] || 0) + 1;
    });
    
    console.log('\n=== INSERTION SUMMARY ===');
    Object.entries(siteCounts).forEach(([site, count]) => {
      console.log(`${site}: ${count} questions`);
    });
    
    const difficulties = { easy: 0, medium: 0, hard: 0 };
    quizQuestions.forEach(q => {
      difficulties[q.difficulty]++;
    });
    
    console.log('\n=== DIFFICULTY BREAKDOWN ===');
    console.log(`Easy: ${difficulties.easy}`);
    console.log(`Medium: ${difficulties.medium}`);
    console.log(`Hard: ${difficulties.hard}`);
    console.log(`Total: ${quizQuestions.length}`);
    
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Only seed when executed directly - importing this file must have no side
// effects, or the server cannot reuse the question set.
if (require.main === module) {
  insertQuizData();
}

// Export for use as module
module.exports = { quizQuestions };

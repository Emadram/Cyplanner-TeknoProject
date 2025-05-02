/**
 * SharedData.js - Centralized data store for application
 *
 * This module provides access to shared location and event data across components.
 * It includes utility functions for filtering and retrieving data.
 */

// Import images if needed
// import locationImages from '../assets/images/locations';
// import eventImages from '../assets/images/events';

/**
 * Location data used throughout the application
 * @type {Array<Object>}
 */
export const locationData = [
  {
    id: 1,
    name: "Salamis Ruins",
    lat: 35.0381,
    lng: 33.988,
    description:
      "Ancient ruins of Salamis, a spectacular archaeological site with Roman and Byzantine remains, including a theater, gymnasium, and bath complex.",
    fullDescription:
      "The ancient city of Salamis was founded in the 11th century BC and became the capital of Cyprus in the 8th century BC. Today, visitors can explore extensive ruins including a gymnasium, Roman baths, an amphitheater, and Byzantine basilicas.",
    rating: 4.7,
    tags: ["Historical", "Ancient", "Archaeological"],
    bestTime: "Spring (March-May) and Fall (September-November)",
    attractions: [
      "Roman Gymnasium with Marble Columns",
      "Byzantine Basilica",
      "Amphitheater",
      "Roman Baths",
      "Nearby Beach",
    ],
  },
  {
    id: 2,
    name: "Kyrenia Castle",
    lat: 35.3403,
    lng: 33.3195,
    description:
      "Kyrenia Castle is a 16th-century castle built by the Venetians over a previous Crusader fortification. Within its walls lies a twelfth-century chapel showing reused late Roman capitals, and the Shipwreck Museum.",
    fullDescription:
      "This impressive 16th-century castle dominates Kyrenia harbor and offers stunning views across the Mediterranean. Inside, you can find the Shipwreck Museum featuring a well-preserved merchant vessel from the 3rd century BC.",
    rating: 4.5,
    tags: ["Castle", "Museum", "Historical"],
    bestTime: "All year, but especially pleasant in spring and autumn",
    attractions: [
      "Shipwreck Museum",
      "Byzantine Church",
      "Dungeons",
      "Harbor Views",
      "Ottoman Period Architecture",
    ],
  },
  {
    id: 3,
    name: "Varosha",
    lat: 35.1186,
    lng: 33.9472,
    description:
      "Once a modern tourist area, Varosha became an abandoned district after the Turkish invasion of Cyprus in 1974. Parts of it have recently been reopened to visitors.",
    fullDescription:
      "Once a glamorous tourist destination, Varosha became a ghost town after the Turkish invasion of 1974. Recently partially reopened to visitors, it offers a unique glimpse into a frozen moment in time with abandoned hotels and streets.",
    rating: 4.2,
    tags: ["Historical", "Urban", "Beach"],
    bestTime: "Year-round, early morning visits recommended",
    attractions: [
      "Palm Beach",
      "Abandoned Luxury Hotels",
      "Historic Streets",
      "Photography Opportunities",
      "Cultural Significance",
    ],
  },
  {
    id: 4,
    name: "Bellapais Abbey",
    lat: 35.2881,
    lng: 33.3187,
    description:
      "A stunning Gothic abbey ruins located in the northern part of Cyprus. Built in the 13th century, it offers beautiful views of the surrounding landscape.",
    fullDescription:
      "This Gothic abbey was built in the 13th century by Augustinian monks and is considered the most beautiful Gothic building in Cyprus. The ruins are well-preserved and offer magnificent views of Kyrenia and the Mediterranean.",
    rating: 4.8,
    tags: ["Abbey", "Historical", "Architecture"],
    bestTime: "Spring and Autumn for ideal temperatures and blooming gardens",
    attractions: [
      "Gothic Architecture",
      "Refectory Hall",
      "Panoramic Views",
      "Tree of Idleness Café",
      "Regular Music Concerts",
    ],
  },
];

/**
 * Events data used throughout the application
 * @type {Array<Object>}
 */
export const eventsData = [
  {
    id: 1,
    name: "Daylight Festival",
    date: "31 March",
    price: "350 TL",
    description:
      "Experience the best electronic music with international and local DJs at this beachside festival.",
    fullDescription:
      "Experience the best electronic music with international and local DJs at this beachside festival. Featuring food vendors, art installations, and a vibrant atmosphere as you dance from day into night.",
    location: "Escape Beach Club, Kyrenia",
    coordinates: { lat: 35.356, lng: 33.203 }, // Added coordinates for map integration
    category: "Music",
    schedule: [
      "12:00 - Gates Open",
      "13:00 - First DJ Set",
      "17:00 - Headliner Performance",
      "22:00 - Closing Set",
    ],
  },
  {
    id: 2,
    name: "Collectivebeat Comedy",
    date: "31 March",
    price: "350 TL",
    description:
      "A night of laughs with local and international stand-up comedians.",
    fullDescription:
      "A night of laughs with local and international stand-up comedians. Enjoy dinner and drinks while being entertained by some of the best comedy talents from around the region.",
    location: "Colony Hotel, Kyrenia",
    coordinates: { lat: 35.3389, lng: 33.3197 },
    category: "Entertainment",
    schedule: [
      "19:00 - Doors Open",
      "19:30 - Dinner Service",
      "20:30 - Opening Act",
      "21:30 - Main Show",
    ],
  },
  {
    id: 3,
    name: "Korhan Sayginer",
    date: "12 April",
    price: "4000 TL",
    description:
      "Witness world champion billiards player Korhan Sayginer demonstrate his incredible skills.",
    fullDescription:
      "Witness world champion billiards player Korhan Sayginer demonstrate his incredible skills in this exhibition match. A rare opportunity to see one of the greatest players in the sport up close.",
    location: "Merit Royal Hotel, Kyrenia",
    coordinates: { lat: 35.3582, lng: 33.2098 },
    category: "Sports",
    schedule: [
      "18:00 - Exhibition Opens",
      "19:00 - Demonstration Begins",
      "20:30 - Q&A Session",
      "21:00 - Meet and Greet",
    ],
  },
  {
    id: 4,
    name: "Zeybek Halk",
    date: "20 April",
    price: "1575 TL",
    description:
      "Celebrate traditional Turkish and Cypriot folk dancing with this colorful and energetic performance.",
    fullDescription:
      "Celebrate traditional Turkish and Cypriot folk dancing with this colorful and energetic performance. The Zeybek dance group presents authentic costumes, music, and choreography in this cultural spectacle.",
    location: "Rauf Raif Denktaş Culture and Congress Center, Nicosia",
    coordinates: { lat: 35.1856, lng: 33.3823 },
    category: "Cultural",
    schedule: [
      "18:30 - Doors Open",
      "19:00 - Introduction to Folk Traditions",
      "19:30 - Main Performance",
      "21:00 - Audience Participation",
    ],
  },
];
export const API_KEYS = {
  GOOGLE_MAPS: "API_KEYS",
  GEMINI: "API_KEYS",
};

/**
 * Retrieves a location by its ID
 * @param {number} id - The location ID to find
 * @returns {Object|null} The location object or null if not found
 */
export const getLocationById = (id) => {
  if (typeof id === "string") id = parseInt(id, 10);
  return locationData.find((location) => location.id === id) || null;
};

/**
 * Retrieves an event by its ID
 * @param {number} id - The event ID to find
 * @returns {Object|null} The event object or null if not found
 */
export const getEventById = (id) => {
  if (typeof id === "string") id = parseInt(id, 10);
  return eventsData.find((event) => event.id === id) || null;
};

/**
 * Filters locations by tags
 * @param {Array<string>} tags - Array of tags to filter by
 * @returns {Array<Object>} Filtered array of locations
 */
export const getLocationsByTags = (tags) => {
  if (!tags || tags.length === 0) return locationData;

  return locationData.filter((location) =>
    location.tags.some((tag) => tags.includes(tag)),
  );
};

/**
 * Filters events by date range
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 * @returns {Array<Object>} Filtered array of events
 */
export const getEventsByDateRange = (startDate, endDate) => {
  // This is a simplified implementation
  // In a real app, you'd need proper date parsing/comparison
  return eventsData;
};

/**
 * Filters events by category
 * @param {string} category - Category to filter by
 * @returns {Array<Object>} Filtered array of events
 */
export const getEventsByCategory = (category) => {
  if (!category) return eventsData;
  return eventsData.filter((event) => event.category === category);
};

/**
 * Searches both locations and events
 * @param {string} query - Search query
 * @returns {Object} Object containing matching locations and events
 */
export const searchAll = (query) => {
  if (!query || query.trim() === "") {
    return { locations: [], events: [] };
  }

  const normalizedQuery = query.toLowerCase().trim();

  const locations = locationData.filter(
    (location) =>
      location.name.toLowerCase().includes(normalizedQuery) ||
      location.description.toLowerCase().includes(normalizedQuery) ||
      location.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
  );

  const events = eventsData.filter(
    (event) =>
      event.name.toLowerCase().includes(normalizedQuery) ||
      event.description.toLowerCase().includes(normalizedQuery) ||
      event.location.toLowerCase().includes(normalizedQuery) ||
      event.category.toLowerCase().includes(normalizedQuery),
  );

  return { locations, events };
};

export default {
  locationData,
  eventsData,
  API_KEYS,
  getLocationById,
  getEventById,
  getLocationsByTags,
  getEventsByDateRange,
  getEventsByCategory,
  searchAll,
};

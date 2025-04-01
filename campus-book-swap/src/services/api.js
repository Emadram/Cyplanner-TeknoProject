// src/services/api.js

const API_URL = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337';

/**
 * Fetch data from Strapi API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

/**
 * Book API endpoints
 */
export const bookAPI = {
  // Get featured books
  getFeaturedBooks: async () => {
    return fetchFromAPI('/api/books?populate=*&filters[featured]=true');
  },

  // Get popular books - just get all books for now and sort client-side if needed
  getPopularBooks: async () => {
    return fetchFromAPI('/api/books?populate=*');
  },

  // Get books of the week
  getBooksOfWeek: async () => {
    return fetchFromAPI('/api/books?populate=*&filters[bookOfWeek]=true');
  },

  // Get books of the year
  getBooksOfYear: async () => {
    return fetchFromAPI('/api/books?populate=*&filters[bookOfYear]=true');
  },

  // Get book categories
  getCategories: async () => {
    return fetchFromAPI('/api/categories');
  },

  // Get books by category - simplified syntax
  getBooksByCategory: async (categoryId) => {
    return fetchFromAPI(`/api/books?populate=*&filters[category]=${categoryId}`);
  },

  // Get a single book by ID
  getBookById: async (id) => {
    return fetchFromAPI(`/api/books/${id}?populate=*`);
  }
};

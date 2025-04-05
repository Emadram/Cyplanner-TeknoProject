import { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  // Auth hook must be called at the top level of your function component
  const { isAuthenticated } = useAuth();
  
  // State variables for data
  const [activeCategory, setActiveCategory] = useState('All Genres');
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // State for the API data
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [booksOfWeek, setBooksOfWeek] = useState([]);
  const [booksOfYear, setBooksOfYear] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    featured: true,
    popular: true,
    booksOfWeek: true,
    booksOfYear: true,
    categories: true
  });
  
  // Error states
  const [error, setError] = useState({
    featured: null,
    popular: null,
    booksOfWeek: null,
    booksOfYear: null,
    categories: null
  });

  // Add scrollbar hiding and animations
  const scrollbarHideStyle = `
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .animate-slideInRight {
      animation: slideInRight 0.4s ease-out forwards;
    }
  `;

  // Helper function to get image URL from Strapi data
  const getStrapiMediaUrl = (imageData) => {
    if (!imageData) return null;
    
    // Base URL (ensure it doesn't end with a slash)
    const baseUrl = (import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337').replace(/\/$/, '');
    
    try {
      // Case 1: String URL
      if (typeof imageData === 'string') {
        // Check if it's already an absolute URL
        if (imageData.startsWith('http')) return imageData;
        // Make sure the path starts with a slash
        const path = imageData.startsWith('/') ? imageData : `/${imageData}`;
        return `${baseUrl}${path}`;
      }
      
      // Case 2: Plain array 
      if (Array.isArray(imageData) && imageData.length > 0) {
        const firstImage = imageData[0];
        // If the array item has a formats property
        if (firstImage.formats) {
          const format = firstImage.formats.medium || firstImage.formats.small || firstImage.formats.thumbnail;
          if (format && format.url) {
            const path = format.url.startsWith('/') ? format.url : `/${format.url}`;
            return `${baseUrl}${path}`;
          }
        }
        
        // If the array item has a url property
        if (firstImage.url) {
          const path = firstImage.url.startsWith('/') ? firstImage.url : `/${firstImage.url}`;
          return `${baseUrl}${path}`;
        }
        
        // If it has a hash or provider property (newer Strapi versions)
        if (firstImage.hash && firstImage.provider) {
          // Construct URL from hash
          return `${baseUrl}/uploads/${firstImage.hash}${firstImage.ext}`;
        }
      }
      
      // Case 3: Strapi v4 format with data.attributes
      if (imageData.data && imageData.data.attributes) {
        const { url } = imageData.data.attributes;
        if (url) {
          const path = url.startsWith('/') ? url : `/${url}`;
          return `${baseUrl}${path}`;
        }
      }
      
      // Case 4: Direct object with formats
      if (imageData.formats) {
        const format = 
          imageData.formats.medium || 
          imageData.formats.small || 
          imageData.formats.thumbnail;
        if (format && format.url) {
          const path = format.url.startsWith('/') ? format.url : `/${format.url}`;
          return `${baseUrl}${path}`;
        }
        
        // Fallback to main URL if formats don't have URLs
        if (imageData.url) {
          const path = imageData.url.startsWith('/') ? imageData.url : `/${imageData.url}`;
          return `${baseUrl}${path}`;
        }
      }
      
      // Case 5: Direct URL property
      if (imageData.url) {
        const path = imageData.url.startsWith('/') ? imageData.url : `/${imageData.url}`;
        return `${baseUrl}${path}`;
      }
      
      // Case 6: Array in data
      if (imageData.data) {
        const data = Array.isArray(imageData.data) ? imageData.data[0] : imageData.data;
        if (data) {
          // With attributes (Strapi v4)
          if (data.attributes && data.attributes.url) {
            const path = data.attributes.url.startsWith('/') ? data.attributes.url : `/${data.attributes.url}`;
            return `${baseUrl}${path}`;
          }
          // Direct URL
          if (data.url) {
            const path = data.url.startsWith('/') ? data.url : `/${data.url}`;
            return `${baseUrl}${path}`;
          }
        }
      }
      
      // Case 7: Handle direct hash/ext pattern
      if (imageData.hash && imageData.ext) {
        return `${baseUrl}/uploads/${imageData.hash}${imageData.ext}`;
      }
      
      // Fallback
      console.warn('Could not process image data:', imageData);
      return null;
    } catch (err) {
      console.error('Error processing image URL:', err, imageData);
      return null;
    }
  };

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        setLoading(prev => ({ ...prev, categories: true }));
        const categoriesData = await bookAPI.getCategories();
        // Add "All Genres" option first
        const processedCategories = [
          { id: 'all', name: 'All Genres' },
          ...categoriesData.data.map(cat => ({
            id: cat.id,
            // Support both old Strapi v4 format and new flat structure
            name: cat.Type || (cat.attributes ? cat.attributes.name : cat.name)
          }))
        ];
        setCategories(processedCategories);
        setLoading(prev => ({ ...prev, categories: false }));
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(prev => ({ ...prev, categories: err.message }));
        setLoading(prev => ({ ...prev, categories: false }));
      }

      try {
        // Fetch featured books
        setLoading(prev => ({ ...prev, featured: true }));
        const featuredData = await bookAPI.getFeaturedBooks();
        setFeaturedBooks(mapBooksData(featuredData.data));
        setLoading(prev => ({ ...prev, featured: false }));
      } catch (err) {
        console.error('Error fetching featured books:', err);
        setError(prev => ({ ...prev, featured: err.message }));
        setLoading(prev => ({ ...prev, featured: false }));
      }

      try {
        // Fetch popular books
        setLoading(prev => ({ ...prev, popular: true }));
        const popularData = await bookAPI.getPopularBooks();
        setPopularBooks(mapBooksData(popularData.data));
        setLoading(prev => ({ ...prev, popular: false }));
      } catch (err) {
        console.error('Error fetching popular books:', err);
        setError(prev => ({ ...prev, popular: err.message }));
        setLoading(prev => ({ ...prev, popular: false }));
      }

      try {
        // Fetch books of the week
        setLoading(prev => ({ ...prev, booksOfWeek: true }));
        const weekBooksData = await bookAPI.getBooksOfWeek();
        setBooksOfWeek(mapBooksData(weekBooksData.data));
        setLoading(prev => ({ ...prev, booksOfWeek: false }));
      } catch (err) {
        console.error('Error fetching books of the week:', err);
        setError(prev => ({ ...prev, booksOfWeek: err.message }));
        setLoading(prev => ({ ...prev, booksOfWeek: false }));
      }

      try {
        // Fetch books of the year
        setLoading(prev => ({ ...prev, booksOfYear: true }));
        const yearBooksData = await bookAPI.getBooksOfYear();
        setBooksOfYear(mapBooksData(yearBooksData.data));
        setLoading(prev => ({ ...prev, booksOfYear: false }));
      } catch (err) {
        console.error('Error fetching books of the year:', err);
        setError(prev => ({ ...prev, booksOfYear: err.message }));
        setLoading(prev => ({ ...prev, booksOfYear: false }));
      }
    };

    fetchData();
  }, []);

  // Fetch books when category changes
  useEffect(() => {
    const fetchBooksByCategory = async () => {
      // Skip if "All Genres" is selected or categories aren't loaded yet
      if (activeCategory === 'All Genres' || categories.length <= 1) {
        return;
      }

      try {
        setLoading(prev => ({ ...prev, popular: true }));
        const categoryId = categories.find(cat => cat.name === activeCategory)?.id;
        
        if (categoryId && categoryId !== 'all') {
          const booksData = await bookAPI.getBooksByCategory(categoryId);
          setPopularBooks(mapBooksData(booksData.data));
        } else {
          // Fallback to popular books if category not found
          const popularData = await bookAPI.getPopularBooks();
          setPopularBooks(mapBooksData(popularData.data));
        }
        
        setLoading(prev => ({ ...prev, popular: false }));
      } catch (err) {
        console.error('Error fetching books by category:', err);
        setError(prev => ({ ...prev, popular: err.message }));
        setLoading(prev => ({ ...prev, popular: false }));
      }
    };

    fetchBooksByCategory();
  }, [activeCategory, categories]);

  // Auto slide effect for featured books
  useEffect(() => {
    if (featuredBooks.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === featuredBooks.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredBooks.length]);

  // Helper function to map Strapi data structure to component data structure
  const mapBooksData = (books) => {
    if (!books || !Array.isArray(books)) {
      console.error('Invalid books data:', books);
      return [];
    }

    return books.map(book => {
      if (!book) {
        console.error('Invalid book data:', book);
        return null;
      }

      // Handle both Strapi v4 format and flat structure
      const bookData = book.attributes || book;
      
      // Process cover image with proper error handling
      let coverUrl = null;
      if (bookData.cover) {
        coverUrl = getStrapiMediaUrl(bookData.cover);
      }
      
      // Map book data
      const mappedBook = {
        id: book.id,
        title: bookData.title,
        author: bookData.author,
        summary: bookData.description,
        rating: bookData.rating,
        voters: bookData.votersCount || 0,
        condition: bookData.condition,
        exchange: bookData.exchange,
        subject: bookData.subject,
        course: bookData.course,
        seller: bookData.seller,
        cover: coverUrl,
        // Also use the same URL for img property
        img: coverUrl,
      };
      
      // Map display title for featured books
      if (bookData.displayTitle) {
        try {
          // Try parsing if stored as JSON string
          mappedBook.displayTitle = JSON.parse(bookData.displayTitle);
        } catch (err) {
          // Fallback: split by space if not valid JSON
          console.log('Display title parse error:', err);
          const parts = bookData.displayTitle.split(' ');
          // If we have multiple parts, use first two, otherwise duplicate
          if (parts.length > 1) {
            mappedBook.displayTitle = [parts[0], parts.slice(1).join(' ')];
          } else {
            mappedBook.displayTitle = [bookData.displayTitle, bookData.displayTitle];
          }
        }
      } else {
        // Fallback display title from book title
        const titleParts = bookData.title.split(' ');
        if (titleParts.length > 1) {
          mappedBook.displayTitle = [titleParts[0], titleParts.slice(1).join(' ')];
        } else {
          mappedBook.displayTitle = [bookData.title, 'Book'];
        }
      }
      
      // Map likes - handling both formats
      mappedBook.likes = [];
      if (bookData.likes) {
        const likesData = bookData.likes.data || bookData.likes;
        if (Array.isArray(likesData)) {
          mappedBook.likes = likesData.map(like => {
            // Handle both formats
            const likeData = like.attributes || like;
            const avatar = likeData.avatar?.data || likeData.avatar;
            let avatarUrl = '';
            
            if (avatar) {
              avatarUrl = getStrapiMediaUrl(avatar);
            }
              
            return {
              id: like.id,
              name: likeData.username || 'User',
              img: avatarUrl || 'https://via.placeholder.com/150'
            };
          });
        }
      }
      
      // For books of year/week - add name property for consistency
      mappedBook.name = bookData.title;
      
      return mappedBook;
    }).filter(Boolean); // Remove any null entries
  };

  // COMPONENT: Hero Section with Centered Information
  const HeroSection = () => {
    // Skip if no featured books or loading
    if (loading.featured) {
      return (
        <div className="relative py-12 px-4 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-3xl mx-4 my-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse text-center">
              <div className="h-8 bg-white/30 rounded w-1/4 mb-6 mx-auto"></div>
              <div className="h-4 bg-white/20 rounded w-3/4 mb-8 mx-auto"></div>
              <div className="h-64 bg-white/10 rounded-xl max-w-md mx-auto"></div>
            </div>
          </div>
        </div>
      );
    }
    
    if (error.featured) {
      return (
        <div className="relative py-12 px-4 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-3xl mx-4 my-4">
          <div className="max-w-6xl mx-auto text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Could not load featured books</h2>
            <p className="text-white/80">{error.featured}</p>
          </div>
        </div>
      );
    }
    
    if (featuredBooks.length === 0) {
      return (
        <div className="relative py-12 px-4 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-3xl mx-4 my-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Discover Books to Exchange</h2>
            <p className="mb-6">No featured books available. Check back soon for our top picks!</p>
            <button className="px-6 py-3 bg-white text-blue-700 rounded-full font-medium hover:bg-blue-50">Browse All Books</button>
          </div>
        </div>
      );
    }
    
    const book = featuredBooks[currentSlide];
    
    const nextSlide = () => {
      if (featuredBooks.length === 0) return;
      setCurrentSlide(prev => (prev === featuredBooks.length - 1 ? 0 : prev + 1));
    };
    
    const prevSlide = () => {
      if (featuredBooks.length === 0) return;
      setCurrentSlide(prev => (prev === 0 ? featuredBooks.length - 1 : prev - 1));
    };
    
    return (
      <div className="relative py-12 px-4 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-3xl mx-4 my-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <svg viewBox="0 0 100 100" fill="white">
            <path d="M96.4,0H0v100h100V3.6C100,1.6,98.4,0,96.4,0z" />
          </svg>
        </div>
        
        {/* Navigation buttons - repositioned to sides */}
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-blue-300 hover:bg-blue-700 transition-colors z-10"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-blue-300 hover:bg-blue-700 transition-colors z-10"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center animate-slideInRight">
            {/* Featured tag & title centered */}
            <div className="inline-block px-3 py-1 rounded-full bg-blue-400 bg-opacity-30 text-blue-100 font-medium text-sm mb-4">
              Featured Book
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{book.title}</h1>
            <p className="text-blue-100 mb-6 text-lg">by {book.author}</p>
            
            {/* Book cover with increased roundness - centered */}
            <div className="relative mb-8">
              <div className="transform rotate-[-6deg] transition-transform duration-500 hover:rotate-0">
                {book.cover ? (
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-56 h-80 object-cover rounded-3xl shadow-2xl" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/224x320';
                    }}
                  />
                ) : (
                  <div className="w-56 h-80 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl shadow-2xl flex items-center justify-center">
                    <div className="text-white text-center font-serif px-6">
                      <div className="text-sm tracking-wide">A COURT OF</div>
                      <div className="text-2xl mt-2 mb-3 font-bold">{book.displayTitle?.[0]}</div>
                      <div className="text-sm tracking-wide">AND</div>
                      <div className="text-2xl mt-2 mb-3 font-bold">{book.displayTitle?.[1]}</div>
                      <div className="text-xs tracking-wider mt-4">{book.author?.toUpperCase()}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Decorative element also rounded */}
              <div className="absolute -bottom-4 -right-4 w-56 h-80 border-2 border-blue-300 rounded-3xl"></div>
            </div>
            
            {/* Description and review stats */}
            <div className="max-w-lg mx-auto">
              <p className="text-blue-200 mb-6 line-clamp-3">{book.summary}</p>
              
              <div className="flex items-center justify-center mb-6">
                <div className="flex mr-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= Math.floor(book.rating || 0) ? "text-yellow-300" : "text-blue-300"}>★</span>
                  ))}
                </div>
                <span className="text-blue-200 text-sm">{book.voters || 0} reviews</span>
              </div>
              
              <button 
                onClick={() => setSelectedBook(book)} 
                className="px-6 py-3 bg-white text-blue-700 rounded-full font-medium shadow-lg hover:bg-blue-50 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
          
          {/* Indicator dots at bottom */}
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {featuredBooks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-white' : 'bg-blue-300 bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this after the hero section in Home.jsx
  const ActionHeader = () => {
    return (
      <div className="bg-white shadow-md rounded-xl mx-4 -mt-6 relative z-20 mb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
              <div className="action-card p-4 bg-blue-50 rounded-lg flex items-center w-full sm:w-40 transition-all hover:bg-blue-100">
                <div className="rounded-full bg-blue-100 p-3 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Swap</h3>
                  <p className="text-xs text-gray-500">Exchange books</p>
                </div>
              </div>
              
              <div className="action-card p-4 bg-green-50 rounded-lg flex items-center w-full sm:w-40 transition-all hover:bg-green-100">
                <div className="rounded-full bg-green-100 p-3 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sell</h3>
                  <p className="text-xs text-gray-500">Sell your books</p>
                </div>
              </div>
              
              <div className="action-card p-4 bg-purple-50 rounded-lg flex items-center w-full sm:w-40 transition-all hover:bg-purple-100">
                <div className="rounded-full bg-purple-100 p-3 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Borrow</h3>
                  <p className="text-xs text-gray-500">Borrow books</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by course, book title, or ISBN..." 
                  className="px-4 py-2 pl-10 pr-4 rounded-full bg-gray-100 border border-gray-200 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  
  // Campus Stats Component
  const CampusStatsSection = () => {
    return (
      <div className="py-10 px-4 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Campus BookSwap Stats</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100">Active Books</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-bold mb-2">$14,500</div>
              <div className="text-blue-100">Student Savings</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-bold mb-2">520</div>
              <div className="text-blue-100">Completed Swaps</div>
            </div>
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-bold mb-2">345</div>
              <div className="text-blue-100">Active Borrowers</div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-lg mb-6 max-w-xl mx-auto text-blue-100">
              Join thousands of students saving money by swapping, borrowing, and buying books directly from other students.
            </p>
            <button className="px-6 py-3 bg-white text-blue-700 rounded-full font-medium hover:bg-blue-50 transition-colors shadow-md">
              Join BookSwap Today
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Testimonials Component
  const TestimonialsSection = () => {
    const testimonials = [
      {
        id: 1,
        name: "Sarah Johnson",
        major: "Computer Science",
        year: "Junior",
        text: "I saved over $300 last semester by swapping and borrowing textbooks on BookSwap. The platform is super easy to use and I've met some great people from my major!",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        id: 2,
        name: "Michael Chen",
        major: "Business Administration",
        year: "Senior",
        text: "As a senior, I had a lot of books collecting dust. I've sold 12 books so far and made enough to cover my coffee budget for the entire semester!",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        id: 3,
        name: "Leila Patel",
        major: "Biology",
        year: "Sophomore",
        text: "The borrowing feature is perfect for those one-time courses. I borrowed three lab manuals last term and saved a ton of money on books I would have only used once.",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg"
      }
    ];
    
    return (
      <div className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">What Students Are Saying</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied students who are saving money and helping each other succeed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-gray-50 rounded-xl p-6 shadow-sm relative">
                {/* Quote mark decorative element */}
                <div className="absolute top-4 right-4 text-5xl text-gray-200 font-serif">"</div>
                
                <p className="text-gray-700 mb-6 relative z-10">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.major}, {testimonial.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Share Your Experience
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function for time ago display
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  // COMPONENT: Featured Book component
  const FeaturedBook = ({ book }) => (
    <div 
      className="featured-book p-3 cursor-pointer group" 
      onClick={() => setSelectedBook(book)}
    >
      <div className="relative overflow-hidden rounded-lg shadow-md mb-2">
        {book.img ? (
          <img 
            src={book.img} 
            alt={book.name} 
            className="w-full h-40 object-cover transition duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150';
            }}
          />
        ) : (
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-full h-40 flex items-center justify-center transition duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-xl">{book.name?.substring(0, 1)}</span>
          </div>
        )}
        
        {/* Overlay with book info that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold line-clamp-1 text-sm">{book.name}</h3>
          <p className="text-gray-300 text-xs">{book.author}</p>
        </div>
        
        {/* Rating badge */}
        {book.rating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded text-gray-800 shadow-sm">
            {book.rating.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <h3 className="text-sm font-medium line-clamp-1 group-hover:text-blue-600 transition-colors">{book.name}</h3>
        <p className="text-xs text-gray-500">{book.author}</p>
      </div>
    </div>
  );

  // COMPONENT: Book Card for Popular Books
// Replace the BookCard component with this enhanced version
const BookCard = ({ book }) => {
  // Determine the book's status (random for demo purposes)
  const statuses = ['For Sale', 'For Swap', 'For Borrowing'];
  const statusIndex = book.id % 3; // Just for demo
  const status = statuses[statusIndex];
  
  // Set status styles
  const statusStyles = {
    'For Sale': 'bg-green-100 text-green-800 border-green-200',
    'For Swap': 'bg-blue-100 text-blue-800 border-blue-200',
    'For Borrowing': 'bg-purple-100 text-purple-800 border-purple-200'
  };
  
  // Set icon based on status
  const statusIcons = {
    'For Sale': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'For Swap': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    'For Borrowing': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    )
  };
  
  // Generate random price (for demo purposes)
  const price = status === 'For Sale' ? `$${(10 + book.id % 30).toFixed(2)}` : null;
  
  // Generate a course code (for demo purposes)
  const courseCode = `${['CS', 'MATH', 'BIO', 'CHEM', 'ENG'][book.id % 5]}${101 + (book.id % 400)}`;
  
  // Add a timestamp (for demo purposes)
  const postedDate = new Date();
  postedDate.setDate(postedDate.getDate() - (book.id % 30));
  const timeAgo = getTimeAgo(postedDate);
  
  return (
    <div 
      className="book-card bg-white rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] cursor-pointer group" 
      onClick={() => setSelectedBook(book)}
    >
      {/* Status badge */}
      <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusStyles[status]} border`}>
        {statusIcons[status]}
        {status}
      </div>
      
      <div className="content-wrapper flex p-5 border-b border-gray-100 relative">
        {/* Book cover with improved hover effects */}
        <div className="relative overflow-hidden rounded-xl shadow-md">
          {book.cover ? (
            <img 
              src={book.cover} 
              alt={book.title} 
              className="book-card-img w-24 h-36 object-cover transition duration-300 group-hover:scale-110" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          ) : (
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-24 h-36 flex items-center justify-center transition duration-300 group-hover:scale-110 rounded-xl">
              <span className="text-white font-bold text-xl">{book.title?.substring(0, 1)}</span>
            </div>
          )}
          
          {/* Condition indicator */}
          <div className="absolute bottom-0 right-0 bg-white rounded-tl-lg px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            {book.condition || 'Good'}
          </div>
          
          {/* Rating badge */}
          {book.rating && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded-bl text-gray-800">
              {book.rating.toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="card-content ml-5 flex-grow overflow-hidden">
          <h3 className="book-name font-medium text-gray-800 mb-1 truncate group-hover:text-blue-600 transition-colors">{book.title}</h3>
          <p className="book-by text-gray-500 text-sm mb-2">by {book.author}</p>
          
          {/* Rating stars with better spacing */}
          <div className="flex items-center mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-sm ${star <= Math.floor(book.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
              ))}
            </div>
            <span className="text-gray-400 text-xs ml-2">{book.voters || 0} voters</span>
          </div>
          
          {/* Book details with improved visual separation */}
          <div className="book-details space-y-1 mb-2">
            {status === 'For Sale' && (
              <p className="text-sm font-semibold text-green-700">{price}</p>
            )}
            <p className="text-sm"><span className="font-medium text-gray-700">Course:</span> <span className="text-gray-600">{courseCode}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Subject:</span> <span className="text-gray-600">{book.subject || "General"}</span></p>
            <p className="text-xs text-gray-400 mt-2">Posted {timeAgo}</p>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex border-t border-gray-100 divide-x divide-gray-100">
        <button className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contact
        </button>
        <button className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Save
        </button>
        <button className="flex-1 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
      </div>
      
      {/* Likes section with improved appearance */}
      {book.likes?.length > 0 && (
        <div className="likes flex items-center p-3 bg-gray-50 group-hover:bg-blue-50 transition-colors">
          <div className="flex -space-x-2">
            {book.likes.slice(0, 3).map(like => (
              <div key={like.id} className="like-profile">
                <img 
                  src={like.img} 
                  alt={like.name} 
                  className="like-img w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
            ))}
          </div>
          <div className="like-name text-gray-500 text-xs ml-3">
            <span className="font-semibold">{book.likes[0]?.name}</span>
            {book.likes.length > 1 && <span> and <span className="font-semibold">{book.likes.length - 1} other {book.likes.length > 2 ? 'people' : 'person'}</span> liked this</span>}
          </div>
        </div>
      )}
    </div>
  );
};


  // COMPONENT: Book Detail Modal
  const BookDetails = ({ book, onClose }) => {
    // State for active tab
    const [activeTab, setActiveTab] = useState('details');
    
    // Determine the book's status (random for demo purposes)
    const statuses = ['For Sale', 'For Swap', 'For Borrowing'];
    const statusIndex = book.id % 3; // Just for demo
    const status = statuses[statusIndex];
    
    // Set status styles
    const statusStyles = {
      'For Sale': 'bg-green-100 text-green-800',
      'For Swap': 'bg-blue-100 text-blue-800',
      'For Borrowing': 'bg-purple-100 text-purple-800'
    };
    
    // Generate random price (for demo purposes)
    const price = status === 'For Sale' ? `$${(10 + book.id % 30).toFixed(2)}` : null;
    
    // Generate a course code (for demo purposes)
    const courseCode = `${['CS', 'MATH', 'BIO', 'CHEM', 'ENG'][book.id % 5]}${101 + (book.id % 400)}`;
    
    // Generate seller details (for demo purposes)
    const seller = {
      name: book.seller || 'John Doe',
      rating: (3 + (book.id % 3)) + (book.id % 10) / 10,
      transactions: 5 + (book.id % 20),
      responseTime: '< 1 hour',
      joinedDate: 'Jan 2023',
      location: 'North Campus Library'
    };
    
    // Borrowing details (for demo)
    const borrowingDetails = {
      durationOptions: ['1 week', '2 weeks', '1 month'],
      deposit: '$20.00',
      availableFrom: 'May 15, 2023'
    };
    
    // Actions based on status
    const actions = {
      'For Sale': {
        primary: 'Buy Now',
        secondary: 'Make Offer'
      },
      'For Swap': {
        primary: 'Propose Swap',
        secondary: 'View Wishlist'
      },
      'For Borrowing': {
        primary: 'Borrow Now',
        secondary: 'Reserve'
      }
    };
    const CampusStatsSection = () => {
      return (
        <div className="py-10 px-4 bg-blue-600 text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Campus BookSwap Stats</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-bold mb-2">1,200+</div>
                <div className="text-blue-100">Active Books</div>
              </div>
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-bold mb-2">$14,500</div>
                <div className="text-blue-100">Student Savings</div>
              </div>
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-bold mb-2">520</div>
                <div className="text-blue-100">Completed Swaps</div>
              </div>
              <div className="stat-card">
                <div className="text-3xl md:text-4xl font-bold mb-2">345</div>
                <div className="text-blue-100">Active Borrowers</div>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <p className="text-lg mb-6 max-w-xl mx-auto text-blue-100">
                Join thousands of students saving money by swapping, borrowing, and buying books directly from other students.
              </p>
              <button className="px-6 py-3 bg-white text-blue-700 rounded-full font-medium hover:bg-blue-50 transition-colors shadow-md">
                Join BookSwap Today
              </button>
            </div>
          </div>
        </div>
      );
    };

    const PopularCategoriesSection = () => {
      const popularCategories = [
        { name: 'Computer Science', icon: 'laptop-code', bookCount: 284, color: 'bg-blue-100 text-blue-600' },
        { name: 'Business', icon: 'briefcase', bookCount: 205, color: 'bg-yellow-100 text-yellow-600' },
        { name: 'Mathematics', icon: 'square-root-alt', bookCount: 176, color: 'bg-purple-100 text-purple-600' },
        { name: 'Engineering', icon: 'tools', bookCount: 153, color: 'bg-red-100 text-red-600' },
        { name: 'Biology', icon: 'dna', bookCount: 142, color: 'bg-green-100 text-green-600' },
        { name: 'Psychology', icon: 'brain', bookCount: 124, color: 'bg-indigo-100 text-indigo-600' },
        { name: 'Literature', icon: 'book-open', bookCount: 115, color: 'bg-pink-100 text-pink-600' },
        { name: 'Chemistry', icon: 'flask', bookCount: 98, color: 'bg-teal-100 text-teal-600' }
      ];
      
      // Helper function to render FA-like icons (simplified, you'd use real icons in production)
      const renderIcon = (icon) => {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      };
      
      return (
        <div className="py-10 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Popular Course Categories</h2>
              <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-800">
                View All Categories →
              </a>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCategories.map(category => (
                <div key={category.name} className="category-card bg-white rounded-xl p-4 shadow-sm transition-all hover:shadow-md cursor-pointer">
                  <div className="flex items-center mb-3">
                    <div className={`rounded-full p-2 ${category.color}`}>
                      {renderIcon(category.icon)}
                    </div>
                    <h3 className="font-medium ml-3 text-gray-800">{category.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{category.bookCount} books available</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
    const TestimonialsSection = () => {
      const testimonials = [
        {
          id: 1,
          name: "Sarah Johnson",
          major: "Computer Science",
          year: "Junior",
          text: "I saved over $300 last semester by swapping and borrowing textbooks on BookSwap. The platform is super easy to use and I've met some great people from my major!",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
          id: 2,
          name: "Michael Chen",
          major: "Business Administration",
          year: "Senior",
          text: "As a senior, I had a lot of books collecting dust. I've sold 12 books so far and made enough to cover my coffee budget for the entire semester!",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
          id: 3,
          name: "Leila Patel",
          major: "Biology",
          year: "Sophomore",
          text: "The borrowing feature is perfect for those one-time courses. I borrowed three lab manuals last term and saved a ton of money on books I would have only used once.",
          avatar: "https://randomuser.me/api/portraits/women/68.jpg"
        }
      ];
      
      return (
        <div className="py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">What Students Are Saying</h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied students who are saving money and helping each other succeed.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="bg-gray-50 rounded-xl p-6 shadow-sm relative">
                  {/* Quote mark decorative element */}
                  <div className="absolute top-4 right-4 text-5xl text-gray-200 font-serif">"</div>
                  
                  <p className="text-gray-700 mb-6 relative z-10">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.major}, {testimonial.year}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Share Your Experience
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    return (
      <div 
        className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
        onClick={onClose} // Close when clicking the backdrop
      >
        <div 
          className="bg-white rounded-2xl max-w-4xl w-full p-0 max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the card
        >
          {/* Header with book title and close button */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-gray-800">{book.title}</h2>
                <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                  {status}
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none rounded-full p-1 hover:bg-gray-100"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`py-3 px-6 focus:outline-none ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Book Details
              </button>
              <button
                className={`py-3 px-6 focus:outline-none ${
                  activeTab === 'seller'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('seller')}
              >
                Seller Information
              </button>
              {book.likes && book.likes.length > 0 && (
                <button
                  className={`py-3 px-6 focus:outline-none ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({book.likes.length})
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex flex-col md:flex-row">
            {/* Left column - consistent across tabs */}
            <div className="w-full md:w-1/3 border-r border-gray-200 p-6">
              <div className="flex justify-center">
                <div className="relative">
                  {book.cover ? (
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-40 h-56 object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-md w-40 h-56 flex items-center justify-center">
                      <div className="text-white text-center font-serif px-2">
                        <div className="text-xs tracking-wide">A COURT OF</div>
                        <div className="text-lg font-bold my-1">{book.displayTitle?.[0]}</div>
                        <div className="text-xs tracking-wide">AND</div>
                        <div className="text-lg font-bold my-1">{book.displayTitle?.[1]}</div>
                        <div className="text-xs mt-2">{book.author?.toUpperCase()}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Rating badge */}
                  {book.rating && (
                    <div className="absolute -bottom-3 -right-3 bg-yellow-400 rounded-full h-10 w-10 flex items-center justify-center text-gray-800 font-bold text-sm shadow-md">
                      {book.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-1 text-center">{book.title}</h3>
              <p className="text-gray-500 text-sm mb-4 text-center">by {book.author}</p>
              
              <div className="flex justify-center items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= Math.floor(book.rating || 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                </div>
                <span className="text-gray-500 text-xs ml-2">{book.voters || 0} voters</span>
              </div>
              
              {/* Price and transaction section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {status === 'For Sale' && (
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-green-600">{price}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {actions[status].primary}
                  </button>
                  <button className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                    {actions[status].secondary}
                  </button>
                  <button className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message Seller
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right column - tab content */}
            <div className="w-full md:w-2/3 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Book Details Tab */}
              {activeTab === 'details' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Book Information</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Course:</span> 
                          <span className="text-gray-600">{courseCode}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Subject:</span> 
                          <span className="text-gray-600">{book.subject || "General"}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Condition:</span> 
                          <span className="text-gray-600">{book.condition || "Good"}</span>
                        </p>
                        {status === 'For Swap' && (
                          <p className="flex justify-between">
                            <span className="font-medium text-gray-700">Exchange For:</span> 
                            <span className="text-gray-600">{book.exchange || "Literature books"}</span>
                          </p>
                        )}
                        {status === 'For Borrowing' && (
                          <>
                            <p className="flex justify-between">
                              <span className="font-medium text-gray-700">Duration:</span> 
                              <span className="text-gray-600">{borrowingDetails.durationOptions.join(' / ')}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium text-gray-700">Deposit:</span> 
                              <span className="text-gray-600">{borrowingDetails.deposit}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium text-gray-700">Available From:</span> 
                              <span className="text-gray-600">{borrowingDetails.availableFrom}</span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Transaction Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Pick-up Location:</span> 
                          <span className="text-gray-600">{seller.location}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Payment Methods:</span> 
                          <span className="text-gray-600">Cash, Venmo, PayPal</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Listed On:</span> 
                          <span className="text-gray-600">April 2, 2023</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-800 mb-3">Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {book.summary || "No description provided."}
                    </p>
                  </div>
                  
                  {/* Additional book details like ISBN, publisher, etc */}
                  <div className="mt-6 text-sm text-gray-500">
                    <p>ISBN: 978-1234567890</p>
                    <p>Publisher: Academic Press</p>
                    <p>Edition: 4th Edition (2022)</p>
                    <p>Pages: 452</p>
                  </div>
                </div>
              )}
              
              {/* Seller Information Tab */}
              {activeTab === 'seller' && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center text-blue-600 text-xl font-bold">
                      {seller.name.substring(0, 1)}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-lg">{seller.name}</h3>
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={star <= Math.floor(seller.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                        <span className="text-gray-500 text-xs ml-2">{seller.rating.toFixed(1)} ({seller.transactions} transactions)</span>
                      </div>
                      <p className="text-sm text-gray-500">Member since {seller.joinedDate}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">Response Time</h4>
                        <span className="text-green-600 font-medium">{seller.responseTime}</span>
                      </div>
                      <p className="text-sm text-gray-500">Typically responds very quickly</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">Completed Transactions</h4>
                        <span className="text-blue-600 font-medium">{seller.transactions}</span>
                      </div>
                      <p className="text-sm text-gray-500">Experienced campus seller</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-800 mb-3">Seller's Other Books</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Sample other books */}
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <div className="w-12 h-16 bg-gray-200 rounded"></div>
                            <div className="ml-3">
                              <h5 className="text-sm font-medium line-clamp-1">Another Book Title</h5>
                              <p className="text-xs text-gray-500">{status}</p>
                              {status === 'For Sale' && (
                                <p className="text-xs font-medium text-green-600">{price}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Reviews Tab */}
              {activeTab === 'reviews' && book.likes && (
                <div>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">Reviews</h4>
                    {book.likes.length > 0 ? (
                      <div className="space-y-4">
                        {book.likes.map(like => (
                          <div key={like.id} className="border-b border-gray-100 pb-4">
                            <div className="flex items-center mb-2">
                              <img 
                                src={like.img} 
                                alt={like.name} 
                                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/150';
                                }}
                              />
                              <div className="ml-3">
                                <h5 className="font-medium text-gray-700">{like.name}</h5>
                                <div className="flex items-center">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <span key={star} className={star <= Math.floor(4 + (like.id % 2)) ? "text-yellow-400" : "text-gray-300"}>★</span>
                                    ))}
                                  </div>
                                  <span className="text-gray-500 text-xs ml-2">March 15, 2023</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Great book! {like.id % 2 === 0 ? "The seller was very responsive and the book was in perfect condition." : "I would highly recommend this book to anyone studying this subject."}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No reviews yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // COMPONENT: Featured Books Row
  const FeaturedBooksRow = ({ books, title, icon, loading: isLoading, error: rowError }) => {
    if (isLoading) {
      return (
        <div className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-40 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (rowError) {
      return (
        <div className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">{title}</h3>
              <p className="text-sm">{rowError}</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (books.length === 0) {
      return (
        <div className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold mb-6 flex items-center text-gray-700">
              {icon}
              {title}
            </h2>
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No books available in this category</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
            {icon}
            {title}
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map(book => (
              <FeaturedBook key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // COMPONENT: Category Tabs
  const CategoryTabs = () => {
    if (loading.categories) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4 overflow-x-auto animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                activeCategory === category.name
                  ? 'bg-blue-600 text-white font-medium shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // MAIN RENDER
  return (
    <div className="book-store bg-gray-100 min-h-screen">
      {/* Add custom style for scrollbar hiding and animations */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyle }} />
  
      {/* Hero Section with Featured Book */}
      <HeroSection />
      
      {/* Action Cards Header */}
      <ActionHeader />
      
      {/* Favorite Books - Only shown when user is authenticated */}
      {isAuthenticated && (
        <FeaturedBooksRow 
          books={booksOfWeek}
          title="Favorite Books"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          loading={loading.booksOfWeek}
          error={error.booksOfWeek}
        />
      )}
      
      {/* Popular Categories Section */}
      <PopularCategoriesSection />
      
      {/* Main Content Area with Categories and Popular Books */}
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Books by Genre
          </h2>
          
          {/* Category Selection */}
          <CategoryTabs />
          
          {/* Popular Books Grid */}
          <div className="popular-books bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium text-lg mb-6 text-gray-800">
              {activeCategory === 'All Genres' ? 'Popular Books' : `Popular in ${activeCategory}`}
            </h3>
            
            {/* Book Cards */}
            {loading.popular ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="p-5 border-b border-gray-100 flex">
                      <div className="w-24 h-36 bg-gray-200 rounded"></div>
                      <div className="ml-5 flex-grow">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error.popular ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                <p className="text-center">{error.popular}</p>
              </div>
            ) : popularBooks.length > 0 ? (
              <div className="book-cards grid grid-cols-1 sm:grid-cols-2 gap-6">
                {popularBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No books available for this category
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Campus Stats Section */}
      <CampusStatsSection />
      
      {/* Student Testimonials */}
      <TestimonialsSection />
      
      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetails book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default Home;
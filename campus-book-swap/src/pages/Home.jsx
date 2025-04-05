import { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';

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
`;

const Home = () => {
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

  // COMPONENT: Hero Section with Featured Book
// COMPONENT: Hero Section with Featured Book
const HeroSection = () => {
  // Skip if no featured books or loading
  if (loading.featured) {
    return (
      <div className="relative py-12 px-4 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-3xl mx-4 my-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/30 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-white/20 rounded w-3/4 mb-8"></div>
            <div className="h-64 bg-white/10 rounded-xl"></div>
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
        <div className="flex flex-col md:flex-row items-center animate-slideInRight">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-400 bg-opacity-30 text-blue-100 font-medium text-sm mb-4">
              Featured Book
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{book.title}</h1>
            <p className="text-blue-100 mb-6 text-lg">by {book.author}</p>
            <p className="text-blue-200 mb-6 line-clamp-3">{book.summary}</p>
            
            <div className="flex items-center mb-6">
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
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              {/* Book cover with increased roundness */}
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
  const BookCard = ({ book }) => (
    <div 
      className="book-card bg-white rounded-lg shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] cursor-pointer group" 
      onClick={() => setSelectedBook(book)}
    >
      <div className="content-wrapper flex p-5 border-b border-gray-100 relative">
        {/* Book cover/image with improved hover effects */}
        <div className="relative overflow-hidden rounded shadow-md">
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
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-24 h-36 flex items-center justify-center transition duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-xl">{book.title?.substring(0, 1)}</span>
            </div>
          )}
          {/* Add rating badge */}
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
          <div className="flex items-center mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-sm ${star <= Math.floor(book.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
              ))}
            </div>
            <span className="text-gray-400 text-xs ml-2">{book.voters || 0} voters</span>
          </div>
          
          {/* Book details with improved visual separation */}
          <div className="book-details space-y-1 mb-2">
            <p className="text-sm"><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-600">{book.subject || "Fiction"}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Exchange:</span> <span className="text-gray-600">{book.exchange || "Trade"}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Condition:</span> <span className="text-gray-600">{book.condition}</span></p>
          </div>
        </div>
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

// COMPONENT: Book Detail Modal with Improved UX
const BookDetails = ({ book, onClose }) => (
  <div 
    className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
    onClick={onClose} // Close when clicking the backdrop
  >
    <div 
      className="bg-white rounded-2xl max-w-lg w-full p-0 max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the card
    >
      {/* Header with book title and close button */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{book.title}</h2>
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
      
      <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
        {/* Book cover and key details */}
        <div className="flex mb-6">
          <div className="relative mr-6 flex-shrink-0">
            {book.cover ? (
              <img 
                src={book.cover} 
                alt={book.title} 
                className="w-32 h-48 object-cover rounded-xl shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-md w-32 h-48 flex items-center justify-center">
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
          
          <div className="flex-grow">
            <h3 className="text-lg font-medium text-gray-800 mb-1">{book.title}</h3>
            <p className="text-gray-500 text-sm mb-3">by {book.author}</p>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={star <= Math.floor(book.rating || 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
                ))}
              </div>
              <span className="text-gray-500 text-xs ml-2">{book.voters || 0} voters</span>
            </div>
            
            <div className="space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="font-medium text-gray-700">Seller:</span> 
                <span className="text-gray-600">{book.seller}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-gray-700">Condition:</span> 
                <span className="text-gray-600">{book.condition}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-gray-700">Exchange:</span> 
                <span className="text-gray-600">{book.exchange}</span>
              </p>
              {book.course && (
                <p className="flex justify-between">
                  <span className="font-medium text-gray-700">Course:</span> 
                  <span className="text-gray-600">{book.course}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span className="font-medium text-gray-700">Subject:</span> 
                <span className="text-gray-600">{book.subject}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Book description with custom styling */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-2">Description</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{book.summary}</p>
        </div>
        
        {/* Likes section with improved visual style */}
        {book.likes?.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-800 mb-3">Liked by</h4>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {book.likes.map(like => (
                  <div key={like.id} className="like-profile">
                    <img 
                      src={like.img} 
                      alt={like.name} 
                      className="like-img w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="like-name text-gray-600 text-sm ml-3">
                <span className="font-semibold">{book.likes[0]?.name}</span>
                {book.likes.length > 1 && <span> and <span className="font-semibold">{book.likes.length - 1} other {book.likes.length > 2 ? 'people' : 'person'}</span></span>}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Action buttons with improved style */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
          Contact Seller
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Request Exchange
        </button>
      </div>
    </div>
  </div>
);

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
      
      {/* Featured Books Row (Books of the Week) */}
      <FeaturedBooksRow 
        books={booksOfWeek}
        title="Books of the Week"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        }
        loading={loading.booksOfWeek}
        error={error.booksOfWeek}
      />
      
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
      
      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetails book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default Home;
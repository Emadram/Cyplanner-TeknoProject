import { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';

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

  // Debug image loading function
  const debugImageUrl = (label, imageData, processedUrl) => {
    console.log(`[Image Debug] ${label}:`, {
      originalData: imageData,
      processedUrl: processedUrl,
      dataType: typeof imageData
    });
    
    // Test if the image actually loads
    if (processedUrl) {
      const img = new Image();
      img.onload = () => console.log(`[Image Debug] ${label}: Image loaded successfully`);
      img.onerror = (e) => console.log(`[Image Debug] ${label}: Failed to load image`, e);
      img.src = processedUrl;
    }
  };
  
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
      
      // Case 2: Plain array - your specific case
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
        
        // Debug the first book's cover if available
        if (featuredData.data && featuredData.data.length > 0) {
          const firstBook = featuredData.data[0];
          console.log("First featured book raw data:", firstBook);
          const coverData = firstBook.attributes ? firstBook.attributes.cover : firstBook.cover;
          if (coverData) {
            const coverUrl = getStrapiMediaUrl(coverData);
            debugImageUrl("First featured book cover", coverData, coverUrl);
          }
        }
        
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
    
    // Extra debugging - direct check of Strapi API response
    const checkStrapiImage = async () => {
      try {
        // Replace with your actual API endpoint - adjust as needed
        const apiUrl = `${import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337'}/api/books?populate=*`;
        console.log("Checking direct API response from:", apiUrl);
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('Raw Strapi API response:', data);
        
        // If there's a book with cover, examine it
        if (data.data && data.data.length > 0 && data.data[0].attributes && data.data[0].attributes.cover) {
          console.log('First book cover structure from direct API:', data.data[0].attributes.cover);
        }
      } catch (err) {
        console.error('Error checking Strapi image directly:', err);
      }
    };
    
    checkStrapiImage();
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
        // Debug cover URL for every book
        debugImageUrl(`Book ${bookData.title} cover`, bookData.cover, coverUrl);
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

  // Carousel functions
  const nextSlide = () => {
    if (featuredBooks.length === 0) return;
    setCurrentSlide((prev) => (prev === featuredBooks.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    if (featuredBooks.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? featuredBooks.length - 1 : prev - 1));
  };
  
  // Auto slide effect
  useEffect(() => {
    if (featuredBooks.length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredBooks.length]);
  
  // Image Debugger Component
  const ImageDebugger = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadStatus, setLoadStatus] = useState('');
    
    const testImageUrl = () => {
      setIsLoading(true);
      setLoadStatus('Testing...');
      
      const img = new Image();
      img.onload = () => {
        setLoadStatus('✅ Image loaded successfully!');
        setIsLoading(false);
      };
      img.onerror = () => {
        setLoadStatus('❌ Failed to load image');
        setIsLoading(false);
      };
      img.src = imageUrl;
    };
    
    return (
      <div className="p-4 border rounded bg-gray-50">
        <h3 className="font-medium">Image URL Debugger</h3>
        <div className="mt-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste Strapi image URL to test"
            className="w-full p-2 border rounded"
          />
          <button 
            onClick={testImageUrl}
            disabled={isLoading || !imageUrl}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Test URL
          </button>
          {loadStatus && (
            <div className="mt-2">
              <p>{loadStatus}</p>
              {loadStatus.includes('successfully') && (
                <img src={imageUrl} alt="Test" className="mt-2 max-h-40 object-contain" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Component for each book slide
  const BookSlide = ({ book }) => (
    <div className="book-cell bg-zinc-800 p-6 rounded-lg flex flex-col md:flex-row items-center md:items-start h-full relative overflow-hidden">
      <div className="book-img relative z-10 mb-4 md:mb-0 transform transition hover:scale-105">
        <div className="relative bg-sky-500 rounded-lg shadow-md h-56 w-40 md:h-64 md:w-48 flex items-center justify-center overflow-hidden">
          <div className="text-white text-center font-serif z-10 px-2">
            <div className="text-sm tracking-wide">A COURT OF</div>
            <div className="text-xl md:text-2xl mt-1 mb-2 font-bold">{book.displayTitle?.[0]}</div>
            <div className="text-sm tracking-wide">AND</div>
            <div className="text-xl md:text-2xl mt-1 mb-2 font-bold">{book.displayTitle?.[1]}</div>
            <div className="text-xs tracking-wider mt-4">{book.author?.toUpperCase()}</div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-opacity-20 bg-black"></div>
          <div className="absolute bottom-0 h-1 w-full bg-opacity-40 bg-black"></div>
          <div className="absolute right-3 bottom-0 w-5 h-12 bg-yellow-200 rounded-t-sm"></div>
        </div>
      </div>
      
      <div className="book-content ml-0 md:ml-6 text-white z-10 max-w-md">
        <div className="book-title text-lg md:text-xl font-semibold mb-1">{book.title}</div>
        <div className="book-author text-sm mb-3">{book.author}</div>
        <div className="rate flex items-center mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={star <= Math.floor(book.rating || 0) ? "text-yellow-300" : "text-gray-300"}>★</span>
            ))}
          </div>
          <span className="book-voters text-sm ml-2">{book.voters || 0} voters</span>
        </div>
        <div className="book-sum text-sm mb-6 line-clamp-3">
          {book.summary}
        </div>
        <button onClick={() => setSelectedBook(book)} className="book-see bg-white text-center py-2 px-6 rounded-full font-medium text-sm inline-block hover:bg-opacity-90 text-cyan-300">
          See The Book
        </button>
      </div>
    </div>
  );
  
  // Component for book card
  const BookCard = ({ book }) => (
    <div className="book-card bg-white rounded-lg shadow-md overflow-hidden transform transition hover:shadow-lg cursor-pointer" onClick={() => setSelectedBook(book)}>
      <div className="content-wrapper flex p-5 border-b border-gray-100 relative">
        {book.cover ? (
          <img 
            src={book.cover} 
            alt={book.title} 
            className="book-card-img w-24 h-36 object-cover rounded shadow-md transition transform hover:scale-105" 
            onError={(e) => {
              console.error(`Failed to load image: ${book.cover}`);
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = 'https://via.placeholder.com/150';
            }}
          />
        ) : (
          <div className="bg-cyan-150 w-24 h-36 rounded shadow-md flex items-center justify-center">
            <span className="text-white font-bold">{book.title?.substring(0, 1)}</span>
          </div>
        )}
        <div className="card-content ml-5 overflow-hidden">
          <h3 className="book-name font-medium text-gray-800 mb-1 truncate">{book.title}</h3>
          <p className="book-by text-gray-500 text-sm mb-3">{book.author}</p>
          
          <div className="book-details space-y-1 mb-2">
            <p className="text-sm"><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-600">{book.subject || "Fiction"}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Give:</span> <span className="text-gray-600">{book.title}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Get:</span> <span className="text-gray-600">{book.exchange}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Condition:</span> <span className="text-gray-600">{book.condition}</span></p>
          </div>
        </div>
      </div>
      {book.likes?.length > 0 && (
        <div className="likes flex items-center p-3">
          <div className="flex -space-x-2">
            {book.likes.slice(0, 3).map(like => (
              <div key={like.id} className="like-profile">
                <img 
                  src={like.img} 
                  alt={like.name} 
                  className="like-img w-7 h-7 rounded-full border-2 border-white object-cover"
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
            {book.likes.length > 1 && <span> and <span className="font-semibold">{book.likes.length - 1} other {book.likes.length > 2 ? 'friends' : 'friend'}</span> like this</span>}
          </div>
        </div>
      )}
    </div>
  );
  
  // Component for featured book
  const FeaturedBook = ({ book }) => (
    <div className="featured-book p-3 cursor-pointer" onClick={() => setSelectedBook(book)}>
      {book.img ? (
        <img 
          src={book.img} 
          alt={book.name} 
          className="w-full h-40 object-cover rounded-lg shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150';
          }}
        />
      ) : (
        <div className="bg-Emerald-900 w-full h-40 rounded-lg shadow-md flex items-center justify-center">
          <span className="text-white font-bold text-lg">{book.name?.substring(0, 1)}</span>
        </div>
      )}
      <div className="mt-2">
        <h3 className="text-sm font-medium line-clamp-1">{book.name}</h3>
        <p className="text-xs text-gray-500">{book.author}</p>
      </div>
    </div>
  );
  
  // Component for book details modal
  const BookDetails = ({ book, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{book.title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="flex mb-4">
          {book.cover ? (
            <img 
              src={book.cover} 
              alt={book.title} 
              className="w-32 h-48 object-cover rounded shadow-md mr-4 flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          ) : (
            <div className="bg-Amber-950 rounded-lg shadow-md w-32 h-48 flex items-center justify-center mr-4 flex-shrink-0">
              <div className="text-white text-center font-serif px-2">
                <div className="text-xs tracking-wide">A COURT OF</div>
                <div className="text-lg font-bold my-1">{book.displayTitle?.[0]}</div>
                <div className="text-xs tracking-wide">AND</div>
                <div className="text-lg font-bold my-1">{book.displayTitle?.[1]}</div>
                <div className="text-xs mt-2">{book.author?.toUpperCase()}</div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-gray-700"><span className="font-medium">Author:</span> {book.author}</p>
            <p className="text-gray-700"><span className="font-medium">Seller:</span> {book.seller}</p>
            <p className="text-gray-700"><span className="font-medium">Condition:</span> {book.condition}</p>
            <p className="text-gray-700"><span className="font-medium">Exchange:</span> {book.exchange}</p>
            {book.course && (
              <p className="text-gray-700"><span className="font-medium">Course:</span> {book.course}</p>
            )}
            <p className="text-gray-700"><span className="font-medium">Subject:</span> {book.subject}</p>
            <div className="flex items-center mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={star <= Math.floor(book.rating || 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
                ))}
              </div>
              <span className="text-gray-500 text-xs ml-2">{book.voters || 0} voters</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{book.summary}</p>
        
        {book.likes?.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h3 className="font-medium mb-2">Liked by:</h3>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {book.likes.map(like => (
                  <div key={like.id} className="like-profile">
                    <img 
                      src={like.img} 
                      alt={like.name} 
                      className="like-img w-7 h-7 rounded-full border-2 border-white object-cover"
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
                {book.likes.length > 1 && <span> and <span className="font-semibold">{book.likes.length - 1} other {book.likes.length > 2 ? 'friends' : 'friend'}</span></span>}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 text-sm">Contact Seller</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm">Request Exchange</button>
        </div>
      </div>
    </div>
  );
  
  // Placeholder for loading states
  const LoadingPlaceholder = ({ type }) => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
      <p className="text-gray-500 mt-4">Loading {type}...</p>
    </div>
  );

  // Placeholder for error states
  const ErrorPlaceholder = ({ message, type }) => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-red-500 text-center">{message || `Error loading ${type}`}</p>
    </div>
  );
  
  return (
    <div className="book-store bg-gray-50 min-h-screen">
      {/* Book Slide Section */}
      {loading.featured ? (
        <div className="p-8">
          <LoadingPlaceholder type="featured books" />
        </div>
      ) : error.featured ? (
        <div className="p-8">
          <ErrorPlaceholder message={error.featured} type="featured books" />
        </div>
      ) : featuredBooks.length > 0 ? (
        <div className="book-slide relative bg-white py-2">
          <div className="slider-container overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {featuredBooks.map((book, index) => (
                <div key={book.id} className="min-w-full">
                  <BookSlide book={book} />
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={prevSlide} 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white w-10 h-10 flex items-center justify-center shadow-md z-10"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextSlide} 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white w-10 h-10 flex items-center justify-center shadow-md z-10"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="p-8 bg-white text-center text-gray-500">
          No featured books available
        </div>
      )}
      
      {/* Main Content */}
      <div className="main-wrapper flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-6">
        {/* Sidebar */}
        <div className="books-of w-full lg:w-64 flex-shrink-0 lg:mr-6 mb-6 lg:mb-0">
          {/* Featured Books Section */}
          <div className="week bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="featured-title font-medium mb-4">Featured Books</div>
            {loading.booksOfWeek ? (
              <LoadingPlaceholder type="featured books" />
            ) : error.booksOfWeek ? (
              <ErrorPlaceholder message={error.booksOfWeek} type="featured books" />
            ) : booksOfWeek.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {booksOfWeek.map(book => (
                  <FeaturedBook key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No books of the year available
              </div>
            )}
            {booksOfYear.length > 4 && (
              <div className="overlay absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
            )}
          </div>
          
          {/* Image Debugger - add this for troubleshooting */}
          <div className="mb-6">
            <ImageDebugger />
          </div>
        </div>
        
        {/* Popular Books */}
        <div className="popular-books flex-grow bg-white rounded-lg shadow-sm p-6">
          <div className="main-menu flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 mb-6">
            <div className="genre font-medium mb-3 sm:mb-0">Popular by Genre</div>
            
            {/* Desktop Categories */}
            {loading.categories ? (
              <div className="hidden md:block">
                <div className="animate-pulse h-6 w-36 bg-gray-200 rounded"></div>
              </div>
            ) : error.categories ? (
              <div className="hidden md:block text-sm text-red-500">Error loading categories</div>
            ) : (
              <div className="book-types hidden md:flex space-x-6 overflow-x-auto no-scrollbar">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <button
                      key={category.id}
                      className={`book-type text-sm relative whitespace-nowrap ${activeCategory === category.name ? 'font-medium text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveCategory(category.name)}
                    >
                      {category.name}
                      {activeCategory === category.name && (
                        <span className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-400 shadow-md"></span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No categories available</div>
                )}
              </div>
            )}
            
            {/* Mobile Category Dropdown */}
            {loading.categories ? (
              <div className="md:hidden w-full sm:w-auto">
                <div className="animate-pulse h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ) : error.categories ? (
              <div className="md:hidden w-full sm:w-auto text-sm text-red-500">Error loading categories</div>
            ) : (
              <div className="md:hidden w-full sm:w-auto">
                <select 
                  className="form-select w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option>No categories available</option>
                  )}
                </select>
              </div>
            )}
          </div>
          
          {/* Book Cards */}
          {loading.popular ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex">
                    <div className="w-24 h-36 bg-gray-200 rounded animate-pulse"></div>
                    <div className="ml-5 flex-grow">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center">
                      <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse ml-3 w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error.popular ? (
            <ErrorPlaceholder message={error.popular} type="popular books" />
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
      
      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetails book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default Home;
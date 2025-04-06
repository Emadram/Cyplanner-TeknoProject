import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const BookPage = () => {
  const { bookId } = useParams();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getBookById(bookId);
        
        // Process book data
        if (response && response.data) {
          const bookData = response.data.attributes || response.data;
          
          // Process cover image
          let coverUrl = null;
          if (bookData.cover) {
            coverUrl = getStrapiMediaUrl(bookData.cover);
          }
          
          // Map the book data
          const mappedBook = {
            id: response.data.id,
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            rating: bookData.rating || 4.2,
            voters: bookData.votersCount || Math.floor(Math.random() * 120) + 10,
            condition: bookData.condition || "Good",
            exchange: bookData.exchange,
            subject: bookData.subject || "General",
            course: bookData.course,
            seller: bookData.seller || "Campus BookShop",
            cover: coverUrl,
            price: Math.floor(Math.random() * 25) + 5 + 0.99,
            categoryId: bookData.category?.data?.id || null,
            inStock: Math.floor(Math.random() * 10) + 1
          };
          
          setBook(mappedBook);
          
          // Fetch related books if category is available
          if (mappedBook.categoryId) {
            try {
              const relatedResponse = await bookAPI.getBooksByCategory(mappedBook.categoryId);
              if (relatedResponse && relatedResponse.data) {
                const relatedData = relatedResponse.data
                  .filter(item => item.id !== bookId)
                  .slice(0, 4)
                  .map(book => {
                    const bookData = book.attributes || book;
                    let coverUrl = null;
                    if (bookData.cover) {
                      coverUrl = getStrapiMediaUrl(bookData.cover);
                    }
                    
                    return {
                      id: book.id,
                      title: bookData.title,
                      author: bookData.author,
                      cover: coverUrl,
                      price: Math.floor(Math.random() * 25) + 5 + 0.99
                    };
                  });
                
                setRelatedBooks(relatedData);
              }
            } catch (err) {
              console.error("Error fetching related books:", err);
            }
          }
        } else {
          setError("Book not found");
        }
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

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
      
      console.warn('Could not process image data:', imageData);
      return null;
    } catch (err) {
      console.error('Error processing image URL:', err, imageData);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="w-full md:w-1/3">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
          </div>
          <div className="w-full md:w-2/3">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 py-16 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-6xl mx-auto p-4 py-16 text-center">
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Book Not Found</h2>
          <p>We couldn't find the book you're looking for.</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Render the book details page
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/" className="hover:text-blue-600">Books</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium truncate">{book.title}</span>
          </div>
        </div>
      </div>
      
      {/* Book Details Section */}
      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row gap-8">
            {/* Book Cover Column */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative mb-6">
                {book.cover ? (
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-full max-w-xs rounded-lg shadow-md object-cover" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x600?text=No+Cover';
                    }}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-96 max-w-xs rounded-lg shadow-md flex items-center justify-center">
                    <div className="text-white text-center font-serif px-6">
                      <div className="text-xl tracking-wide">{book.title}</div>
                      <div className="mt-4 text-lg">by</div>
                      <div className="mt-2 text-xl">{book.author}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Price and Buy Buttons */}
              <div className="w-full max-w-xs bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-gray-800">${book.price.toFixed(2)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${book.inStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {book.inStock > 0 ? `${book.inStock} In Stock` : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                  
                  <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Buy Now
                  </button>
                  
                  <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Borrow
                  </button>
                </div>
              </div>
              
              {/* Book Details Box */}
              <div className="w-full max-w-xs bg-gray-50 rounded-lg p-4 divide-y divide-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Book Details</h3>
                <div className="pt-2 space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-500">Condition:</span>
                    <span className="font-medium text-gray-700">{book.condition}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Subject:</span>
                    <span className="font-medium text-gray-700">{book.subject}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Seller:</span>
                    <span className="font-medium text-gray-700">{book.seller}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">ISBN:</span>
                    <span className="font-medium text-gray-700">978-{Math.floor(Math.random() * 10000000000)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Format:</span>
                    <span className="font-medium text-gray-700">Paperback</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-500">Language:</span>
                    <span className="font-medium text-gray-700">English</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Book Information Column */}
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-600 mb-4">by <span className="font-medium">{book.author}</span></p>
              
              {/* Ratings */}
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= Math.floor(book.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">{book.rating.toFixed(1)} ({book.voters} ratings)</span>
              </div>
              
              {/* Book Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Book Description</h2>
                <div className="prose text-gray-600">
                  {book.description ? (
                    <p>{book.description}</p>
                  ) : (
                    <>
                      <p>
                        This compelling book from {book.author} takes readers on a journey through the fascinating world of {book.subject}.
                        Perfect for students, academics, and casual readers alike, this book offers both breadth and depth on its subject.
                      </p>
                      <p className="mt-4">
                        Whether you're studying {book.course || 'this subject'} or simply interested in expanding your knowledge,
                        this book provides valuable insights and perspectives that will enrich your understanding.
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Tabs: Features, Reviews, Course Info */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px">
                  <button className="mr-8 py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
                    Features
                  </button>
                  <button className="mr-8 py-4 px-1 text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Reviews ({book.voters})
                  </button>
                  <button className="mr-8 py-4 px-1 text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Course Information
                  </button>
                </nav>
              </div>
              
              {/* Features Content */}
              <div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-800">Comprehensive Coverage</h3>
                      <p className="text-gray-600 text-sm">Covers all essential topics in {book.subject} with detailed explanations.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-800">Practice Questions</h3>
                      <p className="text-gray-600 text-sm">Includes problem sets and examples to reinforce learning.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-800">Updated Content</h3>
                      <p className="text-gray-600 text-sm">Contains the latest research and developments in the field.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-gray-800">Supplementary Resources</h3>
                      <p className="text-gray-600 text-sm">Access to online resources and additional materials.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Books</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map(relatedBook => (
                <Link to={`/book/${relatedBook.id}`} key={relatedBook.id} className="group">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="relative aspect-w-2 aspect-h-3 bg-gray-100">
                      {relatedBook.cover ? (
                        <img 
                          src={relatedBook.cover} 
                          alt={relatedBook.title} 
                          className="w-full h-64 object-cover object-center transition-transform duration-300 group-hover:scale-105" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Cover';
                          }}
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-64 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                          <div className="text-white text-center font-serif px-4">
                            <div className="text-lg font-medium">{relatedBook.title}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {relatedBook.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{relatedBook.author}</p>
                      <p className="text-blue-600 font-medium">${relatedBook.price?.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPage;
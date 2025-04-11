import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { bookAPI } from '../services/api';

const BookDetail = () => {
  const { id } = useParams();
  const { user, authAxios, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [borrowDuration, setBorrowDuration] = useState('2 weeks');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getBookById(id);
        
        // Process book data
        const bookData = response.data.data;
        const processedBook = {
          id: bookData.id,
          ...bookData.attributes,
          // Convert bookType if it exists or assign a default
          bookType: bookData.attributes.bookType || 'For Sale',
          // Process cover image if it exists
          cover: bookData.attributes.cover?.data ? 
            `${import.meta.env.VITE_API_URL}${bookData.attributes.cover.data.attributes.url}` : 
            null,
        };
        
        setBook(processedBook);
        setError(null);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id]);
  
  // Status styles
  const statusStyles = {
    'For Sale': 'bg-green-100 text-green-800',
    'For Swap': 'bg-blue-100 text-blue-800',
    'For Borrowing': 'bg-purple-100 text-purple-800'
  };
  
  // Generate a course code (for demo purposes)
  const courseCode = book ? `${['CS', 'MATH', 'BIO', 'CHEM', 'ENG'][book.id % 5]}${101 + (book.id % 400)}` : '';
  
  // Generate seller details (for demo purposes)
  const seller = book ? {
    id: book.id % 100 + 1, // Random ID for demo
    name: book.seller || 'John Doe',
    rating: (3 + (book.id % 3)) + (book.id % 10) / 10,
    transactions: 5 + (book.id % 20),
    responseTime: '< 1 hour',
    joinedDate: 'Jan 2023',
    location: 'North Campus Library'
  } : {};
  
  // Borrowing details (for demo)
  const borrowingDetails = {
    durationOptions: ['1 week', '2 weeks', '1 month'],
    depositAmount: 15.00, 
    defaultDuration: '2 weeks'
  };
  
  // Calculate return date based on duration
  const calculateReturnDate = (duration) => {
    const date = new Date();
    switch(duration) {
      case '1 week':
        date.setDate(date.getDate() + 7);
        break;
      case '1 month':
        date.setDate(date.getDate() + 30);
        break;
      case '2 weeks':
      default:
        date.setDate(date.getDate() + 14);
        break;
    }
    return date.toISOString().split('T')[0];
  };
  
  // Handle borrow request
  const handleBorrowRequest = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to borrow books.");
      navigate('/signin?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    if (!book) return;
    
    try {
      const returnDate = calculateReturnDate(borrowDuration);
      
      // Create a borrow request in the API
      await authAxios.post(`${import.meta.env.VITE_API_URL}/api/borrow-requests`, {
        data: {
          borrowerId: user.id,
          lenderId: book.userId || seller.id, // In a real app, this would be the actual user ID
          bookId: book.id,
          duration: borrowDuration,
          returnDate: returnDate,
          depositAmount: borrowingDetails.depositAmount,
          status: 'pending',
          timestamp: new Date().toISOString()
        }
      });
      
      // Send a message to the lender
      const chatId = `${user.id}_${book.userId || seller.id}_${book.id}`;
      await authAxios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        data: {
          chatId,
          senderId: user.id,
          receiverId: book.userId || seller.id,
          bookId: book.id,
          text: `Hello, I'd like to borrow "${book.title}" for ${borrowDuration}. I'll return it by ${returnDate}.`,
          timestamp: new Date().toISOString(),
          messageType: 'borrow_request'
        }
      });
      
      // Add to cart with transaction type "borrow"
      const result = await addToCart(book, 'borrow', {
        duration: borrowDuration,
        deposit: borrowingDetails.depositAmount,
        dueDate: returnDate
      });
      
      if (result.success) {
        alert("Book added to your cart for borrowing!");
        navigate('/cart');
      } else {
        throw new Error(result.error || "Failed to add book to cart.");
      }
      
      setShowBorrowModal(false);
    } catch (err) {
      console.error('Error processing borrow request:', err);
      alert("There was an error processing your borrow request. Please try again.");
    }
  };

  // Actions based on book type
  const handleActionClick = async (actionType) => {
    if (!isAuthenticated) {
      alert("Please sign in to continue.");
      navigate('/signin?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (book.bookType === 'For Sale' && actionType === 'primary') {
      // Add to cart for purchase
      const result = await addToCart(book, 'buy');
      
      if (result.success) {
        alert("Book added to cart!");
      } else {
        alert(result.error || "Failed to add book to cart.");
      }
    } else if (book.bookType === 'For Sale' && actionType === 'secondary') {
      // Make an offer
      navigate(`/chat/${seller.id}/${book.id}`);
    } else if (book.bookType === 'For Swap' && actionType === 'primary') {
      // Redirect to chat with seller for swap
      navigate(`/chat/${seller.id}/${book.id}`);
    } else if (book.bookType === 'For Swap' && actionType === 'secondary') {
      // View seller's wishlist
      alert("Wishlist feature coming soon!");
    } else if (book.bookType === 'For Borrowing' && actionType === 'primary') {
      // Show borrowing modal
      setShowBorrowModal(true);
    } else if (book.bookType === 'For Borrowing' && actionType === 'secondary') {
      // Reserve
      alert("Reservation feature coming soon!");
    } else {
      navigate(`/chat/${seller.id}/${book.id}`);
    }
  };
  
  // Borrow Modal Component
  const BorrowModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Borrow this Book</h3>
          <button 
            onClick={() => setShowBorrowModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden mr-3">
              {book && book.cover ? (
                <img 
                  src={book.cover} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No image</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">{book ? book.title : 'Loading...'}</h4>
              <p className="text-sm text-gray-500">{book ? book.author : 'Loading...'}</p>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h5 className="font-medium text-purple-800 mb-2">Borrowing Details</h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Borrow Duration
                </label>
                <select 
                  value={borrowDuration}
                  onChange={(e) => setBorrowDuration(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {borrowingDetails.durationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date
                </label>
                <div className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-700">
                  {calculateReturnDate(borrowDuration)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Amount (refundable)
                </label>
                <div className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-700">
                  ${borrowingDetails.depositAmount.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-600">
              <p>* Deposit will be refunded when the book is returned in good condition.</p>
              <p>* Late returns will incur a fee of $1 per day.</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setShowBorrowModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleBorrowRequest}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/books" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded">
            Back to Books
          </Link>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-2">Book Not Found</h2>
          <p>The book you're looking for doesn't exist or has been removed.</p>
          <Link to="/books" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }
  
  // Determine primary and secondary action labels based on book type
  const actions = {
    'For Sale': {
      primary: 'Add to Cart',
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
  
  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm">
        <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/books" className="text-blue-600 hover:text-blue-800">Books</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{book.title}</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
              <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[book.bookType]}`}>
                {book.bookType}
              </div>
            </div>
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
                    className="w-64 h-80 object-cover rounded-xl shadow-md"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-md w-64 h-80 flex items-center justify-center">
                    <div className="text-white text-center px-4">
                      <div className="text-sm uppercase tracking-wide">Book cover</div>
                      <div className="text-xl font-bold mt-2">{book.title.charAt(0)}</div>
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
              {book.bookType === 'For Sale' && book.price !== null && (
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-green-600">${book.price?.toFixed(2) || '19.99'}</span>
                </div>
              )}
              
              {book.bookType === 'For Borrowing' && (
                <div className="text-center mb-4">
                  <div className="bg-purple-50 rounded-lg p-2">
                    <span className="text-purple-800 font-medium text-sm">Deposit: ${borrowingDetails.depositAmount.toFixed(2)}</span>
                    <p className="text-xs text-gray-600 mt-1">Refundable upon return</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <button 
                  onClick={() => handleActionClick('primary')}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {actions[book.bookType].primary}
                </button>
                <button 
                  onClick={() => handleActionClick('secondary')}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {actions[book.bookType].secondary}
                </button>
                <button 
                  onClick={() => navigate(`/chat/${seller.id}/${book.id}`)}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message Seller
                </button>
              </div>
            </div>
          </div>
          
          {/* Right column - tab content */}
          <div className="w-full md:w-2/3 p-6">
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
                      {book.bookType === 'For Swap' && (
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Exchange For:</span> 
                          <span className="text-gray-600">{book.exchange || "Literature or History books"}</span>
                        </p>
                      )}
                      {book.bookType === 'For Borrowing' && (
                        <>
                          <p className="flex justify-between">
                            <span className="font-medium text-gray-700">Duration Options:</span> 
                            <span className="text-gray-600">{borrowingDetails.durationOptions.join(' / ')}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="font-medium text-gray-700">Deposit:</span> 
                            <span className="text-gray-600">${borrowingDetails.depositAmount.toFixed(2)}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="font-medium text-gray-700">Available From:</span> 
                            <span className="text-gray-600">Immediately</span>
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
                    {book.description || "No description provided. This book is in good condition and perfect for students taking the related course. Please message the seller for more details."}
                  </p>
                </div>
                
                {/* Additional book details like ISBN, publisher, etc */}
                <div className="mt-6 text-sm text-gray-500">
                  <p>ISBN: 978-1234567890</p>
                  <p>Publisher: Academic Press</p>
                  <p>Edition: 4th Edition (2022)</p>
                  <p>Pages: 452</p>
                </div>
                
                {/* Special information for borrowing */}
                {book.bookType === 'For Borrowing' && (
                  <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-3">Borrowing Information</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">How it works:</span> When you borrow this book, a refundable deposit will be required. The deposit will be returned when the book is brought back in the same condition.
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Late fees:</span> $1 per day after the due date.
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">ID Required:</span> Please bring a student ID for verification when picking up the book.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowBorrowModal(true)}
                      className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                      Borrow This Book
                    </button>
                  </div>
                )}
                
                {/* Special information for swapping */}
                {book.bookType === 'For Swap' && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-3">Swap Information</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">How it works:</span> You can propose a book swap with the seller. They might be interested in exchanging this book for one of yours.
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Seller's interests:</span> {book.exchange || "Literature, History, Science, and Textbooks"}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate(`/chat/${seller.id}/${book.id}`)}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Propose a Swap
                    </button>
                  </div>
                )}
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
  <Link 
    to={`/book/${book.id + i}`} 
    key={i} 
    className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
  >
                        <div className="flex items-center">
                          <div className="w-12 h-16 bg-gray-200 rounded"></div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium line-clamp-1">Another Book Title</h5>
                            <p className="text-xs text-gray-500">{book.bookType}</p>
                            {book.bookType === 'For Sale' && (
                              <p className="text-xs font-medium text-green-600">${(book.price + i).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Related Books Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Related Books</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Sample related books */}
          {[...Array(5)].map((_, i) => (
            <Link to={`/book/${book.id + i + 1}`} key={i} className="group">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-xl">{String.fromCharCode(65 + i)}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">Similar Book Title {i+1}</h3>
                  <p className="text-xs text-gray-500">Another Author</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex text-yellow-400 text-xs">
                      <span>★★★★</span><span className="text-gray-300">★</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">${(19.99 + i).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Borrow Modal */}
      {showBorrowModal && <BorrowModal />}
    </div>
  );
};

export default BookDetail;
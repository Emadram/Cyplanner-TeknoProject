import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const BookDetails = ({ book, onClose }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('details');
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Status styles
  const statusStyles = {
    'For Sale': 'bg-green-100 text-green-800',
    'For Swap': 'bg-blue-100 text-blue-800',
    'For Borrowing': 'bg-purple-100 text-purple-800'
  };
  
  // Generate random price (for demo purposes)
  const price = book.bookType === 'For Sale' ? book.price : null;
  
  // Generate a course code (for demo purposes)
  const courseCode = `${['CS', 'MATH', 'BIO', 'CHEM', 'ENG'][book.id % 5]}${101 + (book.id % 400)}`;
  
  // Generate seller details (for demo purposes)
  const seller = {
    id: book.id % 100 + 1, // Random ID for demo
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
  
  // Actions based on book type
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

  // Handle action button click
  const handleActionClick = async (actionType) => {
    if (!isAuthenticated) {
      alert("Please sign in to continue.");
      navigate('/signin?redirectTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (book.bookType === 'For Sale' && actionType === 'primary') {
      // Add to cart
      const result = await addToCart(book);
      
      if (result.success) {
        alert("Book added to cart!");
        onClose();
      } else {
        alert(result.error || "Failed to add book to cart.");
      }
    } else if (book.bookType === 'For Swap' && actionType === 'primary') {
      // Redirect to chat with seller for swap
      navigate(`/chat/${seller.id}/${book.id}`);
    } else if (book.bookType === 'For Borrowing' && actionType === 'primary') {
      // Handle borrowing process
      alert("Borrowing request sent to seller!");
      onClose();
    } else {
      // Handle secondary actions
      alert("Feature coming soon!");
    }
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
              <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[book.bookType]}`}>
                {book.bookType}
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
                      e.target.src = 'https://via.placeholder.com/160x224?text=Book+Cover';
                    }}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-md w-40 h-56 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{book.title?.substring(0, 1)}</span>
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
                  <span className="text-2xl font-bold text-green-600">${book.price.toFixed(2)}</span>
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
                      {book.bookType === 'For Swap' && (
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-700">Exchange For:</span> 
                          <span className="text-gray-600">Literature or History books</span>
                        </p>
                      )}
                      {book.bookType === 'For Borrowing' && (
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
                            <p className="text-xs text-gray-500">{book.bookType}</p>
                            {book.bookType === 'For Sale' && (
                              <p className="text-xs font-medium text-green-600">${(book.price + i).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails; 
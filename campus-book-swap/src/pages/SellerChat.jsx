import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const SellerChat = () => {
  const { sellerId, bookId } = useParams();
  const { user, authAxios, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [seller, setSeller] = useState(null);
  const [book, setBook] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUserBooks, setSelectedUserBooks] = useState([]);
  const [swapStatus, setSwapStatus] = useState('none'); // none, pending, accepted, declined
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirectTo=' + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, navigate]);

  // Fetch chat data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !sellerId || !bookId) return;
      
      setLoading(true);
      try {
        // Fetch seller info
        const sellerResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/users/${sellerId}`);
        setSeller(sellerResponse.data);
        
        // Fetch book info
        const bookResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/books/${bookId}`);
        setBook(bookResponse.data.data);
        
        // Fetch chat messages
        const messagesResponse = await authAxios.get(
          `${import.meta.env.VITE_API_URL}/api/messages?filters[chatId][$eq]=${user.id}_${sellerId}_${bookId}`
        );
        setMessages(messagesResponse.data.data || []);
        
        // Fetch user's books for swap
        const userBooksResponse = await authAxios.get(
          `${import.meta.env.VITE_API_URL}/api/books?filters[users_permissions_user][id][$eq]=${user.id}`
        );
        setUserBooks(userBooksResponse.data.data || []);
        
        // Check if there's a swap offer already
        const swapStatusResponse = await authAxios.get(
          `${import.meta.env.VITE_API_URL}/api/swap-offers?filters[chatId][$eq]=${user.id}_${sellerId}_${bookId}`
        );
        
        if (swapStatusResponse.data.data && swapStatusResponse.data.data.length > 0) {
          const latestSwap = swapStatusResponse.data.data[0];
          setSwapStatus(latestSwap.attributes.status);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up a polling mechanism for messages
    const intervalId = setInterval(() => {
      if (isAuthenticated && sellerId && bookId) {
        fetchMessages();
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, sellerId, bookId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch only messages
  const fetchMessages = async () => {
    if (!isAuthenticated || !sellerId || !bookId) return;
    
    try {
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/messages?filters[chatId][$eq]=${user.id}_${sellerId}_${bookId}`
      );
      setMessages(response.data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;
    
    try {
      // Create the chat ID as a combination of both user IDs and the book ID
      const chatId = `${user.id}_${sellerId}_${bookId}`;
      
      // Send the message to the API
      const response = await authAxios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        chatId,
        senderId: user.id,
        receiverId: sellerId,
        bookId,
        text: newMessage.trim(),
        timestamp: new Date().toISOString()
      });
      
      // Add the new message to the chat
      setMessages([...messages, response.data.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Send a swap offer
  const handleSendSwapOffer = async () => {
    if (selectedUserBooks.length === 0) return;
    
    try {
      const chatId = `${user.id}_${sellerId}_${bookId}`;
      
      // Create a swap offer
      await authAxios.post(`${import.meta.env.VITE_API_URL}/api/swap-offers`, {
        chatId,
        buyerId: user.id,
        sellerId,
        bookId,
        offerBookIds: selectedUserBooks.map(book => book.id),
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      
      // Send a message about the swap offer
      const offerMessage = `I'd like to offer the following book(s) for swap:\n${
        selectedUserBooks.map(book => `- ${book.attributes.title} by ${book.attributes.author}`).join('\n')
      }\n\nPlease let me know if you're interested!`;
      
      await authAxios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
        chatId,
        senderId: user.id,
        receiverId: sellerId,
        bookId,
        text: offerMessage,
        timestamp: new Date().toISOString(),
        messageType: 'swap_offer'
      });
      
      // Update local state
      fetchMessages();
      setSwapStatus('pending');
      setShowSwapModal(false);
    } catch (err) {
      console.error('Error sending swap offer:', err);
      setError('Failed to send swap offer. Please try again.');
    }
  };

  // Add book to cart as a "swap" item
  const handleAddToSwapCart = async () => {
    if (!book) return;
    
    try {
      // Add to cart with transaction type "swap"
      const result = await addToCart(book, 'swap');
      
      if (result.success) {
        alert("Book added to your cart as a swap item!");
        navigate('/cart');
      } else {
        alert(result.error || "Failed to add book to cart.");
      }
    } catch (err) {
      console.error('Error adding to swap cart:', err);
      setError('Failed to add book to swap cart.');
    }
  };

  // Toggle selection of user's book for swap
  const toggleBookSelection = (book) => {
    const isSelected = selectedUserBooks.some(b => b.id === book.id);
    
    if (isSelected) {
      setSelectedUserBooks(selectedUserBooks.filter(b => b.id !== book.id));
    } else {
      setSelectedUserBooks([...selectedUserBooks, book]);
    }
  };

  // Generate a template message for the chat
  const generateTemplate = (templateType) => {
    if (!book) return '';
    
    let templateText = '';
    
    switch (templateType) {
      case 'swap':
        templateText = `Hi, I'm interested in swapping for your book "${book.attributes?.title || 'your book'}". I have the following books to offer:
- [Book title 1]
- [Book title 2]

Would any of these interest you for a swap? I can provide more details or photos if needed.`;
        break;
      case 'borrow':
        templateText = `Hi, I'm interested in borrowing "${book.attributes?.title || 'your book'}". 
        
I can pick it up on [date] and would return it by [date]. I'm happy to leave a deposit if required.

Is this book still available for borrowing?`;
        break;
      case 'purchase':
        templateText = `Hi, I'm interested in purchasing "${book.attributes?.title || 'your book'}".
        
Is the price firm or would you consider an offer of $[amount]? Also, when and where would be a good time/place to meet?`;
        break;
      case 'question':
        templateText = `Hi, I have a question about "${book.attributes?.title || 'your book'}".

[Your question here]

Thanks!`;
        break;
      default:
        templateText = `Hi, I'm interested in "${book.attributes?.title || 'your book'}".`;
    }
    
    setNewMessage(templateText);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Render a message with special formatting for swap offers
  const renderMessage = (message, index) => {
    const isCurrentUser = message.senderId === user.id;
    const isSwapOffer = message.messageType === 'swap_offer';
    
    return (
      <div 
        key={message.id || index} 
        className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div 
          className={`max-w-[75%] rounded-lg p-3 ${
            isCurrentUser 
              ? isSwapOffer ? 'bg-blue-100 border border-blue-200 text-blue-900' : 'bg-blue-100 text-blue-900' 
              : isSwapOffer ? 'bg-purple-50 border border-purple-200 text-purple-900' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isSwapOffer && (
            <div className="mb-2 pb-2 border-b border-blue-200">
              <span className="font-semibold text-blue-700">Swap Offer</span>
            </div>
          )}
          <p className="whitespace-pre-line">{message.text}</p>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formatTimestamp(message.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  // SwapModal component for selecting books
  const SwapModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Select Books to Offer for Swap</h3>
            <button 
              onClick={() => setShowSwapModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {userBooks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have any books listed to offer for swap.</p>
              <Link 
                to="/dashboard" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
              >
                List a Book
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Select the book(s) you want to offer for "{book?.attributes?.title}":
              </p>
              
              <div className="space-y-3 mb-6">
                {userBooks.map(userBook => (
                  <div 
                    key={userBook.id}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                      selectedUserBooks.some(b => b.id === userBook.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => toggleBookSelection(userBook)}
                  >
                    <div className="h-16 w-12 bg-gray-200 rounded overflow-hidden mr-3">
                      {userBook.attributes.cover?.data ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}${userBook.attributes.cover.data.attributes.url}`} 
                          alt={userBook.attributes.title}
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-300">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>  
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{userBook.attributes.title}</h4>
                      <p className="text-sm text-gray-600">{userBook.attributes.author}</p>
                    </div>
                    <div className="ml-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedUserBooks.some(b => b.id === userBook.id)
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200'
                      }`}>
                        {selectedUserBooks.some(b => b.id === userBook.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowSwapModal(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 text-gray-700 rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendSwapOffer}
                  disabled={selectedUserBooks.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
                >
                  Send Swap Offer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/books" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded">
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Message with Seller</h1>
        <Link to="/messages" className="text-blue-600 hover:text-blue-800">
          Back to Messages
        </Link>
      </div>
      
      {/* Book and seller information */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row">
          {/* Book info */}
          {book && (
            <div className="flex mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                {book.attributes?.cover?.data ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${book.attributes.cover.data.attributes.url}`} 
                    alt={book.attributes.title}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <h2 className="font-medium text-lg">{book.attributes?.title || 'Unknown Book'}</h2>
                <p className="text-sm text-gray-500">{book.attributes?.author || 'Unknown Author'}</p>
                <div className="mt-2">
                  {book.attributes?.bookType === 'For Swap' || book.attributes?.exchange ? (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      For Swap
                    </span>
                  ) : book.attributes?.bookType === 'For Borrowing' ? (
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      For Borrowing
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      For Sale
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Seller info */}
          {seller && (
            <div className="flex items-center md:ml-auto">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {seller.username ? seller.username.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="ml-3">
                <h3 className="font-medium">{seller.username || 'Unknown Seller'}</h3>
                <p className="text-sm text-gray-500">Seller</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 border-t pt-4 flex gap-2 flex-wrap justify-center md:justify-start">
          {book && book.attributes?.bookType === 'For Swap' && (
            <>
              <button 
                onClick={() => setShowSwapModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
                disabled={swapStatus === 'pending'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {swapStatus === 'pending' ? 'Swap Offer Pending' : 'Propose Book Swap'}
              </button>
              
              <button 
                onClick={handleAddToSwapCart}
                className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Swap Cart
              </button>
            </>
          )}
          
          {book && book.attributes?.bookType === 'For Borrowing' && (
            <button 
              onClick={() => generateTemplate('borrow')}
              className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Ask About Borrowing
            </button>
          )}
          
          {book && (!book.attributes?.bookType || book.attributes?.bookType === 'For Sale') && (
            <button 
              onClick={() => generateTemplate('purchase')}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Discuss Purchase
            </button>
          )}
          
          <button 
            onClick={() => generateTemplate('question')}
            className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ask a Question
          </button>
        </div>
        
        {/* Swap status messages */}
        {swapStatus === 'pending' && (
          <div className="mt-4 bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-700 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You have a pending swap offer. Awaiting response from the seller.
            </p>
          </div>
        )}
        
        {swapStatus === 'accepted' && (
          <div className="mt-4 bg-green-50 p-3 rounded-lg">
            <p className="text-green-700 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your swap offer has been accepted! Coordinate with the seller to exchange books.
            </p>
          </div>
        )}
        
        {swapStatus === 'declined' && (
          <div className="mt-4 bg-red-50 p-3 rounded-lg">
            <p className="text-red-700 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your swap offer was declined. You can make a new offer or discuss with the seller.
            </p>
          </div>
        )}
      </div>
      
      {/* Chat area */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200 py-3 px-4">
          <h2 className="font-medium">Messages</h2>
        </div>
        
        {/* Messages container */}
        <div className="h-96 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>No messages yet. Start the conversation!</p>
              <div className="mt-4 flex justify-center gap-2">
                <button 
                  onClick={() => generateTemplate('swap')}
                  className="px-3 py-1 text-blue-600 text-sm border border-blue-200 rounded hover:bg-blue-50"
                >
                  Swap Template
                </button>
                <button 
                  onClick={() => generateTemplate('borrow')}
                  className="px-3 py-1 text-purple-600 text-sm border border-purple-200 rounded hover:bg-purple-50"
                >
                  Borrow Template
                </button>
                <button 
                  onClick={() => generateTemplate('purchase')}
                  className="px-3 py-1 text-green-600 text-sm border border-green-200 rounded hover:bg-green-50"
                >
                  Purchase Template
                </button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              rows="2"
            ></textarea>
            <button 
              type="submit"
              className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </form>
          <div className="mt-2 flex flex-wrap gap-2">
            <button 
              onClick={() => generateTemplate('swap')}
              className="text-blue-600 text-xs hover:underline"
            >
              Swap Template
            </button>
            <button 
              onClick={() => generateTemplate('borrow')}
              className="text-purple-600 text-xs hover:underline"
            >
              Borrow Template
            </button>
            <button 
              onClick={() => generateTemplate('purchase')}
              className="text-green-600 text-xs hover:underline"
            >
              Purchase Template
            </button>
            <button 
              onClick={() => generateTemplate('question')}
              className="text-gray-600 text-xs hover:underline"
            >
              Question Template
            </button>
          </div>
        </div>
      </div>
      
      {/* Swap Modal */}
      {showSwapModal && <SwapModal />}
    </div>
  );
};

export default SellerChat;
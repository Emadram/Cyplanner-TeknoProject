import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Messages = () => {
  const { user, authAxios, isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirectTo=' + encodeURIComponent(window.location.pathname));
    } else if (user && user.id) {
      fetchChats();
      fetchSwapRequests();
      fetchBorrowRequests();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      // Get all messages where the user is either sender or receiver
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/messages?filters[$or][0][senderId][$eq]=${user.id}&filters[$or][1][receiverId][$eq]=${user.id}&sort[0]=timestamp:desc`
      );
      
      const messages = response.data.data || [];
      
      // Group messages by chat ID to get the latest message for each chat
      const chatMap = new Map();
      
      for (const message of messages) {
        const chatId = message.chatId;
        
        // Extract user IDs and book ID from chat ID
        const [userId1, userId2, bookId] = chatId.split('_');
        
        // Determine the other user ID (not the current user)
        const otherUserId = userId1 === user.id.toString() ? userId2 : userId1;
        
        // If we haven't seen this chat before, or if this message is newer
        if (!chatMap.has(chatId) || new Date(message.timestamp) > new Date(chatMap.get(chatId).timestamp)) {
          chatMap.set(chatId, {
            ...message,
            otherUserId,
            bookId,
            messageType: message.messageType || 'general'
          });
        }
      }
      
      // Convert map to array
      const latestChats = Array.from(chatMap.values());
      
      // Fetch additional info for each chat
      const chatsWithDetails = await Promise.all(
        latestChats.map(async (chat) => {
          try {
            // Fetch other user details
            const userResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/users/${chat.otherUserId}`);
            
            // Fetch book details
            const bookResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/books/${chat.bookId}`);
            
            // Determine transaction type
            let transactionType = 'general';
            if (chat.messageType === 'swap_offer') {
              transactionType = 'swap';
            } else if (chat.messageType === 'borrow_request') {
              transactionType = 'borrow';
            } else if (bookResponse.data.data.attributes.bookType === 'For Swap') {
              transactionType = 'swap';
            } else if (bookResponse.data.data.attributes.bookType === 'For Borrowing') {
              transactionType = 'borrow';
            } else if (bookResponse.data.data.attributes.bookType === 'For Sale') {
              transactionType = 'buy';
            }
            
            return {
              ...chat,
              otherUser: userResponse.data,
              book: bookResponse.data.data,
              transactionType
            };
          } catch (err) {
            console.error('Error fetching chat details:', err);
            return {
              ...chat,
              otherUser: { username: 'Unknown User' },
              book: { attributes: { title: 'Unknown Book' } },
              transactionType: 'general'
            };
          }
        })
      );
      
      setChats(chatsWithDetails);
      setError(null);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load your messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSwapRequests = async () => {
    try {
      // Get all swap offers where the user is either buyer or seller
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/swap-offers?filters[$or][0][buyerId][$eq]=${user.id}&filters[$or][1][sellerId][$eq]=${user.id}&sort[0]=timestamp:desc`
      );
      
      const swaps = response.data.data || [];
      
      // Fetch additional info for each swap
      const swapsWithDetails = await Promise.all(
        swaps.map(async (swap) => {
          try {
            // Fetch book details
            const bookResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/books/${swap.attributes.bookId}`);
            
            // Fetch other user details (buyer or seller, depending on who the current user is)
            const otherUserId = swap.attributes.buyerId === user.id ? swap.attributes.sellerId : swap.attributes.buyerId;
            const userResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/users/${otherUserId}`);
            
            return {
              ...swap.attributes,
              id: swap.id,
              book: bookResponse.data.data,
              otherUser: userResponse.data,
              isUserBuyer: swap.attributes.buyerId === user.id
            };
          } catch (err) {
            console.error('Error fetching swap details:', err);
            return {
              ...swap.attributes,
              id: swap.id,
              book: { attributes: { title: 'Unknown Book' } },
              otherUser: { username: 'Unknown User' },
              isUserBuyer: swap.attributes.buyerId === user.id
            };
          }
        })
      );
      
      setSwapRequests(swapsWithDetails);
    } catch (err) {
      console.error('Error fetching swap requests:', err);
    }
  };

  const fetchBorrowRequests = async () => {
    try {
      // Get all borrow requests where the user is either borrower or lender
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/borrow-requests?filters[$or][0][borrowerId][$eq]=${user.id}&filters[$or][1][lenderId][$eq]=${user.id}&sort[0]=timestamp:desc`
      );
      
      const borrows = response.data.data || [];
      
      // Fetch additional info for each borrow request
      const borrowsWithDetails = await Promise.all(
        borrows.map(async (borrow) => {
          try {
            // Fetch book details
            const bookResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/books/${borrow.attributes.bookId}`);
            
            // Fetch other user details (borrower or lender, depending on who the current user is)
            const otherUserId = borrow.attributes.borrowerId === user.id ? borrow.attributes.lenderId : borrow.attributes.borrowerId;
            const userResponse = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/users/${otherUserId}`);
            
            return {
              ...borrow.attributes,
              id: borrow.id,
              book: bookResponse.data.data,
              otherUser: userResponse.data,
              isUserBorrower: borrow.attributes.borrowerId === user.id
            };
          } catch (err) {
            console.error('Error fetching borrow details:', err);
            return {
              ...borrow.attributes,
              id: borrow.id,
              book: { attributes: { title: 'Unknown Book' } },
              otherUser: { username: 'Unknown User' },
              isUserBorrower: borrow.attributes.borrowerId === user.id
            };
          }
        })
      );
      
      setBorrowRequests(borrowsWithDetails);
    } catch (err) {
      console.error('Error fetching borrow requests:', err);
    }
  };

  // Handle responding to a swap request
  const handleSwapResponse = async (swapId, accept) => {
    try {
      await authAxios.put(`${import.meta.env.VITE_API_URL}/api/swap-offers/${swapId}`, {
        data: {
          status: accept ? 'accepted' : 'declined'
        }
      });
      
      // Send a message to notify the other user
      const swap = swapRequests.find(s => s.id === swapId);
      if (swap) {
        const chatId = `${swap.buyerId}_${swap.sellerId}_${swap.bookId}`;
        const message = accept
          ? "I've accepted your swap offer! Let's coordinate to exchange books."
          : "I'm sorry, but I've declined your swap offer.";
        
        await authAxios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
          chatId,
          senderId: user.id,
          receiverId: swap.isUserBuyer ? swap.sellerId : swap.buyerId,
          bookId: swap.bookId,
          text: message,
          timestamp: new Date().toISOString(),
          messageType: accept ? 'swap_accepted' : 'swap_declined'
        });
      }
      
      // Refresh swap requests
      fetchSwapRequests();
    } catch (err) {
      console.error('Error responding to swap request:', err);
      alert('Failed to respond to swap request. Please try again.');
    }
  };

  // Handle responding to a borrow request
  const handleBorrowResponse = async (borrowId, accept) => {
    try {
      await authAxios.put(`${import.meta.env.VITE_API_URL}/api/borrow-requests/${borrowId}`, {
        data: {
          status: accept ? 'accepted' : 'declined'
        }
      });
      
      // Send a message to notify the other user
      const borrow = borrowRequests.find(b => b.id === borrowId);
      if (borrow) {
        const chatId = `${borrow.borrowerId}_${borrow.lenderId}_${borrow.bookId}`;
        const message = accept
          ? "I've accepted your borrowing request! Let's coordinate for pickup."
          : "I'm sorry, but I've declined your borrowing request.";
        
        await authAxios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
          chatId,
          senderId: user.id,
          receiverId: borrow.isUserBorrower ? borrow.lenderId : borrow.borrowerId,
          bookId: borrow.bookId,
          text: message,
          timestamp: new Date().toISOString(),
          messageType: accept ? 'borrow_accepted' : 'borrow_declined'
        });
      }
      
      // Refresh borrow requests
      fetchBorrowRequests();
    } catch (err) {
      console.error('Error responding to borrow request:', err);
      alert('Failed to respond to borrow request. Please try again.');
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If it's today, show only the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's yesterday, show "Yesterday" and time
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's within the last week, show day name and time
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    if (date > lastWeek) {
      return `${date.toLocaleDateString([], { weekday: 'short' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise, show date
    return date.toLocaleDateString();
  };

  // Get filtered chats based on active tab
  const getFilteredChats = () => {
    if (activeTab === 'all') {
      return chats;
    }
    return chats.filter(chat => chat.transactionType === activeTab);
  };

  // Get transaction type specific styling
  const getTransactionTypeStyle = (type) => {
    switch (type) {
      case 'swap':
        return 'bg-blue-100 text-blue-800';
      case 'borrow':
        return 'bg-purple-100 text-purple-800';
      case 'buy':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'swap':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'borrow':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'buy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  // Calculate counts for tab badges
  const getCounts = () => {
    const counts = {
      all: chats.length,
      swap: chats.filter(chat => chat.transactionType === 'swap').length,
      borrow: chats.filter(chat => chat.transactionType === 'borrow').length,
      buy: chats.filter(chat => chat.transactionType === 'buy').length,
      swapRequests: swapRequests.filter(swap => swap.sellerId === user.id && swap.status === 'pending').length,
      borrowRequests: borrowRequests.filter(borrow => borrow.lenderId === user.id && borrow.status === 'pending').length
    };
    
    return counts;
  };

  const counts = getCounts();

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Link to="/books" className="text-blue-600 hover:text-blue-800">
          Browse Books
        </Link>
      </div>
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab('all')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Messages
            {counts.all > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                {counts.all}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('swap')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'swap'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Swaps
            {counts.swap > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">
                {counts.swap}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('borrow')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'borrow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Borrowing
            {counts.borrow > 0 && (
              <span className="ml-2 bg-purple-100 text-purple-700 py-0.5 px-2 rounded-full text-xs">
                {counts.borrow}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('buy')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'buy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Purchases
            {counts.buy > 0 && (
              <span className="ml-2 bg-green-100 text-green-700 py-0.5 px-2 rounded-full text-xs">
                {counts.buy}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('requests')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Requests
            {(counts.swapRequests + counts.borrowRequests) > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-xs">
                {counts.swapRequests + counts.borrowRequests}
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => {
              fetchChats();
              fetchSwapRequests();
              fetchBorrowRequests();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : activeTab === 'requests' ? (
        <div>
          {/* Swap Requests */}
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-3">Swap Requests</h2>
            {swapRequests.filter(swap => swap.sellerId === user.id && swap.status === 'pending').length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No pending swap requests to review.
              </div>
            ) : (
              <div className="space-y-4">
                {swapRequests
                  .filter(swap => swap.sellerId === user.id && swap.status === 'pending')
                  .map(swap => (
                    <div key={swap.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-800">{swap.otherUser?.username} wants to swap for your book</h3>
                          <p className="text-blue-700 text-sm font-medium">{swap.book?.attributes?.title}</p>
                          <p className="text-gray-600 text-sm mt-1">Requested {formatTimestamp(swap.timestamp)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pl-11">
                        <p className="text-sm text-gray-700 mb-2">Offered Books:</p>
                        <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                          {/* In a real implementation, you would fetch and display the offered books */}
                          <p className="text-gray-600 text-sm italic">View the chat to see which books were offered</p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleSwapResponse(swap.id, true)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Accept Swap
                          </button>
                          <button 
                            onClick={() => handleSwapResponse(swap.id, false)}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                          >
                            Decline
                          </button>
                          <Link 
                            to={`/chat/${swap.buyerId}/${swap.bookId}`}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 ml-auto"
                          >
                            View Chat
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {/* Borrow Requests */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Borrowing Requests</h2>
            {borrowRequests.filter(borrow => borrow.lenderId === user.id && borrow.status === 'pending').length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No pending borrowing requests to review.
              </div>
            ) : (
              <div className="space-y-4">
                {borrowRequests
                  .filter(borrow => borrow.lenderId === user.id && borrow.status === 'pending')
                  .map(borrow => (
                    <div key={borrow.id} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-800">{borrow.otherUser?.username} wants to borrow your book</h3>
                          <p className="text-purple-700 text-sm font-medium">{borrow.book?.attributes?.title}</p>
                          <p className="text-gray-600 text-sm mt-1">Requested {formatTimestamp(borrow.timestamp)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pl-11">
                        <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Duration: </span>
                              <span className="font-medium">{borrow.duration}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Return By: </span>
                              <span className="font-medium">{new Date(borrow.returnDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Deposit: </span>
                              <span className="font-medium">${borrow.depositAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleBorrowResponse(borrow.id, true)}
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            Accept Request
                          </button>
                          <button 
                            onClick={() => handleBorrowResponse(borrow.id, false)}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                          >
                            Decline
                          </button>
                          <Link 
                            to={`/chat/${borrow.borrowerId}/${borrow.bookId}`}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 ml-auto"
                          >
                            View Chat
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : getFilteredChats().length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No messages yet</h3>
          <p className="text-gray-600 mb-4">
            Browse books and start conversations with sellers to see messages here.
          </p>
          <Link to="/books" className="inline-block px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 py-3 px-4">
            <h2 className="font-medium">Recent Conversations</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {getFilteredChats().map((chat) => (
              <Link 
                key={chat.id} 
                to={`/chat/${chat.otherUserId}/${chat.bookId}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex">
                  {/* User avatar or book image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {chat.book?.attributes?.cover?.data ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}${chat.book.attributes.cover.data.attributes.url}`} 
                        alt={chat.book.attributes.title}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {chat.otherUser?.username ? chat.otherUser.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-800">{chat.otherUser?.username || 'Unknown User'}</h3>
                        <span className={`ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getTransactionTypeStyle(chat.transactionType)}`}>
                          {getTransactionTypeIcon(chat.transactionType)}
                          {chat.transactionType === 'swap' ? 'Swap' : 
                           chat.transactionType === 'borrow' ? 'Borrow' : 
                           chat.transactionType === 'buy' ? 'Purchase' : 'Chat'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(chat.timestamp)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {chat.senderId === user.id ? 'You: ' : ''}{chat.text.length > 30 ? chat.text.substring(0, 30) + '...' : chat.text}
                      </p>
                      
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {chat.book?.attributes?.title ? `Re: ${chat.book.attributes.title.substring(0, 15)}${chat.book.attributes.title.length > 15 ? '...' : ''}` : 'Unknown Book'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
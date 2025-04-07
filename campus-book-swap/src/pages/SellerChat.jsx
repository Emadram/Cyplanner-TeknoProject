import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SellerChat = () => {
  const { sellerId, bookId } = useParams();
  const { user, authAxios, isAuthenticated } = useAuth();
  const [seller, setSeller] = useState(null);
  const [book, setBook] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Generate swap offer template
  const generateSwapTemplate = () => {
    if (!book) return '';
    
    const swapTemplate = `Hi, I'm interested in swapping for your book "${book.attributes?.title || 'your book'}". I have the following books to offer:
- [Book title 1]
- [Book title 2]

Would any of these interest you for a swap? I can provide more details or photos if needed.`;
    
    setNewMessage(swapTemplate);
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
        <Link to="/books" className="text-blue-600 hover:text-blue-800">
          Back to Books
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150x225?text=No+Cover';
                    }}
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
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    For Swap
                  </span>
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
              <button 
                onClick={generateSwapTemplate}
                className="mt-4 text-blue-600 text-sm hover:underline"
              >
                Use swap offer template
              </button>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={message.id || index} 
                className={`mb-4 flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.senderId === user.id 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
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
          <div className="mt-2 flex justify-between">
            <button 
              onClick={generateSwapTemplate}
              className="text-blue-600 text-sm hover:underline"
            >
              Use swap template
            </button>
            <span className="text-xs text-gray-500">
              Press Enter to send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerChat;
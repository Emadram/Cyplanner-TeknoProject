import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Messages = () => {
  const { user, authAxios, isAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirectTo=' + encodeURIComponent(window.location.pathname));
    } else if (user && user.id) {
      fetchChats();
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
            bookId
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
            
            return {
              ...chat,
              otherUser: userResponse.data,
              book: bookResponse.data.data
            };
          } catch (err) {
            console.error('Error fetching chat details:', err);
            return {
              ...chat,
              otherUser: { username: 'Unknown User' },
              book: { attributes: { title: 'Unknown Book' } }
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Link to="/books" className="text-blue-600 hover:text-blue-800">
          Browse Books
        </Link>
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
            onClick={fetchChats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : chats.length === 0 ? (
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
            {chats.map((chat) => (
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
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = null;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {chat.otherUser?.username ? chat.otherUser.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800">{chat.otherUser?.username || 'Unknown User'}</h3>
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
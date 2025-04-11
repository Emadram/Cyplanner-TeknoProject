import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import BookForm from '../components/BookForm';

const Dashboard = () => {
  const { user, authAxios, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookForm, setShowBookForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // User data state
  const [myBooks, setMyBooks] = useState([]);
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [pendingBorrows, setPendingBorrows] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    totalEarnings: 0,
    savedBySwapping: 0
  });

  // Check authentication on load
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirectTo=/dashboard');
    } else if (user && user.id) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchMyBooks(),
        fetchPendingSwaps(),
        fetchPendingBorrows(),
        fetchBorrowedBooks(),
        fetchTransactionHistory(),
        calculateStats()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's books
  const fetchMyBooks = async () => {
    try {
      // Get books where users_permissions_user matches current user ID
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/books?filters[users_permissions_user][id][$eq]=${user.id}&populate=*`
      );
      
      const books = response.data.data.map(book => ({
        id: book.id,
        ...book.attributes,
        cover: book.attributes.cover?.data ? 
          `${import.meta.env.VITE_API_URL}${book.attributes.cover.data.attributes.url}` : 
          null,
        category: book.attributes.category?.data ? {
          id: book.attributes.category.data.id,
          name: book.attributes.category.data.attributes?.name || 
                book.attributes.category.data.attributes?.Type || 
                'Unknown Category'
        } : null
      }));
      
      setMyBooks(books);
    } catch (err) {
      console.error('Error fetching books:', err);
      throw err;
    }
  };

  // Fetch pending swap requests
  const fetchPendingSwaps = async () => {
    try {
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/swap-offers?filters[$or][0][buyerId][$eq]=${user.id}&filters[$or][1][sellerId][$eq]=${user.id}&filters[status][$eq]=pending&populate=*`
      );
      
      const swaps = response.data.data || [];
      
      // Process the data
      const processedSwaps = await Promise.all(swaps.map(async (swap) => {
        try {
          // Determine if the user is the buyer or seller
          const isUserBuyer = swap.attributes.buyerId === user.id;
          
          // Fetch the book details
          const bookResponse = await authAxios.get(
            `${import.meta.env.VITE_API_URL}/api/books/${swap.attributes.bookId}?populate=*`
          );
          
          // Fetch the other user's details
          const otherUserId = isUserBuyer ? swap.attributes.sellerId : swap.attributes.buyerId;
          const userResponse = await authAxios.get(
            `${import.meta.env.VITE_API_URL}/api/users/${otherUserId}`
          );
          
          // Return processed swap data
          return {
            id: swap.id,
            ...swap.attributes,
            isUserBuyer,
            book: bookResponse.data.data,
            otherUser: userResponse.data,
            type: 'swap'
          };
        } catch (err) {
          console.error('Error processing swap data:', err);
          return {
            id: swap.id,
            ...swap.attributes,
            isUserBuyer: swap.attributes.buyerId === user.id,
            book: { attributes: { title: 'Unknown Book' } },
            otherUser: { username: 'Unknown User' },
            type: 'swap'
          };
        }
      }));
      
      setPendingSwaps(processedSwaps);
    } catch (err) {
      console.error('Error fetching pending swaps:', err);
      throw err;
    }
  };

  // Fetch pending borrow requests
  const fetchPendingBorrows = async () => {
    try {
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/borrow-requests?filters[$or][0][borrowerId][$eq]=${user.id}&filters[$or][1][lenderId][$eq]=${user.id}&filters[status][$eq]=pending&populate=*`
      );
      
      const borrows = response.data.data || [];
      
      // Process the data
      const processedBorrows = await Promise.all(borrows.map(async (borrow) => {
        try {
          // Determine if the user is the borrower or lender
          const isUserBorrower = borrow.attributes.borrowerId === user.id;
          
          // Fetch the book details
          const bookResponse = await authAxios.get(
            `${import.meta.env.VITE_API_URL}/api/books/${borrow.attributes.bookId}?populate=*`
          );
          
          // Fetch the other user's details
          const otherUserId = isUserBorrower ? borrow.attributes.lenderId : borrow.attributes.borrowerId;
          const userResponse = await authAxios.get(
            `${import.meta.env.VITE_API_URL}/api/users/${otherUserId}`
          );
          
          // Return processed borrow data
          return {
            id: borrow.id,
            ...borrow.attributes,
            isUserBorrower,
            book: bookResponse.data.data,
            otherUser: userResponse.data,
            type: 'borrow'
          };
        } catch (err) {
          console.error('Error processing borrow data:', err);
          return {
            id: borrow.id,
            ...borrow.attributes,
            isUserBorrower: borrow.attributes.borrowerId === user.id,
            book: { attributes: { title: 'Unknown Book' } },
            otherUser: { username: 'Unknown User' },
            type: 'borrow'
          };
        }
      }));
      
      setPendingBorrows(processedBorrows);
    } catch (err) {
      console.error('Error fetching pending borrows:', err);
      throw err;
    }
  };

  // Fetch books currently borrowed by the user
  const fetchBorrowedBooks = async () => {
    try {
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/borrow-requests?filters[borrowerId][$eq]=${user.id}&filters[status][$eq]=borrowed&populate=*`
      );
      
      const borrows = response.data.data || [];
      
      // Process the data
      const processedBorrows = await Promise.all(borrows.map(async (borrow) => {
        try {
          // Fetch the book details
          const bookResponse = await authAxios.get(
            `${import.meta.env.VITE_API_URL}/api/books/${borrow.attributes.bookId}?populate=*`
          );
          
          // Fetch the lender's details
          const userResponse = await authAxios.get(
            `${import.meta.env.VITE_API_URL}/api/users/${borrow.attributes.lenderId}`
          );
          
          // Calculate days until due
          const dueDate = new Date(borrow.attributes.returnDate);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          
          // Return processed borrow data
          return {
            id: borrow.id,
            ...borrow.attributes,
            book: bookResponse.data.data,
            lender: userResponse.data,
            daysUntilDue,
            isOverdue: daysUntilDue < 0
          };
        } catch (err) {
          console.error('Error processing borrowed book data:', err);
          return {
            id: borrow.id,
            ...borrow.attributes,
            book: { attributes: { title: 'Unknown Book' } },
            lender: { username: 'Unknown User' },
            daysUntilDue: 0,
            isOverdue: false
          };
        }
      }));
      
      setBorrowedBooks(processedBorrows);
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      throw err;
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    try {
      // Fetch completed transactions (sales, swaps, borrows)
      const salesResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/orders?filters[userId][$eq]=${user.id}&sort[0]=timestamp:desc&populate=*`
      );
      
      const swapsResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/swap-offers?filters[$or][0][buyerId][$eq]=${user.id}&filters[$or][1][sellerId][$eq]=${user.id}&filters[status][$eq]=completed&sort[0]=timestamp:desc&populate=*`
      );
      
      const borrowsResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/borrow-requests?filters[$or][0][borrowerId][$eq]=${user.id}&filters[$or][1][lenderId][$eq]=${user.id}&filters[status][$eq]=returned&sort[0]=timestamp:desc&populate=*`
      );
      
      // Process sales data
      const sales = salesResponse.data.data?.map(order => ({
        id: `sale-${order.id}`,
        type: 'purchase',
        date: order.attributes.timestamp,
        amount: order.attributes.totalAmount,
        status: order.attributes.status,
        items: order.attributes.items,
        role: 'buyer'
      })) || [];
      
      // Process swaps data (minimal processing - we'll do full processing later)
      const swaps = swapsResponse.data.data?.map(swap => ({
        id: `swap-${swap.id}`,
        type: 'swap',
        date: swap.attributes.timestamp,
        bookId: swap.attributes.bookId,
        offerBookIds: swap.attributes.offerBookIds,
        role: swap.attributes.buyerId === user.id ? 'requester' : 'provider'
      })) || [];
      
      // Process borrows data (minimal processing - we'll do full processing later)
      const borrows = borrowsResponse.data.data?.map(borrow => ({
        id: `borrow-${borrow.id}`,
        type: 'borrow',
        date: borrow.attributes.timestamp,
        returnDate: borrow.attributes.returnDate,
        depositAmount: borrow.attributes.depositAmount,
        bookId: borrow.attributes.bookId,
        role: borrow.attributes.borrowerId === user.id ? 'borrower' : 'lender'
      })) || [];
      
      // Combine all transactions and sort by date
      const allTransactions = [...sales, ...swaps, ...borrows].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Now enrich the transactions with full details
      const enrichedTransactions = await Promise.all(allTransactions.map(async (transaction) => {
        try {
          if (transaction.type === 'purchase') {
            // For purchases, we already have most details
            // We could fetch more book details here if needed
            return transaction;
          } 
          else if (transaction.type === 'swap') {
            // For swaps, fetch the main book details
            const bookResponse = await authAxios.get(
              `${import.meta.env.VITE_API_URL}/api/books/${transaction.bookId}?populate=*`
            );
            
            // Determine the other user
            const otherUserId = transaction.role === 'requester' ? 
              transaction.sellerId : transaction.buyerId;
            
            const userResponse = await authAxios.get(
              `${import.meta.env.VITE_API_URL}/api/users/${otherUserId}`
            );
            
            return {
              ...transaction,
              book: bookResponse.data.data,
              otherUser: userResponse.data
            };
          }
          else if (transaction.type === 'borrow') {
            // For borrows, fetch the book details
            const bookResponse = await authAxios.get(
              `${import.meta.env.VITE_API_URL}/api/books/${transaction.bookId}?populate=*`
            );
            
            // Determine the other user
            const otherUserId = transaction.role === 'borrower' ? 
              transaction.lenderId : transaction.borrowerId;
            
            const userResponse = await authAxios.get(
              `${import.meta.env.VITE_API_URL}/api/users/${otherUserId}`
            );
            
            return {
              ...transaction,
              book: bookResponse.data.data,
              otherUser: userResponse.data
            };
          }
          
          return transaction;
        } catch (err) {
          console.error('Error enriching transaction data:', err);
          return transaction;
        }
      }));
      
      setTransactionHistory(enrichedTransactions);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      throw err;
    }
  };

  // Calculate dashboard stats
  const calculateStats = async () => {
    try {
      // This would normally come from API aggregation endpoints
      // For now, we'll calculate based on the data we've fetched
      
      // Mock implementation - in a real app, this would be more sophisticated
      const mockStats = {
        totalListings: 0,
        activeListings: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        totalEarnings: 0,
        savedBySwapping: 0
      };
      
      // Calculate based on API responses
      const booksResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/books/count?filters[users_permissions_user][id][$eq]=${user.id}`
      );
      mockStats.totalListings = booksResponse.data;
      mockStats.activeListings = booksResponse.data; // Assuming all are active for now
      
      // Completed sales + swaps + borrows
      const completedSalesResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/orders/count?filters[userId][$eq]=${user.id}&filters[status][$eq]=completed`
      );
      
      const completedSwapsResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/swap-offers/count?filters[$or][0][buyerId][$eq]=${user.id}&filters[$or][1][sellerId][$eq]=${user.id}&filters[status][$eq]=completed`
      );
      
      const completedBorrowsResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/borrow-requests/count?filters[$or][0][borrowerId][$eq]=${user.id}&filters[$or][1][lenderId][$eq]=${user.id}&filters[status][$eq]=returned`
      );
      
      mockStats.completedTransactions = 
        completedSalesResponse.data + 
        completedSwapsResponse.data + 
        completedBorrowsResponse.data;
      
      // Pending transactions
      const pendingSwapsResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/swap-offers/count?filters[$or][0][buyerId][$eq]=${user.id}&filters[$or][1][sellerId][$eq]=${user.id}&filters[status][$eq]=pending`
      );
      
      const pendingBorrowsResponse = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/borrow-requests/count?filters[$or][0][borrowerId][$eq]=${user.id}&filters[$or][1][lenderId][$eq]=${user.id}&filters[status][$eq]=pending`
      );
      
      mockStats.pendingTransactions = 
        pendingSwapsResponse.data + 
        pendingBorrowsResponse.data;
      
      // For earnings and savings, we would need more detailed calculation
      // Using mock values for demonstration
      mockStats.totalEarnings = 142.50;
      mockStats.savedBySwapping = 87.25;
      
      setStats(mockStats);
    } catch (err) {
      console.error('Error calculating stats:', err);
      throw err;
    }
  };

  // Handle deleting a book
  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await authAxios.delete(`${import.meta.env.VITE_API_URL}/api/books/${bookId}`);
      setMyBooks(myBooks.filter(book => book.id !== bookId));
      // Refresh dashboard data to update statistics
      calculateStats();
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
    }
  };

  // Handle editing a book
  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowBookForm(true);
  };

  // Handle book form success
  const handleBookFormSuccess = () => {
    setShowBookForm(false);
    setSelectedBook(null);
    fetchMyBooks();
    calculateStats();
  };

  // Handle responding to a swap request
  const handleSwapResponse = async (swapId, accept) => {
    try {
      // Update the swap offer status
      await authAxios.put(`${import.meta.env.VITE_API_URL}/api/swap-offers/${swapId}`, {
        data: {
          status: accept ? 'accepted' : 'declined'
        }
      });
      
      // Refresh pending swaps
      fetchPendingSwaps();
      
      // Update the stats
      calculateStats();
      
      // Send a message notification
      const swap = pendingSwaps.find(s => s.id === swapId);
      if (swap) {
        const message = accept
          ? "I've accepted your swap offer! Let's coordinate to exchange the books."
          : "I'm sorry, but I've declined your swap offer.";
        
        await authAxios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
          data: {
            chatId: `${swap.buyerId}_${swap.sellerId}_${swap.bookId}`,
            senderId: user.id,
            receiverId: swap.isUserBuyer ? swap.sellerId : swap.buyerId,
            bookId: swap.bookId,
            text: message,
            timestamp: new Date().toISOString(),
            messageType: accept ? 'swap_accepted' : 'swap_declined'
          }
        });
      }
    } catch (err) {
      console.error('Error responding to swap request:', err);
      setError('Failed to respond to swap request');
    }
  };

  // Handle responding to a borrow request
  const handleBorrowResponse = async (borrowId, accept) => {
    try {
      // Update the borrow request status
      await authAxios.put(`${import.meta.env.VITE_API_URL}/api/borrow-requests/${borrowId}`, {
        data: {
          status: accept ? 'accepted' : 'declined'
        }
      });
      
      // Refresh pending borrows
      fetchPendingBorrows();
      
      // Update the stats
      calculateStats();
      
      // Send a message notification
      const borrow = pendingBorrows.find(b => b.id === borrowId);
      if (borrow) {
        const message = accept
          ? "I've accepted your borrow request! Let's coordinate a pickup time."
          : "I'm sorry, but I've declined your borrow request.";
        
        await authAxios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
          data: {
            chatId: `${borrow.borrowerId}_${borrow.lenderId}_${borrow.bookId}`,
            senderId: user.id,
            receiverId: borrow.isUserBorrower ? borrow.lenderId : borrow.borrowerId,
            bookId: borrow.bookId,
            text: message,
            timestamp: new Date().toISOString(),
            messageType: accept ? 'borrow_accepted' : 'borrow_declined'
          }
        });
      }
    } catch (err) {
      console.error('Error responding to borrow request:', err);
      setError('Failed to respond to borrow request');
    }
  };

  // Format timestamp
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate total pending actions
  const pendingActionsCount = pendingSwaps.length + pendingBorrows.length;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Dashboard Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('myBooks')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'myBooks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Books
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`mr-8 py-4 px-1 relative ${
                activeTab === 'actions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Actions
              {pendingActionsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {pendingActionsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'borrowed'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Books I'm Borrowing
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transaction History
            </button>
          </nav>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm font-medium uppercase">My Books</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalListings}</p>
                  <p className="text-gray-500 text-sm">{stats.activeListings} active</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 text-sm font-medium uppercase">Earnings</p>
                  <p className="text-2xl font-bold text-gray-800">${stats.totalEarnings.toFixed(2)}</p>
                  <p className="text-gray-500 text-sm">From sales</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 text-sm font-medium uppercase">Saved</p>
                  <p className="text-2xl font-bold text-gray-800">${stats.savedBySwapping.toFixed(2)}</p>
                  <p className="text-gray-500 text-sm">By swapping & borrowing</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium uppercase">Transactions</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.completedTransactions}</p>
                  <p className="text-gray-500 text-sm">{stats.pendingTransactions} pending</p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button 
                  onClick={() => {
                    setSelectedBook(null);
                    setShowBookForm(true);
                  }}
                  className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3 justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  List a New Book
                </button>
                
                <Link
                  to="/books"
                  className="bg-gray-100 text-gray-800 p-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-3 justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Books
                </Link>
                
                <Link
                  to="/messages"
                  className="bg-gray-100 text-gray-800 p-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-3 justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Messages
                </Link>
              </div>
              
              {/* Recent Activity and Pending Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Activity
                  </h3>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {transactionHistory.slice(0, 5).length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No recent activity to display
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {transactionHistory.slice(0, 5).map(transaction => (
                          <div key={transaction.id} className="p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {transaction.type === 'purchase' ? 'Purchased books' : 
                                   transaction.type === 'swap' ? (transaction.role === 'requester' ? 'Requested swap' : 'Provided swap') :
                                   transaction.role === 'borrower' ? 'Borrowed book' : 'Lent book'}
                                </p>
                                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                              </div>
                              
                              {transaction.type === 'purchase' && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                  ${transaction.amount.toFixed(2)}
                                </span>
                              )}
                              
                              {transaction.type === 'swap' && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  Swap
                                </span>
                              )}
                              
                              {transaction.type === 'borrow' && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                  Borrow
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-right">
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All Activity
                    </button>
                  </div>
                </div>
                
                {/* Pending Actions */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Pending Actions
                    {pendingActionsCount > 0 && (
                      <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                        {pendingActionsCount}
                      </span>
                    )}
                  </h3>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {pendingActionsCount === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No pending actions to complete
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {/* Show Swap Requests that require user's action */}
                        {pendingSwaps.filter(swap => !swap.isUserBuyer).map(swap => (
                          <div key={`swap-${swap.id}`} className="p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">
                                  <span className="text-blue-600">{swap.otherUser?.username}</span> requested to swap for your book
                                </p>
                                <p className="text-sm text-gray-600 font-medium mt-1">
                                  Book: {swap.book?.attributes?.title}
                                </p>
                                <div className="mt-2 flex space-x-2">
                                  <button 
                                    onClick={() => handleSwapResponse(swap.id, true)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleSwapResponse(swap.id, false)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                Swap Request
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {/* Show Borrow Requests that require user's action */}
                        {pendingBorrows.filter(borrow => !borrow.isUserBorrower).map(borrow => (
                          <div key={`borrow-${borrow.id}`} className="p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">
                                  <span className="text-purple-600">{borrow.otherUser?.username}</span> requested to borrow your book
                                </p>
                                <p className="text-sm text-gray-600 font-medium mt-1">
                                  Book: {borrow.book?.attributes?.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Duration: {borrow.duration} • Return by: {formatDate(borrow.returnDate)}
                                </p>
                                <div className="mt-2 flex space-x-2">
                                  <button 
                                    onClick={() => handleBorrowResponse(borrow.id, true)}
                                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleBorrowResponse(borrow.id, false)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                Borrow Request
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-right">
                    <button 
                      onClick={() => setActiveTab('actions')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All Actions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* My Books Tab */}
        {activeTab === 'myBooks' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">My Listed Books</h2>
              <button 
                onClick={() => {
                  setSelectedBook(null);
                  setShowBookForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                List a New Book
              </button>
            </div>
            
            {myBooks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500 mb-4">You don't have any listed books yet.</p>
                <button 
                  onClick={() => {
                    setSelectedBook(null);
                    setShowBookForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  List a Book
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBooks.map(book => (
                  <div key={book.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 flex">
                      <div className="w-24 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {book.cover ? (
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
                      
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-lg text-gray-800">{book.title}</h3>
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${book.bookType === 'For Sale' ? 'bg-green-100 text-green-800' : 
                              book.bookType === 'For Swap' ? 'bg-blue-100 text-blue-800' : 
                              'bg-purple-100 text-purple-800'}
                          `}>
                            {book.bookType}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">by {book.author}</p>
                        <div className="mt-2 text-sm">
                          <p><span className="font-medium">Condition:</span> {book.condition}</p>
                          {book.subject && <p><span className="font-medium">Subject:</span> {book.subject}</p>}
                          {book.category && <p><span className="font-medium">Category:</span> {book.category.name}</p>}
                          
                          {book.bookType === 'For Sale' && book.price && (
                            <p><span className="font-medium">Price:</span> ${book.price.toFixed(2)}</p>
                          )}
                          
                          {book.bookType === 'For Swap' && book.exchange && (
                            <p><span className="font-medium">Swap For:</span> {book.exchange}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEditBook(book)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Pending Actions Tab */}
        {activeTab === 'actions' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Pending Actions</h2>
            
            {pendingActionsCount === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">You have no pending actions to complete</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Swap Requests Section */}
                {pendingSwaps.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-3 text-blue-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Swap Requests
                    </h3>
                    
                    <div className="space-y-4">
                      {pendingSwaps.map(swap => (
                        <div key={swap.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {swap.otherUser?.username ? swap.otherUser.username.charAt(0).toUpperCase() : 'U'}
                              </div>
                            </div>
                            
                            <div className="ml-4 flex-grow">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-800">
                                  {swap.isUserBuyer ? 
                                    `You requested to swap with ${swap.otherUser?.username}` : 
                                    `${swap.otherUser?.username} wants to swap with you`}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatDate(swap.timestamp)}
                                </span>
                              </div>
                              
                              <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                  <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {swap.book?.attributes?.cover?.data ? (
                                      <img 
                                        src={`${import.meta.env.VITE_API_URL}${swap.book.attributes.cover.data.attributes.url}`} 
                                        alt={swap.book.attributes.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">No image</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="ml-3">
                                    <h5 className="font-medium text-gray-800">{swap.book?.attributes?.title}</h5>
                                    <p className="text-sm text-gray-500">{swap.book?.attributes?.author}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {swap.isUserBuyer ? (
                                <div className="mt-2 flex space-x-2">
                                  <Link
                                    to={`/chat/${swap.sellerId}/${swap.bookId}`}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                  >
                                    View in Messages
                                  </Link>
                                </div>
                              ) : (
                                <div className="mt-2 flex space-x-2">
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
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pending Borrow Requests Section */}
                {pendingBorrows.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-3 text-purple-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Borrow Requests
                    </h3>
                    
                    <div className="space-y-4">
                      {pendingBorrows.map(borrow => (
                        <div key={borrow.id} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                {borrow.otherUser?.username ? borrow.otherUser.username.charAt(0).toUpperCase() : 'U'}
                              </div>
                            </div>
                            
                            <div className="ml-4 flex-grow">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-800">
                                  {borrow.isUserBorrower ? 
                                    `You requested to borrow from ${borrow.otherUser?.username}` : 
                                    `${borrow.otherUser?.username} wants to borrow from you`}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatDate(borrow.timestamp)}
                                </span>
                              </div>
                              
                              <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                  <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                    {borrow.book?.attributes?.cover?.data ? (
                                      <img 
                                        src={`${import.meta.env.VITE_API_URL}${borrow.book.attributes.cover.data.attributes.url}`} 
                                        alt={borrow.book.attributes.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">No image</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="ml-3">
                                    <h5 className="font-medium text-gray-800">{borrow.book?.attributes?.title}</h5>
                                    <p className="text-sm text-gray-500">{borrow.book?.attributes?.author}</p>
                                  </div>
                                </div>
                                
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Duration: </span>
                                    <span className="font-medium">{borrow.duration}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Return By: </span>
                                    <span className="font-medium">{formatDate(borrow.returnDate)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Deposit: </span>
                                    <span className="font-medium">${borrow.depositAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {borrow.isUserBorrower ? (
                                <div className="mt-2 flex space-x-2">
                                  <Link
                                    to={`/chat/${borrow.lenderId}/${borrow.bookId}`}
                                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                                  >
                                    View in Messages
                                  </Link>
                                </div>
                              ) : (
                                <div className="mt-2 flex space-x-2">
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
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Books I'm Borrowing Tab */}
        {activeTab === 'borrowed' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Books I'm Borrowing</h2>
            
            {borrowedBooks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 mb-4">You're not currently borrowing any books.</p>
                <Link to="/books" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Browse Books to Borrow
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {borrowedBooks.map(borrow => (
                  <div 
                    key={borrow.id} 
                    className={`rounded-lg p-4 border ${borrow.isOverdue ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}
                  >
                    <div className="flex">
                      <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {borrow.book?.attributes?.cover?.data ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL}${borrow.book.attributes.cover.data.attributes.url}`} 
                            alt={borrow.book.attributes.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-800">{borrow.book?.attributes?.title}</h3>
                          {borrow.isOverdue ? (
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              Overdue
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">by {borrow.book?.attributes?.author}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Due Date: </span>
                            <span className={`font-medium ${borrow.isOverdue ? 'text-red-600' : ''}`}>
                              {formatDate(borrow.returnDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status: </span>
                            <span className="font-medium">
                              {borrow.isOverdue ? 
                                `Overdue by ${Math.abs(borrow.daysUntilDue)} days` : 
                                `${borrow.daysUntilDue} days remaining`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lender: </span>
                            <span className="font-medium">{borrow.lender?.username}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Deposit: </span>
                            <span className="font-medium">${borrow.depositAmount.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Link 
                            to={`/chat/${borrow.lenderId}/${borrow.bookId}`}
                            className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            Contact Lender
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Transaction History</h2>
            
            {transactionHistory.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No transaction history yet</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactionHistory.map(transaction => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${transaction.type === 'purchase' ? 'bg-green-100 text-green-800' : 
                                transaction.type === 'swap' ? 'bg-blue-100 text-blue-800' : 
                                'bg-purple-100 text-purple-800'}`}>
                              {transaction.type === 'purchase' ? 'Purchase' : 
                               transaction.type === 'swap' ? 'Swap' : 'Borrow'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.type === 'purchase' ? 
                              (transaction.items && transaction.items.length > 0 ? 
                                `${transaction.items[0].title}${transaction.items.length > 1 ? ` +${transaction.items.length - 1} more` : ''}` : 
                                'Multiple items') : 
                              transaction.book?.attributes?.title || 'Unknown Book'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.role === 'buyer' ? 'Buyer' : 
                             transaction.role === 'requester' ? 'Requester' : 
                             transaction.role === 'provider' ? 'Provider' : 
                             transaction.role === 'borrower' ? 'Borrower' : 'Lender'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.type === 'purchase' ? 
                              `$${transaction.amount.toFixed(2)}` : 
                              transaction.type === 'borrow' ? 
                                `$${transaction.depositAmount?.toFixed(2) || '0.00'} (deposit)` : 
                                '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {transaction.type === 'purchase' ? 
                                transaction.status || 'Completed' : 
                                'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Book Form Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedBook ? 'Edit Book' : 'List a New Book'}
              </h3>
              <button 
                onClick={() => {
                  setShowBookForm(false);
                  setSelectedBook(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <BookForm 
                bookToEdit={selectedBook} 
                onSuccess={handleBookFormSuccess} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

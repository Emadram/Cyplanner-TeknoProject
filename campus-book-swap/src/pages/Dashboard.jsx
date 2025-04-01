import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import BookForm from '../components/BookFrom.jsx';

const Dashboard = () => {
  const { user, authAxios } = useAuth();
  const [activeTab, setActiveTab] = useState('myBooks');
  const [myBooks, setMyBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchMyBooks();
    }
  }, [user]);

  const fetchMyBooks = async () => {
    if (!user || !user.id) return;
    
    setIsLoading(true);
    try {
      // Get books where users_permissions_user matches current user ID
      const response = await authAxios.get(
        `${import.meta.env.VITE_API_URL}/api/books?filters[users_permissions_user][id][$eq]=${user.id}&populate=*`
      );
      
      console.log("My books response:", response.data);
      
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
      
      console.log("Processed books:", books);
      setMyBooks(books);
      setError('');
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('There was a problem loading your books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await authAxios.delete(`${import.meta.env.VITE_API_URL}/api/books/${bookId}`);
      setMyBooks(myBooks.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
    }
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowBookForm(true);
  };

  const handleBookFormSuccess = () => {
    setShowBookForm(false);
    setSelectedBook(null);
    fetchMyBooks();
  };

  const renderMyBooks = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      );
    }

    if (myBooks.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any listed books yet.</p>
          <button 
            onClick={() => setShowBookForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            List a Book
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">My Listed Books</h2>
          <button 
            onClick={() => setShowBookForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            List a Book
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBooks.map(book => (
            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 flex">
                {book.cover ? (
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-24 h-36 object-cover rounded mr-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150x225?text=No+Cover';
                    }}
                  />
                ) : (
                  <div className="w-24 h-36 bg-gray-200 rounded flex items-center justify-center mr-4">
                    <span className="text-gray-500">No Cover</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{book.title}</h3>
                  <p className="text-gray-500 text-sm">by {book.author}</p>
                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Condition:</span> {book.condition}</p>
                    {book.subject && <p><span className="font-medium">Subject:</span> {book.subject}</p>}
                    {book.category && <p><span className="font-medium">Category:</span> {book.category.name}</p>}
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
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Back to Home
        </Link>
      </div>
      
      {user && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <p className="text-gray-700">Welcome, <span className="font-medium">{user.username || user.email}</span>!</p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
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
            {!showBookForm && (
              <button
                onClick={() => setShowBookForm(true)}
                className={`mr-8 py-4 px-1 ${
                  activeTab === 'listBook'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                List a Book
              </button>
            )}
          </nav>
        </div>
      </div>
      
      {showBookForm ? (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{selectedBook ? 'Edit Book' : 'List a New Book'}</h2>
            <button 
              onClick={() => {
                setShowBookForm(false);
                setSelectedBook(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <BookForm 
            bookToEdit={selectedBook} 
            onSuccess={handleBookFormSuccess} 
          />
        </div>
      ) : (
        <>
          {activeTab === 'myBooks' && renderMyBooks()}
        </>
      )}
    </div>
  );
};

export default Dashboard;
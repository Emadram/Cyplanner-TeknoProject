import { useState, useEffect } from 'react';

const Home = () => {
  // State variables
  const [activeCategory, setActiveCategory] = useState('All Genres');
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // These will be fetched from the backend
  const categories = [];
  const featuredBooks = [];
  const popularBooks = [];
  const booksOfWeek = [];
  const booksOfYear = [];
  
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
  
  // Component for each book slide
  const BookSlide = ({ book }) => (
    <div className={`book-cell ${book.color} p-6 rounded-lg flex flex-col md:flex-row items-center md:items-start h-full relative overflow-hidden`}>
      <div className="book-img relative z-10 mb-4 md:mb-0 transform transition hover:scale-105">
        <div className={`relative ${book.color} rounded-lg shadow-md h-56 w-40 md:h-64 md:w-48 flex items-center justify-center overflow-hidden`}>
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
        <button onClick={() => setSelectedBook(book)} className="book-see bg-white text-center py-2 px-6 rounded-full font-medium text-sm inline-block hover:bg-opacity-90" style={{ color: book.color?.replace('bg-', 'text-').replace('400', '600') }}>
          See The Book
        </button>
      </div>
    </div>
  );
  
  // Component for book card
  const BookCard = ({ book }) => (
    <div className="book-card bg-white rounded-lg shadow-md overflow-hidden transform transition hover:shadow-lg cursor-pointer" onClick={() => setSelectedBook(book)}>
      <div className="content-wrapper flex p-5 border-b border-gray-100 relative">
        <img src={book.cover} alt={book.title} className="book-card-img w-24 h-36 object-cover rounded shadow-md transition transform hover:scale-105" />
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
                <img src={like.img} alt={like.name} className="like-img w-7 h-7 rounded-full border-2 border-white object-cover" />
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
      <img src={book.img} alt={book.name} className="w-full h-40 object-cover rounded-lg shadow-md" />
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
            <img src={book.cover} alt={book.title} className="w-32 h-48 object-cover rounded shadow-md mr-4 flex-shrink-0" />
          ) : (
            <div className={`${book.color} rounded-lg shadow-md w-32 h-48 flex items-center justify-center mr-4 flex-shrink-0`}>
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
                    <img src={like.img} alt={like.name} className="like-img w-7 h-7 rounded-full border-2 border-white object-cover" />
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
  
  // Placeholder for empty states
  const EmptyStatePlaceholder = ({ type }) => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p className="text-gray-500 text-center">Waiting for {type} to load from backend...</p>
    </div>
  );
  
  return (
    <div className="book-store bg-gray-50 min-h-screen">
      {/* Book Slide Section */}
      {featuredBooks.length > 0 ? (
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
        <div className="p-8">
          <EmptyStatePlaceholder type="featured books" />
        </div>
      )}
      
      {/* Main Content */}
      <div className="main-wrapper flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-6">
        {/* Sidebar */}
        <div className="books-of w-full lg:w-64 flex-shrink-0 lg:mr-6 mb-6 lg:mb-0">
          {/* Featured Books Section (Previously Authors of Week) */}
          <div className="week bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="featured-title font-medium mb-4">Featured Books</div>
            {booksOfWeek.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {booksOfWeek.map(book => (
                  <FeaturedBook key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <EmptyStatePlaceholder type="featured books" />
            )}
          </div>
          
          {/* Books of the Year Section */}
          <div className="year bg-white rounded-lg shadow-sm p-4 relative">
            <div className="year-title font-medium mb-4">Books of the year</div>
            {booksOfYear.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                {booksOfYear.map(book => (
                  <div key={book.id} className="year-book flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <img src={book.img} alt={book.name} className="year-book-img w-12 h-16 rounded shadow mr-3 object-cover" />
                    <div className="year-book-content">
                      <div className="year-book-name text-sm font-medium line-clamp-1">{book.name}</div>
                      <div className="year-book-author text-xs text-gray-500">{book.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStatePlaceholder type="recommended books" />
            )}
            <div className="overlay absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
        
        {/* Popular Books */}
        <div className="popular-books flex-grow bg-white rounded-lg shadow-sm p-6">
          <div className="main-menu flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 mb-6">
            <div className="genre font-medium mb-3 sm:mb-0">Popular by Genre</div>
            
            {/* Desktop Categories */}
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
                <div className="text-sm text-gray-400">Loading categories...</div>
              )}
            </div>
            
            {/* Mobile Category Dropdown */}
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
                  <option>Loading categories...</option>
                )}
              </select>
            </div>
          </div>
          
          {/* Book Cards */}
          {popularBooks.length > 0 ? (
            <div className="book-cards grid grid-cols-1 sm:grid-cols-2 gap-6">
              {popularBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <EmptyStatePlaceholder type="popular books" />
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

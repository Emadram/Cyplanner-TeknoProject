import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All Genres');
  const [selectedBook, setSelectedBook] = useState(null);
  
  const categories = [
    { id: 'all', name: 'All Genres' },
    { id: 'textbooks', name: 'Textbooks' },
    { id: 'fiction', name: 'Fiction' },
    { id: 'manga', name: 'Manga' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'biography', name: 'Biography' }
  ];
  
  const featuredBooks = [
    {
      id: 1,
      title: 'Sample',
      displayTitle: ['THORNS', 'ROSES'],
      author: 'Sarah J. Maas',
      color: 'bg-red-400',
      seller: 'John Doe',
      condition: 'Like New',
      exchange: 'Looking for: The Silent Patient',
      course: 'English Literature 101',
      subject: 'Fantasy Fiction',
      rating: 4.5,
      voters: 1987,
      summary: 'Readers of all ages and walks of life have drawn inspiration and empowerment from Elizabeth Gilbert\'s books for years.',
      likes: [
        { id: 1, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Samantha William' },
        { id: 2, img: 'https://pbs.twimg.com/profile_images/2452384114/noplz47r59v1uxvyg8ku.png', name: 'Tommy Adam' }
      ]
    },
    {
      id: 2,
      title: 'Sample2',
      displayTitle: ['MIST', 'FURY'],
      author: 'Sarah J. Maas',
      color: 'bg-blue-400',
      seller: 'Jane Smith',
      condition: 'Good',
      exchange: 'For Borrowing (2 weeks)',
      course: null,
      subject: 'Fantasy Fiction',
      rating: 4.2,
      voters: 1567,
      summary: 'The hunt for each splinter of Paul\'s soul sends Marguerite racing through a war-torn San Francisco.',
      likes: [
        { id: 3, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Kimberly Jones' }
      ]
    },
    {
      id: 3,
      title: 'Sample3',
      displayTitle: ['FROST', 'STARLIGHT'],
      author: 'Sarah J. Maas',
      color: 'bg-purple-400',
      seller: 'Alex Johnson',
      condition: 'Digital Copy',
      exchange: '$5.99',
      course: 'Creative Writing 202',
      subject: 'Fantasy Fiction',
      rating: 4.8,
      voters: 2110,
      summary: 'In Tokyo, sixteen-year-old Nao has decided there\'s only one escape from her aching loneliness and her classmates\' bullying.',
      likes: [
        { id: 1, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Samantha William' },
        { id: 4, img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', name: 'Jonathan Doe' }
      ]
    },
    {
      id: 4,
      title: 'Sample4',
      displayTitle: ['WINGS', 'RUIN'],
      author: 'Sarah J. Maas',
      color: 'bg-yellow-400',
      seller: 'Sam Wilson',
      condition: 'Digital Copy',
      exchange: 'Looking for: The Alchemist (Digital)',
      course: null,
      subject: 'Fantasy Fiction',
      rating: 4.6,
      voters: 1787,
      summary: 'The Great Gatsby, F. Scott Fitzgerald\'s third book, stands as the supreme achievement of his career.',
      likes: [
        { id: 5, img: 'https://pbs.twimg.com/profile_images/2452384114/noplz47r59v1uxvyg8ku.png', name: 'George' },
        { id: 6, img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', name: 'Mike' }
      ]
    },
    {
      id: 5,
      title: 'Sample5',
      displayTitle: ['AFTER', 'YOU'],
      author: 'Jojo Moyes',
      color: 'bg-pink-400',
      seller: 'Emily Clark',
      condition: 'Excellent',
      exchange: '$8.99',
      course: null,
      subject: 'Romance',
      rating: 4.3,
      voters: 2453,
      summary: 'Louisa Clark is no longer just an ordinary girl living an ordinary life. After the transformative six months spent.',
      likes: [
        { id: 7, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Angelina Stone' }
      ]
    }
  ];
  
  const popularBooks = [
    {
      id: 6,
      title: 'Sample6',
      author: 'Richard Russo',
      cover: 'https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F6%2F2019%2F07%2Fchances-are-1-2000.jpg&q=85',
      rating: 4.1,
      voters: 1987,
      summary: 'Readers of all ages and walks of life have drawn inspiration and empowerment from Elizabeth Gilbert\'s books for years.',
      condition: 'Like New',
      exchange: 'Looking for: The Road',
      subject: 'Fiction',
      likes: [
        { id: 1, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Samantha William' },
        { id: 2, img: 'https://pbs.twimg.com/profile_images/2452384114/noplz47r59v1uxvyg8ku.png', name: 'Tommy Adam' },
        { id: 4, img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', name: 'Jonathan Doe' }
      ]
    },
    {
      id: 7,
      title: 'Sample7',
      author: 'Angie Cruz',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/7167iiDUeAL.jpg',
      rating: 3.9,
      voters: 1249,
      summary: 'Readers of all ages and walks of life have drawn inspiration and empowerment from Elizabeth Gilbert\'s books for years.',
      condition: 'Good',
      exchange: '$10.50',
      subject: 'Fiction',
      likes: [
        { id: 3, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Kimberly Jones' }
      ]
    },
    {
      id: 8,
      title: 'Sample8',
      author: 'Regina Porter',
      cover: 'https://assets.fontsinuse.com/static/use-media-items/95/94294/full-2000x3056/5d56c6b1/cg%201.jpeg?resolution=0',
      rating: 4.4,
      voters: 856,
      summary: 'Readers of all ages and walks of life have drawn inspiration and empowerment from Elizabeth Gilbert\'s books for years.',
      condition: 'New',
      exchange: 'Looking for: Brave New World',
      subject: 'Fiction',
      likes: [
        { id: 3, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Kimberly Jones' },
        { id: 2, img: 'https://pbs.twimg.com/profile_images/2452384114/noplz47r59v1uxvyg8ku.png', name: 'Adam' }
      ]
    },
    {
      id: 9,
      title: 'ASample9',
      author: 'James Lasdun',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/91M4E+SURUL.jpg',
      rating: 3.8,
      voters: 1123,
      summary: 'Readers of all ages and walks of life have drawn inspiration and empowerment from Elizabeth Gilbert\'s books for years.',
      condition: 'Good',
      exchange: 'For Borrowing (3 weeks)',
      subject: 'Fiction',
      likes: [
        { id: 1, img: 'https://randomuser.me/api/portraits/women/63.jpg', name: 'Samantha William' },
        { id: 2, img: 'https://pbs.twimg.com/profile_images/2452384114/noplz47r59v1uxvyg8ku.png', name: 'Tommy Adam' },
        { id: 4, img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', name: 'Jonathan Doe' }
      ]
    }
  ];
  
  const authorsOfWeek = [
    { id: 1, name: 'Sebastian Jeremy', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1400&q=80' },
    { id: 2, name: 'Jonathan Doe', img: 'https://images.unsplash.com/photo-1586297098710-0382a496c814?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80' },
    { id: 3, name: 'Angeline Summer', img: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60' },
    { id: 4, name: 'Noah Jones', img: 'https://pbs.twimg.com/profile_images/737221709267374081/sdwta9Oh.jpg' },
  ];
  
  const booksOfYear = [
    { 
      id: 1, 
      name: 'Disappearing Earth', 
      author: 'by Julia Phillips', 
      img: 'https://images-na.ssl-images-amazon.com/images/I/A1kNdYXw0GL.jpg' 
    },
    { 
      id: 2, 
      name: 'Lost Children Archive', 
      author: 'by Valeria Luiselli', 
      img: 'https://images-na.ssl-images-amazon.com/images/I/81eI0ExR+VL.jpg' 
    },
    { 
      id: 3, 
      name: 'Phantoms: A Thriller', 
      author: 'by Dean Koontz', 
      img: 'https://images-na.ssl-images-amazon.com/images/I/81OF9eJDA4L.jpg' 
    },
    { 
      id: 4, 
      name: 'Midnight in Chernobyl', 
      author: 'by Adam Higginbotham', 
      img: 'https://m.media-amazon.com/images/I/515FWPyZ-5L.jpg' 
    },
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === featuredBooks.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? featuredBooks.length - 1 : prev - 1));
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const BookSlide = ({ book }) => (
    <div className={`book-cell ${book.color} p-6 rounded-lg flex flex-col md:flex-row items-center md:items-start h-full relative overflow-hidden`}>
      <div className="book-img relative z-10 mb-4 md:mb-0 transform transition hover:scale-105">
        <div className={`relative ${book.color} rounded-lg shadow-md h-56 w-40 md:h-64 md:w-48 flex items-center justify-center overflow-hidden`}>
          <div className="text-white text-center font-serif z-10 px-2">
            <div className="text-sm tracking-wide">A COURT OF</div>
            <div className="text-xl md:text-2xl mt-1 mb-2 font-bold">{book.displayTitle[0]}</div>
            <div className="text-sm tracking-wide">AND</div>
            <div className="text-xl md:text-2xl mt-1 mb-2 font-bold">{book.displayTitle[1]}</div>
            <div className="text-xs tracking-wider mt-4">{book.author.toUpperCase()}</div>
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
              <span key={star} className={star <= Math.floor(book.rating) ? "text-yellow-300" : "text-gray-300"}>★</span>
            ))}
          </div>
          <span className="book-voters text-sm ml-2">{book.voters} voters</span>
        </div>
        <div className="book-sum text-sm mb-6 line-clamp-3">
          {book.summary}
        </div>
        <button onClick={() => setSelectedBook(book)} className="book-see bg-white text-center py-2 px-6 rounded-full font-medium text-sm inline-block hover:bg-opacity-90" style={{ color: book.color.replace('bg-', 'text-').replace('400', '600') }}>
          See The Book
        </button>
      </div>
    </div>
  );
  
  const BookCard = ({ book }) => (
    <div className="book-card bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-102 hover:shadow-lg cursor-pointer" onClick={() => setSelectedBook(book)}>
      <div className="content-wrapper flex p-5 border-b border-gray-100 relative">
        <img src={book.cover} alt={book.title} className="book-card-img w-24 h-36 object-cover rounded shadow-md transition transform hover:scale-105" />
        <div className="card-content ml-5 overflow-hidden">
          <h3 className="book-name font-medium text-gray-800 mb-1 truncate">{book.title}</h3>
          <p className="book-by text-gray-500 text-sm mb-3">{book.author}</p>
          
          {/* Added details */}
          <div className="book-details space-y-1 mb-2">
            <p className="text-sm"><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-600">{book.subject || "Fiction"}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Give:</span> <span className="text-gray-600">{book.title}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Get:</span> <span className="text-gray-600">{book.exchange}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700">Condition:</span> <span className="text-gray-600">{book.condition}</span></p>
          </div>
        </div>
      </div>
      <div className="likes flex items-center p-3">
        <div className="flex -space-x-2">
          {book.likes.slice(0, 3).map(like => (
            <div key={like.id} className="like-profile">
              <img src={like.img} alt={like.name} className="like-img w-7 h-7 rounded-full border-2 border-white object-cover" />
            </div>
          ))}
        </div>
        <div className="like-name text-gray-500 text-xs ml-3">
          <span className="font-semibold">{book.likes[0].name}</span>
          {book.likes.length > 1 && <span> and <span className="font-semibold">{book.likes.length - 1} other {book.likes.length > 2 ? 'friends' : 'friend'}</span> like this</span>}
        </div>
      </div>
    </div>
  );
  
  const BookDetails = ({ book, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{book.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
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
                <div className="text-xs mt-2">{book.author.toUpperCase()}</div>
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
                  <span key={star} className={star <= Math.floor(book.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                ))}
              </div>
              <span className="text-gray-500 text-xs ml-2">{book.voters} voters</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{book.summary}</p>
        
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
              <span className="font-semibold">{book.likes[0].name}</span>
              {book.likes.length > 1 && <span> and <span className="font-semibold">{book.likes.length - 1} other {book.likes.length > 2 ? 'friends' : 'friend'}</span></span>}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 text-sm">Contact Seller</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm">Request Exchange</button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="book-store bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="header bg-white shadow-sm flex justify-between items-center px-4 py-3 md:px-8">
        <div className="browse flex items-center">
          <div className="browse-category hidden md:flex items-center pr-4 border-r border-gray-200">
            Browse Category
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down w-4 h-4 ml-2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div className="search-bar hidden md:block ml-4 relative">
            <input
              type="text"
              placeholder="Search Book"
              className="py-2 pl-10 pr-4 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="header-title text-center font-serif">
          read<span className="font-medium">books</span>
        </div>
        
        <div className="profile flex items-center">
          <div className="user-profile relative mr-4">
            <img src="https://randomuser.me/api/portraits/women/63.jpg" alt="" className="user-img w-7 h-7 rounded-full" />
          </div>
          <div className="profile-menu hidden md:flex items-center text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu w-4 h-4 mr-2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Menu
          </div>
        </div>
      </div>
      
      {/* Book Slide */}
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
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white w-10 h-10 flex items-center justify-center shadow-md z-10"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Main Content */}
      <div className="main-wrapper flex flex-col md:flex-row max-w-7xl mx-auto px-4 py-6">
        {/* Sidebar */}
        <div className="books-of w-full md:w-64 flex-shrink-0 md:mr-6 mb-6 md:mb-0">
          <div className="week bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="author-title font-medium mb-4">Books of the week</div>
            {authorsOfWeek.map(author => (
              <div key={author.id} className="author flex items-center mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <img src={author.img} alt={author.name} className="author-img w-8 h-8 rounded-full object-cover mr-3" />
                <div className="author-name text-sm">{author.name}</div>
              </div>
            ))}
          </div>
          
          <div className="week year bg-white rounded-lg shadow-sm p-4 relative">
            <div className="author-title font-medium mb-4">Books of the year</div>
            {booksOfYear.map(book => (
              <div key={book.id} className="year-book flex items-center mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <img src={book.img} alt={book.name} className="year-book-img w-12 rounded shadow mr-3" />
                <div className="year-book-content">
                  <div className="year-book-name text-sm font-medium">{book.name}</div>
                  <div className="year-book-author text-xs text-gray-500">{book.author}</div>
                </div>
              </div>
            ))}
            <div className="overlay absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
        
        {/* Popular Books */}
        <div className="popular-books flex-grow bg-white rounded-lg shadow-sm p-6">
          <div className="main-menu flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
            <div className="genre font-medium">Popular by Genre</div>
            <div className="book-types hidden md:flex space-x-6">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`book-type text-sm relative ${activeCategory === category.name ? 'font-medium text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                  {activeCategory === category.name && (
                    <span className="absolute bottom-[-17px] left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-400 shadow-md"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="book-cards grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
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
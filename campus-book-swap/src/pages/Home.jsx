import { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = [
    { id: 'all', name: 'All', icon: '📚' },
    { id: 'ebooks', name: 'eBooks', icon: '📋' },
    { id: 'new', name: 'New', icon: '📕' },
    { id: 'fiction', name: 'Fiction', icon: '📘' },
    { id: 'manga', name: 'Manga', icon: '📗' },
    { id: 'fantasy', name: 'Fantasy', icon: '📙' },
  ];
  
  const popularBooks = [
    {
      id: 1,
      title: 'A COURT OF THORNS AND ROSES',
      displayTitle: ['THORNS', 'ROSES'],
      author: 'Sarah J. Maas',
      color: 'bg-red-400',
      seller: 'John Doe',
      condition: 'Like New',
      exchange: 'Looking for: The Silent Patient',
      course: 'English Literature 101',
      subject: 'Fantasy Fiction'
    },
    {
      id: 2,
      title: 'A COURT OF MIST AND FURY',
      displayTitle: ['MIST', 'FURY'],
      author: 'Sarah J. Maas',
      color: 'bg-green-400',
      seller: 'Jane Smith',
      condition: 'Good',
      exchange: 'For Borrowing (2 weeks)',
      course: null,
      subject: 'Fantasy Fiction'
    }
  ];
  
  const ebooks = [
    {
      id: 3,
      title: 'A COURT OF FROST AND STARLIGHT',
      displayTitle: ['FROST', 'STARLIGHT'],
      author: 'Sarah J. Maas',
      color: 'bg-blue-400',
      seller: 'Alex Johnson',
      condition: 'Digital Copy',
      exchange: '$5.99',
      course: 'Creative Writing 202',
      subject: 'Fantasy Fiction'
    },
    {
      id: 4,
      title: 'A COURT OF WINGS AND RUIN',
      displayTitle: ['WINGS', 'RUIN'],
      author: 'Sarah J. Maas',
      color: 'bg-purple-400',
      seller: 'Sam Wilson',
      condition: 'Digital Copy',
      exchange: 'Looking for: The Alchemist (Digital)',
      course: null,
      subject: 'Fantasy Fiction'
    }
  ];
  
  const BookCard = ({ book }) => (
    <div className="flex flex-col w-40 md:w-48 cursor-pointer transform hover:scale-105 transition-transform duration-200">
      <div className={`relative ${book.color} rounded-lg shadow-md h-56 md:h-64 flex items-center justify-center overflow-hidden`}>
        {/* Book content */}
        <div className="text-yellow-100 text-center font-serif z-10 px-2">
          <div className="text-sm tracking-wide">A COURT OF</div>
          <div className="text-xl md:text-2xl mt-1 mb-2 font-bold">{book.displayTitle[0]}</div>
          <div className="text-sm tracking-wide">AND</div>
          <div className="text-xl md:text-2xl mt-1 mb-2 font-bold">{book.displayTitle[1]}</div>
          <div className="text-xs tracking-wider mt-4">SARAH J. MAAS</div>
        </div>
        
        {/* Book binding and bookmark */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-opacity-20 bg-black"></div>
        <div className="absolute bottom-0 h-1 w-full bg-opacity-40 bg-black"></div>
        <div className="absolute right-3 bottom-0 w-5 h-12 bg-yellow-200 rounded-t-sm"></div>
      </div>
      
      {/* Book info */}
      <div className="mt-3 px-1">
        <h3 className="font-medium text-gray-700">{book.displayTitle.join(' and ')}</h3>
        <p className="text-red-400 text-sm">{book.author}</p>
      </div>
    </div>
  );
  
  const BookDetails = ({ book, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{book.displayTitle.join(' and ')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
            &times;
          </button>
        </div>
        
        <div className="flex mb-4">
          <div className={`${book.color} rounded-lg shadow-md w-32 h-48 flex items-center justify-center mr-4 flex-shrink-0`}>
            <div className="text-yellow-100 text-center font-serif px-2">
              <div className="text-xs tracking-wide">A COURT OF</div>
              <div className="text-lg font-bold my-1">{book.displayTitle[0]}</div>
              <div className="text-xs tracking-wide">AND</div>
              <div className="text-lg font-bold my-1">{book.displayTitle[1]}</div>
              <div className="text-xs mt-2">SARAH J. MAAS</div>
            </div>
            <div className="absolute right-3 bottom-0 w-4 h-10 bg-yellow-200 rounded-t-sm"></div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700"><span className="font-medium">Author:</span> {book.author}</p>
            <p className="text-gray-700"><span className="font-medium">Seller:</span> {book.seller}</p>
            <p className="text-gray-700"><span className="font-medium">Condition:</span> {book.condition}</p>
            <p className="text-gray-700"><span className="font-medium">Exchange:</span> {book.exchange}</p>
            {book.course && (
              <p className="text-gray-700"><span className="font-medium">Course:</span> {book.course}</p>
            )}
            <p className="text-gray-700"><span className="font-medium">Subject:</span> {book.subject}</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 text-sm">Contact Seller</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm">Request Exchange</button>
        </div>
      </div>
    </div>
  );
  
  const [selectedBook, setSelectedBook] = useState(null);
  
  const handleBookClick = (book) => {
    setSelectedBook(book);
  };
  
  const Section = ({ title, books }) => (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-700">{title}</h2>
        <div className="flex items-center">
          <Link to="/" className="text-gray-600 bg-white px-6 py-2 rounded-full shadow-sm mr-4 text-sm">
            View All
          </Link>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 mr-2">
            &#10094;
          </button>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500">
            &#10095;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
        {books.map(book => (
          <div key={book.id} onClick={() => handleBookClick(book)}>
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 bg-gray-50">
      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 space-x-6 mb-8 no-scrollbar">
        {categories.map(category => (
          <button
            key={category.id}
            className={`flex flex-col items-center flex-shrink-0 ${
              activeCategory === category.name ? 'text-gray-800' : 'text-gray-500'
            }`}
            onClick={() => setActiveCategory(category.name)}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl mb-1">
              {category.icon}
            </div>
            <span className="text-sm">{category.name}</span>
          </button>
        ))}
      </div>
      
      {/* Popular Books Section */}
      <Section title="Popular" books={popularBooks} />
      
      {/* eBooks Section */}
      <Section title="eBooks" books={ebooks} />
      
      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetails book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default Home;

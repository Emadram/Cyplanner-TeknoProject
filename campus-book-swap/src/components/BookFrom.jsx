import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BookForm = ({ onSuccess, bookToEdit = null }) => {
  const initialState = {
    title: '',
    author: '',
    description: '',
    condition: 'New',
    exchange: '',
    subject: '',
    course: '',
    seller: '',
    featured: false,
    bookOfWeek: false,
    bookOfYear: false,
    displayTitle: '',
    category: ''
  };

  const [book, setBook] = useState(initialState);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user, authAxios } = useAuth();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/categories`;
        console.log("Fetching categories from:", apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log("Category response:", response.data);
        
        if (response.data && response.data.data) {
          const processedCategories = response.data.data.map(cat => {
            console.log("Category item:", cat);
            return {
              id: cat.id,
              // Try different possible property names for the category name
              name: cat.attributes?.Type || cat.attributes?.type || cat.attributes?.name || cat.Type || cat.type || cat.name || `Category ${cat.id}`
            };
          });
          
          console.log("Processed categories:", processedCategories);
          setCategories(processedCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
    
    // If we have a book to edit, populate the form
    if (bookToEdit) {
      setBook({
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        description: bookToEdit.description || '',
        condition: bookToEdit.condition || 'New',
        exchange: bookToEdit.exchange || '',
        subject: bookToEdit.subject || '',
        course: bookToEdit.course || '',
        seller: bookToEdit.seller || user?.username || '',
        featured: bookToEdit.featured || false,
        bookOfWeek: bookToEdit.bookOfWeek || false,
        bookOfYear: bookToEdit.bookOfYear || false,
        displayTitle: bookToEdit.displayTitle || '',
        category: bookToEdit.category?.id || ''
      });
      
      if (bookToEdit.cover) {
        setCoverPreview(bookToEdit.cover);
      }
    } else {
      // For new books, set seller to current user
      setBook(prev => ({
        ...prev,
        seller: user?.username || ''
      }));
    }
  }, [bookToEdit, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBook(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log("Submitting book data:", book);
      
      // Create data object in the format Strapi expects
      const bookData = {
        data: {
          title: book.title,
          author: book.author,
          description: book.description,
          condition: book.condition,
          exchange: book.exchange,
          subject: book.subject,
          course: book.course,
          seller: book.seller,
          featured: book.featured,
          bookOfWeek: book.bookOfWeek,
          bookOfYear: book.bookOfYear,
          displayTitle: book.displayTitle,
          category: book.category || null,
          users_permissions_user: user?.id || null
        }
      };
      
      console.log("Formatted data for Strapi:", bookData);
      
      let bookResponse;
      
      if (bookToEdit) {
        bookResponse = await authAxios.put(
          `${import.meta.env.VITE_API_URL}/api/books/${bookToEdit.id}`, 
          bookData
        );
      } else {
        bookResponse = await authAxios.post(
          `${import.meta.env.VITE_API_URL}/api/books`, 
          bookData
        );
      }
      
      console.log("Book response:", bookResponse.data);
      
      // If there's a new cover image, upload it
      if (coverImage) {
        const formData = new FormData();
        formData.append('files', coverImage);
        formData.append('ref', 'api::book.book');
        formData.append('refId', bookResponse.data.data.id);
        formData.append('field', 'cover');
        
        await authAxios.post(
          `${import.meta.env.VITE_API_URL}/api/upload`, 
          formData
        );
      }
      
      setSuccess(bookToEdit ? 'Book updated successfully!' : 'Book listed successfully!');
      setBook(initialState);
      setCoverImage(null);
      setCoverPreview(null);
      
      if (onSuccess) {
        onSuccess(bookResponse.data.data);
      }
    } catch (err) {
      console.error('Error submitting book:', err);
      
      if (err.response) {
        console.log('Error data:', err.response.data);
        setError(`Server error: ${err.response.data?.error?.message || 'Failed to submit book'}`);
      } else if (err.request) {
        setError('No response from server. Check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{bookToEdit ? 'Edit Book' : 'List a Book for Sale'}</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={book.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="author" className="block mb-1 font-medium">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              value={book.author}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block mb-1 font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              value={book.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded"
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="category" className="block mb-1 font-medium">Category</label>
            <select
              id="category"
              name="category"
              value={book.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select a category</option>
              {categories.length > 0 ? (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading categories...</option>
              )}
            </select>
          </div>
          
          <div>
            <label htmlFor="condition" className="block mb-1 font-medium">Condition</label>
            <select
              id="condition"
              name="condition"
              value={book.condition}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Acceptable">Acceptable</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="exchange" className="block mb-1 font-medium">Exchange Options</label>
            <input
              type="text"
              id="exchange"
              name="exchange"
              value={book.exchange}
              onChange={handleChange}
              placeholder="e.g. Cash, Trade for another book"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block mb-1 font-medium">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={book.subject}
              onChange={handleChange}
              placeholder="e.g. Mathematics, Programming"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="course" className="block mb-1 font-medium">Course (if applicable)</label>
            <input
              type="text"
              id="course"
              name="course"
              value={book.course}
              onChange={handleChange}
              placeholder="e.g. CS101, MATH202"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="seller" className="block mb-1 font-medium">Seller Name</label>
            <input
              type="text"
              id="seller"
              name="seller"
              value={book.seller}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="displayTitle" className="block mb-1 font-medium">Display Title (optional)</label>
            <input
              type="text"
              id="displayTitle"
              name="displayTitle"
              value={book.displayTitle}
              onChange={handleChange}
              placeholder="Alternative display title"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="cover" className="block mb-1 font-medium">Cover Image</label>
            <input
              type="file"
              id="cover"
              name="cover"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded"
            />
            {coverPreview && (
              <div className="mt-2">
                <img src={coverPreview} alt="Cover preview" className="h-32 object-contain" />
              </div>
            )}
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={book.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="featured" className="ml-2">Featured</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bookOfWeek"
                name="bookOfWeek"
                checked={book.bookOfWeek}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="bookOfWeek" className="ml-2">Book of the Week</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bookOfYear"
                name="bookOfYear"
                checked={book.bookOfYear}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="bookOfYear" className="ml-2">Book of the Year</label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded`}
          >
            {loading ? 'Submitting...' : bookToEdit ? 'Update Book' : 'List Book'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
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
    price: '',
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
        console.log("Raw categories response:", response.data);
        
        if (response.data && response.data.data) {
          // For Strapi v4 structure
          const processedCategories = response.data.data.map(cat => {
            console.log("Processing category:", cat);
            return {
              id: cat.id,
              name: cat.attributes?.name || 'Unknown Category'
            };
          });
          
          console.log("Processed categories:", processedCategories);
          setCategories(processedCategories);
        } else {
          console.error("Unexpected category data structure:", response.data);
          setError("Failed to process categories data");
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
        price: bookToEdit.price || '',
        category: bookToEdit.category?.id || ''
      });
      
      if (bookToEdit.cover) {
        setCoverPreview(bookToEdit.cover);
      }
    }
  }, [bookToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
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
      // Show the token for debugging
      const token = localStorage.getItem('token');
      console.log("Token being used:", token ? `${token.substring(0, 15)}...` : 'No token');
      
      // Simplified book data
      const bookData = {
        data: {
          title: book.title,
          author: book.author,
          description: book.description,
          condition: book.condition,
          exchange: book.exchange || "",
          subject: book.subject || "",
          course: book.course || "",
          price: parseFloat(book.price) || 0,
          category: book.category || null
        }
      };
      
      console.log("Data for Strapi:", bookData);
      
      let bookResponse;
      
      if (bookToEdit) {
        bookResponse = await authAxios.put(
          `${import.meta.env.VITE_API_URL}/api/books/${bookToEdit.id}`, 
          bookData
        );
      } else {
        // Log the full request details
        console.log("Making POST request to:", `${import.meta.env.VITE_API_URL}/api/books`);
        console.log("With headers:", authAxios.defaults.headers);
        
        bookResponse = await authAxios.post(
          `${import.meta.env.VITE_API_URL}/api/books`, 
          bookData
        );
      }
      
      console.log("Book response:", bookResponse.data);
      
      // If there's a cover image, upload it after book is created
      if (coverImage && bookResponse.data.data.id) {
        const formData = new FormData();
        formData.append('files', coverImage);
        formData.append('ref', 'api::book.book');
        formData.append('refId', bookResponse.data.data.id);
        formData.append('field', 'cover');
        
        console.log("Uploading cover image for book ID:", bookResponse.data.data.id);
        
        try {
          const uploadResponse = await authAxios.post(
            `${import.meta.env.VITE_API_URL}/api/upload`, 
            formData
          );
          console.log("Image upload response:", uploadResponse.data);
        } catch (uploadErr) {
          console.error("Error uploading image:", uploadErr);
          // Continue with success even if image upload fails
        }
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
      
      // Detailed error reporting
      if (err.response) {
        console.log('Error status:', err.response.status);
        console.log('Error headers:', err.response.headers);
        console.log('Error data:', err.response.data);
        
        // Extract error message from Strapi
        if (err.response.data && err.response.data.error) {
          setError(`Server error: ${err.response.data.error.message || 'Unknown error'}`);
        } else {
          setError(`Error ${err.response.status}: Failed to submit book.`);
        }
      } else if (err.request) {
        setError('Request was made but no response received. Check your network connection.');
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
                    {category.name || `Category ID: ${category.id}`}
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
            <label htmlFor="price" className="block mb-1 font-medium">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={book.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
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
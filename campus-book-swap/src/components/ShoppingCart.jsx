import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ShoppingCart = () => {
  const { user, authAxios } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      // This would be your actual API endpoint to fetch cart items
      const response = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/cart-items?userId=${user.id}`);
      
      // Process the data
      const items = response.data.data || [];
      setCartItems(items);
      
      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(total);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to load your cart items.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await authAxios.delete(`${import.meta.env.VITE_API_URL}/api/cart-items/${itemId}`);
      // Update the cart after removing the item
      setCartItems(cartItems.filter(item => item.id !== itemId));
      
      // Recalculate total
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(newTotal);
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item from cart.');
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await authAxios.put(`${import.meta.env.VITE_API_URL}/api/cart-items/${itemId}`, {
        quantity: newQuantity
      });
      
      // Update the cart after updating the quantity
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      
      // Recalculate total
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(newTotal);
    } catch (err) {
      console.error('Error updating item quantity:', err);
      setError('Failed to update item quantity.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-lg font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Your Shopping Cart
        </h2>
      </div>
      
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your cart...</p>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">
            Discover great books and add them to your cart!
          </p>
          <Link to="/books" className="inline-block px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            Browse Books
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.id} className="p-4 flex items-center">
                <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {item.cover ? (
                    <img 
                      src={item.cover} 
                      alt={item.title}
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
                
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.author}</p>
                  <div className="mt-1 flex items-center">
                    <span className="text-blue-600 font-medium">${item.price.toFixed(2)}</span>
                    <div className="ml-4 flex items-center">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="ml-4 text-gray-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-2">
              <Link 
                to="/checkout" 
                className="w-full py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Checkout
              </Link>
              <Link 
                to="/books" 
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
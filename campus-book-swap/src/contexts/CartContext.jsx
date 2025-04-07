import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, authAxios, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart items when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCartItems();
    } else {
      // Reset cart when user logs out
      setCartItems([]);
      setCartCount(0);
    }
  }, [isAuthenticated, user]);

  const fetchCartItems = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // API call to get cart items
      // For now using mock data until backend is set up
      // const response = await authAxios.get(`${import.meta.env.VITE_API_URL}/api/cart-items`);
      // const items = response.data.data || [];
      
      // Mock data for development
      const mockItems = [
        {
          id: 1,
          bookId: 1,
          title: "Introduction to Computer Science",
          author: "John Smith",
          price: 24.99,
          quantity: 1,
          cover: null,
          transactionType: "buy" // Added transaction type
        },
        {
          id: 2,
          bookId: 2,
          title: "Calculus Made Easy",
          author: "Sarah Johnson",
          price: 19.95,
          quantity: 2,
          cover: null,
          transactionType: "buy" // Added transaction type
        },
        {
          id: 3,
          bookId: 3,
          title: "Introduction to Psychology",
          author: "Michael Brown",
          borrowDuration: "2 weeks", // Borrow-specific field
          depositAmount: 15.00, // Borrow-specific field
          dueDate: "2025-05-01", // Borrow-specific field
          quantity: 1,
          cover: null,
          transactionType: "borrow" // Added transaction type
        }
      ];
      
      setCartItems(mockItems);
      // Update cart count (total quantity of all items)
      const count = mockItems.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load your cart.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (book, transactionType = "buy", borrowDetails = null) => {
    if (!isAuthenticated) {
      // Return an error if user is not logged in
      return { success: false, error: 'Please sign in to add items to your cart' };
    }
    
    setLoading(true);
    try {
      // Check if the item already exists in cart with the same transaction type
      const existingItem = cartItems.find(item => 
        item.bookId === book.id && item.transactionType === transactionType
      );
      
      if (existingItem) {
        // Update quantity if item exists
        /* In a real app, you'd make an API call:
        const response = await authAxios.put(
          `${import.meta.env.VITE_API_URL}/api/cart-items/${existingItem.id}`, 
          { quantity: existingItem.quantity + 1 }
        );
        */
        
        // Update local cart state
        const updatedItems = cartItems.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        
        setCartItems(updatedItems);
        setCartCount(prev => prev + 1);
      } else {
        // Add new item to cart
        const newItem = {
          id: Date.now(), // Mock ID for development
          bookId: book.id,
          quantity: 1,
          price: book.price || 19.99, // Fallback price if not provided
          title: book.title,
          author: book.author,
          cover: book.cover,
          transactionType: transactionType // Add transaction type
        };
        
        // Add borrowing-specific details if applicable
        if (transactionType === "borrow" && borrowDetails) {
          Object.assign(newItem, {
            borrowDuration: borrowDetails.duration || "2 weeks",
            depositAmount: borrowDetails.deposit || 15.00,
            dueDate: borrowDetails.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 2 weeks
          });
        }
        
        /* In a real app, you'd make an API call:
        const response = await authAxios.post(
          `${import.meta.env.VITE_API_URL}/api/cart-items`, 
          cartItem
        );
        */
        
        // Add the new item to local cart state
        setCartItems([...cartItems, newItem]);
        setCartCount(prev => prev + 1);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart.');
      return { success: false, error: 'Failed to add item to cart' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Find the item to get its quantity
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;
      
      /* In a real app, you'd make an API call:
      await authAxios.delete(`${import.meta.env.VITE_API_URL}/api/cart-items/${itemId}`);
      */
      
      // Update local cart state
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      setCartCount(prev => prev - item.quantity);
      setError(null);
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart.');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    if (!isAuthenticated || quantity < 1) return;
    
    setLoading(true);
    try {
      // Find the current item to calculate the quantity difference
      const currentItem = cartItems.find(item => item.id === itemId);
      if (!currentItem) return;
      
      const quantityDifference = quantity - currentItem.quantity;
      
      /* In a real app, you'd make an API call:
      await authAxios.put(
        `${import.meta.env.VITE_API_URL}/api/cart-items/${itemId}`, 
        { quantity }
      );
      */
      
      // Update local cart state
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      
      setCartItems(updatedItems);
      setCartCount(prev => prev + quantityDifference);
      setError(null);
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      setError('Failed to update item quantity.');
    } finally {
      setLoading(false);
    }
  };

  const updateBorrowDetails = async (itemId, borrowDetails) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Find the current item
      const currentItem = cartItems.find(item => item.id === itemId);
      if (!currentItem || currentItem.transactionType !== "borrow") return;
      
      /* In a real app, you'd make an API call:
      await authAxios.put(
        `${import.meta.env.VITE_API_URL}/api/cart-items/${itemId}`, 
        { borrowDetails }
      );
      */
      
      // Update local cart state
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { 
          ...item, 
          borrowDuration: borrowDetails.duration || item.borrowDuration,
          depositAmount: borrowDetails.deposit || item.depositAmount,
          dueDate: borrowDetails.dueDate || item.dueDate
        } : item
      );
      
      setCartItems(updatedItems);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Error updating borrow details:', err);
      setError('Failed to update borrowing details.');
      return { success: false, error: 'Failed to update borrowing details' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      /* In a real app, you'd make an API call:
      await authAxios.delete(`${import.meta.env.VITE_API_URL}/api/cart-items/clear`);
      */
      
      // Reset local cart state
      setCartItems([]);
      setCartCount(0);
      setError(null);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart.');
    } finally {
      setLoading(false);
    }
  };

  // Get counts by transaction type
  const getTransactionTypeCounts = () => {
    const counts = {
      buy: 0,
      borrow: 0,
      swap: 0
    };
    
    cartItems.forEach(item => {
      const type = item.transactionType || 'buy';
      counts[type] += item.quantity;
    });
    
    return counts;
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartCount, 
        loading, 
        error, 
        addToCart, 
        removeFromCart, 
        updateCartItemQuantity,
        updateBorrowDetails,
        clearCart,
        fetchCartItems,
        getTransactionTypeCounts
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
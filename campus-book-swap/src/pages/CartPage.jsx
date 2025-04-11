import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { cartItems, cartCount, removeFromCart, updateCartItemQuantity, updateBorrowDetails, clearCart, loading, error } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Group items by transaction type
  const groupedItems = cartItems.reduce((groups, item) => {
    const type = item.transactionType || 'buy';
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
    return groups;
  }, {});
  
  // Calculate subtotals by transaction type
  const calculateSubtotal = (items) => {
    return items.reduce((total, item) => {
      if (item.transactionType === 'borrow') {
        return total + (item.depositAmount * item.quantity);
      }
      return total + (item.price * item.quantity);
    }, 0);
  };
  
  // Calculate main cart total (purchases + deposits)
  const cartTotal = cartItems.reduce((total, item) => {
    if (item.transactionType === 'borrow') {
      return total + (item.depositAmount * item.quantity);
    }
    return total + (item.price * item.quantity);
  }, 0);
  
  const shipping = 0; // Free shipping for now
  const tax = calculateSubtotal(groupedItems.buy || []) * 0.08; // Only apply tax to purchased items
  const total = cartTotal + shipping + tax;
  
  const handleUpdateBorrowDuration = (itemId, duration) => {
    // Calculate new due date based on duration
    const dueDate = new Date();
    switch(duration) {
      case '1 week':
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case '2 weeks':
        dueDate.setDate(dueDate.getDate() + 14);
        break;
      case '1 month':
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      default:
        dueDate.setDate(dueDate.getDate() + 14); // Default to 2 weeks
    }
    
    updateBorrowDetails(itemId, {
      duration: duration,
      dueDate: dueDate.toISOString().split('T')[0]
    });
  };
  
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setCheckoutLoading(true);
    // Simulate API call for checkout process
    try {
      // Here you would make an actual API call to create an order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear the cart after successful checkout
      await clearCart();
      
      // Show success message
      setSuccessMessage('Your order has been placed successfully!');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to complete checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Render a cart item based on its transaction type
  const renderCartItem = (item) => {
    const isBookType = item.transactionType === 'buy' || !item.transactionType;
    const isBorrowType = item.transactionType === 'borrow';
    
    return (
      <div key={item.id} className="p-4 flex border-b border-gray-200">
        <div className="w-20 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
          {item.cover ? (
            <img 
              src={item.cover} 
              alt={item.title}
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
            <h3 className="font-medium">{item.title}</h3>
            <button 
              onClick={() => removeFromCart(item.id)}
              className="text-gray-400 hover:text-red-500"
              aria-label="Remove item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500">{item.author}</p>
          
          {/* Transaction Type Badge */}
          <div className="mt-1 mb-2">
            {isBookType && (
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                For Purchase
              </span>
            )}
            
            {isBorrowType && (
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                For Borrowing
              </span>
            )}
            
            {item.transactionType === 'swap' && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                For Swap
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <button 
                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50"
              >
                -
              </button>
              <span className="mx-3 w-8 text-center">{item.quantity}</span>
              <button 
                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
              >
                +
              </button>
            </div>
            
            <div className="flex items-center">
              {isBookType && (
                <>
                  <span className="text-gray-700 mr-2">Price:</span>
                  <span className="font-medium text-blue-600">${item.price.toFixed(2)}</span>
                </>
              )}
              
              {isBorrowType && (
                <>
                  <span className="text-gray-700 mr-2">Deposit:</span>
                  <span className="font-medium text-blue-600">${item.depositAmount.toFixed(2)}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Subtotal:</span>
              {isBookType && (
                <span className="font-medium text-blue-600">${(item.price * item.quantity).toFixed(2)}</span>
              )}
              
              {isBorrowType && (
                <span className="font-medium text-blue-600">${(item.depositAmount * item.quantity).toFixed(2)}</span>
              )}
            </div>
          </div>
          
          {/* Borrowing-specific options */}
          {isBorrowType && (
            <div className="mt-3 bg-purple-50 p-2 rounded">
              <div className="flex justify-between items-center text-sm">
                <span className="text-purple-700">Borrow Duration:</span>
                <select 
                  value={item.borrowDuration} 
                  onChange={(e) => handleUpdateBorrowDuration(item.id, e.target.value)}
                  className="border border-purple-300 rounded py-1 px-2 text-sm bg-white"
                >
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="1 month">1 Month</option>
                </select>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-purple-700">Return By:</span>
                <span className="font-medium">{item.dueDate}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Deposit will be refunded upon return of the book in good condition
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        <Link to="/books" className="text-blue-600 hover:text-blue-800">
          Continue Shopping
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      ) : successMessage ? (
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-green-800 mb-2">{successMessage}</h2>
          <p className="text-green-700 mb-6">Thank you for your purchase and/or borrowing!</p>
          <Link to="/books" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Link to="/books" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-lg">Items in Your Cart ({cartCount})</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {/* Purchase items */}
                {groupedItems.buy && groupedItems.buy.length > 0 && (
                  <div>
                    <div className="bg-green-50 p-3 border-b border-gray-200">
                      <h3 className="font-medium text-green-800">Books to Purchase</h3>
                    </div>
                    {groupedItems.buy.map(item => renderCartItem(item))}
                  </div>
                )}
                
                {/* Borrowing items */}
                {groupedItems.borrow && groupedItems.borrow.length > 0 && (
                  <div>
                    <div className="bg-purple-50 p-3 border-b border-gray-200">
                      <h3 className="font-medium text-purple-800">Books to Borrow</h3>
                    </div>
                    {groupedItems.borrow.map(item => renderCartItem(item))}
                  </div>
                )}
                
                {/* Swap items */}
                {groupedItems.swap && groupedItems.swap.length > 0 && (
                  <div>
                    <div className="bg-blue-50 p-3 border-b border-gray-200">
                      <h3 className="font-medium text-blue-800">Books to Swap</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Swaps are handled through our messaging system. These items will be moved to your messages once you proceed to checkout.
                      </p>
                    </div>
                    {groupedItems.swap.map(item => renderCartItem(item))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium">Order Summary</h2>
              </div>
              
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {/* Purchase subtotal */}
                  {groupedItems.buy && groupedItems.buy.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Subtotal</span>
                      <span className="font-medium">${calculateSubtotal(groupedItems.buy).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Borrowing deposit total */}
                  {groupedItems.borrow && groupedItems.borrow.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Borrowing Deposits</span>
                      <span className="font-medium">${calculateSubtotal(groupedItems.borrow).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  
                  {/* Only apply tax to purchases */}
                  {groupedItems.buy && groupedItems.buy.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                    
                    {groupedItems.borrow && groupedItems.borrow.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        * Borrowing deposits are refundable upon book return
                      </p>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || checkoutLoading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {checkoutLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Checkout'
                  )}
                </button>
                
                <button 
                  onClick={() => clearCart()}
                  disabled={cartItems.length === 0 || checkoutLoading}
                  className="w-full mt-2 py-2 px-4 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
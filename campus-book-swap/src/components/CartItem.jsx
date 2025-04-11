import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartItem = ({ item }) => {
  const { removeFromCart, updateCartItemQuantity } = useCart();

  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      {/* Book Cover */}
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
      
      {/* Book Info */}
      <div className="ml-4 flex-grow">
        <Link to={`/book/${item.bookId}`} className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
          {item.title}
        </Link>
        <p className="text-xs text-gray-500">{item.author}</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">${item.price.toFixed(2)}</span>
            <span className="mx-2 text-gray-400">×</span>
            <div className="flex items-center">
              <button 
                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 text-xs"
              >
                -
              </button>
              <span className="mx-1 w-6 text-center text-sm">{item.quantity}</span>
              <button 
                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 text-xs"
              >
                +
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => removeFromCart(item.id)}
            className="text-gray-400 hover:text-red-500"
            aria-label="Remove item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
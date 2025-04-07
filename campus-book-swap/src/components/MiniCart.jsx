import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartItem from './CartItem';

const MiniCart = ({ onClose }) => {
  const { cartItems, cartCount, loading, error, clearCart } = useCart();
  
  // Calculate the total price
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-gray-600">Loading cart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 text-red-700 p-2 rounded-lg text-sm">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-600 text-sm mb-2">Your cart is empty</p>
        <Link 
          to="/books" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          onClick={onClose}
        >
          Browse books
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Your Cart ({cartCount} items)</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="max-h-60 overflow-y-auto mb-4">
        {cartItems.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      
      <div className="flex justify-between items-center py-2 border-t border-b border-gray-200 mb-4">
        <span className="text-gray-700 font-medium">Subtotal</span>
        <span className="text-blue-600 font-bold">${cartTotal.toFixed(2)}</span>
      </div>
      
      <div className="flex gap-2">
        <Link 
          to="/cart" 
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors text-sm"
          onClick={onClose}
        >
          View Cart
        </Link>
        <Link 
          to="/checkout" 
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-center font-medium hover:bg-green-700 transition-colors text-sm"
          onClick={onClose}
        >
          Checkout
        </Link>
      </div>
      
      <button 
        onClick={clearCart}
        className="w-full mt-2 text-sm text-gray-500 hover:text-red-500"
      >
        Clear cart
      </button>
    </div>
  );
};

export default MiniCart;
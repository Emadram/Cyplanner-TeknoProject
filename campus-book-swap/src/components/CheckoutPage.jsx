import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
  const { cartItems, cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping for now
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;
  
  useEffect(() => {
    // Redirect if cart is empty and order not complete
    if (cartCount === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cartCount, orderComplete, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Payment details validation
    if (formData.paymentMethod === 'credit') {
      if (!formData.cardName) newErrors.cardName = 'Card name is required';
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Invalid card number';
      }
      
      if (!formData.cardExpiry) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Invalid format (MM/YY)';
      }
      
      if (!formData.cardCvc) {
        newErrors.cardCvc = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
        newErrors.cardCvc = 'Invalid CVC';
      }
    }
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Zip code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid zip code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Here you would make an API call to process the order
      // For now, we'll simulate a successful order after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random order ID
      const randomOrderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      setOrderId(randomOrderId);
      
      // Clear the cart
      await clearCart();
      
      // Show order completion message
      setOrderComplete(true);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error processing order:', error);
      setErrors({
        ...errors,
        form: 'Failed to process your order. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="bg-green-100 text-green-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-gray-600">Order ID: <span className="font-medium">{orderId}</span></p>
              <p className="text-gray-600">A confirmation email has been sent to <span className="font-medium">{formData.email}</span></p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/books" className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
              Continue Shopping
            </Link>
            <Link to="/dashboard" className="px-6 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        {/* Error message if form submission failed */}
        {errors.form && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <p>{errors.form}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Order summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium">Order Summary</h2>
              </div>
              
              <div className="p-4">
                <div className="max-h-60 overflow-y-auto mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center py-2 border-b border-gray-200">
                      <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
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
                            <span className="text-gray-500 text-xs">No cover</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-grow">
                        <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      
                      <div className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Link to="/cart" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right column - Checkout form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-6">Shipping Information</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full p-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.firstName && <p className="text-red-600 text-xs mt-1 error-message">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full p-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.lastName && <p className="text-red-600 text-xs mt-1 error-message">{errors.lastName}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1 error-message">{errors.email}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full p-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.address && <p className="text-red-600 text-xs mt-1 error-message">{errors.address}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full p-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.city && <p className="text-red-600 text-xs mt-1 error-message">{errors.city}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full p-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select...</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        {/* Add other states */}
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                      </select>
                      {errors.state && <p className="text-red-600 text-xs mt-1 error-message">{errors.state}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`w-full p-2 border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.zipCode && <p className="text-red-600 text-xs mt-1 error-message">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold mb-6 border-t border-gray-200 pt-6">Payment Method</h2>
                
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="credit"
                        name="paymentMethod"
                        value="credit"
                        checked={formData.paymentMethod === 'credit'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="credit" className="ml-2 text-sm font-medium text-gray-700">
                        Credit Card
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="paypal" className="ml-2 text-sm font-medium text-gray-700">
                        PayPal
                      </label>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === 'credit' && (
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                            Name on Card <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            className={`w-full p-2 border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.cardName && <p className="text-red-600 text-xs mt-1 error-message">{errors.cardName}</p>}
                        </div>
                        
                        <div className="md:col-span-2">
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="XXXX XXXX XXXX XXXX"
                            className={`w-full p-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.cardNumber && <p className="text-red-600 text-xs mt-1 error-message">{errors.cardNumber}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardExpiry"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            className={`w-full p-2 border ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.cardExpiry && <p className="text-red-600 text-xs mt-1 error-message">{errors.cardExpiry}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                            CVC <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardCvc"
                            name="cardCvc"
                            value={formData.cardCvc}
                            onChange={handleChange}
                            placeholder="XXX"
                            className={`w-full p-2 border ${errors.cardCvc ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.cardCvc && <p className="text-red-600 text-xs mt-1 error-message">{errors.cardCvc}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.paymentMethod === 'paypal' && (
                    <div className="border border-gray-200 rounded-md p-4 text-center">
                      <p className="text-gray-600 text-sm mb-4">
                        You will be redirected to PayPal to complete your payment after reviewing your order.
                      </p>
                      <img 
                        src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
                        alt="PayPal" 
                        className="h-10 mx-auto"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x50?text=PayPal';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Complete Order • $${total.toFixed(2)}`
                    )}
                  </button>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    By completing your purchase, you agree to our <Link to="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Settings } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const RetailMindDemo = () => {
  const [step, setStep] = useState(1);
  const [userPersona, setUserPersona] = useState({
    name: '',
    job: '',
    budget: 5000,
    interests: [],
    lifestyle: '',
  });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then(response => setEvents(response.data))
      .catch(err => console.error('Error fetching events:', err));
    localStorage.setItem('cart', JSON.stringify(cart)); // Sync cart to localStorage
  }, [cart]);

  const handleNext = async () => {
    if (step === 5) {
      try {
        const response = await fetch('/products.json'); // Local file
        const allProducts = await response.json();
  
        const filteredProducts = allProducts
          .filter(product => product.price <= userPersona.budget)
          .map(product => {
            const interestMatch = userPersona.interests.some(interest => product.tags.includes(interest));
            const eventBoost = 1.0; // no event logic here
            return { ...product, score: interestMatch ? 1 : 0, boost: eventBoost };
          })
          .sort((a, b) => (b.score + b.boost) - (a.score + a.boost));
  
        setProducts(filteredProducts);
        setStep(6);
        setError('');
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load local product data.');
      }
    } else {
      setStep(step + 1);
    }
  };
  
  const handleSkip = async () => {
    if (step === 5) {
      try {
        const allProducts = await axios.get('http://localhost:5000/api/products');
        const filteredProducts = allProducts.data.filter(product => product.price <= userPersona.budget);
        setProducts(filteredProducts);
        setStep(6);
        setError('');
      } catch (error) {
        console.error('Error fetching all products:', error);
        setError('Failed to fetch all products.');
      }
    } else if (step < 5 && step !== 1) {
      setStep(step + 1);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    const newCart = existingItem
      ? cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleCheckout = async () => {
    try {
      const order = cart.map(item => ({ productId: item._id, quantity: item.quantity }));
      await axios.post('http://localhost:5000/api/orders', { order });
      setCart([]);
      localStorage.removeItem('cart');
      navigate('/checkout', { state: { message: 'Order placed successfully!' } });
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Check backend.');
    }
  };

  const getStockStatus = (stock) => {
    if (stock < 15) return { status: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock < 30) return { status: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Good', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50">
      {error && <p className="text-red-500 mb-4 mx-6">{error}</p>}
      <header className="bg-white shadow-lg border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">RetailMind AI - Customer</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-gray-600 hover:text-blue-600">Cart</Link>
            <Link to="/admin" className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              <Settings className="h-6 w-6 text-gray-800" />
            </Link>
          </div>
        </div>
      </header>

      {step < 6 && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <User className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Step {step} of 5</p>
            </div>
            {step === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={userPersona.name}
                  onChange={(e) => setUserPersona({ ...userPersona, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}
            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job/Profession</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={userPersona.job}
                  onChange={(e) => setUserPersona({ ...userPersona, job: e.target.value })}
                  required
                >
                  <option value="">Select your job</option>
                  <option value="student">Student</option>
                  <option value="professional">Working Professional</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="entrepreneur">Entrepreneur</option>
                </select>
              </div>
            )}
            {step === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget: ₹{userPersona.budget}</label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={userPersona.budget}
                  onChange={(e) => setUserPersona({ ...userPersona, budget: parseInt(e.target.value) })}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>₹1,000</span>
                  <span>₹10,000</span>
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {['fitness', 'technology', 'cooking', 'reading', 'travel', 'health', 'gaming'].map((interest) => (
                    <button
                      key={interest}
                      onClick={() => {
                        const interests = userPersona.interests.includes(interest)
                          ? userPersona.interests.filter((i) => i !== interest)
                          : [...userPersona.interests, interest];
                        setUserPersona({ ...userPersona, interests });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        userPersona.interests.includes(interest)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 5 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lifestyle/Dietary Preference</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  value={userPersona.lifestyle}
                  onChange={(e) => setUserPersona({ ...userPersona, lifestyle: e.target.value })}
                >
                  <option value="">Select preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="gluten-free">Gluten-Free</option>
                </select>
              </div>
            )}
            <div className="mt-8 flex justify-between">
              {step !== 1 && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={step === 1 && !userPersona.name || step === 2 && !userPersona.job}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {step === 5 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome back, {userPersona.name}! 👋</h2>
            <p className="text-gray-600">Browse and shop your personalized recommendations</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <div key={category} className="col-span-1">
                <h3 className="text-lg font-semibold text-orange-700 mb-4">{category}</h3>
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {products.filter(p => p.category === category).map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <div
                        key={product._id}
                        className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow bg-yellow-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{product.image}</div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.status}
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                          <div className="text-sm text-gray-600">{product.demand}% demand</div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full"
                              style={{ width: `${product.demand}%` }}
                            ></div>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Cart ({cart.length} items)</h3>
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">₹{item.price} x <span className="font-medium">{item.quantity}</span></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="px-2 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="px-2 py-1 bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-right">
                  <p className="text-lg font-bold text-gray-800">
                    Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RetailMindDemo;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const Cart = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const handleCheckout = async () => {
    try {
      const order = cart.map(item => ({ productId: item._id, quantity: item.quantity }));
      await axios.post('http://localhost:5000/api/orders', { order });
      localStorage.removeItem('cart');
      setCart([]);
      navigate('/checkout', { state: { message: 'Order placed successfully!' } });
    } catch (error) {
      console.error('Error placing order:', error);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600">Your cart is empty.</p>
            <button
              onClick={() => navigate('/customer')}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
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
        )}
      </div>
    </div>
  );
};

export default Cart;
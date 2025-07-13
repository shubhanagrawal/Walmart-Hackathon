import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RetailMindDemo from './RetailMindDemo';
import AdminDashboard from './AdminDashboard';
import Cart from './Cart';
import Checkout from './Checkout';
import ProductDetails from './ProductDetails';
import OrderHistory from './OrderHistory';
import UserProfile from './UserProfile';

function App() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    if (role === 'client') navigate('/customer');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50">
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">RetailMind AI</h1>
                <p className="text-gray-600 mb-6">Please select your role to proceed</p>
                <button
                  onClick={() => handleLogin('client')}
                  className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mb-4 transition-colors"
                >
                  Client
                </button>
                <button
                  onClick={() => handleLogin('admin')}
                  className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Admin
                </button>
              </div>
            </div>
          }
        />
        <Route path="/customer" element={<RetailMindDemo />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default App;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
        {state?.message ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-green-600 mb-4">{state.message}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600">Order processing...</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
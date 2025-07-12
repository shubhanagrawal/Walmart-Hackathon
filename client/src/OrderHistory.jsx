import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/orders')
      .then(response => setOrders(response.data))
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Order History</h1>
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600">No orders yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            {orders.map(order => (
              <div key={order._id} className="border-b border-gray-200 pb-2">
                <p><strong>Product ID:</strong> {order.productId}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;
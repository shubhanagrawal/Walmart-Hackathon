import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import { ShoppingCart, Package, DollarSign, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import axios from 'axios';
import './index.css';

function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalSales: 0, lowStock: [], topProducts: [], totalOrders: 0 });
  const [demandData, setDemandData] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [restockSuggestions, setRestockSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        console.log('Events fetched:', response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();

    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard/metrics');
        console.log('Metrics fetched:', response.data);
        setMetrics(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Failed to fetch dashboard metrics.');
      }
    };

    const fetchDemandData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/forecast/${selectedProductId || 'all'}`);
        console.log('Demand data fetched:', response.data);
        setDemandData(response.data.demandData || [{ day: '2025-07-12', demand: 10, predicted: 12 }]);
        setError('');
      } catch (error) {
        console.error('Error fetching demand data:', error);
        setError('Failed to fetch demand data.');
      }
    };

    const fetchPriceData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/price-optimization/${selectedProductId || 'all'}`);
        console.log('Price data fetched:', response.data);
        setPriceData(response.data.priceData || [{ price: 300, revenue: 15000, demand: 70 }]);
        setError('');
      } catch (error) {
        console.error('Error fetching price data:', error);
        setError('Failed to fetch price data.');
      }
    };

    const fetchRestockSuggestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/restock');
        console.log('Restock suggestions fetched:', response.data);
        setRestockSuggestions(response.data || []);
        setError('');
      } catch (error) {
        console.error('Error fetching restock suggestions:', error);
        setError('Failed to fetch restock suggestions.');
      }
    };

    fetchMetrics();
    fetchDemandData();
    fetchPriceData();
    fetchRestockSuggestions();
  }, [selectedProductId]);

  const handleProductSelect = (e) => {
    setSelectedProductId(e.target.value);
  };

  const filteredSuggestions = restockSuggestions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Search restock items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-6 w-6 text-gray-600" />
            <select
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              value={selectedProductId}
              onChange={handleProductSelect}
            >
              <option value="all">All Products</option>
              {metrics.lowStock.concat(metrics.topProducts.map(p => p.product)).map(product => (
                <option key={product._id} value={product._id}>{product.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-indigo-600">{metrics.totalSales} units</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">{metrics.lowStock.length} items</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Products</p>
                <p className="text-2xl font-bold text-green-600">{metrics.topProducts.length} tracked</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.totalOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Demand Forecast</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="day" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', color: '#000' }} />
                <Legend wrapperStyle={{ color: '#374151' }} />
                <Line type="monotone" dataKey="demand" stroke="#ff6384" name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#36a2eb" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Dynamic Pricing</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="price" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', color: '#000' }} />
                <Legend wrapperStyle={{ color: '#374151' }} />
                <Bar dataKey="revenue" fill="#ff9f40" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Smart Inventory Restocking</h2>
          {filteredSuggestions.length > 0 ? (
            <div className="space-y-3">
              {filteredSuggestions.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">{item.name}</p>
                    <p className="text-sm text-yellow-600">
                      Stock: {item.stock} units, Predicted Demand: {Math.round(item.predictedDemand)} units in next 5 days
                    </p>
                    <p className="text-sm text-yellow-600">Restock: {Math.max(0, Math.round(item.restock))} units now</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No restock suggestions at this time.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Products by Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', color: '#000' }} />
              <Legend wrapperStyle={{ color: '#374151' }} />
              <Bar dataKey="totalQuantity" fill="#4bc0c0" name="Sales Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
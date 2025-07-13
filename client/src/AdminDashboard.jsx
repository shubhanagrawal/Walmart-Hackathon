import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import { ShoppingCart, Package, DollarSign, AlertTriangle, TrendingUp, Search, Brain } from 'lucide-react';

function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalSales: 0, lowStock: [], topProducts: [], totalOrders: 0 });
  const [demandData, setDemandData] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [restockSuggestions, setRestockSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ML Prediction form state
  const [showMLForm, setShowMLForm] = useState(false);
  const [mlFormData, setMLFormData] = useState({
    'Products': '',
    'Category': '',
    'Region': '',
    'Units Sold': '',
    'Units Ordered': '',
    'Demand Forecast': '',
    'Price': '',
    'Discount': '',
    'Weather Condition': '',
    'Holiday/Promotion': 0,
    'Competitor Pricing': '',
    'Seasonality': '',
    'year': new Date().getFullYear(),
    'month': new Date().getMonth() + 1,
    'day': new Date().getDate()
  });
  const [mlPrediction, setMLPrediction] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [selectedProductId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEvents(),
        fetchMetrics(),
        fetchDemandData(),
        fetchPriceData(),
        fetchRestockSuggestions()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      console.log('Events fetched:', data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      console.log('Metrics fetched:', data);
      setMetrics(data);
      setError('');
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Failed to fetch dashboard metrics.');
    }
  };

  const fetchDemandData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/forecast/${selectedProductId || 'all'}`);
      if (!response.ok) throw new Error('Failed to fetch demand data');
      const data = await response.json();
      console.log('Demand data fetched:', data);
      setDemandData(data.demandData || []);
      setError('');
    } catch (error) {
      console.error('Error fetching demand data:', error);
      setError('Failed to fetch demand data.');
    }
  };

  const fetchPriceData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/price-optimization/${selectedProductId || 'all'}`);
      if (!response.ok) throw new Error('Failed to fetch price data');
      const data = await response.json();
      console.log('Price data fetched:', data);
      setPriceData(data.priceData || []);
      setError('');
    } catch (error) {
      console.error('Error fetching price data:', error);
      setError('Failed to fetch price data.');
    }
  };

  const fetchRestockSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/restock');
      if (!response.ok) throw new Error('Failed to fetch restock suggestions');
      const data = await response.json();
      console.log('Restock suggestions fetched:', data);
      setRestockSuggestions(data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching restock suggestions:', error);
      setError('Failed to fetch restock suggestions.');
    }
  };

  const handleProductSelect = (e) => {
    setSelectedProductId(e.target.value);
  };

  const handleMLFormChange = (e) => {
    const { name, value } = e.target;
    setMLFormData(prev => ({
      ...prev,
      [name]: name === 'Holiday/Promotion' ? (value === 'true' ? 1 : 0) : value
    }));
  };

  const handleMLPrediction = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/predict/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlFormData)
      });

      if (!response.ok) throw new Error(`Failed to get ${type} prediction`);
      const data = await response.json();
      setMLPrediction(data);
      setError('');
    } catch (error) {
      console.error(`Error getting ${type} prediction:`, error);
      setError(`Failed to get ${type} prediction.`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = restockSuggestions.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={() => setShowMLForm(!showMLForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Brain className="h-5 w-5" />
            <span>ML Predictions</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Loading...
          </div>
        )}

        {/* ML Prediction Form */}
        {showMLForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🤖 ML Demand & Price Prediction</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                name="Products"
                placeholder="Product Name"
                value={mlFormData.Products}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="Category"
                placeholder="Category"
                value={mlFormData.Category}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="Region"
                placeholder="Region"
                value={mlFormData.Region}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="Units Sold"
                placeholder="Units Sold"
                value={mlFormData['Units Sold']}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="Units Ordered"
                placeholder="Units Ordered"
                value={mlFormData['Units Ordered']}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="Demand Forecast"
                placeholder="Demand Forecast"
                value={mlFormData['Demand Forecast']}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="Price"
                placeholder="Price"
                value={mlFormData.Price}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="Discount"
                placeholder="Discount"
                value={mlFormData.Discount}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="Weather Condition"
                placeholder="Weather Condition"
                value={mlFormData['Weather Condition']}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <select
                name="Holiday/Promotion"
                value={mlFormData['Holiday/Promotion']}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>No Holiday/Promotion</option>
                <option value={1}>Holiday/Promotion</option>
              </select>
              <input
                type="number"
                name="Competitor Pricing"
                placeholder="Competitor Pricing"
                value={mlFormData['Competitor Pricing']}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="Seasonality"
                placeholder="Seasonality"
                value={mlFormData.Seasonality}
                onChange={handleMLFormChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => handleMLPrediction('demand')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                disabled={loading}
              >
                Predict Demand
              </button>
              <button
                onClick={() => handleMLPrediction('price')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                Predict Price
              </button>
            </div>
            {mlPrediction && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Prediction Results:</h3>
                <pre className="text-sm text-gray-600">{JSON.stringify(mlPrediction, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

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
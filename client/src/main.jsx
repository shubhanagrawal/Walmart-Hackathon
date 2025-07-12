import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import RetailMindDemo from './RetailMindDemo';
import AdminDashboard from './AdminDashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <nav className="bg-white shadow-lg border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">RetailMind AI</Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Customer Dashboard</Link>
            <Link to="/admin" className="text-gray-600 hover:text-blue-600">Admin Dashboard</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<RetailMindDemo />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
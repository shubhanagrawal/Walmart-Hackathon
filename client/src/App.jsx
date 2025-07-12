import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RetailMindDemo from './RetailMindDemo';
import AdminDashboard from './AdminDashboard';
import Cart from './Cart';
import Checkout from './Checkout';
import ProductDetails from './ProductDetails'; // Create this
import OrderHistory from './OrderHistory'; // Create this
import UserProfile from './UserProfile'; // Create this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RetailMindDemo />} />
        <Route path="/customer" element={<RetailMindDemo />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
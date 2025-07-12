import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(response => setProduct(response.data))
      .catch(err => console.error('Error fetching product:', err));
  }, [id]);

  if (!product) return <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{product.name}</h1>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Price:</strong> ₹{product.price}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
          <p><strong>Demand:</strong> {product.demand}%</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
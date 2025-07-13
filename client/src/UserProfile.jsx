import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    job: '',
    budget: 5000,
    interests: [],
    lifestyle: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedPersona = JSON.parse(localStorage.getItem('userPersona') || '{}');
    if (savedPersona.name) {
      setUserData(savedPersona);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p><strong>Name:</strong> {userData.name || 'Not set'}</p>
          <p><strong>Job:</strong> {userData.job || 'Not set'}</p>
          <p><strong>Budget:</strong> ₹{userData.budget || 5000}</p>
          <p><strong>Interests:</strong> {userData.interests.join(', ') || 'Not set'}</p>
          <p><strong>Lifestyle:</strong> {userData.lifestyle || 'Not set'}</p>
        </div>
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

export default UserProfile;
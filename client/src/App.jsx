import React, { useState, useEffect } from 'react';
     import axios from 'axios';
     import { Line } from 'react-chartjs-2';
     import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';
     ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

     function App() {
       const [persona, setPersona] = useState({
         jobType: '', workingHours: '', hobbies: '', favoriteBrands: '', dietaryChoices: '', budgetRange: ''
       });
       const [recommendations, setRecommendations] = useState([]);
       const [forecast, setForecast] = useState(null);
       const [restock, setRestock] = useState(null);
       const [productId, setProductId] = useState('');

       const handleInputChange = (e) => {
         setPersona({ ...persona, [e.target.name]: e.target.value });
       };

       const handlePersonaSubmit = async (e) => {
         e.preventDefault();
         try {
           const response = await axios.post('http://localhost:5000/api/recommendations', persona);
           setRecommendations(response.data);
         } catch (error) {
           console.error('Error fetching recommendations:', error);
         }
       };

       const handleForecastSubmit = async (e) => {
         e.preventDefault();
         try {
           const response = await axios.get(`http://localhost:5000/api/forecast/${productId}`);
           setForecast(response.data);
         } catch (error) {
           console.error('Error fetching forecast:', error);
         }
       };

       const handleRestockSubmit = async (e) => {
         e.preventDefault();
         try {
           const response = await axios.get(`http://localhost:5000/api/restock/${productId}`);
           setRestock(response.data);
         } catch (error) {
           console.error('Error fetching restock:', error);
         }
       };

       return (
         <div style={{ padding: '20px' }}>
           <h1>RetailMind AI Lite</h1>
           <h2>Persona Form</h2>
           <form onSubmit={handlePersonaSubmit}>
             <input name="jobType" placeholder="Job Type" onChange={handleInputChange} />
             <input name="workingHours" placeholder="Working Hours" onChange={handleInputChange} />
             <input name="hobbies" placeholder="Hobbies (comma-separated)" onChange={handleInputChange} />
             <input name="favoriteBrands" placeholder="Favorite Brands (comma-separated)" onChange={handleInputChange} />
             <input name="dietaryChoices" placeholder="Dietary Choices (comma-separated)" onChange={handleInputChange} />
             <input name="budgetRange" placeholder="Budget Range (e.g., 100-500)" onChange={handleInputChange} />
             <button type="submit">Submit Persona</button>
           </form>
           <h2>Recommendations</h2>
           <ul>
             {recommendations.map((product, index) => (
               <li key={index}>{product.name} - {product.category}</li>
             ))}
           </ul>
           <h2>Demand Forecast</h2>
           <form onSubmit={handleForecastSubmit}>
             <input
               placeholder="Product ID"
               value={productId}
               onChange={(e) => setProductId(e.target.value)}
             />
             <button type="submit">Get Forecast</button>
           </form>
           {forecast && (
             <div>
               <p>Demand: {forecast.demand} units</p>
               <p>Price: ₹{forecast.price}</p>
               <Line
                 data={{
                   labels: ['Day 1', 'Day 2'],
                   datasets: [{ label: 'Demand', data: [forecast.demand, forecast.demand], borderColor: 'blue' }],
                 }}
               />
             </div>
           )}
           <h2>Inventory Restock</h2>
           <form onSubmit={handleRestockSubmit}>
             <input
               placeholder="Product ID"
               value={productId}
               onChange={(e) => setProductId(e.target.value)}
             />
             <button type="submit">Get Restock</button>
           </form>
           {restock && <p>Restock Suggestion: {restock.restock} units</p>}
         </div>
       );
     }

     export default App;
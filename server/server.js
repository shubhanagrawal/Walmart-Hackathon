const express = require('express');
     const mongoose = require('mongoose');
     const cors = require('cors');
     const dotenv = require('dotenv');
     const math = require('mathjs');

     dotenv.config();
     const app = express();
     app.use(cors());
     app.use(express.json());

     mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
       .then(() => console.log('MongoDB connected'))
       .catch(err => console.error('MongoDB connection error:', err));

     const personaSchema = new mongoose.Schema({
       jobType: String,
       workingHours: String,
       hobbies: [String],
       favoriteBrands: [String],
       dietaryChoices: [String],
       budgetRange: String,
     });

     const productSchema = new mongoose.Schema({
       name: String,
       category: String,
       price: Number,
       stock: Number,
       brand: String,
       tags: [String],
     });

     const saleSchema = new mongoose.Schema({
       productId: String,
       quantity: Number,
       date: Date,
       weather: String,
       event: String,
     });

     const Persona = mongoose.model('Persona', personaSchema);
     const Product = mongoose.model('Product', productSchema);
     const Sale = mongoose.model('Sale', saleSchema);

     app.post('/api/recommendations', async (req, res) => {
       try {
         const { hobbies, favoriteBrands, budgetRange } = req.body;
         const [minBudget, maxBudget] = budgetRange.split('-').map(Number);
         const products = await Product.find({
           $or: [
             { tags: { $in: hobbies.split(',') } },
             { brand: { $in: favoriteBrands.split(',') } },
           ],
           price: { $gte: minBudget, $lte: maxBudget },
         });
         await Persona.create(req.body);
         res.json(products);
       } catch (error) {
         res.status(500).json({ error: 'Error fetching recommendations' });
       }
     });

     app.get('/api/forecast/:productId', async (req, res) => {
       try {
         const sales = await Sale.find({ productId: req.params.productId });
         const quantities = sales.map(sale => sale.quantity);
         const demand = quantities.length > 0 ? math.mean(quantities) : 0;
         const product = await Product.findOne({ _id: req.params.productId });
         res.json({ demand: Math.round(demand), price: product ? product.price : 0 });
       } catch (error) {
         res.status(500).json({ error: 'Error fetching forecast' });
       }
     });

     app.get('/api/restock/:productId', async (req, res) => {
       try {
         const product = await Product.findOne({ _id: req.params.productId });
         const sales = await Sale.find({ productId: req.params.productId });
         const avgSales = sales.length > 0 ? math.mean(sales.map(s => s.quantity)) : 0;
         const restock = product ? Math.max(0, Math.round(avgSales * 2 - product.stock)) : 0;
         res.json({ restock });
       } catch (error) {
         res.status(500).json({ error: 'Error fetching restock' });
       }
     });

     app.get('/api/recommendations/test', (req, res) => {
       res.json({ message: 'Backend is running' });
     });

     const PORT = process.env.PORT || 5000;
     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
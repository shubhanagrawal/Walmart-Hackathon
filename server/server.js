const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const math = require('mathjs');

dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

if (!process.env.MONGO_URI || !process.env.PORT) {
  console.error('Missing environment variables. Check .env file.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const personaSchema = new mongoose.Schema({
  jobType: String,
  budgetRange: String,
  hobbies: String,
  favoriteBrands: String,
  dietaryChoices: String,
});

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  stock: Number,
  brand: String,
  tags: [String],
  demand: Number,
  image: String,
});

const saleSchema = new mongoose.Schema({
  productId: String,
  quantity: Number,
  date: Date,
  weather: String,
  event: String,
});

const orderSchema = new mongoose.Schema({
  productId: String,
  quantity: Number,
  date: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  name: String,
  impact: String,
  products: [String],
});

const Persona = mongoose.model('Persona', personaSchema);
const Product = mongoose.model('Product', productSchema);
const Sale = mongoose.model('Sale', saleSchema);
const Order = mongoose.model('Order', orderSchema);
const Event = mongoose.model('Event', eventSchema);

// Seed 500 products
const seedProducts = async () => {
  const categories = ['Electronics', 'Clothing', 'Health', 'Fitness', 'Books'];
  const brands = ['Nike', 'Samsung', 'Apple', 'Adidas', 'Penguin'];
  const tags = ['tech', 'sport', 'casual', 'health', 'education'];
  const existingCount = await Product.countDocuments();
  if (existingCount < 500) {
    const newProducts = Array.from({ length: 500 - existingCount }, (_, i) => ({
      name: `Product ${existingCount + i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: Math.floor(Math.random() * 1000) + 100,
      stock: Math.floor(Math.random() * 100) + 10,
      brand: brands[Math.floor(Math.random() * brands.length)],
      tags: Array.from({ length: 2 }, () => tags[Math.floor(Math.random() * tags.length)]),
      demand: Math.floor(Math.random() * 100),
      image: '📱',
    }));
    await Product.insertMany(newProducts);
    console.log('Seeded 500 products');
  }
};
seedProducts();

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

app.post('/api/recommendations', async (req, res) => {
  try {
    console.log('Received recommendation request:', req.body);
    const { hobbies, budgetRange } = req.body;
    const [minBudget, maxBudget] = budgetRange.split('-').map(Number);
    const events = await Event.find();
    const currentEvent = events.find(event => 
      new Date().toLocaleDateString() === new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    const products = await Product.find({
      $or: [
        { tags: { $in: hobbies.split(',') } },
        { category: { $in: ['Health', 'Fitness'] } },
      ],
      price: { $gte: minBudget, $lte: maxBudget },
    });
    if (!products.length) {
      return res.status(404).json({ error: 'No products found matching criteria' });
    }
    const boostedProducts = products.map(product => {
      const eventBoost = currentEvent?.products.some(p => product.name.toLowerCase().includes(p.toLowerCase())) ? 1.2 : 1.0;
      return { ...product._doc, demand: Math.round(product.demand * eventBoost) };
    });
    await Persona.create(req.body);
    res.json(boostedProducts);
  } catch (error) {
    console.error('Error in recommendations:', error);
    res.status(500).json({ error: 'Error fetching recommendations' });
  }
});

app.get('/api/forecast/:productId', async (req, res) => {
  try {
    const productId = req.params.productId === 'all' ? null : req.params.productId;
    const sales = productId ? await Sale.find({ productId }) : await Sale.find();
    if (!sales.length) {
      return res.json({ demandData: [{ day: '2025-07-12', demand: 10, predicted: 12 }] });
    }
    const events = await Event.find();
    const demandData = sales.map(sale => {
      const event = events.find(e => e.name === sale.event);
      const eventImpact = event ? parseFloat(event.impact) / 100 : 0;
      const weatherFactor = sale.weather === 'rainy' ? 1.2 : sale.weather === 'cloudy' ? 1.1 : 1.0;
      const dayOfWeekFactor = ['Sat', 'Sun'].includes(new Date(sale.date).toLocaleString('en-US', { weekday: 'short' })) ? 1.1 : 1.0;
      const baseDemand = sale.quantity;
      const predicted = Math.round(baseDemand * (1 + eventImpact) * weatherFactor * dayOfWeekFactor);
      return { day: sale.date.toISOString().split('T')[0], demand: baseDemand, predicted };
    });
    res.json({ demandData });
  } catch (error) {
    console.error('Error in forecast:', error);
    res.status(500).json({ error: 'Error fetching forecast' });
  }
});

app.get('/api/price-optimization/:productId', async (req, res) => {
  try {
    const productId = req.params.productId === 'all' ? null : req.params.productId;
    const product = productId ? await Product.findOne({ _id: productId }) : null;
    const basePrice = product ? product.price : 300;
    const a = 100;
    const b = 0.1;
    const optimalPrice = Math.round(a / (2 * b));
    const priceData = [0.8, 0.9, 1.0, 1.1, 1.2].map(factor => {
      const price = Math.round(basePrice * factor);
      const revenue = a * price - b * price * price;
      return { price, revenue: Math.round(revenue), demand: Math.round(100 - price / 10) };
    });
    res.json({ priceData, optimalPrice });
  } catch (error) {
    console.error('Error in price optimization:', error);
    res.status(500).json({ error: 'Error fetching price data' });
  }
});

app.get('/api/restock', async (req, res) => {
  try {
    const products = await Product.find();
    const sales = await Sale.find();
    const events = await Event.find();
    const currentEvent = events.find(event => 
      new Date().toLocaleDateString() === new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    if (!products.length || !sales.length) {
      return res.json([]);
    }
    const restockSuggestions = await Promise.all(
      products.map(async (product) => {
        const productSales = sales.filter(sale => sale.productId === product._id.toString());
        const avgDailyDemand = productSales.length > 0 ? math.mean(productSales.map(s => s.quantity)) : 0;
        const eventImpact = currentEvent?.products.some(p => product.name.toLowerCase().includes(p.toLowerCase())) 
          ? parseFloat(currentEvent.impact) / 100 
          : 0;
        const predictedDemand = Math.round(avgDailyDemand * 5 * (1 + eventImpact));
        const restock = product.stock < predictedDemand ? Math.max(0, predictedDemand - product.stock + 10) : 0;
        return restock > 0 ? { name: product.name, stock: product.stock, predictedDemand, restock } : null;
      })
    );
    res.json(restockSuggestions.filter(s => s));
  } catch (error) {
    console.error('Error in restock:', error);
    res.status(500).json({ error: 'Error fetching restock suggestions' });
  }
});

app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const totalSales = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const lowStock = await Product.find({ stock: { $lt: 30 } });
    const topProducts = await Sale.aggregate([
      { $group: { _id: '$productId', totalQuantity: { $sum: '$quantity' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalQuantity: 1, _id: '$product._id' } },
    ]);
    const totalOrders = await Order.countDocuments();
    res.json({
      totalSales: totalSales[0]?.total || 0,
      lowStock: lowStock,
      topProducts: topProducts,
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard metrics' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { order } = req.body;
    for (const item of order) {
      await Order.create(item);
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
    res.json({ message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error placing order' });
  }
});

app.get('/api/recommendations/test', (req, res) => {
  res.json({ message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
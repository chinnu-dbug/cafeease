/**
 * ============================================================
 * CafeEase - Node.js & Express Backend Server with MongoDB
 * Stores:
 *   1. Users (Students & Admins) in MongoDB
 *   2. Menu Items in MongoDB
 *   3. Table Orders & Payment Status in MongoDB
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cafeease';
const IS_VERCEL = Boolean(process.env.VERCEL);
const HAS_VALID_CLOUD_MONGO = !(IS_VERCEL && (MONGO_URI.includes('127.0.0.1') || MONGO_URI.includes('localhost')));

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'html')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/auth', express.static(path.join(__dirname, 'auth')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'html', 'images')));

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/auth/signup.html');
});

// ------------------------------------------------------------
// 1. MONGODB CONNECTION WITH RESILIENT AUTO-RECONNECT
// ------------------------------------------------------------
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10
};

let isReconnecting = false;

async function connectToMongoDB() {
  if (!HAS_VALID_CLOUD_MONGO) {
    console.log('Vercel mode detected without cloud MONGO_URI. Skipping local connection.');
    return;
  }
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI, MONGO_OPTIONS);
    console.log('--------------------------------------------------');
    console.log('Connected to MongoDB successfully!');
    console.log(`Database URI: ${MONGO_URI}`);
    console.log('--------------------------------------------------');
    await seedInitialData();
  } catch (err) {
    console.log('--------------------------------------------------');
    console.log('MongoDB Connection Notice:');
    console.log(err.message);
    if (!IS_VERCEL) {
      console.log('Auto-retry scheduled in 3 seconds...');
      scheduleReconnect();
    }
    console.log('--------------------------------------------------');
  }
}

function scheduleReconnect() {
  if (isReconnecting || IS_VERCEL) return;
  isReconnecting = true;
  setTimeout(async () => {
    isReconnecting = false;
    if (mongoose.connection.readyState !== 1) {
      await connectToMongoDB();
    }
  }, 3000);
}

// Active connection lifecycle listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established.');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting auto-reconnect...');
  scheduleReconnect();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
  scheduleReconnect();
});

// Middleware to ensure DB connection on serverless cold starts
app.use('/api', async (req, res, next) => {
  if (HAS_VALID_CLOUD_MONGO && mongoose.connection.readyState !== 1) {
    await connectToMongoDB();
  }
  next();
});

// Initial boot connection
if (!IS_VERCEL) {
  connectToMongoDB();
}

// ------------------------------------------------------------
// 2. MONGOOSE SCHEMAS & MODELS
// ------------------------------------------------------------

// A. User Schema (Students & Admins)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  studentId: { type: String, default: '' },
  table: { type: String, default: '4' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// B. Food Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, default: 'images/burger.jpg' },
  createdAt: { type: Date, default: Date.now }
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// C. Table Order Schema
const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  table: { type: String, required: true },
  student: { type: String, required: true },
  items: { type: String, required: true },
  total: { type: Number, required: true },
  paymentMode: { type: String, required: true },   // "UPI / Online" or "Cash at Counter"
  paymentStatus: { type: String, required: true }, // "PAID" or "UNPAID"
  kitchenStatus: { type: String, default: 'Received' }, // "Received", "Preparing", "Served"
  time: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ------------------------------------------------------------
// 3. INITIAL DATABASE SEEDER (Default Users, Menu & Orders)
// ------------------------------------------------------------
async function seedInitialData() {
  try {
    // A. Seed Default Users if none exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding default student and admin users into MongoDB...');
      await User.insertMany([
        {
          name: "Rahul Sharma",
          email: "student@cafeease.com",
          password: "password123",
          role: "student",
          studentId: "STU-2024-001",
          table: "4"
        },
        {
          name: "Cafeteria Manager",
          email: "admin@cafeease.com",
          password: "admin",
          role: "admin",
          studentId: "ADM-001",
          table: "1"
        }
      ]);
      console.log('✅ Default users seeded into MongoDB.');
    }

    // B. Seed Menu Items
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      console.log('🌱 Seeding default cafeteria menu items into MongoDB...');
      await MenuItem.insertMany([
        { name: "Burger", category: "Fast Food", price: 120, description: "Juicy grilled patty with fresh veggies and melted cheese.", image: "images/burger.jpg" },
        { name: "Pizza", category: "Fast Food", price: 240, description: "Cheesy pizza loaded with fresh toppings and herbs.", image: "images/pizza.jpg" },
        { name: "Biryani", category: "Meals", price: 180, description: "Aromatic basmati rice served with curry and egg.", image: "images/biryani.jpg" },
        { name: "Sandwich", category: "Fast Food", price: 80, description: "Crispy toasted bread packed with fresh vegetables.", image: "images/sandwich.jpg" },
        { name: "Noodles", category: "Fast Food", price: 130, description: "Wok-tossed noodles with bell peppers and spices.", image: "images/noodles.jpg" },
        { name: "Coffee", category: "Beverages", price: 50, description: "Hot freshly brewed artisanal cappuccino coffee.", image: "images/coffee.jpg" }
      ]);
      console.log('✅ Menu items seeded.');
    }

    // C. Seed Demo Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('🌱 Seeding initial demo orders into MongoDB...');
      await Order.insertMany([
        {
          id: "ORD-101",
          table: "Table 4",
          student: "Rahul Sharma",
          items: "1x Biryani, 1x Coffee",
          total: 230,
          paymentMode: "UPI / Online",
          paymentStatus: "PAID",
          kitchenStatus: "Preparing",
          time: "12:15 PM"
        },
        {
          id: "ORD-102",
          table: "Table 8",
          student: "Priya Patel",
          items: "2x Burger",
          total: 240,
          paymentMode: "Cash at Counter",
          paymentStatus: "UNPAID",
          kitchenStatus: "Received",
          time: "12:30 PM"
        }
      ]);
      console.log('✅ Demo orders seeded.');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

// ------------------------------------------------------------
// 4. REST API ROUTES
// ------------------------------------------------------------

// Server Status / Health Check
app.get('/api/status', async (req, res) => {
  // If not yet connected, attempt connection right away
  if (HAS_VALID_CLOUD_MONGO && mongoose.connection.readyState !== 1) {
    try {
      await connectToMongoDB();
    } catch (e) {}
  }
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    mongoConnected: isConnected,
    readyState: mongoose.connection.readyState,
    database: 'cafeease',
    hasCloudMongo: HAS_VALID_CLOUD_MONGO,
    time: new Date().toISOString()
  });
});

// --- AUTHENTICATION ROUTES (MongoDB) ---

// POST /api/auth/signup - Register Student or Admin in MongoDB
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, studentId, table } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'student',
      studentId: studentId || '',
      table: table || '4'
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully in MongoDB!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        table: newUser.table
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login - Login user from MongoDB
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user in MongoDB by email or studentId
    const user = await User.findOne({
      $or: [{ email: email }, { studentId: email }]
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. Not registered as ${role}.` });
    }

    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        table: user.table
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- FOOD MENU ROUTES (MongoDB) ---

const FALLBACK_MENU = [
  { id: "item-1", name: "Burger", category: "Fast Food", price: 120, description: "Juicy grilled patty with fresh veggies and melted cheese.", image: "images/burger.jpg" },
  { id: "item-2", name: "Pizza", category: "Fast Food", price: 240, description: "Cheesy pizza loaded with fresh toppings and herbs.", image: "images/pizza.jpg" },
  { id: "item-3", name: "Biryani", category: "Meals", price: 180, description: "Aromatic basmati rice served with curry and egg.", image: "images/biryani.jpg" },
  { id: "item-4", name: "Sandwich", category: "Fast Food", price: 80, description: "Crispy toasted bread packed with fresh vegetables.", image: "images/sandwich.jpg" },
  { id: "item-5", name: "Noodles", category: "Fast Food", price: 130, description: "Wok-tossed noodles with bell peppers and spices.", image: "images/noodles.jpg" },
  { id: "item-6", name: "Coffee", category: "Beverages", price: 50, description: "Hot freshly brewed artisanal cappuccino coffee.", image: "images/coffee.jpg" }
];

const FALLBACK_ORDERS = [
  { id: "ORD-101", table: "Table 4", student: "Rahul Sharma", items: "1x Biryani, 1x Coffee", total: 230, paymentMode: "UPI / Online", paymentStatus: "PAID", kitchenStatus: "Preparing", time: "12:15 PM" },
  { id: "ORD-102", table: "Table 8", student: "Priya Patel", items: "2x Burger", total: 240, paymentMode: "Cash at Counter", paymentStatus: "UNPAID", kitchenStatus: "Received", time: "12:30 PM" }
];

// GET /api/menu - Get all food items from MongoDB
app.get('/api/menu', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, count: FALLBACK_MENU.length, items: FALLBACK_MENU });
    }
    const items = await MenuItem.find().sort({ createdAt: 1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/menu - Admin adds new food item to MongoDB
app.post('/api/menu', async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({ success: false, message: 'Name, price, and description are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const memItem = { id: "item-" + Date.now(), name, category: category || 'Fast Food', price: Number(price), description, image: image || 'images/burger.jpg' };
      FALLBACK_MENU.push(memItem);
      return res.status(201).json({ success: true, message: `Added "${name}" (Memory store)`, item: memItem });
    }

    const newItem = new MenuItem({
      name,
      category: category || 'Fast Food',
      price: Number(price),
      description,
      image: image || 'images/burger.jpg'
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: `Added "${name}" to MongoDB menu!`,
      item: newItem
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/menu/:id - Admin deletes food item from MongoDB
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await MenuItem.findByIdAndDelete(id);
    }
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- TABLE ORDERS & PAYMENT ROUTES (MongoDB) ---

// GET /api/orders - Get all table orders from MongoDB
app.get('/api/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, count: FALLBACK_ORDERS.length, orders: FALLBACK_ORDERS });
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders - Student places order to table in MongoDB
app.post('/api/orders', async (req, res) => {
  try {
    const { table, student, items, total, paymentMode, paymentStatus } = req.body;

    if (!table || !items || !total) {
      return res.status(400).json({ success: false, message: 'Table, items, and total are required.' });
    }

    const orderId = "ORD-" + Math.floor(100 + Math.random() * 900);
    const newOrder = new Order({
      id: orderId,
      table,
      student: student || 'Student',
      items,
      total: Number(total),
      paymentMode: paymentMode || 'UPI / Online',
      paymentStatus: paymentStatus || (paymentMode.includes('UPI') ? 'PAID' : 'UNPAID'),
      kitchenStatus: 'Received',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order saved in MongoDB!',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/payment - Admin toggles Paid / Unpaid in MongoDB
app.patch('/api/orders/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ id: id }) || await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = (order.paymentStatus === 'PAID') ? 'UNPAID' : 'PAID';
    await order.save();

    res.json({
      success: true,
      message: `Updated payment to ${order.paymentStatus}`,
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/kitchen - Admin updates kitchen status in MongoDB
app.patch('/api/orders/:id/kitchen', async (req, res) => {
  try {
    const { id } = req.params;
    const { kitchenStatus } = req.body;

    const order = await Order.findOne({ id: id }) || await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.kitchenStatus = kitchenStatus;
    await order.save();

    res.json({ success: true, message: `Status updated to ${kitchenStatus}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/price - Admin edits order total price
app.patch('/api/orders/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const newPrice = Number(req.body.price);

    if (isNaN(newPrice) || newPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid price. Must be a positive number.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const order = FALLBACK_ORDERS.find(o => o.id === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      order.total = newPrice;
      return res.json({ success: true, message: 'Price updated (fallback).', order });
    }

    const order = await Order.findOne({ id }) || await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.total = newPrice;
    await order.save();

    res.json({ success: true, message: `Price updated to ₹${newPrice}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/orders/:id - Admin removes order from MongoDB
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findOneAndDelete({ id: id });
    res.json({ success: true, message: 'Order removed from MongoDB.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reset - Reset demo data in MongoDB
app.post('/api/reset', async (req, res) => {
  try {
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await seedInitialData();
    res.json({ success: true, message: 'MongoDB data reset to initial defaults.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------
// 5. START SERVER (Local) & EXPORT FOR VERCEL SERVERLESS
// ------------------------------------------------------------
if (!IS_VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`CafeEase Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
    console.log('==================================================');
  });
}

module.exports = app;

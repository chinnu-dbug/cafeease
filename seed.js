/**
 * CafeEase - MongoDB Initial Seeder Script
 * Run this to instantly populate MongoDB with users, menu items, and orders.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cafeease';

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

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, default: 'images/burger.jpg' },
  createdAt: { type: Date, default: Date.now }
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  table: { type: String, required: true },
  student: { type: String, required: true },
  items: { type: String, required: true },
  total: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  kitchenStatus: { type: String, default: 'Received' },
  time: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

async function runSeed() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB!');

  // Seed Users
  const userCount = await User.countDocuments();
  if (userCount === 0) {
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
    console.log('Seeded 2 users (Student & Admin)');
  } else {
    console.log(` Users already exist (${userCount} users).`);
  }

  // Seed Menu Items
  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany([
      { name: "Burger", category: "Fast Food", price: 120, description: "Juicy grilled patty with fresh veggies and melted cheese.", image: "images/burger.jpg" },
      { name: "Pizza", category: "Fast Food", price: 240, description: "Cheesy pizza loaded with fresh toppings and herbs.", image: "images/pizza.jpg" },
      { name: "Biryani", category: "Meals", price: 180, description: "Aromatic basmati rice served with curry and egg.", image: "images/biryani.jpg" },
      { name: "Sandwich", category: "Fast Food", price: 80, description: "Crispy toasted bread packed with fresh vegetables.", image: "images/sandwich.jpg" },
      { name: "Noodles", category: "Fast Food", price: 130, description: "Wok-tossed noodles with bell peppers and spices.", image: "images/noodles.jpg" },
      { name: "Coffee", category: "Beverages", price: 50, description: "Hot freshly brewed artisanal cappuccino coffee.", image: "images/coffee.jpg" }
    ]);
    console.log('Seeded 6 cafeteria menu dishes');
  } else {
    console.log(`ℹ️ Menu items already exist (${menuCount} items).`);
  }

  // Seed Orders
  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
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
    console.log('✅ Seeded demo table orders with payment status');
  } else {
    console.log(`ℹ️ Orders already exist (${orderCount} orders).`);
  }

  console.log('🎉 MongoDB seeding complete! Check MongoDB Compass now.');
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch(err => {
  console.error('❌ Seeder error:', err);
  process.exit(1);
});

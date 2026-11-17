# CafeEase - Cafeteria Online Table Ordering System with MongoDB

An online food ordering system for campus cafeterias that allows students to order food directly to their table with payment options (UPI / Cash at Counter), and gives admins a dashboard to add food items (with custom image upload) and track order payments in **MongoDB**.

---

## 🗄️ MongoDB Setup & Compass Guide

Your local MongoDB Server is installed and running on your laptop. The database **`cafeease`** has already been created and seeded with default users, menu dishes, and demo orders.

### How to Connect MongoDB Compass (Step-by-Step):

If you see `connect ECONNREFUSED 127.0.0.1:27017` when clicking a saved profile like "web project":

1. In MongoDB Compass, look at the top left and click the **`+`** (plus) button next to **"CONNECTIONS"** (or click the **`+`** tab next to "Welcome").
2. In the **New Connection** input box, paste:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Click the green **"Connect"** button.
4. On the left sidebar, click the **`cafeease`** database. You will see:
   - **`users`**: Rahul Sharma (student) & Cafeteria Manager (admin)
   - **`menuitems`**: 6 default dishes + any new food items you add
   - **`orders`**: Table orders with payment status (`PAID` / `UNPAID`)

---

## 🚀 How to Run the Web Application

### Method 1: One-Click Startup (Easiest)
Simply double-click the file:
```
start-cafeease.bat
```
This automatically starts the backend server on `http://localhost:5000` and opens it in your default web browser!

### Method 2: Via Terminal
```bash
cd C:\Users\chimm\.gemini\antigravity\scratch\cafeease
npm start
```
Then open `http://localhost:5000` in your browser.

---

## 📷 Admin Food Item Image Upload

When an Admin adds a new food item in the Admin Dashboard:
1. Click **"Choose File"** under **"Upload dish image"**.
2. Pick any image (JPG, PNG, WEBP) from your laptop.
3. The image thumbnail is immediately previewed in real-time.
4. Fill in the food name, category, price, and description.
5. Click **"+ Add Item to Cafeteria Menu"**.
6. The dish and its uploaded photo are saved directly into MongoDB and immediately displayed on the student menu cards!
7. *(Optional)* If you don't have an image, you can select one from the preset photo dropdown.

---

## 📂 Project Structure

```
cafeease/
├── start-cafeease.bat   <-- Double-click to start server & open browser
├── server.js            <-- Node.js + Express backend with MongoDB (Mongoose)
├── seed.js              <-- Database seeder script
├── package.json         <-- Dependencies: express, mongoose, cors, dotenv
├── .env                 <-- MONGO_URI=mongodb://127.0.0.1:27017/cafeease
├── auth/
│   └── signup.html      <-- Student & Admin Sign Up & Login portal
├── html/
│   ├── index.html       <-- Protected Cafeteria Table Ordering landing page
│   ├── app.js           <-- Frontend logic (Image upload + MongoDB sync)
│   └── images/          <-- Default cafeteria food photos
└── css/
    └── style.css        <-- Classic cafeteria design
```

---

## 📊 MongoDB Collections & Schemas

### 1. `users` Collection
* `name`: Student or Admin full name
* `email`: Campus email
* `password`: User password
* `role`: `'student'` or `'admin'`
* `studentId`: Roll / ID number
* `table`: Assigned table number

### 2. `menuitems` Collection
* `name`: Dish name
* `category`: Fast Food, Meals, Beverages
* `price`: Price in ₹
* `description`: Dish description
* `image`: Uploaded image (Base64) or preset path

### 3. `orders` Collection
* `id`: Unique order code (e.g. `ORD-101`)
* `table`: Table # (e.g. `Table 4`)
* `student`: Customer name
* `items`: Selected dishes
* `total`: Total bill (₹)
* `paymentMode`: `'UPI / Online'` or `'Cash at Counter'`
* `paymentStatus`: `'PAID'` or `'UNPAID'`
* `kitchenStatus`: `'Received'`, `'Preparing'`, `'Served'`

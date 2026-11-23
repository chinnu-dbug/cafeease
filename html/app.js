/* ============================================================
   CafeEase - Simple & Beginner-Friendly JavaScript Code
   CONNECTED TO MONGODB BACKEND
   Contains:
   1. Auth Gate (Ensures user is signed up before viewing page)
   2. MongoDB API Synchronizer (Menu, Orders, Payment Status)
   3. View Navigation (Tabs)
   4. Menu & Category Filter
   5. Cart & Table Ordering (Saves to MongoDB)
   6. Payment Option (UPI = Paid, Cash = Unpaid)
   7. Admin Functions (Add Item to MongoDB, Mark as Paid in MongoDB)
   8. Logout Function (Returns to auth/signup.html)
   ============================================================ */

// API Base URL (connects to Node/Express server on port 5000)
// Works whether opened from http://localhost:5000, VS Code Live Server (port 5500), or file://
const API_URL = (window.location.port === '5000') ? '' : 'http://localhost:5000';

// ------------------------------------------------------------
// 1. AUTH GATE CHECK (Must be signed up / logged in)
// ------------------------------------------------------------

function checkUserLoggedIn() {
  const savedUser = localStorage.getItem("cafeease_current_user");
  if (!savedUser) {
    // Not signed up or logged in -> Redirect to signup page in the auth folder
    window.location.href = "../auth/signup.html";
    return null;
  }
  try {
    return JSON.parse(savedUser);
  } catch (e) {
    window.location.href = "../auth/signup.html";
    return null;
  }
}

// Check on load
const currentUser = checkUserLoggedIn();

// ------------------------------------------------------------
// 2. DEFAULT FALLBACK DATA
// ------------------------------------------------------------

const DEFAULT_MENU = [
  { id: "item-1", name: "Burger", category: "Fast Food", price: 120, description: "Juicy grilled patty with fresh veggies and melted cheese.", image: "images/burger.jpg" },
  { id: "item-2", name: "Pizza", category: "Fast Food", price: 240, description: "Cheesy pizza loaded with fresh toppings and herbs.", image: "images/pizza.jpg" },
  { id: "item-3", name: "Biryani", category: "Meals", price: 180, description: "Aromatic basmati rice served with curry and egg.", image: "images/biryani.jpg" },
  { id: "item-4", name: "Sandwich", category: "Fast Food", price: 80, description: "Crispy toasted bread packed with fresh vegetables.", image: "images/sandwich.jpg" },
  { id: "item-5", name: "Noodles", category: "Fast Food", price: 130, description: "Wok-tossed noodles with bell peppers and spices.", image: "images/noodles.jpg" },
  { id: "item-6", name: "Coffee", category: "Beverages", price: 50, description: "Hot freshly brewed artisanal cappuccino coffee.", image: "images/coffee.jpg" }
];

const DEFAULT_ORDERS = [
  { id: "ORD-101", table: "Table 4", student: "Rahul Sharma", items: "1x Biryani, 1x Coffee", total: 230, paymentMode: "UPI / Online", paymentStatus: "PAID", kitchenStatus: "Preparing", time: "12:15 PM" },
  { id: "ORD-102", table: "Table 8", student: "Priya Patel", items: "2x Burger", total: 240, paymentMode: "Cash at Counter", paymentStatus: "UNPAID", kitchenStatus: "Received", time: "12:30 PM" }
];

// Current App State
let menu = DEFAULT_MENU;
let orders = DEFAULT_ORDERS;
let cart = []; // items currently in the cart
let isMongoOnline = false;
let syncInterval = null;

// ------------------------------------------------------------
// 3. MONGODB DATA SYNC (Fetches Menu & Orders from Database)
// ------------------------------------------------------------

async function syncWithMongoDB() {
  try {
    // 1. Check Server & MongoDB Status
    const statusRes = await fetch(`${API_URL}/api/status`);
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      isMongoOnline = Boolean(statusData.mongoConnected);
      updateMongoIndicator(isMongoOnline);
    } else {
      updateMongoIndicator(false);
    }

    // 2. Fetch Food Menu from MongoDB
    const menuRes = await fetch(`${API_URL}/api/menu`);
    if (menuRes.ok) {
      const menuData = await menuRes.json();
      if (menuData.items && menuData.items.length > 0) {
        menu = menuData.items.map(i => ({
          id: i._id || i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          description: i.description,
          image: i.image
        }));
        renderMenu("All");
      }
    }

    // 3. Fetch Orders from MongoDB
    const ordersRes = await fetch(`${API_URL}/api/orders`);
    if (ordersRes.ok) {
      const ordersData = await ordersRes.json();
      if (ordersData.orders) {
        orders = ordersData.orders.map(o => ({
          id: o.id || o._id,
          table: o.table,
          student: o.student,
          items: o.items,
          total: o.total,
          paymentMode: o.paymentMode,
          paymentStatus: o.paymentStatus,
          kitchenStatus: o.kitchenStatus,
          time: o.time
        }));
        renderAdminDashboard();
        renderMyOrders();
      }
    }
  } catch (err) {
    // Backend or Mongo offline -> Use local cache gracefully
    console.log("MongoDB server notice: using local mode.", err.message);
    updateMongoIndicator(false);
  }
}

// Indicator to show MongoDB connection in navbar
function updateMongoIndicator(connected) {
  let indicator = document.getElementById("mongo-badge");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.id = "mongo-badge";
    indicator.className = "mongo-badge";
    indicator.style.cursor = "pointer";
    indicator.title = "Click to refresh connection status";
    indicator.onclick = () => {
      indicator.innerHTML = `<span class="status-dot"></span> Checking...`;
      syncWithMongoDB();
    };
    const navRight = document.querySelector(".nav-right");
    if (navRight) navRight.insertBefore(indicator, navRight.firstChild);
  }

  if (connected) {
    indicator.innerHTML = `<span class="status-dot"></span> Database Online`;
    indicator.style.color = "#10b981";
    indicator.style.borderColor = "rgba(16, 185, 129, 0.25)";
    indicator.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
  } else {
    indicator.innerHTML = `<span class="status-dot offline"></span> Offline Mode`;
    indicator.style.color = "#f59e0b";
    indicator.style.borderColor = "rgba(245, 158, 11, 0.25)";
    indicator.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
  }
}

// ------------------------------------------------------------
// 4. PAGE INITIALIZATION
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  if (!currentUser) return;

  displayUserInfo();
  renderMenu("All");
  renderAdminDashboard();
  renderMyOrders();

  // Connect to MongoDB and set up periodic status verification
  syncWithMongoDB();
  if (!syncInterval) {
    syncInterval = setInterval(() => {
      syncWithMongoDB();
    }, 6000);
  }

  // Role setup
  if (currentUser.role === "admin") {
    showView("admin");
  } else {
    showView("student");
    if (currentUser.table) {
      const tableSelect = document.getElementById("table-select");
      const cartTableSelect = document.getElementById("cart-table-select");
      if (tableSelect) tableSelect.value = currentUser.table;
      if (cartTableSelect) cartTableSelect.value = currentUser.table;
    }
  }
});

function displayUserInfo() {
  const badge = document.getElementById("user-badge");
  const adminTab = document.getElementById("tab-admin");
  const adminSection = document.getElementById("view-admin");

  if (!currentUser) return;

  if (currentUser.role === "admin") {
    // 1. ADMIN USER
    if (badge) {
      badge.innerHTML = `<strong>${currentUser.name}</strong> &bull; Administrator`;
      badge.className = "user-badge badge-admin";
    }
    // Show Admin Dashboard Tab for Admin only
    if (adminTab) adminTab.style.display = "inline-block";
  } else {
    // 2. STUDENT USER
    if (badge) {
      badge.innerHTML = `<strong>${currentUser.name}</strong> &bull; Table ${currentUser.table || '4'}`;
      badge.className = "user-badge badge-student";
    }
    // STRICT SECURITY: HIDE Admin Tab and Admin Dashboard completely from Students!
    if (adminTab) adminTab.style.display = "none";
    if (adminSection) adminSection.style.display = "none";
  }
}

function logoutUser() {
  if (confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem("cafeease_current_user");
    window.location.href = "../auth/signup.html";
  }
}

// ------------------------------------------------------------
// 5. VIEW SWITCHER (Role-Protected)
// ------------------------------------------------------------

function showView(viewName) {
  // STRICT SECURITY CHECK: Prevent Students from opening Admin Dashboard
  if (viewName === "admin") {
    if (!currentUser || currentUser.role !== "admin") {
      alert("Access Restricted: Only cafeteria administrators can access the admin dashboard.");
      showView("student");
      return;
    }
  }

  document.querySelectorAll(".page-view").forEach(view => view.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

  const targetView = document.getElementById("view-" + viewName);
  const targetTab = document.getElementById("tab-" + viewName);

  if (targetView) targetView.classList.add("active");
  if (targetTab) targetTab.classList.add("active");

  if (viewName === "admin") renderAdminDashboard();
  if (viewName === "my-orders") renderMyOrders();
}

// ------------------------------------------------------------
// 6. FOOD MENU DISPLAY & CATEGORY FILTER
// ------------------------------------------------------------

function renderMenu(selectedCategory) {
  const grid = document.getElementById("food-grid");
  if (!grid) return;

  const itemsToShow = selectedCategory === "All"
    ? menu
    : menu.filter(item => item.category === selectedCategory);

  grid.innerHTML = itemsToShow.map(item => `
    <div class="card">
      <img src="${item.image}" alt="${item.name}" class="food-img" onerror="this.src='images/burger.jpg'">
      <div class="card-body">
        <span class="badge-tag">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="card-footer">
          <span class="price">₹${item.price}</span>
          <button class="add-btn" onclick="addToCart('${item.id}')">+ Add to Order</button>
        </div>
      </div>
    </div>
  `).join("");
}

function filterCategory(category, buttonElement) {
  document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
  buttonElement.classList.add("active");
  renderMenu(category);
}

// ------------------------------------------------------------
// 7. CART & TABLE ORDERING FUNCTIONS
// ------------------------------------------------------------

function openCart() {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.add("active");
  renderCart();
}

function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.remove("active");
}

function addToCart(itemId) {
  const foundItem = menu.find(item => item.id === itemId);
  if (!foundItem) return;

  const existingCartItem = cart.find(c => c.id === itemId);
  if (existingCartItem) {
    existingCartItem.qty += 1;
  } else {
    cart.push({ ...foundItem, qty: 1 });
  }

  updateCartCount();
  showToast(`Added ${foundItem.name} to order!`);
  openCart();
}

function changeQty(itemId, amount) {
  const cartItem = cart.find(c => c.id === itemId);
  if (!cartItem) return;

  cartItem.qty += amount;
  if (cartItem.qty <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  }

  updateCartCount();
  renderCart();
}

function removeItem(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = totalItems;
}

function updateSelectedTable() {
  const tableVal = document.getElementById("table-select").value;
  const cartTableSelect = document.getElementById("cart-table-select");
  if (cartTableSelect) cartTableSelect.value = tableVal;
  showToast(`Selected Table ${tableVal}!`);
}

function renderCart() {
  const listContainer = document.getElementById("cart-items-list");
  const totalPriceElement = document.getElementById("cart-total-price");
  if (!listContainer || !totalPriceElement) return;

  const nameInput = document.getElementById("cart-student-name");
  if (nameInput && !nameInput.value && currentUser) {
    nameInput.value = currentUser.name;
  }

  if (cart.length === 0) {
    listContainer.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">Your order tray is empty.</p>`;
    totalPriceElement.textContent = "₹0";
    return;
  }

  let total = 0;
  listContainer.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    return `
      <div class="cart-row">
        <div>
          <strong>${item.name}</strong><br>
          <small>₹${item.price} each</small>
        </div>
        <div>
          <button class="cart-qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
          <span style="margin: 0 6px; font-weight:bold;">${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          <span style="margin-left: 10px; font-weight:bold; color:#ff6600;">₹${itemTotal}</span>
          <button class="cart-del-btn" onclick="removeItem('${item.id}')">&times;</button>
        </div>
      </div>
    `;
  }).join("");

  totalPriceElement.textContent = `₹${total}`;
}

function toggleUpiPreview() {
  const selectedMode = document.querySelector('input[name="payment_mode"]:checked').value;
  const upiBox = document.getElementById("upi-preview");
  if (upiBox) {
    upiBox.style.display = selectedMode.includes("UPI") ? "block" : "none";
  }
}

// ------------------------------------------------------------
// 8. PLACE TABLE ORDER (SAVES TO MONGODB)
// ------------------------------------------------------------

async function submitTableOrder() {
  if (cart.length === 0) {
    alert("Please add at least one food item to your order.");
    return;
  }

  const tableNum = document.getElementById("cart-table-select").value;
  const studentName = document.getElementById("cart-student-name").value.trim() || currentUser.name || "Student";
  const paymentMode = document.querySelector('input[name="payment_mode"]:checked').value;

  const totalBill = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemsText = cart.map(i => `${i.qty}x ${i.name}`).join(", ");
  const isPaid = paymentMode.includes("UPI");
  const paymentStatus = isPaid ? "PAID" : "UNPAID";

  const orderData = {
    table: `Table ${tableNum}`,
    student: studentName,
    items: itemsText,
    total: totalBill,
    paymentMode: paymentMode,
    paymentStatus: paymentStatus
  };

  try {
    // Save Order into MongoDB via REST API
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      const result = await response.json();
      const savedOrder = result.order;
      orders.unshift({
        id: savedOrder.id,
        table: savedOrder.table,
        student: savedOrder.student,
        items: savedOrder.items,
        total: savedOrder.total,
        paymentMode: savedOrder.paymentMode,
        paymentStatus: savedOrder.paymentStatus,
        kitchenStatus: savedOrder.kitchenStatus,
        time: savedOrder.time
      });
      showOrderSuccessPopup(savedOrder);
    } else {
      throw new Error("API responded with error");
    }
  } catch (err) {
    // Fallback if backend offline
    const localOrder = {
      id: "ORD-" + Math.floor(100 + Math.random() * 900),
      table: `Table ${tableNum}`,
      student: studentName,
      items: itemsText,
      total: totalBill,
      paymentMode: paymentMode,
      paymentStatus: paymentStatus,
      kitchenStatus: "Received",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    orders.unshift(localOrder);
    showOrderSuccessPopup(localOrder);
  }

  // Clear Cart
  cart = [];
  updateCartCount();
  closeCart();

  renderAdminDashboard();
  renderMyOrders();
}

function showOrderSuccessPopup(order) {
  const popup = document.getElementById("order-success-popup");
  const content = document.getElementById("order-success-content");
  if (!popup || !content) return;

  content.innerHTML = `
    <h3 style="color:#0f172a; margin-bottom:12px; font-size:18px; font-weight:700;">Order Confirmed: ${order.table}</h3>
    <div style="font-size:13px; color:#334155; line-height:1.7;">
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.student}</p>
      <p><strong>Items:</strong> ${order.items}</p>
      <p><strong>Total Bill:</strong> ₹${order.total}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMode}</p>
      <p style="margin-top:10px;">
        <strong>Payment Status:</strong> 
        <span class="badge ${order.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">
          ${order.paymentStatus === 'PAID' ? 'PAID (Verified)' : 'UNPAID (Pending Counter Payment)'}
        </span>
      </p>
      <p style="font-size:12px; color:#64748b; margin-top:12px; border-top:1px solid #e2e8f0; padding-top:8px;">
        ${order.paymentStatus === 'PAID' 
          ? 'Online payment has been registered. Your food is being prepared.'
          : 'Please pay cash at the cafeteria counter or to the server upon arrival.'}
      </p>
    </div>
  `;

  popup.classList.add("active");
}

function closeOrderSuccess() {
  const popup = document.getElementById("order-success-popup");
  if (popup) popup.classList.remove("active");
  showView("my-orders");
}

// ------------------------------------------------------------
// 9. STUDENT: MY ORDERS VIEW (STRICTLY FILTERED FOR STUDENTS)
// ------------------------------------------------------------

function renderMyOrders() {
  const container = document.getElementById("my-orders-list");
  if (!container) return;

  // Filter orders: Students ONLY see their OWN table orders!
  let studentOrders = orders;
  if (currentUser && currentUser.role === "student") {
    const studentName = (currentUser.name || "").trim().toLowerCase();
    const studentTable = currentUser.table ? `Table ${currentUser.table}` : "";

    studentOrders = orders.filter(order => {
      const orderStudent = (order.student || "").trim().toLowerCase();
      const matchName = orderStudent === studentName;
      const matchTable = studentTable && order.table === studentTable;
      return matchName || matchTable;
    });
  }

  if (studentOrders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:36px 20px; color:#64748b;">
        <p style="font-size:15px; font-weight:600; margin-bottom:6px; color:#334155;">No active table orders found</p>
        <p style="font-size:13px; color:#64748b;">Select dishes from the menu to place an order to your table.</p>
        <button class="btn-primary" onclick="showView('student')" style="margin-top:14px;">Browse Menu</button>
      </div>
    `;
    return;
  }

  container.innerHTML = studentOrders.map(order => `
    <div class="order-receipt-card">
      <div class="orc-header">
        <div><strong>${order.id}</strong> &bull; <span class="table-tag">${order.table}</span></div>
        <span class="badge ${order.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">
          ${order.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID'}
        </span>
      </div>
      <div class="orc-body">
        <p><strong>Items:</strong> ${order.items}</p>
        <p><small style="color:#64748b;">Time: ${order.time} | Payment: ${order.paymentMode}</small></p>
      </div>
      <div class="orc-footer">
        <span>Kitchen Status: <strong>${order.kitchenStatus}</strong></span>
        <span style="color:#0f172a; font-size:15px; font-weight:700;">₹${order.total}</span>
      </div>
    </div>
  `).join("");
}

// ------------------------------------------------------------
// 10. ADMIN DASHBOARD (ACCESSIBLE ONLY TO ADMINS)
// ------------------------------------------------------------

function renderAdminDashboard() {
  // STRICT SECURITY CHECK: Only render for verified Admins!
  if (!currentUser || currentUser.role !== "admin") {
    return;
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "PAID" ? o.total : 0), 0);
  const paidCount = orders.filter(o => o.paymentStatus === "PAID").length;
  const unpaidCount = orders.filter(o => o.paymentStatus === "UNPAID").length;

  const statTotal = document.getElementById("stat-total");
  const statRevenue = document.getElementById("stat-revenue");
  const statPaid = document.getElementById("stat-paid");
  const statUnpaid = document.getElementById("stat-unpaid");

  if (statTotal) statTotal.textContent = totalOrders;
  if (statRevenue) statRevenue.textContent = `₹${totalRevenue}`;
  if (statPaid) statPaid.textContent = paidCount;
  if (statUnpaid) statUnpaid.textContent = unpaidCount;

  const tbody = document.getElementById("admin-orders-table");
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;">No orders available.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><strong>${order.id}</strong><br><small>${order.time}</small></td>
      <td><span class="table-tag">${order.table}</span></td>
      <td>${order.student}</td>
      <td>${order.items}</td>
      <td><strong>₹${order.total}</strong><br><small>${order.paymentMode}</small></td>
      <td>
        <span class="badge ${order.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">
          ${order.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID'}
        </span>
      </td>
      <td>
        <button class="btn-toggle-paid" onclick="togglePayment('${order.id}')">
          ${order.paymentStatus === 'PAID' ? 'Mark Unpaid' : 'Mark as Paid'}
        </button>
      </td>
      <td>
        <select onchange="updateKitchenStatus('${order.id}', this.value)" style="padding:4px; font-size:12px;">
          <option value="Received" ${order.kitchenStatus === 'Received' ? 'selected' : ''}>Received</option>
          <option value="Preparing" ${order.kitchenStatus === 'Preparing' ? 'selected' : ''}>Preparing</option>
          <option value="Served" ${order.kitchenStatus === 'Served' ? 'selected' : ''}>Served to Table</option>
        </select>
      </td>
      <td>
        <button class="btn-delete" onclick="deleteOrder('${order.id}')" title="Delete Order">&times;</button>
      </td>
    </tr>
  `).join("");
}

// Admin Toggles Payment Status in MongoDB
async function togglePayment(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const newStatus = (order.paymentStatus === "PAID") ? "UNPAID" : "PAID";
  order.paymentStatus = newStatus;
  renderAdminDashboard();
  renderMyOrders();

  try {
    await fetch(`${API_URL}/api/orders/${orderId}/payment`, { method: "PATCH" });
    showToast(`Updated MongoDB: ${order.id} is now ${newStatus}!`);
  } catch (err) {
    showToast(`Updated local: ${order.id} is now ${newStatus}!`);
  }
}

// Admin Changes Kitchen Progress in MongoDB
async function updateKitchenStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.kitchenStatus = newStatus;
  renderMyOrders();

  try {
    await fetch(`${API_URL}/api/orders/${orderId}/kitchen`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kitchenStatus: newStatus })
    });
    showToast(`MongoDB updated: Order ${order.id} is now ${newStatus}`);
  } catch (err) {
    showToast(`Order ${order.id} is now ${newStatus}`);
  }
}

// Admin Deletes an Order from MongoDB
async function deleteOrder(orderId) {
  if (!confirm(`Delete order ${orderId}?`)) return;

  orders = orders.filter(o => o.id !== orderId);
  renderAdminDashboard();
  renderMyOrders();

  try {
    await fetch(`${API_URL}/api/orders/${orderId}`, { method: "DELETE" });
    showToast(`Deleted from MongoDB: order ${orderId}`);
  } catch (err) {
    showToast(`Deleted order ${orderId}`);
  }
}

// ------------------------------------------------------------
// 10B. IMAGE UPLOAD & PREVIEW FOR NEW FOOD ITEMS
// ------------------------------------------------------------
let uploadedImageDataUrl = "";

function previewUploadedImage(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  // Check file size (e.g. limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert("Image size is too large. Please select an image under 10MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImageDataUrl = e.target.result;
    const previewBox = document.getElementById("image-preview-box");
    const previewImg = document.getElementById("add-preview-img");
    const previewFilename = document.getElementById("preview-filename");

    if (previewImg) previewImg.src = uploadedImageDataUrl;
    if (previewFilename) previewFilename.textContent = `File: ${file.name} (${Math.round(file.size / 1024)} KB)`;
    if (previewBox) previewBox.style.display = "flex";
  };
  reader.readAsDataURL(file);
}

function clearUploadedImage() {
  uploadedImageDataUrl = "";
  const fileInput = document.getElementById("add-image-file");
  const previewBox = document.getElementById("image-preview-box");
  const previewImg = document.getElementById("add-preview-img");

  if (fileInput) fileInput.value = "";
  if (previewImg) previewImg.src = "";
  if (previewBox) previewBox.style.display = "none";
}

function handlePresetSelected() {
  // If user picks a preset from dropdown, clear uploaded custom image
  if (uploadedImageDataUrl) {
    if (confirm("Switch to preset image? This will clear your uploaded image.")) {
      clearUploadedImage();
    }
  }
}

// Admin Adds a New Food Item to MongoDB
async function handleAddNewItem(event) {
  event.preventDefault();

  const name = document.getElementById("add-name").value.trim();
  const category = document.getElementById("add-category").value;
  const price = parseFloat(document.getElementById("add-price").value);
  const description = document.getElementById("add-desc").value.trim();

  // If user uploaded a custom file, use that. Otherwise use the preset dropdown.
  let image = uploadedImageDataUrl;
  if (!image) {
    const presetSelect = document.getElementById("add-image");
    image = presetSelect ? presetSelect.value : "images/burger.jpg";
  }

  if (!name || isNaN(price) || !description) {
    alert("Please enter valid item name, price, and description.");
    return;
  }

  const newItem = {
    name: name,
    category: category,
    price: price,
    description: description,
    image: image
  };

  try {
    // Send to MongoDB REST API
    const response = await fetch(`${API_URL}/api/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    });

    if (response.ok) {
      const data = await response.json();
      menu.push({
        id: data.item._id || data.item.id,
        name: data.item.name,
        category: data.item.category,
        price: data.item.price,
        description: data.item.description,
        image: data.item.image
      });
      showToast(`Added to MongoDB: "${name}"!`);
    } else {
      throw new Error();
    }
  } catch (err) {
    // Fallback locally
    menu.push({ ...newItem, id: "item-" + Date.now() });
    showToast(`Added locally: "${name}"!`);
  }

  // Clear form and image preview
  document.getElementById("add-item-form").reset();
  clearUploadedImage();

  renderMenu("All");
  alert(`"${name}" (₹${price}) has been added to the cafeteria menu!`);
}

// Reset Demo Data in MongoDB
async function resetDemoData() {
  if (!confirm("Reset all menu items and orders in MongoDB back to default?")) return;

  try {
    await fetch(`${API_URL}/api/reset`, { method: "POST" });
  } catch (err) {
    // fallback
  }

  menu = DEFAULT_MENU;
  orders = DEFAULT_ORDERS;
  renderMenu("All");
  renderAdminDashboard();
  renderMyOrders();
  showToast("MongoDB data reset to defaults!");
}

// ------------------------------------------------------------
// 11. TOAST NOTIFICATION HELPER
// ------------------------------------------------------------

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

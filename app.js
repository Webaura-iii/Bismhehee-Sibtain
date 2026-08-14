/**
 * Bismehee Sibtain - Store Front & Integrated Admin Engine
 * Structure prepared for Firebase & Firestore Database
 */

// --- INITIAL MOCK STATE DATA ---
let products = [
  {
    id: "prod-1",
    title: "Saudi Style Sword Embroidered Niqab",
    category: "Saudi Style",
    price: 1499,
    originalPrice: 1999,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    description: "Signature Saudi-imported luxury fabric with fine gold thread sword embroidery. Lightweight and breathable."
  },
  {
    id: "prod-2",
    title: "Royal Gold Velvet Hijab Set",
    category: "Exclusive Sets",
    price: 3299,
    originalPrice: 3999,
    badge: "NO COD",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80",
    description: "Complete royal matching set including luxury velvet veil and embellished inner cap."
  },
  {
    id: "prod-3",
    title: "Ultra-Soft Layered Butterfly Niqab",
    category: "Luxury Niqabs",
    price: 1199,
    originalPrice: 1499,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    description: "Tiered butterfly design providing absolute coverage with supreme elegance and air permeability."
  },
  {
    id: "prod-4",
    title: "Handcrafted Pearl Magnet Pins (Set of 4)",
    category: "Hijab Accessories",
    price: 499,
    originalPrice: 799,
    badge: "",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    description: "Ultra-strong magnetic hijab pins finished with genuine mother-of-pearl accents."
  }
];

let cart = [];
let isAdminLoggedIn = false;
let activeCategory = "All";
let searchQuery = "";
let currentSort = "featured";

// --- DOM ELEMENTS ---
const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartToggleBtn = document.getElementById("cartToggleBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartBadge = document.getElementById("cartBadge");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartSubtotal = document.getElementById("cartSubtotal");
const whatsappOrderBtn = document.getElementById("whatsappOrderBtn");

const quickViewModal = document.getElementById("quickViewModal");
const quickViewContent = document.getElementById("quickViewContent");
const closeModalBtn = document.getElementById("closeModalBtn");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryFilters = document.getElementById("categoryFilters");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

// Admin DOM
const adminNavLink = document.getElementById("adminNavLink");
const adminSection = document.getElementById("adminSection");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginCard = document.getElementById("adminLoginCard");
const adminDashboard = document.getElementById("adminDashboard");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const productForm = document.getElementById("productForm");
const adminProductTableBody = document.getElementById("adminProductTableBody");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  setupEventListeners();
});

// --- CORE RENDER FUNCTIONS ---
function renderCatalog() {
  let filtered = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (currentSort === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  }

  productGrid.innerHTML = "";

  if (filtered.length === 0) {
    productGrid.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 40px 0;">No luxury items found matching your selection.</p>`;
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="card-image-wrap">
        ${product.badge ? `<span class="badge-tag">${product.badge}</span>` : ''}
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        <div class="card-actions-overlay">
          <button class="btn btn-primary btn-sm btn-full" onclick="addToCart('${product.id}')">Add to Bag</button>
          <button class="btn btn-secondary btn-sm" onclick="openQuickView('${product.id}')">Quick View</button>
        </div>
      </div>
      <div class="card-info">
        <span class="card-category">${product.category}</span>
        <h3 class="card-title">${product.title}</h3>
        <div class="card-price">
          <span class="price-sale">₹${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="price-original">₹${product.originalPrice.toLocaleString()}</span>` : ''}
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function renderCart() {
  cartItemsContainer.innerHTML = "";
  let subtotal = 0;
  let totalItemsCount = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    totalItemsCount += item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <img src="${item.image}" class="cart-item-img" alt="${item.title}">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          <button style="margin-left:auto; background:none; border:none; color:red; cursor:pointer; font-size:11px;" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  cartBadge.innerText = totalItemsCount;
  cartSubtotal.innerText = `₹${subtotal.toLocaleString()}`;
}

// --- CART & MODAL ACTIONS ---
function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    const prod = products.find(p => p.id === productId);
    cart.push({ ...prod, quantity: 1 });
  }
  renderCart();
  toggleCart(true);
}

function updateQty(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
  }
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  renderCart();
}

function toggleCart(open) {
  if (open) {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  } else {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  }
}

function openQuickView(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  quickViewContent.innerHTML = `
    <div class="quickview-grid">
      <img src="${prod.image}" class="quickview-img" alt="${prod.title}">
      <div>
        <span class="card-category">${prod.category}</span>
        <h2 style="font-size:28px; margin: 10px 0;">${prod.title}</h2>
        <div class="card-price" style="font-size: 20px; margin-bottom: 15px;">
          <span class="price-sale">₹${prod.price.toLocaleString()}</span>
          ${prod.originalPrice ? `<span class="price-original">₹${prod.originalPrice.toLocaleString()}</span>` : ''}
        </div>
        <p style="color:var(--text-muted); margin-bottom:20px;">${prod.description}</p>
        <button class="btn btn-primary btn-full" onclick="addToCart('${prod.id}'); closeQuickView();">Add To Shopping Bag</button>
      </div>
    </div>
  `;
  quickViewModal.classList.add("active");
}

function closeQuickView() {
  quickViewModal.classList.remove("active");
}

// --- EVENT LISTENERS & HANDLERS ---
function setupEventListeners() {
  cartToggleBtn.addEventListener("click", () => toggleCart(true));
  closeCartBtn.addEventListener("click", () => toggleCart(false));
  cartOverlay.addEventListener("click", () => toggleCart(false));

  closeModalBtn.addEventListener("click", closeQuickView);

  // Search & Filter Listeners
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderCatalog();
  });

  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderCatalog();
  });

  categoryFilters.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      activeCategory = e.target.dataset.category;
      renderCatalog();
    }
  });

  // Mobile Menu Toggle
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // WhatsApp Order Integration
  whatsappOrderBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your shopping bag is empty.");
      return;
    }
    let message = "Hello Bismehee Sibtain, I would like to place an order:\n\n";
    let total = 0;
    cart.forEach(item => {
      message += `• ${item.title} (x${item.quantity}) - ₹${item.price * item.quantity}\n`;
      total += item.price * item.quantity;
    });
    message += `\n*Total Amount*: ₹${total.toLocaleString()}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919876543210?text=${encoded}`, '_blank');
  });

  // Navigation To Admin Toggle
  adminNavLink.addEventListener("click", (e) => {
    e.preventDefault();
    adminSection.classList.toggle("hidden");
    window.scrollTo({ top: adminSection.offsetTop, behavior: 'smooth' });
  });

  // Admin Login Handler
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const pass = document.getElementById("adminPassword").value;

    if (email === "admin@bismeheesibtain.com" && pass === "BismeheeAdmin2026!") {
      isAdminLoggedIn = true;
      adminLoginCard.classList.add("hidden");
      adminDashboard.classList.remove("hidden");
      renderAdminInventory();
    } else {
      alert("Invalid Admin Credentials.");
    }
  });

  logoutAdminBtn.addEventListener("click", () => {
    isAdminLoggedIn = false;
    adminLoginCard.classList.remove("hidden");
    adminDashboard.classList.add("hidden");
    adminSection.classList.add("hidden");
  });

  // Admin Add / Edit Product Form
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("prodId").value;
    const title = document.getElementById("prodTitle").value;
    const category = document.getElementById("prodCategory").value;
    const badge = document.getElementById("prodBadge").value;
    const price = parseFloat(document.getElementById("prodPrice").value);
    const originalPrice = parseFloat(document.getElementById("prodOriginalPrice").value) || null;
    const image = document.getElementById("prodImage").value;
    const description = document.getElementById("prodDesc").value;

    if (id) {
      // Edit existing
      const index = products.findIndex(p => p.id === id);
      products[index] = { id, title, category, badge, price, originalPrice, image, description };
    } else {
      // Add new
      const newProd = {
        id: 'prod-' + Date.now(),
        title, category, badge, price, originalPrice, image, description
      };
      products.push(newProd);
    }

    productForm.reset();
    document.getElementById("prodId").value = "";
    document.getElementById("formTitle").innerText = "Add New Product";
    document.getElementById("cancelEditBtn").classList.add("hidden");

    renderCatalog();
    renderAdminInventory();
  });

  // Admin Tabs Toggle
  document.querySelectorAll(".admin-tabs .tab-btn").forEach(tab => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".admin-tabs .tab-btn").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      
      e.target.classList.add("active");
      document.getElementById(e.target.dataset.tab).classList.add("active");
    });
  });
}

// --- ADMIN INVENTORY CRUD SIMULATION ---
function renderAdminInventory() {
  adminProductTableBody.innerHTML = "";
  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${p.image}" alt=""></td>
      <td><strong>${p.title}</strong></td>
      <td>₹${p.price.toLocaleString()}</td>
      <td>${p.category}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">Edit</button>
        <button class="btn btn-primary btn-sm" style="background:#dc3545;" onclick="deleteProduct('${p.id}')">Delete</button>
      </td>
    `;
    adminProductTableBody.appendChild(tr);
  });
}

function editProduct(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById("prodId").value = p.id;
  document.getElementById("prodTitle").value = p.title;
  document.getElementById("prodCategory").value = p.category;
  document.getElementById("prodBadge").value = p.badge || "";
  document.getElementById("prodPrice").value = p.price;
  document.getElementById("prodOriginalPrice").value = p.originalPrice || "";
  document.getElementById("prodImage").value = p.image;
  document.getElementById("prodDesc").value = p.description || "";

  document.getElementById("formTitle").innerText = "Edit Product";
  document.getElementById("cancelEditBtn").classList.remove("hidden");
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to remove this luxury item from the store?")) {
    products = products.filter(p => p.id !== id);
    renderCatalog();
    renderAdminInventory();
  }
}

/* 
===================================================================
🔥 FIREBASE & FIRESTORE INTEGRATION HOOKS (Ready for production)
===================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "bismehee-sibtain.firebaseapp.com",
  projectId: "bismehee-sibtain",
  storageBucket: "bismehee-sibtain.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Firestore CRUD Helpers
async function fetchProductsFromFirestore() {
  const querySnapshot = await getDocs(collection(db, "products"));
  products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderCatalog();
}

async function addProductToFirestore(productData) {
  await addDoc(collection(db, "products"), productData);
  fetchProductsFromFirestore();
}

async function deleteProductFromFirestore(id) {
  await deleteDoc(doc(db, "products", id));
  fetchProductsFromFirestore();
}
*/
let products = JSON.parse(localStorage.getItem("store_products")) || [
  {
    id: "prod-1",
    title: "Saudi Style Sword Embroidered Niqab",
    category: "Saudi Style",
    price: 1499,
    originalPrice: 1999,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    description: "Signature Saudi-imported luxury fabric with fine gold thread sword embroidery."
  },
  {
    id: "prod-2",
    title: "Royal Gold Velvet Hijab Set",
    category: "Exclusive Sets",
    price: 3299,
    originalPrice: 3999,
    badge: "NO COD",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80",
    description: "Complete royal matching set including luxury velvet veil and inner cap."
  }
];

// DOM References
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginCard = document.getElementById("adminLoginCard");
const adminDashboard = document.getElementById("adminDashboard");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const productForm = document.getElementById("productForm");
const adminProductTableBody = document.getElementById("adminProductTableBody");
const cancelEditBtn = document.getElementById("cancelEditBtn");

document.addEventListener("DOMContentLoaded", () => {
  setupAdminListeners();
});

function syncStorage() {
  localStorage.setItem("store_products", JSON.stringify(products));
}

function setupAdminListeners() {
  // Login Handler
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value;
    const pass = document.getElementById("adminPassword").value;

    if (email === "admin@bismeheesibtain.com" && pass === "BismeheeAdmin2026!") {
      adminLoginCard.classList.add("hidden");
      adminDashboard.classList.remove("hidden");
      logoutAdminBtn.classList.remove("hidden");
      renderAdminInventory();
    } else {
      alert("Invalid Admin Credentials.");
    }
  });

  // Logout Handler
  logoutAdminBtn.addEventListener("click", () => {
    adminLoginCard.classList.remove("hidden");
    adminDashboard.classList.add("hidden");
    logoutAdminBtn.classList.add("hidden");
  });

  // Tabs Handler
  document.querySelectorAll(".admin-tabs .tab-btn").forEach(tab => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".admin-tabs .tab-btn").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      
      e.target.classList.add("active");
      document.getElementById(e.target.dataset.tab).classList.add("active");
    });
  });

  // Save / Update Product
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
      const index = products.findIndex(p => p.id === id);
      products[index] = { id, title, category, badge, price, originalPrice, image, description };
    } else {
      const newProd = {
        id: 'prod-' + Date.now(),
        title, category, badge, price, originalPrice, image, description
      };
      products.push(newProd);
    }

    syncStorage();
    resetForm();
    renderAdminInventory();
  });

  cancelEditBtn.addEventListener("click", resetForm);
}

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
  cancelEditBtn.classList.remove("hidden");
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to remove this item?")) {
    products = products.filter(p => p.id !== id);
    syncStorage();
    renderAdminInventory();
  }
}

function resetForm() {
  productForm.reset();
  document.getElementById("prodId").value = "";
  document.getElementById("formTitle").innerText = "Add New Product";
  cancelEditBtn.classList.add("hidden");
}
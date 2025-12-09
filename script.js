const products = [
  { id: 1, name: "iPhone 14", category: "electronics", price: 999 },
  { id: 2, name: "Samsung TV", category: "electronics", price: 799 },
  { id: 3, name: "T-Shirt", category: "clothes", price: 20 },
  { id: 4, name: "Jeans", category: "clothes", price: 40 },
  { id: 5, name: "Harry Potter Book", category: "books", price: 15 },
  { id: 6, name: "Cooking Book", category: "books", price: 25 },
];

let cart = [];

const productListEl = document.getElementById("product-list");
const cartBtn = document.getElementById("cart-btn");
const cartCountEl = document.getElementById("cart-count");
const cartSection = document.getElementById("cart-section");
const cartItemsEl = document.getElementById("cart-items");
const checkoutBtn = document.getElementById("checkout-btn");
const orderSection = document.getElementById("order-section");
const orderForm = document.getElementById("order-form");
const orderSummaryEl = document.getElementById("order-summary");
const thankYouSection = document.getElementById("thankyou-section");
const categoryButtons = document.querySelectorAll(".category-btn");

let currentCategory = "all";

function getIconClass(category) {
  switch(category) {
    case "electronics":
      return "fa-solid fa-mobile-screen-button";
    case "clothes":
      return "fa-solid fa-shirt";
    case "books":
      return "fa-solid fa-book";
    default:
      return "fa-solid fa-box-open";
  }
}

function renderProducts(category = "all") {
  productListEl.innerHTML = "";
  const filtered = category === "all" ? products : products.filter(p => p.category === category);

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div style="font-size: 3rem; text-align:center; margin-bottom: 10px;">
        <i class="${getIconClass(product.category)}"></i>
      </div>
      <h4>${product.name}</h4>
      <p>Price: $${product.price}</p>
      <button data-id="${product.id}"><i class="fa-solid fa-cart-plus"></i> Order</button>
    `;
    productListEl.appendChild(card);
  });
}

function updateCartCount() {
  cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  if (cart.length === 0) {
    cartItemsEl.textContent = "Your cart is empty.";
    checkoutBtn.disabled = true;
    return;
  }
  checkoutBtn.disabled = false;

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} (x${item.quantity})</span>
      <span>$${item.price * item.quantity}</span>
      <button data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
    `;
    cartItemsEl.appendChild(div);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id == productId);
  if (!product) return;

  const exist = cart.find(item => item.id == productId);
  if (exist) {
    exist.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartCount();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id != productId);
  updateCartCount();
  renderCart();
}

cartBtn.addEventListener("click", () => {
  cartSection.classList.toggle("hidden");
  orderSection.classList.add("hidden");
  thankYouSection.classList.add("hidden");
});

productListEl.addEventListener("click", e => {
  if (e.target.closest("button")) {
    const id = e.target.closest("button").getAttribute("data-id");
    if (id) addToCart(id);
  }
});

cartItemsEl.addEventListener("click", e => {
  if (e.target.closest("button")) {
    const id = e.target.closest("button").getAttribute("data-id");
    if (id) removeFromCart(id);
  }
});

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  cartSection.classList.add("hidden");
  orderSection.classList.remove("hidden");
  thankYouSection.classList.add("hidden");

  orderSummaryEl.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} (x${item.quantity}) - $${item.price * item.quantity}`;
    orderSummaryEl.appendChild(li);
  });
});

categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category");
    renderProducts(currentCategory);
  });
});

// Backend API endpoint - update this before running!
const BACKEND_API_URL = "http://localhost:5000/api/orders";

orderForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const discord = document.getElementById("discord").value.trim();

  if (!name || !whatsapp || !discord) {
    alert("Please fill all the fields");
    return;
  }

  const orderDetails = {
    name,
    whatsapp,
    discord,
    products: cart.map(item => ({
      productName: item.name,
      quantity: item.quantity,
    })),
  };

  try {
    const res = await fetch(BACKEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    if (!res.ok) {
      throw new Error("Failed to create order.");
    }

    const data = await res.json();
    console.log("Order created:", data);

    cart = [];
    updateCartCount();
    renderCart();
    orderForm.reset();
    orderSection.classList.add("hidden");
    thankYouSection.classList.remove("hidden");
  } catch (error) {
    alert("Error submitting order: " + error.message);
  }
});

renderProducts();
renderCart();

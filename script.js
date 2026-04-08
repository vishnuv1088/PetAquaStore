const products = [
    { id: 1, name: "Goldfish", price: 200, img: "images/fish1.jpg", desc: "Beautiful goldfish" },
    { id: 2, name: "Betta Fish", price: 350, img: "images/fish2.jpg", desc: "Colorful betta fish" },
    { id: 3, name: "Fish Tank", price: 1500, img: "images/tank.jpg", desc: "Glass aquarium tank" },
    { id: 4, name: "Water Filter", price: 800, img: "images/filter.jpg", desc: "Keeps water clean" },
    { id: 5, name: "Fish Food", price: 250, img: "images/food.jpg", desc: "Healthy fish food" },
    { id: 6, name: "Aquarium Light", price: 600, img: "images/light.jpg", desc: "LED aquarium light" },
    { id: 7, name: "Water Heater", price: 1200, img: "images/heater.jpg", desc: "Stable aquarium temperature" },
    { id: 8, name: "Gravel", price: 350, img: "images/gravel.jpg", desc: "Natural tank substrate" },
    { id: 9, name: "Air Pump", price: 550, img: "images/airpump.jpg", desc: "Oxygenates your water" },
    { id: 10, name: "Plant Kit", price: 700, img: "images/plantkit.jpg", desc: "Live plant starter set" }
];

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function clearCartStorage() {
    localStorage.removeItem("cart");
}

function getProductId() {
    const id = localStorage.getItem("productId");
    return id ? Number(id) : null;
}

function setProductId(id) {
    localStorage.setItem("productId", id);
}

function removeProductId() {
    localStorage.removeItem("productId");
}

function findProductById(id) {
    return products.find(product => product.id === Number(id));
}

function renderProductCard(product) {
    return `
        <div class="card">
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
            <button onclick="viewProduct(${product.id})">View Product</button>
        </div>`;
}

function renderProductsList(productList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = productList.map(renderProductCard).join("");
    container.innerHTML = html;
}

function renderProductDetails(product) {
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.img}" alt="${product.name}" 
                     onerror="this.onerror=null;this.src='images/${product.name.toLowerCase().replace(/\s+/g, '')}.svg'">
            </div>
            <div class="product-info">
                <h2>${product.name}</h2>
                <p class="product-desc">${product.desc}</p>
                <p class="product-price">₹${product.price.toLocaleString()}</p>
                <div class="product-actions">
                    <label for="qty">Quantity</label>
                    <input type="number" id="qty" min="1" value="1">
                    <button onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
                <a href="products.html" class="button secondary">Back to Products</a>
            </div>
        </div>`;
}

function renderCartItem(item, index) {
    const total = item.price * item.qty;
    return `
        <div class="cart-item">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">₹${item.price} x ${item.qty}</div>
            <div class="cart-item-total">₹${total}</div>
            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        </div>`;
}

function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    if (totalQty > 0) {
        badge.innerText = totalQty > 99 ? "99+" : totalQty;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

function loadHomeProducts() {
    renderProductsList(products.slice(0, 6), "productList");
}

function loadAllProducts() {
    renderProductsList(products, "productList");
}

function viewProduct(id) {
    setProductId(id);
    window.location.href = "product.html";
}

function loadProductDetails() {
    const productDetails = document.getElementById("productDetails");
    if (!productDetails) return;

    const id = getProductId();
    if (!id) {
        productDetails.innerHTML = `<p>No product selected.</p>`;
        return;
    }

    const product = findProductById(id);
    if (!product) {
        productDetails.innerHTML = `<p>Product not found.</p>`;
        return;
    }

    productDetails.innerHTML = renderProductDetails(product);
    removeProductId();
}

function searchProducts() {
    const query = document.getElementById("search")?.value || "";
    const results = query.trim() ? products.filter(product => product.name.toLowerCase().includes(query.toLowerCase())) : products;
    renderProductsList(results, "productList");
}

function addToCart(productId) {
    const qty = Number(document.getElementById("qty")?.value) || 1;
    const product = findProductById(productId);
    if (!product) return;

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            desc: product.desc,
            qty: qty
        });
    }

    setCart(cart);
    updateCartBadge();
    alert("Added to cart!");
}

function loadCart() {
    const cart = getCart();
    const container = document.getElementById("cart");
    const totalContainer = document.getElementById("total");
    const clearBtn = document.getElementById("clearCartBtn");

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="cart-empty"><p>Your cart is empty. Go to <a href="products.html">Products</a> to add items.</p></div>`;
        if (totalContainer) totalContainer.innerText = "Grand Total: ₹0";
        if (clearBtn) clearBtn.style.display = "none";
    } else {
        container.innerHTML = cart.map(renderCartItem).join("");
        const grandTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        if (totalContainer) totalContainer.innerText = `Grand Total: ₹${grandTotal}`;
        if (clearBtn) clearBtn.style.display = "inline-block";
    }

    updateCartBadge();
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
    loadCart();
}

function clearCart() {
    clearCartStorage();
    loadCart();
}

window.addEventListener("DOMContentLoaded", function () {
    updateCartBadge();
    if (document.getElementById("cart")) {
        loadCart();
    }
});

# Before & After: OOP Refactoring Comparison

## 1. Product Management

### ❌ BEFORE (Procedural)
```javascript
const products = [
    {id:1, name:"Goldfish", price:200, img:"images/fish1.jpg", desc:"Beautiful goldfish"},
    {id:2, name:"Betta Fish", price:350, img:"images/fish2.jpg", desc:"Colorful betta fish"},
    // ... more products
];

function viewProduct(id) {
    localStorage.setItem("productId", id);
    window.location.href = "product.html";
}

function loadProductDetails() {
    const id = Number(localStorage.getItem("productId"));
    if (!id) {
        document.getElementById("productDetails").innerHTML = `<p>No product selected.</p>`;
        return;
    }
    const product = products.find(p => p.id === id);
    // ... more code to render
}
```

**Problems:**
- Global products array is mutable
- Logic scattered across multiple functions
- Hard to find where product is used
- Difficult to extend or add features
- UI and logic mixed together

### ✅ AFTER (OOP)
```javascript
class Product {
    constructor(id, name, price, img, desc) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.img = img;
        this.desc = desc;
    }
    
    getTotal(qty) {
        return this.price * qty;
    }
}

class Store {
    constructor() {
        this.products = [
            new Product(1, "Goldfish", 200, "images/fish1.jpg", "Beautiful goldfish"),
            new Product(2, "Betta Fish", 350, "images/fish2.jpg", "Colorful betta fish"),
            // ...
        ];
    }
    
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }
    
    getAllProducts() {
        return this.products;
    }
    
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }
}

class AppController {
    constructor() {
        this.store = new Store();
    }
    
    viewProduct(id) {
        StorageManager.setProductId(id);
        window.location.href = "product.html";
    }
    
    loadProductDetails() {
        const id = StorageManager.getProductId();
        const product = this.store.getProductById(id);
        UIRenderer.renderProductDetails(product);
    }
}
```

**Benefits:**
- ✅ Encapsulated data and behavior
- ✅ Easy to find related code
- ✅ Reusable across application
- ✅ Easy to add methods to Product
- ✅ Clear separation of concerns

---

## 2. Shopping Cart Management

### ❌ BEFORE (Procedural - Messy)
```javascript
function addToCart(id) {
    const qty = Number(document.getElementById("qty").value);
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const product = products.find(p => p.id == id);
    let existing = cart.find(item => item.id == id);

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({...product, qty});
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    alert("Added to cart!");
}

function updateQty(index, qty) {
    let cart = JSON.parse(localStorage.getItem("cart"));
    cart[index].qty = Number(qty);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart"));
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

function loadCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let html = "";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        let total = item.price * item.qty;
        grandTotal += total;

        html += `
        <div>
            <p>${item.name}</p>
            <p>₹${item.price}</p>
            <input type="number" value="${item.qty}" min="1" onchange="updateQty(${index}, this.value)">
            <p>Total: ₹${total}</p>
            <button onclick="removeItem(${index})">Remove</button>
        </div>
        `;
    });

    document.getElementById("cart").innerHTML = html;
    document.getElementById("total").innerText = "Grand Total: ₹" + grandTotal;
    updateCartBadge();
}
```

**Problems:**
- Code repetition (parsing cart multiple times)
- localStorage logic scattered everywhere
- Hard to maintain consistency
- No encapsulation of cart behavior
- Logic mixed with DOM manipulation
- Duplicate calculations

### ✅ AFTER (OOP - Clean)
```javascript
class CartItem {
    constructor(product, qty = 1) {
        this.id = product.id;
        this.name = product.name;
        this.price = product.price;
        this.qty = qty;
    }
    
    getTotal() {
        return this.price * this.qty;
    }
    
    updateQty(newQty) {
        this.qty = Math.max(1, Number(newQty));
    }
}

class Cart {
    constructor() {
        this.items = this.loadFromStorage();
    }
    
    addItem(product, qty = 1) {
        const existing = this.items.find(item => item.id === product.id);
        
        if (existing) {
            existing.qty += qty;
        } else {
            this.items.push(new CartItem(product, qty));
        }
        this.saveToStorage();
    }
    
    removeItemByIndex(index) {
        this.items.splice(index, 1);
        this.saveToStorage();
    }
    
    updateItemQty(index, newQty) {
        if (this.items[index]) {
            this.items[index].updateQty(newQty);
            this.saveToStorage();
        }
    }
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + item.getTotal(), 0);
    }
    
    getTotalQty() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    }
    
    getItems() {
        return this.items;
    }
    
    saveToStorage() {
        StorageManager.setCart(this.items);
    }
    
    loadFromStorage() {
        const savedCart = StorageManager.getCart();
        return savedCart.map(item => new CartItem({id: item.id, ...item}, item.qty));
    }
}

// In AppController
class AppController {
    constructor() {
        this.cart = new Cart();
        this.store = new Store();
    }
    
    addToCart(productId) {
        const qty = Number(document.getElementById("qty")?.value) || 1;
        const product = this.store.getProductById(productId);
        
        if (product) {
            this.cart.addItem(product, qty);
            UIRenderer.updateCartBadge(this.cart);
            alert("Added to cart!");
        }
    }
    
    removeFromCart(index) {
        this.cart.removeItemByIndex(index);
        this.loadCart();
    }
    
    updateCartItemQty(index, qty) {
        this.cart.updateItemQty(index, qty);
        this.loadCart();
    }
    
    loadCart() {
        UIRenderer.renderCart(this.cart);
        UIRenderer.updateCartBadge(this.cart);
    }
}

// UIRenderer handles presentation
class UIRenderer {
    static renderCart(cart) {
        const container = document.getElementById("cart");
        const totalContainer = document.getElementById("total");
        
        if (cart.isEmpty()) {
            container.innerHTML = `<div class="cart-empty">...</div>`;
            totalContainer.innerText = "Grand Total: ₹0";
        } else {
            let html = "";
            cart.getItems().forEach((item, index) => {
                html += UIRenderer.renderCartItem(item, index);
            });
            container.innerHTML = html;
            totalContainer.innerText = `Grand Total: ₹${cart.getTotal()}`;
        }
    }
    
    static renderCartItem(item, index) {
        return `
            <div class="cart-item">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-meta">₹${item.price} x ${item.qty}</div>
                <div class="cart-item-total">₹${item.getTotal()}</div>
                <button onclick="appController.removeFromCart(${index})">Remove</button>
            </div>
        `;
    }
}
```

**Benefits:**
- ✅ No code repetition
- ✅ Storage logic in one place
- ✅ Business logic separated from UI
- ✅ Each operation in one method
- ✅ Easy to test
- ✅ Easy to modify behavior
- ✅ Reusable CartItem class
- ✅ Clear responsibilities

---

## 3. Search Functionality

### ❌ BEFORE (Mixed concerns)
```javascript
function searchProducts() {
    let value = document.getElementById("search").value.toLowerCase();
    let filtered = products.filter(p => p.name.toLowerCase().includes(value));
    displayProducts(filtered);
}

function displayProducts(list) {
    let html = "";
    list.forEach(p => {
        html += `
        <div class="card">
            <img src="${p.img}">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button onclick="viewProduct(${p.id})">View Product</button>
        </div>`;
    });
    document.getElementById("productList").innerHTML = html;
}
```

**Problems:**
- Search logic and UI rendering mixed
- Can't reuse search without rerendering

### ✅ AFTER (Separated concerns)
```javascript
// Store handles search
class Store {
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }
}

// UIRenderer handles rendering
class UIRenderer {
    static renderProductsList(products, containerId) {
        let html = "";
        products.forEach(p => {
            html += UIRenderer.renderProductCard(p);
        });
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
        }
    }
}

// AppController coordinates
class AppController {
    searchProducts(query) {
        const results = this.store.searchProducts(query);  // Get results
        UIRenderer.renderProductsList(results, "productList");  // Render them
    }
}

// Global wrapper
function searchProducts() {
    const query = document.getElementById("search").value;
    appController.searchProducts(query);
}
```

**Benefits:**
- ✅ Search logic separate from rendering
- ✅ Can use search results elsewhere
- ✅ Easy to add filters/sorting
- ✅ Clean, readable flow

---

## 4. Cart Badge Update

### ❌ BEFORE (Inefficient)
```javascript
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const badge = document.getElementById("cartBadge");
    const totalQty = cart.reduce((sum, item) => sum + Number(item.qty), 0);

    if (badge) {
        if (totalQty > 0) {
            badge.innerText = totalQty > 99 ? "99+" : totalQty;
            badge.style.display = "flex";
        } else {
            badge.style.display = "none";
        }
    }
}
```

**Problems:**
- Parses localStorage every time
- Logic mixed with DOM manipulation
- Calculates total qty manually
- Can't reuse calculation

### ✅ AFTER (Efficient)
```javascript
class UIRenderer {
    static updateCartBadge(cart) {
        const badge = document.getElementById("cartBadge");
        const totalQty = cart.getTotalQty();  // Reuse cart method
        
        if (badge) {
            if (totalQty > 0) {
                badge.innerText = totalQty > 99 ? "99+" : totalQty;
                badge.style.display = "flex";
            } else {
                badge.style.display = "none";
            }
        }
    }
}

class Cart {
    getTotalQty() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    }
}

// In AppController
appController.updateCartBadge() {
    UIRenderer.updateCartBadge(this.cart);
}
```

**Benefits:**
- ✅ Reuses cart calculation
- ✅ Uses in-memory data, not localStorage
- ✅ Cleaner method chaining
- ✅ Easier to test

---

## Summary of Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Code Organization** | Functions scattered | Classes with clear purpose |
| **Reusability** | Low - tightly coupled | High - modular |
| **Testability** | Difficult - mixed concerns | Easy - single responsibility |
| **Maintainability** | Hard to modify | Easy to extend |
| **Performance** | Repeated parsing | In-memory caching |
| **Scalability** | Limited | Excellent |
| **Code Duplication** | High | Low |
| **Error Handling** | Minimal | Better encapsulation |
| **Documentation** | Implicit | Explicit via classes |
| **Team Collaboration** | Harder to navigate | Clearer structure |

---

## Migration Path

If you have older code using procedural approach:

```javascript
// Old way
const cart = JSON.parse(localStorage.getItem("cart")) || [];
cart.push({...product, qty});
localStorage.setItem("cart", JSON.stringify(cart));

// New way
appController.addToCart(productId);
```

The global wrapper functions maintain backward compatibility with HTML:
```html
<!-- Still works! -->
<button onclick="addToCart(1)">Add to Cart</button>
<input oninput="searchProducts()">
```

---

## Next Steps

1. ✅ Review the OOP structure in `script.js`
2. ✅ Read `OOP_IMPLEMENTATION.md` for detailed docs
3. ✅ Use `OOP_QUICK_REFERENCE.md` for API reference
4. ✅ Test in browser console to understand flow
5. ✅ Extend classes to add new features
6. ✅ Write tests for new methods


// Data
const specialItems = [
    { id: 101, name: "Truffle Risotto", desc: "Arborio rice, black truffle, parmesan", price: 26.00, img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop", badge: "Premium" },
    { id: 102, name: "Wagyu Steak", desc: "A5 Japanese Wagyu, grilled vegetables", price: 45.00, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", badge: "Limited" },
    { id: 103, name: "Lobster Thermidor", desc: "Whole lobster, creamy cheese sauce", price: 38.00, img: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop", badge: "Seafood" },
    { id: 104, name: "Duck Confit", desc: "Slow cooked duck leg, cherry reduction", price: 29.00, img: "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&h=300&fit=crop", badge: "Chef's Pick" }
];

const foodItems = [
    { id: 1, name: "Smash Burger", desc: "Double patty, cheddar, special sauce", price: 14.50, cat: "burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop", rating: 4.8 },
    { id: 2, name: "Pepperoni Pizza", desc: "San Marzano tomatoes, mozzarella", price: 18.00, cat: "pizza", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop", rating: 4.5 },
    { id: 3, name: "Carbonara", desc: "Guanciale, egg yolk, pecorino", price: 16.00, cat: "pasta", img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop", rating: 4.9 },
    { id: 4, name: "BBQ Ribs", desc: "Slow-cooked, smoky BBQ sauce", price: 22.00, cat: "meat", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", rating: 4.7 },
    { id: 5, name: "Caesar Salad", desc: "Romaine, croutons, parmesan", price: 11.00, cat: "salads", img: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop", rating: 4.2 },
    { id: 6, name: "Tiramisu", desc: "Classic Italian dessert", price: 8.00, cat: "desserts", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", rating: 4.9 },
    { id: 7, name: "Veggie Burger", desc: "Plant-based patty, avocado", price: 15.50, cat: "burgers", img: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop", rating: 4.4 },
    { id: 8, name: "Lemonade", desc: "Freshly squeezed, mint", price: 4.50, cat: "drinks", img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop", rating: 4.6 }
];

const categories = ["All", "Burgers", "Pizza", "Pasta", "Meat", "Salads", "Desserts", "Drinks"];
const validCoupons = { "SAVE10": 0.10, "WELCOME": 0.15 };

// State
let cart = JSON.parse(localStorage.getItem('fhCart')) || [];
let orders = JSON.parse(localStorage.getItem('fhOrders')) || [];
let activeFilter = "All";
let activeSort = "default";
let searchTerm = "";
let currentDiscount = 0;

// Initializers
function init() {
    renderCategories();
    renderMenu();
    renderSpecials();
    updateCartUI();
    setupScrollAnimations();
}

// Scroll Animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = document.querySelectorAll('.stat-num');
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const updateCount = () => {
                        const count = +counter.innerText;
                        const inc = target / 40;
                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 50);
                        } else counter.innerText = target;
                    };
                    updateCount();
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) observer.observe(aboutSection);
}

// Toast
function showToast(message, type = 'default') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Mobile Menu
function toggleMobileMenu() { document.getElementById('mobileNav').classList.toggle('active'); }

// --- Rendering ---

function renderSpecials() {
    const container = document.getElementById('specialsContainer');
    container.innerHTML = specialItems.map(item => `
        <div class="special-card">
            <span class="special-badge">${item.badge}</span>
            <img src="${item.img}" alt="${item.name}" class="special-img">
            <div class="special-content">
                <h3>${item.name}</h3>
                <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.5rem;">${item.desc}</p>
                <div class="special-footer">
                    <span class="special-price">$${item.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const container = document.getElementById('categoryTabs');
    container.innerHTML = categories.map(cat => 
        `<button class="tab ${cat === activeFilter ? 'active' : ''}" onclick="filterMenu('${cat}')">${cat}</button>`
    ).join('');
}

function renderMenu() {
    let items = [...foodItems];
    if (activeFilter !== "All") items = items.filter(i => i.cat.toLowerCase() === activeFilter.toLowerCase());
    if (searchTerm) items = items.filter(i => i.name.toLowerCase().includes(searchTerm) || i.desc.toLowerCase().includes(searchTerm));
    if (activeSort === 'priceAsc') items.sort((a, b) => a.price - b.price);
    else if (activeSort === 'priceDesc') items.sort((a, b) => b.price - a.price);
    else if (activeSort === 'ratingDesc') items.sort((a, b) => b.rating - a.rating);
    else if (activeSort === 'nameAsc') items.sort((a, b) => a.name.localeCompare(b.name));

    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = items.length ? items.map(item => `
        <div class="food-card">
            <img src="${item.img}" alt="${item.name}" class="card-img">
            <div class="card-body">
                <div class="card-top">
                    <h3 class="card-title">${item.name}</h3>
                    <div class="ratings"><span class="star"></span> ${item.rating}</div>
                </div>
                <p class="card-desc">${item.desc}</p>
                <div class="card-footer">
                    <span class="price">$${item.price.toFixed(2)}</span>
                    <button class="add-btn" onclick='addToCart(${JSON.stringify(item)})'>+</button>
                </div>
            </div>
        </div>
    `).join('') : `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 2rem;">No items found.</p>`;
}

// --- Filtering ---
function filterMenu(cat) { activeFilter = cat; renderCategories(); renderMenu(); }
function handleSearch() { searchTerm = document.getElementById('searchInput').value.toLowerCase(); renderMenu(); }
function sortMenu(type) {
    activeSort = type;
    const label = type === 'priceAsc'
        ? 'Price: Low-High'
        : type === 'priceDesc'
            ? 'Price: High-Low'
            : type === 'ratingDesc'
                ? 'Rating: High-Low'
                : type === 'nameAsc'
                    ? 'Name: A-Z'
                    : 'Default';
    document.querySelector('#sortBtn span').innerText = label;
    renderMenu();
}

// --- Cart Logic ---
function toggleCart(show) {
    document.getElementById('cartPanel').classList.toggle('active', show);
    document.getElementById('cartOverlay').classList.toggle('active', show);
}

function addToCart(item) {
    const existing = cart.find(c => c.id === item.id);
    if (existing) existing.qty++;
    else cart.push({ ...item, qty: 1 });
    saveCart();
    updateCartUI();
    showToast(`${item.name} added to cart`, 'success');
}

function updateQty(id, change) {
    const item = cart.find(c => c.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
        saveCart();
        updateCartUI();
    }
}

function removeItem(id) { cart = cart.filter(c => c.id !== id); saveCart(); updateCartUI(); }
function saveCart() { localStorage.setItem('fhCart', JSON.stringify(cart)); }

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartBody = document.getElementById('cartBody');
    const subtotalEl = document.getElementById('subtotal');
    const discountValEl = document.getElementById('discountVal');
    const totalEl = document.getElementById('totalPrice');

    cartCount.innerText = cart.reduce((a, b) => a + b.qty, 0);
    if (!cart.length) {
        cartBody.innerHTML = `<div class="empty-cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:60px; margin-bottom:1rem; opacity:0.3;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg><p>Your cart is empty</p></div>`;
    } else {
        cartBody.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeItem(${item.id})"></button>
            </div>
        `).join('');
    }
    calculateTotals();
}

function calculateTotals() {
    const subtotal = cart.reduce((a, b) => a + (b.price * b.qty), 0);
    const discountAmount = subtotal * currentDiscount;
    const delivery = cart.length ? 2.99 : 0;
    const total = subtotal - discountAmount + delivery;
    document.getElementById('subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('discountVal').innerText = `-$${discountAmount.toFixed(2)}`;
    document.getElementById('totalPrice').innerText = `$${total.toFixed(2)}`;
}

function applyCoupon() {
    const code = document.getElementById('couponInput').value.toUpperCase();
    if (validCoupons[code]) {
        currentDiscount = validCoupons[code];
        document.getElementById('discountDisplay').style.display = 'flex';
        document.getElementById('discountAmount').innerText = `${currentDiscount * 100}% OFF`;
        calculateTotals();
        showToast('Coupon applied!', 'success');
    } else showToast('Invalid coupon code', 'error');
}

// --- Checkout & Payment ---
function openCheckout() { if (!cart.length) return; toggleCart(false); document.getElementById('checkoutModal').classList.add('active'); }
function closeCheckout() { document.getElementById('checkoutModal').classList.remove('active'); }

function processPayment(e) {
    e.preventDefault();
    const btn = document.getElementById('payBtn');
    btn.innerHTML = `<span class="spinner"></span> Processing...`;
    btn.disabled = true;

    setTimeout(() => {
        const newOrder = {
            id: `FH-${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleDateString(),
            items: [...cart],
            total: document.getElementById('totalPrice').innerText,
            status: 'Processing'
        };

        orders.unshift(newOrder);
        localStorage.setItem('fhOrders', JSON.stringify(orders));

        btn.innerHTML = "Pay Now";
        btn.disabled = false;
        closeCheckout();
        
        cart = []; currentDiscount = 0; saveCart(); updateCartUI();
        document.getElementById('discountDisplay').style.display = 'none';
        document.getElementById('couponInput').value = '';
        
        document.getElementById('successModal').classList.add('active');
    }, 2000);
}

function closeSuccessModal() { document.getElementById('successModal').classList.remove('active'); }

// --- My Orders Logic ---
function openOrdersModal() {
    renderOrders();
    document.getElementById('ordersModal').classList.add('active');
}
function closeOrdersModal() { document.getElementById('ordersModal').classList.remove('active'); }

function renderOrders() {
    const container = document.getElementById('ordersBody');
    
    if (orders.length > 1) orders[orders.length - 1].status = "Delivered";

    if (!orders.length) {
        container.innerHTML = `<div class="empty-cart"><p>No past orders found.</p></div>`;
        return;
    }

    container.innerHTML = orders.map(order => {
        const statusClass = order.status === 'Delivered' ? 'status-delivered' : 'status-processing';
        const itemsPreview = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');

        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-items-list">${itemsPreview}</div>
                <div class="order-footer">
                    <span class="order-date">${order.date}</span>
                    <span class="order-total">Total: ${order.total}</span>
                </div>
            </div>
        `;
    }).join('');
}

// --- Contact Form ---
function handleContactSubmit(e) {
    e.preventDefault();
    showToast("Message sent successfully! We'll get back to you soon.", 'success');
    e.target.reset();
}

init();

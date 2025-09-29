// Shopping Cart Functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('monalisa_cart')) || [];
        this.deliveryPricing = {
            'tetouan': 0,
            'martil': 10,
            'rincon': 10,
            'tanger': 20,
            'other': 39
        };
        this.cityDetectionMap = {
            // Tétouan variations
            'tetouan': 'tetouan',
            'tétouan': 'tetouan',
            'tetuan': 'tetouan',
            'tétuan': 'tetouan',
            'titwan': 'tetouan',

            // Martil variations
            'martil': 'martil',
            'martiel': 'martil',
            'marteal': 'martil',

            // Rincón variations
            'rincon': 'rincon',
            'rincón': 'rincon',
            'rinkon': 'rincon',
            'cabo negro': 'rincon',
            'cabo-negro': 'rincon',

            // Tanger variations
            'tanger': 'tanger',
            'tangier': 'tanger',
            'tanja': 'tanger',
            'tanjar': 'tanger'
        };
        this.customerInfo = {};
        this.detectedCity = null;
        this.detectedDeliveryCost = 39;
        this.init();
    }

    init() {
        this.updateCartCount();
        this.updateCartDisplay();
        this.bindEvents();
    }

    bindEvents() {
        // Cart button
        document.getElementById('cartBtn').addEventListener('click', () => {
            this.toggleCart();
        });

        // Close cart
        document.getElementById('closeCart').addEventListener('click', () => {
            this.closeCart();
        });

        // Cart overlay
        document.getElementById('cartOverlay').addEventListener('click', () => {
            this.closeCart();
        });

        // WhatsApp button (direct messaging)
        document.getElementById('whatsappBtn').addEventListener('click', () => {
            this.sendDirectWhatsApp();
        });

        // Order button (detailed form)
        document.getElementById('orderBtn').addEventListener('click', () => {
            this.openOrderModal();
        });

        // Checkout modal events
        document.getElementById('closeCheckout').addEventListener('click', () => {
            this.closeOrderModal();
        });

        document.getElementById('cancelCheckout').addEventListener('click', () => {
            this.closeOrderModal();
        });

        // Checkout form
        document.getElementById('checkoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder();
        });

        // Address input to detect city and calculate delivery cost
        document.getElementById('customerAddress').addEventListener('input', (e) => {
            this.detectCityFromAddress(e.target.value);
        });
    }

    addItem(productId, size, color, quantity = 1) {
        const product = this.findProduct(productId);
        if (!product) {
            alert('Product not found!');
            return;
        }

        // Check if item with same specifications already exists
        const existingItemIndex = this.items.findIndex(item =>
            item.productId === productId &&
            item.size === size &&
            item.color === color
        );

        if (existingItemIndex !== -1) {
            // Update quantity of existing item
            this.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            const cartItem = {
                productId,
                name: product.name,
                price: product.price,
                image: product.image,
                size,
                color,
                quantity,
                category: product.category
            };
            this.items.push(cartItem);
        }

        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
        this.showAddedNotification(product.name);
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
    }

    updateQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeItem(index);
        } else {
            this.items[index].quantity = quantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotal() {
        return this.getSubtotal();
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (this.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        } else {
            cartItems.innerHTML = this.items.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p class="item-specs">Size: ${item.size} | Color: ${item.color}</p>
                        <p class="item-price">${item.price} MAD</p>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="cart.removeItem(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        cartTotal.textContent = `${this.getTotal()} MAD`;
    }

    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');

        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    closeCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');

        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    findProduct(productId) {
        // Search through all product categories
        for (const category in products) {
            const product = products[category].find(p => p.id === productId);
            if (product) return product;
        }
        return null;
    }

    saveCart() {
        localStorage.setItem('monalisa_cart', JSON.stringify(this.items));
    }

    showAddedNotification(productName) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${productName} added to cart!</span>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    sendDirectWhatsApp() {
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Create simple order message for WhatsApp
        let message = `🛍️ *Order from Monalisa Store*\n\n`;
        message += `📦 *Items:*\n`;

        this.items.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Size: ${item.size} | Color: ${item.color}\n`;
            message += `   Quantity: ${item.quantity} | Price: ${item.price} MAD each\n\n`;
        });

        message += `💰 *Total: ${this.getTotal()} MAD*\n\n`;
        message += `Please let me know about delivery details and confirm availability.`;

        // Encode message for WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = '212707741353';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Open WhatsApp
        window.open(whatsappURL, '_blank');
    }

    openOrderModal() {
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Update order summary
        this.updateOrderDisplay();

        // Show modal
        document.getElementById('checkoutModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeOrderModal() {
        document.getElementById('checkoutModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetOrderForm();
    }

    updateOrderDisplay() {
        const checkoutItems = document.getElementById('checkoutOrderItems');
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutTotal = document.getElementById('checkoutTotal');
        const deliveryCostElement = document.getElementById('checkoutDeliveryCost');

        // Display order items
        checkoutItems.innerHTML = this.items.map(item => `
            <div class="checkout-item">
                <span class="item-name">${item.name}</span>
                <span class="item-details">(${item.size}, ${item.color}) x${item.quantity}</span>
                <span class="item-total">${item.price * item.quantity} MAD</span>
            </div>
        `).join('');

        const subtotal = this.getSubtotal();
        checkoutSubtotal.textContent = `${subtotal} MAD`;
        deliveryCostElement.textContent = `${this.detectedDeliveryCost} MAD`;
        checkoutTotal.textContent = `${subtotal + this.detectedDeliveryCost} MAD`;
    }

    detectCityFromAddress(address) {
        if (!address || address.trim().length < 3) {
            this.hideDeliveryInfo();
            return;
        }

        const normalizedAddress = address.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9\s]/g, ' ') // Remove special chars
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

        let detectedCity = null;
        let detectedCityDisplay = '';

        // Check for city matches
        for (const [cityVariation, cityKey] of Object.entries(this.cityDetectionMap)) {
            if (normalizedAddress.includes(cityVariation.toLowerCase())) {
                detectedCity = cityKey;
                detectedCityDisplay = this.getCityDisplayName(cityKey);
                break;
            }
        }

        if (detectedCity) {
            this.detectedCity = detectedCity;
            this.detectedDeliveryCost = this.deliveryPricing[detectedCity] || 39;
            this.showDeliveryInfo(detectedCityDisplay, this.detectedDeliveryCost);
        } else {
            // No specific city detected, use default pricing
            this.detectedCity = 'other';
            this.detectedDeliveryCost = 39;
            this.showDeliveryInfo('Other city', this.detectedDeliveryCost);
        }

        // Update order total in real-time
        this.updateOrderTotals();
    }

    showDeliveryInfo(cityName, cost) {
        const deliveryInfo = document.getElementById('deliveryInfo');
        const detectedCityName = document.getElementById('detectedCityName');
        const detectedDeliveryCost = document.getElementById('detectedDeliveryCost');

        detectedCityName.textContent = cityName;
        detectedDeliveryCost.textContent = cost === 0 ? 'Gratuit' : `${cost} MAD`;

        deliveryInfo.style.display = 'block';
    }

    hideDeliveryInfo() {
        const deliveryInfo = document.getElementById('deliveryInfo');
        deliveryInfo.style.display = 'none';
        this.detectedCity = null;
        this.detectedDeliveryCost = 39;
        this.updateOrderTotals();
    }

    updateOrderTotals() {
        const checkoutDeliveryCost = document.getElementById('checkoutDeliveryCost');
        const checkoutTotal = document.getElementById('checkoutTotal');

        if (checkoutDeliveryCost && checkoutTotal) {
            const subtotal = this.getSubtotal();
            const total = subtotal + this.detectedDeliveryCost;

            checkoutDeliveryCost.textContent = this.detectedDeliveryCost === 0 ? 'Gratuit' : `${this.detectedDeliveryCost} MAD`;
            checkoutTotal.textContent = `${total} MAD`;
        }
    }

    resetOrderForm() {
        document.getElementById('checkoutForm').reset();
        this.customerInfo = {};
        this.updateOrderDisplay();
    }

    processOrder() {
        // Get form data
        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);

        const customerInfo = {
            name: formData.get('customerName'),
            phone: formData.get('customerPhone'),
            address: formData.get('customerAddress'),
            notes: formData.get('orderNotes') || ''
        };

        // Validate required fields
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            alert('Please fill in all required fields!');
            return;
        }

        // Re-detect city to ensure we have current info
        this.detectCityFromAddress(customerInfo.address);
        const deliveryCost = this.detectedDeliveryCost;
        const subtotal = this.getSubtotal();
        const total = subtotal + deliveryCost;

        // Create detailed order message for WhatsApp
        let message = `🛍️ *New Order from Monalisa Store*\n\n`;

        // Customer information
        message += `👤 *Customer Information:*\n`;
        message += `Name: ${customerInfo.name}\n`;
        message += `Phone: ${customerInfo.phone}\n`;
        message += `City: ${this.detectedCity ? this.getCityDisplayName(this.detectedCity) : 'Not detected'}\n`;
        message += `Address: ${customerInfo.address}\n\n`;

        // Order details
        message += `📦 *Order Details:*\n`;
        this.items.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Size: ${item.size} | Color: ${item.color}\n`;
            message += `   Quantity: ${item.quantity} | Price: ${item.price} MAD each\n`;
            message += `   Subtotal: ${item.price * item.quantity} MAD\n\n`;
        });

        // Order totals
        message += `💰 *Order Summary:*\n`;
        message += `Subtotal: ${subtotal} MAD\n`;
        message += `Delivery: ${deliveryCost} MAD\n`;
        message += `*Total Amount: ${total} MAD*\n\n`;

        // Additional notes
        if (customerInfo.notes) {
            message += `📝 *Additional Notes:*\n${customerInfo.notes}\n\n`;
        }

        message += `🙏 Thank you for choosing Monalisa Store!\n`;
        message += `We will confirm your order and arrange delivery soon.`;

        // Encode message for WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = '212707741353';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Save order to localStorage for admin panel
        const orderData = {
            customer: {
                name: customerInfo.name,
                phone: customerInfo.phone,
                address: customerInfo.address,
                city: this.detectedCity ? this.getCityDisplayName(this.detectedCity) : 'Non détectée',
                notes: customerInfo.notes
            },
            items: this.items.map(item => ({
                name: item.name,
                price: item.price,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                category: item.category
            })),
            subtotal: subtotal,
            deliveryCost: deliveryCost,
            total: total
        };

        // Save order to localStorage for admin system
        const orderId = this.saveOrderToAdmin(orderData);
        console.log('Order saved with ID:', orderId);

        // Clear cart and close modals
        this.clearCart();
        this.closeCart();
        this.closeOrderModal();

        // Show green success notification
        this.showOrderSuccessNotification();
    }

    getCityDisplayName(cityKey) {
        const cityNames = {
            'tetouan': 'Tétouan',
            'martil': 'Martil',
            'rincon': 'Rincón',
            'tanger': 'Tanger',
            'other': 'Other city'
        };
        return cityNames[cityKey] || cityKey;
    }

    saveOrderToAdmin(orderData) {
        // Get existing orders from localStorage
        const existingOrders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];

        // Create new order object
        const newOrder = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            customer: orderData.customer,
            items: orderData.items,
            subtotal: orderData.subtotal,
            deliveryCost: orderData.deliveryCost,
            total: orderData.total,
            status: 'new'
        };

        // Add to beginning of array (most recent first)
        existingOrders.unshift(newOrder);

        // Save back to localStorage
        localStorage.setItem('monalisa_orders', JSON.stringify(existingOrders));

        return newOrder.id;
    }

    showOrderSuccessNotification() {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'order-success-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Commande soumise avec succès!</span>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Product display and modal functionality
class ProductDisplay {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.displayProducts();
    }

    bindEvents() {
        // Category filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target);
                this.currentFilter = e.target.dataset.category;
                this.displayProducts();
            });
        });

        // Modal events
        const modal = document.getElementById('productModal');
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Add to cart button
        document.getElementById('addToCartBtn').addEventListener('click', () => {
            this.addToCart();
        });
    }

    setActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    displayProducts() {
        const grid = document.getElementById('productsGrid');
        let allProducts = [];

        // Collect all products or filtered products
        if (this.currentFilter === 'all') {
            for (const category in products) {
                allProducts = allProducts.concat(products[category]);
            }
        } else {
            allProducts = products[this.currentFilter] || [];
        }

        grid.innerHTML = allProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn btn-primary view-product" onclick="productDisplay.openModal('${product.id}')">
                            View Details
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price} MAD</p>
                    <div class="product-meta">
                        <span class="available-sizes">Sizes: ${product.sizes.join(', ')}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openModal(productId) {
        const product = this.findProduct(productId);
        if (!product) return;

        // Populate modal with product data
        document.getElementById('modalProductImage').src = product.image;
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = `${product.price} MAD`;
        document.getElementById('modalProductDescription').textContent = product.description;

        // Populate size options
        const sizeSelect = document.getElementById('sizeSelect');
        sizeSelect.innerHTML = product.sizes.map(size =>
            `<option value="${size}">${size}</option>`
        ).join('');

        // Populate color options
        const colorSelect = document.getElementById('colorSelect');
        colorSelect.innerHTML = product.colors.map(color =>
            `<option value="${color}">${color}</option>`
        ).join('');

        // Reset quantity
        document.getElementById('quantityInput').value = 1;

        // Store current product ID
        this.currentProductId = productId;

        // Show modal
        document.getElementById('productModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('productModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentProductId = null;
    }

    addToCart() {
        if (!this.currentProductId) return;

        const size = document.getElementById('sizeSelect').value;
        const color = document.getElementById('colorSelect').value;
        const quantity = parseInt(document.getElementById('quantityInput').value);

        cart.addItem(this.currentProductId, size, color, quantity);
        this.closeModal();
    }

    findProduct(productId) {
        for (const category in products) {
            const product = products[category].find(p => p.id === productId);
            if (product) return product;
        }
        return null;
    }
}

// Simple function to open product modal (for hardcoded products)
function openProductModal(productId) {
    if (window.productDisplay && window.productDisplay.openModal) {
        window.productDisplay.openModal(productId);
    } else {
        // Fallback: find product and open modal manually
        const product = findProductById(productId);
        if (product) {
            showProductModal(product);
        }
    }
}

// Helper function to find product by ID
function findProductById(productId) {
    for (const category in products) {
        const product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Simple modal display function
function showProductModal(product) {
    // Populate modal with product data
    document.getElementById('modalProductImage').src = product.image;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = `${product.price} MAD`;
    document.getElementById('modalProductDescription').textContent = product.description;

    // Populate size options
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.innerHTML = product.sizes.map(size =>
        `<option value="${size}">${size}</option>`
    ).join('');

    // Populate color options
    const colorSelect = document.getElementById('colorSelect');
    colorSelect.innerHTML = product.colors.map(color =>
        `<option value="${color}">${color}</option>`
    ).join('');

    // Reset quantity
    document.getElementById('quantityInput').value = 1;

    // Store current product ID
    window.currentProductId = product.id;

    // Show modal
    document.getElementById('productModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Initialize product display after DOM is loaded
let productDisplay;
document.addEventListener('DOMContentLoaded', () => {
    productDisplay = new ProductDisplay();
    // Make it globally available
    window.productDisplay = productDisplay;
});
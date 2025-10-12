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
        const product = ProductManager.getProductById(productId) || this.findProduct(productId);
        console.log('Adding item:', productId, 'Category:', product?.category);
        if (!product) {
            alert('Product not found!');
            return;
        }

        // Check inventory availability
        const inventoryKey = `${size}_${color}`;
        const availableStock = product.inventory?.[inventoryKey]?.quantity || 999;

        // Count how much is already in cart
        const existingCartQuantity = this.items.reduce((total, item) => {
            if (item.productId === productId && item.size === size && item.color === color) {
                return total + item.quantity;
            }
            return total;
        }, 0);

        const totalRequestedQuantity = existingCartQuantity + quantity;

        if (totalRequestedQuantity > availableStock) {
            alert(`Désolé, seulement ${availableStock} pièces disponibles en stock (${size}, ${color}).`);
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

// Products from admin panel are automatically displayed in the store
// Customers can browse products with real-time inventory information
// Available colors, sizes, and stock levels are shown live
class ProductDisplay {
    constructor() {
        this.availableVariants = [];
        this.currentProductId = null;
        this.init();
    }

    init() {
        this.displayProducts();
        this.listenForUpdates();
    }

    listenForUpdates() {
        // Listen for product updates from admin
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PRODUCTS_UPDATED') {
                console.log('🔄 Received product update message from admin');
                this.displayProducts();
            }
        });

        // Also listen for storage changes (if admin is opened in another tab)
        window.addEventListener('storage', (event) => {
            if (event.key === 'monalisa_products') {
                console.log('🔄 Products storage changed, refreshing display');
                this.displayProducts();
            }
        });
    }

    getAllProducts() {
        // Get admin-managed products through ProductManager
        const adminProducts = ProductManager.getAllProducts();
        console.log(`📊 Found ${adminProducts.length} admin products`);

        return adminProducts;
    }

    displayProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) {
            console.error('productsGrid element not found');
            return;
        }

        const products = this.getAllProducts();

        if (products.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #666;">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Produits Non Disponibles</h3>
                    <p>Les produits sont gérés manuellement par l'administration.</p>
                    <p>Contactez-nous directement pour vos commandes.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => {
            const totalStock = this.calculateTotalStock(product);
            const availableVariants = this.getAvailableVariants(product);
            const variantText = this.getVariantSummary(availableVariants);

            return `
                <div class="product-card" onclick="productDisplay.openModal('${product.id}')">
                    <div class="product-image">
                        <img src="${product.image || 'image/placeholder.jpg'}" alt="${product.name}" loading="lazy">
                        ${totalStock <= 3 ?
                            '<span class="stock-badge low-stock">Stock Faible</span>' :
                            '<span class="stock-badge in-stock">En Stock</span>'
                        }
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-category">${product.category || 'Divers'}</p>
                        <p class="product-price">${product.price} MAD</p>
                        <div class="variant-info">
                            <small style="color: #666;">${variantText}</small>
                            <small style="color: #888;">Stock total: ${totalStock} pièce(s)</small>
                        </div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); productDisplay.openModal('${product.id}')">
                            Voir Détails
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        console.log(`🎯 Displayed ${products.length} products in the grid`);
    }

    calculateTotalStock(product) {
        if (!product.inventory) return 0;

        return Object.values(product.inventory).reduce((total, variant) => {
            return total + (variant.quantity || 0);
        }, 0);
    }

    getVariantSummary(variants) {
        const colors = [...new Set(variants.map(v => v.color))];
        const sizes = [...new Set(variants.map(v => v.size))];

        let text = '';
        if (colors.length > 0) {
            text += `${colors.length} couleur${colors.length > 1 ? 's' : ''} • `;
        }
        if (sizes.length > 0) {
            text += `${sizes.length} taille${sizes.length > 1 ? 's' : ''}`;
        }

        return text || 'Variantes disponibles';
    }

    openModal(productId) {
        const product = ProductManager.getProductById(productId);
        if (!product) {
            alert('Produit non trouvé!');
            return;
        }

        this.currentProductId = productId;
        this.availableVariants = this.getAvailableVariants(product);

        // Populate modal with product data
        document.getElementById('modalProductImage').src = product.image || 'image/placeholder.jpg';
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductPrice').textContent = `${product.price} MAD`;
        document.getElementById('modalProductDescription').textContent = product.description || 'Produit géré par l\'administration';

        // Clear any existing stock indicator
        const existingIndicator = document.getElementById('stockIndicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        this.populateSizeOptions();
        this.populateColorOptions();

        // Reset quantity
        document.getElementById('quantityInput').value = 1;
        this.updateQuantityLimits();
        this.showAvailabilityInfo();

        // Add event listeners for size/color change
        const sizeSelect = document.getElementById('sizeSelect');
        const colorSelect = document.getElementById('colorSelect');

        sizeSelect.onchange = () => {
            this.populateColorOptions();
            this.updateQuantityLimits();
            this.showAvailabilityInfo();
        };
        colorSelect.onchange = () => {
            this.populateSizeOptions();
            this.updateQuantityLimits();
            this.showAvailabilityInfo();
        };

        // Show modal
        document.getElementById('productModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    populateSizeOptions() {
        const sizeSelect = document.getElementById('sizeSelect');
        const selectedColor = document.getElementById('colorSelect').value;

        const availableSizes = selectedColor ?
            [...new Set(this.availableVariants.filter(v => v.color === selectedColor).map(v => v.size))] :
            [...new Set(this.availableVariants.map(v => v.size))];

        if (availableSizes.length > 0) {
            sizeSelect.innerHTML = availableSizes.map(size => {
                const count = this.availableVariants.filter(v => v.size === size).length;
                return `<option value="${size}">${size} (${count} couleur(s))</option>`;
            }).join('');
        } else {
            sizeSelect.innerHTML = '<option disabled selected>Pas de tailles disponibles</option>';
        }

        this.updateQuantityLimits();
    }

    populateColorOptions() {
        const colorSelect = document.getElementById('colorSelect');
        const selectedSize = document.getElementById('sizeSelect').value;

        const availableColors = selectedSize ?
            [...new Set(this.availableVariants.filter(v => v.size === selectedSize).map(v => v.color))] :
            [...new Set(this.availableVariants.map(v => v.color))];

        if (availableColors.length > 0) {
            colorSelect.innerHTML = availableColors.map(color => {
                const count = this.availableVariants.filter(v => v.color === color).length;
                return `<option value="${color}">${color} (${count} taille(s) disponible)</option>`;
            }).join('');
        } else {
            colorSelect.innerHTML = '<option disabled selected>Pas de couleurs disponibles</option>';
        }

        this.updateQuantityLimits();
    }

    getAvailableVariants(product) {
        const variants = [];

        if (product.inventory && Object.keys(product.inventory).length > 0) {
            Object.entries(product.inventory).forEach(([key, data]) => {
                const [size, color] = key.split('_');
                const availableQty = Math.max(0, (data.quantity || 0) - (data.sold || 0));

                if (availableQty > 0) {
                    variants.push({
                        size,
                        color,
                        key,
                        availableQty,
                        totalStock: data.quantity || 0
                    });
                }
            });
        }

        return variants;
    }

    updateQuantityLimits() {
        const sizeSelect = document.getElementById('sizeSelect');
        const colorSelect = document.getElementById('colorSelect');
        const quantityInput = document.getElementById('quantityInput');

        const selectedSize = sizeSelect.value;
        const selectedColor = colorSelect.value;

        const variant = this.availableVariants.find(v =>
            v.size === selectedSize && v.color === selectedColor
        );

        if (variant && variant.availableQty > 0) {
            quantityInput.max = variant.availableQty;
            quantityInput.placeholder = `Max: ${variant.availableQty}`;
            if (parseInt(quantityInput.value) > variant.availableQty) {
                quantityInput.value = variant.availableQty;
            }
        } else {
            quantityInput.max = 1;
            quantityInput.value = 1;
            quantityInput.placeholder = 'Indisponible';
        }
    }

    showAvailabilityInfo() {
        const sizeSelect = document.getElementById('sizeSelect');
        const colorSelect = document.getElementById('colorSelect');

        const selectedSize = sizeSelect.value;
        const selectedColor = colorSelect.value;

        const variant = this.availableVariants.find(v =>
            v.size === selectedSize && v.color === selectedColor
        );

        const descriptionEl = document.getElementById('modalProductDescription');
        let stockIndicator = document.getElementById('stockIndicator');

        if (!stockIndicator) {
            stockIndicator = document.createElement('div');
            stockIndicator.id = 'stockIndicator';
            stockIndicator.style.fontWeight = 'bold';
            stockIndicator.style.marginTop = '10px';
            stockIndicator.style.padding = '8px 12px';
            stockIndicator.style.borderRadius = '6px';
            descriptionEl.parentNode.insertBefore(stockIndicator, descriptionEl.nextSibling);
        }

        if (variant) {
            let statusText = '';
            let backgroundColor = '';
            let textColor = '';

            if (variant.availableQty <= 0) {
                statusText = '🔴 PRODUIT ÉPUISÉ';
                backgroundColor = '#ffebee';
                textColor = '#c62828';
            } else if (variant.availableQty <= 3) {
                statusText = `🔴 STOCK FAIBLE: ${variant.availableQty} pièce(s) disponible pour ${selectedSize}/${selectedColor}`;
                backgroundColor = '#ffebee';
                textColor = '#c62828';
            } else if (variant.availableQty <= 10) {
                statusText = `🟡 STOCK LIMITÉ: ${variant.availableQty} pièce(s) disponible pour ${selectedSize}/${selectedColor}`;
                backgroundColor = '#fff3e0';
                textColor = '#ef6c00';
            } else {
                statusText = `🟢 STOCK DISPONIBLE: ${variant.availableQty} pièce(s) disponible pour ${selectedSize}/${selectedColor}`;
                backgroundColor = '#e8f5e8';
                textColor = '#2e7d32';
            }

            stockIndicator.textContent = statusText;
            stockIndicator.style.backgroundColor = backgroundColor;
            stockIndicator.style.color = textColor;
        } else {
            stockIndicator.textContent = '';
        }
    }

    closeModal() {
        document.getElementById('productModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentProductId = null;
        this.availableVariants = [];

        // Clear stock indicator
        const stockIndicator = document.getElementById('stockIndicator');
        if (stockIndicator) {
            stockIndicator.remove();
        }
    }

    addToCart() {
        if (!this.currentProductId) return;

        const size = document.getElementById('sizeSelect').value;
        const color = document.getElementById('colorSelect').value;
        const quantity = parseInt(document.getElementById('quantityInput').value);

        if (!size || !color || quantity <= 0) {
            alert('Veuillez sélectionner la taille, la couleur et la quantité.');
            return;
        }

        // Check if variant exists and has stock
        const variant = this.availableVariants.find(v =>
            v.size === size && v.color === color
        );

        if (!variant || variant.availableQty < quantity) {
            alert('Désolé, stock insuffisant pour cette variante.');
            return;
        }

        cart.addItem(this.currentProductId, size, color, quantity);
        this.closeModal();
    }
}

// Initialize product display after DOM is loaded
let productDisplay;
document.addEventListener('DOMContentLoaded', () => {
    productDisplay = new ProductDisplay();
    // Make it globally available
    window.productDisplay = productDisplay;
});

// Remove the old disable function since we're re-enabling product display
// delete window.disableProductGrid;

// END OF FILE - Product display functionality restored
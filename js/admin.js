/**
 * AdminPanel - Manages the admin dashboard including authentication,
 * order management, product management, and inventory tracking.
 */
class AdminPanel {
    /**
     * Creates an AdminPanel instance.
     * Loads orders/products from localStorage and initializes the panel.
     */
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || [];
        this.isLoggedIn = sessionStorage.getItem('monalisa_admin_logged_in') === 'true';
        this.adminPassword = 'monalisa2024'; // Change this password
        this.currentTab = 'orders';
        this.init();
    }

    /**
     * Initializes the admin panel: shows login or dashboard based on auth state.
     * Binds all event listeners and handles initialization errors gracefully.
     */
    init() {
        try {
            if (this.isLoggedIn) {
                this.showDashboard();
            } else {
                this.showLogin();
            }
            this.bindEvents();
        } catch (error) {
            console.error('Error in admin panel init:', error);
            // Show login screen as fallback
            try {
                this.showLogin();
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }
    }

    /**
     * Binds all event listeners for login, logout, tabs, forms, and auto-refresh.
     * Uses event delegation for tab navigation for better reliability.
     */
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Refresh orders
        const refreshBtn = document.getElementById('refreshOrders');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadOrders();
            });
        }

        // Clear all orders
        const clearAllBtn = document.getElementById('clearAllOrders');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllOrders();
            });
        }

        // Profit report button
        const profitReportBtn = document.getElementById('profitReportBtn');
        if (profitReportBtn) {
            profitReportBtn.addEventListener('click', () => {
                this.showProfitReport();
            });
        }

        // Tab navigation - use event delegation for better reliability
        const navContainer = document.querySelector('.admin-nav');
        if (navContainer) {
            navContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.nav-tab');
                if (tab) {
                    const tabName = tab.dataset.tab;
                    this.switchTab(tabName);
                }
            });
        }

        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showProductForm();
            });
        }

        // Product form submission
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    this.saveProduct();
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            });
        }

        // Cancel product form
        const cancelProductForm = document.getElementById('cancelProductForm');
        if (cancelProductForm) {
            cancelProductForm.addEventListener('click', () => {
                this.hideProductForm();
            });
        }

        // Auto-refresh orders every 30 seconds
        setInterval(() => {
            if (this.isLoggedIn && this.currentTab === 'orders') {
                this.loadOrders();
            }
        }, 30000);
    }

    /**
     * Handles admin login by validating the password.
     * Sets session storage flag and shows dashboard on success.
     */
    handleLogin() {
        const password = document.getElementById('adminPassword').value;

        if (password === this.adminPassword) {
            this.isLoggedIn = true;
            sessionStorage.setItem('monalisa_admin_logged_in', 'true');
            this.showDashboard();
        } else {
            alert('Mot de passe incorrect!');
        }
    }

    /**
     * Handles admin logout by clearing session storage.
     * Redirects to the login screen.
     */
    handleLogout() {
        this.isLoggedIn = false;
        sessionStorage.removeItem('monalisa_admin_logged_in');
        this.showLogin();
    }

    /**
     * Shows the login screen and hides the dashboard.
     */
    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    /**
     * Shows the admin dashboard, loads data, and migrates products if needed.
     */
    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').classList.remove('hidden');
        document.getElementById('adminDashboard').style.display = 'block';
        
        // Migrate products to include inventory structure if needed
        try {
            const migrated = ProductManager.migrateProductsWithInventory();
            if (migrated) {
                // Migration completed successfully
            }
        } catch (error) {
            console.warn('Product migration failed, continuing without migration:', error);
        }
        
        // Load products
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || [];
        
        this.loadOrders();
        this.updateStats();
        this.displayProducts();
    }

    /**
     * Switches between admin tabs (orders/products) and updates UI accordingly.
     * @param {string} tabName - The tab to switch to.
     */
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Show/hide sections with proper display handling
        const statsSection = document.querySelector('.stats-section');
        const ordersSection = document.querySelector('.orders-section');
        const productsSection = document.querySelector('.products-section');

        // Hide all sections first
        if (statsSection) {
            statsSection.style.display = 'none';
        }
        if (ordersSection) {
            ordersSection.style.display = 'none';
            ordersSection.classList.add('hidden');
        }
        if (productsSection) {
            productsSection.style.display = 'none';
            productsSection.classList.add('hidden');
        }

        // Show the selected section
        if (tabName === 'orders') {
            if (statsSection) statsSection.style.display = 'block';
            if (ordersSection) {
                ordersSection.style.display = 'block';
                ordersSection.classList.remove('hidden');
            }
            this.loadOrders();
        } else if (tabName === 'products') {
            if (productsSection) {
                productsSection.style.display = 'block';
                productsSection.classList.remove('hidden');
            }
            
            // Force reload products from localStorage
            this.products = JSON.parse(localStorage.getItem('monalisa_products')) || [];
            this.displayProducts();
        }
        
        // Scroll to top when switching tabs
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Reloads orders from localStorage and refreshes the display and stats.
     */
    loadOrders() {
        // Reload orders from localStorage
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        this.displayOrders();
        this.updateStats();
    }

    /**
     * Displays orders in the container. Shows a message if no orders exist.
     * @param {Array} filteredOrders - Optional filtered list of orders to display.
     */
    displayOrders(filteredOrders = null) {
        const ordersContainer = document.getElementById('ordersContainer');
        const ordersToShow = filteredOrders || this.orders;

        if (ordersToShow.length === 0) {
            ordersContainer.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-inbox"></i>
                    <p>Aucune commande pour le moment</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = ordersToShow.map(order => this.createOrderCard(order)).join('');
    }

    /**
     * Creates an HTML card for a single order.
     * @param {Object} order - The order data object.
     * @returns {string} HTML string for the order card.
     */
    createOrderCard(order) {
        const orderDate = new Date(order.timestamp).toLocaleString('fr-FR');
        const status = order.status || 'new';
        
        // Status badge HTML
        let statusBadge = '';
        if (status === 'confirmed') {
            statusBadge = `<div class="order-status-badge confirmed"><i class="fas fa-check-circle"></i> Confirmée</div>`;
        } else if (status === 'completed') {
            statusBadge = `<div class="order-status-badge completed"><i class="fas fa-check-double"></i> Terminée</div>`;
        } else {
            statusBadge = `<div class="order-status-badge new"><i class="fas fa-clock"></i> Nouvelle</div>`;
        }

        // Confirm button (only show if not already completed)
        let confirmBtn = '';
        if (status !== 'completed') {
            confirmBtn = `
                <button class="action-btn confirm-btn" onclick="admin.confirmOrder('${order.id}')">
                    <i class="fas fa-check"></i> ${status === 'confirmed' ? 'Confirmée' : 'Confirmer'}
                </button>
            `;
        }

        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Commande #${order.id}</div>
                    <div class="order-date">${orderDate}</div>
                </div>
                
                ${statusBadge}

                <div class="customer-info">
                    <h4><i class="fas fa-user"></i> Informations client</h4>
                    <div class="customer-details">
                        <div><i class="fas fa-user"></i> ${order.customer.name}</div>
                        <div><i class="fas fa-phone"></i> ${order.customer.phone}</div>
                        <div><i class="fas fa-map-marker-alt"></i> ${order.customer.address}</div>
                        ${order.customer.city ? `<div><i class="fas fa-city"></i> ${order.customer.city}</div>` : ''}
                    </div>
                    ${order.customer.notes ? `<div class="customer-notes"><i class="fas fa-sticky-note"></i> ${order.customer.notes}</div>` : ''}
                </div>

                <div class="order-items">
                    <h4><i class="fas fa-shopping-bag"></i> Articles commandés</h4>
                    <div class="items-list">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-details">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-specs">Taille: ${item.size} | Couleur: ${item.color} | Qté: ${item.quantity}</div>
                                </div>
                                <div class="item-price">${item.price * item.quantity} MAD</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="order-totals">
                    <h4><i class="fas fa-calculator"></i> Total de la commande</h4>
                    <div class="totals-breakdown">
                        <div class="total-line">
                            <span>Sous-total:</span>
                            <span>${order.subtotal} MAD</span>
                        </div>
                        <div class="total-line">
                            <span>Livraison:</span>
                            <span>${order.deliveryCost === 0 ? 'Gratuit' : order.deliveryCost + ' MAD'}</span>
                        </div>
                        <div class="total-line final-total">
                            <span>Total:</span>
                            <span>${order.total} MAD</span>
                        </div>
                    </div>
                </div>

                <div class="order-actions">
                    ${confirmBtn}
                    <button class="action-btn whatsapp-btn" onclick="admin.contactCustomer('${order.id}')">
                        <i class="fab fa-whatsapp"></i> Contacter
                    </button>
                    <button class="action-btn delete-btn" onclick="admin.deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Updates dashboard statistics: order counts, revenue, and profit metrics.
     */
    updateStats() {
        try {
            const totalOrders = this.orders.length;
            const today = new Date().toDateString();
            const todayOrders = this.orders.filter(order =>
                new Date(order.timestamp).toDateString() === today
            ).length;

            const totalRevenue = this.orders.reduce((sum, order) => sum + order.subtotal, 0);
            const deliveryRevenue = this.orders.reduce((sum, order) => sum + order.deliveryCost, 0);
            
            // Calculate profits
            const totalProfit = ProductManager.getTotalProfit();
            const todayProfit = ProductManager.getTodayProfit();

            const totalOrdersEl = document.getElementById('totalOrders');
            const todayOrdersEl = document.getElementById('todayOrders');
            const totalRevenueEl = document.getElementById('totalRevenue');
            const deliveryRevenueEl = document.getElementById('deliveryRevenue');
            const totalProfitEl = document.getElementById('totalProfit');
            const todayProfitEl = document.getElementById('todayProfit');

            if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
            if (todayOrdersEl) todayOrdersEl.textContent = todayOrders;
            if (totalRevenueEl) totalRevenueEl.textContent = `${totalRevenue} MAD`;
            if (deliveryRevenueEl) deliveryRevenueEl.textContent = `${deliveryRevenue} MAD`;
            if (totalProfitEl) totalProfitEl.textContent = `${Math.round(totalProfit.totalProfit)} MAD`;
            if (todayProfitEl) todayProfitEl.textContent = `${Math.round(todayProfit.todayProfit)} MAD`;
        } catch (error) {
            console.warn('Error updating stats:', error);
        }
    }

    /**
     * Opens WhatsApp with a pre-filled message to contact the customer.
     * @param {string} orderId - The order ID to find customer details.
     */
    /**
     * Confirms an order by updating its status in localStorage.
     * @param {string} orderId - The order ID to confirm.
     */
    confirmOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Update order status
        if (order.status === 'confirmed') {
            // Already confirmed, mark as completed
            if (confirm('Cette commande est déjà confirmée. Voulez-vous la marquer comme terminée?')) {
                order.status = 'completed';
                localStorage.setItem('monalisa_orders', JSON.stringify(this.orders));
                this.loadOrders();
                alert('✅ Commande marquée comme terminée!');
            }
        } else {
            // New order, confirm it
            if (confirm('Confirmer cette commande? Cela enverra une notification au client.')) {
                order.status = 'confirmed';
                localStorage.setItem('monalisa_orders', JSON.stringify(this.orders));
                this.loadOrders();
                alert('✅ Commande confirmée avec succès!');
                
                // Optional: Send WhatsApp confirmation to customer
                this.sendOrderConfirmation(order);
            }
        }
    }

    /**
     * Sends a WhatsApp confirmation message to the customer.
     * @param {Object} order - The confirmed order object.
     */
    sendOrderConfirmation(order) {
        const message = `Bonjour ${order.customer.name},\n\n✅ Votre commande #${order.id} d'un montant de ${order.total} MAD a été confirmée!\n\nNous vous contacterons bientôt pour organiser la livraison.\n\nMerci de votre confiance!\n\nMonalisa Store`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = order.customer.phone.replace(/[^0-9]/g, '');
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
    }

    /**
     * Contacts a customer via WhatsApp for a specific order.
     * @param {string} orderId - The order ID to contact about.
     */
    contactCustomer(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const message = `Bonjour ${order.customer.name},\n\nConcernant votre commande #${order.id} d'un montant de ${order.total} MAD.\n\nNous vous confirmons la réception de votre commande et nous vous contacterons bientôt pour organiser la livraison.\n\nMerci de votre confiance!\n\nMonalisa Store`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = order.customer.phone.replace(/[^0-9]/g, '');
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');
    }

    /**
     * Deletes a single order after confirmation. Saves to localStorage.
     * @param {string} orderId - The order ID to delete.
     */
    deleteOrder(orderId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) {
            this.orders = this.orders.filter(order => order.id !== orderId);
            localStorage.setItem('monalisa_orders', JSON.stringify(this.orders));
            this.loadOrders();
        }
    }

    /**
     * Deletes all orders after confirmation. This action is irreversible.
     */
    clearAllOrders() {
        if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES les commandes? Cette action est irréversible.')) {
            this.orders = [];
            localStorage.setItem('monalisa_orders', JSON.stringify(this.orders));
            this.loadOrders();
        }
    }

    /**
     * Static method to add a new order from the main site.
     * Saves to localStorage and returns the new order ID.
     * @param {Object} orderData - The order data including customer, items, totals.
     * @returns {string} The new order ID.
     */
    static addOrder(orderData) {
        const orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];

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

        orders.unshift(newOrder); // Add to beginning of array
        localStorage.setItem('monalisa_orders', JSON.stringify(orders));

        return newOrder.id;
    }

    /**
     * Adds a new image URL input field to the product form.
     */
    addImageUrlField() {
        const container = document.getElementById('imageUrlsContainer');
        if (!container) return;
        
        const row = document.createElement('div');
        row.className = 'image-url-row';
        row.innerHTML = `
            <input type="text" class="product-image-url" placeholder="URL de l'image">
            <button type="button" class="add-image-btn" onclick="admin.addImageUrlField()" title="Ajouter une autre image">
                <i class="fas fa-plus"></i>
            </button>
            <button type="button" class="remove-image-btn" onclick="admin.removeImageField(this)" title="Supprimer cette image">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
        
        // Focus the new input
        const newInput = row.querySelector('.product-image-url');
        if (newInput) newInput.focus();
    }

    /**
     * Removes an image URL input field from the product form.
     * Keeps at least one field.
     * @param {HTMLElement} button - The remove button that was clicked.
     */
    removeImageField(button) {
        const container = document.getElementById('imageUrlsContainer');
        const rows = container.querySelectorAll('.image-url-row');
        
        // Don't remove if it's the only row
        if (rows.length <= 1) {
            alert('Vous devez avoir au moins une image.');
            return;
        }
        
        button.parentElement.remove();
    }

    /**
     * Loads products from localStorage and refreshes the display.
     */
    loadProducts() {
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || [];
        this.displayProducts();
    }

    /**
     * Renders all products in the admin grid. Shows a message if none exist.
     */
    displayProducts() {
        try {
            const container = document.getElementById('adminProductsGrid');
            if (!container) {
                console.warn('Products grid container not found');
                return;
            }

            if (this.products.length === 0) {
                container.innerHTML = `
                    <div class="no-products">
                        <i class="fas fa-box-open"></i>
                        <p>Aucun produit pour le moment. Cliquez sur "Ajouter un produit" pour commencer.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
        } catch (error) {
            console.error('Error displaying products:', error);
        }
    }

    /**
     * Creates an HTML card for a single product with inventory and profit info.
     * @param {Object} product - The product data object.
     * @returns {string} HTML string for the product card.
     */
    createProductCard(product) {
        const colors = product.colors.map(color => {
            const colorCode = this.getColorCode(color);
            return `<span class="color-dot" style="background-color: ${colorCode};" title="${color}"></span>`;
        }).join('');

        // Calculate total stock and profit
        const totalStock = ProductManager.getTotalStock(product.id);
        const isSoldOut = ProductManager.isProductSoldOut(product.id);
        const profit = ProductManager.getProductProfit(product.id);
        const stockStatusClass = isSoldOut ? 'sold-out' : totalStock <= 10 ? 'low-stock' : 'in-stock';

        // Get cost price from first inventory item
        const costPrice = product.inventory ? Object.values(product.inventory)[0]?.costPrice || 0 : 0;
        const profitPerUnit = product.price - costPrice;
        
        // Handle multiple images
        const images = product.images || (product.image ? [product.image] : []);
        const mainImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=No+Image';

        return `
            <div class="product-card ${isSoldOut ? 'sold-out-product' : ''}" data-product-id="${product.id}">
                <div class="product-card-status-badge ${stockStatusClass}">
                    ${isSoldOut ? '<i class="fas fa-times-circle"></i> Épuisé' : `<i class="fas fa-box"></i> ${totalStock}`}
                </div>
                <div class="admin-product-image-container">
                    <img src="${mainImage}"
                         alt="${product.name}"
                         class="product-card-image"
                         data-product-images='${JSON.stringify(images)}'
                         onerror="this.src='https://via.placeholder.com/300x400/E91E63/FFFFFF?text=No+Image'">
                    ${images.length > 1 ? `
                        <div class="admin-image-nav">
                            <button class="admin-image-btn" onclick="admin.changeAdminImage('${product.id}', -1)">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="admin-image-btn" onclick="admin.changeAdminImage('${product.id}', 1)">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="admin-image-dots">
                            ${images.map((_, idx) => `<span class="admin-dot ${idx === 0 ? 'active' : ''}" onclick="admin.setAdminImage('${product.id}', ${idx})"></span>`).join('')}
                        </div>
                        <div class="image-count-badge">${images.length} images</div>
                    ` : ''}
                </div>
                <div class="product-card-body">
                    <h3 class="product-card-name">${product.name}</h3>
                    <div class="product-card-price">${product.price} MAD</div>
                    <div class="product-card-profit-info">
                        <span class="cost-price">Achat: ${costPrice} MAD</span>
                        <span class="profit-margin">Profit: ${Math.round(profitPerUnit)} MAD/unité</span>
                    </div>
                    <div class="product-card-category">${this.getCategoryName(product.category)}</div>
                    <div class="product-card-meta">
                        <div class="product-card-sizes">
                            <i class="fas fa-ruler"></i> ${product.sizes.join(', ')}
                        </div>
                        <div class="product-card-colors">
                            ${colors}
                        </div>
                    </div>
                    ${profit.totalProfit > 0 ? `
                    <div class="product-profit-summary">
                        <div class="profit-line">
                            <i class="fas fa-chart-line"></i>
                            <span>Profit total: <strong>${Math.round(profit.totalProfit)} MAD</strong></span>
                        </div>
                        <div class="profit-line">
                            <i class="fas fa-percentage"></i>
                            <span>Marge: ${profit.profitMargin}%</span>
                        </div>
                    </div>
                    ` : ''}
                    <div class="inventory-details">
                        <h5><i class="fas fa-warehouse"></i> Inventaire par variante:</h5>
                        <div class="inventory-grid">
                            ${this.createInventoryDisplay(product)}
                        </div>
                    </div>
                    <div class="product-card-actions">
                        <button class="edit-btn" onclick="admin.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="inventory-btn" onclick="admin.showInventoryManager('${product.id}')">
                            <i class="fas fa-boxes"></i> Stock
                        </button>
                        <button class="delete-btn" onclick="admin.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Changes the displayed product image in the admin card by direction.
     * @param {string} productId - The product ID.
     * @param {number} direction - -1 for previous, 1 for next image.
     */
    changeAdminImage(productId, direction) {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        if (!card) return;
        
        const img = card.querySelector('.product-card-image');
        if (!img) return;
        
        const images = JSON.parse(img.dataset.productImages || '[]');
        if (images.length <= 1) return;
        
        let currentIndex = images.indexOf(img.src);
        if (currentIndex === -1) currentIndex = 0;
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = images.length - 1;
        if (newIndex >= images.length) newIndex = 0;
        
        img.src = images[newIndex];
        
        const dots = card.querySelectorAll('.admin-image-dots .admin-dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === newIndex);
        });
    }

    /**
     * Sets the displayed product image to a specific index.
     * @param {string} productId - The product ID.
     * @param {number} index - The image index to display.
     */
    setAdminImage(productId, index) {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        if (!card) return;
        
        const img = card.querySelector('.product-card-image');
        if (!img) return;
        
        const images = JSON.parse(img.dataset.productImages || '[]');
        if (index >= 0 && index < images.length) {
            img.src = images[index];
            
            const dots = card.querySelectorAll('.admin-image-dots .admin-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === index);
            });
        }
    }

    /**
     * Creates HTML display for product inventory variants (size/color/stock).
     * @param {Object} product - The product with inventory data.
     * @returns {string} HTML string for inventory display.
     */
    createInventoryDisplay(product) {
        if (!product.inventory) return '<p style="font-size: 0.8rem; color: #999;">Aucun inventaire défini</p>';
        
        const inventoryItems = Object.values(product.inventory);
        if (inventoryItems.length === 0) return '<p style="font-size: 0.8rem; color: #999;">Aucun inventaire défini</p>';
        
        // Show first 4 variants, then "+X more" if needed
        const displayItems = inventoryItems.slice(0, 4);
        const remaining = inventoryItems.length - 4;
        
        let html = displayItems.map(item => {
            const stockClass = item.stock === 0 ? 'out' : item.stock <= 3 ? 'low' : 'available';
            return `
                <div class="inventory-item ${stockClass}">
                    <div class="item-variant">${item.size}/${item.color}</div>
                    <div class="item-stock">${item.stock}</div>
                </div>
            `;
        }).join('');
        
        if (remaining > 0) {
            html += `<div class="inventory-item more"><div class="item-variant">+${remaining} autres</div></div>`;
        }
        
        return html;
    }

    /**
     * Returns a human-readable category name.
     * @param {string} category - The category key.
     * @returns {string} The display name for the category.
     */
    getCategoryName(category) {
        const categoryNames = {
            'pants': 'Pants',
            'blouses': 'Blouses',
            'shirts': 'Shirts',
            'accessories': 'Accessories',
            'handbags': 'Handbags',
            'footwear': 'Footwear',
            'perfumes': 'Perfumes',
            'pajamas': 'Pajamas'
        };
        return categoryNames[category] || category;
    }

    /**
     * Returns the hex color code for a color name.
     * @param {string} colorName - The color name.
     * @returns {string} The hex color code.
     */
    getColorCode(colorName) {
        const colorCodes = {
            'Black': '#000000',
            'White': '#FFFFFF',
            'Red': '#FF0000',
            'Blue': '#0000FF',
            'Green': '#00FF00',
            'Yellow': '#FFFF00',
            'Pink': '#FFC0CB',
            'Purple': '#800080',
            'Orange': '#FFA500',
            'Gray': '#808080',
            'Brown': '#A52A2A',
            'Beige': '#F5F5DC',
            'Navy': '#000080',
            'Gold': '#FFD700',
            'Silver': '#C0C0C0',
            'Rose Gold': '#B76E79',
            'Light Blue': '#ADD8E6',
            'Dark Blue': '#00008B',
            'Light Denim': '#6B8DD6',
            'Dark Denim': '#4A5F8C',
            'Khaki': '#C3B091',
            'Floral': '#FF69B4',
            'Striped': '#4169E1',
            'Polka Dot': '#FF1493',
            'Classic': '#808080'
        };
        return colorCodes[colorName] || '#CCCCCC';
    }

    /**
     * Shows the product form for adding or editing a product.
     * @param {string} productId - Optional product ID for edit mode.
     */
    showProductForm(productId = null) {
        const formContainer = document.getElementById('productFormContainer');
        const formTitle = document.getElementById('productFormTitle');
        const form = document.getElementById('productForm');

        formContainer.classList.remove('hidden');

        if (productId) {
            // Edit mode
            const product = this.products.find(p => p.id === productId);
            if (product) {
                formTitle.textContent = 'Modifier le produit';
                document.getElementById('editProductId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productPrice').value = product.price;
                
                // Get cost price from first inventory item
                const costPrice = product.inventory ? Object.values(product.inventory)[0]?.costPrice || 0 : 0;
                document.getElementById('productCostPrice').value = costPrice;
                
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productSizes').value = product.sizes.join(', ');
                document.getElementById('productColors').value = product.colors.join(', ');
                
                // Populate image fields
                const container = document.getElementById('imageUrlsContainer');
                if (container) {
                    container.innerHTML = '';
                    const images = product.images || (product.image ? [product.image] : []);
                    
                    if (images.length === 0) {
                        // Add one empty field
                        container.innerHTML = `
                            <div class="image-url-row">
                                <input type="text" class="product-image-url" placeholder="Image principale (URL)">
                                <button type="button" class="add-image-btn" onclick="admin.addImageUrlField()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        `;
                    } else {
                        images.forEach((imgUrl, index) => {
                            const row = document.createElement('div');
                            row.className = 'image-url-row';
                            const isLast = index === images.length - 1;
                            row.innerHTML = `
                                <input type="text" class="product-image-url" value="${imgUrl}" placeholder="URL de l'image">
                                ${isLast ? `<button type="button" class="add-image-btn" onclick="admin.addImageUrlField()" title="Ajouter une autre image">
                                    <i class="fas fa-plus"></i>
                                </button>` : ''}
                                <button type="button" class="remove-image-btn" onclick="admin.removeImageField(this)" title="Supprimer cette image">
                                    <i class="fas fa-trash"></i>
                                </button>
                            `;
                            container.appendChild(row);
                        });
                    }
                }
            }
        } else {
            // Add mode
            formTitle.textContent = 'Ajouter un produit';
            form.reset();
            document.getElementById('editProductId').value = '';
            
            // Reset image fields to single empty field
            const container = document.getElementById('imageUrlsContainer');
            if (container) {
                container.innerHTML = `
                    <div class="image-url-row">
                        <input type="text" class="product-image-url" placeholder="Image principale (URL)">
                        <button type="button" class="add-image-btn" onclick="admin.addImageUrlField()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                `;
            }
        }

        // Scroll to form
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Hides the product form and resets all form fields.
     */
    hideProductForm() {
        const formContainer = document.getElementById('productFormContainer');
        formContainer.classList.add('hidden');
        document.getElementById('productForm').reset();
        document.getElementById('editProductId').value = '';
    }

    /**
     * Validates and saves a product (create or update) from form data.
     * Handles inventory generation for new products.
     */
    saveProduct() {
        try {
            const editIdEl = document.getElementById('editProductId');
            const costPriceEl = document.getElementById('productCostPrice');
            const nameEl = document.getElementById('productName');
            const priceEl = document.getElementById('productPrice');
            const categoryEl = document.getElementById('productCategory');
            const descEl = document.getElementById('productDescription');
            const sizesEl = document.getElementById('productSizes');
            const colorsEl = document.getElementById('productColors');

            // Check if all elements exist
            if (!nameEl || !priceEl || !categoryEl || !sizesEl || !colorsEl) {
                alert('Error: Form is not properly loaded. Please refresh the page and try again.');
                return;
            }

            const editId = editIdEl ? editIdEl.value : '';
            const costPrice = costPriceEl ? parseFloat(costPriceEl.value) || 0 : 0;
            const productName = nameEl.value.trim();
            const productPrice = parseInt(priceEl.value);
            const productCategory = categoryEl.value;
            const productDescription = descEl ? descEl.value.trim() : '';
            
            // Get all image URLs
            const imageInputs = document.querySelectorAll('.product-image-url');
            const productImages = Array.from(imageInputs)
                .map(input => input.value.trim())
                .filter(url => url.length > 0);
            const productImage = productImages.length > 0 ? productImages[0] : ''; // First image for backward compatibility
            const productImagesArray = productImages; // Store all images
            
            const productSizes = sizesEl.value.split(',').map(s => s.trim()).filter(s => s);
            const productColors = colorsEl.value.split(',').map(c => c.trim()).filter(c => c);

            // Validate required fields
            if (!productName || !productPrice || !productCategory || productSizes.length === 0 || productColors.length === 0) {
                alert('Please fill in all required fields!');
                return;
            }

            const productData = {
                name: productName,
                price: productPrice,
                category: productCategory,
                image: productImage,
                images: productImagesArray,
                description: productDescription,
                sizes: productSizes,
                colors: productColors
            };

            if (editId) {
                // Update existing product
                const index = this.products.findIndex(p => p.id === editId);
                if (index !== -1) {
                    const updatedProduct = {
                        ...this.products[index],
                        ...productData
                    };

                    // Update inventory with new cost price
                    if (updatedProduct.inventory) {
                        Object.keys(updatedProduct.inventory).forEach(key => {
                            updatedProduct.inventory[key].costPrice = costPrice;
                        });
                    }

                    this.products[index] = updatedProduct;
                }
            } else {
                // Add new product
                const newProduct = {
                    id: 'prod_' + Date.now(),
                    ...productData,
                    inventory: ProductManager.generateDefaultInventory(
                        productData.sizes,
                        productData.colors,
                        10, // default stock
                        costPrice // cost price
                    )
                };
                this.products.unshift(newProduct);
            }

            // Save to localStorage
            localStorage.setItem('monalisa_products', JSON.stringify(this.products));

            // Refresh display
            this.displayProducts();
            this.hideProductForm();

            // Show success message with refresh reminder
            const message = editId 
                ? 'Produit modifié avec succès!' 
                : 'Produit ajouté avec succès! 📱 N\'oubliez pas de rafraîchir la page d\'accueil (F5) pour voir le nouveau produit.';
            alert(message);
        } catch (error) {
            console.error('Error in saveProduct:', error);
            alert('Error saving product: ' + error.message);
        }
    }

    /**
     * Opens the product form in edit mode for the specified product.
     * @param {string} productId - The product ID to edit.
     */
    editProduct(productId) {
        this.showProductForm(productId);
    }

    /**
     * Deletes a product after confirmation. Saves to localStorage.
     * @param {string} productId - The product ID to delete.
     */
    deleteProduct(productId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
            this.products = this.products.filter(p => p.id !== productId);
            localStorage.setItem('monalisa_products', JSON.stringify(this.products));
            this.displayProducts();
        }
    }

    /**
     * Shows the inventory management modal for a product.
     * Creates a modal with stock table and add/remove controls.
     * @param {string} productId - The product ID to manage.
     */
    showInventoryManager(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const inventoryHtml = this.createInventoryManagerHtml(product);
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'inventory-modal';
        modal.innerHTML = `
            <div class="inventory-modal-content">
                <div class="inventory-header">
                    <h3><i class="fas fa-boxes"></i> Gérer le stock - ${product.name}</h3>
                    <button class="close-modal" onclick="this.closest('.inventory-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="inventory-body">
                    ${inventoryHtml}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Bind events
        modal.querySelectorAll('.add-stock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.currentTarget.dataset.size;
                const color = e.currentTarget.dataset.color;
                this.addStockDialog(productId, size, color);
            });
        });

        modal.querySelectorAll('.remove-stock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.currentTarget.dataset.size;
                const color = e.currentTarget.dataset.color;
                this.removeStockDialog(productId, size, color);
            });
        });
    }

    /**
     * Creates HTML for the inventory management modal with stock table.
     * @param {Object} product - The product with inventory data.
     * @returns {string} HTML string for the inventory manager.
     */
    createInventoryManagerHtml(product) {
        if (!product.inventory) {
            return '<p>Ce produit n\'a pas de structure d\'inventaire. Veuillez le modifier et l\'enregistrer pour en créer une.</p>';
        }

        const inventoryItems = Object.values(product.inventory);
        const profit = ProductManager.getProductProfit(product.id);
        const costPrice = inventoryItems[0]?.costPrice || 0;
        const profitPerUnit = product.price - costPrice;
        
        let html = `
            <div class="inventory-summary">
                <div class="summary-item">
                    <strong>Stock total:</strong> ${ProductManager.getTotalStock(product.id)} articles
                </div>
                <div class="summary-item">
                    <strong>Statut:</strong> ${ProductManager.isProductSoldOut(product.id) ? '<span class="status-badge sold-out">Rupture de stock</span>' : '<span class="status-badge in-stock">En stock</span>'}
                </div>
                <div class="summary-item">
                    <strong>Profit/unité:</strong> <span class="status-badge profit-badge">${Math.round(profitPerUnit)} MAD</span>
                </div>
            </div>
            <div class="profit-summary-box">
                <h4><i class="fas fa-chart-line"></i> Rapport de profit</h4>
                <div class="profit-stats-grid">
                    <div class="profit-stat">
                        <div class="profit-stat-label">Ventes totales</div>
                        <div class="profit-stat-value">${Math.round(profit.totalRevenue)} MAD</div>
                    </div>
                    <div class="profit-stat">
                        <div class="profit-stat-label">Coût total</div>
                        <div class="profit-stat-value">${Math.round(profit.totalCost)} MAD</div>
                    </div>
                    <div class="profit-stat profit-stat-highlight">
                        <div class="profit-stat-label">Profit net</div>
                        <div class="profit-stat-value">${Math.round(profit.totalProfit)} MAD</div>
                    </div>
                    <div class="profit-stat">
                        <div class="profit-stat-label">Marge de profit</div>
                        <div class="profit-stat-value">${profit.profitMargin}%</div>
                    </div>
                </div>
            </div>
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Taille</th>
                        <th>Couleur</th>
                        <th>Stock</th>
                        <th>Prix d'achat</th>
                        <th>Profit/unité</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        inventoryItems.forEach(item => {
            const stockClass = item.stock === 0 ? 'out' : item.stock <= 3 ? 'low' : 'available';
            const itemProfit = product.price - (item.costPrice || 0);
            html += `
                <tr class="${stockClass}">
                    <td>${item.size}</td>
                    <td>${item.color}</td>
                    <td><strong>${item.stock}</strong></td>
                    <td>${Math.round(item.costPrice || 0)} MAD</td>
                    <td class="profit-cell">${Math.round(itemProfit)} MAD</td>
                    <td>
                        <button class="add-stock-btn btn-small btn-success" data-size="${item.size}" data-color="${item.color}">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                        <button class="remove-stock-btn btn-small btn-danger" data-size="${item.size}" data-color="${item.color}">
                            <i class="fas fa-minus"></i> Retirer
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <div class="inventory-actions">
                <button class="btn btn-primary" onclick="admin.bulkAddStock('${product.id}')">
                    <i class="fas fa-plus-circle"></i> Ajouter stock en masse
                </button>
                <button class="btn btn-warning" onclick="admin.markAsAvailable('${product.id}')">
                    <i class="fas fa-check"></i> Marquer comme disponible
                </button>
            </div>
        `;

        return html;
    }

    /**
     * Prompts the user to add stock for a specific variant.
     * @param {string} productId - The product ID.
     * @param {string} size - The variant size.
     * @param {string} color - The variant color.
     */
    addStockDialog(productId, size, color) {
        const quantity = prompt(`Quantité à ajouter pour ${size}/${color}:`, '10');
        if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
            ProductManager.addStock(productId, size, color, parseInt(quantity));
            this.loadProducts();
            this.showInventoryManager(productId);
            alert(`✅ Stock ajouté avec succès! (${quantity} articles)`);
        }
    }

    /**
     * Prompts the user to remove stock for a specific variant.
     * @param {string} productId - The product ID.
     * @param {string} size - The variant size.
     * @param {string} color - The variant color.
     */
    removeStockDialog(productId, size, color) {
        const currentStock = ProductManager.getStock(productId, size, color);
        const quantity = prompt(`Quantité à retirer pour ${size}/${color} (stock actuel: ${currentStock}):`, '0');
        if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
            const newQuantity = Math.max(0, currentStock - parseInt(quantity));
            const toRemove = currentStock - newQuantity;
            
            // Remove and re-add to set new value
            const products = ProductManager.getAllProducts();
            const product = products.find(p => p.id === productId);
            if (product && product.inventory) {
                const key = ProductManager.getInventoryKey(size, color);
                product.inventory[key].stock = newQuantity;
                localStorage.setItem('monalisa_products', JSON.stringify(products));
                this.loadProducts();
                this.showInventoryManager(productId);
                alert(`✅ Stock retiré avec succès! (${toRemove} articles)`);
            }
        }
    }

    /**
     * Adds stock to all variants of a product in bulk.
     * @param {string} productId - The product ID.
     */
    bulkAddStock(productId) {
        const quantity = prompt('Quantité à ajouter pour chaque variante:', '10');
        if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
            const product = this.products.find(p => p.id === productId);
            if (product && product.inventory) {
                Object.values(product.inventory).forEach(item => {
                    ProductManager.addStock(productId, item.size, item.color, parseInt(quantity));
                });
                this.loadProducts();
                this.showInventoryManager(productId);
                alert(`✅ Stock ajouté avec succès pour toutes les variantes!`);
            }
        }
    }

    /**
     * Marks all out-of-stock variants as available by adding 5 units.
     * @param {string} productId - The product ID.
     */
    markAsAvailable(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.inventory) {
            Object.values(product.inventory).forEach(item => {
                if (item.stock === 0) {
                    ProductManager.addStock(productId, item.size, item.color, 5);
                }
            });
            this.loadProducts();
            this.showInventoryManager(productId);
            alert(`✅ Produit marqué comme disponible!`);
        }
    }

    /**
     * Shows the profit report modal with overview, daily stats, and product breakdown.
     */
    showProfitReport() {
        const totalProfit = ProductManager.getTotalProfit();
        const todayProfit = ProductManager.getTodayProfit();
        const products = ProductManager.getAllProducts();
        const orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];

        // Calculate total inventory value
        let totalInventoryValue = 0;
        products.forEach(product => {
            if (product.inventory) {
                Object.values(product.inventory).forEach(item => {
                    totalInventoryValue += (item.costPrice || 0) * item.stock;
                });
            }
        });

        // Build sales log with date/time for each item sold
        let salesLogHtml = '';
        if (orders.length > 0) {
            // Flatten all items from all orders with timestamps
            const salesLog = [];
            orders.forEach(order => {
                const orderDate = new Date(order.timestamp);
                const dateStr = orderDate.toLocaleDateString('fr-FR');
                const timeStr = orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                
                order.items.forEach(item => {
                    const costPrice = this.getProductCostPrice(item.name, item.size, item.color);
                    const itemProfit = (item.price - costPrice) * item.quantity;
                    salesLog.push({
                        date: dateStr,
                        time: timeStr,
                        productName: item.name,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity,
                        sellingPrice: item.price,
                        costPrice: costPrice,
                        totalSale: item.price * item.quantity,
                        profit: itemProfit
                    });
                });
            });

            // Sort by most recent first
            salesLog.reverse();

            salesLogHtml = `
                <div class="sales-log">
                    <h4><i class="fas fa-receipt"></i> Historique des ventes (Date & Heure)</h4>
                    <table class="sales-log-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Heure</th>
                                <th>Produit</th>
                                <th>Taille</th>
                                <th>Couleur</th>
                                <th>Qté</th>
                                <th>Vente totale</th>
                                <th>Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${salesLog.map(sale => `
                                <tr>
                                    <td>${sale.date}</td>
                                    <td>${sale.time}</td>
                                    <td>${sale.productName}</td>
                                    <td>${sale.size}</td>
                                    <td>${sale.color}</td>
                                    <td>${sale.quantity}</td>
                                    <td>${Math.round(sale.totalSale)} MAD</td>
                                    <td class="profit-highlight">+${Math.round(sale.profit)} MAD</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            salesLogHtml = `
                <div class="sales-log empty">
                    <h4><i class="fas fa-receipt"></i> Historique des ventes</h4>
                    <p class="no-sales">Aucune vente enregistrée pour le moment.</p>
                </div>
            `;
        }

        const reportHtml = `
            <div class="profit-report-content">
                <div class="profit-report-header">
                    <h3><i class="fas fa-chart-pie"></i> Rapport de Profit</h3>
                    <button class="close-modal" onclick="this.closest('.profit-report-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profit-report-body">
                    <div class="profit-overview">
                        <h4><i class="fas fa-overview"></i> Vue d'ensemble</h4>
                        <div class="overview-grid">
                            <div class="overview-item">
                                <div class="overview-label">Chiffre d'affaires total</div>
                                <div class="overview-value">${Math.round(totalProfit.totalRevenue)} MAD</div>
                            </div>
                            <div class="overview-item">
                                <div class="overview-label">Coût total des marchandises</div>
                                <div class="overview-value">${Math.round(totalProfit.totalCost)} MAD</div>
                            </div>
                            <div class="overview-item highlight">
                                <div class="overview-label">Profit net</div>
                                <div class="overview-value">${Math.round(totalProfit.totalProfit)} MAD</div>
                            </div>
                            <div class="overview-item">
                                <div class="overview-label">Marge de profit moyenne</div>
                                <div class="overview-value">${totalProfit.profitMargin}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="today-profit">
                        <h4><i class="fas fa-calendar-day"></i> Aujourd'hui</h4>
                        <div class="today-grid">
                            <div class="today-item">
                                <div class="today-label">Ventes</div>
                                <div class="today-value">${Math.round(todayProfit.todayRevenue)} MAD</div>
                            </div>
                            <div class="today-item">
                                <div class="today-label">Coûts</div>
                                <div class="today-value">${Math.round(todayProfit.todayCost)} MAD</div>
                            </div>
                            <div class="today-item highlight">
                                <div class="today-label">Profit</div>
                                <div class="today-value">${Math.round(todayProfit.todayProfit)} MAD</div>
                            </div>
                        </div>
                    </div>

                    <div class="inventory-value">
                        <h4><i class="fas fa-warehouse"></i> Valeur de l'inventaire</h4>
                        <div class="inventory-value-display">
                            <span class="inventory-label">Stock actuel (coût d'achat)</span>
                            <span class="inventory-value">${Math.round(totalInventoryValue)} MAD</span>
                        </div>
                    </div>

                    <div class="product-breakdown">
                        <h4><i class="fas fa-list"></i> Détail par produit</h4>
                        <table class="product-profit-table">
                            <thead>
                                <tr>
                                    <th>Produit</th>
                                    <th>Ventes</th>
                                    <th>Coûts</th>
                                    <th>Profit</th>
                                    <th>Marge</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(product => {
                                    const profit = ProductManager.getProductProfit(product.id);
                                    return `
                                        <tr>
                                            <td>${product.name}</td>
                                            <td>${Math.round(profit.totalRevenue)} MAD</td>
                                            <td>${Math.round(profit.totalCost)} MAD</td>
                                            <td class="profit-highlight">${Math.round(profit.totalProfit)} MAD</td>
                                            <td>${profit.profitMargin}%</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    ${salesLogHtml}
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'profit-report-modal';
        modal.innerHTML = reportHtml;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    /**
     * Helper to get cost price for a product by name, size, and color.
     */
    getProductCostPrice(productName, size, color) {
        const product = ProductManager.getAllProducts().find(p => p.name === productName);
        if (!product || !product.inventory) return 0;
        const key = ProductManager.getInventoryKey(size, color);
        return product.inventory[key]?.costPrice || 0;
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if ProductManager is loaded
        if (typeof ProductManager === 'undefined') {
            alert('Error: Required scripts not loaded. Please check console for details.');
            return;
        }

        window.admin = new AdminPanel();
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        alert('Error initializing admin panel. Please check console for details (F12).');
    }
});

// Export for use in other files
window.AdminPanel = AdminPanel;
// Admin Panel Functionality
class AdminPanel {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || {};
        this.isLoggedIn = sessionStorage.getItem('monalisa_admin_logged_in') === 'true';
        this.adminPassword = 'monalisa2024'; // Change this password
        this.currentProductId = null; // For editing existing products
        this.init();
    }

    init() {
        if (this.isLoggedIn) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
        this.bindEvents();
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Refresh orders
        document.getElementById('refreshOrders').addEventListener('click', () => {
            this.loadOrders();
        });

        // Clear all orders
        document.getElementById('clearAllOrders').addEventListener('click', () => {
            this.clearAllOrders();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterOrders(e.target.value);
        });

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Product management events
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showProductModal();
        });

        document.getElementById('closeProductModal').addEventListener('click', () => {
            this.hideProductModal();
        });

        document.getElementById('cancelProductBtn').addEventListener('click', () => {
            this.hideProductModal();
        });

        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        document.getElementById('addColorBtn').addEventListener('click', () => {
            this.addColorInput();
        });

        document.getElementById('addSizeBtn').addEventListener('click', () => {
            this.addSizeInput();
        });

        // Auto-refresh orders every 30 seconds
        setInterval(() => {
            if (this.isLoggedIn && document.querySelector('[data-tab="orders"]').classList.contains('active')) {
                this.loadOrders();
            }
        }, 30000);
    }

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

    handleLogout() {
        this.isLoggedIn = false;
        sessionStorage.removeItem('monalisa_admin_logged_in');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.loadOrders();
        this.updateStats();
    }

    loadOrders() {
        // Reload orders from localStorage
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        this.displayOrders();
        this.updateStats();
    }

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

    createOrderCard(order) {
        const orderDate = new Date(order.timestamp).toLocaleString('fr-FR');

        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Commande #${order.id}</div>
                    <div class="order-date">${orderDate}</div>
                </div>

                <div class="customer-info">
                    <h4><i class="fas fa-user"></i> Informations client</h4>
                    <div class="customer-details">
                        <div><i class="fas fa-user"></i> ${order.customer.name}</div>
                        <div><i class="fas fa-phone"></i> ${order.customer.phone}</div>
                        <div><i class="fas fa-map-marker-alt"></i> ${order.customer.address}</div>
                        ${order.customer.city ? `<div><i class="fas fa-city"></i> ${order.customer.city}</div>` : ''}
                    </div>
                    ${order.customer.notes ? `<div style="margin-top: 0.5rem; font-style: italic; color: #666;"><i class="fas fa-sticky-note"></i> ${order.customer.notes}</div>` : ''}
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

    updateStats() {
        const totalOrders = this.orders.length;
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order =>
            new Date(order.timestamp).toDateString() === today
        ).length;

        const totalRevenue = this.orders.reduce((sum, order) => sum + order.subtotal, 0);
        const deliveryRevenue = this.orders.reduce((sum, order) => sum + order.deliveryCost, 0);

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('todayOrders').textContent = todayOrders;
        document.getElementById('totalRevenue').textContent = `${totalRevenue} MAD`;
        document.getElementById('deliveryRevenue').textContent = `${deliveryRevenue} MAD`;
    }

    filterOrders(status) {
        // For now, we'll just show all orders since we don't have status tracking
        // This can be enhanced later
        this.displayOrders();
    }

    contactCustomer(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const message = `Bonjour ${order.customer.name},\n\nConcernant votre commande #${order.id} d'un montant de ${order.total} MAD.\n\nNous vous confirmons la réception de votre commande et nous vous contacterons bientôt pour organiser la livraison.\n\nMerci de votre confiance!\n\nMonalisa Store`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = order.customer.phone.replace(/[^0-9]/g, '');
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');
    }

    deleteOrder(orderId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) {
            this.orders = this.orders.filter(order => order.id !== orderId);
            localStorage.setItem('monalisa_orders', JSON.stringify(this.orders));
            this.loadOrders();
        }
    }

    clearAllOrders() {
        if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES les commandes? Cette action est irréversible.')) {
            this.orders = [];
            localStorage.setItem('monalisa_orders', JSON.stringify(this.orders));
            this.loadOrders();
        }
    }

    // Method to add new order (called from main site)
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

        // Update inventory after order
        const products = JSON.parse(localStorage.getItem('monalisa_products')) || {};
        orderData.items.forEach(item => {
            const productId = item.id;
            const category = item.category;

            if (products[category] && products[category][productId]) {
                const product = products[category][productId];

                // Update inventory
                if (!product.inventory) product.inventory = {};

                const inventoryKey = `${item.size}_${item.color}`;
                if (product.inventory[inventoryKey]) {
                    product.inventory[inventoryKey].quantity = Math.max(0, product.inventory[inventoryKey].quantity - item.quantity);
                    product.inventory[inventoryKey].sold = (product.inventory[inventoryKey].sold || 0) + item.quantity;
                }
            }
        });

        localStorage.setItem('monalisa_products', JSON.stringify(products));
        return newOrder.id;
    }

    // Tab switching functionality
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.orders-section, .products-section, .analytics-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        const sectionClass = tabName === 'orders' ? '.orders-section' :
                           tabName === 'products' ? '.products-section' : '.analytics-section';
        document.querySelector(sectionClass).classList.remove('hidden');

        // Load data for the selected tab
        switch (tabName) {
            case 'orders':
                this.loadOrders();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    // Product management methods
    loadProducts() {
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || {};
        this.displayProducts();
    }

    displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const allProducts = [];

        Object.entries(this.products).forEach(([category, categoryProducts]) => {
            categoryProducts.forEach(product => {
                product.categoryName = category;
                allProducts.push(product);

                // Calculate total inventory and sold quantities
                let totalStock = 0;
                let totalSold = 0;
                const margins = [];

                if (product.inventory) {
                    Object.values(product.inventory).forEach(variant => {
                        totalStock += variant.quantity || 0;
                        totalSold += variant.sold || 0;
                        if (variant.cost) {
                            margins.push(((product.price - variant.cost) / product.price) * 100);
                        }
                    });
                }

                product.totalStock = totalStock;
                product.totalSold = totalSold;
                product.averageMargin = margins.length > 0 ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
            });
        });

        if (allProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>Aucun produit ajouté pour le moment</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = allProducts.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const marginClass = product.averageMargin >= 50 ? 'high-margin' :
                           product.averageMargin >= 30 ? 'medium-margin' : 'low-margin';

        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image || 'https://via.placeholder.com/150x200/E91E63/FFFFFF?text=No+Image'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-details">
                        <p><strong>Prix:</strong> ${product.price} MAD</p>
                        <p><strong>Stock total:</strong> ${product.totalStock}</p>
                        <p><strong>Vendu:</strong> ${product.totalSold}</p>
                        <p><strong>Marge moyenne:</strong> <span class="margin-${marginClass}">${product.averageMargin.toFixed(1)}%</span></p>
                    </div>
                    <div class="product-actions">
                        <button class="edit-btn" onclick="admin.editProduct('${product.categoryName}', '${product.id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="delete-btn" onclick="admin.deleteProduct('${product.categoryName}', '${product.id}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showProductModal(productId = null) {
        this.currentProductId = productId;
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const modalTitle = document.getElementById('modalTitle');

        // Reset form
        form.reset();

        if (productId) {
            modalTitle.textContent = 'Modifier le Produit';
            // Load existing product data (would need category and id)
            // For now, just show the modal
        } else {
            modalTitle.textContent = 'Ajouter un Produit';
        }

        modal.classList.remove('hidden');
    }

    hideProductModal() {
        document.getElementById('productModal').classList.add('hidden');
        this.currentProductId = null;
    }

    saveProduct() {
        const formData = new FormData(document.getElementById('productForm'));

        // Collect colors and sizes
        const colors = [];
        document.querySelectorAll('.color-input-group').forEach(group => {
            const colorInput = group.querySelector('.color-input');
            const quantityInput = group.querySelector('.size-quantity-input');
            if (colorInput.value.trim()) {
                colors.push({
                    color: colorInput.value.trim(),
                    quantity: parseInt(quantityInput.value) || 0
                });
            }
        });

        const sizes = [];
        document.querySelectorAll('.size-input-group').forEach(group => {
            const sizeInput = group.querySelector('.size-input');
            const quantityInput = group.querySelector('.size-quantity-input');
            if (sizeInput.value.trim()) {
                sizes.push({
                    size: sizeInput.value.trim(),
                    quantity: parseInt(quantityInput.value) || 0
                });
            }
        });

        const productData = {
            id: this.currentProductId || `product_${Date.now()}`,
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            cost: parseFloat(document.getElementById('productCost').value),
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value,
            colors: colors.map(c => c.color),
            sizes: sizes.map(s => s.size),
            inventory: {}
        };

        // Initialize inventory for all color/size combinations
        colors.forEach(colorData => {
            sizes.forEach(sizeData => {
                const inventoryKey = `${sizeData.size}_${colorData.color}`;
                productData.inventory[inventoryKey] = {
                    quantity: Math.max(colorData.quantity, sizeData.quantity), // For simplicity
                    sold: 0,
                    cost: productData.cost
                };
            });
        });

        const category = productData.category;
        if (!this.products[category]) {
            this.products[category] = [];
        }

        if (this.currentProductId) {
            // Update existing product
            const index = this.products[category].findIndex(p => p.id === this.currentProductId);
            if (index !== -1) {
                this.products[category][index] = productData;
            }
        } else {
            // Add new product
            this.products[category].push(productData);
        }

        localStorage.setItem('monalisa_products', JSON.stringify(this.products));
        this.hideProductModal();
        this.loadProducts();
    }

    editProduct(category, productId) {
        const product = this.products[category]?.find(p => p.id === productId);
        if (!product) return;

        // Populate form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCost').value = product.cost;
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescription').value = product.description || '';

        // Clear existing inputs
        document.getElementById('colorInputs').innerHTML = '';
        document.getElementById('sizeInputs').innerHTML = '';

        // Get unique colors and sizes from inventory
        const colors = new Set();
        const colorQuantities = {};
        const sizes = new Set();
        const sizeQuantities = {};

        Object.entries(product.inventory || {}).forEach(([key, data]) => {
            const [size, color] = key.split('_');
            colors.add(color);
            sizes.add(size);

            if (!colorQuantities[color]) colorQuantities[color] = 0;
            if (!sizeQuantities[size]) sizeQuantities[size] = 0;

            colorQuantities[color] = Math.max(colorQuantities[color] || 0, data.quantity);
            sizeQuantities[size] = Math.max(sizeQuantities[size] || 0, data.quantity);
        });

        // Add color inputs
        colors.forEach(color => {
            this.addColorInput(color, colorQuantities[color]);
        });

        // Add size inputs
        sizes.forEach(size => {
            this.addSizeInput(size, sizeQuantities[size]);
        });

        if (colors.size === 0) {
            this.addColorInput('', 0);
        }

        if (sizes.size === 0) {
            this.addSizeInput('', 0);
        }

        this.showProductModal(productId);
    }

    deleteProduct(category, productId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
            if (this.products[category]) {
                this.products[category] = this.products[category].filter(p => p.id !== productId);
                localStorage.setItem('monalisa_products', JSON.stringify(this.products));
                this.loadProducts();
            }
        }
    }

    addColorInput(color = '', quantity = 0) {
        const colorInputs = document.getElementById('colorInputs');
        const colorInputGroup = document.createElement('div');
        colorInputGroup.className = 'color-input-group';

        colorInputGroup.innerHTML = `
            <input type="text" placeholder="Couleur" class="color-input" value="${color}">
            <input type="number" placeholder="Quantité" min="0" class="size-quantity-input" value="${quantity}">
            <button type="button" class="remove-color-btn">
                <i class="fas fa-minus"></i>
            </button>
        `;

        colorInputs.appendChild(colorInputGroup);

        // Add remove event
        colorInputGroup.querySelector('.remove-color-btn').addEventListener('click', () => {
            colorInputGroup.remove();
        });
    }

    addSizeInput(size = '', quantity = 0) {
        const sizeInputs = document.getElementById('sizeInputs');
        const sizeInputGroup = document.createElement('div');
        sizeInputGroup.className = 'size-input-group';

        sizeInputGroup.innerHTML = `
            <input type="text" placeholder="Taille" class="size-input" value="${size}">
            <input type="number" placeholder="Quantité" min="0" class="size-quantity-input" value="${quantity}">
            <button type="button" class="remove-size-btn">
                <i class="fas fa-minus"></i>
            </button>
        `;

        sizeInputs.appendChild(sizeInputGroup);

        // Add remove event
        sizeInputGroup.querySelector('.remove-size-btn').addEventListener('click', () => {
            sizeInputGroup.remove();
        });
    }

    // Analytics methods
    loadAnalytics() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || {};
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];

        this.updateSalesByProductChart();
        this.updateInventoryStatus();
        this.updateProductMargins();
    }

    updateSalesByProductChart() {
        const salesByProduct = {};
        const profitByDay = {};

        this.orders.forEach(order => {
            order.items.forEach(item => {
                if (!salesByProduct[item.name]) {
                    salesByProduct[item.name] = { quantity: 0, revenue: 0, cost: 0 };
                }
                salesByProduct[item.name].quantity += item.quantity;
                salesByProduct[item.name].revenue += item.price * item.quantity;
            });
        });

        const chartContainer = document.getElementById('salesByProductChart');
        chartContainer.innerHTML = Object.entries(salesByProduct)
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 10)
            .map(([name, data]) => `
                <div class="chart-row">
                    <span class="chart-label">${name}</span>
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="width: ${(data.quantity / Math.max(...Object.values(salesByProduct).map(d => d.quantity))) * 100}%"></div>
                        <span class="chart-value">${data.quantity} vendus</span>
                    </div>
                </div>
            `).join('') || '<p>Aucune vente pour le moment</p>';
    }

    updateInventoryStatus() {
        const inventoryContainer = document.getElementById('inventoryStatus');
        const lowStockProducts = [];

        Object.entries(this.products).forEach(([category, categoryProducts]) => {
            categoryProducts.forEach(product => {
                let totalStock = 0;
                let lowStockVariants = [];

                if (product.inventory) {
                    Object.entries(product.inventory).forEach(([key, data]) => {
                        totalStock += data.quantity;
                        if (data.quantity <= 5) { // Low stock threshold
                            const [size, color] = key.split('_');
                            lowStockVariants.push(`${size}/${color}: ${data.quantity}`);
                        }
                    });
                }

                if (lowStockVariants.length > 0) {
                    lowStockProducts.push({
                        name: product.name,
                        variants: lowStockVariants,
                        totalStock: totalStock
                    });
                }
            });
        });

        inventoryContainer.innerHTML = lowStockProducts.length > 0
            ? lowStockProducts.map(product => `
                <div class="inventory-item">
                    <h4>${product.name}</h4>
                    <ul>
                        ${product.variants.map(variant => `<li style="color: ${variant.includes('0') ? 'red' : 'orange'}">${variant}</li>`).join('')}
                    </ul>
                    <p><strong>Stock total: ${product.totalStock}</strong></p>
                </div>
            `).join('')
            : '<p>Tous les produits ont un stock suffisant</p>';
    }

    updateProductMargins() {
        const marginsContainer = document.getElementById('productMargins');

        const productMargins = [];
        Object.entries(this.products).forEach(([category, categoryProducts]) => {
            categoryProducts.forEach(product => {
                if (product.inventory && Object.keys(product.inventory).length > 0) {
                    const margins = Object.values(product.inventory).map(data =>
                        data.cost ? ((product.price - data.cost) / product.price) * 100 : 0
                    );
                    const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;

                    productMargins.push({
                        name: product.name,
                        margin: avgMargin,
                        products
                    });
                }
            });
        });

        productMargins.sort((a, b) => b.margin - a.margin);

        marginsContainer.innerHTML = productMargins.slice(0, 10).map(product => `
            <div class="margin-item">
                <span class="margin-product-name">${product.name}</span>
                <span class="margin-value margin-${product.margin >= 50 ? 'high' : product.margin >= 30 ? 'medium' : 'low'}">
                    ${product.margin.toFixed(1)}%
                </span>
            </div>
        `).join('') || '<p>Aucune donnée de marge disponible</p>';
    }
}

// Initialize admin panel
const admin = new AdminPanel();

// Export for use in other files
window.AdminPanel = AdminPanel;
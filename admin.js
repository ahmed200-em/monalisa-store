// Admin Panel Functionality
class AdminPanel {
    constructor() {
        console.log('AdminPanel constructor called');
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || {};
        this.isLoggedIn = sessionStorage.getItem('monalisa_admin_logged_in') === 'true';
        this.adminPassword = 'monalisa2024'; // Change this password
        this.currentProductId = null; // For editing existing products
        console.log('isLoggedIn:', this.isLoggedIn);
        this.init();
    }

    init() {
        console.log('init called, isLoggedIn:', this.isLoggedIn);
        if (this.isLoggedIn) {
            console.log('Showing dashboard');
            this.showDashboard();
        } else {
            console.log('Showing login');
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
        console.log('Binding tab events');
        document.querySelectorAll('.nav-tab').forEach(tab => {
            console.log('Found tab:', tab.dataset.tab);
            tab.addEventListener('click', (e) => {
                console.log('Clicked tab:', e.target.dataset.tab);
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Product management events
        const addProductBtn = document.getElementById('addProductBtn');
        console.log('Looking for addProductBtn:', addProductBtn);
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showProductModal();
            });
        } else {
            console.log('⚠️ addProductBtn not found - creating fallback access');
            // Add fallback access via console
            window.manualAddProduct = () => {
                this.showProductModal();
                console.log('Manual product modal opened');
            };
            console.log('Use manualAddProduct() in console to add products');
        }

        // Initialize simple variant system
        this.productVariants = [];

        // Modal events
        ['closeProductModal', 'cancelProductBtn'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) {
                elem.addEventListener('click', () => {
                    this.hideProductModal();
                });
            }
        });

        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        ['addColorBtn', 'addSizeBtn'].forEach(id => {
            const elem = document.getElementById(id);
            if (elem) {
                elem.addEventListener('click', () => {
                    if (id === 'addColorBtn') this.addColorInput();
                    else this.addSizeInput();
                });
            }
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
        console.log('showDashboard called');
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('adminDashboard');

        if (loginScreen && dashboard) {
            loginScreen.style.display = 'none';
            dashboard.style.display = 'block';
            console.log('Dashboard container shown');

            // Make sure stats section is visible
            const statsSection = document.querySelector('.stats-section');
            if (statsSection) {
                statsSection.style.display = 'block';
                console.log('Stats section shown');
            }

            // And the orders section
            const ordersSection = document.querySelector('.orders-section');
            if (ordersSection) {
                ordersSection.style.display = 'block';
                console.log('Orders section shown');
            }

            // Load orders data and update stats
            this.loadOrders();
            this.updateStats();

            // Ensure orders tab is default and tabs work
            console.log('About to switch to orders tab');
            this.switchTab('orders');
            console.log('Orders tab should be active now');
        } else {
            console.error('Could not find loginScreen or adminDashboard elements');
        }
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
        console.log('switchTab called with:', tabName);

        // Update active tab button
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('Tab button activated:', tabName);
        }

        // Always show stats section
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            statsSection.style.display = 'block';
        }

        // Hide all main sections using inline styles
        document.querySelectorAll('.orders-section, .products-section, .analytics-section').forEach(section => {
            section.style.display = 'none';
            console.log('Hidden section:', section.className);
        });

        // Show selected section using inline styles
        const sectionClass = tabName === 'orders' ? '.orders-section' :
                           tabName === 'products' ? '.products-section' : '.analytics-section';
        const section = document.querySelector(sectionClass);
        console.log('Looking for section:', sectionClass, 'Found:', !!section);

        if (section) {
            section.style.display = 'block';
            console.log('✅ Section NOW VISIBLE:', sectionClass);
        } else {
            console.log('❌ Could not find section:', sectionClass);
            // Let's list all sections we can find
            console.log('Available sections:', document.querySelectorAll('section'));
            document.querySelectorAll('section').forEach((s, i) => {
                console.log('Section', i, ':', s.className, 'Display:', s.style.display);
            });
        }

        // Load data for the selected tab
        switch (tabName) {
            case 'orders':
                console.log('🔄 Loading orders...');
                this.loadOrders();
                break;
            case 'products':
                console.log('🔄 Loading products...');
                this.loadProducts();
                break;
            case 'analytics':
                console.log('🔄 Loading analytics...');
                this.loadAnalytics();
                break;
        }
    }

    // Product management methods
    loadProducts() {
        console.log('🔄 loadProducts called');
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || {};
        console.log('Products loaded:', Object.keys(this.products));
        this.displayProducts();
    }

    displayProducts() {
        console.log('🔄 displayProducts called');
        const productsGrid = document.getElementById('productsGrid');
        console.log('productsGrid found:', !!productsGrid);

        if (!productsGrid) {
            console.log('❌ productsGrid element not found');
            return;
        }

        const allProducts = [];
        let totalProducts = 0;

        Object.entries(this.products).forEach(([category, categoryProducts]) => {
            totalProducts += categoryProducts.length;
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

        console.log('Total products found:', totalProducts);

        if (allProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>Aucun produit ajouté pour le moment</p>
                    <p><strong>Debug Info:</strong> ${Object.keys(this.products).length} categories loaded</p>
                    <button onclick="window.manualAddProduct()" class="add-product-btn" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Ajouter Produit (Console Fallback)
                    </button>
                </div>
            `;
            console.log('✅ No products message displayed');
            return;
        }

        productsGrid.innerHTML = allProducts.map(product => this.createProductCard(product)).join('');
        console.log('✅ Product cards displayed:', allProducts.length);
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

        // Reset variant system
        this.productVariants = [];
        this.updateVariantsDisplay();
        this.updateTotalStock();

        if (productId) {
            modalTitle.textContent = 'Modifier le Produit';
            // TODO: Load existing product data and variants
        } else {
            modalTitle.textContent = 'Ajouter un Produit';
        }

        modal.classList.remove('hidden');
    }

    // Simple Variant Management Methods
    addVariant() {
        const colorSelect = document.getElementById('variantColor');
        const sizeSelect = document.getElementById('variantSize');
        const quantityInput = document.getElementById('variantQuantity');

        const color = colorSelect.value.trim();
        const size = sizeSelect.value.trim();
        const quantity = parseInt(quantityInput.value) || 0;

        if (!color || !size) {
            alert('Veuillez sélectionner une couleur et une taille!');
            return;
        }

        if (quantity <= 0) {
            alert('Veuillez entrer une quantité supérieure à 0!');
            return;
        }

        // Check if this variant already exists
        const existingVariant = this.productVariants.find(v =>
            v.color === color && v.size === size
        );

        if (existingVariant) {
            existingVariant.quantity += quantity;
            console.log('✅ Updated existing variant quantity:', color, size, 'to', existingVariant.quantity);
        } else {
            this.productVariants.push({
                color: color,
                size: size,
                quantity: quantity
            });
            console.log('✅ Added new variant:', color, size, 'x', quantity);
        }

        // Reset form
        colorSelect.value = '';
        sizeSelect.value = '';
        quantityInput.value = '';

        this.updateVariantsDisplay();
        this.updateTotalStock();
    }

    removeVariant(color, size) {
        this.productVariants = this.productVariants.filter(v =>
            !(v.color === color && v.size === size)
        );
        console.log('❌ Removed variant:', color, size);
        this.updateVariantsDisplay();
        this.updateTotalStock();
    }

    updateVariantsDisplay() {
        const container = document.getElementById('variantsContainer');

        if (this.productVariants.length === 0) {
            container.innerHTML = '<span style="color: #999; font-style: italic;">Aucune variante ajoutée</span>';
            return;
        }

        container.innerHTML = this.productVariants.map(variant => `
            <div class="variant-tag" style="
                background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 8px;">
                <span>${variant.color} ${variant.size} (${variant.quantity})</span>
                <button type="button" onclick="admin.removeVariant('${variant.color}', '${variant.size}')"
                    style="background: none; border: none; color: white; cursor: pointer; padding: 2px;">
                    <i class="fas fa-times" style="font-size: 0.7rem;"></i>
                </button>
            </div>
        `).join('');
    }

    updateTotalStock() {
        const totalStock = this.productVariants.reduce((sum, variant) => sum + variant.quantity, 0);
        const displayElement = document.getElementById('totalStockCount');
        if (displayElement) {
            displayElement.textContent = totalStock;
        }
    }

    hideProductModal() {
        document.getElementById('productModal').classList.add('hidden');
        this.currentProductId = null;
    }

    saveProduct() {
        if (this.productVariants.length === 0) {
            alert('Veuillez ajouter au moins une variante!');
            return;
        }

        const productData = {
            id: this.currentProductId || `product_${Date.now()}`,
            name: document.getElementById('productName').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            cost: parseFloat(document.getElementById('productCost').value),
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value.trim(),
            colors: [...new Set(this.productVariants.map(v => v.color))], // Extract unique colors
            sizes: [...new Set(this.productVariants.map(v => v.size))], // Extract unique sizes
            inventory: {}
        };

        // Validate required fields
        if (!productData.name || !productData.price || !productData.cost || !productData.category) {
            alert('Veuillez remplir tous les champs requis!');
            return;
        }

        // Convert variants to inventory format
        this.productVariants.forEach(variant => {
            const inventoryKey = `${variant.size}_${variant.color}`;
            productData.inventory[inventoryKey] = {
                quantity: variant.quantity,
                sold: 0,
                cost: productData.cost
            };
        });

        const totalStock = this.productVariants.reduce((sum, v) => sum + v.quantity, 0);
        console.log('💰 Saved product with', this.productVariants.length, 'variants =', totalStock, 'total stock');

        // Save to products storage
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

        // Trigger store refresh
        console.log('💡 Product saved! Triggering store refresh...');
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({ type: 'PRODUCTS_UPDATED' }, '*');
        }

        if (typeof productDisplay !== 'undefined') {
            console.log('🔄 Updating local product display...');
            setTimeout(() => {
                productDisplay.displayProducts();
            }, 500);
        }

        alert(`Produit "${productData.name}" sauvegardé avec succès!\nVariants: ${this.productVariants.length}\nStock total: ${totalStock} pièces`);
    }

    editProduct(category, productId) {
        const product = this.products[category]?.find(p => p.id === productId);
        if (!product) {
            alert('Produit introuvable!');
            return;
        }

        console.log('✏️ Editing product:', product.name);

        // Populate form with existing product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCost').value = product.cost;
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescription').value = product.description || '';

        // Convert inventory back to variants format
        this.productVariants = [];
        if (product.inventory) {
            Object.entries(product.inventory).forEach(([key, data]) => {
                const [size, color] = key.split('_');
                this.productVariants.push({
                    color: color,
                    size: size,
                    quantity: data.quantity || 0
                });
            });
        }

        this.updateVariantsDisplay();
        this.updateTotalStock();
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

    // Bulk delete products with zero inventory
    deleteProductsWithoutInventory() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer tous les produits qui n\'ont pas de stock? Cette action est irréversible.')) {
            return;
        }

        let deletedCount = 0;
        const originalProducts = JSON.parse(JSON.stringify(this.products)); // Deep copy for logging

        Object.keys(this.products).forEach(category => {
            if (this.products[category]) {
                const originalCount = this.products[category].length;
                this.products[category] = this.products[category].filter(product => {
                    // Calculate total available inventory
                    let totalStock = 0;
                    if (product.inventory) {
                        Object.values(product.inventory).forEach(variant => {
                            const quantity = variant.quantity || 0;
                            const sold = variant.sold || 0;
                            totalStock += Math.max(0, quantity - sold);
                        });
                    }

                    // Keep product if it has inventory, otherwise delete it
                    return totalStock > 0;
                });

                const deletedInCategory = originalCount - this.products[category].length;
                if (deletedInCategory > 0) {
                    console.log(`🗑️ Deleted ${deletedInCategory} products in ${category} category`);
                }
                deletedCount += deletedInCategory;
            }
        });

        if (deletedCount > 0) {
            localStorage.setItem('monalisa_products', JSON.stringify(this.products));
            this.loadProducts();
            alert(`✅ Supprimé ${deletedCount} produit(s) qui n'avaient pas de stock.`);
            console.log(`✅ Bulk delete completed: ${deletedCount} product(s) removed`);

            // Update store products display
            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({ type: 'PRODUCTS_UPDATED' }, '*');
            }

            if (typeof productDisplay !== 'undefined') {
                setTimeout(() => {
                    productDisplay.displayProducts();
                }, 500);
            }
        } else {
            alert('Aucun produit sans stock trouvé.');
            console.log('ℹ️ No products found with zero inventory');
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
        console.log('🔄 loadAnalytics called');
        this.updateAnalytics();
    }

    updateAnalytics() {
        console.log('🔄 updateAnalytics called');
        this.products = JSON.parse(localStorage.getItem('monalisa_products')) || {};
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];

        console.log('Analytics data - Products:', Object.keys(this.products).length, 'Orders:', this.orders.length);

        this.updateSalesByProductChart();
        this.updateInventoryStatus();
        this.updateProductMargins();

        console.log('✅ Analytics updated');
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

// Test simple variant system
window.testVariantSystem = () => {
    console.log('🧪 Testing simple variant system...');

    // Open admin modal
    admin.showProductModal();

    const colorSelect = document.getElementById('variantColor');
    const sizeSelect = document.getElementById('variantSize');
    const quantityInput = document.getElementById('variantQuantity');

    if (colorSelect && sizeSelect && quantityInput) {
        // Add some test variants
        console.log('Adding test variants...');

        // Noir M - 10 pieces
        colorSelect.value = 'Noir';
        sizeSelect.value = 'M';
        quantityInput.value = '10';
        admin.addVariant();

        // Rouge S - 5 pieces
        colorSelect.value = 'Rouge';
        sizeSelect.value = 'S';
        quantityInput.value = '5';
        admin.addVariant();

        // Bleu L - 8 pieces
        colorSelect.value = 'Bleu';
        sizeSelect.value = 'L';
        quantityInput.value = '8';
        admin.addVariant();

        console.log('✅ Added 3 test variants:');
        console.log('• Noir M (10 pieces)');
        console.log('• Rouge S (5 pieces)');
        console.log('• Bleu L (8 pieces)');
        console.log('Total stock should show 23 pieces!');
    } else {
        console.log('❌ Could not find variant inputs');
    }

    return 'Variant system test completed - try adding variants manually!';
};

// Quick test product creation
window.testCreateProduct = () => {
    console.log('📝 Creating test product...');

    // Simulate form inputs
    document.getElementById('productName').value = 'T-Shirt Test';
    document.getElementById('productPrice').value = 150;
    document.getElementById('productCost').value = 100;
    document.getElementById('productCategory').value = 'shirts';
    document.getElementById('productDescription').value = 'Test product for inventory system';

    // Add a test variant
    const colorSelect = document.getElementById('variantColor');
    const sizeSelect = document.getElementById('variantSize');
    const quantityInput = document.getElementById('variantQuantity');

    if (colorSelect && sizeSelect && quantityInput) {
        colorSelect.value = 'Noir';
        sizeSelect.value = 'M';
        quantityInput.value = '25';
        admin.addVariant();

        console.log('✅ Added test variant: Noir M (25 pieces)');
        console.log('Click "Enregistrer" to save the test product!');
    }

    return 'Test product ready - add variants and click save!';
};

// Manual test functions for debug
window.testShowProducts = () => {
    console.log('Manual test - showing products section');
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.style.display = 'block';
        console.log('✅ Products section made visible');
        admin.loadProducts();
        return 'Products section shown';
    } else {
        console.log('❌ Products section not found');
        return 'Products section not found';
    }
};

window.testShowAnalytics = () => {
    console.log('Manual test - showing analytics section');
    const analyticsSection = document.querySelector('.analytics-section');
    if (analyticsSection) {
        analyticsSection.style.display = 'block';
        console.log('✅ Analytics section made visible');
        admin.loadAnalytics();
        return 'Analytics section shown';
    } else {
        console.log('❌ Analytics section not found');
        return 'Analytics section not found';
    }
};

window.testRefreshStoreProducts = () => {
    console.log('🔄 Manual test - refreshing store products display');
    if (typeof productDisplay !== 'undefined' && productDisplay.displayProducts) {
        productDisplay.displayProducts();
        console.log('✅ Store products refreshed');
        return 'Store products refreshed - check console for product counts';
    } else {
        console.log('❌ productDisplay not found');
        return 'productDisplay not found - make sure you\'re on the main store page, not admin';
    }
};

// Initialize admin panel
const admin = new AdminPanel();

// Export for use in other files
window.AdminPanel = AdminPanel;
window.ProductManager = ProductManager || { getProductById: function(id) { return null; } };
// Admin Panel Functionality
class AdminPanel {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        this.isLoggedIn = sessionStorage.getItem('monalisa_admin_logged_in') === 'true';
        this.adminPassword = 'monalisa2024'; // Change this password
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

        // Auto-refresh orders every 30 seconds
        setInterval(() => {
            if (this.isLoggedIn) {
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

        return newOrder.id;
    }
}

// Initialize admin panel
const admin = new AdminPanel();

// Export for use in other files
window.AdminPanel = AdminPanel;
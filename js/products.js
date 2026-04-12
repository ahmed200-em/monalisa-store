/**
 * ProductManager - Handles all product data operations
 * Stores and retrieves data from browser localStorage
 * Manages products, inventory, stock levels, and profit calculations
 */
const ProductManager = {
    /**
     * Generate default inventory structure
     * Creates stock entries for every size/color combination
     * @param {Array} sizes - Array of available sizes
     * @param {Array} colors - Array of available colors
     * @param {number} defaultStock - Initial stock quantity per variant (default: 10)
     * @param {number} costPrice - Cost price per unit for profit tracking
     * @returns {Object} Inventory object with all size/color combinations
     */
    generateDefaultInventory(sizes, colors, defaultStock = 10, costPrice = 0) {
        const inventory = {};
        // Create inventory entry for each size/color combination
        sizes.forEach(size => {
            colors.forEach(color => {
                const key = `${size}_${color}`; // e.g., "S_Blue"
                inventory[key] = {
                    size: size,
                    color: color,
                    stock: defaultStock,
                    reserved: 0,
                    costPrice: costPrice // Cost price per unit for profit calculation
                };
            });
        });
        return inventory;
    },

    /**
     * Calculate profit for a single sale transaction
     * @param {string} productId - Product identifier
     * @param {string} size - Size of item sold
     * @param {string} color - Color of item sold
     * @param {number} quantity - Quantity sold
     * @param {number} sellingPrice - Sale price per unit
     * @returns {Object} Profit breakdown including revenue, cost, and margin
     */
    calculateProfit(productId, size, color, quantity, sellingPrice) {
        const product = this.getProductById(productId);
        if (!product || !product.inventory) return { revenue: 0, cost: 0, profit: 0 };

        const key = this.getInventoryKey(size, color);
        const costPrice = product.inventory[key]?.costPrice || 0;

        const revenue = sellingPrice * quantity;
        const cost = costPrice * quantity;
        const profit = revenue - cost;

        return {
            revenue: revenue,
            cost: cost,
            profit: profit,
            costPrice: costPrice,
            sellingPrice: sellingPrice,
            quantity: quantity,
            profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0
        };
    },

    /**
     * Calculate total profit for a specific product across all orders
     * @param {string} productId - Product identifier
     * @returns {Object} Total profit metrics for the product
     */
    getProductProfit(productId) {
        const product = this.getProductById(productId);
        if (!product || !product.inventory) return { totalRevenue: 0, totalCost: 0, totalProfit: 0 };

        // Get all orders from localStorage
        const orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;

        // Iterate through all orders and match product by name and specs
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.name === product.name && item.size && item.color) {
                    const key = this.getInventoryKey(item.size, item.color);
                    const costPrice = product.inventory[key]?.costPrice || 0;

                    const itemRevenue = item.price * item.quantity;
                    const itemCost = costPrice * item.quantity;
                    const itemProfit = itemRevenue - itemCost;

                    totalRevenue += itemRevenue;
                    totalCost += itemCost;
                    totalProfit += itemProfit;
                }
            });
        });

        return {
            totalRevenue: totalRevenue,
            totalCost: totalCost,
            totalProfit: totalProfit,
            profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
        };
    },

    /**
     * Calculate total profit across all products
     * @returns {Object} Aggregate profit metrics for entire store
     */
    getTotalProfit() {
        const products = this.getAllProducts();
        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;

        // Sum profits from each product
        products.forEach(product => {
            const profit = this.getProductProfit(product.id);
            totalRevenue += profit.totalRevenue;
            totalCost += profit.totalCost;
            totalProfit += profit.totalProfit;
        });

        return {
            totalRevenue: totalRevenue,
            totalCost: totalCost,
            totalProfit: totalProfit,
            profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
        };
    },

    /**
     * Get profit for today's sales only
     * @returns {Object} Today's revenue, cost, and profit
     */
    getTodayProfit() {
        const today = new Date().toDateString(); // Get today's date
        const orders = JSON.parse(localStorage.getItem('monalisa_orders')) || [];
        const products = this.getAllProducts();

        let todayRevenue = 0;
        let todayCost = 0;
        let todayProfit = 0;

        // Filter orders placed today
        orders.forEach(order => {
            if (new Date(order.timestamp).toDateString() === today) {
                order.items.forEach(item => {
                    const product = products.find(p => p.name === item.name);
                    if (product && product.inventory && item.size && item.color) {
                        const key = this.getInventoryKey(item.size, item.color);
                        const costPrice = product.inventory[key]?.costPrice || 0;

                        const itemRevenue = item.price * item.quantity;
                        const itemCost = costPrice * item.quantity;
                        const itemProfit = itemRevenue - itemCost;

                        todayRevenue += itemRevenue;
                        todayCost += itemCost;
                        todayProfit += itemProfit;
                    }
                });
            }
        });

        return {
            todayRevenue: todayRevenue,
            todayCost: todayCost,
            todayProfit: todayProfit
        };
    },

    /**
     * Generate inventory key from size and color
     * @param {string} size - Item size
     * @param {string} color - Item color
     * @returns {string} Formatted key (e.g., "S_Blue")
     */
    getInventoryKey(size, color) {
        return `${size}_${color}`;
    },

    /**
     * Get available stock for a specific product variant
     * @param {string} productId - Product identifier
     * @param {string} size - Item size
     * @param {string} color - Item color
     * @returns {number} Available stock quantity (0 if not found)
     */
    getStock(productId, size, color) {
        const product = this.getProductById(productId);
        if (!product || !product.inventory) return 0;

        const key = this.getInventoryKey(size, color);
        return product.inventory[key]?.stock || 0;
    },

    /**
     * Deduct stock when a product is sold
     * @param {string} productId - Product identifier
     * @param {string} size - Size sold
     * @param {string} color - Color sold
     * @param {number} quantity - Quantity to deduct
     * @returns {boolean} True if successful, false if insufficient stock
     */
    deductStock(productId, size, color, quantity) {
        const products = this.getAllProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) return false; // Product not found

        const product = products[productIndex];
        // Create inventory structure if it doesn't exist
        if (!product.inventory) {
            product.inventory = this.generateDefaultInventory(product.sizes, product.colors, 10);
        }

        const key = this.getInventoryKey(size, color);
        // Create variant entry if it doesn't exist
        if (!product.inventory[key]) {
            product.inventory[key] = {
                size: size,
                color: color,
                stock: 0,
                reserved: 0
            };
        }

        // Check if enough stock is available
        if (product.inventory[key].stock < quantity) {
            return false; // Not enough stock
        }

        // Deduct stock and save
        product.inventory[key].stock -= quantity;
        products[productIndex] = product;

        localStorage.setItem('monalisa_products', JSON.stringify(products));
        return true;
    },

    /**
     * Add stock for a product variant (restocking)
     * @param {string} productId - Product identifier
     * @param {string} size - Size to restock
     * @param {string} color - Color to restock
     * @param {number} quantity - Quantity to add
     * @returns {boolean} True if successful, false if product not found
     */
    addStock(productId, size, color, quantity) {
        const products = this.getAllProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) return false;

        const product = products[productIndex];
        // Create inventory structure if it doesn't exist
        if (!product.inventory) {
            product.inventory = this.generateDefaultInventory(product.sizes, product.colors, 0);
        }

        const key = this.getInventoryKey(size, color);
        // Create variant entry if it doesn't exist
        if (!product.inventory[key]) {
            product.inventory[key] = {
                size: size,
                color: color,
                stock: 0,
                reserved: 0
            };
        }

        // Add stock and save
        product.inventory[key].stock += quantity;
        products[productIndex] = product;

        localStorage.setItem('monalisa_products', JSON.stringify(products));
        return true;
    },

    /**
     * Check if all variants of a product are sold out
     * @param {string} productId - Product identifier
     * @returns {boolean} True if all variants have 0 or negative stock
     */
    isProductSoldOut(productId) {
        const product = this.getProductById(productId);
        if (!product || !product.inventory) return false;

        // Check if every variant has stock <= 0
        return Object.values(product.inventory).every(item => item.stock <= 0);
    },

    /**
     * Get total stock count across all variants of a product
     * @param {string} productId - Product identifier
     * @returns {number} Total stock quantity
     */
    getTotalStock(productId) {
        const product = this.getProductById(productId);
        if (!product || !product.inventory) return 0;

        // Sum stock from all variants
        return Object.values(product.inventory).reduce((total, item) => total + item.stock, 0);
    },

    /**
     * Remove all sold-out products from the active product list
     * @returns {number} Number of products removed
     */
    removeSoldOutProducts() {
        const products = this.getAllProducts();
        const activeProducts = products.filter(product => !this.isProductSoldOut(product.id));
        localStorage.setItem('monalisa_products', JSON.stringify(activeProducts));
        return products.length - activeProducts.length; // Return count of removed products
    },

    /**
     * Get products with low stock levels (for admin alerts)
     * @param {number} threshold - Stock level considered low (default: 3)
     * @returns {Array} Products with at least one variant below threshold
     */
    getLowStockProducts(threshold = 3) {
        const products = this.getAllProducts();
        return products.filter(product => {
            if (!product.inventory) return false;
            // Check if any variant has stock between 1 and threshold
            return Object.values(product.inventory).some(item => item.stock > 0 && item.stock <= threshold);
        });
    },

    /**
     * Get all products from localStorage
     * @returns {Array} Array of all product objects
     */
    getAllProducts() {
        return JSON.parse(localStorage.getItem('monalisa_products')) || [];
    },

    /**
     * Get products filtered by category
     * @param {string} category - Category name or 'all' for no filter
     * @param {boolean} includeSoldOut - Whether to include sold-out products
     * @returns {Array} Filtered product array
     */
    getProductsByCategory(category, includeSoldOut = false) {
        const allProducts = this.getAllProducts();
        let products = allProducts;

        // Filter by category if not 'all'
        if (category !== 'all') {
            products = products.filter(product => product.category === category);
        }

        // Exclude sold-out products unless explicitly requested
        if (!includeSoldOut) {
            products = products.filter(product => !this.isProductSoldOut(product.id));
        }

        return products;
    },

    /**
     * Get a single product by its ID
     * @param {string} productId - Product identifier
     * @returns {Object|undefined} Product object or undefined if not found
     */
    getProductById(productId) {
        const allProducts = this.getAllProducts();
        return allProducts.find(product => product.id === productId);
    },

    /**
     * Migrate old products (without inventory) to new inventory structure
     * Ensures backward compatibility when inventory feature is added
     * @returns {boolean} True if any products were migrated
     */
    migrateProductsWithInventory() {
        const products = this.getAllProducts();
        let migrated = false;

        products.forEach(product => {
            // Add inventory structure to products that don't have it
            if (!product.inventory && product.sizes && product.colors) {
                const costPrice = 0; // Default cost price, admin can update later
                product.inventory = this.generateDefaultInventory(product.sizes, product.colors, 10, costPrice);
                migrated = true;
            } else if (product.inventory) {
                // Ensure all inventory items have costPrice field
                Object.keys(product.inventory).forEach(key => {
                    if (typeof product.inventory[key].costPrice === 'undefined') {
                        product.inventory[key].costPrice = 0;
                        migrated = true;
                    }
                });
            }
        });

        // Save migrated products to localStorage
        if (migrated) {
            localStorage.setItem('monalisa_products', JSON.stringify(products));
        }

        return migrated;
    }
};

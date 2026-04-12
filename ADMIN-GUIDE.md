# Monalisa Store - Admin Dashboard Updates

## 🎉 What's New

Your Monalisa Store admin dashboard now has **full product management capabilities**! You can now:

### ✨ Features Added
### Test Admin Dashboard
1. Open `admin.html` in your browser
2. Login with: `monalisa2024`
3. You should see two tabs: "Commandes" and "Produits"
4. Click on "Produits" tab
5. You should see 6 sample products automatically loaded


1. **Product Management Tab**
   - Navigate between "Commandes" (Orders) and "Produits" (Products) tabs
   - Clean, intuitive interface for managing your store inventory

2. **Add New Products**
   - Click "Ajouter un produit" button
   - Fill in product details:
     - Product name
     - Price (MAD)
     - Category (Pants, Blouses, Shirts, Accessories, Handbags, Footwear, Perfumes, Pajamas)
     - Image URL
     - Description
     - Sizes (comma-separated)
     - Colors (comma-separated)

3. **Edit Existing Products**
   - Click "Modifier" on any product card
   - Update product information
   - Save changes

4. **Delete Products**
   - Click "Supprimer" on any product card
   - Confirm deletion
   - Product is permanently removed

5. **Dynamic Product Display**
   - Products automatically appear on your main website
   - Real-time updates when you add/edit/delete products
   - Beautiful product cards with images, prices, and color options

## 📁 Files Modified

### Admin Dashboard
- **admin.html** - Added product management section with form and grid
- **css/admin-styles.css** - New styles for product management UI
- **js/admin.js** - Product management functionality (add, edit, delete, display)

### Main Website
- **js/products.js** - Now loads products from localStorage instead of hardcoded data
- **js/cart.js** - Updated to use ProductManager for dynamic product loading
- **index.html** - Removed hardcoded product cards, now loads dynamically

## 🚀 How to Use

### First Time Setup
1. Open `admin.html` in your browser
2. Login with password: `monalisa2024`
3. Click on "Produits" tab
4. Sample products are automatically added on first load
5. Start managing your inventory!

### Adding a New Product
1. Go to Admin Dashboard → Produits tab
2. Click "Ajouter un produit"
3. Fill in the form:
   - **Nom du produit**: Product name (required)
   - **Prix (MAD)**: Price in Moroccan Dirhams (required)
   - **Catégorie**: Select from dropdown (required)
   - **URL de l'image**: Image URL (optional, placeholder shown if empty)
   - **Description**: Product description
   - **Tailles**: Sizes separated by commas (e.g., "S, M, L, XL")
   - **Couleurs**: Colors separated by commas (e.g., "Black, White, Red")
4. Click "Enregistrer" to save
5. Product immediately appears on your main website!

### Editing a Product
1. Find the product in your products grid
2. Click "Modifier" button
3. Update the information
4. Click "Enregistrer"

### Deleting a Product
1. Find the product in your products grid
2. Click "Supprimer" button
3. Confirm deletion
4. Product is permanently removed

## 💾 Data Storage

All products are stored in **localStorage** under the key `monalisa_products`. This means:
- ✅ No database needed
- ✅ Works immediately
- ✅ Data persists across browser sessions
- ⚠️ Data is browser-specific (clearing browser data removes products)

### Backup Your Products
To backup your products:
1. Open browser console (F12)
2. Type: `localStorage.getItem('monalisa_products')`
3. Copy the JSON string
4. Save it to a file

To restore:
1. Open browser console
2. Type: `localStorage.setItem('monalisa_products', 'YOUR_JSON_HERE')`

## 🎨 Color System

The admin dashboard automatically shows color dots for each product color. Supported colors include:
- Black, White, Red, Blue, Green, Yellow
- Pink, Purple, Orange, Gray, Brown, Beige
- Navy, Gold, Silver, Rose Gold
- Light Blue, Dark Blue, Light Denim, Dark Denim
- Khaki, Floral, Striped, Polka Dot, Classic

## 📱 Main Website Integration

Products you add in the admin panel automatically appear on your main website (`index.html`):
- Filtered by category
- Shown in beautiful grid layout
- Click to view details and add to cart
- All functionality works seamlessly

## 🔐 Security

- Admin panel is password protected (default: `monalisa2024`)
- Session-based login (expires when browser closes)
- ⚠️ **Important**: Change the default password in `js/admin.js` line 7

## 🛠️ Technical Details

### Product Data Structure
```javascript
{
    id: 'prod_1234567890',
    name: 'Product Name',
    price: 180,
    category: 'pants',
    image: 'https://example.com/image.jpg',
    description: 'Product description',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Blue', 'Gray']
}
```

### Key Functions
- `ProductManager.getAllProducts()` - Get all products
- `ProductManager.getProductsByCategory(category)` - Filter by category
- `ProductManager.getProductById(id)` - Get specific product
- `admin.saveProduct()` - Add/update product
- `admin.deleteProduct(id)` - Delete product

## 🎯 What Was Removed

✅ **Removed all hardcoded product data from the website**
- Products are no longer defined in static HTML
- No more manual HTML editing to add products
- Everything is dynamic and manageable from admin panel

✅ **Cleaned up products.js**
- Now acts as a ProductManager class
- Initializes sample products on first load
- Provides helper methods to access products

✅ **Updated cart.js**
- Now uses ProductManager instead of hardcoded `products` object
- Fully dynamic product loading

## 🚨 Important Notes

1. **First Load**: Sample products are automatically added on first visit to help you get started
2. **Images**: Use direct image URLs. If image fails to load, a placeholder is shown
3. **Browser Data**: Clearing browser localStorage will remove all products
4. **Password**: Change the default admin password in production
5. **Mobile**: Admin dashboard is fully responsive and works on mobile devices

## 🎨 Customization

You can easily customize:
- **Categories**: Add more categories in admin.html product form dropdown
- **Colors**: Add more color codes in admin.js `getColorCode()` method
- **Fields**: Add more product fields by extending the form and data structure
- **Styles**: Modify css/admin-styles.css to match your brand

## 📞 Support

If you need help:
1. Check browser console (F12) for any errors
2. Verify localStorage has data: `localStorage.getItem('monalisa_products')`
3. Make sure JavaScript files are loading correctly
4. Clear browser cache and reload

---

**Enjoy managing your Monalisa Store! 🛍️✨**
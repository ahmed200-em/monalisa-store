# Quick Test Guide

## Testing the New Features

### 1. Test Admin Dashboard
1. Open `admin.html` in your browser
2. Login with: `monalisa2024`
3. You should see two tabs: "Commandes" and "Produits"
4. Click on "Produits" tab
5. You should see 6 sample products automatically loaded

### 2. Test Add Product
1. Click "Ajouter un produit" button
2. Fill in the form:
   - Name: "Test Product"
   - Price: 150
   - Category: Any category
   - Sizes: "S, M, L"
   - Colors: "Black, White"
3. Click "Enregistrer"
4. Product should appear in the grid

### 3. Test Edit Product
1. Click "Modifier" on any product
2. Change the name or price
3. Click "Enregistrer"
4. Changes should be reflected immediately

### 4. Test Delete Product
1. Click "Supprimer" on any product
2. Confirm deletion
3. Product should disappear from the grid

### 5. Test Main Website
1. Open `index.html` in your browser
2. Scroll to "Shop Our Collection"
3. Products from admin should appear
4. Try filtering by category
5. Click "View Details" on any product
6. Product modal should work

### 6. Test Persistence
1. Add a new product in admin
2. Close the browser
3. Reopen admin.html
4. Your product should still be there

## Troubleshooting

### Products Not Showing?
- Open browser console (F12)
- Type: `localStorage.getItem('monalisa_products')`
- Should return product data
- If null, reload the page

### Can't Login?
- Default password: `monalisa2024`
- Check browser console for errors

### Images Not Loading?
- Check if image URLs are valid
- Placeholder images will show for broken URLs
- Use direct image URLs (not page URLs)

### Forms Not Working?
- Check browser console for JavaScript errors
- Make sure all fields are filled
- Required fields are marked with *

## Success Indicators ✅

- ✅ Two tabs visible in admin dashboard
- ✅ Sample products loaded automatically
- ✅ Can add new products
- ✅ Can edit existing products
- ✅ Can delete products
- ✅ Products appear on main website
- ✅ Category filtering works
- ✅ Product details modal works
- ✅ Data persists after browser restart

---

If everything works, you're all set! 🎉

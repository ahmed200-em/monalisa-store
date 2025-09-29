// Product data for Monalisa Store
const products = {
    pants: [
        {
            id: 'pants_001',
            name: 'Classic High-Waist Jeans',
            price: 180,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=High-Waist+Jeans',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Blue', 'Black', 'Gray'],
            description: 'Comfortable high-waist jeans perfect for everyday wear',
            category: 'pants'
        },
        {
            id: 'pants_002',
            name: 'Baggy Relaxed Jeans',
            price: 220,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Baggy+Jeans',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Light Blue', 'Dark Blue', 'Black'],
            description: 'Trendy baggy jeans for a relaxed, stylish look',
            category: 'pants'
        },
        {
            id: 'pants_003',
            name: 'Elegant Trousers',
            price: 250,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Elegant+Trousers',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'Navy', 'Beige'],
            description: 'Professional trousers for office and formal occasions',
            category: 'pants'
        },
        {
            id: 'pants_004',
            name: 'Casual Cotton Pants',
            price: 160,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Cotton+Pants',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Khaki', 'Pink'],
            description: 'Comfortable cotton pants for casual outings',
            category: 'pants'
        }
    ],
    blouses: [
        {
            id: 'blouse_001',
            name: 'Silk Evening Blouse',
            price: 280,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Silk+Blouse',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'White', 'Rose Gold'],
            description: 'Elegant silk blouse perfect for evening events',
            category: 'blouses'
        },
        {
            id: 'blouse_002',
            name: 'Office Chic Blouse',
            price: 200,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Office+Blouse',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Light Blue', 'Pink'],
            description: 'Professional blouse ideal for workplace',
            category: 'blouses'
        },
        {
            id: 'blouse_003',
            name: 'Casual Print Blouse',
            price: 150,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Print+Blouse',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Floral', 'Striped', 'Polka Dot'],
            description: 'Casual blouse with beautiful prints',
            category: 'blouses'
        }
    ],
    shirts: [
        {
            id: 'shirt_001',
            name: 'Classic White Shirt',
            price: 170,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=White+Shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['White', 'Light Blue', 'Pink'],
            description: 'Timeless white shirt for any occasion',
            category: 'shirts'
        },
        {
            id: 'shirt_002',
            name: 'Denim Shirt',
            price: 190,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Denim+Shirt',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Light Denim', 'Dark Denim'],
            description: 'Stylish denim shirt for casual wear',
            category: 'shirts'
        }
    ],
    accessories: [
        {
            id: 'acc_001',
            name: 'Statement Necklace',
            price: 120,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Necklace',
            sizes: ['One Size'],
            colors: ['Gold', 'Silver', 'Rose Gold'],
            description: 'Beautiful statement necklace to complement any outfit',
            category: 'accessories'
        },
        {
            id: 'acc_002',
            name: 'Elegant Earrings',
            price: 80,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Earrings',
            sizes: ['One Size'],
            colors: ['Gold', 'Silver'],
            description: 'Elegant earrings for special occasions',
            category: 'accessories'
        },
        {
            id: 'acc_003',
            name: 'Fashion Bracelet',
            price: 90,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Bracelet',
            sizes: ['S', 'M', 'L'],
            colors: ['Gold', 'Silver', 'Rose Gold'],
            description: 'Trendy bracelet to add sparkle to your look',
            category: 'accessories'
        }
    ],
    handbags: [
        {
            id: 'bag_001',
            name: 'Designer Tote Bag',
            price: 350,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Tote+Bag',
            sizes: ['Medium', 'Large'],
            colors: ['Black', 'Brown', 'Beige'],
            description: 'Spacious tote bag perfect for daily use',
            category: 'handbags'
        },
        {
            id: 'bag_002',
            name: 'Evening Clutch',
            price: 200,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Evening+Clutch',
            sizes: ['Small'],
            colors: ['Black', 'Gold', 'Silver'],
            description: 'Elegant clutch for evening events',
            category: 'handbags'
        },
        {
            id: 'bag_003',
            name: 'Crossbody Bag',
            price: 280,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Crossbody+Bag',
            sizes: ['Small', 'Medium'],
            colors: ['Black', 'Pink', 'Brown'],
            description: 'Practical crossbody bag for everyday adventures',
            category: 'handbags'
        }
    ],
    footwear: [
        {
            id: 'shoe_001',
            name: 'Classic High Heels',
            price: 320,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=High+Heels',
            sizes: ['36', '37', '38', '39', '40', '41'],
            colors: ['Black', 'Red', 'Nude'],
            description: 'Elegant high heels for special occasions',
            category: 'footwear'
        },
        {
            id: 'shoe_002',
            name: 'Comfortable Flats',
            price: 180,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Ballet+Flats',
            sizes: ['36', '37', '38', '39', '40', '41'],
            colors: ['Black', 'Beige', 'Pink'],
            description: 'Comfortable flats for everyday wear',
            category: 'footwear'
        },
        {
            id: 'shoe_003',
            name: 'Trendy Sneakers',
            price: 250,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Sneakers',
            sizes: ['36', '37', '38', '39', '40', '41'],
            colors: ['White', 'Black', 'Pink'],
            description: 'Stylish sneakers for casual outings',
            category: 'footwear'
        },
        {
            id: 'shoe_004',
            name: 'Summer Sandals',
            price: 160,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Sandals',
            sizes: ['36', '37', '38', '39', '40', '41'],
            colors: ['Brown', 'Black', 'Gold'],
            description: 'Comfortable sandals for summer days',
            category: 'footwear'
        },
        {
            id: 'shoe_005',
            name: 'Ankle Boots',
            price: 380,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Ankle+Boots',
            sizes: ['36', '37', '38', '39', '40', '41'],
            colors: ['Black', 'Brown', 'Gray'],
            description: 'Stylish ankle boots for autumn and winter',
            category: 'footwear'
        }
    ],
    perfumes: [
        {
            id: 'perf_001',
            name: 'Floral Elegance',
            price: 450,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Floral+Perfume',
            sizes: ['50ml', '100ml'],
            colors: ['Classic'],
            description: 'Delicate floral fragrance for everyday elegance',
            category: 'perfumes'
        },
        {
            id: 'perf_002',
            name: 'Evening Mystery',
            price: 520,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Evening+Perfume',
            sizes: ['50ml', '100ml'],
            colors: ['Classic'],
            description: 'Mysterious evening fragrance for special occasions',
            category: 'perfumes'
        },
        {
            id: 'perf_003',
            name: 'Fresh Citrus',
            price: 380,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Citrus+Perfume',
            sizes: ['50ml', '100ml'],
            colors: ['Classic'],
            description: 'Refreshing citrus scent for daytime wear',
            category: 'perfumes'
        }
    ],
    pajamas: [
        {
            id: 'pj_001',
            name: 'Silk Pajama Set',
            price: 320,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Silk+Pajamas',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Pink', 'Blue', 'White'],
            description: 'Luxurious silk pajama set for ultimate comfort',
            category: 'pajamas'
        },
        {
            id: 'pj_002',
            name: 'Cotton Comfort Set',
            price: 180,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Cotton+Pajamas',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Gray', 'Pink', 'White'],
            description: 'Comfortable cotton pajamas for relaxing nights',
            category: 'pajamas'
        },
        {
            id: 'pj_003',
            name: 'Satin Nightgown',
            price: 220,
            image: 'https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Satin+Nightgown',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'Red', 'Champagne'],
            description: 'Elegant satin nightgown for a touch of luxury',
            category: 'pajamas'
        }
    ]
};

// Category mapping
const categoryMapping = {
    'pants': 'pants',
    'blouses': 'blouses',
    'shirts': 'shirts',
    'accessories': 'accessories',
    'handbags': 'handbags',
    'sneakers': 'footwear',
    'sandals': 'footwear',
    'boots': 'footwear',
    'heels': 'footwear',
    'flats': 'footwear',
    'perfumes': 'perfumes',
    'pajamas': 'pajamas'
};
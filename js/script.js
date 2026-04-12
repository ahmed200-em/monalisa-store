// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Contact form handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;

        // Simple validation
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Create WhatsApp message
        const whatsappMessage = `Hello! I'm ${name}. Email: ${email}. Message: ${message}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappNumber = '212707741353';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Open WhatsApp
        window.open(whatsappURL, '_blank');

        // Reset form
        this.reset();
        alert('Thank you for your message! You will be redirected to WhatsApp.');
    });
}

// Debug function for inventory testing
window.testInventorySystem = () => {
    console.log('🔍 Testing inventory system...');

    // Check if ProductManager is working
    const products = ProductManager.getProducts();
    console.log('🛍️ Products loaded:', Object.keys(products).reduce((total, category) => total + products[category].length, 0), 'total products');

    // Check admin products specifically
    const adminProducts = JSON.parse(localStorage.getItem('monalisa_products') || '{}');
    console.log('👨‍💼 Admin products in storage:', Object.keys(adminProducts).length, 'categories');

    // Find first admin product and test inventory
    let testProduct = null;
    Object.entries(adminProducts).forEach(([category, products]) => {
        if (!testProduct && products.length > 0) {
            testProduct = products.find(p => p.inventory && Object.keys(p.inventory).length > 0);
        }
    });

    if (testProduct) {
        console.log('🧪 Test product:', testProduct.name);
        console.log('📊 Inventory:', testProduct.inventory);

        // Test product display
        if (typeof productDisplay !== 'undefined') {
            const variants = productDisplay.getAvailableVariants?.(testProduct);
            console.log('🎯 Available variants:', variants?.length || 'N/A');
        }
    } else {
        console.log('📝 No admin products with inventory found to test');
    }

    return 'Inventory system test completed - check console logs';
};

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.contact-item, .about-text, .about-image');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add click effect to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect CSS
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Preload images and handle errors
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            // Show only the text part of the logo
            const logoText = this.parentElement.querySelector('h2');
            if (logoText) {
                logoText.style.fontSize = '1.5rem';
            }
        });
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// WhatsApp and phone number click handlers
document.addEventListener('DOMContentLoaded', () => {
    // WhatsApp links
    const whatsappElements = document.querySelectorAll('[href*="wa.me"], .contact-item:has(i.fa-whatsapp)');
    whatsappElements.forEach(element => {
        if (!element.href) {
            element.addEventListener('click', () => {
                window.open('https://wa.me/212707741353', '_blank');
            });
            element.style.cursor = 'pointer';
        }
    });

    // Phone number links
    const phoneElements = document.querySelectorAll('.contact-item:has(i.fa-phone)');
    phoneElements.forEach(element => {
        element.addEventListener('click', () => {
            window.location.href = 'tel:+212721764296';
        });
        element.style.cursor = 'pointer';
    });

    // Email links
    const emailElements = document.querySelectorAll('.contact-item:has(i.fa-envelope)');
    emailElements.forEach(element => {
        element.addEventListener('click', () => {
            window.location.href = 'mailto:monalisastoree3@gmail.com';
        });
        element.style.cursor = 'pointer';
    });
});
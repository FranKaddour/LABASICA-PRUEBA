/* ==================== PRODUCTOS PAGE JAVASCRIPT ==================== */

/* ==================== BANNER SLIDER FUNCTIONALITY ==================== */
let currentSlideIndex = 0;
const totalSlides = 3;
let slideInterval;

function initializeBannerSlider() {
    // Auto-play functionality
    slideInterval = setInterval(nextBannerSlide, 5000);
    
    // Add event listeners for mouse hover to pause auto-play
    const bannerSlider = document.querySelector('.banner-slider');
    if (bannerSlider) {
        bannerSlider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        bannerSlider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextBannerSlide, 5000);
        });
    }
}

function showBannerSlide(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
}

function changeBannerSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    }
    
    showBannerSlide(currentSlideIndex);
}

function currentBannerSlide(index) {
    currentSlideIndex = index - 1;
    showBannerSlide(currentSlideIndex);
}

function nextBannerSlide() {
    changeBannerSlide(1);
}

const productsData = {
    1: {
        name: "Croissant Artesanal",
        category: "Facturas Premium",
        filterCategory: "facturas",
        image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        description: "Delicioso croissant francés elaborado con mantequilla premium y técnicas tradicionales de laminado. Cada capa está perfectamente horneada para lograr una textura crujiente por fuera y suave por dentro.",
        ingredients: [
            "Harina de trigo premium",
            "Mantequilla francesa (32%)",
            "Leche entera fresca",
            "Azúcar refinada",
            "Levadura natural",
            "Sal marina",
            "Huevos orgánicos"
        ],
        price: "$4.50",
        bgColor: "linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)"
    },
    2: {
        name: "Alfajor Santafesino",
        category: "Alfajores Tradicional",
        filterCategory: "alfajores",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Auténtico alfajor santafesino con dulce de leche artesanal y coco rallado. Elaborado con receta tradicional familiar transmitida por generaciones.",
        ingredients: [
            "Harina de trigo 000",
            "Dulce de leche artesanal",
            "Coco rallado fresco",
            "Manteca de primera calidad",
            "Huevos de campo",
            "Azúcar impalpable",
            "Esencia de vainilla"
        ],
        price: "$3.20",
        bgColor: "linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)"
    },
    3: {
        name: "Muffin Blueberry",
        category: "Muffins Premium",
        filterCategory: "muffins",
        image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Esponjoso muffin cargado con arándanos frescos de temporada. Cubierto con un delicado crumble de mantequilla y azúcar morena que añade el toque perfecto de dulzura.",
        ingredients: [
            "Harina de repostería",
            "Arándanos frescos (25%)",
            "Azúcar glass",
            "Mantequilla sin sal",
            "Huevos de corral",
            "Extracto de vainilla",
            "Polvo de hornear",
            "Ralladura de limón"
        ],
        price: "$5.80",
        bgColor: "linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)"
    },
    4: {
        name: "Cookie Choco Chips",
        category: "Cookies Artesanales",
        filterCategory: "cookies",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Cookie clásica americana con chips de chocolate belga premium. Masa crujiente por fuera y tierna por dentro, con abundantes chips de chocolate en cada bocado.",
        ingredients: [
            "Harina de trigo premium",
            "Chips de chocolate belga",
            "Mantequilla europea",
            "Azúcar rubia orgánica",
            "Huevos frescos",
            "Bicarbonato de sodio",
            "Sal marina fina",
            "Esencia de vainilla bourbon"
        ],
        price: "$6.90",
        bgColor: "linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)"
    },
    5: {
        name: "Torta Chocolate",
        category: "Tortas Gourmet",
        filterCategory: "tortas",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Exquisita torta de chocolate húmeda con ganache de chocolate semi-amargo. Decorada con virutas de chocolate belga y un toque de flor de sal.",
        ingredients: [
            "Chocolate semi-amargo 70%",
            "Mantequilla premium",
            "Azúcar mascabo",
            "Huevos orgánicos",
            "Crema de leche doble",
            "Cacao en polvo premium",
            "Flor de sal patagónica",
            "Virutas de chocolate belga"
        ],
        price: "$4.20",
        bgColor: "linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)"
    },
    6: {
        name: "Brownie Premium",
        category: "Brownie Artesanal",
        filterCategory: "brownie",
        image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        description: "Brownie decadente con textura fudgy perfecta. Elaborado con chocolate orgánico de origen único y nueces pecanas tostadas para un sabor intenso y sofisticado.",
        ingredients: [
            "Chocolate orgánico 85%",
            "Mantequilla clarificada",
            "Nueces pecanas tostadas",
            "Azúcar demerara",
            "Huevos de corral",
            "Harina de almendras",
            "Sal rosa del Himalaya",
            "Extracto de café"
        ],
        price: "$5.50",
        bgColor: "linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)"
    }
};

const combosData = {
    1: {
        name: "Combo Dulce Antojo",
        description: "Perfecto para satisfacer tu lado dulce",
        products: ["2 Alfajores", "1 Brownie"],
        originalPrice: 11.90,
        finalPrice: 9.90,
        savings: 15
    },
    2: {
        name: "Pack Merienda",
        description: "Ideal para compartir en la merienda",
        products: ["3 Cookies", "1 Muffin"],
        originalPrice: 26.50,
        finalPrice: 21.20,
        savings: 20
    },
    3: {
        name: "Especial Compartir",
        description: "Para disfrutar en familia",
        products: ["1 Torta Chica", "2 Alfajores"],
        originalPrice: 10.60,
        finalPrice: 9.30,
        savings: 12
    },
    4: {
        name: "Mix Artesanal",
        description: "Variedad de nuestras especialidades",
        products: ["1 Croissant", "Cookie + Masita"],
        originalPrice: 13.40,
        finalPrice: 11.00,
        savings: 18
    }
};

let currentProduct = null;
let currentFilter = 'todos';

/**
 * Products page functionality
 */
class ProductosPage {
    constructor() {
        this.modal = null;
        this.productRenderer = null;
        this.init();
    }

    async init() {
        this.initializeFilterSystem();
        this.initializeModal();
        this.initializeCombos();

        // Inicializar renderizador dinámico
        if (window.ProductRenderer) {
            this.productRenderer = new ProductRenderer();
            // Esperar a que se inicialice
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            // Fallback a cards estáticas si no está disponible el renderer
            this.initializeCards();
        }

        console.log('Productos page initialized with dynamic rendering');
    }

    initializeFilterSystem() {
        const toggleBtn = document.getElementById('toggleMoreBtn');
        const hiddenButtons = document.getElementById('hiddenButtons');

        if (toggleBtn && hiddenButtons) {
            toggleBtn.addEventListener('click', () => {
                hiddenButtons.classList.toggle('show');
                toggleBtn.classList.toggle('expanded');
            });

            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.handleFilterClick(e.target);
                });
            });
        }
    }

    handleFilterClick(button) {
        const category = button.getAttribute('data-category');
        if (!category) return;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');
        currentFilter = category;

        // Usar el renderer dinámico si está disponible
        if (this.productRenderer) {
            this.productRenderer.currentFilter = category;
            this.productRenderer.renderProducts();
        } else {
            // Fallback al método original
            this.filterProducts(category);
        }
    }

    filterProducts(category) {
        const cards = document.querySelectorAll('.product-card');

        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');

            if (category === 'todos' || cardCategory === category) {
                card.classList.remove('hidden');
                card.style.display = '';
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });
    }

    initializeModal() {
        this.modal = document.getElementById('productModal');
        
        if (this.modal) {
            const overlay = this.modal.querySelector('.modal-overlay');
            const closeBtn = this.modal.querySelector('.modal-close');
            
            if (overlay) {
                overlay.addEventListener('click', () => this.closeModal());
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }
    }

    initializeCards() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.getAttribute('data-product');
                if (productId) {
                    this.openModal(productId);
                }
            });

            card.addEventListener('mouseenter', () => {
                const image = card.querySelector('.product-image');
                if (image) {
                    image.style.transform = 'scale(1.05)';
                }
            });

            card.addEventListener('mouseleave', () => {
                const image = card.querySelector('.product-image');
                if (image) {
                    image.style.transform = 'scale(1)';
                }
            });
        });
    }

    openModal(productId) {
        // Usar el renderer dinámico si está disponible
        if (this.productRenderer) {
            this.productRenderer.openProductModal(productId);
            return;
        }

        // Fallback al método original
        const product = productsData[productId];
        if (!product || !this.modal) return;

        currentProduct = product;

        document.getElementById('modalTitle').textContent = product.name;
        document.getElementById('modalImage').src = product.image;
        document.getElementById('modalDescription').textContent = product.description;
        document.getElementById('modalPrice').textContent = product.price;

        // Ocultar sección de ingredientes como se solicitó
        const ingredientsSection = document.querySelector('.modal-section-right');
        if (ingredientsSection) {
            ingredientsSection.style.display = 'none';
        }

        const modalContent = this.modal.querySelector('.modal-content');
        const modalImageContainer = document.getElementById('modalImageContainer');
        const modalInfoContainer = document.getElementById('modalInfoContainer');

        if (modalContent && modalImageContainer && modalInfoContainer) {
            modalContent.style.background = product.bgColor || 'linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)';
            modalImageContainer.style.background = product.bgColor || 'linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)';
            modalInfoContainer.style.background = product.bgColor || 'linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)';
        }

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
            currentProduct = null;
        }
    }

    initializeCombos() {
        const comboCards = document.querySelectorAll('.combo-card');
        const comboBtns = document.querySelectorAll('.combo-btn');
        
        comboCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        comboBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const comboCard = btn.closest('.combo-card');
                const comboId = comboCard.getAttribute('data-combo');
                this.handleComboInterest(comboId);
            });
        });
    }

    handleComboInterest(comboId) {
        const combo = combosData[comboId];
        if (!combo) return;

        const message = `¡Hola! Me interesa el *${combo.name}*\n\n` +
                       `🎯 Incluye: ${combo.products.join(' + ')}\n` +
                       `💰 Precio especial: $${combo.finalPrice} (ahorro ${combo.savings}%)\n\n` +
                       `¿Está disponible?`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/1234567890?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        this.trackComboInteraction(comboId);
    }

    trackComboInteraction(comboId) {
        const combo = combosData[comboId];
        console.log(`Usuario interesado en: ${combo.name}`);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'combo_interest', {
                'combo_name': combo.name,
                'combo_price': combo.finalPrice,
                'savings_percent': combo.savings
            });
        }
    }
}

/**
 * Initialize page when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize banner slider
    initializeBannerSlider();
    
    const productosPage = new ProductosPage();

    // Make available globally for debugging
    if (typeof AppConfig !== 'undefined' && AppConfig.debug) {
        window.ProductosPage = productosPage;
    }
});

// Listen for component ready events
document.addEventListener('allComponentsReady', () => {
    if (typeof Navigation !== 'undefined') {
        Navigation.setActiveNav();
    }
});
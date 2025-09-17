/**
 * ProductRenderer - Sistema de renderizado dinámico de productos
 * Conecta la página de productos con los datos del dashboard
 */

class ProductRenderer {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentFilter = 'todos';
        this.containerSelector = '.products-grid';

        this.init();
    }

    async init() {
        try {
            console.log('🔄 Inicializando ProductRenderer...');

            // Mostrar loading solo después de un pequeño delay para evitar flicker
            let loadingTimeout = setTimeout(() => {
                this.showLoading();
            }, 150);

            // Cargar datos de productos y categorías
            await this.loadData();

            // Cancelar el loading si los datos se cargaron rápido
            clearTimeout(loadingTimeout);

            // Renderizar productos iniciales
            this.renderProducts();

            console.log('✅ ProductRenderer inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando ProductRenderer:', error);
            this.renderError();
        }
    }

    showLoading() {
        const container = document.querySelector(this.containerSelector);
        if (!container) return;

        // Limpiar completamente cualquier loading existente
        container.innerHTML = `
            <div class="loading-products">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Cargando productos...</p>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            // Cargar productos
            const productsResponse = await fetch('/data/products.json');
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                this.products = productsData.products || [];
                console.log(`📦 Cargados ${this.products.length} productos`);
            }

            // Cargar categorías
            const categoriesResponse = await fetch('/data/categories.json');
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                this.categories = categoriesData.categories || [];
                console.log(`📁 Cargadas ${this.categories.length} categorías`);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            throw error;
        }
    }

    renderProducts() {
        const container = document.querySelector(this.containerSelector);
        if (!container) {
            console.error('❌ Contenedor de productos no encontrado:', this.containerSelector);
            return;
        }

        // Limpiar cualquier contenido de loading previo
        container.innerHTML = '';

        // Filtrar productos según el filtro actual
        let filteredProducts = this.products;

        if (this.currentFilter !== 'todos') {
            filteredProducts = this.products.filter(product =>
                product.categorySlug === this.currentFilter ||
                product.categoryId === this.getCategoryIdBySlug(this.currentFilter)
            );
        }

        // Renderizar productos
        if (filteredProducts.length === 0) {
            container.innerHTML = this.renderEmptyState();
        } else {
            container.innerHTML = filteredProducts.map(product => this.renderProductCard(product)).join('');

            // Configurar eventos de las cards
            this.setupCardEvents();
        }

        console.log(`🎨 Renderizados ${filteredProducts.length} productos con filtro: ${this.currentFilter}`);
    }

    renderProductCard(product) {
        const category = this.getCategoryById(product.categoryId);
        const price = this.formatPrice(product.price);

        // Generar código de barras único
        const barcode = `8 901234 56789${product.id}`;

        return `
            <div class="product-card card-dark"
                 data-product="${product.id}"
                 data-category="${product.categorySlug || category?.filterSlug || 'general'}">

                <div class="product-image"
                     style="background-image: url('${product.images[0]}');">
                </div>

                <div class="product-content">
                    <div class="product-info">
                        <div class="product-name">${product.name.replace(' ', '<br>')}</div>
                    </div>
                    <div class="product-bottom">
                        <div class="barcode-section">
                            <div class="barcode"></div>
                            <div class="barcode-number">${barcode}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="products-empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No se encontraron productos</h3>
                <p>No hay productos disponibles para el filtro seleccionado.</p>
                <button class="btn-secondary" onclick="window.productRenderer.currentFilter = 'todos'; window.productRenderer.renderProducts();">
                    Ver todos los productos
                </button>
            </div>
        `;
    }

    renderError() {
        const container = document.querySelector(this.containerSelector);
        if (!container) return;

        container.innerHTML = `
            <div class="products-error-state">
                <div class="error-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error cargando productos</h3>
                <p>Hubo un problema al cargar los productos. Por favor, intenta nuevamente.</p>
                <button class="btn-primary" onclick="window.productRenderer.init()">
                    Reintentar
                </button>
            </div>
        `;
    }

    setupCardEvents() {
        // Eventos para las cards (click en toda la card)
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.product;
                this.openProductModal(productId);
            });

            // Hover effects originales
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

    openProductModal(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (!product) {
            console.error('Producto no encontrado:', productId);
            return;
        }

        console.log('🔍 Abriendo modal para producto:', product.name);

        // Buscar el modal existente o usar el sistema original
        const modal = document.getElementById('productModal');
        if (modal) {
            this.populateModal(product);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            // Crear modal dinámico si no existe
            this.createProductModal(product);
        }
    }

    populateModal(product) {
        const category = this.getCategoryById(product.categoryId);

        // Actualizar contenido del modal
        const modalTitle = document.getElementById('modalTitle');
        const modalImage = document.getElementById('modalImage');
        const modalDescription = document.getElementById('modalDescription');
        const modalPrice = document.getElementById('modalPrice');

        if (modalTitle) modalTitle.textContent = product.name;
        if (modalImage) modalImage.src = product.images[0];
        if (modalDescription) modalDescription.textContent = product.description;
        if (modalPrice) modalPrice.textContent = this.formatPrice(product.price);

        // Actualizar categoría si existe el elemento
        const modalCategory = document.getElementById('modalCategory');
        if (modalCategory) modalCategory.textContent = category?.name || 'Sin categoría';

        // Aplicar el color de fondo original (como en el JS original)
        const modalContent = document.querySelector('.modal-content');
        const modalImageContainer = document.getElementById('modalImageContainer');
        const modalInfoContainer = document.getElementById('modalInfoContainer');

        const bgColor = 'linear-gradient(135deg, #A67C47 0%, #8F6B3D 100%)';

        if (modalContent) modalContent.style.background = bgColor;
        if (modalImageContainer) modalImageContainer.style.background = bgColor;
        if (modalInfoContainer) modalInfoContainer.style.background = bgColor;

        // Ocultar sección de ingredientes como se solicitó
        const ingredientsSection = document.querySelector('.modal-section-right');
        if (ingredientsSection) {
            ingredientsSection.style.display = 'none';
        }
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (!product) return;

        console.log('🛒 Agregando al carrito:', product.name);

        // Integrar con el sistema de carrito si existe
        if (window.shoppingCart) {
            window.shoppingCart.addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0]
            });
        } else {
            // Fallback: mostrar notificación
            this.showNotification(`${product.name} agregado al carrito`, 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `product-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Métodos auxiliares
    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId);
    }

    getCategoryIdBySlug(slug) {
        const category = this.categories.find(cat => cat.filterSlug === slug || cat.slug === slug);
        return category ? category.id : null;
    }

    formatPrice(price) {
        // Convertir centavos a pesos si es necesario
        const priceInPesos = price >= 100 ? price / 100 : price;
        return `$${priceInPesos.toFixed(2)}`;
    }

    // Método público para cambiar filtro
    setFilter(filter) {
        this.currentFilter = filter;
        this.renderProducts();
    }

    // Método público para recargar datos
    async refresh() {
        await this.loadData();
        this.renderProducts();
    }
}

// CSS adicional con selectores específicos (sin !important)
const additionalStyles = `
    /* Fix para product-content debajo de la imagen */
    .products-grid .product-card.card-dark {
        height: 400px;
    }

    .products-grid .product-card.card-dark .product-content {
        position: relative;
        bottom: auto;
        height: auto;
        background: transparent;
        padding: 1.5rem;
        color: white;
    }

    .products-grid .product-card.card-dark .product-image {
        height: 75%;
        border-radius: 16px;
        border-bottom: 2px solid rgba(210, 180, 140, 0.3);
    }

    .products-grid .product-card.card-dark .product-name {
        text-shadow: none;
    }

    .products-grid .product-card.card-dark .product-image::before {
        position: static;
    }

    /* Quitar línea divisoria del modal */
    .modal-overlay .modal-content .modal-section-divider,
    .modal-overlay .modal-content .section-divider,
    .modal-overlay .modal-content hr {
        display: none;
    }

    .modal-overlay .modal-sections-row::before {
        display: none;
    }

    /* X del modal en color negro */
    .modal-overlay .modal-close,
    .modal-overlay .modal-close i {
        color: black;
    }
    .loading-products {
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
    }

    .loading-spinner {
        text-align: center;
    }

    .loading-spinner .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(210, 180, 140, 0.3);
        border-top: 4px solid var(--accent-orange);
        border-radius: 50%;
        animation: spinOnly 1s linear infinite;
        margin: 0 auto 1rem;
    }

    @keyframes spinOnly {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .loading-spinner p {
        color: var(--text-muted);
        font-weight: 500;
        animation: none; /* Asegurar que el texto no gire */
        transform: none; /* Asegurar que el texto no tenga transformaciones */
    }

    .product-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-left: 4px solid #28a745;
    }

    .product-notification.show {
        transform: translateX(0);
    }
`;

// Agregar estilos al documento
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
}

// Exportar para uso global
window.ProductRenderer = ProductRenderer;

// Auto-inicializar en páginas de productos
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar en páginas que tengan el contenedor de productos
    if (document.querySelector('.products-grid')) {
        window.productRenderer = new ProductRenderer();
        console.log('🎯 ProductRenderer inicializado automáticamente');
    }
});
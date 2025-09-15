/**
 * Product Renderer - Sistema de renderizado dinámico de productos
 * Genera cards de productos basado en datos reales desde la API
 */

class ProductRenderer {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentFilter = 'todos';
        this.config = null;
        this.init();
    }

    async init() {
        try {
            // Cargar configuración
            await this.loadConfig();

            // Cargar datos
            await this.loadData();

            // Renderizar productos
            this.renderProducts();

            // Actualizar filtros
            this.updateFilters();

            console.log('ProductRenderer inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando ProductRenderer:', error);
            this.showError('Error cargando productos');
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('/data/config.json');
            if (response.ok) {
                this.config = await response.json();
            } else {
                this.config = this.getDefaultConfig();
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            appConfig: {
                ui: {
                    defaultProductImage: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=400&h=300&fit=crop&auto=format",
                    cardStyles: {
                        showIngredients: false,
                        showRating: true,
                        showPrice: true,
                        showDescription: true
                    }
                }
            },
            categoryMapping: {
                facturas: "Facturas",
                cookies: "Galletas y Cookies",
                alfajores: "Dulces Especiales",
                tartas: "Pasteles y Tartas",
                muffins: "Pasteles y Tartas",
                brownie: "Dulces Especiales",
                tortas: "Pasteles y Tartas"
            }
        };
    }

    async loadData() {
        try {
            // Cargar productos
            const productsResponse = await fetch('/data/products.json');
            const productsData = productsResponse.ok ? await productsResponse.json() : { products: [] };
            this.products = productsData.products || [];

            // Cargar categorías
            const categoriesResponse = await fetch('/data/categories.json');
            const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : { categories: [] };
            this.categories = categoriesData.categories || [];

        } catch (error) {
            console.error('Error cargando datos:', error);
            this.products = [];
            this.categories = [];
        }
    }

    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) {
            console.error('Container productsGrid no encontrado');
            return;
        }

        try {
            if (this.products.length === 0) {
                container.innerHTML = this.createEmptyState();
                return;
            }

            const filteredProducts = this.getFilteredProducts();
            container.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');

            // Reinicializar eventos de cards
            this.initializeProductCards();

        } catch (error) {
            console.error('Error renderizando productos:', error);
            container.innerHTML = this.createErrorState();
        }
    }

    getFilteredProducts() {
        if (this.currentFilter === 'todos') {
            return this.products.filter(product => product.available);
        }

        return this.products.filter(product =>
            product.available &&
            (product.categorySlug === this.currentFilter ||
             this.getCategorySlugById(product.categoryId) === this.currentFilter)
        );
    }

    getCategorySlugById(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category?.filterSlug || category?.slug || null;
    }

    createProductCard(product) {
        const category = this.categories.find(cat => cat.id === product.categoryId);
        const categorySlug = product.categorySlug || category?.filterSlug || 'general';

        // Generar código de barras único
        const barcode = this.generateBarcode(product.id);

        return `
            <div class="product-card card-dark" data-product="${product.id}" data-category="${categorySlug}">
                <div class="product-image" style="background-image: url('${product.images?.[0] || this.config.appConfig.ui.defaultProductImage}');"></div>
                <div class="product-content">
                    <div class="product-info">
                        <div class="product-name">${this.formatProductName(product.name)}</div>
                        ${this.config.appConfig.ui.cardStyles.showPrice ? `
                        <div class="product-price">
                            $${product.price}
                            ${product.discount > 0 ? `<span class="product-discount">${product.discount}% OFF</span>` : ''}
                        </div>
                        ` : ''}
                        ${this.config.appConfig.ui.cardStyles.showDescription ? `
                        <div class="product-description">${product.shortDescription}</div>
                        ` : ''}
                    </div>
                    <div class="product-bottom">
                        <div class="barcode-section">
                            <div class="barcode"></div>
                            <div class="barcode-number">${barcode}</div>
                        </div>
                        ${product.stock <= 5 && product.stock > 0 ? `
                        <div class="product-stock-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            Quedan ${product.stock}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    formatProductName(name) {
        // Dividir el nombre en dos líneas si es muy largo
        const words = name.split(' ');
        if (words.length > 2) {
            const midpoint = Math.ceil(words.length / 2);
            return words.slice(0, midpoint).join(' ') + '<br>' + words.slice(midpoint).join(' ');
        }
        return name;
    }

    generateBarcode(productId) {
        // Generar código de barras simple basado en ID
        const base = '8901234567';
        const paddedId = productId.toString().padStart(3, '0');
        return base + paddedId.slice(-3);
    }

    updateFilters() {
        const filterContainer = document.querySelector('.filter-buttons-hidden');
        if (!filterContainer) return;

        try {
            // Obtener categorías únicas de productos disponibles
            const availableCategories = new Set();

            this.products.forEach(product => {
                if (product.available) {
                    const categorySlug = product.categorySlug || this.getCategorySlugById(product.categoryId);
                    if (categorySlug) {
                        availableCategories.add(categorySlug);
                    }
                }
            });

            // Limpiar filtros existentes
            filterContainer.innerHTML = '';

            // Crear botones de filtro dinámicos
            Array.from(availableCategories).sort().forEach(categorySlug => {
                const categoryName = this.getCategoryDisplayName(categorySlug);
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.dataset.category = categorySlug;
                button.textContent = categoryName;
                filterContainer.appendChild(button);
            });

            // Reinicializar event listeners de filtros
            this.initializeFilters();

        } catch (error) {
            console.error('Error actualizando filtros:', error);
        }
    }

    getCategoryDisplayName(categorySlug) {
        // Buscar en categorías reales
        const category = this.categories.find(cat =>
            cat.filterSlug === categorySlug || cat.slug === categorySlug
        );

        if (category) {
            return category.name;
        }

        // Fallback a mapping de configuración
        const mapping = this.config.categoryMapping || {};
        return mapping[categorySlug] || this.capitalizeFirst(categorySlug);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    initializeProductCards() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            // Remover event listeners previos
            card.replaceWith(card.cloneNode(true));
        });

        // Reasignar event listeners
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.getAttribute('data-product');
                if (productId) {
                    this.openProductModal(productId);
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

    initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleFilterClick(btn);
            });
        });
    }

    handleFilterClick(button) {
        const category = button.getAttribute('data-category');
        if (!category) return;

        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');
        this.currentFilter = category;

        // Filtrar productos
        this.filterProductCards(category);
    }

    filterProductCards(category) {
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

    openProductModal(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (!product) return;

        // Buscar modal existente
        const modal = document.getElementById('productModal');
        if (!modal) {
            console.error('Modal de producto no encontrado');
            return;
        }

        // Actualizar contenido del modal sin ingredientes
        this.updateModalContent(modal, product);

        // Mostrar modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    updateModalContent(modal, product) {
        const category = this.categories.find(cat => cat.id === product.categoryId);

        // Actualizar elementos del modal
        const titleEl = modal.querySelector('#modalTitle');
        const imageEl = modal.querySelector('#modalImage');
        const descriptionEl = modal.querySelector('#modalDescription');
        const priceEl = modal.querySelector('#modalPrice');
        const ingredientsSection = modal.querySelector('.modal-section-right');

        if (titleEl) titleEl.textContent = product.name;
        if (imageEl) {
            imageEl.src = product.images?.[0] || this.config.appConfig.ui.defaultProductImage;
            imageEl.alt = product.name;
        }
        if (descriptionEl) descriptionEl.textContent = product.description;
        if (priceEl) {
            priceEl.textContent = `$${product.price}`;
            if (product.discount > 0) {
                priceEl.innerHTML += ` <span class="original-price">$${product.originalPrice}</span>`;
            }
        }

        // Ocultar sección de ingredientes como solicitaste
        if (ingredientsSection) {
            ingredientsSection.style.display = 'none';
        }

        // Agregar información adicional
        const leftSection = modal.querySelector('.modal-section-left');
        if (leftSection) {
            leftSection.innerHTML = `
                <h3 class="modal-section-title">Información del Producto</h3>
                <p class="modal-description">${product.description}</p>
                <div class="product-details">
                    <div class="detail-item">
                        <strong>Categoría:</strong> ${category?.name || 'Sin categoría'}
                    </div>
                    <div class="detail-item">
                        <strong>Peso/Tamaño:</strong> ${product.weight}
                    </div>
                    ${product.stock ? `
                    <div class="detail-item">
                        <strong>Disponibilidad:</strong> ${product.stock} unidades
                    </div>
                    ` : ''}
                    ${product.tags?.length ? `
                    <div class="detail-item">
                        <strong>Características:</strong>
                        <div class="product-tags">
                            ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
    }

    createEmptyState() {
        return `
            <div class="empty-products-state">
                <div class="empty-state-icon">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <h3>No hay productos disponibles</h3>
                <p>Próximamente tendremos deliciosos productos para ti</p>
            </div>
        `;
    }

    createErrorState() {
        return `
            <div class="error-products-state">
                <div class="error-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error cargando productos</h3>
                <p>No pudimos cargar los productos. Por favor, intenta nuevamente.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Reintentar
                </button>
            </div>
        `;
    }

    showError(message) {
        console.error(message);
        // Podrías mostrar un toast o notificación aquí
    }

    // Método público para recargar productos (útil para sincronización)
    async reload() {
        await this.loadData();
        this.renderProducts();
        this.updateFilters();
    }

    // Método público para obtener productos actuales
    getProducts() {
        return this.products;
    }

    // Método público para obtener categorías actuales
    getCategories() {
        return this.categories;
    }
}

// Instancia global
window.ProductRenderer = ProductRenderer;
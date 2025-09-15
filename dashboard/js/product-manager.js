/**
 * Product Manager - Sistema de gestión de productos para el dashboard
 */

class ProductManager {
    constructor() {
        this.currentProducts = [];
        this.categories = [];
        this.init();
    }

    async init() {
        try {
            // Cargar datos iniciales
            await this.loadProducts();
            await this.loadCategories();

            // Configurar event listeners
            this.setupEventListeners();

            // Renderizar productos iniciales
            this.renderProducts();

            console.log('ProductManager inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando ProductManager:', error);
            window.dashboardUI.showToast('Error cargando productos', 'error');
        }
    }

    async loadProducts() {
        try {
            const data = await window.dataManager.getProducts();
            this.currentProducts = data?.products || [];
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.currentProducts = [];
        }
    }

    async loadCategories() {
        try {
            const data = await window.dataManager.getCategories();
            this.categories = data?.categories || [];
        } catch (error) {
            console.error('Error cargando categorías:', error);
            this.categories = [];
        }
    }

    setupEventListeners() {
        // Botón nuevo producto
        const newProductBtn = document.getElementById('newProductBtn');
        if (newProductBtn) {
            newProductBtn.addEventListener('click', () => this.showProductForm());
        }

        // Escuchar cambios de datos
        window.dataManager.addListener((event, data) => {
            switch (event) {
                case 'productAdded':
                case 'productUpdated':
                case 'productDeleted':
                    this.loadProducts().then(() => this.renderProducts());
                    break;
            }
        });
    }

    renderProducts() {
        const container = document.getElementById('products-content');
        if (!container) return;

        window.dashboardUI.showLoading('Cargando productos...');

        try {
            if (this.currentProducts.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-box-open"></i>
                        </div>
                        <h3>No hay productos</h3>
                        <p>Comienza agregando tu primer producto</p>
                        <button class="btn btn-primary" onclick="productManager.showProductForm()">
                            <i class="fas fa-plus"></i>
                            Agregar Producto
                        </button>
                    </div>
                `;
            } else {
                const headers = ['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Disponible'];
                const tableData = this.currentProducts.map(product => ({
                    id: product.id,
                    imagen: product.images?.[0] || '',
                    nombre: product.name,
                    categoría: this.getCategoryName(product.categoryId),
                    precio: product.price,
                    stock: product.stock,
                    disponible: product.available
                }));

                const actions = [
                    {
                        icon: 'fas fa-edit',
                        class: 'btn-warning',
                        title: 'Editar',
                        onclick: 'productManager.editProduct(this.dataset.id)'
                    },
                    {
                        icon: 'fas fa-trash',
                        class: 'btn-danger',
                        title: 'Eliminar',
                        onclick: 'productManager.deleteProduct(this.dataset.id)'
                    },
                    {
                        icon: 'fas fa-eye',
                        class: 'btn-info',
                        title: 'Ver',
                        onclick: 'productManager.viewProduct(this.dataset.id)'
                    }
                ];

                container.innerHTML = window.dashboardUI.createTable(headers, tableData, actions);
            }
        } catch (error) {
            console.error('Error renderizando productos:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error cargando productos</p>
                    <button class="btn btn-primary" onclick="productManager.renderProducts()">
                        Reintentar
                    </button>
                </div>
            `;
        } finally {
            window.dashboardUI.hideLoading();
        }
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Sin categoría';
    }

    showProductForm(productId = null) {
        const isEdit = productId !== null;
        const product = isEdit ? this.currentProducts.find(p => p.id === parseInt(productId)) : null;

        const categoryOptions = this.categories.map(cat => ({
            value: cat.id,
            text: cat.name
        }));

        const formFields = [
            {
                name: 'name',
                label: 'Nombre del producto',
                type: 'text',
                placeholder: 'Ej: Croissant Artesanal',
                value: product?.name || '',
                required: true
            },
            {
                name: 'description',
                label: 'Descripción',
                type: 'textarea',
                placeholder: 'Descripción detallada del producto...',
                value: product?.description || '',
                rows: 4,
                required: true
            },
            {
                name: 'shortDescription',
                label: 'Descripción corta',
                type: 'text',
                placeholder: 'Descripción breve para tarjetas',
                value: product?.shortDescription || '',
                required: true
            },
            {
                name: 'categoryId',
                label: 'Categoría',
                type: 'select',
                placeholder: 'Selecciona una categoría',
                options: categoryOptions,
                value: product?.categoryId || '',
                required: true
            },
            {
                name: 'price',
                label: 'Precio ($)',
                type: 'number',
                placeholder: '0.00',
                value: product?.price || '',
                min: '0',
                step: '0.01',
                required: true
            },
            {
                name: 'originalPrice',
                label: 'Precio original ($)',
                type: 'number',
                placeholder: '0.00',
                value: product?.originalPrice || '',
                min: '0',
                step: '0.01',
                help: 'Dejar vacío si no hay descuento'
            },
            {
                name: 'stock',
                label: 'Stock disponible',
                type: 'number',
                placeholder: '0',
                value: product?.stock || '',
                min: '0',
                required: true
            },
            {
                name: 'weight',
                label: 'Peso/Tamaño',
                type: 'text',
                placeholder: 'Ej: 80g, 1 unidad',
                value: product?.weight || '',
                required: true
            },
            {
                name: 'images',
                label: 'URL de imagen',
                type: 'url',
                placeholder: 'https://ejemplo.com/imagen.jpg',
                value: product?.images?.[0] || '',
                required: true,
                help: 'URL de la imagen principal del producto'
            },
            {
                name: 'tags',
                label: 'Etiquetas',
                type: 'text',
                placeholder: 'artesanal, premium, chocolate',
                value: product?.tags?.join(', ') || '',
                help: 'Separadas por comas'
            },
            {
                name: 'featured',
                label: 'Producto destacado',
                type: 'checkbox',
                checkboxLabel: 'Mostrar como producto destacado',
                value: product?.featured || false
            },
            {
                name: 'available',
                label: 'Disponible',
                type: 'checkbox',
                checkboxLabel: 'Producto disponible para venta',
                value: product?.available !== false
            }
        ];

        const modal = window.dashboardUI.createModal({
            title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
            content: window.dashboardUI.createForm(formFields, isEdit ? 'Actualizar' : 'Crear'),
            footer: ''
        });

        const form = modal.querySelector('.dashboard-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit(form, isEdit, productId);
        });
    }

    async handleProductSubmit(form, isEdit, productId) {
        const formData = new FormData(form);
        const data = {};

        // Procesar datos del formulario
        for (let [key, value] of formData.entries()) {
            if (key === 'tags') {
                data[key] = value ? value.split(',').map(tag => tag.trim()) : [];
            } else if (key === 'images') {
                data[key] = value ? [value] : [];
            } else if (key === 'price' || key === 'originalPrice' || key === 'stock' || key === 'categoryId') {
                data[key] = value ? parseFloat(value) : (key === 'originalPrice' ? null : 0);
            } else {
                data[key] = value;
            }
        }

        // Manejar checkboxes
        data.featured = form.querySelector('[name="featured"]').checked;
        data.available = form.querySelector('[name="available"]').checked;

        // Campos adicionales
        if (!isEdit) {
            data.slug = this.createSlug(data.name);
            data.categorySlug = this.getCategorySlug(data.categoryId);
            data.rating = 0;
            data.reviews = 0;
            data.allergens = [];
            data.nutritionalInfo = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0
            };
        }

        // Calcular descuento si hay precio original
        if (data.originalPrice && data.originalPrice > data.price) {
            data.discount = ((data.originalPrice - data.price) / data.originalPrice * 100).toFixed(1);
        } else {
            data.discount = 0;
            data.originalPrice = data.price;
        }

        try {
            window.dashboardUI.showLoading(isEdit ? 'Actualizando producto...' : 'Creando producto...');

            const result = isEdit
                ? await window.dataManager.updateProduct(productId, data)
                : await window.dataManager.addProduct(data);

            if (result.success) {
                window.dashboardUI.showToast(
                    isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                    'success'
                );
                form.closest('.modal-overlay').remove();
            } else {
                window.dashboardUI.showToast(result.error || 'Error procesando producto', 'error');
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            window.dashboardUI.showToast('Error procesando producto', 'error');
        } finally {
            window.dashboardUI.hideLoading();
        }
    }

    editProduct(productId) {
        this.showProductForm(productId);
    }

    deleteProduct(productId) {
        const product = this.currentProducts.find(p => p.id === parseInt(productId));
        if (!product) return;

        window.dashboardUI.confirmDelete(
            'Eliminar Producto',
            `¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`,
            async () => {
                try {
                    window.dashboardUI.showLoading('Eliminando producto...');

                    const result = await window.dataManager.deleteProduct(productId);

                    if (result.success) {
                        window.dashboardUI.showToast('Producto eliminado correctamente', 'success');
                    } else {
                        window.dashboardUI.showToast(result.error || 'Error eliminando producto', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                    window.dashboardUI.showToast('Error eliminando producto', 'error');
                } finally {
                    window.dashboardUI.hideLoading();
                }
            }
        );
    }

    viewProduct(productId) {
        const product = this.currentProducts.find(p => p.id === parseInt(productId));
        if (!product) return;

        const category = this.categories.find(cat => cat.id === product.categoryId);

        const modal = window.dashboardUI.createModal({
            title: product.name,
            content: `
                <div class="product-preview">
                    <div class="product-image-preview">
                        <img src="${product.images?.[0] || ''}" alt="${product.name}">
                    </div>
                    <div class="product-details">
                        <div class="detail-row">
                            <strong>Categoría:</strong> ${category?.name || 'Sin categoría'}
                        </div>
                        <div class="detail-row">
                            <strong>Precio:</strong> $${product.price}
                            ${product.discount > 0 ? `<span class="discount">(${product.discount}% OFF)</span>` : ''}
                        </div>
                        <div class="detail-row">
                            <strong>Stock:</strong> ${product.stock} unidades
                        </div>
                        <div class="detail-row">
                            <strong>Peso/Tamaño:</strong> ${product.weight}
                        </div>
                        <div class="detail-row">
                            <strong>Estado:</strong>
                            <span class="badge ${product.available ? 'badge-success' : 'badge-danger'}">
                                ${product.available ? 'Disponible' : 'No Disponible'}
                            </span>
                        </div>
                        <div class="detail-row">
                            <strong>Destacado:</strong> ${product.featured ? 'Sí' : 'No'}
                        </div>
                        <div class="detail-row">
                            <strong>Descripción:</strong>
                            <p>${product.description}</p>
                        </div>
                        ${product.tags?.length ? `
                        <div class="detail-row">
                            <strong>Etiquetas:</strong>
                            <div class="tags">
                                ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `,
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Cerrar
                </button>
                <button type="button" class="btn btn-primary" onclick="productManager.editProduct('${productId}'); this.closest('.modal-overlay').remove();">
                    Editar Producto
                </button>
            `
        });
    }

    createSlug(name) {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim('-');
    }

    getCategorySlug(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category?.filterSlug || category?.slug || 'general';
    }
}

// Instancia global
window.ProductManager = ProductManager;
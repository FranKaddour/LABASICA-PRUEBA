/**
 * Category Manager - Sistema de gestión de categorías para el dashboard
 */

class CategoryManager {
    constructor() {
        this.currentCategories = [];
        this.init();
    }

    async init() {
        try {
            // Cargar categorías iniciales
            await this.loadCategories();

            // Configurar event listeners
            this.setupEventListeners();

            // Renderizar categorías iniciales
            this.renderCategories();

            console.log('CategoryManager inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando CategoryManager:', error);
            window.dashboardUI.showToast('Error cargando categorías', 'error');
        }
    }

    async loadCategories() {
        try {
            const data = await window.dataManager.getCategories();
            this.currentCategories = data?.categories || [];
        } catch (error) {
            console.error('Error cargando categorías:', error);
            this.currentCategories = [];
        }
    }

    setupEventListeners() {
        // Botón nueva categoría
        const newCategoryBtn = document.getElementById('newCategoryBtn');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', () => this.showCategoryForm());
        }

        // Escuchar cambios de datos
        window.dataManager.addListener((event, data) => {
            switch (event) {
                case 'categoryAdded':
                case 'categoryUpdated':
                case 'categoryDeleted':
                    this.loadCategories().then(() => this.renderCategories());
                    break;
            }
        });
    }

    renderCategories() {
        const container = document.getElementById('categories-content');
        if (!container) return;

        window.dashboardUI.showLoading('Cargando categorías...');

        try {
            if (this.currentCategories.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-tags"></i>
                        </div>
                        <h3>No hay categorías</h3>
                        <p>Comienza agregando tu primera categoría</p>
                        <button class="btn btn-primary" onclick="categoryManager.showCategoryForm()">
                            <i class="fas fa-plus"></i>
                            Agregar Categoría
                        </button>
                    </div>
                `;
            } else {
                // Renderizar como grid de cards para mejor visualización
                container.innerHTML = `
                    <div class="categories-grid">
                        ${this.currentCategories.map(category => this.createCategoryCard(category)).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error renderizando categorías:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error cargando categorías</p>
                    <button class="btn btn-primary" onclick="categoryManager.renderCategories()">
                        Reintentar
                    </button>
                </div>
            `;
        } finally {
            window.dashboardUI.hideLoading();
        }
    }

    createCategoryCard(category) {
        const featuredBadge = category.featured ? '<span class="badge badge-warning">Destacada</span>' : '';

        return `
            <div class="category-card" data-id="${category.id}">
                <div class="category-image" style="background-image: url('${category.image}'); background-color: ${category.color};">
                    ${featuredBadge}
                </div>
                <div class="category-content">
                    <h4 class="category-name">${category.name}</h4>
                    <p class="category-description">${category.description}</p>
                    <div class="category-meta">
                        <span class="category-slug">${category.slug}</span>
                        <span class="category-filter">${category.filterSlug || 'Sin filtro'}</span>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="action-btn btn-info" onclick="categoryManager.viewCategory('${category.id}')" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-warning" onclick="categoryManager.editCategory('${category.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-danger" onclick="categoryManager.deleteCategory('${category.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    showCategoryForm(categoryId = null) {
        const isEdit = categoryId !== null;
        const category = isEdit ? this.currentCategories.find(c => c.id === parseInt(categoryId)) : null;

        const formFields = [
            {
                name: 'name',
                label: 'Nombre de la categoría',
                type: 'text',
                placeholder: 'Ej: Pasteles y Tartas',
                value: category?.name || '',
                required: true
            },
            {
                name: 'description',
                label: 'Descripción',
                type: 'textarea',
                placeholder: 'Descripción de la categoría...',
                value: category?.description || '',
                rows: 3,
                required: true
            },
            {
                name: 'slug',
                label: 'Slug (URL)',
                type: 'text',
                placeholder: 'pasteles-tartas',
                value: category?.slug || '',
                required: true,
                help: 'URL amigable para la categoría (sin espacios ni caracteres especiales)'
            },
            {
                name: 'filterSlug',
                label: 'Slug de filtro',
                type: 'text',
                placeholder: 'tartas',
                value: category?.filterSlug || '',
                required: true,
                help: 'Identificador para el sistema de filtros en productos'
            },
            {
                name: 'image',
                label: 'URL de imagen',
                type: 'url',
                placeholder: 'https://ejemplo.com/imagen.jpg',
                value: category?.image || '',
                required: true,
                help: 'Imagen representativa de la categoría'
            },
            {
                name: 'color',
                label: 'Color de la categoría',
                type: 'color',
                value: category?.color || '#8B4513',
                help: 'Color temático para la categoría'
            },
            {
                name: 'featured',
                label: 'Categoría destacada',
                type: 'checkbox',
                checkboxLabel: 'Mostrar como categoría destacada',
                value: category?.featured || false
            }
        ];

        const modal = window.dashboardUI.createModal({
            title: isEdit ? 'Editar Categoría' : 'Nueva Categoría',
            content: window.dashboardUI.createForm(formFields, isEdit ? 'Actualizar' : 'Crear'),
            footer: ''
        });

        const form = modal.querySelector('.dashboard-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit(form, isEdit, categoryId);
        });

        // Auto-generar slug cuando cambie el nombre
        if (!isEdit) {
            const nameField = form.querySelector('[name="name"]');
            const slugField = form.querySelector('[name="slug"]');
            const filterSlugField = form.querySelector('[name="filterSlug"]');

            nameField.addEventListener('input', () => {
                const slug = this.createSlug(nameField.value);
                slugField.value = slug;
                filterSlugField.value = slug.split('-')[0]; // Primera palabra como filter
            });
        }
    }

    async handleCategorySubmit(form, isEdit, categoryId) {
        const formData = new FormData(form);
        const data = {};

        // Procesar datos del formulario
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Manejar checkboxes
        data.featured = form.querySelector('[name="featured"]').checked;

        // Validar slug único
        const existingCategory = this.currentCategories.find(cat =>
            cat.slug === data.slug && cat.id !== parseInt(categoryId)
        );

        if (existingCategory) {
            window.dashboardUI.showToast('Ya existe una categoría con ese slug', 'error');
            return;
        }

        try {
            window.dashboardUI.showLoading(isEdit ? 'Actualizando categoría...' : 'Creando categoría...');

            const result = isEdit
                ? await window.dataManager.updateCategory(categoryId, data)
                : await window.dataManager.addCategory(data);

            if (result.success) {
                window.dashboardUI.showToast(
                    isEdit ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente',
                    'success'
                );
                form.closest('.modal-overlay').remove();
            } else {
                window.dashboardUI.showToast(result.error || 'Error procesando categoría', 'error');
            }
        } catch (error) {
            console.error('Error submitting category:', error);
            window.dashboardUI.showToast('Error procesando categoría', 'error');
        } finally {
            window.dashboardUI.hideLoading();
        }
    }

    editCategory(categoryId) {
        this.showCategoryForm(categoryId);
    }

    async deleteCategory(categoryId) {
        const category = this.currentCategories.find(c => c.id === parseInt(categoryId));
        if (!category) return;

        // Verificar si hay productos usando esta categoría
        try {
            const products = await window.dataManager.getProductsByCategory(categoryId);
            if (products.length > 0) {
                window.dashboardUI.showToast(
                    `No se puede eliminar. Hay ${products.length} productos usando esta categoría`,
                    'error'
                );
                return;
            }
        } catch (error) {
            console.error('Error checking products:', error);
        }

        window.dashboardUI.confirmDelete(
            'Eliminar Categoría',
            `¿Estás seguro de que deseas eliminar "${category.name}"? Esta acción no se puede deshacer.`,
            async () => {
                try {
                    window.dashboardUI.showLoading('Eliminando categoría...');

                    const result = await window.dataManager.deleteCategory(categoryId);

                    if (result.success) {
                        window.dashboardUI.showToast('Categoría eliminada correctamente', 'success');
                    } else {
                        window.dashboardUI.showToast(result.error || 'Error eliminando categoría', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    window.dashboardUI.showToast('Error eliminando categoría', 'error');
                } finally {
                    window.dashboardUI.hideLoading();
                }
            }
        );
    }

    viewCategory(categoryId) {
        const category = this.currentCategories.find(c => c.id === parseInt(categoryId));
        if (!category) return;

        const modal = window.dashboardUI.createModal({
            title: category.name,
            content: `
                <div class="category-preview">
                    <div class="category-image-preview">
                        <img src="${category.image}" alt="${category.name}" style="border: 3px solid ${category.color};">
                    </div>
                    <div class="category-details">
                        <div class="detail-row">
                            <strong>Descripción:</strong>
                            <p>${category.description}</p>
                        </div>
                        <div class="detail-row">
                            <strong>Slug:</strong> ${category.slug}
                        </div>
                        <div class="detail-row">
                            <strong>Filtro:</strong> ${category.filterSlug || 'Sin filtro'}
                        </div>
                        <div class="detail-row">
                            <strong>Color:</strong>
                            <span style="display: inline-block; width: 20px; height: 20px; background: ${category.color}; border-radius: 3px; vertical-align: middle;"></span>
                            ${category.color}
                        </div>
                        <div class="detail-row">
                            <strong>Destacada:</strong> ${category.featured ? 'Sí' : 'No'}
                        </div>
                        <div class="detail-row">
                            <strong>Creada:</strong> ${new Date(category.createdAt).toLocaleDateString()}
                        </div>
                        <div class="detail-row">
                            <strong>Actualizada:</strong> ${new Date(category.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Cerrar
                </button>
                <button type="button" class="btn btn-primary" onclick="categoryManager.editCategory('${categoryId}'); this.closest('.modal-overlay').remove();">
                    Editar Categoría
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

    async getProductsByCategory(categoryId) {
        try {
            return await window.dataManager.getProductsByCategory(categoryId);
        } catch (error) {
            console.error('Error getting products by category:', error);
            return [];
        }
    }
}

// Instancia global
window.CategoryManager = CategoryManager;
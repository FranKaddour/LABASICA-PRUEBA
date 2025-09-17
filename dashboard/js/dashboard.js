/**
 * Dashboard Principal - LA BASICA Admin Panel
 * Gestiona la navegación, autenticación y funcionalidades generales del dashboard
 */

class Dashboard {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.productManager = null;
        this.categoryManager = null;

        this.init();
    }

    /**
     * Inicializa el dashboard
     */
    async init() {
        console.log('Dashboard initializing...');

        try {
            // Verificar autenticación
            await this.checkAuthentication();

            // Configurar navegación
            this.setupNavigation();

            // Configurar eventos
            this.setupEventListeners();

            // Cargar datos iniciales
            await this.loadInitialData();

            // Mostrar sección actual
            this.showSection(this.currentSection);

            console.log('Dashboard initialized successfully');

        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.redirectToLogin();
        }
    }

    /**
     * Verifica la autenticación del usuario
     */
    async checkAuthentication() {
        // Verificar primero si hay sesión manual (temporal)
        const tempSession = this.checkTempSession();
        if (tempSession) {
            this.currentUser = tempSession.user;
            this.updateUserInterface();
            return;
        }

        // Si no hay sesión manual, verificar AuthManager
        if (!window.authManager) {
            await this.waitForAuthManager();
        }

        const isAuthenticated = window.authManager.checkAuth();
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }

        this.currentUser = window.authManager.getCurrentUser();
        if (!this.currentUser) {
            throw new Error('No user data available');
        }

        // Verificar si es empleado autorizado
        await this.verifyEmployeeAccess();

        // Actualizar UI con datos del usuario
        this.updateUserInterface();
    }

    /**
     * Verifica si hay una sesión temporal (login manual)
     */
    checkTempSession() {
        try {
            const hasTempSession = localStorage.getItem('dashboard_temp_session');
            if (!hasTempSession) return null;

            const authData = localStorage.getItem('la_basica_auth');
            if (!authData) return null;

            const sessionData = JSON.parse(authData);

            // Verificar si la sesión no ha expirado
            const now = new Date();
            const expiresAt = new Date(sessionData.expiresAt);

            if (now > expiresAt) {
                this.clearTempSession();
                return null;
            }

            return sessionData;
        } catch (error) {
            console.error('Error checking temp session:', error);
            return null;
        }
    }

    /**
     * Limpia la sesión temporal
     */
    clearTempSession() {
        localStorage.removeItem('dashboard_temp_session');
        localStorage.removeItem('la_basica_auth');
    }

    /**
     * Espera a que AuthManager esté disponible
     */
    async waitForAuthManager() {
        return new Promise((resolve) => {
            const checkAuthManager = () => {
                if (window.authManager && window.authManager.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkAuthManager, 100);
                }
            };
            checkAuthManager();
        });
    }

    /**
     * Verifica que el usuario sea un empleado autorizado
     */
    async verifyEmployeeAccess() {
        try {
            const response = await fetch('/data/employees.json');
            if (!response.ok) {
                throw new Error('Employee data not available');
            }

            const employeeData = await response.json();
            const employee = employeeData.authorizedEmployees.find(
                emp => emp.email.toLowerCase() === this.currentUser.email.toLowerCase()
            );

            if (!employee) {
                throw new Error('Access denied - Not an authorized employee');
            }

            this.currentUser.role = employee.role;
            this.currentUser.permissions = employee.permissions;

            console.log('Employee access verified:', employee.name);

        } catch (error) {
            console.error('Employee verification failed:', error);
            throw error;
        }
    }

    /**
     * Actualiza la interfaz con los datos del usuario
     */
    updateUserInterface() {
        const userNameEl = document.getElementById('dashboardUserName');
        const userRoleEl = document.getElementById('dashboardUserRole');
        const userImageEl = document.getElementById('dashboardUserImage');
        const defaultAvatarEl = document.getElementById('dashboardDefaultAvatar');

        if (userNameEl) {
            userNameEl.textContent = this.currentUser.givenName || this.currentUser.name || 'Usuario';
        }

        if (userRoleEl) {
            userRoleEl.textContent = this.currentUser.role || 'Empleado';
        }

        // Actualizar avatar
        if (this.currentUser.picture && userImageEl) {
            userImageEl.src = this.currentUser.picture;
            userImageEl.style.display = 'block';
            if (defaultAvatarEl) defaultAvatarEl.style.display = 'none';
        } else if (defaultAvatarEl) {
            defaultAvatarEl.style.display = 'block';
        }
    }

    /**
     * Configura la navegación del dashboard
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.dashboard-nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('dashboardLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // New product button (in products section)
        const newProductBtn = document.getElementById('newProductBtn');
        if (newProductBtn) {
            newProductBtn.addEventListener('click', () => {
                if (this.productManager) {
                    this.productManager.showCreateModal();
                }
            });
        }

        // New category button (in categories section)
        const newCategoryBtn = document.getElementById('newCategoryBtn');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', () => {
                if (this.categoryManager) {
                    this.categoryManager.showCreateModal();
                }
            });
        }

        // Mobile menu functionality
        this.setupMobileMenu();
    }

    /**
     * Configura el menú móvil
     */
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('dashboardSidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (mobileMenuBtn && sidebar && overlay) {
            // Toggle sidebar on menu button click
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close sidebar on overlay click
            overlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });

            // Close sidebar on navigation link click (mobile)
            const navLinks = document.querySelectorAll('.dashboard-nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    /**
     * Alterna el menú móvil
     */
    toggleMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('dashboardSidebar');
        const overlay = document.getElementById('mobileOverlay');

        if (sidebar.classList.contains('mobile-open')) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Abre el menú móvil
     */
    openMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('dashboardSidebar');
        const overlay = document.getElementById('mobileOverlay');

        sidebar.classList.add('mobile-open');
        overlay.classList.add('active');
        mobileMenuBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    /**
     * Cierra el menú móvil
     */
    closeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('dashboardSidebar');
        const overlay = document.getElementById('mobileOverlay');

        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    /**
     * Muestra una sección específica del dashboard
     */
    showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Actualizar navegación activa
        const navLinks = document.querySelectorAll('.dashboard-nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        const activeNavLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Cargar contenido de la sección
        this.loadSectionContent(sectionName);
    }

    /**
     * Carga el contenido específico de una sección
     */
    async loadSectionContent(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardStats();
                break;
            case 'products':
                if (this.productManager) {
                    await this.productManager.loadProducts();
                }
                break;
            case 'categories':
                if (this.categoryManager) {
                    await this.categoryManager.loadCategories();
                }
                break;
            default:
                break;
        }
    }

    /**
     * Carga los datos iniciales del dashboard
     */
    async loadInitialData() {
        try {
            // Inicializar managers
            if (window.ProductManager) {
                this.productManager = new ProductManager(this);
            }

            if (window.CategoryManager) {
                this.categoryManager = new CategoryManager(this);
            }

            // Cargar estadísticas
            await this.loadDashboardStats();

        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    /**
     * Carga las estadísticas del dashboard
     */
    async loadDashboardStats() {
        try {
            // Cargar productos
            const productsResponse = await fetch('/data/products.json');
            const productsData = productsResponse.ok ? await productsResponse.json() : { products: [], metadata: {} };

            // Cargar categorías
            const categoriesResponse = await fetch('/data/categories.json');
            const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : { categories: [], metadata: {} };

            // Actualizar contadores
            const totalProductsEl = document.getElementById('totalProducts');
            const totalCategoriesEl = document.getElementById('totalCategories');

            if (totalProductsEl) {
                totalProductsEl.textContent = productsData.products.length || 0;
            }

            if (totalCategoriesEl) {
                totalCategoriesEl.textContent = categoriesData.categories.length || 0;
            }

            // Cargar productos destacados
            this.loadFeaturedProducts(productsData.products);

        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            this.showToast('Error al cargar estadísticas', 'error');
        }
    }

    /**
     * Carga los productos destacados en el dashboard
     */
    loadFeaturedProducts(products) {
        const featuredProductsList = document.getElementById('featuredProductsList');
        if (!featuredProductsList || !products) return;

        const featuredProducts = products.filter(product => product.featured).slice(0, 3);

        if (featuredProducts.length === 0) {
            featuredProductsList.innerHTML = '<p>No hay productos destacados</p>';
            return;
        }

        featuredProductsList.innerHTML = featuredProducts.map(product => `
            <div class="featured-product-item">
                <img src="${product.images[0]}" alt="${product.name}" class="featured-product-image">
                <div class="featured-product-info">
                    <h4>${product.name}</h4>
                    <p class="featured-product-price">$${product.price}</p>
                    <span class="featured-product-rating">
                        <i class="fas fa-star"></i> ${product.rating || 'N/A'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Cierra sesión y redirige
     */
    logout() {
        const userName = this.currentUser?.givenName || this.currentUser?.name || 'Usuario';

        // Mostrar alert de confirmación
        this.showCustomAlert({
            icon: 'fas fa-sign-out-alt',
            title: 'Cerrar Sesión',
            message: `¿Estás seguro que deseas cerrar tu sesión, ${userName}?`,
            type: 'confirm',
            onConfirm: () => {
                // Limpiar sesión temporal si existe
                this.clearTempSession();

                // Cerrar sesión de Google si existe
                if (window.authManager) {
                    window.authManager.signOut();
                }

                // Mostrar mensaje de despedida
                this.showCustomAlert({
                    icon: 'fas fa-heart',
                    title: '¡Hasta pronto!',
                    message: `Nos vemos pronto, ${userName}. ¡Que tengas un excelente día! 👋`,
                    type: 'info',
                    onConfirm: () => {
                        this.redirectToLogin();
                    }
                });
            }
        });
    }

    /**
     * Redirige a la página de login
     */
    redirectToLogin() {
        window.location.href = 'login.html';
    }

    /**
     * Muestra un toast de notificación
     */
    showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * Obtiene el icono para el toast según el tipo
     */
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Muestra/oculta el overlay de carga
     */
    showLoading(show = true) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('active');
            } else {
                loadingOverlay.classList.remove('active');
            }
        }
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Obtiene la instancia del ProductManager
     */
    getProductManager() {
        return this.productManager;
    }

    /**
     * Obtiene la instancia del CategoryManager
     */
    getCategoryManager() {
        return this.categoryManager;
    }

    /**
     * Muestra un alert personalizado con el estilo del sitio
     */
    showCustomAlert(options) {
        const {
            icon = 'fas fa-info-circle',
            title = 'Información',
            message = '',
            type = 'info', // 'info', 'confirm', 'success', 'warning', 'error'
            onConfirm = null,
            onCancel = null,
            confirmText = 'Aceptar',
            cancelText = 'Cancelar'
        } = options;

        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';

        // Crear alert
        const alert = document.createElement('div');
        alert.className = 'custom-alert';

        // Crear contenido del alert
        alert.innerHTML = `
            <div class="custom-alert-header">
                <div class="custom-alert-icon">
                    <i class="${icon}"></i>
                </div>
                <h3 class="custom-alert-title">${title}</h3>
            </div>
            <div class="custom-alert-body">
                <p class="custom-alert-message">${message}</p>
            </div>
            <div class="custom-alert-actions">
                ${type === 'confirm' ? `
                    <button class="custom-alert-btn custom-alert-btn-secondary" data-action="cancel">
                        ${cancelText}
                    </button>
                ` : ''}
                <button class="custom-alert-btn custom-alert-btn-primary" data-action="confirm">
                    ${confirmText}
                </button>
            </div>
        `;

        // Agregar alert al overlay
        overlay.appendChild(alert);

        // Agregar al DOM
        document.body.appendChild(overlay);

        // Mostrar con animación
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);

        // Configurar eventos de botones
        const confirmBtn = alert.querySelector('[data-action="confirm"]');
        const cancelBtn = alert.querySelector('[data-action="cancel"]');

        // Función para cerrar el alert
        const closeAlert = () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        };

        // Event listener para confirmar
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                closeAlert();
                if (onConfirm) {
                    onConfirm();
                }
            });
        }

        // Event listener para cancelar
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeAlert();
                if (onCancel) {
                    onCancel();
                }
            });
        }

        // Cerrar al hacer clic fuera del alert
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAlert();
                if (onCancel) {
                    onCancel();
                }
            }
        });

        // Cerrar con tecla ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeAlert();
                if (onCancel) {
                    onCancel();
                }
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
}

// Estilos adicionales para productos destacados
const additionalStyles = `
    .featured-product-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(210, 180, 140, 0.1);
    }

    .featured-product-item:last-child {
        border-bottom: none;
    }

    .featured-product-image {
        width: 50px;
        height: 50px;
        border-radius: var(--border-radius-md);
        object-fit: cover;
    }

    .featured-product-info h4 {
        font-size: 0.875rem;
        font-weight: var(--font-weight-semibold);
        margin: 0;
        color: var(--text-dark);
    }

    .featured-product-price {
        font-size: 0.75rem;
        color: var(--accent-orange);
        font-weight: var(--font-weight-semibold);
        margin: 0.25rem 0;
    }

    .featured-product-rating {
        font-size: 0.75rem;
        color: var(--warning-color);
    }

    .featured-product-rating i {
        margin-right: 0.25rem;
    }
`;

// Agregar estilos adicionales
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
}

// Exportar clase
window.Dashboard = Dashboard;

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
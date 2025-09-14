/**
 * Header Auth Manager - Maneja la visualización de estados de autenticación en el header
 */

class HeaderAuth {
    constructor() {
        this.elements = {};
        this.dropdownOpen = false;
        this.init();
    }

    /**
     * Inicializa el HeaderAuth
     */
    async init() {
        console.log('HeaderAuth initializing...');
        await this.waitForHeader();
        this.cacheElements();
        this.setupEventListeners();
        this.waitForAuthManager();
        console.log('HeaderAuth initialized');
    }

    /**
     * Espera a que el header se cargue completamente
     */
    async waitForHeader() {
        console.log('Waiting for header to load...');
        return new Promise((resolve) => {
            const checkHeader = () => {
                const userProfileSystem = document.getElementById('userProfileSystem');
                const profileBtnUnauth = document.getElementById('profileBtnUnauth');
                if (userProfileSystem && profileBtnUnauth) {
                    console.log('Header loaded successfully');
                    resolve();
                } else {
                    console.log('Header not ready yet, retrying in 100ms...');
                    setTimeout(checkHeader, 100);
                }
            };
            checkHeader();
        });
    }

    /**
     * Cachea referencias a elementos del DOM
     */
    cacheElements() {
        console.log('Caching elements...');

        // Unified Profile System
        this.elements.userProfileSystem = document.getElementById('userProfileSystem');
        this.elements.profileBtnUnauth = document.getElementById('profileBtnUnauth');
        this.elements.userProfileAuth = document.getElementById('userProfileAuth');
        this.elements.profileBtnAuth = document.getElementById('profileBtnAuth');

        console.log('userProfileSystem found:', !!this.elements.userProfileSystem);
        console.log('profileBtnUnauth found:', !!this.elements.profileBtnUnauth);
        console.log('userProfileAuth found:', !!this.elements.userProfileAuth);
        console.log('profileBtnAuth found:', !!this.elements.profileBtnAuth);

        // User info elements
        this.elements.userAvatar = document.getElementById('userAvatar');
        this.elements.defaultAvatar = document.getElementById('defaultAvatar');
        this.elements.userNameHeader = document.getElementById('userNameHeader');
        this.elements.userRoleHeader = document.getElementById('userRoleHeader');

        // Dropdown elements
        this.elements.profileDropdownMenu = document.getElementById('profileDropdownMenu');
        this.elements.dropdownAvatar = document.getElementById('dropdownAvatar');
        this.elements.dropdownDefaultAvatar = document.getElementById('dropdownDefaultAvatar');
        this.elements.dropdownUserName = document.getElementById('dropdownUserName');
        this.elements.dropdownUserEmail = document.getElementById('dropdownUserEmail');
        this.elements.dropdownUserRole = document.getElementById('dropdownUserRole');
        this.elements.dropdownMenuItems = document.getElementById('dropdownMenuItems');
        this.elements.logoutBtn = document.getElementById('logoutBtn');

        console.log('profileDropdownMenu found:', !!this.elements.profileDropdownMenu);
        console.log('dropdownMenuItems found:', !!this.elements.dropdownMenuItems);
        console.log('logoutBtn found:', !!this.elements.logoutBtn);

        // Mobile elements
        this.elements.mobileLoginItem = document.getElementById('mobileLoginItem');
        this.elements.mobileLoginBtn = document.getElementById('mobileLoginBtn');
        this.elements.mobileProfileItem = document.getElementById('mobileProfileItem');
        this.elements.mobileProfileBtn = document.getElementById('mobileProfileBtn');
        this.elements.mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

        // Auth modal container
        this.elements.authModalContainer = document.getElementById('authModalContainer');
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        console.log('Setting up unified profile event listeners...');
        console.log('profileBtnUnauth element:', this.elements.profileBtnUnauth);
        console.log('profileBtnAuth element:', this.elements.profileBtnAuth);

        // Unauthenticated profile button
        if (this.elements.profileBtnUnauth) {
            console.log('Adding click listener to unauthenticated profile button');
            this.elements.profileBtnUnauth.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Unauthenticated profile button clicked');
                this.showAuthModal();
            });
        } else {
            console.error('profileBtnUnauth element not found!');
        }

        // Authenticated profile button (dropdown toggle)
        if (this.elements.profileBtnAuth) {
            console.log('Adding click listener to authenticated profile button');
            this.elements.profileBtnAuth.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Authenticated profile button clicked');
                this.toggleDropdown();
            });
        } else {
            console.log('profileBtnAuth element not found (normal if user is not authenticated)');
        }

        // Desktop logout button
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Mobile profile event listeners
        if (this.elements.mobileLoginBtn) {
            this.elements.mobileLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mobile login clicked');
                this.showAuthModal();
            });
        }

        if (this.elements.mobileProfileBtn) {
            this.elements.mobileProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mobile profile clicked');
                this.handleMobileProfileClick();
            });
        }

        if (this.elements.mobileLogoutBtn) {
            this.elements.mobileLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Mobile logout clicked');
                this.logout();
            });
        }


        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.dropdownOpen &&
                this.elements.profileDropdownMenu &&
                this.elements.userProfileAuth &&
                !this.elements.userProfileAuth.contains(e.target)) {
                console.log('Clicked outside dropdown, closing');
                this.closeDropdown();
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dropdownOpen) {
                this.closeDropdown();
            }
        });
    }

    /**
     * Espera a que AuthManager esté disponible y se registra como listener
     */
    async waitForAuthManager() {
        const checkAuthManager = () => {
            if (window.authManager && window.authManager.isInitialized) {
                this.registerAuthListener();
                this.loadAuthModal();
                this.updateUIState();
            } else {
                setTimeout(checkAuthManager, 100);
            }
        };
        checkAuthManager();
    }

    /**
     * Registra listener para eventos de autenticación
     */
    registerAuthListener() {
        window.authManager.addAuthListener((event, data) => {
            switch (event) {
                case 'login':
                    this.handleLogin(data.user);
                    break;
                case 'logout':
                    this.handleLogout();
                    break;
                case 'initialized':
                    this.updateUIState();
                    break;
            }
        });
    }

    /**
     * Carga el modal de autenticación en el header
     */
    async loadAuthModal() {
        if (!this.elements.authModalContainer) return;

        try {
            // Determinar la ruta correcta basada en la página actual
            const currentPath = window.location.pathname;
            let modalPath = '../components/auth-modal.html';

            // Si estamos en la página principal (index.html)
            if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
                modalPath = 'components/auth-modal.html';
            }

            const response = await fetch(modalPath);
            if (response.ok) {
                const modalHTML = await response.text();
                this.elements.authModalContainer.innerHTML = modalHTML;
                console.log('Auth modal loaded successfully');

                // Configurar event listeners después de cargar el modal
                this.setupModalEventListeners();
            } else {
                console.error('Failed to load auth modal:', response.status);
            }
        } catch (error) {
            console.error('Error loading auth modal:', error);
        }
    }

    /**
     * Configura los event listeners del modal después de cargarlo
     */
    setupModalEventListeners() {
        // Botón de cerrar modal
        const closeBtn = document.getElementById('closeAuthModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.authManager) {
                    window.authManager.hideAuthModal();
                }
            });
        }

        // Click fuera del modal para cerrar
        const overlay = document.getElementById('authModal');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    if (window.authManager) {
                        window.authManager.hideAuthModal();
                    }
                }
            });
        }

        // Configurar tabs
        this.setupAuthTabs();

        // Configurar Google Sign-In buttons
        this.setupGoogleButtons();

        // Configurar formularios
        this.setupAuthForms();

        // Configurar toggle de contraseña
        this.setupPasswordToggles();

        // Escape key para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('authModal');
                if (modal && modal.classList.contains('active')) {
                    if (window.authManager) {
                        window.authManager.hideAuthModal();
                    }
                }
            }
        });

        console.log('Modal event listeners configured');
    }

    /**
     * Configura los tabs de login/register
     */
    setupAuthTabs() {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginContent = document.getElementById('loginContent');
        const registerContent = document.getElementById('registerContent');

        if (loginTab && registerTab && loginContent && registerContent) {
            loginTab.addEventListener('click', () => {
                // Activar tab de login
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                loginContent.classList.add('active');
                registerContent.classList.remove('active');
            });

            registerTab.addEventListener('click', () => {
                // Activar tab de registro
                registerTab.classList.add('active');
                loginTab.classList.remove('active');
                registerContent.classList.add('active');
                loginContent.classList.remove('active');
            });
        }
    }

    /**
     * Configura los botones de Google Sign-In
     */
    setupGoogleButtons() {
        // Botón de Google Sign-In (login)
        const googleSignInBtn = document.getElementById('googleSignInBtn');
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.authManager) {
                    window.authManager.signInWithGoogle();
                }
            });
        }

        // Botón de Google Sign-Up (registro)
        const googleSignUpBtn = document.getElementById('googleSignUpBtn');
        if (googleSignUpBtn) {
            googleSignUpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.authManager) {
                    window.authManager.signInWithGoogle();
                }
            });
        }
    }

    /**
     * Configura los formularios de login y registro
     */
    setupAuthForms() {
        // Formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLoginSubmit(e);
            });
        }

        // Formulario de registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegisterSubmit(e);
            });
        }
    }

    /**
     * Configura los toggles de mostrar/ocultar contraseña
     */
    setupPasswordToggles() {
        const toggles = [
            'toggleLoginPassword',
            'toggleRegisterPassword',
            'toggleConfirmPassword'
        ];

        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.togglePasswordVisibility(toggle);
                });
            }
        });
    }

    /**
     * Maneja el submit del formulario de login
     */
    async handleLoginSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const rememberMe = formData.get('remember') === 'on';

        const submitBtn = document.getElementById('loginSubmitBtn');
        const originalContent = submitBtn.innerHTML;

        try {
            // Mostrar estado de carga
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <div class="loading-spinner-inline"></div>
                <span>Iniciando sesión...</span>
            `;

            // Intentar login
            if (window.authManager) {
                const result = await window.authManager.signInWithEmailAndPassword(email, password, rememberMe);

                if (result.success) {
                    // Login exitoso - cerrar modal
                    window.authManager.hideAuthModal();
                }
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showFormError('loginForm', error.message);
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Maneja el submit del formulario de registro
     */
    async handleRegisterSubmit(event) {
        const form = event.target;
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        const submitBtn = document.getElementById('registerSubmitBtn');
        const originalContent = submitBtn.innerHTML;

        try {
            // Mostrar estado de carga
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <div class="loading-spinner-inline"></div>
                <span>Creando cuenta...</span>
            `;

            // Intentar registro
            if (window.authManager) {
                const result = await window.authManager.registerWithEmailAndPassword(userData);

                if (result.success) {
                    // Registro exitoso - cerrar modal
                    window.authManager.hideAuthModal();
                }
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showFormError('registerForm', error.message);
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Alterna la visibilidad de la contraseña
     */
    togglePasswordVisibility(toggleBtn) {
        const inputWrapper = toggleBtn.closest('.auth-input-wrapper');
        const passwordInput = inputWrapper.querySelector('input[type="password"], input[type="text"]');
        const icon = toggleBtn.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    /**
     * Muestra un error en el formulario
     */
    showFormError(formId, message) {
        // Limpiar errores previos
        this.clearFormErrors(formId);

        const form = document.getElementById(formId);
        if (!form) return;

        // Crear elemento de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-form-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        // Insertar al inicio del formulario
        form.insertBefore(errorDiv, form.firstChild);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Limpia los errores del formulario
     */
    clearFormErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const errors = form.querySelectorAll('.auth-form-error');
        errors.forEach(error => {
            if (error.parentNode) {
                error.parentNode.removeChild(error);
            }
        });
    }

    /**
     * Actualiza el estado de la UI basado en el estado de autenticación
     */
    updateUIState() {
        const isAuthenticated = window.authManager?.checkAuth();
        const user = window.authManager?.getCurrentUser();

        if (isAuthenticated && user) {
            this.showAuthenticatedState(user);
        } else {
            this.showUnauthenticatedState();
        }
    }

    /**
     * Muestra el estado autenticado
     */
    async showAuthenticatedState(user) {
        console.log('Showing authenticated state for:', user.email);

        // Verificar si es empleado
        const employeeInfo = await this.checkEmployeeStatus(user.email);

        // Ocultar botón no autenticado
        if (this.elements.profileBtnUnauth) {
            this.elements.profileBtnUnauth.style.display = 'none';
        }

        // Mostrar perfil autenticado
        if (this.elements.userProfileAuth) {
            this.elements.userProfileAuth.style.display = 'block';
        }

        // Actualizar información del usuario
        this.updateUserInfo(user, employeeInfo);

        // Generar menú dropdown dinámico
        this.generateDropdownMenu(user, employeeInfo);

        // Actualizar UI móvil
        this.updateMobileUIState(true, user, employeeInfo);
    }

    /**
     * Muestra el estado no autenticado
     */
    showUnauthenticatedState() {
        console.log('Showing unauthenticated state');

        // Mostrar botón no autenticado
        if (this.elements.profileBtnUnauth) {
            this.elements.profileBtnUnauth.style.display = 'flex';
        }

        // Ocultar perfil autenticado
        if (this.elements.userProfileAuth) {
            this.elements.userProfileAuth.style.display = 'none';
        }

        // Actualizar UI móvil
        this.updateMobileUIState(false);

        // Cerrar dropdown si está abierto
        this.closeDropdown();
    }

    /**
     * Verifica si el usuario es empleado
     */
    async checkEmployeeStatus(email) {
        try {
            const response = await fetch('/data/employees.json');
            if (!response.ok) return null;

            const employeeData = await response.json();
            const employee = employeeData.authorizedEmployees.find(
                emp => emp.email.toLowerCase() === email.toLowerCase()
            );

            return employee;
        } catch (error) {
            console.error('Error checking employee status:', error);
            return null;
        }
    }


    /**
     * Maneja el clic en el perfil móvil (para usuarios autenticados)
     */
    async handleMobileProfileClick() {
        if (!window.authManager || !window.authManager.checkAuth()) {
            console.log('User not authenticated, showing auth modal');
            this.showAuthModal();
            return;
        }

        const user = window.authManager.getCurrentUser();
        if (!user) return;

        // Verificar si es empleado
        const employeeInfo = await this.checkEmployeeStatus(user.email);

        if (employeeInfo) {
            // Si es empleado, redirigir al dashboard
            console.log('Employee profile clicked, redirecting to dashboard');
            this.redirectToDashboard();
        } else {
            // Si es cliente, redirigir al perfil
            console.log('Customer profile clicked, redirecting to profile');
            this.redirectToProfile();
        }

        this.closeMobileMenu();
    }

    /**
     * Actualiza el estado de la UI móvil
     */
    updateMobileUIState(isAuthenticated, user = null, employeeInfo = null) {
        // Mobile login/profile items
        if (this.elements.mobileLoginItem && this.elements.mobileProfileItem) {
            if (isAuthenticated && user) {
                this.elements.mobileLoginItem.style.display = 'none';
                this.elements.mobileProfileItem.style.display = 'block';

                // Actualizar texto del botón móvil según el tipo de usuario
                if (this.elements.mobileProfileBtn) {
                    const profileText = this.elements.mobileProfileBtn.querySelector('span');
                    if (profileText && employeeInfo) {
                        profileText.textContent = 'Dashboard Admin';
                        this.elements.mobileProfileBtn.querySelector('i').className = 'fas fa-tachometer-alt mobile-nav-icon';
                    } else if (profileText) {
                        profileText.textContent = 'Mi Perfil';
                        this.elements.mobileProfileBtn.querySelector('i').className = 'fas fa-user-circle mobile-nav-icon';
                    }
                }
            } else {
                this.elements.mobileLoginItem.style.display = 'block';
                this.elements.mobileProfileItem.style.display = 'none';
            }
        }

        // Mobile logout button
        if (this.elements.mobileLogoutBtn) {
            this.elements.mobileLogoutBtn.style.display = isAuthenticated ? 'block' : 'none';
        }
    }

    /**
     * Actualiza la información del usuario en la UI
     */
    updateUserInfo(user, employeeInfo = null) {
        const firstName = user.givenName || user.name?.split(' ')[0] || 'Usuario';
        const userRole = employeeInfo ? employeeInfo.role : 'Cliente';
        const isEmployee = !!employeeInfo;

        // Header user info
        if (this.elements.userNameHeader) {
            this.elements.userNameHeader.textContent = firstName;
        }

        if (this.elements.userRoleHeader) {
            this.elements.userRoleHeader.textContent = userRole;
            this.elements.userRoleHeader.className = isEmployee ? 'user-role employee' : 'user-role';
        }

        // User avatar en header
        if (user.picture) {
            if (this.elements.userAvatar) {
                this.elements.userAvatar.src = user.picture;
                this.elements.userAvatar.style.display = 'block';
            }
            if (this.elements.defaultAvatar) {
                this.elements.defaultAvatar.style.display = 'none';
            }
        } else {
            if (this.elements.userAvatar) {
                this.elements.userAvatar.style.display = 'none';
            }
            if (this.elements.defaultAvatar) {
                this.elements.defaultAvatar.style.display = 'block';
            }
        }

        // Dropdown user info
        if (this.elements.dropdownUserName) {
            this.elements.dropdownUserName.textContent = user.name || firstName;
        }

        if (this.elements.dropdownUserEmail) {
            this.elements.dropdownUserEmail.textContent = user.email || '';
        }

        if (this.elements.dropdownUserRole) {
            this.elements.dropdownUserRole.textContent = userRole;
            this.elements.dropdownUserRole.className = isEmployee ? 'dropdown-user-role admin' : 'dropdown-user-role';
        }

        // Dropdown avatar
        if (user.picture) {
            if (this.elements.dropdownAvatar) {
                this.elements.dropdownAvatar.src = user.picture;
                this.elements.dropdownAvatar.style.display = 'block';
            }
            if (this.elements.dropdownDefaultAvatar) {
                this.elements.dropdownDefaultAvatar.style.display = 'none';
            }
        } else {
            if (this.elements.dropdownAvatar) {
                this.elements.dropdownAvatar.style.display = 'none';
            }
            if (this.elements.dropdownDefaultAvatar) {
                this.elements.dropdownDefaultAvatar.style.display = 'block';
            }
        }
    }

    /**
     * Genera el menú dropdown dinámicamente según el tipo de usuario
     */
    generateDropdownMenu(user, employeeInfo) {
        if (!this.elements.dropdownMenuItems) return;

        const isEmployee = !!employeeInfo;
        const currentPath = window.location.pathname;

        let menuItems = [];

        if (isEmployee) {
            // Menú para empleados
            menuItems = [
                {
                    icon: 'fas fa-tachometer-alt',
                    text: 'Dashboard Admin',
                    action: () => this.redirectToDashboard(),
                    class: 'dashboard-item'
                },
                {
                    icon: 'fas fa-user',
                    text: 'Mi Perfil',
                    action: () => this.redirectToProfile(),
                    class: ''
                }
            ];
        } else {
            // Menú para clientes normales
            menuItems = [
                {
                    icon: 'fas fa-user',
                    text: 'Mi Perfil',
                    action: () => this.redirectToProfile(),
                    class: ''
                }
            ];
        }

        // Generar HTML del menú
        this.elements.dropdownMenuItems.innerHTML = menuItems.map(item => `
            <button class="dropdown-item ${item.class}" data-action="${item.text}">
                <i class="${item.icon}" aria-hidden="true"></i>
                <span>${item.text}</span>
            </button>
        `).join('');

        // Configurar event listeners para los items del menú
        this.elements.dropdownMenuItems.querySelectorAll('.dropdown-item').forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                menuItems[index].action();
                this.closeDropdown();
            });
        });
    }

    /**
     * Redirige al dashboard (empleados)
     */
    redirectToDashboard() {
        const currentPath = window.location.pathname;
        let dashboardPath = '../dashboard/index.html';

        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
            dashboardPath = 'dashboard/index.html';
        }

        window.location.href = dashboardPath;
    }

    /**
     * Redirige al perfil
     */
    redirectToProfile() {
        const currentPath = window.location.pathname;
        let profilePath = '../pages/perfil.html';

        if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
            profilePath = 'pages/perfil.html';
        }

        window.location.href = profilePath;
    }


    /**
     * Maneja el evento de login exitoso
     */
    handleLogin(user) {
        this.showAuthenticatedState(user);
        this.closeDropdown();

        // Opcional: Cerrar menú móvil si está abierto
        this.closeMobileMenu();
    }

    /**
     * Maneja el evento de logout
     */
    handleLogout() {
        this.showUnauthenticatedState();
        this.closeMobileMenu();
    }

    /**
     * Muestra el modal de autenticación
     */
    showAuthModal() {
        console.log('showAuthModal called');
        console.log('authManager available:', !!window.authManager);

        if (window.authManager) {
            console.log('Calling authManager.showAuthModal()');
            window.authManager.showAuthModal();
        } else {
            console.error('AuthManager not available');
        }

        // Cerrar menú móvil si está abierto
        this.closeMobileMenu();
    }

    /**
     * Cierra sesión
     */
    logout() {
        if (window.authManager) {
            window.authManager.signOut();
        }
    }

    /**
     * Abre/cierra el dropdown del perfil
     */
    toggleDropdown() {
        console.log('toggleDropdown called, current state:', this.dropdownOpen);
        if (this.dropdownOpen) {
            console.log('Closing dropdown');
            this.closeDropdown();
        } else {
            console.log('Opening dropdown');
            this.openDropdown();
        }
    }

    /**
     * Abre el dropdown del perfil
     */
    openDropdown() {
        console.log('openDropdown called');
        console.log('profileDropdownMenu:', !!this.elements.profileDropdownMenu);
        console.log('profileBtnAuth:', !!this.elements.profileBtnAuth);

        if (!this.elements.profileDropdownMenu || !this.elements.profileBtnAuth) {
            console.error('Required elements not found for dropdown');
            return;
        }

        this.elements.profileDropdownMenu.classList.add('active');
        this.elements.profileBtnAuth.setAttribute('aria-expanded', 'true');
        this.dropdownOpen = true;

        console.log('Dropdown opened');

        // Focus management
        setTimeout(() => {
            const firstItem = this.elements.profileDropdownMenu.querySelector('.dropdown-item');
            if (firstItem) firstItem.focus();
        }, 100);
    }

    /**
     * Cierra el dropdown del perfil
     */
    closeDropdown() {
        if (!this.elements.profileDropdownMenu || !this.elements.profileBtnAuth) return;

        this.elements.profileDropdownMenu.classList.remove('active');
        this.elements.profileBtnAuth.setAttribute('aria-expanded', 'false');
        this.dropdownOpen = false;
    }

    /**
     * Cierra el menú móvil (si está abierto)
     */
    closeMobileMenu() {
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('mobileNavOverlay');
        const menuToggle = document.getElementById('menuToggle');

        if (mobileNav && mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.classList.remove('mobile-nav-open');
        }
    }

    /**
     * Obtiene el estado actual de autenticación
     */
    getAuthState() {
        return {
            isAuthenticated: window.authManager?.checkAuth() || false,
            user: window.authManager?.getCurrentUser() || null,
            dropdownOpen: this.dropdownOpen
        };
    }

    /**
     * Método para refrescar el estado de la UI manualmente
     */
    refresh() {
        this.updateUIState();
    }

    /**
     * Método de debug para probar el clic manualmente
     */
    testClick() {
        console.log('Manual test click - Opening auth modal');
        this.showAuthModal();
    }

    /**
     * Re-inicializar manualmente (método de debug)
     */
    reinitialize() {
        console.log('Reinitializing HeaderAuth...');
        this.elements = {};
        this.cacheElements();
        this.setupEventListeners();
        this.updateUIState();
        console.log('HeaderAuth reinitialized');
    }
}

// Exportar la clase
window.HeaderAuth = HeaderAuth;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired, waiting for components to load...');
        // Esperar a que se carguen los componentes
        setTimeout(() => {
            console.log('Creating HeaderAuth instance');
            window.headerAuth = new HeaderAuth();
        }, 1000); // Delay más largo
    });
} else {
    console.log('DOM already ready, waiting for components...');
    // Esperar a que se carguen los componentes
    setTimeout(() => {
        console.log('Creating HeaderAuth instance');
        window.headerAuth = new HeaderAuth();
    }, 1000); // Delay más largo
}

// También escuchar el evento de componentes cargados
document.addEventListener('componentLoaded', (e) => {
    if (e.detail.component === 'header' && !window.headerAuth) {
        console.log('Header component loaded, creating HeaderAuth');
        setTimeout(() => {
            window.headerAuth = new HeaderAuth();
        }, 200);
    }
});

// Funciones de debug globales
window.debugHeaderAuth = {
    reinit: () => {
        if (window.headerAuth) {
            window.headerAuth.reinitialize();
        } else {
            console.log('Creating new HeaderAuth instance...');
            window.headerAuth = new HeaderAuth();
        }
    },
    testClick: () => {
        if (window.headerAuth) {
            window.headerAuth.testClick();
        } else {
            console.log('HeaderAuth not initialized');
        }
    },
    testDropdown: () => {
        if (window.headerAuth) {
            console.log('Testing dropdown toggle...');
            window.headerAuth.toggleDropdown();
        } else {
            console.log('HeaderAuth not initialized');
        }
    },
    checkElements: () => {
        if (window.headerAuth) {
            console.log('Elements found:');
            Object.keys(window.headerAuth.elements).forEach(key => {
                console.log(`${key}:`, !!window.headerAuth.elements[key]);
            });
        } else {
            console.log('HeaderAuth not initialized');
        }
    },
    checkDropdownState: () => {
        if (window.headerAuth) {
            console.log('Dropdown open:', window.headerAuth.dropdownOpen);
            console.log('Dropdown element classes:', window.headerAuth.elements.profileDropdownMenu?.className);
            console.log('Dropdown element style:', window.headerAuth.elements.profileDropdownMenu?.style.cssText);
        } else {
            console.log('HeaderAuth not initialized');
        }
    }
};
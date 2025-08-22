/* ==================== PERFIL PAGE FUNCTIONALITY ==================== */

/**
 * Profile Page - Modern Dashboard
 * Simple, focused UX/UI for managing profile and viewing orders/points
 */

// DOM Elements
const elements = {
    // Avatar
    avatarEditBtn: document.getElementById('avatarEditBtn'),
    avatarInput: document.getElementById('avatarInput'),
    avatarImage: document.getElementById('avatarImage'),
    
    // Profile
    profileName: document.getElementById('profileName'),
    profileEmail: document.getElementById('profileEmail'),
    
    // Buttons
    editProfileBtn: document.getElementById('editProfileBtn'),
    viewAllOrdersBtn: document.getElementById('viewAllOrdersBtn'),
    
    // Modals
    editProfileModal: document.getElementById('editProfileModal'),
    allOrdersModal: document.getElementById('allOrdersModal'),
    closeEditModal: document.getElementById('closeEditModal'),
    closeOrdersModal: document.getElementById('closeOrdersModal'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    
    // Forms
    editProfileForm: document.getElementById('editProfileForm'),
    editName: document.getElementById('editName'),
    editEmail: document.getElementById('editEmail'),
    editPhone: document.getElementById('editPhone'),
    editAddress: document.getElementById('editAddress'),
    
    detailedOrdersList: document.getElementById('detailedOrdersList'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
};

// State
const state = {
    userData: {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+54 11 1234-5678',
        address: 'Av. Corrientes 1234, CABA, Buenos Aires'
    },
    points: {
        current: 1250,
        earned: 120,
        redeemed: 50
    }
};

// ==================== INITIALIZATION ==================== 

document.addEventListener('DOMContentLoaded', function() {
    // Profile page initialized
    
    initializeEventListeners();
    loadUserData();
    animatePointsCounter();
});

// ==================== EVENT LISTENERS ==================== 

function initializeEventListeners() {
    // Avatar upload
    if (elements.avatarEditBtn && elements.avatarInput) {
        elements.avatarEditBtn.addEventListener('click', () => {
            elements.avatarInput.click();
        });
        
        elements.avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // Profile edit modal
    if (elements.editProfileBtn) {
        elements.editProfileBtn.addEventListener('click', openEditProfileModal);
    }
    
    if (elements.closeEditModal) {
        elements.closeEditModal.addEventListener('click', closeEditProfileModal);
    }
    
    if (elements.cancelEditBtn) {
        elements.cancelEditBtn.addEventListener('click', closeEditProfileModal);
    }
    
    // Orders modal
    if (elements.viewAllOrdersBtn) {
        elements.viewAllOrdersBtn.addEventListener('click', openOrdersModal);
    }
    
    if (elements.closeOrdersModal) {
        elements.closeOrdersModal.addEventListener('click', closeOrdersModal);
    }
    
    // Edit profile form
    if (elements.editProfileForm) {
        elements.editProfileForm.addEventListener('submit', handleProfileSave);
    }
    
    
    // Modal overlay clicks
    document.addEventListener('click', handleModalOutsideClick);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// ==================== AVATAR FUNCTIONALITY ==================== 

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Por favor selecciona una imagen válida', 'error');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('La imagen debe ser menor a 2MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (elements.avatarImage) {
            elements.avatarImage.src = e.target.result;
            showToast('Foto de perfil actualizada', 'success');
        }
    };
    reader.readAsDataURL(file);
}

// ==================== MODAL FUNCTIONALITY ==================== 

function openEditProfileModal() {
    if (!elements.editProfileModal) return;
    
    // Populate form with current data
    if (elements.editName) elements.editName.value = state.userData.name;
    if (elements.editEmail) elements.editEmail.value = state.userData.email;
    if (elements.editPhone) elements.editPhone.value = state.userData.phone;
    if (elements.editAddress) elements.editAddress.value = state.userData.address;
    
    elements.editProfileModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
        if (elements.editName) elements.editName.focus();
    }, 100);
}

function closeEditProfileModal() {
    if (!elements.editProfileModal) return;
    
    elements.editProfileModal.classList.remove('active');
    document.body.style.overflow = '';
}

function openOrdersModal() {
    if (!elements.allOrdersModal) return;
    
    elements.allOrdersModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOrdersModal() {
    if (!elements.allOrdersModal) return;
    
    elements.allOrdersModal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleModalOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        if (elements.editProfileModal && elements.editProfileModal.classList.contains('active')) {
            closeEditProfileModal();
        }
        if (elements.allOrdersModal && elements.allOrdersModal.classList.contains('active')) {
            closeOrdersModal();
        }
    }
}

// ==================== PROFILE FORM HANDLING ==================== 

function handleProfileSave(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        name: elements.editName?.value.trim() || '',
        email: elements.editEmail?.value.trim() || '',
        phone: elements.editPhone?.value.trim() || '',
        address: elements.editAddress?.value.trim() || ''
    };
    
    // Basic validation
    if (!formData.name || !formData.email) {
        showToast('Nombre y email son obligatorios', 'error');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        showToast('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Simulate API call
    showLoadingState(true);
    
    setTimeout(() => {
        // Update state
        state.userData = formData;
        
        // Update UI
        if (elements.profileName) elements.profileName.textContent = formData.name;
        if (elements.profileEmail) elements.profileEmail.textContent = formData.email;
        
        showLoadingState(false);
        closeEditProfileModal();
        showToast('Perfil actualizado correctamente', 'success');
    }, 1000);
}

function showLoadingState(loading) {
    const submitBtn = elements.editProfileForm?.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar cambios';
    }
}


// ==================== ANIMATIONS ==================== 

function animatePointsCounter() {
    const pointsElement = document.querySelector('.points-number');
    if (!pointsElement) return;
    
    const targetValue = state.points.current;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetValue / steps;
    let currentValue = 0;
    
    const timer = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        pointsElement.textContent = Math.floor(currentValue).toLocaleString();
    }, duration / steps);
}

// ==================== UTILITIES ==================== 

function loadUserData() {
    // In a real app, this would fetch from an API
    // Loading user data
    
    // Update points display with animation
    const earnedElement = document.querySelector('.info-item .info-value');
    const redeemedElement = document.querySelectorAll('.info-item .info-value')[1];
    
    if (earnedElement) earnedElement.textContent = `+${state.points.earned}`;
    if (redeemedElement) redeemedElement.textContent = `-${state.points.redeemed}`;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

function handleKeyboardNavigation(event) {
    // ESC key closes modals
    if (event.key === 'Escape') {
        if (elements.editProfileModal?.classList.contains('active')) {
            closeEditProfileModal();
        }
        if (elements.allOrdersModal?.classList.contains('active')) {
            closeOrdersModal();
        }
    }
}

// ==================== POINTS SYSTEM (PLACEHOLDER) ==================== 

function calculatePointsFromOrder(orderTotal) {
    // 1 point per $10 spent
    return Math.floor(orderTotal / 10);
}

function updatePointsDisplay(newPoints) {
    const pointsElement = document.querySelector('.points-number');
    if (!pointsElement) return;
    
    // Animate the change
    const currentPoints = parseInt(pointsElement.textContent.replace(/,/g, ''));
    const difference = newPoints - currentPoints;
    
    if (difference > 0) {
        showToast(`¡Ganaste ${difference} puntos!`, 'success');
    }
    
    state.points.current = newPoints;
    pointsElement.textContent = newPoints.toLocaleString();
}

// ==================== EXPORT FOR GLOBAL ACCESS ==================== 

window.PerfilPage = {
    updatePoints: updatePointsDisplay,
    showToast: showToast,
    state: state
};

// Add CSS for toast slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Profile page JavaScript loaded
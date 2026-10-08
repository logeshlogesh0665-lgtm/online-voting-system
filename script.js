// Common utility functions for the voting system

class VotingSystem {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    static formatTime(date) {
        return new Date(date).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-text">${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid;
            max-width: 400px;
        `;

        // Set border color based on type
        const colors = {
            info: '#2E86C1',
            success: '#28B463',
            error: '#E74C3C',
            warning: '#F1C40F'
        };
        notification.style.borderLeftColor = colors[type];

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Add keyframes for animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    static validateMobileNumber(mobile) {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(mobile);
    }

    static validateName(name) {
        return name.length >= 3 && name.length <= 50 && /^[A-Za-z\s]+$/.test(name);
    }

    static validateOTP(otp) {
        return /^\d{6}$/.test(otp);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static async checkSession() {
        const token = sessionStorage.getItem('sessionToken');
        const mobile = sessionStorage.getItem('voterMobile');
        
        if (!token || !mobile) {
            return false;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/voter-status/${mobile}`);
            const data = await response.json();
            return !data.hasVoted;
        } catch (error) {
            console.error('Session check failed:', error);
            return false;
        }
    }

    static logout() {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }

    static formatNumber(num) {
        return num.toLocaleString('en-IN');
    }

    static calculatePercentage(part, total) {
        if (total === 0) return 0;
        return ((part / total) * 100).toFixed(1);
    }
}

// Form validation enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Mobile number input formatting
    const mobileInputs = document.querySelectorAll('input[type="tel"]');
    mobileInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            e.target.value = value;
        });
    });

    // Name input validation
    const nameInputs = document.querySelectorAll('input[type="text"][pattern*="A-Za-z"]');
    nameInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^A-Za-z\s]/g, '');
            if (value.length > 50) value = value.substring(0, 50);
            e.target.value = value;
        });
    });

    // OTP input auto-tab
    const otpInputs = document.querySelectorAll('input[maxlength="6"]');
    otpInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 6) value = value.substring(0, 6);
            e.target.value = value;
        });
    });

    // Prevent form submission on Enter for non-submit buttons
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
            e.preventDefault();
        }
    });

    // Add loading state to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                // Re-enable button if form submission fails
                setTimeout(() => {
                    if (submitBtn.disabled) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                }, 10000);
            }
        });
    });

    // Auto-capitalize first letter of each word in name fields
    nameInputs.forEach(input => {
        input.addEventListener('blur', function() {
            this.value = this.value
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        });
    });

    // Add copy to clipboard for demo credentials
    const credentials = document.querySelectorAll('.credential');
    credentials.forEach(cred => {
        cred.style.cursor = 'pointer';
        cred.title = 'Click to copy credentials';
        cred.addEventListener('click', function() {
            const text = this.innerText;
            navigator.clipboard.writeText(text)
                .then(() => {
                    const originalBg = this.style.backgroundColor;
                    this.style.backgroundColor = '#E8F4FC';
                    setTimeout(() => {
                        this.style.backgroundColor = originalBg;
                    }, 500);
                })
                .catch(err => console.error('Copy failed:', err));
        });
    });

    // Add print functionality for results page
    if (window.location.pathname.includes('result.html')) {
        const printBtn = document.createElement('button');
        printBtn.className = 'btn-secondary';
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Results';
        printBtn.onclick = () => window.print();
        document.querySelector('.actions-section').appendChild(printBtn);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + H: Go home
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
        
        // Ctrl + R: Refresh results
        if (e.ctrlKey && e.key === 'r' && window.location.pathname.includes('result.html')) {
            e.preventDefault();
            document.getElementById('refreshResults')?.click();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal[style*="display: block"]');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });

    // Add network status monitoring
    window.addEventListener('online', () => {
        VotingSystem.showNotification('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
        VotingSystem.showNotification('No internet connection', 'error');
    });

    // Add service worker for PWA capabilities (basic implementation)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});

// Export for use in HTML files
window.VotingSystem = VotingSystem;
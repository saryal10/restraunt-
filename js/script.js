// ===================================
// --- GLOBAL SHOPPING CART FUNCTIONS ---
// (These functions manage the shopping cart data in localStorage
// and are accessible by all other scripts like menu.js, checkout.js, etc.)
// ===================================

const CART_STORAGE_KEY = 'shoppingCart'; // Consistent key for localStorage

/**
 * Retrieves the current cart from localStorage.
 * @returns {Array} The shopping cart array, or an empty array if not found.
 */
function getCart() {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

/**
 * Saves the given cart array to localStorage.
 * @param {Array} cart - The shopping cart array to save.
 */
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Trigger a UI update for elements that display cart info (e.g., header count, cart overlay)
    updateCartUI();
}

/**
 * Adds an item to the cart or increments its quantity if it already exists.
 * This version uniquely identifies items based on ID, options, and instructions.
 * @param {string} itemId - The ID of the menu item.
 * @param {string} itemName - The name of the menu item.
 * @param {number} itemPrice - The price of the menu item.
 * @param {string} itemImage - The image path of the menu item.
 * @param {string} [options=''] - Selected options string (e.g., "Cheese, Bacon").
 * @param {string} [instructions=''] - Special instructions for the item.
 */
function addToCart(itemId, itemName, itemPrice, itemImage, options = '', instructions = '') {
    let cart = getCart();

    // Console log for debugging - can be removed after confirming it works
    console.log('Value of itemImage inside script.js addToCart:', itemImage);

    // Create a unique key for the item including options and instructions
    // This ensures items with the same ID but different options/instructions are treated as separate
    const itemKey = `${itemId}-${options}-${instructions}`;

    let existingItem = cart.find(item =>
        `${item.id}-${item.options}-${item.instructions}` === itemKey
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage, // Save the image path
            quantity: 1,
            options: options,
            instructions: instructions
        });
    }
    saveCart(cart);
    showToast(`${itemName} added to cart!`, 'success'); // Show success toast
}

/**
 * Removes an item from the cart.
 * If options and instructions are provided, it removes the specific variant.
 * @param {string} itemId - The ID of the item to remove.
 * @param {string} [options=''] - Options of the item to remove.
 * @param {string} [instructions=''] - Instructions of the item to remove.
 */
function removeFromCart(itemId, options = '', instructions = '') {
    let cart = getCart();
    const itemKeyToRemove = `${itemId}-${options}-${instructions}`;

    const initialLength = cart.length;
    cart = cart.filter(item => `${item.id}-${item.options}-${item.instructions}` !== itemKeyToRemove);

    if (cart.length < initialLength) {
        saveCart(cart);
        showToast('Item removed from cart.', 'info');
    }
}

/**
 * Updates the quantity of a specific item in the cart.
 * If the new quantity is 0 or less, the item is removed.
 * @param {string} itemId - The ID of the item to update.
 * @param {number} newQuantity - The new quantity for the item.
 * @param {string} [options=''] - Options of the item to update.
 * @param {string} [instructions=''] - Instructions of the item to update.
 */
function updateItemQuantity(itemId, newQuantity, options = '', instructions = '') {
    let cart = getCart();
    const itemKeyToUpdate = `${itemId}-${options}-${instructions}`;

    let itemFound = false;
    for (let i = 0; i < cart.length; i++) {
        if (`${cart[i].id}-${cart[i].options}-${cart[i].instructions}` === itemKeyToUpdate) {
            if (newQuantity <= 0) {
                cart.splice(i, 1); // Remove item if quantity is 0 or less
                showToast('Item quantity updated (removed).', 'info');
            } else {
                cart[i].quantity = newQuantity;
                showToast('Item quantity updated.', 'info');
            }
            itemFound = true;
            break;
        }
    }
    if (itemFound) {
        saveCart(cart);
    }
}


// ===================================
// --- UI UPDATE FUNCTIONS --
// (These functions handle updating parts of the UI that depend on cart data)
// ===================================

/**
 * Updates the cart count displayed in the navigation bar.
 */
function updateCartUI() {
    const cart = getCart();
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        if (totalItems > 0) {
            cartCountElement.classList.add('visible'); // Show count if items exist
        } else {
            cartCountElement.classList.remove('visible'); // Hide if cart is empty
        }
    }
}


// ===================================
// --- TOAST NOTIFICATION FUNCTION ---
// ===================================

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info' for styling.
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn('Toast container not found!');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Trigger reflow to ensure CSS transition plays
    void toast.offsetWidth;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, 3000); // Toast disappears after 3 seconds
}

// ===================================
// --- GLOBAL DOMContentLoaded Listener ---
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Initial UI Update ---
    // Call updateCartUI once when the page loads to display any existing cart items
    // and correctly set the navigation bar cart count and checkout button state.
    updateCartUI(); // This will update the cart count in the header for ALL pages.
    // NOTE: Page-specific listeners (like 'Add to Cart' buttons) should be in their respective JS files (e.g., menu.js).

    // ===================================
    // --- LOGIN/SIGNUP MODAL LOGIC ---
    // ===================================

    // DOM Element References for Modals
    const loginIcon = document.getElementById('login-icon');
    const loginSignupModal = document.getElementById('login-modal'); // Corrected ID
    const signupModal = document.getElementById('signup-modal');
    const closeButtons = document.querySelectorAll('.close-modal-btn');
    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginMessage = document.querySelector('.login-message');
    const signupMessage = document.querySelector('.signup-message');

    // Function to open a specific modal
    function openModal(modal) {
        if (modal) { // Add a null check here as a safeguard
            modal.classList.add('show');
        } else {
            console.error("Attempted to open a modal that is null:", modal);
        }
    }

    // Function to close all modals
    function closeModals() {
        if (loginSignupModal) loginSignupModal.classList.remove('show');
        if (signupModal) signupModal.classList.remove('show');
        // Clear any previous messages
        if (loginMessage) loginMessage.style.display = 'none';
        if (signupMessage) signupMessage.style.display = 'none';
        // Reset forms
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    }

    // Event Listener for the Login Icon in the Header
    if (loginIcon) {
        loginIcon.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior (e.g., jumping to #)
            openModal(loginSignupModal);
        });
    }

    // Event Listeners for Close Buttons (inside modals)
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });

    // Close modals when clicking outside the modal content
    if (loginSignupModal) {
        loginSignupModal.addEventListener('click', (e) => {
            if (e.target === loginSignupModal) {
                closeModals();
            }
        });
    }
    if (signupModal) {
        signupModal.addEventListener('click', (e) => {
            if (e.target === signupModal) {
                closeModals();
            }
        });
    }

    // Event Listener to switch from Login to Signup modal
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModals(); // Close current (login) modal
            openModal(signupModal); // Open signup modal
        });
    }

    // Event Listener to switch from Signup to Login modal
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModals(); // Close current (signup) modal
            openModal(loginSignupModal); // Open login modal
        });
    }

    // Basic Login Form Submission (Client-side simulation)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Login form submitted (client-side only)');
            const email = loginForm.querySelector('#login-email').value;
            const password = loginForm.querySelector('#login-password').value;

            // Simulate API call
            if (email === 'user@example.com' && password === 'password') { // Example credentials
                if (loginMessage) {
                    loginMessage.textContent = 'Login successful!';
                    loginMessage.style.display = 'block';
                    loginMessage.style.backgroundColor = '#d4edda';
                    loginMessage.style.color = '#155724';
                }
                showToast('Login successful!', 'success');
                setTimeout(() => {
                    closeModals();
                }, 1500);
            } else {
                if (loginMessage) {
                    loginMessage.textContent = 'Invalid email or password.';
                    loginMessage.style.display = 'block';
                    loginMessage.style.backgroundColor = '#f8d7da';
                    loginMessage.style.color = '#721c24';
                }
                showToast('Invalid login credentials.', 'error');
            }
        });
    }

    // Basic Signup Form Submission (Client-side simulation)
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Signup form submitted (client-side only)');
            const name = signupForm.querySelector('#signup-name').value;
            const email = signupForm.querySelector('#signup-email').value;
            const password = signupForm.querySelector('#signup-password').value;
            const confirmPassword = signupForm.querySelector('#signup-confirm-password').value;

            if (password !== confirmPassword) {
                if (signupMessage) {
                    signupMessage.textContent = 'Passwords do not match.';
                    signupMessage.style.display = 'block';
                    signupMessage.style.backgroundColor = '#f8d7da';
                    signupMessage.style.color = '#721c24';
                }
                showToast('Passwords do not match.', 'error');
                return;
            }

            // Simulate successful registration
            if (signupMessage) {
                signupMessage.textContent = 'Registration successful! You can now log in.';
                signupMessage.style.display = 'block';
                signupMessage.style.backgroundColor = '#d4edda';
                signupMessage.style.color = '#155724';
            }
            showToast('Registration successful!', 'success');
            setTimeout(() => {
                closeModals();
                openModal(loginSignupModal); // Automatically switch to login after signup
            }, 1500);
        });
    }

    // --- Back to Top Button Logic ---
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) { // Ensure the button exists on the page
        // Show/hide the button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Scroll to top when the button is clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll
            });
        });
    }

    // You can add other global DOMContentLoaded logic here if needed.
});
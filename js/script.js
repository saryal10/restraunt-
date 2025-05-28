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
 * @param {string} [options=''] - Selected options string (e.g., "Cheese, Bacon").
 * @param {string} [instructions=''] - Special instructions for the item.
 */
function addToCart(itemId, itemName, itemPrice, options = '', instructions = '') {
    let cart = getCart(); // Get the current cart using the global function
    // Find item considering its ID, options, and instructions for uniqueness
    const existingItemIndex = cart.findIndex(item =>
        item.id === itemId && item.options === options && item.instructions === instructions
    );

    if (existingItemIndex > -1) {
        // Item exists, increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Item does not exist, add as new item
        cart.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1, options, instructions });
    }

    saveCart(cart); // Save the updated cart
    showToast(`${itemName} added to cart!`, 'success'); // Use global showToast
}

/**
 * Removes an item from the cart.
 * @param {string} itemId - The ID of the item to remove.
 * @param {string} [options=''] - Options of the item to remove (for unique identification).
 * @param {string} [instructions=''] - Instructions of the item to remove (for unique identification).
 */
function removeFromCart(itemId, options = '', instructions = '') {
    let cart = getCart();
    const initialLength = cart.length;
    cart = cart.filter(item => !(item.id === itemId && item.options === options && item.instructions === instructions));
    if (cart.length < initialLength) {
        saveCart(cart);
        showToast('Item removed from cart.', 'info');
    }
}

/**
 * Updates the quantity of a specific item in the cart.
 * @param {string} itemId - The ID of the item to update.
 * @param {number} newQuantity - The new quantity for the item.
 * @param {string} [options=''] - Options of the item to update.
 * @param {string} [instructions=''] - Instructions of the item to update.
 */
function updateItemQuantity(itemId, newQuantity, options = '', instructions = '') {
    let cart = getCart();
    const itemIndex = cart.findIndex(item =>
        item.id === itemId && item.options === options && item.instructions === instructions
    );

    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            // If quantity is 0 or less, remove the item
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        saveCart(cart);
    }
}

/**
 * Updates the cart item count displayed in the navigation bar.
 */
function updateCartUI() {
    const cart = getCart();
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count'); // Select all elements with class 'cart-count'
    const cartIconElement = document.getElementById('cart-item-count'); // Specific for the standalone icon

    cartCountElements.forEach(element => {
        element.textContent = cartItemCount;
        element.style.display = cartItemCount > 0 ? 'inline-block' : 'none';
    });

    if (cartIconElement) {
        cartIconElement.textContent = cartItemCount;
        cartIconElement.style.display = cartItemCount > 0 ? 'inline-block' : 'none';
    }
}


/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type of toast ('success', 'error', 'info').
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Toast container not found!');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast-notification', type); // Add type class for styling

    let iconHtml = '';
    if (type === 'success') {
        iconHtml = '<i class="fas fa-check-circle"></i>';
    } else if (type === 'error') {
        iconHtml = '<i class="fas fa-times-circle"></i>';
    } else if (type === 'info') {
        iconHtml = '<i class="fas fa-info-circle"></i>';
    }

    toast.innerHTML = `${iconHtml} ${message}`;
    toastContainer.appendChild(toast);

    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10); // Small delay to trigger CSS transition

    // Hide and remove after a few seconds
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, 3000); // Adjust display duration
}


// ===================================
// --- GLOBAL UI/INTERACTION LOGIC ---
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Login/Signup Modal Logic ---
    const loginIcon = document.getElementById('login-icon');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeButtons = document.querySelectorAll('.close-modal-btn');
    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');

    if (loginIcon) {
        loginIcon.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.remove('hidden');
            loginModal.classList.add('show'); // Added this line to make the modal visible
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            loginModal.classList.remove('show'); // Added this line to hide the modal properly
            signupModal.classList.add('hidden');
            signupModal.classList.remove('show'); // Added this line to hide the modal properly
        });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
                overlay.classList.remove('show'); // Added this line to hide the modal properly
            }
        });
    });


    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.add('hidden');
            loginModal.classList.remove('show'); // Added this line to hide the login modal properly
            signupModal.classList.remove('hidden');
            signupModal.classList.add('show'); // Added this line to show the signup modal
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.classList.add('hidden');
            signupModal.classList.remove('show'); // Added this line to hide the signup modal properly
            loginModal.classList.remove('hidden');
            loginModal.classList.add('show'); // Added this line to show the login modal
        });
    }

    // --- Form Submission (Client-side simulation) ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.elements['login-email'].value;
            const password = loginForm.elements['login-password'].value;
            const messageElement = loginForm.querySelector('.login-message');

            if (!email || !password) {
                messageElement.textContent = 'Please enter both email and password.';
                messageElement.style.color = 'red';
                messageElement.style.display = 'block';
                return;
            }

            // Simulate login process
            messageElement.textContent = 'Logging in...';
            messageElement.style.color = 'blue';
            messageElement.style.display = 'block';

            setTimeout(() => {
                if (email === 'user@example.com' && password === 'password') {
                    messageElement.textContent = 'Login successful!';
                    messageElement.style.color = 'green';
                    loginModal.classList.add('hidden');
                    loginModal.classList.remove('show'); // Added this line to hide the modal properly after successful login
                    // In a real app, you'd set a logged-in state (e.g., localStorage, cookie)
                    // and update UI elements (e.g., change 'Login' to 'Welcome, User!').
                } else {
                    messageElement.textContent = 'Invalid email or password.';
                    messageElement.style.color = 'red';
                }
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 3000);
            }, 1500);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = signupForm.elements['signup-name'].value;
            const email = signupForm.elements['signup-email'].value;
            const password = signupForm.elements['signup-password'].value;
            const confirmPassword = signupForm.elements['signup-confirm-password'].value;
            const messageElement = signupForm.querySelector('.signup-message');

            if (password !== confirmPassword) {
                messageElement.textContent = 'Passwords do not match.';
                messageElement.style.color = 'red';
                messageElement.style.display = 'block';
                return;
            }

            // Simulate signup process
            messageElement.textContent = 'Signing up...';
            messageElement.style.color = 'blue';
            messageElement.style.display = 'block';

            setTimeout(() => {
                // In a real app, you'd send this to a backend
                messageElement.textContent = 'Account created successfully! Please log in.';
                messageElement.style.color = 'green';
                signupForm.reset();
                setTimeout(() => {
                    signupModal.classList.add('hidden');
                    signupModal.classList.remove('show'); // Added this line to hide the signup modal properly
                    loginModal.classList.remove('hidden');
                    loginModal.classList.add('show'); // Show login after signup
                }, 1500);
            }, 1500);
        });
    }

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling down 300px
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Add to Cart Button Listener (General for any page with these buttons) ---
    // This listener is now more robust to find the correct parent element
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Look for the closest parent that is either a .menu-item or a .special-item
            const itemElement = e.target.closest('.menu-item, .special-item');
            if (itemElement) {
                const itemId = itemElement.dataset.id;
                const itemName = itemElement.dataset.name;
                const itemPrice = parseFloat(itemElement.dataset.price);

                const options = itemElement.dataset.options || '';
                const instructions = itemElement.dataset.instructions || '';

                if (itemId && itemName && !isNaN(itemPrice)) {
                    addToCart(itemId, itemName, itemPrice, options, instructions);
                } else {
                    console.error('Missing or invalid data attributes on item element for add to cart:', itemElement);
                    showToast('Failed to add item: Missing menu data.', 'error');
                }
            } else {
                console.error('Could not find parent .menu-item or .special-item for add to cart button.');
                showToast('Failed to add item: Internal error.', 'error'); // More specific error feedback
            }
        });
    });


    // --- Initial UI Update ---
    // Call updateCartUI once when the page loads to display any existing cart items
    // and correctly set the navigation bar cart count and checkout button state.
    updateCartUI();
});
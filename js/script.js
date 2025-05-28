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
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    console.log('getCart() called. Current cart:', cart); // Added log
    return cart;
}

/**
 * Saves the given cart array to localStorage.
 * @param {Array} cart - The shopping cart array to save.
 */
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    console.log('saveCart() called. Cart saved:', cart); // Added log
    // Trigger a UI update for elements that display cart info (e.g., header count, cart overlay)
    updateCartUI();
}

/**
 * Adds an item to the cart or increments its quantity if it already exists.
 * This version uniquely identifies items based on ID, options, and instructions.
 * @param {string} itemId - The ID of the menu item.
 * @param {string} itemName - The name of the menu item.
 * @param {number} itemPrice - The price of the menu item.
 * @param {string} itemImage
 * @param {string} [options=''] - Selected options string (e.g., "Cheese, Bacon").
 * @param {string} [instructions=''] - Special instructions for the item.
 */
function addToCart(itemId, itemName, itemPrice, itemImage, options = '', instructions = '') {
    console.log('addToCart() called with:', { itemId, itemName, itemPrice, itemImage, options, instructions }); // Added log
    let cart = getCart(); // Get current cart

    // Create a unique identifier for the item based on ID, options, and instructions
    // This ensures items with different options/instructions are treated as distinct cart entries
    const uniqueId = `${itemId}-${options}-${instructions}`;

    // Check if the item already exists in the cart with the exact same ID, options, and instructions
    const existingItemIndex = cart.findIndex(item =>
        item.id === itemId &&
        (item.options || '') === options && // Compare options, handle undefined/null
        (item.instructions || '') === instructions // Compare instructions, handle undefined/null
    );

    if (existingItemIndex > -1) {
        // Item exists, increment quantity
        cart[existingItemIndex].quantity += 1;
        console.log('Item already in cart, incremented quantity:', cart[existingItemIndex]); // Added log
    } else {
        // Item does not exist, add as new item
        cart.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage, // Store image path
            quantity: 1,
            options: options,
            instructions: instructions
        });
        console.log('New item added to cart:', cart[cart.length - 1]); // Added log
    }

    saveCart(cart); // Save the updated cart to localStorage
    showToast(`${itemName} added to cart!`, 'success');
}

/**
 * Removes an item completely from the cart.
 * @param {string} itemId - The ID of the menu item.
 * @param {string} [options=''] - Selected options string (e.g., "Cheese, Bacon").
 * @param {string} [instructions=''] - Special instructions for the item.
 */
function removeFromCart(itemId, options = '', instructions = '') {
    let cart = getCart();
    // Filter out the item that matches ID, options, and instructions
    const initialLength = cart.length;
    cart = cart.filter(item =>
        !(item.id === itemId &&
          (item.options || '') === options &&
          (item.instructions || '') === instructions)
    );

    if (cart.length < initialLength) {
        saveCart(cart); // Only save if something was actually removed
        showToast('Item removed from cart.', 'info');
    }
}

/**
 * Updates the quantity of a specific item in the cart.
 * If quantity is 0 or less, the item is removed.
 * @param {string} itemId - The ID of the menu item.
 * @param {number} newQuantity - The new quantity for the item.
 * @param {string} [options=''] - Selected options string (e.g., "Cheese, Bacon").
 * @param {string} [instructions=''] - Special instructions for the item.
 */
function updateItemQuantity(itemId, newQuantity, options = '', instructions = '') {
    let cart = getCart();
    const itemIndex = cart.findIndex(item =>
        item.id === itemId &&
        (item.options || '') === options &&
        (item.instructions || '') === instructions
    );

    if (itemIndex > -1) {
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
            showToast(`Quantity updated for ${cart[itemIndex].name}.`, 'info');
        } else {
            // If newQuantity is 0 or less, remove the item
            cart.splice(itemIndex, 1);
            showToast('Item removed from cart.', 'info');
        }
        saveCart(cart); // Save updated cart
    }
}

/**
 * Calculates the total number of items in the cart (sum of quantities).
 * @returns {number} The total count of items.
 */
function getTotalCartItems() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calculates the total price of all items in the cart.
 * @returns {number} The total price.
 */
function getCartTotalPrice() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Clears the entire cart from localStorage.
 */
function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartUI(); // Update UI to reflect empty cart
    console.log('Cart cleared from localStorage.'); // Added log
}

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {'success'|'error'|'info'} type - The type of toast (for styling).
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn('Toast container not found!');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Automatically remove the toast after a few seconds
    setTimeout(() => {
        toast.classList.add('hide'); // Add a class to trigger fade-out animation (if defined in CSS)
        toast.addEventListener('transitionend', () => {
            toast.remove(); // Remove from DOM after animation
        }, { once: true }); // Ensure listener is called only once
    }, 3000); // Display for 3 seconds
}


/**
 * Updates the UI elements that display cart information,
 * specifically the cart count in the header.
 */
function updateCartUI() {
    const cart = getCart();
    const cartCountSpan = document.querySelector('.cart-count');

    console.log('updateCartUI() called. Cart contents:', cart); // Added log

    if (cartCountSpan) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log('Total items calculated:', totalItems); // Added log
        cartCountSpan.textContent = totalItems.toString(); // Update the text content
        // Add a class for visual feedback (e.g., bounce animation) if needed
        cartCountSpan.classList.add('bouncing');
        setTimeout(() => {
            cartCountSpan.classList.remove('bouncing');
        }, 500);
    } else {
        console.warn('Cart count span (.cart-count) not found in header.'); // Added warning
    }
}


// --- DOMContentLoaded for global script.js functionality ---
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for general "Add to Cart" buttons
    // This is useful if you have "Add to Cart" buttons on non-menu pages (e.g., index.html special offers)
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Look for the closest parent that is either a .menu-item or a .special-item
            const itemElement = e.target.closest('.menu-item, .special-item');
            if (itemElement) {
                const itemId = itemElement.dataset.id;
                const itemName = itemElement.dataset.name;
                const itemPrice = parseFloat(itemElement.dataset.price);

                // Note: The global addToCart here doesn't take 'image' directly from data attributes
                // It expects 'options' and 'instructions'.
                // If you need images handled globally, the addToCart signature in script.js
                // and the data attributes on items need to be consistent across all pages.
                // For now, let's assume menu.js handles image for its specific calls.

                const options = itemElement.dataset.options || '';
                const instructions = itemElement.dataset.instructions || '';
                const image = itemElement.dataset.image || ''; // Ensure image is also passed if available globally


                if (itemId && itemName && !isNaN(itemPrice)) {
                    // Call the global addToCart function
                    addToCart(itemId, itemName, itemPrice, image, options, instructions);
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
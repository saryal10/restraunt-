document.addEventListener('DOMContentLoaded', () => {
    // These elements are specific to the menu page's cart overlay
    const cartOverlay = document.getElementById('shopping-cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartNavIcon = document.getElementById('cart-nav-icon'); // The cart icon in the header

    // Cart Navigation Icon Click Listener (opens the cart overlay)
    // This assumes the cart overlay is present only on the menu page
    if (cartNavIcon && cartOverlay) {
        cartNavIcon.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            cartOverlay.classList.add('show');
            // Re-render the cart items inside the overlay if this is the menu page
            renderCartItemsInOverlay();
        });
    }

    // Close Cart Button Listener
    if (closeCartBtn && cartOverlay) {
        closeCartBtn.addEventListener('click', () => {
            cartOverlay.classList.remove('show');
        });
    }

    // Close Cart Overlay when clicking outside the cart content (on the backdrop)
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) { // Only close if click is directly on the overlay backdrop itself
                cartOverlay.classList.remove('show');
            }
        });
    }

    // Function to render items inside the shopping cart overlay on the menu page
    function renderCartItemsInOverlay() {
        const cart = getCart(); // Use the global getCart() from script.js
        const cartItemsList = document.getElementById('cart-items');
        const cartTotalPriceSpan = document.getElementById('cart-total-price');

        if (!cartItemsList || !cartTotalPriceSpan) return; // Exit if elements not found

        cartItemsList.innerHTML = ''; // Clear existing items

        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="empty-cart-message">Your cart is empty.</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('cart-item');
                li.dataset.itemId = item.id;
                li.dataset.itemOptions = item.options || ''; // Store options for removal/update
                li.dataset.itemInstructions = item.instructions || ''; // Store instructions for removal/update

                let itemText = `${item.name} (${item.quantity} x $${item.price.toFixed(2)})`;
                if (item.options) {
                    itemText += ` - Options: ${item.options}`;
                }
                if (item.instructions) {
                    itemText += ` - Instructions: ${item.instructions}`;
                }

                li.innerHTML = `
                    <span>${itemText}</span>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}" data-options="${item.options}" data-instructions="${item.instructions}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${item.id}" data-options="${item.options}" data-instructions="${item.instructions}">+</button>
                        <button class="remove-from-cart-btn" data-id="${item.id}" data-options="${item.options}" data-instructions="${item.instructions}">&times;</button>
                    </div>
                `;
                cartItemsList.appendChild(li);
                total += item.price * item.quantity;
            });
        }

        cartTotalPriceSpan.textContent = `$${total.toFixed(2)}`;

        // Add event listeners for quantity changes and removal within the overlay
        cartItemsList.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const options = e.target.dataset.options;
                const instructions = e.target.dataset.instructions;
                removeFromCart(id, options, instructions); // Use global removeFromCart
                renderCartItemsInOverlay(); // Re-render after change
            });
        });

        cartItemsList.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const options = e.target.dataset.options;
                const instructions = e.target.dataset.instructions;
                const currentQuantity = parseInt(e.target.previousElementSibling.textContent);
                updateItemQuantity(id, currentQuantity + 1, options, instructions); // Use global updateItemQuantity
                renderCartItemsInOverlay(); // Re-render after change
            });
        });

        cartItemsList.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const options = e.target.dataset.options;
                const instructions = e.target.dataset.instructions;
                const currentQuantity = parseInt(e.target.nextElementSibling.textContent);
                updateItemQuantity(id, currentQuantity - 1, options, instructions); // Use global updateItemQuantity
                renderCartItemsInOverlay(); // Re-render after change
            });
        });
    }


    // Checkout Button Listener (inside cart overlay, navigates to checkout page)
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart(); // Get latest cart state using global getCart
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showToast('Your cart is empty. Please add items before checking out.', 'error'); // Use global showToast
            }
        });
    }

    // --- Initial Load ---
    // Call updateCartUI once when the page loads to display any existing cart items
    // and correctly set the cart count and checkout button state.
    updateCartUI(); // From script.js
    renderCartItemsInOverlay(); // Render items in the overlay on menu page load
});
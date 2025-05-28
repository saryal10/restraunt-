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

    // Event listeners for "Add to Cart" buttons on menu items
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemElement = e.target.closest('.menu-item');
            const id = itemElement.dataset.id;
            const name = itemElement.dataset.name;
            const price = parseFloat(itemElement.dataset.price);
            const image = itemElement.dataset.image; // This line correctly gets the image path

            // Console log for debugging - can be removed after confirming it works
            console.log('Value of data-image read by JS:', image);

            // Existing options and instructions logic
            let selectedOptions = [];
            let instructions = '';

            const optionsContainer = itemElement.querySelector('.item-options-container');
            if (optionsContainer) {
                optionsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                    selectedOptions.push(checkbox.value);
                });
                const instructionsInput = optionsContainer.querySelector('.item-instructions-input');
                if (instructionsInput) {
                    instructions = instructionsInput.value;
                }
            }

            // Call addToCart from script.js
            addToCart(id, name, price, image, selectedOptions.join(', '), instructions);

            // --- IMPORTANT CHANGE HERE: ---
            // Removed: cartOverlay.classList.add('show');
            // Now, the overlay will NOT automatically show when an item is added.
            // It will only show when the cart icon in the header is clicked.

            // This ensures the cart's content is updated even if the overlay isn't visible
            if (cartOverlay) {
                renderCartItemsInOverlay(); // Re-render its contents
            }
        });
    });

    // Function to render items inside the shopping cart overlay on the menu page
    function renderCartItemsInOverlay() {
        const cart = getCart(); // Use the global getCart() from script.js
        const cartItemsList = document.getElementById('cart-items');
        const cartTotalPriceSpan = document.getElementById('cart-total-price'); // Assuming you meant cart-total-amount from your HTML

        // Corrected reference based on menu.html snippet:
        const cartTotalAmountSpan = document.getElementById('cart-total-amount');

        if (!cartItemsList || !cartTotalAmountSpan) {
            console.error('Cart items list or total price span not found in overlay.');
            return; // Exit if elements not found
        }

        cartItemsList.innerHTML = ''; // Clear existing items

        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="empty-cart-message">Your cart is empty.</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('cart-item');
                // Use dataset for easy access to item properties for quantity/removal
                li.dataset.itemId = item.id;
                li.dataset.itemOptions = item.options || '';
                li.dataset.itemInstructions = item.instructions || '';

                // Add image to cart overlay item if available
                const itemImageHtml = item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-overlay-item-img">` : '';

                li.innerHTML = `
                    <div class="cart-item-info">
                        ${itemImageHtml}
                        <span>${item.name} (${item.quantity} x $${item.price.toFixed(2)})</span>
                        ${item.options ? `<small>Options: ${item.options}</small>` : ''}
                        ${item.instructions ? `<small>Instructions: ${item.instructions}</small>` : ''}
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease-quantity"
                                data-id="${item.id}"
                                data-options="${item.options}"
                                data-instructions="${item.instructions}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity"
                                data-id="${item.id}"
                                data-options="${item.options}"
                                data-instructions="${item.instructions}">+</button>
                        <button class="remove-from-cart-btn"
                                data-id="${item.id}"
                                data-options="${item.options}"
                                data-instructions="${item.instructions}">&times;</button>
                    </div>
                `;
                cartItemsList.appendChild(li);
                total += item.price * item.quantity;
            });
        }

        cartTotalAmountSpan.textContent = total.toFixed(2); // Update the correct span for total amount

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
    updateCartUI(); // This is called here and by script.js's DOMContentLoaded.
                    // The one in script.js is enough for header count.
                    // Keep this one if you need to specifically update UI elements
                    // that only exist on the menu page's initial load.
    renderCartItemsInOverlay(); // Render items in the overlay on menu page load, so it's ready when opened.
});
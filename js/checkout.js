document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalPriceSpan = document.getElementById('subtotal-price');
    const taxPriceSpan = document.getElementById('tax-price');
    const finalTotalPriceSpan = document.getElementById('final-total-price');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const checkoutForm = document.getElementById('checkout-form');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const creditCardDetailsDiv = document.getElementById('credit-card-details');
    const checkoutMessage = document.querySelector('.checkout-message');

    // Elements for pickup/delivery
    const orderTypeRadios = document.querySelectorAll('input[name="order-type"]');
    const pickupOptionsDiv = document.getElementById('pickup-options');
    const deliveryOptionsDiv = document.getElementById('delivery-options');
    const pickupTimeOptionRadios = document.querySelectorAll('input[name="pickup-time-option"]');
    const pickupTimeInputGroup = document.getElementById('pickup-time-input-group');
    const pickupTimeInput = document.getElementById('pickup-time');
    const deliveryAddressInput = document.getElementById('delivery-address');
    const deliveryDateInput = document.getElementById('delivery-date');
    const deliveryTimeInput = document.getElementById('delivery-time');

    // Elements for tip
    const tipButtons = document.querySelectorAll('.tip-btn');
    const tipCustomInputGroup = document.querySelector('.tip-box'); // The div containing custom tip input
    const tipAmountInput = document.getElementById('tip-amount');
    const customTipLabel = document.getElementById('custom-tip-label'); // Reference to the custom tip label

    // --- Helper Functions (relying on global functions from script.js) ---
    // getCart(), saveCart(), addToCart(), removeFromCart(), updateItemQuantity(), updateCartUI(), showToast()
    // are assumed to be available from script.js

    /**
     * Calculates the subtotal, tax, tip, and final total for the cart.
     * @param {Array} cart - The current cart array.
     * @returns {Object} An object containing subtotal, tax, tip, and total.
     */
    function calculateCartTotals(cart) {
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        const taxRate = 0.08; // Example tax rate (8%)
        const tax = subtotal * taxRate;

        // Determine the current tip selection type (percentage or custom)
        let currentTipPercentage = 0;
        let isCustomTipActive = false;
        const activeTipButton = document.querySelector('.tip-btn.active');

        if (activeTipButton && activeTipButton.dataset.tip !== 'custom') {
            currentTipPercentage = parseFloat(activeTipButton.dataset.tip);
        } else if (activeTipButton && activeTipButton.dataset.tip === 'custom') {
            isCustomTipActive = true;
        }

        let tip = 0;
        if (isCustomTipActive) {
            tip = parseFloat(tipAmountInput.value) || 0; // Use user-entered custom tip
        } else {
            // If a percentage tip was active, recalculate it based on new subtotal
            tip = subtotal * currentTipPercentage;
        }
        
        if (tip < 0) tip = 0; // Ensure tip is not negative
        const total = subtotal + tax + tip;
        return { subtotal, tax, tip, total };
    }

    /**
     * Renders the cart items and updates the total prices on the checkout page.
     * This function is called whenever the cart changes or tip amount is updated.
     */
    function renderCheckoutCart() {
        const cart = getCart(); // Use the global getCart() from script.js
        cartItemsContainer.innerHTML = ''; // Clear previous items

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsContainer.classList.add('hidden'); // Hide container if empty
            checkoutForm.style.display = 'none'; // Hide form if cart is empty
        } else {
            emptyCartMessage.style.display = 'none';
            cartItemsContainer.classList.remove('hidden'); // Show container if not empty
            checkoutForm.style.display = 'block'; // Show payment details and place order button

            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');

                // Create a unique ID for the DOM element based on item properties
                // This is crucial for correctly identifying items with options/instructions
                const optionsHash = btoa(item.options || '');
                const instructionsHash = btoa(item.instructions || '');
                const itemUniqueId = `${item.id}-${optionsHash}-${instructionsHash}`;

                cartItemDiv.innerHTML = `
                    <img src="${item.image || 'https://placehold.co/80x80/cccccc/000000?text=No+Image'}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        ${item.options ? `<p class="item-options">Options: ${item.options}</p>` : ''}
                        ${item.instructions ? `<p class="item-instructions">Instructions: ${item.instructions}</p>` : ''}
                        <div class="item-quantity-controls">
                            <button class="quantity-decrease" data-unique-id="${itemUniqueId}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-increase" data-unique-id="${itemUniqueId}">+</button>
                        </div>
                    </div>
                    <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item-btn" data-unique-id="${itemUniqueId}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });

            // Re-attach event listeners for quantity controls and remove button
            // This is necessary because innerHTML replaces the elements, removing old listeners.
            // Using event delegation on the container is generally more efficient.
            cartItemsContainer.querySelectorAll('.quantity-decrease').forEach(button => {
                button.onclick = (e) => {
                    const uniqueId = e.target.dataset.uniqueId;
                    const currentCart = getCart();
                    const itemInCart = currentCart.find(cartItem => {
                        const optionsHash = btoa(cartItem.options || '');
                        const instructionsHash = btoa(cartItem.instructions || '');
                        return `${cartItem.id}-${optionsHash}-${instructionsHash}` === uniqueId;
                    });
                    if (itemInCart && itemInCart.quantity > 1) {
                        updateItemQuantity(itemInCart.id, itemInCart.quantity - 1, itemInCart.options, itemInCart.instructions);
                    } else if (itemInCart) {
                        removeFromCart(itemInCart.id, itemInCart.options, itemInCart.instructions);
                    }
                    renderCheckoutCart(); // Re-render after quantity change or removal
                };
            });

            cartItemsContainer.querySelectorAll('.quantity-increase').forEach(button => {
                button.onclick = (e) => {
                    const uniqueId = e.target.dataset.uniqueId;
                    const currentCart = getCart();
                    const itemInCart = currentCart.find(cartItem => {
                        const optionsHash = btoa(cartItem.options || '');
                        const instructionsHash = btoa(cartItem.instructions || '');
                        return `${cartItem.id}-${optionsHash}-${instructionsHash}` === uniqueId;
                    });
                    if (itemInCart) {
                        updateItemQuantity(itemInCart.id, itemInCart.quantity + 1, itemInCart.options, itemInCart.instructions);
                    }
                    renderCheckoutCart(); // Re-render after quantity change
                };
            });

            cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
                button.onclick = (e) => {
                    const uniqueId = e.target.dataset.uniqueId;
                    const currentCart = getCart();
                    const itemInCart = currentCart.find(cartItem => {
                        const optionsHash = btoa(cartItem.options || '');
                        const instructionsHash = btoa(cartItem.instructions || '');
                        return `${cartItem.id}-${optionsHash}-${instructionsHash}` === uniqueId;
                    });
                    if (itemInCart) {
                        removeFromCart(itemInCart.id, itemInCart.options, itemInCart.instructions);
                    }
                    renderCheckoutCart(); // Re-render after removal
                };
            });
        }

        // Update totals displayed
        const { subtotal, tax, tip, total } = calculateCartTotals(cart);
        subtotalPriceSpan.textContent = subtotal.toFixed(2);
        taxPriceSpan.textContent = tax.toFixed(2);
        document.getElementById('tip-price').textContent = tip.toFixed(2); // Update tip price span
        finalTotalPriceSpan.textContent = total.toFixed(2);

        // Update cart count in header (assuming updateCartUI is available globally)
        if (typeof updateCartUI === 'function') {
            updateCartUI();
        }
    }

    // --- Event Listeners ---

    // Payment method radio button listener
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'credit-card') {
                creditCardDetailsDiv.style.display = 'block';
            } else {
                creditCardDetailsDiv.style.display = 'none';
            }
        });
    });

    // Order Type radio button listener
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'pickup') {
                pickupOptionsDiv.classList.remove('hidden'); // Show pickup options
                deliveryOptionsDiv.classList.add('hidden'); // Hide delivery options

                // Set default pickup time option if not already set
                if (!document.querySelector('input[name="pickup-time-option"]:checked')) {
                    document.getElementById('pickup-now').checked = true;
                    pickupTimeInputGroup.classList.add('hidden'); // Hide time input by default for 'now'
                }
            } else if (radio.value === 'delivery') {
                deliveryOptionsDiv.classList.remove('hidden'); // Show delivery options
                pickupOptionsDiv.classList.add('hidden'); // Hide pickup options
            }
        });
    });

    // Pickup Time option listener
    pickupTimeOptionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'choose-time') {
                pickupTimeInputGroup.classList.remove('hidden'); // Show time input group
            } else {
                pickupTimeInputGroup.classList.add('hidden'); // Hide time input group
            }
        });
    });

    // Tip buttons listener
    tipButtons.forEach(button => {
        button.addEventListener('click', () => {
            tipButtons.forEach(btn => btn.classList.remove('active')); // Remove active from all
            button.classList.add('active'); // Add active to clicked button

            if (button.dataset.tip === 'custom') {
                tipAmountInput.value = '0.00'; // Reset custom tip amount when 'Custom' is selected
                customTipLabel.classList.remove('hidden'); // Show custom tip label
            } else {
                const tipPercentage = parseFloat(button.dataset.tip);
                const currentCart = getCart();
                const { subtotal } = calculateCartTotals(currentCart); // Recalculate subtotal for tip
                tipAmountInput.value = (subtotal * tipPercentage).toFixed(2);
                customTipLabel.classList.add('hidden'); // Hide custom tip label for pre-filled tips
            }
            renderCheckoutCart(); // Recalculate totals with new tip
        });
    });

    // Event listener for direct input into tip amount to show custom tip label
    tipAmountInput.addEventListener('input', () => {
        // Remove active state from all tip buttons if user types directly
        tipButtons.forEach(btn => btn.classList.remove('active'));
        // If the user types in the custom tip, ensure the label is visible
        customTipLabel.classList.remove('hidden');
        renderCheckoutCart(); // Recalculate totals with custom tip
    });


    // Checkout form submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        // Basic form validation
        const selectedOrderType = document.querySelector('input[name="order-type"]:checked');
        if (!selectedOrderType) {
            checkoutMessage.textContent = 'Please select an order type (Pickup or Delivery).';
            checkoutMessage.style.display = 'block';
            checkoutMessage.classList.add('message-error');
            if (typeof showToast === 'function') {
                showToast('Please select an order type (Pickup or Delivery).', 'error');
            }
            return;
        }

        if (selectedOrderType.value === 'delivery') {
            if (!deliveryAddressInput.value || !deliveryDateInput.value || !deliveryTimeInput.value) {
                checkoutMessage.textContent = 'Please fill in all delivery details.';
                checkoutMessage.style.display = 'block';
                checkoutMessage.classList.add('message-error');
                if (typeof showToast === 'function') {
                    showToast('Please fill in all delivery details.', 'error');
                }
                return;
            }
        } else if (selectedOrderType.value === 'pickup') {
            const selectedPickupTimeOption = document.querySelector('input[name="pickup-time-option"]:checked');
            if (selectedPickupTimeOption && selectedPickupTimeOption.value === 'choose-time' && !pickupTimeInput.value) {
                checkoutMessage.textContent = 'Please select a pickup time.';
                checkoutMessage.style.display = 'block';
                checkoutMessage.classList.add('message-error');
                if (typeof showToast === 'function') {
                    showToast('Please select a pickup time.', 'error');
                }
                return;
            }
        }

        // Gather all order details
        const cart = getCart(); // Get current cart items
        const { subtotal, tax, tip, total } = calculateCartTotals(cart);

        const orderDetails = {
            cartItems: cart,
            totals: {
                subtotal: subtotal,
                tax: tax,
                tip: tip,
                total: total
            },
            paymentMethod: document.querySelector('input[name="payment-method"]:checked').value,
            customerDetails: {
                // In a real scenario, you'd get these from user input or a logged-in user session
                name: 'Guest Customer', // Placeholder
                email: 'guest@example.com' // Placeholder
            }
        };

        // Add payment details if credit card is selected
        if (orderDetails.paymentMethod === 'credit-card') {
            orderDetails.creditCard = {
                cardNumber: document.getElementById('card-number').value,
                expDate: document.getElementById('exp-date').value,
                cvv: document.getElementById('cvv').value,
                cardName: document.getElementById('card-name').value
            };
        }

        // Add order type specific details
        if (selectedOrderType) {
            orderDetails.orderType = selectedOrderType.value;
            if (selectedOrderType.value === 'pickup') {
                const selectedPickupTimeOption = document.querySelector('input[name="pickup-time-option"]:checked');
                if (selectedPickupTimeOption && selectedPickupTimeOption.value === 'choose-time') {
                    orderDetails.pickupTime = pickupTimeInput.value;
                } else {
                    orderDetails.pickupTime = 'ASAP'; // "Now" option
                }
            } else if (selectedOrderType.value === 'delivery') {
                orderDetails.deliveryAddress = deliveryAddressInput.value;
                orderDetails.deliveryDate = deliveryDateInput.value;
                orderDetails.deliveryTime = deliveryTimeInput.value;
            }
        }

        // Add tip amount to order details
        orderDetails.tipAmount = parseFloat(tipAmountInput.value) || 0;
        console.log('Order Details:', orderDetails);

        // Simulate order placement (replace with actual API call in a real custom development scenario)
        checkoutMessage.textContent = 'Placing your order...';
        checkoutMessage.style.display = 'block';
        checkoutMessage.classList.remove('message-error');
        checkoutMessage.classList.add('message-success');

        setTimeout(() => {
            // Clear cart from global localStorage key
            localStorage.removeItem(CART_STORAGE_KEY); // Use the global constant
            renderCheckoutCart(); // Re-render to show empty cart
            checkoutForm.reset(); // Clear form
            tipAmountInput.value = '0.00'; // Reset tip amount
            customTipLabel.classList.add('hidden'); // Hide custom tip input label
            tipButtons.forEach(btn => btn.classList.remove('active')); // Deactivate tip buttons

            // --- FIX START ---
            // After resetting the form, the "Credit Card" radio button is checked by default.
            // However, the 'change' event isn't fired, so we need to manually show the credit card details.
            document.getElementById('card').checked = true; // Ensure Credit Card is selected
            creditCardDetailsDiv.style.display = 'block'; // Explicitly show credit card details
            // --- FIX END ---

            // Call global updateCartUI for the header count
            if (typeof updateCartUI === 'function') {
                updateCartUI();
            }
            // Use global showToast
            if (typeof showToast === 'function') {
                showToast('Order placed successfully! Thank you!', 'success');
            }

            // Hide pickup/delivery options after successful order
            pickupOptionsDiv.classList.add('hidden');
            deliveryOptionsDiv.classList.add('hidden');
            // Uncheck order type radios
            orderTypeRadios.forEach(radio => radio.checked = false);

        }, 1500); // Simulate network request delay
    });


    // Initial render when the page loads
    renderCheckoutCart();

    // Set minimum date for delivery to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    deliveryDateInput.min = `${yyyy}-${mm}-${dd}`;
});
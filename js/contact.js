document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    const submissionMessage = document.querySelector('.form-submission-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            // In a real custom development scenario, you'd send this data to a backend server.
            // The server would then handle sending the email, saving to a database, etc.

            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData.entries());

            console.log('Form Submitted (client-side only):', formObject);

            // Simulate API call success
            // Replace this with an actual fetch request to your backend endpoint:
            /*
            try {
                const response = await fetch('/api/contact', { // Replace with your backend endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formObject)
                });

                if (response.ok) {
                    submissionMessage.textContent = 'Thank you for your message! We will get back to you shortly.';
                    submissionMessage.style.backgroundColor = '#d4edda'; // Green for success
                    submissionMessage.style.color = '#155724';
                    submissionMessage.style.display = 'block';
                    contactForm.reset(); // Clear the form
                } else {
                    const errorData = await response.json();
                    submissionMessage.textContent = `Error: ${errorData.message || 'Failed to send message.'}`;
                    submissionMessage.style.backgroundColor = '#f8d7da'; // Red for error
                    submissionMessage.style.color = '#721c24';
                    submissionMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Network error:', error);
                submissionMessage.textContent = 'There was a network error. Please try again later.';
                submissionMessage.style.backgroundColor = '#f8d7da';
                submissionMessage.style.color = '#721c24';
                submissionMessage.style.display = 'block';
            }
            */

            // For now, just show success message immediately on client-side
            if (submissionMessage) {
                submissionMessage.textContent = 'Thank you for your message! We will get back to you shortly.';
                submissionMessage.style.backgroundColor = '#d4edda';
                submissionMessage.style.color = '#155724';
                submissionMessage.style.display = 'block';
            }
            contactForm.reset(); // Clear the form

            // Hide message after a few seconds
            setTimeout(() => {
                if (submissionMessage) submissionMessage.style.display = 'none';
            }, 5000);
        });
    }
});
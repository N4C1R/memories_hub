document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('memory-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('caption');
    const closeBtn = document.querySelector('.close-btn');

    // Fetch Memories from JSON file
    fetch('memories.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load memories');
            return response.json();
        })
        .then(memories => {
            // Check if memories array is valid
            if (!Array.isArray(memories)) throw new Error('Invalid JSON format');

            memories.forEach((memory, index) => {
                createMemoryCard(memory, index);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            let msg = 'Could not load memories. <br> Please ensure <code>memories.json</code> is properly formatted.';
            if (window.location.protocol === 'file:') {
                msg += '<br><br><strong>Note:</strong> Browsers may block loading JSON files directly from the hard drive for security. <br> Please use a local server (e.g., VS Code Live Server) or view on GitHub Pages.';
            }
            grid.innerHTML = `<p class="error-msg" style="text-align:center; width:100%; grid-column: 1/-1; color: #d32f2f; background: rgba(255,255,255,0.8); padding: 20px; border-radius: 10px;">${msg}</p>`;
        });

    /**
     * Creates a card element for a single memory
     */
    function createMemoryCard(memory, index) {
        const card = document.createElement('div');
        card.classList.add('memory-card');

        // --- Image Section ---
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('card-image-wrapper');

        const img = document.createElement('img');
        img.src = `images/${memory.image}`;
        img.alt = memory.description;
        img.loading = "lazy"; // Optimization

        // Fallback for broken images
        img.onerror = function () {
            this.src = 'https://placehold.co/600x600/pink/white?text=Memory+Image';
            console.warn(`Image not found: ${memory.image}`);
        };

        imgWrapper.appendChild(img);

        // --- Content Section ---
        const content = document.createElement('div');
        content.classList.add('card-content');

        const description = document.createElement('p');
        description.classList.add('card-description');
        description.textContent = memory.description;

        content.appendChild(description);

        // Optional: Date Display
        if (memory.date) {
            const date = document.createElement('p');
            date.classList.add('card-date');
            try {
                const dateObj = new Date(memory.date);
                // Customize date format here
                date.textContent = dateObj.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (e) {
                date.textContent = memory.date;
            }
            content.appendChild(date);
        }

        // Assemble Card
        card.appendChild(imgWrapper);
        card.appendChild(content);

        // Add Lightbox Event
        card.addEventListener('click', () => {
            openLightbox(memory);
        });

        // Add to Grid
        grid.appendChild(card);

        // --- Animation Trigger ---
        // Stagger the fade-in animation
        setTimeout(() => {
            card.classList.add('loaded');
        }, 100 + (index * 150));
    }

    /**
     * Opens the Lightbox Modal
     */
    function openLightbox(memory) {
        lightbox.classList.remove('hidden');
        lightbox.style.display = 'flex';

        // Small delay to allow display:flex to apply before transition
        requestAnimationFrame(() => {
            lightbox.style.opacity = '1';
        });

        lightboxImg.src = `images/${memory.image}`;
        lightboxCaption.textContent = memory.description;
        document.body.style.overflow = 'hidden'; // Disable scroll
    }

    /**
     * Closes the Lightbox Modal
     */
    function closeLightbox() {
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightbox.style.display = 'none';
            lightboxImg.src = ''; // Clear source to stop video/large image
            document.body.style.overflow = ''; // Enable scroll
        }, 300); // Match CSS transition duration
    }

    // --- Event Listeners ---
    closeBtn.addEventListener('click', closeLightbox);

    // Close when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });
});

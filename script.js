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
        // Date Display
        if (memory.date) {
            const date = document.createElement('p');
            date.classList.add('card-date');
            try {
                // Parse manually to prevent timezone shift (treat as local time)
                const [year, month, day] = memory.date.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);

                if (isNaN(dateObj.getTime())) throw new Error('Invalid Date');

                date.textContent = dateObj.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch (e) {
                date.textContent = memory.date;
            }
            content.appendChild(date);
        } else {
            // Attempt to extract date from EXIF if not provided in JSON
            if (typeof EXIF !== 'undefined') {
                EXIF.getData(img, function () {
                    const exifDate = EXIF.getTag(this, "DateTimeOriginal") || EXIF.getTag(this, "CreateDate");

                    if (exifDate) {
                        const date = document.createElement('p');
                        date.classList.add('card-date');

                        // Parse EXIF format: "YYYY:MM:DD HH:MM:SS"
                        try {
                            const [datePart] = exifDate.split(" ");
                            const [year, month, day] = datePart.split(":").map(Number);
                            const dateObj = new Date(year, month - 1, day);

                            date.textContent = dateObj.toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                        } catch (e) {
                            // Fallback to raw string if parsing fails
                            date.textContent = exifDate.split(" ")[0].replace(/:/g, "-");
                        }
                        content.appendChild(date);
                    }
                });
            }
        }

        // Assemble Card
        card.appendChild(imgWrapper);
        card.appendChild(content);

        // Add Lightbox Event & Particles
        card.addEventListener('click', (e) => {
            createParticles(e.clientX, e.clientY);
            // Small delay for visual effect before opening
            setTimeout(() => openLightbox(memory), 150);
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

    /**
     * Creates cute particles at the click coordinates
     */
    function createParticles(x, y) {
        const particleCount = 12;
        const colors = ['#ff6b81', '#ff9ff3', '#feca57', '#48dbfb', '#ff9f43'];
        const shapes = ['♥', '★', '✨', '•'];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Random properties
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.textContent = shape;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.color = color;

            // Random direction
            const angle = Math.random() * 2 * Math.PI;
            const velocity = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity + 'px';
            const ty = Math.sin(angle) * velocity + 'px';
            const rot = (Math.random() - 0.5) * 360 + 'deg';

            particle.style.setProperty('--tx', tx);
            particle.style.setProperty('--ty', ty);
            particle.style.setProperty('--rot', rot);

            document.body.appendChild(particle);

            // Cleanup
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    }
});

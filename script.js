// Set Current Year in Footer
document.getElementById('year').textContent = new Date().getFullYear();

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for scroll animations (Fade in & Slide up)
const fadeElements = document.querySelectorAll('.fade-up-element');

const fadeObserverOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            
            // Trigger counter animation if element contains counters
            const counters = entry.target.querySelectorAll('.counter');
            if (counters.length > 0) {
                startCounters(counters);
            }
            
            // Optional: stop observing once animated to keep it visible
            // observer.unobserve(entry.target);
        }
    });
}, fadeObserverOptions);

fadeElements.forEach(el => {
    fadeObserver.observe(el);
});

// Counter Animation for Trust/Proof Section
// Ensures counter only runs once per load to prevent weird resets unless desired
let animatedCounters = new Set();

function startCounters(counters) {
    counters.forEach(counter => {
        if (animatedCounters.has(counter)) return;
        
        animatedCounters.add(counter);
        
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const frameRate = 60;
        const totalFrames = Math.round((duration / 1000) * frameRate);
        const increment = target / totalFrames;
        
        let currentCount = 0;
        
        const updateCounter = () => {
            currentCount += increment;
            
            if (currentCount < target) {
                counter.innerText = Math.ceil(currentCount);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        };
        
        updateCounter();
    });
}

// =========================================
// DF MESSENGER - Shadow DOM Style Injection
// Forces readable text color inside chatbot input
// =========================================
function injectDfMessengerStyles() {
    const dfMessenger = document.querySelector('df-messenger');
    if (!dfMessenger) return;

    const darkInputCSS = `
        input, textarea, [contenteditable] {
            color: #e8e8f0 !important;
            caret-color: #6C63FF !important;
        }
        input::placeholder, textarea::placeholder {
            color: #666680 !important;
        }
    `;

    const injectIntoShadow = (el) => {
        if (!el || !el.shadowRoot) return;
        // Avoid duplicate injection
        if (el.shadowRoot.querySelector('[data-df-dark-fix]')) return;
        const style = document.createElement('style');
        style.setAttribute('data-df-dark-fix', 'true');
        style.textContent = darkInputCSS;
        el.shadowRoot.appendChild(style);
    };

    const deepInject = (root) => {
        if (!root) return;
        const elements = root.querySelectorAll('*');
        elements.forEach(el => {
            if (el.shadowRoot) {
                injectIntoShadow(el);
                deepInject(el.shadowRoot);
            }
        });
    };

    const tryInject = () => {
        if (!dfMessenger.shadowRoot) return;
        injectIntoShadow(dfMessenger);
        deepInject(dfMessenger.shadowRoot);
    };

    // Retry multiple times as shadow roots are lazily created
    [500, 1500, 3000, 5000].forEach(ms => setTimeout(tryInject, ms));

    // Re-inject when user clicks the chat bubble (opens the panel)
    dfMessenger.addEventListener('click', () => {
        [300, 800, 1500].forEach(ms => setTimeout(tryInject, ms));
    });
}

// Initialize after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectDfMessengerStyles, 500));
} else {
    setTimeout(injectDfMessengerStyles, 500);
}

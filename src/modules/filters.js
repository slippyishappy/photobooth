export class FilterManager {
    constructor() {
        this.filterButtons = [];
        this.currentFilter = 'none';
        this.cameraController = null;
    }
    
    init() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.setupEventListeners();
        
        // Get camera controller reference from video element
        // This is a bit of a hack, but it works for our modular approach
        this.video = document.getElementById('video');
    }
    
    setupEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterName = button.dataset.filter;
                this.selectFilter(filterName);
            });
        });
        
        // Keyboard shortcuts for filters
        document.addEventListener('keydown', (event) => {
            if (document.getElementById('camera-screen').classList.contains('active')) {
                const filterMap = {
                    'Digit1': 'none',
                    'Digit2': 'sepia',
                    'Digit3': 'grayscale',
                    'Digit4': 'blur',
                    'Digit5': 'contrast',
                    'Digit6': 'rainbow',
                    'Digit7': 'neon',
                    'Digit8': 'vintage'
                };
                
                if (filterMap[event.code]) {
                    event.preventDefault();
                    this.selectFilter(filterMap[event.code]);
                }
            }
        });
    }
    
    selectFilter(filterName) {
        this.currentFilter = filterName;
        
        // Update button states
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.filter === filterName) {
                button.classList.add('active');
            }
        });
        
        // Apply filter to video
        if (this.video) {
            this.video.className = `filter-${filterName}`;
        }
        
        // Apply filter to captured image if it exists
        const capturedImage = document.getElementById('captured-image');
        if (capturedImage && capturedImage.src) {
            capturedImage.className = `filter-${filterName}`;
        }
        
        // Notify camera controller of filter change
        if (window.app && window.app.cameraController) {
            window.app.cameraController.setFilter(filterName);
        }
        
        // Add visual feedback
        this.addFilterFeedback(filterName);
    }
    
    addFilterFeedback(filterName) {
        // Create a brief visual feedback for filter selection
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(78, 205, 196, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 1000;
            animation: slideInOut 2s ease-in-out;
        `;
        
        feedback.textContent = `Filter: ${this.getFilterDisplayName(filterName)}`;
        
        // Add animation keyframes if not already added
        if (!document.querySelector('#filter-feedback-style')) {
            const style = document.createElement('style');
            style.id = 'filter-feedback-style';
            style.textContent = `
                @keyframes slideInOut {
                    0% { transform: translateX(100%); opacity: 0; }
                    15%, 85% { transform: translateX(0); opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
    
    getFilterDisplayName(filterName) {
        const displayNames = {
            none: 'Normal',
            sepia: 'Vintage',
            grayscale: 'Black & White',
            blur: 'Dreamy',
            contrast: 'Pop',
            rainbow: 'Rainbow',
            neon: 'Neon',
            vintage: 'Retro'
        };
        
        return displayNames[filterName] || filterName;
    }
    
    getCurrentFilter() {
        return this.currentFilter;
    }
    
    reset() {
        this.selectFilter('none');
    }
    
    // Method to be called by camera controller
    setCameraController(cameraController) {
        this.cameraController = cameraController;
    }
}


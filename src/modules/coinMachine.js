export class CoinMachine {
    constructor() {
        this.coinSlot = null;
        this.coinInsertedCallback = null;
        this.insertionSound = null;
    }
    
    init() {
        this.coinSlot = document.getElementById('coin-slot');
        console.log('Coin slot element:', this.coinSlot);
        this.setupEventListeners();
        this.createInsertionSound();
    }
    
    setupEventListeners() {
        if (this.coinSlot) {
            console.log('Setting up coin slot click listener');
            this.coinSlot.addEventListener('click', () => {
                console.log('Coin slot clicked!');
                this.insertCoin();
            });
        } else {
            console.error('Coin slot element not found!');
        }
        
        // Also listen for spacebar as alternative coin insertion
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && document.getElementById('coin-screen').classList.contains('active')) {
                event.preventDefault();
                this.insertCoin();
            }
        });
    }
    
    createInsertionSound() {
        // Create a simple audio context for coin sound effect
        // We'll create this lazily on first click to handle user interaction requirements
        this.insertionSound = () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Resume audio context if it's suspended (required for user interaction)
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (error) {
                console.warn('Audio context not available:', error);
            }
        };
    }
    
    insertCoin() {
        console.log('Inserting coin...');
        
        // Play coin sound (with user interaction to enable audio context)
        if (this.insertionSound) {
            try {
                this.insertionSound();
            } catch (error) {
                console.warn('Could not play coin sound:', error);
            }
        }
        
        // Add insertion animation
        this.animateCoinInsertion();
        
        // Trigger callback after animation
        setTimeout(() => {
            console.log('Coin insertion animation complete, triggering callback');
            if (this.coinInsertedCallback) {
                this.coinInsertedCallback();
            }
        }, 1000);
    }
    
    animateCoinInsertion() {
        const coinIcon = this.coinSlot.querySelector('.coin-icon');
        const coinText = this.coinSlot.querySelector('.coin-text');
        
        if (coinIcon && coinText) {
            // Animate coin dropping
            coinIcon.style.animation = 'none';
            coinIcon.style.transform = 'translateY(100px) scale(0.5)';
            coinIcon.style.opacity = '0';
            
            // Update text
            coinText.textContent = 'Coin Inserted! Starting...';
            coinText.style.color = '#4ecdc4';
            
            // Add border glow effect
            this.coinSlot.style.borderColor = '#4ecdc4';
            this.coinSlot.style.boxShadow = '0 0 20px rgba(78, 205, 196, 0.5)';
        }
    }
    
    onCoinInserted(callback) {
        this.coinInsertedCallback = callback;
    }
    
    reset() {
        const coinIcon = this.coinSlot?.querySelector('.coin-icon');
        const coinText = this.coinSlot?.querySelector('.coin-text');
        
        if (coinIcon && coinText) {
            coinIcon.style.animation = 'coinSpin 2s linear infinite';
            coinIcon.style.transform = 'none';
            coinIcon.style.opacity = '1';
            
            coinText.textContent = 'Click to Insert Coin';
            coinText.style.color = '#ccc';
            
            this.coinSlot.style.borderColor = '#555';
            this.coinSlot.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)';
        }
    }
}


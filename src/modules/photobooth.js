import { CoinMachine } from './coinMachine.js';
import { CameraController } from './camera.js';
import { FilterManager } from './filters.js';

export class PhotoboothApp {
    constructor() {
        this.coinMachine = new CoinMachine();
        this.cameraController = new CameraController();
        this.filterManager = new FilterManager();
        
        this.coinScreen = document.getElementById('coin-screen');
        this.cameraScreen = document.getElementById('camera-screen');
        
        this.isActive = false;
    }
    
    init() {
        console.log('Initializing photobooth...');
        this.setupEventListeners();
        this.coinMachine.init();
        console.log('Photobooth initialized!');
    }
    
    setupEventListeners() {
        // Listen for coin insertion
        console.log('Setting up photobooth event listeners');
        this.coinMachine.onCoinInserted(() => {
            console.log('Coin inserted callback triggered!');
            this.startPhotoSession();
        });
        
        // Listen for new session request
        const newSessionBtn = document.getElementById('new-session-btn');
        newSessionBtn?.addEventListener('click', () => {
            this.endSession();
        });
    }
    
    async startPhotoSession() {
        try {
            console.log('Starting photo session...');
            // Hide coin screen and show camera screen
            this.coinScreen.classList.remove('active');
            this.cameraScreen.classList.add('active');
            
            // Initialize camera and filters
            await this.cameraController.init();
            this.filterManager.init();
            this.filterManager.setCameraController(this.cameraController);
            
            // Make app globally accessible for cross-module communication
            window.app = this;
            
            this.isActive = true;
            console.log('Photo session started!');
            
        } catch (error) {
            console.error('Failed to start photo session:', error);
            alert('Could not access camera. Please ensure camera permissions are granted.');
            this.endSession();
        }
    }
    
    endSession() {
        // Stop camera
        this.cameraController.stop();
        
        // Reset to coin screen
        this.cameraScreen.classList.remove('active');
        this.coinScreen.classList.add('active');
        
        // Reset filters
        this.filterManager.reset();
        
        // Reset coin machine
        this.coinMachine.reset();
        
        this.isActive = false;
        console.log('Photo session ended.');
    }
}


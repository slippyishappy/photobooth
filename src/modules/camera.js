export class CameraController {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.stream = null;
        this.isCapturing = false;
        this.currentFilter = 'none';
    }
    
    async init() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        
        await this.startCamera();
        this.setupEventListeners();
    }
    
    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            this.video.srcObject = this.stream;
            await this.video.play();
            
            // Set canvas dimensions to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        const captureBtn = document.getElementById('capture-btn');
        const retakeBtn = document.getElementById('retake-btn');
        const downloadBtn = document.getElementById('download-btn');
        
        captureBtn?.addEventListener('click', () => {
            this.capturePhoto();
        });
        
        retakeBtn?.addEventListener('click', () => {
            this.retakePhoto();
        });
        
        downloadBtn?.addEventListener('click', () => {
            this.downloadPhoto();
        });
        
        // Spacebar for capture (when camera is active)
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && document.getElementById('camera-screen').classList.contains('active') && !this.isCapturing) {
                event.preventDefault();
                if (document.getElementById('video').style.display !== 'none') {
                    this.capturePhoto();
                }
            }
        });
    }
    
    async capturePhoto() {
        if (this.isCapturing) return;
        
        this.isCapturing = true;
        
        // Show countdown
        await this.showCountdown();
        
        // Capture the image
        const context = this.canvas.getContext('2d');
        
        // Apply current filter to canvas
        context.filter = this.getFilterCSS(this.currentFilter);
        
        // Draw the video frame to canvas
        context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Convert to image
        const dataURL = this.canvas.toDataURL('image/png');
        
        // Show the captured image
        this.showCapturedImage(dataURL);
        
        this.isCapturing = false;
    }
    
    async showCountdown() {
        const countdown = document.getElementById('countdown');
        const numbers = ['3', '2', '1', '📸'];
        
        for (let i = 0; i < numbers.length; i++) {
            countdown.textContent = numbers[i];
            countdown.style.display = 'block';
            
            // Reset animation
            countdown.style.animation = 'none';
            countdown.offsetHeight; // Trigger reflow
            countdown.style.animation = 'countdownPulse 1s ease-in-out';
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        countdown.style.display = 'none';
    }
    
    showCapturedImage(dataURL) {
        const video = document.getElementById('video');
        const preview = document.getElementById('preview');
        const capturedImage = document.getElementById('captured-image');
        
        // Hide video, show preview
        video.style.display = 'none';
        preview.style.display = 'flex';
        
        // Set the captured image
        capturedImage.src = dataURL;
        capturedImage.className = `filter-${this.currentFilter}`;
        
        // Update button visibility
        document.getElementById('capture-btn').style.display = 'none';
        document.getElementById('retake-btn').style.display = 'inline-block';
        document.getElementById('download-btn').style.display = 'inline-block';
        document.getElementById('new-session-btn').style.display = 'inline-block';
        
        // Play camera shutter sound
        this.playShutterSound();
    }
    
    retakePhoto() {
        const video = document.getElementById('video');
        const preview = document.getElementById('preview');
        
        // Show video, hide preview
        video.style.display = 'block';
        preview.style.display = 'none';
        
        // Update button visibility
        document.getElementById('capture-btn').style.display = 'inline-block';
        document.getElementById('retake-btn').style.display = 'none';
        document.getElementById('download-btn').style.display = 'none';
        document.getElementById('new-session-btn').style.display = 'none';
    }
    
    downloadPhoto() {
        const capturedImage = document.getElementById('captured-image');
        const link = document.createElement('a');
        
        link.download = `photobooth-${Date.now()}.png`;
        link.href = capturedImage.src;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    setFilter(filterName) {
        this.currentFilter = filterName;
        
        // Apply filter to video preview
        if (this.video) {
            this.video.className = `filter-${filterName}`;
        }
        
        // Apply filter to captured image if it exists
        const capturedImage = document.getElementById('captured-image');
        if (capturedImage && capturedImage.src) {
            capturedImage.className = `filter-${filterName}`;
        }
    }
    
    getFilterCSS(filterName) {
        const filters = {
            none: 'none',
            sepia: 'sepia(1) contrast(1.2) brightness(1.1)',
            grayscale: 'grayscale(1) contrast(1.2)',
            blur: 'blur(1px) brightness(1.2) saturate(1.3)',
            contrast: 'contrast(1.8) saturate(1.5) brightness(1.1)',
            rainbow: 'hue-rotate(180deg) saturate(2) contrast(1.3)',
            neon: 'contrast(2) brightness(1.5) saturate(2) hue-rotate(90deg)',
            vintage: 'sepia(0.8) contrast(1.4) brightness(1.1) saturate(0.8)'
        };
        
        return filters[filterName] || 'none';
    }
    
    playShutterSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Could not play shutter sound:', error);
        }
    }
    
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        // Reset UI
        this.retakePhoto();
    }
}


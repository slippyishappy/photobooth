import './styles/main.css';
import { PhotoboothApp } from './modules/photobooth.js';
import { CoinMachine } from './modules/coinMachine.js';
import { CameraController } from './modules/camera.js';
import { FilterManager } from './modules/filters.js';

// Initialize the photobooth application
const app = new PhotoboothApp();
app.init();

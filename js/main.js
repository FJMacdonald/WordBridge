/**
 * Application entry point
 */
import { app } from './ui/App.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(console.error);
});
import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import imageStorage from '../../services/ImageStorageService.js';

/**
 * Picture Naming Exercise
 * Show an image/emoji, user selects the correct name
 */
class NamingExercise extends SelectionExercise {
    constructor() {
        super({ type: 'naming' });
    }
    
    async renderPrompt() {
        const item = this.currentItem;
        let visual = '';
        
        if (item.emoji) {
            visual = `<div class="prompt-visual">${item.emoji}</div>`;
        } else if (item.localImageId) {
            // Load image from IndexedDB
            const imageData = await imageStorage.getImage(item.localImageId);
            if (imageData) {
                visual = `<img src="${imageData}" alt="Name this" class="prompt-image">`;
            } else {
                visual = `<div class="prompt-visual">🖼️</div>`;
            }
        } else if (item.imageUrl) {
            // For emojis in the imageUrl field, display them directly
            if (item.imageUrl.length <= 4 && /[\u{1F300}-\u{1FAD6}]/u.test(item.imageUrl)) {
                visual = `<div class="prompt-visual">${item.imageUrl}</div>`;
            } else {
                // Try to load as image URL
                visual = `<div class="image-container">
                            <img src="${item.imageUrl}" alt="Name this" class="prompt-image" 
                                 style="max-width: 200px; max-height: 200px;"
                                 crossorigin="anonymous"
                                 onerror="this.style.display='none'; this.parentNode.querySelector('.image-fallback').style.display='block';">
                            <div class="image-fallback prompt-visual" style="display:none;">
                                <div style="font-size: 48px;">🖼️</div>
                                <div style="font-size: 24px; margin-top: 10px;">${item.answer}</div>
                            </div>
                          </div>`;
            }
        }
        
        
        return `
            ${visual}
            <p class="prompt-instruction">${t('exercises.naming.instruction')}</p>
        `;
    }
    
    async playPromptAudio() {
        // For naming, we don't speak the answer - just the instruction
        // The image is the prompt
    }
    
    getCorrectAnswer() {
        return this.currentItem.answer;
    }
}

export default NamingExercise;


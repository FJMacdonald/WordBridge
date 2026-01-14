// js/exercises/implementations/NamingExercise.js

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
            // Custom exercise with IndexedDB image
            const imageData = await imageStorage.getImage(item.localImageId);
            if (imageData) {
                visual = `<img src="${imageData}" alt="" class="prompt-image">`;
            } else {
                visual = `<div class="prompt-visual">🖼️</div>`;
            }
        } else if (item.imageUrl) {
            // Check if it's actually an emoji stored as imageUrl
            if (item.imageUrl.length <= 4 && /[\u{1F300}-\u{1FAD6}]/u.test(item.imageUrl)) {
                visual = `<div class="prompt-visual">${item.imageUrl}</div>`;
            } else {
                // Show attribution for images (required for licensing) but NOT the word
                const attribution = item.attribution 
                    ? `<div class="image-attribution" style="font-size: 10px; color: #999; margin-top: 4px; text-align: center;">${item.attribution}</div>` 
                    : '';
                visual = `<div class="image-container" style="text-align: center;">
                            <img src="${item.imageUrl}" 
                                 alt="" 
                                 class="prompt-image" 
                                 style="max-width: 200px; max-height: 200px;"
                                 crossorigin="anonymous"
                                 onerror="this.style.display='none'; this.parentNode.querySelector('.image-fallback').style.display='block';">
                            <div class="image-fallback prompt-visual" style="display:none;">
                                <div style="font-size: 48px;">🖼️</div>
                            </div>
                            ${attribution}
                          </div>`;
            }
        } else {
            visual = `<div class="prompt-visual">🖼️</div>`;
        }
        
        return `
            <p class="prompt-instruction">${t('exercises.naming.instruction')}</p>
            ${visual}
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
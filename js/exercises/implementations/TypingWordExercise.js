// js/exercises/implementations/TypingWordExercise.js

import TypingExercise from '../TypingExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import imageStorage from '../../services/ImageStorageService.js';

/**
 * Word Typing Exercise
 * See an image/emoji and type the word
 */
class TypingWordExercise extends TypingExercise {
    constructor() {
        super({ type: 'typing' });
    }
    
    async renderPrompt() {
        const item = this.currentItem;
        let visual = '';
        
        if (item.emoji) {
            visual = `<div class="prompt-visual">${item.emoji}</div>`;
        } else if (item.localImageId) {
            const imageData = await imageStorage.getImage(item.localImageId);
            if (imageData) {
                visual = `<img src="${imageData}" alt="Type this word" class="prompt-image">`;
            } else {
                visual = `<div class="prompt-visual">🖼️</div>`;
            }
        } else if (item.imageUrl) {
            if (item.imageUrl.length <= 4 && /[\u{1F300}-\u{1FAD6}]/u.test(item.imageUrl)) {
                visual = `<div class="prompt-visual">${item.imageUrl}</div>`;
            } else {
                // Show attribution for images (required for licensing) but NOT the word
                const attribution = item.attribution 
                    ? `<div class="image-attribution" style="font-size: 10px; color: #999; margin-top: 4px; text-align: center;">${item.attribution}</div>` 
                    : '';
                visual = `<div class="image-container" style="text-align: center;">
                            <img src="${item.imageUrl}" alt="" class="prompt-image" 
                                 style="max-width: 200px; max-height: 200px;"
                                 crossorigin="anonymous"
                                 onerror="this.style.display='none'; this.parentNode.querySelector('.image-fallback').style.display='block';">
                            <div class="image-fallback prompt-visual" style="display:none;">
                                <div style="font-size: 48px;">⌨️</div>
                            </div>
                            ${attribution}
                          </div>`;
            }
        } else {
            visual = `<div class="prompt-visual">⌨️</div>`;
        }
        
        // NOTE: Do NOT show alt text for typing exercises as it would give away the answer
        
        return `
            <p class="prompt-instruction">${t('exercises.typing.instruction')}</p>
            ${visual}
        `;
    }
    
    getTargetWord() {
        return this.currentItem.answer;
    }
    
    async playPromptAudio() {
        await audioService.speak(`${t('exercises.typing.typeWord')} ${this.targetWord}`);
    }
}

export default TypingWordExercise;
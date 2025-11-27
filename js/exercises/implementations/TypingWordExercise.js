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
            // Load image from IndexedDB
            const imageData = await imageStorage.getImage(item.localImageId);
            if (imageData) {
                visual = `<img src="${imageData}" alt="Type this word" class="prompt-image">`;
            } else {
                visual = `<div class="prompt-visual">🖼️</div>`;
            }
        } else if (item.imageUrl) {
            visual = `<img src="${item.imageUrl}" alt="Type this word" class="prompt-image">`;
        }
        
        return `
            ${visual}
            <p class="prompt-instruction">${t('exercises.typing.instruction')}</p>
        `;
    }
    
    getTargetWord() {
        return this.currentItem.answer;
    }
    
    async playPromptAudio() {
        // Say instruction with the target word
        await audioService.speak(`${t('exercises.typing.typeWord')} ${this.targetWord}`);
    }
}

export default TypingWordExercise;
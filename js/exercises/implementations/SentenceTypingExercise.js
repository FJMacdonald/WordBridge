// js/exercises/implementations/SentenceTypingExercise.js

import TypingExercise from '../TypingExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import imageStorage from '../../services/ImageStorageService.js';

/**
 * Sentence Typing Exercise
 * Show a sentence with a blank, user types the missing word
 * Now includes image/emoji to provide context for the answer
 */
class SentenceTypingExercise extends TypingExercise {
    constructor() {
        super({ type: 'sentenceTyping' });
    }
    
    async renderPrompt() {
        const item = this.currentItem;
        
        // The sentence already has blanks (underscores) from WordbankService
        // Replace underscores with styled span
        const sentenceHTML = item.sentence.replace(
            /_{2,}/g,
            '<span class="prompt-blank"></span>'
        );
        
        // Build visual hint (emoji or image) to provide context
        let visualHint = '';
        if (item.emoji) {
            visualHint = `<div class="prompt-visual sentence-visual-hint">${item.emoji}</div>`;
        } else if (item.localImageId) {
            const imageData = await imageStorage.getImage(item.localImageId);
            if (imageData) {
                visualHint = `<img src="${imageData}" alt="" class="prompt-image sentence-image-hint">`;
            }
        } else if (item.imageUrl) {
            if (item.imageUrl.length <= 4 && /[\u{1F300}-\u{1FAD6}]/u.test(item.imageUrl)) {
                visualHint = `<div class="prompt-visual sentence-visual-hint">${item.imageUrl}</div>`;
            } else {
                visualHint = `<img src="${item.imageUrl}" alt="" class="prompt-image sentence-image-hint" 
                              onerror="this.style.display='none'">`;
            }
        }
        
        return `
            <p class="prompt-instruction">${t('exercises.sentenceTyping.instruction')}</p>
            ${visualHint}
            <div class="prompt-sentence">${sentenceHTML}</div>
        `;
    }
    
    getTargetWord() {
        return this.currentItem.answer;
    }
    
    async playPromptAudio() {
        await audioService.speak(t('exercises.sentenceTyping.instruction'));
        await this.delay(300);
        
        // Speak the sentence with "blank" where the missing word is
        const sentence = this.currentItem.sentence.replace(
            /_{2,}/g,
            'blank'
        );
        await audioService.speak(sentence, { rate: 0.9 });
    }
}

export default SentenceTypingExercise;
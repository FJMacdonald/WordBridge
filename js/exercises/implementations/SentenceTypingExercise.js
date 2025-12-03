// js/exercises/implementations/SentenceTypingExercise.js

import TypingExercise from '../TypingExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Sentence Typing Exercise
 * Show a sentence with a blank, user types the missing word
 */
class SentenceTypingExercise extends TypingExercise {
    constructor() {
        super({ type: 'sentenceTyping' });
    }
    
    renderPrompt() {
        const item = this.currentItem;
        
        // The sentence already has blanks (underscores) from WordbankService
        // Replace underscores with styled span
        const sentenceHTML = item.sentence.replace(
            /_{2,}/g,
            '<span class="prompt-blank"></span>'
        );
        
        return `
            <p class="prompt-instruction">${t('exercises.sentenceTyping.instruction')}</p>
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
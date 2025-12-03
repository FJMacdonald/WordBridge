// js/exercises/implementations/CategoryExercise.js

import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Category Exercise
 * Select the word that belongs to a given category
 */
class CategoryExercise extends SelectionExercise {
    constructor() {
        super({ type: 'category' });
    }
    
    renderPrompt() {
        const category = this.currentItem.category;
        const isPlural = category.endsWith('s');
        const article = isPlural ? '' : (/^[aeiou]/i.test(category) ? 'an' : 'a');
        const questionText = isPlural 
            ? `Which word belongs to ${category}?`
            : `Which word is ${article} ${category}?`;
        
        return `
            <p class="prompt-instruction">${questionText}</p>
            <div class="prompt-category">${category.toUpperCase()}</div>
        `;
    }
    
    async playPromptAudio() {
        const category = this.currentItem.category;
        const article = /^[aeiou]/i.test(category) ? 'an' : 'a';
        await audioService.speak(`Which word is ${article} ${category}?`);
    }
    
    async handlePlayAll() {
        await this.playPromptAudio();
        await this.delay(300);
        
        const activeOptions = this.getActiveOptions();
        await audioService.speakSequence(activeOptions);
    }
    
    getCorrectAnswer() {
        return this.currentItem.word;
    }
}

export default CategoryExercise;
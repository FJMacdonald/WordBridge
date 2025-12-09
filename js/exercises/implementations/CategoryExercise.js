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
    
    /**
     * Get the appropriate article (a/an) for a word
     */
    getArticle(word) {
        if (!word) return 'a';
        const firstLetter = word.trim().toLowerCase()[0];
        return 'aeiou'.includes(firstLetter) ? 'an' : 'a';
    }
    
    renderPrompt() {
        const category = this.currentItem.category;
        const article = this.getArticle(category);
        const questionText = t('exercises.category.question', { 
            article: article,
            category: category 
        });
        
        return `
            <p class="prompt-instruction">${questionText}</p>
            <div class="prompt-category">${category.toUpperCase()}</div>
        `;
    }
    
    async playPromptAudio() {
        const category = this.currentItem.category;
        const article = this.getArticle(category);
        const questionText = t('exercises.category.questionAudio', {
            article: article,
            category: category
        });
        await audioService.speak(questionText);
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
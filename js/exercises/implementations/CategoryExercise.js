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
        return `
            <p class="prompt-instruction">${t('exercises.category.instruction', { category })}</p>
            <div class="prompt-category">${category.toUpperCase()}</div>
        `;
    }
    
    async playPromptAudio() {
        const category = this.currentItem.category;
        await audioService.speak(`Which word is a ${category}?`);
    }
    
    getCorrectAnswer() {
        return this.currentItem.word;
    }
}

export default CategoryExercise;
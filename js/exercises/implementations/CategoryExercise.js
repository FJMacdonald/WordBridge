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
        const article = /^[aeiou]/i.test(category) ? 'an' : 'a';
        return `
            <p class="prompt-instruction">Which word is ${article} ${category}?</p>
            <div class="prompt-category">${category.toUpperCase()}</div>
        `;
    }
    
    async playPromptAudio() {
        const category = this.currentItem.category;
        const article = /^[aeiou]/i.test(category) ? 'an' : 'a';
        await audioService.speak(`Which word is ${article} ${category}?`);
    }
    
    async handlePlayAll() {
        // Say the specific category instruction, then read options
        await this.playPromptAudio();
        await this.delay(300);
        
        const activeOptions = this.currentOptions
            .filter((_, i) => !this.state.eliminatedIndices.has(i))
            .map(opt => typeof opt === 'object' ? opt.answer || opt.value : opt);
        await audioService.speakSequence(activeOptions);
    }
    
    getCorrectAnswer() {
        return this.currentItem.word;
    }
}

export default CategoryExercise;
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
            <div class="prompt-category">${category.toUpperCase()}</div>
        `;
    }
    
    async playPromptAudio() {
        // No audio instruction for category exercise
    }
    
    async handlePlayAll() {
        // Just read the options, no instruction
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
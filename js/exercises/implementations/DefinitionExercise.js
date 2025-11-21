import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Definition Exercise
 * Match words to their definitions
 */
class DefinitionExercise extends SelectionExercise {
    constructor() {
        super({ type: 'definitions' });
    }
    
    prepareOptions() {
        const item = this.currentItem;
        // Get wrong words from other definitions
        const wrongWords = this.items
            .filter(i => i.word !== item.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(i => i.word);
        
        return this.shuffleArray([item.word, ...wrongWords]);
    }
    
    renderPrompt() {
        return `
            <p class="prompt-instruction">${t('exercises.definitions.instruction')}</p>
            <div class="prompt-definition">"${this.currentItem.definition}"</div>
        `;
    }
    
    async playPromptAudio() {
        await audioService.speak(this.currentItem.definition, { rate: 0.85 });
    }
    
    getCorrectAnswer() {
        return this.currentItem.word;
    }
}

export default DefinitionExercise;
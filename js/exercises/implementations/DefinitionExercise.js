// js/exercises/implementations/DefinitionExercise.js

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
    
    // Options are pre-built by WordbankService, so we just use the default prepareOptions
    
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
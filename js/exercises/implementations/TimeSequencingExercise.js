import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Time Sequencing Exercise
 * Questions about days/months that come before/after
 */
class TimeSequencingExercise extends SelectionExercise {
    constructor() {
        super({ type: 'timeSequencing' });
    }
    
    prepareOptions() {
        const item = this.currentItem;
        return item.options;
    }
    
    renderPrompt() {
        const item = this.currentItem;
        return `
            <p class="prompt-instruction">${item.question}</p>
            ${item.target ? `<div class="prompt-target-word">${item.target}</div>` : ''}
        `;
    }
    
    async playPromptAudio() {
        await audioService.speak(this.currentItem.question);
    }
    
    getCorrectAnswer() {
        return this.currentItem.answer;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            const sequence = this.currentItem.sequence;
            const target = this.currentItem.target;
            
            // Only show detailed explanation if sequence and target are available
            if (sequence && target) {
                let explanation = '';
                if (this.currentItem.direction === 'after') {
                    explanation = `"${this.currentItem.answer}" comes after "${target}" in the sequence.`;
                } else {
                    explanation = `"${this.currentItem.answer}" comes before "${target}" in the sequence.`;
                }
                message = `✓ ${explanation}`;
            } else {
                // Simple feedback for custom exercises without sequence data
                message = `✓ ${this.currentItem.answer}`;
            }
        }
        super.showFeedback(correct, message);
    }
}

export default TimeSequencingExercise;

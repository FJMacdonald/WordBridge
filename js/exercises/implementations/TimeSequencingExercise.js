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
        // Format the question to show the target word in uppercase without separate element
        let question = item.question;
        if (item.target) {
            // Replace the target word in the question with uppercase version
            const regex = new RegExp(`\\b${item.target}\\b`, 'gi');
            question = question.replace(regex, `<strong>${item.target.toUpperCase()}</strong>`);
        }
        return `
            <p class="prompt-instruction">${question}</p>
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
                const answer = this.currentItem.answer;
                const direction = this.currentItem.direction;
                const comesAfter = t('exercises.timeSequencing.comesAfter') || 'comes after';
                const comesBefore = t('exercises.timeSequencing.comesBefore') || 'comes before';
                const inSequence = t('exercises.timeSequencing.inSequence') || 'in the sequence';
                
                let explanation = '';
                if (direction === 'after') {
                    explanation = `"${answer}" ${comesAfter} "${target}" ${inSequence}.`;
                } else {
                    explanation = `"${answer}" ${comesBefore} "${target}" ${inSequence}.`;
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

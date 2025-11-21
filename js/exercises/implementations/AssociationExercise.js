import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Association Exercise
 * Find words that go together
 */
class AssociationExercise extends SelectionExercise {
    constructor() {
        super({ type: 'association' });
        this.correctAnswer = null;
    }
    
    prepareOptions() {
        const item = this.currentItem;
        // Pick one associated word as correct
        this.correctAnswer = item.associated[Math.floor(Math.random() * item.associated.length)];
        // Pick unrelated words as wrong answers
        const wrongAnswers = this.shuffleArray([...item.unrelated]).slice(0, 3);
        return this.shuffleArray([this.correctAnswer, ...wrongAnswers]);
    }
    
    renderPrompt() {
        return `
            <p class="prompt-instruction">${t('exercises.association.instruction')}</p>
            <div class="prompt-target-word">${this.currentItem.word}</div>
        `;
    }
    
    async playPromptAudio() {
        await audioService.speak(`${this.currentItem.word}. Which word goes with ${this.currentItem.word}?`);
    }
    
    getCorrectAnswer() {
        return this.correctAnswer;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            message = `✓ "${this.currentItem.word}" goes with "${this.correctAnswer}"`;
        }
        super.showFeedback(correct, message);
    }
}

export default AssociationExercise;
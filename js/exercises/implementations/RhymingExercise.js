// js/exercises/implementations/RhymingExercise.js

import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Rhyming Exercise
 * Find words that rhyme with the target word
 */
class RhymingExercise extends SelectionExercise {
    constructor() {
        super({ type: 'rhyming' });
        this.correctAnswer = null;
    }
    
    prepareOptions() {
        const item = this.currentItem;
        // Pick one rhyme as correct answer
        this.correctAnswer = item.rhymes[Math.floor(Math.random() * item.rhymes.length)];
        // Pick non-rhymes as wrong answers
        const wrongAnswers = this.shuffleArray([...item.nonRhymes]).slice(0, 3);
        return this.shuffleArray([this.correctAnswer, ...wrongAnswers]);
    }
    
    renderPrompt() {
        return `
            <p class="prompt-instruction">${t('exercises.rhyming.instruction')}</p>
            <div class="prompt-target-word">${this.currentItem.word}</div>
        `;
    }
    
    async playPromptAudio() {
        await audioService.speakWord(this.currentItem.word);
    }
    
    getCorrectAnswer() {
        return this.correctAnswer;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            message = `✓ "${this.currentItem.word}" ${t('exercises.rhyming.rhymesWith')} "${this.correctAnswer}"`;
        }
        super.showFeedback(correct, message);
    }
}

export default RhymingExercise;
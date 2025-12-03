// js/exercises/implementations/SynonymExercise.js

import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Synonym/Antonym Exercise
 * Match words with similar or opposite meanings
 */
class SynonymExercise extends SelectionExercise {
    constructor() {
        super({ type: 'synonyms' });
        this.correctAnswer = null;
        
        // 1. Randomly choose the question type
        const types = ['synonym', 'antonym'];
        this.questionType = types[Math.floor(Math.random() * types.length)];

        // 2. Pass the chosen type to the superclass constructor
        super({ type: this.questionType });

        // 3. Initialize other properties
        this.correctAnswer = null;
    }
    
    prepareOptions() {
        const item = this.currentItem;
        
        // Use the prepared data from WordbankService
        this.correctAnswer = item.correctAnswer;
        this.questionType = item.questionType || 'synonym';
        
        // Return the pre-shuffled options from WordbankService
        return item.options || [this.correctAnswer];
    }
    
    renderPrompt() {
        const typeText = this.questionType === 'synonym' 
            ? t('exercises.synonyms.synonymInstruction')
            : t('exercises.synonyms.antonymInstruction');
        
        const typeIcon = this.questionType === 'synonym' ? '=' : '≠';
        const typeLabel = this.questionType.toUpperCase();
        
        return `
            <div class="synonym-type-badge ${this.questionType}">${typeIcon} ${typeLabel}</div>
            <p class="prompt-instruction">${typeText}</p>
            <div class="prompt-target-word">${this.currentItem.word}</div>
        `;
    }
    
    async handlePlayAll() {
        const instruction = this.questionType === 'synonym' 
            ? t('exercises.synonyms.synonymInstruction')
            : t('exercises.synonyms.antonymInstruction');
        await audioService.speak(`${instruction} ${this.currentItem.word}?`);
        await this.delay(300);
        
        const activeOptions = this.getActiveOptions();
        await audioService.speakSequence(activeOptions);
    }

    async playPromptAudio() {
        const instruction = this.questionType === 'synonym' 
            ? t('exercises.synonyms.synonymInstruction')
            : t('exercises.synonyms.antonymInstruction');
        await audioService.speak(`${instruction} ${this.currentItem.word}?`);
    }
    
    getCorrectAnswer() {
        return this.correctAnswer;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            const relation = this.questionType === 'synonym' 
                ? t('exercises.synonyms.meansSameAs')
                : t('exercises.synonyms.isOppositeOf');
            message = `✓ "${this.correctAnswer}" ${relation} "${this.currentItem.word}"`;
        }
        super.showFeedback(correct, message);
    }
}

export default SynonymExercise;
import BaseExercise from './BaseExercise.js';
import { t } from '../core/i18n.js';
import audioService from '../services/AudioService.js';
import hintService from '../services/HintService.js';
import trackingService from '../services/TrackingService.js';
import Config from '../core/Config.js';

/**
 * Base class for multiple-choice selection exercises
 */
class SelectionExercise extends BaseExercise {
    constructor(options) {
        super(options);
        this.currentOptions = [];
    }
    
    /**
     * Prepare options for current item
     */
    prepareOptions() {
        // Default: use item's options, shuffled
        return this.shuffleArray([...this.currentItem.options]);
    }
    
    async render() {
        this.currentOptions = this.prepareOptions();
        
        this.container.innerHTML = `
            <div class="exercise exercise--selection exercise--${this.type}">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        ${this.renderPrompt()}
                    </div>
                    
                    <div class="options-grid">
                        ${this.currentOptions.map((opt, i) => this.renderOption(opt, i)).join('')}
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
    }
    
    /**
     * Render prompt area - override in subclass
     */
    renderPrompt() {
        return `<p class="prompt-instruction">${t(`exercises.${this.type}.instruction`)}</p>`;
    }
    
    /**
     * Render single option
     */
    renderOption(option, index) {
        const value = typeof option === 'object' ? option.answer || option.value : option;
        const display = typeof option === 'object' ? option.display || value : value;
        
        return `
            <button class="option-btn" data-index="${index}" data-value="${value}">
                ${display}
            </button>
        `;
    }
    
    attachExerciseListeners() {
        const options = this.container.querySelectorAll('.option-btn');
        options.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOptionClick(e));
        });
    }
    
    /**
     * Handle option selection
     */
    async handleOptionClick(e) {
        const btn = e.currentTarget;
        if (btn.disabled || btn.classList.contains('eliminated')) return;
        
        const value = btn.dataset.value;
        const correct = this.checkAnswer(value);
        
        // Record attempt
        trackingService.recordAttempt({
            word: this.getCorrectAnswer(),
            correct,
            hintsUsed: this.state.hintsUsed
        });
        
        // Visual feedback
        btn.classList.add(correct ? 'correct' : 'incorrect');
        
        if (correct) {
            this.showFeedback(true);
            await this.nextItem();
        } else {
            btn.classList.add('eliminated');
            btn.disabled = true;
            
            // Check if only one option left
            const remaining = this.container.querySelectorAll('.option-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                this.showFeedback(false, t('feedback.theAnswerWas', { answer: this.getCorrectAnswer() }));
                
                // Highlight correct answer
                remaining.forEach(b => {
                    if (b.dataset.value === this.getCorrectAnswer()) {
                        b.classList.add('correct');
                    }
                });
                
                await this.nextItem();
            }
        }
    }
    
    /**
     * Check if answer is correct
     */
    checkAnswer(value) {
        return value === this.getCorrectAnswer();
    }
    
    /**
     * Play all audio
     */
    async handlePlayAll() {
        // Get instruction
        const instruction = t(`exercises.${this.type}.instruction`);
        await audioService.speak(instruction);
        await this.delay(200);
        
        // Speak the prompt (e.g., target word for rhyming)
        await this.playPromptAudio();
        await this.delay(300);
        
        // Speak each non-eliminated option
        const activeOptions = this.getActiveOptions();
        await audioService.speakSequence(activeOptions);
    }
    
    /**
     * Play prompt-specific audio - override in subclass
     */
    async playPromptAudio() {
        // Default: nothing extra
    }
    
    /**
     * Get non-eliminated options
     */
    getActiveOptions() {
        return this.currentOptions.filter((_, i) => !this.state.eliminatedIndices.has(i));
    }
    
    /**
     * Apply hint
     */
    async applyHint(hintType) {
        const context = {
            options: this.currentOptions,
            correctAnswer: this.getCorrectAnswer(),
            eliminatedIndices: this.state.eliminatedIndices,
            container: this.container
        };
        
        switch (hintType) {
            case 'eliminate':
                hintService.applyEliminate(context);
                break;
            case 'audio':
                await hintService.applyAudio(context);
                break;
            case 'firstLetter':
                hintService.applyFirstLetter(context);
                break;
        }
    }
}

export default SelectionExercise;
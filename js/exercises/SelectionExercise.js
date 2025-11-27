// exercises/SelectionExercise.js

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
        return this.shuffleArray([...this.currentItem.options]);
    }
    
    async render() {
        this.currentOptions = this.prepareOptions();
        
        const promptContent = await this.renderPrompt();
        
        // Handle async renderOption methods
        const optionPromises = this.currentOptions.map((opt, i) => this.renderOption(opt, i));
        const optionContents = await Promise.all(optionPromises);
        
        this.container.innerHTML = `
            <div class="exercise exercise--selection exercise--${this.type}">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        ${promptContent}
                    </div>
                    
                    <div class="options-grid">
                        ${optionContents.join('')}
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
    }
    
    /**
     * Render prompt area - override in subclass
     */
    async renderPrompt() {
        return `<p class="prompt-instruction">${t(`exercises.${this.type}.instruction`)}</p>`;
    }
    
    /**
     * Render single option
     */
    async renderOption(option, index) {
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
        
        trackingService.recordAttempt({
            word: this.getCorrectAnswer(),
            correct,
            hintsUsed: this.state.hintsUsed
        });
        
        btn.classList.add(correct ? 'correct' : 'incorrect');
        
        if (correct) {
            this.showFeedback(true);
            await this.nextItem();
        } else {
            btn.classList.add('eliminated');
            btn.disabled = true;
            this.state.eliminatedIndices.add(parseInt(btn.dataset.index));
            
            // Check if only one option left
            const remaining = this.container.querySelectorAll('.option-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                this.showFeedback(false, t('feedback.theAnswerWas', { answer: this.getCorrectAnswer() }));
                
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
        const instruction = t(`exercises.${this.type}.instruction`);
        await audioService.speak(instruction);
        await this.delay(200);
        
        await this.playPromptAudio();
        await this.delay(300);
        
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
        return this.currentOptions
            .filter((_, i) => !this.state.eliminatedIndices.has(i))
            .map(opt => typeof opt === 'object' ? opt.answer || opt.value : opt);
    }
    
    /**
     * Apply hint based on type
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
                
            case 'firstLetter':
                hintService.applyFirstLetter(context);
                break;
                
            case 'sayAnswer':
                await hintService.applySayAnswer(context);
                break;
        }
    }
    
    /**
     * Override to check hints with context
     */
    updateHintButton() {
        const btn = this.container.querySelector('#hint-btn');
        if (!btn) return;
        
        const hasMore = hintService.hasMoreHints(this.type, this.state.hintsUsed);
        btn.disabled = !hasMore;
        btn.textContent = hasMore 
            ? `💡 ${t('common.hint')}` 
            : t('hints.noMoreHints');
    }
}

export default SelectionExercise;
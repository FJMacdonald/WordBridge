import BaseExercise from './BaseExercise.js';
import { t } from '../core/i18n.js';
import audioService from '../services/AudioService.js';
import hintService from '../services/HintService.js';
import trackingService from '../services/TrackingService.js';
import Config from '../core/Config.js';

/**
 * Base class for typing/spelling exercises
 */
class TypingExercise extends BaseExercise {
    constructor(options) {
        super(options);
        this.targetWord = '';
        this.currentLetterIndex = 0;
        this.boundKeyHandler = null;
    }
    
    async loadItem(index) {
        this.currentLetterIndex = 0;
        await super.loadItem(index);
    }
    
    async render() {
        this.targetWord = this.getTargetWord().toLowerCase();
        this.currentLetterIndex = this.state.revealedLetters;
        
        this.container.innerHTML = `
            <div class="exercise exercise--typing exercise--${this.type}">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        ${this.renderPrompt()}
                    </div>
                    
                    <div class="letter-boxes-container">
                        <div class="letter-boxes" id="letter-boxes">
                            ${this.renderLetterBoxes()}
                        </div>
                        
                        <input type="text" 
                               class="typing-input" 
                               id="typing-input"
                               autocomplete="off"
                               autocapitalize="none"
                               autocorrect="off">
                        
                        <input type="text"
                               class="typing-input-visible"
                               id="typing-input-visible"
                               placeholder="Tap here to type"
                               autocomplete="off"
                               autocapitalize="none"
                               autocorrect="off">
                        
                        <p class="typing-help-text">tap the box above to type</p>
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
        
        // Focus the hidden input
        setTimeout(() => {
            const input = this.container.querySelector('#typing-input');
            input?.focus();
        }, 100);
    }
    
    /**
     * Get target word to type - override in subclass
     */
    getTargetWord() {
        return this.currentItem?.answer || '';
    }
    
    /**
     * Render prompt - override in subclass
     */
    renderPrompt() {
        return `<p class="prompt-instruction">${t(`exercises.${this.type}.instruction`)}</p>`;
    }
    
    /**
     * Render letter boxes
     */
    renderLetterBoxes() {
        return this.targetWord.split('').map((letter, i) => {
            const filled = i < this.currentLetterIndex;
            const current = i === this.currentLetterIndex;
            const classes = ['letter-box'];
            
            if (filled) classes.push('filled');
            if (current) classes.push('current');
            
            return `
                <span class="${classes.join(' ')}" data-index="${i}">
                    ${filled ? letter.toUpperCase() : ''}
                </span>
            `;
        }).join('');
    }
    
    /**
     * Update letter boxes display
     */
    updateLetterBoxes() {
        const container = this.container.querySelector('#letter-boxes');
        if (container) {
            container.innerHTML = this.renderLetterBoxes();
        }
    }
    
    attachExerciseListeners() {
        // Hidden input for keyboard
        const hiddenInput = this.container.querySelector('#typing-input');
        const visibleInput = this.container.querySelector('#typing-input-visible');
        
        // Handle keyboard input
        this.boundKeyHandler = (e) => {
            const key = e.key.toLowerCase();
            if (key.length === 1 && /[a-z]/.test(key)) {
                this.handleKeyPress(key);
            }
        };
        
        document.addEventListener('keydown', this.boundKeyHandler);
        
        // Handle visible input (mobile)
        if (visibleInput) {
            visibleInput.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val.length > 0) {
                    const lastChar = val.slice(-1).toLowerCase();
                    if (/[a-z]/.test(lastChar)) {
                        this.handleKeyPress(lastChar);
                    }
                    e.target.value = '';
                }
            });
            
            // Focus on click
            visibleInput.addEventListener('click', () => visibleInput.focus());
        }
        
        // Click letter boxes to focus
        const letterBoxes = this.container.querySelector('#letter-boxes');
        if (letterBoxes) {
            letterBoxes.addEventListener('click', () => {
                visibleInput?.focus();
            });
        }
    }
    
    /**
     * Handle key press
     */
    handleKeyPress(key) {
        if (this.currentLetterIndex >= this.targetWord.length) return;
        
        const expected = this.targetWord[this.currentLetterIndex];
        const box = this.container.querySelector(`.letter-box[data-index="${this.currentLetterIndex}"]`);
        
        if (key === expected) {
            // Correct letter
            this.currentLetterIndex++;
            this.state.revealedLetters = this.currentLetterIndex;
            this.updateLetterBoxes();
            
            // Check if complete
            if (this.currentLetterIndex >= this.targetWord.length) {
                this.handleWordComplete();
            }
        } else {
            // Wrong letter - shake
            if (box) {
                box.classList.add('shake');
                setTimeout(() => box.classList.remove('shake'), 300);
            }
        }
    }
    
    /**
     * Handle word completion
     */
    async handleWordComplete() {
        const usedHints = this.state.hintsUsed > 0;
        
        trackingService.recordAttempt({
            word: this.targetWord,
            correct: true,
            hintsUsed: this.state.hintsUsed
        });
        
        this.showFeedback(true, usedHints ? t('feedback.withHints') : t('feedback.perfect'));
        await this.nextItem();
    }
    
    /**
     * Play all audio
     */
    async handlePlayAll() {
        await this.playPromptAudio();
    }
    
    /**
     * Play prompt audio - override in subclass
     */
    async playPromptAudio() {
        // Default: speak the target word
        await audioService.speakWord(this.targetWord);
    }
    
    /**
     * Apply hint
     */
    async applyHint(hintType) {
        switch (hintType) {
            case 'revealLetter':
                this.revealNextLetter();
                break;
            case 'audio':
                await audioService.spe(this.targetWord);
                break;
        }
    }
    
    /**
     * Reveal next letter as hint
     */
    revealNextLetter() {
        if (this.currentLetterIndex >= this.targetWord.length) return;
        
        const box = this.container.querySelector(`.letter-box[data-index="${this.currentLetterIndex}"]`);
        if (box) {
            box.textContent = this.targetWord[this.currentLetterIndex].toUpperCase();
            box.classList.add('filled', 'hint');
        }
        
        this.currentLetterIndex++;
        this.state.revealedLetters = this.currentLetterIndex;
        this.updateLetterBoxes();
        
        // Check if complete
        if (this.currentLetterIndex >= this.targetWord.length) {
            this.handleWordComplete();
        }
    }
    
    getCorrectAnswer() {
        return this.targetWord;
    }
    
    destroy() {
        super.destroy();
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
    }
}

export default TypingExercise;
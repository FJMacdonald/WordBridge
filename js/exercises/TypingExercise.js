// exercises/TypingExercise.js

import BaseExercise from './BaseExercise.js';
import { t, i18n } from '../core/i18n.js';
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
        this.mistypedCount = 0;
    }
    
    async loadItem(index) {
        this.currentLetterIndex = 0;
        this.mistypedCount = 0;
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
                               placeholder=""
                               autocomplete="off"
                               autocapitalize="none"
                               autocorrect="off">
                        ${this.renderGermanKeyboard()}
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
        
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
            const isHintRevealed = filled && i < this.state.revealedLetters;
            
            const classes = ['letter-box'];
            if (filled) classes.push('filled');
            if (current) classes.push('current');
            if (isHintRevealed) classes.push('hint-revealed');
            
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
        const hiddenInput = this.container.querySelector('#typing-input');
        const visibleInput = this.container.querySelector('#typing-input-visible');
        
        this.boundKeyHandler = (e) => {
            const key = e.key.toLowerCase();
            // Support German characters: a-z, ä, ö, ü, ß
            if (key.length === 1 && /[a-zäöüß]/.test(key)) {
                this.handleKeyPress(key);
            }
        };
        
        document.addEventListener('keydown', this.boundKeyHandler);
        
        if (visibleInput) {
            visibleInput.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val.length > 0) {
                    const lastChar = val.slice(-1).toLowerCase();
                    // Support German characters: a-z, ä, ö, ü, ß
                    if (/[a-zäöüß]/.test(lastChar)) {
                        this.handleKeyPress(lastChar);
                    }
                    e.target.value = '';
                }
            });
            
            visibleInput.addEventListener('click', () => visibleInput.focus());
        }
        
        const letterBoxes = this.container.querySelector('#letter-boxes');
        if (letterBoxes) {
            letterBoxes.addEventListener('click', () => {
                visibleInput?.focus();
            });
        }
        
        // Add listeners for German character buttons
        this.container.querySelectorAll('.german-char-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const char = btn.getAttribute('data-char');
                this.handleKeyPress(char);
                visibleInput?.focus();
            });
        });
    }
    
    /**
     * Handle key press
     */
    handleKeyPress(key) {
        if (this.currentLetterIndex >= this.targetWord.length) return;
        
        const expected = this.targetWord[this.currentLetterIndex];
        const box = this.container.querySelector(`.letter-box[data-index="${this.currentLetterIndex}"]`);
        
        if (key === expected) {
            this.currentLetterIndex++;
            this.updateLetterBoxes();
            
            if (this.currentLetterIndex >= this.targetWord.length) {
                this.handleWordComplete();
            }
        } else {
            this.mistypedCount++;
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
        const responseTime = Date.now() - this.state.responseStartTime;
        
        trackingService.recordAttempt({
            exerciseType: this.type,
            word: this.targetWord,
            correct: true,
            hintsUsed: this.state.hintsUsed,
            responseTime,
            attemptNumber: 1,
            wrongSelections: 0,
            mistypedLetters: this.mistypedCount
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
        await audioService.speakWord(this.targetWord);
    }
    
    /**
     * Handle hint - reveal one letter at a time
     */
    async handleHint() {
        const context = {
            targetWord: this.targetWord,
            currentLetterIndex: this.currentLetterIndex,
            revealedLetters: this.state.revealedLetters,
            wordLength: this.targetWord.length,
            container: this.container
        };
        
        if (!hintService.hasMoreHints(this.type, this.state.hintsUsed, context)) return;
        const result = hintService.applyTypingHint({
            targetWord: this.targetWord,
            currentLetterIndex: this.currentLetterIndex,
            container: this.container
        });
        
        if (result.success) {
            this.currentLetterIndex = result.newIndex;
            this.state.revealedLetters = result.newIndex;
            this.state.hintsUsed++;
            trackingService.recordHint();
            this.updateLetterBoxes();
            this.updateHintButton();
            
            // Play the letter sound if autoplay is enabled
            if (Config.get('audio.autoPlay')) {
                const revealedLetter = this.targetWord[result.newIndex - 1];
                setTimeout(() => audioService.speak(revealedLetter.toUpperCase()), 100);
            }
            
            // Check if word is complete after hint
            if (this.currentLetterIndex >= this.targetWord.length) {
                this.handleWordComplete();
            }
        }
    }
    
    updateHintButton() {
        const btn = this.container.querySelector('#hint-btn');
        if (!btn) return;
        
        const context = {
            targetWord: this.targetWord,
            revealedLetters: this.state.revealedLetters
        };
        
        const hasMore = hintService.hasMoreHints(this.type, this.state.hintsUsed, context);
        btn.disabled = !hasMore;
        btn.textContent = hasMore 
            ? `💡 ${t('common.hint')}` 
            : t('hints.noMoreHints');
    }
    
    getCorrectAnswer() {
        return this.targetWord;
    }

    /**
     * Provide context for hint availability check
     */
    getHintContext() {
        return {
            targetWord: this.targetWord,
            revealedLetters: this.state.revealedLetters
        };
    }
    
    /**
     * Render German character helper keyboard
     */
    renderGermanKeyboard() {
        const currentLocale = i18n.getCurrentLocale();
        if (currentLocale !== 'de') return '';
        
        // Only show if the target word contains German characters
        const hasGermanChars = /[äöüß]/.test(this.targetWord);
        if (!hasGermanChars) return '';
        
        return `
            <div class="german-keyboard">
                <div class="german-keyboard-label">German characters:</div>
                <div class="german-keyboard-chars">
                    <button type="button" class="german-char-btn" data-char="ä">ä</button>
                    <button type="button" class="german-char-btn" data-char="ö">ö</button>
                    <button type="button" class="german-char-btn" data-char="ü">ü</button>
                    <button type="button" class="german-char-btn" data-char="ß">ß</button>
                </div>
            </div>
        `;
    }
    
    destroy() {
        super.destroy();
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
    }
}

export default TypingExercise;
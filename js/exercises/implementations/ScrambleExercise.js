import BaseExercise from '../BaseExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import trackingService from '../../services/TrackingService.js';
import Config from '../../core/Config.js';

/**
 * Sentence Scramble Exercise
 * Drag/tap words to arrange them in correct order
 */
class ScrambleExercise extends BaseExercise {
    constructor() {
        super({ type: 'scramble' });
        this.correctOrder = [];
        this.currentOrder = [];
        this.selectedIndex = null;
    }
    
    resetState() {
        super.resetState();
        this.selectedIndex = null;
    }
    
    async render() {
        const item = this.currentItem;
        this.correctOrder = [...item.words];
        
        // Scramble the words
        this.currentOrder = this.shuffleArray([...item.words]);
        
        // Make sure it's actually scrambled
        let attempts = 0;
        while (this.arraysEqual(this.currentOrder, this.correctOrder) && attempts < 10) {
            this.currentOrder = this.shuffleArray([...item.words]);
            attempts++;
        }
        
        this.container.innerHTML = `
            <div class="exercise exercise--scramble">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        <p class="prompt-instruction">${t('exercises.scramble.instruction')}</p>
                    </div>
                    
                    <div class="scramble-container">
                        <div class="scramble-words" id="scramble-words">
                            ${this.renderWords()}
                        </div>
                        <p class="scramble-help">Tap two words to swap them</p>
                    </div>
                    
                    <div class="scramble-actions">
                        <button class="btn btn--primary btn--large" id="check-btn">
                            ✓ Check Order
                        </button>
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
        
        this.addScrambleStyles();
    }
    
    renderWords() {
        return this.currentOrder.map((word, index) => `
            <button class="scramble-word" data-index="${index}" data-word="${word}">
                ${word}
            </button>
        `).join('');
    }
    
    addScrambleStyles() {
        if (document.getElementById('scramble-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'scramble-styles';
        style.textContent = `
            .scramble-container {
                text-align: center;
                padding: var(--space-xl) 0;
            }
            .scramble-words {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: var(--space-md);
                margin-bottom: var(--space-lg);
            }
            .scramble-word {
                padding: var(--space-md) var(--space-lg);
                font-size: var(--font-size-lg);
                font-weight: 500;
                background: var(--color-surface);
                border: 3px solid var(--color-border);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
                min-width: 60px;
            }
            .scramble-word:hover {
                border-color: var(--color-primary);
            }
            .scramble-word.selected {
                border-color: var(--color-primary);
                background: var(--color-primary-light);
                transform: scale(1.05);
            }
            .scramble-word.correct-position {
                border-color: var(--color-success);
                background: var(--color-success-light);
            }
            .scramble-word.wrong-position {
                border-color: var(--color-error);
                background: var(--color-error-light);
            }
            .scramble-word.hint-highlight {
                border-color: var(--color-warning);
                box-shadow: 0 0 0 3px rgba(240, 173, 78, 0.3);
            }
            .scramble-help {
                font-size: var(--font-size-sm);
                color: var(--color-text-muted);
            }
            .scramble-actions {
                margin-top: var(--space-xl);
            }
        `;
        document.head.appendChild(style);
    }
    
    attachExerciseListeners() {
        // Word tap to select/swap
        const words = this.container.querySelectorAll('.scramble-word');
        words.forEach(word => {
            word.addEventListener('click', (e) => this.handleWordTap(e));
        });
        
        // Check button
        const checkBtn = this.container.querySelector('#check-btn');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkOrder());
        }
    }
    
    handleWordTap(e) {
        const tappedIndex = parseInt(e.target.dataset.index);
        const words = this.container.querySelectorAll('.scramble-word');
        
        if (this.selectedIndex === null) {
            // First selection
            this.selectedIndex = tappedIndex;
            words[tappedIndex].classList.add('selected');
        } else if (this.selectedIndex === tappedIndex) {
            // Deselect
            words[tappedIndex].classList.remove('selected');
            this.selectedIndex = null;
        } else {
            // Swap
            this.swapWords(this.selectedIndex, tappedIndex);
            words[this.selectedIndex].classList.remove('selected');
            this.selectedIndex = null;
        }
    }
    
    swapWords(index1, index2) {
        // Swap in array
        [this.currentOrder[index1], this.currentOrder[index2]] = 
        [this.currentOrder[index2], this.currentOrder[index1]];
        
        // Re-render words
        const container = this.container.querySelector('#scramble-words');
        container.innerHTML = this.renderWords();
        
        // Re-attach listeners
        const words = container.querySelectorAll('.scramble-word');
        words.forEach(word => {
            word.addEventListener('click', (e) => this.handleWordTap(e));
        });
    }
    
    async checkOrder() {
        const isCorrect = this.arraysEqual(this.currentOrder, this.correctOrder);
        const words = this.container.querySelectorAll('.scramble-word');
        
        // Show which positions are correct/incorrect
        words.forEach((word, index) => {
            if (this.currentOrder[index] === this.correctOrder[index]) {
                word.classList.add('correct-position');
            } else {
                word.classList.add('wrong-position');
            }
        });
        
        if (isCorrect) {
            trackingService.recordAttempt({
                word: this.currentItem.id,
                correct: true,
                hintsUsed: this.state.hintsUsed
            });
            
            this.showFeedback(true);
            await this.nextItem();
        } else {
            // Remove highlights after delay
            await this.delay(1500);
            words.forEach(word => {
                word.classList.remove('correct-position', 'wrong-position');
            });
            
            this.showFeedback(false, 'Not quite - try again or use a hint');
        }
    }
    
    async handlePlayAll() {
        // Speak the correct sentence
        const sentence = this.correctOrder.join(' ');
        await audioService.speak(sentence);
    }
    
    async applyHint(hintType) {
        // For scramble, hints show the next correct word
        const words = this.container.querySelectorAll('.scramble-word');
        
        // Find first incorrect position
        for (let i = 0; i < this.correctOrder.length; i++) {
            if (this.currentOrder[i] !== this.correctOrder[i]) {
                // Highlight the word that should go here
                const correctWord = this.correctOrder[i];
                words.forEach(w => {
                    if (w.dataset.word === correctWord) {
                        w.classList.add('hint-highlight');
                    }
                });
                
                this.showFeedback(false, `Word ${i + 1} should be "${correctWord}"`);
                
                // Remove highlight after delay
                setTimeout(() => {
                    words.forEach(w => w.classList.remove('hint-highlight'));
                }, 2000);
                
                break;
            }
        }
    }
    
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
    
    getCorrectAnswer() {
        return this.currentItem.id;
    }
}

export default ScrambleExercise;
import BaseExercise from './BaseExercise.js';
import audioService from '../services/AudioService.js';
import trackingService from '../services/TrackingService.js';
import { t } from '../core/i18n.js';

/**
 * Base class for exercises that involve ordering/sequencing items
 * Used by ScrambleExercise and TimeOrderingExercise
 */
class SequenceOrderingExercise extends BaseExercise {
    constructor(config) {
        super(config);
        this.correctOrder = [];
        this.currentOrder = [];
        this.selectedIndex = null;
    }
    
    resetState() {
        super.resetState();
        this.selectedIndex = null;
    }
    
    /**
     * Shuffle and ensure it's different from correct order
     */
    scrambleSequence(sequence) {
        let scrambled = this.shuffleArray([...sequence]);
        let attempts = 0;
        
        // Make sure it's actually scrambled (different from original)
        while (this.arraysEqual(scrambled, sequence) && attempts < 10) {
            scrambled = this.shuffleArray([...sequence]);
            attempts++;
        }
        
        return scrambled;
    }
    
    /**
     * Handle item/word tap to select and swap
     */
    handleItemTap(tappedIndex, itemClass) {
        const items = this.container.querySelectorAll(itemClass);
        
        if (this.selectedIndex === null) {
            // First selection
            this.selectedIndex = tappedIndex;
            items[tappedIndex].classList.add('selected');
        } else if (this.selectedIndex === tappedIndex) {
            // Deselect
            items[tappedIndex].classList.remove('selected');
            this.selectedIndex = null;
        } else {
            // Swap
            this.swapItems(this.selectedIndex, tappedIndex);
            items[this.selectedIndex].classList.remove('selected');
            this.selectedIndex = null;
        }
    }
    
    /**
     * Swap two items in the current order
     * To be implemented by subclasses with specific rendering
     */
    swapItems(index1, index2) {
        // Swap in array
        [this.currentOrder[index1], this.currentOrder[index2]] = 
        [this.currentOrder[index2], this.currentOrder[index1]];
        
        // Subclass should re-render and check if correct
    }
    
    /**
     * Check if the current order matches the correct order
     */
    async checkOrder() {
        const isCorrect = this.arraysEqual(this.currentOrder, this.correctOrder);
                
        if (isCorrect) {
            trackingService.recordAttempt({
                word: this.getItemIdentifier(),
                correct: true,
                hintsUsed: this.state.hintsUsed
            });
            
            this.showFeedback(true);
            await this.nextItem();
        } else {
            this.showFeedback(false, 'Not quite - try again or use a hint');
        }
        
        return isCorrect;
    }
    
    /**
     * Apply hint - shows next correct position
     */
    async applyHint(hintType) {
        const hintArea = this.container.querySelector('#hint-area');
        
        // Find first incorrect position
        for (let i = 0; i < this.correctOrder.length; i++) {
            if (this.currentOrder[i] !== this.correctOrder[i]) {
                const correctItem = this.correctOrder[i];
                
                // Get position name for hint
                const orderWords = [
                    t('exercises.scramble.theFirstWord'),
                    t('exercises.scramble.theSecondWord'),
                    t('exercises.scramble.theThirdWord'),
                    t('exercises.scramble.theFourthWord'),
                    t('exercises.scramble.theFifthWord')
                ];
                const position = i < orderWords.length ? orderWords[i] : `Item ${i + 1}`;
                const hintText = `${position} ${t('exercises.scramble.shouldBe')} "${correctItem}"`;
                
                // Check if this hint already exists
                const existingHint = hintArea ? Array.from(hintArea.children).find(child => 
                    child.textContent === hintText
                ) : null;
                
                if (existingHint) {
                    // Animate existing hint instead of creating duplicate
                    existingHint.classList.add('hint-pulse');
                    setTimeout(() => existingHint.classList.remove('hint-pulse'), 1000);
                    setTimeout(() => audioService.speak(`${position} ${t('exercises.scramble.shouldBe')} ${correctItem}`), 100);
                } else if (hintArea) {
                    // Create new hint
                    const hintItem = document.createElement('div');
                    hintItem.className = 'hint-item hint-phrase';
                    hintItem.textContent = hintText;
                    hintArea.appendChild(hintItem);
                    
                    // Play audio for the hint
                    setTimeout(() => audioService.speak(`${position} ${t('exercises.scramble.shouldBe')} ${correctItem}`), 100);
                }
                
                // Highlight the correct item (to be implemented by subclass)
                this.highlightCorrectItem(correctItem);
                
                break;
            }
        }
    }
    
    /**
     * Highlight the correct item - to be overridden by subclass
     */
    highlightCorrectItem(correctItem) {
        // Subclass implements this
    }
    
    /**
     * Compare two arrays for equality
     */
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
    
    getCorrectAnswer() {
        return this.correctOrder.join(' ');
    }
    
    getItemIdentifier() {
        // Generate identifier from correct order for tracking
        return `${this.type}_${this.correctOrder.slice(0, 2).join('_')}`;
    }
}

export default SequenceOrderingExercise;

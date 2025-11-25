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
                        <p class="scramble-help" id="scramble-help">${t('exercises.scramble.tapToSwap')}</p>
                    </div>
                    

                </div>
                
                ${this.renderFooter()}
            </div>
        `;
        
    }
    
    renderWords() {
        return this.currentOrder.map((word, index) => `
            <button class="scramble-word" data-index="${index}" data-word="${word}">
                ${word}
            </button>
        `).join('');
    }
    
    
    attachExerciseListeners() {
        // Word tap to select/swap
        const words = this.container.querySelectorAll('.scramble-word');
        words.forEach(word => {
            word.addEventListener('click', (e) => this.handleWordTap(e));
        });
        

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
        
        // Auto-check if correct order achieved
        if (this.arraysEqual(this.currentOrder, this.correctOrder)) {
            setTimeout(() => this.checkOrder(), 500); // Small delay for visual feedback
        }
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
        // First speak both instructions
        await audioService.speak(t('exercises.scramble.instruction'));
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.speak(t('exercises.scramble.tapToSwap'));
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Then speak the scrambled words in their current order
        const scrambledWords = this.currentOrder;
        await audioService.speakSequence(scrambledWords);
    }
    
    async playPromptAudio() {
        // Say both instructions
        await audioService.speak(t('exercises.scramble.instruction'));
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.speak(t('exercises.scramble.tapToSwap'));
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.speakSequence(this.currentOrder);
    }
    
    async applyHint(hintType) {
        // For scramble, hints show the next correct word
        const words = this.container.querySelectorAll('.scramble-word');
        const hintArea = this.container.querySelector('#hint-area');
        
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
                
                // Show hint in hint area
                if (hintArea) {
                    const hintItem = document.createElement('div');
                    hintItem.className = 'hint-item hint-phrase';
                    const wordPositions = [
                        t('exercises.scramble.theFirstWord'),
                        t('exercises.scramble.theSecondWord'),
                        t('exercises.scramble.theThirdWord'),
                        t('exercises.scramble.theFourthWord'),
                        t('exercises.scramble.theFifthWord')
                    ];
                    const wordPosition = i < wordPositions.length ? wordPositions[i] : `Word ${i + 1}`;
                    hintItem.textContent = `${wordPosition} ${t('exercises.scramble.shouldBe')} "${correctWord}"`;
                    hintArea.appendChild(hintItem);
                    
                    // Play audio for the hint
                    setTimeout(() => audioService.speak(`${wordPosition} ${t('exercises.scramble.shouldBe')} ${correctWord}`), 100);
                }
                
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
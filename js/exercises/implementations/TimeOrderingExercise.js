import BaseExercise from '../BaseExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import trackingService from '../../services/TrackingService.js';

/**
 * Time Ordering Exercise
 * Like sentence scramble but for time-based activities and concepts
 */
class TimeOrderingExercise extends BaseExercise {
    constructor() {
        super({ type: 'timeOrdering' });
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
        this.correctOrder = [...item.correctOrder];
        
        // Scramble the items
        this.currentOrder = this.shuffleArray([...item.items]);
        
        // Make sure it's actually scrambled
        let attempts = 0;
        while (this.arraysEqual(this.currentOrder, this.correctOrder) && attempts < 10) {
            this.currentOrder = this.shuffleArray([...item.items]);
            attempts++;
        }
        
        this.container.innerHTML = `
            <div class="exercise exercise--time-ordering">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        <p class="prompt-instruction">${item.description}</p>
                    </div>
                    
                    <div class="time-ordering-container">
                        <div class="time-ordering-items" id="time-ordering-items">
                            ${this.renderItems()}
                        </div>
                        <p class="time-ordering-help">${t('exercises.timeOrdering.tapToSwap')}</p>
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
    }
    
    renderItems() {
        return this.currentOrder.map((item, index) => `
            <button class="time-ordering-item" data-index="${index}" data-item="${item}">
                <span class="item-text">${item}</span>
            </button>
        `).join('');
    }
    
    attachExerciseListeners() {
        // Item tap to select/swap
        const items = this.container.querySelectorAll('.time-ordering-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => this.handleItemTap(e));
        });
    }
    
    handleItemTap(e) {
        const tappedIndex = parseInt(e.currentTarget.dataset.index);
        const items = this.container.querySelectorAll('.time-ordering-item');
        
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
    
    swapItems(index1, index2) {
        // Swap in array
        [this.currentOrder[index1], this.currentOrder[index2]] = 
        [this.currentOrder[index2], this.currentOrder[index1]];
        
        // Re-render items
        const container = this.container.querySelector('#time-ordering-items');
        container.innerHTML = this.renderItems();
        
        // Re-attach listeners
        const items = container.querySelectorAll('.time-ordering-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => this.handleItemTap(e));
        });
        
        // Auto-check if correct order achieved
        if (this.arraysEqual(this.currentOrder, this.correctOrder)) {
            setTimeout(() => this.checkOrder(), 500); // Small delay for visual feedback
        }
    }
    
    async checkOrder() {
        const isCorrect = this.arraysEqual(this.currentOrder, this.correctOrder);
        const items = this.container.querySelectorAll('.time-ordering-item');
        
        // Show which positions are correct/incorrect
        items.forEach((item, index) => {
            if (this.currentOrder[index] === this.correctOrder[index]) {
                item.classList.add('correct-position');
            } else {
                item.classList.add('wrong-position');
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
            items.forEach(item => {
                item.classList.remove('correct-position', 'wrong-position');
            });
            
            this.showFeedback(false, 'Not quite - try again or use a hint');
        }
    }
    
    async handlePlayAll() {
        // First speak the instruction
        await audioService.speak(this.currentItem.description);
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.speak(t('exercises.timeOrdering.tapToSwap'));
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Then speak the scrambled items in their current order
        const scrambledItems = this.currentOrder;
        await audioService.speakSequence(scrambledItems);
    }
    
    async playPromptAudio() {
        // Say instruction
        await audioService.speak(this.currentItem.description);
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.speak(t('exercises.timeOrdering.tapToSwap'));
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.speakSequence(this.currentOrder);
    }
    
    async applyHint(hintType) {
        // For time ordering, hints show the next correct item
        const items = this.container.querySelectorAll('.time-ordering-item');
        const hintArea = this.container.querySelector('#hint-area');
        
        // Find first incorrect position
        for (let i = 0; i < this.correctOrder.length; i++) {
            if (this.currentOrder[i] !== this.correctOrder[i]) {
                // Highlight the item that should go here
                const correctItem = this.correctOrder[i];
                items.forEach(item => {
                    if (item.dataset.item === correctItem) {
                        item.classList.add('hint-highlight');
                    }
                });
                
                // Show hint in hint area (or animate if already exists)
                if (hintArea) {
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
                    const existingHint = Array.from(hintArea.children).find(child => 
                        child.textContent === hintText
                    );
                    
                    if (existingHint) {
                        // Animate existing hint instead of creating duplicate
                        existingHint.classList.add('hint-pulse');
                        setTimeout(() => existingHint.classList.remove('hint-pulse'), 1000);
                        // Still play audio
                        setTimeout(() => audioService.speak(`${position} ${t('exercises.scramble.shouldBe')} ${correctItem}`), 100);
                    } else {
                        // Create new hint
                        const hintItem = document.createElement('div');
                        hintItem.className = 'hint-item hint-phrase';
                        hintItem.textContent = hintText;
                        hintArea.appendChild(hintItem);
                        
                        // Play audio for the hint
                        setTimeout(() => audioService.speak(`${position} ${t('exercises.scramble.shouldBe')} ${correctItem}`), 100);
                    }
                }
                
                // Remove highlight after delay
                setTimeout(() => {
                    items.forEach(item => item.classList.remove('hint-highlight'));
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

export default TimeOrderingExercise;

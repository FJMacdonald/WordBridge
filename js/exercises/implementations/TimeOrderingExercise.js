import SequenceOrderingExercise from '../SequenceOrderingExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import trackingService from '../../services/TrackingService.js';

/**
 * Time Ordering Exercise
 * Like sentence scramble but for time-based activities and concepts
 */
class TimeOrderingExercise extends SequenceOrderingExercise {
    constructor() {
        super({ type: 'timeOrdering' });
    }
    
    async render() {
        const item = this.currentItem;
        this.correctOrder = [...item.correctOrder];
        this.currentOrder = this.scrambleSequence(item.items);
        
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
        const wasSelected = this.selectedIndex;
        super.handleItemTap(tappedIndex, '.time-ordering-item');
        
        // Re-render if we swapped (selectedIndex went back to null after being set)
        if (wasSelected !== null && wasSelected !== tappedIndex && this.selectedIndex === null) {
            this.reRenderItems();
        }
    }
    
    swapItems(index1, index2) {
        super.swapItems(index1, index2);
        this.reRenderItems();
    }
    
    reRenderItems() {
        const container = this.container.querySelector('#time-ordering-items');
        container.innerHTML = this.renderItems();
        
        // Re-attach listeners
        const items = container.querySelectorAll('.time-ordering-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => this.handleItemTap(e));
        });
        
        // Auto-check if correct order achieved
        if (this.arraysEqual(this.currentOrder, this.correctOrder)) {
            setTimeout(() => this.checkOrder(), 500);
        }
    }
    
    async checkOrder() {
        const items = this.container.querySelectorAll('.time-ordering-item');
        
        // Show which positions are correct/incorrect
        items.forEach((item, index) => {
            if (this.currentOrder[index] === this.correctOrder[index]) {
                item.classList.add('correct-position');
            } else {
                item.classList.add('wrong-position');
            }
        });
        
        const isCorrect = await super.checkOrder();
        
        if (!isCorrect) {
            // Remove highlights after delay
            await this.delay(1500);
            items.forEach(item => {
                item.classList.remove('correct-position', 'wrong-position');
            });
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
    
    highlightCorrectItem(correctItem) {
        const items = this.container.querySelectorAll('.time-ordering-item');
        items.forEach(item => {
            if (item.dataset.item === correctItem) {
                item.classList.add('hint-highlight');
            }
        });
        
        // Remove highlight after delay
        setTimeout(() => {
            items.forEach(item => item.classList.remove('hint-highlight'));
        }, 2000);
    }
}

export default TimeOrderingExercise;

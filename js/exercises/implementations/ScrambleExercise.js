// js/exercises/implementations/ScrambleExercise.js

import SequenceOrderingExercise from '../SequenceOrderingExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Sentence Scramble Exercise
 * Tap words to arrange them in correct order
 */
class ScrambleExercise extends SequenceOrderingExercise {
    constructor() {
        super({ type: 'scramble' });
    }
    
    async render() {
        const item = this.currentItem;
        this.correctOrder = [...item.words];
        this.currentOrder = this.scrambleSequence(item.words);
        
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
        const words = this.container.querySelectorAll('.scramble-word');
        words.forEach(word => {
            word.addEventListener('click', (e) => this.handleWordTap(e));
        });
    }
    
    handleWordTap(e) {
        const tappedIndex = parseInt(e.target.dataset.index);
        this.handleItemTap(tappedIndex, '.scramble-word');
        
        if (this.selectedIndex === null) {
            this.reRenderWords();
        }
    }
    
    swapItems(index1, index2) {
        super.swapItems(index1, index2);
        this.reRenderWords();
    }
    
    reRenderWords() {
        const container = this.container.querySelector('#scramble-words');
        container.innerHTML = this.renderWords();
        
        const words = container.querySelectorAll('.scramble-word');
        words.forEach(word => {
            word.addEventListener('click', (e) => this.handleWordTap(e));
        });
        
        // Auto-check if correct order achieved
        if (this.arraysEqual(this.currentOrder, this.correctOrder)) {
            setTimeout(() => this.checkOrder(), 500);
        }
    }
    
    async checkOrder() {
        const words = this.container.querySelectorAll('.scramble-word');
        
        words.forEach((word, index) => {
            if (this.currentOrder[index] === this.correctOrder[index]) {
                word.classList.add('correct-position');
            } else {
                word.classList.add('wrong-position');
            }
        });
        
        const isCorrect = await super.checkOrder();
        
        if (!isCorrect) {
            await this.delay(1500);
            words.forEach(word => {
                word.classList.remove('correct-position', 'wrong-position');
            });
        }
    }
    
    async handlePlayAll() {
        await audioService.speak(t('exercises.scramble.instruction'));
        await this.delay(300);
        await audioService.speak(t('exercises.scramble.tapToSwap'));
        await this.delay(300);
        await audioService.speakSequence(this.currentOrder);
    }
    
    async playPromptAudio() {
        await audioService.speak(t('exercises.scramble.instruction'));
        await this.delay(300);
        await audioService.speakSequence(this.currentOrder);
    }
    
    highlightCorrectItem(correctWord) {
        const words = this.container.querySelectorAll('.scramble-word');
        words.forEach(w => {
            if (w.dataset.word === correctWord) {
                w.classList.add('hint-highlight');
            }
        });
        
        setTimeout(() => {
            words.forEach(w => w.classList.remove('hint-highlight'));
        }, 2000);
    }
}

export default ScrambleExercise;
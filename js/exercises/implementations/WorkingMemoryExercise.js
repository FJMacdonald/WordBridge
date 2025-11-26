import BaseExercise from '../BaseExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import trackingService from '../../services/TrackingService.js';

/**
 * Working Memory Exercise
 * Shows a sequence of 3 emojis for 3 seconds, then user selects them in order from 6 options
 */
class WorkingMemoryExercise extends BaseExercise {
    constructor() {
        super({ type: 'workingMemory' });
        this.phase = 'display'; // 'display', 'memorize', 'selection'
        this.displayTimer = null;
        this.selectedSequence = [];
        this.targetSequence = [];
        this.options = [];
        this.isSelectionPhase = false;
    }
    
    resetState() {
        super.resetState();
        this.phase = 'display';
        this.selectedSequence = [];
        this.targetSequence = [];
        this.options = [];
        this.isSelectionPhase = false;
        if (this.displayTimer) {
            clearTimeout(this.displayTimer);
            this.displayTimer = null;
        }
    }
    
    async render() {
        const item = this.currentItem;
        this.targetSequence = [...item.sequence];
        // Shuffle the options randomly
        this.options = this.shuffleArray([...item.options]);
        this.selectedSequence = [];
        this.phase = 'display';
        
        this.container.innerHTML = `
            <div class="exercise exercise--working-memory">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        <p class="prompt-instruction">${t('exercises.workingMemory.instruction')}</p>
                    </div>
                    
                    <div class="working-memory-container">
                        <div class="memory-display-area" id="memory-display">
                            ${this.renderDisplayPhase()}
                        </div>
                        
                        <div class="memory-selection-area" id="memory-selection" style="display: none;">
                            ${this.renderSelectionPhase()}
                        </div>
                        
                        <div class="memory-feedback" id="memory-feedback">
                            <p class="memory-instruction">${t('exercises.workingMemory.watchSequence')}</p>
                        </div>
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
        
        // Start display sequence automatically
        setTimeout(() => this.startDisplaySequence(), 1000);
    }
    
    renderDisplayPhase() {
        return `
            <div class="sequence-display">
                <div class="sequence-items">
                    ${this.targetSequence.map(emoji => `
                        <div class="sequence-item">${emoji}</div>
                    `).join('')}
                </div>
                <div class="display-timer">
                    <div class="timer-bar" id="timer-bar"></div>
                </div>
            </div>
        `;
    }
    
    renderSelectionPhase() {
        return `
            <div class="selection-phase">
                <div class="selected-sequence" id="selected-sequence">
                    <div class="selected-items">
                        ${Array(3).fill(0).map((_, i) => `
                            <div class="selected-slot" data-position="${i}">
                                <span class="slot-number">${i + 1}</span>
                                <span class="slot-content"></span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="option-grid">
                    ${this.options.map((emoji, index) => `
                        <button class="option-btn memory-option" data-emoji="${emoji}" data-index="${index}">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
                
                <div class="memory-actions">
                    <button class="btn btn--secondary" id="clear-selection">${t('exercises.workingMemory.clear')}</button>
                </div>
            </div>
        `;
    }
    
    async startDisplaySequence() {
        const feedback = this.container.querySelector('#memory-feedback');
        feedback.innerHTML = `<p class="memory-instruction">${t('exercises.workingMemory.memorize')}</p>`;
        
        // Animate the timer bar
        const timerBar = this.container.querySelector('#timer-bar');
        if (timerBar) {
            timerBar.classList.add('timer-running');
        }
        
        // Wait 3 seconds then switch to selection phase
        this.displayTimer = setTimeout(() => {
            this.switchToSelectionPhase();
        }, 3000);
    }
    
    switchToSelectionPhase() {
        this.phase = 'selection';
        this.isSelectionPhase = true;
        
        const displayArea = this.container.querySelector('#memory-display');
        const selectionArea = this.container.querySelector('#memory-selection');
        const feedback = this.container.querySelector('#memory-feedback');
        
        displayArea.style.display = 'none';
        selectionArea.style.display = 'block';
        feedback.innerHTML = `<p class="memory-instruction">${t('exercises.workingMemory.yourSelection')}:</p>`;
        
        this.attachSelectionListeners();
    }
    
    attachSelectionListeners() {
        // Option button listeners
        const optionBtns = this.container.querySelectorAll('.memory-option');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOptionSelect(e));
        });
        
        // Clear button listener
        const clearBtn = this.container.querySelector('#clear-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSelection());
        }
        
        // Selected slot listeners for removal
        const slots = this.container.querySelectorAll('.selected-slot');
        slots.forEach(slot => {
            slot.addEventListener('click', (e) => this.handleSlotClick(e));
        });
    }
    
    handleOptionSelect(e) {
        if (!this.isSelectionPhase) return;
        
        const emoji = e.currentTarget.dataset.emoji;
        const index = parseInt(e.currentTarget.dataset.index);
        
        // Check if already selected
        if (this.selectedSequence.includes(emoji)) {
            this.showFeedback(false, t('exercises.workingMemory.alreadySelected'));
            return;
        }
        
        // Check if sequence is full
        if (this.selectedSequence.length >= 3) {
            this.showFeedback(false, t('exercises.workingMemory.sequenceFull'));
            return;
        }
        
        // Add to selection
        this.selectedSequence.push(emoji);
        this.updateSelectedDisplay();
        
        // Disable the selected option
        e.currentTarget.disabled = true;
        e.currentTarget.classList.add('selected');
        
        // Auto-check if sequence is complete
        if (this.selectedSequence.length === 3) {
            setTimeout(() => this.checkSequence(), 500); // Small delay for visual feedback
        }
    }
    
    handleSlotClick(e) {
        const position = parseInt(e.currentTarget.dataset.position);
        if (position < this.selectedSequence.length) {
            this.removeFromSequence(position);
        }
    }
    
    removeFromSequence(position) {
        const removedEmoji = this.selectedSequence[position];
        this.selectedSequence.splice(position, 1);
        
        // Re-enable the option button
        const optionBtns = this.container.querySelectorAll('.memory-option');
        optionBtns.forEach(btn => {
            if (btn.dataset.emoji === removedEmoji) {
                btn.disabled = false;
                btn.classList.remove('selected');
            }
        });
        
        this.updateSelectedDisplay();
    }
    
    updateSelectedDisplay() {
        const slots = this.container.querySelectorAll('.selected-slot');
        slots.forEach((slot, index) => {
            const content = slot.querySelector('.slot-content');
            if (index < this.selectedSequence.length) {
                content.textContent = this.selectedSequence[index];
                slot.classList.add('filled');
                slot.classList.remove('empty');
            } else {
                content.textContent = '';
                slot.classList.remove('filled');
                slot.classList.add('empty');
            }
        });
    }
    
    clearSelection() {
        this.selectedSequence = [];
        
        // Re-enable all option buttons
        const optionBtns = this.container.querySelectorAll('.memory-option');
        optionBtns.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected');
        });
        
        this.updateSelectedDisplay();
    }
    
    async checkSequence() {
        const isCorrect = this.arraysEqual(this.selectedSequence, this.targetSequence);
        
        // Visual feedback on slots - only color borders for CORRECT sequence
        const slots = this.container.querySelectorAll('.selected-slot');
        if (isCorrect) {
            slots.forEach((slot) => {
                slot.classList.add('correct');
            });
        }
        
        if (isCorrect) {
            trackingService.recordAttempt({
                word: this.currentItem.id,
                correct: true,
                hintsUsed: this.state.hintsUsed
            });
            
            this.showFeedback(true, t('exercises.workingMemory.perfectMemory'));
            await this.delay(2000);
            await this.nextItem();
        } else {
            trackingService.recordAttempt({
                word: this.currentItem.id,
                correct: false,
                hintsUsed: this.state.hintsUsed
            });
            
            // Clear selection and reset hints for retry
            this.clearSelection();
            this.state.hintsUsed = 0;
            this.updateHintButton();
            
            this.showFeedback(false, t('exercises.workingMemory.tryAgain'));
        }
    }
    
    showCorrectSequence() {
        const feedback = this.container.querySelector('#memory-feedback');
        feedback.innerHTML = `
            <p class="memory-instruction memory-incorrect">${t('exercises.workingMemory.correctSequence')}</p>
            <div class="correct-sequence-display">
                ${this.targetSequence.map(emoji => `<span class="correct-emoji">${emoji}</span>`).join('')}
            </div>
        `;
    }
    
    attachExerciseListeners() {
        // Exercise-specific listeners are attached in switchToSelectionPhase
    }
    
    async handlePlayAll() {
        await audioService.speak(t('exercises.workingMemory.instruction'));
    }
    
    async playPromptAudio() {
        await audioService.speak(t('exercises.workingMemory.instruction'));
    }
    
    async applyHint(hintType) {
        if (!this.isSelectionPhase) return;
        
        const hintNumber = this.state.hintsUsed + 1;
        console.log('WorkingMemory hint requested:', hintNumber);
        
        // Hint 1: Remove 1 wrong option
        // Hint 2: Replay sequence
        // Hint 3: Remove another wrong option  
        // Hint 4: Replay sequence again
        if (hintNumber === 1 || hintNumber === 3) {
            this.eliminateWrongOptions(1);
        } else if (hintNumber === 2 || hintNumber === 4) {
            await this.replaySequence();
        }
    }
    
    eliminateWrongOptions(numToRemove) {
        const optionBtns = this.container.querySelectorAll('.memory-option:not(:disabled):not(.eliminated)');
        const wrongOptions = Array.from(optionBtns).filter(btn => 
            !this.targetSequence.includes(btn.dataset.emoji)
        );
        
        console.log('Eliminating options:', {
            requested: numToRemove,
            wrongOptionsAvailable: wrongOptions.length,
            totalOptions: optionBtns.length
        });
        
        // Only eliminate as many as exist, up to the requested number
        const actualNumToRemove = Math.min(numToRemove, wrongOptions.length);
        const toEliminate = this.shuffleArray(wrongOptions).slice(0, actualNumToRemove);
        
        toEliminate.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('eliminated');
        });
        
        // Silent elimination - consistent with other exercises
        console.log(`Eliminated ${actualNumToRemove} option(s) silently`);
    }
    
    highlightFirstItem() {
        const firstEmoji = this.targetSequence[0];
        
        // Highlight the first correct option
        const optionBtns = this.container.querySelectorAll('.memory-option');
        optionBtns.forEach(btn => {
            if (btn.dataset.emoji === firstEmoji) {
                btn.classList.add('hint-highlight');
                setTimeout(() => btn.classList.remove('hint-highlight'), 3000);
            }
        });
        
        const hintArea = this.container.querySelector('#hint-area');
        if (hintArea) {
            const hintText = `${t('exercises.workingMemory.firstPosition')} ${t('exercises.workingMemory.shouldBe')} ${firstEmoji}`;
            const hintItem = document.createElement('div');
            hintItem.className = 'hint-item hint-phrase';
            hintItem.textContent = hintText;
            hintArea.appendChild(hintItem);
            
            setTimeout(() => audioService.speak(hintText), 100);
        }
    }
    
    async replaySequence() {
        console.log('Replaying sequence as hint (1 second display)');
        
        // Show the sequence again for 1 second only
        const displayArea = this.container.querySelector('#memory-display');
        const selectionArea = this.container.querySelector('#memory-selection');
        const feedback = this.container.querySelector('#memory-feedback');
        
        displayArea.style.display = 'block';
        selectionArea.style.display = 'none';
        if (feedback) {
            feedback.innerHTML = `<p class="memory-instruction">${t('exercises.workingMemory.memorize')}</p>`;
        }
        
        this.phase = 'display';
        this.isSelectionPhase = false;
        
        // Show for only 1 second
        await this.delay(1000);
        
        // Switch back to selection
        this.switchToSelectionPhase();
    }
    
    showSequenceHint() {
        const feedback = this.container.querySelector('#memory-feedback');
        feedback.innerHTML = `
            <p class="memory-instruction">${t('exercises.workingMemory.hintSequence')}</p>
            <div class="hint-sequence-display">
                ${this.targetSequence.map((emoji, i) => `
                    <div class="hint-emoji-item">
                        <span class="hint-position">${i + 1}</span>
                        <span class="hint-emoji">${emoji}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        setTimeout(() => {
            audioService.speak(`${t('exercises.workingMemory.sequenceIs')} ${this.targetSequence.join(' ')}`);
        }, 100);
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
    
    // Override cleanup to clear timers
    cleanup() {
        if (this.displayTimer) {
            clearTimeout(this.displayTimer);
            this.displayTimer = null;
        }
        super.cleanup && super.cleanup();
    }
}

export default WorkingMemoryExercise;

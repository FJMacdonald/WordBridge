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
        
        // Inject global style to disable ALL animations for working memory exercise
        // This prevents any CSS-based flicker/strobe effects
        this.injectAntiFlickerStyles();
        
        // Render display phase first, then transition to selection
        this.container.innerHTML = `
            <div class="exercise exercise--working-memory">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        <p class="prompt-instruction">${t('exercises.workingMemory.instruction')}</p>
                    </div>
                    
                    <div class="working-memory-container">
                        <div class="memory-phase-container" id="memory-phase-container">
                            ${this.renderDisplayPhase()}
                        </div>
                        
                        <div class="memory-feedback" id="memory-feedback">
                            <p class="memory-instruction">${t('exercises.workingMemory.watchSequence')}</p>
                        </div>
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
        
        // Start display sequence automatically after a brief delay
        setTimeout(() => this.startDisplaySequence(), 1000);
    }
    
    /**
     * Inject styles to prevent any CSS animations that could cause flicker
     */
    injectAntiFlickerStyles() {
        // Remove any existing anti-flicker styles
        const existing = document.getElementById('working-memory-anti-flicker');
        if (existing) {
            existing.remove();
        }
        
        // Create new style element
        const style = document.createElement('style');
        style.id = 'working-memory-anti-flicker';
        style.textContent = `
            .exercise--working-memory * {
                animation: none !important;
                -webkit-animation: none !important;
                animation-duration: 0s !important;
                -webkit-animation-duration: 0s !important;
                animation-delay: 0s !important;
                -webkit-animation-delay: 0s !important;
                animation-iteration-count: 1 !important;
                -webkit-animation-iteration-count: 1 !important;
            }
            .exercise--working-memory .sequence-item,
            .exercise--working-memory .timer-bar {
                transition: none !important;
                -webkit-transition: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    renderDisplayPhase() {
        // Simple static display with explicit style overrides to prevent any CSS animations
        return `
            <div class="sequence-display" id="sequence-display" style="animation: none !important; transition: none !important;">
                <div class="sequence-items" style="animation: none !important; transition: none !important;">
                    ${this.targetSequence.map(emoji => `
                        <div class="sequence-item" style="display: inline-block; font-size: 3rem; margin: 0.5rem; padding: 1rem; background: #f0f0f0; border-radius: 12px; animation: none !important; transition: none !important;">${emoji}</div>
                    `).join('')}
                </div>
                <div class="display-timer" style="margin-top: 1rem; height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; animation: none !important;">
                    <div id="timer-bar" style="width: 100%; height: 100%; background: #4CAF50; border-radius: 3px; animation: none !important; transition: none !important;"></div>
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
        
        // Animate the timer bar smoothly using JavaScript interval (more reliable than CSS)
        const timerBar = this.container.querySelector('#timer-bar');
        const duration = 3000; // 3 seconds
        const startTime = Date.now();
        
        if (timerBar) {
            const updateTimer = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 1 - (elapsed / duration));
                timerBar.style.width = `${remaining * 100}%`;
                
                if (remaining > 0 && this.phase === 'display') {
                    requestAnimationFrame(updateTimer);
                }
            };
            requestAnimationFrame(updateTimer);
        }
        
        // Wait 3 seconds then switch to selection phase
        this.displayTimer = setTimeout(() => {
            this.switchToSelectionPhase();
        }, duration);
    }
    
    switchToSelectionPhase() {
        this.phase = 'selection';
        this.isSelectionPhase = true;
        
        const phaseContainer = this.container.querySelector('#memory-phase-container');
        const feedback = this.container.querySelector('#memory-feedback');
        
        // Simply replace the content - no fancy transitions that could flicker
        if (phaseContainer) {
            phaseContainer.innerHTML = this.renderSelectionPhase();
        }
        
        // Clear the instruction text
        if (feedback) {
            feedback.innerHTML = '';
        }
        
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
            await this.delay(800);
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
        
        
        // Only eliminate as many as exist, up to the requested number
        const actualNumToRemove = Math.min(numToRemove, wrongOptions.length);
        const toEliminate = this.shuffleArray(wrongOptions).slice(0, actualNumToRemove);
        
        toEliminate.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('eliminated');
        });        
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
        // Show the sequence again for 1 second only
        const phaseContainer = this.container.querySelector('#memory-phase-container');
        const feedback = this.container.querySelector('#memory-feedback');
        
        // Store current selection state
        const savedSelection = [...this.selectedSequence];
        
        // Show the display phase again
        if (phaseContainer) {
            phaseContainer.innerHTML = this.renderDisplayPhase();
        }
        
        if (feedback) {
            feedback.innerHTML = `<p class="memory-instruction">${t('exercises.workingMemory.memorize')}</p>`;
        }
        
        this.phase = 'display';
        this.isSelectionPhase = false;
        
        // Animate timer for 1 second replay
        const timerBar = this.container.querySelector('#timer-bar');
        const duration = 1000;
        const startTime = Date.now();
        
        if (timerBar) {
            const updateTimer = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 1 - (elapsed / duration));
                timerBar.style.width = `${remaining * 100}%`;
                
                if (remaining > 0 && this.phase === 'display') {
                    requestAnimationFrame(updateTimer);
                }
            };
            requestAnimationFrame(updateTimer);
        }
        
        // Show for only 1 second
        await this.delay(duration);
        
        // Restore selection state and switch back to selection
        this.selectedSequence = savedSelection;
        this.switchToSelectionPhase();
        this.updateSelectedDisplay();
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
    
    // Override cleanup to clear timers and remove injected styles
    cleanup() {
        if (this.displayTimer) {
            clearTimeout(this.displayTimer);
            this.displayTimer = null;
        }
        
        // Remove anti-flicker styles
        const antiFlicker = document.getElementById('working-memory-anti-flicker');
        if (antiFlicker) {
            antiFlicker.remove();
        }
        
        super.cleanup && super.cleanup();
    }
}

export default WorkingMemoryExercise;

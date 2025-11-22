// exercises/speaking/SpeakingExercise.js

import BaseExercise from '../BaseExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import hintService from '../../services/HintService.js';
import trackingService from '../../services/TrackingService.js';

/**
 * Speaking Exercise
 * User says the word shown - self-assessed
 */
class SpeakingExercise extends BaseExercise {
    constructor() {
        super({ type: 'speaking' });
    }
    
    async render() {
        const item = this.currentItem;
        
        this.container.innerHTML = `
            <div class="exercise exercise--speaking">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        <p class="prompt-instruction">${t('exercises.speaking.instruction')}</p>
                        <div class="prompt-visual">${item.emoji}</div>
                    </div>
                    
                    <div class="speaking-actions">
                        <button class="btn btn--success btn--large" id="correct-btn">
                            ✓ I said it
                        </button>
                        <button class="btn btn--error btn--large" id="incorrect-btn">
                            ✗ I couldn't
                        </button>
                    </div>
                </div>
                
                ${this.renderFooter()}
            </div>
        `;
    }
    
    attachExerciseListeners() {
        const correctBtn = this.container.querySelector('#correct-btn');
        const incorrectBtn = this.container.querySelector('#incorrect-btn');
        
        if (correctBtn) {
            correctBtn.addEventListener('click', () => this.markCorrect());
        }
        if (incorrectBtn) {
            incorrectBtn.addEventListener('click', () => this.markIncorrect());
        }
    }
    
    async handlePlayAll() {
        // Don't speak the word - user needs to recall it
        // Could play a sound effect or instruction instead
    }
    
    /**
     * Apply hint based on type
     */
    async applyHint(hintType) {
        const context = {
            correctAnswer: this.currentItem.answer,
            sentences: this.currentItem.sentences || this.currentItem.phrases || [],
            container: this.container
        };
        
        switch (hintType) {
            case 'firstLetter':
                hintService.applySpeakingFirstLetter(context);
                break;
                
            case 'sentence':
                const sentenceIndex = hintService.getSentenceIndex(this.state.hintsUsed);
                hintService.applySentenceHint(context, sentenceIndex);
                break;
                
            case 'spellAndSay':
                await hintService.applySpellAndSay(context);
                break;
        }
    }
    
    async markCorrect() {
        trackingService.recordAttempt({
            word: this.currentItem.answer,
            correct: true,
            hintsUsed: this.state.hintsUsed
        });
        
        this.showFeedback(true);
        await this.nextItem();
    }
    
    async markIncorrect() {
        trackingService.recordAttempt({
            word: this.currentItem.answer,
            correct: false,
            hintsUsed: this.state.hintsUsed
        });
        
        // Show the answer with audio
        const hintArea = this.container.querySelector('#hint-area');
        const word = this.currentItem.answer;
        
        if (hintArea) {
            hintArea.innerHTML = `
                <div class="hint-item hint-answer revealed">
                    <span>The word is: <strong>${word.toUpperCase()}</strong></span>
                    <button class="btn btn--icon hint-audio-btn" aria-label="Play audio">🔊</button>
                </div>
            `;
            
            const audioBtn = hintArea.querySelector('.hint-audio-btn');
            if (audioBtn) {
                audioBtn.addEventListener('click', () => audioService.speakWord(word));
            }
        }
        
        await audioService.speakWord(word);
        
        this.showFeedback(false);
        await this.delay(2000);
        await this.loadItem(this.currentIndex + 1);
    }
    
    getCorrectAnswer() {
        return this.currentItem.answer;
    }
}

export default SpeakingExercise;
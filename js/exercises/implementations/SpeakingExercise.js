import BaseExercise from '../BaseExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import hintService from '../../services/HintService.js';
import trackingService from '../../services/TrackingService.js';
import Config from '../../core/Config.js';

/**
 * Speaking Exercise
 * User says the word shown - self-assessed
 */
class SpeakingExercise extends BaseExercise {
    constructor() {
        super({ type: 'speaking' });
        this.currentHintIndex = 0;
    }
    
    resetState() {
        super.resetState();
        this.currentHintIndex = 0;
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
                        <button class="btn btn--success" id="correct-btn">
                            ✓ ${t('exercises.speaking.iSaidIt')}
                        </button>
                        <button class="btn btn--error" id="incorrect-btn">
                            ✗ ${t('exercises.speaking.iCouldnt')}
                        </button>
                    </div>
                </div>
                
                ${this.renderFooter()}
                <div class="hint-area" id="hint-area"></div>
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
        // Say the instruction only
        await audioService.speak(t('exercises.speaking.instruction'));
    }
    
    async playPromptAudio() {
        // Say the instruction for speaking exercise
        await audioService.speak(t('exercises.speaking.instruction'));
    }
    
    getHints() {
        const word = this.currentItem.answer;
        const phrases = this.currentItem.phrases || [];
        const firstLetter = word[0].toUpperCase();
        const blanks = '_'.repeat(word.length - 1);
        
        return [
            { type: 'letters', text: `${firstLetter} ${blanks}` },
            { type: 'phrase', text: phrases[0] || 'Think about it...' },
            { type: 'phrase', text: phrases[1] || 'You can do it!' },
            { type: 'word', text: word.toUpperCase().split('').join(' - ') }
        ];
    }
    
    async applyHint(hintType) {
        // Speaking exercise has its own hint system
        const hints = this.getHints();
        
        if (this.currentHintIndex >= hints.length) return;
        
        const hint = hints[this.currentHintIndex];
        const hintArea = this.container.querySelector('#hint-area');
        
        let hintHTML = '';
        const word = this.currentItem.answer;
        
        switch (hint.type) {
            case 'letters':
                hintHTML = `<div class="hint-item hint-letters">${hint.text}</div>`;
                // Speak "starts with [letter]"
                const firstLetter = word[0].toUpperCase();
                setTimeout(() => audioService.speak(`${t('exercises.typing.startsWith')} ${firstLetter}`), 100);
                break;
            case 'phrase':
                const displayPhrase = hint.text.replace(new RegExp(word, 'gi'), '______');
                hintHTML = `<div class="hint-item hint-phrase">"${displayPhrase}"</div>`;
                // Speak the phrase with a pause where the word should be
                const phraseWithPause = hint.text.replace(new RegExp(word, 'gi'), '... ...');
                setTimeout(() => audioService.speak(phraseWithPause, { rate: 0.8 }), 100);
                break;
            case 'word':
                hintHTML = `
                    <div class="hint-item hint-answer">
                        <span>${hint.text}</span>
                        <button class="btn btn--icon" onclick="window.speakWord('${word}')">🔊</button>
                    </div>
                `;
                // Also speak it
                setTimeout(() => audioService.speakWord(word), 100);
                break;
        }
        
        hintArea.innerHTML += hintHTML;
        this.currentHintIndex++;
        
        // The base handleHint will update state.hintsUsed
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
        
        // Show the answer
        const hintArea = this.container.querySelector('#hint-area');
        const word = this.currentItem.answer;
        
        hintArea.innerHTML = `
            <div class="hint-item hint-answer revealed">
                <span>The word is: <strong>${word.toUpperCase()}</strong></span>
                <button class="btn btn--icon" onclick="window.speakWord('${word}')">🔊</button>
            </div>
        `;
        
        await audioService.speakWord(word);
        
        this.showFeedback(false);
        await this.delay(2000);
        await this.loadItem(this.currentIndex + 1);
    }
    
    getCorrectAnswer() {
        return this.currentItem.answer;
    }
}

// Global helper for onclick
window.speakWord = (word) => audioService.speakWord(word);

export default SpeakingExercise;
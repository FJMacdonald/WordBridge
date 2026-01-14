// js/exercises/implementations/SpeakingExercise.js

import BaseExercise from '../BaseExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import trackingService from '../../services/TrackingService.js';
import imageStorage from '../../services/ImageStorageService.js';

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
        
        // Determine what visual to show
        // NOTE: Do NOT show the word/alt text - user should say what they see
        let visual = '';
        if (item.emoji) {
            visual = `<div class="prompt-visual">${item.emoji}</div>`;
        } else if (item.localImageId) {
            const imageData = await imageStorage.getImage(item.localImageId);
            if (imageData) {
                visual = `<img src="${imageData}" alt="Say this word" class="prompt-image" style="max-width: 200px; max-height: 200px;">`;
            } else {
                visual = `<div class="prompt-visual">🗣️</div>`;
            }
        } else if (item.imageUrl) {
            if (item.imageUrl.length <= 4 && /[\u{1F300}-\u{1FAD6}]/u.test(item.imageUrl)) {
                visual = `<div class="prompt-visual">${item.imageUrl}</div>`;
            } else {
                // Show attribution for images (required for licensing) but NOT the word
                const attribution = item.attribution 
                    ? `<div class="image-attribution" style="font-size: 10px; color: #999; margin-top: 4px; text-align: center;">${item.attribution}</div>` 
                    : '';
                visual = `<div class="image-container" style="text-align: center;">
                            <img src="${item.imageUrl}" alt="" class="prompt-image" 
                                 style="max-width: 200px; max-height: 200px;"
                                 onerror="this.style.display='none'; this.parentNode.querySelector('.image-fallback').style.display='block';">
                            <div class="image-fallback prompt-visual" style="display:none;">🗣️</div>
                            ${attribution}
                          </div>`;
            }
        } else {
            visual = `<div class="prompt-visual">🗣️</div>`;
        }
        
        this.container.innerHTML = `
            <div class="exercise exercise--speaking">
                ${this.renderHeader()}
                
                <div class="exercise__content">
                    <div class="exercise__prompt">
                        <p class="prompt-instruction">${t('exercises.speaking.instruction')}</p>
                        ${visual}
                    </div>
                    
                    <div class="speaking-actions">
                        <button class="btn btn--success btn--large" id="correct-btn">
                            ✓ ${t('exercises.speaking.iSaidIt')}
                        </button>
                        <button class="btn btn--error btn--large" id="incorrect-btn">
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
        await audioService.speak(t('exercises.speaking.instruction'));
    }
    
    async playPromptAudio() {
        await audioService.speak(t('exercises.speaking.instruction'));
    }
    
    getHints() {
        const word = this.currentItem.answer;
        const phrases = this.currentItem.phrases || [];
        const firstLetter = word[0].toUpperCase();
        const blanks = '_'.repeat(word.length - 1);
        
        const hints = [
            { type: 'letters', text: `${firstLetter} ${blanks}` }
        ];
        
        // Add phrase hints if available
        if (phrases.length > 0) {
            hints.push({ type: 'phrase', text: phrases[0] });
        }
        if (phrases.length > 1) {
            hints.push({ type: 'phrase', text: phrases[1] });
        }
        
        // Final hint: spell out the word
        hints.push({ type: 'word', text: word.toUpperCase().split('').join(' - ') });
        
        return hints;
    }
    
    async applyHint(hintType) {
        const hints = this.getHints();
        
        if (this.currentHintIndex >= hints.length) return;
        
        const hint = hints[this.currentHintIndex];
        const hintArea = this.container.querySelector('#hint-area');
        
        let hintHTML = '';
        const word = this.currentItem.answer;
        
        switch (hint.type) {
            case 'letters':
                hintHTML = `<div class="hint-item hint-letters">${hint.text}</div>`;
                const firstLetter = word[0].toUpperCase();
                setTimeout(() => audioService.speak(`${t('exercises.typing.startsWith')} ${firstLetter}`), 100);
                break;
                
            case 'phrase':
                const displayPhrase = hint.text.replace(new RegExp(word, 'gi'), '______');
                hintHTML = `<div class="hint-item hint-phrase">"${displayPhrase}"</div>`;
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
                setTimeout(() => audioService.speakWord(word), 100);
                break;
        }
        
        hintArea.innerHTML += hintHTML;
        this.currentHintIndex++;
    }
    
    async markCorrect() {
        trackingService.recordAttempt({
            exerciseType: this.type,
            word: this.currentItem.answer,
            correct: true,
            hintsUsed: this.state.hintsUsed,
            responseTime: Date.now() - this.state.responseStartTime
        });
        
        this.showFeedback(true);
        await this.nextItem();
    }
    
    async markIncorrect() {
        trackingService.recordAttempt({
            exerciseType: this.type,
            word: this.currentItem.answer,
            correct: false,
            hintsUsed: this.state.hintsUsed,
            responseTime: Date.now() - this.state.responseStartTime
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
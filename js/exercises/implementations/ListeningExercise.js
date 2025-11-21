import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Listening Exercise
 * Hear a word and select the matching picture/emoji
 */
class ListeningExercise extends SelectionExercise {
    constructor() {
        super({ type: 'listening' });
    }
    
    prepareOptions() {
        const item = this.currentItem;
        // Get wrong options (other items with emojis)
        const wrongItems = this.items
            .filter(i => i.answer !== item.answer && i.emoji)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        // Create option objects with emoji and answer
        const options = [
            { emoji: item.emoji, answer: item.answer },
            ...wrongItems.map(i => ({ emoji: i.emoji, answer: i.answer }))
        ];
        
        return this.shuffleArray(options);
    }
    
    renderPrompt() {
        return `
            <p class="prompt-instruction">${t('exercises.listening.instruction')}</p>
            <button class="btn btn--primary btn--large" id="play-word-btn">
                🔊 ${t('audio.playWord')}
            </button>
        `;
    }
    
    renderOption(option, index) {
        return `
            <button class="option-btn option-btn--emoji" data-index="${index}" data-value="${option.answer}">
                <span class="option-emoji-large">${option.emoji}</span>
            </button>
        `;
    }
    
    attachExerciseListeners() {
        super.attachExerciseListeners();
        
        // Play word button
        const playBtn = this.container.querySelector('#play-word-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playTargetWord());
        }
    }
    
    async playTargetWord() {
        await audioService.speakWord(this.currentItem.answer);
    }
    
    async playPromptAudio() {
        // For listening, we speak the target word
        await this.playTargetWord();
    }
    
    async handlePlayAll() {
        // Only play the target word for listening exercises
        // Don't read the options (that would give away answers)
        await this.playTargetWord();
    }
    
    getCorrectAnswer() {
        return this.currentItem.answer;
    }
}

export default ListeningExercise;
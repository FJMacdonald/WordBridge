import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import imageStorage from '../../services/ImageStorageService.js';

/**
 * Listening Exercise
 * Hear a word and select the matching written word
 */
class ListeningExercise extends SelectionExercise {
    constructor() {
        super({ type: 'listening' });
    }
    
    prepareOptions() {
        const item = this.currentItem;
        
        // If item has predefined options, use them
        if (item.options && item.options.length > 0) {
            return this.shuffleArray(item.options);
        }
        
        // Get wrong options (other words)
        const wrongItems = this.items
            .filter(i => i.answer !== item.answer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        // Create option array with just the words
        const options = [
            item.answer,
            ...wrongItems.map(i => i.answer)
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
    
    async renderOption(option, index) {
        // For listening exercises, always show text options (written words)
        const word = typeof option === 'string' ? option : option.answer;
        
        return `
            <button class="option-btn option-btn--text" data-index="${index}" data-value="${word}">
                ${word}
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
        // Say instruction first, then the target word
        await audioService.speak(t('exercises.listening.instruction'));
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.speak(this.currentItem.answer);
    }
    
    async handlePlayAll() {
        // Say instruction first, then play the target word
        await audioService.speak(t('exercises.listening.instruction'));
        await new Promise(resolve => setTimeout(resolve, 300));
        await this.playTargetWord();
    }
    
    getCorrectAnswer() {
        return this.currentItem.answer;
    }
}

export default ListeningExercise;
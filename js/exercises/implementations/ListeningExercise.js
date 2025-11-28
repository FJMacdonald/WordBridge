import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';
import imageStorage from '../../services/ImageStorageService.js';

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
        // Get wrong options (other items with visuals)
        const wrongItems = this.items
            .filter(i => i.answer !== item.answer && (i.emoji || i.localImageId || i.imageUrl))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        // Create option objects with visual and answer
        const options = [
            { 
                emoji: item.emoji, 
                localImageId: item.localImageId,
                imageUrl: item.imageUrl,
                answer: item.answer 
            },
            ...wrongItems.map(i => ({ 
                emoji: i.emoji, 
                localImageId: i.localImageId,
                imageUrl: i.imageUrl,
                answer: i.answer 
            }))
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
        let visual = '';
        
        if (option.emoji) {
            visual = `<span class="option-emoji-large">${option.emoji}</span>`;
        } else if (option.localImageId) {
            const imageData = await imageStorage.getImage(option.localImageId);
            if (imageData) {
                visual = `<img src="${imageData}" alt="${option.answer}" style="max-width: 100px; max-height: 100px;">`;
            } else {
                visual = `<span class="option-emoji-large">🖼️</span>`;
            }
        } else if (option.imageUrl) {
            // For emojis in the imageUrl field, display them directly
            if (option.imageUrl.length <= 4 && /[\u{1F300}-\u{1FAD6}]/u.test(option.imageUrl)) {
                visual = `<span class="option-emoji-large">${option.imageUrl}</span>`;
            } else {
                visual = `<div class="image-container" style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">
                            <img src="${option.imageUrl}" alt="${option.answer}" 
                                 style="max-width: 100px; max-height: 100px;"
                                 crossorigin="anonymous"
                                 onerror="this.style.display='none'; this.parentNode.querySelector('.fallback').style.display='flex';">
                            <div class="fallback" style="display:none; flex-direction: column; align-items: center;">
                                <span style="font-size: 36px;">🔊</span>
                                <small style="font-size: 12px; margin-top: 5px;">${option.answer}</small>
                            </div>
                          </div>`;
            }
        } else {
            // No visual at all, show placeholder
            visual = `<span class="option-emoji-large">❓</span>`;
        }
        
        return `
            <button class="option-btn option-btn--emoji" data-index="${index}" data-value="${option.answer}">
                ${visual}
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
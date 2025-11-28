import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * First Sound Exercise
 * Match words that start with the same sound
 */
class FirstSoundExercise extends SelectionExercise {
    constructor() {
        super({ type: 'firstSound' });
        this.targetWord = null;
        this.correctAnswer = null;
        this.targetSound = null;
    }
    
    prepareOptions() {
        const item = this.currentItem;
        
        // If custom exercise with explicit options, use those
        if (item.options && item.options.length >= 4) {
            this.targetWord = item.correctWord || item.words[0];
            this.targetSound = item.sound;
            this.correctAnswer = item.correctWord || item.words[0];
            
            // Return the provided options
            return this.shuffleArray(item.options);
        }
        
        // Otherwise use original logic for built-in exercises
        const words = [...item.words];
        
        // Pick target word
        this.targetWord = words[Math.floor(Math.random() * words.length)];
        this.targetSound = item.sound;
        
        // Pick another word from same group as correct
        const sameGroupWords = words.filter(w => w !== this.targetWord);
        this.correctAnswer = sameGroupWords.length > 0 
            ? sameGroupWords[Math.floor(Math.random() * sameGroupWords.length)]
            : this.targetWord;
        
        // Get wrong answers from other sounds
        const wrongAnswers = this.getWrongAnswers(3);
        
        return this.shuffleArray([this.correctAnswer, ...wrongAnswers]);
    }
    
    getWrongAnswers(count) {
        // First check if current item has wrongWords (from CSV)
        if (this.currentItem.wrongWords && this.currentItem.wrongWords.length >= count) {
            return this.currentItem.wrongWords.slice(0, count);
        }
        
        // Otherwise get words from other items (different sounds)
        const otherItems = this.items.filter(i => i.sound !== this.currentItem.sound);
        const wrongWords = [];
        
        while (wrongWords.length < count && otherItems.length > 0) {
            const randomItem = otherItems[Math.floor(Math.random() * otherItems.length)];
            const randomWord = randomItem.words[Math.floor(Math.random() * randomItem.words.length)];
            if (!wrongWords.includes(randomWord)) {
                wrongWords.push(randomWord);
            }
        }
        
        return wrongWords;
    }
    
    renderPrompt() {
        // For custom exercises, show the sound letter instead of the word
        const displayValue = this.currentItem.isCustom ? 
            this.targetSound.toUpperCase() : 
            this.targetWord;
            
        return `
            <p class="prompt-instruction">${t('exercises.firstSound.instruction')}</p>
            <div class="prompt-target-word">${displayValue}</div>
        `;
    }
    
    async playPromptAudio() {
        // Emphasize the first sound
        await audioService.speak(`${this.targetWord}. ${this.targetWord[0].toUpperCase()}.`, { rate: 0.7 });
    }
    
    getCorrectAnswer() {
        return this.correctAnswer;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            message = `✓ ${t('exercises.firstSound.bothStartWith')} "${this.targetSound}"`;
        }
        super.showFeedback(correct, message);
    }
}

export default FirstSoundExercise;
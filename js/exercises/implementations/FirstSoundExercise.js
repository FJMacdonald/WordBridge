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
        // Pick a random group for target
        const item = this.currentItem;
        const words = [...item.words];
        
        // Pick target word
        this.targetWord = words[Math.floor(Math.random() * words.length)];
        this.targetSound = item.sound;
        
        // Pick another word from same group as correct
        const sameGroupWords = words.filter(w => w !== this.targetWord);
        this.correctAnswer = sameGroupWords[Math.floor(Math.random() * sameGroupWords.length)];
        
        // Get wrong answers from other sounds (passed in via allGroups)
        const wrongAnswers = this.getWrongAnswers(3);
        
        return this.shuffleArray([this.correctAnswer, ...wrongAnswers]);
    }
    
    getWrongAnswers(count) {
        // Get words from other items (different sounds)
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
        return `
            <p class="prompt-instruction">${t('exercises.firstSound.instruction')}</p>
            <div class="prompt-target-word">${this.targetWord}</div>
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
            message = `✓ Both start with "${this.targetSound}"`;
        }
        super.showFeedback(correct, message);
    }
}

export default FirstSoundExercise;
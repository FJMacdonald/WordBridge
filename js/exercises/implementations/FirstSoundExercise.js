// js/exercises/implementations/FirstSoundExercise.js

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
        const words = [...item.words];
        
        // Pick target word (the word shown to user)
        this.targetWord = words[Math.floor(Math.random() * words.length)];
        this.targetSound = item.sound;
        
        // Pick another word from same group as correct answer
        const sameGroupWords = words.filter(w => w !== this.targetWord);
        this.correctAnswer = sameGroupWords.length > 0 
            ? sameGroupWords[Math.floor(Math.random() * sameGroupWords.length)]
            : this.targetWord;
        
        // Get wrong answers (words that DON'T start with this sound)
        const distractors = item.distractors 
            ? this.shuffleArray([...item.distractors]).slice(0, 3)
            : [];
        
        return this.shuffleArray([this.correctAnswer, ...distractors]);
    }
    
    renderPrompt() {
        return `
            <p class="prompt-instruction">${t('exercises.firstSound.instruction')}</p>
            <div class="prompt-target-word">${this.targetWord}</div>
            <p class="prompt-sound-hint">${t('exercises.firstSound.startsWithSound')} "${this.targetSound}"</p>
        `;
    }
    
    async playPromptAudio() {
        // Emphasize the first sound
        await audioService.speak(`${this.targetWord}. ${this.targetSound.toUpperCase()}.`, { rate: 0.7 });
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
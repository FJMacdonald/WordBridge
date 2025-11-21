import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Synonym/Antonym Exercise
 * Match words with similar or opposite meanings
 */
class SynonymExercise extends SelectionExercise {
    constructor() {
        super({ type: 'synonyms' });
        this.correctAnswer = null;
        this.questionType = 'synonym'; // or 'antonym'
    }
    
    prepareOptions() {
        const item = this.currentItem;
        
        // Randomly choose synonym or antonym question
        this.questionType = Math.random() > 0.5 ? 'synonym' : 'antonym';
        
        const correctList = this.questionType === 'synonym' ? item.synonyms : item.antonyms;
        const wrongList = this.questionType === 'synonym' ? item.antonyms : item.synonyms;
        
        // Pick correct answer
        this.correctAnswer = correctList[Math.floor(Math.random() * correctList.length)];
        
        // Get wrong answers - mix from opposite category and other words
        const wrongFromOpposite = wrongList.slice(0, 2);
        const otherWords = this.getOtherWords(1);
        const wrongAnswers = [...wrongFromOpposite, ...otherWords].slice(0, 3);
        
        return this.shuffleArray([this.correctAnswer, ...wrongAnswers]);
    }
    
    getOtherWords(count) {
        const otherItems = this.items.filter(i => i.word !== this.currentItem.word);
        const words = [];
        
        for (let i = 0; i < count && otherItems.length > 0; i++) {
            const item = otherItems[Math.floor(Math.random() * otherItems.length)];
            const word = Math.random() > 0.5 ? item.synonyms[0] : item.antonyms[0];
            if (!words.includes(word)) {
                words.push(word);
            }
        }
        
        return words;
    }
    
    renderPrompt() {
        const typeText = this.questionType === 'synonym' 
            ? t('exercises.synonyms.synonymInstruction')
            : t('exercises.synonyms.antonymInstruction');
        
        const typeIcon = this.questionType === 'synonym' ? '=' : '≠';
        const typeLabel = this.questionType.toUpperCase();
        
        return `
            <div class="synonym-type-badge ${this.questionType}">${typeIcon} ${typeLabel}</div>
            <p class="prompt-instruction">${typeText}</p>
            <div class="prompt-target-word">${this.currentItem.word}</div>
        `;
    }
    
    async playPromptAudio() {
        const typeWord = this.questionType === 'synonym' ? 'same as' : 'opposite of';
        await audioService.speak(`Which word means the ${typeWord} ${this.currentItem.word}?`);
    }
    
    getCorrectAnswer() {
        return this.correctAnswer;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            const relation = this.questionType === 'synonym' ? 'means the same as' : 'is the opposite of';
            message = `✓ "${this.correctAnswer}" ${relation} "${this.currentItem.word}"`;
        }
        super.showFeedback(correct, message);
    }
}

export default SynonymExercise;
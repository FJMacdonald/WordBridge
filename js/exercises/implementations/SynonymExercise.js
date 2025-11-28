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
        
        // For custom exercises with explicit questionType, use it
        if (item.questionType) {
            this.questionType = item.questionType;
        } else if (item.isCustom) {
            // For custom exercises without explicit type, default to synonym
            this.questionType = 'synonym';
        } else {
            // For default exercises, randomly choose
            this.questionType = Math.random() > 0.5 ? 'synonym' : 'antonym';
        }
        
        const correctList = this.questionType === 'synonym' ? item.synonyms : item.antonyms;
        const wrongList = this.questionType === 'synonym' ? item.antonyms : item.synonyms;
        
        // Pick correct answer
        this.correctAnswer = correctList[Math.floor(Math.random() * correctList.length)];
        
        // Get wrong answers - need exactly 3
        let wrongAnswers = [];
        
        // Add from opposite category first
        if (wrongList && wrongList.length > 0) {
            wrongAnswers.push(...wrongList.slice(0, 3));
        }
        
        // If we need more, get from other words
        if (wrongAnswers.length < 3) {
            const otherWords = this.getOtherWords(3 - wrongAnswers.length);
            wrongAnswers.push(...otherWords);
        }
        
        // Ensure we have exactly 3 wrong answers
        wrongAnswers = wrongAnswers.slice(0, 3);
        
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
    
    async handlePlayAll() {
        // Override to use the correct instruction based on question type
        const instruction = this.questionType === 'synonym' 
            ? t('exercises.synonyms.synonymInstruction')
            : t('exercises.synonyms.antonymInstruction');
        await audioService.speak(`${instruction} ${this.currentItem.word}?`);
        await this.delay(300);
        
        // Get active options (non-eliminated)
        const activeOptions = this.currentOptions
            .filter((_, i) => !this.state.eliminatedIndices.has(i))
            .map(opt => typeof opt === 'object' ? opt.answer || opt.value : opt);
        await audioService.speakSequence(activeOptions);
    }

    async playPromptAudio() {
        // For manual prompt audio, also use the correct instruction
        const instruction = this.questionType === 'synonym' 
            ? t('exercises.synonyms.synonymInstruction')
            : t('exercises.synonyms.antonymInstruction');
        await audioService.speak(`${instruction} ${this.currentItem.word}?`);
    }
    
    getCorrectAnswer() {
        return this.correctAnswer;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            const relation = this.questionType === 'synonym' 
                ? t('exercises.synonyms.meansSameAs')
                : t('exercises.synonyms.isOppositeOf');
            message = `✓ "${this.correctAnswer}" ${relation} "${this.currentItem.word}"`;
        }
        super.showFeedback(correct, message);
    }
}

export default SynonymExercise;
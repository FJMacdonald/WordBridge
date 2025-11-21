import audioService from './AudioService.js';
import { t } from '../core/i18n.js';

/**
 * Unified hint service
 */
class HintService {
    constructor() {
        this.sequences = {
            naming: ['eliminate', 'audio', 'eliminate', 'firstLetter'],
            sentenceTyping: ['revealLetter', 'revealLetter', 'audio', 'revealLetter'],
            typing: ['revealLetter', 'audio', 'revealLetter', 'revealLetter'],
            category: ['eliminate', 'eliminate', 'audio'],
            rhyming: ['audio', 'eliminate', 'eliminate'],
            firstSound: ['audio', 'eliminate', 'eliminate'],
            association: ['eliminate', 'audio', 'eliminate'],
            synonyms: ['eliminate', 'audio', 'eliminate'],
            definitions: ['audio', 'eliminate', 'eliminate'],
            listening: ['audio', 'eliminate', 'eliminate'],
            speaking: ['firstLetter', 'audio', 'audio', 'audio'],
            scramble: ['highlight', 'audio', 'highlight', 'highlight']
        };
    }
    
    getSequence(exerciseType) {
        return this.sequences[exerciseType] || ['eliminate', 'audio'];
    }
    
    hasMoreHints(exerciseType, hintsUsed) {
        return hintsUsed < this.getSequence(exerciseType).length;
    }
    
    getNextHintType(exerciseType, hintsUsed) {
        const seq = this.getSequence(exerciseType);
        return seq[Math.min(hintsUsed, seq.length - 1)];
    }
    
    /**
     * Apply eliminate hint - removes one wrong option
     */
    applyEliminate(context) {
        const { options, correctAnswer, eliminatedIndices, container } = context;
        
        // Find wrong options not yet eliminated
        const wrongIndices = [];
        options.forEach((opt, idx) => {
            const val = typeof opt === 'object' ? opt.answer || opt.value : opt;
            if (val !== correctAnswer && !eliminatedIndices.has(idx)) {
                wrongIndices.push(idx);
            }
        });
        
        if (wrongIndices.length === 0) return false;
        
        // Pick random wrong option
        const idx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        eliminatedIndices.add(idx);
        
        // Update UI
        const buttons = container.querySelectorAll('.option-btn');
        if (buttons[idx]) {
            buttons[idx].classList.add('eliminated');
            buttons[idx].disabled = true;
        }
        
        return true;
    }
    
    /**
     * Apply audio hint - speaks the answer
     */
    async applyAudio(context) {
        const { correctAnswer } = context;
        await audioService.speakWord(correctAnswer);
        return true;
    }
    
    /**
     * Apply first letter hint
     */
    applyFirstLetter(context) {
        const { correctAnswer, container } = context;
        const firstLetter = correctAnswer[0].toUpperCase();
        
        let hintEl = container.querySelector('.hint-display');
        if (!hintEl) {
            hintEl = document.createElement('div');
            hintEl.className = 'hint-display';
            container.querySelector('.exercise__prompt').appendChild(hintEl);
        }
        hintEl.textContent = `Starts with: ${firstLetter}`;
        
        return true;
    }
    
    /**
     * Apply reveal letter hint
     */
    applyRevealLetter(context) {
        const { targetWord, revealedCount, container, onReveal } = context;
        
        if (revealedCount >= targetWord.length) return false;
        
        const letter = targetWord[revealedCount];
        
        // Update letter box
        const boxes = container.querySelectorAll('.letter-box');
        if (boxes[revealedCount]) {
            boxes[revealedCount].textContent = letter.toUpperCase();
            boxes[revealedCount].classList.add('filled', 'hint');
        }
        
        // Call callback to update state
        if (onReveal) onReveal(revealedCount + 1);
        
        return true;
    }
}

export const hintService = new HintService();
export default hintService;
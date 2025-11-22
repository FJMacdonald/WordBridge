// services/HintService.js

import audioService from './AudioService.js';

/**
 * Hint service with progressive hints
 */
class HintService {
    constructor() {
        this.strategies = {
            selection: [
                { type: 'eliminate' },
                { type: 'firstLetter' },
                { type: 'eliminate' },
                { type: 'sayAnswer' }
            ],
            typing: [
                { type: 'revealLetter' }
                // Repeats indefinitely until word is complete
            ],
            speaking: [
                { type: 'firstLetter' },
                { type: 'sentence', index: 0 },
                { type: 'sentence', index: 1 },
                { type: 'spellAndSay' }
            ]
        };
    }

    /**
     * Get strategy for exercise type
     */
    getStrategy(exerciseType) {
        const mapping = {
            'naming': 'selection',
            'listening': 'selection',
            'category': 'selection',
            'association': 'selection',
            'synonyms': 'selection',
            'definitions': 'selection',
            'rhyming': 'selection',
            'firstSound': 'selection',
            'typing': 'typing',
            'sentenceTyping': 'typing',
            'spelling': 'typing',
            'speaking': 'speaking'
        };
        
        return this.strategies[mapping[exerciseType]] || this.strategies.selection;
    }

    /**
     * Check if more hints available
     */
    hasMoreHints(exerciseType, hintsUsed, context = {}) {
        const strategy = this.getStrategy(exerciseType);
        
        // Typing can always hint if there are unrevealed letters
        if (exerciseType === 'typing' || exerciseType === 'sentenceTyping' || exerciseType === 'spelling') {
            const word = context.targetWord || '';
            const revealed = context.revealedLetters || 0;
            return revealed < word.length;
        }
        
        return hintsUsed < strategy.length;
    }

    /**
     * Apply hint for typing exercises - reveal one letter
     */
    applyTypingHint(context) {
        const {
            targetWord,
            currentLetterIndex,
            container
        } = context;
        
        if (currentLetterIndex >= targetWord.length) {
            return { success: false };
        }
        
        // Reveal the next letter
        const letterBox = container.querySelector(`.letter-box[data-index="${currentLetterIndex}"]`);
        if (letterBox) {
            letterBox.textContent = targetWord[currentLetterIndex].toUpperCase();
            letterBox.classList.add('filled', 'hint-revealed');
        }
        
        return {
            success: true,
            type: 'revealLetter',
            letter: targetWord[currentLetterIndex],
            newIndex: currentLetterIndex + 1
        };
    }
    
 

    /**
     * Get next hint type
     */
    getNextHintType(exerciseType, hintsUsed) {
        const strategy = this.getStrategy(exerciseType);
        
        // Typing always returns revealLetter
        if (exerciseType === 'typing' || exerciseType === 'sentenceTyping' || exerciseType === 'spelling') {
            return 'revealLetter';
        }
        
        if (hintsUsed >= strategy.length) {
            return null;
        }
        
        return strategy[hintsUsed].type;
    }

    /**
     * Get sentence index for speaking hints
     */
    getSentenceIndex(hintsUsed) {
        const strategy = this.strategies.speaking;
        if (hintsUsed < strategy.length && strategy[hintsUsed].index !== undefined) {
            return strategy[hintsUsed].index;
        }
        return null;
    }

    // ============ Selection Exercise Hints ============

    /**
     * Eliminate one wrong option
     */
    applyEliminate(context) {
        const { options, correctAnswer, eliminatedIndices, container } = context;
        
        // Find a wrong option that hasn't been eliminated
        for (let i = 0; i < options.length; i++) {
            if (eliminatedIndices.has(i)) continue;
            
            const optionValue = typeof options[i] === 'object' 
                ? (options[i].answer || options[i].value) 
                : options[i];
            
            if (optionValue !== correctAnswer) {
                // Mark as eliminated
                eliminatedIndices.add(i);
                
                // Update DOM
                const btn = container.querySelector(`.option-btn[data-index="${i}"]`);
                if (btn) {
                    btn.classList.add('eliminated');
                    btn.disabled = true;
                }
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * Show first letter hint
     */
    applyFirstLetter(context) {
        const { correctAnswer, container } = context;
        
        if (!correctAnswer) return;
        
        const firstLetter = correctAnswer[0].toUpperCase();
        
        // Find hint area (should be in footer now)
        const hintArea = container.querySelector('#hint-area');
        
        if (hintArea) {
            const hintItem = document.createElement('div');
            hintItem.className = 'hint-item hint-letter';
            hintItem.innerHTML = `Starts with: <strong>${firstLetter}</strong>`;
            hintArea.appendChild(hintItem);
        }
        
        // Also speak it
        audioService.speak(`Starts with ${firstLetter}`);
    }

    /**
     * Say the correct answer
     */
    async applySayAnswer(context) {
        const { correctAnswer, container } = context;
        
        if (!correctAnswer) return;
        
        // Find hint area (should be in footer now)
        const hintArea = container.querySelector('#hint-area');
        
        if (hintArea) {
            const hintItem = document.createElement('div');
            hintItem.className = 'hint-item hint-audio';
            hintItem.innerHTML = `🔊 Listen carefully...`;
            hintArea.appendChild(hintItem);
        }
        
        await audioService.speakWord(correctAnswer);
    }

    // ============ Speaking Exercise Hints ============

    /**
     * Show first letter for speaking exercise
     */
    applySpeakingFirstLetter(context) {
        const { correctAnswer, container } = context;
        
        if (!correctAnswer) return;
        
        const firstLetter = correctAnswer[0].toUpperCase();
        const blanks = '_ '.repeat(correctAnswer.length - 1).trim();
        
        const hintArea = container.querySelector('#hint-area');
        if (hintArea) {
            const hintItem = document.createElement('div');
            hintItem.className = 'hint-item hint-letters';
            hintItem.innerHTML = `<span class="letter-hint">${firstLetter} ${blanks}</span>`;
            hintArea.appendChild(hintItem);
        }
    }

    /**
     * Show sentence/idiom hint
     */
    applySentenceHint(context, sentenceIndex) {
        const { sentences, correctAnswer, container } = context;
        
        const hintArea = container.querySelector('#hint-area');
        if (!hintArea) return;
        
        const sentence = sentences && sentences[sentenceIndex];
        if (!sentence) {
            // Fallback if no sentence available
            const hintItem = document.createElement('div');
            hintItem.className = 'hint-item hint-phrase';
            hintItem.textContent = sentenceIndex === 0 
                ? 'Think about how you would use this word...' 
                : 'Try to picture what it represents...';
            hintArea.appendChild(hintItem);
            return;
        }
        
        // Replace the word with blanks in the sentence
        const displaySentence = sentence.replace(
            new RegExp(correctAnswer, 'gi'), 
            '_'.repeat(correctAnswer.length)
        );
        
        const hintItem = document.createElement('div');
        hintItem.className = 'hint-item hint-phrase';
        hintItem.innerHTML = `"${displaySentence}"`;
        hintArea.appendChild(hintItem);
    }

    /**
     * Spell out and say the word
     */
    async applySpellAndSay(context) {
        const { correctAnswer, container } = context;
        
        if (!correctAnswer) return;
        
        const hintArea = container.querySelector('#hint-area');
        if (!hintArea) return;
        
        // Clear previous hints and show spelled word
        const spelled = correctAnswer.toUpperCase().split('').join(' - ');
        
        const hintItem = document.createElement('div');
        hintItem.className = 'hint-item hint-answer revealed';
        hintItem.innerHTML = `
            <span class="spelled-word">${spelled}</span>
            <button class="btn btn--icon hint-audio-btn" aria-label="Play audio">🔊</button>
        `;
        hintArea.appendChild(hintItem);
        
        // Add click handler for audio button
        const audioBtn = hintItem.querySelector('.hint-audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => audioService.speakWord(correctAnswer));
        }
        
        // Speak the word
        await audioService.speakWord(correctAnswer);
    }
}

export const hintService = new HintService();
export default hintService;

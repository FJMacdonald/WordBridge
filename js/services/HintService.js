/**
 * Hint service with progressive hints
 */
class HintService {
    constructor() {
        this.hintStrategies = {
            selection: [
                { type: 'remove_one', description: 'Remove one wrong option' },
                { type: 'first_letter', description: 'Show first letter' },
                { type: 'remove_second', description: 'Remove another wrong option' },
                { type: 'reveal', description: 'Show the answer' }
            ],
            typing: [
                { type: 'first_letters', description: 'Show first two letters' },
                { type: 'speak', description: 'Say the word' },
                { type: 'next_letter', description: 'Show next letter' },
                { type: 'reveal', description: 'Show the answer' }
            ],
            default: [
                { type: 'hint', description: 'Get a hint' },
                { type: 'reveal', description: 'Show the answer' }
            ]
        };
    }
    
    /**
     * Check if more hints are available
     */
    hasMoreHints(exerciseType, currentHintLevel) {
        const strategy = this.getStrategyForType(exerciseType);
        return currentHintLevel < strategy.length;
    }
    
    /**
     * Get hint strategy for exercise type
     */
    getStrategyForType(exerciseType) {
        // Map exercise types to hint strategies
        const typeMapping = {
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
            'speaking': 'default',
            'scramble': 'default'
        };
        
        const strategyType = typeMapping[exerciseType] || 'default';
        return this.hintStrategies[strategyType];
    }
    
    /**
     * Get next hint based on exercise type
     */
    getNextHint(exerciseType, currentHintLevel, context = {}) {
        const strategy = this.getStrategyForType(exerciseType);
        
        if (currentHintLevel >= strategy.length) {
            return null;
        }
        
        const hintType = strategy[currentHintLevel].type;
        
        // For selection exercises (4 options)
        if (exerciseType in ['naming', 'listening', 'category', 'association', 'synonyms', 'definitions', 'rhyming', 'firstSound']) {
            return this.getSelectionHint(currentHintLevel, context.options, context.correctAnswer);
        }
        
        // For typing exercises
        if (exerciseType in ['typing', 'sentenceTyping']) {
            return this.getTypingHint(currentHintLevel, context.correctAnswer, context.currentInput);
        }
        
        // Default hint
        return {
            type: hintType,
            message: strategy[currentHintLevel].description
        };
    }
    
    /**
     * Get next hint for selection exercises (4 options)
     */
    getSelectionHint(currentHintLevel, options = [], correctAnswer = '') {
        const wrongOptions = options.filter(opt => opt !== correctAnswer);
        
        switch (currentHintLevel) {
            case 0: // Remove one wrong option
                return {
                    type: 'remove_option',
                    optionToRemove: wrongOptions[0],
                    message: 'Removed one wrong option'
                };
                
            case 1: // Show first letter
                return {
                    type: 'first_letter',
                    letter: correctAnswer[0].toUpperCase(),
                    message: `The answer starts with "${correctAnswer[0].toUpperCase()}"`
                };
                
            case 2: // Remove second wrong option
                return {
                    type: 'remove_option',
                    optionToRemove: wrongOptions[1],
                    message: 'Removed another wrong option'
                };
                
            case 3: // Reveal answer
                return {
                    type: 'reveal',
                    answer: correctAnswer,
                    message: `The answer is: ${correctAnswer}`
                };
                
            default:
                return null;
        }
    }
    
    /**
     * Get next hint for typing exercises
     */
    getTypingHint(currentHintLevel, correctAnswer = '', currentInput = '') {
        switch (currentHintLevel) {
            case 0: // Show first two letters
                const firstTwo = correctAnswer.substring(0, 2);
                return {
                    type: 'letters',
                    letters: firstTwo,
                    message: `The word starts with: ${firstTwo}`
                };
                
            case 1: // Speak the word
                return {
                    type: 'speak',
                    word: correctAnswer,
                    message: 'Listen to the word'
                };
                
            case 2: // Show next letter progressively
                let nextIndex = currentInput.length;
                if (nextIndex >= correctAnswer.length) {
                    nextIndex = 2; // If they've typed too much, show third letter
                }
                const nextLetter = correctAnswer[nextIndex];
                return {
                    type: 'next_letter',
                    letter: nextLetter,
                    position: nextIndex,
                    partial: correctAnswer.substring(0, nextIndex + 1),
                    message: `Next letter is: ${nextLetter}`
                };
                
            case 3: // Reveal answer
                return {
                    type: 'reveal',
                    answer: correctAnswer,
                    message: `The answer is: ${correctAnswer}`
                };
                
            default:
                // Keep showing more letters
                const moreIndex = Math.min(4 + (currentHintLevel - 4), correctAnswer.length - 1);
                return {
                    type: 'next_letter',
                    partial: correctAnswer.substring(0, moreIndex + 1),
                    message: `Continue with: ${correctAnswer.substring(0, moreIndex + 1)}`
                };
        }
    }
}

export const hintService = new HintService();
export default hintService;
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
            ]
        };
    }
    
    /**
     * Get next hint for selection exercises (4 options)
     */
    getSelectionHint(currentHintLevel, options, correctAnswer) {
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
                    message: `Starts with "${correctAnswer[0].toUpperCase()}"`
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
    getTypingHint(currentHintLevel, correctAnswer, currentInput = '') {
        switch (currentHintLevel) {
            case 0: // Show first two letters
                return {
                    type: 'letters',
                    letters: correctAnswer.substring(0, 2),
                    message: `Starts with: ${correctAnswer.substring(0, 2)}`
                };
                
            case 1: // Speak the word
                return {
                    type: 'speak',
                    word: correctAnswer,
                    message: 'Listen to the word'
                };
                
            case 2: // Show next letter
                const nextIndex = currentInput.length;
                if (nextIndex < correctAnswer.length) {
                    return {
                        type: 'next_letter',
                        letter: correctAnswer[nextIndex],
                        position: nextIndex,
                        message: `Next letter: ${correctAnswer[nextIndex]}`
                    };
                }
                // Fall through to reveal if at end
                
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
}

export const hintService = new HintService();
export default hintService;
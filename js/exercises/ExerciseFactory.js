import NamingExercise from './implementations/NamingExercise.js';
import ListeningExercise from './implementations/ListeningExercise.js';
import SpeakingExercise from './implementations/SpeakingExercise.js';
import TypingWordExercise from './implementations/TypingWordExercise.js';
import SentenceTypingExercise from './implementations/SentenceTypingExercise.js';
import CategoryExercise from './implementations/CategoryExercise.js';
import RhymingExercise from './implementations/RhymingExercise.js';
import FirstSoundExercise from './implementations/FirstSoundExercise.js';
import AssociationExercise from './implementations/AssociationExercise.js';
import SynonymExercise from './implementations/SynonymExercise.js';
import DefinitionExercise from './implementations/DefinitionExercise.js';
import ScrambleExercise from './implementations/ScrambleExercise.js';
import TimeSequencingExercise from './implementations/TimeSequencingExercise.js';
import ClockMatchingExercise from './implementations/ClockMatchingExercise.js';
import TimeOrderingExercise from './implementations/TimeOrderingExercise.js';
import WorkingMemoryExercise from './implementations/WorkingMemoryExercise.js';

/**
 * Factory for creating exercise instances
 */
class ExerciseFactory {
    constructor() {
        this.exercises = {
            // Meaning
            definitions: {
                class: DefinitionExercise,
                name: 'Definitions',
                icon: '📖',
                category: 'meaning'
            },
            association: {
                class: AssociationExercise,
                name: 'Association',
                icon: '🔗',
                category: 'meaning'
            },
            synonyms: {
                class: SynonymExercise,
                name: 'Synonyms',
                icon: '≈',
                category: 'meaning'
            },
            scramble: {
                class: ScrambleExercise,
                name: 'Unscramble',
                icon: '🔀',
                category: 'meaning'
            },
            
            // Phonetics
            firstSound: {
                class: FirstSoundExercise,
                name: 'First Sounds',
                icon: '🔤',
                category: 'phonetics'
            },
            rhyming: {
                class: RhymingExercise,
                name: 'Rhyming',
                icon: '🎵',
                category: 'phonetics'
            },
            speaking: {
                class: SpeakingExercise,
                name: 'Speaking',
                icon: '🎤',
                category: 'phonetics'
            },
            listening: {
                class: ListeningExercise,
                name: 'Listening',
                icon: '👂',
                category: 'phonetics'
            },
            
            // Words
            naming: {
                class: NamingExercise,
                name: 'Picture Naming',
                icon: '🖼️',
                category: 'words'
            },
            typing: {
                class: TypingWordExercise,
                name: 'Spelling',
                icon: '⌨️',
                category: 'words'
            },
            sentenceTyping: {
                class: SentenceTypingExercise,
                name: 'Fill Blank',
                icon: '📝',
                category: 'words'
            },
            category: {
                class: CategoryExercise,
                name: 'Categories',
                icon: '📁',
                category: 'words'
            },
            
            // Time
            timeSequencing: {
                class: TimeSequencingExercise,
                name: 'Time Sequencing',
                icon: '📅',
                category: 'time'
            },
            clockMatching: {
                class: ClockMatchingExercise,
                name: 'Clock Matching',
                icon: '🕐',
                category: 'time'
            },
            timeOrdering: {
                class: TimeOrderingExercise,
                name: 'Time Ordering',
                icon: '⏰',
                category: 'time'
            },
            workingMemory: {
                class: WorkingMemoryExercise,
                name: 'Working Memory',
                icon: '🧠',
                category: 'time'
            }
        };
    }
    
    /**
     * Create an exercise instance
     */
    create(type) {
        const exerciseConfig = this.exercises[type];
        if (!exerciseConfig) {
            throw new Error(`Unknown exercise type: ${type}`);
        }
        return new exerciseConfig.class();
    }
    
    /**
     * Get exercises grouped by category
     */
    getExercisesByCategory() {
        const categories = {
            meaning: [],
            phonetics: [],
            words: [],
            time: []
        };
        
        Object.entries(this.exercises).forEach(([type, config]) => {
            categories[config.category].push({
                type,
                ...config
            });
        });
        
        return categories;
    }
}

export const exerciseFactory = new ExerciseFactory();
export default exerciseFactory;
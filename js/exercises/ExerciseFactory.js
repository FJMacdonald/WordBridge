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
        // Ordered by: Words, Phonetics, Meaning, Time
        this.exercises = {
            // Words
            naming: {
                class: NamingExercise,
                name: 'Picture Naming',
                icon: '🖼️',
                category: 'words',
                order: 1
            },
            typing: {
                class: TypingWordExercise,
                name: 'Typing',
                icon: '⌨️',
                category: 'words',
                order: 2
            },
            sentenceTyping: {
                class: SentenceTypingExercise,
                name: 'Fill Blank',
                icon: '📝',
                category: 'words',
                order: 3
            },
            category: {
                class: CategoryExercise,
                name: 'Categories',
                icon: '📁',
                category: 'words',
                order: 4
            },
            
            // Phonetics
            listening: {
                class: ListeningExercise,
                name: 'Listening',
                icon: '👂',
                category: 'phonetics',
                order: 5
            },
            speaking: {
                class: SpeakingExercise,
                name: 'Speaking',
                icon: '🎤',
                category: 'phonetics',
                order: 6
            },
            firstSound: {
                class: FirstSoundExercise,
                name: 'First Sounds',
                icon: '🔤',
                category: 'phonetics',
                order: 7
            },
            rhyming: {
                class: RhymingExercise,
                name: 'Rhyming',
                icon: '🎵',
                category: 'phonetics',
                order: 8
            },
            
            // Meaning
            definitions: {
                class: DefinitionExercise,
                name: 'Definitions',
                icon: '📖',
                category: 'meaning',
                order: 9
            },
            association: {
                class: AssociationExercise,
                name: 'Association',
                icon: '🔗',
                category: 'meaning',
                order: 10
            },
            synonyms: {
                class: SynonymExercise,
                name: 'Synonyms',
                icon: '≈',
                category: 'meaning',
                order: 11
            },
            scramble: {
                class: ScrambleExercise,
                name: 'Unscramble',
                icon: '🔀',
                category: 'meaning',
                order: 12
            },
            
            // Time
            timeSequencing: {
                class: TimeSequencingExercise,
                name: 'Time Sequencing',
                icon: '📅',
                category: 'time',
                order: 13
            },
            clockMatching: {
                class: ClockMatchingExercise,
                name: 'Clock Matching',
                icon: '🕐',
                category: 'time',
                order: 14
            },
            timeOrdering: {
                class: TimeOrderingExercise,
                name: 'Time Ordering',
                icon: '⏰',
                category: 'time',
                order: 15
            },
            workingMemory: {
                class: WorkingMemoryExercise,
                name: 'Working Memory',
                icon: '🧠',
                category: 'time',
                order: 16
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
     * Get exercises grouped by category (in order: words, phonetics, meaning, time)
     */
    getExercisesByCategory() {
        const categories = {
            words: [],
            phonetics: [],
            meaning: [],
            time: []
        };
        
        Object.entries(this.exercises).forEach(([type, config]) => {
            categories[config.category].push({
                type,
                ...config
            });
        });
        
        // Sort each category by order
        Object.keys(categories).forEach(cat => {
            categories[cat].sort((a, b) => (a.order || 0) - (b.order || 0));
        });
        
        return categories;
    }
    
    /**
     * Get all exercise types in order
     */
    getAllExerciseTypes() {
        return Object.entries(this.exercises)
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([type]) => type);
    }
}

export const exerciseFactory = new ExerciseFactory();
export default exerciseFactory;
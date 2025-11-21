import NamingExercise from './implementations/NamingExercise.js';
import SentenceTypingExercise from './implementations/SentenceTypingExercise.js';
import CategoryExercise from './implementations/CategoryExercise.js';
import RhymingExercise from './implementations/RhymingExercise.js';
import FirstSoundExercise from './implementations/FirstSoundExercise.js';
import AssociationExercise from './implementations/AssociationExercise.js';
import SynonymExercise from './implementations/SynonymExercise.js';
import DefinitionExercise from './implementations/DefinitionExercise.js';
import ListeningExercise from './implementations/ListeningExercise.js';
import SpeakingExercise from './implementations/SpeakingExercise.js';
import ScrambleExercise from './implementations/ScrambleExercise.js';
import TypingWordExercise from './implementations/TypingWordExercise.js';

/**
 * Factory for creating exercise instances
 */
class ExerciseFactory {
    constructor() {
        this.types = {
            naming: NamingExercise,
            sentenceTyping: SentenceTypingExercise,
            category: CategoryExercise,
            rhyming: RhymingExercise,
            firstSound: FirstSoundExercise,
            association: AssociationExercise,
            synonyms: SynonymExercise,
            definitions: DefinitionExercise,
            listening: ListeningExercise,
            speaking: SpeakingExercise,
            scramble: ScrambleExercise,
            typing: TypingWordExercise
        };
    }
    
    create(type) {
        const ExerciseClass = this.types[type];
        if (!ExerciseClass) {
            throw new Error(`Unknown exercise type: ${type}`);
        }
        return new ExerciseClass();
    }
    
    getAvailableTypes() {
        return Object.keys(this.types);
    }
    
    getExerciseInfo() {
        return {
            naming: {
                name: 'Picture Naming',
                description: 'Name the object in the picture',
                icon: '🖼️',
                category: 'vocabulary'
            },
            listening: {
                name: 'Listening',
                description: 'Hear a word and pick the picture',
                icon: '👂',
                category: 'comprehension'
            },
            speaking: {
                name: 'Speaking',
                description: 'Say the word you see',
                icon: '🎤',
                category: 'production'
            },
            typing: {
                name: 'Word Typing',
                description: 'Type the word you see',
                icon: '⌨️',
                category: 'spelling'
            },
            sentenceTyping: {
                name: 'Sentence Completion',
                description: 'Type the missing word',
                icon: '✏️',
                category: 'sentences'
            },
            category: {
                name: 'Categories',
                description: 'Pick the word that fits',
                icon: '📁',
                category: 'vocabulary'
            },
            rhyming: {
                name: 'Rhyming Words',
                description: 'Find words that rhyme',
                icon: '🎵',
                category: 'phonology'
            },
            firstSound: {
                name: 'First Sounds',
                description: 'Match beginning sounds',
                icon: '🔤',
                category: 'phonology'
            },
            association: {
                name: 'Word Association',
                description: 'Find words that go together',
                icon: '🔗',
                category: 'semantics'
            },
            synonyms: {
                name: 'Synonyms & Antonyms',
                description: 'Match similar or opposite words',
                icon: '↔️',
                category: 'semantics'
            },
            definitions: {
                name: 'Definitions',
                description: 'Match words to meanings',
                icon: '📖',
                category: 'semantics'
            },
            scramble: {
                name: 'Sentence Scramble',
                description: 'Put words in order',
                icon: '🔀',
                category: 'sentences'
            }
        };
    }
    
    getExercisesByCategory() {
        const info = this.getExerciseInfo();
        const categories = {};
        
        Object.entries(info).forEach(([type, data]) => {
            if (!categories[data.category]) {
                categories[data.category] = [];
            }
            categories[data.category].push({ type, ...data });
        });
        
        return categories;
    }
}

export const exerciseFactory = new ExerciseFactory();
export default exerciseFactory;
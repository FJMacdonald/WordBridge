// js/services/WordbankService.js

import { i18n } from '../core/i18n.js';
import dataValidationService from './DataValidationService.js';

/**
 * Service for loading and querying the wordbank
 */
class WordbankService {
    constructor() {
        this.wordbank = null;
        this.sentences = null;
        this.wordsByCategory = {};
        this.wordsByDifficulty = {};
        this.wordsByFirstSound = {};
        this.loaded = false;
    }
    
    /**
     * Initialize the service by loading data files
     */
    async init() {
        if (this.loaded) return;
        
        const locale = i18n.getCurrentLocale();
        
        try {
            // Try locale-specific wordbank first
            try {
                const response = await fetch(`./data/${locale}/wordbank.json`);
                if (response.ok) {
                    this.wordbank = await response.json();
                } else {
                    throw new Error('Locale wordbank not found');
                }
            } catch (e) {
                // Fall back to default
                const response = await fetch('./data/default/wordbank.json');
                this.wordbank = await response.json();
            }
            
            // Load sentences
            try {
                const response = await fetch(`./data/${locale}/sentences.json`);
                if (response.ok) {
                    this.sentences = await response.json();
                } else {
                    throw new Error('Locale sentences not found');
                }
            } catch (e) {
                const response = await fetch('./data/default/sentences.json');
                this.sentences = await response.json();
            }
            
            this.buildIndexes();
            this.loaded = true;
            
        } catch (error) {
            console.error('Failed to load wordbank:', error);
            throw error;
        }
    }
    
    /**
     * Calculate difficulty based on word length
     * Uses DataValidationService for locale-aware thresholds
     */
    calculateDifficulty(word) {
        return dataValidationService.calculateDifficulty(word);
    }
    
    /**
     * Build indexes for fast querying
     */
    buildIndexes() {
        this.wordsByCategory = {};
        this.wordsByDifficulty = { easy: [], medium: [], hard: [] };
        this.wordsByFirstSound = {};
        this.wordsByPartOfSpeech = {};
        
        for (const word of this.wordbank.words) {
            // Calculate difficulty based on word length
            const difficulty = this.calculateDifficulty(word.word);
            word.difficulty = difficulty;
            
            // By category
            if (!this.wordsByCategory[word.category]) {
                this.wordsByCategory[word.category] = [];
            }
            this.wordsByCategory[word.category].push(word);
            
            // By difficulty
            this.wordsByDifficulty[difficulty].push(word);
            
            // By first sound
            const sound = word.soundGroup || word.word.charAt(0).toLowerCase();
            if (!this.wordsByFirstSound[sound]) {
                this.wordsByFirstSound[sound] = [];
            }
            this.wordsByFirstSound[sound].push(word);
            
            // By part of speech
            if (!this.wordsByPartOfSpeech[word.partOfSpeech]) {
                this.wordsByPartOfSpeech[word.partOfSpeech] = [];
            }
            this.wordsByPartOfSpeech[word.partOfSpeech].push(word);
        }
    }
    
    /**
     * Get all words, optionally filtered
     */
    getWords(filters = {}) {
        let words = [...this.wordbank.words];
        
        if (filters.difficulty) {
            words = words.filter(w => w.difficulty === filters.difficulty);
        }
        
        if (filters.category) {
            words = words.filter(w => w.category === filters.category);
        }
        
        if (filters.partOfSpeech) {
            words = words.filter(w => w.partOfSpeech === filters.partOfSpeech);
        }
        
        if (filters.hasRhymes) {
            words = words.filter(w => w.relationships.rhymes.length > 0);
        }
        
        if (filters.hasSynonyms) {
            words = words.filter(w => w.relationships.synonyms.length > 0);
        }
        
        if (filters.hasAntonyms) {
            words = words.filter(w => w.relationships.antonyms.length > 0);
        }
        
        if (filters.hasAssociated) {
            words = words.filter(w => w.relationships.associated.length > 0);
        }
        
        if (filters.hasPhrases) {
            words = words.filter(w => w.phrases && w.phrases.length > 0);
        }
        
        if (filters.hasSentences) {
            words = words.filter(w => w.sentences && w.sentences.length > 0);
        }
        
        if (filters.hasEmoji) {
            words = words.filter(w => w.visual && w.visual.emoji);
        }
        
        return words;
    }
    
    /**
     * Get a word by ID
     */
    getWordById(id) {
        return this.wordbank.words.find(w => w.id === id);
    }
    
    /**
     * Get random words
     */
    getRandomWords(count, filters = {}, exclude = []) {
        let words = this.getWords(filters);
        
        // Exclude specific word IDs
        if (exclude.length > 0) {
            words = words.filter(w => !exclude.includes(w.id));
        }
        
        return this.shuffleArray(words).slice(0, count);
    }
    
    /**
     * Get words that share a first sound
     */
    getWordsByFirstSound(sound) {
        return this.wordsByFirstSound[sound] || [];
    }
    
    /**
     * Get words from a category (for category exercise distractors)
     */
    getWordsFromCategory(category, exclude = []) {
        const words = this.wordsByCategory[category] || [];
        return words.filter(w => !exclude.includes(w.id));
    }
    
    /**
     * Get distractors for a word based on exercise type
     */
    getDistractors(word, exerciseType, count = 3) {
        let distractors = [];
        
        switch (exerciseType) {
            case 'naming':
            case 'listening':
            case 'typing':
                // Use distractors from word data if available
                if (word.distractors && word.distractors.length > 0) {
                    distractors = word.distractors;
                } else {
                    // Get random words of same difficulty
                    const randomWords = this.getRandomWords(count, {
                        difficulty: word.difficulty
                    }, [word.id]);
                    distractors = randomWords.map(w => w.word);
                }
                break;
                
            case 'category':
                // Get words from OTHER categories
                const otherWords = this.getWords({
                    difficulty: word.difficulty
                }).filter(w => w.category !== word.category && w.id !== word.id);
                distractors = this.shuffleArray(otherWords).slice(0, count).map(w => w.word);
                break;
                
            case 'rhyming':
                // Get words that DON'T rhyme
                const nonRhymingWords = this.getWords({
                    difficulty: word.difficulty
                }).filter(w => {
                    return w.id !== word.id && 
                           !word.relationships.rhymes.includes(w.word) &&
                           !w.relationships.rhymes.includes(word.word);
                });
                distractors = this.shuffleArray(nonRhymingWords).slice(0, count).map(w => w.word);
                break;
                
            case 'association':
                // Use unrelated words
                if (word.distractors && word.distractors.length > 0) {
                    distractors = word.distractors;
                } else {
                    const unrelatedWords = this.getWords({
                        difficulty: word.difficulty
                    }).filter(w => {
                        return w.id !== word.id &&
                               !word.relationships.associated.includes(w.word);
                    });
                    distractors = this.shuffleArray(unrelatedWords).slice(0, count).map(w => w.word);
                }
                break;
                
            case 'synonyms':
                // Mix of antonyms and unrelated - special handling
                // For synonym exercise: 1 synonym (correct), 1 antonym, 2 distractors
                const antonyms = word.relationships.antonyms.slice(0, 1);
                const remainingCount = count - antonyms.length;
                
                // Get unrelated words
                let unrelatedWords = [];
                if (word.distractors && word.distractors.length > 0) {
                    unrelatedWords = word.distractors.slice(0, remainingCount);
                } else {
                    const words = this.getWords({
                        difficulty: word.difficulty
                    }).filter(w => {
                        return w.id !== word.id &&
                               !word.relationships.synonyms.includes(w.word) &&
                               !word.relationships.antonyms.includes(w.word);
                    });
                    unrelatedWords = this.shuffleArray(words).slice(0, remainingCount).map(w => w.word);
                }
                
                distractors = [...antonyms, ...unrelatedWords];
                break;
                
            case 'definitions':
                // Other random words
                const defWords = this.getRandomWords(count, {
                    difficulty: word.difficulty
                }, [word.id]);
                distractors = defWords.map(w => w.word);
                break;
                
            case 'firstSound':
                // Words that start with different letters
                const firstLetter = word.word.charAt(0).toLowerCase();
                const differentSoundWords = this.getWords({
                    difficulty: word.difficulty
                }).filter(w => {
                    return w.id !== word.id && 
                           w.word.charAt(0).toLowerCase() !== firstLetter;
                });
                distractors = this.shuffleArray(differentSoundWords).slice(0, count).map(w => w.word);
                break;
                
            default:
                if (word.distractors && word.distractors.length > 0) {
                    distractors = word.distractors;
                } else {
                    const defaultWords = this.getRandomWords(count, {
                        difficulty: word.difficulty
                    }, [word.id]);
                    distractors = defaultWords.map(w => w.word);
                }
        }
        
        // Ensure we have enough distractors and they match difficulty
        distractors = distractors.filter(d => {
            if (typeof d === 'string') {
                return this.calculateDifficulty(d) === word.difficulty;
            }
            return false;
        });
        
        return distractors.slice(0, count);
    }
    
    /**
     * Build exercise data for naming/listening/typing exercises
     * For easy difficulty, only include nouns (not verbs)
     * Validates that we have proper distractors
     */
    buildNamingData(filters = {}) {
        // For easy exercises, focus on nouns only
        const exerciseFilters = { 
            ...filters, 
            hasEmoji: true 
        };
        
        // Easy exercises should focus on nouns
        if (filters.difficulty === 'easy') {
            exerciseFilters.partOfSpeech = 'noun';
        }
        
        const words = this.getWords(exerciseFilters);
        const data = [];
        
        for (const word of words) {
            let distractors = this.getDistractors(word, 'naming', 3);
            
            // Filter out any undefined, null, or empty distractors
            distractors = distractors.filter(d => d && typeof d === 'string' && d.trim() !== '');
            
            // If we don't have enough valid distractors, try to get more
            if (distractors.length < 3) {
                const additionalDistractors = this.getRandomWords(3 - distractors.length, {
                    difficulty: word.difficulty
                }, [word.id]).map(w => w.word);
                distractors = [...distractors, ...additionalDistractors];
            }
            
            // If we still don't have enough distractors, log and skip
            if (distractors.length < 3) {
                console.warn(`[WordbankService] Insufficient distractors for "${word.word}". Skipping.`);
                this.logDataIssue('insufficient_distractors', word.id, word.word, `Only ${distractors.length} distractors`);
                continue;
            }
            
            // Filter out any distractor that matches the answer
            distractors = distractors.filter(d => d.toLowerCase() !== word.word.toLowerCase());
            
            // Ensure we have at least 3 distractors
            if (distractors.length < 3) {
                continue;
            }
            
            data.push({
                id: word.id,
                emoji: word.visual.emoji,
                imageUrl: word.visual.imageUrl,
                alt: word.visual.alt,
                answer: word.word,
                options: this.shuffleArray([word.word, ...distractors.slice(0, 3)]),
                difficulty: word.difficulty,
                partOfSpeech: word.partOfSpeech
            });
        }
        
        return data;
    }
    
    /**
     * Build exercise data for category exercise
     * Validates that word and category are not the same
     */
    buildCategoryData(filters = {}) {
        const words = this.getWords(filters);
        const data = [];
        
        for (const word of words) {
            // Validate using DataValidationService
            const validation = dataValidationService.validateCategoryItem(word);
            
            if (!validation.valid) {
                continue; // Skip invalid items (already logged by validator)
            }
            
            const distractors = this.getDistractors(word, 'category', 3);
            
            // Ensure distractors don't include the word or category
            const validDistractors = distractors.filter(d => 
                d && 
                d.toLowerCase() !== word.word.toLowerCase() &&
                d.toLowerCase() !== word.category.toLowerCase()
            );
            
            if (validDistractors.length < 3) {
                continue;
            }
            
            data.push({
                id: word.id,
                category: word.category,
                word: word.word,
                options: this.shuffleArray([word.word, ...validDistractors.slice(0, 3)]),
                difficulty: word.difficulty
            });
        }
        
        return data;
    }
    

    
    /**
     * Build exercise data for rhyming exercise
     */
    buildRhymingData(filters = {}) {
        const words = this.getWords({ ...filters, hasRhymes: true });
        
        return words.map(word => {
            const nonRhymes = this.getDistractors(word, 'rhyming', 4);
            return {
                id: word.id,
                word: word.word,
                rhymes: word.relationships.rhymes.filter(r => 
                    this.calculateDifficulty(r) === word.difficulty
                ),
                nonRhymes: nonRhymes,
                difficulty: word.difficulty
            };
        });
    }
    
    /**
     * Build exercise data for first sound exercise
     */
    buildFirstSoundData(filters = {}) {
        const sounds = Object.keys(this.wordsByFirstSound);
        const data = [];
        
        for (const sound of sounds) {
            const wordsWithSound = this.wordsByFirstSound[sound]
                .filter(w => !filters.difficulty || w.difficulty === filters.difficulty);
            
            if (wordsWithSound.length >= 2) {
                // Get words that DON'T start with this sound
                const wordsWithoutSound = this.getWords(filters)
                    .filter(w => {
                        const firstChar = w.word.charAt(0).toLowerCase();
                        return firstChar !== sound.toLowerCase();
                    });
                
                if (wordsWithoutSound.length >= 3) {
                    data.push({
                        sound: sound,
                        words: wordsWithSound.map(w => w.word),
                        distractors: this.shuffleArray(wordsWithoutSound).slice(0, 4).map(w => w.word),
                        difficulty: wordsWithSound[0].difficulty
                    });
                }
            }
        }
        
        return data;
    }
    
    /**
     * Build exercise data for association exercise
     * Validates that we have valid associated words and distractors
     */
    buildAssociationData(filters = {}) {
        const words = this.getWords({ ...filters, hasAssociated: true });
        const data = [];
        
        for (const word of words) {
            // Filter associated words - ensure they exist and are valid strings
            const associated = (word.relationships.associated || [])
                .filter(a => a && typeof a === 'string' && a.trim() !== '')
                .filter(a => this.calculateDifficulty(a) === word.difficulty);
            
            // Skip if no valid associated words
            if (associated.length === 0) {
                console.warn(`[WordbankService] No valid associations for "${word.word}". Skipping.`);
                continue;
            }
            
            // Get distractors (unrelated words)
            let unrelated = this.getDistractors(word, 'association', 4);
            
            // Filter out any undefined, null, or empty distractors
            unrelated = unrelated.filter(u => u && typeof u === 'string' && u.trim() !== '');
            
            // Skip if we don't have enough unrelated words
            if (unrelated.length < 3) {
                console.warn(`[WordbankService] Insufficient distractors for association "${word.word}". Skipping.`);
                continue;
            }
            
            data.push({
                id: word.id,
                word: word.word,
                associated: associated,
                unrelated: unrelated,
                difficulty: word.difficulty
            });
        }
        
        return data;
    }
    
    /**
     * Build exercise data for synonym/antonym exercise
     * Validates that word is not in its own synonyms/antonyms
     */
    buildSynonymData(filters = {}) {
        const words = this.getWords(filters)
            .filter(w => w.relationships.synonyms.length > 0 || w.relationships.antonyms.length > 0);
        
        const data = [];
        
        for (const word of words) {
            // Validate using DataValidationService
            const validation = dataValidationService.validateSynonymItem({
                word: word.word,
                synonyms: word.relationships.synonyms,
                antonyms: word.relationships.antonyms,
                id: word.id
            });
            
            if (!validation.valid) {
                continue; // Skip invalid items (already logged by validator)
            }
            
            // Filter out any synonyms/antonyms that equal the word itself
            const validSynonyms = word.relationships.synonyms.filter(s => 
                s && s.toLowerCase() !== word.word.toLowerCase()
            );
            const validAntonyms = word.relationships.antonyms.filter(a => 
                a && a.toLowerCase() !== word.word.toLowerCase()
            );
            
            const hasSynonyms = validSynonyms.length > 0;
            const hasAntonyms = validAntonyms.length > 0;
            
            if (!hasSynonyms && !hasAntonyms) {
                continue; // Skip if no valid synonyms or antonyms
            }
            
            // Randomly choose synonym or antonym question
            let questionType = 'synonym';
            let correctAnswer = null;
            
            if (hasSynonyms && hasAntonyms) {
                questionType = Math.random() > 0.5 ? 'synonym' : 'antonym';
            } else if (hasAntonyms) {
                questionType = 'antonym';
            }
            
            // Get correct answer
            if (questionType === 'synonym') {
                correctAnswer = validSynonyms[0];
            } else {
                correctAnswer = validAntonyms[0];
            }
            
            // Ensure correct answer is valid
            if (!correctAnswer || correctAnswer.toLowerCase() === word.word.toLowerCase()) {
                dataValidationService.logIssue(
                    'synonym_answer_equals_word',
                    word.id,
                    word.word,
                    `Correct answer "${correctAnswer}" equals word`,
                    'error'
                );
                continue;
            }
            
            // Build distractors
            let distractors = [];
            
            // Add one from the opposite type if available
            if (questionType === 'synonym' && hasAntonyms) {
                distractors.push(validAntonyms[0]);
            } else if (questionType === 'antonym' && hasSynonyms) {
                distractors.push(validSynonyms[0]);
            }
            
            // Add unrelated words
            const unrelatedCount = 3 - distractors.length;
            if (word.distractors && word.distractors.length > 0) {
                const unrelated = word.distractors
                    .filter(d => d && 
                        d.toLowerCase() !== word.word.toLowerCase() &&
                        d.toLowerCase() !== correctAnswer.toLowerCase() &&
                        this.calculateDifficulty(d) === word.difficulty)
                    .slice(0, unrelatedCount);
                distractors.push(...unrelated);
            }
            
            // If still need more distractors, get random words
            if (distractors.length < 3) {
                const randomWords = this.getRandomWords(3 - distractors.length, {
                    difficulty: word.difficulty
                }, [word.id])
                    .map(w => w.word)
                    .filter(w => w.toLowerCase() !== word.word.toLowerCase() &&
                                w.toLowerCase() !== correctAnswer.toLowerCase());
                distractors.push(...randomWords);
            }
            
            // Final validation: ensure we have enough distractors
            distractors = distractors.filter(d => d && typeof d === 'string');
            if (distractors.length < 3) {
                continue;
            }
            
            data.push({
                id: word.id,
                word: word.word,
                questionType: questionType,
                correctAnswer: correctAnswer,
                options: this.shuffleArray([correctAnswer, ...distractors.slice(0, 3)]),
                difficulty: word.difficulty
            });
        }
        
        return data;
    }
    
    /**
     * Build exercise data for definition exercise
     */
    buildDefinitionData(filters = {}) {
        const words = this.getWords(filters);
        
        return words.map(word => {
            const distractors = this.getDistractors(word, 'definitions', 3);
            return {
                id: word.id,
                word: word.word,
                definition: word.definition,
                options: this.shuffleArray([word.word, ...distractors]),
                difficulty: word.difficulty
            };
        });
    }
    
    /**
     * Build exercise data for speaking exercise
     */
    buildSpeakingData(filters = {}) {
        const words = this.getWords({ ...filters, hasEmoji: true });
        
        return words.map(word => ({
            id: word.id,
            emoji: word.visual.emoji,
            imageUrl: word.visual.imageUrl,
            alt: word.visual.alt,
            answer: word.word,
            phrases: word.phrases || [],
            difficulty: word.difficulty
        }));
    }
    
    /**
     * Build exercise data for sentence fill-in-blank
     * Now includes visual hint (emoji/image) to provide context
     */
    buildSentenceData(filters = {}) {
        const words = this.getWords({ ...filters, hasSentences: true });
        const data = [];
        
        for (const word of words) {
            for (const sentence of word.sentences) {
                // Create blank version by replacing the word
                const blankSentence = this.createBlankSentence(sentence, word.word);
                if (blankSentence) {
                    data.push({
                        id: `${word.id}_${data.length}`,
                        sentence: blankSentence,
                        answer: word.word,
                        fullSentence: sentence,
                        difficulty: word.difficulty,
                        // Include visual info for context
                        emoji: word.visual?.emoji || null,
                        imageUrl: word.visual?.imageUrl || null,
                        alt: word.visual?.alt || word.word
                    });
                }
            }
        }
        
        return data;
    }
    
    /**
     * Create a sentence with blank where word appears
     */
    createBlankSentence(sentence, word) {
        // Case-insensitive replacement
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (!regex.test(sentence)) {
            return null; // Word not found in sentence
        }
        
        // Replace with underscores matching word length
        const blank = '_'.repeat(word.length);
        return sentence.replace(regex, blank);
    }
    
    /**
     * Get sentences for scramble exercise
     */
    getSentences(filters = {}) {
        let sentences = [...this.sentences.sentences];
        
        if (filters.difficulty) {
            sentences = sentences.filter(s => {
                if (s.difficulty) {
                    return s.difficulty === filters.difficulty;
                }
                // Calculate from average word length
                const words = s.sentence.split(/\s+/);
                const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
                const calculated = avgLength <= 4 ? 'easy' : 
                                   avgLength <= 6 ? 'medium' : 'hard';
                return calculated === filters.difficulty;
            });
        }
        
        return sentences;
    }
    
    /**
     * Build exercise data for scramble exercise
     */
    buildScrambleData(filters = {}) {
        const sentences = this.getSentences(filters);
        
        return sentences.map(s => {
            const words = s.sentence.split(/\s+/);
            const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
            const difficulty = s.difficulty || 
                (avgLength <= 4 ? 'easy' : avgLength <= 6 ? 'medium' : 'hard');
            
            return {
                id: s.id,
                words: words,
                difficulty: difficulty
            };
        });
    }
    
    /**
     * Get all available categories
     */
    getCategories() {
        return Object.keys(this.wordsByCategory);
    }
    
    /**
     * Check if an exercise type is available (has sufficient data)
     */
    isExerciseAvailable(exerciseType, difficulty = null) {
        const filters = difficulty ? { difficulty } : {};
        
        switch (exerciseType) {
            case 'rhyming':
                return this.getWords({ ...filters, hasRhymes: true }).length >= 4;
            case 'synonyms':
                return this.getWords({ ...filters, hasSynonyms: true }).length >= 4;
            case 'firstSound':
                const soundGroups = {};
                this.getWords(filters).forEach(w => {
                    const firstChar = w.word.charAt(0).toLowerCase();
                    soundGroups[firstChar] = (soundGroups[firstChar] || 0) + 1;
                });
                return Object.values(soundGroups).filter(count => count >= 2).length >= 3;
            case 'association':
                return this.getWords({ ...filters, hasAssociated: true }).length >= 4;
            case 'speaking':
                return this.getWords({ ...filters, hasEmoji: true }).length >= 4;
            case 'sentenceTyping':
                return this.getWords({ ...filters, hasSentences: true }).length >= 4;
            default:
                return this.getWords(filters).length >= 4;
        }
    }
    
    /**
     * Get exercise availability report (for translation status)
     */
    getExerciseAvailability() {
        const exercises = [
            'naming', 'typing', 'listening', 'speaking',
            'category', 'rhyming', 'firstSound', 'association',
            'synonyms', 'definitions', 'sentenceTyping', 'scramble'
        ];
        
        const report = {};
        for (const ex of exercises) {
            report[ex] = {
                available: this.isExerciseAvailable(ex),
                byDifficulty: {
                    easy: this.isExerciseAvailable(ex, 'easy'),
                    medium: this.isExerciseAvailable(ex, 'medium'),
                    hard: this.isExerciseAvailable(ex, 'hard')
                },
                wordCount: this.getExerciseWordCount(ex)
            };
        }
        
        return report;
    }
    
    /**
     * Get word count for an exercise type
     */
    getExerciseWordCount(exerciseType) {
        switch (exerciseType) {
            case 'rhyming':
                return this.getWords({ hasRhymes: true }).length;
            case 'synonyms':
                return this.getWords({ hasSynonyms: true }).length;
            case 'association':
                return this.getWords({ hasAssociated: true }).length;
            case 'speaking':
                return this.getWords({ hasEmoji: true }).length;
            case 'sentenceTyping':
                return this.getWords({ hasSentences: true }).length;
            case 'scramble':
                return this.sentences?.sentences?.length || 0;
            default:
                return this.wordbank.words.length;
        }
    }
    
    // Utility
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}

export const wordbankService = new WordbankService();
export default wordbankService;
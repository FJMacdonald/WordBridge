/**
 * CSV parsing and generation service
 * Handles wordbank format and other exercise types
 */

import { t } from '../core/i18n.js';

class CSVService {
    constructor() {
        // Wordbank CSV column definitions
        this.wordbankColumns = [
            'id', 'word', 'partOfSpeech', 'category', 'soundGroup', 'definition',
            'emoji', 'imageUrl', 'rhymes', 'associated', 'synonyms', 'antonyms',
            'distractors', 'sentences', 'phrases'
        ];
        
        // Column indices for quick access
        this.COL = {
            ID: 0, WORD: 1, POS: 2, CATEGORY: 3, SOUND: 4, DEFINITION: 5,
            EMOJI: 6, IMAGE_URL: 7, RHYMES: 8, ASSOCIATED: 9, SYNONYMS: 10,
            ANTONYMS: 11, DISTRACTORS: 12, SENTENCES: 13, PHRASES: 14
        };
    }

    // ==================== EXPORT FUNCTIONS ====================

    /**
     * Export wordbank to CSV format
     * @param {Object} wordbank - The wordbank data object
     * @returns {string} CSV content
     */
    exportWordbankToCSV(wordbank) {
        const headers = this.wordbankColumns;
        const rows = [];

        for (const word of wordbank.words) {
            const row = [
                word.id || word.word,
                word.word,
                word.partOfSpeech || 'noun',
                word.category || '',
                word.soundGroup || word.word.charAt(0).toLowerCase(),
                word.definition || '',
                word.visual?.emoji || '',
                word.visual?.imageUrl || word.visual?.asset || '',
                this.arrayToString(word.relationships?.rhymes),
                this.arrayToString(word.relationships?.associated),
                this.arrayToString(word.relationships?.synonyms),
                this.arrayToString(word.relationships?.antonyms),
                this.arrayToString(word.distractors),
                this.arrayToString(word.sentences),
                this.arrayToString(word.phrases)
            ];
            rows.push(row);
        }

        return this.generateCSV(headers, rows);
    }

    /**
     * Export wordbank for translation (includes source and target columns)
     * @param {Object} wordbank - The wordbank data object
     * @param {string} targetLocale - Target language code
     * @returns {string} CSV content with translation columns
     */
    exportForTranslation(wordbank, targetLocale = 'xx') {
        const headers = [
            'id',
            'word_source', 'word_target',
            'category_source', 'category_target',
            'definition_source', 'definition_target',
            'sentences_source', 'sentences_target',
            'phrases_source', 'phrases_target',
            'synonyms_source', 'synonyms_target',
            'antonyms_source', 'antonyms_target',
            'rhymes_target', // Rhymes need to be created fresh
            'associated_target', // Associated words may need adjustment
            'distractors_target', // Distractors need regeneration
            'emoji', 'soundGroup_target'
        ];

        const rows = [];
        for (const word of wordbank.words) {
            const row = [
                word.id || word.word,
                word.word, '', // word target empty
                word.category || '', '', // category target empty
                word.definition || '', '', // definition target empty
                this.arrayToString(word.sentences), '', // sentences target empty
                this.arrayToString(word.phrases), '', // phrases target empty
                this.arrayToString(word.relationships?.synonyms), '',
                this.arrayToString(word.relationships?.antonyms), '',
                '', // rhymes target - must be created
                '', // associated target
                '', // distractors target
                word.visual?.emoji || '',
                '' // soundGroup target
            ];
            rows.push(row);
        }

        return this.generateCSV(headers, rows);
    }

    /**
     * Export template CSV with examples and instructions
     * @param {Array} exerciseTypes - Types to include in template
     * @returns {string} CSV content
     */
    exportTemplate(exerciseTypes = ['wordbank']) {
        const lines = [];
        
        // Header comment
        lines.push('# WordBridge Exercise Template');
        lines.push('# Lines starting with # are comments and will be ignored');
        lines.push('# Delete example rows before uploading your data');
        lines.push('');

        if (exerciseTypes.includes('wordbank')) {
            lines.push('# === WORDBANK FORMAT ===');
            lines.push('# Creates exercises for: Naming, Listening, Typing, Speaking, Definitions,');
            lines.push('#   Categories, First Sound, Rhyming, Association, Synonyms, Sentences');
            lines.push('# Use | to separate multiple items within a field');
            lines.push('');
            lines.push(this.wordbankColumns.join(','));
            lines.push('apple,apple,noun,fruit,a,A round red or green fruit,🍎,,chapel|grapple,tree|pie|red|juice,,,"stain|smell|close|loss|claim|dream|float|prize",I ate an apple for lunch.|The apple fell from the tree.,An apple a day keeps the doctor away');
            lines.push('happy,happy,adjective,feeling,h,Feeling joy or pleasure,😊,,snappy|nappy,joy|smile|laugh|cheerful,glad|cheerful|joyful,sad|unhappy|miserable,"grumpy|sleepy|hungry|thirsty|angry|tired",She felt happy today.|The happy child laughed.,Happy as a clam');
            lines.push('');
        }

        if (exerciseTypes.includes('sentence')) {
            lines.push('# === SENTENCE COMPLETION FORMAT ===');
            lines.push('# exercise_type,difficulty,sentence_with_blank,answer');
            lines.push('# Use ? or __ or ___ for the blank');
            lines.push('sentenceTyping,easy,I drink __ every morning.,coffee');
            lines.push('sentenceTyping,medium,The cat is sleeping on the ?.,couch');
            lines.push('');
        }

        if (exerciseTypes.includes('category')) {
            lines.push('# === CATEGORY FORMAT ===');
            lines.push('# exercise_type,difficulty,category,correct_word,wrong1,wrong2,wrong3');
            lines.push('category,easy,fruit,apple,chair,book,car');
            lines.push('');
        }

        if (exerciseTypes.includes('timeSequencing')) {
            lines.push('# === TIME SEQUENCING FORMAT ===');
            lines.push('# exercise_type,difficulty,question,correct_answer,wrong_options (pipe separated)');
            lines.push('timeSequencing,easy,What day comes after Monday?,Tuesday,Wednesday|Sunday|Friday');
            lines.push('');
        }

        if (exerciseTypes.includes('clockMatching')) {
            lines.push('# === CLOCK MATCHING FORMAT ===');
            lines.push('# exercise_type,difficulty,time,time_in_words,wrong_times (pipe separated)');
            lines.push('clockMatching,easy,3:00,three o\'clock,4:00|5:00|6:00');
            lines.push('');
        }

        if (exerciseTypes.includes('timeOrdering')) {
            lines.push('# === TIME ORDERING FORMAT ===');
            lines.push('# exercise_type,difficulty,scenario,activity1,activity2,activity3,...');
            lines.push('timeOrdering,easy,Morning routine,Wake up,Brush teeth,Eat breakfast,Go to work');
            lines.push('');
        }

        if (exerciseTypes.includes('workingMemory')) {
            lines.push('# === WORKING MEMORY FORMAT ===');
            lines.push('# exercise_type,difficulty,sequence_emojis,extra_option_emojis');
            lines.push('workingMemory,easy,🍎🍌🍊,🍇🍓🥝🥭🍉');
            lines.push('');
        }

        return lines.join('\n');
    }

    // ==================== IMPORT FUNCTIONS ====================

    /**
     * Parse CSV file and return structured data
     * @param {File} file - The CSV file to parse
     * @returns {Object} Parsed data with words and errors
     */
    async parseCSV(file) {
        const text = await this.readFile(file);
        return this.parseCSVText(text);
    }

    /**
     * Parse CSV text content
     * @param {string} text - CSV text content
     * @returns {Object} Parsed data
     */
    parseCSVText(text) {
        const lines = text.split('\n');
        const result = {
            wordbank: [],
            exercises: [],
            errors: [],
            warnings: []
        };

        let headers = null;
        let isWordbankFormat = false;
        let lineNumber = 0;

        for (const line of lines) {
            lineNumber++;
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            const values = this.parseCSVLine(trimmedLine);

            // Detect header row
            if (!headers && this.isHeaderRow(values)) {
                headers = values.map(h => h.toLowerCase().trim());
                isWordbankFormat = this.isWordbankHeader(headers);
                continue;
            }

            // Skip if no values
            if (values.length === 0 || (values.length === 1 && !values[0])) {
                continue;
            }

            try {
                if (isWordbankFormat || this.looksLikeWordbankRow(values)) {
                    const wordEntry = this.parseWordbankRow(values, headers, lineNumber);
                    if (wordEntry) {
                        const validation = this.validateWordEntry(wordEntry);
                        if (validation.valid) {
                            result.wordbank.push(wordEntry);
                        } else {
                            result.errors.push({
                                row: lineNumber,
                                message: validation.errors.join('; '),
                                data: wordEntry.word
                            });
                        }
                        if (validation.warnings.length > 0) {
                            result.warnings.push({
                                row: lineNumber,
                                message: validation.warnings.join('; '),
                                data: wordEntry.word
                            });
                        }
                    }
                } else {
                    // Try to parse as other exercise type
                    const exercise = this.parseExerciseRow(values, lineNumber);
                    if (exercise) {
                        result.exercises.push(exercise);
                    }
                }
            } catch (error) {
                result.errors.push({
                    row: lineNumber,
                    message: error.message,
                    suggestion: this.getSuggestion(error.message)
                });
            }
        }

        return result;
    }

    /**
     * Parse a wordbank row into a word entry
     */
    parseWordbankRow(values, headers, lineNumber) {
        // If we have headers, map by header name
        // Otherwise, use positional mapping
        let data = {};

        if (headers && headers.length > 0) {
            for (let i = 0; i < headers.length && i < values.length; i++) {
                data[headers[i]] = values[i];
            }
        } else {
            // Positional mapping based on wordbankColumns order
            for (let i = 0; i < this.wordbankColumns.length && i < values.length; i++) {
                data[this.wordbankColumns[i]] = values[i];
            }
        }

        // Handle alternative column names
        const word = data.word || data.word_target || data.word_source || '';
        if (!word.trim()) {
            return null;
        }

        return {
            id: data.id || word.toLowerCase().replace(/\s+/g, '_'),
            word: word.trim().toLowerCase(),
            partOfSpeech: data.partofspeech || data.pos || data.part_of_speech || 'noun',
            category: (data.category || data.category_target || data.category_source || '').trim(),
            soundGroup: (data.soundgroup || data.sound || data.soundgroup_target || word.charAt(0)).toLowerCase(),
            definition: data.definition || data.definition_target || data.definition_source || '',
            visual: {
                emoji: data.emoji || '',
                imageUrl: data.imageurl || data.image_url || data.image || '',
                asset: null
            },
            relationships: {
                rhymes: this.stringToArray(data.rhymes || data.rhymes_target || ''),
                associated: this.stringToArray(data.associated || data.associated_target || ''),
                synonyms: this.stringToArray(data.synonyms || data.synonyms_target || ''),
                antonyms: this.stringToArray(data.antonyms || data.antonyms_target || '')
            },
            distractors: this.stringToArray(data.distractors || data.distractors_target || ''),
            sentences: this.stringToArray(data.sentences || data.sentences_target || ''),
            phrases: this.stringToArray(data.phrases || data.phrases_target || ''),
            isCustom: true,
            status: 'active'
        };
    }

    /**
     * Validate a word entry
     */
    validateWordEntry(entry) {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!entry.word || entry.word.length === 0) {
            errors.push(t('csv.errors.wordRequired') || 'Word is required');
        }

        // Distractors check
        if (!entry.distractors || entry.distractors.length < 3) {
            errors.push(t('csv.errors.distractorsRequired') || 'At least 3 distractors are required');
        }

        // Distractor quality checks
        if (entry.distractors && entry.distractors.length > 0) {
            const wordLength = entry.word.length;
            const badDistractors = entry.distractors.filter(d => {
                // Check length (should be within ±2)
                if (Math.abs(d.length - wordLength) > 2) return true;
                // Check if starts with same letter
                if (d.charAt(0).toLowerCase() === entry.word.charAt(0).toLowerCase()) return true;
                // Check if in synonyms/antonyms/rhymes
                if (entry.relationships.synonyms.includes(d)) return true;
                if (entry.relationships.antonyms.includes(d)) return true;
                if (entry.relationships.rhymes.includes(d)) return true;
                if (entry.relationships.associated.includes(d)) return true;
                return false;
            });

            if (badDistractors.length > 0) {
                warnings.push(`${t('csv.warnings.invalidDistractors') || 'Some distractors may be invalid'}: ${badDistractors.join(', ')}`);
            }
        }

        // Warnings for missing optional fields
        if (!entry.visual.emoji && !entry.visual.imageUrl) {
            warnings.push(t('csv.warnings.noVisual') || 'No emoji or image - naming/listening exercises will be limited');
        }

        if (!entry.definition) {
            warnings.push(t('csv.warnings.noDefinition') || 'No definition - definition exercise will not be available');
        }

        if (entry.relationships.rhymes.length === 0) {
            warnings.push(t('csv.warnings.noRhymes') || 'No rhymes - rhyming exercise will not be available');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Parse an exercise row (non-wordbank format)
     */
    parseExerciseRow(values, lineNumber) {
        const exerciseType = values[0]?.toLowerCase().trim();
        const difficulty = values[1]?.toLowerCase().trim() || 'easy';

        if (!exerciseType) {
            throw new Error(t('csv.errors.exerciseTypeRequired') || 'Exercise type is required');
        }

        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            throw new Error(t('csv.errors.invalidDifficulty') || 'Difficulty must be easy, medium, or hard');
        }

        const dataValues = values.slice(2);
        return this.transformExerciseData(exerciseType, difficulty, dataValues);
    }

    /**
     * Transform exercise data based on type
     */
    transformExerciseData(exerciseType, difficulty, dataValues) {
        switch (exerciseType) {
            case 'sentencetyping':
            case 'sentence':
                return this.transformSentence(dataValues, difficulty);

            case 'category':
            case 'categories':
                return this.transformCategory(dataValues, difficulty);

            case 'timesequencing':
            case 'time_sequencing':
                return this.transformTimeSequencing(dataValues, difficulty);

            case 'clockmatching':
            case 'clock_matching':
                return this.transformClockMatching(dataValues, difficulty);

            case 'timeordering':
            case 'time_ordering':
                return this.transformTimeOrdering(dataValues, difficulty);

            case 'workingmemory':
            case 'working_memory':
                return this.transformWorkingMemory(dataValues, difficulty);

            case 'rhyming':
                return this.transformRhyming(dataValues, difficulty);

            case 'association':
                return this.transformAssociation(dataValues, difficulty);

            case 'synonyms':
            case 'synonym':
                return this.transformSynonyms(dataValues, difficulty);

            case 'firstsound':
            case 'first_sound':
                return this.transformFirstSound(dataValues, difficulty);

            case 'definitions':
            case 'definition':
                return this.transformDefinitions(dataValues, difficulty);

            case 'scramble':
                return this.transformScramble(dataValues, difficulty);

            default:
                throw new Error(`${t('csv.errors.unknownType') || 'Unknown exercise type'}: ${exerciseType}`);
        }
    }

    // Transform methods for each exercise type
    transformSentence(values, difficulty) {
        const [sentence, answer] = values.filter(v => v?.trim());
        if (!sentence || !answer) {
            throw new Error(t('csv.errors.sentenceRequired') || 'Sentence and answer are required');
        }

        let sentenceText = sentence.trim();
        if (!sentenceText.includes('?') && !sentenceText.includes('_')) {
            throw new Error(t('csv.errors.blankRequired') || 'Sentence must contain blank marker (? or _)');
        }

        sentenceText = sentenceText.replace(/\?(?!\w)/g, '__').replace(/_{1,}/g, '__');

        return {
            exerciseType: 'sentenceTyping',
            sentence: sentenceText,
            answer: answer.toLowerCase().trim(),
            difficulty,
            isCustom: true
        };
    }

    transformCategory(values, difficulty) {
        const [category, correct, ...options] = values.filter(v => v?.trim());
        if (!category || !correct) {
            throw new Error(t('csv.errors.categoryRequired') || 'Category and correct word are required');
        }

        const wrongOptions = options.map(o => o.toLowerCase().trim());
        if (wrongOptions.length < 2) {
            throw new Error(t('csv.errors.optionsRequired') || 'At least 2 wrong options required');
        }

        return {
            exerciseType: 'category',
            category: category.toLowerCase().trim(),
            word: correct.toLowerCase().trim(),
            options: [correct.toLowerCase().trim(), ...wrongOptions],
            difficulty,
            isCustom: true
        };
    }

    transformTimeSequencing(values, difficulty) {
        const [question, correct, wrongOptionsStr] = values.filter(v => v?.trim());
        if (!question || !correct) {
            throw new Error(t('csv.errors.questionRequired') || 'Question and answer are required');
        }

        const wrongOptions = this.stringToArray(wrongOptionsStr || '');
        if (wrongOptions.length < 3) {
            throw new Error(t('csv.errors.wrongOptionsRequired') || 'At least 3 wrong options required');
        }

        return {
            exerciseType: 'timeSequencing',
            question: question.trim(),
            answer: correct.trim(),
            options: [correct.trim(), ...wrongOptions],
            difficulty,
            isCustom: true
        };
    }

    transformClockMatching(values, difficulty) {
        const [timeStr, timeWords, wrongTimesStr] = values.filter(v => v?.trim());
        if (!timeStr || !timeWords) {
            throw new Error(t('csv.errors.clockRequired') || 'Time and time words are required');
        }

        const wrongTimes = this.stringToArray(wrongTimesStr || '');
        if (wrongTimes.length < 3) {
            throw new Error(t('csv.errors.wrongTimesRequired') || 'At least 3 wrong times required');
        }

        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            throw new Error(t('csv.errors.invalidTimeFormat') || 'Time must be in HH:MM format');
        }

        return {
            exerciseType: 'clockMatching',
            time: timeStr,
            hour: hours,
            minute: minutes,
            timeWords: timeWords.trim(),
            wrongClocks: wrongTimes.map(t => {
                const [h, m] = t.split(':').map(Number);
                return { time: t, hour: h, minute: m };
            }),
            difficulty,
            isCustom: true
        };
    }

    transformTimeOrdering(values, difficulty) {
        const [scenario, ...activities] = values.filter(v => v?.trim());
        if (!scenario || activities.length < 3) {
            throw new Error(t('csv.errors.timeOrderingRequired') || 'Scenario and at least 3 activities required');
        }

        return {
            exerciseType: 'timeOrdering',
            scenario: scenario.trim(),
            items: activities.map(a => a.trim()),
            correctOrder: activities.map(a => a.trim()),
            difficulty,
            isCustom: true
        };
    }

    transformWorkingMemory(values, difficulty) {
        const [sequence, extraOptions] = values.filter(v => v?.trim());
        if (!sequence || !extraOptions) {
            throw new Error(t('csv.errors.workingMemoryRequired') || 'Sequence and extra options required');
        }

        const sequenceEmojis = [...sequence].filter(c => /\p{Emoji}/u.test(c) && c !== '\uFE0F');
        const extraEmojis = [...extraOptions].filter(c => /\p{Emoji}/u.test(c) && c !== '\uFE0F');

        if (sequenceEmojis.length !== 3) {
            throw new Error(t('csv.errors.sequenceLength') || 'Sequence must have exactly 3 emojis');
        }

        if (extraEmojis.length < 3) {
            throw new Error(t('csv.errors.extraOptionsLength') || 'At least 3 extra option emojis required');
        }

        return {
            exerciseType: 'workingMemory',
            sequence: sequenceEmojis,
            options: [...sequenceEmojis, ...extraEmojis],
            difficulty,
            isCustom: true
        };
    }

    transformRhyming(values, difficulty) {
        const [word, rhymesStr, nonRhymesStr] = values.filter(v => v?.trim());
        if (!word) {
            throw new Error(t('csv.errors.wordRequired') || 'Word is required');
        }

        const rhymes = this.stringToArray(rhymesStr || '');
        const nonRhymes = this.stringToArray(nonRhymesStr || '');

        if (rhymes.length < 1) {
            throw new Error(t('csv.errors.rhymesRequired') || 'At least 1 rhyming word required');
        }

        if (nonRhymes.length < 3) {
            throw new Error(t('csv.errors.nonRhymesRequired') || 'At least 3 non-rhyming words required');
        }

        return {
            exerciseType: 'rhyming',
            word: word.toLowerCase().trim(),
            rhymes,
            nonRhymes,
            difficulty,
            isCustom: true
        };
    }

    transformAssociation(values, difficulty) {
        const [word, associatedStr, unrelatedStr] = values.filter(v => v?.trim());
        if (!word) {
            throw new Error(t('csv.errors.wordRequired') || 'Word is required');
        }

        const associated = this.stringToArray(associatedStr || '');
        const unrelated = this.stringToArray(unrelatedStr || '');

        if (associated.length < 1) {
            throw new Error(t('csv.errors.associatedRequired') || 'At least 1 associated word required');
        }

        if (unrelated.length < 3) {
            throw new Error(t('csv.errors.unrelatedRequired') || 'At least 3 unrelated words required');
        }

        return {
            exerciseType: 'association',
            word: word.toLowerCase().trim(),
            associated,
            unrelated,
            difficulty,
            isCustom: true
        };
    }

    transformSynonyms(values, difficulty) {
        const [word, isSynonymStr, correctWord, wrongWordsStr] = values.filter(v => v?.trim());
        if (!word || !correctWord) {
            throw new Error(t('csv.errors.synonymRequired') || 'Word and correct answer required');
        }

        const isSynonym = !['false', '0', 'no', 'antonym'].includes(isSynonymStr?.toLowerCase());
        const wrongWords = this.stringToArray(wrongWordsStr || '');

        if (wrongWords.length < 3) {
            throw new Error(t('csv.errors.wrongWordsRequired') || 'At least 3 wrong words required');
        }

        return {
            exerciseType: 'synonyms',
            word: word.toLowerCase().trim(),
            questionType: isSynonym ? 'synonym' : 'antonym',
            correctAnswer: correctWord.toLowerCase().trim(),
            options: [correctWord.toLowerCase().trim(), ...wrongWords],
            difficulty,
            isCustom: true
        };
    }

    transformFirstSound(values, difficulty) {
        const [sound, correctWord, wrongWordsStr] = values.filter(v => v?.trim());
        if (!sound || !correctWord) {
            throw new Error(t('csv.errors.firstSoundRequired') || 'Sound and correct word required');
        }

        const wrongWords = this.stringToArray(wrongWordsStr || '');
        if (wrongWords.length < 3) {
            throw new Error(t('csv.errors.wrongWordsRequired') || 'At least 3 wrong words required');
        }

        return {
            exerciseType: 'firstSound',
            sound: sound.toLowerCase().trim(),
            correctWord: correctWord.toLowerCase().trim(),
            words: [correctWord.toLowerCase().trim()],
            wrongWords,
            options: [correctWord.toLowerCase().trim(), ...wrongWords],
            difficulty,
            isCustom: true
        };
    }

    transformDefinitions(values, difficulty) {
        const [word, definition, wrongWordsStr] = values.filter(v => v?.trim());
        if (!word || !definition) {
            throw new Error(t('csv.errors.definitionRequired') || 'Word and definition required');
        }

        const wrongWords = this.stringToArray(wrongWordsStr || '');
        if (wrongWords.length < 3) {
            throw new Error(t('csv.errors.wrongWordsRequired') || 'At least 3 wrong words required');
        }

        return {
            exerciseType: 'definitions',
            word: word.toLowerCase().trim(),
            definition: definition.trim(),
            options: [word.toLowerCase().trim(), ...wrongWords],
            difficulty,
            isCustom: true
        };
    }

    transformScramble(values, difficulty) {
        const [sentence] = values.filter(v => v?.trim());
        if (!sentence) {
            throw new Error(t('csv.errors.sentenceRequired') || 'Sentence is required');
        }

        const words = sentence.trim().split(/\s+/).filter(w => w);
        if (words.length < 3) {
            throw new Error(t('csv.errors.sentenceTooShort') || 'Sentence must have at least 3 words');
        }

        return {
            exerciseType: 'scramble',
            sentence: sentence.trim(),
            words,
            difficulty,
            isCustom: true
        };
    }

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Parse a CSV line handling quotes and special characters
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * Check if a row looks like a header
     */
    isHeaderRow(values) {
        const headerKeywords = ['id', 'word', 'exercise_type', 'difficulty', 'category', 'definition'];
        const lowerValues = values.map(v => v.toLowerCase().trim());
        return headerKeywords.some(kw => lowerValues.includes(kw));
    }

    /**
     * Check if headers indicate wordbank format
     */
    isWordbankHeader(headers) {
        return headers.includes('word') && 
               (headers.includes('distractors') || headers.includes('category'));
    }

    /**
     * Check if a row looks like wordbank data (not exercise type row)
     */
    looksLikeWordbankRow(values) {
        // If first column is a known exercise type, it's not wordbank
        const exerciseTypes = ['sentence', 'category', 'timesequencing', 'clockmatching', 
                              'timeordering', 'workingmemory', 'rhyming', 'association',
                              'synonyms', 'firstsound', 'definitions', 'scramble'];
        
        const firstVal = values[0]?.toLowerCase().trim();
        return !exerciseTypes.includes(firstVal) && firstVal && !firstVal.includes('type');
    }

    /**
     * Convert array to pipe-separated string
     */
    arrayToString(arr) {
        if (!arr || !Array.isArray(arr)) return '';
        return arr.filter(item => item).join('|');
    }

    /**
     * Convert pipe or comma separated string to array
     */
    stringToArray(str) {
        if (!str || typeof str !== 'string') return [];
        const separator = str.includes('|') ? '|' : ',';
        return str.split(separator)
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);
    }

    /**
     * Generate CSV string from headers and rows
     */
    generateCSV(headers, rows) {
        const escapeCell = (cell) => {
            const str = String(cell || '');
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('|')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const lines = [
            headers.map(escapeCell).join(','),
            ...rows.map(row => row.map(escapeCell).join(','))
        ];

        return lines.join('\n');
    }

    /**
     * Get suggestion for common errors
     */
    getSuggestion(errorMessage) {
        const msg = errorMessage.toLowerCase();

        if (msg.includes('distractor')) {
            return t('csv.suggestions.distractors') || 
                   'Add at least 3 distractor words separated by | (e.g., word1|word2|word3)';
        }
        if (msg.includes('blank') || msg.includes('sentence')) {
            return t('csv.suggestions.blank') || 
                   'Use ? or __ to mark the blank in the sentence';
        }
        if (msg.includes('exercise type')) {
            return t('csv.suggestions.exerciseType') || 
                   'First column should be exercise type (e.g., sentenceTyping, category)';
        }
        if (msg.includes('difficulty')) {
            return t('csv.suggestions.difficulty') || 
                   'Difficulty must be: easy, medium, or hard';
        }
        if (msg.includes('time') || msg.includes('clock')) {
            return t('csv.suggestions.time') || 
                   'Time format should be HH:MM (e.g., 3:00 or 14:30)';
        }

        return null;
    }

    /**
     * Read file as text
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error(t('csv.errors.readFailed') || 'Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Download CSV content as file
     */
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Download data as CSV file (legacy format)
     */
    downloadCSVLegacy(data, filename) {
        const content = this.generateCSV(data.headers, data.rows);
        this.downloadCSV(content, filename);
    }
}

export const csvService = new CSVService();
export default csvService;

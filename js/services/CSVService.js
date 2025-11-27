/**
 * CSV parsing and generation service
 */
class CSVService {
    /**
     * Parse CSV file
     */
    async parseCSV(file) {
        const text = await this.readFile(file);
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            throw new Error('CSV file is empty or has no data rows');
        }
        
        const headers = this.parseCSVLine(lines[0]);
        const type = this.detectType(headers);
        
        const result = {
            type,
            data: [],
            errors: []
        };
        
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this.parseCSVLine(lines[i]);
                const item = this.validateAndTransform(type, headers, values, i + 1);
                if (item) {
                    result.data.push(item);
                }
            } catch (error) {
                result.errors.push({
                    row: i + 1,
                    message: error.message,
                    suggestion: this.getSuggestion(error.message)
                });
            }
        }
        
        return result;
    }
    
    /**
     * Parse a CSV line handling quotes
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
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
     * Detect exercise type from headers
     */
    detectType(headers) {
        const headerStr = headers.join(',').toLowerCase();
        
        // Check for exercise_type column to determine format
        if (headers.some(h => h.toLowerCase().includes('exercise_type'))) {
            return 'multi_type'; // New format with type column
        }
        
        if (headerStr.includes('image') || headerStr.includes('picture') || headerStr.includes('word')) {
            // Check if it's specifically naming by looking for options
            if (headerStr.includes('option')) {
                return 'imageword'; // Unified image-word format
            }
        }
        
        if (headerStr.includes('sentence')) {
            return 'sentenceTyping';
        }
        
        if (headerStr.includes('type') || headerStr.includes('rhym') || headerStr.includes('synonym')) {
            return 'words';
        }
        
        // Default to image-word if has word column
        if (headerStr.includes('word')) {
            return 'imageword';
        }
        
        throw new Error('Cannot detect exercise type from headers. Please use template.');
    }
    
    /**
     * Validate and transform row based on type
     */
    validateAndTransform(type, headers, values, rowNum) {
        // Pad values array if too short
        while (values.length < headers.length) {
            values.push('');
        }
        
        if (type === 'multi_type') {
            return this.transformMultiType(headers, values);
        } else if (type === 'imageword' || type === 'naming') {
            return this.transformImageWord(values);
        } else if (type === 'sentenceTyping') {
            return this.transformSentence(values);
        } else if (type === 'words') {
            return this.transformWords(values);
        }
        
        throw new Error('Unknown exercise type');
    }
    
    transformMultiType(headers, values) {
        const exerciseTypeIndex = headers.findIndex(h => h.toLowerCase().includes('exercise_type'));
        const exerciseType = values[exerciseTypeIndex]?.toLowerCase().trim();
        
        if (!exerciseType) {
            throw new Error('exercise_type is required');
        }
        
        // Remove exercise type from values for processing
        const dataValues = values.map((v, i) => i === exerciseTypeIndex ? '' : v);
        
        let transformedData;
        if (exerciseType.includes('picture') || exerciseType.includes('typing') || exerciseType.includes('listening') || exerciseType.includes('/')) {
            // Handle combined types like "picture/typing/listening"
            transformedData = this.transformImageWord(dataValues.filter(v => v !== ''));
            // Return as multiple exercise types
            if (exerciseType.includes('/')) {
                transformedData.exerciseType = 'multiple';
                transformedData.applicableTypes = ['naming', 'typing', 'listening'];
            } else if (exerciseType.includes('picture') || exerciseType === 'naming') {
                transformedData.exerciseType = 'naming';
            } else if (exerciseType === 'typing') {
                transformedData.exerciseType = 'typing';
            } else if (exerciseType === 'listening') {
                transformedData.exerciseType = 'listening';
            }
        } else if (exerciseType === 'sentencetyping' || exerciseType === 'sentence') {
            transformedData = this.transformSentence(dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'sentenceTyping';
        } else if (exerciseType === 'workingmemory' || exerciseType === 'working_memory' || exerciseType === 'workingMemory') {
            transformedData = this.transformWorkingMemory(dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'workingMemory';
        } else if (exerciseType === 'category' || exerciseType === 'categories') {
            transformedData = this.transformCategory(dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'category';
        } else if (exerciseType === 'timesequencing' || exerciseType === 'time_sequencing' || exerciseType === 'timeSequencing') {
            transformedData = this.transformTimeSequencing(dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'timeSequencing';
        } else if (exerciseType === 'clockmatching' || exerciseType === 'clock_matching' || exerciseType === 'clockMatching') {
            transformedData = this.transformClockMatching(dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'clockMatching';
        } else if (exerciseType === 'timeordering' || exerciseType === 'time_ordering' || exerciseType === 'timeOrdering') {
            transformedData = this.transformTimeOrdering(dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'timeOrdering';
        } else if (exerciseType === 'firstsound' || exerciseType === 'first_sound' || exerciseType === 'firstSound') {
            transformedData = this.transformGenericExercise('firstsound', dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'firstSound';
        } else if (exerciseType === 'rhyming') {
            transformedData = this.transformGenericExercise('rhyming', dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'rhyming';
        } else if (exerciseType === 'association') {
            transformedData = this.transformGenericExercise('association', dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'association';
        } else if (exerciseType === 'synonyms') {
            transformedData = this.transformGenericExercise('synonyms', dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'synonyms';
        } else if (exerciseType === 'definitions') {
            transformedData = this.transformGenericExercise('definitions', dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'definitions';
        } else if (exerciseType === 'scramble') {
            transformedData = this.transformGenericExercise('scramble', dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'scramble';
        } else if (exerciseType === 'speaking') {
            transformedData = this.transformGenericExercise('speaking', dataValues.filter(v => v !== ''));
            transformedData.exerciseType = 'speaking';
        } else {
            // Default to generic word exercise handler
            transformedData = this.transformGenericExercise(exerciseType, dataValues.filter(v => v !== ''));
            transformedData.exerciseType = exerciseType;
        }
        
        return transformedData;
    }
    
    transformImageWord(values) {
        const [word, imageEmojiUrl, ...options] = values;
        
        if (!word || !word.trim()) {
            throw new Error('Word is required');
        }
        
        const exercise = {
            answer: word.toLowerCase().trim(),
            difficulty: values[values.length - 1] || 'medium', // Last column should be difficulty
            isCustom: true
        };
        
        // Handle image/emoji/URL
        if (imageEmojiUrl && imageEmojiUrl.trim()) {
            const imgData = imageEmojiUrl.trim();
            if (imgData.startsWith('http')) {
                exercise.imageUrl = imgData;
            } else if (/[\u{1F600}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u.test(imgData)) {
                exercise.emoji = imgData;
            } else {
                exercise.imageUrl = imgData; // Assume it's a URL
            }
        }
        
        // Options are optional - will auto-generate if not provided
        const validOptions = options.slice(0, -1).filter(o => o && o.trim()); // Exclude last column (difficulty)
        if (validOptions.length > 0) {
            exercise.options = [word.toLowerCase().trim(), ...validOptions.map(o => o.toLowerCase().trim())];
        }
        
        return exercise;
    }
    
    transformSentence(values) {
        const cleanValues = values.filter(v => v && v.trim());
        const difficulty = cleanValues[cleanValues.length - 1] || 'easy';
        const [sentence, answer] = cleanValues;
        
        if (!sentence || !sentence.trim()) {
            throw new Error('Sentence is required');
        }
        
        if (!answer || !answer.trim()) {
            throw new Error('Answer is required');
        }
        
        // Check for blank marker
        const sentenceText = sentence.trim();
        if (!sentenceText.includes('__') && !sentenceText.includes('___')) {
            throw new Error('Sentence must contain blank marker (__)');
        }
        
        return {
            sentence: sentenceText,
            answer: answer.toLowerCase().trim(),
            difficulty,
            isCustom: true
        };
    }
    
    transformWorkingMemory(values) {
        const [sequence, extraOptionsStr, ...rest] = values;
        const difficulty = rest[rest.length - 1] || 'easy';
        
        if (!sequence || !sequence.trim()) {
            throw new Error('Sequence is required for working memory');
        }
        
        if (!extraOptionsStr || !extraOptionsStr.trim()) {
            throw new Error('Extra options are required for working memory');
        }
        
        // Parse emojis from sequence string - handle both individual emojis and emoji strings
        const sequenceArray = [...sequence].filter(char => 
            /[\p{Emoji_Presentation}\p{Emoji}]/gu.test(char) && 
            char !== '\uFE0F' // Remove variation selectors
        ).slice(0, 3);
        
        // Parse extra options
        const extraOptions = [...extraOptionsStr].filter(char => 
            /[\p{Emoji_Presentation}\p{Emoji}]/gu.test(char) && 
            char !== '\uFE0F' // Remove variation selectors
        );
        
        if (sequenceArray.length !== 3) {
            throw new Error(`Working memory sequence must have exactly 3 emojis, found ${sequenceArray.length}: ${sequenceArray.join('')}`);
        }
        
        if (extraOptions.length < 3) {
            throw new Error(`Working memory must have at least 3 extra options, found ${extraOptions.length}: ${extraOptions.join('')}`);
        }
        
        return {
            sequence: sequenceArray,
            options: [...sequenceArray, ...extraOptions],
            difficulty,
            isCustom: true
        };
    }
    
    transformCategory(values) {
        const [category, correct, ...optionValues] = values;
        const difficulty = values[values.length - 1] || 'easy';
        
        if (!category || !category.trim()) {
            throw new Error('Category name is required');
        }
        
        if (!correct || !correct.trim()) {
            throw new Error('Correct answer is required');
        }
        
        // Filter out difficulty and empty values to get pure options
        const options = optionValues.filter(o => o && o.trim() && o !== difficulty).map(o => o.toLowerCase().trim());
        if (options.length < 2) {
            throw new Error('At least 2 wrong options required for category');
        }
        
        // Include the correct answer in the options array as first item
        const allOptions = [correct.toLowerCase().trim(), ...options];
        
        return {
            category: category.toLowerCase().trim(),
            word: correct.toLowerCase().trim(),
            options: allOptions,
            difficulty,
            isCustom: true
        };
    }
    
    transformTimeSequencing(values) {
        // Filter out empty values first
        const cleanValues = values.filter(v => v && v.trim() !== '');
        const difficulty = cleanValues[cleanValues.length - 1] || 'easy';
        
        // Remove difficulty from values for processing
        const dataValues = cleanValues.slice(0, -1);
        const [question, correct, ...wrong] = dataValues;
        
        if (!question || !question.trim()) {
            throw new Error('Question is required for time sequencing');
        }
        
        if (!correct || !correct.trim()) {
            throw new Error('Correct answer is required');
        }
        
        const wrongOptions = wrong.filter(w => w && w.trim()).map(w => w.trim());
        if (wrongOptions.length < 3) {
            throw new Error('At least 3 wrong options required for time sequencing');
        }
        
        return {
            question: question.trim(),
            answer: correct.trim(),
            options: [correct.trim(), ...wrongOptions],
            difficulty,
            isCustom: true
        };
    }
    
    transformClockMatching(values) {
        const cleanValues = values.filter(v => v && v.trim() !== '');
        const difficulty = cleanValues[cleanValues.length - 1] || 'easy';
        
        // Remove difficulty from processing
        const dataValues = cleanValues.slice(0, -1);
        const [timeStr, timeWords] = dataValues;
        
        if (!timeStr || !timeStr.trim()) {
            throw new Error('Time is required for clock matching');
        }
        
        if (!timeWords || !timeWords.trim()) {
            throw new Error('Time words are required');
        }
        
        // Parse time string (e.g., "3:00")
        const timeParts = timeStr.trim().split(':');
        if (timeParts.length !== 2) {
            throw new Error('Time must be in HH:MM format');
        }
        
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        
        if (isNaN(hour) || isNaN(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
            throw new Error('Invalid time values');
        }
        
        // Calculate analog clock angles
        const minuteAngle = minute * 6; // 6 degrees per minute
        const hourAngle = (hour % 12) * 30 + (minute * 0.5); // 30 degrees per hour + minute adjustment
        
        return {
            id: `${hour}_${minute}`,
            time: timeStr.trim(),
            hour,
            minute,
            digitalDisplay: timeStr.trim(),
            analogData: { hourAngle, minuteAngle },
            timeWords: timeWords.trim(),
            difficulty,
            isCustom: true
        };
    }
    
    transformTimeOrdering(values) {
        const cleanValues = values.filter(v => v && v.trim() !== '');
        const difficulty = cleanValues[cleanValues.length - 1] || 'easy';
        
        // Remove difficulty from processing
        const dataValues = cleanValues.slice(0, -1);
        const [scenario, description, ...activities] = dataValues;
        
        if (!scenario || !scenario.trim()) {
            throw new Error('Scenario is required for time ordering');
        }
        
        const activityList = activities.filter(a => a && a.trim()).map(a => a.trim());
        if (activityList.length < 3) {
            throw new Error('At least 3 activities required for time ordering');
        }
        
        return {
            id: scenario.toLowerCase().replace(/\s+/g, '_'),
            scenario: scenario.trim(),
            description: description?.trim() || 'Put these activities in the correct time order',
            items: activityList,
            correctOrder: activityList, // Assume CSV provides them in correct order
            difficulty,
            isCustom: true
        };
    }
    
    transformGenericExercise(exerciseType, values) {
        const difficulty = values[values.length - 1] || 'easy';
        
        // Handle different exercise types generically
        switch(exerciseType) {
            case 'speaking':
                const cleanSpeakingValues = values.filter(v => v && v.trim() && v !== difficulty);
                const [word, emoji, ...phrases] = cleanSpeakingValues;
                return {
                    answer: word?.toLowerCase().trim() || '',
                    emoji: emoji?.trim() || '',
                    phrases: phrases.filter(p => p && p.trim()).map(p => p.trim()),
                    difficulty,
                    isCustom: true
                };
                
            case 'firstsound':
            case 'first_sound':
            case 'firstSound':
                const [sound, ...wordValues] = values.filter(v => v && v.trim() && v !== difficulty);
                const words = wordValues.map(w => w.trim().toLowerCase()).filter(w => w);
                if (words.length < 4) {
                    throw new Error('First Sound exercises need at least 4 words');
                }
                return {
                    sound: sound.toLowerCase().trim(),
                    words,
                    difficulty,
                    isCustom: true
                };
                
            case 'rhyming':
                const [rhymeWord, ...rhymeValues] = values.filter(v => v && v.trim() && v !== difficulty);
                if (rhymeValues.length < 5) {
                    throw new Error('Rhyming exercises need at least 2 rhyming words and 3 non-rhyming words (5 total) to create 4 options');
                }
                // Assume first 2 are rhymes, rest are non-rhymes
                const rhymes = rhymeValues.slice(0, 2).map(w => w.trim().toLowerCase()).filter(w => w);
                const nonRhymes = rhymeValues.slice(2).map(w => w.trim().toLowerCase()).filter(w => w);
                
                if (rhymes.length < 2 || nonRhymes.length < 3) {
                    throw new Error('Rhyming exercises need at least 2 rhyming words and 3 non-rhyming words');
                }
                
                return {
                    word: rhymeWord.toLowerCase().trim(),
                    rhymes,
                    nonRhymes,
                    difficulty,
                    isCustom: true
                };
                
            case 'association':
                const [assocWord, ...assocValues] = values.filter(v => v && v.trim() && v !== difficulty);
                if (assocValues.length < 5) {
                    throw new Error('Association exercises need at least 2 related words and 3 unrelated words (5 total) to create 4 options');
                }
                // Assume first 2 are associated, rest are unrelated
                const associated = assocValues.slice(0, 2).map(w => w.trim().toLowerCase()).filter(w => w);
                const unrelated = assocValues.slice(2).map(w => w.trim().toLowerCase()).filter(w => w);
                
                if (associated.length < 2 || unrelated.length < 3) {
                    throw new Error('Association exercises need at least 2 related words and 3 unrelated words');
                }
                
                return {
                    word: assocWord.toLowerCase().trim(),
                    associated,
                    unrelated,
                    difficulty,
                    isCustom: true
                };
                
            case 'synonyms':
                const [synWord, ...synValues] = values.filter(v => v && v.trim() && v !== difficulty);
                if (synValues.length < 5) {
                    throw new Error('Synonym exercises need at least 2 synonyms and 3 antonyms (5 total) to create 4 options');
                }
                // Assume first 2 are synonyms, rest are antonyms
                const synonyms = synValues.slice(0, 2).map(w => w.trim().toLowerCase()).filter(w => w);
                const antonyms = synValues.slice(2).map(w => w.trim().toLowerCase()).filter(w => w);
                
                if (synonyms.length < 2 || antonyms.length < 3) {
                    throw new Error('Synonym exercises need at least 2 synonyms and 3 antonyms');
                }
                
                return {
                    word: synWord.toLowerCase().trim(),
                    synonyms,
                    antonyms,
                    difficulty,
                    isCustom: true
                };
                
            case 'definitions':
                const cleanDefValues = values.filter(v => v && v.trim() && v !== difficulty);
                const [defWord, definition] = cleanDefValues;
                if (!defWord || !definition) {
                    throw new Error('Both word and definition are required');
                }
                return {
                    word: defWord.toLowerCase().trim(),
                    definition: definition.trim(),
                    difficulty,
                    isCustom: true
                };
                
            case 'scramble':
                const [sentence] = values.filter(v => v && v.trim() && v !== difficulty);
                if (!sentence || !sentence.trim()) {
                    throw new Error('Sentence is required for scramble exercises');
                }
                return {
                    sentence: sentence.trim(),
                    words: sentence.trim().split(' ').filter(w => w), // Split into words for scrambling
                    difficulty,
                    isCustom: true
                };
                
            default:
                throw new Error(`Unknown exercise type: ${exerciseType}`);
        }
    }
    
    transformWords(values) {
        const [type, word, relatedWords] = values;
        
        if (!type || !type.trim()) {
            throw new Error('Exercise type is required (rhyming/synonyms/association)');
        }
        
        if (!word || !word.trim()) {
            throw new Error('Word is required');
        }
        
        const exerciseType = type.toLowerCase().trim();
        const validTypes = ['rhyming', 'synonyms', 'association'];
        
        if (!validTypes.includes(exerciseType)) {
            throw new Error(`Type must be one of: ${validTypes.join(', ')}`);
        }
        
        // Parse related words (pipe or comma separated)
        let related = [];
        if (relatedWords && relatedWords.trim()) {
            if (relatedWords.includes('|')) {
                related = relatedWords.split('|').map(w => w.trim().toLowerCase());
            } else {
                related = relatedWords.split(',').map(w => w.trim().toLowerCase());
            }
        }
        
        if (related.length === 0) {
            throw new Error('At least one related word is required');
        }
        
        // Store in the format expected by exercises
        const exercise = {
            word: word.toLowerCase().trim(),
            isCustom: true
        };
        
        // Add related words based on type
        if (exerciseType === 'rhyming') {
            exercise.rhymes = related;
        } else if (exerciseType === 'synonyms') {
            exercise.synonyms = related;
        } else if (exerciseType === 'association') {
            exercise.associated = related;
        }
        
        return exercise;
    }
    
    /**
     * Get helpful suggestion for error
     */
    getSuggestion(error) {
        const errorLower = error.toLowerCase();
        
        if (errorLower.includes('blank marker')) {
            return 'Use __ (two underscores) to mark where the answer goes in the sentence';
        }
        if (errorLower.includes('required')) {
            return 'Make sure all required fields are filled. Check the template for examples.';
        }
        if (errorLower.includes('type must be')) {
            return 'For word exercises, type must be: rhyming, synonyms, or association';
        }
        if (errorLower.includes('related word')) {
            return 'Add related words separated by commas or pipes (|)';
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
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    /**
     * Download CSV file
     */
    downloadCSV(data, filename) {
        const csv = [
            data.headers.join(','),
            ...data.rows.map(row => row.map(cell => {
                // Quote cells that contain commas
                const cellStr = String(cell || '');
                return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export const csvService = new CSVService();
export default csvService;
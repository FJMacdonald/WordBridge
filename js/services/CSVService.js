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
        
        if (lines.length < 1) {
            throw new Error('CSV file is empty');
        }
        
        // Check if first line is a header by looking for 'exercise_type' or 'data1' etc
        const firstLine = this.parseCSVLine(lines[0]);
        let startIndex = 0;
        
        // If first line contains header-like values, skip it
        if (firstLine.some(val => 
            val.toLowerCase().includes('exercise_type') || 
            val.toLowerCase().includes('difficulty') || 
            val.toLowerCase().includes('data'))) {
            startIndex = 1;
        }
        
        if (startIndex >= lines.length) {
            throw new Error('CSV file has no data rows (only header found)');
        }
        
        const result = {
            type: 'multi_type',
            data: [],
            errors: []
        };
        
        // Process each row independently
        for (let i = startIndex; i < lines.length; i++) {
            try {
                const values = this.parseCSVLine(lines[i]);
                if (values.length === 0 || (values.length === 1 && !values[0])) {
                    continue; // Skip empty rows
                }
                
                const item = this.transformRow(values, i + 1);
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
     * Transform a single row based on exercise_type in first column
     */
    transformRow(values, rowNum) {
        // Exercise type is always first column, difficulty is second
        const exerciseType = values[0]?.toLowerCase().trim();
        const difficulty = values[1]?.toLowerCase().trim() || 'easy';
        
        if (!exerciseType) {
            throw new Error('Exercise type is required in first column');
        }
        
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            throw new Error('Difficulty must be easy, medium, or hard');
        }
        
        // Get data values starting from column 3 (after exercise_type and difficulty)
        const dataValues = values.slice(2);
        
        // Transform based on exercise type
        return this.transformExerciseData(exerciseType, difficulty, dataValues);
    }
    
    transformExerciseData(exerciseType, difficulty, dataValues) {
        
        let transformedData;
        
        // Check for sentenceTyping FIRST (must come before generic 'typing' check)
        if (exerciseType === 'sentencetyping' || exerciseType === 'sentence') {
            transformedData = this.transformSentence(dataValues, difficulty);
            transformedData.exerciseType = 'sentenceTyping';
        } else if (exerciseType.includes('picture') || exerciseType === 'typing' || exerciseType.includes('listening') || exerciseType.includes('/') || exerciseType === 'naming') {
            // Handle combined types like "picture/typing/listening"
            transformedData = this.transformImageWord(dataValues, difficulty);
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
        } else if (exerciseType === 'workingmemory' || exerciseType === 'working_memory' || exerciseType === 'workingMemory') {
            transformedData = this.transformWorkingMemory(dataValues, difficulty);
            transformedData.exerciseType = 'workingMemory';
        } else if (exerciseType === 'category' || exerciseType === 'categories') {
            transformedData = this.transformCategory(dataValues, difficulty);
            transformedData.exerciseType = 'category';
        } else if (exerciseType === 'timesequencing' || exerciseType === 'time_sequencing' || exerciseType === 'timeSequencing') {
            transformedData = this.transformTimeSequencing(dataValues, difficulty);
            transformedData.exerciseType = 'timeSequencing';
        } else if (exerciseType === 'clockmatching' || exerciseType === 'clock_matching' || exerciseType === 'clockMatching') {
            transformedData = this.transformClockMatching(dataValues, difficulty);
            transformedData.exerciseType = 'clockMatching';
        } else if (exerciseType === 'timeordering' || exerciseType === 'time_ordering' || exerciseType === 'timeOrdering') {
            transformedData = this.transformTimeOrdering(dataValues, difficulty);
            transformedData.exerciseType = 'timeOrdering';
        } else if (exerciseType === 'firstsound' || exerciseType === 'first_sound' || exerciseType === 'firstSound') {
            transformedData = this.transformGenericExercise('firstsound', dataValues, difficulty);
            transformedData.exerciseType = 'firstSound';
        } else if (exerciseType === 'rhyming') {
            transformedData = this.transformGenericExercise('rhyming', dataValues, difficulty);
            transformedData.exerciseType = 'rhyming';
        } else if (exerciseType === 'association') {
            transformedData = this.transformGenericExercise('association', dataValues, difficulty);
            transformedData.exerciseType = 'association';
        } else if (exerciseType === 'synonyms' || exerciseType === 'synonym') {
            transformedData = this.transformGenericExercise('synonyms', dataValues, difficulty);
            transformedData.exerciseType = 'synonyms';
        } else if (exerciseType === 'definitions' || exerciseType === 'definition') {
            transformedData = this.transformGenericExercise('definitions', dataValues, difficulty);
            transformedData.exerciseType = 'definitions';
        } else if (exerciseType === 'scramble') {
            transformedData = this.transformGenericExercise('scramble', dataValues, difficulty);
            transformedData.exerciseType = 'scramble';
        } else if (exerciseType === 'speaking') {
            transformedData = this.transformGenericExercise('speaking', dataValues, difficulty);
            transformedData.exerciseType = 'speaking';
        } else {
            // Default to generic word exercise handler
            transformedData = this.transformGenericExercise(exerciseType, dataValues, difficulty);
            transformedData.exerciseType = exerciseType;
        }
        
        return transformedData;
    }
    
    transformImageWord(values, difficulty = 'easy') {
        const [word, imageEmojiUrl, ...options] = values;
        
        if (!word || !word.trim()) {
            throw new Error('Word is required');
        }
        
        const exercise = {
            answer: word.toLowerCase().trim(),
            difficulty: difficulty,
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
        const validOptions = options.filter(o => o && o.trim());
        if (validOptions.length > 0) {
            exercise.options = [word.toLowerCase().trim(), ...validOptions.map(o => o.toLowerCase().trim())];
        }
        
        return exercise;
    }
    
    transformSentence(values, difficulty = 'easy') {
        const cleanValues = values.filter(v => v && v.trim());
        const [sentence, answer] = cleanValues;
        
        if (!sentence || !sentence.trim()) {
            throw new Error('Sentence is required');
        }
        
        if (!answer || !answer.trim()) {
            throw new Error('Answer is required');
        }
        
        // Check for blank marker - accept ?, __, ___, or even a single _
        let sentenceText = sentence.trim();
        
        // Look for any of these patterns as blank markers
        const hasBlank = sentenceText.includes('?') || 
                        sentenceText.includes('__') || 
                        sentenceText.includes('___') ||
                        sentenceText.includes('_');
        
        if (!hasBlank) {
            throw new Error('Sentence must contain blank marker (? or _ or __)');
        }
        
        // Normalize blank markers to __
        // Replace standalone ? (not followed by letters/punctuation except space)
        sentenceText = sentenceText.replace(/\?(?!\w)/g, '__');
        // Replace single or multiple underscores with double underscore
        sentenceText = sentenceText.replace(/_{1,}/g, '__');
        
        return {
            sentence: sentenceText,
            answer: answer.toLowerCase().trim(),
            difficulty,
            isCustom: true
        };
    }
    
    transformWorkingMemory(values, difficulty = 'easy') {
        const [sequence, extraOptionsStr] = values;
        
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
    
    transformCategory(values, difficulty = 'easy') {
        const [category, correct, ...optionValues] = values;
        
        if (!category || !category.trim()) {
            throw new Error('Category name is required');
        }
        
        if (!correct || !correct.trim()) {
            throw new Error('Correct answer is required');
        }
        
        // Filter out empty values to get pure options
        const options = optionValues.filter(o => o && o.trim()).map(o => o.toLowerCase().trim());
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
    
    transformTimeSequencing(values, difficulty = 'easy') {
        // Filter out empty values first
        const cleanValues = values.filter(v => v && v.trim() !== '');
        const [question, correct, wrongOptionsStr] = cleanValues;
        
        if (!question || !question.trim()) {
            throw new Error('Question is required for time sequencing');
        }
        
        if (!correct || !correct.trim()) {
            throw new Error('Correct answer is required');
        }
        
        // Parse wrong options (can be comma or pipe separated)
        let wrongOptions = [];
        if (wrongOptionsStr && wrongOptionsStr.trim()) {
            if (wrongOptionsStr.includes(',')) {
                wrongOptions = wrongOptionsStr.split(',').map(w => w.trim()).filter(w => w);
            } else if (wrongOptionsStr.includes('|')) {
                wrongOptions = wrongOptionsStr.split('|').map(w => w.trim()).filter(w => w);
            } else {
                wrongOptions = [wrongOptionsStr.trim()];
            }
        }
        
        if (wrongOptions.length < 3) {
            throw new Error('At least 3 wrong options required for time sequencing (separate with commas or |)');
        }
        
        return {
            question: question.trim(),
            answer: correct.trim(),
            options: [correct.trim(), ...wrongOptions],
            difficulty,
            isCustom: true
        };
    }
    
    transformClockMatching(values, difficulty = 'easy') {
        const cleanValues = values.filter(v => v && v.trim() !== '');
        const [timeStr, timeWords, wrongTimesStr] = cleanValues;
        
        if (!timeStr || !timeStr.trim()) {
            throw new Error('Time is required for clock matching');
        }
        
        if (!timeWords || !timeWords.trim()) {
            throw new Error('Time words are required');
        }
        
        // Parse wrong times (should be digital times like "4:00|5:00|6:00")
        let wrongTimes = [];
        if (wrongTimesStr && wrongTimesStr.trim()) {
            if (wrongTimesStr.includes(',')) {
                wrongTimes = wrongTimesStr.split(',').map(w => w.trim()).filter(w => w);
            } else if (wrongTimesStr.includes('|')) {
                wrongTimes = wrongTimesStr.split('|').map(w => w.trim()).filter(w => w);
            } else {
                wrongTimes = [wrongTimesStr.trim()];
            }
        }
        
        if (wrongTimes.length < 3) {
            throw new Error('Clock matching exercises need at least 3 wrong times (e.g., 4:00|5:00|6:00)');
        }
        
        // Helper function to parse time and create clock data
        const parseTimeToClockData = (timeString) => {
            const timeParts = timeString.trim().split(':');
            if (timeParts.length !== 2) {
                throw new Error(`Time must be in HH:MM format: ${timeString}`);
            }
            
            const hour = parseInt(timeParts[0]);
            const minute = parseInt(timeParts[1]);
            
            if (isNaN(hour) || isNaN(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
                throw new Error(`Invalid time values: ${timeString}`);
            }
            
            // Calculate analog clock angles
            const minuteAngle = minute * 6; // 6 degrees per minute
            const hourAngle = (hour % 12) * 30 + (minute * 0.5); // 30 degrees per hour + minute adjustment
            
            return {
                time: timeString.trim(),
                hour,
                minute,
                analogData: { hourAngle, minuteAngle }
            };
        };
        
        // Parse main time
        const mainClock = parseTimeToClockData(timeStr);
        
        // Parse wrong times and create clock data for them
        const wrongClocks = wrongTimes.map(t => parseTimeToClockData(t));
        
        return {
            id: `${mainClock.hour}_${mainClock.minute}`,
            time: mainClock.time,
            hour: mainClock.hour,
            minute: mainClock.minute,
            digitalDisplay: mainClock.time,
            analogData: mainClock.analogData,
            timeWords: timeWords.trim(),
            wrongClocks: wrongClocks, // Store wrong clock data for analog display
            difficulty,
            isCustom: true
        };
    }
    
    transformTimeOrdering(values, difficulty = 'easy') {
        const cleanValues = values.filter(v => v && v.trim() !== '');
        const [scenario, ...activities] = cleanValues;
        
        if (!scenario || !scenario.trim()) {
            throw new Error('Scenario is required for time ordering');
        }
        
        // First activity might be description, rest are the actual activities
        let description = 'Put these activities in the correct time order';
        let activityList = activities;
        
        // Check if first activity looks like a description (contains "order" or is longer)
        if (activities.length > 0 && (activities[0].toLowerCase().includes('order') || activities[0].length > 50)) {
            description = activities[0].trim();
            activityList = activities.slice(1);
        }
        
        activityList = activityList.filter(a => a && a.trim()).map(a => a.trim());
        
        if (activityList.length < 3) {
            throw new Error('At least 3 activities required for time ordering');
        }
        
        return {
            id: scenario.toLowerCase().replace(/\s+/g, '_'),
            scenario: scenario.trim(),
            description: description,
            items: activityList,
            correctOrder: activityList, // Assume CSV provides them in correct order
            difficulty,
            isCustom: true
        };
    }
    
    transformGenericExercise(exerciseType, values, difficulty = 'easy') {
        
        // Handle different exercise types generically
        switch(exerciseType) {
            case 'speaking':
                const cleanSpeakingValues = values.filter(v => v && v.trim());
                const [word, emojiOrUrl, ...phrases] = cleanSpeakingValues;
                
                const speakingExercise = {
                    answer: word?.toLowerCase().trim() || '',
                    phrases: phrases.filter(p => p && p.trim()).map(p => p.trim()),
                    difficulty,
                    isCustom: true
                };
                
                // Check if emoji or URL
                if (emojiOrUrl && emojiOrUrl.trim()) {
                    const visual = emojiOrUrl.trim();
                    if (visual.startsWith('http') || visual.startsWith('https')) {
                        speakingExercise.imageUrl = visual;
                    } else {
                        speakingExercise.emoji = visual;
                    }
                }
                
                return speakingExercise;
                
            case 'firstsound':
            case 'first_sound':
            case 'firstSound':
                const [sound, correctWord, ...wrongWords] = values.filter(v => v && v.trim());
                
                if (!sound || !correctWord) {
                    throw new Error('First Sound exercises need a sound and at least one word that starts with it');
                }
                
                // Parse wrong words (can be comma or pipe separated)
                let nonMatchingWords = [];
                if (wrongWords.length > 0 && wrongWords[0]) {
                    const wrongStr = wrongWords[0];
                    if (wrongStr.includes(',')) {
                        nonMatchingWords = wrongStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else if (wrongStr.includes('|')) {
                        nonMatchingWords = wrongStr.split('|').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else {
                        nonMatchingWords = wrongWords.filter(w => w).map(w => w.trim().toLowerCase());
                    }
                }
                
                if (nonMatchingWords.length < 3) {
                    throw new Error('First Sound exercises need at least 3 words that do NOT start with the target sound');
                }
                
                return {
                    sound: sound.toLowerCase().trim(),
                    correctWord: correctWord.toLowerCase().trim(),
                    words: [correctWord.toLowerCase().trim()], // For compatibility
                    wrongWords: nonMatchingWords,
                    options: [correctWord.toLowerCase().trim(), ...nonMatchingWords], // All options
                    difficulty,
                    isCustom: true
                };
                
            case 'rhyming':
                const [rhymeWord, ...rhymeValues] = values.filter(v => v && v.trim());
                // Parse rhyming words - can be comma or pipe separated in first column
                let rhymes = [];
                let nonRhymes = [];
                
                if (rhymeValues.length > 0 && rhymeValues[0]) {
                    // First value after word contains rhyming words
                    const rhymeStr = rhymeValues[0];
                    if (rhymeStr.includes(',')) {
                        rhymes = rhymeStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else if (rhymeStr.includes('|')) {
                        rhymes = rhymeStr.split('|').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else {
                        rhymes = [rhymeStr.trim().toLowerCase()];
                    }
                }
                
                // Second value contains non-rhyming words
                if (rhymeValues.length > 1 && rhymeValues[1]) {
                    const nonRhymeStr = rhymeValues[1];
                    if (nonRhymeStr.includes(',')) {
                        nonRhymes = nonRhymeStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else if (nonRhymeStr.includes('|')) {
                        nonRhymes = nonRhymeStr.split('|').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else {
                        nonRhymes = [nonRhymeStr.trim().toLowerCase()];
                    }
                }
                
                if (rhymes.length < 1) {
                    throw new Error('Rhyming exercises need at least 1 word that rhymes with the target word');
                }
                if (nonRhymes.length < 3) {
                    throw new Error('Rhyming exercises need at least 3 non-rhyming words for incorrect options');
                }
                
                return {
                    word: rhymeWord.toLowerCase().trim(),
                    rhymes,
                    nonRhymes,
                    difficulty,
                    isCustom: true
                };
                
            case 'association':
                const [assocWord, ...assocValues] = values.filter(v => v && v.trim());
                // Parse associated words - can be comma or pipe separated in first column
                let associated = [];
                let unrelated = [];
                
                if (assocValues.length > 0 && assocValues[0]) {
                    // First value after word contains associated/related words
                    const assocStr = assocValues[0];
                    if (assocStr.includes(',')) {
                        associated = assocStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else if (assocStr.includes('|')) {
                        associated = assocStr.split('|').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else {
                        associated = [assocStr.trim().toLowerCase()];
                    }
                }
                
                // Second value contains unrelated words
                if (assocValues.length > 1 && assocValues[1]) {
                    const unrelatedStr = assocValues[1];
                    if (unrelatedStr.includes(',')) {
                        unrelated = unrelatedStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else if (unrelatedStr.includes('|')) {
                        unrelated = unrelatedStr.split('|').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else {
                        unrelated = [unrelatedStr.trim().toLowerCase()];
                    }
                }
                
                if (associated.length < 1) {
                    throw new Error('Association exercises need at least 1 word that is related/associated with the target word');
                }
                if (unrelated.length < 3) {
                    throw new Error('Association exercises need at least 3 unrelated words for incorrect options');
                }
                
                return {
                    word: assocWord.toLowerCase().trim(),
                    associated,
                    unrelated,
                    difficulty,
                    isCustom: true
                };
                
            case 'synonyms':
            case 'synonym':
                const [synWord, typeIndicator, correctWord2, ...wrongWords2] = values.filter(v => v && v.trim());
                
                // Parse type indicator (true/false, synonym/antonym)
                let isSynonym = true;
                if (typeIndicator) {
                    const typeStr = typeIndicator.toLowerCase().trim();
                    // Accept true/false format
                    if (typeStr === 'false' || typeStr === '0' || typeStr === 'no') {
                        isSynonym = false;
                    } else if (typeStr === 'true' || typeStr === '1' || typeStr === 'yes') {
                        isSynonym = true;
                    }
                    // Also accept legacy format
                    else if (typeStr === 'antonym' || typeStr === 'opposite') {
                        isSynonym = false;
                    } else if (typeStr === 'synonym') {
                        isSynonym = true;
                    }
                }
                
                // Parse wrong words (can be comma or pipe separated)
                let wrongWordOptions = [];
                if (wrongWords2.length > 0 && wrongWords2[0]) {
                    const wrongStr = wrongWords2[0];
                    if (wrongStr.includes(',')) {
                        wrongWordOptions = wrongStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else if (wrongStr.includes('|')) {
                        wrongWordOptions = wrongStr.split('|').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else {
                        wrongWordOptions = wrongWords2.filter(w => w).map(w => w.trim().toLowerCase());
                    }
                }
                
                if (!correctWord2 || !correctWord2.trim()) {
                    throw new Error('Synonym/Antonym exercises need a correct answer word');
                }
                
                if (wrongWordOptions.length < 3) {
                    throw new Error('Synonym/Antonym exercises need at least 3 wrong options');
                }
                
                // Store in format expected by exercise
                return {
                    word: synWord.toLowerCase().trim(),
                    synonyms: isSynonym ? [correctWord2.toLowerCase().trim()] : wrongWordOptions,
                    antonyms: isSynonym ? wrongWordOptions : [correctWord2.toLowerCase().trim()],
                    questionType: isSynonym ? 'synonym' : 'antonym',
                    difficulty,
                    isCustom: true
                };
                
            case 'definitions':
                const cleanDefValues = values.filter(v => v && v.trim());
                const [defWord, definition, ...wrongOptions] = cleanDefValues;
                if (!defWord || !definition) {
                    throw new Error('Both word and definition are required');
                }
                
                // Parse wrong options (other words that don't match the definition)
                let wrongWords3 = [];
                if (wrongOptions.length > 0 && wrongOptions[0]) {
                    const wrongStr = wrongOptions[0];
                    if (wrongStr.includes(',')) {
                        wrongWords3 = wrongStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else if (wrongStr.includes('|')) {
                        wrongWords3 = wrongStr.split('|').map(w => w.trim().toLowerCase()).filter(w => w);
                    } else {
                        wrongWords3 = wrongOptions.filter(w => w).map(w => w.trim().toLowerCase());
                    }
                }
                
                if (wrongWords3.length < 3) {
                    throw new Error('Definition exercises need at least 3 wrong words for incorrect options');
                }
                
                return {
                    word: defWord.toLowerCase().trim(),
                    definition: definition.trim(),
                    wrongOptions: wrongWords3,
                    difficulty,
                    isCustom: true
                };
                
            case 'scramble':
                const [sentence] = values.filter(v => v && v.trim());
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

    
    /**
     * Get helpful suggestion for error
     */
    getSuggestion(error) {
        const errorLower = error.toLowerCase();
        
        if (errorLower.includes('blank marker')) {
            return 'Use ? or __ to mark where the answer goes in the sentence';
        }
        if (errorLower.includes('required')) {
            return 'Make sure all required fields are filled. Check the template for examples.';
        }
        if (errorLower.includes('first sound')) {
            return 'Provide the target sound, 1 word starting with that sound, and 3 words that do NOT start with it (separated by commas or |)';
        }
        if (errorLower.includes('rhyming')) {
            return 'Provide the target word, 1 word that rhymes, and 3 words that do NOT rhyme (separated by commas or |)';
        }
        if (errorLower.includes('association')) {
            return 'Provide the target word, 1 related word, and 3 unrelated words (separated by commas or |)';
        }
        if (errorLower.includes('synonym')) {
            return 'Provide the target word, 1 synonym, and 3 other words (separated by commas or |)';
        }
        if (errorLower.includes('definition')) {
            return 'Provide the word, its definition, and 3 wrong word options (separated by commas or |)';
        }
        if (errorLower.includes('clock')) {
            return 'Provide the time (HH:MM), the correct time description, and 3 wrong descriptions (separated by commas or |)';
        }
        if (errorLower.includes('exercise type')) {
            return 'First column must contain the exercise type (e.g., sentenceTyping, naming, etc.)';
        }
        if (errorLower.includes('difficulty')) {
            return 'Second column must be: easy, medium, or hard';
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
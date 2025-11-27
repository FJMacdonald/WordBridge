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
        
        if (exerciseType.includes('picture') || exerciseType.includes('typing') || exerciseType.includes('listening')) {
            return {
                type: 'imageword',
                data: this.transformImageWord(values.filter((_, i) => i !== exerciseTypeIndex))
            };
        } else if (exerciseType === 'sentencetyping') {
            return {
                type: 'sentenceTyping', 
                data: this.transformSentence(values.filter((_, i) => i !== exerciseTypeIndex))
            };
        } else {
            return {
                type: exerciseType,
                data: this.transformWords(values.filter((_, i) => i !== exerciseTypeIndex))
            };
        }
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
        const [sentence, answer] = values;
        
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
            isCustom: true
        };
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
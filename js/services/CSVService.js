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
        
        if (headerStr.includes('image') || headerStr.includes('picture')) {
            return 'naming';
        } else if (headerStr.includes('sentence')) {
            return 'sentenceTyping';
        } else if (headerStr.includes('type') || headerStr.includes('rhym') || headerStr.includes('synonym')) {
            return 'words';
        }
        
        throw new Error('Cannot detect exercise type from headers');
    }
    
    /**
     * Validate and transform row based on type
     */
    validateAndTransform(type, headers, values, rowNum) {
        if (values.length < headers.length) {
            throw new Error(`Missing values (expected ${headers.length}, got ${values.length})`);
        }
        
        switch (type) {
            case 'naming':
                return this.transformNaming(values);
            case 'sentenceTyping':
                return this.transformSentence(values);
            case 'words':
                return this.transformWords(values);
        }
    }
    
    transformNaming(values) {
        const [word, imageUrl, ...options] = values;
        
        if (!word) throw new Error('Word is required');
        
        return {
            answer: word.toLowerCase().trim(),
            imageUrl: imageUrl || null,
            options: [word, ...options.filter(o => o)].map(o => o.toLowerCase().trim()),
            isCustom: true
        };
    }
    
    transformSentence(values) {
        const [sentence, answer] = values;
        
        if (!sentence || !answer) {
            throw new Error('Both sentence and answer are required');
        }
        
        if (!sentence.includes('__') && !sentence.includes('___')) {
            throw new Error('Sentence must contain blank marker (__)')
        }
        
        return {
            sentence: sentence.trim(),
            answer: answer.toLowerCase().trim(),
            isCustom: true
        };
    }
    
    transformWords(values) {
        const [type, word, relatedWords] = values;
        
        if (!type || !word) {
            throw new Error('Type and word are required');
        }
        
        const related = relatedWords ? relatedWords.split('|').map(w => w.trim()) : [];
        
        return {
            type: type.toLowerCase().trim(),
            word: word.toLowerCase().trim(),
            related,
            isCustom: true
        };
    }
    
    /**
     * Get helpful suggestion for error
     */
    getSuggestion(error) {
        if (error.includes('blank marker')) {
            return 'Use __ (two underscores) to mark where the answer goes';
        }
        if (error.includes('required')) {
            return 'Make sure all required fields are filled';
        }
        if (error.includes('Missing values')) {
            return 'Check that all columns have values (use commas to separate)';
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
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    /**
     * Download CSV file
     */
    downloadCSV(data, filename) {
        const csv = [
            data.headers.join(','),
            ...data.rows.map(row => row.map(cell => 
                cell.includes(',') ? `"${cell}"` : cell
            ).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

export const csvService = new CSVService();
export default csvService;
// js/services/DataValidationService.js

import { i18n } from '../core/i18n.js';

/**
 * Centralized service for validating exercise data
 * Logs issues for later cleanup and provides validation utilities
 */
class DataValidationService {
    constructor() {
        this.issues = [];
        this.loadIssues();
        
        // Difficulty thresholds by language
        // German words are typically longer, so adjust accordingly
        this.difficultyThresholds = {
            en: { easy: 4, medium: 6 },      // easy: ≤4, medium: 5-6, hard: 7+
            de: { easy: 6, medium: 9 }       // easy: ≤6, medium: 7-9, hard: 10+
        };
    }
    
    /**
     * Load issues from localStorage
     */
    loadIssues() {
        try {
            const stored = localStorage.getItem('wordbank_data_issues');
            this.issues = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load data issues:', e);
            this.issues = [];
        }
    }
    
    /**
     * Save issues to localStorage
     */
    saveIssues() {
        try {
            localStorage.setItem('wordbank_data_issues', JSON.stringify(this.issues));
        } catch (e) {
            console.error('Failed to save data issues:', e);
        }
    }
    
    /**
     * Log a data issue
     */
    logIssue(type, wordId, word, detail, severity = 'warning') {
        const issue = {
            type,
            wordId,
            word,
            detail,
            severity,
            locale: i18n.getCurrentLocale(),
            timestamp: new Date().toISOString()
        };
        
        // Avoid duplicates
        const exists = this.issues.some(i => 
            i.type === type && 
            i.wordId === wordId && 
            i.locale === issue.locale
        );
        
        if (!exists) {
            this.issues.push(issue);
            this.saveIssues();
            console.warn(`[DataValidation] ${severity.toUpperCase()}: ${type} for "${word}" (${wordId}) - ${detail}`);
        }
        
        return issue;
    }
    
    /**
     * Get all logged issues
     */
    getIssues(filters = {}) {
        let filtered = [...this.issues];
        
        if (filters.type) {
            filtered = filtered.filter(i => i.type === filters.type);
        }
        if (filters.severity) {
            filtered = filtered.filter(i => i.severity === filters.severity);
        }
        if (filters.locale) {
            filtered = filtered.filter(i => i.locale === filters.locale);
        }
        
        return filtered;
    }
    
    /**
     * Get issue summary by type
     */
    getIssueSummary() {
        const summary = {};
        this.issues.forEach(issue => {
            if (!summary[issue.type]) {
                summary[issue.type] = { count: 0, examples: [] };
            }
            summary[issue.type].count++;
            if (summary[issue.type].examples.length < 5) {
                summary[issue.type].examples.push(issue.word);
            }
        });
        return summary;
    }
    
    /**
     * Clear all issues (after cleanup)
     */
    clearIssues() {
        this.issues = [];
        localStorage.removeItem('wordbank_data_issues');
    }
    
    /**
     * Clear issues of a specific type
     */
    clearIssuesByType(type) {
        this.issues = this.issues.filter(i => i.type !== type);
        this.saveIssues();
    }
    
    /**
     * Calculate difficulty based on word length, adjusted for language
     */
    calculateDifficulty(word, locale = null) {
        const lang = locale || i18n.getCurrentLocale();
        const thresholds = this.difficultyThresholds[lang] || this.difficultyThresholds.en;
        const length = word.length;
        
        if (length <= thresholds.easy) return 'easy';
        if (length <= thresholds.medium) return 'medium';
        return 'hard';
    }
    
    /**
     * Validate that a string is not empty/undefined
     */
    isValidString(value) {
        return value && typeof value === 'string' && value.trim() !== '';
    }
    
    /**
     * Validate array has minimum items
     */
    hasMinItems(array, minCount) {
        return Array.isArray(array) && array.filter(this.isValidString).length >= minCount;
    }
    
    /**
     * Filter array to only valid strings
     */
    filterValidStrings(array) {
        if (!Array.isArray(array)) return [];
        return array.filter(item => this.isValidString(item));
    }
    
    /**
     * Validate naming exercise item
     */
    validateNamingItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.answer || item.word)) {
            errors.push('Missing answer/word');
        }
        
        if (!item.emoji && !item.imageUrl && !item.localImageId) {
            warnings.push('No visual (emoji or image)');
        }
        
        const distractors = this.filterValidStrings(item.distractors || []);
        if (distractors.length < 3) {
            errors.push(`Insufficient distractors: ${distractors.length}/3`);
        }
        
        // Check for duplicate distractors
        const uniqueDistractors = [...new Set(distractors.map(d => d.toLowerCase()))];
        if (uniqueDistractors.length !== distractors.length) {
            warnings.push('Duplicate distractors found');
        }
        
        // Check if answer is in distractors
        const answer = (item.answer || item.word || '').toLowerCase();
        if (distractors.some(d => d.toLowerCase() === answer)) {
            errors.push('Answer found in distractors');
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate category exercise item
     */
    validateCategoryItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.word)) {
            errors.push('Missing word');
        }
        
        if (!this.isValidString(item.category)) {
            errors.push('Missing category');
        }
        
        // Critical: category should not equal word
        if (item.word && item.category && 
            item.word.toLowerCase() === item.category.toLowerCase()) {
            errors.push('Word equals category');
            this.logIssue(
                'category_equals_word',
                item.id || item.word,
                item.word,
                `Category "${item.category}" is same as word`,
                'error'
            );
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate association exercise item
     */
    validateAssociationItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.word)) {
            errors.push('Missing word');
        }
        
        const associated = this.filterValidStrings(item.associated || 
            (item.relationships?.associated) || []);
        if (associated.length < 1) {
            errors.push('No associated words');
        }
        
        const unrelated = this.filterValidStrings(item.unrelated || item.distractors || []);
        if (unrelated.length < 3) {
            errors.push(`Insufficient unrelated words: ${unrelated.length}/3`);
        }
        
        // Check for overlap between associated and unrelated
        const associatedLower = associated.map(a => a.toLowerCase());
        const overlapping = unrelated.filter(u => associatedLower.includes(u.toLowerCase()));
        if (overlapping.length > 0) {
            errors.push(`Associated words in unrelated: ${overlapping.join(', ')}`);
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate synonym/antonym exercise item
     */
    validateSynonymItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.word)) {
            errors.push('Missing word');
        }
        
        const synonyms = this.filterValidStrings(
            item.synonyms || item.relationships?.synonyms || []
        );
        const antonyms = this.filterValidStrings(
            item.antonyms || item.relationships?.antonyms || []
        );
        
        if (synonyms.length === 0 && antonyms.length === 0) {
            errors.push('No synonyms or antonyms');
        }
        
        // Check if word is in synonyms or antonyms
        const word = (item.word || '').toLowerCase();
        if (synonyms.some(s => s.toLowerCase() === word)) {
            errors.push('Word found in synonyms');
            this.logIssue(
                'synonym_equals_word',
                item.id || item.word,
                item.word,
                'Word appears in its own synonyms list',
                'error'
            );
        }
        if (antonyms.some(a => a.toLowerCase() === word)) {
            errors.push('Word found in antonyms');
            this.logIssue(
                'antonym_equals_word',
                item.id || item.word,
                item.word,
                'Word appears in its own antonyms list',
                'error'
            );
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate rhyming exercise item
     */
    validateRhymingItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.word)) {
            errors.push('Missing word');
        }
        
        const rhymes = this.filterValidStrings(
            item.rhymes || item.relationships?.rhymes || []
        );
        if (rhymes.length < 1) {
            errors.push('No rhyming words');
        }
        
        // Check if word is in rhymes
        const word = (item.word || '').toLowerCase();
        if (rhymes.some(r => r.toLowerCase() === word)) {
            errors.push('Word found in rhymes');
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate first sound exercise item
     */
    validateFirstSoundItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.sound)) {
            errors.push('Missing sound');
        }
        
        const words = this.filterValidStrings(item.words || []);
        if (words.length < 2) {
            errors.push(`Insufficient words with sound: ${words.length}/2`);
        }
        
        const distractors = this.filterValidStrings(item.distractors || []);
        if (distractors.length < 3) {
            errors.push(`Insufficient distractors: ${distractors.length}/3`);
        }
        
        // Check that words actually start with the sound
        const sound = (item.sound || '').toLowerCase();
        const invalidWords = words.filter(w => !w.toLowerCase().startsWith(sound));
        if (invalidWords.length > 0) {
            warnings.push(`Words not starting with '${sound}': ${invalidWords.join(', ')}`);
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate definition exercise item
     */
    validateDefinitionItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.word)) {
            errors.push('Missing word');
        }
        
        if (!this.isValidString(item.definition)) {
            errors.push('Missing definition');
        }
        
        // Check definition doesn't just contain the word
        if (item.definition && item.word) {
            const defLower = item.definition.toLowerCase();
            const wordLower = item.word.toLowerCase();
            if (defLower === wordLower || defLower === `a ${wordLower}` || defLower === `the ${wordLower}`) {
                warnings.push('Definition is just the word itself');
            }
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate sentence exercise item
     */
    validateSentenceItem(item) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidString(item.sentence)) {
            errors.push('Missing sentence');
        }
        
        if (!this.isValidString(item.answer)) {
            errors.push('Missing answer');
        }
        
        // Check sentence has blank marker
        if (item.sentence && !item.sentence.includes('_')) {
            warnings.push('Sentence missing blank marker (___)');
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    /**
     * Validate any exercise item by type
     */
    validateItem(item, exerciseType) {
        switch (exerciseType) {
            case 'naming':
            case 'listening':
            case 'typing':
                return this.validateNamingItem(item);
            case 'category':
                return this.validateCategoryItem(item);
            case 'association':
                return this.validateAssociationItem(item);
            case 'synonyms':
                return this.validateSynonymItem(item);
            case 'rhyming':
                return this.validateRhymingItem(item);
            case 'firstSound':
                return this.validateFirstSoundItem(item);
            case 'definitions':
                return this.validateDefinitionItem(item);
            case 'sentenceTyping':
                return this.validateSentenceItem(item);
            default:
                return { valid: true, errors: [], warnings: [] };
        }
    }
    
    /**
     * Validate and filter an array of items
     * Returns only valid items and logs issues for invalid ones
     */
    validateAndFilter(items, exerciseType) {
        const validItems = [];
        
        for (const item of items) {
            const result = this.validateItem(item, exerciseType);
            
            if (result.valid) {
                validItems.push(item);
            } else {
                // Log the issues
                const wordId = item.id || item.word || 'unknown';
                const word = item.word || item.answer || 'unknown';
                
                result.errors.forEach(error => {
                    this.logIssue(
                        `${exerciseType}_validation_error`,
                        wordId,
                        word,
                        error,
                        'error'
                    );
                });
            }
            
            // Log warnings even for valid items
            if (result.warnings.length > 0) {
                const wordId = item.id || item.word || 'unknown';
                const word = item.word || item.answer || 'unknown';
                
                result.warnings.forEach(warning => {
                    this.logIssue(
                        `${exerciseType}_validation_warning`,
                        wordId,
                        word,
                        warning,
                        'warning'
                    );
                });
            }
        }
        
        return validItems;
    }
    
    /**
     * Generate a data quality report
     */
    generateReport() {
        const summary = this.getIssueSummary();
        const locale = i18n.getCurrentLocale();
        const localeIssues = this.getIssues({ locale });
        
        return {
            locale,
            totalIssues: localeIssues.length,
            errorCount: localeIssues.filter(i => i.severity === 'error').length,
            warningCount: localeIssues.filter(i => i.severity === 'warning').length,
            byType: summary,
            recentIssues: localeIssues.slice(-10),
            generatedAt: new Date().toISOString()
        };
    }
    
    /**
     * Export issues as CSV for review
     */
    exportIssuesCSV() {
        const headers = ['Type', 'Severity', 'Word ID', 'Word', 'Detail', 'Locale', 'Timestamp'];
        const rows = this.issues.map(i => [
            i.type,
            i.severity,
            i.wordId,
            i.word,
            i.detail,
            i.locale,
            i.timestamp
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }
}

export const dataValidationService = new DataValidationService();
export default dataValidationService;

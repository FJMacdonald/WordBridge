import storageService from './StorageService.js';
import imageStorage from './ImageStorageService.js';

/**
 * Import/Export service for data portability
 * Handles translation templates, custom exercises, and full backups
 */
class ImportExportService {
    constructor() {
        this.version = '1.0';
    }
    
    // ==================== EXPORT FUNCTIONS ====================
    
    /**
     * Export translation template (all UI strings + exercise data without images)
     */
    async exportTranslationTemplate(locale = 'en') {
        const template = {
            _meta: {
                type: 'translation_template',
                version: this.version,
                sourceLocale: locale,
                exportDate: new Date().toISOString(),
                instructions: 'Translate all values. Do not change keys. Keep {placeholders} intact.'
            },
            ui: await this.getUIStrings(),
            exercises: await this.getExerciseDataForTranslation()
        };
        
        return this.downloadJSON(template, `aphasia_translation_template_${locale}.json`);
    }
    
    /**
     * Export all exercise data (for backup or sharing)
     */
    async exportExerciseData(includeImages = false) {
        const data = {
            _meta: {
                type: 'exercise_data',
                version: this.version,
                exportDate: new Date().toISOString(),
                includesImages: includeImages
            },
            exercises: {}
        };
        
        // Get custom exercises from storage
        const customExercises = storageService.get('customExercises', {});
        
        for (const [type, items] of Object.entries(customExercises)) {
            data.exercises[type] = await Promise.all(
                items.map(async (item) => {
                    const exportItem = { ...item };
                    
                    // Handle images
                    if (includeImages && item.localImageId) {
                        const imageData = await imageStorage.getImage(item.localImageId);
                        if (imageData) {
                            exportItem._embeddedImage = imageData;
                        }
                    }
                    
                    return exportItem;
                })
            );
        }
        
        const filename = includeImages 
            ? 'aphasia_exercises_with_images.json'
            : 'aphasia_exercises.json';
        
        return this.downloadJSON(data, filename);
    }
    
    /**
     * Export user progress and statistics
     */
    exportProgressData() {
        const data = {
            _meta: {
                type: 'progress_data',
                version: this.version,
                exportDate: new Date().toISOString()
            },
            wordStats: storageService.get('wordStats', {}),
            dailyStats: storageService.get('dailyStats', {}),
            sessionHistory: storageService.get('sessionHistory', []),
            settings: storageService.get('userConfig', {})
        };
        
        return this.downloadJSON(data, `aphasia_progress_${this.formatDate(new Date())}.json`);
    }
    
    /**
     * Export complete backup (everything)
     */
    async exportFullBackup() {
        const images = await imageStorage.getAllImages();
        
        const backup = {
            _meta: {
                type: 'full_backup',
                version: this.version,
                exportDate: new Date().toISOString()
            },
            settings: storageService.get('userConfig', {}),
            customExercises: storageService.get('customExercises', {}),
            wordStats: storageService.get('wordStats', {}),
            dailyStats: storageService.get('dailyStats', {}),
            sessionHistory: storageService.get('sessionHistory', []),
            images: images
        };
        
        return this.downloadJSON(backup, `aphasia_full_backup_${this.formatDate(new Date())}.json`);
    }
    
    // ==================== IMPORT FUNCTIONS ====================
    
    /**
     * Import data from file
     */
    async importFromFile(file) {
        const text = await this.readFile(file);
        let data;
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error('Invalid JSON file');
        }
        
        if (!data._meta || !data._meta.type) {
            throw new Error('Invalid file format: missing metadata');
        }
        
        switch (data._meta.type) {
            case 'translation_template':
                return this.importTranslation(data);
            case 'exercise_data':
                return this.importExerciseData(data);
            case 'progress_data':
                return this.importProgressData(data);
            case 'full_backup':
                return this.importFullBackup(data);
            default:
                throw new Error(`Unknown data type: ${data._meta.type}`);
        }
    }
    
    /**
     * Import translation
     */
    async importTranslation(data) {
        const results = { ui: false, exercises: false };
        
        // Save UI translations
        if (data.ui) {
            const locale = data._meta.targetLocale || 'custom';
            localStorage.setItem(`locale_${locale}`, JSON.stringify(data.ui));
            results.ui = true;
        }
        
        // Save translated exercise data
        if (data.exercises) {
            const locale = data._meta.targetLocale || 'custom';
            storageService.set(`exerciseData_${locale}`, data.exercises);
            results.exercises = true;
        }
        
        return {
            success: true,
            message: 'Translation imported successfully',
            results
        };
    }
    
    /**
     * Import exercise data
     */
    async importExerciseData(data) {
        const results = { imported: 0, images: 0, errors: [] };
        
        if (!data.exercises) {
            throw new Error('No exercise data found');
        }
        
        const existing = storageService.get('customExercises', {});
        
        for (const [type, items] of Object.entries(data.exercises)) {
            if (!existing[type]) {
                existing[type] = [];
            }
            
            for (const item of items) {
                try {
                    // Handle embedded images
                    if (item._embeddedImage) {
                        const imageId = await imageStorage.saveImage(item._embeddedImage, {
                            word: item.answer || item.word,
                            category: type
                        });
                        item.localImageId = imageId;
                        delete item._embeddedImage;
                        results.images++;
                    }
                    
                    // Check for duplicates
                    const isDuplicate = existing[type].some(
                        e => e.answer === item.answer || e.word === item.word
                    );
                    
                    if (!isDuplicate) {
                        existing[type].push(item);
                        results.imported++;
                    }
                } catch (e) {
                    results.errors.push(`Error importing ${item.answer || item.word}: ${e.message}`);
                }
            }
        }
        
        storageService.set('customExercises', existing);
        
        return {
            success: true,
            message: `Imported ${results.imported} exercises, ${results.images} images`,
            results
        };
    }
    
    /**
     * Import progress data
     */
    importProgressData(data) {
        const results = { merged: [] };
        
        // Merge word stats
        if (data.wordStats) {
            const existing = storageService.get('wordStats', {});
            const merged = this.mergeStats(existing, data.wordStats);
            storageService.set('wordStats', merged);
            results.merged.push('wordStats');
        }
        
        // Merge daily stats
        if (data.dailyStats) {
            const existing = storageService.get('dailyStats', {});
            const merged = { ...existing, ...data.dailyStats };
            storageService.set('dailyStats', merged);
            results.merged.push('dailyStats');
        }
        
        // Append session history
        if (data.sessionHistory) {
            const existing = storageService.get('sessionHistory', []);
            const combined = [...existing, ...data.sessionHistory]
                .sort((a, b) => a.date - b.date)
                .slice(-100); // Keep last 100
            storageService.set('sessionHistory', combined);
            results.merged.push('sessionHistory');
        }
        
        return {
            success: true,
            message: 'Progress data imported and merged',
            results
        };
    }
    
    /**
     * Import full backup
     */
    async importFullBackup(data) {
        const results = { restored: [] };
        
        // Settings
        if (data.settings) {
            storageService.set('userConfig', data.settings);
            results.restored.push('settings');
        }
        
        // Custom exercises
        if (data.customExercises) {
            storageService.set('customExercises', data.customExercises);
            results.restored.push('customExercises');
        }
        
        // Stats
        if (data.wordStats) {
            storageService.set('wordStats', data.wordStats);
            results.restored.push('wordStats');
        }
        
        if (data.dailyStats) {
            storageService.set('dailyStats', data.dailyStats);
            results.restored.push('dailyStats');
        }
        
        if (data.sessionHistory) {
            storageService.set('sessionHistory', data.sessionHistory);
            results.restored.push('sessionHistory');
        }
        
        // Images
        if (data.images && data.images.length > 0) {
            await imageStorage.clearAll();
            for (const img of data.images) {
                await imageStorage.saveImage(img.data, {
                    id: img.id,
                    name: img.name,
                    category: img.category,
                    word: img.word
                });
            }
            results.restored.push(`images (${data.images.length})`);
        }
        
        return {
            success: true,
            message: 'Full backup restored',
            results
        };
    }
    
    // ==================== HELPER FUNCTIONS ====================
    
    /**
     * Get UI strings for translation
     */
    async getUIStrings() {
        try {
            const response = await fetch('./locales/en.json');
            return await response.json();
        } catch (e) {
            // Return inline fallback
            return {
                common: { correct: "Correct", incorrect: "Try again", skip: "Skip", hint: "Hint" },
                // ... minimal set
            };
        }
    }
    
    /**
     * Get exercise data formatted for translation
     */
    async getExerciseDataForTranslation() {
        // Import default data - all 16 exercise types
        const modules = await Promise.all([
            import('../../data/default/naming.js'),
            import('../../data/default/sentences.js'),
            import('../../data/default/categories.js'),
            import('../../data/default/rhyming.js'),
            import('../../data/default/firstSounds.js'),
            import('../../data/default/associations.js'),
            import('../../data/default/synonyms.js'),
            import('../../data/default/definitions.js'),
            import('../../data/default/scramble.js'),
            import('../../data/default/speaking.js'),
            import('../../data/default/timeSequencing.js'),
            import('../../data/default/clockMatching.js'),
            import('../../data/default/timeOrdering.js'),
            import('../../data/default/workingMemory.js')
        ]);
        
        return {
            naming: modules[0].namingData.map(i => ({ answer: i.answer, options: i.options })),
            sentences: modules[1].sentenceData.map(i => ({ sentence: i.sentence, answer: i.answer })),
            categories: modules[2].categoryData.map(i => ({ category: i.category, word: i.word, options: i.options })),
            rhyming: modules[3].rhymingData.map(i => ({ word: i.word, rhymes: i.rhymes, nonRhymes: i.nonRhymes })),
            firstSounds: modules[4].firstSoundData.map(i => ({ sound: i.sound, words: i.words })),
            associations: modules[5].associationData.map(i => ({ word: i.word, associated: i.associated, unrelated: i.unrelated })),
            synonyms: modules[6].synonymData.map(i => ({ word: i.word, synonyms: i.synonyms, antonyms: i.antonyms })),
            definitions: modules[7].definitionData.map(i => ({ word: i.word, definition: i.definition })),
            scramble: modules[8].scrambleData.map(i => ({ words: i.words })),
            speaking: modules[9].speakingData.map(i => ({ answer: i.answer, phrases: i.phrases })),
            timeSequencing: modules[10].timeSequencingData.map(i => ({ question: i.question, answer: i.answer, options: i.options })),
            clockMatching: modules[11].clockMatchingData.map(i => ({ time: i.time, digitalDisplay: i.digitalDisplay, timeWords: i.timeWords })),
            timeOrdering: modules[12].timeOrderingData.map(i => ({ scenario: i.scenario, description: i.description, items: i.items, correctOrder: i.correctOrder })),
            workingMemory: modules[13].workingMemoryData.map(i => ({ sequence: i.sequence, options: i.options }))
        };
    }
    
    /**
     * Merge stats objects (prefer higher values)
     */
    mergeStats(existing, incoming) {
        const merged = { ...existing };
        
        for (const [word, stats] of Object.entries(incoming)) {
            if (!merged[word]) {
                merged[word] = stats;
            } else {
                // Merge by taking max/sum as appropriate
                merged[word] = {
                    ...merged[word],
                    totalAttempts: Math.max(merged[word].totalAttempts || 0, stats.totalAttempts || 0),
                    correctAttempts: Math.max(merged[word].correctAttempts || 0, stats.correctAttempts || 0),
                    lastSeen: Math.max(merged[word].lastSeen || 0, stats.lastSeen || 0)
                };
            }
        }
        
        return merged;
    }
    
    /**
     * Read file as text
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    /**
     * Download JSON data as file
     */
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true, filename };
    }
    
    /**
     * Format date for filenames
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    /**
     * Validate imported data structure
     */
    validateExerciseData(data, type) {
        const schemas = {
            naming: ['answer', 'options'],
            sentences: ['sentence', 'answer'],
            categories: ['category', 'word', 'options'],
            rhyming: ['word', 'rhymes', 'nonRhymes'],
            associations: ['word', 'associated', 'unrelated'],
            synonyms: ['word', 'synonyms', 'antonyms'],
            definitions: ['word', 'definition'],
            scramble: ['words'],
            speaking: ['answer']
        };
        
        const required = schemas[type];
        if (!required) return { valid: true };
        
        const errors = [];
        
        if (!Array.isArray(data)) {
            return { valid: false, errors: ['Data must be an array'] };
        }
        
        data.forEach((item, index) => {
            required.forEach(field => {
                if (!(field in item)) {
                    errors.push(`Item ${index}: missing required field "${field}"`);
                }
            });
        });
        
        return { valid: errors.length === 0, errors };
    }
}

export const importExportService = new ImportExportService();
export default importExportService;
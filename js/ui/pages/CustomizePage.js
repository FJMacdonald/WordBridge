import storageService from '../../services/StorageService.js';
import imageStorage from '../../services/ImageStorageService.js';
import csvService from '../../services/CSVService.js';
import Config from '../../core/Config.js';
import { t, i18n } from '../../core/i18n.js';

/**
 * Customize exercises page
 */
class CustomizePage {
    constructor(container) {
        this.container = container;
        this.currentMode = 'individual';
        this.pendingImage = null;
    }
    
    renderDifficultyField() {
        return `
            <div class="form-group">
                <label>${t('customize.forms.difficulty')}</label>
                <select id="exercise-difficulty" required>
                    <option value="easy">${t('customize.forms.easy')}</option>
                    <option value="medium" selected>${t('customize.forms.medium')}</option>
                    <option value="hard">${t('customize.forms.hard')}</option>
                </select>
            </div>
        `;
    }
    
    async render() {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        this.container.innerHTML = `
            <div class="customize-page">
                <header class="page-header">
                    <h2>${t('customize.title')}</h2>
                </header>
                
                <!-- Mode Toggle -->
                <div class="mode-toggle">
                    <button class="mode-btn active" data-mode="individual">
                        ➕ ${t('customize.modes.individual')}
                    </button>
                    <button class="mode-btn" data-mode="bulk">
                        📋 ${t('customize.modes.bulkUpload')}
                    </button>
                </div>
                
                <!-- Individual Mode -->
                <div class="mode-content" id="individual-mode">
                    <div class="exercise-type-selector">
                        <h3>${t('customize.chooseType')}</h3>
                        
                        <!-- Words Category -->
                        <div class="type-category">
                            <h4 class="category-label">📚 Words</h4>
                            <div class="type-grid">
                                <button class="type-btn" data-type="naming">
                                    <span class="type-icon">🖼️</span>
                                    <span class="type-name">Picture Naming</span>
                                </button>
                                <button class="type-btn" data-type="typing">
                                    <span class="type-icon">⌨️</span>
                                    <span class="type-name">Spelling</span>
                                </button>
                                <button class="type-btn" data-type="sentenceTyping">
                                    <span class="type-icon">📝</span>
                                    <span class="type-name">Fill Blank</span>
                                </button>
                                <button class="type-btn" data-type="category">
                                    <span class="type-icon">📁</span>
                                    <span class="type-name">Categories</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Phonetics Category -->
                        <div class="type-category">
                            <h4 class="category-label">🔊 Phonetics</h4>
                            <div class="type-grid">
                                <button class="type-btn" data-type="listening">
                                    <span class="type-icon">👂</span>
                                    <span class="type-name">Listening</span>
                                </button>
                                <button class="type-btn" data-type="speaking">
                                    <span class="type-icon">🎤</span>
                                    <span class="type-name">Speaking</span>
                                </button>
                                <button class="type-btn" data-type="firstSound">
                                    <span class="type-icon">🔤</span>
                                    <span class="type-name">First Sounds</span>
                                </button>
                                <button class="type-btn" data-type="rhyming">
                                    <span class="type-icon">🎵</span>
                                    <span class="type-name">Rhyming</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Meaning Category -->
                        <div class="type-category">
                            <h4 class="category-label">💡 Meaning</h4>
                            <div class="type-grid">
                                <button class="type-btn" data-type="definitions">
                                    <span class="type-icon">📖</span>
                                    <span class="type-name">Definitions</span>
                                </button>
                                <button class="type-btn" data-type="association">
                                    <span class="type-icon">🔗</span>
                                    <span class="type-name">Association</span>
                                </button>
                                <button class="type-btn" data-type="synonyms">
                                    <span class="type-icon">≈</span>
                                    <span class="type-name">Synonyms</span>
                                </button>
                                <button class="type-btn" data-type="scramble">
                                    <span class="type-icon">🔀</span>
                                    <span class="type-name">Unscramble</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Time Category -->
                        <div class="type-category">
                            <h4 class="category-label">⏰ Time</h4>
                            <div class="type-grid">
                                <button class="type-btn" data-type="timeSequencing">
                                    <span class="type-icon">📅</span>
                                    <span class="type-name">Time Sequencing</span>
                                </button>
                                <button class="type-btn" data-type="clockMatching">
                                    <span class="type-icon">🕐</span>
                                    <span class="type-name">Clock Matching</span>
                                </button>
                                <button class="type-btn" data-type="timeOrdering">
                                    <span class="type-icon">⏰</span>
                                    <span class="type-name">Time Ordering</span>
                                </button>
                                <button class="type-btn" data-type="workingMemory">
                                    <span class="type-icon">🧠</span>
                                    <span class="type-name">Working Memory</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div id="add-form-container"></div>
                </div>
                
                <!-- Bulk Mode -->
                <div class="mode-content" id="bulk-mode" hidden>
                    ${this.renderBulkUploadSection()}
                </div>
                
                <!-- Existing Custom Exercises Library -->
                <section class="existing-section">
                    <div class="existing-header">
                        <h3>📚 ${t('customize.existing')}</h3>
                        <div class="library-controls">
                            <button class="btn btn--secondary" id="expand-all">▼ Expand All</button>
                            <button class="btn btn--secondary" id="collapse-all">▲ Collapse All</button>
                        </div>
                    </div>
                    <div id="existing-items" class="spreadsheet-library">
                        ${await this.renderExistingItemsSpreadsheet(customExercises)}
                    </div>
                </section>
            </div>
        `;
        
        this.attachListeners();
    }
    
    renderBulkUploadSection() {
        return `
            <div class="bulk-upload-section">
                <h3>${t('customize.bulkUpload.title')}</h3>
                
                <!-- Exercise Type Selection -->
                <div class="template-selection">
                    <h4>${t('customize.bulkUpload.selectExercises')}:</h4>
                    <div class="exercise-type-checkboxes">
                        <!-- Words -->
                        <div class="checkbox-category">
                            <strong>📚 Words:</strong>
                            <label><input type="checkbox" value="naming" checked> 🖼️ Picture Naming</label>
                            <label><input type="checkbox" value="typing" checked> ⌨️ Spelling</label>
                            <label><input type="checkbox" value="sentenceTyping" checked> 📝 Fill Blank</label>
                            <label><input type="checkbox" value="category" checked> 📁 Categories</label>
                        </div>
                        
                        <!-- Phonetics -->
                        <div class="checkbox-category">
                            <strong>🔊 Phonetics:</strong>
                            <label><input type="checkbox" value="listening" checked> 👂 Listening</label>
                            <label><input type="checkbox" value="speaking" checked> 🎤 Speaking</label>
                            <label><input type="checkbox" value="firstSound" checked> 🔤 First Sounds</label>
                            <label><input type="checkbox" value="rhyming" checked> 🎵 Rhyming</label>
                        </div>
                        
                        <!-- Meaning -->
                        <div class="checkbox-category">
                            <strong>💡 Meaning:</strong>
                            <label><input type="checkbox" value="definitions" checked> 📖 Definitions</label>
                            <label><input type="checkbox" value="association" checked> 🔗 Association</label>
                            <label><input type="checkbox" value="synonyms" checked> ≈ Synonyms</label>
                            <label><input type="checkbox" value="scramble" checked> 🔀 Unscramble</label>
                        </div>
                        
                        <!-- Time -->
                        <div class="checkbox-category">
                            <strong>⏰ Time:</strong>
                            <label><input type="checkbox" value="timeSequencing" checked> 📅 Time Sequencing</label>
                            <label><input type="checkbox" value="clockMatching" checked> 🕐 Clock Matching</label>
                            <label><input type="checkbox" value="timeOrdering" checked> ⏰ Time Ordering</label>
                            <label><input type="checkbox" value="workingMemory" checked> 🧠 Working Memory</label>
                        </div>
                    </div>
                    <button class="btn btn--secondary" id="download-template">
                        📥 ${t('customize.bulkUpload.downloadTemplate')}
                    </button>
                </div>
                
                <!-- Collapsible Instructions -->
                <details class="instructions-panel">
                    <summary class="instructions-header">
                        📖 ${t('customize.bulkUpload.instructions')}
                    </summary>
                    <div class="instructions-content">
                        <h4>${t('customize.bulkUpload.howTo')}</h4>
                        <ol>
                            <li>${t('customize.bulkUpload.step1')}</li>
                            <li>${t('customize.bulkUpload.step2')}</li>
                            <li>${t('customize.bulkUpload.step3')}</li>
                            <li>${t('customize.bulkUpload.step4')}</li>
                            <li>${t('customize.bulkUpload.step5')}</li>
                        </ol>
                        
                        <h4>${t('customize.bulkUpload.formatGuidelines')}</h4>
                        <div class="format-guide">
                            <!-- Words Category -->
                            <details class="format-category">
                                <summary><strong>📚 Words</strong></summary>
                                <div class="format-items">
                                    <div class="format-item">
                                        <strong>🖼️ Picture Naming (naming):</strong>
                                        <code>word, image_url, option1, option2, option3, difficulty</code>
                                        <p>Example: apple, https://..., apple, orange, banana, pear, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>⌨️ Spelling (typing):</strong>
                                        <code>emoji, answer, option1, option2, option3, difficulty</code>
                                        <p>Example: 🍎, apple, apple, aple, appl, appel, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>📝 Fill Blank (sentenceTyping):</strong>
                                        <code>sentence_with_blank, answer, difficulty</code>
                                        <p>Example: I drink ______ every morning., coffee, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>📁 Categories (category):</strong>
                                        <code>category, word, option1, option2, option3, difficulty</code>
                                        <p>Example: fruit, apple, apple, carrot, bread, chair, easy</p>
                                    </div>
                                </div>
                            </details>
                            
                            <!-- Phonetics Category -->
                            <details class="format-category">
                                <summary><strong>🔊 Phonetics</strong></summary>
                                <div class="format-items">
                                    <div class="format-item">
                                        <strong>👂 Listening (listening):</strong>
                                        <code>emoji, answer, option1, option2, option3, difficulty</code>
                                        <p>Same format as Picture Naming</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>🎤 Speaking (speaking):</strong>
                                        <code>emoji, answer, phrase1, phrase2, difficulty</code>
                                        <p>Example: 🍎, apple, An apple a day..., I eat an apple, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>🔤 First Sounds (firstSound):</strong>
                                        <code>sound, word1, word2, word3, word4, word5, difficulty</code>
                                        <p>Example: b, ball, book, bed, bird, box, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>🎵 Rhyming (rhyming):</strong>
                                        <code>word, rhyme1, rhyme2, rhyme3, non-rhyme1, non-rhyme2, difficulty</code>
                                        <p>Example: cat, hat, bat, mat, dog, cup, easy</p>
                                    </div>
                                </div>
                            </details>
                            
                            <!-- Meaning Category -->
                            <details class="format-category">
                                <summary><strong>💡 Meaning</strong></summary>
                                <div class="format-items">
                                    <div class="format-item">
                                        <strong>📖 Definitions (definitions):</strong>
                                        <code>word, definition, difficulty</code>
                                        <p>Example: chair, A piece of furniture for sitting, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>🔗 Association (association):</strong>
                                        <code>word, related1, related2, unrelated1, unrelated2, difficulty</code>
                                        <p>Example: bread, butter, toast, car, phone, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>≈ Synonyms (synonyms):</strong>
                                        <code>word, synonym1, synonym2, antonym1, antonym2, difficulty</code>
                                        <p>Example: happy, glad, joyful, sad, unhappy, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>🔀 Unscramble (scramble):</strong>
                                        <code>word1, word2, word3, word4, difficulty</code>
                                        <p>Example: The, cat, is, sleeping, easy</p>
                                    </div>
                                </div>
                            </details>
                            
                            <!-- Time Category -->
                            <details class="format-category">
                                <summary><strong>⏰ Time</strong></summary>
                                <div class="format-items">
                                    <div class="format-item">
                                        <strong>📅 Time Sequencing (timeSequencing):</strong>
                                        <code>question, answer, option1, option2, option3, difficulty</code>
                                        <p>Example: What day comes after Monday?, Tuesday, Tuesday, Wednesday, Sunday, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>🕐 Clock Matching (clockMatching):</strong>
                                        <code>time(HH:MM), time_words, difficulty</code>
                                        <p>Example: 3:00, three o'clock, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>⏰ Time Ordering (timeOrdering):</strong>
                                        <code>scenario, description, item1, item2, item3, item4, difficulty</code>
                                        <p>Example: Morning routine, Put in order, Wake up, Eat breakfast, Go to work, easy</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>🧠 Working Memory (workingMemory):</strong>
                                        <code>emoji1, emoji2, emoji3, extra1, extra2, extra3, difficulty</code>
                                        <p>Example: 🍎, 🍌, 🍊, 🍇, 🍓, 🥝, easy</p>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </details>
                
                <!-- Upload Section -->
                <div class="upload-section">
                    <h4>${t('customize.bulkUpload.uploadFile')}:</h4>
                    <div class="upload-zone" id="upload-zone">
                        <input type="file" id="csv-file" accept=".csv" hidden>
                        <label for="csv-file" class="upload-label">
                            <span class="upload-icon">📁</span>
                            <span class="upload-text">${t('customize.bulkUpload.selectFile')}</span>
                        </label>
                    </div>
                    
                    <!-- Error Display -->
                    <div id="upload-errors" class="error-panel" hidden></div>
                    
                    <!-- Preview -->
                    <div id="upload-preview" class="preview-panel" hidden></div>
                </div>
            </div>
        `;
    }
    
    renderIndividualForm(type) {
        switch (type) {
            case 'naming':
                return this.renderNamingForm();
            case 'sentenceTyping':
                return this.renderSentenceForm();
            case 'words':
                return this.renderWordsForm();
            case 'timeSequencing':
                return this.renderTimeSequencingForm();
            case 'timeOrdering':
                return this.renderTimeOrderingForm();
            case 'clockMatching':
                return this.renderClockMatchingForm();
            case 'workingMemory':
                return this.renderWorkingMemoryForm();
            default:
                return '';
        }
    }
    
    renderNamingForm() {
        return `
            <form class="add-form" id="add-naming-form">
                <h3>${t('customize.forms.addPictureExercise')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.targetWord')}</label>
                    <input type="text" id="word-input" placeholder="${t('customize.forms.targetWordPlaceholder')}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.imageFile')}</label>
                    <div class="image-upload-area">
                        <input type="file" id="image-upload" accept="image/*" required style="display: none;">
                        <button type="button" class="file-select-btn" id="file-select-btn">
                            ${t('customize.forms.chooseFile')}
                        </button>
                        <span class="file-status" id="file-status">${t('customize.forms.noFileSelected')}</span>
                        <div class="image-preview" id="image-preview"></div>
                    </div>
                    <small>${t('customize.forms.uploadPictureHelp')}</small>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.wrongOptionsOptional')}</label>
                    <input type="text" id="options-input" placeholder="${t('customize.forms.wrongOptionsPlaceholder')}">
                    <small>${t('customize.forms.autoGenerateHelp')}</small>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderSentenceForm() {
        return `
            <form class="add-form" id="add-sentence-form">
                <h3>${t('customize.forms.addSentenceExercise')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.sentenceWithBlank')}</label>
                    <input type="text" id="sentence-input" 
                           placeholder="${t('customize.forms.sentencePlaceholder')}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.answer')}</label>
                    <input type="text" id="sentence-answer" placeholder="${t('customize.forms.answerPlaceholder')}" required>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderWordsForm() {
        return `
            <form class="add-form" id="add-words-form">
                <h3>${t('customize.forms.addWordExercise')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.exerciseType')}</label>
                    <select id="word-type">
                        <option value="rhyming">${t('customize.forms.rhymingWords')}</option>
                        <option value="association">${t('customize.forms.wordAssociation')}</option>
                        <option value="synonyms">${t('customize.forms.synonyms')}</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.mainWord')}</label>
                    <input type="text" id="main-word" placeholder="${t('customize.forms.mainWordPlaceholder')}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.relatedWords')}</label>
                    <input type="text" id="related-words" 
                           placeholder="${t('customize.forms.relatedWordsPlaceholder')}" required>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderTimeSequencingForm() {
        return `
            <form class="add-form" id="add-timesequencing-form">
                <h3>${t('customize.forms.addTimeSequencing')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.question')}</label>
                    <input type="text" id="time-question" placeholder="${t('customize.forms.timeQuestionPlaceholder')}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.correctAnswer')}</label>
                    <input type="text" id="time-answer" placeholder="${t('customize.forms.timeAnswerPlaceholder')}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.wrongOptions')}</label>
                    <input type="text" id="time-options" 
                           placeholder="${t('customize.forms.timeOptionsPlaceholder')}" required>
                    <small>${t('customize.forms.timeOptionsHelp')}</small>
                </div>
                
                ${this.renderDifficultyField()}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderTimeOrderingForm() {
        return `
            <form class="add-form" id="add-timeordering-form">
                <h3>${t('customize.forms.addTimeOrdering')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.scenario')}</label>
                    <input type="text" id="ordering-scenario" placeholder="${t('customize.forms.scenarioPlaceholder')}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.description')}</label>
                    <input type="text" id="ordering-description" placeholder="${t('customize.forms.descriptionPlaceholder')}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.activities')}</label>
                    <textarea id="ordering-items" rows="4" 
                              placeholder="${t('customize.forms.activitiesPlaceholder')}" required></textarea>
                    <small>${t('customize.forms.activitiesHelp')}</small>
                </div>
                
                ${this.renderDifficultyField()}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderClockMatchingForm() {
        return `
            <form class="add-form" id="add-clockmatching-form">
                <h3>${t('customize.forms.addClockMatching')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.digitalTime')}</label>
                    <input type="time" id="clock-time" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.timeWords')}</label>
                    <input type="text" id="clock-words" placeholder="${t('customize.forms.timeWordsPlaceholder')}" required>
                    <small>${t('customize.forms.timeWordsHelp')}</small>
                </div>
                
                ${this.renderDifficultyField()}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderWorkingMemoryForm() {
        return `
            <form class="add-form" id="add-workingmemory-form">
                <h3>${t('customize.forms.addWorkingMemory')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.emojiSequence')}</label>
                    <input type="text" id="memory-sequence" placeholder="${t('customize.forms.sequencePlaceholder')}" required>
                    <small>${t('customize.forms.sequenceHelp')}</small>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.extraOptions')}</label>
                    <input type="text" id="memory-options" placeholder="${t('customize.forms.extraOptionsPlaceholder')}" required>
                    <small>${t('customize.forms.extraOptionsHelp')}</small>
                </div>
                
                ${this.renderDifficultyField()}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    async renderExistingItemsSpreadsheet(customExercises) {
        const totalItems = Object.values(customExercises).reduce((sum, arr) => sum + (arr?.length || 0), 0);
        
        if (totalItems === 0) {
            return `<p class="empty-state">${t('customize.noCustom')}</p>`;
        }
        
        // Group exercises by category (words, phonetics, meaning, time)
        const categories = {
            words: ['naming', 'typing', 'sentenceTyping', 'category'],
            phonetics: ['listening', 'speaking', 'firstSound', 'rhyming'],
            meaning: ['definitions', 'association', 'synonyms', 'scramble'],
            time: ['timeSequencing', 'clockMatching', 'timeOrdering', 'workingMemory']
        };
        
        const categoryNames = {
            words: '📚 Words',
            phonetics: '🔊 Phonetics',
            meaning: '💡 Meaning',
            time: '⏰ Time'
        };
        
        const typeIcons = {
            naming: '🖼️', typing: '⌨️', sentenceTyping: '📝', category: '📁',
            listening: '👂', speaking: '🎤', firstSound: '🔤', rhyming: '🎵',
            definitions: '📖', association: '🔗', synonyms: '≈', scramble: '🔀',
            timeSequencing: '📅', clockMatching: '🕐', timeOrdering: '⏰', workingMemory: '🧠'
        };
        
        let html = '<div class="collapsible-categories">';
        
        for (const [category, types] of Object.entries(categories)) {
            // Count items in this category
            const categoryCount = types.reduce((sum, type) => 
                sum + (customExercises[type]?.length || 0), 0);
            
            if (categoryCount === 0) continue;
            
            html += `
                <details class="category-section" open>
                    <summary class="category-header">
                        <span class="category-name">${categoryNames[category]}</span>
                        <span class="category-count">(${categoryCount} items)</span>
                    </summary>
                    <div class="category-content">
            `;
            
            // Render each type in this category
            for (const type of types) {
                const exercises = customExercises[type];
                if (!exercises || exercises.length === 0) continue;
                
                html += this.renderTypeTable(type, exercises, typeIcons[type]);
            }
            
            html += `
                    </div>
                </details>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    renderTypeTable(type, exercises, icon) {
        const activeCount = exercises.filter(e => e.status !== 'archived').length;
        const archivedCount = exercises.filter(e => e.status === 'archived').length;
        
        return `
            <details class="type-section" open>
                <summary class="type-header">
                    <span class="type-info">
                        <span class="type-icon">${icon}</span>
                        <span class="type-name">${this.getTypeName(type)}</span>
                    </span>
                    <span class="type-counts">
                        <span class="count-active">${activeCount} active</span>
                        ${archivedCount > 0 ? `<span class="count-archived">${archivedCount} archived</span>` : ''}
                    </span>
                </summary>
                <div class="type-table-container">
                    <table class="exercise-table">
                        <thead>
                            <tr>
                                <th class="col-difficulty">Difficulty</th>
                                <th class="col-content">Content</th>
                                <th class="col-status">Status</th>
                                <th class="col-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${exercises.map((exercise, index) => 
                                this.renderTableRow(type, exercise, index)
                            ).join('')}
                        </tbody>
                    </table>
                </div>
            </details>
        `;
    }
    
    renderTableRow(type, exercise, index) {
        const difficulty = exercise.difficulty || 'medium';
        const status = exercise.status || 'active';
        const isArchived = status === 'archived';
        
        // Get difficulty color class
        const diffColors = {
            easy: 'diff-easy',
            medium: 'diff-medium',
            hard: 'diff-hard'
        };
        
        // Get content preview
        const content = this.getContentPreview(type, exercise);
        
        return `
            <tr class="exercise-row ${isArchived ? 'archived-row' : ''}" 
                data-type="${type}" 
                data-index="${index}">
                <td class="col-difficulty">
                    <span class="difficulty-dot ${diffColors[difficulty]}" 
                          title="${difficulty}"></span>
                    <span class="difficulty-text">${difficulty}</span>
                </td>
                <td class="col-content">
                    <div class="content-preview">${content}</div>
                </td>
                <td class="col-status">
                    <span class="status-badge status-${status}">${status}</span>
                </td>
                <td class="col-actions">
                    <button class="action-btn edit-btn" 
                            data-type="${type}" 
                            data-index="${index}" 
                            title="Edit">✏️</button>
                    ${!isArchived ? `
                        <button class="action-btn archive-btn" 
                                data-type="${type}" 
                                data-index="${index}" 
                                title="Archive">📦</button>
                    ` : `
                        <button class="action-btn unarchive-btn" 
                                data-type="${type}" 
                                data-index="${index}" 
                                title="Unarchive">📂</button>
                    `}
                    <button class="action-btn delete-btn" 
                            data-type="${type}" 
                            data-index="${index}" 
                            title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    }
    
    getTypeName(type) {
        const names = {
            naming: 'Picture Naming',
            typing: 'Spelling',
            sentenceTyping: 'Fill Blank',
            category: 'Categories',
            listening: 'Listening',
            speaking: 'Speaking',
            firstSound: 'First Sounds',
            rhyming: 'Rhyming',
            definitions: 'Definitions',
            association: 'Association',
            synonyms: 'Synonyms',
            scramble: 'Unscramble',
            timeSequencing: 'Time Sequencing',
            clockMatching: 'Clock Matching',
            timeOrdering: 'Time Ordering',
            workingMemory: 'Working Memory'
        };
        return names[type] || type;
    }
    
    getContentPreview(type, exercise) {
        switch (type) {
            case 'naming':
            case 'typing':
            case 'listening':
                return `<strong>${exercise.answer}</strong>`;
            case 'sentenceTyping':
                return `${exercise.sentence} <span class="answer-preview">→ ${exercise.answer}</span>`;
            case 'timeSequencing':
                return `${exercise.question} <span class="answer-preview">→ ${exercise.answer}</span>`;
            case 'timeOrdering':
                return `<strong>${exercise.scenario}:</strong> ${exercise.description}`;
            case 'clockMatching':
                return `<strong>${exercise.digitalDisplay}</strong> (${exercise.timeWords})`;
            case 'workingMemory':
                return `Sequence: ${exercise.sequence.join('')}`;
            case 'speaking':
                return `<strong>${exercise.answer}</strong> (${exercise.phrases?.length || 0} phrases)`;
            case 'firstSound':
                return `Sound: <strong>${exercise.sound}</strong> (${exercise.words?.length || 0} words)`;
            case 'rhyming':
                return `<strong>${exercise.word}</strong> (${exercise.rhymes?.length || 0} rhymes)`;
            case 'category':
                return `${exercise.category}: <strong>${exercise.word}</strong>`;
            case 'definitions':
                return `<strong>${exercise.word}</strong>: ${exercise.definition}`;
            case 'association':
                return `<strong>${exercise.word}</strong> (${exercise.associated?.length || 0} related)`;
            case 'synonyms':
                return `<strong>${exercise.word}</strong> (${exercise.synonyms?.length || 0} synonyms)`;
            case 'scramble':
                return `${exercise.words?.join(' ') || 'Sentence'}`;
            default:
                return JSON.stringify(exercise).substring(0, 50) + '...';
        }
    }
    
    async renderExistingItems(customExercises) {
        const items = [];
        
        for (const [type, exercises] of Object.entries(customExercises)) {
            if (exercises && exercises.length > 0) {
                exercises.forEach((exercise, index) => {
                    items.push({ type, exercise, index });
                });
            }
        }
        
        if (items.length === 0) {
            return `<p class="empty-state">${t('customize.noCustom')}</p>`;
        }
        
        return `
            <div class="items-list">
                ${items.map(({ type, exercise, index }) => 
                    this.renderExistingItem(type, exercise, index)
                ).join('')}
            </div>
        `;
    }
    
    renderExistingItem(type, item, index) {
        let preview = '';
        let details = '';
        
        // Determine preview and details based on exercise type
        switch (type) {
            case 'naming':
                preview = item.localImageId ? '🖼️' : '📷';
                details = `<strong>${item.answer}</strong>`;
                break;
            case 'sentenceTyping':
                preview = '📝';
                details = `<span class="item-sentence">${item.sentence}</span><br>
                          <strong>Answer: ${item.answer}</strong>`;
                break;
            case 'timeSequencing':
                preview = '📅';
                details = `<strong>${item.question}</strong><br>
                          <span class="answer">→ ${item.answer}</span>`;
                break;
            case 'timeOrdering':
                preview = '⏰';
                details = `<strong>${item.scenario}</strong><br>
                          <span class="description">${item.description}</span>`;
                break;
            case 'clockMatching':
                preview = '🕐';
                details = `<strong>${item.digitalDisplay}</strong><br>
                          <span class="time-words">${item.timeWords}</span>`;
                break;
            case 'workingMemory':
                preview = '🧠';
                details = `<strong>Sequence:</strong> ${item.sequence.join('')}<br>
                          <span class="options-count">${item.options.length} options</span>`;
                break;
            default:
                preview = '📚';
                details = `<strong>${item.word || 'Word exercise'}</strong>`;
        }
        
        const difficulty = item.difficulty || 'medium';
        const status = item.status || 'active';
        const difficultyClass = `difficulty-${difficulty}`;
        const statusClass = `status-${status}`;
        
        return `
            <div class="item-card ${difficultyClass} ${statusClass}" data-type="${type}" data-index="${index}" data-difficulty="${difficulty}" data-status="${status}">
                <div class="item-preview">${preview}</div>
                <div class="item-details">
                    ${details}
                    <div class="item-meta">
                        <span class="difficulty-badge ${difficultyClass}">${t('customize.forms.' + difficulty)}</span>
                        <span class="status-badge ${statusClass}">${t('customize.status.' + status)}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <select class="status-select" data-type="${type}" data-index="${index}">
                        <option value="active" ${status === 'active' ? 'selected' : ''}>${t('customize.status.active')}</option>
                        <option value="archived" ${status === 'archived' ? 'selected' : ''}>${t('customize.status.archived')}</option>
                    </select>
                    <button class="item-delete-btn btn btn--danger btn--small" data-type="${type}" data-index="${index}">
                        ${t('customize.delete')}
                    </button>
                </div>
            </div>
        `;
    }
    
    attachListeners() {
        // Mode toggle
        this.container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });
        
        // Exercise type selection
        this.container.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                this.container.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                this.container.querySelector('#add-form-container').innerHTML = 
                    this.renderIndividualForm(btn.dataset.type);
                this.attachFormListeners(btn.dataset.type);
            });
        });
        
        // Template downloads
        this.container.querySelectorAll('[data-template]').forEach(btn => {
            btn.addEventListener('click', () => this.downloadTemplate(btn.dataset.template));
        });
        
        // CSV upload
        const csvInput = this.container.querySelector('#csv-file');
        const uploadZone = this.container.querySelector('#upload-zone');
        
        if (csvInput) {
            csvInput.addEventListener('change', (e) => this.handleCSVUpload(e.target.files[0]));
        }
        
        // Drag and drop
        if (uploadZone) {
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });
            
            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('dragover');
            });
            
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type === 'text/csv') {
                    this.handleCSVUpload(file);
                }
            });
        }
        
        // Delete buttons
        this.container.addEventListener('click', async (e) => {
            if (e.target.classList.contains('item-delete-btn')) {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                await this.deleteItem(type, index);
            }
        });
        
        // Spreadsheet-style library controls
        const expandAll = this.container.querySelector('#expand-all');
        const collapseAll = this.container.querySelector('#collapse-all');
        
        if (expandAll) {
            expandAll.addEventListener('click', () => {
                this.container.querySelectorAll('details').forEach(d => d.open = true);
            });
        }
        
        if (collapseAll) {
            collapseAll.addEventListener('click', () => {
                this.container.querySelectorAll('details').forEach(d => d.open = false);
            });
        }
        
        // Edit, Archive, Unarchive, Delete buttons in spreadsheet
        this.container.addEventListener('click', async (e) => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;
            
            const type = btn.dataset.type;
            const index = parseInt(btn.dataset.index);
            
            if (btn.classList.contains('edit-btn')) {
                await this.editItem(type, index);
            } else if (btn.classList.contains('archive-btn')) {
                await this.archiveItem(type, index);
            } else if (btn.classList.contains('unarchive-btn')) {
                await this.unarchiveItem(type, index);
            } else if (btn.classList.contains('delete-btn')) {
                if (confirm('Are you sure you want to delete this exercise?')) {
                    await this.deleteItem(type, index);
                }
            }
        });
    }
    
    attachFormListeners(type) {
        const form = this.container.querySelector('.add-form');
        if (!form) return;
        
        // Cancel button
        form.querySelector('#cancel-form')?.addEventListener('click', () => {
            this.container.querySelector('#add-form-container').innerHTML = '';
        });
        
        // Custom file button and image upload preview
        const imageInput = form.querySelector('#image-upload');
        const fileSelectBtn = form.querySelector('#file-select-btn');
        const fileStatus = form.querySelector('#file-status');
        
        if (imageInput && fileSelectBtn) {
            // Custom file button click
            fileSelectBtn.addEventListener('click', () => {
                imageInput.click();
            });
            
            // Handle file selection
            imageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileStatus.textContent = file.name;
                    const resized = await imageStorage.resizeImage(file);
                    this.container.querySelector('#image-preview').innerHTML = 
                        `<img src="${resized}" alt="Preview">`;
                    this.pendingImage = resized;
                } else {
                    fileStatus.textContent = t('customize.forms.noFileSelected');
                }
            });
        }
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (type === 'naming') {
                await this.handleAddNaming();
            } else if (type === 'sentenceTyping') {
                await this.handleAddSentence();
            } else if (type === 'words') {
                await this.handleAddWords();
            } else if (type === 'timeSequencing') {
                await this.handleAddTimeSequencing();
            } else if (type === 'timeOrdering') {
                await this.handleAddTimeOrdering();
            } else if (type === 'clockMatching') {
                await this.handleAddClockMatching();
            } else if (type === 'workingMemory') {
                await this.handleAddWorkingMemory();
            }
        });
    }
    
    async handleAddNaming() {
        const word = this.container.querySelector('#word-input').value.trim().toLowerCase();
        const optionsInput = this.container.querySelector('#options-input').value;
        
        if (!word || !this.pendingImage) return;
        
        const imageId = await imageStorage.saveImage(this.pendingImage, {
            word: word,
            category: 'custom'
        });
        
        const exercise = {
            answer: word,
            localImageId: imageId,
            isCustom: true
        };
        
        if (optionsInput) {
            const options = optionsInput.split(',').map(o => o.trim().toLowerCase());
            exercise.options = [word, ...options];
        }
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.naming) customExercises.naming = [];
        customExercises.naming.push(exercise);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        this.pendingImage = null;
        await this.render();
    }
    
    async handleAddSentence() {
        const sentence = this.container.querySelector('#sentence-input').value.trim();
        const answer = this.container.querySelector('#sentence-answer').value.trim().toLowerCase();
        
        if (!sentence || !answer) return;
        
        const exercise = {
            sentence: sentence.includes('__') ? sentence : sentence + ' __',
            answer,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.sentenceTyping) customExercises.sentenceTyping = [];
        customExercises.sentenceTyping.push(exercise);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        await this.render();
    }
    
    async handleAddWords() {
        const type = this.container.querySelector('#word-type').value;
        const mainWord = this.container.querySelector('#main-word').value.trim().toLowerCase();
        const relatedWords = this.container.querySelector('#related-words').value
            .split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        
        if (!mainWord || relatedWords.length === 0) return;
        
        const exercise = {
            word: mainWord,
            [type]: relatedWords,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises[type]) customExercises[type] = [];
        customExercises[type].push(exercise);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        await this.render();
    }
    
    async handleAddTimeSequencing() {
        const question = this.container.querySelector('#time-question').value.trim();
        const answer = this.container.querySelector('#time-answer').value.trim();
        const options = this.container.querySelector('#time-options').value
            .split(',').map(o => o.trim()).filter(o => o);
        
        if (!question || !answer || options.length < 3) return;
        
        // Ensure answer is included in options
        const allOptions = [answer, ...options].slice(0, 4);
        
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        const exercise = {
            question: question,
            answer: answer,
            options: allOptions,
            direction: question.toLowerCase().includes('before') ? 'before' : 'after',
            target: this.extractTargetFromQuestion(question),
            sequence: this.getSequenceFromQuestion(question),
            difficulty: difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.timeSequencing) customExercises.timeSequencing = [];
        customExercises.timeSequencing.push(exercise);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        await this.render();
    }
    
    async handleAddTimeOrdering() {
        const scenario = this.container.querySelector('#ordering-scenario').value.trim();
        const description = this.container.querySelector('#ordering-description').value.trim();
        const items = this.container.querySelector('#ordering-items').value
            .split('\n').map(item => item.trim()).filter(item => item);
        
        if (!scenario || !description || items.length < 3) return;
        
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        const exercise = {
            id: `custom_${Date.now()}`,
            scenario: scenario,
            description: description,
            items: items,
            correctOrder: [...items], // Assume input is in correct order
            difficulty: difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.timeOrdering) customExercises.timeOrdering = [];
        customExercises.timeOrdering.push(exercise);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        await this.render();
    }
    
    async handleAddClockMatching() {
        const timeValue = this.container.querySelector('#clock-time').value;
        const timeWords = this.container.querySelector('#clock-words').value.trim();
        
        if (!timeValue || !timeWords) return;
        
        const [hourStr, minuteStr] = timeValue.split(':');
        const hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        
        // Calculate analog data
        const minuteAngle = minute * 6; // 6 degrees per minute
        const hourAngle = (hour % 12) * 30 + (minute * 0.5); // 30 degrees per hour + minute adjustment
        
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        const exercise = {
            id: `custom_${Date.now()}`,
            time: timeValue,
            hour: hour,
            minute: minute,
            digitalDisplay: timeValue,
            analogData: {
                hourAngle: hourAngle,
                minuteAngle: minuteAngle
            },
            timeWords: timeWords,
            difficulty: difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.clockMatching) customExercises.clockMatching = [];
        customExercises.clockMatching.push(exercise);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        await this.render();
    }
    
    async handleAddWorkingMemory() {
        const sequence = this.container.querySelector('#memory-sequence').value.trim();
        const extraOptions = this.container.querySelector('#memory-options').value.trim();
        
        if (!sequence || !extraOptions) return;
        
        // Parse emoji sequence (expect 3 emojis)
        const sequenceArray = Array.from(sequence).filter(char => 
            /[\u{1F600}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u.test(char)
        ).slice(0, 3);
        
        // Parse extra options
        const extraOptionsArray = Array.from(extraOptions).filter(char => 
            /[\u{1F600}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u.test(char)
        );
        
        if (sequenceArray.length !== 3 || extraOptionsArray.length < 3) return;
        
        const allOptions = [...sequenceArray, ...extraOptionsArray];
        
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        const exercise = {
            id: `custom_${Date.now()}`,
            sequence: sequenceArray,
            options: allOptions,
            difficulty: difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.workingMemory) customExercises.workingMemory = [];
        customExercises.workingMemory.push(exercise);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        await this.render();
    }
    
    extractTargetFromQuestion(question) {
        // Simple extraction - could be improved
        const words = question.toLowerCase().split(' ');
        const targetIndex = words.findIndex(word => 
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
             'january', 'february', 'march', 'april', 'may', 'june', 
             'july', 'august', 'september', 'october', 'november', 'december'].includes(word)
        );
        return targetIndex !== -1 ? words[targetIndex] : '';
    }
    
    getSequenceFromQuestion(question) {
        if (question.toLowerCase().includes('day')) {
            return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        } else {
            return ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
        }
    }
    
    async handleCSVUpload(file) {
        const errorPanel = this.container.querySelector('#upload-errors');
        const previewPanel = this.container.querySelector('#upload-preview');
        
        try {
            const result = await csvService.parseCSV(file);
            
            if (result.errors.length > 0) {
                errorPanel.innerHTML = `
                    <h4>⚠️ Issues found:</h4>
                    <ul class="error-list">
                        ${result.errors.map(err => `
                            <li class="error-item">
                                <strong>Row ${err.row}:</strong> ${err.message}
                                ${err.suggestion ? `<br><em>Suggestion: ${err.suggestion}</em>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                    ${result.data.length > 0 ? `
                        <p class="error-note">✓ ${result.data.length} valid exercises can still be imported</p>
                    ` : ''}
                `;
                errorPanel.hidden = false;
            } else {
                errorPanel.hidden = true;
            }
            
            if (result.data.length > 0) {
                previewPanel.innerHTML = `
                    <h4>✓ Ready to import ${result.data.length} exercises</h4>
                    <div class="preview-actions">
                        <button class="btn btn--ghost" id="cancel-import">Cancel</button>
                        <button class="btn btn--primary" id="confirm-import">Import All Valid</button>
                    </div>
                `;
                previewPanel.hidden = false;
                
                this.container.querySelector('#cancel-import')?.addEventListener('click', () => {
                    previewPanel.hidden = true;
                    errorPanel.hidden = true;
                });
                
                this.container.querySelector('#confirm-import')?.addEventListener('click', () => {
                    this.importCSVData(result.type, result.data);
                });
            }
            
        } catch (error) {
            errorPanel.innerHTML = `
                <h4>❌ Upload Failed</h4>
                <p>${error.message}</p>
            `;
            errorPanel.hidden = false;
        }
    }
    
    importCSVData(type, data) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises[type]) customExercises[type] = [];
        customExercises[type].push(...data);
        storageService.set(`customExercises_${locale}`, customExercises);
        
        alert(`Successfully imported ${data.length} exercises!`);
        this.render();
    }
    
    downloadTemplate(type) {
        // Get localized template examples
        const locale = i18n.getCurrentLocale();
        const isGerman = locale === 'de';
        
        const templates = {
            naming: {
                headers: ['word', 'image_url', 'option1', 'option2', 'option3'],
                rows: isGerman ? [
                    ['Apfel', 'https://example.com/apfel.jpg', 'Banane', 'Orange', 'Birne'],
                    ['Auto', 'https://example.com/auto.jpg', 'Bus', 'Zug', 'Fahrrad']
                ] : [
                    ['apple', 'https://example.com/apple.jpg', 'banana', 'orange', 'pear'],
                    ['car', 'https://example.com/car.jpg', 'bus', 'train', 'bike']
                ]
            },
            sentences: {
                headers: ['sentence', 'answer'],
                rows: isGerman ? [
                    ['Ich trinke jeden Morgen __', 'Kaffee'],
                    ['Die Katze saß auf der __', 'Matte']
                ] : [
                    ['I drink __ every morning', 'coffee'],
                    ['The cat sat on the __', 'mat']
                ]
            },
            words: {
                headers: ['type', 'word', 'related_words'],
                rows: isGerman ? [
                    ['rhyming', 'Katze', 'Tatze|Matze|Platze'],
                    ['synonyms', 'glücklich', 'froh|fröhlich|zufrieden'],
                    ['association', 'Brot', 'Butter|Toast|Sandwich']
                ] : [
                    ['rhyming', 'cat', 'hat|bat|mat'],
                    ['synonyms', 'happy', 'joyful|glad|cheerful'],
                    ['association', 'bread', 'butter|toast|sandwich']
                ]
            }
        };
        
        const template = templates[type];
        if (!template) return;
        
        csvService.downloadCSV(template, `${type}_template.csv`);
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        this.container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.container.querySelector('#individual-mode').hidden = mode !== 'individual';
        this.container.querySelector('#bulk-mode').hidden = mode !== 'bulk';
    }
    
    async archiveItem(type, index) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        if (customExercises[type] && customExercises[type][index]) {
            customExercises[type][index].status = 'archived';
            storageService.set(`customExercises_${locale}`, customExercises);
            console.log('Archived item:', type, index);
        }
        
        await this.render();
    }
    
    async unarchiveItem(type, index) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        if (customExercises[type] && customExercises[type][index]) {
            customExercises[type][index].status = 'active';
            storageService.set(`customExercises_${locale}`, customExercises);
            console.log('Unarchived item:', type, index);
        }
        
        await this.render();
    }
    
    async editItem(type, index) {
        // Switch to individual mode and load the item for editing
        this.switchMode('individual');
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        const item = customExercises[type]?.[index];
        
        if (!item) {
            console.warn('Item not found for editing:', type, index);
            return;
        }
        
        console.log('Editing item:', type, index, item);
        
        // Render the form with pre-filled data
        const formContainer = this.container.querySelector('#add-form-container');
        if (formContainer) {
            formContainer.innerHTML = this.renderIndividualForm(type, item, index);
            this.attachFormListeners(type);
        }
        
        // Scroll to form
        formContainer?.scrollIntoView({ behavior: 'smooth' });
    }
    
    async deleteItem(type, index) {
        if (!confirm(t('customize.confirmDelete'))) return;
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        if (customExercises[type] && customExercises[type][index]) {
            const item = customExercises[type][index];
            if (item.localImageId) {
                await imageStorage.deleteImage(item.localImageId);
            }
            
            customExercises[type].splice(index, 1);
            storageService.set(`customExercises_${locale}`, customExercises);
        }
        
        await this.render();
    }
}

export default CustomizePage;
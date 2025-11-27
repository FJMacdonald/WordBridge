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
    
    renderDifficultyField(selectedDifficulty = 'medium') {
        return `
            <div class="form-group">
                <label>${t('customize.forms.difficulty')}</label>
                <select id="exercise-difficulty" required>
                    <option value="easy" ${selectedDifficulty === 'easy' ? 'selected' : ''}>${t('customize.forms.easy')}</option>
                    <option value="medium" ${selectedDifficulty === 'medium' ? 'selected' : ''}>${t('customize.forms.medium')}</option>
                    <option value="hard" ${selectedDifficulty === 'hard' ? 'selected' : ''}>${t('customize.forms.hard')}</option>
                </select>
            </div>
        `;
    }
    
    getImageStatus(editItem) {
        if (editItem) {
            if (editItem.localImageId) {
                return '📁 Uploaded File (current)';
            } else if (editItem.emoji) {
                return `😊 Emoji: ${editItem.emoji} (current)`;
            } else if (editItem.imageUrl) {
                return `🔗 URL: ${editItem.imageUrl.substring(0, 30)}... (current)`;
            }
        }
        return 'Choose one option above';
    }
    
    async getImagePreview(editItem) {
        if (editItem) {
            if (editItem.localImageId) {
                // Get the actual image data from storage
                try {
                    const imageData = await imageStorage.getImage(editItem.localImageId);
                    if (imageData) {
                        return `<div class="existing-image image-type-file"><img src="${imageData}" alt="Current uploaded image" style="max-width: 100px; max-height: 100px;"><br><small>Current uploaded file</small></div>`;
                    }
                } catch (error) {
                    console.warn('Could not load stored image:', error);
                }
                return '<div class="existing-image image-type-file">📁 <strong>Uploaded File</strong><br><small>Existing image will be kept if no changes made</small></div>';
            } else if (editItem.emoji) {
                return `<div class="existing-image-preview image-type-emoji"><div class="current-emoji">${editItem.emoji}</div><small>Current emoji</small></div>`;
            } else if (editItem.imageUrl) {
                return `<div class="existing-image image-type-url"><img src="${editItem.imageUrl}" alt="Current" style="max-width: 100px; max-height: 100px;"><br><small>Current URL image</small></div>`;
            }
        }
        return '';
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
                        
                        <div class="dropdown-selectors">
                            <!-- Words Category Dropdown -->
                            <div class="category-dropdown">
                                <label class="category-label">📚 Words</label>
                                <select class="type-dropdown" data-category="words">
                                    <option value="">Select exercise type...</option>
                                    <option value="naming">🖼️ Picture Naming</option>
                                    <option value="typing">⌨️ Typing</option>
                                    <option value="sentenceTyping">📝 Fill Blank</option>
                                    <option value="category">📁 Categories</option>
                                </select>
                            </div>
                            
                            <!-- Phonetics Category Dropdown -->
                            <div class="category-dropdown">
                                <label class="category-label">🔊 Phonetics</label>
                                <select class="type-dropdown" data-category="phonetics">
                                    <option value="">Select exercise type...</option>
                                    <option value="listening">👂 Listening</option>
                                    <option value="speaking">🎤 Speaking</option>
                                    <option value="firstSound">🔤 First Sounds</option>
                                    <option value="rhyming">🎵 Rhyming</option>
                                </select>
                            </div>
                            
                            <!-- Meaning Category Dropdown -->
                            <div class="category-dropdown">
                                <label class="category-label">💡 Meaning</label>
                                <select class="type-dropdown" data-category="meaning">
                                    <option value="">Select exercise type...</option>
                                    <option value="definitions">📖 Definitions</option>
                                    <option value="association">🔗 Association</option>
                                    <option value="synonyms">≈ Synonyms</option>
                                    <option value="scramble">🔀 Unscramble</option>
                                </select>
                            </div>
                            
                            <!-- Time Category Dropdown -->
                            <div class="category-dropdown">
                                <label class="category-label">⏰ Time</label>
                                <select class="type-dropdown" data-category="time">
                                    <option value="">Select exercise type...</option>
                                    <option value="timeSequencing">📅 Time Sequencing</option>
                                    <option value="clockMatching">🕐 Clock Matching</option>
                                    <option value="timeOrdering">⏰ Time Ordering</option>
                                    <option value="workingMemory">🧠 Working Memory</option>
                                </select>
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
                            <div class="checkbox-grid">
                                <label><input type="checkbox" value="naming" checked> 🖼️ Picture Naming</label>
                                <label><input type="checkbox" value="typing" checked> ⌨️ Typing</label>
                                <label><input type="checkbox" value="sentenceTyping" checked> 📝 Fill Blank</label>
                                <label><input type="checkbox" value="category" checked> 📁 Categories</label>
                            </div>
                        </div>
                        
                        <!-- Phonetics -->
                        <div class="checkbox-category">
                            <strong>🔊 Phonetics:</strong>
                            <div class="checkbox-grid">
                                <label><input type="checkbox" value="listening" checked> 👂 Listening</label>
                                <label><input type="checkbox" value="speaking" checked> 🎤 Speaking</label>
                                <label><input type="checkbox" value="firstSound" checked> 🔤 First Sounds</label>
                                <label><input type="checkbox" value="rhyming" checked> 🎵 Rhyming</label>
                            </div>
                        </div>
                        
                        <!-- Meaning -->
                        <div class="checkbox-category">
                            <strong>💡 Meaning:</strong>
                            <div class="checkbox-grid">
                                <label><input type="checkbox" value="definitions" checked> 📖 Definitions</label>
                                <label><input type="checkbox" value="association" checked> 🔗 Association</label>
                                <label><input type="checkbox" value="synonyms" checked> ≈ Synonyms</label>
                                <label><input type="checkbox" value="scramble" checked> 🔀 Unscramble</label>
                            </div>
                        </div>
                        
                        <!-- Time -->
                        <div class="checkbox-category">
                            <strong>⏰ Time:</strong>
                            <div class="checkbox-grid">
                                <label><input type="checkbox" value="timeSequencing" checked> 📅 Time Sequencing</label>
                                <label><input type="checkbox" value="clockMatching" checked> 🕐 Clock Matching</label>
                                <label><input type="checkbox" value="timeOrdering" checked> ⏰ Time Ordering</label>
                                <label><input type="checkbox" value="workingMemory" checked> 🧠 Working Memory</label>
                            </div>
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
                                        <strong>🖼️ Picture Naming / ⌨️ Typing / 👂 Listening:</strong>
                                        <code>word, emoji_or_image_url, option1, option2, option3, difficulty</code>
                                        <p>Example: apple, 🍎, banana, orange, pear, easy</p>
                                        <p>Or: apple, https://example.com/apple.jpg, banana, orange, pear, easy</p>
                                        <small>Note: This creates exercises for all three types. Options are ignored for typing.</small>
                                    </div>
                                    <div class="format-item">
                                        <strong>📁 Categories (category):</strong>
                                        <code>category, word, option1, option2, option3, difficulty</code>
                                        <p>Example: fruit, apple, apple, carrot, bread, chair, easy</p>
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
                                        <strong>🖼️ Picture Naming / ⌨️ Typing / 👂 Listening:</strong>
                                        <code>word, emoji_or_image_url, option1, option2, option3, difficulty</code>
                                        <p>Same format as above - creates exercises for all three types</p>
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
    
    renderIndividualForm(type, editItem = null, editIndex = null) {
        switch (type) {
            case 'naming':
            case 'typing':
            case 'listening':
                return this.renderImageWordForm(type, editItem, editIndex);
            case 'sentenceTyping':
                return this.renderSentenceForm(editItem, editIndex);
            case 'category':
                return this.renderCategoryForm(editItem, editIndex);
            case 'speaking':
                return this.renderSpeakingForm(editItem, editIndex);
            case 'firstSound':
                return this.renderFirstSoundForm(editItem, editIndex);
            case 'rhyming':
                return this.renderRhymingForm(editItem, editIndex);
            case 'definitions':
                return this.renderDefinitionsForm(editItem, editIndex);
            case 'association':
                return this.renderAssociationForm(editItem, editIndex);
            case 'synonyms':
                return this.renderSynonymsForm(editItem, editIndex);
            case 'scramble':
                return this.renderScrambleForm(editItem, editIndex);
            case 'timeSequencing':
                return this.renderTimeSequencingForm(editItem, editIndex);
            case 'timeOrdering':
                return this.renderTimeOrderingForm(editItem, editIndex);
            case 'clockMatching':
                return this.renderClockMatchingForm(editItem, editIndex);
            case 'workingMemory':
                return this.renderWorkingMemoryForm(editItem, editIndex);
            default:
                return '';
        }
    }
    
    renderImageWordForm(type, editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        const exerciseNames = {
            naming: 'Picture Naming',
            typing: 'Typing',
            listening: 'Listening'
        };
        
        const descriptions = {
            naming: 'Users will see the image and select the correct word from multiple choices.',
            typing: 'Users will see the image and type the correct word. Wrong options are ignored for typing exercises.',
            listening: 'Users will hear the word and select the matching image from multiple choices.'
        };
        
        return `
            <form class="add-form" id="add-imageword-form" data-edit-type="${editItem ? type : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? `Edit ${exerciseNames[type]} Exercise` : `Add ${exerciseNames[type]} Exercise`}</h3>
                
                <!-- Collapsible Info Box -->
                <details class="info-box">
                    <summary class="info-header">
                        💡 About Image-Word Exercises
                    </summary>
                    <div class="info-content">
                        <p><strong>This data is shared across Picture Naming, Typing, and Listening exercises:</strong></p>
                        <ul>
                            <li><strong>Picture Naming:</strong> ${descriptions.naming}</li>
                            <li><strong>Typing:</strong> ${descriptions.typing}</li>
                            <li><strong>Listening:</strong> ${descriptions.listening}</li>
                        </ul>
                        <p><em>When you save this exercise, it will appear in all three exercise types in your library.</em></p>
                    </div>
                </details>
                
                <div class="form-group">
                    <label>Target Word</label>
                    <input type="text" id="word-input" placeholder="e.g., apple" 
                           value="${editItem ? editItem.answer || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Image (Upload, Emoji, or URL)</label>
                    <div class="image-upload-area">
                        <input type="file" id="image-upload" accept="image/*" style="display: none;">
                        <div class="upload-options">
                            <button type="button" class="file-select-btn" id="file-select-btn">
                                📁 Upload Image
                            </button>
                            <input type="text" id="emoji-input" placeholder="🍎 or enter emoji" 
                                   value="${editItem && editItem.emoji ? editItem.emoji : ''}">
                            <input type="text" id="image-url" placeholder="https://example.com/image.jpg" 
                                   value="${editItem && editItem.imageUrl ? editItem.imageUrl : ''}">
                        </div>
                        <span class="file-status" id="file-status">${this.getImageStatus(editItem)}</span>
                        <div class="image-preview" id="image-preview"></div>
                    </div>
                    <small>Upload a file, enter an emoji, or provide an image URL</small>
                </div>
                
                <div class="form-group">
                    <label>Wrong Options (for Picture Naming & Listening only)</label>
                    <input type="text" id="options-input" placeholder="e.g., banana, orange, grape"
                           value="${editItem && editItem.options ? editItem.options.slice(1).join(', ') : ''}">
                    <small>Comma-separated wrong answers (minimum 3 required). Leave empty to auto-generate. Ignored for Typing exercises.</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">Cancel</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : 'Add Exercise'}</button>
                </div>
            </form>
        `;
    }
    
    renderSentenceForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-sentence-form" data-edit-type="${editItem ? 'sentenceTyping' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Sentence Exercise' : t('customize.forms.addSentenceExercise')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.sentenceWithBlank')}</label>
                    <input type="text" id="sentence-input" 
                           placeholder="${t('customize.forms.sentencePlaceholder')}" 
                           value="${editItem ? editItem.sentence || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.answer')}</label>
                    <input type="text" id="sentence-answer" placeholder="${t('customize.forms.answerPlaceholder')}" 
                           value="${editItem ? editItem.answer || '' : ''}" required>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    
    renderCategoryForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-category-form" data-edit-type="${editItem ? 'category' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Category Exercise' : 'Add Category Exercise'}</h3>
                
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" id="category-name" placeholder="e.g., fruit, animal, color" 
                           value="${editItem ? editItem.category || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Correct Word (belongs to category)</label>
                    <input type="text" id="category-word" placeholder="e.g., apple" 
                           value="${editItem ? editItem.word || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Wrong Options (comma separated)</label>
                    <input type="text" id="category-options" 
                           placeholder="e.g., carrot, bread, chair"
                           value="${editItem && editItem.options ? editItem.options.slice(1).join(', ') : ''}" required>
                    <small>Enter 3 words that do NOT belong to the category</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    
    renderSpeakingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-speaking-form" data-edit-type="${editItem ? 'speaking' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Speaking Exercise' : 'Add Speaking Exercise'}</h3>
                
                <div class="form-group">
                    <label>Target Word</label>
                    <input type="text" id="speak-word" placeholder="e.g., apple" 
                           value="${editItem ? editItem.answer || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Emoji/Icon</label>
                    <input type="text" id="speak-emoji" placeholder="🍎" 
                           value="${editItem ? editItem.emoji || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Practice Phrases (one per line)</label>
                    <textarea id="speak-phrases" rows="3" 
                              placeholder="An apple a day keeps the doctor away&#10;I eat an apple for snack&#10;The apple is red and sweet">${editItem && editItem.phrases ? editItem.phrases.join('\n') : ''}</textarea>
                    <small>Optional phrases to help practice the word</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderFirstSoundForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-firstsound-form" data-edit-type="${editItem ? 'firstSound' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit First Sound Exercise' : 'Add First Sound Exercise'}</h3>
                
                <div class="form-group">
                    <label>Target Sound</label>
                    <input type="text" id="target-sound" placeholder="e.g., b" 
                           value="${editItem ? editItem.sound || '' : ''}" required>
                    <small>The sound that words should start with</small>
                </div>
                
                <div class="form-group">
                    <label>Words with this sound (comma separated)</label>
                    <input type="text" id="sound-words" 
                           placeholder="e.g., ball, book, bed, bird, box"
                           value="${editItem && editItem.words ? editItem.words.join(', ') : ''}" required>
                    <small>Enter at least 4 words that start with this sound (minimum 4 required)</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderRhymingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-rhyming-form" data-edit-type="${editItem ? 'rhyming' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Rhyming Exercise' : 'Add Rhyming Exercise'}</h3>
                
                <div class="form-group">
                    <label>Target Word</label>
                    <input type="text" id="rhyme-word" placeholder="e.g., cat" 
                           value="${editItem ? editItem.word || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Rhyming Words (comma separated)</label>
                    <input type="text" id="rhyme-words" 
                           placeholder="e.g., hat, bat, mat"
                           value="${editItem && editItem.rhymes ? editItem.rhymes.join(', ') : ''}" required>
                    <small>Enter at least 2 words that rhyme with the target word (minimum 2 required)</small>
                </div>
                
                <div class="form-group">
                    <label>Non-rhyming Words (comma separated)</label>
                    <input type="text" id="non-rhyme-words" 
                           placeholder="e.g., dog, cup, tree"
                           value="${editItem && editItem.nonRhymes ? editItem.nonRhymes.join(', ') : ''}" required>
                    <small>Enter at least 2 words that do NOT rhyme (minimum 2 required)</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderDefinitionsForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-definitions-form" data-edit-type="${editItem ? 'definitions' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Definition Exercise' : 'Add Definition Exercise'}</h3>
                
                <div class="form-group">
                    <label>Word</label>
                    <input type="text" id="def-word" placeholder="e.g., chair" 
                           value="${editItem ? editItem.word || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Definition</label>
                    <textarea id="word-definition" rows="3" 
                              placeholder="e.g., A piece of furniture for sitting" required>${editItem ? editItem.definition || '' : ''}</textarea>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderAssociationForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-association-form" data-edit-type="${editItem ? 'association' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Association Exercise' : 'Add Association Exercise'}</h3>
                
                <div class="form-group">
                    <label>Main Word</label>
                    <input type="text" id="assoc-word" placeholder="e.g., bread" 
                           value="${editItem ? editItem.word || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Related Words (comma separated)</label>
                    <input type="text" id="assoc-related" 
                           placeholder="e.g., butter, toast"
                           value="${editItem && editItem.associated ? editItem.associated.join(', ') : ''}" required>
                    <small>Words that go well with the main word (minimum 2 required)</small>
                </div>
                
                <div class="form-group">
                    <label>Unrelated Words (comma separated)</label>
                    <input type="text" id="assoc-unrelated" 
                           placeholder="e.g., car, phone"
                           value="${editItem && editItem.unrelated ? editItem.unrelated.join(', ') : ''}" required>
                    <small>Words that don't relate to the main word (minimum 2 required)</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderSynonymsForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-synonyms-form" data-edit-type="${editItem ? 'synonyms' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Synonyms Exercise' : 'Add Synonyms Exercise'}</h3>
                
                <div class="form-group">
                    <label>Main Word</label>
                    <input type="text" id="syn-word" placeholder="e.g., happy" 
                           value="${editItem ? editItem.word || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Synonyms (comma separated)</label>
                    <input type="text" id="syn-synonyms" 
                           placeholder="e.g., glad, joyful"
                           value="${editItem && editItem.synonyms ? editItem.synonyms.join(', ') : ''}" required>
                    <small>Words that mean the same (minimum 2 required)</small>
                </div>
                
                <div class="form-group">
                    <label>Antonyms (comma separated)</label>
                    <input type="text" id="syn-antonyms" 
                           placeholder="e.g., sad, unhappy"
                           value="${editItem && editItem.antonyms ? editItem.antonyms.join(', ') : ''}" required>
                    <small>Words that mean the opposite (minimum 2 required)</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderScrambleForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-scramble-form" data-edit-type="${editItem ? 'scramble' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Unscramble Exercise' : 'Add Unscramble Exercise'}</h3>
                
                <div class="form-group">
                    <label>Sentence (space separated)</label>
                    <input type="text" id="scramble-sentence" 
                           placeholder="e.g., The cat is sleeping"
                           value="${editItem && editItem.words ? editItem.words.join(' ') : ''}" required>
                    <small>Enter the correct sentence - it will be scrambled for the user</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderTimeSequencingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        const wrongOptions = editItem && editItem.options ? 
            editItem.options.filter(o => o !== editItem.answer).join(', ') : '';
        return `
            <form class="add-form" id="add-timesequencing-form" data-edit-type="${editItem ? 'timeSequencing' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Time Sequencing Exercise' : t('customize.forms.addTimeSequencing')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.question')}</label>
                    <input type="text" id="time-question" placeholder="${t('customize.forms.timeQuestionPlaceholder')}" 
                           value="${editItem ? editItem.question || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.correctAnswer')}</label>
                    <input type="text" id="time-answer" placeholder="${t('customize.forms.timeAnswerPlaceholder')}" 
                           value="${editItem ? editItem.answer || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.wrongOptions')}</label>
                    <input type="text" id="time-options" 
                           placeholder="${t('customize.forms.timeOptionsPlaceholder')}" 
                           value="${wrongOptions}" required>
                    <small>${t('customize.forms.timeOptionsHelp')}</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderTimeOrderingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-timeordering-form" data-edit-type="${editItem ? 'timeOrdering' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Time Ordering Exercise' : t('customize.forms.addTimeOrdering')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.scenario')}</label>
                    <input type="text" id="ordering-scenario" placeholder="${t('customize.forms.scenarioPlaceholder')}" 
                           value="${editItem ? editItem.scenario || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.description')}</label>
                    <input type="text" id="ordering-description" placeholder="${t('customize.forms.descriptionPlaceholder')}" 
                           value="${editItem ? editItem.description || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.activities')}</label>
                    <textarea id="ordering-items" rows="4" 
                              placeholder="${t('customize.forms.activitiesPlaceholder')}" required>${editItem && editItem.items ? editItem.items.join('\n') : ''}</textarea>
                    <small>${t('customize.forms.activitiesHelp')}</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderClockMatchingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form" id="add-clockmatching-form" data-edit-type="${editItem ? 'clockMatching' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Clock Matching Exercise' : t('customize.forms.addClockMatching')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.digitalTime')}</label>
                    <input type="time" id="clock-time" 
                           value="${editItem ? editItem.time || '' : ''}" required>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.timeWords')}</label>
                    <input type="text" id="clock-words" placeholder="${t('customize.forms.timeWordsPlaceholder')}" 
                           value="${editItem ? editItem.timeWords || '' : ''}" required>
                    <small>${t('customize.forms.timeWordsHelp')}</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderWorkingMemoryForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        const extraOptions = editItem && editItem.options && editItem.sequence ?
            editItem.options.filter(o => !editItem.sequence.includes(o)).join('') : '';
        return `
            <form class="add-form" id="add-workingmemory-form" data-edit-type="${editItem ? 'workingMemory' : ''}" data-edit-index="${editIndex || ''}">
                <h3>${isEditing ? 'Edit Working Memory Exercise' : t('customize.forms.addWorkingMemory')}</h3>
                
                <div class="form-group">
                    <label>${t('customize.forms.emojiSequence')}</label>
                    <input type="text" id="memory-sequence" placeholder="${t('customize.forms.sequencePlaceholder')}" 
                           value="${editItem && editItem.sequence ? editItem.sequence.join('') : ''}" required>
                    <small>${t('customize.forms.sequenceHelp')}</small>
                </div>
                
                <div class="form-group">
                    <label>${t('customize.forms.extraOptions')}</label>
                    <input type="text" id="memory-options" placeholder="${t('customize.forms.extraOptionsPlaceholder')}" 
                           value="${extraOptions}" required>
                    <small>${t('customize.forms.extraOptionsHelp')} (Minimum 3 additional emojis required)</small>
                </div>
                
                ${this.renderDifficultyField(editItem?.difficulty)}
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? 'Update Exercise' : t('customize.forms.addExercise')}</button>
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
                    <select class="action-dropdown" data-type="${type}" data-index="${index}">
                        <option value="">Actions...</option>
                        <option value="edit">✏️ Edit</option>
                        ${!isArchived ? 
                            '<option value="archive">📦 Archive</option>' : 
                            '<option value="unarchive">📂 Unarchive</option>'
                        }
                        <option value="delete">🗑️ Delete</option>
                    </select>
                </td>
            </tr>
        `;
    }
    
    getTypeName(type) {
        const names = {
            naming: 'Picture Naming',
            typing: 'Typing',
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
        
        // Exercise type selection from dropdowns
        this.container.querySelectorAll('.type-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', async () => {
                const selectedType = dropdown.value;
                
                if (selectedType) {
                    // Clear other dropdowns
                    this.container.querySelectorAll('.type-dropdown').forEach(d => {
                        if (d !== dropdown) d.value = '';
                    });
                    
                    this.container.querySelector('#add-form-container').innerHTML = 
                        this.renderIndividualForm(selectedType);
                    await this.attachFormListeners(selectedType);
                } else {
                    this.container.querySelector('#add-form-container').innerHTML = '';
                }
            });
        });
        
        // Template download
        const downloadBtn = this.container.querySelector('#download-template');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadTemplate());
        }
        
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
        
        // Action dropdown in spreadsheet
        this.container.addEventListener('change', async (e) => {
            if (!e.target.classList.contains('action-dropdown')) return;
            
            const dropdown = e.target;
            const action = dropdown.value;
            const type = dropdown.dataset.type;
            const index = parseInt(dropdown.dataset.index);
            
            if (!action) return;
            
            // Reset dropdown
            dropdown.value = '';
            
            if (action === 'edit') {
                await this.editItem(type, index);
            } else if (action === 'archive') {
                await this.archiveItem(type, index);
            } else if (action === 'unarchive') {
                await this.unarchiveItem(type, index);
            } else if (action === 'delete') {
                await this.deleteItem(type, index);
            }
        });
    }
    
    async attachFormListeners(type) {
        const form = this.container.querySelector('.add-form');
        if (!form) return;
        
        // Populate image preview for editing
        const editType = form.dataset.editType;
        const editIndex = form.dataset.editIndex;
        if (editType && editIndex) {
            const locale = i18n.getCurrentLocale();
            const customExercises = storageService.get(`customExercises_${locale}`, {});
            const editItem = customExercises[editType]?.[editIndex];
            if (editItem) {
                const preview = await this.getImagePreview(editItem);
                const previewContainer = form.querySelector('#image-preview');
                if (previewContainer) {
                    previewContainer.innerHTML = preview;
                }
            }
        }
        
        // Cancel button
        form.querySelector('#cancel-form')?.addEventListener('click', () => {
            this.container.querySelector('#add-form-container').innerHTML = '';
        });
        
        // Image upload handling for unified form
        const imageInput = form.querySelector('#image-upload');
        const fileSelectBtn = form.querySelector('#file-select-btn');
        const fileStatus = form.querySelector('#file-status');
        const emojiInput = form.querySelector('#emoji-input');
        const imageUrlInput = form.querySelector('#image-url');
        const imagePreview = form.querySelector('#image-preview');
        
        if (imageInput && fileSelectBtn) {
            // Custom file button click
            fileSelectBtn.addEventListener('click', () => {
                imageInput.click();
            });
            
            // Handle file selection
            imageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileStatus.textContent = `File: ${file.name}`;
                    const resized = await imageStorage.resizeImage(file);
                    imagePreview.innerHTML = `<img src="${resized}" alt="Preview" style="max-width: 100px; max-height: 100px;">`;
                    this.pendingImage = resized;
                    // Clear other inputs
                    if (emojiInput) emojiInput.value = '';
                    if (imageUrlInput) imageUrlInput.value = '';
                } else {
                    fileStatus.textContent = 'Choose one option above';
                    imagePreview.innerHTML = '';
                }
            });
        }
        
        // Handle emoji input
        if (emojiInput) {
            emojiInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value) {
                    fileStatus.textContent = `Emoji: ${value}`;
                    imagePreview.innerHTML = `<div style="font-size: 4rem;">${value}</div>`;
                    // Clear other inputs
                    if (imageInput) imageInput.value = '';
                    if (imageUrlInput) imageUrlInput.value = '';
                    this.pendingImage = null;
                } else if (!imageInput?.files[0] && !imageUrlInput?.value) {
                    fileStatus.textContent = 'Choose one option above';
                    imagePreview.innerHTML = '';
                }
            });
        }
        
        // Handle image URL input  
        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value) {
                    fileStatus.textContent = `URL: ${value.substring(0, 30)}...`;
                    imagePreview.innerHTML = `<img src="${value}" alt="URL Preview" style="max-width: 100px; max-height: 100px;" onerror="this.innerHTML='❌ Invalid URL';">`;
                    // Clear other inputs
                    if (imageInput) imageInput.value = '';
                    if (emojiInput) emojiInput.value = '';
                    this.pendingImage = null;
                } else if (!imageInput?.files[0] && !emojiInput?.value) {
                    fileStatus.textContent = 'Choose one option above';
                    imagePreview.innerHTML = '';
                }
            });
        }
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check if this is an edit operation
            const editType = form.dataset.editType;
            const editIndex = form.dataset.editIndex;
            const isEdit = editType && editIndex !== '';
            
            switch (type) {
                case 'naming':
                case 'typing':
                case 'listening':
                    await this.handleAddImageWord(type, isEdit, editType, parseInt(editIndex));
                    break;
                case 'sentenceTyping':
                    await this.handleAddSentence(isEdit, editType, parseInt(editIndex));
                    break;
                case 'category':
                    await this.handleAddCategory(isEdit, editType, parseInt(editIndex));
                    break;
                case 'speaking':
                    await this.handleAddSpeaking(isEdit, editType, parseInt(editIndex));
                    break;
                case 'firstSound':
                    await this.handleAddFirstSound(isEdit, editType, parseInt(editIndex));
                    break;
                case 'rhyming':
                    await this.handleAddRhyming(isEdit, editType, parseInt(editIndex));
                    break;
                case 'definitions':
                    await this.handleAddDefinitions(isEdit, editType, parseInt(editIndex));
                    break;
                case 'association':
                    await this.handleAddAssociation(isEdit, editType, parseInt(editIndex));
                    break;
                case 'synonyms':
                    await this.handleAddSynonyms(isEdit, editType, parseInt(editIndex));
                    break;
                case 'scramble':
                    await this.handleAddScramble(isEdit, editType, parseInt(editIndex));
                    break;
                case 'timeSequencing':
                    await this.handleAddTimeSequencing(isEdit, editType, parseInt(editIndex));
                    break;
                case 'timeOrdering':
                    await this.handleAddTimeOrdering(isEdit, editType, parseInt(editIndex));
                    break;
                case 'clockMatching':
                    await this.handleAddClockMatching(isEdit, editType, parseInt(editIndex));
                    break;
                case 'workingMemory':
                    await this.handleAddWorkingMemory(isEdit, editType, parseInt(editIndex));
                    break;
            }
        });
    }
    
    async handleAddImageWord(formType, isEdit = false, editType = null, editIndex = null) {
        const word = this.container.querySelector('#word-input').value.trim().toLowerCase();
        const optionsInput = this.container.querySelector('#options-input').value;
        const emojiInput = this.container.querySelector('#emoji-input').value.trim();
        const imageUrlInput = this.container.querySelector('#image-url').value.trim();
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!word) return;
        
        const baseExercise = {
            answer: word,
            difficulty,
            isCustom: true
        };
        
        // Handle image - uploaded file takes priority
        if (this.pendingImage) {
            const imageId = await imageStorage.saveImage(this.pendingImage, {
                word: word,
                category: 'custom'
            });
            baseExercise.localImageId = imageId;
            this.pendingImage = null;
        } else if (emojiInput) {
            baseExercise.emoji = emojiInput;
        } else if (imageUrlInput) {
            baseExercise.imageUrl = imageUrlInput;
        } else if (isEdit) {
            // Keep existing image if editing and no new image provided
            const locale = i18n.getCurrentLocale();
            const customExercises = storageService.get(`customExercises_${locale}`, {});
            const existingExercise = customExercises[editType]?.[editIndex];
            if (existingExercise?.localImageId) {
                baseExercise.localImageId = existingExercise.localImageId;
            } else if (existingExercise?.emoji) {
                baseExercise.emoji = existingExercise.emoji;
            } else if (existingExercise?.imageUrl) {
                baseExercise.imageUrl = existingExercise.imageUrl;
            }
        }
        
        // Handle options for naming and listening (ignore for typing)
        if (optionsInput) {
            const options = optionsInput.split(',').map(o => o.trim().toLowerCase()).filter(o => o);
            if (options.length > 0) {
                baseExercise.options = [word, ...options];
            }
        }
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        if (isEdit && editType && editIndex !== null) {
            // Update all three types when editing one of them
            const originalWord = customExercises[editType]?.[editIndex]?.answer;
            
            ['naming', 'typing', 'listening'].forEach(type => {
                if (!customExercises[type]) customExercises[type] = [];
                
                // Find the matching exercise in each type by the original answer word
                const matchingIndex = customExercises[type].findIndex(ex => 
                    ex.answer === originalWord
                );
                
                if (matchingIndex !== -1) {
                    customExercises[type][matchingIndex] = { 
                        ...baseExercise,
                        // Remove options for typing exercises
                        ...(type === 'typing' ? { options: undefined } : {})
                    };
                }
            });
        } else {
            // Add to all three exercise types
            ['naming', 'typing', 'listening'].forEach(type => {
                if (!customExercises[type]) customExercises[type] = [];
                const exerciseForType = { 
                    ...baseExercise,
                    // Remove options for typing exercises
                    ...(type === 'typing' ? { options: undefined } : {})
                };
                customExercises[type].push(exerciseForType);
            });
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddSentence(isEdit = false, editType = null, editIndex = null) {
        const sentence = this.container.querySelector('#sentence-input').value.trim();
        const answer = this.container.querySelector('#sentence-answer').value.trim().toLowerCase();
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!sentence || !answer) return;
        
        const exercise = {
            sentence: sentence.includes('__') ? sentence : sentence + ' __',
            answer,
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.sentenceTyping) customExercises.sentenceTyping = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.sentenceTyping.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    

    
    async handleAddCategory(isEdit = false, editType = null, editIndex = null) {
        const category = this.container.querySelector('#category-name').value.trim().toLowerCase();
        const word = this.container.querySelector('#category-word').value.trim().toLowerCase();
        const optionsInput = this.container.querySelector('#category-options').value;
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!category || !word || !optionsInput) return;
        
        const options = optionsInput.split(',').map(o => o.trim().toLowerCase());
        if (options.length < 3) return;
        
        const exercise = {
            category,
            word,
            options: [word, ...options],
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.category) customExercises.category = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.category.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddListening(isEdit = false, editType = null, editIndex = null) {
        const word = this.container.querySelector('#listen-word').value.trim().toLowerCase();
        const emoji = this.container.querySelector('#listen-emoji').value.trim();
        const optionsInput = this.container.querySelector('#listen-options').value;
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!word || !emoji || !optionsInput) return;
        
        const options = optionsInput.split(',').map(o => o.trim());
        if (options.length < 3) return;
        
        const exercise = {
            answer: word,
            emoji,
            options: [emoji, ...options],
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.listening) customExercises.listening = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.listening.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddSpeaking(isEdit = false, editType = null, editIndex = null) {
        const word = this.container.querySelector('#speak-word').value.trim().toLowerCase();
        const emoji = this.container.querySelector('#speak-emoji').value.trim();
        const phrasesInput = this.container.querySelector('#speak-phrases').value;
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!word || !emoji) return;
        
        const exercise = {
            answer: word,
            emoji,
            difficulty,
            isCustom: true
        };
        
        if (phrasesInput) {
            const phrases = phrasesInput.split('\n').map(p => p.trim()).filter(p => p);
            exercise.phrases = phrases;
        }
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.speaking) customExercises.speaking = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.speaking.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddFirstSound(isEdit = false, editType = null, editIndex = null) {
        const sound = this.container.querySelector('#target-sound').value.trim().toLowerCase();
        const wordsInput = this.container.querySelector('#sound-words').value;
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!sound || !wordsInput) return;
        
        const words = wordsInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        if (words.length < 4) return;
        
        const exercise = {
            sound,
            words,
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.firstSound) customExercises.firstSound = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.firstSound.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddRhyming(isEdit = false, editType = null, editIndex = null) {
        const word = this.container.querySelector('#rhyme-word').value.trim().toLowerCase();
        const rhymesInput = this.container.querySelector('#rhyme-words').value;
        const nonRhymesInput = this.container.querySelector('#non-rhyme-words').value;
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!word || !rhymesInput || !nonRhymesInput) return;
        
        const rhymes = rhymesInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        const nonRhymes = nonRhymesInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        
        if (rhymes.length < 2 || nonRhymes.length < 2) return;
        
        const exercise = {
            word,
            rhymes,
            nonRhymes,
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.rhyming) customExercises.rhyming = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.rhyming.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddDefinitions(isEdit = false, editType = null, editIndex = null) {
        const word = this.container.querySelector('#def-word').value.trim().toLowerCase();
        const definition = this.container.querySelector('#word-definition').value.trim();
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!word || !definition) return;
        
        const exercise = {
            word,
            definition,
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.definitions) customExercises.definitions = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.definitions.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddAssociation(isEdit = false, editType = null, editIndex = null) {
        const word = this.container.querySelector('#assoc-word').value.trim().toLowerCase();
        const relatedInput = this.container.querySelector('#assoc-related').value;
        const unrelatedInput = this.container.querySelector('#assoc-unrelated').value;
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!word || !relatedInput || !unrelatedInput) return;
        
        const associated = relatedInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        const unrelated = unrelatedInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        
        if (associated.length < 2 || unrelated.length < 2) return;
        
        const exercise = {
            word,
            associated,
            unrelated,
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.association) customExercises.association = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.association.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddSynonyms(isEdit = false, editType = null, editIndex = null) {
        const word = this.container.querySelector('#syn-word').value.trim().toLowerCase();
        const synonymsInput = this.container.querySelector('#syn-synonyms').value;
        const antonymsInput = this.container.querySelector('#syn-antonyms').value;
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!word || !synonymsInput || !antonymsInput) return;
        
        const synonyms = synonymsInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        const antonyms = antonymsInput.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
        
        if (synonyms.length < 2 || antonyms.length < 2) return;
        
        const exercise = {
            word,
            synonyms,
            antonyms,
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.synonyms) customExercises.synonyms = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.synonyms.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddScramble(isEdit = false, editType = null, editIndex = null) {
        const sentence = this.container.querySelector('#scramble-sentence').value.trim();
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!sentence) return;
        
        const words = sentence.split(' ').map(w => w.trim()).filter(w => w);
        if (words.length < 3) return;
        
        const exercise = {
            words,
            difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.scramble) customExercises.scramble = [];
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.scramble.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    

    
    async handleAddTimeSequencing(isEdit = false, editType = null, editIndex = null) {
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
        
        if (isEdit && editIndex !== null) {
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.timeSequencing.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddTimeOrdering(isEdit = false, editType = null, editIndex = null) {
        const scenario = this.container.querySelector('#ordering-scenario').value.trim();
        const description = this.container.querySelector('#ordering-description').value.trim();
        const items = this.container.querySelector('#ordering-items').value
            .split('\n').map(item => item.trim()).filter(item => item);
        
        if (!scenario || !description || items.length < 3) return;
        
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        const exercise = {
            id: isEdit ? null : `custom_${Date.now()}`,
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
        
        if (isEdit && editIndex !== null) {
            // Preserve the original ID when editing
            const existingExercise = customExercises[editType][editIndex];
            exercise.id = existingExercise?.id || exercise.id;
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.timeOrdering.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddClockMatching(isEdit = false, editType = null, editIndex = null) {
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
            id: isEdit ? null : `custom_${Date.now()}`,
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
        
        if (isEdit && editIndex !== null) {
            const existingExercise = customExercises[editType][editIndex];
            exercise.id = existingExercise?.id || exercise.id;
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.clockMatching.push(exercise);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async handleAddWorkingMemory(isEdit = false, editType = null, editIndex = null) {
        const sequence = this.container.querySelector('#memory-sequence').value.trim();
        const extraOptions = this.container.querySelector('#memory-options').value.trim();
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        if (!sequence || !extraOptions) {
            alert('Please provide both sequence and extra options');
            return;
        }
        
        // More flexible emoji parsing - split by spaces or extract emojis
        const parseEmojis = (text) => {
            // Try splitting by spaces first
            let parts = text.split(/\s+/).filter(p => p);
            // If no spaces, try to extract individual emojis
            if (parts.length === 1) {
                // Match emoji sequences more broadly
                const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;
                const matches = text.match(emojiRegex);
                return matches || [];
            }
            return parts;
        };
        
        const sequenceArray = parseEmojis(sequence).slice(0, 3);
        const extraOptionsArray = parseEmojis(extraOptions);
        
        if (sequenceArray.length !== 3) {
            alert('Please provide exactly 3 emojis for the sequence');
            return;
        }
        
        if (extraOptionsArray.length < 3) {
            alert('Please provide at least 3 additional emojis for the options');
            return;
        }
        
        const allOptions = [...sequenceArray, ...extraOptionsArray];
        
        const exercise = {
            id: isEdit ? null : `custom_${Date.now()}`,
            sequence: sequenceArray,
            options: allOptions,
            difficulty: difficulty,
            isCustom: true
        };
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        if (!customExercises.workingMemory) customExercises.workingMemory = [];
        
        if (isEdit && editIndex !== null) {
            const existingExercise = customExercises[editType][editIndex];
            exercise.id = existingExercise?.id || exercise.id;
            customExercises[editType][editIndex] = exercise;
        } else {
            customExercises.workingMemory.push(exercise);
        }
        
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
        
        if (type === 'imageword') {
            // Add to all three types: naming, typing, listening
            ['naming', 'typing', 'listening'].forEach(exerciseType => {
                if (!customExercises[exerciseType]) customExercises[exerciseType] = [];
                data.forEach(exercise => {
                    const exerciseForType = { 
                        ...exercise,
                        // Remove options for typing exercises
                        ...(exerciseType === 'typing' ? { options: undefined } : {})
                    };
                    customExercises[exerciseType].push(exerciseForType);
                });
            });
        } else {
            if (!customExercises[type]) customExercises[type] = [];
            customExercises[type].push(...data);
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        
        const totalImported = type === 'imageword' ? data.length * 3 : data.length;
        alert(`Successfully imported ${totalImported} exercises!`);
        this.render();
    }
    
    downloadTemplate() {
        // Get selected exercise types
        const checkboxes = this.container.querySelectorAll('.exercise-type-checkboxes input[type="checkbox"]:checked');
        const selectedTypes = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedTypes.length === 0) {
            alert('Please select at least one exercise type');
            return;
        }
        
        // Get localized template examples
        const locale = i18n.getCurrentLocale();
        const isGerman = locale === 'de';
        
        // Create combined template with all selected types
        const headers = ['exercise_type', 'word', 'image_emoji_url', 'option1', 'option2', 'option3', 'difficulty'];
        const rows = [];
        
        const addedTypes = new Set();
        selectedTypes.forEach(type => {
            switch (type) {
                case 'naming':
                case 'typing':  
                case 'listening':
                    // These three share the same data format - only add once
                    if (!addedTypes.has('picture/typing/listening')) {
                        rows.push(isGerman ? 
                            ['picture/typing/listening', 'Apfel', '🍎 or https://example.com/apfel.jpg', 'Banane', 'Orange', 'Birne', 'easy'] :
                            ['picture/typing/listening', 'apple', '🍎 or https://example.com/apple.jpg', 'banana', 'orange', 'pear', 'easy']
                        );
                        addedTypes.add('picture/typing/listening');
                    }
                    break;
                case 'category':
                    rows.push(isGerman ?
                        ['category', 'Obst', 'Apfel', 'Apfel', 'Karotte', 'Brot', 'easy'] :
                        ['category', 'fruit', 'apple', 'apple', 'carrot', 'bread', 'easy']
                    );
                    break;
                case 'sentenceTyping':
                    rows.push(isGerman ?
                        ['sentenceTyping', 'Ich trinke jeden Morgen __', 'Kaffee', '', '', '', 'easy'] :
                        ['sentenceTyping', 'I drink __ every morning', 'coffee', '', '', '', 'easy']
                    );
                    break;
                case 'speaking':
                    rows.push(isGerman ?
                        ['speaking', 'Apfel', '🍎', 'Ein Apfel am Tag', 'Ich esse einen Apfel', '', 'easy'] :
                        ['speaking', 'apple', '🍎', 'An apple a day', 'I eat an apple', '', 'easy']
                    );
                    break;
                case 'firstSound':
                    rows.push(isGerman ?
                        ['firstSound', 'b', 'Ball,Buch,Bett,Vogel,Box', '', '', '', 'easy'] :
                        ['firstSound', 'b', 'ball,book,bed,bird,box', '', '', '', 'easy']
                    );
                    break;
                case 'rhyming':
                    rows.push(isGerman ?
                        ['rhyming', 'Katze', 'Tatze,Matze,Platze', 'Auto,Haus', '', '', 'easy'] :
                        ['rhyming', 'cat', 'hat,bat,mat', 'dog,cup', '', '', 'easy']
                    );
                    break;
                case 'association':
                    rows.push(isGerman ?
                        ['association', 'Brot', 'Butter,Toast', 'Auto,Telefon', '', '', 'easy'] :
                        ['association', 'bread', 'butter,toast', 'car,phone', '', '', 'easy']
                    );
                    break;
                case 'synonyms':
                    rows.push(isGerman ?
                        ['synonyms', 'glücklich', 'froh,fröhlich', 'traurig,unglücklich', '', '', 'easy'] :
                        ['synonyms', 'happy', 'glad,joyful', 'sad,unhappy', '', '', 'easy']
                    );
                    break;
                case 'definitions':
                    rows.push(isGerman ?
                        ['definitions', 'Stuhl', 'Ein Möbelstück zum Sitzen', '', '', '', 'easy'] :
                        ['definitions', 'chair', 'A piece of furniture for sitting', '', '', '', 'easy']
                    );
                    break;
                case 'scramble':
                    rows.push(isGerman ?
                        ['scramble', 'Die Katze schläft', '', '', '', '', 'easy'] :
                        ['scramble', 'The cat is sleeping', '', '', '', '', 'easy']
                    );
                    break;
                case 'timeSequencing':
                    rows.push(isGerman ?
                        ['timeSequencing', 'Was kommt nach Montag?', 'Dienstag', 'Mittwoch', 'Sonntag', 'Freitag', 'easy'] :
                        ['timeSequencing', 'What day comes after Monday?', 'Tuesday', 'Wednesday', 'Sunday', 'Friday', 'easy']
                    );
                    break;
                case 'clockMatching':
                    rows.push(isGerman ?
                        ['clockMatching', '3:00', 'drei Uhr', '', '', '', 'easy'] :
                        ['clockMatching', '3:00', 'three o\'clock', '', '', '', 'easy']
                    );
                    break;
                case 'timeOrdering':
                    rows.push(isGerman ?
                        ['timeOrdering', 'Morgenroutine', 'Aktivitäten in Reihenfolge bringen', 'Aufwachen', 'Zähne putzen', 'Frühstück', 'easy'] :
                        ['timeOrdering', 'Morning routine', 'Put activities in order', 'Wake up', 'Brush teeth', 'Eat breakfast', 'easy']
                    );
                    break;
                case 'workingMemory':
                    rows.push(isGerman ?
                        ['workingMemory', '🍎🍌🍊', '🍇🍓🥝', '', '', '', 'easy'] :
                        ['workingMemory', '🍎🍌🍊', '🍇🍓🥝', '', '', '', 'easy']
                    );
                    break;
            }
        });
        
        const template = { headers, rows };
        csvService.downloadCSV(template, 'exercises_template.csv');
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
        }
        
        await this.render();
    }
    
    async unarchiveItem(type, index) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        if (customExercises[type] && customExercises[type][index]) {
            customExercises[type][index].status = 'active';
            storageService.set(`customExercises_${locale}`, customExercises);
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
                
        // Render the form with pre-filled data
        const formContainer = this.container.querySelector('#add-form-container');
        if (formContainer) {
            formContainer.innerHTML = this.renderIndividualForm(type, item, index);
            await this.attachFormListeners(type);
            
            // Set the dropdown to show the correct type
            this.container.querySelectorAll('.type-dropdown').forEach(d => d.value = '');
            const targetDropdown = this.container.querySelector(`[data-category] option[value="${type}"]`);
            if (targetDropdown) {
                targetDropdown.closest('select').value = type;
            }
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
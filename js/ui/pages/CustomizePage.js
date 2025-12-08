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
        this.selectedExerciseType = null;
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
                    <h1 class="page-title">📥 ${t('customize.title')}</h1>
                    <p class="page-subtitle">${t('customize.subtitle') || 'Import personalized exercises'}</p>
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
                                <label class="category-label">📚 ${t('home.categories.words')}</label>
                                <select class="type-dropdown" data-category="words">
                                    <option value="">${t('customize.selectExerciseType')}</option>
                                    <option value="naming">🖼️ ${t('exercises.naming.name')}</option>
                                    <option value="typing">⌨️ ${t('exercises.typing.name')}</option>
                                    <option value="sentenceTyping">📝 ${t('exercises.sentenceTyping.name')}</option>
                                    <option value="category">📁 ${t('exercises.category.name')}</option>
                                </select>
                            </div>
                            
                            <!-- Phonetics Category Dropdown -->
                            <div class="category-dropdown">
                                <label class="category-label">🔊 ${t('home.categories.phonetics')}</label>
                                <select class="type-dropdown" data-category="phonetics">
                                    <option value="">${t('customize.selectExerciseType')}</option>
                                    <option value="listening">👂 ${t('exercises.listening.name')}</option>
                                    <option value="speaking">🎤 ${t('exercises.speaking.name')}</option>
                                    <option value="firstSound">🔤 ${t('exercises.firstSound.name')}</option>
                                    <option value="rhyming">🎵 ${t('exercises.rhyming.name')}</option>
                                </select>
                            </div>
                            
                            <!-- Meaning Category Dropdown -->
                            <div class="category-dropdown">
                                <label class="category-label">💡 ${t('home.categories.meaning')}</label>
                                <select class="type-dropdown" data-category="meaning">
                                    <option value="">${t('customize.selectExerciseType')}</option>
                                    <option value="definitions">📖 ${t('exercises.definitions.name')}</option>
                                    <option value="association">🔗 ${t('exercises.association.name')}</option>
                                    <option value="synonyms">≈ ${t('exercises.synonyms.name')}</option>
                                    <option value="scramble">🔀 ${t('exercises.scramble.name')}</option>
                                </select>
                            </div>
                            
                            <!-- Time Category Dropdown -->
                            <div class="category-dropdown">
                                <label class="category-label">⏰ ${t('home.categories.time')}</label>
                                <select class="type-dropdown" data-category="time">
                                    <option value="">${t('customize.selectExerciseType')}</option>
                                    <option value="timeSequencing">📅 ${t('exercises.timeSequencing.name')}</option>
                                    <option value="clockMatching">🕐 ${t('exercises.clockMatching.name')}</option>
                                    <option value="timeOrdering">⏰ ${t('exercises.timeOrdering.name')}</option>
                                    <option value="workingMemory">🧠 ${t('exercises.workingMemory.name')}</option>
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
                        <h3>${t('customize.existing')}</h3>
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
                
                <!-- Template Download -->
                <div class="template-selection">
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
                            <li>${t('customize.bulkUpload.newStep1')}</li>
                            <li>${t('customize.bulkUpload.step2')}</li>
                            <li>${t('customize.bulkUpload.newStep3')}</li>
                            <li>${t('customize.bulkUpload.step4')}</li>
                            <li>${t('customize.bulkUpload.step5')}</li>
                        </ol>
                        
                        <h4>${t('customize.bulkUpload.formatGuidelines')}</h4>
                        <div class="format-guide">
                            <!-- Wordbank Format -->
                            <details class="format-category" open>
                                <summary><strong>📚 ${t('customize.bulkUpload.wordbankFormat')}</strong></summary>
                                <div class="format-items">
                                    <div class="format-item">
                                        <strong>${t('customize.bulkUpload.wordbankDesc')}</strong>
                                        <code>${t('customize.bulkUpload.wordbankFormatCode')}</code>
                                        <p>${t('customize.bulkUpload.wordbankExample')}</p>
                                        <small>${t('customize.bulkUpload.wordbankNote')}</small>
                                    </div>
                                </div>
                            </details>
                            
                            <!-- Other Exercise Types -->
                            <details class="format-category">
                                <summary><strong>⏰ ${t('customize.bulkUpload.otherExercises')}</strong></summary>
                                <div class="format-items">
                                    <div class="format-item">
                                        <strong>${t('customize.bulkUpload.scrambleFormat')}</strong>
                                        <code>${t('customize.bulkUpload.scrambleFormatCode')}</code>
                                        <p>${t('customize.bulkUpload.scrambleExample')}</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>${t('customize.bulkUpload.timeSequencingFormat')}</strong>
                                        <code>${t('customize.bulkUpload.timeSequencingFormatCode')}</code>
                                        <p>${t('customize.bulkUpload.timeSequencingExample')}</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>${t('customize.bulkUpload.clockMatchingFormat')}</strong>
                                        <code>${t('customize.bulkUpload.clockMatchingFormatCode')}</code>
                                        <p>${t('customize.bulkUpload.clockMatchingExample')}</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>${t('customize.bulkUpload.timeOrderingFormat')}</strong>
                                        <code>${t('customize.bulkUpload.timeOrderingFormatCode')}</code>
                                        <p>${t('customize.bulkUpload.timeOrderingExample')}</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>${t('customize.bulkUpload.workingMemoryFormat')}</strong>
                                        <code>${t('customize.bulkUpload.workingMemoryFormatCode')}</code>
                                        <p>${t('customize.bulkUpload.workingMemoryExample')}</p>
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
        // Word-based exercises use the unified form
        const unifiedFormTypes = ['naming', 'typing', 'listening', 'sentenceTyping', 'category', 
                                   'speaking', 'firstSound', 'rhyming', 'definitions', 
                                   'association', 'synonyms'];
        
        if (unifiedFormTypes.includes(type)) {
            return this.renderUnifiedWordForm(type, editItem, editIndex);
        }
        
        // Non-word exercises use specific forms
        switch (type) {
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
    
    /**
     * Get the fields required for each exercise type
     */
    getRequiredFieldsForExercise(exerciseType) {
        const fieldMappings = {
            // Wordbank-based exercises
            'typing': ['wb-word', 'wb-distractors'],
            'naming': ['wb-word', 'wb-emoji', 'wb-image-url', 'wb-distractors'],
            'listening': ['wb-word', 'wb-emoji', 'wb-image-url', 'wb-distractors'],
            'speaking': ['wb-word', 'wb-emoji', 'wb-image-url', 'wb-phrases'],
            'definitions': ['wb-word', 'wb-definition', 'wb-distractors'],
            'category': ['wb-word', 'wb-category', 'wb-distractors'],
            'rhyming': ['wb-word', 'wb-emoji', 'wb-image-url', 'wb-rhymes', 'wb-distractors'],
            'association': ['wb-word', 'wb-associated', 'wb-distractors'],
            'synonyms': ['wb-word', 'wb-synonyms', 'wb-antonyms', 'wb-distractors'],
            'firstSound': ['wb-word', 'wb-sound-group', 'wb-distractors'],
            'sentenceTyping': ['wb-word', 'wb-sentences'],
            // Time and other special exercises
            'scramble': ['scramble-sentence'],
            'timeSequencing': ['time-question', 'time-answer', 'time-options'],
            'timeOrdering': ['ordering-scenario', 'ordering-description', 'ordering-items'],
            'clockMatching': ['clock-time', 'clock-words'],
            'workingMemory': ['memory-sequence', 'memory-options']
        };
        return fieldMappings[exerciseType] || [];
    }

    /**
     * Highlight form fields relevant to the selected exercise type
     */
    highlightFieldsForExercise(form, exerciseType) {
        if (!form) return;
        
        // Remove all highlights first
        form.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('section-relevant', 'section-highlighted');
        });
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('field-highlighted');
        });
        
        if (!exerciseType) return;
        
        const requiredFields = this.getRequiredFieldsForExercise(exerciseType);
        
        // Highlight relevant fields
        requiredFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (field) {
                const formGroup = field.closest('.form-group');
                const formSection = field.closest('.form-section');
                if (formGroup) {
                    formGroup.classList.add('field-highlighted');
                }
                if (formSection) {
                    formSection.classList.add('section-relevant', 'section-highlighted');
                }
            }
        });
    }

    /**
     * Update the exercise indicators based on current form values
     */
    updateExerciseIndicators(form) {
        const indicators = form.querySelector('#exercise-indicators');
        if (!indicators) return;
        
        const word = form.querySelector('#wb-word')?.value.trim();
        const emoji = form.querySelector('#wb-emoji')?.value.trim();
        const imageUrl = form.querySelector('#wb-image-url')?.value.trim();
        const definition = form.querySelector('#wb-definition')?.value.trim();
        const category = form.querySelector('#wb-category')?.value.trim();
        const soundGroup = form.querySelector('#wb-sound-group')?.value.trim();
        const rhymes = form.querySelector('#wb-rhymes')?.value.trim();
        const associated = form.querySelector('#wb-associated')?.value.trim();
        const synonyms = form.querySelector('#wb-synonyms')?.value.trim();
        const antonyms = form.querySelector('#wb-antonyms')?.value.trim();
        const sentences = form.querySelector('#wb-sentences')?.value.trim();
        const distractors = form.querySelector('#wb-distractors')?.value.trim();
        
        const hasImage = emoji || imageUrl || this.pendingImage;
        const hasDistractors = distractors && distractors.split(',').filter(d => d.trim()).length >= 3;
        
        // Define which exercises are available based on filled fields
        const available = {
            '⌨️': word && hasDistractors, // typing
            '🖼️': word && hasImage && hasDistractors, // naming
            '👂': word && hasImage && hasDistractors, // listening
            '🎤': word && hasImage, // speaking (no distractors needed)
            '📖': word && definition && hasDistractors, // definitions
            '📁': word && category && hasDistractors, // category
            '🎵': word && rhymes && hasDistractors, // rhyming
            '🔗': word && associated && hasDistractors, // association
            '≈': word && (synonyms || antonyms) && hasDistractors, // synonyms
            '🔤': word && soundGroup && hasDistractors, // first sound
            '📝': word && sentences // sentences (no distractors needed)
        };
        
        // Update indicator classes
        const indicatorElements = indicators.querySelectorAll('.exercise-indicator');
        indicatorElements.forEach(el => {
            const icon = el.textContent.trim();
            if (available[icon]) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }
    
    /**
     * Wordbank Form - Compact form matching wordbank.json structure
     * Creates entries that work across all word-based exercises
     */
    renderUnifiedWordForm(type, editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        
        // Get existing values for editing - match wordbank structure
        // Handle various field naming conventions from different exercise types
        const getArrayValue = (item, ...paths) => {
            for (const path of paths) {
                const keys = path.split('.');
                let val = item;
                for (const key of keys) {
                    val = val?.[key];
                }
                if (Array.isArray(val) && val.length > 0) {
                    return val.join(', ');
                }
            }
            return '';
        };
        
        const values = {
            word: editItem?.word || editItem?.answer || '',
            partOfSpeech: editItem?.partOfSpeech || 'noun',
            category: editItem?.category || '',
            soundGroup: editItem?.soundGroup || editItem?.sound || '',
            definition: editItem?.definition || '',
            emoji: editItem?.visual?.emoji || editItem?.emoji || '',
            imageUrl: editItem?.visual?.asset || editItem?.imageUrl || '',
            rhymes: getArrayValue(editItem, 'relationships.rhymes', 'rhymes'),
            associated: getArrayValue(editItem, 'relationships.associated', 'associated'),
            synonyms: getArrayValue(editItem, 'relationships.synonyms', 'synonyms'),
            antonyms: getArrayValue(editItem, 'relationships.antonyms', 'antonyms'),
            distractors: getArrayValue(editItem, 'distractors', 'nonRhymes', 'unrelated') || 
                         (editItem?.options?.slice(1)?.join(', ') || ''),
            sentences: editItem?.sentences?.join('\n') || '',
            phrases: editItem?.phrases?.join('\n') || ''
        };
        
        // Determine which exercises this word could be used for
        const getExerciseIndicators = () => {
            const indicators = [];
            // Always available if word exists
            if (values.word) {
                indicators.push({ type: 'typing', label: '⌨️', active: true });
                if (values.emoji || values.imageUrl) {
                    indicators.push({ type: 'naming', label: '🖼️', active: true });
                    indicators.push({ type: 'listening', label: '👂', active: true });
                    indicators.push({ type: 'speaking', label: '🎤', active: true });
                }
                if (values.definition) indicators.push({ type: 'definitions', label: '📖', active: true });
                if (values.category) indicators.push({ type: 'category', label: '📁', active: true });
                if (values.rhymes) indicators.push({ type: 'rhyming', label: '🎵', active: true });
                if (values.associated) indicators.push({ type: 'association', label: '🔗', active: true });
                if (values.synonyms || values.antonyms) indicators.push({ type: 'synonyms', label: '≈', active: true });
                if (values.soundGroup) indicators.push({ type: 'firstSound', label: '🔤', active: true });
                if (values.sentences) indicators.push({ type: 'sentenceTyping', label: '📝', active: true });
            }
            return indicators;
        };

        return `
            <form class="wordbank-form" id="add-wordbank-form" 
                  data-type="${type}" 
                  data-edit-type="${editItem ? type : ''}" 
                  data-edit-index="${editIndex !== null ? editIndex : ''}">
                <h3>${isEditing ? t('customize.wordbank.editWord') || '✏️ Edit Word' : t('customize.wordbank.addWord') || '➕ Add Word to Wordbank'}</h3>
                
                <div class="wordbank-form-grid">
                    <!-- LEFT COLUMN -->
                    <div class="form-column">
                        <!-- Core Word Info -->
                        <fieldset class="form-section section-relevant">
                            <legend>${t('customize.wordbank.coreInfo') || 'CORE INFO'}</legend>
                            
                            <div class="form-group">
                                <label><span class="field-indicator required">*</span> ${t('customize.wordbank.word') || 'Word'}</label>
                                <input type="text" id="wb-word" placeholder="${t('customize.wordbank.wordPlaceholder') || 'e.g., apple'}" 
                                       value="${values.word}" required>
                            </div>
                            
                            <div class="inline-fields">
                                <div class="form-group">
                                    <label>${t('customize.wordbank.category') || 'Category'}</label>
                                    <input type="text" id="wb-category" placeholder="${t('customize.wordbank.categoryPlaceholder') || 'e.g., fruit'}" 
                                           value="${values.category}">
                                </div>
                                <div class="form-group">
                                    <label>${t('customize.wordbank.soundGroup') || 'Sound'}</label>
                                    <input type="text" id="wb-sound-group" placeholder="${t('customize.wordbank.soundPlaceholder') || 'e.g., a'}" 
                                           value="${values.soundGroup}" maxlength="3" style="width: 60px;">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>${t('customize.wordbank.definition') || 'P'}</label>
                                <input type="text" id="wb-definition" placeholder="${t('customize.wordbank.definitionPlaceholder') || 'A short description of the word'}" 
                                       value="${values.definition}">
                            </div>
                        </fieldset>
                        
                        <!-- Visual -->
                        <fieldset class="form-section">
                            <legend>🖼️ ${t('customize.wordbank.visual') || 'VISUAL'}</legend>
                            <div class="form-group">
                                <div class="image-upload-compact">
                                    <input type="text" id="wb-emoji" placeholder="🍎 ${t('customize.wordbank.emoji') || 'Emoji'}" 
                                           value="${values.emoji}" style="width: 60px; text-align: center;">
                                    <input type="text" id="wb-image-url" placeholder="${t('customize.wordbank.imageUrl') || 'Image URL (optional)'}" 
                                           value="${values.imageUrl}">
                                    <input type="file" id="wb-image-upload" accept="image/*" style="display: none;">
                                    <button type="button" class="file-select-btn" id="file-select-btn">📁</button>
                                    <div class="image-preview-small" id="image-preview">${values.emoji || '—'}</div>
                                </div>
                            </div>
                        </fieldset>
                        
                        <!-- Distractors - IMPORTANT -->
                        <fieldset class="form-section section-relevant">
                            <legend>🎯 ${t('customize.wordbank.distractors') || 'DISTRACTORS'}</legend>
                            <div class="form-group">
                                <label><span class="field-indicator required">*</span> ${t('customize.wordbank.distractorWords') || 'Distractor Words'}</label>
                                <textarea id="wb-distractors" rows="2" placeholder="${t('customize.wordbank.distractorsPlaceholder') || 'banana, orange, grape, cherry, mango, peach, plum, kiwi, pear, melon'}">${values.distractors}</textarea>
                                <small>${t('customize.wordbank.distractorsHelp') || 'Min 3, ideally 10 words of similar length. Used as wrong options. Must NOT be synonyms, antonyms, rhymes, or associated words.'}</small>
                            </div>
                        </fieldset>
                    </div>
                    
                    <!-- RIGHT COLUMN -->
                    <div class="form-column">
                        <!-- Relationships -->
                        <fieldset class="form-section">
                            <legend>🔗 ${t('customize.wordbank.relationships') || 'RELATIONSHIPS'}</legend>
                            
                            <div class="form-group">
                                <label>${t('customize.wordbank.rhymes') || 'Rhymes'} <small>(${t('customize.wordbank.min1') || 'min 1'})</small></label>
                                <input type="text" id="wb-rhymes" placeholder="${t('customize.wordbank.rhymesPlaceholder') || 'e.g., cat → hat, bat, mat'}" 
                                       value="${values.rhymes}">
                            </div>
                            
                            <div class="form-group">
                                <label>${t('customize.wordbank.associated') || 'Associated'} <small>(${t('customize.wordbank.min1') || 'min 1'})</small></label>
                                <input type="text" id="wb-associated" placeholder="${t('customize.wordbank.associatedPlaceholder') || 'e.g., bread → butter, toast, jam'}" 
                                       value="${values.associated}">
                            </div>
                            
                            <div class="inline-fields">
                                <div class="form-group">
                                    <label>${t('customize.wordbank.synonyms') || 'Synonyms'} <small>(${t('customize.wordbank.min1') || 'min 1'})</small></label>
                                    <input type="text" id="wb-synonyms" placeholder="${t('customize.wordbank.synonymsPlaceholder') || 'happy → glad'}" 
                                           value="${values.synonyms}">
                                </div>
                                <div class="form-group">
                                    <label>${t('customize.wordbank.antonyms') || 'Antonyms'} <small>(${t('customize.wordbank.min1') || 'min 1'})</small></label>
                                    <input type="text" id="wb-antonyms" placeholder="${t('customize.wordbank.antonymsPlaceholder') || 'happy → sad'}" 
                                           value="${values.antonyms}">
                                </div>
                            </div>
                        </fieldset>
                        
                        <!-- Sentences -->
                        <fieldset class="form-section">
                            <legend>📝 ${t('customize.wordbank.sentences') || 'SENTENCES'}</legend>
                            <div class="form-group">
                                <label>${t('customize.wordbank.exampleSentences') || 'Example Sentences'}</label>
                                <textarea id="wb-sentences" rows="2" placeholder="${t('customize.wordbank.sentencesPlaceholder') || 'I eat an apple.\nThe apple is red.'}">${values.sentences}</textarea>
                                <small>${t('customize.wordbank.sentencesHelp') || 'One per line. Use for sentence completion (word will be blanked).'}</small>
                            </div>
                        </fieldset>
                        
                        <!-- Phrases (for speaking) -->
                        <fieldset class="form-section">
                            <legend>🎤 ${t('customize.wordbank.phrasesSection') || 'SPEAKING PHRASES'}</legend>
                            <div class="form-group">
                                <label>${t('customize.wordbank.phrases') || 'Practice Phrases'}</label>
                                <textarea id="wb-phrases" rows="2" placeholder="${t('customize.wordbank.phrasesPlaceholder') || 'An apple a day keeps the doctor away'}">${values.phrases}</textarea>
                            </div>
                        </fieldset>
                    </div>
                </div>
                
                <!-- Difficulty & Exercise Preview -->
                <div class="form-section-full">
                    <div class="inline-fields" style="align-items: center;">
                        <div class="form-group" style="flex: 0 0 auto;">
                            <label>${t('customize.forms.difficulty') || 'Difficulty'}</label>
                            <select id="exercise-difficulty">
                                <option value="easy" ${editItem?.difficulty === 'easy' ? 'selected' : ''}>${t('customize.forms.easy') || 'Easy'}</option>
                                <option value="medium" ${editItem?.difficulty === 'medium' || !editItem ? 'selected' : ''}>${t('customize.forms.medium') || 'Medium'}</option>
                                <option value="hard" ${editItem?.difficulty === 'hard' ? 'selected' : ''}>${t('customize.forms.hard') || 'Hard'}</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>${t('customize.wordbank.availableFor') || 'Available for exercises'}:</label>
                            <div class="exercise-indicators" id="exercise-indicators">
                                <span class="exercise-indicator" title="Typing">⌨️</span>
                                <span class="exercise-indicator" title="Naming">🖼️</span>
                                <span class="exercise-indicator" title="Listening">👂</span>
                                <span class="exercise-indicator" title="Speaking">🎤</span>
                                <span class="exercise-indicator" title="Definitions">📖</span>
                                <span class="exercise-indicator" title="Category">📁</span>
                                <span class="exercise-indicator" title="Rhyming">🎵</span>
                                <span class="exercise-indicator" title="Association">🔗</span>
                                <span class="exercise-indicator" title="Synonyms">≈</span>
                                <span class="exercise-indicator" title="First Sound">🔤</span>
                                <span class="exercise-indicator" title="Sentences">📝</span>
                            </div>
                            <small>${t('customize.wordbank.indicatorHelp') || 'Highlighted = this word will appear in that exercise'}</small>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? t('customize.forms.updateExercise') || 'Update' : t('customize.forms.addExercise') || 'Add Word'}</button>
                </div>
            </form>
        `;
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
            <form class="add-form compact-form" id="add-scramble-form" data-edit-type="${editItem ? 'scramble' : ''}" data-edit-index="${editIndex || ''}">
                <h3>🔀 ${isEditing ? t('customize.forms.editExercise') : t('exercises.scramble.name')}</h3>
                
                <fieldset class="form-section">
                    <legend>${t('customize.forms.sentence') || 'SENTENCE'}</legend>
                    <div class="form-group">
                        <label><span class="field-indicator required">*</span> ${t('customize.forms.sentence')}</label>
                        <input type="text" id="scramble-sentence" 
                               placeholder="${t('customize.forms.sentencePlaceholder') || 'e.g., The cat is sleeping'}"
                               value="${editItem && editItem.words ? editItem.words.join(' ') : ''}" required>
                        <small>${t('customize.bulkUpload.scrambleExample') || 'Enter the correct sentence - it will be scrambled for the user'}</small>
                    </div>
                </fieldset>
                
                <div class="inline-fields">
                    ${this.renderDifficultyField(editItem?.difficulty)}
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? t('customize.forms.updateExercise') : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderTimeSequencingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        const wrongOptions = editItem && editItem.options ? 
            editItem.options.filter(o => o !== editItem.answer).join(', ') : '';
        return `
            <form class="add-form compact-form" id="add-timesequencing-form" data-edit-type="${editItem ? 'timeSequencing' : ''}" data-edit-index="${editIndex || ''}">
                <h3>📅 ${isEditing ? t('customize.forms.editExercise') : t('exercises.timeSequencing.name')}</h3>
                
                <fieldset class="form-section">
                    <legend>${t('customize.forms.question') || 'QUESTION'}</legend>
                    <div class="form-group">
                        <label><span class="field-indicator required">*</span> ${t('customize.forms.question')}</label>
                        <input type="text" id="time-question" placeholder="${t('customize.forms.timeQuestionPlaceholder')}" 
                               value="${editItem ? editItem.question || '' : ''}" required>
                    </div>
                    
                    <div class="inline-fields">
                        <div class="form-group">
                            <label><span class="field-indicator required">*</span> ${t('customize.forms.correctAnswer')}</label>
                            <input type="text" id="time-answer" placeholder="${t('customize.forms.timeAnswerPlaceholder')}" 
                                   value="${editItem ? editItem.answer || '' : ''}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label><span class="field-indicator required">*</span> ${t('customize.forms.wrongOptions')}</label>
                        <input type="text" id="time-options" 
                               placeholder="${t('customize.forms.timeOptionsPlaceholder')}" 
                               value="${wrongOptions}" required>
                        <small>${t('customize.forms.timeOptionsHelp')}</small>
                    </div>
                </fieldset>
                
                <div class="inline-fields">
                    ${this.renderDifficultyField(editItem?.difficulty)}
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? t('customize.forms.updateExercise') : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderTimeOrderingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        return `
            <form class="add-form compact-form" id="add-timeordering-form" data-edit-type="${editItem ? 'timeOrdering' : ''}" data-edit-index="${editIndex || ''}">
                <h3>⏰ ${isEditing ? t('customize.forms.editExercise') : t('exercises.timeOrdering.name')}</h3>
                
                <fieldset class="form-section">
                    <legend>${t('customize.forms.scenario') || 'SCENARIO'}</legend>
                    <div class="inline-fields">
                        <div class="form-group">
                            <label><span class="field-indicator required">*</span> ${t('customize.forms.scenario')}</label>
                            <input type="text" id="ordering-scenario" placeholder="${t('customize.forms.scenarioPlaceholder')}" 
                                   value="${editItem ? editItem.scenario || '' : ''}" required>
                        </div>
                        <div class="form-group">
                            <label><span class="field-indicator required">*</span> ${t('customize.forms.description')}</label>
                            <input type="text" id="ordering-description" placeholder="${t('customize.forms.descriptionPlaceholder')}" 
                                   value="${editItem ? editItem.description || '' : ''}" required>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset class="form-section">
                    <legend>${t('customize.forms.activities') || 'ACTIVITIES'}</legend>
                    <div class="form-group">
                        <label><span class="field-indicator required">*</span> ${t('customize.forms.activities')}</label>
                        <textarea id="ordering-items" rows="4" 
                                  placeholder="${t('customize.forms.activitiesPlaceholder')}" required>${editItem && editItem.items ? editItem.items.join('\n') : ''}</textarea>
                        <small>${t('customize.forms.activitiesHelp')}</small>
                    </div>
                </fieldset>
                
                <div class="inline-fields">
                    ${this.renderDifficultyField(editItem?.difficulty)}
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? t('customize.forms.updateExercise') : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderClockMatchingForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        // Format existing time to HH:MM if it has seconds
        let existingTime = editItem ? editItem.time || '' : '';
        if (existingTime && existingTime.split(':').length > 2) {
            existingTime = existingTime.split(':').slice(0, 2).join(':');
        }
        return `
            <form class="add-form compact-form" id="add-clockmatching-form" data-edit-type="${editItem ? 'clockMatching' : ''}" data-edit-index="${editIndex || ''}">
                <h3>🕐 ${isEditing ? t('customize.forms.editExercise') : t('exercises.clockMatching.name')}</h3>
                
                <fieldset class="form-section">
                    <legend>${t('customize.forms.digitalTime') || 'TIME'}</legend>
                    <div class="inline-fields">
                        <div class="form-group">
                            <label><span class="field-indicator required">*</span> ${t('customize.forms.digitalTime')}</label>
                            <input type="text" id="clock-time" placeholder="HH:MM (e.g., 3:00 or 14:30)"
                                   pattern="[0-9]{1,2}:[0-9]{2}"
                                   value="${existingTime}" required>
                            <small>${t('customize.forms.digitalTimeHelp')}</small>
                        </div>
                        <div class="form-group">
                            <label><span class="field-indicator required">*</span> ${t('customize.forms.timeWords')}</label>
                            <input type="text" id="clock-words" placeholder="${t('customize.forms.timeWordsPlaceholder')}" 
                                   value="${editItem ? editItem.timeWords || '' : ''}" required>
                            <small>${t('customize.forms.timeWordsHelp')}</small>
                        </div>
                    </div>
                </fieldset>
                
                <div class="inline-fields">
                    ${this.renderDifficultyField(editItem?.difficulty)}
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? t('customize.forms.updateExercise') : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    renderWorkingMemoryForm(editItem = null, editIndex = null) {
        const isEditing = editItem !== null;
        const extraOptions = editItem && editItem.options && editItem.sequence ?
            editItem.options.filter(o => !editItem.sequence.includes(o)).join('') : '';
        
        // Common emoji groups for working memory exercises
        const emojiGroups = {
            fruits: '🍎🍊🍋🍌🍉🍇🍓🫐🍑🍒🥝🍍🥭🍐',
            animals: '🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸',
            objects: '⭐🌙☀️🌈💎🔔🎈🎁🏀⚽🎸🎺🚗✈️',
            food: '🍕🍔🌭🍟🌮🍣🍩🍪🧁🍰🍫🍬🍭🍿',
            nature: '🌸🌺🌻🌹🌷💐🌴🌵🍀🌲🌊⛰️🔥❄️',
            faces: '😀😃😄😁😆🥰😍🤩😎🥳🤗🤔😴🤯'
        };
        
        return `
            <form class="add-form compact-form" id="add-workingmemory-form" data-edit-type="${editItem ? 'workingMemory' : ''}" data-edit-index="${editIndex || ''}">
                <h3>🧠 ${isEditing ? t('customize.forms.editExercise') : t('exercises.workingMemory.name')}</h3>
                
                <fieldset class="form-section">
                    <legend>${t('customize.forms.emojiSequence') || 'SEQUENCE'}</legend>
                    
                    <div class="emoji-picker-section">
                        <label>${t('customize.wordbank.emoji') || 'Emoji Picker'}:</label>
                        <div class="emoji-picker-tabs">
                            <button type="button" class="emoji-tab active" data-group="fruits">🍎</button>
                            <button type="button" class="emoji-tab" data-group="animals">🐶</button>
                            <button type="button" class="emoji-tab" data-group="objects">⭐</button>
                            <button type="button" class="emoji-tab" data-group="food">🍕</button>
                            <button type="button" class="emoji-tab" data-group="nature">🌸</button>
                            <button type="button" class="emoji-tab" data-group="faces">😀</button>
                        </div>
                        <div class="emoji-picker-grid" id="emoji-picker-grid">
                            ${[...emojiGroups.fruits].map(e => `<button type="button" class="emoji-btn" data-emoji="${e}">${e}</button>`).join('')}
                        </div>
                        <div class="emoji-groups-data" hidden>
                            ${Object.entries(emojiGroups).map(([k, v]) => `<span data-group="${k}">${v}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label><span class="field-indicator required">*</span> ${t('customize.forms.emojiSequence')} (3)</label>
                        <div class="emoji-input-row">
                            <input type="text" id="memory-sequence" placeholder="${t('customize.forms.sequencePlaceholder')}" 
                                   value="${editItem && editItem.sequence ? editItem.sequence.join('') : ''}" required>
                            <button type="button" class="btn btn--small btn--ghost clear-emoji-btn" data-target="memory-sequence">✕</button>
                        </div>
                        <small>${t('customize.forms.sequenceHelp')}</small>
                    </div>
                    
                    <div class="form-group">
                        <label><span class="field-indicator required">*</span> ${t('customize.forms.extraOptions')} (3+)</label>
                        <div class="emoji-input-row">
                            <input type="text" id="memory-options" placeholder="${t('customize.forms.extraOptionsPlaceholder')}" 
                                   value="${extraOptions}" required>
                            <button type="button" class="btn btn--small btn--ghost clear-emoji-btn" data-target="memory-options">✕</button>
                        </div>
                        <small>${t('customize.forms.extraOptionsHelp')}</small>
                    </div>
                </fieldset>
                
                <div class="inline-fields">
                    ${this.renderDifficultyField(editItem?.difficulty)}
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">${t('common.cancel')}</button>
                    <button type="submit" class="btn btn--primary">${isEditing ? t('customize.forms.updateExercise') : t('customize.forms.addExercise')}</button>
                </div>
            </form>
        `;
    }
    
    async renderExistingItemsSpreadsheet(customExercises) {
        const totalItems = Object.values(customExercises).reduce((sum, arr) => sum + (arr?.length || 0), 0);
        
        if (totalItems === 0) {
            return `<p class="empty-state">${t('customize.noCustom')}</p>`;
        }
        
        // Type icons for exercise indicators
        const typeIcons = {
            naming: '🖼️', typing: '⌨️', sentenceTyping: '📝', category: '📁',
            listening: '👂', speaking: '🎤', firstSound: '🔤', rhyming: '🎵',
            definitions: '📖', association: '🔗', synonyms: '≈', scramble: '🔀',
            timeSequencing: '📅', clockMatching: '🕐', timeOrdering: '⏰', workingMemory: '🧠'
        };
        
        // Wordbank exercise types (can share data)
        const wordbankTypes = ['naming', 'typing', 'listening', 'speaking', 'definitions', 
                               'category', 'rhyming', 'association', 'synonyms', 'firstSound', 'sentenceTyping'];
        
        // Other exercise types (standalone)
        const otherTypes = ['scramble', 'timeSequencing', 'clockMatching', 'timeOrdering', 'workingMemory'];
        
        // Collect all unique entries, consolidating wordbank entries by word
        const consolidatedEntries = new Map(); // key = word or unique identifier
        const otherEntries = []; // non-wordbank exercises
        
        // Process wordbank-style exercises - group by word
        for (const type of wordbankTypes) {
            const exercises = customExercises[type];
            if (!exercises || exercises.length === 0) continue;
            
            exercises.forEach((exercise, index) => {
                const word = exercise.answer || exercise.word || '';
                if (!word) return;
                
                const key = word.toLowerCase();
                if (!consolidatedEntries.has(key)) {
                    consolidatedEntries.set(key, {
                        word: word,
                        difficulty: exercise.difficulty || 'medium',
                        status: exercise.status || 'active',
                        types: new Set(),
                        originalType: type,
                        originalIndex: index,
                        exercise: exercise
                    });
                }
                consolidatedEntries.get(key).types.add(type);
                // Keep the most recent status
                if (exercise.status === 'archived') {
                    consolidatedEntries.get(key).status = 'archived';
                }
            });
        }
        
        // Process other exercises
        for (const type of otherTypes) {
            const exercises = customExercises[type];
            if (!exercises || exercises.length === 0) continue;
            
            exercises.forEach((exercise, index) => {
                otherEntries.push({
                    type: type,
                    index: index,
                    exercise: exercise,
                    displayName: this.getOtherExerciseDisplayName(type, exercise),
                    difficulty: exercise.difficulty || 'medium',
                    status: exercise.status || 'active'
                });
            });
        }
        
        // Convert wordbank entries to array and sort alphabetically
        const wordbankArray = Array.from(consolidatedEntries.values())
            .sort((a, b) => a.word.localeCompare(b.word));
        
        // Sort other entries by display name
        otherEntries.sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        // Count active vs archived
        const wordbankActiveCount = wordbankArray.filter(e => e.status !== 'archived').length;
        const wordbankArchivedCount = wordbankArray.filter(e => e.status === 'archived').length;
        const otherActiveCount = otherEntries.filter(e => e.status !== 'archived').length;
        const otherArchivedCount = otherEntries.filter(e => e.status === 'archived').length;
        
        let html = '<div class="exercise-library-container">';
        
        // Wordbank entries section
        if (wordbankArray.length > 0) {
            html += `
                <div class="library-section">
                    <div class="library-section-header">
                        <span class="section-title">📚 ${t('customize.library.wordbankEntries')}</span>
                        <span class="section-counts">
                            <span class="count-active">${wordbankActiveCount} ${t('customize.status.active').toLowerCase()}</span>
                            ${wordbankArchivedCount > 0 ? `<span class="count-archived">${wordbankArchivedCount} ${t('customize.status.archived').toLowerCase()}</span>` : ''}
                        </span>
                    </div>
                    <div class="library-list-container">
                        <table class="library-table">
                            <thead>
                                <tr>
                                    <th class="col-difficulty">${t('customize.library.difficulty')}</th>
                                    <th class="col-word">${t('customize.wordbank.word')}</th>
                                    <th class="col-status">${t('customize.library.status')}</th>
                                    <th class="col-actions">${t('customize.library.actions')}</th>
                                    <th class="col-types">${t('customize.library.exerciseTypes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${wordbankArray.map(entry => this.renderWordbankRow(entry, typeIcons, wordbankTypes)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        // Other exercises section
        if (otherEntries.length > 0) {
            html += `
                <div class="library-section">
                    <div class="library-section-header">
                        <span class="section-title">⏰ ${t('customize.library.otherExercises')}</span>
                        <span class="section-counts">
                            <span class="count-active">${otherActiveCount} ${t('customize.status.active').toLowerCase()}</span>
                            ${otherArchivedCount > 0 ? `<span class="count-archived">${otherArchivedCount} ${t('customize.status.archived').toLowerCase()}</span>` : ''}
                        </span>
                    </div>
                    <div class="library-list-container">
                        <table class="library-table">
                            <thead>
                                <tr>
                                    <th class="col-difficulty">${t('customize.library.difficulty')}</th>
                                    <th class="col-content">${t('customize.library.content')}</th>
                                    <th class="col-status">${t('customize.library.status')}</th>
                                    <th class="col-actions">${t('customize.library.actions')}</th>
                                    <th class="col-type">${t('customize.library.type')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${otherEntries.map(entry => this.renderOtherExerciseRow(entry, typeIcons)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    renderWordbankRow(entry, typeIcons, wordbankTypes) {
        const diffColors = {
            easy: 'diff-easy',
            medium: 'diff-medium',
            hard: 'diff-hard'
        };
        
        const diffLabels = {
            easy: t('customize.forms.easy'),
            medium: t('customize.library.med'),
            hard: t('customize.forms.hard')
        };
        
        const isArchived = entry.status === 'archived';
        
        // Build exercise type indicators
        const typeIndicators = wordbankTypes.map(type => {
            const isActive = entry.types.has(type);
            return `<span class="type-indicator ${isActive ? 'active' : ''}" title="${this.getTypeName(type)}">${typeIcons[type]}</span>`;
        }).join('');
        
        return `
            <tr class="library-row ${isArchived ? 'archived-row' : ''}" 
                data-type="${entry.originalType}" 
                data-index="${entry.originalIndex}"
                data-word="${entry.word}">
                <td class="col-difficulty">
                    <span class="difficulty-dot ${diffColors[entry.difficulty]}" title="${entry.difficulty}"></span>
                    <span class="difficulty-label">${diffLabels[entry.difficulty]}</span>
                </td>
                <td class="col-word">
                    <strong>${entry.word}</strong>
                </td>
                <td class="col-status">
                    <span class="status-badge status-${entry.status}">${t('customize.status.' + entry.status)}</span>
                </td>
                <td class="col-actions">
                    <select class="action-dropdown" data-type="${entry.originalType}" data-index="${entry.originalIndex}" data-word="${entry.word}">
                        <option value="">...</option>
                        <option value="edit">✏️ ${t('customize.edit')}</option>
                        ${!isArchived ? 
                            `<option value="archive">📦 ${t('customize.library.archive')}</option>` : 
                            `<option value="unarchive">📂 ${t('customize.library.unarchive')}</option>`
                        }
                        <option value="delete">🗑️ ${t('customize.delete')}</option>
                    </select>
                </td>
                <td class="col-types">
                    <div class="type-indicators">${typeIndicators}</div>
                </td>
            </tr>
        `;
    }
    
    renderOtherExerciseRow(entry, typeIcons) {
        const diffColors = {
            easy: 'diff-easy',
            medium: 'diff-medium',
            hard: 'diff-hard'
        };
        
        const diffLabels = {
            easy: t('customize.forms.easy'),
            medium: t('customize.library.med'),
            hard: t('customize.forms.hard')
        };
        
        const isArchived = entry.status === 'archived';
        
        return `
            <tr class="library-row ${isArchived ? 'archived-row' : ''}" 
                data-type="${entry.type}" 
                data-index="${entry.index}">
                <td class="col-difficulty">
                    <span class="difficulty-dot ${diffColors[entry.difficulty]}" title="${entry.difficulty}"></span>
                    <span class="difficulty-label">${diffLabels[entry.difficulty]}</span>
                </td>
                <td class="col-content">
                    <span class="content-text">${entry.displayName}</span>
                </td>
                <td class="col-status">
                    <span class="status-badge status-${entry.status}">${t('customize.status.' + entry.status)}</span>
                </td>
                <td class="col-actions">
                    <select class="action-dropdown" data-type="${entry.type}" data-index="${entry.index}">
                        <option value="">...</option>
                        <option value="edit">✏️ ${t('customize.edit')}</option>
                        ${!isArchived ? 
                            `<option value="archive">📦 ${t('customize.library.archive')}</option>` : 
                            `<option value="unarchive">📂 ${t('customize.library.unarchive')}</option>`
                        }
                        <option value="delete">🗑️ ${t('customize.delete')}</option>
                    </select>
                </td>
                <td class="col-type">
                    <span class="type-indicator active" title="${this.getTypeName(entry.type)}">${typeIcons[entry.type]}</span>
                </td>
            </tr>
        `;
    }
    
    getOtherExerciseDisplayName(type, exercise) {
        switch (type) {
            case 'scramble':
                return exercise.words?.join(' ') || exercise.sentence || '';
            case 'timeSequencing':
                return exercise.question || '';
            case 'clockMatching':
                return `${exercise.time || exercise.digitalDisplay || ''} - ${exercise.timeWords || ''}`;
            case 'timeOrdering':
                return exercise.scenario || '';
            case 'workingMemory':
                return exercise.sequence?.join('') || '';
            default:
                return '';
        }
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
        // Use localized names
        try {
            return t(`exercises.${type}.name`);
        } catch {
            // Fallback to English names
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
    }
    
    getContentPreview(type, exercise) {
        switch (type) {
            case 'naming':
            case 'typing':
            case 'listening':
                return `<strong>${exercise.answer || exercise.word || ''}</strong>`;
            case 'sentenceTyping':
                return `${exercise.sentence || ''} <span class="answer-preview">→ ${exercise.answer || ''}</span>`;
            case 'timeSequencing':
                return `${exercise.question || ''} <span class="answer-preview">→ ${exercise.answer || ''}</span>`;
            case 'timeOrdering':
                return `<strong>${exercise.scenario || ''}:</strong> ${exercise.description || ''}`;
            case 'clockMatching':
                return `<strong>${exercise.digitalDisplay || exercise.time || ''}</strong> (${exercise.timeWords || ''})`;
            case 'workingMemory':
                return `${t('exercises.workingMemory.sequenceIs') || 'Sequence:'} ${exercise.sequence?.join('') || ''}`;
            case 'speaking':
                return `<strong>${exercise.answer || exercise.word || ''}</strong> (${exercise.phrases?.length || 0} ${t('customize.wordbank.phrases') || 'phrases'})`;
            case 'firstSound':
                return `${t('exercises.firstSound.startsWithSound') || 'Sound'}: <strong>${exercise.sound || exercise.soundGroup || ''}</strong> (${exercise.words?.length || 1} ${t('home.categories.words') || 'words'})`;
            case 'rhyming':
                return `<strong>${exercise.word || ''}</strong> (${exercise.rhymes?.length || 0} ${t('customize.wordbank.rhymes') || 'rhymes'})`;
            case 'category':
                return `${exercise.category || ''}: <strong>${exercise.word || ''}</strong>`;
            case 'definitions':
                return `<strong>${exercise.word || ''}</strong>: ${(exercise.definition || '').substring(0, 40)}${exercise.definition?.length > 40 ? '...' : ''}`;
            case 'association':
                return `<strong>${exercise.word || ''}</strong> (${exercise.associated?.length || 0} ${t('customize.wordbank.associated') || 'related'})`;
            case 'synonyms':
                return `<strong>${exercise.word || ''}</strong> (${exercise.synonyms?.length || 0} ${t('customize.wordbank.synonyms') || 'synonyms'})`;
            case 'scramble':
                return `${exercise.words?.join(' ') || t('customize.forms.sentence') || 'Sentence'}`;
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
                    
                    // Store selected type for highlighting
                    this.selectedExerciseType = selectedType;
                    
                    this.container.querySelector('#add-form-container').innerHTML = 
                        this.renderIndividualForm(selectedType);
                    await this.attachFormListeners(selectedType);
                } else {
                    this.container.querySelector('#add-form-container').innerHTML = '';
                    this.selectedExerciseType = null;
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
        
        // Action dropdown in library
        this.container.addEventListener('change', async (e) => {
            if (!e.target.classList.contains('action-dropdown')) return;
            
            const dropdown = e.target;
            const action = dropdown.value;
            const type = dropdown.dataset.type;
            const index = parseInt(dropdown.dataset.index);
            const word = dropdown.dataset.word; // For wordbank entries
            
            if (!action) return;
            
            // Reset dropdown
            dropdown.value = '';
            
            if (action === 'edit') {
                await this.editItem(type, index);
            } else if (action === 'archive') {
                await this.archiveItem(type, index, word);
            } else if (action === 'unarchive') {
                await this.unarchiveItem(type, index, word);
            } else if (action === 'delete') {
                await this.deleteItem(type, index, word);
            }
        });
    }
    
    async attachFormListeners(type) {
        const form = this.container.querySelector('.add-form') || this.container.querySelector('.wordbank-form');
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
        
        // Image upload handling - support both old and new form IDs
        const imageInput = form.querySelector('#image-upload') || form.querySelector('#wb-image-upload');
        const fileSelectBtn = form.querySelector('#file-select-btn');
        const emojiInput = form.querySelector('#emoji-input') || form.querySelector('#wb-emoji');
        const imageUrlInput = form.querySelector('#image-url') || form.querySelector('#wb-image-url');
        const imagePreview = form.querySelector('#image-preview');
        
        if (imageInput && fileSelectBtn) {
            fileSelectBtn.addEventListener('click', () => {
                imageInput.click();
            });
            
            imageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const resized = await imageStorage.resizeImage(file);
                    if (imagePreview) {
                        imagePreview.innerHTML = `<img src="${resized}" alt="Preview">`;
                    }
                    this.pendingImage = resized;
                    if (emojiInput) emojiInput.value = '';
                    if (imageUrlInput) imageUrlInput.value = '';
                    this.updateExerciseIndicators(form);
                }
            });
        }
        
        // Handle emoji input
        if (emojiInput) {
            emojiInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value && imagePreview) {
                    imagePreview.innerHTML = value;
                }
                if (value) {
                    if (imageInput) imageInput.value = '';
                    if (imageUrlInput) imageUrlInput.value = '';
                    this.pendingImage = null;
                }
                this.updateExerciseIndicators(form);
            });
        }
        
        // Handle image URL input
        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value && imagePreview) {
                    imagePreview.innerHTML = `<img src="${value}" alt="Preview" onerror="this.parentNode.innerHTML='❌'">`;
                }
                if (value) {
                    if (imageInput) imageInput.value = '';
                    if (emojiInput) emojiInput.value = '';
                    this.pendingImage = null;
                }
                this.updateExerciseIndicators(form);
            });
        }
        
        // Update exercise indicators when form fields change (for wordbank form)
        if (form.classList.contains('wordbank-form')) {
            const fieldsToWatch = ['#wb-word', '#wb-category', '#wb-sound-group', '#wb-definition', 
                                   '#wb-emoji', '#wb-image-url', '#wb-rhymes', '#wb-associated', 
                                   '#wb-synonyms', '#wb-antonyms', '#wb-sentences', '#wb-distractors'];
            fieldsToWatch.forEach(selector => {
                const field = form.querySelector(selector);
                if (field) {
                    field.addEventListener('input', () => this.updateExerciseIndicators(form));
                }
            });
            
            // Auto-complete first sound when word is entered
            const wordField = form.querySelector('#wb-word');
            const soundField = form.querySelector('#wb-sound-group');
            if (wordField && soundField) {
                wordField.addEventListener('input', () => {
                    const word = wordField.value.trim().toLowerCase();
                    // Only auto-fill if sound field is empty and word has content
                    if (word && !soundField.value.trim()) {
                        soundField.value = word.charAt(0);
                        this.updateExerciseIndicators(form);
                    }
                });
            }
            
            // Initial update
            this.updateExerciseIndicators(form);
        }
        
        // Apply field highlighting for all form types
        if (this.selectedExerciseType) {
            this.highlightFieldsForExercise(form, this.selectedExerciseType);
        }
        
        // Emoji picker for working memory form
        const emojiPickerGrid = form.querySelector('#emoji-picker-grid');
        const emojiTabs = form.querySelectorAll('.emoji-tab');
        const emojiGroupsData = form.querySelector('.emoji-groups-data');
        
        if (emojiPickerGrid && emojiTabs.length > 0) {
            // Track which input to add emojis to (sequence by default)
            let activeEmojiTarget = 'memory-sequence';
            
            // Tab switching
            emojiTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    emojiTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const group = tab.dataset.group;
                    const groupData = emojiGroupsData?.querySelector(`[data-group="${group}"]`);
                    if (groupData) {
                        const emojis = [...groupData.textContent];
                        emojiPickerGrid.innerHTML = emojis.map(e => 
                            `<button type="button" class="emoji-btn" data-emoji="${e}">${e}</button>`
                        ).join('');
                        
                        // Re-attach emoji click handlers
                        attachEmojiClickHandlers();
                    }
                });
            });
            
            // Click on input to set target
            const sequenceInput = form.querySelector('#memory-sequence');
            const optionsInput = form.querySelector('#memory-options');
            
            if (sequenceInput) {
                sequenceInput.addEventListener('focus', () => {
                    activeEmojiTarget = 'memory-sequence';
                });
            }
            if (optionsInput) {
                optionsInput.addEventListener('focus', () => {
                    activeEmojiTarget = 'memory-options';
                });
            }
            
            // Emoji button click handler
            const attachEmojiClickHandlers = () => {
                form.querySelectorAll('.emoji-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const emoji = btn.dataset.emoji;
                        const targetInput = form.querySelector(`#${activeEmojiTarget}`);
                        if (targetInput) {
                            // For sequence, limit to 3 emojis
                            if (activeEmojiTarget === 'memory-sequence') {
                                const currentEmojis = [...targetInput.value];
                                if (currentEmojis.length < 3) {
                                    targetInput.value += emoji;
                                }
                            } else {
                                targetInput.value += emoji;
                            }
                            targetInput.focus();
                        }
                    });
                });
            };
            
            attachEmojiClickHandlers();
            
            // Clear buttons
            form.querySelectorAll('.clear-emoji-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.dataset.target;
                    const targetInput = form.querySelector(`#${targetId}`);
                    if (targetInput) {
                        targetInput.value = '';
                        targetInput.focus();
                    }
                });
            });
        }
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check if this is an edit operation
            const editType = form.dataset.editType;
            const editIndex = form.dataset.editIndex;
            const isEdit = editType && editIndex !== '';
            
            // Check if this is the wordbank form
            if (form.classList.contains('wordbank-form')) {
                await this.handleWordbankFormSubmit(type, isEdit, editType, parseInt(editIndex));
                return;
            }
            
            // Legacy form handlers for non-unified forms
            switch (type) {
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
    
    /**
     * Handle wordbank form submission - saves to custom wordbank and all applicable exercise types
     */
    async handleWordbankFormSubmit(formType, isEdit = false, editType = null, editIndex = null) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        // Get all form values
        const word = this.container.querySelector('#wb-word')?.value.trim().toLowerCase() || '';
        const category = this.container.querySelector('#wb-category')?.value.trim().toLowerCase() || '';
        const soundGroup = this.container.querySelector('#wb-sound-group')?.value.trim().toLowerCase() || '';
        const definition = this.container.querySelector('#wb-definition')?.value.trim() || '';
        const emoji = this.container.querySelector('#wb-emoji')?.value.trim() || '';
        const imageUrl = this.container.querySelector('#wb-image-url')?.value.trim() || '';
        const distractors = this.container.querySelector('#wb-distractors')?.value.trim() || '';
        const rhymes = this.container.querySelector('#wb-rhymes')?.value.trim() || '';
        const associated = this.container.querySelector('#wb-associated')?.value.trim() || '';
        const synonyms = this.container.querySelector('#wb-synonyms')?.value.trim() || '';
        const antonyms = this.container.querySelector('#wb-antonyms')?.value.trim() || '';
        const sentences = this.container.querySelector('#wb-sentences')?.value.trim() || '';
        const phrases = this.container.querySelector('#wb-phrases')?.value.trim() || '';
        const difficulty = this.container.querySelector('#exercise-difficulty')?.value || 'medium';
        
        // Validate required fields
        if (!word) {
            alert(t('customize.wordbank.wordRequired') || 'Please enter a word.');
            return;
        }
        
        // Parse lists
        const parseList = (str) => str.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        const parseLines = (str) => str.split('\n').map(s => s.trim()).filter(s => s);
        
        const parsedDistractors = parseList(distractors);
        const parsedRhymes = parseList(rhymes);
        const parsedAssociated = parseList(associated);
        const parsedSynonyms = parseList(synonyms);
        const parsedAntonyms = parseList(antonyms);
        const parsedSentences = parseLines(sentences);
        const parsedPhrases = parseLines(phrases);
        
        // Validate distractors
        if (parsedDistractors.length < 3) {
            alert(t('customize.wordbank.distractorsRequired') || 'Please enter at least 3 distractor words.');
            return;
        }
        
        // Build image data
        let imageData = {};
        if (this.pendingImage) {
            const imageId = await imageStorage.saveImage(this.pendingImage, { word, category: 'custom' });
            imageData.localImageId = imageId;
            this.pendingImage = null;
        } else if (emoji) {
            imageData.emoji = emoji;
        } else if (imageUrl) {
            imageData.imageUrl = imageUrl;
        } else if (isEdit) {
            const existingExercise = customExercises[editType]?.[editIndex];
            if (existingExercise?.localImageId) imageData.localImageId = existingExercise.localImageId;
            else if (existingExercise?.emoji) imageData.emoji = existingExercise.emoji;
            else if (existingExercise?.imageUrl) imageData.imageUrl = existingExercise.imageUrl;
        }
        
        // Create wordbank entry structure
        const wordbankEntry = {
            id: `custom_${word}_${Date.now()}`,
            word,
            category,
            soundGroup,
            definition,
            visual: {
                emoji: imageData.emoji || null,
                asset: imageData.imageUrl || imageData.localImageId || null
            },
            relationships: {
                rhymes: parsedRhymes,
                associated: parsedAssociated,
                synonyms: parsedSynonyms,
                antonyms: parsedAntonyms
            },
            distractors: parsedDistractors,
            sentences: parsedSentences,
            phrases: parsedPhrases,
            difficulty,
            isCustom: true,
            status: 'active'
        };
        
        // Helper to save to exercise type
        const saveToType = (type, exercise) => {
            if (!customExercises[type]) customExercises[type] = [];
            
            if (isEdit && editType === type && editIndex !== null && editIndex < customExercises[type].length) {
                customExercises[type][editIndex] = exercise;
            } else if (!isEdit) {
                customExercises[type].push(exercise);
            }
        };
        
        let savedToTypes = new Set();
        
        // 1. Image-based exercises (naming, listening, speaking)
        if (imageData.emoji || imageData.imageUrl || imageData.localImageId) {
            const baseExercise = {
                answer: word,
                ...imageData,
                options: [word, ...parsedDistractors.slice(0, 3)],
                difficulty,
                isCustom: true,
                status: 'active'
            };
            
            ['naming', 'listening'].forEach(type => {
                saveToType(type, { ...baseExercise });
                savedToTypes.add(type);
            });
            
            // Typing with image
            saveToType('typing', {
                answer: word,
                ...imageData,
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('typing');
            
            // Speaking
            saveToType('speaking', {
                answer: word,
                ...imageData,
                phrases: parsedPhrases.length > 0 ? parsedPhrases : undefined,
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('speaking');
        } else {
            // Typing without image - just needs word and distractors
            if (word && parsedDistractors.length >= 3) {
                saveToType('typing', {
                    answer: word,
                    difficulty,
                    isCustom: true,
                    status: 'active'
                });
                savedToTypes.add('typing');
            }
        }
        
        // 2. Sentence completion
        if (parsedSentences.length > 0) {
            parsedSentences.forEach(sentence => {
                // Create blank version
                const blankSentence = sentence.replace(new RegExp(word, 'gi'), '__');
                if (blankSentence !== sentence) {
                    saveToType('sentenceTyping', {
                        sentence: blankSentence,
                        answer: word,
                        difficulty,
                        isCustom: true,
                        status: 'active'
                    });
                    savedToTypes.add('sentenceTyping');
                }
            });
        }
        
        // 3. Category
        if (category) {
            saveToType('category', {
                category,
                word,
                options: [word, ...parsedDistractors.slice(0, 3)],
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('category');
        }
        
        // 4. First Sound
        if (soundGroup) {
            // For first sound, we need other words with same sound
            // The user's word becomes one of the correct answers
            saveToType('firstSound', {
                sound: soundGroup,
                words: [word],
                distractors: parsedDistractors,
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('firstSound');
        }
        
        // 5. Rhyming
        if (parsedRhymes.length >= 1) {
            saveToType('rhyming', {
                word,
                rhymes: parsedRhymes,
                nonRhymes: parsedDistractors.slice(0, 3), // Use distractors as non-rhymes
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('rhyming');
        }
        
        // 6. Definitions
        if (definition) {
            saveToType('definitions', {
                word,
                definition,
                options: [word, ...parsedDistractors.slice(0, 3)],
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('definitions');
        }
        
        // 7. Association
        if (parsedAssociated.length >= 1) {
            saveToType('association', {
                word,
                associated: parsedAssociated,
                unrelated: parsedDistractors.slice(0, 3), // Use distractors as unrelated
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('association');
        }
        
        // 8. Synonyms/Antonyms
        if (parsedSynonyms.length >= 1 || parsedAntonyms.length >= 1) {
            saveToType('synonyms', {
                word,
                synonyms: parsedSynonyms,
                antonyms: parsedAntonyms,
                distractors: parsedDistractors.slice(0, 3),
                difficulty,
                isCustom: true,
                status: 'active'
            });
            savedToTypes.add('synonyms');
        }
        
        // Save
        if (savedToTypes.size > 0) {
            storageService.set(`customExercises_${locale}`, customExercises);
            
            // Also save to custom wordbank for reference
            const customWordbank = storageService.get(`customWordbank_${locale}`, []);
            if (isEdit) {
                const existingIndex = customWordbank.findIndex(w => w.word === word);
                if (existingIndex >= 0) {
                    customWordbank[existingIndex] = wordbankEntry;
                } else {
                    customWordbank.push(wordbankEntry);
                }
            } else {
                customWordbank.push(wordbankEntry);
            }
            storageService.set(`customWordbank_${locale}`, customWordbank);
            
            await this.render();
        } else {
            alert(t('customize.wordbank.noExercisesCreated') || 'No exercises could be created. Please add an image/emoji for picture exercises or other required data.');
        }
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
            isCustom: true,
            status: 'active'
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
        const timeValue = this.container.querySelector('#clock-time').value.trim();
        const timeWords = this.container.querySelector('#clock-words').value.trim();
        
        if (!timeValue || !timeWords) return;
        
        // Parse time value (supports H:MM, HH:MM formats)
        const timeParts = timeValue.split(':');
        if (timeParts.length < 2) {
            alert('Please enter time in HH:MM format (e.g., 3:00 or 14:30)');
            return;
        }
        
        const hour = parseInt(timeParts[0]);
        const minute = parseInt(timeParts[1]);
        
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            alert('Please enter a valid time (hours 0-23, minutes 0-59)');
            return;
        }
        
        // Format display time as H:MM (single digit hour) or HH:MM
        const displayTime = `${hour}:${minute.toString().padStart(2, '0')}`;
        
        // Calculate analog data
        const minuteAngle = minute * 6; // 6 degrees per minute
        const hourAngle = (hour % 12) * 30 + (minute * 0.5); // 30 degrees per hour + minute adjustment
        
        const difficulty = this.container.querySelector('#exercise-difficulty').value;
        
        const exercise = {
            id: isEdit ? null : `custom_${Date.now()}`,
            time: displayTime,
            hour: hour,
            minute: minute,
            digitalDisplay: displayTime,
            analogData: {
                hourAngle: hourAngle,
                minuteAngle: minuteAngle
            },
            timeWords: timeWords,
            difficulty: difficulty,
            isCustom: true,
            status: 'active'
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
        
        // Parse emojis using segmenter or fallback to spread operator
        const parseEmojis = (text) => {
            // First try splitting by spaces
            const spaceSplit = text.split(/\s+/).filter(p => p);
            if (spaceSplit.length > 1) {
                return spaceSplit;
            }
            
            // Use Intl.Segmenter if available (handles multi-codepoint emojis better)
            if (typeof Intl !== 'undefined' && Intl.Segmenter) {
                try {
                    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
                    const segments = [...segmenter.segment(text)];
                    return segments
                        .map(s => s.segment)
                        .filter(s => /\p{Emoji}/u.test(s) && s.trim());
                } catch (e) {
                    // Fall through to spread operator
                }
            }
            
            // Fallback: use spread operator to split into graphemes
            // Filter out variation selectors and zero-width joiners on their own
            const chars = [...text].filter(char => 
                char.trim() && 
                char !== '\uFE0F' && // variation selector
                char !== '\u200D'    // zero-width joiner
            );
            
            // Try to detect emoji sequences by checking for emoji property
            const emojis = [];
            let current = '';
            for (const char of chars) {
                if (/\p{Emoji}/u.test(char)) {
                    if (current) emojis.push(current);
                    current = char;
                } else {
                    current += char;
                }
            }
            if (current) emojis.push(current);
            
            return emojis.filter(e => /\p{Emoji}/u.test(e));
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
            isCustom: true,
            status: 'active'
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
        const customWordbank = storageService.get(`customWordbank_${locale}`, []);
        let totalImported = 0;
        
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
            totalImported = data.length * 3;
        } else if (type === 'multi_type') {
            // Handle new format where each row specifies its own exercise type
            data.forEach(exercise => {
                if (exercise.exerciseType === 'wordbank') {
                    // Process wordbank entry into multiple exercise types
                    const imported = this.processWordbankEntry(exercise, customExercises);
                    totalImported += imported;
                    
                    // Also save to wordbank
                    customWordbank.push({
                        ...exercise,
                        id: `custom_${exercise.word}_${Date.now()}`
                    });
                } else if (exercise.exerciseType === 'multiple') {
                    // Add to all applicable types
                    (exercise.applicableTypes || ['naming', 'typing', 'listening']).forEach(exerciseType => {
                        if (!customExercises[exerciseType]) customExercises[exerciseType] = [];
                        const exerciseForType = {
                            ...exercise,
                            status: 'active', // Explicitly set as active
                            // Remove options for typing exercises
                            ...(exerciseType === 'typing' ? { options: undefined } : {})
                        };
                        delete exerciseForType.exerciseType;
                        delete exerciseForType.applicableTypes;
                        customExercises[exerciseType].push(exerciseForType);
                        totalImported++;
                    });
                } else {
                    // Single exercise type
                    const exerciseType = exercise.exerciseType;
                    if (!customExercises[exerciseType]) customExercises[exerciseType] = [];
                    const cleanExercise = { 
                        ...exercise,
                        status: 'active' // Explicitly set as active
                    };
                    delete cleanExercise.exerciseType;
                    delete cleanExercise.applicableTypes;
                    customExercises[exerciseType].push(cleanExercise);
                    totalImported++;
                }
            });
        } else {
            // Single type import
            if (!customExercises[type]) customExercises[type] = [];
            // Add status: 'active' to each imported exercise
            const dataWithStatus = data.map(item => ({ ...item, status: 'active' }));
            customExercises[type].push(...dataWithStatus);
            totalImported = data.length;
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        storageService.set(`customWordbank_${locale}`, customWordbank);
        
        alert(t('customize.bulkUpload.success', { count: totalImported }));
        this.render();
    }
    
    /**
     * Process a wordbank entry into multiple exercise types
     * Returns the number of exercises created
     */
    processWordbankEntry(entry, customExercises) {
        const word = entry.word;
        const difficulty = entry.difficulty || 'medium';
        const distractors = entry.distractors || [];
        let count = 0;
        
        // Helper to add exercise
        const addExercise = (type, exercise) => {
            if (!customExercises[type]) customExercises[type] = [];
            customExercises[type].push({
                ...exercise,
                difficulty,
                isCustom: true,
                status: 'active'
            });
            count++;
        };
        
        // 1. Image-based exercises (if has visual)
        if (entry.visual?.emoji || entry.visual?.imageUrl) {
            const baseImageExercise = {
                answer: word,
                ...(entry.visual.emoji ? { emoji: entry.visual.emoji } : {}),
                ...(entry.visual.imageUrl ? { imageUrl: entry.visual.imageUrl } : {}),
                options: [word, ...distractors.slice(0, 3)]
            };
            
            addExercise('naming', { ...baseImageExercise });
            addExercise('listening', { ...baseImageExercise });
            addExercise('typing', { answer: word, ...(entry.visual.emoji ? { emoji: entry.visual.emoji } : {}), ...(entry.visual.imageUrl ? { imageUrl: entry.visual.imageUrl } : {}) });
            addExercise('speaking', { 
                answer: word, 
                ...(entry.visual.emoji ? { emoji: entry.visual.emoji } : {}),
                ...(entry.visual.imageUrl ? { imageUrl: entry.visual.imageUrl } : {}),
                phrases: entry.phrases || []
            });
        } else {
            // Typing without image
            addExercise('typing', { answer: word });
        }
        
        // 2. Definition
        if (entry.definition) {
            addExercise('definitions', {
                word: word,
                definition: entry.definition,
                options: [word, ...distractors.slice(0, 3)]
            });
        }
        
        // 3. Category
        if (entry.category) {
            addExercise('category', {
                category: entry.category,
                word: word,
                options: [word, ...distractors.slice(0, 3)]
            });
        }
        
        // 4. First Sound
        if (entry.soundGroup) {
            addExercise('firstSound', {
                sound: entry.soundGroup,
                words: [word],
                distractors: distractors
            });
        }
        
        // 5. Rhyming
        if (entry.rhymes && entry.rhymes.length > 0) {
            addExercise('rhyming', {
                word: word,
                rhymes: entry.rhymes,
                nonRhymes: distractors.slice(0, 3)
            });
        }
        
        // 6. Association
        if (entry.associated && entry.associated.length > 0) {
            addExercise('association', {
                word: word,
                associated: entry.associated,
                unrelated: distractors.slice(0, 3)
            });
        }
        
        // 7. Synonyms/Antonyms
        if ((entry.synonyms && entry.synonyms.length > 0) || (entry.antonyms && entry.antonyms.length > 0)) {
            addExercise('synonyms', {
                word: word,
                synonyms: entry.synonyms || [],
                antonyms: entry.antonyms || [],
                distractors: distractors.slice(0, 3)
            });
        }
        
        // 8. Sentence Typing
        if (entry.sentences && entry.sentences.length > 0) {
            entry.sentences.forEach(sentence => {
                const blankSentence = sentence.replace(new RegExp(word, 'gi'), '__');
                if (blankSentence !== sentence) {
                    addExercise('sentenceTyping', {
                        sentence: blankSentence,
                        answer: word
                    });
                }
            });
        }
        
        return count;
    }
    
    downloadTemplate() {
        // Get localized template examples
        const locale = i18n.getCurrentLocale();
        const isGerman = locale === 'de';
        
        // New wordbank-based template format
        // Headers for wordbank: exercise_type, difficulty, word, emoji, category, soundGroup, definition, distractors, rhymes, associated, synonyms, antonyms, sentences, phrases
        const headers = ['exercise_type', 'difficulty', 'word', 'emoji_or_url', 'category', 'sound_group', 'definition', 'distractors', 'rhymes', 'associated', 'synonyms', 'antonyms', 'sentences', 'phrases'];
        const rows = [];
        
        // Add fully-defined wordbank example (covers all 11 exercises)
        if (isGerman) {
            rows.push([
                'wordbank', 'easy', 'apfel', '🍎', 'obst', 'a', 
                'Eine runde Frucht die an Bäumen wächst',
                'banane,orange,traube,kirsche,mango,pfirsich,pflaume,kiwi,birne,melone',
                'stapel,gabel,tafel',
                'baum,rot,saft,kuchen',
                '',
                '',
                'Ich esse einen Apfel.|Der Apfel ist rot.',
                'Ein Apfel am Tag hält den Doktor fern'
            ]);
        } else {
            rows.push([
                'wordbank', 'easy', 'apple', '🍎', 'fruit', 'a', 
                'A round fruit that grows on trees',
                'banana,orange,grape,cherry,mango,peach,plum,kiwi,pear,melon',
                'dapple,grapple,chapel',
                'tree,red,juice,pie',
                '',
                '',
                'I eat an apple.|The apple is red.',
                'An apple a day keeps the doctor away'
            ]);
        }
        
        // Add second wordbank example with synonyms/antonyms
        if (isGerman) {
            rows.push([
                'wordbank', 'medium', 'glücklich', '😊', 'gefühl', 'g',
                'Ein positives Gefühl der Freude',
                'schnell,langsam,groß,klein,alt,neu,leicht,schwer,hell,dunkel',
                '',
                'lachen,lächeln,freude',
                'froh,zufrieden,fröhlich',
                'traurig,unglücklich',
                'Ich bin glücklich.|Sie ist sehr glücklich heute.',
                'Ich bin so glücklich dich zu sehen'
            ]);
        } else {
            rows.push([
                'wordbank', 'medium', 'happy', '😊', 'emotion', 'h',
                'A positive feeling of joy',
                'fast,slow,big,small,old,new,light,heavy,bright,dark',
                'snappy,clappy,nappy',
                'smile,laugh,joy',
                'glad,pleased,cheerful',
                'sad,unhappy',
                'I am happy.|She is very happy today.',
                'I am so happy to see you'
            ]);
        }
        
        // Add the 5 other exercise types
        // Scramble
        rows.push(isGerman ?
            ['scramble', 'easy', 'Die Katze schläft auf dem Sofa', '', '', '', '', '', '', '', '', '', '', ''] :
            ['scramble', 'easy', 'The cat is sleeping on the couch', '', '', '', '', '', '', '', '', '', '', '']
        );
        
        // Time Sequencing
        rows.push(isGerman ?
            ['timeSequencing', 'easy', 'Was kommt nach Montag?', 'Dienstag', 'Mittwoch,Sonntag,Freitag', '', '', '', '', '', '', '', '', ''] :
            ['timeSequencing', 'easy', 'What day comes after Monday?', 'Tuesday', 'Wednesday,Sunday,Friday', '', '', '', '', '', '', '', '', '']
        );
        
        // Clock Matching
        rows.push(isGerman ?
            ['clockMatching', 'easy', '3:00', 'drei Uhr', '4:00,5:00,6:00', '', '', '', '', '', '', '', '', ''] :
            ['clockMatching', 'easy', '3:00', 'three o\'clock', '4:00,5:00,6:00', '', '', '', '', '', '', '', '', '']
        );
        
        // Time Ordering
        rows.push(isGerman ?
            ['timeOrdering', 'easy', 'Morgenroutine', 'Aufwachen', 'Zähne putzen', 'Frühstücken', 'Zur Arbeit gehen', '', '', '', '', '', '', ''] :
            ['timeOrdering', 'easy', 'Morning routine', 'Wake up', 'Brush teeth', 'Eat breakfast', 'Go to work', '', '', '', '', '', '', '']
        );
        
        // Working Memory
        rows.push([
            'workingMemory', 'easy', '🍎🍌🍊', '🍇🍓🥝', '', '', '', '', '', '', '', '', '', ''
        ]);
        
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
    
    async archiveItem(type, index, word = null) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        // If word is provided, archive all exercises with this word across all types
        if (word) {
            const wordbankTypes = ['naming', 'typing', 'listening', 'speaking', 'definitions', 
                                   'category', 'rhyming', 'association', 'synonyms', 'firstSound', 'sentenceTyping'];
            
            for (const exType of wordbankTypes) {
                if (customExercises[exType]) {
                    customExercises[exType].forEach(exercise => {
                        const exWord = (exercise.answer || exercise.word || '').toLowerCase();
                        if (exWord === word.toLowerCase()) {
                            exercise.status = 'archived';
                        }
                    });
                }
            }
        } else if (customExercises[type] && customExercises[type][index]) {
            customExercises[type][index].status = 'archived';
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
    
    async unarchiveItem(type, index, word = null) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        // If word is provided, unarchive all exercises with this word across all types
        if (word) {
            const wordbankTypes = ['naming', 'typing', 'listening', 'speaking', 'definitions', 
                                   'category', 'rhyming', 'association', 'synonyms', 'firstSound', 'sentenceTyping'];
            
            for (const exType of wordbankTypes) {
                if (customExercises[exType]) {
                    customExercises[exType].forEach(exercise => {
                        const exWord = (exercise.answer || exercise.word || '').toLowerCase();
                        if (exWord === word.toLowerCase()) {
                            exercise.status = 'active';
                        }
                    });
                }
            }
        } else if (customExercises[type] && customExercises[type][index]) {
            customExercises[type][index].status = 'active';
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
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
        
        // Try to get enhanced data from custom wordbank if available
        const customWordbank = storageService.get(`customWordbank_${locale}`, []);
        const wordToMatch = item.answer || item.word;
        const wordbankEntry = customWordbank.find(w => w.word === wordToMatch);
        
        // Merge wordbank data with exercise data for a complete edit
        const editData = wordbankEntry ? {
            ...item,
            word: wordbankEntry.word,
            category: wordbankEntry.category || item.category,
            soundGroup: wordbankEntry.soundGroup || item.soundGroup || item.sound,
            definition: wordbankEntry.definition || item.definition,
            visual: wordbankEntry.visual || { emoji: item.emoji, asset: item.imageUrl },
            emoji: wordbankEntry.visual?.emoji || item.emoji,
            imageUrl: wordbankEntry.visual?.asset || item.imageUrl,
            relationships: wordbankEntry.relationships || {
                rhymes: item.rhymes,
                associated: item.associated,
                synonyms: item.synonyms,
                antonyms: item.antonyms
            },
            rhymes: wordbankEntry.relationships?.rhymes || item.rhymes,
            associated: wordbankEntry.relationships?.associated || item.associated,
            synonyms: wordbankEntry.relationships?.synonyms || item.synonyms,
            antonyms: wordbankEntry.relationships?.antonyms || item.antonyms,
            distractors: wordbankEntry.distractors || item.distractors || item.nonRhymes || item.unrelated || item.options?.slice(1),
            sentences: wordbankEntry.sentences || item.sentences,
            phrases: wordbankEntry.phrases || item.phrases,
            difficulty: item.difficulty
        } : item;
        
        // Store selected type for highlighting
        this.selectedExerciseType = type;
                
        // Render the form with pre-filled data
        const formContainer = this.container.querySelector('#add-form-container');
        if (formContainer) {
            formContainer.innerHTML = this.renderIndividualForm(type, editData, index);
            await this.attachFormListeners(type);
            
            // Set the dropdown to show the correct type
            this.container.querySelectorAll('.type-dropdown').forEach(d => d.value = '');
            const targetDropdown = this.container.querySelector(`[data-category] option[value="${type}"]`);
            if (targetDropdown) {
                targetDropdown.closest('select').value = type;
            }
            
            // Apply field highlighting for the exercise type
            const form = this.container.querySelector('.wordbank-form') || this.container.querySelector('.add-form');
            if (form) {
                this.highlightFieldsForExercise(form, type);
                if (form.classList.contains('wordbank-form')) {
                    this.updateExerciseIndicators(form);
                }
            }
        }
        
        // Scroll to form
        formContainer?.scrollIntoView({ behavior: 'smooth' });
    }
    
    async deleteItem(type, index, word = null) {
        if (!confirm(t('customize.confirmDelete'))) return;
        
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        
        // If word is provided, delete all exercises with this word across all types
        if (word) {
            const wordbankTypes = ['naming', 'typing', 'listening', 'speaking', 'definitions', 
                                   'category', 'rhyming', 'association', 'synonyms', 'firstSound', 'sentenceTyping'];
            
            for (const exType of wordbankTypes) {
                if (customExercises[exType]) {
                    // Delete images first
                    for (const exercise of customExercises[exType]) {
                        const exWord = (exercise.answer || exercise.word || '').toLowerCase();
                        if (exWord === word.toLowerCase() && exercise.localImageId) {
                            await imageStorage.deleteImage(exercise.localImageId);
                        }
                    }
                    
                    // Filter out exercises with the word
                    customExercises[exType] = customExercises[exType].filter(exercise => {
                        const exWord = (exercise.answer || exercise.word || '').toLowerCase();
                        return exWord !== word.toLowerCase();
                    });
                }
            }
            
            // Also remove from wordbank
            const customWordbank = storageService.get(`customWordbank_${locale}`, []);
            const filteredWordbank = customWordbank.filter(w => w.word?.toLowerCase() !== word.toLowerCase());
            storageService.set(`customWordbank_${locale}`, filteredWordbank);
            
        } else if (customExercises[type] && customExercises[type][index]) {
            const item = customExercises[type][index];
            if (item.localImageId) {
                await imageStorage.deleteImage(item.localImageId);
            }
            
            // Delete the item from the current type
            customExercises[type].splice(index, 1);
            
            // If this is a shared exercise type (naming, typing, listening), 
            // delete the corresponding item from the other shared types
            const sharedTypes = ['naming', 'typing', 'listening'];
            if (sharedTypes.includes(type)) {
                // Find and delete the same item from other shared types
                sharedTypes.forEach(sharedType => {
                    if (sharedType !== type && customExercises[sharedType]) {
                        // Find matching item by answer (they should have the same answer)
                        const matchIndex = customExercises[sharedType].findIndex(ex => 
                            ex.answer === item.answer && 
                            ex.isCustom === item.isCustom &&
                            ex.difficulty === item.difficulty
                        );
                        if (matchIndex !== -1) {
                            customExercises[sharedType].splice(matchIndex, 1);
                        }
                    }
                });
            }
        }
        
        storageService.set(`customExercises_${locale}`, customExercises);
        await this.render();
    }
}

export default CustomizePage;
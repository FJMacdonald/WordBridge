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
                        <div class="type-grid">
                            <button class="type-btn" data-type="naming">
                                <span class="type-icon">🖼️</span>
                                <span class="type-name">${t('customize.types.picture')}</span>
                            </button>
                            <button class="type-btn" data-type="sentenceTyping">
                                <span class="type-icon">📝</span>
                                <span class="type-name">${t('customize.types.sentence')}</span>
                            </button>
                            <button class="type-btn" data-type="words">
                                <span class="type-icon">📚</span>
                                <span class="type-name">${t('customize.types.words')}</span>
                            </button>
                        </div>
                    </div>
                    
                    <div id="add-form-container"></div>
                </div>
                
                <!-- Bulk Mode -->
                <div class="mode-content" id="bulk-mode" hidden>
                    ${this.renderBulkUploadSection()}
                </div>
                
                <!-- Existing Custom Exercises -->
                <section class="existing-section">
                    <h3>${t('customize.existing')}</h3>
                    <div id="existing-items">
                        ${await this.renderExistingItems(customExercises)}
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
                            <div class="format-item">
                                <strong>${t('customize.bulkUpload.pictureFormat')}</strong>
                                <code>word, image_url, option1, option2, option3</code>
                                <p>${t('customize.bulkUpload.pictureExample')}</p>
                            </div>
                            <div class="format-item">
                                <strong>${t('customize.bulkUpload.sentenceFormat')}</strong>
                                <code>sentence_with_blank, answer</code>
                                <p>${t('customize.bulkUpload.sentenceExample')}</p>
                            </div>
                            <div class="format-item">
                                <strong>${t('customize.bulkUpload.wordFormat')}</strong>
                                <code>type, word, related_words</code>
                                <p>${t('customize.bulkUpload.wordExample')}</p>
                            </div>
                        </div>
                    </div>
                </details>
                
                <!-- Template Downloads -->
                <div class="template-section">
                    <h4>${t('customize.bulkUpload.downloadTemplate')}:</h4>
                    <div class="template-buttons">
                        <button class="btn btn--secondary" data-template="naming">
                            📥 ${t('customize.types.picture')} Template
                        </button>
                        <button class="btn btn--secondary" data-template="sentences">
                            📥 ${t('customize.types.sentence')} Template
                        </button>
                        <button class="btn btn--secondary" data-template="words">
                            📥 ${t('customize.types.words')} Template
                        </button>
                    </div>
                </div>
                
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
        
        if (type === 'naming') {
            preview = item.localImageId ? '🖼️' : '📷';
            details = `<strong>${item.answer}</strong>`;
        } else if (type === 'sentenceTyping') {
            preview = '📝';
            details = `<span class="item-sentence">${item.sentence}</span><br>
                      <strong>Answer: ${item.answer}</strong>`;
        } else {
            preview = '📚';
            details = `<strong>${item.word || 'Word exercise'}</strong>`;
        }
        
        return `
            <div class="item-card" data-type="${type}" data-index="${index}">
                <div class="item-preview">${preview}</div>
                <div class="item-details">${details}</div>
                <button class="item-delete-btn" data-type="${type}" data-index="${index}">
                    ${t('customize.delete')}
                </button>
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
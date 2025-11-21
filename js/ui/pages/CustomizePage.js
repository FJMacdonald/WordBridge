import storageService from '../../services/StorageService.js';
import imageStorage from '../../services/ImageStorageService.js';
import csvService from '../../services/CSVService.js';
import Config from '../../core/Config.js';

/**
 * Customize exercises page
 */
class CustomizePage {
    constructor(container) {
        this.container = container;
        this.currentMode = 'individual'; // 'individual' or 'bulk'
    }
    
    async render() {
        const customExercises = storageService.get('customExercises', {});
        
        this.container.innerHTML = `
            <div class="customize-page">
                <header class="page-header">
                    <h2>Add Custom Exercises</h2>
                    <button class="btn btn--ghost" id="back-btn">
                        ← Back
                    </button>
                </header>
                
                <!-- Mode Toggle -->
                <div class="mode-toggle">
                    <button class="mode-btn active" data-mode="individual">
                        ➕ Individual
                    </button>
                    <button class="mode-btn" data-mode="bulk">
                        📋 Bulk Upload
                    </button>
                </div>
                
                <!-- Individual Mode -->
                <div class="mode-content" id="individual-mode">
                    <div class="exercise-type-selector">
                        <h3>Choose Exercise Type:</h3>
                        <div class="type-grid">
                            <button class="type-btn" data-type="naming">
                                <span class="type-icon">🖼️</span>
                                <span class="type-name">Picture</span>
                            </button>
                            <button class="type-btn" data-type="sentenceTyping">
                                <span class="type-icon">📝</span>
                                <span class="type-name">Sentence</span>
                            </button>
                            <button class="type-btn" data-type="words">
                                <span class="type-icon">📚</span>
                                <span class="type-name">Words</span>
                            </button>
                        </div>
                    </div>
                    
                    <div id="add-form-container"></div>
                </div>
                
                <!-- Bulk Mode -->
                <div class="mode-content" id="bulk-mode" hidden>
                    <div class="bulk-upload-section">
                        <h3>Bulk Upload from CSV</h3>
                        
                        <!-- Collapsible Instructions -->
                        <details class="instructions-panel">
                            <summary class="instructions-header">
                                📖 Instructions (click to expand)
                            </summary>
                            <div class="instructions-content">
                                <h4>How to upload custom exercises:</h4>
                                <ol>
                                    <li>Download the template CSV file for the exercise type you want</li>
                                    <li>Open it in Excel, Google Sheets, or any spreadsheet app</li>
                                    <li>Fill in your custom exercises following the format</li>
                                    <li>Save as CSV file</li>
                                    <li>Upload the file here</li>
                                </ol>
                                
                                <h4>CSV Format Guidelines:</h4>
                                <div class="format-guide">
                                    <div class="format-item">
                                        <strong>Picture Naming:</strong>
                                        <code>word, image_url, option1, option2, option3</code>
                                        <p>Example: apple, https://example.com/apple.jpg, banana, orange, pear</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>Sentences:</strong>
                                        <code>sentence_with_blank, answer</code>
                                        <p>Example: I drink __ every morning, coffee</p>
                                    </div>
                                    <div class="format-item">
                                        <strong>Words:</strong>
                                        <code>type, word, related_words</code>
                                        <p>Example: rhyming, cat, hat|bat|mat</p>
                                    </div>
                                </div>
                            </div>
                        </details>
                        
                        <!-- Template Downloads -->
                        <div class="template-section">
                            <h4>Download Templates:</h4>
                            <div class="template-buttons">
                                <button class="btn btn--secondary" data-template="naming">
                                    📥 Picture Template
                                </button>
                                <button class="btn btn--secondary" data-template="sentences">
                                    📥 Sentence Template
                                </button>
                                <button class="btn btn--secondary" data-template="words">
                                    📥 Words Template
                                </button>
                            </div>
                        </div>
                        
                        <!-- Upload Section -->
                        <div class="upload-section">
                            <h4>Upload Your CSV:</h4>
                            <div class="upload-zone" id="upload-zone">
                                <input type="file" id="csv-file" accept=".csv" hidden>
                                <label for="csv-file" class="upload-label">
                                    <span class="upload-icon">📁</span>
                                    <span class="upload-text">Click to select CSV file or drag & drop here</span>
                                </label>
                            </div>
                            
                            <!-- Error Display -->
                            <div id="upload-errors" class="error-panel" hidden></div>
                            
                            <!-- Preview -->
                            <div id="upload-preview" class="preview-panel" hidden></div>
                        </div>
                    </div>
                </div>
                
                <!-- Existing Custom Exercises -->
                <section class="existing-section">
                    <h3>Your Custom Exercises</h3>
                    <div id="existing-items">
                        ${await this.renderExistingItems(customExercises)}
                    </div>
                </section>
            </div>
        `;
        
        this.attachListeners();
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
                <h3>Add Picture Exercise</h3>
                
                <div class="form-group">
                    <label>Word (Answer)</label>
                    <input type="text" id="word-input" placeholder="e.g., apple" required>
                </div>
                
                <div class="form-group">
                    <label>Image</label>
                    <div class="image-upload-area">
                        <input type="file" id="image-upload" accept="image/*" required>
                        <div class="image-preview" id="image-preview"></div>
                    </div>
                    <small>Upload a picture for this word</small>
                </div>
                
                <div class="form-group">
                    <label>Wrong Options (optional)</label>
                    <input type="text" id="options-input" placeholder="e.g., orange, banana, pear">
                    <small>Leave empty to auto-generate from other words</small>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn--ghost" id="cancel-form">Cancel</button>
                    <button type="submit" class="btn btn--primary">Add Exercise</button>
                </div>
            </form>
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
        
        // Back button
        this.container.querySelector('#back-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
        });
    }
    
    async handleCSVUpload(file) {
        const errorPanel = this.container.querySelector('#upload-errors');
        const previewPanel = this.container.querySelector('#upload-preview');
        
        try {
            const result = await csvService.parseCSV(file);
            
            if (result.errors.length > 0) {
                // Show errors
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
            
            // Show preview
            if (result.data.length > 0) {
                previewPanel.innerHTML = `
                    <h4>✓ Ready to import ${result.data.length} exercises</h4>
                    <div class="preview-list">
                        ${result.data.slice(0, 5).map(item => `
                            <div class="preview-item">
                                ${this.renderPreviewItem(result.type, item)}
                            </div>
                        `).join('')}
                        ${result.data.length > 5 ? `<p>... and ${result.data.length - 5} more</p>` : ''}
                    </div>
                    <div class="preview-actions">
                        <button class="btn btn--ghost" id="cancel-import">Cancel</button>
                        <button class="btn btn--primary" id="confirm-import">Import All Valid</button>
                    </div>
                `;
                previewPanel.hidden = false;
                
                // Attach import handlers
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
                <div class="error-help">
                    <h5>Common issues:</h5>
                    <ul>
                        <li>Make sure the file is a valid CSV</li>
                        <li>Check that columns are separated by commas</li>
                        <li>Ensure the first row contains headers</li>
                        <li>Download and use our template for the correct format</li>
                    </ul>
                </div>
            `;
            errorPanel.hidden = false;
        }
    }
    
    downloadTemplate(type) {
        const templates = {
            naming: {
                headers: ['word', 'image_url', 'option1', 'option2', 'option3'],
                rows: [
                    ['apple', 'https://example.com/apple.jpg', 'banana', 'orange', 'pear'],
                    ['car', 'https://example.com/car.jpg', 'bus', 'train', 'bike']
                ]
            },
            sentences: {
                headers: ['sentence', 'answer'],
                rows: [
                    ['I drink __ every morning', 'coffee'],
                    ['The cat sat on the __', 'mat']
                ]
            },
            words: {
                headers: ['type', 'word', 'related_words'],
                rows: [
                    ['rhyming', 'cat', 'hat|bat|mat'],
                    ['synonym', 'happy', 'joyful|glad|cheerful'],
                    ['association', 'bread', 'butter|toast|sandwich']
                ]
            }
        };
        
        const template = templates[type];
        if (!template) return;
        
        csvService.downloadCSV(template, `${type}_template.csv`);
    }
    
      
    renderAddForm(type) {
        switch (type) {
            case 'naming':
                return this.renderNamingForm();
            case 'sentences':
                return this.renderSentenceForm();
            case 'words':
                return this.renderWordsForm();
            default:
                return '';
        }
    }
    
    
    renderSentenceForm() {
        return `
            <form class="add-form" id="add-sentence-form">
                <h3>Add Sentence Exercise</h3>
                
                <div class="form-group">
                    <label for="sentence-input">Sentence (use __ for blank)</label>
                    <input type="text" id="sentence-input" 
                           placeholder="e.g., I drink __ every morning" required>
                </div>
                
                <div class="form-group">
                    <label for="sentence-answer">Answer</label>
                    <input type="text" id="sentence-answer" placeholder="e.g., coffee" required>
                </div>
                
                <button type="submit" class="btn btn--primary">Add Sentence</button>
            </form>
        `;
    }
    
    renderWordsForm() {
        return `
            <form class="add-form" id="add-words-form">
                <h3>Add Word Exercises</h3>
                
                <div class="form-group">
                    <label>Exercise Type</label>
                    <select id="word-type">
                        <option value="rhyming">Rhyming Words</option>
                        <option value="association">Word Association</option>
                        <option value="synonyms">Synonyms/Antonyms</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="main-word">Main Word</label>
                    <input type="text" id="main-word" placeholder="e.g., cat" required>
                </div>
                
                <div class="form-group" id="rhyming-fields">
                    <label for="rhymes-input">Rhyming Words (comma separated)</label>
                    <input type="text" id="rhymes-input" placeholder="e.g., hat, bat, mat">
                    
                    <label for="non-rhymes-input">Non-Rhyming Words (comma separated)</label>
                    <input type="text" id="non-rhymes-input" placeholder="e.g., dog, cup, tree">
                </div>
                
                <div class="form-group" id="association-fields" hidden>
                    <label for="associated-input">Associated Words (comma separated)</label>
                    <input type="text" id="associated-input" placeholder="e.g., butter, toast">
                    
                    <label for="unrelated-input">Unrelated Words (comma separated)</label>
                    <input type="text" id="unrelated-input" placeholder="e.g., car, phone">
                </div>
                
                <div class="form-group" id="synonym-fields" hidden>
                    <label for="synonyms-input">Synonyms (comma separated)</label>
                    <input type="text" id="synonyms-input" placeholder="e.g., happy, joyful">
                    
                    <label for="antonyms-input">Antonyms (comma separated)</label>
                    <input type="text" id="antonyms-input" placeholder="e.g., sad, unhappy">
                </div>
                
                <button type="submit" class="btn btn--primary">Add Word Exercise</button>
            </form>
        `;
    }
    
    async renderExistingItems(type, items) {
        if (!items || items.length === 0) {
            return '<p class="empty-state">No custom exercises yet. Add one above!</p>';
        }
        
        let html = '<div class="items-list">';
        
        for (const [index, item] of items.entries()) {
            html += await this.renderExistingItem(type, item, index);
        }
        
        html += '</div>';
        return html;
    }
    
    async renderExistingItem(type, item, index) {
        let preview = '';
        let details = '';
        
        if (type === 'naming') {
            if (item.emoji) {
                preview = `<span class="item-emoji">${item.emoji}</span>`;
            } else if (item.localImageId) {
                const imageData = await imageStorage.getImage(item.localImageId);
                preview = imageData 
                    ? `<img src="${imageData}" class="item-image" alt="${item.answer}">`
                    : '<span class="item-emoji">🖼️</span>';
            } else if (item.imageUrl) {
                preview = `<img src="${item.imageUrl}" class="item-image" alt="${item.answer}">`;
            }
            details = `<strong>${item.answer}</strong>`;
        } else if (type === 'sentences') {
            preview = '📝';
            details = `<span class="sentence-preview">${item.sentence}</span><br>
                      <strong>Answer: ${item.answer}</strong>`;
        } else {
            preview = '📚';
            details = `<strong>${item.word}</strong>`;
        }
        
        return `
            <div class="item-card" data-type="${type}" data-index="${index}">
                <div class="item-preview">${preview}</div>
                <div class="item-details">${details}</div>
                <button class="item-delete-btn" data-type="${type}" data-index="${index}">🗑️</button>
            </div>
        `;
    }

    
    async switchTab(tab) {
        this.currentTab = tab;
        
        // Update active tab
        this.container.querySelectorAll('.tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        // Update form
        this.container.querySelector('#add-form-container').innerHTML = this.renderAddForm(tab);
        
        // Update items
        const customExercises = storageService.get('customExercises', {});
        this.container.querySelector('#existing-items').innerHTML = 
            await this.renderExistingItems(tab, customExercises[tab] || []);
        
        // Re-attach listeners
        this.attachFormListeners();
    }
    
    attachFormListeners() {
        // Re-attach form-specific listeners after tab switch
        // (Same listeners as in attachListeners but for dynamic content)
        
        this.container.querySelectorAll('.image-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchImageType(e.target.dataset.type));
        });
        
        this.container.querySelector('#emoji-input')?.addEventListener('input', (e) => {
            this.container.querySelector('#emoji-preview').textContent = e.target.value;
        });
        
        this.container.querySelector('#image-upload')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const resized = await imageStorage.resizeImage(file);
                this.container.querySelector('#upload-preview').innerHTML = 
                    `<img src="${resized}" alt="Preview">`;
                this.pendingImage = resized;
            }
        });
        
        this.container.querySelector('#word-type')?.addEventListener('change', (e) => {
            this.showWordTypeFields(e.target.value);
        });
        
        this.container.querySelector('#add-naming-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddNaming();
        });
        
        this.container.querySelector('#add-sentence-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddSentence();
        });
        
        this.container.querySelector('#add-words-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddWords();
        });
    }
    
    switchImageType(type) {
        this.container.querySelectorAll('.image-option-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        this.container.querySelectorAll('.image-input').forEach(input => {
            input.classList.toggle('active', input.dataset.for === type);
        });
        
        this.selectedImageType = type;
    }
    
    showWordTypeFields(type) {
        const rhymingFields = this.container.querySelector('#rhyming-fields');
        const associationFields = this.container.querySelector('#association-fields');
        const synonymFields = this.container.querySelector('#synonym-fields');
        
        rhymingFields.hidden = type !== 'rhyming';
        associationFields.hidden = type !== 'association';
        synonymFields.hidden = type !== 'synonyms';
    }
    
    async handleAddNaming() {
        const word = this.container.querySelector('#word-input').value.trim().toLowerCase();
        const optionsInput = this.container.querySelector('#options-input').value;
        
        if (!word) return;
        
        const exercise = { answer: word, isCustom: true };
        
        // Handle image
        const imageType = this.selectedImageType || 'emoji';
        
        if (imageType === 'emoji') {
            const emoji = this.container.querySelector('#emoji-input').value;
            if (!emoji) {
                alert('Please enter an emoji');
                return;
            }
            exercise.emoji = emoji;
        } else if (imageType === 'upload' && this.pendingImage) {
            const imageId = await imageStorage.saveImage(this.pendingImage, {
                word: word,
                category: 'custom'
            });
            exercise.localImageId = imageId;
        } else if (imageType === 'url') {
            const url = this.container.querySelector('#image-url').value;
            if (!url) {
                alert('Please enter an image URL');
                return;
            }
            exercise.imageUrl = url;
        }
        
        // Handle options
        if (optionsInput) {
            const options = optionsInput.split(',').map(o => o.trim().toLowerCase());
            exercise.options = [word, ...options];
        } else {
            // Auto-generate options later when exercise runs
            exercise.options = [word];
        }
        
        // Save
        const customExercises = storageService.get('customExercises', {});
        if (!customExercises.naming) customExercises.naming = [];
        customExercises.naming.push(exercise);
        storageService.set('customExercises', customExercises);
        
        // Reset form and refresh
        this.pendingImage = null;
        await this.switchTab('naming');
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
        
        const customExercises = storageService.get('customExercises', {});
        if (!customExercises.sentenceTyping) customExercises.sentenceTyping = [];
        customExercises.sentenceTyping.push(exercise);
        storageService.set('customExercises', customExercises);
        
        await this.switchTab('sentences');
    }
    
    async handleAddWords() {
        const type = this.container.querySelector('#word-type').value;
        const mainWord = this.container.querySelector('#main-word').value.trim().toLowerCase();
        
        if (!mainWord) return;
        
        let exercise = { word: mainWord, isCustom: true };
        
        if (type === 'rhyming') {
            const rhymes = this.container.querySelector('#rhymes-input').value
                .split(',').map(w => w.trim().toLowerCase()).filter(w => w);
            const nonRhymes = this.container.querySelector('#non-rhymes-input').value
                .split(',').map(w => w.trim().toLowerCase()).filter(w => w);
            
            exercise.rhymes = rhymes;
            exercise.nonRhymes = nonRhymes;
        } else if (type === 'association') {
            const associated = this.container.querySelector('#associated-input').value
                .split(',').map(w => w.trim().toLowerCase()).filter(w => w);
            const unrelated = this.container.querySelector('#unrelated-input').value
                .split(',').map(w => w.trim().toLowerCase()).filter(w => w);
            
            exercise.associated = associated;
            exercise.unrelated = unrelated;
        } else if (type === 'synonyms') {
            const synonyms = this.container.querySelector('#synonyms-input').value
                .split(',').map(w => w.trim().toLowerCase()).filter(w => w);
            const antonyms = this.container.querySelector('#antonyms-input').value
                .split(',').map(w => w.trim().toLowerCase()).filter(w => w);
            
            exercise.synonyms = synonyms;
            exercise.antonyms = antonyms;
        }
        
        const customExercises = storageService.get('customExercises', {});
        if (!customExercises[type]) customExercises[type] = [];
        customExercises[type].push(exercise);
        storageService.set('customExercises', customExercises);
        
        await this.switchTab('words');
    }
    
    async deleteItem(type, index) {
        if (!confirm('Delete this exercise?')) return;
        
        const customExercises = storageService.get('customExercises', {});
        
        if (customExercises[type] && customExercises[type][index]) {
            // Delete associated image if exists
            const item = customExercises[type][index];
            if (item.localImageId) {
                await imageStorage.deleteImage(item.localImageId);
            }
            
            customExercises[type].splice(index, 1);
            storageService.set('customExercises', customExercises);
        }
        
        await this.switchTab(this.currentTab);
    }

}

export default CustomizePage;
import storageService from '../../services/StorageService.js';
import imageStorage from '../../services/ImageStorageService.js';
import importExportService from '../../services/ImportExportService.js';

/**
 * Customize exercises page
 */
class CustomizePage {
    constructor(container) {
        this.container = container;
        this.currentTab = 'naming';
    }
    
    async render() {
        const customExercises = storageService.get('customExercises', {});
        
        this.container.innerHTML = `
            <div class="customize-page">
                <header class="page-header">
                    <h2>Customize Exercises</h2>
                </header>
                
                <!-- Tabs -->
                <div class="tabs">
                    <button class="tab active" data-tab="naming">🖼️ Pictures</button>
                    <button class="tab" data-tab="sentences">📝 Sentences</button>
                    <button class="tab" data-tab="words">📚 Words</button>
                </div>
                
                <!-- Add New Form -->
                <div class="add-form-container" id="add-form-container">
                    ${this.renderAddForm('naming')}
                </div>
                
                <!-- Existing Items -->
                <div class="existing-items" id="existing-items">
                    ${await this.renderExistingItems('naming', customExercises.naming || [])}
                </div>
                
                <!-- Bulk Actions -->
                <section class="bulk-actions">
                    <h3>Import/Export</h3>
                    <div class="action-buttons">
                        <button class="btn btn--secondary" id="export-custom-btn">
                            📤 Export Custom Exercises
                        </button>
                        <label class="btn btn--secondary file-label">
                            📥 Import Exercises
                            <input type="file" id="import-exercises-file" accept=".json" hidden>
                        </label>
                    </div>
                </section>
                
                <button class="btn btn--ghost back-btn" id="back-btn">
                    ← Back to Home
                </button>
            </div>
        `;
        
        this.addStyles();
        this.attachListeners();
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
    
    renderNamingForm() {
        return `
            <form class="add-form" id="add-naming-form">
                <h3>Add Picture Exercise</h3>
                
                <div class="form-group">
                    <label>Image</label>
                    <div class="image-options">
                        <button type="button" class="image-option-btn active" data-type="emoji">
                            😀 Emoji
                        </button>
                        <button type="button" class="image-option-btn" data-type="upload">
                            📷 Upload
                        </button>
                        <button type="button" class="image-option-btn" data-type="url">
                            🔗 URL
                        </button>
                    </div>
                    
                    <div class="image-input-container">
                        <div class="image-input active" data-for="emoji">
                            <input type="text" id="emoji-input" placeholder="Enter or paste emoji" 
                                   class="emoji-input" maxlength="4">
                            <div class="emoji-preview" id="emoji-preview"></div>
                        </div>
                        <div class="image-input" data-for="upload">
                            <input type="file" id="image-upload" accept="image/*">
                            <div class="upload-preview" id="upload-preview"></div>
                        </div>
                        <div class="image-input" data-for="url">
                            <input type="url" id="image-url" placeholder="https://example.com/image.jpg">
                            <div class="url-preview" id="url-preview"></div>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="word-input">Word (Answer)</label>
                    <input type="text" id="word-input" placeholder="e.g., apple" required>
                </div>
                
                <div class="form-group">
                    <label for="options-input">Wrong Options (comma separated)</label>
                    <input type="text" id="options-input" placeholder="e.g., orange, banana, pear">
                    <small>Leave empty to auto-generate from other words</small>
                </div>
                
                <button type="submit" class="btn btn--primary">Add Exercise</button>
            </form>
        `;
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
    
    attachListeners() {
        // Tabs
        this.container.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Image type selection
        this.container.querySelectorAll('.image-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchImageType(e.target.dataset.type));
        });
        
        // Emoji preview
        this.container.querySelector('#emoji-input')?.addEventListener('input', (e) => {
            this.container.querySelector('#emoji-preview').textContent = e.target.value;
        });
        
        // Image upload preview
        this.container.querySelector('#image-upload')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const resized = await imageStorage.resizeImage(file);
                this.container.querySelector('#upload-preview').innerHTML = 
                    `<img src="${resized}" alt="Preview">`;
                this.pendingImage = resized;
            }
        });
        
        // URL preview
        this.container.querySelector('#image-url')?.addEventListener('blur', (e) => {
            const url = e.target.value;
            if (url) {
                this.container.querySelector('#url-preview').innerHTML = 
                    `<img src="${url}" alt="Preview" onerror="this.style.display='none'">`;
            }
        });
        
        // Word type fields
        this.container.querySelector('#word-type')?.addEventListener('change', (e) => {
            this.showWordTypeFields(e.target.value);
        });
        
        // Forms
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
        
        // Delete buttons
        this.container.addEventListener('click', async (e) => {
            if (e.target.classList.contains('item-delete-btn')) {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                await this.deleteItem(type, index);
            }
        });
        
        // Export/Import
        this.container.querySelector('#export-custom-btn')?.addEventListener('click', () => {
            importExportService.exportExerciseData(true);
        });
        
        this.container.querySelector('#import-exercises-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await importExportService.importFromFile(file);
                    alert(result.message);
                    this.render();
                } catch (err) {
                    alert('Import failed: ' + err.message);
                }
            }
        });
        
        // Back button
        this.container.querySelector('#back-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
        });
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
    
    addStyles() {
        if (document.getElementById('customize-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'customize-styles';
        style.textContent = `
            .customize-page {
                padding-bottom: var(--space-2xl);
            }
            .tabs {
                display: flex;
                gap: var(--space-sm);
                margin-bottom: var(--space-lg);
            }
            .tab {
                flex: 1;
                padding: var(--space-md);
                background: var(--color-surface);
                border: 2px solid var(--color-border);
                border-radius: var(--radius-md);
                font-weight: 500;
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            .tab:hover {
                border-color: var(--color-primary);
            }
            .tab.active {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
            }
            .add-form {
                background: var(--color-surface);
                border-radius: var(--radius-lg);
                padding: var(--space-lg);
                margin-bottom: var(--space-xl);
                border: 1px solid var(--color-border);
            }
            .add-form h3 {
                margin-bottom: var(--space-lg);
            }
            .form-group {
                margin-bottom: var(--space-lg);
            }
            .form-group label {
                display: block;
                font-weight: 500;
                margin-bottom: var(--space-sm);
            }
            .form-group input,
            .form-group select {
                width: 100%;
                padding: var(--space-md);
                border: 2px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--font-size-base);
            }
            .form-group input:focus,
            .form-group select:focus {
                border-color: var(--color-primary);
                outline: none;
            }
            .form-group small {
                display: block;
                margin-top: var(--space-xs);
                color: var(--color-text-muted);
                font-size: var(--font-size-sm);
            }
            .image-options {
                display: flex;
                gap: var(--space-sm);
                margin-bottom: var(--space-md);
            }
            .image-option-btn {
                flex: 1;
                padding: var(--space-sm);
                background: var(--color-background);
                border: 2px solid var(--color-border);
                border-radius: var(--radius-md);
                cursor: pointer;
            }
            .image-option-btn.active {
                border-color: var(--color-primary);
                background: var(--color-primary-light);
            }
            .image-input-container {
                position: relative;
            }
            .image-input {
                display: none;
            }
            .image-input.active {
                display: block;
            }
            .emoji-input {
                font-size: var(--font-size-2xl);
                text-align: center;
            }
            #emoji-preview,
            #upload-preview,
            #url-preview {
                margin-top: var(--space-md);
                text-align: center;
            }
            #emoji-preview {
                font-size: 4rem;
            }
            #upload-preview img,
            #url-preview img {
                max-width: 150px;
                max-height: 150px;
                border-radius: var(--radius-md);
            }
            .empty-state {
                text-align: center;
                color: var(--color-text-muted);
                padding: var(--space-xl);
            }
            .items-list {
                display: grid;
                gap: var(--space-md);
            }
            .item-card {
                display: flex;
                align-items: center;
                gap: var(--space-md);
                padding: var(--space-md);
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
            }
            .item-preview {
                flex: 0 0 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .item-emoji {
                font-size: 2.5rem;
            }
            .item-image {
                max-width: 60px;
                max-height: 60px;
                border-radius: var(--radius-sm);
            }
            .item-details {
                flex: 1;
            }
            .sentence-preview {
                font-size: var(--font-size-sm);
                color: var(--color-text-muted);
            }
            .item-delete-btn {
                padding: var(--space-sm);
                background: none;
                border: none;
                font-size: var(--font-size-lg);
                cursor: pointer;
                opacity: 0.5;
            }
            .item-delete-btn:hover {
                opacity: 1;
            }
            .bulk-actions {
                background: var(--color-surface);
                border-radius: var(--radius-lg);
                padding: var(--space-lg);
                margin-top: var(--space-xl);
                border: 1px solid var(--color-border);
            }
            .bulk-actions h3 {
                margin-bottom: var(--space-md);
            }
            .action-buttons {
                display: flex;
                gap: var(--space-md);
                flex-wrap: wrap;
            }
            .action-buttons .btn {
                flex: 1;
                min-width: 150px;
            }
            .file-label {
                cursor: pointer;
                text-align: center;
            }
            .back-btn {
                margin-top: var(--space-xl);
            }
        `;
        document.head.appendChild(style);
    }
}

export default CustomizePage;
// js/importExportPage.js - Replace entire file
const ImportExportPage = {
    pendingImport: null,
    
    render() {
        const container = document.getElementById('view-import-export');
        const exerciseLists = this.getExerciseLists();
        
        container.innerHTML = `
            <div class="import-export-container">
                <button class="back-btn" onclick="app.goBack()">← Back</button>
                <h2>Import & Export</h2>
                
                <!-- Upload Section - PRIMARY -->
                <div class="ie-section highlight">
                    <h3>📤 Add or Update Exercises</h3>
                    <p class="section-description">Upload a CSV file to add new exercises or update existing ones.</p>
                    
                    <div class="upload-area">
                        <label class="upload-btn">
                            <span class="upload-icon">📁</span>
                            <span class="upload-text">Choose CSV File</span>
                            <input type="file" accept=".csv" onchange="ImportExportPage.handleUpload(event)" hidden>
                        </label>
                    </div>
                    
                    <details class="help-accordion">
                        <summary>📖 How to create exercises</summary>
                        <div class="help-content">
                            <ol>
                                <li><strong>Download the template</strong> (button below)</li>
                                <li><strong>Open in Excel or Google Sheets</strong></li>
                                <li><strong>Add your exercises</strong> following the examples</li>
                                <li><strong>Save as CSV</strong> (File → Download → CSV)</li>
                                <li><strong>Upload here</strong></li>
                            </ol>
                            
                            <h4>Column Guide:</h4>
                            <table class="column-guide">
                                <tr><td><strong>Type</strong></td><td>naming, sentences, categories, or speak</td></tr>
                                <tr><td><strong>Answer</strong></td><td>The correct word</td></tr>
                                <tr><td><strong>Prompt_or_Emoji</strong></td><td>
                                    For naming/speak: emoji (🏠) or image URL<br>
                                    For sentences: The sentence with ______ for blank<br>
                                    For categories: The question
                                </td></tr>
                                <tr><td><strong>Option1-4</strong></td><td>Answer choices (Option1 = correct answer)</td></tr>
                                <tr><td><strong>Hint1-3</strong></td><td>Only for 'speak' exercises - helpful clues</td></tr>
                            </table>
                        </div>
                    </details>
                    
                    <button class="btn-secondary" onclick="ImportExportPage.downloadTemplate()">
                        📥 Download Template with Examples
                    </button>
                </div>
                
                <!-- Current Lists -->
                <div class="ie-section">
                    <h3>📚 Your Exercise Lists</h3>
                    <div class="exercise-lists">
                        <div class="list-item default">
                            <span class="list-icon">📖</span>
                            <span class="list-name">Built-in Exercises</span>
                            <span class="list-count">${exerciseLists.default} exercises</span>
                        </div>
                        ${exerciseLists.customCount > 0 ? `
                            <div class="list-item custom">
                                <span class="list-icon">✏️</span>
                                <span class="list-name">My Custom Exercises</span>
                                <span class="list-count">${exerciseLists.customCount} exercises</span>
                            </div>
                        ` : ''}
                        ${exerciseLists.lists.map(list => `
                            <div class="list-item imported">
                                <span class="list-icon">📁</span>
                                <span class="list-name">${list.name}</span>
                                <span class="list-count">${list.count} exercises</span>
                                <button class="list-action" onclick="ImportExportPage.deleteList('${list.id}')" title="Delete">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Download All -->
                <div class="ie-section">
                    <h3>📊 Download All Exercises</h3>
                    <p class="section-description">Get all exercises as a spreadsheet. Useful for translation or backup.</p>
                    <button class="btn-secondary" onclick="ImportExportPage.exportAllCSV()">
                        📊 Download All as CSV
                    </button>
                </div>
                
                <!-- Full Backup -->
                <div class="ie-section">
                    <h3>💾 Full Backup</h3>
                    <p class="section-description">Save everything including progress, settings, and uploaded photos.</p>
                    <div class="button-group">
                        <button class="btn-secondary" onclick="ImportExportPage.createBackup()">
                            📦 Create Backup
                        </button>
                        <label class="btn-secondary file-label">
                            📂 Restore Backup
                            <input type="file" accept=".json" onchange="ImportExportPage.restoreBackup(event)" hidden>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Upload Modal -->
            <div id="upload-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Import Exercises</h3>
                        <button class="close-modal" onclick="ImportExportPage.closeModal()">×</button>
                    </div>
                    <div id="upload-modal-content"></div>
                </div>
            </div>
        `;
    },
    
    getExerciseLists() {
        const customLists = Storage.get('exerciseLists', []);
        const custom = Storage.get('customExercises', { naming: [], sentences: [], categories: [], speak: [] });
        
        let defaultCount = 0;
        ['naming', 'sentences', 'categories', 'speak'].forEach(type => {
            if (typeof ExerciseData !== 'undefined' && ExerciseData[type]) {
                defaultCount += ExerciseData[type].filter(e => !e.isCustom).length;
            }
        });
        
        const customCount = Object.values(custom).flat().length;
        
        const lists = customLists.map(list => ({
            id: list.id,
            name: list.name,
            count: list.exercises ? Object.values(list.exercises).flat().length : 0
        }));
        
        return {
            default: defaultCount,
            customCount: customCount,
            lists: lists
        };
    },
        
    downloadTemplate() {
        const template = `Type,Answer,Prompt_or_Emoji,Option1,Option2,Option3,Option4,Option5,Option6,Hint1,Hint2,Hint3
    # ============ WORDBRIDGE EXERCISE TEMPLATE ============
    # Delete all lines starting with # before importing
    #
    # CORE EXERCISES:
    # naming: See picture, pick word (can have 4-8 options)
    # sentences: Fill in the blank
    # categories: Which word fits?
    # speak: See picture, say the word
    #
    # LANGUAGE EXERCISES:
    # rhyming: Format - word, rhymingWord, wrong1, wrong2, wrong3
    # association: Format - word, relatedWord, unrelated1, unrelated2, unrelated3
    # synonym: Format - word, synonymOrAntonym, wrong1, wrong2, wrong3
    # definition: Format - word, "definition in quotes", wrong1, wrong2, wrong3
    # scramble: Format - id, word1, word2, word3, word4 (correct order)
    #
    # MORE OPTIONS: You can add more than 4 options by adding more columns!
    #
    # EXAMPLES:
    naming,dog,🐕,dog,cat,bird,fish,horse,cow,,,
    naming,house,🏠,house,car,tree,store,building,tent,,,
    sentences,water,I drink ______ when I am thirsty,water,chair,happy,blue,table,,,,
    categories,apple,Which one is a fruit?,apple,bread,cheese,chicken,milk,,,,
    speak,hello,👋,,,,,,,A greeting when you meet someone,You say this when you arrive,A friendly word
    rhyming,cat,hat,dog,cup,bed,sun,,,,,
    rhyming,day,play,night,week,time,year,,,,,
    association,bread,butter,car,phone,tree,,,,,,
    association,doctor,hospital,garden,music,sports,,,,,,
    synonym,happy,glad,angry,quiet,slow,,,,,,
    synonym,big,small,glad,quick,warm,,,,,
    definition,chair,"A piece of furniture for sitting",table,window,cup,,,,,,
    definition,apple,"A round red or green fruit",bread,water,chair,,,,,,
    scramble,sent1,The,cat,is,sleeping,,,,,,
    scramble,sent2,I,like,to,eat,apples,,,,,`;

        this.downloadFile(template, 'wordbridge-exercise-template.csv', 'text/csv');
    },
    
    exportAllCSV() {
        let csv = 'Type,Answer,Prompt_or_Emoji,Option1,Option2,Option3,Option4,Hint1,Hint2,Hint3,ID\n';
        
        const types = ['naming', 'sentences', 'categories', 'speak'];
        const custom = Storage.get('customExercises', { naming: [], sentences: [], categories: [], speak: [] });
        const hidden = Storage.get('hiddenExercises', []);
        const edits = Storage.get('exerciseEdits', {});
        
        types.forEach(type => {
            if (typeof ExerciseData !== 'undefined' && ExerciseData[type]) {
                ExerciseData[type].forEach((ex, idx) => {
                    if (ex.isCustom) return;
                    const id = `builtin_${type}_${idx}`;
                    if (hidden.includes(id)) return;
                    
                    const edited = edits[id] ? { ...ex, ...edits[id] } : ex;
                    csv += this.exerciseToCSVRow(type, edited, id) + '\n';
                });
            }
            
            if (custom[type]) {
                custom[type].forEach(ex => {
                    csv += this.exerciseToCSVRow(type, ex, ex.id) + '\n';
                });
            }
        });
        
        this.downloadFile(csv, 'wordbridge-all-exercises.csv', 'text/csv');
    },
    
    exerciseToCSVRow(type, ex, id) {
        const escape = (str) => {
            if (str === null || str === undefined) return '""';
            return `"${String(str).replace(/"/g, '""')}"`;
        };
        
        return [
            escape(type),
            escape(ex.answer),
            escape(ex.prompt || ex.emoji || ex.imageUrl || ''),
            escape(ex.options ? ex.options[0] : ex.answer),
            escape(ex.options ? ex.options[1] : ''),
            escape(ex.options ? ex.options[2] : ''),
            escape(ex.options ? ex.options[3] : ''),
            escape(ex.phrases ? ex.phrases[0] : ''),
            escape(ex.phrases ? ex.phrases[1] : ''),
            escape(ex.phrases ? ex.phrases[2] : ''),
            escape(id)
        ].join(',');
    },
    
    async handleUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Reset the input so the same file can be selected again
        event.target.value = '';
        
        const text = await file.text();
        const result = this.parseCSV(text);
        
        if (result.errors.length > 0) {
            this.showUploadErrors(result.errors, result.warnings);
            return;
        }
        
        this.showImportOptions(result.exercises, result.warnings);
    },
    
    parseCSV(text) {
        const lines = text.split('\n');
        const exercises = { 
            naming: [], sentences: [], categories: [], speak: [],
            rhyming: [], association: [], synonym: [], definition: [], scramble: []
        };
        const errors = [];
        const warnings = [];
        
        let lineNum = 0;
        for (const line of lines) {
            lineNum++;
            const trimmed = line.trim();
            
            if (!trimmed || trimmed.startsWith('#')) continue;
            if (trimmed.toLowerCase().startsWith('type,')) continue;
            
            const fields = this.parseCSVLine(trimmed);
            
            // Support variable number of options
            const [type, answer, promptOrEmoji, ...rest] = fields;
            
            const validTypes = ['naming', 'sentences', 'categories', 'speak', 
                            'rhyming', 'association', 'synonym', 'definition', 'scramble'];
            
            if (!validTypes.includes(type?.toLowerCase())) {
                if (type) {
                    errors.push(`Line ${lineNum}: Unknown type "${type}"`);
                }
                continue;
            }
            
            const exerciseType = type.toLowerCase();
            
            if (!answer || answer.trim() === '') {
                errors.push(`Line ${lineNum}: Missing answer word`);
                continue;
            }
            
            const exercise = {
                answer: answer.trim().toLowerCase(),
                isCustom: true,
                id: 'import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
            };
            
            // Parse based on type
            if (exerciseType === 'naming' || exerciseType === 'speak') {
                if (!promptOrEmoji) {
                    errors.push(`Line ${lineNum}: Missing emoji or image URL`);
                    continue;
                }
                if (promptOrEmoji.startsWith('http')) {
                    exercise.imageUrl = promptOrEmoji;
                } else {
                    exercise.emoji = promptOrEmoji;
                }
                
                // For naming, collect all options (can be more than 4)
                if (exerciseType === 'naming') {
                    const options = rest.filter(o => o && o.trim() && !o.startsWith('Hint'));
                    if (options.length < 3) {
                        errors.push(`Line ${lineNum}: Need at least 4 options total`);
                        continue;
                    }
                    exercise.options = [exercise.answer, ...options.slice(0, options.length)].map(o => o.trim().toLowerCase());
                }
                
                // For speak, get hints
                if (exerciseType === 'speak') {
                    const hints = rest.filter(h => h && h.trim());
                    if (hints.length < 2) {
                        errors.push(`Line ${lineNum}: Need at least 2 hints for speak`);
                        continue;
                    }
                    exercise.phrases = hints;
                }
                
            } else if (exerciseType === 'sentences' || exerciseType === 'categories') {
                if (!promptOrEmoji) {
                    errors.push(`Line ${lineNum}: Missing prompt`);
                    continue;
                }
                exercise.prompt = promptOrEmoji;
                
                // Collect all options
                const options = rest.filter(o => o && o.trim());
                if (options.length < 3) {
                    errors.push(`Line ${lineNum}: Need at least 4 options total`);
                    continue;
                }
                exercise.options = [exercise.answer, ...options].map(o => o.trim().toLowerCase());
                
            } else if (exerciseType === 'rhyming') {
                // Format: type, word, rhyme1, rhyme2, ..., |, nonrhyme1, nonrhyme2, ...
                // Or simpler: type, word, correctRhyme, wrong1, wrong2, wrong3
                const rhymes = [];
                const nonRhymes = [];
                let inNonRhymes = false;
                
                [promptOrEmoji, ...rest].forEach(item => {
                    if (!item) return;
                    if (item.trim() === '|') {
                        inNonRhymes = true;
                        return;
                    }
                    if (inNonRhymes) {
                        nonRhymes.push(item.trim().toLowerCase());
                    } else {
                        rhymes.push(item.trim().toLowerCase());
                    }
                });
                
                // If no separator, assume first is rhyme, rest are non-rhymes
                if (nonRhymes.length === 0 && rhymes.length > 1) {
                    const [first, ...rest] = rhymes;
                    exercise.rhymes = [first];
                    exercise.nonRhymes = rest;
                } else {
                    exercise.rhymes = rhymes;
                    exercise.nonRhymes = nonRhymes;
                }
                
                exercise.word = answer.trim().toLowerCase();
                delete exercise.answer;
                
            } else if (exerciseType === 'scramble') {
                // Format: type, id, word1, word2, word3, ...
                const words = [promptOrEmoji, ...rest].filter(w => w && w.trim());
                if (words.length < 3) {
                    errors.push(`Line ${lineNum}: Need at least 3 words for scramble`);
                    continue;
                }
                exercise.words = words.map(w => w.trim());
                exercise.id = answer; // Use answer field as ID
                delete exercise.answer;
            }
            
            if (!exercises[exerciseType]) {
                exercises[exerciseType] = [];
            }
            exercises[exerciseType].push(exercise);
        }
        
        const totalCount = Object.values(exercises).flat().length;
        if (totalCount === 0 && errors.length === 0) {
            errors.push('No exercises found.');
        }
        
        return { exercises, errors, warnings };
    },
        
    parseCSVLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim());
        
        return fields;
    },
    
    showUploadErrors(errors, warnings) {
        const modal = document.getElementById('upload-modal');
        const content = document.getElementById('upload-modal-content');
        
        content.innerHTML = `
            <div class="upload-result error">
                <div class="result-icon">⚠️</div>
                <h4>Problems Found</h4>
                <p>Please fix these issues:</p>
                <ul class="error-list">
                    ${errors.slice(0, 10).map(e => `<li>${e}</li>`).join('')}
                    ${errors.length > 10 ? `<li>...and ${errors.length - 10} more errors</li>` : ''}
                </ul>
                ${warnings.length > 0 ? `
                    <p class="warnings-note">Also ${warnings.length} warning(s)</p>
                ` : ''}
                <button class="btn-primary" onclick="ImportExportPage.closeModal()">OK</button>
            </div>
        `;
        
        modal.style.display = 'flex';
    },
    
    showImportOptions(exercises, warnings) {
        const modal = document.getElementById('upload-modal');
        const content = document.getElementById('upload-modal-content');
        const totalCount = Object.values(exercises).flat().length;
        
        this.pendingImport = exercises;
        
        const typeCounts = Object.entries(exercises)
            .filter(([_, arr]) => arr.length > 0)
            .map(([type, arr]) => `${type}: ${arr.length}`)
            .join(', ');
        
        content.innerHTML = `
            <div class="upload-result success">
                <div class="result-icon">✓</div>
                <h4>Found ${totalCount} Exercises</h4>
                <p class="type-breakdown">${typeCounts}</p>
                ${warnings.length > 0 ? `
                    <p class="warnings-note">${warnings.length} item(s) auto-corrected</p>
                ` : ''}
                
                <div class="import-choice">
                    <label class="import-option">
                        <input type="radio" name="import-type" value="add" checked>
                        <div class="option-content">
                            <strong>Add to My Exercises</strong>
                            <span>Mix with your existing custom exercises</span>
                        </div>
                    </label>
                    
                    <label class="import-option">
                        <input type="radio" name="import-type" value="new-list">
                        <div class="option-content">
                            <strong>Create Separate List</strong>
                            <span>Keep these exercises grouped (e.g., for another language)</span>
                        </div>
                    </label>
                    
                    <div id="new-list-name" class="new-list-input" style="display: none;">
                        <label>List Name:</label>
                        <input type="text" id="list-name-input" placeholder="e.g., Spanish, Therapy Week 3">
                    </div>
                </div>
                
                <div class="button-group">
                    <button class="btn-secondary" onclick="ImportExportPage.closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="ImportExportPage.confirmImport()">Import ${totalCount} Exercises</button>
                </div>
            </div>
        `;
        
        // Toggle list name visibility
        content.querySelectorAll('input[name="import-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.getElementById('new-list-name').style.display = 
                    e.target.value === 'new-list' ? 'block' : 'none';
            });
        });
        
        modal.style.display = 'flex';
    },
    
    confirmImport() {
        const importType = document.querySelector('input[name="import-type"]:checked').value;
        
        if (importType === 'add') {
            const custom = Storage.get('customExercises', { naming: [], sentences: [], categories: [], speak: [] });
            
            Object.keys(this.pendingImport).forEach(type => {
                if (!custom[type]) custom[type] = [];
                custom[type] = [...custom[type], ...this.pendingImport[type]];
            });
            
            Storage.set('customExercises', custom);
            
        } else {
            const listName = document.getElementById('list-name-input').value.trim() || 'Imported Exercises';
            const lists = Storage.get('exerciseLists', []);
            
            lists.push({
                id: 'list_' + Date.now(),
                name: listName,
                createdAt: Date.now(),
                exercises: this.pendingImport
            });
            
            Storage.set('exerciseLists', lists);
        }
        
        this.closeModal();
        this.showToast('Exercises imported successfully!');
        
        setTimeout(() => location.reload(), 1000);
    },
    
    async createBackup() {
        const backup = {
            version: 1,
            createdAt: new Date().toISOString(),
            customExercises: Storage.get('customExercises', {}),
            exerciseLists: Storage.get('exerciseLists', []),
            hiddenExercises: Storage.get('hiddenExercises', []),
            exerciseEdits: Storage.get('exerciseEdits', {}),
            wordStats: Storage.get('wordStats', {}),
            problemWords: Storage.get('problemWords', {}),
            masteredWords: Storage.get('masteredWords', {}),
            progress: Storage.get('progress', {}),
            sessions: Storage.get('sessions', []),
            settings: Storage.get('settings', {})
        };
        
        try {
            const images = await ImageStorage.getAllImages();
            backup.images = {};
            for (const img of images) {
                backup.images[img.id] = img.data;
            }
        } catch (e) {
            console.warn('Could not backup images:', e);
        }
        
        const data = JSON.stringify(backup);
        this.downloadFile(data, `wordbridge-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    },
    
    async restoreBackup(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!confirm('This will replace all your current data. Continue?')) {
            event.target.value = '';
            return;
        }
        
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            
            if (backup.customExercises) Storage.set('customExercises', backup.customExercises);
            if (backup.exerciseLists) Storage.set('exerciseLists', backup.exerciseLists);
            if (backup.hiddenExercises) Storage.set('hiddenExercises', backup.hiddenExercises);
            if (backup.exerciseEdits) Storage.set('exerciseEdits', backup.exerciseEdits);
            if (backup.wordStats) Storage.set('wordStats', backup.wordStats);
            if (backup.problemWords) Storage.set('problemWords', backup.problemWords);
            if (backup.masteredWords) Storage.set('masteredWords', backup.masteredWords);
            if (backup.progress) Storage.set('progress', backup.progress);
            if (backup.sessions) Storage.set('sessions', backup.sessions);
            if (backup.settings) Storage.set('settings', backup.settings);
            
            if (backup.images && ImageStorage.db) {
                for (const [id, data] of Object.entries(backup.images)) {
                    const transaction = ImageStorage.db.transaction(['images'], 'readwrite');
                    const store = transaction.objectStore('images');
                    store.put({
                        id: id,
                        data: data,
                        name: 'restored.jpg',
                        type: 'image/jpeg',
                        size: data.length,
                        created: Date.now()
                    });
                }
            }
            
            this.showToast('Backup restored!');
            setTimeout(() => location.reload(), 1000);
            
        } catch (e) {
            alert('Failed to restore: ' + e.message);
        }
        
        event.target.value = '';
    },
    
    deleteList(listId) {
        if (!confirm('Delete this exercise list?')) return;
        
        const lists = Storage.get('exerciseLists', []);
        Storage.set('exerciseLists', lists.filter(l => l.id !== listId));
        this.render();
    },
    
    closeModal() {
        document.getElementById('upload-modal').style.display = 'none';
        this.pendingImport = null;
    },
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },
    
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
};
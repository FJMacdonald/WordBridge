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
        // Single template with clear examples and instructions
        const template = `Type,Answer,Prompt_or_Emoji,Option1,Option2,Option3,Option4,Hint1,Hint2,Hint3
# ============ INSTRUCTIONS ============
# 1. Delete all lines starting with # (including this one)
# 2. Keep the first line (headers) - do not modify it
# 3. Add your exercises below the headers
# 4. Save as CSV when done
#
# EXERCISE TYPES:
# - naming: See a picture, pick the word (uses emoji or image URL)
# - sentences: Fill in the blank in a sentence
# - categories: Which word fits? (e.g., "Which is a fruit?")
# - speak: See picture, practice saying the word (needs hints)
#
# EXAMPLES (delete these and add your own):
naming,dog,🐕,dog,cat,bird,fish,,,
naming,house,🏠,house,car,tree,store,,,
naming,apple,🍎,apple,banana,orange,grape,,,
sentences,water,I drink ______ when I am thirsty,water,chair,happy,blue,,,
sentences,bed,I sleep in my ______ at night,bed,car,book,cup,,,
categories,apple,Which one is a fruit?,apple,bread,cheese,chicken,,,
categories,chair,Which one is furniture?,chair,apple,dog,rain,,,
speak,hello,👋,,,,,A greeting when you meet someone,You say this when you arrive,
speak,thank you,🙏,,,,,You say this to show gratitude,A polite response when someone helps,`;

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
        const exercises = { naming: [], sentences: [], categories: [], speak: [] };
        const errors = [];
        const warnings = [];
        
        let lineNum = 0;
        for (const line of lines) {
            lineNum++;
            const trimmed = line.trim();
            
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Skip header line
            if (trimmed.toLowerCase().startsWith('type,')) continue;
            
            const fields = this.parseCSVLine(trimmed);
            const [type, answer, promptOrEmoji, opt1, opt2, opt3, opt4, hint1, hint2, hint3, id] = fields;
            
            // Validate type
            const validTypes = ['naming', 'sentences', 'categories', 'speak'];
            if (!validTypes.includes(type?.toLowerCase())) {
                if (type) {
                    errors.push(`Line ${lineNum}: Unknown type "${type}". Use: naming, sentences, categories, or speak`);
                }
                continue;
            }
            
            const exerciseType = type.toLowerCase();
            
            // Validate answer
            if (!answer || answer.trim() === '') {
                errors.push(`Line ${lineNum}: Missing answer word`);
                continue;
            }
            
            const exercise = {
                answer: answer.trim().toLowerCase(),
                isCustom: true,
                id: id || ('import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6))
            };
            
            // Type-specific parsing
            if (exerciseType === 'naming' || exerciseType === 'speak') {
                if (!promptOrEmoji) {
                    errors.push(`Line ${lineNum}: Missing emoji or image URL for "${answer}"`);
                    continue;
                }
                
                if (promptOrEmoji.startsWith('http')) {
                    exercise.imageUrl = promptOrEmoji;
                } else {
                    exercise.emoji = promptOrEmoji;
                }
            } else {
                if (!promptOrEmoji) {
                    errors.push(`Line ${lineNum}: Missing sentence/question for "${answer}"`);
                    continue;
                }
                exercise.prompt = promptOrEmoji;
            }
            
            // Options (not needed for speak)
            if (exerciseType !== 'speak') {
                const options = [opt1, opt2, opt3, opt4].map(o => o?.trim().toLowerCase()).filter(o => o);
                
                if (options.length < 4) {
                    errors.push(`Line ${lineNum}: Need 4 options for "${answer}", only found ${options.length}`);
                    continue;
                }
                
                exercise.options = options;
                
                // Ensure answer is in options
                if (!exercise.options.includes(exercise.answer)) {
                    warnings.push(`Line ${lineNum}: Added "${answer}" to options`);
                    exercise.options[0] = exercise.answer;
                }
            }
            
            // Hints for speak
            if (exerciseType === 'speak') {
                const hints = [hint1, hint2, hint3].filter(h => h && h.trim());
                if (hints.length < 2) {
                    errors.push(`Line ${lineNum}: Need at least 2 hints for speak exercise "${answer}"`);
                    continue;
                }
                exercise.phrases = hints;
            }
            
            exercises[exerciseType].push(exercise);
        }
        
        const totalCount = Object.values(exercises).flat().length;
        if (totalCount === 0 && errors.length === 0) {
            errors.push('No exercises found. Make sure your file matches the template format.');
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
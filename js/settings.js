const Settings = {
    defaults: {
        problemWordFrequency: 3,
        masteryThreshold: 5,
        soundEffects: true
    },
    
    init() {
        const current = Storage.get('settings', {});
        const merged = { ...this.defaults, ...current };
        Storage.set('settings', merged);
        WordTracking.init();
        CustomExercises.init();
    },
    
    get(key) {
        const settings = Storage.get('settings', this.defaults);
        return settings[key];
    },
    
    set(key, value) {
        const settings = Storage.get('settings', this.defaults);
        settings[key] = value;
        Storage.set('settings', settings);
    },
    
    clearData() {
        if (confirm('This will delete all your progress. Are you sure?')) {
            Storage.clear();
            location.reload();
        }
    },
    
    resetProblemWord(word) {
        WordTracking.resetProblemWord(word);
        this.render();
        document.getElementById('view-settings').innerHTML = this.render();
    },
    
    unmasterWord(word) {
        WordTracking.unmasterWord(word);
        this.render();
        document.getElementById('view-settings').innerHTML = this.render();
    },
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = CustomExercises.importFromJSON(e.target.result);
            
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 1000;
            `;
            
            if (result.success) {
                messageDiv.innerHTML = `
                    <h3 style="color: var(--success); margin-bottom: 1rem;">✓ Success!</h3>
                    <p style="white-space: pre-wrap;">${result.message}</p>
                    <button onclick="location.reload()" 
                            style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; 
                                background: var(--primary); color: white; 
                                border: none; border-radius: 8px; cursor: pointer;">
                        Continue
                    </button>
                `;
            } else {
                let errorHTML = `
                    <h3 style="color: var(--danger); margin-bottom: 1rem;">⚠ Issues Found</h3>
                    <p><strong>${result.message}</strong></p>
                `;
                
                if (result.errors && result.errors.length > 0) {
                    errorHTML += `
                        <div style="margin-top: 1rem; padding: 1rem; background: #fff5f5; border-radius: 8px;">
                            <strong>Errors to fix:</strong>
                            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                                ${result.errors.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }
                
                if (result.hint) {
                    errorHTML += `
                        <p style="margin-top: 1rem; padding: 1rem; background: #fffbeb; border-radius: 8px;">
                            <strong>💡 Tip:</strong> ${result.hint}
                        </p>
                    `;
                }
                
                if (result.example) {
                    errorHTML += `
                        <p style="margin-top: 1rem; font-family: monospace; background: #f5f5f5; padding: 0.5rem; border-radius: 4px;">
                            ${result.example}
                        </p>
                    `;
                }
                
                errorHTML += `
                    <button onclick="this.parentElement.remove()" 
                            style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; 
                                background: var(--primary); color: white; 
                                border: none; border-radius: 8px; cursor: pointer;">
                        OK
                    </button>
                `;
                
                messageDiv.innerHTML = errorHTML;
            }
            
            document.body.appendChild(messageDiv);
        };
        reader.readAsText(file);
    },    
    downloadTemplate() {
        const template = CustomExercises.generateTemplate();
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wordbridge-template.json';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    exportCustomExercises() {
        const data = CustomExercises.exportCustomExercises();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wordbridge-custom-exercises.json';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    render() {
        const settings = Storage.get('settings', this.defaults);
        const summary = WordTracking.getStatsSummary();
        const customCount = CustomExercises.getCustomCount();
        
        return `
            <div class="settings-container">
                <button class="back-btn" onclick="app.showView('dashboard')">← Back</button>
                <h2>Settings</h2>
                
                <div class="settings-group">
                    <h3>Custom Exercises</h3>
                    <p class="setting-description">Add your own personalized exercises with words, pictures, and sentences that matter to you.</p>
                    
                    <div class="custom-stats">
                        <p>Custom exercises loaded: <strong>${customCount.total}</strong></p>
                        <div class="custom-breakdown">
                            <span>Picture Naming: ${customCount.naming}</span>
                            <span>Sentences: ${customCount.sentences}</span>
                            <span>Categories: ${customCount.categories}</span>
                            <span>Speaking: ${customCount.speak}</span>
                        </div>
                    </div>
                    
                    <div class="button-group">
                        <button class="btn-primary" onclick="Settings.downloadTemplate()">
                            📥 Download Template
                        </button>
                        <label class="btn-secondary" style="cursor: pointer;">
                            📤 Upload Exercises
                            <input type="file" accept=".json" style="display: none;" 
                                   onchange="Settings.handleFileUpload(event)">
                        </label>
                        ${customCount.total > 0 ? `
                            <button class="btn-secondary" onclick="Settings.exportCustomExercises()">
                                💾 Export Custom
                            </button>
                            <button class="btn-danger-outline" onclick="if(confirm('Clear all custom exercises?')) CustomExercises.clearCustomExercises()">
                                🗑️ Clear Custom
                            </button>
                        ` : ''}
                    </div>
                    
                    <details class="help-section">
                    <summary>📖 Simple Instructions</summary>
                        <div class="help-content">
                            <h4>Getting Started:</h4>
                            <ol>
                                <li>Click <strong>"Download Example File"</strong> above</li>
                                <li>Open the file in Notepad (Windows) or TextEdit (Mac)</li>
                                <li>You'll see examples - copy and modify them</li>
                                <li>Save the file when done</li>
                                <li>Click <strong>"Upload Your Exercises"</strong> to add them</li>
                            </ol>
                            
                            <h4>Important Rules:</h4>
                            <ul>
                                <li>Each exercise needs an <strong>answer</strong> (the correct word)</li>
                                <li>Each exercise needs 4 <strong>options</strong> (word choices)</li>
                                <li>Use either <strong>emoji</strong> (like 🏠) OR <strong>image</strong> (web link), not both</li>
                                <li>Keep the exact format - quotes, commas, and brackets matter!</li>
                            </ul>
                            
                            <h4>Tips:</h4>
                            <ul>
                                <li>Start with just 1 or 2 exercises to test</li>
                                <li>Copy an example and change the words</li>
                                <li>Add 2-3 helpful phrases for speaking exercises</li>
                                <li>Find emojis at emojipedia.org</li>
                                <li>For images, use links that end in .jpg or .png</li>
                                <li>Don't worry about errors - the app will help fix them!</li>
                            </ul>
                            
                            <h4>Example to Copy:</h4>
                            <pre class="code-example">
    {
    "naming": [
        {
        "answer": "cat",
        "emoji": "🐱",
        "options": ["cat", "dog", "bird", "fish"]
        }
    ]
    }</pre>
                        </div>
                    </details>
                    </div>
                </div>
                    </details>



                </div>
                
                <div class="settings-group">
                    <h3>Learning Preferences</h3>
                    
                <div class="setting-item">
                    <label for="custom-frequency">Custom exercise frequency</label>
                    <p class="setting-description">How often to show your custom exercises</p>
                    <select id="custom-frequency" onchange="Settings.set('customFrequency', parseFloat(this.value))">
                        <option value="0.2" ${settings.customFrequency === 0.2 ? 'selected' : ''}>Sometimes (20%)</option>
                        <option value="0.4" ${(settings.customFrequency === 0.4 || !settings.customFrequency) ? 'selected' : ''}>Often (40%)</option>
                        <option value="0.6" ${settings.customFrequency === 0.6 ? 'selected' : ''}>Very Often (60%)</option>
                        <option value="0.8" ${settings.customFrequency === 0.8 ? 'selected' : ''}>Almost Always (80%)</option>
                    </select>
                </div>
                </div>
                
                <div class="settings-group">
                    <h3>Problem Words (${summary.problemWordCount})</h3>
                    <p class="setting-description">Words you're having trouble with. Get 3 correct in a row to remove.</p>
                    <div class="word-list">
                        ${summary.problemWords.length === 0 ? 
                            '<p class="empty-message">No problem words yet!</p>' :
                            summary.problemWords.map(item => `
                                <div class="word-item problem-word">
                                    <div class="word-info">
                                        <span class="word-text">${item.word}</span>
                                        <span class="word-stat">${item.ratio} wrong</span>
                                        <span class="word-accuracy">${item.accuracy}% correct</span>
                                    </div>
                                    <button class="reset-btn" onclick="Settings.resetProblemWord('${item.word}')">
                                        Reset
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Mastered Words (${summary.masteredWordCount})</h3>
                    <p class="setting-description">Words you've mastered! These appear less frequently.</p>
                    <div class="word-list">
                        ${summary.masteredWords.length === 0 ? 
                            '<p class="empty-message">No mastered words yet. Keep practicing!</p>' :
                            summary.masteredWords.map(item => `
                                <div class="word-item mastered-word">
                                    <div class="word-info">
                                        <span class="word-text">${item.word}</span>
                                        <span class="word-date">Mastered ${item.masteredAt}</span>
                                        <span class="word-accuracy">${item.accuracy}% accuracy</span>
                                    </div>
                                    <button class="unmaster-btn" onclick="Settings.unmasterWord('${item.word}')">
                                        Practice Again
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Progress Summary</h3>
                    <div class="stats-summary">
                        <p>Total words attempted: <strong>${summary.totalWordsAttempted}</strong></p>
                        <p>Problem words: <strong>${summary.problemWordCount}</strong></p>
                        <p>Mastered words: <strong>${summary.masteredWordCount}</strong></p>
                    </div>
                </div>
                
                <div class="settings-group danger-zone">
                    <h3>Data Management</h3>
                    <button class="btn-danger-outline" onclick="Settings.clearData()">
                        Reset All Progress
                    </button>
                </div>
            </div>
        `;
    }
};
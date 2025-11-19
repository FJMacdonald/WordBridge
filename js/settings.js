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
    
    render() {
        const settings = Storage.get('settings', this.defaults);
        const summary = WordTracking.getStatsSummary();
        
        return `
            <div class="settings-container">
                <button class="back-btn" onclick="app.showView('dashboard')">← Back</button>
                <h2>Settings</h2>
                
                <div class="settings-group">
                    <h3>Learning Preferences</h3>
                    
                    <div class="setting-item">
                        <label for="mastery-threshold">Words to master</label>
                        <p class="setting-description">Consecutive correct answers needed to master a word</p>
                        <select id="mastery-threshold" onchange="Settings.set('masteryThreshold', parseInt(this.value))">
                            <option value="3" ${settings.masteryThreshold === 3 ? 'selected' : ''}>3 correct</option>
                            <option value="5" ${settings.masteryThreshold === 5 ? 'selected' : ''}>5 correct</option>
                            <option value="7" ${settings.masteryThreshold === 7 ? 'selected' : ''}>7 correct</option>
                            <option value="10" ${settings.masteryThreshold === 10 ? 'selected' : ''}>10 correct</option>
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
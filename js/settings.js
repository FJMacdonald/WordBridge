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
    
    render() {
        const settings = Storage.get('settings', this.defaults);
        const masteredCount = Storage.get('masteredWords', []).length;
        const difficultCount = Object.keys(Storage.get('difficultWords', {})).length;
        
        return `
            <div class="settings-container">
                <button class="back-btn" onclick="app.showView('dashboard')">← Back</button>
                <h2>Settings</h2>
                
                <div class="settings-group">
                    <h3>Learning</h3>
                    
                    <div class="setting-item">
                        <label for="problem-freq">Problem word frequency</label>
                        <p class="setting-description">Show difficult words every N turns</p>
                        <select id="problem-freq" onchange="Settings.set('problemWordFrequency', parseInt(this.value))">
                            <option value="2" ${settings.problemWordFrequency === 2 ? 'selected' : ''}>Every 2 turns</option>
                            <option value="3" ${settings.problemWordFrequency === 3 ? 'selected' : ''}>Every 3 turns</option>
                            <option value="5" ${settings.problemWordFrequency === 5 ? 'selected' : ''}>Every 5 turns</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label for="mastery-threshold">Mastery threshold</label>
                        <p class="setting-description">Consecutive successes needed to master a word</p>
                        <select id="mastery-threshold" onchange="Settings.set('masteryThreshold', parseInt(this.value))">
                            <option value="3" ${settings.masteryThreshold === 3 ? 'selected' : ''}>3 times</option>
                            <option value="5" ${settings.masteryThreshold === 5 ? 'selected' : ''}>5 times</option>
                            <option value="7" ${settings.masteryThreshold === 7 ? 'selected' : ''}>7 times</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Progress</h3>
                    <div class="stats-summary">
                        <p>Words mastered: <strong>${masteredCount}</strong></p>
                        <p>Difficult words: <strong>${difficultCount}</strong></p>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Data</h3>
                    <button class="btn-danger-outline" onclick="Settings.clearData()">
                        Reset All Progress
                    </button>
                </div>
            </div>
        `;
    }
};
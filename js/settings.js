const Settings = {
    defaults: {
        problemWordFrequency: 3,
        masteryThreshold: 5,
        soundEffects: true,
        customFrequency: 0.4,
        autoPlayAudio: false,
        fontSize: 'normal',
        highContrast: false
    },
    
    init() {
        const current = Storage.get('settings', {});
        const merged = { ...this.defaults, ...current };
        Storage.set('settings', merged);
        
        // Apply settings on load
        this.applyFontSize(merged.fontSize);
        this.applyHighContrast(merged.highContrast);
        
        WordTracking.init();
        CustomExercises.init();
    },
    
    get(key) {
        const settings = Storage.get('settings', this.defaults);
        return settings[key] !== undefined ? settings[key] : this.defaults[key];
    },
    
    set(key, value) {
        const settings = Storage.get('settings', this.defaults);
        settings[key] = value;
        Storage.set('settings', settings);
        
        // Apply immediately if it's a display setting
        if (key === 'fontSize') this.applyFontSize(value);
        if (key === 'highContrast') this.applyHighContrast(value);
    },
    
    applyFontSize(size) {
        const html = document.documentElement;
        html.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge');
        html.classList.add(`font-${size}`);
    },
    
    applyHighContrast(enabled) {
        const html = document.documentElement;
        if (enabled) {
            html.classList.add('high-contrast');
        } else {
            html.classList.remove('high-contrast');
        }
    },
    
    clearData() {
        if (confirm('This will delete ALL your progress, custom exercises, and settings. Are you sure?')) {
            if (confirm('This cannot be undone. Really delete everything?')) {
                Storage.clear();
                location.reload();
            }
        }
    },
    
    render() {
        const settings = Storage.get('settings', this.defaults);
        const customCount = CustomExercises.getCustomCount();
        
        return `
            <div class="settings-container">
                <button class="back-btn" onclick="app.goBack()">← Back</button>
                <h2>Settings</h2>
                
                <div class="settings-group">
                    <h3>👁️ Display</h3>
                    
                    <div class="setting-item">
                        <label>Text Size</label>
                        <div class="font-size-slider">
                            <span class="size-label small">A</span>
                            <input type="range" min="0" max="3" 
                                   value="${['small', 'normal', 'large', 'xlarge'].indexOf(settings.fontSize)}"
                                   oninput="Settings.set('fontSize', ['small', 'normal', 'large', 'xlarge'][this.value])"
                                   class="slider">
                            <span class="size-label large">A</span>
                        </div>
                        <div class="font-preview">
                            Preview: The quick brown fox
                        </div>
                    </div>
                    
                    <div class="setting-item toggle-item">
                        <div>
                            <label>High Contrast Mode</label>
                            <p class="setting-description">Stronger colors and borders for easier reading</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.highContrast ? 'checked' : ''} 
                                   onchange="Settings.set('highContrast', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>🔊 Audio</h3>
                    
                    <div class="setting-item toggle-item">
                        <div>
                            <label>Auto-play Audio</label>
                            <p class="setting-description">Automatically read questions aloud</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.autoPlayAudio ? 'checked' : ''} 
                                   onchange="Settings.set('autoPlayAudio', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>🎯 Practice</h3>
                    
                    <div class="setting-item">
                        <label>Custom Exercise Frequency</label>
                        <p class="setting-description">How often your custom words appear</p>
                        <select onchange="Settings.set('customFrequency', parseFloat(this.value))">
                            <option value="0.2" ${settings.customFrequency === 0.2 ? 'selected' : ''}>Sometimes (20%)</option>
                            <option value="0.4" ${settings.customFrequency === 0.4 ? 'selected' : ''}>Often (40%)</option>
                            <option value="0.6" ${settings.customFrequency === 0.6 ? 'selected' : ''}>Very Often (60%)</option>
                            <option value="0.8" ${settings.customFrequency === 0.8 ? 'selected' : ''}>Almost Always (80%)</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label>Mastery Requirement</label>
                        <p class="setting-description">Correct in a row to master a word</p>
                        <select onchange="Settings.set('masteryThreshold', parseInt(this.value))">
                            <option value="3" ${settings.masteryThreshold === 3 ? 'selected' : ''}>3 in a row</option>
                            <option value="5" ${settings.masteryThreshold === 5 ? 'selected' : ''}>5 in a row</option>
                            <option value="7" ${settings.masteryThreshold === 7 ? 'selected' : ''}>7 in a row</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>📊 Your Data</h3>
                    
                    <div class="data-summary">
                        <div class="data-item">
                            <span class="data-label">Custom exercises</span>
                            <span class="data-value">${customCount.total}</span>
                        </div>
                    </div>
                    
                    <button class="btn-outline" onclick="app.showView('progress')">
                        📈 View Progress
                    </button>
                    
                    <button class="btn-outline" onclick="app.showView('import-export')">
                        📁 Import / Export
                    </button>
                </div>
                
                <div class="settings-group danger-zone">
                    <h3>⚠️ Danger Zone</h3>
                    <button class="btn-danger" onclick="Settings.clearData()">
                        🗑️ Delete All Data
                    </button>
                    <p class="setting-description">Permanently delete all progress and settings.</p>
                </div>
            </div>
        `;
    }
};
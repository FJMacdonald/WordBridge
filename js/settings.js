/**
 * Settings Module
 * Handles user preferences and data management
 */
const Settings = {
    defaults: {
        shareEmail: '',
        autoShare: false,
        dailyGoal: 10,
        soundEffects: true
    },
    
    get() {
        return Storage.get('settings', this.defaults);
    },
    
    save(settings) {
        Storage.set('settings', { ...this.defaults, ...settings });
    },
    
    init() {
        const settings = this.get();
        
        // Populate form fields
        document.getElementById('share-email').value = settings.shareEmail || '';
        document.getElementById('auto-share').checked = settings.autoShare;
        document.getElementById('daily-goal').value = settings.dailyGoal;
        document.getElementById('sound-effects').checked = settings.soundEffects;
    },
    
    saveEmail() {
        const settings = this.get();
        settings.shareEmail = document.getElementById('share-email').value;
        settings.autoShare = document.getElementById('auto-share').checked;
        this.save(settings);
        
        Progress.showAchievement('Saved!', 'Email settings updated');
    },
    
    exportData() {
        const data = Storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `wordbridge-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    clearData() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            Storage.clear();
            location.reload();
        }
    }
};
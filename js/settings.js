const Settings = {
    init() {
        // Nothing to initialize for now
    },
    
    clearData() {
        if (confirm('This will delete all your progress. Are you sure?')) {
            Storage.clear();
            location.reload();
        }
    }
};
/**
 * Application configuration
 */
const Config = {
    defaults: {
        audio: {
            autoPlay: true,
            speechRate: 0.85,
            speechPitch: 1.0,
            delayBetweenOptions: 400
        },
        exercises: {
            autoAdvanceDelay: 1200,
            showFeedbackDuration: 1500
        },
        tracking: {
            masteryThreshold: 3,
            problemThreshold: 0.,
            inactivityThreshold: 60000,      // 1 minute
            sessionAutoEndThreshold: 300000, // 5 minutes
            enableDetailedTiming: true,
            enableExampleData: true   
        }
    },
    
    user: {},
    
    init() {
        const stored = localStorage.getItem('userConfig');
        if (stored) {
            try { this.user = JSON.parse(stored); } catch (e) { this.user = {}; }
        }
    },
    
    get(path) {
        const keys = path.split('.');
        let userVal = this.user;
        let defaultVal = this.defaults;
        
        for (const key of keys) {
            userVal = userVal?.[key];
            defaultVal = defaultVal?.[key];
        }
        
        return userVal !== undefined ? userVal : defaultVal;
    },
    
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.user;
        
        for (const key of keys) {
            if (!target[key]) target[key] = {};
            target = target[key];
        }
        target[lastKey] = value;
        localStorage.setItem('userConfig', JSON.stringify(this.user));
    }
};

export default Config;
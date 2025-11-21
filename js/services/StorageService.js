/**
 * Simple localStorage wrapper
 */
class StorageService {
    constructor(prefix = 'aphasia_') {
        this.prefix = prefix;
    }
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }
    
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
    
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}

export const storageService = new StorageService();
export default storageService;
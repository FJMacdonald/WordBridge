/**
 * Storage Module
 * Handles all localStorage operations with error handling
 */
const Storage = {
    prefix: 'wordbridge_',
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage get error:', e);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage set error:', e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (e) {
            console.warn('Storage remove error:', e);
        }
    },
    
    clear() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.warn('Storage clear error:', e);
        }
    },
    
    exportAll() {
        const data = {};
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => {
                data[key.replace(this.prefix, '')] = this.get(key.replace(this.prefix, ''));
            });
        return data;
    }
};
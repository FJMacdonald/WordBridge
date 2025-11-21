/**
 * Image storage using IndexedDB for uploaded photos
 * Handles storage, retrieval, and management of custom images
 */
class ImageStorageService {
    constructor() {
        this.dbName = 'AphasiaToolImages';
        this.dbVersion = 1;
        this.storeName = 'images';
        this.db = null;
    }
    
    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('dateAdded', 'dateAdded', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                }
            };
        });
    }
    
    /**
     * Generate unique ID
     */
    generateId() {
        return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Store an image
     * @param {File|Blob|string} imageData - Image file, blob, or base64 string
     * @param {object} metadata - Additional metadata
     */
    async saveImage(imageData, metadata = {}) {
        await this.ensureDb();
        
        let base64Data;
        
        if (imageData instanceof File || imageData instanceof Blob) {
            base64Data = await this.fileToBase64(imageData);
        } else if (typeof imageData === 'string') {
            base64Data = imageData;
        } else {
            throw new Error('Invalid image data type');
        }
        
        const id = metadata.id || this.generateId();
        
        const record = {
            id,
            data: base64Data,
            dateAdded: Date.now(),
            name: metadata.name || 'Unnamed',
            category: metadata.category || 'custom',
            word: metadata.word || '',
            ...metadata
        };
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(record);
            
            request.onsuccess = () => resolve(id);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get an image by ID
     */
    async getImage(id) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get image with metadata
     */
    async getImageWithMetadata(id) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get all images
     */
    async getAllImages() {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Delete an image
     */
    async deleteImage(id) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Clear all images
     */
    async clearAll() {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get storage usage estimate
     */
    async getStorageUsage() {
        const images = await this.getAllImages();
        let totalSize = 0;
        
        images.forEach(img => {
            if (img.data) {
                // Rough estimate: base64 is ~33% larger than binary
                totalSize += (img.data.length * 0.75);
            }
        });
        
        return {
            count: images.length,
            sizeBytes: totalSize,
            sizeMB: (totalSize / (1024 * 1024)).toFixed(2)
        };
    }
    
    /**
     * Convert File to base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Resize image before storage
     */
    async resizeImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Ensure database is initialized
     */
    async ensureDb() {
        if (!this.db) {
            await this.init();
        }
    }
}

export const imageStorage = new ImageStorageService();
export default imageStorage;
/**
 * Simple pub/sub event system
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) callbacks.delete(callback);
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => {
                try { cb(data); } catch (e) { console.error(e); }
            });
        }
    }
}

export const Events = {
    EXERCISE_START: 'exercise:start',
    EXERCISE_END: 'exercise:end',
    ANSWER_CORRECT: 'answer:correct',
    ANSWER_INCORRECT: 'answer:incorrect',
    HINT_USED: 'hint:used',
    SKIP: 'skip',
    PROGRESS_UPDATE: 'progress:update',
    PAGE_CHANGE: 'page:change'
};

export const eventBus = new EventBus();
export default eventBus;
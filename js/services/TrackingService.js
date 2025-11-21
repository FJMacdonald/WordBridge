import storageService from './StorageService.js';
import eventBus, { Events } from '../core/EventBus.js';

/**
 * Performance tracking service
 */
class TrackingService {
    constructor() {
        this.session = null;
    }
    
    startSession(exerciseType) {
        this.session = {
            exerciseType,
            startTime: Date.now(),
            correct: 0,
            incorrect: 0,
            hintsUsed: 0,
            skipped: 0,
            attempts: []
        };
        return this.session;
    }
    
    recordAttempt(data) {
        if (!this.session) return;
        
        const attempt = {
            word: data.word?.toLowerCase(),
            correct: data.correct,
            hintsUsed: data.hintsUsed || 0,
            time: Date.now()
        };
        
        this.session.attempts.push(attempt);
        
        if (data.correct) {
            this.session.correct++;
        } else {
            this.session.incorrect++;
        }
        
        // Update word stats
        this.updateWordStats(attempt);
        
        eventBus.emit(Events.PROGRESS_UPDATE, {
            correct: this.session.correct,
            total: this.session.attempts.length
        });
    }
    
    recordHint() {
        if (this.session) this.session.hintsUsed++;
    }
    
    recordSkip(word) {
        if (this.session) {
            this.session.skipped++;
            this.updateWordStats({ word: word?.toLowerCase(), skipped: true });
        }
    }
    
    updateWordStats(attempt) {
        const stats = storageService.get('wordStats', {});
        const word = attempt.word;
        
        if (!stats[word]) {
            stats[word] = {
                attempts: 0,
                correct: 0,
                incorrect: 0,
                hintsUsed: 0,
                skipped: 0,
                lastSeen: null,
                streak: 0
            };
        }
        
        const ws = stats[word];
        ws.lastSeen = Date.now();
        
        if (attempt.skipped) {
            ws.skipped++;
            ws.streak = 0;
        } else {
            ws.attempts++;
            if (attempt.correct) {
                ws.correct++;
                ws.streak++;
            } else {
                ws.incorrect++;
                ws.streak = 0;
            }
            ws.hintsUsed += attempt.hintsUsed || 0;
        }
        
        storageService.set('wordStats', stats);
    }
    
    endSession() {
        if (!this.session) return null;
        
        const elapsed = Date.now() - this.session.startTime;
        const total = this.session.correct + this.session.incorrect;
        
        const results = {
            exerciseType: this.session.exerciseType,
            correct: this.session.correct,
            total: total,
            hintsUsed: this.session.hintsUsed,
            skipped: this.session.skipped,
            accuracy: total > 0 ? Math.round((this.session.correct / total) * 100) : 0,
            duration: elapsed,
            time: this.formatTime(elapsed)
        };
        
        // Save to history
        this.saveToHistory(results);
        
        this.session = null;
        return results;
    }
    
    saveToHistory(results) {
        const history = storageService.get('sessionHistory', []);
        history.push({
            ...results,
            date: Date.now()
        });
        
        // Keep last 50 sessions
        if (history.length > 50) history.shift();
        
        storageService.set('sessionHistory', history);
    }
    
    formatTime(ms) {
        const secs = Math.floor(ms / 1000);
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    }
    
    getMasteredWords() {
        const stats = storageService.get('wordStats', {});
        const mastered = {};
        
        Object.entries(stats).forEach(([word, data]) => {
            if (data.streak >= 3 && data.attempts >= 3) {
                mastered[word] = data;
            }
        });
        
        return mastered;
    }
    
    getProblemWords() {
        const stats = storageService.get('wordStats', {});
        const problems = {};
        
        Object.entries(stats).forEach(([word, data]) => {
            const accuracy = data.attempts > 0 ? data.correct / data.attempts : 0;
            if (data.attempts >= 2 && accuracy < 0.5) {
                problems[word] = data;
            }
        });
        
        return problems;
    }
    
    recordHint() {
        if (this.session) {
            this.session.hintsUsed++;
        }
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = storageService.get('dailyStats', {});
        
        if (!dailyStats[today]) {
            dailyStats[today] = {
                totalTime: 0,
                sessionsCount: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                hintsUsed: 0,
                exerciseTypes: {}
            };
        }
        
        dailyStats[today].hintsUsed = (dailyStats[today].hintsUsed || 0) + 1;
        storageService.set('dailyStats', dailyStats);
    }
}

export const trackingService = new TrackingService();
export default trackingService;
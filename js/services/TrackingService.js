import storageService from './StorageService.js';

/**
 * Enhanced tracking service that actually tracks
 */
class TrackingService {
    constructor() {
        this.storage = storageService;
        this.sessionStartTime = null;
        this.currentExerciseStartTime = null;
    }
    
    /**
     * Start a new session
     */
    startSession(exerciseType) {
        this.sessionStartTime = Date.now();
        this.currentExerciseStartTime = Date.now();
        
        // Initialize today's data if needed
        const today = new Date().toDateString();
        const todayData = this.getTodayData();
        
        if (!todayData.date || todayData.date !== today) {
            this.storage.set('today', {
                date: today,
                practiceTime: 0,
                wordsAttempted: [],
                totalAttempts: 0,
                totalCorrect: 0,
                hintsUsed: 0,
                skipsUsed: 0,
                sessions: []
            });
        }
        
        return {
            exerciseType,
            startTime: this.sessionStartTime
        };
    }
    
    /**
     * End current session
     */
    endSession(exerciseType, results) {
        if (!this.sessionStartTime) return;
        
        const sessionDuration = Date.now() - this.sessionStartTime;
        const todayData = this.getTodayData();
        
        // Update practice time
        todayData.practiceTime = (todayData.practiceTime || 0) + sessionDuration;
        
        // Add session record
        if (!todayData.sessions) todayData.sessions = [];
        todayData.sessions.push({
            exerciseType,
            duration: sessionDuration,
            timestamp: Date.now(),
            ...results
        });
        
        this.storage.set('today', todayData);
        
        // Update all-time stats
        this.updateAllTimeStats(sessionDuration, results);
        
        // Update streak
        this.updateStreak();
        
        this.sessionStartTime = null;
    }
    
    /**
     * Record an attempt
     */
    recordAttempt({ word, correct, hintsUsed = 0, skipped = false, exerciseType = 'unknown' }) {
        const todayData = this.getTodayData();
        
        // Track the word
        if (!todayData.wordsAttempted) {
            todayData.wordsAttempted = [];
        }
        if (!todayData.wordsAttempted.includes(word)) {
            todayData.wordsAttempted.push(word);
        }
        
        // Update counts
        todayData.totalAttempts = (todayData.totalAttempts || 0) + 1;
        if (correct) {
            todayData.totalCorrect = (todayData.totalCorrect || 0) + 1;
        }
        todayData.hintsUsed = (todayData.hintsUsed || 0) + hintsUsed;
        if (skipped) {
            todayData.skipsUsed = (todayData.skipsUsed || 0) + 1;
        }
        
        this.storage.set('today', todayData);
        
        // Update word-specific tracking
        this.updateWordStats(word, correct, hintsUsed);
        
        // Update exercise-specific tracking
        this.updateExerciseStats(exerciseType, correct);
    }
    
    /**
     * Get today's data with proper initialization
     */
    getTodayData() {
        const today = new Date().toDateString();
        let data = this.storage.get('today', {});
        
        if (!data.date || data.date !== today) {
            data = {
                date: today,
                practiceTime: 0,
                wordsAttempted: [],
                totalAttempts: 0,
                totalCorrect: 0,
                hintsUsed: 0,
                skipsUsed: 0,
                sessions: []
            };
            this.storage.set('today', data);
        }
        
        return data;
    }
    
    /**
     * Update word-specific statistics
     */
    updateWordStats(word, correct, hintsUsed) {
        const wordStats = this.storage.get('wordStats', {});
        
        if (!wordStats[word]) {
            wordStats[word] = {
                attempts: 0,
                correct: 0,
                streak: 0,
                hintsUsed: 0,
                lastSeen: null,
                difficulty: 'normal'
            };
        }
        
        const stats = wordStats[word];
        stats.attempts++;
        stats.hintsUsed += hintsUsed;
        stats.lastSeen = Date.now();
        
        if (correct) {
            stats.correct++;
            stats.streak++;
            
            // Update difficulty based on performance
            const accuracy = stats.correct / stats.attempts;
            if (accuracy < 0.5) {
                stats.difficulty = 'hard';
            } else if (accuracy > 0.8 && stats.attempts >= 3) {
                stats.difficulty = 'easy';
            }
        } else {
            stats.streak = 0;
            if (stats.attempts >= 3 && stats.correct / stats.attempts < 0.3) {
                stats.difficulty = 'hard';
            }
        }
        
        this.storage.set('wordStats', wordStats);
    }
    
    /**
     * Update exercise-specific statistics
     */
    updateExerciseStats(exerciseType, correct) {
        const exerciseStats = this.storage.get('exerciseStats', {});
        
        if (!exerciseStats[exerciseType]) {
            exerciseStats[exerciseType] = {
                attempts: 0,
                correct: 0,
                sessions: 0
            };
        }
        
        exerciseStats[exerciseType].attempts++;
        if (correct) {
            exerciseStats[exerciseType].correct++;
        }
        
        this.storage.set('exerciseStats', exerciseStats);
    }
    
    /**
     * Update all-time statistics
     */
    updateAllTimeStats(duration, results) {
        const allTime = this.storage.get('allTimeStats', {
            totalPracticeTime: 0,
            totalSessions: 0,
            daysActive: new Set()
        });
        
        allTime.totalPracticeTime = (allTime.totalPracticeTime || 0) + duration;
        allTime.totalSessions = (allTime.totalSessions || 0) + 1;
        
        const today = new Date().toDateString();
        if (!allTime.daysActive) allTime.daysActive = [];
        if (!allTime.daysActive.includes(today)) {
            allTime.daysActive.push(today);
        }
        
        this.storage.set('allTimeStats', allTime);
    }
    
    /**
     * Update streak
     */
    updateStreak() {
        const streak = this.storage.get('streak', { current: 0, longest: 0, lastDate: null });
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (streak.lastDate === today) {
            // Already practiced today
            return;
        } else if (streak.lastDate === yesterday) {
            // Continuing streak
            streak.current++;
        } else {
            // Streak broken, start new
            streak.current = 1;
        }
        
        if (streak.current > streak.longest) {
            streak.longest = streak.current;
        }
        
        streak.lastDate = today;
        this.storage.set('streak', streak);
    }
}

export const trackingService = new TrackingService();
export default trackingService;
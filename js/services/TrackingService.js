// services/TrackingService.js - FIXED VERSION
import storageService from './StorageService.js';
import { i18n } from '../core/i18n.js';

class TrackingService {
    constructor() {
        this.currentSession = null;
        this.exerciseTypeSession = null;
        this.responseTimes = [];
    }
    
    /**
     * Get language-specific storage key
     */
    getStorageKey(baseKey) {
        const locale = i18n.getCurrentLocale();
        return `${baseKey}_${locale}`;
    }
    
    /**
     * Start a new session
     */
    startSession(exerciseType) {
        const now = Date.now();
        
        this.currentSession = {
            exerciseType,
            startTime: now,
            lastActivityTime: now,
            attempts: [],
            hints: 0,
            skips: 0,
            inactivityGaps: []
        };
        
        // Initialize exercise-type session tracking
        this.exerciseTypeSession = {
            type: exerciseType,
            startTime: now,
            items: []
        };
        
        // Update daily stats
        this.updateDailyStats('sessionStart', { exerciseType });
        
        return this.currentSession;
    }
    
    /**
     * Record an attempt with enhanced metrics
     */
    recordAttempt({
        exerciseType,
        word,
        wordId, // Add word ID for better tracking
        correct,
        hintsUsed = 0,
        responseTime = null,
        attemptNumber = 1,
        wrongSelections = 0,
        mistypedLetters = 0,
        difficulty = null // Add difficulty tracking
    }) {
        if (!this.currentSession) return;
        
        const attempt = {
            word,
            wordId,
            correct,
            hintsUsed,
            responseTime,
            attemptNumber,
            wrongSelections,
            mistypedLetters,
            difficulty,
            timestamp: Date.now()
        };
        
        this.currentSession.attempts.push(attempt);
        
        // Store response time for median calculation
        if (responseTime && correct && attemptNumber === 1) {
            this.responseTimes.push(responseTime);
        }
        
        // Update word stats with ID tracking
        this.updateWordStats(wordId || word, correct, hintsUsed, responseTime, difficulty);
        
        // Update exercise-type stats
        this.updateExerciseTypeStats(exerciseType, {
            correct,
            hintsUsed,
            responseTime,
            firstTry: attemptNumber === 1,
            difficulty
        });
        
        // Update daily stats
        this.updateDailyStats('attempt', { 
            exerciseType, 
            correct, 
            hintsUsed,
            difficulty
        });
    }
    
    /**
     * Update word-specific statistics
     */
    updateWordStats(wordId, correct, hintsUsed, responseTime, difficulty, skipped = false) {
        const wordStats = storageService.get(this.getStorageKey('wordStats'), {});
        
        // Use word ID as key if available
        const key = wordId || 'unknown';
        
        if (!wordStats[key]) {
            wordStats[key] = {
                attempts: 0,
                correct: 0,
                streak: 0,
                hintsUsed: 0,
                skips: 0,
                responseTimes: [],
                lastSeen: null,
                difficulties: { easy: 0, medium: 0, hard: 0 },
                firstSeen: Date.now()
            };
        }
        
        const stats = wordStats[key];
        stats.attempts++;
        stats.hintsUsed += hintsUsed;
        stats.lastSeen = Date.now();
        
        // Track difficulty attempts
        if (difficulty) {
            stats.difficulties[difficulty] = (stats.difficulties[difficulty] || 0) + 1;
        }
        
        if (skipped) {
            stats.skips++;
            stats.streak = 0;
        } else if (correct) {
            stats.correct++;
            stats.streak++;
            
            if (responseTime) {
                stats.responseTimes.push(responseTime);
                // Keep only last 10 response times per word
                if (stats.responseTimes.length > 10) {
                    stats.responseTimes = stats.responseTimes.slice(-10);
                }
            }
        } else {
            stats.streak = 0;
        }
        
        // Calculate accuracy
        stats.accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
        
        storageService.set(this.getStorageKey('wordStats'), wordStats);
    }
    
    /**
     * Update daily statistics
     */
    updateDailyStats(action, data) {
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        
        if (!dailyStats[today]) {
            dailyStats[today] = {
                date: today,
                totalTime: 0,
                sessionsCount: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                hintsUsed: 0,
                exerciseTypes: {},
                difficulties: { easy: 0, medium: 0, hard: 0 }
            };
        }
        
        const todayStats = dailyStats[today];
        
        switch (action) {
            case 'sessionStart':
                todayStats.sessionsCount++;
                if (!todayStats.exerciseTypes[data.exerciseType]) {
                    todayStats.exerciseTypes[data.exerciseType] = {
                        sessions: 0,
                        attempts: 0,
                        correct: 0,
                        time: 0,
                        hintsUsed: 0
                    };
                }
                todayStats.exerciseTypes[data.exerciseType].sessions++;
                break;
                
            case 'attempt':
                todayStats.totalAttempts++;
                if (data.correct) todayStats.totalCorrect++;
                if (data.difficulty) {
                    todayStats.difficulties[data.difficulty]++;
                }
                
                if (todayStats.exerciseTypes[data.exerciseType]) {
                    const exerciseStats = todayStats.exerciseTypes[data.exerciseType];
                    exerciseStats.attempts++;
                    if (data.correct) exerciseStats.correct++;
                    if (data.hintsUsed) exerciseStats.hintsUsed += data.hintsUsed;
                }
                break;
                
            case 'hint':
                todayStats.hintsUsed++;
                if (todayStats.exerciseTypes[data.exerciseType]) {
                    todayStats.exerciseTypes[data.exerciseType].hintsUsed = 
                        (todayStats.exerciseTypes[data.exerciseType].hintsUsed || 0) + 1;
                }
                break;
                
            case 'sessionEnd':
                if (data.duration && todayStats.exerciseTypes[data.exerciseType]) {
                    todayStats.exerciseTypes[data.exerciseType].time += data.duration;
                    todayStats.totalTime += data.duration;
                }
                break;
        }
        
        storageService.set(this.getStorageKey('dailyStats'), dailyStats);
    }
    
    /**
     * End session with comprehensive metrics
     */
    endSession(additionalData = {}) {
        if (!this.currentSession) return {};
        
        const now = Date.now();
        const session = this.currentSession;
        
        // Calculate metrics
        const totalTime = now - session.startTime;
        const activeTime = additionalData.activeTime || totalTime;
        const attempts = session.attempts.length;
        const correct = session.attempts.filter(a => a.correct).length;
        const firstTryCorrect = session.attempts.filter(a => a.correct && a.attemptNumber === 1).length;
        const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
        
        // Calculate median response time
        let medianResponseTime = null;
        if (this.responseTimes.length > 0) {
            const sorted = [...this.responseTimes].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            medianResponseTime = sorted.length % 2 === 0
                ? (sorted[mid - 1] + sorted[mid]) / 2
                : sorted[mid];
        }
        
        // Update daily stats with session end
        this.updateDailyStats('sessionEnd', {
            exerciseType: session.exerciseType,
            duration: activeTime
        });
        
        // Save session history
        const sessionRecord = {
            exerciseType: session.exerciseType,
            date: session.startTime,
            duration: totalTime,
            activeTime,
            total: attempts,
            correct,
            firstTryCorrect,
            accuracy,
            hintsUsed: session.hints,
            skips: session.skips,
            medianResponseTime,
            inactivityGaps: session.inactivityGaps.length
        };
        
        this.saveSessionHistory(sessionRecord);
        
        // Update exercise-type aggregates
        this.finalizeExerciseTypeSession(sessionRecord);
        
        // Get trend (comparison to previous session)
        const trend = this.calculateTrend(session.exerciseType, accuracy);
        
        // Reset for next session
        this.currentSession = null;
        this.exerciseTypeSession = null;
        this.responseTimes = [];
        
        return {
            ...sessionRecord,
            trend,
            timeFormatted: this.formatDuration(activeTime)
        };
    }
    
    /**
     * Save session to history
     */
    saveSessionHistory(sessionRecord) {
        const history = storageService.get(this.getStorageKey('sessionHistory'), []);
        history.push(sessionRecord);
        
        // Keep only last 100 sessions
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        storageService.set(this.getStorageKey('sessionHistory'), history);
    }
    
    /**
     * Calculate trend vs previous sessions
     */
    calculateTrend(exerciseType, currentAccuracy) {
        const history = storageService.get(this.getStorageKey('sessionHistory'), []);
        const previousSessions = history
            .filter(s => s.exerciseType === exerciseType)
            .slice(-5, -1); // Last 5 sessions, excluding current
        
        if (previousSessions.length === 0) return 0;
        
        const avgPrevious = previousSessions.reduce((sum, s) => 
            sum + s.accuracy, 0) / previousSessions.length;
        
        return Math.round(currentAccuracy - avgPrevious);
    }
    
    // Simplified exercise type stats update
    updateExerciseTypeStats(type, data) {
        const stats = storageService.get(this.getStorageKey('exerciseTypeStats'), {});
        
        if (!stats[type]) {
            stats[type] = {
                totalAttempts: 0,
                firstTryCorrect: 0,
                correctWithHints: 0,
                totalSkips: 0,
                totalHintsUsed: 0,
                totalActiveTime: 0,
                responseTimes: [],
                byDifficulty: {
                    easy: { attempts: 0, correct: 0 },
                    medium: { attempts: 0, correct: 0 },
                    hard: { attempts: 0, correct: 0 }
                }
            };
        }
        
        const typeStats = stats[type];
        
        // Update based on data
        if (data.correct !== undefined) {
            typeStats.totalAttempts++;
            
            // Track by difficulty
            if (data.difficulty && typeStats.byDifficulty[data.difficulty]) {
                typeStats.byDifficulty[data.difficulty].attempts++;
                if (data.correct) {
                    typeStats.byDifficulty[data.difficulty].correct++;
                }
            }
            
            if (data.correct) {
                if (data.firstTry && !data.hintsUsed) {
                    typeStats.firstTryCorrect++;
                } else if (data.hintsUsed) {
                    typeStats.correctWithHints++;
                }
            }
        }
        
        if (data.hintUsed) {
            typeStats.totalHintsUsed++;
        }
        
        if (data.skipped) {
            typeStats.totalSkips++;
        }
        
        if (data.responseTime && data.firstTry) {
            typeStats.responseTimes.push(data.responseTime);
            // Keep only last 100 response times
            if (typeStats.responseTimes.length > 100) {
                typeStats.responseTimes = typeStats.responseTimes.slice(-100);
            }
        }
        
        storageService.set(this.getStorageKey('exerciseTypeStats'), stats);
    }
    
    finalizeExerciseTypeSession(sessionRecord) {
        const stats = storageService.get(this.getStorageKey('exerciseTypeStats'), {});
        const type = sessionRecord.exerciseType;
        
        if (stats[type]) {
            stats[type].totalActiveTime += sessionRecord.activeTime;
        }
        
        storageService.set(this.getStorageKey('exerciseTypeStats'), stats);
    }
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    // Methods for recording hints and skips remain the same
    recordHint(exerciseType) {
        if (!this.currentSession) return;
        
        this.currentSession.hints++;
        
        this.updateExerciseTypeStats(exerciseType, {
            hintUsed: true
        });
        
        this.updateDailyStats('hint', { exerciseType });
    }
    
    recordSkip({ exerciseType, word, wordId, responseTime, hintsUsed }) {
        if (!this.currentSession) return;
        
        this.currentSession.skips++;
        
        this.updateExerciseTypeStats(exerciseType, {
            skipped: true,
            responseTime,
            hintsUsed
        });
        
        this.updateWordStats(wordId || word, false, hintsUsed, responseTime, null, true);
        this.updateDailyStats('skip', { exerciseType });
    }
}

export const trackingService = new TrackingService();
export default trackingService;
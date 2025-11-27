// services/TrackingService.js - ENHANCED VERSION
import storageService from './StorageService.js';

class TrackingService {
    constructor() {
        this.currentSession = null;
        this.exerciseTypeSession = null;
        this.responseTimes = [];
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
        correct,
        hintsUsed = 0,
        responseTime = null,
        attemptNumber = 1,
        wrongSelections = 0,
        mistypedLetters = 0
    }) {
        if (!this.currentSession) return;
        
        const attempt = {
            word,
            correct,
            hintsUsed,
            responseTime,
            attemptNumber,
            wrongSelections,
            mistypedLetters,
            timestamp: Date.now()
        };
        
        this.currentSession.attempts.push(attempt);
        
        // Store response time for median calculation
        if (responseTime && correct && attemptNumber === 1) {
            this.responseTimes.push(responseTime);
        }
        
        // Update word stats
        this.updateWordStats(word, correct, hintsUsed, responseTime);
        
        // Update exercise-type stats
        this.updateExerciseTypeStats(exerciseType, {
            correct,
            hintsUsed,
            responseTime,
            firstTry: attemptNumber === 1
        });
        
        // Update daily stats
        this.updateDailyStats('attempt', { 
            exerciseType, 
            correct, 
            hintsUsed 
        });
    }
    
    /**
     * Record hint usage
     */
    recordHint(exerciseType) {
        if (!this.currentSession) return;
        
        this.currentSession.hints++;
        
        this.updateExerciseTypeStats(exerciseType, {
            hintUsed: true
        });
        
        this.updateDailyStats('hint', { exerciseType });
    }
    
    /**
     * Record skip with context
     */
    recordSkip({ exerciseType, word, responseTime, hintsUsed }) {
        if (!this.currentSession) return;
        
        this.currentSession.skips++;
        
        this.updateExerciseTypeStats(exerciseType, {
            skipped: true,
            responseTime,
            hintsUsed
        });
        
        this.updateWordStats(word, false, hintsUsed, responseTime, true);
        this.updateDailyStats('skip', { exerciseType });
    }
    
    /**
     * Record inactivity gap
     */
    recordInactivityGap(duration) {
        if (!this.currentSession) return;
        
        this.currentSession.inactivityGaps.push({
            duration,
            timestamp: Date.now()
        });
    }
    
    /**
     * Pause session (for inactivity)
     */
    pauseSession(reason = 'manual') {
        if (!this.currentSession) return;
        
        this.currentSession.pausedAt = Date.now();
        this.currentSession.pauseReason = reason;
    }
    
    /**
     * Resume paused session
     */
    resumeSession() {
        if (!this.currentSession || !this.currentSession.pausedAt) return;
        
        const pauseDuration = Date.now() - this.currentSession.pausedAt;
        this.recordInactivityGap(pauseDuration);
        
        delete this.currentSession.pausedAt;
        delete this.currentSession.pauseReason;
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
     * Update exercise-type specific statistics
     */
    updateExerciseTypeStats(type, data) {
        const stats = storageService.get('exerciseTypeStats', {});
        
        if (!stats[type]) {
            stats[type] = {
                totalAttempts: 0,
                firstTryCorrect: 0,
                correctWithHints: 0,
                totalSkips: 0,
                totalHintsUsed: 0,
                totalActiveTime: 0,
                responseTimes: [],
                dailySnapshots: {},
                flags: {}
            };
        }
        
        const typeStats = stats[type];
        
        // Update based on data
        if (data.correct !== undefined) {
            typeStats.totalAttempts++;
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
            if (!typeStats.responseTimes) typeStats.responseTimes = [];
            typeStats.responseTimes.push(data.responseTime);
            
            // Keep only last 100 response times
            if (typeStats.responseTimes.length > 100) {
                typeStats.responseTimes = typeStats.responseTimes.slice(-100);
            }
        }
        
        storageService.set('exerciseTypeStats', stats);
    }
    
    /**
     * Finalize exercise-type session data
     */
    finalizeExerciseTypeSession(sessionRecord) {
        const stats = storageService.get('exerciseTypeStats', {});
        const type = sessionRecord.exerciseType;
        
        if (!stats[type]) return;
        
        // Add to total active time
        stats[type].totalActiveTime += sessionRecord.activeTime;
        
        // Update daily snapshot
        const today = new Date().toISOString().split('T')[0];
        if (!stats[type].dailySnapshots) {
            stats[type].dailySnapshots = {};
        }
        
        if (!stats[type].dailySnapshots[today]) {
            stats[type].dailySnapshots[today] = {
                attempts: 0,
                firstTryCorrect: 0,
                correctWithHints: 0,
                skips: 0,
                hintsUsed: 0,
                activeTime: 0,
                sessions: 0,
                responseTimes: []
            };
        }
        
        const daily = stats[type].dailySnapshots[today];
        daily.attempts += sessionRecord.total;
        daily.firstTryCorrect += sessionRecord.firstTryCorrect;
        daily.correctWithHints += (sessionRecord.correct - sessionRecord.firstTryCorrect);
        daily.skips += sessionRecord.skips;
        daily.hintsUsed += sessionRecord.hintsUsed;
        daily.activeTime += sessionRecord.activeTime;
        daily.sessions++;
        
        if (sessionRecord.medianResponseTime) {
            daily.responseTimes.push(sessionRecord.medianResponseTime);
        }
        
        // Update flags (mastery/avoidance detection)
        this.updateExerciseFlags(type, stats[type]);
        
        storageService.set('exerciseTypeStats', stats);
    }
    
    /**
     * Update flags for mastery/avoidance detection
     */
    updateExerciseFlags(type, stats) {
        const recentSessions = this.getRecentSessions(type, 5);
        
        if (recentSessions.length < 3) return; // Not enough data
        
        const recentAccuracy = this.calculateRecentAccuracy(stats);
        const engagementRate = this.calculateEngagementRate(type);
        const hintDependency = this.calculateHintDependency(stats);
        
        stats.flags = {
            possibleMastery: recentAccuracy > 90 && hintDependency < 0.1,
            possibleAvoidance: recentAccuracy < 60 && engagementRate < 0.1,
            needsAttention: (recentAccuracy < 70 && hintDependency > 0.3) || 
                           (stats.totalSkips / stats.totalAttempts > 0.2),
            trending: this.calculateTrend(type, recentAccuracy) > 5 ? 'up' : 
                     this.calculateTrend(type, recentAccuracy) < -5 ? 'down' : 'stable',
            lastFlagUpdate: Date.now()
        };
    }
    
    /**
     * Calculate recent accuracy (last 7 days)
     */
    calculateRecentAccuracy(stats) {
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentDays = Object.entries(stats.dailySnapshots || {})
            .filter(([date]) => new Date(date).getTime() > cutoff)
            .map(([, data]) => data);
        
        if (recentDays.length === 0) return 0;
        
        const totalAttempts = recentDays.reduce((sum, d) => sum + d.attempts, 0);
        const totalCorrect = recentDays.reduce((sum, d) => 
            sum + d.firstTryCorrect + d.correctWithHints, 0);
        
        return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    }
    
    /**
     * Calculate engagement rate (this exercise vs others)
     */
    calculateEngagementRate(type) {
        const allStats = storageService.get('exerciseTypeStats', {});
        const totalTime = Object.values(allStats)
            .reduce((sum, s) => sum + (s.totalActiveTime || 0), 0);
        
        if (totalTime === 0) return 0;
        
        return (allStats[type]?.totalActiveTime || 0) / totalTime;
    }
    
    /**
     * Calculate hint dependency ratio
     */
    calculateHintDependency(stats) {
        if (!stats.totalAttempts || stats.totalAttempts === 0) return 0;
        return stats.totalHintsUsed / stats.totalAttempts;
    }
    
    /**
     * Calculate trend vs previous sessions
     */
    calculateTrend(exerciseType, currentAccuracy) {
        const history = storageService.get('sessionHistory', []);
        const previousSessions = history
            .filter(s => s.exerciseType === exerciseType)
            .slice(-5, -1); // Last 5 sessions, excluding current
        
        if (previousSessions.length === 0) return 0;
        
        const avgPrevious = previousSessions.reduce((sum, s) => 
            sum + s.accuracy, 0) / previousSessions.length;
        
        return Math.round(currentAccuracy - avgPrevious);
    }
    
    /**
     * Get recent sessions for an exercise type
     */
    getRecentSessions(type, limit = 10) {
        const history = storageService.get('sessionHistory', []);
        return history
            .filter(s => s.exerciseType === type)
            .slice(-limit);
    }
    
    /**
     * Save session to history
     */
    saveSessionHistory(sessionRecord) {
        const history = storageService.get('sessionHistory', []);
        history.push(sessionRecord);
        
        // Keep only last 100 sessions
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        storageService.set('sessionHistory', history);
    }
    
    /**
     * Update word-specific statistics
     */
    updateWordStats(word, correct, hintsUsed, responseTime, skipped = false) {
        const wordStats = storageService.get('wordStats', {});
        
        if (!wordStats[word]) {
            wordStats[word] = {
                attempts: 0,
                correct: 0,
                streak: 0,
                hintsUsed: 0,
                skips: 0,
                responseTimes: [],
                lastSeen: null,
                difficulty: 'normal'
            };
        }
        
        const stats = wordStats[word];
        stats.attempts++;
        stats.hintsUsed += hintsUsed;
        stats.lastSeen = Date.now();
        
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
        
        // Update difficulty assessment
        const accuracy = stats.correct / stats.attempts;
        if (stats.attempts >= 3) {
            if (accuracy < 0.4) {
                stats.difficulty = 'hard';
            } else if (accuracy > 0.8 && stats.hintsUsed / stats.attempts < 0.2) {
                stats.difficulty = 'easy';
            } else {
                stats.difficulty = 'normal';
            }
        }
        
        storageService.set('wordStats', wordStats);
    }
    
    /**
     * Update daily statistics
     */
    updateDailyStats(action, data) {
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = storageService.get('dailyStats', {});
        
        if (!dailyStats[today]) {
            dailyStats[today] = {
                date: today,
                totalTime: 0,
                sessionsCount: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                hintsUsed: 0,
                exerciseTypes: {}
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
                        time: 0
                    };
                }
                todayStats.exerciseTypes[data.exerciseType].sessions++;
                break;
                
            case 'attempt':
                todayStats.totalAttempts++;
                if (data.correct) todayStats.totalCorrect++;
                if (todayStats.exerciseTypes[data.exerciseType]) {
                    todayStats.exerciseTypes[data.exerciseType].attempts++;
                    if (data.correct) {
                        todayStats.exerciseTypes[data.exerciseType].correct++;
                    }
                }
                break;
                
            case 'hint':
                todayStats.hintsUsed++;
                break;
                
            case 'skip':
                // Track skips if needed
                break;
        }
        
        storageService.set('dailyStats', dailyStats);
    }
    
    /**
     * Format duration for display
     */
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
}

export const trackingService = new TrackingService();
export default trackingService;
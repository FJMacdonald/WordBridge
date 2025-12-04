// services/TrackingService.js - ENHANCED VERSION with test history
import storageService from './StorageService.js';
import { i18n } from '../core/i18n.js';

class TrackingService {
    constructor() {
        this.currentSession = null;
        this.exerciseTypeSession = null;
        this.responseTimes = [];
        this.DEFAULT_TEST_QUESTIONS = 10; // Default number of questions for tests
    }
    
    /**
     * Get language-specific storage key
     */
    getStorageKey(baseKey) {
        const locale = i18n.getCurrentLocale();
        return `${baseKey}_${locale}`;
    }
    
    /**
     * Get the default number of test questions
     */
    getDefaultTestQuestions() {
        return this.DEFAULT_TEST_QUESTIONS;
    }
    
    /**
     * Start a new session
     */
    startSession(exerciseType, mode = 'practice', testConfig = null) {
        const now = Date.now();
        
        this.currentSession = {
            id: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
            exerciseType,
            mode, // 'practice' or 'test'
            startTime: now,
            lastActivityTime: now,
            attempts: [],
            wordList: [], // Store the exact words used in this session
            hints: 0,
            skips: 0,
            inactivityGaps: [],
            testConfig: testConfig // Store test configuration for retries
        };
        
        // Initialize exercise-type session tracking
        this.exerciseTypeSession = {
            type: exerciseType,
            startTime: now,
            items: []
        };
        
        // Update daily stats
        this.updateDailyStats('sessionStart', { exerciseType, mode });
        
        return this.currentSession;
    }
    
    /**
     * Store the word list for the current session (for test retry feature)
     */
    setSessionWordList(wordIds) {
        if (this.currentSession) {
            this.currentSession.wordList = wordIds;
        }
    }
    
    /**
     * Record an attempt with enhanced metrics
     */
    recordAttempt({
        exerciseType,
        word,
        wordId,
        correct,
        hintsUsed = 0,
        responseTime = null,
        attemptNumber = 1,
        wrongSelections = 0,
        mistypedLetters = 0,
        difficulty = null,
        questionData = null // Store full question data for retry
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
            questionData,
            timestamp: Date.now()
        };
        
        this.currentSession.attempts.push(attempt);
        
        // Add to word list if not already present
        if (wordId && !this.currentSession.wordList.includes(wordId)) {
            this.currentSession.wordList.push(wordId);
        }
        
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
            difficulty,
            mode: this.currentSession.mode
        });
    }
    
    /**
     * Update word-specific statistics
     */
    updateWordStats(wordId, correct, hintsUsed, responseTime, difficulty, skipped = false) {
        const wordStats = storageService.get(this.getStorageKey('wordStats'), {});
        
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
                firstSeen: Date.now(),
                exerciseHistory: {} // Track per-exercise performance
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
                difficulties: { easy: 0, medium: 0, hard: 0 },
                practiceAttempts: 0,
                testAttempts: 0
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
                        hintsUsed: 0,
                        practiceAttempts: 0,
                        testAttempts: 0
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
                
                // Track practice vs test attempts
                if (data.mode === 'test') {
                    todayStats.testAttempts++;
                } else {
                    todayStats.practiceAttempts++;
                }
                
                if (todayStats.exerciseTypes[data.exerciseType]) {
                    const exerciseStats = todayStats.exerciseTypes[data.exerciseType];
                    exerciseStats.attempts++;
                    if (data.correct) exerciseStats.correct++;
                    if (data.hintsUsed) exerciseStats.hintsUsed += data.hintsUsed;
                    
                    if (data.mode === 'test') {
                        exerciseStats.testAttempts++;
                    } else {
                        exerciseStats.practiceAttempts++;
                    }
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
        
        // Create session record with word list and attempts for retake
        const sessionRecord = {
            id: session.id,
            exerciseType: session.exerciseType,
            mode: session.mode,
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
            inactivityGaps: session.inactivityGaps.length,
            wordList: session.wordList || [], // IMPORTANT: Include word list
            attempts: session.attempts.map(a => ({ // IMPORTANT: Include attempts with word info
                word: a.word,
                wordId: a.wordId,
                correct: a.correct,
                hintsUsed: a.hintsUsed || 0,
                responseTime: a.responseTime,
                difficulty: a.difficulty
            })),
            testConfig: session.testConfig,
            difficulty: session.testConfig?.difficulty || session.attempts[0]?.difficulty || 'easy'
        };
        
        // Save session history
        this.saveSessionHistory(sessionRecord);
        
        // If this is a test, save to test history separately
        if (session.mode === 'test') {
            this.saveTestHistory(sessionRecord);
        }
        
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
        
        // Keep only last 200 sessions
        if (history.length > 200) {
            history.splice(0, history.length - 200);
        }
        
        storageService.set(this.getStorageKey('sessionHistory'), history);
    }
    
    /**
     * Save test to separate test history for comparison
     */
    saveTestHistory(testRecord) {
        const testHistory = storageService.get(this.getStorageKey('testHistory'), {});
        const exerciseType = testRecord.exerciseType;
        
        if (!testHistory[exerciseType]) {
            testHistory[exerciseType] = [];
        }
        
        testHistory[exerciseType].push({
            id: testRecord.id,
            date: testRecord.date,
            total: testRecord.total,
            correct: testRecord.correct,
            accuracy: testRecord.accuracy,
            hintsUsed: testRecord.hintsUsed,
            medianResponseTime: testRecord.medianResponseTime,
            wordList: testRecord.wordList,
            attempts: testRecord.attempts,
            testConfig: testRecord.testConfig
        });
        
        // Keep last 50 tests per exercise type
        if (testHistory[exerciseType].length > 50) {
            testHistory[exerciseType] = testHistory[exerciseType].slice(-50);
        }
        
        storageService.set(this.getStorageKey('testHistory'), testHistory);
    }
    
    /**
     * Get test history for an exercise type
     */
    getTestHistory(exerciseType = null) {
        const testHistory = storageService.get(this.getStorageKey('testHistory'), {});
        
        if (exerciseType) {
            return testHistory[exerciseType] || [];
        }
        return testHistory;
    }
    
    /**
     * Get a specific test by ID for retry
     */
    getTestById(testId) {
        const testHistory = this.getTestHistory();
        
        for (const exerciseType in testHistory) {
            const test = testHistory[exerciseType].find(t => t.id === testId);
            if (test) {
                return test;
            }
        }
        return null;
    }
    
    /**
     * Compare two tests
     */
    compareTests(testId1, testId2) {
        const test1 = this.getTestById(testId1);
        const test2 = this.getTestById(testId2);
        
        if (!test1 || !test2) return null;
        
        // Build word-by-word comparison
        const wordComparison = {};
        
        test1.attempts.forEach(attempt => {
            const wordId = attempt.wordId || attempt.word;
            wordComparison[wordId] = {
                word: attempt.word,
                test1: {
                    correct: attempt.correct,
                    hintsUsed: attempt.hintsUsed,
                    responseTime: attempt.responseTime
                },
                test2: null
            };
        });
        
        test2.attempts.forEach(attempt => {
            const wordId = attempt.wordId || attempt.word;
            if (wordComparison[wordId]) {
                wordComparison[wordId].test2 = {
                    correct: attempt.correct,
                    hintsUsed: attempt.hintsUsed,
                    responseTime: attempt.responseTime
                };
            } else {
                wordComparison[wordId] = {
                    word: attempt.word,
                    test1: null,
                    test2: {
                        correct: attempt.correct,
                        hintsUsed: attempt.hintsUsed,
                        responseTime: attempt.responseTime
                    }
                };
            }
        });
        
        return {
            test1: {
                id: test1.id,
                date: test1.date,
                accuracy: test1.accuracy,
                correct: test1.correct,
                total: test1.total
            },
            test2: {
                id: test2.id,
                date: test2.date,
                accuracy: test2.accuracy,
                correct: test2.correct,
                total: test2.total
            },
            improvement: test2.accuracy - test1.accuracy,
            wordComparison
        };
    }
    
    /**
     * Calculate trend vs previous sessions
     */
    calculateTrend(exerciseType, currentAccuracy) {
        const history = storageService.get(this.getStorageKey('sessionHistory'), []);
        const previousSessions = history
            .filter(s => s.exerciseType === exerciseType)
            .slice(-5, -1);
        
        if (previousSessions.length === 0) return 0;
        
        const avgPrevious = previousSessions.reduce((sum, s) => 
            sum + s.accuracy, 0) / previousSessions.length;
        
        return Math.round(currentAccuracy - avgPrevious);
    }
    
    /**
     * Update exercise type stats
     */
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
                testCount: 0,
                practiceCount: 0,
                byDifficulty: {
                    easy: { attempts: 0, correct: 0 },
                    medium: { attempts: 0, correct: 0 },
                    hard: { attempts: 0, correct: 0 }
                }
            };
        }
        
        const typeStats = stats[type];
        
        if (data.correct !== undefined) {
            typeStats.totalAttempts++;
            
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
            if (typeStats.responseTimes.length > 100) {
                typeStats.responseTimes = typeStats.responseTimes.slice(-100);
            }
        }
        
        storageService.set(this.getStorageKey('exerciseTypeStats'), stats);
    }
    
    /**
     * Get exercise breakdown for progress display
     */
    getExerciseBreakdown() {
        const stats = storageService.get(this.getStorageKey('exerciseTypeStats'), {});
        const testHistory = this.getTestHistory();
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        
        const allExerciseTypes = [
            'naming', 'listening', 'speaking', 'typing', 
            'sentenceTyping', 'category', 'rhyming', 'firstSound', 
            'association', 'synonyms', 'definitions', 'scramble',
            'clockMatching', 'timeSequencing', 'timeOrdering', 'workingMemory'
        ];
        
        const breakdown = {};
        
        allExerciseTypes.forEach(type => {
            const typeStats = stats[type] || {};
            const typeTests = testHistory[type] || [];
            const typeSessions = sessionHistory.filter(s => s.exerciseType === type);
            
            // Calculate practice sessions vs test sessions
            const practiceSessions = typeSessions.filter(s => s.mode !== 'test');
            const testSessions = typeSessions.filter(s => s.mode === 'test');
            
            breakdown[type] = {
                totalAttempts: typeStats.totalAttempts || 0,
                totalCorrect: (typeStats.firstTryCorrect || 0) + (typeStats.correctWithHints || 0),
                accuracy: typeStats.totalAttempts > 0 
                    ? Math.round(((typeStats.firstTryCorrect || 0) + (typeStats.correctWithHints || 0)) / typeStats.totalAttempts * 100)
                    : 0,
                totalTime: typeStats.totalActiveTime || 0,
                hintsUsed: typeStats.totalHintsUsed || 0,
                
                // Practice stats
                practiceSessions: practiceSessions.length,
                practiceAttempts: practiceSessions.reduce((sum, s) => sum + (s.total || 0), 0),
                
                // Test stats
                testCount: typeTests.length,
                tests: typeTests.slice(-5).map(t => ({
                    id: t.id,
                    date: t.date,
                    accuracy: t.accuracy,
                    correct: t.correct,
                    total: t.total
                })),
                
                // Latest test for quick reference
                latestTest: typeTests.length > 0 ? typeTests[typeTests.length - 1] : null,
                
                // Difficulty breakdown
                byDifficulty: typeStats.byDifficulty || {
                    easy: { attempts: 0, correct: 0 },
                    medium: { attempts: 0, correct: 0 },
                    hard: { attempts: 0, correct: 0 }
                }
            };
        });
        
        return breakdown;
    }
    
    finalizeExerciseTypeSession(sessionRecord) {
        const stats = storageService.get(this.getStorageKey('exerciseTypeStats'), {});
        const type = sessionRecord.exerciseType;
        
        if (!stats[type]) {
            stats[type] = {
                totalAttempts: 0,
                firstTryCorrect: 0,
                correctWithHints: 0,
                totalSkips: 0,
                totalHintsUsed: 0,
                totalActiveTime: 0,
                responseTimes: [],
                testCount: 0,
                practiceCount: 0,
                byDifficulty: {
                    easy: { attempts: 0, correct: 0 },
                    medium: { attempts: 0, correct: 0 },
                    hard: { attempts: 0, correct: 0 }
                }
            };
        }
        
        stats[type].totalActiveTime += sessionRecord.activeTime;
        
        if (sessionRecord.mode === 'test') {
            stats[type].testCount++;
        } else {
            stats[type].practiceCount++;
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
     * Pause session
     */
    pauseSession(reason) {
        if (!this.currentSession) return;
        
        this.currentSession.pausedAt = Date.now();
        this.currentSession.pauseReason = reason;
    }
    
    /**
     * Resume session
     */
    resumeSession() {
        if (!this.currentSession || !this.currentSession.pausedAt) return;
        
        const pauseDuration = Date.now() - this.currentSession.pausedAt;
        this.currentSession.inactivityGaps.push({
            duration: pauseDuration,
            reason: this.currentSession.pauseReason,
            timestamp: this.currentSession.pausedAt
        });
        
        delete this.currentSession.pausedAt;
        delete this.currentSession.pauseReason;
        this.currentSession.lastActivityTime = Date.now();
    }
}

export const trackingService = new TrackingService();
export default trackingService;

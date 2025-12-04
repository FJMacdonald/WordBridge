import storageService from './StorageService.js';

/**
 * Service for managing Practice vs Test modes
 * 
 * Practice Mode:
 * - Track time spent per exercise type and difficulty
 * - Count number of exercises attempted
 * - No penalties for hints/skips
 * 
 * Test Mode:
 * - Fixed number of questions (20) at selected difficulty
 * - Track hints, skips, and processing time
 * - Evaluate user performance per exercise type/difficulty
 */
class ModeService {
    constructor() {
        this.currentMode = 'practice'; // 'practice' or 'test'
        this.testConfig = null;
        this.testProgress = null;
    }
    
    /**
     * Get current mode
     */
    getMode() {
        return this.currentMode;
    }
    
    /**
     * Start practice mode
     */
    startPracticeMode(exerciseType) {
        this.currentMode = 'practice';
        this.testConfig = null;
        this.testProgress = null;
        
        // Initialize practice session tracking
        const practiceStats = storageService.get('practiceStats', {});
        if (!practiceStats[exerciseType]) {
            practiceStats[exerciseType] = {
                totalAttempts: 0,
                timeByDifficulty: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                },
                countByDifficulty: {
                    easy: 0,
                    medium: 0,
                    hard: 0
                },
                sessions: []
            };
        }
        
        storageService.set('practiceStats', practiceStats);
        
        return {
            mode: 'practice',
            exerciseType
        };
    }
    
    /**
     * Start test mode
     */
    startTestMode(exerciseType, difficulty = 'easy') {
        this.currentMode = 'test';
        
        this.testConfig = {
            exerciseType,
            difficulty,
            totalQuestions: 20,
            startTime: Date.now()
        };
        
        this.testProgress = {
            questionsAnswered: 0,
            correct: 0,
            hintsUsed: 0,
            skipsUsed: 0,
            processingTimes: [],
            itemStartTime: Date.now()
        };
        
        return {
            mode: 'test',
            config: this.testConfig,
            progress: this.testProgress
        };
    }
    
    /**
     * Record practice attempt
     */
    recordPracticeAttempt(exerciseType, difficulty, timeSpent) {
        const practiceStats = storageService.get('practiceStats', {});
        
        if (!practiceStats[exerciseType]) {
            console.warn('Practice stats not initialized for', exerciseType);
            return;
        }
        
        const stats = practiceStats[exerciseType];
        stats.totalAttempts++;
        
        // Track time and count by difficulty
        const diff = difficulty || 'easy';
        stats.timeByDifficulty[diff] += timeSpent;
        stats.countByDifficulty[diff]++;
                
        storageService.set('practiceStats', practiceStats);
    }
    
    /**
     * Record test item completion
     */
    recordTestItem(correct, hintsUsed, skipped, processingTime) {
        if (this.currentMode !== 'test' || !this.testProgress) {
            console.warn('Not in test mode');
            return;
        }
        
        this.testProgress.questionsAnswered++;
        if (correct) this.testProgress.correct++;
        this.testProgress.hintsUsed += hintsUsed;
        if (skipped) this.testProgress.skipsUsed++;
        if (processingTime) {
            this.testProgress.processingTimes.push(processingTime);
        }
        
        // Reset item start time for next question
        this.testProgress.itemStartTime = Date.now();
                
        return this.testProgress;
    }
    
    /**
     * Check if test is complete
     */
    isTestComplete() {
        if (this.currentMode !== 'test' || !this.testProgress || !this.testConfig) {
            return false;
        }
        
        return this.testProgress.questionsAnswered >= this.testConfig.totalQuestions;
    }
    
    /**
     * Get test progress
     */
    getTestProgress() {
        if (this.currentMode !== 'test') return null;
        
        return {
            ...this.testProgress,
            remaining: this.testConfig.totalQuestions - this.testProgress.questionsAnswered,
            total: this.testConfig.totalQuestions
        };
    }
    
    /**
     * Complete test and save results
     */
    completeTest() {
        if (this.currentMode !== 'test' || !this.testProgress || !this.testConfig) {
            console.warn('Not in test mode or no progress');
            return null;
        }
        
        const totalTime = Date.now() - this.testConfig.startTime;
        const avgProcessingTime = this.testProgress.processingTimes.length > 0
            ? this.testProgress.processingTimes.reduce((a, b) => a + b, 0) / this.testProgress.processingTimes.length
            : 0;
        
        const medianProcessingTime = this.calculateMedian(this.testProgress.processingTimes);
        
        const result = {
            mode: 'test',
            exerciseType: this.testConfig.exerciseType,
            difficulty: this.testConfig.difficulty,
            date: Date.now(),
            totalQuestions: this.testConfig.totalQuestions,
            questionsAnswered: this.testProgress.questionsAnswered,
            correct: this.testProgress.correct,
            accuracy: Math.round((this.testProgress.correct / this.testProgress.questionsAnswered) * 100),
            hintsUsed: this.testProgress.hintsUsed,
            skipsUsed: this.testProgress.skipsUsed,
            totalTime,
            avgProcessingTime,
            medianProcessingTime,
            hintsPerQuestion: (this.testProgress.hintsUsed / this.testProgress.questionsAnswered).toFixed(2),
            skipsPerQuestion: (this.testProgress.skipsUsed / this.testProgress.questionsAnswered).toFixed(2),
            // IMPORTANT: Save the word list for retakes
            wordList: this.words.map(w => typeof w === 'string' ? w : w.word || w.text),
            // IMPORTANT: Save individual attempts for comparison
            attempts: this.attempts.map(a => ({
                word: a.word || a.target,
                correct: a.correct,
                userAnswer: a.userAnswer,
                hintsUsed: a.hintsUsed || 0
            }))
        };
        
        // Save test result
        const testHistory = storageService.get(this.getStorageKey('testHistory'), {});
        if (!testHistory[this.exerciseType]) {
            testHistory[this.exerciseType] = [];
        }
        testHistory[this.exerciseType].push(testRecord);
        storageService.set(this.getStorageKey('testHistory'), testHistory);
                
        // Reset test state
        this.currentMode = 'practice';
        this.testConfig = null;
        this.testProgress = null;
        
        return result;
    }
    
    /**
     * Get practice stats summary
     */
    getPracticeStats(exerciseType = null) {
        const practiceStats = storageService.get('practiceStats', {});
        
        if (exerciseType) {
            return practiceStats[exerciseType] || null;
        }
        
        return practiceStats;
    }
    
    /**
     * Get test results
     */
    getTestResults(exerciseType = null, difficulty = null) {
        let results = storageService.get('testResults', []);
        
        if (exerciseType) {
            results = results.filter(r => r.exerciseType === exerciseType);
        }
        
        if (difficulty) {
            results = results.filter(r => r.difficulty === difficulty);
        }
        
        return results;
    }
    
    /**
     * Get recommended difficulty based on test/practice performance
     */
    getRecommendedDifficulty(exerciseType) {
        // Check recent test results
        const recentTests = this.getTestResults(exerciseType)
            .slice(-3); // Last 3 tests
        
        if (recentTests.length === 0) {
            return 'easy'; // Start with easy if no history
        }
        
        // Calculate average accuracy across recent tests
        const avgAccuracy = recentTests.reduce((sum, t) => sum + t.accuracy, 0) / recentTests.length;
        const avgHintsPerQ = recentTests.reduce((sum, t) => sum + parseFloat(t.hintsPerQuestion), 0) / recentTests.length;
        
        // Decision logic
        if (avgAccuracy >= 90 && avgHintsPerQ < 0.5) {
            return 'hard';
        } else if (avgAccuracy >= 75 && avgHintsPerQ < 1) {
            return 'medium';
        } else {
            return 'easy';
        }
    }
    
    /**
     * Calculate median from array of numbers
     */
    calculateMedian(arr) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    
    /**
     * Get current item processing time (for test mode)
     */
    getCurrentItemProcessingTime() {
        if (this.currentMode !== 'test' || !this.testProgress) {
            return null;
        }
        
        return Date.now() - this.testProgress.itemStartTime;
    }
    
    /**
     * Reset mode to practice and clear test state
     */
    resetMode() {
        this.currentMode = 'practice';
        this.testConfig = null;
        this.testProgress = null;
    }
}

export const modeService = new ModeService();
export default modeService;

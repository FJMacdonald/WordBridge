import storageService from './StorageService.js';
import { i18n } from '../core/i18n.js';

/**
 * Analytics service for detailed progress tracking and reporting
 */
class AnalyticsService {
    constructor() {
        this.cacheTimeout = 60000; // 1 minute cache
        this.cache = {};
    }
    
    /**
     * Get language-specific storage key
     */
    getStorageKey(baseKey) {
        const locale = i18n.getCurrentLocale();
        return `${baseKey}_${locale}`;
    }
    
    // ==================== DATA AGGREGATION ====================
    
    /**
     * Get comprehensive dashboard data
     */
    getDashboardData() {
        return {
            today: this.getTodayStats(),
            week: this.getWeeklyStats(),
            month: this.getMonthlyStats(),
            allTime: this.getAllTimeStats(),
            streak: this.getStreakData(),
            problemWords: this.getProblemWords(10),
            masteredWords: this.getMasteredWords(10),
            exerciseBreakdown: this.getExerciseBreakdown(),
            recentSessions: this.getRecentSessions(5),
            progressTrend: this.getProgressTrend(30)
        };
    }
    
    /**
     * Get today's statistics
     */
    getTodayStats() {
        const today = this.formatDate(new Date());
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        const todayData = dailyStats[today] || this.createEmptyDayStats();
        
        // Calculate accuracy for exercise types
        if (todayData.exerciseTypes) {
            Object.keys(todayData.exerciseTypes).forEach(type => {
                const typeData = todayData.exerciseTypes[type];
                typeData.accuracy = typeData.attempts > 0 
                    ? Math.round((typeData.correct / typeData.attempts) * 100)
                    : 0;
                typeData.totalTime = typeData.time || 0;
                typeData.totalAttempts = typeData.attempts || 0;
            });
        }
        
        return {
            date: today,
            practiceTime: todayData.totalTime || 0,
            practiceTimeFormatted: this.formatDuration(todayData.totalTime || 0),
            sessions: todayData.sessionsCount || 0,
            wordsAttempted: todayData.totalAttempts || 0,
            wordsCorrect: todayData.totalCorrect || 0,
            accuracy: this.calculateAccuracy(todayData.totalCorrect, todayData.totalAttempts),
            hintsUsed: todayData.hintsUsed || 0,
            exerciseTypes: todayData.exerciseTypes || {}
        };
    }

    getProblemWords(limit = 10) {
        const wordStats = storageService.get(this.getStorageKey('wordStats'), {});
        
        return Object.entries(wordStats)
            .map(([wordId, stats]) => ({
                word: wordId, // This might be the ID, need to look up actual word
                wordId,
                attempts: stats.attempts || 0,
                correct: stats.correct || 0,
                accuracy: stats.accuracy || 0,
                hintsUsed: stats.hintsUsed || 0,
                streak: stats.streak || 0,
                lastSeen: stats.lastSeen
            }))
            .filter(w => w.attempts >= 2 && w.accuracy < 70)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, limit);
    }    
    /**
     * Get weekly statistics
     */
    getWeeklyStats() {
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        const days = [];
        let totals = this.createEmptyDayStats();
        const dailyActivity = []; // Add this
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            const dayData = dailyStats[dateStr] || this.createEmptyDayStats();
            
            days.push({
                date: dateStr,
                dayName: date.toLocaleDateString('en', { weekday: 'short' }),
                ...dayData
            });
            
            // Add to daily activity for chart
            dailyActivity.push({
                label: date.toLocaleDateString('en', { weekday: 'short' }),
                value: dayData.totalAttempts || 0,
                time: dayData.totalTime || 0,
                accuracy: dayData.totalAttempts > 0 
                    ? Math.round((dayData.totalCorrect / dayData.totalAttempts) * 100)
                    : 0
            });
            
            totals.totalTime += dayData.totalTime || 0;
            totals.sessionsCount += dayData.sessionsCount || 0;
            totals.totalAttempts += dayData.totalAttempts || 0;
            totals.totalCorrect += dayData.totalCorrect || 0;
            totals.hintsUsed += dayData.hintsUsed || 0;
        }
        
        return {
            days,
            dailyActivity, // Add this
            totals: {
                ...totals,
                practiceTimeFormatted: this.formatDuration(totals.totalTime),
                accuracy: this.calculateAccuracy(totals.totalCorrect, totals.totalAttempts)
            }
        };

        }
    
    /**
     * Get monthly statistics
     */
    getMonthlyStats() {
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        const days = [];
        let totals = this.createEmptyDayStats();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            const dayData = dailyStats[dateStr] || null;
            
            days.push({
                date: dateStr,
                practiced: !!dayData,
                ...dayData
            });
            
            if (dayData) {
                totals.totalTime += dayData.totalTime || 0;
                totals.sessionsCount += dayData.sessionsCount || 0;
                totals.totalAttempts += dayData.totalAttempts || 0;
                totals.totalCorrect += dayData.totalCorrect || 0;
            }
        }
        
        const daysActive = days.filter(d => d.practiced).length;
        
        return {
            days,
            daysActive,
            totals: {
                ...totals,
                practiceTimeFormatted: this.formatDuration(totals.totalTime),
                accuracy: this.calculateAccuracy(totals.totalCorrect, totals.totalAttempts)
            }
        };
    }
    
    /**
     * Get all-time statistics
     */
    getAllTimeStats() {
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        const wordStats = storageService.get(this.getStorageKey('wordStats'), {});
        
        let totals = this.createEmptyDayStats();
        let firstDay = null;
        
        Object.entries(dailyStats).forEach(([date, data]) => {
            if (!firstDay || date < firstDay) firstDay = date;
            totals.totalTime += data.totalTime || 0;
            totals.sessionsCount += data.sessionsCount || 0;
            totals.totalAttempts += data.totalAttempts || 0;
            totals.totalCorrect += data.totalCorrect || 0;
        });
        
        const uniqueWords = Object.keys(wordStats).length;
        const masteredCount = Object.values(wordStats).filter(w => w.streak >= 3).length;
        
        return {
            startDate: firstDay,
            daysActive: Object.keys(dailyStats).length,
            totalPracticeTime: totals.totalTime,
            totalPracticeTimeFormatted: this.formatDuration(totals.totalTime),
            totalSessions: totals.sessionsCount,
            totalAttempts: totals.totalAttempts,
            totalCorrect: totals.totalCorrect,
            overallAccuracy: this.calculateAccuracy(totals.totalCorrect, totals.totalAttempts),
            uniqueWordsPracticed: uniqueWords,
            wordsMastered: masteredCount
        };
    }
    
    /**
     * Get streak data
     */
    getStreakData() {
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        const dates = Object.keys(dailyStats).sort();
        
        // Current streak
        let currentStreak = 0;
        const today = new Date();
        
        for (let i = 0; i <= 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = this.formatDate(checkDate);
            
            if (dailyStats[dateStr]) {
                currentStreak++;
            } else if (i > 0) { // Allow today to be empty
                break;
            }
        }
        
        // Longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        let prevDate = null;
        
        dates.forEach(date => {
            if (prevDate) {
                const prev = new Date(prevDate);
                const curr = new Date(date);
                const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
                
                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            } else {
                tempStreak = 1;
            }
            prevDate = date;
        });
        longestStreak = Math.max(longestStreak, tempStreak);
        
        return {
            current: currentStreak,
            longest: longestStreak,
            lastPracticed: dates[dates.length - 1] || null
        };
    }
    
    /**
     * Get problem words
     */
    getProblemWords(limit = 10) {
        const wordStats = storageService.get(this.getStorageKey('wordStats'), {});
        
        return Object.entries(wordStats)
            .map(([word, stats]) => ({
                word,
                attempts: stats.attempts || stats.totalAttempts || 0,
                correct: stats.correct || stats.correctAttempts || 0,
                accuracy: this.calculateAccuracy(
                    stats.correct || stats.correctAttempts || 0,
                    stats.attempts || stats.totalAttempts || 0
                ),
                hintsUsed: stats.hintsUsed || 0,
                streak: stats.streak || 0,
                lastSeen: stats.lastSeen
            }))
            .filter(w => w.attempts >= 2 && w.accuracy < 70)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, limit);
    }
    
    /**
     * Get mastered words
     */
    getMasteredWords(limit = 10) {
        const wordStats = storageService.get(this.getStorageKey('wordStats'), {});
        
        return Object.entries(wordStats)
            .map(([word, stats]) => ({
                word,
                attempts: stats.attempts || stats.totalAttempts || 0,
                correct: stats.correct || stats.correctAttempts || 0,
                accuracy: this.calculateAccuracy(
                    stats.correct || stats.correctAttempts || 0,
                    stats.attempts || stats.totalAttempts || 0
                ),
                streak: stats.streak || 0,
                lastSeen: stats.lastSeen
            }))
            .filter(w => w.streak >= 3 && w.accuracy >= 80)
            .sort((a, b) => b.streak - a.streak)
            .slice(0, limit);
    }
    
    /**
     * Get exercise type breakdown
     */
    getExerciseBreakdown(days = null) {
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        const breakdown = {};
        
        // Filter by date if days specified
        const cutoffTime = days ? Date.now() - (days * 24 * 60 * 60 * 1000) : 0;
        const filteredSessions = days 
            ? sessionHistory.filter(s => s.date >= cutoffTime)
            : sessionHistory;
        
        filteredSessions.forEach(session => {
            const type = session.exerciseType;
            if (!breakdown[type]) {
                breakdown[type] = {
                    sessions: 0,
                    totalAttempts: 0,
                    totalCorrect: 0,
                    totalTime: 0
                };
            }
            
            breakdown[type].sessions++;
            breakdown[type].totalAttempts += session.total || 0;
            breakdown[type].totalCorrect += session.correct || 0;
            breakdown[type].totalTime += session.duration || 0;
        });
        
        // Calculate averages
        Object.values(breakdown).forEach(data => {
            data.accuracy = this.calculateAccuracy(data.totalCorrect, data.totalAttempts);
            data.avgTimePerSession = data.sessions > 0 
                ? Math.round(data.totalTime / data.sessions / 1000) 
                : 0;
        });
        
        return breakdown;
    }
    
    /**
     * Get recent sessions
     */
    getRecentSessions(limit = 10) {
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        
        return sessionHistory
            .sort((a, b) => (b.date || 0) - (a.date || 0))
            .slice(0, limit)
            .map(session => ({
                ...session,
                dateFormatted: session.date 
                    ? new Date(session.date).toLocaleDateString()
                    : 'Unknown',
                accuracy: this.calculateAccuracy(session.correct, session.total)
            }));
    }
    
    /**
     * Get progress trend over time
     */
    getProgressTrend(days = 30) {
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        const trend = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            const dayData = dailyStats[dateStr];
            
            trend.push({
                date: dateStr,
                accuracy: dayData 
                    ? this.calculateAccuracy(dayData.totalCorrect, dayData.totalAttempts)
                    : null,
                attempts: dayData?.totalAttempts || 0,
                time: dayData?.totalTime || 0
            });
        }
        
        // Calculate moving average (7-day)
        for (let i = 0; i < trend.length; i++) {
            const window = trend.slice(Math.max(0, i - 6), i + 1);
            const validDays = window.filter(d => d.accuracy !== null);
            
            trend[i].movingAvg = validDays.length > 0
                ? Math.round(validDays.reduce((sum, d) => sum + d.accuracy, 0) / validDays.length)
                : null;
        }
        
        return trend;
    }
    
    /**
     * Get response time analytics
     */
    getResponseTimeAnalytics() {
        const wordStats = storageService.get(this.getStorageKey('wordStats'), {});
        const times = [];
        
        Object.values(wordStats).forEach(stats => {
            if (stats.responseTimes && Array.isArray(stats.responseTimes)) {
                times.push(...stats.responseTimes);
            }
        });
        
        if (times.length === 0) {
            return { average: 0, median: 0, fastest: 0, slowest: 0 };
        }
        
        times.sort((a, b) => a - b);
        
        return {
            average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
            median: times[Math.floor(times.length / 2)],
            fastest: times[0],
            slowest: times[times.length - 1],
            count: times.length
        };
    }
    
    // ==================== HELPER FUNCTIONS ====================
    
    createEmptyDayStats() {
        return {
            totalTime: 0,
            sessionsCount: 0,
            totalAttempts: 0,
            totalCorrect: 0,
            hintsUsed: 0,
            exerciseTypes: {}
        };
    }
    
    calculateAccuracy(correct, total) {
        if (!total || total === 0) return 0;
        return Math.round((correct / total) * 100);
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatDuration(ms) {
        if (!ms) return '0m';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    }
    
    /**
     * Record hint usage in daily stats
     */
    recordDailyHint() {
        const today = this.formatDate(new Date());
        const dailyStats = storageService.get(this.getStorageKey('dailyStats'), {});
        
        if (!dailyStats[today]) {
            dailyStats[today] = this.createEmptyDayStats();
        }
        
        dailyStats[today].hintsUsed = (dailyStats[today].hintsUsed || 0) + 1;
        storageService.set('dailyStats', dailyStats);
    }
    
    getStatsForTimeRange(timeRange) {
        switch(timeRange) {
            case 'today':
                return this.getTodayStats();
            case 'week':
            case '7days':
                return this.getWeeklyStats().totals;
            case 'month':
            case '30days':
                return this.getMonthlyStats().totals;
            case 'all':
                return this.getAllTimeStats();
            default:
                return this.getWeeklyStats().totals;
        }
    }

    // Add to getDashboardData return:
    getDashboardData() {
        const data = {
            today: this.getTodayStats(),
            week: this.getWeeklyStats(),
            month: this.getMonthlyStats(),
            allTime: this.getAllTimeStats(),
            streak: this.getStreakData(),
            problemWords: this.getProblemWords(10),
            masteredWords: this.getMasteredWords(10),
            exerciseBreakdown: this.getExerciseBreakdown(),
            recentSessions: this.getRecentSessions(5),
            progressTrend: this.getProgressTrend(30)
        };
        
        // Add derived stats for visualization
        data.today.practiceTimeFormatted = this.formatDuration(data.today.practiceTime);
        data.week.totals.practiceTimeFormatted = this.formatDuration(data.week.totals.totalTime);
        
        return data;
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
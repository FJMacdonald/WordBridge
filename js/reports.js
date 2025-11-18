/**
 * Reports Module
 * Handles session reports and weekly summaries
 */
const Reports = {
    createSessionReport(data) {
        const report = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: data.type,
            difficulty: data.difficulty,
            totalQuestions: data.results.length,
            correctCount: data.results.filter(r => r.correct).length,
            score: data.score,
            xpEarned: data.xpEarned,
            activeTimeSeconds: Math.round(data.activeTime),
            formattedTime: this.formatTime(data.activeTime),
            results: data.results,
            wordsToReview: data.results
                .filter(r => !r.correct || r.attempts > 1)
                .map(r => r.word)
        };
        
        // Store session
        this.storeSession(report);
        
        return report;
    },
    
    storeSession(report) {
        // Get existing sessions
        const sessions = Storage.get('sessions', []);
        sessions.push(report);
        
        // Keep last 100 sessions
        if (sessions.length > 100) {
            sessions.shift();
        }
        
        Storage.set('sessions', sessions);
        
        // Update weekly data
        this.updateWeeklyData(report);
    },
    
    updateWeeklyData(session) {
        const weekStart = this.getWeekStart();
        let weekData = Storage.get('weeklyData', {});
        
        // Initialize week if needed
        if (weekData.weekStart !== weekStart) {
            weekData = {
                weekStart: weekStart,
                sessions: [],
                totalActiveTime: 0,
                dailyPractice: {},
                exerciseStats: {}
            };
        }
        
        // Add session summary
        weekData.sessions.push({
            id: session.id,
            type: session.type,
            score: session.score,
            time: session.activeTimeSeconds
        });
        
        // Update totals
        weekData.totalActiveTime += session.activeTimeSeconds;
        
        // Mark today as practiced
        const today = new Date().toDateString();
        weekData.dailyPractice[today] = true;
        
        // Update exercise-specific stats
        if (!weekData.exerciseStats[session.type]) {
            weekData.exerciseStats[session.type] = {
                sessions: 0,
                totalScore: 0,
                totalTime: 0
            };
        }
        weekData.exerciseStats[session.type].sessions++;
        weekData.exerciseStats[session.type].totalScore += session.score;
        weekData.exerciseStats[session.type].totalTime += session.activeTimeSeconds;
        
        Storage.set('weeklyData', weekData);
    },
    
    getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        return monday.toDateString();
    },
    
    getWeeklySummary() {
        const weekData = Storage.get('weeklyData', null);
        
        if (!weekData) {
            return {
                totalSessions: 0,
                totalTime: 0,
                formattedTime: '0:00',
                daysActive: 0,
                avgScore: 0,
                dailyPractice: this.getWeekDays()
            };
        }
        
        const sessionCount = weekData.sessions.length;
        const avgScore = sessionCount > 0 
            ? Math.round(weekData.sessions.reduce((a, s) => a + s.score, 0) / sessionCount)
            : 0;
        
        return {
            totalSessions: sessionCount,
            totalTime: weekData.totalActiveTime,
            formattedTime: this.formatTime(weekData.totalActiveTime),
            daysActive: Object.keys(weekData.dailyPractice).length,
            avgScore: avgScore,
            dailyPractice: this.getWeekDays(weekData.dailyPractice),
            exerciseStats: weekData.exerciseStats
        };
    },
    
    getWeekDays(practiceData = {}) {
        const days = [];
        const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const today = new Date();
        const currentDay = today.getDay();
        
        // Get Monday of this week
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateStr = date.toDateString();
            
            days.push({
                label: dayNames[i],
                complete: !!practiceData[dateStr],
                isToday: dateStr === today.toDateString()
            });
        }
        
        return days;
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    generateEmailReport() {
        const summary = this.getWeeklySummary();
        const progress = Progress.state;
        
        const report = `
WordBridge Weekly Progress Report
=================================

Week Summary:
- Sessions Completed: ${summary.totalSessions}
- Total Practice Time: ${summary.formattedTime}
- Days Active: ${summary.daysActive}/7
- Average Score: ${summary.avgScore}%

Current Progress:
- Level: ${progress.level}
- Total XP: ${progress.xp}
- Current Streak: ${progress.streak} days

Keep up the great work!
        `.trim();
        
        return report;
    }
};
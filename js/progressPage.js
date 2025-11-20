// js/progressPage.js - Replace entire file
const ProgressPage = {
    
    render() {
        const container = document.getElementById('view-progress');
        const stats = this.getDetailedStats();
        const wordSummary = WordTracking.getStatsSummary();
        
        container.innerHTML = `
            <div class="progress-container">
                <button class="back-btn" onclick="app.goBack()">← Back</button>
                <h2>My Progress</h2>
                
                <!-- Overview Stats -->
                <div class="progress-overview">
                    <div class="overview-card">
                        <div class="overview-value">${stats.totalPracticeTime}</div>
                        <div class="overview-label">Total Practice</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-value">${stats.totalSessions}</div>
                        <div class="overview-label">Sessions</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-value">${wordSummary.masteredWordCount}</div>
                        <div class="overview-label">Mastered</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-value">${stats.averageAccuracy}%</div>
                        <div class="overview-label">Accuracy</div>
                    </div>
                </div>
                
                <!-- This Week -->
                <div class="progress-section">
                    <h3>This Week</h3>
                    <div class="week-detail-chart">
                        ${this.renderWeekDetailChart(stats.weeklyData)}
                    </div>
                </div>
                
                <!-- Words to Practice - Collapsible -->
                <details class="progress-section collapsible ${wordSummary.problemWordCount > 0 ? 'has-items' : ''}">
                    <summary class="section-toggle">
                        <span>⚠️ Words to Practice (${wordSummary.problemWordCount})</span>
                        <span class="toggle-arrow">▼</span>
                    </summary>
                    <p class="section-hint">Get 3 correct in a row to clear these</p>
                    ${this.renderWordList(wordSummary.problemWords, 'problem')}
                </details>
                
                <!-- Mastered Words - Collapsible -->
                <details class="progress-section collapsible">
                    <summary class="section-toggle">
                        <span>⭐ Mastered Words (${wordSummary.masteredWordCount})</span>
                        <span class="toggle-arrow">▼</span>
                    </summary>
                    <p class="section-hint">These appear less often now</p>
                    ${this.renderWordList(wordSummary.masteredWords, 'mastered')}
                </details>
                
                <!-- Share with Therapist -->
                <div class="progress-section">
                    <h3>📋 Share with Therapist</h3>
                    <p class="section-description">Download a summary to share with your speech therapist.</p>
                    <button class="btn-primary" onclick="ProgressPage.downloadReport()">
                        📊 Download Progress Report
                    </button>
                </div>
            </div>
        `;
    },
    
    getDetailedStats() {
        const progress = Storage.get('progress', {});
        const sessions = Storage.get('sessions', []);
        
        // Calculate total practice time
        let totalSeconds = progress.totalActiveTime || 0;
        let totalPracticeTime;
        if (totalSeconds < 60) {
            totalPracticeTime = `${Math.round(totalSeconds)}s`;
        } else if (totalSeconds < 3600) {
            totalPracticeTime = `${Math.round(totalSeconds / 60)}m`;
        } else {
            const hours = Math.floor(totalSeconds / 3600);
            const mins = Math.round((totalSeconds % 3600) / 60);
            totalPracticeTime = `${hours}h ${mins}m`;
        }
        
        // Get weekly data with actual tracking
        const weeklyData = this.getWeeklyChartData(sessions);
        
        return {
            totalPracticeTime,
            totalSessions: progress.totalSessions || 0,
            currentStreak: progress.streak || 0,
            longestStreak: progress.longestStreak || progress.streak || 0,
            weeklyData
        };
    },
    
    getWeeklyChartData(sessions) {
        const days = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDay = today.getDay();
        
        // Get Monday of this week
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        // Group sessions by day
        const sessionsByDay = {};
        
        sessions.forEach(session => {
            const sessionDate = new Date(session.timestamp || session.id);
            sessionDate.setHours(0, 0, 0, 0);
            const dateStr = sessionDate.toDateString();
            
            if (!sessionsByDay[dateStr]) {
                sessionsByDay[dateStr] = { 
                    time: 0, 
                    sessions: 0, 
                    words: 0,
                    correct: 0
                };
            }
            
            sessionsByDay[dateStr].time += session.activeTimeSeconds || session.duration || 0;
            sessionsByDay[dateStr].sessions++;
            sessionsByDay[dateStr].words += session.totalQuestions || session.total || 0;
            sessionsByDay[dateStr].correct += session.correctCount || session.correct || 0;
        });
        
        // Also check progress dailyPractice for historical data
        const progressData = Storage.get('progress', {});
        const weekData = progressData.weeklyData;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateStr = date.toDateString();
            const dayData = sessionsByDay[dateStr] || { time: 0, sessions: 0, words: 0, correct: 0 };
            
            // Check weeklyData.dailyPractice as fallback
            const practiced = dayData.sessions > 0 || 
                              (weekData?.dailyPractice && weekData.dailyPractice[dateStr]);
            
            days.push({
                label: dayNames[i],
                date: dateStr,
                minutes: Math.round(dayData.time / 60),
                seconds: Math.round(dayData.time),
                sessions: dayData.sessions,
                words: dayData.words,
                correct: dayData.correct,
                isToday: dateStr === today.toDateString(),
                isPast: date < today,
                practiced: practiced
            });
        }
        
        return days;
    },
    
    renderWeekDetailChart(weeklyData) {
        const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 5);
        
        return `
            <div class="week-days-detail">
                ${weeklyData.map(day => {
                    const height = day.minutes > 0 ? Math.max((day.minutes / maxMinutes) * 100, 15) : 0;
                    const timeDisplay = day.seconds > 0 
                        ? (day.minutes > 0 ? `${day.minutes}m` : `${day.seconds}s`)
                        : '-';
                    
                    return `
                        <div class="day-detail ${day.isToday ? 'today' : ''} ${day.practiced ? 'practiced' : ''} ${!day.isPast && !day.isToday ? 'future' : ''}">
                            <div class="day-bar-container">
                                <div class="day-bar" style="height: ${height}%"></div>
                            </div>
                            <div class="day-label">${day.label}</div>
                            <div class="day-stats">
                                <span class="day-time">${timeDisplay}</span>
                                ${day.words > 0 ? `<span class="day-words">${day.words} words</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderWordList(words, type) {
        if (words.length === 0) {
            const message = type === 'problem' 
                ? '🎉 No problem words - great work!' 
                : 'Keep practicing to master words!';
            return `<div class="empty-word-list">${message}</div>`;
        }
        
        // Get category info for each word
        const wordsWithCategory = words.map(item => {
            const category = this.findWordCategory(item.word);
            return { ...item, category };
        });
        
        const typeIcons = {
            naming: '🖼️',
            sentences: '📝',
            categories: '🏷️',
            speak: '🗣️',
            unknown: '📝'
        };
        
        const typeLabels = {
            naming: 'Picture Naming',
            sentences: 'Sentences',
            categories: 'Categories',
            speak: 'Speaking',
            unknown: 'Exercise'
        };
        
        return `
            <div class="compact-word-list ${type}-list">
                ${wordsWithCategory.map(item => `
                    <div class="compact-word-item">
                        <span class="word-category-icon" title="${typeLabels[item.category]}">${typeIcons[item.category]}</span>
                        <span class="word-name">${item.word}</span>
                        <span class="word-category-label">${typeLabels[item.category]}</span>
                        ${type === 'problem' ? `
                            <span class="word-stat problem">${item.ratio}</span>
                            <button class="word-action" onclick="ProgressPage.resetWord('${item.word}')" title="Reset progress">↺</button>
                        ` : `
                            <span class="word-stat mastered">${item.accuracy}%</span>
                            <button class="word-action" onclick="ProgressPage.unmasterWord('${item.word}')" title="Practice again">↺</button>
                        `}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    findWordCategory(word) {
        const types = ['naming', 'sentences', 'categories', 'speak'];
        
        // Check built-in exercises
        for (const type of types) {
            if (typeof ExerciseData !== 'undefined' && ExerciseData[type]) {
                const found = ExerciseData[type].find(ex => ex.answer === word);
                if (found) return type;
            }
        }
        
        // Check custom exercises
        const custom = Storage.get('customExercises', {});
        for (const type of types) {
            if (custom[type]) {
                const found = custom[type].find(ex => ex.answer === word);
                if (found) return type;
            }
        }
        
        return 'unknown';
    },
    
    resetWord(word) {
        WordTracking.resetProblemWord(word);
        this.render();
    },
    
    unmasterWord(word) {
        WordTracking.unmasterWord(word);
        this.render();
    },
    
    downloadReport() {
        const stats = this.getDetailedStats();
        const wordSummary = WordTracking.getStatsSummary();
        const today = new Date();
        
        const typeLabels = {
            naming: 'Picture Naming',
            sentences: 'Sentences',
            categories: 'Categories',
            speak: 'Speaking'
        };
        
        let report = `
WORDBRIDGE PROGRESS REPORT
==========================
Generated: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}

SUMMARY
-------
Total Practice Time: ${stats.totalPracticeTime}
Total Sessions: ${stats.totalSessions}
Current Streak: ${stats.currentStreak} days
Words Attempted: ${wordSummary.totalWordsAttempted}
Words Mastered: ${wordSummary.masteredWordCount}
Problem Words: ${wordSummary.problemWordCount}

THIS WEEK'S PRACTICE
--------------------
`;
        
        stats.weeklyData.forEach(day => {
            const dateObj = new Date(day.date);
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            if (day.practiced || day.words > 0) {
                const timeStr = day.minutes > 0 ? `${day.minutes} min` : `${day.seconds} sec`;
                report += `${dateStr}: ${timeStr}, ${day.words} words practiced`;
                if (day.words > 0 && day.correct > 0) {
                    const accuracy = Math.round((day.correct / day.words) * 100);
                    report += ` (${accuracy}% correct)`;
                }
                report += '\n';
            } else if (day.isPast || day.isToday) {
                report += `${dateStr}: No practice\n`;
            }
        });
        
        if (wordSummary.problemWords.length > 0) {
            report += `
WORDS NEEDING PRACTICE
----------------------
`;
            wordSummary.problemWords.forEach(w => {
                const category = this.findWordCategory(w.word);
                report += `• ${w.word} (${typeLabels[category] || 'Unknown'}) - ${w.ratio} incorrect, ${w.accuracy}% accuracy\n`;
            });
        }
        
        if (wordSummary.masteredWords.length > 0) {
            report += `
MASTERED WORDS
--------------
`;
            wordSummary.masteredWords.forEach(w => {
                const category = this.findWordCategory(w.word);
                report += `• ${w.word} (${typeLabels[category] || 'Unknown'}) - ${w.accuracy}% accuracy, mastered ${w.masteredAt}\n`;
            });
        }
        
        report += `
==========================
Report generated by WordBridge
`;
        
        this.downloadFile(report, `wordbridge-progress-${today.toISOString().split('T')[0]}.txt`, 'text/plain');
    },
    
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
};
import { t } from '../../core/i18n.js';
import analyticsService from '../../services/AnalyticsService.js';
import pdfService from '../../services/PDFService.js';

/**
 * Progress/Analytics page
 */
class ProgressPage {
    constructor(container) {
        this.container = container;
    }
    
    render() {
        const data = analyticsService.getDashboardData();
        
        this.container.innerHTML = `
            <div class="progress-page">
                <header class="page-header">
                    <h2>Your Progress</h2>
                    <button class="btn btn--secondary" id="export-pdf-btn">
                        📄 Export Report
                    </button>
                </header>
                
                <!-- Streak Banner -->
                <div class="streak-banner ${data.streak.current > 0 ? 'active' : ''}">
                    <span class="streak-icon">🔥</span>
                    <span class="streak-count">${data.streak.current}</span>
                    <span class="streak-label">day streak!</span>
                </div>
                
                <!-- Today's Stats -->
                <section class="stats-section">
                    <h3>Today</h3>
                    <div class="stats-grid">
                        ${this.renderStatCard('⏱️', data.today.practiceTimeFormatted, 'Practice Time')}
                        ${this.renderStatCard('📝', data.today.wordsAttempted, 'Words Practiced')}
                        ${this.renderStatCard('✓', data.today.accuracy + '%', 'Accuracy')}
                        ${this.renderStatCard('💡', data.today.hintsUsed, 'Hints Used')}
                    </div>
                </section>
                
                <!-- Weekly Chart -->
                <section class="stats-section">
                    <h3>This Week</h3>
                    <div class="week-chart">
                        ${this.renderWeekChart(data.week.days)}
                    </div>
                    <div class="week-summary">
                        <span>${data.week.totals.practiceTimeFormatted} total</span>
                        <span>${data.week.totals.totalAttempts} words</span>
                        <span>${data.week.totals.accuracy}% accuracy</span>
                    </div>
                </section>
                
                <!-- All Time Stats -->
                <section class="stats-section">
                    <h3>All Time</h3>
                    <div class="stats-grid">
                        ${this.renderStatCard('📅', data.allTime.daysActive, 'Days Active')}
                        ${this.renderStatCard('⏱️', data.allTime.totalPracticeTimeFormatted, 'Total Time')}
                        ${this.renderStatCard('📚', data.allTime.uniqueWordsPracticed, 'Words Practiced')}
                        ${this.renderStatCard('🏆', data.allTime.wordsMastered, 'Mastered')}
                    </div>
                </section>
                
                <!-- Problem Words -->
                ${data.problemWords.length > 0 ? `
                <section class="stats-section">
                    <h3>⚠️ Needs Practice</h3>
                    <div class="word-list problem-words">
                        ${data.problemWords.map(w => `
                            <div class="word-item problem">
                                <span class="word-text">${w.word}</span>
                                <span class="word-stat">${w.accuracy}%</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
                ` : ''}
                
                <!-- Mastered Words -->
                ${data.masteredWords.length > 0 ? `
                <section class="stats-section">
                    <h3>✓ Mastered</h3>
                    <div class="word-list mastered-words">
                        ${data.masteredWords.map(w => `
                            <div class="word-item mastered">
                                <span class="word-text">${w.word}</span>
                                <span class="word-stat">${w.streak} streak</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
                ` : ''}
                
                <!-- Exercise Breakdown -->
                <section class="stats-section">
                    <h3>By Exercise Type</h3>
                    <div class="exercise-breakdown">
                        ${Object.entries(data.exerciseBreakdown).map(([type, stats]) => `
                            <div class="exercise-stat-row">
                                <span class="exercise-name">${this.formatExerciseType(type)}</span>
                                <div class="exercise-bar-container">
                                    <div class="exercise-bar" style="width: ${stats.accuracy}%"></div>
                                </div>
                                <span class="exercise-accuracy">${stats.accuracy}%</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
                
                <!-- Recent Sessions -->
                <section class="stats-section">
                    <h3>Recent Sessions</h3>
                    <div class="session-list">
                        ${data.recentSessions.map(session => `
                            <div class="session-item">
                                <span class="session-type">${this.formatExerciseType(session.exerciseType)}</span>
                                <span class="session-date">${session.dateFormatted}</span>
                                <span class="session-score">${session.correct}/${session.total}</span>
                                <span class="session-accuracy">${session.accuracy}%</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
                
                <button class="btn btn--ghost back-btn" id="back-btn">
                    ← Back to Home
                </button>
            </div>
        `;
        
        this.attachListeners();
    }
    
    renderStatCard(icon, value, label) {
        return `
            <div class="stat-card">
                <span class="stat-icon">${icon}</span>
                <span class="stat-value">${value}</span>
                <span class="stat-label">${label}</span>
            </div>
        `;
    }
    
    renderWeekChart(days) {
        const maxAttempts = Math.max(...days.map(d => d.totalAttempts || 0), 1);
        
        return `
            <div class="chart-bars">
                ${days.map(day => {
                    const height = ((day.totalAttempts || 0) / maxAttempts) * 100;
                    const accuracy = day.totalAttempts > 0 
                        ? Math.round((day.totalCorrect / day.totalAttempts) * 100)
                        : 0;
                    
                    return `
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" 
                                 style="height: ${Math.max(height, 5)}%"
                                 data-accuracy="${accuracy}">
                            </div>
                            <span class="chart-label">${day.dayName}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    formatExerciseType(type) {
        const names = {
            naming: 'Picture Naming',
            listening: 'Listening',
            speaking: 'Speaking',
            typing: 'Word Typing',
            sentenceTyping: 'Sentence Completion',
            category: 'Categories',
            rhyming: 'Rhyming',
            firstSound: 'First Sounds',
            association: 'Association',
            synonyms: 'Synonyms',
            definitions: 'Definitions',
            scramble: 'Scramble'
        };
        return names[type] || type;
    }
    
    attachListeners() {
        this.container.querySelector('#export-pdf-btn')?.addEventListener('click', () => {
            pdfService.generateProgressReport();
        });
        
        this.container.querySelector('#back-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
        });
    }

}

export default ProgressPage;
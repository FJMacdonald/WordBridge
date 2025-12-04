// ui/pages/ProgressPage.js - ENHANCED VERSION with exercise grid and test comparison
import { t } from '../../core/i18n.js';

import assessmentService from '../../services/AssessmentService.js';
import pdfService from '../../services/PDFService.js';
import analyticsService from '../../services/AnalyticsService.js';
import trackingService from '../../services/TrackingService.js';


class ProgressPage {
    constructor(container) {
        this.container = container;
        this.selectedExercise = null;
        this.selectedTests = []; // For comparison
    }
    
    // Exercise type definitions matching home page
    getExerciseTypes() {
        return {
            words: [
                { key: 'naming', name: 'Picture Naming', icon: '🖼️' },
                { key: 'typing', name: 'Typing', icon: '⌨️' },
                { key: 'sentenceTyping', name: 'Fill Blank', icon: '📝' },
                { key: 'category', name: 'Categories', icon: '📁' }
            ],
            phonetics: [
                { key: 'listening', name: 'Listening', icon: '👂' },
                { key: 'speaking', name: 'Speaking', icon: '🎤' },
                { key: 'firstSound', name: 'First Sounds', icon: '🔤' },
                { key: 'rhyming', name: 'Rhyming', icon: '🎵' }
            ],
            meaning: [
                { key: 'definitions', name: 'Definitions', icon: '📖' },
                { key: 'association', name: 'Association', icon: '🔗' },
                { key: 'synonyms', name: 'Synonyms', icon: '≈' },
                { key: 'scramble', name: 'Unscramble', icon: '🔀' }
            ],
            time: [
                { key: 'clockMatching', name: 'Clock Matching', icon: '🕐' },
                { key: 'timeSequencing', name: 'Time Sequencing', icon: '📅' },
                { key: 'timeOrdering', name: 'Time Ordering', icon: '⏰' },
                { key: 'workingMemory', name: 'Working Memory', icon: '🧠' }
            ]
        };
    }
    
    getAllExerciseTypes() {
        const categories = this.getExerciseTypes();
        return [
            ...categories.words,
            ...categories.phonetics,
            ...categories.meaning,
            ...categories.time
        ];
    }
    
    render() {
        const categoryInfo = {
            words: { name: t('home.categories.words'), icon: '📚' },
            phonetics: { name: t('home.categories.phonetics'), icon: '🔊' },
            meaning: { name: t('home.categories.meaning'), icon: '💡' },
            time: { name: t('home.categories.time'), icon: '⏰' }
        };
        
        this.container.innerHTML = `
            <div class="progress-page">
                <header class="page-header">
                    <h2>${t('progress.title')}</h2>
                    <div class="header-actions">
                        <button class="btn btn--primary" id="export-report-btn">
                            📊 ${t('progress.viewReport')}
                        </button>
                    </div>
                </header>
                
                <!-- Summary Stats -->
                <div class="progress-summary" id="progress-summary"></div>
                
                <!-- Tab Navigation -->
                <div class="progress-tabs">
                    <button class="tab-btn active" data-tab="exercises">
                        📚 Exercises
                    </button>
                    <button class="tab-btn" data-tab="tests">
                        📋 Test History
                    </button>
                    <button class="tab-btn" data-tab="recommendations">
                        💡 Insights
                    </button>
                </div>
                
                <!-- Exercises Tab - Home page style grid -->
                <div class="tab-content" id="exercises-tab">
                    <div class="time-range-controls">
                        <button class="time-btn active" data-range="today">${t('progress.timeRanges.day')}</button>
                        <button class="time-btn" data-range="week">${t('progress.timeRanges.week')}</button>
                        <button class="time-btn" data-range="month">${t('progress.timeRanges.month')}</button>
                        <button class="time-btn" data-range="all">${t('progress.timeRanges.all')}</button>
                    </div>
                    
                    <div class="exercise-progress-grid">
                        ${Object.entries(this.getExerciseTypes()).map(([category, exercises]) => `
                            <div class="category-card">
                                <div class="category-header">
                                    <h3 class="category-title">
                                        <span class="category-icon">${categoryInfo[category].icon}</span>
                                        ${categoryInfo[category].name}
                                    </h3>
                                </div>
                                <div class="exercise-grid">
                                    ${exercises.map(ex => `
                                        <div class="exercise-progress-card" data-exercise="${ex.key}">
                                            <div class="exercise-card-header">
                                                <span class="exercise-icon">${ex.icon}</span>
                                                <span class="exercise-name">${ex.name}</span>
                                            </div>
                                            <div class="exercise-stats" id="stats-${ex.key}">
                                                <div class="stat-loading">Loading...</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Test History Tab -->
                <div class="tab-content hidden" id="tests-tab">
                    <div class="test-history-container">
                        <div class="test-filter">
                            <label>Exercise Type:</label>
                            <select id="test-exercise-filter">
                                <option value="all">All Exercises</option>
                                ${this.getAllExerciseTypes().map(ex => 
                                    `<option value="${ex.key}">${ex.name}</option>`
                                ).join('')}
                            </select>
                            <button class="btn btn--secondary" id="compare-tests-btn" disabled>
                                Compare Selected
                            </button>
                        </div>
                        <div id="test-history-list" class="test-history-list"></div>
                        <div id="test-comparison" class="test-comparison hidden"></div>
                    </div>
                </div>
                
                <!-- Recommendations Tab -->
                <div class="tab-content hidden" id="recommendations-tab">
                    <div class="recommendations-section">
                        <h3>${t('progress.recommendations.title')}</h3>
                        <div id="recommendations"></div>
                    </div>
                    <div class="problem-words-section">
                        <h3>Words Needing Practice</h3>
                        <div id="problem-words"></div>
                    </div>
                    <div class="mastered-words-section">
                        <h3>Mastered Words</h3>
                        <div id="mastered-words"></div>
                    </div>
                </div>
                
                <!-- Exercise Detail Modal -->
                <div class="exercise-detail-modal hidden" id="exercise-detail-modal">
                    <div class="modal-content">
                        <button class="modal-close" id="close-modal">&times;</button>
                        <div id="exercise-detail-content"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Render initial data
        this.renderSummary();
        this.renderExerciseStats('today');
        this.renderTestHistory();
        this.renderRecommendations();
        this.renderProblemWords();
        this.renderMasteredWords();
        
        this.attachListeners();
    }
    
    renderSummary() {
        const container = document.getElementById('progress-summary');
        const breakdown = trackingService.getExerciseBreakdown();
        
        // Calculate totals
        let totalAttempts = 0;
        let totalCorrect = 0;
        let totalTime = 0;
        let totalTests = 0;
        let totalPracticeSessions = 0;
        
        Object.values(breakdown).forEach(stats => {
            totalAttempts += stats.totalAttempts;
            totalCorrect += stats.totalCorrect;
            totalTime += stats.totalTime;
            totalTests += stats.testCount;
            totalPracticeSessions += stats.practiceSessions;
        });
        
        const overallAccuracy = totalAttempts > 0 
            ? Math.round((totalCorrect / totalAttempts) * 100) 
            : 0;
        
        container.innerHTML = `
            <div class="summary-stats">
                <div class="summary-stat">
                    <span class="stat-value">${totalAttempts}</span>
                    <span class="stat-label">Total Questions</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${overallAccuracy}%</span>
                    <span class="stat-label">Overall Accuracy</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${this.formatTime(totalTime)}</span>
                    <span class="stat-label">Total Time</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${totalTests}</span>
                    <span class="stat-label">Tests Taken</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${totalPracticeSessions}</span>
                    <span class="stat-label">Practice Sessions</span>
                </div>
            </div>
        `;
    }
    
    renderExerciseStats(timeRange = 'today') {
        const breakdown = trackingService.getExerciseBreakdown();
        const stats = analyticsService.getStatsForTimeRange(timeRange);
        
        this.getAllExerciseTypes().forEach(exercise => {
            const container = document.getElementById(`stats-${exercise.key}`);
            if (!container) return;
            
            const exerciseBreakdown = breakdown[exercise.key] || {};
            const dailyStats = stats?.exerciseTypes?.[exercise.key] || {};
            
            // Use time-range specific data when available
            const attempts = dailyStats.attempts || dailyStats.totalAttempts || exerciseBreakdown.totalAttempts || 0;
            const correct = dailyStats.correct || exerciseBreakdown.totalCorrect || 0;
            const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
            const time = dailyStats.time || dailyStats.totalTime || exerciseBreakdown.totalTime || 0;
            const tests = exerciseBreakdown.testCount || 0;
            
            if (attempts === 0 && tests === 0) {
                container.innerHTML = `
                    <div class="no-data">
                        <span class="no-data-text">No practice yet</span>
                        <button class="btn btn--small start-practice" data-exercise="${exercise.key}">
                            Start
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="mini-stats">
                        <div class="mini-stat">
                            <span class="mini-value">${attempts}</span>
                            <span class="mini-label">Q</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-value ${accuracy >= 80 ? 'good' : accuracy >= 60 ? 'ok' : 'needs-work'}">${accuracy}%</span>
                            <span class="mini-label">Acc</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-value">${tests}</span>
                            <span class="mini-label">Tests</span>
                        </div>
                    </div>
                    <div class="accuracy-mini-bar">
                        <div class="accuracy-fill ${accuracy >= 80 ? 'good' : accuracy >= 60 ? 'ok' : 'needs-work'}" 
                             style="width: ${accuracy}%"></div>
                    </div>
                `;
            }
        });
        
        // Re-attach click listeners for start buttons
        this.container.querySelectorAll('.start-practice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const exerciseType = btn.dataset.exercise;
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
                // Could also directly start the exercise here
            });
        });
    }
    
    renderTestHistory(filterExercise = 'all') {
        const container = document.getElementById('test-history-list');
        const allTests = trackingService.getTestHistory();
        
        let tests = [];
        
        if (filterExercise === 'all') {
            // Combine all tests and sort by date
            Object.entries(allTests).forEach(([exerciseType, exerciseTests]) => {
                exerciseTests.forEach(test => {
                    tests.push({ ...test, exerciseType });
                });
            });
        } else {
            tests = (allTests[filterExercise] || []).map(t => ({ ...t, exerciseType: filterExercise }));
        }
        
        // Sort by date, newest first
        tests.sort((a, b) => b.date - a.date);
        
        if (tests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Tests Taken Yet</h3>
                    <p>Take a test to track your progress over time.</p>
                    <button class="btn btn--primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'assessment'}))">
                        Take a Test
                    </button>
                </div>
            `;
            return;
        }
        
        const exerciseInfo = {};
        this.getAllExerciseTypes().forEach(ex => {
            exerciseInfo[ex.key] = ex;
        });
        
        container.innerHTML = `
            <table class="test-history-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="select-all-tests"></th>
                        <th>Date</th>
                        <th>Exercise</th>
                        <th>Score</th>
                        <th>Accuracy</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tests.map(test => {
                        const exercise = exerciseInfo[test.exerciseType] || { icon: '❓', name: test.exerciseType };
                        const date = new Date(test.date).toLocaleDateString();
                        return `
                            <tr data-test-id="${test.id}" data-exercise="${test.exerciseType}">
                                <td><input type="checkbox" class="test-select" data-test-id="${test.id}"></td>
                                <td>${date}</td>
                                <td>
                                    <span class="exercise-icon">${exercise.icon}</span>
                                    ${exercise.name}
                                </td>
                                <td>${test.correct}/${test.total}</td>
                                <td>
                                    <span class="accuracy-badge ${test.accuracy >= 80 ? 'good' : test.accuracy >= 60 ? 'ok' : 'needs-work'}">
                                        ${test.accuracy}%
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn--small btn--ghost view-test" data-test-id="${test.id}">
                                        View
                                    </button>
                                    <button class="btn btn--small btn--ghost retry-test" data-test-id="${test.id}">
                                        Retry
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        // Attach test action listeners
        this.attachTestListeners();
    }
    
    attachTestListeners() {
        // Select all checkbox
        const selectAll = document.getElementById('select-all-tests');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = this.container.querySelectorAll('.test-select');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                this.updateCompareButton();
            });
        }
        
        // Individual checkboxes
        this.container.querySelectorAll('.test-select').forEach(cb => {
            cb.addEventListener('change', () => this.updateCompareButton());
        });
        
        // View test buttons
        this.container.querySelectorAll('.view-test').forEach(btn => {
            btn.addEventListener('click', () => {
                const testId = btn.dataset.testId;
                this.showTestDetail(testId);
            });
        });
        
        // Retry test buttons
        this.container.querySelectorAll('.retry-test').forEach(btn => {
            btn.addEventListener('click', () => {
                const testId = btn.dataset.testId;
                this.retryTest(testId);
            });
        });
    }
    
    updateCompareButton() {
        const selected = this.container.querySelectorAll('.test-select:checked');
        const compareBtn = document.getElementById('compare-tests-btn');
        
        if (compareBtn) {
            compareBtn.disabled = selected.length !== 2;
            
            if (selected.length === 2) {
                // Check if same exercise type
                const ids = Array.from(selected).map(cb => cb.dataset.testId);
                const rows = ids.map(id => this.container.querySelector(`tr[data-test-id="${id}"]`));
                const exercises = rows.map(r => r.dataset.exercise);
                
                if (exercises[0] !== exercises[1]) {
                    compareBtn.disabled = true;
                    compareBtn.title = 'Select tests from the same exercise type';
                } else {
                    compareBtn.title = '';
                }
            }
        }
    }
    
    showTestDetail(testId) {
        const test = trackingService.getTestById(testId);
        if (!test) return;
        
        const modal = document.getElementById('exercise-detail-modal');
        const content = document.getElementById('exercise-detail-content');
        
        const exerciseInfo = this.getAllExerciseTypes().find(ex => ex.key === test.exerciseType) || { icon: '❓', name: test.exerciseType };
        
        content.innerHTML = `
            <h3>${exerciseInfo.icon} ${exerciseInfo.name} Test</h3>
            <p class="test-date">Taken on ${new Date(test.date).toLocaleString()}</p>
            
            <div class="test-summary">
                <div class="test-stat">
                    <span class="stat-value">${test.correct}/${test.total}</span>
                    <span class="stat-label">Score</span>
                </div>
                <div class="test-stat">
                    <span class="stat-value">${test.accuracy}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
                <div class="test-stat">
                    <span class="stat-value">${test.hintsUsed || 0}</span>
                    <span class="stat-label">Hints Used</span>
                </div>
            </div>
            
            <h4>Question Details</h4>
            <div class="question-details">
                ${test.attempts.map((attempt, i) => `
                    <div class="question-item ${attempt.correct ? 'correct' : 'incorrect'}">
                        <span class="question-num">${i + 1}</span>
                        <span class="question-word">${attempt.word}</span>
                        <span class="question-result">${attempt.correct ? '✓' : '✗'}</span>
                        ${attempt.hintsUsed > 0 ? `<span class="hints-used">💡${attempt.hintsUsed}</span>` : ''}
                        ${attempt.responseTime ? `<span class="response-time">${(attempt.responseTime / 1000).toFixed(1)}s</span>` : ''}
                    </div>
                `).join('')}
            </div>
            
            <div class="modal-actions">
                <button class="btn btn--primary" id="retry-from-modal" data-test-id="${testId}">
                    Retry This Test
                </button>
            </div>
        `;
        
        modal.classList.remove('hidden');
        
        // Retry button in modal
        document.getElementById('retry-from-modal')?.addEventListener('click', () => {
            modal.classList.add('hidden');
            this.retryTest(testId);
        });
    }
    
    retryTest(testId) {
        const test = trackingService.getTestById(testId);
        if (!test) return;
        
        // Dispatch event to start test with same words
        window.dispatchEvent(new CustomEvent('startTest', {
            detail: {
                exerciseType: test.exerciseType,
                difficulty: test.testConfig?.difficulty || 'easy',
                questions: test.total,
                retryTestId: testId,
                wordList: test.wordList
            }
        }));
    }
    
    compareTests() {
        const selected = Array.from(this.container.querySelectorAll('.test-select:checked'))
            .map(cb => cb.dataset.testId);
        
        if (selected.length !== 2) return;
        
        const comparison = trackingService.compareTests(selected[0], selected[1]);
        if (!comparison) return;
        
        const comparisonContainer = document.getElementById('test-comparison');
        
        comparisonContainer.innerHTML = `
            <div class="comparison-header">
                <h3>Test Comparison</h3>
                <button class="btn btn--ghost close-comparison">&times;</button>
            </div>
            
            <div class="comparison-summary">
                <div class="comparison-test">
                    <h4>Test 1</h4>
                    <p class="test-date">${new Date(comparison.test1.date).toLocaleDateString()}</p>
                    <p class="test-score">${comparison.test1.correct}/${comparison.test1.total} (${comparison.test1.accuracy}%)</p>
                </div>
                <div class="comparison-arrow">
                    <span class="improvement ${comparison.improvement > 0 ? 'positive' : comparison.improvement < 0 ? 'negative' : ''}">
                        ${comparison.improvement > 0 ? '↑' : comparison.improvement < 0 ? '↓' : '→'}
                        ${Math.abs(comparison.improvement)}%
                    </span>
                </div>
                <div class="comparison-test">
                    <h4>Test 2</h4>
                    <p class="test-date">${new Date(comparison.test2.date).toLocaleDateString()}</p>
                    <p class="test-score">${comparison.test2.correct}/${comparison.test2.total} (${comparison.test2.accuracy}%)</p>
                </div>
            </div>
            
            <h4>Word by Word</h4>
            <div class="word-comparison">
                ${Object.entries(comparison.wordComparison).map(([wordId, data]) => {
                    const t1 = data.test1;
                    const t2 = data.test2;
                    
                    let changeIcon = '';
                    if (t1 && t2) {
                        if (!t1.correct && t2.correct) changeIcon = '📈'; // Improved
                        else if (t1.correct && !t2.correct) changeIcon = '📉'; // Regressed
                        else if (t1.correct && t2.correct) changeIcon = '✓'; // Consistent correct
                        else changeIcon = '✗'; // Consistent incorrect
                    }
                    
                    return `
                        <div class="word-compare-row">
                            <span class="word">${data.word}</span>
                            <span class="result test1 ${t1?.correct ? 'correct' : 'incorrect'}">
                                ${t1 ? (t1.correct ? '✓' : '✗') : '-'}
                            </span>
                            <span class="change-icon">${changeIcon}</span>
                            <span class="result test2 ${t2?.correct ? 'correct' : 'incorrect'}">
                                ${t2 ? (t2.correct ? '✓' : '✗') : '-'}
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        comparisonContainer.classList.remove('hidden');
        
        comparisonContainer.querySelector('.close-comparison')?.addEventListener('click', () => {
            comparisonContainer.classList.add('hidden');
        });
    }
    
    renderRecommendations() {
        const container = document.getElementById('recommendations');
        const breakdown = trackingService.getExerciseBreakdown();
        
        const recommendations = [];
        const exerciseTypes = this.getAllExerciseTypes();
        
        // Find exercises that need work
        const needsWork = [];
        const notStarted = [];
        
        exerciseTypes.forEach(ex => {
            const stats = breakdown[ex.key];
            if (!stats || stats.totalAttempts === 0) {
                notStarted.push(ex);
            } else if (stats.accuracy < 60) {
                needsWork.push({ ...ex, accuracy: stats.accuracy });
            }
        });
        
        // Add recommendations
        if (notStarted.length > 0) {
            recommendations.push({
                icon: '🎯',
                text: `Try these exercises you haven't started: ${notStarted.slice(0, 3).map(e => e.name).join(', ')}`,
                priority: 'medium'
            });
        }
        
        if (needsWork.length > 0) {
            needsWork.sort((a, b) => a.accuracy - b.accuracy);
            recommendations.push({
                icon: '📚',
                text: `Focus on improving: ${needsWork.slice(0, 3).map(e => `${e.name} (${e.accuracy}%)`).join(', ')}`,
                priority: 'high'
            });
        }
        
        // Check for consistency
        const quality = assessmentService.calculatePracticeQuality(7);
        if (quality) {
            if (quality.breakdown.consistency < 70) {
                recommendations.push({
                    icon: '📅',
                    text: t('progress.recommendations.consistency'),
                    priority: 'high'
                });
            }
            
            if (quality.breakdown.duration < 50) {
                recommendations.push({
                    icon: '⏱️',
                    text: t('progress.recommendations.duration'),
                    priority: 'medium'
                });
            }
            
            if (quality.breakdown.variety < 40) {
                recommendations.push({
                    icon: '🎨',
                    text: t('progress.recommendations.variety'),
                    priority: 'medium'
                });
            }
        }
        
        // Add positive feedback
        const goodExercises = exerciseTypes.filter(ex => {
            const stats = breakdown[ex.key];
            return stats && stats.accuracy >= 80 && stats.totalAttempts >= 10;
        });
        
        if (goodExercises.length > 0) {
            recommendations.push({
                icon: '⭐',
                text: `Great job on: ${goodExercises.map(e => e.name).join(', ')}!`,
                priority: 'positive'
            });
        }
        
        container.innerHTML = recommendations.length > 0
            ? recommendations.map(r => `
                <div class="recommendation-item ${r.priority}">
                    <span class="rec-icon">${r.icon}</span>
                    <span class="rec-text">${r.text}</span>
                </div>
            `).join('')
            : `<p class="success">${t('progress.recommendations.goodJob')}</p>`;
    }
    
    renderProblemWords() {
        const container = document.getElementById('problem-words');
        const problemWords = analyticsService.getProblemWords(10);
        
        if (problemWords.length === 0) {
            container.innerHTML = '<p class="empty-message">No problem words identified yet.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="word-list">
                ${problemWords.map(w => `
                    <div class="word-item problem">
                        <span class="word">${w.word}</span>
                        <span class="accuracy">${w.accuracy}%</span>
                        <span class="attempts">(${w.correct}/${w.attempts})</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderMasteredWords() {
        const container = document.getElementById('mastered-words');
        const masteredWords = analyticsService.getMasteredWords(10);
        
        if (masteredWords.length === 0) {
            container.innerHTML = '<p class="empty-message">Keep practicing to master words!</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="word-list">
                ${masteredWords.map(w => `
                    <div class="word-item mastered">
                        <span class="word">${w.word}</span>
                        <span class="accuracy">${w.accuracy}%</span>
                        <span class="streak">🔥${w.streak}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    formatTime(milliseconds) {
        if (!milliseconds || milliseconds === 0) return '0m';
        
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        } else if (minutes > 0) {
            const remainingSeconds = seconds % 60;
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    attachListeners() {
        // Tab switching
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const activeTab = btn.dataset.tab;
                this.container.querySelectorAll('.tab-content').forEach(content => {
                    if (content.id === `${activeTab}-tab`) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
                
                // Refresh content
                if (activeTab === 'tests') {
                    this.renderTestHistory();
                } else if (activeTab === 'recommendations') {
                    this.renderRecommendations();
                    this.renderProblemWords();
                    this.renderMasteredWords();
                }
            });
        });
        
        // Time range switching
        this.container.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderExerciseStats(btn.dataset.range);
            });
        });
        
        // Test filter
        const testFilter = document.getElementById('test-exercise-filter');
        if (testFilter) {
            testFilter.addEventListener('change', () => {
                this.renderTestHistory(testFilter.value);
            });
        }
        
        // Compare button
        const compareBtn = document.getElementById('compare-tests-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => this.compareTests());
        }
        
        // Export report button
        const exportBtn = this.container.querySelector('#export-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                pdfService.generateProgressReport();
            });
        }
        
        // Exercise cards click
        this.container.querySelectorAll('.exercise-progress-card').forEach(card => {
            card.addEventListener('click', () => {
                const exerciseType = card.dataset.exercise;
                this.showExerciseDetail(exerciseType);
            });
        });
        
        // Modal close
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('exercise-detail-modal').classList.add('hidden');
            });
        }
        
        // Close modal on background click
        const modal = document.getElementById('exercise-detail-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
    }
    
    showExerciseDetail(exerciseType) {
        const breakdown = trackingService.getExerciseBreakdown();
        const stats = breakdown[exerciseType] || {};
        const exerciseInfo = this.getAllExerciseTypes().find(ex => ex.key === exerciseType) || { icon: '❓', name: exerciseType };
        
        const modal = document.getElementById('exercise-detail-modal');
        const content = document.getElementById('exercise-detail-content');
        
        content.innerHTML = `
            <h3>${exerciseInfo.icon} ${exerciseInfo.name}</h3>
            
            <div class="detail-stats">
                <div class="detail-stat">
                    <span class="stat-value">${stats.totalAttempts || 0}</span>
                    <span class="stat-label">Total Questions</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${stats.accuracy || 0}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${this.formatTime(stats.totalTime || 0)}</span>
                    <span class="stat-label">Practice Time</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${stats.testCount || 0}</span>
                    <span class="stat-label">Tests Taken</span>
                </div>
            </div>
            
            <h4>Difficulty Breakdown</h4>
            <div class="difficulty-breakdown">
                ${['easy', 'medium', 'hard'].map(diff => {
                    const diffStats = stats.byDifficulty?.[diff] || { attempts: 0, correct: 0 };
                    const diffAccuracy = diffStats.attempts > 0 
                        ? Math.round((diffStats.correct / diffStats.attempts) * 100) 
                        : 0;
                    return `
                        <div class="difficulty-row">
                            <span class="diff-label">${diff.charAt(0).toUpperCase() + diff.slice(1)}</span>
                            <div class="diff-bar-container">
                                <div class="diff-bar" style="width: ${diffAccuracy}%"></div>
                            </div>
                            <span class="diff-value">${diffAccuracy}% (${diffStats.correct}/${diffStats.attempts})</span>
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${stats.tests && stats.tests.length > 0 ? `
                <h4>Recent Tests</h4>
                <div class="recent-tests">
                    ${stats.tests.map(test => `
                        <div class="recent-test-item">
                            <span class="test-date">${new Date(test.date).toLocaleDateString()}</span>
                            <span class="test-score">${test.correct}/${test.total}</span>
                            <span class="test-accuracy ${test.accuracy >= 80 ? 'good' : test.accuracy >= 60 ? 'ok' : 'needs-work'}">${test.accuracy}%</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="modal-actions">
                <button class="btn btn--primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'home'}))">
                    Practice Now
                </button>
                <button class="btn btn--secondary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'assessment'}))">
                    Take Test
                </button>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
}

export default ProgressPage;

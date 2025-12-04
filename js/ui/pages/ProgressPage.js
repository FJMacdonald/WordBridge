// ui/pages/ProgressPage.js - Mirrors home page layout with exercise cards
import { t } from '../../core/i18n.js';
import assessmentService from '../../services/AssessmentService.js';
import pdfService from '../../services/PDFService.js';
import analyticsService from '../../services/AnalyticsService.js';
import storageService from '../../services/StorageService.js';
import { i18n } from '../../core/i18n.js';

class ProgressPage {
    constructor(container) {
        this.container = container;
        this.selectedTests = [];
    }
    
    /**
     * Get language-specific storage key
     */
    getStorageKey(baseKey) {
        const locale = i18n.getCurrentLocale();
        return `${baseKey}_${locale}`;
    }
    
    render() {
        const categoryOrder = ['words', 'phonetics', 'meaning', 'time'];
        
        const categoryInfo = {
            words: {
                name: t('home.categories.words'),
                icon: '📚'
            },
            phonetics: {
                name: t('home.categories.phonetics'),
                icon: '🔊'
            },
            meaning: {
                name: t('home.categories.meaning'),
                icon: '💡'
            },
            time: {
                name: t('home.categories.time'),
                icon: '⏰'
            }
        };
        
        const exercisesByCategory = {
            words: [
                { type: 'naming', icon: '🖼️' },
                { type: 'typing', icon: '⌨️' },
                { type: 'sentenceTyping', icon: '📝' },
                { type: 'category', icon: '📁' }
            ],
            phonetics: [
                { type: 'listening', icon: '👂' },
                { type: 'speaking', icon: '🎤' },
                { type: 'firstSound', icon: '🔤' },
                { type: 'rhyming', icon: '🎵' }
            ],
            meaning: [
                { type: 'definitions', icon: '📖' },
                { type: 'association', icon: '🔗' },
                { type: 'synonyms', icon: '≈' },
                { type: 'scramble', icon: '🔀' }
            ],
            time: [
                { type: 'clockMatching', icon: '🕐' },
                { type: 'timeSequencing', icon: '📅' },
                { type: 'timeOrdering', icon: '⏰' },
                { type: 'workingMemory', icon: '🧠' }
            ]
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
                
                <!-- Summary Stats Bar -->
                <div class="progress-summary" id="progress-summary"></div>
                
                <!-- Category Grid - Same layout as home page -->
                <div class="category-grid">
                    ${categoryOrder.map(category => {
                        const exercises = exercisesByCategory[category];
                        return `
                        <div class="category-card">
                            <div class="category-header">
                                <h3 class="category-title">
                                    <span class="category-icon">${categoryInfo[category].icon}</span>
                                    ${categoryInfo[category].name}
                                </h3>
                            </div>
                            <div class="exercise-grid">
                                ${exercises.map(ex => `
                                <button class="exercise-card progress-card" 
                                        data-type="${ex.type}">
                                    <span class="exercise-icon">${ex.icon}</span>
                                    <span class="exercise-name">${t('exercises.' + ex.type + '.name')}</span>
                                    <div class="exercise-mini-stats" id="mini-stats-${ex.type}">
                                        <span class="loading-dots">...</span>
                                    </div>
                                </button>
                                `).join('')}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Exercise Detail Modal -->
                <div class="modal-overlay hidden" id="exercise-modal">
                    <div class="modal-content">
                        <button class="modal-close" id="close-modal">&times;</button>
                        <div id="modal-body"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Load data and render
        this.renderSummary();
        this.renderExerciseCards();
        this.attachListeners();
    }
    
    renderSummary() {
        const container = document.getElementById('progress-summary');
        
        // Get all assessment history
        const assessmentHistory = assessmentService.getAssessmentHistory();
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        
        // Calculate totals from session history
        let totalAttempts = 0;
        let totalCorrect = 0;
        let totalTime = 0;
        let testSessions = 0;
        let practiceSessions = 0;
        
        sessionHistory.forEach(session => {
            totalAttempts += session.total || 0;
            totalCorrect += session.correct || 0;
            totalTime += session.activeTime || session.duration || 0;
            
            if (session.mode === 'test') {
                testSessions++;
            } else {
                practiceSessions++;
            }
        });
        
        // Also count assessments
        testSessions = Math.max(testSessions, assessmentHistory.length);
        
        const overallAccuracy = totalAttempts > 0 
            ? Math.round((totalCorrect / totalAttempts) * 100) 
            : 0;
        
        container.innerHTML = `
            <div class="summary-stats">
                <div class="summary-stat">
                    <span class="stat-value">${totalAttempts}</span>
                    <span class="stat-label">${t('progress.totalQuestions')}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${overallAccuracy}%</span>
                    <span class="stat-label">${t('progress.accuracy')}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${this.formatTime(totalTime)}</span>
                    <span class="stat-label">${t('progress.totalTime')}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${testSessions}</span>
                    <span class="stat-label">${t('progress.testsTaken')}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${practiceSessions}</span>
                    <span class="stat-label">${t('progress.practiceSessions')}</span>
                </div>
            </div>
        `;
    }
    
    renderExerciseCards() {
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        const assessmentHistory = assessmentService.getAssessmentHistory();
        
        // Group sessions by exercise type
        const statsByType = {};
        
        sessionHistory.forEach(session => {
            const type = session.exerciseType;
            if (!statsByType[type]) {
                statsByType[type] = {
                    attempts: 0,
                    correct: 0,
                    time: 0,
                    practiceSessions: 0,
                    testSessions: 0,
                    tests: []
                };
            }
            
            statsByType[type].attempts += session.total || 0;
            statsByType[type].correct += session.correct || 0;
            statsByType[type].time += session.activeTime || session.duration || 0;
            
            if (session.mode === 'test') {
                statsByType[type].testSessions++;
                statsByType[type].tests.push({
                    id: session.id,
                    date: session.date,
                    correct: session.correct,
                    total: session.total,
                    accuracy: session.accuracy
                });
            } else {
                statsByType[type].practiceSessions++;
            }
        });
        
        // Also include assessment history
        assessmentHistory.forEach(assessment => {
            const type = assessment.metadata?.exerciseType || assessment.results?.exerciseType;
            if (type) {
                if (!statsByType[type]) {
                    statsByType[type] = {
                        attempts: 0,
                        correct: 0,
                        time: 0,
                        practiceSessions: 0,
                        testSessions: 0,
                        tests: []
                    };
                }
                
                statsByType[type].testSessions++;
                statsByType[type].tests.push({
                    id: assessment.id,
                    date: assessment.date,
                    correct: assessment.results?.overallScore || 0,
                    total: assessment.results?.totalQuestions || 10,
                    accuracy: assessment.results?.accuracy || 0
                });
            }
        });
        
        // Update each card
        const allTypes = [
            'naming', 'typing', 'sentenceTyping', 'category',
            'listening', 'speaking', 'firstSound', 'rhyming',
            'definitions', 'association', 'synonyms', 'scramble',
            'clockMatching', 'timeSequencing', 'timeOrdering', 'workingMemory'
        ];
        
        allTypes.forEach(type => {
            const container = document.getElementById(`mini-stats-${type}`);
            if (!container) return;
            
            const stats = statsByType[type];
            
            if (!stats || stats.attempts === 0) {
                container.innerHTML = `
                    <span class="no-data">${t('progress.noData')}</span>
                `;
            } else {
                const accuracy = stats.attempts > 0 
                    ? Math.round((stats.correct / stats.attempts) * 100) 
                    : 0;
                
                const accuracyClass = accuracy >= 80 ? 'good' : accuracy >= 60 ? 'ok' : 'needs-work';
                
                container.innerHTML = `
                    <span class="mini-accuracy ${accuracyClass}">${accuracy}%</span>
                    <span class="mini-count">${stats.attempts} ${t('progress.questions')}</span>
                `;
            }
        });
    }
    
    showExerciseDetail(exerciseType) {
        const modal = document.getElementById('exercise-modal');
        const modalBody = document.getElementById('modal-body');
        
        // Get stats for this exercise
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        const assessmentHistory = assessmentService.getAssessmentHistory();
        
        // Filter for this exercise
        const exerciseSessions = sessionHistory.filter(s => s.exerciseType === exerciseType);
        const exerciseAssessments = assessmentHistory.filter(a => 
            a.metadata?.exerciseType === exerciseType || 
            a.results?.exerciseType === exerciseType
        );
        
        // Calculate stats
        let totalAttempts = 0;
        let totalCorrect = 0;
        let totalTime = 0;
        let practiceSessions = 0;
        let testSessions = 0;
        const tests = [];
        
        exerciseSessions.forEach(session => {
            totalAttempts += session.total || 0;
            totalCorrect += session.correct || 0;
            totalTime += session.activeTime || session.duration || 0;
            
            if (session.mode === 'test') {
                testSessions++;
                tests.push({
                    id: session.id,
                    date: session.date,
                    correct: session.correct,
                    total: session.total,
                    accuracy: session.accuracy,
                    wordList: session.wordList,
                    attempts: session.attempts
                });
            } else {
                practiceSessions++;
            }
        });
        
        // Add assessments as tests
        exerciseAssessments.forEach(assessment => {
            testSessions++;
            tests.push({
                id: assessment.id,
                date: assessment.date,
                correct: assessment.results?.overallScore || 0,
                total: assessment.results?.totalQuestions || 10,
                accuracy: assessment.results?.accuracy || 0
            });
        });
        
        const accuracy = totalAttempts > 0 
            ? Math.round((totalCorrect / totalAttempts) * 100) 
            : 0;
        
        // Sort tests by date (newest first)
        tests.sort((a, b) => (b.date || 0) - (a.date || 0));
        
        modalBody.innerHTML = `
            <h2>${t('exercises.' + exerciseType + '.name')}</h2>
            
            <div class="detail-stats-grid">
                <div class="detail-stat">
                    <span class="stat-value">${totalAttempts}</span>
                    <span class="stat-label">${t('progress.totalQuestions')}</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${accuracy}%</span>
                    <span class="stat-label">${t('progress.accuracy')}</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${this.formatTime(totalTime)}</span>
                    <span class="stat-label">${t('progress.totalTime')}</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${practiceSessions}</span>
                    <span class="stat-label">${t('progress.practiceSessions')}</span>
                </div>
            </div>
            
            <h3>${t('progress.testHistory')} (${testSessions})</h3>
            
            ${tests.length === 0 ? `
                <div class="empty-state">
                    <p>${t('progress.noTestsYet')}</p>
                    <button class="btn btn--primary" id="take-test-btn" data-type="${exerciseType}">
                        ${t('progress.takeTest')}
                    </button>
                </div>
            ` : `
                <div class="test-list">
                    ${tests.slice(0, 10).map((test, index) => {
                        const dateStr = test.date ? new Date(test.date).toLocaleDateString() : t('progress.unknownDate');
                        const accuracyClass = test.accuracy >= 80 ? 'good' : test.accuracy >= 60 ? 'ok' : 'needs-work';
                        
                        return `
                            <div class="test-item" data-test-index="${index}">
                                <div class="test-info">
                                    <span class="test-date">${dateStr}</span>
                                    <span class="test-score">${test.correct}/${test.total}</span>
                                    <span class="test-accuracy ${accuracyClass}">${test.accuracy}%</span>
                                </div>
                                ${index > 0 ? `
                                    <button class="btn btn--small btn--ghost compare-btn" 
                                            data-test1="${index - 1}" data-test2="${index}">
                                        ${t('progress.compare')}
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="comparison-area hidden" id="comparison-area"></div>
            `}
            
            <div class="modal-actions">
                <button class="btn btn--secondary" id="practice-btn" data-type="${exerciseType}">
                    ${t('progress.practice')}
                </button>
                <button class="btn btn--primary" id="test-btn" data-type="${exerciseType}">
                    ${t('progress.takeTest')}
                </button>
            </div>
        `;
        
        // Store tests data for comparison
        this.currentTests = tests;
        
        // Attach modal listeners
        this.attachModalListeners(exerciseType);
        
        modal.classList.remove('hidden');
    }
    
    attachModalListeners(exerciseType) {
        // Practice button
        const practiceBtn = document.getElementById('practice-btn');
        if (practiceBtn) {
            practiceBtn.addEventListener('click', () => {
                document.getElementById('exercise-modal').classList.add('hidden');
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
            });
        }
        
        // Test button
        const testBtn = document.getElementById('test-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                document.getElementById('exercise-modal').classList.add('hidden');
                window.dispatchEvent(new CustomEvent('startTest', {
                    detail: {
                        exerciseType: exerciseType,
                        difficulty: 'easy',
                        questions: 10
                    }
                }));
            });
        }
        
        // Take test button (in empty state)
        const takeTestBtn = document.getElementById('take-test-btn');
        if (takeTestBtn) {
            takeTestBtn.addEventListener('click', () => {
                document.getElementById('exercise-modal').classList.add('hidden');
                window.dispatchEvent(new CustomEvent('startTest', {
                    detail: {
                        exerciseType: exerciseType,
                        difficulty: 'easy',
                        questions: 10
                    }
                }));
            });
        }
        
        // Compare buttons
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx1 = parseInt(btn.dataset.test1);
                const idx2 = parseInt(btn.dataset.test2);
                this.showComparison(idx1, idx2);
            });
        });
    }
    
    showComparison(idx1, idx2) {
        const test1 = this.currentTests[idx1];
        const test2 = this.currentTests[idx2];
        
        if (!test1 || !test2) return;
        
        const comparisonArea = document.getElementById('comparison-area');
        
        const improvement = test1.accuracy - test2.accuracy;
        const improvementClass = improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral';
        const improvementIcon = improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→';
        
        comparisonArea.innerHTML = `
            <h4>${t('progress.comparison')}</h4>
            <div class="comparison-grid">
                <div class="comparison-item">
                    <span class="compare-label">${t('progress.newer')}</span>
                    <span class="compare-date">${new Date(test1.date).toLocaleDateString()}</span>
                    <span class="compare-score">${test1.accuracy}%</span>
                </div>
                <div class="comparison-arrow ${improvementClass}">
                    <span class="arrow">${improvementIcon}</span>
                    <span class="diff">${Math.abs(improvement)}%</span>
                </div>
                <div class="comparison-item">
                    <span class="compare-label">${t('progress.older')}</span>
                    <span class="compare-date">${new Date(test2.date).toLocaleDateString()}</span>
                    <span class="compare-score">${test2.accuracy}%</span>
                </div>
            </div>
        `;
        
        comparisonArea.classList.remove('hidden');
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
        // Exercise cards - open detail modal
        this.container.querySelectorAll('.progress-card').forEach(card => {
            card.addEventListener('click', () => {
                const exerciseType = card.dataset.type;
                this.showExerciseDetail(exerciseType);
            });
        });
        
        // Close modal
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('exercise-modal').classList.add('hidden');
            });
        }
        
        // Close on overlay click
        const modal = document.getElementById('exercise-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }
        
        // Export report button
        const exportBtn = document.getElementById('export-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                pdfService.generateProgressReport();
            });
        }
    }
}

export default ProgressPage;

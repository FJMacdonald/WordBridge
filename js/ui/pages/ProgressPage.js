// ui/pages/ProgressPage.js - With test retake and comparison functionality
import { t, i18n } from '../../core/i18n.js';
import assessmentService from '../../services/AssessmentService.js';
import pdfService from '../../services/PDFService.js';
import storageService from '../../services/StorageService.js';

class ProgressPage {
    constructor(container) {
        this.container = container;
        this.selectedTests = [];
        this.currentTests = [];
        this.currentExerciseType = null;
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
                name: t('home.categories.words') || 'Words',
                icon: '📚'
            },
            phonetics: {
                name: t('home.categories.phonetics') || 'Phonetics',
                icon: '🔊'
            },
            meaning: {
                name: t('home.categories.meaning') || 'Meaning',
                icon: '💡'
            },
            time: {
                name: t('home.categories.time') || 'Time',
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
                    <h1 class="page-title">📈 ${t('progress.title')}</h1>
                    <p class="page-subtitle">${t('progress.subtitle') || 'See the progress you are making'}</p>
                </header>
                
                <div class="header-actions">
                    <button class="btn btn--primary" id="export-report-btn">
                        📊 ${t('progress.viewReport') || 'View Report'}
                    </button>
                </div>
                
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
                                    <span class="exercise-name">${t('exercises.' + ex.type + '.name') || ex.type}</span>
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
                    <div class="modal-content modal-large">
                        <button class="modal-close" id="close-modal">&times;</button>
                        <div id="modal-body"></div>
                    </div>
                </div>
                
                <!-- Comparison Modal -->
                <div class="modal-overlay hidden" id="comparison-modal">
                    <div class="modal-content modal-large">
                        <button class="modal-close" id="close-comparison-modal">&times;</button>
                        <div id="comparison-modal-body"></div>
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
                    <span class="stat-label">${t('progress.totalQuestions') || 'Questions'}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${overallAccuracy}%</span>
                    <span class="stat-label">${t('progress.accuracy') || 'Accuracy'}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${this.formatTime(totalTime)}</span>
                    <span class="stat-label">${t('progress.totalTime') || 'Time'}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${testSessions}</span>
                    <span class="stat-label">${t('progress.testsTaken') || 'Tests'}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-value">${practiceSessions}</span>
                    <span class="stat-label">${t('progress.practiceSessions') || 'Practice'}</span>
                </div>
            </div>
        `;
    }
    
    renderExerciseCards() {
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        const testHistory = storageService.get(this.getStorageKey('testHistory'), {});
        const assessmentHistory = assessmentService.getAssessmentHistory();
        
        // Group sessions by exercise type
        const statsByType = {};
        
        // Process session history
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
                    id: session.id || `session_${session.date}`,
                    date: session.date,
                    correct: session.correct,
                    total: session.total,
                    accuracy: session.accuracy,
                    wordList: session.wordList || [],
                    attempts: session.attempts || [],
                    difficulty: session.difficulty || 'easy'
                });
            } else {
                statsByType[type].practiceSessions++;
            }
        });
        
        // Also process dedicated test history
        Object.entries(testHistory).forEach(([exerciseType, tests]) => {
            if (!statsByType[exerciseType]) {
                statsByType[exerciseType] = {
                    attempts: 0,
                    correct: 0,
                    time: 0,
                    practiceSessions: 0,
                    testSessions: 0,
                    tests: []
                };
            }
            
            tests.forEach(test => {
                const exists = statsByType[exerciseType].tests.some(t => t.id === test.id);
                if (!exists) {
                    statsByType[exerciseType].testSessions++;
                    statsByType[exerciseType].tests.push({
                        id: test.id,
                        date: test.date,
                        correct: test.correct,
                        total: test.total,
                        accuracy: test.accuracy,
                        wordList: test.wordList || [],
                        attempts: test.attempts || [],
                        difficulty: test.difficulty || 'easy'
                    });
                }
            });
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
                
                const exists = statsByType[type].tests.some(t => t.id === assessment.id);
                if (!exists) {
                    statsByType[type].testSessions++;
                    statsByType[type].tests.push({
                        id: assessment.id,
                        date: assessment.date,
                        correct: assessment.results?.overallScore || 0,
                        total: assessment.results?.totalQuestions || 10,
                        accuracy: assessment.results?.accuracy || 0,
                        wordList: assessment.wordList || [],
                        attempts: assessment.attempts || [],
                        difficulty: assessment.metadata?.difficulty || 'easy'
                    });
                }
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
                    <span class="no-data">${t('progress.noData') || 'No data'}</span>
                `;
            } else {
                const accuracy = stats.attempts > 0 
                    ? Math.round((stats.correct / stats.attempts) * 100) 
                    : 0;
                
                const accuracyClass = accuracy >= 80 ? 'good' : accuracy >= 60 ? 'ok' : 'needs-work';
                
                container.innerHTML = `
                    <span class="mini-accuracy ${accuracyClass}">${accuracy}%</span>
                    <span class="mini-count">${stats.attempts} ${t('progress.questions') || 'Q'}</span>
                `;
            }
        });
        
        // Store for later use
        this.statsByType = statsByType;
    }
    
    showExerciseDetail(exerciseType) {
        const modal = document.getElementById('exercise-modal');
        const modalBody = document.getElementById('modal-body');
        
        this.currentExerciseType = exerciseType;
        
        // Get stats for this exercise
        const stats = this.statsByType?.[exerciseType] || this.getExerciseStats(exerciseType);
        
        const accuracy = stats.attempts > 0 
            ? Math.round((stats.correct / stats.attempts) * 100) 
            : 0;
        
        // Sort tests by date (newest first)
        const tests = [...(stats.tests || [])].sort((a, b) => (b.date || 0) - (a.date || 0));
        this.currentTests = tests;
        
        modalBody.innerHTML = `
            <h2>${t('exercises.' + exerciseType + '.name') || exerciseType}</h2>
            
            <div class="detail-stats-grid">
                <div class="detail-stat">
                    <span class="stat-value">${stats.attempts || 0}</span>
                    <span class="stat-label">${t('progress.totalQuestions') || 'Questions'}</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${accuracy}%</span>
                    <span class="stat-label">${t('progress.accuracy') || 'Accuracy'}</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${this.formatTime(stats.time || 0)}</span>
                    <span class="stat-label">${t('progress.totalTime') || 'Time'}</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-value">${stats.practiceSessions || 0}</span>
                    <span class="stat-label">${t('progress.practiceSessions') || 'Practice'}</span>
                </div>
            </div>
            
            <div class="test-history-section">
                <div class="section-header">
                    <h3>${t('progress.testHistory') || 'Test History'} (${tests.length})</h3>
                    ${tests.length >= 2 ? `
                        <button class="btn btn--small btn--secondary" id="compare-mode-btn">
                            📊 ${t('progress.compareTests') || 'Compare Tests'}
                        </button>
                    ` : ''}
                </div>
                
                ${tests.length === 0 ? `
                    <div class="empty-state">
                        <p>${t('progress.noTestsYet') || 'No tests taken yet for this exercise.'}</p>
                        <button class="btn btn--primary" id="take-test-btn" data-type="${exerciseType}">
                            ${t('progress.takeTest') || 'Take Test'}
                        </button>
                    </div>
                ` : `
                    <div class="test-selection-hint hidden" id="selection-hint">
                        <p>📌 Select two tests to compare, then click "Compare Selected"</p>
                        <button class="btn btn--primary btn--small" id="compare-selected-btn" disabled>
                            Compare Selected (0/2)
                        </button>
                        <button class="btn btn--ghost btn--small" id="cancel-compare-btn">
                            Cancel
                        </button>
                    </div>
                    
                    <div class="test-list" id="test-list">
                        ${tests.slice(0, 20).map((test, index) => {
                            const dateStr = test.date ? new Date(test.date).toLocaleDateString() : (t('progress.unknownDate') || 'Unknown date');
                            const timeStr = test.date ? new Date(test.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                            const accuracyClass = test.accuracy >= 80 ? 'good' : test.accuracy >= 60 ? 'ok' : 'needs-work';
                            const hasWordList = test.wordList && test.wordList.length > 0;
                            
                            return `
                                <div class="test-item ${hasWordList ? 'retakeable' : ''}" 
                                     data-test-index="${index}"
                                     data-test-id="${test.id}">
                                    <div class="test-checkbox hidden">
                                        <input type="checkbox" id="test-check-${index}" data-index="${index}">
                                    </div>
                                    <div class="test-info">
                                        <div class="test-date-time">
                                            <span class="test-date">${dateStr}</span>
                                            <span class="test-time">${timeStr}</span>
                                        </div>
                                        <div class="test-results">
                                            <span class="test-score">${test.correct}/${test.total}</span>
                                            <span class="test-accuracy ${accuracyClass}">${test.accuracy}%</span>
                                        </div>
                                    </div>
                                    <div class="test-actions">
                                        ${hasWordList ? `
                                            <button class="btn btn--small btn--primary retake-btn" 
                                                    data-test-index="${index}"
                                                    title="${t('progress.retakeTest') || 'Retake this exact test'}">
                                                🔄 ${t('progress.retake') || 'Retake'}
                                            </button>
                                        ` : `
                                            <span class="no-retake-hint" title="Word list not saved">
                                                ⚠️
                                            </span>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
            
            <div class="modal-actions">
                <button class="btn btn--secondary" id="practice-btn" data-type="${exerciseType}">
                    ${t('progress.practice') || 'Practice'}
                </button>
                <button class="btn btn--primary" id="new-test-btn" data-type="${exerciseType}">
                    ${t('progress.takeNewTest') || 'New Test'}
                </button>
            </div>
        `;
        
        // Attach modal listeners
        this.attachModalListeners(exerciseType);
        
        modal.classList.remove('hidden');
    }
    
    getExerciseStats(exerciseType) {
        const sessionHistory = storageService.get(this.getStorageKey('sessionHistory'), []);
        const testHistory = storageService.get(this.getStorageKey('testHistory'), {});
        
        const stats = {
            attempts: 0,
            correct: 0,
            time: 0,
            practiceSessions: 0,
            testSessions: 0,
            tests: []
        };
        
        // Process sessions
        sessionHistory.filter(s => s.exerciseType === exerciseType).forEach(session => {
            stats.attempts += session.total || 0;
            stats.correct += session.correct || 0;
            stats.time += session.activeTime || session.duration || 0;
            
            if (session.mode === 'test') {
                stats.testSessions++;
                stats.tests.push({
                    id: session.id || `session_${session.date}`,
                    date: session.date,
                    correct: session.correct,
                    total: session.total,
                    accuracy: session.accuracy,
                    wordList: session.wordList || [],
                    attempts: session.attempts || [],
                    difficulty: session.difficulty || 'easy'
                });
            } else {
                stats.practiceSessions++;
            }
        });
        
        // Process test history
        const exerciseTests = testHistory[exerciseType] || [];
        exerciseTests.forEach(test => {
            const exists = stats.tests.some(t => t.id === test.id);
            if (!exists) {
                stats.tests.push(test);
            }
        });
        
        return stats;
    }
    
    attachModalListeners(exerciseType) {
        // Practice button - navigate directly to the exercise
        const practiceBtn = document.getElementById('practice-btn');
        if (practiceBtn) {
            practiceBtn.addEventListener('click', () => {
                document.getElementById('exercise-modal').classList.add('hidden');
                window.dispatchEvent(new CustomEvent('startPractice', {
                    detail: {
                        exerciseType: exerciseType,
                        difficulty: 'easy'
                    }
                }));
            });
        }
        
        // New test button
        const newTestBtn = document.getElementById('new-test-btn');
        if (newTestBtn) {
            newTestBtn.addEventListener('click', () => {
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
        
        // Retake buttons
        document.querySelectorAll('.retake-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.testIndex);
                this.retakeTest(index);
            });
        });
        
        // Compare mode button
        const compareModeBtn = document.getElementById('compare-mode-btn');
        if (compareModeBtn) {
            compareModeBtn.addEventListener('click', () => {
                this.enterCompareMode();
            });
        }
        
        // Cancel compare button
        const cancelCompareBtn = document.getElementById('cancel-compare-btn');
        if (cancelCompareBtn) {
            cancelCompareBtn.addEventListener('click', () => {
                this.exitCompareMode();
            });
        }
        
        // Compare selected button
        const compareSelectedBtn = document.getElementById('compare-selected-btn');
        if (compareSelectedBtn) {
            compareSelectedBtn.addEventListener('click', () => {
                this.compareSelectedTests();
            });
        }
    }
    
    enterCompareMode() {
        this.selectedTests = [];
        
        // Show checkboxes
        document.querySelectorAll('.test-checkbox').forEach(el => {
            el.classList.remove('hidden');
        });
        
        // Show hint
        document.getElementById('selection-hint')?.classList.remove('hidden');
        
        // Hide compare mode button
        document.getElementById('compare-mode-btn')?.classList.add('hidden');
        
        //  checkbox listeners
        document.querySelectorAll('.test-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleTestSelection(e.target);
            });
        });
    }
    
    exitCompareMode() {
        this.selectedTests = [];
        
        // Hide checkboxes
        document.querySelectorAll('.test-checkbox').forEach(el => {
            el.classList.add('hidden');
        });
        
        // Uncheck all
        document.querySelectorAll('.test-checkbox input').forEach(cb => {
            cb.checked = false;
        });
        
        // Hide hint
        document.getElementById('selection-hint')?.classList.add('hidden');
        
        // Show compare mode button
        document.getElementById('compare-mode-btn')?.classList.remove('hidden');
    }
    
    handleTestSelection(checkbox) {
        const index = parseInt(checkbox.dataset.index);
        
        if (checkbox.checked) {
            if (this.selectedTests.length < 2) {
                this.selectedTests.push(index);
            } else {
                checkbox.checked = false;
                return;
            }
        } else {
            this.selectedTests = this.selectedTests.filter(i => i !== index);
        }
        
        // Update button
        const btn = document.getElementById('compare-selected-btn');
        if (btn) {
            btn.textContent = `Compare Selected (${this.selectedTests.length}/2)`;
            btn.disabled = this.selectedTests.length !== 2;
        }
    }
    
    retakeTest(testIndex) {
        const test = this.currentTests[testIndex];
        
        if (!test || !test.wordList || test.wordList.length === 0) {
            alert(t('progress.cannotRetake') || 'Cannot retake this test - word list not saved.');
            return;
        }
        
        // Close modal
        document.getElementById('exercise-modal').classList.add('hidden');
        
        // Start test with the same word list
        window.dispatchEvent(new CustomEvent('startTest', {
            detail: {
                exerciseType: this.currentExerciseType,
                difficulty: test.difficulty || 'easy',
                questions: test.wordList.length,
                wordList: test.wordList,
                isRetake: true,
                originalTestId: test.id,
                originalTestDate: test.date,
                originalScore: test.accuracy,
                originPage: 'progress' // Track origin
            }
        }));
    }
    
    compareSelectedTests() {
        if (this.selectedTests.length !== 2) return;
        
        // Sort so older test is first
        const sorted = [...this.selectedTests].sort((a, b) => {
            const testA = this.currentTests[a];
            const testB = this.currentTests[b];
            return (testA.date || 0) - (testB.date || 0);
        });
        
        const olderTest = this.currentTests[sorted[0]];
        const newerTest = this.currentTests[sorted[1]];
        
        this.showComparisonModal(olderTest, newerTest);
    }
    
    showComparisonModal(olderTest, newerTest) {
        const modal = document.getElementById('comparison-modal');
        const modalBody = document.getElementById('comparison-modal-body');
        
        const improvement = newerTest.accuracy - olderTest.accuracy;
        const improvementClass = improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'neutral';
        const improvementIcon = improvement > 0 ? '📈' : improvement < 0 ? '📉' : '➡️';
        const improvementText = improvement > 0 ? `+${improvement}%` : `${improvement}%`;
        
        // Calculate detailed comparison if we have attempt data
        let wordComparison = '';
        if (olderTest.attempts?.length && newerTest.attempts?.length && olderTest.wordList) {
            wordComparison = this.generateWordComparison(olderTest, newerTest);
        }
        
        modalBody.innerHTML = `
            <h2>📊 ${t('progress.testComparison') || 'Test Comparison'}</h2>
            
            <div class="comparison-summary ${improvementClass}">
                <span class="comparison-icon">${improvementIcon}</span>
                <span class="comparison-text">
                    ${improvement > 0 ? (t('progress.improved') || 'Improved') : 
                      improvement < 0 ? (t('progress.declined') || 'Declined') : 
                      (t('progress.noChange') || 'No Change')}
                </span>
                <span class="comparison-value">${improvementText}</span>
            </div>
            
            <div class="comparison-cards">
                <div class="comparison-card older">
                    <div class="card-label">${t('progress.olderTest') || 'Earlier Test'}</div>
                    <div class="card-date">${new Date(olderTest.date).toLocaleDateString()}</div>
                    <div class="card-score">${olderTest.correct}/${olderTest.total}</div>
                    <div class="card-accuracy">${olderTest.accuracy}%</div>
                </div>
                
                <div class="comparison-arrow-container">
                    <div class="comparison-arrow ${improvementClass}">
                        ${improvement > 0 ? '→' : improvement < 0 ? '→' : '='}
                    </div>
                    <div class="comparison-diff ${improvementClass}">
                        ${improvementText}
                    </div>
                </div>
                
                <div class="comparison-card newer">
                    <div class="card-label">${t('progress.newerTest') || 'Recent Test'}</div>
                    <div class="card-date">${new Date(newerTest.date).toLocaleDateString()}</div>
                    <div class="card-score">${newerTest.correct}/${newerTest.total}</div>
                    <div class="card-accuracy">${newerTest.accuracy}%</div>
                </div>
            </div>
            
            ${wordComparison ? `
                <div class="word-comparison-section">
                    <h3>${t('progress.wordByWord') || 'Word-by-Word Comparison'}</h3>
                    ${wordComparison}
                </div>
            ` : ''}
            
            <div class="comparison-actions">
                ${newerTest.wordList?.length ? `
                    <button class="btn btn--secondary" id="retake-from-comparison" data-test-id="${newerTest.id}">
                        🔄 ${t('progress.retakeNewerTest') || 'Retake Recent Test'}
                    </button>
                ` : ''}
                <button class="btn btn--primary" id="close-comparison">
                    ${t('common.close') || 'Close'}
                </button>
            </div>
        `;
        
        // Attach listeners
        const closeBtn = document.getElementById('close-comparison');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
        
        const retakeBtn = document.getElementById('retake-from-comparison');
        if (retakeBtn) {
            retakeBtn.addEventListener('click', () => {
                const testIndex = this.currentTests.findIndex(t => t.id === newerTest.id);
                if (testIndex >= 0) {
                    modal.classList.add('hidden');
                    document.getElementById('exercise-modal').classList.add('hidden');
                    this.retakeTest(testIndex);
                }
            });
        }
        
        modal.classList.remove('hidden');
    }
    
    generateWordComparison(olderTest, newerTest) {
        // Create a map of word results from both tests
        const wordResults = new Map();
        
        // Process older test attempts
        if (olderTest.attempts) {
            olderTest.attempts.forEach(attempt => {
                const word = attempt.word || attempt.target;
                if (word) {
                    wordResults.set(word, {
                        word,
                        olderCorrect: attempt.correct,
                        newerCorrect: null
                    });
                }
            });
        }
        
        // Process newer test attempts
        if (newerTest.attempts) {
            newerTest.attempts.forEach(attempt => {
                const word = attempt.word || attempt.target;
                if (word) {
                    if (wordResults.has(word)) {
                        wordResults.get(word).newerCorrect = attempt.correct;
                    } else {
                        wordResults.set(word, {
                            word,
                            olderCorrect: null,
                            newerCorrect: attempt.correct
                        });
                    }
                }
            });
        }
        
        // Generate HTML
        const rows = Array.from(wordResults.values()).map(result => {
            let statusClass = 'neutral';
            let statusIcon = '➡️';
            
            if (result.olderCorrect !== null && result.newerCorrect !== null) {
                if (!result.olderCorrect && result.newerCorrect) {
                    statusClass = 'improved';
                    statusIcon = '✅';
                } else if (result.olderCorrect && !result.newerCorrect) {
                    statusClass = 'declined';
                    statusIcon = '❌';
                } else if (result.olderCorrect && result.newerCorrect) {
                    statusClass = 'maintained';
                    statusIcon = '✓';
                } else {
                    statusClass = 'still-learning';
                    statusIcon = '📚';
                }
            }
            
            return `
                <div class="word-row ${statusClass}">
                    <span class="word-text">${result.word}</span>
                    <span class="word-status">${statusIcon}</span>
                    <span class="word-detail">
                        ${result.olderCorrect === null ? '—' : result.olderCorrect ? '✓' : '✗'}
                        →
                        ${result.newerCorrect === null ? '—' : result.newerCorrect ? '✓' : '✗'}
                    </span>
                </div>
            `;
        }).join('');
        
        return `
            <div class="word-comparison-grid">
                <div class="word-comparison-legend">
                    <span class="legend-item improved">✅ Improved</span>
                    <span class="legend-item maintained">✓ Maintained</span>
                    <span class="legend-item declined">❌ Declined</span>
                    <span class="legend-item still-learning">📚 Still Learning</span>
                </div>
                <div class="word-rows">
                    ${rows}
                </div>
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
        
        // Close comparison modal
        const closeComparisonBtn = document.getElementById('close-comparison-modal');
        if (closeComparisonBtn) {
            closeComparisonBtn.addEventListener('click', () => {
                document.getElementById('comparison-modal').classList.add('hidden');
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
        
        const comparisonModal = document.getElementById('comparison-modal');
        if (comparisonModal) {
            comparisonModal.addEventListener('click', (e) => {
                if (e.target === comparisonModal) {
                    comparisonModal.classList.add('hidden');
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
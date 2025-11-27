// ui/pages/ProgressPage.js
import { t } from '../../core/i18n.js';
import ProgressCharts from '../components/ProgressCharts.js';
import assessmentService from '../../services/AssessmentService.js';
import pdfService from '../../services/PDFService.js';
import analyticsService from '../../services/AnalyticsService.js';

class ProgressPage {
    constructor(container) {
        this.container = container;
    }
    
    render() {
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
                
                <!-- Tab Navigation -->
                <div class="progress-tabs">
                    <button class="tab-btn active" data-tab="practice">
                        📚 ${t('progress.practiceProgress')}
                    </button>
                    <button class="tab-btn" data-tab="assessment">
                        📋 ${t('progress.assessmentResults')}
                    </button>
                </div>
                
                <!-- Practice Tab -->
                <div class="tab-content" id="practice-tab">
                    <!-- Time Range Controls -->
                    <div class="time-range-controls">
                        <button class="time-btn active" data-range="day">${t('progress.timeRanges.day')}</button>
                        <button class="time-btn" data-range="week">${t('progress.timeRanges.week')}</button>
                        <button class="time-btn" data-range="month">${t('progress.timeRanges.month')}</button>
                        <button class="time-btn" data-range="all">${t('progress.timeRanges.all')}</button>
                    </div>
                    
                    <!-- Practice Cards Grid -->
                    <div id="practice-cards" class="practice-grid"></div>
                    
                    <div class="recommendations-section">
                        <h3>${t('progress.recommendations.title')}</h3>
                        <div id="recommendations"></div>
                    </div>
                </div>
                
                <!-- Assessment Tab -->
                <div class="tab-content" id="assessment-tab" hidden>
                    <div id="assessment-results" class="assessment-grid"></div>
                </div>
            </div>
        `;
        
        // Render initial practice tab
        this.renderPracticeTab('day');
        this.renderAssessmentTab();
        this.renderRecommendations();
        
        this.attachListeners();
    }
    
    renderRecommendations() {
        const quality = assessmentService.calculatePracticeQuality(7);
        const container = document.getElementById('recommendations');
        
        if (!quality) {
            container.innerHTML = `<p>${t('progress.practiceMoreRecommendations')}</p>`;
            return;
        }
        
        const recommendations = [];
        
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
                icon: '🎯',
                text: t('progress.recommendations.variety'),
                priority: 'medium'
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
    
    renderPracticeTab(timeRange = 'day') {
        const practiceData = this.getPracticeData(timeRange);
        const container = document.getElementById('practice-cards');
        
        if (!practiceData || Object.keys(practiceData).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>${t('progress.noPracticeData')}</h3>
                    <p>${t('progress.startPracticingMessage')}</p>
                    <button class="btn btn--primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'home'}))">
                        ${t('progress.startPracticing')}
                    </button>
                </div>
            `;
            return;
        }
        
        const exerciseTypes = [
            { key: 'naming', name: 'Picture Naming', icon: '🖼️' },
            { key: 'typing', name: 'Typing', icon: '⌨️' },
            { key: 'sentenceTyping', name: 'Fill Blank', icon: '📝' },
            { key: 'category', name: 'Categories', icon: '📁' },
            { key: 'listening', name: 'Listening', icon: '👂' },
            { key: 'speaking', name: 'Speaking', icon: '🎤' },
            { key: 'firstSound', name: 'First Sounds', icon: '🔤' },
            { key: 'rhyming', name: 'Rhyming', icon: '🎵' },
            { key: 'definitions', name: 'Definitions', icon: '📖' },
            { key: 'association', name: 'Association', icon: '🔗' },
            { key: 'synonyms', name: 'Synonyms', icon: '≈' },
            { key: 'scramble', name: 'Unscramble', icon: '🔀' },
            { key: 'timeSequencing', name: 'Time Sequencing', icon: '📅' },
            { key: 'clockMatching', name: 'Clock Matching', icon: '🕐' },
            { key: 'timeOrdering', name: 'Time Ordering', icon: '⏰' },
            { key: 'workingMemory', name: 'Working Memory', icon: '🧠' }
        ];
        
        let html = '';
        exerciseTypes.forEach(type => {
            const data = practiceData[type.key];
            if (data && data.totalTime > 0) {
                const avgDifficulty = this.getAverageDifficulty(data.attempts);
                const difficultyLabel = avgDifficulty >= 2.5 ? 'Hard' : avgDifficulty >= 1.5 ? 'Medium' : 'Easy';
                
                html += `
                    <div class="practice-card" data-exercise="${type.key}">
                        <div class="card-header">
                            <span class="card-icon">${type.icon}</span>
                            <h4 class="card-title">${type.name}</h4>
                        </div>
                        <div class="card-stats">
                            <div class="stat">
                                <span class="stat-value">${this.formatTime(data.totalTime)}</span>
                                <span class="stat-label">Practice Time</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${data.exerciseCount}</span>
                                <span class="stat-label">Exercises</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${difficultyLabel}</span>
                                <span class="stat-label">Avg Difficulty</span>
                            </div>
                        </div>
                        ${data.accuracy !== undefined ? `
                            <div class="card-accuracy">
                                <div class="accuracy-bar">
                                    <div class="accuracy-fill" style="width: ${data.accuracy}%"></div>
                                </div>
                                <span class="accuracy-text">${data.accuracy}% Accuracy</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        });
        
        container.innerHTML = html || '<p class="empty-message">No practice data for this time range.</p>';
    }
    
    renderAssessmentTab() {
        let assessmentData;
        try {
            assessmentData = assessmentService.getAssessmentHistory();
            // Transform to the format expected by the UI
            if (assessmentData && assessmentData.length > 0) {
                assessmentData = assessmentData.map(assessment => ({
                    exerciseType: assessment.results?.exerciseType || 'unknown',
                    accuracy: assessment.results?.overallScore || 0,
                    difficulty: assessment.results?.difficulty || 'medium',
                    date: assessment.date,
                    hintsUsed: assessment.results?.hintsUsed || 0,
                    avgResponseTime: assessment.results?.averageResponseTime || 0,
                    totalTime: assessment.duration || 0,
                    wrongSelections: assessment.results?.wrongSelections || 0,
                    mistypedLetters: assessment.results?.mistypedLetters || 0
                }));
            }
        } catch (error) {
            console.warn('Error getting assessment data:', error);
            assessmentData = this.getMockAssessmentData();
        }
        
        const container = document.getElementById('assessment-results');
        
        if (!assessmentData || assessmentData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>${t('progress.noAssessmentResults')}</h3>
                    <p>${t('progress.takeAssessmentMessage')}</p>
                    <button class="btn btn--primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'assessment'}))">
                        ${t('progress.takeAssessment')}
                    </button>
                </div>
            `;
            return;
        }
        
        const exerciseTypes = [
            { key: 'naming', name: 'Picture Naming', icon: '🖼️' },
            { key: 'typing', name: 'Typing', icon: '⌨️' },
            { key: 'sentenceTyping', name: 'Fill Blank', icon: '📝' },
            { key: 'category', name: 'Categories', icon: '📁' },
            { key: 'listening', name: 'Listening', icon: '👂' },
            { key: 'speaking', name: 'Speaking', icon: '🎤' },
            { key: 'firstSound', name: 'First Sounds', icon: '🔤' },
            { key: 'rhyming', name: 'Rhyming', icon: '🎵' },
            { key: 'definitions', name: 'Definitions', icon: '📖' },
            { key: 'association', name: 'Association', icon: '🔗' },
            { key: 'synonyms', name: 'Synonyms', icon: '≈' },
            { key: 'scramble', name: 'Unscramble', icon: '🔀' },
            { key: 'timeSequencing', name: 'Time Sequencing', icon: '📅' },
            { key: 'clockMatching', name: 'Clock Matching', icon: '🕐' },
            { key: 'timeOrdering', name: 'Time Ordering', icon: '⏰' },
            { key: 'workingMemory', name: 'Working Memory', icon: '🧠' }
        ];
        
        let html = '';
        exerciseTypes.forEach(type => {
            const typeResults = this.getAssessmentResultsForType(assessmentData, type.key);
            if (typeResults.length > 0) {
                const latestResult = typeResults[0];
                const trend = typeResults.length > 1 ? this.calculateTrend(typeResults) : null;
                const difficulties = this.getAreasDifficulty(typeResults);
                const recommendations = this.getRecommendationsForType(type.key, latestResult, difficulties);
                
                html += `
                    <div class="assessment-card" data-exercise="${type.key}">
                        <div class="card-header">
                            <span class="card-icon">${type.icon}</span>
                            <h4 class="card-title">${type.name}</h4>
                            ${trend !== null ? `
                                <span class="trend-indicator ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}">
                                    ${trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→'} ${Math.abs(trend)}%
                                </span>
                            ` : ''}
                        </div>
                        <div class="card-stats">
                            <div class="stat">
                                <span class="stat-value">${latestResult.accuracy}%</span>
                                <span class="stat-label">Latest Score</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${typeResults.length}</span>
                                <span class="stat-label">Assessments</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${latestResult.difficulty}</span>
                                <span class="stat-label">Level</span>
                            </div>
                        </div>
                        <div class="difficulties-section">
                            <h5>Areas of Difficulty:</h5>
                            <div class="difficulty-tags">
                                ${difficulties.map(d => `<span class="difficulty-tag">${d}</span>`).join('')}
                            </div>
                        </div>
                        <div class="recommendations-section">
                            <h5>Recommendations:</h5>
                            <ul class="recommendation-list">
                                ${recommendations.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }
        });
        
        container.innerHTML = html || '<p class="empty-message">No assessment results available.</p>';
    }
    
    getPracticeData(timeRange) {
        // Use the same AnalyticsService that the PDF report uses
        try {
            const dashboardData = analyticsService.getDashboardData();
            let sourceData;
            
            switch (timeRange) {
                case 'day':
                    sourceData = dashboardData.today;
                    break;
                case 'week':
                    sourceData = dashboardData.week;
                    break;
                case 'month':
                    sourceData = dashboardData.month;
                    break;
                case 'all':
                    sourceData = dashboardData.allTime;
                    break;
                default:
                    sourceData = dashboardData.week;
            }
            
            if (sourceData && sourceData.exerciseTypes) {
                // Convert analytics format to progress page format
                const practiceData = {};
                Object.entries(sourceData.exerciseTypes).forEach(([type, data]) => {
                    practiceData[type] = {
                        totalTime: data.totalTime || 0,
                        exerciseCount: data.totalAttempts || 0,
                        accuracy: data.accuracy || 0,
                        attempts: data.attempts || []
                    };
                });
                
                // Only return data if we have some activity
                if (Object.keys(practiceData).some(type => practiceData[type].totalTime > 0)) {
                    return practiceData;
                }
            }
        } catch (error) {
            console.warn('Error getting analytics data:', error);
        }
        
        // Return mock data for demonstration
        return this.getMockPracticeData(timeRange);
    }
    
    getMockPracticeData(timeRange) {
        // Mock data for demonstration purposes
        const mockData = {
            naming: {
                totalTime: 300000, // 5 minutes
                exerciseCount: 15,
                accuracy: 85,
                attempts: [
                    { difficulty: 'easy' },
                    { difficulty: 'medium' },
                    { difficulty: 'easy' }
                ]
            },
            typing: {
                totalTime: 240000, // 4 minutes
                exerciseCount: 12,
                accuracy: 92,
                attempts: [
                    { difficulty: 'medium' },
                    { difficulty: 'medium' },
                    { difficulty: 'hard' }
                ]
            },
            sentenceTyping: {
                totalTime: 180000, // 3 minutes
                exerciseCount: 8,
                accuracy: 78,
                attempts: [
                    { difficulty: 'easy' },
                    { difficulty: 'easy' }
                ]
            }
        };
        
        // Adjust data based on time range
        if (timeRange === 'day') {
            // Return partial data for day view
            return {
                naming: { ...mockData.naming, totalTime: mockData.naming.totalTime * 0.3 },
                typing: { ...mockData.typing, totalTime: mockData.typing.totalTime * 0.2 }
            };
        }
        
        return mockData;
    }
    
    getMockAssessmentData() {
        // Mock assessment data for demonstration
        return [
            {
                exerciseType: 'naming',
                accuracy: 85,
                difficulty: 'medium',
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                hintsUsed: 2,
                avgResponseTime: 3500,
                totalTime: 180000
            },
            {
                exerciseType: 'typing', 
                accuracy: 92,
                difficulty: 'medium',
                date: new Date(Date.now() - 86400000).toISOString(),
                hintsUsed: 1,
                avgResponseTime: 2800,
                totalTime: 150000
            },
            {
                exerciseType: 'naming',
                accuracy: 78,
                difficulty: 'medium', 
                date: new Date(Date.now() - 7 * 86400000).toISOString(), // Week ago
                hintsUsed: 4,
                avgResponseTime: 4200,
                totalTime: 200000
            }
        ];
    }
    
    getAssessmentResultsForType(assessmentData, exerciseType) {
        return assessmentData
            .filter(result => result.exerciseType === exerciseType)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    calculateTrend(results) {
        if (results.length < 2) return null;
        const latest = results[0].accuracy;
        const previous = results[1].accuracy;
        return Math.round(latest - previous);
    }
    
    getAreasDifficulty(results) {
        // Analyze results to find areas of difficulty
        const difficulties = [];
        const latest = results[0];
        
        if (latest.accuracy < 70) {
            difficulties.push('Overall accuracy needs improvement');
        }
        if (latest.hintsUsed > 3) {
            difficulties.push('Heavy reliance on hints');
        }
        if (latest.avgResponseTime > 10000) {
            difficulties.push('Slow response time');
        }
        
        return difficulties.length > 0 ? difficulties : ['No significant difficulties identified'];
    }
    
    getRecommendationsForType(type, latestResult, difficulties) {
        const recommendations = [];
        
        if (latestResult.accuracy < 70) {
            recommendations.push('Focus more practice time on this exercise type');
            recommendations.push('Start with easier difficulty levels');
        }
        
        if (latestResult.hintsUsed > 3) {
            recommendations.push('Try to complete exercises without hints first');
            recommendations.push('Review the underlying concepts');
        }
        
        if (latestResult.avgResponseTime > 10000) {
            recommendations.push('Practice with shorter time pressure');
            recommendations.push('Focus on automatic recall');
        }
        
        if (latestResult.accuracy >= 85) {
            recommendations.push('Ready to try higher difficulty level');
            recommendations.push('Consider assessment in related exercise types');
        }
        
        return recommendations.length > 0 ? recommendations : ['Keep up the good work!'];
    }
    
    getAverageDifficulty(attempts) {
        if (!attempts || attempts.length === 0) return 1;
        const difficultyMap = { easy: 1, medium: 2, hard: 3 };
        const total = attempts.reduce((sum, attempt) => sum + (difficultyMap[attempt.difficulty] || 2), 0);
        return total / attempts.length;
    }
    
    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
    
    attachListeners() {
        // Tab switching
        this.container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active tab
                this.container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show/hide tab content
                const activeTab = btn.dataset.tab;
                this.container.querySelectorAll('.tab-content').forEach(content => {
                    content.hidden = content.id !== `${activeTab}-tab`;
                });
                
                // Refresh content if needed
                if (activeTab === 'assessment') {
                    this.renderAssessmentTab();
                }
            });
        });
        
        // Time range switching (practice tab only)
        this.container.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderPracticeTab(btn.dataset.range);
            });
        });
        
        // Assessment card click handlers
        this.container.addEventListener('click', (e) => {
            const assessmentCard = e.target.closest('.assessment-card');
            if (assessmentCard) {
                const exerciseType = assessmentCard.dataset.exercise;
                this.showDetailedAssessmentReport(exerciseType);
            }
        });
        
        // Export report
        document.getElementById('export-report-btn')?.addEventListener('click', () => {
            pdfService.generateProgressReport();
        });
    }
    
    showDetailedAssessmentReport(exerciseType) {
        // Show a detailed modal or navigate to detailed view
        const assessmentData = assessmentService.getAssessmentHistory();
        const typeResults = this.getAssessmentResultsForType(assessmentData, exerciseType);
        
        if (typeResults.length === 0) return;
        
        const modal = document.createElement('div');
        modal.className = 'assessment-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Assessment Details - ${exerciseType}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="results-timeline">
                        <h4>Assessment History</h4>
                        <div class="timeline">
                            ${typeResults.map((result, index) => `
                                <div class="timeline-item">
                                    <div class="timeline-date">${new Date(result.date).toLocaleDateString()}</div>
                                    <div class="timeline-score ${result.accuracy >= 85 ? 'excellent' : result.accuracy >= 70 ? 'good' : 'needs-work'}">
                                        ${result.accuracy}%
                                    </div>
                                    <div class="timeline-details">
                                        <small>Difficulty: ${result.difficulty} | Time: ${this.formatTime(result.totalTime)}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="performance-analysis">
                        <h4>Performance Analysis</h4>
                        <canvas id="performance-chart" width="400" height="200"></canvas>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn--secondary modal-close">Close</button>
                    <button class="btn btn--primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'assessment'}))">Take New Assessment</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Draw performance chart (simple example)
        this.drawPerformanceChart('performance-chart', typeResults);
    }
    
    drawPerformanceChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Simple line chart of accuracy over time
        if (data.length > 1) {
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.reverse().forEach((result, index) => {
                const x = (index / (data.length - 1)) * (width - 40) + 20;
                const y = height - 20 - ((result.accuracy / 100) * (height - 40));
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                // Draw point
                ctx.fillStyle = result.accuracy >= 85 ? '#28a745' : result.accuracy >= 70 ? '#ffc107' : '#dc3545';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
                
                // Restore line drawing
                ctx.strokeStyle = '#007bff';
                ctx.beginPath();
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevX = ((index - 1) / (data.length - 1)) * (width - 40) + 20;
                    const prevY = height - 20 - ((data[index - 1].accuracy / 100) * (height - 40));
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            });
        }
    }
}

export default ProgressPage;
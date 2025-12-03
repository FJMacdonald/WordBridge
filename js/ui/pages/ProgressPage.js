// ui/pages/ProgressPage.js - FIXED VERSION
import { t } from '../../core/i18n.js';

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
                        <button class="time-btn active" data-range="today">${t('progress.timeRanges.day')}</button>
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
                <div class="tab-content hidden" id="assessment-tab">
                    <div id="assessment-results" class="assessment-grid"></div>
                </div>
            </div>
        `;
        
        // Render initial practice tab
        this.renderPracticeTab('today');
        this.renderAssessmentTab();
        this.renderRecommendations();
        
        this.attachListeners();
    }
    
    renderPracticeTab(timeRange = 'today') {
        const container = document.getElementById('practice-cards');
        const stats = analyticsService.getStatsForTimeRange(timeRange);
        
        if (!stats || !stats.exerciseTypes || Object.keys(stats.exerciseTypes).length === 0) {
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
            { key: 'scramble', name: 'Unscramble', icon: '🔀' }
        ];
        
        let html = '';
        exerciseTypes.forEach(type => {
            const data = stats.exerciseTypes[type.key];
            if (data && (data.totalAttempts > 0 || data.attempts > 0)) {
                const attempts = data.totalAttempts || data.attempts || 0;
                const correct = data.totalCorrect || data.correct || 0;
                const time = data.totalTime || data.time || 0;
                const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
                
                html += `
                    <div class="practice-card" data-exercise="${type.key}">
                        <div class="card-header">
                            <span class="card-icon">${type.icon}</span>
                            <h4 class="card-title">${type.name}</h4>
                        </div>
                        <div class="card-stats">
                            <div class="stat">
                                <span class="stat-value">${this.formatTime(time)}</span>
                                <span class="stat-label">Practice Time</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${attempts}</span>
                                <span class="stat-label">Attempts</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${accuracy}%</span>
                                <span class="stat-label">Accuracy</span>
                            </div>
                        </div>
                        <div class="card-accuracy">
                            <div class="accuracy-bar">
                                <div class="accuracy-fill" style="width: ${accuracy}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        if (!html) {
            html = '<p class="empty-message">No practice data for this time range.</p>';
        }
        
        container.innerHTML = html;
    }
    
    renderAssessmentTab() {
        const container = document.getElementById('assessment-results');
        
        // Get assessment history from storage
        const history = assessmentService.getAssessmentHistory();
        
        if (!history || history.length === 0) {
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
        
        // Group assessments by exercise type
        const assessmentsByType = {};
        history.forEach(assessment => {
            const type = assessment.metadata?.exerciseType || 'unknown';
            if (!assessmentsByType[type]) {
                assessmentsByType[type] = [];
            }
            assessmentsByType[type].push(assessment);
        });
        
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
            { key: 'scramble', name: 'Unscramble', icon: '🔀' }
        ];
        
        let html = '';
        exerciseTypes.forEach(type => {
            const typeAssessments = assessmentsByType[type.key];
            if (typeAssessments && typeAssessments.length > 0) {
                // Sort by date, newest first
                typeAssessments.sort((a, b) => (b.date || 0) - (a.date || 0));
                
                const latest = typeAssessments[0];
                const score = latest.results?.overallScore || 0;
                const accuracy = latest.results?.accuracy || score;
                const trend = typeAssessments.length > 1 
                    ? accuracy - (typeAssessments[1].results?.accuracy || 0)
                    : null;
                
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
                                <span class="stat-value">${accuracy}%</span>
                                <span class="stat-label">Latest Score</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${typeAssessments.length}</span>
                                <span class="stat-label">Assessments</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${latest.results?.difficulty || 'medium'}</span>
                                <span class="stat-label">Level</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        if (!html) {
            html = '<p class="empty-message">No assessment results available.</p>';
        }
        
        container.innerHTML = html;
    }
    
    renderRecommendations() {
        const container = document.getElementById('recommendations');
        
        // Get practice quality
        const quality = assessmentService.calculatePracticeQuality(7);
        
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
    
    formatTime(milliseconds) {
        if (!milliseconds || milliseconds === 0) return '0s';
        
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
                // Update active tab button
                this.container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show/hide tab content
                const activeTab = btn.dataset.tab;
                this.container.querySelectorAll('.tab-content').forEach(content => {
                    if (content.id === `${activeTab}-tab`) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
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
        
        // Export report button
        const exportBtn = this.container.querySelector('#export-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                pdfService.generateProgressReport();
            });
        }
    }
}

export default ProgressPage;
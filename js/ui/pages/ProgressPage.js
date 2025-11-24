// ui/pages/ProgressPage.js
import ProgressCharts from '../components/ProgressCharts.js';
import assessmentService from '../../services/AssessmentService.js';
import pdfService from '../../services/PDFService.js';

class ProgressPage {
    constructor(container) {
        this.container = container;
    }
    
    render() {
        this.container.innerHTML = `
            <div class="progress-page">
                <header class="page-header">
                    <h2>Your Progress</h2>
                    <div class="header-actions">
                        <button class="btn btn--secondary" id="take-assessment-btn">
                            📋 Take Assessment
                        </button>
                        <button class="btn btn--primary" id="export-report-btn">
                            📊 Export Report
                        </button>
                    </div>
                </header>
                
                <div id="charts-container"></div>
                
                <div class="recommendations-section">
                    <h3>Focus Areas</h3>
                    <div id="recommendations"></div>
                </div>
                
                <button class="btn btn--ghost back-btn" id="back-btn">
                    ← Back to Home
                </button>
            </div>
        `;
        
        // Render charts
        const charts = new ProgressCharts(document.getElementById('charts-container'));
        charts.render();
        
        // Show recommendations
        this.renderRecommendations();
        
        this.attachListeners();
    }
    
    renderRecommendations() {
        const quality = assessmentService.calculatePracticeQuality(7);
        const container = document.getElementById('recommendations');
        
        if (!quality) {
            container.innerHTML = '<p>Practice more to get personalized recommendations.</p>';
            return;
        }
        
        const recommendations = [];
        
        if (quality.breakdown.consistency < 70) {
            recommendations.push({
                icon: '📅',
                text: 'Try to practice more consistently - aim for 5 days per week',
                priority: 'high'
            });
        }
        
        if (quality.breakdown.duration < 50) {
            recommendations.push({
                icon: '⏱️',
                text: 'Increase session length - aim for 15-20 minutes per session',
                priority: 'medium'
            });
        }
        
        if (quality.breakdown.variety < 40) {
            recommendations.push({
                icon: '🎯',
                text: 'Try more exercise types - variety helps overall improvement',
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
            : '<p class="success">Great job! Keep up the consistent practice.</p>';
    }
    
    attachListeners() {
        document.getElementById('take-assessment-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'assessment' }));
        });
        
        document.getElementById('export-report-btn')?.addEventListener('click', () => {
            pdfService.generateProgressReport();
        });
        
        document.getElementById('back-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
        });
    }
}

export default ProgressPage;
// ui/pages/ProgressPage.js
import { t } from '../../core/i18n.js';
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
                    <h2>${t('progress.title')}</h2>
                    <div class="header-actions">
                        <button class="btn btn--primary" id="export-report-btn">
                            📊 ${t('progress.viewReport')}
                        </button>
                    </div>
                </header>
                
                <div id="charts-container"></div>
                
                <div class="recommendations-section">
                    <h3>${t('progress.recommendations.title')}</h3>
                    <div id="recommendations"></div>
                </div>
                

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
    
    attachListeners() {
        document.getElementById('export-report-btn')?.addEventListener('click', () => {
            pdfService.generateProgressReport();
        });
        

    }
}

export default ProgressPage;
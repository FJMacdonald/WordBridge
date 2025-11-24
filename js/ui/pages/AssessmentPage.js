// ui/pages/AssessmentPage.js
import { t } from '../../core/i18n.js';
import assessmentService from '../../services/AssessmentService.js';
import exerciseFactory from '../../exercises/ExerciseFactory.js';

class AssessmentPage {
    constructor(container) {
        this.container = container;
        this.currentAssessment = null;
        this.currentExercise = null;
    }
    
    render() {
        const inProgress = assessmentService.getCurrentAssessment();
        
        if (inProgress) {
            this.renderInProgress(inProgress);
        } else {
            this.renderStart();
        }
    }
    
    renderStart() {
        this.container.innerHTML = `
            <div class="assessment-page">
                <header class="page-header">
                    <button class="btn--ghost back-btn" id="back-btn">← ${t('common.back')}</button>
                    <h2>${t('assessment.title')}</h2>
                </header>
                
                <p class="assessment-subtitle">${t('assessment.subtitle')}</p>
                
                <div class="assessment-types">
                    ${this.renderAssessmentType('baseline')}
                    ${this.renderAssessmentType('quick')}
                    ${this.renderAssessmentType('focused')}
                </div>
            </div>
        `;
        
        this.attachStartListeners();
    }
    
    renderAssessmentType(type) {
        return `
            <div class="assessment-card">
                <h3>${t(`assessment.types.${type}.name`)}</h3>
                <p class="description">${t(`assessment.types.${type}.description`)}</p>
                <p class="duration">${t(`assessment.types.${type}.duration`)}</p>
                <button class="btn btn--primary" data-type="${type}">
                    ${t('assessment.start')}
                </button>
            </div>
        `;
    }
    
    renderInProgress(assessment) {
        const progress = Math.round((assessment.currentSectionIndex / assessment.sections.length) * 100);
        
        this.container.innerHTML = `
            <div class="assessment-page in-progress">
                <header class="assessment-header">
                    <div class="assessment-progress">
                        <span>${t('assessment.progress.section', {
                            current: assessment.currentSectionIndex + 1,
                            total: assessment.sections.length
                        })}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <button class="btn btn--ghost" id="pause-btn">⏸ Pause</button>
                </header>
                
                <div id="exercise-container"></div>
            </div>
        `;
        
        this.currentAssessment = assessment;
        this.loadCurrentSection();
        this.attachInProgressListeners();
    }
    
    renderInstructions(onStart) {
        this.container.innerHTML = `
            <div class="assessment-instructions">
                <h2>${t('assessment.instructions.title')}</h2>
                <p>${t('assessment.instructions.intro')}</p>
                
                <ul class="rules-list">
                    ${t('assessment.instructions.rules').map(rule => 
                        `<li>${rule}</li>`
                    ).join('')}
                </ul>
                
                <div class="instructions-actions">
                    <button class="btn btn--ghost" id="cancel-assessment">
                        ${t('common.cancel')}
                    </button>
                    <button class="btn btn--primary" id="start-assessment">
                        ${t('assessment.instructions.ready')}
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('start-assessment').addEventListener('click', onStart);
        document.getElementById('cancel-assessment').addEventListener('click', () => {
            this.renderStart();
        });
    }
    
    async loadCurrentSection() {
        const section = this.currentAssessment.sections[this.currentAssessment.currentSectionIndex];
        
        // Get appropriate data for this exercise type
        const data = await this.getSectionData(section);
        
        // Create exercise instance
        this.currentExercise = exerciseFactory.create(section.type);
        
        // Override the complete method to handle assessment flow
        const originalComplete = this.currentExercise.complete.bind(this.currentExercise);
        this.currentExercise.complete = () => {
            this.handleSectionComplete();
        };
        
        // Initialize exercise
        const container = document.getElementById('exercise-container');
        await this.currentExercise.init(data.slice(0, section.items), container);
    }
    
    async getSectionData(section) {
        // This should ideally come from a standardized assessment data set
        // For now, use the default data with difficulty filtering
        const app = await import('../../ui/App.js').then(m => m.default);
        return app.getExerciseData(section.type);
    }
    
    handleSectionComplete() {
        // Move to next section
        const nextSection = assessmentService.nextSection();
        
        if (nextSection) {
            // Load next section
            this.loadCurrentSection();
        } else {
            // Assessment complete
            const results = assessmentService.completeAssessment();
            this.renderResults(results);
        }
    }
    
    renderResults(results) {
        const recommendations = assessmentService.generateRecommendations(results);
        
        this.container.innerHTML = `
            <div class="assessment-results">
                <h2>${t('assessment.results.title')}</h2>
                
                <div class="overall-score">
                    <div class="score-value">${results.results.overallScore}%</div>
                    <div class="score-label">${t('assessment.results.overallScore')}</div>
                </div>
                
                <div class="results-breakdown">
                    <h3>${t('assessment.results.breakdown')}</h3>
                    <div class="breakdown-grid">
                        ${results.results.sectionBreakdown.map(section => `
                            <div class="section-result">
                                <span class="section-name">${t(`exercises.${section.type}.name`)}</span>
                                <div class="section-metrics">
                                    <span class="accuracy">${section.accuracy}%</span>
                                    ${section.avgResponseTime ? `
                                        <span class="response-time">${Math.round(section.avgResponseTime/1000)}s avg</span>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recommendations">
                    <h3>${t('assessment.results.recommendations')}</h3>
                    ${recommendations.map(rec => `
                        <div class="recommendation ${rec.priority}">
                            <span class="rec-message">${rec.message}</span>
                            <span class="rec-target">${rec.target}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="results-actions">
                    <button class="btn btn--primary" id="done-btn">
                        ${t('assessment.results.done')}
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('done-btn').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'progress' }));
        });
    }
    
    attachStartListeners() {
        // Assessment type selection
        this.container.querySelectorAll('[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.renderInstructions(() => {
                    const assessment = assessmentService.startAssessment(type);
                    this.renderInProgress(assessment);
                });
            });
        });
        
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'progress' }));
        });
    }
    
    attachInProgressListeners() {
        document.getElementById('pause-btn')?.addEventListener('click', () => {
            if (confirm('Pause assessment? You can resume later.')) {
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
            }
        });
    }
}

export default AssessmentPage;
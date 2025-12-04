import { t } from '../../core/i18n.js';
import exerciseFactory from '../../exercises/ExerciseFactory.js';
import modeService from '../../services/ModeService.js';


/**
 * Test Mode Page - Structured assessment with difficulty selection
 * Styled to match home page layout
 */
class TestModePage {
    constructor(container) {
        this.container = container;
    }
    
    render() {
        // Check if test is in progress
        if (modeService.getMode() === 'test') {
            this.renderInProgress();
        } else {
            this.renderStart();
        }
    }
    
    renderStart() {
        const categories = exerciseFactory.getExercisesByCategory();
        const categoryOrder = ['words', 'phonetics', 'meaning', 'time'];
        
        const categoryInfo = {
            words: { icon: '📚', name: t('home.categories.words') },
            phonetics: { icon: '🔊', name: t('home.categories.phonetics') },
            meaning: { icon: '💡', name: t('home.categories.meaning') },
            time: { icon: '⏰', name: t('home.categories.time') }
        };
        
        this.container.innerHTML = `
            <div class="test-mode-page">
                <div class="home-header">
                    <h1 class="home-title">📋 ${t('assessment.testMode')}</h1>
                    <p class="home-subtitle">${t('assessment.testModeDescription')}</p>
                </div>
                
                <div class="test-instructions">
                    <details>
                        <summary><strong>📖 ${t('assessment.instructions')}</strong></summary>
                        <ul>
                            <li>${t('assessment.instruction1')}</li>
                            <li>${t('assessment.instruction2')}</li>
                            <li>${t('assessment.instruction3')}</li>
                            <li>${t('assessment.instruction4')}</li>
                            <li>${t('assessment.instruction5')}</li>
                        </ul>
                    </details>
                </div>
                
                <div class="category-grid">
                    ${categoryOrder.map(category => {
                        const exercises = categories[category];
                        if (!exercises || exercises.length === 0) return '';
                        return `
                        <div class="category-card">
                            <div class="category-header">
                                <h3 class="category-title">
                                    <span class="category-icon">${categoryInfo[category].icon}</span>
                                    ${categoryInfo[category].name}
                                </h3>
                            </div>
                            <div class="exercise-grid test-exercise-grid">
                                ${exercises.map(ex => this.renderTestOption(ex)).join('')}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        this.attachListeners();
    }
    
    renderTestOption(exercise) {
        const recommended = modeService.getRecommendedDifficulty(exercise.type);
        
        return `
            <div class="exercise-card test-option-card" data-type="${exercise.type}">
                <span class="exercise-icon">${exercise.icon}</span>
                <span class="exercise-name">${t('exercises.' + exercise.type + '.name')}</span>
                <div class="test-controls">
                    <select class="difficulty-select compact-select" data-recommended="${recommended}">
                        <option value="easy" ${recommended === 'easy' ? 'selected' : ''}>
                            ${t('assessment.easy')}${recommended === 'easy' ? ' ⭐' : ''}
                        </option>
                        <option value="medium" ${recommended === 'medium' ? 'selected' : ''}>
                            ${t('assessment.medium')}${recommended === 'medium' ? ' ⭐' : ''}
                        </option>
                        <option value="hard" ${recommended === 'hard' ? 'selected' : ''}>
                            ${t('assessment.hard')}${recommended === 'hard' ? ' ⭐' : ''}
                        </option>
                    </select>
                    <select class="questions-select compact-select">
                        <option value="5">5 Q</option>
                        <option value="10" selected>10 Q</option>
                        <option value="15">15 Q</option>
                        <option value="20">20 Q</option>
                    </select>
                    <button class="btn btn--primary btn--compact start-test-btn">
                        ▶
                    </button>
                </div>
            </div>
        `;
    }
    
    renderInProgress() {
        const progress = modeService.getTestProgress();
        
        if (!progress) {
            this.renderStart();
            return;
        }
        
        const percentage = Math.round((progress.questionsAnswered / progress.total) * 100);
        
        this.container.innerHTML = `
            <div class="test-mode-page in-progress">
                <div class="test-progress-banner">
                    <h3>${t('assessment.testInProgress')}</h3>
                    <div class="progress-info">
                        <span>${t('assessment.question')} ${progress.questionsAnswered + 1} ${t('assessment.of')} ${progress.total}</span>
                        <span class="progress-percentage">${percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div id="test-exercise-container"></div>
            </div>
        `;
    }
    
    attachListeners() {
        // Start test buttons
        this.container.querySelectorAll('.start-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.test-option-card');
                const exerciseType = card.dataset.type;
                const difficulty = card.querySelector('.difficulty-select').value;
                const questions = parseInt(card.querySelector('.questions-select').value);
                
                this.startTest(exerciseType, difficulty, questions);
            });
        });
        
        // Prevent card click from triggering when clicking controls
        this.container.querySelectorAll('.test-controls').forEach(controls => {
            controls.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }
    
    startTest(exerciseType, difficulty, questions) {
        // Start test mode in ModeService
        modeService.startTestMode(exerciseType, difficulty);
        modeService.testConfig.totalQuestions = questions;
        
        // Dispatch event to start exercise with origin page
        window.dispatchEvent(new CustomEvent('startTest', {
            detail: { 
                exerciseType, 
                difficulty, 
                questions,
                originPage: 'assessment' // Track origin
            }
        }));
    }
}

export default TestModePage;
import { t } from '../../core/i18n.js';
import exerciseFactory from '../../exercises/ExerciseFactory.js';
import modeService from '../../services/ModeService.js';
import storageService from '../../services/StorageService.js';

/**
 * Test Mode Page - Structured assessment with difficulty selection
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
        
        this.container.innerHTML = `
            <div class="test-mode-page">
                <header class="page-header">
                    <h2>📋 ${t('assessment.testMode')}</h2>
                    <p class="test-subtitle">${t('assessment.testModeDescription')}</p>
                </header>
                
                <div class="test-instructions">
                    <h3>📖 ${t('assessment.instructions')}</h3>
                    <ul>
                        <li>${t('assessment.instruction1')}</li>
                        <li>${t('assessment.instruction2')}</li>
                        <li>${t('assessment.instruction3')}</li>
                        <li>${t('assessment.instruction4')}</li>
                        <li>${t('assessment.instruction5')}</li>
                    </ul>
                </div>
                
                <div class="test-setup">
                    <h3>${t('assessment.selectTest')}</h3>
                    
                    ${categoryOrder.map(category => {
                        const exercises = categories[category];
                        const categoryInfo = this.getCategoryInfo(category);
                        return `
                            <details class="test-category" open>
                                <summary class="category-header">
                                    <span class="category-icon">${categoryInfo.icon}</span>
                                    <span class="category-name">${categoryInfo.name}</span>
                                </summary>
                                <div class="test-exercises">
                                    ${exercises.map(ex => this.renderTestOption(ex)).join('')}
                                </div>
                            </details>
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
            <div class="test-option">
                <div class="test-option-header">
                    <span class="exercise-icon">${exercise.icon}</span>
                    <span class="exercise-name">${t('exercises.' + exercise.type + '.name')}</span>
                </div>
                <div class="test-option-settings">
                    <div class="difficulty-selector">
                        <label>${t('assessment.difficulty')}:</label>
                        <div class="difficulty-buttons">
                            <button class="difficulty-btn ${recommended === 'easy' ? 'recommended' : ''}" 
                                    data-difficulty="easy">
                                ${t('assessment.easy')}
                                ${recommended === 'easy' ? '⭐' : ''}
                            </button>
                            <button class="difficulty-btn ${recommended === 'medium' ? 'recommended' : ''}" 
                                    data-difficulty="medium">
                                ${t('assessment.medium')}
                                ${recommended === 'medium' ? '⭐' : ''}
                            </button>
                            <button class="difficulty-btn ${recommended === 'hard' ? 'recommended' : ''}" 
                                    data-difficulty="hard">
                                ${t('assessment.hard')}
                                ${recommended === 'hard' ? '⭐' : ''}
                            </button>
                        </div>
                    </div>
                    <div class="questions-selector">
                        <label>${t('assessment.questions')}:</label>
                        <select class="questions-select">
                            <option value="10">10 ${t('assessment.questions')}</option>
                            <option value="20" selected>20 ${t('assessment.questions')}</option>
                            <option value="30">30 ${t('assessment.questions')}</option>
                        </select>
                    </div>
                    <button class="btn btn--primary start-test-btn" 
                            data-type="${exercise.type}">
                        ${t('assessment.startTest')}
                    </button>
                </div>
            </div>
        `;
    }
    
    getCategoryInfo(category) {
        const info = {
            words: { icon: '📚', name: t('home.categories.words') },
            phonetics: { icon: '🔊', name: t('home.categories.phonetics') },
            meaning: { icon: '💡', name: t('home.categories.meaning') },
            time: { icon: '⏰', name: t('home.categories.time') }
        };
        return info[category] || { icon: '📚', name: category };
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
        // Difficulty button selection
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('difficulty-btn')) {
                const option = e.target.closest('.test-option');
                option.querySelectorAll('.difficulty-btn').forEach(btn => 
                    btn.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });
        
        // Start test buttons
        this.container.querySelectorAll('.start-test-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const exerciseType = btn.dataset.type;
                const option = btn.closest('.test-option');
                const selectedDiffBtn = option.querySelector('.difficulty-btn.selected');
                const difficulty = selectedDiffBtn ? 
                    selectedDiffBtn.dataset.difficulty : 
                    option.querySelector('.difficulty-btn.recommended')?.dataset.difficulty || 'easy';
                const questions = parseInt(option.querySelector('.questions-select').value);
                
                this.startTest(exerciseType, difficulty, questions);
            });
        });
    }
    
    startTest(exerciseType, difficulty, questions) {
        console.log('Starting test:', { exerciseType, difficulty, questions });
        
        // Start test mode in ModeService
        modeService.startTestMode(exerciseType, difficulty);
        modeService.testConfig.totalQuestions = questions;
        
        // Dispatch event to start exercise
        window.dispatchEvent(new CustomEvent('startTest', {
            detail: { exerciseType, difficulty, questions }
        }));
    }
}

export default TestModePage;

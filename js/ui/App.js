// js/ui/App.js

import { i18n, t } from '../core/i18n.js';
import Config from '../core/Config.js';
import exerciseFactory from '../exercises/ExerciseFactory.js';
import imageStorage from '../services/ImageStorageService.js';
import storageService from '../services/StorageService.js';
import trackingService from '../services/TrackingService.js';
import modeService from '../services/ModeService.js';
import wordbankService from '../services/WordbankService.js';
import ProgressPage from './pages/ProgressPage.js';
import SettingsPage from './pages/SettingsPage.js';
import CustomizePage from './pages/CustomizePage.js';
import TestModePage from './pages/TestModePage.js';

// Keep standalone exercise data imports
import { clockMatchingData } from '../../data/en/clockMatching.js';
import { timeSequencingData } from '../../data/en/timeSequencing.js';
import { timeOrderingData } from '../../data/en/timeOrdering.js';
import { workingMemoryData } from '../../data/en/workingMemory.js';

/**
 * Main application controller
 */
class App {
    constructor() {
        this.container = null;
        this.currentExercise = null;
    }
    
    async init() {
        Config.init();
        
        // Make app instance globally available for settings updates
        window.app = this;
        
        // Load saved locale or default to 'en'
        const savedLocale = localStorage.getItem('locale') || Config.get('ui.language') || 'en';
        await i18n.init(savedLocale);
        
        // Initialize wordbank service
        try {
            await wordbankService.init();
            console.log('Wordbank loaded:', wordbankService.wordbank.words.length, 'words');
        } catch (error) {
            console.error('Failed to load wordbank:', error);
            // Could show error UI here
        }
        
        await imageStorage.init();
        
        this.container = document.getElementById('main-content');
        
        this.setupNavigation();
        this.setupGlobalListeners();
        this.applySettings();
        this.updateNavigationLabels();
        
        this.showHome();
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navigate(page);
            });
        });
        
        this.updateNavigationLabels();
    }
    
    updateNavigationLabels() {
        const appTitle = document.querySelector('.app-title');
        if (appTitle) {
            appTitle.textContent = t('app.title');
        }
        
        document.querySelectorAll('.nav-btn[data-i18n-aria]').forEach(btn => {
            const key = btn.getAttribute('data-i18n-aria');
            btn.setAttribute('aria-label', t(key));
        });
    }
    
    setupGlobalListeners() {
        window.addEventListener('navigate', (e) => {
            this.navigate(e.detail);
        });
        
        window.addEventListener('exercise:restart', (e) => {
            this.startExercise(e.detail);
        });
        
        window.addEventListener('startTest', (e) => {
            this.startTestExercise(e.detail);
        });
    }
    
    navigate(page) {
        if (this.currentExercise) {
            this.currentExercise.destroy();
            this.currentExercise = null;
        }
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });
        
        switch (page) {
            case 'home':
                this.showHome();
                break;
            case 'progress':
                this.showProgress();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'customize':
                this.showCustomize();
                break;
            case 'assessment':
                this.showTestMode();
                break;
            default:
                this.showHome();
        }
    }
    
    showHome() {
        const categories = exerciseFactory.getExercisesByCategory();
        
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
        
        this.container.innerHTML = `
            <div class="home-page">
                <div class="home-header">
                    <h1 class="home-title">${t('home.speechTherapy')}</h1>
                    <p class="home-subtitle">${t('home.chooseExercise')}</p>
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
                            <div class="exercise-grid">
                                ${exercises.map(ex => {
                                    const available = this.isExerciseAvailable(ex.type);
                                    return `
                                    <button class="exercise-card ${!available ? 'disabled' : ''}" 
                                            data-type="${ex.type}"
                                            ${!available ? 'disabled' : ''}>
                                        <span class="exercise-icon">${ex.icon}</span>
                                        <span class="exercise-name">${t('exercises.' + ex.type + '.name')}</span>
                                        ${!available ? '<span class="exercise-unavailable">Coming soon</span>' : ''}
                                    </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        this.container.querySelectorAll('.exercise-card:not(.disabled)').forEach(card => {
            card.addEventListener('click', () => {
                const exerciseType = card.dataset.type;
                modeService.startPracticeMode(exerciseType);
                trackingService.startSession(exerciseType);
                this.startExercise(exerciseType, 'practice');
            });
        });
    }
    
    /**
     * Check if an exercise type has enough data to be available
     */
    isExerciseAvailable(type) {
        // Standalone exercises are always available
        const standaloneTypes = ['clockMatching', 'timeSequencing', 'timeOrdering', 'workingMemory'];
        if (standaloneTypes.includes(type)) {
            return true;
        }
        
        // Check wordbank service
        return wordbankService.isExerciseAvailable(type);
    }
    
    /**
     * Get exercise data from wordbank or standalone files
     */
    async getExerciseData(type) {
        const difficulty = this.getPracticeDifficulty(type);
        const filters = difficulty !== 'all' ? { difficulty } : {};
        
        let data = [];
        
        switch (type) {
            // Wordbank-based exercises
            case 'naming':
            case 'listening':
            case 'typing':
                data = wordbankService.buildNamingData(filters);
                break;
                
            case 'sentenceTyping':
                data = wordbankService.buildSentenceData(filters);
                break;
                
            case 'category':
                data = wordbankService.buildCategoryData(filters);
                break;
                
            case 'rhyming':
                data = wordbankService.buildRhymingData(filters);
                break;
                
            case 'firstSound':
                data = wordbankService.buildFirstSoundData(filters);
                break;
                
            case 'association':
                data = wordbankService.buildAssociationData(filters);
                break;
                
            case 'synonyms':
                data = wordbankService.buildSynonymData(filters);
                break;
                
            case 'definitions':
                data = wordbankService.buildDefinitionData(filters);
                break;
                
            case 'speaking':
                data = wordbankService.buildSpeakingData(filters);
                break;
                
            case 'scramble':
                data = wordbankService.buildScrambleData(filters);
                break;
                
            // Standalone exercises
            case 'clockMatching':
                data = this.filterByDifficulty(clockMatchingData, difficulty);
                break;
                
            case 'timeSequencing':
                data = this.filterByDifficulty(timeSequencingData, difficulty);
                break;
                
            case 'timeOrdering':
                data = this.filterByDifficulty(timeOrderingData, difficulty);
                break;
                
            case 'workingMemory':
                data = this.filterByDifficulty(workingMemoryData, difficulty);
                break;
                
            default:
                console.warn(`Unknown exercise type: ${type}`);
                data = [];
        }
        
        // Merge with custom exercises if any
        const customData = await this.getCustomExerciseData(type, difficulty);
        if (customData.length > 0) {
            data = [...data, ...customData];
        }
        
        return data;
    }
    
    /**
     * Get custom exercises for a type
     */
    async getCustomExerciseData(type, difficulty) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        let customData = (customExercises[type] || []).filter(e => e.status !== 'archived');
        
        if (difficulty && difficulty !== 'all') {
            customData = customData.filter(e => !e.difficulty || e.difficulty === difficulty);
        }
        
        return customData;
    }
    
    /**
     * Filter standalone data by difficulty
     */
    filterByDifficulty(data, difficulty) {
        if (!difficulty || difficulty === 'all') return [...data];
        return data.filter(item => !item.difficulty || item.difficulty === difficulty);
    }
    
    async startExercise(type, mode = 'practice') {
        const data = await this.getExerciseData(type);
        
        if (!data || data.length === 0) {
            this.showNoDataMessage(type);
            return;
        }
        
        this.currentExercise = exerciseFactory.create(type);
        this.currentExercise.mode = mode;
        await this.currentExercise.init(data, this.container);
    }
    
    async startTestExercise({ exerciseType, difficulty, questions }) {
        const filters = { difficulty };
        let data = [];
        
        switch (exerciseType) {
            case 'naming':
            case 'listening':
            case 'typing':
                data = wordbankService.buildNamingData(filters);
                break;
            case 'category':
                data = wordbankService.buildCategoryData(filters);
                break;
            case 'rhyming':
                data = wordbankService.buildRhymingData(filters);
                break;
            case 'firstSound':
                data = wordbankService.buildFirstSoundData(filters);
                break;
            case 'association':
                data = wordbankService.buildAssociationData(filters);
                break;
            case 'synonyms':
                data = wordbankService.buildSynonymData(filters);
                break;
            case 'definitions':
                data = wordbankService.buildDefinitionData(filters);
                break;
            case 'speaking':
                data = wordbankService.buildSpeakingData(filters);
                break;
            case 'sentenceTyping':
                data = wordbankService.buildSentenceData(filters);
                break;
            case 'scramble':
                data = wordbankService.buildScrambleData(filters);
                break;
            case 'clockMatching':
                data = this.filterByDifficulty(clockMatchingData, difficulty);
                break;
            case 'timeSequencing':
                data = this.filterByDifficulty(timeSequencingData, difficulty);
                break;
            case 'timeOrdering':
                data = this.filterByDifficulty(timeOrderingData, difficulty);
                break;
            case 'workingMemory':
                data = this.filterByDifficulty(workingMemoryData, difficulty);
                break;
            default:
                data = [];
        }
        
        if (!data || data.length === 0) {
            alert(`No data available for ${exerciseType} exercise at ${difficulty} difficulty`);
            return;
        }
        
        // Randomize and limit to question count
        data = this.shuffleArray(data).slice(0, questions);
        
        const testContainer = document.getElementById('test-exercise-container');
        const exerciseContainer = testContainer || this.container;
        
        this.currentExercise = exerciseFactory.create(exerciseType);
        this.currentExercise.mode = 'test';
        await this.currentExercise.init(data, exerciseContainer);
    }
    
    showNoDataMessage(type) {
        this.container.innerHTML = `
            <div class="no-data-message">
                <h2>No Data Available</h2>
                <p>There isn't enough data for the ${t(`exercises.${type}.name`)} exercise yet.</p>
                <button class="btn btn--primary" onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: 'home'}))">
                    Back to Home
                </button>
            </div>
        `;
    }
    
    getPracticeDifficulty(type) {
        const settings = storageService.get('practiceSettings', {});
        return settings[type] || storageService.get('defaultDifficulty', 'easy');
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    showProgress() {
        const page = new ProgressPage(this.container);
        page.render();
    }
    
    showSettings() {
        const page = new SettingsPage(this.container);
        page.render();
    }
    
    showCustomize() {
        const page = new CustomizePage(this.container);
        page.render();
    }
    
    showTestMode() {
        const page = new TestModePage(this.container);
        page.render();
    }
    
    applySettings() {
        const textSize = Config.get('ui.textSize') || 'medium';
        const highContrast = Config.get('ui.highContrast') || false;
        
        document.body.classList.remove('small-text', 'medium-text', 'large-text');
        document.body.classList.add(`${textSize}-text`);
        document.body.classList.toggle('high-contrast', highContrast);
    }
}

export const app = new App();
export default app;
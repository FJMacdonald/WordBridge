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
        this.currentPage = 'home'; // Track current page
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
            console.log('Wordbank loaded:', wordbankService.wordbank.words.length, 'words', wordbankService.wordbank);
        } catch (error) {
            console.error('Failed to load wordbank:', error);
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

        window.addEventListener('startPractice', (e) => {
            this.startPracticeExercise(e.detail);
        });
    }

    async startPracticeExercise({ exerciseType, difficulty }) {
        // Start practice mode for the specific exercise type
        modeService.startPracticeMode(exerciseType);
        trackingService.startSession(exerciseType);
        this.currentPage = 'home'; // Track that we're in practice mode from home
        await this.startExercise(exerciseType, 'practice');
    }

    navigate(page) {
        if (this.currentExercise) {
            this.currentExercise.destroy();
            this.currentExercise = null;
        }

        this.currentPage = page; // Track current page

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
                    <h1 class="home-title">🗣️ ${t('home.speechTherapy')}</h1>
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

    isExerciseAvailable(type) {
        const standaloneTypes = ['clockMatching', 'timeSequencing', 'timeOrdering', 'workingMemory'];
        if (standaloneTypes.includes(type)) {
            return true;
        }
        return wordbankService.isExerciseAvailable(type);
    }

    async getExerciseData(type) {
        const difficulty = this.getPracticeDifficulty(type);
        const filters = difficulty !== 'all' ? { difficulty } : {};
        const customFrequency = Config.get('exercises.customFrequency') || 'mixed';

        let data = [];
        let customData = [];

        // Get custom exercises first
        customData = await this.getCustomExerciseData(type, difficulty);

        // Handle different custom frequency settings
        if (customFrequency === 'only') {
            // ONLY custom exercises
            return customData;
        }

        // Get wordbank data for non-standalone exercises
        const standaloneTypes = ['clockMatching', 'timeSequencing', 'timeOrdering', 'workingMemory'];

        if (!standaloneTypes.includes(type)) {
            // Get data from wordbank
            switch (type) {
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
                default:
                    console.warn(`Unknown exercise type: ${type}`);
                    data = [];
            }
        } else {
            // Standalone exercises (time category)
            switch (type) {
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
            }
        }

        // Mix based on frequency setting
        if (customFrequency === 'high' && customData.length > 0) {
            // High frequency: 50% custom, 50% regular
            const halfSize = Math.floor(data.length / 2);
            const regularData = this.shuffleArray(data).slice(0, halfSize);
            const customDataSized = this.shuffleArray(customData).slice(0, halfSize);
            data = [...regularData, ...customDataSized];
        } else if (customFrequency === 'mixed' && customData.length > 0) {
            // Mixed: combine all and shuffle
            data = [...data, ...customData];
        }

        return data;
    }

    async getCustomExerciseData(type, difficulty) {
        const locale = i18n.getCurrentLocale();
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        let customData = (customExercises[type] || []).filter(e => e.status !== 'archived');

        if (difficulty && difficulty !== 'all') {
            customData = customData.filter(e => !e.difficulty || e.difficulty === difficulty);
        }

        return customData;
    }

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
        await this.currentExercise.init(data, this.container, {
            originPage: this.currentPage
        });
    }

    async startTestExercise({ exerciseType, difficulty, questions, wordList, isRetake, originalTestId, originPage }) {
        let data = [];

        // Track origin page - default to assessment if not specified
        const testOriginPage = originPage || this.currentPage || 'assessment';

        // If this is a retake with a specific word list, use that
        if (isRetake && wordList && wordList.length > 0) {
            data = await this.rebuildTestDataFromWordList(exerciseType, wordList, difficulty);
            console.log(`Retake: rebuilt ${data.length} items from word list of ${wordList.length}`);
        } else {
            // Normal test - get new data
            const filters = { difficulty };

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

            // Randomize and limit to question count
            data = this.shuffleArray(data).slice(0, questions);
        }

        if (!data || data.length === 0) {
            alert(`No data available for ${exerciseType} exercise at ${difficulty} difficulty`);
            return;
        }

        const testContainer = document.getElementById('test-exercise-container');
        const exerciseContainer = testContainer || this.container;

        this.currentExercise = exerciseFactory.create(exerciseType);
        this.currentExercise.mode = 'test';

        await this.currentExercise.init(data, exerciseContainer, {
            originPage: testOriginPage,
            isRetake,
            originalTestId
        });
    }

    /**
     * Rebuild test data from a word list (for retakes)
     */
    async rebuildTestDataFromWordList(exerciseType, wordList, difficulty) {
        // Get all available data for this exercise type (no difficulty filter for retakes)
        let allData = [];

        switch (exerciseType) {
            case 'naming':
            case 'listening':
            case 'typing':
                allData = wordbankService.buildNamingData({});
                break;
            case 'category':
                allData = wordbankService.buildCategoryData({});
                break;
            case 'rhyming':
                allData = wordbankService.buildRhymingData({});
                break;
            case 'firstSound':
                allData = wordbankService.buildFirstSoundData({});
                break;
            case 'association':
                allData = wordbankService.buildAssociationData({});
                break;
            case 'synonyms':
                allData = wordbankService.buildSynonymData({});
                break;
            case 'definitions':
                allData = wordbankService.buildDefinitionData({});
                break;
            case 'speaking':
                allData = wordbankService.buildSpeakingData({});
                break;
            case 'sentenceTyping':
                allData = wordbankService.buildSentenceData({});
                break;
            case 'scramble':
                allData = wordbankService.buildScrambleData({});
                break;
            case 'clockMatching':
                allData = [...clockMatchingData];
                break;
            case 'timeSequencing':
                allData = [...timeSequencingData];
                break;
            case 'timeOrdering':
                allData = [...timeOrderingData];
                break;
            case 'workingMemory':
                allData = [...workingMemoryData];
                break;
        }

        // Filter to only include items from the word list, maintaining order
        const rebuiltData = [];
        for (const wordId of wordList) {
            const item = allData.find(d => {
                // Try multiple possible ID fields
                const itemId = d.id || d.word || d.text || d.answer || d.target;
                return itemId === wordId;
            });
            if (item) {
                rebuiltData.push(item);
            } else {
                console.warn(`Could not find item for wordId: ${wordId}`);
            }
        }

        return rebuiltData;
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
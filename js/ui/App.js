import { i18n, t } from '../core/i18n.js';
import Config from '../core/Config.js';
import exerciseFactory from '../exercises/ExerciseFactory.js';
import imageStorage from '../services/ImageStorageService.js';
import storageService from '../services/StorageService.js';
import trackingService from '../services/TrackingService.js';
import modeService from '../services/ModeService.js';
import ProgressPage from './pages/ProgressPage.js';
import SettingsPage from './pages/SettingsPage.js';
import CustomizePage from './pages/CustomizePage.js';
import AssessmentPage from './pages/AssessmentPage.js';
import TestModePage from './pages/TestModePage.js';
import ExampleDataGenerator from '../services/ExampleDataGenerator.js';

// Import all default data
import { namingData } from '../../data/default/naming.js';
import { sentenceData } from '../../data/default/sentences.js';
import { categoryData } from '../../data/default/categories.js';
import { rhymingData } from '../../data/default/rhyming.js';
import { firstSoundData } from '../../data/default/firstSounds.js';
import { associationData } from '../../data/default/associations.js';
import { synonymData } from '../../data/default/synonyms.js';
import { definitionData } from '../../data/default/definitions.js';
import { scrambleData } from '../../data/default/scramble.js';
import { speakingData } from '../../data/default/speaking.js';
import { timeOrderingData } from '../../data/default/timeOrdering.js';
import { clockMatchingData } from '../../data/default/clockMatching.js';
import { timeSequencingData } from '../../data/default/timeSequencing.js';
import { workingMemoryData } from '../../data/default/workingMemory.js';
/**
 * Main application controller
 */
class App {
    constructor() {
        this.container = null;
        this.currentExercise = null;
        this.defaultData = {
            naming: namingData,
            sentenceTyping: sentenceData,
            category: categoryData,
            rhyming: rhymingData,
            firstSound: firstSoundData,
            association: associationData,
            synonyms: synonymData,
            definitions: definitionData,
            listening: namingData,
            speaking: speakingData,
            scramble: scrambleData,
            typing: namingData,
            clockMatching: clockMatchingData,
            timeOrdering: timeOrderingData,
            timeSequencing: timeSequencingData,
            workingMemory: workingMemoryData
        };
    }
    
    async init() {
        Config.init();
        
        // Make app instance globally available for settings updates
        window.app = this;
        
        // Load saved locale or default to 'en'
        const savedLocale = localStorage.getItem('locale') || Config.get('ui.language') || 'en';
        await i18n.init(savedLocale);
        
        await imageStorage.init();
        
        this.container = document.getElementById('main-content');
        
        this.setupNavigation();
        this.setupGlobalListeners();
        this.applySettings();
        this.updateNavigationLabels();

        // Generate 6 months of example data
        const generator = new ExampleDataGenerator();
        const exampleData = generator.generateHistoricalData(6);

        // Load into storage for testing
        Object.entries(exampleData).forEach(([key, value]) => {
            storageService.set(key, value);
        });
        
        this.showHome();
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navigate(page);
            });
        });
        
        // Update navigation with current locale
        this.updateNavigationLabels();
    }
    
    updateNavigationLabels() {
        // Update app title
        const appTitle = document.querySelector('.app-title');
        if (appTitle) {
            appTitle.textContent = t('app.title');
        }
        
        // Update navigation aria labels  
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
        
        // Update nav buttons
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
        
        // Category order: words, phonetics, meaning, time
        const categoryOrder = ['words', 'phonetics', 'meaning', 'time'];
        
        const categoryInfo = {
            words: {
                name: t('home.categories.words'),
                icon: '📚',
                description: 'Recognition and typing'
            },
            phonetics: {
                name: t('home.categories.phonetics'),
                icon: '🔊',
                description: 'Sounds and pronunciation'
            },
            meaning: {
                name: t('home.categories.meaning'),
                icon: '💡',
                description: 'Understanding word meanings'
            },
            time: {
                name: t('home.categories.time'),
                icon: '⏰',
                description: 'Temporal concepts'
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
                                ${exercises.map(ex => `
                                    <button class="exercise-card" data-type="${ex.type}">
                                        <span class="exercise-icon">${ex.icon}</span>
                                        <span class="exercise-name">${t('exercises.' + ex.type + '.name')}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Attach listeners - homepage starts practice mode
        this.container.querySelectorAll('.exercise-card').forEach(card => {
            card.addEventListener('click', () => {
                const exerciseType = card.dataset.type;
                // Start practice mode
                modeService.startPracticeMode(exerciseType);
                trackingService.startSession(exerciseType);
                this.startExercise(exerciseType, 'practice');
            });
        });
    }
    
    /**
     * Get exercise data (default + custom)
     */
    async getExerciseData(type) {
        // Try to load locale-specific data
        const locale = i18n.getCurrentLocale();
        let defaultData = this.defaultData[type] || [];
        
        // If German, try to load German version for specific exercises
        if (locale === 'de') {
            try {
                let germanData;
                switch (type) {
                    case 'naming':
                    case 'listening':
                    case 'typing':
                        germanData = await import(`../../data/de/naming.js`);
                        defaultData = germanData.namingData || defaultData;
                        break;
                    case 'sentenceTyping':
                        // Try to load German sentence data
                        try {
                            germanData = await import(`../../data/de/sentences.js`);
                            defaultData = germanData.sentenceData || defaultData;
                        } catch (e) {
                            console.warn('German sentence data not available, using English');
                        }
                        break;
                    case 'category':
                        try {
                            germanData = await import(`../../data/de/categories.js`);
                            defaultData = germanData.categoryData || defaultData;
                        } catch (e) {
                            console.warn('German category data not available, using English');
                        }
                        break;
                    case 'rhyming':
                        try {
                            germanData = await import(`../../data/de/rhyming.js`);
                            defaultData = germanData.rhymingData || defaultData;
                        } catch (e) {
                            console.warn('German rhyming data not available, using English');
                        }
                        break;
                    case 'firstSound':
                        try {
                            germanData = await import(`../../data/de/firstSounds.js`);
                            defaultData = germanData.firstSoundData || defaultData;
                        } catch (e) {
                            console.warn('German first sound data not available, using English');
                        }
                        break;
                    case 'association':
                        try {
                            germanData = await import(`../../data/de/associations.js`);
                            defaultData = germanData.associationData || defaultData;
                        } catch (e) {
                            console.warn('German association data not available, using English');
                        }
                        break;
                    case 'synonyms':
                        try {
                            germanData = await import(`../../data/de/synonyms.js`);
                            defaultData = germanData.synonymData || defaultData;
                        } catch (e) {
                            console.warn('German synonym data not available, using English');
                        }
                        break;
                    case 'definitions':
                        try {
                            germanData = await import(`../../data/de/definitions.js`);
                            defaultData = germanData.definitionData || defaultData;
                        } catch (e) {
                            console.warn('German definition data not available, using English');
                        }
                        break;
                    case 'scramble':
                        try {
                            germanData = await import(`../../data/de/scramble.js`);
                            defaultData = germanData.scrambleData || defaultData;
                        } catch (e) {
                            console.warn('German scramble data not available, using English');
                        }
                        break;
                    case 'speaking':
                        try {
                            germanData = await import(`../../data/de/speaking.js`);
                            defaultData = germanData.speakingData || defaultData;
                        } catch (e) {
                            console.warn('German speaking data not available, using English');
                        }
                        break;
                    case 'timeSequencing':
                        try {
                            germanData = await import(`../../data/de/timeSequencing.js`);
                            defaultData = germanData.timeSequencingData || defaultData;
                        } catch (e) {
                            console.warn('German time sequencing data not available, using English');
                        }
                        break;
                    case 'clockMatching':
                        try {
                            germanData = await import(`../../data/de/clockMatching.js`);
                            defaultData = germanData.clockMatchingData || defaultData;
                        } catch (e) {
                            console.warn('German clock matching data not available, using English');
                        }
                        break;
                    case 'timeOrdering':
                        try {
                            germanData = await import(`../../data/de/timeOrdering.js`);
                            defaultData = germanData.timeOrderingData || defaultData;
                        } catch (e) {
                            console.warn('German time ordering data not available, using English');
                        }
                        break;
                    case 'workingMemory':
                        try {
                            germanData = await import(`../../data/de/workingMemory.js`);
                            defaultData = germanData.workingMemoryData || defaultData;
                        } catch (e) {
                            console.warn('German working memory data not available, using English');
                        }
                        break;
                }
            } catch (e) {
                console.warn('German data not available for ' + type + ', using English');
            }
        }
        
        const customExercises = storageService.get(`customExercises_${locale}`, {});
        const customData = customExercises[type] || [];
        
        // Get custom exercise frequency setting
        const customFrequency = Config.get('exercises.customFrequency') || 'mixed';
        
        if (customFrequency === 'only') {
            // Use only custom exercises - even if empty, don't fall back to default
            return customData;
        } else if (customFrequency === 'high' && customData.length > 0) {
            // 70% custom, 30% default
            const combined = [];
            const targetSize = Math.max(customData.length * 2, 20);
            while (combined.length < targetSize) {
                if (Math.random() < 0.7 && customData.length > 0) {
                    combined.push(customData[Math.floor(Math.random() * customData.length)]);
                } else if (defaultData.length > 0) {
                    combined.push(defaultData[Math.floor(Math.random() * defaultData.length)]);
                }
            }
            return combined;
        } else {
            // Mixed: merge default and custom
            return [...defaultData, ...customData];
        }
    }
    
    async startExercise(type, mode = 'practice') {
        const data = await this.getExerciseData(type);
        
        if (!data || data.length === 0) {
            alert(`No data available for ${type} exercise`);
            return;
        }
        
        // Filter by difficulty if in practice mode
        let exerciseData = data;
        if (mode === 'practice') {
            const practiceDifficulty = this.getPracticeDifficulty(type);
            exerciseData = data.filter(item => !item.difficulty || item.difficulty === practiceDifficulty);
            if (exerciseData.length === 0) {
                exerciseData = data; // Fallback to all data
            }
        }
        
        this.currentExercise = exerciseFactory.create(type);
        this.currentExercise.mode = mode;
        await this.currentExercise.init(exerciseData, this.container);
    }
    
    async startTestExercise({ exerciseType, difficulty, questions }) {
        const data = await this.getExerciseData(exerciseType);
        
        if (!data || data.length === 0) {
            alert(`No data available for ${exerciseType} exercise`);
            return;
        }
        
        // Filter by difficulty
        let testData = data.filter(item => !item.difficulty || item.difficulty === difficulty);
        if (testData.length === 0) {
            testData = data; // Fallback
        }
        
        // Randomize and limit to question count
        testData = this.shuffleArray(testData).slice(0, questions);
        
        // Find the test exercise container (should be available when in test mode)
        const testContainer = document.getElementById('test-exercise-container');
        const exerciseContainer = testContainer || this.container;
        
        this.currentExercise = exerciseFactory.create(exerciseType);
        this.currentExercise.mode = 'test';
        await this.currentExercise.init(testData, exerciseContainer);
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
    
    showAssessment() {
        const page = new AssessmentPage(this.container);
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
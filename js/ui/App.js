import { i18n, t } from '../core/i18n.js';
import Config from '../core/Config.js';
import exerciseFactory from '../exercises/ExerciseFactory.js';
import imageStorage from '../services/ImageStorageService.js';
import storageService from '../services/StorageService.js';
import trackingService from '../services/TrackingService.js';
import ProgressPage from './pages/ProgressPage.js';
import SettingsPage from './pages/SettingsPage.js';
import CustomizePage from './pages/CustomizePage.js';
import AssessmentPage from './pages/AssessmentPage.js';
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
            typing: namingData
        };
    }
    
    async init() {
        Config.init();
        await i18n.init('en');
        await imageStorage.init();
        
        this.container = document.getElementById('main-content');
        
        this.setupNavigation();
        this.setupGlobalListeners();
        this.applySettings();

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
    }
    
    
    setupGlobalListeners() {
        window.addEventListener('navigate', (e) => {
            this.navigate(e.detail);
        });
        
        window.addEventListener('exercise:restart', (e) => {
            this.startExercise(e.detail);
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
                this.showAssessment();
                break;
            default:
                this.showHome();
        }
    }
    
    showHome() {
        const categories = exerciseFactory.getExercisesByCategory();
        const categoryInfo = {
            meaning: {
                name: 'Meaning',
                icon: '💡',
                description: 'Understanding word meanings'
            },
            phonetics: {
                name: 'Phonetics',
                icon: '🔊',
                description: 'Sounds and pronunciation'
            },
            words: {
                name: 'Words',
                icon: '📚',
                description: 'Recognition and spelling'
            }
        };
        
        this.container.innerHTML = `
            <div class="home-page">
                <div class="home-header">
                    <h1 class="home-title">Speech Therapy</h1>
                    <p class="home-subtitle">Choose an exercise to practice</p>
                </div>
                
                <div class="category-grid">
                    ${Object.entries(categories).map(([category, exercises]) => `
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
                                        <span class="exercise-name">${ex.name}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Attach listeners
        this.container.querySelectorAll('.exercise-card').forEach(card => {
            card.addEventListener('click', () => {
                trackingService.startSession(card.dataset.type);
                this.startExercise(card.dataset.type);
            });
        });
        console.log(storageService.get('dailyStats'));
        console.log(storageService.get('exerciseTypeStats'));
        console.log(storageService.get('wordStats'));
    }
    
    /**
     * Get exercise data (default + custom)
     */
    getExerciseData(type) {
        const defaultData = this.defaultData[type] || [];
        const customExercises = storageService.get('customExercises', {});
        const customData = customExercises[type] || [];
        
        // Get custom exercise frequency setting
        const customFrequency = Config.get('exercises.customFrequency') || 'mixed';
        
        if (customFrequency === 'only' && customData.length > 0) {
            // Use only custom exercises
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
    
    async startExercise(type) {
        const data = this.getExerciseData(type);
        
        if (!data || data.length === 0) {
            alert(`No data available for ${type} exercise`);
            return;
        }
        
        this.currentExercise = exerciseFactory.create(type);
        await this.currentExercise.init(data, this.container);
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
import { i18n, t } from '../core/i18n.js';
import Config from '../core/Config.js';
import exerciseFactory from '../exercises/ExerciseFactory.js';
import imageStorage from '../services/ImageStorageService.js';
import storageService from '../services/StorageService.js';
import ProgressPage from './pages/ProgressPage.js';
import SettingsPage from './pages/SettingsPage.js';
import CustomizePage from './pages/CustomizePage.js';

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
            default:
                this.showHome();
        }
    }
    
    showHome() {
        const categories = exerciseFactory.getExercisesByCategory();
        const categoryNames = {
            vocabulary: '📚 Vocabulary',
            comprehension: '👂 Comprehension',
            production: '🎤 Production',
            spelling: '✏️ Spelling',
            sentences: '📝 Sentences',
            phonology: '🔤 Sounds',
            semantics: '🔗 Meaning'
        };
        
        this.container.innerHTML = `
            <div class="home-page">
                <h2>${t('home.title')}</h2>
                <p class="home-subtitle">${t('home.subtitle')}</p>
                
                <div class="home-actions">
                    <button class="btn btn--secondary" id="customize-btn">
                        ✏️ Customize
                    </button>
                </div>
                
                <div class="exercise-categories">
                    ${Object.entries(categories).map(([cat, exercises]) => `
                        <div class="category-section">
                            <h3 class="category-title">${categoryNames[cat] || cat}</h3>
                            <div class="exercise-list">
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
                this.startExercise(card.dataset.type);
            });
        });
        
        this.container.querySelector('#customize-btn')?.addEventListener('click', () => {
            this.navigate('customize');
        });
    }
    
    /**
     * Get exercise data (default + custom)
     */
    getExerciseData(type) {
        const defaultData = this.defaultData[type] || [];
        const customExercises = storageService.get('customExercises', {});
        const customData = customExercises[type] || [];
        
        // Merge default and custom
        return [...defaultData, ...customData];
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
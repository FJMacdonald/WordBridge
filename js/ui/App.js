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
        this.addGlobalStyles();
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
    
    addGlobalStyles() {
        if (document.getElementById('app-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'app-styles';
        style.textContent = `
            /* Text size classes */
            .small-text { --font-size-base: 0.875rem; }
            .medium-text { --font-size-base: 1rem; }
            .large-text { --font-size-base: 1.25rem; }
            
            /* High contrast mode */
            .high-contrast {
                --color-text: #000000;
                --color-background: #ffffff;
                --color-surface: #ffffff;
                --color-border: #000000;
                --color-primary: #0000cc;
            }
            
            .home-page {
                text-align: center;
                padding: var(--space-lg) 0;
            }
            .home-subtitle {
                color: var(--color-text-muted);
                margin-bottom: var(--space-lg);
            }
            .home-actions {
                margin-bottom: var(--space-xl);
            }
            .exercise-categories {
                text-align: left;
            }
            .category-section {
                margin-bottom: var(--space-xl);
            }
            .category-title {
                font-size: var(--font-size-base);
                color: var(--color-text-muted);
                margin-bottom: var(--space-md);
                padding-bottom: var(--space-sm);
                border-bottom: 1px solid var(--color-border);
            }
            .exercise-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: var(--space-md);
            }
            .exercise-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-sm);
                padding: var(--space-lg);
                background: var(--color-surface);
                border: 2px solid var(--color-border);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            .exercise-card:hover {
                border-color: var(--color-primary);
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
            .exercise-icon {
                font-size: 2rem;
            }
            .exercise-name {
                font-size: var(--font-size-sm);
                font-weight: 500;
                text-align: center;
            }
            
            /* Results page */
            .exercise-complete {
                text-align: center;
                padding: var(--space-2xl) 0;
            }
            .results-stats {
                display: flex;
                justify-content: center;
                gap: var(--space-xl);
                margin: var(--space-2xl) 0;
            }
            .stat {
                text-align: center;
            }
            .stat-value {
                display: block;
                font-size: var(--font-size-2xl);
                font-weight: 700;
                color: var(--color-primary);
            }
            .stat-label {
                font-size: var(--font-size-sm);
                color: var(--color-text-muted);
            }
            .results-actions {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
                max-width: 300px;
                margin: 0 auto;
            }
            
            /* Speaking exercise */
            .speaking-actions {
                display: flex;
                gap: var(--space-md);
                justify-content: center;
                margin-top: var(--space-xl);
            }
            .btn--success {
                background: var(--color-success);
                color: white;
            }
            .btn--success:hover {
                background: #4a9c4a;
            }
            .btn--error {
                background: var(--color-error);
                color: white;
            }
            .btn--error:hover {
                background: #c0413d;
            }
            .hint-area {
                min-height: 80px;
            }
            .hint-item {
                padding: var(--space-md);
                margin: var(--space-sm) 0;
                border-radius: var(--radius-md);
                background: var(--color-primary-light);
            }
            .hint-letters {
                font-size: var(--font-size-xl);
                font-family: monospace;
                letter-spacing: 0.3em;
            }
            .hint-phrase {
                font-style: italic;
            }
            .hint-answer {
                background: var(--color-success-light);
                font-weight: bold;
            }
            .hint-answer.revealed {
                font-size: var(--font-size-lg);
            }
            
            /* Synonym badge */
            .synonym-type-badge {
                display: inline-block;
                padding: var(--space-xs) var(--space-md);
                border-radius: var(--radius-full);
                font-size: var(--font-size-sm);
                font-weight: 600;
                margin-bottom: var(--space-md);
            }
            .synonym-type-badge.synonym {
                background: var(--color-success-light);
                color: var(--color-success);
            }
            .synonym-type-badge.antonym {
                background: var(--color-error-light);
                color: var(--color-error);
            }
            
            /* Definition prompt */
            .prompt-definition {
                font-size: var(--font-size-lg);
                font-style: italic;
                padding: var(--space-lg);
                background: var(--color-surface);
                border-left: 4px solid var(--color-primary);
                border-radius: var(--radius-md);
                margin: var(--space-lg) 0;
            }
            
            /* Category prompt */
            .prompt-category {
                font-size: var(--font-size-xl);
                font-weight: 700;
                color: var(--color-primary);
                padding: var(--space-md);
                background: var(--color-primary-light);
                border-radius: var(--radius-lg);
                display: inline-block;
            }
            
            /* Target word */
            .prompt-target-word {
                font-size: var(--font-size-2xl);
                font-weight: 700;
                margin: var(--space-lg) 0;
            }
            
            /* Listening exercise */
            .option-btn--emoji {
                padding: var(--space-lg);
            }
            .option-emoji-large {
                font-size: 3rem;
            }
            
            /* Page container */
            .page {
                text-align: center;
                padding: var(--space-xl) 0;
            }
            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-xl);
            }
        `;
        document.head.appendChild(style);
    }
}

export const app = new App();
export default app;
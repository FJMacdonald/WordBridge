import Config from '../../core/Config.js';
import storageService from '../../services/StorageService.js';
import importExportService from '../../services/ImportExportService.js';
import pdfService from '../../services/PDFService.js';
import exerciseFactory from '../../exercises/ExerciseFactory.js';
import { i18n, t } from '../../core/i18n.js';

/**
 * Settings page
 */
class SettingsPage {
    constructor(container) {
        this.container = container;
        this.availableVoices = [];
    }
    
    async render() {
        // Get available voices
        await this.loadVoices();
        
        const settings = {
            textSize: Config.get('ui.textSize') || 'medium',
            highContrast: Config.get('ui.highContrast') || false,
            language: Config.get('ui.language') || 'en',
            voiceIndex: Config.get('audio.voiceIndex') || 0,
            autoPlay: Config.get('audio.autoPlay') !== false,
            speechRate: Config.get('audio.speechRate') || 0.85,
            customFrequency: Config.get('exercises.customFrequency') || 'mixed',
            problemWordFrequency: Config.get('exercises.problemWordFrequency') || 0.3,
            masteryThreshold: Config.get('tracking.masteryThreshold') || 3,
            removeAfterMastery: Config.get('exercises.removeAfterMastery') || false
        };
        
        this.container.innerHTML = `
            <div class="settings-page">
                <header class="home-header">
                    <h1 class="home-title">⚙️ ${t('settings.title')}</h1>
                    <p class="home-subtitle">${t('settings.subtitle') || 'Personalize your learning experience'}</p>
                </header>
                
                <!-- Top 4 sections in 2x2 grid -->
                <div class="settings-top-grid">
                    <!-- Display Settings -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="card-icon">📱</span>
                                ${t('settings.sections.display')}
                            </h3>
                        </div>
                        <div class="settings-list">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.textSize')}</label>
                                </div>
                                <select id="text-size" class="setting-select">
                                    <option value="small" ${settings.textSize === 'small' ? 'selected' : ''}>${t('settings.options.small')}</option>
                                    <option value="medium" ${settings.textSize === 'medium' ? 'selected' : ''}>${t('settings.options.medium')}</option>
                                    <option value="large" ${settings.textSize === 'large' ? 'selected' : ''}>${t('settings.options.large')}</option>
                                </select>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.highContrast')}</label>
                                </div>
                                <label class="toggle">
                                    <input type="checkbox" id="high-contrast" ${settings.highContrast ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.language')}</label>
                                </div>
                                <select id="language-select" class="setting-select">
                                    <option value="en" ${i18n.getCurrentLocale() === 'en' ? 'selected' : ''}>English</option>
                                    <option value="de" ${i18n.getCurrentLocale() === 'de' ? 'selected' : ''}>Deutsch</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Audio Settings -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="card-icon">🔊</span>
                                ${t('settings.sections.audio')}
                            </h3>
                        </div>
                        <div class="settings-list">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.options.voiceSelection')}</label>
                                </div>
                                <select id="voice-select" class="setting-select voice-select">
                                    ${this.availableVoices.map((voice, index) => `
                                        <option value="${index}" ${settings.voiceIndex === index ? 'selected' : ''}>
                                            ${voice.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="setting-item">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.options.autoPlayQuestions')}</label>
                                </div>
                                <label class="toggle">
                                    <input type="checkbox" id="auto-play" ${settings.autoPlay ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item setting-item--vertical">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.options.speechSpeed')}</label>
                                </div>
                                <div class="range-control">
                                    <input type="range" id="speech-rate" 
                                           min="0.5" max="1.2" step="0.05" 
                                           value="${settings.speechRate}">
                                    <span class="range-value">${settings.speechRate.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div class="setting-item setting-item--action">
                                <button class="btn btn--secondary btn--small" id="test-voice-btn">
                                    🔊 ${t('settings.options.testVoice')}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Custom Exercise Frequency -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="card-icon">➕</span>
                                Custom Exercises
                            </h3>
                        </div>
                        <div class="settings-list">
                            <div class="setting-item setting-item--vertical">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.options.customExerciseFrequency')}</label>
                                    <p class="setting-description">${t('settings.options.customFrequencyDesc')}</p>
                                </div>
                                <select id="custom-frequency" class="setting-select">
                                    <option value="mixed" ${settings.customFrequency === 'mixed' ? 'selected' : ''}>
                                        ${t('settings.frequencies.mixed')}
                                    </option>
                                    <option value="high" ${settings.customFrequency === 'high' ? 'selected' : ''}>
                                        ${t('settings.frequencies.high')}
                                    </option>
                                    <option value="only" ${settings.customFrequency === 'only' ? 'selected' : ''}>
                                        ${t('settings.frequencies.only')}
                                    </option>
                                </select>
                            </div>
                            
                            <div class="setting-item setting-item--vertical">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.options.problemWordFrequency')}</label>
                                    <p class="setting-description">${t('settings.options.problemFrequencyDesc')}</p>
                                </div>
                                <div class="range-control">
                                    <input type="range" id="problem-frequency" 
                                           min="0.1" max="0.5" step="0.1" 
                                           value="${settings.problemWordFrequency}">
                                    <span class="range-value">
                                        ${Math.round(settings.problemWordFrequency * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mastery Settings -->
                    <div class="settings-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="card-icon">🎯</span>
                                Mastery Tracking
                            </h3>
                        </div>
                        <div class="settings-list">
                            <div class="setting-item setting-item--vertical">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.options.masteryStreak')}</label>
                                    <p class="setting-description">${t('settings.options.masteryStreakDesc')}</p>
                                </div>
                                <select id="mastery-threshold" class="setting-select">
                                    <option value="2" ${settings.masteryThreshold === 2 ? 'selected' : ''}>${t('settings.times.2times')}</option>
                                    <option value="3" ${settings.masteryThreshold === 3 ? 'selected' : ''}>${t('settings.times.3times')}</option>
                                    <option value="4" ${settings.masteryThreshold === 4 ? 'selected' : ''}>${t('settings.times.4times')}</option>
                                    <option value="5" ${settings.masteryThreshold === 5 ? 'selected' : ''}>${t('settings.times.5times')}</option>
                                </select>
                            </div>
                            
                            <div class="setting-item setting-item--vertical">
                                <div class="setting-info">
                                    <label class="setting-label">${t('settings.options.hideMasteredWords')}</label>
                                    <p class="setting-description">${t('settings.options.hideMasteredDesc')}</p>
                                </div>
                                <label class="toggle">
                                    <input type="checkbox" id="remove-mastery" ${settings.removeAfterMastery ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Difficulty Settings - Category Grouped Grid -->
                <details class="settings-card settings-card--full difficulty-card" open>
                    <summary class="card-header card-header--collapsible">
                        <h3 class="card-title">
                            <span class="card-icon">🎯</span>
                            ${t('settings.practiceDifficulty') || 'Practice Difficulty'}
                            <span class="toggle-icon">▼</span>
                        </h3>
                    </summary>
                    <p class="card-description">${t('settings.practiceDifficultyDesc') || 'Set the difficulty level for each exercise type'}</p>
                    
                    <!-- Change All Option -->
                    <div class="change-all-difficulty">
                        <label class="setting-label">${t('settings.changeAllDifficulty') || 'Set all exercises to:'}</label>
                        <select id="change-all-difficulty" class="setting-select">
                            <option value="">-- ${t('settings.selectToChange') || 'Select to change all'} --</option>
                            <option value="easy">${t('customize.forms.easy') || 'Easy'}</option>
                            <option value="medium">${t('customize.forms.medium') || 'Medium'}</option>
                            <option value="hard">${t('customize.forms.hard') || 'Hard'}</option>
                        </select>
                    </div>
                    
                    ${this.renderDifficultySettings()}
                </details>
                
                <!-- Actions Section -->
                <div class="settings-actions">
                    <div class="settings-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="card-icon">🌐</span>
                                ${t('settings.sections.translation')}
                            </h3>
                        </div>
                        <div class="action-list">
                            <button class="btn btn--secondary btn--full" id="export-translation-btn">
                                📤 ${t('settings.options.exportTranslation')}
                            </button>
                            <label class="btn btn--secondary btn--full">
                                📥 ${t('settings.options.importTranslation')}
                                <input type="file" id="import-translation-file" accept=".csv" hidden>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="card-icon">💾</span>
                                ${t('settings.sections.dataManagement')}
                            </h3>
                        </div>
                        <div class="action-list">
                            <button class="btn btn--secondary btn--full" id="export-backup-btn">
                                📦 ${t('settings.options.createBackup')}
                            </button>
                            <label class="btn btn--secondary btn--full">
                                📥 ${t('settings.options.restoreBackup')}
                                <input type="file" id="import-backup-file" accept=".json" hidden>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-card danger-zone">
                        <div class="card-header">
                            <h3 class="card-title">
                                <span class="card-icon">⚠️</span>
                                ${t('settings.sections.dangerZone')}
                            </h3>
                        </div>
                        <div class="action-list">
                            <button class="btn btn--error btn--full" id="reset-progress-btn">
                                🗑️ ${t('settings.options.resetProgress')}
                            </button>
                            <button class="btn btn--error btn--full" id="reset-all-btn">
                                💥 ${t('settings.options.resetEverything')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Confirmation Modal -->
            <div class="modal-overlay" id="confirm-modal" hidden>
                <div class="modal">
                    <h3 id="modal-title">${t('settings.modal.confirm')}</h3>
                    <p id="modal-message">${t('settings.modal.areYouSure')}</p>
                    <div class="modal-actions">
                        <button class="btn btn--ghost" id="modal-cancel">${t('settings.modal.cancel')}</button>
                        <button class="btn btn--error" id="modal-confirm">${t('settings.modal.confirm')}</button>
                    </div>
                </div>
            </div>
        `;
        
        this.attachListeners();
        this.applySettings();
    }
    
    renderDifficultySettings() {
        const practiceSettings = storageService.get('practiceSettings', {});
        const defaultDifficulty = storageService.get('defaultDifficulty', 'easy');
        const categories = exerciseFactory.getExercisesByCategory();
        const categoryOrder = ['words', 'phonetics', 'meaning', 'time'];
        
        const categoryInfo = {
            words: { name: t('home.categories.words'), icon: '📚' },
            phonetics: { name: t('home.categories.phonetics'), icon: '🔊' },
            meaning: { name: t('home.categories.meaning'), icon: '💡' },
            time: { name: t('home.categories.time'), icon: '⏰' }
        };
        
        // Generate category sections with 2x2 exercise grids inside
        const categorySections = categoryOrder.map(category => {
            const exercises = categories[category] || [];
            const exerciseCards = exercises.map(ex => {
                const currentDiff = practiceSettings[ex.type] || defaultDifficulty;
                return `
                    <div class="difficulty-exercise-card">
                        <div class="exercise-info">
                            <span class="exercise-icon">${ex.icon}</span>
                            <span class="exercise-name">${t('exercises.' + ex.type + '.name')}</span>
                        </div>
                        <select class="difficulty-dropdown" data-type="${ex.type}">
                            <option value="easy" ${currentDiff === 'easy' ? 'selected' : ''}>${t('customize.forms.easy')}</option>
                            <option value="medium" ${currentDiff === 'medium' ? 'selected' : ''}>${t('customize.forms.medium')}</option>
                            <option value="hard" ${currentDiff === 'hard' ? 'selected' : ''}>${t('customize.forms.hard')}</option>
                        </select>
                    </div>
                `;
            }).join('');
            
            return `
                <div class="difficulty-category-section">
                    <div class="difficulty-category-header">
                        <span class="difficulty-category-icon">${categoryInfo[category].icon}</span>
                        <h4 class="difficulty-category-name">${categoryInfo[category].name}</h4>
                    </div>
                    <div class="difficulty-exercises-grid">
                        ${exerciseCards}
                    </div>
                </div>
            `;
        }).join('');
        
        return `<div class="difficulty-categories-grid">${categorySections}</div>`;
    }
    
    async loadVoices() {
        return new Promise((resolve) => {
            const loadVoiceList = () => {
                const allVoices = speechSynthesis.getVoices();
                const currentLocale = i18n.getCurrentLocale();
                
                // Define preferred voices for each language
                const preferredVoices = {
                    'en': [
                        'Google US English',
                        'Google UK English Female', 
                        'Google UK English Male',
                        'Microsoft David',
                        'Microsoft Zira',
                        'Microsoft Mark',
                        'Samantha', // macOS
                        'Alex',     // macOS
                        'Daniel',   // iOS
                        'Karen'     // iOS
                    ],
                    'de': [
                        'Google Deutsch',
                        'Google German',
                        'Microsoft Stefan',
                        'Microsoft Hedda',
                        'Anna',     // macOS
                        'Petra',    // macOS
                        'Yannick'   // iOS
                    ]
                };
                
                // Filter for voices based on current language
                const langPrefix = currentLocale === 'de' ? 'de' : 'en';
                const voiceList = preferredVoices[currentLocale] || preferredVoices['en'];
                
                // Get voices for the current language and sort preferred ones first
                this.availableVoices = allVoices
                    .filter(voice => voice.lang.startsWith(langPrefix))
                    .sort((a, b) => {
                        const aPreferred = voiceList.some(name => a.name.includes(name));
                        const bPreferred = voiceList.some(name => b.name.includes(name));
                        if (aPreferred && !bPreferred) return -1;
                        if (!aPreferred && bPreferred) return 1;
                        return a.name.localeCompare(b.name);
                    })
                    .slice(0, 5); // Only show top 5 voices
                
                // If no voices found, add a default
                if (this.availableVoices.length === 0) {
                    this.availableVoices = [{
                        name: 'Default',
                        lang: currentLocale === 'de' ? 'de-DE' : 'en-US',
                        default: true
                    }];
                }
                
                resolve();
            };
            
            if (speechSynthesis.getVoices().length > 0) {
                loadVoiceList();
            } else {
                speechSynthesis.addEventListener('voiceschanged', loadVoiceList);
            }
        });
    }
    
    attachListeners() {
        // Display settings
        this.container.querySelector('#text-size')?.addEventListener('change', (e) => {
            Config.set('ui.textSize', e.target.value);
            this.applySettings();
        });
        
        this.container.querySelector('#high-contrast')?.addEventListener('change', (e) => {
            Config.set('ui.highContrast', e.target.checked);
            this.applySettings();
        });
        
        this.container.querySelector('#language-select')?.addEventListener('change', async (e) => {
            const lang = e.target.value;
            Config.set('ui.language', lang);
            await i18n.setLocale(lang);
            window.location.reload(); // Reload to apply new language
        });
        
        // Audio settings
        this.container.querySelector('#voice-select')?.addEventListener('change', (e) => {
            Config.set('audio.voiceIndex', parseInt(e.target.value));
        });
        
        this.container.querySelector('#auto-play')?.addEventListener('change', (e) => {
            Config.set('audio.autoPlay', e.target.checked);
        });
        
        const speechRateInput = this.container.querySelector('#speech-rate');
        speechRateInput?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.container.querySelector('#speech-rate-value').textContent = value.toFixed(2);
            Config.set('audio.speechRate', value);
        });
        
        this.container.querySelector('#test-voice-btn')?.addEventListener('click', () => {
            const rate = Config.get('audio.speechRate');
            const voiceIndex = Config.get('audio.voiceIndex');
            const utterance = new SpeechSynthesisUtterance(t('settings.options.voiceTestPhrase'));
            utterance.rate = rate;
            if (this.availableVoices[voiceIndex]) {
                utterance.voice = this.availableVoices[voiceIndex];
            }
            speechSynthesis.speak(utterance);
        });
        
        // Practice settings
        this.container.querySelector('#custom-frequency')?.addEventListener('change', (e) => {
            Config.set('exercises.customFrequency', e.target.value);
        });
        
        const problemFreqInput = this.container.querySelector('#problem-frequency');
        problemFreqInput?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.container.querySelector('#problem-frequency-value').textContent = 
                Math.round(value * 100) + '%';
            Config.set('exercises.problemWordFrequency', value);
        });
        
        this.container.querySelector('#mastery-threshold')?.addEventListener('change', (e) => {
            Config.set('tracking.masteryThreshold', parseInt(e.target.value));
        });
        
        this.container.querySelector('#remove-mastery')?.addEventListener('change', (e) => {
            Config.set('exercises.removeAfterMastery', e.target.checked);
        });
        
        // Practice difficulty selectors - DROPDOWN VERSION
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('difficulty-dropdown')) {
                const type = e.target.dataset.type;
                const difficulty = e.target.value;
                
                // Update storage
                const practiceSettings = storageService.get('practiceSettings', {});
                practiceSettings[type] = difficulty;
                storageService.set('practiceSettings', practiceSettings);
            }
        });
        
        // Change all difficulty selector
        this.container.querySelector('#change-all-difficulty')?.addEventListener('change', (e) => {
            const newDifficulty = e.target.value;
            if (!newDifficulty) return;
            
            // Update all dropdown values visually
            this.container.querySelectorAll('.difficulty-dropdown').forEach(dropdown => {
                dropdown.value = newDifficulty;
            });
            
            // Update storage for all exercise types
            const practiceSettings = storageService.get('practiceSettings', {});
            this.container.querySelectorAll('.difficulty-dropdown').forEach(dropdown => {
                const type = dropdown.dataset.type;
                practiceSettings[type] = newDifficulty;
            });
            storageService.set('practiceSettings', practiceSettings);
            
            // Reset the change-all selector
            e.target.value = '';
            
            // Show notification
            this.showNotification(t('settings.allDifficultyChanged') || `All exercises set to ${newDifficulty}`, 'success');
        });
        
        // Translation Export
        this.container.querySelector('#export-translation-btn')?.addEventListener('click', async () => {
            try {
                await importExportService.exportTranslationCSV();
                this.showNotification(t('csv.export.success'), 'success');
            } catch (err) {
                this.showNotification(`${t('csv.import.failed')}: ${err.message}`, 'error');
            }
        });
        
        // Translation Import
        this.container.querySelector('#import-translation-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await importExportService.importTranslationCSV(file);
                    
                    let message = t('csv.import.success', {
                        wordCount: result.wordCount,
                        exerciseCount: result.exerciseCount
                    });
                    
                    if (result.errorCount > 0) {
                        message = t('csv.import.partialSuccess', { errorCount: result.errorCount });
                    }
                    
                    // Show warnings if any
                    if (result.warnings && result.warnings.length > 0) {
                        message += '\n\n' + t('csv.warnings.invalidDistractors') + ':\n';
                        message += result.warnings.slice(0, 3).map(w => `Row ${w.row}: ${w.message}`).join('\n');
                        if (result.warnings.length > 3) {
                            message += `\n... and ${result.warnings.length - 3} more`;
                        }
                    }
                    
                    alert(message);
                    
                    if (result.wordCount > 0 || result.exerciseCount > 0) {
                        window.location.reload();
                    }
                } catch (err) {
                    alert(`${t('csv.import.failed')}: ${err.message}`);
                }
                
                // Reset the file input
                e.target.value = '';
            }
        });
        
        // Backup
        this.container.querySelector('#export-backup-btn')?.addEventListener('click', async () => {
            await importExportService.exportFullBackup();
        });
        
        this.container.querySelector('#import-backup-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await importExportService.importFromFile(file);
                    alert(result.message);
                    window.location.reload();
                } catch (err) {
                    alert('Import failed: ' + err.message);
                }
            }
        });
        
        // Reset
        this.container.querySelector('#reset-progress-btn')?.addEventListener('click', () => {
            this.showConfirmModal(
                'Reset Progress',
                'This will delete all your progress and statistics, but keep your custom exercises.',
                () => {
                    const customExercises = storageService.get('customExercises');
                    storageService.clear();
                    if (customExercises) {
                        storageService.set('customExercises', customExercises);
                    }
                    alert('Progress has been reset.');
                    window.location.reload();
                }
            );
        });
        
        this.container.querySelector('#reset-all-btn')?.addEventListener('click', () => {
            this.showConfirmModal(
                'Reset Everything',
                'This will permanently delete ALL data including custom exercises. This cannot be undone.',
                () => {
                    storageService.clear();
                    alert('All data has been deleted.');
                    window.location.reload();
                }
            );
        });
        
        // Modal
        this.container.querySelector('#modal-cancel')?.addEventListener('click', () => {
            this.hideConfirmModal();
        });
    }
    
    showConfirmModal(title, message, onConfirm) {
        const modal = this.container.querySelector('#confirm-modal');
        modal.querySelector('#modal-title').textContent = title;
        modal.querySelector('#modal-message').textContent = message;
        
        const confirmBtn = modal.querySelector('#modal-confirm');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.replaceWith(newConfirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            this.hideConfirmModal();
        });
        
        modal.hidden = false;
    }
    
    hideConfirmModal() {
        this.container.querySelector('#confirm-modal').hidden = true;
    }
    
    /**
     * Show a temporary notification toast
     */
    showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existing = document.querySelector('.settings-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `settings-notification settings-notification--${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            fontWeight: '500',
            animation: 'slideUp 0.3s ease-out'
        });
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    applySettings() {
        // Delegate to the main app's applySettings method
        if (window.app && window.app.applySettings) {
            window.app.applySettings();
        } else {
            // Fallback implementation
            const textSize = Config.get('ui.textSize') || 'medium';
            const highContrast = Config.get('ui.highContrast') || false;
            
            document.body.classList.remove('small-text', 'medium-text', 'large-text');
            document.body.classList.add(`${textSize}-text`);
            document.body.classList.toggle('high-contrast', highContrast);
        }
    }
}

export default SettingsPage;
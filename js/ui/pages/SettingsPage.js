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
                <header class="page-header">
                    <h2>${t('settings.title')}</h2>
                </header>
                
                <!-- Display Settings -->
                <section class="settings-section">
                    <h3>📱 ${t('settings.sections.display')}</h3>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.textSize')}</label>
                        <div class="setting-control">
                            <select id="text-size" class="setting-select">
                                <option value="small" ${settings.textSize === 'small' ? 'selected' : ''}>${t('settings.options.small')}</option>
                                <option value="medium" ${settings.textSize === 'medium' ? 'selected' : ''}>${t('settings.options.medium')}</option>
                                <option value="large" ${settings.textSize === 'large' ? 'selected' : ''}>${t('settings.options.large')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.highContrast')}</label>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="high-contrast" ${settings.highContrast ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.language')}</label>
                        <div class="setting-control">
                            <select id="language-select" class="setting-select">
                                <option value="en" ${i18n.getCurrentLocale() === 'en' ? 'selected' : ''}>English</option>
                                <option value="de" ${i18n.getCurrentLocale() === 'de' ? 'selected' : ''}>Deutsch</option>
                            </select>
                        </div>
                    </div>
                </section>
                
                <!-- Audio Settings -->
                <section class="settings-section">
                    <h3>🔊 ${t('settings.sections.audio')}</h3>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.options.voiceSelection')}</label>
                        <div class="setting-control">
                            <select id="voice-select" class="setting-select voice-select">
                                ${this.availableVoices.map((voice, index) => `
                                    <option value="${index}" ${settings.voiceIndex === index ? 'selected' : ''}>
                                        ${voice.name} (${voice.lang})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.options.autoPlayQuestions')}</label>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="auto-play" ${settings.autoPlay ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.options.speechSpeed')}</label>
                        <div class="setting-control range-control">
                            <input type="range" id="speech-rate" 
                                   min="0.5" max="1.2" step="0.05" 
                                   value="${settings.speechRate}">
                            <span class="range-value" id="speech-rate-value">${settings.speechRate.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary" id="test-voice-btn">
                            🔊 ${t('settings.options.testVoice')}
                        </button>
                    </div>
                </section>
                
                <!-- Practice Settings -->
                <section class="settings-section">
                    <h3>📚 ${t('settings.sections.practice')}</h3>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.options.customExerciseFrequency')}</label>
                        <p class="setting-description">${t('settings.options.customFrequencyDesc')}</p>
                        <div class="setting-control">
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
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.options.problemWordFrequency')}</label>
                        <p class="setting-description">${t('settings.options.problemFrequencyDesc')}</p>
                        <div class="setting-control range-control">
                            <input type="range" id="problem-frequency" 
                                   min="0.1" max="0.5" step="0.1" 
                                   value="${settings.problemWordFrequency}">
                            <span class="range-value" id="problem-frequency-value">
                                ${Math.round(settings.problemWordFrequency * 100)}%
                            </span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.options.masteryStreak')}</label>
                        <p class="setting-description">${t('settings.options.masteryStreakDesc')}</p>
                        <div class="setting-control">
                            <select id="mastery-threshold" class="setting-select">
                                <option value="2" ${settings.masteryThreshold === 2 ? 'selected' : ''}>${t('settings.times.2times')}</option>
                                <option value="3" ${settings.masteryThreshold === 3 ? 'selected' : ''}>${t('settings.times.3times')}</option>
                                <option value="4" ${settings.masteryThreshold === 4 ? 'selected' : ''}>${t('settings.times.4times')}</option>
                                <option value="5" ${settings.masteryThreshold === 5 ? 'selected' : ''}>${t('settings.times.5times')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">${t('settings.options.hideMasteredWords')}</label>
                        <p class="setting-description">${t('settings.options.hideMasteredDesc')}</p>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="remove-mastery" ${settings.removeAfterMastery ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Practice Difficulty Per Exercise Type -->
                    <details class="setting-item difficulty-settings">
                        <summary class="setting-label setting-label--collapsible">
                            ${t('settings.practiceDifficulty')}
                            <span class="toggle-icon">▼</span>
                        </summary>
                        <p class="setting-description">${t('settings.practiceDifficultyDesc')}</p>
                        <div class="difficulty-grid">
                            ${this.renderDifficultySettings()}
                        </div>
                    </details>
                </section>
                
                <!-- Translation Tools -->
                <section class="settings-section">
                    <h3>🌐 ${t('settings.sections.translation')}</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary full-width" id="export-translation-btn">
                            📤 ${t('settings.options.exportTranslation')}
                        </button>
                        <small>${t('settings.options.exportTranslationDesc')}</small>
                    </div>
                    
                    <div class="setting-item">
                        <label class="btn btn--secondary full-width file-label">
                            📥 ${t('settings.options.importTranslation')}
                            <input type="file" id="import-translation-file" accept=".csv" hidden>
                        </label>
                        <small>${t('settings.options.importTranslationDesc')}</small>
                    </div>
                </section>
                
                <!-- Data Management -->
                <section class="settings-section">
                    <h3>💾 ${t('settings.sections.dataManagement')}</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary full-width" id="export-backup-btn">
                            💾 ${t('settings.options.createBackup')}
                        </button>
                        <small>${t('settings.options.createBackupDesc')}</small>
                    </div>
                    
                    <div class="setting-item">
                        <label class="btn btn--secondary full-width file-label">
                            📥 ${t('settings.options.restoreBackup')}
                            <input type="file" id="import-backup-file" accept=".json" hidden>
                        </label>
                        <small>${t('settings.options.restoreBackupDesc')}</small>
                    </div>
                </section>
                
                <!-- Danger Zone -->
                <section class="settings-section danger-zone">
                    <h3>⚠️ ${t('settings.sections.dangerZone')}</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--error full-width" id="reset-progress-btn">
                            🗑️ ${t('settings.options.resetProgress')}
                        </button>
                        <small>${t('settings.options.resetProgressDesc')}</small>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn btn--error full-width" id="reset-all-btn">
                            ⚠️ ${t('settings.options.resetEverything')}
                        </button>
                        <small>${t('settings.options.resetEverythingDesc')}</small>
                    </div>
                </section>
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
    
    renderDifficultySettings() {
        const practiceSettings = storageService.get('practiceSettings', {});
        const defaultDifficulty = storageService.get('defaultDifficulty', 'easy');
        const categories = exerciseFactory.getExercisesByCategory();
        const categoryOrder = ['words', 'phonetics', 'meaning', 'time'];
        
        return categoryOrder.map(category => {
            const exercises = categories[category];
            const categoryInfo = {
                words: '📚 Words',
                phonetics: '🔊 Phonetics',
                meaning: '💡 Meaning',
                time: '⏰ Time'
            };
            
            return `
                <div class="difficulty-category">
                    <h4>${categoryInfo[category]}</h4>
                    ${exercises.map(ex => {
                        const currentDiff = practiceSettings[ex.type] || defaultDifficulty;
                        return `
                            <div class="difficulty-item">
                                <span class="exercise-icon">${ex.icon}</span>
                                <span class="exercise-name">${t('exercises.' + ex.type + '.name')}</span>
                                <div class="difficulty-selector">
                                    <button class="diff-btn ${currentDiff === 'easy' ? 'active' : ''}" 
                                            data-type="${ex.type}" data-diff="easy">
                                        Easy
                                    </button>
                                    <button class="diff-btn ${currentDiff === 'medium' ? 'active' : ''}" 
                                            data-type="${ex.type}" data-diff="medium">
                                        Medium
                                    </button>
                                    <button class="diff-btn ${currentDiff === 'hard' ? 'active' : ''}" 
                                            data-type="${ex.type}" data-diff="hard">
                                        Hard
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('');
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
        
        // Translation
        this.container.querySelector('#export-translation-btn')?.addEventListener('click', () => {
            importExportService.exportTranslationCSV();
        });
        
        this.container.querySelector('#import-translation-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await importExportService.importTranslationCSV(file);
                    alert('Translation imported successfully! Please reload the app.');
                } catch (err) {
                    alert('Import failed: ' + err.message);
                }
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
        
        // Practice difficulty selectors
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('diff-btn')) {
                const type = e.target.dataset.type;
                const difficulty = e.target.dataset.diff;
                
                // Update storage
                const practiceSettings = storageService.get('practiceSettings', {});
                practiceSettings[type] = difficulty;
                storageService.set('practiceSettings', practiceSettings);
                
                // Update UI
                const item = e.target.closest('.difficulty-item');
                item.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                console.log('Practice difficulty set:', type, difficulty);
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
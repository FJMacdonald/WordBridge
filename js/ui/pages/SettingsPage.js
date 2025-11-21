import Config from '../../core/Config.js';
import storageService from '../../services/StorageService.js';
import importExportService from '../../services/ImportExportService.js';
import pdfService from '../../services/PDFService.js';
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
                    <h2>Settings</h2>
                </header>
                
                <!-- Display Settings -->
                <section class="settings-section">
                    <h3>📱 Display</h3>
                    
                    <div class="setting-item">
                        <label class="setting-label">Text Size</label>
                        <div class="setting-control">
                            <select id="text-size" class="setting-select">
                                <option value="small" ${settings.textSize === 'small' ? 'selected' : ''}>Small</option>
                                <option value="medium" ${settings.textSize === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="large" ${settings.textSize === 'large' ? 'selected' : ''}>Large</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">High Contrast Mode</label>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="high-contrast" ${settings.highContrast ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">Language</label>
                        <div class="setting-control">
                            <select id="language-select" class="setting-select">
                                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                                <!-- More languages will appear when translation files are available -->
                            </select>
                        </div>
                    </div>
                </section>
                
                <!-- Audio Settings -->
                <section class="settings-section">
                    <h3>🔊 Audio</h3>
                    
                    <div class="setting-item">
                        <label class="setting-label">Voice Selection</label>
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
                        <label class="setting-label">Auto-play Questions</label>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="auto-play" ${settings.autoPlay ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">Speech Speed</label>
                        <div class="setting-control range-control">
                            <input type="range" id="speech-rate" 
                                   min="0.5" max="1.2" step="0.05" 
                                   value="${settings.speechRate}">
                            <span class="range-value" id="speech-rate-value">${settings.speechRate.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary" id="test-voice-btn">
                            🔊 Test Voice
                        </button>
                    </div>
                </section>
                
                <!-- Practice Settings -->
                <section class="settings-section">
                    <h3>📚 Practice</h3>
                    
                    <div class="setting-item">
                        <label class="setting-label">Custom Exercise Frequency</label>
                        <p class="setting-description">How often to use your custom exercises</p>
                        <div class="setting-control">
                            <select id="custom-frequency" class="setting-select">
                                <option value="mixed" ${settings.customFrequency === 'mixed' ? 'selected' : ''}>
                                    Mixed with default
                                </option>
                                <option value="high" ${settings.customFrequency === 'high' ? 'selected' : ''}>
                                    Mostly custom (70%)
                                </option>
                                <option value="only" ${settings.customFrequency === 'only' ? 'selected' : ''}>
                                    Only custom
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">Problem Word Frequency</label>
                        <p class="setting-description">How often to show difficult words</p>
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
                        <label class="setting-label">Mastery Streak</label>
                        <p class="setting-description">Correct answers in a row to master a word</p>
                        <div class="setting-control">
                            <select id="mastery-threshold" class="setting-select">
                                <option value="2" ${settings.masteryThreshold === 2 ? 'selected' : ''}>2 times</option>
                                <option value="3" ${settings.masteryThreshold === 3 ? 'selected' : ''}>3 times</option>
                                <option value="4" ${settings.masteryThreshold === 4 ? 'selected' : ''}>4 times</option>
                                <option value="5" ${settings.masteryThreshold === 5 ? 'selected' : ''}>5 times</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">Hide Mastered Words</label>
                        <p class="setting-description">Remove mastered words from practice</p>
                        <div class="setting-control">
                            <label class="toggle">
                                <input type="checkbox" id="remove-mastery" ${settings.removeAfterMastery ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </section>
                
                <!-- Translation Tools -->
                <section class="settings-section">
                    <h3>🌐 Translation</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary full-width" id="export-translation-btn">
                            📤 Export for Translation (CSV)
                        </button>
                        <small>Download all text as CSV for translation</small>
                    </div>
                    
                    <div class="setting-item">
                        <label class="btn btn--secondary full-width file-label">
                            📥 Import Translation (CSV)
                            <input type="file" id="import-translation-file" accept=".csv" hidden>
                        </label>
                        <small>Upload translated CSV to add new language</small>
                    </div>
                </section>
                
                <!-- Data Management -->
                <section class="settings-section">
                    <h3>💾 Data Management</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary full-width" id="export-backup-btn">
                            💾 Create Full Backup
                        </button>
                        <small>Download all your data and settings</small>
                    </div>
                    
                    <div class="setting-item">
                        <label class="btn btn--secondary full-width file-label">
                            📥 Restore from Backup
                            <input type="file" id="import-backup-file" accept=".json" hidden>
                        </label>
                        <small>Import a previously saved backup</small>
                    </div>
                </section>
                
                <!-- Danger Zone -->
                <section class="settings-section danger-zone">
                    <h3>⚠️ Danger Zone</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--error full-width" id="reset-progress-btn">
                            🗑️ Reset All Progress
                        </button>
                        <small>This will delete all progress but keep custom exercises</small>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn btn--error full-width" id="reset-all-btn">
                            ⚠️ Reset Everything
                        </button>
                        <small>Delete ALL data including custom exercises</small>
                    </div>
                </section>
            </div>
            
            <!-- Confirmation Modal -->
            <div class="modal-overlay" id="confirm-modal" hidden>
                <div class="modal">
                    <h3 id="modal-title">Confirm</h3>
                    <p id="modal-message">Are you sure?</p>
                    <div class="modal-actions">
                        <button class="btn btn--ghost" id="modal-cancel">Cancel</button>
                        <button class="btn btn--error" id="modal-confirm">Confirm</button>
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
                
                // Filter for quality English voices only
                const preferredVoices = [
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
                ];
                
                // Get English voices and sort preferred ones first
                this.availableVoices = allVoices
                    .filter(voice => voice.lang.startsWith('en'))
                    .sort((a, b) => {
                        const aPreferred = preferredVoices.some(name => a.name.includes(name));
                        const bPreferred = preferredVoices.some(name => b.name.includes(name));
                        if (aPreferred && !bPreferred) return -1;
                        if (!aPreferred && bPreferred) return 1;
                        return a.name.localeCompare(b.name);
                    })
                    .slice(0, 5); // Only show top 5 voices
                
                // If no voices found, add a default
                if (this.availableVoices.length === 0) {
                    this.availableVoices = [{
                        name: 'Default',
                        lang: 'en-US',
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
            await i18n.setLanguage(lang);
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
            const utterance = new SpeechSynthesisUtterance('Hello! This is how the voice sounds.');
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
        const textSize = Config.get('ui.textSize');
        const highContrast = Config.get('ui.highContrast');
        
        document.body.classList.remove('small-text', 'medium-text', 'large-text');
        document.body.classList.add(`${textSize}-text`);
        
        document.body.classList.toggle('high-contrast', highContrast);
    }
}

export default SettingsPage;
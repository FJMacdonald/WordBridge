import Config from '../../core/Config.js';
import storageService from '../../services/StorageService.js';
import importExportService from '../../services/ImportExportService.js';
import { i18n, t } from '../../core/i18n.js';

/**
 * Settings page
 */
class SettingsPage {
    constructor(container) {
        this.container = container;
    }
    
    render() {
        const settings = {
            textSize: Config.get('ui.textSize') || 'medium',
            highContrast: Config.get('ui.highContrast') || false,
            autoPlay: Config.get('audio.autoPlay') !== false,
            speechRate: Config.get('audio.speechRate') || 0.85,
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
                </section>
                
                <!-- Audio Settings -->
                <section class="settings-section">
                    <h3>🔊 Audio</h3>
                    
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
                            <span class="range-value" id="speech-rate-value">${settings.speechRate}</span>
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
                
                <!-- Data Management -->
                <section class="settings-section">
                    <h3>💾 Data</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary full-width" id="export-progress-btn">
                            📤 Export Progress
                        </button>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary full-width" id="export-backup-btn">
                            💾 Full Backup
                        </button>
                    </div>
                    
                    <div class="setting-item">
                        <label class="btn btn--secondary full-width file-label">
                            📥 Import Data
                            <input type="file" id="import-file" accept=".json" hidden>
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <button class="btn btn--secondary full-width" id="export-translation-btn">
                            🌐 Export for Translation
                        </button>
                    </div>
                </section>
                
                <!-- Danger Zone -->
                <section class="settings-section danger-zone">
                    <h3>⚠️ Danger Zone</h3>
                    
                    <div class="setting-item">
                        <button class="btn btn--error full-width" id="reset-progress-btn">
                            🗑️ Reset All Progress
                        </button>
                    </div>
                </section>
                
                <button class="btn btn--ghost back-btn" id="back-btn">
                    ← Back to Home
                </button>
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
        
        this.addStyles();
        this.attachListeners();
        this.applySettings();
    }
    
    attachListeners() {
        // Text size
        this.container.querySelector('#text-size')?.addEventListener('change', (e) => {
            Config.set('ui.textSize', e.target.value);
            this.applySettings();
        });
        
        // High contrast
        this.container.querySelector('#high-contrast')?.addEventListener('change', (e) => {
            Config.set('ui.highContrast', e.target.checked);
            this.applySettings();
        });
        
        // Auto-play
        this.container.querySelector('#auto-play')?.addEventListener('change', (e) => {
            Config.set('audio.autoPlay', e.target.checked);
        });
        
        // Speech rate
        const speechRateInput = this.container.querySelector('#speech-rate');
        speechRateInput?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.container.querySelector('#speech-rate-value').textContent = value.toFixed(2);
            Config.set('audio.speechRate', value);
        });
        
        // Test voice
        this.container.querySelector('#test-voice-btn')?.addEventListener('click', () => {
            const rate = Config.get('audio.speechRate');
            const utterance = new SpeechSynthesisUtterance('Hello! This is how the voice sounds.');
            utterance.rate = rate;
            speechSynthesis.speak(utterance);
        });
        
        // Problem frequency
        const problemFreqInput = this.container.querySelector('#problem-frequency');
        problemFreqInput?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.container.querySelector('#problem-frequency-value').textContent = 
                Math.round(value * 100) + '%';
            Config.set('exercises.problemWordFrequency', value);
        });
        
        // Mastery threshold
        this.container.querySelector('#mastery-threshold')?.addEventListener('change', (e) => {
            Config.set('tracking.masteryThreshold', parseInt(e.target.value));
        });
        
        // Remove after mastery
        this.container.querySelector('#remove-mastery')?.addEventListener('change', (e) => {
            Config.set('exercises.removeAfterMastery', e.target.checked);
        });
        
        // Export progress
        this.container.querySelector('#export-progress-btn')?.addEventListener('click', () => {
            importExportService.exportProgressData();
        });
        
        // Full backup
        this.container.querySelector('#export-backup-btn')?.addEventListener('click', async () => {
            await importExportService.exportFullBackup();
        });
        
        // Import file
        this.container.querySelector('#import-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await importExportService.importFromFile(file);
                    alert(result.message);
                } catch (err) {
                    alert('Import failed: ' + err.message);
                }
            }
        });
        
        // Export translation
        this.container.querySelector('#export-translation-btn')?.addEventListener('click', async () => {
            await importExportService.exportTranslationTemplate();
        });
        
        // Reset progress
        this.container.querySelector('#reset-progress-btn')?.addEventListener('click', () => {
            this.showConfirmModal(
                'Reset All Progress',
                'This will permanently delete all your progress, statistics, and custom exercises. This cannot be undone.',
                () => {
                    storageService.clear();
                    alert('All progress has been reset.');
                    window.location.reload();
                }
            );
        });
        
        // Back button
        this.container.querySelector('#back-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
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
    
    addStyles() {
        if (document.getElementById('settings-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'settings-styles';
        style.textContent = `
            /* Text size classes */
            .small-text { font-size: 14px; }
            .medium-text { font-size: 16px; }
            .large-text { font-size: 20px; }
            
            .settings-page {
                padding-bottom: var(--space-2xl);
            }
            .settings-section {
                background: var(--color-surface);
                border-radius: var(--radius-lg);
                padding: var(--space-lg);
                margin-bottom: var(--space-lg);
                border: 1px solid var(--color-border);
            }
            .settings-section h3 {
                font-size: var(--font-size-base);
                margin-bottom: var(--space-lg);
                padding-bottom: var(--space-sm);
                border-bottom: 1px solid var(--color-border);
            }
            .setting-item {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-md) 0;
                border-bottom: 1px solid var(--color-border);
            }
            .setting-item:last-child {
                border-bottom: none;
            }
            .setting-label {
                font-weight: 500;
            }
            .setting-description {
                width: 100%;
                font-size: var(--font-size-sm);
                color: var(--color-text-muted);
                margin: var(--space-xs) 0;
            }
            .setting-control {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
            }
            .setting-select {
                padding: var(--space-sm) var(--space-md);
                border: 2px solid var(--color-border);
                border-radius: var(--radius-md);
                font-size: var(--font-size-base);
                background: var(--color-surface);
            }
            .range-control {
                width: 100%;
                margin-top: var(--space-sm);
            }
            .range-control input[type="range"] {
                flex: 1;
                margin-right: var(--space-md);
            }
            .range-value {
                min-width: 40px;
                text-align: right;
                font-weight: 500;
            }
            
            /* Toggle switch */
            .toggle {
                position: relative;
                display: inline-block;
                width: 52px;
                height: 28px;
            }
            .toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--color-border);
                border-radius: 28px;
                transition: var(--transition-fast);
            }
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 22px;
                width: 22px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                border-radius: 50%;
                transition: var(--transition-fast);
            }
            .toggle input:checked + .toggle-slider {
                background-color: var(--color-primary);
            }
            .toggle input:checked + .toggle-slider:before {
                transform: translateX(24px);
            }
            
            .full-width {
                width: 100%;
                justify-content: center;
            }
            .file-label {
                cursor: pointer;
            }
            .danger-zone {
                border-color: var(--color-error);
            }
            .danger-zone h3 {
                color: var(--color-error);
            }
            .btn--error {
                background: var(--color-error);
                color: white;
            }
            
            /* Modal */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-overlay[hidden] {
                display: none;
            }
            .modal {
                background: var(--color-surface);
                border-radius: var(--radius-lg);
                padding: var(--space-xl);
                max-width: 400px;
                width: 90%;
            }
            .modal h3 {
                margin-bottom: var(--space-md);
            }
            .modal p {
                color: var(--color-text-muted);
                margin-bottom: var(--space-xl);
            }
            .modal-actions {
                display: flex;
                gap: var(--space-md);
                justify-content: flex-end;
            }
            .back-btn {
                margin-top: var(--space-xl);
            }
        `;
        document.head.appendChild(style);
    }
}

export default SettingsPage;
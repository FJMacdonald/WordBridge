import { t } from '../core/i18n.js';
import Config from '../core/Config.js';
import audioService from '../services/AudioService.js';
import hintService from '../services/HintService.js';
import trackingService from '../services/TrackingService.js';

/**
 * Abstract base class for all exercises
 */
class BaseExercise {
    constructor(options) {
        this.type = options.type;
        this.container = null;
        this.items = [];
        this.currentItem = null;
        this.currentIndex = 0;
        
        this.state = {
            hintsUsed: 0,
            eliminatedIndices: new Set(),
            revealedLetters: 0,
            startTime: null
        };
        
        // Bind methods
        this.handleHint = this.handleHint.bind(this);
        this.handleSkip = this.handleSkip.bind(this);
        this.handlePlayAll = this.handlePlayAll.bind(this);
    }
    
    /**
     * Initialize with items and container
     */
    async init(items, container) {
        this.items = this.shuffleArray([...items]);
        this.container = container;
        this.currentIndex = 0;
        
        trackingService.startSession(this.type);
        
        await this.loadItem(0);
    }
    
    /**
     * Load item by index
     */
    async loadItem(index) {
        if (index >= this.items.length) {
            this.complete();
            return;
        }
        
        this.currentIndex = index;
        this.currentItem = this.items[index];
        this.resetState();
        
        await this.render();
        this.attachListeners();
        
        // Auto-play if enabled
        if (Config.get('audio.autoPlay')) {
            await this.delay(300);
            await this.handlePlayAll();
        }
    }
    
    resetState() {
        this.state = {
            hintsUsed: 0,
            eliminatedIndices: new Set(),
            revealedLetters: 0,
            startTime: Date.now()
        };
    }
    
    /**
     * Render - must be implemented by subclass
     */
    async render() {
        throw new Error('render() must be implemented');
    }
    
    /**
     * Render common header
     */
    renderHeader() {
        const progress = Math.round((this.currentIndex / this.items.length) * 100);
        
        return `
            <header class="exercise__header">
                <div class="exercise__progress">
                    <span class="exercise__progress-text">
                        ${this.currentIndex + 1} / ${this.items.length}
                    </span>
                    <div class="exercise__progress-bar">
                        <div class="exercise__progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <button class="btn--icon audio-btn-inline" id="play-all-btn" title="${t('audio.playAll')}">
                    🔊
                </button>
            </header>
        `;
    }
    
    /**
     * Get context for hint availability check - override in subclass
     */
    getHintContext() {
        return {};
    }

    /**
     * Render common footer (UPDATED)
     */
    renderFooter() {
        const hasMore = hintService.hasMoreHints(
            this.type, 
            this.state.hintsUsed, 
            this.getHintContext()
        );
        
        return `
            <footer class="exercise__footer">
                <button class="btn btn--secondary" id="hint-btn" ${!hasMore ? 'disabled' : ''}>
                    💡 ${t('common.hint')}
                </button>
                <button class="btn btn--ghost" id="skip-btn">
                    ${t('common.skip')} →
                </button>
            </footer>
            <div class="exercise__feedback" id="feedback-area"></div>
        `;
    }
    
    /**
     * Attach common event listeners
     */
    attachListeners() {
        const playAllBtn = this.container.querySelector('#play-all-btn');
        const hintBtn = this.container.querySelector('#hint-btn');
        const skipBtn = this.container.querySelector('#skip-btn');
        
        if (playAllBtn) playAllBtn.addEventListener('click', this.handlePlayAll);
        if (hintBtn) hintBtn.addEventListener('click', this.handleHint);
        if (skipBtn) skipBtn.addEventListener('click', this.handleSkip);
        
        this.attachExerciseListeners();
    }
    
    /**
     * Exercise-specific listeners - override in subclass
     */
    attachExerciseListeners() {}
    
    /**
     * Handle play all - override in subclass for specific behavior
     */
    async handlePlayAll() {
        throw new Error('handlePlayAll() must be implemented');
    }
    
    /**
     * Handle hint request
     */
    async handleHint() {
        if (!hintService.hasMoreHints(this.type, this.state.hintsUsed)) return;
        
        const hintType = hintService.getNextHintType(this.type, this.state.hintsUsed);
        
        await this.applyHint(hintType);
        
        this.state.hintsUsed++;
        trackingService.recordHint();
        
        this.updateHintButton();
    }
    
    /**
     * Apply specific hint - override in subclass
     */
    async applyHint(hintType) {
        throw new Error('applyHint() must be implemented');
    }
    
    updateHintButton() {
        const btn = this.container.querySelector('#hint-btn');
        if (!btn) return;
        
        const hasMore = hintService.hasMoreHints(this.type, this.state.hintsUsed);
        btn.disabled = !hasMore;
        btn.textContent = hasMore 
            ? `💡 ${t('common.hint')}` 
            : t('hints.noMoreHints');
    }
    
    /**
     * Handle skip
     */
    handleSkip() {
        trackingService.recordSkip(this.getCorrectAnswer());
        this.nextItem();
    }
    
    /**
     * Get correct answer - override in subclass
     */
    getCorrectAnswer() {
        return this.currentItem?.answer;
    }
    
    /**
     * Show feedback
     */
    showFeedback(correct, message = null) {
        const area = this.container.querySelector('#feedback-area');
        if (!area) return;
        
        const text = message || (correct ? t('feedback.correct') : t('feedback.incorrect'));
        area.innerHTML = `
            <div class="feedback-text ${correct ? 'correct' : 'incorrect'}">
                ${text}
            </div>
        `;
    }
    
    /**
     * Move to next item
     */
    async nextItem() {
        await this.delay(Config.get('exercises.autoAdvanceDelay'));
        await this.loadItem(this.currentIndex + 1);
    }
    
    /**
     * Complete exercise
     */
    complete() {
        const results = trackingService.endSession();
        this.renderResults(results);
    }
    
    /**
     * Render results screen
     */
    renderResults(results) {
        this.container.innerHTML = `
            <div class="exercise-complete">
                <h2>${t('results.title')}</h2>
                
                <div class="results-stats">
                    <div class="stat">
                        <span class="stat-value">${results.correct}/${results.total}</span>
                        <span class="stat-label">${t('results.score', results)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${results.accuracy}%</span>
                        <span class="stat-label">Accuracy</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${results.time}</span>
                        <span class="stat-label">Time</span>
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn--primary btn--large" id="restart-btn">
                        ${t('results.playAgain')}
                    </button>
                    <button class="btn btn--secondary" id="home-btn">
                        ${t('results.backToMenu')}
                    </button>
                </div>
            </div>
        `;
        
        this.container.querySelector('#restart-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('exercise:restart', { detail: this.type }));
        });
        
        this.container.querySelector('#home-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
        });
    }
    
    // Utilities
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
    
    destroy() {
        audioService.stop();
    }
}

export default BaseExercise;
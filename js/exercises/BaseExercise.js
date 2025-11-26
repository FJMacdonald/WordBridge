// exercises/BaseExercise.js - ENHANCED VERSION
import { t } from '../core/i18n.js';
import Config from '../core/Config.js';
import audioService from '../services/AudioService.js';
import hintService from '../services/HintService.js';
import trackingService from '../services/TrackingService.js';

class BaseExercise {
    constructor(options) {
        this.type = options.type;
        this.container = null;
        this.items = [];
        this.currentItem = null;
        this.currentIndex = 0;
        this.mode = 'practice'; // 'practice' or 'test'
        
        this.state = {
            hintsUsed: 0,
            eliminatedIndices: new Set(),
            revealedLetters: 0,
            startTime: null,
            lastActivityTime: null,
            responseStartTime: null,
            inactivityGaps: []
        };
        
        // Activity tracking
        this.activityTimer = null;
        this.inactivityThreshold = Config.get('tracking.inactivityThreshold', 60000);
        this.sessionAutoEnd = Config.get('tracking.sessionAutoEndThreshold', 300000);
        this.inactivityDialogShown = false;
        
        // Bind methods
        this.handleHint = this.handleHint.bind(this);
        this.handleSkip = this.handleSkip.bind(this);
        this.handlePlayAll = this.handlePlayAll.bind(this);
        this.recordActivity = this.recordActivity.bind(this);
    }
    
    async init(items, container) {
        this.items = this.shuffleArray([...items]);
        this.container = container;
        this.currentIndex = 0;
        
        // Start tracking
        trackingService.startSession(this.type);
        this.startActivityMonitoring();
        
        await this.loadItem(0);
    }
    
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
        
        // Track response time start
        this.state.responseStartTime = Date.now();
        this.recordActivity('item_loaded');
        
        if (Config.get('audio.autoPlay')) {
            await this.delay(300);
            await this.handlePlayAll();
        }
    }
    
    resetState() {
        const now = Date.now();
        this.state = {
            hintsUsed: 0,
            eliminatedIndices: new Set(),
            revealedLetters: 0,
            startTime: now,
            lastActivityTime: now,
            responseStartTime: now,
            inactivityGaps: []
        };
    }
    
    // === ACTIVITY MONITORING ===
    
    startActivityMonitoring() {
        // Set up global activity listeners
        this.activityListeners = {
            click: this.recordActivity,
            keydown: this.recordActivity,
            touchstart: this.recordActivity
        };
        
        Object.entries(this.activityListeners).forEach(([event, handler]) => {
            document.addEventListener(event, handler);
        });
        
        this.checkInactivity();
    }
    
    recordActivity(eventType = 'interaction') {
        const now = Date.now();
        const lastActivity = this.state.lastActivityTime;
        
        if (lastActivity) {
            const gap = now - lastActivity;
            
            // If gap exceeds threshold, record it as inactivity
            if (gap > this.inactivityThreshold) {
                this.state.inactivityGaps.push({
                    start: lastActivity,
                    end: now,
                    duration: gap
                });
                
                trackingService.recordInactivityGap(gap);
            }
        }
        
        this.state.lastActivityTime = now;
        
        // Reset auto-end timer
        this.resetInactivityTimer();
    }
    
    checkInactivity() {
        this.activityTimer = setInterval(() => {
            const now = Date.now();
            const lastActivity = this.state.lastActivityTime;
            
            if (lastActivity && (now - lastActivity) > this.sessionAutoEnd) {
                // Auto-end session due to inactivity
                this.handleInactiveTimeout();
            }
        }, 10000); // Check every 10 seconds
    }
    
    resetInactivityTimer() {
        // Could implement auto-pause here if needed
    }
    
    handleInactiveTimeout() {
        // Prevent multiple dialogs from showing
        if (this.inactivityDialogShown) return;
        
        // Session ended due to inactivity
        trackingService.pauseSession('inactivity');
        
        // Show a resume dialog
        this.showInactivityDialog();
    }
    
    showInactivityDialog() {
        // Prevent multiple dialogs
        if (this.inactivityDialogShown) return;
        this.inactivityDialogShown = true;
        
        const dialog = document.createElement('div');
        dialog.className = 'inactivity-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Session Paused</h3>
                <p>You've been away for a while. Ready to continue?</p>
                <button class="btn btn--primary" id="resume-btn">Resume</button>
                <button class="btn btn--ghost" id="end-btn">End Session</button>
            </div>
        `;
        
        this.container.appendChild(dialog);
        
        dialog.querySelector('#resume-btn').addEventListener('click', () => {
            dialog.remove();
            this.inactivityDialogShown = false;
            trackingService.resumeSession();
            this.recordActivity('resumed');
        });
        
        dialog.querySelector('#end-btn').addEventListener('click', () => {
            dialog.remove();
            this.inactivityDialogShown = false;
            this.complete();
        });
    }
    
    // === EXISTING METHODS WITH TRACKING ENHANCEMENTS ===
    
    async handleOptionClick(e) {
        // Record response time
        const responseTime = Date.now() - this.state.responseStartTime;
        
        const btn = e.currentTarget;
        if (btn.disabled || btn.classList.contains('eliminated')) return;
        
        const value = btn.dataset.value;
        const correct = this.checkAnswer(value);
        
        // Enhanced tracking with response time
        trackingService.recordAttempt({
            exerciseType: this.type,
            word: this.getCorrectAnswer(),
            correct,
            hintsUsed: this.state.hintsUsed,
            responseTime,
            attemptNumber: this.state.eliminatedIndices.size + 1
        });
        
        this.recordActivity('answer_submitted');
        
        // ... rest of existing logic
        btn.classList.add(correct ? 'correct' : 'incorrect');
        
        if (correct) {
            this.showFeedback(true);
            await this.nextItem();
        } else {
            btn.classList.add('eliminated');
            btn.disabled = true;
            this.state.eliminatedIndices.add(parseInt(btn.dataset.index));
            
            const remaining = this.container.querySelectorAll('.option-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                this.showFeedback(false, t('feedback.theAnswerWas', { answer: this.getCorrectAnswer() }));
                
                remaining.forEach(b => {
                    if (b.dataset.value === this.getCorrectAnswer()) {
                        b.classList.add('correct');
                    }
                });
                
                await this.nextItem();
            }
        }
    }
    
    async handleHint() {
        this.recordActivity('hint_requested');
        
        if (!hintService.hasMoreHints(this.type, this.state.hintsUsed)) return;
        
        const hintType = hintService.getNextHintType(this.type, this.state.hintsUsed);
        
        await this.applyHint(hintType);
        
        this.state.hintsUsed++;
        trackingService.recordHint(this.type);
        
        this.updateHintButton();
    }
    
    handleSkip() {
        this.recordActivity('skip');
        
        const responseTime = Date.now() - this.state.responseStartTime;
        trackingService.recordSkip({
            exerciseType: this.type,
            word: this.getCorrectAnswer(),
            responseTime,
            hintsUsed: this.state.hintsUsed
        });
        
        this.nextItem();
    }
    
    complete() {
        // Calculate active time (excluding inactivity gaps)
        const totalTime = Date.now() - this.state.startTime;
        const inactiveTime = this.state.inactivityGaps.reduce((sum, gap) => sum + gap.duration, 0);
        const activeTime = totalTime - inactiveTime;
        
        const results = trackingService.endSession({
            totalTime,
            activeTime,
            inactivityGaps: this.state.inactivityGaps.length
        });
        
        this.renderResults(results);
    }
    
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
                        <span class="stat-value">${results.timeFormatted}</span>
                        <span class="stat-label">Active Time</span>
                    </div>
                    ${results.medianResponseTime ? `
                    <div class="stat">
                        <span class="stat-value">${(results.medianResponseTime / 1000).toFixed(1)}s</span>
                        <span class="stat-label">Avg Response</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="results-feedback">
                    ${this.generateResultsFeedback(results)}
                </div>
                
                <div class="results-actions">
                    <button class="btn btn--primary btn--large" id="restart-btn">
                        ${t('results.playAgain')}
                    </button>
                </div>
            </div>
        `;
        
        this.attachResultListeners();
    }
    
    generateResultsFeedback(results) {
        let feedback = '';
        
        if (results.accuracy >= 90) {
            feedback = '🌟 Outstanding performance!';
        } else if (results.accuracy >= 75) {
            feedback = '💪 Great job! Keep it up!';
        } else if (results.accuracy >= 60) {
            feedback = '👍 Good effort! You\'re improving!';
        } else {
            feedback = '🎯 Keep practicing - you\'ve got this!';
        }
        
        // Add trend indicator if available
        if (results.trend) {
            if (results.trend > 0) {
                feedback += ` (↑${results.trend}% from last time)`;
            }
        }
        
        return `<p class="feedback-message">${feedback}</p>`;
    }
    
    destroy() {
        // Clean up activity monitoring
        if (this.activityTimer) {
            clearInterval(this.activityTimer);
        }
        
        Object.entries(this.activityListeners || {}).forEach(([event, handler]) => {
            document.removeEventListener(event, handler);
        });
        
        audioService.stop();
    }
    
    // ... rest of existing methods ...
    
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
    
    attachResultListeners() {
        this.container.querySelector('#restart-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('exercise:restart', { detail: this.type }));
        });
    }
    
    renderHeader() {
        const progress = Math.round((this.currentIndex / this.items.length) * 100);
        
        // In practice mode, don't show progress bar (infinite randomized)
        // In test mode, show progress
        if (this.mode === 'practice') {
            return `
                <header class="exercise__header exercise__header--practice">
                    <div class="exercise__mode-badge">
                        ${t('modes.practice')}
                    </div>
                    <button class="btn--icon audio-btn-inline" id="play-all-btn" title="${t('audio.playAll')}">
                        🔊
                    </button>
                </header>
            `;
        }
        
        return `
            <header class="exercise__header">
                <div class="exercise__progress">
                    <span class="exercise__progress-text">
                        ${t('modes.question')} ${this.currentIndex + 1} / ${this.items.length}
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
                <button class="btn btn--secondary" id="skip-btn">
                    ${t('common.skip')}
                </button>
            </footer>
            <div class="hint-area" id="hint-area"></div>
            <div class="exercise__feedback" id="feedback-area"></div>
        `;
    }
    
    attachListeners() {
        const playAllBtn = this.container.querySelector('#play-all-btn');
        const hintBtn = this.container.querySelector('#hint-btn');
        const skipBtn = this.container.querySelector('#skip-btn');
        
        if (playAllBtn) playAllBtn.addEventListener('click', this.handlePlayAll);
        if (hintBtn) hintBtn.addEventListener('click', this.handleHint);
        if (skipBtn) skipBtn.addEventListener('click', this.handleSkip);
        
        this.attachExerciseListeners();
    }
    
    attachExerciseListeners() {}
    
    async handlePlayAll() {
        throw new Error('handlePlayAll() must be implemented');
    }
    
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
    
    async nextItem() {
        await this.delay(Config.get('exercises.autoAdvanceDelay'));
        await this.loadItem(this.currentIndex + 1);
    }
    
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
    
    checkAnswer(value) {
        return value === this.getCorrectAnswer();
    }
    
    getCorrectAnswer() {
        return this.currentItem?.answer;
    }
    
    getHintContext() {
        return {};
    }
}

export default BaseExercise;
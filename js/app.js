const app = {
    currentView: 'dashboard',
    viewHistory: [],
    lastSession: null,
    
    async init() {
        try {
            await ImageStorage.init();
            console.log('ImageStorage initialized');
        } catch (e) {
            console.error('Failed to initialize ImageStorage:', e);
        }
        
        Progress.init();
        Settings.init();
        this.loadLastSession();
        this.renderDashboard();
    },
    
    toggleMenu() {
        const menu = document.getElementById('side-menu');
        menu.classList.toggle('open');
    },
    
    showView(viewName, addToHistory = true) {
        // Track history for back navigation
        if (addToHistory && this.currentView !== viewName) {
            this.viewHistory.push(this.currentView);
            // Limit history size
            if (this.viewHistory.length > 10) {
                this.viewHistory.shift();
            }
        }
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const viewElement = document.getElementById(`view-${viewName}`);
        viewElement.classList.add('active');
        this.currentView = viewName;
        
        // Update back button visibility and behavior
        this.updateBackButtons();
        
        if (viewName === 'dashboard') {
            this.renderDashboard();
        } else if (viewName === 'settings') {
            viewElement.innerHTML = Settings.render();
        } else if (viewName === 'manage-words') {
            WordManager.render();
        } else if (viewName === 'add-exercise') {
            ExerciseForm.init();
        } else if (viewName === 'progress') {
            ProgressPage.render();
        } else if (viewName === 'import-export') {
            ImportExportPage.render();
        }
    },
    
    goBack() {
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.showView(previousView, false);
        } else {
            this.showView('dashboard', false);
        }
    },
    
    updateBackButtons() {
        // Update all back buttons to use goBack()
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.onclick = () => this.goBack();
        });
    },
    
    loadLastSession() {
        this.lastSession = Storage.get('lastSession', null);
    },
    
    saveLastSession(data) {
        this.lastSession = data;
        Storage.set('lastSession', data);
    },
    
    renderDashboard() {
        const exercises = [
            {
                id: 'naming',
                icon: '🖼️',
                title: 'Picture Naming',
                description: 'See a picture, pick the word'
            },
            {
                id: 'listening',
                icon: '👂',
                title: 'Listening',
                description: 'Hear a word, pick the picture'
            },
            {
                id: 'typing',
                icon: '⌨️',
                title: 'Typing Practice',
                description: 'See a picture, type the word'
            },
            {
                id: 'categories',
                icon: '🏷️',
                title: 'Word Categories',
                description: 'Find the word that fits'
            },
            {
                id: 'sentences',
                icon: '📝',
                title: 'Complete the Sentence',
                description: 'Fill in the missing word'
            },
            {
                id: 'speak',
                icon: '🗣️',
                title: 'Speak It',
                description: 'See a picture, say the word'
            }
        ];
        
        const grid = document.getElementById('exercise-grid');
        grid.innerHTML = exercises.map(ex => `
            <button class="exercise-card" onclick="app.startExercise('${ex.id}')">
                <div class="card-icon">${ex.icon}</div>
                <div class="card-title">${ex.title}</div>
                <div class="card-description">${ex.description}</div>
            </button>
        `).join('');
        
        this.renderLastSession();
        this.renderWeekSummary();
    },

    startExercise(type) {
        this.viewHistory = ['dashboard'];
        
        if (type === 'speak') {
            SpeakEngine.init();
            this.showView('speak');
            SpeakEngine.start();
        } else if (type === 'typing') {
            TypingEngine.init(1); // Start at level 1
            this.showView('typing');
            TypingEngine.start();
        } else if (type === 'listening') {
            ListeningEngine.init();
            this.showView('listening');
            ListeningEngine.start();
        } else {
            ExerciseEngine.init(type);
            this.showView('exercise');
            ExerciseEngine.start();
        }
    },

    finishExercise() {
        let results;
        
        switch (this.currentView) {
            case 'speak':
                results = SpeakEngine.getResults();
                break;
            case 'typing':
                results = TypingEngine.getResults();
                TypingEngine.cleanup();
                break;
            case 'listening':
                results = ListeningEngine.getResults();
                break;
            default:
                results = ExerciseEngine.getResults();
        }
        
        this.saveLastSession(results);
        Progress.recordSession(results);
        
        this.viewHistory = [];
        this.showView('dashboard');
    },
    
    renderLastSession() {
        const container = document.getElementById('last-session-stats');
        
        if (!this.lastSession) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        document.getElementById('last-correct').textContent = this.lastSession.correct;
        document.getElementById('last-total').textContent = this.lastSession.total;
        document.getElementById('last-time').textContent = this.lastSession.time;
        document.getElementById('last-accuracy').textContent = this.lastSession.accuracy + '%';
    },
    
    renderWeekSummary() {
        const summary = Progress.getWeeklySummary();
        
        const weekSummaryEl = document.getElementById('week-summary');
        weekSummaryEl.innerHTML = `
            <div class="week-stats">
                <div>
                    <div class="week-stat-value">${summary.totalSessions}</div>
                    <div class="week-stat-label">Sessions</div>
                </div>
                <div>
                    <div class="week-stat-value">${summary.formattedTime}</div>
                    <div class="week-stat-label">Practice Time</div>
                </div>
            </div>
            <div class="week-days">
                ${summary.dailyPractice.map(day => `
                    <div class="day-indicator ${day.complete ? 'complete' : ''} ${day.isToday ? 'today' : ''}">
                        ${day.label}
                    </div>
                `).join('')}
            </div>
            <button class="view-progress-btn" onclick="app.showView('progress')">
                View Full Progress →
            </button>
        `;
    }
    
};

document.addEventListener('DOMContentLoaded', () => app.init());

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
        if (addToHistory && this.currentView !== viewName) {
            this.viewHistory.push(this.currentView);
            if (this.viewHistory.length > 10) {
                this.viewHistory.shift();
            }
        }
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const viewElement = document.getElementById(`view-${viewName}`);
        if (viewElement) {
            viewElement.classList.add('active');
        }
        this.currentView = viewName;
        
        this.updateBackButtons();
        
        if (viewName === 'dashboard') {
            this.renderDashboard();
        } else if (viewName === 'settings') {
            document.getElementById('view-settings').innerHTML = Settings.render();
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
        // Cleanup any active engines
        this.cleanupEngines();
        
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.showView(previousView, false);
        } else {
            this.showView('dashboard', false);
        }
    },
    
    cleanupEngines() {
        if (typeof TypingEngine !== 'undefined' && TypingEngine.cleanup) {
            TypingEngine.cleanup();
        }
        if (typeof SentenceTypingEngine !== 'undefined' && SentenceTypingEngine.cleanup) {
            SentenceTypingEngine.cleanup();
        }
        AudioHelper.stop();
    },
    
    updateBackButtons() {
        document.querySelectorAll('.back-btn, .done-btn').forEach(btn => {
            if (!btn.hasAttribute('data-custom-action')) {
                btn.onclick = () => this.goBack();
            }
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
        // Main exercises
        const mainExercises = [
            { id: 'naming', icon: '🖼️', title: 'Picture Naming', description: 'See a picture, pick the word' },
            { id: 'listening', icon: '👂', title: 'Listening', description: 'Hear a word, pick the picture' },
            { id: 'typing', icon: '⌨️', title: 'Typing', description: 'See a picture, type the word' },
            { id: 'sentences', icon: '📝', title: 'Sentences', description: 'Complete the sentence' },
            { id: 'sentence-typing', icon: '✍️', title: 'Sentence Typing', description: 'Type the missing word' },
            { id: 'categories', icon: '🏷️', title: 'Categories', description: 'Find the word that fits' },
            { id: 'speak', icon: '🗣️', title: 'Speak It', description: 'Say the word out loud' }
        ];
        
        // Language exercises
        const languageExercises = [
            { id: 'rhyming', icon: '🎵', title: 'Rhyming', description: 'Find words that rhyme' },
            { id: 'firstsound', icon: '🔤', title: 'First Sounds', description: 'Match starting sounds' },
            { id: 'association', icon: '🔗', title: 'Word Association', description: 'Find related words' },
            { id: 'synonym', icon: '↔️', title: 'Synonyms & Antonyms', description: 'Same or opposite meaning' },
            { id: 'definition', icon: '📖', title: 'Definitions', description: 'Match words to meanings' },
            { id: 'scramble', icon: '🔀', title: 'Sentence Order', description: 'Put words in order' }
        ];
        
        const grid = document.getElementById('exercise-grid');
        grid.innerHTML = `
            <div class="exercise-section">
                <h4 class="section-title">Core Exercises</h4>
                <div class="exercise-cards">
                    ${mainExercises.map(ex => `
                        <button class="exercise-card" onclick="app.startExercise('${ex.id}')">
                            <div class="card-icon">${ex.icon}</div>
                            <div class="card-title">${ex.title}</div>
                            <div class="card-description">${ex.description}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="exercise-section">
                <h4 class="section-title">Language Skills</h4>
                <div class="exercise-cards">
                    ${languageExercises.map(ex => `
                        <button class="exercise-card" onclick="app.startExercise('${ex.id}')">
                            <div class="card-icon">${ex.icon}</div>
                            <div class="card-title">${ex.title}</div>
                            <div class="card-description">${ex.description}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.renderLastSession();
        this.renderWeekSummary();
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
                View Progress →
            </button>
        `;
    },
    
    startExercise(type) {
        this.viewHistory = ['dashboard'];
        
        switch (type) {
            case 'speak':
                SpeakEngine.init();
                this.showView('speak');
                SpeakEngine.start();
                break;
            case 'typing':
                TypingEngine.init(1);
                this.showView('typing');
                TypingEngine.start();
                break;
            case 'listening':
                ListeningEngine.init();
                this.showView('listening');
                ListeningEngine.start();
                break;
            case 'sentence-typing':
                SentenceTypingEngine.init();
                this.showView('sentence-typing');
                SentenceTypingEngine.start();
                break;
            case 'scramble':
                ScrambleEngine.init();
                this.showView('scramble');
                ScrambleEngine.start();
                break;
            case 'rhyming':
                RhymingEngine.init();
                this.showView('rhyming');
                RhymingEngine.start();
                break;
            case 'firstsound':
                FirstSoundEngine.init();
                this.showView('firstsound');
                FirstSoundEngine.start();
                break;
            case 'association':
                AssociationEngine.init();
                this.showView('association');
                AssociationEngine.start();
                break;
            case 'synonym':
                SynonymAntonymEngine.init();
                this.showView('synonym');
                SynonymAntonymEngine.start();
                break;
            case 'definition':
                DefinitionEngine.init();
                this.showView('definition');
                DefinitionEngine.start();
                break;
            default:
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
            case 'sentence-typing':
                results = SentenceTypingEngine.getResults();
                SentenceTypingEngine.cleanup();
                break;
            case 'scramble':
                results = ScrambleEngine.getResults();
                break;
            case 'rhyming':
                results = RhymingEngine.getResults();
                break;
            case 'firstsound':
                results = FirstSoundEngine.getResults();
                break;
            case 'association':
                results = AssociationEngine.getResults();
                break;
            case 'synonym':
                results = SynonymAntonymEngine.getResults();
                break;
            case 'definition':
                results = DefinitionEngine.getResults();
                break;
            default:
                results = ExerciseEngine.getResults();
        }
        
        this.saveLastSession(results);
        Progress.recordSession(results);
        
        this.viewHistory = [];
        this.showView('dashboard');
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
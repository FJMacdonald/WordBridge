/**
 * Main Application Controller
 */
const app = {
    currentView: 'dashboard',
    lastSession: null,
    
    init() {
        Progress.init();
        Settings.init();
        this.loadLastSession();
        this.renderDashboard();
        // At the very top of app.js
        console.log('ExerciseData loaded:', typeof ExerciseData !== 'undefined');
        if (typeof ExerciseData !== 'undefined') {
            console.log('Exercise types:', Object.keys(ExerciseData));
        }
    },
    
    loadLastSession() {
        this.lastSession = Storage.get('lastSession', null);
    },
    
    saveLastSession(data) {
        this.lastSession = data;
        Storage.set('lastSession', data);
    },
    
    showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewName}`).classList.add('active');
        this.currentView = viewName;
        
        if (viewName === 'dashboard') {
            this.renderDashboard();
        }
    },
    
    renderDashboard() {
        // Exercise cards
        const exercises = [
            {
                id: 'naming',
                icon: '🖼️',
                title: 'Picture Naming',
                description: 'See a picture, pick the word'
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
        
        // Show last session stats if available
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
        `;
    },
    
    startExercise(type) {
        if (type === 'speak') {
            SpeakEngine.init();
            this.showView('speak');
            SpeakEngine.start();
        } else {
            ExerciseEngine.init(type);
            this.showView('exercise');
            ExerciseEngine.start();
        }
    },
    
    finishExercise() {
        // Get results from the appropriate engine
        let results;
        if (this.currentView === 'speak') {
            results = SpeakEngine.getResults();
        } else {
            results = ExerciseEngine.getResults();
        }
        
        // Save last session for dashboard display
        this.saveLastSession(results);
        
        // Record in weekly progress
        Progress.recordSession(results);
        
        // Return to dashboard
        this.showView('dashboard');
    }
};


// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => app.init());
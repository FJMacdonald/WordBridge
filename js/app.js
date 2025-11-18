/**
 * Main Application Controller
 */
const app = {
    currentView: 'dashboard',
    selectedExercise: null,
    selectedDifficulty: 1,
    selectedQuestionCount: 10,
    
    init() {
        // Initialize modules
        Progress.init();
        Settings.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render dashboard
        this.renderDashboard();
    },
    
    setupEventListeners() {
        // Question count buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedQuestionCount = parseInt(btn.dataset.count);
            });
        });
    },
    
    showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewName}`).classList.add('active');
        this.currentView = viewName;
        
        // View-specific initialization
        if (viewName === 'dashboard') {
            this.renderDashboard();
        } else if (viewName === 'reports') {
            this.renderReports();
        }
    },
    
    renderDashboard() {
        // Exercise cards
        const exercises = [
            {
                id: 'naming',
                icon: '🖼️',
                title: 'Picture Naming',
                description: 'Identify objects and images'
            },
            {
                id: 'categories',
                icon: '🏷️',
                title: 'Word Categories',
                description: 'Match words to their categories'
            },
            {
                id: 'sentences',
                icon: '📝',
                title: 'Sentence Completion',
                description: 'Complete sentences with the right word'
            }
        ];
        
        const grid = document.getElementById('exercise-grid');
        grid.innerHTML = exercises.map(ex => {
            const level = Progress.getUnlockedLevel(ex.id);
            const best = Progress.getBestScore(ex.id, level);
            
            return `
                <button class="exercise-card" onclick="app.selectExercise('${ex.id}')">
                    <div class="card-icon">${ex.icon}</div>
                    <div class="card-title">${ex.title}</div>
                    <div class="card-description">${ex.description}</div>
                    <div class="card-meta">
                        <span class="card-level">${'★'.repeat(level)}${'☆'.repeat(7-level)}</span>
                        <span class="card-best">${best > 0 ? `Best: ${best}%` : 'New!'}</span>
                    </div>
                </button>
            `;
        }).join('');
        
        // Weekly summary
        this.renderWeekSummary();
    },
    
    renderWeekSummary() {
        const summary = Reports.getWeeklySummary();
        
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
                <div>
                    <div class="week-stat-value">${summary.avgScore}%</div>
                    <div class="week-stat-label">Avg Score</div>
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
        
        // Update welcome message
        const practiceMsg = document.getElementById('practice-summary');
        if (summary.totalSessions > 0) {
            practiceMsg.textContent = `${summary.daysActive} days active this week • ${summary.formattedTime} practiced`;
        } else {
            practiceMsg.textContent = 'Start practicing to track your progress';
        }
    },
    
    selectExercise(type) {
        this.selectedExercise = type;
        
        // Update setup view
        const exerciseInfo = {
            naming: { title: 'Picture Naming', desc: 'Identify objects and images' },
            categories: { title: 'Word Categories', desc: 'Match words to their categories' },
            sentences: { title: 'Sentence Completion', desc: 'Complete sentences with the right word' }
        };
        
        document.getElementById('setup-title').textContent = exerciseInfo[type].title;
        document.getElementById('setup-description').textContent = exerciseInfo[type].desc;
        
        // Render difficulty selector
        const unlockedLevel = Progress.getUnlockedLevel(type);
        const diffSelector = document.getElementById('difficulty-selector');
        
        diffSelector.innerHTML = '';
        for (let i = 1; i <= 7; i++) {
            const locked = i > unlockedLevel;
            const btn = document.createElement('button');
            btn.className = `diff-btn ${i === unlockedLevel ? 'active' : ''} ${locked ? '' : ''}`;
            btn.disabled = locked;
            btn.innerHTML = `Level ${i} ${locked ? '<span class="lock">🔒</span>' : ''}`;
            btn.onclick = () => {
                if (!locked) {
                    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedDifficulty = i;
                }
            };
            
            if (i === unlockedLevel) {
                this.selectedDifficulty = i;
            }
            
            diffSelector.appendChild(btn);
        }
        
        this.showView('setup');
    },
    
    beginExercise() {
        // Initialize exercise engine
        const success = ExerciseEngine.init({
            type: this.selectedExercise,
            difficulty: this.selectedDifficulty,
            questionCount: this.selectedQuestionCount
        });
        
        if (!success) {
            alert('Unable to load exercise. Please try again.');
            return;
        }
        
        // Update header
        document.getElementById('exercise-type').textContent = 
            `${this.selectedExercise.charAt(0).toUpperCase() + this.selectedExercise.slice(1)} • Level ${this.selectedDifficulty}`;
        
        this.showView('exercise');
        ExerciseEngine.start();
    },
    
    repeatExercise() {
        this.beginExercise();
    },
    
    renderReports() {
        const summary = Reports.getWeeklySummary();
        const container = document.getElementById('weekly-report');
        
        let exerciseBreakdown = '';
        if (summary.exerciseStats) {
            exerciseBreakdown = Object.entries(summary.exerciseStats).map(([type, stats]) => {
                const avg = Math.round(stats.totalScore / stats.sessions);
                return `
                    <div class="stat-card">
                        <div class="stat-value">${stats.sessions}</div>
                        <div class="stat-label">${type} (${avg}% avg)</div>
                    </div>
                `;
            }).join('');
        }
        
        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-card">
                    <div class="stat-value">${summary.totalSessions}</div>
                    <div class="stat-label">Total Sessions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${summary.formattedTime}</div>
                    <div class="stat-label">Active Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${summary.daysActive}/7</div>
                    <div class="stat-label">Days Active</div>
                </div>
            </div>
            
            ${exerciseBreakdown ? `
                <h4 style="margin: 1.5rem 0 1rem;">By Exercise Type</h4>
                <div class="report-stats">
                    ${exerciseBreakdown}
                </div>
            ` : ''}
        `;
    },
    
    shareReport() {
        const settings = Settings.get();
        const report = Reports.generateEmailReport();
        
        if (settings.shareEmail) {
            // In a real app, this would send via API
            // For now, open mailto
            const subject = encodeURIComponent('WordBridge Weekly Progress');
            const body = encodeURIComponent(report);
            window.open(`mailto:${settings.shareEmail}?subject=${subject}&body=${body}`);
        } else {
            if (confirm('No email address set. Would you like to add one now?')) {
                this.showView('settings');
            }
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => app.init());
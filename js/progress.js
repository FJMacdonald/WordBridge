const Progress = {
    state: {
        streak: 0,
        lastPracticeDate: null,
        totalSessions: 0,
        totalActiveTime: 0,
        weeklyData: null
    },
    
    init() {
        const saved = Storage.get('progress');
        if (saved) {
            this.state = { ...this.state, ...saved };
        }
        this.checkStreak();
        this.updateUI();
    },
    
    save() {
        Storage.set('progress', this.state);
    },
    
    checkStreak() {
        const today = new Date().toDateString();
        const last = this.state.lastPracticeDate;
        
        if (!last) {
            this.state.streak = 0;
        } else if (last !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (last !== yesterday.toDateString()) {
                this.state.streak = 0;
            }
        }
        this.save();
    },
    
    recordSession(results) {
        const today = new Date().toDateString();
        
        // Update streak
        if (this.state.lastPracticeDate !== today) {
            this.state.streak++;
            this.state.lastPracticeDate = today;
        }
        
        // Update totals
        this.state.totalSessions++;
        this.state.totalActiveTime += results.duration;
        
        // Update weekly data
        this.updateWeeklyData(results);
        
        this.save();
        this.updateUI();
    },
    
    updateWeeklyData(session) {
        const weekStart = this.getWeekStart();
        let weekData = this.state.weeklyData;
        
        if (!weekData || weekData.weekStart !== weekStart) {
            weekData = {
                weekStart: weekStart,
                sessions: 0,
                totalTime: 0,
                dailyPractice: {}
            };
        }
        
        weekData.sessions++;
        weekData.totalTime += session.duration;
        weekData.dailyPractice[new Date().toDateString()] = true;
        
        this.state.weeklyData = weekData;
    },
    
    getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        return monday.toDateString();
    },
    
    getWeeklySummary() {
        const weekData = this.state.weeklyData;
        
        if (!weekData) {
            return {
                totalSessions: 0,
                formattedTime: '0:00',
                dailyPractice: this.getWeekDays()
            };
        }
        
        const mins = Math.floor(weekData.totalTime / 60);
        const secs = Math.round(weekData.totalTime % 60);
        
        return {
            totalSessions: weekData.sessions,
            formattedTime: `${mins}:${secs.toString().padStart(2, '0')}`,
            dailyPractice: this.getWeekDays(weekData.dailyPractice)
        };
    },
    
    getWeekDays(practiceData = {}) {
        const days = [];
        const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const today = new Date();
        const currentDay = today.getDay();
        
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateStr = date.toDateString();
            
            days.push({
                label: dayNames[i],
                complete: !!practiceData[dateStr],
                isToday: dateStr === today.toDateString()
            });
        }
        
        return days;
    },
    
    updateUI() {
        if (typeof document === 'undefined') return;
        
        const streakEl = document.getElementById('streak-count');
        if (streakEl) {
            streakEl.textContent = this.state.streak;
        }
    }
};
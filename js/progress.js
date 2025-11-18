/**
 * Progress Module
 * Handles XP, levels, streaks, and achievements
 */
const Progress = {
    state: {
        xp: 0,
        level: 1,
        streak: 0,
        lastPracticeDate: null,
        unlockedLevels: {
            naming: 1,
            categories: 1,
            sentences: 1
        },
        bestScores: {},
        achievements: [],
        totalSessions: 0,
        totalActiveTime: 0
    },
    
    xpPerLevel: 100,
    
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
    
    addXP(amount) {
        this.state.xp += amount;
        
        while (this.state.xp >= this.getXPForNextLevel()) {
            this.state.xp -= this.getXPForNextLevel();
            this.state.level++;
            this.showAchievement('Level Up!', `You reached level ${this.state.level}!`);
        }
        
        this.save();
        this.updateUI();
        return amount;
    },
    
    getXPForNextLevel() {
        return this.xpPerLevel + (this.state.level - 1) * 25;
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
    
    recordSession(type, difficulty, score, activeTime) {
        const today = new Date().toDateString();
        
        // Update streak
        if (this.state.lastPracticeDate !== today) {
            this.state.streak++;
            this.state.lastPracticeDate = today;
            
            // Streak achievements
            if (this.state.streak === 3) {
                this.unlockAchievement('streak_3', 'Three Day Streak', 'Practice 3 days in a row', 25);
            } else if (this.state.streak === 7) {
                this.unlockAchievement('streak_7', 'Week Warrior', 'Practice 7 days in a row', 50);
            } else if (this.state.streak === 30) {
                this.unlockAchievement('streak_30', 'Monthly Master', 'Practice 30 days in a row', 100);
            }
        }
        
        // Update best scores
        const key = `${type}_${difficulty}`;
        if (!this.state.bestScores[key] || score > this.state.bestScores[key]) {
            this.state.bestScores[key] = score;
        }
        
        // Unlock next difficulty at 80%
        if (score >= 80) {
            const currentMax = this.state.unlockedLevels[type] || 1;
            if (difficulty === currentMax && difficulty < 7) {
                this.state.unlockedLevels[type] = difficulty + 1;
                this.showAchievement('New Level Unlocked!', 
                    `${type.charAt(0).toUpperCase() + type.slice(1)} Level ${difficulty + 1} is now available`);
            }
        }
        
        // Update totals
        this.state.totalSessions++;
        this.state.totalActiveTime += activeTime;
        
        // First session achievement
        if (this.state.totalSessions === 1) {
            this.unlockAchievement('first_session', 'First Steps', 'Complete your first practice session', 10);
        }
        
        // Perfect score achievement
        if (score === 100) {
            this.unlockAchievement('perfect', 'Perfect!', 'Get 100% on an exercise', 25);
        }
        
        this.save();
        this.updateUI();
    },
    
    unlockAchievement(id, title, desc, bonusXP = 0) {
        if (!this.state.achievements.includes(id)) {
            this.state.achievements.push(id);
            this.showAchievement(title, desc);
            if (bonusXP > 0) {
                this.addXP(bonusXP);
            }
            this.save();
        }
    },
    
    showAchievement(title, desc) {
        const toast = document.getElementById('achievement-toast');
        document.getElementById('achievement-title').textContent = title;
        document.getElementById('achievement-desc').textContent = desc;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    },
    
    updateUI() {
        document.getElementById('user-level').textContent = this.state.level;
        document.getElementById('streak-count').textContent = this.state.streak;
        document.getElementById('current-xp').textContent = this.state.xp;
        document.getElementById('next-level-xp').textContent = this.getXPForNextLevel();
        
        const xpPercent = (this.state.xp / this.getXPForNextLevel()) * 100;
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;
    },
    
    getUnlockedLevel(type) {
        return this.state.unlockedLevels[type] || 1;
    },
    
    getBestScore(type, difficulty) {
        return this.state.bestScores[`${type}_${difficulty}`] || 0;
    }
};
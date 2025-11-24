// services/ExampleDataGenerator.js
class ExampleDataGenerator {
    constructor() {
        this.exerciseTypes = [
            'naming', 'listening', 'speaking', 'typing', 'sentenceTyping',
            'category', 'rhyming', 'firstSound', 'association', 
            'synonyms', 'definitions', 'scramble'
        ];
        
        this.words = [
            'apple', 'banana', 'car', 'dog', 'elephant', 'flower',
            'guitar', 'house', 'island', 'jacket', 'kitchen', 'lemon',
            'mountain', 'notebook', 'ocean', 'piano', 'queen', 'rainbow',
            'sandwich', 'telephone', 'umbrella', 'violin', 'window',
            'xylophone', 'yellow', 'zebra'
        ];
    }
    
    /**
     * Generate 6 months of realistic practice data
     */
    generateHistoricalData(months = 6) {
        const data = {
            dailyStats: {},
            wordStats: {},
            exerciseTypeStats: {},
            sessionHistory: [],
            streak: { current: 0, longest: 0, lastDate: null }
        };
        
        const now = Date.now();
        const daysToGenerate = months * 30;
        
        for (let dayOffset = daysToGenerate; dayOffset >= 0; dayOffset--) {
            const date = new Date(now - (dayOffset * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];
            
            // Simulate realistic practice patterns
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            // Probability of practice (higher on weekdays, with some variation)
            const practiceProbability = this.calculatePracticeProbability(dayOffset, isWeekend);
            
            if (Math.random() < practiceProbability) {
                const dayData = this.generateDayData(date, dayOffset);
                data.dailyStats[dateStr] = dayData.stats;
                data.sessionHistory.push(...dayData.sessions);
                
                // Update word stats
                this.updateWordStatsFromSessions(data.wordStats, dayData.sessions);
                
                // Update exercise type stats
                this.updateExerciseTypeStats(data.exerciseTypeStats, dayData.sessions, dateStr);
            }
        }
        
        // Calculate streaks
        data.streak = this.calculateStreaks(data.dailyStats);
        
        // Add flags to exercise types
        this.addExerciseTypeFlags(data.exerciseTypeStats);
        
        return data;
    }
    
    /**
     * Calculate practice probability with realistic patterns
     */
    calculatePracticeProbability(dayOffset, isWeekend) {
        // Start low, gradually increase (simulating improvement in habit)
        const baseProb = 0.3 + (0.5 * (1 - dayOffset / 180));
        
        // Weekend modifier
        const weekendModifier = isWeekend ? 0.7 : 1.0;
        
        // Add some randomness for life events (vacation, illness, etc.)
        const lifeEventModifier = Math.random() > 0.95 ? 0 : 1;
        
        return Math.min(0.9, baseProb * weekendModifier * lifeEventModifier);
    }
    
    /**
     * Generate a day's worth of practice data
     */
    generateDayData(date, dayOffset) {
        const progressFactor = 1 - (dayOffset / 180); // Improvement over time
        const sessionsToday = Math.random() > 0.7 ? 2 : 1; // Sometimes multiple sessions
        
        const sessions = [];
        const dayStats = {
            date: date.toISOString().split('T')[0],
            totalTime: 0,
            sessionsCount: sessionsToday,
            totalAttempts: 0,
            totalCorrect: 0,
            hintsUsed: 0,
            exerciseTypes: {}
        };
        
        for (let s = 0; s < sessionsToday; s++) {
            // Pick 1-3 exercise types per session
            const exerciseCount = Math.floor(Math.random() * 3) + 1;
            const selectedExercises = this.selectExercises(exerciseCount, progressFactor);
            
            selectedExercises.forEach(exerciseType => {
                const session = this.generateSession(
                    date, 
                    exerciseType, 
                    progressFactor,
                    dayOffset
                );
                
                sessions.push(session);
                
                // Update day stats
                dayStats.totalTime += session.activeTime;
                dayStats.totalAttempts += session.total;
                dayStats.totalCorrect += session.correct;
                dayStats.hintsUsed += session.hintsUsed;
                
                if (!dayStats.exerciseTypes[exerciseType]) {
                    dayStats.exerciseTypes[exerciseType] = {
                        sessions: 0,
                        attempts: 0,
                        correct: 0,
                        time: 0
                    };
                }
                
                dayStats.exerciseTypes[exerciseType].sessions++;
                dayStats.exerciseTypes[exerciseType].attempts += session.total;
                dayStats.exerciseTypes[exerciseType].correct += session.correct;
                dayStats.exerciseTypes[exerciseType].time += session.activeTime;
            });
        }
        
        return { stats: dayStats, sessions };
    }
    
    /**
     * Select exercise types with realistic patterns
     */
    selectExercises(count, progressFactor) {
        const exercises = [...this.exerciseTypes];
        const selected = [];
        
        // Bias selection based on difficulty and progress
        const weights = exercises.map(type => {
            // Some exercises are naturally preferred/avoided
            const preferences = {
                'naming': 1.2,       // Popular
                'listening': 1.1,    // Popular
                'scramble': 0.7,     // Harder
                'definitions': 0.8,  // Harder
                'speaking': 0.6 + progressFactor * 0.4 // Avoided initially, improves
            };
            
            return preferences[type] || 1.0;
        });
        
        for (let i = 0; i < count; i++) {
            const exercise = this.weightedRandom(exercises, weights);
            if (!selected.includes(exercise)) {
                selected.push(exercise);
            }
        }
        
        return selected;
    }
    
    /**
     * Generate a single session
     */
    generateSession(date, exerciseType, progressFactor, dayOffset) {
        // Base performance varies by exercise type
        const difficultyModifiers = {
            'scramble': 0.8,
            'definitions': 0.85,
            'synonyms': 0.9,
            'speaking': 0.75,
            'typing': 0.95
        };
        
        const baseDifficulty = difficultyModifiers[exerciseType] || 1.0;
        
        // Calculate performance (improves over time)
        const baseAccuracy = 0.5 + (progressFactor * 0.35);
        const accuracy = Math.min(0.95, baseAccuracy * baseDifficulty);
        
        // Add daily variation
        const dailyVariation = (Math.random() - 0.5) * 0.2;
        const finalAccuracy = Math.max(0.3, Math.min(0.98, accuracy + dailyVariation));
        
        // Generate session metrics
        const itemCount = Math.floor(Math.random() * 10) + 5; // 5-15 items
        const correct = Math.round(itemCount * finalAccuracy);
        const firstTryCorrect = Math.round(correct * (0.7 + progressFactor * 0.2));
        
        // Hints decrease with progress
        const hintProbability = 0.3 * (1 - progressFactor);
        const hintsUsed = Math.floor(Math.random() * itemCount * hintProbability);
        
        // Skips also decrease
        const skipProbability = 0.1 * (1 - progressFactor * 0.5);
        const skips = Math.floor(Math.random() * itemCount * skipProbability);
        
        // Time varies by exercise type and improves
        const baseTime = {
            'typing': 180,
            'sentenceTyping': 200,
            'scramble': 150,
            'speaking': 100,
            'listening': 120
        }[exerciseType] || 140;
        
        const timePerItem = baseTime * (1.2 - progressFactor * 0.3);
        const activeTime = timePerItem * itemCount * 1000; // Convert to ms
        
        // Response times improve
        const baseResponseTime = 5000; // 5 seconds
        const responseTime = baseResponseTime * (1.3 - progressFactor * 0.4);
        
        return {
            exerciseType,
            date: date.getTime(),
            duration: activeTime * 1.2, // Total time includes some inactivity
            activeTime,
            total: itemCount,
            correct,
            firstTryCorrect,
            accuracy: Math.round((correct / itemCount) * 100),
            hintsUsed,
            skips,
            medianResponseTime: responseTime + (Math.random() - 0.5) * 1000
        };
    }
    
    /**
     * Update word statistics from sessions
     */
    updateWordStatsFromSessions(wordStats, sessions) {
        sessions.forEach(session => {
            const wordsUsed = Math.min(session.total, this.words.length);
            const selectedWords = this.shuffleArray([...this.words]).slice(0, wordsUsed);
            
            // Create a list of correct/incorrect for this session
            const correctIndices = new Set();
            while (correctIndices.size < session.correct) {
                correctIndices.add(Math.floor(Math.random() * wordsUsed));
            }
            
            selectedWords.forEach((word, index) => {
                if (!wordStats[word]) {
                    wordStats[word] = {
                        attempts: 0,
                        correct: 0,
                        streak: 0,
                        hintsUsed: 0,
                        lastSeen: null,
                        responseTimes: [] // Add this
                    };
                }
                
                const stats = wordStats[word];
                stats.attempts++;
                
                const isCorrect = correctIndices.has(index);
                if (isCorrect) {
                    stats.correct++;
                    stats.streak++;
                } else {
                    stats.streak = 0;
                }
                
                // Distribute hints proportionally
                if (session.hintsUsed > 0 && Math.random() < (session.hintsUsed / session.total)) {
                    stats.hintsUsed++;
                }
                
                stats.lastSeen = session.date;
            });
        });
    }
    
    /**
     * Update exercise type statistics
     */
    updateExerciseTypeStats(stats, sessions, dateStr) {
        sessions.forEach(session => {
            const type = session.exerciseType;
            
            if (!stats[type]) {
                stats[type] = {
                    totalAttempts: 0,
                    firstTryCorrect: 0,
                    correctWithHints: 0,
                    totalSkips: 0,
                    totalHintsUsed: 0,
                    totalActiveTime: 0,
                    responseTimes: [],
                    dailySnapshots: {},
                    flags: {}
                };
            }
            
            stats[type].totalAttempts += session.total;
            stats[type].firstTryCorrect += session.firstTryCorrect;
            stats[type].correctWithHints += (session.correct - session.firstTryCorrect);
            stats[type].totalSkips += session.skips;
            stats[type].totalHintsUsed += session.hintsUsed;
            stats[type].totalActiveTime += session.activeTime;
            
            if (session.medianResponseTime) {
                stats[type].responseTimes.push(session.medianResponseTime);
            }
            
            // Daily snapshot
            if (!stats[type].dailySnapshots[dateStr]) {
                stats[type].dailySnapshots[dateStr] = {
                    attempts: 0,
                    firstTryCorrect: 0,
                    correctWithHints: 0,
                    skips: 0,
                    hintsUsed: 0,
                    activeTime: 0,
                    sessions: 0
                };
            }
            
            const daily = stats[type].dailySnapshots[dateStr];
            daily.attempts += session.total;
            daily.firstTryCorrect += session.firstTryCorrect;
            daily.correctWithHints += (session.correct - session.firstTryCorrect);
            daily.skips += session.skips;
            daily.hintsUsed += session.hintsUsed;
            daily.activeTime += session.activeTime;
            daily.sessions++;
        });
    }
    
    /**
     * Add flags to exercise types
     */
    addExerciseTypeFlags(stats) {
        Object.entries(stats).forEach(([type, data]) => {
            const totalAttempts = data.totalAttempts || 1;
            const accuracy = ((data.firstTryCorrect + data.correctWithHints) / totalAttempts) * 100;
            const hintDependency = data.totalHintsUsed / totalAttempts;
            const skipRate = data.totalSkips / totalAttempts;
            
            data.flags = {
                possibleMastery: accuracy > 85 && hintDependency < 0.15,
                possibleAvoidance: accuracy < 60 || skipRate > 0.2,
                needsAttention: accuracy < 70 && hintDependency > 0.3,
                trending: this.calculateTypeTrend(data),
                lastFlagUpdate: Date.now()
            };
        });
    }
    
    /**
     * Calculate trend for exercise type
     */
    calculateTypeTrend(data) {
        const snapshots = Object.entries(data.dailySnapshots || {})
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .slice(0, 14); // Last 2 weeks
        
        if (snapshots.length < 7) return 'stable';
        
        const recent = snapshots.slice(0, 7);
        const previous = snapshots.slice(7);
        
        const recentAccuracy = this.calculatePeriodAccuracy(recent);
        const previousAccuracy = this.calculatePeriodAccuracy(previous);
        
        const diff = recentAccuracy - previousAccuracy;
        
        if (diff > 5) return 'up';
        if (diff < -5) return 'down';
        return 'stable';
    }
    
    /**
     * Calculate accuracy for a period
     */
    calculatePeriodAccuracy(snapshots) {
        const totals = snapshots.reduce((acc, [, data]) => ({
            attempts: acc.attempts + data.attempts,
            correct: acc.correct + data.firstTryCorrect + data.correctWithHints
        }), { attempts: 0, correct: 0 });
        
        return totals.attempts > 0 ? (totals.correct / totals.attempts) * 100 : 0;
    }
    
    /**
     * Calculate streaks from daily stats
     */
    calculateStreaks(dailyStats) {
        const dates = Object.keys(dailyStats).sort();
        if (dates.length === 0) return { current: 0, longest: 0, lastDate: null };
        
        let currentStreak = 1;
        let longestStreak = 1;
        let tempStreak = 1;
        
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (dayDiff === 1) {
                tempStreak++;
                currentStreak = tempStreak;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
                currentStreak = 1;
            }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Check if streak is still active (practiced today or yesterday)
        const lastDate = dates[dates.length - 1];
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (lastDate !== today && lastDate !== yesterday) {
            currentStreak = 0;
        }
        
        return {
            current: currentStreak,
            longest: longestStreak,
            lastDate
        };
    }
    
    // Utility functions
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Make it available globally for testing
window.ExampleDataGenerator = ExampleDataGenerator;

export default ExampleDataGenerator;
/**
 * Word Tracking Module
 * Manages problem words, mastered words, and word statistics
 */
const WordTracking = {
    init() {
        // Initialize data structures if not present
        if (!Storage.get('wordStats')) {
            Storage.set('wordStats', {});
        }
        if (!Storage.get('problemWords')) {
            Storage.set('problemWords', {});
        }
        if (!Storage.get('masteredWords')) {
            Storage.set('masteredWords', {});
        }
    },
    
    trackAnswer(word, correct, exerciseType) {
        const stats = Storage.get('wordStats', {});
        const problemWords = Storage.get('problemWords', {});
        const masteredWords = Storage.get('masteredWords', {});
        
        // Initialize word stats if needed
        if (!stats[word]) {
            stats[word] = {
                totalAttempts: 0,
                correctAttempts: 0,
                incorrectAttempts: 0,
                consecutiveCorrect: 0,
                lastSeen: Date.now(),
                exercises: {}
            };
        }
        
        // Update stats
        stats[word].totalAttempts++;
        stats[word].lastSeen = Date.now();
        
        if (!stats[word].exercises[exerciseType]) {
            stats[word].exercises[exerciseType] = {
                attempts: 0,
                correct: 0
            };
        }
        stats[word].exercises[exerciseType].attempts++;
        
        if (correct) {
            stats[word].correctAttempts++;
            stats[word].consecutiveCorrect++;
            stats[word].exercises[exerciseType].correct++;
            
            // Check if problem word should be removed (3 consecutive correct)
            if (problemWords[word] && stats[word].consecutiveCorrect >= 3) {
                delete problemWords[word];
                stats[word].consecutiveCorrect = 0;
            }
            
            // Check for mastery
            const masteryThreshold = Settings.get('masteryThreshold') || 5;
            if (!masteredWords[word] && !problemWords[word] && 
                stats[word].consecutiveCorrect >= masteryThreshold) {
                masteredWords[word] = {
                    masteredAt: Date.now(),
                    totalAttempts: stats[word].totalAttempts,
                    accuracy: Math.round((stats[word].correctAttempts / stats[word].totalAttempts) * 100)
                };
            }
        } else {
            stats[word].incorrectAttempts++;
            stats[word].consecutiveCorrect = 0;
            
            // Add to problem words
            if (!masteredWords[word]) {
                if (!problemWords[word]) {
                    problemWords[word] = {
                        addedAt: Date.now(),
                        attempts: 0,
                        incorrect: 0
                    };
                }
                problemWords[word].attempts = stats[word].totalAttempts;
                problemWords[word].incorrect = stats[word].incorrectAttempts;
            }
        }
        
        // Save all data
        Storage.set('wordStats', stats);
        Storage.set('problemWords', problemWords);
        Storage.set('masteredWords', masteredWords);
    },
    
    getProblemWords() {
        return Storage.get('problemWords', {});
    },
    
    getMasteredWords() {
        return Storage.get('masteredWords', {});
    },
    
    getWordStats(word) {
        const stats = Storage.get('wordStats', {});
        return stats[word] || null;
    },
    
    resetProblemWord(word) {
        const problemWords = Storage.get('problemWords', {});
        delete problemWords[word];
        Storage.set('problemWords', problemWords);
        
        const stats = Storage.get('wordStats', {});
        if (stats[word]) {
            stats[word].consecutiveCorrect = 0;
        }
        Storage.set('wordStats', stats);
    },
    
    unmasterWord(word) {
        const masteredWords = Storage.get('masteredWords', {});
        delete masteredWords[word];
        Storage.set('masteredWords', masteredWords);
    },
    
    getStatsSummary() {
        const problemWords = this.getProblemWords();
        const masteredWords = this.getMasteredWords();
        const stats = Storage.get('wordStats', {});
        
        return {
            totalWordsAttempted: Object.keys(stats).length,
            problemWordCount: Object.keys(problemWords).length,
            masteredWordCount: Object.keys(masteredWords).length,
            problemWords: Object.entries(problemWords).map(([word, data]) => ({
                word,
                ratio: `${data.incorrect}/${data.attempts}`,
                accuracy: data.attempts > 0 ? 
                    Math.round(((data.attempts - data.incorrect) / data.attempts) * 100) : 0
            })),
            masteredWords: Object.entries(masteredWords).map(([word, data]) => ({
                word,
                masteredAt: new Date(data.masteredAt).toLocaleDateString(),
                accuracy: data.accuracy
            }))
        };
    }
};
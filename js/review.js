/**
 * Review Module
 * Tracks words that need additional practice using spaced repetition principles
 */
const Review = {
    // Words are stored with: word, type, attempts needed, last practiced, success streak
    
    getReviewWords() {
        return Storage.get('reviewWords', []);
    },
    
    saveReviewWords(words) {
        Storage.set('reviewWords', words);
    },
    
    /**
     * Add a word that needs review
     */
    addWord(word, exerciseType, difficulty) {
        const words = this.getReviewWords();
        
        // Check if word already exists
        const existing = words.find(w => 
            w.word.toLowerCase() === word.toLowerCase() && 
            w.type === exerciseType
        );
        
        if (existing) {
            // Reset success streak, increment times missed
            existing.successStreak = 0;
            existing.timesMissed++;
            existing.lastPracticed = Date.now();
        } else {
            // Add new word to review
            words.push({
                word: word,
                type: exerciseType,
                difficulty: difficulty,
                timesMissed: 1,
                timesCorrect: 0,
                successStreak: 0,
                lastPracticed: Date.now(),
                addedDate: Date.now()
            });
        }
        
        this.saveReviewWords(words);
    },
    
    /**
     * Record successful practice of a review word
     */
    recordSuccess(word, exerciseType) {
        const words = this.getReviewWords();
        const existing = words.find(w => 
            w.word.toLowerCase() === word.toLowerCase() && 
            w.type === exerciseType
        );
        
        if (existing) {
            existing.timesCorrect++;
            existing.successStreak++;
            existing.lastPracticed = Date.now();
            
            // Remove from review if mastered (3 correct in a row)
            if (existing.successStreak >= 3) {
                const index = words.indexOf(existing);
                words.splice(index, 1);
            }
        }
        
        this.saveReviewWords(words);
    },
    
    /**
     * Get words due for review for a specific exercise type
     * Prioritizes words that:
     * - Haven't been practiced recently
     * - Have been missed more times
     * - Have lower success streaks
     */
    getWordsForReview(exerciseType, count = 3) {
        const words = this.getReviewWords();
        const now = Date.now();
        const hourMs = 60 * 60 * 1000;
        
        // Filter by type and sort by priority
        const typeWords = words
            .filter(w => w.type === exerciseType)
            .map(w => {
                // Calculate priority score (higher = more urgent)
                const hoursSinceLastPractice = (now - w.lastPracticed) / hourMs;
                const missedWeight = w.timesMissed * 2;
                const streakPenalty = w.successStreak * 3;
                const timeBonus = Math.min(hoursSinceLastPractice, 24); // Cap at 24 hours
                
                return {
                    ...w,
                    priority: missedWeight + timeBonus - streakPenalty
                };
            })
            .sort((a, b) => b.priority - a.priority);
        
        return typeWords.slice(0, count);
    },
    
    /**
     * Create exercise questions from review words
     */
    createReviewQuestions(exerciseType, difficulty) {
        const reviewWords = this.getWordsForReview(exerciseType);
        
        if (reviewWords.length === 0) return [];
        
        // Get the original exercise data to find similar distractors
        const exerciseData = ExerciseData[exerciseType][difficulty] || ExerciseData[exerciseType][1];
        
        return reviewWords.map(rw => {
            // Find original question or create one
            let originalQ = null;
            for (let level = 1; level <= 7; level++) {
                const levelData = ExerciseData[exerciseType][level];
                if (levelData) {
                    originalQ = levelData.find(q => 
                        q.answer.toLowerCase() === rw.word.toLowerCase()
                    );
                    if (originalQ) break;
                }
            }
            
            if (originalQ) {
                return { ...originalQ, isReview: true };
            }
            
            // If we can't find original, create a basic question
            // This handles custom exercise words
            return this.createBasicQuestion(rw, exerciseData);
        }).filter(q => q !== null);
    },
    
    /**
     * Create a basic question for a review word without original data
     */
    createBasicQuestion(reviewWord, sampleData) {
        // Get some random distractors from sample data
        const distractors = sampleData
            .map(q => q.answer)
            .filter(a => a.toLowerCase() !== reviewWord.word.toLowerCase())
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        if (distractors.length < 3) return null;
        
        return {
            prompt: `What is this word?`,
            answer: reviewWord.word,
            options: [reviewWord.word, ...distractors],
            isReview: true
        };
    },
    
    /**
     * Get statistics about review words
     */
    getStats() {
        const words = this.getReviewWords();
        
        const byType = {};
        words.forEach(w => {
            if (!byType[w.type]) {
                byType[w.type] = { count: 0, totalMissed: 0 };
            }
            byType[w.type].count++;
            byType[w.type].totalMissed += w.timesMissed;
        });
        
        return {
            totalWords: words.length,
            byType: byType,
            oldestWord: words.length > 0 
                ? Math.min(...words.map(w => w.addedDate))
                : null
        };
    },
    
    /**
     * Clear all review words (for testing/reset)
     */
    clear() {
        this.saveReviewWords([]);
    }
};
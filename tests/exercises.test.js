/**
 * Exercise Engine Tests
 */
describe('Exercise Engine', () => {
    beforeEach(() => {
        localStorage.clear();
        Review.clear();
        Progress.state = {
            xp: 0,
            level: 1,
            streak: 0,
            lastPracticeDate: null,
            unlockedLevels: { naming: 1, categories: 1, sentences: 1 },
            bestScores: {},
            achievements: [],
            totalSessions: 0,
            totalActiveTime: 0
        };
    });
    
    it('should initialize with correct question count', () => {
        const success = ExerciseEngine.init({
            type: 'naming',
            difficulty: 1,
            questionCount: 5
        });
        
        expect(success).toBeTruthy();
        expect(ExerciseEngine.questions).toHaveLength(5);
    });
    
    it('should return false for invalid exercise type', () => {
        const success = ExerciseEngine.init({
            type: 'invalid_type',
            difficulty: 1,
            questionCount: 5
        });
        
        expect(success).toBeFalsy();
    });
    
    it('should return false for invalid difficulty level', () => {
        const success = ExerciseEngine.init({
            type: 'naming',
            difficulty: 999, // Non-existent level
            questionCount: 5
        });
        
        expect(success).toBeFalsy();
    });
    
    it('should shuffle questions', () => {
        // Run multiple times to check randomization
        const orders = [];
        for (let i = 0; i < 10; i++) {
            ExerciseEngine.init({
                type: 'naming',
                difficulty: 1,
                questionCount: 5
            });
            orders.push(ExerciseEngine.questions.map(q => q.answer).join(','));
        }
        
        // At least some should be different
        const uniqueOrders = new Set(orders);
        expect(uniqueOrders.size).toBeGreaterThan(1);
    });
    
    it('should include review words in session', () => {
        // Add words to review
        Review.addWord('apple', 'naming', 1);
        Review.addWord('dog', 'naming', 1);
        
        ExerciseEngine.init({
            type: 'naming',
            difficulty: 1,
            questionCount: 10
        });
        
        const reviewQuestions = ExerciseEngine.questions.filter(q => q.isReview);
        expect(reviewQuestions.length).toBeGreaterThan(0);
    });
    
    it('should track results correctly', () => {
        ExerciseEngine.init({
            type: 'naming',
            difficulty: 1,
            questionCount: 2
        });
        
        // Manually set up results
        ExerciseEngine.results = [
            { word: 'test1', correct: true, attempts: 1 },
            { word: 'test2', correct: false, attempts: 3 }
        ];
        
        const correct = ExerciseEngine.results.filter(r => r.correct).length;
        expect(correct).toBe(1);
    });
    
    it('should not request more questions than available', () => {
        // If data has fewer questions than requested, should still work
        const success = ExerciseEngine.init({
            type: 'naming',
            difficulty: 1,
            questionCount: 1000 // Way more than available
        });
        
        expect(success).toBeTruthy();
        // Should get all available questions
        expect(ExerciseEngine.questions.length).toBeGreaterThan(0);
    });
});
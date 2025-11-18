/**
 * Review Module Tests
 */
describe('Review Module', () => {
    beforeEach(() => {
        localStorage.clear();
        Review.clear();
    });
    
    it('should start with empty review words', () => {
        const words = Review.getReviewWords();
        expect(words).toHaveLength(0);
    });
    
    it('should add a word for review', () => {
        Review.addWord('apple', 'naming', 1);
        const words = Review.getReviewWords();
        expect(words).toHaveLength(1);
        expect(words[0].word).toBe('apple');
    });
    
    it('should track times missed', () => {
        Review.addWord('apple', 'naming', 1);
        Review.addWord('apple', 'naming', 1);
        const words = Review.getReviewWords();
        expect(words[0].timesMissed).toBe(2);
    });
    
    it('should not duplicate words', () => {
        Review.addWord('apple', 'naming', 1);
        Review.addWord('apple', 'naming', 1);
        const words = Review.getReviewWords();
        expect(words).toHaveLength(1);
    });
    
    it('should track success and increment streak', () => {
        Review.addWord('apple', 'naming', 1);
        Review.recordSuccess('apple', 'naming');
        const words = Review.getReviewWords();
        expect(words[0].successStreak).toBe(1);
        expect(words[0].timesCorrect).toBe(1);
    });
    
    it('should remove word after 3 consecutive successes', () => {
        Review.addWord('apple', 'naming', 1);
        Review.recordSuccess('apple', 'naming');
        Review.recordSuccess('apple', 'naming');
        Review.recordSuccess('apple', 'naming');
        const words = Review.getReviewWords();
        expect(words).toHaveLength(0);
    });
    
    it('should reset streak on miss', () => {
        Review.addWord('apple', 'naming', 1);
        Review.recordSuccess('apple', 'naming');
        Review.recordSuccess('apple', 'naming');
        Review.addWord('apple', 'naming', 1); // Missed again
        const words = Review.getReviewWords();
        expect(words[0].successStreak).toBe(0);
    });
    
    it('should filter words by exercise type', () => {
        Review.addWord('apple', 'naming', 1);
        Review.addWord('happy', 'categories', 1);
        
        const namingWords = Review.getWordsForReview('naming');
        expect(namingWords).toHaveLength(1);
        expect(namingWords[0].word).toBe('apple');
    });
    
    it('should return stats correctly', () => {
        Review.addWord('apple', 'naming', 1);
        Review.addWord('banana', 'naming', 1);
        Review.addWord('happy', 'categories', 1);
        
        const stats = Review.getStats();
        expect(stats.totalWords).toBe(3);
        expect(stats.byType.naming.count).toBe(2);
        expect(stats.byType.categories.count).toBe(1);
    });
});
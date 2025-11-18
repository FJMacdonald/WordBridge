/**
 * Progress Module Tests
 */
describe('Progress Module', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset progress state
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
    
    it('should initialize with default state', () => {
        Progress.init();
        expect(Progress.state.level).toBe(1);
        expect(Progress.state.xp).toBe(0);
    });
    
    it('should add XP correctly', () => {
        Progress.init();
        Progress.addXP(50);
        expect(Progress.state.xp).toBe(50);
    });
    
    it('should level up when XP threshold reached', () => {
        Progress.init();
        Progress.addXP(100);
        expect(Progress.state.level).toBe(2);
        expect(Progress.state.xp).toBe(0);
    });
    
    it('should handle multiple level ups', () => {
        Progress.init();
        Progress.addXP(250); // Level 1: 100, Level 2: 125
        expect(Progress.state.level).toBe(3);
    });
    
    it('should calculate XP for next level correctly', () => {
        Progress.init();
        expect(Progress.getXPForNextLevel()).toBe(100); // Level 1
        Progress.state.level = 2;
        expect(Progress.getXPForNextLevel()).toBe(125); // Level 2
    });
    
    it('should track streak correctly', () => {
        Progress.init();
        Progress.recordSession('naming', 1, 80, 60);
        expect(Progress.state.streak).toBe(1);
    });
    
    it('should unlock next difficulty at 80%', () => {
        Progress.init();
        Progress.recordSession('naming', 1, 80, 60);
        expect(Progress.state.unlockedLevels.naming).toBe(2);
    });
    
    it('should not unlock at less than 80%', () => {
        Progress.init();
        Progress.recordSession('naming', 1, 79, 60);
        expect(Progress.state.unlockedLevels.naming).toBe(1);
    });
    
    it('should track best scores', () => {
        Progress.init();
        Progress.recordSession('naming', 1, 75, 60);
        Progress.recordSession('naming', 1, 85, 60);
        expect(Progress.getBestScore('naming', 1)).toBe(85);
    });
    
    it('should not replace better scores with worse', () => {
        Progress.init();
        Progress.recordSession('naming', 1, 90, 60);
        Progress.recordSession('naming', 1, 80, 60);
        expect(Progress.getBestScore('naming', 1)).toBe(90);
    });
    
    it('should persist state to storage', () => {
        Progress.init();
        Progress.addXP(50);
        
        // Simulate reload
        const saved = Storage.get('progress');
        expect(saved.xp).toBe(50);
    });
});
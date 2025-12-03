// services/AssessmentService.js
import storageService from './StorageService.js';
import { t, i18n } from '../core/i18n.js';

class AssessmentService {
    constructor() {
        // All exercise types in the app
        this.allExerciseTypes = [
            'naming', 'listening', 'speaking', 'typing', 
            'sentenceTyping', 'category', 'rhyming', 'firstSound', 
            'association', 'synonyms', 'definitions', 'scramble'
        ];
        
        this.getStorageKey = (baseKey) => {
            const locale = i18n.getCurrentLocale();
            return `${baseKey}_${locale}`;
        };
        
        // Define assessment templates
        this.assessmentTemplates = {
            baseline: {
                id: 'baseline',
                // Will be dynamically generated based on user level
                sections: []
            },
            quick: {
                id: 'quick',
                // Will be dynamically generated based on selected exercise type
                sections: []
            }
        };
    }
    
    /**
     * Get the current difficulty level for baseline assessments
     * Users start at 'easy' and progress to 'medium' and 'hard'
     */
    getBaselineDifficulty() {
        const userLevel = storageService.get(this.getStorageKey('userLevel'), {
            baselineDifficulty: 'easy',
            masteredExercises: {}
        });
        return userLevel.baselineDifficulty || 'easy';
    }
    
    /**
     * Check if user has mastered all exercise types at current difficulty
     */
    hasUserMasteredAllExercises(difficulty = 'easy') {
        const userLevel = storageService.get(this.getStorageKey('userLevel'), {
            baselineDifficulty: 'easy',
            masteredExercises: {}
        });
        
        const masteredCount = this.allExerciseTypes.filter(type => {
            return userLevel.masteredExercises[type] === difficulty;
        }).length;
        
        return masteredCount === this.allExerciseTypes.length;
    }
    
    /**
     * Generate baseline assessment sections based on user's current level
     */
    generateBaselineSections() {
        const difficulty = this.getBaselineDifficulty();
        
        return this.allExerciseTypes.map(type => ({
            type,
            difficulty,
            items: 10
        }));
    }
    
    /**
     * Generate quick check sections for a specific exercise type
     */
    generateQuickCheckSections(exerciseType) {
        const userLevel = storageService.get(this.getStorageKey('userLevel'), {
            baselineDifficulty: 'easy',
            masteredExercises: {}
        });
        
        const difficulty = userLevel.masteredExercises[exerciseType] || 'easy';
        
        return [{
            type: exerciseType,
            difficulty,
            items: 20
        }];
    }
    
    /**
     * Start a new assessment
     */
    startAssessment(templateId = 'baseline', exerciseType = null) {
        let sections;
        
        if (templateId === 'baseline') {
            sections = this.generateBaselineSections();
        } else if (templateId === 'quick') {
            if (!exerciseType) {
                throw new Error('Quick check requires an exercise type');
            }
            sections = this.generateQuickCheckSections(exerciseType);
        } else {
            throw new Error(`Unknown assessment template: ${templateId}`);
        }
        
        const assessment = {
            id: Date.now(),
            templateId,
            exerciseType: exerciseType || null,
            startTime: Date.now(),
            endTime: null,
            sections: sections.map(section => ({
                ...section,
                completed: false,
                results: []
            })),
            currentSectionIndex: 0,
            metadata: {
                timeOfDay: new Date().getHours(),
                dayOfWeek: new Date().getDay(),
                daysSinceLastAssessment: this.getDaysSinceLastAssessment(),
                difficulty: templateId === 'baseline' ? this.getBaselineDifficulty() : 'user-level'
            }
        };
        
        // Save in progress
        storageService.set(this.getStorageKey('currentAssessment'), assessment);
        
        return assessment;
    }
    
    /**
     * Get current in-progress assessment
     */
    getCurrentAssessment() {
        return storageService.get(this.getStorageKey('currentAssessment'), null);
    }
    
    /**
     * Record answer during assessment
     */
    recordAssessmentAnswer(answer) {
        const assessment = this.getCurrentAssessment();
        if (!assessment) return;
        
        const currentSection = assessment.sections[assessment.currentSectionIndex];
        currentSection.results.push({
            ...answer,
            timestamp: Date.now()
        });
        
        storageService.set(this.getStorageKey('currentAssessment'), assessment);
    }
    
    /**
     * Move to next section
     */
    nextSection() {
        const assessment = this.getCurrentAssessment();
        if (!assessment) return null;
        
        const currentSection = assessment.sections[assessment.currentSectionIndex];
        currentSection.completed = true;
        
        assessment.currentSectionIndex++;
        
        storageService.set(this.getStorageKey('currentAssessment'), assessment);
        
        return assessment.currentSectionIndex < assessment.sections.length
            ? assessment.sections[assessment.currentSectionIndex]
            : null;
    }
    
    /**
     * Complete assessment and calculate final scores
     */
    completeAssessment() {
        const assessment = this.getCurrentAssessment();
        if (!assessment) return null;
        
        assessment.endTime = Date.now();
        assessment.duration = assessment.endTime - assessment.startTime;
        
        // Calculate overall metrics
        const allResults = assessment.sections.flatMap(s => s.results);
        
        const totalAttempts = allResults.length;
        const correctFirstTry = allResults.filter(r => r.correct && r.attemptNumber === 1).length;
        const correctWithHints = allResults.filter(r => r.correct && r.attemptNumber > 1).length;
        const totalHints = allResults.reduce((sum, r) => sum + (r.hintsUsed || 0), 0);
        const responseTimes = allResults
            .filter(r => r.responseTime)
            .map(r => r.responseTime);
        
        assessment.results = {
            overallScore: Math.round((correctFirstTry / totalAttempts) * 100),
            accuracy: Math.round(((correctFirstTry + correctWithHints) / totalAttempts) * 100),
            firstTryAccuracy: Math.round((correctFirstTry / totalAttempts) * 100),
            hintDependency: Math.round((totalHints / totalAttempts) * 100),
            avgResponseTime: responseTimes.length > 0
                ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
                : null,
            sectionBreakdown: assessment.sections.map(section => ({
                type: section.type,
                difficulty: section.difficulty,
                accuracy: this.calculateSectionAccuracy(section.results),
                firstTryAccuracy: this.calculateSectionFirstTryAccuracy(section.results),
                avgResponseTime: this.calculateAvgResponseTime(section.results)
            }))
        };
        
        // Save to history
        this.saveAssessmentToHistory(assessment);
        
        // Update user level if baseline assessment
        if (assessment.templateId === 'baseline') {
            this.updateUserLevelFromBaseline(assessment);
        }
        
        // Clear current
        storageService.remove('currentAssessment');
        
        return assessment;
    }
    
    /**
     * Update user level based on baseline assessment results
     */
    updateUserLevelFromBaseline(assessment) {
        const userLevel = storageService.get(this.getStorageKey('userLevel'), {
            baselineDifficulty: 'easy',
            masteredExercises: {}
        });
        
        const currentDifficulty = assessment.metadata.difficulty;
        
        // Check each exercise type - mastery threshold is 85%
        assessment.results.sectionBreakdown.forEach(section => {
            if (section.firstTryAccuracy >= 85) {
                userLevel.masteredExercises[section.type] = currentDifficulty;
            }
        });
        
        // If all exercises mastered at current level, advance difficulty
        const allMastered = this.allExerciseTypes.every(type => 
            userLevel.masteredExercises[type] === currentDifficulty
        );
        
        if (allMastered) {
            if (currentDifficulty === 'easy') {
                userLevel.baselineDifficulty = 'medium';
            } else if (currentDifficulty === 'medium') {
                userLevel.baselineDifficulty = 'hard';
            }
            // If already at hard, stay there
        }
        
        storageService.set(this.getStorageKey('userLevel'), userLevel);
    }
    
    /**
     * Calculate section-specific metrics
     */
    calculateSectionAccuracy(results) {
        if (results.length === 0) return 0;
        const correct = results.filter(r => r.correct).length;
        return Math.round((correct / results.length) * 100);
    }
    
    calculateSectionFirstTryAccuracy(results) {
        if (results.length === 0) return 0;
        const correct = results.filter(r => r.correct && r.attemptNumber === 1).length;
        return Math.round((correct / results.length) * 100);
    }
    
    calculateAvgResponseTime(results) {
        const times = results.filter(r => r.responseTime).map(r => r.responseTime);
        if (times.length === 0) return null;
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }
    
    /**
     * Save completed assessment to history
     */
    saveAssessmentToHistory(assessment) {
        const history = storageService.get(this.getStorageKey('assessmentHistory'), []);
        
        // Ensure we're saving with the right structure
        const record = {
            id: assessment.id,
            templateId: assessment.templateId,
            date: assessment.startTime || assessment.date,
            duration: assessment.duration,
            results: assessment.results,
            metadata: assessment.metadata
        };
        
        history.push(record);
        
        // Keep last 100 assessments
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        storageService.set(this.getStorageKey('assessmentHistory'), history);
    }
    
    /**
     * Get assessment history
     */
    getAssessmentHistory(templateId = null) {
        const history = storageService.get(this.getStorageKey('assessmentHistory'), []);
        return templateId
            ? history.filter(a => a.templateId === templateId)
            : history;
    }
    
    /**
     * Compare two assessments
     */
    compareAssessments(assessmentId1, assessmentId2) {
        const history = this.getAssessmentHistory();
        const a1 = history.find(a => a.id === assessmentId1);
        const a2 = history.find(a => a.id === assessmentId2);
        
        if (!a1 || !a2) return null;
        
        return {
            overallScore: {
                before: a1.results.overallScore,
                after: a2.results.overallScore,
                change: a2.results.overallScore - a1.results.overallScore
            },
            accuracy: {
                before: a1.results.accuracy,
                after: a2.results.accuracy,
                change: a2.results.accuracy - a1.results.accuracy
            },
            hintDependency: {
                before: a1.results.hintDependency,
                after: a2.results.hintDependency,
                change: a1.results.hintDependency - a2.results.hintDependency // Lower is better
            },
            responseTime: {
                before: a1.results.avgResponseTime,
                after: a2.results.avgResponseTime,
                change: a1.results.avgResponseTime - a2.results.avgResponseTime // Lower is better
            },
            exerciseBreakdown: this.compareExerciseBreakdown(a1.results.sectionBreakdown, a2.results.sectionBreakdown)
        };
    }
    
    /**
     * Compare exercise-specific performance
     */
    compareExerciseBreakdown(sections1, sections2) {
        const comparison = {};
        
        sections1.forEach(s1 => {
            const s2 = sections2.find(s => s.type === s1.type);
            if (s2) {
                comparison[s1.type] = {
                    accuracy: s2.accuracy - s1.accuracy,
                    responseTime: s1.avgResponseTime && s2.avgResponseTime
                        ? s1.avgResponseTime - s2.avgResponseTime
                        : null
                };
            }
        });
        
        return comparison;
    }
    
    /**
     * Generate recommendations based on assessment
     */
    generateRecommendations(assessment) {
        const recommendations = [];
        const results = assessment.results;
        
        // Overall performance
        if (results.overallScore < 60) {
            recommendations.push({
                priority: 'high',
                type: 'overall',
                message: 'Focus on daily practice across all exercise types',
                target: 'Aim for 20 minutes per day'
            });
        }
        
        // Hint dependency
        if (results.hintDependency > 40) {
            recommendations.push({
                priority: 'high',
                type: 'hints',
                message: 'Try to reduce hint usage',
                target: 'Challenge yourself to answer without hints first'
            });
        }
        
        // Exercise-specific weaknesses
        const weakExercises = results.sectionBreakdown
            .filter(s => s.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3);
        
        weakExercises.forEach(ex => {
            recommendations.push({
                priority: 'medium',
                type: 'exercise',
                exercise: ex.type,
                message: `Improve ${t(`exercises.${ex.type}.name`)} performance`,
                target: `Practice ${ex.type} exercises for 10 minutes daily`
            });
        });
        
        // Response time
        if (results.avgResponseTime && results.avgResponseTime > 8000) {
            recommendations.push({
                priority: 'low',
                type: 'speed',
                message: 'Work on response speed',
                target: 'Regular practice will naturally improve speed'
            });
        }
        
        // Positive feedback
        const strongExercises = results.sectionBreakdown
            .filter(s => s.accuracy >= 85)
            .map(s => s.type);
        
        if (strongExercises.length > 0) {
            recommendations.push({
                priority: 'positive',
                type: 'strength',
                message: `Excellent performance in: ${strongExercises.map(t => t(`exercises.${t}.name`)).join(', ')}`,
                target: 'Keep up the great work!'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Calculate practice quality score (from regular practice data)
     */
    calculatePracticeQuality(timeRange = 7) {
        const dailyStats = storageService.get('dailyStats', {});
        const cutoff = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
        
        const recentDays = Object.entries(dailyStats)
            .filter(([date]) => new Date(date).getTime() > cutoff)
            .map(([, data]) => data);
        
        if (recentDays.length === 0) return null;
        
        // Quality factors
        const consistency = recentDays.length / timeRange; // Did they practice regularly?
        const avgDuration = recentDays.reduce((sum, d) => sum + (d.totalTime || 0), 0) / recentDays.length;
        const durationScore = Math.min(avgDuration / (20 * 60 * 1000), 1); // Target 20 min
        
        const exerciseTypes = new Set();
        recentDays.forEach(d => {
            Object.keys(d.exerciseTypes || {}).forEach(type => exerciseTypes.add(type));
        });
        const variety = exerciseTypes.size / 12; // 12 exercise types available
        
        const avgAccuracy = recentDays.reduce((sum, d) => {
            return sum + (d.totalAttempts > 0 ? (d.totalCorrect / d.totalAttempts) : 0);
        }, 0) / recentDays.length;
        
        return {
            overall: Math.round((consistency * 0.3 + durationScore * 0.2 + variety * 0.2 + avgAccuracy * 0.3) * 100),
            breakdown: {
                consistency: Math.round(consistency * 100),
                duration: Math.round(durationScore * 100),
                variety: Math.round(variety * 100),
                accuracy: Math.round(avgAccuracy * 100)
            }
        };
    }
    
    /**
     * Helper: days since last assessment
     */
    getDaysSinceLastAssessment() {
        const history = this.getAssessmentHistory();
        if (history.length === 0) return null;
        
        const last = history[history.length - 1];
        const daysDiff = (Date.now() - last.date) / (1000 * 60 * 60 * 24);
        return Math.floor(daysDiff);
    }
}

export const assessmentService = new AssessmentService();
export default assessmentService;
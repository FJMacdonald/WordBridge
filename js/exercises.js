const ExerciseEngine = {
    config: null,
    questions: [],
    currentIndex: 0,
    results: [],
    activeTimeStart: null,
    totalActiveTime: 0,
    sessionXP: 0,
    currentAttempts: 0,
    
    init(config) {
        this.config = config;
        this.questions = [];
        this.currentIndex = 0;
        this.results = [];
        this.totalActiveTime = 0;
        this.sessionXP = 0;
        
        // Get base questions for this exercise type and difficulty
        let data = ExerciseData[config.type][config.difficulty];
        if (!data || data.length === 0) {
            console.error('No data for', config.type, config.difficulty);
            return false;
        }
        
        // Get review questions (words the user previously struggled with)
        const reviewQuestions = Review.createReviewQuestions(
            config.type, 
            config.difficulty
        );
        
        // Combine: start with some review, then new content
        let combinedQuestions = [];
        
        if (reviewQuestions.length > 0) {
            // Add review questions first (up to 30% of session)
            const maxReview = Math.ceil(config.questionCount * 0.3);
            combinedQuestions = reviewQuestions.slice(0, maxReview);
        }
        
        // Fill rest with regular questions
        const regularQuestions = this.shuffle([...data]);
        const needed = config.questionCount - combinedQuestions.length;
        combinedQuestions = [
            ...combinedQuestions,
            ...regularQuestions.slice(0, needed)
        ];
        
        // Shuffle the combined set so reviews aren't always first
        this.questions = this.shuffle(combinedQuestions);
        
        return true;
    },
    
    start() {
        this.showQuestion();
    },
    
    showQuestion() {
        const question = this.questions[this.currentIndex];
        this.currentAttempts = 0;
        this.activeTimeStart = Date.now();
        
        // Update progress indicator
        const progressText = `${this.currentIndex + 1} / ${this.questions.length}`;
        document.getElementById('exercise-progress').textContent = progressText;
        
        // Show review indicator if this is a review question
        const typeEl = document.getElementById('exercise-type');
        if (question.isReview) {
            typeEl.innerHTML = `${this.config.type} • Level ${this.config.difficulty} <span style="color: var(--warning);">★ Review</span>`;
        } else {
            typeEl.textContent = `${this.config.type} • Level ${this.config.difficulty}`;
        }
        
        // Render prompt
        const promptArea = document.getElementById('prompt-area');
        promptArea.innerHTML = this.renderPrompt(question);
        
        // Render answers
        const answerArea = document.getElementById('answer-area');
        const shuffledOptions = this.shuffle([...question.options]);
        
        answerArea.innerHTML = `
            <div class="answer-grid">
                ${shuffledOptions.map((opt, i) => `
                    <button class="answer-btn" data-answer="${opt}" onclick="ExerciseEngine.checkAnswer('${opt.replace(/'/g, "\\'")}', this)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Clear hint area
        document.getElementById('hint-area').innerHTML = '';
    },
    
    renderPrompt(question) {
        switch (this.config.type) {
            case 'naming':
                if (question.emoji) {
                    return `
                        <div class="prompt-emoji">${question.emoji}</div>
                        <div class="prompt-instruction">What is this?</div>
                    `;
                } else if (question.image) {
                    return `
                        <img src="${question.image}" alt="Identify this" class="prompt-image">
                        <div class="prompt-instruction">What is this?</div>
                    `;
                }
                break;
                
            case 'categories':
                return `
                    <div class="prompt-text">${question.prompt}</div>
                `;
                
            case 'sentences':
                return `
                    <div class="prompt-text">${question.prompt}</div>
                    <div class="prompt-instruction">Complete the sentence</div>
                `;
        }
        return '';
    },
    
    checkAnswer(selected, button) {
        const question = this.questions[this.currentIndex];
        const correct = selected.toLowerCase() === question.answer.toLowerCase();
        
        this.currentAttempts++;
        
        if (correct) {
            // Record active time for this question
            const questionTime = (Date.now() - this.activeTimeStart) / 1000;
            this.totalActiveTime += questionTime;
            
            // Calculate XP (bonus for first attempt)
            const xp = this.currentAttempts === 1 ? 10 : 5;
            this.sessionXP += xp;
            Progress.addXP(xp);
            
            // Visual feedback
            button.classList.add('correct');
            
            // Show brief success message
            document.getElementById('hint-area').innerHTML = 
                `<div class="hint-text">+${xp} XP</div>`;
            
            // Update review system
            if (question.isReview) {
                Review.recordSuccess(question.answer, this.config.type);
            }
            
            // Record result
            const wasFirstAttempt = this.currentAttempts === 1;
            this.results.push({
                word: question.answer,
                correct: true,
                firstAttempt: wasFirstAttempt,
                attempts: this.currentAttempts,
                time: questionTime,
                isReview: question.isReview || false
            });
            
            // If they needed multiple attempts, add to review
            if (!wasFirstAttempt && !question.isReview) {
                Review.addWord(question.answer, this.config.type, this.config.difficulty);
            }
            
            // Auto-advance after brief delay
            setTimeout(() => {
                this.nextQuestion();
            }, 800);
            
        } else {
            // Wrong answer - eliminate it
            button.classList.add('incorrect');
            
            setTimeout(() => {
                button.classList.remove('incorrect');
                button.classList.add('eliminated');
            }, 400);
            
            // Check remaining options
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                // Record as failed and add to review
                const questionTime = (Date.now() - this.activeTimeStart) / 1000;
                this.totalActiveTime += questionTime;
                
                this.results.push({
                    word: question.answer,
                    correct: false,
                    firstAttempt: false,
                    attempts: this.currentAttempts,
                    time: questionTime,
                    isReview: question.isReview || false
                });
                
                // Add to review for future practice
                Review.addWord(question.answer, this.config.type, this.config.difficulty);
                
                setTimeout(() => this.nextQuestion(), 1000);
            }
        }
    },
    
    nextQuestion() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.questions.length) {
            this.finish();
        } else {
            this.showQuestion();
        }
    },
    
    finish() {
        const correctCount = this.results.filter(r => r.correct).length;
        const score = Math.round((correctCount / this.questions.length) * 100);
        
        // Record session in progress
        Progress.recordSession(
            this.config.type,
            this.config.difficulty,
            score,
            this.totalActiveTime
        );
        
        // Generate and store report
        const report = Reports.createSessionReport({
            type: this.config.type,
            difficulty: this.config.difficulty,
            results: this.results,
            score: score,
            xpEarned: this.sessionXP,
            activeTime: this.totalActiveTime
        });
        
        // Show results
        this.displayResults(report);
    },
    
    displayResults(report) {
        document.getElementById('report-score').textContent = `${report.score}%`;
        document.getElementById('stat-correct').textContent = 
            `${report.correctCount}/${report.totalQuestions}`;
        document.getElementById('stat-time').textContent = report.formattedTime;
        document.getElementById('stat-xp').textContent = `+${report.xpEarned}`;
        
        // Message based on score
        let message = '';
        if (report.score >= 90) message = 'Outstanding! 🌟';
        else if (report.score >= 80) message = 'Great work! Keep it up! 💪';
        else if (report.score >= 60) message = 'Good effort! 📚';
        else message = 'Keep practicing! 🌱';
        document.getElementById('report-message').textContent = message;
        
        // Words to review
        const detailsArea = document.getElementById('report-details');
        if (report.wordsToReview.length > 0) {
            detailsArea.innerHTML = `
                <h4>Words to Review</h4>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem;">
                    These will appear in future sessions for extra practice
                </p>
                <div class="words-to-review">
                    ${report.wordsToReview.map(w => `<span class="word-tag">${w}</span>`).join('')}
                </div>
            `;
            detailsArea.style.display = 'block';
        } else {
            detailsArea.style.display = 'none';
        }
        
        app.showView('report');
    },
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};
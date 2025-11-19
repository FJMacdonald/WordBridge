const ExerciseEngine = {
    type: null,
    questions: [],
    usedIndices: new Set(),
    correct: 0,
    total: 0,
    startTime: null,
    currentQuestion: null,
    turnCount: 0,
    justShowedCustom: false,
    
    init(type) {
        this.type = type;
        this.questions = ExerciseData[type];
        this.usedIndices = new Set();
        this.correct = 0;
        this.total = 0;
        this.startTime = Date.now();
        this.currentQuestion = null;
        this.turnCount = 0;
        this.justShowedCustom = false;
        WordTracking.init();
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getRandomQuestion() {
        this.turnCount++;
        
        // First turn always shows custom if available
        const customQuestions = this.questions.filter(q => q.isCustom);
        if (this.turnCount === 1 && customQuestions.length > 0) {
            this.justShowedCustom = true;
            return customQuestions[Math.floor(Math.random() * customQuestions.length)];
        }
        
        // Check custom frequency setting
        const customFrequency = Settings.get('customFrequency') || 0.4;
        const shouldShowCustom = !this.justShowedCustom && 
                                Math.random() < customFrequency && 
                                customQuestions.length > 0;
        
        if (shouldShowCustom) {
            // Filter out mastered custom words
            const masteredWords = Object.keys(WordTracking.getMasteredWords());
            const availableCustom = customQuestions.filter(q => !masteredWords.includes(q.answer));
            
            if (availableCustom.length > 0) {
                this.justShowedCustom = true;
                return availableCustom[Math.floor(Math.random() * availableCustom.length)];
            }
        }
        
        this.justShowedCustom = false;
        
        // Prioritize problem words
        const problemWords = WordTracking.getProblemWords();
        const problemWordsList = Object.keys(problemWords);
        
        if (problemWordsList.length > 0 && Math.random() < 0.3) {
            const word = problemWordsList[Math.floor(Math.random() * problemWordsList.length)];
            const question = this.questions.find(q => q.answer === word);
            if (question) return question;
        }
        
        // Filter out mastered words unless we've used all others
        const masteredWords = Object.keys(WordTracking.getMasteredWords());
        const availableQuestions = this.questions.filter(q => 
            !masteredWords.includes(q.answer) && !this.usedIndices.has(this.questions.indexOf(q))
        );
        
        if (availableQuestions.length === 0) {
            // Reset if all non-mastered questions used
            this.usedIndices.clear();
            
            // Still try to avoid mastered words
            const nonMastered = this.questions.filter(q => !masteredWords.includes(q.answer));
            if (nonMastered.length > 0) {
                return nonMastered[Math.floor(Math.random() * nonMastered.length)];
            }
            
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.usedIndices.add(this.questions.indexOf(question));
        return question;
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getRandomQuestion();
        
        // Update progress display
        document.getElementById('exercise-progress').textContent = 
            `${this.correct} correct`;
        
        // Render prompt
        const promptArea = document.getElementById('prompt-area');
        promptArea.innerHTML = this.renderPrompt(this.currentQuestion);
        
        // Render answers
        const answerArea = document.getElementById('answer-area');
        const shuffledOptions = this.shuffle([...this.currentQuestion.options]);
        
        answerArea.innerHTML = `
            <div class="answer-grid">
                ${shuffledOptions.map(opt => `
                    <button class="answer-btn" onclick="ExerciseEngine.checkAnswer('${this.escapeQuotes(opt)}', this)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Clear hint area
        document.getElementById('hint-area').innerHTML = '';
    },
    
    escapeQuotes(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    },
    
    renderPrompt(question) {
        switch (this.type) {
            case 'naming':
                if (question.emoji) {
                    return `
                        <div class="prompt-emoji">${question.emoji}</div>
                        <div class="prompt-instruction">What is this?</div>
                    `;
                } else if (question.image) {
                    return `
                        <img src="${question.image}" alt="Identify this" class="prompt-image" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div class="prompt-text" style="display:none;">Image not found</div>
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
                `;
        }
        return '';
    },
    
    checkAnswer(selected, button) {
        const correct = selected.toLowerCase() === this.currentQuestion.answer.toLowerCase();
        this.total++;
        
        // Track the answer
        WordTracking.trackAnswer(this.currentQuestion.answer, correct, this.type);
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            
            // Show brief feedback
            document.getElementById('hint-area').innerHTML = 
                `<div class="hint-text">✓ Correct!</div>`;
            
            // Auto-advance
            setTimeout(() => {
                this.showNextQuestion();
            }, 800);
            
        } else {
            button.classList.add('incorrect');
            
            setTimeout(() => {
                button.classList.add('eliminated');
            }, 400);
            
            // Check if only correct answer remains
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                // Show the answer and move on
                document.getElementById('hint-area').innerHTML = 
                    `<div class="hint-text" style="color: var(--warning);">The answer was: ${this.currentQuestion.answer}</div>`;
                
                setTimeout(() => {
                    this.showNextQuestion();
                }, 1500);
            }
        }
    },
    
    getResults() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.round(elapsed % 60);
        
        return {
            correct: this.correct,
            total: this.total,
            time: `${mins}:${secs.toString().padStart(2, '0')}`,
            accuracy: this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0,
            type: this.type,
            duration: elapsed
        };
    },
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};
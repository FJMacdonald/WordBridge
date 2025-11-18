const ExerciseEngine = {
    type: null,
    questions: [],
    usedIndices: new Set(),
    correct: 0,
    total: 0,
    startTime: null,
    currentQuestion: null,
    
    init(type) {
        this.type = type;
        this.questions = ExerciseData[type];
        this.usedIndices = new Set();
        this.correct = 0;
        this.total = 0;
        this.startTime = Date.now();
        this.currentQuestion = null;
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getRandomQuestion() {
        // If we've used all questions, reset
        if (this.usedIndices.size >= this.questions.length) {
            this.usedIndices.clear();
        }
        
        // Find an unused question
        let index;
        do {
            index = Math.floor(Math.random() * this.questions.length);
        } while (this.usedIndices.has(index));
        
        this.usedIndices.add(index);
        return this.questions[index];
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
                    <button class="answer-btn" onclick="ExerciseEngine.checkAnswer('${opt.replace(/'/g, "\\'")}', this)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Clear hint area
        document.getElementById('hint-area').innerHTML = '';
    },
    
    renderPrompt(question) {
        switch (this.type) {
            case 'naming':
                if (question.type === 'emoji') {
                    return `
                        <div class="prompt-emoji">${question.emoji}</div>
                        <div class="prompt-instruction">What is this?</div>
                    `;
                } else {
                    return `
                        <img src="${question.image}" alt="Identify this" class="prompt-image">
                        <div class="prompt-instruction">What is this?</div>
                    `;
                }
                
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
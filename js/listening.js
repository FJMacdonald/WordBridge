// js/listeningEngine.js
const ListeningEngine = {
    questions: [],
    currentQuestion: null,
    currentOptions: [],
    correct: 0,
    total: 0,
    hintsUsed: 0,
    startTime: null,
    
    init() {
        // Use naming exercises that have visuals
        this.questions = (ExerciseData.naming || []).filter(q => q.emoji || q.imageUrl || q.localImageId);
        this.correct = 0;
        this.total = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        const masteredWords = Object.keys(WordTracking.getMasteredWords());
        const available = this.questions.filter(q => !masteredWords.includes(q.answer));
        
        if (available.length === 0) {
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        // Get a random question
        const question = available[Math.floor(Math.random() * available.length)];
        
        // Get 3 random wrong options (different images)
        const wrongOptions = this.questions
            .filter(q => q.answer !== question.answer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        return { question, wrongOptions };
    },
    
    async showNextQuestion() {
        const { question, wrongOptions } = this.getNextQuestion();
        this.currentQuestion = question;
        
        // Create options with the correct answer and wrong ones
        this.currentOptions = this.shuffle([question, ...wrongOptions]);
        
        document.getElementById('listening-progress').textContent = `${this.correct} correct`;
        
        // Render prompt (just instructions)
        const promptArea = document.getElementById('listening-prompt-area');
        promptArea.innerHTML = `
            <div class="listening-instruction">Listen to the word, then tap the picture</div>
            <button class="play-word-btn" onclick="ListeningEngine.playWord()">
                🔊 Play Word
            </button>
        `;
        
        // Render picture options
        const answerArea = document.getElementById('listening-answer-area');
        answerArea.innerHTML = await this.renderPictureOptions();
        
        // Clear feedback
        document.getElementById('listening-feedback').innerHTML = `
            <button class="btn-secondary hint-btn" onclick="ListeningEngine.eliminateOption()">
                ❌ Remove One
            </button>
        `;
        
        // Auto-play the word
        setTimeout(() => this.playWord(), 500);
    },
    
    async renderPictureOptions() {
        let html = '<div class="picture-grid">';
        
        for (const option of this.currentOptions) {
            let imageContent = '';
            
            if (option.emoji) {
                imageContent = `<span class="option-emoji">${option.emoji}</span>`;
            } else if (option.localImageId) {
                try {
                    const imageData = await ImageStorage.getImage(option.localImageId);
                    if (imageData) {
                        imageContent = `<img src="${imageData}" alt="Option">`;
                    }
                } catch (e) {
                    imageContent = `<span class="option-emoji">🖼️</span>`;
                }
            } else if (option.imageUrl) {
                imageContent = `<img src="${option.imageUrl}" alt="Option">`;
            }
            
            html += `
                <button class="picture-option" data-answer="${option.answer}" 
                        onclick="ListeningEngine.checkAnswer('${option.answer}', this)">
                    ${imageContent}
                </button>
            `;
        }
        
        html += '</div>';
        return html;
    },
    
    playWord() {
        AudioHelper.speakWord(this.currentQuestion.answer);
    },
    
    eliminateOption() {
        // Find a wrong option that hasn't been eliminated
        const options = document.querySelectorAll('.picture-option:not(.eliminated):not([data-answer="' + this.currentQuestion.answer + '"])');
        
        if (options.length > 0) {
            this.hintsUsed++;
            const randomWrong = options[Math.floor(Math.random() * options.length)];
            randomWrong.classList.add('eliminated');
        }
    },
    
    checkAnswer(answer, button) {
        AudioHelper.stop();
        const correct = answer === this.currentQuestion.answer;
        this.total++;
        
        WordTracking.trackAnswer(this.currentQuestion.answer, correct, 'listening');
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            
            document.getElementById('listening-feedback').innerHTML = 
                `<div class="feedback-text correct">✓ Correct! "${this.currentQuestion.answer}"</div>`;
            
            setTimeout(() => this.showNextQuestion(), 1000);
        } else {
            button.classList.add('incorrect');
            button.classList.add('eliminated');
            
            // Check if only one remains
            const remaining = document.querySelectorAll('.picture-option:not(.eliminated)');
            if (remaining.length <= 1) {
                document.getElementById('listening-feedback').innerHTML = 
                    `<div class="feedback-text incorrect">The word was: "${this.currentQuestion.answer}"</div>`;
                
                setTimeout(() => this.showNextQuestion(), 1500);
            }
        }
    },
    
    skip() {
        WordTracking.trackSkip(this.currentQuestion.answer, 'listening');
        this.showNextQuestion();
    },
    
    getResults() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.round(elapsed % 60);
        
        return {
            correct: this.correct,
            total: this.total,
            hintsUsed: this.hintsUsed,
            time: `${mins}:${secs.toString().padStart(2, '0')}`,
            accuracy: this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0,
            type: 'listening',
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
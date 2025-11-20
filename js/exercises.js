const ExerciseEngine = {
    type: null,
    questions: [],
    usedIndices: new Set(),
    correct: 0,
    total: 0,
    startTime: null,
    currentQuestion: null,
    currentOptions: null,
    turnCount: 0,
    justShowedCustom: false,
    skipped: 0,
    hintsUsed: 0,
    
    init(type) {
        this.type = type;
        this.questions = ExerciseData[type] || [];
        this.usedIndices = new Set();
        this.correct = 0;
        this.total = 0;
        this.skipped = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        this.currentQuestion = null;
        this.currentOptions = null;
        this.turnCount = 0;
        this.justShowedCustom = false;
        WordTracking.init();
    },
    
    eliminateOption() {
        // Find wrong options that aren't eliminated
        const wrongOptions = document.querySelectorAll('.answer-btn:not(.eliminated):not(.correct)');
        const wrongAnswers = Array.from(wrongOptions).filter(btn => 
            btn.textContent.trim().toLowerCase() !== this.currentQuestion.answer.toLowerCase()
        );
        
        if (wrongAnswers.length > 0) {
            this.hintsUsed++;
            const randomWrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
            randomWrong.classList.add('eliminated');
            randomWrong.disabled = true;
            
            // Track hint usage for this word
            WordTracking.trackHintUsed(this.currentQuestion.answer, this.type);
        }
    },
    
    async showNextQuestion() {
        this.currentQuestion = this.getRandomQuestion();
        
        document.getElementById('exercise-progress').textContent = 
            `${this.correct} correct`;
        
        const promptArea = document.getElementById('prompt-area');
        promptArea.innerHTML = await this.renderPrompt(this.currentQuestion);
        
        this.currentOptions = this.shuffle([...this.currentQuestion.options]);
        
        const answerArea = document.getElementById('answer-area');
        answerArea.innerHTML = `
            <div class="answer-grid">
                ${this.currentOptions.map(opt => `
                    <button class="answer-btn" onclick="ExerciseEngine.checkAnswer('${this.escapeQuotes(opt)}', this)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Updated hint area with eliminate button
        document.getElementById('hint-area').innerHTML = `
            <div class="hint-buttons">
                <button class="audio-help-btn" onclick="ExerciseEngine.playAudio()">
                    🔊 Hear It
                </button>
                <button class="eliminate-btn" onclick="ExerciseEngine.eliminateOption()">
                    ❌ Remove One
                </button>
            </div>
        `;
        
        if (Settings.get('autoPlayAudio')) {
            setTimeout(() => this.playAudio(), 300);
        }
    },
    
    getResults() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const mins = Math.floor(elapsed / 60);
        const secs = Math.round(elapsed % 60);
        
        return {
            correct: this.correct,
            total: this.total,
            skipped: this.skipped,
            hintsUsed: this.hintsUsed,
            time: `${mins}:${secs.toString().padStart(2, '0')}`,
            accuracy: this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0,
            type: this.type,
            duration: elapsed
        };
    },
   
    skip() {
        this.skipped++;
        WordTracking.trackSkip(this.currentQuestion.answer, this.type);
        AudioHelper.stop();
        this.showNextQuestion();
    },
        
    start() {
        this.showNextQuestion();
    },
    
    getRandomQuestion() {
        this.turnCount++;
        
        const customQuestions = this.questions.filter(q => q.isCustom);
        if (this.turnCount === 1 && customQuestions.length > 0) {
            this.justShowedCustom = true;
            return customQuestions[Math.floor(Math.random() * customQuestions.length)];
        }
        
        const customFrequency = Settings.get('customFrequency') || 0.4;
        const shouldShowCustom = !this.justShowedCustom && 
                                Math.random() < customFrequency && 
                                customQuestions.length > 0;
        
        if (shouldShowCustom) {
            const masteredWords = Object.keys(WordTracking.getMasteredWords());
            const availableCustom = customQuestions.filter(q => !masteredWords.includes(q.answer));
            
            if (availableCustom.length > 0) {
                this.justShowedCustom = true;
                return availableCustom[Math.floor(Math.random() * availableCustom.length)];
            }
        }
        
        this.justShowedCustom = false;
        
        const problemWords = WordTracking.getProblemWords();
        const problemWordsList = Object.keys(problemWords);
        
        if (problemWordsList.length > 0 && Math.random() < 0.3) {
            const word = problemWordsList[Math.floor(Math.random() * problemWordsList.length)];
            const question = this.questions.find(q => q.answer === word);
            if (question) return question;
        }
        
        const masteredWords = Object.keys(WordTracking.getMasteredWords());
        const availableQuestions = this.questions.filter(q => 
            !masteredWords.includes(q.answer) && !this.usedIndices.has(this.questions.indexOf(q))
        );
        
        if (availableQuestions.length === 0) {
            this.usedIndices.clear();
            
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
        
    async playAudio() {
        await AudioHelper.speakExercise(this.type, this.currentQuestion, this.currentOptions);
    },

    async renderPrompt(question) {
        switch (this.type) {
            case 'naming':
                if (question.emoji) {
                    return `
                        <div class="prompt-emoji">${question.emoji}</div>
                        <div class="prompt-instruction">What is this?</div>
                    `;
                } else if (question.localImageId) {
                    try {
                        const imageData = await ImageStorage.getImage(question.localImageId);
                        if (imageData) {
                            return `
                                <img src="${imageData}" alt="Identify this" class="prompt-image">
                                <div class="prompt-instruction">What is this?</div>
                            `;
                        }
                    } catch (e) {
                        console.error('Failed to load local image:', e);
                    }
                    return `
                        <div class="prompt-text">Image not available</div>
                        <div class="prompt-instruction">What is this?</div>
                    `;
                } else if (question.imageUrl) {
                    return `
                        <img src="${question.imageUrl}" alt="Identify this" class="prompt-image" 
                            onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div class="prompt-text" style="display:none;">Image not found</div>
                        <div class="prompt-instruction">What is this?</div>
                    `;
                }
                break;
                
            case 'categories':
                return `
                    <div class="prompt-text prompt-question">${question.prompt}</div>
                `;
                
            case 'sentences':
                // Display the sentence with visual blank
                const displayPrompt = question.prompt.replace(/_{2,}/g, '<span class="blank-indicator">______</span>');
                return `
                    <div class="prompt-text prompt-sentence">${displayPrompt}</div>
                `;
        }
        return '';
    },
    
    escapeQuotes(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    },
    
    checkAnswer(selected, button) {
        AudioHelper.stop();
        
        const correct = selected.toLowerCase() === this.currentQuestion.answer.toLowerCase();
        this.total++;
        
        WordTracking.trackAnswer(this.currentQuestion.answer, correct, this.type);
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            
            document.getElementById('hint-area').innerHTML = 
                `<div class="feedback-text correct">✓ Correct!</div>`;
            
            setTimeout(() => {
                this.showNextQuestion();
            }, 800);
            
        } else {
            button.classList.add('incorrect');
            
            setTimeout(() => {
                button.classList.add('eliminated');
            }, 400);
            
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                document.getElementById('hint-area').innerHTML = `
                    <div class="feedback-text incorrect">
                        The answer is: <strong>${this.currentQuestion.answer}</strong>
                        <button class="audio-btn-small" onclick="AudioHelper.speakWord('${this.currentQuestion.answer}')">🔊</button>
                    </div>
                `;
                
                setTimeout(() => {
                    this.showNextQuestion();
                }, 1500);
            }
        }
    },
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    async playAudio() {
        await AudioHelper.speakExercise(this.type, this.currentQuestion);
    },
};
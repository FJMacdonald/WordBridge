// js/sentenceTyping.js 
const SentenceTypingEngine = {
    questions: [],
    currentQuestion: null,
    currentLetterIndex: 0,
    wrongLetters: 0,
    hintsUsed: 0,
    correct: 0,
    total: 0,
    startTime: null,
    targetWord: '',
    
    init() {
        this.questions = ExerciseData.sentences || [];
        this.currentLetterIndex = 0;
        this.wrongLetters = 0;
        this.hintsUsed = 0;
        this.correct = 0;
        this.total = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    start() {
        this.showNextQuestion();
        this.setupKeyboardListener();
    },
    
    setupKeyboardListener() {
        document.removeEventListener('keydown', this.boundKeyHandler);
        
        this.boundKeyHandler = (e) => {
            if (app.currentView !== 'sentence-typing') return;
            
            const key = e.key.toLowerCase();
            if (key.length === 1 && key.match(/[a-z]/)) {
                this.checkLetter(key);
            }
        };
        
        document.addEventListener('keydown', this.boundKeyHandler);
    },
    
    getNextQuestion() {
        const masteredWords = Object.keys(WordTracking.getMasteredWords());
        const available = this.questions.filter(q => !masteredWords.includes(q.answer));
        
        if (available.length === 0) {
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        return available[Math.floor(Math.random() * available.length)];
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        this.targetWord = this.currentQuestion.answer.toLowerCase();
        this.currentLetterIndex = 0;
        this.wrongLetters = 0;
        
        document.getElementById('sentence-typing-progress').textContent = `${this.correct} correct`;
        
        // Render the sentence with blank
        const promptArea = document.getElementById('sentence-typing-prompt');
        const sentenceParts = this.currentQuestion.prompt.split(/_{2,}/);
        
        promptArea.innerHTML = `
            <div class="sentence-with-blank">
                <span class="sentence-part">${sentenceParts[0] || ''}</span>
                <span class="typing-blank" id="typing-blank">${this.renderLetterBoxes()}</span>
                <span class="sentence-part">${sentenceParts[1] || ''}</span>
            </div>
        `;
        
        // Input and controls
        const inputArea = document.getElementById('sentence-typing-input');
        inputArea.innerHTML = `
            <div class="mobile-input-wrapper">
                <input type="text" 
                       id="sentence-mobile-input" 
                       class="mobile-input" 
                       autocomplete="off" 
                       autocapitalize="off"
                       placeholder="Type the missing word"
                       oninput="SentenceTypingEngine.handleMobileInput(event)">
            </div>
            <div class="typing-actions">
                <button class="btn-secondary hint-btn" onclick="SentenceTypingEngine.showHint()">
                    💡 Show Letter
                </button>
                <button class="btn-secondary" onclick="SentenceTypingEngine.skip()">
                    Skip →
                </button>
            </div>
        `;
        
        document.getElementById('sentence-typing-feedback').innerHTML = '';
        
        // Focus input on mobile
        setTimeout(() => {
            const input = document.getElementById('sentence-mobile-input');
            if (input) input.focus();
        }, 100);
    },
    
    renderLetterBoxes() {
        return this.targetWord.split('').map((letter, index) => {
            const filled = index < this.currentLetterIndex;
            const content = filled ? letter.toUpperCase() : '_';
            const className = filled ? 'letter-box inline correct' : 'letter-box inline';
            return `<span class="${className}" id="sentence-letter-${index}">${content}</span>`;
        }).join('');
    },
    
    updateLetterBoxes() {
        const blankArea = document.getElementById('typing-blank');
        if (blankArea) {
            blankArea.innerHTML = this.renderLetterBoxes();
        }
    },
    
    checkLetter(letter) {
        const expectedLetter = this.targetWord[this.currentLetterIndex];
        
        if (letter === expectedLetter) {
            this.currentLetterIndex++;
            this.updateLetterBoxes();
            
            if (this.currentLetterIndex >= this.targetWord.length) {
                this.wordComplete(true);
            }
        } else {
            this.wrongLetters++;
            
            const currentBox = document.getElementById(`sentence-letter-${this.currentLetterIndex}`);
            if (currentBox) {
                currentBox.classList.add('shake');
                setTimeout(() => currentBox.classList.remove('shake'), 300);
            }
        }
    },
    
    handleMobileInput(event) {
        const input = event.target;
        const lastChar = input.value.slice(-1).toLowerCase();
        
        if (lastChar.match(/[a-z]/)) {
            this.checkLetter(lastChar);
        }
        
        input.value = '';
    },
    
    showHint() {
        if (this.currentLetterIndex >= this.targetWord.length) return;
        
        this.hintsUsed++;
        this.currentLetterIndex++;
        this.updateLetterBoxes();
        
        // Mark as hint
        const box = document.getElementById(`sentence-letter-${this.currentLetterIndex - 1}`);
        if (box) {
            box.classList.remove('correct');
            box.classList.add('hint');
        }
        
        if (this.currentLetterIndex >= this.targetWord.length) {
            this.wordComplete(false);
        }
    },
    
    wordComplete(unassisted) {
        this.total++;
        
        const feedback = document.getElementById('sentence-typing-feedback');
        
        if (unassisted && this.wrongLetters === 0) {
            this.correct++;
            WordTracking.trackAnswer(this.targetWord, true, 'sentence-typing');
            feedback.innerHTML = `<div class="feedback-text correct">✓ Perfect!</div>`;
        } else if (unassisted) {
            WordTracking.trackAnswer(this.targetWord, true, 'sentence-typing');
            feedback.innerHTML = `<div class="feedback-text partial">✓ Got it! (${this.wrongLetters} mistakes)</div>`;
        } else {
            WordTracking.trackAnswer(this.targetWord, false, 'sentence-typing');
            feedback.innerHTML = `<div class="feedback-text hint-used">Completed with hints</div>`;
        }
        
        setTimeout(() => this.showNextQuestion(), 1200);
    },
    
    skip() {
        WordTracking.trackSkip(this.targetWord, 'sentence-typing');
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
            type: 'sentence-typing',
            duration: elapsed
        };
    },
    
    cleanup() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }
};
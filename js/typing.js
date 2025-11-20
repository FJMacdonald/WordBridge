// js/typingEngine.js
const TypingEngine = {
    questions: [],
    currentQuestion: null,
    currentLevel: 1, // 1 = copy, 2 = first letter only, 3 = no help
    currentLetterIndex: 0,
    wrongLetters: 0,
    hintsUsed: 0,
    correct: 0,
    total: 0,
    startTime: null,
    
    init(level = 1) {
        // Reuse naming exercises that have images
        this.questions = (ExerciseData.naming || []).filter(q => q.emoji || q.imageUrl || q.localImageId);
        this.currentLevel = level;
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
        // Remove any existing listener
        document.removeEventListener('keydown', this.handleKeyPress);
        
        this.handleKeyPress = (e) => {
            if (app.currentView !== 'typing') return;
            
            const key = e.key.toLowerCase();
            
            // Only handle letters
            if (key.length === 1 && key.match(/[a-z]/)) {
                this.checkLetter(key);
            }
        };
        
        document.addEventListener('keydown', this.handleKeyPress);
    },
    
    getNextQuestion() {
        const masteredWords = Object.keys(WordTracking.getMasteredWords());
        const available = this.questions.filter(q => !masteredWords.includes(q.answer));
        
        if (available.length === 0) {
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        return available[Math.floor(Math.random() * available.length)];
    },
    
    async showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        this.currentLetterIndex = 0;
        
        document.getElementById('typing-progress').textContent = `${this.correct} correct`;
        
        const promptArea = document.getElementById('typing-prompt-area');
        promptArea.innerHTML = await this.renderPrompt(this.currentQuestion);
        
        const inputArea = document.getElementById('typing-input-area');
        inputArea.innerHTML = this.renderLetterBoxes();
        
        // Clear feedback
        document.getElementById('typing-feedback').innerHTML = '';
        
        // Show/hide word based on level
        this.updateWordDisplay();
    },
    
    async renderPrompt(question) {
        let imageHTML = '';
        
        if (question.emoji) {
            imageHTML = `<div class="prompt-emoji">${question.emoji}</div>`;
        } else if (question.localImageId) {
            try {
                const imageData = await ImageStorage.getImage(question.localImageId);
                if (imageData) {
                    imageHTML = `<img src="${imageData}" alt="Type this word" class="prompt-image">`;
                }
            } catch (e) {
                imageHTML = `<div class="prompt-emoji">🖼️</div>`;
            }
        } else if (question.imageUrl) {
            imageHTML = `<img src="${question.imageUrl}" alt="Type this word" class="prompt-image">`;
        }
        
        return `
            ${imageHTML}
            <div class="typing-word-display" id="word-display"></div>
        `;
    },
    
    renderLetterBoxes() {
        const word = this.currentQuestion.answer;
        const boxes = word.split('').map((letter, index) => {
            return `<span class="letter-box" id="letter-${index}">${index < this.currentLetterIndex ? letter.toUpperCase() : '_'}</span>`;
        }).join('');
        
        return `
            <div class="letter-boxes">${boxes}</div>
            <div class="keyboard-hint">Type the letters on your keyboard</div>
            <div class="mobile-input-wrapper">
                <input type="text" 
                       id="mobile-input" 
                       class="mobile-input" 
                       autocomplete="off" 
                       autocapitalize="off"
                       placeholder="Tap here to type"
                       oninput="TypingEngine.handleMobileInput(event)">
            </div>
            <div class="typing-actions">
                <button class="btn-secondary hint-btn" onclick="TypingEngine.showHint()">
                    💡 Show Letter
                </button>
                <button class="btn-secondary skip-btn" onclick="TypingEngine.skip()">
                    Skip →
                </button>
            </div>
        `;
    },
    
    updateWordDisplay() {
        const display = document.getElementById('word-display');
        const word = this.currentQuestion.answer;
        
        switch (this.currentLevel) {
            case 1: // Full word shown
                display.innerHTML = `<span class="helper-word">${word.toUpperCase()}</span>`;
                break;
            case 2: // First letter only
                display.innerHTML = `<span class="helper-word">${word[0].toUpperCase()}${'_'.repeat(word.length - 1)}</span>`;
                break;
            case 3: // No help
                display.innerHTML = `<span class="helper-word level-3">Type the word</span>`;
                break;
        }
    },
    
    checkLetter(letter) {
        const word = this.currentQuestion.answer;
        const expectedLetter = word[this.currentLetterIndex].toLowerCase();
        
        const currentBox = document.getElementById(`letter-${this.currentLetterIndex}`);
        
        if (letter === expectedLetter) {
            // Correct!
            currentBox.textContent = letter.toUpperCase();
            currentBox.classList.add('correct');
            this.currentLetterIndex++;
            
            // Check if word complete
            if (this.currentLetterIndex >= word.length) {
                this.wordComplete(true);
            }
        } else {
            // Wrong letter
            this.wrongLetters++;
            currentBox.classList.add('shake');
            setTimeout(() => currentBox.classList.remove('shake'), 300);
            
            // Track wrong attempt
            WordTracking.trackAnswer(word, false, 'typing');
        }
    },
    
    handleMobileInput(event) {
        const input = event.target;
        const lastChar = input.value.slice(-1).toLowerCase();
        
        if (lastChar.match(/[a-z]/)) {
            this.checkLetter(lastChar);
        }
        
        // Clear input after processing
        input.value = '';
    },
    
    showHint() {
        const word = this.currentQuestion.answer;
        if (this.currentLetterIndex >= word.length) return;
        
        this.hintsUsed++;
        
        // Show the current letter
        const currentBox = document.getElementById(`letter-${this.currentLetterIndex}`);
        currentBox.textContent = word[this.currentLetterIndex].toUpperCase();
        currentBox.classList.add('hint');
        this.currentLetterIndex++;
        
        if (this.currentLetterIndex >= word.length) {
            this.wordComplete(false);
        }
    },
    
    wordComplete(unassisted) {
        this.total++;
        
        const feedback = document.getElementById('typing-feedback');
        
        if (unassisted && this.wrongLetters === 0) {
            this.correct++;
            WordTracking.trackAnswer(this.currentQuestion.answer, true, 'typing');
            feedback.innerHTML = `<div class="feedback-text correct">✓ Perfect!</div>`;
        } else if (unassisted) {
            WordTracking.trackAnswer(this.currentQuestion.answer, true, 'typing');
            feedback.innerHTML = `<div class="feedback-text partial">✓ Got it! (${this.wrongLetters} mistakes)</div>`;
        } else {
            feedback.innerHTML = `<div class="feedback-text hint-used">Word complete (hint used)</div>`;
        }
        
        // Reset for next word
        this.wrongLetters = 0;
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 1200);
    },
    
    skip() {
        WordTracking.trackSkip(this.currentQuestion.answer, 'typing');
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
            type: 'typing',
            level: this.currentLevel,
            duration: elapsed
        };
    },
    
    cleanup() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
};
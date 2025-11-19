const SpeakEngine = {
    questions: [],
    usedIndices: new Set(),
    correct: 0,
    total: 0,
    startTime: null,
    currentQuestion: null,
    currentHintIndex: 0,
    
    init() {
        this.questions = ExerciseData.speak;
        this.usedIndices = new Set();
        this.correct = 0;
        this.total = 0;
        this.startTime = Date.now();
        this.currentQuestion = null;
        this.currentHintIndex = 0;
        WordTracking.init();
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        // Prioritize problem words
        const problemWords = WordTracking.getProblemWords();
        const problemWordsList = Object.keys(problemWords);
        
        if (problemWordsList.length > 0 && Math.random() < 0.3) {
            // 30% chance to show a problem word
            const word = problemWordsList[Math.floor(Math.random() * problemWordsList.length)];
            const question = this.questions.find(q => q.answer === word);
            if (question) return question;
        }
        
        // Filter out mastered words
        const masteredWords = Object.keys(WordTracking.getMasteredWords());
        const availableQuestions = this.questions.filter(q => 
            !masteredWords.includes(q.answer) && !this.usedIndices.has(this.questions.indexOf(q))
        );
        
        if (availableQuestions.length === 0) {
            this.usedIndices.clear();
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.usedIndices.add(this.questions.indexOf(question));
        
        return question;
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        this.currentHintIndex = 0;
        
        document.getElementById('speak-progress').textContent = 
            `${this.correct} correct`;
        
        // Show image/emoji
        const promptArea = document.getElementById('speak-prompt-area');
        if (this.currentQuestion.emoji) {
            promptArea.innerHTML = `
                <div class="prompt-emoji">${this.currentQuestion.emoji}</div>
                <div class="prompt-instruction">What is this?</div>
            `;
        } else {
            promptArea.innerHTML = `
                <div class="prompt-emoji">${this.currentQuestion.image || '🖼️'}</div>
                <div class="prompt-instruction">What is this?</div>
            `;
        }
        
        // Reset hint display
        document.getElementById('hint-display').innerHTML = '';
        document.getElementById('hint-btn').textContent = '💡 Need a hint';
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('hint-btn').classList.remove('disabled');
    },
    
    getHints() {
        const word = this.currentQuestion.answer;
        const firstLetter = word[0].toUpperCase();
        const blanks = '_'.repeat(word.length - 1);
        const phrases = this.currentQuestion.phrases || [];
        
        return [
            { type: 'letters', text: `${firstLetter} ${blanks}` },
            { type: 'phrase', text: phrases[0] || `Think of something you might say...` },
            { type: 'sound', text: `Starts with "${firstLetter}"` },
            { type: 'word', text: word.toUpperCase().split('').join(' - ') }
        ];
    },
    
    speakWordStart(word) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Speak first 2-3 letters as a blend
            const start = word.substring(0, Math.min(3, Math.ceil(word.length / 2)));
            const utterance = new SpeechSynthesisUtterance(start);
            utterance.rate = 0.3; // Very slow
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }
    },
    
    speakWord(word) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.2; // Even slower than before
            utterance.pitch = 0.9; // Slightly lower pitch
            utterance.volume = 1.0;
            
            // Add pauses between syllables for longer words
            if (word.length > 6) {
                const syllables = this.estimateSyllables(word);
                utterance.rate = 0.15; // Extra slow for long words
            }
            
            window.speechSynthesis.speak(utterance);
        }
    },
    
    estimateSyllables(word) {
        // Simple syllable estimation
        return word.toLowerCase().replace(/[^aeiou]/g, '').length || 1;
    },
    
    showNextHint() {
        const hints = this.getHints();
        
        if (this.currentHintIndex >= hints.length) {
            return;
        }
        
        const hint = hints[this.currentHintIndex];
        const hintDisplay = document.getElementById('hint-display');
        const word = this.currentQuestion.answer;
        const firstLetter = word[0].toUpperCase();
        
        let hintHTML = '';
        
        switch (hint.type) {
            case 'letters':
                hintHTML = `<div class="hint-item hint-letters">${hint.text}</div>`;
                break;
                
            case 'phrase':
                const displayPhrase = hint.text.replace(
                    new RegExp(word, 'gi'), 
                    '______'
                );
                hintHTML = `<div class="hint-item hint-phrase">"${displayPhrase}"</div>`;
                break;
                
            case 'sound':
                hintHTML = `
                    <div class="hint-item hint-with-audio">
                        <span>${hint.text}</span>
                        <button class="audio-btn" onclick="SpeakEngine.speakWordStart('${word}')">
                            🔊 Hear Start
                        </button>
                    </div>
                `;
                setTimeout(() => this.speakWordStart(word), 100);
                break;
                
            case 'word':
                hintHTML = `
                    <div class="hint-item hint-with-audio hint-answer">
                        <span>${hint.text}</span>
                        <button class="audio-btn" onclick="SpeakEngine.speakWord('${word}')">
                            🔊 Full Word
                        </button>
                    </div>
                `;
                setTimeout(() => this.speakWord(word), 100);
                break;
        }
        
        hintDisplay.innerHTML += hintHTML;
        this.currentHintIndex++;
        
        // Update button
        const hintBtn = document.getElementById('hint-btn');
        if (this.currentHintIndex >= hints.length) {
            hintBtn.textContent = 'No more hints';
            hintBtn.disabled = true;
            hintBtn.classList.add('disabled');
        } else {
            hintBtn.textContent = 
                `💡 Another hint (${hints.length - this.currentHintIndex} left)`;
        }
    },
    
    markCorrect() {
        this.correct++;
        this.total++;
        
        const word = this.currentQuestion.answer;
        
        // Track the success
        WordTracking.trackAnswer(word, true, 'speak');
        
        // Brief success feedback
        const promptArea = document.getElementById('speak-prompt-area');
        promptArea.innerHTML += `<div class="success-flash">✓ Great job!</div>`;
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 800);
    },
    
    markIncorrect() {
        this.total++;
        
        const word = this.currentQuestion.answer;
        
        // Track the failure
        WordTracking.trackAnswer(word, false, 'speak');
        
        // Show the answer
        const hintDisplay = document.getElementById('hint-display');
        hintDisplay.innerHTML = `
            <div class="hint-answer-reveal">
                <span>The word is: <strong>${word.toUpperCase()}</strong></span>
                <button class="audio-btn" onclick="SpeakEngine.speakWord('${word}')">
                    🔊 Listen
                </button>
            </div>
        `;
        
        setTimeout(() => this.speakWord(word), 100);
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 2500);
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
            type: 'speak',
            duration: elapsed
        };
    }
};
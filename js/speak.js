const SpeakEngine = {
    questions: [],
    usedIndices: new Set(),
    correct: 0,
    total: 0,
    startTime: null,
    currentQuestion: null,
    currentHintIndex: 0,
    reviewQueue: [],
    turnsSinceReview: new Map(),
    difficultWords: new Map(), // Track difficulty
    
    init() {
        this.questions = ExerciseData.speak;
        this.usedIndices = new Set();
        this.correct = 0;
        this.total = 0;
        this.startTime = Date.now();
        this.currentQuestion = null;
        this.currentHintIndex = 0;
        this.reviewQueue = [];
        this.turnsSinceReview = new Map();
        this.loadDifficultWords();
    },
    
    loadDifficultWords() {
        const saved = Storage.get('difficultWords', {});
        this.difficultWords = new Map(Object.entries(saved));
    },
    
    saveDifficultWords() {
        const obj = Object.fromEntries(this.difficultWords);
        Storage.set('difficultWords', obj);
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        const settings = Storage.get('settings', { problemWordFrequency: 3 });
        
        // Check for due difficult words first
        for (const [word, data] of this.difficultWords) {
            if (data.turnsSinceShown >= settings.problemWordFrequency) {
                const question = this.questions.find(q => q.answer === word);
                if (question) {
                    data.turnsSinceShown = 0;
                    this.saveDifficultWords();
                    this.incrementAllTurnCounters();
                    return question;
                }
            }
        }
        
        // Check review queue
        for (let i = 0; i < this.reviewQueue.length; i++) {
            const reviewItem = this.reviewQueue[i];
            const turnsSince = this.turnsSinceReview.get(reviewItem) || 0;
            
            if (turnsSince >= 3) {
                this.reviewQueue.splice(i, 1);
                this.turnsSinceReview.delete(reviewItem);
                this.incrementAllTurnCounters();
                return reviewItem;
            }
        }
        
        // Get new random question (excluding mastered words)
        const masteredWords = Storage.get('masteredWords', []);
        const availableQuestions = this.questions.filter(q => 
            !masteredWords.includes(q.answer) && !this.usedIndices.has(this.questions.indexOf(q))
        );
        
        if (availableQuestions.length === 0) {
            this.usedIndices.clear();
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.usedIndices.add(this.questions.indexOf(question));
        this.incrementAllTurnCounters();
        
        return question;
    },
    
    incrementAllTurnCounters() {
        // Increment review queue counters
        for (const item of this.reviewQueue) {
            const current = this.turnsSinceReview.get(item) || 0;
            this.turnsSinceReview.set(item, current + 1);
        }
        
        // Increment difficult word counters
        for (const [word, data] of this.difficultWords) {
            data.turnsSinceShown++;
        }
        this.saveDifficultWords();
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
                <div class="prompt-emoji-large">${this.currentQuestion.emoji}</div>
                <div class="text-center text-gray-600 mt-4">Say what you see</div>
            `;
        } else {
            promptArea.innerHTML = `
                <img src="${this.currentQuestion.image}" alt="Say this word" class="prompt-image-large">
                <div class="text-center text-gray-600 mt-4">Say what you see</div>
            `;
        }
        
        // Reset hint display
        document.getElementById('hint-display').innerHTML = '';
        document.getElementById('hint-btn').textContent = '💡 Need a hint';
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('hint-btn').classList.remove('disabled');
    },
    
    // Generate hints dynamically based on word
    getHints() {
        const word = this.currentQuestion.answer;
        const firstLetter = word[0].toUpperCase();
        const blanks = '_'.repeat(word.length - 1);
        const phrases = this.currentQuestion.phrases || [];
        
        return [
            { type: 'letters', text: `${firstLetter} ${blanks}` },
            { type: 'phrase', text: phrases[0] || `Think of something you might say...` },
            { type: 'phrase', text: phrases[1] || `It's on the tip of your tongue...` },
            { type: 'sound', text: `Starts with "${firstLetter}"` },
            { type: 'word', text: word.toUpperCase().split('').join(' - ') }
        ];
    },
    
    speakPhoneme(letter) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Map letters to phonetic sounds
            const phonemes = {
                'A': 'ah', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh',
                'F': 'fff', 'G': 'guh', 'H': 'huh', 'I': 'ih', 'J': 'juh',
                'K': 'kuh', 'L': 'lll', 'M': 'mmm', 'N': 'nnn', 'O': 'oh',
                'P': 'puh', 'Q': 'kwuh', 'R': 'rrr', 'S': 'sss', 'T': 'tuh',
                'U': 'uh', 'V': 'vvv', 'W': 'wuh', 'X': 'ks', 'Y': 'yuh', 'Z': 'zzz'
            };
            
            const sound = phonemes[letter.toUpperCase()] || letter;
            const utterance = new SpeechSynthesisUtterance(sound);
            utterance.rate = 0.6;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }
    },
    
    speakWordStart(word) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Speak just the beginning sound of the word
            const start = word.substring(0, 2);
            const utterance = new SpeechSynthesisUtterance(start);
            utterance.rate = 0.4;
            utterance.pitch = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }
    },
    
    speakWord(word) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.3; // Very slow
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }
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
                // Replace the word with a blank in the phrase
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
                        <button class="audio-btn" onclick="SpeakEngine.speakPhoneme('${firstLetter}'); SpeakEngine.speakWordStart('${word}')">
                            🔊
                        </button>
                    </div>
                `;
                setTimeout(() => {
                    this.speakPhoneme(firstLetter);
                    setTimeout(() => this.speakWordStart(word), 600);
                }, 100);
                break;
                
            case 'word':
                hintHTML = `
                    <div class="hint-item hint-with-audio hint-answer">
                        <span>${hint.text}</span>
                        <button class="audio-btn" onclick="SpeakEngine.speakWord('${word}')">
                            🔊
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
        const hintsUsed = this.currentHintIndex;
        
        // Track success for mastery
        this.trackSuccess(word, hintsUsed);
        
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
        
        // Track as difficult
        this.trackDifficulty(word);
        
        // Add to review queue
        this.addToReview(this.currentQuestion);
        
        // Show the answer
        const hintDisplay = document.getElementById('hint-display');
        hintDisplay.innerHTML = `
            <div class="hint-answer-reveal">
                <span>The word is: <strong>${word.toUpperCase()}</strong></span>
                <button class="audio-btn" onclick="SpeakEngine.speakWord('${word}')">
                    🔊
                </button>
            </div>
        `;
        
        setTimeout(() => this.speakWord(word), 100);
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 2500);
    },
    
    trackDifficulty(word) {
        const data = this.difficultWords.get(word) || {
            attempts: 0,
            failures: 0,
            turnsSinceShown: 0
        };
        
        data.attempts++;
        data.failures++;
        data.turnsSinceShown = 0;
        
        this.difficultWords.set(word, data);
        this.saveDifficultWords();
    },
    
    trackSuccess(word, hintsUsed) {
        // Get existing tracking data
        let wordStats = Storage.get('wordStats', {});
        
        if (!wordStats[word]) {
            wordStats[word] = {
                successes: 0,
                attempts: 0,
                consecutiveSuccesses: 0
            };
        }
        
        wordStats[word].successes++;
        wordStats[word].attempts++;
        
        // Only count as "clean" success if minimal hints used
        if (hintsUsed <= 1) {
            wordStats[word].consecutiveSuccesses++;
        } else {
            wordStats[word].consecutiveSuccesses = 0;
        }
        
        // Check for mastery
        const settings = Storage.get('settings', { masteryThreshold: 5 });
        if (wordStats[word].consecutiveSuccesses >= settings.masteryThreshold) {
            this.markAsMastered(word);
        }
        
        Storage.set('wordStats', wordStats);
        
        // Remove from difficult words if doing well
        if (wordStats[word].consecutiveSuccesses >= 2) {
            this.difficultWords.delete(word);
            this.saveDifficultWords();
        }
    },
    
    markAsMastered(word) {
        const mastered = Storage.get('masteredWords', []);
        if (!mastered.includes(word)) {
            mastered.push(word);
            Storage.set('masteredWords', mastered);
        }
    },
    
    addToReview(question) {
        if (!this.reviewQueue.includes(question)) {
            this.reviewQueue.push(question);
            this.turnsSinceReview.set(question, 0);
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
            type: 'speak',
            duration: elapsed
        };
    }
};
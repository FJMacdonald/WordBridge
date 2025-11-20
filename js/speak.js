const SpeakEngine = {
    questions: [],
    usedIndices: new Set(),
    correct: 0,
    total: 0,
    skipped: 0,
    startTime: null,
    currentQuestion: null,
    currentHintIndex: 0,
    turnCount: 0,
    justShowedCustom: false,
    
    init() {
        this.questions = ExerciseData.speak;
        this.usedIndices = new Set();
        this.correct = 0;
        this.total = 0;
        this.skipped = 0;
        this.startTime = Date.now();
        this.currentQuestion = null;
        this.currentHintIndex = 0;
        this.turnCount = 0;
        this.justShowedCustom = false;
        WordTracking.init();
    },
    
    start() {
        this.showNextQuestion();
    },
    
    skip() {
        this.skipped++;
        WordTracking.trackSkip(this.currentQuestion.answer, 'speak');
        this.showNextQuestion();
    },
    
    getNextQuestion() {
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
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.usedIndices.add(this.questions.indexOf(question));
        
        return question;
    },
    
    async showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        this.currentHintIndex = 0;
        
        document.getElementById('speak-progress').textContent = 
            `${this.correct} correct`;
        
        // Render prompt with async image handling
        const promptArea = document.getElementById('speak-prompt-area');
        promptArea.innerHTML = await this.renderPrompt(this.currentQuestion);
        
        // Reset hint display
        document.getElementById('hint-display').innerHTML = '';
        document.getElementById('hint-btn').textContent = '💡 Need a hint';
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('hint-btn').classList.remove('disabled');
    },
    
    async renderPrompt(question) {
        // Handle emoji first
        if (question.emoji) {
            return `
                <div class="prompt-emoji">${question.emoji}</div>
                <div class="prompt-instruction">What is this?</div>
            `;
        }
        
        // Handle local image (uploaded photo)
        if (question.localImageId) {
            try {
                const imageData = await ImageStorage.getImage(question.localImageId);
                if (imageData) {
                    return `
                        <img src="${imageData}" alt="Say this word" class="prompt-image">
                        <div class="prompt-instruction">What is this?</div>
                    `;
                }
            } catch (e) {
                console.error('Failed to load local image:', e);
            }
            // Fallback if image failed
            return `
                <div class="prompt-emoji">🖼️</div>
                <div class="prompt-instruction">What is this?</div>
                <div class="prompt-error">Image could not be loaded</div>
            `;
        }
        
        // Handle URL image (note: lowercase 'l' in imageUrl)
        if (question.imageUrl) {
            return `
                <img src="${question.imageUrl}" alt="Say this word" class="prompt-image"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="prompt-text" style="display:none;">Image not found</div>
                <div class="prompt-instruction">What is this?</div>
            `;
        }
        
        // Fallback
        return `
            <div class="prompt-emoji">🖼️</div>
            <div class="prompt-instruction">What is this?</div>
        `;
    },
    
    getHints() {
        const word = this.currentQuestion.answer;
        const firstLetter = word[0].toUpperCase();
        const blanks = '_'.repeat(word.length - 1);
        const phrases = this.currentQuestion.phrases || [];
        
        return [
            { type: 'letters', text: `${firstLetter} ${blanks}` },
            { type: 'phrase', text: phrases[0] || `Think of something you might say...` },
            { type: 'phrase2', text: phrases[1] || `It's on the tip of your tongue...` },
            { type: 'word', text: word.toUpperCase().split('').join(' - ') }
        ];
    },
    
    speakWord(word) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.2;
            utterance.pitch = 0.9;
            utterance.volume = 1.0;
            
            if (word.length > 6) {
                utterance.rate = 0.15;
            }
            
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
        
        let hintHTML = '';
        
        switch (hint.type) {
            case 'letters':
                hintHTML = `<div class="hint-item hint-letters">${hint.text}</div>`;
                break;
                
            case 'phrase':
            case 'phrase2':
                const displayPhrase = hint.text.replace(
                    new RegExp(word, 'gi'), 
                    '______'
                );
                hintHTML = `<div class="hint-item hint-phrase">"${displayPhrase}"</div>`;
                break;
                
            case 'word':
                hintHTML = `
                    <div class="hint-item hint-with-audio hint-answer">
                        <span>${hint.text}</span>
                        <button class="audio-btn" onclick="SpeakEngine.speakWord('${word}')">
                            🔊 Hear It
                        </button>
                    </div>
                `;
                setTimeout(() => this.speakWord(word), 100);
                break;
        }
        
        hintDisplay.innerHTML += hintHTML;
        this.currentHintIndex++;
        
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
        WordTracking.trackAnswer(word, true, 'speak');
        
        const promptArea = document.getElementById('speak-prompt-area');
        promptArea.innerHTML += `<div class="success-flash">✓ Great job!</div>`;
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 800);
    },
    
    markIncorrect() {
        this.total++;
        
        const word = this.currentQuestion.answer;
        WordTracking.trackAnswer(word, false, 'speak');
        
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
            skipped: this.skipped,
            time: `${mins}:${secs.toString().padStart(2, '0')}`,
            accuracy: this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0,
            type: 'speak',
            duration: elapsed
        };
    }
};

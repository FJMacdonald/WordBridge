// js/speak.js
/**
 * Speak Exercise Engine - Progressive hints with spaced repetition
 */
const SpeakEngine = {
    questions: [],
    usedIndices: new Set(),
    correct: 0,
    total: 0,
    startTime: null,
    currentQuestion: null,
    currentHintIndex: 0,
    reviewQueue: [], // Questions to review
    turnsSinceReview: new Map(), // Track turns since each question
    
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
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        // First, check if any review items are due (3 turns have passed)
        for (let i = 0; i < this.reviewQueue.length; i++) {
            const reviewItem = this.reviewQueue[i];
            const turnsSince = this.turnsSinceReview.get(reviewItem) || 0;
            
            if (turnsSince >= 3) {
                // Remove from review queue and reset counter
                this.reviewQueue.splice(i, 1);
                this.turnsSinceReview.delete(reviewItem);
                
                // Increment all other counters
                this.incrementTurnCounters();
                
                return reviewItem;
            }
        }
        
        // Otherwise get a new random question
        if (this.usedIndices.size >= this.questions.length) {
            this.usedIndices.clear();
        }
        
        let index;
        do {
            index = Math.floor(Math.random() * this.questions.length);
        } while (this.usedIndices.has(index));
        
        this.usedIndices.add(index);
        
        // Increment all review counters
        this.incrementTurnCounters();
        
        return this.questions[index];
    },
    
    incrementTurnCounters() {
        for (const item of this.reviewQueue) {
            const current = this.turnsSinceReview.get(item) || 0;
            this.turnsSinceReview.set(item, current + 1);
        }
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        this.currentHintIndex = 0;
        
        // Update progress
        document.getElementById('speak-progress').textContent = 
            `${this.correct} correct`;
        
        // Show image
        const promptArea = document.getElementById('speak-prompt-area');
        promptArea.innerHTML = `
            <img src="${this.currentQuestion.image}" alt="Say this word" class="prompt-image-large">
            <div class="text-center text-gray-600 mt-4">Say what you see</div>
        `;
        
        // Reset hint display
        document.getElementById('hint-display').innerHTML = '';
        document.getElementById('hint-btn').textContent = '💡 Need a hint';
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('hint-btn').classList.remove('opacity-50', 'cursor-not-allowed');
    },
    
    speakWord(word, slow = false) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(word);
            
            // Configure for clear pronunciation
            utterance.rate = slow ? 0.5 : 0.8; // Very slow for final hint
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }
    },
    
    speakLetter(letter) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(letter.toUpperCase());
            utterance.rate = 0.7;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        }
    },
    
    showNextHint() {
        if (this.currentHintIndex >= this.currentQuestion.hints.length) {
            return;
        }
        
        const hint = this.currentQuestion.hints[this.currentHintIndex];
        const hintDisplay = document.getElementById('hint-display');
        
        // Check if this is one of the last two hints
        const isStartsWithHint = hint.toLowerCase().includes('starts with');
        const isLastHint = this.currentHintIndex === this.currentQuestion.hints.length - 1;
        
        // Create hint element
        let hintHTML = '';
        
        if (isStartsWithHint) {
            // Extract the letter from the hint
            const letterMatch = hint.match(/"([A-Z])"/i);
            const letter = letterMatch ? letterMatch[1] : hint.slice(-1);
            
            hintHTML = `
                <div class="hint-item hint-with-audio">
                    <span>${hint}</span>
                    <button class="audio-btn" onclick="SpeakEngine.speakLetter('${letter}')">
                        🔊
                    </button>
                </div>
            `;
            
            // Auto-speak the letter
            setTimeout(() => this.speakLetter(letter), 100);
            
        } else if (isLastHint) {
            // This is the spelled-out word - say it slowly
            hintHTML = `
                <div class="hint-item hint-with-audio">
                    <span>${hint}</span>
                    <button class="audio-btn" onclick="SpeakEngine.speakWord('${this.currentQuestion.answer}', true)">
                        🔊
                    </button>
                </div>
            `;
            
            // Auto-speak the word slowly
            setTimeout(() => this.speakWord(this.currentQuestion.answer, true), 100);
            
        } else {
            hintHTML = `<div class="hint-item">${hint}</div>`;
        }
        
        hintDisplay.innerHTML += hintHTML;
        this.currentHintIndex++;
        
        // Update button text
        const hintBtn = document.getElementById('hint-btn');
        if (this.currentHintIndex >= this.currentQuestion.hints.length) {
            hintBtn.textContent = 'No more hints';
            hintBtn.disabled = true;
            hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            hintBtn.textContent = 
                `💡 Another hint (${this.currentQuestion.hints.length - this.currentHintIndex} left)`;
        }
    },
    
    markCorrect() {
        this.correct++;
        this.total++;
        
        // Don't add to review if they got it without all hints
        const usedAllHints = this.currentHintIndex >= this.currentQuestion.hints.length;
        
        if (usedAllHints) {
            // Add to review queue
            this.addToReview(this.currentQuestion);
        }
        
        // Brief success feedback
        const promptArea = document.getElementById('speak-prompt-area');
        promptArea.innerHTML += `<div class="success-flash">✓ Great job!</div>`;
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 800);
    },
    
    markIncorrect() {
        this.total++;
        
        // Add to review queue since they couldn't get it
        this.addToReview(this.currentQuestion);
        
        // Show the answer with audio
        const hintDisplay = document.getElementById('hint-display');
        hintDisplay.innerHTML = `
            <div class="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                <span class="text-red-700">The word is: <strong class="text-xl">${this.currentQuestion.answer.toUpperCase()}</strong></span>
                <button class="audio-btn" onclick="SpeakEngine.speakWord('${this.currentQuestion.answer}')">
                    🔊
                </button>
            </div>
        `;
        
        // Auto-speak the answer
        setTimeout(() => this.speakWord(this.currentQuestion.answer), 100);
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 2500);
    },
    
    addToReview(question) {
        // Only add if not already in queue
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
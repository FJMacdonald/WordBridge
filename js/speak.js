// js/speak.js
/**
 * Speak Exercise Engine - Progressive hints for speech practice
 */
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
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getRandomQuestion() {
        if (this.usedIndices.size >= this.questions.length) {
            this.usedIndices.clear();
        }
        
        let index;
        do {
            index = Math.floor(Math.random() * this.questions.length);
        } while (this.usedIndices.has(index));
        
        this.usedIndices.add(index);
        return this.questions[index];
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getRandomQuestion();
        this.currentHintIndex = 0;
        
        // Update progress
        document.getElementById('speak-progress').textContent = 
            `${this.correct} correct`;
        
        // Show image
        const promptArea = document.getElementById('speak-prompt-area');
        promptArea.innerHTML = `
            <img src="${this.currentQuestion.image}" alt="Say this word" class="prompt-image-large">
            <div class="prompt-instruction">Say what you see</div>
        `;
        
        // Reset hint display
        document.getElementById('hint-display').innerHTML = '';
        document.getElementById('hint-btn').textContent = '💡 Need a hint';
        document.getElementById('hint-btn').disabled = false;
    },
    
    showNextHint() {
        if (this.currentHintIndex >= this.currentQuestion.hints.length) {
            return;
        }
        
        const hint = this.currentQuestion.hints[this.currentHintIndex];
        const hintDisplay = document.getElementById('hint-display');
        
        // Add hint to display
        hintDisplay.innerHTML += `
            <div class="hint-item">${hint}</div>
        `;
        
        this.currentHintIndex++;
        
        // Update button text
        if (this.currentHintIndex >= this.currentQuestion.hints.length) {
            document.getElementById('hint-btn').textContent = 'No more hints';
            document.getElementById('hint-btn').disabled = true;
        } else {
            document.getElementById('hint-btn').textContent = 
                `💡 Another hint (${this.currentQuestion.hints.length - this.currentHintIndex} left)`;
        }
    },
    
    markCorrect() {
        this.correct++;
        this.total++;
        
        // Brief success feedback
        const promptArea = document.getElementById('speak-prompt-area');
        promptArea.innerHTML += `<div class="success-flash">✓ Great job!</div>`;
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 800);
    },
    
    markIncorrect() {
        this.total++;
        
        // Show the answer
        const hintDisplay = document.getElementById('hint-display');
        hintDisplay.innerHTML = `
            <div class="answer-reveal">
                The word is: <strong>${this.currentQuestion.answer.toUpperCase()}</strong>
            </div>
        `;
        
        setTimeout(() => {
            this.showNextQuestion();
        }, 2000);
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
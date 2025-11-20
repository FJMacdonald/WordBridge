// js/association.js 
const AssociationEngine = {
    pairs: [],
    currentQuestion: null,
    currentOptions: [],
    correctAnswer: null,
    correct: 0,
    total: 0,
    hintsUsed: 0,
    startTime: null,
    
    init() {
        this.pairs = this.getAssociationPairs();
        this.correct = 0;
        this.total = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    getAssociationPairs() {
        return [
            { word: 'bread', associated: ['butter', 'toast', 'sandwich'], unrelated: ['car', 'phone', 'tree'] },
            { word: 'pen', associated: ['paper', 'write', 'ink'], unrelated: ['swim', 'sleep', 'cook'] },
            { word: 'doctor', associated: ['hospital', 'nurse', 'medicine'], unrelated: ['garden', 'music', 'sports'] },
            { word: 'rain', associated: ['umbrella', 'wet', 'clouds'], unrelated: ['desert', 'fire', 'dry'] },
            { word: 'bed', associated: ['sleep', 'pillow', 'blanket'], unrelated: ['run', 'work', 'drive'] },
            { word: 'coffee', associated: ['morning', 'cup', 'caffeine'], unrelated: ['bed', 'night', 'pillow'] },
            { word: 'beach', associated: ['sand', 'ocean', 'swim'], unrelated: ['mountain', 'snow', 'forest'] },
            { word: 'school', associated: ['teacher', 'student', 'learn'], unrelated: ['hospital', 'kitchen', 'garage'] },
            { word: 'winter', associated: ['cold', 'snow', 'coat'], unrelated: ['hot', 'beach', 'swim'] },
            { word: 'birthday', associated: ['cake', 'party', 'candles'], unrelated: ['work', 'sad', 'alone'] },
            { word: 'kitchen', associated: ['cook', 'food', 'stove'], unrelated: ['sleep', 'shower', 'garden'] },
            { word: 'phone', associated: ['call', 'text', 'ring'], unrelated: ['walk', 'eat', 'sleep'] },
            { word: 'dog', associated: ['bark', 'pet', 'walk'], unrelated: ['fly', 'swim', 'climb'] },
            { word: 'car', associated: ['drive', 'road', 'gas'], unrelated: ['swim', 'fly', 'cook'] },
            { word: 'book', associated: ['read', 'pages', 'story'], unrelated: ['eat', 'drive', 'swim'] },
            { word: 'money', associated: ['bank', 'buy', 'wallet'], unrelated: ['sleep', 'swim', 'dream'] },
            { word: 'music', associated: ['song', 'listen', 'dance'], unrelated: ['eat', 'write', 'clean'] },
            { word: 'tree', associated: ['leaves', 'forest', 'wood'], unrelated: ['ocean', 'metal', 'plastic'] }
        ];
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        return this.pairs[Math.floor(Math.random() * this.pairs.length)];
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        
        // Pick one associated word as correct answer
        this.correctAnswer = this.currentQuestion.associated[
            Math.floor(Math.random() * this.currentQuestion.associated.length)
        ];
        
        // Get wrong answers
        const wrongAnswers = this.shuffle([...this.currentQuestion.unrelated]).slice(0, 3);
        
        this.currentOptions = this.shuffle([this.correctAnswer, ...wrongAnswers]);
        
        document.getElementById('association-progress').textContent = `${this.correct} correct`;
        
        const container = document.getElementById('association-area');
        container.innerHTML = `
            <div class="association-prompt">
                <div class="association-instruction">Which word goes with:</div>
                <div class="association-target">${this.currentQuestion.word}</div>
                <button class="audio-btn-inline" onclick="AudioHelper.speakWord('${this.currentQuestion.word}')">🔊</button>
            </div>
            
            <div class="answer-grid">
                ${this.currentOptions.map(opt => `
                    <button class="answer-btn" onclick="AssociationEngine.checkAnswer('${opt}', this)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            
            <div class="hint-buttons">
                <button class="audio-help-btn" onclick="AssociationEngine.playAll()">🔊 Hear All</button>
                <button class="eliminate-btn" onclick="AssociationEngine.eliminateOption()">❌ Remove One</button>
            </div>
            
            <div class="feedback-area" id="association-feedback"></div>
        `;
    },
    
    async playAll() {
        await AudioHelper.speak(`${this.currentQuestion.word}. Which word goes with ${this.currentQuestion.word}?`, { rate: 0.85 });
        await new Promise(r => setTimeout(r, 300));
        
        const buttons = document.querySelectorAll('.answer-btn:not(.eliminated)');
        for (const btn of buttons) {
            await AudioHelper.speakWord(btn.textContent.trim());
            await new Promise(r => setTimeout(r, 300));
        }
    },
    
    eliminateOption() {
        const wrongOptions = document.querySelectorAll('.answer-btn:not(.eliminated)');
        const wrongBtns = Array.from(wrongOptions).filter(btn => 
            btn.textContent.trim() !== this.correctAnswer
        );
        
        if (wrongBtns.length > 0) {
            this.hintsUsed++;
            const randomWrong = wrongBtns[Math.floor(Math.random() * wrongBtns.length)];
            randomWrong.classList.add('eliminated');
            randomWrong.disabled = true;
            WordTracking.trackHintUsed(this.currentQuestion.word, 'association');
        }
    },
    
    checkAnswer(answer, button) {
        const correct = answer === this.correctAnswer;
        this.total++;
        
        WordTracking.trackAnswer(this.currentQuestion.word, correct, 'association');
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            document.getElementById('association-feedback').innerHTML = 
                `<div class="feedback-text correct">✓ Correct! "${this.currentQuestion.word}" goes with "${answer}"</div>`;
            
            setTimeout(() => this.showNextQuestion(), 1200);
        } else {
            button.classList.add('incorrect');
            button.classList.add('eliminated');
            button.disabled = true;
            
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                document.getElementById('association-feedback').innerHTML = 
                    `<div class="feedback-text incorrect">The answer was "${this.correctAnswer}"</div>`;
                setTimeout(() => this.showNextQuestion(), 1500);
            }
        }
    },
    
    skip() {
        WordTracking.trackSkip(this.currentQuestion.word, 'association');
        this.showNextQuestion();
    },
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
            type: 'association',
            duration: elapsed
        };
    }
};
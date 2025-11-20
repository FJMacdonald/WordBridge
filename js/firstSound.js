// js/firstSound.js 
const FirstSoundEngine = {
    wordGroups: [],
    currentQuestion: null,
    currentOptions: [],
    correctAnswer: null,
    correct: 0,
    total: 0,
    hintsUsed: 0,
    startTime: null,
    
    init() {
        this.wordGroups = this.getWordGroups();
        this.correct = 0;
        this.total = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    getWordGroups() {
        // Words grouped by first sound
        return [
            { sound: 'b', words: ['ball', 'book', 'bed', 'bird', 'box', 'boat', 'baby', 'bus'] },
            { sound: 'c/k', words: ['cat', 'car', 'cup', 'cake', 'key', 'kite', 'king', 'coat'] },
            { sound: 'd', words: ['dog', 'door', 'day', 'desk', 'duck', 'doll', 'dance', 'dish'] },
            { sound: 'f', words: ['fish', 'food', 'fire', 'foot', 'face', '5', 'fan', 'farm'] },
            { sound: 'g', words: ['girl', 'game', 'go', 'good', 'green', 'glass', 'gift', 'garden'] },
            { sound: 'h', words: ['house', 'hat', 'hand', 'help', 'happy', 'hair', 'heart', 'horse'] },
            { sound: 'l', words: ['light', 'love', 'look', 'leg', 'leaf', 'lake', 'lamp', 'lunch'] },
            { sound: 'm', words: ['mom', 'man', 'milk', 'moon', 'money', 'mouse', 'music', 'mouth'] },
            { sound: 'n', words: ['no', 'name', 'night', 'nose', 'neck', 'nice', 'number', 'nurse'] },
            { sound: 'p', words: ['pen', 'pet', 'play', 'phone', 'park', 'paper', 'pizza', 'plant'] },
            { sound: 'r', words: ['red', 'run', 'rain', 'road', 'room', 'ring', 'rock', 'rice'] },
            { sound: 's', words: ['sun', 'sit', 'see', 'stop', 'school', 'small', 'star', 'sleep'] },
            { sound: 't', words: ['tree', 'time', 'table', 'take', 'talk', 'train', 'tooth', 'town'] },
            { sound: 'w', words: ['water', 'walk', 'want', 'work', 'window', 'woman', 'week', 'warm'] }
        ];
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        // Pick a random group for the target
        const targetGroup = this.wordGroups[Math.floor(Math.random() * this.wordGroups.length)];
        const targetWord = targetGroup.words[Math.floor(Math.random() * targetGroup.words.length)];
        
        // Pick another word from same group as correct answer
        const correctAnswers = targetGroup.words.filter(w => w !== targetWord);
        const correctAnswer = correctAnswers[Math.floor(Math.random() * correctAnswers.length)];
        
        // Pick wrong answers from different groups
        const otherGroups = this.wordGroups.filter(g => g.sound !== targetGroup.sound);
        const wrongAnswers = [];
        for (let i = 0; i < 3; i++) {
            const group = otherGroups[Math.floor(Math.random() * otherGroups.length)];
            const word = group.words[Math.floor(Math.random() * group.words.length)];
            if (!wrongAnswers.includes(word)) {
                wrongAnswers.push(word);
            }
        }
        
        return {
            targetWord,
            correctAnswer,
            wrongAnswers,
            sound: targetGroup.sound
        };
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        this.correctAnswer = this.currentQuestion.correctAnswer;
        this.currentOptions = this.shuffle([
            this.currentQuestion.correctAnswer,
            ...this.currentQuestion.wrongAnswers
        ]);
        
        document.getElementById('firstsound-progress').textContent = `${this.correct} correct`;
        
        const container = document.getElementById('firstsound-area');
        container.innerHTML = `
            <div class="sound-prompt">
                <div class="sound-instruction">Which word starts with the same sound as:</div>
                <div class="sound-target">${this.currentQuestion.targetWord}</div>
                <button class="audio-btn-inline" onclick="AudioHelper.speakWord('${this.currentQuestion.targetWord}')">🔊</button>
            </div>
            
            <div class="answer-grid">
                ${this.currentOptions.map(opt => `
                    <button class="answer-btn" onclick="FirstSoundEngine.checkAnswer('${opt}', this)">
                        ${opt}
                        <button class="audio-btn-small" onclick="event.stopPropagation(); AudioHelper.speakWord('${opt}')">🔊</button>
                    </button>
                `).join('')}
            </div>
            
            <div class="hint-buttons">
                <button class="audio-help-btn" onclick="FirstSoundEngine.playFirstSounds()">🔊 Hear First Sounds</button>
                <button class="eliminate-btn" onclick="FirstSoundEngine.eliminateOption()">❌ Remove One</button>
            </div>
            
            <div class="feedback-area" id="firstsound-feedback"></div>
        `;
    },
    
    async playFirstSounds() {
        // Say the target word emphasizing first sound
        await AudioHelper.speak(`${this.currentQuestion.targetWord}. ${this.currentQuestion.targetWord[0].toUpperCase()}.`, { rate: 0.6 });
    },
    
    eliminateOption() {
        const wrongOptions = document.querySelectorAll('.answer-btn:not(.eliminated)');
        const wrongBtns = Array.from(wrongOptions).filter(btn => 
            !btn.textContent.includes(this.correctAnswer)
        );
        
        if (wrongBtns.length > 0) {
            this.hintsUsed++;
            const randomWrong = wrongBtns[Math.floor(Math.random() * wrongBtns.length)];
            randomWrong.classList.add('eliminated');
            randomWrong.disabled = true;
            WordTracking.trackHintUsed(this.currentQuestion.targetWord, 'firstsound');
        }
    },
    
    checkAnswer(answer, button) {
        const correct = answer === this.correctAnswer;
        this.total++;
        
        WordTracking.trackAnswer(this.currentQuestion.targetWord, correct, 'firstsound');
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            document.getElementById('firstsound-feedback').innerHTML = 
                `<div class="feedback-text correct">✓ Correct! Both start with "${this.currentQuestion.sound}"</div>`;
            
            setTimeout(() => this.showNextQuestion(), 1200);
        } else {
            button.classList.add('incorrect');
            button.classList.add('eliminated');
            button.disabled = true;
            
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                document.getElementById('firstsound-feedback').innerHTML = 
                    `<div class="feedback-text incorrect">The answer was "${this.correctAnswer}"</div>`;
                setTimeout(() => this.showNextQuestion(), 1500);
            }
        }
    },
    
    skip() {
        WordTracking.trackSkip(this.currentQuestion.targetWord, 'firstsound');
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
            type: 'firstsound',
            duration: elapsed
        };
    }
};
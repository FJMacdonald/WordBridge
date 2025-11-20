// js/rhyming.js 
const RhymingEngine = {
    pairs: [],
    currentQuestion: null,
    currentOptions: [],
    correct: 0,
    total: 0,
    hintsUsed: 0,
    startTime: null,
    
    init() {
        this.pairs = this.getRhymingPairs();
        this.correct = 0;
        this.total = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    getRhymingPairs() {
        // Built-in rhyming pairs
        const basePairs = [
            { word: 'cat', rhymes: ['hat', 'bat', 'mat', 'rat'], nonRhymes: ['dog', 'cup', 'bed', 'sun'] },
            { word: 'day', rhymes: ['say', 'play', 'way', 'may'], nonRhymes: ['night', 'week', 'time', 'year'] },
            { word: 'bed', rhymes: ['red', 'head', 'said', 'led'], nonRhymes: ['sleep', 'room', 'night', 'soft'] },
            { word: 'cake', rhymes: ['make', 'lake', 'take', 'wake'], nonRhymes: ['pie', 'food', 'sweet', 'eat'] },
            { word: 'light', rhymes: ['night', 'right', 'sight', 'bright'], nonRhymes: ['dark', 'lamp', 'sun', 'see'] },
            { word: 'ring', rhymes: ['sing', 'king', 'thing', 'bring'], nonRhymes: ['bell', 'gold', 'hand', 'finger'] },
            { word: 'boat', rhymes: ['coat', 'float', 'note', 'goat'], nonRhymes: ['ship', 'water', 'sail', 'fish'] },
            { word: 'tree', rhymes: ['see', 'bee', 'free', 'key'], nonRhymes: ['plant', 'leaf', 'wood', 'forest'] },
            { word: 'car', rhymes: ['star', 'far', 'bar', 'jar'], nonRhymes: ['drive', 'road', 'wheel', 'bus'] },
            { word: 'book', rhymes: ['look', 'cook', 'hook', 'took'], nonRhymes: ['read', 'page', 'word', 'story'] },
            { word: 'house', rhymes: ['mouse', 'blouse'], nonRhymes: ['home', 'door', 'room', 'building'] },
            { word: 'train', rhymes: ['rain', 'brain', 'main', 'plain'], nonRhymes: ['bus', 'car', 'track', 'station'] },
            { word: 'phone', rhymes: ['bone', 'stone', 'tone', 'zone'], nonRhymes: ['call', 'talk', 'ring', 'text'] },
            { word: 'ball', rhymes: ['call', 'fall', 'tall', 'wall'], nonRhymes: ['game', 'throw', 'round', 'play'] },
            { word: 'dog', rhymes: ['fog', 'log', 'frog', 'jog'], nonRhymes: ['cat', 'pet', 'bark', 'tail'] }
        ];
        
        // Add custom if available
        const custom = Storage.get('customExercises', {});
        if (custom.rhyming) {
            return [...basePairs, ...custom.rhyming];
        }
        
        return basePairs;
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        return this.pairs[Math.floor(Math.random() * this.pairs.length)];
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        
        // Pick one correct rhyme and three non-rhymes
        const correctAnswer = this.currentQuestion.rhymes[Math.floor(Math.random() * this.currentQuestion.rhymes.length)];
        const wrongAnswers = this.shuffle([...this.currentQuestion.nonRhymes]).slice(0, 3);
        
        this.currentOptions = this.shuffle([correctAnswer, ...wrongAnswers]);
        this.correctAnswer = correctAnswer;
        
        document.getElementById('rhyming-progress').textContent = `${this.correct} correct`;
        
        const container = document.getElementById('rhyming-area');
        container.innerHTML = `
            <div class="rhyming-prompt">
                <div class="rhyme-instruction">Which word rhymes with:</div>
                <div class="rhyme-target">${this.currentQuestion.word}</div>
                <button class="audio-btn-inline" onclick="AudioHelper.speakWord('${this.currentQuestion.word}')">🔊</button>
            </div>
            
            <div class="answer-grid">
                ${this.currentOptions.map(opt => `
                    <button class="answer-btn" onclick="RhymingEngine.checkAnswer('${opt}', this)">
                        ${opt}
                        <button class="audio-btn-small" onclick="event.stopPropagation(); AudioHelper.speakWord('${opt}')">🔊</button>
                    </button>
                `).join('')}
            </div>
            
            <div class="hint-buttons">
                <button class="audio-help-btn" onclick="RhymingEngine.playAll()">🔊 Hear All</button>
                <button class="eliminate-btn" onclick="RhymingEngine.eliminateOption()">❌ Remove One</button>
            </div>
            
            <div class="feedback-area" id="rhyming-feedback"></div>
        `;
    },
    
    async playAll() {
        await AudioHelper.speakWord(this.currentQuestion.word);
        await new Promise(r => setTimeout(r, 500));
        
        for (const opt of this.currentOptions) {
            const btn = document.querySelector(`.answer-btn:not(.eliminated)`);
            if (btn && btn.textContent.includes(opt)) {
                await AudioHelper.speakWord(opt);
                await new Promise(r => setTimeout(r, 400));
            }
        }
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
            WordTracking.trackHintUsed(this.currentQuestion.word, 'rhyming');
        }
    },
    
    checkAnswer(answer, button) {
        const correct = answer === this.correctAnswer;
        this.total++;
        
        WordTracking.trackAnswer(this.currentQuestion.word, correct, 'rhyming');
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            document.getElementById('rhyming-feedback').innerHTML = 
                `<div class="feedback-text correct">✓ Correct! "${this.currentQuestion.word}" rhymes with "${answer}"</div>`;
            
            setTimeout(() => this.showNextQuestion(), 1200);
        } else {
            button.classList.add('incorrect');
            button.classList.add('eliminated');
            button.disabled = true;
            
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                document.getElementById('rhyming-feedback').innerHTML = 
                    `<div class="feedback-text incorrect">The answer was "${this.correctAnswer}"</div>`;
                setTimeout(() => this.showNextQuestion(), 1500);
            }
        }
    },
    
    skip() {
        WordTracking.trackSkip(this.currentQuestion.word, 'rhyming');
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
            type: 'rhyming',
            duration: elapsed
        };
    }
};
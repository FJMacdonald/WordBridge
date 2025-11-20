// js/definition.js 
const DefinitionEngine = {
    words: [],
    currentQuestion: null,
    currentOptions: [],
    correctAnswer: null,
    correct: 0,
    total: 0,
    hintsUsed: 0,
    startTime: null,
    
    init() {
        this.words = this.getWordDefinitions();
        this.correct = 0;
        this.total = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    getWordDefinitions() {
        return [
            { word: 'chair', definition: 'A piece of furniture for sitting', category: 'furniture' },
            { word: 'apple', definition: 'A round red or green fruit', category: 'food' },
            { word: 'doctor', definition: 'A person who treats sick people', category: 'job' },
            { word: 'book', definition: 'Pages with words bound together to read', category: 'object' },
            { word: 'car', definition: 'A vehicle with four wheels for driving', category: 'vehicle' },
            { word: 'dog', definition: 'A pet animal that barks', category: 'animal' },
            { word: 'rain', definition: 'Water falling from clouds in the sky', category: 'weather' },
            { word: 'kitchen', definition: 'A room where food is cooked', category: 'room' },
            { word: 'teacher', definition: 'A person who helps students learn', category: 'job' },
            { word: 'phone', definition: 'A device used to call or text people', category: 'object' },
            { word: 'bed', definition: 'Furniture for sleeping', category: 'furniture' },
            { word: 'water', definition: 'A clear liquid we drink', category: 'drink' },
            { word: 'sun', definition: 'The bright star that gives us light and warmth', category: 'nature' },
            { word: 'clock', definition: 'A device that shows the time', category: 'object' },
            { word: 'shirt', definition: 'Clothing worn on the upper body', category: 'clothing' },
            { word: 'bread', definition: 'A baked food made from flour', category: 'food' },
            { word: 'window', definition: 'An opening in a wall to let in light', category: 'building' },
            { word: 'tree', definition: 'A tall plant with a trunk and branches', category: 'nature' },
            { word: 'money', definition: 'What we use to buy things', category: 'object' },
            { word: 'hospital', definition: 'A building where sick people are treated', category: 'building' }
        ];
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        return this.words[Math.floor(Math.random() * this.words.length)];
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        this.correctAnswer = this.currentQuestion.word;
        
        // Get wrong answers (different words)
        const wrongWords = this.words
            .filter(w => w.word !== this.currentQuestion.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.word);
        
        this.currentOptions = this.shuffle([this.correctAnswer, ...wrongWords]);
        
        document.getElementById('definition-progress').textContent = `${this.correct} correct`;
        
        const container = document.getElementById('definition-area');
        container.innerHTML = `
            <div class="definition-prompt">
                <div class="definition-instruction">Which word matches this definition?</div>
                <div class="definition-text">"${this.currentQuestion.definition}"</div>
                <button class="audio-btn-inline" onclick="AudioHelper.speak('${this.currentQuestion.definition}', {rate: 0.8})">🔊</button>
            </div>
            
            <div class="answer-grid">
                ${this.currentOptions.map(opt => `
                    <button class="answer-btn" onclick="DefinitionEngine.checkAnswer('${opt}', this)">
                        ${opt}
                        <button class="audio-btn-small" onclick="event.stopPropagation(); AudioHelper.speakWord('${opt}')">🔊</button>
                    </button>
                `).join('')}
            </div>
            
            <div class="hint-buttons">
                <button class="audio-help-btn" onclick="DefinitionEngine.playAll()">🔊 Hear All</button>
                <button class="eliminate-btn" onclick="DefinitionEngine.eliminateOption()">❌ Remove One</button>
            </div>
            
            <div class="feedback-area" id="definition-feedback"></div>
        `;
    },
    
    async playAll() {
        await AudioHelper.speak(this.currentQuestion.definition, { rate: 0.8 });
        await new Promise(r => setTimeout(r, 500));
        await AudioHelper.speak('The choices are:', { rate: 0.9 });
        await new Promise(r => setTimeout(r, 200));
        
        const buttons = document.querySelectorAll('.answer-btn:not(.eliminated)');
        for (const btn of buttons) {
            const word = btn.textContent.trim().split('\n')[0].trim();
            await AudioHelper.speakWord(word);
            await new Promise(r => setTimeout(r, 300));
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
            WordTracking.trackHintUsed(this.currentQuestion.word, 'definition');
        }
    },
    
    checkAnswer(answer, button) {
        const correct = answer === this.correctAnswer;
        this.total++;
        
        WordTracking.trackAnswer(this.currentQuestion.word, correct, 'definition');
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            document.getElementById('definition-feedback').innerHTML = 
                `<div class="feedback-text correct">✓ Correct! The answer is "${answer}"</div>`;
            
            setTimeout(() => this.showNextQuestion(), 1200);
        } else {
            button.classList.add('incorrect');
            button.classList.add('eliminated');
            button.disabled = true;
            
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                document.getElementById('definition-feedback').innerHTML = 
                    `<div class="feedback-text incorrect">The answer was "${this.correctAnswer}"</div>`;
                setTimeout(() => this.showNextQuestion(), 1500);
            }
        }
    },
    
    skip() {
        WordTracking.trackSkip(this.currentQuestion.word, 'definition');
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
            type: 'definition',
            duration: elapsed
        };
    }
};
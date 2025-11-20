// js/synonymAntonym.js
const SynonymAntonymEngine = {
    pairs: [],
    currentQuestion: null,
    currentOptions: [],
    correctAnswer: null,
    questionType: 'synonym', // or 'antonym'
    correct: 0,
    total: 0,
    hintsUsed: 0,
    startTime: null,
    
    init() {
        this.pairs = this.getPairs();
        this.correct = 0;
        this.total = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    getPairs() {
        return [
            { word: 'happy', synonyms: ['glad', 'joyful', 'pleased'], antonyms: ['sad', 'unhappy', 'miserable'] },
            { word: 'big', synonyms: ['large', 'huge', 'giant'], antonyms: ['small', 'tiny', 'little'] },
            { word: 'fast', synonyms: ['quick', 'rapid', 'speedy'], antonyms: ['slow', 'sluggish', 'lazy'] },
            { word: 'hot', synonyms: ['warm', 'heated', 'burning'], antonyms: ['cold', 'cool', 'freezing'] },
            { word: 'good', synonyms: ['great', 'excellent', 'fine'], antonyms: ['bad', 'poor', 'terrible'] },
            { word: 'start', synonyms: ['begin', 'commence', 'launch'], antonyms: ['stop', 'end', 'finish'] },
            { word: 'hard', synonyms: ['difficult', 'tough', 'challenging'], antonyms: ['easy', 'simple', 'effortless'] },
            { word: 'old', synonyms: ['aged', 'elderly', 'ancient'], antonyms: ['young', 'new', 'modern'] },
            { word: 'dark', synonyms: ['dim', 'shadowy', 'gloomy'], antonyms: ['light', 'bright', 'sunny'] },
            { word: 'quiet', synonyms: ['silent', 'peaceful', 'calm'], antonyms: ['loud', 'noisy', 'rowdy'] },
            { word: 'clean', synonyms: ['tidy', 'neat', 'spotless'], antonyms: ['dirty', 'messy', 'filthy'] },
            { word: 'rich', synonyms: ['wealthy', 'affluent', 'prosperous'], antonyms: ['poor', 'broke', 'needy'] },
            { word: 'strong', synonyms: ['powerful', 'mighty', 'sturdy'], antonyms: ['weak', 'fragile', 'feeble'] },
            { word: 'beautiful', synonyms: ['pretty', 'lovely', 'gorgeous'], antonyms: ['ugly', 'hideous', 'plain'] },
            { word: 'true', synonyms: ['correct', 'right', 'accurate'], antonyms: ['false', 'wrong', 'incorrect'] }
        ];
    },
    
    start() {
        this.showNextQuestion();
    },
    
    getNextQuestion() {
        const pair = this.pairs[Math.floor(Math.random() * this.pairs.length)];
        // Randomly choose synonym or antonym question
        this.questionType = Math.random() > 0.5 ? 'synonym' : 'antonym';
        return pair;
    },
    
    showNextQuestion() {
        this.currentQuestion = this.getNextQuestion();
        
        const correctList = this.questionType === 'synonym' 
            ? this.currentQuestion.synonyms 
            : this.currentQuestion.antonyms;
        
        const wrongList = this.questionType === 'synonym'
            ? this.currentQuestion.antonyms
            : this.currentQuestion.synonyms;
        
        this.correctAnswer = correctList[Math.floor(Math.random() * correctList.length)];
        
        // Get unrelated words from other pairs for variety
        const otherPairs = this.pairs.filter(p => p.word !== this.currentQuestion.word);
        const unrelatedWords = [];
        while (unrelatedWords.length < 2 && otherPairs.length > 0) {
            const randomPair = otherPairs[Math.floor(Math.random() * otherPairs.length)];
            const randomWord = Math.random() > 0.5 
                ? randomPair.synonyms[0] 
                : randomPair.antonyms[0];
            if (!unrelatedWords.includes(randomWord)) {
                unrelatedWords.push(randomWord);
            }
        }
        
        // Mix wrong answers: one from opposite category, rest unrelated
        const wrongAnswers = [wrongList[0], ...unrelatedWords].slice(0, 3);
        
        this.currentOptions = this.shuffle([this.correctAnswer, ...wrongAnswers]);
        
        document.getElementById('synonym-progress').textContent = `${this.correct} correct`;
        
        const typeLabel = this.questionType === 'synonym' ? 'means the same as' : 'means the opposite of';
        const typeIcon = this.questionType === 'synonym' ? '=' : '≠';
        
        const container = document.getElementById('synonym-area');
        container.innerHTML = `
            <div class="synonym-prompt">
                <div class="synonym-type ${this.questionType}">${typeIcon} ${this.questionType.toUpperCase()}</div>
                <div class="synonym-instruction">Which word ${typeLabel}:</div>
                <div class="synonym-target">${this.currentQuestion.word}</div>
                <button class="audio-btn-inline" onclick="AudioHelper.speakWord('${this.currentQuestion.word}')">🔊</button>
            </div>
            
            <div class="answer-grid">
                ${this.currentOptions.map(opt => `
                    <button class="answer-btn" onclick="SynonymAntonymEngine.checkAnswer('${opt}', this)">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            
            <div class="hint-buttons">
                <button class="audio-help-btn" onclick="SynonymAntonymEngine.playAll()">🔊 Hear All</button>
                <button class="eliminate-btn" onclick="SynonymAntonymEngine.eliminateOption()">❌ Remove One</button>
            </div>
            
            <div class="feedback-area" id="synonym-feedback"></div>
        `;
    },
    
    async playAll() {
        const typeWord = this.questionType === 'synonym' ? 'same as' : 'opposite of';
        await AudioHelper.speak(`Which word means the ${typeWord} ${this.currentQuestion.word}?`, { rate: 0.85 });
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
            WordTracking.trackHintUsed(this.currentQuestion.word, 'synonym');
        }
    },
    
    checkAnswer(answer, button) {
        const correct = answer === this.correctAnswer;
        this.total++;
        
        WordTracking.trackAnswer(this.currentQuestion.word, correct, 'synonym');
        
        if (correct) {
            this.correct++;
            button.classList.add('correct');
            const typeWord = this.questionType === 'synonym' ? 'means the same as' : 'is the opposite of';
            document.getElementById('synonym-feedback').innerHTML = 
                `<div class="feedback-text correct">✓ Correct! "${answer}" ${typeWord} "${this.currentQuestion.word}"</div>`;
            
            setTimeout(() => this.showNextQuestion(), 1500);
        } else {
            button.classList.add('incorrect');
            button.classList.add('eliminated');
            button.disabled = true;
            
            const remaining = document.querySelectorAll('.answer-btn:not(.eliminated)');
            if (remaining.length <= 1) {
                document.getElementById('synonym-feedback').innerHTML = 
                    `<div class="feedback-text incorrect">The answer was "${this.correctAnswer}"</div>`;
                setTimeout(() => this.showNextQuestion(), 1500);
            }
        }
    },
    
    skip() {
        WordTracking.trackSkip(this.currentQuestion.word, 'synonym');
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
            type: 'synonym-antonym',
            duration: elapsed
        };
    }
};
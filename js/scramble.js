const ScrambleEngine = {
    sentences: [],
    currentSentence: null,
    currentWords: [],
    correctOrder: [],
    correct: 0,
    total: 0,
    hintsUsed: 0,
    startTime: null,
    draggedElement: null,
    
    init() {
        // Create scramble sentences from existing data or use dedicated ones
        this.sentences = this.generateSentences();
        this.correct = 0;
        this.total = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        WordTracking.init();
    },
    
    generateSentences() {
        // Use sentences data or create simple ones
        const baseSentences = [
            { words: ['The', 'cat', 'is', 'sleeping'], id: 'scramble_1' },
            { words: ['I', 'like', 'to', 'eat', 'apples'], id: 'scramble_2' },
            { words: ['She', 'goes', 'to', 'work'], id: 'scramble_3' },
            { words: ['The', 'dog', 'runs', 'fast'], id: 'scramble_4' },
            { words: ['He', 'drinks', 'water', 'every', 'day'], id: 'scramble_5' },
            { words: ['We', 'are', 'going', 'home'], id: 'scramble_6' },
            { words: ['The', 'book', 'is', 'on', 'the', 'table'], id: 'scramble_7' },
            { words: ['I', 'need', 'to', 'buy', 'milk'], id: 'scramble_8' },
            { words: ['The', 'sun', 'is', 'shining', 'bright'], id: 'scramble_9' },
            { words: ['Please', 'close', 'the', 'door'], id: 'scramble_10' }
        ];
        
        // Add custom scramble sentences if available
        const custom = Storage.get('customExercises', {});
        if (custom.scramble) {
            return [...baseSentences, ...custom.scramble];
        }
        
        return baseSentences;
    },
    
    start() {
        this.showNextSentence();
    },
    
    getNextSentence() {
        return this.sentences[Math.floor(Math.random() * this.sentences.length)];
    },
    
    showNextSentence() {
        this.currentSentence = this.getNextSentence();
        this.correctOrder = [...this.currentSentence.words];
        this.currentWords = this.shuffle([...this.currentSentence.words]);
        
        // Make sure it's actually scrambled
        while (this.arraysEqual(this.currentWords, this.correctOrder) && this.correctOrder.length > 2) {
            this.currentWords = this.shuffle([...this.currentSentence.words]);
        }
        
        document.getElementById('scramble-progress').textContent = `${this.correct} correct`;
        
        this.renderScramble();
    },
    
    renderScramble() {
        const container = document.getElementById('scramble-area');
        
        container.innerHTML = `
            <div class="scramble-instruction">Put these words in the correct order:</div>
            
            <div class="scramble-words" id="scramble-words">
                ${this.currentWords.map((word, index) => `
                    <div class="scramble-word" 
                         draggable="true"
                         data-index="${index}"
                         data-word="${word}"
                         ondragstart="ScrambleEngine.dragStart(event)"
                         ondragend="ScrambleEngine.dragEnd(event)"
                         ondragover="ScrambleEngine.dragOver(event)"
                         ondrop="ScrambleEngine.drop(event)"
                         onclick="ScrambleEngine.tapSelect(this)">
                        ${word}
                    </div>
                `).join('')}
            </div>
            
            <div class="scramble-actions">
                <button class="btn-secondary" onclick="ScrambleEngine.showHint()">
                    💡 Hint
                </button>
                <button class="btn-primary" onclick="ScrambleEngine.checkOrder()">
                    ✓ Check
                </button>
                <button class="btn-secondary" onclick="ScrambleEngine.skip()">
                    Skip →
                </button>
            </div>
            
            <div class="scramble-feedback" id="scramble-feedback"></div>
        `;
        
        this.setupTouchDrag();
    },
    
    setupTouchDrag() {
        const words = document.querySelectorAll('.scramble-word');
        
        words.forEach(word => {
            word.addEventListener('touchstart', (e) => this.touchStart(e), { passive: false });
            word.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
            word.addEventListener('touchend', (e) => this.touchEnd(e));
        });
    },
    
    // Desktop drag handlers
    dragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    },
    
    dragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
    },
    
    dragOver(e) {
        e.preventDefault();
        const target = e.target.closest('.scramble-word');
        if (target && target !== this.draggedElement) {
            const container = document.getElementById('scramble-words');
            const words = Array.from(container.children);
            const draggedIndex = words.indexOf(this.draggedElement);
            const targetIndex = words.indexOf(target);
            
            if (draggedIndex < targetIndex) {
                target.after(this.draggedElement);
            } else {
                target.before(this.draggedElement);
            }
            
            this.updateCurrentWords();
        }
    },
    
    drop(e) {
        e.preventDefault();
    },
    
    // Touch handlers for mobile
    touchStart(e) {
        const touch = e.touches[0];
        this.draggedElement = e.target.closest('.scramble-word');
        if (this.draggedElement) {
            this.draggedElement.classList.add('dragging');
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }
    },
    
    touchMove(e) {
        if (!this.draggedElement) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const target = elemBelow?.closest('.scramble-word');
        
        if (target && target !== this.draggedElement) {
            const container = document.getElementById('scramble-words');
            const rect = target.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            
            if (touch.clientX < midpoint) {
                target.before(this.draggedElement);
            } else {
                target.after(this.draggedElement);
            }
            
            this.updateCurrentWords();
        }
    },
    
    touchEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
        }
    },
    
    // Tap to select and swap (alternative to drag)
    selectedWord: null,
    
    tapSelect(element) {
        if (this.selectedWord === null) {
            this.selectedWord = element;
            element.classList.add('selected');
        } else if (this.selectedWord === element) {
            element.classList.remove('selected');
            this.selectedWord = null;
        } else {
            // Swap positions
            const container = document.getElementById('scramble-words');
            const words = Array.from(container.children);
            const index1 = words.indexOf(this.selectedWord);
            const index2 = words.indexOf(element);
            
            if (index1 < index2) {
                element.after(this.selectedWord);
                this.selectedWord.before(element);
            } else {
                this.selectedWord.after(element);
                element.before(this.selectedWord);
            }
            
            this.selectedWord.classList.remove('selected');
            this.selectedWord = null;
            this.updateCurrentWords();
        }
    },
    
    updateCurrentWords() {
        const container = document.getElementById('scramble-words');
        const words = Array.from(container.children);
        this.currentWords = words.map(w => w.dataset.word);
    },
    
    showHint() {
        this.hintsUsed++;
        
        // Find first word that's wrong and show where it should go
        for (let i = 0; i < this.correctOrder.length; i++) {
            if (this.currentWords[i] !== this.correctOrder[i]) {
                const feedback = document.getElementById('scramble-feedback');
                feedback.innerHTML = `<div class="hint-text">Word ${i + 1} should be "${this.correctOrder[i]}"</div>`;
                
                // Highlight the correct word
                const container = document.getElementById('scramble-words');
                const words = Array.from(container.children);
                words.forEach(w => {
                    if (w.dataset.word === this.correctOrder[i]) {
                        w.classList.add('hint-highlight');
                        setTimeout(() => w.classList.remove('hint-highlight'), 2000);
                    }
                });
                
                break;
            }
        }
    },
    
    checkOrder() {
        this.updateCurrentWords();
        this.total++;
        
        const isCorrect = this.arraysEqual(this.currentWords, this.correctOrder);
        const feedback = document.getElementById('scramble-feedback');
        
        const container = document.getElementById('scramble-words');
        const words = Array.from(container.children);
        
        if (isCorrect) {
            this.correct++;
            words.forEach(w => w.classList.add('correct'));
            feedback.innerHTML = `<div class="feedback-text correct">✓ Correct!</div>`;
            
            WordTracking.trackAnswer(this.currentSentence.id, true, 'scramble');
            
            setTimeout(() => this.showNextSentence(), 1200);
        } else {
            // Highlight wrong positions
            words.forEach((w, i) => {
                if (this.currentWords[i] === this.correctOrder[i]) {
                    w.classList.add('correct-position');
                } else {
                    w.classList.add('wrong-position');
                }
            });
            
            feedback.innerHTML = `<div class="feedback-text incorrect">Not quite - try again or use a hint</div>`;
            
            // Remove highlights after delay
            setTimeout(() => {
                words.forEach(w => {
                    w.classList.remove('correct-position', 'wrong-position');
                });
            }, 1500);
        }
    },
    
    skip() {
        WordTracking.trackSkip(this.currentSentence.id, 'scramble');
        this.showNextSentence();
    },
    
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
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
            type: 'scramble',
            duration: elapsed
        };
    }
};
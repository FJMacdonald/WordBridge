// js/audioHelper.js 
const AudioHelper = {
    speaking: false,
    queue: [],
    
    speak(text, options = {}) {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || 0.85;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;
            
            utterance.onend = () => {
                this.speaking = false;
                resolve();
            };
            
            utterance.onerror = () => {
                this.speaking = false;
                resolve();
            };
            
            this.speaking = true;
            window.speechSynthesis.speak(utterance);
        });
    },
    
    speakWord(word) {
        return this.speak(word, { rate: 0.7 });
    },
    
    speakSentence(sentence) {
        const text = sentence.replace(/_{2,}/g, 'blank');
        return this.speak(text, { rate: 0.8 });
    },
    
    // Speak options in the order they appear on screen
    async speakOptionsInOrder(optionElements) {
        const options = [];
        optionElements.forEach(el => {
            options.push(el.textContent.trim());
        });
        
        await this.speak('The choices are:', { rate: 0.9 });
        await new Promise(r => setTimeout(r, 200));
        
        for (const option of options) {
            await this.speak(option, { rate: 0.75 });
            await new Promise(r => setTimeout(r, 150));
        }
    },
    
    async speakExercise(type, question) {
        let promptText = '';
        
        switch (type) {
            case 'naming':
                promptText = 'What is this?';
                break;
            case 'sentences':
                promptText = question.prompt.replace(/_{2,}/g, 'blank');
                break;
            case 'categories':
                promptText = question.prompt;
                break;
            case 'speak':
                promptText = 'What is this?';
                break;
            case 'typing':
                promptText = 'Type the word you see';
                break;
            case 'listening':
                promptText = question.answer;
                break;
        }
        
        await this.speak(promptText, { rate: 0.8 });
        
        await new Promise(r => setTimeout(r, 300));
        
        // Get options from the DOM in visual order
        const optionButtons = document.querySelectorAll('.answer-btn:not(.eliminated)');
        if (optionButtons.length > 0 && type !== 'speak' && type !== 'typing') {
            await this.speakOptionsInOrder(optionButtons);
        }
    },
    
    stop() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        this.speaking = false;
    }
};
    

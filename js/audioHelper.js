// js/audioHelper.js 
const AudioHelper = {
    speaking: false,
    
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
        // Replace blank indicator with "blank"
        const text = sentence.replace(/_{2,}/g, 'blank');
        return this.speak(text, { rate: 0.8 });
    },
    
    speakOptions(options) {
        const text = options.join(', ');
        return this.speak(text, { rate: 0.75 });
    },
    
    async speakExercise(type, question, options) {
        // Speak the prompt
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
        }
        
        await this.speak(promptText, { rate: 0.8 });
        
        // Small pause
        await new Promise(r => setTimeout(r, 300));
        
        // Speak options if provided
        if (options && options.length > 0 && type !== 'speak') {
            await this.speak('The choices are:', { rate: 0.9 });
            await new Promise(r => setTimeout(r, 200));
            
            for (let i = 0; i < options.length; i++) {
                await this.speak(options[i], { rate: 0.75 });
                await new Promise(r => setTimeout(r, 150));
            }
        }
    },
    
    stop() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        this.speaking = false;
    }
};
import Config from '../core/Config.js';

/**
 * Centralized audio/speech service
 */
class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.speaking = false;
        this.queue = [];
    }
    
    /**
     * Speak text
     */
    async speak(text, options = {}) {
        return new Promise((resolve) => {
            this.stop();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate ?? Config.get('audio.speechRate');
            utterance.pitch = options.pitch ?? Config.get('audio.speechPitch');
            utterance.volume = options.volume ?? 1.0;
            
            utterance.onend = () => {
                this.speaking = false;
                resolve();
            };
            
            utterance.onerror = () => {
                this.speaking = false;
                resolve();
            };
            
            this.speaking = true;
            this.synth.speak(utterance);
        });
    }
    
    /**
     * Speak a single word (slower for clarity)
     */
    async speakWord(word) {
        return this.speak(word, { 
            rate: Config.get('audio.speechRate') * 0.8 
        });
    }
    
    /**
     * Speak a sequence of items with delays
     */
    async speakSequence(items, options = {}) {
        const delay = options.delay ?? Config.get('audio.delayBetweenOptions');
        
        for (let i = 0; i < items.length; i++) {
            await this.speakWord(items[i]);
            if (i < items.length - 1) {
                await this.delay(delay);
            }
        }
    }
    
    /**
     * Stop all speech
     */
    stop() {
        this.synth.cancel();
        this.speaking = false;
    }
    
    /**
     * Check if speaking
     */
    isSpeaking() {
        return this.speaking || this.synth.speaking;
    }
    
    delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

export const audioService = new AudioService();
export default audioService;
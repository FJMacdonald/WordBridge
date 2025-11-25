import Config from '../core/Config.js';
import { i18n } from '../core/i18n.js';

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
     * Get appropriate voice for current language
     */
    getVoiceForLanguage() {
        const voices = this.synth.getVoices();
        const currentLocale = i18n.getCurrentLocale();
        const voiceIndex = Config.get('audio.voiceIndex') || 0;
        
        // Filter voices based on current language
        const langPrefix = currentLocale === 'de' ? 'de' : 'en';
        const languageVoices = voices.filter(voice => voice.lang.startsWith(langPrefix));
        
        // Return selected voice if available, otherwise first available voice for language
        return languageVoices[voiceIndex] || languageVoices[0] || voices[0];
    }

    /**
     * Speak text
     */
    async speak(text, options = {}) {
        return new Promise((resolve) => {
            this.stop();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate ?? Config.get('audio.speechRate') ?? 0.85;
            utterance.pitch = options.pitch ?? Config.get('audio.speechPitch') ?? 1.0;
            utterance.volume = options.volume ?? 1.0;
            
            // Set appropriate voice for current language
            const voice = this.getVoiceForLanguage();
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang;
            }
            
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
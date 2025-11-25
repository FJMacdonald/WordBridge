/**
 * Internationalization - simple implementation
 */
class I18n {
    constructor() {
        this.locale = 'en';
        this.translations = {};
    }
    
    async init(locale = 'en') {
        this.locale = locale;
        try {
            const response = await fetch(`./locales/${locale}.json`);
            if (response.ok) {
                this.translations = await response.json();
            }
        } catch (e) {
            console.warn(`Could not load locale: ${locale}`);
            // Use inline fallback
            this.translations = this.getFallback();
        }
    }
    
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }
        
        if (value === undefined) {
            console.warn(`Missing translation: ${key}`);
            return key;
        }
        
        // If value is an array, return it as-is
        if (Array.isArray(value)) {
            return value;
        }
        
        // If value is not a string, return it as-is
        if (typeof value !== 'string') {
            return value;
        }
        
        // Interpolate {params}
        return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
    }
    
    getCurrentLocale() {
        return this.locale;
    }
    
    async setLocale(locale) {
        await this.init(locale);
        // Save to localStorage
        localStorage.setItem('locale', locale);
    }
    
    getFallback() {
        return {
            common: {
                correct: "Correct",
                incorrect: "Try again",
                skip: "Skip",
                hint: "Hint",
                playAll: "Play All",
                next: "Next"
            },
            audio: {
                playAll: "Hear all options",
                playWord: "Play word"
            },
            hints: {
                removeOne: "Remove one",
                showLetter: "Show letter",
                noMoreHints: "No more hints",
                remaining: "{count} left"
            },
            feedback: {
                correct: "✓ Correct!",
                incorrect: "✗ Not quite",
                perfect: "✓ Perfect!",
                theAnswerWas: "The answer was: {answer}",
                withHints: "Got it with help!"
            },
            exercises: {
                naming: {
                    name: "Picture Naming",
                    instruction: "What is this?"
                },
                sentenceTyping: {
                    name: "Sentence Completion",
                    instruction: "Type the missing word"
                }
            },
            results: {
                title: "Session Complete!",
                score: "{correct} out of {total}",
                accuracy: "{percent}% accuracy",
                time: "Time: {time}",
                playAgain: "Practice Again",
                backToMenu: "Back to Menu"
            },
            home: {
                title: "Choose an Exercise",
                subtitle: "Practice at your own pace"
            }
        };
    }
}

export const i18n = new I18n();
export const t = (key, params) => i18n.t(key, params);
export default i18n;
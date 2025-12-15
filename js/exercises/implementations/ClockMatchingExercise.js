import SelectionExercise from '../SelectionExercise.js';
import { t } from '../../core/i18n.js';
import audioService from '../../services/AudioService.js';

/**
 * Clock Matching Exercise
 * Match digital times with analog clock faces
 */
class ClockMatchingExercise extends SelectionExercise {
    constructor() {
        super({ type: 'clockMatching' });
        this.currentOptions = [];
    }
    
    prepareOptions() {
        const targetTime = this.currentItem;
        
        // If the item has wrongClocks (from CSV import), use those to generate analog clocks
        if (targetTime.wrongClocks && targetTime.wrongClocks.length >= 3) {
            // Create analog clock displays from the time data
            const allClocks = [
                {
                    id: targetTime.id,
                    time: targetTime.time,
                    display: this.renderAnalogClock(targetTime.analogData),
                    answer: targetTime.timeWords
                },
                ...targetTime.wrongClocks.slice(0, 3).map((clock, idx) => ({
                    id: `wrong_${idx}`,
                    time: clock.time,
                    display: this.renderAnalogClock(clock.analogData),
                    answer: `wrong_${idx}`
                }))
            ];
            
            this.currentOptions = this.shuffleArray(allClocks);
            return this.currentOptions;
        }
        
        // Otherwise get 3 other random times as wrong options
        const allTimes = this.items.filter(item => item.id !== targetTime.id);
        const wrongOptions = this.shuffleArray(allTimes).slice(0, 3);
        
        // Create options array with clock displays
        const options = [targetTime, ...wrongOptions].map(timeItem => ({
            id: timeItem.id,
            time: timeItem.time,
            display: this.renderAnalogClock(timeItem.analogData),
            answer: timeItem.time
        }));
        
        this.currentOptions = this.shuffleArray(options);
        return this.currentOptions;
    }
    
    renderPrompt() {
        const item = this.currentItem;
        
        // If text-based options (from CSV), show timeWords as the prompt
        if (item.options && item.options.length >= 4) {
            return `
                <p class="prompt-instruction">${t('exercises.clockMatching.selectClock')}</p>
                <div class="digital-time-display">${item.digitalDisplay}</div>
            `;
        }
        
        // Otherwise show analog clocks
        return `
            <p class="prompt-instruction">${t('exercises.clockMatching.selectClock')} ${item.digitalDisplay}</p>
            <div class="digital-time-display">${item.digitalDisplay}</div>
        `;
    }
    
    renderOption(option, index) {
        // For text options, use the answer as the value
        const dataValue = option.answer || option.time || option.id;
        
        // If display is plain text (not HTML with SVG), wrap it nicely
        const displayContent = option.display.includes('<svg') ? 
            option.display : 
            `<div style="padding: 10px; font-size: 16px;">${option.display}</div>`;
            
        return `
            <button class="option-btn option-btn--clock" data-index="${index}" data-value="${dataValue}">
                ${displayContent}
            </button>
        `;
    }
    
    renderAnalogClock(analogData) {
        return `
            <div class="analog-clock">
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <!-- Clock face -->
                    <circle cx="50" cy="50" r="48" fill="white" stroke="#333" stroke-width="2"/>
                    
                    <!-- Hour markers -->
                    <g stroke="#333" stroke-width="1">
                        ${Array.from({length: 12}, (_, i) => {
                            const angle = (i * 30) - 90;
                            const x1 = 50 + 40 * Math.cos(angle * Math.PI / 180);
                            const y1 = 50 + 40 * Math.sin(angle * Math.PI / 180);
                            const x2 = 50 + 35 * Math.cos(angle * Math.PI / 180);
                            const y2 = 50 + 35 * Math.sin(angle * Math.PI / 180);
                            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
                        }).join('')}
                    </g>
                    
                    <!-- Hour numbers -->
                    <g fill="#333" font-size="8" text-anchor="middle" dominant-baseline="central">
                        ${Array.from({length: 12}, (_, i) => {
                            const hour = i === 0 ? 12 : i;
                            const angle = (i * 30) - 90;
                            const x = 50 + 28 * Math.cos(angle * Math.PI / 180);
                            const y = 50 + 28 * Math.sin(angle * Math.PI / 180);
                            return `<text x="${x}" y="${y}">${hour}</text>`;
                        }).join('')}
                    </g>
                    
                    <!-- Hour hand -->
                    <line x1="50" y1="50" 
                          x2="${50 + 20 * Math.cos((analogData.hourAngle - 90) * Math.PI / 180)}" 
                          y2="${50 + 20 * Math.sin((analogData.hourAngle - 90) * Math.PI / 180)}" 
                          stroke="#333" stroke-width="3" stroke-linecap="round"/>
                    
                    <!-- Minute hand -->
                    <line x1="50" y1="50" 
                          x2="${50 + 30 * Math.cos((analogData.minuteAngle - 90) * Math.PI / 180)}" 
                          y2="${50 + 30 * Math.sin((analogData.minuteAngle - 90) * Math.PI / 180)}" 
                          stroke="#333" stroke-width="2" stroke-linecap="round"/>
                    
                    <!-- Center dot -->
                    <circle cx="50" cy="50" r="2" fill="#333"/>
                </svg>
            </div>
        `;
    }
    
    async playPromptAudio() {
        const item = this.currentItem;
        await audioService.speak(`${t('exercises.clockMatching.selectClock')} ${item.timeWords}`);
    }
    
    async handlePlayAll() {
        await this.playPromptAudio();
    }
    
    getCorrectAnswer() {
        // For CSV imports with wrongClocks, return the timeWords
        if (this.currentItem.wrongClocks) {
            return this.currentItem.timeWords;
        }
        return this.currentItem.time;
    }
    
    showFeedback(correct, message = null) {
        if (correct && !message) {
            const correctMatchText = t('exercises.clockMatching.correctMatch', { 
                time: this.currentItem.digitalDisplay 
            }) || `Correct! The time ${this.currentItem.digitalDisplay} matches the selected clock.`;
            message = `✓ ${correctMatchText}`;
        }
        super.showFeedback(correct, message);
    }
    
    /**
     * Custom hints for clock matching
     * Hint 1: Eliminate 1 option
     * Hint 2: Where hour hand is
     * Hint 3: Eliminate another option
     * Hint 4: Where both hands are
     */
    async applyHint(hintType) {
        const hintArea = this.container.querySelector('#hint-area');
        const currentItem = this.currentItem;
        const hintNumber = this.state.hintsUsed + 1;
        
        if (hintNumber === 1 || hintNumber === 3) {
            // Eliminate 1 option
            return super.applyHint('eliminate');
        } else if (hintNumber === 2) {
            // Describe hour hand position
            const hourHint = this.getHourHandHint(currentItem);
            if (hintArea) {
                const hintItem = document.createElement('div');
                hintItem.className = 'hint-item hint-phrase';
                hintItem.textContent = hourHint;
                hintArea.appendChild(hintItem);
            }
            setTimeout(() => audioService.speak(hourHint), 100);
        } else if (hintNumber === 4) {
            // Describe both hands
            const bothHandsHint = this.getBothHandsHint(currentItem);
            if (hintArea) {
                const hintItem = document.createElement('div');
                hintItem.className = 'hint-item hint-phrase';
                hintItem.textContent = bothHandsHint;
                hintArea.appendChild(hintItem);
            }
            setTimeout(() => audioService.speak(bothHandsHint), 100);
        }
    }
    
    getHourHandHint(timeItem) {
        const hour = timeItem.hour;
        const minute = timeItem.minute;
        const displayHour = hour === 0 ? 12 : hour;
        const nextHour = hour === 0 ? 1 : hour === 12 ? 1 : hour + 1;
        
        if (minute < 20) {
            return t('exercises.clockMatching.hourHandPoints', { hour: displayHour }) 
                || `The hour hand points to ${displayHour}`;
        } else if (minute > 40) {
            return t('exercises.clockMatching.hourHandPoints', { hour: nextHour })
                || `The hour hand points to ${nextHour}`;
        } else {
            return t('exercises.clockMatching.hourHandBetween', { hour1: displayHour, hour2: nextHour })
                || `The hour hand is between ${displayHour} and ${nextHour}`;
        }
    }
    
    getBothHandsHint(timeItem) {
        const hour = timeItem.hour;
        const minute = timeItem.minute;
        
        let hourDescription = this.getHourHandHint(timeItem);
        let minuteDescription;
        
        let minuteNumber;
        if (minute === 0) {
            minuteNumber = 12;
        } else if (minute === 15) {
            minuteNumber = 3;
        } else if (minute === 30) {
            minuteNumber = 6;
        } else if (minute === 45) {
            minuteNumber = 9;
        } else {
            const minuteHour = Math.floor(minute / 5);
            minuteNumber = minuteHour === 0 ? 12 : minuteHour;
        }
        
        minuteDescription = t('exercises.clockMatching.minuteHandPoints', { minute: minuteNumber })
            || `the minute hand points to ${minuteNumber}`;
        
        return `${hourDescription}, ${minuteDescription}`;
    }
}

export default ClockMatchingExercise;

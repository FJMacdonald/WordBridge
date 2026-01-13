/**
 * Clock Matching exercise data
 * Format: { id, time, hour, minute, digitalDisplay, analogData, timeWords, difficulty }
 * 
 * Difficulty levels:
 * - easy: on the hour (:00) and half past (:30)
 * - medium: quarter past (:15) and quarter to (:45), with alternative phrases
 * - hard: all other times (5-minute intervals)
 */
export const clockMatchingData = [
    // EASY - On the hour and half past (20+ items)
    { id: '1_00', time: '1:00', hour: 1, minute: 0, digitalDisplay: '1:00', analogData: { hourAngle: 30, minuteAngle: 0 }, timeWords: "one o'clock", difficulty: 'easy' },
    { id: '2_00', time: '2:00', hour: 2, minute: 0, digitalDisplay: '2:00', analogData: { hourAngle: 60, minuteAngle: 0 }, timeWords: "two o'clock", difficulty: 'easy' },
    { id: '3_00', time: '3:00', hour: 3, minute: 0, digitalDisplay: '3:00', analogData: { hourAngle: 90, minuteAngle: 0 }, timeWords: "three o'clock", difficulty: 'easy' },
    { id: '4_00', time: '4:00', hour: 4, minute: 0, digitalDisplay: '4:00', analogData: { hourAngle: 120, minuteAngle: 0 }, timeWords: "four o'clock", difficulty: 'easy' },
    { id: '5_00', time: '5:00', hour: 5, minute: 0, digitalDisplay: '5:00', analogData: { hourAngle: 150, minuteAngle: 0 }, timeWords: "five o'clock", difficulty: 'easy' },
    { id: '6_00', time: '6:00', hour: 6, minute: 0, digitalDisplay: '6:00', analogData: { hourAngle: 180, minuteAngle: 0 }, timeWords: "six o'clock", difficulty: 'easy' },
    { id: '7_00', time: '7:00', hour: 7, minute: 0, digitalDisplay: '7:00', analogData: { hourAngle: 210, minuteAngle: 0 }, timeWords: "seven o'clock", difficulty: 'easy' },
    { id: '8_00', time: '8:00', hour: 8, minute: 0, digitalDisplay: '8:00', analogData: { hourAngle: 240, minuteAngle: 0 }, timeWords: "eight o'clock", difficulty: 'easy' },
    { id: '9_00', time: '9:00', hour: 9, minute: 0, digitalDisplay: '9:00', analogData: { hourAngle: 270, minuteAngle: 0 }, timeWords: "nine o'clock", difficulty: 'easy' },
    { id: '10_00', time: '10:00', hour: 10, minute: 0, digitalDisplay: '10:00', analogData: { hourAngle: 300, minuteAngle: 0 }, timeWords: "ten o'clock", difficulty: 'easy' },
    { id: '11_00', time: '11:00', hour: 11, minute: 0, digitalDisplay: '11:00', analogData: { hourAngle: 330, minuteAngle: 0 }, timeWords: "eleven o'clock", difficulty: 'easy' },
    { id: '12_00', time: '12:00', hour: 12, minute: 0, digitalDisplay: '12:00', analogData: { hourAngle: 0, minuteAngle: 0 }, timeWords: "twelve o'clock", difficulty: 'easy' },
    { id: '1_30', time: '1:30', hour: 1, minute: 30, digitalDisplay: '1:30', analogData: { hourAngle: 45, minuteAngle: 180 }, timeWords: 'half past one', difficulty: 'easy' },
    { id: '2_30', time: '2:30', hour: 2, minute: 30, digitalDisplay: '2:30', analogData: { hourAngle: 75, minuteAngle: 180 }, timeWords: 'half past two', difficulty: 'easy' },
    { id: '3_30', time: '3:30', hour: 3, minute: 30, digitalDisplay: '3:30', analogData: { hourAngle: 105, minuteAngle: 180 }, timeWords: 'half past three', difficulty: 'easy' },
    { id: '4_30', time: '4:30', hour: 4, minute: 30, digitalDisplay: '4:30', analogData: { hourAngle: 135, minuteAngle: 180 }, timeWords: 'half past four', difficulty: 'easy' },
    { id: '5_30', time: '5:30', hour: 5, minute: 30, digitalDisplay: '5:30', analogData: { hourAngle: 165, minuteAngle: 180 }, timeWords: 'half past five', difficulty: 'easy' },
    { id: '6_30', time: '6:30', hour: 6, minute: 30, digitalDisplay: '6:30', analogData: { hourAngle: 195, minuteAngle: 180 }, timeWords: 'half past six', difficulty: 'easy' },
    { id: '7_30', time: '7:30', hour: 7, minute: 30, digitalDisplay: '7:30', analogData: { hourAngle: 225, minuteAngle: 180 }, timeWords: 'half past seven', difficulty: 'easy' },
    { id: '8_30', time: '8:30', hour: 8, minute: 30, digitalDisplay: '8:30', analogData: { hourAngle: 255, minuteAngle: 180 }, timeWords: 'half past eight', difficulty: 'easy' },
    { id: '9_30', time: '9:30', hour: 9, minute: 30, digitalDisplay: '9:30', analogData: { hourAngle: 285, minuteAngle: 180 }, timeWords: 'half past nine', difficulty: 'easy' },
    { id: '10_30', time: '10:30', hour: 10, minute: 30, digitalDisplay: '10:30', analogData: { hourAngle: 315, minuteAngle: 180 }, timeWords: 'half past ten', difficulty: 'easy' },
    { id: '11_30', time: '11:30', hour: 11, minute: 30, digitalDisplay: '11:30', analogData: { hourAngle: 345, minuteAngle: 180 }, timeWords: 'half past eleven', difficulty: 'easy' },
    { id: '12_30', time: '12:30', hour: 12, minute: 30, digitalDisplay: '12:30', analogData: { hourAngle: 15, minuteAngle: 180 }, timeWords: 'half past twelve', difficulty: 'easy' },
    
    // MEDIUM - Quarter past and quarter to, with alternative phrases (20+ items)
    { id: '1_15', time: '1:15', hour: 1, minute: 15, digitalDisplay: '1:15', analogData: { hourAngle: 37.5, minuteAngle: 90 }, timeWords: 'quarter past one', difficulty: 'medium' },
    { id: '2_15', time: '2:15', hour: 2, minute: 15, digitalDisplay: '2:15', analogData: { hourAngle: 67.5, minuteAngle: 90 }, timeWords: 'quarter past two', difficulty: 'medium' },
    { id: '3_15', time: '3:15', hour: 3, minute: 15, digitalDisplay: '3:15', analogData: { hourAngle: 97.5, minuteAngle: 90 }, timeWords: 'quarter past three', difficulty: 'medium' },
    { id: '4_15', time: '4:15', hour: 4, minute: 15, digitalDisplay: '4:15', analogData: { hourAngle: 127.5, minuteAngle: 90 }, timeWords: 'quarter past four', difficulty: 'medium' },
    { id: '5_15', time: '5:15', hour: 5, minute: 15, digitalDisplay: '5:15', analogData: { hourAngle: 157.5, minuteAngle: 90 }, timeWords: 'quarter past five', difficulty: 'medium' },
    { id: '6_15', time: '6:15', hour: 6, minute: 15, digitalDisplay: '6:15', analogData: { hourAngle: 187.5, minuteAngle: 90 }, timeWords: 'quarter past six', difficulty: 'medium' },
    { id: '7_15', time: '7:15', hour: 7, minute: 15, digitalDisplay: '7:15', analogData: { hourAngle: 217.5, minuteAngle: 90 }, timeWords: 'quarter past seven', difficulty: 'medium' },
    { id: '8_15', time: '8:15', hour: 8, minute: 15, digitalDisplay: '8:15', analogData: { hourAngle: 247.5, minuteAngle: 90 }, timeWords: 'quarter past eight', difficulty: 'medium' },
    { id: '9_15', time: '9:15', hour: 9, minute: 15, digitalDisplay: '9:15', analogData: { hourAngle: 277.5, minuteAngle: 90 }, timeWords: 'quarter past nine', difficulty: 'medium' },
    { id: '10_15', time: '10:15', hour: 10, minute: 15, digitalDisplay: '10:15', analogData: { hourAngle: 307.5, minuteAngle: 90 }, timeWords: 'quarter past ten', difficulty: 'medium' },
    { id: '11_15', time: '11:15', hour: 11, minute: 15, digitalDisplay: '11:15', analogData: { hourAngle: 337.5, minuteAngle: 90 }, timeWords: 'quarter past eleven', difficulty: 'medium' },
    { id: '12_15', time: '12:15', hour: 12, minute: 15, digitalDisplay: '12:15', analogData: { hourAngle: 7.5, minuteAngle: 90 }, timeWords: 'quarter past twelve', difficulty: 'medium' },
    { id: '1_45', time: '1:45', hour: 1, minute: 45, digitalDisplay: '1:45', analogData: { hourAngle: 52.5, minuteAngle: 270 }, timeWords: 'quarter to two', difficulty: 'medium' },
    { id: '2_45', time: '2:45', hour: 2, minute: 45, digitalDisplay: '2:45', analogData: { hourAngle: 82.5, minuteAngle: 270 }, timeWords: 'quarter to three', difficulty: 'medium' },
    { id: '3_45', time: '3:45', hour: 3, minute: 45, digitalDisplay: '3:45', analogData: { hourAngle: 112.5, minuteAngle: 270 }, timeWords: 'quarter to four', difficulty: 'medium' },
    { id: '4_45', time: '4:45', hour: 4, minute: 45, digitalDisplay: '4:45', analogData: { hourAngle: 142.5, minuteAngle: 270 }, timeWords: 'quarter to five', difficulty: 'medium' },
    { id: '5_45', time: '5:45', hour: 5, minute: 45, digitalDisplay: '5:45', analogData: { hourAngle: 172.5, minuteAngle: 270 }, timeWords: 'quarter to six', difficulty: 'medium' },
    { id: '6_45', time: '6:45', hour: 6, minute: 45, digitalDisplay: '6:45', analogData: { hourAngle: 202.5, minuteAngle: 270 }, timeWords: 'quarter to seven', difficulty: 'medium' },
    { id: '7_45', time: '7:45', hour: 7, minute: 45, digitalDisplay: '7:45', analogData: { hourAngle: 232.5, minuteAngle: 270 }, timeWords: 'quarter to eight', difficulty: 'medium' },
    { id: '8_45', time: '8:45', hour: 8, minute: 45, digitalDisplay: '8:45', analogData: { hourAngle: 262.5, minuteAngle: 270 }, timeWords: 'quarter to nine', difficulty: 'medium' },
    { id: '9_45', time: '9:45', hour: 9, minute: 45, digitalDisplay: '9:45', analogData: { hourAngle: 292.5, minuteAngle: 270 }, timeWords: 'quarter to ten', difficulty: 'medium' },
    { id: '10_45', time: '10:45', hour: 10, minute: 45, digitalDisplay: '10:45', analogData: { hourAngle: 322.5, minuteAngle: 270 }, timeWords: 'quarter to eleven', difficulty: 'medium' },
    { id: '11_45', time: '11:45', hour: 11, minute: 45, digitalDisplay: '11:45', analogData: { hourAngle: 352.5, minuteAngle: 270 }, timeWords: 'quarter to twelve', difficulty: 'medium' },
    { id: '12_45', time: '12:45', hour: 12, minute: 45, digitalDisplay: '12:45', analogData: { hourAngle: 22.5, minuteAngle: 270 }, timeWords: 'quarter to one', difficulty: 'medium' },
    // Special times with alternative phrases
    { id: '12_00_noon', time: '12:00', hour: 12, minute: 0, digitalDisplay: '12:00', analogData: { hourAngle: 0, minuteAngle: 0 }, timeWords: 'noon', difficulty: 'medium' },
    { id: '12_00_midday', time: '12:00', hour: 12, minute: 0, digitalDisplay: '12:00', analogData: { hourAngle: 0, minuteAngle: 0 }, timeWords: 'midday', difficulty: 'medium' },
    
    // HARD - All other times (5-minute intervals) (20+ items)
    { id: '1_05', time: '1:05', hour: 1, minute: 5, digitalDisplay: '1:05', analogData: { hourAngle: 32.5, minuteAngle: 30 }, timeWords: 'five past one', difficulty: 'hard' },
    { id: '1_10', time: '1:10', hour: 1, minute: 10, digitalDisplay: '1:10', analogData: { hourAngle: 35, minuteAngle: 60 }, timeWords: 'ten past one', difficulty: 'hard' },
    { id: '1_20', time: '1:20', hour: 1, minute: 20, digitalDisplay: '1:20', analogData: { hourAngle: 40, minuteAngle: 120 }, timeWords: 'twenty past one', difficulty: 'hard' },
    { id: '1_25', time: '1:25', hour: 1, minute: 25, digitalDisplay: '1:25', analogData: { hourAngle: 42.5, minuteAngle: 150 }, timeWords: 'twenty-five past one', difficulty: 'hard' },
    { id: '1_35', time: '1:35', hour: 1, minute: 35, digitalDisplay: '1:35', analogData: { hourAngle: 47.5, minuteAngle: 210 }, timeWords: 'twenty-five to two', difficulty: 'hard' },
    { id: '1_40', time: '1:40', hour: 1, minute: 40, digitalDisplay: '1:40', analogData: { hourAngle: 50, minuteAngle: 240 }, timeWords: 'twenty to two', difficulty: 'hard' },
    { id: '1_50', time: '1:50', hour: 1, minute: 50, digitalDisplay: '1:50', analogData: { hourAngle: 55, minuteAngle: 300 }, timeWords: 'ten to two', difficulty: 'hard' },
    { id: '1_55', time: '1:55', hour: 1, minute: 55, digitalDisplay: '1:55', analogData: { hourAngle: 57.5, minuteAngle: 330 }, timeWords: 'five to two', difficulty: 'hard' },
    { id: '2_05', time: '2:05', hour: 2, minute: 5, digitalDisplay: '2:05', analogData: { hourAngle: 62.5, minuteAngle: 30 }, timeWords: 'five past two', difficulty: 'hard' },
    { id: '2_10', time: '2:10', hour: 2, minute: 10, digitalDisplay: '2:10', analogData: { hourAngle: 65, minuteAngle: 60 }, timeWords: 'ten past two', difficulty: 'hard' },
    { id: '2_20', time: '2:20', hour: 2, minute: 20, digitalDisplay: '2:20', analogData: { hourAngle: 70, minuteAngle: 120 }, timeWords: 'twenty past two', difficulty: 'hard' },
    { id: '3_05', time: '3:05', hour: 3, minute: 5, digitalDisplay: '3:05', analogData: { hourAngle: 92.5, minuteAngle: 30 }, timeWords: 'five past three', difficulty: 'hard' },
    { id: '3_10', time: '3:10', hour: 3, minute: 10, digitalDisplay: '3:10', analogData: { hourAngle: 95, minuteAngle: 60 }, timeWords: 'ten past three', difficulty: 'hard' },
    { id: '3_20', time: '3:20', hour: 3, minute: 20, digitalDisplay: '3:20', analogData: { hourAngle: 100, minuteAngle: 120 }, timeWords: 'twenty past three', difficulty: 'hard' },
    { id: '3_25', time: '3:25', hour: 3, minute: 25, digitalDisplay: '3:25', analogData: { hourAngle: 102.5, minuteAngle: 150 }, timeWords: 'twenty-five past three', difficulty: 'hard' },
    { id: '3_35', time: '3:35', hour: 3, minute: 35, digitalDisplay: '3:35', analogData: { hourAngle: 107.5, minuteAngle: 210 }, timeWords: 'twenty-five to four', difficulty: 'hard' },
    { id: '3_40', time: '3:40', hour: 3, minute: 40, digitalDisplay: '3:40', analogData: { hourAngle: 110, minuteAngle: 240 }, timeWords: 'twenty to four', difficulty: 'hard' },
    { id: '4_05', time: '4:05', hour: 4, minute: 5, digitalDisplay: '4:05', analogData: { hourAngle: 122.5, minuteAngle: 30 }, timeWords: 'five past four', difficulty: 'hard' },
    { id: '4_10', time: '4:10', hour: 4, minute: 10, digitalDisplay: '4:10', analogData: { hourAngle: 125, minuteAngle: 60 }, timeWords: 'ten past four', difficulty: 'hard' },
    { id: '4_20', time: '4:20', hour: 4, minute: 20, digitalDisplay: '4:20', analogData: { hourAngle: 130, minuteAngle: 120 }, timeWords: 'twenty past four', difficulty: 'hard' },
    { id: '5_05', time: '5:05', hour: 5, minute: 5, digitalDisplay: '5:05', analogData: { hourAngle: 152.5, minuteAngle: 30 }, timeWords: 'five past five', difficulty: 'hard' },
    { id: '5_10', time: '5:10', hour: 5, minute: 10, digitalDisplay: '5:10', analogData: { hourAngle: 155, minuteAngle: 60 }, timeWords: 'ten past five', difficulty: 'hard' },
    { id: '5_20', time: '5:20', hour: 5, minute: 20, digitalDisplay: '5:20', analogData: { hourAngle: 160, minuteAngle: 120 }, timeWords: 'twenty past five', difficulty: 'hard' },
    { id: '6_05', time: '6:05', hour: 6, minute: 5, digitalDisplay: '6:05', analogData: { hourAngle: 182.5, minuteAngle: 30 }, timeWords: 'five past six', difficulty: 'hard' },
    { id: '6_10', time: '6:10', hour: 6, minute: 10, digitalDisplay: '6:10', analogData: { hourAngle: 185, minuteAngle: 60 }, timeWords: 'ten past six', difficulty: 'hard' },
    { id: '7_05', time: '7:05', hour: 7, minute: 5, digitalDisplay: '7:05', analogData: { hourAngle: 212.5, minuteAngle: 30 }, timeWords: 'five past seven', difficulty: 'hard' },
    { id: '8_10', time: '8:10', hour: 8, minute: 10, digitalDisplay: '8:10', analogData: { hourAngle: 245, minuteAngle: 60 }, timeWords: 'ten past eight', difficulty: 'hard' },
    { id: '8_40', time: '8:40', hour: 8, minute: 40, digitalDisplay: '8:40', analogData: { hourAngle: 260, minuteAngle: 240 }, timeWords: 'twenty to nine', difficulty: 'hard' },
    { id: '9_05', time: '9:05', hour: 9, minute: 5, digitalDisplay: '9:05', analogData: { hourAngle: 272.5, minuteAngle: 30 }, timeWords: 'five past nine', difficulty: 'hard' },
    { id: '10_05', time: '10:05', hour: 10, minute: 5, digitalDisplay: '10:05', analogData: { hourAngle: 302.5, minuteAngle: 30 }, timeWords: 'five past ten', difficulty: 'hard' },
    { id: '11_10', time: '11:10', hour: 11, minute: 10, digitalDisplay: '11:10', analogData: { hourAngle: 335, minuteAngle: 60 }, timeWords: 'ten past eleven', difficulty: 'hard' }
];

export default clockMatchingData;

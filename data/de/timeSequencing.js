/**
 * Time Sequencing exercise data (German)
 * Format: { question, answer, options, direction, target, sequence }
 */
export const timeSequencingData = [
    { question: 'Welcher Tag kommt nach Montag?', answer: 'Dienstag', options: ['Dienstag', 'Mittwoch', 'Sonntag', 'Freitag'], direction: 'after', target: 'Montag', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Tag kommt vor Freitag?', answer: 'Donnerstag', options: ['Donnerstag', 'Mittwoch', 'Samstag', 'Dienstag'], direction: 'before', target: 'Freitag', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Tag kommt vor Sonntag?', answer: 'Samstag', options: ['Samstag', 'Freitag', 'Montag', 'Donnerstag'], direction: 'before', target: 'Sonntag', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Tag kommt nach Mittwoch?', answer: 'Donnerstag', options: ['Donnerstag', 'Freitag', 'Dienstag', 'Samstag'], direction: 'after', target: 'Mittwoch', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Tag kommt nach Samstag?', answer: 'Sonntag', options: ['Sonntag', 'Montag', 'Freitag', 'Mittwoch'], direction: 'after', target: 'Samstag', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Tag kommt vor Dienstag?', answer: 'Montag', options: ['Montag', 'Sonntag', 'Mittwoch', 'Donnerstag'], direction: 'before', target: 'Dienstag', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Tag kommt nach Donnerstag?', answer: 'Freitag', options: ['Freitag', 'Samstag', 'Mittwoch', 'Montag'], direction: 'after', target: 'Donnerstag', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Tag kommt vor Mittwoch?', answer: 'Dienstag', options: ['Dienstag', 'Montag', 'Donnerstag', 'Freitag'], direction: 'before', target: 'Mittwoch', sequence: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] },
    { question: 'Welcher Monat kommt nach Januar?', answer: 'Februar', options: ['Februar', 'März', 'Dezember', 'April'], direction: 'after', target: 'Januar', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
    { question: 'Welcher Monat kommt vor Juni?', answer: 'Mai', options: ['Mai', 'April', 'Juli', 'August'], direction: 'before', target: 'Juni', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
    { question: 'Welcher Monat kommt nach September?', answer: 'Oktober', options: ['Oktober', 'November', 'August', 'Dezember'], direction: 'after', target: 'September', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
    { question: 'Welcher Monat kommt nach Dezember?', answer: 'Januar', options: ['Januar', 'Februar', 'November', 'März'], direction: 'after', target: 'Dezember', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
    { question: 'Welcher Monat kommt vor März?', answer: 'Februar', options: ['Februar', 'Januar', 'April', 'Mai'], direction: 'before', target: 'März', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
    { question: 'Welcher Monat kommt nach Juli?', answer: 'August', options: ['August', 'September', 'Juni', 'Oktober'], direction: 'after', target: 'Juli', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
    { question: 'Welcher Monat kommt vor November?', answer: 'Oktober', options: ['Oktober', 'September', 'Dezember', 'Januar'], direction: 'before', target: 'November', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] },
    { question: 'Welcher Monat kommt nach Mai?', answer: 'Juni', options: ['Juni', 'Juli', 'April', 'August'], direction: 'after', target: 'Mai', sequence: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] }
];

export default timeSequencingData;

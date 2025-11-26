/**
 * Time Ordering exercise data (German)
 * Format: { id, scenario, description, items, correctOrder }
 */
export const timeOrderingData = [
    { id: 'daily_routine', scenario: 'Tägliche Routine', description: 'Bringe diese täglichen Aktivitäten in die richtige zeitliche Reihenfolge', items: ['Aufwachen', 'Frühstücken', 'Zur Arbeit gehen', 'Zu Mittag essen', 'Nach Hause kommen', 'Zu Abend essen', 'Schlafen gehen'], correctOrder: ['Aufwachen', 'Frühstücken', 'Zur Arbeit gehen', 'Zu Mittag essen', 'Nach Hause kommen', 'Zu Abend essen', 'Schlafen gehen'] },
    { id: 'school_day', scenario: 'Schultag', description: 'Bringe diese Schulaktivitäten in die richtige zeitliche Reihenfolge', items: ['Sich für die Schule fertig machen', 'Zur Schule gehen', 'Erste Stunde', 'Pause', 'Zweite Stunde', 'Mittagspause', 'Nach Hause gehen'], correctOrder: ['Sich für die Schule fertig machen', 'Zur Schule gehen', 'Erste Stunde', 'Pause', 'Zweite Stunde', 'Mittagspause', 'Nach Hause gehen'] },
    { id: 'seasons', scenario: 'Jahreszeiten', description: 'Bringe diese Jahreszeiten in die richtige Reihenfolge, beginnend mit Frühling', items: ['Winter', 'Frühling', 'Herbst', 'Sommer'], correctOrder: ['Frühling', 'Sommer', 'Herbst', 'Winter'] },
    { id: 'time_periods', scenario: 'Zeiträume', description: 'Ordne diese Zeiträume von kürzest zu längst', items: ['Jahr', 'Monat', 'Tag', 'Woche'], correctOrder: ['Tag', 'Woche', 'Monat', 'Jahr'] },
    { id: 'cooking_meal', scenario: 'Essen kochen', description: 'Bringe diese Kochschritte in die richtige Reihenfolge', items: ['Essen servieren', 'Zutaten sammeln', 'Essen kochen', 'Zutaten vorbereiten', 'Tisch decken', 'Aufräumen'], correctOrder: ['Zutaten sammeln', 'Zutaten vorbereiten', 'Tisch decken', 'Essen kochen', 'Essen servieren', 'Aufräumen'] },
    { id: 'morning_routine', scenario: 'Morgenroutine', description: 'Bringe diese Morgenaktivitäten in die richtige Reihenfolge', items: ['Sich anziehen', 'Zähne putzen', 'Frühstücken', 'Aufwachen', 'Duschen', 'Haus verlassen'], correctOrder: ['Aufwachen', 'Duschen', 'Zähne putzen', 'Sich anziehen', 'Frühstücken', 'Haus verlassen'] },
    { id: 'plant_growth', scenario: 'Pflanzenwachstum', description: 'Bringe diese Pflanzenwachstumsstufen in die richtige Reihenfolge', items: ['Blüte blüht', 'Samen pflanzen', 'Sämling wächst', 'Regelmäßig gießen', 'Früchte ernten'], correctOrder: ['Samen pflanzen', 'Regelmäßig gießen', 'Sämling wächst', 'Blüte blüht', 'Früchte ernten'] },
    { id: 'bedtime_routine', scenario: 'Abendroutine', description: 'Bringe diese Abendaktivitäten in die richtige Reihenfolge', items: ['Einschlafen', 'Pyjama anziehen', 'Zähne putzen', 'Buch lesen', 'Licht ausschalten'], correctOrder: ['Pyjama anziehen', 'Zähne putzen', 'Buch lesen', 'Licht ausschalten', 'Einschlafen'] }
];

export default timeOrderingData;

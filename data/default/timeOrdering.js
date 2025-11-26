/**
 * Time Ordering exercise data
 * Format: { id, scenario, description, items, correctOrder }
 */
export const timeOrderingData = [
    { id: 'daily_routine', scenario: 'Daily routine', description: 'Put these daily activities in the correct time order', items: ['Wake up', 'Eat breakfast', 'Go to work', 'Eat lunch', 'Come home', 'Eat dinner', 'Go to sleep'], correctOrder: ['Wake up', 'Eat breakfast', 'Go to work', 'Eat lunch', 'Come home', 'Eat dinner', 'Go to sleep'] },
    { id: 'school_day', scenario: 'School day', description: 'Put these school activities in the correct time order', items: ['Get ready for school', 'Walk to school', 'First class', 'Recess', 'Second class', 'Lunch break', 'Walk home'], correctOrder: ['Get ready for school', 'Walk to school', 'First class', 'Recess', 'Second class', 'Lunch break', 'Walk home'] },
    { id: 'seasons', scenario: 'Seasons', description: 'Put these seasons in the correct order starting with Spring', items: ['Winter', 'Spring', 'Autumn', 'Summer'], correctOrder: ['Spring', 'Summer', 'Autumn', 'Winter'] },
    { id: 'time_periods', scenario: 'Time periods', description: 'Put these time periods in order from shortest to longest', items: ['Year', 'Month', 'Day', 'Week'], correctOrder: ['Day', 'Week', 'Month', 'Year'] },
    { id: 'cooking_meal', scenario: 'Cooking a meal', description: 'Put these cooking steps in the correct order', items: ['Serve the meal', 'Gather ingredients', 'Cook the food', 'Prepare ingredients', 'Set the table', 'Clean up'], correctOrder: ['Gather ingredients', 'Prepare ingredients', 'Set the table', 'Cook the food', 'Serve the meal', 'Clean up'] },
    { id: 'morning_routine', scenario: 'Morning routine', description: 'Put these morning activities in order', items: ['Get dressed', 'Brush teeth', 'Eat breakfast', 'Wake up', 'Take shower', 'Leave house'], correctOrder: ['Wake up', 'Take shower', 'Brush teeth', 'Get dressed', 'Eat breakfast', 'Leave house'] },
    { id: 'plant_growth', scenario: 'Plant growth', description: 'Put these plant growth stages in order', items: ['Flower blooms', 'Plant seed', 'Seedling grows', 'Water regularly', 'Harvest fruit'], correctOrder: ['Plant seed', 'Water regularly', 'Seedling grows', 'Flower blooms', 'Harvest fruit'] },
    { id: 'bedtime_routine', scenario: 'Bedtime routine', description: 'Put these bedtime activities in order', items: ['Fall asleep', 'Put on pajamas', 'Brush teeth', 'Read book', 'Turn off lights'], correctOrder: ['Put on pajamas', 'Brush teeth', 'Read book', 'Turn off lights', 'Fall asleep'] }
];

export default timeOrderingData;

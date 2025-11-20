/**
 * Custom Exercises Module
 * Allows users to add their own exercises via JSON upload
 */
const CustomExercises = {
    init() {
        // Load any saved custom exercises
        this.loadCustomExercises();
    },
    
    loadCustomExercises() {
        const custom = Storage.get('customExercises', {
            naming: [],
            sentences: [],
            categories: [],
            speak: []
        });
        
        // Merge custom exercises into main data
        if (typeof ExerciseData !== 'undefined') {
            Object.keys(custom).forEach(type => {
                if (ExerciseData[type] && custom[type].length > 0) {
                    // Mark custom exercises so we can identify them
                    const marked = custom[type].map(ex => ({...ex, isCustom: true}));
                    ExerciseData[type] = [...ExerciseData[type], ...marked];
                }
            });
        }
    },
    
    // Clean and fix common JSON issues
    cleanJSON(text) {
        // Remove BOM if present
        text = text.replace(/^\uFEFF/, '');
        
        // Remove trailing commas before closing brackets/braces
        text = text.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix common quote issues
        text = text.replace(/[""]/g, '"'); // Replace smart quotes
        text = text.replace(/['']/g, "'"); // Replace smart apostrophes
        
        return text.trim();
    },
    
    validateExercise(exercise, type, index) {
        const warnings = [];
        const errors = [];
        
        // Common validations
        if (!exercise.answer || typeof exercise.answer !== 'string') {
            errors.push('Missing or invalid "answer" (must be text)');
        }
        
        switch(type) {
            case 'naming':
                // Check for image/emoji
                if (!exercise.emoji && !exercise.imageUrl) {
                    console.log(exercise.imageUrl);
                    console.log(exercise.emoji);
                    console.log(exercise);
                    errors.push('Need either "emoji" or "image" field');
                } else if (exercise.emoji && exercise.imageUrl) {
                    warnings.push('Has both emoji and image - will use emoji');
                }
                
                // Validate options
                if (!exercise.options || !Array.isArray(exercise.options)) {
                    errors.push('Missing "options" (must be a list)');
                } else if (exercise.options.length < 4) {
                    errors.push(`Need 4 options, only has ${exercise.options.length}`);
                } else if (exercise.options.length > 4) {
                    warnings.push(`Has ${exercise.options.length} options, will use first 4`);
                    exercise.options = exercise.options.slice(0, 4);
                }
                
                // Check if answer is in options
                if (exercise.options && !exercise.options.includes(exercise.answer)) {
                    errors.push('The answer must be one of the options');
                }
                
                // Clean up extra fields
                if (exercise.emoji) delete exercise.imageUrl;
                break;
                
            case 'sentences':
                if (!exercise.prompt || typeof exercise.prompt !== 'string') {
                    errors.push('Missing or invalid "prompt" (the sentence with blank)');
                }
                
                if (!exercise.options || !Array.isArray(exercise.options)) {
                    errors.push('Missing "options" (must be a list)');
                } else if (exercise.options.length < 4) {
                    errors.push(`Need 4 options, only has ${exercise.options.length}`);
                } else if (exercise.options.length > 4) {
                    warnings.push(`Has ${exercise.options.length} options, will use first 4`);
                    exercise.options = exercise.options.slice(0, 4);
                }
                
                if (exercise.options && !exercise.options.includes(exercise.answer)) {
                    errors.push('The answer must be one of the options');
                }
                break;
                
            case 'categories':
                if (!exercise.prompt || typeof exercise.prompt !== 'string') {
                    errors.push('Missing or invalid "prompt" (the question)');
                }
                
                if (!exercise.options || !Array.isArray(exercise.options)) {
                    errors.push('Missing "options" (must be a list)');
                } else if (exercise.options.length < 4) {
                    errors.push(`Need 4 options, only has ${exercise.options.length}`);
                } else if (exercise.options.length > 4) {
                    warnings.push(`Has ${exercise.options.length} options, will use first 4`);
                    exercise.options = exercise.options.slice(0, 4);
                }
                
                if (exercise.options && !exercise.options.includes(exercise.answer)) {
                    errors.push('The answer must be one of the options');
                }
                break;
                
            case 'speak':
                // Check for image/emoji
                if (!exercise.emoji && !exercise.imageUrl) {
                    errors.push('Need either "emoji" or "image" field');
                } else if (exercise.emoji && exercise.imageUrl) {
                    warnings.push('Has both emoji and image - will use emoji');
                }
                
                if (!exercise.phrases || !Array.isArray(exercise.phrases)) {
                    errors.push('Missing "phrases" (must be a list of helpful hints)');
                } else if (exercise.phrases.length < 2) {
                    errors.push(`Need at least 2 phrases, only has ${exercise.phrases.length}`);
                } else if (exercise.phrases.length > 3) {
                    warnings.push(`Has ${exercise.phrases.length} phrases, will use first 3`);
                    exercise.phrases = exercise.phrases.slice(0, 3);
                }
                
                // Clean up extra fields
                if (exercise.emoji) delete exercise.imageUrl;
                break;
        }
        
        return { errors, warnings, fixed: exercise };
    },
    
    importFromJSON(jsonString) {
        // Clean the JSON first
        const cleaned = this.cleanJSON(jsonString);
        
        try {
            const data = JSON.parse(cleaned);
            const results = {
                success: 0,
                fixed: 0,
                errors: [],
                warnings: []
            };
            
            // Check if it's the right structure
            if (typeof data !== 'object' || data === null) {
                return {
                    success: false,
                    message: 'File must contain an object with exercise types',
                    hint: 'Make sure your file starts with { and ends with }'
                };
            }
            
            const validTypes = ['naming', 'sentences', 'categories', 'speak'];
            const foundTypes = Object.keys(data).filter(k => validTypes.includes(k));
            
            if (foundTypes.length === 0) {
                return {
                    success: false,
                    message: 'No valid exercise types found',
                    hint: 'Valid types are: naming, sentences, categories, speak',
                    example: 'Try: { "naming": [...], "speak": [...] }'
                };
            }
            
            const fixedData = {};
            
            // Process each exercise type
            Object.keys(data).forEach(type => {
                if (!validTypes.includes(type)) {
                    results.warnings.push(`Unknown type "${type}" - will be ignored`);
                    return;
                }
                
                if (!Array.isArray(data[type])) {
                    results.errors.push(`"${type}" must be a list [ ] not an object { }`);
                    return;
                }
                
                fixedData[type] = [];
                
                data[type].forEach((exercise, index) => {
                    const validation = this.validateExercise(exercise, type, index);
                    
                    if (validation.errors.length > 0) {
                        results.errors.push(`${type} #${index + 1}: ${validation.errors.join('; ')}`);
                    } else {
                        fixedData[type].push(validation.fixed);
                        results.success++;
                        
                        if (validation.warnings.length > 0) {
                            results.warnings.push(`${type} #${index + 1}: ${validation.warnings.join('; ')}`);
                            results.fixed++;
                        }
                    }
                });
            });
            
            if (results.errors.length > 0) {
                return {
                    success: false,
                    message: `Found ${results.errors.length} error(s) that need fixing:`,
                    errors: results.errors,
                    warnings: results.warnings
                };
            }
            
            // Save the custom exercises
            const current = Storage.get('customExercises', {
                naming: [],
                sentences: [],
                categories: [],
                speak: []
            });
            
            Object.keys(fixedData).forEach(type => {
                current[type] = [...current[type], ...fixedData[type]];
            });
            
            Storage.set('customExercises', current);
            
            // Save settings for custom frequency if not set
            if (!Storage.get('settings').customFrequency) {
                Settings.set('customFrequency', 0.4); // 40% chance
            }
            
            this.loadCustomExercises(); // Reload to merge
            
            let message = `✓ Successfully imported ${results.success} exercise(s)!`;
            if (results.fixed > 0) {
                message += `\n\n${results.fixed} exercise(s) were automatically fixed.`;
            }
            if (results.warnings.length > 0) {
                message += `\n\nNotes:\n${results.warnings.join('\n')}`;
            }
            
            return {
                success: true,
                message: message,
                count: results.success
            };
            
        } catch (e) {
            // Try to give helpful error messages
            let hint = '';
            if (e.message.includes('Unexpected token')) {
                hint = '\n\nCommon fixes:\n' +
                       '• Check for missing commas between items\n' +
                       '• Make sure all quotes match ("text" not "text)\n' +
                       '• Remove any trailing commas before ] or }';
            } else if (e.message.includes('Unexpected end')) {
                hint = '\n\nMake sure all brackets match:\n' +
                       '• Every { needs a }\n' +
                       '• Every [ needs a ]\n' +
                       '• Every " needs another "';
            }
            
            return {
                success: false,
                message: 'Could not read the file',
                error: e.message + hint,
                hint: 'Try downloading the template again and copying your content carefully'
            };
        }
    },
    
    exportCustomExercises() {
        const custom = Storage.get('customExercises', {
            naming: [],
            sentences: [],
            categories: [],
            speak: []
        });
        
        return JSON.stringify(custom, null, 2);
    },
    
    clearCustomExercises(type = null) {
        if (type) {
            const custom = Storage.get('customExercises', {});
            if (custom[type]) {
                custom[type] = [];
                Storage.set('customExercises', custom);
            }
        } else {
            Storage.set('customExercises', {
                naming: [],
                sentences: [],
                categories: [],
                speak: []
            });
        }
        
        location.reload();
    },
    
    getCustomCount() {
        const custom = Storage.get('customExercises', {
            naming: [],
            sentences: [],
            categories: [],
            speak: []
        });
        
        return {
            naming: custom.naming.length,
            sentences: custom.sentences.length,
            categories: custom.categories.length,
            speak: custom.speak.length,
            total: custom.naming.length + custom.sentences.length + 
                   custom.categories.length + custom.speak.length
        };
    },
    
    generateTemplate() {
        return {
            "_instructions": "Delete this line. Add as many exercises as you want to each section. You can delete sections you don't need.",
            
            "naming": [
                {
                    "_note": "Delete this. Picture naming - see image, pick the word",
                    "answer": "dog",
                    "emoji": "🐕",
                    "options": ["dog", "cat", "bird", "fish"]
                },
                {
                    "_example2": "You can use a web image URL instead of emoji. Delete the emoji line if using image.",
                    "answer": "house",
                    "image": "https://example.com/house.jpg",
                    "options": ["house", "car", "tree", "store"]
                }
            ],
            
            "sentences": [
                {
                    "_note": "Delete this. Fill in the blank",
                    "prompt": "I like to drink ______",
                    "answer": "water",
                    "options": ["water", "chair", "sky", "happy"]
                }
            ],
            
            "categories": [
                {
                    "_note": "Delete this. Which word fits the category?",
                    "prompt": "Which is a fruit?",
                    "answer": "apple",
                    "options": ["apple", "carrot", "chicken", "milk"]
                }
            ],
            
            "speak": [
                {
                    "_note": "Delete this. See picture, practice saying the word",
                    "answer": "hello",
                    "emoji": "👋",
                    "phrases": [
                        "You say this when you meet someone",
                        "A friendly greeting"
                    ]
                }
            ]
        };
    }
};
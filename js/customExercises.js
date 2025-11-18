/**
 * Custom Exercises Module
 * Allows caregivers to create personalized exercises
 */
const CustomExercises = {
    /**
     * Get all custom exercises
     */
    getAll() {
        return Storage.get('customExercises', {
            naming: [],
            categories: [],
            sentences: []
        });
    },
    
    /**
     * Save custom exercises
     */
    save(exercises) {
        Storage.set('customExercises', exercises);
    },
    
    /**
     * Add a custom naming exercise (with image)
     */
    addNamingExercise(data) {
        const exercises = this.getAll();
        
        const exercise = {
            id: Date.now(),
            image: data.image, // base64 or URL
            answer: data.answer.toLowerCase().trim(),
            options: [
                data.answer.toLowerCase().trim(),
                ...data.distractors.map(d => d.toLowerCase().trim())
            ],
            hint: data.hint || '',
            createdBy: data.createdBy || 'Caregiver',
            createdAt: new Date().toISOString()
        };
        
        exercises.naming.push(exercise);
        this.save(exercises);
        
        return exercise;
    },
    
    /**
     * Add a custom category exercise
     */
    addCategoryExercise(data) {
        const exercises = this.getAll();
        
        const exercise = {
            id: Date.now(),
            prompt: data.prompt,
            answer: data.answer.toLowerCase().trim(),
            options: [
                data.answer.toLowerCase().trim(),
                ...data.distractors.map(d => d.toLowerCase().trim())
            ],
            createdBy: data.createdBy || 'Caregiver',
            createdAt: new Date().toISOString()
        };
        
        exercises.categories.push(exercise);
        this.save(exercises);
        
        return exercise;
    },
    
    /**
     * Add a custom sentence completion exercise
     */
    addSentenceExercise(data) {
        const exercises = this.getAll();
        
        const exercise = {
            id: Date.now(),
            prompt: data.sentence, // with ___ for blank
            answer: data.answer.toLowerCase().trim(),
            options: [
                data.answer.toLowerCase().trim(),
                ...data.distractors.map(d => d.toLowerCase().trim())
            ],
            createdBy: data.createdBy || 'Caregiver',
            createdAt: new Date().toISOString()
        };
        
        exercises.sentences.push(exercise);
        this.save(exercises);
        
        return exercise;
    },
    
    /**
     * Delete a custom exercise
     */
    delete(type, id) {
        const exercises = this.getAll();
        exercises[type] = exercises[type].filter(e => e.id !== id);
        this.save(exercises);
    },
    
    /**
     * Get custom exercises for an exercise session
     */
    getForSession(type, count = 2) {
        const exercises = this.getAll();
        const typeExercises = exercises[type] || [];
        
        if (typeExercises.length === 0) return [];
        
        // Shuffle and return requested count
        const shuffled = [...typeExercises].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(e => ({
            ...e,
            isCustom: true
        }));
    },
    
    /**
     * Export custom exercises as JSON for sharing
     */
    export() {
        const exercises = this.getAll();
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            exercises: exercises
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `wordbridge-custom-exercises-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    /**
     * Import custom exercises from JSON
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.exercises) {
                throw new Error('Invalid format: missing exercises');
            }
            
            const current = this.getAll();
            
            // Merge with existing, avoiding duplicates by ID
            ['naming', 'categories', 'sentences'].forEach(type => {
                if (data.exercises[type]) {
                    const existingIds = new Set(current[type].map(e => e.id));
                    const newExercises = data.exercises[type].filter(
                        e => !existingIds.has(e.id)
                    );
                    current[type] = [...current[type], ...newExercises];
                }
            });
            
            this.save(current);
            
            return {
                success: true,
                imported: {
                    naming: data.exercises.naming?.length || 0,
                    categories: data.exercises.categories?.length || 0,
                    sentences: data.exercises.sentences?.length || 0
                }
            };
        } catch (error) {
            console.error('Import error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * Process an uploaded image (resize and convert to base64)
     */
    processImage(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('File must be an image'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Resize to max 300x300 to save storage space
                    const canvas = document.createElement('canvas');
                    const maxSize = 300;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64 JPEG (smaller than PNG)
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(base64);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Get template for caregivers to fill out
     */
    getTemplate() {
        return {
            instructions: `
                WordBridge Custom Exercise Template
                ===================================
                
                Fill in this template to create personalized exercises.
                You can include family photos, familiar objects, or personal references.
                
                After filling in, save as JSON and import into WordBridge.
            `,
            template: {
                naming: [
                    {
                        image: "URL or base64 of image",
                        answer: "correct word",
                        distractors: ["wrong1", "wrong2", "wrong3"],
                        hint: "Optional hint"
                    }
                ],
                categories: [
                    {
                        prompt: "Which is a [CATEGORY]?",
                        answer: "correct",
                        distractors: ["wrong1", "wrong2", "wrong3"]
                    }
                ],
                sentences: [
                    {
                        sentence: "Complete sentence with ___",
                        answer: "correct",
                        distractors: ["wrong1", "wrong2", "wrong3"]
                    }
                ]
            }
        };
    }
};

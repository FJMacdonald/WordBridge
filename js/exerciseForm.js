const ExerciseForm = {
    currentType: 'naming',
    currentImageId: null,
    editingId: null,
    editingSource: null,  // Track if editing custom or builtin
    
    init() {
        this.editingId = null;
        this.editingSource = null;
        this.currentImageId = null;
        this.setType('naming');
    },
    
    setType(type) {
        this.currentType = type;
        this.currentImageId = null;
        
        // Update type selector buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        // Render appropriate form fields
        this.renderFormFields();
    },
    
    renderFormFields() {
        const container = document.getElementById('exercise-form-fields');
        
        let html = '';
        
        switch (this.currentType) {
            case 'naming':
            case 'speak':
                html = `
                    <div class="form-section">
                        <h4>Picture</h4>
                        <p class="form-help">Add a picture for this word</p>
                        
                        <div class="image-input-options">
                            <div class="image-option">
                                <label class="image-upload-btn">
                                    📷 Upload Photo
                                    <input type="file" accept="image/*" 
                                           onchange="ExerciseForm.handleImageUpload(event)" hidden>
                                </label>
                            </div>
                            <div class="image-option-divider">or</div>
                            <div class="image-option">
                                <input type="text" id="form-emoji" placeholder="Enter emoji (e.g., 🏠)"
                                       class="emoji-input" oninput="ExerciseForm.clearImage()">
                            </div>
                            <div class="image-option-divider">or</div>
                            <div class="image-option">
                                <input type="url" id="form-image-url" placeholder="Paste image URL"
                                       oninput="ExerciseForm.clearImagePreview()">
                            </div>
                        </div>
                        
                        <div id="image-preview" class="image-preview" style="display: none;">
                            <img id="preview-img" src="" alt="Preview">
                            <button class="remove-image" onclick="ExerciseForm.removeImage()">×</button>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>Answer Word</h4>
                        <input type="text" id="form-answer" placeholder="The correct word (e.g., house)"
                               class="form-input-large">
                    </div>
                    
                    ${this.currentType === 'naming' ? `
                        <div class="form-section">
                            <h4>Wrong Options</h4>
                            <p class="form-help">Enter 3 incorrect words</p>
                            <div class="options-grid">
                                <input type="text" id="form-option-1" placeholder="Wrong option 1">
                                <input type="text" id="form-option-2" placeholder="Wrong option 2">
                                <input type="text" id="form-option-3" placeholder="Wrong option 3">
                            </div>
                        </div>
                    ` : `
                        <div class="form-section">
                            <h4>Helpful Hints</h4>
                            <p class="form-help">Descriptions to help remember the word</p>
                            <div class="hints-inputs">
                                <input type="text" id="form-phrase-1" 
                                       placeholder="Hint 1 (e.g., You live in this)">
                                <input type="text" id="form-phrase-2" 
                                       placeholder="Hint 2 (e.g., Has rooms and a roof)">
                                <input type="text" id="form-phrase-3" 
                                       placeholder="Hint 3 (optional)">
                            </div>
                        </div>
                    `}
                `;
                break;
                
            case 'sentences':
                html = `
                    <div class="form-section">
                        <h4>Sentence with Blank</h4>
                        <p class="form-help">Use ______ for the blank</p>
                        <input type="text" id="form-prompt" 
                               placeholder="Example: I drink ______ in the morning"
                               class="form-input-large">
                    </div>
                    
                    <div class="form-section">
                        <h4>Correct Answer</h4>
                        <input type="text" id="form-answer" placeholder="The word that fills the blank"
                               class="form-input-large">
                    </div>
                    
                    <div class="form-section">
                        <h4>Wrong Options</h4>
                        <p class="form-help">Enter 3 incorrect words</p>
                        <div class="options-grid">
                            <input type="text" id="form-option-1" placeholder="Wrong option 1">
                            <input type="text" id="form-option-2" placeholder="Wrong option 2">
                            <input type="text" id="form-option-3" placeholder="Wrong option 3">
                        </div>
                    </div>
                `;
                break;
                
            case 'categories':
                html = `
                    <div class="form-section">
                        <h4>Question</h4>
                        <input type="text" id="form-prompt" 
                               placeholder="Example: Which one is a fruit?"
                               class="form-input-large">
                    </div>
                    
                    <div class="form-section">
                        <h4>Correct Answer</h4>
                        <input type="text" id="form-answer" placeholder="The correct choice"
                               class="form-input-large">
                    </div>
                    
                    <div class="form-section">
                        <h4>Wrong Options</h4>
                        <p class="form-help">Enter 3 incorrect choices</p>
                        <div class="options-grid">
                            <input type="text" id="form-option-1" placeholder="Wrong option 1">
                            <input type="text" id="form-option-2" placeholder="Wrong option 2">
                            <input type="text" id="form-option-3" placeholder="Wrong option 3">
                        </div>
                    </div>
                `;
                break;
        }
        
        container.innerHTML = html;
    },
    
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const preview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        preview.style.display = 'block';
        previewImg.src = '';
        previewImg.alt = 'Loading...';
        
        try {
            const imageId = await ImageStorage.saveImage(file);
            this.currentImageId = imageId;
            
            const imageData = await ImageStorage.getImage(imageId);
            previewImg.src = imageData;
            previewImg.alt = 'Uploaded image';
            
            const emojiField = document.getElementById('form-emoji');
            const urlField = document.getElementById('form-image-url');
            if (emojiField) emojiField.value = '';
            if (urlField) urlField.value = '';
            
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image. Please try again.');
            preview.style.display = 'none';
        }
    },
    
    clearImage() {
        this.currentImageId = null;
        document.getElementById('image-preview').style.display = 'none';
        const urlField = document.getElementById('form-image-url');
        if (urlField) urlField.value = '';
    },
    
    clearImagePreview() {
        this.currentImageId = null;
        document.getElementById('image-preview').style.display = 'none';
        const emojiField = document.getElementById('form-emoji');
        if (emojiField) emojiField.value = '';
    },
    
    removeImage() {
        if (this.currentImageId) {
            ImageStorage.deleteImage(this.currentImageId);
        }
        this.currentImageId = null;
        document.getElementById('image-preview').style.display = 'none';
    },
    
    clear() {
        if (this.currentImageId && !this.editingId) {
            // Only delete image if it's new (not editing)
            ImageStorage.deleteImage(this.currentImageId);
        }
        this.currentImageId = null;
        this.editingId = null;
        this.editingSource = null;
        this.renderFormFields();
    },
    
    validate() {
        const errors = [];
        const answer = document.getElementById('form-answer')?.value.trim();
        
        if (!answer) {
            errors.push('Please enter the answer word');
        }
        
        if (this.currentType === 'naming' || this.currentType === 'speak') {
            const emoji = document.getElementById('form-emoji')?.value.trim();
            const imageUrl = document.getElementById('form-image-url')?.value.trim();
            
            if (!this.currentImageId && !emoji && !imageUrl) {
                errors.push('Please add a photo, emoji, or image URL');
            }
        }
        
        if (this.currentType === 'sentences' || this.currentType === 'categories') {
            const prompt = document.getElementById('form-prompt')?.value.trim();
            if (!prompt) {
                errors.push('Please enter the question or sentence');
            }
        }
        
        if (this.currentType === 'naming' || this.currentType === 'sentences' || this.currentType === 'categories') {
            const opt1 = document.getElementById('form-option-1')?.value.trim();
            const opt2 = document.getElementById('form-option-2')?.value.trim();
            const opt3 = document.getElementById('form-option-3')?.value.trim();
            
            if (!opt1 || !opt2 || !opt3) {
                errors.push('Please enter all 3 wrong options');
            }
        }
        
        if (this.currentType === 'speak') {
            const phrase1 = document.getElementById('form-phrase-1')?.value.trim();
            const phrase2 = document.getElementById('form-phrase-2')?.value.trim();
            
            if (!phrase1 || !phrase2) {
                errors.push('Please enter at least 2 helpful hints');
            }
        }
        
        return errors;
    },
    
    save() {
        const errors = this.validate();
        
        if (errors.length > 0) {
            alert('Please fix the following:\n\n' + errors.join('\n'));
            return;
        }
        
        const exercise = this.buildExercise();
        
        if (this.editingId && this.editingId.startsWith('builtin_')) {
            // Save as edit to built-in exercise
            const edits = Storage.get('exerciseEdits', {});
            edits[this.editingId] = exercise;
            Storage.set('exerciseEdits', edits);
            
        } else if (this.editingId) {
            // Editing existing custom exercise
            const custom = Storage.get('customExercises', {
                naming: [], sentences: [], categories: [], speak: []
            });
            
            // Find and update the exercise
            const index = custom[this.currentType].findIndex(e => e.id === this.editingId);
            if (index !== -1) {
                exercise.id = this.editingId;
                custom[this.currentType][index] = exercise;
            } else {
                // Not found in current type, maybe type changed - remove from old, add to new
                ['naming', 'sentences', 'categories', 'speak'].forEach(type => {
                    const oldIndex = custom[type]?.findIndex(e => e.id === this.editingId);
                    if (oldIndex !== -1) {
                        custom[type].splice(oldIndex, 1);
                    }
                });
                exercise.id = this.editingId;
                custom[this.currentType].push(exercise);
            }
            
            Storage.set('customExercises', custom);
            
        } else {
            // New custom exercise
            const custom = Storage.get('customExercises', {
                naming: [], sentences: [], categories: [], speak: []
            });
            
            exercise.id = 'custom_' + Date.now();
            custom[this.currentType].push(exercise);
            Storage.set('customExercises', custom);
        }
        
        // Show success message
        const message = this.editingId ? 'Exercise updated!' : 'Exercise saved!';
        this.showSuccessMessage(message);
        
        // Clear form
        this.editingId = null;
        this.editingSource = null;
        this.currentImageId = null;
        
        // Go back to word manager
        app.showView('manage-words');
    },
    
    buildExercise() {
        const answer = document.getElementById('form-answer').value.trim().toLowerCase();
        
        const exercise = {
            answer: answer,
            isCustom: true
        };
        
        if (this.currentType === 'naming' || this.currentType === 'speak') {
            if (this.currentImageId) {
                exercise.localImageId = this.currentImageId;
            } else {
                const emoji = document.getElementById('form-emoji')?.value.trim();
                const imageUrl = document.getElementById('form-image-url')?.value.trim();
                
                if (emoji) {
                    exercise.emoji = emoji;
                } else if (imageUrl) {
                    exercise.imageUrl = imageUrl;
                }
            }
        }
        
        if (this.currentType === 'sentences' || this.currentType === 'categories') {
            exercise.prompt = document.getElementById('form-prompt').value.trim();
        }
        
        if (this.currentType === 'naming' || this.currentType === 'sentences' || this.currentType === 'categories') {
            exercise.options = [
                answer,
                document.getElementById('form-option-1').value.trim().toLowerCase(),
                document.getElementById('form-option-2').value.trim().toLowerCase(),
                document.getElementById('form-option-3').value.trim().toLowerCase()
            ];
        }
        
        if (this.currentType === 'speak') {
            const phrases = [
                document.getElementById('form-phrase-1')?.value.trim(),
                document.getElementById('form-phrase-2')?.value.trim(),
                document.getElementById('form-phrase-3')?.value.trim()
            ].filter(p => p);
            exercise.phrases = phrases;
        }
        
        return exercise;
    },
    
    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },
    
    loadForEdit(type, exercise) {
        this.currentType = type;
        this.editingId = exercise.id;
        this.editingSource = exercise.id.startsWith('builtin_') ? 'builtin' : 'custom';
        this.currentImageId = exercise.localImageId || null;
        
        app.showView('add-exercise');
        this.setType(type);
        
        // Populate fields after rendering
        setTimeout(async () => {
            const answerField = document.getElementById('form-answer');
            if (answerField) answerField.value = exercise.answer;
            
            if (type === 'naming' || type === 'speak') {
                if (exercise.localImageId) {
                    try {
                        const data = await ImageStorage.getImage(exercise.localImageId);
                        if (data) {
                            const preview = document.getElementById('image-preview');
                            const previewImg = document.getElementById('preview-img');
                            preview.style.display = 'block';
                            previewImg.src = data;
                        }
                    } catch (e) {
                        console.error('Failed to load image for edit:', e);
                    }
                } else if (exercise.emoji) {
                    const emojiField = document.getElementById('form-emoji');
                    if (emojiField) emojiField.value = exercise.emoji;
                } else if (exercise.imageUrl) {
                    const urlField = document.getElementById('form-image-url');
                    if (urlField) urlField.value = exercise.imageUrl;
                }
            }
            
            if (type === 'sentences' || type === 'categories') {
                const promptField = document.getElementById('form-prompt');
                if (promptField) promptField.value = exercise.prompt || '';
            }
            
            if (type === 'naming' || type === 'sentences' || type === 'categories') {
                if (exercise.options) {
                    const wrongOptions = exercise.options.filter(o => o !== exercise.answer);
                    const opt1 = document.getElementById('form-option-1');
                    const opt2 = document.getElementById('form-option-2');
                    const opt3 = document.getElementById('form-option-3');
                    if (opt1 && wrongOptions[0]) opt1.value = wrongOptions[0];
                    if (opt2 && wrongOptions[1]) opt2.value = wrongOptions[1];
                    if (opt3 && wrongOptions[2]) opt3.value = wrongOptions[2];
                }
            }
            
            if (type === 'speak' && exercise.phrases) {
                const p1 = document.getElementById('form-phrase-1');
                const p2 = document.getElementById('form-phrase-2');
                const p3 = document.getElementById('form-phrase-3');
                if (p1 && exercise.phrases[0]) p1.value = exercise.phrases[0];
                if (p2 && exercise.phrases[1]) p2.value = exercise.phrases[1];
                if (p3 && exercise.phrases[2]) p3.value = exercise.phrases[2];
            }
        }, 150);
    }
};
const WordManager = {
    allExercises: [],
    filteredExercises: [],
    
    init() {
        this.loadAllExercises();
    },
    
    loadAllExercises() {
        this.allExercises = [];
        
        const types = ['naming', 'sentences', 'categories', 'speak'];
        const custom = Storage.get('customExercises', {
            naming: [], sentences: [], categories: [], speak: []
        });
        const hidden = Storage.get('hiddenExercises', []);
        const edits = Storage.get('exerciseEdits', {});
        
        types.forEach(type => {
            // Add built-in exercises (if not hidden)
            if (typeof ExerciseData !== 'undefined' && ExerciseData[type]) {
                ExerciseData[type].forEach((ex, index) => {
                    if (ex.isCustom) return;
                    
                    const id = `builtin_${type}_${index}`;
                    if (hidden.includes(id)) return;
                    
                    // Check for edits
                    const edited = edits[id] ? { ...ex, ...edits[id] } : ex;
                    
                    this.allExercises.push({
                        ...edited,
                        id: id,
                        type: type,
                        source: edits[id] ? 'edited' : 'builtin',
                        originalIndex: index
                    });
                });
            }
            
            // Add custom exercises
            if (custom[type]) {
                custom[type].forEach(ex => {
                    this.allExercises.push({
                        ...ex,
                        type: type,
                        source: 'custom'
                    });
                });
            }
        });
        
        // Sort alphabetically by answer
        this.allExercises.sort((a, b) => a.answer.localeCompare(b.answer));
        this.filteredExercises = [...this.allExercises];
    },
    
    render() {
        this.loadAllExercises();
        this.filter();
    },
    
    filter() {
        const searchTerm = document.getElementById('word-search')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('type-filter')?.value || 'all';
        const sourceFilter = document.getElementById('source-filter')?.value || 'all';
        
        this.filteredExercises = this.allExercises.filter(ex => {
            const matchesSearch = ex.answer.toLowerCase().includes(searchTerm) ||
                                  (ex.prompt && ex.prompt.toLowerCase().includes(searchTerm));
            const matchesType = typeFilter === 'all' || ex.type === typeFilter;
            
            let matchesSource = true;
            if (sourceFilter === 'custom') {
                matchesSource = ex.source === 'custom';
            } else if (sourceFilter === 'builtin') {
                matchesSource = ex.source === 'builtin' || ex.source === 'edited';
            } else if (sourceFilter === 'edited') {
                matchesSource = ex.source === 'edited';
            }
            
            return matchesSearch && matchesType && matchesSource;
        });
        
        this.renderList();
    },
    
    renderList() {
        const container = document.getElementById('word-list-container');
        const countEl = document.getElementById('word-count');
        
        countEl.textContent = `${this.filteredExercises.length} exercises`;
        
        if (this.filteredExercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No exercises found</p>
                </div>
            `;
            return;
        }
        
        const typeLabels = {
            naming: 'Picture Naming',
            sentences: 'Sentences',
            categories: 'Categories',
            speak: 'Speaking'
        };
        
        const typeIcons = {
            naming: '🖼️',
            sentences: '📝',
            categories: '🏷️',
            speak: '🗣️'
        };
        
        container.innerHTML = this.filteredExercises.map(ex => `
            <div class="word-list-item ${ex.source}">
                <div class="word-list-icon">${ex.emoji || typeIcons[ex.type]}</div>
                <div class="word-list-info">
                    <div class="word-list-word">${ex.answer}</div>
                    <div class="word-list-meta">
                        <span class="word-list-type">${typeLabels[ex.type]}</span>
                        ${ex.source === 'custom' ? '<span class="custom-badge">Custom</span>' : ''}
                        ${ex.source === 'edited' ? '<span class="edited-badge">Edited</span>' : ''}
                    </div>
                </div>
                <div class="word-list-actions">
                    <button class="action-btn edit" onclick="WordManager.editExercise('${ex.type}', '${ex.id}', '${ex.source}')" title="Edit">
                        ✏️
                    </button>
                    <button class="action-btn delete" onclick="WordManager.deleteExercise('${ex.type}', '${ex.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    editExercise(type, id, source) {
        console.log('Editing:', type, id, source);
        
        let exercise = null;
        
        if (source === 'custom' || id.startsWith('custom_') || id.startsWith('import_')) {
            // Find custom exercise
            const custom = Storage.get('customExercises', {
                naming: [], sentences: [], categories: [], speak: []
            });
            
            if (custom[type]) {
                exercise = custom[type].find(e => e.id === id);
                if (exercise) {
                    exercise = { ...exercise, type: type };
                }
            }
        } else if (id.startsWith('builtin_')) {
            // Find built-in exercise
            const parts = id.split('_');
            const builtinType = parts[1];
            const index = parseInt(parts[2]);
            
            if (ExerciseData[builtinType] && ExerciseData[builtinType][index]) {
                const original = ExerciseData[builtinType][index];
                const edits = Storage.get('exerciseEdits', {});
                
                exercise = edits[id] 
                    ? { ...original, ...edits[id], id: id, type: builtinType }
                    : { ...original, id: id, type: builtinType };
            }
        }
        
        if (exercise) {
            console.log('Found exercise:', exercise);
            ExerciseForm.loadForEdit(type, exercise);
        } else {
            console.error('Exercise not found:', type, id, source);
            alert('Could not find this exercise to edit.');
        }
    },
    
    deleteExercise(type, id) {
        console.log('Deleting:', type, id);
        
        const isBuiltin = id.startsWith('builtin_');
        
        const message = isBuiltin 
            ? 'This will hide this exercise. You can restore it later. Continue?'
            : 'Are you sure you want to delete this custom exercise?';
        
        if (!confirm(message)) {
            return;
        }
        
        if (isBuiltin) {
            const hidden = Storage.get('hiddenExercises', []);
            if (!hidden.includes(id)) {
                hidden.push(id);
                Storage.set('hiddenExercises', hidden);
            }
            
            const edits = Storage.get('exerciseEdits', {});
            if (edits[id]) {
                delete edits[id];
                Storage.set('exerciseEdits', edits);
            }
        } else {
            const custom = Storage.get('customExercises', {
                naming: [], sentences: [], categories: [], speak: []
            });
            
            if (custom[type]) {
                const exercise = custom[type].find(e => e.id === id);
                if (exercise && exercise.localImageId) {
                    ImageStorage.deleteImage(exercise.localImageId);
                }
                
                custom[type] = custom[type].filter(e => e.id !== id);
                Storage.set('customExercises', custom);
            }
        }
        
        // Immediately refresh the list
        this.loadAllExercises();
        this.filter();
        
        // Show confirmation
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = 'Exercise deleted';
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    },
    
    restoreExercise(id) {
        const hidden = Storage.get('hiddenExercises', []);
        const index = hidden.indexOf(id);
        if (index !== -1) {
            hidden.splice(index, 1);
            Storage.set('hiddenExercises', hidden);
        }
        this.render();
    }
};
/**
 * Sentence Completion Exercise Data
 */
const SentencesData = {
    1: [ // High predictability
        { prompt: 'The sky is ___', answer: 'blue', options: ['blue', 'loud', 'fast', 'heavy'] },
        { prompt: 'I drink water when I am ___', answer: 'thirsty', options: ['thirsty', 'angry', 'tall', 'quiet'] },
        { prompt: 'We sleep in a ___', answer: 'bed', options: ['bed', 'car', 'tree', 'cup'] },
        { prompt: 'Fish live in ___', answer: 'water', options: ['water', 'trees', 'clouds', 'houses'] },
        { prompt: 'I use my ___ to see', answer: 'eyes', options: ['eyes', 'ears', 'nose', 'feet'] },
        { prompt: 'A dog has four ___', answer: 'legs', options: ['legs', 'wings', 'wheels', 'tails'] },
        { prompt: 'The grass is ___', answer: 'green', options: ['green', 'loud', 'soft', 'old'] },
        { prompt: 'We write with a ___', answer: 'pen', options: ['pen', 'spoon', 'key', 'shoe'] },
        { prompt: 'Birds can ___', answer: 'fly', options: ['fly', 'swim', 'drive', 'read'] },
        { prompt: 'Ice is ___', answer: 'cold', options: ['cold', 'hot', 'loud', 'soft'] },
        { prompt: 'We eat breakfast in the ___', answer: 'morning', options: ['morning', 'ceiling', 'corner', 'winter'] },
        { prompt: 'A clock tells the ___', answer: 'time', options: ['time', 'weather', 'news', 'story'] },
        { prompt: 'You cut paper with ___', answer: 'scissors', options: ['scissors', 'spoon', 'brush', 'string'] },
        { prompt: 'Rain falls from ___', answer: 'clouds', options: ['clouds', 'ground', 'trees', 'houses'] },
        { prompt: 'We hear with our ___', answer: 'ears', options: ['ears', 'eyes', 'hands', 'feet'] }
    ],
    
    2: [ // Common phrases
        { prompt: 'Better late than ___', answer: 'never', options: ['never', 'always', 'sometimes', 'soon', 'later'] },
        { prompt: 'A penny saved is a penny ___', answer: 'earned', options: ['earned', 'learned', 'burned', 'turned', 'returned'] },
        { prompt: 'Actions speak louder than ___', answer: 'words', options: ['words', 'sounds', 'thoughts', 'deeds', 'music'] },
        { prompt: 'Easy come, easy ___', answer: 'go', options: ['go', 'do', 'know', 'show', 'grow'] },
        { prompt: 'Time flies when you\'re having ___', answer: 'fun', options: ['fun', 'time', 'lunch', 'trouble', 'work'] },
        { prompt: 'Two heads are better than ___', answer: 'one', options: ['one', 'two', 'three', 'none', 'all'] },
        { prompt: 'Practice makes ___', answer: 'perfect', options: ['perfect', 'progress', 'possible', 'patient', 'pleasant'] },
        { prompt: 'Every cloud has a silver ___', answer: 'lining', options: ['lining', 'color', 'edge', 'shape', 'layer'] }
    ],
    
    3: [ // Context clues
        { prompt: 'She opened her umbrella because it was ___', answer: 'raining', options: ['raining', 'sunny', 'dark', 'windy', 'cold'] },
        { prompt: 'He put on his coat because he felt ___', answer: 'cold', options: ['cold', 'hungry', 'tired', 'happy', 'bored'] },
        { prompt: 'The flowers died because they needed ___', answer: 'water', options: ['water', 'music', 'sleep', 'money', 'time'] },
        { prompt: 'She turned on the lamp because it was ___', answer: 'dark', options: ['dark', 'loud', 'cold', 'early', 'quiet'] },
        { prompt: 'He yawned because he was very ___', answer: 'tired', options: ['tired', 'angry', 'hungry', 'scared', 'happy'] },
        { prompt: 'The baby cried because she was ___', answer: 'hungry', options: ['hungry', 'quiet', 'asleep', 'small', 'dry'] },
        { prompt: 'They cheered because their team ___', answer: 'won', options: ['won', 'lost', 'left', 'sat', 'cried'] },
        { prompt: 'He whispered because the library was ___', answer: 'quiet', options: ['quiet', 'empty', 'new', 'large', 'old'] }
    ],
    
    4: [ // Verb tense
        { prompt: 'Yesterday I ___ to the store', answer: 'went', options: ['went', 'go', 'going', 'gone', 'will go'] },
        { prompt: 'Tomorrow she ___ her friend', answer: 'will visit', options: ['will visit', 'visited', 'visiting', 'visits', 'visit'] },
        { prompt: 'They have already ___ dinner', answer: 'eaten', options: ['eaten', 'eat', 'eating', 'ate', 'eats'] },
        { prompt: 'He ___ the piano every day', answer: 'practices', options: ['practices', 'practiced', 'practicing', 'practice', 'will practice'] },
        { prompt: 'Right now she ___ a book', answer: 'is reading', options: ['is reading', 'read', 'reads', 'was reading', 'will read'] },
        { prompt: 'Last week we ___ a movie', answer: 'watched', options: ['watched', 'watch', 'watching', 'will watch', 'watches'] }
    ],
    
    5: [ // Nuanced meaning
        { prompt: 'He whispered so he wouldn\'t ___ the baby', answer: 'wake', options: ['wake', 'walk', 'wait', 'want', 'wash', 'watch'] },
        { prompt: 'She saved money so she could ___ a car', answer: 'afford', options: ['afford', 'avoid', 'admit', 'adopt', 'adjust', 'advise'] },
        { prompt: 'The detective searched for ___ at the scene', answer: 'evidence', options: ['evidence', 'everyone', 'evening', 'elevator', 'envelope', 'entrance'] },
        { prompt: 'He apologized to ___ his mistake', answer: 'admit', options: ['admit', 'avoid', 'allow', 'apply', 'approve', 'arrive'] },
        { prompt: 'She studied hard to ___ the exam', answer: 'pass', options: ['pass', 'paste', 'pause', 'paint', 'panic', 'party'] },
        { prompt: 'They built a fence to ___ their garden', answer: 'protect', options: ['protect', 'produce', 'promise', 'provide', 'propose', 'promote'] }
    ],
    
    6: [ // Multi-blank (simplified as two related sentences)
        { prompt: 'The ___ boy ate his breakfast quickly', answer: 'hungry', options: ['hungry', 'heavy', 'hollow', 'helpful', 'honest', 'hopeful'] },
        { prompt: 'She felt ___ after winning the award', answer: 'proud', options: ['proud', 'prove', 'process', 'problem', 'promise', 'proper'] },
        { prompt: 'The ___ child played all afternoon', answer: 'energetic', options: ['energetic', 'economic', 'educated', 'effective', 'electric', 'elegant'] },
        { prompt: 'The ___ students finished their work early', answer: 'diligent', options: ['diligent', 'different', 'difficult', 'digital', 'diploma', 'direct'] }
    ],
    
    7: [ // Inference required
        { prompt: 'She grabbed her coat and umbrella, suggesting the weather was ___', answer: 'rainy', options: ['rainy', 'random', 'rapid', 'rarely', 'rather', 'rating'] },
        { prompt: 'He set three places at the table, meaning ___ people would eat', answer: 'three', options: ['three', 'there', 'throw', 'through', 'throat', 'throne'] },
        { prompt: 'She packed sunscreen and swimsuits, planning a trip to the ___', answer: 'beach', options: ['beach', 'branch', 'break', 'breath', 'brick', 'bridge'] },
        { prompt: 'The doctor\'s expression was serious, indicating the news was ___', answer: 'bad', options: ['bad', 'back', 'bag', 'base', 'bath', 'band'] }
    ]
};

// Make exercise data available globally
const ExerciseData = {
    naming: NamingData,
    categories: CategoriesData,
    sentences: SentencesData
};
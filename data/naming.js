/**
 * Picture Naming Exercise Data
 * 7 difficulty levels
 */
const NamingData = {
    1: [ // Common concrete nouns
        { emoji: '🍎', answer: 'apple', options: ['apple', 'orange', 'banana', 'pear'] },
        { emoji: '🏠', answer: 'house', options: ['house', 'building', 'store', 'tent'] },
        { emoji: '🚗', answer: 'car', options: ['car', 'bus', 'truck', 'van'] },
        { emoji: '☀️', answer: 'sun', options: ['sun', 'moon', 'star', 'light'] },
        { emoji: '📚', answer: 'book', options: ['book', 'paper', 'letter', 'card'] },
        { emoji: '🐕', answer: 'dog', options: ['dog', 'cat', 'wolf', 'fox'] },
        { emoji: '🪑', answer: 'chair', options: ['chair', 'table', 'bench', 'stool'] },
        { emoji: '🔑', answer: 'key', options: ['key', 'lock', 'door', 'ring'] },
        { emoji: '👟', answer: 'shoe', options: ['shoe', 'sock', 'boot', 'slipper'] },
        { emoji: '🎂', answer: 'cake', options: ['cake', 'pie', 'bread', 'cookie'] },
        { emoji: '🌳', answer: 'tree', options: ['tree', 'flower', 'bush', 'plant'] },
        { emoji: '✈️', answer: 'airplane', options: ['airplane', 'helicopter', 'bird', 'kite'] },
        { emoji: '⌚', answer: 'watch', options: ['watch', 'clock', 'ring', 'bracelet'] },
        { emoji: '🍕', answer: 'pizza', options: ['pizza', 'pie', 'bread', 'pancake'] },
        { emoji: '🌧️', answer: 'rain', options: ['rain', 'snow', 'cloud', 'storm'] }
    ],
    
    2: [ // Less common objects
        { emoji: '🔧', answer: 'wrench', options: ['wrench', 'hammer', 'screwdriver', 'pliers', 'drill'] },
        { emoji: '🌂', answer: 'umbrella', options: ['umbrella', 'parasol', 'tent', 'cover', 'shade'] },
        { emoji: '🎸', answer: 'guitar', options: ['guitar', 'violin', 'banjo', 'ukulele', 'harp'] },
        { emoji: '🔬', answer: 'microscope', options: ['microscope', 'telescope', 'binoculars', 'magnifier', 'glasses'] },
        { emoji: '🧲', answer: 'magnet', options: ['magnet', 'battery', 'compass', 'metal', 'bolt'] },
        { emoji: '🎺', answer: 'trumpet', options: ['trumpet', 'horn', 'tuba', 'flute', 'clarinet'] },
        { emoji: '🦴', answer: 'bone', options: ['bone', 'stick', 'tooth', 'shell', 'rock'] },
        { emoji: '🧪', answer: 'test tube', options: ['test tube', 'bottle', 'vial', 'jar', 'flask'] },
        { emoji: '🪜', answer: 'ladder', options: ['ladder', 'stairs', 'steps', 'ramp', 'escalator'] },
        { emoji: '🧯', answer: 'fire extinguisher', options: ['fire extinguisher', 'spray can', 'tank', 'bottle', 'cylinder'] },
        { emoji: '🪒', answer: 'razor', options: ['razor', 'knife', 'blade', 'scissors', 'cutter'] },
        { emoji: '🧵', answer: 'thread', options: ['thread', 'string', 'rope', 'wire', 'yarn'] }
    ],
    
    3: [ // Actions (verbs)
        { emoji: '🏃', answer: 'running', options: ['running', 'walking', 'jumping', 'standing', 'sitting'] },
        { emoji: '🏊', answer: 'swimming', options: ['swimming', 'diving', 'floating', 'splashing', 'wading'] },
        { emoji: '😴', answer: 'sleeping', options: ['sleeping', 'resting', 'lying', 'napping', 'dreaming'] },
        { emoji: '🍳', answer: 'cooking', options: ['cooking', 'eating', 'serving', 'cutting', 'mixing'] },
        { emoji: '📖', answer: 'reading', options: ['reading', 'writing', 'studying', 'looking', 'learning'] },
        { emoji: '🎤', answer: 'singing', options: ['singing', 'talking', 'shouting', 'speaking', 'humming'] },
        { emoji: '💃', answer: 'dancing', options: ['dancing', 'jumping', 'moving', 'spinning', 'stepping'] },
        { emoji: '✍️', answer: 'writing', options: ['writing', 'drawing', 'signing', 'marking', 'noting'] },
        { emoji: '🧹', answer: 'sweeping', options: ['sweeping', 'cleaning', 'brushing', 'wiping', 'mopping'] },
        { emoji: '🪴', answer: 'planting', options: ['planting', 'digging', 'growing', 'watering', 'gardening'] }
    ],
    
    4: [ // Similar items - fine distinctions
        { emoji: '☕', answer: 'cup', options: ['cup', 'mug', 'glass', 'bowl', 'pot'] },
        { emoji: '🛋️', answer: 'couch', options: ['couch', 'sofa', 'loveseat', 'chair', 'bench'] },
        { emoji: '⛰️', answer: 'mountain', options: ['mountain', 'hill', 'cliff', 'peak', 'ridge'] },
        { emoji: '🌊', answer: 'wave', options: ['wave', 'water', 'ocean', 'sea', 'tide'] },
        { emoji: '🛤️', answer: 'railroad', options: ['railroad', 'road', 'path', 'track', 'trail'] },
        { emoji: '🧥', answer: 'coat', options: ['coat', 'jacket', 'sweater', 'vest', 'blazer'] },
        { emoji: '🥿', answer: 'flat', options: ['flat', 'loafer', 'slipper', 'sandal', 'sneaker'] },
        { emoji: '📔', answer: 'notebook', options: ['notebook', 'journal', 'diary', 'textbook', 'workbook'] }
    ],
    
    5: [ // Specific vocabulary
        { emoji: '🩺', answer: 'stethoscope', options: ['stethoscope', 'otoscope', 'thermometer', 'syringe', 'bandage', 'probe'] },
        { emoji: '🎻', answer: 'violin', options: ['violin', 'viola', 'cello', 'guitar', 'fiddle', 'bass'] },
        { emoji: '🏛️', answer: 'monument', options: ['monument', 'building', 'temple', 'museum', 'palace', 'landmark'] },
        { emoji: '⚖️', answer: 'scale', options: ['scale', 'balance', 'weight', 'measure', 'meter', 'gauge'] },
        { emoji: '🧭', answer: 'compass', options: ['compass', 'dial', 'gauge', 'meter', 'clock', 'navigation'] },
        { emoji: '🔭', answer: 'telescope', options: ['telescope', 'microscope', 'binoculars', 'periscope', 'lens', 'scope'] }
    ],
    
    6: [ // Compound words & abstract
        { emoji: '🦷', answer: 'toothbrush', options: ['toothbrush', 'toothpaste', 'floss', 'mouthwash', 'brush', 'comb'] },
        { emoji: '🌅', answer: 'sunrise', options: ['sunrise', 'sunset', 'dawn', 'dusk', 'daybreak', 'twilight'] },
        { emoji: '🌈', answer: 'rainbow', options: ['rainbow', 'arch', 'spectrum', 'bow', 'prism', 'colors'] },
        { emoji: '🎆', answer: 'fireworks', options: ['fireworks', 'sparklers', 'explosions', 'rockets', 'flares', 'lights'] },
        { emoji: '🚿', answer: 'showerhead', options: ['showerhead', 'faucet', 'nozzle', 'sprinkler', 'tap', 'spout'] }
    ],
    
    7: [ // Scene descriptions (These would ideally use real images)
        { 
            emoji: '👨‍👩‍👧‍👦', 
            answer: 'family', 
            options: ['family', 'group', 'team', 'crowd', 'people', 'gathering']
        },
        { 
            emoji: '🏖️', 
            answer: 'beach', 
            options: ['beach', 'shore', 'coast', 'seaside', 'waterfront', 'seashore']
        },
        { 
            emoji: '🎪', 
            answer: 'circus', 
            options: ['circus', 'carnival', 'fair', 'festival', 'theater', 'show']
        }
    ]
};
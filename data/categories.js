/**
 * Word Categories Exercise Data
 */
const CategoriesData = {
    1: [ // Concrete, obvious
        { prompt: 'Which is a FRUIT?', answer: 'banana', options: ['banana', 'carrot', 'bread', 'cheese'] },
        { prompt: 'Which is an ANIMAL?', answer: 'elephant', options: ['elephant', 'table', 'river', 'mountain'] },
        { prompt: 'Which is FURNITURE?', answer: 'sofa', options: ['sofa', 'apple', 'shirt', 'pencil'] },
        { prompt: 'Which is a COLOR?', answer: 'blue', options: ['blue', 'chair', 'quick', 'happy'] },
        { prompt: 'Which is CLOTHING?', answer: 'jacket', options: ['jacket', 'hammer', 'coffee', 'window'] },
        { prompt: 'Which is a BODY PART?', answer: 'hand', options: ['hand', 'book', 'tree', 'rain'] },
        { prompt: 'Which is FOOD?', answer: 'pizza', options: ['pizza', 'pencil', 'pillow', 'paper'] },
        { prompt: 'Which is a VEHICLE?', answer: 'bicycle', options: ['bicycle', 'building', 'banana', 'blanket'] },
        { prompt: 'Which is a NUMBER?', answer: 'seven', options: ['seven', 'silver', 'simple', 'single'] },
        { prompt: 'Which is WEATHER?', answer: 'sunny', options: ['sunny', 'sunday', 'sundae', 'sudden'] },
        { prompt: 'Which is a DRINK?', answer: 'water', options: ['water', 'paper', 'plastic', 'metal'] },
        { prompt: 'Which is a TOOL?', answer: 'hammer', options: ['hammer', 'hamster', 'hanger', 'helper'] }
    ],
    
    2: [ // More specific
        { prompt: 'Which is a VEGETABLE?', answer: 'broccoli', options: ['broccoli', 'strawberry', 'chicken', 'bread', 'cheese'] },
        { prompt: 'Which is a BIRD?', answer: 'sparrow', options: ['sparrow', 'squirrel', 'spider', 'snake', 'snail'] },
        { prompt: 'Which is JEWELRY?', answer: 'necklace', options: ['necklace', 'necktie', 'needle', 'napkin', 'newspaper'] },
        { prompt: 'Which is a SPORT?', answer: 'tennis', options: ['tennis', 'tent', 'test', 'text', 'teeth'] },
        { prompt: 'Which is a FLOWER?', answer: 'daisy', options: ['daisy', 'dairy', 'daily', 'delay', 'decay'] },
        { prompt: 'Which is WEATHER?', answer: 'thunder', options: ['thunder', 'thousand', 'thought', 'through', 'thirsty'] },
        { prompt: 'Which is a PLANET?', answer: 'saturn', options: ['saturn', 'satin', 'saddle', 'salmon', 'salad'] },
        { prompt: 'Which is an INSECT?', answer: 'beetle', options: ['beetle', 'beagle', 'beaver', 'beast', 'beauty'] },
        { prompt: 'Which is a MUSICAL INSTRUMENT?', answer: 'clarinet', options: ['clarinet', 'cabinet', 'climate', 'clinic', 'client'] }
    ],
    
    3: [ // Abstract categories
        { prompt: 'Which is a FEELING?', answer: 'anxious', options: ['anxious', 'ancient', 'angular', 'antenna', 'antique', 'anthem'] },
        { prompt: 'Which is an OCCUPATION?', answer: 'architect', options: ['architect', 'artichoke', 'article', 'artificial', 'artillery', 'artifact'] },
        { prompt: 'Which is a QUALITY?', answer: 'generous', options: ['generous', 'generate', 'general', 'genuine', 'genetic', 'genius'] },
        { prompt: 'Which is a TIME PERIOD?', answer: 'century', options: ['century', 'central', 'center', 'certain', 'ceremony', 'census'] },
        { prompt: 'Which is a SHAPE?', answer: 'cylinder', options: ['cylinder', 'cycle', 'cyclone', 'cyclist', 'cynic', 'cymbal'] },
        { prompt: 'Which is an EMOTION?', answer: 'jealousy', options: ['jealousy', 'jeopardy', 'jersey', 'jewelry', 'journey', 'judgment'] }
    ],
    
    4: [ // Synonyms
        { prompt: 'Which means HAPPY?', answer: 'elated', options: ['elated', 'elevated', 'elaborate', 'elastic', 'elderly', 'elegant'] },
        { prompt: 'Which means TIRED?', answer: 'exhausted', options: ['exhausted', 'exhibited', 'expanded', 'expected', 'exported', 'expressed'] },
        { prompt: 'Which means ANGRY?', answer: 'furious', options: ['furious', 'famous', 'foreign', 'former', 'formal', 'fortune'] },
        { prompt: 'Which means FAST?', answer: 'rapid', options: ['rapid', 'random', 'ranger', 'ransom', 'rascal', 'rather'] },
        { prompt: 'Which means SMALL?', answer: 'tiny', options: ['tiny', 'tidy', 'timid', 'tissue', 'title', 'toast'] },
        { prompt: 'Which means BEAUTIFUL?', answer: 'gorgeous', options: ['gorgeous', 'gracious', 'grateful', 'gradually', 'grammar', 'granite'] }
    ],
    
    5: [ // Odd one out
        { prompt: 'Which does NOT belong?', answer: 'carrot', options: ['rose', 'tulip', 'carrot', 'daisy', 'lily'] },
        { prompt: 'Which does NOT belong?', answer: 'jupiter', options: ['london', 'paris', 'jupiter', 'tokyo', 'berlin'] },
        { prompt: 'Which does NOT belong?', answer: 'violin', options: ['piano', 'drums', 'violin', 'trumpet', 'flute'] },
        { prompt: 'Which does NOT belong?', answer: 'cotton', options: ['wool', 'silk', 'cotton', 'leather', 'denim'] },
        { prompt: 'Which does NOT belong?', answer: 'walk', options: ['whisper', 'shout', 'walk', 'sing', 'speak'] }
    ],
    
    6: [ // Best fit
        { prompt: 'Best describes SIZE?', answer: 'enormous', options: ['enormous', 'energetic', 'essential', 'eventual', 'evident', 'eternal'] },
        { prompt: 'Best describes SPEED?', answer: 'swift', options: ['swift', 'sweet', 'swim', 'switch', 'swear', 'swell'] },
        { prompt: 'Best describes TEMPERATURE?', answer: 'freezing', options: ['freezing', 'frequent', 'fresh', 'friendly', 'frighten', 'friction'] },
        { prompt: 'Best describes STRENGTH?', answer: 'mighty', options: ['mighty', 'mainly', 'merely', 'mostly', 'monthly', 'morally'] }
    ],
    
    7: [ // Antonyms
        { prompt: 'Opposite of ANCIENT?', answer: 'modern', options: ['modern', 'modest', 'moment', 'monitor', 'monster', 'monthly'] },
        { prompt: 'Opposite of GENEROUS?', answer: 'selfish', options: ['selfish', 'serious', 'service', 'several', 'shelter', 'silence'] },
        { prompt: 'Opposite of PERMANENT?', answer: 'temporary', options: ['temporary', 'tendency', 'terminal', 'terrible', 'territory', 'terrific'] },
        { prompt: 'Opposite of ARTIFICIAL?', answer: 'natural', options: ['natural', 'national', 'navigate', 'negative', 'neighbor', 'network'] }
    ]
};
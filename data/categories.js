/**
 * Word Categories Exercise Data
 */
const CategoriesData = [
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
        { prompt: 'Which is a TOOL?', answer: 'hammer', options: ['hammer', 'hamster', 'hanger', 'helper'] },
        { prompt: 'Which is a VEGETABLE?', answer: 'broccoli', options: ['broccoli', 'strawberry', 'chicken', 'bread', 'cheese'] },
        { prompt: 'Which is a BIRD?', answer: 'sparrow', options: ['sparrow', 'squirrel', 'spider', 'snake', 'snail'] },
        { prompt: 'Which is JEWELRY?', answer: 'necklace', options: ['necklace', 'necktie', 'needle', 'napkin', 'newspaper'] },
        { prompt: 'Which is a SPORT?', answer: 'tennis', options: ['tennis', 'tent', 'test', 'text', 'teeth'] },
        { prompt: 'Which is a FLOWER?', answer: 'daisy', options: ['daisy', 'dairy', 'daily', 'delay', 'decay'] },
        { prompt: 'Which is WEATHER?', answer: 'thunder', options: ['thunder', 'thousand', 'thought', 'through', 'thirsty'] },
        { prompt: 'Which is a PLANET?', answer: 'saturn', options: ['saturn', 'satin', 'saddle', 'salmon', 'salad'] },
        { prompt: 'Which is an INSECT?', answer: 'beetle', options: ['beetle', 'beagle', 'beaver', 'beast', 'beauty'] },
        { prompt: 'Which is a MUSICAL INSTRUMENT?', answer: 'clarinet', options: ['clarinet', 'cabinet', 'climate', 'clinic', 'client'] },
        { prompt: 'Which is a FEELING?', answer: 'anxious', options: ['anxious', 'ancient', 'angular', 'antenna', 'antique', 'anthem'] },
        { prompt: 'Which is an OCCUPATION?', answer: 'architect', options: ['architect', 'artichoke', 'article', 'artificial', 'artillery', 'artifact'] },
        { prompt: 'Which is a QUALITY?', answer: 'generous', options: ['generous', 'generate', 'general', 'genuine', 'genetic', 'genius'] },
        { prompt: 'Which is a TIME PERIOD?', answer: 'century', options: ['century', 'central', 'center', 'certain', 'ceremony', 'census'] },
        { prompt: 'Which is a SHAPE?', answer: 'cylinder', options: ['cylinder', 'cycle', 'cyclone', 'cyclist', 'cynic', 'cymbal'] },
        { prompt: 'Which is an EMOTION?', answer: 'jealousy', options: ['jealousy', 'jeopardy', 'jersey', 'jewelry', 'journey', 'judgment'] },
        { prompt: 'Which means HAPPY?', answer: 'elated', options: ['elated', 'elevated', 'elaborate', 'elastic', 'elderly', 'elegant'] },
        { prompt: 'Which means TIRED?', answer: 'exhausted', options: ['exhausted', 'exhibited', 'expanded', 'expected', 'exported', 'expressed'] },
        { prompt: 'Which means ANGRY?', answer: 'furious', options: ['furious', 'famous', 'foreign', 'former', 'formal', 'fortune'] },
        { prompt: 'Which means FAST?', answer: 'rapid', options: ['rapid', 'random', 'ranger', 'ransom', 'rascal', 'rather'] },
        { prompt: 'Which means SMALL?', answer: 'tiny', options: ['tiny', 'tidy', 'timid', 'tissue', 'title', 'toast'] },
        { prompt: 'Which means BEAUTIFUL?', answer: 'gorgeous', options: ['gorgeous', 'gracious', 'grateful', 'gradually', 'grammar', 'granite'] },
        { prompt: 'Which does NOT belong?', answer: 'carrot', options: ['rose', 'tulip', 'carrot', 'daisy', 'lily'] },
        { prompt: 'Which does NOT belong?', answer: 'jupiter', options: ['london', 'paris', 'jupiter', 'tokyo', 'berlin'] },
        { prompt: 'Which does NOT belong?', answer: 'violin', options: ['piano', 'drums', 'violin', 'trumpet', 'flute'] },
        { prompt: 'Which does NOT belong?', answer: 'cotton', options: ['wool', 'silk', 'cotton', 'leather', 'denim'] },
        { prompt: 'Which does NOT belong?', answer: 'walk', options: ['whisper', 'shout', 'walk', 'sing', 'speak'] },
        { prompt: 'Best describes SIZE?', answer: 'enormous', options: ['enormous', 'energetic', 'essential', 'eventual', 'evident', 'eternal'] },
        { prompt: 'Best describes SPEED?', answer: 'swift', options: ['swift', 'sweet', 'swim', 'switch', 'swear', 'swell'] },
        { prompt: 'Best describes TEMPERATURE?', answer: 'freezing', options: ['freezing', 'frequent', 'fresh', 'friendly', 'frighten', 'friction'] },
        { prompt: 'Best describes STRENGTH?', answer: 'mighty', options: ['mighty', 'mainly', 'merely', 'mostly', 'monthly', 'morally'] },
        { prompt: 'Opposite of ANCIENT?', answer: 'modern', options: ['modern', 'modest', 'moment', 'monitor', 'monster', 'monthly'] },
        { prompt: 'Opposite of GENEROUS?', answer: 'selfish', options: ['selfish', 'serious', 'service', 'several', 'shelter', 'silence'] },
        { prompt: 'Opposite of PERMANENT?', answer: 'temporary', options: ['temporary', 'tendency', 'terminal', 'terrible', 'territory', 'terrific'] },
        { prompt: 'Opposite of ARTIFICIAL?', answer: 'natural', options: ['natural', 'national', 'navigate', 'negative', 'neighbor', 'network'] },
        { prompt: 'Which one is a FRUIT?', answer: 'apple', options: ['apple', 'carrot', 'bread', 'milk'] },
        { prompt: 'Which one is an ANIMAL?', answer: 'elephant', options: ['elephant', 'table', 'car', 'shoe'] },
        { prompt: 'Which one is CLOTHING?', answer: 'shirt', options: ['shirt', 'apple', 'chair', 'book'] },
        { prompt: 'Which one is FURNITURE?', answer: 'couch', options: ['couch', 'banana', 'dog', 'rain'] },
        { prompt: 'Which one is a VEHICLE?', answer: 'bicycle', options: ['bicycle', 'tree', 'phone', 'cup'] },
        { prompt: 'Which one is a COLOR?', answer: 'blue', options: ['blue', 'chair', 'happy', 'run'] },
        { prompt: 'Which one is WEATHER?', answer: 'sunny', options: ['sunny', 'table', 'dog', 'book'] },
        { prompt: 'Which one is a BODY PART?', answer: 'hand', options: ['hand', 'car', 'apple', 'shirt'] },
        { prompt: 'Which one is a FOOD?', answer: 'sandwich', options: ['sandwich', 'lamp', 'clock', 'shoe'] },
        { prompt: 'Which one is a DRINK?', answer: 'water', options: ['water', 'chair', 'book', 'shirt'] },
        { prompt: 'Which one is a TOOL?', answer: 'hammer', options: ['hammer', 'apple', 'dog', 'cloud'] },
        { prompt: 'Which one is a ROOM?', answer: 'kitchen', options: ['kitchen', 'car', 'tree', 'shoe'] },
        { prompt: 'Which one is a FEELING?', answer: 'happy', options: ['happy', 'table', 'blue', 'run'] },
        { prompt: 'Which one is an ACTION?', answer: 'running', options: ['running', 'chair', 'apple', 'blue'] },
        { prompt: 'Which one is a PLANT?', answer: 'flower', options: ['flower', 'dog', 'car', 'book'] },
        { prompt: 'Which one is a JOB?', answer: 'doctor', options: ['doctor', 'apple', 'chair', 'blue'] },
        { prompt: 'Which one is a SEASON?', answer: 'winter', options: ['winter', 'table', 'dog', 'shirt'] },
        { prompt: 'Which one is a DAY?', answer: 'monday', options: ['monday', 'apple', 'blue', 'chair'] },
        { prompt: 'Which one is a NUMBER?', answer: 'seven', options: ['seven', 'dog', 'run', 'happy'] },
        { prompt: 'Which one is a SHAPE?', answer: 'circle', options: ['circle', 'apple', 'dog', 'run'] },
  {
    "prompt": "Which is FOOD?",
    "answer": "corn",
    "options": [
      "corn",
      "pencil",
      "plate",
      "man"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "apple",
    "options": [
      "apple",
      "pencil",
      "butterfly",
      "snow"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "corn",
    "options": [
      "onion",
      "motorcycle",
      "corn",
      "plate"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "orange",
    "options": [
      "hotel",
      "orange",
      "flower",
      "mountain"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "banana",
    "options": [
      "singing",
      "banana",
      "bear",
      "mountain"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "strawberry",
    "options": [
      "rabbit",
      "water",
      "cooking",
      "strawberry"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "milk",
    "options": [
      "cookie",
      "milk",
      "monkey",
      "cup"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "soup",
    "options": [
      "icecream",
      "moon",
      "soup",
      "brain"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "soup",
    "options": [
      "cup",
      "box",
      "school",
      "soup"
    ]
  },
  {
    "prompt": "Which is FOOD?",
    "answer": "burger",
    "options": [
      "mountain",
      "baby",
      "burger",
      "photographing"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "frog",
    "options": [
      "dress",
      "frog",
      "water",
      "bank"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "horse",
    "options": [
      "horse",
      "taxi",
      "peach",
      "doctor"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "frog",
    "options": [
      "box",
      "lettuce",
      "house",
      "frog"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "dog",
    "options": [
      "dog",
      "leg",
      "bus",
      "star"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "bird",
    "options": [
      "bird",
      "tooth",
      "corn",
      "owl"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "tiger",
    "options": [
      "tiger",
      "bone",
      "mouth",
      "nose"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "cow",
    "options": [
      "sun",
      "boat",
      "cow",
      "paper"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "tiger",
    "options": [
      "tiger",
      "swimming",
      "spoon",
      "potato"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "cat",
    "options": [
      "cat",
      "potato",
      "watch",
      "lemon"
    ]
  },
  {
    "prompt": "Which is an ANIMAL?",
    "answer": "chicken",
    "options": [
      "chicken",
      "zebra",
      "mountain",
      "eagle"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "car",
    "options": [
      "writing",
      "lizard",
      "car",
      "mouse"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "plane",
    "options": [
      "eye",
      "fox",
      "horse",
      "plane"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "helicopter",
    "options": [
      "owl",
      "helicopter",
      "paper",
      "reading"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "scooter",
    "options": [
      "scooter",
      "shirt",
      "television",
      "baby"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "motorcycle",
    "options": [
      "storm",
      "worker",
      "motorcycle",
      "mouse"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "plane",
    "options": [
      "coat",
      "plane",
      "cheese",
      "picture"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "taxi",
    "options": [
      "coat",
      "taxi",
      "tiger",
      "gift"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "car",
    "options": [
      "chocolate",
      "mountain",
      "car",
      "lizard"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "helicopter",
    "options": [
      "helicopter",
      "sun",
      "bird",
      "cup"
    ]
  },
  {
    "prompt": "Which is a VEHICLE?",
    "answer": "bike",
    "options": [
      "tiger",
      "bike",
      "gift",
      "snake"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "sock",
    "options": [
      "rocket",
      "dog",
      "sock",
      "soup"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "sock",
    "options": [
      "walking",
      "rainbow",
      "sock",
      "cake"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "glasses",
    "options": [
      "glasses",
      "watch",
      "moon",
      "baby"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "dress",
    "options": [
      "sushi",
      "dress",
      "donut",
      "butterfly"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "coat",
    "options": [
      "coat",
      "apple",
      "strawberry",
      "taxi"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "shirt",
    "options": [
      "corn",
      "shirt",
      "man",
      "flower"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "sock",
    "options": [
      "sock",
      "peach",
      "walking",
      "fries"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "sock",
    "options": [
      "sock",
      "paper",
      "elephant",
      "singing"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "hat",
    "options": [
      "plane",
      "butterfly",
      "hat",
      "mountain"
    ]
  },
  {
    "prompt": "Which is CLOTHING?",
    "answer": "dress",
    "options": [
      "door",
      "dress",
      "ocean",
      "snake"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "hand",
    "options": [
      "rabbit",
      "hand",
      "bed",
      "fox"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "foot",
    "options": [
      "elephant",
      "foot",
      "swimming",
      "key"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "heart",
    "options": [
      "banana",
      "duck",
      "heart",
      "cat"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "heart",
    "options": [
      "heart",
      "onion",
      "bank",
      "chicken"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "foot",
    "options": [
      "foot",
      "water",
      "cherry",
      "man"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "heart",
    "options": [
      "heart",
      "grandfather",
      "reading",
      "door"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "eye",
    "options": [
      "eye",
      "reading",
      "broccoli",
      "owl"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "eye",
    "options": [
      "eye",
      "truck",
      "corn",
      "lizard"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "hand",
    "options": [
      "car",
      "chocolate",
      "sock",
      "hand"
    ]
  },
  {
    "prompt": "Which is a BODY PART?",
    "answer": "brain",
    "options": [
      "soup",
      "brain",
      "plane",
      "flower"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "spoon",
    "options": [
      "banana",
      "moon",
      "spoon",
      "police"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "clock",
    "options": [
      "pants",
      "house",
      "clock",
      "zebra"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "cup",
    "options": [
      "cup",
      "boy",
      "baby",
      "lizard"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "door",
    "options": [
      "rain",
      "burger",
      "door",
      "frog"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "knife",
    "options": [
      "pants",
      "knife",
      "tiger",
      "bear"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "cup",
    "options": [
      "storm",
      "taxi",
      "frog",
      "cup"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "bed",
    "options": [
      "coffee",
      "school",
      "rocket",
      "bed"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "phone",
    "options": [
      "cherry",
      "phone",
      "scooter",
      "cow"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "phone",
    "options": [
      "grapes",
      "climbing",
      "phone",
      "coat"
    ]
  },
  {
    "prompt": "Which is FURNITURE?",
    "answer": "phone",
    "options": [
      "chocolate",
      "phone",
      "eagle",
      "tea"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "flower",
    "options": [
      "paper",
      "baby",
      "flower",
      "juice"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "mountain",
    "options": [
      "nose",
      "egg",
      "mountain",
      "monkey"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "flower",
    "options": [
      "broccoli",
      "pizza",
      "tiger",
      "flower"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "mountain",
    "options": [
      "apple",
      "mountain",
      "potato",
      "strawberry"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "star",
    "options": [
      "star",
      "writing",
      "elephant",
      "reading"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "snow",
    "options": [
      "cookie",
      "orange",
      "cooking",
      "snow"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "star",
    "options": [
      "star",
      "bed",
      "office",
      "house"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "mountain",
    "options": [
      "mountain",
      "boy",
      "egg",
      "computer"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "ocean",
    "options": [
      "letter",
      "computer",
      "ocean",
      "dancing"
    ]
  },
  {
    "prompt": "Which is from NATURE?",
    "answer": "ocean",
    "options": [
      "sushi",
      "ocean",
      "broccoli",
      "horse"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "hotel",
    "options": [
      "snow",
      "hotel",
      "ear",
      "duck"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "hotel",
    "options": [
      "hotel",
      "man",
      "nose",
      "rainbow"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "hospital",
    "options": [
      "water",
      "knife",
      "ocean",
      "hospital"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "house",
    "options": [
      "cow",
      "house",
      "rainbow",
      "lemon"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "hospital",
    "options": [
      "hospital",
      "flower",
      "tea",
      "soup"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "church",
    "options": [
      "cheese",
      "church",
      "monkey",
      "woman"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "house",
    "options": [
      "police",
      "house",
      "car",
      "burger"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "hotel",
    "options": [
      "elephant",
      "tooth",
      "watch",
      "hotel"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "house",
    "options": [
      "shoe",
      "house",
      "elephant",
      "box"
    ]
  },
  {
    "prompt": "Which is a PLACE?",
    "answer": "house",
    "options": [
      "coat",
      "chicken",
      "house",
      "scooter"
    ]
  }
]

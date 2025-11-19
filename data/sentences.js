/**
 * Sentence Completion Exercise Data
 */
const SentencesData = [ 
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
        { prompt: 'We hear with our ___', answer: 'ears', options: ['ears', 'eyes', 'hands', 'feet'] },
        { prompt: 'Better late than ___', answer: 'never', options: ['never', 'always', 'sometimes', 'soon', 'later'] },
        { prompt: 'A penny saved is a penny ___', answer: 'earned', options: ['earned', 'learned', 'burned', 'turned', 'returned'] },
        { prompt: 'Actions speak louder than ___', answer: 'words', options: ['words', 'sounds', 'thoughts', 'deeds', 'music'] },
        { prompt: 'Easy come, easy ___', answer: 'go', options: ['go', 'do', 'know', 'show', 'grow'] },
        { prompt: 'Time flies when you\'re having ___', answer: 'fun', options: ['fun', 'time', 'lunch', 'trouble', 'work'] },
        { prompt: 'Two heads are better than ___', answer: 'one', options: ['one', 'two', 'three', 'none', 'all'] },
        { prompt: 'Practice makes ___', answer: 'perfect', options: ['perfect', 'progress', 'possible', 'patient', 'pleasant'] },
        { prompt: 'Every cloud has a silver ___', answer: 'lining', options: ['lining', 'color', 'edge', 'shape', 'layer'] },
        { prompt: 'She opened her umbrella because it was ___', answer: 'raining', options: ['raining', 'sunny', 'dark', 'windy', 'cold'] },
        { prompt: 'He put on his coat because he felt ___', answer: 'cold', options: ['cold', 'hungry', 'tired', 'happy', 'bored'] },
        { prompt: 'The flowers died because they needed ___', answer: 'water', options: ['water', 'music', 'sleep', 'money', 'time'] },
        { prompt: 'She turned on the lamp because it was ___', answer: 'dark', options: ['dark', 'loud', 'cold', 'early', 'quiet'] },
        { prompt: 'He yawned because he was very ___', answer: 'tired', options: ['tired', 'angry', 'hungry', 'scared', 'happy'] },
        { prompt: 'The baby cried because she was ___', answer: 'hungry', options: ['hungry', 'quiet', 'asleep', 'small', 'dry'] },
        { prompt: 'They cheered because their team ___', answer: 'won', options: ['won', 'lost', 'left', 'sat', 'cried'] },
        { prompt: 'He whispered because the library was ___', answer: 'quiet', options: ['quiet', 'empty', 'new', 'large', 'old'] },
        { prompt: 'Yesterday I ___ to the store', answer: 'went', options: ['went', 'go', 'going', 'gone', 'will go'] },
        { prompt: 'Tomorrow she ___ her friend', answer: 'will visit', options: ['will visit', 'visited', 'visiting', 'visits', 'visit'] },
        { prompt: 'They have already ___ dinner', answer: 'eaten', options: ['eaten', 'eat', 'eating', 'ate', 'eats'] },
        { prompt: 'He ___ the piano every day', answer: 'practices', options: ['practices', 'practiced', 'practicing', 'practice', 'will practice'] },
        { prompt: 'Right now she ___ a book', answer: 'is reading', options: ['is reading', 'read', 'reads', 'was reading', 'will read'] },
        { prompt: 'Last week we ___ a movie', answer: 'watched', options: ['watched', 'watch', 'watching', 'will watch', 'watches'] },
        { prompt: 'He whispered so he wouldn\'t ___ the baby', answer: 'wake', options: ['wake', 'walk', 'wait', 'want', 'wash', 'watch'] },
        { prompt: 'She saved money so she could ___ a car', answer: 'afford', options: ['afford', 'avoid', 'admit', 'adopt', 'adjust', 'advise'] },
        { prompt: 'The detective searched for ___ at the scene', answer: 'evidence', options: ['evidence', 'everyone', 'evening', 'elevator', 'envelope', 'entrance'] },
        { prompt: 'He apologized to ___ his mistake', answer: 'admit', options: ['admit', 'avoid', 'allow', 'apply', 'approve', 'arrive'] },
        { prompt: 'She studied hard to ___ the exam', answer: 'pass', options: ['pass', 'paste', 'pause', 'paint', 'panic', 'party'] },
        { prompt: 'They built a fence to ___ their garden', answer: 'protect', options: ['protect', 'produce', 'promise', 'provide', 'propose', 'promote'] },
        { prompt: 'The ___ boy ate his breakfast quickly', answer: 'hungry', options: ['hungry', 'heavy', 'hollow', 'helpful', 'honest', 'hopeful'] },
        { prompt: 'She felt ___ after winning the award', answer: 'proud', options: ['proud', 'prove', 'process', 'problem', 'promise', 'proper'] },
        { prompt: 'The ___ child played all afternoon', answer: 'energetic', options: ['energetic', 'economic', 'educated', 'effective', 'electric', 'elegant'] },
        { prompt: 'The ___ students finished their work early', answer: 'diligent', options: ['diligent', 'different', 'difficult', 'digital', 'diploma', 'direct'] },
        { prompt: 'She grabbed her coat and umbrella, suggesting the weather was ___', answer: 'rainy', options: ['rainy', 'random', 'rapid', 'rarely', 'rather', 'rating'] },
        { prompt: 'He set three places at the table, meaning ___ people would eat', answer: 'three', options: ['three', 'there', 'throw', 'through', 'throat', 'throne'] },
        { prompt: 'She packed sunscreen and swimsuits, planning a trip to the ___', answer: 'beach', options: ['beach', 'branch', 'break', 'breath', 'brick', 'bridge'] },
        { prompt: 'The doctor\'s expression was serious, indicating the news was ___', answer: 'bad', options: ['bad', 'back', 'bag', 'base', 'bath', 'band'] },
        { prompt: 'I drink ___ in the morning.', answer: 'coffee', options: ['coffee', 'chair', 'book', 'car'] },
        { prompt: 'The sky is ___.', answer: 'blue', options: ['blue', 'running', 'eating', 'chair'] },
        { prompt: 'I sleep in a ___.', answer: 'bed', options: ['bed', 'car', 'apple', 'phone'] },
        { prompt: 'We eat with a ___ and fork.', answer: 'knife', options: ['knife', 'chair', 'book', 'shoe'] },
        { prompt: 'The dog likes to ___.', answer: 'bark', options: ['bark', 'blue', 'table', 'apple'] },
        { prompt: 'I wash my hands with ___.', answer: 'soap', options: ['soap', 'book', 'chair', 'car'] },
        { prompt: 'The sun is very ___.', answer: 'bright', options: ['bright', 'table', 'running', 'apple'] },
        { prompt: 'I tell time with a ___.', answer: 'clock', options: ['clock', 'apple', 'dog', 'blue'] },
        { prompt: 'We sit on a ___.', answer: 'chair', options: ['chair', 'apple', 'cloud', 'phone'] },
        { prompt: 'Birds can ___.', answer: 'fly', options: ['fly', 'table', 'blue', 'apple'] },
        { prompt: 'I brush my ___ every day.', answer: 'teeth', options: ['teeth', 'car', 'book', 'chair'] },
        { prompt: 'The cat says ___.', answer: 'meow', options: ['meow', 'table', 'blue', 'run'] },
        { prompt: 'We read a ___.', answer: 'book', options: ['book', 'car', 'apple', 'blue'] },
        { prompt: 'I wear ___ on my feet.', answer: 'shoes', options: ['shoes', 'hat', 'gloves', 'shirt'] },
        { prompt: 'The ___ shines at night.', answer: 'moon', options: ['moon', 'table', 'apple', 'car'] },
        { prompt: 'We open the ___ to go outside.', answer: 'door', options: ['door', 'apple', 'book', 'chair'] },
        { prompt: 'I use a ___ to call people.', answer: 'phone', options: ['phone', 'apple', 'chair', 'dog'] },
        { prompt: 'Rain falls from the ___.', answer: 'clouds', options: ['clouds', 'table', 'car', 'shoe'] },
        { prompt: 'We cook food in the ___.', answer: 'kitchen', options: ['kitchen', 'car', 'book', 'shoe'] },
        { prompt: 'A fish lives in ___.', answer: 'water', options: ['water', 'chair', 'book', 'car'] },
  {
    "prompt": "I drink ___ in the morning",
    "answer": "coffee",
    "options": [
      "coffee",
      "chair",
      "book",
      "shoe"
    ]
  },
  {
    "prompt": "The sky is ___",
    "answer": "blue",
    "options": [
      "blue",
      "eating",
      "heavy",
      "quick"
    ]
  },
  {
    "prompt": "We sleep in a ___",
    "answer": "bed",
    "options": [
      "bed",
      "car",
      "apple",
      "cloud"
    ]
  },
  {
    "prompt": "Birds can ___",
    "answer": "fly",
    "options": [
      "fly",
      "swim",
      "read",
      "drive"
    ]
  },
  {
    "prompt": "Fish live in ___",
    "answer": "water",
    "options": [
      "water",
      "trees",
      "cars",
      "beds"
    ]
  },
  {
    "prompt": "The sun is ___",
    "answer": "bright",
    "options": [
      "bright",
      "dark",
      "wet",
      "cold"
    ]
  },
  {
    "prompt": "Ice is ___",
    "answer": "cold",
    "options": [
      "cold",
      "hot",
      "soft",
      "loud"
    ]
  },
  {
    "prompt": "We see with our ___",
    "answer": "eyes",
    "options": [
      "eyes",
      "ears",
      "hands",
      "feet"
    ]
  },
  {
    "prompt": "We hear with our ___",
    "answer": "ears",
    "options": [
      "ears",
      "eyes",
      "nose",
      "mouth"
    ]
  },
  {
    "prompt": "A dog has four ___",
    "answer": "legs",
    "options": [
      "legs",
      "wings",
      "arms",
      "wheels"
    ]
  },
  {
    "prompt": "Roses are ___",
    "answer": "red",
    "options": [
      "red",
      "loud",
      "fast",
      "heavy"
    ]
  },
  {
    "prompt": "Sugar is ___",
    "answer": "sweet",
    "options": [
      "sweet",
      "sour",
      "salty",
      "bitter"
    ]
  },
  {
    "prompt": "The grass is ___",
    "answer": "green",
    "options": [
      "green",
      "purple",
      "orange",
      "pink"
    ]
  },
  {
    "prompt": "We write with a ___",
    "answer": "pen",
    "options": [
      "pen",
      "spoon",
      "shoe",
      "hat"
    ]
  },
  {
    "prompt": "A clock tells ___",
    "answer": "time",
    "options": [
      "time",
      "stories",
      "jokes",
      "lies"
    ]
  },
  {
    "prompt": "Rain falls from ___",
    "answer": "clouds",
    "options": [
      "clouds",
      "ground",
      "trees",
      "houses"
    ]
  },
  {
    "prompt": "We cook in the ___",
    "answer": "kitchen",
    "options": [
      "kitchen",
      "bedroom",
      "garage",
      "attic"
    ]
  },
  {
    "prompt": "Books are for ___",
    "answer": "reading",
    "options": [
      "reading",
      "eating",
      "wearing",
      "throwing"
    ]
  },
  {
    "prompt": "Shoes go on your ___",
    "answer": "feet",
    "options": [
      "feet",
      "hands",
      "head",
      "ears"
    ]
  },
  {
    "prompt": "We brush our ___",
    "answer": "teeth",
    "options": [
      "teeth",
      "shoes",
      "cars",
      "walls"
    ]
  },
  {
    "prompt": "An _____ a day keeps the doctor away",
    "answer": "apple",
    "options": [
      "apple",
      "pizza",
      "burger",
      "egg"
    ]
  },
  {
    "prompt": "Every _____ has its day",
    "answer": "dog",
    "options": [
      "tiger",
      "elephant",
      "dog",
      "cat"
    ]
  },
  {
    "prompt": "Curiosity killed the _____",
    "answer": "cat",
    "options": [
      "cat",
      "horse",
      "sheep",
      "cow"
    ]
  },
  {
    "prompt": "A _____ in the hand is worth two in the bush",
    "answer": "bird",
    "options": [
      "bird",
      "cow",
      "pig",
      "elephant"
    ]
  },
  {
    "prompt": "There are plenty of _____ in the sea",
    "answer": "fish",
    "options": [
      "cow",
      "mouse",
      "fish",
      "elephant"
    ]
  },
  {
    "prompt": "Don't look a gift _____ in the mouth",
    "answer": "horse",
    "options": [
      "dog",
      "rabbit",
      "horse",
      "sheep"
    ]
  },
  {
    "prompt": "Still _____s run deep",
    "answer": "water",
    "options": [
      "water",
      "key",
      "ring",
      "picture"
    ]
  },
  {
    "prompt": "Here comes the _____",
    "answer": "sun",
    "options": [
      "cloud",
      "sun",
      "beach",
      "tree"
    ]
  },
  {
    "prompt": "Once in a blue _____",
    "answer": "moon",
    "options": [
      "moon",
      "snow",
      "mountain",
      "beach"
    ]
  },
  {
    "prompt": "Save for a _____y day",
    "answer": "rain",
    "options": [
      "mountain",
      "beach",
      "rain",
      "tree"
    ]
  },
  {
    "prompt": "A piece of _____",
    "answer": "cake",
    "options": [
      "orange",
      "banana",
      "cake",
      "pizza"
    ]
  },
  {
    "prompt": "Our daily _____",
    "answer": "bread",
    "options": [
      "pasta",
      "burger",
      "banana",
      "bread"
    ]
  },
  {
    "prompt": "Walking on _____shells",
    "answer": "egg",
    "options": [
      "banana",
      "cheese",
      "coffee",
      "egg"
    ]
  },
  {
    "prompt": "Don't cry over spilled _____",
    "answer": "milk",
    "options": [
      "pizza",
      "milk",
      "juice",
      "bread"
    ]
  },
  {
    "prompt": "Say _____!",
    "answer": "cheese",
    "options": [
      "cheese",
      "bread",
      "corn",
      "juice"
    ]
  },
  {
    "prompt": "Lend a _____",
    "answer": "hand",
    "options": [
      "foot",
      "hand",
      "heart",
      "leg"
    ]
  },
  {
    "prompt": "Keep an _____ on it",
    "answer": "eye",
    "options": [
      "brain",
      "hand",
      "eye",
      "ear"
    ]
  },
  {
    "prompt": "Follow your _____",
    "answer": "heart",
    "options": [
      "foot",
      "leg",
      "ear",
      "heart"
    ]
  },
  {
    "prompt": "Put your best _____ forward",
    "answer": "foot",
    "options": [
      "ear",
      "foot",
      "tooth",
      "mouth"
    ]
  },
  {
    "prompt": "Don't judge a _____ by its cover",
    "answer": "book",
    "options": [
      "hotdog",
      "fox",
      "gift",
      "book"
    ]
  },
  {
    "prompt": "When one _____ closes",
    "answer": "door",
    "options": [
      "door",
      "cup",
      "plate",
      "computer"
    ]
  },
  {
    "prompt": "The _____ to success",
    "answer": "key",
    "options": [
      "ring",
      "key",
      "photographing",
      "grandmother"
    ]
  },
  {
    "prompt": "Have a _____",
    "answer": "ball",
    "options": [
      "paper",
      "ball",
      "watch",
      "cherry"
    ]
  },
  {
    "prompt": "_____ talks",
    "answer": "money",
    "options": [
      "rainbow",
      "grandmother",
      "money",
      "owl"
    ]
  },
  {
    "prompt": "_____ at the end of the tunnel",
    "answer": "light",
    "options": [
      "broccoli",
      "light",
      "icecream",
      "pencil"
    ]
  },
  {
    "prompt": "Can't see the forest for the _____s",
    "answer": "tree",
    "options": [
      "tree",
      "cloud",
      "star",
      "ocean"
    ]
  }
]


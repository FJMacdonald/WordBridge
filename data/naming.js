/**
 * Picture Naming Exercise Data
 * 7 difficulty levels
 */
const NamingData = [
    // Emoji-based (simple, always available)
    { type: 'emoji', emoji: '🍎', answer: 'apple', options: ['apple', 'orange', 'banana', 'pear'] },
    { type: 'emoji', emoji: '🏠', answer: 'house', options: ['house', 'building', 'store', 'tent'] },
    { type: 'emoji', emoji: '🚗', answer: 'car', options: ['car', 'bus', 'truck', 'van'] },
    { type: 'emoji', emoji: '☀️', answer: 'sun', options: ['sun', 'moon', 'star', 'light'] },
    { type: 'emoji', emoji: '📚', answer: 'book', options: ['book', 'paper', 'letter', 'card'] },
    { type: 'emoji', emoji: '🐕', answer: 'dog', options: ['dog', 'cat', 'wolf', 'fox'] },
    { type: 'emoji', emoji: '🪑', answer: 'chair', options: ['chair', 'table', 'bench', 'stool'] },
    { type: 'emoji', emoji: '🔑', answer: 'key', options: ['key', 'lock', 'door', 'ring'] },
    { type: 'emoji', emoji: '👟', answer: 'shoe', options: ['shoe', 'sock', 'boot', 'slipper'] },
    { type: 'emoji', emoji: '🎂', answer: 'cake', options: ['cake', 'pie', 'bread', 'cookie'] },
    { type: 'emoji', emoji: '🌳', answer: 'tree', options: ['tree', 'flower', 'bush', 'plant'] },
    { type: 'emoji', emoji: '✈️', answer: 'airplane', options: ['airplane', 'helicopter', 'bird', 'kite'] },
    { type: 'emoji', emoji: '⌚', answer: 'watch', options: ['watch', 'clock', 'ring', 'bracelet'] },
    { type: 'emoji', emoji: '🍕', answer: 'pizza', options: ['pizza', 'pie', 'bread', 'pancake'] },
    { type: 'emoji', emoji: '🌧️', answer: 'rain', options: ['rain', 'snow', 'cloud', 'storm'] },
    { type: 'emoji', emoji: '🐈', answer: 'cat', options: ['cat', 'dog', 'rabbit', 'mouse'] },
    { type: 'emoji', emoji: '🌺', answer: 'flower', options: ['flower', 'tree', 'grass', 'leaf'] },
    { type: 'emoji', emoji: '🍌', answer: 'banana', options: ['banana', 'apple', 'orange', 'grape'] },
    { type: 'emoji', emoji: '🚌', answer: 'bus', options: ['bus', 'car', 'train', 'truck'] },
    { type: 'emoji', emoji: '🎸', answer: 'guitar', options: ['guitar', 'piano', 'drum', 'violin'] },
    { type: 'emoji', emoji: '📱', answer: 'phone', options: ['phone', 'computer', 'tablet', 'radio'] },
    { type: 'emoji', emoji: '🛏️', answer: 'bed', options: ['bed', 'couch', 'chair', 'table'] },
    { type: 'emoji', emoji: '🚿', answer: 'shower', options: ['shower', 'bath', 'sink', 'toilet'] },
    { type: 'emoji', emoji: '🥛', answer: 'milk', options: ['milk', 'water', 'juice', 'coffee'] },
    { type: 'emoji', emoji: '🍳', answer: 'egg', options: ['egg', 'bacon', 'bread', 'cheese'] },
    { type: 'emoji', emoji: '🧦', answer: 'sock', options: ['sock', 'shoe', 'glove', 'hat'] },
    { type: 'emoji', emoji: '🪥', answer: 'toothbrush', options: ['toothbrush', 'comb', 'brush', 'razor'] },
    { type: 'emoji', emoji: '🚪', answer: 'door', options: ['door', 'window', 'wall', 'gate'] },
    { type: 'emoji', emoji: '💡', answer: 'light', options: ['light', 'lamp', 'candle', 'torch'] },
    { type: 'emoji', emoji: '🌙', answer: 'moon', options: ['moon', 'sun', 'star', 'cloud'] },
    { type: 'emoji', emoji: '🍎', answer: 'apple', options: ['apple', 'orange', 'banana', 'pear'] },
    { type: 'emoji', emoji: '🏠', answer: 'house', options: ['house', 'building', 'store', 'tent'] },
    { type: 'emoji', emoji: '🚗', answer: 'car', options: ['car', 'bus', 'truck', 'van'] },
    { type: 'emoji', emoji: '☀️', answer: 'sun', options: ['sun', 'moon', 'star', 'light'] },
    { type: 'emoji', emoji: '📚', answer: 'book', options: ['book', 'paper', 'letter', 'card'] },
    { type: 'emoji', emoji: '🐕', answer: 'dog', options: ['dog', 'cat', 'wolf', 'fox'] },
    { type: 'emoji', emoji: '🪑', answer: 'chair', options: ['chair', 'table', 'bench', 'stool'] },
    { type: 'emoji', emoji: '🔑', answer: 'key', options: ['key', 'lock', 'door', 'ring'] },
    { type: 'emoji', emoji: '👟', answer: 'shoe', options: ['shoe', 'sock', 'boot', 'slipper'] },
    { type: 'emoji', emoji: '🎂', answer: 'cake', options: ['cake', 'pie', 'bread', 'cookie'] },
    { type: 'emoji', emoji: '🌳', answer: 'tree', options: ['tree', 'flower', 'bush', 'plant'] },
    { type: 'emoji', emoji: '✈️', answer: 'airplane', options: ['airplane', 'helicopter', 'bird', 'kite'] },
    { type: 'emoji', emoji: '⌚', answer: 'watch', options: ['watch', 'clock', 'ring', 'bracelet'] },
    { type: 'emoji', emoji: '🍕', answer: 'pizza', options: ['pizza', 'pie', 'bread', 'pancake'] },
    { type: 'emoji', emoji: '🌧️', answer: 'rain', options: ['rain', 'snow', 'cloud', 'storm'] },
    { type: 'emoji', emoji: '🔧', answer: 'wrench', options: ['wrench', 'hammer', 'screwdriver', 'pliers', 'drill'] },
    { type: 'emoji', emoji: '🌂', answer: 'umbrella', options: ['umbrella', 'parasol', 'tent', 'cover', 'shade'] },
    { type: 'emoji', emoji: '🎸', answer: 'guitar', options: ['guitar', 'violin', 'banjo', 'ukulele', 'harp'] },
    { type: 'emoji', emoji: '🔬', answer: 'microscope', options: ['microscope', 'telescope', 'binoculars', 'magnifier', 'glasses'] },
    { type: 'emoji', emoji: '🧲', answer: 'magnet', options: ['magnet', 'battery', 'compass', 'metal', 'bolt'] },
    { type: 'emoji', emoji: '🎺', answer: 'trumpet', options: ['trumpet', 'horn', 'tuba', 'flute', 'clarinet'] },
    { type: 'emoji', emoji: '🦴', answer: 'bone', options: ['bone', 'stick', 'tooth', 'shell', 'rock'] },
    { type: 'emoji', emoji: '🧪', answer: 'test tube', options: ['test tube', 'bottle', 'vial', 'jar', 'flask'] },
    { type: 'emoji', emoji: '🪜', answer: 'ladder', options: ['ladder', 'stairs', 'steps', 'ramp', 'escalator'] },
    { type: 'emoji', emoji: '🧯', answer: 'fire extinguisher', options: ['fire extinguisher', 'spray can', 'tank', 'bottle', 'cylinder'] },
    { type: 'emoji', emoji: '🪒', answer: 'razor', options: ['razor', 'knife', 'blade', 'scissors', 'cutter'] },
    { type: 'emoji', emoji: '🧵', answer: 'thread', options: ['thread', 'string', 'rope', 'wire', 'yarn'] },
    { type: 'emoji', emoji: '🏃', answer: 'running', options: ['running', 'walking', 'jumping', 'standing', 'sitting'] },
    { type: 'emoji', emoji: '🏊', answer: 'swimming', options: ['swimming', 'diving', 'floating', 'splashing', 'wading'] },
    { type: 'emoji', emoji: '😴', answer: 'sleeping', options: ['sleeping', 'resting', 'lying', 'napping', 'dreaming'] },
    { type: 'emoji', emoji: '🍳', answer: 'cooking', options: ['cooking', 'eating', 'serving', 'cutting', 'mixing'] },
    { type: 'emoji', emoji: '📖', answer: 'reading', options: ['reading', 'writing', 'studying', 'looking', 'learning'] },
    { type: 'emoji', emoji: '🎤', answer: 'singing', options: ['singing', 'talking', 'shouting', 'speaking', 'humming'] },
    { type: 'emoji', emoji: '💃', answer: 'dancing', options: ['dancing', 'jumping', 'moving', 'spinning', 'stepping'] },
    { type: 'emoji', emoji: '✍️', answer: 'writing', options: ['writing', 'drawing', 'signing', 'marking', 'noting'] },
    { type: 'emoji', emoji: '🧹', answer: 'sweeping', options: ['sweeping', 'cleaning', 'brushing', 'wiping', 'mopping'] },
    { type: 'emoji', emoji: '🪴', answer: 'planting', options: ['planting', 'digging', 'growing', 'watering', 'gardening'] },
    { type: 'emoji', emoji: '☕', answer: 'cup', options: ['cup', 'mug', 'glass', 'bowl', 'pot'] },
    { type: 'emoji', emoji: '🛋️', answer: 'couch', options: ['couch', 'sofa', 'loveseat', 'chair', 'bench'] },
    { type: 'emoji', emoji: '⛰️', answer: 'mountain', options: ['mountain', 'hill', 'cliff', 'peak', 'ridge'] },
    { type: 'emoji', emoji: '🌊', answer: 'wave', options: ['wave', 'water', 'ocean', 'sea', 'tide'] },
    { type: 'emoji', emoji: '🛤️', answer: 'railroad', options: ['railroad', 'road', 'path', 'track', 'trail'] },
    { type: 'emoji', emoji: '🧥', answer: 'coat', options: ['coat', 'jacket', 'sweater', 'vest', 'blazer'] },
    { type: 'emoji', emoji: '🥿', answer: 'flat', options: ['flat', 'loafer', 'slipper', 'sandal', 'sneaker'] },
    { type: 'emoji', emoji: '📔', answer: 'notebook', options: ['notebook', 'journal', 'diary', 'textbook', 'workbook'] },
    { type: 'emoji', emoji: '🩺', answer: 'stethoscope', options: ['stethoscope', 'otoscope', 'thermometer', 'syringe', 'bandage', 'probe'] },
    { type: 'emoji', emoji: '🎻', answer: 'violin', options: ['violin', 'viola', 'cello', 'guitar', 'fiddle', 'bass'] },
    { type: 'emoji', emoji: '🏛️', answer: 'monument', options: ['monument', 'building', 'temple', 'museum', 'palace', 'landmark'] },
    { type: 'emoji', emoji: '⚖️', answer: 'scale', options: ['scale', 'balance', 'weight', 'measure', 'meter', 'gauge'] },
    { type: 'emoji', emoji: '🧭', answer: 'compass', options: ['compass', 'dial', 'gauge', 'meter', 'clock', 'navigation'] },
    { type: 'emoji', emoji: '🔭', answer: 'telescope', options: ['telescope', 'microscope', 'binoculars', 'periscope', 'lens', 'scope'] },
    { type: 'emoji', emoji: '🦷', answer: 'toothbrush', options: ['toothbrush', 'toothpaste', 'floss', 'mouthwash', 'brush', 'comb'] },
    { type: 'emoji', emoji: '🌅', answer: 'sunrise', options: ['sunrise', 'sunset', 'dawn', 'dusk', 'daybreak', 'twilight'] },
    { type: 'emoji', emoji: '🌈', answer: 'rainbow', options: ['rainbow', 'arch', 'spectrum', 'bow', 'prism', 'colors'] },
    { type: 'emoji', emoji: '🎆', answer: 'fireworks', options: ['fireworks', 'sparklers', 'explosions', 'rockets', 'flares', 'lights'] },
    { type: 'emoji', emoji: '🚿', answer: 'showerhead', options: ['showerhead', 'faucet', 'nozzle', 'sprinkler', 'tap', 'spout'] },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf4e",
    "answer": "apple",
    "options": [
      "apple",
      "coffee",
      "burger",
      "potato"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf4c",
    "answer": "banana",
    "options": [
      "strawberry",
      "banana",
      "carrot",
      "juice"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf4a",
    "answer": "orange",
    "options": [
      "burger",
      "carrot",
      "milk",
      "orange"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf4b",
    "answer": "lemon",
    "options": [
      "lemon",
      "grandfather",
      "broccoli",
      "cucumber"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf47",
    "answer": "grapes",
    "options": [
      "grapes",
      "peach",
      "cherry",
      "paper"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf53",
    "answer": "strawberry",
    "options": [
      "corn",
      "potato",
      "soup",
      "strawberry"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf51",
    "answer": "peach",
    "options": [
      "bone",
      "box",
      "peach",
      "paper"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf52",
    "answer": "cherry",
    "options": [
      "money",
      "watch",
      "cherry",
      "lettuce"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd55",
    "answer": "carrot",
    "options": [
      "strawberry",
      "tea",
      "soup",
      "carrot"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd54",
    "answer": "potato",
    "options": [
      "bread",
      "apple",
      "potato",
      "corn"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf45",
    "answer": "tomato",
    "options": [
      "tomato",
      "apple",
      "corn",
      "pizza"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd66",
    "answer": "broccoli",
    "options": [
      "broccoli",
      "climbing",
      "castle",
      "fox"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf3d",
    "answer": "corn",
    "options": [
      "juice",
      "strawberry",
      "egg",
      "corn"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd52",
    "answer": "cucumber",
    "options": [
      "cucumber",
      "ball",
      "plant",
      "hotdog"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd6c",
    "answer": "lettuce",
    "options": [
      "lettuce",
      "rainbow",
      "broccoli",
      "money"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\uddc5",
    "answer": "onion",
    "options": [
      "grandfather",
      "watch",
      "onion",
      "castle"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf5e",
    "answer": "bread",
    "options": [
      "pasta",
      "corn",
      "carrot",
      "bread"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd5a",
    "answer": "egg",
    "options": [
      "orange",
      "egg",
      "tea",
      "bread"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\uddc0",
    "answer": "cheese",
    "options": [
      "potato",
      "cheese",
      "orange",
      "coffee"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd5b",
    "answer": "milk",
    "options": [
      "pizza",
      "milk",
      "carrot",
      "apple"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\u2615",
    "answer": "coffee",
    "options": [
      "potato",
      "pasta",
      "tea",
      "coffee"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf75",
    "answer": "tea",
    "options": [
      "tea",
      "potato",
      "pasta",
      "cake"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\uddc3",
    "answer": "juice",
    "options": [
      "corn",
      "banana",
      "juice",
      "tomato"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udca7",
    "answer": "water",
    "options": [
      "ring",
      "eagle",
      "cookie",
      "water"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf55",
    "answer": "pizza",
    "options": [
      "egg",
      "orange",
      "coffee",
      "pizza"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf54",
    "answer": "burger",
    "options": [
      "strawberry",
      "burger",
      "cake",
      "egg"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf2d",
    "answer": "hotdog",
    "options": [
      "hotdog",
      "light",
      "donut",
      "lizard"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf5f",
    "answer": "fries",
    "options": [
      "eagle",
      "bag",
      "fries",
      "letter"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf5d",
    "answer": "pasta",
    "options": [
      "corn",
      "bread",
      "pasta",
      "strawberry"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf5c",
    "answer": "soup",
    "options": [
      "pasta",
      "soup",
      "banana",
      "orange"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf63",
    "answer": "sushi",
    "options": [
      "sushi",
      "storm",
      "cucumber",
      "fries"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf70",
    "answer": "cake",
    "options": [
      "carrot",
      "milk",
      "cake",
      "pizza"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf6a",
    "answer": "cookie",
    "options": [
      "worker",
      "cookie",
      "owl",
      "grandmother"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf69",
    "answer": "donut",
    "options": [
      "rocket",
      "book",
      "donut",
      "lemon"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf66",
    "answer": "icecream",
    "options": [
      "key",
      "icecream",
      "owl",
      "book"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf6b",
    "answer": "chocolate",
    "options": [
      "book",
      "lettuce",
      "donut",
      "chocolate"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc15",
    "answer": "dog",
    "options": [
      "frog",
      "bee",
      "dog",
      "bear"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc08",
    "answer": "cat",
    "options": [
      "tiger",
      "rabbit",
      "mouse",
      "cat"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc26",
    "answer": "bird",
    "options": [
      "cow",
      "sheep",
      "turtle",
      "bird"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc1f",
    "answer": "fish",
    "options": [
      "elephant",
      "fish",
      "pig",
      "cat"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc34",
    "answer": "horse",
    "options": [
      "horse",
      "turtle",
      "bee",
      "monkey"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc04",
    "answer": "cow",
    "options": [
      "cow",
      "fish",
      "sheep",
      "rabbit"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc16",
    "answer": "pig",
    "options": [
      "bee",
      "pig",
      "bear",
      "chicken"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc11",
    "answer": "sheep",
    "options": [
      "mouse",
      "tiger",
      "monkey",
      "sheep"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc13",
    "answer": "chicken",
    "options": [
      "bear",
      "lion",
      "mouse",
      "chicken"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd86",
    "answer": "duck",
    "options": [
      "butterfly",
      "duck",
      "chicken",
      "turtle"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc07",
    "answer": "rabbit",
    "options": [
      "elephant",
      "chicken",
      "rabbit",
      "butterfly"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc01",
    "answer": "mouse",
    "options": [
      "mouse",
      "chicken",
      "bee",
      "cow"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc3b",
    "answer": "bear",
    "options": [
      "bear",
      "frog",
      "dog",
      "monkey"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd8a",
    "answer": "fox",
    "options": [
      "money",
      "hotdog",
      "light",
      "fox"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd81",
    "answer": "lion",
    "options": [
      "monkey",
      "cat",
      "fish",
      "lion"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc2f",
    "answer": "tiger",
    "options": [
      "pig",
      "tiger",
      "chicken",
      "bear"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc18",
    "answer": "elephant",
    "options": [
      "pig",
      "cow",
      "fish",
      "elephant"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd92",
    "answer": "giraffe",
    "options": [
      "climbing",
      "worker",
      "tongue",
      "giraffe"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd93",
    "answer": "zebra",
    "options": [
      "money",
      "cucumber",
      "zebra",
      "hotdog"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc35",
    "answer": "monkey",
    "options": [
      "fish",
      "monkey",
      "bee",
      "sheep"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd89",
    "answer": "owl",
    "options": [
      "ring",
      "fox",
      "grapes",
      "owl"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd85",
    "answer": "eagle",
    "options": [
      "fries",
      "book",
      "eagle",
      "lizard"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd8b",
    "answer": "butterfly",
    "options": [
      "chicken",
      "cat",
      "butterfly",
      "bear"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc1d",
    "answer": "bee",
    "options": [
      "lion",
      "elephant",
      "tiger",
      "bee"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc38",
    "answer": "frog",
    "options": [
      "bee",
      "sheep",
      "frog",
      "monkey"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc22",
    "answer": "turtle",
    "options": [
      "turtle",
      "cow",
      "bee",
      "horse"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83e\udd8e",
    "answer": "lizard",
    "options": [
      "fries",
      "lizard",
      "eagle",
      "watch"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc0d",
    "answer": "snake",
    "options": [
      "pencil",
      "castle",
      "fries",
      "snake"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\ude97",
    "answer": "car",
    "options": [
      "boat",
      "car",
      "motorcycle",
      "taxi"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\ude8c",
    "answer": "bus",
    "options": [
      "train",
      "bus",
      "plane",
      "truck"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\ude82",
    "answer": "train",
    "options": [
      "taxi",
      "train",
      "helicopter",
      "boat"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\u2708\ufe0f",
    "answer": "plane",
    "options": [
      "truck",
      "plane",
      "car",
      "bus"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udea2",
    "answer": "boat",
    "options": [
      "helicopter",
      "bus",
      "truck",
      "boat"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udeb2",
    "answer": "bike",
    "options": [
      "helicopter",
      "scooter",
      "boat",
      "bike"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\ude9a",
    "answer": "truck",
    "options": [
      "taxi",
      "plane",
      "truck",
      "train"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfcd\ufe0f",
    "answer": "motorcycle",
    "options": [
      "motorcycle",
      "car",
      "truck",
      "taxi"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\ude81",
    "answer": "helicopter",
    "options": [
      "train",
      "helicopter",
      "bus",
      "motorcycle"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\ude80",
    "answer": "rocket",
    "options": [
      "pencil",
      "cucumber",
      "rocket",
      "broccoli"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udef4",
    "answer": "scooter",
    "options": [
      "scooter",
      "helicopter",
      "truck",
      "car"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\ude95",
    "answer": "taxi",
    "options": [
      "taxi",
      "bus",
      "truck",
      "motorcycle"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfe0",
    "answer": "house",
    "options": [
      "school",
      "hotel",
      "house",
      "hospital"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfeb",
    "answer": "school",
    "options": [
      "store",
      "office",
      "school",
      "hotel"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfe5",
    "answer": "hospital",
    "options": [
      "house",
      "hotel",
      "hospital",
      "bank"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\u26ea",
    "answer": "church",
    "options": [
      "bank",
      "church",
      "hotel",
      "store"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfea",
    "answer": "store",
    "options": [
      "store",
      "hotel",
      "bank",
      "office"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfe6",
    "answer": "bank",
    "options": [
      "school",
      "hotel",
      "bank",
      "office"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfe8",
    "answer": "hotel",
    "options": [
      "house",
      "school",
      "hotel",
      "office"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfe2",
    "answer": "office",
    "options": [
      "bank",
      "office",
      "house",
      "store"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udff0",
    "answer": "castle",
    "options": [
      "hotdog",
      "castle",
      "money",
      "cherry"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udfd6\ufe0f",
    "answer": "beach",
    "options": [
      "cloud",
      "sun",
      "moon",
      "beach"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\u26f0\ufe0f",
    "answer": "mountain",
    "options": [
      "snow",
      "tree",
      "mountain",
      "moon"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83c\udf33",
    "answer": "tree",
    "options": [
      "moon",
      "sun",
      "flower",
      "tree"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc76",
    "answer": "baby",
    "options": [
      "girl",
      "doctor",
      "baby",
      "man"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc66",
    "answer": "boy",
    "options": [
      "woman",
      "boy",
      "girl",
      "man"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc67",
    "answer": "girl",
    "options": [
      "girl",
      "teacher",
      "woman",
      "boy"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc68",
    "answer": "man",
    "options": [
      "teacher",
      "boy",
      "doctor",
      "man"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc69",
    "answer": "woman",
    "options": [
      "girl",
      "man",
      "boy",
      "woman"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc74",
    "answer": "grandfather",
    "options": [
      "book",
      "water",
      "grandfather",
      "rocket"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc75",
    "answer": "grandmother",
    "options": [
      "lemon",
      "hotdog",
      "grandmother",
      "rocket"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc68\u200d\u2695\ufe0f",
    "answer": "doctor",
    "options": [
      "baby",
      "teacher",
      "woman",
      "doctor"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc69\u200d\ud83c\udfeb",
    "answer": "teacher",
    "options": [
      "baby",
      "man",
      "teacher",
      "doctor"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc77",
    "answer": "worker",
    "options": [
      "lizard",
      "worker",
      "cookie",
      "eagle"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc6e",
    "answer": "police",
    "options": [
      "ball",
      "police",
      "snake",
      "hotdog"
    ]
  },
  {
    "type": "emoji",
    "emoji": "\ud83d\udc68\u200d\ud83c\udf73",
    "answer": "chef",
    "options": [
      "ball",
      "chef",
      "onion",
      "eagle"
    ]
  }
];
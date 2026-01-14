# Word Bridge

A speech therapy and language learning application designed to help users practice vocabulary, pronunciation, and cognitive skills through interactive exercises.

## Features

### Multi-Language Support
- **English** and **German** fully supported
- All UI elements, instructions, and exercise data available in both languages
- Language can be switched in Settings

### Exercise Types

The app offers 14 different exercise types across 4 categories:

#### Words
1. **Picture Naming** - Identify objects shown in images/emojis
2. **Listening** - Match spoken words to images
3. **Speaking** - Practice saying words aloud (self-assessed)
4. **Typing** - Type the word for a shown image/emoji

#### Meaning
5. **Categories** - Select words that belong to specific categories
6. **Definitions** - Match words to their definitions
7. **Associations** - Find words that go together
8. **Synonyms & Antonyms** - Identify words with same/opposite meanings

#### Phonetics
9. **First Sounds** - Match words that start with the same sound
10. **Rhyming Words** - Find words that rhyme
11. **Sentence Scramble** - Arrange words in correct sentence order
12. **Sentence Completion** - Type missing words in sentences

#### Time
13. **Time Sequencing** - Answer questions about days, months, and time order
14. **Clock Matching** - Match digital times to analog clocks
15. **Time Ordering** - Arrange activities in chronological order
16. **Working Memory** - Remember and reproduce emoji sequences

### Difficulty Levels

Each exercise type supports three difficulty levels:
- **Easy** - Simpler content, shorter sequences
- **Medium** - Standard difficulty
- **Hard** - Complex content, longer sequences, potential for confusion

### Modes

- **Practice Mode** - Infinite randomized exercises with hints available
- **Test Mode** - Structured assessments with progress tracking

### Customization

- Add custom exercises via individual forms or CSV bulk upload
- Import your own wordbank entries
- Configure exercise frequency and mastery settings

### Progress Tracking

- Track accuracy and response times
- View performance trends over time
- Compare test results
- Identify areas needing practice

## Project Structure

```
WordBridge/
├── css/
│   ├── base/           # Base styles, variables, typography
│   ├── components/     # Reusable component styles
│   ├── exercises/      # Exercise-specific styles
│   └── pages/          # Page layout styles
├── data/
│   ├── en/             # English exercise data
│   │   ├── wordbank.json    # Main word database with sentences
│   │   ├── clockMatching.js
│   │   ├── timeOrdering.js
│   │   ├── timeSequencing.js
│   │   └── workingMemory.js
│   └── de/             # German exercise data (same structure)
├── js/
│   ├── core/           # Core utilities (i18n, config)
│   ├── exercises/      # Exercise implementations
│   │   ├── BaseExercise.js
│   │   ├── SelectionExercise.js
│   │   ├── TypingExercise.js
│   │   └── implementations/
│   ├── services/       # Business logic services
│   └── ui/             # UI components and pages
├── locales/
│   ├── en.json         # English translations
│   └── de.json         # German translations
└── index.html
```

## Data Format

### Wordbank (wordbank.json)
```json
{
  "word": "apple",
  "category": "fruit",
  "soundGroup": "a",
  "definition": "A round fruit that grows on trees",
  "visual": {
    "emoji": "🍎"
  },
  "relationships": {
    "rhymes": ["dapple"],
    "associated": ["tree", "pie"],
    "synonyms": [],
    "antonyms": []
  },
  "distractors": ["banana", "orange", "grape"],
  "sentences": ["I eat an apple.", "The apple is red."]
}
```

### Clock Matching Data
- **Easy**: Times on the hour (:00) and half past (:30)
- **Medium**: Quarter past (:15), quarter to (:45), and alternative phrases (noon, midday)
- **Hard**: All other 5-minute intervals

### Time Sequencing Data
Format: `{ question, answer, wrongOptions, difficulty }`
- Options are shuffled at runtime to ensure random answer placement
- **Easy**: Days of the week, basic months
- **Medium**: More months, seasons
- **Hard**: Years, decades, centuries, multi-step questions

### Time Ordering Data
Format: `{ id, scenario, description, correctOrder, difficulty }`
- Items are scrambled at runtime from `correctOrder`
- **Easy**: 4 steps (universally agreed sequences like seasons, life cycles)
- **Medium**: 6 steps
- **Hard**: More than 6 steps

### Working Memory Data
- **Easy**: Logically connected emojis (same category/theme)
- **Medium**: Random, unrelated emojis
- **Hard**: Similar-looking emojis that could be confused

### Sentences
Sentences for the Sentence Scramble exercise are sourced directly from the wordbank's `sentences` field. They are categorized at runtime:
- **Easy**: 4 words or fewer
- **Medium**: 5-8 words without internal punctuation
- **Hard**: More than 8 words or contains internal punctuation

## Localization

All user-facing text is stored in `/locales/en.json` and `/locales/de.json`. When making UI changes:

1. Add/modify the text key in both locale files
2. Use the translation function: `t('key.path')`
3. For interpolation: `t('key', { variable: value })`

Example:
```javascript
import { t } from './core/i18n.js';

// Simple text
const title = t('exercises.typing.instruction');

// With variables
const message = t('feedback.theAnswerWas', { answer: 'apple' });
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and tablet
- High contrast mode available in settings

## Getting Started

1. Open `index.html` in a modern web browser
2. Select your preferred language in Settings
3. Choose an exercise from the home page
4. Practice at your own pace or take tests to track progress

## Contributing

When contributing:
1. Ensure all text changes are made in both locale files
2. Follow existing code patterns for new exercises
3. Include appropriate difficulty levels for new data
4. Test in both English and German

## License

[Your license information here]

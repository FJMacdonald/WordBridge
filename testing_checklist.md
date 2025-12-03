# Test Scenarios for Wordbank-Based Exercises

## Setup
- [ ] Wordbank loads without errors
- [ ] Sentences file loads without errors
- [ ] App initializes correctly

---

## Naming Exercise
**Path:** Home → Words → Picture Naming

- [ ] Shows emoji from wordbank
- [ ] Shows 4 options including correct word
- [ ] Correct answer matches emoji
- [ ] At least one distractor is from "visual" distractors
- [ ] Clicking correct answer shows success feedback
- [ ] Clicking wrong answer marks it as eliminated
- [ ] Hint eliminates one wrong option
- [ ] Progress tracking updates
- [ ] Works with easy difficulty filter
- [ ] Works with medium difficulty filter

---

## Typing Exercise
**Path:** Home → Words → Typing

- [ ] Shows emoji from wordbank
- [ ] Shows letter boxes matching word length
- [ ] Correct keypress fills box and advances
- [ ] Incorrect keypress shows shake animation
- [ ] Hint reveals next letter
- [ ] Word completion shows success feedback
- [ ] Works with easy and medium words

---

## Listening Exercise
**Path:** Home → Phonetics → Listening

- [ ] Play button speaks the target word
- [ ] Options show 4 text choices
- [ ] Correct answer is the spoken word
- [ ] Uses namingData-style structure (shares with naming)

---

## Speaking Exercise
**Path:** Home → Phonetics → Speaking

- [ ] Shows emoji from wordbank
- [ ] Shows "I said it" and "I couldn't" buttons
- [ ] Hint shows first letter hint
- [ ] Second hint shows phrase from wordbank
- [ ] Third hint shows another phrase
- [ ] Final hint spells and speaks word
- [ ] Self-assessment records correctly

---

## Category Exercise
**Path:** Home → Words → Categories

- [ ] Shows category name (e.g., "fruit")
- [ ] Shows 4 word options
- [ ] Correct answer is from that category
- [ ] Distractors are from different categories
- [ ] Uses categoryPeers for wrong answers within same parent category

---

## Association Exercise
**Path:** Home → Meaning → Association

- [ ] Shows target word
- [ ] Correct answer is from "associated" array
- [ ] Distractors are from "unrelated" array
- [ ] Feedback shows relationship

---

## Synonym Exercise
**Path:** Home → Meaning → Synonyms

- [ ] Shows target word
- [ ] Randomly chooses synonym or antonym mode
- [ ] Correct answer matches mode (synonym or antonym)
- [ ] Shows mode indicator (= or ≠)

---

## Definition Exercise
**Path:** Home → Meaning → Definitions

- [ ] Shows definition text
- [ ] Correct answer is the word matching definition
- [ ] Distractors are other words (any category)

---

## Rhyming Exercise
**Path:** Home → Phonetics → Rhyming

- [ ] Shows target word
- [ ] Correct answer is from "rhymes" array
- [ ] Distractors do NOT rhyme
- [ ] If word has no rhymes, it should be excluded from this exercise

---

## First Sound Exercise
**Path:** Home → Phonetics → First Sounds

- [ ] Shows target word
- [ ] Correct answer starts with same sound
- [ ] Uses firstSoundSimple for matching
- [ ] Distractors start with different sounds

---

## Sentence Fill-in-Blank Exercise
**Path:** Home → Words → Fill Blank

- [ ] Shows sentence with blank (_____)
- [ ] User types the missing word
- [ ] Word comes from wordbank
- [ ] Sentence comes from word's "sentences" array

---

## Scramble Exercise
**Path:** Home → Meaning → Unscramble

- [ ] Uses separate sentences.json file
- [ ] Shows scrambled words
- [ ] Tap-to-swap works
- [ ] Correct order triggers success
- [ ] Easy = 3 words, Medium = 5-6 words

---

## Progress Tracking
- [ ] Correct answers increment word stats
- [ ] Incorrect answers increment attempts without correct
- [ ] Hints are tracked per word
- [ ] Session summary shows accurate totals
- [ ] Daily stats accumulate

---

## Edge Cases
- [ ] Word with no rhymes excluded from rhyming exercise
- [ ] Word with no synonyms excluded from synonym exercise
- [ ] Word with no antonyms: antonym mode skipped
- [ ] Word with no phrases: speaking hints adapt
- [ ] Empty category filter returns no results gracefully

---

## Audio
- [ ] Play button speaks correct word
- [ ] Options can be spoken in sequence
- [ ] Speech rate respects settings

---

## Difficulty Filtering
- [ ] Easy filter only shows easy words
- [ ] Medium filter only shows medium words
- [ ] Mixed mode shows both
# 🌉 WordBridge - Aphasia Recovery Practice

A free, web-based tool to help people with aphasia practice word retrieval, sentence completion, and speech production.

## Features

- **Picture Naming**: See an image, choose the correct word
- **Sentence Completion**: Fill in missing words in sentences
- **Word Categories**: Identify words that fit a category
- **Speech Practice**: See a picture and practice saying the word aloud
- **Custom Exercises**: Add your own personalized content!

## Using Custom Exercises

You can add exercises that are personally meaningful - family photos, favorite places, daily routines, etc.

### Quick Start

1. Go to Settings → Custom Exercises
2. Click "Download Template" to get a sample file
3. Edit the file with your own content
4. Click "Upload Exercises" to add them

### Template Format

```json
{
  "naming": [
    {
      "answer": "coffee",
      "emoji": "☕",
      "options": ["coffee", "tea", "water", "juice"]
    }
  ],
  "speak": [
    {
      "answer": "home",
      "emoji": "🏠",
      "phrases": ["The place where I live", "Where my family is"]
    }
  ]
}
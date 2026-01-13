/**
 * Working Memory exercise data (German - uses same emojis as English)
 * Format: { id, sequence, options, difficulty }
 * 
 * Difficulty levels:
 * - easy: logically connected items (same category, theme, or story)
 * - medium: quite random, unrelated items
 * - hard: includes items that could be confused with one another (similar colors, shapes, etc.)
 */
export const workingMemoryData = [
    // EASY - Logically connected items (20+ items)
    { id: 'fruits_easy', sequence: ['🍎', '🍌', '🍊'], options: ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝'], difficulty: 'easy' },
    { id: 'animals_easy', sequence: ['🐶', '🐱', '🐭'], options: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'], difficulty: 'easy' },
    { id: 'vehicles_easy', sequence: ['🚗', '🚲', '✈️'], options: ['🚗', '🚲', '✈️', '🚌', '🚢', '🚁'], difficulty: 'easy' },
    { id: 'food_easy', sequence: ['🍕', '🍔', '🌮'], options: ['🍕', '🍔', '🌮', '🍝', '🍜', '🥙'], difficulty: 'easy' },
    { id: 'nature_easy', sequence: ['🌳', '🌸', '🌞'], options: ['🌳', '🌸', '🌞', '🌙', '⭐', '☁️'], difficulty: 'easy' },
    { id: 'sports_easy', sequence: ['⚽', '🏀', '🎾'], options: ['⚽', '🏀', '🎾', '🏈', '⚾', '🏓'], difficulty: 'easy' },
    { id: 'music_easy', sequence: ['🎵', '🎸', '🥁'], options: ['🎵', '🎸', '🥁', '🎹', '🎤', '🎺'], difficulty: 'easy' },
    { id: 'weather_easy', sequence: ['☀️', '🌧️', '❄️'], options: ['☀️', '🌧️', '❄️', '🌪️', '🌈', '⚡'], difficulty: 'easy' },
    { id: 'ocean_easy', sequence: ['🐟', '🐙', '🦀'], options: ['🐟', '🐙', '🦀', '🐚', '🦈', '🐋'], difficulty: 'easy' },
    { id: 'farm_easy', sequence: ['🐄', '🐖', '🐔'], options: ['🐄', '🐖', '🐔', '🐑', '🐴', '🦆'], difficulty: 'easy' },
    { id: 'breakfast_easy', sequence: ['🥐', '☕', '🥚'], options: ['🥐', '☕', '🥚', '🥛', '🧇', '🥓'], difficulty: 'easy' },
    { id: 'school_easy', sequence: ['📚', '✏️', '🎒'], options: ['📚', '✏️', '🎒', '📏', '🖍️', '📝'], difficulty: 'easy' },
    { id: 'holiday_easy', sequence: ['🎄', '🎁', '⭐'], options: ['🎄', '🎁', '⭐', '🎅', '❄️', '🔔'], difficulty: 'easy' },
    { id: 'garden_easy', sequence: ['🌺', '🐝', '🦋'], options: ['🌺', '🐝', '🦋', '🌻', '🐛', '🌿'], difficulty: 'easy' },
    { id: 'beach_easy', sequence: ['🏖️', '🌊', '🐚'], options: ['🏖️', '🌊', '🐚', '☀️', '🏄', '🩱'], difficulty: 'easy' },
    { id: 'space_easy', sequence: ['🚀', '🌍', '⭐'], options: ['🚀', '🌍', '⭐', '🌙', '☄️', '🛸'], difficulty: 'easy' },
    { id: 'desserts_easy', sequence: ['🍰', '🍦', '🍪'], options: ['🍰', '🍦', '🍪', '🧁', '🍩', '🍫'], difficulty: 'easy' },
    { id: 'tools_easy', sequence: ['🔨', '🔧', '✂️'], options: ['🔨', '🔧', '✂️', '📏', '🔩', '🪛'], difficulty: 'easy' },
    { id: 'clothing_easy', sequence: ['👕', '👖', '👟'], options: ['👕', '👖', '👟', '👒', '🧤', '👔'], difficulty: 'easy' },
    { id: 'medical_easy', sequence: ['🏥', '💊', '🩺'], options: ['🏥', '💊', '🩺', '💉', '🚑', '🩹'], difficulty: 'easy' },
    { id: 'kitchen_easy', sequence: ['🍽️', '🔪', '🍳'], options: ['🍽️', '🔪', '🍳', '🥄', '🧊', '🫖'], difficulty: 'easy' },
    
    // MEDIUM - Random, unrelated items (20+ items)
    { id: 'random_1', sequence: ['🎭', '🔑', '🌵'], options: ['🎭', '🔑', '🌵', '📷', '🎪', '🧲'], difficulty: 'medium' },
    { id: 'random_2', sequence: ['🦷', '🎯', '🌶️'], options: ['🦷', '🎯', '🌶️', '🧩', '🎬', '⚙️'], difficulty: 'medium' },
    { id: 'random_3', sequence: ['🔔', '🐢', '💡'], options: ['🔔', '🐢', '💡', '🎰', '🧸', '📌'], difficulty: 'medium' },
    { id: 'random_4', sequence: ['🦩', '🔒', '🎲'], options: ['🦩', '🔒', '🎲', '🧲', '📐', '🪴'], difficulty: 'medium' },
    { id: 'random_5', sequence: ['🧲', '🦔', '🎵'], options: ['🧲', '🦔', '🎵', '🪞', '⏰', '🧯'], difficulty: 'medium' },
    { id: 'random_6', sequence: ['🪁', '🦜', '⚓'], options: ['🪁', '🦜', '⚓', '🧿', '🎸', '🔧'], difficulty: 'medium' },
    { id: 'random_7', sequence: ['🎪', '🦋', '🔮'], options: ['🎪', '🦋', '🔮', '🧲', '📸', '🎯'], difficulty: 'medium' },
    { id: 'random_8', sequence: ['🪴', '🎱', '🦚'], options: ['🪴', '🎱', '🦚', '⚗️', '🧭', '🎿'], difficulty: 'medium' },
    { id: 'random_9', sequence: ['🧲', '🦀', '💎'], options: ['🧲', '🦀', '💎', '🎩', '📿', '🪃'], difficulty: 'medium' },
    { id: 'random_10', sequence: ['🎡', '🦉', '⏰'], options: ['🎡', '🦉', '⏰', '🧊', '📯', '🎻'], difficulty: 'medium' },
    { id: 'random_11', sequence: ['🪆', '🐊', '💫'], options: ['🪆', '🐊', '💫', '🎭', '🧪', '📮'], difficulty: 'medium' },
    { id: 'random_12', sequence: ['🎨', '🦇', '⚡'], options: ['🎨', '🦇', '⚡', '🧬', '🔊', '🪝'], difficulty: 'medium' },
    { id: 'random_13', sequence: ['🪕', '🦑', '💰'], options: ['🪕', '🦑', '💰', '🎯', '🧊', '📡'], difficulty: 'medium' },
    { id: 'random_14', sequence: ['🎠', '🦊', '⚙️'], options: ['🎠', '🦊', '⚙️', '🧲', '🔭', '🎺'], difficulty: 'medium' },
    { id: 'random_15', sequence: ['🪗', '🐝', '💿'], options: ['🪗', '🐝', '💿', '🎭', '🧰', '📻'], difficulty: 'medium' },
    { id: 'random_16', sequence: ['🎢', '🦅', '⛏️'], options: ['🎢', '🦅', '⛏️', '🧿', '📱', '🎤'], difficulty: 'medium' },
    { id: 'random_17', sequence: ['🪘', '🐍', '💵'], options: ['🪘', '🐍', '💵', '🎲', '🧱', '📞'], difficulty: 'medium' },
    { id: 'random_18', sequence: ['🎰', '🦎', '⛵'], options: ['🎰', '🦎', '⛵', '🧶', '🔦', '🎷'], difficulty: 'medium' },
    { id: 'random_19', sequence: ['🪙', '🐬', '💣'], options: ['🪙', '🐬', '💣', '🎯', '🧩', '📡'], difficulty: 'medium' },
    { id: 'random_20', sequence: ['🎳', '🦙', '⛺'], options: ['🎳', '🦙', '⛺', '🧸', '📺', '🎹'], difficulty: 'medium' },
    { id: 'random_21', sequence: ['🪤', '🐪', '💼'], options: ['🪤', '🐪', '💼', '🎭', '🧲', '📠'], difficulty: 'medium' },
    
    // HARD - Items that could be confused (similar looking, same color, related concepts) (20+ items)
    { id: 'confuse_balls', sequence: ['🏀', '🔴', '🟠'], options: ['🏀', '🔴', '🟠', '🟡', '⚽', '🎱'], difficulty: 'hard' },
    { id: 'confuse_fruits', sequence: ['🍊', '🍑', '🥭'], options: ['🍊', '🍑', '🥭', '🍐', '🍋', '🍎'], difficulty: 'hard' },
    { id: 'confuse_hearts', sequence: ['❤️', '🧡', '💛'], options: ['❤️', '🧡', '💛', '💚', '💙', '💜'], difficulty: 'hard' },
    { id: 'confuse_cats', sequence: ['🐱', '🐈', '😺'], options: ['🐱', '🐈', '😺', '🙀', '😸', '😹'], difficulty: 'hard' },
    { id: 'confuse_circles', sequence: ['⭕', '🔵', '🟢'], options: ['⭕', '🔵', '🟢', '🟡', '🟣', '⚪'], difficulty: 'hard' },
    { id: 'confuse_faces_happy', sequence: ['😀', '😃', '😄'], options: ['😀', '😃', '😄', '😁', '😆', '🙂'], difficulty: 'hard' },
    { id: 'confuse_faces_sad', sequence: ['😢', '😭', '😿'], options: ['😢', '😭', '😿', '😞', '😔', '🥺'], difficulty: 'hard' },
    { id: 'confuse_flowers', sequence: ['🌸', '🌺', '🌷'], options: ['🌸', '🌺', '🌷', '🌹', '🌻', '💐'], difficulty: 'hard' },
    { id: 'confuse_birds', sequence: ['🐦', '🐤', '🐥'], options: ['🐦', '🐤', '🐥', '🐣', '🦆', '🦅'], difficulty: 'hard' },
    { id: 'confuse_hands', sequence: ['👋', '🤚', '✋'], options: ['👋', '🤚', '✋', '🖐️', '👆', '👍'], difficulty: 'hard' },
    { id: 'confuse_monkeys', sequence: ['🐵', '🙈', '🙉'], options: ['🐵', '🙈', '🙉', '🙊', '🐒', '🦍'], difficulty: 'hard' },
    { id: 'confuse_moons', sequence: ['🌑', '🌒', '🌓'], options: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌙'], difficulty: 'hard' },
    { id: 'confuse_clocks', sequence: ['⏰', '🕐', '🕑'], options: ['⏰', '🕐', '🕑', '🕒', '⏱️', '🕰️'], difficulty: 'hard' },
    { id: 'confuse_vehicles_land', sequence: ['🚗', '🚙', '🚕'], options: ['🚗', '🚙', '🚕', '🚌', '🚐', '🏎️'], difficulty: 'hard' },
    { id: 'confuse_drinks', sequence: ['☕', '🍵', '🫖'], options: ['☕', '🍵', '🫖', '🧋', '🥤', '🧃'], difficulty: 'hard' },
    { id: 'confuse_houses', sequence: ['🏠', '🏡', '🏘️'], options: ['🏠', '🏡', '🏘️', '🏚️', '🏢', '🏣'], difficulty: 'hard' },
    { id: 'confuse_stars', sequence: ['⭐', '🌟', '✨'], options: ['⭐', '🌟', '✨', '💫', '✴️', '⚡'], difficulty: 'hard' },
    { id: 'confuse_squares', sequence: ['🟦', '🟪', '🟫'], options: ['🟦', '🟪', '🟫', '🟧', '🟩', '⬛'], difficulty: 'hard' },
    { id: 'confuse_women', sequence: ['👩', '👱‍♀️', '👩‍🦰'], options: ['👩', '👱‍♀️', '👩‍🦰', '👩‍🦱', '👩‍🦳', '🧑'], difficulty: 'hard' },
    { id: 'confuse_arrows', sequence: ['⬆️', '↗️', '➡️'], options: ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️'], difficulty: 'hard' },
    { id: 'confuse_veggies', sequence: ['🥒', '🥬', '🥦'], options: ['🥒', '🥬', '🥦', '🥕', '🌽', '🫑'], difficulty: 'hard' },
    { id: 'confuse_red_fruits', sequence: ['🍎', '🍒', '🍓'], options: ['🍎', '🍒', '🍓', '🍅', '🌶️', '🫐'], difficulty: 'hard' },
    { id: 'confuse_books', sequence: ['📕', '📗', '📘'], options: ['📕', '📗', '📘', '📙', '📓', '📔'], difficulty: 'hard' },
    { id: 'confuse_money', sequence: ['💵', '💴', '💶'], options: ['💵', '💴', '💶', '💷', '💰', '💳'], difficulty: 'hard' }
];

export default workingMemoryData;

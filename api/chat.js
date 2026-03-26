const musicdb = require('./musicdb');

function getMoodRecommendations(userMessage) {
    const mood = detectMood(userMessage);
    return musicdb[mood] || [];
}

function detectMood(message) {
    // Simple mood detection logic (this can be improved)
    if (message.includes('happy')) return 'happy';
    if (message.includes('sad')) return 'sad';
    if (message.includes('angry')) return 'angry';
    return 'neutral';
}

module.exports = { getMoodRecommendations };
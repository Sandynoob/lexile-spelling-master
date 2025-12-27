
/**
 * Localized Service for Offline Functionality
 * This service uses browser-native APIs instead of external Gemini calls
 * to ensure "No Network" testing capability.
 */

/**
 * Global AudioContext singleton - kept for compatibility if needed, 
 * but standard speech synthesis uses its own internal engine.
 */
let globalAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return globalAudioContext;
};

/**
 * Uses browser-native SpeechSynthesis for offline American pronunciation.
 * Added safety checks for environments where speechSynthesis might be undefined.
 */
export const playAmericanPronunciation = (word: string) => {
  // Safety check: ensure speechSynthesis exists in the global scope
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn("Speech Synthesis API is not supported in this environment.");
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    
    // Attempt to find a high-quality American English voice
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || 
                  voices.find(v => v.lang.includes('en-US')) ||
                  voices[0];

    if (usVoice) {
      utterance.voice = usVoice;
    }

    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slightly slower as per original requirement
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Error during speech synthesis:", error);
  }
};

/**
 * Static feedback logic based on user's score to ensure offline availability.
 */
export const getAIFeedback = async (score: number): Promise<string> => {
  // Simulate a tiny delay to maintain the "generating" feel if desired
  if (score >= 90) {
    return "Absolutely incredible! Your spelling mastery is truly at the professional Lexile level.";
  } else if (score >= 80) {
    return "Excellent performance! You have a very strong grasp of these complex words.";
  } else if (score >= 60) {
    return "Great job! You're showing solid progress in your Lexile journey.";
  } else if (score >= 40) {
    return "You're on the right track! Keep practicing to unlock the next level of vocabulary.";
  } else {
    return "Good effort! Practice makes perfect—keep spelling and you'll see your score soar.";
  }
};

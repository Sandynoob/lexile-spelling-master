
/**
 * Localized Service for Offline Functionality
 * This service uses browser-native APIs instead of external Gemini calls.
 */

/**
 * Uses browser-native SpeechSynthesis for offline American pronunciation.
 * Extremely robust check for Android WebView compatibility.
 */
export const playAmericanPronunciation = (word: string) => {
  // 1. 深度环境检查：确保 window, speechSynthesis 及其核心方法全部存在
  if (
    typeof window === 'undefined' || 
    !window.speechSynthesis || 
    typeof window.speechSynthesis.cancel !== 'function' ||
    typeof window.speechSynthesis.speak !== 'function'
  ) {
    console.warn("Speech Synthesis API is unavailable in this environment.");
    return;
  }

  try {
    // 2. 再次确保 cancel 是安全的
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    
    // 3. 兼容性更好的声音获取逻辑
    let voices: SpeechSynthesisVoice[] = [];
    try {
      voices = window.speechSynthesis.getVoices();
    } catch (e) {
      console.warn("Failed to get voices, using default.");
    }

    const usVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || 
                  voices.find(v => v.lang.includes('en-US')) ||
                  (voices.length > 0 ? voices[0] : null);

    if (usVoice) {
      utterance.voice = usVoice;
    }

    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    // 4. 捕获所有运行时异常，防止 UI 线程崩溃
    console.error("SpeechSynthesis runtime error handled:", error);
  }
};

/**
 * Static feedback logic based on user's score to ensure offline availability.
 */
export const getAIFeedback = async (score: number): Promise<string> => {
  if (score >= 90) return "Absolutely incredible! Your spelling mastery is professional.";
  if (score >= 80) return "Excellent performance! You have a strong grasp of these words.";
  if (score >= 60) return "Great job! You're showing solid progress.";
  if (score >= 40) return "You're on the right track! Keep practicing.";
  return "Good effort! Practice makes perfect—keep it up.";
};

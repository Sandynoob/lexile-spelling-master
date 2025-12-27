
/**
 * Localized Service for Offline Functionality
 * This service uses browser-native APIs instead of external Gemini calls.
 */

/**
 * Uses browser-native SpeechSynthesis for offline American pronunciation.
 * Improved safety checks for Android WebView compatibility.
 */
export const playAmericanPronunciation = (word: string) => {
  try {
    // 1. 检查全局环境
    if (typeof window === 'undefined') return;

    // 2. 获取合成引擎实例
    const synth = window.speechSynthesis;
    
    // 3. 核心防御：如果 synth 不存在或 cancel 不是函数，直接退出
    if (!synth || typeof synth.cancel !== 'function') {
      console.warn("SpeechSynthesis.cancel is not available.");
      return;
    }

    // 4. 安全执行取消
    synth.cancel();

    // 5. 检查构造函数是否存在
    if (typeof window.SpeechSynthesisUtterance === 'undefined') {
      console.warn("SpeechSynthesisUtterance is not defined.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    
    // 6. 安全获取声音列表
    let voices: SpeechSynthesisVoice[] = [];
    if (typeof synth.getVoices === 'function') {
      try {
        voices = synth.getVoices();
      } catch (e) {
        console.warn("Could not get voices.");
      }
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

    // 7. 安全执行朗读
    if (typeof synth.speak === 'function') {
      synth.speak(utterance);
    }
  } catch (error) {
    // 捕获所有可能的异常，确保不阻塞主 UI 线程
    console.error("SpeechSynthesis error caught:", error);
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


/**
 * Localized Service for Offline & Online Fallback
 */

/**
 * 针对红米等国产手机的优化语音方案
 * 逻辑：优先尝试浏览器 TTS，如果失败或环境受限，自动使用有道在线美音 API
 */
export const playAmericanPronunciation = (word: string) => {
  if (typeof window === 'undefined') return;

  const wordClean = word.trim().toLowerCase();
  
  // 方案 A: 尝试原生 SpeechSynthesis (离线)
  const synth = (window as any).speechSynthesis;
  if (synth && typeof synth.speak === 'function') {
    try {
      synth.cancel();
      const UtteranceClass = (window as any).SpeechSynthesisUtterance;
      if (UtteranceClass) {
        const utterance = new UtteranceClass(wordClean);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        
        // 探测是否有可用声音，如果没有则不强行调用 speak
        const voices = synth.getVoices();
        if (voices.length > 0) {
          synth.speak(utterance);
          // 如果 100ms 后还在朗读，说明原生引擎工作正常，直接返回
          if (synth.speaking) return;
        }
      }
    } catch (e) {
      console.warn("Native TTS failed, trying online fallback.");
    }
  }

  // 方案 B: 在线语音兜底 (针对国产手机优化的有道美音接口)
  // type=2 表示美音，type=1 表示英音
  try {
    const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(wordClean)}&type=2`);
    audio.play().catch(err => {
      console.error("Online audio play failed:", err);
    });
  } catch (error) {
    console.error("Final fallback audio failed:", error);
  }
};

export const getAIFeedback = async (score: number): Promise<string> => {
  if (score >= 90) return "Absolutely incredible! Your spelling mastery is professional.";
  if (score >= 80) return "Excellent performance! You have a strong grasp.";
  if (score >= 60) return "Great job! You're showing solid progress.";
  if (score >= 40) return "You're on the right track! Keep practicing.";
  return "Good effort! Practice makes perfect—keep it up.";
};


/**
 * Optimized Service for Chinese Android Devices (MIUI/HyperOS)
 */

/**
 * 语音播放逻辑：
 * 优先使用在线美音 API（有道），因为它在国产手机 WebView 中最稳定。
 * 系统原生 TTS 仅作为最后的静默备份。
 */
export const playAmericanPronunciation = (word: string) => {
  if (typeof window === 'undefined') return;
  const wordClean = word.trim().toLowerCase();

  // --- 策略 A: 在线音频 (最可靠) ---
  try {
    // type=2 为美音，type=1 为英音
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(wordClean)}&type=2`;
    const audio = new Audio(audioUrl);
    
    // 设置超时防止卡死
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn("Online audio play blocked or failed:", err);
        // 如果在线播放失败，尝试策略 B
        tryNativeTTS(wordClean);
      });
    }
  } catch (err) {
    console.error("Online audio initiation error:", err);
    tryNativeTTS(wordClean);
  }
};

/**
 * 极度防御性的原生 TTS 调用
 */
function tryNativeTTS(word: string) {
  try {
    const synth = (window as any).speechSynthesis;
    
    // 每一层访问都进行严格检查
    if (!synth) return;
    
    // 防止 cancel 属性为 undefined
    if (typeof synth.cancel === 'function') {
      synth.cancel();
    }

    const UtteranceClass = (window as any).SpeechSynthesisUtterance;
    if (!UtteranceClass) return;

    const utterance = new UtteranceClass(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    
    // 只有在 speak 是函数时才调用
    if (typeof synth.speak === 'function') {
      synth.speak(utterance);
    }
  } catch (e) {
    // 静默失败，不弹出崩溃提示
    console.warn("All TTS attempts failed for word:", word);
  }
}

export const getAIFeedback = async (score: number): Promise<string> => {
  if (score >= 90) return "Absolutely incredible! Your spelling mastery is professional.";
  if (score >= 80) return "Excellent performance! You have a strong grasp.";
  if (score >= 60) return "Great job! You're showing solid progress.";
  if (score >= 40) return "You're on the right track! Keep practicing.";
  return "Good effort! Practice makes perfect—keep it up.";
};

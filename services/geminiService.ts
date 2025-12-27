
/**
 * Defensive Service for Android Devices (Redmi K40 / MIUI)
 */

export const playAmericanPronunciation = (word: string) => {
  if (typeof window === 'undefined') return;
  const wordClean = word.trim().toLowerCase();

  // 1. 优先采用：有道在线语音 API (对国产安卓系统最稳定)
  // type=2 表示美音
  try {
    const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(wordClean)}&type=2`);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // 如果在线播放被系统静音拦截，我们再尝试系统 TTS
        safeSystemTTS(wordClean);
      });
    }
  } catch (err) {
    safeSystemTTS(wordClean);
  }
};

/**
 * 极其防御性的系统 TTS 调用，杜绝 "undefined reading cancel" 报错
 */
function safeSystemTTS(word: string) {
  try {
    // 使用这种写法能绕过绝大多数由于引擎未就绪导致的 undefined 访问报错
    const w = window as any;
    const synth = w['speechSynthesis'];
    
    if (synth) {
      // 检查 cancel 方法是否存在且是函数
      if (typeof synth['cancel'] === 'function') {
        synth['cancel']();
      }

      const Utterance = w['SpeechSynthesisUtterance'];
      if (Utterance && typeof synth['speak'] === 'function') {
        const u = new Utterance(word);
        u.lang = 'en-US';
        u.rate = 0.8;
        synth['speak'](u);
      }
    }
  } catch (e) {
    // 静默处理，不中断主流程
    console.warn("Native TTS fallback failed silently.");
  }
}

export const getAIFeedback = async (score: number): Promise<string> => {
  if (score >= 90) return "Absolutely incredible! Your spelling mastery is professional.";
  if (score >= 80) return "Excellent performance! You have a strong grasp.";
  if (score >= 60) return "Great job! You're showing solid progress.";
  if (score >= 40) return "You're on the right track! Keep practicing.";
  return "Good effort! Practice makes perfect—keep it up.";
};

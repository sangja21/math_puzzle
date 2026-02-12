
// Simple Sound Effects using Web Audio API
// No external files required!

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export const playSound = (type: 'select' | 'move' | 'error' | 'success') => {
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Use a gain node to control volume
  const gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);

  const oscillator = audioCtx.createOscillator();
  oscillator.connect(gainNode);

  const now = audioCtx.currentTime;

  switch (type) {
    case 'select':
      // High pitch short 'tick'
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      break;

    case 'move':
      // 'Tok' sound (Wood block-ish)
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      break;

    case 'error':
      // Low buzz
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;

    case 'success':
      // Major Arpeggio (C-E-G-C)
      playNote(523.25, now, 0.1, 'sine'); // C5
      playNote(659.25, now + 0.1, 0.1, 'sine'); // E5
      playNote(783.99, now + 0.2, 0.1, 'sine'); // G5
      playNote(1046.50, now + 0.3, 0.4, 'sine'); // C6
      break;
  }
};

const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gain.gain.setValueAtTime(0.2, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
};

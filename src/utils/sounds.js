let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio blocked by browser policy
  }
}

export const sounds = {
  bidPlaced: () => {
    playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(800, 0.15, 'sine', 0.1), 80);
  },
  
  tick: () => {
    playTone(440, 0.05, 'sine', 0.08);
  },
  
  goingOnce: () => {
    playTone(400, 0.3, 'sine', 0.12);
    setTimeout(() => playTone(350, 0.3, 'sine', 0.12), 250);
  },
  
  goingTwice: () => {
    playTone(350, 0.25, 'sine', 0.12);
    setTimeout(() => playTone(300, 0.25, 'sine', 0.12), 200);
    setTimeout(() => playTone(280, 0.3, 'sine', 0.12), 400);
  },
  
  sold: () => {
    playTone(523, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(659, 0.2, 'sine', 0.15), 150);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.15), 300);
    setTimeout(() => playTone(1047, 0.5, 'sine', 0.15), 450);
  },
  
  unsold: () => {
    playTone(300, 0.3, 'triangle', 0.1);
    setTimeout(() => playTone(250, 0.4, 'triangle', 0.1), 300);
  },
  
  autoBid: () => {
    playTone(900, 0.08, 'sine', 0.08);
  },
  
  win: () => {
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'sine', 0.12), i * 120);
    });
  },
  
  outbid: () => {
    playTone(200, 0.3, 'sawtooth', 0.06);
  }
};

/**
 * Web Speech API Voice Scoring Assistant & Audio Announcer
 * Enables hands-free, real-time live score recording for cricket umpires and scorers.
 */

// Voice Text-to-Speech (TTS) Confirmation Helper
export function speakConfirmation(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Natural crisp pace
    utterance.pitch = 1.0;
    utterance.volume = 0.85;

    // Prefer English voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('David') ||
            v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis confirmation failed:', err);
  }
}

/**
 * Clean and normalize speech recognition raw string.
 * Strips punctuation, accents, and excessive whitespaces.
 */
export function cleanSpeechText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse raw voice transcript into structured cricket scoring commands.
 */
export function parseCricketVoiceCommand(rawText) {
  const clean = cleanSpeechText(rawText);
  if (!clean) return null;

  const words = clean.split(' ');

  // 1. Undo / Rollback Commands
  if (
    clean === 'undo' ||
    clean === 'cancel' ||
    clean === 'revert' ||
    clean === 'back' ||
    clean.includes('undo') ||
    clean.includes('cancel last') ||
    clean.includes('delete last') ||
    clean.includes('remove last') ||
    clean.includes('revert ball')
  ) {
    return { type: 'undo', text: 'Undo Last Ball', raw: rawText };
  }

  // 2. Wicket & Dismissal Commands
  if (
    clean === 'wicket' ||
    clean === 'out' ||
    clean === 'bowled' ||
    clean === 'caught' ||
    clean === 'lbw' ||
    clean === 'stumped' ||
    clean === 'run out' ||
    clean === 'hit wicket' ||
    clean === 'clean bowled' ||
    clean === 'dismissal' ||
    clean === 'gone' ||
    clean.includes('wicket') ||
    clean.includes('clean bowled') ||
    clean.includes('run out') ||
    clean.includes('hit wicket') ||
    clean.includes('got him') ||
    clean.includes('batsman out') ||
    clean.includes('batter out') ||
    words.includes('bowled') ||
    words.includes('caught') ||
    words.includes('lbw') ||
    words.includes('stumped') ||
    words.includes('out')
  ) {
    let dismissalType = 'bowled';
    if (clean.includes('caught') || words.includes('caught')) dismissalType = 'caught';
    else if (clean.includes('lbw') || words.includes('lbw')) dismissalType = 'lbw';
    else if (clean.includes('run out') || words.includes('runout')) dismissalType = 'run_out';
    else if (clean.includes('stumped') || words.includes('stumped')) dismissalType = 'stumped';
    else if (clean.includes('hit wicket')) dismissalType = 'hit_wicket';

    return {
      type: 'wicket',
      dismissalType,
      text: `Wicket (${dismissalType.toUpperCase()})`,
      raw: rawText,
    };
  }

  // 3. Extras Commands
  // No Ball
  if (
    clean === 'no ball' ||
    clean === 'noball' ||
    clean === 'no-ball' ||
    clean === 'nb' ||
    clean === 'free hit' ||
    clean.includes('no ball') ||
    clean.includes('noball') ||
    clean.includes('no-ball')
  ) {
    return {
      type: 'extra',
      extraType: 'no_ball',
      runs: 1,
      text: 'No Ball (+1)',
      raw: rawText,
    };
  }

  // Wide Ball
  if (
    clean === 'wide' ||
    clean === 'wide ball' ||
    clean === 'wd' ||
    clean === 'wide 1' ||
    clean === '1 wide' ||
    clean.includes('wide')
  ) {
    return {
      type: 'extra',
      extraType: 'wide',
      runs: 1,
      text: 'Wide Ball (+1)',
      raw: rawText,
    };
  }

  // Leg Bye
  if (
    clean === 'leg bye' ||
    clean === 'leg byes' ||
    clean === 'legbye' ||
    clean === 'legby' ||
    clean === 'lb' ||
    clean.includes('leg bye') ||
    clean.includes('leg byes') ||
    clean.includes('legbye')
  ) {
    return {
      type: 'extra',
      extraType: 'leg_bye',
      runs: 1,
      text: 'Leg Bye (+1)',
      raw: rawText,
    };
  }

  // Bye (ensure not confused with "goodbye")
  if (
    (clean === 'bye' ||
      clean === 'byes' ||
      clean === '1 bye' ||
      clean === 'one bye' ||
      clean.includes('byes') ||
      (words.includes('bye') && !words.includes('good'))) &&
    !clean.includes('good')
  ) {
    return {
      type: 'extra',
      extraType: 'bye',
      runs: 1,
      text: 'Bye (+1)',
      raw: rawText,
    };
  }

  // 4. Strike & Flow Commands
  if (
    clean === 'switch strike' ||
    clean === 'change strike' ||
    clean === 'rotate strike' ||
    clean === 'swap strike' ||
    clean === 'change batsman' ||
    clean.includes('switch strike') ||
    clean.includes('change strike') ||
    clean.includes('rotate strike') ||
    clean.includes('swap strike')
  ) {
    return {
      type: 'switch_strike',
      text: 'Switch Strike',
      raw: rawText,
    };
  }

  if (
    clean === 'end over' ||
    clean === 'over complete' ||
    clean === 'over done' ||
    clean === 'over finished' ||
    clean === 'over' ||
    clean.includes('end over') ||
    clean.includes('over complete') ||
    clean.includes('over finished')
  ) {
    return {
      type: 'end_over',
      text: 'End of Over',
      raw: rawText,
    };
  }

  // 5. Boundary 4 Runs
  if (
    clean === '4' ||
    clean === 'four' ||
    clean === 'for' ||
    clean === 'fore' ||
    clean === 'floor' ||
    clean === 'fourth' ||
    clean === 'boundary' ||
    clean === 'boundary four' ||
    clean === 'boundary 4' ||
    clean === 'four runs' ||
    clean === '4 runs' ||
    clean === 'four run' ||
    clean === 'chauka' ||
    clean === 'choka' ||
    clean === 'four more' ||
    clean.includes('four runs') ||
    clean.includes('4 runs') ||
    clean.includes('boundary four') ||
    clean.includes('boundary') ||
    clean.includes('chauka') ||
    clean.includes('choka') ||
    words.includes('four') ||
    words.includes('4') ||
    words.includes('for') ||
    words.includes('fore') ||
    words.includes('boundary') ||
    words.includes('chauka')
  ) {
    return {
      type: 'run',
      value: 4,
      text: '4 (Boundary Four)',
      raw: rawText,
    };
  }

  // 6. Maximum 6 Runs
  if (
    clean === '6' ||
    clean === 'six' ||
    clean === 'sixer' ||
    clean === 'maximum' ||
    clean === 'six runs' ||
    clean === '6 runs' ||
    clean === 'chakka' ||
    clean === 'sics' ||
    clean === 'sex' ||
    clean === 'sick' ||
    clean === 'sixth' ||
    clean.includes('six runs') ||
    clean.includes('6 runs') ||
    clean.includes('maximum') ||
    clean.includes('sixer') ||
    clean.includes('chakka') ||
    words.includes('six') ||
    words.includes('6') ||
    words.includes('sixer') ||
    words.includes('maximum') ||
    words.includes('chakka') ||
    words.includes('sics')
  ) {
    return {
      type: 'run',
      value: 6,
      text: '6 (Maximum Six)',
      raw: rawText,
    };
  }

  // 7. Single 1 Run
  if (
    clean === '1' ||
    clean === 'one' ||
    clean === 'single' ||
    clean === 'one run' ||
    clean === '1 run' ||
    clean === 'single run' ||
    clean === 'won' ||
    clean === 'wan' ||
    clean === 'ek' ||
    clean.includes('one run') ||
    clean.includes('1 run') ||
    clean.includes('single') ||
    words.includes('single') ||
    words.includes('one') ||
    words.includes('1') ||
    words.includes('won')
  ) {
    return {
      type: 'run',
      value: 1,
      text: '1 Run (Single)',
      raw: rawText,
    };
  }

  // 8. 2 Runs (Double / Couple)
  if (
    clean === '2' ||
    clean === 'two' ||
    clean === 'double' ||
    clean === 'couple' ||
    clean === 'two runs' ||
    clean === '2 runs' ||
    clean === 'to' ||
    clean === 'too' ||
    clean === 'do' ||
    clean.includes('two runs') ||
    clean.includes('2 runs') ||
    clean.includes('double') ||
    clean.includes('couple') ||
    words.includes('two') ||
    words.includes('2') ||
    words.includes('double') ||
    words.includes('couple')
  ) {
    return {
      type: 'run',
      value: 2,
      text: '2 Runs',
      raw: rawText,
    };
  }

  // 9. 3 Runs (Triple)
  if (
    clean === '3' ||
    clean === 'three' ||
    clean === 'triple' ||
    clean === 'three runs' ||
    clean === '3 runs' ||
    clean === 'tree' ||
    clean === 'free' ||
    clean === 'teen' ||
    clean.includes('three runs') ||
    clean.includes('3 runs') ||
    clean.includes('triple') ||
    words.includes('three') ||
    words.includes('3') ||
    words.includes('triple')
  ) {
    return {
      type: 'run',
      value: 3,
      text: '3 Runs',
      raw: rawText,
    };
  }

  // 10. 5 Runs (Overthrows)
  if (
    clean === '5' ||
    clean === 'five' ||
    clean === 'five runs' ||
    clean === '5 runs' ||
    clean === 'paanch' ||
    clean.includes('five runs') ||
    clean.includes('5 runs') ||
    words.includes('five') ||
    words.includes('5')
  ) {
    return {
      type: 'run',
      value: 5,
      text: '5 Runs',
      raw: rawText,
    };
  }

  // 11. Dot Ball (0 Runs)
  if (
    clean === '0' ||
    clean === 'zero' ||
    clean === 'dot' ||
    clean === 'dot ball' ||
    clean === 'dotball' ||
    clean === 'no run' ||
    clean === 'no runs' ||
    clean === 'none' ||
    clean === 'duck' ||
    clean === 'null' ||
    clean === 'khali' ||
    clean === 'dead ball' ||
    clean.includes('dot ball') ||
    clean.includes('no run') ||
    clean.includes('no runs') ||
    clean.includes('dotball') ||
    words.includes('dot') ||
    words.includes('zero') ||
    words.includes('0')
  ) {
    return {
      type: 'run',
      value: 0,
      text: '0 (Dot Ball)',
      raw: rawText,
    };
  }

  return null;
}

class VoiceScoringEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commandCallback = null;
    this.statusCallback = null;
    this.transcriptCallback = null;
    this.supported = false;
    this.lastExecutedTime = 0;
    this.lastExecutedCleanText = '';
    this.restartTimer = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      this.supported = false;
      return;
    }

    this.supported = true;
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.statusCallback) {
          this.statusCallback(true, 'Listening for umpire calls ("four", "six", "wicket", "wide")...');
        }
      };

      this.recognition.onend = () => {
        // Resilient automatic restart on pause / silence if user hasn't explicitly stopped it
        if (this.isListening) {
          if (this.restartTimer) clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
            if (this.isListening && this.recognition) {
              try {
                this.recognition.start();
              } catch (err) {
                console.warn('Speech recognition restart retry:', err);
              }
            }
          }, 250);
        } else {
          if (this.statusCallback) this.statusCallback(false, 'Voice assistant paused');
        }
      };

      this.recognition.onerror = (event) => {
        // 'no-speech' is normal during silence; do not stop listening
        if (event.error === 'no-speech') {
          return;
        }

        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          if (this.statusCallback) this.statusCallback(false, 'Microphone permission blocked. Please allow mic access in browser.');
        }
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const raw = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += raw + ' ';
            this.processTranscript(raw);
          } else {
            interimTranscript += raw;
          }
        }

        const displayTranscript = (finalTranscript || interimTranscript).trim();
        if (this.transcriptCallback && displayTranscript) {
          this.transcriptCallback(displayTranscript);
        }
      };
    } catch (err) {
      console.warn('Voice engine init failed:', err);
      this.supported = false;
    }
  }

  processTranscript(rawText) {
    if (!rawText) return;
    const clean = cleanSpeechText(rawText);
    if (!clean) return;

    // Deduplication guard: ignore identical utterances processed within 600ms
    const now = Date.now();
    if (now - this.lastExecutedTime < 650 && this.lastExecutedCleanText === clean) {
      return;
    }

    const cmd = parseCricketVoiceCommand(rawText);
    if (cmd && this.commandCallback) {
      this.lastExecutedTime = now;
      this.lastExecutedCleanText = clean;
      this.commandCallback(cmd);
    }
  }

  // Dynamic Callback Updaters (prevents React stale closure bugs)
  setCommandHandler(fn) {
    this.commandCallback = fn;
  }

  setStatusHandler(fn) {
    this.statusCallback = fn;
  }

  setTranscriptHandler(fn) {
    this.transcriptCallback = fn;
  }

  start(onCommand, onStatus, onTranscript) {
    if (!this.supported) {
      if (onStatus) onStatus(false, 'Speech Recognition is not supported by this browser. Try Chrome or Edge.');
      return false;
    }

    if (onCommand) this.commandCallback = onCommand;
    if (onStatus) this.statusCallback = onStatus;
    if (onTranscript) this.transcriptCallback = onTranscript;

    this.isListening = true;
    try {
      this.recognition.start();
      return true;
    } catch (err) {
      // If already started or state error, keep listening true
      console.warn('Recognition start caught:', err);
      return true;
    }
  }

  stop() {
    this.isListening = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.statusCallback) this.statusCallback(false, 'Voice assistant stopped');
  }

  toggle(onCommand, onStatus, onTranscript) {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start(onCommand, onStatus, onTranscript);
    }
  }
}

export const voiceEngine = new VoiceScoringEngine();

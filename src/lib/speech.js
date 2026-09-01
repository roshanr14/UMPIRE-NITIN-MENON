/**
 * Web Speech API Voice Scoring Assistant
 * Enables hands-free score recording for umpires during live play.
 */

class VoiceScoringEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commandCallback = null;
    this.statusCallback = null;
    this.transcriptCallback = null;
    this.supported = false;
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
        if (this.statusCallback) this.statusCallback(true, 'Listening for umpire calls...');
      };

      this.recognition.onend = () => {
        // Automatically restart if user hasn't explicitly stopped it
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            this.isListening = false;
            if (this.statusCallback) this.statusCallback(false, 'Voice recognition paused');
          }
        } else {
          if (this.statusCallback) this.statusCallback(false, 'Voice recognition stopped');
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          if (this.statusCallback) this.statusCallback(false, 'Microphone access blocked');
        }
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.trim().toLowerCase();
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            this.parseAndExecute(transcript);
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.transcriptCallback) {
          this.transcriptCallback(finalTranscript || interimTranscript);
        }
      };
    } catch (err) {
      console.warn('Voice engine init failed:', err);
      this.supported = false;
    }
  }

  parseAndExecute(text) {
    if (!text) return;
    const clean = text.toLowerCase().trim();

    let cmd = null;

    // Runs matching
    if (/^(0|zero|dot|dot ball|no run)$/.test(clean) || clean.includes('dot ball') || clean === 'dot') {
      cmd = { type: 'run', value: 0, text: '0 (Dot Ball)' };
    } else if (/^(1|one|single|one run|1 run)$/.test(clean) || clean === 'one' || clean.includes('one run')) {
      cmd = { type: 'run', value: 1, text: '1 Run' };
    } else if (/^(2|two|double|two runs|2 runs|couple)$/.test(clean) || clean === 'two' || clean.includes('two runs')) {
      cmd = { type: 'run', value: 2, text: '2 Runs' };
    } else if (/^(3|three|three runs|3 runs)$/.test(clean) || clean === 'three' || clean.includes('three runs')) {
      cmd = { type: 'run', value: 3, text: '3 Runs' };
    } else if (/^(4|four|boundary|four runs|4 runs|boundary four)$/.test(clean) || clean === 'four' || clean.includes('four runs') || clean.includes('boundary')) {
      cmd = { type: 'run', value: 4, text: '4 (Boundary Four)' };
    } else if (/^(6|six|maximum|six runs|6 runs)$/.test(clean) || clean === 'six' || clean.includes('six runs') || clean.includes('maximum')) {
      cmd = { type: 'run', value: 6, text: '6 (Maximum Six)' };
    }
    // Extras matching
    else if (clean.includes('wide') || clean === 'wide ball') {
      cmd = { type: 'extra', extraType: 'wide', runs: 1, text: 'Wide Ball (+1)' };
    } else if (clean.includes('no ball') || clean.includes('no-ball')) {
      cmd = { type: 'extra', extraType: 'no_ball', runs: 1, text: 'No Ball (+1)' };
    } else if (clean.includes('leg bye') || clean.includes('leg byes')) {
      cmd = { type: 'extra', extraType: 'leg_bye', runs: 1, text: 'Leg Bye' };
    } else if (clean.includes('bye') || clean.includes('byes')) {
      cmd = { type: 'extra', extraType: 'bye', runs: 1, text: 'Bye' };
    }
    // Wicket & Flow Commands
    else if (clean.includes('wicket') || clean.includes('out') || clean === 'bowled' || clean === 'caught' || clean === 'lbw') {
      cmd = { type: 'wicket', text: 'Wicket' };
    } else if (clean.includes('undo') || clean.includes('cancel last') || clean.includes('revert')) {
      cmd = { type: 'undo', text: 'Undo Last Ball' };
    } else if (clean.includes('switch strike') || clean.includes('change strike') || clean.includes('rotate strike')) {
      cmd = { type: 'switch_strike', text: 'Switch Strike' };
    } else if (clean.includes('end over') || clean.includes('over complete') || clean === 'over') {
      cmd = { type: 'end_over', text: 'End Over' };
    }

    if (cmd && this.commandCallback) {
      this.commandCallback(cmd);
    }
  }

  start(onCommand, onStatus, onTranscript) {
    if (!this.supported || !this.recognition) return false;
    this.commandCallback = onCommand;
    this.statusCallback = onStatus;
    this.transcriptCallback = onTranscript;

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Recognition start failed:', err);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.statusCallback) this.statusCallback(false, 'Voice recognition off');
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

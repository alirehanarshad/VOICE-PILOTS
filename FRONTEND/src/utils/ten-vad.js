/**
 * TEN-VAD: Threshold Energy Noise Voice Activity Detection
 * 
 * Rebuilt for Float32 PCM capture to support perfect WAV generation.
 */

const DEFAULT_CONFIG = {
    speechThreshold: 0.06,
    silenceThreshold: 0.025,
    silenceTimeout: 500,        // ms of silence before triggering "speech end"
    minSpeechDuration: 300,
    maxRecordingDuration: 30000,
    noiseFloorAdaptRate: 0.02,
    noiseFloorMultiplier: 2.5,
    fftSize: 512,
    smoothingTimeConstant: 0.3,
};

export class TenVAD {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.state = 'idle';
        this.destroyed = false;

        this.audioCtx = null;
        this.analyser = null;
        this.stream = null;
        this.source = null;
        this.processor = null;
        this.pcmSamples = [];
        this.sampleRate = 16000;

        this.noiseFloor = 0.02;
        this.currentEnergy = 0;
        this.peakEnergy = 0;

        this.speechStartTime = 0;
        this.silenceTimer = null;
        this.maxTimer = null;
        this.calibrationTimer = null;
        this.restartTimer = null;
        this.animationFrame = null;

        this.onSpeechStart = null;
        this.onSpeechEnd = null;
        this.onAudioLevel = null;
        this.onError = null;
        this.onStateChange = null;

        console.log('%c[TEN-VAD] Initialized (PCM Mode)', 'color: #00ff88; font-weight: bold;');
    }

    async start() {
        if (this.state !== 'idle') return null;
        this.destroyed = false;

        try {
            this._setState('listening');
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });

            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.sampleRate = this.audioCtx.sampleRate;
            this.source = this.audioCtx.createMediaStreamSource(this.stream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = this.config.fftSize;
            this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
            this.source.connect(this.analyser);

            this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
            this.pcmSamples = [];
            this.processor.onaudioprocess = (e) => {
                if (this.destroyed) return;
                const inputData = e.inputBuffer.getChannelData(0);
                if (this.state === 'speaking') {
                    this.pcmSamples.push(new Float32Array(inputData));
                }
            };
            this.processor.connect(this.audioCtx.destination);
            this.source.connect(this.processor);

            this._calibrateNoiseFloor(() => {
                if (!this.destroyed) this._monitorEnergy();
            });

            return this.stream;
        } catch (err) {
            console.error('[TEN-VAD] Start failed:', err);
            this._setState('idle');
            if (this.onError) this.onError(err);
            return null;
        }
    }

    stop() {
        this.destroyed = true;
        this._clearAllTimers();
        this._cleanup();
        this._setState('idle');
    }

    forceStop() {
        if (this.state === 'speaking') {
            this._endSpeech();
            setTimeout(() => this.stop(), 100);
        } else {
            this.stop();
        }
    }

    _setState(newState) {
        const old = this.state;
        this.state = newState;
        if (this.onStateChange && !this.destroyed) this.onStateChange(newState, old);
    }

    _clearAllTimers() {
        [this.silenceTimer, this.maxTimer, this.calibrationTimer, this.restartTimer].forEach(t => t && clearTimeout(t));
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    }

    _calibrateNoiseFloor(onDone) {
        if (!this.analyser || this.destroyed) return;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        let samples = 0, totalEnergy = 0;
        const calibrate = () => {
            if (this.destroyed || !this.analyser) return;
            if (samples >= 10) {
                this.noiseFloor = Math.max(0.01, totalEnergy / samples);
                if (onDone) onDone();
                return;
            }
            this.analyser.getByteFrequencyData(dataArray);
            totalEnergy += this._calculateEnergy(dataArray);
            samples++;
            this.calibrationTimer = setTimeout(calibrate, 20);
        };
        calibrate();
    }

    _calculateEnergy(dataArray) {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        return (sum / dataArray.length) / 255;
    }

    _monitorEnergy() {
        if (this.destroyed || this.state === 'idle' || !this.analyser) return;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const tick = () => {
            if (this.destroyed || this.state === 'idle' || this.state === 'processing' || !this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            this.currentEnergy = this._calculateEnergy(dataArray);

            if (this.state === 'listening' && this.currentEnergy < this.noiseFloor * 1.5) {
                this.noiseFloor = this.noiseFloor * (1 - this.config.noiseFloorAdaptRate) + this.currentEnergy * this.config.noiseFloorAdaptRate;
            }
            const threshold = Math.max(this.config.speechThreshold, this.noiseFloor * this.config.noiseFloorMultiplier);
            if (this.onAudioLevel && !this.destroyed) this.onAudioLevel(this.currentEnergy);

            if (this.state === 'listening') {
                if (this.currentEnergy > threshold) this._startSpeech();
            } else if (this.state === 'speaking') {
                this.peakEnergy = Math.max(this.peakEnergy, this.currentEnergy);
                if (this.currentEnergy < this.config.silenceThreshold) {
                    if (!this.silenceTimer) this.silenceTimer = setTimeout(() => this._endSpeech(), this.config.silenceTimeout);
                } else if (this.silenceTimer) {
                    clearTimeout(this.silenceTimer);
                    this.silenceTimer = null;
                }
            }
            this.animationFrame = requestAnimationFrame(tick);
        };
        this.animationFrame = requestAnimationFrame(tick);
    }

    _startSpeech() {
        if (this.destroyed) return;
        this._setState('speaking');
        this.speechStartTime = Date.now();
        this.peakEnergy = this.currentEnergy;
        this.pcmSamples = [];
        this.maxTimer = setTimeout(() => this._endSpeech(), this.config.maxRecordingDuration);
        if (this.onSpeechStart) this.onSpeechStart();
    }

    _endSpeech() {
        if (this.state !== 'speaking') return;
        this._setState('processing');
        this._clearAllTimers();

        const totalSamples = this.pcmSamples.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Float32Array(totalSamples);
        let offset = 0;
        for (const chunk of this.pcmSamples) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        const durationMs = Date.now() - this.speechStartTime;
        if (durationMs >= this.config.minSpeechDuration && this.onSpeechEnd && !this.destroyed) {
            this.onSpeechEnd(result, { duration: durationMs, peakEnergy: this.peakEnergy, sampleRate: this.sampleRate });
        }
        this.pcmSamples = [];

        if (!this.destroyed && this.state === 'processing') {
            this.restartTimer = setTimeout(() => {
                if (!this.destroyed && this.state === 'processing') {
                    this._setState('listening');
                    this._monitorEnergy();
                }
            }, 500);
        }
    }

    _cleanup() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        if (this.processor) this.processor.disconnect();
        if (this.stream) this.stream.getTracks().forEach(t => t.stop());
        if (this.audioCtx && this.audioCtx.state !== 'closed') this.audioCtx.close().catch(() => { });
        this.processor = null; this.audioCtx = null; this.analyser = null; this.source = null; this.stream = null;
        this.pcmSamples = [];
    }
}

export default TenVAD;

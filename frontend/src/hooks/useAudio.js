
import { useState, useCallback, useRef } from 'react';

export function useAudio() {
    const [isInitialized, setIsInitialized] = useState(false);
    const audioCtx = useRef(null);
    const oscillator = useRef(null);
    const gainNode = useRef(null);

    const initAudio = useCallback(async () => {
        if (!audioCtx.current) {
            try {
                audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
                setIsInitialized(true);
            } catch (e) {
                console.error("Failed to init audio context", e);
            }
        }
    }, []);

    const stopTone = useCallback(() => {
        if (oscillator.current) {
            oscillator.current.stop();
            oscillator.current.disconnect();
            oscillator.current = null;
        }
        if (gainNode.current) {
            gainNode.current.disconnect();
            gainNode.current = null;
        }
    }, []);

    const playTone = useCallback((frequency, db, ear = 'right') => {
        if (!audioCtx.current) initAudio();

        // Safety: Stop any existing tone
        stopTone();

        const ctx = audioCtx.current;
        if (!ctx) {
            console.error("Audio context not initialized.");
            return;
        }

        // 1. Convert dB HL to Gain (Approximate calibration curve)
        // In a real device, this needs specific calibration per frequency/headphone
        // Standard reference is 0 dB HL = ~SPL threshold. 
        // We use a simplified log scale for web safety. 
        // Max comfortable volume usually around 1.0 gain.
        // 0 dB HL -> 0.001 gain, 100 dB HL -> 1.0 gain (very loud!)
        // Formula: gain = 10 ^ ((db - MaxdB) / 20)
        // Let's map 100dB HL to 0dB FS (Full Scale) = 1.0
        // db - 100
        const gainValue = Math.pow(10, (db - 100) / 20);

        // 2. Create Nodes
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();

        // 3. Configure
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Pan: -1 (Left), 1 (Right)
        panner.pan.setValueAtTime(ear === 'left' ? -1 : 1, ctx.currentTime);

        // Envelope to avoid clicking
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.05); // Attack

        // 4. Connect
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);

        // 5. Start
        osc.start();

        // Store refs
        oscillator.current = osc;
        gainNode.current = gain;
    }, [initAudio, stopTone]);

    return {
        initAudio,
        playTone,
        stopTone,
        isReady: isInitialized
    };
}


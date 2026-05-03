/**
 * Hybrid TTS System
 * Fallback chain: Groq Orpheus → Edge TTS → Browser TTS
 */

import { edgeTTS } from './edge-tts';
import { browserTTS } from './browser-tts';

export interface HybridTTSOptions {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  preferEdgeTTS?: boolean; // Deprecated, now uses Groq Orpheus first
}

class HybridTTS {
  private audioElement: HTMLAudioElement | null = null;

  /**
   * Check if any TTS is available
   */
  isAvailable(): boolean {
    return true; // Always available with fallback chain
  }

  /**
   * Speak text using the best available TTS
   * Chain: Groq Orpheus → Edge TTS → Browser TTS
   */
  async speak(options: HybridTTSOptions): Promise<void> {
    options.onStart?.();

    try {
      // Try Groq Orpheus via API route (server-side)
      console.log('[Hybrid TTS] Calling /api/tts with voice:', options.voice);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          voice: options.voice || 'troy',
          speed: options.rate || 1.0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.audio) {
          console.log('[Hybrid TTS] Groq TTS successful, provider:', data.provider);
          // Convert base64 to ArrayBuffer
          const binaryString = atob(data.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await this.playAudio(bytes.buffer, options, data.contentType || 'audio/wav');
          return;
        }
      }
      
      console.warn('[Hybrid TTS] API TTS failed, trying Edge TTS');
    } catch (error) {
      console.warn('[Hybrid TTS] API TTS error, trying Edge TTS:', error);
    }

    // Try Edge TTS
    if (edgeTTS.isAvailable()) {
      try {
        await edgeTTS.speak({
          text: options.text,
          voice: options.voice,
          rate: options.rate,
          pitch: options.pitch,
          volume: options.volume,
          onStart: () => {}, // Already called
          onEnd: options.onEnd,
          onError: async (error) => {
            // Fallback to browser TTS
            await this.useBrowserTTS(options);
          },
        });
        return;
      } catch (error) {
        console.warn('[Hybrid TTS] Edge TTS failed, using browser TTS:', error);
      }
    }

    // Final fallback: Browser TTS
    await this.useBrowserTTS(options);
  }

  /**
   * Play audio from ArrayBuffer — single-play guaranteed.
   * Never calls load() explicitly (setting src is sufficient and avoids
   * the double-ended event that some browsers fire when load() is called
   * after src is already set).
   */
  private async playAudio(audioData: ArrayBuffer, options: HybridTTSOptions, contentType: string = 'audio/wav'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Tear down any previous element completely before creating a new one
        this._destroyAudioElement();

        const blob = new Blob([audioData], { type: contentType });
        const url = URL.createObjectURL(blob);

        const el = new Audio();
        el.preload = 'auto';
        el.volume = options.volume ?? 1.0;
        this.audioElement = el;

        // Track whether the terminal callback has already fired so it can
        // never be called twice (guards against browsers that fire onended
        // more than once, or both onended and the play-promise rejection).
        let settled = false;
        const finish = (err?: unknown) => {
          if (settled) return;
          settled = true;
          URL.revokeObjectURL(url);
          this._destroyAudioElement();
          if (err) {
            this.useBrowserTTS(options).then(resolve).catch(reject);
          } else {
            options.onEnd?.();
            resolve();
          }
        };

        el.onended = () => finish();

        el.onerror = (event) => {
          console.error('[Hybrid TTS] Audio playback error:', event);
          finish(event);
        };

        // Set src — browser starts buffering automatically; no need for load()
        el.src = url;

        // Play and handle the promise (autoplay policy rejections, etc.)
        el.play().catch((err) => {
          console.error('[Hybrid TTS] play() rejected:', err);
          finish(err);
        });
      } catch (error) {
        console.error('[Hybrid TTS] Setup error:', error);
        reject(error);
      }
    });
  }

  /** Fully detach and null out the current audio element. */
  private _destroyAudioElement(): void {
    if (!this.audioElement) return;
    try {
      this.audioElement.pause();
      this.audioElement.onended = null;
      this.audioElement.onerror = null;
      this.audioElement.src = '';
      // Calling load() after clearing src releases the media resource
      this.audioElement.load();
    } catch {
      // ignore — element may already be in a bad state
    }
    this.audioElement = null;
  }

  /**
   * Use browser's Web Speech API
   */
  private async useBrowserTTS(options: HybridTTSOptions): Promise<void> {
    if (!browserTTS.isAvailable()) {
      const error = 'TTS not available';
      options.onError?.(error);
      return;
    }

    browserTTS.speak({
      text: options.text,
      voice: options.voice,
      rate: options.rate,
      pitch: options.pitch,
      volume: options.volume,
      onStart: () => {}, // Already called
      onEnd: options.onEnd,
      onError: options.onError,
    });
  }

  /**
   * Cancel ongoing speech
   */
  cancel(): void {
    this._destroyAudioElement();
    edgeTTS.cancel();
    browserTTS.cancel();
  }

  /**
   * Check if speech is currently playing
   */
  isSpeaking(): boolean {
    return !!this.audioElement || edgeTTS.isSpeaking() || browserTTS.isSpeaking();
  }

  /**
   * Get available voices from all systems
   */
  getVoices(): Array<{id: string; name: string; source: 'groq' | 'elevenlabs' | 'edge' | 'browser'}> {
    const voices: Array<{id: string; name: string; source: 'groq' | 'elevenlabs' | 'edge' | 'browser'}> = [];

    // Add Groq Orpheus voices
    voices.push(
      { id: 'troy', name: 'Troy (Groq Orpheus)', source: 'groq' },
      { id: 'diana', name: 'Diana (Groq Orpheus)', source: 'groq' },
      { id: 'hannah', name: 'Hannah (Groq Orpheus)', source: 'groq' },
      { id: 'autumn', name: 'Autumn (Groq Orpheus)', source: 'groq' },
      { id: 'austin', name: 'Austin (Groq Orpheus)', source: 'groq' },
      { id: 'daniel', name: 'Daniel (Groq Orpheus)', source: 'groq' }
    );

    // Add Edge TTS voices
    if (edgeTTS.isAvailable()) {
      const edgeVoices = edgeTTS.getVoices();
      voices.push(...edgeVoices.map(v => ({ ...v, source: 'edge' as const })));
    }

    // Add Browser voices
    if (browserTTS.isAvailable()) {
      const browserVoices = browserTTS.getVoices();
      voices.push(...browserVoices.map((v: SpeechSynthesisVoice) => ({ 
        id: v.name, 
        name: `${v.name} (Browser)`, 
        source: 'browser' as const 
      })));
    }

    return voices;
  }
}

// Export singleton instance
export const hybridTTS = new HybridTTS();

const API_BASE_URL = '/api';

interface TTSResponse {
  audioContent: string;
  contentType: string;
}

interface TTSOptions {
  voiceName?: string;
  languageCode?: string;
}

class TTSService {
  private audioElement: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor() {
    // Create reusable audio element
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.setupAudioEventListeners();
    }
  }

  private setupAudioEventListeners(): void {
    if (!this.audioElement) return;

    this.audioElement.onplay = () => {
      console.log('TTS audio started playing');
      this.onStartCallback?.();
    };

    this.audioElement.onended = () => {
      console.log('TTS audio ended');
      this.cleanup();
      this.onEndCallback?.();
    };

    this.audioElement.onerror = (e) => {
      console.error('TTS audio error:', e);
      this.cleanup();
      this.onErrorCallback?.(new Error('Audio playback failed'));
    };
  }

  private cleanup(): void {
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text) {
      console.log('TTS: No text to speak');
      return;
    }

    try {
      console.log('TTS: Requesting audio for:', text.substring(0, 50) + '...');

      // Call backend TTS API
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceName: options.voiceName,
          languageCode: options.languageCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: TTSResponse = await response.json();

      // Convert base64 to blob
      const audioBlob = this.base64ToBlob(data.audioContent, data.contentType);

      // Create object URL and play
      this.cleanup();
      this.currentAudioUrl = URL.createObjectURL(audioBlob);

      if (this.audioElement) {
        this.audioElement.src = this.currentAudioUrl;
        await this.audioElement.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
  }

  cancel(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.cleanup();
  }

  get isSpeaking(): boolean {
    return this.audioElement ? !this.audioElement.paused : false;
  }

  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }
}

// Export singleton instance
export const ttsService = new TTSService();
export default ttsService;
